/**
 * SparkySprite.js
 *
 * Generates an animated sprite sheet for "Sparky Joe" the electrician hero.
 * Pixel data extracted from SparkyJoe.png (48×65).
 * 8 body parts with joint pivots for realistic puppet animation using canvas rotation.
 *
 * Body parts: HEAD, TORSO, LEFT_ARM, RIGHT_ARM,
 *             LEFT_THIGH, LEFT_SHIN, RIGHT_THIGH, RIGHT_SHIN
 *
 * Animations: idle (2f), run (8f), grab/push (4f), jump (2f), fall (1f), attack (2f)
 * Total: 19 frames in a 2-column grid
 */

// ── Palette (15 colors) ──
const PAL = [
  0x219ac3,  // c0: 189px
  0x202027,  // c1: 180px
  0x185780,  // c2: 157px
  0xdd845e,  // c3: 147px
  0x8f4a24,  // c4: 142px
  0x161f32,  // c5: 140px
  0x1e719a,  // c6: 81px
  0xf6b238,  // c7: 80px
  0xd87a2f,  // c8: 73px
  0x71412e,  // c9: 71px
  0x1a3957,  // c10: 69px
  0xf4b187,  // c11: 55px
  0x989fa4,  // c12: 54px
  0xc9cecf,  // c13: 43px
  0x595c63,  // c14: 42px
];

const W = 56;  // frame width (wider to accommodate arm/leg swing)
const H = 72;  // frame height (taller for jump crouch + leg swing)

// Offset to center the character in the larger frame
const OX = 4;
const OY = 4;

// ── Joint pivot points ──
const PIVOT = {
  leftShoulder:  { x: 12,  y: 34 },
  rightShoulder: { x: 31, y: 28 },
  leftHip:       { x: 15,  y: 46 },
  rightHip:      { x: 27, y: 46 },
  leftKnee:      { x: 14,  y: 55 },
  rightKnee:     { x: 30, y: 55 },
};

// ── Body part draw commands: [colorIndex, x, y, w, h] ──
const HEAD = [
  [1,20,1,8,1],
  [1,18,2,2,1],
  [8,20,2,3,1],
  [13,23,2,5,1],
  [1,28,2,1,1],
  [9,16,3,1,1],
  [8,17,3,2,1],
  [7,19,3,3,1],
  [8,22,3,1,1],
  [7,23,3,5,1],
  [13,28,3,1,1],
  [1,29,3,1,1],
  [9,15,4,1,1],
  [8,16,4,1,1],
  [7,17,4,6,2],
  [8,23,4,1,2],
  [7,24,4,4,2],
  [11,28,4,1,1],
  [13,29,4,1,1],
  [1,30,4,1,1],
  [1,14,5,1,1],
  [8,15,5,2,1],
  [11,28,5,2,1],
  [13,30,5,1,1],
  [1,31,5,1,1],
  [14,13,6,1,1],
  [4,14,6,1,1],
  [7,15,6,2,2],
  [8,17,6,3,2],
  [7,20,6,4,4],
  [8,24,6,1,4],
  [7,25,6,3,4],
  [13,28,6,1,2],
  [7,29,6,2,4],
  [13,31,6,1,4],
  [1,32,6,1,4],
  [1,13,7,1,3],
  [8,14,7,1,3],
  [7,15,8,1,2],
  [8,16,8,4,2],
  [11,28,8,1,1],
  [13,28,9,1,1],
  [1,12,10,1,1],
  [5,13,10,1,1],
  [8,14,10,18,1],
  [1,32,10,2,1],
  [1,11,11,1,2],
  [8,12,11,7,1],
  [7,19,11,2,1],
  [13,21,11,13,1],
  [1,34,11,1,1],
  [8,12,12,14,1],
  [7,26,12,7,1],
  [8,33,12,2,1],
  [1,35,12,1,1],
  [14,12,13,2,1],
  [1,14,13,1,1],
  [5,15,13,2,1],
  [1,17,13,2,1],
  [9,19,13,4,1],
  [4,23,13,8,1],
  [1,31,13,1,1],
  [12,32,13,1,1],
  [14,33,13,2,1],
  [1,14,14,2,1],
  [5,16,14,1,1],
  [9,17,14,2,1],
  [3,19,14,2,4],
  [9,21,14,4,1],
  [3,25,14,2,3],
  [9,27,14,4,1],
  [5,31,14,1,1],
  [1,14,15,1,3],
  [3,15,15,2,1],
  [4,17,15,2,1],
  [9,21,15,2,1],
  [1,23,15,1,3],
  [9,24,15,1,1],
  [9,27,15,1,1],
  [14,28,15,1,3],
  [1,29,15,1,3],
  [4,30,15,1,1],
  [1,31,15,1,4],
  [3,15,16,1,2],
  [4,16,16,3,2],
  [11,21,16,1,1],
  [3,22,16,1,1],
  [11,24,16,1,1],
  [11,27,16,1,2],
  [11,30,16,1,5],
  [11,21,17,2,1],
  [3,24,17,3,1],
  [5,14,18,1,1],
  [3,15,18,2,1],
  [4,17,18,2,1],
  [3,19,18,3,1],
  [11,22,18,2,1],
  [3,24,18,6,1],
  [1,14,19,2,1],
  [3,16,19,1,1],
  [4,17,19,3,1],
  [3,20,19,5,1],
  [4,25,19,3,1],
  [3,28,19,2,1],
  [5,31,19,1,5],
  [1,14,20,1,1],
  [5,15,20,2,1],
  [4,17,20,4,1],
  [3,21,20,2,1],
  [4,23,20,6,1],
  [3,29,20,1,1],
  [14,15,21,1,1],
  [5,16,21,1,2],
  [4,17,21,7,2],
  [3,24,21,5,1],
  [4,29,21,2,2],
  [1,40,21,3,1],
  [3,24,22,4,1],
  [11,28,22,1,1],
  [13,41,22,1,1],
  [1,42,22,1,2],
  [1,17,23,1,1],
  [9,18,23,2,1],
  [4,20,23,4,1],
  [3,24,23,1,1],
  [4,25,23,2,1],
  [3,27,23,2,1],
  [4,29,23,1,1],
  [9,30,23,1,1],
  [14,38,23,1,1],
  [14,41,23,1,1],
  [1,44,23,1,1],
  [13,45,23,1,1],
  [1,18,24,2,1],
  [9,20,24,2,1],
  [4,22,24,7,1],
  [1,29,24,2,1],
  [1,41,24,1,1],
  [12,44,24,1,1],
  [1,45,24,1,1]
];

