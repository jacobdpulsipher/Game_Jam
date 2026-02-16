# Build Progress

## Goal
Build a playable 2D puzzle-platformer for the "Everything is Connected" game jam.
Hero is an electrician who connects extension cords from generators to terminals to power puzzle elements.

## Level 1 Design — "First Steps"
- G1 (generator) on far left, hero spawns next to it
- D (slide door) blocks path, has terminal T1 — powered by G1 cord
- B (push block) — 2.5D block hero can grab/push/pull
- T2 (terminal) for elevator — also powered by G1 cord
- E (elevator) — goes up/down when powered, returns down when unpowered
- Ledge on far right with G2 (generator to fix = level goal)

## MVP Checkpoints
- [x] CP0: Original scaffold (scenes, entities, puzzles, systems, utils)
- [x] CP1: config.js updated, placeholder textures generated in PreloadScene
- [x] CP2: Player.js rewritten with cord/interact mechanics
- [x] CP3: Generator, Terminal, ExtensionCord entities created
- [x] CP4: SlideDoor + PushBlock rewritten for power + 2.5D
- [x] CP5: Elevator rewritten for power
- [x] CP6: GameScene builds Level 1 with all elements
- [x] CP7: UIScene shows cord status HUD
- [x] CP8: Full playable MVP

## Post-MVP Bug Fixes (Round 1)
- [x] Fix: Elevator crash (removed setImmovable/setAllowGravity on static body)
- [x] Fix: Floor collision (switched from add.rectangle to staticGroup)
- [x] Fix: Cord visual shows cord from generator to player when unplugged
- [x] Fix: PushBlock walk-through after release (returns to background on release)
- [x] Fix: Door propping (fixed isUnderDoor comparison using edges not centers)
- [x] Fix: Block grab only from beside (not from on top); auto-release on jump/airborne
- [x] Fix: Door resumes closing when block is moved away
- [x] Refactor: Elevator uses options object constructor, returns to startY on deactivate
- [x] Refactor: SlideDoor uses options object constructor, supports direction/range/dimensions
- [x] Docs: All AGENTS.md files updated with current behaviors and APIs

## Multi-Map System
- [x] Created `src/levels/LevelRegistry.js` — ordered level list + lookup helpers
- [x] Created `src/levels/Level01.js` — extracted Level 1 layout data from hardcoded GameScene
- [x] Refactored `GameScene.js` — fully data-driven, reads level data from LevelRegistry
- [x] Updated `MenuScene.js` — passes `{ levelId }` from `getFirstLevel()` when starting game
- [x] Created `design/map-design-rules.md` — physics reference, cord rules, ASCII maps, puzzle patterns

## Level 2 — "Bridge the Gap"
- [x] Added `DRAWBRIDGE` and `SPIKES` constants to config.js
- [x] Created `src/puzzles/Drawbridge.js` — angular rotation via tween, separate static bridgeBody
- [x] Created `src/entities/Spikes.js` — hazard zone, neutralisable by push block
- [x] Refactored `src/puzzles/PushBlock.js` — dynamic body with gravity, auto-release on fall
- [x] Updated `src/entities/Player.js` — added `die()` / `_respawn()` for spike death
- [x] Updated `GameScene.js` — supports drawbridges, spikes, block-covers-spikes
- [x] Created `src/levels/Level02.js` — drawbridge over spike pit, steps, elevator, goal

## Art & Audio Integration
- [x] Created `src/assets/AssetTextures.js` — procedural texture generators for doors, elevators, drawbridges, crates, outlets, plugs
- [x] Created `src/assets/ElectricianSprite.js` — 14-frame procedural hero spritesheet (28×48, idle/run/grab/jump/fall)
- [x] Wired art textures into all entity constructors (SlideDoor, Elevator, Drawbridge, PushBlock, Terminal, ExtensionCord)
- [x] Created dark city backdrop with parallax skyline in `GameScene._drawCityBackdrop()`
- [x] Created `src/audio/ProceduralMusic.js` — Web Audio API chiptune synth (menu/level/victory tracks)
- [x] Wired music into MenuScene (playMenu on interaction) and GameScene (playLevel, playVictory)

## Levels 3 & 4
- [x] Created `src/levels/Level03.js` — "Power Cascade" (medium difficulty, trigger zones, cascading activations)
- [x] Created `src/levels/Level04.js` — "Tower Descent" (hard, tall vertical level, multiple routes, chained elevators)
- [x] Updated `LevelRegistry.js` to include all 4 levels with proper chaining
- [x] Created `src/systems/TriggerZone.js` — invisible zones that auto-activate elements on player overlap
- [x] Created `src/systems/GeneratorSystem.js` — manages generators, element registration, auto-activation

