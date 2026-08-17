import { Stethoscope, ChevronLeft, Plus, X, AlertCircle, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OnboardingProgress from "../components/OnboardingProgress";
import { useLanguage } from "../contexts/LanguageContext";
import { getCollection, createCollectionItem, deleteCollectionItem } from "../../lib/api";

type Severity = "mild" | "moderate" | "severe";

interface Condition {
  id: string;
  name: string;
  severity: Severity;
  diagnosedDate: string; // "YYYY-MM" or "" if unknown
}

// Common conditions offered as one-tap chips. Includes metabolic/cardiac, GI,
// maternal & post-surgical (e.g. post-Cesarean recovery), and conditions common
// in West Africa (sickle cell, peptic ulcer).
const COMMON_CONDITIONS = [
  "Type 2 Diabetes",
  "Type 1 Diabetes",
  "Prediabetes",
  "Hypertension (High Blood Pressure)",
  "High Cholesterol",
  "Heart Disease",
  "Chronic Kidney Disease",
  "Anemia",
  "Sickle Cell Disease",
  "Thyroid Disorder",
  "Obesity",
  "PCOS (Polycystic Ovary Syndrome)",
  "Gout",
  "Fatty Liver Disease",
  "Peptic Ulcer",
  "GERD (Acid Reflux)",
  "IBS (Irritable Bowel Syndrome)",
  "Celiac Disease",
  "Lactose Intolerance",
  "Food Allergies",
  "Pregnancy",
  "Post-Cesarean Section (Recovery)",
  "Postpartum Recovery",
];

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function MedicalCondition() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const sevLabel = (s: string) => t(`medcond.sev.${s}`);

  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyName, setBusyName] = useState<string | null>(null); // chip currently saving/removing

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCondition, setNewCondition] = useState<{ name: string; severity: Severity; diagnosedDate: string }>({
    name: "",
    severity: "moderate",
    diagnosedDate: "",
  });

  // Load the user's saved conditions (no more mock seed).
  useEffect(() => {
    getCollection("conditions")
      .then((items) =>
        setConditions(
          (items ?? []).map((it: any) => ({
            id: String(it.id ?? uid()),
            name: it.name ?? "",
            severity: (it.severity as Severity) ?? "moderate",
            diagnosedDate: it.diagnosedDate ?? "",
          })),
        ),
      )
      .catch((err: any) => setLoadError(err?.message ?? t("medcond.errLoad")))
      .finally(() => setLoading(false));
  }, []);

  const hasCondition = (name: string) => conditions.some((c) => c.name === name);

  // One-tap multi-select: tapping a chip adds the condition (moderate, month unset)
  // or removes it if already selected. Each change persists immediately.
  const toggleCondition = async (name: string) => {
    if (busyName) return;
    setBusyName(name);
    try {
      const existing = conditions.find((c) => c.name === name);
      if (existing) {
        await deleteCollectionItem("conditions", existing.id);
        setConditions((prev) => prev.filter((c) => c.id !== existing.id));
      } else {
        const item: Condition = { id: uid(), name, severity: "moderate", diagnosedDate: "" };
        await createCollectionItem("conditions", item);
        setConditions((prev) => [...prev, item]);
      }
    } catch (err: any) {
      setLoadError(err?.message ?? t("medcond.errSave"));
    } finally {
      setBusyName(null);
    }
  };

  const addDetailedCondition = async () => {
    const name = newCondition.name.trim();
    if (!name || hasCondition(name)) {
      setShowAddForm(false);
      return;
    }
    setSaving(true);
    try {
      const item: Condition = {
        id: uid(),
        name,
        severity: newCondition.severity,
        diagnosedDate: newCondition.diagnosedDate || "",
      };
      await createCollectionItem("conditions", item);
      setConditions((prev) => [...prev, item]);
      setNewCondition({ name: "", severity: "moderate", diagnosedDate: "" });
      setShowAddForm(false);
    } catch (err: any) {
      setLoadError(err?.message ?? t("medcond.errSaveCond"));
    } finally {
      setSaving(false);
    }
  };

  const removeCondition = async (id: string) => {
    const prev = conditions;
    setConditions((cs) => cs.filter((c) => c.id !== id)); // optimistic
    try {
      await deleteCollectionItem("conditions", id);
    } catch {
      setConditions(prev); // roll back on failure
      setLoadError(t("medcond.errRemove"));
    }
  };

  const severityCardColor = (s: string) =>
    s === "mild"
      ? "from-green-50 to-green-100 border-green-200"
      : s === "severe"
      ? "from-red-50 to-red-100 border-red-200"
      : "from-yellow-50 to-yellow-100 border-yellow-200";

  const severityBadge = (s: string) =>
    s === "mild" ? "bg-green-500 text-white" : s === "severe" ? "bg-red-500 text-white" : "bg-yellow-500 text-white";

  const formatDiagnosed = (d: string) => {
    if (!d) return t("medcond.dateNotSet");
    const dt = new Date(d + "-01");
    return isNaN(+dt) ? t("medcond.dateNotSet") : dt.toLocaleDateString("en-US", { year: "numeric", month: "long" });
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
          <h1 className="text-2xl text-white flex-1">{t("medcond.title")}</h1>
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Onboarding Progress */}
      <div className="px-6 mt-6">
        <OnboardingProgress currentStep={5} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Privacy Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium text-blue-800 mb-1">{t("medcond.privacyTitle")}</p>
            <p>{t("medcond.privacyDesc")}</p>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-700">{loadError}</div>
        )}

        {/* Quick multi-select */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-1">{t("medcond.selectTitle")}</h2>
          <p className="text-sm text-gray-500 mb-4">{t("medcond.selectDesc")}</p>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("medcond.loading")}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {COMMON_CONDITIONS.map((name) => {
                const selected = hasCondition(name);
                const busy = busyName === name;
                return (
                  <button
                    key={name}
                    onClick={() => toggleCondition(name)}
                    disabled={busy}
                    aria-pressed={selected}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border-2 transition-all disabled:opacity-60 ${
                      selected
                        ? "bg-[#1f7a8c] text-white border-[#1f7a8c]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#4ecdc4]"
                    }`}
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : selected ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected conditions (with severity + diagnosis detail) */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-[#1f7a8c]">{t("medcond.myConditions")}</h2>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-full p-2 hover:shadow-lg transition-all"
              aria-label={t("medcond.addAria")}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {conditions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>{t("medcond.emptyTitle")}</p>
              <p className="text-sm">{t("medcond.emptyDesc")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className={`bg-gradient-to-r ${severityCardColor(condition.severity)} border-2 rounded-2xl p-4 relative`}
                >
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`${t("medcond.remove")} ${condition.name}`}
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="pr-8">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg text-gray-800">{condition.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${severityBadge(condition.severity)}`}>
                        {sevLabel(condition.severity)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{t("medcond.diagnosed")} {formatDiagnosed(condition.diagnosedDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Condition Form (detailed) */}
        {showAddForm && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h2 className="text-lg text-[#1f7a8c] mb-4">{t("medcond.addTitle")}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">{t("medcond.condName")}</label>
                <input
                  type="text"
                  value={newCondition.name}
                  onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                  placeholder={t("medcond.condNamePlaceholder")}
                  list="conditions-list"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                />
                <datalist id="conditions-list">
                  {COMMON_CONDITIONS.map((cond, index) => (
                    <option key={index} value={cond} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">{t("medcond.severity")}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["mild", "moderate", "severe"] as Severity[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewCondition({ ...newCondition, severity: s })}
                      className={`p-3 rounded-xl transition-all ${
                        newCondition.severity === s
                          ? s === "mild"
                            ? "bg-green-500 text-white"
                            : s === "severe"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {sevLabel(s)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">{t("medcond.diagnosedDate")}</label>
                <input
                  type="month"
                  value={newCondition.diagnosedDate}
                  onChange={(e) => setNewCondition({ ...newCondition, diagnosedDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                  className="flex-1 border-2 border-gray-300 text-gray-700 rounded-xl py-3 hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={addDetailedCondition}
                  disabled={saving || !newCondition.name.trim()}
                  className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl py-3 hover:shadow-lg transition-all disabled:opacity-60"
                >
                  {saving ? t("profile.saving") : t("medcond.addCondition")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nutritional Impact */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#e63946] mb-4">{t("medcond.howWeHelp")}</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-xl">🎯</span>
              <p>{t("medcond.help1")}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <p>{t("medcond.help2")}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">✅</span>
              <p>{t("medcond.help3")}</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">📊</span>
              <p>{t("medcond.help4")}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-4 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            {t("meds.skip")}
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all"
          >
            {t("medcond.completeSetup")}
          </button>
        </div>
      </div>
    </div>
  );
}
