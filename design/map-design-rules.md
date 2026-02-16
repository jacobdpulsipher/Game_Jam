# Map Design Rules & Physics Reference

> This document is the single source of truth for designing levels.
> AI agents and human designers should consult it before creating any level data.

---

## 1. Physics Constants (from `src/config.js`)

| Property | Value | Notes |
|---|---|---|
| Gravity | 900 px/s² | Downward acceleration |
| Player speed | 200 px/s | Horizontal |
| Jump velocity | −420 px/s | Initial upward burst |
| **Max jump height** | **≈ 98 px** | v² / (2g) = 420² / 1800 |
| Player size | 28 × 48 px | Width × Height |
| Push block size | 48 × 48 px | Square |
| Door default size | 32 × 128 px | Width × Height |
| Elevator default size | 80 × 16 px | Width × Height (thin platform) |
| Drawbridge default | 100 × 12 px | Length × Thickness; rotates 90° |
| Spikes tile width | 16 px | Width of one spike triangle |
| Spikes height | 24 px | Visual height of spike row |
| Cord max length | 750 px | From generator center to terminal center |
| Terminal interact range | 40 px | Player must be within 40 px of terminal center |
| Game canvas | 1024 × 768 px | Viewport (camera scrolls if world is wider) |

### Derived Jump Metrics

| Scenario | Reachable Height | Formula |
|---|---|---|
| Jump from floor | 98 px | 420² / (2 × 900) |
| Jump from block (48 px) | 146 px | 48 + 98 |
| Jump from elevator at top | 98 px above elevator surface | Same physics |
| Horizontal jump distance (approx) | ~186 px | speed × airtime = 200 × (2 × 420/900) |

---

## 2. Reachability Rules

These rules determine what the player can and cannot do. Use them to decide gap sizes, ledge heights, and obstacle placement.

### 2.1 Vertical Gaps (Can the player jump up to a ledge?)

| Ledge Height Above Standing Surface | Reachable? | Method |
|---|---|---|
| ≤ 96 px | ✅ Yes | Normal jump (leave 2 px margin from max) |
| 97–144 px | ⚠️ Block required | Player must push block to base, stand on it, then jump |
| 145–196 px | ⚠️ Elevator required | Or block + running jump at the very limit |
| > 196 px | ❌ Impossible | Requires multiple blocks or a redesign |

> **Design tip:** Use 64–80 px ledge heights for "easy jumps" and 100–140 px for "needs a block" puzzles.

### 2.2 Doors (Can the player jump over them?)

| Door Height | Over from floor? | Over with block? | Design Use |
|---|---|---|---|
| < 98 px | ✅ Yes | ✅ Yes | NOT a barrier — avoid for obstacles |
| 100–145 px | ❌ No | ✅ Yes | Barrier unless block is used as a step |
| ≥ 148 px | ❌ No | ❌ No | Absolute barrier — requires power |

