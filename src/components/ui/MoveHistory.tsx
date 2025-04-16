import React from "react";

interface MoveHistoryProps {
  history: string[];               // масив FEN-рядків
  currentIndex: number;            // активна позиція
  onSelect: (index: number) => void;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentIndex,
  onSelect,
}) => {
  return (
    <div className="move-history p-3 bg-white border rounded shadow text-sm max-h-96 overflow-y-auto w-72">
      <h2 className="text-lg font-bold mb-2">FEN-історія</h2>
      <ol className="list-decimal ml-4">
        {history.map((fen, index) => (
          <li
            key={index}
            onClick={() => onSelect(index)}
            className={`cursor-pointer px-2 py-1 ${currentIndex === index ? 'bg-blue-100 font-semibold' : ''}`}
          >
            {index === 0 ? "Старт" : `Хід ${index}`}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default MoveHistory;
