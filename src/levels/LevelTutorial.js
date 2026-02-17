import { GAME_HEIGHT, DOOR, ELEVATOR, DRAWBRIDGE, ENEMY, PUSH_BLOCK } from '../config.js';

/**
 * Tutorial — eight self-contained mini-levels, one per mechanic.
 * Each is a tiny room the player can complete in seconds.
 * They chain together: tut_1 → tut_2 → … → tut_8 → level_01.
 */

// ── Shared constants ────────────────────────────────────────────
const W   = 600;          // small world width for each mini level
const FY  = 550;          // floor Y
const GH  = GAME_HEIGHT;

// ═════════════════════════════════════════════════════════════════
//  Tutorial 1 — Movement
//  Just walk right to the goal generator.
// ═════════════════════════════════════════════════════════════════
export const TUT_01 = {
  id: 'tut_1',
  name: 'Tutorial: Movement',
  nextLevel: 'tut_2',
  world: { width: W, height: GH },
  bgColor: '#1a1a2e',
  platforms: [
    { x: W / 2, y: FY + 16, width: W, height: 32 },
    { x: 8,     y: GH / 2,  width: 16, height: GH },
    { x: W - 8, y: GH / 2,  width: 16, height: GH },
  ],
  player: { x: 80, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: 40,    y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: W - 60, y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [],
  pushBlocks: [],
  spikes: [],
  goal: { x: W - 60, y: FY - 20 },
  tutorialPopups: [
    {
      id: 'tut1_move',
      x: 120, y: FY - 60, width: 200, height: 120,
      title: 'Movement',
      speakerName: 'Mentor',
      portraitKey: 'mentor_face',
      lines: [
        'Use  A / D  or  ← / →  to walk.',
        'Head right to the generator!',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 2 — Jumping
//  Jump over a wall to reach the goal.
// ═════════════════════════════════════════════════════════════════
export const TUT_02 = {
  id: 'tut_2',
  name: 'Tutorial: Jumping',
  nextLevel: 'tut_3',
  world: { width: W, height: GH },
  bgColor: '#1a1a2e',
  platforms: [
    { x: W / 2, y: FY + 16, width: W, height: 32 },
    { x: 8,     y: GH / 2,  width: 16, height: GH },
    { x: W - 8, y: GH / 2,  width: 16, height: GH },
    // Wall obstacle
    { x: W / 2, y: FY - 24, width: 24, height: 48 },
  ],
  player: { x: 80, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: 40,    y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: W - 60, y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [],
  pushBlocks: [],
  spikes: [],
  goal: { x: W - 60, y: FY - 20 },
  tutorialPopups: [
    {
      id: 'tut2_jump',
      x: W / 2 - 80, y: FY - 60, width: 120, height: 120,
      title: 'Jumping',
      speakerName: 'Mentor',
      portraitKey: 'mentor_face',
      lines: [
        'Press  SPACE  or  W  to jump.',
        'Hop over the wall!',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 3 — Push Blocks
//  Push a block out of the way to reach the goal.
// ═════════════════════════════════════════════════════════════════
const T3_LEDGE_Y = 420;          // elevated ledge surface (unreachable from floor)
export const TUT_03 = {
  id: 'tut_3',
  name: 'Tutorial: Push Blocks',
  nextLevel: 'tut_4',
  world: { width: W, height: GH },
  bgColor: '#1a1a2e',
  platforms: [
    // Main floor
    { x: W / 2, y: FY + 16, width: W, height: 32 },
    // Elevated ledge on the right — too high to reach by jumping alone
    { x: 460, y: T3_LEDGE_Y + 16, width: 260, height: 32 },
    // Walls
    { x: 8,     y: GH / 2,  width: 16, height: GH },
    { x: W - 8, y: GH / 2,  width: 16, height: GH },
  ],
  player: { x: 80, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: 40,    y: FY - 20,       label: 'G1', isPrimary: true },
    { id: 'g2', x: 500,   y: T3_LEDGE_Y - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [],
  pushBlocks: [
    { id: 'block1', x: 240, y: FY - PUSH_BLOCK.SIZE / 2 },
  ],
  spikes: [],
  goal: { x: 500, y: T3_LEDGE_Y - 20 },
  tutorialPopups: [
    {
      id: 'tut3_block',
      x: 160, y: FY - 60, width: 160, height: 120,
      title: 'Push Blocks',
      speakerName: 'Mentor',
      portraitKey: 'mentor_face',
      lines: [
        'Walk up to the block and press  F',
        'to grab it. Push it to the ledge,',
        'then jump on the block to reach',
        'the generator above!',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 4 — Terminals & Doors
//  Plug cord into terminal to open door. Push block under door
//  to prop it, unplug, walk through the propped gap.
// ═════════════════════════════════════════════════════════════════
const T4_TERM = 220;
const T4_DOOR = 300;
export const TUT_04 = {
  id: 'tut_4',
  name: 'Tutorial: Doors',
  nextLevel: 'tut_5',
  world: { width: W, height: GH },
  bgColor: '#1a1a2e',
  platforms: [
    { x: W / 2, y: FY + 16, width: W, height: 32 },
    { x: 8,     y: GH / 2,  width: 16, height: GH },
    { x: W - 8, y: GH / 2,  width: 16, height: GH },
  ],
  player: { x: 80, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: 40,    y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: W - 60, y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [
    { id: 't_door', x: T4_TERM, y: FY - 16, linkTo: 'door1' },
  ],
  doors: [
    { id: 'door1', x: T4_DOOR, y: FY - DOOR.HEIGHT / 2 },
  ],
  drawbridges: [],
  elevators: [],
  enemies: [],
  pushBlocks: [
    { id: 'block1', x: 160, y: FY - PUSH_BLOCK.SIZE / 2 },
  ],
  spikes: [],
  goal: { x: W - 60, y: FY - 20 },
  tutorialPopups: [
    {
      id: 'tut4_door',
      x: 140, y: FY - 60, width: 180, height: 120,
      title: 'Terminals & Doors',
      speakerName: 'Mentor',
      portraitKey: 'mentor_face',
      lines: [
        'Press  E  at the red terminal',
        'to plug in — the door opens!',
        'Push the block under the door,',
        'then unplug (E) and walk through.',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 5 — Drawbridge
//  Plug cord to swing a drawbridge across a gap.
// ═════════════════════════════════════════════════════════════════
const T5_W      = 700;
const T5_TERM   = 200;
const T5_GAP_L  = 260;
const T5_GAP_R  = 440;
const T5_GAP_W  = T5_GAP_R - T5_GAP_L;
const T5_PIT_Y  = 640;           // shallow pit floor surface
export const TUT_05 = {
  id: 'tut_5',
  name: 'Tutorial: Drawbridge',
  nextLevel: 'tut_6',
  world: { width: T5_W, height: GH },
  bgColor: '#1a1a2e',
  platforms: [
    // Left floor
    { x: T5_GAP_L / 2, y: FY + 16, width: T5_GAP_L, height: 32 },
    // Right floor
    { x: (T5_GAP_R + T5_W) / 2, y: FY + 16, width: T5_W - T5_GAP_R, height: 32 },
    // Shallow pit floor (block + jump can escape)
    { x: (T5_GAP_L + T5_GAP_R) / 2, y: T5_PIT_Y + 16, width: T5_GAP_W + 40, height: 32 },
    // Walls
    { x: 8,       y: GH / 2, width: 16, height: GH },
    { x: T5_W - 8, y: GH / 2, width: 16, height: GH },
  ],
  player: { x: 80, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: 40,      y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: T5_W - 60, y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [
    { id: 't_bridge', x: T5_TERM, y: FY - 16, linkTo: 'bridge1' },
  ],
  doors: [],
  drawbridges: [
    {
      id: 'bridge1',
      pivotX: T5_GAP_L,
      pivotY: FY,
      width: T5_GAP_W,
      direction: 'right',
    },
  ],
  elevators: [],
  enemies: [],
  pushBlocks: [
    // Push this into the pit before crossing — safety net if you fall
    { id: 'block1', x: 230, y: FY - PUSH_BLOCK.SIZE / 2 },
  ],
  spikes: [],
  goal: { x: T5_W - 60, y: FY - 20 },
  tutorialPopups: [
    {
      id: 'tut5_bridge',
      x: 100, y: FY - 60, width: 170, height: 120,
      title: 'Drawbridges',
      speakerName: 'Mentor',
      portraitKey: 'mentor_face',
      lines: [
        'Push the block into the pit first!',
        'Then press  E  at the terminal to',
        'swing the bridge. If you fall, the',
        'block lets you jump back out.',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 6 — Elevator
//  Plug cord to activate elevator, ride up to goal on upper ledge.
// ═════════════════════════════════════════════════════════════════
const T6_UPPER = 340;
export const TUT_06 = {
  id: 'tut_6',
  name: 'Tutorial: Elevator',
  nextLevel: 'tut_7',
  world: { width: W, height: GH },
  bgColor: '#1a1a2e',
  platforms: [
    { x: W / 2, y: FY + 16, width: W, height: 32 },
    { x: W / 2 + W / 4, y: T6_UPPER + 16, width: W / 2, height: 32 },
    { x: 8,     y: GH / 2,  width: 16, height: GH },
    { x: W - 8, y: GH / 2,  width: 16, height: GH },
  ],
  player: { x: 80, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: 40,    y: FY - 20,     label: 'G1', isPrimary: true },
    { id: 'g2', x: W - 60, y: T6_UPPER - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [
    { id: 't_elev', x: 220, y: FY - 16, linkTo: 'elev1' },
  ],
  doors: [],
  drawbridges: [],
  elevators: [
    {
      id: 'elev1',
      x: 320,
      startY: FY - ELEVATOR.HEIGHT / 2,
      endY: T6_UPPER - ELEVATOR.HEIGHT / 2,
    },
  ],
  enemies: [],
  pushBlocks: [],
  spikes: [],
  goal: { x: W - 60, y: T6_UPPER - 20 },
  tutorialPopups: [
    {
      id: 'tut6_elev',
      x: 170, y: FY - 60, width: 130, height: 120,
      title: 'Elevators',
      speakerName: 'Mentor',
      portraitKey: 'mentor_face',
      lines: [
        'Press  E  at the terminal to',
        'power the elevator. Stand on',
        'it to ride up!',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 7 — Enemies & Attacking
//  Defeat an enemy blocking the path using the cord plug attack.
// ═════════════════════════════════════════════════════════════════
export const TUT_07 = {
  id: 'tut_7',
  name: 'Tutorial: Attacking',
  nextLevel: 'tut_8',
  world: { width: W, height: GH },
  bgColor: '#1a1a2e',
  platforms: [
    { x: W / 2, y: FY + 16, width: W, height: 32 },
    { x: 8,     y: GH / 2,  width: 16, height: GH },
    { x: W - 8, y: GH / 2,  width: 16, height: GH },
  ],
  player: { x: 80, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: 40,    y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: W - 60, y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [
    {
      id: 'enemy1',
      x: 350,
      y: FY - ENEMY.HEIGHT / 2,
      rangeLeft: 250,
      rangeRight: 450,
      direction: 'left',
      label: '👾',
    },
  ],
  pushBlocks: [],
  spikes: [],
  goal: { x: W - 60, y: FY - 20 },
  tutorialPopups: [
    {
      id: 'tut7_enemy',
      x: 180, y: FY - 60, width: 120, height: 120,
      title: 'Enemies',
      speakerName: 'Mentor',
      portraitKey: 'mentor_face',
      lines: [
        'An enemy blocks your path!',
        'With cord unplugged, press  E',
        'to swing your plug. ZAP!',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 8 — The Goal
//  Simple room explaining the objective of every level.
// ═════════════════════════════════════════════════════════════════
export const TUT_08 = {
  id: 'tut_8',
  name: 'Tutorial: The Goal',
  nextLevel: 'level_01',
  world: { width: W, height: GH },
  bgColor: '#1a1a2e',
  platforms: [
    { x: W / 2, y: FY + 16, width: W, height: 32 },
    { x: 8,     y: GH / 2,  width: 16, height: GH },
    { x: W - 8, y: GH / 2,  width: 16, height: GH },
  ],
  player: { x: 80, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: 40,    y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: W - 60, y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [],
  pushBlocks: [],
  spikes: [],
  goal: { x: W - 60, y: FY - 20 },
  tutorialPopups: [
    {
      id: 'tut8_goal',
      x: 120, y: FY - 60, width: 250, height: 120,
      title: 'The Goal',
      speakerName: 'Mentor',
      portraitKey: 'mentor_face',
      lines: [
        'Every level has a broken Generator.',
        'Reach it to repair it and restore',
        'power — that\'s how you win!',
      ],
    },
  ],
};