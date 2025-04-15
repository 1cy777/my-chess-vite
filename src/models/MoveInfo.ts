import { Colors } from "@/models/Colors";

export interface MoveInfo {
  figure: string;         // Наприклад: "N", "P", "K", "Q"
  from: string;           // e2
  to: string;             // e4
  color: Colors;          // "w" або "b"
  captured?: string;      // символ взятої фігури
  promotion?: string;     // Q, R, N, B
  notation: string;       // Нотація для історії, напр. "e4", "Nf3", "exd6"
  fen: string;            // FEN після ходу
}
