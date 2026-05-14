import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo } from 'react';
import { factions } from '../data/factions';
import { board7x8 } from '../data/board7x8';
import { board13x13 } from '../data/board13x13';
import { startTemplate } from '../data/startTemplate';
import { setupBoard } from '../game/setupBoard';
import { getLegalMoves } from '../game/legalMoves';
import { applyMove } from '../game/applyMove';
import Board3D from '../components/Board3D';
import styles from './Game.module.css';
import type { BoardState, Move, PlayerId, Faction } from '../game/types';

interface LocationState {
  factionIds: Record<PlayerId, number>;
  players: 2 | 4;
}

function buildFactionMap(
  factionIds: Record<PlayerId, number>,
  players: 2 | 4
): Record<PlayerId, Faction> {
  const pids: PlayerId[] = players === 4 ? [1, 2, 3, 4] : [1, 2];
  return Object.fromEntries(
    pids.map(pid => [pid, factions.find(f => f.id === factionIds[pid])!])
  ) as Record<PlayerId, Faction>;
}

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const locState = location.state as LocationState | null;

  const players = locState?.players ?? 2;
  const factionIds: Record<PlayerId, number> = locState?.factionIds ?? { 1: 1, 2: 2, 3: 3, 4: 4 };
  const factionMap = useMemo(() => buildFactionMap(factionIds, players), []);
  const activePlayers: PlayerId[] = players === 4 ? [1, 2, 3, 4] : [1, 2];
  const board = players === 4 ? board13x13 : board7x8;

  const [gameState, setGameState] = useState<BoardState>(() =>
    setupBoard(board, factionMap, activePlayers, startTemplate)
  );
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  const selectedPiece = gameState.pieces.find(p => p.id === selectedPieceId) ?? null;

  const legalMoves: Move[] = useMemo(() => {
    if (!selectedPiece) return [];
    return getLegalMoves(gameState, selectedPiece);
  }, [gameState, selectedPiece]);

  const handleCellClick = useCallback((x: number, y: number) => {
    if (gameState.winner) return;

    if (selectedPiece) {
      const move = legalMoves.find(m => m.to.x === x && m.to.y === y);
      if (move) {
        setGameState(applyMove(gameState, move));
        setSelectedPieceId(null);
        return;
      }
    }

    const clickedPiece = gameState.pieces.find(
      p => p.position.x === x && p.position.y === y && p.owner === gameState.currentPlayer
    );
    if (clickedPiece) {
      setSelectedPieceId(prev => prev === clickedPiece.id ? null : clickedPiece.id);
    } else {
      setSelectedPieceId(null);
    }
  }, [gameState, selectedPiece, legalMoves]);

  const currentFaction = factionMap[gameState.currentPlayer];
  const winnerFaction = gameState.winner ? factionMap[gameState.winner] : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.quit} onClick={() => navigate('/menu')}>✕ Quitter</button>

        {!gameState.winner ? (
          <div className={styles.turn}>
            <span className={styles.turnDot} style={{ background: currentFaction?.color }} />
            Joueur {gameState.currentPlayer} — {currentFaction?.name}
            {players === 4 && (
              <span className={styles.playerCount}>
                {activePlayers.map(pid => (
                  <span
                    key={pid}
                    className={`${styles.pip} ${pid === gameState.currentPlayer ? styles.pipActive : ''}`}
                    style={{ background: factionMap[pid]?.color ?? '#444' }}
                    title={`J${pid} — ${factionMap[pid]?.name}`}
                  />
                ))}
              </span>
            )}
          </div>
        ) : (
          <div className={styles.winner} style={{ color: winnerFaction?.color }}>
            🏆 Joueur {gameState.winner} gagne — {winnerFaction?.name}
          </div>
        )}

        {/* Eliminated players indicator (4-player) */}
        {players === 4 && !gameState.winner && (
          <div className={styles.eliminated}>
            {activePlayers
              .filter(pid => !gameState.pieces.some(p => p.owner === pid && p.type === 'king'))
              .map(pid => (
                <span key={pid} className={styles.dead} style={{ color: factionMap[pid]?.color }}>
                  J{pid} ✕
                </span>
              ))}
          </div>
        )}
      </header>

      <div className={styles.boardWrap}>
        <Board3D
          gameState={gameState}
          selectedPieceId={selectedPieceId}
          legalMoves={legalMoves}
          onCellClick={handleCellClick}
        />
      </div>

      {gameState.winner && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 style={{ color: winnerFaction?.color }}>
              Joueur {gameState.winner} est victorieux
            </h2>
            <p>{winnerFaction?.name} remporte la guerre.</p>
            <button className={styles.btnPlay} onClick={() => navigate(`/clan?players=${players}`)}>
              Rejouer
            </button>
            <button className={styles.btnMenu} onClick={() => navigate('/menu')}>
              Menu principal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
