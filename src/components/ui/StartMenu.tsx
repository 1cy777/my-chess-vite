import React, { useState } from "react";

interface StartMenuProps {
  onSelectSide: (color: "white" | "black", time: number, withBot: boolean) => void;
  setFlip: (value: boolean) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onSelectSide, setFlip }) => {
  const [step, setStep] = useState<"menu" | "side">("menu");
  const [timeLimit, setTimeLimit] = useState<number>(300); // за замовчуванням 5 хв

  return (
    <div className="flex flex-col items-center gap-8 text-white px-4">
      <h1 className="text-4xl font-bold text-center">Зіграти у шахи</h1>

      {step === "menu" && (
        <>
          <button
            className="bg-black/50 rounded-xl px-6 py-4 w-full max-w-xs text-center hover:scale-105 transition-transform duration-200 focus:outline-none"
            onClick={() => alert("Поки що недоступно")}
          >
            <p className="text-orange-400 text-lg mb-1">⚡</p>
            <p className="font-semibold text-lg">Грайте онлайн</p>
            <p className="text-sm text-gray-300">
              Грати проти людини зі схожим рейтингом
            </p>
          </button>

          <button
            onClick={() => setStep("side")}
            className="bg-black/50 rounded-xl px-6 py-4 w-full max-w-xs text-center hover:scale-105 transition-transform duration-200 focus:outline-none"
          >
            <p className="text-pink-400 text-lg mb-1">🤖</p>
            <p className="font-semibold text-lg">Грати з ботом</p>
            <p className="text-sm text-gray-300">
              Виберіть сторону та таймер
            </p>
          </button>
        </>
      )}

      {step === "side" && (
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-xl font-bold">Оберіть сторону</h2>

          <label className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-300">Тривалість таймера (секунд)</span>
            <input
              type="number"
              min={10}
              max={3600}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="px-4 py-2 rounded bg-white text-black text-center w-32"
            />
          </label>

          <div className="flex gap-6">
            <button
              onClick={() => {
                setFlip(false);
                onSelectSide("white", timeLimit, true); // 🧠 withBot = true
              }}
              className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-transform duration-200"
            >
              Грати за білих
            </button>
            <button
              onClick={() => {
                setFlip(true);
                onSelectSide("black", timeLimit, true); // 🧠 withBot = true
              }}
              className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-transform duration-200"
            >
              Грати за чорних
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartMenu;
