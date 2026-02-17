/**
 * segment-sprite.cjs
 * Reads SparkyJoe.png, extracts pixel data, segments into body parts,
 * and generates SparkySprite.js with animation frames.
 */
const fs = require('fs');
const { PNG } = require('pngjs');

const data = fs.readFileSync('src/assets/SparkyJoe.png');
const png = PNG.sync.read(data);
const { width, height } = png;
const BG = 'ffffff';

// ── Build horizontal-run draw commands ──
const cmds = [];
for (let y = 0; y < height; y++) {
  let x = 0;
  while (x < width) {
    const i = (y * width + x) * 4;
    const a = png.data[i + 3];
    const hex = ((png.data[i] << 16) | (png.data[i + 1] << 8) | png.data[i + 2]).toString(16).padStart(6, '0');
    if (a < 10 || hex === BG) { x++; continue; }
    let run = 1;
    while (x + run < width) {
      const j = (y * width + x + run) * 4;
      const a2 = png.data[j + 3];
      const h2 = ((png.data[j] << 16) | (png.data[j + 1] << 8) | png.data[j + 2]).toString(16).padStart(6, '0');
      if (a2 < 10 || h2 !== hex) break;
      run++;
    }
    cmds.push({ hex, x, y, w: run, h: 1 });
    x += run;
  }
}

// ── Vertical merge ──
const map = new Map();
for (const c of cmds) {
  const k = c.hex + ',' + c.x + ',' + c.w;
  if (!map.has(k)) map.set(k, []);
  map.get(k).push(c);
}
const toRemove = new Set();
for (const [, group] of map) {
  group.sort((a, b) => a.y - b.y);
  for (let i = 0; i < group.length - 1; i++) {
    const cur = group[i];
    if (toRemove.has(cur)) continue;
    let j = i + 1;
    while (j < group.length) {
      const next = group[j];
      if (toRemove.has(next)) { j++; continue; }
      if (next.y === cur.y + cur.h) { cur.h += next.h; toRemove.add(next); j++; }
      else break;
    }
  }
}
const merged = cmds.filter(c => !toRemove.has(c));
merged.sort((a, b) => a.y - b.y || a.x - b.x);

// ── Build palette ──
const colorCounts = new Map();
for (const c of merged) colorCounts.set(c.hex, (colorCounts.get(c.hex) || 0) + c.w * c.h);
const palette = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]);
const palIndex = {};
palette.forEach(([hex], i) => { palIndex[hex] = i; });

// ── Segment into body parts ──
// Body part boundaries (based on visual analysis of 48x65 sprite)
const HEAD = [];      // Hat + face + beard: y < 25
const TORSO = [];     // Shirt + arms + belt: 25 <= y < 46, core area
const TOOL = [];      // Tool/plug held in right hand: x >= 35
const LEFT_LEG = [];  // Left leg + boot: y >= 46, centerX < 22
const RIGHT_LEG = []; // Right leg + boot: y >= 46, centerX >= 22

for (const c of merged) {
  const cx = c.x + c.w / 2; // center x of command
  
  if (c.x >= 35 && c.y >= 20 && c.y < 46) {
    // Tool/plug area (far right, mid-body height)
    TOOL.push(c);
  } else if (c.y < 25) {
    HEAD.push(c);
  } else if (c.y < 46) {
    TORSO.push(c);
  } else if (cx < 22) {
    LEFT_LEG.push(c);
  } else {
    RIGHT_LEG.push(c);
  }
}

console.log(`Segments: HEAD=${HEAD.length}, TORSO=${TORSO.length}, TOOL=${TOOL.length}, LEFT_LEG=${LEFT_LEG.length}, RIGHT_LEG=${RIGHT_LEG.length}`);
console.log(`Total: ${HEAD.length + TORSO.length + TOOL.length + LEFT_LEG.length + RIGHT_LEG.length} (merged: ${merged.length})`);

// ── Generate SparkySprite.js ──
function cmdArray(arr, name) {
  const items = arr.map(c => `[${palIndex[c.hex]},${c.x},${c.y},${c.w},${c.h}]`);
  return `const ${name} = [\n  ${items.join(',\n  ')}\n];`;
}

const output = `/**
 * SparkySprite.js
 *
 * Procedurally generates an animated sprite sheet for "Sparky Joe" the electrician hero.
 * Pixel data extracted from SparkyJoe.png (${width}×${height}).
 * Body segmented into HEAD, TORSO, TOOL, LEFT_LEG, RIGHT_LEG for puppet animation.
 *
 * Animations: idle (2f), run (6f), grab/push (4f), jump (2f), fall (1f), attack (2f)
 * Total: 17 frames in a 2-column grid
 */

// ── Palette (${palette.length} colors) ──
const PAL = [
${palette.map(([hex, count], i) => `  0x${hex},  // c${i}: ${count}px`).join('\n')}
];

