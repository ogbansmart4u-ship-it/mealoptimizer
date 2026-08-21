import confetti from "canvas-confetti";
import { toast } from "sonner";
import React from "react";

export type HapticType = "light" | "medium" | "success" | "double" | "milestone";
export type ConfettiStyle = "burst" | "cannons" | "fireworks" | "stars";

const BRAND_COLORS = ["#1f7a8c", "#4ecdc4", "#f39c12", "#2ecc71", "#3498db", "#ffd166"];

/**
 * Tactile haptic vibration for mobile users
 */
export function triggerHaptic(type: HapticType = "success") {
  try {
    if (typeof window === "undefined" || !("vibrate" in navigator)) return;

    switch (type) {
      case "light":
        navigator.vibrate?.(15);
        break;
      case "medium":
        navigator.vibrate?.(35);
        break;
      case "double":
        navigator.vibrate?.([20, 50, 20]);
        break;
      case "success":
        navigator.vibrate?.([25, 40, 35]);
        break;
      case "milestone":
        navigator.vibrate?.([50, 60, 50, 60, 120]);
        break;
    }
  } catch {
    /* ignore if unsupported or blocked by browser */
  }
}

/**
 * Multi-style Canvas Confetti animation
 */
export function triggerConfetti(
  style: ConfettiStyle = "burst",
  options: { particleCount?: number; origin?: { x: number; y: number } } = {}
) {
  try {
    if (typeof window === "undefined") return;

    const count = options.particleCount ?? 60;
    const origin = options.origin ?? { x: 0.5, y: 0.75 };

    switch (style) {
      case "burst":
        confetti({
          particleCount: count,
          spread: 70,
          origin,
          colors: BRAND_COLORS,
          disableForReducedMotion: true,
        });
        break;

      case "cannons": {
        // Left cannon
        confetti({
          particleCount: Math.round(count / 2),
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: BRAND_COLORS,
          disableForReducedMotion: true,
        });
        // Right cannon
        confetti({
          particleCount: Math.round(count / 2),
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: BRAND_COLORS,
          disableForReducedMotion: true,
        });
        break;
      }

      case "fireworks": {
        const end = Date.now() + 1.2 * 1000;
        const interval: any = setInterval(() => {
          if (Date.now() > end) {
            return clearInterval(interval);
          }
          confetti({
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: {
              x: Math.random() * 0.6 + 0.2,
              y: Math.random() * 0.4 + 0.2,
            },
            colors: BRAND_COLORS,
            disableForReducedMotion: true,
          });
        }, 200);
        break;
      }

      case "stars":
        confetti({
          particleCount: count,
          spread: 90,
          origin,
          shapes: ["circle", "square"],
          colors: BRAND_COLORS,
          scalar: 1.2,
          disableForReducedMotion: true,
        });
        break;
    }
  } catch (err) {
    console.warn("Confetti error:", err);
  }
}

export interface CelebrateMilestoneOptions {
  confetti?: boolean;
  confettiStyle?: ConfettiStyle;
  haptic?: boolean;
  hapticPattern?: HapticType;
  duration?: number;
}

/**
 * Universal on-brand milestone celebration (Toast + Confetti + Haptics)
 */
export function celebrateMilestone(
  message: string,
  subMessage?: string,
  options: CelebrateMilestoneOptions = {}
) {
  const {
    confetti = true,
    confettiStyle = "burst",
    haptic = true,
    hapticPattern = "success",
    duration = 3200,
  } = options;

  if (haptic) {
    triggerHaptic(hapticPattern);
  }

  if (confetti) {
    triggerConfetti(confettiStyle);
  }

  toast.custom(
    () => (
      <div className="flex items-center gap-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-teal-100 dark:border-zinc-800 p-3.5 pr-4 w-[340px] max-w-[90vw] select-none">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-sm" />
          <img
            src="/assets/mascot-v2.png"
            alt=""
            aria-hidden="true"
            className="relative w-11 h-11 object-contain drop-shadow-sm"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-snug">
            {message}
          </div>
          {subMessage && (
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-normal">
              {subMessage}
            </div>
          )}
        </div>
      </div>
    ),
    { duration }
  );
}
