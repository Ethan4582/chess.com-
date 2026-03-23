'use client'

import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';

/**
 * ChessBoard component - mirrors original chessgame.js rendering and move logic exactly.
 *
 * Original logic reference (chessgame.js):
 * - pieceElement.draggable = playerRole === square.color
 * - dragstart: sets source {row, col}
 * - drop: calls handleMove(source, target)  
 * - handleMove: converts to algebraic {from, to, promotion:'q'}, emits makeMove
 * - Board flips via CSS class 'flipped' when playerRole === 'b'
 * - Pieces inside flipped board get transform: rotate(180deg)
 */

// ─── Types ───
interface ChessBoardProps {
  fen: string;
  onMove: (move: { from: string; to: string; promotion: string }) => void;
  playerRole: 'w' | 'b' | 'spectator' | null;
}

// ─── Piece Unicode Map (exact copy from chessgame.js getPieceUnicode) ───
function getPieceUnicode(type: string, color: string): string {
  const pieces: Record<string, Record<string, string>> = {
    p: { w: '♙', b: '♟' },
    r: { w: '♖', b: '♜' },
    n: { w: '♘', b: '♞' },
    b: { w: '♗', b: '♝' },
    q: { w: '♕', b: '♛' },
    k: { w: '♔', b: '♚' },
  };
  return pieces[type]?.[color] || '';
}

export default function ChessBoard({ fen, onMove, playerRole }: ChessBoardProps) {
  const [dragSource, setDragSource] = useState<{ row: number; col: number } | null>(null);

  // Parse board from FEN (mirrors: const board = chess.board())
  const chess = new Chess(fen);
  const board = chess.board();

  // Convert row/col to algebraic notation (exact copy from chessgame.js handleMove)
  const toAlgebraic = (row: number, col: number): string =>
    `${String.fromCharCode(97 + col)}${8 - row}`;

  /**
   * handleMove - mirrors original chessgame.js:
   * const move = {
   *   from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
   *   to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
   *   promotion: "q"
   * }
   * socket.emit("makeMove", move);
   */
  const handleMove = useCallback(
    (source: { row: number; col: number }, target: { row: number; col: number }) => {
      const move = {
        from: toAlgebraic(source.row, source.col),
        to: toAlgebraic(target.row, target.col),
        promotion: 'q',
      };
      onMove(move);
    },
    [onMove]
  );

  // Board is flipped when player is black (mirrors: if (playerRole === "b") boardElement.classList.add("flipped"))
  const isFlipped = playerRole === 'b';

  return (
    <div className={`chessboard${isFlipped ? ' flipped' : ''}`}>
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {
          const isLight = (rowIndex + colIndex) % 2 === 0;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`square ${isLight ? 'light' : 'dark'}`}
              data-row={rowIndex}
              data-col={colIndex}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragSource) {
                  handleMove(dragSource, { row: rowIndex, col: colIndex });
                  setDragSource(null);
                }
              }}
            >
              {square && (
                <div
                  className={`piece ${square.color === 'w' ? 'white' : 'black'}`}
                  // Only the correct player can drag their own pieces
                  // Mirrors: pieceElement.draggable = playerRole === square.color
                  draggable={playerRole === square.color}
                  onDragStart={(e) => {
                    if (playerRole !== square.color) {
                      e.preventDefault();
                      return;
                    }
                    setDragSource({ row: rowIndex, col: colIndex });
                    e.dataTransfer.setData('text/plain', '');
                  }}
                  onDragEnd={() => {
                    setDragSource(null);
                  }}
                >
                  {getPieceUnicode(square.type, square.color)}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
