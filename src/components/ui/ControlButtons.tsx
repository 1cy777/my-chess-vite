type Props = {
  goBack: () => void;
  goForward: () => void;
  goToCurrent: () => void;
  surrender: () => void;
};

export default function ControlButtons({
  goBack,
  goForward,
  goToCurrent,
  surrender,
}: Props) {
  return (
    <div className="flex items-center justify-around bg-black/20 p-2 rounded-lg space-x-2">
      <button onClick={goBack} title="Назад" className="bg-white/10 hover:bg-white/20 p-2 rounded-md transition">⏪</button>
      <button onClick={goForward} title="Вперед" className="bg-white/10 hover:bg-white/20 p-2 rounded-md transition">⏩</button>
      <button onClick={goToCurrent} title="Поточна позиція" className="bg-white/10 hover:bg-white/20 p-2 rounded-md transition">🔄</button>
      <button onClick={surrender} title="Здатися" className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition">🏳️</button>
    </div>
  );
}
