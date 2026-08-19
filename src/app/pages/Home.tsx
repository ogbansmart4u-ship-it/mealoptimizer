import React, { useState, useRef, useEffect } from "react";
import {
  Camera, Sparkles, TrendingUp, MapPin, Globe, AlertCircle, AlertTriangle, ChevronDown, ChevronUp, X,
  Activity, Clock, Flame, Calendar, Bell, BellRing, ChevronRight, Heart,
  Droplet, Droplets, Minus, Plus, Upload, Zap, Target, BarChart3, ScanBarcode, Shield, ShieldCheck, Moon, Search, FlaskConical, BookOpen, Stethoscope, Mic, ShoppingCart, Compass, FileText, CheckCircle2, Trophy, Pill, FileSpreadsheet
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import StreakCard from "../components/StreakCard";
import { useNavigate } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useAppMode } from "../contexts/AppModeContext";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useMascot } from "../hooks/useMascot";
import Mascot from "../components/Mascot";
import MascotNudge from "../components/MascotNudge";
import SpotlightTour from "../components/SpotlightTour";
import HealthProfileWizardModal from "../components/HealthProfileWizardModal";
import AvoAcademy from "../components/AvoAcademy";
import FoodWrappedModal from "../components/FoodWrappedModal";
import NotificationSettingsDialog from "../components/NotificationSettingsDialog";
import MetabolicChecklist from "../components/MetabolicChecklist";
import VoiceFoodLogger from "../components/VoiceFoodLogger";
import PostMealCheckIn from "../components/PostMealCheckIn";
import SmartGroceryPlanner from "../components/SmartGroceryPlanner";
import CircadianArc from "../components/CircadianArc";
import WhatsAppConnectDialog from "../components/WhatsAppConnectDialog";
import QuickLogShelf, { QuickFoodItem } from "../components/QuickLogShelf";
import { useSmartNudges } from "../hooks/useSmartNudges";
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
import { createMealLog, getMealLogs, getHydrationLogs, createHydrationLog, deleteHydrationLog } from "../../lib/api";
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
  const mascot = useMascot();

  // Greet the user with a wave when the dashboard loads (then Avo settles to idle).
  useEffect(() => {
    mascot.wave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalysingFood, setIsAnalysingFood] = useState(false);
  const [foodAnalysisResult, setFoodAnalysisResult] = useState<Record<string, any> | null>(null);
  const [showLocalFoodScanner, setShowLocalFoodScanner] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showHealthWizard, setShowHealthWizard] = useState(() => {
    try {
      return localStorage.getItem("hasCompletedHealthSetup") !== "true";
    } catch {
      return false;
    }
  });
  const [showSpotlightTour, setShowSpotlightTour] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);
  const [showGroceryPlanner, setShowGroceryPlanner] = useState(false);
  const [activeHomeTab, setActiveHomeTab] = useState<"today" | "academy" | "clinical">("today");
  const [showFoodWrapped, setShowFoodWrapped] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAnalyseFoodOptions, setShowAnalyseFoodOptions] = useState(false);
  const [showLocalFoodOptions, setShowLocalFoodOptions] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // Animation states for Daily Fuel Gauge
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  // State for enhanced Daily Fuel Gauge
  const [showGaugeDetails, setShowGaugeDetails] = useState(false);
  const [showQuickMealLog, setShowQuickMealLog] = useState(false);
  const [selectedQuickMeal, setSelectedQuickMeal] = useState<"breakfast" | "lunch" | "dinner" | null>(null);

  // Track current day of week for automatic calendar rotation (0 = Mon, 6 = Sun)
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  });

  // Auto-update calendar at midnight every day
  useEffect(() => {
    const updateCurrentDay = () => {
      const today = new Date().getDay();
      const dayIndex = today === 0 ? 6 : today - 1;
      setCurrentDayIndex(dayIndex);
    };

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      updateCurrentDay();
      const dailyInterval = setInterval(updateCurrentDay, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  // Initialize sample data for new users
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Load this account's real meal logs
  const [weekLogs, setWeekLogs] = useState<any[]>([]);
  useEffect(() => {
    getMealLogs()
      .then((d) => setWeekLogs(Array.isArray(d) ? d : []))
      .catch((e) => { console.error('Failed to load meal logs', e); setWeekLogs([]); });
  }, []);

  // 7 days of the current week (Mon-Sun)
  const todayKey = new Date().toISOString().split('T')[0];
  const weekBase = new Date(`${todayKey}T12:00:00Z`);
  const weekMondayOffset = (weekBase.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
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
    return `${mk(first.key)} - ${mk(last.key)}`;
  })();

  // Today's nutrition from real logs
  const todayLogs = weekLogs.filter((l) => l?.date === todayKey);
  const sumField = (f: string) => todayLogs.reduce((s, l) => s + (Number(l?.[f]) || 0), 0);
  const caloriesConsumed = sumField("calories");
  const caloriesTarget = 2000;
  const proteinConsumed = sumField("protein");
  const proteinTarget = 100;
  const carbsConsumed = sumField("carbs");
  const carbsTarget = 150;
  const fatsConsumed = sumField("fats");
  const fatsTarget = 67;

  // Gauge percentage (0-100)
  const dailyProgress =
    caloriesTarget > 0 ? Math.min(Math.round((caloriesConsumed / caloriesTarget) * 100), 100) : 0;

  // Real daily logging streak
  const loggedDays = new Set(weekLogs.map((l) => l?.date).filter(Boolean));
  const trackingStreak = (() => {
    let c = 0;
    const d = new Date();
    const k = (x: Date) => x.toISOString().split("T")[0];
    if (!loggedDays.has(k(d))) d.setDate(d.getDate() - 1);
    while (loggedDays.has(k(d))) {
      c++;
      d.setDate(d.getDate() - 1);
    }
    return c;
  })();

  // Animate gauge on mount
  useEffect(() => {
    const progressTimer = setTimeout(() => {
      setAnimatedProgress(dailyProgress);
    }, 300);

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

  // Water tracker
  const waterGoal = 10;
  const GLASS_ML = 250;
  const [waterMl, setWaterMl] = useState(0);
  const [homeWaterIds, setHomeWaterIds] = useState<string[]>([]);
  const [waterBusy, setWaterBusy] = useState(false);
  const waterGlasses = Math.round(waterMl / GLASS_ML);

  const loadWater = () => {
    const today = new Date().toISOString().split("T")[0];
    getHydrationLogs()
      .then((items: any[]) => {
        const todays = (items ?? []).filter((it) => String(it.logged_at ?? "").startsWith(today));
        const total = todays.reduce((sum, it) => sum + (it.amount_ml ?? 0), 0);
        setWaterMl(total);
        setHomeWaterIds(
          todays
            .filter((it) => (it.amount_ml ?? 0) === GLASS_ML && (it.type ?? "water") === "water")
            .map((it) => String(it.id)),
        );
      })
      .catch(() => {});
  };

  useEffect(() => { loadWater(); }, []);
  useEffect(() => {
    const onFocus = () => loadWater();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const [selectedMeal, setSelectedMeal] = useState<MealMetadata | null>(null);
  const [showMealPrescription, setShowMealPrescription] = useState(false);
  const [showPostMealLog, setShowPostMealLog] = useState(false);
  const [postMealData, setPostMealData] = useState<PostMealLog>({
    energyLevel: 3,
    digestiveComfort: 3,
    conditionMetric: 120,
    timestamp: new Date(),
  });

  const handleWaterIncrease = async () => {
    if (waterBusy || waterGlasses >= 12) return;
    setWaterBusy(true);
    setWaterMl((ml) => ml + GLASS_ML);
    try {
      const item = await createHydrationLog({
        amount_ml: GLASS_ML,
        type: "water",
        logged_at: new Date().toISOString(),
      });
      if (item?.id) setHomeWaterIds((ids) => [...ids, String(item.id)]);
      const nextGlasses = waterGlasses + 1;
      if (nextGlasses >= waterGoal) {
        celebrate("Hydration Goal Achieved! 💧🎉", "10 of 10 glasses completed today!", {
          confettiStyle: "cannons",
          hapticPattern: "milestone",
        });
      } else {
        celebrate("Water Logged! 💧 (+250ml)", `${nextGlasses}/${waterGoal} glasses today`, {
          confetti: false,
          hapticPattern: "light",
        });
      }
    } catch {
      setWaterMl((ml) => Math.max(0, ml - GLASS_ML));
    } finally {
      setWaterBusy(false);
    }
  };

  const { nudge: smartNudge, closeNudge: closeSmartNudge } = useSmartNudges({
    waterGlasses,
    mealsLoggedCount: todayLogs.length,
    streak: trackingStreak,
    onDrinkWater: () => handleWaterIncrease(),
    onLogMeal: () => navigate("/plan-meal"),
  });

  const handleWaterDecrease = async () => {
    if (waterBusy || homeWaterIds.length === 0) return;
    setWaterBusy(true);
    const id = homeWaterIds[homeWaterIds.length - 1];
    setHomeWaterIds((ids) => ids.slice(0, -1));
    setWaterMl((ml) => Math.max(0, ml - GLASS_ML));
    try {
      await deleteHydrationLog(id);
    } catch {
      setHomeWaterIds((ids) => [...ids, id]);
      setWaterMl((ml) => ml + GLASS_ML);
    } finally {
      setWaterBusy(false);
    }
  };

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

  const getTimeBasedRecommendation = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 10) {
      return {
        greeting: getTimeBasedGreeting(),
        recommendation: t('rec.morningRec'),
        metabolicWindow: t('rec.morningWindow'),
        icon: "🌅"
      };
    } else if (currentHour >= 10 && currentHour < 15) {
      return {
        greeting: getTimeBasedGreeting(),
        recommendation: t('rec.afternoonRec'),
        metabolicWindow: t('rec.afternoonWindow'),
        icon: "☀️"
      };
    } else if (currentHour >= 15 && currentHour < 19) {
      return {
        greeting: getTimeBasedGreeting(),
        recommendation: t('rec.eveningRec'),
        metabolicWindow: t('rec.eveningWindow'),
        icon: "🌆"
      };
    } else {
      return {
        greeting: getTimeBasedGreeting(),
        recommendation: t('rec.nightRec'),
        metabolicWindow: t('rec.nightWindow'),
        icon: "🌙"
      };
    }
  };

  const getGaugeStatus = () => {
    if (dailyProgress >= 80) {
      return {
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        message: t('gauge.msgOnTrack'),
        emoji: "💪",
        status: t('gauge.onTrack')
      };
    } else if (dailyProgress >= 50) {
      return {
        color: "from-yellow-500 to-orange-500",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        message: t('gauge.msgModerate'),
        emoji: "🤔",
        status: t('gauge.moderate')
      };
    } else {
      return {
        color: "from-red-500 to-pink-500",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        message: t('gauge.msgNeedsAttention'),
        emoji: "⚠️",
        status: t('gauge.needsAttention')
      };
    }
  };

  const [quickLogging, setQuickLogging] = useState(false);

  const handleQuickLogItem = async (food: QuickFoodItem) => {
    if (quickLogging) return;
    const now = new Date();
    const newLog = {
      id: Date.now().toString(),
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      mealType: food.mealType,
      foodName: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      energyRating: 4,
      digestiveComfort: 4,
      bloodSugarImpact: food.glycemicTag === "Low Spike" || food.glycemicTag === "Heart Safe" ? "low" : "medium",
    };
    setQuickLogging(true);
    setWeekLogs((prev) => [...prev, newLog]);
    try {
      await createMealLog(newLog);
      mascot.thumbsUp();
      celebrate(`${food.name} logged! 🍲🎉`, `+${food.calories} kcal · ${food.protein}g protein`, {
        confettiStyle: "burst",
        hapticPattern: "success",
      });
    } catch (e) {
      console.error("Failed to quick-log meal", e);
      toast.error("Could not log meal. Please try again.");
      setWeekLogs((prev) => prev.filter((l) => l.id !== newLog.id));
    } finally {
      setQuickLogging(false);
    }
  };

  const handleQuickMealSelect = (mealType: "breakfast" | "lunch" | "dinner") => {
    setSelectedQuickMeal(mealType);
    setShowQuickMealLog(true);
  };

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
      mascot.thumbsUp();
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

  // User active conditions for Clinical tab
  const activeConditions = (profile?.conditions || []).map((c: any) =>
    typeof c === "string" ? c : c?.name || "General Metabolic Care"
  );
  if (activeConditions.length === 0 && profile?.medicalCondition) {
    activeConditions.push(profile.medicalCondition);
  }
  if (activeConditions.length === 0) {
    activeConditions.push("General Metabolic Wellness");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28">
      {/* Header */}
      <div className="bg-[#B8E5E5] px-6 pt-10 pb-4">
        {/* Top utility row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-white/70 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
              {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
            </span>
            <span className="flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full border border-orange-200 shadow-sm">
              <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
              <span>{trackingStreak}d streak</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFoodWrapped(true)}
              className="flex items-center gap-1 text-xs font-black px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Open Food Wrapped Story"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-950 fill-amber-950" />
              <span>Wrapped</span>
            </button>
            <button
              onClick={() => setShowGlobalSearch(true)}
              className="p-2.5 bg-white/70 hover:bg-white rounded-full transition-all shadow-sm active:scale-95"
              aria-label="Search"
            >
              <Search className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => setShowNotificationSettings(true)}
              className="p-2.5 bg-white/70 hover:bg-white rounded-full transition-all shadow-sm active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-gray-700" />
            </button>
            <ProfilePictureUpload />
          </div>
        </div>
        
        {/* Logo & Greeting Bar */}
        <div className="flex items-center justify-between gap-3 my-2">
          <div className="flex items-center gap-3">
            <Mascot size={46} className="flex-shrink-0 drop-shadow-sm" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                {getTimeBasedGreeting()}, {userName || "Friend"}
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">{currentDate}</p>
            </div>
          </div>
          <img 
            src={logoImage} 
            alt="MealOptimiza" 
            className="h-10 object-contain hidden sm:block opacity-90"
          />
        </div>
      </div>

      {/* Main Content Area with Tabbed Architecture */}
      <div className="px-5 sm:px-6 mt-2">
        {/* Segmented Tab Navigation Control */}
        <div className="sticky top-3 z-30 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-teal-100/90 flex gap-1 mb-5 transition-all">
          <button
            onClick={() => setActiveHomeTab("today")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeHomeTab === "today"
                ? "bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white shadow-md scale-[1.02]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
          >
            <Sparkles size={15} />
            <span>Today</span>
          </button>

          <button
            onClick={() => setActiveHomeTab("academy")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeHomeTab === "academy"
                ? "bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white shadow-md scale-[1.02]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
          >
            <BookOpen size={15} />
            <span>Avo Academy</span>
          </button>

          <button
            onClick={() => setActiveHomeTab("clinical")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeHomeTab === "clinical"
                ? "bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white shadow-md scale-[1.02]"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
          >
            <Stethoscope size={15} />
            <span>Clinical & Vitals</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: TODAY (Decluttered Daily Metabolic Fuel & Actions)      */}
        {/* ============================================================ */}
        {activeHomeTab === "today" && (
          <motion.div
            key="today-tab"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Daily Fuel Gauge Card */}
            <div className="bg-gradient-to-br from-white via-[#F4FBFA] to-[#E2F4F3] rounded-3xl shadow-lg border border-teal-100/80 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1f7a8c]">
                  {t('home.todaysCalories')}
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {caloriesConsumed} / {caloriesTarget} kcal
                </span>
              </div>

              {/* Clickable SVG Gauge */}
              <button 
                onClick={() => setShowGaugeDetails(true)}
                className="w-full hover:scale-[1.02] active:scale-[0.99] transition-transform duration-200 focus:outline-none rounded-2xl cursor-pointer"
                aria-label={`Daily nutrition progress: ${animatedPercentage}% of goal achieved. Tap for detailed breakdown.`}
              >
                <div className="relative flex flex-col items-center justify-center my-2">
                  <svg className="w-48 h-28" viewBox="0 0 200 115">
                    <path
                      d="M 30 95 A 70 70 0 0 1 170 95"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 30 95 A 70 70 0 0 1 170 95"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeDasharray={`${animatedProgress * 2.2} 1000`}
                      style={{
                        transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1f7a8c" />
                        <stop offset="100%" stopColor="#4ecdc4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute top-8 flex flex-col items-center">
                    <div className="text-[#1f7a8c] text-2xl font-black">
                      {animatedPercentage}%
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-semibold">{t('home.ofDailyGoal')}</div>
                    <div className="text-[10px] text-teal-700 font-bold mt-0.5 bg-teal-50 px-2 py-0.5 rounded-full">
                      {t('home.tapForDetails')} 📊
                    </div>
                  </div>
                </div>
              </button>

              {/* Quick Macro Breakdown Row */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-teal-100 text-center">
                <div className="bg-white/80 rounded-2xl p-2 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-gray-500 font-bold block">Protein</span>
                  <span className="text-xs font-extrabold text-blue-700">{proteinConsumed}g</span>
                  <span className="text-[9px] text-gray-400 block">/ {proteinTarget}g</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-2 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-gray-500 font-bold block">Carbs</span>
                  <span className="text-xs font-extrabold text-emerald-700">{carbsConsumed}g</span>
                  <span className="text-[9px] text-gray-400 block">/ {carbsTarget}g</span>
                </div>
                <div className="bg-white/80 rounded-2xl p-2 shadow-xs border border-teal-50">
                  <span className="text-[10px] text-gray-500 font-bold block">Fats</span>
                  <span className="text-xs font-extrabold text-purple-700">{fatsConsumed}g</span>
                  <span className="text-[9px] text-gray-400 block">/ {fatsTarget}g</span>
                </div>
              </div>
            </div>

            {/* 1-Tap Quick-Log Shelf */}
            <div id="tour-quick-shelf" className="my-2">
              <QuickLogShelf
                onLogItem={handleQuickLogItem}
                onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                onOpenScanner={() => setShowLocalFoodScanner(true)}
                onOpenCustom={() => navigate("/logs", { state: { openAdd: true } })}
                isLogging={quickLogging}
              />
            </div>

            {/* Daily Metabolic Habit Scorecard */}
            <MetabolicChecklist
              waterCount={waterGlasses}
              mealsLoggedCount={todayLogs.length}
              vitalsLoggedCount={0}
              onOpenWater={handleWaterIncrease}
              onOpenQuickLog={() => navigate("/plan-meal")}
            />

            {/* Circadian Timing & Post-Meal Check-In */}
            {todayLogs.length > 0 && (
              <PostMealCheckIn lastMeal={todayLogs[todayLogs.length - 1]} />
            )}

            <CircadianArc lastMealTime={todayLogs[todayLogs.length - 1]?.time || "20:00"} />

            {/* Time-Based Recommendation Card */}
            <div className="bg-white rounded-3xl p-4 shadow-md border border-teal-100 flex items-start gap-3">
              <div className="p-3 bg-teal-50 text-2xl rounded-2xl flex-shrink-0">
                {getTimeBasedRecommendation().icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-[#1f7a8c] block">
                  {mode === "simple" ? t('home.mealSuggestion') : t('home.metabolicFocus')}
                </span>
                <p className="text-xs font-bold text-gray-900 mt-0.5">
                  {getTimeBasedRecommendation().greeting}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {getTimeBasedRecommendation().recommendation}
                </p>
              </div>
            </div>

            {/* Core Action Grid (2x2) */}
            <div>
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider mb-3">
                {t('home.analyserPlanner')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Snap & Know Card */}
                <button
                  onClick={() => setShowLocalFoodScanner(true)}
                  className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-4 text-white text-left shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col justify-between h-36"
                >
                  <div className="bg-white/20 rounded-2xl p-2.5 w-fit">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">
                      {t('home.snapKnow')}
                    </span>
                    <span className="text-[10px] text-teal-50/80 block mt-0.5">
                      Food photo AI analyzer
                    </span>
                  </div>
                </button>

                {/* 2. Plan My Meal Card */}
                <button
                  onClick={() => navigate("/plan-meal")}
                  className="bg-white rounded-3xl p-4 text-left shadow-md hover:shadow-lg border-2 border-[#1f7a8c]/20 hover:border-[#1f7a8c] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col justify-between h-36"
                >
                  <div className="bg-orange-100 rounded-2xl p-2.5 w-fit text-xl">
                    🍽️
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 block leading-tight">
                      {t('home.planMyMeal')}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      Nigerian/Diaspora meals
                    </span>
                  </div>
                </button>

                {/* 3. Smart Grocery List */}
                <button
                  onClick={() => navigate("/grocery-list")}
                  className="bg-white rounded-3xl p-4 text-left shadow-md hover:shadow-lg border-2 border-teal-100 hover:border-teal-400 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col justify-between h-36"
                >
                  <div className="bg-teal-50 rounded-2xl p-2.5 w-fit text-xl">
                    🛒
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-gray-900 block leading-tight">
                      {t('grocery.title')}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      Market price sync & swaps
                    </span>
                  </div>
                </button>

                {/* 4. Custom Meal Plan */}
                <button
                  onClick={() => navigate("/hyper-personalized-plan")}
                  className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-4 text-white text-left shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col justify-between h-36"
                >
                  <div className="bg-white/20 rounded-2xl p-2.5 w-fit">
                    <FlaskConical className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block leading-tight">
                      Custom Bio-Plan
                    </span>
                    <span className="text-[10px] text-purple-100 block mt-0.5">
                      Hyper-personalized recipes
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* This Week's Food Calendar */}
            <div className="bg-white rounded-3xl shadow-md border border-teal-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{t('home.thisWeeksMeals')}</h3>
                  <span className="px-2 py-0.5 bg-teal-50 text-[#1f7a8c] text-[10px] font-bold rounded-full">
                    {weekRangeLabel}
                  </span>
                </div>
                <button
                  onClick={() => navigate("/logs")}
                  className="text-xs font-bold text-[#1f7a8c] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>{t('home.viewAll')}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const logged = day.count > 0;
                  return (
                    <button
                      key={day.key}
                      onClick={() => navigate("/logs", { state: { date: day.key } })}
                      title={logged ? `${day.count} meals · ${day.calories} kcal` : 'No meals logged'}
                      className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all cursor-pointer ${
                        day.isToday
                          ? "bg-[#1f7a8c] text-white shadow-sm scale-105"
                          : logged
                          ? "bg-teal-50 border border-teal-200 text-teal-900"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span className={`text-[10px] font-bold mb-1 ${day.isToday ? "text-white" : "text-gray-500"}`}>
                        {day.label}
                      </span>
                      <span className="text-base mb-0.5 leading-none">{logged ? "🍲" : "·"}</span>
                      <span className={`text-[9px] font-semibold ${day.isToday ? "text-white/90" : "text-gray-400"}`}>
                        {logged ? `${day.count}m` : day.dateNum}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location & Regional Market Tip */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl p-4 border border-teal-100/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
                  Regional Market Sync
                </span>
                <span className="text-sm">{selectedLocation.flag} {selectedLocation.displayName}</span>
              </div>
              <LocationSelector />
            </div>
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: AVO ACADEMY (60-Second Food Science Masterclasses)     */}
        {/* ============================================================ */}
        {activeHomeTab === "academy" && (
          <motion.div
            key="academy-tab"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Food Wrapped Story Highlight Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-teal-700 rounded-3xl p-5 text-white shadow-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  <Sparkles size={11} /> 9:16 Story Deck
                </div>
                <h3 className="text-base font-black leading-tight">
                  Your {new Date().toLocaleString("default", { month: "long" })} Food Wrapped
                </h3>
                <p className="text-xs text-white/90 leading-snug">
                  See your cultural food archetype, blood sugar stability score, and share to WhatsApp Status!
                </p>
              </div>
              <button
                onClick={() => setShowFoodWrapped(true)}
                className="px-4 py-3 bg-white text-slate-900 font-extrabold text-xs rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                View Story ✨
              </button>
            </div>

            {/* Embedded Avo Academy Component */}
            <AvoAcademy />
          </motion.div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CLINICAL & VITALS (Metabolic Safeguards & Doctor PDF)   */}
        {/* ============================================================ */}
        {activeHomeTab === "clinical" && (
          <motion.div
            key="clinical-tab"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* 1. Active Conditions Safeguards Card */}
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-teal-100">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-teal-50 text-[#1f7a8c]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 leading-tight">
                      Active Condition Intelligence
                    </h3>
                    <p className="text-[11px] text-gray-500">Real-time dietary guards for your health</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/medical-condition")}
                  className="text-xs font-bold text-[#1f7a8c] hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Condition Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {activeConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-teal-50 text-[#1f7a8c] border border-teal-200 rounded-full text-xs font-extrabold flex items-center gap-1.5"
                  >
                    <Activity size={13} />
                    <span>{cond}</span>
                  </span>
                ))}
              </div>

              {/* Safeguards Bullet List */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs">
                <div className="flex items-start gap-2 text-gray-700">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Glycemic Spike Shield:</strong> Real-time meal analysis flags high-GI cassava/white rice spikes.</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <span className="text-teal-500 font-bold">✓</span>
                  <span><strong>Sodium & Palm Oil Check:</strong> Monitors stock cubes and saturated palm oil ratios for blood pressure control.</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span><strong>Wound & Tissue Recovery:</strong> Ensures daily protein target (100g) for maternal / surgical recovery.</span>
                </div>
              </div>
            </div>

            {/* 2. Biometric Vitals Quick-Snapshot (3 Cards Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Glucose & Projected eA1c */}
              <button
                onClick={() => navigate("/glucose-insights")}
                className="bg-white rounded-3xl p-4 shadow-md border border-rose-100 hover:shadow-lg transition-all text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-rose-600">Blood Glucose & eA1c</span>
                  <Droplet className="h-4 w-4 text-rose-500" />
                </div>
                <div className="text-xl font-black text-gray-900">
                  118 <span className="text-xs font-normal text-gray-500">mg/dL</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Projected eA1c: <strong className="text-rose-700 font-bold">5.7%</strong> (Optimal)
                </p>
                <span className="mt-2 text-[10px] font-bold text-[#1f7a8c] block">
                  View Insights →
                </span>
              </button>

              {/* Blood Pressure */}
              <button
                onClick={() => navigate("/biometric-dashboard")}
                className="bg-white rounded-3xl p-4 shadow-md border border-purple-100 hover:shadow-lg transition-all text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-purple-600">Blood Pressure</span>
                  <Activity className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-xl font-black text-gray-900">
                  118/78 <span className="text-xs font-normal text-gray-500">mmHg</span>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">
                  Normal Range (AHA Standard)
                </p>
                <span className="mt-2 text-[10px] font-bold text-[#1f7a8c] block">
                  Log Vitals →
                </span>
              </button>

              {/* Weight & BMI */}
              <button
                onClick={() => navigate("/weight")}
                className="bg-white rounded-3xl p-4 shadow-md border border-teal-100 hover:shadow-lg transition-all text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-teal-600">Weight & BMI</span>
                  <TrendingUp className="h-4 w-4 text-teal-500" />
                </div>
                <div className="text-xl font-black text-gray-900">
                  {profile?.weight ? `${profile.weight} kg` : "72.4 kg"}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  BMI: <strong>23.4</strong> (Healthy Weight)
                </p>
                <span className="mt-2 text-[10px] font-bold text-[#1f7a8c] block">
                  Track Weight →
                </span>
              </button>
            </div>

            {/* 3. 1-Tap Clinical Doctor PDF Export Banner */}
            <div className="bg-gradient-to-br from-[#1f7a8c] to-[#0e4d5c] rounded-3xl p-5 text-white shadow-xl">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <FileSpreadsheet className="h-7 w-7 text-white" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-400 text-teal-950 font-extrabold text-[10px]">
                  Clinical Ready
                </span>
              </div>
              <h3 className="text-base font-bold leading-snug mb-1">
                Doctor & Dietitian 30-Day Clinical Report
              </h3>
              <p className="text-xs text-teal-50/90 leading-relaxed mb-4">
                Export your glycemic logs, blood pressure trends, estimated A1c, and dietary compliance into a certified 1-page PDF summary for your physician.
              </p>
              <button
                onClick={() => navigate("/health-report")}
                className="w-full py-3 bg-white text-[#1f7a8c] hover:bg-teal-50 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={16} />
                <span>Open Clinical Doctor Report</span>
              </button>
            </div>

            {/* 4. Medical Vault & Medication Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/medical-vault")}
                className="bg-white rounded-3xl p-4 border border-teal-100 shadow-md text-left hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 w-fit mb-2">
                  <Shield size={20} />
                </div>
                <span className="text-xs font-extrabold text-gray-900 block">Medical Vault</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Lab results & prescriptions</span>
              </button>

              <button
                onClick={() => navigate("/medication-tracker")}
                className="bg-white rounded-3xl p-4 border border-teal-100 shadow-md text-left hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 w-fit mb-2">
                  <Pill size={20} />
                </div>
                <span className="text-xs font-extrabold text-gray-900 block">Medication Tracker</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Dose logs & adherence</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />

      {/* Floating Action / WhatsApp Modal */}
      <WhatsAppConnectDialog isOpen={showWhatsAppModal} onClose={() => setShowWhatsAppModal(false)} />
      <div id="tour-fab-actions"><QuickActionsFAB /></div>

      <HealthProfileWizardModal
        isOpen={showHealthWizard}
        onComplete={() => {
          setShowHealthWizard(false);
          setShowSpotlightTour(true);
        }}
      />

      <SpotlightTour isOpen={showSpotlightTour} onClose={() => setShowSpotlightTour(false)} />
      <VoiceFoodLogger
        isOpen={showVoiceLogger}
        onClose={() => setShowVoiceLogger(false)}
        onMealSaved={() => {
          getMealLogs().then(logs => { if (Array.isArray(logs)) setWeekLogs(logs); }).catch(() => {});
        }}
      />
      <SmartGroceryPlanner isOpen={showGroceryPlanner} onClose={() => setShowGroceryPlanner(false)} />
      <FoodWrappedModal
        isOpen={showFoodWrapped}
        onClose={() => setShowFoodWrapped(false)}
        monthlyMealsCount={Math.max(weekLogs.length * 4, 28)}
        glucoseStabilityPercent={94}
        topSuperfood="Fluted Pumpkin (Ugu) & Ewedu"
        spikesPrevented={16}
        waterGlassesCount={Math.max(waterGlasses * 20, 185)}
      />
      <NotificationSettingsDialog isOpen={showNotificationSettings} onClose={() => setShowNotificationSettings(false)} />

      {/* Smart Contextual In-App Reminder */}
      <MascotNudge {...smartNudge} onClose={closeSmartNudge} />

      {/* Global Search */}
      <GlobalSearch isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} />

      {/* Camera Capture Component */}
      <CameraCapture
        isOpen={showCameraCapture}
        onClose={() => setShowCameraCapture(false)}
        onCapture={(imageData, source) => {
          setCapturedImage(imageData);
        }}
        mode="food"
        title="Analyse Food"
      />

      {/* Local Food Scanner */}
      <LocalFoodScanner
        isOpen={showLocalFoodScanner}
        onClose={() => setShowLocalFoodScanner(false)}
      />

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
                <Progress value={(proteinConsumed / proteinTarget) * 100} className="h-2" />
              </div>

              {/* Carbs */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-700">Carbohydrates</div>
                  <div className="text-sm font-semibold text-green-600">
                    {carbsConsumed}g / {carbsTarget}g
                  </div>
                </div>
                <Progress value={(carbsConsumed / carbsTarget) * 100} className="h-2" />
              </div>

              {/* Fats */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-700">Fats</div>
                  <div className="text-sm font-semibold text-purple-600">
                    {fatsConsumed}g / {fatsTarget}g
                  </div>
                </div>
                <Progress value={(fatsConsumed / fatsTarget) * 100} className="h-2" />
              </div>
            </div>

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
            {selectedQuickMeal && (
              <div className="space-y-3">
                {quickMealOptions[selectedQuickMeal].map((meal) => (
                  <button
                    key={meal.name}
                    onClick={() => handleQuickLog(meal)}
                    disabled={quickLogging}
                    className="w-full bg-white border-2 border-gray-100 hover:border-[#1f7a8c] rounded-2xl p-4 text-left transition-colors disabled:opacity-60 flex items-center gap-3 cursor-pointer shadow-xs"
                  >
                    <span className="text-3xl">{meal.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{meal.name}</div>
                      <div className="text-xs text-gray-500">~{meal.calories} kcal • {meal.label}</div>
                    </div>
                    <Plus className="h-5 w-5 text-[#1f7a8c] flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleCustomEntry}
              disabled={quickLogging}
              className="w-full bg-white border-2 border-dashed border-[#1f7a8c] rounded-2xl p-4 text-center hover:bg-[#E8F5F5] transition-colors disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2 text-[#1f7a8c] font-semibold">
                <Plus className="h-5 w-5" />
                Custom Entry
              </div>
            </button>

            <div className="flex gap-3 pt-2">
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
    </div>
  );
}