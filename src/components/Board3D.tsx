/**
 * Board3D — Three.js / React Three Fiber rendering of the Dark Grid board.
 *
 * Layout: board cells (x, y) map to 3D position (x, 0, y), centred at origin.
 * Forward direction (dy < 0) is toward -Z (away from camera).
 * Player 1 starts near the camera (high Z); Player 2 is far (low Z).
 */
import { Canvas, useFrame } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { BoardState, Faction, FactionPiecePattern, Move, Piece } from '../game/types';

// ─── Constants ────────────────────────────────────────────────────────────────
const TILE   = 0.90;   // visible tile edge length (leaving a small gap)
const TILE_H = 0.10;   // tile slab height
const WALL_H = 0.22;   // wall slab height
const PIECE_Y = TILE_H; // base Y for pieces

// ─── Palette ──────────────────────────────────────────────────────────────────
const C_TILE_LIGHT = '#1c1510';
const C_TILE_DARK  = '#131009';
const C_WALL       = '#080503';
const C_LEGAL_EM   = '#1a5010';
const C_CAPTURE_EM = '#5a1208';
const C_DOT        = '#55d035';
const C_DOT_EM     = '#30a018';
const C_RING       = '#b02010';
const C_RING_EM    = '#801008';

// Background colour — matches App.css --bg-void design token
const BG_COLOR = '#060810';

// ─── Error boundary (contains 3D render crashes) ─────────────────────────────
interface EBState { hasError: boolean }
class Board3DErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ─── Shared material helper ───────────────────────────────────────────────────
// Attach an existing THREE.Material instance to the mesh it's rendered in.
function MatMesh({
  mat,
  children,
  ...props
}: {
  mat: THREE.MeshStandardMaterial;
  children: ReactNode;
  [k: string]: unknown;
}) {
  return (
    <mesh castShadow {...(props as object)}>
      {children}
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Piece geometry shapes ────────────────────────────────────────────────────

function PawnGeom({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <>
      <MatMesh mat={mat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.20, 0.24, 0.08, 28]} />
      </MatMesh>
      <MatMesh mat={mat} position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.08, 0.10, 0.14, 18]} />
      </MatMesh>
      <MatMesh mat={mat} position={[0, 0.29, 0]}>
        <sphereGeometry args={[0.165, 22, 16]} />
      </MatMesh>
    </>
  );
}

function Inter1Geom({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <>
      <MatMesh mat={mat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.08, 28]} />
      </MatMesh>
      <MatMesh mat={mat} position={[0, 0.34, 0]}>
        <coneGeometry args={[0.22, 0.52, 8]} />
      </MatMesh>
    </>
  );
}

function Inter2Geom({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <>
      <MatMesh mat={mat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.08, 28]} />
      </MatMesh>
      <MatMesh mat={mat} position={[0, 0.30, 0]}>
        <boxGeometry args={[0.33, 0.40, 0.33]} />
      </MatMesh>
    </>
  );
}

function Inter3Geom({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <>
      <MatMesh mat={mat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.08, 28]} />
      </MatMesh>
      <MatMesh mat={mat} position={[0, 0.34, 0]}>
        <octahedronGeometry args={[0.26]} />
      </MatMesh>
    </>
  );
}

/**
 * King — elaborate throne piece: pedestal → pillar → shoulder ring →
 * 4 crown spires → central orb. Tallest piece on the board.
 */
function KingGeom({ mat, matGlow }: {
  mat: THREE.MeshStandardMaterial;
  matGlow: THREE.MeshStandardMaterial;
}) {
  return (
    <>
      {/* Pedestal */}
      <MatMesh mat={mat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.30, 0.34, 0.08, 32]} />
      </MatMesh>
      {/* Pillar */}
      <MatMesh mat={mat} position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.16, 0.20, 0.28, 24]} />
      </MatMesh>
      {/* Shoulder ring (wide torus) */}
      <MatMesh mat={mat} position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.04, 10, 40]} />
      </MatMesh>
      {/* 4 crown spires at cardinal points */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i * Math.PI) / 2;
        const sx = Math.sin(angle) * 0.22;
        const sz = Math.cos(angle) * 0.22;
        return (
          <MatMesh key={i} mat={mat} position={[sx, 0.57, sz]}>
            <coneGeometry args={[0.055, 0.20, 6]} />
          </MatMesh>
        );
      })}
      {/* 4 small inter-spire orbs */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        const sx = Math.sin(angle) * 0.17;
        const sz = Math.cos(angle) * 0.17;
        return (
          <MatMesh key={`o${i}`} mat={mat} position={[sx, 0.49, sz]}>
            <sphereGeometry args={[0.04, 10, 8]} />
          </MatMesh>
        );
      })}
      {/* Central crown orb — glowing material */}
      <MatMesh mat={matGlow} position={[0, 0.54, 0]}>
        <sphereGeometry args={[0.085, 20, 16]} />
      </MatMesh>
    </>
  );
}

