import { Figure, FigureNames } from '@/models/figures/Figure';
import { Colors } from '@/models/Colors';
import { Cell } from '@/models/board/Cell';
import blackLogo from "@/assets/chess-icons/black-knight.svg";
import whiteLogo from "@/assets/chess-icons/white-knight.svg";

export class Knight extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KNIGHT;
  }

  canMove(target: Cell): boolean {
    if(!super.canMove(target))
      return false;
    const dx = Math.abs(this.cell.x - target.x);
    const dy = Math.abs(this.cell.y - target.y);

    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1)
  }
}
