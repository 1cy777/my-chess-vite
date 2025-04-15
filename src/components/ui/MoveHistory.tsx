// src/components/history/MoveHistory.tsx
import React from "react";

interface MoveHistoryProps {
  history: string[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ history, currentIndex, onSelect }) => {
  return (
    <div className="move-history">
      <h3>Історія ходів</h3>
      <ol>
        {history.map((fen, index) => (
          <li
            key={index}
            style={{ fontWeight: index === currentIndex ? "bold" : "normal", cursor: "pointer" }}
            onClick={() => onSelect(index)}
          >
            Хід {index + 1}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default MoveHistory;
