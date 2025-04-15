import { Colors } from "@/models/Colors";
import { Cell } from "../Cell";

export function isUnderAttack(cell: Cell, color: Colors): boolean {
  const originalFigure = cell.figure;
  cell.figure = null;

  let underAttack = false;
  for (const row of cell.board.cells) {
    for (const target of row) {
      if (
        target.figure &&
        target.figure.color !== color &&
        target.figure.attacksCell(cell)
      ) {
        underAttack = true;
        break;
      }
    }
    if (underAttack) break;
  }

  cell.figure = originalFigure;
  return underAttack;
}
