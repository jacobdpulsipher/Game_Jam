/**
 * ElectricianSprite.js
 *
 * Procedurally generates a detailed sprite sheet for "Sparky" the electrician hero.
 * Creates all animation frames (IDLE, RUN, GRAB/PUSH, JUMP, FALL) as a single texture.
 *
 * Character Design (matches reference art):
 *   - 48×64 pixel character (high detail)
 *   - Orange/yellow hard hat with brim, dome, highlight, and black outline
 *   - Warm tan skin, brown full beard with sideburns
 *   - Bright eyes with whites, friendly expressions
 *   - Teal-blue work shirt with collar, pocket, buttons, sleeve cuffs
 *   - Brown leather tool belt with gold buckle, hip pouches, and loops
 *   - Blue work pants with seam detail and knee shading
 *   - Brown work boots with laces, tongue, and dark rubber soles
 *   - Holds extension cord plug in right hand (orange cord, silver plug, 2 prongs)
 *   - Dark outline for readability against backgrounds
 */

// ── Palette ────────────────────────────────────────────────
const P = {
  outline:    0x222222,  // dark outline
  skin:       0xd4a574,  // warm tan
  skinLight:  0xe2ba8a,  // highlight skin
  skinDark:   0xb88b5e,  // shadow skin
  beard:      0x7a4f2b,  // brown beard
  beardDark:  0x5c3a1e,  // beard shadow
  beardLight: 0x946738,  // beard highlight
  hat:        0xf5a623,  // hard hat orange
  hatDark:    0xd48b12,  // hat brim / shadow
  hatLight:   0xffc95c,  // hat highlight
  hatBand:    0xe89520,  // hat band
  shirt:      0x4aafcf,  // teal-blue shirt
  shirtDark:  0x2c8aaa,  // shirt shadow/fold
  shirtLight: 0x68c4de,  // shirt highlight
  collar:     0x3a9ab8,  // collar darker
  pocket:     0x5dbfda,  // pocket square
  button:     0x357a92,  // button detail
  belt:       0x6b4226,  // brown belt
  beltDark:   0x4a2e18,  // belt shadow
  buckle:     0xffc107,  // gold buckle
  buckleDk:   0xd4a000,  // buckle shadow
  pouch:      0x7d5030,  // pouch leather
  pouchDark:  0x5c3a20,  // pouch shadow
  pants:      0x2874a6,  // blue pants
  pantsDark:  0x1e5a82,  // pants shadow/seam
  pantsLight: 0x348ebe,  // pants highlight
  boot:       0x6b3e22,  // brown boot
  bootDark:   0x4a2a14,  // boot shadow
  bootLight:  0x7d5030,  // boot highlight
  bootLace:   0x8b6040,  // laces
  sole:       0x2a1a0e,  // dark rubber sole
  eye:        0x1a1a1a,  // pupil
  eyeWhite:   0xfafafa,  // eye white
  eyeBrow:    0x5c3a1e,  // eyebrow (matches beard)
  mouth:      0xcc5555,  // smile
  cheek:      0xd4946a,  // subtle blush
  cordOrange: 0xff8c00,  // extension cord
  cordDark:   0xd47400,  // cord shadow
  plug:       0xb8b8b8,  // plug body
  plugDark:   0x909090,  // plug shadow
  prong:      0x777777,  // prong metal
};

/**
 * Main entry point — generates the electrician sprite sheet and registers animations.
 */
