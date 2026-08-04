export interface Reminder {
  id: string;
  trackerId: string;
  trackerName: string;
  time: string; // HH:mm format
  enabled: boolean;
  days: number[]; // 0-6 (Sunday-Saturday)
  message: string;
}

export const defaultReminders: Reminder[] = [
  {
    id: 'hydration-morning',
    trackerId: 'hydration',
    trackerName: 'Hydration',
    time: '09:00',
    enabled: true,
    days: [0, 1, 2, 3, 4, 5, 6],
    message: 'Time to log your water intake! 💧',
  },
  {
    id: 'hydration-afternoon',
    trackerId: 'hydration',
    trackerName: 'Hydration',
    time: '15:00',
    enabled: true,
    days: [0, 1, 2, 3, 4, 5, 6],
    message: 'Stay hydrated! Log your water. 💧',
  },
  {
    id: 'meal-breakfast',
    trackerId: 'meals',
    trackerName: 'Meals',
    time: '08:00',
    enabled: true,
    days: [1, 2, 3, 4, 5],
    message: 'Log your breakfast! 🍳',
  },
  {
    id: 'meal-lunch',
    trackerId: 'meals',
    trackerName: 'Meals',
    time: '12:30',
    enabled: true,
    days: [1, 2, 3, 4, 5],
    message: 'Time to log your lunch! 🍽️',
  },
  {
    id: 'workout',
    trackerId: 'workout',
    trackerName: 'Workout',
    time: '18:00',
    enabled: true,
    days: [1, 3, 5],
    message: 'Don\'t forget to log your workout! 💪',
  },
  {
    id: 'sleep',
    trackerId: 'sleep',
    trackerName: 'Sleep',
    time: '22:00',
    enabled: true,
    days: [0, 1, 2, 3, 4, 5, 6],
    message: 'Log your sleep time for better tracking! 😴',
  },
  {
    id: 'medication',
    trackerId: 'medication',
    trackerName: 'Medication',
    time: '09:00',
    enabled: false,
    days: [0, 1, 2, 3, 4, 5, 6],
    message: 'Time for your medication! 💊',
  },
];

export function getReminders(): Reminder[] {
  const saved = localStorage.getItem('customReminders');
  return saved ? JSON.parse(saved) : defaultReminders;
}

export function saveReminders(reminders: Reminder[]): void {
  localStorage.setItem('customReminders', JSON.stringify(reminders));
}

export function addReminder(reminder: Reminder): void {
  const reminders = getReminders();
  reminders.push(reminder);
  saveReminders(reminders);
}

export function updateReminder(id: string, updates: Partial<Reminder>): void {
  const reminders = getReminders();
  const index = reminders.findIndex((r) => r.id === id);
  if (index !== -1) {
    reminders[index] = { ...reminders[index], ...updates };
    saveReminders(reminders);
  }
}

export function deleteReminder(id: string): void {
  const reminders = getReminders();
  saveReminders(reminders.filter((r) => r.id !== id));
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return Promise.resolve('denied');
  }
  return Notification.requestPermission();
}

export function scheduleReminder(reminder: Reminder): void {
  if (!reminder.enabled || !('Notification' in window)) return;

  const now = new Date();
  const [hours, minutes] = reminder.time.split(':').map(Number);
  const scheduledTime = new Date(now);
  scheduledTime.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  // Check if today is in the allowed days
  const dayOfWeek = now.getDay();
  if (!reminder.days.includes(dayOfWeek)) {
    return;
  }

  const timeout = scheduledTime.getTime() - now.getTime();

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification(reminder.trackerName, {
        body: reminder.message,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
      });
    }
  }, timeout);
}