const TORSO = [
  [10,11,25,7,1],
  [6,18,25,1,2],
  [5,19,25,1,1],
  [1,20,25,9,1],
  [5,29,25,1,1],
  [14,30,25,1,1],
  [14,9,26,1,1],
  [6,10,26,1,1],
  [0,11,26,6,1],
  [2,17,26,1,2],
  [2,19,26,1,1],
  [5,20,26,1,1],
  [3,21,26,5,1],
  [6,26,26,1,3],
  [0,27,26,4,2],
  [10,8,27,2,1],
  [0,10,27,7,1],
  [6,18,27,3,1],
  [10,21,27,1,1],
  [3,22,27,3,1],
  [4,25,27,1,1],
  [2,8,28,1,1],
  [0,9,28,5,2],
  [6,14,28,1,2],
  [0,15,28,3,2],
  [10,18,28,1,2],
  [0,19,28,2,1],
  [6,21,28,1,1],
  [14,22,28,1,1],
  [3,23,28,2,1],
  [2,25,28,1,1],
  [0,27,28,2,1],
  [6,29,28,1,1],
  [0,30,28,2,1],
  [10,7,29,1,2],
  [6,8,29,1,2],
  [2,19,29,1,1],
  [6,20,29,3,1],
  [14,23,29,2,1],
  [6,25,29,1,1],
  [2,26,29,1,1],
  [10,27,29,1,1],
  [0,28,29,1,1],
  [10,29,29,1,1],
  [0,30,29,3,1],
  [0,9,30,4,1],
  [6,13,30,2,1],
  [0,15,30,4,1],
  [10,19,30,1,1],
  [0,20,30,4,1],
  [6,24,30,1,2],
  [0,25,30,4,1],
  [6,29,30,1,1],
  [5,30,30,1,11],
  [1,6,31,1,3],
  [2,7,31,1,2],
  [0,8,31,5,2],
  [10,13,31,1,3],
  [6,14,31,2,1],
  [0,16,31,8,1],
  [0,25,31,5,1],
  [2,14,32,1,2],
  [6,15,32,1,2],
  [0,16,32,1,1],
  [2,17,32,2,1],
  [7,19,32,1,1],
  [6,20,32,2,1],
  [0,22,32,2,4],
  [2,24,32,1,1],
  [0,25,32,1,4],
  [2,26,32,1,4],
  [11,27,32,1,1],
  [6,28,32,1,1],
  [0,29,32,1,1],
  [6,12,33,1,1],
  [0,16,33,3,1],
  [12,19,33,1,1],
  [0,20,33,1,1],
  [6,21,33,1,3],
  [6,24,33,1,8],
  [12,27,33,1,1],
  [0,28,33,2,1],
  [5,12,34,1,1],
  [2,13,34,1,2],
  [6,14,34,2,2],
  [0,16,34,5,2],
  [0,27,34,3,2],
  [5,11,35,2,1],
  [12,12,36,1,5],
  [2,13,36,2,1],
  [6,15,36,1,1],
  [0,16,36,1,1],
  [6,17,36,1,1],
  [2,18,36,3,1],
  [0,21,36,3,1],
  [0,25,36,2,1],
  [2,27,36,1,1],
  [0,28,36,2,1],
  [2,13,37,3,1],
  [6,16,37,1,2],
  [0,17,37,7,2],
  [0,25,37,5,4],
  [6,13,38,1,2],
  [2,14,38,2,1],
  [2,14,39,3,1],
  [6,17,39,1,1],
  [0,18,39,6,1],
  [1,13,40,3,1],
  [10,16,40,1,1],
  [2,17,40,2,1],
  [0,19,40,5,1],
  [5,11,41,2,1],
  [4,13,41,3,1],
  [5,16,41,1,1],
  [10,17,41,1,1],
  [2,18,41,2,1],
  [6,20,41,9,1],
  [5,29,41,1,1],
  [1,30,41,1,4],
  [5,11,42,4,1],
  [4,15,42,1,1],
  [1,16,42,1,5],
  [9,17,42,4,1],
  [12,21,42,4,1],
  [13,25,42,1,3],
  [5,26,42,1,1],
  [4,27,42,2,1],
  [3,29,42,1,1],
  [5,11,43,2,1],
  [4,13,43,3,3],
  [4,17,43,3,2],
  [9,20,43,1,2],
  [12,21,43,1,3],
  [9,22,43,3,2],
  [1,26,43,1,2],
  [4,27,43,3,2],
  [1,12,44,1,3],
  [5,17,45,4,1],
  [13,22,45,1,1],
  [12,23,45,3,1],
  [5,26,45,1,1],
  [1,27,45,3,1]
];

