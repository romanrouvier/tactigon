import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { factions } from '../data/factions';
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

const FILTER_TAGS = ['Toutes', 'Mobilité', 'Contrôle', 'Furtif', 'Frappe'];

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

// ── Bottom nav (shared) ───────────────────────────────────────────────────────
function BottomNav({ active, onHome, onFactions, onPlay }: {
  active: 'home' | 'factions' | 'play';
  onHome: () => void;
  onFactions: () => void;
  onPlay: () => void;
}) {
  return (
    <nav className={styles.bottomNav} aria-label="Navigation">
      <button
        className={`${styles.navItem} ${active === 'home' ? styles.navItemActive : ''}`}
        onClick={onHome}
        aria-label="Accueil"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" />
        </svg>
        <span>Accueil</span>
      </button>

      <button
        className={`${styles.navItem} ${active === 'factions' ? styles.navItemActive : ''}`}
        onClick={onFactions}
        aria-label="Factions"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Factions</span>
      </button>

      {/* Play — prominent center button */}
      <button
        className={`${styles.navItem} ${styles.navItemPlay} ${active === 'play' ? styles.navItemActive : ''}`}
        onClick={onPlay}
        aria-label="Jouer"
      >
        <div className={styles.navPlayBubble}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <polygon points="6,3 21,12 6,21" />
          </svg>
        </div>
        <span>Jouer</span>
      </button>

      <button className={`${styles.navItem}`} aria-label="Paramètres" disabled>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        </svg>
        <span>Réglages</span>
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

        {/* Tags */}
        <section className={styles.detailSection}>
          <p className={styles.sectionLabel}>Caractéristiques</p>
          <div className={styles.tagRow}>
            {meta.tags.map(tag => (
              <span
                key={tag}
                className={styles.tag}
                style={{ '--faction-color': faction.color } as React.CSSProperties}
              >
                {tag}
              </span>
            ))}
          </div>
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
          <div className={styles.piecesGrid}>
            {faction.pieces.map(fp => (
              <div
                key={fp.type}
                className={styles.pieceCard}
                style={{ '--faction-color': faction.color } as React.CSSProperties}
              >
                <PieceThumb piece={fp} color={faction.color} />
                <p className={styles.pieceName}>{PIECE_LABELS[fp.type] ?? fp.type}</p>
                <PatternGrid piece={fp} color={faction.color} />
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
function FactionList({ onSelect }: { onSelect: (f: Faction) => void }) {
  const navigate   = useNavigate();
  const [filter, setFilter] = useState('Toutes');

  const filtered = factions.filter(f => {
    if (filter === 'Toutes') return true;
    return FACTION_META[f.id]?.tags.some(t =>
      t.toLowerCase().includes(filter.toLowerCase()) ||
      filter.toLowerCase().includes(t.toLowerCase())
    );
  });

  return (
    <div className={styles.listRoot}>

      {/* ── Header ────────────────────────────────────────────── */}
      <header className={styles.listHeader}>
        <button
          className={styles.listHeaderBack}
          onClick={() => navigate('/menu')}
          aria-label="Retour au menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={styles.listHeaderTitle}>Factions</h1>
        <button className={styles.listHeaderAction} aria-label="À propos">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
      </header>

      {/* ── Filter tabs ───────────────────────────────────────── */}
      <div className={styles.filterBar}>
        {FILTER_TAGS.map(tag => (
          <button
            key={tag}
            className={`${styles.filterPill} ${filter === tag ? styles.filterPillActive : ''}`}
            onClick={() => setFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Card grid ─────────────────────────────────────────── */}
      <div className={styles.cardGrid}>
        {filtered.map(faction => {
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
              {/* Card visual (image + overlay) */}
              <div className={styles.cardVisual}>
                <div className={styles.cardBg} />
                <span className={styles.cardInitial} aria-hidden>{shortName.charAt(0)}</span>
                <div className={styles.cardOverlay} />
                {/* Metadata overlaid on card */}
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

              {/* Card footer */}
              <div className={styles.cardFooter}>
                <span className={styles.cardPieceCount}>{faction.pieces.length} pièces</span>
                <span className={styles.cardArrow}>→</span>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className={styles.emptyMsg}>Aucune faction pour ce filtre.</p>
        )}
      </div>

      {/* ── Bottom nav ────────────────────────────────────────── */}
      <BottomNav
        active="factions"
        onHome={() => navigate('/menu')}
        onFactions={() => {}}
        onPlay={() => navigate('/clan?players=2')}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export default function Factions() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Faction | null>(null);

  if (selected) {
    return (
      <FactionDetail
        faction={selected}
        onBack={() => setSelected(null)}
        onPlay={() => navigate(`/clan?players=2`)}
      />
    );
  }

  return <FactionList onSelect={setSelected} />;
}
