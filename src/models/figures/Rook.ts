import { Figure, FigureNames } from '@/models/figures/Figure';
import { Colors } from '@/models/Colors';
import { Cell } from '@/models/board/Cell';
import blackLogo from "@/assets/chess-icons/black-rook.svg";
import whiteLogo from "@/assets/chess-icons/white-rook.svg";

export class Rook extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.ROOK;
  }

  canMove(target: Cell): boolean {
    if(!super.canMove(target))
      return false;
    if(this.cell.isEmptyVertical(target))
      return true
    if(this.cell.isEmptyHorizontal(target))
      return true
    return false
  }
}
