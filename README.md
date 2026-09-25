# ♟️ ZugZwang

> **Don't just count blunders—diagnose them.**

Most chess analysis tools tell you *that* you made a mistake. **ZugZwang** is a TypeScript diagnostic pipeline that parses your Chess.com game archives, runs Stockfish evaluations, and classifies the **root cause** behind your dropped rating points:

- ⏱️ **Time Management Leaks:** Detects time scrambles (<20s) and impulsive blitz moves (<2s in complex positions).
- 📖 **Opening Preparation Gaps:** Flags early departures from book lines that collapse before move 10.
- 🎯 **Tactical Blind Spots:** Identifies undefended hanging pieces and unprovoked material drops.
- ♟️ **Endgame Conversions:** Isolates technical breakdowns when piece counts drop.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

zugzwang/
├── app/
│   ├── api/
│   │   └── games/route.ts      # Fetch & stream Lichess/Chess.com archives
│   ├── dashboard/page.tsx      # Charts & blunder autopsy breakdown
│   ├── page.tsx                # Hero / username input
│   └── layout.tsx
├── components/
│   ├── ChessBoard.tsx          # Interactive review board
│   ├── MetricCards.tsx         # Blunder counts by phase
│   └── TimeVsEvalChart.tsx     # Recharts scatter/line plot
├── lib/
│   ├── chess/
│   │   ├── engine.ts           # Stockfish worker bridge
│   │   ├── pgn.ts              # Clock & SAN parser
│   │   └── diagnostician.ts    # Heuristic root-cause rules
│   └── types.ts                # Core interfaces
└── public/
    └── stockfish/              # WASM & worker engine files