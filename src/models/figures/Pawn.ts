import { Figure, FigureNames } from '@/models/figures/Figure';
import { Colors } from '@/models/Colors';
import { Cell } from '@/models/board/Cell';
import blackLogo from "@/assets/chess-icons/black-pawn.svg";
import whiteLogo from "@/assets/chess-icons/white-pawn.svg";

export class Pawn extends Figure {

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.PAWN;
  }

  canMove(target: Cell): boolean {
    if (target.figure && target.figure.color === this.color) return false;

    const direction = this.color === Colors.BLACK ? 1 : -1;
    const firstStep = this.isFirstStep;

    // Хід вперед на 1 клітинку
    if (
      target.x === this.cell.x &&
      target.y === this.cell.y + direction &&
      target.isEmpty()
    ) {
      return true;
    }

    // Перший хід — вперед на 2 клітинки
    if (
      firstStep &&
      target.x === this.cell.x &&
      target.y === this.cell.y + direction * 2
    ) {
      const cellInFront = this.cell.board.getCell(this.cell.x, this.cell.y + direction);
      const targetCell = this.cell.board.getCell(target.x, target.y);
      if (cellInFront.isEmpty() && targetCell.isEmpty()) {
        return true;
      }
    }

    // Звичайне взяття по діагоналі
    if (
      target.y === this.cell.y + direction &&
      (target.x === this.cell.x + 1 || target.x === this.cell.x - 1) &&
      this.cell.isEnemy(target)
    ) {
      return true;
    }

    // En passant
    const enPassantCell = this.cell.board.getCell(target.x, this.cell.y);
    if (
      target.y === this.cell.y + direction &&
      (target.x === this.cell.x + 1 || target.x === this.cell.x - 1) &&
      enPassantCell?.figure instanceof Pawn &&
      enPassantCell.figure.color !== this.color &&
      enPassantCell.figure.canBeCapturedEnPassant
    ) {
      return true;
    }

    return false;
  }

  attacksCell(target: Cell): boolean {
    const direction = this.color === Colors.BLACK ? 1 : -1;

    // Пішак атакує по діагоналі
    return (
      target.y === this.cell.y + direction &&
      (target.x === this.cell.x + 1 || target.x === this.cell.x - 1)
    );
  }


  moveFigure(target: Cell, onPawnPromote?: (cell: Cell) => void): void {
    const direction = this.color === Colors.BLACK ? 1 : -1;
  
    // En passant: видалення пішака, що "обійдений"
    if (
      this.cell.x !== target.x &&
      target.isEmpty()
    ) {
      const capturedPawnCell = this.cell.board.getCell(target.x, target.y - direction);
      capturedPawnCell.figure = null;
    }
  
    const dy = target.y - this.cell.y;
  
    // 🔁 Якщо пішак ходить на 2 вперед — запам’ятовуємо клітинку для en passant
    if (Math.abs(dy) === 2) {
      this.cell.board.enPassantTarget = this.cell.board.getCell(this.cell.x, this.cell.y + direction);
      this.canBeCapturedEnPassant = true;
    } else {
      this.cell.board.enPassantTarget = null;
      this.canBeCapturedEnPassant = false;
    }
  
    super.moveFigure(target, onPawnPromote);
    this.isFirstStep = false;
  }
}