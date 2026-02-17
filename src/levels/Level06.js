import { PUSH_BLOCK, ELEVATOR, ENEMY } from '../config.js';

/**
 * Level 06 — "The Gauntlet"
 *
 * Layout (ASCII map):
 *
 *                                                      ████████████████
 *   ════════════════════════════════════════════════════█narrow passage█══
 *   High Plateau (Y=470)                               ████████████████G2
 *   [ledge]  ↑E1   [En1 ←→]  [En2 ←→]  [B1]
 *            ↑
 *   ═══════════════════════════════════════════════════════════════════════
 *   [G1] [P] [T1]   Main Floor (Y=600)
 *
 * Puzzle Solution (14 steps):
 *   1.  Plug cord into T1 → E1 activates
 *   2.  Walk left onto E1, ride up to high plateau
 *   3.  Jump right onto the high plateau
 *   4.  Evade Enemy1 and Enemy2 (cord plugged in — can't zap)
 *   5.  Grab Block B1 on the far right of high plateau
 *   6.  Drag block LEFT through enemy territory (same speed as enemies!)
 *   7.  Push block off left ledge of high plateau → falls to main floor
 *   8.  Jump down to main floor
 *   9.  Walk to T1, unplug cord (E1 stops — cord is free for zapping)
 *  10.  Push block LEFT to ~x=280 (outside plateau shadow)
 *  11.  Stand on block, jump RIGHT → arc above plateau surface → land on plateau
 *  12.  Zap Enemy1 and Enemy2 with the cord
 *  13.  Continue right to narrow passage — zap Enemy3 and Enemy4
 *  14.  Reach G2 → level complete
 *
 * Key mechanics:
 *   - Cord management: must unplug to zap, but elevator needs power
 *   - Block transport: drag block through enemy territory under time pressure
 *   - Enemy timing: both plateau enemies patrol equal 110px zones in sync
 *   - Narrow passage: 76px tall corridor — too low to jump over enemies, must zap
 *
 * Physics verification:
 *   - Platform gap: 600 − 470 = 130px. Block (48) + jump (98) = 146 > 130 ✓
 *   - Block at x=280 (outside plateau shadow starting at x=350):
 *     Block surface = 600 − 48 = 552. Feet at peak = 552 − 98 = 454.
 *     Plateau surface = 470. 454 < 470 → above surface ✓ (16px clearance)
 *   - Player reaches plateau left edge (x=350) at t=0.35s from x=280:
 *     Feet = 552 − 147 + 55.1 = 460.1. 460 < 470 → above ✓ (10px clearance)
 *   - Narrow passage: 470 − 394 = 76px. Player(60px) fits ✓, can't jump over 32px enemy ✓
 *
 * Cord distance:
 *   G1(80, 580) → T1(250, 584): ~170px ✓ (well under 750)
 *
 * Difficulty: Medium-Hard
 */

const WORLD_W = 1300;
const WORLD_H = 768;

const FLOOR_Y = 600;       // main floor surface (continuous)
const PLAT_Y = 470;        // high plateau surface (130px gap)

// ─── High Plateau Bounds ────────────────────────────────────────
const PLAT_LEFT = 350;
const PLAT_RIGHT = 750;
const PLAT_W = PLAT_RIGHT - PLAT_LEFT;   // 400

// ─── Elevator ───────────────────────────────────────────────────
const E1_X = 330;           // center X — right edge (355) overlaps plateau left (350)
const E1_W = 50;            // narrow elevator

// ─── Starting Area (main floor, left side) ──────────────────────
const G1_X = 80;
const PLAYER_X = 160;
const T1_X = 250;

// ─── Enemies on High Plateau ────────────────────────────────────
// Two equal-width, non-overlapping patrol zones (110px each, 30px gap)
// Both start at left edge moving right → perfectly synchronized wave
const EN1_LEFT = 430;
const EN1_RIGHT = 540;
const EN2_LEFT = 570;
const EN2_RIGHT = 680;

// ─── Push Block ─────────────────────────────────────────────────
const B1_X = 720;           // near right edge of plateau

