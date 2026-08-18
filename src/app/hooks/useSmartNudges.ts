import { useState, useEffect, useCallback } from 'react';
import { MascotGesture } from '../types/mascot';
import { MascotNudgeAction } from '../components/MascotNudge';

export interface SmartNudgeState {
  isOpen: boolean;
  title: string;
  message: string;
  gesture: MascotGesture;
  badge?: string;
  badgeColor?: 'teal' | 'amber' | 'emerald' | 'rose' | 'indigo';
  primaryAction?: MascotNudgeAction;
  secondaryAction?: MascotNudgeAction;
}

export interface UseSmartNudgesProps {
  waterGlasses?: number;
  mealsLoggedCount?: number;
  streak?: number;
  onDrinkWater?: () => Promise<void> | void;
  onLogMeal?: () => void;
}

const NUDGE_STORAGE_KEY = 'mo_last_smart_nudge_time';
const NUDGE_COOLDOWN_MS = 45 * 60 * 1000; // 45 minutes between automatic proactive nudges

export function useSmartNudges({
  waterGlasses = 0,
  mealsLoggedCount = 0,
  streak = 0,
  onDrinkWater,
  onLogMeal,
}: UseSmartNudgesProps = {}) {
  const [nudge, setNudge] = useState<SmartNudgeState>({
    isOpen: false,
    title: '',
    message: '',
    gesture: 'waving',
  });

  const closeNudge = useCallback(() => {
    setNudge((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showNudge = useCallback((data: Omit<SmartNudgeState, 'isOpen'>) => {
    setNudge({
      ...data,
      isOpen: true,
    });
    try {
      localStorage.setItem(NUDGE_STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    // Check cooldown
    let lastTime = 0;
    try {
      lastTime = Number(localStorage.getItem(NUDGE_STORAGE_KEY) || 0);
    } catch {
      /* ignore */
    }

    const timeSinceLast = Date.now() - lastTime;
    if (timeSinceLast < NUDGE_COOLDOWN_MS) {
      return; // Still in cooldown
    }

    const timer = setTimeout(() => {
      const now = new Date();
      const hour = now.getHours();

      // Rule 1: Hydration Check (Afternoon / Evening)
      if (hour >= 13 && hour <= 20 && waterGlasses < 4 && onDrinkWater) {
        showNudge({
          title: 'Stay Hydrated! 💧',
          message: `You've logged ${waterGlasses} of 10 glasses today. Drinking water now helps regulate digestion and keep blood pressure steady.`,
          gesture: 'waving',
          badge: 'Hydration Goal',
          badgeColor: 'teal',
          primaryAction: {
            label: 'Drink 1 Glass (+250ml)',
            onClick: async () => {
              await onDrinkWater();
              showNudge({
                title: 'Great Job! 👏',
                message: '1 glass added! Hydration level updated.',
                gesture: 'thumbsup',
                badge: 'Logged',
                badgeColor: 'emerald',
                secondaryAction: {
                  label: 'Done',
                  onClick: closeNudge,
                },
              });
            },
          },
          secondaryAction: {
            label: 'Later',
            onClick: closeNudge,
          },
        });
        return;
      }

      // Rule 2: Morning Breakfast Check (7:30 AM - 11:00 AM)
      if (hour >= 7 && hour < 11 && mealsLoggedCount === 0 && onLogMeal) {
        showNudge({
          title: 'Good Morning! ☀️',
          message: 'Fuel your day with a balanced West African breakfast to keep your glucose steady and energy high.',
          gesture: 'waving',
          badge: 'Morning Nutrition',
          badgeColor: 'amber',
          primaryAction: {
            label: 'Log Breakfast',
            onClick: () => {
              closeNudge();
              onLogMeal();
            },
          },
          secondaryAction: {
            label: 'Dismiss',
            onClick: closeNudge,
          },
        });
        return;
      }

      // Rule 3: Lunch Check (12:30 PM - 3:30 PM)
      if (hour >= 12 && hour < 16 && mealsLoggedCount <= 1 && onLogMeal) {
        showNudge({
          title: 'Time for Lunch! 🍲',
          message: 'Remember to balance your carbs with leafy greens and protein to prevent afternoon glucose spikes.',
          gesture: 'thumbsup',
          badge: 'Midday Fuel',
          badgeColor: 'emerald',
          primaryAction: {
            label: 'Log / Plan Lunch',
            onClick: () => {
              closeNudge();
              onLogMeal();
            },
          },
          secondaryAction: {
            label: 'Later',
            onClick: closeNudge,
          },
        });
        return;
      }

      // Rule 4: Streak Motivation
      if (streak >= 3 && mealsLoggedCount === 0) {
        showNudge({
          title: `🔥 ${streak}-Day Streak Active!`,
          message: 'You are building strong, lasting health habits. Log your meals today to keep your streak alive!',
          gesture: 'dancing',
          badge: 'Habit Champion',
          badgeColor: 'indigo',
          secondaryAction: {
            label: 'Keep Going!',
            onClick: closeNudge,
          },
        });
        return;
      }
    }, 2000); // 2 second initial delay on page load

    return () => clearTimeout(timer);
  }, [waterGlasses, mealsLoggedCount, streak, onDrinkWater, onLogMeal, showNudge, closeNudge]);

  return {
    nudge,
    showNudge,
    closeNudge,
  };
}
