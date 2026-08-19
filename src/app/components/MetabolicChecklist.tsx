import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Trophy, Sparkles, Droplets, Flame, Activity, SunMedium } from "lucide-react";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export interface HabitItem {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof SunMedium;
  completed: boolean;
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

  const [hasCelebrated, setHasCelebrated] = useState(false);

  const habits: HabitItem[] = [
    {
      id: "morning_meal",
      title: "Log Morning Meal or Fast",
      subtitle: "Stabilizes dawn phenomenon glucose",
      icon: SunMedium,
      completed: mealsLoggedCount > 0 || Boolean(manualChecks["morning_meal"]),
    },
    {
      id: "hydration_goal",
      title: "Hydration Target (4+ Glasses)",
      subtitle: `${Math.min(waterCount, 4)}/4 glasses logged`,
      icon: Droplets,
      completed: waterCount >= 4 || Boolean(manualChecks["hydration_goal"]),
    },
    {
      id: "veggie_shield",
      title: "Eat 1 High-Fiber Veggie",
      subtitle: "Ugu, Ewedu, Okro, or Garden Egg",
      icon: Sparkles,
      completed: Boolean(manualChecks["veggie_shield"]),
    },
    {
      id: "vitals_check",
      title: "Record Blood Pressure / Glucose",
      subtitle: "Track metabolic consistency",
      icon: Activity,
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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-lg border border-teal-100 dark:border-zinc-800 my-4">
      {/* Header & Score Ring */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#1f7a8c] dark:text-teal-400 block mb-0.5">
            Daily Goal
          </span>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
            Metabolic Habit Scorecard
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {progressPercent === 100 ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-extrabold shadow-sm">
              <Trophy size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>100% Champion! 🏆</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              {completedCount}/{habits.length} Done ({progressPercent}%)
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-[#1f7a8c] via-[#4ecdc4] to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Habits Checklist Items */}
      <div className="space-y-2.5">
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
                  <CheckCircle2 size={20} className="text-teal-600 dark:text-teal-400 fill-teal-50 dark:fill-transparent" />
                ) : (
                  <Circle size={20} className="text-zinc-300 dark:text-zinc-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
