import React, { FC, useEffect, useState } from "react";
import { Board } from "@/models/board/Board";
import { Cell } from "@/models/board/Cell";
import { Player } from "@/models/Player";
import { useGameLogic } from "@/hooks/useGameLogic";
import BoardHeader from "@/components/board/BoardHeader";
import BoardGrid from "@/components/board/BoardGrid";

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

  return (
    <div>
      <BoardHeader currentPlayer={currentPlayer} isFlipped={isFlipped} toggleFlip={() => setIsFlipped(!isFlipped)} />
      <BoardGrid
        cells={board.cells}
        selectedCell={selectedCell}
        isFlipped={isFlipped}
        isGameOver={isGameOver}
        onCellClick={(clicked) => clickCell(clicked, isGameOver)}
      />
    </div>
  );
};

export default BoardComponent;
