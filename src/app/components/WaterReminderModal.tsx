import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface WaterReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGlasses: number;
  targetGlasses?: number;
  onAddGlass: (amountMl?: number) => void;
}

export default function WaterReminderModal({
  isOpen,
  onClose,
  currentGlasses = 0,
  targetGlasses = 8,
  onAddGlass,
}: WaterReminderModalProps) {
  const [mascotGesture, setMascotGesture] = useState<string>("drink");
  const glassSizeMl = 250;
  const currentMl = currentGlasses * glassSizeMl;
  const targetMl = targetGlasses * glassSizeMl;
  const progressPercent = Math.min(100, Math.round((currentGlasses / targetGlasses) * 100));

  const handleDrinkAndLog = (ml: number, name: string) => {
    triggerHaptic("medium");
    setMascotGesture("drinking");
    onAddGlass(ml);
    triggerConfetti("confetti");
    toast.success(`💧 Glug glug! +${ml}ml ${name} logged!`);

    setTimeout(() => {
      setMascotGesture("drink");
      onClose();
    }, 1800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-b from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white border-2 border-cyan-300/40 rounded-3xl shadow-2xl">
        {/* Top Floating Glow */}
        <div className="p-6 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-cyan-300/20 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-all"
          >
            <X size={16} />
          </button>

          {/* Mascot Center Stage: Avo Drinking Water */}
          <div className="flex flex-col items-center mb-3">
            <div className="relative mb-1">
              <Mascot gesture={mascotGesture} size={110} className="filter drop-shadow-xl" />
              <div className="absolute -bottom-1 -right-1 bg-cyan-300 text-slate-900 p-1 rounded-full shadow-md animate-bounce">
                <Droplets size={16} />
              </div>
            </div>

            {/* Speech Bubble */}
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-4 py-2 text-xs font-bold text-cyan-50 shadow-md max-w-xs">
              🥑 Avo: "Time for a cellular refresh! Staying hydrated lowers blood viscosity and flushes excess sodium."
            </div>
          </div>

          <h2 className="text-xl font-black text-white leading-tight">
            Hydration Check-In 💧
          </h2>
          <p className="text-xs text-cyan-100/90 mt-1">
            Current status: <strong>{currentMl}ml / {targetMl}ml</strong> ({currentGlasses} of {targetGlasses} Glasses)
          </p>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-900/30 rounded-full overflow-hidden p-0.5 border border-white/20 my-3 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* 1-Tap Drink Options */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 text-left">
            <button
              type="button"
              onClick={() => handleDrinkAndLog(250, "Pure Water Glass")}
              className="p-3 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl border border-white/30 cursor-pointer flex items-center gap-2.5 shadow-sm"
            >
              <span className="text-2xl">💧</span>
              <div>
                <span className="text-xs font-black block text-white">+250ml Glass</span>
                <span className="text-[10px] text-cyan-100 font-medium">Pure Spring Water</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDrinkAndLog(500, "Water Bottle")}
              className="p-3 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-2xl border border-white/30 cursor-pointer flex items-center gap-2.5 shadow-sm"
            >
              <span className="text-2xl">🧴</span>
              <div>
                <span className="text-xs font-black block text-white">+500ml Bottle</span>
                <span className="text-[10px] text-cyan-100 font-medium">Full Sachet / Bottle</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDrinkAndLog(300, "Unsweetened Zobo")}
              className="p-3 bg-rose-500/30 hover:bg-rose-500/40 active:scale-95 transition-all rounded-2xl border border-rose-300/30 cursor-pointer flex items-center gap-2.5 shadow-sm"
            >
              <span className="text-2xl">🌺</span>
              <div>
                <span className="text-xs font-black block text-rose-100">+300ml Zobo</span>
                <span className="text-[10px] text-rose-200 font-medium">Hibiscus BP Shield</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDrinkAndLog(300, "Coconut Water")}
              className="p-3 bg-amber-500/30 hover:bg-amber-500/40 active:scale-95 transition-all rounded-2xl border border-amber-300/30 cursor-pointer flex items-center gap-2.5 shadow-sm"
            >
              <span className="text-2xl">🥥</span>
              <div>
                <span className="text-xs font-black block text-amber-100">+300ml Coconut</span>
                <span className="text-[10px] text-amber-200 font-medium">Natural Electrolytes</span>
              </div>
            </button>
          </div>

          {/* WhatsApp Buddy Share */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shareHydrationNudgeToWhatsApp(currentGlasses, targetGlasses)}
              className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 size={13} />
              <span>Share Hydration Nudge on WhatsApp</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
