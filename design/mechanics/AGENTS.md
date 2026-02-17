# design/mechanics/ — Core Mechanic Specifications

## Purpose
Detailed specs for the game's core mechanics.

## Implemented Mechanics (MVP)

### Player Movement
- **Speed:** 200 px/s (PLAYER.SPEED)
- **Jump velocity:** -420 (PLAYER.JUMP_VELOCITY)
- **Gravity:** 900 (global)
- **Size:** 48×64 px
- **Controls:** WASD / Arrow keys for movement, W/Up/Space for jump
- **World bounds collision:** enabled

### Extension Cord System
- Hero carries a cord from Generator G1
- Press **E** near a Terminal to plug in (powers linked element)
- Press **E** again at same terminal to unplug (element returns to initial state)
- Cord range: 750 px from generator (CORD.MAX_LENGTH)
- Visual: orange bezier curve with sag, redrawn every frame
- Only one terminal can be powered at a time

### Push Block (2.5D)
- Default state: **background** — hero walks through it, top acts as platform
- Press **F** beside block to **grab** (block follows hero horizontally)
- Press **F** again to **release** (block returns to background walk-through state)
- Auto-releases on jump or when airborne
- Can only grab from beside (not from on top)
- Can prop open a closing SlideDoor

### Slide Door
- **Powered:** slides open (default: upward by its own height)
- **Unpowered:** slides back to closed position
- **Propping:** if a PushBlock is underneath when closing, door stops on the block
- When block is moved away, door resumes closing
- Configurable: direction, dimensions, speed, range

### Elevator
- **Powered:** cycles between startY and endY, pausing at each end
- **Unpowered:** returns to startY (resting position) and stops
- Configurable: dimensions, speed, pause duration, positions

### Drawbridge
- **Powered:** rotates from vertical (hanging down) to horizontal (walkable bridge)
- **Unpowered:** rotates back to vertical
- Uses a separate static `bridgeBody` for walkable surface
- Configurable: width, speed, direction (`right` / `left`)

### Spikes
- Hazard zone — kills player on overlap
- Can be neutralised by pushing a block over them (`neutralise()`)
- Configurable width

### Heavy Block
- Immovable block the player CANNOT push or grab
- Falls with gravity when its support is removed
- Has a thin `topPlatform` for standing on and a `skirt` blocking horizontal passage
- Used as barriers and platforms in puzzle design

### Enemies
- Patrolling hazards — walk left/right between configurable boundaries
- Kill the player on touch (same as spikes)
- Can only be killed by the dangling extension cord plug (when NOT connected to a terminal)
- 32×32 px — short enough for the hero (48×64) to jump over
- Used to add timing/action challenges to puzzle levels

### Secondary Generator Activation
- Generators can be `isPrimary: false` (secondary)
- Activated by pressing E nearby (no cord required) or by trigger zones
- `autoActivateIds` — permanently powers listed element IDs
- Linked elements get `_permanentlyPowered = true`, blocking deactivation

## Design Pillars
1. **Clarity** — The player should always see cause and effect.
2. **Connectedness** — Puzzles embody "everything is connected" via cord wiring.
3. **Fairness** — No pixel-perfect jumps or hidden information.
4. **Escalation** — Simple elements combine into complex systems.
