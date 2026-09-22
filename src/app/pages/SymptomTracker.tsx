import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  Plus,
  TrendingUp,
  Calendar,
  Search,
  X,
  ChevronLeft,
  Activity,
  Heart,
  Brain,
  Zap,
  Sparkles,
  ShieldCheck,
  Flame,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Stethoscope,
  ChevronRight,
  Droplet,
  Coffee,
  Check,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import { getSymptomLogs, createSymptomLog, updateSymptomLog, deleteSymptomLog } from "../../lib/api";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

type Severity = "mild" | "moderate" | "severe";

type Symptom = {
  id: string;
  date: string;
  time: string;
  symptom: string;
  severity: Severity;
  triggers: string[];
  notes: string;
  relatedFood?: string;
  relatedActivity?: string;
  relatedSleep?: number;
  relatedStress?: number;
};

// Common Cultural & Metabolic Symptom Categories for 1-Tap Logging
const SYMPTOM_CATEGORIES = [
  {
    category: "🫄 Gut & Gastrointestinal",
    items: [
      { name: "Post-Meal Bloating", icon: "🎈", defaultTriggers: ["Heavy Starch", "Large Portion", "Dairy"] },
      { name: "Acid Reflux / Heartburn", icon: "🔥", defaultTriggers: ["Fried Food", "Late Dinner", "Spicy Stew"] },
      { name: "Stomach Cramps", icon: "⚡", defaultTriggers: ["Metformin on Empty Stomach", "High Fat"] },
      { name: "Nausea", icon: "🤢", defaultTriggers: ["Dehydration", "Medication"] },
    ],
  },
  {
    category: "🧠 Head & Cognitive",
    items: [
      { name: "Brain Fog", icon: "🌫️", defaultTriggers: ["Sugar Crash", "Poor Sleep", "Dehydration"] },
      { name: "Tension Headache", icon: "🤕", defaultTriggers: ["Screen Time", "Stress", "High Sodium"] },
      { name: "Dizziness / Lightheadedness", icon: "💫", defaultTriggers: ["Low Blood Sugar", "Rapid Standing", "Skipped Meal"] },
    ],
  },
  {
    category: "⚡ Energy & Blood Sugar",
    items: [
      { name: "Afternoon Energy Crash", icon: "📉", defaultTriggers: ["High-GI Swallow", "Refined Carbs"] },
      { name: "Sugar Dip / Shakiness", icon: "🫨", defaultTriggers: ["Delayed Meal", "Intense Workout"] },
      { name: "Severe Fatigue", icon: "🥱", defaultTriggers: ["Low Iron", "Poor Sleep < 6h"] },
      { name: "Cold Sweats", icon: "💦", defaultTriggers: ["Hypoglycemia Dip"] },
    ],
  },
  {
    category: "🫀 Cardio & Musculoskeletal",
    items: [
      { name: "Heart Palpitations", icon: "💓", defaultTriggers: ["Excess Caffeine", "Sodium Spike", "Stress"] },
      { name: "Joint Stiffness", icon: "🦴", defaultTriggers: ["Inflammatory Fats", "High Uric Acid"] },
      { name: "Ankle Swelling (Edema)", icon: "🦶", defaultTriggers: ["Excess Sodium", "Prolonged Sitting"] },
    ],
  },
];

const PREVIEW_SYMPTOM_DATA: Symptom[] = [
  { id: "prev-1", date: "2026-08-21", time: "14:30", symptom: "Afternoon Energy Crash", severity: "moderate", triggers: ["High-GI Swallow", "Large Portion"], notes: "Happened 45 mins after heavy eba lunch", relatedFood: "Eba & Egusi" },
  { id: "prev-2", date: "2026-08-22", time: "21:15", symptom: "Acid Reflux / Heartburn", severity: "mild", triggers: ["Late Dinner", "Fried Food"], notes: "Ate fried plantain past 9pm", relatedFood: "Dodo & Fried Fish" },
  { id: "prev-3", date: "2026-08-23", time: "11:00", symptom: "Brain Fog", severity: "mild", triggers: ["Poor Sleep < 6h"], notes: "Slept only 5.5 hours" },
  { id: "prev-4", date: "2026-08-24", time: "16:45", symptom: "Post-Meal Bloating", severity: "moderate", triggers: ["Heavy Starch"], notes: "Felt abdominal distension after swallow", relatedFood: "Pounded Yam" },
  { id: "prev-5", date: "2026-08-25", time: "10:30", symptom: "Tension Headache", severity: "mild", triggers: ["Dehydration", "Screen Time"], notes: "Forgot morning water" },
];

