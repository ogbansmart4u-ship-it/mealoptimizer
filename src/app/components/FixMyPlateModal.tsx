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
  Share2,
  Layers,
  Clock,
  ChevronRight,
  HeartPulse,
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
import { toast } from "sonner";

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

  const [activeTab, setActiveTab] = useState<"plate" | "curve" | "sequencing">("plate");

  const optimized: OptimizedResult = calculateOptimizedPlate(meal, activeSwaps, options);

  const handleToggle = (id: string, checked: boolean) => {
    triggerHaptic("light");
    const next = { ...activeSwaps, [id]: checked };
    setActiveSwaps(next);

    const nextRes = calculateOptimizedPlate(meal, next, options);
    if (nextRes.glycemicLoad === "Low" && optimized.glycemicLoad !== "Low") {
      triggerHaptic("success");
      triggerConfetti("stars");
      toast.success("Achieved Green Low-Spike Status! 🟢✨");
    }
  };

  const handleSharePlateTransformation = () => {
    triggerHaptic("medium");
    triggerConfetti("burst");

    const message =
      `🥑 *MealOptimiza Plate Bio-Transformation* 🪄\n` +
      `🍽️ Dish: *${meal.foodName || "African Heritage Meal"}*\n\n` +
      `*BEFORE FIX:* ${meal.calories} kcal · ${meal.carbs}g Carbs · High Spike 🔴\n` +
      `*AFTER OPTIMIZATION:* ${optimized.calories} kcal · ${optimized.netCarbs}g Net Carbs · ${optimized.glycemicLoad} Spike 🟢\n` +
      `📉 *Peak Glucose Drop:* ${optimized.peakGlucoseDelta} mg/dL\n` +
      `🧬 *Food Sequencing:* 1) Fiber First 🥬 2) Protein Second 🐟 3) Starch Last 🌾\n\n` +
      `_Optimized via MealOptimiza · Cultural Health & Metabolic Intelligence_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp share sheet!");
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
    toast.success("Balanced plate saved to your daily log! 🍽️✨");
    onClose();
  };

  // Determine Avo Mascot Gesture
  const mascotGesture =
    optimized.glycemicLoad === "Low"
      ? "celebrating"
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

            <button
              type="button"
              onClick={handleSharePlateTransformation}
              className="p-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1f7a8c] dark:text-teal-300 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              title="Share transformation to WhatsApp"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </DialogHeader>

        {/* Mascot & Live Reaction Card */}
        <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 border border-teal-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="shrink-0">
            <Mascot gesture={mascotGesture} size={65} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-700 dark:text-teal-400 block">
              Glycemic Spike Verdict
            </span>
            <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mt-0.5">
              <span>{optimized.verdictText}</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
              {optimized.glycemicLoad === "Low"
                ? `🎉 Peak glucose dropped by ${Math.abs(optimized.peakGlucoseDelta)} mg/dL. Soluble fiber shield protects your arteries.`
                : optimized.glycemicLoad === "Medium"
                ? "👍 Great progress! Toggle the lean protein or starch lever to hit green status."
                : "⚠️ High carb concentration. Toggle the levers below to balance your plate."}
            </p>
          </div>
        </div>

        {/* 3-Way Sub-View Segmented Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("plate")}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "plate"
                ? "bg-white dark:bg-zinc-700 text-teal-800 dark:text-white shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <span>🍽️ Visual Plate</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("curve")}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "curve"
                ? "bg-white dark:bg-zinc-700 text-teal-800 dark:text-white shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <span>📈 Glucose Curve</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sequencing")}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === "sequencing"
                ? "bg-white dark:bg-zinc-700 text-teal-800 dark:text-white shadow-2xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <span>🧬 Sequencing</span>
          </button>
        </div>

        {/* SUB-VIEW 1: VISUAL SPLIT PLATE RATIOS */}
        {activeTab === "plate" && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 mb-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                Visual Plate Re-Balancing
              </span>
              <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-bold">
                Peak Drop: {optimized.peakGlucoseDelta} mg/dL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              {/* Original Plate */}
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-rose-200 dark:border-rose-900/50 space-y-2">
                <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 block">
                  Original Plate
                </span>
                <div className="h-2.5 w-full rounded-full bg-zinc-200 overflow-hidden flex">
                  <div style={{ width: `${optimized.originalRatios.starch}%` }} className="bg-rose-500" title="Starch" />
                  <div style={{ width: `${optimized.originalRatios.protein}%` }} className="bg-blue-500" title="Protein" />
                  <div style={{ width: `${optimized.originalRatios.fiber}%` }} className="bg-emerald-500" title="Fiber" />
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between font-bold">
                  <span>🍚 {optimized.originalRatios.starch}% Starch</span>
                  <span>🥬 {optimized.originalRatios.fiber}% Veg</span>
                </div>
              </div>

              {/* Optimized Plate */}
              <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                  Optimized Plate
                </span>
                <div className="h-2.5 w-full rounded-full bg-zinc-200 overflow-hidden flex">
                  <div style={{ width: `${optimized.optimizedRatios.fiber}%` }} className="bg-emerald-500" title="Fiber (50%)" />
                  <div style={{ width: `${optimized.optimizedRatios.protein}%` }} className="bg-blue-500" title="Protein (25%)" />
                  <div style={{ width: `${optimized.optimizedRatios.starch}%` }} className="bg-amber-500" title="Starch (25%)" />
                </div>
                <div className="text-[10px] text-zinc-500 flex justify-between font-bold">
                  <span>🥬 {optimized.optimizedRatios.fiber}% Veg</span>
                  <span>🌾 {optimized.optimizedRatios.starch}% Starch</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: 2-HOUR CONTINUOUS GLUCOSE CURVE */}
        {activeTab === "curve" && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 mb-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                2-Hour Glycemic Curve Simulator
              </span>
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="text-rose-500">● Original</span>
                <span className="text-emerald-500">● Optimized</span>
              </div>
            </div>

            {/* SVG Visual Glycemic Curve */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
                {/* Baseline 100 mg/dL */}
                <line x1="0" y1="80" x2="300" y2="80" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                <text x="5" y="76" fill="#64748b" fontSize="8" fontFamily="monospace">95 mg/dL baseline</text>

                {/* Original Curve (Red Spiked) */}
                <path
                  d="M 10 80 Q 75 15 130 20 T 290 75"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="110" cy="18" r="3.5" fill="#f43f5e" />
                <text x="115" y="15" fill="#f43f5e" fontSize="8" fontWeight="bold">Peak ~185 mg/dL</text>

                {/* Optimized Curve (Green Flattened) */}
                <path
                  d="M 10 80 Q 75 52 140 50 T 290 78"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="140" cy="50" r="3.5" fill="#10b981" />
                <text x="145" y="47" fill="#10b981" fontSize="8" fontWeight="bold">Flat ~128 mg/dL</text>
              </svg>
            </div>
            <p className="text-[10.5px] text-zinc-500 text-center leading-snug">
              Soluble mucilage and protein pacing cushions insulin release and prevents the 45-minute crash.
            </p>
          </div>
        )}

        {/* SUB-VIEW 3: CLINICAL FOOD SEQUENCING ORDER */}
        {activeTab === "sequencing" && (
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 mb-4 space-y-2">
            <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 block mb-1">
              Plate Eating Sequencing Order
            </span>
            {optimized.sequencingSteps.map((step) => (
              <div
                key={step.step}
                className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700 flex items-center gap-2.5 text-xs shadow-2xs"
              >
                <span className="text-base p-1 bg-teal-50 dark:bg-teal-950 rounded-lg">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-zinc-900 dark:text-zinc-100">
                      Step {step.step}: {step.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 truncate">{step.subtitle}</p>
                </div>
                <span className="text-[9px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full shrink-0">
                  38% Shield
                </span>
              </div>
            ))}
          </div>
        )}

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
              Shield Active 🛡️
            </span>
          </div>
        </div>

        {/* Interactive Swap Toggles */}
        <div className="space-y-2.5 mb-5">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Interactive Swaps &amp; Levers
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
            className="flex-1 rounded-2xl text-xs font-semibold h-11 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white font-bold rounded-2xl text-xs h-11 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check size={16} />
            <span>Apply Balanced Plate</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
