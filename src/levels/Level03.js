import { GAME_HEIGHT, PUSH_BLOCK, ELEVATOR, DOOR, SPIKES } from '../config.js';

/**
 * Level 03 — "Power Cascade"
 *
 * Layout (ASCII map):
 *
 *   Top:     [G1] → [T1]     [E1]↑        [Ladder]
 *                              |            |
 *   Upper:                   [E1 ←→ T2]  [E2]↓
 *                                           |
 *   Mid:     [B1]   [D1(cord)]          [T3]
 *                        |
 *   Floor:   [•(player)]  SPIKES   [B2]  [T4/D2]   SPIKES   [★(G2)]
 *
 * Solution (5-6 stages):
 *   1. Plug cord → T1: D1 opens (tethered door)
 *   2. Walk through gap, grab B1, position via cord management
 *   3. Enter trigger zone → E1 + D2 auto-unlock (cascading activation)
 *   4. Ride E1 up, walk across T2 area
 *   5. Jump/push B2 into spike pit to cover spikes
 *   6. Use E2 or stairs to reach upper ledge
 *   7. Reach G2 to complete level
 *
 * Difficulty: Medium - introduces trigger zones and block coordination
 */

const WORLD_W = 1500;
const WORLD_H = GAME_HEIGHT;

// ─── Platform Heights ───────────────────────────────────────────
const FLOOR_Y = 580;       // main floor
const MID_Y = 380;         // mid platform (above main floor)
const UPPER_Y = 180;       // upper ledge (above mid)
const PIT_BOTTOM = FLOOR_Y + 120;

// ─── Horizontal Sections ────────────────────────────────────────
// Start Zone (left)
const G1_X = 80;
const PLAYER_X = 150;
const T1_X = 280;
const D1_X = 320;
const B1_X = 200;
const B1_Y = MID_Y + 60;   // slightly below mid platform

// Middle Zone (spikes, blocks, ladders)
const SPIKE1_LEFT = 380;
const SPIKE1_RIGHT = 480;
const SPIKE1_CENTER = (SPIKE1_LEFT + SPIKE1_RIGHT) / 2;

const E1_X = 620;          // elevator in middle
const T2_X = 700;          // terminal on mid platform
const MID_PLATFORM_LEFT = 550;
const MID_PLATFORM_RIGHT = 850;

const B2_X = 760;          // push block near spikes
const B2_Y = FLOOR_Y - 40;

// Right Zone (spikes, final elevated section)
const SPIKE2_LEFT = 950;
const SPIKE2_RIGHT = 1050;
const SPIKE2_CENTER = (SPIKE2_LEFT + SPIKE2_RIGHT) / 2;

const T3_X = 800;
const T4_X = 1080;
const D2_X = 1000;

const E2_X = 1200;         // elevator on right side
const STAIRS_X = 1300;

const G2_X = WORLD_W - 80;
const GOAL_X = G2_X;
const GOAL_Y = UPPER_Y - 20;

// ─── Trigger Zone ───────────────────────────────────────────────
// When player enters this zone, E1 and D2 auto-activate
const TRIGGER_ZONE_X = 650;
const TRIGGER_ZONE_Y = FLOOR_Y - 100;
const TRIGGER_ZONE_W = 200;
const TRIGGER_ZONE_H = 150;

