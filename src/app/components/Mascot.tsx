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

import { useMascot } from "../hooks/useMascot";
import type { MascotGesture } from "../types/mascot";
import MascotVectorRig, { type MascotLookDirection } from "./MascotVectorRig";

interface MascotProps {
  /** Override the shared gesture for this instance. Omit to follow MascotContext. */
  gesture?: MascotGesture | string;
  /** Direction Avo looks with his eyes ('left', 'right', 'center', 'down', 'auto'). Default 'auto'. */
  lookDirection?: MascotLookDirection;
  /** Width/height in pixels. Default 96. */
  size?: number;
  className?: string;
  /** Accessible label. Defaults to decorative (aria-hidden). */
  alt?: string;
}

export default function Mascot({
  gesture: override,
  lookDirection = "auto",
  size = 96,
  className = "",
  alt,
}: MascotProps) {
  const { gesture: shared } = useMascot();
  const gesture = override ?? shared ?? "idle";

  return (
    <MascotVectorRig
      gesture={gesture}
      lookDirection={lookDirection}
      size={size}
      className={className}
      alt={alt}
    />
  );
}
