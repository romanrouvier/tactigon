import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';

export default function Splash() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.container}>
      {/* Atmospheric layers */}
      <div className={styles.atmosphere} aria-hidden />
      <div className={styles.vignette} aria-hidden />

      {/* Floating particles */}
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 22 }, (_, i) => (
          <div key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      {/* Scan-line texture */}
      <div className={styles.scanlines} aria-hidden />

      <div className={`${styles.inner} ${visible ? styles.visible : ''}`}>

        {/* Hex logo mark */}
        <div className={styles.logoWrap}>
          <svg className={styles.hex} viewBox="0 0 80 80" fill="none" aria-hidden>
            <polygon
              points="40,4 74,22 74,58 40,76 6,58 6,22"
              stroke="url(#splashGold)"
              strokeWidth="1.5"
              fill="none"
            />
            <polygon
              points="40,16 62,28 62,52 40,64 18,52 18,28"
              stroke="url(#splashGold)"
              strokeWidth="0.8"
              fill="none"
              opacity="0.45"
            />
            <circle cx="40" cy="40" r="7" fill="url(#splashGold)" opacity="0.95" />
            <defs>
              <linearGradient id="splashGold" x1="6" y1="4" x2="74" y2="76" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#f0d890" />
                <stop offset="45%"  stopColor="#c9a84c" />
                <stop offset="100%" stopColor="#7a6030" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Eyebrow */}
        <p className={styles.eyebrow}>La Guerre des Factions</p>

        {/* Title */}
        <h1 className={styles.title}>TACTIQON</h1>

        {/* Ornamental divider */}
        <div className={styles.divider} aria-hidden>
          <span className={styles.divLine} />
          <span className={styles.divDiamond} />
          <span className={styles.divLine} />
        </div>

        {/* Lore */}
        <p className={styles.lore}>
          Quatre factions s'affrontent sur la grille obscure.<br />
          Une seule peut prétendre à la victoire.
        </p>

        {/* CTA */}
        <button className={styles.enter} onClick={() => navigate('/menu')}>
          <span>Entrer dans la Guerre</span>
          <svg className={styles.enterArrow} viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <p className={styles.hint}>TACTIQON · Jeu de Stratégie · 2025</p>
      </div>
    </div>
  );
}
