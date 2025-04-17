// src/hooks/useTimer.ts
import { useEffect, useState } from "react";
import { Colors } from "@/models/Colors";

interface UseTimerProps {
  currentColor: Colors;
  isGameOver: boolean;
  hasGameStarted: boolean;
  isBotThinking: boolean;
  initialTime: number;
  onTimeout?: (color: Colors) => void;
}

export const useTimer = ({
  currentColor,
  isGameOver,
  hasGameStarted,
  isBotThinking,
  initialTime,
  onTimeout,
}: UseTimerProps) => {
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);

  useEffect(() => {
    if (!hasGameStarted || isGameOver || isBotThinking) return;

    const interval = setInterval(() => {
      if (currentColor === Colors.WHITE) {
        setWhiteTime((prev) => {
          const next = Math.max(prev - 1, 0);
          if (next === 0 && onTimeout) onTimeout(Colors.WHITE);
          return next;
        });
      } else {
        setBlackTime((prev) => {
          const next = Math.max(prev - 1, 0);
          if (next === 0 && onTimeout) onTimeout(Colors.BLACK);
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentColor, isGameOver, hasGameStarted, isBotThinking, onTimeout]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    whiteTime,
    blackTime,
    formatTime,
  };
};
