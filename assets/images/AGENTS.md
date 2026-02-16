# assets/images/ — Visual Assets

## Purpose
All images used in the game: sprite sheets, tilesets, backgrounds, UI elements.

## Sub-Directories
| Folder      | Contents |
|-------------|----------|
| `player/`   | Player character sprite sheets (idle, run, jump, etc.). |
| `tiles/`    | Tileset images used by Tiled for level geometry. |
| `puzzles/`  | Sprites for puzzle elements (doors, elevators, drawbridges, blocks, triggers). |
| `ui/`       | UI elements (buttons, health icons, frames). |
| `backgrounds/` | Parallax background layers. |

## Sprite Sheet Format
- Pixel art at native resolution (likely 32×32 per frame).
- Horizontal strip layout preferred: all frames in a single row.
- Transparent background (PNG with alpha).
- `frameWidth` and `frameHeight` specified in the `PreloadScene.js` load call.

## Tileset Format
- Single PNG image containing all tiles in a grid.
- Tile size matches `TILE_SIZE` in `src/config.js` (32×32).
- Used by Tiled to paint level geometry; the JSON tilemap references this image.
