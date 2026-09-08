import React from "react";
import { Droplet, Plus, Minus } from "lucide-react";
import { soundEffects } from "../utils/soundEffects";
import { useHydrationSync, GLASS_ML, DEFAULT_GOAL_GLASSES } from "../services/hydrationSync";

export default function GlassmorphicWaterTumbler() {
  const { totalMl, glasses, goalGlasses, percent, addGlass, removeGlass } = useHydrationSync();

  const handleAdd = () => {
    soundEffects.playWaterDrop();
    addGlass(GLASS_ML, "water", "Pure Water Glass");
  };

  const handleRemove = () => {
    soundEffects.playTactileTick();
    removeGlass();
  };

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-cyan-900/50 via-teal-900/40 to-slate-900 border border-cyan-500/30 text-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-400/20 text-cyan-300 rounded-xl">
            <Droplet size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Daily Hydration Cascade 💧</h3>
            <p className="text-[11px] text-cyan-200">2,000ml daily target for optimal kidney filtration & arterial flow</p>
          </div>
        </div>

        <span className="text-sm font-black text-cyan-300">{totalMl} ml ({percent}%)</span>
      </div>

      {/* 8 Clickable Droplet Bubbles */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-3">
        {Array.from({ length: goalGlasses }, (_, idx) => {
          const filled = idx + 1 <= glasses;
          return (
            <button
              key={idx}
              type="button"
              onClick={handleAdd}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border active:scale-95 ${
                filled
                  ? "bg-gradient-to-b from-cyan-400 to-teal-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20 font-black"
                  : "bg-white/5 text-slate-400 border-white/10 hover:border-cyan-400/50"
              }`}
              title={`Glass ${idx + 1}: 250ml`}
            >
              <Droplet size={16} className={filled ? "fill-slate-950" : ""} />
              <span className="text-[9px] font-bold">250ml</span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={handleRemove}
          disabled={glasses <= 0}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <Minus size={12} /> Undo last glass
        </button>

        <button
          type="button"
          onClick={handleAdd}
          className="text-xs font-black text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> Tap to Log Glass (+250ml)
        </button>
      </div>
    </div>
  );
}
