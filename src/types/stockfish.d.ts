// src/types/stockfish.d.ts
export interface StockfishWorker
  extends Omit<Worker, "postMessage" | "onmessage"> {
  postMessage(cmd: string): void;                        // тільки рядки
  onmessage: ((e: MessageEvent<string>) => void) | null; // повертає рядок
}

declare function Stockfish(): StockfishWorker;
export default Stockfish;

// зробимо файл «справжнім модулем», щоб його можна було імпортувати
export type { };
// 