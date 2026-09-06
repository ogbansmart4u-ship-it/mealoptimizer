import React, { useState, useMemo } from "react";
import {
  Utensils,
  Sparkles,
  Check,
  RotateCcw,
  Activity,
  Flame,
  Droplet,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  Plus,
  X,
  Heart,
  Zap,
} from "lucide-react";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic } from "../utils/celebration";
import { addMealLog } from "../../lib/api";
import { toast } from "sonner";
import Mascot from "./Mascot";

export interface FoodOption {
  id: string;
  name: string;
  category: "veggie" | "protein" | "carb" | "drink";
  portionUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  sodium: number;
  potassium: number;
  gi: "low" | "medium" | "high";
  emoji: string;
  clinicalNote: string;
}

export const AFRICAN_PLATE_DATABASE: FoodOption[] = [
  // 🥬 50% Non-Starchy Leafy Soups & Vegetables (2 Ladles)
  {
    id: "ewedu",
    name: "Ewedu (Jute Leaves)",
    category: "veggie",
    portionUnit: "2 Ladles (~50% Plate)",
    calories: 25,
    protein: 2,
    carbs: 3,
    fiber: 3.5,
    sodium: 45,
    potassium: 380,
    gi: "low",
    emoji: "🥣",
    clinicalNote: "Viscous mucilage blunts postprandial glucose absorption by 28%.",
  },
  {
    id: "okra",
    name: "Fresh Viscous Okra (Ila)",
    category: "veggie",
    portionUnit: "2 Ladles (~50% Plate)",
    calories: 45,
    protein: 3,
    carbs: 6,
    fiber: 4.2,
    sodium: 50,
    potassium: 420,
    gi: "low",
    emoji: "🥗",
    clinicalNote: "Soluble fiber traps starch enzymes, delaying gastric emptying.",
  },
  {
    id: "efo_riro",
    name: "Efo Riro (Spinach & Peppers)",
    category: "veggie",
    portionUnit: "2 Ladles (~50% Plate)",
    calories: 65,
    protein: 4,
    carbs: 5,
    fiber: 4.0,
    sodium: 120,
    potassium: 490,
    gi: "low",
    emoji: "🥬",
    clinicalNote: "Rich in lutein and magnesium, supporting insulin receptor sensitivity.",
  },
  {
    id: "ugwu",
    name: "Ugwu (Fluted Pumpkin Leaves)",
    category: "veggie",
    portionUnit: "2 Ladles (~50% Plate)",
    calories: 50,
    protein: 4,
    carbs: 4,
    fiber: 4.8,
    sodium: 40,
    potassium: 540,
    gi: "low",
    emoji: "🌿",
    clinicalNote: "High potassium and folate protect against endothelial stiffness.",
  },
  {
    id: "kontomire",
    name: "Kontomire (Cocoyam Leaves)",
    category: "veggie",
    portionUnit: "2 Ladles (~50% Plate)",
    calories: 70,
    protein: 4,
    carbs: 5,
    fiber: 4.5,
    sodium: 60,
    potassium: 460,
    gi: "low",
    emoji: "🍲",
    clinicalNote: "Traditional Ghanaian dark greens packed with iron and prebiotic fiber.",
  },
  {
    id: "bitterleaf",
    name: "Bitter Leaf Soup (Ofe Onugbu)",
    category: "veggie",
    portionUnit: "2 Ladles (~50% Plate)",
    calories: 55,
    protein: 3,
    carbs: 5,
    fiber: 4.2,
    sodium: 70,
    potassium: 510,
    gi: "low",
    emoji: "🍃",
    clinicalNote: "Vernonia amygdalina bioactive peptides support hepatic glycemic regulation.",
  },

  // 🥩 25% Lean Protein & Seafood (1 Palm)
  {
    id: "tilapia",
    name: "Grilled Tilapia Fillet",
    category: "protein",
    portionUnit: "1 Palm (~25% Plate)",
    calories: 145,
    protein: 28,
    carbs: 0,
    fiber: 0,
    sodium: 75,
    potassium: 380,
    gi: "low",
    emoji: "🐟",
    clinicalNote: "Pure lean protein with 0g carbs, stimulating GLP-1 and satiety hormones.",
  },
  {
    id: "mackerel",
    name: "Titus / Mackerel Steak",
    category: "protein",
    portionUnit: "1 Palm (~25% Plate)",
    calories: 190,
    protein: 24,
    carbs: 0,
    fiber: 0,
    sodium: 90,
    potassium: 420,
    gi: "low",
    emoji: "🐟",
    clinicalNote: "High in marine Omega-3 fatty acids (EPA/DHA), lowering systemic inflammation.",
  },
  {
    id: "moimoi",
    name: "Steamed Moi-Moi (with Egg)",
    category: "protein",
    portionUnit: "1 Palm (~25% Plate)",
    calories: 150,
    protein: 14,
    carbs: 12,
    fiber: 4.5,
    sodium: 140,
    potassium: 390,
    gi: "low",
    emoji: "🫘",
    clinicalNote: "Plant and egg protein blend with slow-release soluble legume fiber.",
  },
  {
    id: "goat_meat",
    name: "Lean Goat Meat (Asun Cut)",
    category: "protein",
    portionUnit: "1 Palm (~25% Plate)",
    calories: 150,
    protein: 26,
    carbs: 0,
    fiber: 0,
    sodium: 85,
    potassium: 390,
    gi: "low",
    emoji: "🥩",
    clinicalNote: "Lower in saturated fat and cholesterol than commercial beef cuts.",
  },
  {
    id: "boiled_eggs",
    name: "Boiled Farm Eggs (2 Eggs)",
    category: "protein",
    portionUnit: "1 Palm (~25% Plate)",
    calories: 140,
    protein: 13,
    carbs: 1,
    fiber: 0,
    sodium: 140,
    potassium: 130,
    gi: "low",
    emoji: "🥚",
    clinicalNote: "High biological value protein with choline for lipid metabolism.",
  },
  {
    id: "snail",
    name: "Peppered Snail & Crayfish",
    category: "protein",
    portionUnit: "1 Palm (~25% Plate)",
    calories: 110,
    protein: 22,
    carbs: 1,
    fiber: 0,
    sodium: 110,
    potassium: 350,
    gi: "low",
    emoji: "🐚",
    clinicalNote: "Ultra-lean traditional delicacy with high magnesium and iron density.",
  },

  // 🍠 25% Complex Swallows & Starchy Carbs (1 Fist)
  {
    id: "unripe_plantain_fufu",
    name: "Unripe Plantain Fufu",
    category: "carb",
    portionUnit: "1 Fist (~25% Plate)",
    calories: 160,
    protein: 2,
    carbs: 36,
    fiber: 4.5,
    sodium: 10,
    potassium: 480,
    gi: "low",
    emoji: "🍠",
    clinicalNote: "High in Type-2 resistant starch that bypasses early small intestine digestion.",
  },
  {
    id: "amala",
    name: "Amala (Yam Peel Fiber Flour)",
    category: "carb",
    portionUnit: "1 Fist (~25% Plate)",
    calories: 175,
    protein: 3,
    carbs: 38,
    fiber: 5.2,
    sodium: 15,
    potassium: 440,
    gi: "low",
    emoji: "🟤",
    clinicalNote: "Retains the antioxidant-rich fibrous cortex of sun-dried yam skins.",
  },
  {
    id: "oat_fufu",
    name: "Oat Fufu",
    category: "carb",
    portionUnit: "1 Fist (~25% Plate)",
    calories: 170,
    protein: 5,
    carbs: 34,
    fiber: 4.0,
    sodium: 8,
    potassium: 290,
    gi: "low",
    emoji: "🌾",
    clinicalNote: "Beta-glucan soluble fibers create viscous gel reducing glycemic spike.",
  },
  {
    id: "ofada_rice",
    name: "Brown / Ofada Rice",
    category: "carb",
    portionUnit: "1 Fist (~25% Plate)",
    calories: 180,
    protein: 4,
    carbs: 38,
    fiber: 3.2,
    sodium: 12,
    potassium: 220,
    gi: "medium",
    emoji: "🍚",
    clinicalNote: "Unpolished grain preserving bran layer and slow carbohydrate release.",
  },
  {
    id: "boiled_plantain",
    name: "Boiled Unripe Plantain",
    category: "carb",
    portionUnit: "1 Medium Fist (~25% Plate)",
    calories: 150,
    protein: 2,
    carbs: 34,
    fiber: 4.0,
    sodium: 8,
    potassium: 520,
    gi: "low",
    emoji: "🍌",
    clinicalNote: "Whole boiled preparation preserves intact cellular starch granules.",
  },
  {
    id: "pounded_yam",
    name: "Pounded Yam (High-GI Watch)",
    category: "carb",
    portionUnit: "1 Fist (~25% Plate)",
    calories: 240,
    protein: 2,
    carbs: 54,
    fiber: 2.0,
    sodium: 10,
    potassium: 390,
    gi: "high",
    emoji: "⚪",
    clinicalNote: "Rapidly hydrolyzed starch. Pair with 2+ ladles of Okra to blunt spike.",
  },

  // 💧 0-Calorie Side Hydration
  {
    id: "water",
    name: "Fresh Filtered Water",
    category: "drink",
    portionUnit: "1 Glass (250ml)",
    calories: 0,
    protein: 0,
    carbs: 0,
    fiber: 0,
    sodium: 5,
    potassium: 10,
    gi: "low",
    emoji: "💧",
    clinicalNote: "Zero calories, zero carbs. Hydrates kidneys to facilitate glucose excretion.",
  },
  {
    id: "zobo",
    name: "Chilled Sugar-Free Zobo",
    category: "drink",
    portionUnit: "1 Glass (Hibiscus & Ginger)",
    calories: 5,
    protein: 0,
    carbs: 1,
    fiber: 0,
    sodium: 5,
    potassium: 140,
    gi: "low",
    emoji: "🌺",
    clinicalNote: "Rich in anthocyanins and hibiscus acid, supporting healthy systolic BP.",
  },
  {
    id: "moringa_tea",
    name: "Warm Moringa & Lemon Brew",
    category: "drink",
    portionUnit: "1 Cup (250ml)",
    calories: 2,
    protein: 0,
    carbs: 0,
    fiber: 0,
    sodium: 2,
    potassium: 95,
    gi: "low",
    emoji: "🍵",
    clinicalNote: "Isothiocyanates in moringa promote improved cellular glucose uptake.",
  },
];

