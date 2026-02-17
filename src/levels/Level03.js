import { PUSH_BLOCK, ELEVATOR, DOOR, HEAVY_BLOCK, PLAYER } from '../config.js';

/**
 * Level 03 — "Dead Weight"
 *
 * Single-floor layout with an offset push-block barrier:
 *
 *   [G1] [P] [T1] [E1↑]    [HW1]          [T2] [D1] [G2]
 *                            [ B1 ]→
 *   ══════════════════════════════════════════════════════
 *
 *   HW1 sits on B1. Together they form a 120px barrier (unjumpable).
 *   B1 is offset 38px to the RIGHT of HW1's center, so its right
 *   half protrudes past HW1's right edge.
 *
 *   From the LEFT:  player pushed against HW1 → dx to B1 = 76px > 72px
 *                   → CANNOT grab B1 (out of range).  ✓
 *   From the RIGHT: player walks through B1 (background) → hits HW1
 *                   → dx to B1 = 0px → CAN grab B1.   ✓
 *
 * Solution:
 *   1. Plug cord into T1 → E1 elevator activates
 *   2. Ride E1 up, jump right — arc clears the 120px barrier
 *   3. Land on floor past the barrier; discover B1 exposed on the right
 *   4. Press F next to B1 to grab it, pull right — HW1 loses support, drops
 *   5. HW1 is now 72px on the floor (jumpable — 98px max jump)
 *   6. Jump left over HW1, walk to T1, unplug cord (press E)
 *   7. Walk right, jump over HW1 again, plug cord into T2 → D1 opens
 *   8. Walk through D1 to goal
 *
 * Difficulty: Medium
 */

const WORLD_W = 1100;
const WORLD_H = 500;

// ─── Floor ──────────────────────────────────────────────────────
const FLOOR_Y = 380;      // floor surface Y

// ─── Horizontal Positions ───────────────────────────────────────
const G1_X = 100;
const PLAYER_X = 200;
const T1_X = 340;
const E1_X = 440;

const HW1_X = 580;       // heavy block center
const B1_X = HW1_X + 38; // push block offset right → 618

const T2_X = 800;
const D1_X = 900;
const G2_X = 1020;

// ─── Derived Y Positions ────────────────────────────────────────
const B1_Y  = FLOOR_Y - PUSH_BLOCK.SIZE / 2;                           // 356
// HW1 spawns 10px above its resting position so it properly falls onto
// B1's topPlatform (avoids spawning at the exact boundary and falling through)
const HW1_Y = FLOOR_Y - PUSH_BLOCK.SIZE - HEAVY_BLOCK.HEIGHT / 2 - 10; // 286

const E1_START_Y = FLOOR_Y - ELEVATOR.HEIGHT / 2;                      // 372
const E1_END_Y   = 120;

// ─── Physics Verification ───────────────────────────────────────
//
// B1 topPlatform surface: FLOOR_Y - PUSH_BLOCK.SIZE/2 - PUSH_BLOCK.SIZE/2 - 4
//   = 380 - 24 - 24 - 4 = 328
// HW1 body bottom at spawn: 286 + 36 = 322 < 328 → no initial overlap
// HW1 falls 6px and lands on topPlatform → body bottom = 328
//
// Barrier (stacked on topPlatform):
//   HW1 body top = 328 - 72 = 256
//   Player peak body bottom = 380 - 98 = 282
//   256 < 282 → barrier ABOVE player peak → UNJUMPABLE  ✓
//
// HW1 skirt body: from HW1 bottom (328) down 48px to 376
// Player body: [332, 380]. Overlap with skirt: [332, 376] = 44px
// → Player blocked horizontally by skirt  ✓
//
// After B1 pulled:
//   HW1 drops to floor. HW1 top = 380 - 72 = 308
//   Player peak = 282.  282 < 308 → player IS above barrier → JUMPABLE  ✓
//   Clearance: 308 - 282 = 26px
//   Skirt now at [380, 428] — below floor, no overlap with player. ✓
//
// Elevator arc:
//   E1 surface at top = 120 - 8 = 112
//   Player center on elevator ≈ 112 - PLAYER.HEIGHT/2 = 88
//   Barrier top = 260.  88 ≪ 260 → player clears from elevator  ✓
//
// Grab range (isPlayerInRange: dx ≤ 72, dy ≤ 32):
//   Left side:  player stopped by skirt at skirt_left - PLAYER.WIDTH/2
//               = (580-24) - 14 = 542.   dx = |618-542| = 76 > 72  BLOCKED ✓
//   Right side: player stopped by skirt at skirt_right + PLAYER.WIDTH/2
//               = (580+24) + 14 = 618.   dx = |618-618| = 0 ≤ 72  OK     ✓
//
// Cord lengths:
//   G1(100) → T1(340) = 240 ≤ 750  ✓
//   G1(100) → T2(800) = 700 ≤ 750  ✓

