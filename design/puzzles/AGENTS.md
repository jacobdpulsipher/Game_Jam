# design/puzzles/ — Puzzle Blueprints

## Purpose
Each file in this directory describes a single puzzle or puzzle pattern. These are design-level documents, not code.

## Format
Each puzzle blueprint should include:

1. **Name** — a short descriptive name.
2. **Sketch** — ASCII art showing the layout.
3. **Elements Used** — which puzzle pieces (doors, elevators, drawbridges, blocks, triggers).
4. **Connections** — what is connected to what (trigger A → door B, etc.).
5. **Solution** — step-by-step player actions to solve.
6. **Difficulty** — easy / medium / hard.
7. **Notes** — design intent, how it fits the "everything is connected" theme.

## Example Template
```markdown
# Puzzle: The Double Gate

## Sketch
```
  [P]          [EXIT]
  ═══╗   ╔═══════
     ║   ║
     ║ D1║
  ═══╝   ╚═══════
  [T1]  [B] [T2]
```

## Elements
- T1: Pressure Plate (trigger)
- T2: Pressure Plate (trigger)
- D1: Sliding Door
- B:  Push Block

## Connections
- T1 → D1 (opens door)
- T2 → D1 (opens door)

## Solution
1. Push block B onto T2.
2. Stand on T1.
3. Both triggers active → D1 opens → exit accessible.

## Difficulty
Easy (tutorial)
```
