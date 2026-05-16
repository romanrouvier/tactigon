import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { factions } from '../data/factions';
import styles from './PlayOverlay.module.css';

type RankType = 'normal' | 'ranked';
type GameMode = '2' | '4';

const FACTION_TAGS: Record<number, string[]> = {
  1: ['Mobilité', 'Diagonal'],
  2: ['Contrôle', 'Longue portée'],
  3: ['Furtif', 'Angles'],
  4: ['Frappe', 'Puissance'],
};

function FactionPicker({
  label,
  selected,
  taken,
  onSelect,
}: {
  label: string;
  selected: number | null;
  taken: number[];
  onSelect: (id: number) => void;
}) {
  return (
    <div className={styles.pickerBlock}>
      <p className={styles.pickerLabel}>{label}</p>
      <div className={styles.factionRow}>
        {factions.map(f => {
          const shortName = f.name.split('—')[1]?.trim() ?? f.name;
          const isSelected = selected === f.id;
          const isTaken    = taken.includes(f.id);
          return (
            <button
              key={f.id}
              className={[
                styles.factionCard,
                isSelected ? styles.factionCardActive : '',
                isTaken    ? styles.factionCardTaken  : '',
              ].filter(Boolean).join(' ')}
              style={{ '--faction-color': f.color } as React.CSSProperties}
              onClick={() => !isTaken && onSelect(f.id)}
              aria-pressed={isSelected}
              aria-disabled={isTaken}
              aria-label={shortName}
            >
              <div className={styles.factionCardBg} />
              <span className={styles.factionInitial} aria-hidden>{shortName.charAt(0)}</span>
              <div className={styles.factionCardContent}>
                <div className={styles.factionDot} style={{ background: f.color }} />
                <span className={styles.factionName}>{shortName}</span>
                <div className={styles.factionTags}>
                  {(FACTION_TAGS[f.id] ?? []).slice(0, 2).map(t => (
                    <span key={t} className={styles.factionTag}>{t}</span>
                  ))}
                </div>
              </div>
              {isSelected && <div className={styles.factionCheck} aria-hidden>✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PlayOverlay({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();

  const [rankType,  setRankType]  = useState<RankType>('normal');
  const [gameMode,  setGameMode]  = useState<GameMode>('2');
  const [factions1, setFactions1] = useState<number | null>(null);
  const [factions2, setFactions2] = useState<number | null>(null);
  const [factions3, setFactions3] = useState<number | null>(null);
  const [factions4, setFactions4] = useState<number | null>(null);

  const playerCount = gameMode === '4' ? 4 : 2;

  function resetFactions() {
    setFactions1(null); setFactions2(null);
    setFactions3(null); setFactions4(null);
  }

  function switchMode(m: GameMode) {
    setGameMode(m);
    resetFactions();
  }

  const chosen = [factions1, factions2, factions3, factions4].slice(0, playerCount);
  const canLaunch = chosen.every(f => f !== null);

  function handleLaunch() {
    if (!canLaunch) return;
    const factionIds = Object.fromEntries(
      chosen.map((fid, i) => [i + 1, fid])
    ) as Record<number, number>;
    navigate('/game', { state: { factionIds, players: playerCount, ranked: rankType === 'ranked' } });
  }

  const takenFor = (excludeSlot: number) =>
    [[1, factions1], [2, factions2], [3, factions3], [4, factions4]]
      .filter(([slot]) => slot !== excludeSlot && (slot as number) <= playerCount)
      .map(([, fid]) => fid)
      .filter((fid): fid is number => fid !== null);

  return (
    <div className={styles.overlay} aria-modal="true" role="dialog" aria-label="Lancer une partie">
      <div className={styles.panel}>

        {/* Header */}
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Lancer une partie</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.sections}>

          {/* Type */}
          <section className={styles.section}>
            <p className={styles.sectionLabel}>Type de partie</p>
            <div className={styles.typeRow}>
              <button
                className={`${styles.typeBtn} ${rankType === 'normal' ? styles.typeBtnActive : ''}`}
                onClick={() => setRankType('normal')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                     strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Normal</span>
                <small>Partie libre</small>
              </button>
              <button
                className={`${styles.typeBtn} ${rankType === 'ranked' ? styles.typeBtnActive : ''}`}
                onClick={() => setRankType('ranked')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                     strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                  <path d="M6 9H4a2 2 0 0 0-2 2v9h20v-9a2 2 0 0 0-2-2h-2" />
                  <path d="M8 9V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
                  <line x1="12" y1="12" x2="12" y2="17" />
                  <line x1="9"  y1="15" x2="15" y2="15" />
                </svg>
                <span>Classé</span>
                <small>Enjeu de classement</small>
              </button>
            </div>
          </section>

          <div className={styles.divider} />

          {/* Mode */}
          <section className={styles.section}>
            <p className={styles.sectionLabel}>Mode de jeu</p>
            <div className={styles.modeRow}>
              <button
                className={`${styles.modeBtn} ${gameMode === '2' ? styles.modeBtnActive : ''}`}
                onClick={() => switchMode('2')}
              >
                <span className={styles.modeIcon} aria-hidden>⚔</span>
                <span className={styles.modeTitle}>Duel</span>
                <span className={styles.modeDesc}>1v1 · Grille 7×8</span>
              </button>
              <button
                className={`${styles.modeBtn} ${gameMode === '4' ? styles.modeBtnActive : ''}`}
                onClick={() => switchMode('4')}
              >
                <span className={styles.modeIcon} aria-hidden>◆</span>
                <span className={styles.modeTitle}>Choc</span>
                <span className={styles.modeDesc}>1v1v1v1 · Grille 13×13</span>
              </button>
            </div>
          </section>

          <div className={styles.divider} />

          {/* Factions */}
          <section className={styles.section}>
            <p className={styles.sectionLabel}>Factions</p>
            <FactionPicker label="Joueur 1" selected={factions1} taken={takenFor(1)} onSelect={setFactions1} />
            <FactionPicker label="Joueur 2" selected={factions2} taken={takenFor(2)} onSelect={setFactions2} />
            {playerCount >= 3 && (
              <FactionPicker label="Joueur 3" selected={factions3} taken={takenFor(3)} onSelect={setFactions3} />
            )}
            {playerCount >= 4 && (
              <FactionPicker label="Joueur 4" selected={factions4} taken={takenFor(4)} onSelect={setFactions4} />
            )}
          </section>

        </div>

        {/* Launch */}
        <div className={styles.footer}>
          <button
            className={`${styles.launchBtn} ${canLaunch ? styles.launchBtnReady : ''}`}
            onClick={handleLaunch}
            disabled={!canLaunch}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
              <polygon points="6,3 21,12 6,21" />
            </svg>
            {canLaunch ? 'Lancer la partie' : 'Choisissez toutes les factions'}
          </button>
        </div>

      </div>
    </div>
  );
}
