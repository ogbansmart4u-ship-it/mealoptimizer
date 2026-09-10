import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Bell, Clock, Calendar, Trash2, Edit, BellOff, Sparkles, Send, Footprints, Droplets, HeartPulse, Moon, Flame } from 'lucide-react';
import { saveReminders, requestNotificationPermission, Reminder } from '../utils/reminderManager';
import { getCollection, createCollectionItem, updateCollectionItem, deleteCollectionItem } from '../../lib/api';
import { SkeletonRows } from '../components/SkeletonLoader';
import MascotEmptyState from '../components/MascotEmptyState';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useLanguage } from '../contexts/LanguageContext';
import {
  METABOLIC_ALERTS,
  getNotificationPreferences,
  saveNotificationPreferences,
  triggerLocalNotification,
  requestPushPermission,
  type NotificationSchedule,
} from '../../lib/notifications';
import { toast } from 'sonner';
import { triggerHaptic } from '../utils/celebration';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_KEYS = ['reminders.day.sun', 'reminders.day.mon', 'reminders.day.tue', 'reminders.day.wed', 'reminders.day.thu', 'reminders.day.fri', 'reminders.day.sat'];

export default function Reminders() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [metabolicPrefs, setMetabolicPrefs] = useState<NotificationSchedule>(() => getNotificationPreferences());
  const [isSendingTest, setIsSendingTest] = useState(false);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [formData, setFormData] = useState({
    trackerName: '',
    time: '09:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    message: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    getCollection('reminders')
      .then((data) => {
        const list = Array.isArray(data) ? (data as Reminder[]) : [];
        setReminders(list);
        saveReminders(list);
      })
      .catch((e) => { console.error('Failed to load reminders', e); setReminders([]); })
      .finally(() => setLoading(false));
  }, []);

  const toggleMetabolicAlert = (key: keyof NotificationSchedule) => {
    try { triggerHaptic("light"); } catch {}
    setMetabolicPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveNotificationPreferences(next);
      return next;
    });
  };

  const handleSendTestPush = async () => {
    try { triggerHaptic("medium"); } catch {}
    setIsSendingTest(true);
    try {
      if (notificationPermission !== 'granted') {
        const granted = await requestPushPermission();
        setNotificationPermission(granted ? 'granted' : 'denied');
        if (!granted) {
          toast.error("Please allow push notifications in your browser settings.");
          setIsSendingTest(false);
          return;
        }
      }

      await triggerLocalNotification(
        "🥑 Avo Smart Metabolic Alert (Live)",
        "Your Smart Push Notification Engine is active! 30-min post-meal walk alerts and circadian buffers are scheduled.",
        "/icon-192.png",
        "/reminders"
      );
      toast.success("🔔 Test notification dispatched successfully!");
    } catch (e) {
      toast.error("Could not dispatch test notification.");
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
  };

  const toggleReminder = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    const nextEnabled = !target?.enabled;
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: nextEnabled } : r
    );
    setReminders(updated);
    saveReminders(updated);
    try { await updateCollectionItem('reminders', id, { enabled: nextEnabled }); }
    catch (e) { console.error('Failed to update reminder', e); }
  };

  const deleteReminder = async (id: string) => {
    if (confirm(t('reminders.confirmDelete'))) {
      const updated = reminders.filter((r) => r.id !== id);
      setReminders(updated);
      saveReminders(updated);
      try { await deleteCollectionItem('reminders', id); }
      catch (e) { console.error('Failed to delete reminder', e); }
    }
  };

  const handleAddReminder = async () => {
    const newReminder: Reminder = {
      id: `reminder-${Date.now()}`,
      trackerId: formData.trackerName.toLowerCase(),
      trackerName: formData.trackerName,
      time: formData.time,
      enabled: true,
      days: formData.days,
      message: formData.message || t('reminders.defaultMsg').replace('{name}', formData.trackerName),
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveReminders(updated);
    setShowAddDialog(false);
    resetForm();
    try { await createCollectionItem('reminders', newReminder); }
    catch (e) { console.error('Failed to save reminder', e); }
  };

  const handleEditReminder = async () => {
    if (!editingReminder) return;

    const id = editingReminder.id;
    const updated = reminders.map((r) =>
      r.id === id
        ? { ...editingReminder, ...formData }
        : r
    );
    setReminders(updated);
    saveReminders(updated);
    setEditingReminder(null);
    resetForm();
    try { await updateCollectionItem('reminders', id, { ...formData }); }
    catch (e) { console.error('Failed to update reminder', e); }
  };

  const resetForm = () => {
    setFormData({
      trackerName: '',
      time: '09:00',
      days: [0, 1, 2, 3, 4, 5, 6],
      message: '',
    });
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day].sort(),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B8E5E5] to-[#E8F5F5] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/personalization')}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{t('reminders.title')}</h1>
            <p className="text-white/90 text-sm">{t('reminders.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
          >
            <Plus className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Notification Permission */}
        {notificationPermission !== 'granted' && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <BellOff className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">{t('reminders.enableTitle')}</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  {t('reminders.enableDesc')}
                </p>
                <Button
                  onClick={handleRequestPermission}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {t('reminders.enableTitle')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 🥑 AVO SMART METABOLIC PUSH ENGINE (FINAL POLISH 10X)        */}
        {/* ============================================================ */}
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl p-5 shadow-xl border-2 border-teal-200/80 dark:border-teal-800/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#126778] to-[#1f7a8c] flex items-center justify-center text-white shadow-md text-2xl">
                🥑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Smart Metabolic Push Alerts
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                    Live Engine v10.6
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automated chrono-nutrition, postprandial glucose walks, &amp; KDIGO renal hydration.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSendTestPush}
              disabled={isSendingTest}
              className="bg-gradient-to-r from-teal-600 to-[#1f7a8c] hover:from-teal-700 hover:to-[#126778] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
            >
              <Send size={13} />
              <span>{isSendingTest ? "Dispatching..." : "Send Test Push Alert 🔔"}</span>
            </Button>
          </div>

          {/* Metabolic Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {METABOLIC_ALERTS.map((alert) => {
              const isEnabled = !!metabolicPrefs[alert.key];
              return (
                <div
                  key={alert.key}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isEnabled
                      ? "bg-slate-50/90 dark:bg-zinc-800/80 border-teal-200 dark:border-teal-900/60 shadow-xs"
                      : "bg-gray-50/60 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-teal-100/70 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-sm mt-0.5 shrink-0">
                      {alert.category === "morning" && <Droplets size={15} />}
                      {alert.category === "lunch" && <Footprints size={15} />}
                      {alert.category === "afternoon" && <HeartPulse size={15} />}
                      {alert.category === "dinner" && <Sparkles size={15} />}
                      {alert.category === "evening" && <Moon size={15} />}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white leading-snug truncate">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                        {alert.body}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleMetabolicAlert(alert.key)}
                      aria-label={`Toggle ${alert.title}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-teal-50/80 dark:bg-teal-950/40 rounded-2xl border border-teal-200/60 dark:border-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🚶‍♂️</span>
              <span>
                <strong>Dynamic Post-Meal Walk Timer:</strong> When you log a meal, Avo automatically arms a 30-minute postprandial glucose-lowering walk prompt.
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg shrink-0">
              GLUT4 Ready
            </span>
          </div>
        </div>

        {/* Section Header for Custom Reminders */}
        <div className="flex items-center justify-between pt-2">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={16} className="text-[#1f7a8c]" />
            <span>Custom Personal Trackers ({reminders.length})</span>
          </h3>
          <button
            onClick={() => setShowAddDialog(true)}
            className="text-xs font-bold text-[#1f7a8c] hover:underline cursor-pointer"
          >
            + Add Tracker
          </button>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {loading && <SkeletonRows count={3} />}
          {!loading && reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-2xl shadow-lg p-5 transition-all ${
                !reminder.enabled ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition ${
                    reminder.enabled
                      ? 'bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Bell className="h-6 w-6" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-800">{reminder.trackerName}</h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm font-semibold text-[#1f7a8c] flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {reminder.time}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 break-words">{reminder.message}</p>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex flex-wrap gap-1">
                      {DAYS.map((day, index) => (
                        <span
                          key={index}
                          className={`text-xs px-2 py-1 rounded ${
                            reminder.days.includes(index)
                              ? 'bg-[#1f7a8c] text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {t(DAY_KEYS[index])}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setEditingReminder(reminder);
                      setFormData({
                        trackerName: reminder.trackerName,
                        time: reminder.time,
                        days: reminder.days,
                        message: reminder.message,
                      });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && reminders.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <MascotEmptyState
                title={t('reminders.emptyTitle')}
                subtitle={t('reminders.emptySubtitle')}
                action={
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white"
                  >
                    {t('reminders.createFirst')}
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Reminder Dialog */}
      <Dialog open={showAddDialog || !!editingReminder} onOpenChange={() => {
        setShowAddDialog(false);
        setEditingReminder(null);
        resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReminder ? t('reminders.editTitle') : t('reminders.addTitle')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reminders.trackerName')}
              </label>
              <input
                type="text"
                value={formData.trackerName}
                onChange={(e) => setFormData({ ...formData, trackerName: e.target.value })}
                placeholder={t('reminders.trackerPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a8c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reminders.time')}
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a8c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reminders.repeatOn')}
              </label>
              <div className="flex gap-2">
                {DAYS.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => toggleDay(index)}
                    className={`flex-1 py-2 text-sm rounded-lg transition ${
                      formData.days.includes(index)
                        ? 'bg-[#1f7a8c] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t(DAY_KEYS[index])}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reminders.message')}
              </label>
              <input
                type="text"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t('reminders.messagePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a8c]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowAddDialog(false);
                  setEditingReminder(null);
                  resetForm();
                }}
                variant="outline"
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={editingReminder ? handleEditReminder : handleAddReminder}
                className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white"
                disabled={!formData.trackerName || formData.days.length === 0}
              >
                {editingReminder ? t('profile.saveChanges') : t('reminders.addTitle')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
