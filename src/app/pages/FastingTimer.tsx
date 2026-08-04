import { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router";
import {
  Clock,
  Play,
  Pause,
  StopCircle,
  Flame,
  TrendingDown,
  Droplet,
  Zap,
  Award,
  Calendar,
  Target,
  Activity,
  Info,
  CheckCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

type FastingProtocol = '16:8' | '18:6' | '20:4' | 'omad' | 'custom';
type FastingPhase = 'anabolic' | 'catabolic' | 'fat-burning' | 'ketosis' | 'autophagy' | 'deep-autophagy';

type FastingSession = {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // hours
  protocol: FastingProtocol;
  weight?: number;
  notes?: string;
  completed: boolean;
};

const FASTING_PROTOCOLS = [
  { value: '16:8', label: '16:8', fast: 16, eat: 8, description: 'Beginner friendly' },
  { value: '18:6', label: '18:6', fast: 18, eat: 6, description: 'Intermediate' },
  { value: '20:4', label: '20:4', fast: 20, eat: 4, description: 'Advanced' },
  { value: 'omad', label: 'OMAD', fast: 23, eat: 1, description: 'One meal a day' },
];

const FASTING_PHASES = [
  { phase: 'anabolic', start: 0, end: 4, label: 'Anabolic', color: '#94a3b8', description: 'Digestion & nutrient absorption' },
  { phase: 'catabolic', start: 4, end: 8, label: 'Catabolic', color: '#06b6d4', description: 'Glycogen depletion begins' },
  { phase: 'fat-burning', start: 8, end: 12, label: 'Fat Burning', color: '#10b981', description: 'Body switches to fat for fuel' },
  { phase: 'ketosis', start: 12, end: 16, label: 'Ketosis', color: '#f59e0b', description: 'Ketone production increases' },
  { phase: 'autophagy', start: 16, end: 24, label: 'Autophagy', color: '#8b5cf6', description: 'Cellular cleanup activated' },
  { phase: 'deep-autophagy', start: 24, end: 48, label: 'Deep Autophagy', color: '#ec4899', description: 'Peak cellular regeneration' },
];

const generateMockSessions = (): FastingSession[] => {
  const sessions: FastingSession[] = [];
  const now = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(20, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(endDate.getHours() + 16 + Math.floor(Math.random() * 4));

    sessions.push({
      id: `session-${i}`,
      startTime: date.toISOString(),
      endTime: endDate.toISOString(),
      duration: 16 + Math.floor(Math.random() * 4),
      protocol: '16:8',
      weight: 75 + (Math.random() - 0.5) * 2,
      completed: true,
    });
  }

  return sessions;
};

export default function FastingTimer() {
  const navigate = useNavigate();
  const uniqueId = useId();

  const [sessions, setSessions] = useState<FastingSession[]>(() => {
    const stored = localStorage.getItem('fasting-sessions');
    if (stored) return JSON.parse(stored);
    return generateMockSessions();
  });

  const [currentSession, setCurrentSession] = useState<FastingSession | null>(() => {
    const stored = localStorage.getItem('current-fasting-session');
    if (stored) return JSON.parse(stored);
    return null;
  });

  const [isPaused, setIsPaused] = useState(false);
  const [elapsedHours, setElapsedHours] = useState(0);
  const [selectedProtocol, setSelectedProtocol] = useState<FastingProtocol>('16:8');
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [currentWeight, setCurrentWeight] = useState('');

  useEffect(() => {
    localStorage.setItem('fasting-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('current-fasting-session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('current-fasting-session');
    }
  }, [currentSession]);

  // Timer update
  useEffect(() => {
    if (!currentSession || isPaused) return;

    const interval = setInterval(() => {
      const start = new Date(currentSession.startTime);
      const now = new Date();
      const hours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
      setElapsedHours(hours);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, isPaused]);

  const completedSessions = sessions.filter(s => s.completed);
  const currentStreak = calculateStreak(sessions);
  const avgFastingHours = completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length || 0;
  const totalFasts = completedSessions.length;

  function calculateStreak(sessions: FastingSession[]): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const hasFast = sessions.some(s => {
        const sessionDate = new Date(s.startTime).toISOString().split('T')[0];
        return sessionDate === dateStr && s.completed;
      });

      if (hasFast) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  const getCurrentPhase = (hours: number): typeof FASTING_PHASES[0] | null => {
    return FASTING_PHASES.find(p => hours >= p.start && hours < p.end) || FASTING_PHASES[FASTING_PHASES.length - 1];
  };

  const handleStartFast = () => {
    const newSession: FastingSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      duration: 0,
      protocol: selectedProtocol,
      weight: currentWeight ? parseFloat(currentWeight) : undefined,
      completed: false,
    };

    setCurrentSession(newSession);
    setElapsedHours(0);
    setIsPaused(false);
    setShowStartDialog(false);
    toast.success('Fasting started!');
  };

  const handleEndFast = () => {
    if (!currentSession) return;

    const endedSession: FastingSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      duration: elapsedHours,
      completed: true,
    };

    setSessions(prev => [...prev, endedSession].sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    ));

    setCurrentSession(null);
    setElapsedHours(0);
    toast.success(`Fast completed! ${elapsedHours.toFixed(1)} hours`);
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h}h ${m}m ${s}s`;
  };

  const currentPhase = getCurrentPhase(elapsedHours);
  const protocol = FASTING_PROTOCOLS.find(p => p.value === selectedProtocol);
  const targetHours = protocol?.fast || 16;
  const progressPercentage = Math.min((elapsedHours / targetHours) * 100, 100);

  // Weight correlation chart
  const weightData = sessions
    .filter(s => s.weight)
    .slice(-14)
    .map((s, index) => ({
      id: `weight-${index}`,
      date: new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: s.weight,
      duration: s.duration,
    }));

  // Fasting duration trend
  const durationData = sessions
    .slice(-14)
    .map((s, index) => ({
      id: `duration-${index}`,
      date: new Date(s.startTime).toLocaleDateString('en-US', { weekday: 'short' }),
      duration: s.duration,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-orange-50 pb-24">
      <PageHeader
        title="Fasting Timer"
        showHome
        className="bg-gradient-to-r from-purple-600 to-pink-600"
        actions={
          <button
            onClick={() => setShowStatsDialog(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Activity className="h-5 w-5 text-white" />
          </button>
        }
      />

      <div className="px-6 mt-6 space-y-6">
        {/* Current Fast Timer */}
        {currentSession ? (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                <Flame className="h-5 w-5 text-purple-600 animate-pulse" />
                <span className="text-sm font-semibold text-purple-700">Fasting in Progress</span>
              </div>

              {/* Circular Progress */}
              <div className="relative w-64 h-64 mx-auto mb-6">
                <svg className="transform -rotate-90 w-64 h-64">
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    stroke="#e0e7ff"
                    strokeWidth="20"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="100"
                    stroke={currentPhase?.color || '#8b5cf6'}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={`${(progressPercentage / 100) * 628.32} 628.32`}
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-800">
                    {formatTime(elapsedHours).split(' ')[0]}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(elapsedHours).split(' ').slice(1).join(' ')}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Target: {targetHours}h
                  </div>
                </div>
              </div>

              {/* Current Phase */}
              {currentPhase && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentPhase.color }} />
                    <div className="text-lg font-bold" style={{ color: currentPhase.color }}>
                      {currentPhase.label}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{currentPhase.description}</div>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setIsPaused(!isPaused)}
                  variant="outline"
                  className="flex-1 max-w-xs"
                >
                  {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  onClick={handleEndFast}
                  className="flex-1 max-w-xs bg-red-600 hover:bg-red-700"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  End Fast
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <Clock className="h-16 w-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Start Fasting?</h3>
            <p className="text-gray-600 mb-6">Choose your protocol and begin your journey</p>
            <Button
              onClick={() => setShowStartDialog(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Fast
            </Button>
          </div>
        )}

        {/* Stats Cards */}
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
              <div className="bg-purple-100 rounded-full p-2">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Total Fasts</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalFasts}</div>
            <div className="text-xs text-gray-500">completed</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Avg Fast</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{avgFastingHours.toFixed(1)}</div>
            <div className="text-xs text-gray-500">hours</div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 rounded-full p-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Weight</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {weightData.length > 0 ? weightData[weightData.length - 1].weight?.toFixed(1) : '--'}
            </div>
            <div className="text-xs text-gray-500">kg</div>
          </div>
        </div>

        {/* Fasting Phases Timeline */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fasting Phases</h3>

          <div className="space-y-3">
            {FASTING_PHASES.map((phase) => (
              <div
                key={phase.phase}
                className={`p-3 rounded-xl border-2 transition-all ${
                  currentPhase?.phase === phase.phase
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
                    <span className="text-sm font-semibold text-gray-800">{phase.label}</span>
                  </div>
                  <span className="text-xs text-gray-600">{phase.start}-{phase.end}h</span>
                </div>
                <div className="text-xs text-gray-600">{phase.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Duration Trend */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fasting Duration (Last 14 Days)</h3>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={durationData}>
              <defs>
                <linearGradient id={`fastingGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
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
                dataKey="duration"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill={`url(#fastingGradient-${uniqueId})`}
                name="Hours"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weight Correlation */}
        {weightData.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weight Trend</h3>

            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Fasting Benefits */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Fasting Benefits
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Droplet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Autophagy Activation</div>
                <div className="text-sm text-gray-600">
                  16+ hours: cellular cleanup and regeneration begins.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Flame className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Fat Burning Mode</div>
                <div className="text-sm text-gray-600">
                  12+ hours: body switches from glucose to fat as primary fuel.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Insulin Sensitivity</div>
                <div className="text-sm text-gray-600">
                  Regular fasting improves insulin sensitivity by 20-30%.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Fast Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-600">Start New Fast</DialogTitle>
            <DialogDescription>Choose your fasting protocol and track your weight.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Fasting Protocol</Label>
              <div className="grid grid-cols-2 gap-2">
                {FASTING_PROTOCOLS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedProtocol(p.value as FastingProtocol)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedProtocol === p.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg font-bold text-gray-800">{p.label}</div>
                    <div className="text-xs text-gray-600">{p.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700 mb-2 block">
                Current Weight (kg) - Optional
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="75.5"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowStartDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartFast}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Start Fasting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
