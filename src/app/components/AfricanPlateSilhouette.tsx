import React, { useState } from "react";
import { Utensils, Sparkles, Info, X, ShieldCheck, Heart } from "lucide-react";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic } from "../utils/celebration";

interface AfricanPlateProps {
  onRebalance?: () => void;
  veggiePercent?: number;
  proteinPercent?: number;
  carbPercent?: number;
}

export default function AfricanPlateSilhouette({
  onRebalance,
  veggiePercent = 50,
  proteinPercent = 25,
  carbPercent = 25,
}: AfricanPlateProps) {
  const [showHandGuide, setShowHandGuide] = useState(false);

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-white to-teal-50/60 dark:from-zinc-900 dark:to-zinc-950 border border-teal-100 dark:border-zinc-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-xl">
            <Utensils size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>The Balanced African Plate</span>
              <button
                onClick={() => {
                  soundEffects.playTactileTick();
                  triggerHaptic("light");
                  setShowHandGuide(!showHandGuide);
                }}
                className="text-[10px] font-bold text-[#126778] dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full hover:bg-teal-200 transition-colors cursor-pointer"
                title="View Hand Measure Portion Rules"
              >
                Hand Guide ✋
              </button>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Golden ratio: 50% Soup/Veg • 25% Protein • 25% Swallow
            </p>
          </div>
        </div>

        {onRebalance && (
          <button
            onClick={() => {
              soundEffects.playTactileTick();
              triggerHaptic("light");
              onRebalance();
            }}
            className="text-[11px] font-black text-[#126778] dark:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Fix My Plate</span>
            <Sparkles size={12} className="text-amber-500" />
          </button>
        )}
      </div>

      {/* Visual Ceramic Plate / Calabash Divided Silhouette */}
      <div className="grid grid-cols-12 gap-2 p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
        {/* 50% Veggies / Soups */}
        <div className="col-span-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                🥬 50% Soups &amp; Veggies
              </span>
              <span className="text-[9px] font-black bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full">
                🥣 2 Ladles
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
              Ewedu, Okra, Ugwu, Efo
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
            Buffers glucose &amp; fuels gut
          </span>
        </div>

        {/* 25% Clean Protein */}
        <div className="col-span-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                🥩 25% Protein
              </span>
              <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full">
                ✋ 1 Palm
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
              Fish, Goat, Eggs
            </span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-2">
            Builds satiety &amp; muscle
          </span>
        </div>

        {/* 25% Swallow / Carb */}
        <div className="col-span-3 p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-wider block">
                🍠 25% Swallow
              </span>
              <span className="text-[9px] font-black bg-cyan-200 text-cyan-900 px-1.5 py-0.2 rounded-full">
                ✊ 1 Fist
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
              Plantain, Oats
            </span>
          </div>
          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold mt-2">
            1-Fist clean energy
          </span>
        </div>
      </div>

      {/* Interactive Hand-Measure Mini Guide (Collapsible) */}
      {showHandGuide && (
        <div className="mt-3 p-3.5 bg-teal-50/90 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-[#126778] dark:text-teal-300 flex items-center gap-1.5">
              <Heart size={14} className="text-rose-500" /> African Hand-Measure Rules
            </span>
            <button
              onClick={() => setShowHandGuide(false)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-bold block text-slate-900 dark:text-white">✊ 1 Fist (~25%)</span>
              <p className="text-slate-500 text-[10px] mt-0.5">Amala, Garri, Pounded Yam, Rice, or Boiled Plantain.</p>
            </div>
            <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-bold block text-slate-900 dark:text-white">🥣 2 Ladles (~50%)</span>
              <p className="text-slate-500 text-[10px] mt-0.5">Viscous soups like Ewedu, Okra, Ugu, or Efo Riro.</p>
            </div>
            <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-bold block text-slate-900 dark:text-white">✋ 1 Palm (~25%)</span>
              <p className="text-slate-500 text-[10px] mt-0.5">Grilled/boiled fish (Mackerel/Tilapia), lean goat, or eggs.</p>
            </div>
            <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-bold block text-slate-900 dark:text-white">🥄 1 Spoon (Cap)</span>
              <p className="text-slate-500 text-[10px] mt-0.5">Keep red palm oil or vegetable oil to ≤ 1 tablespoon.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
