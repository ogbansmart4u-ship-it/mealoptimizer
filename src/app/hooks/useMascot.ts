// useMascot — access the shared mascot gesture controls from anywhere.
//
// Example:
//   const mascot = useMascot();
//   mascot.wave();                 // greet on load
//   mascot.thumbsUp();             // after a meal is logged
//   mascot.startRunning();         // while a request is in flight
//   mascot.stop();                 // back to idle when done
//
// Safe outside a provider: if no MascotProvider is mounted, the triggers are
// no-ops and `gesture` stays "idle", so a stray call never throws.

import { useContext } from "react";
import { MascotContext, type MascotContextValue } from "../contexts/MascotContext";

const NOOP_MASCOT: MascotContextValue = {
  gesture: "idle",
  setGesture: () => {},
  wave: () => {},
  thumbsUp: () => {},
  clap: () => {},
  dance: () => {},
  startRunning: () => {},
  showError: () => {},
  stop: () => {},
};

export function useMascot(): MascotContextValue {
  return useContext(MascotContext) ?? NOOP_MASCOT;
}
