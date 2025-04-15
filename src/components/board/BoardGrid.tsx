import React from "react";
import { Cell } from "@/models/board/Cell";
import CellComponent from "@/components/board/Cell";

interface BoardGridProps {
  cells: Cell[][];
  selectedCell: Cell | null;
  isFlipped: boolean;
  onCellClick: (cell: Cell) => void;
  isGameOver: boolean;
}

const BoardGrid: React.FC<BoardGridProps> = ({ cells, selectedCell, isFlipped, onCellClick }) => {
  const orderedRows = isFlipped ? [...cells].reverse() : cells;
  const columnLabels = isFlipped
    ? ["h", "g", "f", "e", "d", "c", "b", "a"]
    : ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div className="board-wrapper">
      <div className="board">
        {orderedRows.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            <div className="row-label">
              {isFlipped ? rowIndex + 1 : 8 - rowIndex}
            </div>

            {(isFlipped ? [...row].reverse() : row).map((cell) => (
              <CellComponent
                key={cell.id}
                cell={cell}
                selected={
                  selectedCell?.x === cell.x && selectedCell?.y === cell.y
                }
                click={(clicked) => onCellClick(clicked)}
              />
            ))}
          </div>
        ))}

        <div className="column-labels">
          {columnLabels.map((label, i) => (
            <div key={i} className="column-label">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardGrid;
