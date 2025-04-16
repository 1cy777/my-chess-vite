import React, { useState, useEffect } from "react";
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
import GameOverModal from "@/modals/GameOverModal";
import HistoryPanel from "@/components/ui/HistoryPanel";
import { useMoveHistory } from "@/hooks/useMoveHistory";
import { generateFEN } from "@/services/fen";
import ControlButtons from "@/components/ui/ControlButtons";
import StartMenu from "@/components/ui/StartMenu";
import CapturedPanel from "@/components/ui/CapturedPanel";

function App() {
  const [showMenu, setShowMenu] = useState(true);
  const [flip, setFlip] = useState(false);
  const [initialTime, setInitialTime] = useState(300);

  const [board, setBoard] = useState(new Board());
  const [whitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [promotionCell, setPromotionCell] = useState<Cell | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

  const {
    moveHistory,
    fenHistory,
    currentIndex,
    handleMoveComplete,
    handleRestoreByIndex,
    resetHistory,
    setFenHistory,
    setCurrentIndex,
  } = useMoveHistory(
    whitePlayer,
    blackPlayer,
    setBoard,
    setCurrentPlayer,
    setIsGameOver,
    setGameOverMessage,
    setSelectedCell
  );

  useEffect(() => {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
  }, []);

  function restart(selectedColor: "white" | "black", time: number = initialTime) {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();

    setBoard(newBoard);
    resetHistory();
    setFenHistory([generateFEN(newBoard, Colors.WHITE)]);
    setCurrentIndex(0);
    setInitialTime(time);

    setIsGameOver(false);
    setGameOverMessage(null);
    setPromotionCell(null);
    setCurrentPlayer(whitePlayer);
  }

  function swapPlayer() {
    setCurrentPlayer((prev) =>
      prev?.color === Colors.WHITE ? blackPlayer : whitePlayer
    );
  }

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

  const playerColor = flip ? Colors.BLACK : Colors.WHITE;
  const opponentColor = flip ? Colors.WHITE : Colors.BLACK;

  const playerLost = playerColor === Colors.WHITE ? board.lostWhiteFigures : board.lostBlackFigures;
  const opponentLost = playerColor === Colors.WHITE ? board.lostBlackFigures : board.lostWhiteFigures;

  return (
    <div className="app">
      <div className="main-content flex flex-col items-center gap-2 py-2">
        <div className="relative flex flex-col items-center">
          {/* Opponent's captured figures at top */}
          <CapturedPanel
            lostWhiteFigures={opponentColor === Colors.WHITE ? opponentLost : []}
            lostBlackFigures={opponentColor === Colors.BLACK ? opponentLost : []}
            flip={false}
          />

          {/* Board */}
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

          {/* Player's captured figures at bottom */}
          <CapturedPanel
            lostWhiteFigures={playerColor === Colors.WHITE ? playerLost : []}
            lostBlackFigures={playerColor === Colors.BLACK ? playerLost : []}
            flip={true}
          />

          {/* PromotionModal */}
          {promotionCell && (
            <PromotionModal
              color={promotionCell.figure!.color}
              onSelect={handlePromotionSelect}
            />
          )}
        </div>
      </div>

      <div className="sidebar">
        {showMenu ? (
          <div className="menu-wrapper">
            <StartMenu
              onSelectSide={(color, time) => {
                setInitialTime(time);
                setFlip(color === "black");
                restart(color, time);
                setShowMenu(false);
              }}
              setFlip={setFlip}
            />
          </div>
        ) : (
          <>
            {/* Game Controls */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <button
                className="bg-black/50 hover:bg-black/60 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                onClick={() => setFlip(!flip)}
              >
                🔄 Розвернути
              </button>
              <button
                className="bg-black/50 hover:bg-black/60 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                onClick={() =>
                  restart(currentPlayer?.color === Colors.WHITE ? "white" : "black", initialTime)
                }
              >
                🔁 Перезапуск
              </button>
            </div>

            <Timer
              restart={() =>
                restart(currentPlayer?.color === Colors.WHITE ? "white" : "black", initialTime)
              }
              currentPlayer={currentPlayer}
              isGameOver={isGameOver}
              initialTime={initialTime}
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
              surrender={() => setIsGameOver(true)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
