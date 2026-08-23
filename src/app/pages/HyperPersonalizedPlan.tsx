import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ChefHat,
  Activity,
  Brain,
  Zap,
  Moon,
  Utensils,
  Clock,
  FlaskConical,
  Leaf,
  Download,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Heart,
  Flame,
  Globe,
  Share2,
  CheckCircle2,
  Plus,
  ChevronRight,
  Info,
  SlidersHorizontal,
  Bookmark,
  Calendar,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import { generateDailyMealPlan, FunctionalMeal, DailyMealPlan } from "../utils/mealPlanGenerator";
import { Button } from "../components/ui/button";
import AmbientBackground from "../components/AmbientBackground";
import Mascot from "../components/Mascot";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { createMealLog } from "../../lib/api";
import { motion, AnimatePresence } from "motion/react";

type ClinicalFocus = "glucose" | "cardio" | "fatloss" | "brain";
type SourcingMode = "continental" | "diaspora";

export default function HyperPersonalizedPlan() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [clinicalFocus, setClinicalFocus] = useState<ClinicalFocus>("glucose");
  const [sourcingMode, setSourcingMode] = useState<SourcingMode>("continental");
  const [loading, setLoading] = useState<boolean>(true);
  const [weeklyPlans, setWeeklyPlans] = useState<DailyMealPlan[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<FunctionalMeal | null>(null);
  const [swappedMeals, setSwappedMeals] = useState<Record<string, string>>({});
  const [savedPlans, setSavedPlans] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("saved_meal_plans") || "[]");
    } catch {
      return [];
    }
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Generate a full 7-day personalized plan
  const generate7DayPlan = () => {
    setLoading(true);
    triggerHaptic("medium");

    setTimeout(() => {
      const userProfile = {
        age: parseInt(localStorage.getItem("userAge") || "35"),
        sex: (localStorage.getItem("userSex") || "female") as "male" | "female" | "other",
        weight: parseInt(localStorage.getItem("userWeight") || "74"),
        height: parseInt(localStorage.getItem("userHeight") || "168"),
        medicalConditions:
          clinicalFocus === "glucose"
            ? ["Type 2 Diabetes", "Insulin Resistance"]
            : clinicalFocus === "cardio"
            ? ["Hypertension", "DASH Sodium Control"]
            : clinicalFocus === "fatloss"
            ? ["Weight Management", "Metabolic Syndrome"]
            : ["Cognitive Focus"],
        allergies: JSON.parse(localStorage.getItem("allergies") || "[]"),
        activityLevel: "moderate" as const,
        location: sourcingMode === "continental" ? "Lagos, Nigeria" : "London / United States",
        dietaryPreference: "omnivore" as const,
        goals: [clinicalFocus],
        sleepQuality: "fair" as const,
        stressLevel: "moderate" as const,
      };

      const plans: DailyMealPlan[] = [];
      for (let i = 0; i < 7; i++) {
        const p = generateDailyMealPlan(userProfile);
        p.date = daysOfWeek[i];
        plans.push(p);
      }

      setWeeklyPlans(plans);
      setLoading(false);
      triggerHaptic("success");
      toast.success("✨ 7-Day Clinical Bio-Plan Generated!");
    }, 600);
  };

  useEffect(() => {
    generate7DayPlan();
  }, [clinicalFocus, sourcingMode]);

  const currentPlan = weeklyPlans[selectedDay] || weeklyPlans[0];

  // Helper for meal styling
  const getMealTheme = (meal: FunctionalMeal) => {
    if (meal.functionalType === "pre-activation")
      return {
        bg: "from-amber-500 via-orange-500 to-rose-500",
        badge: "bg-amber-100 text-amber-900 border-amber-200",
        tag: "Pre-Activation Fuel 🌅",
        accent: "text-amber-600",
      };
    if (meal.functionalType === "elevenses")
      return {
        bg: "from-purple-600 via-indigo-600 to-blue-600",
        badge: "bg-purple-100 text-purple-900 border-purple-200",
        tag: "Elevenses Cognitive Bridge 🧠",
        accent: "text-purple-600",
      };
    if (meal.functionalType === "recovery-vector")
      return {
        bg: "from-teal-600 via-emerald-600 to-cyan-600",
        badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
        tag: "Recovery & Glycemic Anchor 🌾",
        accent: "text-emerald-600",
      };
    if (meal.functionalType === "merienda")
      return {
        bg: "from-yellow-500 via-amber-500 to-orange-500",
        badge: "bg-yellow-100 text-yellow-900 border-yellow-200",
        tag: "The Merienda Satiety Shield 🍲",
        accent: "text-yellow-700",
      };
    if (meal.functionalType === "nocturnal-buffer")
      return {
        bg: "from-slate-800 via-indigo-950 to-slate-900",
        badge: "bg-indigo-100 text-indigo-900 border-indigo-200",
        tag: "Nocturnal Fasting & Sleep Buffer 🌙",
        accent: "text-indigo-400",
      };
    return {
      bg: "from-[#1f7a8c] to-[#4ecdc4]",
      badge: "bg-teal-100 text-teal-900 border-teal-200",
      tag: "Functional Bio-Meal 🥗",
      accent: "text-[#1f7a8c]",
    };
  };

  // Add all ingredients of meal to smart grocery list
  const handleAddToGroceryList = (meal: FunctionalMeal) => {
    try {
      const existing = JSON.parse(localStorage.getItem("grocery_list") || "[]");
      const newItems = meal.ingredients.map((ing) => ({
        id: Date.now() + Math.random().toString(),
        name: ing,
        category: "Produce & Proteins",
        checked: false,
        source: meal.name,
      }));
      localStorage.setItem("grocery_list", JSON.stringify([...existing, ...newItems]));
      triggerConfetti("cannon");
      triggerHaptic("success");
      toast.success(`🛒 Added ${meal.ingredients.length} ingredients to Grocery List!`);
    } catch {
      toast.error("Failed to add to grocery list");
    }
  };

  // Log meal into Daily Diary
  const handleLogThisMeal = async (meal: FunctionalMeal) => {
    try {
      await createMealLog({
        mealType: "lunch",
        foodName: meal.name,
        calories: meal.calories,
        protein: Math.round((meal.calories * (meal.macroRatio.protein / 100)) / 4),
        carbs: Math.round((meal.calories * (meal.macroRatio.carbs / 100)) / 4),
        fats: Math.round((meal.calories * (meal.macroRatio.fats / 100)) / 9),
        bloodSugarImpact: "low",
      });
      triggerConfetti("fireworks");
      triggerHaptic("milestone");
      toast.success(`🎉 Logged "${meal.name}" (${meal.calories} kcal) into Daily Food Diary!`);
      setSelectedMeal(null);
    } catch {
      toast.error("Could not save meal log");
    }
  };

  // Save full 7-day plan to bookmarks
  const handleBookmarkPlan = () => {
    const planId = `${clinicalFocus}_${sourcingMode}_${Date.now()}`;
    const nextSaved = [...savedPlans, planId];
    setSavedPlans(nextSaved);
    localStorage.setItem("saved_meal_plans", JSON.stringify(nextSaved));
    triggerHaptic("milestone");
    toast.success("📑 7-Day Bio-Plan Saved to Your Clinical Vault!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 text-slate-800 relative select-none">
      {/* High-Visibility Ambient Depth */}
      <AmbientBackground />

      {/* 1. Header Navigation */}
      <div className="relative z-10 bg-gradient-to-r from-[#0b3c47] via-[#125e6d] to-[#1f7a8c] text-white pt-10 pb-6 px-5 sm:px-6 rounded-b-[2.5rem] shadow-xl border-b border-teal-500/20">
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkPlan}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
              title="Bookmark 7-Day Plan"
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              onClick={generate7DayPlan}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
              title="Regenerate Bio-Plan"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                window.print();
                toast.success("🖨️ Preparing Clinical Plan Printout...");
              }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
              title="Export PDF / Print"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] uppercase font-black tracking-widest text-teal-200">
              Personalized Cultural Nutrition
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            My 7-Day Meal Plan 🍲
          </h1>
          <p className="text-xs text-teal-100/90 font-medium mt-1">
            Real African & diaspora meals balanced for your blood sugar, blood pressure, and daily energy.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-5 relative z-10">
        {/* 2. Clinical Target Dial (Interactive Selector) */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-teal-100">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block mb-2 px-1">
            Select Clinical Focus
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "glucose", label: "Glycemic Shield", icon: ShieldCheck, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
              { id: "cardio", label: "DASH Blood Pressure", icon: Heart, color: "text-rose-700 bg-rose-50 border-rose-200" },
              { id: "fatloss", label: "Metabolic Fat Burn", icon: Flame, color: "text-amber-700 bg-amber-50 border-amber-200" },
              { id: "brain", label: "Brain & Focus", icon: Brain, color: "text-purple-700 bg-purple-50 border-purple-200" },
            ].map((target) => {
              const Icon = target.icon;
              const active = clinicalFocus === target.id;
              return (
                <button
                  key={target.id}
                  onClick={() => setClinicalFocus(target.id as ClinicalFocus)}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    active
                      ? "bg-[#1f7a8c] text-white border-[#1f7a8c] shadow-sm scale-[1.02]"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
                  }`}
                >
                  <Icon size={16} className={active ? "text-teal-200" : "text-[#1f7a8c]"} />
                  <span className="text-[11px] font-black mt-2 leading-tight block">
                    {target.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sourcing Location Toggle */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-600 flex items-center gap-1.5">
              <Globe size={14} className="text-[#1f7a8c]" />
              <span>Ingredient Sourcing Mode:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setSourcingMode("continental")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                  sourcingMode === "continental" ? "bg-white text-teal-900 shadow-xs" : "text-slate-500"
                }`}
              >
                🇳🇬 Continental (Lagos)
              </button>
              <button
                onClick={() => setSourcingMode("diaspora")}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                  sourcingMode === "diaspora" ? "bg-white text-teal-900 shadow-xs" : "text-slate-500"
                }`}
              >
                🇬🇧 🇺🇸 Diaspora (US/UK)
              </button>
            </div>
          </div>
        </div>

        {/* 3. 7-Day Day-by-Day Carousel Navigator */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-3.5 shadow-sm border border-teal-100">
          <div className="flex items-center justify-between mb-2 px-1 text-xs font-black text-slate-800">
            <span className="flex items-center gap-1">
              <Calendar size={14} className="text-[#1f7a8c]" />
              <span>7-Day Schedule</span>
            </span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
              {daysOfWeek[selectedDay]}
            </span>
          </div>

          {/* Horizontal Day Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {daysOfWeek.map((day, idx) => (
              <button
                key={day}
                onClick={() => setSelectedDay(idx)}
                className={`flex-1 min-w-[62px] py-2 px-2 rounded-2xl text-center transition-all cursor-pointer ${
                  selectedDay === idx
                    ? "bg-gradient-to-br from-[#1f7a8c] to-[#4ecdc4] text-white shadow-sm font-black"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-100"
                }`}
              >
                <span className="text-[10px] opacity-80 block uppercase">Day {idx + 1}</span>
                <span className="text-xs font-black block">{day.slice(0, 3)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Metabolic Strategy & Avo Coaching Banner */}
        {currentPlan && (
          <div className="bg-gradient-to-br from-[#0b3c47] to-[#1f7a8c] text-white rounded-3xl p-5 shadow-md flex items-center gap-4">
            <Mascot gesture="flex" size={54} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-teal-300 block">
                Clinical Prescription
              </span>
              <h3 className="font-extrabold text-sm text-white leading-snug">
                {currentPlan.metabolicStrategy}
              </h3>
              <p className="text-[11px] text-teal-100/90 mt-1 font-medium leading-relaxed">
                {currentPlan.culturalAlignment}
              </p>
            </div>
          </div>
        )}

        {/* 5. Daily Macros Summary Bar */}
        {currentPlan && (
          <div className="bg-white/95 rounded-3xl p-4 shadow-sm border border-teal-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Daily Fuel Target:</span>
              <span className="text-base font-black text-[#1f7a8c]">
                {Math.round(currentPlan.totalCalories)} kcal
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-2">
                <span className="text-[10px] text-orange-700 font-bold block">Carbs (Slow GI)</span>
                <span className="text-sm font-black text-orange-900">
                  {Math.round(currentPlan.totalMacros.carbs)}g
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-2">
                <span className="text-[10px] text-blue-700 font-bold block">Lean Protein</span>
                <span className="text-sm font-black text-blue-900">
                  {Math.round(currentPlan.totalMacros.protein)}g
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2">
                <span className="text-[10px] text-emerald-700 font-bold block">Healthy Lipids</span>
                <span className="text-sm font-black text-emerald-900">
                  {Math.round(currentPlan.totalMacros.fats)}g
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 6. Functional Meal Timeline */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-[#1f7a8c]" />
              <span>{daysOfWeek[selectedDay]} Functional Menu</span>
            </h2>
            <span className="text-[11px] font-bold text-slate-500">
              {currentPlan?.meals?.length || 0} Engineered Courses
            </span>
          </div>

          {currentPlan?.meals?.map((meal, idx) => {
            const theme = getMealTheme(meal);
            return (
              <div
                key={meal.id || idx}
                className="bg-white/95 rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-all group"
              >
                {/* Header Gradient */}
                <div className={`bg-gradient-to-r ${theme.bg} p-4 text-white flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider opacity-90 block">
                      {theme.tag}
                    </span>
                    <h3 className="font-black text-base leading-tight mt-0.5">{meal.name}</h3>
                    <span className="text-[11px] opacity-90 font-medium">{meal.time}</span>
                  </div>
                  <div className="text-right shrink-0 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
                    <span className="text-base font-black block leading-none">{meal.calories}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">kcal</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "{meal.culinaryDescription}"
                  </p>

                  {/* Macro Visual Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>C:{meal.macroRatio.carbs}%</span>
                      <span>P:{meal.macroRatio.protein}%</span>
                      <span>F:{meal.macroRatio.fats}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="bg-orange-500" style={{ width: `${meal.macroRatio.carbs}%` }} />
                      <div className="bg-blue-500" style={{ width: `${meal.macroRatio.protein}%` }} />
                      <div className="bg-emerald-500" style={{ width: `${meal.macroRatio.fats}%` }} />
                    </div>
                  </div>

                  {/* Clinical Bio-Mechanism */}
                  <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-3 text-xs flex items-start gap-2.5">
                    <FlaskConical size={16} className="text-[#1f7a8c] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-teal-900 block">Biochemical Mechanism:</span>
                      <p className="text-[11px] text-teal-800 mt-0.5 leading-snug">{meal.clinicalNote}</p>
                    </div>
                  </div>

                  {/* Bioactive Compounds */}
                  {meal.bioactiveCompounds && meal.bioactiveCompounds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {meal.bioactiveCompounds.map((comp, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
                        >
                          ✦ {comp}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleAddToGroceryList(meal)}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Grocery List</span>
                    </button>
                    <button
                      onClick={() => setSelectedMeal(meal)}
                      className="flex-1 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-[#1f7a8c] border border-teal-200 rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ChefHat size={14} />
                      <span>Recipe Steps</span>
                    </button>
                    <button
                      onClick={() => handleLogThisMeal(meal)}
                      className="py-2 px-3.5 bg-[#1f7a8c] hover:bg-teal-800 text-white rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                      title="Log to Daily Diary"
                    >
                      <Check size={14} />
                      <span>Log</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Preparation Protocol Modal with Smooth Slow-Glide Zoom-In */}
      <AnimatePresence>
        {selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedMeal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1], // Smooth luxury apple-style spring curve
              }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-lg max-h-[82vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-teal-100/80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#1f7a8c] block">
                    Culinary Preparation
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">{selectedMeal.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-transform active:scale-90 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Ingredients Checklist */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                  <ChefHat size={14} className="text-[#1f7a8c]" />
                  <span>Exact Ingredients ({selectedMeal.ingredients.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedMeal.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-50/80 rounded-xl text-xs font-medium text-slate-800 flex items-center gap-2 border border-slate-100"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Steps */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-700 mb-2 flex items-center gap-1.5">
                  <FlaskConical size={14} className="text-purple-600" />
                  <span>Engineering Preparation Protocol</span>
                </h4>
                <div className="space-y-2.5">
                  {selectedMeal.preparationProtocol.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-start gap-3 p-3 bg-purple-50/60 rounded-2xl border border-purple-100/80 shadow-2xs"
                    >
                      <span className="h-6 w-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {sIdx + 1}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  className="rounded-2xl border-teal-200 text-[#1f7a8c] hover:bg-teal-50 font-bold transition-transform active:scale-95"
                  onClick={() => handleAddToGroceryList(selectedMeal)}
                >
                  <Plus size={14} className="mr-1" />
                  Add to Grocery List
                </Button>
                <Button
                  className="rounded-2xl bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white font-bold shadow-sm hover:shadow-md transition-transform active:scale-95"
                  onClick={() => handleLogThisMeal(selectedMeal)}
                >
                  <Check size={14} className="mr-1" />
                  Log This Meal
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
