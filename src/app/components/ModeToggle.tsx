import { useAppMode } from "../contexts/AppModeContext";

export default function ModeToggle() {
  const { mode, toggleMode } = useAppMode();

  return (
    <button
      onClick={toggleMode}
      className="bg-white rounded-full px-4 py-2 shadow-md flex items-center gap-2 hover:shadow-lg transition-all"
    >
      <span className="text-xl">{mode === "simple" ? "😊" : "🔬"}</span>
      <span className="text-xs text-gray-700">
        {mode === "simple" ? "Simple" : "Expert"}
      </span>
      <div className="w-10 h-5 bg-gray-200 rounded-full p-0.5 relative">
        <div
          className={`w-4 h-4 bg-[#1f7a8c] rounded-full transition-transform duration-300 ${
            mode === "expert" ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