## Bug Fixes (Round 2 — Runtime Issues)
- [x] Fix: Black screen — `TriggerZone` extended non-existent `Phaser.Physics.Arcade.Zone` → changed to `Phaser.GameObjects.Zone`
- [x] Fix: Black screen — `ElectricianSprite` used non-existent static `Phaser.Animations.generateFrameNumbers()` → manual frame registration with `tex.add()`
- [x] Fix: Slow performance — `debug: true` in physics config rendering all bodies → set to `false`
- [x] Fix: Crate texture mismatch — isometric 3D crate drew beyond canvas bounds → rewrote as flat 2D wooden crate matching exact physics size
- [x] Fix: Player falls through elevator — static body moved by tween doesn't carry riders → added `_deltaY` tracking + manual rider adjustment in GameScene.update()
- [x] Fix: Music was just clicks — exponentialRamp envelopes + too-short notes → rewrote with proper ADSR (15ms linear attack, sustained, smooth release), simpler compositions, fewer audio nodes
- [x] Fix: Added `game-container` div to index.html + error display overlay for debugging
- [x] Fix: Removed duplicate 'ground' texture generation in PreloadScene
- [x] Fix: Player now explicitly uses frame 0 and plays 'idle' animation on construction

## Current State
- **Build:** ✅ Compiles cleanly (32 modules, Vite v5.4.21)
- **Physics debug:** OFF (`debug: false` in main.js)
- **All core mechanics working:** cord, door, block propping, elevator riding, goal detection
- **Multi-level system:** ✅ 4 levels, data-driven GameScene, LevelRegistry with chaining
- **Art:** All textures procedurally generated (no external images)
- **Music:** Web Audio API chiptune — menu loop, level loop, victory fanfare
- **Levels 1-2:** Tested and playable
- **Levels 3-4:** Data files created, not yet play-tested
- **Error overlay:** Present in index.html for debugging (remove for release)

## Architecture Overview
```
src/
├── main.js              # Phaser.Game config (800×600, Arcade physics, gravity=900)
├── config.js            # All constants (dimensions, speeds, physics values)
├── assets/
│   ├── AssetTextures.js # Procedural texture generators
│   └── ElectricianSprite.js  # 14-frame hero spritesheet builder
├── audio/
│   └── ProceduralMusic.js    # Web Audio API chiptune synthesizer
├── scenes/
│   ├── BootScene.js     # → PreloadScene
│   ├── PreloadScene.js  # Generates textures, registers animations
│   ├── MenuScene.js     # Title screen with city backdrop + music
│   ├── GameScene.js     # Data-driven level builder + gameplay
│   └── UIScene.js       # HUD overlay (cord status)
├── entities/
│   ├── Player.js        # Electrician hero (movement, cord, grab, death/respawn)
│   ├── Generator.js     # Static power source
│   ├── Terminal.js       # Power outlet — links cord to puzzle elements
│   ├── ExtensionCord.js # Visual cord (bezier) + range checks
│   └── Spikes.js        # Hazard zone, neutralisable by blocks
├── puzzles/
│   ├── SlideDoor.js     # Powered sliding door (configurable direction/speed)
│   ├── Elevator.js      # Cycling platform with rider tracking
│   ├── PushBlock.js     # 2.5D grabbable block (dynamic body, gravity)
│   ├── Drawbridge.js    # Rotating plank bridge
│   ├── PuzzleElement.js # Base class (activate/deactivate interface)
│   └── Trigger.js       # Trigger base class
├── levels/
│   ├── LevelRegistry.js # Level list + lookup helpers
│   ├── Level01.js       # "First Steps" — intro
│   ├── Level02.js       # "Bridge the Gap" — drawbridge + spikes
│   ├── Level03.js       # "Power Cascade" — trigger zones + cascading
│   └── Level04.js       # "Tower Descent" — vertical, multi-route, hard
├── systems/
│   ├── ConnectionSystem.js  # Connection propagation
│   ├── PuzzleManager.js     # Element factory + registry
│   ├── GeneratorSystem.js   # Generator management, auto-activation
│   └── TriggerZone.js       # Invisible auto-activation zones
└── utils/
    ├── math.js          # Clamp, lerp, etc.
    └── debug.js         # Debug overlays
```
