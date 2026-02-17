import { GAME_HEIGHT, DOOR, ELEVATOR, DRAWBRIDGE, ENEMY, PUSH_BLOCK } from '../config.js';

/**
 * Tutorial Level — "Learning the Ropes"
 *
 * A guided walkthrough that teaches the player every core mechanic
 * via popup dialogue triggered by walking near each obstacle.
 *
 * Layout (left → right):
 *
 *   [G1] [Player]  |wall|  [Block] [T1+Door]  [T2]--drawbridge--  [T3+Elev]
 *                                                    (gap)            ↑
 *   Floor ══════════════════════════════════════════════════════     Upper ═══════[G2 ★]
 *                                                                    [Enemy]
 *
 * Mechanics taught (in order):
 *   1. Movement (A/D / Arrow Keys)
 *   2. Jumping (Space / W) — jump over small wall
 *   3. Push Blocks (F) — grab and push a block
 *   4. Terminal + Door + Block Prop — plug cord to open door, push block
 *      under door to prop it, unplug cord, walk through propped gap
 *   5. Drawbridge — plug cord into terminal to bridge a gap
 *   6. Elevator — plug cord into terminal, ride up
 *   7. Enemies — attack with unplugged cord (E)
 *   8. Goal — reach the broken generator
 */

// ─── Layout Constants ───────────────────────────────────────────
const WORLD_W   = 1700;
const FLOOR_Y   = 550;        // main floor surface
const UPPER_Y   = 340;        // upper ledge surface
const G1_X      = 80;
const PLAYER_X  = 160;

// Section 2: wall to jump over
const WALL_X    = 300;

// Section 3: push block practice (just a free block to push around)
const BLOCK_X   = 440;

// Section 4: door + terminal + block prop
const T1_X      = 560;        // door terminal
const DOOR_X    = 640;        // slide door
const BLOCK2_X  = 510;        // block to prop door with (left of terminal)

// Section 5: drawbridge
const T2_X      = 780;        // drawbridge terminal
const GAP_LEFT  = 840;        // drawbridge gap start
const GAP_RIGHT = 1040;       // drawbridge gap end
const GAP_W     = GAP_RIGHT - GAP_LEFT;

// Section 6: elevator
const T3_X      = 1120;       // elevator terminal
const ELEV_X    = 1180;       // elevator position
const UPPER_LEFT = 1130;      // upper ledge start

// Section 7: enemy
const ENEMY_X   = 1350;

// Section 8: goal
const G2_X      = WORLD_W - 100;

