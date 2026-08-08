// Mascot ("Avo") gesture system — shared types + per-gesture motion config.
//
// The app ships with a single mascot image (`/assets/mascot.png`) animated with
// motion/react (Framer Motion). This file defines the gesture vocabulary and the
// motion each gesture uses, so the whole app drives the mascot through one small,
// typed API instead of ad-hoc CSS in every component.
//
// LOTTIE-READY: if you later export real Lottie animations, add a JSON path per
// gesture in `lottieSources` below and wire `lottie-react` inside Mascot.tsx —
// the rest of the system (context, hook, triggers) needs no changes.

import type { Transition, TargetAndTransition } from "motion/react";

export type MascotGesture =
  | "idle"
  | "waving"
  | "scratching"
  | "thumbsup"
  | "clapping"
  | "dancing"
  | "running";

export interface GestureConfig {
  /** motion/react `animate` target for the mascot image. */
  animate: TargetAndTransition;
  /** motion/react transition (timing/repeat) for the gesture. */
  transition: Transition;
  /**
   * How the gesture behaves after it fires:
   *  - "persistent": stays until something changes it (idle, running, scratching, dancing)
   *  - a number: milliseconds to play, then auto-revert to `idle` (waving, thumbsup, clapping)
   */
  hold: "persistent" | number;
}

const EASE_OUT = [0, 0, 0.2, 1] as const;

// Per-gesture motion. Kept subtle and on-brand — the mascot reacts, it doesn't
// distract. Every gesture is expressed purely as transform (no layout shift), so
// it never disturbs surrounding content or `position: fixed` nav/FABs.
export const GESTURES: Record<MascotGesture, GestureConfig> = {
  // Default: a gentle breathing sway with an occasional lean. Loops forever.
  idle: {
    animate: { rotate: [-2, 2, -2], y: [0, -2, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    hold: "persistent",
  },

  // Greeting: a friendly two-part wave, then settle back to idle.
  waving: {
    animate: { rotate: [0, -18, 12, -14, 10, 0] },
    transition: { duration: 1.1, ease: EASE_OUT, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    hold: 1200,
  },

  // Error / confusion: a small nervous shake. Loops while the error is present.
  scratching: {
    animate: { x: [0, -3, 3, -3, 3, 0], rotate: [0, -3, 3, -2, 2, 0] },
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
    hold: "persistent",
  },

  // Small win (meal logged, goal saved): a quick approving pop.
  thumbsup: {
    animate: { scale: [1, 1.22, 0.96, 1.06, 1], rotate: [0, 6, -4, 2, 0] },
    transition: { duration: 0.7, ease: EASE_OUT },
    hold: 1000,
  },

  // Task finished / daily goal met: an excited celebratory clap-bounce.
  clapping: {
    animate: { scale: [1, 1.14, 1, 1.14, 1], y: [0, -6, 0, -6, 0] },
    transition: { duration: 1, ease: "easeInOut" },
    hold: 1600,
  },

  // Big celebration (streak milestone, reward): a happy dance. Loops during the
  // celebration modal until dismissed.
  dancing: {
    animate: { rotate: [-10, 10, -10], x: [-4, 4, -4], y: [0, -6, 0] },
    transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
    hold: "persistent",
  },

  // Working / loading: an eager forward-leaning bob. Loops while busy.
  running: {
    animate: { y: [0, -8, 0], rotate: [-4, 2, -4] },
    transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" },
    hold: "persistent",
  },
};

// LOTTIE-READY seam. Fill these in (e.g. "/mascot/waving.json") once you have real
// Lottie exports; Mascot.tsx will prefer a Lottie source when one is present.
export const lottieSources: Partial<Record<MascotGesture, string>> = {};
