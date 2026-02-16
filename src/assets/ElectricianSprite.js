/**
 * ElectricianSprite.js
 *
 * Procedurally generates a sprite sheet for "Sparky" the electrician hero.
 * Creates all animation frames (IDLE, RUN, GRAB/PUSH, JUMP, FALL) as a single texture.
 *
 * Character Design:
 *   - 28x48 pixel character
 *   - Blonde/yellow spiky hair
 *   - Blue electrician shirt, khaki pants
 *   - Happy expression with red cheeks
 *   - Carries a wrench tool
 */

/**
 * Main entry point: generates the electrician sprite sheet and registers animations.
 *
 * @param {Phaser.Scene} scene - The Phaser scene where the texture will be registered
 * @returns {Object} AnimationData object with texture key and animation definitions
 */
export function generateElectricianSpriteSheet(scene) {
  const W = 28;  // Frame width
  const H = 48;  // Frame height

  // Create a graphics object for drawing
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.setDepth(-1);

  // Total: 14 frames (1 idle + 6 run + 4 grab + 2 jump + 1 fall)
  // Arrange in 2 columns x 7 rows = 56x336 texture
  const cols = 2;
  const rows = 7;
  const textureWidth = W * cols;
  const textureHeight = H * rows;

  // Clear with transparent background
  graphics.fillStyle(0xffffff, 0); // Fully transparent white
  graphics.fillRect(0, 0, textureWidth, textureHeight);

  // Draw each frame
  let frameIndex = 0;

  // Frame 0: IDLE (standing still, happy)
  drawIdleFrame(graphics, frameIndex, W, H);
  frameIndex++;

  // Frames 1-6: RUN (running animation)
  for (let i = 0; i < 6; i++) {
    drawRunFrame(graphics, frameIndex, W, H, i);
    frameIndex++;
  }

  // Frames 7-10: GRAB/PUSH (pushing block animation)
  for (let i = 0; i < 4; i++) {
    drawGrabFrame(graphics, frameIndex, W, H, i);
    frameIndex++;
  }

  // Frames 11-12: JUMP (jump takeoff and apex)
  for (let i = 0; i < 2; i++) {
    drawJumpFrame(graphics, frameIndex, W, H, i);
    frameIndex++;
  }

  // Frame 13: FALL (falling/airborne)
  drawFallFrame(graphics, frameIndex, W, H);

  // Generate texture from graphics
  graphics.generateTexture('electrician', textureWidth, textureHeight);
  graphics.destroy();

  // Manually add sprite-sheet frames to the generated texture.
  // generateTexture() creates a single-frame image; we carve individual frames.
  const tex = scene.textures.get('electrician');

  // Remove the auto-created __BASE frame first to avoid conflicts
  // Then re-add all individual frames
  const totalFrames = cols * rows;   // 14 actual frames, grid is 2×7

  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Use string keys to avoid collision with auto-generated frame 0
    tex.add(i, 0, col * W, row * H, W, H);
  }

  // Helper: build frame number array for a range
  const frameRange = (start, end) => {
    const frames = [];
    for (let i = start; i <= end; i++) {
      frames.push({ key: 'electrician', frame: i });
    }
    return frames;
  };

  // Return animation configuration
  return {
    textureKey: 'electrician',
    frames: { frameWidth: W, frameHeight: H },
    animations: {
      idle:  { key: 'idle',  frames: [{ key: 'electrician', frame: 0 }],  frameRate: 10, repeat: -1 },
      run:   { key: 'run',   frames: frameRange(1, 6),                    frameRate: 15, repeat: -1 },
      grab:  { key: 'grab',  frames: frameRange(7, 10),                   frameRate: 12, repeat: -1 },
      jump:  { key: 'jump',  frames: [{ key: 'electrician', frame: 11 }], frameRate: 18, repeat: 0  },
      fall:  { key: 'fall',  frames: [{ key: 'electrician', frame: 13 }], frameRate: 10, repeat: -1 },
    }
  };
}

/**
 * Helper: Calculate grid position for a frame index
 */
function getFrameGridPos(frameIndex, cols, W, H) {
  const col = frameIndex % cols;
  const row = Math.floor(frameIndex / cols);
  return { x: col * W, y: row * H };
}

/**
 * Draw IDLE frame (facing right, standing still, happy)
 */
