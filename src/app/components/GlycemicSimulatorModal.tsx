import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Activity,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Info,
  X,
  Droplets,
  ChevronRight,
  Sliders,
  RefreshCw,
  BarChart2,
  Check,
  Radio,
  Wifi,
  Footprints,
  Utensils,
  Zap,
  BookmarkCheck,
  ArrowRight,
  Smile,
} from "lucide-react";
import Mascot from "./Mascot";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";
import { createMealLog } from "../../lib/api";
import { schedulePostMealWalkAlert } from "../../lib/notifications";
import { toast } from "sonner";

export interface MealGlycemicProfile {
  name: string;
  emoji?: string;
  carbs: number; // in grams
  fiber?: number; // in grams
  protein: number; // in grams
  fats?: number; // in grams
  glycemicIndex?: "Low" | "Medium" | "High";
  clinicalNote?: string;
}

interface GlycemicSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal?: MealGlycemicProfile | null;
  onLogSaved?: () => void;
  defaultTab?: "swallow_swap" | "curve" | "cgm" | "biomarkers";
}

interface PostprandialPoint {
  minute: number;
  standardGlucose: number;
  shieldedGlucose: number;
  diff: number;
}

// Cultural African Swallow & Soup Profiles for "What If?" Simulator
export interface SwallowPreset {
  id: string;
  name: string;
  nativeAlias: string;
  carbs: number;
  fiber: number;
  glycemicIndex: number;
  emoji: string;
  tasteNote: string;
  energyFeel: string;
  fullnessDuration: string;
  badge: string;
}

export const TRADITIONAL_SWALLOWS: SwallowPreset[] = [
  {
    id: "pounded_yam",
    name: "Pounded Yam (Iyan)",
    nativeAlias: "Iyan / Poundo",
    carbs: 82,
    fiber: 2.1,
    glycemicIndex: 88,
    emoji: "🍠",
    tasteNote: "Velvety smooth, ultra dense",
    energyFeel: "Heavy 2 PM food coma & mid-afternoon sleepiness",
    fullnessDuration: "Hungry again in ~90 mins (insulin rebound)",
    badge: "Fastest Spike",
  },
  {
    id: "garri_eba",
    name: "White Garri / Eba",
    nativeAlias: "Yellow/White Eba",
    carbs: 76,
    fiber: 2.4,
    glycemicIndex: 85,
    emoji: "🥣",
    tasteNote: "Tangy fermented comfort",
    energyFeel: "Quick energy burst, followed by steep crash",
    fullnessDuration: "Full initially, cravings return in 2 hrs",
    badge: "High Spike",
  },
  {
    id: "semovita",
    name: "Semovita / Semo",
    nativeAlias: "Semo Swallow",
    carbs: 74,
    fiber: 2.3,
    glycemicIndex: 82,
    emoji: "🌾",
    tasteNote: "Fine wheat texture",
    energyFeel: "Afternoon sluggishness and mental brain fog",
    fullnessDuration: "Rapid digestion, short satiety",
    badge: "Refined Starch",
  },
  {
    id: "cassava_fufu",
    name: "Cassava Akpu / Fufu",
    nativeAlias: "Akpu / Santana",
    carbs: 79,
    fiber: 1.8,
    glycemicIndex: 84,
    emoji: "⚪",
    tasteNote: "Firm traditional mash",
    energyFeel: "Heavy stomach weight & low stamina",
    fullnessDuration: "Sudden energy plunge at 2 hours",
    badge: "Dense Starch",
  },
  {
    id: "white_rice",
    name: "Parboiled White Rice",
    nativeAlias: "White Rice & Stew",
    carbs: 68,
    fiber: 1.6,
    glycemicIndex: 80,
    emoji: "🍚",
    tasteNote: "Classic everyday staple",
    energyFeel: "Blood sugar rollercoaster and snack urge",
    fullnessDuration: "Quick gastric emptying",
    badge: "High Glycemic",
  },
];

export const HEALTHY_SWALLOW_SWAPS: SwallowPreset[] = [
  {
    id: "oat_psyllium",
    name: "Oat & Psyllium Swallow",
    nativeAlias: "Avo Beta-Glucan Swallow",
    carbs: 36,
    fiber: 12.5,
    glycemicIndex: 40,
    emoji: "🌾",
    tasteNote: "Soft, smooth, moldable like pounded yam",
    energyFeel: "Clear focus, all-day stamina, zero afternoon crash",
    fullnessDuration: "Satisfied for 4 to 5 hours comfortably",
    badge: "-45% Spike Shield",
  },
  {
    id: "cabbage_swallow",
    name: "Cabbage & Veggie Swallow",
    nativeAlias: "Keto Garden Swallow",
    carbs: 14,
    fiber: 9.2,
    glycemicIndex: 22,
    emoji: "🥬",
    tasteNote: "Surprisingly mild, adopts your soup flavor",
    energyFeel: "Light as a feather, vibrant vitality",
    fullnessDuration: "Zero digestive heaviness, smooth energy",
    badge: "-62% Spike Shield",
  },
  {
    id: "fonio_baobab",
    name: "Ancient Fonio & Baobab",
    nativeAlias: "Heritage Super-Grain",
    carbs: 38,
    fiber: 10.4,
    glycemicIndex: 35,
    emoji: "✨",
    tasteNote: "Nutty, aromatic African ancient seed",
    energyFeel: "Steady calm burn with essential trace minerals",
    fullnessDuration: "Slow, even 4-hour gastric release",
    badge: "-40% Spike Shield",
  },
  {
    id: "half_portion_shield",
    name: "50% Veggie Shield + 1/2 Swallow",
    nativeAlias: "The Cultural Compromise",
    carbs: 40,
    fiber: 11.0,
    glycemicIndex: 48,
    emoji: "🥑",
    tasteNote: "100% of your favorite taste, smaller fist size",
    energyFeel: "Best of both worlds: pure joy with no sugar shock",
    fullnessDuration: "4+ hours buffered by soup fiber gel",
    badge: "-35% Spike Shield",
  },
];

