// src/hooks/useMoveHistory.ts
//
// Головний хук, який веде історію ходів і, за потреби, керує Stockfish‑ботом.
// Актуальна версія з підтримкою будь‑якого кольору бота й примусовим
// rerender’ом дошки після його ходу.

import { useState, useEffect } from "react";

import { MoveInfo } from "@/models/MoveInfo";
import { Colors } from "@/models/Colors";
import { Cell } from "@/models/board/Cell";
import { Figure, FigureNames } from "@/models/figures/Figure";
import { generateFEN, fromFEN } from "@/services/fen";
import { getNextColor } from "@/services/colorUtils";
import { Player } from "@/models/Player";
import { Board } from "@/models/board/Board";
import {
  isCheck,
  isCheckmate,
  checkForDrawConditions,
} from "@/models/board/board-logic/boardStatus";
import { getBestMove } from "@/services/stockfishBot";
import { fromNotation } from "@/services/moveParser";

export function useMoveHistory(
  whitePlayer: Player,
  blackPlayer: Player,
  setBoard: (b: Board) => void,
  setCurrentPlayer: (p: Player) => void,
  setIsGameOver: (v: boolean) => void,
  setGameOverMessage: (msg: string | null) => void,
  setSelectedCell: (c: Cell | null) => void,
  setHasGameStarted: (v: boolean) => void,
  vsBot: boolean,
  botColor: Colors,                           // 🆕 хто грає за бота
  getCurrentPlayer: () => Player | null,
  getCurrentBoard: () => Board,
  swapPlayer: () => void,
  isGameOver: boolean,
  botDepth = 8
) {
  /* ---------- state ---------- */
  const [fenHistory, setFenHistory]   = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<MoveInfo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [botThinking, setBotThinking]   = useState(false);

  /* ---------- async Stockfish хід ---------- */
  const makeBotMove = async () => {
    if (botThinking) return; // захист від подвійного виклику

    const player = getCurrentPlayer();
    const board  = getCurrentBoard();

    if (!player || player.color !== botColor || isGameOver) return;

    setBotThinking(true);
    const fen = generateFEN(board, botColor);
    console.log("[Bot] FEN →", fen);

    try {
      const uci = await getBestMove(fen, botDepth);
      console.log("[Bot] bestmove", uci);

      const parsed = fromNotation(board, uci);
      if (!parsed) throw new Error("Cannot parse bot move " + uci);

      const { from, to } = parsed;
      const captured: Figure | null = to.figure ?? null;

      /* 1. змінюємо модель дошки */
      to.setFigure(from.figure!);
      from.figure = null;

      /* 2. фіксуємо хід (мат / шах / історія) */
      handleMoveComplete(from, to, captured);

      /* 3. примушуємо React відрендерити нову дошку */
      setBoard(board.getCopyBoard());

      /* 4. передаємо хід людині */
      swapPlayer();
    } catch (e) {
      console.error("[Bot] error:", e);
    } finally {
      setBotThinking(false);
    }
  };

  /* ---------- тригер бота після ходу суперника ---------- */
  useEffect(() => {
    if (!vsBot) return;

    const lastMove   = moveHistory.at(-1);
    const nextPlayer = getCurrentPlayer();

    if (
      lastMove?.color !== botColor &&        // останнім ходив суперник
      nextPlayer?.color === botColor &&      // тепер черга бота
      !isGameOver
    ) {
      queueMicrotask(() => makeBotMove());
    }
  }, [moveHistory, vsBot, botColor, isGameOver]);

  /* ---------- автопочаток, якщо бот — білі ---------- */
  useEffect(() => {
    if (
      vsBot &&
      moveHistory.length === 0 &&
      getCurrentPlayer()?.color === botColor &&
      !isGameOver
    ) {
      queueMicrotask(() => makeBotMove());
    }
  }, [vsBot, botColor, isGameOver]);

  /* ---------- запис ходу (спільний для людини і бота) ---------- */
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

    /* нотація & статус */
    const isKing      = figure.name === FigureNames.KING;
    const isCastling  = isKing && Math.abs(from.x - to.x) === 2;

    let notation = isCastling
      ? to.x === 6
        ? "O-O"
        : "O-O-O"
      : `${figure.getFigureNotation()}${captured ? "x" : ""}${to.getChessNotation()}` +
        (promotion ? `=${promotion[0]}` : "");

    const opponent = getNextColor(figure.color);
    const drawMsg  = checkForDrawConditions(from.board);

    if (drawMsg) {
      setIsGameOver(true);
      setGameOverMessage(drawMsg);
    } else if (isCheckmate(from.board, opponent)) {
      notation += "#";
      setIsGameOver(true);
      setGameOverMessage(
        figure.color === Colors.WHITE
          ? "Білі виграли (мат)"
          : "Чорні виграли (мат)"
      );
    } else if (isCheck(from.board, opponent)) {
      notation += "+";
    }

    /* формуємо запис MoveInfo */
    const info: MoveInfo = {
      notation,
      figure:    figure.getFigureNotation(),
      from:      from.getChessNotation(),
      to:        to.getChessNotation(),
      captured:  captured?.getFigureNotation(),
      promotion,
      color:     figure.color,
      fen:       generateFEN(from.board, getNextColor(figure.color)),
    };

    /* оновлюємо історію */
    setMoveHistory(prev => {
      const next = [...prev];
      const idx  = currentIndex + 1;
      next[idx]  = info;
      return next.slice(0, idx + 1);
    });

    if (currentIndex === -1) setHasGameStarted(true);

    setFenHistory(prev => {
      const next = [...prev];
      next[currentIndex + 1] = info.fen;
      return next;
    });

    setCurrentIndex(i => i + 1);
  }

  /* ---------- навігація по історії ---------- */
  function handleRestoreByIndex(idx: number) {
    const fen = fenHistory[idx];
    if (!fen) return;

    try {
      const { board, currentColor } = fromFEN(fen);
      board.updateKingCheckStatus();
      setBoard(board);
      setCurrentPlayer(currentColor === Colors.WHITE ? whitePlayer : blackPlayer);
      setSelectedCell(null);
      setIsGameOver(false);
      setGameOverMessage(null);
      setCurrentIndex(idx);
    } catch (e) {
      console.error("FEN restore error", e);
    }
  }

  /* ---------- скидання ---------- */
  function resetHistory() {
    setMoveHistory([]);
    setFenHistory([]);
    setCurrentIndex(-1);
  }

  /* ---------- публічний API хука ---------- */
  return {
    moveHistory,
    fenHistory,
    currentIndex,
    setFenHistory,
    handleMoveComplete,
    handleRestoreByIndex,
    resetHistory,
    setCurrentIndex,
    botThinking,
  };
}
