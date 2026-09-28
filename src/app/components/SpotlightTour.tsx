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
  descriptionPcm: string;
  narrationEn: string;
  narrationPcm: string;
  mascotGesture: "wave" | "thumbsup" | "dancing" | "neutral" | "drink";
  position?: "top" | "bottom";
}

export type TourVoiceLanguage = "en-ng" | "en-gb" | "pcm";

interface VoiceLangOption {
  id: TourVoiceLanguage;
  badge: string;
  name: string;
  subtitle: string;
}

export const TOUR_VOICE_LANGUAGES: VoiceLangOption[] = [
  { id: "en-ng", badge: "🇳🇬 English (NG)", name: "Nigerian English", subtitle: "Dr. Ngozi (Nigerian English 🇳🇬)" },
  { id: "en-gb", badge: "🇬🇧 English (GB)", name: "British English", subtitle: "Dr. Sarah (British English 🇬🇧)" },
  { id: "pcm", badge: "🇳🇬 Pidgin", name: "Nigerian Pidgin", subtitle: "Mama Bola (Nigerian Pidgin 🇳🇬)" },
];

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-ask-sarah",
    title: "Meet Sarah, Your AI Food Companion 👩🏾‍💼",
    subtitle: "Clinical Nutrition at Your Fingertips",
    description: "Got questions about portion sizes, blood sugar spikes, or healthy swallow swaps? Tap Ask Sarah anytime to chat or speak with me in English or Nigerian Pidgin!",
    descriptionPcm: "You get question about your portion size, blood sugar, or healthy swallow swap? Tap Ask Sarah anytime to talk with me for English or Nigerian Pidgin!",
    narrationEn: "Meet Sarah, Your AI Food Companion. Got questions about portion sizes, blood sugar spikes, or healthy swallow swaps? Tap Ask Sarah anytime to chat or speak with me in English or Nigerian Pidgin!",
    narrationPcm: "Meet Sarah, your personal food doctor! You get question about your portion size, blood sugar, or healthy swallow swap? Tap Ask Sarah anytime to talk with me for English or Nigerian Pidgin!",
    mascotGesture: "wave",
    position: "bottom",
  },
  {
    targetId: "tour-quick-shelf",
    title: "1-Tap Cultural Meal Logging 🍲",
    subtitle: "Zero Tedious Calorie Counting",
    description: "No tedious typing! Tap any West African staple like Akamu, Moi Moi, Jollof, or Efo Riro to instantly record calories and balanced macros in one single tap.",
    descriptionPcm: "One-tap food recording! No need to type anything! Just tap any of our sweet Nigerian food like Akamu, Moi Moi, Jollof, or Efo Riro to record your plate with one tap!",
    narrationEn: "One-tap cultural meal logging. No tedious typing! Tap any West African staple like Akamu, Moi Moi, Jollof, or Efo Riro to instantly record calories and balanced macros in one single tap.",
    narrationPcm: "One-tap food recording! No need to type anything! Just tap any of our sweet Nigerian food like Akamu, Moi Moi, Jollof, or Efo Riro to record your plate with one tap!",
    mascotGesture: "thumbsup",
    position: "top",
  },
  {
    targetId: "tour-plate-target",
    title: "The 50% Divided Plate Rule 🥗",
    subtitle: "The Secret to Flat Blood Sugar",
    description: "Our golden rule for steady energy: fill 50% of your plate with vegetables & drawing soups, 25% clean protein, and 25% swallow or carbs to prevent blood sugar spikes.",
    descriptionPcm: "See our fifty percent plate secret for good health! Fill half of your plate with fresh vegetables and draw soup, quarter with clean protein, and quarter with swallow to keep your sugar calm!",
    narrationEn: "The fifty percent divided plate rule. Our golden rule for steady energy: fill fifty percent of your plate with vegetables and drawing soups, twenty-five clean protein, and twenty-five percent swallow or carbs to prevent blood sugar spikes.",
    narrationPcm: "See our fifty percent plate secret for good health! Fill half of your plate with fresh vegetables and draw soup, quarter with clean protein, and quarter with swallow to keep your sugar calm!",
    mascotGesture: "thumbsup",
    position: "bottom",
  },
  {
    targetId: "tour-water-tracker",
    title: "Hydration & Pressure Shield 💧",
    subtitle: "Protect Your Kidneys & Blood Pressure",
    description: "Tap +1 Water with each cup you drink. Staying hydrated naturally flushes excess sodium, supports kidney filtration, and keeps your blood pressure relaxed and steady.",
    descriptionPcm: "Water and blood pressure shield! Tap plus one water with every cup you drink. Drinking clean water flushes excess salt, protects your kidneys, and keeps your blood pressure calm and relaxed!",
    narrationEn: "Hydration and pressure shield. Tap plus one water with each cup you drink. Staying hydrated naturally flushes excess sodium, supports kidney filtration, and keeps your blood pressure relaxed and steady.",
    narrationPcm: "Water and blood pressure shield! Tap plus one water with every cup you drink. Drinking clean water flushes excess salt, protects your kidneys, and keeps your blood pressure calm and relaxed!",
    mascotGesture: "drink",
    position: "top",
  },
  {
    targetId: "tour-fab-actions",
    title: "AI Camera, Voice & WhatsApp Logging 📸",
    subtitle: "Log Food Anytime, Anywhere",
    description: "Tap the floating (+) button to snap food photos with our AI camera, speak what you ate with your voice, or message our WhatsApp assistant on the go!",
    descriptionPcm: "AI camera, voice, and WhatsApp food recording! Tap this plus button anytime to snap your plate with camera, talk am with your voice, or log am straight on WhatsApp!",
    narrationEn: "AI camera, voice, and WhatsApp logging. Tap the floating plus button to snap food photos with our AI camera, speak what you ate with your voice, or message our WhatsApp assistant on the go!",
    narrationPcm: "AI camera, voice, and WhatsApp food recording! Tap this plus button anytime to snap your plate with camera, talk am with your voice, or log am straight on WhatsApp!",
    mascotGesture: "dancing",
    position: "top",
  },
  {
    targetId: "tour-food-wisdom",
    title: "Daily African Food Wisdom 🥑",
    subtitle: "60-Second Lessons & Voice Quizzes",
    description: "Master the secrets of African food in quick 60-second lessons and fun voice quizzes with me. Earn badges and level up your health every single day!",
    descriptionPcm: "Daily African food wisdom! Learn all the sweet secrets of our cultural food with my sixty-second lessons and fun quizzes. You don ready to level up your health every day!",
    narrationEn: "Daily African food wisdom. Master the secrets of African food in quick sixty-second lessons and fun voice quizzes with me. Earn badges and level up your health every single day!",
    narrationPcm: "Daily African food wisdom! Learn all the sweet secrets of our cultural food with my sixty-second lessons and fun quizzes. You don ready to level up your health every day!",
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
  const [voiceLang, setVoiceLang] = useState<TourVoiceLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sarah_language");
      if (saved === "en-gb" || saved === "gb") return "en-gb";
      if (saved === "pcm" || saved === "pidgin") return "pcm";
      if (saved === "en-ng" || saved === "ng") return "en-ng";
    }
    return "en-ng";
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const currentLangConfig = TOUR_VOICE_LANGUAGES.find((l) => l.id === voiceLang) || TOUR_VOICE_LANGUAGES[0];

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

  // Voice narration triggers on step change or voice language change
  useEffect(() => {
    if (!isOpen) return;

    if (voiceEnabled) {
      stopSarahSpeech();
      const isPidgin = voiceLang === "pcm";
      const textToSpeak = isPidgin ? step.narrationPcm : step.narrationEn;
      setIsPlayingAudio(true);
      speakWithSarah(textToSpeak, { 
        lang: voiceLang,
        audioKey: `tour_step_${currentStep + 1}`,
        title: step.title,
        subtitle: currentLangConfig.subtitle
      })
        .then(() => setIsPlayingAudio(false))
        .catch(() => setIsPlayingAudio(false));
    } else {
      stopSarahSpeech();
      setIsPlayingAudio(false);
    }

    return () => {
      stopSarahSpeech();
    };
  }, [isOpen, currentStep, voiceEnabled, voiceLang]);

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

  const cycleLanguage = () => {
    triggerHaptic("light");
    const order: TourVoiceLanguage[] = ["en-ng", "en-gb", "pcm"];
    const nextIdx = (order.indexOf(voiceLang) + 1) % order.length;
    const nextLang = order[nextIdx];
    setVoiceLang(nextLang);
    localStorage.setItem("sarah_language", nextLang);
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
              {/* 3-Way Voice Language Switcher: English NG / English GB / Nigerian Pidgin */}
              <button
                type="button"
                onClick={cycleLanguage}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-700 flex items-center gap-1"
                title={`Current voice: ${currentLangConfig.name}. Tap to switch between Nigerian English, British English, and Nigerian Pidgin`}
              >
                <span>{currentLangConfig.badge}</span>
                <span className="text-[8px] text-stone-400 font-normal">▼</span>
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
                {voiceLang === "pcm" ? step.descriptionPcm : step.description}
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
