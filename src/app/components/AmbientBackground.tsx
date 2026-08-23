import React from "react";

interface AmbientBackgroundProps {
  variant?: "teal" | "emerald" | "amber" | "indigo" | "mixed";
  className?: string;
}

export default function AmbientBackground({
  variant = "mixed",
  className = "",
}: AmbientBackgroundProps) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes floatOrb1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.55;
          }
          33% {
            transform: translate3d(40px, -35px, 0) scale(1.15);
            opacity: 0.8;
          }
          66% {
            transform: translate3d(-30px, 20px, 0) scale(0.92);
            opacity: 0.6;
          }
        }

        @keyframes floatOrb2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translate3d(-45px, 40px, 0) scale(0.9);
            opacity: 0.75;
          }
        }

        @keyframes floatOrb3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(0.95);
            opacity: 0.45;
          }
          50% {
            transform: translate3d(35px, -40px, 0) scale(1.18);
            opacity: 0.7;
          }
        }

        @keyframes floatOrb4 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.35;
          }
          50% {
            transform: translate3d(-30px, -30px, 0) scale(1.12);
            opacity: 0.65;
          }
        }

        .orb-animate-1 {
          animation: floatOrb1 14s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .orb-animate-2 {
          animation: floatOrb2 18s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .orb-animate-3 {
          animation: floatOrb3 16s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .orb-animate-4 {
          animation: floatOrb4 20s ease-in-out infinite;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Orb 1: Top-Left Vibrant Cyan/Teal Glow */}
      <div
        className="orb-animate-1 absolute -top-16 -left-16 w-80 sm:w-96 h-80 sm:h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.42) 0%, rgba(20, 184, 166, 0.18) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Orb 2: Top-Right Emerald Pulse */}
      <div
        className="orb-animate-2 absolute -top-12 -right-16 w-72 sm:w-88 h-72 sm:h-88 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.18) 50%, transparent 70%)",
          filter: "blur(45px)",
        }}
      />

      {/* Orb 3: Mid-Page Warm Amber/Golden Energy Bubble */}
      <div
        className="orb-animate-3 absolute top-1/2 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.32) 0%, rgba(234, 88, 12, 0.12) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Orb 4: Bottom-Left Deep Teal/Mint Glow */}
      <div
        className="orb-animate-4 absolute -bottom-16 -left-16 w-88 sm:w-[28rem] h-88 sm:h-[28rem] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.45) 0%, rgba(6, 182, 212, 0.2) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Subtle Mesh Grid Texture for High-End Glassmorphism Depth */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(#1f7a8c 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}