const LEFT_ARM = [
  [6,7,33,1,1],
  [0,8,33,4,1],
  [1,5,34,1,1],
  [3,6,34,2,1],
  [14,8,34,1,1],
  [6,9,34,3,1],
  [5,4,35,2,1],
  [3,6,35,4,1],
  [14,10,35,1,1],
  [5,4,36,1,1],
  [3,5,36,6,1],
  [1,4,37,1,4],
  [3,5,37,3,1],
  [11,8,37,2,1],
  [1,10,37,1,4],
  [3,5,38,2,4],
  [11,7,38,1,1],
  [3,8,38,1,1],
  [11,9,38,1,1],
  [11,7,39,3,2],
  [14,2,41,2,1],
  [5,4,41,1,1],
  [11,7,41,2,1],
  [1,9,41,1,1],
  [14,10,41,1,1],
  [5,2,42,1,1],
  [10,3,42,1,1],
  [3,4,42,3,3],
  [11,7,42,3,3],
  [1,10,42,1,1],
  [5,1,43,1,5],
  [10,2,43,2,4],
  [3,10,43,1,2],
  [5,11,44,1,2],
  [5,9,45,1,1],
  [1,10,45,1,1]
];

const RIGHT_ARM = [
  [12,39,22,2,4],
  [1,38,24,1,2],
  [14,41,25,1,1],
  [12,42,25,1,1],
  [14,43,25,1,1],
  [13,44,25,2,1],
  [1,46,25,1,3],
  [1,31,26,1,1],
  [1,39,26,1,5],
  [12,40,26,1,1],
  [13,41,26,3,1],
  [12,44,26,2,1],
  [6,31,27,1,1],
  [14,32,27,1,1],
  [12,40,27,5,1],
  [14,45,27,1,1],
  [2,32,28,1,1],
  [5,33,28,1,1],
  [12,40,28,2,2],
  [14,42,28,3,1],
  [1,45,28,1,1],
  [1,33,29,1,1],
  [14,34,29,3,1],
  [3,37,29,2,2],
  [1,42,29,3,1],
  [0,31,30,2,1],
  [11,33,30,4,1],
  [4,40,30,1,1],
  [9,41,30,1,1],
  [14,42,30,1,1],
  [6,31,31,1,1],
  [3,32,31,1,1],
  [11,33,31,3,2],
  [3,36,31,1,2],
  [9,37,31,1,1],
  [1,38,31,1,1],
  [3,39,31,3,1],
  [11,42,31,1,1],
  [3,31,32,2,2],
  [1,37,32,1,2],
  [4,38,32,1,1],
  [9,39,32,1,1],
  [3,40,32,3,1],
  [11,33,33,2,1],
  [3,35,33,2,1],
  [3,38,33,4,1],
  [9,42,33,1,1],
  [3,31,34,5,1],
  [1,36,34,1,2],
  [9,37,34,2,1],
  [4,39,34,1,1],
  [3,40,34,1,1],
  [9,41,34,1,1],
  [1,42,34,1,1],
  [1,31,35,1,1],
  [3,32,35,3,1],
  [9,35,35,1,1],
  [9,37,35,1,1],
  [4,38,35,1,1],
  [3,39,35,1,1],
  [9,40,35,1,1],
  [1,41,35,1,1],
  [14,35,36,1,1],
  [12,36,36,2,1],
  [14,38,36,1,1],
  [1,39,36,2,1],
  [12,35,37,4,1],
  [1,39,37,1,1],
  [1,34,38,2,1],
  [14,36,38,1,1],
  [1,37,38,1,1],
  [12,38,38,1,2],
  [14,39,38,1,1],
  [1,34,39,1,1],
  [14,35,39,1,1],
  [1,36,39,2,1],
  [1,39,39,1,1],
  [12,35,40,1,1],
  [14,36,40,1,1],
  [12,37,40,2,1],
  [14,35,41,1,1],
  [1,36,41,2,1],
  [14,38,41,1,1]
];

