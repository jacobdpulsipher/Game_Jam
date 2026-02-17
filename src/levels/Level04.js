import { PUSH_BLOCK, ELEVATOR, TERMINAL } from '../config.js';

/**
 * Level 04 — "Power Climb"
 *
 * Staircase layout — four ascending tiers, left to right:
 *
 *   G1 ──┐  (ledge, top-left)
 *         │
 *         │  (sheer drop)
 *         │
 *   ══════╧═══[ E1 ]═══════════════════════════════════  Tier 0 (y=640)
 *     T1       shaft
 *              [  ↕  ]
 *                        ════════[ E2 ]══════  Tier 1 (y=510)
 *                        T2  B   shaft
 *                                [  ↕  ]
 *                                       ═══════════  Tier 2 (y=350)
 *                                          G2
 *                                                 ═══════  Tier 3 (y=220)
 *                                                   G3 ★
 *
 * Tier gaps:
 *   Tier 0→1: 130px  (block+jump=146px → climbable with block)
 *   Tier 1→2: 160px  (block+jump=146px → NOT climbable, elevator required)
 *   Tier 2→3: 130px  (block+jump=146px → climbable with block)
 *
 * Elevators have "shaft" gaps in the platforms so blocks can ride them
 * without being held up by the adjacent platform. When an elevator is
 * at its rest position (startY), it fills the shaft flush with the tier.
 *
 * Puzzle Solution (11 steps):
 *   1. Drop from G1 ledge to Tier 0
 *   2. Plug cord into T1 → E1 activates (cycles Tier 0 ↔ Tier 1)
 *   3. Ride E1 up to Tier 1, grab Block B
 *   4. Walk Block B onto E1 at Tier 1, ride E1 down to Tier 0
 *   5. Release block on Tier 0, unplug cord from T1 (E1 deactivates)
 *   6. Place Block B near Tier 1 edge, stand on it, jump up to Tier 1
 *   7. On Tier 1, plug cord into T2 → E2 activates
 *   8. Ride E2 up to Tier 2
 *   9. Activate G2 (press E near it) → permanently powers E1 & E2
 *  10. Jump down to Tier 0, push Block onto E1 → Tier 1 → E2 → Tier 2
 *  11. Place Block near Tier 3 edge on Tier 2, climb to G3 → Level Complete!
 *
 * Key mechanics:
 *   - Cord management: plug T1 first, unplug, reuse for T2
 *   - Block transport: use elevator shafts to move block between tiers
 *   - Generator activation: G2 permanently powers E1 & E2 (press E)
 *
 * Difficulty: Medium-Hard
 */

const WORLD_W = 1200;
const WORLD_H = 768;

// ─── Tier Surfaces (Y coordinate where entities walk) ───────────
const G1_LEDGE_Y = 100;     // G1 ledge surface (top-left)
const TIER0_Y    = 640;     // ground floor
const TIER1_Y    = 510;     // 130px above tier 0 (block-climbable)
const TIER2_Y    = 350;     // 160px above tier 1 (elevator only)
const TIER3_Y    = 220;     // 130px above tier 2 (block-climbable)

// ─── Horizontal Spans ───────────────────────────────────────────
// Tier 0 (ground floor) — split by E1 shaft
const T0_LEFT_L  = 16;      // tier 0 left section start
const T0_LEFT_R  = 310;     // tier 0 left section end
const E1_SHAFT_L = 310;     // E1 shaft gap start
const E1_SHAFT_R = 410;     // E1 shaft gap end
const T0_RIGHT_L = 410;     // tier 0 right section start
const T0_RIGHT_R = 1184;    // tier 0 right section end

// Tier 1 — split by E2 shaft
const T1_LEFT_L  = 410;     // tier 1 left section start (= E1 shaft right)
const T1_LEFT_R  = 570;     // tier 1 left section end
const E2_SHAFT_L = 570;     // E2 shaft gap start
const E2_SHAFT_R = 670;     // E2 shaft gap end
const T1_RIGHT_L = 670;     // tier 1 right section start
const T1_RIGHT_R = 780;     // tier 1 right section end

// Tier 2 — continuous
const T2_LEFT    = 670;     // starts at E2 shaft right edge
const T2_RIGHT   = 1030;

// Tier 3 — continuous
const T3_LEFT    = 980;
const T3_RIGHT   = 1184;

// ─── Element Positions ─────────────────────────────────────────
const G1_X     = 100;
const PLAYER_X = 100;

const T1_X     = 200;       // terminal on tier 0 left
const E1_X     = 360;       // elevator center (shaft: 310–410)
const E1_W     = 100;       // wider elevator for block transport

const B_X      = 490;       // push block on tier 1 left
const T2_X     = 450;       // terminal on tier 1 left
const E2_X     = 620;       // elevator center (shaft: 570–670)
const E2_W     = 100;       // wider elevator for block transport

const G2_X     = 850;       // secondary generator on tier 2
const G3_X     = 1080;      // goal generator on tier 3

