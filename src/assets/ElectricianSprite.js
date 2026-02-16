/**
 * ElectricianSprite.js
 *
 * Procedurally generates a sprite sheet for "Sparky" the electrician hero.
 * Creates all animation frames (IDLE, RUN, GRAB/PUSH, JUMP, FALL) as a single texture.
 *
 * Character Design (matches reference art):
 *   - 28x48 pixel character
 *   - Orange/yellow hard hat
 *   - Brown beard, friendly face
 *   - Teal-blue work shirt with chest pocket
 *   - Brown tool belt with buckle
 *   - Blue work pants
 *   - Brown work boots
 *   - Holds extension cord plug in right hand
 */

// ── Palette ────────────────────────────────────────────────
const PAL = {
  skin:      0xd4a373,  // warm tan
  skinDark:  0xb88b5e,  // shadowed skin / ear
  beard:     0x7a4f2b,  // brown beard
  hat:       0xf5a623,  // orange/yellow hard hat
  hatBrim:   0xd48b12,  // hat brim (darker)
  hatHigh:   0xffc95c,  // hat highlight
  shirt:     0x3a9fbf,  // teal-blue shirt
  shirtDark: 0x2c7a94,  // shirt shadow
  pocket:    0x4db8d6,  // pocket accent
  belt:      0x6b4226,  // brown tool belt
  buckle:    0xffc107,  // gold buckle
  pants:     0x1e6fa0,  // blue work pants
  pantsDark: 0x185a82,  // pant shadow
  boot:      0x5c3a1e,  // brown boot
  bootSole:  0x3d2412,  // dark boot sole
  eye:       0x1a1a1a,  // near-black eye dot
  eyeWhite:  0xffffff,
  mouth:     0xd45a5a,  // warm smile
  cheek:     0xe8946b,  // subtle blush
  cordOrange:0xff8c00,  // extension cord
  cordPlug:  0xc0c0c0,  // plug metal
  cordProng: 0x888888,  // prong gray
};

/**
 * Main entry point: generates the electrician sprite sheet and registers animations.
 */
export function generateElectricianSpriteSheet(scene) {
  const W = 28;
  const H = 48;

  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
  graphics.setDepth(-1);

  const cols = 2;
  const rows = 7;
  const textureWidth = W * cols;
  const textureHeight = H * rows;

  graphics.fillStyle(0xffffff, 0);
  graphics.fillRect(0, 0, textureWidth, textureHeight);

  let fi = 0;

  // Frame 0: IDLE
  drawIdle(graphics, fi++, W, H);

  // Frames 1-6: RUN cycle
  for (let i = 0; i < 6; i++) drawRun(graphics, fi++, W, H, i);

  // Frames 7-10: GRAB/PUSH
  for (let i = 0; i < 4; i++) drawGrab(graphics, fi++, W, H, i);

  // Frames 11-12: JUMP
  for (let i = 0; i < 2; i++) drawJump(graphics, fi++, W, H, i);

  // Frame 13: FALL
  drawFall(graphics, fi++, W, H);

  // Generate texture & carve frames
  graphics.generateTexture('electrician', textureWidth, textureHeight);
  graphics.destroy();

  const tex = scene.textures.get('electrician');
  const totalFrames = cols * rows;
  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    tex.add(i, 0, col * W, row * H, W, H);
  }

  const frameRange = (start, end) => {
    const frames = [];
    for (let i = start; i <= end; i++) frames.push({ key: 'electrician', frame: i });
    return frames;
  };

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

// ── Grid helper ────────────────────────────────────────────
function gp(fi, W, H) {
  const col = fi % 2;
  const row = Math.floor(fi / 2);
  return { x: col * W, y: row * H };
}

// ══════════════════════════════════════════════════════════════
// Shared sub-drawing helpers
// ══════════════════════════════════════════════════════════════

/** Draw the hard hat at (hx, hy) relative to frame top-left */
function drawHat(g, px, py, tilt) {
  const t = tilt || 0;
  // Brim
  g.fillStyle(PAL.hatBrim, 1);
  g.fillRect(px + 7 + t, py + 5, 14, 2);
  // Dome
  g.fillStyle(PAL.hat, 1);
  g.fillRect(px + 9 + t, py + 1, 10, 5);
  // Highlight stripe
  g.fillStyle(PAL.hatHigh, 1);
  g.fillRect(px + 10 + t, py + 2, 6, 1);
}

