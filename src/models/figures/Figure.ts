import logo from '../../shared/assets/chess-icons/black-king.svg'
import { Colors } from "@/models/Colors";
import { Cell } from "@/models/board/Cell";

export enum FigureNames {
  FIGURE = "Figure",
  KING = "King",
  KNIGHT = "Knight",
  PAWN = "Pawn",
  QUEEN = "Queen",
  ROOK = "Rook",
  BISHOP = "Bishop",
}

export class Figure {
  isFirstStep: boolean = true;
  color: Colors;
  logo: typeof logo | null;
  cell: Cell;
  name: FigureNames;
  id: number;
  canBeCapturedEnPassant: boolean = false;
  wasDoubleStepLastTurn?: boolean;


  constructor(color: Colors, cell: Cell) {
    this.color = color;
    this.cell = cell;
    this.cell.figure = this;
    this.logo = null;
    this.name = FigureNames.FIGURE
    this.id = Math.random()
  }

  canMove(target: Cell): boolean {
    if (target.figure?.color === this.color)
      return false
    if (target.figure?.name === FigureNames.KING)
      return false
    return true;
  }

  attacksCell(target: Cell): boolean {
    return this.canMove(target);
  }

  getFigureNotation(): string {
    switch (this.name) {
      case "King": return "K";
      case "Queen": return "Q";
      case "Rook": return "R";
      case "Bishop": return "B";
      case "Knight": return "N";
      case "Pawn": return "P";
      default: return "?";
    }
  }
  
  moveFigure(target: Cell, onPawnPromote?: (cell: Cell) => void): void { }
}


