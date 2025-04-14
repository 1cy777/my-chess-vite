import { useCallback } from "react";
import { Board } from "@/models/board/Board";
import { Player } from '@/models/Player';
import { Cell } from '@/models/board/Cell';

interface UseGameLogicParams {
  board: Board;
  setBoard: (b: Board) => void;
  currentPlayer: Player | null;
  swapPlayer: () => void;
  selectedCell: Cell | null;
  setSelectedCell: (cell: Cell | null) => void;
  promotionHandler: (cell: Cell) => void;
  fenHistory: string[];
  setFenHistory: (fens: string[]) => void;
  setGameOver: (isOver: boolean) => void;
  setGameOverMessage: (msg: string) => void;
}

export const useGameLogic = ({
  board,
  setBoard,
  currentPlayer,
  swapPlayer,
  selectedCell,
  setSelectedCell,
  promotionHandler,
  fenHistory,
  setFenHistory,
  setGameOver,
  setGameOverMessage,
}: UseGameLogicParams) => {
  const updateBoard = useCallback(() => {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }, [board, setBoard]);

  const isThreefoldRepetition = (fens: string[]): boolean => {
    const positionCounts: Record<string, number> = {};
    for (const fen of fens) {
      const pos = fen.split(" ").slice(0, 4).join(" ");
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
      if (positionCounts[pos] >= 3) return true;
    }
    return false;
  };

  const clickCell = (cell: Cell, isGameOver: boolean) => {
    if (isGameOver) return;

    if (
      selectedCell &&
      selectedCell !== cell &&
      selectedCell.figure &&
      cell.available
    ) {
      selectedCell.moveFigure(cell, (promotionTarget: Cell) => {
        promotionHandler(promotionTarget);
      });

      updateBoard();

      if (currentPlayer) {
        const newFEN = board.generateFEN(currentPlayer.color);
        const updatedFens = [...fenHistory, newFEN];
        setFenHistory(updatedFens);

        if (isThreefoldRepetition(updatedFens)) {
          setGameOverMessage("Нічия через триразове повторення позиції");
          setGameOver(true);
          return;
        }

        const drawReason = board.checkForDrawConditions();
        if (drawReason) {
          setGameOverMessage(drawReason);
          setGameOver(true);
          return;
        }
      }

      swapPlayer();
      setSelectedCell(null);
    } else {
      if (
        cell.figure?.color === currentPlayer?.color &&
        board.hasAvailableMoves(cell)
      ) {
        setSelectedCell(cell);
      } else if (!cell.available) {
        return;
      } else {
        setSelectedCell(null);
      }
    }
  };

  return { clickCell, updateBoard };
};