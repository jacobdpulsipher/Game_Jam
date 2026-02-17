# design/levels/ — Level Plans

## Purpose
Each file describes one level's layout, puzzle sequence, and solution.

## Level 1 (MVP) — Implemented in GameScene

### Layout (left to right)
```
[G1] [Player]  [T1] [Door]   [PushBlock]   [T2] [Elevator]  | Ledge [G2]
  x=60  x=120  x=270 x=320    x=480       x=700  x=750     | x=850+  x=1040
                                                             |
  Floor Y=550                                                | Ledge Y=340
```

### Solution
1. Walk right to T1, press E → door opens
2. Walk through door, grab block (F), drag it under door
3. Release block (F), walk back to T1, press E to unplug → door closes but props on block
4. Walk through propped door gap to T2, press E → elevator powers on
5. Ride elevator up to ledge, reach G2 → level complete

### New Mechanics Introduced
- Extension cord plug/unplug
- Slide door (powered open, closes when unpowered)
- Push block with 2.5D grab mechanic
- Door propping
- Elevator (powered cycling, returns to start when unpowered)

## Adding New Levels
1. Create a level design doc here.
2. Create a level data file in `src/levels/` following the schema in `LevelRegistry.js`.
3. Import the new level in `LevelRegistry.js` and add it to the `LEVELS` array.
4. Set the previous level's `nextLevel` to the new level's `id`.
5. Follow the design rules in `design/map-design-rules.md`.

## Current Level Lineup
| ID | Name | Type | Description |
|----|------|------|-------------|
| `tut_1`–`tut_8` | Tutorial 1–8 | Tutorial | 8 self-contained mini-rooms teaching mechanics with popup hints |
| `level_01` | First Steps | Gameplay | Intro: cord, door, block, elevator |
| `level_02` | Bridge the Gap | Gameplay | Drawbridge + spikes |
| `level_03` | Dead Weight | Gameplay | Heavy block barrier puzzle |
| `level_04` | Power Climb | Gameplay | Staircase ascent, block transport, generator activation |
| `level_06` | The Gauntlet | Gameplay | Final level, multi-enemy gauntlet with elevator puzzle |
