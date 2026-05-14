import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';

export default function Splash() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>La Guerre des Factions</p>
        <h1 className={styles.title}>Dark Grid</h1>
        <div className={styles.divider}>
          <span className={styles.dividerDiamond} />
        </div>
        <p className={styles.lore}>
          Quatre factions s'affrontent sur la grille obscure.<br />
          Une seule peut prétendre à la victoire.
        </p>
        <button className={styles.cta} onClick={() => navigate('/menu')}>
          <span>Participer à la guerre des factions</span>
        </button>
      </div>
    </div>
  );
}
