import { Board } from "../Board";
import { Cell } from "../Cell";
import { updateKingCheckStatus } from "./boardStatus";
import { getLegalMovesInCheck, isMoveLegal } from "./boardMoves";

export function highlightCells(board: Board, selectedCell: Cell | null): void {
  for (let row of board.cells) {
    for (let cell of row) {
      cell.available = false;
    }
  }

  if (!selectedCell?.figure) return;

  const color = selectedCell.figure.color;
  let candidateMoves: Cell[] = [];

  if (board.isCheck(color)) {
    // Якщо шах — обмежити легальними ходами
    candidateMoves = getLegalMovesInCheck(board, selectedCell);
  } else {
    // Інакше — всі можливі ходи фігури
    for (let row of board.cells) {
      for (let cell of row) {
        if (selectedCell.figure.canMove(cell)) {
          candidateMoves.push(cell);
        }
      }
    }
  }

  // Остання перевірка — залишити лише ті, які дійсно дозволені
  for (let cell of candidateMoves) {
    if (isMoveLegal(board, selectedCell, cell)) {
      cell.available = true;
    }
  }

  updateKingCheckStatus(board);
}

