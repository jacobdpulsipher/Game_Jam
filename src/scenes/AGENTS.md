# src/scenes/ — Phaser Scenes

## Purpose
Each file exports a single Phaser.Scene subclass that manages one phase of the game.

## Scene Flow
```
BootScene → PreloadScene → MenuScene → GameScene (+ UIScene overlay)
```

## Scenes
| Scene          | Key           | Role |
|----------------|---------------|------|
| `BootScene`    | `BootScene`   | Minimal setup — transitions immediately to PreloadScene. |
| `PreloadScene` | `PreloadScene`| Loads PNGs (`SparkyJoe_clean.png`, `hoodlum.png`, `mentor_small.png`) for menu/in-game use. Generates all procedural textures (doors, elevators, crates, outlets, plugs, ground, ledges, lampposts) and sprite sheets (Sparky Joe, hoodlum, mentor). Registers idle/run/grab/jump/fall animations. Transitions to MenuScene. |
| `MenuScene`    | `MenuScene`   | Title screen with dark city skyline backdrop. "Start Game" button + **Level Select** buttons for every level (click or press number keys 1–9). Enter/Space keyboard shortcuts. Plays menu music on first user interaction. |
| `GameScene`    | `GameScene`   | **Data-driven** core gameplay. Receives `{ levelId }` from scene data, loads a level definition from `LevelRegistry`, and instantiates all platforms, entities, and puzzle elements from the data object. Handles collisions, cord/block events, door propping, goal detection, and level transitions (via `data.nextLevel`). |
| `UIScene`      | `UIScene`     | HUD overlay running on top of GameScene. Currently empty — previously displayed cord-connection debug HUD. |

## GameScene Details
- Receives `{ levelId }` via `scene.start()` data; falls back to `getFirstLevel()` if omitted
- `_buildLevel(data)` reads a level data object and creates all platforms, entities, and puzzle elements
- All elements are stored in `_elementsById` for terminal→element linkage
- Platforms use `physics.add.staticGroup()` with display-sized sprites
- Puzzle elements use options-object constructors (see `src/puzzles/AGENTS.md`)
- Events: `player-action` (D key), `player-interact` (F key), `door-closing-tick`, `cord-changed`
- D key priority: (1) activate nearby secondary generator, (2) unplug cord if connected & in range, (3) plug into nearest terminal, (4) attack with plug
- Camera follows player with world bounds set from `data.world.width` × `data.world.height`
- On goal reached: checks `data.nextLevel` — restarts scene with next level or shows win screen
- Victory sequence: 3 wrench strikes → `_showVictory()` → floodlights (`_spawnFloodlights`) + building window illumination (`_illuminateWindows`) fade in over 1.5s → victory music + text overlay
- Error display: try-catch in `create()` renders red error text on canvas

## Conventions
- Scene keys defined in `src/config.js` under `SCENES`.
- Scenes communicate via Phaser's event system.
- `debug: false` is set in `main.js` arcade config (set to `true` for development).
