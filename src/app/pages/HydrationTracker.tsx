import React, { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router";
import {
  Droplets,
  Plus,
  Minus,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Coffee,
  Wine,
  Flame,
  Activity,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Leaf,
  ChevronRight,
  ArrowLeft,
  Share2,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import Mascot from "../components/Mascot";
import { SkeletonList } from '../components/SkeletonLoader';
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { getHydrationLogs, createHydrationLog, deleteHydrationLog } from "../../lib/api";
import { celebrate, triggerConfetti, triggerHaptic } from "../components/celebrate";
import { motion } from "motion/react";

type HydrationLog = {
  id: string;
  timestamp: string;
  amount: number;
  type: 'water' | 'zobo' | 'coconut' | 'tea' | 'ginger_lemon' | 'coffee' | 'other';
};

type HydrationData = {
  date: string;
  logs: HydrationLog[];
  totalIntake: number;
};

// 10X Everyday African & Diaspora Beverage Presets
const HEALTHY_BEVERAGES = [
  {
    type: "water" as const,
    name: "Pure Water Glass",
    amount: 250,
    icon: "💧",
    desc: "1 Standard Glass (250ml)",
    benefit: "Essential body hydration & blood sugar balance",
    badge: "Daily Core",
    bg: "from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    type: "water" as const,
    name: "Water Bottle / Sachet",
    amount: 500,
    icon: "🧴",
    desc: "1 Bottle or Sachet (500ml)",
    benefit: "Deep hydration for hot days & workouts",
    badge: "Best Value",
    bg: "from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40",
    border: "border-teal-200 dark:border-teal-800",
  },
  {
    type: "zobo" as const,
    name: "Unsweetened Zobo Tea",
    amount: 300,
    icon: "🌺",
    desc: "Hibiscus Brew (300ml)",
    benefit: "Rich in antioxidants • Helps ease high blood pressure",
    badge: "BP Shield 🛡️",
    bg: "from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40",
    border: "border-rose-200 dark:border-rose-800",
  },
  {
    type: "coconut" as const,
    name: "Fresh Coconut Water",
    amount: 300,
    icon: "🥥",
    desc: "Natural Coconut (300ml)",
    benefit: "Natural potassium • Restores energy without sugar crash",
    badge: "Electrolytes ⚡",
    bg: "from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40",
    border: "border-amber-200 dark:border-amber-800",
  },
  {
    type: "ginger_lemon" as const,
    name: "Ginger & Lemon Water",
    amount: 250,
    icon: "🍋",
    desc: "Warm Infusion (250ml)",
    benefit: "Soothes digestion • Flushes heavy swallow bloat",
    badge: "Anti-Bloat 🌿",
    bg: "from-lime-50 to-emerald-50 dark:from-lime-950/40 dark:to-emerald-950/40",
    border: "border-lime-200 dark:border-lime-800",
  },
  {
    type: "tea" as const,
    name: "Green or Herbal Tea",
    amount: 250,
    icon: "🍵",
    desc: "Herbal Cup (250ml)",
    benefit: "Boosts metabolism & calm mental focus",
    badge: "Antioxidants 🍃",
    bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  },
];

const generateHourlyData = (logs: HydrationLog[]) => {
  const data = [];
  const now = new Date();

  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
    const hour = time.getHours();
    const hourStart = new Date(time);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 2);

    const hourIntake = logs
      .filter((log) => {
        const logTime = new Date(log.timestamp);
        return logTime >= hourStart && logTime < hourEnd;
      })
      .reduce((sum, log) => sum + log.amount, 0);

    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "numeric", hour12: true }),
      intake: hourIntake,
    });
  }

  return data;
};

