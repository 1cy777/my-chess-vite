// src/core/fen/fen.ts
import { Board } from "@/models/board/Board";
import { Colors } from "@/models/Colors";
import { Figure } from "@/models/figures/Figure";
import { FigureNames } from "@/models/figures/Figure";

/** Повертає символ фігури для FEN — версія з Figure */
export function getFENSymbol(figure: Figure): string;
/** Повертає символ фігури для FEN — версія з name та color */
export function getFENSymbol(name: FigureNames, color: Colors): string;
export function getFENSymbol(arg1: Figure | FigureNames, arg2?: Colors): string {
  const map: Record<FigureNames, string> = {
    [FigureNames.PAWN]: "p",
    [FigureNames.ROOK]: "r",
    [FigureNames.KNIGHT]: "n",
    [FigureNames.BISHOP]: "b",
    [FigureNames.QUEEN]: "q",
    [FigureNames.KING]: "k",
    [FigureNames.FIGURE]: "?", // fallback
  };

  if (typeof arg1 === "object") {
    const symbol = map[arg1.name];
    return arg1.color === Colors.WHITE ? symbol.toUpperCase() : symbol;
  } else {
    const symbol = map[arg1];
    return arg2 === Colors.WHITE ? symbol.toUpperCase() : symbol;
  }
}

/** Генерує повний FEN-рядок для даної дошки */
export function generateFEN(board: Board, currentPlayer: Colors): string {
  let fen = "";

  for (let y = 0; y < 8; y++) {
    let emptyCount = 0;
    for (let x = 0; x < 8; x++) {
      const figure = board.getCell(x, y).figure;
      if (!figure) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        fen += getFENSymbol(figure);
      }
    }
    if (emptyCount > 0) fen += emptyCount;
    if (y !== 7) fen += "/";
  }

  // Хто ходить
  fen += ` ${currentPlayer === Colors.WHITE ? "w" : "b"}`;

  // Рокіровка
  let castling = "";
  const whiteKing = board.findKing(Colors.WHITE)?.figure;
  const blackKing = board.findKing(Colors.BLACK)?.figure;

  if (whiteKing?.isFirstStep) {
    if (board.getCell(7, 7).figure?.isFirstStep) castling += "K";
    if (board.getCell(0, 7).figure?.isFirstStep) castling += "Q";
  }

  if (blackKing?.isFirstStep) {
    if (board.getCell(7, 0).figure?.isFirstStep) castling += "k";
    if (board.getCell(0, 0).figure?.isFirstStep) castling += "q";
  }

  fen += ` ${castling || "-"}`;

  // En passant
  if (board.enPassantTarget) {
    const file = String.fromCharCode("a".charCodeAt(0) + board.enPassantTarget.x);
    const rank = 8 - board.enPassantTarget.y;
    fen += ` ${file}${rank}`;
  } else {
    fen += " -";
  }

  // Halfmove clock + fullmove number
  fen += ` ${board.halfMoveClock} ${board.fullMoveNumber}`;

  return fen;
}

/** Ключ позиції без рахунку ходів — для виявлення повторів */
export function getPositionKey(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}
