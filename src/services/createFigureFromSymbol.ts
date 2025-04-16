import { Colors } from "@/models/Colors";
import { Figure } from "@/models/figures/Figure";
import { Cell } from "@/models/board/Cell";
import { King } from "@/models/figures/King";
import { Queen } from "@/models/figures/Queen";
import { Rook } from "@/models/figures/Rook";
import { Bishop } from "@/models/figures/Bishop";
import { Knight } from "@/models/figures/Knight";
import { Pawn } from "@/models/figures/Pawn";

export function createFigureFromSymbol(symbol: string, color: Colors, cell: Cell, isFirstStep = false): Figure {
  const map = {
    p: () => new Pawn(color, cell),
    r: () => new Rook(color, cell),
    n: () => new Knight(color, cell),
    b: () => new Bishop(color, cell),
    q: () => new Queen(color, cell),
    k: () => new King(color, cell),
  };

  const creator = map[symbol.toLowerCase() as keyof typeof map];
  const figure = creator ? creator() : null;

  if (figure) {
    figure.isFirstStep = isFirstStep;
    return figure;
  }

  throw new Error(`Unknown FEN symbol: ${symbol}`);
}