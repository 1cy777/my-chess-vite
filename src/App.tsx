import React, { useState, useEffect } from 'react';
import "@/styles/App.css";
import BoardComponent from "@/components/board/Board";
import { Board } from "@/models/board/Board";
import { Player } from "@/models/Player";
import { Colors } from "@/models/Colors";
import LostFigures from "@/components/ui/LostFigures";
import Timer from "@/components/ui/Timer";
import PromotionModal from "@/modals/PromotionModal";
import { FigureNames } from "@/models/figures/Figure";
import { Cell } from "@/models/board/Cell";
import { Rook } from '@/models/figures/Rook';
import { Knight } from '@/models/figures/Knight';
import { Bishop } from '@/models/figures/Bishop';
import { Queen } from '@/models/figures/Queen';
import GameOverModal from "@/modals/GameOverModal";

function App() {
  const [board, setBoard] = useState(new Board())
  const [whitePlayer, setWhitePlayer] = useState(new Player(Colors.WHITE))
  const [blackPlayer, setBlackPlayer] = useState(new Player(Colors.BLACK))
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [promotionCell, setPromotionCell] = useState<Cell | null>(null);
  const [fenHistory, setFenHistory] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);



  useEffect(() => {
    restart()
    setCurrentPlayer(whitePlayer);
  }, [])

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setCurrentPlayer(whitePlayer); // 👈 Повертаємо хід білому при рестарті
  }

  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer)
  }

  const handlePromotionSelect = (figureName: FigureNames) => {
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
    setBoard(board.getCopyBoard()); // оновлення дошки
  };


  return (
    <div className="app">
      <Timer
        restart={restart}
        currentPlayer={currentPlayer}
        isGameOver={isGameOver}
      />
      <BoardComponent
        board={board}
        setBoard={setBoard}
        currentPlayer={currentPlayer}
        swapPlayer={swapPlayer}
        promotionCell={promotionCell}
        setPromotionCell={setPromotionCell}
        fenHistory={fenHistory}
        setFenHistory={setFenHistory}
        isGameOver={isGameOver}
        setIsGameOver={setIsGameOver}
        setGameOverMessage={setGameOverMessage}
      />
      {promotionCell && (
        <PromotionModal
          color={promotionCell.figure!.color}
          onSelect={handlePromotionSelect}
        />
      )}
      {isGameOver && gameOverMessage && (
        <GameOverModal
          message={gameOverMessage}
          onRestart={() => {
            restart();
            setIsGameOver(false);
            setGameOverMessage(null);
          }}
        />
      )}

      <div>
        <LostFigures
          title="Чорні фігури"
          figures={board.lostBlackFigures}
        />
        <LostFigures
          title="Білі фігури"
          figures={board.lostWhiteFigures}
        />
      </div>
    </div>

  );
}

export default App;