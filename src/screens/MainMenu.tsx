import { useNavigate } from 'react-router-dom';
import styles from './MainMenu.module.css';

interface NavItemProps {
  label: string;
  sub?: string;
  onClick: () => void;
}

function NavItem({ label, sub, onClick }: NavItemProps) {
  return (
    <button className={styles.navItem} onClick={onClick}>
      <span className={styles.navGlyph} aria-hidden>◈</span>
      <span className={styles.navContent}>
        <span className={styles.navLabel}>{label}</span>
        {sub && <span className={styles.navSub}>{sub}</span>}
      </span>
    </button>
  );
}

export default function MainMenu() {
  const navigate = useNavigate();

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

      {/* ── Left nav ─────────────────────────────────────────────── */}
      <nav className={styles.nav} aria-label="Menu principal">
        <NavItem label="JOUER 1V1"       onClick={() => navigate('/mode?players=2')} />
        <NavItem label="4 JOUEURS"        onClick={() => navigate('/mode?players=4')} />
        <NavItem label="FACTIONS"         onClick={() => navigate('/factions')} />
      </nav>

      {/* ── Bottom dock ──────────────────────────────────────────── */}
      <footer className={styles.dock}>
        <span className={styles.dockTagline}>STRATÉGIE · TACTIQUE · CONQUÊTE</span>

        <div className={styles.dockActions}>
          <button
            className={styles.dockBtn}
            onClick={() => navigate('/mode?players=2')}
            title="Jouer"
            aria-label="Jouer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <polygon points="6,4 20,12 6,20"/>
            </svg>
          </button>
          <button
            className={styles.dockBtn}
            onClick={() => navigate('/factions')}
            title="Factions"
            aria-label="Factions"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <polygon points="12,2 22,8 22,16 12,22 2,16 2,8"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </button>
          <button
            className={styles.dockBtn}
            onClick={() => navigate('/mode?players=4')}
            title="Multijoueur"
            aria-label="Multijoueur"
          >
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