function drawIdleFrame(graphics, frameIndex, W, H) {
  const cols = 2;
  const pos = getFrameGridPos(frameIndex, cols, W, H);
  const x = pos.x;
  const y = pos.y;

  drawCharacterBase(graphics, x, y, W, H, 0); // no leg movement
}

/**
 * Draw RUN frame (running animation)
 * legPhase: 0-5 for legs cycling through run animation
 */
function drawRunFrame(graphics, frameIndex, W, H, legPhase) {
  const cols = 2;
  const pos = getFrameGridPos(frameIndex, cols, W, H);
  const x = pos.x;
  const y = pos.y;

  // Alternate leg animation: left leg forward (0,2,4) vs right leg forward (1,3,5)
  const leftLegForward = (legPhase % 2) === 0;

  // Draw body with running animation
  drawRunningCharacter(graphics, x, y, W, H, leftLegForward);
}

/**
 * Draw GRAB/PUSH frame (pushing/dragging block)
 * pushPhase: 0-3 for push motion progression
 */
function drawGrabFrame(graphics, frameIndex, W, H, pushPhase) {
  const cols = 2;
  const pos = getFrameGridPos(frameIndex, cols, W, H);
  const x = pos.x;
  const y = pos.y;

  drawPushingCharacter(graphics, x, y, W, H, pushPhase);
}

/**
 * Draw JUMP frame (taking off or in air)
 * jumpPhase: 0 = takeoff, 1 = apex
 */
function drawJumpFrame(graphics, frameIndex, W, H, jumpPhase) {
  const cols = 2;
  const pos = getFrameGridPos(frameIndex, cols, W, H);
  const x = pos.x;
  const y = pos.y;

  drawJumpingCharacter(graphics, x, y, W, H, jumpPhase);
}

/**
 * Draw FALL frame (falling/airborne)
 */
function drawFallFrame(graphics, frameIndex, W, H) {
  const cols = 2;
  const pos = getFrameGridPos(frameIndex, cols, W, H);
  const x = pos.x;
  const y = pos.y;

  drawFallingCharacter(graphics, x, y, W, H);
}

/**
 * Base character drawing (standing, no motion)
 */
function drawCharacterBase(graphics, px, py, W, H, legTilt = 0) {
  const cx = px + W / 2;
  const cy = py + H / 2;

  // ===== BODY =====
  // Khaki pants
  graphics.fillStyle(0xc9a961, 1); // khaki
  graphics.fillRect(px + 9, py + 28, 10, 10);

  // Blue shirt
  graphics.fillStyle(0x2563eb, 1); // blue
  graphics.fillRect(px + 7, py + 15, 14, 13);

  // Neck
  graphics.fillStyle(0xf5deb3, 1); // tan/skin
  graphics.fillRect(px + 12, py + 13, 4, 3);

  // ===== HEAD =====
  // Face (skin color)
  graphics.fillStyle(0xf5deb3, 1); // tan/skin
  graphics.fillRect(px + 9, py + 5, 10, 8);

  // ===== HAIR (Spiky blonde) =====
  graphics.fillStyle(0xffff00, 1); // bright yellow
  // Left spike
  graphics.fillRect(px + 8, py + 2, 2, 3);
  // Center spikes (upward)
  graphics.fillRect(px + 11, py + 1, 2, 4);
  graphics.fillRect(px + 13, py + 2, 2, 3);
  // Right spike
  graphics.fillRect(px + 16, py + 3, 2, 2);

  // ===== FACE FEATURES =====
  // Eyes (happy, looking forward)
  graphics.fillStyle(0x000000, 1); // black
  graphics.fillRect(px + 11, py + 7, 1, 1);
  graphics.fillRect(px + 15, py + 7, 1, 1);

  // Red cheeks (happy expression)
  graphics.fillStyle(0xff6b6b, 1); // red
  graphics.fillRect(px + 9, py + 8, 1, 1);
  graphics.fillRect(px + 17, py + 8, 1, 1);

  // Smile (simple curved line)
  graphics.fillStyle(0x000000, 1);
  graphics.fillRect(px + 12, py + 10, 4, 1);

  // ===== ARMS =====
  // Left arm (relaxed)
  graphics.fillStyle(0xf5deb3, 1); // skin
  graphics.fillRect(px + 5, py + 16, 2, 8);

  // Right arm (relaxed)
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(px + 21, py + 16, 2, 8);

  // ===== WRENCH ACCESSORY =====
  // Hold wrench in right hand
  graphics.fillStyle(0xcc6600, 1); // brown/orange metal
  graphics.fillRect(px + 23, py + 18, 3, 2);
  graphics.fillRect(px + 24, py + 20, 2, 2);

  // ===== LEGS =====
  // Left leg
  graphics.fillStyle(0xc9a961, 1); // khaki
  graphics.fillRect(px + 8, py + 28, 3, 10 + legTilt);

  // Right leg
  graphics.fillStyle(0xc9a961, 1);
  graphics.fillRect(px + 17, py + 28, 3, 10 - legTilt);

  // ===== SHOES =====
  graphics.fillStyle(0x333333, 1); // dark gray
  graphics.fillRect(px + 8, py + 38, 3, 2);
  graphics.fillRect(px + 17, py + 38, 3, 2);
}

