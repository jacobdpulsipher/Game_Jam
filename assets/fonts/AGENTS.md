# assets/fonts/ — Custom Fonts

## Purpose
Custom web fonts or bitmap fonts used for in-game text rendering.

## Formats
- **Bitmap fonts:** `.png` sprite sheet + `.xml` / `.fnt` descriptor (loaded with `this.load.bitmapFont()`).
- **Web fonts:** `.woff2` / `.ttf` files loaded via CSS `@font-face` in `index.html` (used with Phaser's `Text` object).

## Notes
- Pixel-art-friendly bitmap fonts are preferred for the HUD to maintain visual consistency.
- Web fonts can be used for menus and dialogs where readability matters more.
