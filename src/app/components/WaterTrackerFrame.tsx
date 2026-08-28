import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Droplets,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Bell,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Mascot from "./Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { toast } from "sonner";
import { shareHydrationNudgeToWhatsApp } from "../../lib/whatsapp";

interface WaterTrackerFrameProps {
  currentGlasses: number;
  targetGlasses?: number;
  onAddGlass: (amountMl?: number) => void;
  onRemoveGlass?: () => void;
  onOpenDetails?: () => void;
  onOpenReminderModal?: () => void;
}

export default function WaterTrackerFrame({
  currentGlasses = 0,
  targetGlasses = 8,
  onAddGlass,
  onRemoveGlass,
  onOpenDetails,
  onOpenReminderModal,
}: WaterTrackerFrameProps) {
  const navigate = useNavigate();
  const [mascotGesture, setMascotGesture] = useState<string>("drink");
  const [justDrank, setJustDrank] = useState(false);

  const glassSizeMl = 250;
  const currentMl = currentGlasses * glassSizeMl;
  const targetMl = targetGlasses * glassSizeMl;
  const progressPercent = Math.min(100, Math.round((currentGlasses / targetGlasses) * 100));

  const handleQuickAdd = (ml: number, name: string) => {
    triggerHaptic("medium");
    setJustDrank(true);
    setMascotGesture("drinking");

    onAddGlass(ml);

    if (currentGlasses + 1 >= targetGlasses) {
      triggerConfetti("burst");
      triggerHaptic("success");
      toast.success(`🎉 Amazing! You hit your daily hydration goal of ${targetGlasses} glasses (${targetMl}ml)!`);
    } else {
      toast.success(`+${ml}ml ${name} logged! 💧 (${Math.min(100, progressPercent + 12)}% of daily goal)`);
    }

    setTimeout(() => {
      setJustDrank(false);
      setMascotGesture("drink");
    }, 2800);
  };

  const handleUndo = () => {
    if (currentGlasses <= 0) return;
    triggerHaptic("light");
    if (onRemoveGlass) {
      onRemoveGlass();
      toast.info("Removed 1 glass (-250ml)");
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0c4a6e] via-[#0369a1] to-[#0284c7] text-white rounded-3xl p-4 sm:p-5 shadow-xl border-2 border-cyan-300/40 group">
      {/* Decorative Aquatic Shimmer Particles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between relative z-10 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-cyan-200">
            <Droplets className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-400/25 border border-cyan-300/40 text-cyan-100 text-[9.5px] font-black uppercase tracking-wider">
              <Sparkles size={9} />
              <span>Hydration Station</span>
            </div>
            <h3 className="text-sm sm:text-base font-black leading-tight text-white">
              Daily Water &amp; Cellular Flush
            </h3>
          </div>
        </div>

        {/* Deep Dive Action */}
        <button
          type="button"
          onClick={onOpenDetails || (() => navigate("/hydration"))}
          className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-xs font-black text-white flex items-center gap-1 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
        >
          <span>Deep-Dive</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Middle Interactive Zone: Hydro Gauge + Live Mascot Avo Drinking Water */}
      <div className="grid grid-cols-12 gap-3 items-center relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
        {/* Left: Animated Hydro Cylinder & Metric */}
        <div className="col-span-7 sm:col-span-8 flex flex-col justify-between">
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-cyan-100">
                {currentMl.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-cyan-200/80">/ {targetMl.toLocaleString()} ml</span>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-cyan-300 text-slate-900 shadow-2xs">
              {progressPercent}%
            </span>
          </div>

          {/* Animated Wave Hydro Bar */}
          <div className="w-full h-3.5 bg-slate-900/40 rounded-full overflow-hidden p-0.5 border border-white/20 relative shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-300 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Shimmer Light Bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-75 rounded-full" />
            </motion.div>
          </div>

          {/* Glass Count Pills */}
          <div className="flex items-center justify-between mt-2 text-[11px] font-bold text-cyan-100">
            <span>
              💧 {currentGlasses} of {targetGlasses} Glasses Logged
            </span>
            {currentGlasses > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="text-[10px] text-cyan-200 hover:text-white underline flex items-center gap-0.5 cursor-pointer opacity-80 hover:opacity-100"
                title="Undo last glass"
              >
                <RotateCcw size={10} />
                <span>Undo</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Live Avo Drinking Water Mascot Rig */}
        <div className="col-span-5 sm:col-span-4 flex flex-col items-center justify-center relative">
          <div
            onClick={onOpenReminderModal}
            className="cursor-pointer group/mascot relative flex flex-col items-center hover:scale-105 transition-transform"
            title="Tap Avo to open Hydration Masterclass & Reminders!"
          >
            <div className="relative">
              {/* Mascot Video / Rig playing drinking water */}
              <Mascot gesture={mascotGesture} size={84} className="filter drop-shadow-md" />

              {/* Water Splash Badge */}
              <AnimatePresence>
                {justDrank && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 10 }}
                    animate={{ scale: 1.2, opacity: 1, y: -15 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-3 right-0 bg-cyan-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md pointer-events-none"
                  >
                    +250ml 💧
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-[9px] font-black text-cyan-100 bg-white/20 px-2 py-0.5 rounded-full mt-0.5 border border-white/20">
              Avo Drinking 🥑💧
            </span>
          </div>
        </div>
      </div>

      {/* Quick-Log Beverage 1-Tap Pill Buttons */}
      <div className="mt-3 relative z-10">
        <div className="flex items-center justify-between mb-1.5 text-[11px] font-extrabold text-cyan-100">
          <span>1-Tap Quick Hydrate:</span>
          <button
            type="button"
            onClick={() => shareHydrationNudgeToWhatsApp(currentGlasses, targetGlasses)}
            className="text-[10px] text-emerald-200 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
          >
            <Share2 size={10} />
            <span>WhatsApp Buddy</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {/* 1. Pure Water Glass */}
          <button
            type="button"
            onClick={() => handleQuickAdd(250, "Pure Water")}
            className="py-2 px-1 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-xl border border-white/25 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs"
          >
            <span className="text-base leading-none mb-0.5">💧</span>
            <span className="text-[10px] font-black text-white leading-tight">+250ml</span>
            <span className="text-[8px] text-cyan-100 font-semibold truncate w-full">Glass</span>
          </button>

          {/* 2. Water Bottle / Sachet */}
          <button
            type="button"
            onClick={() => handleQuickAdd(500, "Bottle / Sachet")}
            className="py-2 px-1 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-xl border border-white/25 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs"
          >
            <span className="text-base leading-none mb-0.5">🧴</span>
            <span className="text-[10px] font-black text-white leading-tight">+500ml</span>
            <span className="text-[8px] text-cyan-100 font-semibold truncate w-full">Bottle</span>
          </button>

          {/* 3. Zobo Hibiscus Brew */}
          <button
            type="button"
            onClick={() => handleQuickAdd(300, "Zobo Tea")}
            className="py-2 px-1 bg-rose-500/30 hover:bg-rose-500/40 active:scale-95 transition-all rounded-xl border border-rose-300/30 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs"
          >
            <span className="text-base leading-none mb-0.5">🌺</span>
            <span className="text-[10px] font-black text-rose-100 leading-tight">+300ml</span>
            <span className="text-[8px] text-rose-200 font-semibold truncate w-full">Zobo</span>
          </button>

          {/* 4. Warm Ginger & Lemon Infusion */}
          <button
            type="button"
            onClick={() => handleQuickAdd(250, "Ginger Lemon Infusion")}
            className="py-2 px-1 bg-lime-500/30 hover:bg-lime-500/40 active:scale-95 transition-all rounded-xl border border-lime-300/30 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs"
          >
            <span className="text-base leading-none mb-0.5">🍋</span>
            <span className="text-[10px] font-black text-lime-100 leading-tight">+250ml</span>
            <span className="text-[8px] text-lime-200 font-semibold truncate w-full">Lemon</span>
          </button>
        </div>
      </div>

      {/* Clinical Metabolic Footer Tip */}
      <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-cyan-100 relative z-10">
        <div className="flex items-center gap-1 font-semibold">
          <ShieldCheck size={12} className="text-emerald-300 shrink-0" />
          <span className="leading-tight">
            500ml water pre-meal lowers post-prandial glucose spikes by <strong>~18%</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