/**
 * Draw character in running pose
 */
function drawRunningCharacter(graphics, px, py, W, H, leftLegForward) {
  const cx = px + W / 2;
  const cy = py + H / 2;

  // ===== BODY (tilted slightly forward) =====
  // Khaki pants
  graphics.fillStyle(0xc9a961, 1); // khaki
  graphics.fillRect(px + 9, py + 26, 10, 12);

  // Blue shirt (leaning)
  graphics.fillStyle(0x2563eb, 1); // blue
  graphics.fillRect(px + 8, py + 14, 13, 14);

  // Neck
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(px + 12, py + 12, 4, 3);

  // ===== HEAD =====
  graphics.fillStyle(0xf5deb3, 1); // skin
  graphics.fillRect(px + 9, py + 4, 10, 8);

  // ===== HAIR (tilted with movement) =====
  const hairTilt = leftLegForward ? -1 : 1; // lean into run direction
  graphics.fillStyle(0xffff00, 1); // yellow
  graphics.fillRect(px + 8 - hairTilt, py + 1, 2, 4);
  graphics.fillRect(px + 11 - hairTilt, py + 0, 2, 5);
  graphics.fillRect(px + 14 - hairTilt, py + 1, 2, 4);
  graphics.fillRect(px + 17 - hairTilt, py + 2, 2, 3);

  // ===== FACE (happy/energetic) =====
  graphics.fillStyle(0x000000, 1); // eyes closed/squinting when running
  graphics.fillRect(px + 11, py + 6, 1, 1);
  graphics.fillRect(px + 15, py + 6, 1, 1);

  // Big red cheeks (happy/energetic)
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillRect(px + 9, py + 8, 2, 1);
  graphics.fillRect(px + 17, py + 8, 2, 1);

  // ===== ARMS (swinging) =====
  if (leftLegForward) {
    // Right arm forward
    graphics.fillStyle(0xf5deb3, 1);
    graphics.fillRect(px + 23, py + 15, 2, 9);
    // Left arm back
    graphics.fillStyle(0xf5deb3, 1);
    graphics.fillRect(px + 3, py + 18, 2, 8);
  } else {
    // Left arm forward
    graphics.fillStyle(0xf5deb3, 1);
    graphics.fillRect(px + 3, py + 15, 2, 9);
    // Right arm back
    graphics.fillStyle(0xf5deb3, 1);
    graphics.fillRect(px + 23, py + 18, 2, 8);
  }

  // ===== WRENCH (swinging with run) =====
  const wrenchX = leftLegForward ? 25 : 3;
  graphics.fillStyle(0xcc6600, 1);
  graphics.fillRect(px + wrenchX, py + 22, 2, 2);

  // ===== LEGS (running animation) =====
  if (leftLegForward) {
    // Left leg raised/forward
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 8, py + 24, 3, 14);
    // Right leg back/extended
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 17, py + 30, 3, 8);
  } else {
    // Right leg raised/forward
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 17, py + 24, 3, 14);
    // Left leg back/extended
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 8, py + 30, 3, 8);
  }

  // ===== SHOES =====
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(px + 8, py + 38, 3, 2);
  graphics.fillRect(px + 17, py + 38, 3, 2);
}

/**
 * Draw character pushing/dragging a block
 */
