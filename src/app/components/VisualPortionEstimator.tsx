import React from "react";
import { Sparkles, Check, Scale, ShieldAlert } from "lucide-react";
import { triggerHaptic } from "../utils/celebration";

export type PortionTier = "small" | "medium" | "large" | "custom";

export interface PortionOption {
  tier: PortionTier;
  label: string;
  analogy: string;
  weightGrams: number;
  estCarbs: number;
  icon: string;
  clinicalNote: string;
  badgeColor: string;
}

export const PORTION_OPTIONS: PortionOption[] = [
  {
    tier: "small",
    label: "Small (Fist / Tennis Ball)",
    analogy: "Single standard fist size",
    weightGrams: 120,
    estCarbs: 35,
    icon: "🎾",
    clinicalNote: "Best for tight glycemic control & evening dinners",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    tier: "medium",
    label: "Medium (Orange / 2 Scoops)",
    analogy: "Medium orange / 1 standard wrap",
    weightGrams: 220,
    estCarbs: 65,
    icon: "🍊",
    clinicalNote: "Standard active daily portion",
    badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
  },
  {
    tier: "large",
    label: "Large (Grapefruit / Restaurant)",
    analogy: "Large commercial restaurant mound",
    weightGrams: 350,
    estCarbs: 105,
    icon: "🍈",
    clinicalNote: "High glycemic load — pair with extra fiber",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
  },
];

interface VisualPortionEstimatorProps {
  selectedTier: PortionTier;
  onSelectTier: (tier: PortionTier, grams: number, carbs: number) => void;
  customGrams?: number;
  onCustomGramsChange?: (grams: number) => void;
}

export default function VisualPortionEstimator({
  selectedTier,
  onSelectTier,
  customGrams = 150,
  onCustomGramsChange,
}: VisualPortionEstimatorProps) {
  return (
    <div className="bg-white/95 rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-50 text-[#1f7a8c]">
            <Scale size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Visual Portion Estimator 📏
            </h4>
            <p className="text-[10px] text-slate-500">
              No food scale needed — tap your plate's visual size
            </p>
          </div>
        </div>
        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
          AFRICAN FOODS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {PORTION_OPTIONS.map((opt) => {
          const isSelected = selectedTier === opt.tier;
          return (
            <button
              key={opt.tier}
              type="button"
              onClick={() => {
                triggerHaptic("light");
                onSelectTier(opt.tier, opt.weightGrams, opt.estCarbs);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-[#1f7a8c] bg-teal-50/70 shadow-xs ring-1 ring-[#1f7a8c]"
                  : "border-slate-200/80 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{opt.icon}</span>
                  {isSelected && <Check size={14} className="text-[#1f7a8c] font-black" />}
                </div>
                <p className="text-xs font-black text-slate-900">{opt.label}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{opt.analogy}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                <span className="font-extrabold text-slate-700">~{opt.weightGrams}g</span>
                <span className={`px-1.5 py-0.5 rounded-md font-black border ${opt.badgeColor}`}>
                  ~{opt.estCarbs}g Carbs
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedTier === "large" && (
        <div className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-2xl border border-amber-200 text-amber-900 text-[11px] font-medium">
          <ShieldAlert size={15} className="shrink-0 text-amber-600 mt-0.5" />
          <span>
            <strong>Clinical Tip:</strong> A large swallow generates high glycemic pressure. Eat the soup/vegetables first (Fiber Shield) to reduce the spike by ~30%.
          </span>
        </div>
      )}
    </div>
  );
}
