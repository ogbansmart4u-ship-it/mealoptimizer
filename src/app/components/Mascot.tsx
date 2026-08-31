import React, { useState } from "react";
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
}: MascotProps) {
  const { gesture: shared } = useMascot();
  const gesture = (override ?? shared ?? "idle").toLowerCase();
  const [videoError, setVideoError] = useState(false);

  const asset = GESTURE_ASSETS[gesture] || GESTURE_ASSETS.idle;

  // If video format fails or is unsupported on very old legacy browser, fallback gracefully to SVG Rig
  if (videoError) {
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

  return (
    <div
      className={`inline-block relative select-none pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
      aria-label={alt}
      role="img"
    >
      <video
        key={asset.webm}
        autoPlay
        loop
        muted
        playsInline
        onError={() => setVideoError(true)}
        className="w-full h-full object-contain drop-shadow-md transition-opacity duration-200"
        style={{ filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.12))" }}
      >
        <source src={asset.webm} type="video/webm" />
        <img
          src={asset.webp}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </video>
    </div>
  );
}
