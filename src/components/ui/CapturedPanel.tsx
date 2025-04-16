import React from "react";
import { Figure, FigureNames } from "@/models/figures/Figure";
import CapturedFigures from "./CapturedFigures";

interface CapturedPanelProps {
  lostWhiteFigures: Figure[];
  lostBlackFigures: Figure[];
  flip?: boolean;
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
  flip, // <-- ВАЖЛИВО: додано сюди!
}) => {
  const whiteValue = getTotalValue(lostBlackFigures); // білі захопили чорних
  const blackValue = getTotalValue(lostWhiteFigures); // чорні захопили білих

  return (
    <div className="flex flex-col items-end gap-1 px-2">
      {flip ? (
        <>
          {/* Білі знизу */}
          <div className="inline-flex items-center gap-1 min-h-[20px]">
            <CapturedFigures figures={lostWhiteFigures} small />
            {blackValue > whiteValue && (
              <span className="text-sm text-gray-300 font-semibold">
                +{blackValue - whiteValue}
              </span>
            )}
          </div>
          {/* Чорні зверху */}
          <div className="inline-flex items-center gap-1 min-h-[20px]">
            <CapturedFigures figures={lostBlackFigures} small />
            {whiteValue > blackValue && (
              <span className="text-sm text-gray-300 font-semibold">
                +{whiteValue - blackValue}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Чорні зверху */}
          <div className="inline-flex items-center gap-1 min-h-[20px]">
            <CapturedFigures figures={lostBlackFigures} small />
            {whiteValue > blackValue && (
              <span className="text-sm text-gray-300 font-semibold">
                +{whiteValue - blackValue}
              </span>
            )}
          </div>
          {/* Білі знизу */}
          <div className="inline-flex items-center gap-1 min-h-[20px]">
            <CapturedFigures figures={lostWhiteFigures} small />
            {blackValue > whiteValue && (
              <span className="text-sm text-gray-300 font-semibold">
                +{blackValue - whiteValue}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CapturedPanel;