export function generateElectricianSpriteSheet(scene) {
  const W = 48;
  const H = 64;

  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.setDepth(-1);

  const cols = 2;
  const rows = 7;
  const tw = W * cols;
  const th = H * rows;

  g.fillStyle(0x000000, 0);
  g.fillRect(0, 0, tw, th);

  let fi = 0;

  // Frame 0: IDLE
  drawIdle(g, fi++, W, H);
  // Frames 1-6: RUN
  for (let i = 0; i < 6; i++) drawRun(g, fi++, W, H, i);
  // Frames 7-10: GRAB/PUSH
  for (let i = 0; i < 4; i++) drawGrab(g, fi++, W, H, i);
  // Frames 11-12: JUMP
  for (let i = 0; i < 2; i++) drawJump(g, fi++, W, H, i);
  // Frame 13: FALL
  drawFall(g, fi++, W, H);

  g.generateTexture('electrician', tw, th);
  g.destroy();

  const tex = scene.textures.get('electrician');
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    tex.add(i, 0, col * W, row * H, W, H);
  }

  const fr = (s, e) => {
    const a = [];
    for (let i = s; i <= e; i++) a.push({ key: 'electrician', frame: i });
    return a;
  };

  return {
    textureKey: 'electrician',
    frames: { frameWidth: W, frameHeight: H },
    animations: {
      idle: { key: 'idle', frames: [{ key: 'electrician', frame: 0 }], frameRate: 10, repeat: -1 },
      run:  { key: 'run',  frames: fr(1, 6),  frameRate: 14, repeat: -1 },
      grab: { key: 'grab', frames: fr(7, 10), frameRate: 10, repeat: -1 },
      jump: { key: 'jump', frames: [{ key: 'electrician', frame: 11 }], frameRate: 18, repeat: 0 },
      fall: { key: 'fall', frames: [{ key: 'electrician', frame: 13 }], frameRate: 10, repeat: -1 },
    }
  };
}

// ── Grid helper ──────────────────────────────────────────────
function gp(fi, W, H) {
  return { x: (fi % 2) * W, y: Math.floor(fi / 2) * H };
}

// ══════════════════════════════════════════════════════════════
//  Detailed sub-drawing helpers
// ══════════════════════════════════════════════════════════════

function drawHat(g, px, py, tilt) {
  const t = tilt || 0;
  // Outline
  g.fillStyle(P.outline, 1);
  g.fillRect(px + 12 + t, py + 1,  24, 1);   // top edge
  g.fillRect(px + 11 + t, py + 2,  1, 8);     // left edge
  g.fillRect(px + 36 + t, py + 2,  1, 8);     // right edge
  g.fillRect(px + 9  + t, py + 9,  30, 1);    // brim outline bottom

  // Dome
  g.fillStyle(P.hat, 1);
  g.fillRect(px + 12 + t, py + 2, 24, 5);
  // Highlight band
  g.fillStyle(P.hatLight, 1);
  g.fillRect(px + 14 + t, py + 3, 16, 2);
  // Hat band
  g.fillStyle(P.hatBand, 1);
  g.fillRect(px + 12 + t, py + 6, 24, 1);

  // Brim
  g.fillStyle(P.hatDark, 1);
  g.fillRect(px + 10 + t, py + 7, 28, 3);
  // Brim highlight
  g.fillStyle(P.hat, 1);
  g.fillRect(px + 12 + t, py + 7, 24, 1);
}

