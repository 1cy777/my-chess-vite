import React, { FC } from 'react';
import { Cell } from "@/models/board/Cell";

interface CellProps {
  cell: Cell;
  selected: boolean;
  click: (cell: Cell) => void;
}

const CellComponent: FC<CellProps> = ({ cell, selected, click }) => {
  return (
    <div
      className={[
        'cell',
        cell.color,
        selected ? "selected" : '',
        cell.isCheckmate ? "checkmate" : (cell.isKingInCheck ? "in-check" : '')
      ].join(' ')}
      onClick={() => click(cell)}
      style={{ background: cell.available && cell.figure ? 'green' : '' }}
    >
      {cell.available && !cell.figure && <div className="available" />}
      {cell.figure?.logo && (<img src={cell.figure.logo} alt=""
      style={{ width: '90%', height: '90%', objectFit: 'contain' }}/>)}
    </div>
  );
};

export default CellComponent;