import { useState, useEffect } from "react";
import { Target, TrendingUp, Award, Plus, Check, Edit2, Trash2, Calendar, Activity, Zap, Heart, Scale, Droplet, Moon, Apple, ArrowUp, CheckCircle2, XCircle, Sparkles } from "lucide-react";
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
import { UndoNotification } from "../components/UndoNotification";
import { SkeletonGoalList } from "../components/SkeletonLoader";
import { getGoals, createGoal, updateGoal } from "../../lib/api";

type GoalCategory = "weight" | "nutrition" | "health" | "lifestyle";
type GoalStatus = "active" | "completed" | "paused";

type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: GoalStatus;
  icon: string;
  color: string;
  bgColor: string;
};

export default function Goals() {
  const { mode } = useAppMode();
  const { t } = useLanguage();
  // Category label ("all" + the four categories); stored value stays English.
  const catLabel = (c: string) => (c === "all" ? t("logs.filter.all") : t(`goals.cat.${c}`));
  const { unitSystem, convertWeight } = useUnits();
  const { unlockAchievement } = useAchievements();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [showUpdateProgress, setShowUpdateProgress] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [updateValue, setUpdateValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | "all">("all");
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [undoState, setUndoState] = useState<{ goal: Goal; message: string } | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    category: "nutrition" as GoalCategory,
    targetValue: "",
    currentValue: "",
    unit: "",
    deadline: "",
  });
  const [goals, setGoals] = useState<Goal[]>([]);

  const calculateProgress = (current: number, target: number) => {
    // Handle reverse goals (like weight loss)
    if (current > target) {
      const initial = current + (current - target); // Estimate initial value
      return Math.max(0, Math.min(100, ((initial - current) / (initial - target)) * 100));
    }
    return Math.max(0, Math.min(100, (current / target) * 100));
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.currentValue || !newGoal.unit || !newGoal.deadline) {
      return;
    }

    const categoryConfig: Record<GoalCategory, { icon: string; color: string; bgColor: string }> = {
      weight: { icon: "⚖️", color: "#1f7a8c", bgColor: "#E8F5F5" },
      nutrition: { icon: "🍎", color: "#4ecdc4", bgColor: "#B8E5E5" },
      health: { icon: "❤️", color: "#e63946", bgColor: "#ffe5e5" },
      lifestyle: { icon: "💪", color: "#f77f00", bgColor: "#fff4e5" },
    };

    const config = categoryConfig[newGoal.category];

    const goalData = {
      title: newGoal.title,
      category: newGoal.category,
      targetValue: parseFloat(newGoal.targetValue),
      currentValue: parseFloat(newGoal.currentValue),
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      status: "active" as GoalStatus,
      icon: config.icon,
      color: config.color,
      bgColor: config.bgColor,
    };

    try {
      const res = await createGoal(goalData);
      const created: Goal = res && res.goal ? res.goal : { ...goalData, id: Date.now().toString() };
      setGoals((prev) => [...prev, created]);
    } catch {
      setGoals((prev) => [...prev, { ...goalData, id: Date.now().toString() }]);
    }
    setShowAddGoal(false);
    setNewGoal({
      title: "",
      category: "nutrition",
      targetValue: "",
      currentValue: "",
      unit: "",
      deadline: "",
    });
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setNewGoal({
      title: goal.title,
      category: goal.category,
      targetValue: goal.targetValue.toString(),
      currentValue: goal.currentValue.toString(),
      unit: goal.unit,
      deadline: goal.deadline,
    });
    setShowEditGoal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedGoal) return;

    const updates = {
      title: newGoal.title,
      category: newGoal.category,
      targetValue: parseFloat(newGoal.targetValue),
      currentValue: parseFloat(newGoal.currentValue),
      unit: newGoal.unit,
      deadline: newGoal.deadline,
    };

    setGoals(goals.map(g => (g.id === selectedGoal.id ? { ...g, ...updates } : g)));
    try { await updateGoal(selectedGoal.id, updates); } catch (e) { console.error("Failed to save goal edit", e); }

    setShowEditGoal(false);
    setSelectedGoal(null);
    setNewGoal({
      title: "",
      category: "nutrition",
      targetValue: "",
      currentValue: "",
      unit: "",
      deadline: "",
    });
  };

  const handleDeleteGoal = async (goalId: string) => {
    const goalToDelete = goals.find(g => g.id === goalId);
    if (!goalToDelete) return;

    setGoals(goals.filter(g => g.id !== goalId));
    setUndoState({
      goal: goalToDelete,
      message: t("goals.deletedMsg").replace("{title}", goalToDelete.title),
    });
    // Soft-delete on the backend (hidden because status is neither active nor completed)
    try { await updateGoal(goalId, { status: "deleted" }); } catch (e) { console.error("Failed to delete goal", e); }
  };

  const handleUndoDelete = async () => {
    if (undoState) {
      const restored = undoState.goal;
      setGoals(prev => [...prev, restored]);
      setUndoState(null);
      try { await updateGoal(restored.id, { status: restored.status }); } catch (e) { console.error("Failed to restore goal", e); }
    }
  };

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setUpdateValue(goal.currentValue.toString());
    setShowUpdateProgress(true);
  };

  const handleSaveProgress = async () => {
    if (!selectedGoal || !updateValue) return;

    const newValue = parseFloat(updateValue);
    const progress = calculateProgress(newValue, selectedGoal.targetValue);

    setGoals(goals.map(g =>
      g.id === selectedGoal.id
        ? { ...g, currentValue: newValue }
        : g
    ));
    try { await updateGoal(selectedGoal.id, { currentValue: newValue }); } catch (e) { console.error("Failed to update progress", e); }

    // Check if goal reached 100%
    if (progress >= 100 && calculateProgress(selectedGoal.currentValue, selectedGoal.targetValue) < 100) {
      setCelebrationMessage(t("goals.targetReachedMsg").replace("{title}", selectedGoal.title));
      setShowCelebration(true);
    }

    setShowUpdateProgress(false);
    setSelectedGoal(null);
    setUpdateValue("");
  };

  const handleMarkComplete = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    setGoals(goals.map(g =>
      g.id === goalId
        ? { ...g, status: "completed" as GoalStatus }
        : g
    ));
    try { await updateGoal(goalId, { status: "completed" }); } catch (e) { console.error("Failed to mark goal complete", e); }

    // Show celebration
    setCelebrationMessage(t("goals.completedMsg").replace("{title}", goal.title));
    setShowCelebration(true);

    // Check for achievements
    const completedCount = goals.filter(g => g.status === "completed").length + 1;
    if (completedCount === 1) {
      setTimeout(() => unlockAchievement('goal-crusher'), 2000);
    }
    if (completedCount === 3) {
      setTimeout(() => unlockAchievement('triple-threat'), 2000);
    }
  };

  // Load this user's goals from the backend on mount
  useEffect(() => {
    setIsLoading(true);
    getGoals()
      .then((data) => setGoals(Array.isArray(data) ? data.filter((g: Goal) => g.status !== "deleted") : []))
      .catch((e) => { console.error("Failed to load goals", e); setGoals([]); })
      .finally(() => setIsLoading(false));
  }, []);

  const allActiveGoals = goals.filter((g) => g.status === "active");
  const allCompletedGoals = goals.filter((g) => g.status === "completed");

  const activeGoals = goals.filter((g) =>
    g.status === "active" && (selectedCategory === "all" || g.category === selectedCategory)
  );
  const completedGoals = goals.filter((g) =>
    g.status === "completed" && (selectedCategory === "all" || g.category === selectedCategory)
  );

  const categoryIcons: Record<GoalCategory, any> = {
    weight: Scale,
    nutrition: Apple,
    health: Heart,
    lifestyle: Activity,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl text-white mb-1">{t("goals.myGoals")}</h1>
            <p className="text-white/80 text-sm">{t("goals.subtitle")}</p>
          </div>
          <ProfilePictureUpload />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl text-white mb-1">{allActiveGoals.length}</p>
            <p className="text-xs text-white/80">{t("goals.stat.active")}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl text-white mb-1">{allCompletedGoals.length}</p>
            <p className="text-xs text-white/80">{t("goals.stat.completed")}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl text-white mb-1">
              {allActiveGoals.length > 0
                ? Math.round(allActiveGoals.reduce((sum, g) => sum + calculateProgress(g.currentValue, g.targetValue), 0) / allActiveGoals.length)
                : 0}%
            </p>
            <p className="text-xs text-white/80">{t("goals.stat.avgProgress")}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-1 mb-4 flex">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === "active"
                ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t("goals.stat.active")} ({goals.filter(g => g.status === "active").length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t("goals.stat.completed")} ({goals.filter(g => g.status === "completed").length})
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
          {[
            { id: "all", icon: Target },
            { id: "weight", icon: Scale },
            { id: "nutrition", icon: Apple },
            { id: "health", icon: Heart },
            { id: "lifestyle", icon: Activity },
          ].map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id as GoalCategory | "all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === id
                  ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{catLabel(id)}</span>
            </button>
          ))}
        </div>

        {/* Active Goals */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {isLoading ? (
              <SkeletonGoalList count={3} />
            ) : activeGoals.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-800 mb-2">
                  {selectedCategory === "all" ? t("goals.noActive") : t("goals.noCatGoals").replace("{cat}", catLabel(selectedCategory))}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedCategory === "all"
                    ? t("goals.startJourney")
                    : t("goals.createCatGoal").replace("{cat}", catLabel(selectedCategory))}
                </p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-full hover:shadow-md transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("goals.createGoal")}</span>
                </button>
              </div>
            ) : (
              <>
                {activeGoals.map((goal) => {
              const progress = calculateProgress(goal.currentValue, goal.targetValue);
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-3xl shadow-lg p-5 hover:shadow-xl transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="rounded-2xl p-3 text-2xl"
                        style={{ backgroundColor: goal.bgColor }}
                      >
                        {goal.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-800 mb-1">{goal.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{t("goals.daysLeft").replace("{n}", String(daysLeft))}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGoal(goal)}
                        className="text-gray-400 hover:text-[#1f7a8c] transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{t("goals.progress")}</span>
                      <div className="flex items-center gap-2">
                        {progress >= 100 && (
                          <div className="flex items-center gap-1 text-green-600 text-xs animate-bounce">
                            <Sparkles className="h-3 w-3" />
                            <span>{t("goals.goalReached")}</span>
                          </div>
                        )}
                        <span className={`text-sm ${progress >= 100 ? 'text-green-600' : 'text-gray-800'}`}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 100 ? 'animate-pulse' : ''
                        }`}
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          background: progress >= 100
                            ? 'linear-gradient(to right, #10b981, #059669)'
                            : `linear-gradient(to right, ${goal.color}, ${goal.color}CC)`,
                        }}
                      />
                      {/* Milestones */}
                      {[25, 50, 75].map(milestone => (
                        <div
                          key={milestone}
                          className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                          style={{ left: `${milestone}%` }}
                        />
                      ))}
                    </div>
                    {/* Milestone Labels */}
                    <div className="flex justify-between mt-1 px-1">
                      {[25, 50, 75, 100].map(milestone => (
                        <span
                          key={milestone}
                          className={`text-xs ${
                            progress >= milestone ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {progress >= milestone && '✓'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Values */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t("goals.current")}</p>
                      <p className="text-lg text-gray-800">
                        {goal.currentValue} {goal.unit}
                      </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">{t("goals.target")}</p>
                      <p className="text-lg" style={{ color: goal.color }}>
                        {goal.targetValue} {goal.unit}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => handleUpdateProgress(goal)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl hover:shadow-md transition-all"
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span className="text-sm">{t("goals.updateProgress")}</span>
                    </button>
                    <button
                      onClick={() => handleMarkComplete(goal.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-md transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">{t("goals.markComplete")}</span>
                    </button>
                  </div>

                  {/* Expert Mode Extra Info */}
                  {mode === "expert" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-500 mb-1">{t("goals.requiredWeekly")}</p>
                          <p className="text-gray-800">
                            {daysLeft > 0
                              ? `${(Math.abs(goal.targetValue - goal.currentValue) / (daysLeft / 7)).toFixed(2)} ${goal.unit}/${t("goals.week")}`
                              : t("goals.deadlinePassed")}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-gray-500 mb-1">{t("goals.status")}</p>
                          {daysLeft > 0 ? (
                            progress >= (100 - (daysLeft / 90) * 100) ? (
                              <p className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {t("goals.onTrack")}
                              </p>
                            ) : (
                              <p className="text-amber-600 flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {t("goals.needsEffort")}
                              </p>
                            )
                          ) : (
                            <p className="text-red-600 flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              {t("goals.overdue")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
              </>
            )}

            {/* Quick Goal Templates */}
            {!isLoading && activeGoals.length === 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-lg p-6 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h3 className="text-gray-800">{t("goals.quickStart")}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: t("goals.tpl.loseWeight"), category: "weight", target: 65, current: 70, unit: "kg", icon: "⚖️" },
                    { title: t("goals.tpl.water"), category: "nutrition", target: 2000, current: 1000, unit: "ml", icon: "💧" },
                    { title: t("goals.tpl.steps"), category: "lifestyle", target: 10000, current: 5000, unit: "steps", icon: "👟" },
                    { title: t("goals.tpl.sleep"), category: "health", target: 8, current: 6, unit: "hours", icon: "😴" },
                  ].map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setNewGoal({
                          title: template.title,
                          category: template.category as GoalCategory,
                          targetValue: template.target.toString(),
                          currentValue: template.current.toString(),
                          unit: template.unit,
                          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        });
                        setShowAddGoal(true);
                      }}
                      className="bg-white border-2 border-purple-200 rounded-2xl p-3 hover:border-purple-400 hover:shadow-md transition-all text-left"
                    >
                      <div className="text-2xl mb-1">{template.icon}</div>
                      <p className="text-xs text-gray-700">{template.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Goal Button */}
            <button
              onClick={() => setShowAddGoal(true)}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-3xl py-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              <span>{t("goals.addNewGoal")}</span>
            </button>
          </div>
        )}

        {/* Completed Goals */}
        {activeTab === "completed" && (
          <div className="space-y-4">
            {completedGoals.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
                <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-800 mb-2">{t("goals.noCompleted")}</h3>
                <p className="text-sm text-gray-600">
                  {selectedCategory === "all"
                    ? t("goals.completeFirst")
                    : t("goals.completeCatGoal").replace("{cat}", catLabel(selectedCategory))}
                </p>
              </div>
            ) : (
              completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-gradient-to-br from-green-50 via-emerald-50 to-white rounded-3xl shadow-lg p-5 border-2 border-green-200 relative overflow-hidden"
                >
                  {/* Celebration Sparkles */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    <Sparkles className="h-3 w-3 text-yellow-400 animate-bounce" />
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="rounded-2xl p-3 text-2xl"
                      style={{ backgroundColor: goal.bgColor }}
                    >
                      {goal.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-800 mb-1 flex items-center gap-2">
                        {goal.title}
                        <Award className="h-5 w-5 text-yellow-500" />
                      </h3>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("goals.goalAchieved")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 bg-white rounded-2xl p-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{t("goals.achieved")}</p>
                      <p className="text-sm text-gray-800">
                        {goal.currentValue} {goal.unit}
                      </p>
                    </div>
                    <div className="text-center border-x border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">{t("goals.target")}</p>
                      <p className="text-sm text-green-600">
                        {goal.targetValue} {goal.unit}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{t("goals.category")}</p>
                      <p className="text-sm text-gray-800">{catLabel(goal.category)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Motivational Tips */}
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-gray-800 mb-2">
                {allActiveGoals.length === 0 ? t("goals.tipHeadStart") : allCompletedGoals.length > 0 ? t("goals.tipHeadKeep") : t("goals.tipHeadDaily")}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {allActiveGoals.length === 0 ? (
                  t("goals.tipStart")
                ) : allCompletedGoals.length > 0 ? (
                  t(allCompletedGoals.length > 1 ? "goals.tipKeepMany" : "goals.tipKeepOne").replace("{n}", String(allCompletedGoals.length))
                ) : mode === "simple" ? (
                  t("goals.tipSimple")
                ) : (
                  t("goals.tipExpert")
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation
          message={celebrationMessage}
          onComplete={() => setShowCelebration(false)}
        />
      )}

      {/* Undo Notification */}
      {undoState && (
        <UndoNotification
          message={undoState.message}
          onUndo={handleUndoDelete}
          onDismiss={() => setUndoState(null)}
        />
      )}

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("goals.addNewGoal")}</DialogTitle>
            <DialogDescription>
              {t("goals.addDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.goalTitle")}</label>
              <input
                type="text"
                placeholder={t("goals.goalTitlePlaceholder")}
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.category")}</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as GoalCategory })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
              >
                <option value="weight">{t("goals.cat.weight")}</option>
                <option value="nutrition">{t("goals.cat.nutrition")}</option>
                <option value="health">{t("goals.cat.health")}</option>
                <option value="lifestyle">{t("goals.cat.lifestyle")}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.currentValue")}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={newGoal.currentValue}
                  onChange={(e) => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.targetValue")}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.unit")}</label>
              <input
                type="text"
                placeholder={t("goals.unitPlaceholder")}
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.deadline")}</label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddGoal(false)}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAddGoal}
              className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:shadow-lg"
              disabled={!newGoal.title || !newGoal.targetValue || !newGoal.currentValue || !newGoal.unit || !newGoal.deadline}
            >
              {t("goals.addGoal")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={showEditGoal} onOpenChange={setShowEditGoal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("goals.editGoal")}</DialogTitle>
            <DialogDescription>
              {t("goals.editDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.goalTitle")}</label>
              <input
                type="text"
                placeholder={t("goals.goalTitlePlaceholder")}
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.category")}</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as GoalCategory })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
              >
                <option value="weight">{t("goals.cat.weight")}</option>
                <option value="nutrition">{t("goals.cat.nutrition")}</option>
                <option value="health">{t("goals.cat.health")}</option>
                <option value="lifestyle">{t("goals.cat.lifestyle")}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.currentValue")}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={newGoal.currentValue}
                  onChange={(e) => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.targetValue")}</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.unit")}</label>
              <input
                type="text"
                placeholder={t("goals.unitPlaceholder")}
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("goals.deadline")}</label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditGoal(false);
                setSelectedGoal(null);
                setNewGoal({
                  title: "",
                  category: "nutrition",
                  targetValue: "",
                  currentValue: "",
                  unit: "",
                  deadline: "",
                });
              }}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:shadow-lg"
              disabled={!newGoal.title || !newGoal.targetValue || !newGoal.currentValue || !newGoal.unit || !newGoal.deadline}
            >
              {t("profile.saveChanges")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Progress Dialog */}
      <Dialog open={showUpdateProgress} onOpenChange={setShowUpdateProgress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("goals.updateProgress")}</DialogTitle>
            <DialogDescription>
              {selectedGoal && t("goals.updateProgressDesc").replace("{title}", selectedGoal.title)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedGoal && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{t("goals.currentProgress")}</span>
                    <span className="text-2xl">{selectedGoal.icon}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl text-gray-800 mb-1">
                      {selectedGoal.currentValue} <span className="text-lg text-gray-500">{selectedGoal.unit}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("goals.targetLabel")} {selectedGoal.targetValue} {selectedGoal.unit}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("goals.newValue").replace("{unit}", selectedGoal.unit)}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={selectedGoal.currentValue.toString()}
                    value={updateValue}
                    onChange={(e) => setUpdateValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none text-lg text-center"
                    autoFocus
                  />
                </div>

                {updateValue && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Sparkles className="h-4 w-4" />
                      <span>
                        {parseFloat(updateValue) > selectedGoal.currentValue
                          ? t("goals.progressGain").replace("{d}", (parseFloat(updateValue) - selectedGoal.currentValue).toFixed(1)).replace("{unit}", selectedGoal.unit)
                          : parseFloat(updateValue) < selectedGoal.currentValue
                          ? t("goals.progressImprove").replace("{d}", (selectedGoal.currentValue - parseFloat(updateValue)).toFixed(1)).replace("{unit}", selectedGoal.unit)
                          : t("goals.noChange")}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpdateProgress(false);
                setSelectedGoal(null);
                setUpdateValue("");
              }}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSaveProgress}
              className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:shadow-lg"
              disabled={!updateValue || parseFloat(updateValue) === selectedGoal?.currentValue}
            >
              {t("goals.updateProgress")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
