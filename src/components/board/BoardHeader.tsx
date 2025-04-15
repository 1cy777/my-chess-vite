import React from "react";
import { Player } from "@/models/Player";

interface BoardHeaderProps {
  currentPlayer: Player | null;
  isFlipped: boolean;
  toggleFlip: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ currentPlayer, isFlipped, toggleFlip }) => {
  return (
    <div className="board-header">
      <h3>Хід - {currentPlayer?.color}</h3>
      <button onClick={toggleFlip}>
        🔄 {isFlipped ? "Повернути" : "Розвернути"} дошку
      </button>
    </div>
  );
};

export default BoardHeader;
