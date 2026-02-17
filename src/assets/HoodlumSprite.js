/**
 * HoodlumSprite.js
 *
 * Builds an animated enemy spritesheet from src/assets/hoodlum.png.
 *
 * The source PNG is a single pose on a white background. At runtime we:
 *  - Treat white as transparent
 *  - Heuristically segment pixels into 8 body parts
 *  - Render frames by rotating limbs around joint pivots (hero-style)
 *
 * Output texture: 'hoodlum' (frames are ENEMY-like 32×32)
 * Animation: 'hoodlum_walk'
 */

const OUT_W = 32;
const OUT_H = 32;

const D = Math.PI / 180;

const POSES = {
  walk: [
    {
      bodyDy: 0,
      leftShoulderAngle: 32 * D,
      rightShoulderAngle: -28 * D,
      leftHipAngle: -28 * D,
      leftKneeAngle: 32 * D,
      rightHipAngle: 18 * D,
      rightKneeAngle: -6 * D,
    },
    {
      bodyDy: -1,
      leftShoulderAngle: 18 * D,
      rightShoulderAngle: -14 * D,
      leftHipAngle: -14 * D,
      leftKneeAngle: 18 * D,
      rightHipAngle: 10 * D,
      rightKneeAngle: 0,
    },
    {
      bodyDy: -2,
      leftShoulderAngle: 0,
      rightShoulderAngle: 0,
      leftHipAngle: 0,
      leftKneeAngle: 6 * D,
      rightHipAngle: 0,
      rightKneeAngle: 6 * D,
    },
    {
      bodyDy: -1,
      leftShoulderAngle: -18 * D,
      rightShoulderAngle: 14 * D,
      leftHipAngle: 14 * D,
      leftKneeAngle: 0,
      rightHipAngle: -14 * D,
      rightKneeAngle: 16 * D,
    },
    {
      bodyDy: 0,
      leftShoulderAngle: -32 * D,
      rightShoulderAngle: 28 * D,
      leftHipAngle: 18 * D,
      leftKneeAngle: -6 * D,
      rightHipAngle: -28 * D,
      rightKneeAngle: 32 * D,
    },
    {
      bodyDy: -1,
      leftShoulderAngle: -18 * D,
      rightShoulderAngle: 14 * D,
      leftHipAngle: 10 * D,
      leftKneeAngle: 0,
      rightHipAngle: -14 * D,
      rightKneeAngle: 18 * D,
    },
    {
      bodyDy: -2,
      leftShoulderAngle: 0,
      rightShoulderAngle: 0,
      leftHipAngle: 0,
      leftKneeAngle: 6 * D,
      rightHipAngle: 0,
      rightKneeAngle: 6 * D,
    },
    {
      bodyDy: -1,
      leftShoulderAngle: 18 * D,
      rightShoulderAngle: -14 * D,
      leftHipAngle: -14 * D,
      leftKneeAngle: 16 * D,
      rightHipAngle: 14 * D,
      rightKneeAngle: 0,
    },
  ],
};

function rgbToInt(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

function hexColor(rgbInt) {
  return '#' + rgbInt.toString(16).padStart(6, '0');
}

function findBoundingBox(pixels, w, h, isSolid) {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isSolid(x, y)) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) {
    return { x: 0, y: 0, w: w, h: h };
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function buildCommandsForPart(partId, partAt, colorAt, w, h, paletteIndex) {
  // First pass: horizontal runs (1px high)
  const runs = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (partAt(x, y) !== partId) {
        x++;
        continue;
      }
      const rgb = colorAt(x, y);
      const ci = paletteIndex.get(rgb);
      let runW = 1;
      while (x + runW < w && partAt(x + runW, y) === partId && colorAt(x + runW, y) === rgb) {
        runW++;
      }
      runs.push({ ci, x, y, w: runW, h: 1 });
      x += runW;
    }
  }

  // Second pass: vertical merge runs with same ci/x/w
  const buckets = new Map();
  for (const r of runs) {
    const k = `${r.ci},${r.x},${r.w}`;
    let arr = buckets.get(k);
    if (!arr) {
      arr = [];
      buckets.set(k, arr);
    }
    arr.push(r);
  }

  const removed = new Set();
  for (const [, group] of buckets) {
    group.sort((a, b) => a.y - b.y);
    for (let i = 0; i < group.length - 1; i++) {
      const cur = group[i];
      if (removed.has(cur)) continue;
      let j = i + 1;
      while (j < group.length) {
        const nxt = group[j];
        if (removed.has(nxt)) {
          j++;
          continue;
        }
        if (nxt.y === cur.y + cur.h) {
          cur.h += nxt.h;
          removed.add(nxt);
          j++;
          continue;
        }
        break;
      }
    }
  }

  const merged = runs.filter(r => !removed.has(r));
  merged.sort((a, b) => a.y - b.y || a.x - b.x);
  return merged.map(r => [r.ci, r.x, r.y, r.w, r.h]);
}

function drawPartFlat(ctx, cmds, palette, dx, dy) {
  for (const [ci, x, y, w, h] of cmds) {
    ctx.fillStyle = hexColor(palette[ci]);
    ctx.fillRect(x + dx, y + dy, w, h);
  }
}

