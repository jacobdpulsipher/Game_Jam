# design/ — Game Design Documents

## Purpose
Living design documents that capture decisions about gameplay, puzzles, levels, and mechanics. This is the **source of truth** for game design — consult these before implementing features.

## Sub-Directories
| Folder       | Contents |
|--------------|----------|
| `puzzles/`   | Individual puzzle blueprints — diagrams, logic descriptions, difficulty notes. |
| `levels/`    | Level layout plans — which puzzles appear, flow, pacing, narrative beats. |
| `mechanics/` | Core mechanic specs — player abilities, the connection system, physics tuning. |

## Key Documents
| File | Description |
|------|-------------|
| `map-design-rules.md` | **Master reference** for level design — physics constants, reachability tables, cord rules, ASCII map conventions, puzzle patterns, difficulty guide, and pre-flight checklist. Read this before creating any level. |
| `music-composition-guide.md` | Guide for composing new procedural music tracks using the Web Audio API system. Covers the three-section loop structure, instrument setup, melody writing, and mixing. |

## How to Use
- **Before coding a new feature**, check if there's a design doc here. If not, create one.
- **Before creating a level**, read `map-design-rules.md` for physics constraints and conventions.
- **After a design decision**, record it here so AI agents and teammates have context.
- Keep docs concise and visual (ASCII diagrams, bullet lists, tables).
- Design docs are Markdown files (`.md`).
