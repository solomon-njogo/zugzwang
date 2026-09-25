# Software Requirements Specification

| Field | Value |
| --- | --- |
| Project | Zugzwang |
| Document title | Software Requirements Specification |
| Version | 0.2 |
| Status | Draft |
| Author | Solomon |
| Date | 25-09-2026 |
| Approvers | Solomon |

Requirement IDs use `FR-` for functional requirements and `NFR-` for non-functional requirements. Keep IDs stable after they are assigned; do not reuse a retired ID.

## Revision history

| Version | Date | Author | Description |
| --- | --- | --- | --- |
| 0.1 | 25-09-2026 | Solomon | Initial draft |
| 0.2 | 25-09-2026 | Solomon | Filled requirements from product decisions |

## 1. Introduction

### 1.1 Purpose

This document specifies the software requirements for **Zugzwang**. It is the agreement between me and the demons of scope creep about what the system must do.

Intended reader: Solomon, as the only user and the person building the system.

### 1.2 Scope

**Product name:** Zugzwang

**Summary:** An analysis engine that notices patterns across all past Chess.com games and highlights places to improve.

**In scope:**

- Fetch all past Chess.com games for one configured username through the Chess.com Published Data API
- Store those games and the patterns derived from them on the local machine
- Analyze games with a local Stockfish engine
- Filter the stored set by time control, color, result, opening, and rating
- Highlight repeating patterns in the filtered set: mistakes by phase, piece losses, piece reliance, time trouble, white versus black, and openings

**Out of scope:**

- Lichess and any site other than Chess.com
- Playing games or solving puzzles inside Zugzwang
- Move-by-move coaching during a game
- Scouting a specific opponent
- Accounts, login, sharing, or more than one user

**Goals:**

- The owner can see mistakes that are invisible in a single game by reviewing patterns across the full archive.

### 1.3 Definitions, acronyms, and abbreviations

| Term | Meaning |
| --- | --- |
| SRS | Software Requirements Specification |
| FR | Functional requirement |
| NFR | Non-functional requirement |
| Owner | Solomon, the only user of this release |
| PGN | Portable Game Notation, the standard text record of a chess game |
| ECO | Encyclopaedia of Chess Openings code |
| cp | Centipawn, one hundredth of a pawn. Used for engine evaluation changes |
| Mistake | An owner move that drops the evaluation by 100–299 cp |
| Blunder | An owner move that drops the evaluation by 300 cp or more |
| Time class | Chess.com category for a game: bullet, blitz, rapid, or daily |
| Opening | The opening name supplied by Chess.com, or the ECO code when no name is present |
| Phase | Opening, middlegame, or endgame, using the rules in section 3.3 |

### 1.4 References

| ID | Document | Location |
| --- | --- | --- |
| REF-1 | Chess.com Published Data API | https://www.chess.com/news/view/published-data-api |

### 1.5 Overview

The rest of this document describes the product context (section 2), the specific requirements (section 3), and supporting material (section 4).

## 2. Overall description

### 2.1 Product perspective

Zugzwang is a new local tool. It is a Next.js application run on the owner's machine. It reads public games from Chess.com, analyzes them with Stockfish on that machine, and keeps the games and results locally. It does not replace Chess.com and it does not host accounts for other people.

```text
Owner --> Zugzwang (local Next.js)
              |--> Chess.com Published Data API
              |--> Stockfish (local)
              |--> Local store (games and patterns)
```

### 2.2 Product functions

High-level capabilities. Detail belongs in section 3.2.

| ID | Function | Description |
| --- | --- | --- |
| PF-1 | Import archive | Fetch and store every available past game for the configured Chess.com username |
| PF-2 | Engine analysis | Evaluate the owner's moves with local Stockfish and keep the results |
| PF-3 | Pattern insights | Show repeating losses, reliance, phase mistakes, time trouble, color splits, and opening results |
| PF-4 | Filter the set | Narrow games by time control, color, result, opening, and rating, then refresh the insights |
| PF-5 | Drill in | Open a pattern and see the games that produced it |

