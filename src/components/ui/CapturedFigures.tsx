import React from "react";
import { Figure, FigureNames } from "@/models/figures/Figure";

interface Props {
  figures: Figure[];
  small?: boolean;
}

const CapturedFigures: React.FC<Props> = ({ figures, small = false }) => {
  const figureValue = (fig: Figure): number => {
    const values: Record<FigureNames, number> = {
      [FigureNames.QUEEN]: 9,
      [FigureNames.ROOK]: 5,
      [FigureNames.BISHOP]: 3,
      [FigureNames.KNIGHT]: 3,
      [FigureNames.PAWN]: 1,
      [FigureNames.KING]: 0,
      [FigureNames.FIGURE]: 0,
    };
    return values[fig.name] || 0;
  };

  const sorted = [...figures].sort((a, b) => figureValue(b) - figureValue(a));

  return (
    <div className="flex flex-wrap gap-[2px]">
      {sorted.map((figure, index) =>
        figure.logo ? (
          <img
            key={figure.id ?? index}
            src={figure.logo ?? undefined}
            alt={figure.name}
            title={figure.name}
            className={small ? "w-4 h-4" : "w-5 h-5"}
          />
        ) : null
      )}
    </div>
  );
};

export default CapturedFigures;
