import React, { useState, useEffect, useId, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Dumbbell,
  Plus,
  TrendingUp,
  Calendar,
  Clock,
  Flame,
  Heart,
  Target,
  Award,
  Zap,
  Activity,
  Coffee,
  Edit,
  Trash2,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Shield,
  Footprints,
  Music,
  Check,
  ChevronRight,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import { getWorkoutLogs, createWorkoutLog, updateWorkoutLog, deleteWorkoutLog } from "../../lib/api";
import Mascot from "../components/Mascot";

type WorkoutType = 'cardio' | 'strength' | 'yoga' | 'sports' | 'hiit' | 'walking' | 'cycling' | 'swimming';
type HeartRateZone = 'rest' | 'warmup' | 'fat-burn' | 'cardio' | 'peak';

type Workout = {
  id: string;
  date: string;
  type: WorkoutType;
  name: string;
  duration: number; // minutes
  calories: number;
  heartRateAvg?: number;
  heartRateZone?: HeartRateZone;
  notes?: string;
  restDay: boolean;
};

const WORKOUT_TYPES = [
  { value: 'walking', label: 'Walking / Post-Meal', icon: Footprints, color: '#06b6d4', emoji: '🚶‍♂️', metabolicRole: 'Glucose Spike Blunter' },
  { value: 'cardio', label: 'Afrobeats / Running', icon: Activity, color: '#ef4444', emoji: '🏃', metabolicRole: 'Cardio & Stamina' },
  { value: 'strength', label: 'Resistance & Weights', icon: Dumbbell, color: '#f59e0b', emoji: '💪', metabolicRole: 'Insulin Sensitivity & GLUT4' },
  { value: 'hiit', label: 'HIIT / Circuit', icon: Zap, color: '#f43f5e', emoji: '⚡', metabolicRole: 'Rapid Glycogen Depletion' },
  { value: 'yoga', label: 'Mobility & Stretching', icon: Target, color: '#8b5cf6', emoji: '🧘', metabolicRole: 'Cortisol & BP Reset' },
  { value: 'cycling', label: 'Cycling', icon: Activity, color: '#14b8a6', emoji: '🚴', metabolicRole: 'Aerobic Base' },
  { value: 'swimming', label: 'Swimming', icon: Activity, color: '#3b82f6', emoji: '🏊', metabolicRole: 'Low-Impact Full Body' },
  { value: 'sports', label: 'Football / Sports', icon: Award, color: '#10b981', emoji: '⚽', metabolicRole: 'Agility & Heart Health' },
];

const HEART_RATE_ZONES = [
  { value: 'rest', label: 'Zone 1: Active Recovery', range: '50-60% Max HR', color: '#94a3b8' },
  { value: 'warmup', label: 'Zone 2: Fat Oxidation', range: '60-70% Max HR', color: '#06b6d4' },
  { value: 'fat-burn', label: 'Zone 3: Aerobic Base', range: '70-80% Max HR', color: '#10b981' },
  { value: 'cardio', label: 'Zone 4: Anaerobic Threshold', range: '80-90% Max HR', color: '#f59e0b' },
  { value: 'peak', label: 'Zone 5: Maximum Effort', range: '90-100% Max HR', color: '#ef4444' },
];

const QUICK_MOVEMENT_PRESETS = [
  {
    name: "15-Min Post-Meal Glucose Walk",
    type: "walking" as WorkoutType,
    duration: 15,
    calories: 75,
    heartRateAvg: 105,
    heartRateZone: "warmup" as HeartRateZone,
    notes: "Post-meal stroll to activate GLUT4 receptors and flatten glucose curve.",
    emoji: "🚶‍♂️",
    benefit: "Spike Blunter 📉",
  },
  {
    name: "25-Min Afrobeats Dance Cardio",
    type: "cardio" as WorkoutType,
    duration: 25,
    calories: 190,
    heartRateAvg: 145,
    heartRateZone: "cardio" as HeartRateZone,
    notes: "High-energy rhythmic cardio dancing to Burna Boy, Wizkid & Asake.",
    emoji: "💃",
    benefit: "High Calorie Burn 🔥",
  },
  {
    name: "30-Min Home Dumbbell Strength",
    type: "strength" as WorkoutType,
    duration: 30,
    calories: 175,
    heartRateAvg: 125,
    heartRateZone: "fat-burn" as HeartRateZone,
    notes: "Squats, pushups, lunges, and rows to build metabolic muscle mass.",
    emoji: "🏋️",
    benefit: "Insulin Sensitivity 💪",
  },
  {
    name: "15-Min Cortisol-Lowering Mobility",
    type: "yoga" as WorkoutType,
    duration: 15,
    calories: 55,
    heartRateAvg: 95,
    heartRateZone: "rest" as HeartRateZone,
    notes: "Gentle spinal twists, deep breathing, and hamstring stretches.",
    emoji: "🧘",
    benefit: "BP & Stress Reset 🌿",
  },
];

const mapApiItem = (item: any): Workout => ({
  id: String(item.id),
  date: item.logged_at
    ? new Date(item.logged_at).toISOString().split('T')[0]
    : (item.date ?? new Date().toISOString().split('T')[0]),
  type: (item.type as WorkoutType) ?? 'cardio',
  name: item.name ?? '',
  duration: item.duration_minutes ?? item.duration ?? 0,
  calories: item.calories ?? 0,
  heartRateAvg: item.heart_rate_avg ?? item.heartRateAvg ?? undefined,
  heartRateZone: (item.heart_rate_zone ?? item.heartRateZone ?? undefined) as HeartRateZone | undefined,
  notes: item.notes ?? undefined,
  restDay: item.rest_day ?? item.restDay ?? false,
});

export default function WorkoutLogger() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile } = useUser();
  const uniqueId = useId();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  // Live Stopwatch State
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerWorkoutType, setTimerWorkoutType] = useState<WorkoutType>("walking");
  const timerRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'walking' as WorkoutType,
    name: '',
    duration: '',
    calories: '',
    heartRateAvg: '',
    heartRateZone: 'warmup' as HeartRateZone,
    notes: '',
    restDay: false,
  });

  useEffect(() => {
    getWorkoutLogs()
      .then((items: any[]) => {
        const mapped = (items ?? []).map(mapApiItem);
        mapped.sort((a, b) => a.date.localeCompare(b.date));
        setWorkouts(mapped);
      })
      .catch((err: any) => setLogsError(err.message ?? t('workout.loadError')))
      .finally(() => setLogsLoading(false));
  }, []);

  // Timer Tick
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const handleStartTimer = (type: WorkoutType = "walking") => {
    setTimerWorkoutType(type);
    setTimerActive(true);
  };

  const handlePauseTimer = () => {
    setTimerActive(false);
  };

  const handleResetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
  };

  const handleFinishTimer = () => {
    setTimerActive(false);
    const durationMin = Math.max(1, Math.round(timerSeconds / 60));
    const estimatedCals = durationMin * (timerWorkoutType === "hiit" ? 9 : timerWorkoutType === "strength" ? 6 : 5);

    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: timerWorkoutType,
      name: timerWorkoutType === "walking" ? "Live Glucose Walk" : `${timerWorkoutType.toUpperCase()} Session`,
      duration: durationMin.toString(),
      calories: estimatedCals.toString(),
      heartRateAvg: timerWorkoutType === "hiit" ? "150" : "110",
      heartRateZone: timerWorkoutType === "hiit" ? "cardio" : "warmup",
      notes: `Logged via Live Movement Timer (${formatTimerTime(timerSeconds)})`,
      restDay: false,
    });

    setTimerSeconds(0);
    setShowAddDialog(true);
  };

  const formatTimerTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const last7Days = workouts.slice(-7);
  const last14Days = workouts.slice(-14);

  const totalWorkouts = workouts.filter(w => !w.restDay).length;
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const currentStreak = calculateStreak(workouts);

  // WHO Weekly Target Calculation (150 min / week)
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const weekIso = sevenDaysAgo.toISOString().split('T')[0];
  const weeklyMinutes = workouts
    .filter((w) => w.date >= weekIso && !w.restDay)
    .reduce((sum, w) => sum + w.duration, 0);
  const weeklyGoalPct = Math.min(100, Math.round((weeklyMinutes / 150) * 100));

  function calculateStreak(workouts: Workout[]): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasWorkout = workouts.some(w => w.date === dateStr && !w.restDay);
      if (hasWorkout) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  const handleQuickPresetLog = async (preset: typeof QUICK_MOVEMENT_PRESETS[0]) => {
    const payload = {
      type: preset.type,
      name: preset.name,
      duration_minutes: preset.duration,
      calories: preset.calories,
      heart_rate_avg: preset.heartRateAvg,
      heart_rate_zone: preset.heartRateZone,
      notes: preset.notes,
      rest_day: false,
      logged_at: new Date().toISOString(),
    };

    try {
      const item = await createWorkoutLog(payload);
      const created = mapApiItem(item);
      setWorkouts(prev => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      toast.success(`${preset.name} Logged! +${preset.calories} kcal burned 🔥`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to log workout");
    }
  };

  const handleAddWorkout = async () => {
    if (!formData.restDay && (!formData.name.trim() || !formData.duration)) {
      toast.error(t('workout.errNameDuration'));
      return;
    }

    const payload = formData.restDay
      ? {
          type: 'walking' as WorkoutType,
          name: 'Rest & Recovery Day',
          duration_minutes: 0,
          calories: 0,
          rest_day: true,
          logged_at: new Date(`${formData.date}T12:00:00`).toISOString(),
        }
      : {
          type: formData.type,
          name: formData.name,
          duration_minutes: parseInt(formData.duration) || 0,
          calories: parseInt(formData.calories) || 0,
          heart_rate_avg: formData.heartRateAvg ? parseInt(formData.heartRateAvg) : undefined,
          heart_rate_zone: formData.heartRateZone,
          notes: formData.notes || undefined,
          rest_day: false,
          logged_at: new Date(`${formData.date}T12:00:00`).toISOString(),
        };

    setSaving(true);
    try {
      if (editingWorkout) {
        const item = await updateWorkoutLog(editingWorkout.id, payload);
        const updated = mapApiItem(item);
        setWorkouts(prev =>
          prev.map(w => w.id === editingWorkout.id ? updated : w)
            .sort((a, b) => a.date.localeCompare(b.date))
        );
        toast.success(formData.restDay ? t('workout.restUpdated') : t('workout.updated'));
      } else {
        const item = await createWorkoutLog(payload);
        const created = mapApiItem(item);
        setWorkouts(prev =>
          [...prev, created].sort((a, b) => a.date.localeCompare(b.date))
        );
        toast.success(formData.restDay ? t('workout.restLogged') : t('workout.logged'));
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? t('workout.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'walking',
      name: '',
      duration: '',
      calories: '',
      heartRateAvg: '',
      heartRateZone: 'warmup',
      notes: '',
      restDay: false,
    });
    setEditingWorkout(null);
    setShowAddDialog(false);
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setFormData({
      date: workout.date,
      type: workout.type,
      name: workout.name,
      duration: workout.duration.toString(),
      calories: workout.calories.toString(),
      heartRateAvg: workout.heartRateAvg?.toString() || '',
      heartRateZone: workout.heartRateZone || 'warmup',
      notes: workout.notes || '',
      restDay: workout.restDay,
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('workout.confirmDelete'))) return;
    try {
      await deleteWorkoutLog(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
      toast.success(t('workout.deleted'));
    } catch (err: any) {
      toast.error(err.message ?? t('workout.deleteError'));
    }
  };

  const chartData = last14Days.map((workout, index) => ({
    id: `chart-${index}`,
    date: workout.date,
    duration: workout.duration,
    calories: workout.calories,
    restDay: workout.restDay,
  }));

  const performanceTrend = last14Days.map((workout, index) => {
    const efficiency = workout.duration > 0 ? workout.calories / workout.duration : 0;
    return {
      id: `trend-${index}`,
      date: workout.date,
      efficiency: Math.round(efficiency * 10) / 10,
      calories: workout.calories,
    };
  });

  const formatWeekdayTick = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
  const formatMonthDayTick = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50/40 to-teal-50/50 pb-28">
      {/* Header */}
      <PageHeader
        title="Movement & Metabolic Burn 🏋️"
        showHome
        className="bg-gradient-to-r from-orange-600 via-amber-600 to-teal-700 shadow-md"
        actions={
          <button
            onClick={() => setShowAddDialog(true)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer"
            title="Log custom workout"
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        }
      />

      <div className="px-4 sm:px-6 max-w-2xl mx-auto mt-4 space-y-5">
        {/* API Error Banner */}
        {logsError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-700">{logsError}</span>
          </div>
        )}

        {/* Hero Avo Coaching & Weekly Target */}
        <div className="bg-gradient-to-br from-white via-orange-50/50 to-amber-50/70 rounded-3xl p-5 shadow-sm border border-orange-100 flex items-start gap-4">
          <div className="shrink-0 pt-1">
            <Mascot gesture="wave" size={54} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-orange-800">
                Metabolic Movement Coach
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-900 rounded-full">
                WHO Target: 150m/wk
              </span>
            </div>
            <h3 className="text-sm font-black text-gray-900 mt-0.5">
              {weeklyMinutes >= 150
                ? "🎉 Target Crushed! High Insulin Sensitivity"
                : "🚶 10-Min Post-Meal Walks Buffer Blood Sugar Spikes by 30%"}
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-snug">
              Light muscular contraction activates GLUT4 transporters to clear glucose from your bloodstream without relying solely on insulin.
            </p>

            {/* Weekly Target Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-700 mb-1">
                <span>Weekly Movement Progress</span>
                <span>{weeklyMinutes} / 150 min ({weeklyGoalPct}%)</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-teal-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${weeklyGoalPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1. LIVE POST-MEAL GLUCOSE WALK & WORKOUT STOPWATCH           */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-teal-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-[#1f7a8c] rounded-xl">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">
                  Live Post-Meal Movement Timer ⏱️
                </h3>
                <p className="text-[11px] text-gray-500">
                  Track your stroll or session in real-time
                </p>
              </div>
            </div>
            {timerActive && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full animate-pulse flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Live Tracking
              </span>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
            <div className="text-3xl sm:text-4xl font-black text-gray-900 tracking-wider font-mono">
              {formatTimerTime(timerSeconds)}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5 font-semibold">
              Estimated Burn: ~{Math.round((timerSeconds / 60) * 5)} kcal • Zone 2 Fat Burn
            </div>

            {/* Quick Type Selector for Timer */}
            {!timerActive && timerSeconds === 0 && (
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                {(['walking', 'cardio', 'strength', 'hiit'] as WorkoutType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimerWorkoutType(t)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      timerWorkoutType === t
                        ? "bg-[#1f7a8c] text-white shadow-2xs"
                        : "bg-white text-gray-600 border border-gray-200"
                    }`}
                  >
                    {t === 'walking' ? '🚶 Post-Meal Walk' : t === 'cardio' ? '💃 Afrobeats' : t === 'strength' ? '💪 Resistance' : '⚡ HIIT'}
                  </button>
                ))}
              </div>
            )}

            {/* Stopwatch Controls */}
            <div className="flex items-center justify-center gap-2 mt-3.5">
              {!timerActive ? (
                <button
                  onClick={() => handleStartTimer(timerWorkoutType)}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                  <Play size={14} className="fill-current" />
                  <span>{timerSeconds > 0 ? "Resume" : "Start Walk / Workout"}</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                  <Pause size={14} className="fill-current" />
                  <span>Pause</span>
                </button>
              )}

              {timerSeconds > 0 && (
                <>
                  <button
                    onClick={handleFinishTimer}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
                  >
                    <Check size={14} />
                    <span>Save &amp; Log</span>
                  </button>
                  <button
                    onClick={handleResetTimer}
                    className="p-2 text-gray-500 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors"
                    title="Reset timer"
                  >
                    <RotateCcw size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. 1-TAP QUICK-LOG MOVEMENT SHELF                            */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">
              1-Tap Metabolic Presets
            </h3>
            <span className="text-[10px] text-gray-500 font-semibold">Instant Log</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_MOVEMENT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPresetLog(preset)}
                className="bg-white hover:bg-orange-50/50 border border-orange-100 hover:border-orange-300 rounded-2xl p-3 text-left transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{preset.emoji}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-900 rounded-md">
                      {preset.benefit}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-gray-900 group-hover:text-orange-700 leading-snug line-clamp-1">
                    {preset.name}
                  </h4>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 font-semibold">
                  <span>⏱️ {preset.duration} min</span>
                  <span className="text-orange-600 font-bold">~{preset.calories} kcal</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. METRIC TILES SUMMARY                                      */}
        {/* ============================================================ */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded-2xl p-3 shadow-2xs border border-orange-100 text-center">
            <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
            <div className="text-base font-black text-gray-900">{currentStreak}d</div>
            <span className="text-[9px] text-gray-500 font-bold block uppercase">Streak</span>
          </div>

          <div className="bg-white rounded-2xl p-3 shadow-2xs border border-orange-100 text-center">
            <Dumbbell className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <div className="text-base font-black text-gray-900">{totalWorkouts}</div>
            <span className="text-[9px] text-gray-500 font-bold block uppercase">Sessions</span>
          </div>

          <div className="bg-white rounded-2xl p-3 shadow-2xs border border-orange-100 text-center">
            <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
            <div className="text-base font-black text-gray-900">{totalMinutes}m</div>
            <span className="text-[9px] text-gray-500 font-bold block uppercase">Total Min</span>
          </div>

          <div className="bg-white rounded-2xl p-3 shadow-2xs border border-orange-100 text-center">
            <Zap className="h-4 w-4 text-rose-500 mx-auto mb-1" />
            <div className="text-base font-black text-gray-900">{Math.round(totalCalories / 1000)}k</div>
            <span className="text-[9px] text-gray-500 font-bold block uppercase">Burned</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. ACTIVITY & CALORIE CHARTS                                 */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-teal-100">
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-3">
            {t('workout.weeklyActivity')} (Minutes)
          </h3>

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '10px' }} tickFormatter={formatWeekdayTick} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              />
              <defs>
                <linearGradient id={`workoutGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <Bar dataKey="duration" fill={`url(#workoutGradient-${uniqueId})`} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Calorie Trend */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-teal-100">
          <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-3">
            {t('workout.calorieTrend')}
          </h3>

          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={performanceTrend}>
              <defs>
                <linearGradient id={`calorieGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '10px' }} tickFormatter={formatMonthDayTick} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#f97316"
                strokeWidth={2}
                fill={`url(#calorieGradient-${uniqueId})`}
                name="Calories"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ============================================================ */}
        {/* 5. RECENT WORKOUT LOGS                                       */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl shadow-sm p-5 border border-teal-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
              {t('workout.recent')}
            </h3>
            <button
              onClick={() => setShowAddDialog(true)}
              className="text-xs text-[#1f7a8c] font-bold hover:underline cursor-pointer"
            >
              + Log Custom
            </button>
          </div>

          {workouts.length === 0 && !logsLoading ? (
            <div className="text-center py-6 text-gray-400 text-xs">
              <Dumbbell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p>No workouts logged yet. Tap a 1-tap preset above to log your first session!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {last7Days.slice().reverse().map((workout) => {
                const workoutType = WORKOUT_TYPES.find((t) => t.value === workout.type);
                return (
                  <div
                    key={workout.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      workout.restDay
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-gradient-to-r from-orange-50/60 to-amber-50/50 border-orange-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl shrink-0 p-1.5 bg-white rounded-xl shadow-2xs">
                          {workoutType?.emoji || '💪'}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-gray-900 truncate">
                            {workout.name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            {new Date(workout.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>

                          {!workout.restDay && (
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-700 font-semibold">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-blue-500" />
                                {workout.duration}m
                              </span>
                              <span className="flex items-center gap-1">
                                <Flame className="h-3 w-3 text-orange-500" />
                                {workout.calories} kcal
                              </span>
                              {workout.heartRateAvg && (
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3 text-red-500" />
                                  {workout.heartRateAvg} bpm
                                </span>
                              )}
                            </div>
                          )}

                          {workout.restDay && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500">
                              <Coffee className="h-3.5 w-3.5" />
                              <span>{t('workout.recoveryDay')}</span>
                            </div>
                          )}

                          {workout.notes && (
                            <p className="text-[10px] text-gray-500 mt-1 italic line-clamp-1">
                              "{workout.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(workout)}
                          className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(workout.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. ADD / EDIT WORKOUT IN-FRAME MODAL                         */}
      {/* ============================================================ */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md max-h-[85vh] p-5 sm:p-6 flex flex-col rounded-3xl">
          <DialogHeader className="pb-1 text-left">
            <DialogTitle className="text-lg font-black text-orange-600 flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              <span>{editingWorkout ? t('workout.editTitle') : t('workout.logTitle')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {editingWorkout ? t('workout.editDesc') : t('workout.logDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain space-y-3.5 py-2 pr-1 text-xs">
            <div>
              <Label htmlFor="date" className="text-xs font-bold text-gray-700 mb-1 block">
                {t('sleep.date')}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="restDay"
                checked={formData.restDay}
                onChange={(e) => setFormData({ ...formData, restDay: e.target.checked })}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <Label htmlFor="restDay" className="text-xs font-bold text-gray-700 cursor-pointer">
                {t('workout.restDayLabel')}
              </Label>
            </div>

            {!formData.restDay && (
              <>
                <div>
                  <Label className="text-xs font-bold text-gray-700 mb-1.5 block">
                    {t('workout.workoutType')}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORKOUT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value as WorkoutType })}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          formData.type === type.value
                            ? 'border-orange-500 bg-orange-50 font-bold text-orange-950 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{type.emoji}</span>
                        <div className="min-w-0">
                          <span className="block truncate text-xs">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-xs font-bold text-gray-700 mb-1 block">
                    {t('workout.workoutName')}
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., 20-Min Post-Meal Walk"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label htmlFor="duration" className="text-xs font-bold text-gray-700 mb-1 block">
                      Duration (min) *
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="20"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="calories" className="text-xs font-bold text-gray-700 mb-1 block">
                      Calories Burned (kcal)
                    </Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="120"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label htmlFor="heartRate" className="text-xs font-bold text-gray-700 mb-1 block">
                      Avg HR (bpm)
                    </Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="115"
                      value={formData.heartRateAvg}
                      onChange={(e) => setFormData({ ...formData, heartRateAvg: e.target.value })}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-gray-700 mb-1 block">
                      HR Intensity Zone
                    </Label>
                    <select
                      value={formData.heartRateZone}
                      onChange={(e) => setFormData({ ...formData, heartRateZone: e.target.value as HeartRateZone })}
                      className="w-full h-10 px-2.5 border border-slate-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-orange-500"
                    >
                      {HEART_RATE_ZONES.map(zone => (
                        <option key={zone.value} value={zone.value}>
                          {zone.label} ({zone.range})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-xs font-bold text-gray-700 mb-1 block">
                    {t('workout.notesOptional')}
                  </Label>
                  <Input
                    id="notes"
                    placeholder="e.g., Felt energetic, blood sugar dropped to 110 mg/dL"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </>
            )}
          </div>

          {/* Sticky In-Frame Footer */}
          <div className="pt-3 border-t border-gray-100 flex gap-2.5 mt-auto shrink-0">
            <Button onClick={resetForm} variant="outline" className="flex-1 rounded-xl text-xs font-bold py-2">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddWorkout}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white rounded-xl text-xs font-bold py-2 disabled:opacity-60"
            >
              {saving ? t('common.saving') : editingWorkout ? t('workout.update') : t('workout.logTitle')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
