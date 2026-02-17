/**
 * MentorFace.js
 *
 * Procedurally generates a small pixel-art portrait for the tutorial mentor.
 * Style goal: match Sparky Joe's chunky pixel aesthetic (same general palette family),
 * with gray hair and a moustache.
 */

const PAL = {
  outline: 0x202027,
  bg: 0x000000,
  skin: 0xf4b187,
  skinShadow: 0xdd845e,
  skinDark: 0x8f4a24,
  hairLight: 0xc9cecf,
  hair: 0x989fa4,
  hairDark: 0x595c63,
  eyeWhite: 0xffffff,
  eye: 0x161f32,
};

/**
 * Generate a mentor portrait texture.
 * @param {Phaser.Scene} scene
 * @param {string} key
 */
export function generateMentorFace(scene, key = 'mentor_face') {
  const S = 32;

  // Avoid regenerating if it already exists (scene restarts, etc.)
  if (scene.textures.exists(key)) return key;

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  const px = (x, y, w, h, c, a = 1) => {
    g.fillStyle(c, a);
    g.fillRect(x, y, w, h);
  };

  // Transparent base
  g.fillStyle(0xffffff, 0);
  g.fillRect(0, 0, S, S);

  // --- Head silhouette ---
  // Face block
  px(9, 10, 14, 14, PAL.skin);
  // Chin shading
  px(10, 20, 12, 3, PAL.skinShadow);
  px(12, 22, 8, 2, PAL.skinShadow);

  // Ears
  px(8, 14, 1, 4, PAL.skinShadow);
  px(23, 14, 1, 4, PAL.skinShadow);

  // Nose
  px(16, 16, 2, 2, PAL.skinShadow);
  px(17, 17, 1, 2, PAL.skinDark);

  // --- Hair (gray) ---
  // Top hair cap
  px(9, 7, 14, 4, PAL.hair);
  px(10, 6, 12, 1, PAL.hairLight);
  // Side hair / temples
  px(9, 11, 2, 4, PAL.hairDark);
  px(21, 11, 2, 4, PAL.hairDark);

  // --- Eyes & brows ---
  // Brows
  px(12, 13, 4, 1, PAL.hairDark);
  px(18, 13, 4, 1, PAL.hairDark);
  // Eyes
  px(13, 15, 2, 2, PAL.eyeWhite);
  px(19, 15, 2, 2, PAL.eyeWhite);
  px(14, 16, 1, 1, PAL.eye);
  px(20, 16, 1, 1, PAL.eye);

  // --- Moustache (gray) ---
  px(12, 19, 10, 2, PAL.hairDark);
  px(11, 20, 12, 1, PAL.hair);
  // Philtrum gap / mouth shadow
  px(16, 19, 2, 1, PAL.skinShadow);
  px(15, 21, 4, 1, PAL.skinDark);

  // --- Outline (chunky) ---
  // Top outline
  px(9, 6, 14, 1, PAL.outline);
  // Sides
  px(8, 10, 1, 14, PAL.outline);
  px(23, 10, 1, 14, PAL.outline);
  // Bottom
  px(9, 24, 14, 1, PAL.outline);

  // Hair outline bumps
  px(8, 9, 1, 1, PAL.outline);
  px(23, 9, 1, 1, PAL.outline);
  px(10, 5, 12, 1, PAL.outline);

  // Ear outline
  px(7, 14, 1, 4, PAL.outline);
  px(24, 14, 1, 4, PAL.outline);

  // Small neck / radio collar hint (optional but subtle)
  px(13, 25, 6, 2, PAL.hairDark);
  px(12, 25, 1, 2, PAL.outline);
  px(19, 25, 1, 2, PAL.outline);
  px(13, 27, 6, 1, PAL.outline);

  g.generateTexture(key, S, S);
  g.destroy();

  return key;
}