export default function HydrationTracker() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const uniqueId = useId();
  const today = new Date().toISOString().split("T")[0];

  const [hydrationData, setHydrationData] = useState<HydrationData>({
    date: today,
    logs: [],
    totalIntake: 0,
  });
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Daily target: 2,500ml (~10 glasses)
  const dailyGoal = 2500;
  const glassesCount = Math.round(hydrationData.totalIntake / 250);
  const goalGlasses = 10;

  // Load today's logs from API on mount
  useEffect(() => {
    getHydrationLogs()
      .then((items: any[]) => {
        const todayLogs: HydrationLog[] = (items ?? [])
          .filter((item) => (item.logged_at ?? "").startsWith(today))
          .map((item) => ({
            id: item.id,
            timestamp: item.logged_at,
            amount: item.amount_ml,
            type: (item.type as HydrationLog["type"]) ?? "water",
          }));
        const total = todayLogs.reduce((sum, l) => sum + l.amount, 0);
        setHydrationData({ date: today, logs: todayLogs, totalIntake: total });
      })
      .catch((err: any) => setLogsError(err.message ?? "Could not load hydration logs"))
      .finally(() => setLogsLoading(false));
  }, [today]);

  const logWater = async (amount: number, type: HydrationLog["type"] = "water", name: string = "Water") => {
    try {
      triggerHaptic("medium");
      const item = await createHydrationLog({
        amount_ml: amount,
        type,
        logged_at: new Date().toISOString(),
      });
      const newLog: HydrationLog = {
        id: item.id,
        timestamp: item.logged_at,
        amount: item.amount_ml,
        type: (item.type as HydrationLog["type"]) ?? type,
      };
      const updatedTotal = hydrationData.totalIntake + newLog.amount;
      setHydrationData((prev) => ({
        ...prev,
        logs: [...prev.logs, newLog],
        totalIntake: updatedTotal,
      }));

      if (updatedTotal >= dailyGoal && hydrationData.totalIntake < dailyGoal) {
        celebrate("Goal Achieved! 💧🎉", "You drank your full 2,500ml daily target today!", {
          confettiStyle: "cannons",
          hapticPattern: "milestone",
        });
      } else {
        celebrate(`${name} Logged! 💧`, `+${amount}ml added (${Math.round((updatedTotal / dailyGoal) * 100)}% of goal)`, {
          confetti: false,
          hapticPattern: "light",
        });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Could not save drink log");
    }
  };

  const removeLastLog = async () => {
    if (hydrationData.logs.length === 0) return;

    const lastLog = hydrationData.logs[hydrationData.logs.length - 1];
    try {
      triggerHaptic("light");
      await deleteHydrationLog(lastLog.id);
      setHydrationData((prev) => ({
        ...prev,
        logs: prev.logs.slice(0, -1),
        totalIntake: Math.max(0, prev.totalIntake - lastLog.amount),
      }));
      toast.info("Last drink removed");
    } catch (err: any) {
      toast.error(err.message ?? "Could not remove entry");
    }
  };

  const progressPercentage = Math.min((hydrationData.totalIntake / dailyGoal) * 100, 100);
  const chartData = generateHourlyData(hydrationData.logs);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-cyan-900/40 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <Droplets size={16} className="text-cyan-400 animate-pulse" />
              <h1 className="text-base font-black text-white tracking-wide">
                Hydration &amp; Body Cleanse
              </h1>
            </div>
            <span className="text-[10.5px] text-cyan-300 font-bold">
              Flush Stew Salt • Steady Blood Pressure • Energy
            </span>
          </div>
        </div>

        {/* Glasses Count Pill */}
        <div className="flex items-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-xl text-xs font-black">
          <Droplets size={13} className="text-cyan-400" />
          <span>{glassesCount} / {goalGlasses} Glasses</span>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-xl mx-auto">
        {/* API error banner */}
        {logsError && (
          <div className="bg-red-950/50 border border-red-500/30 rounded-2xl p-3 flex items-center gap-3 text-red-200 text-xs">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{logsError}</span>
          </div>
        )}

        {/* 10X HERO PROGRESS CARD WITH AVO MASCOT */}
        <div className="bg-gradient-to-br from-[#0c2a33] via-[#093540] to-slate-950 rounded-3xl p-5 border-2 border-cyan-400/40 shadow-2xl relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 mb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
                Daily Goal: 2,500ml (~10 Glasses)
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                {hydrationData.totalIntake} <span className="text-sm font-bold text-cyan-300">ml Logged</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {progressPercentage >= 100
                  ? "🎉 Amazing! Your body is fully hydrated and kidneys are happy."
                  : `${Math.round(dailyGoal - hydrationData.totalIntake)}ml remaining to reach today's target`}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center">
              <Mascot gesture={progressPercentage >= 100 ? "celebrate" : "wave"} size={68} />
              <span className="text-[10px] font-black text-cyan-300 mt-1">
                {Math.round(progressPercentage)}% Cleanse
              </span>
            </div>
          </div>

          {/* Liquid Progress Bar */}
          <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {/* Quick 4-Step Milestone Markers */}
          <div className="grid grid-cols-4 gap-1 mt-2 text-center text-[10px] font-bold text-slate-400">
            <span className={hydrationData.totalIntake >= 625 ? "text-cyan-300 font-black" : ""}>Morning Wake (25%)</span>
            <span className={hydrationData.totalIntake >= 1250 ? "text-cyan-300 font-black" : ""}>Lunch Buffer (50%)</span>
            <span className={hydrationData.totalIntake >= 1875 ? "text-cyan-300 font-black" : ""}>Afternoon Walk (75%)</span>
            <span className={hydrationData.totalIntake >= 2500 ? "text-emerald-300 font-black" : ""}>Goal (100% 🏆)</span>
          </div>
        </div>

        {/* 10X QUICK DRINK LOGGING SHELF (AFRICAN & CLEAN PRESETS) */}
        <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" />
                <span>1-Tap Healthy Drinks &amp; Water</span>
              </h3>
              <p className="text-[10.5px] text-slate-400">Tap any drink to add it directly to today's log</p>
            </div>
            {hydrationData.logs.length > 0 && (
              <button
                onClick={removeLastLog}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-950/60 border border-red-900/60 px-2 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1"
              >
                <RotateCcw size={10} />
                <span>Undo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {HEALTHY_BEVERAGES.map((bev) => (
              <button
                key={bev.name}
                type="button"
                onClick={() => logWater(bev.amount, bev.type, bev.name)}
                className="p-3 bg-slate-950/80 hover:bg-cyan-950/50 border border-cyan-900/40 hover:border-cyan-400 rounded-2xl text-left transition-all flex flex-col justify-between min-h-[110px] cursor-pointer shadow-sm group active:scale-95"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl">{bev.icon}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    +{bev.amount}ml
                  </span>
                </div>

                <div className="my-1">
                  <div className="text-xs font-black text-white group-hover:text-cyan-200 leading-tight">
                    {bev.name}
                  </div>
                  <div className="text-[9.5px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                    {bev.benefit}
                  </div>
                </div>

                <div className="text-[9px] font-bold text-amber-300 flex items-center gap-1">
                  <span>{bev.badge}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4 METABOLIC SUPERPOWER CARDS (EXPLAINED IN EASY EVERYDAY LANGUAGE) */}
        <div className="bg-slate-900/90 border border-teal-500/20 rounded-3xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <div>
              <h3 className="text-sm font-black text-white">Why Drinking Water Protects Your Health</h3>
              <p className="text-[10.5px] text-slate-400">Simple facts for your daily meals and energy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Benefit 1 */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-2.5">
              <span className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0 text-lg">
                🧂
              </span>
              <div>
                <h4 className="text-xs font-black text-emerald-200">Flushes Stew &amp; Soup Salt</h4>
                <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5">
                  Helps your kidneys wash away excess sodium from savory soups, keeping your blood pressure calm and relaxed.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-2.5">
              <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl shrink-0 text-lg">
                🍲
              </span>
              <div>
                <h4 className="text-xs font-black text-amber-200">Smooth Swallow Digestion</h4>
                <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5">
                  Water softens heavy swallows like pounded yam, eba, and fufu so your stomach digests them without heaviness or bloat.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-2.5">
              <span className="p-2 bg-blue-500/20 text-blue-300 rounded-xl shrink-0 text-lg">
                🩸
              </span>
              <div>
                <h4 className="text-xs font-black text-blue-200">Buffers Blood Sugar Spikes</h4>
                <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5">
                  Drinking water naturally dilutes sugar concentration in your bloodstream after carbohydrate-rich meals.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-2.5">
              <span className="p-2 bg-purple-500/20 text-purple-300 rounded-xl shrink-0 text-lg">
                ⚡
              </span>
              <div>
                <h4 className="text-xs font-black text-purple-200">Stops 3 PM Afternoon Fatigue</h4>
                <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5">
                  Most afternoon headaches and sleepiness in warm weather are mild dehydration. One cool glass brings back instant energy!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TODAY'S INTAKE PATTERN TIMELINE */}
        <div className="bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Clock size={15} className="text-cyan-400" />
              <span>Today's Hydration Flow</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">
              {hydrationData.logs.length} Drink{hydrationData.logs.length === 1 ? "" : "s"} Logged
            </span>
          </div>

          {hydrationData.logs.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              No drinks logged yet today. Tap a drink above to get started! 💧
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {[...hydrationData.logs].reverse().map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-white/5 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {log.type === "zobo" ? "🌺" : log.type === "coconut" ? "🥥" : log.type === "ginger_lemon" ? "🍋" : log.type === "tea" ? "🍵" : "💧"}
                    </span>
                    <div>
                      <span className="font-bold text-white uppercase text-[11px]">{log.type.replace("_", " ")}</span>
                      <span className="text-slate-400 text-[10px] ml-2">
                        {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-cyan-300">+{log.amount}ml</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

