import React, { useState, useMemo } from "react";
import {
  Check,
  RotateCcw,
  Activity,
  Zap,
} from "lucide-react";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic } from "../utils/celebration";
import { createMealLog } from "../../lib/api";
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
    name: "Ewedu (Jute)",
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
    name: "Fresh Okra (Ila)",
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
    name: "Efo Riro",
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
    name: "Ugwu Greens",
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
    name: "Kontomire",
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
    clinicalNote: "Traditional dark greens packed with iron and prebiotic fiber.",
  },
  {
    id: "bitterleaf",
    name: "Bitter Leaf",
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
    clinicalNote: "Bioactive peptides support hepatic glycemic regulation.",
  },

  // 🥩 25% Lean Protein & Seafood (1 Palm)
  {
    id: "tilapia",
    name: "Grilled Tilapia",
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
    clinicalNote: "Pure lean protein with 0g carbs, stimulating satiety hormones.",
  },
  {
    id: "mackerel",
    name: "Titus Mackerel",
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
    clinicalNote: "High in marine Omega-3 fatty acids (EPA/DHA).",
  },
  {
    id: "moimoi",
    name: "Steamed Moi-Moi",
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
    name: "Lean Goat Meat",
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
    clinicalNote: "Lower in saturated fat and cholesterol than beef.",
  },
  {
    id: "boiled_eggs",
    name: "2 Boiled Eggs",
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
    clinicalNote: "High biological value protein with choline.",
  },

  // 🍠 25% Complex Swallows & Starchy Carbs (1 Fist)
  {
    id: "unripe_plantain_fufu",
    name: "Unripe Plantain",
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
    clinicalNote: "High in resistant starch that bypasses rapid digestion.",
  },
  {
    id: "amala",
    name: "Amala (Yam Peel)",
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
    clinicalNote: "Retains the fibrous cortex of sun-dried yam skins.",
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
    clinicalNote: "Beta-glucan soluble fibers create a viscous gel.",
  },
  {
    id: "ofada_rice",
    name: "Ofada / Brown Rice",
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
    id: "pounded_yam",
    name: "Pounded Yam",
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
    clinicalNote: "Rapidly hydrolyzed starch. Pair with 2+ ladles of Okra.",
  },

  // 💧 0-Calorie Side Hydration
  {
    id: "water",
    name: "Filtered Water",
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
    clinicalNote: "Zero calories. Hydrates kidneys to facilitate glucose excretion.",
  },
  {
    id: "zobo",
    name: "Sugar-Free Zobo",
    category: "drink",
    portionUnit: "1 Glass (Hibiscus)",
    calories: 5,
    protein: 0,
    carbs: 1,
    fiber: 0,
    sodium: 5,
    potassium: 140,
    gi: "low",
    emoji: "🌺",
    clinicalNote: "Rich in anthocyanins supporting healthy blood pressure.",
  },
  {
    id: "moringa_tea",
    name: "Warm Moringa Tea",
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
    clinicalNote: "Promotes improved cellular glucose uptake.",
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
  const [selectedCarb, setSelectedCarb] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[11]); // Unripe Plantain
  const [selectedDrink, setSelectedDrink] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[16]); // Water

  const [activeCategory, setActiveCategory] = useState<"veggie" | "protein" | "carb" | "drink">("veggie");
  const [isLogging, setIsLogging] = useState(false);

  const veggieList = useMemo(() => AFRICAN_PLATE_DATABASE.filter((i) => i.category === "veggie"), []);
  const proteinList = useMemo(() => AFRICAN_PLATE_DATABASE.filter((i) => i.category === "protein"), []);
  const carbList = useMemo(() => AFRICAN_PLATE_DATABASE.filter((i) => i.category === "carb"), []);
  const drinkList = useMemo(() => AFRICAN_PLATE_DATABASE.filter((i) => i.category === "drink"), []);

  // Cycle food on quadrant tap
  const handleQuadrantClick = (category: "veggie" | "protein" | "carb" | "drink") => {
    soundEffects.playBubblePop();
    triggerHaptic("medium");
    setActiveCategory(category);

    if (category === "veggie") {
      const idx = veggieList.findIndex((i) => i.id === selectedVeggie.id);
      const nextItem = veggieList[(idx + 1) % veggieList.length];
      setSelectedVeggie(nextItem);
      toast.success(`🥬 50% Veggies: Swapped to ${nextItem.name}!`, { duration: 1500 });
    } else if (category === "protein") {
      const idx = proteinList.findIndex((i) => i.id === selectedProtein.id);
      const nextItem = proteinList[(idx + 1) % proteinList.length];
      setSelectedProtein(nextItem);
      toast.success(`🥩 25% Protein: Swapped to ${nextItem.name}!`, { duration: 1500 });
    } else if (category === "carb") {
      const idx = carbList.findIndex((i) => i.id === selectedCarb.id);
      const nextItem = carbList[(idx + 1) % carbList.length];
      setSelectedCarb(nextItem);
      toast.success(`🍠 25% Swallow: Swapped to ${nextItem.name}!`, { duration: 1500 });
    } else if (category === "drink") {
      const idx = drinkList.findIndex((i) => i.id === selectedDrink.id);
      const nextItem = drinkList[(idx + 1) % drinkList.length];
      setSelectedDrink(nextItem);
      toast.success(`💧 Hydration: Swapped to ${nextItem.name}!`, { duration: 1500 });
    }
  };

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

    let glycemicStatus = {
      label: "🟢 Flat Glycemic Curve (Optimal)",
      color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800",
      desc: `50% ${selectedVeggie.name} + low-GI ${selectedCarb.name} creates an optimal viscous fiber barrier.`,
    };

    if (isHighGi && fiber < 6) {
      glycemicStatus = {
        label: "🔴 Moderate Spike Risk (High GI)",
        color: "text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300/80 dark:border-rose-800",
        desc: `${selectedCarb.name} hydrolyzes rapidly. Pair with 2+ ladles of Okra or swap to Unripe Plantain.`,
      };
    } else if (isHighGi) {
      glycemicStatus = {
        label: "🟡 Buffered Glycemic Curve",
        color: "text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/80 dark:border-amber-800",
        desc: `High GI ${selectedCarb.name} is partially buffered by ${selectedVeggie.name}'s soluble fiber.`,
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
    setSelectedVeggie(veggieList[Math.floor(Math.random() * veggieList.length)]);
    setSelectedProtein(proteinList[Math.floor(Math.random() * proteinList.length)]);
    setSelectedCarb(carbList[Math.floor(Math.random() * carbList.length)]);
    setSelectedDrink(drinkList[Math.floor(Math.random() * drinkList.length)]);
    toast.info("Generated a new Chef's Balanced African Plate! 🍲");
  };

  const handleLogMeal = async () => {
    try {
      setIsLogging(true);
      triggerHaptic("medium");
      soundEffects.playSuccessJingle();

      const mealName = `9-Inch Plate: ${selectedVeggie.name} + ${selectedProtein.name} + ${selectedCarb.name}`;
      await createMealLog({
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

  // Active items for the selected category chips below
  const activeChips = useMemo(() => {
    if (activeCategory === "veggie") return veggieList;
    if (activeCategory === "protein") return proteinList;
    if (activeCategory === "carb") return carbList;
    return drinkList;
  }, [activeCategory, veggieList, proteinList, carbList, drinkList]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
          👉 <strong>Tap any quadrant on the plate</strong> to swap foods instantly!
        </p>
        <button
          onClick={handleRandomize}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
          title="Randomize combination"
        >
          <RotateCcw size={12} />
          <span>Randomize 🎲</span>
        </button>
      </div>

      {/* 🍽️ THE 9-INCH CIRCULAR PLATE (Geometrically perfected with zero edge clipping) */}
      <div className="py-2 flex justify-center">
        <div className="relative w-[260px] h-[260px] min-[380px]:w-[280px] min-[380px]:h-[280px] sm:w-[310px] sm:h-[310px] rounded-full p-2 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900 border-4 border-slate-300/90 dark:border-zinc-700 shadow-xl flex items-center justify-center select-none shrink-0 mx-auto">
          {/* Inner Plate Rim */}
          <div className="w-full h-full rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-700 overflow-hidden grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-slate-50 dark:bg-zinc-950/60">
            
            {/* 🥬 SECTOR 1: 50% Non-Starchy Vegetables (Left Half) */}
            <button
              type="button"
              onClick={() => handleQuadrantClick("veggie")}
              className={`row-span-2 col-span-1 rounded-l-full px-2 py-3 bg-gradient-to-br from-emerald-50 to-teal-50/90 dark:from-emerald-950/70 dark:to-teal-950/50 border-r border-emerald-300 dark:border-emerald-800 transition-all flex flex-col items-center justify-center text-center cursor-pointer group active:scale-95 ${
                activeCategory === "veggie" ? "ring-2 ring-emerald-500/80 brightness-105" : "hover:brightness-105"
              }`}
            >
              <span className="inline-block text-[8px] min-[380px]:text-[8.5px] font-black px-2 py-0.5 rounded-full bg-emerald-700 text-white shadow-xs mb-1">
                🥬 50% VEGGIES
              </span>

              <span className="text-3xl min-[380px]:text-4xl my-0.5 group-hover:scale-110 transition-transform drop-shadow-xs">
                {selectedVeggie.emoji}
              </span>

              <span className="text-[10px] min-[380px]:text-[11px] font-black text-emerald-950 dark:text-emerald-100 leading-tight px-1 max-w-[110px] line-clamp-2">
                {selectedVeggie.name}
              </span>

              <span className="text-[7.5px] min-[380px]:text-[8px] text-emerald-800 dark:text-emerald-300 font-bold mt-1 bg-white/90 dark:bg-zinc-900/90 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                🥣 2 Ladles ({selectedVeggie.calories} kcal)
              </span>

              <span className="text-[7px] text-emerald-600 dark:text-emerald-400 font-extrabold mt-1">
                Tap to swap 🔄
              </span>
            </button>

            {/* 🥩 SECTOR 2: 25% Lean Protein (Top Right Quarter - Positioned away from upper-right curve) */}
            <button
              type="button"
              onClick={() => handleQuadrantClick("protein")}
              className={`col-span-1 row-span-1 rounded-tr-full px-1.5 pt-3 pb-1 bg-gradient-to-br from-amber-50 to-orange-50/90 dark:from-amber-950/70 dark:to-orange-950/50 border-b border-amber-300 dark:border-amber-800 transition-all flex flex-col items-center justify-center text-center cursor-pointer group active:scale-95 ${
                activeCategory === "protein" ? "ring-2 ring-amber-500/80 brightness-105" : "hover:brightness-105"
              }`}
            >
              <span className="inline-block text-[7px] min-[380px]:text-[7.5px] font-black px-1.5 py-0.2 rounded-full bg-amber-700 text-white shadow-xs mb-0.5">
                🥩 25% PROTEIN
              </span>

              <span className="text-xl min-[380px]:text-2xl my-0.5 group-hover:scale-110 transition-transform">
                {selectedProtein.emoji}
              </span>

              <span className="text-[8.5px] min-[380px]:text-[9.5px] font-black text-amber-950 dark:text-amber-100 leading-tight px-0.5 max-w-[90px] truncate">
                {selectedProtein.name}
              </span>

              <span className="text-[7px] text-amber-800 dark:text-amber-300 font-bold mt-0.5 bg-white/90 dark:bg-zinc-900/90 px-1 py-0.2 rounded-full border border-amber-200 dark:border-amber-800">
                ✋ 1 Palm ({selectedProtein.calories} kcal)
              </span>
            </button>

            {/* 🍠 SECTOR 3: 25% Complex Swallow / Carb (Bottom Right Quarter - Positioned away from lower-right curve) */}
            <button
              type="button"
              onClick={() => handleQuadrantClick("carb")}
              className={`col-span-1 row-span-1 rounded-br-full px-1.5 pt-1 pb-3 bg-gradient-to-br from-cyan-50 to-sky-50/90 dark:from-cyan-950/70 dark:to-sky-950/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group active:scale-95 ${
                activeCategory === "carb" ? "ring-2 ring-cyan-500/80 brightness-105" : "hover:brightness-105"
              }`}
            >
              <span className="inline-block text-[7px] min-[380px]:text-[7.5px] font-black px-1.5 py-0.2 rounded-full bg-cyan-800 text-white shadow-xs mb-0.5">
                🍠 25% SWALLOW
              </span>

              <span className="text-xl min-[380px]:text-2xl my-0.5 group-hover:scale-110 transition-transform">
                {selectedCarb.emoji}
              </span>

              <span className="text-[8.5px] min-[380px]:text-[9.5px] font-black text-cyan-950 dark:text-cyan-100 leading-tight px-0.5 max-w-[90px] truncate">
                {selectedCarb.name}
              </span>

              <span className="text-[7px] text-cyan-800 dark:text-cyan-300 font-bold mt-0.5 bg-white/90 dark:bg-zinc-900/90 px-1 py-0.2 rounded-full border border-cyan-200 dark:border-cyan-800">
                ✊ 1 Fist ({selectedCarb.calories} kcal)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 💧 Side Hydration (Clickable Pill) */}
      <button
        type="button"
        onClick={() => handleQuadrantClick("drink")}
        className={`w-full max-w-sm mx-auto flex items-center justify-between p-2.5 bg-sky-50/90 dark:bg-sky-950/50 rounded-2xl border border-sky-200 dark:border-sky-800 transition-all cursor-pointer active:scale-98 ${
          activeCategory === "drink" ? "ring-2 ring-sky-500" : "hover:brightness-105"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedDrink.emoji}</span>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase text-sky-800 dark:text-sky-300 block">
              💧 Side Hydration (0-Calorie)
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              {selectedDrink.name} ({selectedDrink.calories} kcal)
            </span>
          </div>
        </div>
        <span className="text-[9px] font-bold text-sky-700 dark:text-sky-400 bg-white/80 dark:bg-zinc-900 px-2 py-1 rounded-xl">
          Tap to swap 🔄
        </span>
      </button>

      {/* 🌟 1-TAP INLINE FOOD CHIPS (Simple & Direct) */}
      <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            {activeCategory === "veggie" && "🥬 50% Veggies & Soups"}
            {activeCategory === "protein" && "🥩 25% Lean Proteins"}
            {activeCategory === "carb" && "🍠 25% Swallows & Carbs"}
            {activeCategory === "drink" && "💧 Hydration Drinks"}
          </span>
          {/* Category Tabs */}
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <button
              onClick={() => setActiveCategory("veggie")}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${activeCategory === "veggie" ? "bg-emerald-600 text-white" : "text-slate-500"}`}
            >
              Veggies
            </button>
            <button
              onClick={() => setActiveCategory("protein")}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${activeCategory === "protein" ? "bg-amber-600 text-white" : "text-slate-500"}`}
            >
              Protein
            </button>
            <button
              onClick={() => setActiveCategory("carb")}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${activeCategory === "carb" ? "bg-cyan-700 text-white" : "text-slate-500"}`}
            >
              Swallow
            </button>
            <button
              onClick={() => setActiveCategory("drink")}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${activeCategory === "drink" ? "bg-sky-600 text-white" : "text-slate-500"}`}
            >
              Drink
            </button>
          </div>
        </div>

        {/* Food chips grid */}
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 gap-1.5">
          {activeChips.map((item) => {
            const isSelected =
              (activeCategory === "veggie" && selectedVeggie.id === item.id) ||
              (activeCategory === "protein" && selectedProtein.id === item.id) ||
              (activeCategory === "carb" && selectedCarb.id === item.id) ||
              (activeCategory === "drink" && selectedDrink.id === item.id);

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playBubblePop();
                  triggerHaptic("medium");
                  if (activeCategory === "veggie") setSelectedVeggie(item);
                  if (activeCategory === "protein") setSelectedProtein(item);
                  if (activeCategory === "carb") setSelectedCarb(item);
                  if (activeCategory === "drink") setSelectedDrink(item);
                  toast.success(`Selected ${item.name}! Plate updated ✨`);
                }}
                className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between active:scale-95 ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-teal-500 ring-2 ring-teal-500/30 shadow-xs"
                    : "bg-white/80 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-700 hover:bg-white"
                }`}
              >
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-[10.5px] font-black text-slate-900 dark:text-white truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[8.5px] text-slate-500 block mt-0.5">
                    {item.calories} kcal
                  </span>
                </div>
                {isSelected && (
                  <span className="p-0.5 bg-teal-600 text-white rounded-full shrink-0">
                    <Check size={9} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetry Quick Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
          <span className="text-[9.5px] font-bold text-slate-500 block">Total Calories</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">
            {totals.calories} <span className="text-[9.5px] font-normal text-slate-400">kcal</span>
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
          <span className="text-[9.5px] font-bold text-slate-500 block">Fiber Buffer</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {totals.fiber.toFixed(1)}g
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
          <span className="text-[9.5px] font-bold text-slate-500 block">Lean Protein</span>
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">
            {totals.protein}g
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
          <span className="text-[9.5px] font-bold text-slate-500 block">K:Na Ratio</span>
          <span className="text-sm font-black text-[#126778] dark:text-teal-300">
            {totals.kNaRatio}:1.0
          </span>
        </div>
      </div>

      {/* Live Glycemic Feedback Bar */}
      <div className={`p-3 rounded-2xl border transition-all ${totals.glycemicStatus.color}`}>
        <div className="flex items-center gap-2 font-black text-xs">
          <Activity size={15} />
          <span>{totals.glycemicStatus.label}</span>
        </div>
        <p className="text-[10.5px] mt-0.5 opacity-90 leading-relaxed font-medium">
          {totals.glycemicStatus.desc}
        </p>
      </div>

      {/* 🥑 Avo Advice */}
      <div className="bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl p-3 border border-teal-200/70 dark:border-teal-800/50 flex items-start gap-2.5">
        <Mascot size={36} className="shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-black text-[#126778] dark:text-teal-300 block mb-0.5">
            Avo's Plate Wisdom:
          </span>
          "Filling 50% of this 9-inch plate with {selectedVeggie.name} provides natural viscous fibers to coat the gut wall and blunt glucose spikes from {selectedCarb.name}!"
        </div>
      </div>

      {/* 1-Tap Log Meal Action Button */}
      <button
        onClick={handleLogMeal}
        disabled={isLogging}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-[#126778] via-[#0d9488] to-[#0f766e] hover:brightness-110 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Zap size={16} className="text-amber-300" />
        <span>{isLogging ? "Recording Plate to Diary..." : "Log This Balanced 9-Inch Plate ⚡"}</span>
      </button>
    </div>
  );
}
