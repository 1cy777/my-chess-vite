import { Board } from "@/models/board/Board";
import { Colors } from "@/models/Colors";
import { FigureNames } from "@/models/figures/Figure";
import { createFigureFromSymbol } from "@/services/createFigureFromSymbol";
import { Cell } from "@/models/board/Cell";

/** Символ фігури для FEN */
export function getFENSymbol(name: FigureNames, color: Colors): string {
  const map: Record<FigureNames, string> = {
    [FigureNames.PAWN]: "p",
    [FigureNames.ROOK]: "r",
    [FigureNames.KNIGHT]: "n",
    [FigureNames.BISHOP]: "b",
    [FigureNames.QUEEN]: "q",
    [FigureNames.KING]: "k",
    [FigureNames.FIGURE]: "?",
  };

  const symbol = map[name];
  return color === Colors.WHITE ? symbol.toUpperCase() : symbol;
}

/** Генерація FEN-рядка */
export function generateFEN(board: Board, currentColor: Colors): string {
  let fen = "";

  for (let y = 0; y < 8; y++) {
    let empty = 0;
    for (let x = 0; x < 8; x++) {
      const figure = board.getCell(x, y).figure;
      if (!figure) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        fen += getFENSymbol(figure.name, figure.color);
      }
    }
    if (empty > 0) fen += empty;
    if (y !== 7) fen += "/";
  }

  // Хто ходить
  fen += ` ${currentColor === Colors.WHITE ? "w" : "b"}`;

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

  // Лічильники
  fen += ` ${board.halfMoveClock} ${board.fullMoveNumber}`;

  return fen;
}

/** Відновлення дошки з FEN */
export function fromFEN(fen: string): { board: Board; currentColor: Colors } {
  const board = new Board();
  board.initCells();

  if (!fen || !fen.includes(" ")) {
    throw new Error("Invalid FEN: " + fen);
  }

  const [position, activeColor, castling = "-", enPassant = "-", halfmove = "0", fullmove = "1"] = fen.split(" ");
  const rows = position.split("/");

  for (let y = 0; y < 8; y++) {
    let x = 0;
    for (const char of rows[y]) {
      if (!isNaN(Number(char))) {
        x += Number(char);
      } else {
        const color = char === char.toUpperCase() ? Colors.WHITE : Colors.BLACK;
        const name = char.toLowerCase();
        const cell = board.getCell(x, y);

        const figure = createFigureFromSymbol(name, color, cell);
        figure.isFirstStep = true; // за замовчуванням
        
        if (figure.name === FigureNames.PAWN) {
          const isWhite = figure.color === Colors.WHITE;
          const startRank = isWhite ? 6 : 1;
          figure.isFirstStep = cell.y === startRank;
        } else {
          figure.isFirstStep = true;
        }

        cell.setFigure(figure);
        x++;
      }
    }
  }

  // Рокіровка — оновлюємо isFirstStep для веж і королів
  if (!castling.includes("K")) board.getCell(7, 7).figure?.name === "Rook" && (board.getCell(7, 7).figure!.isFirstStep = false);
  if (!castling.includes("Q")) board.getCell(0, 7).figure?.name === "Rook" && (board.getCell(0, 7).figure!.isFirstStep = false);
  if (!castling.includes("k")) board.getCell(7, 0).figure?.name === "Rook" && (board.getCell(7, 0).figure!.isFirstStep = false);
  if (!castling.includes("q")) board.getCell(0, 0).figure?.name === "Rook" && (board.getCell(0, 0).figure!.isFirstStep = false);

  const whiteKing = board.findKing(Colors.WHITE)?.figure;
  const blackKing = board.findKing(Colors.BLACK)?.figure;
  if (whiteKing && !castling.includes("K") && !castling.includes("Q")) whiteKing.isFirstStep = false;
  if (blackKing && !castling.includes("k") && !castling.includes("q")) blackKing.isFirstStep = false;

  // En passant
  board.enPassantTarget = enPassant !== "-" ? algebraicToCell(enPassant, board) : null;

  // Лічильники
  board.halfMoveClock = parseInt(halfmove);
  board.fullMoveNumber = parseInt(fullmove);

  const currentColor = activeColor === "w" ? Colors.WHITE : Colors.BLACK;

  return { board, currentColor };
}

/** Повертає ключ позиції без лічильників */
export function getPositionKey(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

function algebraicToCell(str: string, board: Board): Cell | null {
  if (str.length !== 2) return null;
  const x = str.charCodeAt(0) - "a".charCodeAt(0);
  const y = 8 - parseInt(str[1]);
  return board.getCell(x, y);
}
