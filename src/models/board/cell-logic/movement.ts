import { Cell } from "../Cell";
import { FigureNames } from "@/models/figures/Figure";
import { Colors } from "@/models/Colors";
import { generateFEN } from "@/services/fen";
import { getNextColor } from "@/services/colorUtils";

function updateEnPassantTarget(board: Cell["board"], from: Cell, to: Cell): void {
  const figure = to.figure; // важливо: фігура вже переміщена
  const isPawn = figure?.name === FigureNames.PAWN;
  const twoStepMove = Math.abs(from.y - to.y) === 2;

  if (isPawn && twoStepMove) {
    const midY = (from.y + to.y) / 2;
    board.enPassantTarget = board.getCell(to.x, midY);
  } else {
    board.enPassantTarget = null;
  }
}
/**
 * Основна логіка переміщення фігури з клітинки `cell` до `target`.
 * Обробляє: взяття, en passant, просування пішака, оновлення лічильників, FEN, шах/мат.
 */
export function moveFigureLogic(
  cell: Cell,
  target: Cell,
  onPawnPromote?: (cell: Cell) => void
): void {
  const movingFigure = cell.figure;

  if (!target.available || !movingFigure || !movingFigure.canMove(target)) {
    return;
  }

  // --- Взяття на проході (en passant) ---
  if (
    movingFigure.name === FigureNames.PAWN &&
    target.figure === null &&
    target.x !== cell.x
  ) {
    const direction = movingFigure.color === Colors.WHITE ? 1 : -1;
    const enemyCell = cell.board.getCell(target.x, target.y + direction);
    const enemy = enemyCell.figure;
    if (enemy) {
      cell.addLostFigure(enemy);
      enemyCell.figure = null;
    }
  }

  // --- Звичайне взяття ---
  if (target.figure) {
    cell.addLostFigure(target.figure);
  }

  // --- Скидання en passant прапорців ---
  if (movingFigure.name === FigureNames.PAWN) {
    cell.board.clearEnPassantFlags(movingFigure);
  }

  // --- Переміщення фігури ---
  movingFigure.isFirstStep = false;
  movingFigure.moveFigure(target, onPawnPromote);
  target.setFigure(movingFigure);
  cell.figure = null;


  // --- En passant (встановлення або скидання) ---
  updateEnPassantTarget(cell.board, cell, target);
  // --- Лічильник 50-ти ходів ---
  if (
    movingFigure.name === FigureNames.PAWN ||
    target.figure !== null
  ) {
    cell.board.halfMoveClock = 0;
  } else {
    cell.board.halfMoveClock++;
  }

  // --- Збільшення номера ходу після кожного ходу чорних ---
  if (movingFigure.color === Colors.BLACK) {
    cell.board.fullMoveNumber++;
  }

  // --- Обробка промоції пішака ---
  if (
    movingFigure.name === FigureNames.PAWN &&
    (target.y === 0 || target.y === 7)
  ) {
    if (onPawnPromote) {
      onPawnPromote(target); // викликає модалку
      return;
    }
  }

  // --- Оновлення шахів ---
  cell.board.updateKingCheckStatus();

  // --- Генерація FEN після ходу ---
  const nextColor = getNextColor(movingFigure.color);
  console.log(generateFEN(cell.board, nextColor));
}
