import TriRingMetabolicFlower from "../components/TriRingMetabolicFlower";
import { calculateDailyRings } from "../utils/dailyRingsCalculator";
import AfricanPlateSilhouette from "../components/AfricanPlateSilhouette";
import AvoAcademyBloom from "../components/AvoAcademyBloom";
import CircadianEnergyWave from "../components/CircadianEnergyWave";
import GlassmorphicWaterTumbler from "../components/GlassmorphicWaterTumbler";
import { useHydrationSync, GLASS_ML, DEFAULT_GOAL_GLASSES } from "../services/hydrationSync";
import MetabolicScoreRing from "../components/MetabolicScoreRing";
import { soundEffects } from "../utils/soundEffects";
import React, { useState, useRef, useEffect } from "react";
import {
  Camera, Sparkles, RotateCcw, TrendingUp, Utensils, MapPin, Globe, AlertCircle, AlertTriangle, ChevronDown, ChevronUp, X,
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
import MicronutrientShieldCard from "../components/MicronutrientShieldCard";
import WearableSyncModal from "../components/WearableSyncModal";
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
import FixMyPlateModal from "../components/FixMyPlateModal";
import FamilyHealthCircleModal from "../components/FamilyHealthCircleModal";

const GlycemicSimulatorModal = React.lazy(() =>
  import("../components/GlycemicSimulatorModal").then((m) => ({ default: m.GlycemicSimulatorModal }))
);
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
      const isDisclaimerAccepted = localStorage.getItem("mealoptimiza_medical_disclaimer_accepted") === "true";
      const isQuestionnaireDone =
        localStorage.getItem("mealoptimiza_questionnaire_completed") === "true" ||
        localStorage.getItem("onboardingComplete") === "true";
      // Disclaimer shows first; if already accepted previously, show questionnaire directly if incomplete
      return isDisclaimerAccepted && !isQuestionnaireDone;
    } catch {
      return false;
    }
  });
  const [showSpotlightTour, setShowSpotlightTour] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);
  const [showSwallowSwapModal, setShowSwallowSwapModal] = useState(false);
  const [showGroceryPlanner, setShowGroceryPlanner] = useState(false);
  const [activeHomeTab, setActiveHomeTab] = useState<"today" | "academy" | "clinical">("today");
  const [academyCategory, setAcademyCategory] = useState<"daily" | "masterclasses">("daily");
  const [showFoodWrapped, setShowFoodWrapped] = useState(false);
  const [showWearableSyncModal, setShowWearableSyncModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showAnalyseFoodOptions, setShowAnalyseFoodOptions] = useState(false);
  const [showLocalFoodOptions, setShowLocalFoodOptions] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showConciergeModal, setShowConciergeModal] = useState(false);
  const [showFamilyCircleModal, setShowFamilyCircleModal] = useState(false);
  const [showFixPlateModal, setShowFixPlateModal] = useState(false);
  const [fixPlateMeal, setFixPlateMeal] = useState<{
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  }>({
    foodName: "Pounded Yam & Egusi Soup",
    calories: 780,
    protein: 24,
    carbs: 96,
    fats: 32,
    fiber: 3,
  });

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
  
  // Dynamic Caloric & Macro Targets based on User Health Profile & Weight Goals
  const userConditionOrGoal = (profile?.medicalCondition || localStorage.getItem("userGoal") || localStorage.getItem("userPrimaryGoal") || "").toLowerCase();
  const currentW = parseFloat(profile?.weight || localStorage.getItem("userWeight") || "74") || 74;
  const targetW = parseFloat(profile?.targetWeight || localStorage.getItem("targetWeight") || "68") || 68;
  const isWeightGainGoal = userConditionOrGoal.includes("gain") || userConditionOrGoal.includes("muscle") || targetW > currentW;
  const isWeightLossGoal = userConditionOrGoal.includes("lose") || userConditionOrGoal.includes("belly fat") || targetW < currentW;

  const caloriesTarget = isWeightGainGoal ? 2450 : isWeightLossGoal ? 1800 : 2000;
  const caloriesRemaining = Math.max(0, caloriesTarget - caloriesConsumed);
  const proteinConsumed = sumField("protein");
  const proteinTarget = isWeightGainGoal ? 130 : isWeightLossGoal ? 110 : 100;
  const carbsConsumed = sumField("carbs");
  const carbsTarget = isWeightGainGoal ? 240 : isWeightLossGoal ? 140 : 150;
  const fatsConsumed = sumField("fats");
  const fatsTarget = isWeightGainGoal ? 85 : isWeightLossGoal ? 55 : 67;

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

  // Synchronized Global Hydration Engine (Unified across Home, Avo Popups, Modals)
  const {
    totalMl: waterMl,
    glasses: waterGlasses,
    goalGlasses: waterGoal,
    addGlass: handleWaterAddCustom,
    removeGlass: handleWaterDecrease,
    refresh: refreshWater,
  } = useHydrationSync();
  const [isDrinkingWater, setIsDrinkingWater] = useState(false);

  // Dynamic 10x Daily Health Rings Calculation (Clinical & Cultural Nutrition Progress)
  const dailyRings = calculateDailyRings({
    todayLogs,
    waterGlasses,
    waterGoal: waterGoal || 8,
    caloriesTarget,
  });
  // 🎛️ Dynamic Dashboard Preferences (Configurable in Profile)
  const [dashboardPrefs, setDashboardPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("mealoptimiza_dashboard_prefs");
      return saved
        ? JSON.parse(saved)
        : {
            showEnergy: true,
            showActions: true,
            showTip: true,
            showMeals: true,
            showChallenge: true,
            showWeekly: true,
            showCGM: false,
            showMicro: false,
            showFamily: false,
          };
    } catch {
      return {
        showEnergy: true,
        showActions: true,
        showTip: true,
        showMeals: true,
        showChallenge: true,
        showWeekly: true,
        showCGM: false,
        showMicro: false,
        showFamily: false,
      };
    }
  });

  const isUserPro = Boolean(profile?.isPro || profile?.plan === "pro" || profile?.plan === "premium");
  const [showProLockModal, setShowProLockModal] = useState(false);
  const [lockedProFeature, setLockedProFeature] = useState("");

  const handleOpenProLock = (featureName: string) => {
    triggerHaptic("warning");
    setLockedProFeature(featureName);
    setShowProLockModal(true);
  };
  const [showClinicalAccordion, setShowClinicalAccordion] = useState(false);
  // Water sync is automatically handled live by useHydrationSync and event bus

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
    setIsDrinkingWater(true);
    setTimeout(() => setIsDrinkingWater(false), 2400);
    await handleWaterAddCustom(GLASS_ML, "water", "Pure Water Glass");
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

  const handleQuickLogClick = () => {
    triggerHaptic("medium");
    try { soundEffects.playTactileTick(); } catch {}
    const hr = new Date().getHours();
    const currentMeal: "breakfast" | "lunch" | "dinner" =
      hr >= 5 && hr < 11 ? "breakfast" : hr >= 11 && hr < 16 ? "lunch" : "dinner";
    setSelectedQuickMeal(currentMeal);
    setShowQuickMealLog(true);

    const el = document.getElementById("tour-quick-shelf") || document.getElementById("today-quick-shelf");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    <div className="min-h-screen bg-canvas-organic dark:bg-[#0F1412] pb-32 relative overflow-hidden">
      {/* 🌿 Gentle Ambient Light Accents for Natural Depth */}
      <div className="absolute top-0 -left-20 w-96 h-96 rounded-full bg-emerald-600/5 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-48 -right-20 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-[800px] left-1/4 w-80 h-80 rounded-full bg-emerald-600/5 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#171E1B]/80 backdrop-blur-xl px-4 sm:px-6 pt-9 pb-4 border-b border-stone-200/60 dark:border-stone-800/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative z-20">
        {/* Top Brand & Profile Avatar Bar */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          {/* Top Left: Clean Brand Anchor */}
          <div className="flex items-center">
            <AppLogo size="sm" />
          </div>

          {/* Top Right: Ask Sarah & Avatar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setShowConciergeModal(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#164E3D] hover:bg-[#113E30] text-white rounded-full shadow-xs transition-all cursor-pointer border border-[#164E3D]/30"
            >
              <span>Ask Sarah</span>
            </button>
            <ProfilePictureUpload />
          </div>
        </div>

        {/* Hero Greeting & Privacy-Protected Status Bar */}
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-3">
            <Mascot gesture="wave" size={48} className="shrink-0 drop-shadow-xs" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                {getTimeBasedGreeting()}, {userName || "Friend"}
              </h2>
              {/* Privacy-Preserved Subtitle: Date & Quick Chips */}
              <div className="flex items-center gap-2 flex-wrap mt-1 text-xs">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium whitespace-nowrap">{currentDate}</span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                
                {/* Interactive Streak Chip */}
                <button
                  onClick={() => navigate("/achievements")}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800/60 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  title="View streaks and achievements"
                >
                  <Flame className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                  <span>{trackingStreak}d streak</span>
                </button>

                {/* Quick Search */}
                <button
                  onClick={() => setShowGlobalSearch(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 bg-stone-50 hover:bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-stone-300 rounded-full border border-stone-200/80 dark:border-zinc-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  title="Search meals, recipes, and guides"
                >
                  <Search className="h-3 w-3 text-stone-500 shrink-0" />
                  <span>Search</span>
                </button>

                {/* Quick Alerts */}
                <button
                  onClick={() => setShowNotificationSettings(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 bg-stone-50 hover:bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-stone-300 rounded-full border border-stone-200/80 dark:border-zinc-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
                  title="Notification & WhatsApp settings"
                >
                  <Bell className="h-3 w-3 text-stone-500 shrink-0" />
                  <span>Alerts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questionnaire Quick Launch Prompt (Shown if onboarding incomplete) */}
      {typeof window !== "undefined" &&
        localStorage.getItem("onboardingComplete") !== "true" &&
        localStorage.getItem("hasCompletedHealthSetup") !== "true" && (
          <div className="px-3.5 sm:px-6 max-w-2xl mx-auto w-full mb-3">
            <div
              onClick={() => {
                triggerHaptic("medium");
                navigate("/onboarding");
              }}
              className="rounded-3xl p-3.5 bg-gradient-to-r from-amber-500 via-teal-600 to-[#126778] text-white shadow-lg flex items-center justify-between gap-3 cursor-pointer hover:brightness-105 active:scale-98 transition-all border border-amber-300/40"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-white/20 rounded-2xl shrink-0">
                  <Sparkles size={18} className="text-amber-300" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">
                    Complete Your Health Blueprint 🥑
                  </span>
                  <span className="text-xs text-emerald-100/90 block truncate font-normal">
                    6 Quick Questions to customize your meals &amp; blood sugar plan
                  </span>
                </div>
              </div>
              <div className="btn-liquid-glass flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white text-stone-900 shrink-0 shadow-xs hover:bg-stone-50 cursor-pointer">
                <span>Start Survey</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        )}

      {/* Main Content Area with Tabbed Architecture */}
      <div className="px-3.5 sm:px-6 mt-2 max-w-2xl mx-auto w-full min-w-0">
        {/* Segmented Tab Navigation Control */}
        <div className="sticky top-3 z-30 bg-white/90 dark:bg-[#171E1B]/90 backdrop-blur-xl p-1 rounded-2xl shadow-xs border border-stone-200/80 dark:border-stone-800/80 flex gap-1 mb-4 transition-all">
          <button
            onClick={() => setActiveHomeTab("today")}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
              activeHomeTab === "today"
                ? "bg-[#164E3D] text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-100/60 dark:hover:bg-zinc-800/60"
            }`}
          >
            <Sparkles size={14} className="shrink-0" />
            <span className="truncate">Today</span>
          </button>

          <button
            onClick={() => setActiveHomeTab("academy")}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
              activeHomeTab === "academy"
                ? "bg-[#164E3D] text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-100/60 dark:hover:bg-zinc-800/60"
            }`}
          >
            <BookOpen size={14} className="shrink-0" />
            <span className="truncate">Food Wisdom</span>
          </button>

          <button
            onClick={() => setActiveHomeTab("clinical")}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer truncate ${
              activeHomeTab === "clinical"
                ? "bg-[#164E3D] text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 hover:bg-stone-100/60 dark:hover:bg-zinc-800/60"
            }`}
          >
            <Heart size={14} className="shrink-0" />
            <span className="truncate">Health &amp; Vitals</span>
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
            {/* 🌟 1. HERO HEALTH SCORE RINGS (10X DYNAMIC UPGRADE) */}
            <TriRingMetabolicFlower
              score={dailyRings.healthScore}
              fiberScore={dailyRings.fiberScore}
              portionScore={dailyRings.portionScore}
              waterScore={dailyRings.waterScore}
              hasActivityToday={dailyRings.hasActivityToday}
              statusBadge={dailyRings.statusBadge}
              metrics={{
                ...dailyRings.metrics,
                proteinConsumed,
                carbsConsumed,
                fatsConsumed,
              }}
              onAddWater={handleWaterIncrease}
              onOpenScanner={() => {
                triggerHaptic("medium");
                soundEffects.playCameraShutter();
                setShowLocalFoodScanner(true);
              }}
              onQuickLog={handleQuickLogClick}
            />

            {/* 🌟 3 CLEAN QUICK-ACTION TILES (Scan Plate, Quick Log, +1 Cup Water) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Button 1: Scan Food Plate */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("medium");
                  soundEffects.playCameraShutter();
                  setShowLocalFoodScanner(true);
                }}
                className="bg-white dark:bg-[#171E1B] rounded-3xl p-3 sm:p-3.5 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-800 flex flex-col items-center justify-center gap-1.5 hover:border-emerald-600/40 active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-lg group-hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-900/40">
                  <Camera size={20} />
                </div>
                <span className="text-xs font-semibold leading-tight text-center">Scan Plate</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-normal">Camera AI</span>
              </button>

              {/* Button 2: Quick Log Meals */}
              <button
                type="button"
                onClick={handleQuickLogClick}
                className="bg-white dark:bg-[#171E1B] rounded-3xl p-3 sm:p-3.5 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-800 flex flex-col items-center justify-center gap-1.5 hover:border-amber-500/40 active:scale-95 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg group-hover:scale-105 transition-transform border border-amber-100 dark:border-amber-900/40">
                  <Zap size={20} />
                </div>
                <span className="text-xs font-semibold leading-tight text-center">Quick Log</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-normal">Common food</span>
              </button>

              {/* Button 3: +1 Cup Water */}
              <div className="bg-white dark:bg-[#171E1B] rounded-3xl p-2.5 sm:p-3 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-800 flex flex-col items-center justify-between gap-1 group">
                <div
                  onClick={handleWaterIncrease}
                  className="w-full flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
                  title="Tap to drink +1 cup of water"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden relative border border-sky-100 dark:border-sky-900/40">
                    <Mascot gesture="drink" size={38} className={isDrinkingWater ? "animate-pulse" : ""} />
                  </div>
                  <span className="text-xs font-semibold leading-tight text-center">+1 Water</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-normal">{waterGlasses} of {waterGoal || 8} cups</span>
                </div>

                {waterGlasses > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWaterDecrease();
                    }}
                    className="mt-0.5 px-2 py-0.5 rounded-full bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border border-stone-200/60 active:scale-95"
                    title="Undo last glass (-1 cup)"
                  >
                    <RotateCcw size={10} />
                    <span>Undo</span>
                  </button>
                )}
              </div>
            </div>

            {/* 🌟 2. DAILY TIME REMINDER & BALANCED AFRICAN PLATE */}
            <CircadianEnergyWave />

            <AfricanPlateSilhouette />

            {/* 🌟 ZONE 1: YAZIO-GRADE GLANCEABLE DAILY ENERGY GAUGE */}
            {dashboardPrefs.showEnergy && (
              <div className="bg-white dark:bg-[#171E1B] rounded-3xl p-4 sm:p-5 space-y-4 border border-stone-200/70 dark:border-stone-800/60 shadow-xs relative overflow-hidden">
                {/* Remaining Energy Readout (YAZIO Metric Hierarchy) */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      Daily Energy Budget
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                        {caloriesRemaining.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold text-stone-500 dark:text-stone-400">
                        kcal left
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      {dailyProgress >= 100 ? "Goal Met 🎉" : `${dailyProgress}% Consumed`}
                    </span>
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      {caloriesConsumed.toLocaleString()} / {caloriesTarget.toLocaleString()} kcal
                    </div>
                  </div>
                </div>

                {/* Segmented 50-25-25 Golden Plate Balance Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-stone-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden flex gap-1 p-0.5">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-700" 
                      style={{ width: "50%" }}
                      title="50% Vegetables, Soups & Fiber" 
                    />
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-700" 
                      style={{ width: "25%" }}
                      title="25% Lean Protein" 
                    />
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-700" 
                      style={{ width: "25%" }}
                      title="25% Complex Swallow & Carbs" 
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-0.5">
                    <span className="flex items-center gap-1 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> 50% Greens &amp; Fiber</span>
                    <span className="flex items-center gap-1 font-medium"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 25% Protein</span>
                    <span className="flex items-center gap-1 font-medium"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> 25% Complex Carbs</span>
                  </div>
                </div>

                {/* 4 Clean Macro Tiles */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-stone-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border border-stone-100 dark:border-zinc-800 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Protein</span>
                    <strong className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5">{proteinConsumed}g</strong>
                    <span className="text-xs text-stone-400">/ {proteinTarget}g</span>
                  </div>
                  <div className="bg-stone-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border border-stone-100 dark:border-zinc-800 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Carbs</span>
                    <strong className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5">{carbsConsumed}g</strong>
                    <span className="text-xs text-stone-400">/ {carbsTarget}g</span>
                  </div>
                  <div className="bg-stone-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border border-stone-100 dark:border-zinc-800 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Fats</span>
                    <strong className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5">{fatsConsumed}g</strong>
                    <span className="text-xs text-stone-400">/ {fatsTarget}g</span>
                  </div>
                  <div 
                    id="tour-water-tracker"
                    onClick={() => {
                      triggerHaptic("medium");
                      setShowWaterReminderModal(true);
                    }}
                    className="bg-sky-50/70 dark:bg-sky-950/40 p-2.5 rounded-2xl border border-sky-100 dark:border-sky-900/40 flex flex-col justify-between items-center text-center cursor-pointer hover:ring-2 hover:ring-sky-400/50 transition-all group"
                    title="Tap to open Water Station"
                  >
                    <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">Water</span>
                    <strong className="text-sm font-bold text-sky-900 dark:text-sky-100 mt-0.5">{waterGlasses}/{waterGoal || 8}</strong>
                    <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">+1 Cup</span>
                  </div>
                </div>

                {/* Progressive Disclosure: Clinical & Doctor Breakdown Accordion */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setShowClinicalAccordion(!showClinicalAccordion);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Stethoscope size={14} className="text-[#164E3D] dark:text-emerald-400" />
                      <span>Clinical Breakdown &amp; Doctor Notes</span>
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showClinicalAccordion ? "rotate-180" : ""}`} />
                  </button>

                  {showClinicalAccordion && (
                    <div className="mt-2.5 p-3.5 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/40 border border-stone-200/60 dark:border-zinc-700/60 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600 dark:text-stone-400 font-medium">KDIGO Potassium Status:</span>
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          Safe (&lt; 2,000 mg)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600 dark:text-stone-400 font-medium">Sodium Intake Ceiling:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {todayLogs.reduce((s, l) => s + (Number(l?.sodium) || 0), 0)} / 1,800 mg
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600 dark:text-stone-400 font-medium">Glycemic Load Category:</span>
                        <span className="font-semibold text-teal-700 dark:text-teal-400">
                          Low-to-Moderate (Steady)
                        </span>
                      </div>
                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate("/glucose-insights")}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-zinc-700 text-stone-800 dark:text-stone-200 font-medium text-xs border border-stone-200 dark:border-zinc-600 hover:bg-stone-50 text-center cursor-pointer"
                        >
                          Virtual CGM Curve →
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/clinical")}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#164E3D] text-white font-medium text-xs hover:bg-[#113E30] text-center cursor-pointer"
                        >
                          Export Doctor PDF 📄
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}



            {/* 🌟 ZONE 3: TODAY'S TIMELY GENTLE TIP (Only 1 smart dynamic card) */}
            {dashboardPrefs.showTip && (
              <NextBestActionCard
                mealsCount={todayLogs.length}
                waterGlasses={waterGlasses}
                onOpenScanner={() => setShowLocalFoodScanner(true)}
                onOpenWater={() => setShowWaterReminderModal(true)}
                onOpenQuickLog={() => {
                  const el = document.getElementById("tour-quick-shelf") || document.getElementById("today-quick-shelf");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            )}



                        {/* 🛒 SMART MEAL PLANNING & GROCERY STORES PORTAL */}
            <div className="grid grid-cols-2 gap-2.5 my-1">
              {/* 📅 7-Day Meal Planner */}
              <div
                onClick={() => {
                  triggerHaptic("medium");
                  navigate("/plan-meal");
                }}
                className="bg-white dark:bg-[#171E1B] rounded-3xl p-3.5 sm:p-4 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:border-emerald-600/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl shrink-0 group-hover:scale-105 transition-transform text-emerald-800 dark:text-emerald-300">
                    <Calendar size={18} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    7-Day Plan
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                    Meal Planner
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-normal line-clamp-1 mt-0.5">
                    Personalized cultural plates
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-[#164E3D] dark:text-emerald-400 mt-2 gap-0.5">
                  <span>Plan 7 Days</span>
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* 🛒 Smart Grocery & Affiliate Stores */}
              <div
                onClick={() => {
                  triggerHaptic("medium");
                  navigate("/grocery");
                }}
                className="bg-white dark:bg-[#171E1B] rounded-3xl p-3.5 sm:p-4 text-stone-900 dark:text-stone-100 shadow-xs border border-stone-200/80 dark:border-stone-800 cursor-pointer hover:border-amber-500/40 active:scale-[0.98] transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
                    <ShoppingCart size={18} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    Aisles
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                    Grocery &amp; Stores
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-normal line-clamp-1 mt-0.5">
                    African staples &amp; ingredients
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 mt-2 gap-0.5">
                  <span>Open Grocery</span>
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* 1-Tap Quick-Log Shelf */}
            <div id="tour-quick-shelf" className="my-1 scroll-mt-20">
              <span id="today-quick-shelf" className="sr-only" />
              <QuickLogShelf
                onLogItem={handleQuickLogItem}
                onOpenSwallowSwap={() => setShowSwallowSwapModal(true)}
                onOpenVoice={() => setShowVoiceLogger(true)}
                onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                onOpenScanner={() => setShowLocalFoodScanner(true)}
                onOpenCustom={() => navigate("/logs", { state: { openAdd: true } })}
                isLogging={quickLogging}
              />
            </div>

            {/* 🌟 ZONE 5: COMMUNITY CHALLENGE & STORIES CAROUSEL CARD */}
            {dashboardPrefs.showChallenge && (
              <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-4 sm:p-5 text-white shadow-xs flex items-center justify-between gap-3 relative overflow-hidden">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-xl shrink-0">
                    🔥
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider bg-amber-300 text-stone-950 px-2 py-0.5 rounded-full">
                      Community Challenge
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-tight truncate">
                      21-Day Blood Sugar Reset
                    </h3>
                    <p className="text-xs text-amber-100 font-normal truncate">
                      1,420 members • Tap to join
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate("/challenge")}
                    className="px-3.5 py-2 bg-white text-stone-900 font-semibold text-xs rounded-xl shadow-xs hover:bg-amber-50 active:scale-95 transition-all cursor-pointer"
                  >
                    Join
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFoodWrapped(true)}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/20 transition-all cursor-pointer"
                    title="Food Wrapped Story"
                  >
                    🏆
                  </button>
                </div>
              </div>
            )}

            {/* Weekly Consistency & Market Sync */}
            {dashboardPrefs.showWeekly && (
              <div className="glass-card rounded-3xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#126778] dark:text-teal-300" />
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
                      {t('home.weeklyConsistency')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => navigate("/logs", { state: { openAdd: true } })}
                      className="text-xs font-black text-[#126778] dark:text-teal-300 hover:underline flex items-center gap-0.5 cursor-pointer bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200/60 dark:border-teal-800/60"
                    >
                      <Plus size={11} />
                      <span>+ Custom Entry</span>
                    </button>
                    <button
                      onClick={() => navigate("/logs")}
                      className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{t('home.viewAll')}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
                            ? "bg-[#164E3D] text-white shadow-xs scale-105"
                            : logged
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                            : "bg-stone-50 text-stone-600 dark:bg-zinc-800 dark:text-stone-400 hover:bg-stone-100"
                        }`}
                      >
                        <span className={`text-xs font-medium mb-1 ${day.isToday ? "text-white font-semibold" : "text-stone-500"}`}>
                          {day.label}
                        </span>
                        <span className="text-base mb-0.5 leading-none">{logged ? "🍲" : "·"}</span>
                        <span className={`text-xs ${day.isToday ? "text-white/90 font-semibold" : "text-stone-400"}`}>
                          {logged ? `${day.count}m` : day.dateNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
            {/* 🥑 FOOD WRAPPED STORY HIGHLIGHT BANNER */}
            <div className="bg-gradient-to-r from-[#164E3D] via-[#1E604D] to-[#124233] rounded-3xl p-4 sm:p-5 text-white shadow-xs border border-[#164E3D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0 p-1.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-xs">
                  <Mascot gesture="clapping" size={44} className="filter drop-shadow-xs" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-xs font-semibold uppercase tracking-wider shadow-2xs">
                    <Sparkles size={11} className="shrink-0" /> {new Date().toLocaleString("default", { month: "long" })} Food Wrapped
                  </div>
                  <h3 className="text-sm sm:text-base font-bold leading-tight mt-1 truncate">
                    Monthly Food &amp; Energy Story
                  </h3>
                  <p className="text-xs text-stone-200 leading-snug line-clamp-1">
                    See how your meals supported your body this month
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    setShowFoodWrapped(true);
                  }}
                  className="btn-liquid-glass btn-glass-frosted w-full sm:w-auto px-4 py-2.5 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center border border-white/40"
                >
                  <span>View Story</span>
                  <ChevronRight size={13} className="shrink-0" />
                </button>
              </div>
            </div>

            {/* Sub-Category Switcher: Daily Food Secret vs African Nutrition Guides */}
            <div className="flex bg-stone-100/90 dark:bg-stone-900/80 p-1.5 rounded-2xl gap-1.5 border border-stone-200/80 dark:border-stone-800 shadow-2xs backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setAcademyCategory("daily");
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  academyCategory === "daily"
                    ? "btn-liquid-glass btn-liquid-forest text-white font-bold shadow-xs border border-white/20"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-semibold hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
                }`}
              >
                <span>🥑 Today's 60s Food Secret</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setAcademyCategory("masterclasses");
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  academyCategory === "masterclasses"
                    ? "btn-liquid-glass btn-liquid-forest text-white font-bold shadow-xs border border-white/20"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-semibold hover:bg-stone-200/50 dark:hover:bg-stone-800/50"
                }`}
              >
                <span>🍲 African Food Guides</span>
              </button>
            </div>

            {/* Render Selected View */}
            {academyCategory === "daily" ? (
              <AvoAcademyBloom />
            ) : (
              <AvoAcademy />
            )}
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
            <div className="w-full min-w-0 bg-white dark:bg-[#171E1B] rounded-3xl p-4 sm:p-5 shadow-xs border border-stone-200/80 dark:border-stone-800 overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#164E3D] dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight truncate">
                      Personal Health Safeguards
                    </h3>
                    <p className="text-xs text-stone-500 truncate">Daily food tips tailored to your metabolic profile</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/medical-condition")}
                  className="text-xs font-semibold text-[#164E3D] dark:text-emerald-400 hover:underline shrink-0 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Condition Chips */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3.5">
                {activeConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-[#164E3D] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0"
                  >
                    <Activity size={12} className="shrink-0" />
                    <span className="truncate max-w-[200px]">{cond}</span>
                  </span>
                ))}
              </div>

              {/* Safeguards Bullet List */}
              <div className="space-y-2 p-3 sm:p-3.5 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/60 border border-stone-100 dark:border-zinc-800 text-xs">
                <div className="flex items-start gap-2 text-stone-700 dark:text-zinc-300">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span className="break-words"><strong>Blood Sugar Shield:</strong> Suggests gentle swaps for swallow and rice to keep you energized.</span>
                </div>
                <div className="flex items-start gap-2 text-stone-700 dark:text-zinc-300">
                  <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  <span className="break-words"><strong>Heart &amp; Blood Pressure:</strong> Helps balance salt and seasoning in stews to protect your arteries.</span>
                </div>
                <div className="flex items-start gap-2 text-stone-700 dark:text-zinc-300">
                  <span className="text-blue-600 font-bold shrink-0">✓</span>
                  <span className="break-words"><strong>Strength &amp; Recovery:</strong> Ensures enough daily protein from fish, eggs, and beans.</span>
                </div>
              </div>
            </div>

            {/* 🩸 HARDWARE WEARABLE & CGM TELEMETRY STATION */}
            <div className="bg-gradient-to-r from-[#164E3D] via-[#1E604D] to-[#124233] rounded-3xl p-4 sm:p-5 text-white shadow-xs border border-[#164E3D]/30 flex items-center justify-between gap-3 relative overflow-hidden">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shrink-0">
                  🩸
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400 text-stone-950 text-xs font-semibold uppercase tracking-wider shadow-2xs">
                    Live Sensor Stream
                  </div>
                  <h3 className="text-sm sm:text-base font-bold leading-tight mt-1 truncate">
                    Dexcom / Libre / Apple Watch Sync
                  </h3>
                  <p className="text-xs text-stone-200 truncate">
                    Continuous glucose &amp; sleep telemetry
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWearableSyncModal(true)}
                className="px-3.5 py-2 bg-white hover:bg-stone-50 text-[#164E3D] font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <span>Pair</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* 🧬 PRECISION MICRONUTRIENT SHIELD (DIASPORA D3 & B12 ENGINE) */}
            <MicronutrientShieldCard />

            {/* 2. Continuous Glucose Monitor (CGM) 24-Hr Sensor Stream */}
            <CGMSensorVisualizer />

            {/* 3. Biometric Vitals Quick-Snapshot (3 Cards Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {/* Glucose & Projected eA1c */}
              <button
                onClick={() => navigate("/glucose-insights")}
                className="w-full min-w-0 bg-white dark:bg-[#171E1B] rounded-3xl p-3.5 sm:p-4 shadow-xs border border-stone-200/80 dark:border-stone-800 hover:border-rose-300 transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-semibold text-rose-600 truncate">Blood Glucose &amp; eA1c</span>
                  <Droplet className="h-4 w-4 text-rose-500 shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  118 <span className="text-xs font-normal text-stone-500">mg/dL</span>
                </div>
                <p className="text-xs text-stone-500 mt-1 truncate">
                  Projected eA1c: <strong className="text-rose-700 dark:text-rose-400 font-semibold">5.7%</strong> (Optimal)
                </p>
                <span className="mt-2 text-xs font-semibold text-[#164E3D] dark:text-emerald-400 block">
                  View Insights →
                </span>
              </button>

              {/* Blood Pressure */}
              <button
                onClick={() => navigate("/biometrics")}
                className="w-full min-w-0 bg-white dark:bg-[#171E1B] rounded-3xl p-3.5 sm:p-4 shadow-xs border border-stone-200/80 dark:border-stone-800 hover:border-purple-300 transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-semibold text-purple-600 truncate">Blood Pressure</span>
                  <Activity className="h-4 w-4 text-purple-500 shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  118/78 <span className="text-xs font-normal text-stone-500">mmHg</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1 truncate">
                  Normal Range (AHA Standard)
                </p>
                <span className="mt-2 text-xs font-semibold text-[#164E3D] dark:text-emerald-400 block">
                  Log Vitals →
                </span>
              </button>

              {/* Weight & BMI */}
              <button
                onClick={() => navigate("/weight")}
                className="w-full min-w-0 bg-white dark:bg-[#171E1B] rounded-3xl p-3.5 sm:p-4 shadow-xs border border-stone-200/80 dark:border-stone-800 hover:border-emerald-300 transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-semibold text-emerald-700 dark:text-emerald-400 truncate">Weight &amp; BMI</span>
                  <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {profile?.weight ? `${profile.weight} kg` : "72.4 kg"}
                </div>
                <p className="text-xs text-stone-500 mt-1 truncate">
                  BMI: <strong>23.4</strong> (Healthy)
                </p>
                <span className="mt-2 text-xs font-semibold text-[#164E3D] dark:text-emerald-400 block">
                  Track Weight →
                </span>
              </button>
            </div>

            {/* 3. 1-Tap Clinical Doctor PDF Export Banner */}
            <div className="w-full min-w-0 bg-gradient-to-r from-[#164E3D] via-[#1E604D] to-[#124233] rounded-3xl p-4 sm:p-5 text-white shadow-xs overflow-hidden border border-[#164E3D]/30">
              <div className="flex items-start justify-between gap-2.5 mb-3">
                <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-sm shrink-0">
                  <FileSpreadsheet className="h-6 w-6 text-white" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-stone-950 font-semibold text-xs shrink-0">
                  Clinical Ready
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold leading-snug mb-1">
                Doctor &amp; Dietitian 30-Day Clinical Report
              </h3>
              <p className="text-xs text-stone-200 leading-relaxed mb-4 break-words">
                Export your glycemic logs, blood pressure trends, estimated A1c, and dietary compliance into a certified 1-page PDF summary for your physician.
              </p>
              <button
                onClick={() => navigate("/health-report")}
                className="w-full py-3 bg-white text-[#164E3D] hover:bg-stone-50 font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText size={15} />
                <span>Open Clinical Doctor Report</span>
              </button>
            </div>

            {/* 4. Medical Vault & Medication Quick Actions */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                onClick={() => navigate("/medical-vault")}
                className="w-full min-w-0 bg-white dark:bg-[#171E1B] rounded-3xl p-3 sm:p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs text-left hover:border-indigo-300 transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 w-fit mb-2">
                  <Shield size={18} />
                </div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">Medical Vault</span>
                <span className="text-xs text-stone-500 block mt-0.5 truncate">Lab results &amp; files</span>
              </button>

              <button
                onClick={() => navigate("/medication-tracker")}
                className="w-full min-w-0 bg-white dark:bg-[#171E1B] rounded-3xl p-3 sm:p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs text-left hover:border-rose-300 transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 w-fit mb-2">
                  <Pill size={18} />
                </div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block truncate">Med Tracker</span>
                <span className="text-xs text-stone-500 block mt-0.5 truncate">Dose adherence</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />

      {/* Floating Action / WhatsApp Modal */}
      <WhatsAppConnectDialog isOpen={showWhatsAppModal} onClose={() => setShowWhatsAppModal(false)} />

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
      {showSwallowSwapModal && (
        <React.Suspense fallback={null}>
          <GlycemicSimulatorModal
            isOpen={showSwallowSwapModal}
            onClose={() => setShowSwallowSwapModal(false)}
            defaultTab="swallow_swap"
            onLogSaved={() => {
              getMealLogs().then(logs => { if (Array.isArray(logs)) setWeekLogs(logs); }).catch(() => {});
            }}
          />
        </React.Suspense>
      )}
      <SmartGroceryPlanner isOpen={showGroceryPlanner} onClose={() => setShowGroceryPlanner(false)} />
      <WearableSyncModal isOpen={showWearableSyncModal} onClose={() => setShowWearableSyncModal(false)} />

      <FoodWrappedModal
        isOpen={showFoodWrapped}
        onClose={() => setShowFoodWrapped(false)}
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
                <span className="text-xs text-stone-600 leading-tight block">
                  {getGaugeStatus().message}
                </span>
              </div>
            </div>

            {/* Compact Calorie Progress Card */}
            <div className="bg-stone-50 dark:bg-zinc-800/80 rounded-2xl p-3.5 border border-stone-200/80 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Calories</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#164E3D] dark:text-emerald-400">{caloriesConsumed}</span>
                  <span className="text-xs text-stone-500 font-medium"> / {caloriesTarget} kcal</span>
                </div>
              </div>
              <Progress value={Math.min(100, (caloriesConsumed / caloriesTarget) * 100)} className="h-2 rounded-full" />
              <div className="flex justify-between items-center mt-1.5 text-xs text-stone-500 font-medium">
                <span>{animatedPercentage}% completed</span>
                <span>{Math.max(0, caloriesTarget - caloriesConsumed)} kcal remaining</span>
              </div>
            </div>

            {/* 3-Column Macro Grid Matrix */}
            <div>
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider block mb-2">
                Macronutrient Pillars
              </span>
              <div className="grid grid-cols-3 gap-2">
                {/* Protein */}
                <div className="bg-white dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 rounded-2xl p-2.5 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 block">Protein</span>
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{proteinConsumed}g</span>
                    <span className="text-xs text-stone-400 block font-normal">/ {proteinTarget}g</span>
                  </div>
                  <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (proteinConsumed / proteinTarget) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbs */}
                <div className="bg-white dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 rounded-2xl p-2.5 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block">Carbs</span>
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{carbsConsumed}g</span>
                    <span className="text-xs text-stone-400 block font-normal">/ {carbsTarget}g</span>
                  </div>
                  <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (carbsConsumed / carbsTarget) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fats */}
                <div className="bg-white dark:bg-zinc-800 border border-stone-200/80 dark:border-zinc-700 rounded-2xl p-2.5 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 block">Fats</span>
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{fatsConsumed}g</span>
                    <span className="text-xs text-stone-400 block font-normal">/ {fatsTarget}g</span>
                  </div>
                  <div className="w-full bg-amber-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (fatsConsumed / fatsTarget) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Clinical Glycemic Context Tip */}
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 rounded-2xl text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
              <span className="text-sm">💡</span>
              <span className="leading-snug">
                <strong>Metabolic Tip:</strong> Pairing protein (eggs, fish, beans) with cultural carbohydrates delays gastric emptying and flattens post-meal glucose spikes by up to 35%.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 mt-auto shrink-0">
            <Button
              onClick={() => setShowGaugeDetails(false)}
              className="w-full bg-[#164E3D] hover:bg-[#113E30] text-white rounded-xl text-xs font-semibold py-2.5 cursor-pointer shadow-xs"
            >
              Close Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ⚡ Quick Meal Log Popup (Bottom Drawer) */}
      <Dialog open={showQuickMealLog} onOpenChange={setShowQuickMealLog}>
        <DialogContent className="max-w-md mx-auto p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh]">
          <DialogHeader className="shrink-0 pb-2 border-b border-stone-100 dark:border-zinc-800">
            <DialogTitle className="flex items-center gap-2 text-base font-bold capitalize text-stone-900 dark:text-stone-100">
              <span>Quick Log {selectedQuickMeal}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#164E3D] border border-emerald-200/60">
                1-Tap
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500">
              Pick a common meal below to log instantly, or enter custom details.
            </DialogDescription>
          </DialogHeader>

          {/* Meal Time Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800/80 rounded-2xl shrink-0 mt-2">
            {(["breakfast", "lunch", "dinner"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedQuickMeal(m);
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedQuickMeal === m
                    ? "bg-white dark:bg-zinc-900 text-[#164E3D] dark:text-emerald-400 shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                }`}
              >
                {m === "breakfast" ? "🌅 Breakfast" : m === "lunch" ? "☀️ Lunch" : "🌙 Dinner"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain py-3 space-y-3 pr-1">
            {selectedQuickMeal && (
              <div className="space-y-2">
                {quickMealOptions[selectedQuickMeal].map((meal) => (
                  <button
                    key={meal.name}
                    onClick={() => handleQuickLog(meal)}
                    disabled={quickLogging}
                    className="w-full bg-white hover:bg-stone-50 border border-stone-200/80 hover:border-[#164E3D] rounded-2xl p-3 text-left transition-all disabled:opacity-60 flex items-center gap-3 cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <span className="text-2xl shrink-0 p-1 bg-stone-50 rounded-xl">{meal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">{meal.name}</div>
                      <div className="text-xs text-stone-500 font-normal mt-0.5">~{meal.calories} kcal • {meal.label}</div>
                    </div>
                    <Plus className="h-4 w-4 text-[#164E3D] shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleCustomEntry}
              disabled={quickLogging}
              className="w-full bg-white border border-dashed border-[#164E3D]/40 hover:border-[#164E3D] rounded-2xl p-2.5 text-center hover:bg-stone-50 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1.5 text-[#164E3D] font-semibold text-xs">
                <Plus className="h-4 w-4" />
                Custom Entry
              </div>
            </button>
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-stone-100 mt-auto shrink-0">
            <Button
              onClick={() => setShowQuickMealLog(false)}
              variant="outline"
              className="flex-1 rounded-xl text-xs font-semibold py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowQuickMealLog(false);
                navigate("/logs");
              }}
              className="flex-1 bg-[#164E3D] hover:bg-[#113E30] text-white rounded-xl text-xs font-semibold py-2"
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



      {/* 10X Water & Cellular Hydration Reminder Modal with Avo Drinking Water Mascot */}
      <WaterReminderModal
        isOpen={showWaterReminderModal}
        onClose={() => setShowWaterReminderModal(false)}
        currentGlasses={waterGlasses}
        targetGlasses={waterGoal}
        onAddGlass={handleWaterAddCustom}
      />

      {/* 👨‍👩‍👧‍👦 Diaspora Family Health Circle (Remote Parent Care Loop) */}
      <FamilyHealthCircleModal
        isOpen={showFamilyCircleModal}
        onClose={() => setShowFamilyCircleModal(false)}
      />

      {/* 🪄 Fix My Plate 1-Tap Visual Bio-Transformer */}
      <FixMyPlateModal
        isOpen={showFixPlateModal}
        onClose={() => setShowFixPlateModal(false)}
        meal={fixPlateMeal}
        onApplyOptimized={(opt) => {
          setFixPlateMeal({
            foodName: opt.foodName,
            calories: opt.calories,
            protein: opt.protein,
            carbs: opt.carbs,
            fats: opt.fats,
            fiber: opt.fiber || 3,
          });
        }}
      />

      {/* Clinical Governance & Medical Regulatory Disclaimer Modal */}
      <MedicalDisclaimerModal
        onAccept={() => {
          const isDone =
            localStorage.getItem("mealoptimiza_questionnaire_completed") === "true" ||
            localStorage.getItem("onboardingComplete") === "true";
          if (!isDone) {
            setShowHealthWizard(true);
          }
        }}
      />
    </div>
  );
}