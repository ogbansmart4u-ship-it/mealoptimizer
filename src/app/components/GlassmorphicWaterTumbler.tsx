import React, { useState } from "react";
import { Droplet, Plus, Minus, CheckCircle2, Sparkles } from "lucide-react";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

export default function GlassmorphicWaterTumbler() {
  const [glasses, setGlasses] = useState(4); // 4 * 500ml = 2000ml
  const targetGlasses = 5; // 2500ml

  const addGlass = () => {
    if (glasses < 6) {
      soundEffects.playWaterDrop();
      triggerHaptic("medium");
      setGlasses((prev) => {
        const next = prev + 1;
        if (next === targetGlasses) {
          triggerConfetti("fireworks");
        }
        return next;
      });
    }
  };

  const removeGlass = () => {
    if (glasses > 0) {
      soundEffects.playTactileTick();
      triggerHaptic("light");
      setGlasses((prev) => prev - 1);
    }
  };

  const ml = glasses * 500;
  const percent = Math.min(Math.round((glasses / targetGlasses) * 100), 100);

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-cyan-900/50 via-teal-900/40 to-slate-900 border border-cyan-500/30 text-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-400/20 text-cyan-300 rounded-xl">
            <Droplet size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Daily Hydration Cascade 💧</h3>
            <p className="text-[11px] text-cyan-200">2,500ml daily target for optimal kidney filtration</p>
          </div>
        </div>

        <span className="text-sm font-black text-cyan-300">{ml} ml ({percent}%)</span>
      </div>

      {/* 4 Clickable Droplet Bubbles */}
      <div className="grid grid-cols-5 gap-2 my-3">
        {[1, 2, 3, 4, 5].map((idx) => {
          const filled = idx <= glasses;
          return (
            <button
              key={idx}
              type="button"
              onClick={addGlass}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border active:scale-95 ${
                filled
                  ? "bg-gradient-to-b from-cyan-400 to-teal-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20 font-black"
                  : "bg-white/5 text-slate-400 border-white/10 hover:border-cyan-400/50"
              }`}
            >
              <Droplet size={16} className={filled ? "fill-slate-950" : ""} />
              <span className="text-[9px] font-bold">500ml</span>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={removeGlass}
          disabled={glasses <= 0}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-40"
        >
          <Minus size={12} /> Undo last glass
        </button>

        <button
          type="button"
          onClick={addGlass}
          className="text-xs font-black text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <Plus size={14} /> Tap to Log Glass
        </button>
      </div>
    </div>
  );
}
