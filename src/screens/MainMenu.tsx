import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainMenu.module.css';

const CARD_W = 280;
const GAP    = 20;

interface CardDef {
  label: string;
  sub: string;
  available: boolean;
  action?: () => void;
}

export default function MainMenu() {
  const navigate = useNavigate();
  const [index, setIndex]       = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const dragStartX   = useRef<number | null>(null);
  const dragStartIdx = useRef(0);
  const didDrag      = useRef(false);

  const cards: CardDef[] = [
    {
      label:     'DÉCOUVRIR LES FACTIONS',
      sub:       'Explorer les 4 factions et leurs pièces',
      available: true,
      action:    () => navigate('/factions'),
    },
    {
      label:     'PERSONNALISER',
      sub:       'Modifier l\'apparence de vos factions',
      available: false,
    },
    {
      label:     'CLASSEMENT',
      sub:       'Voir les meilleurs joueurs',
      available: false,
    },
    {
      label:     'PARAMÈTRES',
      sub:       'Configurer le jeu',
      available: false,
    },
  ];

  function go(i: number) {
    setIndex(Math.max(0, Math.min(i, cards.length - 1)));
    setDragOffset(0);
  }

  function onPointerDown(e: React.PointerEvent) {
    dragStartX.current   = e.clientX;
    dragStartIdx.current = index;
    didDrag.current      = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 8) didDrag.current = true;
    setDragOffset(delta);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (didDrag.current) {
      if (delta < -(CARD_W * 0.25))      go(dragStartIdx.current + 1);
      else if (delta > (CARD_W * 0.25))  go(dragStartIdx.current - 1);
      else                               go(dragStartIdx.current);
    }
    dragStartX.current = null;
    setDragOffset(0);
    setDragging(false);
  }

  function onCardClick(i: number) {
    if (didDrag.current) return;
    if (i !== index) { go(i); return; }
    const card = cards[i];
    if (card.available && card.action) card.action();
  }

  const trackX = -(index * (CARD_W + GAP)) + dragOffset;

  return (
    <div className={styles.container}>

      {/* ── Logo ─────────────────────────────────────────────── */}
      <header className={styles.logo}>
        <svg className={styles.logoMark} viewBox="0 0 32 32" fill="none" aria-hidden>
          <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <polygon points="16,8 24,13 24,21 16,26 8,21 8,13" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5"/>
          <circle cx="16" cy="16" r="3" fill="currentColor"/>
        </svg>
        <span className={styles.logoWord}>TACTIGON</span>
      </header>

      {/* ── Carousel ─────────────────────────────────────────── */}
      <div
        className={styles.carousel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <div
          className={styles.track}
          style={{
            transform:  `translateX(calc(50% - ${CARD_W / 2}px + ${trackX}px))`,
            transition: dragging ? 'none' : 'transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {cards.map((card, i) => {
            const active = i === index;
            return (
              <div
                key={i}
                className={`${styles.card} ${active ? styles.cardActive : styles.cardInactive}`}
                style={{ width: CARD_W }}
                onClick={() => onCardClick(i)}
              >
                {/* Corner accents */}
                <span className={styles.cornerTL} aria-hidden />
                <span className={styles.cornerBR} aria-hidden />

                <p className={styles.cardLabel}>{card.label}</p>
                <p className={styles.cardSub}>{card.sub}</p>

                {!card.available && (
                  <span className={styles.cardSoon}>Bientôt</span>
                )}
                {card.available && active && (
                  <span className={styles.cardCta}>Explorer →</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dots ─────────────────────────────────────────────── */}
      <div className={styles.dots} role="tablist" aria-label="Navigation">
        {cards.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => go(i)}
            aria-label={cards[i].label}
            role="tab"
            aria-selected={i === index}
          />
        ))}
      </div>

      {/* ── Play frame ───────────────────────────────────────── */}
      <div className={styles.playFrame}>
        <span className={styles.playCornerTL} aria-hidden />
        <span className={styles.playCornerBR} aria-hidden />
        <button className={styles.playBtn} onClick={() => navigate('/mode?players=2')}>
          <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <polygon points="5,3 21,12 5,21"/>
          </svg>
          JOUER
        </button>
      </div>

    </div>
  );
}
