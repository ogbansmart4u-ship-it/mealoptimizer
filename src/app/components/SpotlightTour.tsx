import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Check, X, Compass } from "lucide-react";
import Mascot from "./Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  mascotGesture: "waving" | "thumbsup" | "dancing" | "neutral";
  position?: "top" | "bottom";
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-quick-shelf",
    title: "1-Tap Cultural Meal Logging 🍲",
    description: "Tap any West African staple (Akamu, Moi Moi, Jollof) to log calories and macros instantly.",
    mascotGesture: "waving",
    position: "bottom",
  },
  {
    targetId: "tour-water-tracker",
    title: "Hydration & Pressure Shield 💧",
    description: "Track your daily water glasses to keep blood pressure regulated and support digestion.",
    mascotGesture: "thumbsup",
    position: "top",
  },
  {
    targetId: "tour-fab-actions",
    title: "AI Camera & WhatsApp Logging 📸",
    description: "Tap the floating (+) button anytime to snap food photos or text meals directly via WhatsApp.",
    mascotGesture: "dancing",
    position: "top",
  },
];

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpotlightTour({ isOpen, onClose }: SpotlightTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          setRect(el.getBoundingClientRect());
        }, 250);
      } else {
        setRect(null);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isOpen, currentStep, step.targetId]);

  if (!isOpen) return null;

  const handleNext = () => {
    triggerHaptic("light");
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      triggerHaptic("success");
      triggerConfetti("cannons");
      localStorage.setItem("hasSeenSpotlightTour", "true");
      onClose();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenSpotlightTour", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Dark overlay backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300" />

      {/* Spotlight cutout highlight if target exists */}
      {rect && (
        <div
          className="absolute border-2 border-teal-400 rounded-3xl transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      )}

      {/* Tour Step Dialog Box */}
      <div className="fixed inset-x-4 bottom-8 sm:bottom-12 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Mascot gesture={step.mascotGesture} size={54} />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1f7a8c] dark:text-teal-400">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {step.title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleSkip}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full cursor-pointer"
              title="Skip Tour"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 my-3 leading-relaxed">
            {step.description}
          </p>

          {/* Progress dots & buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-6 bg-[#1f7a8c]"
                      : "w-2 bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 px-3 py-1.5 cursor-pointer"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-95 flex items-center gap-1.5 cursor-pointer"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>
                    <span>Got it!</span>
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
