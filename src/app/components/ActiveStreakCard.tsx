// ActiveStreakCard — dashboard hero celebrating an active logging streak.
//
// Adapted from the task spec to this codebase: Vite (not Next.js), so it uses the
// animated <Mascot/> instead of next/image, and react-router for the default
// action. The mascot runs to convey momentum.

import { useNavigate } from "react-router";
import Mascot from "./Mascot";

interface ActiveStreakCardProps {
  streakDays?: number;
  /** Optional custom handler for the CTA. Defaults to opening the Add-Meal flow. */
  onActionClick?: () => void;
}

export default function ActiveStreakCard({ streakDays = 5, onActionClick }: ActiveStreakCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onActionClick) return onActionClick();
    navigate("/logs", { state: { openAdd: true } });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-3xl p-6 shadow-lg flex items-center justify-between gap-4 my-4">
      {/* Text info */}
      <div className="z-10 min-w-0 flex-1">
        <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
          Daily Fitness &amp; Nutrition
        </span>
        <h2 className="text-2xl font-black mt-2 leading-tight">You're on a Roll! 🔥</h2>
        <p className="text-green-100 text-sm mt-1">
          You've optimized {streakDays} meal{streakDays === 1 ? "" : "s"} in a row. Keep up the momentum!
        </p>
        <button
          onClick={handleClick}
          className="mt-4 bg-white text-emerald-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-green-50 active:scale-[0.97] transition-all shadow-sm"
        >
          Log Next Meal
        </button>
      </div>

      {/* Animated mascot (running = momentum) */}
      <div className="relative flex-shrink-0 self-center">
        <Mascot gesture="running" size={128} className="drop-shadow-md" />
      </div>
    </div>
  );
}
