import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Simple.module.css';

export default function ModeSelect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const players = params.get('players') ?? '2';
  const label = players === '4' ? '1v1v1v1' : '1v1';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mode de jeu</h1>
      <p className={styles.info}>Mode sélectionné : <strong>{label}</strong></p>
      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={() => navigate(`/ranked?players=${players}`)}>
          Continuer →
        </button>
        <button className={styles.btnBack} onClick={() => navigate('/menu')}>
          ← Retour
        </button>
      </div>
    </div>
  );
}
