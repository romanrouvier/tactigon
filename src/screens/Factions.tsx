import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { factions } from '../data/factions';
import styles from './Factions.module.css';
import type { Faction, FactionPiecePattern } from '../game/types';

// ── Piece labels ──────────────────────────────────────────────────────────────
const PIECE_LABELS: Record<string, string> = {
  pawn:   'Pion',
  inter1: 'Intermédiaire I',
  inter2: 'Intermédiaire II',
  inter3: 'Intermédiaire III',
  king:   'Roi / Renne',
};

// ── SVG shapes (mirrors Piece.tsx) ───────────────────────────────────────────
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

// ── Piece thumbnail (image or SVG) ────────────────────────────────────────────
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
      <svg
        viewBox="0 0 40 40"
        className={styles.pieceThumbSvg}
        style={{ '--faction-color': color } as React.CSSProperties}
      >
        <PieceShapeSVG type={piece.type} />
      </svg>
    </div>
  );
}

// ── Pattern mini-grid ─────────────────────────────────────────────────────────
// 7×7 grid, center = (3,3). dy<0 = forward = visually up.
// Cell at (col, row) maps to dx = col−3, dy = row−3.
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
              isCenter ? styles.patternPiece : '',
              isTarget ? styles.patternTarget : '',
              isInter  ? styles.patternInter  : '',
            ].filter(Boolean).join(' ')}
            style={(isTarget || isCenter)
              ? { '--faction-color': color } as React.CSSProperties
              : undefined}
          />
        );
      })}
    </div>
  );
}

// ── Faction detail view ───────────────────────────────────────────────────────
function FactionDetail({ faction, onBack }: { faction: Faction; onBack: () => void }) {
  return (
    <div className={styles.detail}>
      <button className={styles.back} onClick={onBack}>← Factions</button>

      <div
        className={styles.detailHeader}
        style={{ '--faction-color': faction.color } as React.CSSProperties}
      >
        <span className={styles.dot} style={{ background: faction.color, color: faction.color }} />
        <h1 className={styles.detailTitle}>
          {faction.name.split('—')[1]?.trim() ?? faction.name}
        </h1>
      </div>

      <p className={styles.detailDesc}>{faction.description}</p>

      <div className={styles.piecesGrid}>
        {faction.pieces.map(fp => (
          <div
            key={fp.type}
            className={styles.pieceCard}
            style={{ '--faction-color': faction.color } as React.CSSProperties}
          >
            <h3 className={styles.pieceName}>{PIECE_LABELS[fp.type]}</h3>
            <PieceThumb piece={fp} color={faction.color} />
            <PatternGrid piece={fp} color={faction.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Faction card (list view) ──────────────────────────────────────────────────
function FactionCard({ faction, onSelect }: { faction: Faction; onSelect: () => void }) {
  const shortName = faction.name.split('—')[1]?.trim() ?? faction.name;
  const initial   = shortName.charAt(0);

  return (
    <div
      className={styles.card}
      style={{ '--faction-color': faction.color } as React.CSSProperties}
    >
      {/* Image area */}
      <div className={styles.cardImg}>
        {faction.imageUrl ? (
          <img src={faction.imageUrl} alt={faction.name} className={styles.cardImgEl} draggable={false} />
        ) : (
          <div className={styles.cardImgPlaceholder}>
            <span className={styles.placeholderInitial}>{initial}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <span className={styles.dot} style={{ background: faction.color, color: faction.color }} />
          <h2 className={styles.factionName}>{shortName}</h2>
        </div>
        <p className={styles.desc}>{faction.description}</p>
        <button className={styles.btnDetail} onClick={onSelect}>
          Voir les pièces →
        </button>
      </div>
    </div>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function Factions() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Faction | null>(null);

  return (
    <div className={styles.container}>
      {selected ? (
        <FactionDetail faction={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          <button className={styles.back} onClick={() => navigate('/menu')}>← Retour</button>
          <h1 className={styles.title}>Les Factions</h1>
          <div className={styles.grid}>
            {factions.map(f => (
              <FactionCard key={f.id} faction={f} onSelect={() => setSelected(f)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