The **default door height (128 px)** is in the middle zone:
- Cannot be jumped from the floor (98 < 128 ✅ blocks player)
- CAN be jumped from a block (146 > 128 — player's feet clear the top)

**This is intentional.** A 128 px door requires either powering it open OR prop-jumping with a block. To make a door that is an absolute barrier even with a block, set height ≥ 148 px.

### 2.3 Horizontal Gaps

| Gap Width | Crossable? | Notes |
|---|---|---|
| ≤ 150 px | ✅ Running jump | Comfortable with margin |
| 150–186 px | ⚠️ Tight | Requires full-speed running jump from edge |
| > 186 px | ❌ No | Needs a bridge, elevator, or platform |

### 2.4 Push Block Placement

- Blocks weigh 48 × 48 px and are pushed at 80 px/s.
- Blocks start in "background" and cannot collide until grabbed.
- Grab range: player must be beside the block (not on top), within ~1.5× block width horizontally.
- Blocks can prop doors open: the door stops closing when the block is underneath.
- Blocks cannot be pushed through walls or off the edge of platforms (physics collider).

---

## 3. Cord & Terminal Rules

The extension cord is the core mechanic. Follow these rules carefully.

### 3.1 Cord Range

The cord stretches from the **generator center** to the **terminal center**.  
Max range: **750 px** (Euclidean distance).

```
   distance = √((termX − genX)² + (termY − genY)²)   ≤ 750 px
```

The player must also be within the terminal's **interact range** (40 px) to plug in.
But there is NO requirement that the player stay near the terminal — once plugged in, the cord stays connected regardless of player position.

### 3.2 One Cord at a Time

- The player can only be plugged into **one terminal** at a time.
- Pressing E at the currently connected terminal unplugs.
- Pressing E near a different terminal (while not connected) plugs in there.
- Unplugging powers down the linked puzzle element.

### 3.3 Terminal Placement Guidelines

| Rule | Rationale |
|---|---|
| Terminal must be within 750 px of generator | Cord range limit |
| Place terminal 30–50 px from the door/elevator it controls | Visual clarity |
| Place terminal at floor level (y = FLOOR_Y − 16) or on the ledge it serves | So the player can reach it |
| Don't put two terminals within 40 px of each other | Avoids ambiguous plug targets |
| Consider the cord path — the player must walk to the terminal while dragging the cord from the generator | The straight-line check is generous (750 px), but the player can't teleport |

### 3.4 Multi-Terminal Puzzles

Since only one terminal can be powered at a time, puzzles with 2+ terminals require the player to decide which element to power. Typical pattern:

1. Power terminal A → opens door → walk through
2. Unplug A → door closes (unless propped!) → power terminal B → activate elevator

This creates cascading "everything is connected" chains.

---

## 4. Level Data Conventions

### 4.1 Coordinate System

- Origin (0, 0) is the **top-left** corner.
- X increases rightward, Y increases downward.
- All coordinates in level data refer to the **center** of the object.
- Example: A 32-wide floor at the bottom of a 768 px world →  
  `{ x: worldWidth/2, y: 752, width: worldWidth, height: 32 }`

### 4.2 Floor & Wall Formula

For a standard room of width W and floor at Y:

```js
// Main floor
{ x: W / 2, y: FLOOR_Y + 16, width: W, height: 32 }

// Left wall (floor to ceiling)
{ x: 8, y: FLOOR_Y / 2, width: 16, height: FLOOR_Y }

// Right wall
{ x: W - 8, y: FLOOR_Y / 2, width: 16, height: FLOOR_Y }

// Ceiling (optional — prevents jumping out)
{ x: W / 2, y: 8, width: W, height: 16 }
```

### 4.3 Placing Objects on the Floor

Objects sit ON the floor surface. To place an object with height H on a floor at FLOOR_Y:

```
object center Y = FLOOR_Y − (H / 2)
```

Examples:
- Player (H=48): `y: FLOOR_Y - 24`  (or `FLOOR_Y - 40` for safe margin above floor)
- Block (H=48): `y: FLOOR_Y - 24`
- Door (H=128): `y: FLOOR_Y - 64`
- Generator (H=40): `y: FLOOR_Y - 20`
- Terminal (H=24): `y: FLOOR_Y - 12`  (often use `-16` for visual clearance)
- Elevator bottom rest: `y: FLOOR_Y - 8`  (H=16)

### 4.4 ID Naming Convention

All puzzle elements have an `id` field. Use these prefixes:

| Element  | Prefix | Example |
|---|---|---|
| Generator | `g` | `g1`, `g2` |
| Terminal  | `t_` | `t_door`, `t_elev1` |
| Door      | `door` | `door1`, `door_left` |
| Elevator  | `elev` | `elev1`, `elev_shaft2` |
| Push Block | `block` | `block1`, `block_main` |

### 4.5 Linking Terminals to Elements

In the level data, `terminal.linkTo` is a string that must match the `id` of a door, elevator, or any other puzzle element. GameScene resolves the reference at build time.

```js
terminals: [
  { id: 't_door', x: 270, y: 534, linkTo: 'door1' },
  //                                        ^^^^^ must match a door/elevator id
],
doors: [
  { id: 'door1', x: 320, y: 486 },
  //    ^^^^^ referenced above
],
```

---

## 5. ASCII Map Drawing Convention

When sketching levels as ASCII for an AI agent to convert into level data, use these symbols:

```
Legend:
  ═══  Floor / platform (solid ground)
  ║    Wall (vertical solid)
  ▓▓▓  Door (tall obstacle, opens when powered)
  [B]  Push block
  [E]  Elevator platform
  DB   Drawbridge (rotates from vertical to horizontal)
  ^^^  Spikes (hazard — kills player on contact)
  G1   Generator (power source, also player spawn nearby)
  G2   Generator (goal / destination)
  T1   Terminal (links to a specific element)
  ★    Goal zone
  •    Player spawn
  ~~~  Cord (illustrative only)

Height Annotations (right margin):
  y=0    ── top of world
  y=340  ── ledge surface
  y=550  ── floor surface
  y=768  ── bottom of world
```

### Example ASCII Map (Level 01):

```
                                                        ╔═════════╗
                                                        ║  G2 ★   ║   y=340
                                                        ║         ║
                                                        ╠═════════╣
                                                        ║         ║
                          ▓▓▓                    [E]    ║         ║
   G1  •        T1        ▓▓▓  [B]       T2             ║         ║
  ═══════════════════════════════════════════════════════╩═════════╝   y=550
```

### Parsing Notes for AI Agents

When converting an ASCII map to level data:

1. **Establish the floor Y** — find the `═══` line and assign it a Y value (default: 550).
2. **Identify world width** — count the horizontal extent and scale to pixels (each character ≈ 16–20 px is a reasonable estimate, but exact placement should be specified in annotations or comments).
3. **Place objects left-to-right** — assign X coordinates in order, respecting spacing.
4. **Check cord range** — every terminal must be ≤ 750 px from its generator.
5. **Check jump constraints** — use Section 2 to verify player can reach all required positions.
6. **Add walls** — surround the playable area with wall platforms.

---

## 6. Puzzle Design Patterns

### Pattern A: "Gate & Key"
A door blocks the path. A terminal nearby opens it. Player plugs in, walks through. Simple.

### Pattern B: "Prop & Go"
A door blocks the path, but the terminal for the next puzzle is beyond it. Player:
1. Plugs in → door opens
2. Drags a block under the door
3. Unplugs → door closes but props on block
4. Walks through the gap, reaches the next terminal

### Pattern C: "Elevator Ride"
An elevator connects two height levels. Player must plug into the elevator terminal, ride up or down, then decide whether to unplug (elevator returns to start) or leave it powered.

### Pattern D: "Resource Conflict"
Two terminals compete for the single cord. Player must power element A to progress, then unplug and power element B. Requires careful sequencing and sometimes propping.

### Pattern E: "Block Step"
A ledge is too high to jump. Player pushes a block to the base of the ledge, climbs on, and jumps. Does NOT consume cord power — orthogonal to the electrical system.

### Pattern F: "Cascading Chain"
Multiple puzzle patterns chained together. Door → Block Prop → Elevator → Goal. Each step builds on the previous. This is the core "Everything Is Connected" experience.

### Pattern G: "Drawbridge Crossing"
A drawbridge covers a spike pit when powered. Player plugs in, crosses safely. The cord is consumed by the drawbridge, so the player must decide when to unplug for later puzzles.

### Pattern H: "Spike Pit Cover"
A pit of spikes blocks the path. Player pushes a block into the pit to cover the spikes, then uses the block as a stepping stone to cross or jump out. Requires gravity-enabled blocks.

---

## 7. Difficulty Scaling Guide

| Difficulty | Elements | Cord Terminals | Key Challenge |
|---|---|---|---|
| Tutorial | 1 door | 1 terminal | Learn the cord mechanic |
| Easy | 1 door + 1 elevator | 2 terminals | Resource conflict (one cord, two terminals) |
| Medium | 2 doors + elevator + block | 2–3 terminals | Prop + sequence planning |
| Hard | Multiple doors + elevators + blocks | 3–4 terminals | Complex ordering, backtracking |
| Expert | All elements, tight cord range | 4+ terminals | Every action matters, minimal slack |

---

## 8. Pre-flight Checklist

Before finalizing a level, verify ALL of the following:

- [ ] Every terminal is within 750 px of its generator (cord range)
- [ ] Every terminal `linkTo` matches an existing element `id`
- [ ] Player spawn is near the generator they are tethered to
- [ ] All objects sit on surfaces (correct Y calculation)
- [ ] Door heights prevent unintended bypasses (see Section 2.2)
- [ ] Ledge heights match intended reachability (see Section 2.1)
- [ ] Horizontal gaps are crossable where intended (see Section 2.3)
- [ ] The level is solvable — trace the full solution path
- [ ] `nextLevel` is set correctly (or `null` for the final level)
- [ ] World width and height accommodate all platforms
- [ ] Walls enclose the playable area (no walking/falling off the world)
