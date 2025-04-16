import React from "react";

interface SideSelectMenuProps {
  onSelect: (color: "white" | "black") => void;
}

const SideSelectMenu: React.FC<SideSelectMenuProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h2 className="text-2xl font-bold text-center">Оберіть сторону</h2>
      <div className="flex gap-6">
        <button
          onClick={() => onSelect("white")}
          className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:scale-105 transition"
        >
          Грати за білих
        </button>
        <button
          onClick={() => onSelect("black")}
          className="bg-black text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition"
        >
          Грати за чорних
        </button>
      </div>
    </div>
  );
};

export default SideSelectMenu;
