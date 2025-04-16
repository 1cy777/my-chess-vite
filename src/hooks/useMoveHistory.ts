import { useState } from "react";
import { MoveInfo } from "@/models/MoveInfo";
import { Colors } from "@/models/Colors";
import { Cell } from "@/models/board/Cell";
import { Figure, FigureNames } from "@/models/figures/Figure";
import { generateFEN, fromFEN } from "@/services/fen";
import { getNextColor } from "@/services/colorUtils";
import { Player } from "@/models/Player";
import { Board, } from "@/models/board/Board";
import { isCheck, isCheckmate, checkForDrawConditions } from "@/models/board/board-logic/boardStatus";

export function useMoveHistory(
  whitePlayer: Player,
  blackPlayer: Player,
  setBoard: (b: Board) => void,
  setCurrentPlayer: (p: Player) => void,
  setIsGameOver: (v: boolean) => void,
  setGameOverMessage: (msg: string | null) => void,
  setSelectedCell: (c: Cell | null) => void
) {
  const [fenHistory, setFenHistory] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<MoveInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

function handleMoveComplete(
  from: Cell,
  to: Cell,
  captured: Figure | null,
  promotion?: FigureNames,
  movedFigure?: Figure
) {
  const figure = movedFigure ?? from.figure;
  if (!figure) return;

  from.board.updateKingCheckStatus();

  const isKing = figure.name === FigureNames.KING;
  const isCastling = isKing && Math.abs(from.x - to.x) === 2;

  let notation = "";
  if (isCastling) {
    notation = to.x === 6 ? "O-O" : "O-O-O";
  } else {
    notation = `${figure.getFigureNotation()}${captured ? "x" : ""}${to.getChessNotation()}` +
      (promotion ? `=${promotion[0]}` : "");
  }

  const opponentColor = getNextColor(figure.color);

  const drawMessage = checkForDrawConditions(from.board);
  if (drawMessage) {
    setIsGameOver(true);
    setGameOverMessage(drawMessage);
  } else if (isCheckmate(from.board, opponentColor)) {
    notation += "#";
    setIsGameOver(true);
    setGameOverMessage(figure.color === Colors.WHITE ? "Білі виграли (мат)" : "Чорні виграли (мат)");
  } else if (isCheck(from.board, opponentColor)) {
    notation += "+";
  }

  const newMove: MoveInfo = {
    notation,
    figure: figure.getFigureNotation(),
    from: from.getChessNotation(),
    to: to.getChessNotation(),
    captured: captured?.getFigureNotation(),
    promotion,
    color: figure.color,
    fen: generateFEN(from.board, getNextColor(figure.color)),
  };

  setMoveHistory(prev => {
    const next = [...prev];
    const isWhite = figure.color === Colors.WHITE;
    const indexToWrite = currentIndex + 1;
  
    if (isWhite) {
      const whiteIndex = currentIndex % 2 === 0 ? currentIndex : currentIndex + 1;
  
      if (next[whiteIndex]?.color === Colors.WHITE) {
        next[whiteIndex] = newMove;
        return next.slice(0, whiteIndex + 1);
      } else {
        next.splice(whiteIndex, prev.length - whiteIndex, newMove);
      }
  
    } else {
      const blackIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex;
  
      if (next[blackIndex]?.color === Colors.BLACK) {
        next[blackIndex] = newMove;
        return next.slice(0, blackIndex + 1);
      } else {
        next.splice(blackIndex, prev.length - blackIndex, newMove);
      }
    }
  
    return next;
  });

  setFenHistory(prev => {
    const next = [...prev];
    const indexToWrite = currentIndex + 1;
  
    if (next[indexToWrite]) {
      next[indexToWrite] = newMove.fen;
      return next.slice(0, indexToWrite + 1);
    } else {
      next.splice(indexToWrite, prev.length - indexToWrite, newMove.fen);
    }
  
    return next;
  });

  setCurrentIndex(currentIndex + 1);
}

  function handleRestoreByIndex(index: number) {
    const fen = fenHistory[index];
    if (!fen) return;
  
    try {
      const { board: restoredBoard, currentColor } = fromFEN(fen);
      restoredBoard.updateKingCheckStatus();
      setBoard(restoredBoard);
      setCurrentPlayer(currentColor === Colors.WHITE ? whitePlayer : blackPlayer);
      setSelectedCell(null);
      setIsGameOver(false);
      setGameOverMessage(null);
      setCurrentIndex(index);
    } catch (e) {
      console.error("Помилка при відновленні з FEN:", e);
    }
  }  

  function resetHistory() {
    setMoveHistory([]);
    setFenHistory([]);
    setCurrentIndex(-1);
  }

  return {
    moveHistory,
    fenHistory,
    currentIndex,
    setFenHistory,
    handleMoveComplete,
    handleRestoreByIndex,
    resetHistory,
    setCurrentIndex
  };
}