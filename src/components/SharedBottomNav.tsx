import { useNavigate } from 'react-router-dom';
import styles from './SharedBottomNav.module.css';

interface Props {
  activeTab: 'home' | 'factions' | 'profil';
  playOpen: boolean;
  onTogglePlay: () => void;
}

export default function SharedBottomNav({ activeTab, playOpen, onTogglePlay }: Props) {
  const navigate = useNavigate();

  return (
    <nav className={styles.bottomNav} aria-label="Navigation principale">

      {/* Accueil */}
      <button
        className={`${styles.navItem} ${activeTab === 'home' ? styles.navActive : ''}`}
        onClick={() => navigate('/menu')}
        aria-label="Accueil"
        aria-current={activeTab === 'home' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
          <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" />
        </svg>
        <span>Accueil</span>
      </button>

      {/* Factions */}
      <button
        className={`${styles.navItem} ${activeTab === 'factions' ? styles.navActive : ''}`}
        onClick={() => navigate('/factions')}
        aria-label="Factions"
        aria-current={activeTab === 'factions' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
          <path d="M12 2L8 6H4l1 8 7 8 7-8 1-8h-4L12 2z" />
        </svg>
        <span>Factions</span>
      </button>

      {/* Play FAB */}
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

      {/* Classement */}
      <button className={styles.navItem} disabled aria-label="Classement">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
          <path d="M6 9H4a2 2 0 0 0-2 2v9h20v-9a2 2 0 0 0-2-2h-2" />
          <path d="M8 9V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
          <line x1="12" y1="12" x2="12" y2="17" /><line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <span>Classement</span>
      </button>

      {/* Profil */}
      <button
        className={`${styles.navItem} ${activeTab === 'profil' ? styles.navActive : ''}`}
        onClick={() => navigate('/profil')}
        aria-label="Profil"
        aria-current={activeTab === 'profil' ? 'page' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        <span>Profil</span>
      </button>

    </nav>
  );
}
