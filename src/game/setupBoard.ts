import type { BoardLayout, BoardState, Faction, Piece, PlayerId, PieceType } from './types';

export interface StartPieceTemplate {
  type: PieceType;
  /** Column offset within the player's starting zone (0-6 for 7-col board) */
  col: number;
  /** Row offset within the player's starting zone: 0 = front row (closer to center), 1 = back row */
  row: number;
}

let pieceCounter = 0;
function newId(): string {
  return `piece-${++pieceCounter}`;
}

export function setupBoard(
  layout: BoardLayout,
  factions: Record<PlayerId, Faction>,
  activePlayers: PlayerId[],
  startTemplate: StartPieceTemplate[]
): BoardState {
  pieceCounter = 0;
  const pieces: Piece[] = [];

  for (const playerId of activePlayers) {
    const playerSetup = layout.players.find(p => p.playerId === playerId);
    if (!playerSetup) continue;

    // startCells: all starting cells for this player.
    // We need to map col/row in template to actual board coords.
    // The startCells are provided in board coordinate order.
    // We'll use the rotation to determine how to lay them out.
    const startCells = playerSetup.startCells;

    for (const template of startTemplate) {
      // Find the corresponding cell
      // startCells are sorted: for rotation 0 (bottom player),
      // they go left-to-right, back-row first then front-row, or front-row first?
      // We'll use a structured approach: startCells indexed by (col, row)
      const cell = getStartCell(startCells, template.col, template.row, layout.cols);
      if (!cell) continue;

      pieces.push({
        id: newId(),
        owner: playerId,
        type: template.type,
        position: { ...cell },
      });
    }
  }

  return {
    layout,
    pieces,
    currentPlayer: activePlayers[0],
    factions,
    activePlayers,
    winner: null,
  };
}

/**
 * Get a start cell by (col, row) index within the player's start zone.
 * startCells are ordered: row 0 = front row, row 1 = back row.
 * Within a row, ordered by col ascending (from player's perspective).
 * The startCells array passed from layout must be pre-sorted in this order.
 */
function getStartCell(
  startCells: Array<{ x: number; y: number }>,
  col: number,
  row: number,
  _totalCols: number
): { x: number; y: number } | undefined {
  // startCells should be indexed as row * numCols + col
  // But we don't know numCols here. Use the index directly:
  // row 0 = indices 0..6, row 1 = indices 7..13 (for 7-col board)
  const numColsInZone = 7; // hardcoded for 7x8 board; will work for both players
  const idx = row * numColsInZone + col;
  return startCells[idx];
}
