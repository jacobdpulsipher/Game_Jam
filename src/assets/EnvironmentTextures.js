/**
 * EnvironmentTextures.js
 * Procedural texture generators for environmental / decorative props.
 * Uses Phaser.Graphics to draw and cache textures dynamically.
 */

/**
 * Generate a procedural street lamppost texture (industrial / cyberpunk style).
 * The lamppost is a tall thin iron pole with a bolted base and a cobra-head
 * street-light housing at the top.  A warm amber glow area is drawn under
 * the lamp hood.
 *
 * @param {Phaser.Scene} scene - The Phaser scene
 * @returns {string} Texture key ('lamppost')
 */
export function generateLamppost(scene) {
  const key = 'lamppost';

  if (scene.textures.exists(key)) {
    return key;
  }

  const W = 24;
  const H = 96;
  const cx = W / 2; // 12
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // --- Pole ---
  const poleW = 4;
  const poleX = cx - poleW / 2; // 10
  const poleTop = 16;  // leave room for lamp housing
  const poleBot = H - 12; // leave room for base

  // Main dark iron pole
  g.fillStyle(0x3a3a3a, 1);
  g.fillRect(poleX, poleTop, poleW, poleBot - poleTop);

  // Left highlight edge
  g.fillStyle(0x505050, 0.6);
  g.fillRect(poleX, poleTop, 1, poleBot - poleTop);

  // Right shadow edge
  g.fillStyle(0x222222, 0.5);
  g.fillRect(poleX + poleW - 1, poleTop, 1, poleBot - poleTop);

  // Rust / weathering patches on pole
  g.fillStyle(0x6e4422, 0.35);
  g.fillRect(poleX, 36, poleW, 3);
  g.fillStyle(0x7a4d28, 0.25);
  g.fillRect(poleX + 1, 52, 2, 4);
  g.fillStyle(0x6e4422, 0.3);
  g.fillRect(poleX, 68, poleW, 2);
  g.fillStyle(0x7a4d28, 0.2);
  g.fillRect(poleX, 45, 2, 2);

  // --- Base (wider foot) ---
  const baseW = 12;
  const baseH = 12;
  const baseX = cx - baseW / 2; // 6
  const baseY = H - baseH;      // 84

  // Main base block
  g.fillStyle(0x333333, 1);
  g.fillRect(baseX, baseY, baseW, baseH);

  // Taper from pole to base — small trapezoid connector
  g.fillStyle(0x383838, 1);
  g.fillTriangle(
    poleX, baseY,           // top-left at pole edge
    baseX, baseY + 4,       // bottom-left at base edge
    poleX, baseY + 4        // bottom-left at pole edge
  );
  g.fillTriangle(
    poleX + poleW, baseY,
    poleX + poleW, baseY + 4,
    baseX + baseW, baseY + 4
  );
  // Fill the connector mid-section
  g.fillStyle(0x383838, 1);
  g.fillRect(baseX, baseY + 3, baseW, 2);

  // Base border
  g.lineStyle(1, 0x222222, 1);
  g.strokeRect(baseX, baseY, baseW, baseH);

  // Top lip of base (lighter)
  g.fillStyle(0x4a4a4a, 0.8);
  g.fillRect(baseX, baseY, baseW, 2);

  // Bottom edge of base
  g.fillStyle(0x1a1a1a, 1);
  g.fillRect(baseX, H - 2, baseW, 2);

  // Rivets / bolts on base
  g.fillStyle(0x606060, 1);
  g.fillCircle(baseX + 2, baseY + 6, 1.2);
  g.fillCircle(baseX + baseW - 2, baseY + 6, 1.2);
  g.fillCircle(cx, baseY + 9, 1.2);
  // Rivet highlights
  g.fillStyle(0x888888, 0.6);
  g.fillCircle(baseX + 2 - 0.3, baseY + 6 - 0.3, 0.5);
  g.fillCircle(baseX + baseW - 2 - 0.3, baseY + 6 - 0.3, 0.5);
  g.fillCircle(cx - 0.3, baseY + 9 - 0.3, 0.5);

  // --- Lamp housing (cobra-head, facing right) ---
  // Hood body — a trapezoidal / rectangular shape at the top
  const hoodW = 14;
  const hoodH = 6;
  const hoodX = cx - 4; // slightly off-center, extending right
  const hoodY = 4;

  // Hood dark metal body
  g.fillStyle(0x3a3a3a, 1);
  g.fillRect(hoodX, hoodY, hoodW, hoodH);

  // Trapezoidal front edge (angled right side)
  g.fillStyle(0x333333, 1);
  g.fillTriangle(
    hoodX + hoodW, hoodY,
    hoodX + hoodW + 3, hoodY + 2,
    hoodX + hoodW, hoodY + hoodH
  );

  // Hood top highlight
  g.fillStyle(0x505050, 0.6);
  g.fillRect(hoodX, hoodY, hoodW, 1);

  // Hood outline
  g.lineStyle(1, 0x222222, 0.8);
  g.strokeRect(hoodX, hoodY, hoodW, hoodH);

  // Neck connecting hood to pole
  g.fillStyle(0x3a3a3a, 1);
  g.fillRect(poleX, hoodY + hoodH, poleW, poleTop - (hoodY + hoodH));

  // --- Light bulb area (under the hood) ---
  const bulbX = hoodX + 1;
  const bulbY = hoodY + hoodH;
  const bulbW = hoodW + 1;
  const bulbH = 4;

  // Warm bulb face
  g.fillStyle(0xffcc44, 0.9);
  g.fillRect(bulbX, bulbY, bulbW, bulbH);

  // Brighter center
  g.fillStyle(0xffdd66, 0.7);
  g.fillRect(bulbX + 2, bulbY, bulbW - 4, bulbH);

  // Hot-spot
  g.fillStyle(0xffeeaa, 0.5);
  g.fillRect(bulbX + 4, bulbY + 1, bulbW - 8, 2);

  // Bulb underline
  g.lineStyle(1, 0xcc9922, 0.6);
  g.lineBetween(bulbX, bulbY + bulbH, bulbX + bulbW, bulbY + bulbH);

  // --- Small glow haze around bulb ---
  g.fillStyle(0xffcc44, 0.08);
  g.fillCircle(bulbX + bulbW / 2, bulbY + 2, 10);
  g.fillStyle(0xffaa22, 0.06);
  g.fillCircle(bulbX + bulbW / 2, bulbY + 4, 14);

  g.generateTexture(key, W, H);
  g.destroy();

  return key;
}

