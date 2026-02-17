/**
 * gen-sparky.cjs
 * Reads sparky_parts.json and generates src/assets/SparkySprite.js
 * with 8-part body segmentation and canvas rotation animation.
 */
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sparky_parts.json', 'utf8'));

function fmtPart(name, arr) {
  const items = arr.map(c => `[${c.join(',')}]`);
  return `const ${name} = [\n  ${items.join(',\n  ')}\n];`;
}

const palLines = data.palette.map((p, i) =>
  `  0x${p.hex},  // c${i}: ${p.count}px`
).join('\n');

const partBlocks = Object.entries(data.parts).map(([name, arr]) =>
  fmtPart(name, arr)
).join('\n\n');

const js = `/**
 * SparkySprite.js
 *
 * Generates an animated sprite sheet for "Sparky Joe" the electrician hero.
 * Pixel data extracted from SparkyJoe.png (48×65).
 * 8 body parts with joint pivots for realistic puppet animation.
 * Uses Canvas 2D transforms for proper limb rotation around joints.
 *
 * Body parts: HEAD, TORSO, LEFT_ARM, RIGHT_ARM,
 *             LEFT_THIGH, LEFT_SHIN, RIGHT_THIGH, RIGHT_SHIN
 *
 * Animations: idle (2f), run (8f), grab/push (4f), jump (2f), fall (1f), attack (2f)
 */

// ── Palette (${data.palette.length} colors) ──
const PAL = [
${palLines}
];

const W = 56;   // frame width  (wider to accommodate arm/leg swing)
const H = 72;   // frame height (taller for jump crouch + leg swing)

// Offset to center the 48px character within the 56px frame
const OX = 4;
const OY = 4;

// ── Joint pivot points (in original sprite coordinates) ──
const PIVOT = {
  leftShoulder:  { x: 12, y: 34 },
  rightShoulder: { x: 31, y: 28 },
  leftHip:       { x: 15, y: 46 },
  rightHip:      { x: 27, y: 46 },
  leftKnee:      { x: 14, y: 55 },
  rightKnee:     { x: 30, y: 55 },
};

// ── Body part draw commands: [colorIndex, x, y, w, h] ──
${partBlocks}

// ══════════════════════════════════════════════════════════════
// Animation poses — angles in radians, offsets in pixels
// ══════════════════════════════════════════════════════════════
const D = Math.PI / 180; // degrees → radians

const POSES = {
  // ── IDLE: subtle breathing bounce (2 frames) ──
  idle: [
    {}, // neutral pose
    { bodyDy: -1, headDy: -1 }, // slight upward bob
  ],

  // ── RUN: 8-frame cycle with real arm swing + leg pivot ──
  run: [
    // 0: Right foot contact — left arm forward, right arm back, left leg back, right forward
    {
      bodyDy: 0,
      leftShoulderAngle:  25 * D,
      rightShoulderAngle: -20 * D,
      leftHipAngle:  -30 * D,
      leftKneeAngle:  35 * D,
      rightHipAngle:  20 * D,
      rightKneeAngle: -5 * D,
    },
    // 1: Drive phase
    {
      bodyDy: -1,
      leftShoulderAngle:  15 * D,
      rightShoulderAngle: -10 * D,
      leftHipAngle:  -15 * D,
      leftKneeAngle:  20 * D,
      rightHipAngle:  10 * D,
      rightKneeAngle: 0,
    },
    // 2: Float / crossing
    {
      bodyDy: -2,
      leftShoulderAngle:  0,
      rightShoulderAngle: 0,
      leftHipAngle:  0,
      leftKneeAngle:  5 * D,
      rightHipAngle:  0,
      rightKneeAngle: 5 * D,
    },
    // 3: Left foot reaching
    {
      bodyDy: -1,
      leftShoulderAngle: -15 * D,
      rightShoulderAngle: 10 * D,
      leftHipAngle:  15 * D,
      leftKneeAngle: 0,
      rightHipAngle: -15 * D,
      rightKneeAngle: 15 * D,
    },
    // 4: Left foot contact — mirror of frame 0
    {
      bodyDy: 0,
      leftShoulderAngle: -25 * D,
      rightShoulderAngle: 20 * D,
      leftHipAngle:  20 * D,
      leftKneeAngle: -5 * D,
      rightHipAngle: -30 * D,
      rightKneeAngle: 35 * D,
    },
    // 5: Drive phase (mirror)
    {
      bodyDy: -1,
      leftShoulderAngle: -15 * D,
      rightShoulderAngle: 10 * D,
      leftHipAngle:  10 * D,
      leftKneeAngle: 0,
      rightHipAngle: -15 * D,
      rightKneeAngle: 20 * D,
    },
    // 6: Float / crossing (mirror)
    {
      bodyDy: -2,
      leftShoulderAngle: 0,
      rightShoulderAngle: 0,
      leftHipAngle:  0,
      leftKneeAngle: 5 * D,
      rightHipAngle: 0,
      rightKneeAngle: 5 * D,
    },
    // 7: Right foot reaching
    {
      bodyDy: -1,
      leftShoulderAngle:  15 * D,
      rightShoulderAngle: -10 * D,
      leftHipAngle: -15 * D,
      leftKneeAngle: 15 * D,
      rightHipAngle: 15 * D,
      rightKneeAngle: 0,
    },
  ],

  // ── GRAB/PUSH: 4 frames leaning forward ──
  grab: [
    { bodyDx: 1, leftShoulderAngle: 35*D, rightShoulderAngle: 30*D,
      leftHipAngle: -5*D, rightHipAngle: 5*D },
    { bodyDx: 2, leftShoulderAngle: 45*D, rightShoulderAngle: 40*D,
      leftHipAngle: -10*D, leftKneeAngle: 5*D, rightHipAngle: 10*D },
    { bodyDx: 2, headDy: 1, leftShoulderAngle: 40*D, rightShoulderAngle: 35*D,
      leftHipAngle: -8*D, leftKneeAngle: 5*D, rightHipAngle: 8*D },
    { bodyDx: 1, leftShoulderAngle: 30*D, rightShoulderAngle: 25*D,
      leftHipAngle: -3*D, rightHipAngle: 3*D },
  ],

  // ── JUMP: 2 frames ──
  jump: [
    // Crouch / launch — arms down, knees bend
    { bodyDy: 2, headDy: 1,
      leftShoulderAngle: 15*D, rightShoulderAngle: 15*D,
      leftHipAngle: 15*D, leftKneeAngle: -20*D,
      rightHipAngle: 15*D, rightKneeAngle: -20*D },
    // Airborne — arms thrust UP, legs tuck
    { bodyDy: -2, headDy: -1,
      leftShoulderAngle: -50*D, rightShoulderAngle: -45*D,
      leftHipAngle: 20*D, leftKneeAngle: -30*D,
      rightHipAngle: 15*D, rightKneeAngle: -25*D },
  ],

  // ── FALL: 1 frame — arms flail up, legs spread ──
  fall: [
    { bodyDy: -1,
      leftShoulderAngle: -35*D, rightShoulderAngle: -30*D,
      leftHipAngle: -15*D, leftKneeAngle: 10*D,
      rightHipAngle: 15*D, rightKneeAngle: 10*D },
  ],

  // ── ATTACK: 2 frames (cord strike) ──
  attack: [
    // Wind up — right arm pulls back
    { bodyDx: -1,
      leftShoulderAngle: -20*D, rightShoulderAngle: -35*D },
    // Strike — right arm swings forward
    { bodyDx: 1,
      leftShoulderAngle: 10*D, rightShoulderAngle: 45*D,
      leftHipAngle: -5*D, rightHipAngle: 5*D },
  ],
};

// ══════════════════════════════════════════════════════════════
// Canvas 2D drawing engine with rotation
// ══════════════════════════════════════════════════════════════

/** Convert palette index to CSS hex color string. */
function hexColor(ci) {
  return '#' + PAL[ci].toString(16).padStart(6, '0');
}

/** Draw a body part flat (no rotation). */
function drawPartFlat(ctx, cmds, dx, dy) {
  for (const [ci, x, y, w, h] of cmds) {
    ctx.fillStyle = hexColor(ci);
    ctx.fillRect(x + dx, y + dy, w, h);
  }
}

/** Draw a body part rotated around a pivot point. */
function drawPartRotated(ctx, cmds, pivotX, pivotY, angle, dx, dy) {
  if (Math.abs(angle) < 0.001) {
    drawPartFlat(ctx, cmds, dx, dy);
    return;
  }
  ctx.save();
  ctx.translate(pivotX + dx, pivotY + dy);
  ctx.rotate(angle);
  for (const [ci, x, y, w, h] of cmds) {
    ctx.fillStyle = hexColor(ci);
    ctx.fillRect(x - pivotX, y - pivotY, w, h);
  }
  ctx.restore();
}

/** Draw a two-segment limb (thigh + shin) with hip and knee rotation. */
function drawLeg(ctx, thighCmds, shinCmds, hipPivot, kneePivot, hipAngle, kneeAngle, dx, dy) {
  // Thigh: rotate around hip
  drawPartRotated(ctx, thighCmds, hipPivot.x, hipPivot.y, hipAngle, dx, dy);

  // Shin: chained rotation — first rotate at hip, then at knee
  ctx.save();
  ctx.translate(hipPivot.x + dx, hipPivot.y + dy);
  ctx.rotate(hipAngle);
  const kneeRelX = kneePivot.x - hipPivot.x;
  const kneeRelY = kneePivot.y - hipPivot.y;
  ctx.translate(kneeRelX, kneeRelY);
  ctx.rotate(kneeAngle);
  for (const [ci, x, y, w, h] of shinCmds) {
    ctx.fillStyle = hexColor(ci);
    ctx.fillRect(x - kneePivot.x, y - kneePivot.y, w, h);
  }
  ctx.restore();
}

/**
 * Draw one complete character frame onto the spritesheet canvas.
 */
function drawFrame(ctx, fx, fy, pose) {
  const dx = fx + OX + (pose.bodyDx || 0);
  const dy = fy + OY + (pose.bodyDy || 0);
  const headDy = pose.headDy || 0;

  const lha = pose.leftHipAngle      || 0;
  const lka = pose.leftKneeAngle     || 0;
  const rha = pose.rightHipAngle     || 0;
  const rka = pose.rightKneeAngle    || 0;
  const lsa = pose.leftShoulderAngle || 0;
  const rsa = pose.rightShoulderAngle|| 0;

  // ── Back layer: legs (drawn first, behind torso) ──
  drawLeg(ctx, LEFT_THIGH, LEFT_SHIN,
    PIVOT.leftHip, PIVOT.leftKnee, lha, lka, dx, dy);
  drawLeg(ctx, RIGHT_THIGH, RIGHT_SHIN,
    PIVOT.rightHip, PIVOT.rightKnee, rha, rka, dx, dy);

  // ── Mid layer: torso + head ──
  drawPartFlat(ctx, TORSO, dx, dy);
  drawPartFlat(ctx, HEAD,  dx, dy + headDy);

  // ── Front layer: arms (drawn last, in front) ──
  drawPartRotated(ctx, LEFT_ARM,
    PIVOT.leftShoulder.x, PIVOT.leftShoulder.y, lsa, dx, dy);
  drawPartRotated(ctx, RIGHT_ARM,
    PIVOT.rightShoulder.x, PIVOT.rightShoulder.y, rsa, dx, dy);
}

// ══════════════════════════════════════════════════════════════
// Entry point: generate spritesheet texture + animation config
// ══════════════════════════════════════════════════════════════

/**
 * Main generator — called from PreloadScene.create().
 * @param {Phaser.Scene} scene
 * @returns animation configuration object
 */
export function generateSparkySprite(scene) {
  const cols = 2;

  // Collect all frames in order
  const allFrames = [
    ...POSES.idle,
    ...POSES.run,
    ...POSES.grab,
    ...POSES.jump,
    ...POSES.fall,
    ...POSES.attack,
  ];
  const totalFrames = allFrames.length;
  const rows = Math.ceil(totalFrames / cols);
  const textureWidth  = W * cols;
  const textureHeight = H * rows;

  // Create an off-screen canvas (supports 2D rotation transforms)
  const canvas = document.createElement('canvas');
  canvas.width  = textureWidth;
  canvas.height = textureHeight;
  const ctx = canvas.getContext('2d');

  // Disable image smoothing for crisp pixel art
  ctx.imageSmoothingEnabled = false;

  // Draw every animation frame
  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    drawFrame(ctx, col * W, row * H, allFrames[i]);
  }

  // Register the canvas as a Phaser texture
  scene.textures.addCanvas('electrician', canvas);

  // Add individual frame regions to the texture
  const tex = scene.textures.get('electrician');
  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    tex.add(i, 0, col * W, row * H, W, H);
  }

  // Frame-range helper
  const frameRange = (start, end) => {
    const frames = [];
    for (let i = start; i <= end; i++) {
      frames.push({ key: 'electrician', frame: i });
    }
    return frames;
  };

  // Calculate frame indices for each animation
  let idx = 0;
  const idleStart = idx; idx += POSES.idle.length;
  const runStart  = idx; idx += POSES.run.length;
  const grabStart = idx; idx += POSES.grab.length;
  const jumpStart = idx; idx += POSES.jump.length;
  const fallStart = idx; idx += POSES.fall.length;
  const atkStart  = idx; idx += POSES.attack.length;

  return {
    textureKey: 'electrician',
    frames: { frameWidth: W, frameHeight: H },
    animations: {
      idle:   {
        key: 'idle',
        frames: frameRange(idleStart, idleStart + POSES.idle.length - 1),
        frameRate: 4,
        repeat: -1,
      },
      run:    {
        key: 'run',
        frames: frameRange(runStart, runStart + POSES.run.length - 1),
        frameRate: 14,
        repeat: -1,
      },
      grab:   {
        key: 'grab',
        frames: frameRange(grabStart, grabStart + POSES.grab.length - 1),
        frameRate: 10,
        repeat: -1,
      },
      jump:   {
        key: 'jump',
        frames: [{ key: 'electrician', frame: jumpStart + 1 }],
        frameRate: 18,
        repeat: 0,
      },
      fall:   {
        key: 'fall',
        frames: [{ key: 'electrician', frame: fallStart }],
        frameRate: 10,
        repeat: -1,
      },
      attack: {
        key: 'attack',
        frames: frameRange(atkStart, atkStart + POSES.attack.length - 1),
        frameRate: 12,
        repeat: 0,
      },
    },
  };
}
`;

fs.writeFileSync('src/assets/SparkySprite.js', js, 'utf8');
console.log('Generated src/assets/SparkySprite.js');
console.log('  Total frames:', 2+8+4+2+1+2, '= 19');
