import React, { useState } from "react";
import { Sparkles, ShieldCheck, ChevronRight, CheckCircle2, Flame, Droplet, Leaf } from "lucide-react";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic } from "../utils/celebration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

interface TriRingProps {
  score?: number;
  fiberScore?: number;
  portionScore?: number;
  waterScore?: number;
}

export default function TriRingMetabolicFlower({
  score = 92,
  fiberScore = 95,
  portionScore = 88,
  waterScore = 90,
}: TriRingProps) {
  const [showModal, setShowModal] = useState(false);

  // SVG Ring Radii
  const r1 = 64;
  const c1 = 2 * Math.PI * r1;
  const offset1 = c1 - (fiberScore / 100) * c1;

  const r2 = 48;
  const c2 = 2 * Math.PI * r2;
  const offset2 = c2 - (portionScore / 100) * c2;

  const r3 = 32;
  const c3 = 2 * Math.PI * r3;
  const offset3 = c3 - (waterScore / 100) * c3;

  const handleOpen = () => {
    soundEffects.playTactileTick();
    triggerHaptic("light");
    setShowModal(true);
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-[#0d2a33] to-slate-950 text-white border-2 border-teal-500/30 shadow-xl cursor-pointer hover:border-teal-400/50 transition-all group"
      >
        <div className="flex items-center justify-between gap-4 relative z-10">
          {/* 3 Rings */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={r1} className="stroke-slate-800" strokeWidth="8" fill="none" />
              <circle
                cx="80"
                cy="80"
                r={r1}
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={c1}
                strokeDashoffset={offset1}
                strokeLinecap="round"
                fill="none"
              />

              <circle cx="80" cy="80" r={r2} className="stroke-slate-800" strokeWidth="8" fill="none" />
              <circle
                cx="80"
                cy="80"
                r={r2}
                className="stroke-amber-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={c2}
                strokeDashoffset={offset2}
                strokeLinecap="round"
                fill="none"
              />

              <circle cx="80" cy="80" r={r3} className="stroke-slate-800" strokeWidth="8" fill="none" />
              <circle
                cx="80"
                cy="80"
                r={r3}
                className="stroke-cyan-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={c3}
                strokeDashoffset={offset3}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-black text-white leading-none">{score}</span>
              <span className="text-[9px] font-bold text-teal-300 uppercase tracking-wider mt-0.5">HEALTH SCORE</span>
            </div>
          </div>

          {/* Simple Descriptions */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white">Daily Health Rings</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Great Job! 🟢
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> Soup &amp; Veggies
                </span>
                <span className="font-bold text-white text-[11px]">{fiberScore}%</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" /> Food Portion
                </span>
                <span className="font-bold text-white text-[11px]">{portionScore}%</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 truncate">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" /> Water Drank
                </span>
                <span className="font-bold text-white text-[11px]">{waterScore}%</span>
              </div>
            </div>

            <div className="pt-0.5 flex items-center text-[10.5px] text-teal-300 font-bold group-hover:translate-x-0.5 transition-transform">
              <span>Tap to see details</span>
              <ChevronRight size={13} className="ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md p-5 rounded-3xl bg-slate-950 text-white border-2 border-teal-500/40 shadow-2xl">
          <DialogHeader className="text-center pb-1">
            <DialogTitle className="text-base font-black text-white text-center">
              Your Daily Health Rings (Score: {score}/100) 🥑
            </DialogTitle>
            <DialogDescription className="text-xs text-teal-300 text-center font-medium">
              Closing all 3 rings keeps your body healthy and full of energy
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-2 text-xs">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5">
              <Leaf size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-200 block text-xs font-bold">1. Soup &amp; Veggies ({fiberScore}%)</strong>
                <span className="text-[11px] text-slate-300 leading-snug">
                  Eating green vegetables or slimy soup (Ewedu/Okra) with your food helps keep your blood sugar steady.
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-2.5">
              <Flame size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-200 block text-xs font-bold">2. Food Portion ({portionScore}%)</strong>
                <span className="text-[11px] text-slate-300 leading-snug">
                  Your swallow and rice portion is the perfect size (about the size of your fist).
                </span>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-start gap-2.5">
              <Droplet size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-cyan-200 block text-xs font-bold">3. Water Drank ({waterScore}%)</strong>
                <span className="text-[11px] text-slate-300 leading-snug">
                  You are drinking good water today. Keep it up!
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
