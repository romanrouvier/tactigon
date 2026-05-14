import type { StartPieceTemplate } from '../game/setupBoard';

/**
 * Starting layout for each player (cols 0-6, row 0=front, row 1=back).
 * 12 pieces total:
 *   Front row (row 0): 5 pawns at cols 0,2,3,4,6 (gaps at 1 and 5)
 *   Back row (row 1): 7 pieces
 *     col 0 → inter3
 *     col 1 → inter1
 *     col 2 → inter2
 *     col 3 → king
 *     col 4 → inter2
 *     col 5 → inter1
 *     col 6 → inter3
 */
export const startTemplate: StartPieceTemplate[] = [
  // Front row — pawns
  { type: 'pawn', col: 0, row: 0 },
  { type: 'pawn', col: 2, row: 0 },
  { type: 'pawn', col: 3, row: 0 },
  { type: 'pawn', col: 4, row: 0 },
  { type: 'pawn', col: 6, row: 0 },
  // Back row
  { type: 'inter3', col: 0, row: 1 },
  { type: 'inter1', col: 1, row: 1 },
  { type: 'inter2', col: 2, row: 1 },
  { type: 'king',   col: 3, row: 1 },
  { type: 'inter2', col: 4, row: 1 },
  { type: 'inter1', col: 5, row: 1 },
  { type: 'inter3', col: 6, row: 1 },
];
