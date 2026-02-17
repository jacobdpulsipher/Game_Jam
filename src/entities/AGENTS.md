# src/entities/ — Game Entities

## Purpose
Entities are game objects with behavior — things that exist in the world and do something each frame or in response to events.

## Files
| File              | Description |
|-------------------|-------------|
| `Player.js`       | The hero electrician. Handles input (WASD/Arrows/Space + E for cord + F for block grab), movement, jumping. Manages cord connection state and block grab state. Auto-releases block on jump, when airborne, or when the block starts falling. Has `die()` / respawn for hazard deaths. |
| `Generator.js`    | Static power source the hero is tethered to. The extension cord originates here. Has a configurable label. |
| `Terminal.js`     | Plug point on a puzzle element. Player presses E near it to connect/disconnect the cord. When powered, calls `linkedElement.activate()`; when unpowered, calls `linkedElement.deactivate()`. |
| `ExtensionCord.js`| Visual-only — draws a droopy bezier cord from the generator to either the connected terminal or the player. Also provides `isInRange(terminal)` for range checks. |
| `Spikes.js`       | Hazard zone — a row of procedural spike triangles. Kills the player on overlap. Can be neutralised when a PushBlock covers them (`neutralise()` disables body + fades visual). |
| `HeavyBlock.js`   | Gravity-following wall the player CANNOT push or grab. Dynamic body with `pushable = false`, `maxVelocityX = 0`. Has a `topPlatform` (thin static body on top for standing) and a `skirt` (visible 48px-tall static body below, industrial gray, blocks horizontal passage). When its support (e.g. a PushBlock) is removed, it falls to the next surface. |
| `Enemy.js`        | Patrolling hazard — a small enemy that walks left and right between configurable patrol boundaries. Kills the player on touch (same as spikes). Can only be killed by the extension cord plug when the cord is NOT connected to a terminal. Short enough (32×32) for the hero to jump over. |

## Key Behaviors

### Player
- **Movement:** WASD / Arrow keys, speed = `PLAYER.SPEED` (200 px/s)
- **Jump:** W / Up / Space, velocity = `PLAYER.JUMP_VELOCITY` (-420)
- **Cord (E key):** Plugs cord into nearest in-range terminal, or unplugs if already connected
- **Block grab (F key):** Grabs nearby PushBlock (must be beside, not on top); released on F again, on jump, when airborne, or when block starts falling
- **Death:** `die()` — triggered by spike overlap. Flashes red, disconnects cord, respawns at level start after 500ms
- Collides with world bounds

### Generator
- Two types: **PRIMARY** (`isPrimary: true`, default) — hero carries cord from this to terminals; **SECONDARY** (`isPrimary: false`) — auto-activates linked elements when triggered
- Secondary generators are activated by pressing E nearby (no cord required) or by trigger zones
- `autoActivateIds` — list of element IDs that are permanently powered when the generator activates
- Linked elements get `_permanentlyPowered = true`, preventing terminal-based `deactivate()`
- `setLabel(text)` to change the overhead label
- `activate(elementsById)` / `deactivate(elementsById)` / `toggle(elementsById)` — secondary only

### Terminal
- `linkTo(element)` — wire to a puzzle element
- `setPowered(bool)` — swaps texture, calls activate/deactivate on linked element
- `isPlayerInRange(player)` — range check (TERMINAL.INTERACT_RANGE = 40px)

### ExtensionCord
- Redraws every frame as a quadratic bezier with sag
- `isInRange(terminal)` — checks distance ≤ CORD.MAX_LENGTH (750px)

### Spikes
- Static physics body for overlap detection
- `isDangerous` getter — true unless neutralised
- `neutralise()` — disable body, fade to 30% alpha (called when block covers them)
- `reactivate()` — re-enable (unused in current levels)

### HeavyBlock
- **Body:** Dynamic, `pushable = false`, `maxVelocityX = 0`, gravity-enabled
- **topPlatform:** Thin static body on top — player can stand on it
- **skirt:** 48px-tall visible static body below (color `0x445566`, stroke `0x334455`) — fills gap between block bottom and floor, blocking horizontal passage. `checkCollision.up/down = false` so it doesn't interfere with jumping over the dropped block
- **syncPosition():** Called every frame to keep topPlatform, skirt, and label in sync
- **Procedural texture:** Steel panel with hazard stripes, rivets, beveled edges
- **Level data:** `{ id, x, y, width?, height? }`

### Enemy
- **Patrol:** Walks between `rangeLeft` and `rangeRight` at configurable `speed` (default: ENEMY.SPEED = 80 px/s)
- **Danger:** `isDangerous` getter — true while alive. Player overlap triggers `player.die()`
- **Kill mechanic:** Can only be killed by the dangling extension cord plug (when cord is NOT connected to a terminal). A hidden plug zone follows the player and checks overlap with enemies
- **Death:** `kill()` — stops movement, plays shrink+fade tween, destroys sprite
- **Size:** 32×32 px — short enough for the hero (48×64) to jump over. Jumping ON them does NOT kill them
- **Level data:** `{ id, x, y, speed?, rangeLeft, rangeRight, direction?, label? }`

## Conventions
- Each entity extends `Phaser.Physics.Arcade.Sprite` (except ExtensionCord which is a plain class wrapping Graphics).
- Entities receive a reference to the scene and self-register with physics.
- `update()` is called from `GameScene.update()` each frame.

## Adding a New Entity
1. Create `EntityName.js` in this folder.
2. Export the class.
3. Instantiate from `GameScene`.
4. Update this AGENTS.md.
