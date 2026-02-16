/**
 * Central game configuration and constants.
 * All magic numbers and tunable values live here.
 */

/** Canvas / display */
export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

/** Tile dimensions (in pixels) */
export const TILE_SIZE = 32;

/** Physics */
export const GRAVITY = 900;

/** Player tuning */
export const PLAYER = {
  SPEED: 200,
  JUMP_VELOCITY: -420,   // high enough to jump over a 32px block
  WIDTH: 48,
  HEIGHT: 64,
  COLOR: 0xffcc00,       // placeholder yellow
};

/** Extension cord */
export const CORD = {
  MAX_LENGTH: 750,       // max pixels the cord can stretch from generator
  COLOR: 0xff8800,       // orange
  WIDTH: 3,
};

/** Generator */
export const GENERATOR = {
  WIDTH: 40,
  HEIGHT: 40,
  COLOR: 0x00cc44,       // green
};

/** Terminal */
export const TERMINAL = {
  WIDTH: 16,
  HEIGHT: 24,
  COLOR: 0xcc0000,       // red when unpowered
  COLOR_POWERED: 0x00ff00, // green when powered
  INTERACT_RANGE: 40,    // px — how close hero must be to plug/unplug
};

/** Slide door */
export const DOOR = {
  SLIDE_SPEED: 120,
  WIDTH: 32,
  HEIGHT: 128,           // tall door
  COLOR: 0x8855aa,       // purple
  COLOR_OPEN: 0x442266,
};

/** Push block (2.5D) */
export const PUSH_BLOCK = {
  SIZE: 48,
  PUSH_SPEED: 80,
  COLOR_BG: 0x666666,    // when in background
  COLOR_FG: 0x999999,    // when grabbed / foreground
};

/** Elevator */
export const ELEVATOR = {
  WIDTH: 80,
  HEIGHT: 16,
  SPEED: 100,
  COLOR: 0x4488cc,
  COLOR_OFF: 0x334455,
  PAUSE_DURATION: 800,
};

/** Drawbridge */
export const DRAWBRIDGE = {
  WIDTH: 100,       // length of the bridge plank
  HEIGHT: 12,       // thickness
  SPEED: 120,       // degrees per second for rotation
  COLOR: 0x8B4513,  // brown (wood)
  COLOR_OFF: 0x5C3317,
};

/** Spikes (hazard) */
export const SPIKES = {
  TILE_WIDTH: 16,   // width of one spike triangle
  HEIGHT: 24,       // spike height (visual)
  COLOR: 0xcc2222,  // red
};

/** Level layout constants (pixels) */
export const LEVEL = {
  FLOOR_Y: 550,          // y of the main floor surface
  LEDGE_Y: 340,          // y of the upper ledge (elevator destination)
  LEDGE_X: 850,          // x where ledge starts
  WORLD_WIDTH: 1100,
};

/** Scene keys — single source of truth */
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  UI: 'UIScene',
};