const W = ${width};  // sprite width
const H = ${height + 3}; // sprite height (with extra space for leg movement)

// ── Body part draw commands: [colorIndex, x, y, w, h] ──
${cmdArray(HEAD, 'HEAD')}

${cmdArray(TORSO, 'TORSO')}

${cmdArray(TOOL, 'TOOL')}

${cmdArray(LEFT_LEG, 'LEFT_LEG')}

${cmdArray(RIGHT_LEG, 'RIGHT_LEG')}

// ── Helper: draw a body part with offset ──
function drawPart(g, cmds, ox, oy, dx, dy) {
  let lastColor = -1;
  for (const [ci, x, y, w, h] of cmds) {
    if (ci !== lastColor) { g.fillStyle(PAL[ci], 1); lastColor = ci; }
    g.fillRect(ox + x + dx, oy + y + dy, w, h);
  }
}

// ── Draw a full character frame with body part offsets ──
function drawCharacter(g, ox, oy, offsets = {}) {
  const hd  = offsets.head  || { dx: 0, dy: 0 };
  const td  = offsets.torso || { dx: 0, dy: 0 };
  const tl  = offsets.tool  || { dx: 0, dy: 0 };
  const ll  = offsets.lLeg  || { dx: 0, dy: 0 };
  const rl  = offsets.rLeg  || { dx: 0, dy: 0 };

  // Draw back-to-front: legs first, then torso, then head, then tool
  drawPart(g, LEFT_LEG,  ox, oy, ll.dx, ll.dy);
  drawPart(g, RIGHT_LEG, ox, oy, rl.dx, rl.dy);
  drawPart(g, TORSO,     ox, oy, td.dx, td.dy);
  drawPart(g, HEAD,      ox, oy, hd.dx, hd.dy);
  drawPart(g, TOOL,      ox, oy, tl.dx, tl.dy);
}

// ── Grid position helper ──
function framePos(fi, W, H) {
  const cols = 2;
  return { x: (fi % cols) * W, y: Math.floor(fi / cols) * H };
}

/**
 * Main entry: generates the 'electrician' spritesheet and returns animation config.
 * @param {Phaser.Scene} scene
 */
