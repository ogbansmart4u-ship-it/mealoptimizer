import React from "react";
import type { MascotGesture } from "../types/mascot";

export type MascotLookDirection = "left" | "right" | "center" | "down" | "auto";

interface MascotVectorRigProps {
  gesture?: MascotGesture | string;
  lookDirection?: MascotLookDirection;
  size?: number;
  className?: string;
  alt?: string;
}

export default function MascotVectorRig({
  gesture = "idle",
  lookDirection = "auto",
  size = 96,
  className = "",
  alt = "Avo the Mascot",
}: MascotVectorRigProps) {
  const g = (gesture || "idle").toLowerCase();

  const isWaving = g === "waving" || g === "wave";
  const isWriting = g === "writing" || g === "write" || g === "notetaking";
  const isJumping = g === "jumping" || g === "jump" || g === "dancing";
  const isSad = g === "sad" || g === "concerned" || g === "scratching";
  const isClapping = g === "clapping" || g === "clap" || g === "double_thumbsup";
  const isSleeping = g === "sleeping" || g === "sleep" || g === "rest";

  let animClass = "animate-bounce";
  let imgSrc = "/assets/mascot/avo-wave.webp";
  if (isWriting) {
    animClass = "animate-pulse";
    imgSrc = "/assets/mascot/avo-write.webp";
  } else if (isClapping) {
    animClass = "animate-pulse";
    imgSrc = "/assets/mascot/avo-clap.apng";
  } else if (isSleeping) {
    animClass = "opacity-90";
    imgSrc = "/assets/mascot/avo-sleep.apng";
  } else if (isJumping) {
    imgSrc = "/assets/mascot/avo-jump.webp";
  } else if (isSad) {
    imgSrc = "/assets/mascot/avo-sad.webp";
  }

  return (
    <div
      className={`inline-block relative select-none pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
      aria-label={alt}
      role="img"
    >
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-contain drop-shadow-md ${animClass}`}
        onError={(e) => {
          // Fallback to official 3D avatar if webp not present
          (e.target as HTMLImageElement).src = "/assets/mascot/avo-avatar.jpg";
        }}
      />
    </div>
  );
}
