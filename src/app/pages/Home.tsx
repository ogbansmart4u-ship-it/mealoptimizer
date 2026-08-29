import React, { useState, useRef, useEffect } from "react";
import {
  Camera, Sparkles, TrendingUp, MapPin, Globe, AlertCircle, AlertTriangle, ChevronDown, ChevronUp, X,
  Activity, Clock, Flame, Calendar, Bell, BellRing, ChevronRight, Heart,
  Droplet, Droplets, Minus, Plus, Upload, Zap, Target, BarChart3, ScanBarcode, Shield, ShieldCheck, Moon, Search, FlaskConical, ChefHat, BookOpen, Stethoscope, Mic, ShoppingCart, Compass, FileText, CheckCircle2, Trophy, Pill, FileSpreadsheet
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
import CGMSensorVisualizer from "../components/CGMSensorVisualizer";
import QuickLogShelf, { QuickFoodItem } from "../components/QuickLogShelf";
import WaterTrackerFrame from "../components/WaterTrackerFrame";
import WaterReminderModal from "../components/WaterReminderModal";
import NextBestActionCard from "../components/NextBestActionCard";
import { useSmartNudges } from "../hooks/useSmartNudges";
import ModeToggle from "../components/ModeToggle";
import LocationSelector from "../components/LocationSelector";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import CameraCapture from "../components/CameraCapture";
import LocalFoodScanner from "../components/LocalFoodScanner";
import QuickActionsFAB from "../components/QuickActionsFAB";
import GlobalSearch from "../components/GlobalSearch";
import TutorialTooltip from "../components/TutorialTooltip";
import SmartVideoConcierge from "../components/SmartVideoConcierge";
import MedicalDisclaimerModal from "../components/MedicalDisclaimerModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import AppLogo from "../components/AppLogo";
import { initializeSampleData } from "../../utils/sampleData";
import { projectId } from '/utils/supabase/info';
import { getAccessToken } from '../../lib/supabase';
import { createMealLog, getMealLogs, getHydrationLogs, createHydrationLog, deleteHydrationLog } from "../../lib/api";
import { toast } from "sonner";
import { celebrate } from "../components/celebrate";
import { triggerHaptic } from "../utils/celebration";

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
      const isHealthDone = localStorage.getItem("hasCompletedHealthSetup") === "true";
      const isOnboardingDone = localStorage.getItem("onboardingComplete") === "true";
      const userProfileRaw = localStorage.getItem("user-profile") || localStorage.getItem("user_profile");
      let hasData = false;
      if (userProfileRaw) {
        try {
          const p = JSON.parse(userProfileRaw);
          if (p.age || p.medicalCondition || p.goal || p.weight || (p.conditions && p.conditions.length > 0)) hasData = true;
        } catch {}
      }
      return !isHealthDone && !isOnboardingDone && !hasData;
    } catch {
      return false;
    }
  });

  // If profile from UserContext is already calibrated, automatically suppress wizard
  useEffect(() => {
    if (profile?.medicalCondition || profile?.age || profile?.weight || (profile?.conditions && profile.conditions.length > 0)) {
      setShowHealthWizard(false);
      try {
        localStorage.setItem("hasCompletedHealthSetup", "true");
      } catch {}
    }
  }, [profile?.medicalCondition, profile?.age, profile?.weight, profile?.conditions]);
  const [showSpotlightTour, setShowSpotlightTour] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);
  const [showGroceryPlanner, setShowGroceryPlanner] = useState(false);
  const [activeHomeTab, setActiveHomeTab] = useState<"today" | "academy" | "clinical">("today");
  const [showFoodWrapped, setShowFoodWrapped] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAnalyseFoodOptions, setShowAnalyseFoodOptions] = useState(false);
  const [showLocalFoodOptions, setShowLocalFoodOptions] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showConciergeModal, setShowConciergeModal] = useState(false);

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
    disabled: showSpotlightTour || showHealthWizard || showWhatsAppModal || showVoiceLogger || showAnalyseFoodOptions,
    delayMs: 45000, // Wait 45 seconds after the user is settled on the home page before prompting
    onDrinkWater: () => handleWaterIncrease(),
    onLogMeal: () => navigate("/plan-meal"),
  });

  const [showWaterReminderModal, setShowWaterReminderModal] = useState(false);

  const handleWaterAddCustom = async (amountMl: number = 250) => {
    if (waterBusy) return;
    setWaterBusy(true);
    setWaterMl((ml) => ml + amountMl);
    try {
      const item = await createHydrationLog({
        amount_ml: amountMl,
        type: amountMl === 300 ? "zobo" : "water",
        logged_at: new Date().toISOString(),
      });
      if (item?.id) setHomeWaterIds((ids) => [...ids, String(item.id)]);
      const nextGlasses = Math.round((waterMl + amountMl) / GLASS_ML);
      if (nextGlasses >= waterGoal) {
        celebrate("Hydration Goal Achieved! 💧🎉", `${waterGoal} of ${waterGoal} glasses completed today!`, {
          confettiStyle: "cannons",
          hapticPattern: "milestone",
        });
      }
    } catch {
      setWaterMl((ml) => Math.max(0, ml - amountMl));
    } finally {
      setWaterBusy(false);
    }
  };

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
      <div className="bg-gradient-to-b from-[#A5DBDB] to-[#B8E5E5] px-4 sm:px-6 pt-9 pb-4 border-b border-teal-500/15">
        {/* Top Brand & Profile Avatar Bar (Option 2: Minimalist & Spacious) */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Top Left: Clean Brand Anchor */}
          <div className="flex items-center">
            <AppLogo size="sm" />
          </div>

          {/* Top Right: Prominent Profile Avatar Only */}
          <div className="flex items-center">
            <ProfilePictureUpload />
          </div>
        </div>

        {/* Hero Greeting & Privacy-Protected Status Bar */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-3">
            <Mascot gesture="wave" size={48} className="shrink-0 drop-shadow-sm" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
                {getTimeBasedGreeting()}, {userName || "Friend"}
              </h2>
              {/* Privacy-Preserved Subtitle: Date & Quick Chips (No Medical Condition) */}
              <div className="flex items-center gap-1.5 flex-wrap mt-1 text-xs font-semibold">
                <span className="text-[11px] text-gray-600 font-medium">{currentDate}</span>
                <span>•</span>
                {/* Interactive Streak Chip */}
                <button
                  onClick={() => navigate("/achievements")}
                  className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 bg-orange-100/90 hover:bg-orange-200 text-orange-900 rounded-full border border-orange-300/60 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  title="View streaks and achievements"
                >
                  <Flame className="h-3 w-3 text-orange-500 fill-orange-500 animate-pulse" />
                  <span>{trackingStreak}d Streak</span>
                </button>

                {/* Quick Search */}
                <button
                  onClick={() => setShowGlobalSearch(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-white/70 hover:bg-white text-gray-700 rounded-full border border-teal-600/15 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  title="Search meals, recipes, and guides"
                >
                  <Search className="h-3 w-3 text-teal-700" />
                  <span>Search</span>
                </button>

                {/* Quick Alerts */}
                <button
                  onClick={() => setShowNotificationSettings(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-white/70 hover:bg-white text-gray-700 rounded-full border border-teal-600/15 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  title="Notification & WhatsApp settings"
                >
                  <Bell className="h-3 w-3 text-teal-700" />
                  <span>Alerts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Tabbed Architecture */}
      {/* Main Content Area with Tabbed Architecture */}
      <div className="px-3.5 sm:px-6 mt-2 max-w-2xl mx-auto w-full min-w-0">
        {/* Segmented Tab Navigation Control */}
        <div className="sticky top-3 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-teal-100/90 dark:border-zinc-800 flex gap-1 mb-4 sm:mb-5 transition-all">
          <button
            onClick={() => setActiveHomeTab("today")}
            className={`flex-1 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate ${
              activeHomeTab === "today"
                ? "bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
          >
            <Sparkles size={14} className="shrink-0" />
            <span className="truncate">Today</span>
          </button>

          <button
            onClick={() => setActiveHomeTab("academy")}
            className={`flex-1 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate ${
              activeHomeTab === "academy"
                ? "bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
          >
            <BookOpen size={14} className="shrink-0" />
            <span className="truncate">Academy</span>
          </button>

          <button
            onClick={() => setActiveHomeTab("clinical")}
            className={`flex-1 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer truncate ${
              activeHomeTab === "clinical"
                ? "bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-100/60"
            }`}
          >
            <Stethoscope size={14} className="shrink-0" />
            <span className="truncate">Clinical</span>
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
            className="space-y-4"
          >
            {/* 🎯 Intelligent Time-Based Next Best Action Card */}
            <NextBestActionCard
              mealsCount={todayLogs.length}
              waterGlasses={waterGlasses}
              onOpenScanner={() => setShowLocalFoodScanner(true)}
              onOpenWater={() => setShowWaterReminderModal(true)}
              onOpenQuickLog={() => {
                const el = document.getElementById("tour-quick-shelf");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* 👩🏾‍💼 Sarah The Nutrition Assistant Card */}
            <div
              onClick={() => {
                triggerHaptic("medium");
                setShowConciergeModal(true);
              }}
              className="bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-teal-200/40 relative overflow-hidden flex items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all group"
            >
              <div className="relative z-10 flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 border-2 border-amber-300 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  👩🏾‍💼
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full shadow-2xs">
                      Nutrition Assistant
                    </span>
                    <span className="text-[10px] text-teal-200 font-bold hidden sm:inline">24/7 Food & Health Guide</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5 truncate">
                    Welcome to MealOptimiza!
                  </h3>
                  <p className="text-[11px] sm:text-xs text-teal-100 line-clamp-1 mt-0.5 font-medium">
                    "I am Sarah, your Nutrition Assistant. Tap to start."
                  </p>
                </div>
              </div>

              <div className="relative z-10 bg-white group-hover:bg-teal-50 text-[#1f7a8c] font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-sm shrink-0 flex items-center gap-1.5 transition-colors">
                <span>▶️ Talk</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* ============================================================ */}
            {/* 1. TOP HERO: AI FOOD CAMERA & COMPACT FUEL GAUGE POWER DECK  */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 📸 Card A: Instant AI Camera & Food Scanner (Top Priority) */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("medium");
                  setShowLocalFoodScanner(true);
                }}
                className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-3xl p-4 sm:p-5 text-white text-left shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[160px] border-2 border-teal-300/40 group"
              >
                {/* Glowing Laser Scan Sweep Line */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_#fff] pointer-events-none animate-laser-sweep opacity-90" />
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

                {/* Top Row: Camera Lens with Radar Ring */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="relative">
                    <span className="absolute -inset-1 rounded-2xl bg-white/30 animate-pulse-radar pointer-events-none" />
                    <div className="relative bg-white/25 backdrop-blur-xs rounded-2xl p-2.5 w-fit group-hover:rotate-6 transition-transform shadow-xs">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <span className="text-[9.5px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-teal-50 border border-white/20 shadow-2xs">
                    AI VISION CORE ⚡
                  </span>
                </div>

                {/* Bottom Text & 1-Tap Trigger */}
                <div className="relative z-10 mt-3">
                  <span className="text-base font-black block leading-tight tracking-tight text-white">
                    {t('home.snapKnow')} 📸
                  </span>
                  <span className="text-[11px] text-teal-50/90 font-semibold block mt-0.5">
                    Snap any African or diaspora meal
                  </span>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-white text-teal-900 rounded-xl text-xs font-black shadow-sm group-hover:bg-teal-50 transition-colors">
                    <span>Open Camera</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>

              {/* ⚡ Card B: Compact Daily Fuel Gauge & Macro Pill Deck */}
              <div className="bg-gradient-to-br from-white via-[#F4FBFA] to-[#E2F4F3] rounded-3xl shadow-lg border border-teal-100/90 p-4 sm:p-5 flex flex-col justify-between min-h-[160px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#1f7a8c]">
                    {t('home.todaysCalories')}
                  </span>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-teal-100/90 text-teal-900 shadow-2xs">
                    {caloriesConsumed} / {caloriesTarget} kcal
                  </span>
                </div>

                {/* Compact Clickable Arc Gauge */}
                <button
                  type="button"
                  onClick={() => setShowGaugeDetails(true)}
                  className="w-full flex items-center justify-center my-1 hover:scale-[1.02] active:scale-[0.99] transition-transform cursor-pointer focus:outline-none"
                  title="Tap for detailed calorie & macro breakdown"
                >
                  <div className="relative flex flex-col items-center justify-center">
                    <svg className="w-36 h-20" viewBox="0 0 200 115">
                      <path
                        d="M 30 95 A 70 70 0 0 1 170 95"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="18"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 30 95 A 70 70 0 0 1 170 95"
                        fill="none"
                        stroke="url(#compactGaugeGradient)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeDasharray={`${animatedProgress * 2.2} 1000`}
                        style={{
                          transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                      <defs>
                        <linearGradient id="compactGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1f7a8c" />
                          <stop offset="100%" stopColor="#4ecdc4" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute top-5 flex flex-col items-center">
                      <div className="text-[#1f7a8c] text-xl font-black leading-none">
                        {animatedPercentage}%
                      </div>
                      <div className="text-[9px] text-gray-500 uppercase font-bold mt-0.5">
                        {t('home.ofDailyGoal')}
                      </div>
                      <span className="text-[9px] text-teal-700 font-bold mt-0.5 bg-teal-50 px-1.5 py-0.2 rounded-full">
                        Details 📊
                      </span>
                    </div>
                  </div>
                </button>

                {/* Micro Macro Pill Row */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-white rounded-xl py-1 px-1 shadow-2xs border border-teal-50">
                    <span className="text-[9px] text-gray-500 font-bold block">Protein</span>
                    <span className="text-[11px] font-black text-blue-700">{proteinConsumed}g</span>
                  </div>
                  <div className="bg-white rounded-xl py-1 px-1 shadow-2xs border border-teal-50">
                    <span className="text-[9px] text-gray-500 font-bold block">Carbs</span>
                    <span className="text-[11px] font-black text-emerald-700">{carbsConsumed}g</span>
                  </div>
                  <div className="bg-white rounded-xl py-1 px-1 shadow-2xs border border-teal-50">
                    <span className="text-[9px] text-gray-500 font-bold block">Fats</span>
                    <span className="text-[11px] font-black text-purple-700">{fatsConsumed}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🔥 LIVE AVO CHALLENGE & GAMIFIED HEALTH HUB (UNIFIED 3-BUTTON FRAME) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 rounded-3xl p-4 sm:p-5 text-white shadow-xl border-2 border-amber-300/40">
              {/* Dynamic Ambient Laser Sweep & Particle Light */}
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_#fff] pointer-events-none animate-laser-sweep opacity-85" />
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-yellow-300/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-red-700/30 blur-2xl pointer-events-none" />

              {/* Top Row: Animated Mascot Avo in Challenge Jumping/Cheering Pose + Live Indicator */}
              <div className="flex items-center justify-between gap-3 relative z-10 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <span className="absolute -inset-1 rounded-2xl bg-yellow-300/40 animate-pulse-radar pointer-events-none" />
                    <div className="relative p-1 bg-white/20 backdrop-blur-md rounded-2xl border border-yellow-200/50 shadow-md">
                      <Mascot gesture="jump" size={56} className="filter drop-shadow-md" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-300 text-slate-950 text-[9.5px] font-black uppercase tracking-wider shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0" />
                        LIVE CHALLENGE
                      </span>
                      <span className="text-[10px] text-yellow-100 font-bold bg-white/15 px-2 py-0.5 rounded-full">
                        🔥 1,420 Warriors Active
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-1 truncate">
                      Avo 21-Day Blood Sugar Reset
                    </h3>
                    <p className="text-[11px] text-yellow-100 font-medium line-clamp-1">
                      Day 8 Active: Swallow Revolution • <strong className="text-yellow-200">+140 XP Today</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Challenge XP Micro Progress Bar */}
              <div className="relative z-10 mb-3.5 bg-black/25 backdrop-blur-xs rounded-2xl p-2 border border-white/20">
                <div className="flex items-center justify-between text-[10px] font-bold text-yellow-100 mb-1">
                  <span>Day 8 Challenge • Level 2 Pioneer</span>
                  <span>4,850 / 6,000 XP</span>
                </div>
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-yellow-300 via-amber-300 to-white rounded-full w-[78%] animate-pulse" />
                </div>
              </div>

              {/* 3 Unified Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 relative z-10">
                {/* Button 1: Join / Active Challenge */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    navigate("/challenge");
                  }}
                  className="py-2.5 px-3 bg-white hover:bg-yellow-50 active:scale-95 text-slate-950 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                >
                  <span className="text-base leading-none group-hover/btn:scale-125 transition-transform">🔥</span>
                  <span className="truncate">Join Challenge</span>
                  <ChevronRight size={13} className="text-orange-600 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>

                {/* Button 2: Food Wrapped */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    setShowFoodWrapped(true);
                  }}
                  className="py-2.5 px-3 bg-black/30 hover:bg-black/45 active:scale-95 text-white border border-white/25 rounded-2xl font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                >
                  <span className="text-base leading-none group-hover/btn:scale-125 transition-transform">🥑</span>
                  <span className="truncate">Food Wrapped 📊</span>
                </button>

                {/* Button 3: Leaderboards */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    navigate("/challenge");
                  }}
                  className="py-2.5 px-3 bg-black/30 hover:bg-black/45 active:scale-95 text-white border border-white/25 rounded-2xl font-black text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                >
                  <span className="text-base leading-none group-hover/btn:scale-125 transition-transform">🏆</span>
                  <span className="truncate">Leaderboards 🌍</span>
                </button>
              </div>
            </div>

            {/* 1-Tap Quick-Log Shelf with Voice AI */}
            <div id="tour-quick-shelf" className="my-1">
              <QuickLogShelf
                onLogItem={handleQuickLogItem}
                onOpenVoice={() => setShowVoiceLogger(true)}
                onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                onOpenScanner={() => setShowLocalFoodScanner(true)}
                onOpenCustom={() => navigate("/logs", { state: { openAdd: true } })}
                isLogging={quickLogging}
              />
            </div>

            {/* 10X Prominent Water & Cellular Flush Station Frame */}
            <div className="my-2">
              <WaterTrackerFrame
                currentGlasses={waterGlasses}
                targetGlasses={8}
                onAddGlass={handleWaterAddCustom}
                onRemoveGlass={handleWaterDecrease}
                onOpenDetails={() => navigate("/hydration")}
                onOpenReminderModal={() => setShowWaterReminderModal(true)}
              />
            </div>

            {/* Daily Metabolic Habit Scorecard */}
            <MetabolicChecklist
              waterCount={waterGlasses}
              mealsLoggedCount={todayLogs.length}
              vitalsLoggedCount={0}
              onOpenWater={() => setShowWaterReminderModal(true)}
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

            {/* Daily Fruit & Vegetable Power Boost Banner */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-emerald-400/20 relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="text-3xl p-2 bg-white/10 rounded-2xl shrink-0 backdrop-blur-xs">
                    🍏🥬
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[9.5px] font-black uppercase tracking-wider mb-1">
                      <Sparkles size={10} />
                      <span>Metabolic Super-Produce</span>
                    </div>
                    <h3 className="text-sm font-black text-white leading-tight">
                      African Fruits &amp; Healing Greens Guide
                    </h3>
                    <p className="text-[11px] text-emerald-100/90 mt-0.5 leading-snug">
                      Discover Garden Egg, Ugu, Agbalumo, Soursop &amp; Ube with precise glycemic scores.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/recipe")}
                  className="px-3.5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  Explore 12+ 🥗
                </button>
              </div>
            </div>

            {/* Smart Grocery & Bio-Plan Quick Actions */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Smart Market & Personalized Bio-Plans</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. Smart Grocery List with Rolling Cart Pulse */}
                <button
                  onClick={() => navigate("/grocery-list")}
                  className="bg-white rounded-3xl p-4 text-left shadow-md hover:shadow-xl border-2 border-teal-100 hover:border-teal-400 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col justify-between h-36 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-2.5 w-fit text-xl group-hover:translate-x-1 transition-transform">
                      🛒
                    </div>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                      MARKET
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-gray-900 block leading-tight group-hover:text-teal-700 transition-colors">
                      {t('grocery.title')}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium block mt-0.5">
                      Market price sync & swaps
                    </span>
                  </div>
                </button>

                {/* 2. My 7-Day Meal Plan with Shifting Animated Gradient Background */}
                <button
                  onClick={() => navigate("/hyper-personalized-plan")}
                  className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 animate-gradient-shift rounded-3xl p-4 text-white text-left shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col justify-between h-36 border border-purple-400/30 group"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="bg-white/20 backdrop-blur-xs rounded-2xl p-2.5 w-fit group-hover:scale-110 transition-transform">
                      <ChefHat className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-purple-100">
                      7-DAY PLAN
                    </span>
                  </div>
                  <div className="relative z-10">
                    <span className="text-xs font-black block leading-tight">
                      My 7-Day Meal Plan
                    </span>
                    <span className="text-[10px] text-purple-100/90 font-medium block mt-0.5">
                      Tailored weekly recipes
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
            className="w-full min-w-0 space-y-4 sm:space-y-5 overflow-hidden"
          >
            {/* 1. Active Conditions Safeguards Card */}
            <div className="w-full min-w-0 bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 shadow-lg border border-teal-100 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-[#1f7a8c] dark:text-teal-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-zinc-100 leading-tight truncate">
                      Active Condition Intelligence
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">Real-time dietary guards for your health</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/medical-condition")}
                  className="text-xs font-bold text-[#1f7a8c] dark:text-teal-400 hover:underline shrink-0 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Condition Chips */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3.5">
                {activeConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-[#1f7a8c] dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shrink-0"
                  >
                    <Activity size={12} className="shrink-0" />
                    <span className="truncate max-w-[200px]">{cond}</span>
                  </span>
                ))}
              </div>

              {/* Safeguards Bullet List */}
              <div className="space-y-2 p-3 sm:p-3.5 rounded-2xl bg-gray-50/80 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 text-[11px] sm:text-xs">
                <div className="flex items-start gap-2 text-gray-700 dark:text-zinc-300">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span className="break-words"><strong>Glycemic Spike Shield:</strong> Real-time meal analysis flags high-GI cassava/white rice spikes.</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700 dark:text-zinc-300">
                  <span className="text-teal-500 font-bold shrink-0">✓</span>
                  <span className="break-words"><strong>Sodium &amp; Palm Oil Check:</strong> Monitors stock cubes and saturated palm oil ratios for blood pressure.</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700 dark:text-zinc-300">
                  <span className="text-blue-500 font-bold shrink-0">✓</span>
                  <span className="break-words"><strong>Tissue Recovery:</strong> Ensures daily protein target (100g) for maternal / surgical recovery.</span>
                </div>
              </div>
            </div>

            {/* 2. Continuous Glucose Monitor (CGM) 24-Hr Sensor Stream */}
            <CGMSensorVisualizer />

            {/* 3. Biometric Vitals Quick-Snapshot (3 Cards Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Glucose & Projected eA1c */}
              <button
                onClick={() => navigate("/glucose-insights")}
                className="w-full min-w-0 bg-white dark:bg-zinc-900 rounded-3xl p-3.5 sm:p-4 shadow-md border border-rose-100 dark:border-zinc-800 hover:shadow-lg transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-rose-600 truncate">Blood Glucose &amp; eA1c</span>
                  <Droplet className="h-4 w-4 text-rose-500 shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-zinc-100">
                  118 <span className="text-xs font-normal text-gray-500">mg/dL</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 truncate">
                  Projected eA1c: <strong className="text-rose-700 dark:text-rose-400 font-bold">5.7%</strong> (Optimal)
                </p>
                <span className="mt-2 text-[10px] font-bold text-[#1f7a8c] dark:text-teal-400 block">
                  View Insights →
                </span>
              </button>

              {/* Blood Pressure */}
              <button
                onClick={() => navigate("/biometrics")}
                className="w-full min-w-0 bg-white dark:bg-zinc-900 rounded-3xl p-3.5 sm:p-4 shadow-md border border-purple-100 dark:border-zinc-800 hover:shadow-lg transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-purple-600 truncate">Blood Pressure</span>
                  <Activity className="h-4 w-4 text-purple-500 shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-zinc-100">
                  118/78 <span className="text-xs font-normal text-gray-500">mmHg</span>
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 truncate">
                  Normal Range (AHA Standard)
                </p>
                <span className="mt-2 text-[10px] font-bold text-[#1f7a8c] dark:text-teal-400 block">
                  Log Vitals →
                </span>
              </button>

              {/* Weight & BMI */}
              <button
                onClick={() => navigate("/weight")}
                className="w-full min-w-0 bg-white dark:bg-zinc-900 rounded-3xl p-3.5 sm:p-4 shadow-md border border-teal-100 dark:border-zinc-800 hover:shadow-lg transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-teal-600 truncate">Weight &amp; BMI</span>
                  <TrendingUp className="h-4 w-4 text-teal-500 shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-zinc-100">
                  {profile?.weight ? `${profile.weight} kg` : "72.4 kg"}
                </div>
                <p className="text-[10px] text-gray-500 mt-1 truncate">
                  BMI: <strong>23.4</strong> (Healthy)
                </p>
                <span className="mt-2 text-[10px] font-bold text-[#1f7a8c] dark:text-teal-400 block">
                  Track Weight →
                </span>
              </button>
            </div>

            {/* 3. 1-Tap Clinical Doctor PDF Export Banner */}
            <div className="w-full min-w-0 bg-gradient-to-br from-[#1f7a8c] to-[#0e4d5c] rounded-3xl p-4 sm:p-5 text-white shadow-xl overflow-hidden">
              <div className="flex items-start justify-between gap-2.5 mb-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm shrink-0">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-400 text-teal-950 font-extrabold text-[10px] shrink-0">
                  Clinical Ready
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold leading-snug mb-1">
                Doctor &amp; Dietitian 30-Day Clinical Report
              </h3>
              <p className="text-[11px] sm:text-xs text-teal-50/90 leading-relaxed mb-4 break-words">
                Export your glycemic logs, blood pressure trends, estimated A1c, and dietary compliance into a certified 1-page PDF summary for your physician.
              </p>
              <button
                onClick={() => navigate("/health-report")}
                className="w-full py-3 bg-white text-[#1f7a8c] hover:bg-teal-50 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={15} />
                <span>Open Clinical Doctor Report</span>
              </button>
            </div>

            {/* 4. Medical Vault & Medication Quick Actions */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                onClick={() => navigate("/medical-vault")}
                className="w-full min-w-0 bg-white dark:bg-zinc-900 rounded-3xl p-3 sm:p-4 border border-teal-100 dark:border-zinc-800 shadow-md text-left hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 w-fit mb-2">
                  <Shield size={18} />
                </div>
                <span className="text-xs font-extrabold text-gray-900 dark:text-zinc-100 block truncate">Medical Vault</span>
                <span className="text-[9.5px] sm:text-[10px] text-gray-500 block mt-0.5 truncate">Lab results &amp; files</span>
              </button>

              <button
                onClick={() => navigate("/medication-tracker")}
                className="w-full min-w-0 bg-white dark:bg-zinc-900 rounded-3xl p-3 sm:p-4 border border-teal-100 dark:border-zinc-800 shadow-md text-left hover:shadow-lg transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 w-fit mb-2">
                  <Pill size={18} />
                </div>
                <span className="text-xs font-extrabold text-gray-900 dark:text-zinc-100 block truncate">Med Tracker</span>
                <span className="text-[9.5px] sm:text-[10px] text-gray-500 block mt-0.5 truncate">Dose adherence</span>
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

      {/* 10x Better Compact In-Frame Nutrition Breakdown Dialog */}
      <Dialog open={showGaugeDetails} onOpenChange={setShowGaugeDetails}>
        <DialogContent className="max-w-md max-h-[85vh] p-5 sm:p-6 flex flex-col rounded-3xl">
          <DialogHeader className="pb-1 text-left">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-[#1f7a8c] rounded-xl shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-gray-900">
                  Nutrition Breakdown
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Live daily macronutrient &amp; metabolic energy tracking
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain space-y-3.5 py-2 pr-1">
            {/* Status Alert Banner */}
            <div className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs ${getGaugeStatus().bgColor}`}>
              <Zap className={`h-4 w-4 shrink-0 ${getGaugeStatus().textColor}`} />
              <div className="min-w-0">
                <span className={`font-bold block ${getGaugeStatus().textColor}`}>
                  {getGaugeStatus().status}
                </span>
                <span className="text-[11px] text-gray-600 leading-tight block">
                  {getGaugeStatus().message}
                </span>
              </div>
            </div>

            {/* Compact Calorie Progress Card */}
            <div className="bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-amber-50/60 rounded-2xl p-3.5 border border-teal-100">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-gray-800">Calories</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#1f7a8c]">{caloriesConsumed}</span>
                  <span className="text-xs text-gray-500 font-medium"> / {caloriesTarget} kcal</span>
                </div>
              </div>
              <Progress value={Math.min(100, (caloriesConsumed / caloriesTarget) * 100)} className="h-2 rounded-full" />
              <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-500 font-semibold">
                <span>{animatedPercentage}% completed</span>
                <span>{Math.max(0, caloriesTarget - caloriesConsumed)} kcal remaining</span>
              </div>
            </div>

            {/* 3-Column Macro Grid Matrix */}
            <div>
              <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider block mb-2">
                Macronutrient Pillars
              </span>
              <div className="grid grid-cols-3 gap-2">
                {/* Protein */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 block">Protein</span>
                    <span className="text-sm font-black text-slate-900">{proteinConsumed}g</span>
                    <span className="text-[10px] text-slate-400 block font-medium">/ {proteinTarget}g</span>
                  </div>
                  <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (proteinConsumed / proteinTarget) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbs */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 block">Carbs</span>
                    <span className="text-sm font-black text-slate-900">{carbsConsumed}g</span>
                    <span className="text-[10px] text-slate-400 block font-medium">/ {carbsTarget}g</span>
                  </div>
                  <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (carbsConsumed / carbsTarget) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fats */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 block">Fats</span>
                    <span className="text-sm font-black text-slate-900">{fatsConsumed}g</span>
                    <span className="text-[10px] text-slate-400 block font-medium">/ {fatsTarget}g</span>
                  </div>
                  <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (fatsConsumed / fatsTarget) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Clinical Glycemic Context Tip */}
            <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-2xl text-[11px] text-teal-900 flex items-start gap-2">
              <span className="text-sm">💡</span>
              <span className="leading-snug">
                <strong>Metabolic Tip:</strong> Pairing protein (eggs, fish, beans) with cultural carbohydrates delays gastric emptying and flattens post-meal glucose spikes by up to 35%.
              </span>
            </div>
          </div>

          {/* Sticky In-Frame Action Footer */}
          <div className="pt-3 border-t border-gray-100 flex gap-2.5 mt-auto shrink-0">
            <Button
              onClick={() => setShowGaugeDetails(false)}
              variant="outline"
              className="flex-1 rounded-xl text-xs font-bold py-2.5"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowGaugeDetails(false);
                navigate("/logs");
              }}
              className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-xl text-xs font-bold py-2.5"
            >
              View Full Log 📝
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Meal Log Dialog */}
      <Dialog open={showQuickMealLog} onOpenChange={setShowQuickMealLog}>
        <DialogContent className="max-w-md max-h-[85vh] p-5 sm:p-6 flex flex-col rounded-3xl">
          <DialogHeader className="pb-1 text-left">
            <DialogTitle className="text-lg font-black text-[#1f7a8c] flex items-center gap-2">
              <span>🍽️</span>
              <span>Log {selectedQuickMeal && selectedQuickMeal.charAt(0).toUpperCase() + selectedQuickMeal.slice(1)}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Quick log your meal with common cultural options
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain space-y-2.5 py-2 pr-1">
            {selectedQuickMeal && (
              <div className="space-y-2">
                {quickMealOptions[selectedQuickMeal].map((meal) => (
                  <button
                    key={meal.name}
                    onClick={() => handleQuickLog(meal)}
                    disabled={quickLogging}
                    className="w-full bg-slate-50 hover:bg-teal-50/50 border border-slate-200/80 hover:border-[#1f7a8c] rounded-2xl p-3 text-left transition-all disabled:opacity-60 flex items-center gap-3 cursor-pointer shadow-2xs active:scale-[0.99]"
                  >
                    <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-2xs">{meal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-gray-900 truncate">{meal.name}</div>
                      <div className="text-[10px] text-gray-500 font-medium">~{meal.calories} kcal • {meal.label}</div>
                    </div>
                    <Plus className="h-4 w-4 text-[#1f7a8c] shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleCustomEntry}
              disabled={quickLogging}
              className="w-full bg-white border border-dashed border-[#1f7a8c]/40 hover:border-[#1f7a8c] rounded-2xl p-2.5 text-center hover:bg-[#E8F5F5] transition-colors disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1.5 text-[#1f7a8c] font-bold text-xs">
                <Plus className="h-4 w-4" />
                Custom Entry
              </div>
            </button>
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-gray-100 mt-auto shrink-0">
            <Button
              onClick={() => setShowQuickMealLog(false)}
              variant="outline"
              className="flex-1 rounded-xl text-xs font-bold py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowQuickMealLog(false);
                navigate("/logs");
              }}
              className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-xl text-xs font-bold py-2"
            >
              Full Logs 📋
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Smart Video Concierge Patient Guide */}
      <SmartVideoConcierge
        isOpen={showConciergeModal}
        onClose={() => setShowConciergeModal(false)}
        onOpenScanner={() => setShowCameraCapture(true)}
        onOpenWhatsApp={() => setShowWhatsAppModal(true)}
        onOpenHealthSetup={() => setShowHealthWizard(true)}
      />

      {/* Monthly Food Wrapped Story Modal */}
      <FoodWrappedModal
        isOpen={showFoodWrapped}
        onClose={() => setShowFoodWrapped(false)}
      />

      {/* 10X Water & Cellular Hydration Reminder Modal with Avo Drinking Water Mascot */}
      <WaterReminderModal
        isOpen={showWaterReminderModal}
        onClose={() => setShowWaterReminderModal(false)}
        currentGlasses={waterGlasses}
        targetGlasses={8}
        onAddGlass={handleWaterAddCustom}
      />

      {/* Clinical Governance & Medical Regulatory Disclaimer Modal */}
      <MedicalDisclaimerModal />
    </div>
  );
}