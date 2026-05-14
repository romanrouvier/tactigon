import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Simple.module.css';

export default function RankedSelect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const players = params.get('players') ?? '2';

  function go() { navigate(`/clan?players=${players}`); }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Type de partie</h1>
      <p className={styles.subtitle}>Placeholder — les deux options mènent au même endroit.</p>
      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={go}>Ranked</button>
        <button className={styles.btnPrimary} onClick={go}>Non ranked</button>
        <button className={styles.btnBack} onClick={() => navigate(`/mode?players=${players}`)}>
          ← Retour
        </button>
      </div>
    </div>
  );
}