### 2.3 User classes and characteristics

| User class | Description | Technical level | Frequency of use |
| --- | --- | --- | --- |
| Owner | Solomon. Reviews his own Chess.com games to find repeating mistakes. Configures the username, starts import and analysis, and reads the insights. | Medium. Runs the app locally. | After playing sessions, or whenever the archive should be reviewed |

There is no separate administrator and no second user in this release.

### 2.4 Operating environment

| Area | Requirement |
| --- | --- |
| Client | A current desktop or mobile browser. Layouts must work from a 320px-wide phone through a desktop window. |
| Server | Next.js on the owner's machine (localhost). No public hosting in this release. |
| Dependencies | Chess.com Published Data API (public games, no Chess.com login), local Stockfish, and a local store for games and derived patterns. |

### 2.5 Design and implementation constraints

- The application is a Next.js web app.
- This release runs on the owner's machine only.
- Games come from the Chess.com public API. Zugzwang does not ask the owner to log in to Chess.com.
- Requests to Chess.com must identify the application with a User-Agent that names Zugzwang and a contact, as required by the Published Data API.
- One Chess.com username is configured at a time.

### 2.6 Assumptions and dependencies

**Assumptions**

- The configured Chess.com account exposes its games to the public API.
- Archive responses include the PGN, time class, result, the owner's color and rating, and an opening name or ECO code.
- Live games may include clock comments and a timeout termination. Some daily games will not include clock comments. Zugzwang must not invent missing clock data.
- Centipawn thresholds in section 1.3 are the working definition of a mistake and a blunder. They can be tuned later without changing the requirement IDs.
- A full-archive engine run can take a long time. The owner will leave it running, and the app must be able to continue after a restart.

**Dependencies**

- Chess.com Published Data API availability and response shape.
- A local Stockfish build that can evaluate positions from the stored PGNs.
- Enough local disk for the full archive and the saved evaluations.

## 3. Specific requirements

### 3.1 External interface requirements

#### 3.1.1 User interfaces

| Screen / flow | Purpose | Notes |
| --- | --- | --- |
| Setup | Save the single Chess.com username | Shown until a username is saved. Replacing it starts a new archive. |
| Sync and analysis | Show fetch progress and engine progress | Progress is games completed out of games to process. The owner can leave and return. |
| Insights | Show pattern highlights for the current filter | This is the home screen once games exist. |
| Pattern detail | Explain one pattern and list the games that support it | Reached from an insight. |
| Games | List stored games and apply filters | Filters also drive the Insights screen. |

Every screen must remain usable on phone, tablet, and desktop widths.

#### 3.1.2 Hardware interfaces

None.

#### 3.1.3 Software interfaces

| System | Direction | Data exchanged | Protocol |
| --- | --- | --- | --- |
| Chess.com Published Data API | In | Archive month list, then games (PGN, players, ratings, result, time class, opening, URL, end time) | HTTPS GET, no Chess.com credentials |
| Stockfish | Local call | Position in, evaluation and best line out | Local engine API |
| Local store | Both | Games, per-move evaluations, and derived pattern results | On-machine persistence |

#### 3.1.4 Communications interfaces

- Outbound traffic is HTTPS to Chess.com only.
- Zugzwang has no login and no account system.
- The local store is not exposed as a networked service for other people.

### 3.2 Functional requirements

Priority: **Must** (release blocker), **Should** (important, can slip), **Could** (nice to have).

