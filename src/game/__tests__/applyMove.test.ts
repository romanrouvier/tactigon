import { describe, it, expect } from 'vitest';
import { applyMove } from '../applyMove';
import { factions } from '../../data/factions';
import { board7x8 } from '../../data/board7x8';
import type { BoardState, Piece } from '../types';

function makeState(pieces: Piece[]): BoardState {
  return {
    layout: board7x8,
    pieces,
    currentPlayer: 1,
    factions: { 1: factions[0], 2: factions[1], 3: factions[2], 4: factions[3] },
    activePlayers: [1, 2],
    winner: null,
  };
}

describe('applyMove', () => {
  it('moves a piece to target cell', () => {
    const piece: Piece = { id: 'p1', owner: 1, type: 'pawn', position: { x: 3, y: 5 } };
    const state = makeState([piece]);
    const next = applyMove(state, { pieceId: 'p1', from: { x: 3, y: 5 }, to: { x: 4, y: 4 } });
    const moved = next.pieces.find(p => p.id === 'p1');
    expect(moved?.position).toEqual({ x: 4, y: 4 });
  });

  it('removes captured piece', () => {
    const attacker: Piece = { id: 'a1', owner: 1, type: 'pawn', position: { x: 3, y: 5 } };
    const target: Piece = { id: 't1', owner: 2, type: 'pawn', position: { x: 4, y: 4 } };
    const state = makeState([attacker, target]);
    const next = applyMove(state, { pieceId: 'a1', from: { x: 3, y: 5 }, to: { x: 4, y: 4 }, captures: 't1' });
    expect(next.pieces.find(p => p.id === 't1')).toBeUndefined();
  });

  it('advances turn from player 1 to player 2', () => {
    const piece: Piece = { id: 'p1', owner: 1, type: 'pawn', position: { x: 3, y: 5 } };
    const state = makeState([piece]);
    const next = applyMove(state, { pieceId: 'p1', from: { x: 3, y: 5 }, to: { x: 4, y: 4 } });
    expect(next.currentPlayer).toBe(2);
  });

  it('declares winner when king is captured', () => {
    const attacker: Piece = { id: 'a1', owner: 1, type: 'king', position: { x: 3, y: 5 } };
    const enemyKing: Piece = { id: 'k2', owner: 2, type: 'king', position: { x: 4, y: 4 } };
    const state = makeState([attacker, enemyKing]);
    const next = applyMove(state, { pieceId: 'a1', from: { x: 3, y: 5 }, to: { x: 4, y: 4 }, captures: 'k2' });
    expect(next.winner).toBe(1);
  });
});
