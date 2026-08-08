import { Pill, ChevronLeft, Plus, X, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import OnboardingProgress from "../components/OnboardingProgress";
import MascotEmptyState from "../components/MascotEmptyState";
import { getMedications, createMedication, deleteMedication } from "../../lib/api";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  withFood: boolean;
}

const mapApiItem = (item: any): Medication => ({
  id: String(item.id),
  name: item.name ?? "",
  dosage: item.dosage ?? "",
  frequency: item.frequency ?? "Once daily",
  time: item.time ?? "Morning",
  withFood: item.with_food ?? item.withFood ?? false,
});

export default function Medications() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency: "Once daily",
    time: "Morning",
    withFood: false,
  });

  useEffect(() => {
    getMedications()
      .then((items: any[]) => setMedications((items ?? []).map(mapApiItem)))
      .catch((err: any) => setLogsError(err.message ?? "Failed to load medications"))
      .finally(() => setLogsLoading(false));
  }, []);

  const addMedication = async () => {
    if (!newMed.name || !newMed.dosage) return;
    setSaving(true);
    setLogsError(null);
    try {
      const item = await createMedication({
        name: newMed.name,
        dosage: newMed.dosage,
        frequency: newMed.frequency,
        active: true,
        time: newMed.time,
        with_food: newMed.withFood,
      });
      setMedications((prev) => [...prev, mapApiItem(item)]);
      setNewMed({ name: "", dosage: "", frequency: "Once daily", time: "Morning", withFood: false });
      setShowAddForm(false);
    } catch (err: any) {
      setLogsError(err.message ?? "Failed to add medication");
    } finally {
      setSaving(false);
    }
  };

  const removeMedication = async (id: string) => {
    try {
      await deleteMedication(id);
      setMedications((prev) => prev.filter((med) => med.id !== id));
    } catch (err: any) {
      setLogsError(err.message ?? "Failed to remove medication");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl text-white flex-1">Medications</h1>
          <Pill className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Onboarding Progress */}
      <div className="px-6 mt-6">
        <OnboardingProgress currentStep={4} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* API error banner */}
        {logsError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{logsError}</span>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium text-yellow-800 mb-1">Important</p>
            <p>We'll check for food-drug interactions to keep you safe and optimize your nutrition plan.</p>
          </div>
        </div>

        {/* Current Medications */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-[#1f7a8c]">Current Medications</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-full p-2 hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {logsLoading ? (
            <div className="text-center py-8 text-gray-400">
              <Pill className="h-12 w-12 mx-auto mb-3 text-gray-200 animate-pulse" />
              <p className="text-sm">Loading medications…</p>
            </div>
          ) : medications.length === 0 ? (
            <MascotEmptyState
              title="No medications added yet"
              subtitle="Tap the + button to add your medications."
            />
          ) : (
            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 relative"
                >
                  <button
                    onClick={() => removeMedication(med.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  
                  <div className="pr-8">
                    <h3 className="text-lg text-gray-800 mb-1">{med.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{med.dosage}</p>
                    
                    <div className="flex gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{med.frequency}</span>
                      </div>
                      <span>•</span>
                      <span>{med.time}</span>
                      {med.withFood && (
                        <>
                          <span>•</span>
                          <span>🍽️ With food</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Medication Form */}
        {showAddForm && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h2 className="text-lg text-[#1f7a8c] mb-4">Add New Medication</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Medication Name</label>
                <input
                  type="text"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g., Aspirin"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Dosage</label>
                <input
                  type="text"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  placeholder="e.g., 500mg"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Frequency</label>
                <select
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                >
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>As needed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Time of Day</label>
                <select
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                >
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                  <option>Bedtime</option>
                  <option>Morning & Evening</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="withFood"
                  checked={newMed.withFood}
                  onChange={(e) => setNewMed({ ...newMed, withFood: e.target.checked })}
                  className="w-5 h-5 text-[#1f7a8c] rounded focus:ring-[#4ecdc4]"
                />
                <label htmlFor="withFood" className="text-sm text-gray-700">
                  Take with food
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 rounded-xl py-3 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addMedication}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl py-3 hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {saving ? "Adding…" : "Add Medication"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drug Interaction Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#e63946] mb-4">Food-Drug Interactions</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-xl">🥤</span>
              <p>Some medications need to be taken with plenty of water</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🥛</span>
              <p>Dairy products may affect certain antibiotic absorption</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🍊</span>
              <p>Grapefruit can interact with many medications</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🍽️</span>
              <p>We'll adjust your meal plans to avoid interactions</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/medical-condition")}
            className="px-6 py-4 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Skip
          </button>
          <button
            onClick={() => navigate("/medical-condition")}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
