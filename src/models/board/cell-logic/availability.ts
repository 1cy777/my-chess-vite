import { Cell } from "../Cell";

export function isEmpty(cell: Cell): boolean {
  return cell.figure === null;
}

export function isEnemy(cell: Cell, target: Cell): boolean {
  return !!target.figure && cell.figure?.color !== target.figure.color;
}

export function isEmptyVertical(cell: Cell, target: Cell): boolean {
  if (cell.x !== target.x) return false;
  const min = Math.min(cell.y, target.y);
  const max = Math.max(cell.y, target.y);
  for (let y = min + 1; y < max; y++) {
    if (!cell.board.getCell(cell.x, y).isEmpty()) return false;
  }
  return true;
}

export function isEmptyHorizontal(cell: Cell, target: Cell): boolean {
  if (cell.y !== target.y) return false;
  const min = Math.min(cell.x, target.x);
  const max = Math.max(cell.x, target.x);
  for (let x = min + 1; x < max; x++) {
    if (!cell.board.getCell(x, cell.y).isEmpty()) return false;
  }
  return true;
}

export function isEmptyDiagonal(cell: Cell, target: Cell): boolean {
  const absX = Math.abs(target.x - cell.x);
  const absY = Math.abs(target.y - cell.y);
  if (absY !== absX) return false;

  const dx = cell.x < target.x ? 1 : -1;
  const dy = cell.y < target.y ? 1 : -1;

  for (let i = 1; i < absY; i++) {
    if (!cell.board.getCell(cell.x + dx * i, cell.y + dy * i).isEmpty())
      return false;
  }
  return true;
}
