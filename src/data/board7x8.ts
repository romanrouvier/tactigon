import type { BoardLayout } from '../game/types';

/**
 * 7x8 board for 1v1.
 * Player 1: bottom (y=6,7), rotation 0° (forward = -y, up the screen).
 * Player 2: top (y=0,1), rotation 180° (forward = +y, down the screen).
 *
 * startCells for each player are listed in order:
 * [front-row col0..col6, back-row col0..col6]
 * (14 cells per player = 7 front + 7 back, but only 12 will be used)
 *
 * Player 1 front row: y=6, x=0..6
 * Player 1 back row:  y=7, x=0..6
 * Player 2 front row: y=1, x=0..6  (mirror: x=6..0? No, same x order)
 * Player 2 back row:  y=0, x=0..6
 *
 * The start template uses col 0-6, row 0=front, row 1=back.
 * For player 2 with rotation 180°, "front" is y=1 (closer to center from top).
 */
export const board7x8: BoardLayout = {
  cols: 7,
  rows: 8,
  walls: [], // no walls in 1v1
  players: [
    {
      playerId: 1,
      rotation: 0,
      // front row (y=6) then back row (y=7), x=0..6 each
      startCells: [
        // front row (row index 0): y=6
        { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 },
        { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 },
        // back row (row index 1): y=7
        { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 },
        { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },
      ],
    },
    {
      playerId: 2,
      rotation: 180,
      // front row (y=1) then back row (y=0), x=0..6
      // With rotation 180°, "col 0" from player 2's perspective maps to x=6 on board
      // But we keep x order consistent with board coords here; the rotation handles direction
      startCells: [
        // front row (row index 0): y=1
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
        { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 },
        // back row (row index 1): y=0
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
        { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
      ],
    },
  ],
};
