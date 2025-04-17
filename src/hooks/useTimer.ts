import { useEffect, useRef, useState } from 'react';
import { Player } from '@/models/Player';
import { Colors } from '@/models/Colors';

export default function useTimer(
  currentPlayer: Player | null,
  isGameOver: boolean,
  initialTime: number,
  restartTrigger: number, // ⬅️ новий аргумент
  hasGameStarted: boolean
) {
  const [blackTime, setBlackTime] = useState(initialTime);
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setBlackTime(initialTime);
    setWhiteTime(initialTime);
    clearTimer(); // важливо!
  }, [restartTrigger]); // ⬅️ реагує лише на restartTrigger

  useEffect(() => {
    if (isGameOver || !currentPlayer || !hasGameStarted) {
      clearTimer();
      return;
    }
  
    startTimer(currentPlayer);
  
    return () => clearTimer();
  }, [currentPlayer, isGameOver, hasGameStarted]);

  function startTimer(player: Player) {
    clearTimer();
    const callback =
      player.color === Colors.WHITE ? decrementWhite : decrementBlack;

    timerRef.current = setInterval(callback, 1000);
  }

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function decrementBlack() {
    setBlackTime((prev) => Math.max(prev - 1, 0));
  }

  function decrementWhite() {
    setWhiteTime((prev) => Math.max(prev - 1, 0));
  }

  function resetTimers() {
    clearTimer();
    setBlackTime(initialTime);
    setWhiteTime(initialTime);
  }

  function formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return {
    whiteTime,
    blackTime,
    resetTimers,
    formatTime,
  };
}
