import { useState, useEffect, useId } from "react";
import { useNavigate } from "react-router";
import {
  Activity,
  Heart,
  Droplet,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Flame,
  Moon,
  Sun,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  Radio,
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import CGMSensorVisualizer from "../components/CGMSensorVisualizer";
import { SkeletonDashboard } from "../components/SkeletonLoader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { toast } from "sonner";
import { getBiometrics, createBiometric, deleteBiometric } from "../../lib/api";

interface Reading {
  id: string;
  metric: string;
  value: string;
  unit: string | null;
  logged_at: string;
}

// Metric registry — drives the entry form, cards, and labels.
const METRICS = [
  { key: "glucose", label: "Glucose", unit: "mg/dL", icon: Droplet, color: "#ef4444" },
  { key: "heart_rate", label: "Heart Rate", unit: "bpm", icon: Heart, color: "#ef4444" },
  { key: "blood_pressure", label: "Blood Pressure", unit: "mmHg", icon: Activity, color: "#8b5cf6", text: true },
  { key: "steps", label: "Steps", unit: "steps", icon: Zap, color: "#10b981" },
  { key: "calories", label: "Calories", unit: "kcal", icon: Flame, color: "#f97316" },
  { key: "spo2", label: "Blood Oxygen", unit: "%", icon: Droplet, color: "#06b6d4" },
] as const;

const metricInfo = (key: string) => METRICS.find((m) => m.key === key);

export default function BiometricDashboard() {
  const navigate = useNavigate();
  const uniqueId = useId();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<"cgm" | "manual">("cgm");

  const load = async () => {
    try {
      const items = await getBiometrics();
      setReadings(items ?? []);
    } catch (err) {
      toast.error("Couldn't load your biometrics", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const latest = (key: string) =>
    readings
      .filter((r) => r.metric === key)
      .sort((a, b) => +new Date(b.logged_at) - +new Date(a.logged_at))[0];

  const glucoseReading = latest("glucose");
  const glucose = glucoseReading ? parseFloat(glucoseReading.value) : null;

  const glucoseSeries = readings
    .filter((r) => r.metric === "glucose")
    .sort((a, b) => +new Date(a.logged_at) - +new Date(b.logged_at))
    .slice(-24)
    .map((r) => ({
      time: new Date(r.logged_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric" }),
      glucose: parseFloat(r.value) || 0,
    }));

  const getMetabolicStatus = () => {
    if (glucose === null) return { label: "No data", color: "#9ca3af" };
    if (glucose > 140) return { label: "Elevated", color: "#f59e0b" };
    if (glucose > 125) return { label: "Watch", color: "#eab308" };
    return { label: "Optimal", color: "#10b981" };
  };
  const metabolicStatus = getMetabolicStatus();
  const gaugePercentage = glucose === null ? 0 : Math.min((glucose / 180) * 100, 100);

  const handleAdd = async (metric: string, value: string, unit: string, loggedAt: string) => {
    try {
      const created = await createBiometric({ metric, value, unit, logged_at: loggedAt });
      setReadings((prev) => [created, ...prev]);
      toast.success("Reading saved");
    } catch (err) {
      toast.error("Couldn't save reading", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBiometric(id);
      setReadings((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reading removed");
    } catch (err) {
      toast.error("Couldn't remove reading", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  const lastUpdated = readings.length
    ? new Date(
        readings.reduce((a, b) => (+new Date(a.logged_at) > +new Date(b.logged_at) ? a : b)).logged_at,
      ).toLocaleString()
    : null;

  const cardMetrics = ["heart_rate", "blood_pressure", "steps", "calories"];

  const cardClass = darkMode ? "bg-stone-900/90 border border-stone-800" : "bg-white border border-stone-200/80 shadow-xs";
  const subText = darkMode ? "text-stone-400" : "text-stone-500";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#0F1412] text-stone-100" : "bg-[#FAF8F5] text-stone-900"} pb-28 transition-colors`}>
      <PageHeader
        title="Bio-Digital Twin"
        showHome
        className={darkMode ? "bg-stone-900" : "bg-[#164E3D]"}
        actions={
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-white" />}
          </button>
        }
      />

      <div className="px-4 sm:px-6 mt-6 space-y-5 max-w-2xl mx-auto">
        {/* View Mode Segmented Control */}
        <div className="flex bg-white dark:bg-stone-900/90 p-1.5 rounded-2xl gap-1.5 shadow-xs border border-stone-200/80 dark:border-stone-800">
          <button
            onClick={() => setViewMode("cgm")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "cgm"
                ? "bg-[#164E3D] text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Radio size={14} />
            <span>CGM 24-Hr Sensor Stream</span>
          </button>
          <button
            onClick={() => setViewMode("manual")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "manual"
                ? "bg-[#164E3D] text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Activity size={14} />
            <span>Manual Vitals &amp; Logs</span>
          </button>
        </div>

        {viewMode === "cgm" ? (
          <CGMSensorVisualizer />
        ) : (
          <>
            {/* Header row: last updated + add reading */}
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border ${darkMode ? "bg-stone-900/80 border-stone-800" : "bg-white/80 border-stone-200/80"}`}>
              <span className={`text-xs ${darkMode ? "text-stone-400" : "text-stone-500"}`}>
                {lastUpdated ? `Last reading: ${lastUpdated}` : "No readings yet"}
              </span>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#164E3D] text-white rounded-xl hover:bg-[#123E31] transition-colors text-xs font-bold cursor-pointer active:scale-95 shadow-2xs"
              >
                <Plus className="h-4 w-4" /> Add reading
              </button>
            </div>

            {/* Link to meal ↔ glucose insights */}
            <button
              onClick={() => navigate("/glucose-insights")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                darkMode ? "bg-stone-900/90 border border-stone-800 hover:bg-stone-800" : "bg-white border border-stone-200/80 shadow-xs hover:bg-stone-50"
              }`}
            >
              <div className="rounded-xl p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#164E3D] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className={`text-xs font-bold ${darkMode ? "text-stone-200" : "text-stone-900"}`}>Meal &amp; Glucose Correlation</div>
                <div className={`text-xs ${subText} mt-0.5`}>See which meals spike your blood sugar</div>
              </div>
              <ChevronRight className={`h-5 w-5 ${darkMode ? "text-stone-500" : "text-stone-400"}`} />
            </button>

            {loading ? (
              <SkeletonDashboard />
            ) : readings.length === 0 ? (
              <div className={`rounded-3xl p-8 text-center ${cardClass}`}>
                <Activity className="h-12 w-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                <h3 className={`font-bold mb-1 ${darkMode ? "text-stone-200" : "text-stone-800"}`}>No biometrics yet</h3>
                <p className={`text-xs mb-4 ${subText}`}>
                  Log your first reading — glucose, heart rate, blood pressure and more — to build your telemetry dashboard.
                </p>
                <Button onClick={() => setShowAdd(true)} className="bg-[#164E3D] hover:bg-[#123E31] text-xs font-bold rounded-xl">
                  <Plus className="h-4 w-4 mr-1" /> Add your first reading
                </Button>
              </div>
            ) : (
          <>
            {/* Metabolic Status Gauge (glucose) */}
            <div className={`rounded-3xl p-6 sm:p-8 shadow-xs border ${darkMode ? "bg-stone-900/90 border-stone-800" : "bg-white border-stone-200/80"}`}>
              <h3 className={`text-center mb-6 text-lg font-black ${darkMode ? "text-stone-200" : "text-stone-800"}`}>
                Metabolic Status
              </h3>
              <div className="relative w-48 h-48 mx-auto mb-2">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle cx="96" cy="96" r="80" stroke={darkMode ? "#292524" : "#f5f5f4"} strokeWidth="16" fill="none" />
                  <circle
                    cx="96" cy="96" r="80"
                    stroke={metabolicStatus.color}
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(gaugePercentage / 100) * 502.4} 502.4`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-black" style={{ color: metabolicStatus.color }}>
                    {glucose === null ? "—" : glucose}
                  </div>
                  <div className={`text-xs font-bold ${subText}`}>mg/dL</div>
                  <div className="mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${metabolicStatus.color}20`, color: metabolicStatus.color }}>
                    {metabolicStatus.label}
                  </div>
                </div>
              </div>
              {glucose === null && (
                <p className={`text-center text-xs ${subText}`}>Log a glucose reading to see your metabolic status.</p>
              )}

              {glucose !== null && glucose > 125 && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200 mb-0.5">Clinical Suggestion</div>
                      <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                        {glucose > 140
                          ? "Your last glucose reading is high. A 10-minute walk and hydration can help; avoid simple carbs for the next couple of hours."
                          : "Your last glucose reading is slightly elevated. Drink water and consider light physical activity."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vital signs grid — latest logged value per metric */}
            <div className="grid grid-cols-2 gap-3.5">
              {cardMetrics.map((key) => {
                const info = metricInfo(key)!;
                const Icon = info.icon;
                const r = latest(key);
                return (
                  <div key={key} className={`rounded-2xl p-4 sm:p-5 ${cardClass}`}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="rounded-xl p-2" style={{ backgroundColor: `${info.color}20` }}>
                        <Icon className="h-4 w-4" style={{ color: info.color }} />
                      </div>
                      <span className={`text-xs font-bold ${subText}`}>{info.label}</span>
                    </div>
                    <div className={`text-2xl sm:text-3xl font-black ${darkMode ? "text-stone-200" : "text-stone-800"}`}>
                      {r ? r.value : "—"}
                    </div>
                    <div className={`text-xs font-medium ${darkMode ? "text-stone-400" : "text-stone-500"} mt-0.5`}>
                      {r ? (r.unit || info.unit) : "no reading yet"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Glucose chart */}
            <div className={`rounded-3xl p-6 shadow-xs border ${darkMode ? "bg-stone-900/90 border-stone-800" : "bg-white border-stone-200/80"}`}>
              <h3 className={`mb-4 text-base font-extrabold ${darkMode ? "text-stone-200" : "text-stone-800"}`}>
                Glucose Trend
              </h3>
              {glucoseSeries.length < 2 ? (
                <p className={`text-xs py-8 text-center ${subText}`}>
                  Log at least two glucose readings to see your trend.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={glucoseSeries}>
                    <defs>
                      <linearGradient id={`glucoseGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#292524" : "#e5e7eb"} />
                    <XAxis dataKey="time" stroke={darkMode ? "#a8a29e" : "#78716c"} fontSize={12} />
                    <YAxis stroke={darkMode ? "#a8a29e" : "#78716c"} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1c1917" : "#ffffff",
                        border: darkMode ? "1px solid #44403c" : "1px solid #e7e5e4",
                        borderRadius: "1rem",
                        color: darkMode ? "#f5f5f4" : "#1c1917",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="glucose" stroke="#ef4444" strokeWidth={2.5} fill={`url(#glucoseGradient-${uniqueId})`} name="Glucose (mg/dL)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent readings */}
            <div className={`rounded-3xl p-6 shadow-xs border ${darkMode ? "bg-stone-900/90 border-stone-800" : "bg-white border-stone-200/80"}`}>
              <div className="flex items-center gap-2 mb-4">
                <Info className={`h-5 w-5 ${darkMode ? "text-emerald-400" : "text-[#164E3D]"}`} />
                <h3 className={`text-base font-extrabold ${darkMode ? "text-stone-200" : "text-stone-800"}`}>Recent Readings</h3>
              </div>
              <div className="space-y-2">
                {readings
                  .slice()
                  .sort((a, b) => +new Date(b.logged_at) - +new Date(a.logged_at))
                  .slice(0, 15)
                  .map((r) => {
                    const info = metricInfo(r.metric);
                    const Icon = info?.icon ?? Activity;
                    return (
                      <div key={r.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${darkMode ? "bg-stone-800/80 border-stone-700/80" : "bg-stone-50 border-stone-200/80"}`}>
                        <div className="rounded-xl p-2" style={{ backgroundColor: `${info?.color ?? "#164E3D"}20` }}>
                          <Icon className="h-4 w-4" style={{ color: info?.color ?? "#164E3D" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold ${darkMode ? "text-stone-200" : "text-stone-800"}`}>
                            {info?.label ?? r.metric}: {r.value} {r.unit || info?.unit || ""}
                          </div>
                          <div className={`text-xs ${darkMode ? "text-stone-400" : "text-stone-500"} mt-0.5`}>
                            {new Date(r.logged_at).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          aria-label="Delete reading"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Positive insight when glucose is in range */}
            {glucose !== null && glucose <= 125 && (
              <div className={`rounded-3xl p-5 shadow-xs border ${darkMode ? "bg-stone-900/90 border-stone-800" : "bg-white border-stone-200/80"}`}>
                <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${darkMode ? "bg-emerald-950/40 border-emerald-800/60" : "bg-emerald-50 border-emerald-200/80"}`}>
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className={`text-xs font-bold ${darkMode ? "text-emerald-200" : "text-emerald-900"}`}>Glucose in optimal range</div>
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">Your latest reading looks great. Keep up the balanced food and hydration habits!</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
          </>
        )}
      </div>

      <AddReadingDialog isOpen={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      <BottomNav />
    </div>
  );
}

function AddReadingDialog({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (metric: string, value: string, unit: string, loggedAt: string) => Promise<void>;
}) {
  const [metric, setMetric] = useState<string>("glucose");
  const [value, setValue] = useState("");
  const [when, setWhen] = useState(() => toLocalInput(new Date()));
  const [saving, setSaving] = useState(false);

  const info = metricInfo(metric)!;

  const reset = () => {
    setMetric("glucose");
    setValue("");
    setWhen(toLocalInput(new Date()));
  };

  const submit = async () => {
    const v = value.trim();
    if (!v) {
      toast.error("Enter a value");
      return;
    }
    if (!("text" in info && info.text) && isNaN(Number(v))) {
      toast.error("Value must be a number");
      return;
    }
    setSaving(true);
    try {
      const loggedAt = when ? new Date(when).toISOString() : new Date().toISOString();
      await onAdd(metric, v, info.unit, loggedAt);
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o && !saving) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 text-stone-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-stone-900 dark:text-white">Add Biometric Reading</DialogTitle>
          <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">Log a vital sign measurement to your clinical dashboard.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="bm-metric" className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 block">Metric</Label>
            <select
              id="bm-metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-2.5 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs text-stone-900 dark:text-white font-medium outline-none"
            >
              {METRICS.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="bm-value" className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 block">Value ({info.unit})</Label>
            <Input
              id="bm-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode={"text" in info && info.text ? "text" : "decimal"}
              placeholder={metric === "blood_pressure" ? "e.g. 120/80" : "e.g. 105"}
              className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs h-10 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="bm-when" className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 block">Date &amp; Time</Label>
            <Input
              id="bm-when"
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs h-10 rounded-xl"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button onClick={() => { reset(); onClose(); }} variant="outline" className="flex-1 bg-transparent border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs rounded-xl" disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} className="flex-1 bg-[#164E3D] hover:bg-[#123E31] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span>
              ) : "Save reading"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Format a Date for an <input type="datetime-local"> in local time.
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