interface AfricanDiabetesPlateProps {
  onLoggedSuccess?: () => void;
  className?: string;
}

export default function AfricanDiabetesPlate({
  onLoggedSuccess,
  className = "",
}: AfricanDiabetesPlateProps) {
  const [selectedVeggie, setSelectedVeggie] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[0]); // Ewedu
  const [selectedProtein, setSelectedProtein] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[6]); // Tilapia
  const [selectedCarb, setSelectedCarb] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[12]); // Unripe Plantain
  const [selectedDrink, setSelectedDrink] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[18]); // Water

  const [activePicker, setActivePicker] = useState<"veggie" | "protein" | "carb" | "drink" | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  // Aggregated Telemetry
  const totals = useMemo(() => {
    const items = [selectedVeggie, selectedProtein, selectedCarb, selectedDrink];
    const calories = items.reduce((s, i) => s + i.calories, 0);
    const protein = items.reduce((s, i) => s + i.protein, 0);
    const carbs = items.reduce((s, i) => s + i.carbs, 0);
    const fiber = items.reduce((s, i) => s + i.fiber, 0);
    const sodium = items.reduce((s, i) => s + i.sodium, 0);
    const potassium = items.reduce((s, i) => s + i.potassium, 0);

    const isHighGi = selectedCarb.gi === "high";
    const kNaRatio = (potassium / Math.max(1, sodium)).toFixed(1);

    // Glycemic prediction status
    let glycemicStatus: { label: string; color: string; desc: string } = {
      label: "🟢 Flat Glycemic Curve (Optimal)",
      color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300",
      desc: "50% leafy greens + low-GI swallow creates an optimal viscous fiber barrier.",
    };

    if (isHighGi && fiber < 6) {
      glycemicStatus = {
        label: "🔴 Moderate-High Spike Risk",
        color: "text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300",
        desc: `${selectedCarb.name} hydrolyzes quickly. Consider swapping to Unripe Plantain or Amala.`,
      };
    } else if (isHighGi) {
      glycemicStatus = {
        label: "🟡 Buffered Glycemic Curve",
        color: "text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300",
        desc: `High GI carb is partially buffered by ${selectedVeggie.name}'s soluble fiber.`,
      };
    }

    return {
      calories,
      protein,
      carbs,
      fiber,
      sodium,
      potassium,
      kNaRatio,
      glycemicStatus,
    };
  }, [selectedVeggie, selectedProtein, selectedCarb, selectedDrink]);

  const handleRandomize = () => {
    soundEffects.playTactileTick();
    triggerHaptic("light");
    const veggies = AFRICAN_PLATE_DATABASE.filter((i) => i.category === "veggie");
    const proteins = AFRICAN_PLATE_DATABASE.filter((i) => i.category === "protein");
    const carbs = AFRICAN_PLATE_DATABASE.filter((i) => i.category === "carb");
    const drinks = AFRICAN_PLATE_DATABASE.filter((i) => i.category === "drink");

    setSelectedVeggie(veggies[Math.floor(Math.random() * veggies.length)]);
    setSelectedProtein(proteins[Math.floor(Math.random() * proteins.length)]);
    setSelectedCarb(carbs[Math.floor(Math.random() * carbs.length)]);
    setSelectedDrink(drinks[Math.floor(Math.random() * drinks.length)]);

    toast.info("Generated a new Chef's Balanced African Plate! 🍲");
  };

  const handleLogMeal = async () => {
    try {
      setIsLogging(true);
      triggerHaptic("medium");
      soundEffects.playSuccessJingle();

      const mealName = `9-Inch Plate: ${selectedVeggie.name} + ${selectedProtein.name} + ${selectedCarb.name}`;
      await addMealLog({
        foodName: mealName,
        mealName: mealName,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fiber: totals.fiber,
        sodium_mg: totals.sodium,
        bloodSugarImpact: totals.glycemicStatus.label.includes("Flat") ? "low" : "moderate",
        glycemicLoad: "low",
        notes: `Built via 9-Inch African Diabetes Plate Method. Drink: ${selectedDrink.name}. K:Na: ${totals.kNaRatio}:1`,
      });

      toast.success("Balanced 9-Inch Plate logged to your daily diary! 🥑✨");
      if (onLoggedSuccess) onLoggedSuccess();
    } catch (err) {
      toast.error("Could not record meal log. Please try again.");
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className={`rounded-3xl p-4 sm:p-7 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xl relative overflow-hidden ${className}`}>
      {/* Header with ADA 9-Inch Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 sm:mb-6 pr-8 sm:pr-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950/60 text-[#126778] dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 inline-block">
              ADA Diabetes Plate Method • 9-Inch Format
            </span>
          </div>
          <h3 className="text-sm min-[380px]:text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>The 9-Inch African Diabetes Plate</span>
            <span className="text-lg sm:text-xl">🍲</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tap any quadrant to swap African food sources and observe live glycemic buffering.
          </p>
        </div>

        <button
          onClick={handleRandomize}
          className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
          title="Randomize a balanced combination"
        >
          <RotateCcw size={13} />
          <span>Randomize Plate 🎲</span>
        </button>
      </div>

      {/* Main Interactive 9-Inch Plate & Side Cup Visual */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-5 sm:gap-8 my-3 sm:my-4">
        {/* 9-Inch Plate Circle (Responsive scaling on small screens) */}
        <div className="relative w-56 h-56 min-[380px]:w-64 min-[380px]:h-64 sm:w-72 sm:h-72 rounded-full p-1.5 sm:p-2 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900 border-4 border-slate-300/80 dark:border-zinc-700 shadow-2xl flex items-center justify-center select-none shrink-0">
          {/* Inner Plate Rim */}
          <div className="w-full h-full rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-700 relative overflow-hidden grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-slate-50 dark:bg-zinc-950/60">
            {/* SECTOR 1: 50% Non-Starchy Vegetables (Left Half) */}
            <button
              onClick={() => {
                soundEffects.playBubblePop();
                triggerHaptic("medium");
                setActivePicker("veggie");
              }}
              className="row-span-2 col-span-1 rounded-l-full p-2 min-[380px]:p-3 bg-gradient-to-br from-emerald-50 to-teal-50/90 dark:from-emerald-950/60 dark:to-teal-950/40 border-r-2 border-emerald-300/80 dark:border-emerald-700 hover:brightness-105 active:scale-98 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative group overflow-hidden shadow-xs"
            >
              <div className="absolute top-1.5 left-2 min-[380px]:top-2 min-[380px]:left-3 bg-emerald-600 text-white text-[7.5px] min-[380px]:text-[8.5px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-2xs">
                50% VEGGIES
              </div>
              <span className="text-2xl min-[380px]:text-3xl sm:text-4xl mb-0.5 min-[380px]:mb-1 group-hover:scale-110 transition-transform animate-in zoom-in-50 duration-200">
                {selectedVeggie.emoji}
              </span>
              <span className="text-[10px] min-[380px]:text-[11px] sm:text-xs font-black text-emerald-950 dark:text-emerald-100 leading-tight px-1 line-clamp-2">
                {selectedVeggie.name}
              </span>
              <span className="text-[8.5px] min-[380px]:text-[9.5px] sm:text-[10px] text-emerald-800 dark:text-emerald-300 font-bold mt-0.5">
                🥣 2 Ladles ({selectedVeggie.calories} kcal)
              </span>
              <span className="text-[8px] min-[380px]:text-[8.5px] sm:text-[9px] text-emerald-700/80 dark:text-emerald-400 font-medium">
                Tap to change ⚡
              </span>
            </button>

            {/* SECTOR 2: 25% Lean Protein (Top Right Quarter) */}
            <button
              onClick={() => {
                soundEffects.playBubblePop();
                triggerHaptic("medium");
                setActivePicker("protein");
              }}
              className="col-span-1 row-span-1 rounded-tr-full p-1.5 min-[380px]:p-2.5 bg-gradient-to-br from-amber-50 to-orange-50/90 dark:from-amber-950/60 dark:to-orange-950/40 border-b-2 border-amber-300/80 dark:border-amber-700 hover:brightness-105 active:scale-98 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative group overflow-hidden shadow-xs"
            >
              <div className="absolute top-1 right-2 min-[380px]:top-1.5 min-[380px]:right-3 bg-amber-600 text-white text-[7px] min-[380px]:text-[8px] sm:text-[8.5px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                25% PROTEIN
              </div>
              <span className="text-xl min-[380px]:text-2xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">
                {selectedProtein.emoji}
              </span>
              <span className="text-[9.5px] min-[380px]:text-[10.5px] sm:text-[11px] font-black text-amber-950 dark:text-amber-100 leading-tight truncate max-w-[80px] min-[380px]:max-w-[100px]">
                {selectedProtein.name}
              </span>
              <span className="text-[8px] min-[380px]:text-[9px] sm:text-[9.5px] text-amber-800 dark:text-amber-300 font-bold">
                ✋ 1 Palm ({selectedProtein.calories} kcal)
              </span>
            </button>

            {/* SECTOR 3: 25% Complex Swallow / Carb (Bottom Right Quarter) */}
            <button
              onClick={() => {
                soundEffects.playBubblePop();
                triggerHaptic("medium");
                setActivePicker("carb");
              }}
              className="col-span-1 row-span-1 rounded-br-full p-1.5 min-[380px]:p-2.5 bg-gradient-to-br from-cyan-50 to-sky-50/90 dark:from-cyan-950/60 dark:to-sky-950/40 hover:brightness-105 active:scale-98 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative group overflow-hidden shadow-xs"
            >
              <div className="absolute bottom-1 right-2 min-[380px]:bottom-1.5 min-[380px]:right-3 bg-cyan-700 text-white text-[7px] min-[380px]:text-[8px] sm:text-[8.5px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                25% SWALLOW
              </div>
              <span className="text-xl min-[380px]:text-2xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">
                {selectedCarb.emoji}
              </span>
              <span className="text-[9.5px] min-[380px]:text-[10.5px] sm:text-[11px] font-black text-cyan-950 dark:text-cyan-100 leading-tight truncate max-w-[80px] min-[380px]:max-w-[100px]">
                {selectedCarb.name}
              </span>
              <span className="text-[8px] min-[380px]:text-[9px] sm:text-[9.5px] text-cyan-800 dark:text-cyan-300 font-bold">
                ✊ 1 Fist ({selectedCarb.calories} kcal)
              </span>
            </button>
          </div>
        </div>

        {/* Side Hydration Cup & Telemetry Quick Card */}
        <div className="flex flex-col items-center sm:items-start gap-2.5 sm:gap-3.5 w-full md:w-60">
          {/* 0-Calorie Drink Cup */}
          <button
            onClick={() => {
              soundEffects.playBubblePop();
              triggerHaptic("medium");
              setActivePicker("drink");
            }}
            className="flex items-center gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/50 dark:to-blue-950/40 rounded-2xl border border-sky-200 dark:border-sky-800 hover:brightness-105 transition-all cursor-pointer shadow-xs active:scale-95 w-full"
          >
            <div className="w-10 h-10 min-[380px]:w-12 min-[380px]:h-12 rounded-full bg-sky-500 text-white flex items-center justify-center text-lg min-[380px]:text-xl shadow-sm shrink-0">
              {selectedDrink.emoji}
            </div>
            <div className="text-left min-w-0">
              <span className="text-[8.5px] min-[380px]:text-[9px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider block">
                Side Hydration (0-Calorie)
              </span>
              <span className="text-[11px] min-[380px]:text-xs font-black text-slate-900 dark:text-white block truncate">
                {selectedDrink.name}
              </span>
              <span className="text-[9.5px] min-[380px]:text-[10px] text-slate-500">
                Tap to change beverage 💧
              </span>
            </div>
          </button>

          {/* Quick Macro Breakdown Pills */}
          <div className="grid grid-cols-2 gap-2 w-full text-xs">
            <div className="p-2 min-[380px]:p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
              <span className="text-[9px] min-[380px]:text-[10px] font-bold text-slate-500 block">Total Calories</span>
              <span className="text-xs min-[380px]:text-sm font-black text-slate-900 dark:text-white">
                {totals.calories} <span className="text-[9px] min-[380px]:text-[10px] font-normal text-slate-400">kcal</span>
              </span>
            </div>
            <div className="p-2 min-[380px]:p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
              <span className="text-[9px] min-[380px]:text-[10px] font-bold text-slate-500 block">Fiber Buffer</span>
              <span className="text-xs min-[380px]:text-sm font-black text-emerald-600 dark:text-emerald-400">
                {totals.fiber.toFixed(1)}g <span className="text-[9px] min-[380px]:text-[10px] font-normal text-slate-400">fiber</span>
              </span>
            </div>
            <div className="p-2 min-[380px]:p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
              <span className="text-[9px] min-[380px]:text-[10px] font-bold text-slate-500 block">Lean Protein</span>
              <span className="text-xs min-[380px]:text-sm font-black text-amber-600 dark:text-amber-400">
                {totals.protein}g
              </span>
            </div>
            <div className="p-2 min-[380px]:p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
              <span className="text-[9px] min-[380px]:text-[10px] font-bold text-slate-500 block">K:Na Cardio Ratio</span>
              <span className="text-xs min-[380px]:text-sm font-black text-[#126778] dark:text-teal-300">
                {totals.kNaRatio}:1.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Glycemic Radar Feedback Bar */}
      <div className={`p-3 sm:p-3.5 rounded-2xl border transition-all mt-3 sm:mt-4 mb-4 ${totals.glycemicStatus.color}`}>
        <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
          <Activity size={16} />
          <span>{totals.glycemicStatus.label}</span>
        </div>
        <p className="text-[10.5px] sm:text-[11px] mt-1 opacity-90 leading-relaxed font-medium">
          {totals.glycemicStatus.desc}
        </p>
      </div>

      {/* 🥑 Avo Clinical Scribe Insight Bubble */}
      <div className="bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl p-3 sm:p-3.5 border border-teal-200/70 dark:border-teal-800/50 flex items-start gap-2.5 sm:gap-3 mb-4 sm:mb-5">
        <Mascot size={38} className="shrink-0 mt-0.5" />
        <div className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-black text-[#126778] dark:text-teal-300 block mb-0.5">
            Avo's Diabetes Plate Wisdom:
          </span>
          "By filling 50% of this 9-inch plate with {selectedVeggie.name}, the natural mucilage soluble fibers coat the intestinal wall. Even when you eat {selectedCarb.name}, your glucose release stays smooth and steady!"
        </div>
      </div>

      {/* 1-Tap Log Meal Action Button */}
      <button
        onClick={handleLogMeal}
        disabled={isLogging}
        className="w-full py-3.5 px-4 sm:px-5 bg-gradient-to-r from-[#126778] via-[#0d9488] to-[#0f766e] hover:brightness-110 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Zap size={16} className="text-amber-300" />
        <span>{isLogging ? "Recording Plate to Diary..." : "Log This Balanced 9-Inch Plate ⚡"}</span>
      </button>

      {/* Interactive Food Picker Modal / Bottom Sheet */}
      {activePicker && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5 sm:pb-3 mb-3 sm:mb-4">
              <div>
                <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-[#126778] dark:text-teal-300 tracking-wider">
                  {activePicker === "veggie" && "50% Zone • Leafy Greens & Soups"}
                  {activePicker === "protein" && "25% Zone • Lean Protein & Seafood"}
                  {activePicker === "carb" && "25% Zone • Complex Swallows & Starches"}
                  {activePicker === "drink" && "Hydration • Zero-Calorie Beverages"}
                </span>
                <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mt-0.5">
                  Choose Your African Food Source
                </h4>
              </div>
              <button
                onClick={() => setActivePicker(null)}
                className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {AFRICAN_PLATE_DATABASE.filter((i) => i.category === activePicker).map((item) => {
                const isSelected =
                  (activePicker === "veggie" && selectedVeggie.id === item.id) ||
                  (activePicker === "protein" && selectedProtein.id === item.id) ||
                  (activePicker === "carb" && selectedCarb.id === item.id) ||
                  (activePicker === "drink" && selectedDrink.id === item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundEffects.playBubblePop();
                      triggerHaptic("medium");
                      if (activePicker === "veggie") setSelectedVeggie(item);
                      if (activePicker === "protein") setSelectedProtein(item);
                      if (activePicker === "carb") setSelectedCarb(item);
                      if (activePicker === "drink") setSelectedDrink(item);
                      setActivePicker(null);
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-xs ring-2 ring-teal-500/20"
                        : "bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl sm:text-2xl">{item.emoji}</span>
                        {isSelected && (
                          <span className="p-1 bg-teal-600 text-white rounded-full">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <h5 className="font-black text-xs text-slate-900 dark:text-white leading-tight">
                        {item.name}
                      </h5>
                      <span className="text-[9.5px] sm:text-[10px] text-slate-500 block mt-0.5">
                        {item.portionUnit} · {item.calories} kcal
                      </span>
                    </div>

                    <p className="text-[9px] sm:text-[9.5px] text-slate-600 dark:text-slate-400 mt-1.5 italic line-clamp-2">
                      {item.clinicalNote}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