export const LEVEL_03 = {
  id: 'level_03',
  name: 'Power Cascade',
  nextLevel: 'level_04',

  world: { width: WORLD_W, height: WORLD_H },
  bgColor: '#1a1a2e',

  // ── Platforms ──────────────────────────────────────────
  platforms: [
    // Main floor sections
    { x: 240, y: FLOOR_Y + 16, width: SPIKE1_LEFT - 16, height: 32 },
    { x: (SPIKE1_RIGHT + MID_PLATFORM_LEFT) / 2, y: FLOOR_Y + 16, width: MID_PLATFORM_LEFT - SPIKE1_RIGHT, height: 32 },
    { x: (MID_PLATFORM_RIGHT + SPIKE2_LEFT) / 2, y: FLOOR_Y + 16, width: SPIKE2_LEFT - MID_PLATFORM_RIGHT, height: 32 },
    { x: (SPIKE2_RIGHT + WORLD_W - 16) / 2, y: FLOOR_Y + 16, width: WORLD_W - 16 - SPIKE2_RIGHT, height: 32 },

    // Pit floor (where blocks fall)
    { x: SPIKE1_CENTER, y: PIT_BOTTOM + 16, width: SPIKE1_RIGHT - SPIKE1_LEFT, height: 32 },
    { x: SPIKE2_CENTER, y: PIT_BOTTOM + 16, width: SPIKE2_RIGHT - SPIKE2_LEFT, height: 32 },

    // Mid platform (above start zone, for elevator and access)
    { x: (MID_PLATFORM_LEFT + MID_PLATFORM_RIGHT) / 2, y: MID_Y + 16, width: MID_PLATFORM_RIGHT - MID_PLATFORM_LEFT, height: 32 },

    // Upper ledge (right side, accessible via E2 or stairs)
    { x: 1100 + 200, y: UPPER_Y + 16, width: 400, height: 32 },

    // Stairs (staircase from floor to upper ledge)
    { x: 1290, y: FLOOR_Y - 20, width: 40, height: 40 },
    { x: 1310, y: FLOOR_Y - 80, width: 40, height: 40 },
    { x: 1330, y: FLOOR_Y - 140, width: 40, height: 40 },

    // Walls
    { x: 8, y: WORLD_H / 2, width: 16, height: WORLD_H },
    { x: WORLD_W - 8, y: WORLD_H / 2, width: 16, height: WORLD_H },

    // Ceiling
    { x: WORLD_W / 2, y: 8, width: WORLD_W, height: 16 },
  ],

  // ── Player ─────────────────────────────────────────────
  player: { x: PLAYER_X, y: FLOOR_Y - 40, generatorId: 'g1' },

  // ── Generators ─────────────────────────────────────────
  generators: [
    { id: 'g1', x: G1_X, y: FLOOR_Y - 20, label: 'G1' },
    { id: 'g2', x: G2_X, y: UPPER_Y - 20, label: 'G2' },
  ],

  // ── Terminals ──────────────────────────────────────────
  terminals: [
    // T1: controls door D1 (player must plug cord to open it)
    { id: 't1', x: T1_X, y: FLOOR_Y - 16, linkTo: 'd1' },
    // T2: on mid platform, controls elevator E1
    { id: 't2', x: T2_X, y: MID_Y - 16, linkTo: 'e1' },
    // T3: on right side floor, optional (for testing)
    { id: 't3', x: T3_X, y: FLOOR_Y - 16, linkTo: 'e2' },
    // T4: controls final door D2
    { id: 't4', x: T4_X, y: FLOOR_Y - 16, linkTo: 'd2' },
  ],

  // ── Doors ──────────────────────────────────────────────
  doors: [
    // D1: blocking entry from start (requires cord plug)
    {
      id: 'd1',
      x: D1_X,
      y: FLOOR_Y - DOOR.HEIGHT / 2,
      direction: 'up',
      range: 200,
    },
    // D2: on right side, auto-opens when trigger zone is hit
    {
      id: 'd2',
      x: D2_X,
      y: MID_Y - DOOR.HEIGHT / 2,
      direction: 'left',
      range: 180,
    },
  ],

  // ── Elevators ──────────────────────────────────────────
  elevators: [
    // E1: in middle, controlled by T2, goes from floor to mid platform
    {
      id: 'e1',
      x: E1_X,
      startY: FLOOR_Y - ELEVATOR.HEIGHT / 2,
      endY: MID_Y - ELEVATOR.HEIGHT / 2,
      speed: 100,
    },
    // E2: on right side, goes from floor to upper ledge
    {
      id: 'e2',
      x: E2_X,
      startY: FLOOR_Y - ELEVATOR.HEIGHT / 2,
      endY: UPPER_Y - ELEVATOR.HEIGHT / 2,
      speed: 100,
    },
  ],

  // ── Push Blocks ────────────────────────────────────────
  pushBlocks: [
    // B1: on mid platform, player can grab and move
    { id: 'b1', x: B1_X, y: B1_Y },
    // B2: near spike pit, player must push into pit to cover spikes
    { id: 'b2', x: B2_X, y: B2_Y },
  ],

  // ── Spikes ────────────────────────────────────────────
  spikes: [
    // Spike pit 1 (center-left)
    {
      id: 'spikes1',
      x: SPIKE1_CENTER,
      y: PIT_BOTTOM - SPIKES.HEIGHT / 2,
      width: SPIKE1_RIGHT - SPIKE1_LEFT - 10,
    },
    // Spike pit 2 (right side)
    {
      id: 'spikes2',
      x: SPIKE2_CENTER,
      y: PIT_BOTTOM - SPIKES.HEIGHT / 2,
      width: SPIKE2_RIGHT - SPIKE2_LEFT - 10,
    },
  ],

  // ── Trigger Zones ──────────────────────────────────────
  // When player enters these zones, connected elements auto-activate
  triggerZones: [
    {
      id: 'trigger_cascade',
      x: TRIGGER_ZONE_X,
      y: TRIGGER_ZONE_Y,
      width: TRIGGER_ZONE_W,
      height: TRIGGER_ZONE_H,
      triggersIds: ['e1', 'd2'], // auto-activate E1 & D2
      description: 'Cascade activation zone',
    },
  ],

  // ── Goal ───────────────────────────────────────────────
  goal: { x: GOAL_X, y: GOAL_Y },
};
