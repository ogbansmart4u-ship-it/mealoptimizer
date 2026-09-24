import React from "react";
import type { MascotGesture } from "../types/mascot";

export type MascotLookDirection = "left" | "right" | "center" | "down" | "auto";

interface MascotVectorRigProps {
  gesture?: MascotGesture | string;
  lookDirection?: MascotLookDirection;
  size?: number;
  className?: string;
  alt?: string;
  backdrop?: "white" | "neutral" | "none";
  shape?: "circle" | "rounded" | "none";
}

export default function MascotVectorRig({
  gesture = "idle",
  lookDirection = "auto",
  size = 96,
  className = "",
  alt = "Avo the Mascot",
  backdrop = "white",
  shape = "circle",
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

  if (backdrop === "none") {
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
            (e.target as HTMLImageElement).src = "/assets/mascot/avo-avatar.jpg";
          }}
        />
      </div>
    );
  }

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
        src={imgSrc}
        alt={alt}
        className={`w-[84%] h-[84%] object-contain drop-shadow-md ${animClass}`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/assets/mascot/avo-avatar.jpg";
        }}
      />
    </div>
  );
}
