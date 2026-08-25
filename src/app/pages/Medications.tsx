import React, { useState, useEffect, useRef } from "react";
import {
  Pill,
  ChevronLeft,
  Plus,
  X,
  Clock,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Search,
  Heart,
  Droplet,
} from "lucide-react";
import { useNavigate } from "react-router";
import OnboardingProgress from "../components/OnboardingProgress";
import { useLanguage } from "../contexts/LanguageContext";
import { useMascot } from "../hooks/useMascot";
import Mascot from "../components/Mascot";
import { getMedications, createMedication, deleteMedication } from "../../lib/api";
import { triggerHaptic } from "../utils/celebration";

// Common African & Diaspora metabolic medications for 1-tap quick logging
const COMMON_MEDICATION_PRESETS = [
  {
    category: "🩸 Blood Sugar & Diabetes",
    meds: [
      { name: "Metformin (Glucophage)", dosage: "500mg", frequency: "Twice daily", time: "Morning & Evening", withFood: true, tag: "Blood Sugar" },
      { name: "Metformin (Glucophage)", dosage: "1000mg", frequency: "Twice daily", time: "Morning & Evening", withFood: true, tag: "Blood Sugar" },
      { name: "Glimepiride (Amaryl)", dosage: "2mg", frequency: "Once daily", time: "Morning", withFood: true, tag: "Insulin Secretor" },
      { name: "Empagliflozin (Jardiance)", dosage: "10mg", frequency: "Once daily", time: "Morning", withFood: false, tag: "Kidney Glucose" },
      { name: "Sitagliptin (Januvia)", dosage: "100mg", frequency: "Once daily", time: "Morning", withFood: false, tag: "DPP-4" },
    ],
  },
  {
    category: "❤️ Blood Pressure & Heart",
    meds: [
      { name: "Amlodipine (Norvasc)", dosage: "5mg", frequency: "Once daily", time: "Morning", withFood: false, tag: "Calcium Blocker" },
      { name: "Amlodipine (Norvasc)", dosage: "10mg", frequency: "Once daily", time: "Morning", withFood: false, tag: "Calcium Blocker" },
      { name: "Lisinopril (Zestril)", dosage: "10mg", frequency: "Once daily", time: "Morning", withFood: false, tag: "ACE Inhibitor" },
      { name: "Losartan (Cozaar)", dosage: "50mg", frequency: "Once daily", time: "Morning", withFood: false, tag: "ARB" },
      { name: "Hydrochlorothiazide (HCTZ)", dosage: "12.5mg", frequency: "Once daily", time: "Morning", withFood: true, tag: "Diuretic" },
    ],
  },
  {
    category: "🧪 Cholesterol & Cardiovascular",
    meds: [
      { name: "Atorvastatin (Lipitor)", dosage: "20mg", frequency: "Once daily", time: "Bedtime", withFood: false, tag: "Statin" },
      { name: "Rosuvastatin (Crestor)", dosage: "10mg", frequency: "Once daily", time: "Bedtime", withFood: false, tag: "Statin" },
      { name: "Baby Aspirin", dosage: "81mg", frequency: "Once daily", time: "Morning", withFood: true, tag: "Blood Thinner" },
    ],
  },
  {
    category: "🌿 Vitamins & Everyday Supplements",
    meds: [
      { name: "Vitamin D3", dosage: "2000 IU", frequency: "Once daily", time: "Morning", withFood: true, tag: "Immunity" },
      { name: "Omega-3 Fish Oil", dosage: "1000mg", frequency: "Once daily", time: "Morning", withFood: true, tag: "Heart & Joints" },
      { name: "Folic Acid / Iron", dosage: "400mcg", frequency: "Once daily", time: "Morning", withFood: true, tag: "Blood Health" },
      { name: "Magnesium Glycinate", dosage: "200mg", frequency: "Once daily", time: "Bedtime", withFood: false, tag: "Sleep & Muscle" },
    ],
  },
];

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
  const mascot = useMascot();

  const freqLabel = (v: string) => (FREQ_KEY[v] ? t(FREQ_KEY[v]) : v);
  const timeLabel = (v: string) => (TIME_KEY[v] ? t(TIME_KEY[v]) : v);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
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

  const openAddForm = () => {
    setLogsError(null);
    setShowAddForm(true);
    mascot.write();
  };

  useEffect(() => {
    if (showAddForm) formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [showAddForm]);

  const addMedication = async () => {
    if (!newMed.name.trim()) {
      setLogsError(t("meds.errNameRequired"));
      return;
    }
    setSaving(true);
    setLogsError(null);
    try {
      mascot.write();
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
      triggerHaptic("success");
      mascot.doubleThumbsUp();
    } catch (err: any) {
      setLogsError(err.message ?? t("meds.errAdd"));
    } finally {
      setSaving(false);
    }
  };

  // 1-Tap Quick Add from Preset List
  const quickAddPreset = async (preset: { name: string; dosage: string; frequency: string; time: string; withFood: boolean }) => {
    // Check if already added
    const exists = medications.some((m) => m.name.toLowerCase().includes(preset.name.toLowerCase().split(" ")[0]));
    if (exists) {
      triggerHaptic("light");
      return;
    }

    try {
      mascot.write();
      triggerHaptic("medium");
      const item = await createMedication({
        name: preset.name,
        dosage: preset.dosage,
        frequency: preset.frequency,
        active: true,
        time: preset.time,
        with_food: preset.withFood,
      });
      setMedications((prev) => [...prev, mapApiItem(item)]);
      mascot.doubleThumbsUp();
    } catch (err) {
      console.warn("Preset add failed", err);
    }
  };

  const removeMedication = async (id: string) => {
    try {
      triggerHaptic("light");
      await deleteMedication(id);
      setMedications((prev) => prev.filter((med) => med.id !== id));
    } catch (err: any) {
      setLogsError(err.message ?? t("meds.errRemove"));
    }
  };

  // Compute active Food-Drug Interaction Safety Warnings
  const activeInteractions = React.useMemo(() => {
    const list: Array<{ title: string; warning: string; icon: string; bg: string }> = [];
    const medNames = medications.map((m) => m.name.toLowerCase()).join(" ");

    if (medNames.includes("metformin") || medNames.includes("glucophage")) {
      list.push({
        title: "Metformin & Cultural Swallows / Meals",
        warning: "Always take Metformin with or right after food (e.g. swallow or vegetable soup) to prevent GI nausea and support steady carbohydrate release.",
        icon: "🍲",
        bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });
    }

    if (medNames.includes("amlodipine") || medNames.includes("statin") || medNames.includes("atorvastatin") || medNames.includes("lipitor")) {
      list.push({
        title: "Grapefruit & Zobo Flavonoid Guardrail",
        warning: "Avoid consuming large quantities of grapefruit juice or heavily concentrated herbal extracts, which interfere with liver enzymes processing your medication.",
        icon: "🍊",
        bg: "bg-amber-50 border-amber-200 text-amber-900",
      });
    }

    if (medNames.includes("lisinopril") || medNames.includes("losartan") || medNames.includes("cozaar")) {
      list.push({
        title: "Potassium Guardrail",
        warning: "Your medication helps retain potassium. Avoid excessive artificial potassium salt substitutes or highly concentrated plantain peel ashes.",
        icon: "🍌",
        bg: "bg-blue-50 border-blue-200 text-blue-900",
      });
    }

    return list;
  }, [medications]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#A5DBDB] to-[#B8E5E5] px-4 sm:px-6 pt-9 pb-5 border-b border-teal-500/15">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-[#1f7a8c] hover:bg-white/40 rounded-full p-2 transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight flex items-center gap-2">
                <span>{t("planmeal.medications")}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100/80 text-teal-800 font-bold border border-teal-200">
                  Step 4 of 5
                </span>
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Sync medications for real-time food-drug interaction safety
              </p>
            </div>
          </div>
          <Pill className="h-7 w-7 text-[#1f7a8c] shrink-0" />
        </div>
      </div>

      {/* Onboarding Progress */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-4">
        <OnboardingProgress currentStep={4} totalSteps={5} />
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-5 space-y-5">
        {/* API Error Banner */}
        {logsError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 text-xs shadow-xs">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span>{logsError}</span>
          </div>
        )}

        {/* 🥑 10X Avo Pharmacist Clinical Guide Card */}
        <div className="bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-teal-200/40 relative overflow-hidden flex items-center justify-between gap-4">
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <Mascot size={64} className="shrink-0 drop-shadow-md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full shadow-2xs">
                  Avo Clinical Pharmacist
                </span>
                <span className="text-[10px] text-teal-200 font-bold hidden sm:inline">Active Safety Engine</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                Real-Time Food-Drug Protection
              </h3>
              <p className="text-[11px] sm:text-xs text-teal-100 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                "I check your prescriptions against cultural African soups, spices, and swallows so every meal you enjoy is 100% safe."
              </p>
            </div>
          </div>
        </div>

        {/* 1-Tap Quick Select Presets */}
        <div className="bg-white rounded-3xl shadow-sm border border-teal-100 p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                ⚡ 1-Tap Common Prescriptions
              </h2>
              <p className="text-xs text-slate-500">
                Tap to quickly add standard metabolic &amp; wellness medications
              </p>
            </div>
            <button
              onClick={openAddForm}
              className="text-xs font-black text-[#1f7a8c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Custom Med</span>
            </button>
          </div>

          <div className="space-y-3">
            {COMMON_MEDICATION_PRESETS.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                  {group.category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {group.meds.map((preset, pIdx) => {
                    const isAdded = medications.some((m) =>
                      m.name.toLowerCase().includes(preset.name.toLowerCase().split(" ")[0])
                    );
                    return (
                      <button
                        key={pIdx}
                        onClick={() => quickAddPreset(preset)}
                        className={`text-xs px-3 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                          isAdded
                            ? "bg-teal-700 text-white border-teal-800 ring-2 ring-teal-500/20"
                            : "bg-slate-50 hover:bg-teal-50/60 text-slate-700 border-slate-200/80 hover:border-teal-300"
                        }`}
                      >
                        {isAdded ? (
                          <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
                        ) : (
                          <Plus size={13} className="text-teal-700 shrink-0" />
                        )}
                        <span>{preset.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isAdded ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"}`}>
                          {preset.dosage}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Active Medications List */}
        <div className="bg-white rounded-3xl shadow-sm border border-teal-100 p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                📋 My Active Medications
              </h2>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                {medications.length}
              </span>
            </div>
            <button
              onClick={openAddForm}
              className="bg-[#1f7a8c] hover:bg-[#155b69] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Plus size={14} />
              <span>Add Drug</span>
            </button>
          </div>

          {logsLoading ? (
            <div className="text-center py-8 text-slate-400">
              <Pill className="h-8 w-8 mx-auto mb-2 text-teal-300 animate-pulse" />
              <p className="text-xs font-semibold">{t("meds.loading")}</p>
            </div>
          ) : medications.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
              <Mascot size={64} gesture="waving" className="mx-auto" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">No Medications Logged</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                If you do not take daily prescription medications, you can skip ahead safely to the next step!
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-2 inline-flex items-center gap-1.5 bg-white border border-teal-600/30 hover:border-teal-600 text-[#1f7a8c] rounded-xl px-4 py-2 text-xs font-black shadow-2xs hover:bg-teal-50/50 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Type Custom Drug Name</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="bg-gradient-to-r from-teal-50/70 via-slate-50 to-white border border-teal-200/70 rounded-2xl p-3.5 relative flex items-start justify-between gap-3 shadow-2xs group hover:border-teal-400 transition-all"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 bg-teal-100 text-teal-800 rounded-xl shrink-0 mt-0.5">
                      <Pill size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                        {med.name}
                      </h4>
                      <p className="text-[11px] font-bold text-teal-700 mt-0.5">
                        {med.dosage || "Standard Dose"}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-semibold flex-wrap">
                        <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                          <Clock size={11} className="text-slate-400" />
                          <span>{freqLabel(med.frequency)}</span>
                        </span>
                        <span>•</span>
                        <span>{timeLabel(med.time)}</span>
                        {med.withFood && (
                          <>
                            <span>•</span>
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                              Take with meals 🍽️
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeMedication(med.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove medication"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Food-Drug Interaction Cards */}
        {activeInteractions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-amber-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              <span>Active Food-Drug Safety Safeguards</span>
            </div>
            <div className="space-y-2.5">
              {activeInteractions.map((item, i) => (
                <div key={i} className={`p-3.5 rounded-2xl border ${item.bg} text-xs shadow-2xs`}>
                  <div className="font-black flex items-center gap-1.5 mb-1">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-95">{item.warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Medication Custom Form Modal / Drawer */}
        {showAddForm && (
          <div ref={formRef} className="bg-white rounded-3xl shadow-lg border-2 border-teal-300 p-5 sm:p-6 scroll-mt-20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-black text-[#1f7a8c] flex items-center gap-2">
                <Pill size={18} />
                <span>Add Custom Prescription</span>
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={newMed.name}
                  onChange={(e) => {
                    setNewMed({ ...newMed, name: e.target.value });
                    mascot.write();
                  }}
                  placeholder="e.g. Glimepiride, Amlodipine, Lisinopril..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#1f7a8c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dosage (e.g. 500mg, 10ml)
                  </label>
                  <input
                    type="text"
                    value={newMed.dosage}
                    onChange={(e) => {
                      setNewMed({ ...newMed, dosage: e.target.value });
                      mascot.write();
                    }}
                    placeholder="e.g. 5mg, 500mg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#1f7a8c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#1f7a8c]"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time of Day
                </label>
                <select
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#1f7a8c]"
                >
                  <option value="Morning">Morning ☀️</option>
                  <option value="Afternoon">Afternoon 🌤️</option>
                  <option value="Evening">Evening 🌆</option>
                  <option value="Bedtime">Bedtime 🌙</option>
                  <option value="Morning & Evening">Morning &amp; Evening ☀️🌙</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="withFoodCustom"
                  checked={newMed.withFood}
                  onChange={(e) => setNewMed({ ...newMed, withFood: e.target.checked })}
                  className="w-4 h-4 text-[#1f7a8c] rounded focus:ring-[#1f7a8c]"
                />
                <label htmlFor="withFoodCustom" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Take with food / meals 🍽️
                </label>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addMedication}
                  disabled={saving}
                  className="flex-1 bg-[#1f7a8c] hover:bg-[#155b69] text-white rounded-xl py-2.5 text-xs font-black shadow-md transition-all disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Medication"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              triggerHaptic("light");
              navigate("/medical-condition");
            }}
            className="px-5 py-3.5 text-slate-600 hover:text-slate-900 transition-colors text-xs font-black cursor-pointer"
          >
            No Prescriptions / Skip
          </button>

          <button
            onClick={() => {
              triggerHaptic("success");
              mascot.jump();
              navigate("/medical-condition");
            }}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] text-white rounded-2xl py-3.5 text-xs sm:text-sm font-black shadow-lg hover:shadow-xl active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Continue to Health Conditions</span>
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
