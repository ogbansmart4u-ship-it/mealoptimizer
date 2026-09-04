import React from "react";
import { Utensils, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
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
  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-white to-teal-50/60 dark:from-zinc-900 dark:to-zinc-950 border border-teal-100 dark:border-zinc-800 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-xl">
            <Utensils size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              The Balanced African Plate 🍲
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
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              🥬 50% Soups &amp; Veggies
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
              Ewedu, Okra, Ugwu, Efo
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
            Buffers glucose spike
          </span>
        </div>

        {/* 25% Clean Protein */}
        <div className="col-span-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              🥩 25% Protein
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
              Fish, Goat, Eggs
            </span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-2">
            Builds satiety
          </span>
        </div>

        {/* 25% Swallow / Carb */}
        <div className="col-span-3 p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-wider block">
              🍠 25% Swallow
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
              Plantain, Oats
            </span>
          </div>
          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold mt-2">
            1-Fist energy
          </span>
        </div>
      </div>
    </div>
  );
}
