import React, { useState } from "react";
import { motion } from "motion/react";
import { Zap, Plus, Camera, Sparkles, Check, Flame, MessageSquare, Mic } from "lucide-react";
import { triggerHaptic } from "../utils/celebration";

export interface QuickFoodItem {
  id: string;
  name: string;
  emoji: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  glycemicTag: "Low Spike" | "High Fiber" | "Heart Safe" | "Lean Protein" | "Moderate";
  glycemicColor: "emerald" | "teal" | "amber" | "indigo";
}

const QUICK_FOODS: QuickFoodItem[] = [
  // Breakfast
  {
    id: "b1",
    name: "Akamu & Moi Moi",
    emoji: "\ud83e\udd63",
    mealType: "breakfast",
    calories: 350,
    protein: 16,
    carbs: 48,
    fats: 8,
    glycemicTag: "High Fiber",
    glycemicColor: "emerald",
  },
  {
    id: "b2",
    name: "Ugu & Egg Scramble",
    emoji: "\ud83c\udf73",
    mealType: "breakfast",
    calories: 260,
    protein: 18,
    carbs: 12,
    fats: 14,
    glycemicTag: "Low Spike",
    glycemicColor: "teal",
  },
  {
    id: "b3",
    name: "Oatmeal & Walnuts",
    emoji: "\ud83e\udd63",
    mealType: "breakfast",
    calories: 290,
    protein: 11,
    carbs: 42,
    fats: 9,
    glycemicTag: "Heart Safe",
    glycemicColor: "indigo",
  },

  // Lunch
  {
    id: "l1",
    name: "Jollof Rice & Chicken",
    emoji: "\ud83c\udf5b",
    mealType: "lunch",
    calories: 520,
    protein: 34,
    carbs: 62,
    fats: 15,
    glycemicTag: "Moderate",
    glycemicColor: "amber",
  },
  {
    id: "l2",
    name: "Ewedu, Fish & Amala",
    emoji: "\ud83c\udf72",
    mealType: "lunch",
    calories: 440,
    protein: 26,
    carbs: 58,
    fats: 10,
    glycemicTag: "Low Spike",
    glycemicColor: "emerald",
  },
  {
    id: "l3",
    name: "Boiled Plantain & Stew",
    emoji: "\ud83c\udf4c",
    mealType: "lunch",
    calories: 380,
    protein: 14,
    carbs: 64,
    fats: 9,
    glycemicTag: "High Fiber",
    glycemicColor: "teal",
  },

  // Dinner
  {
    id: "d1",
    name: "Edikang Ikong Soup",
    emoji: "\ud83e\udd57",
    mealType: "dinner",
    calories: 380,
    protein: 28,
    carbs: 16,
    fats: 20,
    glycemicTag: "Low Spike",
    glycemicColor: "emerald",
  },
  {
    id: "d2",
    name: "Grilled Tilapia & Salad",
    emoji: "\ud83d\udc1f",
    mealType: "dinner",
    calories: 310,
    protein: 36,
    carbs: 10,
    fats: 12,
    glycemicTag: "Lean Protein",
    glycemicColor: "indigo",
  },
  {
    id: "d3",
    name: "Vegetable Stir-fry Bowl",
    emoji: "\ud83e\udd6c",
    mealType: "dinner",
    calories: 270,
    protein: 14,
    carbs: 22,
    fats: 11,
    glycemicTag: "Heart Safe",
    glycemicColor: "teal",
  },

  // Snacks & Hydration
  {
    id: "s1",
    name: "Garden Egg & Peanut Paste",
    emoji: "\ud83c\udf46",
    mealType: "snack",
    calories: 140,
    protein: 6,
    carbs: 12,
    fats: 8,
    glycemicTag: "Low Spike",
    glycemicColor: "emerald",
  },
  {
    id: "s2",
    name: "Roasted Corn & Coconut",
    emoji: "\ud83c\udf3d",
    mealType: "snack",
    calories: 210,
    protein: 5,
    carbs: 38,
    fats: 6,
    glycemicTag: "High Fiber",
    glycemicColor: "teal",
  },
];