function drawFace(g, px, py, expr) {
  // Head outline
  g.fillStyle(P.outline, 1);
  g.fillRect(px + 13, py + 10, 22, 1);
  g.fillRect(px + 12, py + 11, 1, 14);
  g.fillRect(px + 35, py + 11, 1, 14);
  g.fillRect(px + 13, py + 25, 22, 1);

  // Face fill
  g.fillStyle(P.skin, 1);
  g.fillRect(px + 13, py + 11, 22, 14);

  // Highlight on forehead
  g.fillStyle(P.skinLight, 1);
  g.fillRect(px + 16, py + 11, 14, 2);

  // Ears
  g.fillStyle(P.skinDark, 1);
  g.fillRect(px + 12, py + 14, 1, 4);
  g.fillRect(px + 35, py + 14, 1, 4);

  // Eyebrows
  g.fillStyle(P.eyeBrow, 1);
  g.fillRect(px + 16, py + 13, 4, 1);
  g.fillRect(px + 27, py + 13, 4, 1);

  // Eyes
  if (expr === 'strain') {
    g.fillStyle(P.eye, 1);
    g.fillRect(px + 16, py + 15, 4, 1);
    g.fillRect(px + 27, py + 15, 4, 1);
  } else if (expr === 'surprise') {
    // Wide
    g.fillStyle(P.eyeWhite, 1);
    g.fillRect(px + 16, py + 14, 4, 3);
    g.fillRect(px + 27, py + 14, 4, 3);
    g.fillStyle(P.eye, 1);
    g.fillRect(px + 18, py + 15, 2, 2);
    g.fillRect(px + 29, py + 15, 2, 2);
    // Shine
    g.fillStyle(P.eyeWhite, 1);
    g.fillRect(px + 18, py + 15, 1, 1);
    g.fillRect(px + 29, py + 15, 1, 1);
  } else {
    // Happy / grin
    g.fillStyle(P.eyeWhite, 1);
    g.fillRect(px + 16, py + 14, 4, 3);
    g.fillRect(px + 27, py + 14, 4, 3);
    g.fillStyle(P.eye, 1);
    g.fillRect(px + 18, py + 14, 2, 2);
    g.fillRect(px + 29, py + 14, 2, 2);
    // Shine
    g.fillStyle(P.eyeWhite, 1);
    g.fillRect(px + 18, py + 14, 1, 1);
    g.fillRect(px + 29, py + 14, 1, 1);
  }

  // Nose
  g.fillStyle(P.skinDark, 1);
  g.fillRect(px + 23, py + 17, 2, 2);

  // Cheeks
  g.fillStyle(P.cheek, 1);
  g.fillRect(px + 14, py + 18, 3, 2);
  g.fillRect(px + 31, py + 18, 3, 2);

  // Beard
  g.fillStyle(P.beard, 1);
  g.fillRect(px + 13, py + 20, 22, 5);
  // Sideburns
  g.fillRect(px + 12, py + 16, 2, 6);
  g.fillRect(px + 34, py + 16, 2, 6);
  // Beard texture
  g.fillStyle(P.beardDark, 1);
  g.fillRect(px + 14, py + 22, 2, 2);
  g.fillRect(px + 19, py + 23, 2, 1);
  g.fillRect(px + 26, py + 22, 2, 2);
  g.fillRect(px + 31, py + 23, 2, 1);
  // Beard highlight
  g.fillStyle(P.beardLight, 1);
  g.fillRect(px + 17, py + 20, 3, 1);
  g.fillRect(px + 28, py + 20, 3, 1);

  // Mouth (inside beard)
  if (expr === 'happy' || expr === 'grin') {
    g.fillStyle(P.mouth, 1);
    g.fillRect(px + 19, py + 21, 10, 1);
    // Smile upturn
    g.fillRect(px + 18, py + 20, 1, 1);
    g.fillRect(px + 29, py + 20, 1, 1);
    if (expr === 'grin') {
      // Teeth flash
      g.fillStyle(P.eyeWhite, 1);
      g.fillRect(px + 20, py + 21, 8, 1);
    }
  } else if (expr === 'surprise') {
    g.fillStyle(P.mouth, 1);
    g.fillRect(px + 22, py + 21, 4, 3);
  } else {
    g.fillStyle(P.mouth, 1);
    g.fillRect(px + 20, py + 21, 8, 1);
  }
}

function drawNeck(g, px, py) {
  g.fillStyle(P.skin, 1);
  g.fillRect(px + 19, py + 25, 10, 3);
  g.fillStyle(P.skinDark, 1);
  g.fillRect(px + 19, py + 27, 10, 1);
}

function drawShirt(g, px, py, lean) {
  const l = lean || 0;
  // Outline
  g.fillStyle(P.outline, 1);
  g.fillRect(px + 10 + l, py + 28, 28, 1);
  g.fillRect(px + 9  + l, py + 29, 1, 14);
  g.fillRect(px + 38 + l, py + 29, 1, 14);

  // Main shirt body
  g.fillStyle(P.shirt, 1);
  g.fillRect(px + 10 + l, py + 29, 28, 13);

  // Shadow side
  g.fillStyle(P.shirtDark, 1);
  g.fillRect(px + 10 + l, py + 29, 3, 13);
  // Fold lines
  g.fillRect(px + 22 + l, py + 32, 1, 8);
  g.fillRect(px + 26 + l, py + 33, 1, 6);

  // Highlight
  g.fillStyle(P.shirtLight, 1);
  g.fillRect(px + 28 + l, py + 30, 4, 3);

  // Collar
  g.fillStyle(P.collar, 1);
  g.fillRect(px + 17 + l, py + 28, 14, 2);
  // Collar V
  g.fillStyle(P.shirt, 1);
  g.fillRect(px + 22 + l, py + 28, 4, 2);

  // Chest pocket
  g.fillStyle(P.pocket, 1);
  g.fillRect(px + 28 + l, py + 33, 5, 4);
  g.fillStyle(P.shirtDark, 1);
  g.fillRect(px + 28 + l, py + 33, 5, 1); // pocket top edge

  // Buttons
  g.fillStyle(P.button, 1);
  g.fillRect(px + 24 + l, py + 31, 1, 1);
  g.fillRect(px + 24 + l, py + 34, 1, 1);
  g.fillRect(px + 24 + l, py + 37, 1, 1);
}

