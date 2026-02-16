# src/utils/ — Utility Functions

## Purpose
Pure helper functions and small utilities shared across the codebase. These have **no Phaser dependencies** unless noted, making them easy to unit-test.

## Files
| File           | Description |
|----------------|-------------|
| `math.js`      | Common math helpers — clamp, lerp, random range, etc. |
| `debug.js`     | Debug-mode helpers — on-screen text overlays, physics body rendering toggles. |

## Conventions
- Functions are exported individually (`export function clamp(…)`).
- No classes — just plain functions.
- No side effects — these are pure utilities.
