// Mascot — renders "Avo" and plays the current gesture with motion/react.
//
// By default it follows the shared gesture from MascotContext, so triggering a
// gesture anywhere (mascot.thumbsUp(), mascot.startRunning(), …) animates every
// on-screen mascot at once. Pass an explicit `gesture` prop to drive one mascot
// independently (e.g. a card that should always "run").
//
// LOTTIE-READY: when you add real Lottie exports, set the paths in
// `lottieSources` (src/app/types/mascot.ts), install `lottie-react`, and render
// <Lottie/> in the marked spot below. Everything else stays the same.

import { motion, useReducedMotion } from "motion/react";
import { GESTURES, lottieSources, type MascotGesture } from "../types/mascot";
import { useMascot } from "../hooks/useMascot";

interface MascotProps {
  /** Override the shared gesture for this instance. Omit to follow MascotContext. */
  gesture?: MascotGesture;
  /** Width/height in pixels. Default 96. */
  size?: number;
  className?: string;
  /** Accessible label. Defaults to decorative (aria-hidden). */
  alt?: string;
}

export default function Mascot({ gesture: override, size = 96, className = "", alt }: MascotProps) {
  const { gesture: shared } = useMascot();
  const reduced = useReducedMotion();
  const gesture = override ?? shared;
  const config = GESTURES[gesture];

  // Reduced-motion: hold a still mascot, honoring the user's OS preference.
  const animate = reduced ? { rotate: 0, x: 0, y: 0, scale: 1 } : config.animate;
  const transition = reduced ? { duration: 0 } : config.transition;

  const decorative = !alt;

  // LOTTIE-READY: if a Lottie source is registered for this gesture, prefer it.
  // (No-op today — `lottieSources` is empty and lottie-react isn't a dependency.)
  const lottie = lottieSources[gesture];
  if (lottie) {
    // Example once lottie-react is installed:
    //   return <Lottie animationData={loaded[gesture]} loop style={{ width: size, height: size }} />;
  }

  return (
    <motion.img
      // `key` restarts the animation cleanly whenever the gesture changes.
      key={gesture}
      src="/assets/mascot.png"
      alt={alt ?? ""}
      aria-hidden={decorative ? true : undefined}
      style={{ width: size, height: size, transformOrigin: "bottom center" }}
      className={`object-contain drop-shadow-sm select-none pointer-events-none ${className}`}
      animate={animate}
      transition={transition}
      draggable={false}
    />
  );
}