function drawBelt(g, px, py) {
  // Belt outline
  g.fillStyle(P.outline, 1);
  g.fillRect(px + 9, py + 42, 30, 1);

  // Belt
  g.fillStyle(P.belt, 1);
  g.fillRect(px + 10, py + 42, 28, 3);
  g.fillStyle(P.beltDark, 1);
  g.fillRect(px + 10, py + 44, 28, 1);

  // Buckle
  g.fillStyle(P.buckle, 1);
  g.fillRect(px + 22, py + 42, 4, 3);
  g.fillStyle(P.buckleDk, 1);
  g.fillRect(px + 23, py + 43, 2, 1);

  // Left pouch
  g.fillStyle(P.pouch, 1);
  g.fillRect(px + 11, py + 45, 4, 4);
  g.fillStyle(P.pouchDark, 1);
  g.fillRect(px + 11, py + 45, 4, 1);

  // Right pouch
  g.fillStyle(P.pouch, 1);
  g.fillRect(px + 33, py + 45, 4, 4);
  g.fillStyle(P.pouchDark, 1);
  g.fillRect(px + 33, py + 45, 4, 1);

  // Tool loop (center-left)
  g.fillStyle(P.beltDark, 1);
  g.fillRect(px + 17, py + 42, 1, 3);
  g.fillRect(px + 19, py + 42, 1, 3);
}

function drawPants(g, px, py, leftOff, rightOff) {
  const lo = leftOff || 0;
  const ro = rightOff || 0;

  // Left leg
  g.fillStyle(P.pants, 1);
  g.fillRect(px + 12, py + 45 + lo, 8, 12 - lo);
  g.fillStyle(P.pantsDark, 1);
  g.fillRect(px + 12, py + 45 + lo, 2, 12 - lo);  // inseam shadow
  g.fillRect(px + 15, py + 50 + lo, 1, 5);          // crease

  // Right leg
  g.fillStyle(P.pants, 1);
  g.fillRect(px + 28, py + 45 + ro, 8, 12 - ro);
  g.fillStyle(P.pantsDark, 1);
  g.fillRect(px + 34, py + 45 + ro, 2, 12 - ro);   // outer shadow
  g.fillRect(px + 31, py + 50 + ro, 1, 5);           // crease

  // Knee highlight
  g.fillStyle(P.pantsLight, 1);
  g.fillRect(px + 14, py + 50 + lo, 3, 2);
  g.fillRect(px + 30, py + 50 + ro, 3, 2);
}

function drawBoots(g, px, py, leftY, rightY) {
  // Left boot
  g.fillStyle(P.outline, 1);
  g.fillRect(px + 10, leftY, 12, 1);
  g.fillStyle(P.boot, 1);
  g.fillRect(px + 10, leftY + 1, 12, 4);
  g.fillStyle(P.bootDark, 1);
  g.fillRect(px + 10, leftY + 1, 2, 4);
  // Tongue
  g.fillStyle(P.bootLight, 1);
  g.fillRect(px + 14, leftY, 4, 2);
  // Lace
  g.fillStyle(P.bootLace, 1);
  g.fillRect(px + 14, leftY + 2, 4, 1);
  // Sole
  g.fillStyle(P.sole, 1);
  g.fillRect(px + 9, leftY + 5, 14, 2);

  // Right boot
  g.fillStyle(P.outline, 1);
  g.fillRect(px + 26, rightY, 12, 1);
  g.fillStyle(P.boot, 1);
  g.fillRect(px + 26, rightY + 1, 12, 4);
  g.fillStyle(P.bootDark, 1);
  g.fillRect(px + 36, rightY + 1, 2, 4);
  // Tongue
  g.fillStyle(P.bootLight, 1);
  g.fillRect(px + 30, rightY, 4, 2);
  // Lace
  g.fillStyle(P.bootLace, 1);
  g.fillRect(px + 30, rightY + 2, 4, 1);
  // Sole
  g.fillStyle(P.sole, 1);
  g.fillRect(px + 25, rightY + 5, 14, 2);
}

