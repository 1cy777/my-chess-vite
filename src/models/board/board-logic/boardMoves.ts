import { Board } from "../Board";
import { Cell } from "../Cell";

export function isMoveLegal(board: Board, from: Cell, to: Cell): boolean {
  const figure = from.figure;
  if (!figure || !figure.canMove(to)) return false;

  const originalFigure = to.figure;

  from.figure = null;
  to.figure = figure;
  figure.cell = to;

  const stillInCheck = board.isCheck(figure.color);

  to.figure = originalFigure;
  from.figure = figure;
  figure.cell = from;

  return !stillInCheck;
}

export function hasAvailableMoves(board: Board, cell: Cell): boolean {
  const figure = cell.figure;
  if (!figure) return false;

  for (let row of board.cells) {
    for (let target of row) {
      if (figure.canMove(target)) {
        const originalFigure = target.figure;

        cell.figure = null;
        target.figure = figure;
        figure.cell = target;

        const stillInCheck = board.isCheck(figure.color);

        target.figure = originalFigure;
        cell.figure = figure;
        figure.cell = cell;

        if (!stillInCheck) return true;
      }
    }
  }

  return false;
}

export function getLegalMovesInCheck(board: Board, selectedCell: Cell): Cell[] {
  const figure = selectedCell.figure;
  if (!figure) return [];

  const legalMoves: Cell[] = [];

  for (let row of board.cells) {
    for (let target of row) {
      if (figure.canMove(target)) {
        const originalFigure = target.figure;

        selectedCell.figure = null;
        target.figure = figure;
        figure.cell = target;

        const stillInCheck = board.isCheck(figure.color);

        target.figure = originalFigure;
        selectedCell.figure = figure;
        figure.cell = selectedCell;

        if (!stillInCheck) legalMoves.push(target);
      }
    }
  }

  return legalMoves;
}