import React, { useState } from "react";
import { Utensils, Sparkles, Heart, Info, X, Layers } from "lucide-react";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic } from "../utils/celebration";
import AfricanDiabetesPlate from "./AfricanDiabetesPlate";

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
  const [viewMode, setViewMode] = useState<"interactive" | "guide">("interactive");

  return (
    <div className="rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-white to-teal-50/60 dark:from-zinc-900 dark:to-zinc-950 border border-teal-100 dark:border-zinc-800 shadow-md">
      {/* Top Header & Segmented Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2.5 bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-2xl shrink-0">
            <Utensils size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                The Balanced African Plate
              </h3>
              <span className="text-[9.5px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950/60 text-[#126778] dark:text-teal-300 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                ADA 9-Inch Method
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Golden ratio: 50% Soup/Veg • 25% Protein • 25% Swallow
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-700 text-xs font-bold shrink-0">
          <button
            onClick={() => {
              soundEffects.playTactileTick();
              triggerHaptic("light");
              setViewMode("interactive");
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "interactive"
                ? "bg-white dark:bg-zinc-700 text-[#126778] dark:text-white shadow-xs font-black"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>9-Inch Studio 🍲</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playTactileTick();
              triggerHaptic("light");
              setViewMode("guide");
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "guide"
                ? "bg-white dark:bg-zinc-700 text-[#126778] dark:text-white shadow-xs font-black"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Hand Guide ✋</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "interactive" ? (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <AfricanDiabetesPlate className="!p-0 !border-0 !shadow-none !bg-transparent" />
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Visual Divided Silhouette */}
          <div className="grid grid-cols-12 gap-2 p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
            {/* 50% Veggies / Soups */}
            <div className="col-span-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    🥬 50% Soups &amp; Veggies
                  </span>
                  <span className="text-[9px] font-black bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full">
                    🥣 2 Ladles
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  Ewedu, Okra, Ugwu, Efo Riro
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
                Buffers glucose spike &amp; fuels gut microbiome
              </span>
            </div>

            {/* 25% Clean Protein */}
            <div className="col-span-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
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
                Builds satiety &amp; preserves muscle
              </span>
            </div>

            {/* 25% Swallow / Carb */}
            <div className="col-span-3 p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-wider">
                    🍠 25% Swallow
                  </span>
                  <span className="text-[9px] font-black bg-cyan-200 text-cyan-900 px-1.5 py-0.2 rounded-full">
                    ✊ 1 Fist
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  Plantain, Oats, Amala
                </span>
              </div>
              <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold mt-2">
                1-Fist clean sustained energy
              </span>
            </div>
          </div>

          {/* African Hand-Measure Rules */}
          <div className="p-3.5 bg-teal-50/90 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs">
            <span className="font-black text-[#126778] dark:text-teal-300 flex items-center gap-1.5 mb-2">
              <Heart size={14} className="text-rose-500" /> African Hand-Measure Portion Rules
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="font-bold block text-slate-900 dark:text-white">✊ 1 Fist (~25%)</span>
                <p className="text-slate-500 text-[10px] mt-0.5">Amala, Garri, Pounded Yam, Brown Rice, or Plantain.</p>
              </div>
              <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="font-bold block text-slate-900 dark:text-white">🥣 2 Ladles (~50%)</span>
                <p className="text-slate-500 text-[10px] mt-0.5">Viscous soups like Ewedu, Okra, Ugu, or Efo Riro.</p>
              </div>
              <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="font-bold block text-slate-900 dark:text-white">✋ 1 Palm (~25%)</span>
                <p className="text-slate-500 text-[10px] mt-0.5">Grilled/boiled fish (Mackerel/Tilapia), lean goat, or eggs.</p>
              </div>
              <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="font-bold block text-slate-900 dark:text-white">🥄 1 Spoon (Cap)</span>
                <p className="text-slate-500 text-[10px] mt-0.5">Keep red palm oil or vegetable oil to ≤ 1 tablespoon.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