// ─── Elevator Y Positions ──────────────────────────────────────
// Flush with tier surfaces: elevator surface (center − h/2) = tier Y
// → center = tier Y + ELEVATOR.HEIGHT / 2
const E1_START_Y = TIER0_Y + ELEVATOR.HEIGHT / 2;   // 648 (surface at 640)
const E1_END_Y   = TIER1_Y + ELEVATOR.HEIGHT / 2;   // 518 (surface at 510)
const E2_START_Y = TIER1_Y + ELEVATOR.HEIGHT / 2;   // 518 (surface at 510)
const E2_END_Y   = TIER2_Y + ELEVATOR.HEIGHT / 2;   // 358 (surface at 350)

// ─── Platform Helper ────────────────────────────────────────────
function plat(left, right, surfaceY) {
  const w = right - left;
  return {
    x: left + w / 2,
    y: surfaceY + 16,       // center of 32px-tall platform
    width: w,
    height: 32,
  };
}

// ─── Cord Distance Verification ─────────────────────────────────
// G1 at (100, 80).
//   T1 (200, 624): √(100² + 544²) ≈ 553  < 750  ✓
//   T2 (450, 494): √(350² + 414²) ≈ 542  < 750  ✓

export const LEVEL_04 = {
  id: 'level_04',
  name: 'Power Climb',
  nextLevel: 'level_05',

  world: { width: WORLD_W, height: WORLD_H },
  bgColor: '#121a24',

  // ── Platforms ──────────────────────────────────────────
  platforms: [
    // G1 Ledge (top-left starting platform)
    plat(T0_LEFT_L, 200, G1_LEDGE_Y),

    // Tier 0 ground floor (split by E1 shaft)
    plat(T0_LEFT_L,  T0_LEFT_R,  TIER0_Y),    // left section
    plat(T0_RIGHT_L, T0_RIGHT_R, TIER0_Y),    // right section

    // Tier 1 (split by E2 shaft)
    plat(T1_LEFT_L,  T1_LEFT_R,  TIER1_Y),    // left section
    plat(T1_RIGHT_L, T1_RIGHT_R, TIER1_Y),    // right section

    // Tier 2
    plat(T2_LEFT, T2_RIGHT, TIER2_Y),

    // Tier 3
    plat(T3_LEFT, T3_RIGHT, TIER3_Y),

    // Boundary walls
    { x: 8,            y: WORLD_H / 2, width: 16, height: WORLD_H },  // left
    { x: WORLD_W - 8,  y: WORLD_H / 2, width: 16, height: WORLD_H },  // right

    // Ceiling
    { x: WORLD_W / 2,  y: 8,           width: WORLD_W, height: 16 },
  ],

  // ── Player ─────────────────────────────────────────────
  player: { x: PLAYER_X, y: G1_LEDGE_Y - 40, generatorId: 'g1' },

  // ── Generators ─────────────────────────────────────────
  generators: [
    { id: 'g1', x: G1_X,  y: G1_LEDGE_Y - 20, label: 'G1', isPrimary: true },
    {
      id: 'g2', x: G2_X, y: TIER2_Y - 20, label: 'G2',
      isPrimary: false,
      autoActivateIds: ['e1', 'e2'],  // permanently powers both elevators
    },
    { id: 'g3', x: G3_X,  y: TIER3_Y - 20, label: 'G3' },
  ],

  // ── Terminals ──────────────────────────────────────────
  terminals: [
    // T1: on tier 0, controls E1
    { id: 't1', x: T1_X, y: TIER0_Y - TERMINAL.HEIGHT / 2, linkTo: 'e1' },
    // T2: on tier 1, controls E2
    { id: 't2', x: T2_X, y: TIER1_Y - TERMINAL.HEIGHT / 2, linkTo: 'e2' },
  ],

  // ── Elevators ──────────────────────────────────────────
  elevators: [
    // E1: Tier 0 ↔ Tier 1  (shaft gap in tier 0 floor)
    {
      id: 'e1',
      x: E1_X,
      startY: E1_START_Y,
      endY: E1_END_Y,
      width: E1_W,
      speed: 100,
      pauseDuration: 1200,
      label: 'E1',
    },
    // E2: Tier 1 ↔ Tier 2  (shaft gap in tier 1 floor)
    {
      id: 'e2',
      x: E2_X,
      startY: E2_START_Y,
      endY: E2_END_Y,
      width: E2_W,
      speed: 100,
      pauseDuration: 1200,
      label: 'E2',
    },
  ],

  // ── Push Blocks ────────────────────────────────────────
  pushBlocks: [
    // Block B: starts on tier 1 left — must be transported to tier 2 for final climb
    { id: 'b1', x: B_X, y: TIER1_Y - PUSH_BLOCK.SIZE / 2 },
  ],

  // ── Goal ───────────────────────────────────────────────
  goal: { x: G3_X, y: TIER3_Y - 30 },
};
