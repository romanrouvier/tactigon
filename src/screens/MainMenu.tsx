import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainMenu.module.css';

type PlayStep = 'idle' | 'mode' | 'rank';

export default function MainMenu() {
  const navigate = useNavigate();
  const [playStep, setPlayStep] = useState<PlayStep>('idle');
  const [playMode, setPlayMode] = useState<'2' | '4'>('2');

  const closePanel = () => setPlayStep('idle');

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

      {/* ── Hero (only content on landing) ──────────────────── */}
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

      {/* ── Play overlay panel ──────────────────────────────── */}
      {playStep !== 'idle' && (
        <div className={styles.overlay} onClick={closePanel} aria-modal="true" role="dialog">
          <div className={styles.overlayPanel} onClick={e => e.stopPropagation()}>

            {playStep === 'mode' && (
              <>
                <p className={styles.panelLabel}>Choisissez votre mode</p>
                <div className={styles.panelGrid}>
                  <button className={styles.panelCard} onClick={() => { setPlayMode('2'); setPlayStep('rank'); }}>
                    <span className={styles.panelIcon} aria-hidden>⚔</span>
                    <span className={styles.panelTitle}>Duel 1v1</span>
                    <span className={styles.panelDesc}>Deux joueurs, grille 7×8</span>
                  </button>
                  <button className={styles.panelCard} onClick={() => { setPlayMode('4'); setPlayStep('rank'); }}>
                    <span className={styles.panelIcon} aria-hidden>◆</span>
                    <span className={styles.panelTitle}>Choc 1v1v1v1</span>
                    <span className={styles.panelDesc}>Quatre joueurs, grille 13×13</span>
                  </button>
                </div>
                <button className={styles.panelBack} onClick={closePanel}>← Retour</button>
              </>
            )}

            {playStep === 'rank' && (
              <>
                <p className={styles.panelLabel}>Type de partie</p>
                <div className={styles.panelGrid}>
                  <button className={styles.panelCard} onClick={() => navigate(`/clan?players=${playMode}`)}>
                    <span className={styles.panelIcon} aria-hidden>🎮</span>
                    <span className={styles.panelTitle}>Normal</span>
                    <span className={styles.panelDesc}>Partie libre, sans enjeu</span>
                  </button>
                  <button className={styles.panelCard} onClick={() => navigate(`/ranked?players=${playMode}`)}>
                    <span className={styles.panelIcon} aria-hidden>🏆</span>
                    <span className={styles.panelTitle}>Classé</span>
                    <span className={styles.panelDesc}>Affrontez les meilleurs</span>
                  </button>
                </div>
                <button className={styles.panelBack} onClick={() => setPlayStep('mode')}>← Retour</button>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Bottom navigation — 5 items, always visible ──────── */}
      <nav className={styles.bottomNav} aria-label="Navigation principale">

        {/* Accueil */}
        <button className={`${styles.navItem} ${styles.navActive}`} aria-label="Accueil" aria-current="page">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
            <path d="M3 12L12 3l9 9" />
            <path d="M9 21V12h6v9" />
          </svg>
          <span>Accueil</span>
        </button>

        {/* Factions */}
        <button className={styles.navItem} onClick={() => navigate('/factions')} aria-label="Factions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
            <path d="M12 2L8 6H4l1 8 7 8 7-8 1-8h-4L12 2z" />
          </svg>
          <span>Factions</span>
        </button>

        {/* Jouer — elevated centre bubble */}
        <button
          className={`${styles.navItem} ${styles.navPlay}`}
          onClick={() => setPlayStep(playStep === 'idle' ? 'mode' : 'idle')}
          aria-label="Jouer"
          aria-expanded={playStep !== 'idle'}
        >
          <div className={styles.playBubble}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden>
              <polygon points="6,3 21,12 6,21" />
            </svg>
          </div>
          <span>Jouer</span>
        </button>

        {/* Classement */}
        <button className={styles.navItem} disabled aria-label="Classement">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
            <path d="M6 9H4a2 2 0 0 0-2 2v9h20v-9a2 2 0 0 0-2-2h-2" />
            <path d="M8 9V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
            <line x1="12" y1="12" x2="12" y2="17" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <span>Classement</span>
        </button>

        {/* Profil */}
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
