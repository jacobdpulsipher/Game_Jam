/**
 * MentorSmallSprite.js
 *
 * Builds a clean sprite from src/assets/mentor_small.png.
 *
 * The source PNG has a white background. At runtime we:
 *  - Read all pixels
 *  - Treat white / near-white as transparent
 *  - Crop to the bounding box of remaining pixels
 *  - Output a clean texture named 'mentor_small'
 *
 * No limb animation needed — GameScene applies a standstill bounce tween.
 */

/** How close a pixel must be to pure white (255,255,255) to be removed. */
const WHITE_THRESHOLD = 240;

/**
 * Generate the mentor_small sprite with white background removed.
 * Requires a loaded texture named 'mentor_small_src'.
 *
 * @param {Phaser.Scene} scene
 * @returns {{ textureKey: string }}
 */
export function generateMentorSmallSprite(scene) {
  if (scene.textures.exists('mentor_small')) {
    return { textureKey: 'mentor_small' };
  }

  const tex = scene.textures.get('mentor_small_src');
  const srcImg = tex?.getSourceImage?.();
  if (!srcImg) {
    throw new Error("Missing source texture 'mentor_small_src' (mentor_small.png)");
  }

  // Draw the source image onto a canvas so we can read pixel data
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcImg.width;
  srcCanvas.height = srcImg.height;
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.imageSmoothingEnabled = false;
  srcCtx.clearRect(0, 0, srcCanvas.width, srcCanvas.height);
  srcCtx.drawImage(srcImg, 0, 0);
  const imageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
  const { data, width: w, height: h } = imageData;

  // Strip white background — set alpha to 0 for white/near-white pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      data[i + 3] = 0; // set alpha to transparent
    }
  }

  // Find bounding box of non-transparent pixels
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Fallback if nothing found
  if (maxX < minX || maxY < minY) {
    minX = 0; minY = 0; maxX = w - 1; maxY = h - 1;
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  // Write the cleaned, cropped image to a new canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d');
  outCtx.imageSmoothingEnabled = false;

  // Write back the modified imageData to the source canvas first
  srcCtx.putImageData(imageData, 0, 0);

  // Then draw the cropped region to the output canvas
  outCtx.drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

  // Register as a Phaser texture
  scene.textures.addCanvas('mentor_small', outCanvas);

  return { textureKey: 'mentor_small' };
}
