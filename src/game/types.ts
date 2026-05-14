// ─── Coordinate ──────────────────────────────────────────────────────────────
export interface Coord {
  x: number;
  y: number;
}

// ─── Board ───────────────────────────────────────────────────────────────────
export type CellType = 'normal' | 'wall';

export interface PlayerSetup {
  playerId: PlayerId;
  /** Rotation in degrees: 0, 90, 180, 270. 0 = "forward is -y". */
  rotation: 0 | 90 | 180 | 270;
  /** Cells where this player's pieces start */
  startCells: Coord[];
}

export interface BoardLayout {
  cols: number;
  rows: number;
  /** Cells that are walls (impassable). If omitted, no walls. */
  walls: Coord[];
  players: PlayerSetup[];
}

// ─── Players ─────────────────────────────────────────────────────────────────
export type PlayerId = 1 | 2 | 3 | 4;

// ─── Pieces ──────────────────────────────────────────────────────────────────
export type PieceType = 'pawn' | 'inter1' | 'inter2' | 'inter3' | 'king';

export interface Piece {
  id: string;
  owner: PlayerId;
  type: PieceType;
  position: Coord;
}

// ─── Movement Patterns ───────────────────────────────────────────────────────
export interface MoveTarget {
  /** Offset relative to piece, in player-local frame. -dy = forward. */
  dx: number;
  dy: number;
  /**
   * For sliding/multi-step moves: list of intermediate cells (in order)
   * between the piece and this target. Each intermediate is either
   * 'blocking' (occupied = move blocked) or 'flyover' (can jump over).
   */
  intermediates?: Array<{ dx: number; dy: number; kind: 'blocking' | 'flyover' }>;
  /** Can move here if empty? default true */
  canMove?: boolean;
  /** Can capture here? default true */
  canCapture?: boolean;
}

export interface MovementPattern {
  targets: MoveTarget[];
}

// ─── Faction ─────────────────────────────────────────────────────────────────
export interface FactionPiecePattern {
  type: PieceType;
  pattern: MovementPattern;
  /** Optional image to render instead of the default SVG shape (2D board) */
  imageUrl?: string;
  /** Optional FBX model to render in the 3D board */
  fbxUrl?: string;
}

export interface Faction {
  id: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  color: string; // CSS color
  /** Optional faction banner image shown on the faction selection screen */
  imageUrl?: string;
  pieces: FactionPiecePattern[];
}

// ─── Board State ─────────────────────────────────────────────────────────────
export interface BoardState {
  layout: BoardLayout;
  pieces: Piece[];
  /** Which player's turn */
  currentPlayer: PlayerId;
  /** Factions chosen per player */
  factions: Record<PlayerId, Faction>;
  /** Active players in this game (2 for 1v1, 4 for 1v1v1v1) */
  activePlayers: PlayerId[];
  /** Winner if game is over */
  winner: PlayerId | null;
}

// ─── Move ─────────────────────────────────────────────────────────────────────
export interface Move {
  pieceId: string;
  from: Coord;
  to: Coord;
  captures?: string; // piece id captured
}