function drawPartRotated(ctx, cmds, palette, pivotX, pivotY, angle, dx, dy) {
  if (Math.abs(angle) < 0.001) {
    drawPartFlat(ctx, cmds, palette, dx, dy);
    return;
  }
  ctx.save();
  ctx.translate(pivotX + dx, pivotY + dy);
  ctx.rotate(angle);
  for (const [ci, x, y, w, h] of cmds) {
    ctx.fillStyle = hexColor(palette[ci]);
    ctx.fillRect(x - pivotX, y - pivotY, w, h);
  }
  ctx.restore();
}

function drawLeg(ctx, thighCmds, shinCmds, palette, hipPivot, kneePivot, hipAngle, kneeAngle, dx, dy) {
  drawPartRotated(ctx, thighCmds, palette, hipPivot.x, hipPivot.y, hipAngle, dx, dy);

  ctx.save();
  ctx.translate(hipPivot.x + dx, hipPivot.y + dy);
  ctx.rotate(hipAngle);
  const kneeRelX = kneePivot.x - hipPivot.x;
  const kneeRelY = kneePivot.y - hipPivot.y;
  ctx.translate(kneeRelX, kneeRelY);
  ctx.rotate(kneeAngle);
  for (const [ci, x, y, w, h] of shinCmds) {
    ctx.fillStyle = hexColor(palette[ci]);
    ctx.fillRect(x - kneePivot.x, y - kneePivot.y, w, h);
  }
  ctx.restore();
}

function segmentHoodlumParts(imageData) {
  const { data, width: w, height: h } = imageData;
  const BG = 0xffffff;

  const colorAt = (x, y) => {
    const i = (y * w + x) * 4;
    return rgbToInt(data[i], data[i + 1], data[i + 2]);
  };
  const alphaAt = (x, y) => data[(y * w + x) * 4 + 3];
  const isSolid = (x, y) => {
    const a = alphaAt(x, y);
    if (a < 20) return false;
    const rgb = colorAt(x, y);
    return rgb !== BG;
  };

  const bbox = findBoundingBox(data, w, h, isSolid);
  const centerX = bbox.x + bbox.w / 2;

  const headBottomY = bbox.y + bbox.h * 0.28;
  const shoulderY = bbox.y + bbox.h * 0.34;
  const hipY = bbox.y + bbox.h * 0.60;
  const kneeY = bbox.y + bbox.h * 0.79;

  const armXMargin = bbox.w * 0.22;

  const PART = {
    NONE: -1,
    HEAD: 0,
    TORSO: 1,
    LEFT_ARM: 2,
    RIGHT_ARM: 3,
    LEFT_THIGH: 4,
    LEFT_SHIN: 5,
    RIGHT_THIGH: 6,
    RIGHT_SHIN: 7,
  };

  const partGrid = new Int8Array(w * h);
  partGrid.fill(PART.NONE);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isSolid(x, y)) continue;

      let part = PART.TORSO;
      if (y < headBottomY) {
        part = PART.HEAD;
      } else if (y < hipY) {
        if (x < centerX - armXMargin) part = PART.LEFT_ARM;
        else if (x > centerX + armXMargin) part = PART.RIGHT_ARM;
        else part = PART.TORSO;
      } else {
        const isLeft = x < centerX;
        const isThigh = y < kneeY;
        if (isLeft && isThigh) part = PART.LEFT_THIGH;
        else if (isLeft && !isThigh) part = PART.LEFT_SHIN;
        else if (!isLeft && isThigh) part = PART.RIGHT_THIGH;
        else part = PART.RIGHT_SHIN;
      }

      partGrid[y * w + x] = part;
    }
  }

  // Build palette (excluding BG)
  const counts = new Map();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!isSolid(x, y)) continue;
      const rgb = colorAt(x, y);
      counts.set(rgb, (counts.get(rgb) || 0) + 1);
    }
  }
  const palette = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([rgb]) => rgb);

  const paletteIndex = new Map();
  palette.forEach((rgb, idx) => paletteIndex.set(rgb, idx));

  const partAt = (x, y) => partGrid[y * w + x];

  const HEAD = buildCommandsForPart(PART.HEAD, partAt, colorAt, w, h, paletteIndex);
  const TORSO = buildCommandsForPart(PART.TORSO, partAt, colorAt, w, h, paletteIndex);
  const LEFT_ARM = buildCommandsForPart(PART.LEFT_ARM, partAt, colorAt, w, h, paletteIndex);
  const RIGHT_ARM = buildCommandsForPart(PART.RIGHT_ARM, partAt, colorAt, w, h, paletteIndex);
  const LEFT_THIGH = buildCommandsForPart(PART.LEFT_THIGH, partAt, colorAt, w, h, paletteIndex);
  const LEFT_SHIN = buildCommandsForPart(PART.LEFT_SHIN, partAt, colorAt, w, h, paletteIndex);
  const RIGHT_THIGH = buildCommandsForPart(PART.RIGHT_THIGH, partAt, colorAt, w, h, paletteIndex);
  const RIGHT_SHIN = buildCommandsForPart(PART.RIGHT_SHIN, partAt, colorAt, w, h, paletteIndex);

  const pivots = {
    leftShoulder: { x: centerX - bbox.w * 0.20, y: shoulderY },
    rightShoulder: { x: centerX + bbox.w * 0.16, y: shoulderY },
    leftHip: { x: centerX - bbox.w * 0.10, y: hipY },
    rightHip: { x: centerX + bbox.w * 0.10, y: hipY },
    leftKnee: { x: centerX - bbox.w * 0.10, y: kneeY },
    rightKnee: { x: centerX + bbox.w * 0.10, y: kneeY },
  };

  return {
    w,
    h,
    bbox,
    palette,
    parts: { HEAD, TORSO, LEFT_ARM, RIGHT_ARM, LEFT_THIGH, LEFT_SHIN, RIGHT_THIGH, RIGHT_SHIN },
    pivots,
  };
}

