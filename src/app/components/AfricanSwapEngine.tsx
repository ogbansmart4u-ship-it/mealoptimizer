import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Globe,
  HeartPulse,
  Leaf,
  CheckCircle2,
  Utensils,
  Zap,
  Info,
  ChevronRight,
} from "lucide-react";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export interface FoodSwapItem {
  id: string;
  originalFood: string;
  originalEmoji: string;
  originalIssue: string;
  originalGI: number;
  originalSodiumMg: number;
  originalCalories: number;
  recommendedSwap: string;
  swapEmoji: string;
  swapGI: number;
  swapSodiumMg: number;
  swapCalories: number;
  giReductionPct: number;
  sodiumReductionPct: number;
  fiberGainGrams: number;
  proteinGainGrams: number;
  diasporaStore: string;
  diasporaAisle: string;
  diasporaSubstitutes: string[];
  preparationHack: string;
  clinicalImpact: string;
  category: "swallows" | "grains" | "fats_seasoning" | "sides_drinks";
}

export const AFRICAN_FOOD_SWAPS: FoodSwapItem[] = [
  {
    id: "pounded-yam",
    originalFood: "Pounded Yam (Iyan)",
    originalEmoji: "🍠",
    originalIssue: "Ultra-fast glucose surge (GI 85+), heavy post-prandial fatigue",
    originalGI: 85,
    originalSodiumMg: 15,
    originalCalories: 480,
    recommendedSwap: "Oat-Psyllium Swallow or Cauliflower-Fufu Blend",
    swapEmoji: "🥣",
    swapGI: 38,
    swapSodiumMg: 10,
    swapCalories: 260,
    giReductionPct: 55,
    sodiumReductionPct: 33,
    fiberGainGrams: 9,
    proteinGainGrams: 12,
    diasporaStore: "Tesco / Sainsbury's / Walmart / Trader Joe's",
    diasporaAisle: "Breakfast Cereals & Baking (Rolled Oats + Psyllium Husk)",
    diasporaSubstitutes: ["Ground Spelt Flour", "Almond Flour + Psyllium Husk", "Steamed Cauliflower + Psyllium"],
    preparationHack: "Grind whole rolled oats in a blender into fine powder. Whisk with 1 tsp psyllium husk into boiling water for 3 minutes in a pot. It forms an ultra-stretchy, smooth swallow that mimics pounded yam with zero insulin surge!",
    clinicalImpact: "Beta-glucan soluble fibers create a viscous gel in the gut that slows glucose absorption by ~55%.",
    category: "swallows",
  },
  {
    id: "white-eba",
    originalFood: "Cassava Garri / Eba",
    originalEmoji: "🫓",
    originalIssue: "Dense simple starch with minimal fiber, high insulin spike",
    originalGI: 82,
    originalSodiumMg: 20,
    originalCalories: 420,
    recommendedSwap: "Cabbage-Chia Swallow or Unripe Plantain Flour",
    swapEmoji: "🥬",
    swapGI: 35,
    swapSodiumMg: 15,
    swapCalories: 190,
    giReductionPct: 57,
    sodiumReductionPct: 25,
    fiberGainGrams: 8,
    proteinGainGrams: 6,
    diasporaStore: "Whole Foods / Asda / Afro-Caribbean Market",
    diasporaAisle: "Fresh Produce (Green Cabbage + Chia Seeds or Green Plantains)",
    diasporaSubstitutes: ["Pure Unripe Plantain Flour", "Blended Green Cabbage with Psyllium", "Tigernut Meal"],
    preparationHack: "Blend 1/2 head of raw green cabbage with 2 tbsp water and 1 tbsp chia seeds. Cook in a non-stick pot on medium heat with 1 tbsp oat flour until a firm dough forms. Tastes remarkably mild and neutral with Egusi or Okra soup!",
    clinicalImpact: "Glucosinolates in cabbage support liver Phase II detoxification; resistant starch lowers post-meal glucose.",
    category: "swallows",
  },
  {
    id: "party-jollof",
    originalFood: "Party White Rice Jollof",
    originalEmoji: "🍚",
    originalIssue: "High GI refined polished rice, heavy industrial salt/Maggi cubes",
    originalGI: 78,
    originalSodiumMg: 850,
    originalCalories: 510,
    recommendedSwap: "Ancient Fonio Jollof or Ofada Brown Rice Jollof",
    swapEmoji: "🌾",
    swapGI: 45,
    swapSodiumMg: 210,
    swapCalories: 360,
    giReductionPct: 42,
    sodiumReductionPct: 75,
    fiberGainGrams: 7,
    proteinGainGrams: 14,
    diasporaStore: "Whole Foods / Sainsbury's / Amazon / Ethnic Grocers",
    diasporaAisle: "Ancient Grains / Health Foods (Fonio or Whole Grain Basmati)",
    diasporaSubstitutes: ["West African Fonio", "Bulgur Wheat Jollof", "Quinoa Jollof"],
    preparationHack: "Cook blended tomato-pepper sauce with fermented Iru, crayfish, and bay leaves. Pour in dry Fonio, turn off stove heat, cover tightly with foil for 4 minutes. The residual steam cooks the fonio into fluffy grains with 75% less sodium!",
    clinicalImpact: "Fonio contains sulfur-rich amino acids (methionine, cystine) essential for muscle maintenance and liver health.",
    category: "grains",
  },
  {
    id: "fried-dodo",
    originalFood: "Deep-Fried Ripe Plantain (Dodo)",
    originalEmoji: "🍌",
    originalIssue: "Deep frying in reused vegetable oil produces advanced glycation end-products (AGEs)",
    originalGI: 70,
    originalSodiumMg: 240,
    originalCalories: 380,
    recommendedSwap: "Air-Fried Cinnamon-Paprika Semi-Ripe Plantain",
    swapEmoji: "✨",
    swapGI: 48,
    swapSodiumMg: 35,
    swapCalories: 180,
    giReductionPct: 31,
    sodiumReductionPct: 85,
    fiberGainGrams: 4,
    proteinGainGrams: 2,
    diasporaStore: "Tesco / Sainsbury's / Walmart / Local Caribbean Shop",
    diasporaAisle: "Fresh Produce Aisle (Select yellow-green plantains)",
    diasporaSubstitutes: ["Air-Fried Sweet Potato Wedges", "Roasted Kabocha Squash", "Baked Plantain Rounds"],
    preparationHack: "Slice semi-ripe (yellow with green tips) plantains into rounds. Mist with 1/2 tsp avocado oil and dust with Ceylon cinnamon and smoked paprika. Air fry at 190°C (375°F) for 10 minutes until golden and caramelized.",
    clinicalImpact: "Saves 200 kcal of oxidized cooking oil per serving. Cinnamon contains cinnamaldehyde which activates insulin receptors.",
    category: "sides_drinks",
  },
  {
    id: "maggi-cubes",
    originalFood: "Industrial Bouillon / Seasoning Cubes",
    originalEmoji: "🧂",
    originalIssue: "High refined sodium (over 2,200mg per 2 cubes), monosodium glutamate, palm fillers",
    originalGI: 10,
    originalSodiumMg: 2200,
    originalCalories: 35,
    recommendedSwap: "Fermented Iru (Dawadawa) + Smoked Crayfish + Umami Dust",
    swapEmoji: "🌿",
    swapGI: 5,
    swapSodiumMg: 240,
    swapCalories: 25,
    giReductionPct: 50,
    sodiumReductionPct: 89,
    fiberGainGrams: 2,
    proteinGainGrams: 5,
    diasporaStore: "Afro-Caribbean Market / Asian Supermarket / Amazon",
    diasporaAisle: "African Spices (Dried Locust Beans / Crayfish Powder / Dried Porcini)",
    diasporaSubstitutes: ["Ground Dried Crayfish & Bay Leaf", "Dried Shiitake Mushroom Powder", "Organic Miso Paste + Nutritional Yeast"],
    preparationHack: "Blend dried locust beans (Iru) with dried crayfish, roasted garlic granules, dried thyme, and crushed dried bay leaves into a fine powder. Keep in an airtight spice jar and use 1 tsp as an all-natural, low-sodium umami powerhouse!",
    clinicalImpact: "Reduces sodium intake by 89%, significantly aiding blood pressure reduction in salt-sensitive hypertension.",
    category: "fats_seasoning",
  },
  {
    id: "bleached-palm-oil",
    originalFood: "Bleached Palm Oil (Smoked at High Heat)",
    originalEmoji: "🥘",
    originalIssue: "Smoking/bleaching destroys Vitamin E tocotrienols and creates acrolein & oxidized trans-lipids",
    originalGI: 0,
    originalSodiumMg: 0,
    originalCalories: 360,
    recommendedSwap: "Virgin Unbleached Red Palm Oil or Avocado Oil + Paprika",
    swapEmoji: "🥑",
    swapGI: 0,
    swapSodiumMg: 0,
    swapCalories: 220,
    giReductionPct: 0,
    sodiumReductionPct: 0,
    fiberGainGrams: 0,
    proteinGainGrams: 0,
    diasporaStore: "Health Food Stores / Whole Foods / African Grocery",
    diasporaAisle: "Cold-Pressed Oils (Unrefined Virgin Red Palm Oil or Avocado Oil)",
    diasporaSubstitutes: ["Extra Virgin Cold-Pressed Palm Fruit Oil", "Extra Virgin Avocado Oil with Sweet Paprika", "Cold-Pressed Extra Virgin Olive Oil"],
    preparationHack: "Never heat palm oil until white smoke rises. Heat gently on low heat with chopped onions for only 90 seconds. To get deep red color in diaspora, mix 1 tbsp extra virgin olive oil with 1/2 tsp Hungarian smoked sweet paprika!",
    clinicalImpact: "Unbleached red palm oil is the richest natural source of beta-carotene and tocotrienol Vitamin E, protecting vascular walls.",
    category: "fats_seasoning",
  },
  {
    id: "malt-drinks",
    originalFood: "Commercial African Malt Drinks",
    originalEmoji: "🥤",
    originalIssue: "Liquid fructose surge (over 42g refined sugar per bottle), rapid glycemic spike",
    originalGI: 95,
    originalSodiumMg: 45,
    originalCalories: 210,
    recommendedSwap: "Chilled Zobo-Hibiscus Elixir with Ginger & Sparkling Water",
    swapEmoji: "🌺",
    swapGI: 10,
    swapSodiumMg: 5,
    swapCalories: 25,
    giReductionPct: 89,
    sodiumReductionPct: 88,
    fiberGainGrams: 1,
    proteinGainGrams: 1,
    diasporaStore: "Tesco / Sainsbury's / Mexican Grocer (Flor de Jamaica) / Trader Joe's",
    diasporaAisle: "Teas & Herbal Infusions (Dried Hibiscus Flowers)",
    diasporaSubstitutes: ["Steeped Hibiscus (Flor de Jamaica) with Sparkling Water", "Brewed Rooibos with Fresh Lime", "Sparkling Lemon Ginger Water"],
    preparationHack: "Brew dried dark red hibiscus petals with crushed ginger and cloves for 15 minutes. Chill in fridge. Mix 50/50 with chilled sparkling mineral water and a squeeze of fresh lime for a fizzy, tart, ruby-red drink with zero added sugar!",
    clinicalImpact: "Hibiscus anthocyanins block ACE enzyme activity, promoting natural blood pressure relaxation and arterial elasticity.",
    category: "sides_drinks",
  },
];