function PieceShapes({ type, mat, matGlow }: {
  type: string;
  mat: THREE.MeshStandardMaterial;
  matGlow: THREE.MeshStandardMaterial;
}) {
  switch (type) {
    case 'pawn':   return <PawnGeom mat={mat} />;
    case 'inter1': return <Inter1Geom mat={mat} />;
    case 'inter2': return <Inter2Geom mat={mat} />;
    case 'inter3': return <Inter3Geom mat={mat} />;
    default:       return <KingGeom mat={mat} matGlow={matGlow} />;
  }
}

// ─── Animated piece ───────────────────────────────────────────────────────────
function Piece3D({
  piece,
  faction,
  isSelected,
  isCurrentPlayer,
}: {
  piece: Piece;
  faction: Faction;
  factionPiece: FactionPiecePattern | undefined;
  isSelected: boolean;
  isCurrentPlayer: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color:             new THREE.Color(faction.color),
        emissive:          new THREE.Color(faction.color),
        emissiveIntensity: 0,
        roughness: 0.28,
        metalness: 0.72,
      }),
    [faction.color]
  );

  // Brighter variant for the king's central orb
  const matGlow = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color:             new THREE.Color(faction.color),
        emissive:          new THREE.Color(faction.color),
        emissiveIntensity: 1.2,
        roughness: 0.10,
        metalness: 0.90,
      }),
    [faction.color]
  );

  // Dispose GPU resources when piece is removed or faction color changes
  useEffect(() => {
    return () => {
      mat.dispose();
      matGlow.dispose();
    };
  }, [mat, matGlow]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t     = clock.getElapsedTime();
    const phase = piece.position.x * 0.8 + piece.position.y * 1.3;
    const amp   = isSelected ? 0.09 : 0.022;
    const speed = isSelected ? 2.3  : 1.1;
    groupRef.current.position.y = PIECE_Y + Math.sin(t * speed + phase) * amp;
    if (isSelected) groupRef.current.rotation.y += 0.016;

    mat.emissiveIntensity = isSelected
      ? 0.40 + Math.sin(t * 3.8) * 0.14
      : isCurrentPlayer ? 0.07 : 0;
    matGlow.emissiveIntensity = isSelected
      ? 2.5 + Math.sin(t * 4) * 0.5
      : 1.2;
  });

  return (
    <group ref={groupRef} position={[0, PIECE_Y, 0]}>
      <PieceShapes type={piece.type} mat={mat} matGlow={matGlow} />
    </group>
  );
}

