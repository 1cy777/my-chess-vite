import { Figure, FigureNames } from '@/models/figures/Figure';
import { Colors } from '@/models/Colors';
import { Cell } from '@/models/board/Cell';
import whiteLogo from "@/assets/chess-icons/white-bishop.svg";
import blackLogo from "@/assets/chess-icons/black-bishop.svg";

export class Bishop extends Figure {

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.WHITE ? whiteLogo : blackLogo;
    this.name = FigureNames.BISHOP;
  }

  canMove(target: Cell): boolean {
    if(!super.canMove(target))
      return false;
    if(this.cell.isEmptyDiagonal(target))
      return true
    return false
  }
  
}
