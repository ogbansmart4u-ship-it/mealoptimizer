import { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router";
import {
  Droplet,
  Plus,
  Minus,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Coffee,
  Wine,
  Flame,
  Activity,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { getHydrationLogs, createHydrationLog, deleteHydrationLog } from "../../lib/api";

type HydrationLog = {
  id: string;
  timestamp: string;
  amount: number;
  type: 'water' | 'coffee' | 'tea' | 'other';
};

type HydrationData = {
  date: string;
  logs: HydrationLog[];
  totalIntake: number;
};

const CONTAINER_SIZES = [
  { label: 'Small Cup', amount: 250, icon: Coffee, ml: '250ml' },
  { label: 'Glass', amount: 350, icon: Droplet, ml: '350ml' },
  { label: 'Bottle', amount: 500, icon: Wine, ml: '500ml' },
  { label: 'Large Bottle', amount: 1000, icon: Wine, ml: '1L' },
];

const generateHourlyData = (logs: HydrationLog[]) => {
  const data = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();
    const hourStart = new Date(time);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = new Date(hourStart);
    hourEnd.setHours(hourEnd.getHours() + 1);

    const hourIntake = logs
      .filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= hourStart && logTime < hourEnd;
      })
      .reduce((sum, log) => sum + log.amount, 0);

    data.push({
      time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      intake: hourIntake,
      cumulative: 0,
    });
  }

  let cumulative = 0;
  for (let i = 0; i < data.length; i++) {
    cumulative += data[i].intake;
    data[i].cumulative = cumulative;
  }

  return data;
};

const calculateDailyGoal = () => {
  // Base goal: 2500ml for average adult
  // In production, this would be personalized based on weight, activity, climate
  const baseGoal = 2500;
  const hour = new Date().getHours();

  // Adjust for activity level (mock)
  const activityMultiplier = hour >= 6 && hour <= 22 ? 1.1 : 1.0;

  return Math.round(baseGoal * activityMultiplier);
};

