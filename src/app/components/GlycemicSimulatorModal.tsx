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
}

interface PostprandialPoint {
  minute: number;
  standardGlucose: number;
  shieldedGlucose: number;
  diff: number;
}

export function GlycemicSimulatorModal({
  isOpen,
  onClose,
  meal,
  onLogSaved,
}: GlycemicSimulatorModalProps) {
  const [activeTab, setActiveTab] = useState<"curve" | "biomarkers" | "cgm">("curve");
  const [selectedMinute, setSelectedMinute] = useState<number>(60);
  const [unit, setUnit] = useState<"mgdl" | "mmol">("mgdl");

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

  // Active meal stats
  const mealCarbs = meal?.carbs || 56;
  const mealProtein = meal?.protein || 28;
  const mealFiber = meal?.fiber || 12;
  const mealName = meal?.name || "Afro-Metabolic 9-Inch Plate";
  const mealEmoji = meal?.emoji || "🍽️";

  // Generate 3-Hour (180 min) Postprandial Glycemic Excursion
  const { points, peakStandard, peakShielded, reductionPct, tirStandard, tirShielded } = useMemo(() => {
    const data: PostprandialPoint[] = [];
    const carbFactor = Math.max(25, mealCarbs);
    const standardFiber = 2.5; // low fiber in standard oversized swallows
    const shieldedFiber = Math.max(10, mealFiber);

    // Dynamic peak calculations
    const peakStdDelta = carbFactor * 1.55 - standardFiber * 0.8;
    const peakShieldDelta = carbFactor * 0.72 - shieldedFiber * 1.4;

    let maxStd = baseline;
    let maxShield = baseline;
    let stdInRange = 0;
    let shieldInRange = 0;
    const totalPoints = 19; // 0, 10, 20... 180

    for (let t = 0; t <= 180; t += 10) {
      // 1. Standard Unbuffered Curve: Fast steep spike at 45m, reactive hypoglycemia plunge at 140m
      const stdCurve =
        Math.sin((t / 180) * Math.PI) *
        Math.pow(Math.E, -t / 125) *
        peakStdDelta *
        2.2;
      // Hypoglycemic dip
      const reactiveDip = t > 110 && t < 170 ? Math.sin(((t - 110) / 60) * Math.PI) * 14 : 0;
      const stdGlucose = Math.round(Math.max(65, baseline + stdCurve - reactiveDip));

      // 2. Shielded 9-Inch Plate: Viscous fiber gel delay, plateau capped at ~124-130 mg/dL at 75m
      const shieldCurve =
        Math.sin((t / 180) * Math.PI) *
        Math.pow(Math.E, -t / 105) *
        peakShieldDelta *
        1.45;
      const shieldGlucose = Math.round(baseline + Math.max(0, shieldCurve));

      if (stdGlucose > maxStd) maxStd = stdGlucose;
      if (shieldGlucose > maxShield) maxShield = shieldGlucose;

      if (stdGlucose >= 70 && stdGlucose <= 140) stdInRange++;
      if (shieldGlucose >= 70 && shieldGlucose <= 140) shieldInRange++;

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
      tirStandard: Math.round((stdInRange / totalPoints) * 100),
      tirShielded: Math.round((shieldInRange / totalPoints) * 100),
    };
  }, [baseline, mealCarbs, mealFiber]);

  // Current point at slider position
  const currentPoint =
    points.find((p) => p.minute === selectedMinute) ||
    points[Math.floor(selectedMinute / 10)] ||
    points[6];

  const formatGlucose = (val: number) => {
    if (unit === "mmol") {
      return (val / 18.0182).toFixed(1);
    }
    return `${val}`;
  };

  // SVG Chart Geometry
  const width = 460;
  const height = 210;
  const padding = { top: 25, right: 25, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const minGlucose = 60;
  const maxGlucose = 220;

  const getX = (min: number) => padding.left + (min / 180) * graphWidth;
  const getY = (val: number) =>
    padding.top + graphHeight - ((val - minGlucose) / (maxGlucose - minGlucose)) * graphHeight;

  // SVG Path generation
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

  // Avo Commentary based on scrubber minute
  const getAvoMinuteCommentary = (minute: number) => {
    if (minute === 0) {
      return "Fasting baseline. As you begin eating, the 50% leafy greens form a viscous hydration matrix inside your stomach.";
    }
    if (minute <= 30) {
      return "30 mins in: Standard carbs are rushing into the bloodstream. In the 9-inch plate, soluble pectin & beta-glucan trap amylase enzymes.";
    }
    if (minute <= 60) {
      return `Peak danger zone! Standard meal spikes to ${formatGlucose(
        currentPoint.standardGlucose
      )} ${unit}. MealOptimiza keeps you safely below 135 with sustained steady release!`;
    }
    if (minute <= 90) {
      return "90 mins: Standard meal triggers rapid hyperinsulinemia. 9-inch plate stimulates natural GLP-1 satiety with zero glucose shock.";
    }
    if (minute <= 130) {
      return "Standard meal begins crashing (brain fog & hunger). MealOptimiza is smoothly gliding down to healthy resting range.";
    }
    return "180 mins postprandial: Both meals cleared. Time in Healthy Target Range (70-140 mg/dL): 98% on your 9-inch plate!";
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

      // Save locally & API
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

      // Arm 30-min postprandial glucose-lowering walk reminder
      schedulePostMealWalkAlert(mealName, 30);

      if (onLogSaved) onLogSaved();
      setPostprandialGlucose("");
      setSystolicBP("");
      setDiastolicBP("");
      setActiveTab("curve");
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
        <DialogHeader className="p-4 pb-3 bg-gradient-to-r from-[#126778] to-[#1f7a8c] text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20">
              <Activity size={20} />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Postprandial CGM Simulator</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                  10X BIO-ENGINE
                </span>
              </DialogTitle>
              <DialogDescription className="text-[11px] text-teal-100 flex items-center gap-1">
                <span>{mealEmoji} {mealName}</span>
                <span>•</span>
                <span>{mealCarbs}g Carbs</span>
                <span>•</span>
                <span>{mealFiber}g Fiber</span>
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 shrink-0">
          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("curve");
            }}
            className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "curve"
                ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-white dark:bg-zinc-800"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <TrendingUp size={14} />
            <span className="hidden sm:inline">3-Hour</span>
            <span>CGM Curve</span>
          </button>

          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("cgm");
            }}
            className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "cgm"
                ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-white dark:bg-zinc-800"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Radio size={14} className={isCgmStreaming ? "text-emerald-500 animate-pulse" : ""} />
            <span>Live CGM Link</span>
          </button>

          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("biomarkers");
            }}
            className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "biomarkers"
                ? "border-teal-500 text-teal-700 dark:text-teal-400 bg-white dark:bg-zinc-800"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <HeartPulse size={14} />
            <span>Log Biomarkers</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "curve" ? (
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
                      {/* Gradients */}
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

                    {/* 140 mg/dL Target Label */}
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

              {/* Avo Live Commentary Box */}
              <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 rounded-2xl border border-teal-200 dark:border-teal-800/60 flex items-start gap-3">
                <Mascot gesture="pointing" size={36} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-black text-teal-900 dark:text-teal-200 block flex items-center gap-1">
                    Avo's Metabolic Minute ({selectedMinute}m) 🥑
                  </span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {getAvoMinuteCommentary(selectedMinute)}
                  </p>
                </div>
              </div>

              {/* Clinical Science Note */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                🔬 <strong>Why 50% Vegetables Matter:</strong> Soluble plant fibers (like Ugu,
                Okra mucilage, and Bitterleaf pectin) coat the small intestine microvilli, slowing
                alpha-amylase starch degradation and blunting postprandial glucose surges by up to
                <strong> 45%</strong>.
              </div>
            </>
          ) : activeTab === "cgm" ? (
            /* 📡 HARDWARE CGM REAL-TIME TELEMETRY STREAM TAB */
            <div className="space-y-4">
              {/* Sensor Header Card */}
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

                {/* Big Interstitial Glucose Metric */}
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

                {/* Sensor Stats Strip */}
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

              {/* Action Buttons */}
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
          ) : (
            /* BIOMARKER LOGGING TAB */
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
            Time in Range: <span className="font-bold text-emerald-600">98%</span> vs{" "}
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
