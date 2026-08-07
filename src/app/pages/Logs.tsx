import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Calendar, Clock, Camera, TrendingUp, Filter, ChevronDown, ChevronLeft, ChevronRight, Apple, Utensils, Coffee, Moon, Activity, Zap, Heart, Droplet, Plus, CheckCircle, Circle } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useAppMode } from "../contexts/AppModeContext";
import { useUser } from "../contexts/UserContext";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import AddMealLog from "../components/AddMealLog";
import { BulkActionsBar } from "../components/BulkActionsBar";
import { SkeletonList } from "../components/SkeletonLoader";
import { getMealLogs, createMealLog, deleteMealLog } from "../../lib/api";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

type MealLog = {
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
  energyRating: number; // 1-5
  digestiveComfort: number; // 1-5
  bloodSugarImpact?: "low" | "medium" | "high";
};

export default function Logs() {
  const { mode } = useAppMode();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterMealType, setFilterMealType] = useState<MealType | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const [logs, setLogs] = useState<MealLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Load this user's meal logs from the backend on mount
  useEffect(() => {
    getMealLogs()
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch((e) => { console.error("Failed to load meal logs", e); setLogs([]); })
      .finally(() => setLogsLoading(false));
  }, []);

  // Auto-open the Add Meal dialog when arriving from Home's "Custom Entry".
  useEffect(() => {
    if ((location.state as { openAdd?: boolean } | null)?.openAdd) {
      setShowAddMeal(true);
      // Clear the flag so it doesn't reopen on back/refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleAddMeal = async (newLog: MealLog) => {
    setLogs((prev) => [...prev, newLog]);
    try { await createMealLog(newLog); } catch (e) { console.error("Failed to save meal log", e); }
  };

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs((prev) =>
      prev.includes(logId)
        ? prev.filter((id) => id !== logId)
        : [...prev, logId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLogs(filteredLogs.map((log) => log.id));
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedLogs.length} meal log(s)?`)) {
      const ids = [...selectedLogs];
      setLogs((prev) => prev.filter((log) => !ids.includes(log.id)));
      setSelectedLogs([]);
      setSelectionMode(false);
      await Promise.all(ids.map((id) => deleteMealLog(id).catch((e) => console.error("Failed to delete meal log", e))));
    }
  };

  const handleCancelSelection = () => {
    setSelectedLogs([]);
    setSelectionMode(false);
  };

  const todayLogs = logs.filter((log) => log.date === selectedDate.toISOString().split("T")[0]);
  const filteredLogs = filterMealType === "all" ? todayLogs : todayLogs.filter((log) => log.mealType === filterMealType);

  const totalCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProtein = todayLogs.reduce((sum, log) => sum + log.protein, 0);
  const totalCarbs = todayLogs.reduce((sum, log) => sum + log.carbs, 0);
  const totalFats = todayLogs.reduce((sum, log) => sum + log.fats, 0);

  const mealTypeIcons: Record<MealType, any> = {
    breakfast: Coffee,
    lunch: Utensils,
    dinner: Apple,
    snack: Zap,
  };

  const mealTypeColors: Record<MealType, string> = {
    breakfast: "#f77f00",
    lunch: "#1f7a8c",
    dinner: "#e63946",
    snack: "#4ecdc4",
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl text-white mb-1">My Logs</h1>
            <p className="text-white/80 text-sm">Track your daily nutrition</p>
          </div>
          <ProfilePictureUpload />
        </div>

        {/* Date Navigator */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => changeDate(-1)}
              className="bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <div className="text-center">
              <p className="text-white text-sm">
                {selectedDate.toDateString() === new Date().toDateString()
                  ? "Today"
                  : formatDate(selectedDate)}
              </p>
              <p className="text-white/60 text-xs mt-1">
                {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Daily Summary */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-800">Daily Summary</h2>
            <TrendingUp className="h-5 w-5 text-[#1f7a8c]" />
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <p className="text-2xl text-[#1f7a8c] mb-1">{totalCalories}</p>
              <p className="text-xs text-gray-600">Calories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#4ecdc4] mb-1">{totalProtein}g</p>
              <p className="text-xs text-gray-600">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#f77f00] mb-1">{totalCarbs}g</p>
              <p className="text-xs text-gray-600">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl text-[#e63946] mb-1">{totalFats}g</p>
              <p className="text-xs text-gray-600">Fats</p>
            </div>
          </div>

          {mode === "expert" && (
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-500 mb-1">P/C/F Ratio</p>
                  <p className="text-gray-800">
                    {Math.round((totalProtein * 4 / totalCalories) * 100)}:
                    {Math.round((totalCarbs * 4 / totalCalories) * 100)}:
                    {Math.round((totalFats * 9 / totalCalories) * 100)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Meals Logged</p>
                  <p className="text-gray-800">{todayLogs.length}/4</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Adherence</p>
                  <p className="text-green-600">85%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter and Bulk Actions */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all"
          >
            <Filter className="h-4 w-4" />
            <span>Filter by Meal</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {filteredLogs.length > 0 && (
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) setSelectedLogs([]);
              }}
              className={`flex items-center gap-2 text-sm rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all ${
                selectionMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>{selectionMode ? 'Cancel Select' : 'Select'}</span>
            </button>
          )}

          {showFilters && (
            <div className="mt-3 bg-white rounded-2xl shadow-lg p-3 space-y-2">
              {["all", "breakfast", "lunch", "dinner", "snack"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterMealType(type as MealType | "all")}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                    filterMealType === type
                      ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Meal Logs */}
        <div className="space-y-4">
          {logsLoading ? (
            <SkeletonList count={3} />
          ) : filteredLogs.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-800 mb-2">No Meals Logged</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start tracking your meals to see your nutrition data
              </p>
              <button
                onClick={() => setShowAddMeal(true)}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all"
              >
                Log First Meal
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const Icon = mealTypeIcons[log.mealType];
              const color = mealTypeColors[log.mealType];

              const isSelected = selectedLogs.includes(log.id);

              return (
                <div
                  key={log.id}
                  className={`bg-white rounded-3xl shadow-lg p-5 hover:shadow-xl transition-all ${
                    selectionMode ? 'cursor-pointer' : ''
                  } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => selectionMode && toggleLogSelection(log.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {selectionMode && (
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                      )}
                      <div
                        className="rounded-2xl p-3"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon className="h-6 w-6" style={{ color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-gray-800">{log.foodName}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {log.time}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: color }}
                          >
                            {log.mealType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-sm text-[#1f7a8c] mb-1">{log.calories}</p>
                      <p className="text-xs text-gray-600">Cal</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-sm text-[#4ecdc4] mb-1">{log.protein}g</p>
                      <p className="text-xs text-gray-600">Protein</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-sm text-[#f77f00] mb-1">{log.carbs}g</p>
                      <p className="text-xs text-gray-600">Carbs</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center">
                      <p className="text-sm text-[#e63946] mb-1">{log.fats}g</p>
                      <p className="text-xs text-gray-600">Fats</p>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <p className="text-xs text-gray-700">Energy</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`h-2 w-2 rounded-full ${
                              star <= log.energyRating ? "bg-blue-600" : "bg-blue-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-gray-700">Comfort</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`h-2 w-2 rounded-full ${
                              star <= log.digestiveComfort ? "bg-green-600" : "bg-green-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expert Mode - Blood Sugar Impact */}
                  {mode === "expert" && log.bloodSugarImpact && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Glycemic Impact</span>
                        <span
                          className={`px-3 py-1 rounded-full ${
                            log.bloodSugarImpact === "low"
                              ? "bg-green-100 text-green-700"
                              : log.bloodSugarImpact === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.bloodSugarImpact.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Insights */}
        {todayLogs.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-gray-800 mb-2">Today's Insight</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {mode === "simple"
                    ? "Great job logging your meals! You're on track with your daily nutrition goals."
                    : `Your P/C/F ratio is ${Math.round((totalProtein * 4 / totalCalories) * 100)}:${Math.round((totalCarbs * 4 / totalCalories) * 100)}:${Math.round((totalFats * 9 / totalCalories) * 100)}. Consider adjusting your next meal to optimize macronutrient distribution.`}
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddMeal(true)}
          className="fixed bottom-24 right-6 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
          title="Log a meal"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Add Meal Dialog */}
      <AddMealLog
        isOpen={showAddMeal}
        onClose={() => setShowAddMeal(false)}
        onSave={handleAddMeal}
        selectedDate={selectedDate}
      />

      {/* Bulk Actions Bar */}
      {selectionMode && (
        <BulkActionsBar
          selectedCount={selectedLogs.length}
          onDelete={handleBulkDelete}
          onCancel={handleCancelSelection}
          onSelectAll={handleSelectAll}
          totalCount={filteredLogs.length}
        />
      )}

      <BottomNav />
    </div>
  );
}
