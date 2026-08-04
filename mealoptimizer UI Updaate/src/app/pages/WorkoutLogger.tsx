import { useState, useEffect, useId } from "react";
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
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { getWorkoutLogs, createWorkoutLog, updateWorkoutLog, deleteWorkoutLog } from "../../lib/api";

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
  { value: 'cardio', label: 'Cardio', icon: Activity, color: '#ef4444', emoji: '🏃' },
  { value: 'strength', label: 'Strength', icon: Dumbbell, color: '#f59e0b', emoji: '💪' },
  { value: 'yoga', label: 'Yoga', icon: Target, color: '#8b5cf6', emoji: '🧘' },
  { value: 'sports', label: 'Sports', icon: Award, color: '#10b981', emoji: '⚽' },
  { value: 'hiit', label: 'HIIT', icon: Zap, color: '#f43f5e', emoji: '⚡' },
  { value: 'walking', label: 'Walking', icon: Activity, color: '#06b6d4', emoji: '🚶' },
  { value: 'cycling', label: 'Cycling', icon: Activity, color: '#14b8a6', emoji: '🚴' },
  { value: 'swimming', label: 'Swimming', icon: Activity, color: '#3b82f6', emoji: '🏊' },
];

const HEART_RATE_ZONES = [
  { value: 'rest', label: 'Rest', range: '50-60%', color: '#94a3b8' },
  { value: 'warmup', label: 'Warm-up', range: '60-70%', color: '#06b6d4' },
  { value: 'fat-burn', label: 'Fat Burn', range: '70-80%', color: '#10b981' },
  { value: 'cardio', label: 'Cardio', range: '80-90%', color: '#f59e0b' },
  { value: 'peak', label: 'Peak', range: '90-100%', color: '#ef4444' },
];

