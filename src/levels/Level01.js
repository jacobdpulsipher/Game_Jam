import { GAME_HEIGHT, LEVEL, DOOR, PUSH_BLOCK, ELEVATOR } from '../config.js';

/**
 * Level 01 — "First Steps"
 *
 * Layout (left → right):
 *   G1 → Player → T1 + Door → PushBlock → T2 + Elevator → Ledge + G2 (goal)
 *
 * Solution:
 *   1. Plug cord into T1 (door opens)
 *   2. Walk through door, grab block, drag under door
 *   3. Release block, unplug T1 (door props on block)
 *   4. Walk through propped gap, plug cord into T2 (elevator activates)
 *   5. Ride elevator to ledge, reach G2 → level complete
 */

const FLOOR_Y = LEVEL.FLOOR_Y;          // 550
const LEDGE_Y = LEVEL.LEDGE_Y;          // 340
const LEDGE_X = LEVEL.LEDGE_X;          // 850
const WORLD_W = LEVEL.WORLD_WIDTH;      // 1100

export const LEVEL_01 = {
  id: 'level_01',
  name: 'First Steps',
  nextLevel: 'level_02',                 // chains to Level 2

  world: { width: WORLD_W, height: GAME_HEIGHT },
  bgColor: '#1a1a2e',

  // ── Platforms ──────────────────────────────────────────
  platforms: [
    // Main floor
    { x: WORLD_W / 2,                   y: FLOOR_Y + 16,                  width: WORLD_W, height: 32 },
    // Upper ledge (right side)
    { x: LEDGE_X + (WORLD_W - LEDGE_X) / 2, y: LEDGE_Y + 16,            width: WORLD_W - LEDGE_X, height: 32 },
    // Right wall (ledge → floor)
    { x: WORLD_W - 8,                   y: (LEDGE_Y + FLOOR_Y) / 2,      width: 16, height: FLOOR_Y - LEDGE_Y },
    // Left wall
    { x: 8,                              y: FLOOR_Y / 2,                  width: 16, height: FLOOR_Y },
  ],

  // ── Player ─────────────────────────────────────────────
  player: { x: 120, y: FLOOR_Y - 40, generatorId: 'g1' },

  // ── Generators ─────────────────────────────────────────
  generators: [
    { id: 'g1', x: 60,            y: FLOOR_Y - 20,  label: 'G1' },
    { id: 'g2', x: WORLD_W - 60,  y: LEDGE_Y - 20,  label: 'G2' },
  ],

  // ── Terminals ──────────────────────────────────────────
  terminals: [
    { id: 't_door', x: 270, y: FLOOR_Y - 16, linkTo: 'door1' },
    { id: 't_elev', x: 700, y: FLOOR_Y - 16, linkTo: 'elev1' },
  ],

  // ── Doors ──────────────────────────────────────────────
  doors: [
    {
      id: 'door1',
      x: 320,
      y: FLOOR_Y - DOOR.HEIGHT / 2,
      // All other params default from config
    },
  ],

  // ── Elevators ──────────────────────────────────────────
  elevators: [
    {
      id: 'elev1',
      x: 750,
      startY: FLOOR_Y - ELEVATOR.HEIGHT / 2,
      endY:   LEDGE_Y - ELEVATOR.HEIGHT / 2,
      // All other params default from config
    },
  ],

  // ── Push Blocks ────────────────────────────────────────
  pushBlocks: [
    { id: 'block1', x: 480, y: FLOOR_Y - PUSH_BLOCK.SIZE / 2 },
  ],

  // ── Goal ───────────────────────────────────────────────
  goal: { x: WORLD_W - 60, y: LEDGE_Y - 20 },

  // ── Midground Buildings ────────────────────────────────
  midgroundBuildings: [
    // Behind generator / player area (far left)
    {
      x: 16, y: 582, width: 120, height: 260, color: 0x161630,
      roofDetails: [
        { type: 'tank', offsetX: 30 },
        { type: 'pipes', offsetX: 80, width: 25 },
      ],
    },
    // Behind door / terminal area
    {
      x: 240, y: 582, width: 160, height: 310, color: 0x14142e,
      roofDetails: [
        { type: 'ac', offsetX: 15 },
        { type: 'fire_escape', offsetX: 0, width: 18 },
        { type: 'antenna', offsetX: 120 },
      ],
    },
    // Mid section behind push block area
    {
      x: 440, y: 582, width: 180, height: 350, color: 0x1e1e3c,
      roofDetails: [
        { type: 'ac', offsetX: 20 },
        { type: 'dish', offsetX: 90 },
        { type: 'pipes', offsetX: 140, width: 30 },
      ],
    },
    // Behind terminal / elevator area
    {
      x: 660, y: 582, width: 130, height: 280, color: 0x191838,
      roofDetails: [
        { type: 'ac', offsetX: 15 },
        { type: 'neon_sign', offsetX: 35, offsetY: 50, width: 35, neonColor: 0xff2266 },
      ],
    },
    // Under upper ledge — makes it look like a rooftop
    {
      x: 840, y: 372, width: 260, height: 500, color: 0x1c1c3a,
      roofDetails: [
        { type: 'antenna', offsetX: 30 },
        { type: 'tank', offsetX: 120 },
        { type: 'dish', offsetX: 200 },
        { type: 'awning', offsetX: 50, offsetY: 80, width: 28, color: 0x553322 },
      ],
    },
  ],

  // ── Lampposts ──────────────────────────────────────────
  lampposts: [
    { x: 180, y: FLOOR_Y },
    { x: 570, y: FLOOR_Y },
    { x: 820, y: FLOOR_Y },
  ],

  // ── Decorations (atmospheric only) ─────────────────────
  decorations: [
    { type: 'puddle', x: 220, y: FLOOR_Y, width: 28 },
    { type: 'steam_vent', x: 950, y: LEDGE_Y },
  ],
};
