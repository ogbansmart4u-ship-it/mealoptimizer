import { useState, useEffect, useId } from "react";
import { ArrowLeft, Plus, TrendingUp, AlertCircle, Calendar, Search, X } from "lucide-react";
import { useNavigate } from "react-router";
import { getSymptomLogs, createSymptomLog, updateSymptomLog, deleteSymptomLog } from "../../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Severity = "mild" | "moderate" | "severe";

type Symptom = {
  id: string;
  date: string;
  time: string;
  symptom: string;
  severity: Severity;
  triggers: string[];
  notes: string;
  relatedFood?: string;
  relatedActivity?: string;
  relatedSleep?: number;
  relatedStress?: number;
};

type SymptomPattern = {
  symptom: string;
  count: number;
  avgSeverity: number;
  commonTriggers: string[];
};

const COMMON_SYMPTOMS = [
  "Headache",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Stomach Pain",
  "Joint Pain",
  "Muscle Ache",
  "Anxiety",
  "Insomnia",
  "Heartburn",
  "Bloating",
  "Rash",
  "Chest Pain",
  "Shortness of Breath",
  "Brain Fog",
];

const COMMON_TRIGGERS = [
  "Caffeine",
  "Alcohol",
  "Sugar",
  "Dairy",
  "Gluten",
  "Stress",
  "Lack of Sleep",
  "Exercise",
  "Weather Change",
  "Dehydration",
  "Skipped Meal",
  "Loud Noise",
  "Bright Light",
  "Screen Time",
  "Medication",
];

const mockData: Symptom[] = [
  {
    id: "1",
    date: "2026-04-19",
    time: "14:30",
    symptom: "Headache",
    severity: "moderate",
    triggers: ["Caffeine", "Screen Time"],
    notes: "Started after lunch",
    relatedFood: "Coffee",
    relatedSleep: 6,
    relatedStress: 7,
  },
  {
    id: "2",
    date: "2026-04-21",
    time: "09:15",
    symptom: "Fatigue",
    severity: "mild",
    triggers: ["Lack of Sleep"],
    notes: "Woke up tired",
    relatedSleep: 5,
    relatedStress: 5,
  },
  {
    id: "3",
    date: "2026-04-23",
    time: "18:45",
    symptom: "Headache",
    severity: "severe",
    triggers: ["Stress", "Skipped Meal"],
    notes: "Very intense, took medication",
    relatedStress: 9,
  },
  {
    id: "4",
    date: "2026-04-25",
    time: "11:00",
    symptom: "Nausea",
    severity: "moderate",
    triggers: ["Dairy"],
    notes: "After having milk",
    relatedFood: "Milk",
  },
  {
    id: "5",
    date: "2026-04-27",
    time: "16:20",
    symptom: "Bloating",
    severity: "mild",
    triggers: ["Gluten"],
    notes: "After pasta",
    relatedFood: "Pasta",
  },
  {
    id: "6",
    date: "2026-04-29",
    time: "08:30",
    symptom: "Headache",
    severity: "moderate",
    triggers: ["Caffeine", "Lack of Sleep"],
    notes: "Morning headache",
    relatedSleep: 5.5,
    relatedStress: 6,
  },
  {
    id: "7",
    date: "2026-05-01",
    time: "13:15",
    symptom: "Anxiety",
    severity: "moderate",
    triggers: ["Stress", "Caffeine"],
    notes: "Before meeting",
    relatedStress: 8,
  },
  {
    id: "8",
    date: "2026-05-03",
    time: "10:00",
    symptom: "Fatigue",
    severity: "moderate",
    triggers: ["Lack of Sleep", "Sugar"],
    notes: "Energy crash",
    relatedSleep: 6,
    relatedStress: 5,
  },
];

const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case "mild":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "moderate":
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "severe":
      return "bg-red-100 text-red-700 border-red-300";
  }
};

const getSeverityValue = (severity: Severity) => {
  switch (severity) {
    case "mild":
      return 1;
    case "moderate":
      return 2;
    case "severe":
      return 3;
  }
};

