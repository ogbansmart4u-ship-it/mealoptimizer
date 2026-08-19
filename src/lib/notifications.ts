/**
 * notifications.ts - Web Push Notification & Scheduled Reminders for MealOptimizer
 * Automatically schedules metabolic pre-meal alerts, circadian reminders, and streak guards.
 */

import { toast } from "sonner";

export interface NotificationSchedule {
  morningAwakening: boolean;
  preMealShield: boolean;
  postMealEnergy: boolean;
  dinnerStarch: boolean;
  circadianCutoff: boolean;
  streakGuardian: boolean;
}

export interface ScheduledAlertDefinition {
  key: keyof NotificationSchedule;
  title: string;
  body: string;
  timeHour: number; // 24-hr format
  timeMinute: number;
  icon?: string;
  category: "morning" | "lunch" | "afternoon" | "dinner" | "evening";
}

export const METABOLIC_ALERTS: ScheduledAlertDefinition[] = [
  {
    key: "morningAwakening",
    title: "💧 Morning Hydration & Cortisol Shield (8:00 AM)",
    body: "Rise and drink 2 glasses of water to prime metabolic clearance and buffer dawn cortisol spikes!",
    timeHour: 8,
    timeMinute: 0,
    category: "morning",
  },
  {
    key: "preMealShield",
    title: "🥗 Pre-Lunch Fiber Shield (11:45 AM)",
    body: "Eating lunch soon? Eat your vegetable soup (Ugu / Ewedu / Okra) 10 minutes BEFORE carbs to block up to 35% of the glucose spike!",
    timeHour: 11,
    timeMinute: 45,
    category: "lunch",
  },
  {
    key: "postMealEnergy",
    title: "⚡ 2-Hour Post-Meal Energy Ping (2:30 PM)",
    body: "How is your energy level? Tap to record a 1-second check-in and check for hidden glucose crashes.",
    timeHour: 14,
    timeMinute: 30,
    category: "afternoon",
  },
  {
    key: "dinnerStarch",
    title: "🍠 Dinner Resistant Starch Hack (6:00 PM)",
    body: "Planning dinner? Reheating batch-cooked yam or rice boosts resistant starch for steady overnight glucose control.",
    timeHour: 18,
    timeMinute: 0,
    category: "dinner",
  },
  {
    key: "circadianCutoff",
    title: "🌙 Circadian Fasting Window (7:30 PM)",
    body: "Gentle reminder to close your eating window for deep cellular rest, autophagy, and restorative sleep.",
    timeHour: 19,
    timeMinute: 30,
    category: "evening",
  },
  {
    key: "streakGuardian",
    title: "🔥 Streak Guardian Alert (8:30 PM)",
    body: "Your daily streak resets at midnight! Log your dinner or drink a glass of water to keep your streak alive.",
    timeHour: 20,
    timeMinute: 30,
    category: "evening",
  },
];

const DEFAULT_SCHEDULE: NotificationSchedule = {
  morningAwakening: true,
  preMealShield: true,
  postMealEnergy: true,
  dinnerStarch: true,
  circadianCutoff: true,
  streakGuardian: true,
};

export function getNotificationPreferences(): NotificationSchedule {
  try {
    const saved = localStorage.getItem("mealoptimizer_notifications");
    return saved ? { ...DEFAULT_SCHEDULE, ...JSON.parse(saved) } : DEFAULT_SCHEDULE;
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

export function saveNotificationPreferences(prefs: NotificationSchedule): void {
  try {
    localStorage.setItem("mealoptimizer_notifications", JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this browser");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (err) {
    console.error("Error requesting notification permission:", err);
    return false;
  }
}

export function triggerLocalNotification(title: string, body: string, icon = "/assets/mascot.png"): void {
  // 1. Native Web Push (if permission granted)
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
    } catch (e) {
      console.warn("Could not dispatch native push notification:", e);
    }
  }

  // 2. In-App Rich Toast fallback
  try {
    toast(title, {
      description: body,
      duration: 6000,
      icon: "🥑",
    });
  } catch {
    /* ignore */
  }
}

/**
 * Checks all metabolic alerts against current local time and triggers alerts once per day.
 */
export function checkScheduledAlerts(): void {
  if (typeof window === "undefined") return;

  const prefs = getNotificationPreferences();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayKey = now.toISOString().split("T")[0];

  METABOLIC_ALERTS.forEach((alert) => {
    // Is alert enabled by user?
    if (!prefs[alert.key]) return;

    // Check if within 15 minutes of scheduled time
    const matchesHour = currentHour === alert.timeHour;
    const matchesMinute = currentMinute >= alert.timeMinute && currentMinute <= alert.timeMinute + 15;

    if (matchesHour && matchesMinute) {
      const dispatchedKey = `mealoptimizer_alert_sent_${alert.key}_${todayKey}`;
      const alreadySent = localStorage.getItem(dispatchedKey);

      if (!alreadySent) {
        // Mark as sent today
        try {
          localStorage.setItem(dispatchedKey, "true");
        } catch {
          /* ignore */
        }

        // Dispatch alert
        triggerLocalNotification(alert.title, alert.body);
      }
    }
  });
}

/**
 * Initializes the background timer engine to check alerts every 45 seconds.
 */
export function initNotificationEngine(): () => void {
  if (typeof window === "undefined") return () => {};

  // Run initial check immediately
  checkScheduledAlerts();

  // Schedule interval check
  const timer = setInterval(() => {
    checkScheduledAlerts();
  }, 45000); // every 45s

  return () => clearInterval(timer);
}
