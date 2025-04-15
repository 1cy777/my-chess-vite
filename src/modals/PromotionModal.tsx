import React from 'react';
import { FigureNames } from "@/models/figures/Figure";
import { Colors } from "@/models/Colors";

import whiteQueen from "@/assets/chess-icons/white-queen.svg";
import whiteKnight from "@/assets/chess-icons/white-knight.svg";
import whiteRook from "@/assets/chess-icons/white-rook.svg";
import whiteBishop from "@/assets/chess-icons/white-bishop.svg";
import blackQueen from "@/assets/chess-icons/black-queen.svg";
import blackKnight from "@/assets/chess-icons/black-knight.svg";
import blackRook from "@/assets/chess-icons/black-rook.svg";
import blackBishop from "@/assets/chess-icons/black-bishop.svg";

interface PromotionModalProps {
  color: Colors;
  onSelect: (figure: FigureNames) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect }) => {
  const isWhite = color === Colors.WHITE;

  const figures = [
    { name: FigureNames.QUEEN, img: isWhite ? whiteQueen : blackQueen },
    { name: FigureNames.ROOK, img: isWhite ? whiteRook : blackRook },
    { name: FigureNames.BISHOP, img: isWhite ? whiteBishop : blackBishop },
    { name: FigureNames.KNIGHT, img: isWhite ? whiteKnight : blackKnight },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Оберіть фігуру</h2>
        <div className="promotion-options">
          {figures.map((fig) => (
            <img
              key={fig.name}
              src={fig.img}
              alt={fig.name}
              onClick={() => onSelect(fig.name)}
              className="promotion-img"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;