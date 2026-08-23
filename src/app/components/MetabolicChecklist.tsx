import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Trophy,
  Sparkles,
  Droplets,
  Flame,
  Activity,
  SunMedium,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Moon,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export interface HabitItem {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof SunMedium;
  completed: boolean;
  category: "all" | "morning" | "midday" | "evening";
}

interface MetabolicChecklistProps {
  waterCount?: number;
  mealsLoggedCount?: number;
  vitalsLoggedCount?: number;
  onOpenQuickLog?: () => void;
  onOpenWater?: () => void;
}

export default function MetabolicChecklist({
  waterCount = 0,
  mealsLoggedCount = 0,
  vitalsLoggedCount = 0,
  onOpenQuickLog,
  onOpenWater,
}: MetabolicChecklistProps) {
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const saved = localStorage.getItem(`metabolic_habits_${today}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState<-1 | 1>(-1); // -1 = Opposite direction (Left-to-Right)
  const [isPaused, setIsPaused] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const totalSlides = 4;

  // Slide left-to-right (opposite direction)
  const nextSlide = () => {
    setDirection(-1);
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setDirection(1);
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto-advance in opposite direction every 7s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, activeSlide]);

  const habits: HabitItem[] = [
    {
      id: "morning_meal",
      title: "Log Morning Meal or Fast",
      subtitle: "Stabilizes dawn phenomenon glucose",
      icon: SunMedium,
      category: "morning",
      completed: mealsLoggedCount > 0 || Boolean(manualChecks["morning_meal"]),
    },
    {
      id: "hydration_goal",
      title: "Hydration Target (4+ Glasses)",
      subtitle: `${Math.min(waterCount, 4)}/4 glasses logged`,
      icon: Droplets,
      category: "morning",
      completed: waterCount >= 4 || Boolean(manualChecks["hydration_goal"]),
    },
    {
      id: "veggie_shield",
      title: "Eat 1 High-Fiber Veggie",
      subtitle: "Ugu, Ewedu, Okro, or Garden Egg",
      icon: Sparkles,
      category: "midday",
      completed: Boolean(manualChecks["veggie_shield"]),
    },
    {
      id: "vitals_check",
      title: "Record Blood Pressure / Glucose",
      subtitle: "Track metabolic consistency",
      icon: Activity,
      category: "evening",
      completed: vitalsLoggedCount > 0 || Boolean(manualChecks["vitals_check"]),
    },
  ];

  const completedCount = habits.filter((h) => h.completed).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  const toggleManualHabit = (id: string) => {
    triggerHaptic("light");
    const next = { ...manualChecks, [id]: !manualChecks[id] };
    setManualChecks(next);
    try {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(`metabolic_habits_${today}`, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    if (progressPercent === 100 && !hasCelebrated) {
      setHasCelebrated(true);
      triggerHaptic("milestone");
      triggerConfetti("fireworks");
    }
  }, [progressPercent, hasCelebrated]);

  // Left-to-Right Slide Animation Variants (Opposite Direction)
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir < 0 ? -120 : 120, // Opposite direction entry
      opacity: 0,
      scale: 0.97,
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
      x: dir < 0 ? 120 : -120, // Opposite direction exit
      opacity: 0,
      scale: 0.97,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 28 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-lg border border-teal-100 dark:border-zinc-800 my-4 overflow-hidden relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Top Header & Slider Controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#1f7a8c] dark:text-teal-400 block mb-0.5">
            Daily Goal
          </span>
          <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-tight">
            Metabolic Habit Scorecard
          </h3>
        </div>

        {/* Navigation Controls + Completion Pill */}
        <div className="flex items-center gap-2">
          {progressPercent === 100 ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-black shadow-xs">
              <Trophy size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>100% Champion! 🏆</span>
            </span>
          ) : (
            <span className="text-xs font-black text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              {completedCount}/{habits.length} Done ({progressPercent}%)
            </span>
          )}

          {/* Opposite Direction Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-transform active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-transform active:scale-95 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#1f7a8c] via-[#4ecdc4] to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ============================================================ */}
      {/* SLIDE SHOW CONTAINER (Left-to-Right Animated Slides)         */}
      {/* ============================================================ */}
      <div className="relative min-h-[250px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {/* ============================================================ */}
          {/* SLIDE 1: FULL HABIT CHECKLIST (Matches Image 1)              */}
          {/* ============================================================ */}
          {activeSlide === 0 && (
            <motion.div
              key="slide-all-habits"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full space-y-2.5"
            >
              {habits.map((habit) => {
                const Icon = habit.icon;
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleManualHabit(habit.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      habit.completed
                        ? "bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/60"
                        : "bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl flex-shrink-0 ${
                          habit.completed
                            ? "bg-teal-100 text-[#1f7a8c] dark:bg-teal-900/60 dark:text-teal-300"
                            : "bg-zinc-200/80 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold truncate ${
                            habit.completed
                              ? "text-zinc-900 dark:text-zinc-100 line-through opacity-80"
                              : "text-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          {habit.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {habit.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {habit.completed ? (
                        <CheckCircle2
                          size={20}
                          className="text-teal-600 dark:text-teal-400 fill-teal-50 dark:fill-transparent"
                        />
                      ) : (
                        <Circle size={20} className="text-zinc-300 dark:text-zinc-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SLIDE 2: 🌅 MORNING PROTOCOL FOCUS                          */}
          {/* ============================================================ */}
          {activeSlide === 1 && (
            <motion.div
              key="slide-morning"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full space-y-3"
            >
              <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 text-amber-700 rounded-xl">
                    <SunMedium size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-200">
                      Morning Dawn Phenomenon Shield
                    </h4>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400">
                      Cortisol liver sugar surge mitigation
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
                  AM Phase
                </span>
              </div>

              {/* Morning Habits Sub-List */}
              {habits
                .filter((h) => h.category === "morning")
                .map((habit) => {
                  const Icon = habit.icon;
                  return (
                    <div
                      key={habit.id}
                      onClick={() => toggleManualHabit(habit.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        habit.completed
                          ? "bg-teal-50/50 border-teal-200"
                          : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{habit.title}</div>
                          <div className="text-[10px] text-zinc-500">{habit.subtitle}</div>
                        </div>
                      </div>
                      {habit.completed ? (
                        <CheckCircle2 size={18} className="text-teal-600" />
                      ) : (
                        <Circle size={18} className="text-zinc-300" />
                      )}
                    </div>
                  );
                })}

              <div className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl flex items-center justify-between">
                <span>💡 Tip: 500ml water upon waking drops morning glucose spikes by 18%.</span>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SLIDE 3: 🌾 MIDDAY GLYCEMIC & FIBER SHIELD                   */}
          {/* ============================================================ */}
          {activeSlide === 2 && (
            <motion.div
              key="slide-midday"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full space-y-3"
            >
              <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 rounded-xl">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                      Midday African Fiber Shield
                    </h4>
                    <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                      Swallow gastric emptying delay buffer
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900">
                  Midday Phase
                </span>
              </div>

              {/* High-Fiber Veggie Habit Card */}
              {habits
                .filter((h) => h.category === "midday")
                .map((habit) => {
                  const Icon = habit.icon;
                  return (
                    <div
                      key={habit.id}
                      onClick={() => toggleManualHabit(habit.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        habit.completed
                          ? "bg-teal-50/50 border-teal-200"
                          : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{habit.title}</div>
                          <div className="text-[10px] text-zinc-500">{habit.subtitle}</div>
                        </div>
                      </div>
                      {habit.completed ? (
                        <CheckCircle2 size={18} className="text-teal-600" />
                      ) : (
                        <Circle size={18} className="text-zinc-300" />
                      )}
                    </div>
                  );
                })}

              <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                    Post-Meal 15-Min Walk
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    Activates non-insulin GLUT4 muscle glucose sink
                  </span>
                </div>
                <button
                  onClick={onOpenQuickLog}
                  className="px-2.5 py-1 bg-[#1f7a8c] hover:bg-teal-800 text-white text-[10px] font-bold rounded-xl cursor-pointer"
                >
                  Plan Meal
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* SLIDE 4: 🌙 EVENING & OVERNIGHT FASTING RESET               */}
          {/* ============================================================ */}
          {activeSlide === 3 && (
            <motion.div
              key="slide-evening"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full space-y-3"
            >
              <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 rounded-xl">
                    <Moon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
                      Evening Deceleration & Fasting
                    </h4>
                    <p className="text-[10px] text-indigo-700/80 dark:text-indigo-400">
                      Melatonin-mediated glucose reset
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-900">
                  PM Phase
                </span>
              </div>

              {/* Vitals Habit Card */}
              {habits
                .filter((h) => h.category === "evening")
                .map((habit) => {
                  const Icon = habit.icon;
                  return (
                    <div
                      key={habit.id}
                      onClick={() => toggleManualHabit(habit.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        habit.completed
                          ? "bg-teal-50/50 border-teal-200"
                          : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-900">{habit.title}</div>
                          <div className="text-[10px] text-zinc-500">{habit.subtitle}</div>
                        </div>
                      </div>
                      {habit.completed ? (
                        <CheckCircle2 size={18} className="text-teal-600" />
                      ) : (
                        <Circle size={18} className="text-zinc-300" />
                      )}
                    </div>
                  );
                })}

              <div className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl flex items-center justify-between">
                <span>🌙 12-Hour Overnight Fasting resets insulin receptors for tomorrow.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Pagination Dots (Opposite direction navigation) */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {[0, 1, 2, 3].map((idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx < activeSlide ? -1 : 1);
              setActiveSlide(idx);
            }}
            aria-label={`Go to habit slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeSlide === idx
                ? "w-6 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4]"
                : "w-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
