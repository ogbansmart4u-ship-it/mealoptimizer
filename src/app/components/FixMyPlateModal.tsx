import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  Flame,
  Activity,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Lightbulb,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import {
  PlateMacroInput,
  generatePlateFixes,
  calculateOptimizedPlate,
  OptimizedResult,
} from "../utils/plateFixer";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

interface FixMyPlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: PlateMacroInput;
  onApplyOptimized?: (optimized: PlateMacroInput) => void;
}

export default function FixMyPlateModal({
  isOpen,
  onClose,
  meal,
  onApplyOptimized,
}: FixMyPlateModalProps) {
  const options = generatePlateFixes(meal);
  const [activeSwaps, setActiveSwaps] = useState<Record<string, boolean>>({
    starch_moderation: true,
    fiber_shield: true,
    lean_protein_swap: false,
  });

  const optimized: OptimizedResult = calculateOptimizedPlate(meal, activeSwaps, options);

  const handleToggle = (id: string, checked: boolean) => {
    triggerHaptic("light");
    const next = { ...activeSwaps, [id]: checked };
    setActiveSwaps(next);

    const nextRes = calculateOptimizedPlate(meal, next, options);
    if (nextRes.glycemicLoad === "Low" && optimized.glycemicLoad !== "Low") {
      triggerHaptic("success");
      triggerConfetti("stars");
    }
  };

  const handleApply = () => {
    triggerHaptic("milestone");
    triggerConfetti("cannons");
    if (onApplyOptimized) {
      onApplyOptimized({
        foodName: `${meal.foodName} (Balanced)`,
        calories: optimized.calories,
        protein: optimized.protein,
        carbs: optimized.carbs,
        fats: optimized.fats,
        fiber: optimized.fiber,
        glycemicLoad: optimized.glycemicLoad,
      });
    }
    onClose();
  };

  // Determine Avo Mascot Gesture
  const mascotGesture =
    optimized.glycemicLoad === "Low"
      ? "dancing"
      : optimized.glycemicLoad === "Medium"
      ? "waving"
      : "scratching";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-5 sm:p-7 rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-2xl text-[#1f7a8c] dark:text-teal-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  Fix My Plate with Avo 🪄
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Optimize <strong>{meal.foodName || "this meal"}</strong> for steady blood sugar and satiety.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Mascot & Live Reaction Card */}
        <div className="my-3.5 p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 border border-teal-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="flex-shrink-0">
            <Mascot gesture={mascotGesture} size={70} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-bold text-teal-700 dark:text-teal-400 block">
              Glycemic Spike Status
            </span>
            <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mt-0.5">
              <span>{optimized.verdictText}</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
              {optimized.glycemicLoad === "Low"
                ? "🎉 Excellent! The fiber shield and balanced starch prevent sharp glucose excursions."
                : optimized.glycemicLoad === "Medium"
                ? "👍 Good improvement! Toggle one more swap to reach green low-spike status."
                : "⚠️ High carb concentration. Toggle the starch moderation or fiber shield below."}
            </p>
          </div>
        </div>

        {/* Before & After Macro Delta Strip */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-500 block mb-0.5 font-medium">Calories</span>
            <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              {optimized.calories} <span className="text-[10px] font-normal text-zinc-500">kcal</span>
            </div>
            {optimized.calories !== meal.calories && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {optimized.calories - meal.calories > 0 ? "+" : ""}
                {optimized.calories - meal.calories} kcal
              </span>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-500 block mb-0.5 font-medium">Net Carbs</span>
            <div className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              {optimized.netCarbs} <span className="text-[10px] font-normal text-zinc-500">g</span>
            </div>
            {optimized.carbs !== meal.carbs && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {optimized.carbs - meal.carbs}g carbs
              </span>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/60">
            <span className="text-[10px] text-zinc-500 block mb-0.5 font-medium">Dietary Fiber</span>
            <div className="text-base font-extrabold text-teal-700 dark:text-teal-300">
              {optimized.fiber} <span className="text-[10px] font-normal text-zinc-500">g</span>
            </div>
            <span className="text-[10px] font-bold text-teal-600 block mt-0.5">
              Shield Protection
            </span>
          </div>
        </div>

        {/* Interactive Swap Toggles */}
        <div className="space-y-3 mb-5">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Interactive Swaps & Balancers
          </h4>

          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => handleToggle(opt.id, !activeSwaps[opt.id])}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                activeSwaps[opt.id]
                  ? "bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800 shadow-sm"
                  : "bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 opacity-70"
              }`}
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {opt.title}
                  </span>
                  {activeSwaps[opt.id] && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {opt.description}
                </p>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium block mt-1">
                  💡 {opt.culturalNote}
                </span>
              </div>

              <Switch
                checked={Boolean(activeSwaps[opt.id])}
                onCheckedChange={(checked) => handleToggle(opt.id, checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-2xl text-xs font-semibold h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white font-bold rounded-2xl text-xs h-11 shadow-md flex items-center justify-center gap-2"
          >
            <Check size={16} />
            <span>Apply Balanced Plate</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