const generateMockWorkouts = (): Workout[] => {
  const workouts: Workout[] = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Skip some days for rest days
    if (i % 7 === 0 || i % 7 === 3) {
      workouts.push({
        id: `rest-${i}`,
        date: dateStr,
        type: 'walking',
        name: 'Rest Day',
        duration: 0,
        calories: 0,
        restDay: true,
      });
      continue;
    }

    const types: WorkoutType[] = ['cardio', 'strength', 'yoga', 'hiit'];
    const type = types[i % types.length];
    const duration = 30 + Math.floor(Math.random() * 45);
    const calories = duration * (4 + Math.random() * 6);

    workouts.push({
      id: `workout-${i}`,
      date: dateStr,
      type,
      name: type === 'cardio' ? 'Morning Run' :
            type === 'strength' ? 'Upper Body' :
            type === 'yoga' ? 'Vinyasa Flow' : 'HIIT Circuit',
      duration,
      calories: Math.round(calories),
      heartRateAvg: 120 + Math.floor(Math.random() * 40),
      heartRateZone: ['fat-burn', 'cardio', 'peak'][Math.floor(Math.random() * 3)] as HeartRateZone,
      restDay: false,
    });
  }

  return workouts;
};

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
  const uniqueId = useId();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'cardio' as WorkoutType,
    name: '',
    duration: '',
    calories: '',
    heartRateAvg: '',
    heartRateZone: 'cardio' as HeartRateZone,
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
      .catch((err: any) => setLogsError(err.message ?? 'Failed to load workouts'))
      .finally(() => setLogsLoading(false));
  }, []);

  const last7Days = workouts.slice(-7);
  const last14Days = workouts.slice(-14);

  const totalWorkouts = workouts.filter(w => !w.restDay).length;
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const currentStreak = calculateStreak(workouts);
  const avgDuration = totalMinutes / totalWorkouts || 0;

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

  const handleAddWorkout = async () => {
    if (!formData.restDay && (!formData.name.trim() || !formData.duration)) {
      toast.error('Please enter workout name and duration');
      return;
    }

    const payload = formData.restDay
      ? {
          type: 'walking' as WorkoutType,
          name: 'Rest Day',
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
        toast.success(formData.restDay ? 'Rest day updated!' : 'Workout updated!');
      } else {
        const item = await createWorkoutLog(payload);
        const created = mapApiItem(item);
        setWorkouts(prev =>
          [...prev, created].sort((a, b) => a.date.localeCompare(b.date))
        );
        toast.success(formData.restDay ? 'Rest day logged!' : 'Workout logged!');
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'cardio',
      name: '',
      duration: '',
      calories: '',
      heartRateAvg: '',
      heartRateZone: 'cardio',
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
      heartRateZone: workout.heartRateZone || 'cardio',
      notes: workout.notes || '',
      restDay: workout.restDay,
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workout?')) return;
    try {
      await deleteWorkoutLog(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
      toast.success('Workout deleted');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to delete workout');
    }
  };

  const chartData = last14Days.map((workout, index) => ({
    id: `chart-${index}`,
    date: workout.date, // ISO YYYY-MM-DD — unique key for recharts
    duration: workout.duration,
    calories: workout.calories,
    restDay: workout.restDay,
  }));

  const performanceTrend = last14Days.map((workout, index) => {
    const efficiency = workout.duration > 0 ? workout.calories / workout.duration : 0;
    return {
      id: `trend-${index}`,
      date: workout.date, // ISO YYYY-MM-DD — unique key for recharts
      efficiency: Math.round(efficiency * 10) / 10,
      calories: workout.calories,
    };
  });

  const formatWeekdayTick = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
  const formatMonthDayTick = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-red-50 to-pink-50 pb-24">
      <PageHeader
        title="Workout Logger"
        showHome
        className="bg-gradient-to-r from-orange-600 to-red-600"
        actions={
          <button
            onClick={() => setShowAddDialog(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        }
      />

      <div className="px-6 mt-6 space-y-6">
        {/* API error banner */}
        {logsError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{logsError}</span>
          </div>
        )}

        {/* Loading state */}
        {logsLoading && (
          <div className="bg-white rounded-3xl shadow-xl p-8 flex items-center justify-center gap-3 text-gray-400">
            <Dumbbell className="h-5 w-5 animate-pulse" />
            <span className="text-sm">Loading workouts…</span>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600">Streak</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{currentStreak}</div>
            <div className="text-xs text-gray-500">days</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 rounded-full p-2">
                <Dumbbell className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-600">Workouts</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalWorkouts}</div>
            <div className="text-xs text-gray-500">total sessions</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Avg Duration</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{Math.round(avgDuration)}</div>
            <div className="text-xs text-gray-500">minutes</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 rounded-full p-2">
                <Flame className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Calories</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{Math.round(totalCalories / 1000)}k</div>
            <div className="text-xs text-gray-500">total burned</div>
          </div>
        </div>

        {/* Weekly Duration Chart */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Activity (Last 14 Days)</h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={formatWeekdayTick} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <defs>
                <linearGradient id={`workoutGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <Bar dataKey="duration" fill={`url(#workoutGradient-${uniqueId})`} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Calorie Burn Trend</h3>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={performanceTrend}>
              <defs>
                <linearGradient id={`calorieGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} tickFormatter={formatMonthDayTick} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#ef4444"
                strokeWidth={2}
                fill={`url(#calorieGradient-${uniqueId})`}
                name="Calories"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Workouts</h3>

          <div className="space-y-3">
            {last7Days.slice().reverse().map(workout => {
              const workoutType = WORKOUT_TYPES.find(t => t.value === workout.type);
              return (
                <div
                  key={workout.id}
                  className={`p-4 rounded-xl ${
                    workout.restDay
                      ? 'bg-gray-50 border-2 border-gray-200'
                      : 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{workoutType?.emoji || '💪'}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{workout.name}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(workout.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>

                      {!workout.restDay && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{workout.duration}min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-600" />
                            <span>{workout.calories} cal</span>
                          </div>
                          {workout.heartRateAvg && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-red-600" />
                              <span>{workout.heartRateAvg} bpm</span>
                            </div>
                          )}
                        </div>
                      )}

                      {workout.restDay && (
                        <div className="flex items-center gap-2 mt-2">
                          <Coffee className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-600">Recovery day</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(workout)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workout Tips */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl shadow-xl p-6 border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Performance Tips
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Rest Days Matter</div>
                <div className="text-sm text-gray-600">
                  Aim for 1-2 rest days per week for optimal muscle recovery and growth.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Heart className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Heart Rate Zones</div>
                <div className="text-sm text-gray-600">
                  Train in different HR zones: 70-80% for fat burn, 80-90% for cardio fitness.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Progressive Overload</div>
                <div className="text-sm text-gray-600">
                  Gradually increase duration or intensity by 5-10% each week for continuous improvement.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Workout Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-orange-600">
              {editingWorkout ? 'Edit Workout' : 'Log Workout'}
            </DialogTitle>
            <DialogDescription>
              {editingWorkout ? 'Update your workout details.' : 'Record your exercise session.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 block">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="restDay"
                checked={formData.restDay}
                onChange={(e) => setFormData({ ...formData, restDay: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="restDay" className="text-sm font-medium text-gray-700 cursor-pointer">
                This is a rest day
              </Label>
            </div>

            {!formData.restDay && (
              <>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Workout Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {WORKOUT_TYPES.slice(0, 4).map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, type: type.value as WorkoutType })}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          formData.type === type.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">{type.emoji}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Workout Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Morning Run"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="duration" className="text-sm font-medium text-gray-700 mb-2 block">
                      Duration (min) *
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="calories" className="text-sm font-medium text-gray-700 mb-2 block">
                      Calories
                    </Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="250"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="heartRate" className="text-sm font-medium text-gray-700 mb-2 block">
                      Avg Heart Rate
                    </Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="140"
                      value={formData.heartRateAvg}
                      onChange={(e) => setFormData({ ...formData, heartRateAvg: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">HR Zone</Label>
                    <select
                      value={formData.heartRateZone}
                      onChange={(e) => setFormData({ ...formData, heartRateZone: e.target.value as HeartRateZone })}
                      className="w-full h-12 px-3 border border-gray-300 rounded-lg"
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
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                    Notes (Optional)
                  </Label>
                  <Input
                    id="notes"
                    placeholder="e.g., Felt strong today"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="h-12"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleAddWorkout}
                disabled={saving}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : editingWorkout ? 'Update' : 'Log Workout'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