/**
 * Generate a separate downward-cone glow texture for the lamppost light.
 * Mostly transparent with a warm amber radial glow fading downward.
 *
 * @param {Phaser.Scene} scene - The Phaser scene
 * @returns {string} Texture key ('lamppost_glow')
 */
export function generateLamppostGlow(scene) {
  const key = 'lamppost_glow';

  if (scene.textures.exists(key)) {
    return key;
  }

  const S = 64;
  const cx = S / 2; // 32
  const originY = 8; // glow source near top-center
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // Build the cone glow with a series of overlapping semi-transparent
  // ellipses/rects that widen and fade as they move down.

  const layers = [
    // { y, halfW, h, color, alpha }
    { y: originY,      halfW: 3,  h: 6,  color: 0xffdd66, alpha: 0.30 },
    { y: originY + 4,  halfW: 5,  h: 8,  color: 0xffcc44, alpha: 0.22 },
    { y: originY + 8,  halfW: 8,  h: 8,  color: 0xffcc44, alpha: 0.16 },
    { y: originY + 14, halfW: 11, h: 8,  color: 0xffaa22, alpha: 0.12 },
    { y: originY + 20, halfW: 14, h: 8,  color: 0xffaa22, alpha: 0.09 },
    { y: originY + 26, halfW: 17, h: 8,  color: 0xffaa22, alpha: 0.06 },
    { y: originY + 32, halfW: 20, h: 10, color: 0xff9911, alpha: 0.04 },
    { y: originY + 40, halfW: 24, h: 10, color: 0xff9911, alpha: 0.03 },
    { y: originY + 48, halfW: 28, h: 8,  color: 0xff8800, alpha: 0.02 },
  ];

  for (const l of layers) {
    g.fillStyle(l.color, l.alpha);
    const x = cx - l.halfW;
    g.fillRect(x, l.y, l.halfW * 2, l.h);
  }

  // Add a few circular halos near the source for softness
  g.fillStyle(0xffdd66, 0.18);
  g.fillCircle(cx, originY + 2, 5);
  g.fillStyle(0xffcc44, 0.12);
  g.fillCircle(cx, originY + 6, 8);
  g.fillStyle(0xffaa22, 0.07);
  g.fillCircle(cx, originY + 12, 12);
  g.fillStyle(0xffaa22, 0.04);
  g.fillCircle(cx, originY + 20, 18);
  g.fillStyle(0xff9911, 0.025);
  g.fillCircle(cx, originY + 30, 24);

  g.generateTexture(key, S, S);
  g.destroy();

  return key;
}

