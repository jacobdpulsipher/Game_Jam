import { GAME_HEIGHT, PUSH_BLOCK, ELEVATOR, SPIKES } from '../config.js';

/**
 * Level 02 — "Bridge the Gap"
 *
 * Layout (see ASCII map below):
 *
 *   Top platform:   [E]================================[G2 ★]
 *                    |                                    |
 *                    | (elevator)                         | wall
 *                    |                                    |
 *   Mid platform:       [T2] [B]===========              |
 *                                           \             |
 *                                         steps           |
 *                                             \           |
 *   Floor:      [G1] [•] [T1]  DB  ============steps=====+
 *                             |SPIKE|
 *   Pit floor:                |_____|
 *
 * Solution:
 *   1. Plug cord into T1 → drawbridge swings up to horizontal
 *   2. Walk across drawbridge over spike pit
 *   3. Jump up the steps to reach the mid platform
 *   4. Push block B off the LEFT edge of mid platform (it falls to floor level)
 *   5. Jump down to floor level
 *   6. Unplug T1 → drawbridge swings back down
 *   7. Push block left toward the spike pit → block falls in, covers spikes
 *   8. Jump onto block in the pit, then jump out of pit
 *   9. Climb steps back to mid platform
 *  10. Plug cord into T2 → elevator activates
 *  11. Ride elevator from mid platform to top platform
 *  12. Run right along top platform to G2 → level complete
 */

// ─── Layout Constants ───────────────────────────────────────────
const WORLD_W   = 1300;
const FLOOR_Y   = 580;       // main floor surface
const PIT_DEPTH = 140;       // how deep the spike pit is below floor
const PIT_FLOOR = FLOOR_Y + PIT_DEPTH; // 710 — bottom of the pit
const MID_Y     = 380;       // mid platform surface
const TOP_Y     = 160;       // top platform surface

// Horizontal layout (left to right)
const G1_X       = 80;
const PLAYER_X   = 150;
const T1_X       = 260;
const PIT_LEFT   = 300;      // left edge of the pit
const PIT_RIGHT  = 500;      // right edge of the pit (200px wide)
const PIT_CENTER = (PIT_LEFT + PIT_RIGHT) / 2; // 400
const DB_PIVOT_X = PIT_LEFT; // drawbridge pivots at the left edge

// Steps from pit-right up to mid platform (well right of the pit)
const STEP1_X = 830;  const STEP1_Y = FLOOR_Y - 55;
const STEP2_X = 920;  const STEP2_Y = FLOOR_Y - 120;
const STEP3_X = 1100;  const STEP3_Y = FLOOR_Y - 185;

// Mid platform (left edge well past the pit so block falls onto floor, not into pit)
const MID_LEFT  = 570;
const MID_RIGHT = 920;
const MID_W     = MID_RIGHT - MID_LEFT;

const T2_X      = 660;     // elevator terminal on mid platform
const BLOCK_X   = 780;     // push block on mid platform

// Elevator
const ELEV_X = 570;        // left side of mid platform, travels to top

// Top platform — starts RIGHT of the elevator so player can ride up freely
const TOP_LEFT  = 630;
const TOP_RIGHT = WORLD_W - 16;
const TOP_W     = TOP_RIGHT - TOP_LEFT;

const G2_X = WORLD_W - 80;

