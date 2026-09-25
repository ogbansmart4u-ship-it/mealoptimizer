import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, ChevronRight, CheckCircle2, Flame, Droplet, Leaf, Plus, Camera, Zap, Award, Info } from "lucide-react";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

export interface TriRingProps {
  score?: number;
  fiberScore?: number;
  portionScore?: number;
  waterScore?: number;
  hasActivityToday?: boolean;
  statusBadge?: {
    label: string;
    variant: "idle" | "progress" | "good" | "optimal" | "complete";
  };
  metrics?: {
    veggieMealsCount: number;
    targetVeggieMeals: number;
    caloriesConsumed: number;
    caloriesTarget: number;
    proteinConsumed?: number;
    carbsConsumed?: number;
    fatsConsumed?: number;
    waterGlasses: number;
    waterGoal: number;
    totalMealsLogged: number;
    allRingsClosed?: boolean;
    closedRingsCount?: number;
  };
  onAddWater?: () => void;
  onOpenScanner?: () => void;
  onQuickLog?: () => void;
}

export default function TriRingMetabolicFlower({
  score = 0,
  fiberScore = 0,
  portionScore = 0,
  waterScore = 0,
  hasActivityToday = false,
  statusBadge = { label: "Ready to Start ✨", variant: "idle" },
  metrics,
  onAddWater,
  onOpenScanner,
  onQuickLog,
}: TriRingProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasCelebratedAllClosed, setHasCelebratedAllClosed] = useState(false);

  // SVG Ring Radii (Concentric 3 Rings)
  const r1 = 64; // Outer: Soup & Veggies
  const c1 = 2 * Math.PI * r1;
  const clampedFiber = Math.min(100, Math.max(0, fiberScore));
  const offset1 = c1 - (clampedFiber / 100) * c1;

  const r2 = 48; // Middle: Food Portion
  const c2 = 2 * Math.PI * r2;
  const clampedPortion = Math.min(100, Math.max(0, portionScore));
  const offset2 = c2 - (clampedPortion / 100) * c2;

  const r3 = 32; // Inner: Water Drank
  const c3 = 2 * Math.PI * r3;
  const clampedWater = Math.min(100, Math.max(0, waterScore));
  const offset3 = c3 - (clampedWater / 100) * c3;

  // Ring completion celebration
  const allClosed = clampedFiber >= 100 && clampedPortion >= 100 && clampedWater >= 100;
  useEffect(() => {
    if (allClosed && !hasCelebratedAllClosed) {
      setHasCelebratedAllClosed(true);
      try {
        soundEffects.playCelebrationChime();
        triggerHaptic("milestone");
        triggerConfetti("burst");
      } catch {}
    }
  }, [allClosed, hasCelebratedAllClosed]);

  const handleOpen = () => {
    soundEffects.playTactileTick();
    triggerHaptic("light");
    setShowModal(true);
  };

  const handleModalAddWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddWater) {
      soundEffects.playWaterDrop();
      triggerHaptic("medium");
      onAddWater();
    }
  };

  const badgeColorClass = {
    idle: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    progress: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    good: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    optimal: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    complete: "bg-gradient-to-r from-emerald-500/30 to-amber-500/30 text-amber-200 border-amber-400/40 shadow-sm",
  }[statusBadge.variant || "idle"];

  return (
    <>
      <div
        onClick={handleOpen}
        className="relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-[#0a232b] to-slate-950 text-white border-2 border-teal-500/30 shadow-xl cursor-pointer hover:border-teal-400/50 transition-all group"
      >
        {/* Subtle Ambient Background Glow */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-4 relative z-10">
          {/* Concentric 3 Rings */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              <defs>
                {/* Outer Ring: Emerald / Mint Gradient */}
                <linearGradient id="ringEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>

                {/* Middle Ring: Amber / Gold Gradient */}
                <linearGradient id="ringAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>

                {/* Inner Ring: Cyan / Sky Gradient */}
                <linearGradient id="ringCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Ring 1 (Outer - Soup & Veggies) */}
              <circle cx="80" cy="80" r={r1} className="stroke-slate-800/90" strokeWidth="8" fill="none" />
              <circle
                cx="80"
                cy="80"
                r={r1}
                stroke="url(#ringEmerald)"
                className="transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={c1}
                strokeDashoffset={offset1}
                strokeLinecap="round"
                fill="none"
              />

              {/* Ring 2 (Middle - Food Portion) */}
              <circle cx="80" cy="80" r={r2} className="stroke-slate-800/90" strokeWidth="8" fill="none" />
              <circle
                cx="80"
                cy="80"
                r={r2}
                stroke="url(#ringAmber)"
                className="transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={c2}
                strokeDashoffset={offset2}
                strokeLinecap="round"
                fill="none"
              />

              {/* Ring 3 (Inner - Water Drank) */}
              <circle cx="80" cy="80" r={r3} className="stroke-slate-800/90" strokeWidth="8" fill="none" />
              <circle
                cx="80"
                cy="80"
                r={r3}
                stroke="url(#ringCyan)"
                className="transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={c3}
                strokeDashoffset={offset3}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Center Dynamic Metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              {!hasActivityToday && score === 0 ? (
                <>
                  <span className="text-xl sm:text-2xl font-black text-teal-200/90 leading-none">0</span>
                  <span className="text-[8.5px] font-bold text-teal-400/90 uppercase tracking-widest mt-1">
                    START TODAY
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                    {score}
                  </span>
                  <span className="text-[8.5px] font-bold text-teal-300 uppercase tracking-wider mt-0.5">
                    HEALTH SCORE
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Ring Legend & Live Progress */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-white">Daily Health Rings</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColorClass}`}>
                {statusBadge.label}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Row 1: Soup & Veggies */}
              <div className="flex items-center justify-between text-slate-300 gap-1">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 truncate">
                  <span className={`w-2 h-2 rounded-full bg-emerald-400 shrink-0 ${clampedFiber >= 100 ? "ring-2 ring-emerald-300/60" : ""}`} />
                  Soup &amp; Veggies
                </span>
                <span className="font-bold text-white text-[11px] shrink-0">
                  {clampedFiber}%
                </span>
              </div>

              {/* Row 2: Food Portion */}
              <div className="flex items-center justify-between text-slate-300 gap-1">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 truncate">
                  <span className={`w-2 h-2 rounded-full bg-amber-400 shrink-0 ${clampedPortion >= 100 ? "ring-2 ring-amber-300/60" : ""}`} />
                  Food Portion
                </span>
                <span className="font-bold text-white text-[11px] shrink-0">
                  {clampedPortion}%
                </span>
              </div>

              {/* Row 3: Water Drank */}
              <div className="flex items-center justify-between text-slate-300 gap-1">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 truncate">
                  <span className={`w-2 h-2 rounded-full bg-cyan-400 shrink-0 ${clampedWater >= 100 ? "ring-2 ring-cyan-300/60" : ""}`} />
                  Water Drank
                </span>
                <span className="font-bold text-white text-[11px] shrink-0">
                  {clampedWater}%
                </span>
              </div>
            </div>

            <div className="pt-0.5 flex items-center justify-between text-[10.5px]">
              <div className="flex items-center text-teal-300 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>Tap to see details</span>
                <ChevronRight size={13} className="ml-0.5" />
              </div>
              {metrics && (
                <span className="text-[10px] text-slate-400">
                  {metrics.waterGlasses}/{metrics.waterGoal} cups
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 10x Feature: Zero-Day / Morning Quick Action Starter Bar */}
        {!hasActivityToday && (
          <div className="mt-3 pt-3 border-t border-teal-500/20 flex items-center justify-between gap-2">
            <span className="text-[10px] text-teal-200/80 font-medium">
              Ignite your rings:
            </span>
            <div className="flex items-center gap-1.5">
              {onAddWater && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModalAddWater(e);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[10.5px] font-bold flex items-center gap-1 transition-all active:scale-95"
                >
                  <Plus size={11} /> 1 Cup Water
                </button>
              )}
              {onOpenScanner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenScanner();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-bold flex items-center gap-1 transition-all active:scale-95"
                >
                  <Camera size={11} /> Scan Meal
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🌟 10X INTERACTIVE CLINICAL BREAKDOWN MODAL */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md p-5 rounded-3xl bg-slate-950 text-white border-2 border-teal-500/40 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-1">
            <div className="mx-auto w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 mb-1">
              <Award size={22} />
            </div>
            <DialogTitle className="text-base sm:text-lg font-black text-white text-center">
              Daily Health Rings {hasActivityToday ? `(Score: ${score}/100)` : "(Ready to Start)"}
            </DialogTitle>
            <DialogDescription className="text-xs text-teal-300 text-center font-medium">
              Closing all 3 rings stabilizes blood sugar, optimizes portions, and keeps your cellular energy high.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            {/* 1. Soup & Veggies Breakdown */}
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Leaf size={16} />
                  </div>
                  <div>
                    <strong className="text-emerald-200 block text-xs font-bold">1. Soup &amp; Veggies</strong>
                    <span className="text-[10px] text-emerald-400/90 font-medium">Fiber &amp; Viscous Gel Buffer</span>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-300">{clampedFiber}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-emerald-500/20">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${clampedFiber}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                <span>
                  {metrics
                    ? `${metrics.veggieMealsCount} of ${metrics.targetVeggieMeals} buffered meals today`
                    : clampedFiber >= 100 ? "Goal met!" : "Target: 2 buffered meals"}
                </span>
                {clampedFiber >= 100 && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Closed
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-emerald-500/10">
                Eating green vegetables (Ugu, spinach) or traditional viscous soup (Ewedu, Okra, Ogbono) forms a fiber mesh in the digestive tract that slows starch breakdown, preventing post-meal spikes and energy crashes.
              </p>

              {onOpenScanner && clampedFiber < 100 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    onOpenScanner();
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold flex items-center justify-center gap-1.5 transition-all text-xs"
                >
                  <Camera size={13} /> Scan Meal with Veggie Buffer
                </button>
              )}
            </div>

            {/* 2. Food Portion Breakdown */}
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                    <Flame size={16} />
                  </div>
                  <div>
                    <strong className="text-amber-200 block text-xs font-bold">2. Food Portion</strong>
                    <span className="text-[10px] text-amber-400/90 font-medium">Calorie &amp; Starch Pacing</span>
                  </div>
                </div>
                <span className="text-sm font-black text-amber-300">{clampedPortion}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-amber-500/20">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${clampedPortion}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                <span>
                  {metrics
                    ? `${metrics.caloriesConsumed.toLocaleString()} of ${metrics.caloriesTarget.toLocaleString()} kcal`
                    : clampedPortion >= 100 ? "Portion on track!" : "Balanced meal pacing"}
                </span>
                {clampedPortion >= 100 && (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Closed
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-amber-500/10">
                African swallow (Amala, Pounded Yam, Eba) and rice portions should align with the single-fist rule. Balancing starch with protein keeps insulin levels flat and supports metabolic flexibility.
              </p>

              {onQuickLog && clampedPortion < 100 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    onQuickLog();
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold flex items-center justify-center gap-1.5 transition-all text-xs"
                >
                  <Zap size={13} /> Quick Log Meal
                </button>
              )}
            </div>

            {/* 3. Water Drank Breakdown */}
            <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Droplet size={16} />
                  </div>
                  <div>
                    <strong className="text-cyan-200 block text-xs font-bold">3. Water Drank</strong>
                    <span className="text-[10px] text-cyan-400/90 font-medium">Cellular Hydration</span>
                  </div>
                </div>
                <span className="text-sm font-black text-cyan-300">{clampedWater}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-cyan-500/20">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${clampedWater}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
                <span>
                  {metrics
                    ? `${metrics.waterGlasses} of ${metrics.waterGoal} cups (${metrics.waterGlasses * 250} ml)`
                    : `${clampedWater}% of daily goal`}
                </span>
                {clampedWater >= 100 && (
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Closed
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-cyan-500/10">
                Optimal hydration accelerates renal glucose clearance and supports fat oxidation during metabolic windows. Aim for 8 cups spread throughout your day.
              </p>

              {onAddWater && (
                <button
                  type="button"
                  onClick={handleModalAddWater}
                  className="w-full py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold flex items-center justify-center gap-1.5 transition-all text-xs active:scale-95"
                >
                  <Plus size={13} /> Drink +1 Cup Now (250 ml)
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
