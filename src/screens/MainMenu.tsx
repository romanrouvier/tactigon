import { useState } from 'react';
import PlayOverlay from '../components/PlayOverlay';
import SharedBottomNav from '../components/SharedBottomNav';
import styles from './MainMenu.module.css';

// ── Main component ────────────────────────────────────────────────────────────
export default function MainMenu() {
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
      <SharedBottomNav
        activeTab="home"
        playOpen={playOpen}
        onTogglePlay={() => setPlayOpen(v => !v)}
      />
    </div>
  );
}
