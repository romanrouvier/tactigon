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

type PlayStep = 'idle' | 'mode' | 'rank';

export default function MainMenu() {
  const navigate = useNavigate();

  // ── Carousel state ───────────────────────────────────────
  const [index, setIndex]           = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging]     = useState(false);

  const dragStartX   = useRef<number | null>(null);
  const dragStartIdx = useRef(0);
  const didDrag      = useRef(false);

  // ── Play flow state ──────────────────────────────────────
  const [playStep, setPlayStep] = useState<PlayStep>('idle');
  const [playMode, setPlayMode] = useState<'2' | '4'>('2');

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

  // ── Pointer handlers ─────────────────────────────────────
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

    if (!didDrag.current) {
      // It was a tap — find which card sits under the pointer
      const el      = document.elementFromPoint(e.clientX, e.clientY);
      const cardEl  = el?.closest('[data-cardidx]');
      const cardIdx = cardEl ? parseInt(cardEl.getAttribute('data-cardidx')!) : -1;

      if (cardIdx >= 0 && cardIdx < cards.length) {
        if (cardIdx !== index) {
          go(cardIdx);
        } else {
          const card = cards[cardIdx];
          if (card.available && card.action) card.action();
        }
      }
    } else {
      // It was a drag — commit swipe
      if (delta < -(CARD_W * 0.25))     go(dragStartIdx.current + 1);
      else if (delta > (CARD_W * 0.25)) go(dragStartIdx.current - 1);
      else                              go(dragStartIdx.current);
    }

    dragStartX.current = null;
    setDragOffset(0);
    setDragging(false);
  }

  const trackX = -(index * (CARD_W + GAP)) + dragOffset;

  return (
    <div className={styles.container}>

      {/* ── Logo ───────────────────────────────────────────── */}
      <header className={styles.logo}>
        <svg className={styles.logoMark} viewBox="0 0 32 32" fill="none" aria-hidden>
          <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <polygon points="16,8 24,13 24,21 16,26 8,21 8,13" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5"/>
          <circle cx="16" cy="16" r="3" fill="currentColor"/>
        </svg>
        <span className={styles.logoWord}>TACTIGON</span>
      </header>

      {/* ── Carousel ───────────────────────────────────────── */}
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
          {cards.map((card, i) => (
            <div
              key={i}
              data-cardidx={i}
              className={`${styles.card} ${i === index ? styles.cardActive : styles.cardInactive}`}
              style={{ width: CARD_W }}
            >
              <span className={styles.cornerTL} aria-hidden />
              <span className={styles.cornerBR} aria-hidden />
              <p className={styles.cardLabel}>{card.label}</p>
              <p className={styles.cardSub}>{card.sub}</p>
              {!card.available && <span className={styles.cardSoon}>Bientôt</span>}
              {card.available && i === index && <span className={styles.cardCta}>Explorer →</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Dots ───────────────────────────────────────────── */}
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

      {/* ── Play frame ─────────────────────────────────────── */}
      <div className={styles.playFrame}>
        <span className={styles.playCornerTL} aria-hidden />
        <span className={styles.playCornerBR} aria-hidden />

        {/* Step 1 — JOUER */}
        {playStep === 'idle' && (
          <button className={styles.playBtn} onClick={() => setPlayStep('mode')}>
            <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <polygon points="5,3 21,12 5,21"/>
            </svg>
            JOUER
          </button>
        )}

        {/* Step 2 — Choose mode */}
        {playStep === 'mode' && (
          <div className={styles.playMenu}>
            <button className={styles.playBack} onClick={() => setPlayStep('idle')}>
              ← Retour
            </button>
            <div className={styles.playOptions}>
              <button
                className={styles.playOption}
                onClick={() => { setPlayMode('2'); setPlayStep('rank'); }}
              >
                Duel 1v1
              </button>
              <button
                className={styles.playOption}
                onClick={() => { setPlayMode('4'); setPlayStep('rank'); }}
              >
                1v1v1v1 Choc
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Choose ranked */}
        {playStep === 'rank' && (
          <div className={styles.playMenu}>
            <button className={styles.playBack} onClick={() => setPlayStep('mode')}>
              ← Retour
            </button>
            <div className={styles.playOptions}>
              <button
                className={styles.playOption}
                onClick={() => navigate(`/clan?players=${playMode}`)}
              >
                Normal
              </button>
              <button
                className={styles.playOption}
                onClick={() => navigate(`/ranked?players=${playMode}`)}
              >
                Classé
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
