# Zugzwang

A local analysis app that reads one Chess.com archive and shows repeating mistakes across those games.

It fetches public games for a single configured username, evaluates the owner's moves with Stockfish on this machine, and keeps the games and results locally. Insights are computed from that stored set, so a full archive can be reviewed without re-running the engine.

Full requirements: [docs/SRS.md](docs/SRS.md) (version 0.2).

## What it shows

Patterns are always computed from the active filter.

- **Phase:** mistake and blunder rates in the opening, middlegame, and endgame.
- **Piece losses:** piece types most often dropped on a mistake or blunder.
- **Piece reliance:** a piece type, including the queen, used for at least 40% of middlegame moves in at least 30% of the filtered games.
- **Time trouble:** losses on time, and games where the clock falls below 10% of the start while the opponent still has at least 30%.
- **Color:** win, loss, draw, and mistake rate as white and as black.
- **Openings:** record by Chess.com opening name, or ECO code when no name is present. Groups with fewer than five games are omitted.

A **mistake** is an owner move that drops the evaluation by 100–299 centipawns. A **blunder** drops it by 300 centipawns or more.

## Filters

Time class (bullet, blitz, rapid, daily), color, result, opening, and the owner's rating in that game. Filters combine by intersection and apply to both Insights and the game list.

## Screens

| Screen | Purpose |
| --- | --- |
| Setup | Save the Chess.com username. Replacing it starts a new archive. |
| Sync and analysis | Fetch and engine progress, as games finished out of games to process. A stopped run continues from what is already saved. |
| Insights | Pattern highlights for the current filter. Home once games exist. |
| Pattern detail | The games that produced one pattern. |
| Games | Stored games, with the same filters. |

Layouts are meant to stay usable from a 320px-wide phone through a desktop window.

## Scope of this release

Zugzwang runs on this machine. Games come from the [Chess.com Published Data API](https://www.chess.com/news/view/published-data-api) over HTTPS, with no Chess.com login. Requests identify the app with a User-Agent that names Zugzwang and a contact. One username is active at a time. There is no account system, and the local store is not exposed to other people.

Playing, puzzles, in-game coaching, opponent scouting, and any site other than Chess.com are outside this release.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

The app is a Next.js shell. Product behavior is specified in the SRS and is not implemented yet.
