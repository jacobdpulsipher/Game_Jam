# assets/audio/ — Audio Assets

## Purpose
All audio files: background music and sound effects.

## Sub-Directories
| Folder   | Contents |
|----------|----------|
| `music/` | Background music tracks (`.ogg` preferred for web, `.mp3` fallback). |
| `sfx/`   | Sound effects (`.wav` or `.ogg`). Short, one-shot sounds. |

## Naming
- Music: `bgm_<scene_or_mood>.ogg` (e.g., `bgm_menu.ogg`, `bgm_puzzle.ogg`).
- SFX: `sfx_<action>.wav` (e.g., `sfx_jump.wav`, `sfx_door_open.wav`, `sfx_switch.wav`).

## Audio Guidelines
- Keep file sizes small — compress where possible.
- Loop points for music should be clean (no clicks at loop boundary).
- SFX should be normalized to a consistent volume level.
- All audio is loaded in `PreloadScene.js`.