// ─── Level Data ─────────────────────────────────────────────────
export const LEVEL_TUTORIAL = {
  id: 'level_tutorial',
  name: 'Tutorial',
  nextLevel: 'level_01',

  world: { width: WORLD_W, height: GAME_HEIGHT },
  bgColor: '#1a1a2e',

  // ── Platforms ──────────────────────────────────────────
  platforms: [
    // Main floor (left side, up to the gap)
    { x: GAP_LEFT / 2, y: FLOOR_Y + 16, width: GAP_LEFT, height: 32 },

    // Main floor (right side, from gap to just before upper ledge area)
    { x: (GAP_RIGHT + UPPER_LEFT) / 2, y: FLOOR_Y + 16, width: UPPER_LEFT - GAP_RIGHT, height: 32 },

    // Small wall obstacle to jump over (Section 2)
    { x: WALL_X, y: FLOOR_Y - 24, width: 24, height: 48 },

    // Upper ledge (right side — elevator destination to end)
    { x: UPPER_LEFT + (WORLD_W - UPPER_LEFT) / 2, y: UPPER_Y + 16, width: WORLD_W - UPPER_LEFT, height: 32 },

    // Right wall
    { x: WORLD_W - 8, y: GAME_HEIGHT / 2, width: 16, height: GAME_HEIGHT },

    // Left wall
    { x: 8, y: GAME_HEIGHT / 2, width: 16, height: GAME_HEIGHT },

    // Pit floor under gap (so player doesn't fall forever)
    { x: (GAP_LEFT + GAP_RIGHT) / 2, y: GAME_HEIGHT - 16, width: GAP_W + 40, height: 32 },
  ],

  // ── Player ─────────────────────────────────────────────
  player: { x: PLAYER_X, y: FLOOR_Y - 40, generatorId: 'g1' },

  // ── Generators ─────────────────────────────────────────
  generators: [
    { id: 'g1', x: G1_X, y: FLOOR_Y - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: G2_X, y: UPPER_Y - 20, label: 'G2', isPrimary: false },
  ],

  // ── Terminals ──────────────────────────────────────────
  terminals: [
    { id: 't_door',   x: T1_X, y: FLOOR_Y - 16, linkTo: 'door1'   },
    { id: 't_bridge', x: T2_X, y: FLOOR_Y - 16, linkTo: 'bridge1' },
    { id: 't_elev',   x: T3_X, y: FLOOR_Y - 16, linkTo: 'elev1'   },
  ],

  // ── Doors ──────────────────────────────────────────────
  doors: [
    {
      id: 'door1',
      x: DOOR_X,
      y: FLOOR_Y - DOOR.HEIGHT / 2,
    },
  ],

  // ── Drawbridges ────────────────────────────────────────
  drawbridges: [
    {
      id: 'bridge1',
      pivotX: GAP_LEFT,
      pivotY: FLOOR_Y,
      width: GAP_W,
      direction: 'right',
    },
  ],

  // ── Elevators ──────────────────────────────────────────
  elevators: [
    {
      id: 'elev1',
      x: ELEV_X,
      startY: FLOOR_Y - ELEVATOR.HEIGHT / 2,
      endY: UPPER_Y - ELEVATOR.HEIGHT / 2,
    },
  ],

  // ── Enemies ────────────────────────────────────────────
  enemies: [
    {
      id: 'enemy1',
      x: ENEMY_X,
      y: UPPER_Y - ENEMY.HEIGHT / 2,
      rangeLeft: UPPER_LEFT + 40,
      rangeRight: G2_X - 60,
      direction: 'right',
      label: '👾',
    },
  ],

  // ── Push Blocks ────────────────────────────────────────
  pushBlocks: [
    { id: 'block1', x: BLOCK_X,  y: FLOOR_Y - PUSH_BLOCK.SIZE / 2 },
    { id: 'block2', x: BLOCK2_X, y: FLOOR_Y - PUSH_BLOCK.SIZE / 2 },
  ],

  // ── Spikes ─────────────────────────────────────────────
  spikes: [],

  // ── Goal ───────────────────────────────────────────────
  goal: { x: G2_X, y: UPPER_Y - 20 },

  // ── Midground Buildings ────────────────────────────────
  midgroundBuildings: [
    {
      x: 30, y: FLOOR_Y - 20, width: 120, height: 280, color: 0x161630,
      roofDetails: [{ type: 'tank', offsetX: 40 }],
    },
    {
      x: 500, y: FLOOR_Y - 10, width: 200, height: 300, color: 0x14142e,
      roofDetails: [{ type: 'ac', offsetX: 20 }, { type: 'antenna', offsetX: 130 }],
    },
    {
      x: UPPER_LEFT + 10, y: UPPER_Y + 32, width: WORLD_W - UPPER_LEFT - 30, height: 500, color: 0x1e1e3c,
      roofDetails: [
        { type: 'ac', offsetX: 20 }, { type: 'tank', offsetX: 150 },
        { type: 'antenna', offsetX: 300 }, { type: 'dish', offsetX: 450 },
      ],
    },
  ],

  // ══════════════════════════════════════════════════════════
  //  TUTORIAL POPUPS — appear when player is near each zone
  // ══════════════════════════════════════════════════════════
  tutorialPopups: [
    {
      id: 'tut_welcome',
      x: PLAYER_X + 10,
      y: FLOOR_Y - 60,
      width: 120,
      height: 120,
      title: 'Welcome, Electrician!',
      lines: [
        'Repair broken generators across the city.',
        'Use  A / D  or  ← / →  to move.',
      ],
    },
    {
      id: 'tut_jump',
      x: WALL_X - 60,
      y: FLOOR_Y - 60,
      width: 100,
      height: 120,
      title: 'Jumping',
      lines: [
        'There\'s a wall in your way!',
        'Press  SPACE  or  W  to jump over it.',
      ],
    },
    {
      id: 'tut_block',
      x: BLOCK_X - 30,
      y: FLOOR_Y - 60,
      width: 100,
      height: 120,
      title: 'Push Blocks',
      lines: [
        'See that grey block? Walk up to it',
        'and press  F  to grab it.',
        'Then move left/right to push it.',
        'Press  F  again to let go.',
      ],
    },
    {
      id: 'tut_door',
      x: T1_X - 30,
      y: FLOOR_Y - 60,
      width: 100,
      height: 120,
      title: 'Terminals & Doors',
      lines: [
        'Press  E  at the terminal to plug in.',
        'This opens the door! But it closes',
        'when you unplug. Push a block under',
        'the door to prop it open, then unplug!',
      ],
    },
    {
      id: 'tut_drawbridge',
      x: T2_X - 30,
      y: FLOOR_Y - 60,
      width: 80,
      height: 120,
      title: 'Drawbridges',
      lines: [
        'This terminal powers a Drawbridge.',
        'Press  E  to plug in and the',
        'bridge swings across the gap!',
      ],
    },
    {
      id: 'tut_elevator',
      x: T3_X - 30,
      y: FLOOR_Y - 60,
      width: 80,
      height: 120,
      title: 'Elevators',
      lines: [
        'This terminal powers an Elevator.',
        'Unplug the bridge, press  E  here,',
        'then stand on it to ride up!',
      ],
    },
    {
      id: 'tut_enemy',
      x: UPPER_LEFT + 50,
      y: UPPER_Y - 60,
      width: 120,
      height: 120,
      title: 'Enemies & Attacking',
      lines: [
        'An enemy is patrolling — avoid it!',
        'With cord unplugged, press  E  to',
        'swing your plug as a weapon. ZAP!',
      ],
    },
    {
      id: 'tut_goal',
      x: G2_X - 100,
      y: UPPER_Y - 60,
      width: 100,
      height: 120,
      title: 'The Goal',
      lines: [
        'That\'s a broken Generator!',
        'Walk up to repair it and restore',
        'power. Everything is connected!',
      ],
    },
  ],
};
