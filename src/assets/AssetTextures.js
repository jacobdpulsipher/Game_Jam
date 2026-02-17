/**
 * AssetTextures.js
 * Procedural texture generators for variable-dimension game elements.
 * Uses Phaser.Graphics to draw and cache textures dynamically.
 */

/**
 * Generate a procedural door texture with industrial style.
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} width - Door width in pixels
 * @param {number} height - Door height in pixels
 * @param {string} color - Base color (hex), defaults to #444444
 * @returns {string} Texture key
 */
export function generateDoor(scene, width, height, color = '#444444') {
  const key = `door_${width}x${height}_${color.replace('#', '')}`;
  
  if (scene.textures.exists(key)) {
    return key;
  }
  
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // Main door body
  graphics.fillStyle(0x444444, 1);
  graphics.fillRect(0, 0, width, height);
  
  // Dark frame
  graphics.lineStyle(2, 0x222222, 1);
  graphics.strokeRect(0, 0, width, height);
  
  // Lighter metallic frame
  graphics.lineStyle(1, 0x666666, 0.6);
  graphics.strokeRect(2, 2, width - 4, height - 4);
  
  // Panel lines dividing door vertically
  const panelDividers = 2;
  const panelWidth = width / (panelDividers + 1);
  for (let i = 1; i <= panelDividers; i++) {
    const x = panelWidth * i;
    graphics.lineStyle(1, 0x333333, 0.8);
    graphics.lineBetween(x, 5, x, height - 5);
  }
  
  // Rivets (industrial detail)
  graphics.fillStyle(0x555555, 1);
  const rivetSpacing = Math.max(width / 6, 12);
  const rivetSize = 1.5;
  for (let y = 10; y < height - 10; y += 15) {
    for (let x = 10; x < width - 10; x += rivetSpacing) {
      graphics.fillCircle(x, y, rivetSize);
    }
  }
  
  // Small window/indicator light in center top area
  const windowSize = Math.min(width / 4, 12);
  const windowX = width / 2 - windowSize / 2;
  const windowY = 8;
  graphics.fillStyle(0x1a1a1a, 1);
  graphics.fillRect(windowX, windowY, windowSize, windowSize);
  graphics.lineStyle(1, 0x666666, 0.8);
  graphics.strokeRect(windowX, windowY, windowSize, windowSize);
  
  graphics.generateTexture(key, width, height);
  graphics.destroy();
  
  return key;
}

/**
 * Generate a procedural elevator platform texture.
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} width - Platform width in pixels
 * @param {number} height - Platform height in pixels
 * @param {string} color - Primary color (hex), defaults to #4488cc
 * @param {string} colorOff - Inactive/shadow color (hex), defaults to #334455
 * @returns {string} Texture key
 */
export function generateElevator(scene, width, height, color = '#4488cc', colorOff = '#334455') {
  const key = `elevator_${width}x${height}_${color.replace('#', '')}_${colorOff.replace('#', '')}`;
  
  if (scene.textures.exists(key)) {
    return key;
  }
  
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // Main platform surface
  graphics.fillStyle(0x4488cc, 1);
  graphics.fillRect(4, 4, width - 8, height - 8);
  
  // Top trim
  graphics.fillStyle(0x667788, 1);
  graphics.fillRect(0, 0, width, 4);
  
  // Bottom trim
  graphics.fillStyle(0x223344, 1);
  graphics.fillRect(0, height - 4, width, 4);
  
  // Safety rails on sides (vertical posts)
  const postWidth = 4;
  const postHeight = height - 8;
  
  // Left rail
  graphics.fillStyle(0x334455, 1);
  graphics.fillRect(0, 4, postWidth, postHeight);
  graphics.lineStyle(1, 0x556677, 1);
  graphics.strokeRect(0, 4, postWidth, postHeight);
  
  // Right rail
  graphics.fillRect(width - postWidth, 4, postWidth, postHeight);
  graphics.strokeRect(width - postWidth, 4, postWidth, postHeight);
  
  // Metal plating pattern on top
  graphics.lineStyle(0.5, 0x667788, 0.4);
  const plateSpacing = 8;
  for (let x = 8; x < width - 8; x += plateSpacing) {
    graphics.lineBetween(x, 8, x, height - 8);
  }
  
  // Corner posts (decorative)
  const cornerSize = 3;
  graphics.fillStyle(0x556677, 1);
  graphics.fillRect(2, 4, cornerSize, cornerSize);
  graphics.fillRect(width - 5, 4, cornerSize, cornerSize);
  graphics.fillRect(2, height - 7, cornerSize, cornerSize);
  graphics.fillRect(width - 5, height - 7, cornerSize, cornerSize);
  
  graphics.generateTexture(key, width, height);
  graphics.destroy();
  
  return key;
}

