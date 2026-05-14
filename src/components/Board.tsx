import type { BoardState, Move } from '../game/types';
import Cell from './Cell';
import PieceComponent from './Piece';
import styles from './Board.module.css';

interface Props {
  gameState: BoardState;
  selectedPieceId: string | null;
  legalMoves: Move[];
  onCellClick: (x: number, y: number) => void;
}

export default function Board({ gameState, selectedPieceId, legalMoves, onCellClick }: Props) {
  const { layout, pieces } = gameState;
  const { cols, rows, walls } = layout;

  const wallSet = new Set(walls.map(w => `${w.x},${w.y}`));
  const legalSet = new Set(legalMoves.map(m => `${m.to.x},${m.to.y}`));
  const captureSet = new Set(legalMoves.filter(m => m.captures).map(m => `${m.to.x},${m.to.y}`));

  const CELL_SIZE = Math.min(64, Math.floor(Math.min(window.innerWidth * 0.9, window.innerHeight * 0.75) / Math.max(cols, rows)));

  return (
    <div
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
      }}
    >
      {Array.from({ length: rows }, (_, y) =>
        Array.from({ length: cols }, (_, x) => {
          const key = `${x},${y}`;
          const isWall = wallSet.has(key);
          const isLegal = legalSet.has(key);
          const isCapture = captureSet.has(key);
          const piecesHere = pieces.filter(p => p.position.x === x && p.position.y === y);

          return (
            <Cell
              key={key}
              x={x}
              y={y}
              size={CELL_SIZE}
              isWall={isWall}
              isLegal={isLegal}
              isCapture={isCapture}
              onClick={() => onCellClick(x, y)}
            >
              {piecesHere.map(piece => (
                <PieceComponent
                  key={piece.id}
                  piece={piece}
                  faction={gameState.factions[piece.owner]}
                  isSelected={piece.id === selectedPieceId}
                  isCurrentPlayer={piece.owner === gameState.currentPlayer}
                />
              ))}
            </Cell>
          );
        })
      )}
    </div>
  );
}
