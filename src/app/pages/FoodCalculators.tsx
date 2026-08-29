import React, { useState } from "react";
import { 
  Calculator, 
  ArrowLeft, 
  Sparkles, 
  TrendingDown, 
  Heart, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Flame, 
  Droplet, 
  Utensils, 
  Scale, 
  ArrowRight, 
  Info,
  Zap,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router";
import AppLogo from "../components/AppLogo";
import Mascot from "../components/Mascot";
import { toast } from "sonner";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

type CalculatorTab = "swallow" | "sodium" | "sequence";

export default function FoodCalculators() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CalculatorTab>("swallow");

  // ==========================================
  // TAB 1: SWALLOW CARB & SWAP CALCULATOR STATE
  // ==========================================
  const swallowOptions = [
    { name: "Pounded Yam (Iyan)", gi: 85, carbsPer100g: 35.5, calPer100g: 155, category: "High GI 🚨" },
    { name: "White Garri (Eba)", gi: 82, carbsPer100g: 38.0, calPer100g: 160, category: "High GI 🚨" },
    { name: "White Cassava Fufu / Akpu", gi: 84, carbsPer100g: 36.2, calPer100g: 158, category: "High GI 🚨" },
    { name: "Semovita / Semolina", gi: 78, carbsPer100g: 34.0, calPer100g: 150, category: "High GI 🚨" },
    { name: "Tuwo Shinkafa (Rice)", gi: 80, carbsPer100g: 32.0, calPer100g: 145, category: "High GI 🚨" },
    { name: "Banku (Corn & Cassava)", gi: 76, carbsPer100g: 30.5, calPer100g: 140, category: "Moderate GI 🟡" },
    { name: "Black Amala (Yam Peel / Isu)", gi: 62, carbsPer100g: 28.0, calPer100g: 125, category: "Moderate GI 🟡" },
    { name: "Plantain-Oat Swallow (Optimized)", gi: 45, carbsPer100g: 18.5, calPer100g: 95, category: "Low GI 🟢" },
  ];

  const [selectedSwallow, setSelectedSwallow] = useState(swallowOptions[0]);
  const [portionSizeGrams, setPortionSizeGrams] = useState(250); // 250g is standard medium wrap

  // Low-GI Alternatives Database
  const lowGiSwaps = [
    {
      name: "Plantain-Oat Swallow 🥑",
      recipe: "50% Unripe Plantain Flour + 50% Rolled Oat Flour",
      gi: 42,
      carbsPer100g: 18.0,
      calPer100g: 90,
      benefit: "High soluble beta-glucan fiber blunts gastric sugar dump.",
    },
    {
      name: "Almond-Psyllium Fufu 🌿",
      recipe: "Almond Flour + 1 tbsp Psyllium Husk gel binder",
      gi: 25,
      carbsPer100g: 8.5,
      calPer100g: 85,
      benefit: "Near-zero glycemic load. Perfect for Type 2 Diabetes reversal.",
    },
    {
      name: "Cauliflower-Mash Swallow 🥣",
      recipe: "Steamed Pureed Cauliflower + Xanthan / Psyllium binder",
      gi: 15,
      carbsPer100g: 4.5,
      calPer100g: 35,
      benefit: "Ultra low-carb. Absorbs rich Egusi & Ogbono flavors seamlessly.",
    },
  ];

  const [selectedSwap, setSelectedSwap] = useState(lowGiSwaps[0]);

  // Calculations for Swallow
  const originalCarbs = Math.round((selectedSwallow.carbsPer100g * portionSizeGrams) / 100);
  const originalCalories = Math.round((selectedSwallow.calPer100g * portionSizeGrams) / 100);
  const originalGL = Math.round((originalCarbs * selectedSwallow.gi) / 100);

  const swapCarbs = Math.round((selectedSwap.carbsPer100g * portionSizeGrams) / 100);
  const swapCalories = Math.round((selectedSwap.calPer100g * portionSizeGrams) / 100);
  const swapGL = Math.round((swapCarbs * selectedSwap.gi) / 100);

  const carbsSaved = originalCarbs - swapCarbs;
  const caloriesSaved = originalCalories - swapCalories;
  const spikeRiskReduction = Math.round(((originalGL - swapGL) / Math.max(originalGL, 1)) * 100);

  // ==========================================
  // TAB 2: SOUP SODIUM & OIL DILUTION STATE
  // ==========================================
  const soupOptions = [
    { name: "Egusi Soup (Melon Seed)", baseSodiumPerLadle: 780, baseOilTbsp: 2.2, baseCal: 320 },
    { name: "Banga Soup (Palm Nut)", baseSodiumPerLadle: 850, baseOilTbsp: 3.0, baseCal: 380 },
    { name: "Ogbono Soup (Bush Mango)", baseSodiumPerLadle: 740, baseOilTbsp: 1.8, baseCal: 290 },
    { name: "Afang Soup (Okazi & Waterleaf)", baseSodiumPerLadle: 690, baseOilTbsp: 1.5, baseCal: 240 },
    { name: "Efo Riro (Vegetable Stew)", baseSodiumPerLadle: 620, baseOilTbsp: 1.4, baseCal: 210 },
    { name: "Oha Soup", baseSodiumPerLadle: 650, baseOilTbsp: 1.6, baseCal: 250 },
    { name: "Groundnut / Peanut Soup", baseSodiumPerLadle: 790, baseOilTbsp: 2.0, baseCal: 340 },
  ];

  const [selectedSoup, setSelectedSoup] = useState(soupOptions[0]);
  const [ladlesCount, setLadlesCount] = useState(2); // standard serving
  const [seasoningIntensity, setSeasoningIntensity] = useState<"commercial_heavy" | "commercial_moderate" | "iru_heart_smart">("commercial_moderate");
  const [palmOilLevel, setPalmOilLevel] = useState<"heavy" | "moderate" | "light">("moderate");

  // Multipliers
  const seasoningMultiplier = seasoningIntensity === "commercial_heavy" ? 1.4 : seasoningIntensity === "commercial_moderate" ? 1.0 : 0.4;
  const oilMultiplier = palmOilLevel === "heavy" ? 1.5 : palmOilLevel === "moderate" ? 1.0 : 0.5;

  const totalSodiumMg = Math.round(selectedSoup.baseSodiumPerLadle * ladlesCount * seasoningMultiplier);
  const totalPalmOilTbsp = (selectedSoup.baseOilTbsp * ladlesCount * oilMultiplier).toFixed(1);
  const totalSoupCalories = Math.round(selectedSoup.baseCal * ladlesCount * oilMultiplier);
  const dailySodiumPercent = Math.min(100, Math.round((totalSodiumMg / 1500) * 100)); // 1500mg AHA Cap

  // ==========================================
  // TAB 3: PLATE SEQUENCING CALCULATOR STATE
  // ==========================================
  const [plateCarb, setPlateCarb] = useState("Jollof Rice (1 Cup)");
  const [plateProtein, setPlateProtein] = useState("Grilled Mackerel Fish");
  const [plateFiber, setPlateFiber] = useState("Steamed Spinach / Veggie Salad");
  const [eatingSequence, setEatingSequence] = useState<"standard" | "optimized">("optimized");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-slate-50 text-slate-900 font-sans pb-24 selection:bg-teal-200">
      
      {/* 1. TOP HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-teal-100 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <Calculator size={16} className="text-[#1f7a8c]" />
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-none">
                Metabolic Food Calculators
              </h1>
            </div>
            <p className="text-[10.5px] text-slate-500 font-medium mt-0.5">
              Clinical &amp; Cultural Glycemic Engines
            </p>
          </div>
        </div>

        <AppLogo size="sm" />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5">
        
        {/* 2. MASCOT INTRO BANNER */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-teal-100 shadow-md mb-5 flex items-center gap-3.5">
          <Mascot gesture="pointing" size={60} className="shrink-0 drop-shadow-xs" />
          <div className="min-w-0">
            <span className="text-[9.5px] font-black uppercase tracking-wider bg-teal-50 text-[#1f7a8c] px-2.5 py-0.5 rounded-full border border-teal-200">
              Dr. Avo's Clinical Kitchen 🥑
            </span>
            <p className="text-xs text-slate-700 font-semibold mt-1 leading-snug">
              Calculate exact carbs, predict blood sugar spikes, and dilute soup sodium before taking your first bite!
            </p>
          </div>
        </div>

        {/* 3. 3-TAB SEGMENTED CONTROLLER */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex gap-1 mb-6 shadow-inner">
          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("swallow");
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "swallow"
                ? "bg-white text-[#1f7a8c] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🥣</span>
            <span className="truncate">Swallow Swap</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("sodium");
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "sodium"
                ? "bg-white text-[#1f7a8c] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🧂</span>
            <span className="truncate">Soup Sodium</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic("light");
              setActiveTab("sequence");
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "sequence"
                ? "bg-white text-[#1f7a8c] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📉</span>
            <span className="truncate">Plate Sequence</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: SWALLOW CARB & GLYCEMIC SWAP CALCULATOR           */}
        {/* ======================================================== */}
        {activeTab === "swallow" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Input Controls Card */}
            <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>1. Choose Traditional Swallow:</span>
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                  {selectedSwallow.category}
                </span>
              </div>

              <select
                value={selectedSwallow.name}
                onChange={(e) => {
                  triggerHaptic("light");
                  const item = swallowOptions.find((s) => s.name === e.target.value) || swallowOptions[0];
                  setSelectedSwallow(item);
                }}
                className="w-full p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 text-xs font-black text-slate-900 focus:border-[#1f7a8c] outline-none"
              >
                {swallowOptions.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} — GI: {s.gi}
                  </option>
                ))}
              </select>

              {/* Portion Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">Portion Size:</span>
                  <span className="text-[#1f7a8c] font-black">
                    {portionSizeGrams}g ({portionSizeGrams <= 150 ? "Small Wrap" : portionSizeGrams <= 280 ? "Standard Medium" : "Large Restaurant Wrap"})
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="450"
                  step="25"
                  value={portionSizeGrams}
                  onChange={(e) => setPortionSizeGrams(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1f7a8c]"
                />
                <div className="flex justify-between text-[9.5px] text-slate-400 font-bold mt-1">
                  <span>100g (Light)</span>
                  <span>250g (Standard)</span>
                  <span>450g (Double Wrap)</span>
                </div>
              </div>

              {/* Swap Target Selector */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-black text-slate-800 block mb-2">
                  2. Select Clinical Low-GI Swap:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {lowGiSwaps.map((swap) => (
                    <button
                      key={swap.name}
                      onClick={() => {
                        triggerHaptic("light");
                        setSelectedSwap(swap);
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selectedSwap.name === swap.name
                          ? "border-emerald-500 bg-emerald-50/70 shadow-xs"
                          : "border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{swap.name}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                          GI: {swap.gi} (Low)
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 font-medium mt-0.5">{swap.recipe}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Comparison Payoff Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-300 uppercase tracking-wider text-[10px]">Glycemic Impact Comparison</span>
                <span className="text-emerald-400 font-black">-{spikeRiskReduction}% Spike Drop 🔥</span>
              </div>

              {/* Before vs After Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-red-300">{selectedSwallow.name} ({portionSizeGrams}g):</span>
                    <span className="text-red-400 font-black">{originalCarbs}g Carbs • {originalCalories} kcal</span>
                  </div>
                  <div className="w-full h-3 bg-red-950 rounded-full overflow-hidden p-0.5 border border-red-800/40">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-[90%]" />
                  </div>
                  <span className="text-[10px] text-red-400 font-semibold block mt-0.5">
                    Glycemic Load: {originalGL} (Severe Post-Meal Spike Risk 🚨)
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-300">{selectedSwap.name} ({portionSizeGrams}g):</span>
                    <span className="text-emerald-400 font-black">{swapCarbs}g Carbs • {swapCalories} kcal</span>
                  </div>
                  <div className="w-full h-3 bg-emerald-950 rounded-full overflow-hidden p-0.5 border border-emerald-800/40">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full w-[35%]" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                    Glycemic Load: {swapGL} (Safe Diabetic Green Zone 🟢)
                  </span>
                </div>
              </div>

              {/* Savings Matrix */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center">
                <div className="bg-slate-800/80 p-2.5 rounded-2xl">
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Carbs Cut</span>
                  <span className="text-sm sm:text-base font-black text-emerald-300">-{carbsSaved}g</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-2xl">
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Calories Cut</span>
                  <span className="text-sm sm:text-base font-black text-yellow-300">-{caloriesSaved} kcal</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-2xl">
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold block">GL Buffer</span>
                  <span className="text-sm sm:text-base font-black text-teal-300">Safe Zone</span>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerConfetti("burst");
                  triggerHaptic("success");
                  toast.success(`Saved ${selectedSwap.name} swap to your dashboard!`, {
                    description: `You cut ${carbsSaved}g carbs and ${caloriesSaved} calories.`,
                  });
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-2xl font-black text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Adopt Swap &amp; Save to Dashboard</span>
                <CheckCircle2 size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SOUP SODIUM & PALM OIL DILUTION CALCULATOR        */}
        {/* ======================================================== */}
        {activeTab === "sodium" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-md space-y-4">
              <h2 className="text-sm font-black text-slate-900">
                1. Select Traditional African Soup:
              </h2>

              <select
                value={selectedSoup.name}
                onChange={(e) => {
                  triggerHaptic("light");
                  const item = soupOptions.find((s) => s.name === e.target.value) || soupOptions[0];
                  setSelectedSoup(item);
                }}
                className="w-full p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 text-xs font-black text-slate-900 focus:border-[#1f7a8c] outline-none"
              >
                {soupOptions.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Number of Ladles */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">Portion (Soup Ladles):</span>
                  <span className="text-[#1f7a8c] font-black">{ladlesCount} Ladles (~{ladlesCount * 120}g)</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setLadlesCount(num)}
                      className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                        ladlesCount === num
                          ? "border-[#1f7a8c] bg-teal-50 text-[#1f7a8c] shadow-xs"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {num} {num === 1 ? "Ladle" : "Ladles"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seasoning Profile */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-1.5">
                  Seasoning Style:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "commercial_heavy", label: "Heavy Bouillon Cubes (Maggi/Knorr + Salt)", badge: "High Sodium 🚨", desc: "Commercial restaurant & party style" },
                    { id: "commercial_moderate", label: "Moderate (1 Cube + Light Salt)", badge: "Standard 🟡", desc: "Average home cooking" },
                    { id: "iru_heart_smart", label: "Heart-Smart (Fermented Iru/Dawadawa + Crayfish)", badge: "Heart Safe 🟢", desc: "Natural umami, zero chemical sodium" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        triggerHaptic("light");
                        setSeasoningIntensity(style.id as any);
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        seasoningIntensity === style.id
                          ? "border-[#1f7a8c] bg-teal-50/70"
                          : "border-slate-200 hover:border-teal-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900">{style.label}</span>
                        <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sodium Impact & Dilution Recommendation */}
            <div className="bg-white rounded-3xl p-5 border-2 border-red-100 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldAlert size={16} className="text-red-500" />
                  <span>Cardiovascular Sodium Score:</span>
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  totalSodiumMg > 1500 ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {totalSodiumMg} mg ({dailySodiumPercent}% Daily Cap)
                </span>
              </div>

              {/* Visual Sodium Meter */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    dailySodiumPercent > 80 ? "bg-red-500" : dailySodiumPercent > 50 ? "bg-yellow-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, dailySodiumPercent)}%` }}
                />
              </div>

              {/* Heart Prescription Dilution Protocol */}
              <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-2xl text-xs space-y-1.5">
                <span className="font-black text-[#1f7a8c] flex items-center gap-1">
                  <Droplet size={14} className="text-teal-600" />
                  <span>Sarah's Heart-Shield Dilution Protocol:</span>
                </span>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  💧 <strong>Hydration Flush:</strong> Drink <strong>500ml of unsweetened Zobo water</strong> within 45 minutes to accelerate renal sodium clearance.
                </p>
                <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                  🌿 <strong>Potassium Absorption:</strong> Add <strong>1 cup of fresh Ugwu/Spinach</strong> to this soup to provide 450mg potassium and balance arterial pressure.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PLATE SEQUENCING & GLUCOSE BUFFER CALCULATOR      */}
        {/* ======================================================== */}
        {activeTab === "sequence" && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-md space-y-4">
              <h2 className="text-sm font-black text-slate-900">
                1. What is on your plate today?
              </h2>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    🌿 Fiber / Veggie Starter:
                  </label>
                  <select
                    value={plateFiber}
                    onChange={(e) => setPlateFiber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    <option>Steamed Spinach / Veggie Salad</option>
                    <option>Viscous Slimy Ewedu / Okro</option>
                    <option>Garden Egg with Peanut Dip</option>
                    <option>Steamed Cabbage Slaw (No Mayo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    🍗 Protein &amp; Healthy Fats:
                  </label>
                  <select
                    value={plateProtein}
                    onChange={(e) => setPlateProtein(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    <option>Grilled Mackerel Fish (Omega-3)</option>
                    <option>Roasted Chicken Breast</option>
                    <option>Boiled Eggs (2 whole)</option>
                    <option>Lean Goat Meat / Beef</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    🍚 Starch / Carbohydrate:
                  </label>
                  <select
                    value={plateCarb}
                    onChange={(e) => setPlateCarb(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    <option>Jollof Rice (1 Cup)</option>
                    <option>Fried Plantain (Dodo - 6 slices)</option>
                    <option>Pounded Yam (1 wrap)</option>
                    <option>White Bread (3 slices)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* The Golden Clinical Sequence */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-yellow-400 flex items-center gap-1">
                  <Zap size={14} /> Biochemical Eating Order
                </span>
                <span className="text-emerald-400">-38% Spike Drop</span>
              </div>

              <div className="space-y-2.5 text-xs font-medium">
                {/* Step 1 */}
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-300 block">FIRST (Minute 0–4): Eat Fiber</span>
                    <span className="text-[11px] text-slate-300">
                      Eat all {plateFiber}. Forms a viscous mesh in the small intestine to block fast sugar absorption.
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 bg-teal-950/60 border border-teal-500/40 rounded-2xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <span className="text-xs font-black text-teal-300 block">SECOND (Minute 4–8): Eat Protein</span>
                    <span className="text-[11px] text-slate-300">
                      Eat {plateProtein}. Stimulates GLP-1 hormone release and slows gastric emptying.
                    </span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <span className="text-xs font-black text-yellow-300 block">LAST: Enjoy Your Carbohydrate</span>
                    <span className="text-[11px] text-slate-300">
                      Now eat {plateCarb}. Starch enters bloodstream slowly, maintaining steady energy!
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl text-[11px] text-slate-300 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400 shrink-0" />
                <span>
                  <strong>Clinical Fact:</strong> Changing your eating sequence reduces postprandial glucose spikes as effectively as some diabetic medications, with zero hunger!
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
