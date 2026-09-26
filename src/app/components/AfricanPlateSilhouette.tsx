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
                Golden Portion Ratio
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Optimal balance: 50% Soups/Greens • 25% Lean Protein • 25% Complex Swallow
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
          {/* 📊 Segmented Proportion Ratio Bar */}
          <div className="bg-slate-100 dark:bg-zinc-800/80 p-2.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-slate-700 dark:text-slate-300">Target Plate Division</span>
              <span className="text-[#126778] dark:text-teal-300 font-extrabold">50% Veggies • 25% Protein • 25% Swallow</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-zinc-700 p-0.5 gap-0.5">
              <div className="w-1/2 bg-emerald-600 rounded-l-full flex items-center justify-center text-[7.5px] font-black text-white" title="50% Veggies & Soups">
                50%
              </div>
              <div className="w-1/4 bg-amber-600 flex items-center justify-center text-[7.5px] font-black text-white" title="25% Lean Protein">
                25%
              </div>
              <div className="w-1/4 bg-cyan-600 rounded-r-full flex items-center justify-center text-[7.5px] font-black text-white" title="25% Complex Swallow">
                25%
              </div>
            </div>
          </div>

          {/* Visual Divided Silhouette - 100% In-Frame Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 sm:gap-3 p-3 sm:p-4 bg-white dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 shadow-xs">
            {/* 50% Veggies / Soups (Full width on mobile, 6/12 on tablet/PC) */}
            <div className="col-span-2 sm:col-span-6 p-3 sm:p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/90 dark:border-emerald-800/60 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1.5 flex-wrap mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                    <span>🥬</span>
                    <span>50% Soups &amp; Veggies</span>
                  </span>
                  <span className="text-[9.5px] font-black bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full shadow-2xs">
                    🥣 2 Ladles
                  </span>
                </div>
                <span className="text-xs sm:text-[13px] font-extrabold text-slate-800 dark:text-slate-100 block mb-1">
                  Ewedu, Okra, Ugwu, Efo Riro
                </span>
              </div>
              <span className="text-[10px] sm:text-[10.5px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 block leading-tight">
                🛡️ Buffers glucose spike &amp; fuels gut microbiome
              </span>
            </div>

            {/* 25% Clean Protein (Half width on mobile, 3/12 on tablet/PC) */}
            <div className="col-span-1 sm:col-span-3 p-3 sm:p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/90 dark:border-amber-800/60 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 flex-wrap mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <span>🥩</span>
                    <span>25% Protein</span>
                  </span>
                  <span className="text-[9px] sm:text-[9.5px] font-black bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                    ✋ 1 Palm
                  </span>
                </div>
                <span className="text-xs sm:text-[13px] font-extrabold text-slate-800 dark:text-slate-100 block mb-1">
                  Fish, Lean Goat, Eggs
                </span>
              </div>
              <span className="text-[10px] sm:text-[10.5px] text-amber-700 dark:text-amber-400 font-semibold mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 block leading-tight">
                💪 Builds satiety &amp; preserves muscle
              </span>
            </div>

            {/* 25% Swallow / Carb (Half width on mobile, 3/12 on tablet/PC) */}
            <div className="col-span-1 sm:col-span-3 p-3 sm:p-3.5 bg-gradient-to-br from-cyan-50 to-sky-50/60 dark:from-cyan-950/40 dark:to-sky-950/30 border border-cyan-200/90 dark:border-cyan-800/60 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 flex-wrap mb-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                    <span>🍠</span>
                    <span>25% Swallow</span>
                  </span>
                  <span className="text-[9px] sm:text-[9.5px] font-black bg-cyan-200 dark:bg-cyan-900/80 text-cyan-900 dark:text-cyan-200 px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                    ✊ 1 Fist
                  </span>
                </div>
                <span className="text-xs sm:text-[13px] font-extrabold text-slate-800 dark:text-slate-100 block mb-1">
                  Plantain, Oats, Amala
                </span>
              </div>
              <span className="text-[10px] sm:text-[10.5px] text-cyan-700 dark:text-cyan-400 font-semibold mt-2 pt-2 border-t border-cyan-200/60 dark:border-cyan-900/40 block leading-tight">
                ⚡ 1-Fist clean sustained energy
              </span>
            </div>
          </div>

          {/* African Hand-Measure Rules */}
          <div className="p-3.5 sm:p-4 bg-teal-50/90 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs">
            <span className="font-black text-[#126778] dark:text-teal-300 flex items-center gap-1.5 mb-2.5 text-xs sm:text-sm">
              <Heart size={15} className="text-rose-500 fill-rose-500" /> African Hand-Measure Portion Rules
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="font-black block text-slate-900 dark:text-white text-xs mb-0.5">✊ 1 Fist (~25%)</span>
                  <span className="text-[9.5px] font-bold text-cyan-700 dark:text-cyan-400 block mb-1">Complex Swallow</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-tight">Amala, Garri, Pounded Yam, Brown Rice, or Plantain.</p>
                </div>
              </div>
              <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="font-black block text-slate-900 dark:text-white text-xs mb-0.5">🥣 2 Ladles (~50%)</span>
                  <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400 block mb-1">Greens &amp; Soups</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-tight">Viscous soups like Ewedu, Okra, Ugu, or Efo Riro.</p>
                </div>
              </div>
              <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="font-black block text-slate-900 dark:text-white text-xs mb-0.5">✋ 1 Palm (~25%)</span>
                  <span className="text-[9.5px] font-bold text-amber-700 dark:text-amber-400 block mb-1">Lean Protein</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-tight">Grilled/boiled fish (Mackerel/Tilapia), lean goat, or eggs.</p>
                </div>
              </div>
              <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/90 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="font-black block text-slate-900 dark:text-white text-xs mb-0.5">🥄 1 Spoon (Cap)</span>
                  <span className="text-[9.5px] font-bold text-rose-700 dark:text-rose-400 block mb-1">Healthy Fats</span>
                  <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-tight">Keep red palm oil or vegetable oil to ≤ 1 tablespoon.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