export function generateSparkySprite(scene) {
  const cols = 2;
  const rows = 9;
  const textureWidth = W * cols;
  const textureHeight = H * rows;

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  let fi = 0;

  // ── Frame 0-1: IDLE (subtle breathing bounce) ──
  {
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y); // neutral pose
  }
  {
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y, {
      head:  { dx: 0, dy: -1 },
      torso: { dx: 0, dy: -1 },
      tool:  { dx: 0, dy: -1 },
    }); // slight upward bounce
  }

  // ── Frames 2-7: RUN cycle (6 frames) ──
  const runFrames = [
    // contact: left leg forward, right leg back
    { head: {dx:0,dy:0}, torso: {dx:0,dy:0}, tool: {dx:0,dy:0},
      lLeg: {dx:2,dy:-1}, rLeg: {dx:-2,dy:0} },
    // passing 1: legs crossing, body up
    { head: {dx:0,dy:-2}, torso: {dx:0,dy:-1}, tool: {dx:0,dy:-1},
      lLeg: {dx:1,dy:0}, rLeg: {dx:-1,dy:0} },
    // stride: right leg forward, left leg back
    { head: {dx:0,dy:-1}, torso: {dx:0,dy:0}, tool: {dx:0,dy:0},
      lLeg: {dx:-2,dy:0}, rLeg: {dx:2,dy:-1} },
    // contact mirror
    { head: {dx:0,dy:0}, torso: {dx:0,dy:0}, tool: {dx:0,dy:0},
      lLeg: {dx:-2,dy:0}, rLeg: {dx:2,dy:-1} },
    // passing 2
    { head: {dx:0,dy:-2}, torso: {dx:0,dy:-1}, tool: {dx:0,dy:-1},
      lLeg: {dx:-1,dy:0}, rLeg: {dx:1,dy:0} },
    // stride mirror
    { head: {dx:0,dy:-1}, torso: {dx:0,dy:0}, tool: {dx:0,dy:0},
      lLeg: {dx:2,dy:-1}, rLeg: {dx:-2,dy:0} },
  ];
  for (const offsets of runFrames) {
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y, offsets);
  }

  // ── Frames 8-11: GRAB/PUSH (4 frames) ──
  const grabFrames = [
    // reaching forward
    { head: {dx:1,dy:0}, torso: {dx:1,dy:0}, tool: {dx:3,dy:0},
      lLeg: {dx:0,dy:0}, rLeg: {dx:0,dy:0} },
    // pushing hard
    { head: {dx:2,dy:0}, torso: {dx:2,dy:0}, tool: {dx:4,dy:0},
      lLeg: {dx:-1,dy:0}, rLeg: {dx:1,dy:0} },
    // strain
    { head: {dx:2,dy:1}, torso: {dx:2,dy:0}, tool: {dx:4,dy:1},
      lLeg: {dx:-1,dy:0}, rLeg: {dx:1,dy:0} },
    // recovery
    { head: {dx:1,dy:0}, torso: {dx:1,dy:0}, tool: {dx:3,dy:0},
      lLeg: {dx:0,dy:0}, rLeg: {dx:0,dy:0} },
  ];
  for (const offsets of grabFrames) {
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y, offsets);
  }

  // ── Frames 12-13: JUMP (2 frames) ──
  {
    // Crouch / launch
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y, {
      head:  { dx: 0, dy: 1 },
      torso: { dx: 0, dy: 1 },
      tool:  { dx: 0, dy: 0 },
      lLeg:  { dx: 0, dy: 2 },
      rLeg:  { dx: 0, dy: 2 },
    });
  }
  {
    // Airborne - legs tucked, arms up
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y, {
      head:  { dx: 0, dy: -2 },
      torso: { dx: 0, dy: -1 },
      tool:  { dx: 0, dy: -3 },
      lLeg:  { dx: 1, dy: -1 },
      rLeg:  { dx: -1, dy: -1 },
    });
  }

  // ── Frame 14: FALL ──
  {
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y, {
      head:  { dx: 0, dy: -1 },
      torso: { dx: 0, dy: 0 },
      tool:  { dx: 0, dy: -2 },
      lLeg:  { dx: -1, dy: 1 },
      rLeg:  { dx: 1, dy: 1 },
    });
  }

  // ── Frames 15-16: ATTACK (cord strike - 2 frames) ──
  {
    // Wind up
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y, {
      head:  { dx: -1, dy: 0 },
      torso: { dx: -1, dy: 0 },
      tool:  { dx: -3, dy: -1 },
      lLeg:  { dx: 0, dy: 0 },
      rLeg:  { dx: 0, dy: 0 },
    });
  }
  {
    // Strike forward
    const p = framePos(fi++, W, H);
    drawCharacter(g, p.x, p.y, {
      head:  { dx: 1, dy: 0 },
      torso: { dx: 1, dy: 0 },
      tool:  { dx: 5, dy: 0 },
      lLeg:  { dx: -1, dy: 0 },
      rLeg:  { dx: 1, dy: 0 },
    });
  }

  const totalFrames = fi;

  // Generate texture
  g.generateTexture('electrician', textureWidth, textureHeight);
  g.destroy();

  // Add frames
  const tex = scene.textures.get('electrician');
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    tex.add(i, 0, col * W, row * H, W, H);
  }

  // Build frame references
  const frameRange = (start, end) => {
    const frames = [];
    for (let i = start; i <= end; i++) frames.push({ key: 'electrician', frame: i });
    return frames;
  };

  return {
    textureKey: 'electrician',
    frames: { frameWidth: W, frameHeight: H },
    animations: {
      idle:   { key: 'idle',   frames: frameRange(0, 1),                    frameRate: 4,  repeat: -1 },
      run:    { key: 'run',    frames: frameRange(2, 7),                    frameRate: 15, repeat: -1 },
      grab:   { key: 'grab',   frames: frameRange(8, 11),                   frameRate: 12, repeat: -1 },
      jump:   { key: 'jump',   frames: [{ key: 'electrician', frame: 13 }], frameRate: 18, repeat: 0  },
      fall:   { key: 'fall',   frames: [{ key: 'electrician', frame: 14 }], frameRate: 10, repeat: -1 },
      attack: { key: 'attack', frames: frameRange(15, 16),                  frameRate: 12, repeat: 0  },
    }
  };
}
`;

fs.writeFileSync('src/assets/SparkySprite.js', output, 'utf8');
console.log('\\nGenerated src/assets/SparkySprite.js');
console.log(`  ${palette.length} colors, ${merged.length} draw commands`);
console.log(`  Segments: HEAD=${HEAD.length}, TORSO=${TORSO.length}, TOOL=${TOOL.length}, LEFT_LEG=${LEFT_LEG.length}, RIGHT_LEG=${RIGHT_LEG.length}`);
