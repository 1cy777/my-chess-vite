import { useState } from "react";

export function useHistory() {
  const [history, setHistory] = useState<string[]>([]);

  function addPosition(fen: string) {
    setHistory(prev => [...prev, fen]);
  }

  function resetHistory() {
    setHistory([]);
  }

  return {
    history,
    addPosition,
    resetHistory,
  };
}
