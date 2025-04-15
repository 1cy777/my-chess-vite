import { Colors } from '@/models/Colors';
import { Figure } from "../figures/Figure";
import { Board } from './Board';

import * as Availability from './cell-logic/availability';
import * as Helpers from './cell-logic/helpers';
import * as CheckLogic from './cell-logic/check';
import * as Movement from './cell-logic/movement';

export class Cell {
  readonly x: number;
  readonly y: number;
  readonly color: Colors;
  figure: Figure | null;
  board: Board;
  available: boolean;
  id: number;
  isKingInCheck: boolean = false;
  isCheckmate: boolean = false;

  constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.figure = figure;
    this.board = board;
    this.available = false;
    this.id = Math.random();
  }

  isEmpty = () => Availability.isEmpty(this);
  isEnemy = (target: Cell) => Availability.isEnemy(this, target);
  isEmptyVertical = (target: Cell) => Availability.isEmptyVertical(this, target);
  isEmptyHorizontal = (target: Cell) => Availability.isEmptyHorizontal(this, target);
  isEmptyDiagonal = (target: Cell) => Availability.isEmptyDiagonal(this, target);

  setFigure = (figure: Figure) => Helpers.setFigure(this, figure);
  addLostFigure = (figure: Figure) => Helpers.addLostFigure(this, figure);

  moveFigure = (target: Cell, onPawnPromote?: (cell: Cell) => void) =>
    Movement.moveFigureLogic(this, target, onPawnPromote);
  isUnderAttack = (color: Colors) => CheckLogic.isUnderAttack(this, color);

  getChessNotation(): string {
    return `${String.fromCharCode(97 + this.x)}${8 - this.y}`;
  }
}