export default function HydrationTracker() {
  const navigate = useNavigate();
  const uniqueId = useId();
  const today = new Date().toISOString().split('T')[0];

  const [hydrationData, setHydrationData] = useState<HydrationData>({
    date: today,
    logs: [],
    totalIntake: 0,
  });
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [dailyGoal] = useState(calculateDailyGoal());
  const [energyLevel, setEnergyLevel] = useState(3);
  const [showReminder, setShowReminder] = useState(false);

  // Load today's logs from API on mount
  useEffect(() => {
    getHydrationLogs()
      .then((items: any[]) => {
        const todayLogs: HydrationLog[] = (items ?? [])
          .filter((item) => (item.logged_at ?? "").startsWith(today))
          .map((item) => ({
            id: item.id,
            timestamp: item.logged_at,
            amount: item.amount_ml,
            type: (item.type as HydrationLog["type"]) ?? "water",
          }));
        const total = todayLogs.reduce((sum, l) => sum + l.amount, 0);
        setHydrationData({ date: today, logs: todayLogs, totalIntake: total });
      })
      .catch((err: any) => setLogsError(err.message ?? "Failed to load hydration data"))
      .finally(() => setLogsLoading(false));
  }, []);

  // Check for reminders
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const hour = now.getHours();
      const minutesSinceLastDrink = hydrationData.logs.length > 0
        ? (now.getTime() - new Date(hydrationData.logs[hydrationData.logs.length - 1].timestamp).getTime()) / 1000 / 60
        : 120;

      // Remind if no water in last 2 hours during waking hours
      if (hour >= 8 && hour <= 22 && minutesSinceLastDrink > 120) {
        setShowReminder(true);
      }

      // Dehydration alert
      if (hydrationData.totalIntake < dailyGoal * 0.3 && hour >= 14) {
        toast.warning("Hydration Alert", {
          description: "You're behind on your hydration goal. Drink some water!",
        });
      }
    };

    const interval = setInterval(checkReminder, 30000); // Check every 30 seconds
    checkReminder();

    return () => clearInterval(interval);
  }, [hydrationData, dailyGoal]);

  const logWater = async (amount: number, type: 'water' | 'coffee' | 'tea' | 'other' = 'water') => {
    try {
      const item = await createHydrationLog({
        amount_ml: amount,
        type,
        logged_at: new Date().toISOString(),
      });
      const newLog: HydrationLog = {
        id: item.id,
        timestamp: item.logged_at,
        amount: item.amount_ml,
        type: (item.type as HydrationLog["type"]) ?? type,
      };
      setHydrationData(prev => ({
        ...prev,
        logs: [...prev.logs, newLog],
        totalIntake: prev.totalIntake + newLog.amount,
      }));
      setShowReminder(false);
      toast.success(`Logged ${amount}ml of ${type}!`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to log water intake");
    }
  };

  const removeLastLog = async () => {
    if (hydrationData.logs.length === 0) return;

    const lastLog = hydrationData.logs[hydrationData.logs.length - 1];
    try {
      await deleteHydrationLog(lastLog.id);
      setHydrationData(prev => ({
        ...prev,
        logs: prev.logs.slice(0, -1),
        totalIntake: prev.totalIntake - lastLog.amount,
      }));
      toast.info("Last entry removed");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to remove entry");
    }
  };

  const progressPercentage = Math.min((hydrationData.totalIntake / dailyGoal) * 100, 100);
  const chartData = generateHourlyData(hydrationData.logs);

  // Hydration status
  const getHydrationStatus = () => {
    const percentage = (hydrationData.totalIntake / dailyGoal) * 100;
    if (percentage >= 90) return { status: 'Excellent', color: '#10b981', icon: CheckCircle };
    if (percentage >= 60) return { status: 'Good', color: '#3b82f6', icon: TrendingUp };
    if (percentage >= 30) return { status: 'Fair', color: '#f59e0b', icon: Clock };
    return { status: 'Low', color: '#ef4444', icon: AlertCircle };
  };

  const hydrationStatus = getHydrationStatus();
  const StatusIcon = hydrationStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 pb-24">
      <PageHeader
        title="Hydration Tracker"
        showHome
        className="bg-gradient-to-r from-blue-500 to-cyan-500"
      />

      <div className="px-6 mt-6 space-y-6">
        {/* API error banner */}
        {logsError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{logsError}</span>
          </div>
        )}

        {/* Loading state */}
        {logsLoading && (
          <div className="bg-white rounded-3xl shadow-xl p-8 flex items-center justify-center gap-3 text-gray-400">
            <Droplet className="h-5 w-5 animate-pulse" />
            <span className="text-sm">Loading hydration data…</span>
          </div>
        )}

        {/* Smart Reminder */}
        {showReminder && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-amber-900 mb-1">
                Time to Hydrate! 💧
              </div>
              <div className="text-sm text-amber-800">
                It's been over 2 hours since your last drink. Your body needs water!
              </div>
            </div>
            <button
              onClick={() => setShowReminder(false)}
              className="text-amber-600 hover:text-amber-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Progress Circle */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="transform -rotate-90 w-64 h-64">
              {/* Background circle */}
              <circle
                cx="128"
                cy="128"
                r="100"
                stroke="#e0f2fe"
                strokeWidth="20"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="128"
                cy="128"
                r="100"
                stroke={`url(#hydrationGradient-${uniqueId})`}
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${(progressPercentage / 100) * 628.32} 628.32`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id={`hydrationGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplet className="h-12 w-12 text-cyan-500 mb-2" />
              <div className="text-4xl font-bold text-gray-800">
                {hydrationData.totalIntake}
              </div>
              <div className="text-sm text-gray-600">ml / {dailyGoal}ml</div>
              <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: `${hydrationStatus.color}20` }}>
                <StatusIcon className="h-4 w-4" style={{ color: hydrationStatus.color }} />
                <span className="text-xs font-semibold" style={{ color: hydrationStatus.color }}>
                  {hydrationStatus.status}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-600">
            {Math.round(progressPercentage)}% of daily goal
          </div>
        </div>

        {/* Quick Log Buttons */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-cyan-600" />
            Quick Log
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {CONTAINER_SIZES.map((container) => {
              const Icon = container.icon;
              return (
                <button
                  key={container.label}
                  onClick={() => logWater(container.amount)}
                  className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all"
                >
                  <Icon className="h-8 w-8 text-blue-600" />
                  <div className="text-sm font-semibold text-gray-800">{container.label}</div>
                  <div className="text-xs text-gray-600">{container.ml}</div>
                </button>
              );
            })}
          </div>

          {hydrationData.logs.length > 0 && (
            <button
              onClick={removeLastLog}
              className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition-all"
            >
              <Minus className="h-4 w-4" />
              <span className="text-sm font-medium">Undo Last Entry</span>
            </button>
          )}
        </div>

        {/* Hourly Intake Chart */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Intake Pattern (24h)
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`intakeGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
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
                dataKey="intake"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#intakeGradient)"
                name="Intake (ml)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Logs */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Today's Log ({hydrationData.logs.length} entries)
          </h3>

          {hydrationData.logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Droplet className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No entries yet. Start logging your water intake!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...hydrationData.logs].reverse().map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Droplet className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {log.amount}ml
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">
                    {log.type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hydration Tips */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl shadow-xl p-6 border border-cyan-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-600" />
            Hydration & Energy Connection
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  Peak Performance Window
                </div>
                <div className="text-sm text-gray-600">
                  Drink 500ml within 2 hours of exercise for optimal hydration.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Flame className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  Metabolism Boost
                </div>
                <div className="text-sm text-gray-600">
                  Drinking 500ml of water can increase metabolism by 30% for 30-40 minutes.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  Engineer's Tip
                </div>
                <div className="text-sm text-gray-600">
                  2% dehydration = 20% cognitive decline. Stay sharp, stay hydrated!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
