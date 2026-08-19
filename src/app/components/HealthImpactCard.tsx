import React, { useState } from "react";
import FixMyPlateModal from "./FixMyPlateModal";
import { ShieldCheck, AlertTriangle, AlertCircle, Sparkles, Heart, Activity, Lightbulb, ChevronRight } from "lucide-react";
import { computeVerdict, Macros, VerdictLevel } from "../../lib/conditionVerdict";
import { useUser } from "../contexts/UserContext";

interface HealthImpactCardProps {
  foodName?: string;
  onPlateOptimized?: (optimized: any) => void;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    glycemicLoad?: "Low" | "Medium" | "High";
  };
  clinicalIndication?: string;
  postPrandialNote?: string;
  className?: string;
}

const LEVEL_STYLES: Record<
  VerdictLevel,
  {
    badge: string;
    border: string;
    bg: string;
    icon: typeof ShieldCheck;
    iconColor: string;
    label: string;
  }
> = {
  good: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    border: "border-emerald-100 dark:border-emerald-900/40",
    bg: "bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900",
    icon: ShieldCheck,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    label: "Safe & Condition-Friendly",
  },
  caution: {
    badge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    border: "border-amber-100 dark:border-amber-900/40",
    bg: "bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900",
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "Moderate with Portion Care",
  },
  avoid: {
    badge: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    border: "border-rose-100 dark:border-rose-900/40",
    bg: "bg-gradient-to-br from-rose-50/60 via-white to-pink-50/40 dark:from-rose-950/20 dark:via-zinc-900 dark:to-zinc-900",
    icon: AlertCircle,
    iconColor: "text-rose-600 dark:text-rose-400",
    label: "High Spike / Modification Advised",
  },
};

export default function HealthImpactCard({
  foodName,
  onPlateOptimized,
  macros,
  clinicalIndication,
  postPrandialNote,
  className = "",
}: HealthImpactCardProps) {
  const { profile } = useUser();
  const [showFixModal, setShowFixModal] = useState(false);

  // Extract user conditions
  const conditions = (profile?.conditions || []).map((c: any) =>
    typeof c === "string" ? { name: c } : c
  );

  const verdict = computeVerdict(
    {
      calories: macros.calories || 0,
      protein: macros.protein || 0,
      carbs: macros.carbs || 0,
      fats: macros.fats || 0,
      fiber: macros.fiber || 0,
      glycemicLoad: macros.glycemicLoad,
    },
    conditions
  );

  const style = LEVEL_STYLES[verdict.level];
  const Icon = style.icon;

  // Derive Glycemic Spike Level
  const calculatedGlycemic = (() => {
    if (macros.glycemicLoad) return macros.glycemicLoad;
    const netCarbs = Math.max(0, macros.carbs - (macros.fiber || 0));
    if (netCarbs > 50) return "High";
    if (netCarbs > 25) return "Medium";
    return "Low";
  })();

  const glycemicColor =
    calculatedGlycemic === "Low"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : calculatedGlycemic === "Medium"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-rose-700 bg-rose-50 border-rose-200";

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 shadow-md border ${style.border} ${style.bg} transition-all ${className}`}
    >
      {/* Header with Badges */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm">
            <Icon className={`h-6 w-6 ${style.iconColor}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              {verdict.title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {verdict.subtitle}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      {/* Glycemic Spike Meter */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3.5">
        <div className="bg-white/80 dark:bg-zinc-800/80 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-700/60 shadow-sm">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
            Glucose Spike Risk
          </span>
          <span
            className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border ${glycemicColor}`}
          >
            {calculatedGlycemic} Spike
          </span>
        </div>

        <div className="bg-white/80 dark:bg-zinc-800/80 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-700/60 shadow-sm">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
            Heart & Sodium Check
          </span>
          <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full border text-teal-700 bg-teal-50 border-teal-200">
            {macros.fats > 22 ? "Moderate Oils" : "Heart Safe"}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white/80 dark:bg-zinc-800/80 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-700/60 shadow-sm">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
            Fiber Absorption
          </span>
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            {macros.fiber ? `${macros.fiber}g dietary fiber` : "Digestive support"}
          </span>
        </div>
      </div>

      {/* Condition-specific Reasons & Clinical Notes */}
      {(verdict.reasons.length > 0 || clinicalIndication) && (
        <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
          {clinicalIndication && (
            <div className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
              <Activity className="h-4 w-4 text-[#1f7a8c] flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  Clinical Target:
                </strong>{" "}
                {clinicalIndication}
              </span>
            </div>
          )}

          {verdict.reasons.map((reason, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300"
            >
              <span className="text-teal-600 font-bold mt-0.5">&#8226;</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actionable Swap / Optimization Tip */}
      {(verdict.tip || postPrandialNote) && (
        <div className="mt-3.5 p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-2.5">
          <Lightbulb className="h-4 w-4 text-teal-700 dark:text-teal-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
            <strong className="text-teal-800 dark:text-teal-300 font-bold">
              Health Swap Tip:{" "}
            </strong>
            {verdict.tip || postPrandialNote}
          </div>
        </div>
      )}
      {/* Fix My Plate Action Button */}
      <button
        onClick={() => setShowFixModal(true)}
        className="mt-3.5 w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
      >
        <Sparkles size={15} />
        <span>Fix My Plate with Avo 🪄</span>
      </button>

      <FixMyPlateModal
        isOpen={showFixModal}
        onClose={() => setShowFixModal(false)}
        meal={{
          foodName: foodName || "This Meal",
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fats: macros.fats,
          fiber: macros.fiber,
          glycemicLoad: macros.glycemicLoad,
        }}
        onApplyOptimized={onPlateOptimized}
      />
    </div>
  );
}
