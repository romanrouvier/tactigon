import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainMenu.module.css';

type PlayStep = 'idle' | 'mode' | 'rank';

const NAV_LINKS = [
  { label: 'Accueil',     path: null,         active: true,  soon: false },
  { label: 'Factions',    path: '/factions',  active: false, soon: false },
  { label: 'Personnaliser', path: null,        active: false, soon: true  },
  { label: 'Classement',  path: null,         active: false, soon: true  },
  { label: 'Paramètres',  path: null,         active: false, soon: true  },
];

const FEATURE_CARDS = [
  {
    icon: '⚔',
    title: 'Découvrir les Factions',
    desc: 'Explorez les 4 factions uniques, leurs pièces et leurs stratégies exclusives.',
    path: '/factions',
    available: true,
    delay: '0ms',
  },
  {
    icon: '✦',
    title: 'Personnaliser',
    desc: 'Forgez votre légende. Modifiez l\'apparence de vos factions et pièces.',
    path: null,
    available: false,
    delay: '80ms',
  },
  {
    icon: '◈',
    title: 'Classement',
    desc: 'Prouvez votre suprématie. Affrontez les meilleurs stratèges du monde.',
    path: null,
    available: false,
    delay: '160ms',
  },
];

export default function MainMenu() {
  const navigate = useNavigate();
  const [playStep, setPlayStep] = useState<PlayStep>('idle');
  const [playMode, setPlayMode] = useState<'2' | '4'>('2');

  return (
    <div className={styles.container}>

      {/* ── Atmospheric background ───────────────────────────── */}
      <div className={styles.bg}        aria-hidden />
      <div className={styles.bgGlow1}   aria-hidden />
      <div className={styles.bgGlow2}   aria-hidden />
      <div className={styles.bgVignette} aria-hidden />
      <div className={styles.scanlines} aria-hidden />

      {/* ── Floating particles ───────────────────────────────── */}
      <div className={styles.particles} aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className={styles.particle} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>

      {/* ── Top navigation ──────────────────────────────────── */}
      <nav className={styles.nav} aria-label="Navigation principale">
        <div className={styles.navLogo}>
          <svg className={styles.navHex} viewBox="0 0 32 32" fill="none" aria-hidden>
            <polygon
              points="16,2 30,10 30,22 16,30 2,22 2,10"
              stroke="url(#navGold)"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="16" cy="16" r="3.5" fill="url(#navGold)" />
            <defs>
              <linearGradient id="navGold" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#f0d890" />
                <stop offset="100%" stopColor="#7a6030" />
              </linearGradient>
            </defs>
          </svg>
          <span className={styles.navBrand}>TACTIQON</span>
        </div>

        <div className={styles.navLinks}>
          {NAV_LINKS.map(item => (
            <button
              key={item.label}
              className={`${styles.navLink} ${item.active ? styles.navActive : ''} ${item.soon ? styles.navSoon : ''}`}
              onClick={() => item.path && !item.soon && navigate(item.path)}
              disabled={item.soon}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.label}
              {item.soon && <span className={styles.soonBadge} aria-label="bientôt disponible">·</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Main content ────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Hero */}
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

        {/* Feature cards */}
        <section className={styles.cards} aria-label="Sections du jeu">
          {FEATURE_CARDS.map((card, i) => (
            <div
              key={i}
              className={`${styles.card} ${!card.available ? styles.cardLocked : ''}`}
              style={{ '--delay': card.delay } as React.CSSProperties}
              onClick={() => card.available && card.path && navigate(card.path)}
              role={card.available ? 'button' : undefined}
              tabIndex={card.available ? 0 : undefined}
              onKeyDown={e => {
                if (card.available && card.path && (e.key === 'Enter' || e.key === ' ')) {
                  navigate(card.path);
                }
              }}
            >
              {/* Hover glow spot */}
              <div className={styles.cardSpot} aria-hidden />

              <div className={styles.cardIconWrap}>
                <span className={styles.cardIcon} aria-hidden>{card.icon}</span>
              </div>

              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.desc}</p>

              <div className={styles.cardFooter}>
                {card.available
                  ? <span className={styles.cardCta}>Explorer <span aria-hidden>→</span></span>
                  : <span className={styles.cardSoon}>Bientôt disponible</span>
                }
              </div>
            </div>
          ))}
        </section>

        {/* Play CTA */}
        <section className={styles.cta} aria-label="Lancer une partie">

          {playStep === 'idle' && (
            <>
              <button className={styles.playBtn} onClick={() => setPlayStep('mode')}>
                <span className={styles.playBtnBg} aria-hidden />
                <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <polygon points="6,3 21,12 6,21" />
                </svg>
                <span>Jouer</span>
              </button>
              <p className={styles.playHint}>Commencez une nouvelle partie ou continuez votre conquête</p>
            </>
          )}

          {playStep === 'mode' && (
            <div className={styles.panel}>
              <p className={styles.panelLabel}>Choisissez votre mode</p>
              <div className={styles.panelGrid}>
                <button className={styles.panelCard} onClick={() => { setPlayMode('2'); setPlayStep('rank'); }}>
                  <span className={styles.panelIcon} aria-hidden>⚔</span>
                  <span className={styles.panelTitle}>Duel 1v1</span>
                  <span className={styles.panelDesc}>Deux joueurs, grille 7×8</span>
                </button>
                <button className={styles.panelCard} onClick={() => { setPlayMode('4'); setPlayStep('rank'); }}>
                  <span className={styles.panelIcon} aria-hidden>◆</span>
                  <span className={styles.panelTitle}>Choc 1v1v1v1</span>
                  <span className={styles.panelDesc}>Quatre joueurs, grille 13×13</span>
                </button>
              </div>
              <button className={styles.panelBack} onClick={() => setPlayStep('idle')}>← Retour</button>
            </div>
          )}

          {playStep === 'rank' && (
            <div className={styles.panel}>
              <p className={styles.panelLabel}>Type de partie</p>
              <div className={styles.panelGrid}>
                <button className={styles.panelCard} onClick={() => navigate(`/clan?players=${playMode}`)}>
                  <span className={styles.panelIcon} aria-hidden>🎮</span>
                  <span className={styles.panelTitle}>Normal</span>
                  <span className={styles.panelDesc}>Partie libre, sans enjeu de classement</span>
                </button>
                <button className={styles.panelCard} onClick={() => navigate(`/ranked?players=${playMode}`)}>
                  <span className={styles.panelIcon} aria-hidden>🏆</span>
                  <span className={styles.panelTitle}>Classé</span>
                  <span className={styles.panelDesc}>Affrontez les meilleurs stratèges</span>
                </button>
              </div>
              <button className={styles.panelBack} onClick={() => setPlayStep('mode')}>← Retour</button>
            </div>
          )}

        </section>
      </main>

      {/* ── Footer (desktop only) ───────────────────────────── */}
      <footer className={styles.footer}>
        <span>TACTIQON · v0.1 · Jeu de stratégie au tour par tour</span>
      </footer>

      {/* ── Mobile bottom navigation ─────────────────────────── */}
      <nav className={styles.mobileBottomNav} aria-label="Navigation mobile">
        <button className={`${styles.mobileNavItem} ${styles.mobileNavActive}`} aria-label="Accueil">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M3 12L12 3l9 9" /><path d="M9 21V12h6v9" />
          </svg>
          <span>Accueil</span>
        </button>
        <button className={styles.mobileNavItem} onClick={() => navigate('/factions')} aria-label="Factions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Factions</span>
        </button>
        <button
          className={`${styles.mobileNavItem} ${styles.mobileNavPlay}`}
          onClick={() => setPlayStep(playStep === 'idle' ? 'mode' : 'idle')}
          aria-label="Jouer"
        >
          <div className={styles.mobilePlayBubble}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <polygon points="6,3 21,12 6,21" />
            </svg>
          </div>
          <span>Jouer</span>
        </button>
        <button className={styles.mobileNavItem} disabled aria-label="Paramètres">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
          <span>Réglages</span>
        </button>
      </nav>

    </div>
  );
}