/** Draw face: skin, beard, eyes, smile */
function drawFace(g, px, py, expression) {
  // expression: 'happy' | 'grin' | 'strain' | 'surpris'

  // Face block (skin)
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 9, py + 7, 10, 9);

  // Ear (right side)
  g.fillStyle(PAL.skinDark, 1);
  g.fillRect(px + 19, py + 9, 1, 3);

  // Beard (lower face)
  g.fillStyle(PAL.beard, 1);
  g.fillRect(px + 9, py + 12, 10, 4);
  // Sideburns
  g.fillRect(px + 8, py + 10, 1, 4);
  g.fillRect(px + 19, py + 10, 1, 4);

  // Eyes
  if (expression === 'strain') {
    // Squinting
    g.fillStyle(PAL.eye, 1);
    g.fillRect(px + 11, py + 9, 2, 1);
    g.fillRect(px + 16, py + 9, 2, 1);
  } else if (expression === 'surpris') {
    // Wide eyes
    g.fillStyle(PAL.eyeWhite, 1);
    g.fillRect(px + 11, py + 8, 2, 2);
    g.fillRect(px + 16, py + 8, 2, 2);
    g.fillStyle(PAL.eye, 1);
    g.fillRect(px + 12, py + 9, 1, 1);
    g.fillRect(px + 17, py + 9, 1, 1);
  } else {
    // Happy / grin — bright eyes
    g.fillStyle(PAL.eyeWhite, 1);
    g.fillRect(px + 11, py + 8, 2, 2);
    g.fillRect(px + 16, py + 8, 2, 2);
    g.fillStyle(PAL.eye, 1);
    g.fillRect(px + 12, py + 8, 1, 1);
    g.fillRect(px + 17, py + 8, 1, 1);
  }

  // Cheeks (blush)
  g.fillStyle(PAL.cheek, 1);
  g.fillRect(px + 9, py + 11, 1, 1);
  g.fillRect(px + 19, py + 11, 1, 1);

  // Mouth in beard area
  if (expression === 'grin' || expression === 'happy') {
    // Smile
    g.fillStyle(PAL.mouth, 1);
    g.fillRect(px + 12, py + 13, 4, 1);
    // Upturned corners
    g.fillRect(px + 11, py + 12, 1, 1);
    g.fillRect(px + 16, py + 12, 1, 1);
  } else if (expression === 'surpris') {
    // O mouth
    g.fillStyle(PAL.mouth, 1);
    g.fillRect(px + 13, py + 13, 2, 2);
  } else {
    // Neutral pressed lips
    g.fillStyle(PAL.mouth, 1);
    g.fillRect(px + 12, py + 13, 4, 1);
  }
}

/** Draw shirt torso at standard position */
function drawShirt(g, px, py, lean) {
  const l = lean || 0;
  // Main shirt
  g.fillStyle(PAL.shirt, 1);
  g.fillRect(px + 7 + l, py + 16, 14, 11);
  // Shadow on side
  g.fillStyle(PAL.shirtDark, 1);
  g.fillRect(px + 7 + l, py + 16, 2, 11);
  // Chest pocket
  g.fillStyle(PAL.pocket, 1);
  g.fillRect(px + 16 + l, py + 18, 3, 3);
  // Collar
  g.fillStyle(PAL.shirtDark, 1);
  g.fillRect(px + 11 + l, py + 16, 6, 1);
}

/** Draw tool belt */
function drawBelt(g, px, py) {
  g.fillStyle(PAL.belt, 1);
  g.fillRect(px + 7, py + 27, 14, 2);
  // Buckle
  g.fillStyle(PAL.buckle, 1);
  g.fillRect(px + 13, py + 27, 2, 2);
  // Tool pouch (right hip)
  g.fillStyle(PAL.belt, 1);
  g.fillRect(px + 19, py + 29, 2, 3);
}

