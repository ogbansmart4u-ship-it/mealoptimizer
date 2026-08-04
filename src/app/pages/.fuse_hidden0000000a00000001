import { Scale, ChevronLeft, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import OnboardingProgress from "../components/OnboardingProgress";
import { getWeightLogs, createWeightLog, deleteWeightLog } from "../../lib/api";

interface WeightLog {
  id: string;
  weight_kg: number;
  notes?: string;
  logged_at: string;
}

export default function Weight() {
  const navigate = useNavigate();
  const [weight, setWeight] = useState("70");
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");
  const [height, setHeight] = useState("170");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getWeightLogs()
      .then((items) => setWeightLogs(items ?? []))
      .catch((err) => setLogsError(err.message ?? "Failed to load weight history"))
      .finally(() => setLogsLoading(false));
  }, []);

  const handleLogWeight = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const weightKg = unit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;
      const newLog = await createWeightLog({
        weight_kg: parseFloat(weightKg.toFixed(2)),
        notes: "",
        logged_at: new Date().toISOString(),
      });
      setWeightLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      setSaveError(err.message ?? "Failed to save weight entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWeightLog(id);
      setWeightLogs((prev) => prev.filter((l) => l.id !== id));
    } catch {
      // silently ignore — item stays in list
    }
  };

  const calculateBMI = () => {
    const weightKg = unit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    const heightM = heightUnit === "cm" ? parseFloat(height) / 100 : parseFloat(height) * 0.3048;
    
    if (weightKg && heightM) {
      const bmi = weightKg / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return "0.0";
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: "Underweight", color: "text-blue-600", bg: "bg-blue-50" };
    if (bmi < 25) return { text: "Normal", color: "text-green-600", bg: "bg-green-50" };
    if (bmi < 30) return { text: "Overweight", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "Obese", color: "text-red-600", bg: "bg-red-50" };
  };

  const bmi = parseFloat(calculateBMI());
  const category = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-8">
      {/* Header */}
      <div className="bg-[#1f7a8c] px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate("/home")}
            className="mr-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl text-white flex-1">Weight & BMI</h1>
          <Scale className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Onboarding Progress */}
      <div className="px-6 mt-6">
        <OnboardingProgress currentStep={2} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Weight Input */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Current Weight</h2>
          <div className="flex gap-3 items-center mb-4">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 text-4xl text-center text-[#1f7a8c] bg-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#4ecdc4]"
              placeholder="70"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setUnit("kg")}
                className={`px-6 py-2 rounded-xl transition-all ${
                  unit === "kg"
                    ? "bg-[#1f7a8c] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                kg
              </button>
              <button
                onClick={() => setUnit("lbs")}
                className={`px-6 py-2 rounded-xl transition-all ${
                  unit === "lbs"
                    ? "bg-[#1f7a8c] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* Height Input */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Height</h2>
          <div className="flex gap-3 items-center mb-4">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="flex-1 text-4xl text-center text-[#1f7a8c] bg-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#4ecdc4]"
              placeholder="170"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setHeightUnit("cm")}
                className={`px-6 py-2 rounded-xl transition-all ${
                  heightUnit === "cm"
                    ? "bg-[#1f7a8c] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                cm
              </button>
              <button
                onClick={() => setHeightUnit("ft")}
                className={`px-6 py-2 rounded-xl transition-all ${
                  heightUnit === "ft"
                    ? "bg-[#1f7a8c] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                ft
              </button>
            </div>
          </div>
        </div>

        {/* BMI Result */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Your BMI</h2>
          <div className={`${category.bg} rounded-2xl p-6 mb-4`}>
            <div className="text-center mb-3">
              <div className={`text-5xl ${category.color} mb-2`}>{bmi}</div>
              <div className={`text-lg ${category.color}`}>{category.text}</div>
            </div>
          </div>

          {/* BMI Scale */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
            <div className="h-3 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full"></div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{"<18.5"}</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>{">30"}</span>
            </div>
          </div>
        </div>

        {/* Weight History */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Weight History</h2>
          {logsLoading ? (
            <div className="text-center py-6 text-gray-400">Loading history…</div>
          ) : logsError ? (
            <div className="text-center py-4 text-red-500 text-sm">{logsError}</div>
          ) : weightLogs.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">No entries yet. Log your first weight below.</div>
          ) : (
            <div className="space-y-2">
              {weightLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                  <div>
                    <span className="text-[#1f7a8c] font-semibold">{log.weight_kg} kg</span>
                    {log.notes ? <span className="ml-2 text-xs text-gray-500">{log.notes}</span> : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {new Date(log.logged_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {saveError && (
            <div className="mt-3 text-center text-red-500 text-sm">{saveError}</div>
          )}
        </div>

        {/* Weight Goal */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#e63946] mb-4">Weight Goals</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:shadow-md transition-all">
              <TrendingDown className="h-6 w-6 text-blue-600" />
              <div className="flex-1 text-left">
                <p className="text-gray-800 font-medium">Lose Weight</p>
                <p className="text-sm text-gray-600">Reduce body fat and reach target weight</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:shadow-md transition-all">
              <div className="h-6 w-6 text-green-600 text-xl">⚖️</div>
              <div className="flex-1 text-left">
                <p className="text-gray-800 font-medium">Maintain Weight</p>
                <p className="text-sm text-gray-600">Keep your current healthy weight</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl hover:shadow-md transition-all">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <div className="flex-1 text-left">
                <p className="text-gray-800 font-medium">Gain Weight</p>
                <p className="text-sm text-gray-600">Build muscle and increase body mass</p>
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/age")}
            className="px-6 py-4 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Skip
          </button>
          <button
            onClick={async () => { await handleLogWeight(); navigate("/age"); }}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
