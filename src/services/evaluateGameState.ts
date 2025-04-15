import { Board } from "@/models/board/Board";
import { Colors } from "@/models/Colors";

interface EvaluateGameStateParams {
  board: Board;
  currentPlayerColor: Colors;
  fenHistory: string[];
  nextFen: string;
}

interface GameStateResult {
  isGameOver: boolean;
  message: string | null;
}

function getPositionKey(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

export function evaluateGameState({ board, currentPlayerColor, fenHistory, nextFen }: EvaluateGameStateParams): GameStateResult {
  const key = getPositionKey(nextFen);

  const count = fenHistory.reduce((acc, fen) => {
    return getPositionKey(fen) === key ? acc + 1 : acc;
  }, 0);

  if (count >= 2) {
    return {
      isGameOver: true,
      message: "Нічия через триразове повторення позиції",
    };
  }

  const drawReason = board.checkForDrawConditions();
  if (drawReason) {
    return {
      isGameOver: true,
      message: drawReason,
    };
  }

  if (board.isCheckmate(currentPlayerColor)) {
    const winner = currentPlayerColor === Colors.WHITE ? "чорні" : "білі";
    return {
      isGameOver: true,
      message: `Мат! ${winner} перемогли!`,
    };
  }

  if (board.isCheck(currentPlayerColor)) {
    return {
      isGameOver: false,
      message: `Шах! ${currentPlayerColor === Colors.WHITE ? "білі" : "чорні"} під загрозою!`,
    };
  }

  return {
    isGameOver: false,
    message: null,
  };
}