/** Draw extension cord plug in hand at (hx, hy) */
function drawCordPlug(g, hx, hy) {
  // Short dangling cord
  g.fillStyle(PAL.cordOrange, 1);
  g.fillRect(hx, hy, 1, 5);
  // Plug body
  g.fillStyle(PAL.cordPlug, 1);
  g.fillRect(hx - 1, hy + 5, 3, 2);
  // Prongs
  g.fillStyle(PAL.cordProng, 1);
  g.fillRect(hx - 1, hy + 7, 1, 2);
  g.fillRect(hx + 1, hy + 7, 1, 2);
}

/** Draw boots at given positions */
function drawBoots(g, px, leftY, rightY) {
  g.fillStyle(PAL.boot, 1);
  g.fillRect(px, leftY, 4, 3);
  g.fillRect(px + 14, rightY, 4, 3);
  // Soles
  g.fillStyle(PAL.bootSole, 1);
  g.fillRect(px, leftY + 3, 5, 1);
  g.fillRect(px + 14, rightY + 3, 5, 1);
}

// ══════════════════════════════════════════════════════════════
// Frame drawing functions
// ══════════════════════════════════════════════════════════════

function drawIdle(g, fi, W, H) {
  const { x: px, y: py } = gp(fi, W, H);

  drawHat(g, px, py, 0);
  drawFace(g, px, py, 'happy');

  // Neck
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 12, py + 15, 4, 2);

  drawShirt(g, px, py, 0);
  drawBelt(g, px, py);

  // Pants
  g.fillStyle(PAL.pants, 1);
  g.fillRect(px + 8, py + 29, 5, 11);
  g.fillRect(px + 15, py + 29, 5, 11);

  // Left arm relaxed
  g.fillStyle(PAL.shirt, 1);
  g.fillRect(px + 4, py + 17, 3, 6);
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 4, py + 23, 3, 3);

  // Right arm holding cord
  g.fillStyle(PAL.shirt, 1);
  g.fillRect(px + 21, py + 17, 3, 6);
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 21, py + 23, 3, 3);
  drawCordPlug(g, px + 23, py + 25);

  drawBoots(g, px + 7, py + 40, py + 40);
}

function drawRun(g, fi, W, H, phase) {
  const { x: px, y: py } = gp(fi, W, H);
  const leftFwd = (phase % 2) === 0;
  const bob = (phase === 1 || phase === 4) ? -1 : 0;

  drawHat(g, px, py + bob, leftFwd ? -1 : 1);
  drawFace(g, px, py + bob, 'grin');

  // Neck
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 12, py + 15 + bob, 4, 2);

  drawShirt(g, px, py + bob, 0);
  drawBelt(g, px, py + bob);

  // Legs — alternating strides
  g.fillStyle(PAL.pants, 1);
  if (leftFwd) {
    g.fillRect(px + 8,  py + 29 + bob, 5, 11);
    g.fillRect(px + 15, py + 31 + bob, 5, 7);

    drawBoots(g, px + 7, py + 40, py + 38 + bob);
  } else {
    g.fillRect(px + 8,  py + 31 + bob, 5, 7);
    g.fillRect(px + 15, py + 29 + bob, 5, 11);

    drawBoots(g, px + 7, py + 38 + bob, py + 40);
  }

  // Arms swinging
  if (leftFwd) {
    // Left arm back
    g.fillStyle(PAL.shirt, 1);
    g.fillRect(px + 3, py + 20 + bob, 3, 5);
    g.fillStyle(PAL.skin, 1);
    g.fillRect(px + 3, py + 25 + bob, 3, 2);

    // Right arm forward holding cord
    g.fillStyle(PAL.shirt, 1);
    g.fillRect(px + 22, py + 15 + bob, 3, 6);
    g.fillStyle(PAL.skin, 1);
    g.fillRect(px + 22, py + 21 + bob, 3, 2);
    drawCordPlug(g, px + 24, py + 22 + bob);
  } else {
    // Left arm forward
    g.fillStyle(PAL.shirt, 1);
    g.fillRect(px + 3, py + 15 + bob, 3, 6);
    g.fillStyle(PAL.skin, 1);
    g.fillRect(px + 3, py + 21 + bob, 3, 2);

    // Right arm back with cord
    g.fillStyle(PAL.shirt, 1);
    g.fillRect(px + 22, py + 20 + bob, 3, 5);
    g.fillStyle(PAL.skin, 1);
    g.fillRect(px + 22, py + 25 + bob, 3, 2);
    drawCordPlug(g, px + 24, py + 26 + bob);
  }
}

