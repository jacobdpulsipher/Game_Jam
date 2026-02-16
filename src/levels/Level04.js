import { GAME_HEIGHT, PUSH_BLOCK, ELEVATOR, DOOR, SPIKES, DRAWBRIDGE } from '../config.js';

/**
 * Level 04 — "Tower Descent"
 *
 * Layout (ASCII map - read from top to bottom):
 *
 *   Top (Y≈100):    [G1 ★]═══════════════════════════════════
 *                      ↓ (stairs down)
 *   A (Y≈200):      [E1]→  [T1]  (mid-air platform)
 *                      ↓ (fall or E1)
 *   B (Y≈340):         [DB1]  [—elevator tower—]
 *                       /\                |
 *                      /  \             [T2]
 *                 (spikes)         [Mid tower platform]
 *                      ↓
 *   C (Y≈480):      [D1]  [stairs]  [B1]  [B2 floating]
 *                      |              |
 *                      ↓ (if D1 open)
 *   D (Y≈600):      [T3]  [E2→E3 chain]  [DB2 spanning]
 *                                          |
 *   Bottom (Y≈680+): [Spikes bed]  [T4]  [block catches]
 *
 * Multiple routes & solutions:
 *   Route A: Elevator path through tower
 *   Route B: Staircase + drawbridge path
 *   Both converge at bottom where final block puzzle is
 *
 * Difficulty: Hard - requires spatial reasoning, timing, multi-element coordination
 */

const WORLD_W = 1400;
const WORLD_H = 1300;     // Significantly taller than previous levels

// ─── Platform Heights (Y coordinates) ───────────────────────────
const TOP_Y = 100;        // Starting ledge with G1
const LEVEL_A = 200;      // First mid-air platform
const LEVEL_B = 340;      // Drawbridge level
const LEVEL_C = 480;      // Main mid-level
const LEVEL_D = 620;      // Lower platform
const FLOOR_Y = 760;      // Bottom floor
const PIT_BOTTOM = FLOOR_Y + 120;

// ─── Horizontal Sections ────────────────────────────────────────
// Top Section
const G1_X = 100;
const TOP_LEDGE_LEFT = 80;
const TOP_LEDGE_RIGHT = WORLD_W - 80;

// Level A: First air platform with elevator
const E1_X = 200;
const T1_X = 300;
const LEVEL_A_LEFT = 160;
const LEVEL_A_RIGHT = 400;

// Level B: Drawbridge and tower section
const DB1_PIVOT_X = 500;
const DB1_PIVOT_Y = LEVEL_B;
const TOWER_X = 750;        // Vertical elevator tower
const T2_X = 750;
const LEVEL_B_PLATFORM_LEFT = 650;
const LEVEL_B_PLATFORM_RIGHT = 850;

// Level C: Main mid-section with doors and blocks
const D1_X = 300;
const STAIRS_C_X = 450;
const B1_X = 600;
const B2_X = 950;           // Floating block positioned above spikes

// Spikes pit (spans much of the level horizontally)
const SPIKE_ZONE_LEFT = 80;
const SPIKE_ZONE_RIGHT = 500;
const SPIKE_ZONE_CENTER = (SPIKE_ZONE_LEFT + SPIKE_ZONE_RIGHT) / 2;

// Level D: Lower section with second drawbridge
const T3_X = 250;
const E2_X = 600;
const E3_X = 750;           // Chained elevator
const DB2_PIVOT_X = 1000;
const DB2_PIVOT_Y = LEVEL_D;
const T4_X = WORLD_W - 200;

// Bottom: Goal
const G2_X = WORLD_W - 100;
const GOAL_X = G2_X;
const GOAL_Y = TOP_Y - 20;  // Goal at top (like escaping a tower)

// ─── Trigger Zones for Secondary Activation ────────────────────
const TRIGGER_ZONE_1_X = 350;
const TRIGGER_ZONE_1_Y = LEVEL_A + 80;
const TRIGGER_ZONE_2_X = 700;
const TRIGGER_ZONE_2_Y = LEVEL_B + 100;
const TRIGGER_ZONE_3_X = 600;
const TRIGGER_ZONE_3_Y = LEVEL_C + 100;

