import { Cell } from "../Cell";
import { Figure } from "@/models/figures/Figure";
import { Colors } from "@/models/Colors";

export function setFigure(cell: Cell, figure: Figure) {
  cell.figure = figure;
  figure.cell = cell;
}

export function addLostFigure(cell: Cell, figure: Figure) {
  figure.color === Colors.BLACK
    ? cell.board.lostBlackFigures.push(figure)
    : cell.board.lostWhiteFigures.push(figure);
}