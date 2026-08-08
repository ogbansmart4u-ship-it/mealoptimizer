import React, { useState, useRef, useEffect } from "react";
import {
  Camera, Sparkles, TrendingUp, MapPin, Globe, AlertCircle, ChevronDown, ChevronUp, X,
  Activity, Clock, Flame, Calendar, Bell, ChevronRight, Heart,
  Droplet, Minus, Plus, Upload, Zap, Target, BarChart3, ScanBarcode, Shield, Moon, Search, FlaskConical, BookOpen
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import StreakCard from "../components/StreakCard";
import { useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { useAppMode } from "../contexts/AppModeContext";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import ModeToggle from "../components/ModeToggle";
import LocationSelector from "../components/LocationSelector";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import CameraCapture from "../components/CameraCapture";
import LocalFoodScanner from "../components/LocalFoodScanner";
import QuickActionsFAB from "../components/QuickActionsFAB";
import GlobalSearch from "../components/GlobalSearch";
import TutorialTooltip from "../components/TutorialTooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import logoImage from "figma:asset/efbe2a1ac833b032474ac203bb52c6fe4e93cfbb.png";
import { initializeSampleData } from "../../utils/sampleData";
import { projectId } from '/utils/supabase/info';
import { getAccessToken } from '../../lib/supabase';
import { createMealLog, getMealLogs } from "../../lib/api";
import { toast } from "sonner";
import { celebrate } from "../components/celebrate";

const FOOD_API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/ai/analyze-food`;

type MealMetadata = {
  day: string;
  dayFull: string;
  metabolicWindow: string;
  meal: string;
  mealName: string;
  color: string;
  circadian_anchor: string;
  biochemical_ratio: string;
  clinical_indication: string;
  engineering_method: string;
  glycemicLoad: "High" | "Medium" | "Low";
  bioAvailability: {
    pairing: string;
    explanation: string;
  };
  regionalIngredients: {
    lagos: string[];
    london: string[];
  };
  mealPrescription: {
    physiologicalGoal: string;
    engineersNote: string;
    pantryCheck: string[];
  };
};

type PostMealLog = {
  energyLevel: number;
  digestiveComfort: number;
  conditionMetric: number;
  timestamp: Date;
};

export default function Home() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { selectedLocation, getRegionalKey } = useLocation();
  const { userName, profilePicture, profile } = useUser();
  const { mode } = useAppMode();
  const { t } = useLanguage();
  const currentDate = new Date().toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  
  const dailyProgress = 55; // percentage
  
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalysingFood, setIsAnalysingFood] = useState(false);
  const [foodAnalysisResult, setFoodAnalysisResult] = useState<Record<string, any> | null>(null);
  const [showLocalFoodScanner, setShowLocalFoodScanner] = useState(false);
  const [showAnalyseFoodOptions, setShowAnalyseFoodOptions] = useState(false);
  const [showLocalFoodOptions, setShowLocalFoodOptions] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // Animation states for Daily Fuel Gauge
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // New state for enhanced Daily Fuel Gauge
  const [showGaugeDetails, setShowGaugeDetails] = useState(false);
  const [showQuickMealLog, setShowQuickMealLog] = useState(false);
  const [selectedQuickMeal, setSelectedQuickMeal] = useState<"breakfast" | "lunch" | "dinner" | null>(null);
  const [trackingStreak, setTrackingStreak] = useState(7); // Days streak

  // Track current day of week for automatic calendar rotation (0 = Mon, 6 = Sun)
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date().getDay();
    // Convert to Mon=0, Tue=1, ..., Sun=6
    return today === 0 ? 6 : today - 1;
  });

  // Auto-update calendar at midnight every day
  useEffect(() => {
    const updateCurrentDay = () => {
      const today = new Date().getDay();
      const dayIndex = today === 0 ? 6 : today - 1;
      setCurrentDayIndex(dayIndex);
    };

    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set timer to update at midnight
    const midnightTimer = setTimeout(() => {
      updateCurrentDay();
      // After first midnight update, set daily interval
      const dailyInterval = setInterval(updateCurrentDay, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  // Initialize sample data for new users
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Load this account's real meal logs (used by the weekly Food Calendar).
  const [weekLogs, setWeekLogs] = useState<any[]>([]);
  useEffect(() => {
    getMealLogs()
      .then((d) => setWeekLogs(Array.isArray(d) ? d : []))
      .catch((e) => { console.error('Failed to load meal logs', e); setWeekLogs([]); });
  }, []);

  // The 7 days of the current week (Mon–Sun), keyed in UTC to match how logs
  // store their `date` (new Date().toISOString().split('T')[0]).
  const todayKey = new Date().toISOString().split('T')[0];
  const weekBase = new Date(`${todayKey}T12:00:00Z`);
  const weekMondayOffset = (weekBase.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekBase);
    d.setUTCDate(weekBase.getUTCDate() - weekMondayOffset + i);
    const key = d.toISOString().split('T')[0];
    const dayLogs = weekLogs.filter((l) => l?.date === key);
    return {
      key,
      label: weekDayLabels[i],
      dateNum: d.getUTCDate(),
      isToday: key === todayKey,
      count: dayLogs.length,
      calories: dayLogs.reduce((s, l) => s + (Number(l?.calories) || 0), 0),
    };
  });
  const weekRangeLabel = (() => {
    const first = weekDays[0], last = weekDays[6];
    const mk = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return `${mk(first.key)} – ${mk(last.key)}`;
  })();

  // Nutritional tracking data (mock data - would come from backend/state management in production)
  const caloriesConsumed = 1450;
  const caloriesTarget = 2000;
  const proteinConsumed = 75;
  const proteinTarget = 100;
  const carbsConsumed = 60;
  const carbsTarget = 150;
  const fatsConsumed = 45;
  const fatsTarget = 67;

  // Animate gauge on mount
  useEffect(() => {
    const progressTimer = setTimeout(() => {
      setAnimatedProgress(dailyProgress);
    }, 300);

    // Animate percentage counter
    let currentPercentage = 0;
    const percentageInterval = setInterval(() => {
      if (currentPercentage < dailyProgress) {
        currentPercentage += 1;
        setAnimatedPercentage(currentPercentage);
      } else {
        clearInterval(percentageInterval);
      }
    }, 20);

    return () => {
      clearTimeout(progressTimer);
      clearInterval(percentageInterval);
    };
  }, [dailyProgress]);

  // Water tracker — persisted per calendar day so it auto-resets each new day
  // and keeps the day's count across reloads.
  const waterGoal = 8; // 8 glasses per day
  const waterKeyFor = (d = new Date()) => `water-glasses-${d.toISOString().split("T")[0]}`;
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(waterKeyFor()) || "0", 10) || 0;
    } catch {
      return 0;
    }
  });
  // Persist whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(waterKeyFor(), String(waterGlasses));
    } catch {
      /* ignore */
    }
  }, [waterGlasses]);
  // If the tab is left open past midnight, roll over to the new day's count on refocus
  useEffect(() => {
    const onFocus = () => {
      try {
        const stored = parseInt(localStorage.getItem(waterKeyFor()) || "0", 10) || 0;
        setWaterGlasses(stored);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  // New state for enhanced features
  const [selectedMeal, setSelectedMeal] = useState<MealMetadata | null>(null);
  const [showMealPrescription, setShowMealPrescription] = useState(false);
  const [showPostMealLog, setShowPostMealLog] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [postMealData, setPostMealData] = useState<PostMealLog>({
    energyLevel: 3,
    digestiveComfort: 3,
    conditionMetric: 120, // Blood glucose for diabetes
    timestamp: new Date(),
  });

  // Enhanced food calendar data with functional metadata
  const nutritionBlueprintCalendar: MealMetadata[] = [
    {
      day: "Mon",
      dayFull: "Monday",
      metabolicWindow: "Cortisol Peak (6-8 AM)",
      meal: "🥗",
      mealName: "Ugu & Garden Egg Protein Bowl",
      color: "bg-green-100",
      circadian_anchor: "Cortisol Management",
      biochemical_ratio: "40P/30C/30F",
      clinical_indication: "Low Glycemic for Diabetes Control",
      engineering_method: "Flash-steamed (< 2 min)",
      glycemicLoad: "Low",
      bioAvailability: {
        pairing: "Vitamin C (Garden Egg) + Iron (Ugu)",
        explanation: "Vitamin C enhances iron absorption by up to 300%, critical for anemia prevention in diabetic patients.",
      },
      regionalIngredients: {
        lagos: ["Ugu leaves", "Garden egg", "Dried fish", "Palm oil", "Onions"],
        london: ["Spinach", "Eggplant", "Sardines", "Olive oil", "Onions"],
      },
      mealPrescription: {
        physiologicalGoal: "Stabilize morning blood sugar while managing cortisol-induced glucose spike",
        engineersNote: "Do not boil Ugu for more than 2 minutes to retain Vitamin C and folate. Add palm oil after cooking to preserve omega-3 fatty acids.",
        pantryCheck: ["Fresh Ugu (Lekki Market)", "Garden egg (Yaba)", "Dried fish (local vendor)"],
      },
    },
    {
      day: "Tue",
      dayFull: "Tuesday",
      metabolicWindow: "Glycogen Replenishment (12-2 PM)",
      meal: "🍲",
      mealName: "Ogbono Soup with Unripe Plantain",
      color: "bg-orange-100",
      circadian_anchor: "Glycogen Replenishment",
      biochemical_ratio: "25P/45C/30F",
      clinical_indication: "Resistant Starch for Blood Sugar Control",
      engineering_method: "Cold-soaked Ogbono seeds",
      glycemicLoad: "Medium",
      bioAvailability: {
        pairing: "Fiber (Ogbono) + Resistant Starch (Unripe Plantain)",
        explanation: "Combined fiber slows glucose absorption, preventing post-meal spikes in diabetic patients.",
      },
      regionalIngredients: {
        lagos: ["Ogbono seeds", "Unripe plantain", "Stockfish", "Ugu", "Crayfish"],
        london: ["Ground okra", "Green banana", "Dried fish", "Kale", "Shrimp powder"],
      },
      mealPrescription: {
        physiologicalGoal: "Provide sustained energy release while supporting gut microbiome health",
        engineersNote: "Soak Ogbono seeds in cold water for 30 minutes before grinding. Cook unripe plantain with skin on to maximize resistant starch content.",
        pantryCheck: ["Ogbono (Mile 12 Market)", "Unripe plantain (local)", "Stockfish (Idumota)"],
      },
    },
    {
      day: "Wed",
      dayFull: "Wednesday",
      metabolicWindow: "Insulin Sensitivity Peak (4-6 PM)",
      meal: "🥙",
      mealName: "Bitter Leaf Wrap with Grilled Fish",
      color: "bg-yellow-100",
      circadian_anchor: "Insulin Sensitivity Enhancement",
      biochemical_ratio: "45P/25C/30F",
      clinical_indication: "Vasodilation for Hypertension Management",
      engineering_method: "Raw preparation (minimal heat)",
      glycemicLoad: "Low",
      bioAvailability: {
        pairing: "Omega-3 (Fish) + Polyphenols (Bitter Leaf)",
        explanation: "Omega-3 fatty acids reduce inflammation while bitter leaf compounds improve insulin sensitivity.",
      },
      regionalIngredients: {
        lagos: ["Bitter leaf", "Mackerel", "Avocado", "Tomatoes", "Onions"],
        london: ["Arugula", "Salmon", "Avocado", "Tomatoes", "Red onions"],
      },
      mealPrescription: {
        physiologicalGoal: "Maximize insulin sensitivity during metabolic window for optimal glucose uptake",
        engineersNote: "Wash bitter leaf 3-4 times to reduce bitterness but retain bioactive compounds. Grill fish at 350°F to preserve omega-3 integrity.",
        pantryCheck: ["Fresh bitter leaf (Oshodi)", "Fresh mackerel (Epe fish market)", "Avocado (supermarket)"],
      },
    },
    {
      day: "Thu",
      dayFull: "Thursday",
      metabolicWindow: "Metabolic Transition (10-11 AM)",
      meal: "🍛",
      mealName: "Ewedu Soup with Amala",
      color: "bg-red-100",
      circadian_anchor: "Digestive Enzyme Activation",
      biochemical_ratio: "30P/40C/30F",
      clinical_indication: "Mucilage for Gut Lining Protection",
      engineering_method: "Hand-whisked (no blending)",
      glycemicLoad: "Medium",
      bioAvailability: {
        pairing: "Mucilage (Ewedu) + Prebiotics (Yam flour)",
        explanation: "Mucilage forms protective coating on gut lining while prebiotics feed beneficial bacteria.",
      },
      regionalIngredients: {
        lagos: ["Ewedu leaves", "Yam flour", "Beef", "Locust beans", "Palm oil"],
        london: ["Jute leaves", "Plantain flour", "Beef", "Fermented beans", "Coconut oil"],
      },
      mealPrescription: {
        physiologicalGoal: "Support digestive health and maintain stable blood sugar throughout day",
        engineersNote: "Hand-whisk Ewedu to preserve mucilage structure. Mix Amala with lukewarm water to prevent starch retrogradation.",
        pantryCheck: ["Fresh Ewedu (Oyingbo)", "Yam flour (Lafenwa)", "Locust beans (Balogun)"],
      },
    },
    {
      day: "Fri",
      dayFull: "Friday",
      metabolicWindow: "Evening Wind-Down (6-7 PM)",
      meal: "🍜",
      mealName: "Ukazi Soup with Oat Swallow",
      color: "bg-purple-100",
      circadian_anchor: "Melatonin Support",
      biochemical_ratio: "35P/35C/30F",
      clinical_indication: "Beta-Glucan for Cholesterol Management",
      engineering_method: "Sous-vide (precise temperature)",
      glycemicLoad: "Low",
      bioAvailability: {
        pairing: "Beta-Glucan (Oats) + Antioxidants (Ukazi)",
        explanation: "Beta-glucan lowers LDL cholesterol while Ukazi antioxidants reduce oxidative stress.",
      },
      regionalIngredients: {
        lagos: ["Ukazi leaves", "Steel-cut oats", "Chicken", "Crayfish", "Palm oil"],
        london: ["Kale", "Steel-cut oats", "Chicken", "Shrimp", "Olive oil"],
      },
      mealPrescription: {
        physiologicalGoal: "Prepare body for restful sleep while maintaining overnight glucose stability",
        engineersNote: "Cook oats at 185°F for 25 minutes to maximize beta-glucan content. Add Ukazi leaves in last 3 minutes of cooking.",
        pantryCheck: ["Ukazi leaves (Oke-Arin)", "Steel-cut oats (Shoprite)", "Fresh chicken (local)"],
      },
    },
    {
      day: "Sat",
      dayFull: "Saturday",
      metabolicWindow: "Recovery Phase (8-10 AM)",
      meal: "🥘",
      mealName: "Edikang Ikong Soup",
      color: "bg-blue-100",
      circadian_anchor: "Antioxidant Replenishment",
      biochemical_ratio: "35P/30C/35F",
      clinical_indication: "Anti-inflammatory for Joint Health",
      engineering_method: "Layered cooking method",
      glycemicLoad: "Low",
      bioAvailability: {
        pairing: "Vitamin K (Ugu) + Healthy Fats (Palm oil)",
        explanation: "Fat-soluble vitamin K requires healthy fats for absorption, crucial for bone and cardiovascular health.",
      },
      regionalIngredients: {
        lagos: ["Ugu", "Water leaf", "Beef", "Dried fish", "Periwinkle", "Palm oil"],
        london: ["Spinach", "Swiss chard", "Beef", "Mussels", "Shrimp", "Coconut oil"],
      },
      mealPrescription: {
        physiologicalGoal: "Provide comprehensive micronutrients for cellular repair and inflammation management",
        engineersNote: "Cook protein separately, then add vegetables in stages: water leaf first (5 min), then Ugu (2 min). Add palm oil last.",
        pantryCheck: ["Ugu (fresh from Berger)", "Water leaf (Ojuelegba)", "Periwinkle (Epe)"],
      },
    },
    {
      day: "Sun",
      dayFull: "Sunday",
      metabolicWindow: "Prep for New Week (3-5 PM)",
      meal: "🍝",
      mealName: "Vegetable Stir-fry with Konjac Noodles",
      color: "bg-pink-100",
      circadian_anchor: "Metabolic Reset",
      biochemical_ratio: "30P/35C/35F",
      clinical_indication: "Glucomannan for Satiety & Blood Sugar",
      engineering_method: "High-heat stir-fry (< 3 min)",
      glycemicLoad: "Low",
      bioAvailability: {
        pairing: "Glucomannan (Konjac) + Fat-soluble Vitamins (Vegetables)",
        explanation: "Glucomannan slows gastric emptying while quick cooking preserves heat-sensitive vitamins.",
      },
      regionalIngredients: {
        lagos: ["Konjac noodles", "Bell peppers", "Carrots", "Green beans", "Chicken breast"],
        london: ["Shirataki noodles", "Bell peppers", "Carrots", "Green beans", "Turkey breast"],
      },
      mealPrescription: {
        physiologicalGoal: "Reset metabolic pathways and prepare digestive system for upcoming week",
        engineersNote: "Rinse konjac noodles thoroughly. Stir-fry vegetables at 450°F for maximum 2-3 minutes to retain crunch and nutrients.",
        pantryCheck: ["Konjac noodles (Asian market, Ikeja)", "Fresh vegetables (Mile 12)", "Lean chicken (local)"],
      },
    },
  ];

  const handleWaterIncrease = () => {
    if (waterGlasses < 12) {
      setWaterGlasses(waterGlasses + 1);
    }
  };

  const handleWaterDecrease = () => {
    if (waterGlasses > 0) {
      setWaterGlasses(waterGlasses - 1);
    }
  };

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return t('home.goodMorning');
    } else if (currentHour >= 12 && currentHour < 17) {
      return t('home.goodAfternoon');
    } else if (currentHour >= 17 && currentHour < 21) {
      return t('home.goodEvening');
    } else {
      return t('home.goodNight');
    }
  };

  // Get time-based Nigerian meal recommendation
  const getTimeBasedRecommendation = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 6 && currentHour < 10) {
      return {
        greeting: "Ẹ káàárọ̀! (Good morning!)",
        recommendation: "Break your fast with Akamu & Moi Moi for sustained energy",
        metabolicWindow: "Cortisol Peak - Your body needs protein to manage morning glucose spike",
        icon: "🌅"
      };
    } else if (currentHour >= 10 && currentHour < 15) {
      return {
        greeting: "Ẹ káàsán! (Good afternoon!)",
        recommendation: "Lunch time! Try Ofada rice with Ayamase or Ewedu soup",
        metabolicWindow: "Glycogen Replenishment - Complex carbs for sustained afternoon energy",
        icon: "☀️"
      };
    } else if (currentHour >= 15 && currentHour < 19) {
      return {
        greeting: "Ẹ kú ìrọ̀lẹ́! (Good evening!)",
        recommendation: "Light dinner approaching. Opt for vegetable soup with minimal swallow",
        metabolicWindow: "Insulin Sensitivity Peak - Best time for moderate carb intake",
        icon: "🌆"
      };
    } else {
      return {
        greeting: "Good night!",
        recommendation: "Late evening - Choose light protein-rich meals if needed",
        metabolicWindow: "Melatonin Support - Avoid heavy carbs for better sleep quality",
        icon: "🌙"
      };
    }
  };

  // Get gauge status color and message
  const getGaugeStatus = () => {
    if (dailyProgress >= 80) {
      return {
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        message: "Excellent! You're meeting your nutrition goals 💪",
        emoji: "💪",
        status: "On Track"
      };
    } else if (dailyProgress >= 50) {
      return {
        color: "from-yellow-500 to-orange-500",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        message: "Good progress! Add one more balanced meal 🤔",
        emoji: "🤔",
        status: "Moderate"
      };
    } else {
      return {
        color: "from-red-500 to-pink-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        message: "You need more fuel! Plan your next meal now ⚠️",
        emoji: "⚠️",
        status: "Needs Attention"
      };
    }
  };

  const handleQuickMealSelect = (mealType: "breakfast" | "lunch" | "dinner") => {
    setSelectedQuickMeal(mealType);
    setShowQuickMealLog(true);
  };

  // Common Nigerian / West African presets for one-tap logging, per meal type.
  const quickMealOptions: Record<
    "breakfast" | "lunch" | "dinner",
    { emoji: string; name: string; calories: number; protein: number; carbs: number; fats: number; label: string; impact: "low" | "medium" | "high" }[]
  > = {
    breakfast: [
      { emoji: "🥣", name: "Akamu & Moi Moi", calories: 350, protein: 14, carbs: 52, fats: 8, label: "Low Glycemic", impact: "low" },
      { emoji: "🍞", name: "Bread & Eggs", calories: 280, protein: 15, carbs: 30, fats: 11, label: "Moderate Glycemic", impact: "medium" },
      { emoji: "🥗", name: "Ugu Vegetable Bowl", calories: 220, protein: 9, carbs: 24, fats: 7, label: "Low Glycemic", impact: "low" },
    ],
    lunch: [
      { emoji: "🍛", name: "Jollof Rice with Chicken", calories: 520, protein: 32, carbs: 62, fats: 16, label: "Moderate Glycemic", impact: "medium" },
      { emoji: "🍲", name: "Ewedu Soup with Amala", calories: 480, protein: 18, carbs: 70, fats: 12, label: "Low Glycemic", impact: "low" },
      { emoji: "🍚", name: "Ofada Rice & Ayamase", calories: 550, protein: 20, carbs: 68, fats: 20, label: "Medium Glycemic", impact: "medium" },
    ],
    dinner: [
      { emoji: "🥘", name: "Edikang Ikong Soup", calories: 380, protein: 24, carbs: 18, fats: 22, label: "Low Glycemic", impact: "low" },
      { emoji: "🍜", name: "Vegetable Stir-fry", calories: 310, protein: 14, carbs: 28, fats: 15, label: "Low Glycemic", impact: "low" },
      { emoji: "🐟", name: "Grilled Fish & Salad", calories: 290, protein: 34, carbs: 10, fats: 13, label: "Low Glycemic", impact: "low" },
    ],
  };

  const [quickLogging, setQuickLogging] = useState(false);

  const handleQuickLog = async (meal: { name: string; calories: number; protein: number; carbs: number; fats: number; impact: "low" | "medium" | "high" }) => {
    if (!selectedQuickMeal || quickLogging) return;
    const now = new Date();
    const newLog = {
      id: Date.now().toString(),
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      mealType: selectedQuickMeal,
      foodName: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      energyRating: 4,
      digestiveComfort: 4,
      bloodSugarImpact: meal.impact,
    };
    setQuickLogging(true);
    try {
      await createMealLog(newLog);
      celebrate(`${meal.name} logged! 🎉`, "Nice one — keep your streak going!");
      setShowQuickMealLog(false);
    } catch (e) {
      console.error("Failed to quick-log meal", e);
      toast.error("Couldn't log meal. Please try again.");
    } finally {
      setQuickLogging(false);
    }
  };

  const handleCustomEntry = () => {
    setShowQuickMealLog(false);
    navigate("/logs", { state: { openAdd: true } });
  };

  const handleTakePhoto = async () => {
    try {
      // Reset error states
      setCameraPermissionDenied(false);
      setPermissionError(null);

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError("Camera is not supported on this device or browser.");
        return;
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });

      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());

      // Permission granted, trigger file input
      cameraInputRef.current?.click();
    } catch (error) {
      // Handle camera permission errors gracefully
      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          setCameraPermissionDenied(true);
          setPermissionError("Camera access was denied. Please enable camera permissions in your browser settings.");
        } else if (error.name === "NotFoundError") {
          setPermissionError("No camera found on this device.");
        } else if (error.name === "NotReadableError") {
          setPermissionError("Camera is already in use by another application.");
        } else {
          setPermissionError("Unable to access camera. Please try again.");
        }
      }
    }
  };

  const handleUploadPhoto = () => {
    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setShowAnalyseDialog(false);
        // Reset error states
        setCameraPermissionDenied(false);
        setPermissionError(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <div className="bg-[#B8E5E5] px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-700">
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-700" />
            </button>
            <ProfilePictureUpload />
          </div>
        </div>
        
        {/* Logo */}
        <div className="text-center mb-4 flex justify-center">
          <img 
            src={logoImage} 
            alt="MealOptimiza Logo" 
            className="h-16 object-contain"
          />
        </div>
        
        {/* Greeting */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img
            src="/assets/mascot.png"
            alt=""
            aria-hidden="true"
            className="w-12 h-12 object-contain flex-shrink-0 drop-shadow-sm"
          />
          <div className="text-left">
            <h2 className="text-2xl text-gray-800">{getTimeBasedGreeting()}, {userName}</h2>
            <p className="text-sm text-gray-600">{currentDate}</p>
          </div>
        </div>
        
        {/* Daily Fuel Gauge - Enhanced */}
        <div className="bg-gradient-to-br from-white via-[#E8F5F5] to-[#B8E5E5] rounded-3xl shadow-lg p-6 mb-6">
          {/* Streak Counter */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
            <span className="text-sm text-gray-700">
              <span className="font-bold text-[#e63946]">{trackingStreak}-Day Streak!</span> Keep logging for expert insights
            </span>
          </div>

          <h3 className="text-center text-sm tracking-wider mb-4 text-gray-700">
            {t('home.todaysCalories')}
          </h3>
          
          {/* Make gauge clickable for details */}
          <button 
            onClick={() => setShowGaugeDetails(true)}
            className="w-full hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-[#1f7a8c] focus:ring-offset-2 rounded-2xl cursor-pointer"
            aria-label={`Daily nutrition progress: ${animatedPercentage}% of goal achieved. Tap for detailed breakdown.`}
          >
            <div className="relative flex flex-col items-center justify-center mb-4">
              {/* Circular Progress */}
              <svg className="w-48 h-32" viewBox="0 0 200 120">
                {/* Background arc */}
                <path
                  d="M 30 100 A 70 70 0 0 1 170 100"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                  d="M 30 100 A 70 70 0 0 1 170 100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={`${animatedProgress * 2.2} 1000`}
                  style={{
                    transition: "stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1f7a8c" />
                    <stop offset="100%" stopColor="#4ecdc4" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute top-12 flex flex-col items-center">
                <div className="text-[#1f7a8c] text-[20px] font-bold transition-all duration-300 animate-pulse" style={{ animationDuration: "2s" }}>
                  {animatedPercentage}%
                </div>
                <div className="text-xs text-gray-500 uppercase">of daily goal</div>
                <div className="text-[10px] text-[#1f7a8c] mt-1">Tap for details</div>
              </div>
              
              {/* Text below gauge - Simple vs Expert Mode */}
              {mode === "simple" ? (
                <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                  <span className="text-lg">{getGaugeStatus().emoji}</span>
                  <span>{getGaugeStatus().status}</span>
                </div>
              ) : (
                <div className="text-[10px] text-gray-600 tracking-widest uppercase mt-1">
                  {t('home.dailyNutritionOpt')}
                </div>
              )}
            </div>
          </button>
          
          {/* Metrics - Adaptive for Simple/Expert Mode */}
          {mode === "expert" && (
            <div className="flex justify-around pt-2 pb-4 border-b border-gray-200">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-2 mb-1 shadow-sm">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <div className="text-[10px] text-gray-700 tracking-wide">MACROS</div>
                <div className="text-xs text-[#1f7a8c]">40/30/30</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg p-2 mb-1 shadow-sm">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div className="text-[10px] text-gray-700 tracking-wide">GLYCEMIC</div>
                <div className="text-xs text-green-600">Low</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg p-2 mb-1 shadow-sm">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="text-[10px] text-gray-700 tracking-wide">WINDOW</div>
                <div className="text-xs text-[#1f7a8c]">Optimal</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-green-400 to-teal-400 rounded-lg p-2 mb-1 shadow-sm">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="text-[10px] text-gray-700 tracking-wide">TREND</div>
                <div className="text-xs text-green-600">↑5%</div>
              </div>
            </div>
          )}
          
          {/* Quick Meal Logging Buttons */}
          <div className="mt-4 mb-4">
            <h4 className="text-xs text-gray-700 mb-2 text-center">Quick Log Meal</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickMealSelect("breakfast")}
                className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-3 hover:scale-105 transition-transform shadow-sm cursor-pointer"
              >
                <div className="text-2xl mb-1">🍳</div>
                <div className="text-[10px] text-gray-700">Breakfast</div>
              </button>
              <button
                onClick={() => handleQuickMealSelect("lunch")}
                className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl p-3 hover:scale-105 transition-transform shadow-sm cursor-pointer"
              >
                <div className="text-2xl mb-1">🍛</div>
                <div className="text-[10px] text-gray-700">Lunch</div>
              </button>
              <button
                onClick={() => handleQuickMealSelect("dinner")}
                className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-3 hover:scale-105 transition-transform shadow-sm cursor-pointer"
              >
                <div className="text-2xl mb-1">🍲</div>
                <div className="text-[10px] text-gray-700">Dinner</div>
              </button>
            </div>
          </div>
          
          {/* Time-Based Circadian Insight */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-[#1f7a8c]" />
              <h4 className="text-xs text-gray-700 tracking-wide">
                {mode === "simple" ? "MEAL SUGGESTION" : "TODAY'S METABOLIC FOCUS"}
              </h4>
              <span className="text-lg">{getTimeBasedRecommendation().icon}</span>
            </div>
            {mode === "simple" ? (
              <div>
                <p className="text-xs text-[#1f7a8c] font-semibold mb-1">
                  {getTimeBasedRecommendation().greeting}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {getTimeBasedRecommendation().recommendation}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[#1f7a8c] font-semibold mb-1">
                  {getTimeBasedRecommendation().greeting}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold">{getTimeBasedRecommendation().metabolicWindow}</span> - {getTimeBasedRecommendation().recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-6">
        {/* Daily logging streak */}
        <div className="mb-5">
          <StreakCard />
        </div>

        {/* Market Update + Grocery List */}
        <div className="mb-5">
          <div className="bg-white rounded-2xl shadow-md p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-[#B8E5E5] rounded-full p-2 flex-shrink-0">
                <Bell className="h-4 w-4 text-[#1f7a8c]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">Market Update</p>
                <p className="text-xs text-gray-600">
                  {(() => {
                    const loc = selectedLocation?.name || "your area";
                    const tips = [
                      `Local Ugu is fresh at markets in ${loc} today!`,
                      `Tomatoes and peppers are in good supply — great for a fresh stew.`,
                      `Look out for fresh catfish today — perfect for a light pepper soup.`,
                      `Beans (oloyin) are budget-friendly now — try moi moi or ewa.`,
                      `Plantain is plentiful — firm ones for boiling, ripe for dodo.`,
                      `Fresh ugu, water leaf and spinach are great buys for efo riro.`,
                      `Yam and sweet potato are steady-energy swaps for white rice.`,
                      `Garden eggs are in season — a great low-calorie snack.`,
                      `Okra is fresh — perfect for a quick draw soup.`,
                      `Oranges and pawpaw are in season — vitamin C on a budget.`,
                      `Ofada (brown) rice is a lower-GI pick — look for it in ${loc}.`,
                      `Bitter leaf and oha are fresh — great for a nutrient-rich soup.`,
                    ];
                    const start = new Date(new Date().getFullYear(), 0, 0).getTime();
                    const dayOfYear = Math.floor((Date.now() - start) / 86400000);
                    return tips[dayOfYear % tips.length];
                  })()}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/grocery-list")}
            className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:shadow-md active:scale-[0.98] transition-all font-semibold"
          >
            <span className="text-lg">🛒</span>
            {t('home.viewGroceryList')}
          </button>
        </div>

        {/* Analyser & Planner */}
        <div className="mb-6">
          <h3 className="text-lg mb-3 text-gray-800">{t('home.analyserPlanner')}</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Nigerian Food Guide Card */}
            <motion.button
              onClick={() => setShowLocalFoodOptions(true)}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
              whileTap={{ scale: 0.96 }}
              whileHover={reduce ? undefined : { scale: 1.03, y: -4 }}
              className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center border-2 border-teal-400 group cursor-pointer">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl p-3 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <span className="text-sm text-teal-700 text-center uppercase tracking-wide font-semibold">
                {t('home.foodGuide')}
              </span>
            </motion.button>

            {/* Analyse Food Card */}
            <motion.button
              onClick={() => setShowAnalyseFoodOptions(true)}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
              whileTap={{ scale: 0.96 }}
              whileHover={reduce ? undefined : { scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center border-2 border-[#1f7a8c] group cursor-pointer">
              <div className="bg-[#4ecdc4] rounded-xl p-3 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <span className="text-sm text-[#1f7a8c] text-center uppercase tracking-wide font-semibold">
                {t('home.analyseFood')}
              </span>
            </motion.button>

            {/* Plan My Meal Card — full width */}
            <motion.button
              onClick={() => navigate("/plan-meal")}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.19, ease: "easeOut" }}
              whileTap={{ scale: 0.97 }}
              whileHover={reduce ? undefined : { scale: 1.02, y: -3 }}
              className="col-span-2 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center gap-0 border-2 border-[#1f7a8c] group cursor-pointer"
            >
              <div className="bg-[#e63946] rounded-xl p-3 mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <span className="text-3xl">🍽️</span>
              </div>
              <span className="text-sm text-[#1f7a8c] text-center uppercase tracking-wide font-semibold">
                {t('home.planMyMeal')}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Your Custom Meal Plan - Featured Card */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/hyper-personalized-plan")}
            className="w-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer relative overflow-hidden"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 group-hover:scale-110 transition-transform">
                    <FlaskConical className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold text-xl">{t('home.customMealPlan')}</h3>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-white/90 text-sm leading-relaxed">
                  {t('home.customMealPlanDesc')}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">Pre-Workout Snack</span>
                  <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">Focus Snack</span>
                  <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">Post-Workout Meal</span>
                  <span className="px-3 py-1 bg-white/20 text-white text-xs rounded-full">Evening Snack</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        
        {/* Location & Market Sync */}
        <div className="mb-6">
          <h3 className="text-lg mb-3 text-gray-800">{t('home.yourLocation')}</h3>
          <LocationSelector />
          
          <div className="bg-white rounded-2xl shadow-md p-4 mt-3 mb-3">
            <p className="text-sm text-gray-800 mb-3">
              <span className="text-gray-600">{t('home.recommendedMeal')}</span> Savory Oat-Swallow
            </p>
          </div>
        </div>

        {/* Food Calendar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg text-gray-800">{t('home.thisWeeksMeals')}</h3>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#E8F5F5] text-[#1f7a8c] text-xs rounded-full">
                {weekRangeLabel}
              </span>
            </div>
            <button
              onClick={() => navigate("/logs")}
              className="text-sm text-[#1f7a8c] flex items-center gap-1 hover:underline"
            >
              <span>{t('home.viewAll')}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFE5D9] rounded-3xl shadow-lg p-5">
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => {
                const logged = day.count > 0;
                return (
                  <button
                    key={day.key}
                    onClick={() => navigate("/logs", { state: { date: day.key } })}
                    title={logged ? `${day.count} meal${day.count > 1 ? 's' : ''} · ${day.calories} kcal` : 'No meals logged'}
                    className={`flex flex-col items-center py-3 px-1 rounded-xl transition-all hover:scale-105 ${
                      day.isToday
                        ? "bg-[#1f7a8c] text-white scale-105 shadow-md"
                        : logged
                        ? "bg-green-100"
                        : "bg-gray-50"
                    }`}
                  >
                    <span className={`text-xs mb-2 ${day.isToday ? "text-white" : "text-gray-600"}`}>
                      {day.label}
                    </span>
                    <span className="text-2xl mb-1 leading-none">{logged ? "🍽️" : "·"}</span>
                    {logged ? (
                      <span className={`text-[10px] leading-none ${day.isToday ? "text-white" : "text-gray-600"}`}>
                        {day.count}
                      </span>
                    ) : (
                      <span className={`text-[10px] leading-none ${day.isToday ? "text-white/80" : "text-gray-400"}`}>
                        {day.dateNum}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              {t('home.tapDayHint')}
            </p>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="mb-6">
          <h3 className="text-lg mb-3 text-gray-800">Water Tracker</h3>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 rounded-full p-3">
                  <Droplet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Goal</p>
                  <p className="text-xl text-gray-800">{waterGlasses} / {waterGoal} glasses</p>
                </div>
              </div>
              {waterGlasses >= waterGoal ? (
                <img
                  src="/assets/mascot.png"
                  alt="Goal reached!"
                  className="w-12 h-12 object-contain drop-shadow-sm"
                  title="Daily water goal reached!"
                />
              ) : (
                <div className="text-3xl">💧</div>
              )}
            </div>

            {/* Water Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((waterGlasses / waterGoal) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                {waterGlasses >= waterGoal 
                  ? "Great job! You've reached your goal!" 
                  : `${waterGoal - waterGlasses} more glass${waterGoal - waterGlasses > 1 ? 'es' : ''} to go!`}
              </p>
            </div>

            {/* Water Glass Visualization */}
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(waterGoal)].map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-10 rounded-lg border-2 transition-all ${
                    index < waterGlasses
                      ? "bg-blue-400 border-blue-500"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {index < waterGlasses && (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">
                      💧
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleWaterDecrease}
                disabled={waterGlasses === 0}
                className="flex-1 bg-white text-gray-700 rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Minus className="h-4 w-4" />
                <span className="text-sm">Remove</span>
              </button>
              <button
                onClick={handleWaterIncrease}
                disabled={waterGlasses >= 12}
                className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl py-3 flex items-center justify-center gap-2 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Glass</span>
              </button>
            </div>
          </div>
        </div>

      </div>
      
      <BottomNav />

      {/* Quick Actions FAB */}
      <QuickActionsFAB />

      {/* Global Search */}
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />

      {/* Tracker Wheel Tutorial */}
      <TutorialTooltip
        tutorialId="tracker-wheel"
        steps={[
          {
            id: "welcome",
            title: "Welcome to Health Trackers!",
            description: "This circular menu gives you quick access to all your health tracking tools. Let's take a quick tour!",
          },
          {
            id: "trackers",
            title: "7 Powerful Trackers",
            description: "Track Medical Records, Hydration, Sleep, Medications, Workouts, Fasting, and Symptoms - all in one place!",
          },
          {
            id: "center-button",
            title: "Tap the Center to Spin",
            description: "Tap the center button to rotate the wheel and explore different trackers. It's fun and interactive!",
          },
          {
            id: "click-tracker",
            title: "Click Any Tracker",
            description: "Simply tap any tracker icon to start logging your health data. Each tracker has charts, analytics, and insights!",
          },
        ]}
      />

      {/* Analyse Food Options Dialog */}
      <Dialog open={showAnalyseFoodOptions} onOpenChange={setShowAnalyseFoodOptions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1f7a8c]">Analyse Food</DialogTitle>
            <DialogDescription>Choose how you'd like to analyse your food.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-6">
            {/* Take Photo with Camera */}
            <button
              onClick={() => {
                setShowAnalyseFoodOptions(false);
                setShowCameraCapture(true);
              }}
              className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl hover:shadow-lg transition-all"
            >
              <div className="bg-white/20 rounded-full p-3">
                <Camera className="h-6 w-6" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">Take Photo with Camera</div>
                <div className="text-sm text-white/80">Capture food with your camera</div>
              </div>
            </button>

            {/* Upload from Gallery */}
            <button
              onClick={() => {
                setShowAnalyseFoodOptions(false);
                setShowCameraCapture(true);
              }}
              className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 hover:border-[#1f7a8c] rounded-xl transition-all"
            >
              <div className="bg-[#E8F5F5] rounded-full p-3">
                <Upload className="h-6 w-6 text-[#1f7a8c]" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800">Upload from Gallery</div>
                <div className="text-sm text-gray-600">Choose photo from your device</div>
              </div>
            </button>

            {/* Scan a Barcode */}
            <button
              onClick={() => {
                setShowAnalyseFoodOptions(false);
                navigate("/scan-barcode");
              }}
              className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 hover:border-[#1f7a8c] rounded-xl transition-all"
            >
              <div className="bg-[#E8F5F5] rounded-full p-3">
                <ScanBarcode className="h-6 w-6 text-[#2a9d8f]" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800">Scan a Barcode</div>
                <div className="text-sm text-gray-600">Scan product barcode for instant info</div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Capture Component */}
      <CameraCapture
        isOpen={showCameraCapture}
        onClose={() => setShowCameraCapture(false)}
        onCapture={(imageData, source) => {
          setCapturedImage(imageData);
          console.log('Food captured via:', source);
          // TODO: Send to AI analysis endpoint
        }}
        mode="food"
        title="Analyse Food"
      />

      {/* Local Food Engineer Options Dialog */}
      <Dialog open={showLocalFoodOptions} onOpenChange={setShowLocalFoodOptions}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl text-teal-600">Local Food Engineer</DialogTitle>
            <DialogDescription>Choose how you'd like to use the food engineer.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-6">
            {/* Scan Local Food */}
            <button
              onClick={() => {
                setShowLocalFoodOptions(false);
                setShowLocalFoodScanner(true);
              }}
              className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <div className="bg-white/20 rounded-full p-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">Scan Local Food</div>
                <div className="text-sm text-white/80">Analyze regional dishes with healthy swaps</div>
              </div>
            </button>

            {/* View Grocery List */}
            <button
              onClick={() => {
                setShowLocalFoodOptions(false);
                navigate("/grocery-list");
              }}
              className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 hover:border-teal-500 rounded-xl transition-all"
            >
              <div className="bg-teal-50 rounded-full p-3">
                <span className="text-3xl">🛒</span>
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800">View Grocery List</div>
                <div className="text-sm text-gray-600">See your shopping list for healthy ingredients</div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Local Food Scanner Component - NEW */}
      <LocalFoodScanner
        isOpen={showLocalFoodScanner}
        onClose={() => setShowLocalFoodScanner(false)}
      />

      {/* Show captured image preview (optional) */}
      {capturedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {!foodAnalysisResult ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl text-[#1f7a8c]">Ready to Analyse</h3>
                  <button onClick={() => { setCapturedImage(null); setIsAnalysingFood(false); }} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <img src={capturedImage} alt="Food to analyse" className="w-full rounded-2xl mb-4 max-h-56 object-cover" />
                {isAnalysingFood ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-10 h-10 border-4 border-[#1f7a8c] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#1f7a8c] font-medium">Analysing food...</p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="flex-1 border-2 border-gray-300 text-gray-700 rounded-xl py-3 hover:bg-gray-50 transition-colors"
                    >
                      Retake
                    </button>
                    <button
                      onClick={async () => {
                        console.log('[Home] Analyse button clicked');
                        setIsAnalysingFood(true);
                        try {
                          const token = await getAccessToken();
                          console.log('[Home] token:', !!token);
                          if (!token) throw new Error('Not authenticated');
                          const base64 = capturedImage.replace(/^data:[^;]+;base64,/, '');
                          console.log('[Home] POSTing to', FOOD_API_URL, 'base64 length:', base64.length);
                          const res = await fetch(FOOD_API_URL, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              imageBase64: base64,
                              userContext: {
                                medicalCondition: profile?.medicalCondition || 'None',
                                age: profile?.age || 'Not specified',
                                bmi: profile?.bmi || 'Not specified',
                                location: selectedLocation?.displayName || 'Nigeria',
                              },
                            }),
                          });
                          console.log('[Home] response status:', res.status);
                          const data = await res.json();
                          console.log('[Home] response data:', data);
                          if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
                          setFoodAnalysisResult(data.analysis);
                        } catch (err: any) {
                          console.error('[Home] analyse error:', err);
                          alert('Analysis failed: ' + (err?.message || err));
                        } finally {
                          setIsAnalysingFood(false);
                        }
                      }}
                      className="flex-1 bg-[#1f7a8c] text-white rounded-xl py-3 hover:bg-[#1a6273] transition-colors font-semibold"
                    >
                      Analyse
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl text-[#1f7a8c]">Analysis Results</h3>
                  <button onClick={() => { setCapturedImage(null); setFoodAnalysisResult(null); }} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="bg-teal-50 rounded-2xl p-4">
                    <p className="text-lg font-bold text-gray-800">{foodAnalysisResult.foodName || foodAnalysisResult.food_name || 'Food Item'}</p>
                    {foodAnalysisResult.clinicalIndication && <p className="text-sm text-gray-600 mt-1">{foodAnalysisResult.clinicalIndication}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Calories', value: `${foodAnalysisResult.calories ?? '–'} kcal`, color: 'bg-orange-50' },
                      { label: 'Protein',  value: `${foodAnalysisResult.protein  ?? '–'}g`,    color: 'bg-blue-50'   },
                      { label: 'Carbs',    value: `${foodAnalysisResult.carbs    ?? '–'}g`,    color: 'bg-yellow-50' },
                      { label: 'Fats',     value: `${foodAnalysisResult.fats     ?? '–'}g`,    color: 'bg-purple-50' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`${color} rounded-xl p-3`}>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-lg font-bold text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                  {Array.isArray(foodAnalysisResult.recommendations) && foodAnalysisResult.recommendations.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm font-semibold text-green-800 mb-2">Recommendations</p>
                      <ul className="space-y-1">
                        {foodAnalysisResult.recommendations.map((r: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-green-500">✓</span>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {foodAnalysisResult.circadianAnchor && (
                    <div className="bg-indigo-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Best Eating Time</p>
                      <p className="text-sm font-semibold text-indigo-800">{foodAnalysisResult.circadianAnchor}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setCapturedImage(null); setFoodAnalysisResult(null); }}
                  className="w-full mt-4 bg-[#1f7a8c] text-white rounded-xl py-3 font-semibold"
                >
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Detailed Gauge Breakdown Dialog */}
      <Dialog open={showGaugeDetails} onOpenChange={setShowGaugeDetails}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-[#1f7a8c] flex items-center justify-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Nutrition Breakdown
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Detailed view of your daily nutrition progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status Alert */}
            <Alert className={`${getGaugeStatus().bgColor} border-2`}>
              <Zap className="h-5 w-5" />
              <AlertTitle className={getGaugeStatus().textColor}>
                {getGaugeStatus().status}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {getGaugeStatus().message}
              </AlertDescription>
            </Alert>

            {/* Calorie Progress */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-800">Calories</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#1f7a8c]">{caloriesConsumed}</div>
                  <div className="text-xs text-gray-600">of {caloriesTarget} kcal</div>
                </div>
              </div>
              <Progress value={(caloriesConsumed / caloriesTarget) * 100} className="h-3" />
            </div>

            {/* Macronutrient Breakdown */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-[#1f7a8c]" />
                Macronutrients
              </h3>
              
              {/* Protein */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-700">Protein</div>
                  <div className="text-sm font-semibold text-blue-600">
                    {proteinConsumed}g / {proteinTarget}g
                  </div>
                </div>
                <div className="relative">
                  <Progress value={(proteinConsumed / proteinTarget) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0g</span>
                    <span>{proteinTarget}g</span>
                  </div>
                </div>
              </div>

              {/* Carbs */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-700">Carbohydrates</div>
                  <div className="text-sm font-semibold text-green-600">
                    {carbsConsumed}g / {carbsTarget}g
                  </div>
                </div>
                <div className="relative">
                  <Progress value={(carbsConsumed / carbsTarget) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0g</span>
                    <span>{carbsTarget}g</span>
                  </div>
                </div>
              </div>

              {/* Fats */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-700">Fats</div>
                  <div className="text-sm font-semibold text-purple-600">
                    {fatsConsumed}g / {fatsTarget}g
                  </div>
                </div>
                <div className="relative">
                  <Progress value={(fatsConsumed / fatsTarget) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0g</span>
                    <span>{fatsTarget}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Comparison (Expert Mode Only) */}
            {mode === "expert" && (
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  Weekly Progress
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Today:</span>
                    <span className="font-semibold text-[#1f7a8c]">{dailyProgress}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Yesterday:</span>
                    <span className="font-semibold text-gray-600">62% <span className="text-red-500 text-xs">↓7%</span></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Weekly Average:</span>
                    <span className="font-semibold text-green-600">68%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowGaugeDetails(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setShowGaugeDetails(false);
                  navigate("/logs");
                }}
                className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]"
              >
                View Full Log
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Meal Log Dialog */}
      <Dialog open={showQuickMealLog} onOpenChange={setShowQuickMealLog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center text-[#1f7a8c]">
              Log {selectedQuickMeal && selectedQuickMeal.charAt(0).toUpperCase() + selectedQuickMeal.slice(1)}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Quick log your meal with common Nigerian options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Common Nigerian meals based on meal type — one tap to log */}
            {selectedQuickMeal && (
              <div className="space-y-3">
                {quickMealOptions[selectedQuickMeal].map((meal) => (
                  <button
                    key={meal.name}
                    onClick={() => handleQuickLog(meal)}
                    disabled={quickLogging}
                    className={`w-full bg-gradient-to-r border-2 rounded-xl p-4 text-left hover:border-[#1f7a8c] transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                      selectedQuickMeal === "breakfast"
                        ? "from-yellow-50 to-orange-50 border-yellow-200"
                        : selectedQuickMeal === "lunch"
                        ? "from-green-50 to-emerald-50 border-green-200"
                        : "from-purple-50 to-pink-50 border-purple-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{meal.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{meal.name}</div>
                        <div className="text-xs text-gray-600">~{meal.calories} kcal • {meal.label}</div>
                      </div>
                      <Plus className="h-5 w-5 text-[#1f7a8c] flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Custom Entry Option */}
            <button
              onClick={handleCustomEntry}
              disabled={quickLogging}
              className="w-full bg-white border-2 border-dashed border-[#1f7a8c] rounded-xl p-4 text-center hover:bg-[#E8F5F5] transition-colors disabled:opacity-60"
            >
              <div className="flex items-center justify-center gap-2 text-[#1f7a8c] font-semibold">
                <Plus className="h-5 w-5" />
                Custom Entry
              </div>
            </button>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowQuickMealLog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowQuickMealLog(false);
                  navigate("/logs");
                }}
                className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]"
              >
                View Full Logs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Meal Prescription Dialog */}
      <Dialog open={showMealPrescription} onOpenChange={setShowMealPrescription}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className={`${selectedMeal.color} rounded-full p-6 text-5xl`}>
                    {selectedMeal.meal}
                  </div>
                </div>
                <DialogTitle className={`text-2xl text-center mb-2 ${selectedMeal.color}`}>
                  {selectedMeal.mealName}
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  Detailed meal prescription for optimal health
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Description */}
                <div className={`${selectedMeal.color} rounded-2xl p-4`}>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Metabolic Window:</strong> {selectedMeal.metabolicWindow}<br />
                    <strong>Circadian Anchor:</strong> {selectedMeal.circadian_anchor}<br />
                    <strong>Biochemical Ratio:</strong> {selectedMeal.biochemical_ratio}<br />
                    <strong>Clinical Indication:</strong> {selectedMeal.clinical_indication}<br />
                    <strong>Engineering Method:</strong> {selectedMeal.engineering_method}<br />
                    <strong>Glycemic Load:</strong> {selectedMeal.glycemicLoad}<br />
                    <strong>Bioavailability:</strong> {selectedMeal.bioAvailability.pairing} - {selectedMeal.bioAvailability.explanation}
                  </p>
                </div>

                {/* Regional Ingredients */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className={`h-5 w-5 ${selectedMeal.color}`} />
                    <h3 className={`text-lg ${selectedMeal.color}`}>Regional Ingredients</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-[#B8E5E5] rounded-xl p-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#1f7a8c]" />
                      <span className="text-sm text-gray-700">
                        Ingredients for <span className="font-semibold">{selectedLocation.displayName}</span>
                      </span>
                      <span className="ml-auto text-lg">{selectedLocation.flag}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedMeal.regionalIngredients[getRegionalKey()].map((ingredient, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-xl p-2 text-sm text-gray-700"
                        >
                          {ingredient}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      {getRegionalKey() === "lagos" 
                        ? "These ingredients are commonly available in local markets"
                        : "These are recommended substitutes available in your region"}
                    </p>
                  </div>
                </div>

                {/* Meal Prescription */}
                <div className={`${selectedMeal.color} rounded-2xl p-4 border-2 ${selectedMeal.color.replace('text', 'border')}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className={`h-4 w-4 ${selectedMeal.color}`} />
                    <p className={`text-sm ${selectedMeal.color}`}>
                      Meal Prescription
                    </p>
                  </div>
                  <p className="text-xs text-gray-600">
                    <strong>Physiological Goal:</strong> {selectedMeal.mealPrescription.physiologicalGoal}<br />
                    <strong>Engineer's Note:</strong> {selectedMeal.mealPrescription.engineersNote}<br />
                    <strong>Pantry Check:</strong> {selectedMeal.mealPrescription.pantryCheck.join(", ")}
                  </p>
                </div>

                {/* Post-Meal Log */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPostMealLog(true)}
                    className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 hover:shadow-lg transition-all"
                  >
                    Log Post-Meal Data
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowMealPrescription(false)}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 hover:shadow-lg transition-all"
                >
                  Got It!
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Post-Meal Log Dialog */}
      <Dialog open={showPostMealLog} onOpenChange={setShowPostMealLog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className={`${selectedMeal.color} rounded-full p-6 text-5xl`}>
                    {selectedMeal.meal}
                  </div>
                </div>
                <DialogTitle className={`text-2xl text-center mb-2 ${selectedMeal.color}`}>
                  {selectedMeal.mealName}
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  Log your post-meal data for analysis
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Energy Level */}
                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 rounded-xl p-2 text-sm text-gray-700">
                    Energy Level
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPostMealData({ ...postMealData, energyLevel: Math.max(postMealData.energyLevel - 1, 1) })}
                      className="bg-gray-50 rounded-full p-2 text-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="bg-gray-50 rounded-full p-2 text-sm text-gray-700">
                      {postMealData.energyLevel}
                    </div>
                    <button
                      onClick={() => setPostMealData({ ...postMealData, energyLevel: Math.min(postMealData.energyLevel + 1, 5) })}
                      className="bg-gray-50 rounded-full p-2 text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Digestive Comfort */}
                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 rounded-xl p-2 text-sm text-gray-700">
                    Digestive Comfort
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPostMealData({ ...postMealData, digestiveComfort: Math.max(postMealData.digestiveComfort - 1, 1) })}
                      className="bg-gray-50 rounded-full p-2 text-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="bg-gray-50 rounded-full p-2 text-sm text-gray-700">
                      {postMealData.digestiveComfort}
                    </div>
                    <button
                      onClick={() => setPostMealData({ ...postMealData, digestiveComfort: Math.min(postMealData.digestiveComfort + 1, 5) })}
                      className="bg-gray-50 rounded-full p-2 text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Condition Metric */}
                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 rounded-xl p-2 text-sm text-gray-700">
                    Condition Metric
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPostMealData({ ...postMealData, conditionMetric: Math.max(postMealData.conditionMetric - 10, 0) })}
                      className="bg-gray-50 rounded-full p-2 text-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="bg-gray-50 rounded-full p-2 text-sm text-gray-700">
                      {postMealData.conditionMetric}
                    </div>
                    <button
                      onClick={() => setPostMealData({ ...postMealData, conditionMetric: Math.min(postMealData.conditionMetric + 10, 200) })}
                      className="bg-gray-50 rounded-full p-2 text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // Handle post-meal data submission
                      console.log("Post-Meal Data:", postMealData);
                      setShowPostMealLog(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 hover:shadow-lg transition-all"
                  >
                    Submit
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowPostMealLog(false)}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 hover:shadow-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}