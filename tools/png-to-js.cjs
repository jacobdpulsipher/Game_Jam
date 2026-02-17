const fs = require('fs');
const { PNG } = require('pngjs');

const data = fs.readFileSync('src/assets/SparkyJoe.png');
const png = PNG.sync.read(data);
const { width, height } = png;

const BG = 'ffffff';

// Build pixel grid
const grid = [];
for (let y = 0; y < height; y++) {
  const row = [];
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = png.data[idx], g = png.data[idx+1], b = png.data[idx+2];
    const hex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    row.push(hex === BG ? null : hex);
  }
  grid.push(row);
}

// Build horizontal runs
const commands = [];
for (let y = 0; y < height; y++) {
  let x = 0;
  while (x < width) {
    if (!grid[y][x]) { x++; continue; }
    const hex = grid[y][x];
    let runLen = 1;
    while (x + runLen < width && grid[y][x + runLen] === hex) runLen++;
    commands.push({ hex, x, y, w: runLen, h: 1 });
    x += runLen;
  }
}

// Merge vertically
const map = new Map();
for (const cmd of commands) {
  const key = cmd.hex + ',' + cmd.x + ',' + cmd.w;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(cmd);
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
const merged = commands.filter(c => !toRemove.has(c));
merged.sort((a, b) => a.y - b.y || a.x - b.x);

// Palette
const colorCounts = new Map();
for (const cmd of merged) {
  colorCounts.set(cmd.hex, (colorCounts.get(cmd.hex) || 0) + cmd.w * cmd.h);
}
const palette = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]);
const palNames = {};
palette.forEach(([hex], i) => { palNames[hex] = 'c' + i; });

// Generate JS
const lines = [];
lines.push('/**');
lines.push(' * WorkerSprite.js');
lines.push(' *');
lines.push(' * Auto-generated from cleaned PNG sprite (SparkyJoe.png).');
lines.push(` * ${width}\u00d7${height} pixels, ${palette.length} colors, ${merged.length} draw calls.`);
lines.push(' * White background treated as transparent.');
lines.push(' */');
lines.push('');
lines.push(`// \u2500\u2500 Palette (${palette.length} colors, sorted by frequency) \u2500\u2500`);
lines.push('const PAL = {');
palette.forEach(([hex, count], i) => {
  lines.push(`  c${i}: 0x${hex},  // ${count} px`);
});
lines.push('};');
lines.push('');
lines.push(`const W = ${width};`);
lines.push(`const H = ${height};`);
lines.push('');
lines.push('/**');
lines.push(` * Generates the 'worker' texture procedurally.`);
lines.push(' * @param {Phaser.Scene} scene');
lines.push(' * @returns {{ textureKey: string, width: number, height: number }}');
lines.push(' */');
lines.push('export function generateWorkerSprite(scene) {');
lines.push("  if (scene.textures.exists('worker')) {");
lines.push("    return { textureKey: 'worker', width: W, height: H };");
lines.push('  }');
lines.push('');
lines.push('  const g = scene.make.graphics({ x: 0, y: 0, add: false });');
lines.push('');

let lastColor = null;
for (const cmd of merged) {
  const palName = palNames[cmd.hex];
  if (cmd.hex !== lastColor) {
    lines.push(`  g.fillStyle(PAL.${palName}, 1);`);
    lastColor = cmd.hex;
  }
  lines.push(`  g.fillRect(${cmd.x}, ${cmd.y}, ${cmd.w}, ${cmd.h});`);
}

lines.push('');
lines.push("  g.generateTexture('worker', W, H);");
lines.push('  g.destroy();');
lines.push('');
lines.push("  return { textureKey: 'worker', width: W, height: H };");
lines.push('}');
lines.push('');

const js = lines.join('\n');
fs.writeFileSync('src/assets/WorkerSprite.js', js);
console.log(`Generated WorkerSprite.js: ${merged.length} draw calls, ${palette.length} colors`);
console.log(`File: ${js.split('\n').length} lines, ${(js.length / 1024).toFixed(1)} KB`);