/**
 * Generate a procedural drawbridge texture.
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} width - Bridge width in pixels
 * @param {number} height - Bridge height in pixels
 * @param {string} color - Wood color (hex), defaults to #8B6914
 * @returns {string} Texture key
 */
export function generateDrawbridge(scene, width, height, color = '#8B6914') {
  const key = `drawbridge_${width}x${height}_${color.replace('#', '')}`;
  
  if (scene.textures.exists(key)) {
    return key;
  }
  
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // Wood base
  graphics.fillStyle(0x8B6914, 1);
  graphics.fillRect(0, 0, width, height);
  
  // Wood grain (horizontal stripes for grip/texture)
  graphics.lineStyle(1, 0x6B4910, 0.4);
  for (let y = 2; y < height; y += 6) {
    graphics.lineBetween(0, y, width, y);
  }
  
  // Darker edges
  graphics.lineStyle(2, 0x5C3D0F, 0.6);
  graphics.strokeRect(0, 0, width, height);
  
  // Metal reinforcement bands (3 bands across)
  const bands = 3;
  const bandHeight = 6;
  const bandColor = 0x666666;
  
  for (let i = 0; i < bands; i++) {
    const y = (height / (bands + 1)) * (i + 1) - bandHeight / 2;
    graphics.fillStyle(bandColor, 0.8);
    graphics.fillRect(0, y, width, bandHeight);
    
    // Metal bracket details
    graphics.lineStyle(1, 0x444444, 0.6);
    graphics.strokeRect(4, y + 1, 8, bandHeight - 2);
    graphics.strokeRect(width - 12, y + 1, 8, bandHeight - 2);
  }
  
  // Metal corner brackets
  const bracketSize = 8;
  graphics.fillStyle(0x555555, 1);
  graphics.fillRect(0, 0, bracketSize, bracketSize);
  graphics.fillRect(width - bracketSize, 0, bracketSize, bracketSize);
  graphics.fillRect(0, height - bracketSize, bracketSize, bracketSize);
  graphics.fillRect(width - bracketSize, height - bracketSize, bracketSize, bracketSize);
  
  graphics.generateTexture(key, width, height);
  graphics.destroy();
  
  return key;
}

/**
 * Generate a procedural wooden crate texture.
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {number} size - Crate size in pixels (typically 48)
 * @param {string} color - Base wood color (hex), defaults to #8B6914
 * @returns {string} Texture key
 */
export function generateWoodenCrate(scene, size = 48, color = '#8B6914') {
  const key = `crate_${size}_${color.replace('#', '')}`;
  
  if (scene.textures.exists(key)) {
    return key;
  }
  
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // Flat 2D wooden crate that fills the full size×size area
  // Base wood color
  graphics.fillStyle(0x8B6914, 1);
  graphics.fillRect(0, 0, size, size);
  
  // Darker wood border / frame
  graphics.lineStyle(2, 0x5C3D0F, 1);
  graphics.strokeRect(1, 1, size - 2, size - 2);
  
  // Cross braces (X shape)
  graphics.lineStyle(2, 0x6B5410, 0.8);
  graphics.lineBetween(4, 4, size - 4, size - 4);
  graphics.lineBetween(size - 4, 4, 4, size - 4);
  
  // Horizontal plank lines
  graphics.lineStyle(1, 0x5C3D0F, 0.5);
  const planks = 3;
  for (let i = 1; i < planks; i++) {
    const py = (size / planks) * i;
    graphics.lineBetween(2, py, size - 2, py);
  }
  
  // Wood grain (subtle vertical lines)
  graphics.lineStyle(0.5, 0x7A5A12, 0.3);
  for (let x = 6; x < size; x += 7) {
    graphics.lineBetween(x, 2, x, size - 2);
  }
  
  // Corner nails
  graphics.fillStyle(0x444444, 1);
  const m = 6;
  graphics.fillCircle(m, m, 1.5);
  graphics.fillCircle(size - m, m, 1.5);
  graphics.fillCircle(m, size - m, 1.5);
  graphics.fillCircle(size - m, size - m, 1.5);
  
  // Center nail
  graphics.fillCircle(size / 2, size / 2, 2);
  
  graphics.generateTexture(key, size, size);
  graphics.destroy();
  
  return key;
}