// ─── Board tile ───────────────────────────────────────────────────────────────
function Tile({
  x, y,
  isWall, isLegal, isCapture,
  onClick,
  children,
}: {
  x: number;
  y: number;
  isWall: boolean;
  isLegal: boolean;
  isCapture: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  const isLight    = (x + y) % 2 === 0;
  const slabH      = isWall ? WALL_H : TILE_H;
  const baseColor  = isWall ? C_WALL : isLight ? C_TILE_LIGHT : C_TILE_DARK;
  const emissive   = isCapture ? C_CAPTURE_EM : isLegal ? C_LEGAL_EM : '#000000';
  const emIntensity = (isCapture || isLegal) ? 1.0 : 0;

  // onClick on the group: R3F bubbles pointer events from any child mesh up
  // through ancestor groups, so clicking a piece, a tile, or an indicator all
  // correctly reach this handler.
  return (
    <group
      position={[x, 0, y]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Slab */}
      <mesh position={[0, slabH / 2, 0]} receiveShadow>
        <boxGeometry args={[TILE, slabH, TILE]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissive}
          emissiveIntensity={emIntensity}
          roughness={isWall ? 0.95 : 0.72}
          metalness={0.06}
        />
      </mesh>

      {/* Legal move — floating green dot */}
      {isLegal && !isCapture && (
        <mesh position={[0, TILE_H + 0.13, 0]}>
          <sphereGeometry args={[0.07, 14, 10]} />
          <meshStandardMaterial color={C_DOT} emissive={C_DOT_EM} emissiveIntensity={2.0} />
        </mesh>
      )}

      {/* Capture target — red ring */}
      {isCapture && (
        <mesh position={[0, TILE_H + 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.45, 36]} />
          <meshStandardMaterial
            color={C_RING}
            emissive={C_RING_EM}
            emissiveIntensity={2.2}
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {children}
    </group>
  );
}

// ─── Board scene ──────────────────────────────────────────────────────────────
function BoardScene({
  gameState,
  selectedPieceId,
  legalMoves,
  onCellClick,
}: {
  gameState: BoardState;
  selectedPieceId: string | null;
  legalMoves: Move[];
  onCellClick: (x: number, y: number) => void;
}) {
  const { layout, pieces, factions } = gameState;
  const { cols, rows, walls } = layout;

  const wallSet    = useMemo(() => new Set(walls.map(w => `${w.x},${w.y}`)), [walls]);
  const legalSet   = useMemo(() => new Set(legalMoves.map(m => `${m.to.x},${m.to.y}`)), [legalMoves]);
  const captureSet = useMemo(
    () => new Set(legalMoves.filter(m => m.captures).map(m => `${m.to.x},${m.to.y}`)),
    [legalMoves]
  );

  // Centre board at world origin
  const ox = -(cols - 1) / 2;
  const oz = -(rows - 1) / 2;

  // Faction accent point lights — one per active player, capped at 2
  const playerLights = useMemo(() => {
    return gameState.activePlayers.slice(0, 2).map(pid => {
      const faction = factions[pid];
      const setup   = layout.players.find(p => p.playerId === pid);
      if (!setup || !faction) return null;
      const startCoords = setup.startCells;
      const avgX = startCoords.reduce((s, c) => s + c.x, 0) / startCoords.length;
      const avgY = startCoords.reduce((s, c) => s + c.y, 0) / startCoords.length;
      return { pid, color: faction.color, x: avgX + ox, z: avgY + oz };
    }).filter(Boolean);
  }, [gameState.activePlayers, factions, layout.players, ox, oz]);

  return (
    <>
      {/* ── Lighting (≤4 lights total) ── */}
      {/* 1 — Ambient fill */}
      <ambientLight color="#1a0d09" intensity={2.4} />
      {/* 2 — Primary shadow-casting key light */}
      <directionalLight
        position={[6, 14, 10]}
        color="#fde8c0"
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={60}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-bias={-0.0005}
      />
      {/* 3 & 4 — Per-player faction colour accent lights (max 2) */}
      {playerLights.map(l =>
        l ? (
          <pointLight
            key={l.pid}
            position={[l.x, 1.8, l.z]}
            color={l.color}
            intensity={1.5}
            distance={5}
            decay={2}
          />
        ) : null
      )}

      {/* ── Board group ── */}
      <group position={[ox, 0, oz]}>
        {/* Stone plinth beneath tiles */}
        <mesh position={[(cols - 1) / 2, -0.06, (rows - 1) / 2]} receiveShadow>
          <boxGeometry args={[cols + 0.6, 0.12, rows + 0.6]} />
          <meshStandardMaterial color="#080604" roughness={0.92} metalness={0.05} />
        </mesh>

        {Array.from({ length: rows }, (_, y) =>
          Array.from({ length: cols }, (_, x) => {
            const key      = `${x},${y}`;
            const isWall   = wallSet.has(key);
            const isLegal  = legalSet.has(key);
            const isCapture = captureSet.has(key);
            const here     = pieces.filter(p => p.position.x === x && p.position.y === y);

            return (
              <Tile
                key={key}
                x={x} y={y}
                isWall={isWall}
                isLegal={isLegal}
                isCapture={isCapture}
                onClick={() => onCellClick(x, y)}
              >
                {here.map(piece => {
                  const faction      = factions[piece.owner];
                  const factionPiece = faction.pieces.find(fp => fp.type === piece.type);
                  return (
                    <Piece3D
                      key={piece.id}
                      piece={piece}
                      faction={faction}
                      factionPiece={factionPiece}
                      isSelected={piece.id === selectedPieceId}
                      isCurrentPlayer={piece.owner === gameState.currentPlayer}
                    />
                  );
                })}
              </Tile>
            );
          })
        )}
      </group>
    </>
  );
}

// ─── Public component (Canvas wrapper) ───────────────────────────────────────
export interface Board3DProps {
  gameState: BoardState;
  selectedPieceId: string | null;
  legalMoves: Move[];
  onCellClick: (x: number, y: number) => void;
}

export default function Board3D({ gameState, selectedPieceId, legalMoves, onCellClick }: Board3DProps) {
  const { cols, rows } = gameState.layout;
  const maxDim = Math.max(cols, rows);

  const camY = maxDim * 1.15;
  const camZ = maxDim * 1.25;

  return (
    <Board3DErrorBoundary
      fallback={
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#c9a84c', fontFamily: 'serif', fontSize: '0.9rem', opacity: 0.6,
        }}>
          Rendu 3D indisponible — passez en mode 2D
        </div>
      }
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, camY, camZ], fov: 46, near: 0.1, far: 120 }}
        style={{ width: '100%', height: '100%', display: 'block', background: BG_COLOR }}
      >
        <fog attach="fog" args={[BG_COLOR, 25, 65]} />

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={maxDim * 0.5}
          maxDistance={maxDim * 2.8}
        />

        <BoardScene
          gameState={gameState}
          selectedPieceId={selectedPieceId}
          legalMoves={legalMoves}
          onCellClick={onCellClick}
        />
      </Canvas>
    </Board3DErrorBoundary>
  );
}