export default function AfricanSwapEngine() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSwap, setSelectedSwap] = useState<FoodSwapItem>(AFRICAN_FOOD_SWAPS[0]);
  const [copiedStore, setCopiedStore] = useState(false);

  const categories = [
    { id: "all", label: "All Swaps 🍲" },
    { id: "swallows", label: "Swallows & Fufu 🥣" },
    { id: "grains", label: "Jollof & Grains 🌾" },
    { id: "fats_seasoning", label: "Oils & Seasoning 🌿" },
    { id: "sides_drinks", label: "Sides & Drinks 🍌" },
  ];

  const filteredSwaps = AFRICAN_FOOD_SWAPS.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const handleSelectSwap = (item: FoodSwapItem) => {
    triggerHaptic("light");
    setSelectedSwap(item);
  };

  const handleCopyStore = () => {
    triggerHaptic("success");
    triggerConfetti("burst");
    setCopiedStore(true);
    setTimeout(() => setCopiedStore(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-5 sm:p-6 border border-teal-100 dark:border-zinc-800 shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 text-teal-800 dark:text-teal-300 text-[10px] font-black uppercase tracking-wider mb-1">
            <Sparkles size={11} className="text-teal-600 animate-pulse" />
            <span>Clinical African Metabolic Engine</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            <span>African Glycemic &amp; Diaspora Swap Engine</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            Turn your favorite high-spike cultural foods into blood-sugar safe, low-sodium power meals.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              triggerHaptic("light");
              setSelectedCategory(cat.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[#1f7a8c] text-white shadow-sm"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Food Swap Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {filteredSwaps.map((item) => {
          const isSelected = selectedSwap.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectSwap(item)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-teal-50/90 dark:bg-teal-950/50 border-[#1f7a8c] ring-2 ring-[#1f7a8c]/20 shadow-md scale-[1.02]"
                  : "bg-white dark:bg-zinc-800/60 border-gray-100 dark:border-zinc-700/80 hover:border-teal-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{item.originalEmoji}</span>
                <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-md">
                  GI {item.originalGI}
                </span>
              </div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-zinc-100 line-clamp-1">
                {item.originalFood}
              </h4>
              <div className="flex items-center gap-1 text-[10px] text-teal-700 dark:text-teal-300 font-extrabold mt-1">
                <TrendingDown size={11} />
                <span>-{item.giReductionPct}% Spike</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Swap Detail Showcase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSwap.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="bg-gradient-to-br from-teal-900 via-[#17525f] to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

          {/* Top Comparison Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pb-5 border-b border-teal-800/80">
            {/* Left: Original Classic */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="flex items-center justify-between text-xs text-rose-300 font-bold mb-1">
                <span>Traditional Classic</span>
                <span className="bg-rose-500/20 px-2 py-0.5 rounded-md text-rose-200">High Impact</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedSwap.originalEmoji}</span>
                <div>
                  <h3 className="text-sm font-black text-white">{selectedSwap.originalFood}</h3>
                  <p className="text-[11px] text-teal-200/80 mt-0.5 leading-tight">{selectedSwap.originalIssue}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/10 text-[10px] text-teal-100">
                <span>GI: <strong className="text-white">{selectedSwap.originalGI}</strong></span>
                <span>•</span>
                <span>Sodium: <strong className="text-white">{selectedSwap.originalSodiumMg}mg</strong></span>
                <span>•</span>
                <span>Cals: <strong className="text-white">{selectedSwap.originalCalories}</strong></span>
              </div>
            </div>

            {/* Right: Healthy Super Swap */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-400/30">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-1">
                <span>MealOptimiza Super Swap</span>
                <span className="bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-md text-[10px]">
                  GLYCEMIC SAFE ✨
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedSwap.swapEmoji}</span>
                <div>
                  <h3 className="text-sm font-black text-emerald-300">{selectedSwap.recommendedSwap}</h3>
                  <p className="text-[11px] text-emerald-100/90 mt-0.5 leading-tight">
                    {selectedSwap.clinicalImpact}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-emerald-400/20 text-[10px] text-emerald-200">
                <span>GI: <strong className="text-white">{selectedSwap.swapGI} (-{selectedSwap.giReductionPct}%)</strong></span>
                <span>•</span>
                <span>Sodium: <strong className="text-white">{selectedSwap.swapSodiumMg}mg</strong></span>
                <span>•</span>
                <span>Fiber: <strong className="text-white">+{selectedSwap.fiberGainGrams}g</strong></span>
              </div>
            </div>
          </div>

          {/* 3 Impact Pill Metrics */}
          <div className="grid grid-cols-3 gap-2 my-4">
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] text-teal-200 block uppercase font-bold">Glucose Surge</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                -{selectedSwap.giReductionPct}% Spike
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] text-teal-200 block uppercase font-bold">Sodium Load</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                -{selectedSwap.sodiumReductionPct}% Sodium
              </span>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
              <span className="text-[10px] text-teal-200 block uppercase font-bold">Digestive Fiber</span>
              <span className="text-sm sm:text-base font-black text-amber-300">
                +{selectedSwap.fiberGainGrams}g Fiber
              </span>
            </div>
          </div>

          {/* Cooking Hack & Preparation Guide */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-teal-500/20 mb-4">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1.5">
              <Utensils size={14} />
              <span>Avo's Kitchen Preparation Protocol:</span>
            </div>
            <p className="text-xs text-teal-50 leading-relaxed">
              {selectedSwap.preparationHack}
            </p>
          </div>

          {/* Diaspora Sourcing Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-teal-500/30 rounded-xl text-teal-200 shrink-0">
                <Globe size={16} />
              </div>
              <div>
                <span className="text-[10px] text-teal-200 uppercase font-extrabold block">
                  Diaspora Grocery Sourcing (UK, US, Canada, Europe)
                </span>
                <p className="text-xs font-bold text-white mt-0.5">
                  Available at: {selectedSwap.diasporaStore}
                </p>
                <p className="text-[11px] text-teal-100/80">
                  Find in: {selectedSwap.diasporaAisle}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyStore}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md shrink-0"
            >
              {copiedStore ? (
                <>
                  <CheckCircle2 size={13} />
                  <span>Saved to Grocery 🛒</span>
                </>
              ) : (
                <>
                  <Zap size={13} />
                  <span>Copy Sourcing Guide</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