const LEFT_THIGH = [
  [3,4,45,4,2],
  [11,8,45,1,2],
  [1,9,46,1,1],
  [5,10,46,2,1],
  [9,13,46,1,1],
  [4,14,46,2,1],
  [2,17,46,4,1],
  [10,2,47,3,1],
  [1,5,47,1,1],
  [3,6,47,4,1],
  [1,10,47,6,1],
  [2,16,47,5,2],
  [5,1,48,2,1],
  [10,3,48,1,1],
  [5,4,48,1,1],
  [1,5,48,5,1],
  [1,11,48,1,3],
  [9,12,48,1,1],
  [4,13,48,2,1],
  [9,15,48,1,2],
  [5,1,49,4,1],
  [4,12,49,3,1],
  [2,16,49,4,1],
  [6,20,49,1,1],
  [1,3,50,1,1],
  [9,12,50,1,1],
  [4,13,50,2,1],
  [2,15,50,4,1],
  [6,19,50,1,1],
  [2,20,50,1,1],
  [12,3,51,1,1],
  [5,12,51,1,4],
  [10,13,51,1,1],
  [2,14,51,6,1],
  [5,20,51,1,2],
  [13,3,52,1,3],
  [2,13,52,7,1],
  [2,13,53,6,1],
  [10,19,53,1,2]
];

const LEFT_SHIN = [
  [1,4,54,1,2],
  [2,13,54,5,2],
  [6,18,54,1,2],
  [5,11,55,1,3],
  [10,12,55,1,1],
  [5,19,55,1,1],
  [12,1,56,1,1],
  [12,3,56,1,1],
  [2,12,56,7,1],
  [5,2,57,1,1],
  [13,3,57,1,1],
  [10,12,57,2,1],
  [2,14,57,2,1],
  [6,16,57,1,1],
  [2,17,57,1,1],
  [10,18,57,1,1],
  [5,11,58,7,1],
  [14,18,58,1,1],
  [5,11,59,1,4],
  [9,12,59,3,2],
  [4,15,59,2,2],
  [1,17,59,1,1],
  [9,17,60,1,1],
  [9,12,61,2,2],
  [4,14,61,5,1],
  [4,14,62,4,1],
  [9,18,62,1,1],
  [5,11,63,8,1]
];

const RIGHT_THIGH = [
  [10,21,46,4,4],
  [2,25,46,2,1],
  [6,27,46,1,1],
  [2,28,46,2,1],
  [1,30,46,1,1],
  [2,25,47,5,2],
  [6,30,47,1,1],
  [5,31,47,1,1],
  [6,30,48,2,1],
  [5,32,48,1,1],
  [2,25,49,6,2],
  [6,31,49,1,2],
  [0,32,49,1,2],
  [5,21,50,4,1],
  [2,33,50,1,2],
  [5,24,51,1,1],
  [10,25,51,1,1],
  [2,26,51,6,1],
  [6,32,51,1,1],
  [5,34,51,1,6],
  [14,25,52,1,1],
  [5,26,52,1,2],
  [2,27,52,6,1],
  [10,27,53,1,1],
  [2,28,53,1,1],
  [10,29,53,1,1]
];

const RIGHT_SHIN = [
  [0,33,52,1,6],
  [2,30,53,3,5],
  [5,27,54,1,4],
  [10,28,54,2,4],
  [1,34,57,1,2],
  [5,27,58,7,1],
  [1,27,59,2,3],
  [9,29,59,1,3],
  [4,30,59,4,1],
  [1,34,59,3,1],
  [4,30,60,6,1],
  [1,36,60,1,1],
  [4,30,61,7,1],
  [1,37,61,1,1],
  [5,27,62,1,1],
  [1,28,62,1,1],
  [9,29,62,2,1],
  [5,31,62,1,1],
  [4,32,62,2,1],
  [9,34,62,2,1],
  [4,36,62,1,1],
  [5,37,62,1,1],
  [1,27,63,1,1],
  [5,28,63,10,1]
];

// ══════════════════════════════════════════════════════════════
// Drawing helpers using Canvas 2D (for rotation support)
// ══════════════════════════════════════════════════════════════

/** Draw a body part onto a canvas context without rotation. */
function drawPartFlat(ctx, cmds, dx, dy) {
  for (const [ci, x, y, w, h] of cmds) {
    ctx.fillStyle = '#' + PAL[ci].toString(16).padStart(6, '0');
    ctx.fillRect(x + dx, y + dy, w, h);
  }
}

