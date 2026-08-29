/**
 * offlineSync.ts - Offline action queue and background cloud synchronizer
 */

import { useState, useEffect, useCallback } from "react";
import { 
  createMealLog, 
  createHydrationLog, 
  createBiometric,
  createWeightLog,
  createSleepLog,
  createSymptomLog,
  createWorkoutLog,
  createGoal,
  createCollectionItem
} from "./api";
import { toast } from "sonner";
import { celebrate } from "../app/components/celebrate";

export interface OfflineAction {
  id: string;
  type: 
    | "meal_log" 
    | "hydration_log" 
    | "biometric" 
    | "weight_log" 
    | "sleep_log" 
    | "symptom_log" 
    | "workout_log" 
    | "goal"
    | "collection_item";
  payload: any;
  queuedAt: string;
}

const OFFLINE_QUEUE_KEY = "mealoptimizer_offline_queue";

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineAction[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* ignore */
  }
}

export function queueOfflineAction(type: OfflineAction["type"], payload: any): void {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    queuedAt: new Date().toISOString(),
  };
  queue.push(newAction);
  saveOfflineQueue(queue);

  toast.info("Saved offline! Will sync automatically when reconnected ⚡", {
    duration: 3500,
  });
}

export async function flushOfflineQueue(): Promise<{ successCount: number; errorCount: number }> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { successCount: 0, errorCount: 0 };

  let successCount = 0;
  let errorCount = 0;
  const remaining: OfflineAction[] = [];

  for (const item of queue) {
    try {
      if (item.type === "meal_log") {
        await createMealLog(item.payload);
      } else if (item.type === "hydration_log") {
        await createHydrationLog(item.payload);
      } else if (item.type === "biometric") {
        await createBiometric(item.payload);
      } else if (item.type === "weight_log") {
        await createWeightLog(item.payload);
      } else if (item.type === "sleep_log") {
        await createSleepLog(item.payload);
      } else if (item.type === "symptom_log") {
        await createSymptomLog(item.payload);
      } else if (item.type === "workout_log") {
        await createWorkoutLog(item.payload);
      } else if (item.type === "goal") {
        await createGoal(item.payload);
      } else if (item.type === "collection_item" && item.payload?.collection && item.payload?.item) {
        await createCollectionItem(item.payload.collection, item.payload.item);
      }
      successCount++;
    } catch (e) {
      console.warn("[OfflineSync] Failed to sync item:", item, e);
      errorCount++;
      remaining.push(item);
    }
  }

  saveOfflineQueue(remaining);

  if (successCount > 0) {
    celebrate(
      `Cloud Synced! ☁️✓`,
      `${successCount} offline log${successCount > 1 ? "s" : ""} synced to your dashboard!`
    );
  }

  return { successCount, errorCount };
}

/**
 * React hook to observe online/offline status and pending sync queue
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshCount = useCallback(() => {
    setPendingCount(getOfflineQueue().length);
  }, []);

  const flush = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      await flushOfflineQueue();
    } finally {
      setIsSyncing(false);
      refreshCount();
    }
  }, [isSyncing, refreshCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back Online! Syncing pending logs... 🌐");
      flush();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are offline. Logs will be saved locally ⚡");
      refreshCount();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check on mount
    if (navigator.onLine && getOfflineQueue().length > 0) {
      flush();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flush, refreshCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    flushQueue: flush,
  };
}
