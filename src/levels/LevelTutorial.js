import { GAME_HEIGHT, DOOR, ELEVATOR, DRAWBRIDGE, ENEMY, PUSH_BLOCK, SPIKES } from '../config.js';

/**
 * Tutorial — eight self-contained mini-levels, one per mechanic.
 * Each is a tiny room the player can complete in seconds.
 * They chain together: tut_1 → tut_2 → … → tut_8 → level_01.
 */

// ── Shared constants ────────────────────────────────────────────
const W   = 800;          // world width for each mini level
const FY  = 550;          // floor Y
const GH  = GAME_HEIGHT;

// ── Shared wall / visual helpers ────────────────────────────────
const WALL_W = 120;       // wide skyscraper wall

// Standard wall platforms (skyscraper-styled)
const STD_LEFT_WALL  = { x: WALL_W / 2,     y: GH / 2, width: WALL_W, height: GH, style: 'skyscraper' };
const STD_RIGHT_WALL = { x: W - WALL_W / 2, y: GH / 2, width: WALL_W, height: GH, style: 'skyscraper' };

// Player / generator standard positions (inside the playable area)
const G1_X  = WALL_W + 20;        // 140
const G2_X  = W - WALL_W - 20;    // 660
const PL_X  = WALL_W + 50;        // 170

// Midground buildings shared by every standard-width tutorial level
const STD_MIDGROUND = [
  // Building the player stands on — visible below the rooftop floor
  { x: WALL_W, y: FY, width: W - WALL_W * 2, height: 300, color: 0x2e2222,
    roofDetails: [
      { type: 'ac', offsetX: 30 },
      { type: 'pipes', offsetX: 300, width: 20 },
    ],
  },
];

// Standard lampposts
const STD_LAMPPOSTS = [{ x: 350, y: FY }];

