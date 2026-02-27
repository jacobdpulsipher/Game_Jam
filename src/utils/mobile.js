/**
 * Mobile / touch-device detection utilities.
 */

/**
 * Returns true when the game is running on a touch-primary device
 * (phone or tablet).  Uses a combination of User-Agent sniffing and
 * touch-capability detection so it works reliably on iOS, Android,
 * and iPadOS (which spoofs a desktop UA but still reports touch).
 */
export function isMobile() {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || '';

  // Obvious mobile UA strings
  if (/Android|iPhone|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua)) {
    return true;
  }

  // iPad (iPadOS 13+ reports as Mac)
  if (/iPad/i.test(ua)) return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;

  // Generic touch-only heuristic (no mouse pointer)
  if ('ontouchstart' in window && navigator.maxTouchPoints > 0) {
    // Exclude laptops with touchscreens — they also have fine pointers
    if (window.matchMedia?.('(pointer: coarse)').matches) {
      return true;
    }
  }

  return false;
}
