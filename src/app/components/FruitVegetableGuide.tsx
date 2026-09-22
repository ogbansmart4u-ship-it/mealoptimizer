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
  const [selectedItem, setSelectedItem] = useState<FruitVegItem>(METABOLIC_FRUITS_VEGETABLES[0]);
  const [isLogging, setIsLogging] = useState(false);

  const filteredItems = METABOLIC_FRUITS_VEGETABLES.filter(
    (item) => filterType === "all" || item.type === filterType
  );

  const handleSelect = (item: FruitVegItem) => {
    triggerHaptic("light");
    setSelectedItem(item);
  };

  const handleLogServing = async (item: FruitVegItem) => {
    triggerHaptic("medium");
    setIsLogging(true);
    try {
      const newLog = {
        foodName: "Fresh " + item.name + " (" + item.emoji + ")",
        mealType: item.type === "fruit" ? "snack" : "lunch",
        calories: item.caloriesPer100g,
        protein: item.type === "vegetable" ? 3 : 1,
        carbs: item.carbsPer100g,
        fats: 0.5,
        bloodSugarImpact: "low",
        notes: "Metabolic Produce Guide: " + item.clinicalBenefit,
      };

      await createMealLog(newLog);
      triggerConfetti("burst");
      toast.success("Logged 100g serving of " + item.name + " to your Diary! 🥗");
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

      {/* Horizontal Carousel of Produce Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {filteredItems.map((item) => {
          const isSelected = selectedItem.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-50/90 dark:bg-emerald-950/50 border-[#164E3D] ring-2 ring-[#164E3D]/30 shadow-md scale-[1.02]"
                  : "bg-white dark:bg-stone-800/60 border-stone-200/80 dark:border-stone-700/80 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                  GI {item.giScore}
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                {item.name}
              </h4>
              <span className="text-xs text-stone-500 dark:text-stone-400 block truncate mt-0.5 font-medium">
                {item.localNames[0] || item.type}
              </span>
              <div className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300 font-bold mt-1">
                <span>{item.fiberPer100g}g Fiber</span>
                <span>•</span>
                <span>{item.caloriesPer100g} kcal</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Highlighted Produce Detail Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedItem.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="bg-gradient-to-br from-[#164E3D] via-[#123E31] to-[#0F1412] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden"
        >
          {/* Top Detail Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-700/80">
            <div className="flex items-start gap-3.5">
              <span className="text-4xl p-2 bg-white/10 rounded-2xl backdrop-blur-md shrink-0">
                {selectedItem.emoji}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white">{selectedItem.name}</h3>
                  <span className="bg-amber-400 text-stone-950 font-bold text-xs px-2.5 py-0.5 rounded-md shadow-2xs">
                    LOW GLYCEMIC (GI {selectedItem.giScore})
                  </span>
                </div>
                <p className="text-xs text-stone-200 mt-0.5">
                  Native Names: <strong className="text-white">{selectedItem.localNames.join(", ")}</strong>
                </p>
                <p className="text-xs text-stone-200 mt-1.5 leading-relaxed font-medium">
                  {selectedItem.clinicalBenefit}
                </p>
              </div>
            </div>

            {/* Season Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-right shrink-0">
              <span className="text-xs text-amber-300 font-bold uppercase flex items-center justify-end gap-1">
                <Calendar size={12} /> Harvest Season
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {selectedItem.seasonality}
              </span>
            </div>
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-3 gap-2 my-4">
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/10">
              <span className="text-xs text-emerald-200 block uppercase font-bold">Digestive Fiber</span>
              <span className="text-sm sm:text-base font-bold text-amber-300">
                {selectedItem.fiberPer100g}g / 100g
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/10">
              <span className="text-xs text-emerald-200 block uppercase font-bold">Energy Load</span>
              <span className="text-sm sm:text-base font-bold text-white">
                {selectedItem.caloriesPer100g} kcal
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/10">
              <span className="text-xs text-emerald-200 block uppercase font-bold">Metabolic Shield</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-300 truncate">
                {selectedItem.targetConditions[0]}
              </span>
            </div>
          </div>

          {/* Key Bioactive Phytochemicals */}
          <div className="bg-black/30 rounded-2xl p-3.5 border border-emerald-500/20 mb-4">
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block mb-1.5">
              ⚡ Key Bioactive Phytochemicals:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.keyNutrients.map((nut, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-900/60 border border-emerald-600/40 text-emerald-100 text-xs font-semibold"
                >
                  {nut}
                </span>
              ))}
            </div>
          </div>

          {/* Culinary Prep Hack */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 mb-4 text-xs">
            <span className="text-amber-300 font-bold block mb-1">
              🍽️ Optimal Bioavailability Preparation:
            </span>
            <p className="text-stone-100 leading-relaxed font-medium">
              {selectedItem.bestWayToEat}
            </p>
          </div>

          {/* Diaspora Grocery Substitutes */}
          <div className="flex items-center justify-between gap-2 text-xs text-stone-200 mb-4 px-1">
            <span>🌍 Diaspora Equivalents (Tesco / Walmart / Asda):</span>
            <strong className="text-white truncate">{selectedItem.diasporaSubstitutes.join(", ")}</strong>
          </div>

          {/* Dual Action Buttons with Liquid Glass Styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-700/80">
            <button
              onClick={() => handleLogServing(selectedItem)}
              disabled={isLogging}
              className="btn-liquid-glass btn-liquid-forest py-3 px-4 rounded-2xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md border border-white/20"
            >
              <Plus size={14} />
              <span>Log 100g to Daily Food Diary 🍽️</span>
            </button>

            <button
              onClick={() => handleExportGrocery(selectedItem)}
              className="btn-liquid-glass btn-glass-frosted py-3 px-4 rounded-2xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/30 shadow-md"
            >
              <ShoppingBag size={14} />
              <span>Add to Market Shopping List 🛒</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
