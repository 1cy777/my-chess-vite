// src/App.tsx
import React, { useState, useEffect, useMemo } from "react";
import "@/styles/App.css";
import BoardComponent from "@/components/board/Board";
import { Board } from "@/models/board/Board";
import { Player } from "@/models/Player";
import { Colors } from "@/models/Colors";
import Timer from "@/components/ui/Timer";
import PromotionModal from "@/modals/PromotionModal";
import { FigureNames } from "@/models/figures/Figure";
import { Cell } from "@/models/board/Cell";
import { Rook } from "@/models/figures/Rook";
import { Knight } from "@/models/figures/Knight";
import { Bishop } from "@/models/figures/Bishop";
import { Queen } from "@/models/figures/Queen";
import HistoryPanel from "@/components/ui/HistoryPanel";
import { useMoveHistory } from "@/hooks/useMoveHistory";
import { generateFEN } from "@/services/fen";
import ControlButtons from "@/components/ui/ControlButtons";
import StartMenu from "@/components/ui/StartMenu";
import CapturedPanel from "@/components/ui/CapturedPanel";
import GameOverModal from "@/modals/GameOverModal";

function App() {
  /* ---------- локальний state ---------- */
  const [showMenu, setShowMenu] = useState(true);
  const [flip, setFlip] = useState(false);
  const [initialTime, setInitialTime] = useState(300);

  const [board, setBoard] = useState(new Board());
  const whitePlayer = useMemo(() => new Player(Colors.WHITE), []);
  const blackPlayer = useMemo(() => new Player(Colors.BLACK), []);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const [promotionCell, setPromotionCell] = useState<Cell | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

  const [restartTrigger, setRestartTrigger] = useState(0);
  const [hasGameStarted, setHasGameStarted] = useState(false);

  const [playerColor, setPlayerColor] = useState<Colors>(Colors.WHITE); // яким кольором грає користувач
  const [vsBot, setVsBot] = useState(false);                            // чи увімкнений бот

  /* ---------- допоміжні гетери ---------- */
  const getCurrentPlayer = () => currentPlayer;
  const getCurrentBoard = () => board;

  /* ---------- колір, яким грає бот ---------- */
  const botColor: Colors = playerColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE;

  /* ---------- логіка історії ходів + бот ---------- */
  const {
    moveHistory,
    fenHistory,
    currentIndex,
    handleMoveComplete,
    handleRestoreByIndex,
    resetHistory,
    setFenHistory,
    setCurrentIndex,
    botThinking,
  } = useMoveHistory(
    whitePlayer,
    blackPlayer,
    setBoard,
    setCurrentPlayer,
    setIsGameOver,
    setGameOverMessage,
    setSelectedCell,
    setHasGameStarted,
    vsBot,
    botColor,            // <‑‑ передаємо в хук
    getCurrentPlayer,
    getCurrentBoard,
    swapPlayer,
    isGameOver
  );

  /* ---------- ініціалізація нової дошки при першому рендері ---------- */
  useEffect(() => {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
  }, []);

  /* ---------- перезапуск гри ---------- */
  function restart(selected: "white" | "black" = "white", time: number = initialTime) {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();

    setBoard(newBoard);
    resetHistory();
    setFenHistory([generateFEN(newBoard, Colors.WHITE)]);
    setCurrentIndex(0);
    setInitialTime(time);
    setRestartTrigger((v) => v + 1);
    setHasGameStarted(false);

    setIsGameOver(false);
    setGameOverMessage(null);
    setPromotionCell(null);

    // 🔥 створюємо нового гравця для правильного оновлення currentPlayer
    setCurrentPlayer(new Player(Colors.WHITE));

    // фіксуємо, яким кольором грає користувач
    setPlayerColor(selected === "white" ? Colors.WHITE : Colors.BLACK);
  }

  /* ---------- здатися ---------- */
  function handleSurrender() {
    setIsGameOver(true);
    setGameOverMessage(
      currentPlayer?.color === Colors.WHITE
        ? "Білі здались — перемога чорних"
        : "Чорні здались — перемога білих"
    );
  }

  /* ---------- зміна гравця ---------- */
  function swapPlayer() {
    setCurrentPlayer((prev) =>
      prev?.color === Colors.WHITE ? blackPlayer : whitePlayer
    );
  }

  /* ---------- вибір фігури для промоції ---------- */
  function handlePromotionSelect(figureName: FigureNames) {
    if (!promotionCell) return;
    const color = promotionCell.figure?.color;
    if (!color) return;

    let newFigure;
    switch (figureName) {
      case FigureNames.ROOK:
        newFigure = new Rook(color, promotionCell);
        break;
      case FigureNames.KNIGHT:
        newFigure = new Knight(color, promotionCell);
        break;
      case FigureNames.BISHOP:
        newFigure = new Bishop(color, promotionCell);
        break;
      default:
        newFigure = new Queen(color, promotionCell);
    }

    promotionCell.setFigure(newFigure);
    setPromotionCell(null);
    setBoard(board.getCopyBoard());
  }

  /* ---------- втрати та кольори ---------- */
  const opponentColor = playerColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
  const playerLost = playerColor === Colors.WHITE ? board.lostWhiteFigures : board.lostBlackFigures;
  const opponentLost = playerColor === Colors.WHITE ? board.lostBlackFigures : board.lostWhiteFigures;

  const restartColor: "white" | "black" =
    currentPlayer?.color === Colors.WHITE ? "white" : "black";

  /* ---------- рендер ---------- */
  return (
    <div className="app-wrapper flex justify-center items-start min-h-screen bg-[#1a1a1a]">
      <div className="app flex">
        {/* ---- головна колонка (дошка + захоплені фігури) ---- */}
        <div
          className={`main-content flex flex-col items-center gap-2 py-2 ${flip ? "flex-col-reverse" : ""
            }`}
        >
          {/* захоплені фігури суперника (зверху) */}
          <CapturedPanel
            lostWhiteFigures={opponentColor === Colors.WHITE ? opponentLost : []}
            lostBlackFigures={opponentColor === Colors.BLACK ? opponentLost : []}
            position="top"
          />

          {/* сама дошка */}
          <BoardComponent
            board={board}
            setBoard={setBoard}
            currentPlayer={currentPlayer}
            swapPlayer={swapPlayer}
            promotionCell={promotionCell}
            setPromotionCell={setPromotionCell}
            fenHistory={fenHistory}
            isGameOver={isGameOver}
            setIsGameOver={setIsGameOver}
            setGameOverMessage={setGameOverMessage}
            selectedCell={selectedCell}
            setSelectedCell={setSelectedCell}
            onMoveComplete={handleMoveComplete}
            flip={flip}
          />

          {/* захоплені фігури гравця (знизу) */}
          <CapturedPanel
            lostWhiteFigures={playerColor === Colors.WHITE ? playerLost : []}
            lostBlackFigures={playerColor === Colors.BLACK ? playerLost : []}
            position="bottom"
          />

          {/* модалка промоції */}
          {promotionCell && (
            <PromotionModal
              color={promotionCell.figure!.color}
              onSelect={handlePromotionSelect}
            />
          )}
        </div>

        {/* ---- сайдбар ---- */}
        <div className="sidebar">
          {showMenu ? (
            /* стартове меню */
            <div className="menu-wrapper">
              <StartMenu
                onSelectSide={(color, time, withBot) => {
                  setVsBot(withBot);
                  setInitialTime(time);
                  setFlip(color === "black");
                  restart(color, time);
                  setShowMenu(false);
                }}
                setFlip={setFlip}
              />
            </div>
          ) : (
            /* панелі праворуч від дошки */
            <>
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  className="bg-black/50 hover:bg-black/60 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                  onClick={() => setFlip(!flip)}
                >
                  🔄 Розвернути
                </button>
                <button
                  className="bg-black/50 hover:bg-black/60 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                  onClick={() => restart(restartColor, initialTime)}
                >
                  🔁 Перезапуск
                </button>
              </div>

              <Timer
                currentColor={currentPlayer?.color ?? Colors.WHITE}
                isGameOver={isGameOver}
                hasGameStarted={hasGameStarted}
                isBotThinking={botThinking}
                initialTime={initialTime}
                onTimeout={(color) => {
                  setIsGameOver(true);
                  setGameOverMessage(
                    color === Colors.WHITE
                      ? "У Білих закінчився час — перемога чорних"
                      : "У Чорних закінчився час — перемога білих"
                  );
                }}
              />

              <HistoryPanel
                history={moveHistory}
                activeIndex={currentIndex}
                onSelect={handleRestoreByIndex}
                lostWhiteFigures={board.lostWhiteFigures}
                lostBlackFigures={board.lostBlackFigures}
              />

              <ControlButtons
                goBack={() => handleRestoreByIndex(currentIndex - 1)}
                goForward={() => handleRestoreByIndex(currentIndex + 1)}
                goToCurrent={() => handleRestoreByIndex(fenHistory.length - 1)}
                surrender={handleSurrender}
              />
            </>
          )}
        </div>
      </div>

      {/* модалка завершення гри */}
      {isGameOver && (
        <GameOverModal
          message={gameOverMessage || "Гру завершено"}
          onRestart={() => {
            setShowMenu(true);
            setIsGameOver(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
