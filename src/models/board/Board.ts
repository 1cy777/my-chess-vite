import { Cell } from "./Cell";
import { Colors } from '@/models/Colors';
import { Pawn } from "../figures/Pawn";
import { King } from "../figures/King";
import { Queen } from "../figures/Queen";
import { Bishop } from "../figures/Bishop";
import { Knight } from "../figures/Knight";
import { Rook } from "../figures/Rook";
import { Figure } from "../figures/Figure";

import * as BoardStatus from "./board-logic/boardStatus";
import * as BoardMoves from "./board-logic/boardMoves";
import { highlightCells } from "./board-logic/highlight";
import { clearEnPassantFlags } from "./board-logic/enPassantUtils";

export class Board {
  cells: Cell[][] = [];
  lostBlackFigures: Figure[] = [];
  lostWhiteFigures: Figure[] = [];
  public enPassantTarget: Cell | null = null;
  public halfMoveClock: number = 0;
  public fullMoveNumber: number = 1;

  public initCells() {
    for (let i = 0; i < 8; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < 8; j++) {
        const color = (i + j) % 2 !== 0 ? Colors.BLACK : Colors.WHITE;
        row.push(new Cell(this, j, i, color, null));
      }
      this.cells.push(row);
    }
  }

  public getCell(x: number, y: number) {
    return this.cells[y][x];
  }

  public getCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.cells = this.cells;
    newBoard.lostWhiteFigures = this.lostWhiteFigures;
    newBoard.lostBlackFigures = this.lostBlackFigures;
    newBoard.enPassantTarget = this.enPassantTarget;
    newBoard.halfMoveClock = this.halfMoveClock;
    newBoard.fullMoveNumber = this.fullMoveNumber;
    return newBoard;
  }

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

  public hasAvailableMoves(cell: Cell): boolean {
    return BoardMoves.hasAvailableMoves(this, cell);
  }

  public getLegalMovesInCheck(cell: Cell): Cell[] {
    return BoardMoves.getLegalMovesInCheck(this, cell);
  }

  public isMoveLegal(from: Cell, to: Cell): boolean {
    return BoardMoves.isMoveLegal(this, from, to);
  }
  
  public addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getCell(i, 1));
      new Pawn(Colors.WHITE, this.getCell(i, 6));
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

  public addFigures() {
    this.addPawns();
    this.addKnights();
    this.addKings();
    this.addBishops();
    this.addQueens();
    this.addRooks();
  }
}