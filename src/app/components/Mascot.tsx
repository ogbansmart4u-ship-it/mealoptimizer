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
  /**
   * Background container style:
   * - "white": Crisp clean white background container (DEFAULT)
   * - "neutral": Soft warm neutral background container (stone-50)
   * - "none": Floating directly without a background container
   */
  backdrop?: "white" | "neutral" | "none";
  /** Shape of the background container: "circle" | "rounded" | "none". Default "circle" */
  shape?: "circle" | "rounded" | "none";
}

const GESTURE_ASSETS: Record<string, { webm: string; webp: string }> = {
  wave: { webm: "/assets/mascot/avo-wave.webm", webp: "/assets/mascot/avo-wave.webp" },
  waving: { webm: "/assets/mascot/avo-wave.webm", webp: "/assets/mascot/avo-wave.webp" },
  write: { webm: "/assets/mascot/avo-write.webm", webp: "/assets/mascot/avo-write.webp" },
  writing: { webm: "/assets/mascot/avo-write.webm", webp: "/assets/mascot/avo-write.webp" },
  notetaking: { webm: "/assets/mascot/avo-write.webm", webp: "/assets/mascot/avo-write.webp" },
  thumbsup: { webm: "/assets/mascot/avo-thumbsup.webm", webp: "/assets/mascot/avo-thumbsup.webp" },
  "thumbs-up": { webm: "/assets/mascot/avo-thumbsup.webm", webp: "/assets/mascot/avo-thumbsup.webp" },
  pointing: { webm: "/assets/mascot/avo-wave.webm", webp: "/assets/mascot/avo-wave.webp" },
  double_thumbsup: { webm: "/assets/mascot/avo-thumbsup.webm", webp: "/assets/mascot/avo-thumbsup.webp" },
  clap: { webm: "/assets/mascot/avo-clap.webm", webp: "/assets/mascot/avo-clap.apng" },
  clapping: { webm: "/assets/mascot/avo-clap.webm", webp: "/assets/mascot/avo-clap.apng" },
  jump: { webm: "/assets/mascot/avo-jump.webm", webp: "/assets/mascot/avo-jump.webp" },
  jumping: { webm: "/assets/mascot/avo-jump.webm", webp: "/assets/mascot/avo-jump.webp" },
  dancing: { webm: "/assets/mascot/avo-jump.webm", webp: "/assets/mascot/avo-jump.webp" },
  running: { webm: "/assets/mascot/avo-jump.webm", webp: "/assets/mascot/avo-jump.webp" },
  sad: { webm: "/assets/mascot/avo-sad.webm", webp: "/assets/mascot/avo-sad.webp" },
  concerned: { webm: "/assets/mascot/avo-sad.webm", webp: "/assets/mascot/avo-sad.webp" },
  scratching: { webm: "/assets/mascot/avo-sad.webm", webp: "/assets/mascot/avo-sad.webp" },
  drink: { webm: "/assets/mascot/avo-drink.webm", webp: "/assets/mascot/avo-drink.webp" },
  drinking: { webm: "/assets/mascot/avo-drink.webm", webp: "/assets/mascot/avo-drink.webp" },
  water: { webm: "/assets/mascot/avo-drink.webm", webp: "/assets/mascot/avo-drink.webp" },
  hydrate: { webm: "/assets/mascot/avo-drink.webm", webp: "/assets/mascot/avo-drink.webp" },
  hydration: { webm: "/assets/mascot/avo-drink.webm", webp: "/assets/mascot/avo-drink.webp" },
  sleep: { webm: "/assets/mascot/avo-sleep.webm", webp: "/assets/mascot/avo-sleep.apng" },
  sleeping: { webm: "/assets/mascot/avo-sleep.webm", webp: "/assets/mascot/avo-sleep.apng" },
  rest: { webm: "/assets/mascot/avo-sleep.webm", webp: "/assets/mascot/avo-sleep.apng" },
  resting: { webm: "/assets/mascot/avo-sleep.webm", webp: "/assets/mascot/avo-sleep.apng" },
  celebrate: { webm: "/assets/mascot/avo-celebrate.webm", webp: "/assets/mascot/avo-jump.webp" },
  celebrating: { webm: "/assets/mascot/avo-celebrate.webm", webp: "/assets/mascot/avo-jump.webp" },
  celebration: { webm: "/assets/mascot/avo-celebrate.webm", webp: "/assets/mascot/avo-jump.webp" },
  idle: { webm: "/assets/mascot/avo-idle.webm", webp: "/assets/mascot/avo-idle.webp" },
};

export default function Mascot({
  gesture: override,
  lookDirection = "auto",
  size = 96,
  className = "",
  alt = "Avo the Mascot",
  backdrop = "white",
  shape = "circle",
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
        backdrop={backdrop}
        shape={shape}
      />
    );
  }

  // Floating mascot without dedicated background container
  if (backdrop === "none") {
    return (
      <div
        className={`inline-block relative select-none pointer-events-none ${className}`}
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

  // Pure white or neutral background container with subtle border & gentle shadow
  const bgClasses =
    backdrop === "neutral"
      ? "bg-stone-50 dark:bg-zinc-800/90 border border-stone-200/80 dark:border-zinc-700 shadow-xs"
      : "bg-white dark:bg-zinc-800 border border-stone-200/90 dark:border-zinc-700 shadow-sm";

  const shapeClasses =
    shape === "rounded" ? "rounded-2xl" : shape === "circle" ? "rounded-full" : "";

  return (
    <div
      className={`inline-flex items-center justify-center relative select-none pointer-events-none p-1 shrink-0 ${bgClasses} ${shapeClasses} ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt}
      role="img"
    >
      <img
        src={asset.webp}
        alt={alt}
        className="w-[84%] h-[84%] object-contain transition-opacity duration-200"
        style={{ filter: "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.05))" }}
        onError={() => setImgError(true)}
      />
    </div>
  );
}
