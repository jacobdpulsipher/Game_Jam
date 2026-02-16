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
| `PreloadScene` | `PreloadScene`| Generates all procedural textures (doors, elevators, crates, outlets, plugs, ground, ledges) and the electrician spritesheet. Registers idle/run/grab/jump/fall animations. No external image files. Transitions to MenuScene. |
| `MenuScene`    | `MenuScene`   | Title screen with dark city skyline backdrop. "Start Game" button + Enter/Space keyboard shortcuts. Plays menu music on first user interaction. Loads the first level via `LevelRegistry.getFirstLevel()`. |
| `GameScene`    | `GameScene`   | **Data-driven** core gameplay. Receives `{ levelId }` from scene data, loads a level definition from `LevelRegistry`, and instantiates all platforms, entities, and puzzle elements from the data object. Handles collisions, cord/block events, door propping, goal detection, and level transitions (via `data.nextLevel`). |
| `UIScene`      | `UIScene`     | HUD overlay running on top of GameScene. Displays cord connection status. |

## GameScene Details
- Receives `{ levelId }` via `scene.start()` data; falls back to `getFirstLevel()` if omitted
- `_buildLevel(data)` reads a level data object and creates all platforms, entities, and puzzle elements
- All elements are stored in `_elementsById` for terminal→element linkage
- Platforms use `physics.add.staticGroup()` with display-sized sprites
- Puzzle elements use options-object constructors (see `src/puzzles/AGENTS.md`)
- Events: `player-action` (E key), `player-interact` (F key), `door-closing-tick`, `cord-changed`
- Camera follows player with world bounds set from `data.world.width` × `data.world.height`
- On goal reached: checks `data.nextLevel` — restarts scene with next level or shows win screen
- Error display: try-catch in `create()` renders red error text on canvas

## Conventions
- Scene keys defined in `src/config.js` under `SCENES`.
- Scenes communicate via Phaser's event system.
- `debug: false` is set in `main.js` arcade config (set to `true` for development).
