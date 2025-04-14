// components/GameOverModal.tsx
import React, { FC } from "react";

interface GameOverModalProps {
  message: string;
  onRestart: () => void;
}

const GameOverModal: FC<GameOverModalProps> = ({ message, onRestart }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{message}</h2>
        <button onClick={onRestart}>🔁 Почати нову гру</button>
      </div>
    </div>
  );
};

export default GameOverModal; 