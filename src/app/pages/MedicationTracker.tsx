import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Pill,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Bell,
  Package,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { SkeletonRows } from "../components/SkeletonLoader";
import MascotEmptyState from "../components/MascotEmptyState";
import { useLanguage } from "../contexts/LanguageContext";
import { getCollection, createCollectionItem, updateCollectionItem, deleteCollectionItem } from "../../lib/api";

type MedicationType = 'medication' | 'supplement' | 'vitamin';
type Frequency = 'daily' | 'twice-daily' | 'three-times-daily' | 'weekly' | 'as-needed';

type Medication = {
  id: string;
  name: string;
  type: MedicationType;
  dosage: string;
  frequency: Frequency;
  times: string[];
  pillsRemaining: number;
  pillsPerDose: number;
  refillThreshold: number;
  startDate: string;
  notes?: string;
  interactions?: string[];
};

type DoseLog = {
  id: string;
  medicationId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'taken' | 'missed' | 'pending';
  date: string;
};

// `labelKey` maps each frequency to a translation key; `label` is the English
// fallback. `value` is the stored enum and never changes.
const FREQUENCY_OPTIONS: { value: Frequency; label: string; labelKey: string; times: string[] }[] = [
  { value: 'daily', label: 'Once Daily', labelKey: 'medtrack.freq.daily', times: ['08:00'] },
  { value: 'twice-daily', label: 'Twice Daily', labelKey: 'medtrack.freq.twiceDaily', times: ['08:00', '20:00'] },
  { value: 'three-times-daily', label: '3 Times Daily', labelKey: 'medtrack.freq.threeDaily', times: ['08:00', '14:00', '20:00'] },
  { value: 'weekly', label: 'Weekly', labelKey: 'medtrack.freq.weekly', times: ['08:00'] },
  { value: 'as-needed', label: 'As Needed', labelKey: 'medtrack.freq.asNeeded', times: [] },
];

// Combo names stay in English — they're matched against user-entered med names.
// `warnKey` translates the advice text.
const COMMON_INTERACTIONS = [
  { combo: ['Vitamin D', 'Calcium'], warnKey: 'medtrack.warn.vitDCalcium' },
  { combo: ['Iron', 'Vitamin C'], warnKey: 'medtrack.warn.ironVitC' },
  { combo: ['Magnesium', 'Calcium'], warnKey: 'medtrack.warn.magCalcium' },
  { combo: ['Fish Oil', 'Blood Thinners'], warnKey: 'medtrack.warn.fishOilBlood' },
];

const generateTodaySchedule = (medications: Medication[]): DoseLog[] => {
  const today = new Date().toISOString().split('T')[0];
  const schedule: DoseLog[] = [];

  medications.forEach(med => {
    if (med.frequency === 'as-needed') return;

    med.times.forEach(time => {
      schedule.push({
        id: `${med.id}-${time}`,
        medicationId: med.id,
        scheduledTime: time,
        status: 'pending',
        date: today,
      });
    });
  });

  return schedule;
};

const calculateAdherence = (logs: DoseLog[], days: number = 7): number => {
  if (logs.length === 0) return 100;

  const taken = logs.filter(l => l.status === 'taken').length;
  return Math.round((taken / logs.length) * 100);
};

