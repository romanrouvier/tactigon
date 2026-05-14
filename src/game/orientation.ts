import type { Coord } from './types';

/**
 * Transform a pattern offset from player-local frame to board frame.
 * Player local: dy < 0 = forward (toward enemy).
 * rotation 0°   → forward = -y on board (player 1, bottom)
 * rotation 180° → forward = +y on board (player 2, top)
 * rotation 90°  → forward = -x on board (player 3, left side)
 * rotation 270° → forward = +x on board (player 4, right side)
 */
export function applyRotation(
  dx: number,
  dy: number,
  rotation: 0 | 90 | 180 | 270
): Coord {
  switch (rotation) {
    case 0:
      // local (dx, dy) → board (dx, dy) — player at bottom, forward = up (-y)
      return { x: dx, y: dy };
    case 180:
      // player at top, forward = down (+y)
      return { x: -dx, y: -dy };
    case 90:
      // player at right side, forward = left (-x)
      return { x: dy, y: -dx };
    case 270:
      // player at left side, forward = right (+x)
      return { x: -dy, y: dx };
  }
}
