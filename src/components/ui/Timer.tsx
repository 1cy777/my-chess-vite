import React, { FC } from 'react';
import { Player } from '@/models/Player';
import useTimer from '@/hooks/useTimer';

interface TimerProps {
  currentPlayer: Player | null;
  isGameOver: boolean;
  restart: () => void;
  initialTime: number;
}

const Timer: FC<TimerProps> = ({ currentPlayer, isGameOver, restart, initialTime }) => {
  const {
    whiteTime,
    blackTime,
    resetTimers,
    formatTime
  } = useTimer(currentPlayer, isGameOver, initialTime);

  const handleRestart = () => {
    resetTimers();
    restart();
  };

  return (
    <div className="timer">
      <div> Чорні: {formatTime(blackTime)}</div>
      <div> Білі: {formatTime(whiteTime)}</div>
    </div>
  );
};

export default Timer;