import React, { FC, useEffect, useState } from "react";
import { Board } from "@/models/board/Board";
import { Cell } from "@/models/board/Cell";
import { Player } from "@/models/Player";
import { useGameLogic } from "@/hooks/useGameLogic";
import BoardHeader from "@/components/board/BoardHeader";
import BoardGrid from "@/components/board/BoardGrid";
import { Figure } from "@/models/figures/Figure";
import { FigureNames } from "@/models/figures/Figure";

export interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player | null;
  swapPlayer: () => void;
  promotionCell: Cell | null;
  setPromotionCell: (cell: Cell | null) => void;
  fenHistory: string[];
  isGameOver: boolean;
  setIsGameOver: (value: boolean) => void;
  setGameOverMessage: (msg: string | null) => void;
  selectedCell: Cell | null;
  setSelectedCell: (cell: Cell | null) => void;
  flip?: boolean;
  onMoveComplete: (
    from: Cell,
    to: Cell,
    captured: Figure | null,
    promotion?: FigureNames,
    movedFigure?: Figure
  ) => void;
}

const BoardComponent: FC<BoardProps> = ({
  board,
  setBoard,
  currentPlayer,
  swapPlayer,
  promotionCell,
  setPromotionCell,
  fenHistory,
  isGameOver,
  setIsGameOver,
  setGameOverMessage,
  selectedCell,
  setSelectedCell,
  flip = false,
  onMoveComplete,
}) => {
  const [isFlipped, setIsFlipped] = useState(flip);

  useEffect(() => {
    setIsFlipped(flip);
  }, [flip]);

  const { clickCell, updateBoard } = useGameLogic({
    board,
    setBoard,
    currentPlayer,
    swapPlayer,
    selectedCell,
    setSelectedCell,
    promotionHandler: setPromotionCell,
    fenHistory,
    setGameOver: setIsGameOver,
    setGameOverMessage,
    onMoveComplete,
  });

  useEffect(() => {
    board.highlightCells(selectedCell);
    updateBoard();
  }, [selectedCell]);

  return (
    <div>
      <BoardHeader
        currentPlayer={currentPlayer}
        isFlipped={isFlipped}
        toggleFlip={() => setIsFlipped(!isFlipped)}
      />
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