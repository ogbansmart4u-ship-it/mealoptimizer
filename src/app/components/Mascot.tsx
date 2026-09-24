import React, { useState } from "react";
import { useMascot } from "../hooks/useMascot";
import type { MascotGesture } from "../types/mascot";
import MascotVectorRig, { type MascotLookDirection } from "./MascotVectorRig";

export interface MascotProps {
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

const MASCOT_VER = "v=transparent-20260925-v1";

const GESTURE_ASSETS: Record<string, { webm: string; webp: string }> = {
  wave: { webm: "/assets/mascot/avo-wave.webm", webp: `/assets/mascot/avo-wave.webp?${MASCOT_VER}` },
  waving: { webm: "/assets/mascot/avo-wave.webm", webp: `/assets/mascot/avo-wave.webp?${MASCOT_VER}` },
  write: { webm: "/assets/mascot/avo-write.webm", webp: `/assets/mascot/avo-write.webp?${MASCOT_VER}` },
  writing: { webm: "/assets/mascot/avo-write.webm", webp: `/assets/mascot/avo-write.webp?${MASCOT_VER}` },
  notetaking: { webm: "/assets/mascot/avo-write.webm", webp: `/assets/mascot/avo-write.webp?${MASCOT_VER}` },
  thumbsup: { webm: "/assets/mascot/avo-thumbsup.webm", webp: `/assets/mascot/avo-thumbsup.webp?${MASCOT_VER}` },
  "thumbs-up": { webm: "/assets/mascot/avo-thumbsup.webm", webp: `/assets/mascot/avo-thumbsup.webp?${MASCOT_VER}` },
  pointing: { webm: "/assets/mascot/avo-wave.webm", webp: `/assets/mascot/avo-wave.webp?${MASCOT_VER}` },
  double_thumbsup: { webm: "/assets/mascot/avo-thumbsup.webm", webp: `/assets/mascot/avo-thumbsup.webp?${MASCOT_VER}` },
  clap: { webm: "/assets/mascot/avo-clap.webm", webp: `/assets/mascot/avo-clap.apng?${MASCOT_VER}` },
  clapping: { webm: "/assets/mascot/avo-clap.webm", webp: `/assets/mascot/avo-clap.apng?${MASCOT_VER}` },
  jump: { webm: "/assets/mascot/avo-jump.webm", webp: `/assets/mascot/avo-jump.webp?${MASCOT_VER}` },
  jumping: { webm: "/assets/mascot/avo-jump.webm", webp: `/assets/mascot/avo-jump.webp?${MASCOT_VER}` },
  dancing: { webm: "/assets/mascot/avo-jump.webm", webp: `/assets/mascot/avo-jump.webp?${MASCOT_VER}` },
  running: { webm: "/assets/mascot/avo-jump.webm", webp: `/assets/mascot/avo-jump.webp?${MASCOT_VER}` },
  sad: { webm: "/assets/mascot/avo-sad.webm", webp: `/assets/mascot/avo-sad.webp?${MASCOT_VER}` },
  concerned: { webm: "/assets/mascot/avo-sad.webm", webp: `/assets/mascot/avo-sad.webp?${MASCOT_VER}` },
  scratching: { webm: "/assets/mascot/avo-sad.webm", webp: `/assets/mascot/avo-sad.webp?${MASCOT_VER}` },
  drink: { webm: "/assets/mascot/avo-drink.webm", webp: `/assets/mascot/avo-drink.webp?${MASCOT_VER}` },
  drinking: { webm: "/assets/mascot/avo-drink.webm", webp: `/assets/mascot/avo-drink.webp?${MASCOT_VER}` },
  water: { webm: "/assets/mascot/avo-drink.webm", webp: `/assets/mascot/avo-drink.webp?${MASCOT_VER}` },
  hydrate: { webm: "/assets/mascot/avo-drink.webm", webp: `/assets/mascot/avo-drink.webp?${MASCOT_VER}` },
  hydration: { webm: "/assets/mascot/avo-drink.webm", webp: `/assets/mascot/avo-drink.webp?${MASCOT_VER}` },
  sleep: { webm: "/assets/mascot/avo-sleep.webm", webp: `/assets/mascot/avo-sleep.apng?${MASCOT_VER}` },
  sleeping: { webm: "/assets/mascot/avo-sleep.webm", webp: `/assets/mascot/avo-sleep.apng?${MASCOT_VER}` },
  rest: { webm: "/assets/mascot/avo-sleep.webm", webp: `/assets/mascot/avo-sleep.apng?${MASCOT_VER}` },
  resting: { webm: "/assets/mascot/avo-sleep.webm", webp: `/assets/mascot/avo-sleep.apng?${MASCOT_VER}` },
  celebrate: { webm: "/assets/mascot/avo-celebrate.webm", webp: `/assets/mascot/avo-jump.webp?${MASCOT_VER}` },
  celebrating: { webm: "/assets/mascot/avo-celebrate.webm", webp: `/assets/mascot/avo-jump.webp?${MASCOT_VER}` },
  celebration: { webm: "/assets/mascot/avo-celebrate.webm", webp: `/assets/mascot/avo-jump.webp?${MASCOT_VER}` },
  idle: { webm: "/assets/mascot/avo-idle.webm", webp: `/assets/mascot/avo-idle.webp?${MASCOT_VER}` },
};

export default function Mascot({
  gesture: override,
  lookDirection = "auto",
  size = 96,
  className = "",
  alt = "Avo the Mascot",
}: MascotProps) {
  const { gesture: shared } = useMascot();
  const gesture = (override ?? shared ?? "idle").toLowerCase();
  const [imgError, setImgError] = useState(false);

  const asset = GESTURE_ASSETS[gesture] || GESTURE_ASSETS.idle;

  // Fallback to MascotVectorRig if image fails to load
  if (imgError) {
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

  // 100% transparent - assumes the background of its environment or where it is sitting
  return (
    <div
      className={`inline-block relative select-none pointer-events-none bg-transparent ${className}`}
      style={{ width: size, height: size * 1.15 }}
      aria-label={alt}
      role="img"
    >
      <img
        src={asset.webp}
        alt={alt}
        className="w-full h-full object-contain transition-opacity duration-200"
        style={{ filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.08))" }}
        onError={() => setImgError(true)}
      />
    </div>
  );
}