// Standard decorations
const STD_DECORATIONS = [
  { type: 'puddle', x: 500, y: FY, width: 22 },
];

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
    STD_LEFT_WALL,
    STD_RIGHT_WALL,
  ],
  player: { x: PL_X, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: G1_X,  y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: G2_X,  y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [],
  pushBlocks: [],
  spikes: [],
  goal: { x: G2_X, y: FY - 20 },
  midgroundBuildings: STD_MIDGROUND,
  lampposts: [{ x: 400, y: FY }],
  decorations: [{ type: 'puddle', x: 550, y: FY, width: 22 }],
  tutorialPopups: [
    {
      id: 'tut1_move',
      x: PL_X, y: FY - 60, width: 200, height: 120,
      title: 'Movement',
      speakerName: 'Voltage Jack',
      portraitKey: 'mentor_face',
      lines: [
        '—kshhh— You read me, kid?',
        'Name’s Voltage Jack.', 
        'And you are my lucky apprentice!',
        'Sorry I can’t be there in person—',
        'they said I’m a “safety risk.” Ha!',
        'Rule #1 of being an electrician:',
        'NEVER forget your extension cord.',
        'That tether? That’s your lifeline',
        'I’ll be on the radio talking you through',
        'Now use the arrow keys to go fix that generator!',
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
    STD_LEFT_WALL,
    STD_RIGHT_WALL,
    // Wall obstacle
    { x: W / 2, y: FY - 24, width: 24, height: 48, style: 'chimney' },
  ],
  player: { x: PL_X, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: G1_X,  y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: G2_X,  y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [],
  pushBlocks: [],
  spikes: [],
  goal: { x: G2_X, y: FY - 20 },
  midgroundBuildings: STD_MIDGROUND,
  lampposts: STD_LAMPPOSTS,
  decorations: STD_DECORATIONS,
  tutorialPopups: [
    {
      id: 'tut2_jump',
      x: W / 2 - 80, y: FY - 60, width: 120, height: 120,
      title: 'Jumping',
      speakerName: 'Voltage Jack',
      portraitKey: 'mentor_face',
      lines: [
        'Calm down, kid. That was nothing!',
        'City\'s a zoo! All sorts of stuff to climb over',
        'Press  SPACE  or  UP  to jump.',
        'Hop over the wall. Try not to make it mad.',
        'City work’s 10% wiring, 90% parkour.',
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
    // Skyscraper walls
    STD_LEFT_WALL,
    STD_RIGHT_WALL,
  ],
  player: { x: PL_X, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: G1_X,  y: FY - 20,        label: 'G1', isPrimary: true },
    { id: 'g2', x: 580,   y: T3_LEDGE_Y - 20, label: 'G2', isPrimary: false },
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
  goal: { x: 580, y: T3_LEDGE_Y - 20 },
  midgroundBuildings: [
    ...STD_MIDGROUND,
    // Building under the elevated ledge
    { x: 400, y: T3_LEDGE_Y, width: 300, height: 400, color: 0x22191a,
      roofDetails: [{ type: 'antenna', offsetX: 120 }],
    },
  ],
  lampposts: STD_LAMPPOSTS,
  decorations: STD_DECORATIONS,
  tutorialPopups: [
    {
      id: 'tut3_block',
      x: 160, y: FY - 60, width: 160, height: 120,
      title: 'Push Blocks',
      speakerName: 'Voltage Jack',
      portraitKey: 'mentor_face',
      lines: [
        'I get it! You can jump!',
        'Ain\'t always that easy kid.',
        'Some times ya need an little boost',
        'You see that crate? Press F to grab it',
        'Then you can drag it wherever you go',
        'Press F again to release it.',
        'Position it, then hop on top for a boost',
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 4 — Terminals & Doors
//  Plug cord into terminal to open door, walk through.
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
    STD_LEFT_WALL,
    STD_RIGHT_WALL,
  ],
  player: { x: PL_X, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: G1_X,  y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: G2_X,  y: FY - 20, label: 'G2', isPrimary: false },
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
  pushBlocks: [],
  spikes: [],
  goal: { x: G2_X, y: FY - 20 },
  midgroundBuildings: STD_MIDGROUND,
  lampposts: [{ x: 520, y: FY }],
  decorations: [{ type: 'steam_vent', x: 600, y: FY }],
  tutorialPopups: [
    {
      id: 'tut4_door',
      x: PL_X, y: FY - 60, width: 180, height: 120,
      title: 'Terminals & Doors',
      speakerName: 'Voltage Jack',
      portraitKey: 'mentor_face',
      lines: [
        'City planners leave doors in the darnest places!',
        'That\'s why we always got our extension cord handy',
        'Press D to plug that puppy into the outlet',
        'And get this door open.',
        'Once through, go fix that generator.',
        'You can leave the cord behind. Got plenty more for ya',
        'Get to it! Mimi\'s Cafe closes at 7:00!',        
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════
//  Tutorial 5 — Drawbridge
//  Plug cord to swing a drawbridge across a gap.
// ═════════════════════════════════════════════════════════════════
const T5_W      = 900;
const T5_TERM   = 260;
const T5_GAP_L  = 340;
const T5_GAP_R  = 540;
const T5_GAP_W  = T5_GAP_R - T5_GAP_L;
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
    // Skyscraper walls
    { x: WALL_W / 2,      y: GH / 2, width: WALL_W, height: GH, style: 'skyscraper' },
    { x: T5_W - WALL_W / 2, y: GH / 2, width: WALL_W, height: GH, style: 'skyscraper' },
  ],
  player: { x: PL_X, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: G1_X,          y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: T5_W - WALL_W - 20, y: FY - 20, label: 'G2', isPrimary: false },
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
  pushBlocks: [],
  spikes: [
    {
      id: 'spikes1',
      x: (T5_GAP_L + T5_GAP_R) / 2,
      y: GH - SPIKES.HEIGHT / 2,
      width: T5_GAP_W - 10,
    },
  ],
  goal: { x: T5_W - WALL_W - 20, y: FY - 20 },
  midgroundBuildings: [
    // Left building (player stands on)
    { x: WALL_W, y: FY, width: T5_GAP_L - WALL_W, height: 300, color: 0x2e2222,
      roofDetails: [{ type: 'ac', offsetX: 20 }],
    },
    // Right building
    { x: T5_GAP_R, y: FY, width: T5_W - T5_GAP_R - WALL_W, height: 300, color: 0x22191a,
      roofDetails: [{ type: 'pipes', offsetX: 60, width: 20 }],
    },
  ],
  lampposts: [{ x: 220, y: FY }, { x: T5_W - 200, y: FY }],
  decorations: [{ type: 'steam_vent', x: T5_W - 180, y: FY }],
  tutorialPopups: [
    {
      id: 'tut5_bridge',
      x: PL_X, y: FY - 60, width: 170, height: 120,
      title: 'Drawbridges',
      speakerName: 'Voltage Jack',
      portraitKey: 'mentor_face',
      lines: [
        'Hey, your getting the hang of this!',
        'Don\'t let that get to your head!',
        'Press  D  at the terminal to',
        'swing the bridge across.',
        'Walk over, reach the generator. Easy!',
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
    STD_LEFT_WALL,
    STD_RIGHT_WALL,
  ],
  player: { x: PL_X, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: G1_X,  y: FY - 20,       label: 'G1', isPrimary: true },
    { id: 'g2', x: G2_X,  y: T6_UPPER - 20, label: 'G2', isPrimary: false },
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
  goal: { x: G2_X, y: T6_UPPER - 20 },
  midgroundBuildings: [
    ...STD_MIDGROUND,
    // Building under the upper ledge
    { x: W / 2, y: T6_UPPER, width: W / 2 - WALL_W, height: 500, color: 0x22191a,
      roofDetails: [{ type: 'tank', offsetX: 60 }, { type: 'dish', offsetX: 160 }],
    },
  ],
  lampposts: [{ x: 250, y: FY }],
  decorations: [{ type: 'puddle', x: 360, y: FY, width: 20 }],
  tutorialPopups: [
    {
      id: 'tut6_elev',
      x: 170, y: FY - 60, width: 130, height: 120,
      title: 'Elevators',
      speakerName: 'Voltage Jack',
      portraitKey: 'mentor_face',
      lines: [
        'Elevator time. The city’s favorite prank.',
        'Press  D  at the terminal to power it.',
        'Stand on it to ride up—nice and steady.',
        'If it rattles, pretend you meant that.',
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
    STD_LEFT_WALL,
    STD_RIGHT_WALL,
  ],
  player: { x: PL_X, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: G1_X,  y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: G2_X,  y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [
    {
      id: 'enemy1',
      x: 450,
      y: FY - ENEMY.HEIGHT / 2,
      rangeLeft: 350,
      rangeRight: 550,
      direction: 'left',
      label: '👾',
    },
  ],
  pushBlocks: [],
  spikes: [],
  goal: { x: G2_X, y: FY - 20 },
  midgroundBuildings: STD_MIDGROUND,
  lampposts: [{ x: 550, y: FY }],
  decorations: [{ type: 'steam_vent', x: 300, y: FY }],
  tutorialPopups: [
    {
      id: 'tut7_enemy',
      x: 250, y: FY - 60, width: 120, height: 120,
      title: 'Enemies',
      speakerName: 'Voltage Jack',
      portraitKey: 'mentor_face',
      lines: [
        'Ah, them darn hoodlums!',
        'Always trying their parkour crap on our turf.',
        'Like I said, always keep that cord handy.',
        'Press D when you get close him',
        'Totally harmless! Just gives him a little zap.',
        'But be careful! They bite',
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
    STD_LEFT_WALL,
    STD_RIGHT_WALL,
  ],
  player: { x: PL_X, y: FY - 40, generatorId: 'g1' },
  generators: [
    { id: 'g1', x: G1_X,  y: FY - 20, label: 'G1', isPrimary: true },
    { id: 'g2', x: G2_X,  y: FY - 20, label: 'G2', isPrimary: false },
  ],
  terminals: [],
  doors: [],
  drawbridges: [],
  elevators: [],
  enemies: [],
  pushBlocks: [],
  spikes: [],
  goal: { x: G2_X, y: FY - 20 },
  midgroundBuildings: STD_MIDGROUND,
  lampposts: [{ x: 400, y: FY }],
  decorations: [{ type: 'puddle', x: 250, y: FY, width: 25 }],
  tutorialPopups: [
    {
      id: 'tut8_goal',
      x: PL_X, y: FY - 60, width: 250, height: 120,
      title: 'The Goal',
      speakerName: 'Voltage Jack',
      portraitKey: 'mentor_face',
      lines: [
        'Okay, maybe a little more than a zap,',
        'But man! It sure is fun...',
        'Anywho, big picture, apprentice:',
        'You got a lot of generators to fix tonight.',
        'Reach it to repair and restore power.',
        'We\'re counting on ya!',
      ],
    },
  ],
};