/** Draw a body part with rotation around a pivot point.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} cmds - draw commands
 * @param {number} pivotX - pivot X in sprite coords
 * @param {number} pivotY - pivot Y in sprite coords
 * @param {number} angle - rotation in radians
 * @param {number} dx - additional X offset
 * @param {number} dy - additional Y offset
 */
function drawPartRotated(ctx, cmds, pivotX, pivotY, angle, dx, dy) {
  ctx.save();
  ctx.translate(pivotX + dx, pivotY + dy);
  ctx.rotate(angle);
  for (const [ci, x, y, w, h] of cmds) {
    ctx.fillStyle = '#' + PAL[ci].toString(16).padStart(6, '0');
    ctx.fillRect(x - pivotX, y - pivotY, w, h);
  }
  ctx.restore();
}

/**
 * Draw one full character frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} fx - frame top-left X on the canvas
 * @param {number} fy - frame top-left Y on the canvas
 * @param {Object} pose - rotation angles and offsets for each body part
 */
function drawFrame(ctx, fx, fy, pose = {}) {
  const dx = fx + OX + (pose.bodyDx || 0);
  const dy = fy + OY + (pose.bodyDy || 0);

  const headDy = pose.headDy || 0;

  // Left leg (behind body)
  const lha = pose.leftHipAngle || 0;
  const lka = pose.leftKneeAngle || 0;
  // Draw left thigh rotated at hip
  drawPartRotated(ctx, LEFT_THIGH,
    PIVOT.leftHip.x, PIVOT.leftHip.y, lha, dx, dy);
  // Draw left shin: pivot at knee, but knee position depends on thigh rotation
  {
    ctx.save();
    // Move to hip
    ctx.translate(PIVOT.leftHip.x + dx, PIVOT.leftHip.y + dy);
    ctx.rotate(lha);
    // Move from hip to knee (in thigh-rotated space)
    const kneeRelX = PIVOT.leftKnee.x - PIVOT.leftHip.x;
    const kneeRelY = PIVOT.leftKnee.y - PIVOT.leftHip.y;
    ctx.translate(kneeRelX, kneeRelY);
    ctx.rotate(lka);
    // Draw shin relative to knee pivot
    for (const [ci, x, y, w, h] of LEFT_SHIN) {
      ctx.fillStyle = '#' + PAL[ci].toString(16).padStart(6, '0');
      ctx.fillRect(x - PIVOT.leftKnee.x, y - PIVOT.leftKnee.y, w, h);
    }
    ctx.restore();
  }

  // Right leg (behind body)
  const rha = pose.rightHipAngle || 0;
  const rka = pose.rightKneeAngle || 0;
  drawPartRotated(ctx, RIGHT_THIGH,
    PIVOT.rightHip.x, PIVOT.rightHip.y, rha, dx, dy);
  {
    ctx.save();
    ctx.translate(PIVOT.rightHip.x + dx, PIVOT.rightHip.y + dy);
    ctx.rotate(rha);
    const kneeRelX = PIVOT.rightKnee.x - PIVOT.rightHip.x;
    const kneeRelY = PIVOT.rightKnee.y - PIVOT.rightHip.y;
    ctx.translate(kneeRelX, kneeRelY);
    ctx.rotate(rka);
    for (const [ci, x, y, w, h] of RIGHT_SHIN) {
      ctx.fillStyle = '#' + PAL[ci].toString(16).padStart(6, '0');
      ctx.fillRect(x - PIVOT.rightKnee.x, y - PIVOT.rightKnee.y, w, h);
    }
    ctx.restore();
  }

  // Torso (core)
  drawPartFlat(ctx, TORSO, dx, dy);

  // Head
  drawPartFlat(ctx, HEAD, dx, dy + headDy);

  // Left arm (in front of body)
  const lsa = pose.leftShoulderAngle || 0;
  drawPartRotated(ctx, LEFT_ARM,
    PIVOT.leftShoulder.x, PIVOT.leftShoulder.y, lsa, dx, dy);

  // Right arm + tool (in front)
  const rsa = pose.rightShoulderAngle || 0;
  drawPartRotated(ctx, RIGHT_ARM,
    PIVOT.rightShoulder.x, PIVOT.rightShoulder.y, rsa, dx, dy);
}

// ══════════════════════════════════════════════════════════════
// Animation pose definitions
// ══════════════════════════════════════════════════════════════
const DEG = Math.PI / 180;

