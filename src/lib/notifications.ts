/**
 * notifications.ts - Web Push Notification & Scheduled Reminders for MealOptimizer
 */

export interface NotificationSchedule {
  preMealShield: boolean;
  postMealEnergy: boolean;
  circadianCutoff: boolean;
  streakGuardian: boolean;
}

const DEFAULT_SCHEDULE: NotificationSchedule = {
  preMealShield: true,
  postMealEnergy: true,
  circadianCutoff: true,
  streakGuardian: true,
};

export function getNotificationPreferences(): NotificationSchedule {
  try {
    const saved = localStorage.getItem("mealoptimizer_notifications");
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
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
  if (!("Notification" in window)) {
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
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  try {
    new Notification(title, {
      body,
      icon,
      badge: icon,
    });
  } catch (e) {
    console.warn("Could not dispatch notification:", e);
  }
}
