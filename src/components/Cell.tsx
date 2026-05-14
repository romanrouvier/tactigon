import type { ReactNode } from 'react';
import styles from './Cell.module.css';

interface Props {
  x: number;
  y: number;
  size: number;
  isWall: boolean;
  isLegal: boolean;
  isCapture: boolean;
  onClick: () => void;
  children?: ReactNode;
}

export default function Cell({ x, y, isWall, isLegal, isCapture, onClick, children, size }: Props) {
  const isDark = (x + y) % 2 === 1;

  let className = styles.cell;
  if (isWall) className += ` ${styles.wall}`;
  else if (isDark) className += ` ${styles.dark}`;
  else className += ` ${styles.light}`;

  if (isCapture) className += ` ${styles.capture}`;
  else if (isLegal) className += ` ${styles.legal}`;

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