const POSES = {
  // ── IDLE: subtle breathing bounce (2 frames) ──
  idle: [
    {}, // neutral
    { bodyDy: -1, headDy: -1 }, // slight upward bob
  ],

  // ── RUN: 8-frame cycle with real arm/leg swing ──
  run: [
    // Frame 0: Right foot contact, left leg back
    {
      bodyDy: 0,
      leftShoulderAngle: 25 * DEG,    // left arm forward
      rightShoulderAngle: -20 * DEG,   // right arm back
      leftHipAngle: -30 * DEG,         // left leg back
      leftKneeAngle: 35 * DEG,         // left knee bent
      rightHipAngle: 20 * DEG,         // right leg forward
      rightKneeAngle: -5 * DEG,        // right knee straight
    },
    // Frame 1: Right foot down, passing
    {
      bodyDy: -1,
      leftShoulderAngle: 15 * DEG,
      rightShoulderAngle: -10 * DEG,
      leftHipAngle: -15 * DEG,
      leftKneeAngle: 20 * DEG,
      rightHipAngle: 10 * DEG,
      rightKneeAngle: 0,
    },
    // Frame 2: Mid-stride, both legs crossing
    {
      bodyDy: -2,
      leftShoulderAngle: 0,
      rightShoulderAngle: 0,
      leftHipAngle: 0,
      leftKneeAngle: 5 * DEG,
      rightHipAngle: 0,
      rightKneeAngle: 5 * DEG,
    },
    // Frame 3: Left foot reaching forward
    {
      bodyDy: -1,
      leftShoulderAngle: -15 * DEG,
      rightShoulderAngle: 10 * DEG,
      leftHipAngle: 15 * DEG,
      leftKneeAngle: 0,
      rightHipAngle: -15 * DEG,
      rightKneeAngle: 15 * DEG,
    },
    // Frame 4: Left foot contact, right leg back
    {
      bodyDy: 0,
      leftShoulderAngle: -25 * DEG,   // left arm back
      rightShoulderAngle: 20 * DEG,    // right arm forward
      leftHipAngle: 20 * DEG,          // left leg forward
      leftKneeAngle: -5 * DEG,
      rightHipAngle: -30 * DEG,        // right leg back
      rightKneeAngle: 35 * DEG,        // right knee bent
    },
    // Frame 5: Left foot down, passing
    {
      bodyDy: -1,
      leftShoulderAngle: -15 * DEG,
      rightShoulderAngle: 10 * DEG,
      leftHipAngle: 10 * DEG,
      leftKneeAngle: 0,
      rightHipAngle: -15 * DEG,
      rightKneeAngle: 20 * DEG,
    },
    // Frame 6: Mid-stride crossing (mirror)
    {
      bodyDy: -2,
      leftShoulderAngle: 0,
      rightShoulderAngle: 0,
      leftHipAngle: 0,
      leftKneeAngle: 5 * DEG,
      rightHipAngle: 0,
      rightKneeAngle: 5 * DEG,
    },
    // Frame 7: Right foot reaching forward
    {
      bodyDy: -1,
      leftShoulderAngle: 15 * DEG,
      rightShoulderAngle: -10 * DEG,
      leftHipAngle: -15 * DEG,
      leftKneeAngle: 15 * DEG,
      rightHipAngle: 15 * DEG,
      rightKneeAngle: 0,
    },
  ],

  // ── GRAB/PUSH: 4 frames, leaning forward ──
  grab: [
    // Reaching forward
    {
      bodyDx: 1, headDy: 0,
      leftShoulderAngle: 35 * DEG,
      rightShoulderAngle: 30 * DEG,
      leftHipAngle: -5 * DEG,
      rightHipAngle: 5 * DEG,
    },
    // Pushing hard
    {
      bodyDx: 2, headDy: 0,
      leftShoulderAngle: 45 * DEG,
      rightShoulderAngle: 40 * DEG,
      leftHipAngle: -10 * DEG,
      leftKneeAngle: 5 * DEG,
      rightHipAngle: 10 * DEG,
    },
    // Straining (head dips)
    {
      bodyDx: 2, headDy: 1,
      leftShoulderAngle: 40 * DEG,
      rightShoulderAngle: 35 * DEG,
      leftHipAngle: -8 * DEG,
      leftKneeAngle: 5 * DEG,
      rightHipAngle: 8 * DEG,
    },
    // Recovery
    {
      bodyDx: 1, headDy: 0,
      leftShoulderAngle: 30 * DEG,
      rightShoulderAngle: 25 * DEG,
      leftHipAngle: -3 * DEG,
      rightHipAngle: 3 * DEG,
    },
  ],

  // ── JUMP: 2 frames ──
  jump: [
    // Crouch / launch — arms pull down, knees bend
    {
      bodyDy: 2, headDy: 1,
      leftShoulderAngle: 15 * DEG,
      rightShoulderAngle: 15 * DEG,
      leftHipAngle: 15 * DEG,
      leftKneeAngle: -20 * DEG,
      rightHipAngle: 15 * DEG,
      rightKneeAngle: -20 * DEG,
    },
    // Airborne — arms go UP, legs tuck
    {
      bodyDy: -2, headDy: -1,
      leftShoulderAngle: -50 * DEG,   // arms reach upward
      rightShoulderAngle: -45 * DEG,
      leftHipAngle: 20 * DEG,         // legs tuck forward
      leftKneeAngle: -30 * DEG,       // knees bend
      rightHipAngle: 15 * DEG,
      rightKneeAngle: -25 * DEG,
    },
  ],

  // ── FALL: 1 frame ──
  fall: [
    {
      bodyDy: -1, headDy: 0,
      leftShoulderAngle: -35 * DEG,    // arms flailing up
      rightShoulderAngle: -30 * DEG,
      leftHipAngle: -15 * DEG,         // legs spread
      leftKneeAngle: 10 * DEG,
      rightHipAngle: 15 * DEG,
      rightKneeAngle: 10 * DEG,
    },
  ],

  // ── ATTACK: 2 frames (cord strike) ──
  attack: [
    // Wind up — arms pull back
    {
      bodyDx: -1,
      leftShoulderAngle: -20 * DEG,
      rightShoulderAngle: -35 * DEG,   // right arm pulls way back
    },
    // Strike — right arm swings forward hard
    {
      bodyDx: 1,
      leftShoulderAngle: 10 * DEG,
      rightShoulderAngle: 45 * DEG,    // right arm thrusts forward
      leftHipAngle: -5 * DEG,
      rightHipAngle: 5 * DEG,
    },
  ],
};

