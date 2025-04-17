/// <reference types="vite-plugin-svgr/client" />
import { Figure, FigureNames } from '@/models/figures/Figure';
import { Colors } from '@/models/Colors';
import { Cell } from '@/models/board/Cell';
import whiteLogo from "@/assets/chess-icons/white-king.svg";
import blackLogo from "@/assets/chess-icons/black-king.svg";

export class King extends Figure {
  isFirstStep: boolean = true;

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.WHITE ? whiteLogo : blackLogo;
    this.name = FigureNames.KING;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target)) return false;

    const dx = Math.abs(this.cell.x - target.x);
    const dy = Math.abs(this.cell.y - target.y);

    // Хід на одну клітинку в будь-який бік
    if (dx <= 1 && dy <= 1 && !this.adjacentToEnemyKing(target)) {
      const source = this.cell;
      const savedTargetFigure = target.figure;

      // Симулюємо хід
      source.figure = null;
      target.figure = this;
      this.cell = target;

      const underAttack = target.isUnderAttack(this.color);

      // Відкат
      target.figure = savedTargetFigure;
      source.figure = this;
      this.cell = source;

      return !underAttack;
    }

    // Рокіровка (опціонально, якщо хочеш зберегти)
    if (this.cell.figure?.name !== FigureNames.KING) return false;
    if (this.cell.isUnderAttack(this.color)) return false;
    if (!this.isFirstStep || this.cell.y !== target.y || dx !== 2) return false;

    const rookX = this.cell.x < target.x ? 7 : 0;
    const rookCell = this.cell.board.getCell(rookX, this.cell.y);
    if (!rookCell.figure || rookCell.figure.name !== FigureNames.ROOK || !rookCell.figure.isFirstStep) return false;

    const direction = this.cell.x < target.x ? 1 : -1;
    for (let i = 1; i < dx; i++) {
      const intermediate = this.cell.board.getCell(this.cell.x + i * direction, this.cell.y);
      if (!intermediate.isEmpty() || intermediate.isUnderAttack(this.color)) return false;
    }

    return true;
  }

  moveFigure(target: Cell) {
    super.moveFigure(target);

    const dx = target.x - this.cell.x;
    if (Math.abs(dx) === 2) {
      const rookFromX = dx > 0 ? 7 : 0;
      const rookToX = dx > 0 ? target.x - 1 : target.x + 1;

      const rook = this.cell.board.getCell(rookFromX, this.cell.y).figure;
      if (rook) {
        this.cell.board.getCell(rookFromX, this.cell.y).figure = null;
        this.cell.board.getCell(rookToX, this.cell.y).setFigure(rook);
        rook.cell = this.cell.board.getCell(rookToX, this.cell.y);
      }
    }
  }

  adjacentToEnemyKing(target: Cell): boolean {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;

        const x = target.x + dx;
        const y = target.y + dy;
        if (x < 0 || x > 7 || y < 0 || y > 7) continue;

        const neighbor = this.cell.board.getCell(x, y);
        if (neighbor.figure?.name === FigureNames.KING && neighbor.figure.color !== this.color) {
          return true;
        }
      }
    }
    return false;
  }
  
}
