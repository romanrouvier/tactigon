import { describe, it, expect } from 'vitest';
import type { BoardState, Piece, PlayerId } from '../types';
import { getLegalMoves } from '../legalMoves';
import { factions } from '../../data/factions';
import { board7x8 } from '../../data/board7x8';

function makePiece(id: string, owner: PlayerId, type: Piece['type'], x: number, y: number): Piece {
  return { id, owner, type, position: { x, y } };
}

const faction1 = factions[0]; // Équipe 1
const faction2 = factions[1]; // Équipe 2

function makeState(pieces: Piece[], overrides?: Partial<BoardState>): BoardState {
  return {
    layout: board7x8,
    pieces,
    currentPlayer: 1,
    factions: { 1: faction1, 2: faction2, 3: factions[2], 4: factions[3] },
    activePlayers: [1, 2],
    winner: null,
    ...overrides,
  };
}

describe('Pawn (Équipe 1)', () => {
  it('can move diagonally forward (player 1, rotation 0°)', () => {
    const pawn = makePiece('p1', 1, 'pawn', 3, 5);
    const state = makeState([pawn]);
    const moves = getLegalMoves(state, pawn);
    expect(moves.map(m => m.to)).toContainEqual({ x: 2, y: 4 });
    expect(moves.map(m => m.to)).toContainEqual({ x: 4, y: 4 });
    expect(moves).toHaveLength(2);
  });

  it('pawn of player 2 (rotation 180°) moves diagonally forward = downward', () => {
    const pawn = makePiece('p2', 2, 'pawn', 3, 2);
    const state = makeState([pawn]);
    const moves = getLegalMoves(state, pawn);
    // Player 2 rotation 180°: forward = +y. dx=-1,dy=-1 → dx=1,dy=1
    expect(moves.map(m => m.to)).toContainEqual({ x: 2, y: 3 });
    expect(moves.map(m => m.to)).toContainEqual({ x: 4, y: 3 });
  });

  it('pawn cannot move off board', () => {
    const pawn = makePiece('p1', 1, 'pawn', 0, 0);
    const state = makeState([pawn]);
    const moves = getLegalMoves(state, pawn);
    // At (0,0), player1 forward diagonals: (-1,-1)=(-1,-1) out of bounds, (1,-1)=(1,-1) out of bounds
    expect(moves).toHaveLength(0);
  });

  it('pawn cannot capture own piece', () => {
    const pawn = makePiece('p1', 1, 'pawn', 3, 5);
    const ally = makePiece('a1', 1, 'inter1', 2, 4);
    const state = makeState([pawn, ally]);
    const moves = getLegalMoves(state, pawn);
    // (2,4) blocked by ally, only (4,4) reachable
    expect(moves.map(m => m.to)).not.toContainEqual({ x: 2, y: 4 });
    expect(moves.map(m => m.to)).toContainEqual({ x: 4, y: 4 });
  });

  it('pawn can capture enemy piece', () => {
    const pawn = makePiece('p1', 1, 'pawn', 3, 5);
    const enemy = makePiece('e1', 2, 'pawn', 2, 4);
    const state = makeState([pawn, enemy]);
    const moves = getLegalMoves(state, pawn);
    const captureMove = moves.find(m => m.to.x === 2 && m.to.y === 4);
    expect(captureMove).toBeDefined();
    expect(captureMove?.captures).toBe('e1');
  });
});

describe('Inter2 (Équipe 1) — flyover (star pattern)', () => {
  it('can jump over an occupied cell to reach a target', () => {
    const inter2 = makePiece('i2', 1, 'inter2', 3, 4);
    // Place an ally at (3,3) — the flyover cell for target (2,2) or (4,2) via (0,-1)
    const ally = makePiece('a1', 1, 'pawn', 3, 3); // (dx=0,dy=-1) from (3,4)
    const state = makeState([inter2, ally]);
    const moves = getLegalMoves(state, inter2);
    // Targets (2,2) and (4,2) need flyover (0,-1) = (3,3) occupied by ally
    // Since kind=flyover, should still be reachable
    expect(moves.map(m => m.to)).toContainEqual({ x: 2, y: 2 });
    expect(moves.map(m => m.to)).toContainEqual({ x: 4, y: 2 });
  });
});

describe('Inter3 (Équipe 1) — orthogonal cross, blocking', () => {
  it('cannot reach distance-2 cell if distance-1 is occupied', () => {
    const inter3 = makePiece('i3', 1, 'inter3', 3, 4);
    const blocker = makePiece('b1', 2, 'pawn', 3, 3); // enemy at (0,-1)
    const state = makeState([inter3, blocker]);
    const moves = getLegalMoves(state, inter3);
    // Can capture at (3,3) but NOT reach (3,2) since (3,3) is blocking
    const hasTarget3_3 = moves.some(m => m.to.x === 3 && m.to.y === 3);
    const hasTarget3_2 = moves.some(m => m.to.x === 3 && m.to.y === 2);
    expect(hasTarget3_3).toBe(true); // capture the blocker
    expect(hasTarget3_2).toBe(false); // blocked
  });

  it('can reach distance-2 if distance-1 is free', () => {
    const inter3 = makePiece('i3', 1, 'inter3', 3, 4);
    const state = makeState([inter3]);
    const moves = getLegalMoves(state, inter3);
    expect(moves.map(m => m.to)).toContainEqual({ x: 3, y: 2 });
  });
});

describe('Wall blocking', () => {
  it('cannot move onto a wall', () => {
    const layoutWithWall = {
      ...board7x8,
      walls: [{ x: 2, y: 4 }],
    };
    const pawn = makePiece('p1', 1, 'pawn', 3, 5);
    const state: BoardState = {
      layout: layoutWithWall,
      pieces: [pawn],
      currentPlayer: 1,
      factions: { 1: faction1, 2: faction2, 3: factions[2], 4: factions[3] },
      activePlayers: [1, 2],
      winner: null,
    };
    const moves = getLegalMoves(state, pawn);
    expect(moves.map(m => m.to)).not.toContainEqual({ x: 2, y: 4 });
  });

  it('wall blocks flyover', () => {
    const layoutWithWall = {
      ...board7x8,
      walls: [{ x: 3, y: 3 }], // intermediate cell is a wall
    };
    const inter2 = makePiece('i2', 1, 'inter2', 3, 4);
    const state: BoardState = {
      layout: layoutWithWall,
      pieces: [inter2],
      currentPlayer: 1,
      factions: { 1: faction1, 2: faction2, 3: factions[2], 4: factions[3] },
      activePlayers: [1, 2],
      winner: null,
    };
    const moves = getLegalMoves(state, inter2);
    // (2,2) and (4,2) need intermediate (3,3) which is a wall → blocked
    expect(moves.map(m => m.to)).not.toContainEqual({ x: 2, y: 2 });
    expect(moves.map(m => m.to)).not.toContainEqual({ x: 4, y: 2 });
  });
});

describe('King capture = game over detection', () => {
  it('can capture enemy king', () => {
    const king1 = makePiece('k1', 1, 'king', 3, 5);
    const enemyKing = makePiece('k2', 2, 'king', 3, 4);
    const state = makeState([king1, enemyKing]);
    const moves = getLegalMoves(state, king1);
    const capture = moves.find(m => m.captures === 'k2');
    expect(capture).toBeDefined();
    expect(capture?.to).toEqual({ x: 3, y: 4 });
  });
});
