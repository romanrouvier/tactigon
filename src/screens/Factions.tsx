import { useState, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';
import { factions } from '../data/factions';
import PlayOverlay from '../components/PlayOverlay';
import styles from './Factions.module.css';
import type { Faction, FactionPiecePattern } from '../game/types';

// ── Piece labels ──────────────────────────────────────────────────────────────
const PIECE_LABELS: Record<string, string> = {
  pawn:   'Pion',
  inter1: 'Éclaireur I',
  inter2: 'Éclaireur II',
  inter3: 'Éclaireur III',
  king:   'Roi',
};

// ── Faction metadata (tags, taglines, stats) ──────────────────────────────────
const FACTION_META: Record<number, {
  tags: string[];
  tagline: string;
  stats: { label: string; value: number; max: number }[];
}> = {
  1: {
    tags: ['Mobilité', 'Diagonal', 'Arc'],
    tagline: 'Maîtres des diagonales et de la mobilité centrale',
    stats: [
      { label: 'Mobilité',  value: 4, max: 5 },
      { label: 'Puissance', value: 3, max: 5 },
      { label: 'Contrôle',  value: 2, max: 5 },
      { label: 'Furtivité', value: 2, max: 5 },
    ],
  },
  2: {
    tags: ['Contrôle', 'Longue portée', 'Terrain'],
    tagline: 'Contrôle absolu du terrain, frappe à longue portée',
    stats: [
      { label: 'Mobilité',  value: 2, max: 5 },
      { label: 'Puissance', value: 4, max: 5 },
      { label: 'Contrôle',  value: 5, max: 5 },
      { label: 'Furtivité', value: 1, max: 5 },
    ],
  },
  3: {
    tags: ['Furtif', 'Angles', 'Surprise'],
    tagline: 'Tactiques de fourche et angles asymétriques',
    stats: [
      { label: 'Mobilité',  value: 3, max: 5 },
      { label: 'Puissance', value: 3, max: 5 },
      { label: 'Contrôle',  value: 3, max: 5 },
      { label: 'Furtivité', value: 5, max: 5 },
    ],
  },
  4: {
    tags: ['Frappe', 'Longue ligne', 'Puissance'],
    tagline: 'Maîtres des lignes longues et des angles brisés',
    stats: [
      { label: 'Mobilité',  value: 2, max: 5 },
      { label: 'Puissance', value: 5, max: 5 },
      { label: 'Contrôle',  value: 3, max: 5 },
      { label: 'Furtivité', value: 1, max: 5 },
    ],
  },
};


// ── 3D GLB viewer (HD model for faction inspector) ────────────────────────────
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useFrame((_, delta) => { cloned.rotation.y += delta * 0.6; });
  return <primitive object={cloned} />;
}

function GLBPieceThumb({ url }: { url: string }) {
  // Mobile: skip WebGL Canvas to avoid context limit and GPU memory crash
  if (isMobile) {
    return (
      <div className={styles.pieceThumb3d} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(159,205,168,0.5)', fontSize: 12, fontStyle: 'italic' }}>
        3D — desktop only
      </div>
    );
  }
  return (
    <div className={styles.pieceThumb3d}>
      <Canvas
        camera={{ position: [0, 1, 3], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 6, 4]} intensity={2} />
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.4} adjustCamera={false}>
            <GLBModel url={url} />
          </Stage>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}

// ── SVG shapes ────────────────────────────────────────────────────────────────
function PieceShapeSVG({ type }: { type: string }) {
  switch (type) {
    case 'pawn':   return <circle cx="20" cy="22" r="10" />;
    case 'inter1': return <polygon points="20,8 30,32 10,32" />;
    case 'inter2': return <rect x="10" y="10" width="20" height="20" />;
    case 'inter3': return <polygon points="20,8 32,20 20,32 8,20" />;
    case 'king':   return <polygon points="20,6 24,16 35,16 27,23 30,34 20,27 10,34 13,23 5,16 16,16" />;
    default:       return null;
  }
}

function PieceThumb({ piece, color }: { piece: FactionPiecePattern; color: string }) {
  if (piece.glbUrlHD) {
    return <GLBPieceThumb url={piece.glbUrlHD} />;
  }
  if (piece.imageUrl) {
    return (
      <div className={styles.pieceThumb}>
        <img src={piece.imageUrl} alt={piece.type} className={styles.pieceThumbImg} draggable={false} />
      </div>
    );
  }
  return (
    <div className={styles.pieceThumb}>
      <svg viewBox="0 0 40 40" className={styles.pieceThumbSvg}
        style={{ '--faction-color': color } as React.CSSProperties}>
        <PieceShapeSVG type={piece.type} />
      </svg>
    </div>
  );
}