function drawArm(g, px, py, side, pose, yOff) {
  // side: 'left' | 'right',  pose: 'down' | 'forward' | 'back' | 'up' | 'push' | 'splay'
  const yo = yOff || 0;
  const isLeft = side === 'left';
  const sx = isLeft ? px + 4 : px + 36;

  if (pose === 'down') {
    // Sleeve
    g.fillStyle(P.shirt, 1);
    g.fillRect(sx, py + 30 + yo, 5, 8);
    g.fillStyle(P.shirtDark, 1);
    g.fillRect(sx, py + 30 + yo, 1, 8);
    // Cuff
    g.fillStyle(P.collar, 1);
    g.fillRect(sx, py + 37 + yo, 5, 1);
    // Hand
    g.fillStyle(P.skin, 1);
    g.fillRect(sx, py + 38 + yo, 5, 3);
    g.fillStyle(P.skinDark, 1);
    g.fillRect(sx + 1, py + 40 + yo, 3, 1);
  } else if (pose === 'forward') {
    g.fillStyle(P.shirt, 1);
    g.fillRect(sx, py + 28 + yo, 6, 7);
    g.fillStyle(P.collar, 1);
    g.fillRect(sx, py + 34 + yo, 6, 1);
    g.fillStyle(P.skin, 1);
    g.fillRect(sx + 1, py + 35 + yo, 5, 3);
  } else if (pose === 'back') {
    g.fillStyle(P.shirt, 1);
    g.fillRect(sx, py + 33 + yo, 5, 7);
    g.fillStyle(P.collar, 1);
    g.fillRect(sx, py + 39 + yo, 5, 1);
    g.fillStyle(P.skin, 1);
    g.fillRect(sx, py + 40 + yo, 5, 3);
  } else if (pose === 'up') {
    g.fillStyle(P.shirt, 1);
    g.fillRect(sx, py + 24 + yo, 5, 8);
    g.fillStyle(P.collar, 1);
    g.fillRect(sx, py + 24 + yo, 5, 1);
    g.fillStyle(P.skin, 1);
    g.fillRect(sx, py + 22 + yo, 5, 3);
  } else if (pose === 'push') {
    g.fillStyle(P.shirt, 1);
    g.fillRect(sx + (isLeft ? -2 : 0), py + 30 + yo, 8, 6);
    g.fillStyle(P.collar, 1);
    g.fillRect(sx + (isLeft ? -2 : 0), py + 35 + yo, 8, 1);
    g.fillStyle(P.skin, 1);
    g.fillRect(sx + (isLeft ? -2 : 4), py + 36 + yo, 5, 3);
  } else if (pose === 'splay') {
    g.fillStyle(P.shirt, 1);
    g.fillRect(isLeft ? px + 1 : px + 38, py + 29 + yo, 8, 4);
    g.fillStyle(P.skin, 1);
    g.fillRect(isLeft ? px     : px + 42, py + 33 + yo, 4, 3);
  }
}

function drawCordPlug(g, hx, hy) {
  // Cord segment
  g.fillStyle(P.cordOrange, 1);
  g.fillRect(hx, hy, 2, 6);
  g.fillStyle(P.cordDark, 1);
  g.fillRect(hx, hy, 1, 6);
  // Plug body
  g.fillStyle(P.plug, 1);
  g.fillRect(hx - 1, hy + 6, 4, 3);
  g.fillStyle(P.plugDark, 1);
  g.fillRect(hx - 1, hy + 8, 4, 1);
  // Prongs
  g.fillStyle(P.prong, 1);
  g.fillRect(hx - 1, hy + 9, 1, 3);
  g.fillRect(hx + 2, hy + 9, 1, 3);
}

// ══════════════════════════════════════════════════════════════
//  Frame drawing functions
// ══════════════════════════════════════════════════════════════

function drawIdle(g, fi, W, H) {
  const { x: px, y: py } = gp(fi, W, H);

  drawHat(g, px, py, 0);
  drawFace(g, px, py, 'happy');
  drawNeck(g, px, py);
  drawShirt(g, px, py, 0);
  drawBelt(g, px, py);
  drawPants(g, px, py, 0, 0);
  drawBoots(g, px, py, py + 57, py + 57);

  // Left arm relaxed
  drawArm(g, px, py, 'left', 'down', 0);

  // Right arm holding cord
  drawArm(g, px, py, 'right', 'down', 0);
  drawCordPlug(g, px + 39, py + 40);
}