export const LEVEL_04 = {
  id: 'level_04',
  name: 'Tower Descent',
  nextLevel: null,          // Final level

  world: { width: WORLD_W, height: WORLD_H },
  bgColor: '#0f1419',       // Darker theme for advanced level

  // ── Platforms ──────────────────────────────────────────
  platforms: [
    // TOP LEDGE (starting platform with G1)
    { x: (TOP_LEDGE_LEFT + TOP_LEDGE_RIGHT) / 2, y: TOP_Y + 16, width: TOP_LEDGE_RIGHT - TOP_LEDGE_LEFT, height: 32 },

    // Stairs from top down to Level A (visual assist)
    { x: 120, y: TOP_Y + 60, width: 60, height: 40 },
    { x: 140, y: TOP_Y + 120, width: 60, height: 40 },

    // LEVEL A (mid-air platform with E1)
    { x: (LEVEL_A_LEFT + LEVEL_A_RIGHT) / 2, y: LEVEL_A + 16, width: LEVEL_A_RIGHT - LEVEL_A_LEFT, height: 32 },

    // Tower platform at Level B (support for elevator)
    { x: LEVEL_B_PLATFORM_LEFT + (LEVEL_B_PLATFORM_RIGHT - LEVEL_B_PLATFORM_LEFT) / 2, y: LEVEL_B + 16, width: LEVEL_B_PLATFORM_RIGHT - LEVEL_B_PLATFORM_LEFT, height: 32 },

    // Stairs from top down (alternative path)
    { x: STAIRS_C_X, y: LEVEL_A + 80, width: 60, height: 40 },
    { x: STAIRS_C_X, y: LEVEL_A + 140, width: 60, height: 40 },
    { x: STAIRS_C_X, y: LEVEL_C - 40, width: 60, height: 40 },

    // LEVEL C (main mid-platform, accessible via elevator or stairs)
    { x: 400, y: LEVEL_C + 16, width: 300, height: 32 },
    { x: 750, y: LEVEL_C + 16, width: 300, height: 32 },

    // Spike platforms (allow walking over spikes if careful, but risky)
    // Left spike area platform
    { x: SPIKE_ZONE_CENTER, y: PIT_BOTTOM + 16, width: SPIKE_ZONE_RIGHT - SPIKE_ZONE_LEFT - 20, height: 32 },

    // LEVEL D (lower platform)
    { x: 400, y: LEVEL_D + 16, width: 350, height: 32 },
    { x: 950, y: LEVEL_D + 16, width: 350, height: 32 },

    // Main floor (bottom level with goal)
    { x: WORLD_W / 2, y: FLOOR_Y + 16, width: WORLD_W - 16, height: 32 },

    // Pit floor (blocks fall here)
    { x: (SPIKE_ZONE_LEFT + 800) / 2, y: PIT_BOTTOM + 16, width: 800, height: 32 },

    // Walls
    { x: 8, y: WORLD_H / 2, width: 16, height: WORLD_H },
    { x: WORLD_W - 8, y: WORLD_H / 2, width: 16, height: WORLD_H },

    // Ceiling
    { x: WORLD_W / 2, y: 8, width: WORLD_W, height: 16 },
  ],

  // ── Player ─────────────────────────────────────────────
  player: { x: G1_X + 50, y: TOP_Y - 40, generatorId: 'g1' },

  // ── Generators ─────────────────────────────────────────
  generators: [
    { id: 'g1', x: G1_X, y: TOP_Y - 20, label: 'G1' },
    { id: 'g2', x: G2_X, y: FLOOR_Y - 20, label: 'G2 (Goal)' },
  ],

  // ── Terminals ──────────────────────────────────────────
  terminals: [
    // T1: at Level A, controls E1 (elevator up)
    { id: 't1', x: T1_X, y: LEVEL_A - 16, linkTo: 'e1' },
    // T2: on tower platform, controls main elevator chain
    { id: 't2', x: T2_X, y: LEVEL_B - 16, linkTo: 'e2' },
    // T3: at Level C/D, controls D1 door
    { id: 't3', x: T3_X, y: LEVEL_C - 16, linkTo: 'd1' },
    // T4: on right side lower level, controls DB2
    { id: 't4', x: T4_X, y: LEVEL_D - 16, linkTo: 'db2' },
  ],

  // ── Doors ──────────────────────────────────────────────
  doors: [
    // D1: blocking middle path, requires T3 to open
    {
      id: 'd1',
      x: D1_X,
      y: LEVEL_C - DOOR.HEIGHT / 2,
      direction: 'right',
      range: 200,
    },
  ],

  // ── Elevators ──────────────────────────────────────────
  elevators: [
    // E1: from Level A up to Level B (short segment)
    {
      id: 'e1',
      x: E1_X,
      startY: LEVEL_A - ELEVATOR.HEIGHT / 2,
      endY: LEVEL_B - 100 - ELEVATOR.HEIGHT / 2,
      speed: 80,
      pauseDuration: 600,
    },
    // E2: from Level B down to Level C (long drop)
    {
      id: 'e2',
      x: TOWER_X,
      startY: LEVEL_B - ELEVATOR.HEIGHT / 2,
      endY: LEVEL_C + 200 - ELEVATOR.HEIGHT / 2,
      speed: 90,
      pauseDuration: 700,
    },
    // E3: from Level C down to Level D (continuation)
    {
      id: 'e3',
      x: E3_X,
      startY: LEVEL_C + 50 - ELEVATOR.HEIGHT / 2,
      endY: LEVEL_D - ELEVATOR.HEIGHT / 2,
      speed: 80,
      pauseDuration: 500,
    },
  ],

  // ── Push Blocks ────────────────────────────────────────
  pushBlocks: [
    // B1: on mid-level platform, can be pushed around
    { id: 'b1', x: B1_X, y: LEVEL_C - PUSH_BLOCK.SIZE / 2 },
    // B2: floating above spikes (will fall), player must catch and position
    { id: 'b2', x: B2_X, y: LEVEL_C - 100 },
  ],

  // ── Drawbridges ────────────────────────────────────────
  drawbridges: [
    // DB1: at Level B, connects alternate route over spikes
    {
      id: 'db1',
      pivotX: DB1_PIVOT_X,
      pivotY: DB1_PIVOT_Y,
      width: 200,
      height: 16,
      direction: 'right',
      speed: 100,
    },
    // DB2: at Level D, spans lower section (extended)
    {
      id: 'db2',
      pivotX: DB2_PIVOT_X,
      pivotY: DB2_PIVOT_Y,
      width: 280,
      height: 16,
      direction: 'left',
      speed: 110,
    },
  ],

  // ── Spikes ────────────────────────────────────────────
  spikes: [
    // Large spike pit covering much of the lower-middle section
    {
      id: 'spikes_main',
      x: SPIKE_ZONE_CENTER,
      y: PIT_BOTTOM - SPIKES.HEIGHT / 2,
      width: SPIKE_ZONE_RIGHT - SPIKE_ZONE_LEFT - 20,
    },
    // Secondary spike zone at bottom
    {
      id: 'spikes_bottom',
      x: 200,
      y: FLOOR_Y - SPIKES.HEIGHT / 2,
      width: 300,
    },
  ],

  // ── Trigger Zones ──────────────────────────────────────
  triggerZones: [
    // When player reaches Level A area, unlock E1 path
    {
      id: 'trigger_level_a',
      x: TRIGGER_ZONE_1_X,
      y: TRIGGER_ZONE_1_Y,
      width: 200,
      height: 150,
      triggersIds: ['e1'],
      description: 'Upper tower unlock',
    },
    // When player reaches Level B tower, unlock main descent
    {
      id: 'trigger_level_b',
      x: TRIGGER_ZONE_2_X,
      y: TRIGGER_ZONE_2_Y,
      width: 200,
      height: 150,
      triggersIds: ['e2'],
      description: 'Tower descent unlock',
    },
    // When player reaches mid-level, unlock lower path
    {
      id: 'trigger_level_c',
      x: TRIGGER_ZONE_3_X,
      y: TRIGGER_ZONE_3_Y,
      width: 250,
      height: 150,
      triggersIds: ['e3', 'd1'],
      description: 'Mid-level cascade',
    },
  ],

  // ── Goal ───────────────────────────────────────────────
  goal: { x: GOAL_X, y: GOAL_Y },
};
