import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Apple,
  Leaf,
  Sparkles,
  Heart,
  TrendingDown,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Info,
  Calendar,
  Zap,
  ShoppingBag,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight,
  Scale,
} from "lucide-react";
import { createMealLog } from "../../lib/api";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export interface FruitVegItem {
  id: string;
  name: string;
  localNames: string[];
  emoji: string;
  type: "fruit" | "vegetable";
  glycemicIndex: "Low" | "Medium" | "High";
  giScore: number;
  caloriesPer100g: number;
  carbsPer100g: number;
  fiberPer100g: number;
  keyNutrients: string[];
  clinicalBenefit: string;
  bestWayToEat: string;
  targetConditions: string[];
  seasonality: string;
  diasporaSubstitutes: string[];
}

export const METABOLIC_FRUITS_VEGETABLES: FruitVegItem[] = [
  {
    "id": "garden-egg",
    "name": "African Garden Egg",
    "localNames": [
      "Igba",
      "Anara",
      "Afufa",
      "Gauta"
    ],
    "emoji": "🍆",
    "type": "fruit",
    "glycemicIndex": "Low",
    "giScore": 15,
    "caloriesPer100g": 24,
    "carbsPer100g": 4.8,
    "fiberPer100g": 3.2,
    "keyNutrients": [
      "Nasunin (Anthocyanin)",
      "Chlorogenic Acid",
      "Potassium",
      "Vitamin C"
    ],
    "clinicalBenefit": "Nasunin protects brain cell membranes from lipid peroxidation; chlorogenic acid buffers post-meal glucose surges.",
    "bestWayToEat": "Enjoy raw with spicy ground peanut paste (Ose Oji) or steamed into egg stew for breakfast.",
    "targetConditions": [
      "Type 2 Diabetes",
      "Hypertension",
      "Weight Loss",
      "PCOS"
    ],
    "seasonality": "Year-Round (Peak: June - October)",
    "diasporaSubstitutes": [
      "Thai Round Eggplants",
      "Italian Baby Eggplants",
      "Globe Eggplant slices"
    ]
  },
  {
    "id": "agbalumo",
    "name": "African Star Apple (Agbalumo / Udara)",
    "localNames": [
      "Agbalumo (Yoruba)",
      "Udara (Igbo)",
      "Otien (Edo)"
    ],
    "emoji": "🍊",
    "type": "fruit",
    "glycemicIndex": "Low",
    "giScore": 32,
    "caloriesPer100g": 65,
    "carbsPer100g": 14.5,
    "fiberPer100g": 4.6,
    "keyNutrients": [
      "Ascorbic Acid (100mg)",
      "Eleagnine",
      "Calcium",
      "Tannins"
    ],
    "clinicalBenefit": "Packed with more Vitamin C than oranges; natural tannins and triterpenoids exhibit natural anti-hyperglycemic properties.",
    "bestWayToEat": "Chew sweet-tart pulp raw; chew inner fleshy leather for slow-release soluble pectin fiber.",
    "targetConditions": [
      "Metabolic Syndrome",
      "Hypertension",
      "Immune Resilience"
    ],
    "seasonality": "December - April",
    "diasporaSubstitutes": [
      "Pomegranate arils",
      "Tart Cherries",
      "Passionfruit"
    ]
  },
  {
    "id": "ube-pear",
    "name": "African Pear / Bush Butter (Ube)",
    "localNames": [
      "Ube (Igbo)",
      "Safou (Cameroon/Gabon)",
      "Elemi (Yoruba)"
    ],
    "emoji": "🥑",
    "type": "fruit",
    "glycemicIndex": "Low",
    "giScore": 20,
    "caloriesPer100g": 175,
    "carbsPer100g": 6.2,
    "fiberPer100g": 5.1,
    "keyNutrients": [
      "Oleic Acid (Omega-9)",
      "Linoleic Acid",
      "Potassium",
      "Magnesium"
    ],
    "clinicalBenefit": "Monounsaturated healthy fatty acids support cardiovascular elasticity and reduce LDL cholesterol oxidation.",
    "bestWayToEat": "Softened gently in warm salted water or lightly roasted; pair with boiled corn or eat solo as a healthy fat snack.",
    "targetConditions": [
      "Hypertension",
      "Heart Health",
      "Keto/Low Carb",
      "PCOS"
    ],
    "seasonality": "June - September",
    "diasporaSubstitutes": [
      "Hass Avocado",
      "Kalamata Olives",
      "Roasted Macadamia Nuts"
    ]
  },
  {
    "id": "guava",
    "name": "Tropical Guava",
    "localNames": [
      "Gova",
      "Gwaiva"
    ],
    "emoji": "🍈",
    "type": "fruit",
    "glycemicIndex": "Low",
    "giScore": 12,
    "caloriesPer100g": 68,
    "carbsPer100g": 14.3,
    "fiberPer100g": 5.4,
    "keyNutrients": [
      "Pectin Soluble Fiber",
      "Lycopene",
      "Vitamin C (228mg)",
      "Folate"
    ],
    "clinicalBenefit": "Ultra-low glycemic load. Dense pectin soluble fiber forms a gut gel that slows carbohydrate digestion and protects intestinal microflora.",
    "bestWayToEat": "Eat whole with skin intact for maximum fiber and lycopene absorption.",
    "targetConditions": [
      "Type 2 Diabetes",
      "High Cholesterol",
      "Fatty Liver"
    ],
    "seasonality": "August - December",
    "diasporaSubstitutes": [
      "Crisp Green Apples (Granny Smith)",
      "Fresh Blackberries",
      "Pears with skin"
    ]
  },
  {
    "id": "pawpaw",
    "name": "Fresh Papaya (Pawpaw)",
    "localNames": [
      "Ibepe (Yoruba)",
      "Okwuru bekee (Igbo)",
      "Gwanda (Hausa)"
    ],
    "emoji": "🥭",
    "type": "fruit",
    "glycemicIndex": "Low",
    "giScore": 38,
    "caloriesPer100g": 43,
    "carbsPer100g": 10.8,
    "fiberPer100g": 1.7,
    "keyNutrients": [
      "Papain Proteolytic Enzyme",
      "Beta-Cryptoxanthin",
      "Vitamin A",
      "Folate"
    ],
    "clinicalBenefit": "Papain breaks down heavy dietary proteins; carotenoids suppress systemic vascular inflammation.",
    "bestWayToEat": "Slice chilled cubes with a squeeze of fresh lime juice 30 minutes after a protein-dense meal.",
    "targetConditions": [
      "Digestive Sluggishness",
      "PCOS",
      "Arterial Health"
    ],
    "seasonality": "Year-Round",
    "diasporaSubstitutes": [
      "Fresh Cantaloupe",
      "Papaya from Supermarket",
      "Pineapple spears (small portion)"
    ]
  },
  {
    "id": "soursop",
    "name": "Soursop (Graviola / Shawashop)",
    "localNames": [
      "Shawashop",
      "Ebo",
      "Avo"
    ],
    "emoji": "🍏",
    "type": "fruit",
    "glycemicIndex": "Low",
    "giScore": 35,
    "caloriesPer100g": 66,
    "carbsPer100g": 16.8,
    "fiberPer100g": 3.3,
    "keyNutrients": [
      "Annonaceous Acetogenins",
      "Vitamin C",
      "Potassium",
      "Magnesium"
    ],
    "clinicalBenefit": "Bioactive acetogenins stimulate antioxidant defenses and cellular integrity.",
    "bestWayToEat": "Scoop fresh fibrous white pulp directly from ripe fruit. Blend with unsweetened almond milk for a soothing elixir.",
    "targetConditions": [
      "Cellular Protection",
      "Hypertension",
      "Insulin Sensitivity"
    ],
    "seasonality": "April - September",
    "diasporaSubstitutes": [
      "Cherimoya / Custard Apple",
      "Green Apple + Lime Puree"
    ]
  },
  {
    "id": "ugu-leaf",
    "name": "Fluted Pumpkin Leaf (Ugu)",
    "localNames": [
      "Ugu (Igbo)",
      "Ikong Ubong (Efik)",
      "Kabewa (Hausa)"
    ],
    "emoji": "🌿",
    "type": "vegetable",
    "glycemicIndex": "Low",
    "giScore": 10,
    "caloriesPer100g": 32,
    "carbsPer100g": 3.5,
    "fiberPer100g": 3.8,
    "keyNutrients": [
      "Bioavailable Non-Heme Iron",
      "Folate",
      "Chlorophyll",
      "Zinc"
    ],
    "clinicalBenefit": "Promotes healthy hemoglobin synthesis and red blood cell rejuvenation; powerful glucose stabilization.",
    "bestWayToEat": "Finely sliced and tossed into soups in final 2 minutes of cooking to protect heat-labile vitamins.",
    "targetConditions": [
      "Anemia / Low Ferritin",
      "Type 2 Diabetes",
      "Pregnancy & Postpartum"
    ],
    "seasonality": "Year-Round",
    "diasporaSubstitutes": [
      "Collard Greens",
      "Cavolo Nero / Lacinato Kale",
      "Swiss Chard"
    ]
  },
  {
    "id": "waterleaf",
    "name": "Fresh Waterleaf",
    "localNames": [
      "Gbure (Yoruba)",
      "Mmong Mmong Ikong (Efik)",
      "Nte-oka (Igbo)"
    ],
    "emoji": "🥬",
    "type": "vegetable",
    "glycemicIndex": "Low",
    "giScore": 8,
    "caloriesPer100g": 18,
    "carbsPer100g": 2.4,
    "fiberPer100g": 2.1,
    "keyNutrients": [
      "Pectin Mucilage",
      "Omega-3 Alpha-Linolenic Acid",
      "Vitamin C",
      "Calcium"
    ],
    "clinicalBenefit": "High soluble pectin coats and protects gastric mucosal barriers; helps clear serum uric acid.",
    "bestWayToEat": "Steamed briefly with smoked fish or folded into Afang and Edikang Ikong soups.",
    "targetConditions": [
      "Gastric Health",
      "Hypertension",
      "Liver Support"
    ],
    "seasonality": "Rainy Season (May - November)",
    "diasporaSubstitutes": [
      "Purslane",
      "Baby Spinach",
      "Malabar Spinach"
    ]
  },
  {
    "id": "bitterleaf",
    "name": "Healing Bitterleaf (Onugbu / Ewuro)",
    "localNames": [
      "Ewuro (Yoruba)",
      "Onugbu (Igbo)",
      "Shuwaka (Hausa)",
      "Ndolé (Cameroon)"
    ],
    "emoji": "🌱",
    "type": "vegetable",
    "glycemicIndex": "Low",
    "giScore": 5,
    "caloriesPer100g": 25,
    "carbsPer100g": 3.1,
    "fiberPer100g": 4.2,
    "keyNutrients": [
      "Vernoniosides",
      "Sesquiterpene Lactones",
      "Luteolin",
      "Potassium"
    ],
    "clinicalBenefit": "Clinically proven to stimulate beta-cell insulin secretion and protect hepatic hepatocytes.",
    "bestWayToEat": "Washed to reduce excess bitterness, then cooked into traditional Onugbu or Ndolé soup with garlic and crayfish.",
    "targetConditions": [
      "Type 2 Diabetes",
      "Fatty Liver",
      "Metabolic Detox"
    ],
    "seasonality": "Year-Round",
    "diasporaSubstitutes": [
      "Dandelion Greens",
      "Chicory / Radicchio",
      "Mustard Greens"
    ]
  },
  {
    "id": "utazi",
    "name": "Medicinal Utazi Leaf",
    "localNames": [
      "Utazi (Igbo)",
      "Arokeke (Yoruba)",
      "Utasi (Efik)"
    ],
    "emoji": "🍃",
    "type": "vegetable",
    "glycemicIndex": "Low",
    "giScore": 5,
    "caloriesPer100g": 22,
    "carbsPer100g": 2.8,
    "fiberPer100g": 3.5,
    "keyNutrients": [
      "Bitter Triterpenoids",
      "Saponins",
      "Flavonoids",
      "Alkaloids"
    ],
    "clinicalBenefit": "Bitter principles stimulate digestive cholecystokinin (CCK) and pancreatic enzymes, curbing sugar cravings.",
    "bestWayToEat": "Thinly shredded fresh onto pepper soups, Isi Ewu, Nsala soup, or vegetable stir-ins.",
    "targetConditions": [
      "Type 2 Diabetes",
      "Digestive Sluggishness",
      "Weight Management"
    ],
    "seasonality": "Year-Round",
    "diasporaSubstitutes": [
      "Arugula (Rocket)",
      "Watercress",
      "Endive"
    ]
  },
  {
    "id": "moringa",
    "name": "Moringa Super-Greens (Zogale)",
    "localNames": [
      "Zogale (Hausa)",
      "Ewe Igbale (Yoruba)",
      "Okwe Oyibo (Igbo)"
    ],
    "emoji": "🥗",
    "type": "vegetable",
    "glycemicIndex": "Low",
    "giScore": 5,
    "caloriesPer100g": 37,
    "carbsPer100g": 3.8,
    "fiberPer100g": 4,
    "keyNutrients": [
      "Quercetin",
      "Chlorogenic Acid",
      "7x Vitamin C of Oranges",
      "4x Calcium of Milk"
    ],
    "clinicalBenefit": "Potent free radical scavenger; lowers fasting blood glucose and attenuates arterial hypertension.",
    "bestWayToEat": "Tossed fresh into groundnut soups (Miyan Zogale) or dried leaves infused into rejuvenating herbal tea.",
    "targetConditions": [
      "Hypertension",
      "Type 2 Diabetes",
      "Arthritis & Inflammation"
    ],
    "seasonality": "Year-Round (Hardy & Drought Resistant)",
    "diasporaSubstitutes": [
      "Organic Moringa Powder",
      "Baby Kale",
      "Microgreens"
    ]
  },
  {
    "id": "okra-pods",
    "name": "Fresh Green Okra",
    "localNames": [
      "Ila (Yoruba)",
      "Okwuru (Igbo)",
      "Kubewa (Hausa)"
    ],
    "emoji": "🥣",
    "type": "vegetable",
    "glycemicIndex": "Low",
    "giScore": 20,
    "caloriesPer100g": 33,
    "carbsPer100g": 7.5,
    "fiberPer100g": 3.2,
    "keyNutrients": [
      "Soluble Mucilage Fiber",
      "Isoquercitrin",
      "Vitamin K",
      "Magnesium"
    ],
    "clinicalBenefit": "Okra mucilage binds bile acids and dietary glucose in the intestinal tract, blunting glycemic spikes by up to 35%.",
    "bestWayToEat": "Finely diced and gently simmered with crayfish and Iru for just 4 minutes.",
    "targetConditions": [
      "Type 2 Diabetes",
      "Cardiovascular Health",
      "Gut Microbiome"
    ],
    "seasonality": "Year-Round",
    "diasporaSubstitutes": [
      "Fresh or Frozen Cut Okra",
      "Molokhia (Jute leaf)",
      "Nopales (Cactus pads)"
    ]
  }
];

