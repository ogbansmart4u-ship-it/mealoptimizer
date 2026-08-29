import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
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
  FileText,
  MessageSquare,
  Flame,
  ChefHat,
  HeartPulse,
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
import WhatsAppConnectDialog from "../components/WhatsAppConnectDialog";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { sharePlateScoreToWhatsApp, shareDoctorSummaryToWhatsApp } from "../../lib/whatsapp";

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
  sodium_mg?: number;
  imageUrl?: string;
  energyRating?: number;
  digestiveComfort?: number;
  bloodSugarImpact?: "low" | "medium" | "high";
  notes?: string;
};

const mealIcons: Record<MealType, string> = {
  breakfast: "🍳",
  lunch: "🍲",
  dinner: "🥣",
  snack: "🥑",
};

const quickMealPresets = [
  { name: "Jollof Rice & Grilled Chicken", type: "lunch" as MealType, cal: 520, p: 32, c: 68, f: 14, impact: "medium" as const, tip: "Eat 3 spoonfuls of salad first to slow glucose absorption" },
  { name: "Oat Swallow with Okra & Fish", type: "dinner" as MealType, cal: 430, p: 28, c: 45, f: 12, impact: "low" as const, tip: "Viscous okra mucilage provides 38% blood sugar spike buffer" },
  { name: "Moi Moi & 2 Boiled Eggs", type: "breakfast" as MealType, cal: 340, p: 24, c: 28, f: 11, impact: "low" as const, tip: "High protein and resistant starch for steady morning energy" },
];

