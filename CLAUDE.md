# CLAUDE.md — Dark Grid (codename: Tactigon)

This file was created by the project owner to guide Claude Code when working in this repository.

## Project Overview

**Dark Grid** is a local browser-based 1v1 (hotseat) turn-based strategy game.
- 4 factions, 7×8 grid, 12 pieces per player
- Goal: capture the enemy king
- Tech stack: React 18 + TypeScript + Vite, no backend

## Repository Structure

```
src/
  game/          # Pure game logic (no React)
    types.ts         — All TypeScript interfaces
    orientation.ts   — Rotation math (local→board frame)
    legalMoves.ts    — Move generation
    applyMove.ts     — State transition + win check
    setupBoard.ts    — Initial board setup
    __tests__/       — Vitest unit tests
  data/          # Static data
    factions.ts      — 4 faction definitions + movement patterns
    board7x8.ts      — 1v1 board layout
    board13x13.ts    — 4-player board (future)
    startTemplate.ts — Starting piece arrangement
  screens/       # Route-level React components
    Splash, MainMenu, Factions, ModeSelect, RankedSelect, ClanSelect, Game
  components/    # Reusable UI
    Board, Cell, Piece
  App.tsx        # Router
  main.tsx       # Entry point
```

## Commands

```bash
npm run dev       # Dev server on port 5173
npm run build     # Production build
npm test          # Run unit tests (vitest run)
npm run test:watch # Watch mode
```

## Game Engine Rules

- **Movement patterns** are defined in player-local frame (dy < 0 = forward).
- `applyRotation()` converts local offsets to board coordinates.
- Intermediates: `blocking` = occupied cell stops the move; `flyover` = can jump over pieces but NOT walls.
- Win condition: capture the enemy king.
- No draws implemented in V1.

## Factions

1. Équipe 1 — Les Éclaireurs (red `#e63946`)
2. Équipe 2 — Les Sentinelles (blue `#457b9d`)
3. Équipe 3 — Les Ombres (green `#2d6a4f`)
4. Équipe 4 — Les Forgeurs (gold `#e9c46a`)

All kings have the same 8-direction 1-step pattern. Pawns all move diagonally forward. Inter1–3 differ per faction.

## Design System

Dark aesthetic: background `#0d0d0f`, text `#e8e0d0`, accent `#8a6a40`.
CSS Modules per component. No Tailwind — plain CSS.