// ─── Level Data ─────────────────────────────────────────────────
export const LEVEL_02 = {
  id: 'level_02',
  name: 'Bridge the Gap',
  nextLevel: 'level_03',      // chains to Level 03

  world: { width: WORLD_W, height: GAME_HEIGHT },
  bgColor: '#1a1a2e',

  // ── Platforms ──────────────────────────────────────────
  platforms: [
    // Main floor LEFT (from left wall to pit)
    { x: (16 + PIT_LEFT) / 2,       y: FLOOR_Y + 16,  width: PIT_LEFT - 16,       height: 32 },

    // Main floor RIGHT (from pit to right wall)
    { x: (PIT_RIGHT + WORLD_W - 16) / 2, y: FLOOR_Y + 16, width: WORLD_W - 16 - PIT_RIGHT, height: 32 },

    // Pit floor (bottom of the pit — blocks land here)
    { x: PIT_CENTER,                  y: PIT_FLOOR + 16, width: PIT_RIGHT - PIT_LEFT, height: 32 },

    // Steps (small platforms going up from floor level to mid platform)
    { x: STEP1_X,  y: STEP1_Y + 8,  width: 64, height: 16 },
    { x: STEP2_X,  y: STEP2_Y + 8,  width: 64, height: 16 },
    { x: STEP3_X,  y: STEP3_Y + 8,  width: 64, height: 16 },

    // Mid platform
    { x: MID_LEFT + MID_W / 2,       y: MID_Y + 16,    width: MID_W,  height: 32 },

    // Top platform
    { x: TOP_LEFT + TOP_W / 2,       y: TOP_Y + 16,    width: TOP_W,  height: 32 },

    // Left wall (full height)
    { x: 8,                           y: GAME_HEIGHT / 2, width: 16, height: GAME_HEIGHT },

    // Right wall (full height)
    { x: WORLD_W - 8,                 y: GAME_HEIGHT / 2, width: 16, height: GAME_HEIGHT },

    // Ceiling
    { x: WORLD_W / 2,                 y: 8,              width: WORLD_W, height: 16 },
  ],

  // ── Player ─────────────────────────────────────────────
  player: { x: PLAYER_X, y: FLOOR_Y - 40, generatorId: 'g1' },

  // ── Generators ─────────────────────────────────────────
  generators: [
    { id: 'g1', x: G1_X,   y: FLOOR_Y - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: G2_X,   y: TOP_Y - 20,   label: 'G2', isPrimary: false },
  ],

  // ── Terminals ──────────────────────────────────────────
  terminals: [
    { id: 't_bridge', x: T1_X, y: FLOOR_Y - 16, linkTo: 'bridge1' },
    { id: 't_elev',   x: T2_X, y: MID_Y - 16,   linkTo: 'elev1'   },
  ],

  // ── Drawbridges ────────────────────────────────────────
  drawbridges: [
    {
      id: 'bridge1',
      pivotX: DB_PIVOT_X,
      pivotY: FLOOR_Y,            // pivot at floor level on the left edge of pit
      width: PIT_RIGHT - PIT_LEFT, // spans the full pit
      direction: 'right',          // extends rightward when open
    },
  ],

  // ── Doors ──────────────────────────────────────────────
  doors: [],

  // ── Elevators ──────────────────────────────────────────
  elevators: [
    {
      id: 'elev1',
      x: ELEV_X,
      startY: MID_Y - ELEVATOR.HEIGHT / 2,     // rests at mid platform level
      endY:   TOP_Y - ELEVATOR.HEIGHT / 2,      // travels up to top platform
    },
  ],

  // ── Push Blocks ────────────────────────────────────────
  pushBlocks: [
    { id: 'block1', x: BLOCK_X, y: MID_Y - PUSH_BLOCK.SIZE / 2 },
  ],

  // ── Spikes ─────────────────────────────────────────────
  spikes: [
    {
      id: 'spikes1',
      x: PIT_CENTER,
      y: PIT_FLOOR - SPIKES.HEIGHT / 2,   // sit on pit floor
      width: PIT_RIGHT - PIT_LEFT - 20,   // slightly narrower than pit
    },
  ],

  // ── Generator Links ────────────────────────────────────
  // Define which elements are auto-activated by secondary generators
  generatorLinks: [
    {
      generatorId: 'g2',
      linkedElements: ['elev1'],  // When G2 auto-activates, it powers the elevator
    },
  ],

  // ── Trigger Zones ──────────────────────────────────────
  // Areas the player can walk into to trigger secondary generators
  triggerZones: [
    {
      id: 'trigger_g2',
      x: STEP3_X + 80,           // right side of the final step, leading to top platform
      y: STEP3_Y,
      width: 120,
      height: 100,
      triggersGenerator: 'g2',   // activates the secondary generator G2
      onceOnly: false,           // can be triggered multiple times
      debugVisible: true,        // shows as cyan box in debug mode
    },
  ],

  // ── Goal ───────────────────────────────────────────────
  goal: { x: G2_X, y: TOP_Y - 20 },
};
