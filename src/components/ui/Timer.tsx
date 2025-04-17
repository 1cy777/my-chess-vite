// src/components/ui/Timer.tsx
import React, { FC } from "react";
import { Colors } from "@/models/Colors";
import { useTimer } from "@/hooks/useTimer";

interface TimerProps {
  currentColor: Colors;
  isGameOver: boolean;
  hasGameStarted: boolean;
  isBotThinking: boolean;
  initialTime: number;
  onTimeout?: (color: Colors) => void;
}

const Timer: FC<TimerProps> = ({
  currentColor,
  isGameOver,
  hasGameStarted,
  isBotThinking,
  initialTime,
  onTimeout,
}) => {
  const {
    whiteTime,
    blackTime,
    formatTime,
  } = useTimer({
    currentColor,
    isGameOver,
    hasGameStarted,
    isBotThinking,
    initialTime,
    onTimeout,
  });

  return (
    <div className="timer text-sm font-mono space-y-1">
      <div
        className={`transition-all duration-300 ${
          currentColor === Colors.BLACK
            ? "font-bold text-yellow-300"
            : "text-white opacity-70"
        }`}
      >
        Чорні: {formatTime(blackTime)}
      </div>
      <div
        className={`transition-all duration-300 ${
          currentColor === Colors.WHITE
            ? "font-bold text-yellow-300"
            : "text-white opacity-70"
        }`}
      >
        Білі: {formatTime(whiteTime)}
      </div>
    </div>
  );
};

export default Timer;
