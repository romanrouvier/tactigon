import type { Faction, Piece } from '../game/types';
import styles from './Piece.module.css';

interface Props {
  piece: Piece;
  faction: Faction;
  isSelected: boolean;
  isCurrentPlayer: boolean;
}

function PieceShape({ type }: { type: Piece['type'] }) {
  switch (type) {
    case 'pawn':
      return <circle cx="20" cy="22" r="10" />;
    case 'inter1':
      return <polygon points="20,8 30,32 10,32" />;
    case 'inter2':
      return <rect x="10" y="10" width="20" height="20" />;
    case 'inter3':
      return <polygon points="20,8 32,20 20,32 8,20" />;
    case 'king':
      return (
        <g>
          <polygon points="20,6 24,16 35,16 27,23 30,34 20,27 10,34 13,23 5,16 16,16" />
        </g>
      );
  }
}

export default function PieceComponent({ piece, faction, isSelected, isCurrentPlayer }: Props) {
  const factionPiece = faction.pieces.find(fp => fp.type === piece.type);
  const imageUrl = factionPiece?.imageUrl;

  const cls = [
    styles.piece,
    isSelected ? styles.selected : '',
    isCurrentPlayer ? styles.active : '',
  ].join(' ');

  if (imageUrl) {
    return (
      <div
        className={cls}
        style={{ '--faction-color': faction.color } as React.CSSProperties}
      >
        <img
          src={imageUrl}
          alt={piece.type}
          className={styles.pieceImg}
          draggable={false}
        />
        {/* Faction-color ring to stay identifiable */}
        <span
          className={styles.colorRing}
          style={{ borderColor: faction.color }}
        />
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 40 40"
      className={cls}
      style={{ '--faction-color': faction.color } as React.CSSProperties}
    >
      <PieceShape type={piece.type} />
    </svg>
  );
}