// ─── Narrow Passage ─────────────────────────────────────────────
const NARROW_LEFT = PLAT_RIGHT;           // 750 — starts where plateau ends
const NARROW_RIGHT = 1200;
const NARROW_CEIL_LEFT = NARROW_LEFT;     // 750
const NARROW_CEIL_RIGHT = 1100;           // ceiling stops before G2 (open area)
const NARROW_CEIL_BOTTOM = PLAT_Y - 76;  // 394 — creates 76px corridor
const NARROW_CEIL_W = NARROW_CEIL_RIGHT - NARROW_CEIL_LEFT;         // 350
const NARROW_CEIL_H = NARROW_CEIL_BOTTOM - 16;                      // 378

// ─── Enemies in Narrow Passage ──────────────────────────────────
// Two non-overlapping patrols that meet at x=950
const EN3_LEFT = 790;
const EN3_RIGHT = 950;
const EN4_LEFT = 950;
const EN4_RIGHT = 1100;

// ─── G2 (Goal) ──────────────────────────────────────────────────
const G2_X = 1150;

// ═════════════════════════════════════════════════════════════════

export const LEVEL_06 = {
  id: 'level_06',
  name: 'The Gauntlet',
  nextLevel: null,          // last level (for now)

  world: { width: WORLD_W, height: WORLD_H },
  bgColor: '#141820',

  // ── Platforms ──────────────────────────────────────────
  platforms: [
    // Main floor (continuous, spans entire level)
    {
      x: WORLD_W / 2,
      y: FLOOR_Y + 16,
      width: WORLD_W - 32,
      height: 32,
    },

    // High plateau
    {
      x: PLAT_LEFT + PLAT_W / 2,
      y: PLAT_Y + 16,
      width: PLAT_W,
      height: 32,
    },

    // Narrow passage floor (continues from plateau rightward)
    {
      x: (NARROW_LEFT + NARROW_RIGHT) / 2,
      y: PLAT_Y + 16,
      width: NARROW_RIGHT - NARROW_LEFT,
      height: 32,
    },

    // Narrow passage ceiling (thick slab from world ceiling to corridor ceiling)
    {
      x: (NARROW_CEIL_LEFT + NARROW_CEIL_RIGHT) / 2,
      y: (16 + NARROW_CEIL_BOTTOM) / 2,
      width: NARROW_CEIL_W,
      height: NARROW_CEIL_H,
    },

    // Boundary walls
    { x: 8, y: WORLD_H / 2, width: 16, height: WORLD_H },            // left
    { x: WORLD_W - 8, y: WORLD_H / 2, width: 16, height: WORLD_H },  // right

    // Ceiling
    { x: WORLD_W / 2, y: 8, width: WORLD_W, height: 16 },
  ],

  // ── Player ─────────────────────────────────────────────
  player: { x: PLAYER_X, y: FLOOR_Y - 40, generatorId: 'g1' },

  // ── Generators ─────────────────────────────────────────
  generators: [
    { id: 'g1', x: G1_X, y: FLOOR_Y - 20, label: 'G1', isPrimary: true },
  ],

  // ── Terminals ──────────────────────────────────────────
  terminals: [
    { id: 't1', x: T1_X, y: FLOOR_Y - 16, linkTo: 'e1' },
  ],

  // ── Doors ──────────────────────────────────────────────
  doors: [],

  // ── Elevators ──────────────────────────────────────────
  elevators: [
    {
      id: 'e1',
      x: E1_X,
      startY: FLOOR_Y + ELEVATOR.HEIGHT / 2,   // 608 (surface at 600, flush with floor)
      endY: PLAT_Y + ELEVATOR.HEIGHT / 2,       // 478 (surface at 470, flush with plateau)
      width: E1_W,
      speed: 100,
      pauseDuration: 1000,
      label: 'E1',
    },
  ],

  // ── Push Blocks ────────────────────────────────────────
  pushBlocks: [
    { id: 'b1', x: B1_X, y: PLAT_Y - PUSH_BLOCK.SIZE / 2 },
  ],

  // ── Drawbridges ────────────────────────────────────────
  drawbridges: [],

  // ── Spikes ─────────────────────────────────────────────
  spikes: [],

  // ── Enemies ────────────────────────────────────────────
  enemies: [
    // En1 — left patrol on high plateau (110px range, synced with En2)
    {
      id: 'enemy1',
      x: EN1_LEFT,
      y: PLAT_Y - ENEMY.HEIGHT / 2,
      rangeLeft: EN1_LEFT,
      rangeRight: EN1_RIGHT,
      direction: 'right',
      speed: 60,
      label: '👾',
    },
    // En2 — right patrol on high plateau (110px range, synced with En1)
    {
      id: 'enemy2',
      x: EN2_LEFT,
      y: PLAT_Y - ENEMY.HEIGHT / 2,
      rangeLeft: EN2_LEFT,
      rangeRight: EN2_RIGHT,
      direction: 'right',
      speed: 60,
      label: '👾',
    },
    // En3 — left patrol in narrow passage
    {
      id: 'enemy3',
      x: 860,
      y: PLAT_Y - ENEMY.HEIGHT / 2,
      rangeLeft: EN3_LEFT,
      rangeRight: EN3_RIGHT,
      direction: 'right',
      speed: 60,
      label: '👾',
    },
    // En4 — right patrol in narrow passage (meets En3 at x=950)
    {
      id: 'enemy4',
      x: 1020,
      y: PLAT_Y - ENEMY.HEIGHT / 2,
      rangeLeft: EN4_LEFT,
      rangeRight: EN4_RIGHT,
      direction: 'left',
      speed: 60,
      label: '👾',
    },
  ],

  // ── Goal ───────────────────────────────────────────────
  goal: { x: G2_X, y: PLAT_Y - 20 },

  // ── Mentor NPC (Voltage Jack — rescue target) ──────────
  mentor: {
    x: G2_X,
    y: PLAT_Y,
    textureKey: 'mentor_small',
    lines: [
      'Thank goodness you saved me!',
      'These hoodlums are seeking out revenge',
      'for all of their friends I zapped!',
      'They are tearing this city apart.',
      'Sparky Joe. I need your help.',
      'I need your help to save the day.',
    ],
  },

  // ── Midground Buildings ────────────────────────────────
  midgroundBuildings: [
    // Behind starting area (under G1 / player)
    {
      x: 16, y: FLOOR_Y + 32, width: 150, height: 200, color: 0x161630,
      roofDetails: [
        { type: 'tank', offsetX: 40 },
        { type: 'pipes', offsetX: 100, width: 25 },
      ],
    },
    // Behind elevator area
    {
      x: 270, y: FLOOR_Y + 32, width: 120, height: 180, color: 0x14142e,
      roofDetails: [
        { type: 'ac', offsetX: 15 },
        { type: 'antenna', offsetX: 80 },
      ],
    },
    // Under high plateau
    {
      x: PLAT_LEFT, y: PLAT_Y + 32, width: PLAT_W, height: 170, color: 0x1e1e3c,
      roofDetails: [
        { type: 'fire_escape', offsetX: 0, width: 18 },
        { type: 'ac', offsetX: 120 },
        { type: 'dish', offsetX: 280 },
        { type: 'neon_sign', offsetX: 180, offsetY: 50, width: 30, neonColor: 0xff4466 },
      ],
    },
    // Under narrow passage
    {
      x: 900, y: PLAT_Y + 32, width: 300, height: 170, color: 0x191838,
      roofDetails: [
        { type: 'tank', offsetX: 40 },
        { type: 'ac', offsetX: 160 },
        { type: 'pipes', offsetX: 240, width: 30 },
      ],
    },
    // Behind G2 area
    {
      x: 1120, y: PLAT_Y + 32, width: 150, height: 170, color: 0x1c1c3a,
      roofDetails: [
        { type: 'antenna', offsetX: 80 },
        { type: 'tank', offsetX: 30 },
      ],
    },
  ],

  // ── Lampposts ──────────────────────────────────────────
  lampposts: [
    { x: 180, y: FLOOR_Y },
    { x: 500, y: FLOOR_Y },
    { x: 850, y: FLOOR_Y },
  ],

  // ── Decorations (atmospheric only) ─────────────────────
  decorations: [
    { type: 'puddle', x: 420, y: FLOOR_Y, width: 25 },
    { type: 'steam_vent', x: 1050, y: FLOOR_Y },
  ],
};
