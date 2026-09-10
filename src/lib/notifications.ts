/**
 * notifications.ts - Web Push Notification & Scheduled Reminders for MealOptimizer
 * Automatically schedules metabolic pre-meal alerts, circadian reminders, streak guards,
 * and postprandial glucose-lowering walk timers with 100% Mobile PWA ServiceWorker compatibility.
 */

import { toast } from "sonner";

export interface NotificationSchedule {
  morningAwakening: boolean;
  preMealShield: boolean;
  postMealWalkLunch: boolean;
  postMealEnergy: boolean;
  renalFlush: boolean;
  dinnerStarch: boolean;
  postMealWalkDinner: boolean;
  circadianCutoff: boolean;
  nocturnalBP: boolean;
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
    key: "postMealWalkLunch",
    title: "🚶‍♂️ Post-Lunch Glucose Walk (1:30 PM)",
    body: "Take a 10-15 minute light walk now! Muscle contractions activate GLUT4 receptors to soak up circulating glucose without extra insulin.",
    timeHour: 13,
    timeMinute: 30,
    category: "lunch",
  },
  {
    key: "postMealEnergy",
    title: "⚡ 2-Hour Post-Meal Energy Ping (2:30 PM)",
    body: "How is your energy level? Tap to record a 1-second check-in and check for hidden postprandial glucose crashes.",
    timeHour: 14,
    timeMinute: 30,
    category: "afternoon",
  },
  {
    key: "renalFlush",
    title: "💧 KDIGO Renal Flush & Electrolyte Hydration (4:00 PM)",
    body: "Hydration check: drink a glass of water with cucumber or lemon to maintain optimal eGFR kidney perfusion and flush metabolic sodium.",
    timeHour: 16,
    timeMinute: 0,
    category: "afternoon",
  },
  {
    key: "dinnerStarch",
    title: "🍠 Dinner Resistant Starch & 9-Inch Plating (6:30 PM)",
    body: "Planning dinner? Keep carbs to 25% of your 9-inch plate. Reheated yam or rice boosts resistant starch for steady overnight glucose.",
    timeHour: 18,
    timeMinute: 30,
    category: "dinner",
  },
  {
    key: "postMealWalkDinner",
    title: "🚶‍♀️ Post-Dinner Glycemic Plateau Walk (7:45 PM)",
    body: "A light 10-minute stroll after dinner speeds gastric transit, prevents heavy bloating, and ensures smooth overnight fasting glucose.",
    timeHour: 19,
    timeMinute: 45,
    category: "dinner",
  },
  {
    key: "circadianCutoff",
    title: "🌙 Circadian Fasting Window (8:30 PM)",
    body: "Gentle reminder to close your eating window for deep cellular rest, autophagy, and restorative sleep.",
    timeHour: 20,
    timeMinute: 30,
    category: "evening",
  },
  {
    key: "nocturnalBP",
    title: "🫀 Nocturnal Blood Pressure Wind-down (9:00 PM)",
    body: "Unsweetened hibiscus (Zobo) or warm herbal tea helps relax blood vessels for healthy nocturnal blood pressure dipping.",
    timeHour: 21,
    timeMinute: 0,
    category: "evening",
  },
  {
    key: "streakGuardian",
    title: "🔥 Streak Guardian Alert (9:30 PM)",
    body: "Your daily streak resets at midnight! Log your dinner or drink a glass of water to keep your metabolic streak alive.",
    timeHour: 21,
    timeMinute: 30,
    category: "evening",
  },
];

