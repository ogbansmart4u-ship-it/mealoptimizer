import { Check } from "lucide-react";

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export default function OnboardingProgress({
  currentStep,
  totalSteps,
  className = "",
}: OnboardingProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Text Indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-[#1f7a8c] font-semibold">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step Dots */}
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={stepNumber} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-[#1f7a8c] border-[#1f7a8c]"
                    : isCurrent
                    ? "bg-white border-[#1f7a8c]"
                    : "bg-white border-gray-300"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-[#1f7a8c]" : "text-gray-400"
                    }`}
                  >
                    {stepNumber}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
