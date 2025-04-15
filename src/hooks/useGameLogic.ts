import { useCallback } from "react";
import { Board } from "@/models/board/Board";
import { Player } from "@/models/Player";
import { Cell } from "@/models/board/Cell";
import { generateFEN, getPositionKey } from "@/services/fen";
import { evaluateGameState } from "@/services/evaluateGameState";
import { getNextColor } from "@/services/colorUtils";
import { Figure, FigureNames } from "@/models/figures/Figure";

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

  onMoveComplete?: (
    from: Cell,
    to: Cell,
    captured: Figure | null,
    promotion?: FigureNames
  ) => void;
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
  onMoveComplete,
}: UseGameLogicParams) => {
  const updateBoard = useCallback(() => {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }, [board, setBoard]);

  const clickCell = (cell: Cell, isGameOver: boolean) => {
    if (isGameOver) return;

    if (
      selectedCell &&
      selectedCell !== cell &&
      selectedCell.figure &&
      cell.available
    ) {
      const from = selectedCell;
      const to = cell;
      const captured = to.figure ?? null;

      onMoveComplete?.(from, to, captured); // 🟢 СПОЧАТКУ виклик

      from.moveFigure(to, (promotionTarget: Cell) => {
        promotionHandler(promotionTarget);
      });

      updateBoard();


      if (currentPlayer) {
        const nextColor = getNextColor(currentPlayer.color);
        const nextFEN = generateFEN(board, nextColor);
        const nextKey = getPositionKey(nextFEN);

        const repetitionCount = fenHistory.filter(fen => getPositionKey(fen) === nextKey).length;

        if (repetitionCount >= 2) {
          setGameOverMessage("Нічия через триразове повторення позиції");
          setGameOver(true);
          return;
        }

        const result = evaluateGameState({
          board,
          currentPlayerColor: nextColor,
          fenHistory,
          nextFen: nextFEN,
        });

        if (result.isGameOver) {
          setGameOverMessage(result.message || "Гру завершено");
          setGameOver(true);
          return;
        }

        if (result.message) {
          setGameOverMessage(result.message);
        }

        setFenHistory([...fenHistory, nextFEN]);
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
