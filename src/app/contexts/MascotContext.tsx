// MascotContext — one place that owns the mascot's current gesture.
//
// Components anywhere in the tree call the convenience triggers from useMascot()
// (wave, thumbsUp, clap, dance, startRunning, showError, …) and every <Mascot />
// that reads this context reacts. Transient gestures (wave/thumbsup/clap) play
// once and auto-revert to idle; persistent ones (running/scratching/dancing) stay
// until you clear them.

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { GESTURES, type MascotGesture } from "../types/mascot";

export interface MascotContextValue {
  gesture: MascotGesture;
  /** Set the gesture directly. Transient gestures revert to idle automatically. */
  setGesture: (g: MascotGesture) => void;
  // Convenience triggers (self-documenting at call sites):
  wave: () => void;        // greeting: app load, login, onboarding
  thumbsUp: () => void;    // small win: meal logged, goal saved, macro calculated
  clap: () => void;        // task/daily goal completed
  dance: () => void;       // big celebration (persistent until stop)
  startRunning: () => void;// background work / loading (persistent)
  showError: () => void;   // error / validation failure (persistent scratching)
  stop: () => void;        // clear any persistent gesture back to idle
}

export const MascotContext = createContext<MascotContextValue | undefined>(undefined);

export function MascotProvider({ children }: { children: ReactNode }) {
  const [gesture, setGestureState] = useState<MascotGesture>("idle");
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (revertTimer.current) {
      clearTimeout(revertTimer.current);
      revertTimer.current = null;
    }
  };

  const setGesture = useCallback((g: MascotGesture) => {
    clearTimer();
    setGestureState(g);
    const hold = GESTURES[g].hold;
    // Transient gestures play for `hold` ms, then fall back to idle.
    if (typeof hold === "number") {
      revertTimer.current = setTimeout(() => {
        setGestureState("idle");
        revertTimer.current = null;
      }, hold);
    }
  }, []);

  useEffect(() => () => clearTimer(), []);

  const value: MascotContextValue = {
    gesture,
    setGesture,
    wave: useCallback(() => setGesture("waving"), [setGesture]),
    thumbsUp: useCallback(() => setGesture("thumbsup"), [setGesture]),
    clap: useCallback(() => setGesture("clapping"), [setGesture]),
    dance: useCallback(() => setGesture("dancing"), [setGesture]),
    startRunning: useCallback(() => setGesture("running"), [setGesture]),
    showError: useCallback(() => setGesture("scratching"), [setGesture]),
    stop: useCallback(() => setGesture("idle"), [setGesture]),
  };

  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>;
}
