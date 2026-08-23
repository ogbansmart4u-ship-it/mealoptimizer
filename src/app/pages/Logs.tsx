import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import {
  Calendar,
  Clock,
  Camera,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  Apple,
  Utensils,
  Coffee,
  Moon,
  Activity,
  Zap,
  Heart,
  Droplet,
  Plus,
  CheckCircle2,
  Trash2,
  Share2,
  Mic,
  Sparkles,
  Shield,
  Smile,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAppMode } from "../contexts/AppModeContext";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import AddMealLog from "../components/AddMealLog";
import { SkeletonList } from "../components/SkeletonLoader";
import MascotEmptyState from "../components/MascotEmptyState";
import { getMealLogs, createMealLog, deleteMealLog } from "../../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import VoiceFoodLogger from "../components/VoiceFoodLogger";
import AmbientBackground from "../components/AmbientBackground";
import Mascot from "../components/Mascot";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type MealLog = {
  id: string;
  date: string;
  time: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl?: string;
  energyRating?: number; // 1-5
  digestiveComfort?: number; // 1-5
  bloodSugarImpact?: "low" | "medium" | "high";
  notes?: string;
};

export default function Logs() {
  const { mode } = useAppMode();
  const location = useLocation();
  const { t } = useLanguage();
  const { profile } = useUser();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterMealType, setFilterMealType] = useState<MealType | "all">("all");
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const [logs, setLogs] = useState<MealLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Load logs
  useEffect(() => {
    getMealLogs()
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setLogs([]))
      .finally(() => setLogsLoading(false));
  }, []);

  // Honor navigation state from Home
  useEffect(() => {
    const st = location.state as { openAdd?: boolean; date?: string } | null;
    if (!st) return;
    if (st.date) setSelectedDate(new Date(`${st.date}T12:00:00Z`));
    if (st.openAdd) setShowAddMeal(true);
    if (st.date || st.openAdd) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAddMeal = async (newLog: any) => {
    setLogs((prev) => [newLog, ...prev]);
    try {
      await createMealLog(newLog);
      triggerConfetti("burst");
      toast.success("Meal Logged Successfully! 🎉");
    } catch {
      toast.error("Failed to save meal log");
    }
  };

  const handleDeleteMeal = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Delete this meal entry?")) return;
    try {
      await deleteMealLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      toast.success("Meal removed");
    } catch {
      toast.error("Failed to delete log");
    }
  };

  const selectedIso = selectedDate.toISOString().split("T")[0];
  const todayLogs = useMemo(() => logs.filter((l) => l.date === selectedIso), [logs, selectedIso]);
  const filteredLogs = useMemo(
    () => (filterMealType === "all" ? todayLogs : todayLogs.filter((l) => l.mealType === filterMealType)),
    [todayLogs, filterMealType]
  );

  // Nutrition Totals
  const totalCalories = todayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const totalProtein = todayLogs.reduce((sum, l) => sum + (l.protein || 0), 0);
  const totalCarbs = todayLogs.reduce((sum, l) => sum + (l.carbs || 0), 0);
  const totalFats = todayLogs.reduce((sum, l) => sum + (l.fats || 0), 0);

  // Glycemic Spike Safety Rate
  const lowSpikeCount = todayLogs.filter(
    (l) => !l.bloodSugarImpact || l.bloodSugarImpact === "low"
  ).length;
  const glycemicSafetyPct =
    todayLogs.length > 0 ? Math.round((lowSpikeCount / todayLogs.length) * 100) : 100;

  // Generate 7-Day Calendar Strip
  const calendarDays = useMemo(() => {
    const days = [];
    const base = new Date(selectedDate);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const hasLogs = logs.some((l) => l.date === iso);
      days.push({ date: d, iso, hasLogs, isSelected: iso === selectedIso });
    }
    return days;
  }, [selectedDate, logs, selectedIso]);

  const changeDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const isToday = selectedIso === new Date().toISOString().split("T")[0];

  const mealIcons: Record<MealType, string> = {
    breakfast: "🍳",
    lunch: "🍲",
    dinner: "🥗",
    snack: "🍎",
  };

  // Generate Doctor/Dietitian Report Text
  const doctorReportText = `📋 MEALOPTIMIZER CLINICAL DIARY REPORT
Patient: ${profile?.name || "Member"}
Date: ${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}

📊 DAILY NUTRITION METRICS:
• Total Calories: ${totalCalories} kcal
• Protein: ${totalProtein}g
• Carbohydrates: ${totalCarbs}g
• Healthy Fats: ${totalFats}g
• Glycemic Spike Safety: ${glycemicSafetyPct}% of meals were low-spike

🍽️ DETAILED MEALS LOGGED (${todayLogs.length}):
${todayLogs
  .map(
    (m, i) =>
      `${i + 1}. [${m.mealType.toUpperCase()}] ${m.time} - ${m.foodName} (${m.calories} kcal | P:${m.protein}g C:${m.carbs}g F:${m.fats}g) - Glycemic Impact: ${m.bloodSugarImpact || "low"}`
  )
  .join("\n")}

Generated via MealOptimizer Clinical Platform.`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(doctorReportText);
    setCopiedReport(true);
    triggerHaptic("success");
    toast.success("Clinical Report copied to clipboard!");
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 relative">
      {/* High-Visibility Ambient Background Animation */}
      <AmbientBackground />

      {/* Top Header */}
      <div className="relative z-10 bg-gradient-to-b from-[#A5DBDB] to-[#B8E5E5] px-4 sm:px-6 pt-9 pb-5 border-b border-teal-500/15">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1f7a8c] block">
              Metabolic Food Diary
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Daily Nutrition Logs 🍽️
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceLogger(true)}
              className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Voice Log"
            >
              <Mic size={16} className="animate-pulse" />
            </button>
            <button
              onClick={() => setShowAddMeal(true)}
              className="p-2 bg-[#1f7a8c] text-white hover:bg-teal-800 rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Meal</span>
            </button>
            <ProfilePictureUpload />
          </div>
        </div>

        {/* ============================================================ */}
        {/* 1. INTERACTIVE 7-DAY CALENDAR STRIP                          */}
        {/* ============================================================ */}
        <div className="max-w-2xl mx-auto mt-3.5 bg-white/90 backdrop-blur-md rounded-3xl p-3 shadow-xs border border-teal-100">
          <div className="flex items-center justify-between mb-2 px-1 text-xs font-black text-gray-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeDate(-1)}
                className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <button
                onClick={() => changeDate(1)}
                className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-[10px] font-extrabold text-[#1f7a8c] bg-teal-50 px-2 py-0.5 rounded-full hover:bg-teal-100 transition-colors cursor-pointer"
              >
                Jump to Today
              </button>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDate(item.date);
                  triggerHaptic("light");
                }}
                className={`py-1.5 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                  item.isSelected
                    ? "bg-[#1f7a8c] text-white shadow-2xs font-bold"
                    : "hover:bg-slate-100 text-gray-700"
                }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-80">
                  {item.date.toLocaleDateString("en-US", { weekday: "narrow" })}
                </span>
                <span className="text-xs font-black">{item.date.getDate()}</span>
                {item.hasLogs && (
                  <span
                    className={`h-1 w-1 rounded-full mt-0.5 ${
                      item.isSelected ? "bg-amber-300" : "bg-[#1f7a8c]"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto mt-4 space-y-4">
        {/* ============================================================ */}
        {/* 2. DAILY METABOLIC SCORECARD                                 */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-teal-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#1f7a8c] block">
                Daily Macro Matrix
              </span>
              <h3 className="text-sm font-black text-gray-900">
                {totalCalories} kcal Total Energy
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  glycemicSafetyPct >= 80
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                🛡️ {glycemicSafetyPct}% Spike Shield
              </span>
              <button
                onClick={() => setShowReportDialog(true)}
                className="p-1.5 bg-slate-100 hover:bg-teal-50 text-gray-600 hover:text-[#1f7a8c] rounded-xl cursor-pointer transition-colors"
                title="Export Doctor Report"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50/70 p-2.5 rounded-2xl border border-blue-100">
              <span className="text-[10px] text-blue-700 font-bold block">Protein</span>
              <span className="text-base font-black text-blue-900">{totalProtein}g</span>
              <span className="text-[9px] text-blue-600 block">Muscle &amp; Satiety</span>
            </div>
            <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-100">
              <span className="text-[10px] text-emerald-700 font-bold block">Carbs</span>
              <span className="text-base font-black text-emerald-900">{totalCarbs}g</span>
              <span className="text-[9px] text-emerald-600 block">Energy Fuel</span>
            </div>
            <div className="bg-purple-50/70 p-2.5 rounded-2xl border border-purple-100">
              <span className="text-[10px] text-purple-700 font-bold block">Fats</span>
              <span className="text-base font-black text-purple-900">{totalFats}g</span>
              <span className="text-[9px] text-purple-600 block">Essential Lipids</span>
            </div>
          </div>
        </div>

        {/* Meal Type Filter Chips */}
        <div className="flex bg-white/90 p-1 rounded-2xl border border-teal-100 shadow-2xs gap-1">
          {(["all", "breakfast", "lunch", "dinner", "snack"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                triggerHaptic("light");
                setFilterMealType(cat);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterMealType === cat
                  ? "bg-[#1f7a8c] text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* 3. LOGGED MEALS FEED                                         */}
        {/* ============================================================ */}
        {logsLoading ? (
          <SkeletonList />
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-teal-100">
            <MascotEmptyState
              title="No meals logged for this day"
              subtitle="Keep your metabolism tracked! Tap '+ Add Meal' or use Voice AI."
            />
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                onClick={() => setShowVoiceLogger(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs px-4"
              >
                <Mic size={14} className="mr-1" />
                Speak to Avo 🎙️
              </Button>
              <Button
                onClick={() => setShowAddMeal(true)}
                className="bg-[#1f7a8c] hover:bg-teal-800 text-white font-bold rounded-2xl text-xs px-4"
              >
                + Manual Log
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md border border-teal-100/90 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-2xl shrink-0 p-2 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
                      {mealIcons[log.mealType] || "🍽️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-teal-50 text-[#1f7a8c]">
                          {log.mealType}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
                          <Clock size={10} /> {log.time}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
                        {log.foodName}
                      </h3>

                      {log.notes && (
                        <p className="text-xs text-gray-500 italic mt-0.5 line-clamp-1">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteMeal(log.id, e)}
                    className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                    title="Delete meal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Macro Strip */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    <span className="text-[8px] text-gray-400 font-bold block">Energy</span>
                    <span className="text-xs font-black text-orange-600">{log.calories}</span>
                    <span className="text-[7.5px] text-gray-400 block">kcal</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    <span className="text-[8px] text-gray-400 font-bold block">Protein</span>
                    <span className="text-xs font-black text-blue-600">{log.protein}g</span>
                    <span className="text-[7.5px] text-gray-400 block">Muscle</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    <span className="text-[8px] text-gray-400 font-bold block">Carbs</span>
                    <span className="text-xs font-black text-emerald-600">{log.carbs}g</span>
                    <span className="text-[7.5px] text-gray-400 block">Energy</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    <span className="text-[8px] text-gray-400 font-bold block">Fats</span>
                    <span className="text-xs font-black text-purple-600">{log.fats}g</span>
                    <span className="text-[7.5px] text-gray-400 block">Lipids</span>
                  </div>
                </div>

                {/* Glycemic & Energy Badges */}
                <div className="flex items-center justify-between mt-2.5 pt-2 text-[10px] text-gray-600 font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded-full border font-bold ${
                      log.bloodSugarImpact === "low"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : log.bloodSugarImpact === "medium"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                    }`}
                  >
                    {log.bloodSugarImpact === "low"
                      ? "🛡️ Low Glycemic Impact"
                      : log.bloodSugarImpact === "medium"
                      ? "⚠️ Moderate Glycemic Load"
                      : "🔥 High Glucose Surge"}
                  </span>

                  {log.energyRating && (
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      ⚡ Energy: {"★".repeat(log.energyRating)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      {/* Manual Add Meal Modal */}
      {showAddMeal && (
        <AddMealLog
          isOpen={showAddMeal}
          onClose={() => setShowAddMeal(false)}
          onAdd={handleAddMeal}
        />
      )}

      {/* Voice AI Assistant */}
      <VoiceFoodLogger
        isOpen={showVoiceLogger}
        onClose={() => setShowVoiceLogger(false)}
        onMealSaved={(newLog) => setLogs((prev) => [newLog, ...prev])}
      />

      {/* Doctor / Dietitian Clinical Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={(open) => !open && setShowReportDialog(false)}>
        <DialogContent className="max-w-md max-h-[85vh] p-5 sm:p-6 flex flex-col rounded-3xl">
          <DialogHeader className="pb-1 text-left">
            <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#1f7a8c]" />
              <span>Clinical Doctor / Dietitian Summary</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Structured nutrition report ready to copy or send to your physician.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain my-2 bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
            {doctorReportText}
          </div>

          <div className="pt-2 border-t border-gray-100 flex gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
              className="flex-1 rounded-xl text-xs font-bold py-2"
            >
              Close
            </Button>
            <Button
              onClick={handleCopyReport}
              className="flex-1 bg-[#1f7a8c] hover:bg-teal-800 text-white rounded-xl text-xs font-bold py-2 flex items-center justify-center gap-1.5"
            >
              {copiedReport ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedReport ? "Copied!" : "Copy Report 📋"}</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
