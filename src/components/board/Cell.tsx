import React, { FC } from "react";
import { Cell } from "@/models/board/Cell";
import "@/styles/App.css";

interface CellProps {
  cell: Cell;
  selected: boolean;
  click: (cell: Cell) => void;
}

const CellComponent: FC<CellProps> = ({ cell, selected, click }) => {
  const getClassNames = (): string => {
    return [
      "cell",
      cell.color,
      selected && "selected",
      cell.isCheckmate && "checkmate",
      !cell.isCheckmate && cell.isKingInCheck && "in-check"
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (cell.available && cell.figure) {
      return { background: "green" };
    }
    return {};
  };

  return (
    <div className={getClassNames()} onClick={() => click(cell)} style={getBackgroundStyle()}>
      {cell.available && !cell.figure && <div className="available" />}
      {cell.figure?.logo && (
        <img
          src={cell.figure.logo}
          alt=""
          className="figure-image"
        />
      )}
    </div>
  );
};

export default CellComponent;