| ID | Priority | Requirement | Acceptance criteria |
| --- | --- | --- | --- |
| FR-001 | Must | The system shall fetch all publicly available past games for one configured Chess.com username from the Published Data API. | Given a username with at least one archive month, when the owner starts a sync, then every game returned by those monthly archives is stored. |
| FR-002 | Must | The system shall persist each fetched game and the pattern results derived from it on the local machine. | Given a completed sync, when the app is restarted, then the same games and saved pattern results are still available without a refetch. |
| FR-003 | Must | The system shall evaluate the owner's moves in each stored game with local Stockfish and persist those evaluations. | Given a stored game, when analysis finishes, then each owner move has a stored centipawn drop and a mistake, blunder, or neither label using section 1.3. |
| FR-004 | Must | The system shall resume an interrupted fetch or analysis without repeating work already saved. | Given a sync or analysis stopped halfway, when it is started again, then completed games are skipped and the run continues with the remainder. |
| FR-005 | Must | The system shall classify each owner move by phase and report mistake and blunder rates for the opening, middlegame, and endgame. | Given analyzed games, when Insights is open, then each phase shows how many owner moves were mistakes or blunders. |
| FR-006 | Must | The system shall highlight the piece types the owner most often loses to a mistake or blunder. | Given analyzed games in which a bishop was hung by a mistake, when Insights is open, then the bishop appears as a piece-loss pattern with a game count. |
| FR-007 | Must | The system shall highlight over-reliance on one piece type, including the queen, using the reliance rule in section 3.3. | Given a filtered set where queen moves dominate the middlegame under that rule, when Insights is open, then queen reliance is shown with the supporting games. |
| FR-008 | Must | The system shall report games the owner lost on time, and games where the owner was in time trouble when clock comments exist. | Given a game whose termination is a timeout by the owner, when Insights is open, then that game counts as a time-trouble pattern. Games without clock data are not labeled as time trouble unless the termination says so. |
| FR-009 | Must | The system shall compare results and mistake rates for games played as white and as black. | Given games of both colors, when Insights is open, then win, loss, draw, and mistake rate are shown separately for each color. |
| FR-010 | Must | The system shall group games by opening and show the owner's record in each opening that meets the minimum sample. | Given at least five games in one opening, when Insights is open, then that opening shows wins, losses, and draws. Openings with fewer than five games in the filtered set are omitted. |
| FR-011 | Must | The system shall filter games by time control, color, result, opening, and the owner's rating in that game, and shall compute the visible patterns from the filtered set only. | Given stored games of more than one time class, when the owner selects blitz and losses, then Insights and the game list include only blitz losses. Clearing the filters restores the full stored set. |
| FR-012 | Must | The system shall list the games that support a selected pattern. | Given a piece-loss insight, when the owner opens it, then each listed game is one that contributed to that count, and no unrelated game is listed. |
| FR-013 | Should | The system shall show fetch and analysis progress as a count of games finished out of games remaining. | Given a running analysis, when the owner views Sync, then the completed and total counts are visible and increase as games finish. |
| FR-014 | Could | The system shall let the owner replace the configured username and build a new local archive for that username. | Given a saved archive, when the owner saves a different username, then the previous username's games are no longer the active set. |

#### Use cases

**UC-1: Import the archive**

- **Actor:** Owner
- **Preconditions:** Zugzwang is running locally. A Chess.com username is saved. That account's games are public.
- **Main flow:**
  1. The owner starts a sync.
  2. The system reads the monthly archive list, then each month's games.
  3. New games are stored. Games already stored are left as they are.
  4. The Sync screen shows how many games are saved.
- **Alternate flows:** If Chess.com is unreachable, the sync stops with an error and keeps games already stored. A later sync continues from what is missing.
- **Postconditions:** The local store holds the public archive for that username.
- **Related requirements:** FR-001, FR-002, FR-004, FR-013

**UC-2: Analyze games**

- **Actor:** Owner
- **Preconditions:** At least one game is stored. Stockfish is available locally.
- **Main flow:**
  1. The owner starts analysis, or it continues automatically after import.
  2. Stockfish evaluates the owner's moves.
  3. Evaluations and pattern labels are saved per game.
  4. Progress shows games finished out of games stored.
- **Alternate flows:** If the app stops mid-run, the next start skips games that already have saved evaluations.
- **Postconditions:** Analyzed games can supply Insights without another engine run.
- **Related requirements:** FR-003, FR-004, FR-013

**UC-3: Read a pattern**

