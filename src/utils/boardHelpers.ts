import { Board } from '@/models/board/Board';

export const getOrderedRows = (board: Board, isFlipped: boolean) =>
  isFlipped ? [...board.cells].reverse().map(row => [...row].reverse()) : board.cells;

export const getColumnLabels = (isFlipped: boolean): string[] =>
  isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const getRowLabel = (rowIndex: number, isFlipped: boolean): number =>
  isFlipped ? rowIndex + 1 : 8 - rowIndex;