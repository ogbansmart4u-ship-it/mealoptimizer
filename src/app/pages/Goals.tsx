import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  TrendingUp,
  Award,
  Plus,
  Check,
  Edit2,
  Trash2,
  Calendar,
  Activity,
  Zap,
  Heart,
  Scale,
  Droplet,
  Moon,
  Apple,
  ArrowUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Clock,
  Flame,
  Shield,
  Footprints,
  Info,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAppMode } from "../contexts/AppModeContext";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useUnits } from "../contexts/UnitsContext";
import { useAchievements } from "../contexts/AchievementContext";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { CelebrationAnimation } from "../components/CelebrationAnimation";
import { SkeletonGoalList } from "../components/SkeletonLoader";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../../lib/api";
import AmbientBackground from "../components/AmbientBackground";
import Mascot from "../components/Mascot";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export type GoalCategory = "weight" | "nutrition" | "health" | "lifestyle";
export type GoalStatus = "active" | "completed" | "paused";

export type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  initialValue?: number;
  unit: string;
  deadline: string;
  status: GoalStatus;
  icon: string;
  color: string;
  bgColor: string;
  clinicalPurpose?: string;
};

const CLINICAL_GOAL_PRESETS = [
  {
    title: "15-Min Post-Meal Glucose Walks",
    category: "lifestyle" as GoalCategory,
    targetValue: 5,
    currentValue: 1,
    unit: "days/wk",
    icon: "🚶‍♂️",
    color: "#06b6d4",
    bgColor: "#ecfeff",
    clinicalPurpose: "Blunts postprandial glucose excursions by activating GLUT4 muscle clearance.",
    deadlineOffsetDays: 30,
  },
  {
    title: "Daily Satiety Protein Target",
    category: "nutrition" as GoalCategory,
    targetValue: 90,
    currentValue: 45,
    unit: "g/day",
    icon: "💪",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    clinicalPurpose: "Stabilizes GLP-1 and peptide YY satiety hormones to curb late-night sugar cravings.",
    deadlineOffsetDays: 21,
  },
  {
    title: "Blood Pressure Shield (Systolic < 120)",
    category: "health" as GoalCategory,
    targetValue: 120,
    currentValue: 132,
    initialValue: 135,
    unit: "mmHg",
    icon: "🫀",
    color: "#e11d48",
    bgColor: "#fff1f2",
    clinicalPurpose: "Reduces arterial shear stress through low-sodium and potassium-rich greens.",
    deadlineOffsetDays: 45,
  },
  {
    title: "Target Weight & Metabolic Fat Loss",
    category: "weight" as GoalCategory,
    targetValue: 72,
    currentValue: 78,
    initialValue: 80,
    unit: "kg",
    icon: "⚖️",
    color: "#1f7a8c",
    bgColor: "#e6f7f8",
    clinicalPurpose: "Improves visceral insulin sensitivity and reduces fatty liver biomarkers.",
    deadlineOffsetDays: 60,
  },
  {
    title: "Daily Hydration (8 Glasses / 2.5L)",
    category: "lifestyle" as GoalCategory,
    targetValue: 8,
    currentValue: 4,
    unit: "glasses",
    icon: "💧",
    color: "#0284c7",
    bgColor: "#f0f9ff",
    clinicalPurpose: "Supports glomerular kidney filtration and natural sodium flushing.",
    deadlineOffsetDays: 14,
  },
];

