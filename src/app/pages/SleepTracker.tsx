import React, { useState, useEffect, useId, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Moon,
  Sun,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Heart,
  AlertCircle,
  CheckCircle,
  Plus,
  Calendar,
  Info,
  Sparkles,
  ShieldCheck,
  Flame,
  Check,
  ChevronLeft,
  Activity,
  BedDouble,
  Coffee,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import BottomNav from "../components/BottomNav";
import { SkeletonList } from "../components/SkeletonLoader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useMascot } from "../hooks/useMascot";
import Mascot from "../components/Mascot";
import { getSleepLogs, createSleepLog } from "../../lib/api";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

type SleepStage = "deep" | "light" | "rem" | "awake";

type SleepSession = {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  totalMinutes: number;
  stages: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
  quality: number;
  mood: "excellent" | "good" | "fair" | "poor";
  notes?: string;
};

const SLEEP_STAGE_INFO = {
  deep: { labelKey: "sleep.stageDeep", color: "#3b82f6", descKey: "sleep.descDeep" },
  light: { labelKey: "sleep.stageLight", color: "#60a5fa", descKey: "sleep.descLight" },
  rem: { labelKey: "sleep.stageRem", color: "#a78bfa", descKey: "sleep.descRem" },
  awake: { labelKey: "sleep.stageAwake", color: "#f59e0b", descKey: "sleep.descAwake" },
};

// Realistic baseline preview dataset for users with 0 logged sessions
const PREVIEW_SLEEP_SESSIONS: SleepSession[] = [
  { id: "prev-6", date: "Mon", bedtime: "23:00", wakeTime: "07:00", totalMinutes: 480, stages: { deep: 95, light: 245, rem: 115, awake: 25 }, quality: 82, mood: "excellent" },
  { id: "prev-5", date: "Tue", bedtime: "23:30", wakeTime: "07:00", totalMinutes: 450, stages: { deep: 80, light: 240, rem: 105, awake: 25 }, quality: 78, mood: "good" },
  { id: "prev-4", date: "Wed", bedtime: "00:00", wakeTime: "06:30", totalMinutes: 390, stages: { deep: 65, light: 215, rem: 85, awake: 25 }, quality: 68, mood: "fair" },
  { id: "prev-3", date: "Thu", bedtime: "22:45", wakeTime: "07:00", totalMinutes: 495, stages: { deep: 100, light: 255, rem: 115, awake: 25 }, quality: 85, mood: "excellent" },
  { id: "prev-2", date: "Fri", bedtime: "23:15", wakeTime: "07:15", totalMinutes: 480, stages: { deep: 90, light: 250, rem: 115, awake: 25 }, quality: 80, mood: "good" },
  { id: "prev-1", date: "Sat", bedtime: "23:45", wakeTime: "08:15", totalMinutes: 510, stages: { deep: 105, light: 260, rem: 120, awake: 25 }, quality: 88, mood: "excellent" },
  { id: "prev-0", date: "Sun", bedtime: "22:30", wakeTime: "06:30", totalMinutes: 480, stages: { deep: 95, light: 245, rem: 115, awake: 25 }, quality: 84, mood: "excellent" },
];

const mapApiItem = (item: any): SleepSession => {
  const start = new Date(item.sleep_start);
  const end = new Date(item.sleep_end);
  const totalMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
  const deepMinutes = totalMinutes * 0.20;
  const remMinutes = totalMinutes * 0.24;
  const awakeMinutes = totalMinutes * 0.05;
  const lightMinutes = totalMinutes - deepMinutes - remMinutes - awakeMinutes;
  const quality = item.quality ?? Math.round(
    (deepMinutes / totalMinutes) * 100 * 0.4 +
    (remMinutes / totalMinutes) * 100 * 0.3 +
    (1 - awakeMinutes / totalMinutes) * 100 * 0.3
  );
  return {
    id: item.id,
    date: start.toISOString().split("T")[0],
    bedtime: start.toTimeString().slice(0, 5),
    wakeTime: end.toTimeString().slice(0, 5),
    totalMinutes,
    stages: {
      deep: Math.round(deepMinutes),
      light: Math.round(lightMinutes),
      rem: Math.round(remMinutes),
      awake: Math.round(awakeMinutes),
    },
    quality,
    mood: quality >= 80 ? "excellent" : quality >= 65 ? "good" : quality >= 50 ? "fair" : "poor",
    notes: item.notes,
  };
};

export default function SleepTracker() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const mascot = useMascot();

  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    bedtime: "23:00",
    wakeTime: "07:00",
    mood: "good" as SleepSession["mood"],
    notes: "",
  });

  useEffect(() => {
    getSleepLogs()
      .then((items: any[]) => {
        const sessions = (items ?? []).map(mapApiItem);
        sessions.sort((a, b) => a.date.localeCompare(b.date));
        setSleepSessions(sessions);
      })
      .catch((err: any) => setLogsError(err.message ?? t("sleep.loadError")))
      .finally(() => setLogsLoading(false));
  }, []);

  const isUsingPreview = sleepSessions.length === 0;
  const activeSessions = isUsingPreview ? PREVIEW_SLEEP_SESSIONS : sleepSessions;
  const last7Days = activeSessions.slice(-7);

  const avgQuality = useMemo(() => {
    if (activeSessions.length === 0) return 0;
    return activeSessions.reduce((sum, s) => sum + s.quality, 0) / activeSessions.length;
  }, [activeSessions]);

  const avgDurationHours = useMemo(() => {
    if (activeSessions.length === 0) return 0;
    const totalMins = activeSessions.reduce((sum, s) => sum + s.totalMinutes, 0) / activeSessions.length;
    return Number((totalMins / 60).toFixed(1));
  }, [activeSessions]);

  const todaySession = sleepSessions.find((s) => s.date === new Date().toISOString().split("T")[0]);

  // 1-Tap Quick Sleep Logger
  const handleQuickLogPreset = async (preset: { bedtime: string; wakeTime: string; hours: number; mood: SleepSession["mood"] }) => {
    const today = new Date().toISOString().split("T")[0];
    const sleepStart = new Date(`${today}T${preset.bedtime}:00`).toISOString();
    const sleepEnd = new Date(`${today}T${preset.wakeTime}:00`).toISOString();
    const totalMinutes = preset.hours * 60;
    const deepMinutes = totalMinutes * 0.22;
    const remMinutes = totalMinutes * 0.25;
    const awakeMinutes = totalMinutes * 0.04;

    const quality = Math.round(
      (deepMinutes / totalMinutes) * 100 * 0.4 +
      (remMinutes / totalMinutes) * 100 * 0.3 +
      (1 - awakeMinutes / totalMinutes) * 100 * 0.3
    );

    triggerHaptic("medium");
    mascot.write();
    try {
      const item = await createSleepLog({
        sleep_start: sleepStart,
        sleep_end: sleepEnd,
        quality,
        notes: `Quick logged ${preset.hours}h sleep (${preset.mood})`,
      });
      const newSession = mapApiItem(item);
      setSleepSessions((prev) => {
        const filtered = prev.filter((s) => s.date !== newSession.date);
        return [...filtered, newSession].sort((a, b) => a.date.localeCompare(b.date));
      });
      triggerConfetti("burst");
      mascot.jump();
      toast.success("Sleep logged successfully! 🌙");
    } catch (err: any) {
      toast.error(err.message ?? "Could not save sleep log");
    }
  };

  const handleAddSleep = async () => {
    const bedtimeParts = formData.bedtime.split(":");
    const wakeTimeParts = formData.wakeTime.split(":");
    const bedtimeMinutes = parseInt(bedtimeParts[0]) * 60 + parseInt(bedtimeParts[1]);
    const wakeTimeMinutes = parseInt(wakeTimeParts[0]) * 60 + parseInt(wakeTimeParts[1]);

    const sleepStart = new Date(`${formData.date}T${formData.bedtime}:00`).toISOString();
    const wakeDateStr =
      wakeTimeMinutes < bedtimeMinutes
        ? new Date(new Date(formData.date).getTime() + 86400000).toISOString().split("T")[0]
        : formData.date;
    const sleepEnd = new Date(`${wakeDateStr}T${formData.wakeTime}:00`).toISOString();

    let totalMinutes = wakeTimeMinutes - bedtimeMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;

    const deepMinutes = totalMinutes * (0.18 + Math.random() * 0.08);
    const remMinutes = totalMinutes * (0.22 + Math.random() * 0.08);
    const awakeMinutes = totalMinutes * (0.03 + Math.random() * 0.04);

    const quality = Math.round(
      (deepMinutes / totalMinutes) * 100 * 0.4 +
      (remMinutes / totalMinutes) * 100 * 0.3 +
      (1 - awakeMinutes / totalMinutes) * 100 * 0.3
    );

    setSaving(true);
    try {
      mascot.write();
      const item = await createSleepLog({
        sleep_start: sleepStart,
        sleep_end: sleepEnd,
        quality,
        notes: formData.notes,
      });
      const newSession = mapApiItem(item);
      setSleepSessions((prev) => {
        const filtered = prev.filter((s) => s.date !== newSession.date);
        return [...filtered, newSession].sort((a, b) => a.date.localeCompare(b.date));
      });
      triggerConfetti("burst");
      mascot.jump();
      toast.success(t("sleep.logged"));
      setShowAddDialog(false);
    } catch (err: any) {
      toast.error(err.message ?? t("sleep.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const chartData = last7Days.map((session, index) => ({
    id: `sleep-${index}`,
    day: session.date.includes("-")
      ? new Date(session.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })
      : session.date,
    hours: Number((session.totalMinutes / 60).toFixed(1)),
    quality: session.quality,
    deep: Number((session.stages.deep / 60).toFixed(1)),
    light: Number((session.stages.light / 60).toFixed(1)),
    rem: Number((session.stages.rem / 60).toFixed(1)),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-slate-100 pb-28">
      {/* Top Header */}
      <div className="bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 pt-9 pb-5 border-b border-indigo-500/20 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-indigo-200 hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight flex items-center gap-2">
                <span>{t("sleep.title")}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Circadian Hub
                </span>
              </h1>
              <p className="text-xs text-indigo-200/80 font-medium">
                Metabolic Recovery &amp; Overnight Glucose Optimization
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic("light");
              setShowAddDialog(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-2.5 shadow-md shadow-indigo-900/50 transition-all cursor-pointer active:scale-95 flex items-center gap-1 text-xs font-bold px-3.5"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Log Sleep</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Body */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-5 space-y-5">
        {/* API error banner */}
        {logsError && (
          <div className="bg-red-950/80 border border-red-500/50 rounded-2xl p-4 flex items-center gap-3 text-red-200 text-xs shadow-xs">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{logsError}</span>
          </div>
        )}

        {/* 🥑 10X Animated Avo Sleep Scientist Card */}
        <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-indigo-400/30 relative overflow-hidden flex items-center justify-between gap-4">
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <Mascot size={68} className="shrink-0 drop-shadow-lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full shadow-2xs">
                  Avo Sleep &amp; Glucose Lab
                </span>
                <span className="text-[10px] text-indigo-300 font-bold hidden sm:inline">Circadian Health</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                Overnight Insulin &amp; Deep REM Recovery
              </h3>
              <p className="text-[11px] sm:text-xs text-indigo-100/90 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                "Getting 7.5+ hours lowers morning cortisol and prevents post-breakfast glucose spikes by up to 28%."
              </p>
            </div>
          </div>
        </div>

        {/* 🌙 10X Hero Sleep Recovery Gauge & Score Card */}
        <div className="bg-slate-900/90 rounded-3xl border border-indigo-500/30 p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            {/* Left: Score Gauge */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 p-1 shadow-lg shadow-indigo-950">
                <div className="h-full w-full bg-slate-950 rounded-full flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white leading-none">
                    {Math.round(avgQuality)}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mt-0.5">
                    Score
                  </span>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-1 border border-indigo-500/30">
                  <Moon size={13} />
                  <span>7-Day Quality Index</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {avgQuality >= 80 ? "Optimal Metabolic Recovery 🌟" : avgQuality >= 65 ? "Good Sleep Rhythm 🛌" : "Needs Optimization 😴"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Avg Duration: <strong className="text-white">{avgDurationHours} hrs / night</strong>
                </p>
              </div>
            </div>

            {/* Right: Quick Recommendation Pill */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1 max-w-xs">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                <Sparkles size={13} />
                <span>Tonight's Circadian Window</span>
              </div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>🌙 10:30 PM</span>
                <span>→</span>
                <span>☀️ 06:30 AM</span>
              </div>
              <p className="text-[10px] text-slate-400">Target: 8.0 Hours for optimal deep REM repair</p>
            </div>
          </div>

          {isUsingPreview && (
            <div className="mt-4 p-2.5 bg-indigo-950/70 border border-indigo-500/40 rounded-xl text-center text-xs text-indigo-200 flex items-center justify-center gap-2">
              <Info size={14} className="text-indigo-400 shrink-0" />
              <span>Showing sample recovery benchmark. Tap below to log last night's real sleep!</span>
            </div>
          )}
        </div>

        {/* ⚡ 1-Tap Quick Sleep Presets */}
        <div className="bg-slate-900/90 rounded-3xl border border-indigo-500/30 p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>⚡ 1-Tap Quick Sleep Logger</span>
              </h2>
              <p className="text-xs text-slate-400">Log last night with one touch</p>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Custom Time ⏱️
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleQuickLogPreset({ bedtime: "23:00", wakeTime: "07:00", hours: 8.0, mood: "excellent" })}
              className="bg-slate-800/90 hover:bg-indigo-900/60 border border-indigo-500/30 hover:border-indigo-400 rounded-2xl p-3 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="text-xs font-black text-white flex items-center justify-between">
                <span>🌙 11:00 PM → 07:00 AM</span>
                <span className="text-base group-hover:scale-110 transition-transform">🤩</span>
              </div>
              <div className="text-[11px] text-indigo-300 font-bold mt-1">8.0 hrs • Fully Rested</div>
            </button>

            <button
              onClick={() => handleQuickLogPreset({ bedtime: "23:30", wakeTime: "07:00", hours: 7.5, mood: "good" })}
              className="bg-slate-800/90 hover:bg-indigo-900/60 border border-indigo-500/30 hover:border-indigo-400 rounded-2xl p-3 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="text-xs font-black text-white flex items-center justify-between">
                <span>🌙 11:30 PM → 07:00 AM</span>
                <span className="text-base group-hover:scale-110 transition-transform">😊</span>
              </div>
              <div className="text-[11px] text-indigo-300 font-bold mt-1">7.5 hrs • Good Rhythm</div>
            </button>

            <button
              onClick={() => handleQuickLogPreset({ bedtime: "00:00", wakeTime: "06:30", hours: 6.5, mood: "fair" })}
              className="bg-slate-800/90 hover:bg-indigo-900/60 border border-indigo-500/30 hover:border-indigo-400 rounded-2xl p-3 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="text-xs font-black text-white flex items-center justify-between">
                <span>🌙 12:00 AM → 06:30 AM</span>
                <span className="text-base group-hover:scale-110 transition-transform">🥱</span>
              </div>
              <div className="text-[11px] text-indigo-300 font-bold mt-1">6.5 hrs • Slight Fatigue</div>
            </button>
          </div>
        </div>

        {/* 📊 7-Day Sleep Duration & Stage Breakdown Chart */}
        <div className="bg-slate-900/90 rounded-3xl border border-indigo-500/30 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <BarChart className="h-4 w-4 text-indigo-400" />
                <span>7-Day Sleep Duration &amp; Rhythm</span>
              </h3>
              <p className="text-xs text-slate-400">Total hours logged per night</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> Deep
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-purple-400" /> REM
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-400" /> Light
              </span>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#6366f1",
                    borderRadius: "1rem",
                    fontSize: "12px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="deep" name="Deep Sleep (h)" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="rem" name="REM Sleep (h)" stackId="a" fill="#a78bfa" radius={[0, 0, 0, 0]} />
                <Bar dataKey="light" name="Light Sleep (h)" stackId="a" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🍲 African Meal & Metabolic Sleep Advisory */}
        <div className="bg-slate-900/90 rounded-3xl border border-indigo-500/30 p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center gap-2 text-indigo-300 font-black text-sm">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
            <span>Cultural Metabolic Sleep Advisory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-3.5 text-xs space-y-1">
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <span>🍲 Late Heavy Starch Rule</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Avoid heavy yam, eba, or oily stew past <strong>8:30 PM</strong>. High nocturnal digestive demand delays deep restorative stage 3 sleep.
              </p>
            </div>

            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-3.5 text-xs space-y-1">
              <div className="font-black text-emerald-300 flex items-center gap-1.5">
                <span>🍵 Calming Herbal Infusions</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Unsweetened Lemongrass, Chamomile, or warm Zobo tea 45 mins before bedtime relaxes vascular tension and supports melatonin release.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Sleep Sessions List */}
        <div className="bg-slate-900/90 rounded-3xl border border-indigo-500/30 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm sm:text-base font-black text-white">Recent Sleep Logs</h3>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
              {sleepSessions.length} Logged
            </span>
          </div>

          {sleepSessions.length === 0 ? (
            <div className="text-center py-6 text-slate-400 space-y-2">
              <Moon className="h-8 w-8 mx-auto text-indigo-400/50" />
              <p className="text-xs font-bold text-slate-300">No real logs recorded yet</p>
              <p className="text-[11px] text-slate-500">Tap "Log Sleep" above to start your personalized recovery tracker!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sleepSessions.slice().reverse().map((session) => (
                <div
                  key={session.id}
                  className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                      <BedDouble size={16} />
                    </div>
                    <div>
                      <div className="font-black text-white">
                        {new Date(session.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{session.bedtime} → {session.wakeTime}</span>
                        <span>•</span>
                        <span className="text-indigo-300 font-bold">{(session.totalMinutes / 60).toFixed(1)} hrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                      session.quality >= 80 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}>
                      {session.quality} Score
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Sleep Custom Modal */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md bg-slate-900 border border-indigo-500/30 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-indigo-300 flex items-center gap-2">
              <Moon size={18} />
              <span>Log Sleep Session</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Record bedtime and wake time to analyze your metabolic sleep quality
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <div>
              <Label htmlFor="date" className="text-xs font-bold text-slate-300 mb-1 block">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white text-xs h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bedtime" className="text-xs font-bold text-slate-300 mb-1 block">
                  Bedtime 🌙
                </Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={formData.bedtime}
                  onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white text-xs h-10 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="wakeTime" className="text-xs font-bold text-slate-300 mb-1 block">
                  Wake Time ☀️
                </Label>
                <Input
                  id="wakeTime"
                  type="time"
                  value={formData.wakeTime}
                  onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white text-xs h-10 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-300 mb-1.5 block">
                How rested do you feel?
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {(["excellent", "good", "fair", "poor"] as const).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      formData.mood === mood
                        ? "border-indigo-400 bg-indigo-600/40 text-white shadow-xs"
                        : "border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-lg">{mood === "excellent" ? "😄" : mood === "good" ? "🙂" : mood === "fair" ? "😐" : "😴"}</div>
                    <div className="capitalize mt-0.5 text-[10px]">{mood}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                onClick={() => setShowAddDialog(false)}
                variant="outline"
                className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddSleep}
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                {saving ? "Saving..." : "Save Sleep Log"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