// ── Pattern mini-grid ─────────────────────────────────────────────────────────
const GRID_SIZE = 7;
const CENTER    = 3;

function PatternGrid({ piece, color }: { piece: FactionPiecePattern; color: string }) {
  const targetSet = new Set(
    piece.pattern.targets.map(t => `${CENTER + t.dx},${CENTER + t.dy}`)
  );
  const interSet = new Set(
    piece.pattern.targets.flatMap(t =>
      (t.intermediates ?? []).map(i => `${CENTER + i.dx},${CENTER + i.dy}`)
    )
  );

  return (
    <div className={styles.patternGrid}>
      {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;
        const key = `${col},${row}`;
        const isCenter = row === CENTER && col === CENTER;
        const isTarget = targetSet.has(key);
        const isInter  = !isTarget && interSet.has(key);
        return (
          <div
            key={i}
            className={[
              styles.patternCell,
              isCenter ? styles.patternPiece  : '',
              isTarget ? styles.patternTarget : '',
              isInter  ? styles.patternInter  : '',
            ].filter(Boolean).join(' ')}
            style={(isTarget || isCenter) ? { '--faction-color': color } as React.CSSProperties : undefined}
          />
        );
      })}
    </div>
  );
}

// ── Star rating bar ───────────────────────────────────────────────────────────
function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className={styles.statBarTrack}>
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={styles.statBarDot}
          style={i < value ? { background: color, boxShadow: `0 0 6px ${color}` } : undefined}
        />
      ))}
    </div>
  );
}

// ── Shared top header ─────────────────────────────────────────────────────────
function TopHeader() {
  return (
    <header className={styles.topHeader}>
      <button className={styles.headerIcon} aria-label="Paramètres">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
      <div className={styles.headerCenter}>
        <div className={styles.avatar}>O</div>
        <span className={styles.username}>Oraizi</span>
      </div>
      <button className={styles.headerIcon} aria-label="Équipe">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>
    </header>
  );
}

