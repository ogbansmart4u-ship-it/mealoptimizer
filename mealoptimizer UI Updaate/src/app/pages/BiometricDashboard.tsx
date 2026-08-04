import { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  Heart,
  Droplet,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Info,
  Flame,
  Moon,
  Sun,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { toast } from "sonner";

// Mock wearable data generator
const generateMockVitals = () => {
  const now = new Date();
  const hour = now.getHours();

  // Simulate realistic patterns
  const baseGlucose = 95 + Math.random() * 20;
  const baseActivity = hour >= 6 && hour <= 22 ? 40 + Math.random() * 40 : 10 + Math.random() * 20;
  const baseHeartRate = 60 + Math.random() * 20;

  return {
    glucose: Math.round(baseGlucose),
    heartRate: Math.round(baseHeartRate),
    activity: Math.round(baseActivity),
    sleep: hour < 6 || hour > 22 ? Math.round(60 + Math.random() * 30) : 0,
    steps: Math.round((hour - 6) * 500 + Math.random() * 1000),
    calories: Math.round((hour - 6) * 80 + Math.random() * 200),
    timestamp: now.toISOString(),
  };
};

// Generate hourly data for charts
const generateChartData = () => {
  const data = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = time.getHours();

    // Simulate realistic glucose and activity patterns
    const mealTimes = [7, 12, 19]; // Breakfast, lunch, dinner
    const isMealTime = mealTimes.some(t => Math.abs(hour - t) <= 1);

    const baseGlucose = isMealTime ? 110 + Math.random() * 30 : 85 + Math.random() * 15;
    const baseActivity = hour >= 6 && hour <= 22 ? 30 + Math.random() * 50 : 5 + Math.random() * 15;

    data.push({
      time: time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      glucose: Math.round(baseGlucose),
      activity: Math.round(baseActivity),
      heartRate: Math.round(60 + Math.random() * 25),
    });
  }

  return data;
};

export default function BiometricDashboard() {
  const navigate = useNavigate();
  const uniqueId = useId();
  const [vitals, setVitals] = useState(generateMockVitals());
  const [chartData, setChartData] = useState(generateChartData());
  const [darkMode, setDarkMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus('syncing');
      setTimeout(() => {
        setVitals(generateMockVitals());
        setChartData(generateChartData());
        setSyncStatus('synced');
      }, 1000);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Check for alerts
  useEffect(() => {
    if (vitals.glucose > 140) {
      toast.warning("Glucose Alert", {
        description: "Your blood sugar is elevated. Consider a light walk or hydration.",
      });
    }
  }, [vitals.glucose]);

  // Calculate metabolic status
  const getMetabolicStatus = () => {
    if (vitals.glucose > 140) return { status: 'amber', label: 'Elevated', color: '#f59e0b' };
    if (vitals.glucose > 125) return { status: 'warning', label: 'Watch', color: '#eab308' };
    return { status: 'optimal', label: 'Optimal', color: '#10b981' };
  };

  const metabolicStatus = getMetabolicStatus();
  const gaugePercentage = Math.min((vitals.glucose / 180) * 100, 100);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5]'} pb-24 transition-colors`}>
      <PageHeader
        title="Bio-Digital Twin"
        showHome
        className={darkMode ? 'bg-gray-800' : 'bg-[#1f7a8c]'}
        actions={
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-white" />}
          </button>
        }
      />

      <div className="px-6 mt-6 space-y-6">
        {/* Sync Status */}
        <div className={`flex items-center justify-between px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white/50'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Connection Error'}
            </span>
          </div>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Last update: {new Date(vitals.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Metabolic Status Gauge */}
        <div className={`rounded-3xl shadow-xl p-8 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h3 className={`text-center mb-6 text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Metabolic Status
          </h3>

          {/* Circular Gauge */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="transform -rotate-90 w-48 h-48">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke={darkMode ? '#374151' : '#e5e7eb'}
                strokeWidth="16"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke={metabolicStatus.color}
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${(gaugePercentage / 100) * 502.4} 502.4`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold" style={{ color: metabolicStatus.color }}>
                {vitals.glucose}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>mg/dL</div>
              <div className="mt-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${metabolicStatus.color}20`, color: metabolicStatus.color }}>
                {metabolicStatus.label}
              </div>
            </div>
          </div>

          {/* Biometric Correction Tip */}
          {vitals.glucose > 125 && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Engineer's Correction
                  </div>
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    {vitals.glucose > 140
                      ? "Take a 10-minute walk to help lower glucose. Avoid simple carbs for the next 2 hours."
                      : "Your glucose is slightly elevated. Drink water and consider a light activity."
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vital Signs Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl p-5 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Heart Rate</span>
            </div>
            <div className={`text-3xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{vitals.heartRate}</div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>bpm</div>
          </div>

          <div className={`rounded-2xl p-5 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Activity</span>
            </div>
            <div className={`text-3xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{vitals.activity}</div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>% active</div>
          </div>

          <div className={`rounded-2xl p-5 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-2">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Calories</span>
            </div>
            <div className={`text-3xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{vitals.calories}</div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>kcal burned</div>
          </div>

          <div className={`rounded-2xl p-5 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Steps</span>
            </div>
            <div className={`text-3xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{vitals.steps.toLocaleString()}</div>
            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>today</div>
          </div>
        </div>

        {/* Activity vs Glucose Chart */}
        <div className={`rounded-3xl shadow-xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h3 className={`mb-4 text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Activity vs Glucose (24h)
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`glucoseGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id={`activityGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis
                dataKey="time"
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  color: darkMode ? '#f3f4f6' : '#1f2937',
                }}
              />
              <Area
                type="monotone"
                dataKey="glucose"
                stroke="#ef4444"
                strokeWidth={2}
                fill={`url(#glucoseGradient-${uniqueId})`}
                name="Glucose (mg/dL)"
              />
              <Area
                type="monotone"
                dataKey="activity"
                stroke="#3b82f6"
                strokeWidth={2}
                fill={`url(#activityGradient-${uniqueId})`}
                name="Activity (%)"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Glucose</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Activity</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className={`rounded-3xl shadow-xl p-6 ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Info className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Today's Insights
            </h3>
          </div>

          <div className="space-y-3">
            <div className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Strong Activity Pattern
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your activity levels correlate well with glucose control today.
                </div>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Meal Timing Optimized
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your glucose spikes align with circadian patterns. Keep it up!
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
