// src/components/board/Board.tsx
import React, { FC, useEffect, useState } from "react";
import { Board } from "@/models/board/Board";
import { Cell } from "@/models/board/Cell";
import { Player } from "@/models/Player";
import { useGameLogic } from "@/hooks/useGameLogic";
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

  const { clickCell } = useGameLogic({
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

  // Підсвічуємо клітини, не копіюємо дошку
  useEffect(() => {
    board.highlightCells(selectedCell);
  }, [board, selectedCell]);

  return (
    <BoardGrid
      cells={board.cells}
      selectedCell={selectedCell}
      isFlipped={isFlipped}
      isGameOver={isGameOver}
      onCellClick={(cell) => clickCell(cell, isGameOver)}
    />
  );
};

export default BoardComponent;