- **Actor:** Owner
- **Preconditions:** At least one game has been analyzed.
- **Main flow:**
  1. The owner opens Insights.
  2. The system shows phase mistakes, piece losses, piece reliance, time trouble, color split, and opening records for the current filter.
  3. The owner opens one pattern.
  4. The system lists the games that produced it.
- **Alternate flows:** If the filter matches no games, Insights says the set is empty and does not show stale patterns from the unfiltered archive.
- **Postconditions:** The owner can name a repeating mistake and the games behind it.
- **Related requirements:** FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-012

**UC-4: Filter the archive**

- **Actor:** Owner
- **Preconditions:** Games are stored.
- **Main flow:**
  1. The owner sets one or more of: time control, color, result, opening, rating range.
  2. The game list and Insights both update to that subset.
  3. The owner clears the filters.
  4. The full stored set is shown again.
- **Alternate flows:** An opening with fewer than five games in the subset is hidden from the opening insight and remains available as a filter value if it exists in the stored games.
- **Postconditions:** Patterns describe only the games inside the active filter.
- **Related requirements:** FR-010, FR-011

### 3.3 Data requirements

| Entity | Key fields | Rules |
| --- | --- | --- |
| Settings | Chess.com username | Exactly one active username. Required before sync. |
| Game | Chess.com URL or game id, PGN, end time, time class, time control, opening name, ECO, owner's color, owner's rating, opponent rating, result from the owner's side, termination | Unique per Chess.com game. Retained locally until the username is replaced or the owner deletes the local store. |
| Move evaluation | Game id, ply, phase, centipawn drop, label (none, mistake, blunder) | One row per owner move in an analyzed game. Recomputed only if that game's analysis is missing or explicitly rerun. |
| Pattern result | Pattern type, piece type or opening or color or phase, game count, supporting game ids, filter key | Derived from the active filter. A stored copy may be kept so Insights opens without a new engine run. Rebuilt when analysis or the filter changes. |

**Phase rules**

- Opening: plies 1–20 (moves 1–10), or the whole game if it ends sooner.
- Endgame: both sides have no queen, or both sides have non-pawn material of 10 or less. Values: queen 9, rook 5, bishop 3, knight 3.
- Middlegame: every other position. A position that matches both opening and endgame is an endgame.

**Piece-loss rule**

Count a lost piece when the owner's move is a mistake or blunder and the following opponent move captures that piece, or the owner's move otherwise drops that piece type while the evaluation falls by at least the mistake threshold. A loss that is not a mistake or blunder is a sacrifice and is not counted. Insights ranks piece types by how many games contain at least one such loss.

**Piece-reliance rule**

In the middlegame, ignore pawn moves and castling. If one piece type is at least 40% of the owner's remaining moves in that game, the game counts as reliance on that piece. Insights highlights a piece type when it is the reliance piece in at least 30% of games in the filtered set. The queen is covered by this rule; it is not a separate detector.

**Time-trouble rule**

- Always count a game whose termination says the owner lost on time.
- When PGN clock comments exist, also count a game where the owner's clock falls below 10% of the starting time while the opponent still has at least 30%.
- Do not mark time trouble from missing clock data.

**Opening rule**

Group by Chess.com opening name, otherwise by ECO code. Show wins, losses, and draws. Omit groups with fewer than five games in the filtered set.

**Filter rule**

Filters combine by intersection. Time class values are bullet, blitz, rapid, and daily. Result is win, loss, or draw for the owner. Rating uses the owner's rating on that game as a minimum and maximum. The game list is ordered by most recently ended first. Date is not a separate filter in this release.

### 3.4 Non-functional requirements

