import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";
import {
  Droplets,
  Sparkles,
  Clock,
  Bell,
  CheckCircle2,
  X,
  Share2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Mascot from "./Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { toast } from "sonner";
import { shareHydrationNudgeToWhatsApp } from "../../lib/whatsapp";
import { motion } from "motion/react";
import { useHydrationSync, GLASS_ML, DEFAULT_GOAL_GLASSES } from "../services/hydrationSync";

interface WaterReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGlasses?: number;
  targetGlasses?: number;
  onAddGlass?: (amountMl?: number, type?: string, name?: string) => Promise<any> | void;
}

export default function WaterReminderModal({
  isOpen,
  onClose,
  targetGlasses = DEFAULT_GOAL_GLASSES,
}: WaterReminderModalProps) {
  const { totalMl, glasses, goalGlasses, percent, addGlass } = useHydrationSync();
  const [mascotGesture, setMascotGesture] = useState<string>("drink");
  const [justLoggedAmount, setJustLoggedAmount] = useState<number | null>(null);

  const targetMl = targetGlasses * GLASS_ML;

  const handleDrinkAndLog = async (ml: number, name: string, type: string = "water") => {
    triggerHaptic("medium");
    setMascotGesture("drinking");
    setJustLoggedAmount(ml);

    await addGlass(ml, type, name);
    triggerConfetti("confetti");

    setTimeout(() => {
      setMascotGesture("celebrate");
    }, 1000);

    setTimeout(() => {
      setMascotGesture("drink");
      setJustLoggedAmount(null);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-b from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white border-2 border-cyan-300/40 rounded-3xl shadow-2xl">
        {/* Top Floating Glow */}
        <div className="p-6 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />

          {/* Mascot Center Stage: Avo Drinking Water */}
          <div className="flex flex-col items-center mb-3">
            <div className="relative mb-1">
              <Mascot gesture={mascotGesture} size={110} className="filter drop-shadow-xl" />
              <div className="absolute -bottom-1 -right-1 bg-cyan-300 text-slate-900 p-1.5 rounded-full shadow-md animate-bounce">
                <Droplets size={16} />
              </div>
            </div>

            {/* Speech Bubble */}
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2 text-xs font-bold text-cyan-50 shadow-md max-w-xs">
              🥑 Avo: "Time for a cellular refresh! Staying hydrated lowers blood viscosity and flushes excess sodium."
            </div>
          </div>

          <h2 className="text-xl font-black text-white leading-tight">
            AVO Hydration Instruction 💧
          </h2>
          <p className="text-xs text-cyan-100/90 mt-1">
            Real-time Status: <strong>{totalMl}ml / {targetMl}ml</strong> ({glasses} of {targetGlasses} Glasses)
          </p>

          {/* Synchronized Real-time Progress Bar */}
          <div className="w-full h-3 bg-slate-900/30 rounded-full overflow-hidden p-0.5 border border-white/20 my-3 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 rounded-full"
              initial={{ width: `${percent}%` }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* 1-Tap Drink Options */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 text-left">
            <button
              type="button"
              onClick={() => handleDrinkAndLog(250, "Pure Water Glass", "water")}
              className="p-3 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl border border-white/30 cursor-pointer flex items-center gap-2.5 shadow-sm group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">💧</span>
              <div>
                <span className="text-xs font-black block text-white">+250ml Glass</span>
                <span className="text-[10px] text-cyan-100 font-medium">Pure Spring Water</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDrinkAndLog(500, "Water Bottle", "water")}
              className="p-3 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl border border-white/30 cursor-pointer flex items-center gap-2.5 shadow-sm group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🧴</span>
              <div>
                <span className="text-xs font-black block text-white">+500ml Bottle</span>
                <span className="text-[10px] text-cyan-100 font-medium">Full Sachet / Bottle</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDrinkAndLog(300, "Unsweetened Zobo", "zobo")}
              className="p-3 bg-rose-500/30 hover:bg-rose-500/40 active:scale-95 transition-all rounded-2xl border border-rose-300/30 cursor-pointer flex items-center gap-2.5 shadow-sm group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🌺</span>
              <div>
                <span className="text-xs font-black block text-rose-100">+300ml Zobo</span>
                <span className="text-[10px] text-rose-200 font-medium">Hibiscus BP Shield</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDrinkAndLog(300, "Coconut Water", "coconut")}
              className="p-3 bg-amber-500/30 hover:bg-amber-500/40 active:scale-95 transition-all rounded-2xl border border-amber-300/30 cursor-pointer flex items-center gap-2.5 shadow-sm group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🥥</span>
              <div>
                <span className="text-xs font-black block text-amber-100">+300ml Coconut</span>
                <span className="text-[10px] text-amber-200 font-medium">Natural Electrolytes</span>
              </div>
            </button>
          </div>

          {/* Footer Clinical Insight */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-cyan-100">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-cyan-300" />
              <span>Flushes heavy swallow sodium</span>
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                shareHydrationNudgeToWhatsApp(glasses, targetGlasses);
              }}
              className="text-white hover:text-cyan-200 font-bold flex items-center gap-1 cursor-pointer bg-white/10 px-2.5 py-1 rounded-xl"
            >
              <Share2 size={12} />
              <span>Share Status</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
