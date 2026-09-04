import React, { useState } from "react";
import { Sparkles, ShieldCheck, Info, ChevronRight, CheckCircle2, Flame, Droplet, Leaf } from "lucide-react";
import { motion } from "motion/react";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

interface TriRingProps {
  score?: number;
  fiberScore?: number; // 0 - 100
  portionScore?: number; // 0 - 100
  waterScore?: number; // 0 - 100
  onExplore?: () => void;
}

export default function TriRingMetabolicFlower({
  score = 92,
  fiberScore = 95,
  portionScore = 88,
  waterScore = 90,
  onExplore,
}: TriRingProps) {
  const [showModal, setShowModal] = useState(false);

  // SVG Ring Radii
  // Ring 1 (Outer - Fiber & Soups)
  const r1 = 64;
  const c1 = 2 * Math.PI * r1;
  const offset1 = c1 - (fiberScore / 100) * c1;

  // Ring 2 (Middle - Portion & Swallow Control)
  const r2 = 48;
  const c2 = 2 * Math.PI * r2;
  const offset2 = c2 - (portionScore / 100) * c2;

  // Ring 3 (Inner - Hydration & Circadian Timing)
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
        className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-[#0d2a33] to-slate-950 text-white border-2 border-teal-500/30 shadow-2xl shadow-teal-500/10 cursor-pointer hover:border-teal-400/50 transition-all group"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 relative z-10">
          {/* Concentric 3-Ring Visual */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background Track 1 */}
              <circle cx="80" cy="80" r={r1} className="stroke-slate-800" strokeWidth="8" fill="none" />
              {/* Active Ring 1 (Emerald - Fiber) */}
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

              {/* Background Track 2 */}
              <circle cx="80" cy="80" r={r2} className="stroke-slate-800" strokeWidth="8" fill="none" />
              {/* Active Ring 2 (Amber - Portions) */}
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

              {/* Background Track 3 */}
              <circle cx="80" cy="80" r={r3} className="stroke-slate-800" strokeWidth="8" fill="none" />
              {/* Active Ring 3 (Cyan - Hydration) */}
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

            {/* Center Score Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-white leading-none tracking-tight">{score}</span>
              <span className="text-[9px] font-bold text-teal-300 uppercase tracking-widest mt-0.5">SCORE</span>
            </div>
          </div>

          {/* Right Metrics Summary */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">Daily Metabolic Flower</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Optimal 🛡️
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Fiber Ring */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Veggie &amp; Soup Buffer
                </span>
                <span className="font-bold text-white text-[11px]">{fiberScore}%</span>
              </div>

              {/* Portion Ring */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Swallow Portion Control
                </span>
                <span className="font-bold text-white text-[11px]">{portionScore}%</span>
              </div>

              {/* Water Ring */}
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Hydration &amp; Timing
                </span>
                <span className="font-bold text-white text-[11px]">{waterScore}%</span>
              </div>
            </div>

            <div className="pt-1 flex items-center text-[10px] text-teal-300 font-bold group-hover:translate-x-0.5 transition-transform">
              <span>Tap to see 3-Ring breakdown</span>
              <ChevronRight size={13} className="ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-slate-950 text-white border-2 border-teal-500/40 shadow-2xl">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-lg font-black text-white text-center">
              Your Daily Metabolic Flower (Score: {score}/100) 🌸
            </DialogTitle>
            <DialogDescription className="text-xs text-teal-300 text-center font-medium">
              Closing all 3 rings keeps glucose and blood pressure stable
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0">
                <Leaf size={16} />
              </div>
              <div>
                <strong className="text-emerald-200 block text-xs font-bold">1. Fiber &amp; Soup Buffer ({fiberScore}%)</strong>
                <span className="text-[11px] text-slate-300 leading-snug">
                  You've paired 2 of 2 meals with viscous leafy soups (Ewedu/Okra), slowing carb absorption by 38%.
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl shrink-0">
                <Flame size={16} />
              </div>
              <div>
                <strong className="text-amber-200 block text-xs font-bold">2. Swallow &amp; Carb Balance ({portionScore}%)</strong>
                <span className="text-[11px] text-slate-300 leading-snug">
                  Swallow portions remained within the healthy 1-Fist guideline today. Excellent starch moderation!
                </span>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl shrink-0">
                <Droplet size={16} />
              </div>
              <div>
                <strong className="text-cyan-200 block text-xs font-bold">3. Hydration &amp; Timing ({waterScore}%)</strong>
                <span className="text-[11px] text-slate-300 leading-snug">
                  1,800ml water logged. Take 1 more glass before 8 PM to hit 100% hydration.
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
