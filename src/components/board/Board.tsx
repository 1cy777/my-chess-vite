import React, { FC, useEffect, useState } from "react";
import { Board } from "@/models/board/Board";
import CellComponent from "@/components/board/Cell";
import { Cell } from "@/models/board/Cell";
import { Player } from "@/models/Player";
import { useGameLogic } from "@/hooks/useGameLogic";

interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player | null;
  swapPlayer: () => void;
  promotionCell: Cell | null;
  setPromotionCell: (cell: Cell) => void;
  fenHistory: string[];
  setFenHistory: (fens: string[]) => void;
  isGameOver: boolean;
  setIsGameOver: (value: boolean) => void;
  setGameOverMessage: (msg: string | null) => void;
}

const BoardComponent: FC<BoardProps> = ({
  board,
  setBoard,
  currentPlayer,
  swapPlayer,
  promotionCell,
  setPromotionCell,
  fenHistory,
  setFenHistory,
  isGameOver,
  setIsGameOver,
  setGameOverMessage,
}) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const { clickCell, updateBoard } = useGameLogic({
    board,
    setBoard,
    currentPlayer,
    swapPlayer,
    selectedCell,
    setSelectedCell,
    promotionHandler: setPromotionCell,
    fenHistory,
    setFenHistory,
    setGameOver: setIsGameOver,
    setGameOverMessage,
  });

  useEffect(() => {
    board.highlightCells(selectedCell);
    updateBoard();
  }, [selectedCell]);

  const orderedRows = isFlipped ? [...board.cells].reverse() : board.cells;
  const columnLabels = isFlipped
    ? ["h", "g", "f", "e", "d", "c", "b", "a"]
    : ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div>
      <h3>Хід - {currentPlayer?.color}</h3>
      <button onClick={() => setIsFlipped(!isFlipped)}>
        🔄 Розвернути дошку
      </button>

      <div className="board-wrapper">
        <div className="board">
          {orderedRows.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
              <div className="row-label">
                {isFlipped ? rowIndex + 1 : 8 - rowIndex}
              </div>

              {(isFlipped ? [...row].reverse() : row).map((cell) => (
                <CellComponent
                  key={cell.id}
                  cell={cell}
                  selected={
                    selectedCell?.x === cell.x && selectedCell?.y === cell.y
                  }
                  click={(clicked) => clickCell(clicked, isGameOver)}
                />
              ))}
            </div>
          ))}

          <div className="column-labels">
            {columnLabels.map((label, i) => (
              <div key={i} className="column-label">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardComponent; 