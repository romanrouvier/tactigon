import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { factions } from '../data/factions';
import styles from './MainMenu.module.css';

type RankType  = 'normal' | 'ranked';
type GameMode  = '2' | '4';

const FACTION_TAGS: Record<number, string[]> = {
  1: ['Mobilité', 'Diagonal'],
  2: ['Contrôle', 'Longue portée'],
  3: ['Furtif', 'Angles'],
  4: ['Frappe', 'Puissance'],
};

export default function MainMenu() {
  const navigate = useNavigate();

  // Play overlay state
  const [playOpen,   setPlayOpen]   = useState(false);
  const [rankType,   setRankType]   = useState<RankType>('normal');
  const [gameMode,   setGameMode]   = useState<GameMode>('2');
  const [factionId,  setFactionId]  = useState<number | null>(null);

  function openPlay()  { setPlayOpen(true); }
  function closePlay() { setPlayOpen(false); setFactionId(null); }

  function handleLaunch() {
    if (!factionId) return;
    const base = rankType === 'ranked' ? '/ranked' : '/clan';
    navigate(`${base}?players=${gameMode}&p1=${factionId}`);
  }

  const canLaunch = factionId !== null;

  return (
    <div className={styles.container}>

      {/* ── Atmospheric background ───────────────────────────── */}
      <div className={styles.bg}         aria-hidden />
      <div className={styles.bgGlow1}    aria-hidden />
      <div className={styles.bgGlow2}    aria-hidden />
      <div className={styles.bgVignette} aria-hidden />
      <div className={styles.scanlines}  aria-hidden />

      {/* ── Floating particles ───────────────────────────────── */}
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      {/* ── Hero ────────────────────────────────────────────── */}
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.heroEyebrow}>La Guerre des Factions</p>
          <h1 className={styles.heroTitle}>
            Choisissez<br />Votre Stratégie
          </h1>
          <p className={styles.heroSub}>
            Quatre factions. Un seul trône.<br />
            Quelle armée allez-vous mener à la victoire&nbsp;?
          </p>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════
          PLAY OVERLAY — all-in-one
         ══════════════════════════════════════════════════════ */}
      {playOpen && (
        <div className={styles.overlay} aria-modal="true" role="dialog" aria-label="Lancer une partie">

          <div className={styles.overlayPanel}>

            {/* ── Panel header ────────────────────────────── */}
            <div className={styles.overlayHeader}>
              <span className={styles.overlayTitle}>Lancer une partie</span>
              <button className={styles.overlayClose} onClick={closePlay} aria-label="Fermer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                     strokeLinecap="round" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6"  y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.overlaySections}>

              {/* ── Section 1: Type ─────────────────────── */}
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

              {/* ── Section 2: Mode ─────────────────────── */}
              <section className={styles.section}>
                <p className={styles.sectionLabel}>Mode de jeu</p>
                <div className={styles.modeRow}>
                  <button
                    className={`${styles.modeBtn} ${gameMode === '2' ? styles.modeBtnActive : ''}`}
                    onClick={() => setGameMode('2')}
                  >
                    <span className={styles.modeIcon} aria-hidden>⚔</span>
                    <span className={styles.modeTitle}>Duel</span>
                    <span className={styles.modeDesc}>1v1 · Grille 7×8</span>
                  </button>
                  <button
                    className={`${styles.modeBtn} ${gameMode === '4' ? styles.modeBtnActive : ''}`}
                    onClick={() => setGameMode('4')}
                  >
                    <span className={styles.modeIcon} aria-hidden>◆</span>
                    <span className={styles.modeTitle}>Choc</span>
                    <span className={styles.modeDesc}>1v1v1v1 · Grille 13×13</span>
                  </button>
                </div>
              </section>

              <div className={styles.divider} />

              {/* ── Section 3: Faction ──────────────────── */}
              <section className={styles.section}>
                <p className={styles.sectionLabel}>Votre faction</p>
                <div className={styles.factionRow}>
                  {factions.map(f => {
                    const shortName = f.name.split('—')[1]?.trim() ?? f.name;
                    const tags = FACTION_TAGS[f.id] ?? [];
                    const isSelected = factionId === f.id;
                    return (
                      <button
                        key={f.id}
                        className={`${styles.factionCard} ${isSelected ? styles.factionCardActive : ''}`}
                        style={{ '--faction-color': f.color } as React.CSSProperties}
                        onClick={() => setFactionId(f.id)}
                        aria-pressed={isSelected}
                        aria-label={shortName}
                      >
                        <div className={styles.factionCardBg} />
                        <span className={styles.factionInitial} aria-hidden>
                          {shortName.charAt(0)}
                        </span>
                        <div className={styles.factionCardContent}>
                          <div className={styles.factionDot} style={{ background: f.color }} />
                          <span className={styles.factionName}>{shortName}</span>
                          <div className={styles.factionTags}>
                            {tags.slice(0, 2).map(t => (
                              <span key={t} className={styles.factionTag}>{t}</span>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <div className={styles.factionCheck} aria-hidden>✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

            </div>

            {/* ── Launch button ────────────────────────── */}
            <div className={styles.overlayFooter}>
              <button
                className={`${styles.launchBtn} ${canLaunch ? styles.launchBtnReady : ''}`}
                onClick={handleLaunch}
                disabled={!canLaunch}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
                  <polygon points="6,3 21,12 6,21" />
                </svg>
                {canLaunch
                  ? `Lancer avec ${factions.find(f => f.id === factionId)!.name.split('—')[1]?.trim()}`
                  : 'Choisissez votre faction'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Bottom navigation — 5 items ─────────────────────── */}
      <nav className={styles.bottomNav} aria-label="Navigation principale">

        <button className={`${styles.navItem} ${styles.navActive}`} aria-label="Accueil" aria-current="page">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
            <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" />
          </svg>
          <span>Accueil</span>
        </button>

        <button className={styles.navItem} onClick={() => navigate('/factions')} aria-label="Factions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
            <path d="M12 2L8 6H4l1 8 7 8 7-8 1-8h-4L12 2z" />
          </svg>
          <span>Factions</span>
        </button>

        <button
          className={`${styles.navItem} ${styles.navPlay} ${playOpen ? styles.navActive : ''}`}
          onClick={playOpen ? closePlay : openPlay}
          aria-label="Jouer"
          aria-expanded={playOpen}
        >
          <div className={styles.playBubble}>
            {playOpen
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                     strokeLinecap="round" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              : <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden>
                  <polygon points="6,3 21,12 6,21" />
                </svg>
            }
          </div>
          <span>Jouer</span>
        </button>

        <button className={styles.navItem} disabled aria-label="Classement">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
            <path d="M6 9H4a2 2 0 0 0-2 2v9h20v-9a2 2 0 0 0-2-2h-2" />
            <path d="M8 9V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
            <line x1="12" y1="12" x2="12" y2="17" /><line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <span>Classement</span>
        </button>

        <button className={styles.navItem} disabled aria-label="Profil">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span>Profil</span>
        </button>

      </nav>

    </div>
  );
}
