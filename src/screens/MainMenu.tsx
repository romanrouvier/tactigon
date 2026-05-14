import { useNavigate } from 'react-router-dom';
import styles from './MainMenu.module.css';

export default function MainMenu() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Stratégie · Tactique · Conquête</span>
        <h1 className={styles.title}>Dark Grid</h1>
      </div>
      <nav className={styles.nav}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/mode?players=2')}>
          Jouer 1v1
        </button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/mode?players=4')}>
          Jouer 1v1v1v1
        </button>
        <button className={`${styles.btn} ${styles.secondary}`} onClick={() => navigate('/factions')}>
          Voir les factions
        </button>
      </nav>
    </div>
  );
}
