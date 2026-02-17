/**
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

// ── Rendering scale ──
// The source character is 48×65 drawn in a 56×72 workspace.
// We scale by 2/3 so frames come out at 38×48, matching the original 48px height.
const SCALE = 2 / 3;
const SRC_W = 56;   // unscaled frame width
const SRC_H = 72;   // unscaled frame height
const W = Math.ceil(SRC_W * SCALE); // 38  — final frame width
const H = Math.ceil(SRC_H * SCALE); // 48  — final frame height

// Offset to center the character within the unscaled workspace
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

  // Draw every animation frame, scaling down from 56×72 workspace to 38×48 output
  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.save();
    ctx.translate(col * W, row * H);
    ctx.scale(SCALE, SCALE);
    drawFrame(ctx, 0, 0, allFrames[i]);
    ctx.restore();
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
