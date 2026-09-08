import { useState, useEffect, useCallback } from "react";
import { getHydrationLogs, createHydrationLog, deleteHydrationLog } from "../../lib/api";
import { triggerHaptic } from "../utils/celebration";
import { celebrate } from "../components/celebrate";
import { toast } from "sonner";

export const GLASS_ML = 250;
export const DEFAULT_GOAL_GLASSES = 8;
export const DEFAULT_GOAL_ML = DEFAULT_GOAL_GLASSES * GLASS_ML; // 2,000ml

const STORAGE_KEY_ML = "mo_today_water_ml";
const STORAGE_KEY_IDS = "mo_today_water_ids";
const STORAGE_KEY_DATE = "mo_today_water_date";
const EVENT_NAME = "mo_hydration_synced";

export interface HydrationSnapshot {
  totalMl: number;
  glasses: number;
  goalGlasses: number;
  goalMl: number;
  percent: number;
  waterIds: string[];
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// In-memory cache for instantaneous UI reactivity
let memoryMl = 0;
let memoryIds: string[] = [];
let memoryDate = getTodayStr();

// Initialize from localStorage
try {
  const savedDate = localStorage.getItem(STORAGE_KEY_DATE);
  if (savedDate === getTodayStr()) {
    memoryMl = Number(localStorage.getItem(STORAGE_KEY_ML) || 0);
    memoryIds = JSON.parse(localStorage.getItem(STORAGE_KEY_IDS) || "[]");
  } else {
    memoryDate = getTodayStr();
    memoryMl = 0;
    memoryIds = [];
    localStorage.setItem(STORAGE_KEY_DATE, memoryDate);
    localStorage.setItem(STORAGE_KEY_ML, "0");
    localStorage.setItem(STORAGE_KEY_IDS, "[]");
  }
} catch {
  /* ignore */
}

export function getHydrationSnapshot(): HydrationSnapshot {
  const today = getTodayStr();
  if (memoryDate !== today) {
    memoryDate = today;
    memoryMl = 0;
    memoryIds = [];
  }
  const glasses = Math.round(memoryMl / GLASS_ML);
  const percent = Math.min(100, Math.round((memoryMl / DEFAULT_GOAL_ML) * 100));
  return {
    totalMl: memoryMl,
    glasses,
    goalGlasses: DEFAULT_GOAL_GLASSES,
    goalMl: DEFAULT_GOAL_ML,
    percent,
    waterIds: [...memoryIds],
  };
}

function broadcastSync() {
  if (typeof window === "undefined") return;
  const snapshot = getHydrationSnapshot();
  try {
    localStorage.setItem(STORAGE_KEY_DATE, getTodayStr());
    localStorage.setItem(STORAGE_KEY_ML, String(snapshot.totalMl));
    localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(snapshot.waterIds));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: snapshot }));
}

/**
 * Fetch latest hydration logs from server and update all local stores
 */
export async function refreshHydrationLogs(): Promise<HydrationSnapshot> {
  const today = getTodayStr();
  try {
    const items = (await getHydrationLogs()) || [];
    const todays = items.filter((it: any) => String(it?.logged_at ?? "").startsWith(today));
    const total = todays.reduce((sum: number, it: any) => sum + (Number(it?.amount_ml) || 0), 0);
    const ids = todays.map((it: any) => String(it?.id)).filter(Boolean);

    memoryMl = total;
    memoryIds = ids;
    memoryDate = today;

    broadcastSync();
    return getHydrationSnapshot();
  } catch (e) {
    return getHydrationSnapshot();
  }
}

/**
 * Add water log (e.g. +250ml glass, +500ml bottle, +300ml zobo)
 */
export async function addWaterLog(
  amountMl: number = GLASS_ML,
  type: string = "water",
  beverageName: string = "Water"
): Promise<HydrationSnapshot> {
  triggerHaptic("medium");
  
  // Optimistic update
  memoryMl += amountMl;
  const optimisticSnapshot = getHydrationSnapshot();
  broadcastSync();

  const nextGlasses = optimisticSnapshot.glasses;
  if (nextGlasses >= DEFAULT_GOAL_GLASSES) {
    celebrate("Hydration Goal Achieved! 💧🎉", `${nextGlasses} of ${DEFAULT_GOAL_GLASSES} glasses completed today!`, {
      confettiStyle: "cannons",
      hapticPattern: "milestone",
    });
  } else {
    celebrate(`Water Logged! 💧 (+${amountMl}ml)`, `${nextGlasses}/${DEFAULT_GOAL_GLASSES} glasses today`, {
      confetti: false,
      hapticPattern: "light",
    });
  }

  try {
    const item = await createHydrationLog({
      amount_ml: amountMl,
      type,
      logged_at: new Date().toISOString(),
    });
    if (item?.id) {
      memoryIds.push(String(item.id));
      broadcastSync();
    }
  } catch (err) {
    // Rollback on network failure
    memoryMl = Math.max(0, memoryMl - amountMl);
    broadcastSync();
    toast.error("Could not sync water log to cloud. Kept locally.");
  }

  return getHydrationSnapshot();
}

/**
 * Undo / Remove last water glass
 */
export async function removeLastWaterLog(): Promise<HydrationSnapshot> {
  if (memoryMl <= 0) return getHydrationSnapshot();
  triggerHaptic("light");

  const lastId = memoryIds.pop();
  memoryMl = Math.max(0, memoryMl - GLASS_ML);
  broadcastSync();
  toast.info("Removed 1 glass (-250ml) ↩️");

  if (lastId) {
    try {
      await deleteHydrationLog(lastId);
    } catch {
      /* ignore */
    }
  }

  return getHydrationSnapshot();
}

/**
 * React Hook for any component to stay 100% reactive and synchronized
 */
export function useHydrationSync() {
  const [snapshot, setSnapshot] = useState<HydrationSnapshot>(getHydrationSnapshot());
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    // Load fresh on mount
    refreshHydrationLogs().then((s) => setSnapshot(s));

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<HydrationSnapshot>;
      if (customEvent.detail) {
        setSnapshot(customEvent.detail);
      } else {
        setSnapshot(getHydrationSnapshot());
      }
    };

    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener("storage", () => setSnapshot(getHydrationSnapshot()));
    window.addEventListener("focus", () => refreshHydrationLogs());

    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
    };
  }, []);

  const addGlass = useCallback(
    async (amountMl: number = GLASS_ML, type: string = "water", name: string = "Water") => {
      setIsBusy(true);
      try {
        const s = await addWaterLog(amountMl, type, name);
        setSnapshot(s);
        return s;
      } finally {
        setIsBusy(false);
      }
    },
    []
  );

  const removeGlass = useCallback(async () => {
    setIsBusy(true);
    try {
      const s = await removeLastWaterLog();
      setSnapshot(s);
      return s;
    } finally {
      setIsBusy(false);
    }
  }, []);

  return {
    ...snapshot,
    isBusy,
    addGlass,
    removeGlass,
    refresh: refreshHydrationLogs,
  };
}
