import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainMenu.module.css';

export default function MainMenu() {
  const navigate = useNavigate();
  const [playOpen, setPlayOpen]   = useState(false);
  const [modeOpen, setModeOpen]   = useState<null | '2' | '4'>(null);

  function togglePlay() {
    setPlayOpen(v => !v);
    setModeOpen(null);
  }

  function toggleMode(m: '2' | '4') {
    setModeOpen(prev => prev === m ? null : m);
  }

  return (
    <div className={styles.container}>

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <header className={styles.logo}>
        <svg className={styles.logoMark} viewBox="0 0 32 32" fill="none" aria-hidden>
          <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <polygon points="16,8 24,13 24,21 16,26 8,21 8,13" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5"/>
          <circle cx="16" cy="16" r="3" fill="currentColor"/>
        </svg>
        <span className={styles.logoWord}>TACTIGON</span>
      </header>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className={styles.nav} aria-label="Menu principal">

        {/* ── PLAY (accordion root) ── */}
        <button
          className={`${styles.navItem} ${playOpen ? styles.navItemActive : ''}`}
          onClick={togglePlay}
          aria-expanded={playOpen}
        >
          <span className={styles.navGlyph} aria-hidden>◈</span>
          <span className={styles.navLabel}>JOUER</span>
          <span className={`${styles.navArrow} ${playOpen ? styles.navArrowOpen : ''}`} aria-hidden>›</span>
        </button>

        {/* Play sub-menu */}
        <div className={`${styles.subGroup} ${playOpen ? styles.subGroupOpen : ''}`} aria-hidden={!playOpen}>

          {/* 1v1 */}
          <button
            className={`${styles.subItem} ${modeOpen === '2' ? styles.subItemActive : ''}`}
            onClick={() => toggleMode('2')}
            tabIndex={playOpen ? 0 : -1}
            aria-expanded={modeOpen === '2'}
          >
            <span className={styles.subGlyph} aria-hidden>—</span>
            <span className={styles.subLabel}>1 vs 1</span>
            <span className={`${styles.navArrow} ${modeOpen === '2' ? styles.navArrowOpen : ''}`} aria-hidden>›</span>
          </button>

          <div className={`${styles.leafGroup} ${modeOpen === '2' ? styles.leafGroupOpen : ''}`}>
            <button className={styles.leafItem} onClick={() => navigate('/clan?players=2')} tabIndex={modeOpen === '2' ? 0 : -1}>
              <span className={styles.leafDot} aria-hidden/>
              <span>Normal</span>
            </button>
            <button className={styles.leafItem} onClick={() => navigate('/ranked?players=2')} tabIndex={modeOpen === '2' ? 0 : -1}>
              <span className={styles.leafDot} aria-hidden/>
              <span>Classé</span>
            </button>
          </div>

          {/* 4 players */}
          <button
            className={`${styles.subItem} ${modeOpen === '4' ? styles.subItemActive : ''}`}
            onClick={() => toggleMode('4')}
            tabIndex={playOpen ? 0 : -1}
            aria-expanded={modeOpen === '4'}
          >
            <span className={styles.subGlyph} aria-hidden>—</span>
            <span className={styles.subLabel}>4 Joueurs</span>
            <span className={`${styles.navArrow} ${modeOpen === '4' ? styles.navArrowOpen : ''}`} aria-hidden>›</span>
          </button>

          <div className={`${styles.leafGroup} ${modeOpen === '4' ? styles.leafGroupOpen : ''}`}>
            <button className={styles.leafItem} onClick={() => navigate('/clan?players=4')} tabIndex={modeOpen === '4' ? 0 : -1}>
              <span className={styles.leafDot} aria-hidden/>
              <span>Normal</span>
            </button>
            <button className={styles.leafItem} onClick={() => navigate('/ranked?players=4')} tabIndex={modeOpen === '4' ? 0 : -1}>
              <span className={styles.leafDot} aria-hidden/>
              <span>Classé</span>
            </button>
          </div>

        </div>

        {/* ── DISCOVER FACTIONS ── */}
        <button className={styles.navItem} onClick={() => navigate('/factions')}>
          <span className={styles.navGlyph} aria-hidden>◈</span>
          <span className={styles.navLabel}>DÉCOUVRIR LES FACTIONS</span>
        </button>

        {/* ── CUSTOMIZE FACTIONS — coming soon ── */}
        <button className={styles.navItem} disabled aria-disabled="true">
          <span className={styles.navGlyph} aria-hidden>◈</span>
          <span className={styles.navLabel}>PERSONNALISER</span>
          <span className={styles.soon}>bientôt</span>
        </button>

        {/* ── RANKING — coming soon ── */}
        <button className={styles.navItem} disabled aria-disabled="true">
          <span className={styles.navGlyph} aria-hidden>◈</span>
          <span className={styles.navLabel}>CLASSEMENT</span>
          <span className={styles.soon}>bientôt</span>
        </button>

        {/* ── SETTINGS — coming soon ── */}
        <button className={styles.navItem} disabled aria-disabled="true">
          <span className={styles.navGlyph} aria-hidden>◈</span>
          <span className={styles.navLabel}>PARAMÈTRES</span>
          <span className={styles.soon}>bientôt</span>
        </button>

      </nav>

      {/* ── Bottom dock ──────────────────────────────────────────── */}
      <footer className={styles.dock}>
        <span className={styles.dockTagline}>STRATÉGIE · TACTIQUE · CONQUÊTE</span>
        <div className={styles.dockActions}>
          <button className={styles.dockBtn} onClick={() => navigate('/clan?players=2')} title="Jouer 1v1" aria-label="Jouer 1v1">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><polygon points="6,4 20,12 6,20"/></svg>
          </button>
          <button className={styles.dockBtn} onClick={() => navigate('/factions')} title="Factions" aria-label="Factions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <polygon points="12,2 22,8 22,16 12,22 2,16 2,8"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </button>
          <button className={styles.dockBtn} onClick={() => navigate('/clan?players=4')} title="4 joueurs" aria-label="4 joueurs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <circle cx="8" cy="9" r="3"/>
              <circle cx="16" cy="9" r="3"/>
              <path d="M2 20c0-3 2.5-5 6-5h8c3.5 0 6 2 6 5"/>
            </svg>
          </button>
        </div>
      </footer>

    </div>
  );
}
