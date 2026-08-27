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
    <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-5 sm:p-6 border border-emerald-100 dark:border-zinc-800 shadow-xl transition-all">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1">
            <Leaf size={11} className="text-emerald-600 animate-pulse" />
            <span>Phytochemical &amp; Fiber Engine</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Metabolic Fruits &amp; Healing Greens 🍏🥬</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Clinical glycemic profiling, blood pressure protection, and gut healing produce from Africa &amp; the tropics.
          </p>
        </div>
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
            className={"px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer " + (
              filterType === tab.id
                ? "bg-[#1f7a8c] text-white shadow-sm"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
            )}
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
              className={"p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between " + (
                isSelected
                  ? "bg-emerald-50/90 dark:bg-emerald-950/50 border-[#1f7a8c] ring-2 ring-[#1f7a8c]/20 shadow-md scale-[1.02]"
                  : "bg-white dark:bg-zinc-800/60 border-gray-100 dark:border-zinc-700/80 hover:border-emerald-200"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[9.5px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded-md">
                  GI {item.giScore}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 line-clamp-1">
                {item.name}
              </h4>
              <span className="text-[10px] text-gray-500 dark:text-zinc-400 block truncate mt-0.5">
                {item.localNames[0] || item.type}
              </span>
              <div className="flex items-center gap-1 text-[9.5px] text-emerald-700 dark:text-emerald-300 font-extrabold mt-1">
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
          className="bg-gradient-to-br from-[#064e3b] via-[#0f766e] to-[#042f2e] text-white rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Top Detail Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-700/80">
            <div className="flex items-start gap-3.5">
              <span className="text-4xl p-2 bg-white/10 rounded-2xl backdrop-blur-md shrink-0">
                {selectedItem.emoji}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">{selectedItem.name}</h3>
                  <span className="bg-emerald-400 text-slate-950 font-black text-[9.5px] px-2 py-0.5 rounded-md">
                    LOW GLYCEMIC (GI {selectedItem.giScore})
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Native Names: <strong className="text-white">{selectedItem.localNames.join(", ")}</strong>
                </p>
                <p className="text-[11px] text-emerald-100/90 mt-1.5 leading-relaxed font-medium">
                  {selectedItem.clinicalBenefit}
                </p>
              </div>
            </div>

            {/* Season Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-right shrink-0">
              <span className="text-[10px] text-emerald-200 font-bold uppercase flex items-center justify-end gap-1">
                <Calendar size={11} /> Harvest Season
              </span>
              <span className="text-xs font-black text-white mt-0.5 block">
                {selectedItem.seasonality}
              </span>
            </div>
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-3 gap-2 my-4">
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] text-emerald-200 block uppercase font-bold">Digestive Fiber</span>
              <span className="text-sm sm:text-base font-black text-amber-300">
                {selectedItem.fiberPer100g}g / 100g
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] text-emerald-200 block uppercase font-bold">Energy Load</span>
              <span className="text-sm sm:text-base font-black text-white">
                {selectedItem.caloriesPer100g} kcal
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] text-emerald-200 block uppercase font-bold">Metabolic Shield</span>
              <span className="text-xs sm:text-sm font-black text-emerald-300 truncate">
                {selectedItem.targetConditions[0]}
              </span>
            </div>
          </div>

          {/* Key Bioactive Phytochemicals */}
          <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-emerald-500/20 mb-4">
            <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider block mb-1.5">
              ⚡ Key Bioactive Phytochemicals:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.keyNutrients.map((nut, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-emerald-900/60 border border-emerald-600/40 text-emerald-100 text-[10.5px] font-bold"
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
            <p className="text-emerald-50 leading-relaxed">
              {selectedItem.bestWayToEat}
            </p>
          </div>

          {/* Diaspora Grocery Substitutes */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-emerald-200 mb-4 px-1">
            <span>🌍 Diaspora Equivalents (Tesco / Walmart / Asda):</span>
            <strong className="text-white truncate">{selectedItem.diasporaSubstitutes.join(", ")}</strong>
          </div>

          {/* Dual Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-700/80">
            <button
              onClick={() => handleLogServing(selectedItem)}
              disabled={isLogging}
              className="py-3 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
            >
              <Plus size={14} />
              <span>Log 100g to Daily Food Diary 🍽️</span>
            </button>

            <button
              onClick={() => handleExportGrocery(selectedItem)}
              className="py-3 px-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/20 shadow-md"
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
