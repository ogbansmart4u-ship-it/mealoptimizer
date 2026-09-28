import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  Volume2, 
  VolumeX, 
  Compass, 
  RotateCcw,
  Play
} from "lucide-react";
import Mascot from "./Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { speakWithSarah, stopSarahSpeech } from "../services/voiceService";

export interface TourStep {
  targetId: string;
  title: string;
  subtitle: string;
  description: string;
  narrationEn: string;
  narrationPcm: string;
  mascotGesture: "wave" | "thumbsup" | "dancing" | "neutral" | "drink";
  position?: "top" | "bottom";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-ask-sarah",
    title: "Meet Sarah, Your AI Food Companion 👩🏾‍💼",
    subtitle: "Clinical Nutrition at Your Fingertips",
    description: "Got questions about portion sizes, blood sugar spikes, or healthy swallow swaps? Tap Ask Sarah anytime to chat or speak in English or Nigerian Pidgin!",
    narrationEn: "Welcome to MealOptimiza! I am Sarah, your personal food companion. Tap 'Ask Sarah' anytime to ask questions about your meals, blood sugar, or healthy African food swaps!",
    narrationPcm: "Welcome to MealOptimiza o! My name na Sarah, your personal food doctor. Tap 'Ask Sarah' anytime to ask question about your food, blood sugar, or how to swap swallow!",
    mascotGesture: "wave",
    position: "bottom",
  },
  {
    targetId: "tour-quick-shelf",
    title: "1-Tap Cultural Meal Logging 🍲",
    subtitle: "Zero Tedious Calorie Counting",
    description: "No tedious typing! Tap any West African staple like Akamu, Moi Moi, Jollof, or Efo Riro to instantly record calories and balanced macros in one tap.",
    narrationEn: "Logging your meals is super simple! Just tap any of our West African staples like Akamu, Moi Moi, or Jollof to log your plate in one single tap.",
    narrationPcm: "To record your meal dey very easy! Just tap any of our sweet Nigerian food like Akamu, Moi Moi, or Jollof to record your plate with one tap!",
    mascotGesture: "thumbsup",
    position: "top",
  },
  {
    targetId: "tour-plate-target",
    title: "The 50% Divided Plate Rule 🥗",
    subtitle: "The Secret to Flat Blood Sugar",
    description: "Our golden rule for vitality: fill 50% of your plate with vegetables & drawing soups, 25% clean protein, and 25% swallow or carbs to prevent sugar spikes.",
    narrationEn: "Here is our golden rule for steady energy: fill fifty percent of your plate with vegetables and soups, twenty-five percent protein, and twenty-five percent swallow!",
    narrationPcm: "See our golden secret for good health: fill half of your plate with fresh vegetables and draw soup, quarter with protein, and quarter with swallow!",
    mascotGesture: "thumbsup",
    position: "bottom",
  },
  {
    targetId: "tour-water-tracker",
    title: "Hydration & Pressure Shield 💧",
    subtitle: "Protect Your Kidneys & Blood Pressure",
    description: "Tap +1 Water with each cup you drink. Staying hydrated naturally flushes excess sodium, supports kidney filtration, and keeps your blood pressure relaxed.",
    narrationEn: "Drink your water every day! Proper hydration flushes extra salt, protects your kidneys, and keeps your blood pressure calm and relaxed.",
    narrationPcm: "Drink clean water every day! When you drink enough water, e dey wash away excess salt, protect your kidneys, and keep your blood pressure calm!",
    mascotGesture: "drink",
    position: "top",
  },
  {
    targetId: "tour-fab-actions",
    title: "AI Camera, Voice & WhatsApp Logging 📸",
    subtitle: "Log Food Anytime, Anywhere",
    description: "Tap the floating (+) button to snap food photos with AI Camera, speak what you ate with your voice, or message our WhatsApp assistant on the go!",
    narrationEn: "Whenever you are on the go, tap the floating plus button to snap a photo of your food, speak your meal, or log directly via WhatsApp!",
    narrationPcm: "Anytime you dey outside, tap this plus button to snap your plate with camera, talk am with your voice, or log am straight on WhatsApp!",
    mascotGesture: "dancing",
    position: "top",
  },
  {
    targetId: "tour-food-wisdom",
    title: "Daily African Food Wisdom 🥑",
    subtitle: "60-Second Lessons & Voice Quizzes",
    description: "Master the clinical secrets of African food in quick 60-second lessons and fun quizzes with Sarah. Earn badges and level up your vitality every day!",
    narrationEn: "Master the secrets of our heritage food in quick sixty-second audio lessons and fun quizzes with me. You are ready to start your journey!",
    narrationPcm: "Learn all the sweet secrets of African food with my sixty-second audio lessons and fun quizzes. You don ready to enjoy long life!",
    mascotGesture: "dancing",
    position: "bottom",
  },
];

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotlightTour({ isOpen, onClose }: SpotlightTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isPidgin, setIsPidgin] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sarah_language") === "pcm";
    }
    return false;
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const step = TOUR_STEPS[currentStep];

  // Update target rect with scroll handling
  useEffect(() => {
    if (!isOpen) {
      stopSarahSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const updatePosition = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const bounds = el.getBoundingClientRect();
        // If element is offscreen, scroll it gently into center
        if (bounds.top < 80 || bounds.bottom > window.innerHeight - 80) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => {
            setRect(el.getBoundingClientRect());
          }, 350);
        } else {
          setRect(bounds);
        }
      } else {
        setRect(null);
      }
    };

    updatePosition();
    const timer = setTimeout(updatePosition, 300);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, currentStep, step.targetId]);

  // Voice narration triggers on step change
  useEffect(() => {
    if (!isOpen) return;

    if (voiceEnabled) {
      stopSarahSpeech();
      const textToSpeak = isPidgin ? step.narrationPcm : step.narrationEn;
      setIsPlayingAudio(true);
      speakWithSarah(textToSpeak, { lang: isPidgin ? "pcm" : "en" })
        .then(() => setIsPlayingAudio(false))
        .catch(() => setIsPlayingAudio(false));
    } else {
      stopSarahSpeech();
      setIsPlayingAudio(false);
    }

    return () => {
      stopSarahSpeech();
    };
  }, [isOpen, currentStep, voiceEnabled, isPidgin]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handleBack();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    triggerHaptic("light");
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      triggerHaptic("success");
      triggerConfetti("cannons");
      localStorage.setItem("hasSeenSpotlightTour", "true");
      stopSarahSpeech();
      onClose();
    }
  };

  const handleBack = () => {
    triggerHaptic("light");
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    triggerHaptic("light");
    localStorage.setItem("hasSeenSpotlightTour", "true");
    stopSarahSpeech();
    onClose();
  };

  const toggleVoice = () => {
    triggerHaptic("light");
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    if (!nextState) {
      stopSarahSpeech();
      setIsPlayingAudio(false);
    }
  };

  const toggleLanguage = () => {
    triggerHaptic("light");
    const nextPidgin = !isPidgin;
    setIsPidgin(nextPidgin);
    localStorage.setItem("sarah_language", nextPidgin ? "pcm" : "en");
  };

  // Determine whether dialog should be placed at top or bottom
  // If target element is in the lower half of screen, place dialog at top
  const isTargetInLowerHalf = rect
    ? rect.bottom > (typeof window !== "undefined" ? window.innerHeight - 320 : 400)
    : false;
  const isTop = isTargetInLowerHalf || step.position === "top";

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden pointer-events-auto">
      {/* Dark overlay backdrop covering full viewport */}
      <div
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-[3px] transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Spotlight cutout highlight if target exists */}
      {rect && (
        <div
          className="absolute border-2 border-emerald-400 dark:border-teal-400 rounded-3xl transition-all duration-300 shadow-[0_0_0_9999px_rgba(10,15,13,0.72)] pointer-events-none ring-4 ring-emerald-400/30 animate-pulse"
          style={{
            top: Math.max(8, rect.top - 8),
            left: Math.max(8, rect.left - 8),
            width: Math.min(window.innerWidth - 16, rect.width + 16),
            height: rect.height + 16,
          }}
        />
      )}

      {/* Tour Step Dialog Box - positioned safely above BottomNav or at top */}
      <div
        className={`fixed inset-x-3.5 max-w-md mx-auto z-[125] transition-all duration-300 ${
          isTop
            ? "top-[calc(1rem+env(safe-area-inset-top))] sm:top-8"
            : "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-20"
        }`}
      >
        <div className="bg-white dark:bg-[#151D19] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle decorative background gradient */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-emerald-500/10 to-teal-500/0 rounded-full blur-2xl pointer-events-none" />

          {/* Header Bar: Step info, Voice toggle, Language switcher, Close */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#164E3D] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
              <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                30s Tour
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-700"
                title="Switch voice language"
              >
                {isPidgin ? "🇳🇬 Pidgin" : "🇬🇧 English"}
              </button>

              {/* Voice Guide Toggle */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  voiceEnabled
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-400 hover:text-stone-600"
                }`}
                title={voiceEnabled ? "Voice Guide is ON (Tap to mute)" : "Voice Guide is OFF (Tap to speak)"}
              >
                {voiceEnabled ? (
                  <Volume2 size={13} className={isPlayingAudio ? "animate-pulse" : ""} />
                ) : (
                  <VolumeX size={13} />
                )}
              </button>

              {/* Skip / Close */}
              <button
                type="button"
                onClick={handleSkip}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
                title="Exit Tour"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="flex items-start gap-3.5 mb-3.5">
            <div className="shrink-0 p-1 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 shadow-xs">
              <Mascot gesture={step.mascotGesture} size={54} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                {step.title}
              </h3>
              <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 mt-0.5">
                {step.subtitle}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Audio Visualizer Pill if Sarah is speaking */}
          {voiceEnabled && isPlayingAudio && (
            <div className="flex items-center gap-2 px-3 py-1.5 mb-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-[#164E3D] dark:text-emerald-300">
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-4 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-2 bg-emerald-600 rounded-full animate-bounce" />
              </div>
              <span className="text-[11px] font-semibold truncate">
                Sarah is speaking...
              </span>
            </div>
          )}

          {/* Footer: Progress Dots, Back, Next / Finish */}
          <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 dark:border-stone-800">
            {/* Step navigation dots */}
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setCurrentStep(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentStep
                      ? "w-6 bg-[#164E3D] dark:bg-emerald-500"
                      : "w-1.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-400"
                  }`}
                  title={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Back & Next Controls */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer transition-colors"
                  title="Previous Step"
                >
                  <ArrowLeft size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="bg-[#164E3D] hover:bg-[#113E30] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-95 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>
                    <span>Finish Tour!</span>
                    <Check size={14} />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
