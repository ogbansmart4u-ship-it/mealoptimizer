import { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router";
import {
  Moon,
  Sun,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Heart,
  AlertCircle,
  CheckCircle,
  Plus,
  Calendar,
  Info,
  Sparkles,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { SkeletonList } from '../components/SkeletonLoader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { getSleepLogs, createSleepLog } from "../../lib/api";

type SleepStage = 'deep' | 'light' | 'rem' | 'awake';

type SleepSession = {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  totalMinutes: number;
  stages: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
  quality: number;
  mood: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
};

const SLEEP_STAGE_INFO = {
  deep: { labelKey: 'sleep.stageDeep', color: '#3b82f6', descKey: 'sleep.descDeep' },
  light: { labelKey: 'sleep.stageLight', color: '#60a5fa', descKey: 'sleep.descLight' },
  rem: { labelKey: 'sleep.stageRem', color: '#a78bfa', descKey: 'sleep.descRem' },
  awake: { labelKey: 'sleep.stageAwake', color: '#f59e0b', descKey: 'sleep.descAwake' },
};

const generateMockSleepData = (): SleepSession[] => {
  const sessions: SleepSession[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const totalMinutes = 360 + Math.random() * 120; // 6-8 hours
    const deepMinutes = totalMinutes * (0.15 + Math.random() * 0.1);
    const remMinutes = totalMinutes * (0.2 + Math.random() * 0.1);
    const awakeMinutes = totalMinutes * (0.05 + Math.random() * 0.05);
    const lightMinutes = totalMinutes - deepMinutes - remMinutes - awakeMinutes;

    const quality = Math.round(
      (deepMinutes / totalMinutes) * 100 * 0.4 +
      (remMinutes / totalMinutes) * 100 * 0.3 +
      (1 - awakeMinutes / totalMinutes) * 100 * 0.3
    );

    sessions.push({
      id: `session-${i}`,
      date: dateStr,
      bedtime: '23:00',
      wakeTime: '07:00',
      totalMinutes: Math.round(totalMinutes),
      stages: {
        deep: Math.round(deepMinutes),
        light: Math.round(lightMinutes),
        rem: Math.round(remMinutes),
        awake: Math.round(awakeMinutes),
      },
      quality,
      mood: quality >= 80 ? 'excellent' : quality >= 65 ? 'good' : quality >= 50 ? 'fair' : 'poor',
    });
  }

  return sessions;
};

const calculateBedtimeRecommendation = (sleepSessions: SleepSession[]) => {
  if (sleepSessions.length === 0) {
    return {
      recommendedBedtime: '22:30',
      recommendedWakeTime: '06:30',
      targetHours: 8,
      reasonKey: 'sleep.reasonDefault',
    };
  }

  const avgQuality = sleepSessions.reduce((sum, s) => sum + s.quality, 0) / sleepSessions.length;
  const avgDuration = sleepSessions.reduce((sum, s) => sum + s.totalMinutes, 0) / sleepSessions.length / 60;

  let targetHours = 8;
  if (avgQuality < 60) targetHours = 8.5;
  if (avgDuration < 6.5) targetHours = 8;

  return {
    recommendedBedtime: '22:30',
    recommendedWakeTime: '06:30',
    targetHours,
    reasonKey: avgQuality >= 70 ? 'sleep.reasonGood' : 'sleep.reasonIncrease',
  };
};

const mapApiItem = (item: any): SleepSession => {
  const start = new Date(item.sleep_start);
  const end = new Date(item.sleep_end);
  const totalMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
  const deepMinutes = totalMinutes * 0.20;
  const remMinutes = totalMinutes * 0.24;
  const awakeMinutes = totalMinutes * 0.05;
  const lightMinutes = totalMinutes - deepMinutes - remMinutes - awakeMinutes;
  const quality = item.quality ?? Math.round(
    (deepMinutes / totalMinutes) * 100 * 0.4 +
    (remMinutes / totalMinutes) * 100 * 0.3 +
    (1 - awakeMinutes / totalMinutes) * 100 * 0.3
  );
  return {
    id: item.id,
    date: start.toISOString().split('T')[0],
    bedtime: start.toTimeString().slice(0, 5),
    wakeTime: end.toTimeString().slice(0, 5),
    totalMinutes,
    stages: {
      deep: Math.round(deepMinutes),
      light: Math.round(lightMinutes),
      rem: Math.round(remMinutes),
      awake: Math.round(awakeMinutes),
    },
    quality,
    mood: quality >= 80 ? 'excellent' : quality >= 65 ? 'good' : quality >= 50 ? 'fair' : 'poor',
    notes: item.notes,
  };
};

export default function SleepTracker() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const uniqueId = useId();

  const [sleepSessions, setSleepSessions] = useState<SleepSession[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: '23:00',
    wakeTime: '07:00',
    mood: 'good' as SleepSession['mood'],
    notes: '',
  });

  useEffect(() => {
    getSleepLogs()
      .then((items: any[]) => {
        const sessions = (items ?? []).map(mapApiItem);
        sessions.sort((a, b) => a.date.localeCompare(b.date));
        setSleepSessions(sessions);
      })
      .catch((err: any) => setLogsError(err.message ?? t('sleep.loadError')))
      .finally(() => setLogsLoading(false));
  }, []);

  const todaySession = sleepSessions.find(s => s.date === new Date().toISOString().split('T')[0]);
  const last7Days = sleepSessions.slice(-7);
  const avgQuality = last7Days.length > 0
    ? last7Days.reduce((sum, s) => sum + s.quality, 0) / last7Days.length
    : 0;
  const avgDuration = last7Days.length > 0
    ? last7Days.reduce((sum, s) => sum + s.totalMinutes, 0) / last7Days.length
    : 0;
  const recommendation = calculateBedtimeRecommendation(sleepSessions);

  const handleAddSleep = async () => {
    const bedtimeParts = formData.bedtime.split(':');
    const wakeTimeParts = formData.wakeTime.split(':');

    const bedtimeMinutes = parseInt(bedtimeParts[0]) * 60 + parseInt(bedtimeParts[1]);
    const wakeTimeMinutes = parseInt(wakeTimeParts[0]) * 60 + parseInt(wakeTimeParts[1]);

    // Build ISO timestamps; wake on next day if earlier than bedtime
    const sleepStart = new Date(`${formData.date}T${formData.bedtime}:00`).toISOString();
    const wakeDateStr = wakeTimeMinutes < bedtimeMinutes
      ? new Date(new Date(formData.date).getTime() + 86400000).toISOString().split('T')[0]
      : formData.date;
    const sleepEnd = new Date(`${wakeDateStr}T${formData.wakeTime}:00`).toISOString();

    let totalMinutes = wakeTimeMinutes - bedtimeMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;

    const deepMinutes = totalMinutes * (0.18 + Math.random() * 0.08);
    const remMinutes = totalMinutes * (0.22 + Math.random() * 0.08);
    const awakeMinutes = totalMinutes * (0.03 + Math.random() * 0.04);

    const quality = Math.round(
      (deepMinutes / totalMinutes) * 100 * 0.4 +
      (remMinutes / totalMinutes) * 100 * 0.3 +
      (1 - awakeMinutes / totalMinutes) * 100 * 0.3
    );

    setSaving(true);
    try {
      const item = await createSleepLog({
        sleep_start: sleepStart,
        sleep_end: sleepEnd,
        quality,
        notes: formData.notes,
      });
      const newSession = mapApiItem(item);
      setSleepSessions(prev => {
        const filtered = prev.filter(s => s.date !== newSession.date);
        return [...filtered, newSession].sort((a, b) => a.date.localeCompare(b.date));
      });
      toast.success(t('sleep.logged'));
      setShowAddDialog(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        bedtime: '23:00',
        wakeTime: '07:00',
        mood: 'good',
        notes: '',
      });
    } catch (err: any) {
      toast.error(err.message ?? t('sleep.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const chartData = last7Days.map((session, index) => ({
    id: `sleep-${index}`,
    date: session.date, // ISO YYYY-MM-DD — always unique, used as recharts key
    hours: Number((session.totalMinutes / 60).toFixed(1)),
    quality: session.quality,
    deep: session.stages.deep,
    light: session.stages.light,
    rem: session.stages.rem,
    awake: session.stages.awake,
  }));

  const formatDateTick = (iso: string) =>
    new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 pb-24">
      <PageHeader
        title={t('sleep.title')}
        showHome
        className="bg-gradient-to-r from-indigo-600 to-purple-600"
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
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{logsError}</span>
          </div>
        )}

        {/* Loading state */}
        {logsLoading && <SkeletonList count={2} />}

        {/* Sleep Quality Score */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Moon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">{t('sleep.sevenDayAvg')}</span>
            </div>

            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
              {Math.round(avgQuality)}
            </div>
            <div className="text-gray-600 mb-4">{t('sleep.qualityScore')}</div>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{(avgDuration / 60).toFixed(1)}h {t('sleep.avgSuffix')}</span>
              </div>
              <div className="flex items-center gap-2">
                {avgQuality >= 70 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                )}
                <span className={avgQuality >= 70 ? 'text-green-600' : 'text-orange-600'}>
                  {avgQuality >= 70 ? t('sleep.good') : t('sleep.needsImprovement')}
                </span>
              </div>
            </div>
          </div>

          {/* Sleep Stage Breakdown - Last Night */}
          {todaySession && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">{t('sleep.lastNight')}</h4>

              <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden mb-3">
                {Object.entries(todaySession.stages).map(([stage, minutes]) => {
                  const percentage = (minutes / todaySession.totalMinutes) * 100;
                  const stageInfo = SLEEP_STAGE_INFO[stage as SleepStage];
                  return (
                    <div
                      key={stage}
                      className="inline-block h-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: stageInfo.color,
                      }}
                      title={`${t(stageInfo.labelKey)}: ${minutes}min`}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(todaySession.stages).map(([stage, minutes]) => {
                  const stageInfo = SLEEP_STAGE_INFO[stage as SleepStage];
                  const Icon = stage === 'deep' ? Zap : stage === 'rem' ? Brain : stage === 'awake' ? AlertCircle : Moon;
                  return (
                    <div key={stage} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stageInfo.color }} />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-700">{t(stageInfo.labelKey)}</div>
                        <div className="text-xs text-gray-500">{minutes}min</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bedtime Recommendation */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-6 border-2 border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{t('sleep.recommendation')}</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
              <div className="flex items-center gap-3">
                <Moon className="h-6 w-6 text-indigo-600" />
                <div>
                  <div className="text-sm font-semibold text-gray-700">{t('sleep.bedtime')}</div>
                  <div className="text-xs text-gray-500">{t('sleep.bedtimeDesc')}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-600">{recommendation.recommendedBedtime}</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
              <div className="flex items-center gap-3">
                <Sun className="h-6 w-6 text-amber-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-700">{t('sleep.wakeTime')}</div>
                  <div className="text-xs text-gray-500">{t('sleep.wakeTimeDesc')}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600">{recommendation.recommendedWakeTime}</div>
            </div>

            <div className="p-4 bg-white rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    {t('sleep.targetPrefix')}: {recommendation.targetHours} {t('sleep.hours')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t(recommendation.reasonKey)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Duration Chart */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('sleep.durationChart')}</h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tickFormatter={formatDateTick} stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <defs>
                <linearGradient id={`sleepGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <Bar dataKey="hours" fill={`url(#sleepGradient-${uniqueId})`} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep Quality Trend */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('sleep.qualityTrend')}</h3>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`qualityGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tickFormatter={formatDateTick} stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="quality"
                stroke="#a855f7"
                strokeWidth={2}
                fill={`url(#qualityGradient-${uniqueId})`}
                name="Quality Score"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-gray-600">{t('sleep.qualityLegend')}</span>
          </div>
        </div>

        {/* Sleep Science Tips */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            {t('sleep.science')}
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t('sleep.tip1Title')}</div>
                <div className="text-sm text-gray-600">
                  {t('sleep.tip1Body')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Brain className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t('sleep.tip2Title')}</div>
                <div className="text-sm text-gray-600">
                  {t('sleep.tip2Body')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t('sleep.tip3Title')}</div>
                <div className="text-sm text-gray-600">
                  {t('sleep.tip3Body')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Heart className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t('sleep.tip4Title')}</div>
                <div className="text-sm text-gray-600">
                  {t('sleep.tip4Body')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Sleep Sessions */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('sleep.recentSessions')}</h3>

          <div className="space-y-3">
            {last7Days.slice().reverse().map((session) => (
              <div key={session.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    session.quality >= 80 ? 'bg-green-100 text-green-700' :
                    session.quality >= 65 ? 'bg-blue-100 text-blue-700' :
                    session.quality >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {session.quality} {t('sleep.scoreSuffix')}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>{session.bedtime}</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>{session.wakeTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{(session.totalMinutes / 60).toFixed(1)}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Sleep Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-indigo-600">{t('sleep.logSession')}</DialogTitle>
            <DialogDescription>{t('sleep.logSessionDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 block">
                {t('sleep.date')}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bedtime" className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('sleep.bedtime')}
                </Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={formData.bedtime}
                  onChange={(e) => setFormData({ ...formData, bedtime: e.target.value })}
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="wakeTime" className="text-sm font-medium text-gray-700 mb-2 block">
                  {t('sleep.wakeTime')}
                </Label>
                <Input
                  id="wakeTime"
                  type="time"
                  value={formData.wakeTime}
                  onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('sleep.howFeel')}
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {(['excellent', 'good', 'fair', 'poor'] as const).map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setFormData({ ...formData, mood })}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.mood === mood
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {mood === 'excellent' ? '😄' : mood === 'good' ? '🙂' : mood === 'fair' ? '😐' : '😴'}
                    <div className="text-xs mt-1">{t(mood === 'excellent' ? 'sleep.moodExcellent' : mood === 'good' ? 'sleep.moodGood' : mood === 'fair' ? 'sleep.moodFair' : 'sleep.moodPoor')}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowAddDialog(false)}
                variant="outline"
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleAddSleep}
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? t('common.saving') : t('sleep.saveSession')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
