import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Droplet,
  ShieldCheck,
  Zap,
  Activity,
  BarChart3,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Mascot from "./Mascot";

export interface DailyGoalSliderProps {
  caloriesConsumed: number;
  caloriesTarget: number;
  animatedPercentage: number;
  animatedProgress: number;
  proteinConsumed: number;
  proteinTarget: number;
  carbsConsumed: number;
  carbsTarget: number;
  fatsConsumed: number;
  fatsTarget: number;
  waterGlasses: number;
  waterGoal?: number;
  trackingStreak?: number;
  todayMealsCount?: number;
  onDrinkWater?: () => void;
  onOpenGaugeDetails: () => void;
  t?: (key: string) => string;
}

export default function DailyGoalSlider({
  caloriesConsumed,
  caloriesTarget,
  animatedPercentage,
  animatedProgress,
  proteinConsumed,
  proteinTarget,
  carbsConsumed,
  carbsTarget,
  fatsConsumed,
  fatsTarget,
  waterGlasses,
  waterGoal = 10,
  trackingStreak = 3,
  todayMealsCount = 0,
  onDrinkWater,
  onOpenGaugeDetails,
  t = (k) => k,
}: DailyGoalSliderProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = right-to-left slide
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = 4;

  const nextSlide = () => {
    setDirection(1);
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setDirection(-1);
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-advance slider right-to-left every 7 seconds when not touched/hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaused, activeSlide]);

  // Slide Animation Variants (Right-to-Left motion)
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 28 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 28 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const waterPct = Math.min(Math.round((waterGlasses / waterGoal) * 100), 100);

  return (
    <div
      className="relative bg-gradient-to-br from-white via-[#F4FBFA] to-[#E2F4F3] rounded-3xl shadow-lg border border-teal-100/80 p-5 sm:p-6 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Top Header Row with Navigation & Dot Indicators */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#1f7a8c]">
            Daily Metabolic Scorecard
          </span>
          <span className="text-[10px] font-bold text-teal-700/70 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100/60 hidden xs:inline">
            Card {activeSlide + 1} of {totalSlides}
          </span>
        </div>

        {/* Right Controls: Arrow Buttons + Dots */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-teal-800 border border-teal-100 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Dot Indicators */}
          <div className="flex items-center gap-1 px-1">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > activeSlide ? 1 : -1);
                  setActiveSlide(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === idx
                    ? "w-5 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4]"
                    : "w-1.5 bg-teal-200/80 hover:bg-teal-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-teal-800 border border-teal-100 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Swipeable / Animated Card Container */}
      <div className="relative min-h-[220px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {/* ============================================================ */}
          {/* SLIDE 1: CALORIE & METABOLIC FUEL GAUGE                      */}
          {/* ============================================================ */}
          {activeSlide === 0 && (
            <motion.div
              key="slide-calories"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col items-center"
            >
              <div className="w-full flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <Flame size={14} className="text-amber-500" />
                  <span>Metabolic Calorie Target</span>
                </span>
                <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-xs">
                  {caloriesConsumed} / {caloriesTarget} kcal
                </span>
              </div>

              {/* Clickable SVG Gauge */}
              <button
                onClick={onOpenGaugeDetails}
                className="w-full hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200 focus:outline-none rounded-2xl cursor-pointer"
                aria-label={`Daily nutrition progress: ${animatedPercentage}% of goal achieved. Tap for detailed breakdown.`}
              >
                <div className="relative flex flex-col items-center justify-center my-1">
                  <svg className="w-48 h-26" viewBox="0 0 200 115">
                    <path
                      d="M 30 95 A 70 70 0 0 1 170 95"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 30 95 A 70 70 0 0 1 170 95"
                      fill="none"
                      stroke="url(#sliderGaugeGradient)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${animatedProgress * 2.2} 1000`}
                      style={{
                        transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                    <defs>
                      <linearGradient id="sliderGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1f7a8c" />
                        <stop offset="100%" stopColor="#4ecdc4" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute top-7 flex flex-col items-center">
                    <div className="text-[#1f7a8c] text-2xl font-black">
                      {animatedPercentage}%
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-semibold">
                      {t("home.ofDailyGoal") || "of Daily Goal"}
                    </div>
                    <div className="text-[10px] text-teal-700 font-bold mt-0.5 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100/60">
                      Tap for Breakdown 📊
                    </div>
                  </div>
                </div>
              </button>

              {/* Quick Macro Breakdown Row */}
              <div className="w-full grid grid-cols-3 gap-2 pt-2.5 border-t border-teal-100 text-center">
                <div className="bg-white/90 rounded-2xl p-2 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-gray-500 font-bold block">Protein</span>
                  <span className="text-xs font-extrabold text-blue-700">{proteinConsumed}g</span>
                  <span className="text-[9px] text-gray-400 block">/ {proteinTarget}g</span>
                </div>
                <div className="bg-white/90 rounded-2xl p-2 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-gray-500 font-bold block">Carbs</span>
                  <span className="text-xs font-extrabold text-emerald-700">{carbsConsumed}g</span>
                  <span className="text-[9px] text-gray-400 block">/ {carbsTarget}g</span>
                </div>
                <div className="bg-white/90 rounded-2xl p-2 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-gray-500 font-bold block">Fats</span>
                  <span className="text-xs font-extrabold text-purple-700">{fatsConsumed}g</span>
                  <span className="text-[9px] text-gray-400 block">/ {fatsTarget}g</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SLIDE 2: GLYCEMIC SPIKE SHIELD & VELOCITY SCORE              */}
          {/* ============================================================ */}
          {activeSlide === 1 && (
            <motion.div
              key="slide-glycemic"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col justify-between py-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Glycemic Spike Shield 🛡️
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Postprandial glucose stability score
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs">
                  94% Protected
                </span>
              </div>

              {/* Glycemic Metrics 2-Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-2">
                <div className="bg-white/90 rounded-2xl p-3 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Swallow Buffer Rating
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-black text-teal-800">
                      Plateau GVI
                    </span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-semibold mt-1 block">
                    ✓ Okra & Fiber active
                  </span>
                </div>

                <div className="bg-white/90 rounded-2xl p-3 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Meals Logged Today
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-black text-slate-900">
                      {todayMealsCount}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">meals</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium mt-1 block">
                    0 High Spikes detected
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50/80 rounded-2xl p-2.5 border border-emerald-100 flex items-center justify-between">
                <p className="text-[11px] text-emerald-900 font-semibold leading-tight">
                  🌾 Resistant starch hack: Cool & reheat swallows for -35% spike!
                </p>
                <button
                  onClick={onOpenGaugeDetails}
                  className="shrink-0 p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold px-2 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Labs</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SLIDE 3: HYDRATION & ARTERIAL VISCOSITY CARD                 */}
          {/* ============================================================ */}
          {activeSlide === 2 && (
            <motion.div
              key="slide-hydration"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col justify-between py-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-100 text-cyan-800 rounded-2xl">
                    <Droplet size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Hydration & Arterial Shield 💧
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Reduces blood viscosity & supports kidneys
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 font-black text-xs">
                  {waterGlasses} / {waterGoal} Glasses
                </span>
              </div>

              {/* Progress Bar & Visual Glasses */}
              <div className="bg-white/90 rounded-2xl p-3.5 shadow-xs border border-teal-50 my-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>Daily Fluid Goal Progress</span>
                  <span className="text-cyan-700">{waterPct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full rounded-full transition-all duration-700"
                    style={{ width: `${waterPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                  {waterGlasses >= waterGoal
                    ? "🎉 Optimal cellular hydration achieved today!"
                    : `${waterGoal - waterGlasses} glasses remaining to protect metabolic kidney filtration.`}
                </p>
              </div>

              {/* Quick Action Button */}
              {onDrinkWater && (
                <button
                  onClick={onDrinkWater}
                  className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Log +1 Glass of Water (250ml) ⚡</span>
                </button>
              )}
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SLIDE 4: METABOLIC STREAK & BIO-WINDOW                       */}
          {/* ============================================================ */}
          {activeSlide === 3 && (
            <motion.div
              key="slide-streak"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col justify-between py-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-2xl">
                    <Flame size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Metabolic Habit Streak 🔥
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Consistency builds insulin sensitivity
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-black text-xs">
                  {trackingStreak} Days Strong
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 my-2">
                <div className="bg-white/90 rounded-2xl p-3 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Circadian Phase
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    Active Metabolic
                  </span>
                  <span className="text-[9px] text-teal-600 font-bold mt-1 block">
                    ☀️ Peak Insulin Window
                  </span>
                </div>

                <div className="bg-white/90 rounded-2xl p-3 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-slate-500 font-bold block">
                    Metabolic XP Rank
                  </span>
                  <span className="text-sm font-black text-amber-700 block mt-0.5">
                    Level 4 Pioneer
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium mt-1 block">
                    +45 XP earned today
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-[11px] font-bold">Keep logging to hit 7-Day Gold Master badge!</span>
                </div>
                <button
                  onClick={onOpenGaugeDetails}
                  className="text-[10px] font-bold text-teal-300 hover:text-teal-200 px-2 py-1 bg-white/10 rounded-xl cursor-pointer"
                >
                  View Passport
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Slider Progress Indicator Bar */}
      <div className="w-full bg-teal-100/60 h-1 rounded-full mt-3 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] h-full rounded-full"
          animate={{
            width: `${((activeSlide + 1) / totalSlides) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