/**
 * Generate a circular 3-prong electrical outlet texture.
 * Off-white face plate with black prong slots (standard US outlet).
 * When powered, a plug appears inserted and a small LED glows on top.
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {boolean} powered - Whether the outlet is powered (plug inserted)
 * @returns {string} Texture key
 */
export function generateOutlet(scene, powered = false) {
  const key = `outlet_${powered ? 'on' : 'off'}`;

  if (scene.textures.exists(key)) {
    return key;
  }

  const size = 32; // square canvas (extra room for box behind circle)
  const cx = size / 2;
  const cy = size / 2;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // --- Gray junction box behind the outlet ---
  g.fillStyle(0x555555, 1);
  g.fillRoundedRect(1, 1, size - 2, size - 2, 3);
  // Box border
  g.lineStyle(1, 0x3a3a3a, 1);
  g.strokeRoundedRect(1, 1, size - 2, size - 2, 3);
  // Top edge highlight
  g.lineStyle(1, 0x6a6a6a, 0.5);
  g.beginPath();
  g.moveTo(3, 2); g.lineTo(size - 3, 2);
  g.strokePath();

  // --- Circular face plate ---
  // Shadow behind plate
  g.fillStyle(0x222222, 0.5);
  g.fillCircle(cx + 1, cy + 1, 12);
  // Off-white plate
  g.fillStyle(0xede8df, 1);
  g.fillCircle(cx, cy, 12);
  // Subtle rim
  g.lineStyle(1, 0xc5c0b7, 1);
  g.strokeCircle(cx, cy, 12);
  // Inner bevel highlight (top arc, faked with a lighter fill)
  g.fillStyle(0xf5f2ec, 0.6);
  g.fillCircle(cx, cy - 1, 10);
  // Inner bevel shadow (bottom)
  g.fillStyle(0xd8d3ca, 0.4);
  g.fillRect(cx - 9, cy + 2, 18, 7);

  if (!powered) {
    // --- 3-prong holes (unplugged) ---
    // Left slot (hot) — vertical rectangle
    g.fillStyle(0x111111, 1);
    g.fillRect(cx - 5, cy - 4, 2, 6);
    // Right slot (neutral) — vertical rectangle (slightly taller)
    g.fillRect(cx + 3, cy - 5, 2, 7);
    // Bottom slot (ground) — half-circle / round hole
    g.fillCircle(cx, cy + 5, 1.8);

    // Slot outlines for depth
    g.lineStyle(0.5, 0x333333, 0.6);
    g.strokeRect(cx - 5, cy - 4, 2, 6);
    g.strokeRect(cx + 3, cy - 5, 2, 7);
    g.strokeCircle(cx, cy + 5, 1.8);

    // Center screw
    g.fillStyle(0xb0aba2, 1);
    g.fillCircle(cx, cy - 9, 1.2);
    g.fillStyle(0xd5d0c7, 0.8);
    g.fillCircle(cx - 0.3, cy - 9.3, 0.5);
  } else {
    // --- Plugged-in state ---
    // Plug body (dark gray plastic, covers the prong area)
    g.fillStyle(0x3a3a3a, 1);
    g.fillRoundedRect(cx - 6, cy - 6, 12, 13, 2);
    // Plug highlight edge
    g.lineStyle(0.5, 0x555555, 0.8);
    g.strokeRoundedRect(cx - 6, cy - 6, 12, 13, 2);
    // Plug body sheen
    g.fillStyle(0x4a4a4a, 0.5);
    g.fillRect(cx - 4, cy - 5, 8, 2);

    // Cord coming out the bottom of the plug
    g.lineStyle(2, 0x333333, 1);
    g.beginPath();
    g.moveTo(cx, cy + 7);
    g.lineTo(cx, cy + 12);
    g.strokePath();
    // Cord highlight
    g.lineStyle(0.5, 0x555555, 0.5);
    g.beginPath();
    g.moveTo(cx - 0.5, cy + 7);
    g.lineTo(cx - 0.5, cy + 12);
    g.strokePath();

    // Center screw (still visible above plug)
    g.fillStyle(0xb0aba2, 1);
    g.fillCircle(cx, cy - 9, 1.2);
    g.fillStyle(0xd5d0c7, 0.8);
    g.fillCircle(cx - 0.3, cy - 9.3, 0.5);

    // --- Glow indicator LED on top ---
    // Outer glow halo
    g.fillStyle(0x00ff44, 0.15);
    g.fillCircle(cx, cy - 12, 5);
    g.fillStyle(0x00ff44, 0.25);
    g.fillCircle(cx, cy - 12, 3);
    // LED dot
    g.fillStyle(0x00ff88, 1);
    g.fillCircle(cx, cy - 12, 1.5);
    // Specular
    g.fillStyle(0xaaffcc, 0.9);
    g.fillCircle(cx - 0.3, cy - 12.3, 0.6);
  }

  g.generateTexture(key, size, size);
  g.destroy();

  return key;
}