const mapApiItem = (item: any): Symptom => {
  const dt = new Date(item.logged_at || item.created_at || Date.now());
  return {
    id: String(item.id),
    date: dt.toISOString().split("T")[0],
    time: dt.toTimeString().slice(0, 5),
    symptom: item.symptom || "Unspecified Symptom",
    severity: (item.severity as Severity) ?? "mild",
    triggers: Array.isArray(item.triggers) ? item.triggers : [],
    notes: item.notes ?? "",
    relatedFood: item.related_food ?? undefined,
    relatedActivity: item.related_activity ?? undefined,
    relatedSleep: item.related_sleep ?? undefined,
    relatedStress: item.related_stress ?? undefined,
  };
};

export default function SymptomTracker() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const mascot = useMascot();

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");

  const [formData, setFormData] = useState({
    symptom: "",
    severity: "mild" as Severity,
    triggers: [] as string[],
    customTrigger: "",
    notes: "",
    relatedFood: "",
  });

  useEffect(() => {
    getSymptomLogs()
      .then((items: any[]) => setSymptoms((items ?? []).map(mapApiItem)))
      .catch((err: any) => setLogsError(err.message ?? "Could not load symptoms"))
      .finally(() => setLogsLoading(false));
  }, []);

  const isUsingPreview = symptoms.length === 0;
  const activeSymptoms = isUsingPreview ? PREVIEW_SYMPTOM_DATA : symptoms;

  // 1-Tap Quick Symptom Logger
  const handleQuickLogSymptom = async (
    item: { name: string; icon: string; defaultTriggers: string[] },
    sev: Severity = "mild"
  ) => {
    triggerHaptic("medium");
    mascot.write();
    try {
      const payload = {
        symptom: item.name,
        severity: sev,
        logged_at: new Date().toISOString(),
        triggers: item.defaultTriggers,
        notes: `Quick logged via 1-tap shelf (${sev})`,
      };
      const result = await createSymptomLog(payload);
      const created = mapApiItem(result);
      setSymptoms((prev) => [created, ...prev]);
      triggerHaptic("success");
      mascot.thumbsUp();
      toast.success(`Logged ${item.name} (${sev}) 📝`);
    } catch (err: any) {
      toast.error(err.message ?? "Could not log symptom");
    }
  };

  const handleCustomSubmit = async () => {
    if (!formData.symptom.trim()) {
      toast.error("Please enter or choose a symptom name");
      return;
    }

    setSaving(true);
    triggerHaptic("medium");
    mascot.write();
    try {
      const payload = {
        symptom: formData.symptom,
        severity: formData.severity,
        logged_at: new Date().toISOString(),
        notes: formData.notes,
        triggers: formData.triggers,
        related_food: formData.relatedFood || undefined,
      };
      const result = await createSymptomLog(payload);
      const created = mapApiItem(result);
      setSymptoms((prev) => [created, ...prev]);
      setShowAddDialog(false);
      setFormData({ symptom: "", severity: "mild", triggers: [], customTrigger: "", notes: "", relatedFood: "" });
      triggerConfetti("burst");
      mascot.doubleThumbsUp();
      toast.success("Symptom recorded successfully!");
    } catch (err: any) {
      toast.error(err.message ?? "Could not save symptom");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    try {
      triggerHaptic("light");
      await deleteSymptomLog(id);
      setSymptoms((prev) => prev.filter((s) => s.id !== id));
      toast.success("Symptom log deleted");
    } catch (err: any) {
      toast.error(err.message ?? "Could not delete");
    }
  };

  // Severity 14-Day Timeline Chart Data
  const severityTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const matches = activeSymptoms.filter((s) => s.date === dateStr);
      const totalScore = matches.reduce(
        (sum, s) => sum + (s.severity === "severe" ? 3 : s.severity === "moderate" ? 2 : 1),
        0
      );
      return {
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        score: matches.length > 0 ? Number((totalScore / matches.length).toFixed(1)) : 0,
        count: matches.length,
      };
    });
  }, [activeSymptoms]);

  // Top Identified Triggers Breakdown
  const topTriggers = useMemo(() => {
    const counts: Record<string, number> = {};
    activeSymptoms.flatMap((s) => s.triggers).forEach((t) => {
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [activeSymptoms]);

  const filteredSymptoms = useMemo(() => {
    return activeSymptoms.filter((s) => {
      const matchesSearch =
        s.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.triggers.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSeverity = filterSeverity === "all" || s.severity === filterSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [activeSymptoms, searchTerm, filterSeverity]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1412] text-stone-900 dark:text-stone-100 pb-28 transition-colors">
      {/* Top Header */}
      <div className="bg-[#FAF8F5]/90 dark:bg-[#0F1412]/90 backdrop-blur-md px-4 sm:px-6 pt-9 pb-5 border-b border-stone-200/80 dark:border-stone-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/health")}
              className="text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full p-2 transition-colors cursor-pointer"
              aria-label="Back to Health"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white leading-tight flex items-center gap-2">
                <span>Symptom Intelligence</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200/80 dark:border-rose-800/80">
                  Clinical AI Triage
                </span>
              </h1>
              <p className="text-xs text-[#164E3D] dark:text-emerald-400 font-semibold">
                Correlate cultural meals, blood sugar, &amp; lifestyle triggers
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic("light");
              setShowAddDialog(true);
            }}
            className="bg-[#164E3D] hover:bg-[#123E31] text-white rounded-full p-2.5 shadow-md shadow-emerald-950/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 text-xs font-bold px-4"
          >
            <Plus size={15} />
            <span>Log Symptom</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Body */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-5 space-y-5">
        {/* API Error Banner */}
        {logsError && (
          <div className="bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-500/50 rounded-2xl p-4 flex items-center gap-3 text-red-700 dark:text-red-200 text-xs shadow-2xs">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span>{logsError}</span>
          </div>
        )}

        {/* 🥑 10X Animated Avo Clinical Triage Nurse */}
        <div className="bg-gradient-to-r from-rose-950/90 via-stone-900 to-[#164E3D]/90 rounded-3xl p-5 text-white shadow-xl border border-rose-400/30 relative overflow-hidden flex items-center justify-between gap-4">
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0">
              <Mascot size={64} className="drop-shadow-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                  Avo Clinical Scribe
                </span>
                <span className="text-xs text-rose-300 font-semibold hidden sm:inline">Food-Symptom Shield</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                Metabolic Root-Cause Analysis
              </h3>
              <p className="text-xs text-rose-100/90 line-clamp-2 mt-1 font-medium leading-relaxed">
                "I cross-reference your energy crashes, reflux, and bloating with your recent meals and hydration to pinpoint exact dietary triggers."
              </p>
            </div>
          </div>
        </div>

        {/* ⚡ 1-Tap Rapid Symptom Logger (Grouped by Category) */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <span>⚡ 1-Tap Quick Symptom Shelf</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Tap to log with auto-matched cultural triggers</p>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="text-xs font-bold text-[#164E3D] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Custom +
            </button>
          </div>

          <div className="space-y-3.5">
            {SYMPTOM_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-xs font-extrabold text-stone-600 dark:text-stone-400 block uppercase tracking-wider">
                  {cat.category}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cat.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="bg-stone-50/80 dark:bg-stone-800/80 hover:bg-stone-100/80 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 hover:border-rose-400/50 rounded-2xl p-3 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between gap-2 shadow-2xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 truncate">
                          {item.name}
                        </span>
                      </div>

                      {/* 1-Tap Severity Chips */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleQuickLogSymptom(item, "mild")}
                          title="Log Mild"
                          className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/80 transition-all cursor-pointer active:scale-95"
                        >
                          Mild
                        </button>
                        <button
                          onClick={() => handleQuickLogSymptom(item, "moderate")}
                          title="Log Moderate"
                          className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-800 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800/80 transition-all cursor-pointer active:scale-95"
                        >
                          Mod
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 📊 7-Day Symptom Burden & Severity Trend */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span>7-Day Symptom Burden Score</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Weighted severity index over the week</p>
            </div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200/80 dark:border-rose-800/80">
              {activeSymptoms.length} Recorded
            </span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={severityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="symptomAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" dark-stroke="#334155" opacity={0.4} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 3]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1b4b",
                    borderColor: "#f43f5e",
                    borderRadius: "1rem",
                    fontSize: "12px",
                    color: "#ffffff",
                  }}
                />
                <Area type="monotone" dataKey="score" name="Avg Severity (1-3)" stroke="#f43f5e" strokeWidth={3} fill="url(#symptomAreaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Triggers Chips */}
          {topTriggers.length > 0 && (
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-stone-500 dark:text-stone-400 font-bold text-xs">Primary Triggers:</span>
              {topTriggers.map(([trigger, count], idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs"
                >
                  ⚡ {trigger} ({count}x)
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 🥗 Clinical Food-Symptom Correlation Shield */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2.5 text-stone-900 dark:text-white font-extrabold text-sm">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <ShieldCheck size={18} />
            </div>
            <span>Cultural Meal &amp; Symptom Diagnostic Rules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl p-3.5 space-y-1.5">
              <span className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                🎈 Post-Swallow Bloating Relief
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                High-density starches (Fufu, Pounded Yam) slow gastric emptying. Add <strong>Ewedu or Okra mucilage</strong> and avoid drinking large volumes of water mid-meal.
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl p-3.5 space-y-1.5">
              <span className="font-extrabold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                🔥 Acid Reflux &amp; Palm Oil
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Excess bleached palm oil delays esophageal sphincter closure. Eat dinner before <strong>7:30 PM</strong> and finish with warm ginger/chamomile tea.
              </p>
            </div>
          </div>
        </div>

        {/* 📋 Logged Symptom History List with Search & Filter */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-3.5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white">Symptom Log History</h3>
            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter logs..."
                  className="pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>

          {isUsingPreview && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <Info size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Showing sample benchmark history. Tap any quick chip above to record your live symptoms!</span>
            </div>
          )}

          <div className="space-y-2.5">
            {filteredSymptoms.map((s) => (
              <div
                key={s.id}
                className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl p-4 flex items-start justify-between gap-3 text-xs shadow-2xs hover:border-stone-300 dark:hover:border-stone-600 transition-all"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-stone-900 dark:text-white text-xs sm:text-sm">{s.symptom}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        s.severity === "severe"
                          ? "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30"
                          : s.severity === "moderate"
                          ? "bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/30"
                          : "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
                      }`}
                    >
                      {s.severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Logged: {s.date} at {s.time}
                    {s.relatedFood && (
                      <span className="text-[#164E3D] dark:text-emerald-400 ml-2 font-semibold">• Related Food: {s.relatedFood}</span>
                    )}
                  </p>

                  {s.notes && (
                    <p className="text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800/80 mt-1 leading-relaxed">
                      "{s.notes}"
                    </p>
                  )}

                  {s.triggers.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {s.triggers.map((trig, idx) => (
                        <span
                          key={idx}
                          className="bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 px-2.5 py-0.5 rounded-md text-xs font-medium border border-stone-200 dark:border-stone-800"
                        >
                          ⚡ {trig}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {!isUsingPreview && (
                  <button
                    onClick={() => handleDeleteSymptom(s.id)}
                    className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                    title="Delete log"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Symptom Log Modal */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Stethoscope size={18} className="text-rose-600 dark:text-rose-400" />
              <span>Record Detailed Symptom</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
              Log details to help identify meal &amp; lifestyle correlations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 mt-3">
            <div>
              <Label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 block">Symptom Name *</Label>
              <Input
                type="text"
                value={formData.symptom}
                onChange={(e) => {
                  setFormData({ ...formData, symptom: e.target.value });
                  mascot.write();
                }}
                placeholder="e.g. Migraine, Post-Eba Bloating, Palpitations..."
                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs h-10 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5 block">Severity Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["mild", "moderate", "severe"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: sev })}
                    className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      formData.severity === sev
                        ? sev === "severe"
                          ? "bg-red-50 dark:bg-red-500/30 border-red-400 text-red-700 dark:text-red-200"
                          : sev === "moderate"
                          ? "bg-orange-50 dark:bg-orange-500/30 border-orange-400 text-orange-700 dark:text-orange-200"
                          : "bg-amber-50 dark:bg-amber-500/30 border-amber-400 text-amber-700 dark:text-amber-200"
                        : "bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 block">Related Food Eaten Recently</Label>
              <Input
                type="text"
                value={formData.relatedFood}
                onChange={(e) => setFormData({ ...formData, relatedFood: e.target.value })}
                placeholder="e.g. Fried plantain, Pounded Yam, Sweetened Zobo..."
                className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs h-10 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 block">Clinical Notes &amp; Context</Label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                placeholder="Describe how soon after eating it occurred, duration, or relief steps taken..."
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs p-3 rounded-xl outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                onClick={() => setShowAddDialog(false)}
                variant="outline"
                className="flex-1 bg-transparent border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCustomSubmit}
                disabled={saving}
                className="flex-1 bg-[#164E3D] hover:bg-[#123E31] text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                {saving ? "Saving..." : "Save Symptom"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
