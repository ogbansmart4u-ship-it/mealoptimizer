import { useState, useEffect, useCallback } from "react";
import { MascotGesture } from "../types/mascot";
import { MascotNudgeAction } from "../components/MascotNudge";

export interface SmartNudgeState {
  isOpen: boolean;
  title: string;
  message: string;
  gesture: MascotGesture;
  badge?: string;
  badgeColor?: "teal" | "amber" | "emerald" | "rose" | "indigo";
  primaryAction?: MascotNudgeAction;
  secondaryAction?: MascotNudgeAction;
  autoCloseSec?: number;
}

export interface UseSmartNudgesProps {
  waterGlasses?: number;
  mealsLoggedCount?: number;
  streak?: number;
  disabled?: boolean;
  delayMs?: number;
  onDrinkWater?: () => Promise<void> | void;
  onLogMeal?: () => void;
}

const HYDRATION_NUDGE_STORAGE_KEY = "mo_last_hydration_nudge_time";
const GENERAL_NUDGE_STORAGE_KEY = "mo_last_smart_nudge_time";
const HYDRATION_INTERVAL_MS = 2 * 60 * 60 * 1000; // Smart 2-hour interval for hydration reminders
const GENERAL_COOLDOWN_MS = 45 * 60 * 1000; // 45-minute cooldown for meal reminders

export function useSmartNudges({
  waterGlasses = 0,
  mealsLoggedCount = 0,
  streak = 0,
  disabled = false,
  delayMs = 45000, // Peaceful 45-second default delay after page arrival
  onDrinkWater,
  onLogMeal,
}: UseSmartNudgesProps = {}) {
  const [nudge, setNudge] = useState<SmartNudgeState>({
    isOpen: false,
    title: "",
    message: "",
    gesture: "wave",
    autoCloseSec: 9,
  });

  const closeNudge = useCallback(() => {
    setNudge((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showNudge = useCallback(
    (data: Omit<SmartNudgeState, "isOpen">) => {
      if (disabled) return;
      setNudge({
        ...data,
        isOpen: true,
        autoCloseSec: data.autoCloseSec ?? 9,
      });
      try {
        localStorage.setItem(GENERAL_NUDGE_STORAGE_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    },
    [disabled]
  );

  useEffect(() => {
    if (disabled) {
      setNudge((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
      return;
    }

    let lastGeneralTime = 0;
    let lastHydrationTime = 0;
    try {
      lastGeneralTime = Number(localStorage.getItem(GENERAL_NUDGE_STORAGE_KEY) || 0);
      lastHydrationTime = Number(localStorage.getItem(HYDRATION_NUDGE_STORAGE_KEY) || 0);
    } catch {
      /* ignore */
    }

    const now = Date.now();
    const timeSinceGeneral = now - lastGeneralTime;
    const timeSinceHydration = now - lastHydrationTime;

    const timer = setTimeout(() => {
      if (disabled) return;
      const currentHour = new Date().getHours();

      // Rule 1: Smart Ambient Hydration Reminder (Every 2-3 Hours during waking hours 8 AM - 9 PM)
      if (
        currentHour >= 8 &&
        currentHour <= 21 &&
        waterGlasses < 8 &&
        timeSinceHydration >= HYDRATION_INTERVAL_MS &&
        onDrinkWater
      ) {
        showNudge({
          title: "Time for Water, Chief! 💧",
          message: `You've had ${waterGlasses}/8 glasses today. A glass of water now prevents blood thickness and supports natural blood pressure control.`,
          gesture: "wave",
          badge: "Hydration Guard",
          badgeColor: "teal",
          autoCloseSec: 9,
          primaryAction: {
            label: "+1 Glass (250ml) ⚡",
            onClick: async () => {
              try {
                localStorage.setItem(HYDRATION_NUDGE_STORAGE_KEY, String(Date.now()));
              } catch {
                /* ignore */
              }
              await onDrinkWater();
              showNudge({
                title: "Hydration Logged! 🥑",
                message: `${waterGlasses + 1} of 8 glasses reached! Arterial viscosity optimized.`,
                gesture: "celebrate",
                badge: "Goal Progress",
                badgeColor: "emerald",
                autoCloseSec: 4,
                secondaryAction: {
                  label: "Awesome",
                  onClick: closeNudge,
                },
              });
            },
          },
          secondaryAction: {
            label: "Later",
            onClick: () => {
              try {
                localStorage.setItem(HYDRATION_NUDGE_STORAGE_KEY, String(Date.now()));
              } catch {
                /* ignore */
              }
              closeNudge();
            },
          },
        });
        return;
      }

      // Check general cooldown for meal prompts
      if (timeSinceGeneral < GENERAL_COOLDOWN_MS) {
        return;
      }

      // Rule 2: Morning Breakfast Check (7:30 AM - 11:00 AM)
      if (currentHour >= 7 && currentHour < 11 && mealsLoggedCount === 0 && onLogMeal) {
        showNudge({
          title: "Good Morning! ☀️",
          message: "Fuel your morning with a balanced West African breakfast to keep your glucose steady and avoid midday slumps.",
          gesture: "wave",
          badge: "Morning Fuel",
          badgeColor: "amber",
          autoCloseSec: 9,
          primaryAction: {
            label: "Plan Breakfast",
            onClick: () => {
              closeNudge();
              onLogMeal();
            },
          },
          secondaryAction: {
            label: "Dismiss",
            onClick: closeNudge,
          },
        });
        return;
      }

      // Rule 3: Lunch Check (12:30 PM - 3:30 PM)
      if (currentHour >= 12 && currentHour < 16 && mealsLoggedCount <= 1 && onLogMeal) {
        showNudge({
          title: "Time for Lunch! 🍲",
          message: "Remember the sequencing secret: eat your leafy greens and protein first to buffer carbs and block the 2 PM crash.",
          gesture: "thumbsup",
          badge: "Midday Shield",
          badgeColor: "emerald",
          autoCloseSec: 9,
          primaryAction: {
            label: "Log Lunch",
            onClick: () => {
              closeNudge();
              onLogMeal();
            },
          },
          secondaryAction: {
            label: "Later",
            onClick: closeNudge,
          },
        });
        return;
      }

      // Rule 4: Streak Motivation
      if (streak >= 3 && mealsLoggedCount === 0) {
        showNudge({
          title: `🔥 ${streak}-Day Streak Active!`,
          message: "You are building real metabolic momentum. Log your first meal today to protect your streak!",
          gesture: "celebrate",
          badge: "Habit Streak",
          badgeColor: "indigo",
          autoCloseSec: 8,
          secondaryAction: {
            label: "Keep Going!",
            onClick: closeNudge,
          },
        });
        return;
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [waterGlasses, mealsLoggedCount, streak, disabled, delayMs, onDrinkWater, onLogMeal, showNudge, closeNudge]);

  return {
    nudge,
    showNudge,
    closeNudge,
  };
}
