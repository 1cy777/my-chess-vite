import { Colors } from "@/models/Colors";
import { Board } from "../Board";
import { Cell } from "../Cell";
import { FigureNames } from "@/models/figures/Figure";
import { evaluateGameState } from "@/services/evaluateGameState";
import { generateFEN } from "@/services/fen";
import { getNextColor } from "@/services/colorUtils";

export function findKing(board: Board, color: Colors): Cell | null {
  for (let row of board.cells) {
    for (let cell of row) {
      if (cell.figure?.name === FigureNames.KING && cell.figure.color === color) {
        return cell;
      }
    }
  }
  return null;
}

export function isCheck(board: Board, color: Colors): boolean {
  const kingCell = findKing(board, color);
  if (!kingCell) return false;
  return kingCell.isUnderAttack(color);
}

export function isCheckmate(board: Board, color: Colors): boolean {
  if (!isCheck(board, color)) return false;

  for (let row of board.cells) {
    for (let cell of row) {
      const figure = cell.figure;
      if (figure?.color === color) {
        for (let row2 of board.cells) {
          for (let target of row2) {
            if (figure.canMove(target)) {
              const original = target.figure;
              const from = cell;

              from.figure = null;
              target.figure = figure;
              figure.cell = target;

              const stillInCheck = isCheck(board, color);

              target.figure = original;
              from.figure = figure;
              figure.cell = from;

              if (!stillInCheck) return false;
            }
          }
        }
      }
    }
  }
  return true;
}

export function isStalemate(board: Board, color: Colors): boolean {
  if (isCheck(board, color)) return false;

  for (let row of board.cells) {
    for (let cell of row) {
      const figure = cell.figure;
      if (figure?.color === color) {
        for (let targetRow of board.cells) {
          for (let target of targetRow) {
            if (figure.canMove(target)) {
              const original = target.figure;
              const from = cell;
              const to = target;

              from.figure = null;
              to.figure = figure;
              figure.cell = to;

              const stillInCheck = isCheck(board, color);

              to.figure = original;
              from.figure = figure;
              figure.cell = from;

              if (!stillInCheck) return false;
            }
          }
        }
      }
    }
  }
  return true;
}

export function isInsufficientMaterial(board: Board): boolean {
  const allFigures = board.cells.flat().map(cell => cell.figure).filter(Boolean);
  const nonKings = allFigures.filter(fig => fig!.name !== FigureNames.KING);

  if (nonKings.length === 0) return true;
  if (nonKings.length === 1) {
    const fig = nonKings[0];
    return fig!.name === FigureNames.BISHOP || fig!.name === FigureNames.KNIGHT;
  }
  return false;
}

export function checkForDrawConditions(board: Board): string | null {
  if (isStalemate(board, Colors.WHITE) || isStalemate(board, Colors.BLACK)) {
    return "Пат — нічия";
  }

  if (isInsufficientMaterial(board)) {
    return "Нічия через недостатній матеріал";
  }

  if (board.halfMoveClock >= 100) {
    return "Нічия за правилом 50-ти ходів";
  }

  return null;
}

export function updateKingCheckStatus(board: Board): void {
  for (let row of board.cells) {
    for (let cell of row) {
      cell.isKingInCheck = false;
      cell.isCheckmate = false;
    }
  }

  const update = (color: Colors) => {
    const kingCell = findKing(board, color);
    if (!kingCell) return;

    const nextFen = generateFEN(board, getNextColor(color));
    const result = evaluateGameState({
      board,
      currentPlayerColor: color,
      fenHistory: [],
      nextFen,
    });

    if (result.message?.includes("Мат")) kingCell.isCheckmate = true;
    else if (result.message?.includes("Шах")) kingCell.isKingInCheck = true;
  };

  update(Colors.WHITE);
  update(Colors.BLACK);
}
