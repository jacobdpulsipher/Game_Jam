/**
 * png-to-js.js
 * Reads SparkyJoe_clean.png and generates WorkerSprite.js
 */
const fs = require('fs');
const PNG = require('pngjs').PNG;

const data = fs.readFileSync('src/assets/SparkyJoe_clean.png');
const png = PNG.sync.read(data);
const { width, height } = png;
const px = png.data;

// Build palette
const colorMap = new Map();
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (px[i + 3] < 10) continue;
    const hex = ((px[i] << 16) | (px[i + 1] << 8) | px[i + 2]).toString(16).padStart(6, '0');
    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
  }
}
const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
const palNames = {};
sorted.forEach(([hex], i) => { palNames[hex] = 'c' + i; });

// Build draw commands with horizontal merge
const commands = [];
for (let y = 0; y < height; y++) {
  let x = 0;
  while (x < width) {
    const i = (y * width + x) * 4;
    if (px[i + 3] < 10) { x++; continue; }
    const hex = ((px[i] << 16) | (px[i + 1] << 8) | px[i + 2]).toString(16).padStart(6, '0');
    let run = 1;
    while (x + run < width) {
      const j = (y * width + x + run) * 4;
      if (px[j + 3] < 10) break;
      const h2 = ((px[j] << 16) | (px[j + 1] << 8) | px[j + 2]).toString(16).padStart(6, '0');
      if (h2 !== hex) break;
      run++;
    }
    commands.push({ hex, x, y, w: run, h: 1 });
    x += run;
  }
}

// Vertical merge
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

// Sort by color to minimize fillStyle switches
merged.sort((a, b) => {
  if (a.hex !== b.hex) return a.hex < b.hex ? -1 : 1;
  if (a.y !== b.y) return a.y - b.y;
  return a.x - b.x;
});

// Generate JS
const lines = [];
lines.push('/**');
lines.push(' * WorkerSprite.js');
lines.push(' *');
lines.push(' * Auto-generated from cleaned PNG sprite.');
lines.push(` * ${width}\u00d7${height} pixels, ${sorted.length} colors, ${merged.length} draw calls.`);
lines.push(' */');
lines.push('');
lines.push(`// Palette (${sorted.length} colors)`);
lines.push('const PAL = {');
sorted.forEach(([hex, count], i) => {
  lines.push(`  c${i}: 0x${hex},  // ${count}x`);
});
lines.push('};');
lines.push('');
lines.push(`const W = ${width};`);
lines.push(`const H = ${height};`);
lines.push('');
lines.push('/**');
lines.push(' * Generates the worker texture procedurally.');
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

let lastHex = null;
for (const cmd of merged) {
  if (cmd.hex !== lastHex) {
    lines.push(`  g.fillStyle(PAL.${palNames[cmd.hex]}, 1);`);
    lastHex = cmd.hex;
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
console.log(`Generated: ${sorted.length} colors, ${merged.length} draw calls`);
console.log(`File: ${(js.length / 1024).toFixed(1)} KB, ${lines.length} lines`);
