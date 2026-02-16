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
 * Generate an electrical outlet texture (2-prong).
 * @param {Phaser.Scene} scene - The Phaser scene
 * @param {boolean} powered - Whether the outlet is powered (glowing)
 * @returns {string} Texture key
 */
export function generateOutlet(scene, powered = false) {
  const key = `outlet_${powered ? 'on' : 'off'}`;
  
  if (scene.textures.exists(key)) {
    return key;
  }
  
  const width = 16;
  const height = 24;
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // Outlet housing (black plastic)
  graphics.fillStyle(0x1a1a1a, 1);
  graphics.fillRect(0, 0, width, height);
  
  // Light gray border/frame
  graphics.lineStyle(1, 0x444444, 1);
  graphics.strokeRect(0, 0, width, height);
  
  // Two circular holes (prongs)
  const holeRadius = 2;
  const holeX1 = width / 3;
  const holeX2 = (width * 2) / 3;
  const holeYTop = 6;
  const holeYBottom = 18;
  
  // Holes are darker/shadowed
  graphics.fillStyle(0x0a0a0a, 1);
  graphics.fillCircle(holeX1, holeYTop, holeRadius);
  graphics.fillCircle(holeX2, holeYBottom, holeRadius);
  
  // Outline of holes
  graphics.lineStyle(0.5, 0x333333, 1);
  graphics.strokeCircle(holeX1, holeYTop, holeRadius);
  graphics.strokeCircle(holeX2, holeYBottom, holeRadius);
  
  // If powered, add green glow
  if (powered) {
    graphics.lineStyle(1, 0x00ff00, 0.6);
    graphics.strokeCircle(holeX1, holeYTop, holeRadius + 1);
    graphics.strokeCircle(holeX2, holeYBottom, holeRadius + 1);
    
    // Green accent line at bottom
    graphics.lineStyle(1, 0x00dd00, 0.5);
    graphics.lineBetween(2, height - 2, width - 2, height - 2);
  } else {
    // Neutral gray accent when off
    graphics.lineStyle(0.5, 0x555555, 0.4);
    graphics.lineBetween(2, height - 2, width - 2, height - 2);
  }
  
  graphics.generateTexture(key, width, height);
  graphics.destroy();
  
  return key;
}

/**
 * Generate a 2-prong electrical plug texture.
 * Used for extension cord ends.
 * @param {Phaser.Scene} scene - The Phaser scene
 * @returns {string} Texture key
 */
export function generatePlug(scene) {
  const key = 'plug_2prong';
  
  if (scene.textures.exists(key)) {
    return key;
  }
  
  const width = 8;
  const height = 12;
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  
  // Plastic housing (white/cream)
  graphics.fillStyle(0xf5f5dc, 1);
  graphics.fillRect(0, 0, width, height);
  
  // Dark outline
  graphics.lineStyle(1, 0x444444, 1);
  graphics.strokeRect(0, 0, width, height);
  
  // Two prongs (gold/brass color)
  const prongWidth = 1;
  const prongHeight = 6;
  const prongX1 = 2;
  const prongX2 = 5;
  const prongY = 6;
  
  graphics.fillStyle(0xdaa520, 1);
  graphics.fillRect(prongX1, prongY, prongWidth, prongHeight);
  graphics.fillRect(prongX2, prongY, prongWidth, prongHeight);
  
  // Prong details (shiny)
  graphics.lineStyle(0.5, 0xffff99, 0.6);
  graphics.lineBetween(prongX1 + 0.5, prongY, prongX1 + 0.5, prongY + prongHeight);
  graphics.lineBetween(prongX2 + 0.5, prongY, prongX2 + 0.5, prongY + prongHeight);
  
  graphics.generateTexture(key, width, height);
  graphics.destroy();
  
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
  generateWoodenCrate(scene, 72);
  generateWoodenCrate(scene, 48);
  generateWoodenCrate(scene, 32);
  
  // Generate outlet states
  generateOutlet(scene, false);
  generateOutlet(scene, true);
  
  // Generate plug
  generatePlug(scene);
}

export default {
  generateDoor,
  generateElevator,
  generateDrawbridge,
  generateWoodenCrate,
  generateOutlet,
  generatePlug,
  initializeAssetTextures,
};
