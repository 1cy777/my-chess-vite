import { Board } from "../Board";
import { Figure } from "@/models/figures/Figure";
import { Pawn } from "@/models/figures/Pawn";

export function clearEnPassantFlags(board: Board, exceptPawn: Figure) {
  board.cells.forEach(row => {
    row.forEach(cell => {
      const figure = cell.figure;
      if (figure instanceof Pawn && figure !== exceptPawn) {
        figure.canBeCapturedEnPassant = false;
      }
    });
  });
}
