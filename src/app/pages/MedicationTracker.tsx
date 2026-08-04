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

const FREQUENCY_OPTIONS: { value: Frequency; label: string; times: string[] }[] = [
  { value: 'daily', label: 'Once Daily', times: ['08:00'] },
  { value: 'twice-daily', label: 'Twice Daily', times: ['08:00', '20:00'] },
  { value: 'three-times-daily', label: '3 Times Daily', times: ['08:00', '14:00', '20:00'] },
  { value: 'weekly', label: 'Weekly', times: ['08:00'] },
  { value: 'as-needed', label: 'As Needed', times: [] },
];

const COMMON_INTERACTIONS = [
  { combo: ['Vitamin D', 'Calcium'], warning: 'Take together for better absorption' },
  { combo: ['Iron', 'Vitamin C'], warning: 'Vitamin C enhances iron absorption by 300%' },
  { combo: ['Magnesium', 'Calcium'], warning: 'Space 2 hours apart for optimal absorption' },
  { combo: ['Fish Oil', 'Blood Thinners'], warning: '⚠️ May increase bleeding risk - consult doctor' },
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

  const [medications, setMedications] = useState<Medication[]>(() => {
    const stored = localStorage.getItem('medications');
    if (stored) return JSON.parse(stored);

    // Mock data
    return [
      {
        id: '1',
        name: 'Vitamin D3',
        type: 'vitamin',
        dosage: '5000 IU',
        frequency: 'daily',
        times: ['08:00'],
        pillsRemaining: 45,
        pillsPerDose: 1,
        refillThreshold: 10,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Take with food for better absorption',
      },
      {
        id: '2',
        name: 'Omega-3 Fish Oil',
        type: 'supplement',
        dosage: '1000mg',
        frequency: 'twice-daily',
        times: ['08:00', '20:00'],
        pillsRemaining: 8,
        pillsPerDose: 1,
        refillThreshold: 15,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Supports heart health',
      },
      {
        id: '3',
        name: 'Magnesium',
        type: 'supplement',
        dosage: '400mg',
        frequency: 'daily',
        times: ['20:00'],
        pillsRemaining: 25,
        pillsPerDose: 1,
        refillThreshold: 10,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Helps with sleep and muscle recovery',
      },
    ];
  });

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    const stored = localStorage.getItem('dose-logs');
    if (stored) return JSON.parse(stored);

    // Generate last 7 days of logs with realistic adherence
    const logs: DoseLog[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      medications.forEach(med => {
        if (med.frequency === 'as-needed') return;

        med.times.forEach(time => {
          const isTaken = Math.random() > 0.15; // 85% adherence
          logs.push({
            id: `${med.id}-${dateStr}-${time}`,
            medicationId: med.id,
            scheduledTime: time,
            takenTime: isTaken ? time : undefined,
            status: isTaken ? 'taken' : 'missed',
            date: dateStr,
          });
        });
      });
    }

    return logs;
  });

  const [todaySchedule, setTodaySchedule] = useState<DoseLog[]>(() =>
    generateTodaySchedule(medications)
  );

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

  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
    setTodaySchedule(generateTodaySchedule(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('dose-logs', JSON.stringify(doseLogs));
  }, [doseLogs]);

  // Check for refill alerts
  useEffect(() => {
    const lowStock = medications.filter(m => m.pillsRemaining <= m.refillThreshold);
    if (lowStock.length > 0) {
      lowStock.forEach(med => {
        if (med.pillsRemaining <= 5) {
          toast.error(`Critical: ${med.name} - Only ${med.pillsRemaining} pills left!`);
        }
      });
    }
  }, [medications]);

  const handleAddMedication = () => {
    if (!formData.name.trim() || !formData.dosage.trim()) {
      toast.error('Please fill in all required fields');
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
      toast.success('Medication updated!');
    } else {
      setMedications(prev => [...prev, newMed]);
      toast.success('Medication added!');
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
    if (confirm('Are you sure you want to delete this medication?')) {
      setMedications(prev => prev.filter(m => m.id !== id));
      toast.success('Medication deleted');
    }
  };

  const handleTakeDose = (scheduleItem: DoseLog) => {
    const med = medications.find(m => m.id === scheduleItem.medicationId);
    if (!med) return;

    // Update schedule
    setTodaySchedule(prev => prev.map(item =>
      item.id === scheduleItem.id
        ? { ...item, status: 'taken', takenTime: new Date().toTimeString().slice(0, 5) }
        : item
    ));

    // Add to logs
    const newLog: DoseLog = {
      ...scheduleItem,
      status: 'taken',
      takenTime: new Date().toTimeString().slice(0, 5),
    };
    setDoseLogs(prev => [...prev, newLog]);

    // Update pill count
    setMedications(prev => prev.map(m =>
      m.id === med.id
        ? { ...m, pillsRemaining: Math.max(0, m.pillsRemaining - m.pillsPerDose) }
        : m
    ));

    toast.success(`${med.name} logged!`);
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
        title="Medication Tracker"
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
                    Critical: {med.name} Running Low
                  </div>
                  <div className="text-sm text-red-800">
                    Only {med.pillsRemaining} pills remaining. Order refill immediately!
                  </div>
                </div>
              </div>
            ))}

            {activeInteractions.map((interaction, idx) => (
              <div key={idx} className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-900 mb-1">
                    Interaction: {interaction.combo.join(' + ')}
                  </div>
                  <div className="text-sm text-blue-800">{interaction.warning}</div>
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
              <span className="text-sm font-semibold text-teal-700">7-Day Adherence</span>
            </div>

            <div className={`text-6xl font-bold mb-2 ${
              adherence >= 90 ? 'text-green-600' :
              adherence >= 75 ? 'text-blue-600' :
              adherence >= 60 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {adherence}%
            </div>
            <div className="text-gray-600">
              {adherence >= 90 ? 'Excellent!' :
               adherence >= 75 ? 'Good' :
               adherence >= 60 ? 'Fair' : 'Needs Improvement'}
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
            Today's Schedule
          </h3>

          {todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Pill className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No scheduled doses for today</p>
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
                          Take
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
            Active Medications ({medications.length})
          </h3>

          {medications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Pill className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No medications added yet</p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="mt-4 bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Medication
              </Button>
            </div>
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
                            {med.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{med.dosage}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {FREQUENCY_OPTIONS.find(f => f.value === med.frequency)?.label} - {med.times.join(', ')}
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
                        <span className="text-xs text-gray-600">Stock Remaining</span>
                        <span className={`text-sm font-semibold ${
                          isCritical ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {med.pillsRemaining} pills ({daysRemaining} days)
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
                            {isCritical ? 'Order refill immediately!' : 'Time to refill soon'}
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
            Medication Best Practices
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Consistency is Key</div>
                <div className="text-sm text-gray-600">
                  Take medications at the same time daily for optimal effectiveness.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Timing Matters</div>
                <div className="text-sm text-gray-600">
                  Some supplements work better on empty stomach, others with food.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Check Interactions</div>
                <div className="text-sm text-gray-600">
                  Always consult your doctor about potential medication interactions.
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
              {editingMed ? 'Edit Medication' : 'Add Medication'}
            </DialogTitle>
            <DialogDescription>
              {editingMed ? 'Update medication details and dosage information.' : 'Add a new medication, supplement, or vitamin to track.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., Vitamin D3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['medication', 'supplement', 'vitamin'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type })}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all capitalize ${
                      formData.type === type
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="dosage" className="text-sm font-medium text-gray-700 mb-2 block">
                Dosage *
              </Label>
              <Input
                id="dosage"
                placeholder="e.g., 5000 IU or 500mg"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="h-12"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Frequency</Label>
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
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {formData.frequency !== 'as-needed' && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Times</Label>
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
                  Pills Remaining
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
                  Refill Alert At
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
                Notes (Optional)
              </Label>
              <Input
                id="notes"
                placeholder="e.g., Take with food"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="h-12"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddMedication} className="flex-1 bg-teal-600 hover:bg-teal-700">
                {editingMed ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