export default function FruitVegetableGuide() {
  const [filterType, setFilterType] = useState<"all" | "fruit" | "vegetable">("all");
  const [activeItem, setActiveItem] = useState<FruitVegItem | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(true);
  const [servingGrams, setServingGrams] = useState<number>(100);
  const [isLogging, setIsLogging] = useState(false);

  const filteredItems = METABOLIC_FRUITS_VEGETABLES.filter(
    (item) => filterType === "all" || item.type === filterType
  );

  const handleOpenProduce = (item: FruitVegItem) => {
    triggerHaptic("medium");
    setActiveItem(item);
    setIsFlipped(true); // Flips to reveal the rich back face!
    setServingGrams(100);
  };

  const handleCloseProduce = () => {
    triggerHaptic("light");
    setActiveItem(null);
  };

  const handleToggleFlip = () => {
    triggerHaptic("light");
    setIsFlipped((prev) => !prev);
  };

  const handleNavigateProduce = (direction: "prev" | "next") => {
    if (!activeItem) return;
    triggerHaptic("light");
    const currentIndex = filteredItems.findIndex((it) => it.id === activeItem.id);
    if (currentIndex === -1) return;
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % filteredItems.length
        : (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setActiveItem(filteredItems[newIndex]);
    setServingGrams(100);
  };

  const handleLogServing = async (item: FruitVegItem, grams: number) => {
    triggerHaptic("medium");
    setIsLogging(true);
    const multiplier = grams / 100;
    try {
      const newLog = {
        foodName: `${grams}g Fresh ${item.name} (${item.emoji})`,
        mealType: item.type === "fruit" ? "snack" : "lunch",
        calories: Math.round(item.caloriesPer100g * multiplier),
        protein: item.type === "vegetable" ? Math.round(3 * multiplier) : Math.round(1 * multiplier),
        carbs: Number((item.carbsPer100g * multiplier).toFixed(1)),
        fats: 0.5,
        bloodSugarImpact: "low",
        notes: `Metabolic Produce Guide (${grams}g): ${item.clinicalBenefit}`,
      };

      await createMealLog(newLog);
      triggerConfetti("burst");
      toast.success(`Logged ${grams}g serving of ${item.name} to your Diary! 🥗`);
    } catch {
      toast.error("Failed to log food item");
    } finally {
      setIsLogging(false);
    }
  };

  const handleExportGrocery = (item: FruitVegItem) => {
    triggerHaptic("light");
    try {
      const existing = JSON.parse(localStorage.getItem("mealoptimizer_custom_groceries") || "[]");
      const newItem = {
        id: "produce-" + Date.now() + "-" + Math.random(),
        name: "Fresh " + item.name + " (" + (item.localNames[0] || "") + ")",
        quantity: "1 batch / 250g",
        category: "Produce & Healing Greens",
        checked: false,
      };
      localStorage.setItem("mealoptimizer_custom_groceries", JSON.stringify([...existing, newItem]));
      triggerConfetti("confetti");
      toast.success("Added " + item.name + " to your Smart Market Checklist! 🛒");
    } catch {
      toast.error("Failed to save to grocery checklist");
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900/90 rounded-3xl p-5 sm:p-6 border border-stone-200/80 dark:border-stone-800 shadow-xl transition-all">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Leaf size={12} className="text-emerald-600 animate-pulse" />
            <span>African Botanical Produce &amp; Meal Sequencing</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span>African Fruits &amp; Healing Greens 🍏🥬</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">
            How to pair whole low-GI fruits with your 9-inch African plate to double mineral absorption and stop sugar spikes.
          </p>
        </div>
      </div>

      {/* 🌟 4-STEP MEAL SEQUENCING & 9-INCH PLATE COMBINATION GUIDE */}
      <div className="p-4 bg-stone-100/90 dark:bg-stone-900/80 rounded-2xl border border-stone-200/80 dark:border-stone-800 mb-4 space-y-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <Sparkles size={13} className="text-amber-500" />
            <span>Golden Rule: How to Combine Fruit with African Meals</span>
          </span>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white/90 dark:bg-stone-800 px-2.5 py-0.5 rounded-full border border-emerald-200/60 shadow-2xs">
            Step 4 Sequence
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-xs">
          <div className="bg-white/95 dark:bg-stone-800/80 p-2.5 rounded-xl border border-emerald-200/60 shadow-2xs">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block uppercase">1. Fiber Soups (0-5m)</span>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">Okra / Ewedu</span>
          </div>
          <div className="bg-white/95 dark:bg-stone-800/80 p-2.5 rounded-xl border border-amber-200/60 shadow-2xs">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block uppercase">2. Protein (5-15m)</span>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">Fish / Eggs / Meat</span>
          </div>
          <div className="bg-white/95 dark:bg-stone-800/80 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
            <span className="text-xs font-bold text-[#164E3D] dark:text-emerald-300 block uppercase">3. Swallow Carbs</span>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">Amala / Plantain</span>
          </div>
          <div className="bg-white/95 dark:bg-stone-800/80 p-2.5 rounded-xl border border-amber-300/80 ring-1 ring-amber-400/40 shadow-2xs">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block uppercase">4. Fruit Buffer</span>
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-0.5 block">Garden Egg / Guava</span>
          </div>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
          💡 <strong>Why this works:</strong> Eating whole fruit <em>after</em> fiber and protein slows fructose absorption by <strong>40%</strong>, keeping your blood sugar calm and giving you steady all-day vitality.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { id: "all", label: "All Super-Produce (12) ✨" },
          { id: "fruit", label: "Low-GI Fruits (6) 🍏" },
          { id: "vegetable", label: "Healing Greens (6) 🥬" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic("light");
              setFilterType(tab.id as any);
              setActiveItem(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === tab.id
                ? "btn-liquid-glass btn-liquid-forest text-white shadow-xs border border-white/20"
                : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-semibold border border-stone-200/60 dark:border-stone-700/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interactive Helper Banner */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium mb-3 px-1">
        <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
          <RotateCw size={12} className="text-emerald-600 shrink-0" />
          <span>Tap any fruit or healing green to flip into full 3D Clinical Wisdom</span>
        </span>
        <span className="hidden sm:inline-block text-stone-400 dark:text-stone-500">
          Unabridged Bioactive Dossier
        </span>
      </div>

      {/* Produce Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5 mb-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenProduce(item)}
            className="group cursor-pointer rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 p-3.5 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 select-none"
          >
            <div>
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-2xs leading-none group-hover:scale-110 transition-transform">
                  {item.emoji}
                </span>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/60 border border-emerald-300/60 dark:border-emerald-700/60 px-2.5 py-0.5 rounded-full shadow-2xs">
                  GI {item.giScore}
                </span>
              </div>

              {/* Name & Local Name */}
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1 leading-snug">
                {item.name}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate mt-0.5">
                {item.localNames[0] || item.type}
              </p>

              {/* Condition Tag */}
              <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-100/80 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300 text-xs font-medium">
                <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{item.targetConditions[0]}</span>
              </div>
            </div>

            {/* Bottom: Fiber/Cals and Interactive Flip Trigger */}
            <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700/60">
              <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 font-semibold mb-2">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{item.fiberPer100g}g Fiber</span>
                <span>•</span>
                <span>{item.caloriesPer100g} kcal</span>
              </div>
              <button
                type="button"
                className="w-full btn-liquid-glass btn-liquid-forest py-2 px-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs border border-white/20 group-hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <RotateCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Flip for Wisdom 💡</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🌟 10X INTERACTIVE 3D FLIP DOSSIER MODAL */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md">
            {/* Backdrop click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseProduce}
              className="absolute inset-0"
            />

            {/* 3D Flip Perspective Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-xl max-h-[90vh] perspective-1000 [perspective:1200px]"
            >
              {/* Card that flips in 3D */}
              <div
                className={`relative w-full h-[620px] max-h-[85vh] rounded-3xl transition-transform duration-700 preserve-3d [transform-style:preserve-3d] shadow-2xl ${
                  isFlipped ? "rotate-y-180 [transform:rotateY(180deg)]" : ""
                }`}
              >
                {/* ========================================================= */}
                {/* FRONT FACE: NUTRITIONAL PROFILE & BOTANICAL SPOTLIGHT     */}
                {/* ========================================================= */}
                <div className="absolute inset-0 w-full h-full rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 sm:p-6 flex flex-col justify-between backface-hidden [backface-visibility:hidden] overflow-y-auto custom-scrollbar shadow-2xl">
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          {activeItem.type === "fruit" ? "Low-GI Super Fruit 🍏" : "Healing Green 🥬"}
                        </span>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/70 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                          GI {activeItem.giScore} ({activeItem.glycemicIndex})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleToggleFlip}
                          className="btn-liquid-glass btn-liquid-forest px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-xs border border-white/20 active:scale-95 cursor-pointer"
                          title="Flip card"
                        >
                          <RotateCw size={12} />
                          <span>Flip to Wisdom 💡</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseProduce}
                          className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Big Showcase Hero */}
                    <div className="my-4 text-center">
                      <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 dark:from-emerald-950/40 dark:via-stone-800 dark:to-stone-900 border border-emerald-200/60 dark:border-emerald-800/40 shadow-inner mb-3">
                        <span className="text-6xl sm:text-7xl block leading-none">
                          {activeItem.emoji}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                        {activeItem.name}
                      </h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">
                        African Vernacular: <strong className="text-stone-800 dark:text-stone-200">{activeItem.localNames.join(", ")}</strong>
                      </p>
                    </div>

                    {/* Serving Adjuster (10X Feature) */}
                    <div className="bg-stone-100/80 dark:bg-stone-800/70 rounded-2xl p-3 border border-stone-200/80 dark:border-stone-700/80 mb-3">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
                          <Scale size={13} className="text-emerald-600" />
                          <span>Interactive Serving Selector:</span>
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          {servingGrams}g Portion
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[100, 200, 250].map((grams) => (
                          <button
                            key={grams}
                            type="button"
                            onClick={() => {
                              triggerHaptic("light");
                              setServingGrams(grams);
                            }}
                            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              servingGrams === grams
                                ? "btn-liquid-glass btn-liquid-forest text-white shadow-xs border border-white/20"
                                : "bg-white dark:bg-stone-700/60 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:bg-stone-50"
                            }`}
                          >
                            {grams === 100 ? "100g (Standard)" : grams === 200 ? "200g (Double)" : "250g (Bowl)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calculated Macro Badges */}
                    <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40">
                        <span className="text-stone-500 dark:text-stone-400 block font-semibold text-xs">Digestive Fiber</span>
                        <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                          {Number((activeItem.fiberPer100g * (servingGrams / 100)).toFixed(1))}g
                        </span>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-2xl border border-amber-200/80 dark:border-amber-800/40">
                        <span className="text-stone-500 dark:text-stone-400 block font-semibold text-xs">Energy Load</span>
                        <span className="text-base font-bold text-amber-700 dark:text-amber-300">
                          {Math.round(activeItem.caloriesPer100g * (servingGrams / 100))} kcal
                        </span>
                      </div>
                      <div className="bg-stone-100 dark:bg-stone-800/80 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                        <span className="text-stone-500 dark:text-stone-400 block font-semibold text-xs">Carbohydrates</span>
                        <span className="text-base font-bold text-stone-800 dark:text-stone-200">
                          {Number((activeItem.carbsPer100g * (servingGrams / 100)).toFixed(1))}g
                        </span>
                      </div>
                    </div>

                    {/* Target Condition Badges */}
                    <div className="mb-2">
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">
                        🎯 Recommended For Metabolic Conditions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeItem.targetConditions.map((cond, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs font-bold border border-emerald-300/60 dark:border-emerald-700/60"
                          >
                            ✓ {cond}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Trigger Flip to Wisdom Button */}
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={handleToggleFlip}
                      className="w-full btn-liquid-glass btn-liquid-forest py-3 px-4 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg border border-white/20 active:scale-95 cursor-pointer"
                    >
                      <RotateCw size={14} />
                      <span>Flip Card to View Clinical Wisdom, Phytochemicals &amp; Prep 🔄</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* BACK FACE: 100% UNTRUNCATED CLINICAL DOSSIER              */}
                {/* ========================================================= */}
                <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#164E3D] via-[#123E31] to-[#0A1A14] text-white p-5 sm:p-6 flex flex-col justify-between rotate-y-180 [transform:rotateY(180deg)] backface-hidden [backface-visibility:hidden] shadow-2xl border border-emerald-500/40 overflow-y-auto custom-scrollbar">
                  <div>
                    {/* Header Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/20">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-3xl p-1 bg-white/10 rounded-2xl shrink-0 leading-none">
                          {activeItem.emoji}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-white truncate">
                            {activeItem.name}
                          </h3>
                          <span className="bg-amber-400 text-stone-950 font-bold text-xs px-2.5 py-0.5 rounded-md shadow-2xs">
                            LOW GLYCEMIC (GI {activeItem.giScore})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleToggleFlip}
                          className="btn-liquid-glass btn-glass-frosted px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-xs border border-white/30 active:scale-95 cursor-pointer"
                        >
                          <RotateCw size={12} className="rotate-180 text-amber-300" />
                          <span>Flip to Front</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCloseProduce}
                          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Vernacular Names & Season */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/10 border border-white/10 text-xs">
                      <div className="text-stone-200">
                        <span className="text-amber-300 font-bold">🌍 Native Vernacular: </span>
                        <span className="text-white font-semibold">{activeItem.localNames.join(", ")}</span>
                      </div>
                      <div className="text-amber-300 font-bold flex items-center gap-1">
                        <Calendar size={12} />
                        <span className="text-white">{activeItem.seasonality}</span>
                      </div>
                    </div>

                    {/* 100% UNABRIDGED Clinical Benefit */}
                    <div className="my-3 bg-black/40 rounded-2xl p-3.5 border border-emerald-500/30 text-xs">
                      <span className="text-amber-300 font-bold text-xs uppercase tracking-wider block mb-1">
                        🌿 Clinical Benefit &amp; Metabolic Impact:
                      </span>
                      <p className="text-stone-100 text-xs leading-relaxed font-medium">
                        {activeItem.clinicalBenefit}
                      </p>
                    </div>

                    {/* 3 Master Metric Cards */}
                    <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                      <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
                        <span className="text-emerald-200 block uppercase font-bold text-xs">Digestive Fiber</span>
                        <span className="text-sm sm:text-base font-bold text-amber-300">
                          {Number((activeItem.fiberPer100g * (servingGrams / 100)).toFixed(1))}g
                        </span>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
                        <span className="text-emerald-200 block uppercase font-bold text-xs">Energy Load</span>
                        <span className="text-sm sm:text-base font-bold text-white">
                          {Math.round(activeItem.caloriesPer100g * (servingGrams / 100))} kcal
                        </span>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-2.5 border border-white/10">
                        <span className="text-emerald-200 block uppercase font-bold text-xs">Metabolic Shield</span>
                        <span className="text-xs sm:text-sm font-bold text-emerald-300 truncate block">
                          {activeItem.targetConditions[0]}
                        </span>
                      </div>
                    </div>

                    {/* Key Bioactive Phytochemicals (ALL TAGS VISIBLE) */}
                    <div className="bg-black/30 rounded-2xl p-3 border border-emerald-500/20 my-3">
                      <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block mb-1.5">
                        ⚡ Key Bioactive Phytochemicals:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeItem.keyNutrients.map((nut, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg bg-emerald-900/80 border border-emerald-600/50 text-emerald-100 text-xs font-semibold"
                          >
                            {nut}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Optimal Bioavailability Preparation */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 my-3 text-xs">
                      <span className="text-amber-300 font-bold block mb-1">
                        🍽️ Optimal Bioavailability Preparation:
                      </span>
                      <p className="text-stone-100 text-xs leading-relaxed font-medium">
                        {activeItem.bestWayToEat}
                      </p>
                    </div>

                    {/* Diaspora Grocery Substitutes */}
                    <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-stone-200 my-3">
                      <span className="text-amber-300 font-bold">🌍 Diaspora Equivalents (Tesco / Walmart / Asda): </span>
                      <strong className="text-white">{activeItem.diasporaSubstitutes.join(", ")}</strong>
                    </div>
                  </div>

                  {/* Bottom: Action Buttons & Navigation */}
                  <div className="pt-3 border-t border-emerald-700/80 mt-2 space-y-2.5">
                    {/* Dual Action Buttons with Liquid Glass Styling */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleLogServing(activeItem, servingGrams)}
                        disabled={isLogging}
                        className="btn-liquid-glass btn-liquid-forest py-2.5 px-3 rounded-2xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md border border-white/20 disabled:opacity-50"
                      >
                        <Plus size={14} />
                        <span>Log {servingGrams}g to Daily Food Diary 🍽️</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportGrocery(activeItem)}
                        className="btn-liquid-glass btn-glass-frosted py-2.5 px-3 rounded-2xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/30 shadow-md"
                      >
                        <ShoppingBag size={14} />
                        <span>Add to Market Shopping List 🛒</span>
                      </button>
                    </div>

                    {/* Carousel Navigation between Produce Items */}
                    <div className="flex items-center justify-between text-xs text-stone-300 pt-1">
                      <button
                        type="button"
                        onClick={() => handleNavigateProduce("prev")}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/10"
                      >
                        <ChevronLeft size={14} />
                        <span>Previous Produce</span>
                      </button>
                      <span className="font-semibold text-emerald-300">
                        {filteredItems.findIndex((it) => it.id === activeItem.id) + 1} of {filteredItems.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNavigateProduce("next")}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/10"
                      >
                        <span>Next Produce</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