interface QuickLogShelfProps {
  onLogItem: (item: QuickFoodItem) => Promise<void> | void;
  onOpenScanner?: () => void;
  onOpenWhatsApp?: () => void;
  onOpenVoice?: () => void;
  onOpenCustom?: () => void;
  isLogging?: boolean;
}

const TAG_CLASSES = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  teal: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300",
};

export default function QuickLogShelf({
  onLogItem,
  onOpenScanner,
  onOpenWhatsApp,
  onOpenVoice,
  onOpenCustom,
  isLogging = false,
}: QuickLogShelfProps) {
  // Default tab based on time of day
  const defaultTab = (() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return "breakfast";
    if (h >= 11 && h < 16) return "lunch";
    if (h >= 16 && h < 21) return "dinner";
    return "snack";
  })();

  const [activeTab, setActiveTab] = useState<"breakfast" | "lunch" | "dinner" | "snack">(defaultTab);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const filteredFoods = QUICK_FOODS.filter((f) => f.mealType === activeTab);

  const handleTap = async (item: QuickFoodItem) => {
    if (isLogging || loggingId) return;
    triggerHaptic("medium");
    setLoggingId(item.id);
    try {
      await onLogItem(item);
    } finally {
      setTimeout(() => setLoggingId(null), 500);
    }
  };

  return (
    <div className="w-full min-w-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl p-3.5 sm:p-5 shadow-sm border border-teal-50 dark:border-zinc-800 my-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-[#1f7a8c] dark:text-teal-400 shrink-0">
            <Zap size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
              <span>1-Tap Quick Log</span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 shrink-0">
                Instant
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              Tap any food to log calories &amp; macros in 1s
            </p>
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex items-center gap-1 shrink-0">
          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              title="Talk to Sarah (Voice AI)"
              className="p-1.5 sm:p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95 group shadow-2xs"
            >
              <Mic size={14} className="animate-pulse group-hover:scale-115 transition-transform" />
            </button>
          )}
          {onOpenWhatsApp && (
            <button
              onClick={onOpenWhatsApp}
              title="Log via WhatsApp"
              className="p-1.5 sm:p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95 group shadow-2xs"
            >
              <MessageSquare size={14} className="animate-wa-pulse group-hover:scale-115 transition-transform" />
            </button>
          )}
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              title="Scan Food Photo"
              className="p-1.5 sm:p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#1f7a8c] dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all cursor-pointer active:scale-95 group shadow-2xs"
            >
              <Camera size={14} className="group-hover:rotate-12 transition-transform" />
            </button>
          )}
          {onOpenCustom && (
            <button
              onClick={onOpenCustom}
              title="Custom Log"
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 group shadow-2xs"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Meal type filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100/80 dark:bg-zinc-800/80 rounded-2xl mb-3">
        {(["breakfast", "lunch", "dinner", "snack"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              triggerHaptic("light");
              setActiveTab(tab);
            }}
            className={`flex-1 py-1.5 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid of Foods */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {filteredFoods.map((food) => {
          const isItemLogging = loggingId === food.id;
          return (
            <motion.button
              key={food.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleTap(food)}
              disabled={isLogging || loggingId !== null}
              className={`relative text-left p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer select-none min-w-0 ${
                isItemLogging
                  ? "bg-teal-50 border-teal-300 dark:bg-teal-950/50"
                  : "bg-white dark:bg-zinc-900/60 border-zinc-100 dark:border-zinc-800/80 hover:border-teal-200 dark:hover:border-zinc-700 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-1.5 mb-1.5 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xl shrink-0">{food.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {food.name}
                    </h4>
                    <span className="text-[10px] sm:text-[11px] text-zinc-500 font-medium block">
                      {food.calories} kcal
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[8.5px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${TAG_CLASSES[food.glycemicColor]}`}
                >
                  {food.glycemicTag}
                </span>
              </div>

              {/* Macro breakdown */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-800/60 text-[10px] text-zinc-500 dark:text-zinc-400">
                <span>P: {food.protein}g</span>
                <span>C: {food.carbs}g</span>
                <span>F: {food.fats}g</span>
                <span className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5">
                  {isItemLogging ? (
                    <Check size={12} className="animate-bounce" />
                  ) : (
                    <>
                      <Plus size={11} /> Log
                    </>
                  )}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
