interface TrackerData {
  id: string;
  name: string;
  value: number;
  target?: number;
  unit: string;
  timestamp: string;
}

interface SmartReminderRule {
  id: string;
  trackerId: string;
  condition: (data: TrackerData, currentTime: Date) => boolean;
  message: (data: TrackerData) => string;
  priority: 'low' | 'medium' | 'high';
}

export const SMART_REMINDER_RULES: SmartReminderRule[] = [
  {
    id: 'low-water-afternoon',
    trackerId: 'hydration',
    condition: (data, time) => {
      const hour = time.getHours();
      const target = data.target || 2000;
      const progress = (data.value / target) * 100;

      // If it's after 3 PM and water intake is below 50%
      return hour >= 15 && progress < 50;
    },
    message: (data) => {
      const remaining = (data.target || 2000) - data.value;
      return `💧 Low water intake! You still need ${remaining}ml to reach your daily goal. Drink up!`;
    },
    priority: 'high',
  },
  {
    id: 'no-breakfast-logged',
    trackerId: 'meals',
    condition: (data, time) => {
      const hour = time.getHours();
      const today = new Date().toISOString().split('T')[0];
      const lastLog = new Date(data.timestamp).toISOString().split('T')[0];

      // If it's after 10 AM and no meal logged today
      return hour >= 10 && lastLog !== today;
    },
    message: () => '🍳 Haven\'t logged breakfast yet? Don\'t forget to track your first meal!',
    priority: 'medium',
  },
  {
    id: 'evening-workout-reminder',
    trackerId: 'workout',
    condition: (data, time) => {
      const hour = time.getHours();
      const today = new Date().toISOString().split('T')[0];
      const lastLog = new Date(data.timestamp).toISOString().split('T')[0];

      // If it's 5-7 PM and no workout logged today
      return hour >= 17 && hour < 19 && lastLog !== today;
    },
    message: () => '💪 Evening workout time! Get moving to stay on track with your fitness goals.',
    priority: 'medium',
  },
  {
    id: 'bedtime-routine',
    trackerId: 'sleep',
    condition: (data, time) => {
      const hour = time.getHours();
      const target = data.target || 8;

      // If it's after 10 PM and sleep goal is high (8+ hours)
      return hour >= 22 && target >= 8;
    },
    message: (data) => `😴 Time to wind down! Aim for ${data.target} hours of quality sleep tonight.`,
    priority: 'low',
  },
  {
    id: 'medication-reminder',
    trackerId: 'medication',
    condition: (data, time) => {
      const today = new Date().toISOString().split('T')[0];
      const lastLog = new Date(data.timestamp).toISOString().split('T')[0];

      // If medication not logged today
      return lastLog !== today;
    },
    message: () => '💊 Don\'t forget to take your medication and log it!',
    priority: 'high',
  },
  {
    id: 'weight-check-weekly',
    trackerId: 'weight',
    condition: (data, time) => {
      const daysSinceLastLog = Math.floor(
        (time.getTime() - new Date(data.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      );

      // If it's been more than 7 days since last weight log
      return daysSinceLastLog >= 7;
    },
    message: () => '⚖️ It\'s been a week! Time for your weekly weigh-in to track progress.',
    priority: 'medium',
  },
  {
    id: 'steps-goal-noon',
    trackerId: 'steps',
    condition: (data, time) => {
      const hour = time.getHours();
      const target = data.target || 10000;
      const progress = (data.value / target) * 100;

      // If it's noon and steps are below 30%
      return hour === 12 && progress < 30;
    },
    message: (data) => {
      const remaining = (data.target || 10000) - data.value;
      return `👟 Only ${data.value} steps so far. Take a walk! ${remaining} steps to go.`;
    },
    priority: 'medium',
  },
  {
    id: 'streak-maintenance',
    trackerId: 'all',
    condition: (data, time) => {
      const hour = time.getHours();
      const today = new Date().toISOString().split('T')[0];
      const lastLog = new Date(data.timestamp).toISOString().split('T')[0];

      // If it's 8 PM and nothing logged today
      return hour >= 20 && lastLog !== today;
    },
    message: (data) => `🔥 Don't break your streak! Log your ${data.name} before the day ends.`,
    priority: 'high',
  },
];

export function checkSmartReminders(trackerData: TrackerData[]): string[] {
  const currentTime = new Date();
  const reminders: string[] = [];

  for (const rule of SMART_REMINDER_RULES) {
    const relevantData = trackerData.filter(
      d => rule.trackerId === 'all' || d.id === rule.trackerId
    );

    for (const data of relevantData) {
      if (rule.condition(data, currentTime)) {
        reminders.push(rule.message(data));
      }
    }
  }

  return reminders;
}

export function scheduleSmartReminders(
  trackerData: TrackerData[],
  callback: (message: string) => void
) {
  // Check every hour
  const interval = setInterval(() => {
    const reminders = checkSmartReminders(trackerData);
    reminders.forEach(callback);
  }, 60 * 60 * 1000); // 1 hour

  return () => clearInterval(interval);
}
