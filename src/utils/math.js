/**
 * Clamp a value between min and max (inclusive).
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between a and b by factor t (0–1).
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Random integer in [min, max] (inclusive).
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Convert degrees to radians.
 */
export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Convert radians to degrees.
 */
export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}
