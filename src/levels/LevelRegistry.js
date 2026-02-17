/**
 * LevelRegistry — ordered list of all levels and lookup helpers.
 *
 * LEVEL DATA SCHEMA
 * =================
 * Every level data object MUST conform to this shape.
 * All coordinates are in PIXELS, measured from the top-left corner (0, 0).
 * All x/y values refer to the CENTER of the object.
 *
 * {
 *   id:        string,        // Unique level key, e.g. 'level_01'
 *   name:      string,        // Human-readable name shown on screen
 *   nextLevel: string | null, // id of the next level, or null if this is the last
 *
 *   world: {
 *     width:  number,         // Total scrollable width in px
 *     height: number,         // Total height (usually GAME_HEIGHT = 768)
 *   },
 *
 *   bgColor: string,          // CSS color for the camera background
 *
 *   // --- Platforms (static solid geometry) ---
 *   // Each creates a filled rectangle with a static physics body.
 *   platforms: [
 *     {
 *       x:      number,       // Center X
 *       y:      number,       // Center Y
 *       width:  number,       // Full width
 *       height: number,       // Full height
 *     },
 *   ],
 *
 *   // --- Player spawn ---
 *   player: {
 *     x:           number,    // Spawn center X
 *     y:           number,    // Spawn center Y
 *     generatorId: string,    // ID of the generator the player is tethered to
 *   },
 *
 *   // --- Generators (power sources / goals) ---
 *   generators: [
 *     {
 *       id:    string,        // Unique ID (referenced by player.generatorId)
 *       x:     number,        // Center X
 *       y:     number,        // Center Y
 *       label: string,        // Overhead label text ('G1', 'G2', …)
 *     },
 *   ],
 *
 *   // --- Terminals (cord plug points) ---
 *   terminals: [
 *     {
 *       id:     string,       // Unique ID
 *       x:      number,       // Center X
 *       y:      number,       // Center Y
 *       linkTo: string,       // ID of the puzzle element this terminal powers
 *     },
 *   ],
 *
 *   // --- Slide Doors ---
 *   doors: [
 *     {
 *       id:         string,        // Unique ID (matched by terminal.linkTo)
 *       x:          number,        // Closed center X
 *       y:          number,        // Closed center Y
 *       width:      number | undefined, // Optional (default: DOOR.WIDTH)
 *       height:     number | undefined, // Optional (default: DOOR.HEIGHT)
 *       slideSpeed: number | undefined, // Optional px/s (default: DOOR.SLIDE_SPEED)
 *       direction:  string | undefined, // 'up'|'down'|'left'|'right' (default: 'up')
 *       range:      number | undefined, // How far it slides (default: height)
 *       label:      string | undefined, // Debug label (default: 'D')
 *     },
 *   ],
 *
 *   // --- Elevators ---
 *   elevators: [
 *     {
 *       id:            string,        // Unique ID
 *       x:             number,        // Center X
 *       startY:        number,        // Resting Y (center, unpowered position)
 *       endY:          number,        // Destination Y (center, powered cycle endpoint)
 *       width:         number | undefined, // Optional (default: ELEVATOR.WIDTH)
 *       height:        number | undefined, // Optional (default: ELEVATOR.HEIGHT)
 *       speed:         number | undefined, // Optional px/s (default: ELEVATOR.SPEED)
 *       pauseDuration: number | undefined, // Optional ms (default: ELEVATOR.PAUSE_DURATION)
 *       label:         string | undefined, // Debug label (default: 'E')
 *     },
 *   ],
 *
 *   // --- Push Blocks ---
 *   pushBlocks: [
 *     {
 *       id: string,           // Unique ID
 *       x:  number,           // Center X
 *       y:  number,           // Center Y
 *     },
 *   ],
 *
 *   // --- Drawbridges ---
 *   drawbridges: [
 *     {
 *       id:        string,        // Unique ID
 *       pivotX:    number,        // Hinge / pivot X
 *       pivotY:    number,        // Hinge / pivot Y
 *       width:     number | undefined, // Plank length (default: DRAWBRIDGE.WIDTH)
 *       height:    number | undefined, // Plank thickness (default: DRAWBRIDGE.HEIGHT)
 *       speed:     number | undefined, // Rotation deg/s (default: DRAWBRIDGE.SPEED)
 *       direction: string | undefined, // 'right' | 'left' (default: 'right')
 *       label:     string | undefined, // Debug label (default: 'DB')
 *     },
 *   ],
 *
 *   // --- Spikes (hazard zones) ---
 *   spikes: [
 *     {
 *       id:     string,        // Unique ID
 *       x:      number,        // Center X
 *       y:      number,        // Center Y
 *       width:  number,        // Total strip width
 *       height: number | undefined, // Spike height (default: SPIKES.HEIGHT)
 *       label:  string | undefined, // Debug label
 *     },
 *   ],
 *
 *   // --- Goal zone (level complete trigger) ---
 *   goal: {
 *     x: number,              // Center X
 *     y: number,              // Center Y
 *   },
 * }
 */

import { LEVEL_01 } from './Level01.js';
import { LEVEL_02 } from './Level02.js';
import { LEVEL_03 } from './Level03.js';
import { LEVEL_04 } from './Level04.js';
import { LEVEL_05 } from './Level05.js';
import {
  TUT_01, TUT_02, TUT_03, TUT_04,
  TUT_05, TUT_06, TUT_07, TUT_08,
} from './LevelTutorial.js';

/** Ordered list of all levels (tutorials + gameplay). */
const LEVELS = [
  TUT_01, TUT_02, TUT_03, TUT_04,
  TUT_05, TUT_06, TUT_07, TUT_08,
  LEVEL_01,
  LEVEL_02,
  LEVEL_03,
  LEVEL_04,
  LEVEL_05,
];

/** Lookup a level by id. */
export function getLevelById(id) {
  return LEVELS.find(l => l.id === id) || null;
}

/** Get the first gameplay level (skipping the tutorial). */
export function getFirstLevel() {
  return LEVEL_01;
}

/** Get the next level after the given id, or null. */
export function getNextLevel(currentId) {
  const current = getLevelById(currentId);
  if (!current || !current.nextLevel) return null;
  return getLevelById(current.nextLevel);
}

/** Get list of all level ids (for a level-select screen). */
export function getAllLevelIds() {
  return LEVELS.map(l => l.id);
}

/** Get all gameplay levels (id + name) for level-select UI — excludes tutorials. */
export function getAllLevels() {
  return LEVELS
    .filter(l => !l.id.startsWith('tut_'))
    .map((l, i) => ({ id: l.id, name: l.name, index: i + 1 }));
}