function drawGrab(g, fi, W, H, phase) {
  const { x: px, y: py } = gp(fi, W, H);
  const lean = phase < 2 ? 0 : -1;
  const step = phase % 2 === 0;

  drawHat(g, px, py, lean);
  drawFace(g, px, py, 'strain');

  // Neck
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 12 + lean, py + 15, 4, 2);

  drawShirt(g, px, py, lean);
  drawBelt(g, px, py);

  // Legs walking with block
  g.fillStyle(PAL.pants, 1);
  if (step) {
    g.fillRect(px + 8,  py + 29, 5, 11);
    g.fillRect(px + 15, py + 31, 5, 7);
  } else {
    g.fillRect(px + 8,  py + 31, 5, 7);
    g.fillRect(px + 15, py + 29, 5, 11);
  }
  drawBoots(g, px + 7, py + 40, py + 38);

  // Both arms extended forward (pushing)
  g.fillStyle(PAL.shirt, 1);
  g.fillRect(px + 22 + lean, py + 18, 4, 5);
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 24 + lean, py + 23, 3, 3);

  // Back arm bracing
  g.fillStyle(PAL.shirt, 1);
  g.fillRect(px + 3 + lean, py + 20, 3, 5);
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 3 + lean, py + 25, 3, 2);
}

function drawJump(g, fi, W, H, phase) {
  const { x: px, y: py } = gp(fi, W, H);
  const apex = phase === 1;
  const by = apex ? -2 : 0;

  drawHat(g, px, py + by, 0);
  drawFace(g, px, py + by, 'happy');

  // Neck
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 12, py + 15 + by, 4, 2);

  drawShirt(g, px, py + by, 0);
  drawBelt(g, px, py + by);

  // Legs tucked or extended
  g.fillStyle(PAL.pants, 1);
  if (apex) {
    g.fillRect(px + 8,  py + 29 + by, 5, 8);
    g.fillRect(px + 15, py + 29 + by, 5, 8);
    drawBoots(g, px + 7, py + 37 + by, py + 37 + by);
  } else {
    g.fillRect(px + 8,  py + 29, 5, 9);
    g.fillRect(px + 15, py + 29, 5, 9);
    drawBoots(g, px + 7, py + 38, py + 38);
  }

  // Arms up
  g.fillStyle(PAL.shirt, 1);
  g.fillRect(px + 3, py + 14 + by, 3, 6);
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 3, py + 12 + by, 3, 3);

  // Right arm up with cord
  g.fillStyle(PAL.shirt, 1);
  g.fillRect(px + 22, py + 14 + by, 3, 6);
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 22, py + 12 + by, 3, 3);
  drawCordPlug(g, px + 24, py + 13 + by);
}

function drawFall(g, fi, W, H) {
  const { x: px, y: py } = gp(fi, W, H);

  drawHat(g, px, py, 0);
  drawFace(g, px, py, 'surpris');

  // Neck
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 12, py + 15, 4, 2);

  drawShirt(g, px, py, 0);
  drawBelt(g, px, py);

  // Legs splayed
  g.fillStyle(PAL.pants, 1);
  g.fillRect(px + 6,  py + 29, 5, 10);
  g.fillRect(px + 17, py + 30, 5, 9);

  // Boots
  g.fillStyle(PAL.boot, 1);
  g.fillRect(px + 5, py + 39, 4, 3);
  g.fillRect(px + 17, py + 39, 4, 3);
  g.fillStyle(PAL.bootSole, 1);
  g.fillRect(px + 5, py + 42, 5, 1);
  g.fillRect(px + 17, py + 42, 5, 1);

  // Arms splayed out
  g.fillStyle(PAL.shirt, 1);
  g.fillRect(px + 1, py + 17, 5, 3);
  g.fillRect(px + 22, py + 17, 5, 3);
  g.fillStyle(PAL.skin, 1);
  g.fillRect(px + 1, py + 20, 2, 2);
  g.fillRect(px + 25, py + 20, 2, 2);

  // Cord flying
  drawCordPlug(g, px + 25, py + 21);
}
