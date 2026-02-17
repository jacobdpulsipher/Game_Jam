# src/levels/ — Level Data Files

## Purpose
Each file exports a **declarative level data object** that GameScene interprets
to build a playable level. This separates level layout (data) from game logic (code).

## Architecture
```
LevelRegistry.js          — ordered list of all levels + helpers (getAllLevels for level select)
Level01.js                — "First Steps" (intro)
Level02.js                — "Bridge the Gap" (drawbridge + spikes)
Level03.js                — "Dead Weight" (trigger zones + cascading activations)
Level04.js                — "Power Climb" (vertical, multi-route, hard)
Level05.js                — "Tower Descent" (tall vertical descent)
```

## How It Works
1. `MenuScene` or the previous level calls `scene.start(SCENES.GAME, { levelId: 'level_01' })`.
2. `GameScene.create()` looks up the level data from `LevelRegistry` by `levelId`.
3. `GameScene._buildLevel(data)` reads the data object and instantiates all
   platforms, entities, and puzzle elements.
4. On level complete, GameScene reads `data.nextLevel` to transition.

## Level Data Format
See `LevelRegistry.js` for the documented schema. Quick reference:

```js
export const LEVEL_01 = {
  id: 'level_01',
  name: 'First Steps',
  nextLevel: 'level_02',          // null = last level
  world: { width: 1100, height: 768 },
  bgColor: '#1a1a2e',

  platforms: [
    { x, y, width, height },      // center-based positioning
  ],

  player: { x, y, generatorId: 'g1' },

  generators: [
    { id: 'g1', x, y, label: 'G1' },
  ],

  terminals: [
    { id: 't1', x, y, linkTo: 'door1' },
  ],

  doors: [
    { id: 'door1', x, y, /* optional: width, height, direction, range, slideSpeed */ },
  ],

  elevators: [
    { id: 'elev1', x, startY, endY, /* optional: width, height, speed, pauseDuration */ },
  ],

  pushBlocks: [
    { id: 'block1', x, y },
  ],

  drawbridges: [
    { id: 'bridge1', pivotX, pivotY, /* optional: width, height, speed, direction */ },
  ],

  spikes: [
    { id: 'spikes1', x, y, width, /* optional: height */ },
  ],

  goal: { x, y },
};
```

## Adding a New Level
1. Create `LevelNN.js` exporting a data object following the schema.
2. Import it in `LevelRegistry.js` and add to the `LEVELS` array.
3. Set the previous level's `nextLevel` to the new level's `id`.
4. Follow the design rules in `design/map-design-rules.md`.
