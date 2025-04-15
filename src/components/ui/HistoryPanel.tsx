import React from "react";
import { MoveInfo } from "@/models/MoveInfo";

interface Props {
  history: MoveInfo[];
  onSelect?: (move: MoveInfo, index: number) => void;
  activeIndex?: number | null;
}

const HistoryPanel: React.FC<Props> = ({ history, onSelect, activeIndex }) => {
  // Групуємо ходи в пари: білі / чорні
  const groupedMoves = [];
  for (let i = 0; i < history.length; i += 2) {
    groupedMoves.push({
      white: history[i],
      black: history[i + 1],
      whiteIndex: i,
      blackIndex: i + 1,
    });
  }

  return (
    <div className="history-panel p-2 border rounded shadow max-h-96 overflow-y-auto bg-white text-sm w-72">
      <h2 className="text-lg font-bold mb-2">Історія ходів</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-gray-700">
            <th className="pr-2">#</th>
            <th>Білі</th>
            <th>Чорні</th>
          </tr>
        </thead>
        <tbody>
          {groupedMoves.map(({ white, black, whiteIndex, blackIndex }, i) => (
            <tr
              key={i}
              className={
                activeIndex === whiteIndex || activeIndex === blackIndex
                  ? "bg-blue-100 font-semibold"
                  : "hover:bg-gray-100"
              }
            >
              <td className="pr-2">{i + 1}.</td>
              <td
                className="cursor-pointer px-1 py-0.5"
                onClick={() => onSelect?.(white, whiteIndex)}
              >
                {getFigureSymbol(white.figure)} {white.notation}
              </td>
              <td
                className="cursor-pointer px-1 py-0.5"
                onClick={() => black && onSelect?.(black, blackIndex)}
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

// 🔠 Перетворює фігуру у відповідний юнікод-символ
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
