# src/ — Game Source Code

## Purpose
All game logic lives here. Code is organized by responsibility.

## Directory Layout
| Folder      | Description |
|-------------|-------------|
| `assets/`   | Procedural texture generators (`AssetTextures.js`), hero spritesheet builder (`SparkySprite.js`), hoodlum enemy sprite builder (`HoodlumSprite.js` from `hoodlum.png`), character art (`SparkyJoe_clean.png` for menu), and worker sprite (`WorkerSprite.js`). |
| `audio/`    | Web Audio API chiptune synthesizer (`ProceduralMusic.js`) — menu, level, and victory tracks. |
| `scenes/`   | Phaser Scenes — each manages a distinct phase of the game (boot, preload, menu, gameplay, UI overlay). |
| `entities/` | Game objects with behavior — the player, generators, terminals, extension cord, spikes. |
| `puzzles/`  | Reusable puzzle mechanism classes (doors, elevators, drawbridges, push-blocks). All use options-object constructors for easy parameterization. |
| `levels/`   | Declarative level data files (count varies). Each exports a data object describing platforms, entities, and puzzle elements. `LevelRegistry.js` provides lookup helpers. |
| `systems/`  | Cross-cutting systems: `GeneratorSystem.js` (generator management), `TriggerZone.js` (auto-activation zones), `ConnectionSystem.js`, `PuzzleManager.js`. |
| `utils/`    | Pure helper functions: `math.js` (clamp, lerp), `debug.js` (debug overlays). |

## Key Files
| File        | Description |
|-------------|-------------|
| `main.js`   | Entry point. Creates the `Phaser.Game` instance with the game config. Physics debug is OFF for release. |
| `config.js` | Central constants & tuning values (canvas size, gravity, player stats, puzzle element defaults, scene keys, level layout). |

## Conventions
- ES Module syntax (`import` / `export`).
- One class per file; filename matches class name.
- Phaser lifecycle methods: `preload()`, `create()`, `update(time, delta)`.
- Puzzle elements implement `activate()` / `deactivate()` interface.
- Puzzle elements use **options object constructors** for easy dimension/position/behavior tuning.
- Most textures are generated procedurally in `PreloadScene`. The menu screen loads `SparkyJoe_clean.png` as an external character image.
- Use values from `config.js` instead of inline magic numbers.
- Physics: Arcade mode with gravity = 900. Platforms use `staticGroup`. Puzzle elements use static bodies + tweens.
