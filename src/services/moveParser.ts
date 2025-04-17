import { Board } from "@/models/board/Board";

/**
 * Перетворює рядок UCI (e2e4) у {from, to}
 * Ваша дошка очікує: x = 0..7 (a..h), y = 0..7 (0 – верх, 7 – низ)
 */
export function fromNotation(board: Board, move: string) {
  if (move.length < 4) return null;

  const fx = move.charCodeAt(0) - 97;        // "a" → 0
  const fy = 8 - Number(move[1]);            // "1" → 7, "8" → 0
  const tx = move.charCodeAt(2) - 97;
  const ty = 8 - Number(move[3]);

  return {
    from: board.getCell(fx, fy),
    to:   board.getCell(tx, ty),
  };
}
