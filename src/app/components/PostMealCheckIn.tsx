import React, { useState } from "react";
import { Activity, Clock, Check, X, Sparkles, HeartPulse, BatteryCharging, AlertCircle } from "lucide-react";
import { createBiometric } from "../../lib/api";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

interface PostMealCheckInProps {
  lastMeal?: {
    foodName: string;
    time?: string;
    date?: string;
  };
  onDismiss?: () => void;
}

export default function PostMealCheckIn({ lastMeal, onDismiss }: PostMealCheckInProps) {
  const [glucoseVal, setGlucoseVal] = useState("");
  const [energyLevel, setEnergyLevel] = useState<"high" | "steady" | "low" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !lastMeal) return null;

  const handleSaveCheckIn = async () => {
    if (!glucoseVal && !energyLevel) {
      toast.error("Please enter a glucose reading or select your energy level");
      return;
    }

    setIsSaving(true);
    triggerHaptic("medium");
    try {
      if (glucoseVal) {
        await createBiometric({
          type: "glucose",
          value: glucoseVal,
          unit: "mg/dL",
          notes: `2-hr post-prandial after ${lastMeal.foodName}. Energy: ${energyLevel || "steady"}`,
          logged_at: new Date().toISOString(),
        });
      }

      triggerHaptic("success");
      triggerConfetti("burst");
      toast.success("Post-meal check-in recorded!");
      setDismissed(true);
      if (onDismiss) onDismiss();
    } catch {
      toast.error("Failed to save reading");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="my-4 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/60 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-zinc-900 border border-indigo-200/80 dark:border-indigo-900/40 rounded-3xl p-5 shadow-md relative animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={() => {
          setDismissed(true);
          if (onDismiss) onDismiss();
        }}
        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
        title="Dismiss"
      >
        <X size={15} />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl">
          <Clock size={16} />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 dark:text-indigo-400 block">
            2-Hour Metabolic Check-In
          </span>
          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
            How do you feel after {lastMeal.foodName}?
          </h4>
        </div>
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
        Recording post-meal vitals helps detect hidden glucose spikes and energy crashes.
      </p>

      {/* Energy Level Selector */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <button
          onClick={() => {
            triggerHaptic("light");
            setEnergyLevel("steady");
          }}
          className={`p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            energyLevel === "steady"
              ? "bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          ⚡ Steady
        </button>

        <button
          onClick={() => {
            triggerHaptic("light");
            setEnergyLevel("high");
          }}
          className={`p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            energyLevel === "high"
              ? "bg-teal-100 border-teal-400 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
              : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          🚀 Energetic
        </button>

        <button
          onClick={() => {
            triggerHaptic("light");
            setEnergyLevel("low");
          }}
          className={`p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            energyLevel === "low"
              ? "bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          😴 Sluggish
        </button>
      </div>

      {/* Optional Blood Glucose Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <HeartPulse className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="number"
            placeholder="Blood glucose (mg/dL)"
            value={glucoseVal}
            onChange={(e) => setGlucoseVal(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button
          onClick={handleSaveCheckIn}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
        >
          {isSaving ? "Saving..." : "Log Check-In"}
        </button>
      </div>
    </div>
  );
}
