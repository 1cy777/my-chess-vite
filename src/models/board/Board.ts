import { Cell } from "./Cell";
import { Colors } from '@/models/Colors';
import { Pawn } from "../figures/Pawn";
import { King } from "../figures/King";
import { Queen } from "../figures/Queen";
import { Bishop } from "../figures/Bishop";
import { Knight } from "../figures/Knight";
import { Rook } from "../figures/Rook";
import { Figure, FigureNames } from "../figures/Figure";

export class Board {
  cells: Cell[][] = []
  lostBlackFigures: Figure[] = []
  lostWhiteFigures: Figure[] = []
  public enPassantTarget: Cell | null = null;
  public halfMoveClock: number = 0;
  public fullMoveNumber: number = 1;

  public initCells() {
    for (let i = 0; i < 8; i++) {
      const row: Cell[] = []
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 !== 0) {
          row.push(new Cell(this, j, i, Colors.BLACK, null)) // Черные ячейки
        } else {
          row.push(new Cell(this, j, i, Colors.WHITE, null)) // белые
        }
      }
      this.cells.push(row);
    }
  }

  public getCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.cells = this.cells;
    newBoard.lostWhiteFigures = this.lostWhiteFigures
    newBoard.lostBlackFigures = this.lostBlackFigures
    return newBoard;
  }

  public highlightCells(selectedCell: Cell | null) {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        target.available = false; // скидуємо доступність
      }
    }

    if (!selectedCell?.figure) return;

    const color = selectedCell.figure.color;

    if (this.isCheck(color)) {
      const legalMoves = this.getLegalMovesInCheck(selectedCell);
      for (let cell of legalMoves) {
        cell.available = true;
      }
    } else {
      for (let i = 0; i < this.cells.length; i++) {
        for (let j = 0; j < this.cells[i].length; j++) {
          const target = this.cells[i][j];
          target.available = !!selectedCell?.figure?.canMove(target);
        }
      }
    }

    for (let row of this.cells) {
      for (let cell of row) {
        cell.available =
          selectedCell?.figure?.canMove(cell) &&
          this.isMoveLegal(selectedCell, cell); // ✅ ЗАБОРОНЯЄМО зв’язані ходи
      }
    }
    
    this.updateKingCheckStatus();
  }


  public getCell(x: number, y: number) {
    return this.cells[y][x]
  }

  clearEnPassantFlags(exceptPawn: Figure) {
    this.cells.forEach(row => {
      row.forEach(cell => {
        const figure = cell.figure;
        if (figure instanceof Pawn && figure !== exceptPawn) {
          figure.canBeCapturedEnPassant = false;
        }
      });
    });
  }

  public findKing(color: Colors): Cell | null {
    for (let row of this.cells) {
      for (let cell of row) {
        if (cell.figure?.name === FigureNames.KING && cell.figure.color === color) {
          return cell;
        }
      }
    }
    return null;
  }

  public isCheck(color: Colors): boolean {
    const kingCell = this.findKing(color);
    if (!kingCell) return false;
    return kingCell.isUnderAttack(color);
  }

  public isCheckmate(color: Colors): boolean {
    if (!this.isCheck(color)) return false;

    for (let row of this.cells) {
      for (let cell of row) {
        const figure = cell.figure;
        if (figure?.color === color) {
          for (let row2 of this.cells) {
            for (let target of row2) {
              if (figure.canMove(target)) {
                // тимчасово зробимо хід
                const originalFigure = target.figure;
                const sourceCell = cell;
                const targetCell = target;

                sourceCell.figure = null;
                targetCell.figure = figure;
                figure.cell = targetCell;

                const stillInCheck = this.isCheck(color);

                // відкат
                targetCell.figure = originalFigure;
                sourceCell.figure = figure;
                figure.cell = sourceCell;

                if (!stillInCheck) {
                  return false; // є хоча б один рятівний хід
                }
              }
            }
          }
        }
      }
    }
    return true;
  }

  public updateKingCheckStatus(): void {
    // Скидаємо попередній статус
    for (let row of this.cells) {
      for (let cell of row) {
        cell.isKingInCheck = false;
        cell.isCheckmate = false; // 👈 Очищаємо прапорець мата
      }
    }

    const whiteKingCell = this.findKing(Colors.WHITE);
    const blackKingCell = this.findKing(Colors.BLACK);

    if (whiteKingCell) {
      if (this.isCheckmate(Colors.WHITE)) {
        whiteKingCell.isCheckmate = true; // 👈 Мат
      } else if (this.isCheck(Colors.WHITE)) {
        whiteKingCell.isKingInCheck = true; // 👈 Шах
      }
    }

    if (blackKingCell) {
      if (this.isCheckmate(Colors.BLACK)) {
        blackKingCell.isCheckmate = true;
      } else if (this.isCheck(Colors.BLACK)) {
        blackKingCell.isKingInCheck = true;
      }
    }
  }


  public getLegalMovesInCheck(selectedCell: Cell): Cell[] {
    const figure = selectedCell.figure;
    if (!figure) return [];

    const currentColor = figure.color;
    const possibleMoves: Cell[] = [];

    for (let row of this.cells) {
      for (let target of row) {
        if (figure.canMove(target)) {
          const originalFigure = target.figure;
          const sourceCell = selectedCell;
          const targetCell = target;

          // Симулюємо хід
          sourceCell.figure = null;
          targetCell.figure = figure;
          figure.cell = targetCell;

          const stillInCheck = this.isCheck(currentColor);

          // Відкат
          targetCell.figure = originalFigure;
          sourceCell.figure = figure;
          figure.cell = sourceCell;

          if (!stillInCheck) {
            possibleMoves.push(target);
          }
        }
      }
    }

    return possibleMoves;
  }

  public hasAvailableMoves(cell: Cell): boolean {
    const figure = cell.figure;
    if (!figure) return false;

    for (let row of this.cells) {
      for (let target of row) {
        if (figure.canMove(target)) {
          // Симулюємо хід
          const originalFigure = target.figure;
          const sourceCell = cell;

          sourceCell.figure = null;
          target.figure = figure;
          figure.cell = target;

          const stillInCheck = this.isCheck(figure.color);

          // Відкат
          target.figure = originalFigure;
          sourceCell.figure = figure;
          figure.cell = sourceCell;

          if (!stillInCheck) return true;
        }
      }
    }
    return false;
  }

  promotePawn(cell: Cell) {
    const options = ["queen", "rook", "knight", "bishop"];
    const choice = prompt("Виберіть фігуру для перетворення: queen, rook, knight, bishop")?.toLowerCase();

    let newFigure;

    switch (choice) {
      case "rook":
        newFigure = new Rook(cell.figure!.color, cell);
        break;
      case "bishop":
        newFigure = new Bishop(cell.figure!.color, cell);
        break;
      case "knight":
        newFigure = new Knight(cell.figure!.color, cell);
        break;
      default:
        newFigure = new Queen(cell.figure!.color, cell);
    }

    cell.setFigure(newFigure);
  }

  public isStalemate(color: Colors): boolean {
    // 1. Якщо король у шаху — не пат
    if (this.isCheck(color)) return false;

    // 2. Перевіряємо всі фігури цього кольору: чи є хоч один доступний хід
    for (let row of this.cells) {
      for (let cell of row) {
        const figure = cell.figure;
        if (figure?.color === color) {
          for (let targetRow of this.cells) {
            for (let target of targetRow) {
              if (figure.canMove(target)) {
                // Симулюємо хід
                const originalFigure = target.figure;
                const sourceCell = cell;
                const targetCell = target;

                sourceCell.figure = null;
                targetCell.figure = figure;
                figure.cell = targetCell;

                const stillInCheck = this.isCheck(color);

                // Відкат
                targetCell.figure = originalFigure;
                sourceCell.figure = figure;
                figure.cell = sourceCell;

                if (!stillInCheck) {
                  return false; // Є хоча б один допустимий хід
                }
              }
            }
          }
        }
      }
    }

    return true; // Немає допустимих ходів і немає шаху — ПАТ
  }

  public isInsufficientMaterial(): boolean {
    const allFigures = this.cells.flat().map(cell => cell.figure).filter(Boolean);

    const nonKings = allFigures.filter(fig => fig!.name !== FigureNames.KING);

    if (nonKings.length === 0) {
      return true; // тільки 2 королі
    }

    if (nonKings.length === 1) {
      const fig = nonKings[0];
      return (
        fig!.name === FigureNames.BISHOP ||
        fig!.name === FigureNames.KNIGHT
      );
    }

    return false;
  }

  public checkForDrawConditions(): string | null {
    if (this.isStalemate(Colors.WHITE) || this.isStalemate(Colors.BLACK)) {
      return "Пат — нічия";
    }
  
    if (this.isInsufficientMaterial()) {
      return "Нічия через недостатній матеріал";
    }
  
    if (this.halfMoveClock >= 100) {
      return "Нічия за правилом 50-ти ходів";
    }
  
    return null;
  }
  

  public generateFEN(currentPlayer: Colors): string {
    let fen = "";

    for (let y = 0; y < 8; y++) {
      let emptyCount = 0;
      for (let x = 0; x < 8; x++) {
        const figure = this.getCell(x, y).figure;
        if (!figure) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }

          const symbol = this.getFENSymbol(figure);
          fen += symbol;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      if (y !== 7) fen += "/";
    }

    // Хто ходить
    fen += ` ${currentPlayer === Colors.WHITE ? "w" : "b"}`;

    // Права на рокіровку (спростимо: тільки якщо король/тура не рухались)
    let castling = "";
    const whiteKing = this.findKing(Colors.WHITE)?.figure;
    const blackKing = this.findKing(Colors.BLACK)?.figure;

    if (whiteKing?.isFirstStep) {
      if (this.getCell(7, 7).figure?.isFirstStep) castling += "K";
      if (this.getCell(0, 7).figure?.isFirstStep) castling += "Q";
    }

    if (blackKing?.isFirstStep) {
      if (this.getCell(7, 0).figure?.isFirstStep) castling += "k";
      if (this.getCell(0, 0).figure?.isFirstStep) castling += "q";
    }

    fen += ` ${castling || "-"}`;

    // En passant
    if (this.enPassantTarget) {
      const file = String.fromCharCode("a".charCodeAt(0) + this.enPassantTarget.x);
      const rank = 8 - this.enPassantTarget.y;
      fen += ` ${file}${rank}`;
    } else {
      fen += " -";
    }

    // Halfmove clock
    fen += ` ${this.halfMoveClock}`;

    // Fullmove number
    fen += ` ${this.fullMoveNumber}`;

    return fen;
  }

  private getFENSymbol(figure: Figure): string {
    const map: Record<string, string> = {
      [FigureNames.PAWN]: "p",
      [FigureNames.ROOK]: "r",
      [FigureNames.KNIGHT]: "n",
      [FigureNames.BISHOP]: "b",
      [FigureNames.QUEEN]: "q",
      [FigureNames.KING]: "k",
    };

    const symbol = map[figure.name];
    return figure.color === Colors.WHITE ? symbol.toUpperCase() : symbol;
  }

  public isMoveLegal(from: Cell, to: Cell): boolean {
    const figure = from.figure;
    if (!figure) return false;
  
    if (!figure.canMove(to)) return false;
  
    const originalFigure = to.figure;
  
    // Тимчасово виконуємо хід
    from.figure = null;
    to.figure = figure;
    figure.cell = to;
  
    const stillInCheck = this.isCheck(figure.color);
  
    // Відкат ходу
    to.figure = originalFigure;
    from.figure = figure;
    figure.cell = from;
  
    return !stillInCheck;
  }  

  public addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getCell(i, 1))
      new Pawn(Colors.WHITE, this.getCell(i, 6))
    }
  }

  private addKings() {
    new King(Colors.BLACK, this.getCell(4, 0))
    new King(Colors.WHITE, this.getCell(4, 7))
  }

  private addQueens() {
    new Queen(Colors.BLACK, this.getCell(3, 0))
    new Queen(Colors.WHITE, this.getCell(3, 7))
  }

  private addBishops() {
    new Bishop(Colors.BLACK, this.getCell(2, 0))
    new Bishop(Colors.BLACK, this.getCell(5, 0))
    new Bishop(Colors.WHITE, this.getCell(2, 7))
    new Bishop(Colors.WHITE, this.getCell(5, 7))
  }

  private addKnights() {
    new Knight(Colors.BLACK, this.getCell(1, 0))
    new Knight(Colors.BLACK, this.getCell(6, 0))
    new Knight(Colors.WHITE, this.getCell(1, 7))
    new Knight(Colors.WHITE, this.getCell(6, 7))
  }

  private addRooks() {
    new Rook(Colors.BLACK, this.getCell(0, 0))
    new Rook(Colors.BLACK, this.getCell(7, 0))
    new Rook(Colors.WHITE, this.getCell(0, 7))
    new Rook(Colors.WHITE, this.getCell(7, 7))
  }

  // public addFisherFigures() {
  //
  // }

  public addFigures() {
    this.addPawns()
    this.addKnights()
    this.addKings()
    this.addBishops()
    this.addQueens()
    this.addRooks()
  }
}