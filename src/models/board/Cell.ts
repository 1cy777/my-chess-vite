import { Colors } from '@/models/Colors';
import { Figure, FigureNames } from "@/models/figures/Figure";
import { Board } from "@/models/board/Board";

export class Cell {
  readonly x: number;
  readonly y: number;
  readonly color: Colors;
  figure: Figure | null;
  board: Board;
  available: boolean;
  id: number;
  isKingInCheck: boolean = false;
  isCheckmate: boolean = false;

  constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.figure = figure;
    this.board = board;
    this.available = false;
    this.id = Math.random()
  }

  isEmpty(): boolean {
    return this.figure === null;
  }

  isEnemy(target: Cell): boolean {
    if (target.figure) {
      return this.figure?.color !== target.figure.color;
    }
    return false;
  }

  isEmptyVertical(target: Cell): boolean {
    if (this.x !== target.x) {
      return false;
    }

    const min = Math.min(this.y, target.y);
    const max = Math.max(this.y, target.y);
    for (let y = min + 1; y < max; y++) {
      if (!this.board.getCell(this.x, y).isEmpty()) {
        return false
      }
    }
    return true;
  }

  isEmptyHorizontal(target: Cell): boolean {
    if (this.y !== target.y) {
      return false;
    }

    const min = Math.min(this.x, target.x);
    const max = Math.max(this.x, target.x);
    for (let x = min + 1; x < max; x++) {
      if (!this.board.getCell(x, this.y).isEmpty()) {
        return false
      }
    }
    return true;
  }

  isEmptyDiagonal(target: Cell): boolean {
    const absX = Math.abs(target.x - this.x);
    const absY = Math.abs(target.y - this.y);
    if (absY !== absX)
      return false;

    const dy = this.y < target.y ? 1 : -1
    const dx = this.x < target.x ? 1 : -1

    for (let i = 1; i < absY; i++) {
      if (!this.board.getCell(this.x + dx * i, this.y + dy * i).isEmpty())
        return false;
    }
    return true;
  }

  setFigure(figure: Figure) {
    this.figure = figure;
    this.figure.cell = this;
  }

  addLostFigure(figure: Figure) {
    figure.color === Colors.BLACK
      ? this.board.lostBlackFigures.push(figure)
      : this.board.lostWhiteFigures.push(figure)
  }

  moveFigure(target: Cell, onPawnPromote?: (cell: Cell) => void) {
    if (!target.available || !this.figure || !this.figure.canMove(target)) {
      return; // ❌ Забороняємо хід, якщо клітинка не активна
    }

    const movingFigure = this.figure;

    // --- En passant ---
    if (movingFigure.name === "Pawn" && target.figure === null && target.x !== this.x) {
      const direction = movingFigure.color === Colors.WHITE ? 1 : -1;
      const enemyCell = this.board.getCell(target.x, target.y + direction);
      const enemy = enemyCell.figure;
      if (enemy) {
        this.addLostFigure(enemy);
        enemyCell.figure = null;
      }
    }

    if (target.figure) {
      this.addLostFigure(target.figure);
    }

    if (movingFigure.name === "Pawn") {
      this.board.clearEnPassantFlags(movingFigure);
    }

    movingFigure.isFirstStep = false;
    movingFigure.moveFigure(target, onPawnPromote);
    target.setFigure(movingFigure);
    this.figure = null;

    // 🔁 Оновлення лічильника 50-ти ходів
    if (
      movingFigure.name === FigureNames.PAWN ||
      target.figure !== null
    ) {
      this.board.halfMoveClock = 0;
    } else {
      this.board.halfMoveClock++;
    }

    // 🔢 Збільшуємо повний номер ходу після кожного ходу чорних
    if (movingFigure.color === Colors.BLACK) {
      this.board.fullMoveNumber++;
    }

    if (
      movingFigure.name === FigureNames.PAWN &&
      (target.y === 0 || target.y === 7)
    ) {
      // Виводимо меню вибору фігури
      setTimeout(() => {
        this.board.promotePawn(target);
      });
    }

    const enemyColor = movingFigure.color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;

    // 🔁 PROMOTION CHECK
    if (movingFigure.name === FigureNames.PAWN && (target.y === 0 || target.y === 7)) {
      if (onPawnPromote) {
        onPawnPromote(target); // передаємо клітинку для модалки
        return;
      }
    }

    this.board.updateKingCheckStatus();

    // 🟨 Перевірка на нічийну ситуацію
    const drawMessage = this.board.checkForDrawConditions();
    if (drawMessage) {
      console.log(drawMessage);
      return;
    }

    // 🟥 Мат / шах
    if (this.board.isCheckmate(enemyColor)) {
      console.log(`Мат! ${movingFigure.color === Colors.WHITE ? "білі" : "чорні"} виграли гру!`);
    } else if (this.board.isCheck(enemyColor)) {
      console.log(`Шах! ${movingFigure.color === Colors.WHITE ? "білі" : "чорні"} під загрозою!`);
    }

    // 🆕 Генерація FEN після завершення ходу
    console.log(this.board.generateFEN(movingFigure.color));
  }

  isUnderAttack(color: Colors): boolean {
    const originalFigure = this.figure;
    this.figure = null; // тимчасово знімаємо фігуру з клітинки

    let underAttack = false;
    for (let row of this.board.cells) {
      for (let cell of row) {
        if (cell.figure && cell.figure.color !== color && cell.figure.attacksCell(this)) {
          underAttack = true;
          break;
        }
      }
      if (underAttack) break;
    }

    this.figure = originalFigure; // повертаємо фігуру назад
    return underAttack;
  }
} 