const mapApiItem = (item: any): Symptom => {
  const dt = new Date(item.logged_at);
  return {
    id: item.id,
    date: dt.toISOString().split("T")[0],
    time: dt.toTimeString().slice(0, 5),
    symptom: item.symptom,
    severity: (item.severity as Severity) ?? "mild",
    triggers: Array.isArray(item.triggers) ? item.triggers : [],
    notes: item.notes ?? "",
    relatedFood: item.related_food ?? undefined,
    relatedActivity: item.related_activity ?? undefined,
    relatedSleep: item.related_sleep ?? undefined,
    relatedStress: item.related_stress ?? undefined,
  };
};

export default function SymptomTracker() {
  const navigate = useNavigate();
  const uniqueId = useId();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<Severity | "all">("all");

  const [formData, setFormData] = useState({
    symptom: "",
    customSymptom: "",
    severity: "mild" as Severity,
    triggers: [] as string[],
    customTrigger: "",
    notes: "",
    relatedFood: "",
    relatedActivity: "",
    relatedSleep: "",
    relatedStress: "",
  });

  useEffect(() => {
    getSymptomLogs()
      .then((items: any[]) => setSymptoms((items ?? []).map(mapApiItem)))
      .catch((err: any) => setLogsError(err.message ?? "Failed to load symptom data"))
      .finally(() => setLogsLoading(false));
  }, []);

  const handleAddSymptom = async () => {
    const symptomName = formData.symptom === "custom" ? formData.customSymptom : formData.symptom;
    const payload = {
      symptom: symptomName,
      severity: formData.severity,
      logged_at: new Date().toISOString(),
      notes: formData.notes,
      triggers: formData.triggers,
      related_food: formData.relatedFood || undefined,
      related_activity: formData.relatedActivity || undefined,
      related_sleep: formData.relatedSleep ? parseFloat(formData.relatedSleep) : undefined,
      related_stress: formData.relatedStress ? parseInt(formData.relatedStress) : undefined,
    };

    setSaving(true);
    try {
      if (editingSymptom) {
        const item = await updateSymptomLog(editingSymptom.id, payload);
        const updated = mapApiItem(item);
        setSymptoms((prev) => prev.map((s) => (s.id === editingSymptom.id ? updated : s)));
      } else {
        const item = await createSymptomLog(payload);
        const created = mapApiItem(item);
        setSymptoms((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      // Surface the error inline without closing the dialog
      setLogsError(err.message ?? "Failed to save symptom");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      symptom: "",
      customSymptom: "",
      severity: "mild",
      triggers: [],
      customTrigger: "",
      notes: "",
      relatedFood: "",
      relatedActivity: "",
      relatedSleep: "",
      relatedStress: "",
    });
    setShowAddDialog(false);
    setEditingSymptom(null);
  };

  const handleEdit = (symptom: Symptom) => {
    setEditingSymptom(symptom);
    setFormData({
      symptom: COMMON_SYMPTOMS.includes(symptom.symptom) ? symptom.symptom : "custom",
      customSymptom: COMMON_SYMPTOMS.includes(symptom.symptom) ? "" : symptom.symptom,
      severity: symptom.severity,
      triggers: symptom.triggers,
      customTrigger: "",
      notes: symptom.notes,
      relatedFood: symptom.relatedFood || "",
      relatedActivity: symptom.relatedActivity || "",
      relatedSleep: symptom.relatedSleep?.toString() || "",
      relatedStress: symptom.relatedStress?.toString() || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSymptomLog(id);
      setSymptoms((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setLogsError(err.message ?? "Failed to delete symptom");
    }
  };

  const toggleTrigger = (trigger: string) => {
    setFormData((prev) => ({
      ...prev,
      triggers: prev.triggers.includes(trigger)
        ? prev.triggers.filter((t) => t !== trigger)
        : [...prev.triggers, trigger],
    }));
  };

  const addCustomTrigger = () => {
    if (formData.customTrigger.trim() && !formData.triggers.includes(formData.customTrigger.trim())) {
      setFormData((prev) => ({
        ...prev,
        triggers: [...prev.triggers, prev.customTrigger.trim()],
        customTrigger: "",
      }));
    }
  };

  const filteredSymptoms = symptoms.filter((symptom) => {
    const matchesSearch =
      symptom.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symptom.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symptom.triggers.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = filterSeverity === "all" || symptom.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  // Analytics
  const symptomPatterns: SymptomPattern[] = Object.values(
    symptoms.reduce((acc, symptom) => {
      if (!acc[symptom.symptom]) {
        acc[symptom.symptom] = {
          symptom: symptom.symptom,
          count: 0,
          avgSeverity: 0,
          commonTriggers: [],
        };
      }
      acc[symptom.symptom].count++;
      return acc;
    }, {} as Record<string, SymptomPattern>)
  )
    .map((pattern) => {
      const relatedSymptoms = symptoms.filter((s) => s.symptom === pattern.symptom);
      const avgSeverity =
        relatedSymptoms.reduce((sum, s) => sum + getSeverityValue(s.severity), 0) / relatedSymptoms.length;
      const allTriggers = relatedSymptoms.flatMap((s) => s.triggers);
      const triggerCounts = allTriggers.reduce((acc, trigger) => {
        acc[trigger] = (acc[trigger] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const commonTriggers = Object.entries(triggerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([trigger]) => trigger);
      return { ...pattern, avgSeverity, commonTriggers };
    })
    .sort((a, b) => b.count - a.count);

  // Severity trend (last 14 days)
  const severityTrend = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const dateStr = date.toISOString().split("T")[0];
    const daySymptoms = symptoms.filter((s) => s.date === dateStr);
    const avgSeverity =
      daySymptoms.length > 0
        ? daySymptoms.reduce((sum, s) => sum + getSeverityValue(s.severity), 0) / daySymptoms.length
        : 0;
    return {
      id: `symptom-day-${dateStr}-${i}`,
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      severity: parseFloat(avgSeverity.toFixed(1)),
      count: daySymptoms.length,
    };
  });

  // Trigger frequency
  const triggerFrequency = Object.entries(
    symptoms.flatMap((s) => s.triggers).reduce((acc, trigger) => {
      acc[trigger] = (acc[trigger] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([trigger, count], index) => ({ id: `trigger-${index}`, trigger, count }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 pb-20">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-full transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-center text-2xl font-bold">Symptom Tracker</h1>
          <div className="w-10"></div>
        </div>
        <p className="text-center text-red-100 text-sm">Track symptoms and identify patterns</p>
      </div>

      <div className="p-6 space-y-6">
        {/* API error banner */}
        {logsError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{logsError}</span>
          </div>
        )}

        {/* Loading state */}
        {logsLoading && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-gray-100">
            <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2 animate-pulse" />
            <p className="text-gray-400 text-sm">Loading symptom data…</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-red-100">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{symptoms.length}</p>
            <p className="text-xs text-gray-500">Total Logged</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border-2 border-orange-100">
            <TrendingUp className="h-8 w-8 text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-gray-800">{symptomPatterns.length}</p>
            <p className="text-xs text-gray-500">Unique Symptoms</p>
          </div>
        </div>

        {/* Severity Trend Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-500" />
            Severity Trend (14 Days)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={severityTrend} key={`area-chart-${uniqueId}`}>
              <defs>
                <linearGradient id={`severityGradient-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis domain={[0, 3]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="severity"
                stroke="#ef4444"
                fillOpacity={1}
                fill={`url(#severityGradient-${uniqueId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trigger Frequency */}
        {triggerFrequency.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-100">
            <h2 className="font-bold text-gray-800 mb-4">Common Triggers</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={triggerFrequency} key={`bar-chart-${uniqueId}`}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                <XAxis dataKey="trigger" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Symptom Patterns */}
        {symptomPatterns.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-red-100">
            <h2 className="font-bold text-gray-800 mb-4">Symptom Patterns</h2>
            <div className="space-y-3">
              {symptomPatterns.slice(0, 5).map((pattern) => (
                <div key={pattern.symptom} className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{pattern.symptom}</h3>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{pattern.count}x</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Avg Severity: {pattern.avgSeverity.toFixed(1)}/3
                  </p>
                  {pattern.commonTriggers.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pattern.commonTriggers.map((trigger) => (
                        <span
                          key={trigger}
                          className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full border border-orange-300"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search symptoms, triggers, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterSeverity("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterSeverity === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSeverity("mild")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterSeverity === "mild"
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              }`}
            >
              Mild
            </button>
            <button
              onClick={() => setFilterSeverity("moderate")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterSeverity === "moderate"
                  ? "bg-orange-500 text-white"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              Moderate
            </button>
            <button
              onClick={() => setFilterSeverity("severe")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterSeverity === "severe"
                  ? "bg-red-500 text-white"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              Severe
            </button>
          </div>
        </div>

        {/* Symptom Log */}
        <div className="space-y-3">
          <h2 className="font-bold text-gray-800">Recent Symptoms</h2>
          {filteredSymptoms.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-gray-100">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No symptoms logged yet</p>
            </div>
          ) : (
            filteredSymptoms.map((symptom) => (
              <div key={symptom.id} className="bg-white rounded-2xl p-4 shadow-lg border-2 border-red-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{symptom.symptom}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(symptom.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      at {symptom.time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                      symptom.severity
                    )}`}
                  >
                    {symptom.severity}
                  </span>
                </div>

                {symptom.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {symptom.triggers.map((trigger) => (
                      <span
                        key={trigger}
                        className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-200"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                )}

                {symptom.notes && <p className="text-sm text-gray-600 mb-2 italic">{symptom.notes}</p>}

                {(symptom.relatedFood ||
                  symptom.relatedActivity ||
                  symptom.relatedSleep !== undefined ||
                  symptom.relatedStress !== undefined) && (
                  <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 space-y-1">
                    {symptom.relatedFood && <p>🍽️ Food: {symptom.relatedFood}</p>}
                    {symptom.relatedActivity && <p>💪 Activity: {symptom.relatedActivity}</p>}
                    {symptom.relatedSleep !== undefined && <p>😴 Sleep: {symptom.relatedSleep}h</p>}
                    {symptom.relatedStress !== undefined && <p>😰 Stress: {symptom.relatedStress}/10</p>}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(symptom)}
                    className="flex-1 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(symptom.id)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <Plus className="h-8 w-8" />
      </button>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSymptom ? "Edit Symptom" : "Log Symptom"}</DialogTitle>
            <DialogDescription>
              Record your symptom and any related factors to help identify patterns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptom</label>
              <select
                value={formData.symptom}
                onChange={(e) => setFormData({ ...formData, symptom: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
              >
                <option value="">Select symptom</option>
                {COMMON_SYMPTOMS.map((symptom) => (
                  <option key={symptom} value={symptom}>
                    {symptom}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>

            {formData.symptom === "custom" && (
              <div>
                <input
                  type="text"
                  placeholder="Enter custom symptom"
                  value={formData.customSymptom}
                  onChange={(e) => setFormData({ ...formData, customSymptom: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <div className="flex gap-2">
                {(["mild", "moderate", "severe"] as Severity[]).map((severity) => (
                  <button
                    key={severity}
                    onClick={() => setFormData({ ...formData, severity })}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition ${
                      formData.severity === severity
                        ? getSeverityColor(severity)
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Possible Triggers</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_TRIGGERS.map((trigger) => (
                  <button
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className={`px-3 py-1 rounded-full text-sm border-2 transition ${
                      formData.triggers.includes(trigger)
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom trigger"
                  value={formData.customTrigger}
                  onChange={(e) => setFormData({ ...formData, customTrigger: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && addCustomTrigger()}
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
                />
                <button
                  onClick={addCustomTrigger}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Add
                </button>
              </div>
              {formData.triggers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.triggers.map((trigger) => (
                    <span
                      key={trigger}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                    >
                      {trigger}
                      <button onClick={() => toggleTrigger(trigger)} className="hover:text-orange-900">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional details..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none resize-none"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Related Factors (Optional)</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Related food"
                  value={formData.relatedFood}
                  onChange={(e) => setFormData({ ...formData, relatedFood: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Related activity"
                  value={formData.relatedActivity}
                  onChange={(e) => setFormData({ ...formData, relatedActivity: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Hours of sleep last night"
                  value={formData.relatedSleep}
                  onChange={(e) => setFormData({ ...formData, relatedSleep: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="Stress level (0-10)"
                  value={formData.relatedStress}
                  onChange={(e) => setFormData({ ...formData, relatedStress: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-red-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSymptom}
                disabled={
                  saving ||
                  !formData.symptom ||
                  (formData.symptom === "custom" && !formData.customSymptom.trim())
                }
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : editingSymptom ? "Update" : "Log Symptom"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