// ── Total frame count and layout ──
const totalFrames =
  POSES.idle.length +
  POSES.run.length +
  POSES.grab.length +
  POSES.jump.length +
  POSES.fall.length +
  POSES.attack.length;

console.log('Total frames:', totalFrames);

// ══════════════════════════════════════════════════════════════
// Generate the JS output
// ══════════════════════════════════════════════════════════════

// We need to embed the POSES as serializable data, converting DEG references
function serializePoses(poses) {
  const lines = [];
  for (const [name, frames] of Object.entries(poses)) {
    lines.push(`  ${name}: [`);
    for (const f of frames) {
      const props = [];
      for (const [k, v] of Object.entries(f)) {
        if (typeof v === 'number') {
          // Round to 4 decimal places to keep it clean
          props.push(`${k}: ${Number(v.toFixed(4))}`);
        }
      }
      lines.push(`    { ${props.join(', ')} },`);
    }
    lines.push(`  ],`);
  }
  return lines.join('\n');
}

const posesSerialized = serializePoses(POSES);

const jsOutput = `/**
 * SparkySprite.js
 *
 * Generates an animated sprite sheet for "Sparky Joe" the electrician hero.
 * Pixel data extracted from SparkyJoe.png (${width}×${height}).
 * 8 body parts with joint pivots for realistic puppet animation.
 * Uses Canvas 2D transforms for proper limb rotation around joints.
 *
 * Body parts: HEAD, TORSO, LEFT_ARM, RIGHT_ARM,
 *             LEFT_THIGH, LEFT_SHIN, RIGHT_THIGH, RIGHT_SHIN
 *
 * Animations: idle (2f), run (8f), grab/push (4f), jump (2f), fall (1f), attack (2f)
 * Total: ${totalFrames} frames in a 2-column grid
 */

// ── Palette (${palette.length} colors) ──
const PAL = [
${palette.map(([hex, count], i) => `  0x${hex},  // c${i}: ${count}px`).join('\n')}
];

const W = 56;   // frame width  (wider to accommodate arm/leg swing)
const H = 72;   // frame height (taller for jump crouch + leg swing)

// Offset to center the character within the frame
const OX = 4;
const OY = 4;

// ── Joint pivot points (in original sprite coordinates) ──
const PIVOT = {
  leftShoulder:  { x: ${PIVOTS.LEFT_SHOULDER.x},  y: ${PIVOTS.LEFT_SHOULDER.y} },
  rightShoulder: { x: ${PIVOTS.RIGHT_SHOULDER.x}, y: ${PIVOTS.RIGHT_SHOULDER.y} },
  leftHip:       { x: ${PIVOTS.LEFT_HIP.x},  y: ${PIVOTS.LEFT_HIP.y} },
  rightHip:      { x: ${PIVOTS.RIGHT_HIP.x}, y: ${PIVOTS.RIGHT_HIP.y} },
  leftKnee:      { x: ${PIVOTS.LEFT_KNEE.x},  y: ${PIVOTS.LEFT_KNEE.y} },
  rightKnee:     { x: ${PIVOTS.RIGHT_KNEE.x}, y: ${PIVOTS.RIGHT_KNEE.y} },
};

// ── Body part draw commands: [colorIndex, x, y, w, h] ──
${formatPart(parts.HEAD, 'HEAD')}

${formatPart(parts.TORSO, 'TORSO')}

${formatPart(parts.LEFT_ARM, 'LEFT_ARM')}

${formatPart(parts.RIGHT_ARM, 'RIGHT_ARM')}

${formatPart(parts.LEFT_THIGH, 'LEFT_THIGH')}

${formatPart(parts.LEFT_SHIN, 'LEFT_SHIN')}

${formatPart(parts.RIGHT_THIGH, 'RIGHT_THIGH')}

${formatPart(parts.RIGHT_SHIN, 'RIGHT_SHIN')}

// ── Animation poses (angles in radians) ──
const POSES = {
${posesSerialized}
};

