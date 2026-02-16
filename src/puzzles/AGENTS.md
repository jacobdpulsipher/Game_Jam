# src/puzzles/ — Reusable Puzzle Mechanisms

## Purpose
Each file defines a self-contained puzzle element that can be placed in any level.
All elements implement an `activate()` / `deactivate()` interface so they can be
wired to `Terminal` objects via the extension-cord power system.

## Puzzle Elements

| File             | Element      | Description |
|------------------|--------------|-------------|
| `SlideDoor.js`   | Sliding Door | A door that slides open when powered and closes when unpowered. Supports configurable direction (`up`/`down`/`left`/`right`), size, speed, and range. If a PushBlock is underneath when closing, the door props open on the block. |
| `Elevator.js`    | Elevator     | A platform that cycles between `startY` and `endY` when powered. Returns to `startY` when unpowered. Tracks per-frame `deltaY` so GameScene can carry riders. Configurable size, speed, and pause duration. |
| `PushBlock.js`   | Push Block   | A block with 2.5D behavior — walks through in background, grabs to foreground. Uses a dynamic body with gravity so it falls off edges. Auto-releases grab when block starts falling. Top always acts as a platform. Can prop open doors and cover spikes. |
| `Drawbridge.js`  | Drawbridge   | A plank that rotates from vertical (closed/hanging down) to horizontal (open/bridge) when powered. Uses a separate static bridgeBody for walkable surface. Configurable width, speed, and direction (`right`/`left`). |

## Common Interface
All puzzle elements implement:
```js
activate()    // Begin the "on" behavior (open door, raise elevator, etc.)
deactivate()  // Reverse it — return to initial / resting state
isActive      // Boolean getter — current powered state
```

## Constructor Pattern
`SlideDoor`, `Elevator`, and `Drawbridge` use an **options object** constructor:
```js
// Elevator example — all fields except x/startY/endY are optional
new Elevator(scene, {
  x: 750,
  startY: 542,        // resting position
  endY: 332,          // destination when powered
  width: 80,          // default: ELEVATOR.WIDTH from config
  height: 16,         // default: ELEVATOR.HEIGHT
  speed: 100,         // px/sec, default: ELEVATOR.SPEED
  pauseDuration: 800, // ms pause at each stop, default: ELEVATOR.PAUSE_DURATION
  label: 'E',         // debug label, default: 'E'
});

// SlideDoor example
new SlideDoor(scene, {
  x: 320,
  y: 486,             // closed (resting) center position
  width: 32,          // default: DOOR.WIDTH
  height: 128,        // default: DOOR.HEIGHT
  slideSpeed: 120,    // px/sec, default: DOOR.SLIDE_SPEED
  direction: 'up',    // 'up' | 'down' | 'left' | 'right', default: 'up'
  range: 128,         // distance to slide in px, default: height
  label: 'D',
});

// Drawbridge example
new Drawbridge(scene, {
  pivotX: 320,        // hinge point X
  pivotY: 580,        // hinge point Y (usually floor level)
  width: 110,         // plank length, default: DRAWBRIDGE.WIDTH
  height: 12,         // plank thickness, default: DRAWBRIDGE.HEIGHT
  speed: 120,         // deg/sec rotation, default: DRAWBRIDGE.SPEED
  direction: 'right', // extends right when open, default: 'right'
  label: 'DB',
});
```

## How Connections Work
In the MVP, connections are manual:
1. `GameScene` creates a `Terminal` and calls `terminal.linkTo(puzzleElement)`.
2. When the player plugs the extension cord into a terminal, `Terminal.setPowered(true)`
   calls `element.activate()`. Unplugging calls `element.deactivate()`.

## Adding a New Puzzle Element
1. Create `NewElement.js` with `activate()`, `deactivate()`, `get isActive()`.
2. Use an options object constructor for dimensions / position / behavior tuning.
3. Instantiate in `GameScene._buildLevel()`.
4. Wire via `terminal.linkTo(newElement)`.
5. Update this AGENTS.md.