function drawPushingCharacter(graphics, px, py, W, H, pushPhase) {
  const cx = px + W / 2;
  const cy = py + H / 2;

  // ===== BODY (leaning forward with strain) =====
  const bodyLean = pushPhase < 2 ? 0 : -1;

  // Khaki pants
  graphics.fillStyle(0xc9a961, 1); // khaki
  graphics.fillRect(px + 9, py + 28 + bodyLean, 10, 10);

  // Blue shirt (leaning forward)
  graphics.fillStyle(0x2563eb, 1); // blue
  graphics.fillRect(px + 8 + bodyLean, py + 15, 13, 13);

  // Neck
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(px + 12 + bodyLean, py + 13, 4, 3);

  // ===== HEAD =====
  graphics.fillStyle(0xf5deb3, 1); // skin
  graphics.fillRect(px + 9 + bodyLean, py + 5, 10, 8);

  // ===== HAIR =====
  graphics.fillStyle(0xffff00, 1); // yellow
  graphics.fillRect(px + 8 + bodyLean, py + 2, 2, 3);
  graphics.fillRect(px + 11 + bodyLean, py + 1, 2, 4);
  graphics.fillRect(px + 14 + bodyLean, py + 2, 2, 3);
  graphics.fillRect(px + 17 + bodyLean, py + 3, 2, 2);

  // ===== FACE (strained/focused) =====
  graphics.fillStyle(0x000000, 1); // eyes
  graphics.fillRect(px + 11 + bodyLean, py + 7, 1, 1);
  graphics.fillRect(px + 15 + bodyLean, py + 7, 1, 1);

  // Cheeks (effort/strain)
  graphics.fillStyle(0xff8888, 1); // lighter red
  graphics.fillRect(px + 9 + bodyLean, py + 8, 1, 1);
  graphics.fillRect(px + 17 + bodyLean, py + 8, 1, 1);

  // ===== ARMS (one pushing forward, one pulling back) =====
  // Push arm (extended forward)
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(px + 23 + bodyLean, py + 17, 2, 10);

  // Pull arm (pulling back)
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(px + 3 + bodyLean, py + 18, 2, 9);

  // ===== WRENCH (idle on back during push) =====
  graphics.fillStyle(0xcc6600, 1);
  graphics.fillRect(px + 25 + bodyLean, py + 12, 2, 2);

  // ===== LEGS (walking rhythm with block) =====
  const leftLegForward = pushPhase < 2;
  if (leftLegForward) {
    // Left foot slightly forward
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 8, py + 28, 3, 10);
    // Right foot slightly back
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 17, py + 30, 3, 8);
  } else {
    // Right foot forward
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 17, py + 28, 3, 10);
    // Left foot back
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 8, py + 30, 3, 8);
  }

  // ===== SHOES =====
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(px + 8, py + 38, 3, 2);
  graphics.fillRect(px + 17, py + 38, 3, 2);
}

/**
 * Draw character jumping
 * jumpPhase: 0 = takeoff (legs bent), 1 = apex (legs tucked)
 */
