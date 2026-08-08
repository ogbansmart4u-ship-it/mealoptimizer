// MealOptimizingLoader — animated "Avo" mascot shown while meal plans / macros
// are being calculated. Adapted from the original Next.js spec to this app's
// stack (Vite + React + Tailwind 4): uses a plain <img> instead of next/image,
// and a self-contained "running bob" keyframe so it can't crash a page.

interface MealOptimizingLoaderProps {
  message?: string;
  subMessage?: string;
}

export default function MealOptimizingLoader({
  message = "Optimizing your daily meal plan...",
  subMessage = "Balancing macros, calories, and nutrition goals...",
}: MealOptimizingLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50/60 rounded-2xl border border-green-100 shadow-sm my-6">
      {/* Scoped animation so we don't touch global CSS */}
      <style>{`
        @keyframes avoRun {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%      { transform: translateY(-12px) rotate(2deg); }
        }
      `}</style>

      {/* Animated mascot */}
      <div
        className="w-40 h-40 flex items-center justify-center"
        style={{ animation: "avoRun 0.9s ease-in-out infinite" }}
      >
        <img
          src="/assets/mascot-avo.png"
          alt="MealOptimiza mascot running"
          className="w-full h-full object-contain drop-shadow-md"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Status message */}
      <h3 className="mt-4 text-xl font-bold text-gray-800">{message}</h3>
      <p className="mt-1 text-sm text-green-600 font-medium">{subMessage}</p>

      {/* Indeterminate progress bar */}
      <div className="w-64 h-2 mt-4 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full animate-pulse w-3/4"></div>
      </div>
    </div>
  );
}
