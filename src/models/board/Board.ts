// src/models/board/Board.ts
import { Cell } from "./Cell";
import { Colors } from "@/models/Colors";
import { Pawn } from "../figures/Pawn";
import { King } from "../figures/King";
import { Queen } from "../figures/Queen";
import { Bishop } from "../figures/Bishop";
import { Knight } from "../figures/Knight";
import { Rook } from "../figures/Rook";
import { Figure, FigureNames } from "../figures/Figure";

import * as BoardStatus from "./board-logic/boardStatus";
import * as BoardMoves from "./board-logic/boardMoves";
import { highlightCells } from "./board-logic/highlight";
import { clearEnPassantFlags } from "./board-logic/enPassantUtils";

/** Шахова дошка (8 × 8) + усі службові поля */
export class Board {
  cells: Cell[][] = [];
  lostBlackFigures: Figure[] = [];
  lostWhiteFigures: Figure[] = [];

  /** клітинка, у яку можна взяти en‑passant */
  public enPassantTarget: Cell | null = null;

  /** напівходи з останнього взяття/руху пішака (для правила 50‑ти) */
  public halfMoveClock = 0;
  /** номер повного ходу (зростає після кожного чорного) */
  public fullMoveNumber = 1;

  /* ---------- ініціалізація ---------- */

