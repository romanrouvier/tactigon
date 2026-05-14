import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { factions } from '../data/factions';
import styles from './ClanSelect.module.css';
import type { PlayerId } from '../game/types';

export default function ClanSelect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const totalPlayers = params.get('players') === '4' ? 4 : 2;

  const [step, setStep] = useState<number>(1); // 1..totalPlayers
  const [choices, setChoices] = useState<Record<number, number | null>>(
    Object.fromEntries(Array.from({ length: totalPlayers }, (_, i) => [i + 1, null]))
  );

  const currentChoice = choices[step] ?? null;

  function setCurrentChoice(id: number) {
    setChoices(prev => ({ ...prev, [step]: id }));
  }

  function handleConfirm() {
    if (currentChoice === null) return;
    if (step < totalPlayers) {
      setStep(s => s + 1);
    } else {
      const factionIds = Object.fromEntries(
        Object.entries(choices).map(([pid, fid]) => [Number(pid), fid])
      ) as Record<PlayerId, number>;
      navigate('/game', { state: { factionIds, players: totalPlayers } });
    }
  }

  function handleBack() {
    if (step === 1) navigate(`/ranked?players=${totalPlayers}`);
    else setStep(s => s - 1);
  }

  const nextLabel = step < totalPlayers ? `Joueur ${step + 1} →` : 'Lancer la partie →';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Choix de faction</h1>
      <p className={styles.player}>
        Joueur {step} / {totalPlayers} — choisissez votre faction
      </p>

      {/* Progress dots */}
      <div className={styles.steps}>
        {Array.from({ length: totalPlayers }, (_, i) => {
          const pid = i + 1;
          const chosen = choices[pid];
          const faction = chosen ? factions.find(f => f.id === chosen) : null;
          return (
            <div
              key={pid}
              className={`${styles.stepDot} ${pid === step ? styles.stepActive : ''} ${pid < step ? styles.stepDone : ''}`}
              style={faction ? { borderColor: faction.color, background: faction.color + '44' } : {}}
            >
              {pid}
            </div>
          );
        })}
      </div>

      <div className={styles.grid}>
        {factions.map(f => (
          <button
            key={f.id}
            className={`${styles.card} ${currentChoice === f.id ? styles.selected : ''}`}
            style={{ '--faction-color': f.color } as React.CSSProperties}
            onClick={() => setCurrentChoice(f.id)}
          >
            <span className={styles.dot} style={{ background: f.color, color: f.color }} />
            <span className={styles.name}>{f.name}</span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnPrimary}
          onClick={handleConfirm}
          disabled={currentChoice === null}
        >
          {nextLabel}
        </button>
        <button className={styles.btnBack} onClick={handleBack}>
          ← Retour
        </button>
      </div>
    </div>
  );
}
