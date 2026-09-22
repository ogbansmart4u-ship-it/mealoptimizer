import React from "react";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  Droplet, 
  Clock, 
  Flame, 
  Utensils, 
  Activity, 
  ChevronRight,
  Calculator,
  Moon,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router";
import { triggerHaptic } from "../utils/celebration";

interface NextBestActionCardProps {
  mealsCount: number;
  waterGlasses: number;
  onOpenScanner?: () => void;
  onOpenWater?: () => void;
  onOpenQuickLog?: () => void;
}

export default function NextBestActionCard({
  mealsCount,
  waterGlasses,
  onOpenScanner,
  onOpenWater,
  onOpenQuickLog,
}: NextBestActionCardProps) {
  const navigate = useNavigate();
  const hour = new Date().getHours();

  // Dynamic Decision Engine based on Time & Completion
  let actionData = {
    phase: "Morning Kickstart",
    phaseBadge: "🌅 07:00 - 11:00",
    title: "Log Your Morning Breakfast & Glucose",
    description: "Start with fiber and protein (e.g. Akamu + Moi Moi) to lock in stable all-day energy.",
    buttonText: "Log Breakfast 🥣",
    icon: "🥣",
    gradient: "from-teal-600 via-[#1f7a8c] to-[#0d9488]",
    onClick: () => {
      triggerHaptic("medium");
      if (onOpenQuickLog) onOpenQuickLog();
      else navigate("/logs", { state: { openAdd: true } });
    },
  };

  if (hour >= 5 && hour < 11) {
    if (waterGlasses < 2) {
      actionData = {
        phase: "Morning Hydration",
        phaseBadge: "💧 Morning Flush",
        title: "Drink Your First 2 Glasses of Water",
        description: "Rehydrate your cellular matrix and flush morning kidneys before breakfast.",
        buttonText: "+250ml Water 💧",
        icon: "💧",
        gradient: "from-blue-600 via-cyan-600 to-teal-600",
        onClick: () => {
          triggerHaptic("success");
          if (onOpenWater) onOpenWater();
          else navigate("/hydration");
        },
      };
    } else if (mealsCount === 0) {
      actionData = {
        phase: "Breakfast Protocol",
        phaseBadge: "🌅 Low-GI Morning",
        title: "Log Breakfast or Check Glucose",
        description: "Log your morning plate to track fasting insulin sensitivity and carbs.",
        buttonText: "Log Breakfast 🍳",
        icon: "🍳",
        gradient: "from-teal-600 via-[#1f7a8c] to-emerald-600",
        onClick: () => {
          triggerHaptic("medium");
          if (onOpenScanner) onOpenScanner();
          else navigate("/logs", { state: { openAdd: true } });
        },
      };
    }
  } else if (hour >= 11 && hour < 16) {
    actionData = {
      phase: "Lunchtime Glucose Shield",
      phaseBadge: "☀️ 12:00 - 15:00",
      title: "Lunch Plate Sequencing & Fiber Shield",
      description: "Eat vegetables & protein first to reduce your post-lunch glucose spike by up to 38%.",
      buttonText: "Plate Sequence 📉",
      icon: "🥗",
      gradient: "from-emerald-600 via-teal-700 to-[#1f7a8c]",
      onClick: () => {
        triggerHaptic("medium");
        navigate("/calculators");
      },
    };
  } else if (hour >= 16 && hour < 21) {
    actionData = {
      phase: "Dinner & Sodium Balance",
      phaseBadge: "🌙 17:00 - 20:00",
      title: "Log Dinner & Check Swallow Swap",
      description: "Swap heavy swallows for Plantain-Oat Fufu and balance soup sodium with Zobo water.",
      buttonText: "Swallow Swap 🥣",
      icon: "🍲",
      gradient: "from-amber-600 via-orange-600 to-[#1f7a8c]",
      onClick: () => {
        triggerHaptic("medium");
        navigate("/calculators");
      },
    };
  } else {
    actionData = {
      phase: "Night Autophagy & Rest",
      phaseBadge: "⏱️ Overnight Fast",
      title: "Start 16:8 Overnight Fasting Window",
      description: "Let your digestive system rest and trigger deep metabolic fat burning while you sleep.",
      buttonText: "Start Fasting Timer ⏱️",
      icon: "⏱️",
      gradient: "from-indigo-900 via-slate-900 to-teal-950",
      onClick: () => {
        triggerHaptic("medium");
        navigate("/fasting");
      },
    };
  }

  return (
    <div
      onClick={actionData.onClick}
      className="bg-gradient-to-r from-[#164E3D] via-[#1E604D] to-[#124233] text-white rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group border border-[#164E3D]/30 active:scale-[0.99]"
    >
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 w-full">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform border border-white/20">
            {actionData.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20 text-white">
                {actionData.phaseBadge}
              </span>
              <span className="text-xs font-medium text-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                Next Best Step
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug line-clamp-1">
              {actionData.title}
            </h3>
            <p className="text-xs text-stone-200 font-normal line-clamp-2 mt-0.5 leading-relaxed">
              {actionData.description}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex sm:inline-flex">
          <button
            type="button"
            className="w-full sm:w-auto bg-white hover:bg-stone-50 text-[#164E3D] font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span>{actionData.buttonText}</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
