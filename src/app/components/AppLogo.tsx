import React from "react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showSubtitle?: boolean;
  variant?: "teal" | "white" | "dark";
  showIcon?: boolean;
}

/**
 * 10X Modern Vector Brand Logo for MealOptimiza
 * 100% Transparent background, pixel-perfect crisp SVG typography & Avocado/Metabolic icon.
 */
export default function AppLogo({
  size = "md",
  className = "",
  showSubtitle = false,
  variant = "teal",
  showIcon = true,
}: AppLogoProps) {
  const sizeMap = {
    sm: { height: 28, text: "text-lg", icon: 22, sub: "text-[9px]" },
    md: { height: 38, text: "text-2xl", icon: 30, sub: "text-[10.5px]" },
    lg: { height: 48, text: "text-3xl", icon: 38, sub: "text-xs" },
    xl: { height: 60, text: "text-4xl", icon: 46, sub: "text-sm" },
  };

  const currentSize = sizeMap[size];

  const primaryTextColor =
    variant === "white"
      ? "text-white"
      : variant === "dark"
      ? "text-slate-900 dark:text-white"
      : "text-[#1f7a8c]";

  const accentTextColor =
    variant === "white"
      ? "text-teal-200"
      : "bg-gradient-to-r from-[#0d9488] via-[#14b8a6] to-[#f59e0b] bg-clip-text text-transparent";

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="inline-flex items-center gap-2">
        {showIcon && (
          <div className="relative flex items-center justify-center shrink-0">
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xs opacity-40 pointer-events-none" />
            
            {/* Modern Avocado / Leaf Emblem (Transparent SVG) */}
            <svg
              width={currentSize.icon}
              height={currentSize.icon}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative drop-shadow-sm transition-transform hover:scale-105"
            >
              <defs>
                <linearGradient id="avoSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#115E59" />
                  <stop offset="100%" stopColor="#042F2E" />
                </linearGradient>
                <linearGradient id="avoFlesh" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A7F3D0" />
                  <stop offset="50%" stopColor="#6EE7B7" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id="avoPit" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Little Sprout Leaf at Top */}
              <path
                d="M24 10C24 10 27 5 33 6C33 12 28 13 24 10Z"
                fill="url(#leafGrad)"
              />

              {/* Avocado Outer Skin */}
              <path
                d="M24 8C17 8 11 16 11 26C11 36 16.8 43 24 43C31.2 43 37 36 37 26C37 16 31 8 24 8Z"
                fill="url(#avoSkin)"
              />

              {/* Avocado Inner Flesh */}
              <path
                d="M24 10.5C18 10.5 13 17.5 13 26.5C13 35.5 17.9 41.5 24 41.5C30.1 41.5 35 35.5 35 26.5C35 17.5 30 10.5 24 10.5Z"
                fill="url(#avoFlesh)"
              />

              {/* Avocado Center Seed (Metabolic Core) */}
              <circle
                cx="24"
                cy="29"
                r="7.5"
                fill="url(#avoPit)"
              />
              
              {/* Seed Specular Highlight */}
              <circle
                cx="22"
                cy="27"
                r="2"
                fill="#FEF3C7"
                opacity="0.8"
              />
            </svg>
          </div>
        )}

        {/* Brand Wordmark */}
        <div className="flex items-baseline font-black tracking-tight">
          <span className={`${currentSize.text} ${primaryTextColor} tracking-tight`}>
            Meal
          </span>
          <span className={`${currentSize.text} ${accentTextColor} ml-0.5 tracking-tight`}>
            Optimiza
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className={`${currentSize.sub} font-black tracking-wider uppercase text-teal-800/80 mt-0.5`}>
          Metabolic &amp; Cultural Health OS
        </span>
      )}
    </div>
  );
}