export default function Goals() {
  const { mode } = useAppMode();
  const { t } = useLanguage();
  const { unitSystem } = useUnits();
  const { unlockAchievement } = useAchievements();
  const { profile } = useUser();

  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | "all">("all");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showUpdateProgress, setShowUpdateProgress] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressDelta, setProgressDelta] = useState<string>("");

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

  const [newGoalForm, setNewGoalForm] = useState({
    title: "",
    category: "nutrition" as GoalCategory,
    targetValue: "",
    currentValue: "",
    unit: "g/day",
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    clinicalPurpose: "",
  });

  useEffect(() => {
    getGoals()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setGoals(data);
        } else {
          // Initialize with clinical starter goals
          const defaults: Goal[] = CLINICAL_GOAL_PRESETS.slice(0, 3).map((p, idx) => ({
            id: `goal-init-${idx}`,
            title: p.title,
            category: p.category,
            targetValue: p.targetValue,
            currentValue: p.currentValue,
            initialValue: p.initialValue || p.currentValue,
            unit: p.unit,
            deadline: new Date(Date.now() + p.deadlineOffsetDays * 86400000).toISOString().split("T")[0],
            status: "active",
            icon: p.icon,
            color: p.color,
            bgColor: p.bgColor,
            clinicalPurpose: p.clinicalPurpose,
          }));
          setGoals(defaults);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const calculateProgressPercent = (goal: Goal): number => {
    const { currentValue, targetValue, initialValue } = goal;
    // Reverse goal: Weight or Blood Pressure reduction
    if (initialValue && initialValue > targetValue) {
      const totalToLose = initialValue - targetValue;
      if (totalToLose <= 0) return 100;
      const lostSoFar = initialValue - currentValue;
      return Math.max(0, Math.min(100, Math.round((lostSoFar / totalToLose) * 100)));
    }
    // Normal goal: e.g. Protein, Water, Walks
    if (targetValue <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((currentValue / targetValue) * 100)));
  };

  const handleApplyPreset = (preset: typeof CLINICAL_GOAL_PRESETS[0]) => {
    setNewGoalForm({
      title: preset.title,
      category: preset.category,
      targetValue: preset.targetValue.toString(),
      currentValue: preset.currentValue.toString(),
      unit: preset.unit,
      deadline: new Date(Date.now() + preset.deadlineOffsetDays * 86400000).toISOString().split("T")[0],
      clinicalPurpose: preset.clinicalPurpose,
    });
    triggerHaptic("light");
  };

  const handleCreateCustomGoal = async () => {
    if (!newGoalForm.title.trim() || !newGoalForm.targetValue) {
      toast.error("Please provide a goal title and target value");
      return;
    }

    const catConfigs: Record<GoalCategory, { icon: string; color: string; bgColor: string }> = {
      weight: { icon: "⚖️", color: "#1f7a8c", bgColor: "#e6f7f8" },
      nutrition: { icon: "🍎", color: "#10b981", bgColor: "#ecfdf5" },
      health: { icon: "❤️", color: "#e11d48", bgColor: "#fff1f2" },
      lifestyle: { icon: "💪", color: "#f59e0b", bgColor: "#fffbeb" },
    };

    const config = catConfigs[newGoalForm.category];
    const target = parseFloat(newGoalForm.targetValue);
    const current = parseFloat(newGoalForm.currentValue) || 0;

    const goalPayload: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoalForm.title,
      category: newGoalForm.category,
      targetValue: target,
      currentValue: current,
      initialValue: current,
      unit: newGoalForm.unit,
      deadline: newGoalForm.deadline,
      status: "active",
      icon: config.icon,
      color: config.color,
      bgColor: config.bgColor,
      clinicalPurpose: newGoalForm.clinicalPurpose || "Personal metabolic optimization target.",
    };

    try {
      await createGoal(goalPayload);
      setGoals((prev) => [goalPayload, ...prev]);
      triggerConfetti("burst");
      toast.success("Goal Created Successfully! 🎯");
      setShowAddGoal(false);
      setNewGoalForm({
        title: "",
        category: "nutrition",
        targetValue: "",
        currentValue: "",
        unit: "g/day",
        deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        clinicalPurpose: "",
      });
    } catch {
      toast.error("Failed to save goal");
    }
  };

  const handleUpdateProgressSubmit = async () => {
    if (!selectedGoal || !progressDelta) return;
    const added = parseFloat(progressDelta);
    const newCurrent = Number((selectedGoal.currentValue + added).toFixed(1));
    const isCompleted =
      selectedGoal.initialValue && selectedGoal.initialValue > selectedGoal.targetValue
        ? newCurrent <= selectedGoal.targetValue
        : newCurrent >= selectedGoal.targetValue;

    const updated: Goal = {
      ...selectedGoal,
      currentValue: newCurrent,
      status: isCompleted ? "completed" : "active",
    };

    setGoals((prev) => prev.map((g) => (g.id === selectedGoal.id ? updated : g)));
    try {
      await updateGoal(selectedGoal.id, updated);
      triggerHaptic(isCompleted ? "success" : "medium");

      if (isCompleted) {
        setCelebrationMessage(`🎉 Goal Achieved: ${selectedGoal.title}! You earned +100 XP!`);
        setShowCelebration(true);
        triggerConfetti("cannon");
      } else {
        toast.success(`Progress updated! ${newCurrent} ${selectedGoal.unit}`);
      }
      setShowUpdateProgress(false);
      setSelectedGoal(null);
      setProgressDelta("");
    } catch {
      toast.error("Failed to update goal progress");
    }
  };

  const handleDeleteGoal = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchTab = activeTab === "active" ? g.status === "active" : g.status === "completed";
      const matchCat = selectedCategory === "all" || g.category === selectedCategory;
      return matchTab && matchCat;
    });
  }, [goals, activeTab, selectedCategory]);

  const activeCount = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 relative">
      {/* High-Visibility Ambient Background Animation */}
      <AmbientBackground />

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-b from-[#A5DBDB] to-[#B8E5E5] px-4 sm:px-6 pt-9 pb-5 border-b border-teal-500/15">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1f7a8c] block">
              Personalized Trajectory
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Metabolic Goals &amp; Targets 🎯
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddGoal(true)}
              className="p-2 bg-[#1f7a8c] text-white hover:bg-teal-800 rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Goal</span>
            </button>
            <ProfilePictureUpload />
          </div>
        </div>

        {/* Hero Avo Motivation & Goal Stats */}
        <div className="max-w-2xl mx-auto mt-4 bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-sm border border-teal-100 flex items-center gap-3.5">
          <Mascot gesture="flex" size={54} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-teal-900">
              <span>Goal Success Rate</span>
              <span>{completedCount} Completed / {goals.length} Total</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] h-full rounded-full transition-all duration-700"
                style={{
                  width: `${goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-gray-600 mt-1.5 font-medium leading-snug">
              Micro-habits compound! Hitting your walking and fiber targets directly protects your insulin sensitivity.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto mt-4 space-y-4">
        {/* Active vs Completed Tabs */}
        <div className="flex bg-white/90 p-1 rounded-2xl border border-teal-100 shadow-2xs gap-1">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "active"
                ? "bg-[#1f7a8c] text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Active Goals ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "completed"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Completed ({completedCount}) 🏆
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "⚡ All" },
            { id: "nutrition", label: "🍎 Nutrition & Fiber" },
            { id: "lifestyle", label: "🚶 Movement & Sleep" },
            { id: "health", label: "🫀 Blood Pressure & Sugar" },
            { id: "weight", label: "⚖️ Weight & Body" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-teal-900 text-white shadow-2xs"
                  : "bg-white text-gray-700 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* GOALS LIST                                                   */}
        {/* ============================================================ */}
        {isLoading ? (
          <SkeletonGoalList />
        ) : filteredGoals.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-teal-100">
            <MascotEmptyState
              title={activeTab === "active" ? "No active goals yet" : "No completed goals yet"}
              subtitle={
                activeTab === "active"
                  ? "Set your first metabolic target or tap 'New Goal' to choose a clinical blueprint!"
                  : "Keep recording your meals and workouts to crush your first goal!"
              }
            />
            {activeTab === "active" && (
              <Button
                onClick={() => setShowAddGoal(true)}
                className="mt-4 bg-[#1f7a8c] hover:bg-teal-800 text-white font-bold rounded-2xl text-xs px-5"
              >
                + Choose a Clinical Goal Blueprint
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredGoals.map((goal) => {
              const progressPct = calculateProgressPercent(goal);
              const daysLeft = Math.max(
                0,
                Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              );

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md border border-teal-100/90 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="text-2xl shrink-0 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                        {goal.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-slate-100 text-gray-700">
                            {goal.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                            <Clock size={10} /> {daysLeft > 0 ? `${daysLeft}d left` : "Due today"}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-snug">
                          {goal.title}
                        </h3>

                        {goal.clinicalPurpose && (
                          <p className="text-xs text-teal-900 mt-1 font-medium leading-relaxed">
                            💡 {goal.clinicalPurpose}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteGoal(goal.id, e)}
                      className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Progress Bar & Numerical Metrics */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-extrabold text-gray-900">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span
                        className={`font-black ${
                          progressPct >= 100 ? "text-emerald-600" : "text-[#1f7a8c]"
                        }`}
                      >
                        {progressPct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: progressPct >= 100 ? "#10b981" : goal.color || "#1f7a8c",
                        }}
                      />
                    </div>
                  </div>

                  {/* Milestone Progress Quick-Actions */}
                  {goal.status === "active" && (
                    <div className="flex items-center justify-between mt-3 pt-2">
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                        <span>Milestone:</span>
                        <span className="font-bold text-gray-800">
                          {progressPct >= 75
                            ? "🔥 Final Stretch!"
                            : progressPct >= 50
                            ? "⚡ Halfway There!"
                            : "🌱 Building Momentum"}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setProgressDelta("1");
                          setShowUpdateProgress(true);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 transition-all"
                      >
                        <Plus size={13} />
                        <span>Update Progress</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />

      {/* ============================================================ */}
      {/* MODAL 1: ADD / PRESET CLINICAL GOAL                          */}
      {/* ============================================================ */}
      <Dialog open={showAddGoal} onOpenChange={(open) => !open && setShowAddGoal(false)}>
        <DialogContent className="max-w-md max-h-[88vh] p-5 sm:p-6 flex flex-col rounded-3xl">
          <DialogHeader className="pb-1 text-left">
            <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-[#1f7a8c]" />
              <span>Create Metabolic Goal</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Pick a science-backed blueprint or customize your target.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain space-y-3.5 py-2 pr-1 text-xs">
            {/* Quick 1-Tap Presets Shelf */}
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                1-Tap Clinical Blueprints
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {CLINICAL_GOAL_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200/80 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{preset.icon}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-gray-900 block truncate">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate block">
                          Target: {preset.targetValue} {preset.unit}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1f7a8c] shrink-0 bg-white px-2 py-0.5 rounded-lg border border-teal-100">
                      Use Preset
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Goal Inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Goal Title *</label>
                <input
                  type="text"
                  value={newGoalForm.title}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, title: e.target.value })}
                  placeholder="e.g. 5x Weekly Post-Meal Walk"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:border-[#1f7a8c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Target Value *</label>
                  <input
                    type="number"
                    value={newGoalForm.targetValue}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, targetValue: e.target.value })}
                    placeholder="5"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:border-[#1f7a8c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Current Progress</label>
                  <input
                    type="number"
                    value={newGoalForm.currentValue}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, currentValue: e.target.value })}
                    placeholder="1"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:border-[#1f7a8c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={newGoalForm.unit}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, unit: e.target.value })}
                    placeholder="days/wk, kg, g/day"
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:border-[#1f7a8c]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={newGoalForm.deadline}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, deadline: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:border-[#1f7a8c]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Clinical Rationale (Optional)</label>
                <input
                  type="text"
                  value={newGoalForm.clinicalPurpose}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, clinicalPurpose: e.target.value })}
                  placeholder="e.g. Reduces visceral fat and buffers blood sugar spikes"
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:border-[#1f7a8c]"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex gap-2.5 mt-auto shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowAddGoal(false)}
              className="flex-1 rounded-xl text-xs font-bold py-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCustomGoal}
              className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white rounded-xl text-xs font-bold py-2"
            >
              Save Goal 🎯
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* MODAL 2: QUICK PROGRESS UPDATE                               */}
      {/* ============================================================ */}
      <Dialog open={showUpdateProgress} onOpenChange={(open) => !open && setShowUpdateProgress(false)}>
        <DialogContent className="max-w-xs p-5 rounded-3xl text-center">
          {selectedGoal && (
            <>
              <DialogHeader className="text-center">
                <span className="text-3xl mx-auto p-2 bg-slate-50 rounded-2xl w-fit">
                  {selectedGoal.icon}
                </span>
                <DialogTitle className="text-base font-black text-gray-900 mt-2">
                  Update Progress
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  {selectedGoal.title} (Currently: {selectedGoal.currentValue} {selectedGoal.unit})
                </DialogDescription>
              </DialogHeader>

              <div className="py-3 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  {["+1", "+2", "+5", "-1"].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setProgressDelta(amt.replace("+", ""))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-gray-800 font-bold rounded-xl text-xs border border-slate-200 cursor-pointer"
                    >
                      {amt}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">
                    Add / Change Amount ({selectedGoal.unit})
                  </label>
                  <input
                    type="number"
                    value={progressDelta}
                    onChange={(e) => setProgressDelta(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-center font-bold text-sm bg-white text-gray-900 focus:outline-none focus:border-[#1f7a8c]"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUpdateProgress(false)}
                  className="flex-1 rounded-xl text-xs font-bold py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProgressSubmit}
                  className="flex-1 bg-[#1f7a8c] hover:bg-teal-800 text-white rounded-xl text-xs font-bold py-2"
                >
                  Confirm
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Celebration Modal */}
      {showCelebration && (
        <CelebrationAnimation
          message={celebrationMessage}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}
