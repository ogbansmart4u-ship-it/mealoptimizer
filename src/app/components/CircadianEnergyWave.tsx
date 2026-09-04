import React from "react";
import { Sun, Moon, Sparkles, Clock, Compass } from "lucide-react";

export default function CircadianEnergyWave() {
  const hour = new Date().getHours();

  // Dynamic context
  let currentWindow = "Morning Metabolic Primer 🌅";
  let tip = "Drink 500ml water and break fast with high-protein beans or eggs.";
  if (hour >= 12 && hour < 16) {
    currentWindow = "Peak Mid-Day Power Lunch ☀️";
    tip = "Ideal window for swallow meals. Pair with plenty of Ewedu/Okra soup.";
  } else if (hour >= 16 && hour < 20) {
    currentWindow = "Evening Glucose Settling 🌇";
    tip = "Keep dinner light (Pepper soup, grilled fish, or vegetable salad).";
  } else if (hour >= 20 || hour < 6) {
    currentWindow = "Nighttime Cell Repair 🌙";
    tip = "Fasting window active. Sip warm water or soothing Zobo tea.";
  }

  return (
    <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-teal-900/40 via-cyan-950/40 to-slate-900/60 border border-teal-500/20 backdrop-blur-md text-white shadow-md">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-400/20 rounded-xl text-teal-300">
            {hour >= 6 && hour < 18 ? <Sun size={17} /> : <Moon size={17} />}
          </div>
          <div>
            <h4 className="text-xs font-black text-white">{currentWindow}</h4>
            <p className="text-[11px] text-teal-200/90 leading-snug">{tip}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-black uppercase text-amber-300 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
            Circadian Arc
          </span>
        </div>
      </div>
    </div>
  );
}
