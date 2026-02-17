# src/systems/ — Cross-Cutting Game Systems

## Purpose
Systems operate across multiple entities and puzzle elements, providing coordination logic that doesn't belong to any single game object.

## Files
| File                  | Description |
|-----------------------|-------------|
| `ConnectionSystem.js` | **The core "Everything is connected" mechanic.** Listens for trigger events and propagates activation/deactivation to linked puzzle elements. |
| `PuzzleManager.js`    | Factory that instantiates puzzle element classes. Maintains a registry of all puzzle elements by ID. |
| `GeneratorSystem.js`  | Manages generators, element registration, and auto-activation. Secondary generators can be activated by E-key press (via GameScene) or trigger zones. Linked elements receive permanent power via `_permanentlyPowered` flag. |
| `TriggerZone.js`      | Invisible zone (extends `Phaser.GameObjects.Zone`) that auto-activates linked elements when the player overlaps it. Used for cascading puzzle activations in Levels 3-4. |

## How the ConnectionSystem Works
1. `PuzzleManager` creates puzzle element instances, registering them by ID.
2. `ConnectionSystem` reads each `Trigger`'s `connectedTo` list and builds an adjacency map.
3. When a trigger fires (`trigger-activated` / `trigger-deactivated` events), the ConnectionSystem looks up all connected element IDs and calls `activate()` / `deactivate()` on them.
4. Connections can chain: a trigger can activate an elevator whose movement triggers another pressure plate, which opens a door — everything is connected.

## TriggerZone System (Levels 3-4)
- `TriggerZone` extends `Phaser.GameObjects.Zone` (not Arcade.Zone).
- Created by GameScene from level data `triggerZones` array.
- Each zone has `targetIds` — element IDs to auto-activate on player overlap.
- Enables cascading puzzle activations without requiring cord connection.

## Architecture Notes
- Systems are **plain classes**, not Phaser GameObjects.
- They receive the scene reference in the constructor and subscribe to scene events.
- They expose an `update(time, delta)` method for per-frame logic if needed.
