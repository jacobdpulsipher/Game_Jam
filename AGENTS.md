# Everything Is Connected — Game Jam Project

## Overview
This is a **2D puzzle-platformer** built with **Phaser 3** for a game jam. The jam theme is **"Everything is connected"**.

## Game Concept
The player navigates through a series of interconnected puzzle rooms in a 2D side-scrolling platformer. Puzzles are built from reusable mechanical elements — sliding doors, elevators, drawbridges, and pushable blocks — that the player must manipulate to progress. The "everything is connected" theme manifests through puzzle mechanics where activating one element affects others in linked chains.

## Tech Stack
- **Engine:** Phaser 3 (v3.80+)
- **Language:** JavaScript (ES Modules)
- **Build:** Vite
- **Art Pipeline:** All textures procedurally generated at runtime (no external image files)
- **Audio:** Web Audio API chiptune synthesizer (procedural, no external audio files)

## Project Structure
```
├── src/              # Game source code
│   ├── assets/       # Procedural texture & sprite generators
│   ├── audio/        # Web Audio chiptune music system
│   ├── scenes/       # Phaser Scenes (boot, preload, menu, game, UI)
│   ├── entities/     # Game objects (player, generator, terminal, cord, spikes)
│   ├── puzzles/      # Puzzle element classes (door, elevator, drawbridge, block)
│   ├── levels/       # Declarative level data files + registry
│   ├── systems/      # Cross-cutting systems (connections, triggers, generators)
│   └── utils/        # Pure helper functions
├── assets/           # Reserved for external assets (currently unused — all procedural)
├── design/           # Game design documents, puzzle blueprints, level plans
├── public/           # Static files served as-is by Vite
├── index.html        # Entry HTML
├── vite.config.js    # Vite build config
├── PROGRESS.md       # Detailed build progress & architecture overview
└── package.json      # Dependencies & scripts
```

## Key Conventions
- **ES Modules** throughout (`import`/`export`).
- **Phaser Scene lifecycle:** `preload()` → `create()` → `update()`.
- Puzzle elements are self-contained classes with `activate()`/`deactivate()` interface.
- Levels are **data-driven** — declarative objects in `src/levels/`, built by GameScene.
- All textures are **procedurally generated** at runtime in PreloadScene (no external images).
- Music is **procedurally synthesized** via Web Audio API (no external audio files).
- Constants and magic numbers go in `src/config.js`.
- Hero sprite is 28×48 pixels, physics tile size is 32×32.

## Running the Game
```bash
npm install
npm run dev     # Start Vite dev server with hot reload
npm run build   # Production build to dist/
npm run preview # Preview production build
```

## AI Collaboration Notes
- Each subdirectory contains an `AGENTS.md` explaining that directory's purpose and contents.
- When generating code, follow the existing patterns in nearby files.
- All puzzle elements share a common interface so they can be wired together by the ConnectionSystem.
- Refer to `design/` for game design decisions before implementing features.
