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

const HistoryPanel: React.FC<Props> = ({
  history,
  onSelect,
  activeIndex,
}) => {
  /** групуємо по парах, пропускаючи undefined */
  const grouped = history.reduce<
    {
      white: MoveInfo | null;
      black: MoveInfo | null;
      whiteIndex: number | null;
      blackIndex: number | null;
    }[]
  >((acc, move, i) => {
    if (!move) return acc; // 🛡️  пропускаємо «дірки»

    // якщо білий — створюємо нову пару
    if (move.color === Colors.WHITE) {
      acc.push({
        white: move,
        black: null,
        whiteIndex: i,
        blackIndex: null,
      });
    } else {
      // чорний — дописуємо в останню пару або створюємо нову
      const last = acc.at(-1);
      if (last && last.black == null) {
        last.black = move;
        last.blackIndex = i;
      } else {
        acc.push({
          white: null,
          black: move,
          whiteIndex: null,
          blackIndex: i,
        });
      }
    }
    return acc;
  }, []);

  return (
    <div className="history-panel p-3">
      <h2 className="font-bold mb-1">Історія ходів</h2>

      <table className="text-sm">
        <thead>
          <tr>
            <th className="pr-1">#</th>
            <th className="pr-2">Білі</th>
            <th>Чорні</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(({ white, black, whiteIndex, blackIndex }, idx) => (
            <tr key={idx}>
              <td className="pr-1">{idx + 1}.</td>

              <td
                className={`cursor-pointer px-1 ${
                  activeIndex === whiteIndex ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() =>
                  whiteIndex !== null && onSelect(whiteIndex)
                }
              >
                {white && `${fig(white.figure)} ${white.notation}`}
              </td>

              <td
                className={`cursor-pointer px-1 ${
                  activeIndex === blackIndex ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() =>
                  blackIndex !== null && onSelect(blackIndex)
                }
              >
                {black && `${fig(black.figure)} ${black.notation}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Повертає юнікод‑фігуру для SAN‑символу */
function fig(name: string): string {
  const map: Record<string, string> = {
    K: "♔",
    Q: "♕",
    R: "♖",
    B: "♗",
    N: "♘",
    P: "♙",
  };
  return map[name] ?? "";
}

export default HistoryPanel;
