import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  TrendingUp,
  Award,
  Plus,
  Minus,
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
  Share2,
  MessageSquare,
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
import MascotEmptyState from "../components/MascotEmptyState";
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
    clinicalPurpose: "Blunts postprandial glucose excursions by activating non-insulin GLUT4 muscle clearance.",
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
    title: "DASH Sodium Shield (< 1,500 mg/day)",
    category: "health" as GoalCategory,
    targetValue: 1500,
    currentValue: 2100,
    initialValue: 2400,
    unit: "mg/day",
    icon: "🫀",
    color: "#e11d48",
    bgColor: "#fff1f2",
    clinicalPurpose: "Reduces arterial shear stress and nocturnal BP surges via hibiscus and fresh aromatics.",
    deadlineOffsetDays: 45,
  },
  {
    title: "KDIGO Renal Double-Boil Leaching",
    category: "health" as GoalCategory,
    targetValue: 6,
    currentValue: 2,
    unit: "days/wk",
    icon: "🛡️",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    clinicalPurpose: "Two-stage boiling protocol for starchy root yams to lower potassium load for kidney preservation.",
    deadlineOffsetDays: 30,
  },
  {
    title: "Gastric Ulcer Mucosal Barrier",
    category: "nutrition" as GoalCategory,
    targetValue: 3,
    currentValue: 1,
    unit: "meals/day",
    icon: "🥣",
    color: "#10b981",
    bgColor: "#ecfdf5",
    clinicalPurpose: "Okra and oat mucilage barrier protocol to coat sensitive stomach lining against acid surges.",
    deadlineOffsetDays: 14,
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
    title: "Daily Cellular Hydration (8 Glasses / 2.5L)",
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
  {
    title: "Menopause Isoflavone & Bone Shield",
    category: "nutrition" as GoalCategory,
    targetValue: 40,
    currentValue: 15,
    unit: "mg/day",
    icon: "🌸",
    color: "#ec4899",
    bgColor: "#fdf2f8",
    clinicalPurpose: "40mg bioavailable soy awara isoflavones + sesame calcium for bone mineral density.",
    deadlineOffsetDays: 30,
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
    try {
      const cached = localStorage.getItem("user_goals_data");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGoals(parsed);
          setIsLoading(false);
        }
      }
    } catch {
      /* ignore */
    }

    getGoals()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setGoals(data);
          localStorage.setItem("user_goals_data", JSON.stringify(data));
        } else {
          setGoals((current) => {
            if (current.length > 0) return current;
            const defaults: Goal[] = CLINICAL_GOAL_PRESETS.slice(0, 4).map((p, idx) => ({
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
            localStorage.setItem("user_goals_data", JSON.stringify(defaults));
            return defaults;
          });
        }
      })
      .catch(() => {
        setGoals((current) => {
          if (current.length > 0) return current;
          const defaults: Goal[] = CLINICAL_GOAL_PRESETS.slice(0, 4).map((p, idx) => ({
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
          localStorage.setItem("user_goals_data", JSON.stringify(defaults));
          return defaults;
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const calculateProgressPercent = (goal: Goal): number => {
    const { currentValue, targetValue, initialValue } = goal;
    if (initialValue && initialValue > targetValue) {
      const totalToLose = initialValue - targetValue;
      if (totalToLose <= 0) return 100;
      const lostSoFar = initialValue - currentValue;
      return Math.max(0, Math.min(100, Math.round((lostSoFar / totalToLose) * 100)));
    }
    if (targetValue <= 0) return 100;
    return Math.min(100, Math.round((currentValue / targetValue) * 100));
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
    toast.success(`Loaded "${preset.title}" blueprint!`);
  };

  const handleCreateCustomGoal = async () => {
    if (!newGoalForm.title.trim() || !newGoalForm.targetValue) {
      toast.error("Please provide a goal title and target value");
      return;
    }

    triggerHaptic("medium");
    const numTarget = parseFloat(newGoalForm.targetValue) || 1;
    const numCurrent = parseFloat(newGoalForm.currentValue) || 0;

    let icon = "🎯";
    let color = "#1f7a8c";
    let bgColor = "#e6f7f8";

    if (newGoalForm.category === "weight") {
      icon = "⚖️";
      color = "#1f7a8c";
      bgColor = "#e6f7f8";
    } else if (newGoalForm.category === "nutrition") {
      icon = "🍎";
      color = "#3b82f6";
      bgColor = "#eff6ff";
    } else if (newGoalForm.category === "lifestyle") {
      icon = "🚶‍♂️";
      color = "#06b6d4";
      bgColor = "#ecfeff";
    } else if (newGoalForm.category === "health") {
      icon = "🫀";
      color = "#e11d48";
      bgColor = "#fff1f2";
    }

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoalForm.title.trim(),
      category: newGoalForm.category,
      targetValue: numTarget,
      currentValue: numCurrent,
      initialValue: numCurrent,
      unit: newGoalForm.unit || "units",
      deadline: newGoalForm.deadline,
      status: "active",
      icon,
      color,
      bgColor,
      clinicalPurpose: newGoalForm.clinicalPurpose.trim() || undefined,
    };

    const nextGoals = [newGoal, ...goals];
    setGoals(nextGoals);
    localStorage.setItem("user_goals_data", JSON.stringify(nextGoals));
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

    triggerConfetti("burst");
    toast.success("New Metabolic Goal established! 🎯");

    try {
      await createGoal(newGoal);
    } catch {
      /* offline fallback */
    }
  };

  const handleQuickStep = async (goal: Goal, delta: number) => {
    triggerHaptic("medium");
    const nextVal = Math.max(0, goal.currentValue + delta);
    const progressPct = calculateProgressPercent({ ...goal, currentValue: nextVal });
    const isCompleted = progressPct >= 100;
    const newStatus: GoalStatus = isCompleted ? "completed" : "active";

    const updatedGoals = goals.map((g) => {
      if (g.id === goal.id) {
        return {
          ...g,
          currentValue: nextVal,
          status: newStatus,
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    localStorage.setItem("user_goals_data", JSON.stringify(updatedGoals));

    if (isCompleted && goal.status !== "completed") {
      triggerConfetti("burst");
      triggerHaptic("success");
      setCelebrationMessage(`🎉 Goal Accomplished: ${goal.title}! +100 Metabolic XP!`);
      setShowCelebration(true);
      unlockAchievement("first_goal");
    } else {
      toast.success(`Updated ${goal.title}: ${nextVal} ${goal.unit} (${progressPct}%)`);
    }

    try {
      await updateGoal(goal.id, {
        currentValue: nextVal,
        status: newStatus,
      });
    } catch {
      /* offline fallback */
    }
  };

  const handleUpdateProgressSubmit = async () => {
    if (!selectedGoal) return;
    triggerHaptic("medium");

    const added = parseFloat(progressDelta) || 0;
    const nextVal = Math.max(0, selectedGoal.currentValue + added);
    const progressPct = calculateProgressPercent({ ...selectedGoal, currentValue: nextVal });
    const isCompleted = progressPct >= 100;
    const newStatus: GoalStatus = isCompleted ? "completed" : "active";

    const updatedGoals = goals.map((g) => {
      if (g.id === selectedGoal.id) {
        return {
          ...g,
          currentValue: nextVal,
          status: newStatus,
        };
      }
      return g;
    });

    setGoals(updatedGoals);
    localStorage.setItem("user_goals_data", JSON.stringify(updatedGoals));
    setShowUpdateProgress(false);
    setSelectedGoal(null);

    if (isCompleted && selectedGoal.status !== "completed") {
      triggerConfetti("burst");
      triggerHaptic("success");
      setCelebrationMessage(`🎉 Goal Accomplished: ${selectedGoal.title}! +100 Metabolic XP!`);
      setShowCelebration(true);
      unlockAchievement("first_goal");
    } else {
      toast.success(`Progress saved: ${nextVal} ${selectedGoal.unit} (${progressPct}%)`);
    }

    try {
      await updateGoal(selectedGoal.id, {
        currentValue: nextVal,
        status: newStatus,
      });
    } catch {
      /* offline fallback */
    }
  };

  const handleDeleteGoal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("warning");
    const nextGoals = goals.filter((g) => g.id !== id);
    setGoals(nextGoals);
    localStorage.setItem("user_goals_data", JSON.stringify(nextGoals));
    toast.success("Goal removed");

    try {
      await deleteGoal(id);
    } catch {
      /* offline fallback */
    }
  };

  const handleShareGoalToWhatsApp = (goal: Goal, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("light");
    const pct = calculateProgressPercent(goal);
    const statusEmoji = pct >= 100 ? "🏆 COMPLETED" : `${pct}% IN PROGRESS`;
    const text = `🎯 *MealOptimiza Metabolic Goal Milestone*\n\nGoal: *${goal.title}*\nStatus: *${statusEmoji}*\nProgress: *${goal.currentValue} / ${goal.targetValue} ${goal.unit}*\nClinical Rationale: ${goal.clinicalPurpose || 'Optimizing metabolic vitality & insulin sensitivity'}\n\nTracked via MealOptimiza App.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filteredGoals = useMemo(() => {
    return goals
      .filter((g) => (activeTab === "active" ? g.status === "active" : g.status === "completed"))
      .filter((g) => (selectedCategory === "all" ? true : g.category === selectedCategory));
  }, [goals, activeTab, selectedCategory]);

  const activeCount = goals.filter((g) => g.status === "active").length;
  const completedCount = goals.filter((g) => g.status === "completed").length;
  const totalXp = completedCount * 100 + activeCount * 25;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 relative">
      <AmbientBackground />

      <div className="relative z-10 bg-gradient-to-b from-[#A5DBDB] to-[#B8E5E5] px-4 sm:px-6 pt-9 pb-5 border-b border-teal-500/15">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1f7a8c] block">
              Personalized Trajectory
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {t('goals.title')} 🎯
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddGoal(true)}
              className="p-2 bg-[#1f7a8c] text-white hover:bg-teal-800 rounded-2xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t('common.add')}</span>
            </button>
            <ProfilePictureUpload />
          </div>
        </div>

        <div className="max-w-2xl mx-auto mt-4 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-sm border border-teal-100/90 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <span className="absolute -inset-1 rounded-2xl bg-teal-400/30 animate-pulse-radar pointer-events-none" />
                <div className="relative p-1.5 bg-teal-50 rounded-2xl border border-teal-100">
                  <Mascot gesture="flex" size={48} className="drop-shadow-sm" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9.5px] font-black uppercase tracking-wider bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full shadow-2xs">
                    Metabolic Trajectory
                  </span>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    🔥 {activeCount > 0 ? "Momentum Active" : "Targets Ready"}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-gray-900 leading-tight mt-0.5 truncate">
                  {completedCount > 0
                    ? `${completedCount} Clinical Goal${completedCount > 1 ? "s" : ""} Crushed! 🏆`
                    : "Build Your Daily Clinical Habits 🌱"}
                </h3>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end shrink-0">
              <span className="text-xs font-black text-amber-600">🧠 {totalXp} XP</span>
              <span className="text-[10px] text-gray-500 font-semibold">{goals.length} Total Goals</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-teal-900 mb-1">
              <span>Overall Goal Success Rate</span>
              <span>{completedCount} Completed / {goals.length} Total</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#4ecdc4] h-full rounded-full transition-all duration-700"
                style={{
                  width: `${goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl py-1.5 px-1 border border-slate-200/60">
              <span className="text-[9px] text-gray-500 font-bold block">Active</span>
              <span className="text-xs font-black text-[#1f7a8c]">{activeCount} Targets</span>
            </div>
            <div className="bg-slate-50 rounded-xl py-1.5 px-1 border border-slate-200/60">
              <span className="text-[9px] text-gray-500 font-bold block">Crushed</span>
              <span className="text-xs font-black text-emerald-600">{completedCount} 🏆</span>
            </div>
            <div className="bg-slate-50 rounded-xl py-1.5 px-1 border border-slate-200/60">
              <span className="text-[9px] text-gray-500 font-bold block">Total XP</span>
              <span className="text-xs font-black text-amber-600">{totalXp} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto mt-4 space-y-4">
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

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "⚡ All" },
            { id: "nutrition", label: "🍎 Nutrition & Fiber" },
            { id: "lifestyle", label: "🚶 Movement & Sleep" },
            { id: "health", label: "🫀 Clinical & Biomarkers" },
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
                className="mt-4 bg-[#1f7a8c] hover:bg-teal-800 text-white font-bold rounded-2xl text-xs px-5 cursor-pointer"
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
              const isDone = progressPct >= 100;

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md border border-teal-100/90 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="text-2xl shrink-0 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                        {goal.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-slate-100 text-gray-700">
                            {goal.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                            <Clock size={10} /> {daysLeft > 0 ? `${daysLeft}d left` : "Due today"}
                          </span>
                          {isDone && (
                            <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Completed 🏆
                            </span>
                          )}
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

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleShareGoalToWhatsApp(goal, e)}
                        className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-xl cursor-pointer transition-colors"
                        title="Share progress to WhatsApp"
                      >
                        <Share2 size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteGoal(goal.id, e)}
                        className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-extrabold text-gray-900">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span
                        className={`font-black ${
                          isDone ? "text-emerald-600" : "text-[#1f7a8c]"
                        }`}
                      >
                        {progressPct}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: isDone ? "#10b981" : goal.color || "#1f7a8c",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                      <span>Milestone:</span>
                      <span className="font-bold text-gray-800">
                        {progressPct >= 100
                          ? "🏆 Goal Completed (+100 XP)"
                          : progressPct >= 75
                          ? "🔥 Final Stretch!"
                          : progressPct >= 50
                          ? "⚡ Halfway There!"
                          : "🌱 Building Momentum"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {goal.status === "active" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleQuickStep(goal, 1)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#1f7a8c] font-black text-xs rounded-xl border border-teal-200/80 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                            title="Add 1"
                          >
                            <Plus size={11} />
                            <span>1 {goal.unit.split("/")[0]}</span>
                          </button>

                          {goal.targetValue >= 10 && (
                            <button
                              type="button"
                              onClick={() => handleQuickStep(goal, 5)}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-[#1f7a8c] font-black text-xs rounded-xl border border-teal-200/80 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                              title="Add 5"
                            >
                              <Plus size={11} />
                              <span>5 {goal.unit.split("/")[0]}</span>
                            </button>
                          )}
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setProgressDelta("1");
                          setShowUpdateProgress(true);
                        }}
                        className="px-3 py-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 transition-all"
                      >
                        <Edit2 size={11} />
                        <span>Custom</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />

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
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                1-Tap Clinical Blueprints (African & Metabolic Targets)
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {CLINICAL_GOAL_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200/80 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl p-1.5 bg-white rounded-xl border border-slate-200/60 shrink-0">
                        {preset.icon}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-gray-900 block truncate group-hover:text-[#1f7a8c] transition-colors">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-gray-500 truncate block">
                          Target: {preset.targetValue} {preset.unit} • {preset.clinicalPurpose.slice(0, 48)}...
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#1f7a8c] shrink-0 bg-white px-2 py-0.5 rounded-lg border border-teal-100 shadow-2xs">
                      Use Blueprint
                    </span>
                  </button>
                ))}
              </div>
            </div>

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
              className="flex-1 rounded-xl text-xs font-bold py-2 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCustomGoal}
              className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white rounded-xl text-xs font-bold py-2 cursor-pointer"
            >
              Save Goal 🎯
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {["+1", "+2", "+5", "-1"].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setProgressDelta(amt.replace("+", ""))}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-gray-800 font-bold rounded-xl text-xs border border-slate-200 cursor-pointer active:scale-95"
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
                  className="flex-1 rounded-xl text-xs font-bold py-2 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProgressSubmit}
                  className="flex-1 bg-[#1f7a8c] hover:bg-teal-800 text-white rounded-xl text-xs font-bold py-2 cursor-pointer"
                >
                  Confirm
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showCelebration && (
        <CelebrationAnimation
          message={celebrationMessage}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}
