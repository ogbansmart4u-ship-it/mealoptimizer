import { Pill, ChevronLeft, Plus, X, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import OnboardingProgress from "../components/OnboardingProgress";
import MascotEmptyState from "../components/MascotEmptyState";
import { useLanguage } from "../contexts/LanguageContext";
import { getMedications, createMedication, deleteMedication } from "../../lib/api";

// Stored frequency/time values stay in English (they're saved to the backend);
// these maps translate them for display only.
const FREQ_KEY: Record<string, string> = {
  "Once daily": "meds.freq.onceDaily",
  "Twice daily": "meds.freq.twiceDaily",
  "Three times daily": "meds.freq.threeDaily",
  "As needed": "meds.freq.asNeeded",
};
const TIME_KEY: Record<string, string> = {
  "Morning": "meds.time.morning",
  "Afternoon": "meds.time.afternoon",
  "Evening": "meds.time.evening",
  "Bedtime": "meds.time.bedtime",
  "Morning & Evening": "meds.time.morningEvening",
};

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
  const { t } = useLanguage();
  const freqLabel = (v: string) => (FREQ_KEY[v] ? t(FREQ_KEY[v]) : v);
  const timeLabel = (v: string) => (TIME_KEY[v] ? t(TIME_KEY[v]) : v);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
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
      .catch((err: any) => setLogsError(err.message ?? t("meds.errLoad")))
      .finally(() => setLogsLoading(false));
  }, []);

  // Open the add form and scroll it into view (so it's never "invisible" below the fold).
  const openAddForm = () => {
    setLogsError(null);
    setShowAddForm(true);
  };
  useEffect(() => {
    if (showAddForm) formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showAddForm]);

  const addMedication = async () => {
    // Only the name is required; dosage is optional (many users won't know it).
    if (!newMed.name.trim()) {
      setLogsError(t("meds.errNameRequired"));
      return;
    }
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
      setLogsError(err.message ?? t("meds.errAdd"));
    } finally {
      setSaving(false);
    }
  };

  const removeMedication = async (id: string) => {
    try {
      await deleteMedication(id);
      setMedications((prev) => prev.filter((med) => med.id !== id));
    } catch (err: any) {
      setLogsError(err.message ?? t("meds.errRemove"));
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
          <h1 className="text-2xl text-white flex-1">{t("planmeal.medications")}</h1>
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
            <p className="font-medium text-yellow-800 mb-1">{t("meds.important")}</p>
            <p>{t("meds.importantDesc")}</p>
          </div>
        </div>

        {/* Current Medications */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-[#1f7a8c]">{t("meds.current")}</h2>
            <button
              type="button"
              onClick={openAddForm}
              aria-label={t("meds.add")}
              className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-full p-2 hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {logsLoading ? (
            <div className="text-center py-8 text-gray-400">
              <Pill className="h-12 w-12 mx-auto mb-3 text-gray-200 animate-pulse" />
              <p className="text-sm">{t("meds.loading")}</p>
            </div>
          ) : medications.length === 0 ? (
            <MascotEmptyState
              title={t("meds.emptyTitle")}
              subtitle={t("meds.emptySubtitle")}
              action={
                <button
                  type="button"
                  onClick={openAddForm}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl px-5 py-3 font-medium hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4" /> {t("meds.add")}
                </button>
              }
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
                        <span>{freqLabel(med.frequency)}</span>
                      </div>
                      <span>•</span>
                      <span>{timeLabel(med.time)}</span>
                      {med.withFood && (
                        <>
                          <span>•</span>
                          <span>{t("meds.withFoodChip")}</span>
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
          <div ref={formRef} className="bg-white rounded-3xl shadow-lg p-6 mb-6 scroll-mt-20">
            <h2 className="text-lg text-[#1f7a8c] mb-4">{t("meds.addNew")}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">{t("meds.name")}</label>
                <input
                  type="text"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder={t("meds.namePlaceholder")}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">{t("meds.dosage")}</label>
                <input
                  type="text"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                  placeholder={t("meds.dosagePlaceholder")}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">{t("meds.frequency")}</label>
                <select
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                >
                  <option value="Once daily">{t("meds.freq.onceDaily")}</option>
                  <option value="Twice daily">{t("meds.freq.twiceDaily")}</option>
                  <option value="Three times daily">{t("meds.freq.threeDaily")}</option>
                  <option value="As needed">{t("meds.freq.asNeeded")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">{t("meds.timeOfDay")}</label>
                <select
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                >
                  <option value="Morning">{t("meds.time.morning")}</option>
                  <option value="Afternoon">{t("meds.time.afternoon")}</option>
                  <option value="Evening">{t("meds.time.evening")}</option>
                  <option value="Bedtime">{t("meds.time.bedtime")}</option>
                  <option value="Morning & Evening">{t("meds.time.morningEvening")}</option>
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
                  {t("meds.takeWithFood")}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 rounded-xl py-3 hover:bg-gray-50 transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="button"
                  onClick={addMedication}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl py-3 hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {saving ? t("meds.adding") : t("meds.addMedication")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drug Interaction Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#e63946] mb-4">{t("meds.interactionsTitle")}</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-xl">🥤</span>
              <p>{t("meds.tip1")}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🥛</span>
              <p>{t("meds.tip2")}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🍊</span>
              <p>{t("meds.tip3")}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">🍽️</span>
              <p>{t("meds.tip4")}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/medical-condition")}
            className="px-6 py-4 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            {t("meds.skip")}
          </button>
          <button
            onClick={() => navigate("/medical-condition")}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all"
          >
            {t("goalsetup.continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