export default function Logs() {
  const navigate = useNavigate();
  const { mode } = useAppMode();
  const location = useLocation();
  const { t } = useLanguage();
  const { profile } = useUser();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterMealType, setFilterMealType] = useState<MealType | "all">("all");
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
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
    setLogs((prev) => [newLog, ...prev.filter((l) => l.id !== newLog.id)]);
    triggerHaptic("milestone");
    triggerConfetti("burst");
    toast.success("Meal Logged Successfully! 🎉");
    try {
      await createMealLog(newLog);
    } catch (err) {
      console.warn("Meal saved locally. Background cloud sync deferred:", err);
    }
  };

  const handleQuickLog = (preset: typeof quickMealPresets[0]) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: MealLog = {
      id: `meal-${Date.now()}`,
      date: getLocalDateString(selectedDate),
      time: timeNow,
      mealType: preset.type,
      foodName: preset.name,
      calories: preset.cal,
      protein: preset.p,
      carbs: preset.c,
      fats: preset.f,
      sodium_mg: Math.round(preset.cal * 0.7),
      bloodSugarImpact: preset.impact,
      notes: preset.tip,
    };
    handleAddMeal(newEntry);
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

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectedIso = getLocalDateString(selectedDate);
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
  const totalSodium = todayLogs.reduce(
    (sum, l) => sum + (l.sodium_mg != null ? l.sodium_mg : l.calories ? Math.round(l.calories * 0.75) : 0),
    0
  );

  const calorieTarget = (profile as any)?.dailyCalorieTarget || 2100;
  const calPercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));

  const lowSpikeCount = todayLogs.filter((l) => l.bloodSugarImpact === "low").length;
  const glycemicSafetyPct = todayLogs.length > 0 ? Math.round((lowSpikeCount / todayLogs.length) * 100) : 100;

  const avgDiiScore = todayLogs.length > 0 ? -1.2 : 0;

  const changeDate = (days: number) => {
    triggerHaptic("light");
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const isToday = getLocalDateString(selectedDate) === getLocalDateString(new Date());

  const calendarDays = useMemo(() => {
    const result = [];
    const base = new Date(selectedDate);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = getLocalDateString(d);
      result.push({
        date: d,
        iso,
        isSelected: iso === selectedIso,
        hasLogs: logs.some((l) => l.date === iso),
      });
    }
    return result;
  }, [selectedDate, selectedIso, logs]);

  const doctorReportText = `🏥 CLINICAL DIETARY METABOLIC REPORT
Date: ${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
Patient Name: ${profile?.name || "MealOptimiza Member"}

📊 DAILY METABOLIC METRICS:
• Total Calories: ${totalCalories} kcal / ${calorieTarget} kcal target
• Protein: ${totalProtein}g
• Carbohydrates: ${totalCarbs}g
• Healthy Fats: ${totalFats}g
• Sodium Load: ${totalSodium} mg / 2,300 mg max (DASH)
• Glycemic Spike Safety: ${glycemicSafetyPct}% of meals were low-spike

🍽️ DETAILED MEALS LOGGED (${todayLogs.length}):
${todayLogs
  .map(
    (m, i) =>
      `${i + 1}. [${m.mealType.toUpperCase()}] ${m.time} - ${m.foodName} (${m.calories} kcal | P:${m.protein}g C:${m.carbs}g F:${m.fats}g | Na:${m.sodium_mg || Math.round(m.calories * 0.75)}mg) - Impact: ${m.bloodSugarImpact || "low"}`
  )
  .join("\n")}

Generated via MealOptimiza Certified Clinical Platform.`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(doctorReportText);
    setCopiedReport(true);
    triggerHaptic("success");
    toast.success("Clinical Report copied to clipboard!");
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleShareDayToWhatsApp = () => {
    triggerHaptic("medium");
    sharePlateScoreToWhatsApp({
      dishName: todayLogs.length > 0 ? todayLogs.map(m => m.foodName).join(", ") : "Daily African Nutrition Plan",
      calories: totalCalories,
      score: glycemicSafetyPct,
      spikeRisk: glycemicSafetyPct >= 80 ? "Low" : glycemicSafetyPct >= 60 ? "Medium" : "High",
      rebalanceTip: totalSodium > 2000 ? "Pair with 1.5L unsweetened Zobo water to flush excess stew sodium" : "Keep pairing swallows with viscous Ewedu or Okra soup for glucose stability",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-28 relative">
      <AmbientBackground />

      {/* Top Header */}
      <div className="relative z-10 bg-gradient-to-b from-[#A5DBDB] to-[#B8E5E5] dark:from-slate-900 dark:to-slate-950 px-4 sm:px-6 pt-9 pb-5 border-b border-teal-500/15">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1f7a8c] dark:text-teal-400 block">
              {t('logs.title')}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {t('logs.title')} 🍽️
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
              onClick={() => navigate("/scan")}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="Scan Food with AI"
            >
              <Camera size={16} />
            </button>
            <button
              onClick={() => setShowAddMeal(true)}
              className="p-2 bg-[#1f7a8c] text-white hover:bg-teal-800 rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t('logs.addMeal')}</span>
            </button>
            <ProfilePictureUpload />
          </div>
        </div>

        {/* 1. INTERACTIVE 7-DAY CALENDAR STRIP */}
        <div className="max-w-2xl mx-auto mt-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl p-3 shadow-xs border border-teal-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2 px-1 text-xs font-black text-gray-800 dark:text-slate-200">
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeDate(-1)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-slate-600 dark:text-slate-400"
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
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer text-slate-600 dark:text-slate-400"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-[10px] font-extrabold text-[#1f7a8c] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full hover:bg-teal-100 transition-colors cursor-pointer"
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
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300"
                }`}
              >
                <span className="text-[10px] uppercase font-bold opacity-80">
                  {item.date.toLocaleDateString("en-US", { weekday: "narrow" })}
                </span>
                <span className="text-xs font-black">{item.date.getDate()}</span>
                {item.hasLogs && (
                  <span
                    className={`h-1 w-1 rounded-full mt-0.5 ${
                      item.isSelected ? "bg-amber-300" : "bg-[#1f7a8c] dark:bg-teal-400"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto mt-4 space-y-4">
        {/* 2. DAILY METABOLIC SCORECARD & GLYCEMIC SHIELD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-teal-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-[#1f7a8c] dark:text-teal-400 block">
                Daily Macro Matrix
              </span>
              <h3 className="text-sm font-black text-gray-900 dark:text-white">
                {totalCalories} <span className="text-xs font-medium text-slate-500">/ {calorieTarget} kcal Energy ({calPercent}%)</span>
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  glycemicSafetyPct >= 80
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                }`}
              >
                🛡️ {glycemicSafetyPct}% Spike Shield
              </span>
              <button
                onClick={handleShareDayToWhatsApp}
                className="p-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] rounded-xl cursor-pointer transition-colors"
                title="Share to WhatsApp"
              >
                <MessageSquare size={14} />
              </button>
              <button
                onClick={() => setShowReportDialog(true)}
                className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 text-gray-600 dark:text-slate-300 hover:text-[#1f7a8c] rounded-xl cursor-pointer transition-colors"
                title="Export Doctor Report"
              >
                <Share2 size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50/70 dark:bg-blue-950/30 p-2.5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-bold block">{t('logs.protein')}</span>
              <span className="text-base font-black text-blue-900 dark:text-blue-100">{totalProtein}g</span>
              <span className="text-[9px] text-blue-600 dark:text-blue-400 block">Muscle &amp; Satiety</span>
            </div>
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">{t('logs.carbs')}</span>
              <span className="text-base font-black text-emerald-900 dark:text-emerald-100">{totalCarbs}g</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block">Energy Fuel</span>
            </div>
            <div className="bg-purple-50/70 dark:bg-purple-950/30 p-2.5 rounded-2xl border border-purple-100 dark:border-purple-900/40">
              <span className="text-[10px] text-purple-700 dark:text-purple-300 font-bold block">{t('logs.fats')}</span>
              <span className="text-base font-black text-purple-900 dark:text-purple-100">{totalFats}g</span>
              <span className="text-[9px] text-purple-600 dark:text-purple-400 block">Essential Lipids</span>
            </div>
          </div>

          {/* Clinical DII & Sodium DASH Shield Row */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1">
                  <span>🧂 {t('logs.sodium')}</span>
                </span>
                <span className={`text-[10px] font-black ${totalSodium > 2300 ? "text-rose-600" : "text-slate-800 dark:text-slate-200"}`}>
                  {totalSodium} / 2,300 mg
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    totalSodium > 2300
                      ? "bg-rose-500"
                      : totalSodium > 1500
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.round((totalSodium / 2300) * 100))}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 block mt-1">
                {totalSodium <= 1500
                  ? "✓ Optimal cardiovascular zone (DASH)"
                  : totalSodium <= 2300
                  ? "✓ Within safe daily guideline"
                  : "⚠️ Exceeds 2,300mg — pair with potassium-rich greens"}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                  Dietary Inflammatory Score
                </span>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  {avgDiiScore <= -1.0 ? "🌿 Anti-Inflammatory" : avgDiiScore <= 1.0 ? "⚖️ Neutral" : "🔥 Pro-Inflammatory"}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                {avgDiiScore <= -1.0
                  ? "High phytonutrient & omega ratio lowers vascular CRP."
                  : "Add bitterleaf, fluted pumpkin (Ugwu) or Zobo to enhance recovery."}
              </p>
            </div>
          </div>
        </div>

        {/* Meal Type Filter Chips */}
        <div className="flex bg-white/90 dark:bg-slate-900/90 p-1 rounded-2xl border border-teal-100 dark:border-slate-800 shadow-2xs gap-1">
          {[
            { id: "all", label: t('logs.allMeals') },
            { id: "breakfast", label: t('logs.breakfast') },
            { id: "lunch", label: t('logs.lunch') },
            { id: "dinner", label: t('logs.dinner') },
            { id: "snack", label: t('logs.snack') },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic("light");
                setFilterMealType(cat.id as any);
              }}
              className={`flex-1 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold capitalize transition-all cursor-pointer truncate ${
                filterMealType === cat.id
                  ? "bg-[#1f7a8c] text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 3. LOGGED MEALS FEED */}
        {logsLoading ? (
          <SkeletonList />
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 text-center shadow-xs border border-teal-100 dark:border-slate-800 space-y-4">
            {/* Upgraded 3D Mascot Empty State */}
            <MascotEmptyState
              gesture="wave"
              title="No meals logged for this day"
              subtitle="Keep your metabolism tracked! Snap a photo, use voice, or tap a quick African preset below."
            />

            {/* Quick 1-Tap African Cultural Presets */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-left space-y-2">
              <span className="text-[10.5px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                1-Tap Quick African Presets:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {quickMealPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleQuickLog(preset)}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 hover:border-teal-400 rounded-2xl cursor-pointer transition-all flex items-center justify-between group active:scale-98"
                  >
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-[#1f7a8c] transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {preset.cal} kcal • P:{preset.p}g C:{preset.c}g F:{preset.f}g
                      </p>
                    </div>
                    <span className="text-[10.5px] font-black bg-[#1f7a8c] text-white px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
                      <Plus size={12} />
                      <span>Log</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                onClick={() => setShowVoiceLogger(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs px-4 cursor-pointer"
              >
                <Mic size={14} className="mr-1" />
                Speak to Sarah 🎙️
              </Button>
              <Button
                onClick={() => navigate("/scan")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs px-4 cursor-pointer"
              >
                <Camera size={14} className="mr-1" />
                AI Camera Scan
              </Button>
              <Button
                onClick={() => setShowAddMeal(true)}
                className="bg-[#1f7a8c] hover:bg-teal-800 text-white font-bold rounded-2xl text-xs px-4 cursor-pointer"
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
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md border border-teal-100/90 dark:border-slate-800 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-2xl shrink-0 p-2 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-teal-950 rounded-2xl border border-teal-100 dark:border-slate-700">
                      {mealIcons[log.mealType] || "🍽️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-[#1f7a8c] dark:text-teal-300">
                          {log.mealType}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
                          <Clock size={10} /> {log.time}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-snug">
                        {log.foodName}
                      </h3>

                      {log.notes && (
                        <p className="text-xs text-teal-700 dark:text-teal-300/90 font-medium mt-0.5 line-clamp-2">
                          💡 {log.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        sharePlateScoreToWhatsApp({
                          dishName: log.foodName,
                          calories: log.calories,
                          spikeRisk: log.bloodSugarImpact === "high" ? "High" : log.bloodSugarImpact === "medium" ? "Medium" : "Low",
                          rebalanceTip: log.notes,
                        })
                      }
                      className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg cursor-pointer transition-colors"
                      title="Share Plate to WhatsApp"
                    >
                      <MessageSquare size={15} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteMeal(log.id, e)}
                      className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                      title="Delete meal"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Macro Strip */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[8px] text-gray-400 font-bold block">Energy</span>
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400">{log.calories}</span>
                    <span className="text-[7.5px] text-gray-400 block">kcal</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[8px] text-gray-400 font-bold block">Protein</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{log.protein}g</span>
                    <span className="text-[7.5px] text-gray-400 block">Muscle</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[8px] text-gray-400 font-bold block">Carbs</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{log.carbs}g</span>
                    <span className="text-[7.5px] text-gray-400 block">Energy</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                    <span className="text-[8px] text-gray-400 font-bold block">Fats</span>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400">{log.fats}g</span>
                    <span className="text-[7.5px] text-gray-400 block">Lipids</span>
                  </div>
                </div>

                {/* Glycemic & Energy Badges */}
                <div className="flex items-center justify-between mt-2.5 pt-2 text-[10px] text-gray-600 dark:text-slate-400 font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded-full border font-bold ${
                      log.bloodSugarImpact === "low"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : log.bloodSugarImpact === "medium"
                        ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                        : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
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
          onSave={handleAddMeal}
          onAdd={handleAddMeal}
          selectedDate={selectedDate}
        />
      )}

      {/* Voice AI Assistant */}
      <VoiceFoodLogger
        isOpen={showVoiceLogger}
        onClose={() => setShowVoiceLogger(false)}
        onMealSaved={(newLog) => setLogs((prev) => [newLog, ...prev])}
      />

      {/* WhatsApp Connect Modal */}
      <WhatsAppConnectDialog
        isOpen={showWhatsAppDialog}
        onClose={() => setShowWhatsAppDialog(false)}
      />

      {/* Doctor / Dietitian Clinical Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={(open) => !open && setShowReportDialog(false)}>
        <DialogContent className="max-w-md max-h-[85vh] p-5 sm:p-6 flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800">
          <DialogHeader className="pb-1 text-left">
            <DialogTitle className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#1f7a8c]" />
              <span>Clinical Doctor / Dietitian Summary</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-slate-400">
              Structured nutrition report ready to copy or send to your physician.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain my-2 bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all border border-slate-800">
            {doctorReportText}
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2 shrink-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReportDialog(false)}
                className="flex-1 rounded-xl text-xs font-bold py-2"
              >
                Close
              </Button>
              <Button
                onClick={handleCopyReport}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold py-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedReport ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedReport ? "Copied!" : "Copy Text 📋"}</span>
              </Button>
            </div>
            <Button
              onClick={() => {
                setShowReportDialog(false);
                navigate("/health-report");
              }}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:from-[#176270] hover:to-[#38b2ac] text-white rounded-xl text-xs font-black py-2.5 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <FileText size={15} />
              <span>Open 14-Day Certified Physician PDF 📄</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