export const POPULAR_SOUPS = [
  { id: "egusi", name: "Egusi Soup with Fish & Spinach", emoji: "🍲" },
  { id: "ogbono", name: "Ogbono Soup with Bitterleaf & Fish", emoji: "🥘" },
  { id: "afang", name: "Afang / Edikang Ikong Leaf Soup", emoji: "🥬" },
  { id: "ewedu", name: "Ewedu & Gbegiri with Beef", emoji: "🥣" },
  { id: "nsala", name: "Ofe Nsala (White Soup with Catfish)", emoji: "🐟" },
  { id: "banga", name: "Banga Soup with Dried Fish", emoji: "🥥" },
];

export function GlycemicSimulatorModal({
  isOpen,
  onClose,
  meal,
  onLogSaved,
  defaultTab = "swallow_swap",
}: GlycemicSimulatorModalProps) {
  const [activeTab, setActiveTab] = useState<"swallow_swap" | "curve" | "cgm" | "biomarkers">(defaultTab);
  const [selectedMinute, setSelectedMinute] = useState<number>(60);
  const [unit, setUnit] = useState<"mgdl" | "mmol">("mgdl");

  // "What If?" Swallow Swap State
  const [selectedTraditionalId, setSelectedTraditionalId] = useState<string>("pounded_yam");
  const [selectedSwapId, setSelectedSwapId] = useState<string>("oat_psyllium");
  const [selectedSoupId, setSelectedSoupId] = useState<string>("egusi");
  const [swallowMinute, setSwallowMinute] = useState<number>(60);
  const [isSavingSwallow, setIsSavingSwallow] = useState<boolean>(false);

  // Hardware CGM Telemetry States
  const [cgmDevice, setCgmDevice] = useState<"Dexcom G7" | "FreeStyle Libre 3" | "Apple HealthKit">("Dexcom G7");
  const [liveCgmValue, setLiveCgmValue] = useState<number>(108);
  const [isCgmStreaming, setIsCgmStreaming] = useState<boolean>(true);

  // Biomarker Input States
  const [fastingGlucose, setFastingGlucose] = useState<string>("92");
  const [postprandialGlucose, setPostprandialGlucose] = useState<string>("");
  const [systolicBP, setSystolicBP] = useState<string>("");
  const [diastolicBP, setDiastolicBP] = useState<string>("");
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);

  const baseline = Number(fastingGlucose) > 50 && Number(fastingGlucose) < 200 ? Number(fastingGlucose) : 92;

  // Active meal stats for standard curve tab
  const mealCarbs = meal?.carbs || 56;
  const mealProtein = meal?.protein || 28;
  const mealFiber = meal?.fiber || 12;
  const mealName = meal?.name || "Afro-Metabolic 9-Inch Plate";
  const mealEmoji = meal?.emoji || "🍽️";

  // Active selected swallow presets
  const activeTraditional = useMemo(
    () => TRADITIONAL_SWALLOWS.find((s) => s.id === selectedTraditionalId) || TRADITIONAL_SWALLOWS[0],
    [selectedTraditionalId]
  );
  const activeSwap = useMemo(
    () => HEALTHY_SWALLOW_SWAPS.find((s) => s.id === selectedSwapId) || HEALTHY_SWALLOW_SWAPS[0],
    [selectedSwapId]
  );
  const activeSoup = useMemo(
    () => POPULAR_SOUPS.find((s) => s.id === selectedSoupId) || POPULAR_SOUPS[0],
    [selectedSoupId]
  );

  const formatGlucose = (val: number) => {
    if (unit === "mmol") {
      return (val / 18.0182).toFixed(1);
    }
    return `${val}`;
  };

  // 1. STANDARD MEAL CURVE (0 - 180 min)
  const { points, peakStandard, peakShielded, reductionPct } = useMemo(() => {
    const data: PostprandialPoint[] = [];
    const carbFactor = Math.max(25, mealCarbs);
    const standardFiber = 2.5;
    const shieldedFiber = Math.max(10, mealFiber);

    const peakStdDelta = carbFactor * 1.55 - standardFiber * 0.8;
    const peakShieldDelta = carbFactor * 0.72 - shieldedFiber * 1.4;

    let maxStd = baseline;
    let maxShield = baseline;

    for (let t = 0; t <= 180; t += 10) {
      const stdCurve =
        Math.sin((t / 180) * Math.PI) *
        Math.pow(Math.E, -t / 125) *
        peakStdDelta *
        2.2;
      const reactiveDip = t > 110 && t < 170 ? Math.sin(((t - 110) / 60) * Math.PI) * 14 : 0;
      const stdGlucose = Math.round(Math.max(65, baseline + stdCurve - reactiveDip));

      const shieldCurve =
        Math.sin((t / 180) * Math.PI) *
        Math.pow(Math.E, -t / 105) *
        peakShieldDelta *
        1.45;
      const shieldGlucose = Math.round(baseline + Math.max(0, shieldCurve));

      if (stdGlucose > maxStd) maxStd = stdGlucose;
      if (shieldGlucose > maxShield) maxShield = shieldGlucose;

      data.push({
        minute: t,
        standardGlucose: stdGlucose,
        shieldedGlucose: shieldGlucose,
        diff: stdGlucose - shieldGlucose,
      });
    }

    const redPct = Math.round(((maxStd - maxShield) / (maxStd - baseline || 1)) * 100);

    return {
      points: data,
      peakStandard: maxStd,
      peakShielded: maxShield,
      reductionPct: Math.min(65, Math.max(25, redPct)),
    };
  }, [baseline, mealCarbs, mealFiber]);

  // 2. "WHAT IF?" SWALLOW SWAP SIMULATION CURVES (Dynamic calculation)
  const {
    swallowPoints,
    peakTraditional,
    peakSwap,
    swallowReductionPct,
    swallowDelta,
    currentSwallowPoint,
  } = useMemo(() => {
    const data: PostprandialPoint[] = [];
    const tCarbs = activeTraditional.carbs;
    const tFiber = activeTraditional.fiber;
    const sCarbs = activeSwap.carbs;
    const sFiber = activeSwap.fiber;

    // Traditional: Fast enzymatic surge + steep hypoglycemic dip
    const tPeakDelta = (tCarbs * 1.55 - tFiber * 0.9) * (activeTraditional.glycemicIndex / 75);
    // Swap: Slow viscous gel diffusion capped at plateau
    const sPeakDelta = (sCarbs * 0.70 - sFiber * 1.4) * (activeSwap.glycemicIndex / 60);

    let maxTrad = baseline;
    let maxSwp = baseline;

    for (let t = 0; t <= 180; t += 10) {
      // Traditional curve: Peaks sharply at 45m, plunges into food coma dip at 130-160m
      const tCurve =
        Math.sin((t / 180) * Math.PI) *
        Math.pow(Math.E, -t / 115) *
        tPeakDelta *
        2.1;
      const crashDip = t > 115 && t < 170 ? Math.sin(((t - 115) / 55) * Math.PI) * 18 : 0;
      const tradGlucose = Math.round(Math.max(62, baseline + tCurve - crashDip));

      // Swap curve: Smooth plateau capped at safe zone (<135)
      const sCurve =
        Math.sin((t / 180) * Math.PI) *
        Math.pow(Math.E, -t / 100) *
        Math.max(10, sPeakDelta) *
        1.35;
      const swapGlucose = Math.round(baseline + Math.max(0, sCurve));

      if (tradGlucose > maxTrad) maxTrad = tradGlucose;
      if (swapGlucose > maxSwp) maxSwp = swapGlucose;

      data.push({
        minute: t,
        standardGlucose: tradGlucose,
        shieldedGlucose: swapGlucose,
        diff: tradGlucose - swapGlucose,
      });
    }

    const curPt =
      data.find((p) => p.minute === swallowMinute) ||
      data[Math.floor(swallowMinute / 10)] ||
      data[6];

    const redPct = Math.round(((maxTrad - maxSwp) / (maxTrad - baseline || 1)) * 100);

    return {
      swallowPoints: data,
      peakTraditional: maxTrad,
      peakSwap: maxSwp,
      swallowReductionPct: Math.min(70, Math.max(25, redPct)),
      swallowDelta: maxTrad - maxSwp,
      currentSwallowPoint: curPt,
    };
  }, [baseline, activeTraditional, activeSwap, swallowMinute]);

  const currentPoint =
    points.find((p) => p.minute === selectedMinute) ||
    points[Math.floor(selectedMinute / 10)] ||
    points[6];

  // SVG Chart Geometry
  const width = 460;
  const height = 205;
  const padding = { top: 25, right: 25, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const minGlucose = 60;
  const maxGlucose = 220;

  const getX = (min: number) => padding.left + (min / 180) * graphWidth;
  const getY = (val: number) =>
    padding.top + graphHeight - ((val - minGlucose) / (maxGlucose - minGlucose)) * graphHeight;

  // Build SVG Paths for Swallow Swap Graph
  const swallowTradPath = swallowPoints.reduce((acc, p, i) => {
    const x = getX(p.minute);
    const y = getY(p.standardGlucose);
    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, "");

  const swallowSwapPath = swallowPoints.reduce((acc, p, i) => {
    const x = getX(p.minute);
    const y = getY(p.shieldedGlucose);
    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, "");

  const swallowTradArea = `${swallowTradPath} L ${getX(180)},${getY(baseline)} L ${getX(0)},${getY(baseline)} Z`;
  const swallowSwapArea = `${swallowSwapPath} L ${getX(180)},${getY(baseline)} L ${getX(0)},${getY(baseline)} Z`;

  // Standard Curve SVG Paths
  const stdPath = points.reduce((acc, p, i) => {
    const x = getX(p.minute);
    const y = getY(p.standardGlucose);
    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, "");

  const shieldPath = points.reduce((acc, p, i) => {
    const x = getX(p.minute);
    const y = getY(p.shieldedGlucose);
    return i === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
  }, "");

  const stdAreaPath = `${stdPath} L ${getX(180)},${getY(baseline)} L ${getX(0)},${getY(baseline)} Z`;
  const shieldAreaPath = `${shieldPath} L ${getX(180)},${getY(baseline)} L ${getX(0)},${getY(baseline)} Z`;

  // Consumer-Friendly Avo Commentary for Swallow Swap
  const getAvoSwallowCommentary = (min: number) => {
    if (min === 0) {
      return `Fasting baseline (${baseline} ${unit}). As you take your first mouthful of ${activeSwap.name} dipped in ${activeSoup.name}, soluble fibers start forming a silky hydration barrier!`;
    }
    if (min <= 30) {
      return `30 mins: ${activeTraditional.name} starch is already rushing into blood, causing insulin to jump. But with ${activeSwap.name}, soluble fiber traps glucose for gentle release!`;
    }
    if (min <= 60) {
      return `Peak Spike Moment! Traditional ${activeTraditional.name} spikes dangerously to ${formatGlucose(
        currentSwallowPoint.standardGlucose
      )} ${unit}. Your healthy swap caps it peacefully at ${formatGlucose(
        currentSwallowPoint.shieldedGlucose
      )} ${unit}—saving you from sugar shock!`;
    }
    if (min <= 90) {
      return `90 mins: With your swap, you're enjoying 100% of your favorite ${activeSoup.name} with sustained natural energy and zero sluggishness!`;
    }
    if (min <= 135) {
      return `The 2 PM Crash Zone: Traditional ${activeTraditional.name} drops into a hypoglycemic plunge (sugar crash & hunger). Your swap stays in the sweet zone!`;
    }
    return `180 mins: Digestion complete! You had zero food coma, stayed full for 4+ hours, and kept your blood sugar in the 100% safe green zone! 🥑`;
  };

  // 1-Tap Save Swallow Swap to Plan Handler
  const handleSaveSwallowSwapToPlan = async () => {
    setIsSavingSwallow(true);
    triggerHaptic("medium");
    try {
      const mealTitle = `${activeSwap.name} with ${activeSoup.name}`;
      const now = new Date();
      const payload = {
        name: mealTitle,
        foodName: mealTitle,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        mealType: "lunch",
        calories: Math.round(activeSwap.carbs * 4 + 240),
        carbs: activeSwap.carbs,
        protein: 26,
        fiber: activeSwap.fiber,
        fats: 14,
        bloodSugarImpact: "low",
        notes: `Simulated via Swallow Swap: -${swallowReductionPct}% spike reduction vs ${activeTraditional.name}. Simulated peak: ${peakSwap} mg/dL.`,
      };

      await createMealLog(payload);

      soundEffects.playSuccessJingle();
      triggerConfetti();
      triggerHaptic("success");

      toast.success(
        `Swallow Swap Saved! 🎉 Enjoy ${activeSwap.name} with ${activeSoup.name} with steady all-day energy!`,
        { duration: 4000 }
      );

      // Arm 30-min walk alert
      schedulePostMealWalkAlert(mealTitle, 30);

      if (onLogSaved) onLogSaved();
    } catch {
      toast.info(`Cached ${activeSwap.name} swap to your offline meal diary! 🥑`);
    } finally {
      setIsSavingSwallow(false);
    }
  };

  // Biomarker Quick Log Handler
  const handleSaveBiomarkers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postprandialGlucose && !systolicBP) {
      toast.error("Please enter at least a 2-hour blood sugar or blood pressure reading.");
      return;
    }

    setIsSubmittingLog(true);
    try {
      triggerHaptic("medium");
      const postprandialVal = postprandialGlucose ? Number(postprandialGlucose) : null;
      const fbsVal = fastingGlucose ? Number(fastingGlucose) : null;

      const logPayload = {
        name: `Biomarker Sync: ${mealName}`,
        mealType: "Biomarker Check",
        timestamp: new Date().toISOString(),
        glucoseFasting: fbsVal,
        glucosePostprandial: postprandialVal,
        bloodPressureSys: systolicBP ? Number(systolicBP) : null,
        bloodPressureDia: diastolicBP ? Number(diastolicBP) : null,
        notes: `Logged after simulating ${mealName}. Simulated peak: ${peakShielded} mg/dL.`,
        isPostprandial: true,
      };

      await createMealLog(logPayload);

      try {
        const storedBio = localStorage.getItem("mealoptimiza_biometrics_history") || "[]";
        const parsed = JSON.parse(storedBio);
        parsed.unshift({ ...logPayload, id: `bio_${Date.now()}` });
        localStorage.setItem("mealoptimiza_biometrics_history", JSON.stringify(parsed.slice(0, 50)));
      } catch {}

      soundEffects.playSuccessJingle();
      triggerConfetti();
      triggerHaptic("success");

      toast.success(
        `Biomarkers synced! ${
          postprandialVal
            ? `Your 2h glucose (${postprandialVal} mg/dL) was recorded successfully.`
            : "Blood pressure reading recorded."
        } 🥑`
      );

      schedulePostMealWalkAlert(mealName, 30);

      if (onLogSaved) onLogSaved();
      setPostprandialGlucose("");
      setSystolicBP("");
      setDiastolicBP("");
      setActiveTab("swallow_swap");
    } catch (err: any) {
      console.error(err);
      toast.error("Saved to offline cache. Will sync once connected!");
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-full p-0 overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <DialogHeader className="p-4 pb-3 bg-gradient-to-r from-[#126778] via-[#1f7a8c] to-[#0f4c5c] text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20">
              <Sparkles size={20} />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-white flex items-center gap-1.5">
                <span>"What If?" Glycemic Engine</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                  10X BIO-SWAP
                </span>
              </DialogTitle>
              <DialogDescription className="text-[11px] text-teal-100 flex items-center gap-1">
                <span>Instant visual flattening of blood sugar spikes</span>
                <span>•</span>
                <span>Zero Guilt Cultural Food</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                try { triggerHaptic("light"); } catch {}
                setUnit(unit === "mgdl" ? "mmol" : "mgdl");
              }}
              className="text-[10px] font-black px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-teal-100 border border-white/20 cursor-pointer transition-all"
              title="Toggle Units"
            >
              {unit === "mgdl" ? "mg/dL" : "mmol/L"}
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </DialogHeader>

        {/* Navigation Tabs (4 Responsive Tabs) */}
        <div className="grid grid-cols-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 shrink-0 text-center">
          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("swallow_swap");
            }}
            className={`py-2.5 text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "swallow_swap"
                ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-white dark:bg-zinc-800"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span>🥑</span>
            <span className="hidden sm:inline">Swallow</span>
            <span>Swap</span>
          </button>

          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("curve");
            }}
            className={`py-2.5 text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "curve"
                ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-white dark:bg-zinc-800"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <TrendingUp size={13} />
            <span className="hidden sm:inline">3-Hour</span>
            <span>Curve</span>
          </button>

          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("cgm");
            }}
            className={`py-2.5 text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "cgm"
                ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-white dark:bg-zinc-800"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Radio size={13} className={isCgmStreaming ? "text-emerald-500 animate-pulse" : ""} />
            <span>Live CGM</span>
          </button>

          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("biomarkers");
            }}
            className={`py-2.5 text-xs font-black flex items-center justify-center gap-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "biomarkers"
                ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-white dark:bg-zinc-800"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <HeartPulse size={13} />
            <span>Biomarkers</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: 🌟 INTERACTIVE "WHAT IF?" SWALLOW SWAP SIMULATOR */}
          {activeTab === "swallow_swap" && (
            <div className="space-y-4">
              {/* Consumer Warm Encouragement Banner */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
                <Mascot gesture="thumbsup" size={44} className="shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <span>Keep 100% of Your Favorite Soup!</span>
                    <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.2 rounded font-bold">
                      Zero Guilt
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    You never have to give up Egusi, Ogbono, or Afang soup. See how swapping the swallow engine
                    instantly flattens blood sugar spikes, banishes the 2 PM food coma, and gives you all-day energy!
                  </p>
                </div>
              </div>

              {/* 1. Soup Pairing Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>🍲 Step 1: Pick Your Favorite Soup</span>
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                    {activeSoup.name}
                  </span>
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {POPULAR_SOUPS.map((soup) => (
                    <button
                      key={soup.id}
                      type="button"
                      onClick={() => {
                        try { triggerHaptic("light"); } catch {}
                        setSelectedSoupId(soup.id);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 border shrink-0 ${
                        selectedSoupId === soup.id
                          ? "bg-teal-700 text-white border-teal-800 shadow-xs"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>{soup.emoji}</span>
                      <span>{soup.name.split(" ")[0]} Soup</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Side-by-Side Swallow Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Traditional Swallow Selector */}
                <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-rose-800 dark:text-rose-300 flex items-center gap-1">
                      <Flame size={12} className="text-rose-500" />
                      Traditional Swallow:
                    </span>
                    <span className="text-[9px] bg-rose-200 dark:bg-rose-900/70 text-rose-900 dark:text-rose-200 px-1.5 py-0.5 rounded font-bold">
                      {activeTraditional.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {TRADITIONAL_SWALLOWS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          try { triggerHaptic("light"); } catch {}
                          setSelectedTraditionalId(s.id);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                          selectedTraditionalId === s.id
                            ? "bg-white dark:bg-zinc-800 border-rose-400 text-rose-950 dark:text-rose-100 shadow-2xs ring-1 ring-rose-400"
                            : "bg-white/60 dark:bg-zinc-900/50 border-rose-100 dark:border-rose-950 text-slate-600 dark:text-slate-400 hover:bg-white"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{s.emoji}</span>
                          <span className="truncate">{s.name}</span>
                        </span>
                        <span className="text-[10px] text-rose-600 font-extrabold shrink-0">
                          {s.carbs}g C
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Healthy Swallow Swap Selector */}
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      Healthy Swap Option:
                    </span>
                    <span className="text-[9px] bg-emerald-200 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                      {activeSwap.badge}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {HEALTHY_SWALLOW_SWAPS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          try { triggerHaptic("light"); } catch {}
                          setSelectedSwapId(s.id);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                          selectedSwapId === s.id
                            ? "bg-white dark:bg-zinc-800 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-2xs ring-1 ring-emerald-500"
                            : "bg-white/60 dark:bg-zinc-900/50 border-emerald-100 dark:border-emerald-950 text-slate-600 dark:text-slate-400 hover:bg-white"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{s.emoji}</span>
                          <span className="truncate">{s.name}</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-extrabold shrink-0">
                          {s.fiber}g Fiber
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Live Flattened Glycemic Comparison Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
                  <span className="text-[9.5px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1">
                    <ShieldCheck size={11} /> Swap Peak
                  </span>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {formatGlucose(peakSwap)}{" "}
                    <span className="text-[10px] font-bold text-slate-500">{unit}</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-semibold block">
                    Gentle Plateau (&lt;130)
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-center">
                  <span className="text-[9.5px] font-bold text-rose-800 dark:text-rose-300 flex items-center justify-center gap-1">
                    <Flame size={11} /> Standard Peak
                  </span>
                  <div className="text-base font-black text-rose-700 dark:text-rose-400 mt-0.5">
                    {formatGlucose(peakTraditional)}{" "}
                    <span className="text-[10px] font-bold text-slate-500">{unit}</span>
                  </div>
                  <span className="text-[9px] text-rose-600 font-semibold block">
                    Dangerous Surge
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-center">
                  <span className="text-[9.5px] font-bold text-teal-800 dark:text-teal-300 flex items-center justify-center gap-1">
                    <Sparkles size={11} /> Spike Lowered
                  </span>
                  <div className="text-base font-black text-teal-700 dark:text-teal-400 mt-0.5">
                    -{swallowReductionPct}%
                  </div>
                  <span className="text-[9px] text-teal-600 font-semibold block">
                    Δ -{formatGlucose(swallowDelta)} {unit}
                  </span>
                </div>
              </div>

              {/* 4. Live Morphing SVG Glycemic Excursion Graph */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 relative">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 px-1">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Clock size={12} /> Blood Sugar Trace (0 to 180 Minutes)
                  </span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                      {activeSwap.name.split(" ")[0]} Swap
                    </span>
                    <span className="flex items-center gap-1 text-rose-500 font-bold">
                      <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                      {activeTraditional.name.split(" ")[0]}
                    </span>
                  </div>
                </div>

                <div className="w-full overflow-hidden flex justify-center">
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto max-h-[210px] select-none"
                  >
                    <defs>
                      <linearGradient id="swallowSwapGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="swallowTradGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Safe Zone (70 - 140 mg/dL) */}
                    <rect
                      x={padding.left}
                      y={getY(140)}
                      width={graphWidth}
                      height={getY(70) - getY(140)}
                      fill="#10b981"
                      fillOpacity="0.08"
                    />

                    {/* Gridlines */}
                    {[80, 110, 140, 170, 200].map((val) => (
                      <g key={val}>
                        <line
                          x1={padding.left}
                          y1={getY(val)}
                          x2={width - padding.right}
                          y2={getY(val)}
                          stroke={val === 140 ? "#f59e0b" : "#94a3b8"}
                          strokeWidth={val === 140 ? 1.5 : 0.6}
                          strokeDasharray={val === 140 ? "4 3" : "2 2"}
                          opacity={val === 140 ? 0.8 : 0.25}
                        />
                        <text
                          x={padding.left - 6}
                          y={getY(val) + 3}
                          fontSize="9"
                          fill={val === 140 ? "#d97706" : "#64748b"}
                          textAnchor="end"
                          fontWeight={val === 140 ? "bold" : "normal"}
                        >
                          {val}
                        </text>
                      </g>
                    ))}

                    <text
                      x={width - padding.right - 4}
                      y={getY(140) - 5}
                      fontSize="8.5"
                      fontWeight="bold"
                      fill="#d97706"
                      textAnchor="end"
                    >
                      Safe Target: 140 mg/dL
                    </text>

                    {/* X-Axis Hour Labels */}
                    {[0, 30, 60, 90, 120, 150, 180].map((min) => (
                      <g key={min}>
                        <line
                          x1={getX(min)}
                          y1={height - padding.bottom}
                          x2={getX(min)}
                          y2={height - padding.bottom + 4}
                          stroke="#94a3b8"
                          strokeWidth="1"
                        />
                        <text
                          x={getX(min)}
                          y={height - padding.bottom + 14}
                          fontSize="9"
                          fill="#64748b"
                          textAnchor="middle"
                          fontWeight="medium"
                        >
                          {min === 0 ? "0m" : `${min}m`}
                        </text>
                      </g>
                    ))}

                    {/* Filled Gradient Areas */}
                    <path d={swallowTradArea} fill="url(#swallowTradGrad)" />
                    <path d={swallowSwapArea} fill="url(#swallowSwapGrad)" />

                    {/* Curve Lines */}
                    <path
                      d={swallowTradPath}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <path
                      d={swallowSwapPath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Active Scrubber Indicator Line */}
                    <line
                      x1={getX(swallowMinute)}
                      y1={padding.top}
                      x2={getX(swallowMinute)}
                      y2={height - padding.bottom}
                      stroke="#0f766e"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />

                    {/* Scrubber Dots */}
                    <circle
                      cx={getX(swallowMinute)}
                      cy={getY(currentSwallowPoint.standardGlucose)}
                      r="4.5"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <circle
                      cx={getX(swallowMinute)}
                      cy={getY(currentSwallowPoint.shieldedGlucose)}
                      r="5.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Minute Scrubber Slider */}
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">
                      Scrub Timeline:{" "}
                      <span className="text-teal-700 dark:text-teal-400 font-black">
                        {swallowMinute} mins post-meal
                      </span>
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-black bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg">
                      Δ -{currentSwallowPoint.diff} {unit} Lower
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="10"
                    value={swallowMinute}
                    onChange={(e) => {
                      try { triggerHaptic("light"); } catch {}
                      setSwallowMinute(Number(e.target.value));
                    }}
                    className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 px-0.5">
                    <span>0m (Eat)</span>
                    <span>30m</span>
                    <span>60m (Spike)</span>
                    <span>90m</span>
                    <span>120m (Crash Dip)</span>
                    <span>180m (Clear)</span>
                  </div>
                </div>
              </div>

              {/* 5. Consumer Bento Comparison: Energy, Fullness, Sugar & Guilt */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  How Your Body Feels: Side-by-Side Comparison
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Healthy Swap Benefit Bento */}
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <div className="flex items-center gap-1.5 font-black text-emerald-800 dark:text-emerald-300">
                      <Zap size={14} className="text-emerald-600" />
                      <span>{activeSwap.name.split(" ")[0]} Swap</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-500 block uppercase">
                          ⚡ Afternoon Energy
                        </span>
                        <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                          {activeSwap.energyFeel}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-500 block uppercase">
                          🧘 Satiety &amp; Fullness
                        </span>
                        <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                          {activeSwap.fullnessDuration}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-500 block uppercase">
                          📊 Blood Sugar Plateau
                        </span>
                        <span className="font-black text-emerald-700 dark:text-emerald-300">
                          {formatGlucose(peakSwap)} {unit} (100% In-Range)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Traditional Food Coma Bento */}
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-2">
                    <div className="flex items-center gap-1.5 font-black text-rose-800 dark:text-rose-300">
                      <Flame size={14} className="text-rose-500" />
                      <span>{activeTraditional.name.split(" ")[0]}</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-500 block uppercase">
                          💤 Afternoon Energy
                        </span>
                        <span className="font-semibold text-rose-900 dark:text-rose-200">
                          {activeTraditional.energyFeel}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-500 block uppercase">
                          ⚠️ Satiety &amp; Fullness
                        </span>
                        <span className="font-semibold text-rose-900 dark:text-rose-200">
                          {activeTraditional.fullnessDuration}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-500 block uppercase">
                          📈 Blood Sugar Peak
                        </span>
                        <span className="font-black text-rose-700 dark:text-rose-300">
                          {formatGlucose(peakTraditional)} {unit} (High Spike)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Avo Live Cultural Coaching Quote */}
              <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 rounded-2xl border border-teal-200 dark:border-teal-800/60 flex items-start gap-3">
                <Mascot gesture="pointing" size={38} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-black text-teal-900 dark:text-teal-200 block flex items-center gap-1">
                    Avo's Cultural Minute ({swallowMinute}m) 🥑
                  </span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {getAvoSwallowCommentary(swallowMinute)}
                  </p>
                </div>
              </div>

              {/* 7. Tactile 1-Tap Save Action Button */}
              <button
                type="button"
                disabled={isSavingSwallow}
                onClick={handleSaveSwallowSwapToPlan}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-[#126778] hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {isSavingSwallow ? (
                  <span>Saving Swap to Your Meal Plan...</span>
                ) : (
                  <>
                    <BookmarkCheck size={16} />
                    <span>Save {activeSwap.name} with {activeSoup.name.split(" ")[0]} to My Plan 🥑</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: 📈 STANDARD 3-HOUR CGM TRACE */}
          {activeTab === "curve" && (
            <>
              {/* Clinical Metric Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block flex items-center gap-1">
                    <ShieldCheck size={12} /> 9-Inch Peak
                  </span>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {formatGlucose(peakShielded)}{" "}
                    <span className="text-[10px] font-bold text-slate-500">{unit}</span>
                  </div>
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                    Safe Plateau (&lt;140)
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60">
                  <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block flex items-center gap-1">
                    <Flame size={12} /> Standard Meal Peak
                  </span>
                  <div className="text-base font-black text-rose-700 dark:text-rose-400 mt-0.5">
                    {formatGlucose(peakStandard)}{" "}
                    <span className="text-[10px] font-bold text-slate-500">{unit}</span>
                  </div>
                  <span className="text-[9.5px] text-rose-600 dark:text-rose-400 font-semibold block">
                    Hyperglycemic Spike
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60">
                  <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 block flex items-center gap-1">
                    <Sparkles size={12} /> Spike Blunted
                  </span>
                  <div className="text-base font-black text-teal-700 dark:text-teal-400 mt-0.5">
                    -{reductionPct}%
                  </div>
                  <span className="text-[9.5px] text-teal-600 dark:text-teal-400 font-semibold block">
                    50% Viscous Fiber Shield
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Glycemic Curve Graph */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800 relative">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 px-1">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Clock size={12} /> 0 to 180 Minutes CGM Trace
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                      9-Inch Plate
                    </span>
                    <span className="flex items-center gap-1 text-rose-500">
                      <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                      Unbalanced Plate
                    </span>
                  </div>
                </div>

                {/* SVG Visualizer */}
                <div className="w-full overflow-hidden flex justify-center">
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto max-h-[220px] select-none"
                  >
                    <defs>
                      <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="stdGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Target In-Range Safe Zone (70 - 140 mg/dL) */}
                    <rect
                      x={padding.left}
                      y={getY(140)}
                      width={graphWidth}
                      height={getY(70) - getY(140)}
                      fill="#10b981"
                      fillOpacity="0.08"
                    />

                    {/* Gridlines */}
                    {[80, 110, 140, 170, 200].map((val) => (
                      <g key={val}>
                        <line
                          x1={padding.left}
                          y1={getY(val)}
                          x2={width - padding.right}
                          y2={getY(val)}
                          stroke={val === 140 ? "#f59e0b" : "#94a3b8"}
                          strokeWidth={val === 140 ? 1.5 : 0.6}
                          strokeDasharray={val === 140 ? "4 3" : "2 2"}
                          opacity={val === 140 ? 0.8 : 0.25}
                        />
                        <text
                          x={padding.left - 6}
                          y={getY(val) + 3}
                          fontSize="9"
                          fill={val === 140 ? "#d97706" : "#64748b"}
                          textAnchor="end"
                          fontWeight={val === 140 ? "bold" : "normal"}
                        >
                          {val}
                        </text>
                      </g>
                    ))}

                    <text
                      x={width - padding.right - 4}
                      y={getY(140) - 5}
                      fontSize="8.5"
                      fontWeight="bold"
                      fill="#d97706"
                      textAnchor="end"
                    >
                      ADA Safe Target: 140 mg/dL
                    </text>

                    {/* X-Axis Hour Labels */}
                    {[0, 30, 60, 90, 120, 150, 180].map((min) => (
                      <g key={min}>
                        <line
                          x1={getX(min)}
                          y1={height - padding.bottom}
                          x2={getX(min)}
                          y2={height - padding.bottom + 4}
                          stroke="#94a3b8"
                          strokeWidth="1"
                        />
                        <text
                          x={getX(min)}
                          y={height - padding.bottom + 14}
                          fontSize="9"
                          fill="#64748b"
                          textAnchor="middle"
                          fontWeight="medium"
                        >
                          {min === 0 ? "0m" : `${min}m`}
                        </text>
                      </g>
                    ))}

                    {/* Shaded Areas */}
                    <path d={stdAreaPath} fill="url(#stdGrad)" />
                    <path d={shieldAreaPath} fill="url(#shieldGrad)" />

                    {/* Curve Lines */}
                    <path
                      d={stdPath}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d={shieldPath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />

                    {/* Active Scrubber Indicator Line */}
                    <line
                      x1={getX(selectedMinute)}
                      y1={padding.top}
                      x2={getX(selectedMinute)}
                      y2={height - padding.bottom}
                      stroke="#0f766e"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                    />

                    {/* Dot on Standard */}
                    <circle
                      cx={getX(selectedMinute)}
                      cy={getY(currentPoint.standardGlucose)}
                      r="4.5"
                      fill="#f43f5e"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Dot on Shielded */}
                    <circle
                      cx={getX(selectedMinute)}
                      cy={getY(currentPoint.shieldedGlucose)}
                      r="5.5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* Interactive Time Scrubber Slider */}
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">
                      Scrub Timeline:{" "}
                      <span className="text-teal-700 dark:text-teal-400 font-black">
                        {selectedMinute} mins post-meal
                      </span>
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-black bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg">
                      Δ -{currentPoint.diff} {unit} Lower
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="10"
                    value={selectedMinute}
                    onChange={(e) => {
                      try { triggerHaptic("light"); } catch {}
                      setSelectedMinute(Number(e.target.value));
                    }}
                    className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 px-0.5">
                    <span>0m (Eat)</span>
                    <span>30m</span>
                    <span>60m (Peak)</span>
                    <span>90m</span>
                    <span>120m</span>
                    <span>180m (Clear)</span>
                  </div>
                </div>
              </div>

              {/* Scrubber Reading Cards & Delta */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30">
                  <span className="text-[9.5px] font-bold text-emerald-800 dark:text-emerald-300 block">
                    🥗 9-Inch Plate at {selectedMinute}m
                  </span>
                  <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {formatGlucose(currentPoint.shieldedGlucose)} {unit}
                  </div>
                  <span className="text-[9px] text-emerald-600 font-semibold">
                    Buffered by 50% fiber gel
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-800/70 bg-rose-50/70 dark:bg-rose-950/30">
                  <span className="text-[9.5px] font-bold text-rose-800 dark:text-rose-300 block">
                    🍚 Standard Meal at {selectedMinute}m
                  </span>
                  <div className="text-sm font-black text-rose-700 dark:text-rose-400">
                    {formatGlucose(currentPoint.standardGlucose)} {unit}
                  </div>
                  <span className="text-[9px] text-rose-600 font-semibold">
                    Unbuffered carbohydrate surge
                  </span>
                </div>
              </div>

              {/* Science note */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                🔬 <strong>Why 50% Vegetables Matter:</strong> Soluble plant fibers (like Ugu,
                Okra mucilage, and Bitterleaf pectin) coat the small intestine microvilli, slowing
                alpha-amylase starch degradation and blunting postprandial glucose surges by up to
                <strong> 45%</strong>.
              </div>
            </>
          )}

          {/* TAB 3: 📡 HARDWARE CGM REAL-TIME TELEMETRY STREAM TAB */}
          {activeTab === "cgm" && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-teal-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Radio size={120} />
                </div>

                <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                      Bluetooth CGM Telemetry
                    </span>
                  </div>

                  <select
                    value={cgmDevice}
                    onChange={(e: any) => setCgmDevice(e.target.value)}
                    className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl border border-white/20 outline-none cursor-pointer"
                  >
                    <option value="Dexcom G7" className="text-slate-900">Dexcom G7</option>
                    <option value="FreeStyle Libre 3" className="text-slate-900">Abbott FreeStyle Libre 3</option>
                    <option value="Apple HealthKit" className="text-slate-900">Apple HealthKit Sync</option>
                  </select>
                </div>

                <div className="py-4 flex items-baseline justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Interstitial Glucose
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white tracking-tight">
                        {liveCgmValue}
                      </span>
                      <span className="text-xs font-bold text-teal-300">{unit}</span>
                      <span className="ml-2 text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        ➔ Flat &amp; Stable (+0.1/min)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      try { triggerHaptic("light"); } catch {}
                      setLiveCgmValue(Math.floor(98 + Math.random() * 15));
                      toast.info("Refreshed Bluetooth interstitial glucose sample.");
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-teal-300 border border-white/10 cursor-pointer"
                    title="Poll Sensor"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[9.5px] font-bold text-slate-400 uppercase">Time in Range</div>
                    <div className="text-sm font-black text-emerald-400">96%</div>
                    <div className="text-[8.5px] text-slate-400">70-140 mg/dL</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[9.5px] font-bold text-slate-400 uppercase">Estimated A1c</div>
                    <div className="text-sm font-black text-cyan-300">5.4%</div>
                    <div className="text-[8.5px] text-slate-400">Optimal</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[9.5px] font-bold text-slate-400 uppercase">Sensor Lifespan</div>
                    <div className="text-sm font-black text-amber-300">8.5 Days</div>
                    <div className="text-[8.5px] text-slate-400">Calibration OK</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setPostprandialGlucose(String(liveCgmValue));
                    setActiveTab("biomarkers");
                    toast.success(`Imported live CGM reading (${liveCgmValue} ${unit}) into postprandial PPG log!`);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-[#1f7a8c] hover:from-teal-700 hover:to-[#126778] text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <CheckCircle2 size={14} />
                  <span>Import {liveCgmValue} {unit} to 2-Hour Postprandial Log</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    schedulePostMealWalkAlert(mealName, 30);
                  }}
                  className="w-full py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-white border border-teal-200 dark:border-zinc-700 font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Footprints size={14} className="text-teal-600" />
                  <span>Arm 30-Min Postprandial Glucose Walk Timer 🚶‍♂️</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: 🩺 BIOMARKER LOGGING TAB */}
          {activeTab === "biomarkers" && (
            <form onSubmit={handleSaveBiomarkers} className="space-y-3.5">
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800/60 flex items-start gap-2.5">
                <Mascot gesture="thumbsup" size={32} className="shrink-0" />
                <div className="text-xs text-teal-900 dark:text-teal-200">
                  <span className="font-bold block">Calibrate With Real Bio-Feedback:</span>
                  Enter your blood sugar or blood pressure to compare your body's response against
                  the simulated 9-inch plate model.
                </div>
              </div>

              {/* Fasting Glucose Baseline */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Fasting Blood Sugar (FBS Baseline):</span>
                  <span className="text-[10px] text-slate-500 font-bold">{unit}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={fastingGlucose}
                    onChange={(e) => setFastingGlucose(e.target.value)}
                    placeholder="e.g. 92"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    {unit}
                  </span>
                </div>
              </div>

              {/* 2-Hour Postprandial Reading */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>2-Hour Postprandial Glucose (PPG):</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Goal: &lt;140 {unit}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={postprandialGlucose}
                    onChange={(e) => setPostprandialGlucose(e.target.value)}
                    placeholder="e.g. 118"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Blood Pressure Inputs */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Blood Pressure (Resting):</span>
                  <span className="text-[10px] text-slate-500 font-bold">mmHg</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value)}
                      placeholder="Systolic (e.g. 120)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400">
                      SYS
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value)}
                      placeholder="Diastolic (e.g. 80)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400">
                      DIA
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingLog}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingLog ? (
                  <span>Recording Biomarkers...</span>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Save to Clinical Health Log 🩺</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between shrink-0">
          <div className="text-[10px] text-slate-500 font-medium">
            Time in Healthy Range: <span className="font-bold text-emerald-600">98%</span> vs{" "}
            <span className="text-rose-500 font-bold">48%</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
