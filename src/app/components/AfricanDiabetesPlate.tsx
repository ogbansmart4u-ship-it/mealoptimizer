import React, { useState, useMemo } from "react";
import {
  Check,
  RotateCcw,
  Activity,
  Zap,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  RefreshCw,
  Heart,
  Droplet,
  Flame,
  Layers,
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
    name: "Ugwu (Pumpkin Leaves)",
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
    name: "Kontomire (Cocoyam Greens)",
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
    name: "Bitter Leaf Soup (Onugbu)",
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
  {
    id: "afang",
    name: "Afang Soup (Okazi Greens)",
    category: "veggie",
    portionUnit: "2 Ladles (~50% Plate)",
    calories: 75,
    protein: 4,
    carbs: 4,
    fiber: 5.1,
    sodium: 65,
    potassium: 480,
    gi: "low",
    emoji: "🥣",
    clinicalNote: "Dense insoluble lignins slow intestinal carbohydrate transit time.",
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
    id: "suya_chicken",
    name: "Grilled Pepper Chicken",
    category: "protein",
    portionUnit: "1 Palm (~25% Plate)",
    calories: 160,
    protein: 27,
    carbs: 1,
    fiber: 0.5,
    sodium: 110,
    potassium: 360,
    gi: "low",
    emoji: "🍗",
    clinicalNote: "Skinless poultry seasoned with ginger, garlic, and antioxidant chili.",
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
    name: "Amala (Yam Peel Fiber)",
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
    name: "Pounded Yam (High-GI)",
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
    name: "Warm Moringa Brew",
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
  {
    id: "lemon_water",
    name: "Lime & Cucumber Water",
    category: "drink",
    portionUnit: "1 Glass (Infused)",
    calories: 4,
    protein: 0,
    carbs: 1,
    fiber: 0,
    sodium: 3,
    potassium: 80,
    gi: "low",
    emoji: "🥒",
    clinicalNote: "Citric acid and polyphenols stimulate digestive enzymatic efficiency.",
  },
];

export interface PresetMeal {
  name: string;
  flag: string;
  tagline: string;
  veggieId: string;
  proteinId: string;
  carbId: string;
  drinkId: string;
}

export const PRESET_AFRICAN_PLATES: PresetMeal[] = [
  {
    name: "Lagos Glycemic Shield",
    flag: "🇳🇬",
    tagline: "Ewedu Mucilage + Tilapia + Plantain",
    veggieId: "ewedu",
    proteinId: "tilapia",
    carbId: "unripe_plantain_fufu",
    drinkId: "zobo",
  },
  {
    name: "Calabar Cardio Guard",
    flag: "🌿",
    tagline: "Ugwu Potassium + Mackerel Omega-3 + Amala",
    veggieId: "ugwu",
    proteinId: "mackerel",
    carbId: "amala",
    drinkId: "water",
  },
  {
    name: "Accra Fiber Booster",
    flag: "🇬🇭",
    tagline: "Kontomire + Moi-Moi Legume + Oat Fufu",
    veggieId: "kontomire",
    proteinId: "moimoi",
    carbId: "oat_fufu",
    drinkId: "moringa_tea",
  },
  {
    name: "Ibadan Okra Satiety",
    flag: "🥗",
    tagline: "Viscous Okra + Lean Goat Meat + Boiled Plantain",
    veggieId: "okra",
    proteinId: "goat_meat",
    carbId: "boiled_plantain",
    drinkId: "lemon_water",
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
  const [selectedProtein, setSelectedProtein] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[7]); // Tilapia
  const [selectedCarb, setSelectedCarb] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[13]); // Unripe Plantain
  const [selectedDrink, setSelectedDrink] = useState<FoodOption>(AFRICAN_PLATE_DATABASE[19]); // Water

  // Active highlighted sector for immediate in-place swapping
  const [activeSector, setActiveSector] = useState<"veggie" | "protein" | "carb" | "drink">("veggie");
  const [isLogging, setIsLogging] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>("Lagos Glycemic Shield");

  // Filter lists by category
  const veggieList = useMemo(() => AFRICAN_PLATE_DATABASE.filter((i) => i.category === "veggie"), []);
  const proteinList = useMemo(() => AFRICAN_PLATE_DATABASE.filter((i) => i.category === "protein"), []);
  const carbList = useMemo(() => AFRICAN_PLATE_DATABASE.filter((i) => i.category === "carb"), []);
  const drinkList = useMemo(() => AFRICAN_PLATE_DATABASE.filter((i) => i.category === "drink"), []);

  // Cycle food on direct quadrant tap or arrow clicks
  const cycleFood = (category: "veggie" | "protein" | "carb" | "drink", direction: 1 | -1 = 1) => {
    soundEffects.playBubblePop();
    triggerHaptic("medium");
    setActiveSector(category);
    setActivePreset(null);

    if (category === "veggie") {
      const idx = veggieList.findIndex((i) => i.id === selectedVeggie.id);
      const nextIdx = (idx + direction + veggieList.length) % veggieList.length;
      const nextItem = veggieList[nextIdx];
      setSelectedVeggie(nextItem);
      toast.success(`🥬 50% Veggies: ${nextItem.name}`, { duration: 1500 });
    } else if (category === "protein") {
      const idx = proteinList.findIndex((i) => i.id === selectedProtein.id);
      const nextIdx = (idx + direction + proteinList.length) % proteinList.length;
      const nextItem = proteinList[nextIdx];
      setSelectedProtein(nextItem);
      toast.success(`🥩 25% Protein: ${nextItem.name}`, { duration: 1500 });
    } else if (category === "carb") {
      const idx = carbList.findIndex((i) => i.id === selectedCarb.id);
      const nextIdx = (idx + direction + carbList.length) % carbList.length;
      const nextItem = carbList[nextIdx];
      setSelectedCarb(nextItem);
      toast.success(`🍠 25% Swallow: ${nextItem.name}`, { duration: 1500 });
    } else if (category === "drink") {
      const idx = drinkList.findIndex((i) => i.id === selectedDrink.id);
      const nextIdx = (idx + direction + drinkList.length) % drinkList.length;
      const nextItem = drinkList[nextIdx];
      setSelectedDrink(nextItem);
      toast.success(`💧 Hydration: ${nextItem.name}`, { duration: 1500 });
    }
  };

  // Load Preset
  const handleLoadPreset = (preset: PresetMeal) => {
    soundEffects.playSuccessJingle();
    triggerHaptic("medium");
    setActivePreset(preset.name);

    const v = AFRICAN_PLATE_DATABASE.find((i) => i.id === preset.veggieId);
    const p = AFRICAN_PLATE_DATABASE.find((i) => i.id === preset.proteinId);
    const c = AFRICAN_PLATE_DATABASE.find((i) => i.id === preset.carbId);
    const d = AFRICAN_PLATE_DATABASE.find((i) => i.id === preset.drinkId);

    if (v) setSelectedVeggie(v);
    if (p) setSelectedProtein(p);
    if (c) setSelectedCarb(c);
    if (d) setSelectedDrink(d);

    toast.success(`Loaded ${preset.flag} ${preset.name}! ✨`);
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

    // Glycemic prediction status
    let glycemicStatus: { label: string; color: string; desc: string } = {
      label: "🟢 Flat Glycemic Curve (Optimal)",
      color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800",
      desc: `50% ${selectedVeggie.name} + low-GI ${selectedCarb.name} creates an optimal viscous fiber barrier blunting glucose spike.`,
    };

    if (isHighGi && fiber < 6) {
      glycemicStatus = {
        label: "🔴 Moderate Spike Risk (High-GI Starch)",
        color: "text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300/80 dark:border-rose-800",
        desc: `${selectedCarb.name} hydrolyzes rapidly into glucose. Consider pairing with 2+ ladles of Okra or swapping to Unripe Plantain.`,
      };
    } else if (isHighGi) {
      glycemicStatus = {
        label: "🟡 Buffered Glycemic Curve",
        color: "text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300/80 dark:border-amber-800",
        desc: `High-GI ${selectedCarb.name} is partially buffered by ${selectedVeggie.name}'s soluble fiber network.`,
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
    setActivePreset(null);

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

  // Category metadata
  const sectorMeta = {
    veggie: {
      title: "🥬 50% Non-Starchy Leafy Soups & Vegetables",
      hint: "Select 2 cooking ladles of viscous greens to buffer glucose absorption.",
      color: "border-emerald-500 ring-4 ring-emerald-400/30",
    },
    protein: {
      title: "🥩 25% Lean Protein & Clean Seafood",
      hint: "Select 1 palm-sized portion to trigger GLP-1 satiety and preserve muscle mass.",
      color: "border-amber-500 ring-4 ring-amber-400/30",
    },
    carb: {
      title: "🍠 25% Complex Swallows & Starches",
      hint: "Select 1 closed fist of low-GI resistant starch to maintain steady cellular energy.",
      color: "border-cyan-500 ring-4 ring-cyan-400/30",
    },
    drink: {
      title: "💧 Side Hydration (0-Calorie)",
      hint: "Pure water or traditional herbal infusions to hydrate kidneys and support glucose excretion.",
      color: "border-sky-500 ring-4 ring-sky-400/30",
    },
  };

  const activeOptions = useMemo(() => {
    if (activeSector === "veggie") return veggieList;
    if (activeSector === "protein") return proteinList;
    if (activeSector === "carb") return carbList;
    return drinkList;
  }, [activeSector, veggieList, proteinList, carbList, drinkList]);

  // Current index in each category
  const veggieIndex = veggieList.findIndex((i) => i.id === selectedVeggie.id) + 1;
  const proteinIndex = proteinList.findIndex((i) => i.id === selectedProtein.id) + 1;
  const carbIndex = carbList.findIndex((i) => i.id === selectedCarb.id) + 1;
  const drinkIndex = drinkList.findIndex((i) => i.id === selectedDrink.id) + 1;

  return (
    <div className={`rounded-3xl p-4 sm:p-7 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xl relative overflow-hidden ${className}`}>
      {/* Header with ADA 9-Inch Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 sm:mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-950/60 text-[#126778] dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 inline-block">
              ADA Diabetes Plate Method • 9-Inch Circular Studio
            </span>
          </div>
          <h3 className="text-sm min-[380px]:text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>The Interactive 9-Inch African Plate</span>
            <span className="text-lg sm:text-xl">🍲</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <strong>Tap directly on any section</strong> of the plate or use the arrow buttons to cycle African dishes!
          </p>
        </div>

        <button
          onClick={handleRandomize}
          className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
          title="Randomize a balanced combination"
        >
          <RotateCcw size={13} />
          <span>Randomize 🎲</span>
        </button>
      </div>

      {/* 🌟 1-TAP CHEF'S BALANCED PRESET PILLS */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={13} className="text-amber-500" />
          <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Quick 1-Tap Balanced Presets:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_AFRICAN_PLATES.map((preset) => {
            const isCurrent = activePreset === preset.name;
            return (
              <button
                key={preset.name}
                onClick={() => handleLoadPreset(preset)}
                className={`p-2 sm:p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 flex flex-col justify-between ${
                  isCurrent
                    ? "bg-teal-50 dark:bg-teal-950/50 border-teal-500 ring-2 ring-teal-500/30 shadow-xs"
                    : "bg-slate-50/80 dark:bg-zinc-800/60 border-slate-200/80 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 text-xs font-black text-slate-900 dark:text-white">
                    <span>{preset.flag}</span>
                    <span className="truncate">{preset.name}</span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {preset.tagline}
                  </p>
                </div>
                <span className={`text-[8.5px] font-bold mt-1.5 ${isCurrent ? "text-teal-700 dark:text-teal-300" : "text-slate-400"}`}>
                  {isCurrent ? "● Loaded" : "Tap to load ⚡"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🍽️ MAIN INTERACTIVE 9-INCH CIRCULAR PLATE & SIDE HYDRATION */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8 my-3">
        {/* 9-Inch Circular Plate Geometry */}
        <div className="relative w-72 h-72 min-[380px]:w-80 min-[380px]:h-80 sm:w-88 sm:h-88 rounded-full p-2.5 bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900 border-4 border-slate-300/80 dark:border-zinc-700 shadow-2xl flex items-center justify-center select-none shrink-0">
          {/* Inner Plate Rim */}
          <div className="w-full h-full rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-700 relative overflow-hidden grid grid-cols-2 grid-rows-2 gap-1.5 p-1 bg-slate-50 dark:bg-zinc-950/60">
            
            {/* 🥬 SECTOR 1: 50% Non-Starchy Vegetables (Left Half) */}
            <div
              className={`row-span-2 col-span-1 rounded-l-full p-2 sm:p-3 bg-gradient-to-br from-emerald-50 to-teal-50/90 dark:from-emerald-950/60 dark:to-teal-950/40 border-r-2 border-emerald-300/80 dark:border-emerald-700 transition-all flex flex-col items-center justify-between text-center shadow-xs relative overflow-hidden group ${
                activeSector === "veggie" ? "ring-4 ring-emerald-500/60 scale-[1.02] z-10 brightness-105" : ""
              }`}
            >
              {/* Badge & Category */}
              <div className="w-full flex items-center justify-center">
                <span className={`text-[8px] min-[380px]:text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs transition-all ${
                  activeSector === "veggie" ? "bg-emerald-700 text-white ring-2 ring-white" : "bg-emerald-600 text-white"
                }`}>
                  🥬 50% VEGGIES ({veggieIndex}/{veggieList.length})
                </span>
              </div>

              {/* Main Clickable Area to Cycle */}
              <button
                type="button"
                onClick={() => cycleFood("veggie", 1)}
                className="w-full flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform my-auto"
                title="Click to cycle next vegetable soup"
              >
                <span className="text-3xl min-[380px]:text-4xl sm:text-5xl my-0.5 group-hover:scale-110 transition-transform drop-shadow-sm">
                  {selectedVeggie.emoji}
                </span>

                <span className="text-[11px] min-[380px]:text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-100 leading-tight px-1 line-clamp-2">
                  {selectedVeggie.name}
                </span>

                <span className="text-[8px] min-[380px]:text-[9px] text-emerald-800 dark:text-emerald-300 font-bold mt-0.5 bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                  🥣 2 Ladles ({selectedVeggie.calories} kcal)
                </span>
              </button>

              {/* In-Quadrant Stepper Arrows */}
              <div className="w-full flex items-center justify-between px-1 mt-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleFood("veggie", -1);
                  }}
                  className="p-1 rounded-full bg-white/90 hover:bg-emerald-200 text-emerald-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs shadow-xs cursor-pointer active:scale-90"
                  title="Previous vegetable"
                >
                  <ChevronLeft size={12} />
                </button>
                <span
                  onClick={() => cycleFood("veggie", 1)}
                  className="text-[7.5px] min-[380px]:text-[8.5px] text-emerald-800 dark:text-emerald-300 font-extrabold cursor-pointer hover:underline flex items-center gap-0.5"
                >
                  <span>Tap to swap 🔄</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleFood("veggie", 1);
                  }}
                  className="p-1 rounded-full bg-white/90 hover:bg-emerald-200 text-emerald-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs shadow-xs cursor-pointer active:scale-90"
                  title="Next vegetable"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* 🥩 SECTOR 2: 25% Lean Protein (Top Right Quarter) */}
            <div
              className={`col-span-1 row-span-1 rounded-tr-full p-2 sm:p-2.5 bg-gradient-to-br from-amber-50 to-orange-50/90 dark:from-amber-950/60 dark:to-orange-950/40 border-b-2 border-amber-300/80 dark:border-amber-700 transition-all flex flex-col items-center justify-between text-center shadow-xs relative overflow-hidden group ${
                activeSector === "protein" ? "ring-4 ring-amber-500/60 scale-[1.02] z-10 brightness-105" : ""
              }`}
            >
              {/* Badge & Category */}
              <div className="w-full flex items-center justify-center">
                <span className={`text-[7.5px] min-[380px]:text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-2xs transition-all ${
                  activeSector === "protein" ? "bg-amber-700 text-white ring-2 ring-white" : "bg-amber-600 text-white"
                }`}>
                  🥩 25% PROTEIN ({proteinIndex}/{proteinList.length})
                </span>
              </div>

              {/* Main Clickable Area to Cycle */}
              <button
                type="button"
                onClick={() => cycleFood("protein", 1)}
                className="w-full flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform my-auto"
                title="Click to cycle next protein"
              >
                <span className="text-2xl min-[380px]:text-3xl my-0.5 group-hover:scale-110 transition-transform">
                  {selectedProtein.emoji}
                </span>

                <span className="text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs font-black text-amber-950 dark:text-amber-100 leading-tight px-0.5 max-w-[110px] truncate">
                  {selectedProtein.name}
                </span>

                <span className="text-[7px] min-[380px]:text-[8px] text-amber-800 dark:text-amber-300 font-bold mt-0.5 bg-white/80 dark:bg-zinc-900/80 px-1.5 py-0.2 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                  ✋ 1 Palm ({selectedProtein.calories} kcal)
                </span>
              </button>

              {/* In-Quadrant Stepper Arrows */}
              <div className="w-full flex items-center justify-between px-1 mt-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleFood("protein", -1);
                  }}
                  className="p-0.5 rounded-full bg-white/90 hover:bg-amber-200 text-amber-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-xs cursor-pointer active:scale-90"
                  title="Previous protein"
                >
                  <ChevronLeft size={10} />
                </button>
                <span
                  onClick={() => cycleFood("protein", 1)}
                  className="text-[7px] min-[380px]:text-[7.5px] text-amber-800 dark:text-amber-300 font-extrabold cursor-pointer hover:underline"
                >
                  Tap 🔄
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleFood("protein", 1);
                  }}
                  className="p-0.5 rounded-full bg-white/90 hover:bg-amber-200 text-amber-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-xs cursor-pointer active:scale-90"
                  title="Next protein"
                >
                  <ChevronRight size={10} />
                </button>
              </div>
            </div>

            {/* 🍠 SECTOR 3: 25% Complex Swallow / Carb (Bottom Right Quarter) */}
            <div
              className={`col-span-1 row-span-1 rounded-br-full p-2 sm:p-2.5 bg-gradient-to-br from-cyan-50 to-sky-50/90 dark:from-cyan-950/60 dark:to-sky-950/40 transition-all flex flex-col items-center justify-between text-center shadow-xs relative overflow-hidden group ${
                activeSector === "carb" ? "ring-4 ring-cyan-500/60 scale-[1.02] z-10 brightness-105" : ""
              }`}
            >
              {/* Badge & Category */}
              <div className="w-full flex items-center justify-center">
                <span className={`text-[7.5px] min-[380px]:text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-2xs transition-all ${
                  activeSector === "carb" ? "bg-cyan-800 text-white ring-2 ring-white" : "bg-cyan-700 text-white"
                }`}>
                  🍠 25% SWALLOW ({carbIndex}/{carbList.length})
                </span>
              </div>

              {/* Main Clickable Area to Cycle */}
              <button
                type="button"
                onClick={() => cycleFood("carb", 1)}
                className="w-full flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform my-auto"
                title="Click to cycle next swallow"
              >
                <span className="text-2xl min-[380px]:text-3xl my-0.5 group-hover:scale-110 transition-transform">
                  {selectedCarb.emoji}
                </span>

                <span className="text-[9.5px] min-[380px]:text-[10.5px] sm:text-xs font-black text-cyan-950 dark:text-cyan-100 leading-tight px-0.5 max-w-[110px] truncate">
                  {selectedCarb.name}
                </span>

                <span className="text-[7px] min-[380px]:text-[8px] text-cyan-800 dark:text-cyan-300 font-bold mt-0.5 bg-white/80 dark:bg-zinc-900/80 px-1.5 py-0.2 rounded-full border border-cyan-200/60 dark:border-cyan-800/40">
                  ✊ 1 Fist ({selectedCarb.calories} kcal)
                </span>
              </button>

              {/* In-Quadrant Stepper Arrows */}
              <div className="w-full flex items-center justify-between px-1 mt-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleFood("carb", -1);
                  }}
                  className="p-0.5 rounded-full bg-white/90 hover:bg-cyan-200 text-cyan-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-xs cursor-pointer active:scale-90"
                  title="Previous swallow"
                >
                  <ChevronLeft size={10} />
                </button>
                <span
                  onClick={() => cycleFood("carb", 1)}
                  className="text-[7px] min-[380px]:text-[7.5px] text-cyan-800 dark:text-cyan-300 font-extrabold cursor-pointer hover:underline"
                >
                  Tap 🔄
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleFood("carb", 1);
                  }}
                  className="p-0.5 rounded-full bg-white/90 hover:bg-cyan-200 text-cyan-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-xs cursor-pointer active:scale-90"
                  title="Next swallow"
                >
                  <ChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 💧 SIDE HYDRATION & TELEMETRY CONTROL PANEL */}
        <div className="flex flex-col items-center sm:items-start gap-2.5 sm:gap-3 w-full md:w-64">
          {/* 0-Calorie Drink Card (Clickable to Cycle) */}
          <div
            className={`p-3 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/50 dark:to-blue-950/40 rounded-2xl border transition-all shadow-xs w-full ${
              activeSector === "drink" ? "border-sky-500 ring-4 ring-sky-400/40 scale-[1.02]" : "border-sky-200 dark:border-sky-800"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8.5px] sm:text-[9px] font-black text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                💧 Side Hydration ({drinkIndex}/{drinkList.length})
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => cycleFood("drink", -1)}
                  className="p-1 rounded-lg bg-white dark:bg-zinc-800 text-sky-800 dark:text-sky-300 shadow-xs cursor-pointer active:scale-90"
                >
                  <ChevronLeft size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => cycleFood("drink", 1)}
                  className="p-1 rounded-lg bg-white dark:bg-zinc-800 text-sky-800 dark:text-sky-300 shadow-xs cursor-pointer active:scale-90"
                >
                  <ChevronRight size={11} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => cycleFood("drink", 1)}
              className="flex items-center gap-3 w-full text-left cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center text-xl shadow-sm shrink-0">
                {selectedDrink.emoji}
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block truncate">
                  {selectedDrink.name}
                </span>
                <span className="text-[9.5px] text-slate-500 block">
                  {selectedDrink.portionUnit} • {selectedDrink.calories} kcal
                </span>
              </div>
            </button>
          </div>

          {/* Quick Macro Breakdown Pills */}
          <div className="grid grid-cols-2 gap-2 w-full text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 block">Total Calories</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {totals.calories} <span className="text-[9.5px] font-normal text-slate-400">kcal</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 block">Fiber Buffer</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {totals.fiber.toFixed(1)}g <span className="text-[9.5px] font-normal text-slate-400">fiber</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 block">Lean Protein</span>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                {totals.protein}g
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700">
              <span className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 block">K:Na Cardio Ratio</span>
              <span className="text-sm font-black text-[#126778] dark:text-teal-300">
                {totals.kNaRatio}:1.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 10X DIRECT IN-PLACE FOOD SELECTOR TRAY */}
      <div className="my-4 sm:my-5 p-3.5 sm:p-5 rounded-3xl bg-slate-50/95 dark:bg-zinc-850/90 border-2 border-teal-200/80 dark:border-teal-900/60 shadow-md">
        {/* Active Category Header & Sector Selector Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-zinc-700/80 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {sectorMeta[activeSector].title}
              </span>
              <span className="text-[9px] font-black bg-teal-600 text-white px-2 py-0.2 rounded-full uppercase">
                1-Tap Swap
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {sectorMeta[activeSector].hint}
            </p>
          </div>

          {/* Quick Segment Switcher Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-700 shrink-0 overflow-x-auto">
            <button
              onClick={() => {
                soundEffects.playTactileTick();
                triggerHaptic("light");
                setActiveSector("veggie");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeSector === "veggie" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              🥬 Veggies (50%)
            </button>
            <button
              onClick={() => {
                soundEffects.playTactileTick();
                triggerHaptic("light");
                setActiveSector("protein");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeSector === "protein" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              🥩 Protein (25%)
            </button>
            <button
              onClick={() => {
                soundEffects.playTactileTick();
                triggerHaptic("light");
                setActiveSector("carb");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeSector === "carb" ? "bg-cyan-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              🍠 Swallow (25%)
            </button>
            <button
              onClick={() => {
                soundEffects.playTactileTick();
                triggerHaptic("light");
                setActiveSector("drink");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeSector === "drink" ? "bg-sky-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              💧 Drink
            </button>
          </div>
        </div>

        {/* 1-Tap Food Cards Grid for the Active Sector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {activeOptions.map((item) => {
            const isSelected =
              (activeSector === "veggie" && selectedVeggie.id === item.id) ||
              (activeSector === "protein" && selectedProtein.id === item.id) ||
              (activeSector === "carb" && selectedCarb.id === item.id) ||
              (activeSector === "drink" && selectedDrink.id === item.id);

            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playBubblePop();
                  triggerHaptic("medium");
                  setActivePreset(null);
                  if (activeSector === "veggie") setSelectedVeggie(item);
                  if (activeSector === "protein") setSelectedProtein(item);
                  if (activeSector === "carb") setSelectedCarb(item);
                  if (activeSector === "drink") setSelectedDrink(item);
                  toast.success(`Selected ${item.name}! Plate updated ✨`);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-95 ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-teal-500 shadow-md ring-2 ring-teal-500/40 scale-[1.02]"
                    : "bg-white/80 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl sm:text-2xl">{item.emoji}</span>
                    {isSelected && (
                      <span className="p-1 bg-teal-600 text-white rounded-full">
                        <Check size={10} />
                      </span>
                    )}
                  </div>
                  <h5 className="font-black text-[11px] sm:text-xs text-slate-900 dark:text-white leading-tight line-clamp-2">
                    {item.name}
                  </h5>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5 font-medium">
                    {item.calories} kcal · {item.gi.toUpperCase()} GI
                  </span>
                </div>

                <span className="text-[8.5px] text-teal-700 dark:text-teal-400 font-bold mt-1.5 truncate">
                  {item.portionUnit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Glycemic Radar Feedback Bar */}
      <div className={`p-3.5 rounded-2xl border transition-all mb-4 ${totals.glycemicStatus.color}`}>
        <div className="flex items-center gap-2 font-black text-xs sm:text-sm">
          <Activity size={16} />
          <span>{totals.glycemicStatus.label}</span>
        </div>
        <p className="text-[10.5px] sm:text-[11px] mt-1 opacity-90 leading-relaxed font-medium">
          {totals.glycemicStatus.desc}
        </p>
      </div>

      {/* 🥑 Avo Clinical Scribe Insight Bubble */}
      <div className="bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl p-3.5 border border-teal-200/70 dark:border-teal-800/50 flex items-start gap-3 mb-5">
        <Mascot size={44} className="shrink-0 mt-0.5" />
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
        className="w-full py-3.5 px-5 bg-gradient-to-r from-[#126778] via-[#0d9488] to-[#0f766e] hover:brightness-110 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Zap size={16} className="text-amber-300" />
        <span>{isLogging ? "Recording Plate to Diary..." : "Log This Balanced 9-Inch Plate ⚡"}</span>
      </button>
    </div>
  );
}
