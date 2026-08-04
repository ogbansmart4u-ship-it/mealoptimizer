import { useState, useEffect } from "react";
import { X, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";

type TooltipStep = {
  id: string;
  title: string;
  description: string;
  targetId?: string;
  position?: "top" | "bottom" | "left" | "right";
  action?: {
    label: string;
    onClick: () => void;
  };
};

type TutorialTooltipProps = {
  tutorialId: string;
  steps: TooltipStep[];
  onComplete?: () => void;
  autoStart?: boolean;
};

export default function TutorialTooltip({
  tutorialId,
  steps,
  onComplete,
  autoStart = true,
}: TutorialTooltipProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen this tutorial before
    const seenTutorials = localStorage.getItem("seenTutorials");
    const tutorials = seenTutorials ? JSON.parse(seenTutorials) : [];

    if (tutorials.includes(tutorialId)) {
      setHasSeenTutorial(true);
    } else if (autoStart) {
      // Auto-start tutorial if not seen before
      setTimeout(() => setIsActive(true), 500);
    }
  }, [tutorialId, autoStart]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark tutorial as seen
    const seenTutorials = localStorage.getItem("seenTutorials");
    const tutorials = seenTutorials ? JSON.parse(seenTutorials) : [];

    if (!tutorials.includes(tutorialId)) {
      tutorials.push(tutorialId);
      localStorage.setItem("seenTutorials", JSON.stringify(tutorials));
    }

    setIsActive(false);
    setHasSeenTutorial(true);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isActive || hasSeenTutorial) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />

      {/* Tooltip */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#1f7a8c] text-white flex items-center justify-center text-sm font-bold">
                    {currentStep + 1}
                  </div>
                  <span className="text-sm text-gray-500">
                    of {steps.length}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {currentStepData.title}
                </h3>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Skip tutorial"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Action Button (if provided) */}
            {currentStepData.action && (
              <button
                onClick={currentStepData.action.onClick}
                className="w-full mb-4 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium border-2 border-blue-200"
              >
                {currentStepData.action.label}
              </button>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl py-3 hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Got it!
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>

            {/* Skip Link */}
            <button
              onClick={handleSkip}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to manually trigger tutorials
export function useTutorial(tutorialId: string) {
  const [showTutorial, setShowTutorial] = useState(false);

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const resetTutorial = () => {
    const seenTutorials = localStorage.getItem("seenTutorials");
    const tutorials = seenTutorials ? JSON.parse(seenTutorials) : [];
    const updated = tutorials.filter((id: string) => id !== tutorialId);
    localStorage.setItem("seenTutorials", JSON.stringify(updated));
    setShowTutorial(true);
  };

  return { showTutorial, startTutorial, resetTutorial, setShowTutorial };
}
