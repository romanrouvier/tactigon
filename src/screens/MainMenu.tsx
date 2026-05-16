import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayOverlay from '../components/PlayOverlay';
import styles from './MainMenu.module.css';

// ── Main component ────────────────────────────────────────────────────────────
export default function MainMenu() {
  const navigate  = useNavigate();
  const [playOpen, setPlayOpen] = useState(false);

  return (
    <div className={styles.container}>

      {/* ── Top header ──────────────────────────────────────── */}
      <header className={styles.topHeader}>
        <button className={styles.headerIcon} aria-label="Paramètres">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <div className={styles.headerCenter}>
          <div className={styles.avatar} aria-label="Avatar">O</div>
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

      {/* ── Play overlay ────────────────────────────────────── */}
      {playOpen && <PlayOverlay onClose={() => setPlayOpen(false)} />}

      {/* ── Bottom navigation ─────────────────────────────────── */}
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
          className={`${styles.navPlay} ${playOpen ? styles.navPlayOpen : ''}`}
          onClick={() => setPlayOpen(v => !v)}
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