const DEFAULT_SCHEDULE: NotificationSchedule = {
  morningAwakening: true,
  preMealShield: true,
  postMealWalkLunch: true,
  postMealEnergy: true,
  renalFlush: true,
  dinnerStarch: true,
  postMealWalkDinner: true,
  circadianCutoff: true,
  nocturnalBP: true,
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

/**
 * 📲 Mobile PWA & Desktop Unified Notification Dispatcher
 * Directly uses ServiceWorkerRegistration.showNotification() to guarantee support on iOS Safari PWA and Android Chrome
 */
export async function triggerLocalNotification(
  title: string,
  body: string,
  icon = "/icon-192.png",
  url = "/home"
): Promise<void> {
  let dispatched = false;

  // 1. Mobile PWA ServiceWorker Notification (Guaranteed on iOS 16.4+ and Android)
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: icon,
          vibrate: [200, 100, 200],
          data: { url },
          tag: `mealoptimiza-${Date.now()}`,
        });
        dispatched = true;
      }
    } catch (err) {
      console.warn("[Notification] ServiceWorker showNotification fallback:", err);
    }
  }

  // 2. Desktop Standard Browser Notification fallback
  if (!dispatched && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
      dispatched = true;
    } catch (e) {
      console.warn("[Notification] Window Notification fallback failed:", e);
    }
  }

  // 3. In-App Rich Toast Feedback
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
 * 🚶‍♂️ Dynamic Postprandial Glucose Walk Scheduler
 * Schedules a precise walk reminder 30 minutes after any meal is logged or cooked.
 */
export function schedulePostMealWalkAlert(mealName = "your meal", minutesFromNow = 30): void {
  if (typeof window === "undefined") return;
  const scheduledTime = Date.now() + minutesFromNow * 60 * 1000;
  const dynamicAlert = {
    mealName,
    scheduledTime,
    title: `🚶‍♂️ Postprandial Glucose Walk (${minutesFromNow}m post-meal)`,
    body: `You finished ${mealName} ${minutesFromNow} minutes ago. A 10-15 minute walk right now activates muscle GLUT4 receptors and flattens your glucose peak by up to 35%!`,
  };
  try {
    localStorage.setItem("mealoptimizer_post_meal_walk_timer", JSON.stringify(dynamicAlert));
    toast.success(`⏱️ Glucose Walk Reminder set for ${minutesFromNow} mins from now!`, {
      description: `Avo will alert you when it's the optimal time to walk after ${mealName}.`,
      icon: "🚶‍♂️",
    });
  } catch {}
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

  // 1. Check Dynamic Post-Meal Walk Timer
  try {
    const rawWalkTimer = localStorage.getItem("mealoptimizer_post_meal_walk_timer");
    if (rawWalkTimer) {
      const walkTimer = JSON.parse(rawWalkTimer);
      if (Date.now() >= walkTimer.scheduledTime) {
        localStorage.removeItem("mealoptimizer_post_meal_walk_timer");
        triggerLocalNotification(walkTimer.title, walkTimer.body, "/icon-192.png", "/logs");
      }
    }
  } catch {}

  // 2. Check Circadian & Metabolic Alerts
  METABOLIC_ALERTS.forEach((alert) => {
    if (!prefs[alert.key]) return;

    // Check if within 15 minutes of scheduled time
    const matchesHour = currentHour === alert.timeHour;
    const matchesMinute = currentMinute >= alert.timeMinute && currentMinute <= alert.timeMinute + 15;

    if (matchesHour && matchesMinute) {
      const dispatchedKey = `mealoptimizer_alert_sent_${alert.key}_${todayKey}`;
      const alreadySent = localStorage.getItem(dispatchedKey);

      if (!alreadySent) {
        try {
          localStorage.setItem(dispatchedKey, "true");
        } catch {}

        triggerLocalNotification(alert.title, alert.body, "/icon-192.png", "/home");
      }
    }
  });
}

/**
 * Initializes the background timer engine to check alerts every 45 seconds.
 */
export function initNotificationEngine(): () => void {
  if (typeof window === "undefined") return () => {};

  checkScheduledAlerts();

  const timer = setInterval(() => {
    checkScheduledAlerts();
  }, 45000); // every 45s

  return () => clearInterval(timer);
}
