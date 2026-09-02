import React, { useState } from "react";
import { Sparkles, Activity, Droplets, ShieldCheck, ChevronRight, Info, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { triggerHaptic } from "../utils/celebration";
import { soundEffects } from "../utils/soundEffects";

interface MetabolicScoreRingProps {
  score?: number; // 0 to 100
  waterGlasses?: number;
  totalCalories?: number;
  totalCarbs?: number;
  totalProtein?: number;
}

export default function MetabolicScoreRing({
  score = 92,
  waterGlasses = 5,
  totalCalories = 1450,
  totalCarbs = 135,
  totalProtein = 72,
}: MetabolicScoreRingProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Compute status and tier colors
  const status =
    score >= 88
      ? {
          title: "Metabolic Master",
          rating: "Optimal Stability",
          badge: "🟢 Optimal",
          textColor: "text-emerald-400",
          ringColor: "#10b981",
          gradientFrom: "#10b981",
          gradientTo: "#0d9488",
          summary: "Your meals today feature low glycemic spike density and great fiber buffering!",
        }
      : score >= 70
      ? {
          title: "Steady Balance",
          rating: "Moderate Carbs",
          badge: "🟡 Steady",
          textColor: "text-amber-300",
          ringColor: "#f59e0b",
          gradientFrom: "#f59e0b",
          gradientTo: "#d97706",
          summary: "Moderate carbohydrate density. Take a quick 10-minute walk to keep glucose flat.",
        }
      : {
          title: "Spike Alert",
          rating: "High Sugar Risk",
          badge: "🔴 Needs Buffer",
          textColor: "text-rose-400",
          ringColor: "#ef4444",
          gradientFrom: "#ef4444",
          gradientTo: "#be123c",
          summary: "Heavy starch detected. Add a bowl of Okra/Ewedu soup or drink 2 glasses of water.",
        };

  // SVG Ring calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleOpenModal = () => {
    triggerHaptic("medium");
    soundEffects.playTactileTick();
    setShowBreakdown(true);
  };

  return (
    <>
      {/* ⭕ COMPACT "ONE-GLANCE" METABOLIC SCORE RING CARD */}
      <div
        onClick={handleOpenModal}
        className="glass-card-teal rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-white/25 cursor-pointer group hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute -right-12 -bottom-12 w-36 h-36 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Left: Metric Score & Status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[9.5px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-teal-100 px-2.5 py-0.5 rounded-full border border-white/20">
                Daily Metabolic Score
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-200 border border-emerald-300/30">
                {status.badge}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {status.title}
            </h3>
            <p className="text-[11px] text-teal-100/90 font-medium line-clamp-1 mt-0.5">
              {status.summary}
            </p>

            <div className="flex items-center gap-3 mt-2 text-[10.5px] font-bold text-teal-200">
              <span className="flex items-center gap-1">
                <Droplets size={12} className="text-cyan-300" />
                {waterGlasses}/8 Cups
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Activity size={12} className="text-amber-300" />
                {totalCarbs}g Carbs
              </span>
              <span>•</span>
              <span className="text-teal-300 font-extrabold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Breakdown <ChevronRight size={12} />
              </span>
            </div>
          </div>

          {/* Right: Circular Progress Ring */}
          <div className="relative w-22 h-22 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 96 96">
              {/* Background Track */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-white/15 stroke-current"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Animated Foreground Progress */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke={status.ringColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
              />
            </svg>

            {/* Inner Ring Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-black font-mono leading-none text-white tracking-tight">
                {score}
              </span>
              <span className="text-[8.5px] font-extrabold uppercase text-teal-200 tracking-wider mt-0.5">
                / 100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 INTERACTIVE METABOLIC SCORE BREAKDOWN MODAL */}
      <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
        <DialogContent className="sm:max-w-md rounded-3xl p-5 sm:p-6 bg-slate-950 text-white border border-teal-500/30 max-h-[88vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-400/30 text-xl">
                ⭕
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-black text-white">
                  Metabolic Health Balance Breakdown
                </DialogTitle>
                <DialogDescription className="text-xs text-teal-200">
                  Calculated from your food logs, glucose buffer ratio &amp; hydration
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {/* 4 Core Pillars */}
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-1 bg-emerald-500/20 rounded-xl">🥗</span>
                <div>
                  <h4 className="font-bold text-white">Glycemic Buffer Ratio</h4>
                  <p className="text-[10.5px] text-slate-300">Soluble fiber (Okra/Ewedu) vs Carbs</p>
                </div>
              </div>
              <span className="font-black text-emerald-400 text-sm">96% (Optimal)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-1 bg-cyan-500/20 rounded-xl">💧</span>
                <div>
                  <h4 className="font-bold text-white">Hydration &amp; Kidney Flush</h4>
                  <p className="text-[10.5px] text-slate-300">{waterGlasses} of 8 glasses logged</p>
                </div>
              </div>
              <span className="font-black text-cyan-300 text-sm">
                {Math.round((waterGlasses / 8) * 100)}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-1 bg-amber-500/20 rounded-xl">🥩</span>
                <div>
                  <h4 className="font-bold text-white">Protein Satiety Anchor</h4>
                  <p className="text-[10.5px] text-slate-300">{totalProtein}g protein from fish, eggs &amp; beans</p>
                </div>
              </div>
              <span className="font-black text-amber-300 text-sm">90% Met</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl p-1 bg-purple-500/20 rounded-xl">🚶🏾‍♂️</span>
                <div>
                  <h4 className="font-bold text-white">Post-Meal GLUT4 Movement</h4>
                  <p className="text-[10.5px] text-slate-300">Muscular glucose clearance walk</p>
                </div>
              </div>
              <span className="font-black text-purple-300 text-sm">Recommended</span>
            </div>

            {/* Clinical Tip */}
            <div className="p-3 bg-teal-950/60 border border-teal-500/30 rounded-2xl text-[11px] text-teal-200 leading-relaxed">
              💡 <strong>Avo's Metabolic Tip:</strong> Eating your protein and vegetable soup 5 minutes before your swallow or rice reduces the glycemic spike by up to 38%!
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