| ID | Category | Requirement | Measure |
| --- | --- | --- | --- |
| NFR-001 | Performance | After patterns are stored, Insights and the game list shall render from local data without starting a new engine run. A first full-archive analysis may take a long time and shall not block the rest of the UI. | Opening Insights with saved results does not launch Stockfish. Sync and analysis screens stay responsive while work continues. |
| NFR-002 | Availability | A restart of the local app shall not discard a finished sync or finished analysis. Interrupted work shall be continuable. | Restart, then confirm stored games and completed evaluations are still present, and the next run skips them. |
| NFR-003 | Security | The system shall not require a Zugzwang account. Chess.com credentials shall not be collected. Traffic to Chess.com shall use HTTPS. | No login screen exists. No Chess.com password is stored. API calls use HTTPS. |
| NFR-004 | Privacy | The system shall store only the configured player's public Chess.com games, evaluations, and pattern results, and shall keep them on the local machine. | Data is not sent to a service other than the Chess.com public API. The store path is on the owner's machine. |
| NFR-005 | Usability | The owner shall be able to see the main repeating patterns without reading raw PGNs. | From Insights, each pattern names what repeats and how many games support it in one view. |
| NFR-006 | Accessibility | Primary flows shall be usable by keyboard and shall keep text contrast readable on phone and desktop. | Setup, filters, insight list, and pattern detail can be completed without a pointer. Text meets a practical contrast check on those screens. |
| NFR-007 | Compatibility | The system shall work in current Chrome, Edge, Firefox, and Safari, from a 320px width upward. | Those browsers can complete UC-1 through UC-4 at phone and desktop widths. |
| NFR-008 | Maintainability | Pattern thresholds (centipawn cuts, reliance percent, opening minimum) shall live in one place so a later tune does not require hunting through the UI. | Changing a threshold in that definition changes new analysis without editing screen code. |

## 4. Verification

| Requirement IDs | Verification method | Notes |
| --- | --- | --- |
| FR-001, FR-004 | Test with a recorded Chess.com archive fixture, plus one live sync against the owner's username | Fixture covers partial failure and resume |
| FR-002, NFR-002, NFR-004 | Restart the app and inspect the local store | Confirm games remain and are not uploaded elsewhere |
| FR-003, FR-005 | Analysis test on a short known PGN | Phase labels and centipawn cuts match section 1.3 and section 3.3 |
| FR-006, FR-007, FR-008, FR-012 | Fixture games built to contain one bishop hang, one queen-reliant middlegame, and one timeout | Each insight lists only its supporting games |
| FR-009, FR-010, FR-011 | Fixture set with both colors, two openings, and two time classes | Filter to one subset and check counts |
| FR-013, NFR-001 | Demo during a multi-game analysis | Progress counts update, and Insights does not wait on Stockfish when results exist |
| FR-014 | Demo | Save a second username and confirm the active set changes |
| NFR-003 | Inspection | No Zugzwang login and no stored Chess.com password |
| NFR-005, NFR-006, NFR-007 | Demo on a narrow phone width and a desktop width | Insights readable; main actions reachable by keyboard |

## 5. Open issues

| ID | Issue | Owner | Target date |
| --- | --- | --- | --- |
| OI-1 | Centipawn cuts (100 / 300), the 40% reliance cutoff, and the five-game opening minimum are working defaults. Tune them after the first real archive if the highlights are too noisy or too quiet. | Solomon | After the first full import |
| OI-2 | Stockfish depth is not fixed here. Pick a depth that finishes a full archive in an acceptable local runtime without making mistake labels unstable. | Solomon | Before the first full analysis |

## 6. Appendix

### Traceability

| Requirement | Use case | Test |
| --- | --- | --- |
| FR-001, FR-002, FR-004 | UC-1 | Archive fixture and resume |
| FR-003, FR-004 | UC-2 | Known-PGN engine labels |
| FR-005 through FR-010, FR-012 | UC-3 | Pattern fixtures |
| FR-011 | UC-4 | Filter subset counts |
| FR-013 | UC-1, UC-2 | Progress demo |
| FR-014 | UC-1 | Username replacement demo |

### Approval

| Role | Name | Date | Signature |
| --- | --- | --- | --- |
| Product | Solomon | 25-09-2026 | |
| Engineering | Solomon | 25-09-2026 | |
