import React, { useState, useEffect } from "react";
import { Moon, Sun, Flame, Clock, Sparkles, ShieldCheck } from "lucide-react";

interface CircadianArcProps {
  lastMealTime?: string; // e.g. "19:30"
}

export default function CircadianArc({ lastMealTime = "20:00" }: CircadianArcProps) {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [fastedHours, setFastedHours] = useState(13);

  useEffect(() => {
    const now = new Date();
    const parts = String(lastMealTime || "20:00").split(":");
    const h = Number(parts[0]);
    const safeH = !isNaN(h) && h >= 0 && h <= 23 ? h : 20;
    let diff = now.getHours() - safeH;
    if (diff < 0) diff += 24;
    setFastedHours(Math.max(1, diff));
    setCurrentHour(now.getHours());
  }, [lastMealTime]);

  const isEatingWindow = currentHour >= 10 && currentHour <= 19;

  return (
    <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg border border-teal-800/40 relative overflow-hidden my-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/10 rounded-xl">
            {isEatingWindow ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-teal-300" />}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 block">
              Circadian Metabolic Arc
            </span>
            <h4 className="text-sm font-extrabold text-white">
              {isEatingWindow ? "Optimal Eating Window Active" : "Metabolic Fasting Window"}
            </h4>
          </div>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-500/30">
          {fastedHours} hrs fasted
        </span>
      </div>

      {/* Progress Arc Bar */}
      <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden my-2.5">
        <div
          className="h-full bg-gradient-to-r from-[#4ecdc4] to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, (fastedHours / 16) * 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-teal-100/80 pt-1">
        <span className="flex items-center gap-1">
          <Flame size={13} className="text-amber-400" />
          {fastedHours >= 12 ? "Fat-Burn Phase Active 🔥" : "Digestion Active"}
        </span>
        <span>Target: 16:8 Restorative Window</span>
      </div>
    </div>
  );
}
