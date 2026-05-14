import type { BoardState, Piece, Move, Coord } from './types';
import { applyRotation } from './orientation';

function coordKey(c: Coord): string {
  return `${c.x},${c.y}`;
}

function isInBounds(c: Coord, cols: number, rows: number): boolean {
  return c.x >= 0 && c.x < cols && c.y >= 0 && c.y < rows;
}


function pieceAt(pieces: Piece[], c: Coord): Piece | undefined {
  return pieces.find(p => p.position.x === c.x && p.position.y === c.y);
}

export function getLegalMoves(state: BoardState, piece: Piece): Move[] {
  const { layout, pieces, factions } = state;
  const faction = factions[piece.owner];
  const factionPiece = faction.pieces.find(fp => fp.type === piece.type);
  if (!factionPiece) return [];

  const playerSetup = layout.players.find(p => p.playerId === piece.owner);
  if (!playerSetup) return [];

  const rotation = playerSetup.rotation;
  const { cols, rows, walls } = layout;
  const wallSet = new Set(walls.map(coordKey));

  const moves: Move[] = [];

  for (const target of factionPiece.pattern.targets) {
    const boardOffset = applyRotation(target.dx, target.dy, rotation);
    const to: Coord = {
      x: piece.position.x + boardOffset.x,
      y: piece.position.y + boardOffset.y,
    };

    // Out of bounds → skip
    if (!isInBounds(to, cols, rows)) continue;

    // Target is a wall → skip
    if (wallSet.has(coordKey(to))) continue;

    // Check intermediates
    let blocked = false;
    if (target.intermediates) {
      for (const inter of target.intermediates) {
        const boardInter = applyRotation(inter.dx, inter.dy, rotation);
        const interCoord: Coord = {
          x: piece.position.x + boardInter.x,
          y: piece.position.y + boardInter.y,
        };

        // A wall always blocks (even flyover doesn't pass walls)
        if (wallSet.has(coordKey(interCoord))) {
          blocked = true;
          break;
        }

        if (inter.kind === 'blocking') {
          const occupant = pieceAt(pieces, interCoord);
          if (occupant) {
            blocked = true;
            break;
          }
        }
        // flyover: skip occupied check
      }
    }
    if (blocked) continue;

    const occupant = pieceAt(pieces, to);
    const canMove = target.canMove !== false;
    const canCapture = target.canCapture !== false;

    if (occupant) {
      if (occupant.owner === piece.owner) continue; // can't capture own piece
      if (!canCapture) continue; // can't capture here
      moves.push({
        pieceId: piece.id,
        from: { ...piece.position },
        to,
        captures: occupant.id,
      });
    } else {
      if (!canMove) continue;
      moves.push({
        pieceId: piece.id,
        from: { ...piece.position },
        to,
      });
    }
  }

  return moves;
}

export function getAllLegalMoves(state: BoardState, playerId: number): Move[] {
  const playerPieces = state.pieces.filter(p => p.owner === playerId);
  return playerPieces.flatMap(p => getLegalMoves(state, p));
}
