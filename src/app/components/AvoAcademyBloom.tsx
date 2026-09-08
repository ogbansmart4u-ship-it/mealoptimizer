import React, { useState } from "react";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Zap,
  Flame,
  Lightbulb,
  Award,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import Mascot from "./Mascot";
import { soundEffects } from "../utils/soundEffects";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

interface StorySlide {
  title: string;
  badge: string;
  emoji: string;
  summary: string;
  bullet: string;
}

const DAILY_STORIES: StorySlide[] = [
  {
    title: "The 'Swallow Coma' Mystery",
    badge: "Metabolic Insight",
    emoji: "😴",
    summary: "Why do massive swallow meals cause that heavy 2 PM afternoon food coma?",
    bullet: "Rapid starch breakdown causes an insulin surge, pulling glucose out of your blood too quickly.",
  },
  {
    title: "The Slimy Soup Shield",
    badge: "African Superfood Hack",
    emoji: "🥣",
    summary: "Soluble mucilage in Ewedu, Okra, and Ogbono is nature's glucose barrier.",
    bullet: "Its viscous gel matrix delays gastric emptying, flattening blood sugar curves by up to 38%!",
  },
  {
    title: "The 3-Spoon Golden Rule",
    badge: "Daily Vitality Action",
    emoji: "⚡",
    summary: "Order matters just as much as what you eat on your plate!",
    bullet: "Always eat 3 spoonfuls of soup or veggies BEFORE taking your first swallow bite.",
  },
];

export default function AvoAcademyBloom() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streakDays, setStreakDays] = useState(4);
  const [xpEarned, setXpEarned] = useState(false);

  const handleOpenCapsule = () => {
    try {
      soundEffects.playBubblePop();
    } catch {}
    try {
      triggerHaptic("medium");
    } catch {}
    try {
      triggerConfetti("confetti");
    } catch {}
    setIsOpen(true);
  };

  const handleNextSlide = () => {
    try {
      soundEffects.playTactileTick();
    } catch {}
    try {
      triggerHaptic("light");
    } catch {}
    setCurrentSlide((prev) => Math.min(prev + 1, DAILY_STORIES.length));
  };

  const handlePrevSlide = () => {
    try {
      soundEffects.playTactileTick();
    } catch {}
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleAnswer = (index: number) => {
    setAnswered(index);
    if (index === 1) {
      setIsCorrect(true);
      setXpEarned(true);
      try {
        soundEffects.playCelebrationChime();
      } catch {}
      try {
        triggerHaptic("milestone");
      } catch {}
      try {
        triggerConfetti("stars");
      } catch {}
      setStreakDays((prev) => Math.min(prev + 1, 7));
    } else {
      setIsCorrect(false);
      try {
        triggerHaptic("heavy");
      } catch {}
    }
  };

  const handleReset = () => {
    setIsOpen(false);
    setCurrentSlide(0);
  };

  return (
    <div className="relative">
      {/* ------------------------------------------------------------- */}
      {/* STATE A: SLEEK CLOSED CAPSULE (Zero Screen Clutter)           */}
      {/* ------------------------------------------------------------- */}
      {!isOpen ? (
        <div
          onClick={handleOpenCapsule}
          className="group relative rounded-3xl p-4 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-teal-950/40 border-2 border-amber-400/50 dark:border-amber-500/40 shadow-md hover:shadow-xl transition-all cursor-pointer select-none active:scale-98 overflow-hidden"
        >
          {/* Subtle Ambient Pulse Background */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 rounded-2xl shadow-sm animate-bounce">
                <Sparkles size={20} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Today's 60s Food Secret 🥑
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                    Day {streakDays}/7 🔥
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5 flex items-center gap-1">
                  <span>Today's Food Secret:</span>
                  <strong className="text-amber-700 dark:text-amber-300 font-bold">The Soup Shield</strong>
                </p>
              </div>
            </div>

            {/* Tap to Burst Call-to-Action Pill */}
            <div className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-2xl shadow-sm group-hover:scale-105 transition-all shrink-0">
              <span>Tap to Reveal 💡</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* STATE B: EXPLODED STORY VIEWER (Snackable, High Energy)       */
        /* ------------------------------------------------------------- */
        <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950 text-white border-2 border-amber-400 shadow-2xl relative overflow-hidden animate-fade-in">
          {/* Top Progress Bars (Instagram Stories Style) */}
          <div className="flex items-center gap-1.5 mb-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/20"
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    idx === currentSlide
                      ? "bg-amber-400 w-full"
                      : idx < currentSlide
                      ? "bg-emerald-400 w-full"
                      : "w-0"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Header Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {currentSlide < 3 ? DAILY_STORIES[currentSlide].badge : "Quick Check"}
              </span>
              <span className="text-xs text-white/60 font-bold">
                {currentSlide + 1} of 4
              </span>
            </div>

            <button
              onClick={handleReset}
              className="p-1.5 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              title="Close story"
            >
              <X size={15} />
            </button>
          </div>

          {/* Slide Content (Slides 0-2: Micro-Stories) */}
          {currentSlide < 3 ? (
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-3">
                <span className="text-4xl filter drop-shadow-md">
                  {DAILY_STORIES[currentSlide].emoji}
                </span>
                <div>
                  <h4 className="text-base font-black text-amber-300 leading-tight">
                    {DAILY_STORIES[currentSlide].title}
                  </h4>
                  <p className="text-xs text-white/80 mt-0.5 leading-snug">
                    {DAILY_STORIES[currentSlide].summary}
                  </p>
                </div>
              </div>

              {/* Highlight Hero Card */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white leading-relaxed font-medium">
                👉 <strong>Key Takeaway:</strong> {DAILY_STORIES[currentSlide].bullet}
              </div>

              {/* Story Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleNextSlide}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs transition-all hover:brightness-110 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <span>{currentSlide === 2 ? "Take 1-Tap Quiz ⚡" : "Next Bite"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* Slide 3: 1-Tap Quick Quiz */
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-2">
                <Mascot gesture="wave" size={36} className="shrink-0" />
                <h4 className="text-xs sm:text-sm font-black text-amber-300">
                  Quick Check: What is the golden order for swallow meals?
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  disabled={answered !== null}
                  onClick={() => handleAnswer(0)}
                  className={`p-3 rounded-2xl text-left text-xs font-bold transition-all border cursor-pointer ${
                    answered === 0
                      ? "bg-rose-500/20 text-rose-300 border-rose-500"
                      : "bg-white/10 text-white/90 border-white/15 hover:bg-white/20"
                  }`}
                >
                  A. Eat all your swallow fufu first, then finish with soup
                </button>

                <button
                  type="button"
                  disabled={answered !== null}
                  onClick={() => handleAnswer(1)}
                  className={`p-3 rounded-2xl text-left text-xs font-bold transition-all border cursor-pointer ${
                    answered === 1
                      ? "bg-emerald-500/30 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/50"
                      : "bg-white/10 text-white/90 border-white/15 hover:bg-white/20"
                  }`}
                >
                  B. Eat 3 spoons of soup/veggies first as a fiber buffer ✨
                </button>
              </div>

              {answered !== null && (
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-xs font-bold text-emerald-300 flex items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    <span>{isCorrect ? "Spot on! +50 XP Earned 🎉" : "Soup/fiber first is the secret!"}</span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[11px] rounded-xl hover:bg-amber-300 cursor-pointer shrink-0"
                  >
                    Done & Close 🥑
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