/**
 * Generate a 3-prong electrical plug texture.
 * Used for extension cord ends.
 * @param {Phaser.Scene} scene - The Phaser scene
 * @returns {string} Texture key
 */
export function generatePlug(scene) {
  const key = 'plug_2prong';

  if (scene.textures.exists(key)) {
    return key;
  }

  const width = 10;
  const height = 16;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const cx = width / 2;

  // Plastic housing (off-white / cream)
  g.fillStyle(0xf0eade, 1);
  g.fillRoundedRect(0, 0, width, height - 5, 2);

  // Dark outline
  g.lineStyle(1, 0x888888, 1);
  g.strokeRoundedRect(0, 0, width, height - 5, 2);

  // Three prongs extending down
  const prongColor = 0xc8b830;
  // Left prong (flat blade)
  g.fillStyle(prongColor, 1);
  g.fillRect(cx - 4, height - 7, 1.5, 7);
  // Right prong (flat blade, slightly taller)
  g.fillRect(cx + 2, height - 8, 1.5, 8);
  // Ground prong (round pin, center bottom)
  g.fillStyle(prongColor, 1);
  g.fillCircle(cx, height - 2, 1.2);
  g.fillRect(cx - 0.6, height - 6, 1.2, 4);

  // Prong highlights
  g.lineStyle(0.5, 0xeeee77, 0.5);
  g.lineBetween(cx - 3.5, height - 7, cx - 3.5, height);
  g.lineBetween(cx + 2.5, height - 8, cx + 2.5, height);

  g.generateTexture(key, width, height);
  g.destroy();

  return key;
}

/**
 * Generate a commercial dumpster viewed from the side, usable as a platform.
 * Dark green metal body with rim, reinforcement ridges, wheels, handles, and rust.
 *
 * @param {Phaser.Scene} scene  - The Phaser scene
 * @param {number} width  - Platform width in pixels
 * @param {number} height - Platform height in pixels
 * @returns {string} Texture key
 */
