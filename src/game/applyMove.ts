import type { BoardState, Move, PlayerId } from './types';

export function applyMove(state: BoardState, move: Move): BoardState {
  let pieces = state.pieces.map(p => ({ ...p, position: { ...p.position } }));

  // Remove captured piece
  if (move.captures) {
    pieces = pieces.filter(p => p.id !== move.captures);
  }

  // Move the piece
  const piece = pieces.find(p => p.id === move.pieceId);
  if (!piece) return state;
  piece.position = { ...move.to };

  const { activePlayers, currentPlayer } = state;

  // A player is eliminated only if they HAD a king before and no longer do
  const justEliminated = activePlayers.filter(pid =>
    state.pieces.some(p => p.owner === pid && p.type === 'king') &&
    !pieces.some(p => p.owner === pid && p.type === 'king')
  );

  const surviving = activePlayers.filter(
    pid => !justEliminated.includes(pid)
  ) as PlayerId[];

  // Remove all pieces of eliminated players from the board
  if (justEliminated.length > 0) {
    pieces = pieces.filter(p => !justEliminated.includes(p.owner as PlayerId));
  }

  // Win condition: only one player with a king remains
  const playersWithKing = surviving.filter(pid =>
    pieces.some(p => p.owner === pid && p.type === 'king')
  );
  const winner: PlayerId | null = playersWithKing.length === 1 && surviving.length === 1
    ? surviving[0]
    : null;

  // Advance turn — skip eliminated players
  const idx = surviving.indexOf(currentPlayer);
  const nextPlayer = winner
    ? currentPlayer
    : surviving[(idx + 1) % surviving.length];

  return {
    ...state,
    pieces,
    activePlayers: surviving,
    currentPlayer: nextPlayer,
    winner,
  };
}