// ── Bottom nav (FAB style, matches MainMenu) ──────────────────────────────────
function BottomNav({ onHome, playOpen, onTogglePlay }: {
  onHome: () => void;
  playOpen: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <nav className={styles.bottomNav} aria-label="Navigation">

      <button className={styles.navItem} onClick={onHome} aria-label="Accueil">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" />
        </svg>
        <span>Accueil</span>
      </button>

      <button className={`${styles.navItem} ${styles.navItemActive}`} aria-label="Factions" aria-current="page">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M12 2L8 6H4l1 8 7 8 7-8 1-8h-4L12 2z" />
        </svg>
        <span>Factions</span>
      </button>

      {/* FAB play button */}
      <button
        className={`${styles.navPlay} ${playOpen ? styles.navPlayOpen : ''}`}
        onClick={onTogglePlay}
        aria-label="Jouer"
        aria-expanded={playOpen}
      >
        <div className={styles.playBubble}>
          {playOpen
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   strokeLinecap="round" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            : <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden>
                <polygon points="7,3 22,12 7,21" />
              </svg>
          }
        </div>
        <span className={styles.navPlayLabel}>Jouer</span>
      </button>

      <button className={styles.navItem} disabled aria-label="Classement">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M6 9H4a2 2 0 0 0-2 2v9h20v-9a2 2 0 0 0-2-2h-2" />
          <path d="M8 9V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
          <line x1="12" y1="12" x2="12" y2="17" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <span>Classement</span>
      </button>

      <button className={styles.navItem} disabled aria-label="Profil">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        <span>Profil</span>
      </button>

    </nav>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DETAIL VIEW
// ══════════════════════════════════════════════════════════════════════════════
function FactionDetail({ faction, onBack, onPlay }: {
  faction: Faction;
  onBack: () => void;
  onPlay: () => void;
}) {
  const meta      = FACTION_META[faction.id];
  const shortName = faction.name.split('—')[1]?.trim() ?? faction.name;

  return (
    <div className={styles.detailRoot}>

      {/* ── Top bar ───────────────────────────────────────────── */}
      <div className={styles.detailTopBar}>
        <button className={styles.detailBackBtn} onClick={onBack} aria-label="Retour">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={styles.detailTopTitle}>{shortName}</span>
        <div className={styles.detailTopSpacer} />
      </div>

      {/* ── Scrollable body ───────────────────────────────────── */}
      <div className={styles.detailBody}>

        {/* Hero */}
        <section
          className={styles.detailHero}
          style={{ '--faction-color': faction.color } as React.CSSProperties}
        >
          <div className={styles.detailHeroBg} />
          <div className={styles.detailHeroOverlay} />
          <div className={styles.detailHeroContent}>
            <div className={styles.detailInitialWrap}>
              <span className={styles.detailInitial}>{shortName.charAt(0)}</span>
            </div>
            <h1 className={styles.detailHeroName}>{shortName}</h1>
            <p className={styles.detailHeroTagline}>{meta.tagline}</p>
          </div>
          <div className={styles.detailHeroColorBar} />
        </section>

        {/* Description */}
        <section className={styles.detailSection}>
          <p className={styles.sectionLabel}>Description</p>
          <div className={styles.infoBlock}>
            <p className={styles.infoText}>{faction.description}</p>
          </div>
        </section>

        {/* Stats */}
        <section className={styles.detailSection}>
          <p className={styles.sectionLabel}>Statistiques</p>
          <div className={styles.statsGrid}>
            {meta.stats.map(s => (
              <div key={s.label} className={styles.statCard}>
                <span className={styles.statLabel}>{s.label}</span>
                <StatBar value={s.value} max={s.max} color={faction.color} />
                <span className={styles.statValue} style={{ color: faction.color }}>
                  {s.value}/{s.max}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Pieces */}
        <section className={styles.detailSection}>
          <p className={styles.sectionLabel}>Pièces · {faction.pieces.length} types</p>
          <div className={styles.pieceList}>
            {faction.pieces.map(fp => (
              <div
                key={fp.type}
                className={styles.pieceRow}
                style={{ '--faction-color': faction.color } as React.CSSProperties}
              >
                <div className={styles.pieceRowThumb}>
                  <PieceThumb piece={fp} color={faction.color} />
                </div>
                <div className={styles.pieceRowInfo}>
                  <p className={styles.pieceRowName}>{PIECE_LABELS[fp.type] ?? fp.type}</p>
                  <PatternGrid piece={fp} color={faction.color} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spacer so sticky CTA doesn't hide content */}
        <div className={styles.ctaSpacer} />
      </div>

      {/* ── Sticky CTA ────────────────────────────────────────── */}
      <div className={styles.stickyCta}>
        <button
          className={styles.stickyCtaBtn}
          style={{ '--faction-color': faction.color } as React.CSSProperties}
          onClick={onPlay}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
            <polygon points="6,3 21,12 6,21" />
          </svg>
          Jouer avec {shortName}
        </button>
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  LIST VIEW
// ══════════════════════════════════════════════════════════════════════════════
function FactionList({ onSelect, playOpen, onTogglePlay }: {
  onSelect: (f: Faction) => void;
  playOpen: boolean;
  onTogglePlay: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.listRoot}>

      <TopHeader />

      {/* ── Card grid ─────────────────────────────────────────── */}
      <div className={styles.cardGrid}>
        {factions.map(faction => {
          const shortName = faction.name.split('—')[1]?.trim() ?? faction.name;
          const meta = FACTION_META[faction.id];
          return (
            <button
              key={faction.id}
              className={styles.card}
              style={{ '--faction-color': faction.color } as React.CSSProperties}
              onClick={() => onSelect(faction)}
              aria-label={`Voir ${shortName}`}
            >
              <div className={styles.cardVisual}>
                <div className={styles.cardBg} />
                <span className={styles.cardInitial} aria-hidden>{shortName.charAt(0)}</span>
                <div className={styles.cardOverlay} />
                <div className={styles.cardOverlayContent}>
                  <div className={styles.cardColorDot} style={{ background: faction.color }} />
                  <span className={styles.cardName}>{shortName}</span>
                  <div className={styles.cardTagRow}>
                    {meta?.tags.slice(0, 2).map(t => (
                      <span key={t} className={styles.cardTagBadge}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardPieceCount}>{faction.pieces.length} pièces</span>
                <span className={styles.cardArrow}>→</span>
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav
        onHome={() => navigate('/menu')}
        playOpen={playOpen}
        onTogglePlay={onTogglePlay}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export default function Factions() {
  const [selected,  setSelected]  = useState<Faction | null>(null);
  const [playOpen,  setPlayOpen]  = useState(false);

  const togglePlay = () => setPlayOpen(v => !v);

  return (
    <>
      {playOpen && <PlayOverlay onClose={() => setPlayOpen(false)} />}

      {selected
        ? <FactionDetail
            faction={selected}
            onBack={() => setSelected(null)}
            onPlay={togglePlay}
          />
        : <FactionList
            onSelect={setSelected}
            playOpen={playOpen}
            onTogglePlay={togglePlay}
          />
      }
    </>
  );
}