export function generateDumpsterPlatform(scene, width, height) {
  const key = `dumpster_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const rimH = 3;
  const wheelR = Math.max(2, Math.floor(height * 0.08));
  const bodyTop = rimH;
  const bodyBot = height - wheelR * 2 - 1;
  const bodyH = bodyBot - bodyTop;
  const halfH = Math.floor(bodyH / 2);

  // --- Main body upper half ---
  g.fillStyle(0x2a5a2a, 1);
  g.fillRect(1, bodyTop, width - 2, bodyH);

  // --- Darker bottom half ---
  g.fillStyle(0x1e4e1e, 0.5);
  g.fillRect(1, bodyTop + halfH, width - 2, bodyH - halfH);

  // --- Top metal rim (walkable surface) ---
  g.fillStyle(0x4a6a4a, 1);
  g.fillRect(0, 0, width, rimH);
  // Rim highlight
  g.fillStyle(0x6a8a6a, 0.5);
  g.fillRect(0, 0, width, 1);
  // Rim shadow
  g.fillStyle(0x1a3a1a, 0.6);
  g.fillRect(0, rimH - 1, width, 1);

  // --- Vertical reinforcement ridges at 30% and 70% ---
  const ridgeW = Math.max(2, Math.floor(width * 0.04));
  const ridge1X = Math.floor(width * 0.3);
  const ridge2X = Math.floor(width * 0.7) - ridgeW;
  const ridgeTop = bodyTop + rimH;
  const ridgeH = Math.max(1, bodyBot - ridgeTop - 1);

  g.fillStyle(0x326432, 0.8);
  g.fillRect(ridge1X, ridgeTop, ridgeW, ridgeH);
  g.fillRect(ridge2X, ridgeTop, ridgeW, ridgeH);
  g.lineStyle(0.5, 0x1a4a1a, 0.6);
  g.strokeRect(ridge1X, ridgeTop, ridgeW, ridgeH);
  g.strokeRect(ridge2X, ridgeTop, ridgeW, ridgeH);

  // --- Rust spots ---
  g.fillStyle(0x7a4d28, 0.3);
  g.fillRect(Math.floor(width * 0.08), bodyTop + 4, Math.max(3, Math.floor(width * 0.06)), 2);
  g.fillStyle(0x6e4422, 0.25);
  g.fillRect(width - Math.floor(width * 0.2), bodyBot - 5, Math.max(3, Math.floor(width * 0.07)), 3);
  g.fillStyle(0x7a4d28, 0.2);
  g.fillRect(Math.floor(width * 0.55), bodyTop + 6, 3, 2);

  // --- Side handles ---
  const handleY = bodyTop + Math.floor(bodyH * 0.4);
  const handleW = Math.max(2, Math.floor(width * 0.05));
  const handleH = Math.max(2, Math.floor(height * 0.08));

  g.fillStyle(0x4a4a4a, 1);
  g.fillRect(0, handleY, handleW, handleH);
  g.fillRect(width - handleW, handleY, handleW, handleH);
  g.lineStyle(0.5, 0x666666, 0.7);
  g.strokeRect(0, handleY, handleW, handleH);
  g.strokeRect(width - handleW, handleY, handleW, handleH);

  // --- Bottom edge ---
  g.fillStyle(0x1a3a1a, 1);
  g.fillRect(1, bodyBot, width - 2, 1);

  // --- Wheels ---
  const wheelY = height - wheelR - 1;
  const w1X = Math.floor(width * 0.2);
  const w2X = Math.floor(width * 0.8);

  g.fillStyle(0x111111, 0.4);
  g.fillCircle(w1X + 0.5, wheelY + 0.5, wheelR);
  g.fillCircle(w2X + 0.5, wheelY + 0.5, wheelR);
  g.fillStyle(0x222222, 1);
  g.fillCircle(w1X, wheelY, wheelR);
  g.fillCircle(w2X, wheelY, wheelR);
  g.lineStyle(0.5, 0x444444, 0.6);
  g.strokeCircle(w1X, wheelY, wheelR);
  g.strokeCircle(w2X, wheelY, wheelR);
  g.fillStyle(0x555555, 1);
  g.fillCircle(w1X, wheelY, 0.8);
  g.fillCircle(w2X, wheelY, 0.8);

  // --- Dark outline ---
  g.lineStyle(1, 0x1a2a1a, 1);
  g.strokeRect(0, 0, width, bodyBot + 1);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate a brick chimney stack that can be jumped on top of.
 * Red/brown bricks with mortar lines, a lighter cap, and soot stains.
 *
 * @param {Phaser.Scene} scene  - The Phaser scene
 * @param {number} width  - Platform width in pixels
 * @param {number} height - Platform height in pixels
 * @returns {string} Texture key
 */
export function generateChimneyPlatform(scene, width, height) {
  const key = `chimney_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const capH = 3;
  const brickW = 8;
  const brickH = 4;
  const mortarColor = 0x5a2218;
  const mortarSize = 1;

  // --- Mortar background (fills gaps) ---
  g.fillStyle(mortarColor, 1);
  g.fillRect(0, capH, width, height - capH);

  // --- Brick pattern ---
  let row = 0;
  for (let y = capH; y < height; y += brickH + mortarSize) {
    const offset = (row % 2 === 0) ? 0 : Math.floor(brickW / 2);
    for (let x = -offset; x < width; x += brickW + mortarSize) {
      const bx = Math.max(0, x);
      const bw = Math.min(brickW, width - bx);
      if (x < 0) {
        // Partial brick at left when offset
        const partial = brickW + x;
        if (partial > 0) {
          // Slight color variation per brick
          const variation = ((row * 7 + Math.floor(x / brickW) * 13) % 3);
          const colors = [0x8b3a2a, 0x7e3526, 0x94402e];
          g.fillStyle(colors[variation], 1);
          g.fillRect(0, y, partial, Math.min(brickH, height - y));
        }
      }
      if (bw > 0 && bx < width) {
        const variation = ((row * 7 + Math.floor(bx / brickW) * 13) % 3);
        const colors = [0x8b3a2a, 0x7e3526, 0x94402e];
        g.fillStyle(colors[variation], 1);
        g.fillRect(bx, y, Math.min(bw, width - bx), Math.min(brickH, height - y));
      }
    }
    row++;
  }

  // --- Darker edges on left/right ---
  g.fillStyle(0x3a1a10, 0.35);
  g.fillRect(0, capH, 2, height - capH);
  g.fillRect(width - 2, capH, 2, height - capH);

  // --- Top cap (walkable surface) ---
  g.fillStyle(0x9a4a3a, 1);
  g.fillRect(0, 0, width, capH);
  // Cap highlight
  g.fillStyle(0xaa5a4a, 0.5);
  g.fillRect(0, 0, width, 1);
  // Cap shadow
  g.fillStyle(0x6a2a1a, 0.5);
  g.fillRect(0, capH - 1, width, 1);

  // --- Soot stains on inside top ---
  const sootW = Math.max(8, Math.floor(width * 0.5));
  const sootX = Math.floor((width - sootW) / 2);
  g.fillStyle(0x222222, 0.3);
  g.fillRect(sootX, capH, sootW, Math.min(4, height - capH));
  g.fillStyle(0x222222, 0.15);
  g.fillRect(sootX + 2, capH + 2, sootW - 4, Math.min(3, height - capH - 2));

  // --- Outline ---
  g.lineStyle(1, 0x3a1a10, 0.8);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate a rooftop HVAC / AC unit that can be jumped on.
 * Boxy gray-blue metal housing with ventilation slats, mounting bolts,
 * an exhaust fan circle, and a panel seam.
 *
 * @param {Phaser.Scene} scene  - The Phaser scene
 * @param {number} width  - Platform width in pixels
 * @param {number} height - Platform height in pixels
 * @returns {string} Texture key
 */
export function generateACUnitPlatform(scene, width, height) {
  const key = `ac_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const topH = 3;
  const boltR = 1.5;
  const boltInset = 4;

  // --- Body ---
  g.fillStyle(0x4a5565, 1);
  g.fillRect(0, topH, width, height - topH);

  // --- Top surface (lighter metallic) ---
  g.fillStyle(0x5a6575, 1);
  g.fillRect(0, 0, width, topH);
  // Top edge highlight
  g.fillStyle(0x6a7585, 0.5);
  g.fillRect(0, 0, width, 1);

  // --- Horizontal ventilation slats ---
  const slatStart = topH + 3;
  const slatEnd = height - 3;
  g.lineStyle(1, 0x3a4555, 0.8);
  for (let y = slatStart; y < slatEnd; y += 3) {
    g.lineBetween(2, y, width - 2, y);
  }

  // --- Panel seam line down the middle ---
  const midX = Math.floor(width / 2);
  g.lineStyle(1, 0x3a4050, 0.7);
  g.lineBetween(midX, topH + 1, midX, height - 1);

  // --- Exhaust fan circle on right side ---
  const fanR = Math.min(Math.floor(height * 0.25), Math.floor(width * 0.12));
  const fanCX = Math.floor(width * 0.78);
  const fanCY = Math.floor((topH + height) / 2);

  if (fanR >= 3) {
    // Fan housing
    g.fillStyle(0x2a3545, 1);
    g.fillCircle(fanCX, fanCY, fanR);
    g.lineStyle(0.5, 0x3a4555, 0.8);
    g.strokeCircle(fanCX, fanCY, fanR);
    // Grid lines inside fan (cross)
    g.lineStyle(0.5, 0x4a5565, 0.6);
    g.lineBetween(fanCX - fanR + 1, fanCY, fanCX + fanR - 1, fanCY);
    g.lineBetween(fanCX, fanCY - fanR + 1, fanCX, fanCY + fanR - 1);
    // Diagonal grid
    const d = Math.floor(fanR * 0.7);
    g.lineBetween(fanCX - d, fanCY - d, fanCX + d, fanCY + d);
    g.lineBetween(fanCX + d, fanCY - d, fanCX - d, fanCY + d);
    // Center hub
    g.fillStyle(0x3a4555, 1);
    g.fillCircle(fanCX, fanCY, Math.max(1, Math.floor(fanR * 0.25)));
  }

  // --- Corner mounting bolts ---
  g.fillStyle(0x6a7a8a, 1);
  g.fillCircle(boltInset, boltInset, boltR);
  g.fillCircle(width - boltInset, boltInset, boltR);
  g.fillCircle(boltInset, height - boltInset, boltR);
  g.fillCircle(width - boltInset, height - boltInset, boltR);
  // Bolt highlights
  g.fillStyle(0x8a9aaa, 0.6);
  g.fillCircle(boltInset - 0.3, boltInset - 0.3, 0.6);
  g.fillCircle(width - boltInset - 0.3, boltInset - 0.3, 0.6);
  g.fillCircle(boltInset - 0.3, height - boltInset - 0.3, 0.6);
  g.fillCircle(width - boltInset - 0.3, height - boltInset - 0.3, 0.6);

  // --- Industrial border ---
  g.lineStyle(1, 0x3a4050, 1);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate a metal ventilation box / duct that can be stood on.
 * Galvanized silver-gray body with diamond-plate texture on top,
 * rivets along edges, a side seam, and metallic highlights.
 *
 * @param {Phaser.Scene} scene  - The Phaser scene
 * @param {number} width  - Platform width in pixels
 * @param {number} height - Platform height in pixels
 * @returns {string} Texture key
 */
export function generateVentBoxPlatform(scene, width, height) {
  const key = `vent_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const topH = Math.max(3, Math.floor(height * 0.25));
  const halfY = Math.floor(height * 0.5);

  // --- Body upper half ---
  g.fillStyle(0x6a7080, 1);
  g.fillRect(0, 0, width, height);

  // --- Slightly darker bottom half ---
  g.fillStyle(0x5a6070, 0.5);
  g.fillRect(0, halfY, width, height - halfY);

  // --- Top panel with diamond-plate pattern ---
  g.fillStyle(0x7a8090, 0.5);
  g.fillRect(0, 0, width, topH);

  // Diamond-plate: crossed diagonal lines on top panel
  g.lineStyle(0.5, 0x8a90a0, 0.35);
  const spacing = 4;
  for (let x = -topH; x < width + topH; x += spacing) {
    // Forward diagonals
    g.lineBetween(x, 0, x + topH, topH);
    // Backward diagonals
    g.lineBetween(x + topH, 0, x, topH);
  }

  // --- Metallic highlight on top edge ---
  g.fillStyle(0x9aa0b0, 0.5);
  g.fillRect(0, 0, width, 1);

  // --- Side seam line ---
  const seamY = Math.floor(height * 0.45);
  g.lineStyle(1, 0x5a6070, 0.7);
  g.lineBetween(1, seamY, width - 1, seamY);

  // --- Rivets along edges (every ~10px) ---
  const rivetR = 1;
  g.fillStyle(0x8a90a0, 1);
  for (let x = 5; x < width - 2; x += 10) {
    // Top row
    g.fillCircle(x, topH + 1, rivetR);
    // Bottom row
    g.fillCircle(x, height - 2, rivetR);
  }
  // Left/right edge rivets
  for (let y = topH + 5; y < height - 2; y += 10) {
    g.fillCircle(2, y, rivetR);
    g.fillCircle(width - 2, y, rivetR);
  }
  // Rivet highlights
  g.fillStyle(0xaab0c0, 0.5);
  for (let x = 5; x < width - 2; x += 10) {
    g.fillCircle(x - 0.3, topH + 0.7, 0.4);
    g.fillCircle(x - 0.3, height - 2.3, 0.4);
  }

  // --- Border ---
  g.lineStyle(1, 0x4a5060, 1);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Generate a wooden shipping crate / pallet that can be jumped on.
 * Wood planks with cross braces, corner metal brackets, nails,
 * subtle grain, and stenciled shipping marks.
 *
 * @param {Phaser.Scene} scene  - The Phaser scene
 * @param {number} width  - Platform width in pixels
 * @param {number} height - Platform height in pixels
 * @returns {string} Texture key
 */
export function generateCratePlatform(scene, width, height) {
  const key = `crate_plat_${width}x${height}`;
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const bracketSize = Math.max(3, Math.floor(Math.min(width, height) * 0.12));

  // --- Wood base ---
  g.fillStyle(0x6a5020, 1);
  g.fillRect(0, 0, width, height);

  // --- Horizontal plank lines ---
  const plankSpacing = Math.max(4, Math.floor(height / 5));
  g.lineStyle(1, 0x52400a, 0.6);
  for (let y = plankSpacing; y < height; y += plankSpacing) {
    g.lineBetween(0, y, width, y);
  }

  // --- Wood grain (vertical lines at low alpha) ---
  g.lineStyle(0.5, 0x584818, 0.2);
  for (let x = 5; x < width; x += 6) {
    g.lineBetween(x, 1, x, height - 1);
  }

  // --- Cross braces on front face (X) ---
  g.lineStyle(1.5, 0x584818, 0.6);
  g.lineBetween(bracketSize, bracketSize, width - bracketSize, height - bracketSize);
  g.lineBetween(width - bracketSize, bracketSize, bracketSize, height - bracketSize);

  // --- Corner metal brackets ---
  g.fillStyle(0x555555, 1);
  // Top-left
  g.fillRect(0, 0, bracketSize, bracketSize);
  // Top-right
  g.fillRect(width - bracketSize, 0, bracketSize, bracketSize);
  // Bottom-left
  g.fillRect(0, height - bracketSize, bracketSize, bracketSize);
  // Bottom-right
  g.fillRect(width - bracketSize, height - bracketSize, bracketSize, bracketSize);

  // Bracket borders
  g.lineStyle(0.5, 0x3a3a3a, 0.8);
  g.strokeRect(0, 0, bracketSize, bracketSize);
  g.strokeRect(width - bracketSize, 0, bracketSize, bracketSize);
  g.strokeRect(0, height - bracketSize, bracketSize, bracketSize);
  g.strokeRect(width - bracketSize, height - bracketSize, bracketSize, bracketSize);

  // --- Nails at bracket corners ---
  const nailR = 0.8;
  const nailInset = Math.max(1.5, Math.floor(bracketSize * 0.35));
  g.fillStyle(0x333333, 1);
  // Top-left bracket nails
  g.fillCircle(nailInset, nailInset, nailR);
  g.fillCircle(bracketSize - nailInset + 1, nailInset, nailR);
  g.fillCircle(nailInset, bracketSize - nailInset + 1, nailR);
  // Top-right bracket nails
  g.fillCircle(width - nailInset, nailInset, nailR);
  g.fillCircle(width - bracketSize + nailInset - 1, nailInset, nailR);
  g.fillCircle(width - nailInset, bracketSize - nailInset + 1, nailR);
  // Bottom-left bracket nails
  g.fillCircle(nailInset, height - nailInset, nailR);
  g.fillCircle(bracketSize - nailInset + 1, height - nailInset, nailR);
  g.fillCircle(nailInset, height - bracketSize + nailInset - 1, nailR);
  // Bottom-right bracket nails
  g.fillCircle(width - nailInset, height - nailInset, nailR);
  g.fillCircle(width - bracketSize + nailInset - 1, height - nailInset, nailR);
  g.fillCircle(width - nailInset, height - bracketSize + nailInset - 1, nailR);

  // --- Stenciled shipping marks (small solid rectangles to suggest text) ---
  const markColor = 0x3a3010;
  const markAlpha = 0.4;
  const markY = Math.floor(height * 0.35);
  const markX = Math.floor(width * 0.3);
  g.fillStyle(markColor, markAlpha);
  g.fillRect(markX, markY, Math.floor(width * 0.1), 2);
  g.fillRect(markX + Math.floor(width * 0.13), markY, Math.floor(width * 0.15), 2);
  g.fillRect(markX, markY + 4, Math.floor(width * 0.22), 2);

  // --- Border ---
  g.lineStyle(1, 0x3a2a0a, 1);
  g.strokeRect(0, 0, width, height);

  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

/**
 * Initialize all asset textures for a scene.
 * Call this once during PreloadScene or GameScene creation.
 * @param {Phaser.Scene} scene - The Phaser scene
 */
export function initializeAssetTextures(scene) {
  // Generate common door sizes
  generateDoor(scene, 32, 64);
  generateDoor(scene, 64, 64);
  generateDoor(scene, 32, 128);
  
  // Generate common elevator sizes
  generateElevator(scene, 64, 16);
  generateElevator(scene, 128, 16);
  
  // Generate common drawbridge sizes
  generateDrawbridge(scene, 64, 16);
  generateDrawbridge(scene, 128, 16);
  
  // Generate standard crate size
  generateWoodenCrate(scene, 48);
  generateWoodenCrate(scene, 32);
  
  // Generate outlet states
  generateOutlet(scene, false);
  generateOutlet(scene, true);
  
  // Generate plug
  generatePlug(scene);

  // Generate platform objects
  generateDumpsterPlatform(scene, 64, 32);
  generateDumpsterPlatform(scene, 80, 24);
  generateChimneyPlatform(scene, 48, 48);
  generateChimneyPlatform(scene, 32, 40);
  generateACUnitPlatform(scene, 64, 24);
  generateACUnitPlatform(scene, 48, 20);
  generateVentBoxPlatform(scene, 48, 16);
  generateVentBoxPlatform(scene, 64, 20);
  generateCratePlatform(scene, 48, 32);
  generateCratePlatform(scene, 64, 24);
}

export default {
  generateDoor,
  generateElevator,
  generateDrawbridge,
  generateWoodenCrate,
  generateOutlet,
  generatePlug,
  generateDumpsterPlatform,
  generateChimneyPlatform,
  generateACUnitPlatform,
  generateVentBoxPlatform,
  generateCratePlatform,
  initializeAssetTextures,
};
