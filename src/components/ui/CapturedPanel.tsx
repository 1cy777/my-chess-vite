import React from "react";
import { Figure, FigureNames } from "@/models/figures/Figure";
import CapturedFigures from "./CapturedFigures";

interface CapturedPanelProps {
  lostWhiteFigures: Figure[];
  lostBlackFigures: Figure[];
  position: "top" | "bottom";
}

const getTotalValue = (figures: Figure[]): number => {
  const values: Record<FigureNames, number> = {
    [FigureNames.QUEEN]: 9,
    [FigureNames.ROOK]: 5,
    [FigureNames.BISHOP]: 3,
    [FigureNames.KNIGHT]: 3,
    [FigureNames.PAWN]: 1,
    [FigureNames.KING]: 0,
    [FigureNames.FIGURE]: 0,
  };
  return figures.reduce((sum, fig) => sum + (values[fig.name] || 0), 0);
};

const CapturedPanel: React.FC<CapturedPanelProps> = ({
  lostWhiteFigures,
  lostBlackFigures,
  position,
}) => {
  const figures = [...lostWhiteFigures, ...lostBlackFigures];
  const totalValue = getTotalValue(figures);

  const isBottom = position === "bottom";

  return (
    <div
      className={`flex flex-col ${
        isBottom ? "items-start mt-2" : "items-end mb-2"
      } px-2 min-h-[24px]`}
    >
      <div
        className={`flex items-center gap-1 ${
          isBottom ? "flex-row-reverse justify-start" : "justify-end"
        } w-full`}
      >
        <CapturedFigures figures={figures} small />
        {totalValue > 0 && (
          <span className="text-sm text-gray-300 font-semibold">+{totalValue}</span>
        )}
      </div>
    </div>
  );
};

export default CapturedPanel;
