import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { factions } from '../data/factions';
import { board7x8 } from '../data/board7x8';
import { board13x13 } from '../data/board13x13';
import { startTemplate } from '../data/startTemplate';
import { setupBoard } from '../game/setupBoard';
import { getLegalMoves } from '../game/legalMoves';
import { applyMove } from '../game/applyMove';
import Board from '../components/Board';
import Board3D from '../components/Board3D';
import styles from './Game.module.css';
import type { BoardState, Move, PlayerId, Faction } from '../game/types';

interface LocationState {
  factionIds: Record<PlayerId, number>;
  players: 2 | 4;
  timePerPlayer?: number; // seconds, 0 = no limit
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
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
  const timePerPlayer = locState?.timePerPlayer ?? 0; // 0 = no limit
  const factionMap = useMemo(() => buildFactionMap(factionIds, players), []);
  const activePlayers: PlayerId[] = players === 4 ? [1, 2, 3, 4] : [1, 2];
  const board = players === 4 ? board13x13 : board7x8;

  // Collect unique GLB URLs from all active factions
  const glbUrls = useMemo(() => {
    const seen = new Set<string>();
    for (const faction of Object.values(factionMap))
      for (const fp of faction.pieces)
        if (fp.glbUrlHD) seen.add(fp.glbUrlHD);
    return [...seen];
  }, [factionMap]);

  // Kick off downloads before the Canvas mounts (idempotent — safe at render time)
  glbUrls.forEach(url => useGLTF.preload(url));

  const [gameState, setGameState] = useState<BoardState>(() =>
    setupBoard(board, factionMap, activePlayers, startTemplate)
  );
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D');

  // Loading gate: skip entirely when no GLBs are in the game
  const [isLoaded, setIsLoaded] = useState(() => glbUrls.length === 0);

  useEffect(() => {
    if (glbUrls.length === 0) return;
    let settled = false;
    const done = () => { if (!settled) { settled = true; setIsLoaded(true); } };

    // THREE.DefaultLoadingManager fires onLoad when all pending loads finish
    const prev = THREE.DefaultLoadingManager.onLoad;
    THREE.DefaultLoadingManager.onLoad = () => { done(); THREE.DefaultLoadingManager.onLoad = prev; };

    // If assets are already cached, onLoad never fires — use a hard timeout fallback
    let hardTimeout: ReturnType<typeof setTimeout>;
    const raf = requestAnimationFrame(() => { hardTimeout = setTimeout(done, 5_000); });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hardTimeout);
      settled = true; // prevent stale setState if component unmounts mid-load
    };
  }, []); // runs once; glbUrls is stable for the lifetime of the game

  // ── Per-player timers ──────────────────────────────────────────────────────
  const [timers, setTimers] = useState<Record<PlayerId, number>>(() => {
    const init = {} as Record<PlayerId, number>;
    for (const pid of (players === 4 ? [1, 2, 3, 4] : [1, 2]) as PlayerId[]) {
      init[pid] = timePerPlayer;
    }
    return init;
  });

  // Ref so the interval always reads the latest currentPlayer without re-creating
  const currentPlayerRef = useRef(gameState.currentPlayer);
  currentPlayerRef.current = gameState.currentPlayer;

  // Countdown: tick once per second, decrement active player's clock.
  // Paused while isLoaded is false so the loading screen doesn't eat turn time.
  useEffect(() => {
    if (timePerPlayer === 0 || gameState.winner || !isLoaded) return;
    const id = setInterval(() => {
      setTimers(prev => {
        const pid = currentPlayerRef.current;
        const next = Math.max(0, (prev[pid] ?? 0) - 1);
        return { ...prev, [pid]: next };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timePerPlayer, gameState.winner, isLoaded]);

  // When a player's clock hits 0, they lose
  const timedOutPlayer = timePerPlayer > 0
    ? (activePlayers as PlayerId[]).find(pid => (timers[pid] ?? 1) === 0)
    : undefined;

  useEffect(() => {
    if (!timedOutPlayer || gameState.winner) return;
    const winner = (activePlayers as PlayerId[]).find(p => p !== timedOutPlayer) ?? null;
    setGameState(prev => ({ ...prev, winner }));
  }, [timedOutPlayer, gameState.winner]);

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
        <button className={styles.viewToggle} onClick={() => setViewMode(v => v === '3D' ? '2D' : '3D')}>
          {viewMode === '3D' ? '2D' : '3D'}
        </button>

        {!gameState.winner ? (
          <div className={styles.turn}>
            <span className={styles.turnDot} style={{ background: currentFaction?.color }} />
            J{gameState.currentPlayer} — {currentFaction?.name.split('—')[1]?.trim() ?? currentFaction?.name}
          </div>
        ) : (
          <div className={styles.winner} style={{ color: winnerFaction?.color }}>
            🏆 J{gameState.winner} — {winnerFaction?.name.split('—')[1]?.trim() ?? winnerFaction?.name}
          </div>
        )}

        {/* Per-player timers */}
        {timePerPlayer > 0 && (
          <div className={styles.timers}>
            {(activePlayers as PlayerId[]).map(pid => {
              const secs = timers[pid] ?? 0;
              const isActive = pid === gameState.currentPlayer && !gameState.winner;
              const isLow    = secs <= 30;
              return (
                <div
                  key={pid}
                  className={[
                    styles.timerBadge,
                    isActive ? styles.timerBadgeActive : '',
                    isLow    ? styles.timerBadgeLow    : '',
                  ].filter(Boolean).join(' ')}
                  style={{ '--player-color': factionMap[pid]?.color ?? '#9fcda8' } as React.CSSProperties}
                >
                  <span className={styles.timerDot} />
                  <span className={styles.timerTime}>{formatTime(secs)}</span>
                  <span className={styles.timerLabel}>J{pid}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Eliminated players indicator (4-player) */}
        {players === 4 && !gameState.winner && (
          <div className={styles.eliminated}>
            {(activePlayers as PlayerId[])
              .filter(pid => !gameState.pieces.some(p => p.owner === pid && p.type === 'king'))
              .map(pid => (
                <span key={pid} className={styles.dead} style={{ color: factionMap[pid]?.color }}>
                  J{pid} ✕
                </span>
              ))}
          </div>
        )}
      </header>

      <div className={`${styles.boardWrap} ${viewMode === '2D' ? styles.boardWrap2D : ''}`}>
        {viewMode === '3D' && !isLoaded ? (
          <div className={styles.loadingScreen}>
            <div
              className={styles.loadingSpinner}
              style={{ borderTopColor: currentFaction?.color ?? '#9fcda8' }}
            />
            <p className={styles.loadingText}>Chargement en cours</p>
          </div>
        ) : viewMode === '3D' ? (
          <Board3D
            gameState={gameState}
            selectedPieceId={selectedPieceId}
            legalMoves={legalMoves}
            onCellClick={handleCellClick}
          />
        ) : (
          <Board
            gameState={gameState}
            selectedPieceId={selectedPieceId}
            legalMoves={legalMoves}
            onCellClick={handleCellClick}
          />
        )}
      </div>

      {gameState.winner && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 style={{ color: winnerFaction?.color }}>
              Joueur {gameState.winner} est victorieux
            </h2>
            <p>{winnerFaction?.name} remporte la guerre.</p>
            <button className={styles.btnPlay} onClick={() => navigate('/menu')}>
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