export const LEVEL_03 = {
  id: 'level_03',
  name: 'Dead Weight',
  nextLevel: 'level_04',

  world: { width: WORLD_W, height: WORLD_H },
  bgColor: '#141824',

  platforms: [
    // === FLOOR ===
    { x: WORLD_W / 2, y: FLOOR_Y + 16, width: WORLD_W - 32, height: 32 },

    // === BOUNDARY WALLS ===
    { x: 8, y: WORLD_H / 2, width: 16, height: WORLD_H },            // left
    { x: WORLD_W - 8, y: WORLD_H / 2, width: 16, height: WORLD_H },  // right

    // === CEILING ===
    { x: WORLD_W / 2, y: 8, width: WORLD_W, height: 16 },
  ],

  player: { x: PLAYER_X, y: FLOOR_Y - 40, generatorId: 'g1' },

  generators: [
    { id: 'g1', x: G1_X, y: FLOOR_Y - 20, label: 'G1' },
    // Goal marker generator (matches other levels where reaching G2 completes the level)
    { id: 'g2', x: G2_X, y: FLOOR_Y - 20, label: 'G2' },
  ],

  terminals: [
    { id: 't1', x: T1_X, y: FLOOR_Y - 16, linkTo: 'e1' },
    { id: 't2', x: T2_X, y: FLOOR_Y - 16, linkTo: 'd1' },
  ],

  doors: [
    {
      id: 'd1',
      x: D1_X,
      y: FLOOR_Y - DOOR.HEIGHT / 2,
      direction: 'up',
      range: 160,
    },
  ],

  elevators: [
    {
      id: 'e1',
      x: E1_X,
      startY: E1_START_Y,
      endY: E1_END_Y,
      speed: 80,
      pauseDuration: 1200,
      label: 'E1',
    },
  ],

  pushBlocks: [
    { id: 'b1', x: B1_X, y: B1_Y },
  ],

  heavyBlocks: [
    {
      id: 'hw1',
      x: HW1_X,
      y: HW1_Y,
      width: HEAVY_BLOCK.WIDTH,
      height: HEAVY_BLOCK.HEIGHT,
    },
  ],

  goal: { x: G2_X, y: FLOOR_Y - 20 },

  // ── Midground Buildings ────────────────────────────────
  midgroundBuildings: [
    // Behind generator / player area
    {
      x: 30, y: FLOOR_Y + 32, width: 180, height: 200, color: 0x161630,
      roofDetails: [
        { type: 'tank', offsetX: 50 },
        { type: 'pipes', offsetX: 120, width: 25 },
      ],
    },
    // Behind elevator area
    {
      x: 370, y: FLOOR_Y + 32, width: 150, height: 180, color: 0x14142e,
      roofDetails: [
        { type: 'ac', offsetX: 15 },
        { type: 'dish', offsetX: 100 },
      ],
    },
    // Behind heavy block / barrier area
    {
      x: 530, y: FLOOR_Y + 32, width: 190, height: 200, color: 0x1e1e3c,
      roofDetails: [
        { type: 'fire_escape', offsetX: 0, width: 18 },
        { type: 'ac', offsetX: 80 },
        { type: 'antenna', offsetX: 150 },
      ],
    },
    // Behind door / goal area
    {
      x: 850, y: FLOOR_Y + 32, width: 230, height: 190, color: 0x191838,
      roofDetails: [
        { type: 'tank', offsetX: 30 },
        { type: 'neon_sign', offsetX: 100, offsetY: 40, width: 30, neonColor: 0x44aaff },
        { type: 'pipes', offsetX: 180, width: 30 },
      ],
    },
  ],

  // ── Lampposts ──────────────────────────────────────────
  lampposts: [
    { x: 250, y: FLOOR_Y },
    { x: 670, y: FLOOR_Y },
    { x: 950, y: FLOOR_Y },
  ],

  // ── Decorations (atmospheric only) ─────────────────────
  decorations: [
    { type: 'puddle', x: 760, y: FLOOR_Y, width: 25 },
    { type: 'steam_vent', x: 960, y: FLOOR_Y },
  ],
};