/**
 * Generate a procedural front-loading commercial dumpster texture (side view).
 * Dark green metal body with rust, scratches, reinforcement ridges, wheels,
 * handles, lid, and grime stains.
 *
 * @param {Phaser.Scene} scene  - The Phaser scene
 * @param {number} [width=80]  - Dumpster width in pixels
 * @param {number} [height=40] - Dumpster height in pixels
 * @returns {string} Texture key (`dumpster_${width}x${height}`)
 */
export function generateDumpster(scene, width = 80, height = 40) {
  const key = `dumpster_${width}x${height}`;

  if (scene.textures.exists(key)) {
    return key;
  }

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const rimH = 4;         // top rim height
  const lidH = 5;         // lid/flap height
  const wheelR = 3;       // wheel radius
  const bodyTop = lidH;   // body starts after lid
  const bodyBot = height - wheelR - 2; // body ends above wheels
  const bodyH = bodyBot - bodyTop;

  // --- Main body ---
  g.fillStyle(0x2a5a2a, 1);
  g.fillRect(2, bodyTop, width - 4, bodyH);

  // Slight gradient — darker at bottom
  g.fillStyle(0x1e4e1e, 0.4);
  g.fillRect(2, bodyTop + bodyH * 0.6, width - 4, bodyH * 0.4);

  // --- Lid / flap at top ---
  g.fillStyle(0x245024, 1);
  g.fillRect(2, 0, width - 4, lidH);
  // Lid bottom edge
  g.lineStyle(1, 0x1a3a1a, 0.8);
  g.lineBetween(2, lidH, width - 2, lidH);
  // Lid handle (small bump at center of lid)
  g.fillStyle(0x4a4a4a, 1);
  g.fillRect(width / 2 - 4, 0, 8, 2);
  g.lineStyle(0.5, 0x666666, 0.8);
  g.strokeRect(width / 2 - 4, 0, 8, 2);

  // --- Top rim (thick metal lip) ---
  g.fillStyle(0x4a6a4a, 1);
  g.fillRect(0, bodyTop, width, rimH);
  // Rim highlight
  g.fillStyle(0x6a8a6a, 0.5);
  g.fillRect(0, bodyTop, width, 1);
  // Rim shadow
  g.fillStyle(0x1a3a1a, 0.6);
  g.fillRect(0, bodyTop + rimH - 1, width, 1);

  // --- Vertical reinforcement ridges ---
  const ridgeW = 3;
  const ridge1X = Math.floor(width * 0.3);
  const ridge2X = Math.floor(width * 0.7) - ridgeW;
  const ridgeTop = bodyTop + rimH + 2;
  const ridgeBot = bodyBot - 2;
  const ridgeH = ridgeBot - ridgeTop;

  // Ridge 1
  g.fillStyle(0x326432, 0.8);
  g.fillRect(ridge1X, ridgeTop, ridgeW, ridgeH);
  g.lineStyle(0.5, 0x1a4a1a, 0.6);
  g.strokeRect(ridge1X, ridgeTop, ridgeW, ridgeH);

  // Ridge 2
  g.fillStyle(0x326432, 0.8);
  g.fillRect(ridge2X, ridgeTop, ridgeW, ridgeH);
  g.lineStyle(0.5, 0x1a4a1a, 0.6);
  g.strokeRect(ridge2X, ridgeTop, ridgeW, ridgeH);

  // --- Rust spots ---
  g.fillStyle(0x7a4d28, 0.3);
  g.fillRect(6, bodyTop + rimH + 5, 5, 3);
  g.fillStyle(0x6e4422, 0.25);
  g.fillRect(width - 14, bodyBot - 8, 6, 4);
  g.fillStyle(0x8a5a30, 0.2);
  g.fillRect(width / 2 + 4, bodyTop + rimH + 10, 4, 3);
  g.fillStyle(0x6e4422, 0.2);
  g.fillRect(ridge1X + ridgeW + 2, ridgeTop + 6, 3, 2);

  // --- Scratches (thin lighter lines) ---
  g.lineStyle(0.5, 0x5a7a5a, 0.25);
  g.lineBetween(10, bodyTop + rimH + 8, 10, bodyBot - 4);
  g.lineBetween(width - 10, bodyTop + rimH + 6, width - 8, bodyBot - 6);
  g.lineStyle(0.5, 0x3a5a3a, 0.3);
  g.lineBetween(width / 2 - 6, bodyTop + rimH + 12, width / 2 - 4, bodyBot - 5);

  // --- Grime / stain effects (darker splotches) ---
  g.fillStyle(0x1a3a1a, 0.2);
  g.fillRect(15, bodyBot - 10, 12, 6);
  g.fillStyle(0x0e2e0e, 0.15);
  g.fillRect(width - 28, bodyBot - 14, 10, 8);
  g.fillStyle(0x1a3a1a, 0.12);
  g.fillRect(width / 2 - 8, bodyBot - 6, 16, 4);

  // --- Side handles (small rectangles on left & right) ---
  const handleY = bodyTop + rimH + Math.floor(bodyH / 3);
  const handleW = 4;
  const handleH = 3;

  // Left handle
  g.fillStyle(0x4a4a4a, 1);
  g.fillRect(1, handleY, handleW, handleH);
  g.lineStyle(0.5, 0x666666, 0.7);
  g.strokeRect(1, handleY, handleW, handleH);

  // Right handle
  g.fillStyle(0x4a4a4a, 1);
  g.fillRect(width - handleW - 1, handleY, handleW, handleH);
  g.lineStyle(0.5, 0x666666, 0.7);
  g.strokeRect(width - handleW - 1, handleY, handleW, handleH);

  // --- Bottom edge ---
  g.fillStyle(0x1a3a1a, 1);
  g.fillRect(2, bodyBot, width - 4, 2);

  // --- Wheels ---
  const wheelY = height - wheelR - 1;
  const wheel1X = Math.floor(width * 0.2);
  const wheel2X = Math.floor(width * 0.8);

  // Wheel shadows
  g.fillStyle(0x111111, 0.4);
  g.fillCircle(wheel1X + 0.5, wheelY + 0.5, wheelR);
  g.fillCircle(wheel2X + 0.5, wheelY + 0.5, wheelR);

  // Wheel bodies
  g.fillStyle(0x222222, 1);
  g.fillCircle(wheel1X, wheelY, wheelR);
  g.fillCircle(wheel2X, wheelY, wheelR);

  // Wheel rim highlight
  g.lineStyle(0.5, 0x444444, 0.6);
  g.strokeCircle(wheel1X, wheelY, wheelR);
  g.strokeCircle(wheel2X, wheelY, wheelR);

  // Axle hub
  g.fillStyle(0x555555, 1);
  g.fillCircle(wheel1X, wheelY, 1);
  g.fillCircle(wheel2X, wheelY, 1);

  // --- Overall outline (industrial metal border) ---
  g.lineStyle(1, 0x1a2a1a, 1);
  g.strokeRect(1, 0, width - 2, bodyBot + 2);

  g.generateTexture(key, width, height);
  g.destroy();

  return key;
}

