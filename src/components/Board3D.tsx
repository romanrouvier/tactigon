/**
 * Board3D — Three.js / React Three Fiber rendering of the Dark Grid board.
 *
 * Layout: board cells (x, y) map to 3D position (x, 0, y), centred at origin.
 * Forward direction (dy < 0) is toward -Z (away from camera).
 * Player 1 starts near the camera (high Z); Player 2 is far (low Z).
 */
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFBX, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import type { BoardState, Faction, FactionPiecePattern, Move, Piece } from '../game/types';

// ─── Constants ────────────────────────────────────────────────────────────────
const TILE      = 0.90;   // visible tile edge length (leaving a small gap between tiles)
const TILE_H    = 0.10;   // tile slab height
const WALL_H    = 0.22;   // wall slab height
const PIECE_Y   = TILE_H; // base Y offset for pieces sitting on tiles

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

// ─── FBX Character ────────────────────────────────────────────────────────────
// Rendered for pieces that have `fbxUrl` set.
// Uses Suspense — caller must wrap in <Suspense fallback={...}>.
function FBXCharacter({
  fbxUrl,
  color,
  isSelected,
  offsetX,
  offsetZ,
}: {
  fbxUrl: string;
  color: string;
  isSelected: boolean;
  offsetX: number;
  offsetZ: number;
}) {
  const fbx      = useFBX(fbxUrl);
  const groupRef = useRef<THREE.Group>(null!);
  const { actions, names } = useAnimations(fbx.animations, groupRef);

  // Auto-scale so the character fits within ~0.78 vertical units
  const [scale, yLift] = useMemo(() => {
    const box  = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const min  = box.min;
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 0.78 / maxDim : 0.004;
    return [s, -min.y * s]; // lift so base sits exactly at Y=0
  }, [fbx]);

  // Enable shadows on every mesh in the hierarchy
  useEffect(() => {
    fbx.traverse(child => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) mesh.castShadow = true;
    });
  }, [fbx]);

  // Play first animation clip (idle)
  useEffect(() => {
    const first = names[0];
    if (first) actions[first]?.play();
  }, [actions, names]);

  // Float + selection spin
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t  = clock.getElapsedTime();
    const dy = (isSelected ? 0.16 : 0.04) + Math.sin(t * 1.6 + offsetX + offsetZ) * 0.025;
    groupRef.current.position.y = PIECE_Y + yLift + dy;
    if (isSelected) groupRef.current.rotation.y = t * 0.55;
  });

  return (
    <group ref={groupRef} position={[0, PIECE_Y + yLift, 0]}>
      <primitive object={fbx} scale={scale} />

      {/* Faction-colour ring on the ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -yLift + 0.005, 0]}
      >
        <ringGeometry args={[0.30, 0.44, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 3.0 : 1.2}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Piece geometry shapes ────────────────────────────────────────────────────
// Each geometry function accepts a THREE.MeshStandardMaterial so all sub-meshes
// share the same animated instance (emissive glow, colour).

function MatMesh({
  mat,
  children,
  ...props
}: {
  mat: THREE.MeshStandardMaterial;
  children: React.ReactNode;
  [k: string]: unknown;
}) {
  return (
    <mesh castShadow {...(props as object)}>
      {children}
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

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

function KingGeom({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <>
      <MatMesh mat={mat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.08, 32]} />
      </MatMesh>
      <MatMesh mat={mat} position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.28, 28]} />
      </MatMesh>
      <MatMesh mat={mat} position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.055, 10, 36]} />
      </MatMesh>
      <MatMesh mat={mat} position={[0, 0.53, 0]}>
        <sphereGeometry args={[0.10, 18, 14]} />
      </MatMesh>
    </>
  );
}

function PieceShapes({ type, mat }: { type: string; mat: THREE.MeshStandardMaterial }) {
  switch (type) {
    case 'pawn':   return <PawnGeom mat={mat} />;
    case 'inter1': return <Inter1Geom mat={mat} />;
    case 'inter2': return <Inter2Geom mat={mat} />;
    case 'inter3': return <Inter3Geom mat={mat} />;
    default:       return <KingGeom mat={mat} />;
  }
}

// ─── Standard 3D piece ────────────────────────────────────────────────────────
function StandardPiece({
  piece,
  color,
  isSelected,
  isCurrentPlayer,
}: {
  piece: Piece;
  color: string;
  isSelected: boolean;
  isCurrentPlayer: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color:             new THREE.Color(color),
        emissive:          new THREE.Color(color),
        emissiveIntensity: 0,
        roughness: 0.28,
        metalness: 0.72,
      }),
    [color]
  );

  // Dispose on unmount
  useEffect(() => () => { mat.dispose(); }, [mat]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t     = clock.getElapsedTime();
    const phase = piece.position.x * 0.8 + piece.position.y * 1.3;

    // Float
    const amp   = isSelected ? 0.09 : 0.022;
    const speed = isSelected ? 2.3  : 1.1;
    groupRef.current.position.y = PIECE_Y + Math.sin(t * speed + phase) * amp;

    // Rotation on selection
    if (isSelected) groupRef.current.rotation.y += 0.016;

    // Emissive glow
    mat.emissiveIntensity = isSelected
      ? 0.40 + Math.sin(t * 3.8) * 0.14
      : isCurrentPlayer ? 0.07 : 0;
  });

  return (
    <group ref={groupRef} position={[0, PIECE_Y, 0]}>
      <PieceShapes type={piece.type} mat={mat} />
    </group>
  );
}

// ─── Piece dispatcher ─────────────────────────────────────────────────────────
function Piece3D({
  piece,
  faction,
  factionPiece,
  isSelected,
  isCurrentPlayer,
}: {
  piece: Piece;
  faction: Faction;
  factionPiece: FactionPiecePattern | undefined;
  isSelected: boolean;
  isCurrentPlayer: boolean;
}) {
  const standard = (
    <StandardPiece
      piece={piece}
      color={faction.color}
      isSelected={isSelected}
      isCurrentPlayer={isCurrentPlayer}
    />
  );

  if (factionPiece?.fbxUrl) {
    return (
      <Suspense fallback={standard}>
        <FBXCharacter
          fbxUrl={factionPiece.fbxUrl}
          color={faction.color}
          isSelected={isSelected}
          offsetX={piece.position.x}
          offsetZ={piece.position.y}
        />
      </Suspense>
    );
  }

  return standard;
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
  children?: React.ReactNode;
}) {
  const isLight    = (x + y) % 2 === 0;
  const slabH      = isWall ? WALL_H : TILE_H;
  const baseColor  = isWall ? C_WALL : isLight ? C_TILE_LIGHT : C_TILE_DARK;
  const emissive   = isCapture ? C_CAPTURE_EM : isLegal ? C_LEGAL_EM : '#000000';
  const emIntensity = (isCapture || isLegal) ? 1.0 : 0;

  return (
    <group position={[x, 0, y]}>
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

      {/* Capture target — pulsing red ring on tile */}
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

      {/* Invisible click hitbox — covers the full cell column */}
      <mesh position={[0, 0.45, 0]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <boxGeometry args={[1, 0.9, 1]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {children}
    </group>
  );
}

// ─── Board scene (inside Canvas) ─────────────────────────────────────────────
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

  // Faction accent lights (one per active player)
  const playerLights = useMemo(() => {
    return gameState.activePlayers.map(pid => {
      const faction = factions[pid];
      const setup   = layout.players.find(p => p.playerId === pid);
      if (!setup || !faction) return null;
      // Approximate light position near this player's start zone
      const startCoords = setup.startCells;
      const avgX = startCoords.reduce((s, c) => s + c.x, 0) / startCoords.length;
      const avgY = startCoords.reduce((s, c) => s + c.y, 0) / startCoords.length;
      return { pid, color: faction.color, x: avgX + ox, z: avgY + oz };
    }).filter(Boolean);
  }, [gameState.activePlayers, factions, layout.players, ox, oz]);

  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight color="#1a0d09" intensity={2.0} />
      <hemisphereLight args={['#1a0d09', '#0a0508', 0.9]} />

      {/* Main directional (warm, from top-front-right) */}
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

      {/* Cool fill from opposite side */}
      <directionalLight
        position={[-5, 8, -8]}
        color="#2840a8"
        intensity={0.5}
      />

      {/* Faction-coloured accent point lights near each player */}
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
        {/* Stone plinth beneath the tiles */}
        <mesh position={[(cols - 1) / 2, -0.06, (rows - 1) / 2]} receiveShadow>
          <boxGeometry args={[cols + 0.6, 0.12, rows + 0.6]} />
          <meshStandardMaterial color="#080604" roughness={0.92} metalness={0.05} />
        </mesh>

        {/* Tiles + pieces */}
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
                x={x}
                y={y}
                isWall={isWall}
                isLegal={isLegal}
                isCapture={isCapture}
                onClick={() => onCellClick(x, y)}
              >
                {here.map(piece => {
                  const faction     = factions[piece.owner];
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

export default function Board3D({
  gameState,
  selectedPieceId,
  legalMoves,
  onCellClick,
}: Board3DProps) {
  const { cols, rows } = gameState.layout;
  const maxDim = Math.max(cols, rows);

  // Camera placed behind Player 1 (large Z), elevated
  const camY = maxDim * 1.15;
  const camZ = maxDim * 1.25;

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false }}
      camera={{
        position: [0, camY, camZ],
        fov: 46,
        near: 0.1,
        far: 120,
      }}
      style={{ width: '100%', height: '100%', display: 'block', background: '#050304' }}
    >
      <fog attach="fog" args={['#050304', 25, 65]} />

      <BoardScene
        gameState={gameState}
        selectedPieceId={selectedPieceId}
        legalMoves={legalMoves}
        onCellClick={onCellClick}
      />
    </Canvas>
  );
}
