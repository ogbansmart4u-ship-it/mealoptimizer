import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Bell, Clock, Calendar, Trash2, Edit, BellOff } from 'lucide-react';
import { saveReminders, requestNotificationPermission, Reminder } from '../utils/reminderManager';
import { getCollection, createCollectionItem, updateCollectionItem, deleteCollectionItem } from '../../lib/api';
import { SkeletonRows } from '../components/SkeletonLoader';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Reminders() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const [formData, setFormData] = useState({
    trackerName: '',
    time: '09:00',
    days: [0, 1, 2, 3, 4, 5, 6],
    message: '',
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Load this account's reminders from the backend, and mirror them into
  // local storage so the on-device notification scheduler keeps firing.
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
    if (confirm('Delete this reminder?')) {
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
      message: formData.message || `Time to log ${formData.trackerName}!`,
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
            <h1 className="text-3xl font-bold text-white">Custom Reminders</h1>
            <p className="text-white/90 text-sm">Set personalized reminder times</p>
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
                <h3 className="font-semibold text-yellow-800">Enable Notifications</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Allow notifications to receive reminders
                </p>
                <Button
                  onClick={handleRequestPermission}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Enable Notifications
                </Button>
              </div>
            </div>
          </div>
        )}

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
                          {day}
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
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-800 mb-2">No Reminders Yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create custom reminders for your health trackers
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white"
              >
                Create First Reminder
              </Button>
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
            <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracker Name
              </label>
              <input
                type="text"
                value={formData.trackerName}
                onChange={(e) => setFormData({ ...formData, trackerName: e.target.value })}
                placeholder="e.g., Hydration, Meals, Workout"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a8c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
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
                Repeat on
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
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <input
                type="text"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Reminder message"
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
                Cancel
              </Button>
              <Button
                onClick={editingReminder ? handleEditReminder : handleAddReminder}
                className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white"
                disabled={!formData.trackerName || formData.days.length === 0}
              >
                {editingReminder ? 'Save Changes' : 'Add Reminder'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
