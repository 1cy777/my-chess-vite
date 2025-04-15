import { MoveInfo } from "@/models/MoveInfo";

export function formatMoveNotation(move: MoveInfo): string {
  const piece = move.figure === "P" ? "" : move.figure;
  const capture = move.captured ? "x" : "";
  const promo = move.promotion ? `=${move.promotion}` : "";

  if (piece === "K" && move.from === "e1" && move.to === "g1") return "O-O";
  if (piece === "K" && move.from === "e1" && move.to === "c1") return "O-O-O";
  if (piece === "K" && move.from === "e8" && move.to === "g8") return "O-O";
  if (piece === "K" && move.from === "e8" && move.to === "c8") return "O-O-O";

  const file = move.from[0];
  const moveStr = `${piece}${capture ? file + capture : ""}${move.to}${promo}`;
  return moveStr;
}
