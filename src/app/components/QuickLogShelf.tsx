import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Plus, 
  Camera, 
  Sparkles, 
  Check, 
  Flame, 
  MessageSquare, 
  Mic, 
  Calculator, 
  ChevronRight, 
  ArrowRight,
  ShieldAlert,
  Droplet,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

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
    emoji: "🥣",
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
    emoji: "🍳",
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
    name: "Fonio Supergrain Porridge",
    emoji: "🌾",
    mealType: "breakfast",
    calories: 240,
    protein: 10,
    carbs: 38,
    fats: 4,
    glycemicTag: "Low Spike",
    glycemicColor: "emerald",
  },
  {
    id: "b4",
    name: "Waakye & Boiled Egg",
    emoji: "🍛",
    mealType: "breakfast",
    calories: 380,
    protein: 20,
    carbs: 52,
    fats: 9,
    glycemicTag: "High Fiber",
    glycemicColor: "teal",
  },

  // Lunch
  {
    id: "l1",
    name: "Jollof Rice & Chicken",
    emoji: "🍗",
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
    name: "Oat Swallow & Okra Soup",
    emoji: "🥣",
    mealType: "lunch",
    calories: 390,
    protein: 26,
    carbs: 48,
    fats: 10,
    glycemicTag: "Low Spike",
    glycemicColor: "emerald",
  },
  {
    id: "l3",
    name: "Sukuma Wiki & Lean Beef",
    emoji: "🥬",
    mealType: "lunch",
    calories: 310,
    protein: 28,
    carbs: 16,
    fats: 12,
    glycemicTag: "Heart Safe",
    glycemicColor: "teal",
  },
  {
    id: "l4",
    name: "Beans Porridge & Fish",
    emoji: "🫘",
    mealType: "lunch",
    calories: 420,
    protein: 30,
    carbs: 54,
    fats: 8,
    glycemicTag: "High Fiber",
    glycemicColor: "emerald",
  },

  // Dinner
  {
    id: "d1",
    name: "Efo Riro & Grilled Fish",
    emoji: "🐟",
    mealType: "dinner",
    calories: 340,
    protein: 36,
    carbs: 14,
    fats: 16,
    glycemicTag: "Low Spike",
    glycemicColor: "emerald",
  },
  {
    id: "d2",
    name: "Pepper Soup with Goat",
    emoji: "🍲",
    mealType: "dinner",
    calories: 280,
    protein: 32,
    carbs: 8,
    fats: 12,
    glycemicTag: "Heart Safe",
    glycemicColor: "teal",
  },
  {
    id: "d3",
    name: "Garden Egg & Salmon",
    emoji: "🍆",
    mealType: "dinner",
    calories: 290,
    protein: 28,
    carbs: 18,
    fats: 12,
    glycemicTag: "Low Spike",
    glycemicColor: "emerald",
  },
  {
    id: "d4",
    name: "Plantain-Oat & Ewedu",
    emoji: "🥣",
    mealType: "dinner",
    calories: 320,
    protein: 18,
    carbs: 42,
    fats: 6,
    glycemicTag: "Low Spike",
    glycemicColor: "teal",
  },

  // Snacks
  {
    id: "s1",
    name: "Boiled Groundnut (Peanut)",
    emoji: "🥜",
    mealType: "snack",
    calories: 160,
    protein: 7,
    carbs: 6,
    fats: 14,
    glycemicTag: "Heart Safe",
    glycemicColor: "teal",
  },
  {
    id: "s2",
    name: "Tiger Nut Milk (Kunu)",
    emoji: "🥛",
    mealType: "snack",
    calories: 120,
    protein: 3,
    carbs: 18,
    fats: 4,
    glycemicTag: "Low Spike",
    glycemicColor: "emerald",
  },
  {
    id: "s3",
    name: "Roasted Corn & Ube",
    emoji: "🌽",
    mealType: "snack",
    calories: 210,
    protein: 5,
    carbs: 32,
    fats: 8,
    glycemicTag: "Moderate",
    glycemicColor: "amber",
  },
  {
    id: "s4",
    name: "Suya Skewer (Lean Beef)",
    emoji: "🍢",
    mealType: "snack",
    calories: 220,
    protein: 26,
    carbs: 8,
    fats: 9,
    glycemicTag: "Lean Protein",
    glycemicColor: "indigo",
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
  const navigate = useNavigate();

  // Top Mode: "quick_log" vs "calculator"
  const [hubMode, setHubMode] = useState<"quick_log" | "calculator">("quick_log");

  // Meal Tab (Breakfast, Lunch, Dinner, Snack)
  const defaultTab = (() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return "breakfast";
    if (h >= 11 && h < 16) return "lunch";
    if (h >= 16 && h < 21) return "dinner";
    return "snack";
  })();

  const [activeTab, setActiveTab] = useState<"breakfast" | "lunch" | "dinner" | "snack">(defaultTab);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  // Quick Inline Calculator State
  const [quickSwallow, setQuickSwallow] = useState({ name: "Pounded Yam (Iyan)", gi: 85, carbs: 35.5, cal: 155 });
  const [quickPortion, setQuickPortion] = useState(250); // 250g

  const swallowCarbs = Math.round((quickSwallow.carbs * quickPortion) / 100);
  const swapCarbs = Math.round((18.0 * quickPortion) / 100); // Plantain-Oat
  const carbsSaved = swallowCarbs - swapCarbs;

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
    <div className="w-full min-w-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl p-3.5 sm:p-5 shadow-md border border-teal-100/90 dark:border-zinc-800 my-3 overflow-hidden">
      
      {/* ============================================================ */}
      {/* 1. TOP 2-BUTTON UNIFIED ROW (Merged Mode Controller)         */}
      {/* ============================================================ */}
      <div className="bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl flex gap-1 mb-3.5 shadow-inner">
        {/* Button 1: 1-Tap Quick Log */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            setHubMode("quick_log");
          }}
          className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer truncate ${
            hubMode === "quick_log"
              ? "bg-white dark:bg-zinc-900 text-[#1f7a8c] dark:text-teal-300 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"
          }`}
        >
          <Zap size={13} className={hubMode === "quick_log" ? "text-amber-500 fill-amber-500 shrink-0" : "shrink-0"} />
          <span className="truncate">1-Tap Quick Log</span>
        </button>

        {/* Button 2: Metabolic Calculators */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            setHubMode("calculator");
          }}
          className={`flex-1 py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer truncate ${
            hubMode === "calculator"
              ? "bg-white dark:bg-zinc-900 text-[#1f7a8c] dark:text-teal-300 shadow-sm"
              : "text-slate-500 hover:text-slate-800 dark:text-zinc-400"
          }`}
        >
          <span className="text-xs sm:text-sm leading-none shrink-0">🥣</span>
          <span className="truncate">Calculators</span>
          <span className="text-[8.5px] font-black px-1.5 py-0.2 bg-teal-500 text-white rounded-full hidden sm:inline shrink-0">
            New
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* VIEW A: 1-TAP QUICK LOG SHELF                                */}
      {/* ============================================================ */}
      {hubMode === "quick_log" && (
        <div className="animate-in fade-in duration-200">
          {/* Subheader with Action Shortcuts */}
          <div className="flex items-center justify-between gap-2 mb-2.5 min-w-0">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 truncate block">
                Tap any African meal to log calories &amp; macros in 1s:
              </span>
            </div>

            {/* Quick action shortcuts */}
            <div className="flex items-center gap-1 shrink-0">
              {onOpenVoice && (
                <button
                  onClick={onOpenVoice}
                  title="Talk to Sarah (Voice AI)"
                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Mic size={13} className="animate-pulse" />
                </button>
              )}
              {onOpenWhatsApp && (
                <button
                  onClick={onOpenWhatsApp}
                  title="Log via WhatsApp"
                  className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <MessageSquare size={13} />
                </button>
              )}
              {onOpenScanner && (
                <button
                  onClick={onOpenScanner}
                  title="AI Camera Plate Scanner"
                  className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Camera size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Meal Timing Pills */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-0.5">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  triggerHaptic("light");
                  setActiveTab(tab);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black capitalize transition-all shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#1f7a8c] text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Food Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {filteredFoods.map((item) => {
              const isItemLogging = loggingId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTap(item)}
                  disabled={isLogging || Boolean(loggingId)}
                  className={`p-2.5 rounded-2xl border transition-all text-left bg-slate-50/80 dark:bg-zinc-800/70 hover:bg-teal-50/50 hover:border-teal-300 active:scale-95 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isItemLogging ? "border-emerald-500 bg-emerald-50" : "border-slate-200/80 dark:border-zinc-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xl">{item.emoji}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${TAG_CLASSES[item.glycemicColor]}`}>
                        {item.glycemicTag}
                      </span>
                    </div>
                    <span className="text-[11.5px] font-black text-slate-900 dark:text-white line-clamp-1 block">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                      {item.calories} kcal
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-200/60 dark:border-zinc-700 text-[9px] text-slate-500 font-bold">
                    <span>P:{item.protein}g</span>
                    <span>C:{item.carbs}g</span>
                    <span className="text-[#1f7a8c] dark:text-teal-400 font-black flex items-center">
                      {isItemLogging ? <Check size={10} className="text-emerald-600 animate-scale" /> : "+ Log"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW B: COMPACT METABOLIC CALCULATOR HUB                     */}
      {/* ============================================================ */}
      {hubMode === "calculator" && (
        <div className="animate-in fade-in duration-200 space-y-3">
          {/* Swallow Swap Quick Card */}
          <div className="p-3.5 bg-gradient-to-br from-teal-50 via-emerald-50/40 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-teal-200 dark:border-zinc-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🥣</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Swallow Carb-Swap Engine
                </span>
              </div>
              <span className="text-[9.5px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full">
                -{carbsSaved}g Carbs Saved! 🔥
              </span>
            </div>

            {/* Swallow Dropdown & Portion Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={quickSwallow.name}
                onChange={(e) => {
                  triggerHaptic("light");
                  if (e.target.value === "Eba") {
                    setQuickSwallow({ name: "White Garri (Eba)", gi: 82, carbs: 38, cal: 160 });
                  } else if (e.target.value === "Fufu") {
                    setQuickSwallow({ name: "Cassava Fufu", gi: 84, carbs: 36.2, cal: 158 });
                  } else if (e.target.value === "Semo") {
                    setQuickSwallow({ name: "Semovita", gi: 78, carbs: 34, cal: 150 });
                  } else {
                    setQuickSwallow({ name: "Pounded Yam (Iyan)", gi: 85, carbs: 35.5, cal: 155 });
                  }
                }}
                className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
              >
                <option value="Yam">Pounded Yam (GI: 85)</option>
                <option value="Eba">White Garri / Eba (GI: 82)</option>
                <option value="Fufu">Cassava Fufu (GI: 84)</option>
                <option value="Semo">Semovita (GI: 78)</option>
              </select>

              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs">
                <span className="text-[10px] text-slate-500 font-bold shrink-0">Portion:</span>
                <input
                  type="range"
                  min="150"
                  max="400"
                  step="25"
                  value={quickPortion}
                  onChange={(e) => setQuickPortion(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1f7a8c]"
                />
                <span className="text-[11px] font-black text-[#1f7a8c] shrink-0">{quickPortion}g</span>
              </div>
            </div>

            {/* Quick Result Pill */}
            <div className="p-2 bg-white/80 dark:bg-zinc-800/80 rounded-xl border border-teal-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Swap to <strong>Plantain-Oat Fufu</strong>:
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black">
                {swallowCarbs}g ➔ {swapCarbs}g (-42% spike risk) 🟢
              </span>
            </div>
          </div>

          {/* Full Suite Launcher Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              navigate("/calculators");
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-sm flex items-center justify-between cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <Calculator size={14} className="text-amber-300" />
              <span>Launch All 3 Metabolic Calculators (Swallow • Sodium • Sequencing)</span>
            </div>
            <ArrowRight size={14} className="text-teal-200" />
          </button>
        </div>
      )}

    </div>
  );
}
