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
} from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
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

  const cardClass = darkMode ? "bg-gray-800 border border-gray-700" : "bg-white shadow-lg";
  const subText = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5]"} pb-24 transition-colors`}>
      <PageHeader
        title="Bio-Digital Twin"
        showHome
        className={darkMode ? "bg-gray-800" : "bg-[#1f7a8c]"}
        actions={
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-white" />}
          </button>
        }
      />

      <div className="px-6 mt-6 space-y-6">
        {/* Header row: last updated + add reading */}
        <div className={`flex items-center justify-between px-4 py-2 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white/50"}`}>
          <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {lastUpdated ? `Last reading: ${lastUpdated}` : "No readings yet"}
          </span>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f7a8c] text-white rounded-lg hover:bg-[#1a6273] transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add reading
          </button>
        </div>

        {/* Link to meal ↔ glucose insights */}
        <button
          onClick={() => navigate("/glucose-insights")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${darkMode ? "bg-gray-800 border border-gray-700 hover:bg-gray-700" : "bg-white shadow-sm hover:bg-gray-50"}`}
        >
          <div className="rounded-lg p-2" style={{ backgroundColor: "#1f7a8c20" }}>
            <TrendingUp className="h-5 w-5 text-[#1f7a8c]" />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Meal &amp; glucose insights</div>
            <div className={`text-xs ${subText}`}>See which meals spike your blood sugar</div>
          </div>
          <ChevronRight className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`} />
        </button>

        {loading ? (
          <div className={`rounded-3xl p-10 flex items-center justify-center ${cardClass}`}>
            <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
          </div>
        ) : readings.length === 0 ? (
          <div className={`rounded-3xl p-8 text-center ${cardClass}`}>
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className={`font-semibold mb-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>No biometrics yet</h3>
            <p className={`text-sm mb-4 ${subText}`}>
              Log your first reading — glucose, heart rate, blood pressure and more — to build your dashboard.
            </p>
            <Button onClick={() => setShowAdd(true)} className="bg-[#1f7a8c] hover:bg-[#1a6273]">
              <Plus className="h-4 w-4 mr-1" /> Add your first reading
            </Button>
          </div>
        ) : (
          <>
            {/* Metabolic Status Gauge (glucose) */}
            <div className={`rounded-3xl shadow-xl p-8 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>
              <h3 className={`text-center mb-6 text-xl font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                Metabolic Status
              </h3>
              <div className="relative w-48 h-48 mx-auto mb-2">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle cx="96" cy="96" r="80" stroke={darkMode ? "#374151" : "#e5e7eb"} strokeWidth="16" fill="none" />
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
                  <div className="text-5xl font-bold" style={{ color: metabolicStatus.color }}>
                    {glucose === null ? "—" : glucose}
                  </div>
                  <div className={`text-sm ${subText}`}>mg/dL</div>
                  <div className="mt-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${metabolicStatus.color}20`, color: metabolicStatus.color }}>
                    {metabolicStatus.label}
                  </div>
                </div>
              </div>
              {glucose === null && (
                <p className={`text-center text-xs ${subText}`}>Log a glucose reading to see your metabolic status.</p>
              )}

              {glucose !== null && glucose > 125 && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Suggestion</div>
                      <div className="text-sm text-amber-800 dark:text-amber-300">
                        {glucose > 140
                          ? "Your last glucose reading is high. A 10-minute walk and hydration can help; avoid simple carbs for the next couple of hours."
                          : "Your last glucose reading is slightly elevated. Drink water and consider a light activity."}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vital signs grid — latest logged value per metric */}
            <div className="grid grid-cols-2 gap-4">
              {cardMetrics.map((key) => {
                const info = metricInfo(key)!;
                const Icon = info.icon;
                const r = latest(key);
                return (
                  <div key={key} className={`rounded-2xl p-5 ${cardClass}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-full p-2" style={{ backgroundColor: `${info.color}20` }}>
                        <Icon className="h-5 w-5" style={{ color: info.color }} />
                      </div>
                      <span className={`text-sm ${subText}`}>{info.label}</span>
                    </div>
                    <div className={`text-3xl font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                      {r ? r.value : "—"}
                    </div>
                    <div className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      {r ? (r.unit || info.unit) : "no reading yet"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Glucose chart */}
            <div className={`rounded-3xl shadow-xl p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>
              <h3 className={`mb-4 text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                Glucose trend
              </h3>
              {glucoseSeries.length < 2 ? (
                <p className={`text-sm py-8 text-center ${subText}`}>
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
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                    <XAxis dataKey="time" stroke={darkMode ? "#9ca3af" : "#6b7280"} style={{ fontSize: "11px" }} />
                    <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: darkMode ? "#f3f4f6" : "#1f2937",
                      }}
                    />
                    <Area type="monotone" dataKey="glucose" stroke="#ef4444" strokeWidth={2} fill={`url(#glucoseGradient-${uniqueId})`} name="Glucose (mg/dL)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recent readings */}
            <div className={`rounded-3xl shadow-xl p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>
              <div className="flex items-center gap-2 mb-4">
                <Info className={`h-5 w-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Recent readings</h3>
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
                      <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                        <div className="rounded-lg p-2" style={{ backgroundColor: `${info?.color ?? "#1f7a8c"}20` }}>
                          <Icon className="h-4 w-4" style={{ color: info?.color ?? "#1f7a8c" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                            {info?.label ?? r.metric}: {r.value} {r.unit || info?.unit || ""}
                          </div>
                          <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {new Date(r.logged_at).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
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
              <div className={`rounded-3xl shadow-xl p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"}`}>
                <div className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className={`text-sm font-semibold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Glucose in range</div>
                    <div className={`text-sm ${subText}`}>Your latest reading looks good. Keep up the healthy habits.</div>
                  </div>
                </div>
              </div>
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add reading</DialogTitle>
          <DialogDescription>Log a biometric measurement to your dashboard.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="bm-metric">Metric</Label>
            <select
              id="bm-metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {METRICS.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="bm-value">Value ({info.unit})</Label>
            <Input
              id="bm-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              inputMode={"text" in info && info.text ? "text" : "decimal"}
              placeholder={metric === "blood_pressure" ? "e.g. 120/80" : "e.g. 105"}
            />
          </div>

          <div>
            <Label htmlFor="bm-when">Date & time</Label>
            <Input id="bm-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <Button onClick={() => { reset(); onClose(); }} variant="outline" className="flex-1" disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]" disabled={saving}>
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
