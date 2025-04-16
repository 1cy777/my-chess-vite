// src/models/MoveInfo.ts
import { Colors } from "@/models/Colors";
import { FigureNames } from "@/models/figures/Figure";

export interface MoveInfo {
  notation: string;        // e.g. Nf3, exd5, e8=Q
  figure: string;          // e.g. N, P
  from: string;            // e.g. e2
  to: string;              // e.g. e4
  captured?: string;       // e.g. P
  promotion?: FigureNames; // e.g. QUEEN
  color: Colors;           // e.g. WHITE
  fen: string;             // FEN після цього ходу
}