function drawFrameUnscaled(ctx, model, pose, outW, outH) {
  const { parts, palette, pivots, w: srcW, h: srcH } = model;

  const ox = (outW - srcW) / 2;
  const oy = outH - srcH;

  const dx = ox + (pose.bodyDx || 0);
  const dy = oy + (pose.bodyDy || 0);

  const lha = pose.leftHipAngle || 0;
  const lka = pose.leftKneeAngle || 0;
  const rha = pose.rightHipAngle || 0;
  const rka = pose.rightKneeAngle || 0;
  const lsa = pose.leftShoulderAngle || 0;
  const rsa = pose.rightShoulderAngle || 0;

  // Legs behind
  drawLeg(ctx, parts.LEFT_THIGH, parts.LEFT_SHIN, palette, pivots.leftHip, pivots.leftKnee, lha, lka, dx, dy);
  drawLeg(ctx, parts.RIGHT_THIGH, parts.RIGHT_SHIN, palette, pivots.rightHip, pivots.rightKnee, rha, rka, dx, dy);

  // Torso + head
  drawPartFlat(ctx, parts.TORSO, palette, dx, dy);
  drawPartFlat(ctx, parts.HEAD, palette, dx, dy);

  // Arms in front (round swing via shoulder rotation)
  drawPartRotated(ctx, parts.LEFT_ARM, palette, pivots.leftShoulder.x, pivots.leftShoulder.y, lsa, dx, dy);
  drawPartRotated(ctx, parts.RIGHT_ARM, palette, pivots.rightShoulder.x, pivots.rightShoulder.y, rsa, dx, dy);

  return;
}

/**
 * Generate the hoodlum animated spritesheet.
 * Requires a loaded texture named 'hoodlum_src' (loaded from hoodlum.png).
 */
export function generateHoodlumSprite(scene) {
  if (scene.textures.exists('hoodlum')) {
    return {
      textureKey: 'hoodlum',
      frames: { frameWidth: OUT_W, frameHeight: OUT_H },
      animations: {
        walk: {
          key: 'hoodlum_walk',
          frames: [],
          frameRate: 12,
          repeat: -1,
        },
      },
    };
  }

  const tex = scene.textures.get('hoodlum_src');
  const srcImg = tex?.getSourceImage?.();
  if (!srcImg) {
    throw new Error("Missing source texture 'hoodlum_src' (hoodlum.png)");
  }

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = srcImg.width;
  srcCanvas.height = srcImg.height;
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.imageSmoothingEnabled = false;
  srcCtx.clearRect(0, 0, srcCanvas.width, srcCanvas.height);
  srcCtx.drawImage(srcImg, 0, 0);
  const imageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

  const model = segmentHoodlumParts(imageData);

  const scale = OUT_H / model.h;
  const outUnscaledW = OUT_W / scale;
  const outUnscaledH = OUT_H / scale;

  const frames = [...POSES.walk];
  const cols = 2;
  const totalFrames = frames.length;
  const rows = Math.ceil(totalFrames / cols);
  const textureWidth = OUT_W * cols;
  const textureHeight = OUT_H * rows;

  const canvas = document.createElement('canvas');
  canvas.width = textureWidth;
  canvas.height = textureHeight;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Render frames
  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    ctx.save();
    ctx.translate(col * OUT_W, row * OUT_H);
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, outUnscaledW, outUnscaledH);
    drawFrameUnscaled(ctx, model, frames[i], outUnscaledW, outUnscaledH);
    ctx.restore();
  }

  scene.textures.addCanvas('hoodlum', canvas);
  const hoodTex = scene.textures.get('hoodlum');
  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    hoodTex.add(i, 0, col * OUT_W, row * OUT_H, OUT_W, OUT_H);
  }

  const walkFrames = [];
  for (let i = 0; i < totalFrames; i++) {
    walkFrames.push({ key: 'hoodlum', frame: i });
  }

  return {
    textureKey: 'hoodlum',
    frames: { frameWidth: OUT_W, frameHeight: OUT_H },
    animations: {
      walk: {
        key: 'hoodlum_walk',
        frames: walkFrames,
        frameRate: 12,
        repeat: -1,
      },
    },
  };
}
