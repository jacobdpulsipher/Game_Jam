# assets/tilemaps/ — Tiled Map Exports

## Purpose
JSON tilemap files exported from the **Tiled Map Editor**. Each file defines one level's geometry, collision data, and puzzle object placements.

## Workflow
1. Open Tiled and create/edit a map.
2. Use the tileset image from `assets/images/tiles/`.
3. Paint level geometry on tile layers.
4. Place puzzle objects on the **Objects** layer with appropriate types and custom properties.
5. Export as JSON → save here as `level_<number>.json`.

## Layer Conventions
| Layer Name  | Type        | Purpose |
|-------------|-------------|---------|
| `Ground`    | Tile layer  | Main solid geometry — floors, walls, ceilings. Has `collides: true` property. |
| `Background`| Tile layer  | Decorative background tiles (no collision). |
| `Foreground`| Tile layer  | Tiles rendered in front of the player (decorative). |
| `Objects`   | Object layer| Puzzle elements and spawn points. Each object has a `type` matching a class name in `src/puzzles/`. |

## Object Custom Properties
Objects in the **Objects** layer use Tiled custom properties to configure behavior:
- `id` / `name`: unique identifier for ConnectionSystem lookups.
- `type`: class name (`SlideDoor`, `Elevator`, `Drawbridge`, `PushBlock`, `Trigger`).
- `connectedTo`: (triggers only) comma-separated IDs of target elements.
- Element-specific properties (see each puzzle class for details).

## Spawn Points
Player spawn is an object of type `PlayerSpawn` on the Objects layer.
