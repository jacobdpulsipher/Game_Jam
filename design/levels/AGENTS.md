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
2. Add a new `_buildLevel()` variant in GameScene (or create a new scene).
3. Document puzzle layout, solution, and difficulty.
