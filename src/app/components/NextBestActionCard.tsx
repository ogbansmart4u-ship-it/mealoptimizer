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
      className={`bg-gradient-to-r ${actionData.gradient} text-white rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group border border-white/20 active:scale-99`}
    >
      {/* Ambient background light */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 w-full">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform border border-white/20">
            {actionData.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9.5px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 text-white">
                {actionData.phaseBadge}
              </span>
              <span className="text-[10px] font-bold text-teal-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                Next Best Action
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white mt-1 leading-snug line-clamp-1">
              {actionData.title}
            </h3>
            <p className="text-[11px] text-teal-100/90 font-medium line-clamp-2 mt-0.5 leading-tight">
              {actionData.description}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex sm:inline-flex">
          <button
            type="button"
            className="w-full sm:w-auto bg-white hover:bg-teal-50 text-[#1f7a8c] font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 group-hover:shadow-lg"
          >
            <span>{actionData.buttonText}</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