/**
 * Generate a dumpster-style platform texture (side view, jumpable).
 * Green metal commercial dumpster with rim, ridges, wheels, rust.
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @returns {string} Texture key
 */
export function generateDumpsterPlatform(scene, width, height) {
  const key = `dumpster_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const rimH = Math.max(3, Math.floor(height * 0.08));
  const bodyTop = 0;
  const bodyBot = height - 4;

  // Main body — dark green
  g.fillStyle(0x2a5a2a, 1);
  g.fillRect(1, bodyTop, width - 2, bodyBot - bodyTop);

  // Darker bottom half
  g.fillStyle(0x1e4e1e, 0.45);
  g.fillRect(1, bodyTop + (bodyBot - bodyTop) * 0.55, width - 2, (bodyBot - bodyTop) * 0.45);

  // Top rim (walkable edge) — lighter metal
  g.fillStyle(0x4a6a4a, 1);
  g.fillRect(0, bodyTop, width, rimH);
  g.fillStyle(0x6a8a6a, 0.5);
  g.fillRect(0, bodyTop, width, 1);

  // Vertical reinforcement ridges
  const ridgeW = 3;
  const ridge1X = Math.floor(width * 0.3);
  const ridge2X = Math.floor(width * 0.7) - ridgeW;
  g.fillStyle(0x326432, 0.7);
  g.fillRect(ridge1X, rimH + 2, ridgeW, bodyBot - rimH - 4);
  g.fillRect(ridge2X, rimH + 2, ridgeW, bodyBot - rimH - 4);
  g.lineStyle(0.5, 0x1a4a1a, 0.5);
  g.strokeRect(ridge1X, rimH + 2, ridgeW, bodyBot - rimH - 4);
  g.strokeRect(ridge2X, rimH + 2, ridgeW, bodyBot - rimH - 4);

  // Rust spots
  g.fillStyle(0x7a4d28, 0.3);
  g.fillRect(6, rimH + 4, 4, 2);
  g.fillStyle(0x6e4422, 0.25);
  g.fillRect(width - 12, bodyBot - 6, 5, 3);

  // Side handles
  const handleY = rimH + Math.floor((bodyBot - rimH) / 3);
  g.fillStyle(0x4a4a4a, 1);
  g.fillRect(0, handleY, 3, 3);
  g.fillRect(width - 3, handleY, 3, 3);

  // Wheels at bottom
  if (height >= 24) {
    const wheelY = height - 2;
    g.fillStyle(0x222222, 1);
    g.fillCircle(Math.floor(width * 0.2), wheelY, 2);
    g.fillCircle(Math.floor(width * 0.8), wheelY, 2);
  }

  // Bottom edge
  g.fillStyle(0x1a3a1a, 1);
  g.fillRect(1, bodyBot, width - 2, 2);

  // Overall outline
  g.lineStyle(1, 0x1a2a1a, 0.9);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate a brick chimney platform texture (side view).
 * Red/brown brick stack with mortar, cap, soot stains.
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @returns {string} Texture key
 */
export function generateChimneyPlatform(scene, width, height) {
  const key = `chimney_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const capH = Math.max(3, Math.floor(height * 0.08));

  // Body — base brick color
  g.fillStyle(0x8b3a2a, 1);
  g.fillRect(0, capH, width, height - capH);

  // Brick pattern — alternating rows
  const brickW = 8;
  const brickH = 4;
  const mortarC = 0x5a2218;
  for (let row = 0; row * brickH + capH < height; row++) {
    const y = capH + row * brickH;
    const offset = (row % 2 === 0) ? 0 : brickW / 2;

    // Horizontal mortar line
    g.lineStyle(0.5, mortarC, 0.7);
    g.lineBetween(0, y, width, y);

    // Vertical mortar lines
    for (let bx = offset; bx < width; bx += brickW) {
      g.lineBetween(bx, y, bx, y + brickH);
    }

    // Slight color variation per brick
    for (let bx = offset; bx < width; bx += brickW) {
      const shade = ((bx * 13 + row * 7) % 30) - 15;
      const r = Math.min(255, Math.max(0, 0x8b + shade));
      const gb = Math.min(255, Math.max(0, 0x3a + Math.floor(shade / 2)));
      g.fillStyle((r << 16) | (gb << 8) | (gb - 0x10), 0.3);
      g.fillRect(bx + 1, y + 1, Math.min(brickW - 1, width - bx - 1), brickH - 1);
    }
  }

  // Cap at top — lighter, walkable surface
  g.fillStyle(0x9a4a3a, 1);
  g.fillRect(0, 0, width, capH);
  g.fillStyle(0xaa5a4a, 0.5);
  g.fillRect(0, 0, width, 1);

  // Soot stains inside top
  g.fillStyle(0x222222, 0.25);
  const sootW = Math.max(8, Math.floor(width * 0.4));
  g.fillRect(Math.floor((width - sootW) / 2), capH, sootW, Math.min(6, height - capH));

  // Darker edges
  g.fillStyle(0x1a0a0a, 0.15);
  g.fillRect(0, capH, 2, height - capH);
  g.fillRect(width - 2, capH, 2, height - capH);

  // Outline
  g.lineStyle(1, 0x3a1a10, 0.8);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate an AC/HVAC unit platform texture (side view).
 * Gray-blue boxy metal housing with vent slats, exhaust fan, bolts.
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @returns {string} Texture key
 */
export function generateACUnitPlatform(scene, width, height) {
  const key = `ac_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const topH = Math.max(3, Math.floor(height * 0.1));

  // Main body — gray-blue
  g.fillStyle(0x4a5565, 1);
  g.fillRect(0, topH, width, height - topH);

  // Top surface — lighter metallic
  g.fillStyle(0x5a6575, 1);
  g.fillRect(0, 0, width, topH);
  g.fillStyle(0x6a7585, 0.5);
  g.fillRect(0, 0, width, 1);

  // Horizontal vent slats
  g.lineStyle(1, 0x3a4555, 0.6);
  const slatStart = topH + 3;
  const slatEnd = height - 4;
  for (let sy = slatStart; sy < slatEnd; sy += 3) {
    g.lineBetween(3, sy, width * 0.6, sy);
  }

  // Exhaust fan circle on right side
  const fanR = Math.min(Math.floor(height * 0.25), Math.floor(width * 0.15));
  const fanCX = width - fanR - 6;
  const fanCY = topH + Math.floor((height - topH) / 2);
  g.lineStyle(1, 0x3a4050, 0.7);
  g.strokeCircle(fanCX, fanCY, fanR);
  // Fan grid lines
  g.lineStyle(0.5, 0x3a4050, 0.5);
  g.lineBetween(fanCX - fanR, fanCY, fanCX + fanR, fanCY);
  g.lineBetween(fanCX, fanCY - fanR, fanCX, fanCY + fanR);
  g.fillStyle(0x3a4050, 0.4);
  g.fillCircle(fanCX, fanCY, 2);

  // Panel seam down the middle
  g.lineStyle(0.5, 0x3a4050, 0.4);
  g.lineBetween(Math.floor(width * 0.55), topH + 2, Math.floor(width * 0.55), height - 2);

  // Corner bolts
  g.fillStyle(0x6a7080, 1);
  g.fillCircle(4, topH + 4, 1.5);
  g.fillCircle(width - 4, topH + 4, 1.5);
  g.fillCircle(4, height - 4, 1.5);
  g.fillCircle(width - 4, height - 4, 1.5);

  // Border
  g.lineStyle(1, 0x3a4050, 0.9);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate a metal ventilation box / duct platform texture.
 * Galvanized silver-gray with diamond-plate pattern, rivets.
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @returns {string} Texture key
 */
export function generateVentBoxPlatform(scene, width, height) {
  const key = `vent_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // Body — galvanized metal
  g.fillStyle(0x6a7080, 1);
  g.fillRect(0, 0, width, height);

  // Darker bottom half
  g.fillStyle(0x5a6070, 0.4);
  g.fillRect(0, Math.floor(height * 0.5), width, Math.ceil(height * 0.5));

  // Top highlight
  g.fillStyle(0x8a90a0, 0.4);
  g.fillRect(0, 0, width, 2);

  // Diamond-plate pattern on top surface
  g.lineStyle(0.5, 0x7a8090, 0.35);
  for (let dx = 0; dx < width; dx += 6) {
    g.lineBetween(dx, 0, dx + 4, Math.min(4, height));
    g.lineBetween(dx + 4, 0, dx, Math.min(4, height));
  }

  // Side seam line
  g.lineStyle(0.5, 0x4a5060, 0.5);
  g.lineBetween(2, Math.floor(height * 0.45), width - 2, Math.floor(height * 0.45));

  // Rivets along edges
  g.fillStyle(0x8a90a0, 0.7);
  for (let rx = 6; rx < width; rx += 10) {
    g.fillCircle(rx, 3, 1);
    g.fillCircle(rx, height - 3, 1);
  }

  // Border
  g.lineStyle(1, 0x4a5060, 0.8);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate a wooden shipping crate platform texture.
 * Wood planks with cross braces, corner brackets, grain.
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @returns {string} Texture key
 */
export function generateCratePlatform(scene, width, height) {
  const key = `crate_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // Base wood color
  g.fillStyle(0x6a5020, 1);
  g.fillRect(0, 0, width, height);

  // Horizontal plank lines
  g.lineStyle(0.5, 0x4a3810, 0.6);
  const plankH = Math.max(6, Math.floor(height / 4));
  for (let py = plankH; py < height; py += plankH) {
    g.lineBetween(0, py, width, py);
  }

  // Vertical wood grain (subtle)
  g.lineStyle(0.5, 0x5a4518, 0.2);
  for (let gx = 4; gx < width; gx += 7 + (gx % 3)) {
    g.lineBetween(gx, 0, gx + 1, height);
  }

  // Cross braces on front face
  g.lineStyle(1.5, 0x5a4018, 0.5);
  g.lineBetween(2, 2, width - 2, height - 2);
  g.lineBetween(width - 2, 2, 2, height - 2);

  // Corner brackets (metal)
  const bracketS = Math.min(6, Math.floor(Math.min(width, height) * 0.15));
  g.fillStyle(0x555555, 0.8);
  // Top-left
  g.fillRect(0, 0, bracketS, 2);
  g.fillRect(0, 0, 2, bracketS);
  // Top-right
  g.fillRect(width - bracketS, 0, bracketS, 2);
  g.fillRect(width - 2, 0, 2, bracketS);
  // Bottom-left
  g.fillRect(0, height - 2, bracketS, 2);
  g.fillRect(0, height - bracketS, 2, bracketS);
  // Bottom-right
  g.fillRect(width - bracketS, height - 2, bracketS, 2);
  g.fillRect(width - 2, height - bracketS, 2, bracketS);

  // Nails at bracket corners
  g.fillStyle(0x777777, 0.9);
  g.fillCircle(2, 2, 1);
  g.fillCircle(width - 2, 2, 1);
  g.fillCircle(2, height - 2, 1);
  g.fillCircle(width - 2, height - 2, 1);

  // Stenciled marks (small rectangles suggesting text)
  g.fillStyle(0x333333, 0.15);
  g.fillRect(Math.floor(width * 0.3), Math.floor(height * 0.35), 12, 2);
  g.fillRect(Math.floor(width * 0.3), Math.floor(height * 0.5), 8, 2);

  // Border
  g.lineStyle(1, 0x3a2a08, 0.7);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate a skyscraper / tall building platform texture.
 * Close-up apartment-style building with brick facade, large windows,
 * window sills, AC units, fire escape details, and weathering.
 * Used for the side-wall "buildings" in tutorial levels.
 *
 * @param {Phaser.Scene} scene
 * @param {number} width
 * @param {number} height
 * @returns {string} Texture key
 */
export function generateSkyscraperPlatform(scene, width, height) {
  const key = `skyscraper_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // ── Base brick facade ──
  // Main brick color — warm brownish-red
  g.fillStyle(0x4a2e24, 1);
  g.fillRect(0, 0, width, height);

  // Brick pattern (horizontal courses with offset)
  const brickW = 16;
  const brickH = 8;
  const mortarColor = 0x3a2018;
  // Horizontal mortar lines
  g.fillStyle(mortarColor, 0.5);
  for (let by = 0; by < height; by += brickH) {
    g.fillRect(0, by, width, 1);
  }
  // Vertical mortar lines (offset every other row)
  for (let by = 0; by < height; by += brickH) {
    const row = Math.floor(by / brickH);
    const offset = (row % 2 === 0) ? 0 : brickW / 2;
    g.fillStyle(mortarColor, 0.4);
    for (let bx = offset; bx < width; bx += brickW) {
      g.fillRect(bx, by, 1, brickH);
    }
  }

  // Subtle brick color variation
  for (let by = 0; by < height; by += brickH) {
    const row = Math.floor(by / brickH);
    const offset = (row % 2 === 0) ? 0 : brickW / 2;
    for (let bx = offset; bx < width; bx += brickW) {
      const hash = ((bx * 7 + by * 13) % 31);
      if (hash < 4) {
        // Slightly darker brick
        g.fillStyle(0x3d2218, 0.3);
        g.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);
      } else if (hash < 7) {
        // Slightly lighter / warmer brick
        g.fillStyle(0x5a3830, 0.25);
        g.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);
      }
    }
  }

  // ── Cornice / ledge at top ──
  g.fillStyle(0x5a4a3a, 1);
  g.fillRect(0, 0, width, 6);
  // Decorative trim line
  g.fillStyle(0x6a5a48, 0.8);
  g.fillRect(0, 6, width, 2);
  // Top highlight
  g.fillStyle(0x7a6a58, 0.5);
  g.fillRect(0, 0, width, 1);

  // ── Side edges (darker for depth) ──
  g.fillStyle(0x2a1a10, 0.5);
  g.fillRect(0, 0, 3, height);
  g.fillStyle(0x1a0e08, 0.5);
  g.fillRect(width - 3, 0, 3, height);

  // ── Windows — large, close-up style ──
  const winW = 12;
  const winH = 16;
  const spacingX = Math.max(22, Math.floor(width / Math.max(1, Math.floor(width / 24))));
  const spacingY = 32;
  const marginX = 10;
  const marginY = 16;

  let floorRow = 0;
  for (let wy = marginY; wy + winH < height - 10; wy += spacingY) {
    // Occasional blank floor (mechanical band / floor divider)
    if (floorRow > 0 && floorRow % 6 === 0) {
      // Stone band between sections
      g.fillStyle(0x3a3030, 0.6);
      g.fillRect(0, wy - 2, width, 4);
      floorRow++;
      continue;
    }
    for (let wx = marginX; wx + winW < width - marginX; wx += spacingX) {
      // Deterministic lit/unlit via position hash
      const hash = ((wx * 3 + wy * 7) % 23);

      // Window recess (slightly darker than brick)
      g.fillStyle(0x2a1810, 0.6);
      g.fillRect(wx - 1, wy - 1, winW + 2, winH + 2);

      if (hash < 3) {
        // Warm lit window — yellow/orange glow
        const warm = hash === 0 ? 0x886633 : hash === 1 ? 0x7a6030 : 0x6a5528;
        g.fillStyle(warm, 0.8);
        g.fillRect(wx, wy, winW, winH);
        // Curtain / blind half-drawn
        if (hash === 1) {
          g.fillStyle(0x554422, 0.4);
          g.fillRect(wx, wy, winW, winH / 2);
        }
      } else if (hash < 6) {
        // Bluish reflected sky
        g.fillStyle(0x1a2a44, 0.9);
        g.fillRect(wx, wy, winW, winH);
      } else {
        // Dark window
        g.fillStyle(0x0e0e1a, 0.95);
        g.fillRect(wx, wy, winW, winH);
      }

      // Window frame / sill
      g.fillStyle(0x4a4040, 0.7);
      g.fillRect(wx - 1, wy + winH, winW + 2, 2); // sill
      g.fillRect(wx + winW / 2 - 0.5, wy, 1, winH); // center mullion

      // Occasional AC unit sticking out below window
      if (hash % 11 === 3 && wy + winH + 10 < height - 10) {
        g.fillStyle(0x5a5a5a, 0.8);
        g.fillRect(wx + 1, wy + winH + 2, winW - 2, 6);
        g.fillStyle(0x4a4a4a, 0.6);
        g.fillRect(wx + 2, wy + winH + 3, winW - 4, 1);
        g.fillRect(wx + 2, wy + winH + 6, winW - 4, 1);
      }
    }
    floorRow++;
  }

  // ── Fire escape (if wide enough) ──
  if (width > 70) {
    const feX = width - 22;
    g.fillStyle(0x3a3a3a, 0.7);
    for (let fy = marginY + spacingY; fy < height - 40; fy += spacingY) {
      // Platform
      g.fillRect(feX, fy, 18, 2);
      // Railing
      g.fillStyle(0x3a3a3a, 0.5);
      g.fillRect(feX + 16, fy - 14, 2, 14);
      // Ladder to next
      g.fillStyle(0x3a3a3a, 0.4);
      g.fillRect(feX + 6, fy + 2, 2, spacingY - 4);
      g.fillRect(feX + 10, fy + 2, 2, spacingY - 4);
      // Rungs
      for (let ry = fy + 6; ry < fy + spacingY - 2; ry += 6) {
        g.fillRect(feX + 6, ry, 6, 1);
      }
      g.fillStyle(0x3a3a3a, 0.7);
    }
  }

  // ── Weathering / staining ──
  // Water stain streaks
  g.fillStyle(0x2a1a10, 0.15);
  g.fillRect(Math.floor(width * 0.3), 8, 3, height * 0.4);
  g.fillStyle(0x1a1008, 0.1);
  g.fillRect(Math.floor(width * 0.7), 20, 2, height * 0.3);

  // ── Rooftop equipment silhouettes at the top ──
  if (width > 60) {
    // Water tank
    g.fillStyle(0x3a3028, 1);
    g.fillRect(14, 8, 3, 10);
    g.fillRect(28, 8, 3, 10);
    g.fillRect(12, 0, 22, 8);
    g.fillStyle(0x4a4038, 0.5);
    g.fillRect(14, 2, 18, 2);
  }

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

export default {
  generateLamppost,
  generateLamppostGlow,
  generateDumpster,
  generateDumpsterPlatform,
  generateChimneyPlatform,
  generateACUnitPlatform,
  generateVentBoxPlatform,
  generateCratePlatform,
  generateSkyscraperPlatform,
};