function drawJumpingCharacter(graphics, px, py, W, H, jumpPhase) {
  const cx = px + W / 2;
  const cy = py + H / 2;

  const isApex = jumpPhase === 1;
  const bodyYOffset = isApex ? -2 : 0;

  // ===== BODY =====
  // Khaki pants
  graphics.fillStyle(0xc9a961, 1); // khaki
  graphics.fillRect(px + 9, py + 26 + bodyYOffset, 10, isApex ? 8 : 12);

  // Blue shirt
  graphics.fillStyle(0x2563eb, 1); // blue
  graphics.fillRect(px + 7, py + 14 + bodyYOffset, 14, 13);

  // Neck
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(px + 12, py + 12 + bodyYOffset, 4, 3);

  // ===== HEAD =====
  graphics.fillStyle(0xf5deb3, 1); // skin
  graphics.fillRect(px + 9, py + 4 + bodyYOffset, 10, 8);

  // ===== HAIR (wind-swept up) =====
  graphics.fillStyle(0xffff00, 1); // yellow
  graphics.fillRect(px + 8, py + 0 + bodyYOffset, 2, 5);
  graphics.fillRect(px + 11, py + -1 + bodyYOffset, 2, 6);
  graphics.fillRect(px + 14, py + 0 + bodyYOffset, 2, 5);
  graphics.fillRect(px + 17, py + 1 + bodyYOffset, 2, 4);

  // ===== FACE (excited/determined) =====
  graphics.fillStyle(0x000000, 1); // eyes
  graphics.fillRect(px + 11, py + 7 + bodyYOffset, 1, 1);
  graphics.fillRect(px + 15, py + 7 + bodyYOffset, 1, 1);

  // Cheeks (excited)
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillRect(px + 9, py + 8 + bodyYOffset, 2, 1);
  graphics.fillRect(px + 17, py + 8 + bodyYOffset, 2, 1);

  // ===== ARMS =====
  if (isApex) {
    // Both arms extended upward
    graphics.fillStyle(0xf5deb3, 1);
    graphics.fillRect(px + 4, py + 12 + bodyYOffset, 2, 10);
    graphics.fillRect(px + 22, py + 12 + bodyYOffset, 2, 10);
  } else {
    // Arms extended upward (takeoff)
    graphics.fillStyle(0xf5deb3, 1);
    graphics.fillRect(px + 5, py + 10 + bodyYOffset, 2, 12);
    graphics.fillRect(px + 21, py + 10 + bodyYOffset, 2, 12);
  }

  // ===== WRENCH (swinging from jump momentum) =====
  graphics.fillStyle(0xcc6600, 1);
  graphics.fillRect(px + 25, py + 14 + bodyYOffset, 2, 2);

  // ===== LEGS =====
  if (isApex) {
    // Legs tucked
    graphics.fillStyle(0xc9a961, 1);
    graphics.fillRect(px + 9, py + 34 + bodyYOffset, 10, 4);
  } else {
    // Legs pressing down (takeoff)
    graphics.fillStyle(0xc9a961, 1);
    // Left leg
    graphics.fillRect(px + 8, py + 34 + bodyYOffset, 3, 4);
    // Right leg
    graphics.fillRect(px + 17, py + 34 + bodyYOffset, 3, 4);
  }

  // ===== SHOES =====
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(px + 8, py + isApex ? 37 : 38 + bodyYOffset, 3, 2);
  graphics.fillRect(px + 17, py + isApex ? 37 : 38 + bodyYOffset, 3, 2);
}

/**
 * Draw character falling/airborne
 */
function drawFallingCharacter(graphics, px, py, W, H) {
  const cx = px + W / 2;
  const cy = py + H / 2;

  // ===== BODY =====
  // Khaki pants
  graphics.fillStyle(0xc9a961, 1); // khaki
  graphics.fillRect(px + 9, py + 28, 10, 10);

  // Blue shirt
  graphics.fillStyle(0x2563eb, 1); // blue
  graphics.fillRect(px + 7, py + 15, 14, 13);

  // Neck
  graphics.fillStyle(0xf5deb3, 1);
  graphics.fillRect(px + 12, py + 13, 4, 3);

  // ===== HEAD =====
  graphics.fillStyle(0xf5deb3, 1); // skin
  graphics.fillRect(px + 9, py + 5, 10, 8);

  // ===== HAIR (wild/tousled falling) =====
  graphics.fillStyle(0xffff00, 1); // yellow
  graphics.fillRect(px + 8, py + 2, 2, 3);
  graphics.fillRect(px + 11, py + 0, 2, 5);
  graphics.fillRect(px + 14, py + 1, 3, 4);
  graphics.fillRect(px + 17, py + 2, 2, 3);

  // ===== FACE (surprised/concerned) =====
  graphics.fillStyle(0x000000, 1); // wide eyes
  graphics.fillRect(px + 11, py + 6, 1, 2);
  graphics.fillRect(px + 15, py + 6, 1, 2);

  // Cheeks (less red when falling)
  graphics.fillStyle(0xff9999, 1);
  graphics.fillRect(px + 9, py + 8, 1, 1);
  graphics.fillRect(px + 17, py + 8, 1, 1);

  // ===== ARMS (splayed) =====
  graphics.fillStyle(0xf5deb3, 1);
  // Left arm splayed out
  graphics.fillRect(px + 2, py + 17, 4, 2);
  // Right arm splayed out
  graphics.fillRect(px + 22, py + 17, 4, 2);

  // ===== WRENCH (floating away) =====
  graphics.fillStyle(0xcc6600, 1);
  graphics.fillRect(px + 25, py + 25, 2, 2);

  // ===== LEGS (splayed) =====
  graphics.fillStyle(0xc9a961, 1);
  // Left leg spread
  graphics.fillRect(px + 5, py + 30, 3, 8);
  // Right leg spread
  graphics.fillRect(px + 20, py + 32, 3, 8);

  // ===== SHOES =====
  graphics.fillStyle(0x333333, 1);
  graphics.fillRect(px + 5, py + 38, 3, 2);
  graphics.fillRect(px + 20, py + 40, 3, 2);
}
