import type { BoardLayout } from '../game/types';

/**
 * 13x13 board for 1v1v1v1.
 *
 * Layout (x = col 0-12, y = row 0-12):
 *
 *   P3 (top, rot 180°, forward=+y) → y=0-1, x=3-9
 *   P2 (right, rot 90°, forward=-x) → x=11-12, y=3-9
 *   P1 (bottom, rot 0°, forward=-y) → y=11-12, x=3-9
 *   P4 (left, rot 270°, forward=+x) → x=0-1, y=3-9
 *
 *   The 4 corner 3×3 blocks are walls (no player starts there).
 *   Additional single-cell obstacles in the mid-zones and centre.
 *
 * startCells order (matches setupBoard.getStartCell):
 *   [0-6]  = front row, local col 0→6
 *   [7-13] = back row,  local col 0→6
 *
 * Local "col 0" is the player's left side (dx=-3), col 6 is their right (dx=+3).
 * Derived from applyRotation:
 *   rot 0°  : local(1,0) → board(+1, 0) → col increases with x
 *   rot 180°: local(1,0) → board(-1, 0) → col increases with x decreasing
 *   rot 90° : local(1,0) → board( 0,-1) → col increases with y decreasing
 *   rot 270°: local(1,0) → board( 0,+1) → col increases with y increasing
 */

// ── Helper ─────────────────────────────────────────────────────────────────
function row(cells: Array<{ x: number; y: number }>) {
  return cells;
}

// ── Wall generation ────────────────────────────────────────────────────────
const walls: { x: number; y: number }[] = [];

// 4 corner 3×3 blocks
for (let cx = 0; cx <= 2; cx++) {
  for (let cy = 0; cy <= 2; cy++) {
    walls.push({ x: cx, y: cy });           // top-left
    walls.push({ x: 12 - cx, y: cy });      // top-right
    walls.push({ x: cx, y: 12 - cy });      // bottom-left
    walls.push({ x: 12 - cx, y: 12 - cy }); // bottom-right
  }
}

// Mid-zone single obstacles (between player zones and the central field)
// Horizontal pinch-points at y=3 and y=9 in the middle columns
const midObs: { x: number; y: number }[] = [
  // top pinch (below P3 zone)
  { x: 3, y: 2 }, { x: 9, y: 2 },
  // bottom pinch (above P1 zone)
  { x: 3, y: 10 }, { x: 9, y: 10 },
  // left pinch (right of P4 zone)
  { x: 2, y: 3 }, { x: 2, y: 9 },
  // right pinch (left of P2 zone)
  { x: 10, y: 3 }, { x: 10, y: 9 },
  // central cross obstacles
  { x: 5, y: 5 }, { x: 7, y: 5 },
  { x: 5, y: 7 }, { x: 7, y: 7 },
  { x: 6, y: 6 },
];
walls.push(...midObs);

// ── Player start cells ──────────────────────────────────────────────────────

// Player 1 — bottom, rotation 0° (forward = -y = up)
// Local col 0→6 maps to board x = 3→9
// front row y=11, back row y=12
const p1Start = [
  ...row([3,4,5,6,7,8,9].map(x => ({ x, y: 11 }))), // front (row 0)
  ...row([3,4,5,6,7,8,9].map(x => ({ x, y: 12 }))), // back  (row 1)
];

// Player 2 — right side, rotation 90° (forward = -x = left)
// local(1,0) → board(0,-1): col 0→6 maps to board y = 9→3
// front col x=11, back col x=12
const p2Start = [
  ...row([9,8,7,6,5,4,3].map(y => ({ x: 11, y }))), // front (row 0)
  ...row([9,8,7,6,5,4,3].map(y => ({ x: 12, y }))), // back  (row 1)
];

// Player 3 — top, rotation 180° (forward = +y = down)
// local(1,0) → board(-1,0): col 0→6 maps to board x = 9→3
// front row y=1, back row y=0
const p3Start = [
  ...row([9,8,7,6,5,4,3].map(x => ({ x, y: 1 }))), // front (row 0)
  ...row([9,8,7,6,5,4,3].map(x => ({ x, y: 0 }))), // back  (row 1)
];

// Player 4 — left side, rotation 270° (forward = +x = right)
// local(1,0) → board(0,+1): col 0→6 maps to board y = 3→9
// front col x=1, back col x=0
const p4Start = [
  ...row([3,4,5,6,7,8,9].map(y => ({ x: 1, y }))), // front (row 0)
  ...row([3,4,5,6,7,8,9].map(y => ({ x: 0, y }))), // back  (row 1)
];

export const board13x13: BoardLayout = {
  cols: 13,
  rows: 13,
  walls,
  players: [
    { playerId: 1, rotation: 0,   startCells: p1Start },
    { playerId: 2, rotation: 90,  startCells: p2Start },
    { playerId: 3, rotation: 180, startCells: p3Start },
    { playerId: 4, rotation: 270, startCells: p4Start },
  ],
};
