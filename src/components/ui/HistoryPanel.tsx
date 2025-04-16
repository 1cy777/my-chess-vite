import React from "react";
import { MoveInfo } from "@/models/MoveInfo";
import { Colors } from "@/models/Colors";
import { Figure } from "@/models/figures/Figure";

interface Props {
  history: MoveInfo[];
  onSelect: (index: number) => void;
  activeIndex: number;
  lostWhiteFigures: Figure[];
  lostBlackFigures: Figure[];
}


const HistoryPanel: React.FC<Props> = ({ history, onSelect, activeIndex }) => {
  const grouped: {
    white: MoveInfo | null;
    black: MoveInfo | null;
    whiteIndex: number | null;
    blackIndex: number | null;
  }[] = [];

  for (let i = 0; i < history.length; ) {
    const move = history[i];
    if (move.color === Colors.WHITE) {
      const white = move;
      const whiteIndex = i;
      let black = null;
      let blackIndex = null;

      if (history[i + 1]?.color === Colors.BLACK) {
        black = history[i + 1];
        blackIndex = i + 1;
        i += 2;
      } else {
        i++;
      }

      grouped.push({ white, black, whiteIndex, blackIndex });
    } else if (move.color === Colors.BLACK) {
      const black = move;
      const blackIndex = i;
      grouped.push({ white: null, black, whiteIndex: null, blackIndex });
      i++;
    }
  }

  return (
    <div className="history-panel p-3">
      <h2 className="font-bold">Історія ходів</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Білі</th>
            <th>Чорні</th>
          </tr>
        </thead>
        <tbody>
          {/* Старт є логічно, але не виводиться в UI */}

          {grouped.map(({ white, black, whiteIndex, blackIndex }, i) => (
            <tr key={i + 1}>
              <td>{i + 1}.</td>
              <td
                className={`cursor-pointer px-1 py-0.5 ${activeIndex === (whiteIndex ?? -1) ? "bg-blue-100 font-semibold" : ""}`}
                onClick={() => whiteIndex !== null && onSelect(whiteIndex + 1)}
              >
                {white ? `${getFigureSymbol(white.figure)} ${white.notation}` : ""}
              </td>
              <td
                className={`cursor-pointer px-1 py-0.5 ${activeIndex === (blackIndex ?? -1) ? "bg-blue-100 font-semibold" : ""}`}
                onClick={() => blackIndex !== null && onSelect(blackIndex + 1)}
              >
                {black ? `${getFigureSymbol(black.figure)} ${black.notation}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function getFigureSymbol(name: string): string {
  const map: Record<string, string> = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",
  };
  return map[name] || "";
}

export default HistoryPanel;