export default function MedicationTracker() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const freqLabel = (v: string) => {
    const o = FREQUENCY_OPTIONS.find((f) => f.value === v);
    return o ? t(o.labelKey) : v;
  };
  const typeLabel = (v: string) => t(`medtrack.type.${v}`);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<DoseLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'supplement' as MedicationType,
    dosage: '',
    frequency: 'daily' as Frequency,
    times: ['08:00'],
    pillsRemaining: 30,
    pillsPerDose: 1,
    refillThreshold: 10,
    notes: '',
  });

  // Load this account's medications and dose history from the backend on mount.
  useEffect(() => {
    Promise.all([getCollection('medications'), getCollection('doseLogs')])
      .then(([meds, logs]) => {
        setMedications(Array.isArray(meds) ? (meds as Medication[]) : []);
        setDoseLogs(Array.isArray(logs) ? (logs as DoseLog[]) : []);
      })
      .catch((e) => console.error('Failed to load medications', e))
      .finally(() => setLoading(false));
  }, []);

  // Rebuild today's schedule whenever meds or logs change, marking doses that
  // are already recorded as taken today so they persist across reloads.
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const base = generateTodaySchedule(medications);
    setTodaySchedule(base.map((item) => {
      const log = doseLogs.find(
        (l) => l.medicationId === item.medicationId &&
               l.scheduledTime === item.scheduledTime &&
               l.date === today && l.status === 'taken'
      );
      return log ? { ...item, status: 'taken', takenTime: log.takenTime } : item;
    }));
  }, [medications, doseLogs]);

  // Check for refill alerts
  useEffect(() => {
    const lowStock = medications.filter(m => m.pillsRemaining <= m.refillThreshold);
    if (lowStock.length > 0) {
      lowStock.forEach(med => {
        if (med.pillsRemaining <= 5) {
          toast.error(t("medtrack.toast.criticalToast").replace("{name}", med.name).replace("{n}", String(med.pillsRemaining)));
        }
      });
    }
  }, [medications]);

  const handleAddMedication = () => {
    if (!formData.name.trim() || !formData.dosage.trim()) {
      toast.error(t("medtrack.toast.fillRequired"));
      return;
    }

    const newMed: Medication = {
      id: editingMed?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      dosage: formData.dosage,
      frequency: formData.frequency,
      times: formData.times,
      pillsRemaining: formData.pillsRemaining,
      pillsPerDose: formData.pillsPerDose,
      refillThreshold: formData.refillThreshold,
      startDate: editingMed?.startDate || new Date().toISOString().split('T')[0],
      notes: formData.notes,
    };

    if (editingMed) {
      setMedications(prev => prev.map(m => m.id === editingMed.id ? newMed : m));
      toast.success(t("medtrack.toast.updated"));
      updateCollectionItem('medications', newMed.id, newMed)
        .catch((e) => console.error('Failed to update medication', e));
    } else {
      setMedications(prev => [...prev, newMed]);
      toast.success(t("medtrack.toast.added"));
      createCollectionItem('medications', newMed)
        .catch((e) => console.error('Failed to save medication', e));
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'supplement',
      dosage: '',
      frequency: 'daily',
      times: ['08:00'],
      pillsRemaining: 30,
      pillsPerDose: 1,
      refillThreshold: 10,
      notes: '',
    });
    setEditingMed(null);
    setShowAddDialog(false);
  };

  const handleEditMed = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      type: med.type,
      dosage: med.dosage,
      frequency: med.frequency,
      times: med.times,
      pillsRemaining: med.pillsRemaining,
      pillsPerDose: med.pillsPerDose,
      refillThreshold: med.refillThreshold,
      notes: med.notes || '',
    });
    setShowAddDialog(true);
  };

  const handleDeleteMed = (id: string) => {
    if (confirm(t("medtrack.confirmDelete"))) {
      setMedications(prev => prev.filter(m => m.id !== id));
      toast.success(t("medtrack.toast.deleted"));
      deleteCollectionItem('medications', id)
        .catch((e) => console.error('Failed to delete medication', e));
    }
  };

  const handleTakeDose = (scheduleItem: DoseLog) => {
    const med = medications.find(m => m.id === scheduleItem.medicationId);
    if (!med) return;

    const takenTime = new Date().toTimeString().slice(0, 5);

    // Update schedule
    setTodaySchedule(prev => prev.map(item =>
      item.id === scheduleItem.id
        ? { ...item, status: 'taken', takenTime }
        : item
    ));

    // One dose record per scheduled slot per day (stable id so re-taking updates it)
    const newLog: DoseLog = {
      ...scheduleItem,
      id: `${scheduleItem.medicationId}-${scheduleItem.date}-${scheduleItem.scheduledTime}`,
      status: 'taken',
      takenTime,
    };
    setDoseLogs(prev => [...prev.filter(l => l.id !== newLog.id), newLog]);
    createCollectionItem('doseLogs', newLog)
      .catch((e) => console.error('Failed to log dose', e));

    // Update pill count
    const newRemaining = Math.max(0, med.pillsRemaining - med.pillsPerDose);
    setMedications(prev => prev.map(m =>
      m.id === med.id ? { ...m, pillsRemaining: newRemaining } : m
    ));
    updateCollectionItem('medications', med.id, { pillsRemaining: newRemaining })
      .catch((e) => console.error('Failed to update pill count', e));

    toast.success(t("medtrack.toast.logged").replace("{name}", med.name));
  };

  const adherence = calculateAdherence(doseLogs);
  const lowStockMeds = medications.filter(m => m.pillsRemaining <= m.refillThreshold);
  const criticalMeds = medications.filter(m => m.pillsRemaining <= 5);

  // Check for interactions
  const activeInteractions = COMMON_INTERACTIONS.filter(interaction =>
    interaction.combo.every(name =>
      medications.some(m => m.name.toLowerCase().includes(name.toLowerCase()))
    )
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1412] text-stone-900 dark:text-stone-100 pb-28 transition-colors">
      <PageHeader
        title={t("medtrack.title")}
        showHome
        className="bg-[#164E3D]"
        actions={
          <button
            onClick={() => setShowAddDialog(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Add medication"
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        }
      />

      <div className="px-4 sm:px-6 mt-6 space-y-6 max-w-2xl mx-auto">
        {/* Alerts Section */}
        {(criticalMeds.length > 0 || activeInteractions.length > 0) && (
          <div className="space-y-3">
            {criticalMeds.map(med => (
              <div key={med.id} className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-red-900 dark:text-red-200 mb-0.5">
                    {t("medtrack.alertCriticalTitle").replace("{name}", med.name)}
                  </div>
                  <div className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                    {t("medtrack.alertCriticalDesc").replace("{n}", String(med.pillsRemaining))}
                  </div>
                </div>
              </div>
            ))}

            {activeInteractions.map((interaction, idx) => (
              <div key={idx} className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-0.5">
                    {t("medtrack.interactionTitle").replace("{combo}", interaction.combo.join(' + '))}
                  </div>
                  <div className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{t(interaction.warnKey)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Adherence Score */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-[#164E3D] dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 rounded-full mb-4">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-bold">{t("medtrack.adherence7Day")}</span>
            </div>

            <div className={`text-5xl sm:text-6xl font-black mb-2 ${
              adherence >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
              adherence >= 75 ? 'text-blue-600 dark:text-blue-400' :
              adherence >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {adherence}%
            </div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {adherence >= 90 ? t("medtrack.adh.excellent") :
               adherence >= 75 ? t("medtrack.adh.good") :
               adherence >= 60 ? t("medtrack.adh.fair") : t("medtrack.adh.needsImprovement")}
            </div>

            <div className="mt-4 w-full bg-stone-100 dark:bg-stone-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  adherence >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                  adherence >= 75 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                  adherence >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
                style={{ width: `${adherence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-6">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {t("medtrack.todaySchedule")}
          </h3>

          {loading ? (
            <SkeletonRows count={3} />
          ) : todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-stone-500 dark:text-stone-400 text-xs">
              <Pill className="h-10 w-10 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p>{t("medtrack.noDoses")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map(item => {
                const med = medications.find(m => m.id === item.medicationId);
                if (!med) return null;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.status === 'taken'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
                        : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700/80 hover:border-emerald-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`rounded-xl p-2.5 ${
                          item.status === 'taken' ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                        }`}>
                          {item.status === 'taken' ? (
                            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Pill className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-stone-900 dark:text-white truncate">{med.name}</div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">{med.dosage}</div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{item.scheduledTime}</span>
                        </div>
                      </div>

                      {item.status === 'pending' && (
                        <Button
                          onClick={() => handleTakeDose(item)}
                          size="sm"
                          className="ml-3 bg-[#164E3D] hover:bg-[#123E31] text-white text-xs font-bold rounded-xl cursor-pointer active:scale-95 shadow-2xs"
                        >
                          {t("medtrack.take")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Medications */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-6">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {t("medtrack.activeMeds")} ({medications.length})
          </h3>

          {loading ? (
            <SkeletonRows count={3} />
          ) : medications.length === 0 ? (
            <MascotEmptyState
              title={t("medtrack.emptyTitle")}
              subtitle={t("medtrack.emptySubtitle")}
              action={
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-[#164E3D] hover:bg-[#123E31] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  {t("medtrack.addFirst")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {medications.map(med => {
                const isLowStock = med.pillsRemaining <= med.refillThreshold;
                const isCritical = med.pillsRemaining <= 5;
                const daysRemaining = Math.floor(med.pillsRemaining / (med.pillsPerDose * med.times.length));

                return (
                  <div
                    key={med.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCritical
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60'
                        : isLowStock
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                        : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700/80'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xs font-bold text-stone-900 dark:text-white">{med.name}</h4>
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-[#164E3D] dark:text-emerald-300 text-xs rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                            {typeLabel(med.type)}
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 dark:text-stone-300">{med.dosage}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {freqLabel(med.frequency)} - {med.times.join(', ')}
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEditMed(med)}
                          className="p-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer text-stone-600 dark:text-stone-300"
                          aria-label="Edit medication"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMed(med.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer text-red-600 dark:text-red-400"
                          aria-label="Delete medication"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="pt-3 border-t border-stone-200 dark:border-stone-700">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-stone-500 dark:text-stone-400">{t("medtrack.stockRemaining")}</span>
                        <span className={`text-xs font-bold ${
                          isCritical ? 'text-red-600 dark:text-red-400' : isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}>
                          {t("medtrack.pillsDays").replace("{n}", String(med.pillsRemaining)).replace("{d}", String(daysRemaining))}
                        </span>
                      </div>

                      <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isCritical
                              ? 'bg-red-500'
                              : isLowStock
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              (med.pillsRemaining / (med.refillThreshold * 3)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      {isLowStock && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span className="text-amber-800 dark:text-amber-300 font-medium">
                            {isCritical ? t("medtrack.orderNow") : t("medtrack.refillSoon")}
                          </span>
                        </div>
                      )}
                    </div>

                    {med.notes && (
                      <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                        <div className="text-xs text-stone-500 dark:text-stone-400 italic">💡 {med.notes}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs p-6">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {t("medtrack.bestPractices")}
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 bg-stone-50 dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700/70 rounded-2xl">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-white mb-0.5">{t("medtrack.tip1Title")}</div>
                <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {t("medtrack.tip1Desc")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-stone-50 dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700/70 rounded-2xl">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-white mb-0.5">{t("medtrack.tip2Title")}</div>
                <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {t("medtrack.tip2Desc")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-stone-50 dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700/70 rounded-2xl">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-white mb-0.5">{t("medtrack.tip3Title")}</div>
                <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {t("medtrack.tip3Desc")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Medication Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-teal-600">
              {editingMed ? t("medtrack.editTitle") : t("medtrack.addTitle")}
            </DialogTitle>
            <DialogDescription>
              {editingMed ? t("medtrack.editDesc") : t("medtrack.addDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                {t("medtrack.nameLabel")}
              </Label>
              <Input
                id="name"
                placeholder={t("medtrack.namePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">{t("medtrack.typeLabel")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['medication', 'supplement', 'vitamin'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type })}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.type === type
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {typeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="dosage" className="text-sm font-medium text-gray-700 mb-2 block">
                {t("medtrack.dosageLabel")}
              </Label>
              <Input
                id="dosage"
                placeholder={t("medtrack.dosagePlaceholder")}
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="h-12"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">{t("medtrack.frequencyLabel")}</Label>
              <select
                value={formData.frequency}
                onChange={(e) => {
                  const freq = e.target.value as Frequency;
                  const times = FREQUENCY_OPTIONS.find(f => f.value === freq)?.times || [];
                  setFormData({ ...formData, frequency: freq, times });
                }}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg"
              >
                {FREQUENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
                ))}
              </select>
            </div>

            {formData.frequency !== 'as-needed' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">{t("medtrack.timesLabel")}</Label>
                <div className="space-y-2">
                  {formData.times.map((time, idx) => (
                    <Input
                      key={idx}
                      type="time"
                      value={time}
                      onChange={(e) => {
                        const newTimes = [...formData.times];
                        newTimes[idx] = e.target.value;
                        setFormData({ ...formData, times: newTimes });
                      }}
                      className="h-12"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pillsRemaining" className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("medtrack.pillsRemainingLabel")}
                </Label>
                <Input
                  id="pillsRemaining"
                  type="number"
                  value={formData.pillsRemaining}
                  onChange={(e) => setFormData({ ...formData, pillsRemaining: parseInt(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>

              <div>
                <Label htmlFor="refillThreshold" className="text-sm font-medium text-gray-700 mb-2 block">
                  {t("medtrack.refillAtLabel")}
                </Label>
                <Input
                  id="refillThreshold"
                  type="number"
                  value={formData.refillThreshold}
                  onChange={(e) => setFormData({ ...formData, refillThreshold: parseInt(e.target.value) || 10 })}
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                {t("medtrack.notesLabel")}
              </Label>
              <Input
                id="notes"
                placeholder={t("medtrack.notesPlaceholder")}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button onClick={handleAddMedication} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {editingMed ? t("medtrack.update") : t("medtrack.add")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
