import React, { useState } from "react";
import { Utensils, Sparkles, Info, X, ShieldCheck, Heart, Layers } from "lucide-react";
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
  const [showHandGuide, setShowHandGuide] = useState(false);
  const [showInteractiveModal, setShowInteractiveModal] = useState(false);

  return (
    <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-white to-teal-50/60 dark:from-zinc-900 dark:to-zinc-950 border border-teal-100 dark:border-zinc-800 shadow-md">
      {/* Responsive Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-xl shrink-0">
            <Utensils size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                The Balanced African Plate
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundEffects.playTactileTick();
                  triggerHaptic("light");
                  setShowHandGuide(!showHandGuide);
                }}
                className="text-[9.5px] font-bold text-[#126778] dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full hover:bg-teal-200 transition-colors cursor-pointer shrink-0"
                title="View Hand Measure Portion Rules"
              >
                Hand Guide ✋
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Golden ratio: 50% Soup/Veg • 25% Protein • 25% Swallow
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playBubblePop();
            triggerHaptic("medium");
            setShowInteractiveModal(true);
            if (onRebalance) onRebalance();
          }}
          className="text-[10.5px] sm:text-[11px] font-black text-[#126778] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 px-2.5 py-1 rounded-xl border border-teal-200/80 dark:border-teal-800 cursor-pointer shadow-2xs active:scale-95 transition-all flex items-center gap-1 shrink-0 ml-auto sm:ml-0"
        >
          <span>9-Inch Builder</span>
          <Sparkles size={12} className="text-amber-500" />
        </button>
      </div>

      {/* Visual Ceramic Plate / Calabash Divided Silhouette (Clickable to open builder) */}
      <div
        onClick={() => {
          soundEffects.playBubblePop();
          triggerHaptic("light");
          setShowInteractiveModal(true);
        }}
        className="grid grid-cols-12 gap-1.5 sm:gap-2 p-2 sm:p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 shadow-xs cursor-pointer hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
        title="Click to launch interactive 9-inch plate builder"
      >
        {/* 50% Veggies / Soups */}
        <div className="col-span-6 p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex flex-col justify-between group-hover:brightness-105 transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider truncate">
                🥬 50% Soups
              </span>
              <span className="text-[8px] sm:text-[9px] font-black bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full shrink-0">
                2 Ladles
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
              Ewedu, Okra, Ugwu
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1.5 sm:mt-2 truncate">
            Buffers glucose
          </span>
        </div>

        {/* 25% Clean Protein */}
        <div className="col-span-3 p-2 sm:p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl flex flex-col justify-between group-hover:brightness-105 transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] sm:text-[10px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider truncate">
                🥩 25%
              </span>
              <span className="text-[8px] sm:text-[9px] font-black bg-amber-200 text-amber-900 px-1 py-0.2 rounded-full shrink-0">
                1 Palm
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
              Fish, Goat
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-1.5 sm:mt-2 truncate">
            Satiety
          </span>
        </div>

        {/* 25% Swallow / Carb */}
        <div className="col-span-3 p-2 sm:p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 rounded-xl flex flex-col justify-between group-hover:brightness-105 transition-all min-w-0">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] sm:text-[10px] font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-wider truncate">
                🍠 25%
              </span>
              <span className="text-[8px] sm:text-[9px] font-black bg-cyan-200 text-cyan-900 px-1 py-0.2 rounded-full shrink-0">
                1 Fist
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
              Plantain, Oats
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold mt-1.5 sm:mt-2 truncate">
            1-Fist energy
          </span>
        </div>
      </div>

      {/* Interactive Hand-Measure Mini Guide (Collapsible) */}
      {showHandGuide && (
        <div className="mt-3 p-3 sm:p-3.5 bg-teal-50/90 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-[#126778] dark:text-teal-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Heart size={14} className="text-rose-500" /> African Hand-Measure Rules
            </span>
            <button
              onClick={() => setShowHandGuide(false)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
            <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-bold block text-slate-900 dark:text-white">✊ 1 Fist (~25%)</span>
              <p className="text-slate-500 text-[9px] sm:text-[10px] mt-0.5">Amala, Garri, Pounded Yam, Rice, or Plantain.</p>
            </div>
            <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-bold block text-slate-900 dark:text-white">🥣 2 Ladles (~50%)</span>
              <p className="text-slate-500 text-[9px] sm:text-[10px] mt-0.5">Viscous soups like Ewedu, Okra, Ugu, or Efo Riro.</p>
            </div>
            <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-bold block text-slate-900 dark:text-white">✋ 1 Palm (~25%)</span>
              <p className="text-slate-500 text-[9px] sm:text-[10px] mt-0.5">Grilled/boiled fish (Mackerel/Tilapia), goat, eggs.</p>
            </div>
            <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <span className="font-bold block text-slate-900 dark:text-white">🥄 1 Spoon (Cap)</span>
              <p className="text-slate-500 text-[9px] sm:text-[10px] mt-0.5">Keep red palm oil or vegetable oil to ≤ 1 tbsp.</p>
            </div>
          </div>
        </div>
      )}

      {/* Full Interactive 9-Inch Plate Builder Modal */}
      {showInteractiveModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-transparent">
            {/* Close Button on Modal */}
            <button
              onClick={() => setShowInteractiveModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 sm:p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer shadow-lg"
              title="Close Builder"
            >
              <X size={16} />
            </button>

            <AfricanDiabetesPlate
              onLoggedSuccess={() => {
                setTimeout(() => setShowInteractiveModal(false), 1200);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
