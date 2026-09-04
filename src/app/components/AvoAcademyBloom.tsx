import React, { useState } from "react";
import { Sparkles, Trophy, CheckCircle2, ChevronRight, BookOpen, Flame, Award } from "lucide-react";
import Mascot from "./Mascot";
import { soundEffects } from "../utils/soundEffects";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export default function AvoAcademyBloom() {
  const [answered, setAnswered] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streakDays, setStreakDays] = useState(4);

  const handleAnswer = (index: number) => {
    setAnswered(index);
    if (index === 1) {
      // Correct answer: Viscous soluble soup slows glucose
      setIsCorrect(true);
      soundEffects.playCelebrationChime();
      triggerHaptic("milestone");
      triggerConfetti("confetti");
      setStreakDays((prev) => Math.min(prev + 1, 7));
    } else {
      setIsCorrect(false);
      triggerHaptic("heavy");
    }
  };

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-lg relative overflow-hidden">
      {/* Top Header: Ripening Meter */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-400/20 text-amber-700 dark:text-amber-300 rounded-xl">
            <Trophy size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Avo Academy Daily Bite 🥑
              </h3>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase">
                Day {streakDays}/7
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              60-Second Cultural Food Masterclass
            </p>
          </div>
        </div>

        <Mascot gesture="thumbsup" size={48} className="shrink-0" />
      </div>

      {/* 60-Second Story Bite */}
      <div className="p-3.5 bg-white/90 dark:bg-zinc-900/90 rounded-2xl border border-amber-200/60 dark:border-zinc-700/60 mb-3.5 shadow-xs">
        <div className="text-xs font-black text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
          <span className="text-amber-500">💡 Today's Fact:</span>
          <span>The "Soup First" Metabolic Shield</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Eating 3 spoonfuls of slimy soup (Ewedu, Okra, or Ogbono) <strong>before your first swallow bite</strong> forms a natural gel barrier in your digestive tract, blunting glucose absorption by up to 38%!
        </p>
      </div>

      {/* 1-Question Quick Quiz */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
          Quick Check: What is the best order to eat your swallow meal?
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            disabled={answered !== null}
            onClick={() => handleAnswer(0)}
            className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer ${
              answered === 0
                ? "bg-rose-100 dark:bg-rose-950 text-rose-800 border-rose-400"
                : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-zinc-700 hover:border-amber-400"
            }`}
          >
            A. Eat the swallow carb first, then soup
          </button>

          <button
            type="button"
            disabled={answered !== null}
            onClick={() => handleAnswer(1)}
            className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer ${
              answered === 1
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 border-emerald-400 font-bold"
                : "bg-white dark:bg-zinc-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-zinc-700 hover:border-amber-400"
            }`}
          >
            B. Eat 3 spoons of soup/veggies first ✨
          </button>
        </div>

        {answered !== null && (
          <div className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 size={15} />
            <span>
              {isCorrect
                ? "Spot on! 50 Points earned. Your Avocado is blooming into a Super-Avo!"
                : "Good try! Remember: Fiber and soup first creates the glucose barrier."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