// ══════════════════════════════════════════════════════════════
// Canvas 2D drawing engine
// ══════════════════════════════════════════════════════════════

/** Hex color string from palette index */
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

/** Draw a body part rotated around a pivot. */
function drawPartRotated(ctx, cmds, pivotX, pivotY, angle, dx, dy) {
  if (Math.abs(angle) < 0.001) {
    // No rotation — draw flat for speed
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

/** Draw a two-segment limb (thigh+shin) with hip and knee rotation. */
function drawLeg(ctx, thighCmds, shinCmds, hipPivot, kneePivot, hipAngle, kneeAngle, dx, dy) {
  // Draw thigh rotated at hip
  drawPartRotated(ctx, thighCmds, hipPivot.x, hipPivot.y, hipAngle, dx, dy);

  // Draw shin: chain hip rotation → knee rotation
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
 * Draw one complete character frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} fx - frame top-left X on the spritesheet canvas
 * @param {number} fy - frame top-left Y on the spritesheet canvas
 * @param {Object} pose - angles/offsets for this frame
 */
function drawFrame(ctx, fx, fy, pose) {
  const dx = fx + OX + (pose.bodyDx || 0);
  const dy = fy + OY + (pose.bodyDy || 0);
  const headDy = pose.headDy || 0;

  const lha = pose.leftHipAngle || 0;
  const lka = pose.leftKneeAngle || 0;
  const rha = pose.rightHipAngle || 0;
  const rka = pose.rightKneeAngle || 0;
  const lsa = pose.leftShoulderAngle || 0;
  const rsa = pose.rightShoulderAngle || 0;

  // ── Back layer: legs ──
  drawLeg(ctx, LEFT_THIGH,  LEFT_SHIN,
    PIVOT.leftHip,  PIVOT.leftKnee,  lha, lka, dx, dy);
  drawLeg(ctx, RIGHT_THIGH, RIGHT_SHIN,
    PIVOT.rightHip, PIVOT.rightKnee, rha, rka, dx, dy);

  // ── Mid layer: torso + head ──
  drawPartFlat(ctx, TORSO, dx, dy);
  drawPartFlat(ctx, HEAD,  dx, dy + headDy);

  // ── Front layer: arms ──
  drawPartRotated(ctx, LEFT_ARM,
    PIVOT.leftShoulder.x,  PIVOT.leftShoulder.y,  lsa, dx, dy);
  drawPartRotated(ctx, RIGHT_ARM,
    PIVOT.rightShoulder.x, PIVOT.rightShoulder.y, rsa, dx, dy);
}

// ══════════════════════════════════════════════════════════════
// Entry point: generate spritesheet texture + animation config
// ══════════════════════════════════════════════════════════════

/**
 * Main generator — called from PreloadScene.create().
 * @param {Phaser.Scene} scene
 */
export function generateSparkySprite(scene) {
  const cols = 2;
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

  // Create an off-screen canvas for rotation support
  const canvas = document.createElement('canvas');
  canvas.width  = textureWidth;
  canvas.height = textureHeight;
  const ctx = canvas.getContext('2d');

  // Draw every frame
  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    drawFrame(ctx, col * W, row * H, allFrames[i]);
  }

  // Register the canvas as a Phaser texture
  scene.textures.addCanvas('electrician', canvas);

  // Add individual frame regions
  const tex = scene.textures.get('electrician');
  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    tex.add(i, 0, col * W, row * H, W, H);
  }

  // Build frame-range helper
  const frameRange = (start, end) => {
    const frames = [];
    for (let i = start; i <= end; i++) frames.push({ key: 'electrician', frame: i });
    return frames;
  };

  // Calculate frame indices
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
      idle:   { key: 'idle',   frames: frameRange(idleStart, idleStart + POSES.idle.length - 1),   frameRate: 4,  repeat: -1 },
      run:    { key: 'run',    frames: frameRange(runStart,  runStart  + POSES.run.length  - 1),   frameRate: 14, repeat: -1 },
      grab:   { key: 'grab',   frames: frameRange(grabStart, grabStart + POSES.grab.length - 1),   frameRate: 10, repeat: -1 },
      jump:   { key: 'jump',   frames: [{ key: 'electrician', frame: jumpStart + 1 }],              frameRate: 18, repeat: 0  },
      fall:   { key: 'fall',   frames: [{ key: 'electrician', frame: fallStart }],                  frameRate: 10, repeat: -1 },
      attack: { key: 'attack', frames: frameRange(atkStart,  atkStart  + POSES.attack.length - 1), frameRate: 12, repeat: 0  },
    }
  };
}
`;

fs.writeFileSync('src/assets/SparkySprite.js', jsOutput, 'utf8');
console.log('\nGenerated src/assets/SparkySprite.js');
console.log(`  Frame size: ${56}×${72}, Frames: ${totalFrames}`);
console.log(`  Body parts: ${Object.entries(parts).map(([k,v]) => k + '=' + v.length).join(', ')}`);
