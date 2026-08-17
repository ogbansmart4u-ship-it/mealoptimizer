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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-cyan-50 pb-24">
      <PageHeader
        title={t("medtrack.title")}
        showHome
        className="bg-gradient-to-r from-emerald-600 to-teal-600"
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
        {/* Alerts Section */}
        {(criticalMeds.length > 0 || activeInteractions.length > 0) && (
          <div className="space-y-3">
            {criticalMeds.map(med => (
              <div key={med.id} className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-900 mb-1">
                    {t("medtrack.alertCriticalTitle").replace("{name}", med.name)}
                  </div>
                  <div className="text-sm text-red-800">
                    {t("medtrack.alertCriticalDesc").replace("{n}", String(med.pillsRemaining))}
                  </div>
                </div>
              </div>
            ))}

            {activeInteractions.map((interaction, idx) => (
              <div key={idx} className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-900 mb-1">
                    {t("medtrack.interactionTitle").replace("{combo}", interaction.combo.join(' + '))}
                  </div>
                  <div className="text-sm text-blue-800">{t(interaction.warnKey)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Adherence Score */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full mb-4">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              <span className="text-sm font-semibold text-teal-700">{t("medtrack.adherence7Day")}</span>
            </div>

            <div className={`text-6xl font-bold mb-2 ${
              adherence >= 90 ? 'text-green-600' :
              adherence >= 75 ? 'text-blue-600' :
              adherence >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {adherence}%
            </div>
            <div className="text-gray-600">
              {adherence >= 90 ? t("medtrack.adh.excellent") :
               adherence >= 75 ? t("medtrack.adh.good") :
               adherence >= 60 ? t("medtrack.adh.fair") : t("medtrack.adh.needsImprovement")}
            </div>

            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  adherence >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
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
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            {t("medtrack.todaySchedule")}
          </h3>

          {loading ? (
            <SkeletonRows count={3} />
          ) : todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Pill className="h-12 w-12 mx-auto mb-2 text-gray-300" />
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
                    className={`p-4 rounded-xl border-2 transition-all ${
                      item.status === 'taken'
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`rounded-full p-2 ${
                          item.status === 'taken' ? 'bg-green-100' : 'bg-teal-100'
                        }`}>
                          {item.status === 'taken' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Pill className="h-5 w-5 text-teal-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">{med.name}</div>
                          <div className="text-xs text-gray-600">{med.dosage}</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{item.scheduledTime}</span>
                        </div>
                      </div>

                      {item.status === 'pending' && (
                        <Button
                          onClick={() => handleTakeDose(item)}
                          size="sm"
                          className="ml-3 bg-teal-600 hover:bg-teal-700"
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
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-teal-600" />
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
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
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
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCritical
                        ? 'bg-red-50 border-red-300'
                        : isLowStock
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-gray-800">{med.name}</h4>
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                            {typeLabel(med.type)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{med.dosage}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {freqLabel(med.frequency)} - {med.times.join(', ')}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMed(med)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteMed(med.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">{t("medtrack.stockRemaining")}</span>
                        <span className={`text-sm font-semibold ${
                          isCritical ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {t("medtrack.pillsDays").replace("{n}", String(med.pillsRemaining)).replace("{d}", String(daysRemaining))}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isCritical
                              ? 'bg-red-500'
                              : isLowStock
                              ? 'bg-amber-500'
                              : 'bg-green-500'
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
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span className="text-amber-700">
                            {isCritical ? t("medtrack.orderNow") : t("medtrack.refillSoon")}
                          </span>
                        </div>
                      )}
                    </div>

                    {med.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600 italic">💡 {med.notes}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl shadow-xl p-6 border border-teal-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5 text-teal-600" />
            {t("medtrack.bestPractices")}
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t("medtrack.tip1Title")}</div>
                <div className="text-sm text-gray-600">
                  {t("medtrack.tip1Desc")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t("medtrack.tip2Title")}</div>
                <div className="text-sm text-gray-600">
                  {t("medtrack.tip2Desc")}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t("medtrack.tip3Title")}</div>
                <div className="text-sm text-gray-600">
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
