// 📁 src/components/ui/Timer.tsx
import React, { FC } from 'react';
import { Player } from '@/models/Player';
import useTimer from '@/hooks/useTimer';

interface TimerProps {
  currentPlayer: Player | null;
  isGameOver: boolean;
  restart: () => void;
}

const Timer: FC<TimerProps> = ({ currentPlayer, isGameOver, restart }) => {
  const {
    whiteTime,
    blackTime,
    resetTimers,
    formatTime
  } = useTimer(currentPlayer, isGameOver);

  const handleRestart = () => {
    resetTimers();
    restart();
  };

  return (
    <div className="timer">
      <button onClick={handleRestart}>🔁 Перезапустити гру</button>
      <div>♟️ Чорні: {formatTime(blackTime)}</div>
      <div>♟️ Білі: {formatTime(whiteTime)}</div>
    </div>
  );
};

export default Timer;
