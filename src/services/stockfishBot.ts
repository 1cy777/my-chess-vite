const workerUrl = new URL(
  "/stockfish/stockfish-nnue-16-single.js",
  import.meta.url,
);
let engine: Worker | null = null;

function getEngine() {
  if (!engine) engine = new Worker(workerUrl, { type: "module" });
  return engine;
}

export async function getBestMove(
  fen: string,
  depth = 12,
): Promise<string> {
  const sf = getEngine();           // sf має тип StockfishWorker, не null

  return new Promise<string>((resolve) => {
    const handler = (e: MessageEvent<string>) => {
      const line = e.data;
      if (line.startsWith("bestmove")) {
        sf.removeEventListener("message", handler);
        resolve(line.split(" ")[1] ?? "");
      }
    };

    sf.addEventListener("message", handler);
    sf.postMessage("uci");
    sf.postMessage(`position fen ${fen}`);
    sf.postMessage(`go depth ${depth}`);
  });
}

export function terminateEngine() {
  engine?.postMessage("quit");
  engine?.terminate?.();
  engine = null;
}