function drawRun(g, fi, W, H, phase) {
  const { x: px, y: py } = gp(fi, W, H);
  const leftFwd = (phase % 2) === 0;
  const bob = (phase === 1 || phase === 4) ? -1 : 0;

  drawHat(g, px, py + bob, leftFwd ? -1 : 1);
  drawFace(g, px, py + bob, 'grin');
  drawNeck(g, px, py + bob);
  drawShirt(g, px, py + bob, 0);
  drawBelt(g, px, py + bob);

  if (leftFwd) {
    drawPants(g, px, py + bob, 0, 3);
    drawBoots(g, px, py, py + 57 + bob, py + 54 + bob);
  } else {
    drawPants(g, px, py + bob, 3, 0);
    drawBoots(g, px, py, py + 54 + bob, py + 57 + bob);
  }

  if (leftFwd) {
    drawArm(g, px, py, 'left', 'back', bob);
    drawArm(g, px, py, 'right', 'forward', bob);
    drawCordPlug(g, px + 40, py + 36 + bob);
  } else {
    drawArm(g, px, py, 'left', 'forward', bob);
    drawArm(g, px, py, 'right', 'back', bob);
    drawCordPlug(g, px + 39, py + 42 + bob);
  }
}

function drawGrab(g, fi, W, H, phase) {
  const { x: px, y: py } = gp(fi, W, H);
  const lean = phase < 2 ? 0 : -1;
  const step = phase % 2 === 0;

  drawHat(g, px, py, lean);
  drawFace(g, px, py, 'strain');
  drawNeck(g, px, py);
  drawShirt(g, px, py, lean);
  drawBelt(g, px, py);

  if (step) {
    drawPants(g, px, py, 0, 2);
    drawBoots(g, px, py, py + 57, py + 55);
  } else {
    drawPants(g, px, py, 2, 0);
    drawBoots(g, px, py, py + 55, py + 57);
  }

  // Push arms
  drawArm(g, px, py, 'right', 'push', 0);
  drawArm(g, px, py, 'left', 'back', 0);
}

function drawJump(g, fi, W, H, phase) {
  const { x: px, y: py } = gp(fi, W, H);
  const apex = phase === 1;
  const by = apex ? -2 : 0;

  drawHat(g, px, py + by, 0);
  drawFace(g, px, py + by, 'happy');
  drawNeck(g, px, py + by);
  drawShirt(g, px, py + by, 0);
  drawBelt(g, px, py + by);

  if (apex) {
    drawPants(g, px, py + by, 2, 2);
    drawBoots(g, px, py, py + 55 + by, py + 55 + by);
  } else {
    drawPants(g, px, py, 0, 0);
    drawBoots(g, px, py, py + 57, py + 57);
  }

  drawArm(g, px, py, 'left', 'up', by);
  drawArm(g, px, py, 'right', 'up', by);
  drawCordPlug(g, px + 39, py + 22 + by);
}

function drawFall(g, fi, W, H) {
  const { x: px, y: py } = gp(fi, W, H);

  drawHat(g, px, py, 0);
  drawFace(g, px, py, 'surprise');
  drawNeck(g, px, py);
  drawShirt(g, px, py, 0);
  drawBelt(g, px, py);

  // Legs slightly splayed
  // Left leg angled out
  g.fillStyle(P.pants, 1);
  g.fillRect(px + 9,  py + 45, 8, 11);
  g.fillStyle(P.pantsDark, 1);
  g.fillRect(px + 9, py + 45, 2, 11);
  // Right leg angled out
  g.fillStyle(P.pants, 1);
  g.fillRect(px + 31, py + 46, 8, 10);
  g.fillStyle(P.pantsDark, 1);
  g.fillRect(px + 37, py + 46, 2, 10);

  // Boots wider stance
  g.fillStyle(P.boot, 1);
  g.fillRect(px + 7, py + 56, 12, 4);
  g.fillRect(px + 29, py + 56, 12, 4);
  g.fillStyle(P.sole, 1);
  g.fillRect(px + 6, py + 60, 14, 2);
  g.fillRect(px + 28, py + 60, 14, 2);

  // Arms splayed
  drawArm(g, px, py, 'left', 'splay', 0);
  drawArm(g, px, py, 'right', 'splay', 0);
  drawCordPlug(g, px + 42, py + 35);
}
