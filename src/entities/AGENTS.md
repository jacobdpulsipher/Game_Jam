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

## Key Behaviors

### Player
- **Movement:** WASD / Arrow keys, speed = `PLAYER.SPEED` (200 px/s)
- **Jump:** W / Up / Space, velocity = `PLAYER.JUMP_VELOCITY` (-420)
- **Cord (E key):** Plugs cord into nearest in-range terminal, or unplugs if already connected
- **Block grab (F key):** Grabs nearby PushBlock (must be beside, not on top); released on F again, on jump, when airborne, or when block starts falling
- **Death:** `die()` — triggered by spike overlap. Flashes red, disconnects cord, respawns at level start after 500ms
- Collides with world bounds

### Generator
- Static body, no behavior — just a visual anchor for the extension cord
- `setLabel(text)` to change the overhead label

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

## Conventions
- Each entity extends `Phaser.Physics.Arcade.Sprite` (except ExtensionCord which is a plain class wrapping Graphics).
- Entities receive a reference to the scene and self-register with physics.
- `update()` is called from `GameScene.update()` each frame.

## Adding a New Entity
1. Create `EntityName.js` in this folder.
2. Export the class.
3. Instantiate from `GameScene`.
4. Update this AGENTS.md.
