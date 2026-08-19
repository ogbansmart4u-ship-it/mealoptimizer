// Mascot — renders "Avo" and plays the current gesture with CSS keyframes.
//
// Uses the same dependency-free CSS-animation approach as MascotLoader (proven to
// work here) rather than Framer Motion. By default it follows the shared gesture
// from MascotContext, so triggering a gesture anywhere (mascot.thumbsUp(),
// mascot.startRunning(), …) animates every on-screen mascot at once. Pass an
// explicit `gesture` prop to drive one mascot independently (e.g. a card that
// should always "run").
//
// LOTTIE-READY: when you add real Lottie exports, set the paths in `lottieSources`
// (src/app/types/mascot.ts), install `lottie-react`, and render <Lottie/> in the
// marked spot below. Everything else stays the same.

import { GESTURES, MASCOT_KEYFRAMES, lottieSources, type MascotGesture } from "../types/mascot";
import { useMascot } from "../hooks/useMascot";

interface MascotProps {
  /** Override the shared gesture for this instance. Omit to follow MascotContext. */
  gesture?: MascotGesture | string;
  /** Width/height in pixels. Default 96. */
  size?: number;
  className?: string;
  /** Accessible label. Defaults to decorative (aria-hidden). */
  alt?: string;
}

export default function Mascot({ gesture: override, size = 96, className = "", alt }: MascotProps) {
  const { gesture: shared } = useMascot();
  const gesture = override ?? shared;
  const config = (gesture && (GESTURES as Record<string, any>)[gesture]) || GESTURES.idle;
  const decorative = !alt;

  // LOTTIE-READY: if a Lottie source is registered for this gesture, prefer it.
  // (No-op today — `lottieSources` is empty and lottie-react isn't a dependency.)
  const lottie = gesture ? (lottieSources as Record<string, string | undefined>)[gesture] : undefined;
  if (lottie) {
    // Example once lottie-react is installed:
    //   return <Lottie animationData={loaded[gesture]} loop style={{ width: size, height: size }} />;
  }

  return (
    <>
      <style>{MASCOT_KEYFRAMES}</style>
      <img
        // `key` restarts the CSS animation cleanly whenever the gesture changes.
        key={gesture || "idle"}
        src="/assets/mascot.png"
        alt={alt ?? ""}
        aria-hidden={decorative ? true : undefined}
        draggable={false}
        style={{
          width: size,
          height: size,
          transformOrigin: "bottom center",
          animation: config?.css || GESTURES.idle.css,
        }}
        className={`avo-mascot object-contain drop-shadow-sm select-none pointer-events-none ${className}`}
      />
    </>
  );
}