  public initCells() {
    for (let y = 0; y < 8; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < 8; x++) {
        const color = (x + y) % 2 !== 0 ? Colors.BLACK : Colors.WHITE;
        row.push(new Cell(this, x, y, color, null));
      }
      this.cells.push(row);
    }
  }

  public getCell(x: number, y: number) {
    return this.cells[y][x];
  }

  /* ---------- КОПІЯ, що триґерить rerender ---------- */
  /**
   * Повертає **глибоку** копію дошки:
   *   – створюємо нові Cell → React бачить нові посилання і перерендерює;
   *   – figure залишаємо тим самим об’єктом, бо він зберігає стани (isFirstStep тощо).
   */
  public getCopyBoard(): Board {
    const newBoard = new Board();
  
    newBoard.cells = this.cells.map(row =>
      row.map(cell => {
        // 1) створюємо нову клітинку без фігури
        const cloneCell = new Cell(
          newBoard,
          cell.x,
          cell.y,
          cell.color,
          null
        );
        cloneCell.available     = cell.available;
        cloneCell.isKingInCheck = cell.isKingInCheck;
        cloneCell.isCheckmate   = cell.isCheckmate;
  
        // 2) якщо на оригіналі стоїть фігура — клонюємо її
        if (cell.figure) {
          const orig = cell.figure;
          let figClone: Figure;
  
          switch (orig.name) {
            case FigureNames.PAWN:
              figClone = new Pawn(orig.color, cloneCell);
              (figClone as Pawn).canBeCapturedEnPassant = orig.canBeCapturedEnPassant;
              break;
            case FigureNames.KNIGHT:
              figClone = new Knight(orig.color, cloneCell);
              break;
            case FigureNames.BISHOP:
              figClone = new Bishop(orig.color, cloneCell);
              break;
            case FigureNames.ROOK:
              figClone = new Rook(orig.color, cloneCell);
              break;
            case FigureNames.QUEEN:
              figClone = new Queen(orig.color, cloneCell);
              break;
            case FigureNames.KING:
              figClone = new King(orig.color, cloneCell);
              break;
            default:
              throw new Error("Unknown figure type");
          }
  
          // скопіюємо прапор першого кроку (для пешки)
          figClone.isFirstStep = orig.isFirstStep;
        }
  
        return cloneCell;
      })
    );
  
    // 3) копіюємо втрати
    newBoard.lostWhiteFigures = this.lostWhiteFigures.map(orig => {
      const clone = (() => {
        // аналогічно до вище: клон фігури, але без cell
        switch (orig.name) {
          case FigureNames.PAWN:   return new Pawn(orig.color, newBoard.getCell(0,0));
          case FigureNames.KNIGHT: return new Knight(orig.color, newBoard.getCell(0,0));
          case FigureNames.BISHOP: return new Bishop(orig.color, newBoard.getCell(0,0));
          case FigureNames.ROOK:   return new Rook(orig.color,   newBoard.getCell(0,0));
          case FigureNames.QUEEN:  return new Queen(orig.color,  newBoard.getCell(0,0));
          case FigureNames.KING:   return new King(orig.color,   newBoard.getCell(0,0));
          default: throw "";
        }
      })();
      clone.isFirstStep = orig.isFirstStep;
      return clone;
    });
    newBoard.lostBlackFigures = this.lostBlackFigures.map(orig => {
      // ...те ж саме для чорних
            const clone = (() => {
        // аналогічно до вище: клон фігури, але без cell
        switch (orig.name) {
          case FigureNames.PAWN:   return new Pawn(orig.color, newBoard.getCell(0,0));
          case FigureNames.KNIGHT: return new Knight(orig.color, newBoard.getCell(0,0));
          case FigureNames.BISHOP: return new Bishop(orig.color, newBoard.getCell(0,0));
          case FigureNames.ROOK:   return new Rook(orig.color,   newBoard.getCell(0,0));
          case FigureNames.QUEEN:  return new Queen(orig.color,  newBoard.getCell(0,0));
          case FigureNames.KING:   return new King(orig.color,   newBoard.getCell(0,0));
          default: throw "";
        }
      })();
      clone.isFirstStep = orig.isFirstStep;
      return clone;
    });
  
    // 4) enPassant
    newBoard.enPassantTarget = this.enPassantTarget
      ? newBoard.getCell(this.enPassantTarget.x, this.enPassantTarget.y)
      : null;
  
    newBoard.halfMoveClock  = this.halfMoveClock;
    newBoard.fullMoveNumber = this.fullMoveNumber;
  
    return newBoard;
  }

  /* ---------- утиліти для підсвічування/перевірок ---------- */

  public highlightCells(selectedCell: Cell | null) {
    highlightCells(this, selectedCell);
  }

  public clearEnPassantFlags(exceptPawn: Figure) {
    clearEnPassantFlags(this, exceptPawn);
  }

  public isCheck(color: Colors): boolean {
    return BoardStatus.isCheck(this, color);
  }

  public isCheckmate(color: Colors): boolean {
    return BoardStatus.isCheckmate(this, color);
  }

  public isStalemate(color: Colors): boolean {
    return BoardStatus.isStalemate(this, color);
  }

  public isInsufficientMaterial(): boolean {
    return BoardStatus.isInsufficientMaterial(this);
  }

  public checkForDrawConditions(): string | null {
    return BoardStatus.checkForDrawConditions(this);
  }

  public updateKingCheckStatus(): void {
    BoardStatus.updateKingCheckStatus(this);
  }

  public findKing(color: Colors) {
    return BoardStatus.findKing(this, color);
  }

  /* ---------- рухи і їх перевірки ---------- */

  public hasAvailableMoves(cell: Cell): boolean {
    return BoardMoves.hasAvailableMoves(this, cell);
  }

  public getLegalMovesInCheck(cell: Cell): Cell[] {
    return BoardMoves.getLegalMovesInCheck(this, cell);
  }

  public isMoveLegal(from: Cell, to: Cell): boolean {
    return BoardMoves.isMoveLegal(this, from, to);
  }

  /* ---------- розставляння фігур ---------- */

  private addPawns() {
    for (let x = 0; x < 8; x++) {
      new Pawn(Colors.BLACK, this.getCell(x, 1));
      new Pawn(Colors.WHITE, this.getCell(x, 6));
    }
  }
  private addKings() {
    new King(Colors.BLACK, this.getCell(4, 0));
    new King(Colors.WHITE, this.getCell(4, 7));
  }
  private addQueens() {
    new Queen(Colors.BLACK, this.getCell(3, 0));
    new Queen(Colors.WHITE, this.getCell(3, 7));
  }
  private addBishops() {
    new Bishop(Colors.BLACK, this.getCell(2, 0));
    new Bishop(Colors.BLACK, this.getCell(5, 0));
    new Bishop(Colors.WHITE, this.getCell(2, 7));
    new Bishop(Colors.WHITE, this.getCell(5, 7));
  }
  private addKnights() {
    new Knight(Colors.BLACK, this.getCell(1, 0));
    new Knight(Colors.BLACK, this.getCell(6, 0));
    new Knight(Colors.WHITE, this.getCell(1, 7));
    new Knight(Colors.WHITE, this.getCell(6, 7));
  }
  private addRooks() {
    new Rook(Colors.BLACK, this.getCell(0, 0));
    new Rook(Colors.BLACK, this.getCell(7, 0));
    new Rook(Colors.WHITE, this.getCell(0, 7));
    new Rook(Colors.WHITE, this.getCell(7, 7));
  }

  /** Повна стартова розстановка */
  public addFigures() {
    this.addPawns();
    this.addKnights();
    this.addKings();
    this.addBishops();
    this.addQueens();
    this.addRooks();
  }
}
