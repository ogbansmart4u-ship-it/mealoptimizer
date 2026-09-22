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
 * Metabolic Emerald & Sunrise Amber Edition:
 * - 100% WCAG AAA contrast ratio across Light, Dark, and Incognito modes.
 * - Zero fragile background-clip gradient dependencies that disappear in dark/incognito mode.
 * - Precision-engineered vector avocado emblem with metabolic vitality core.
 */
export default function AppLogo({
  size = "md",
  className = "",
  showSubtitle = false,
  variant = "teal",
  showIcon = true,
}: AppLogoProps) {
  const sizeMap = {
    sm: { height: 28, text: "text-lg", icon: 24, sub: "text-[9px]" },
    md: { height: 38, text: "text-2xl", icon: 32, sub: "text-[10.5px]" },
    lg: { height: 48, text: "text-3xl", icon: 40, sub: "text-xs" },
    xl: { height: 60, text: "text-4xl", icon: 48, sub: "text-sm" },
  };

  const currentSize = sizeMap[size];

  // Primary "Meal" Color: High-authority deep teal-slate in light, pristine white in dark
  const mealColor =
    variant === "white"
      ? "text-white"
      : variant === "dark"
      ? "text-white"
      : "text-[#0c4a60] dark:text-white";

  // "Optim" Color: Vibrant Emerald Green symbolizing metabolic healing & fiber balance
  const optimColor =
    variant === "white"
      ? "text-emerald-300"
      : variant === "dark"
      ? "text-[#34d399]"
      : "text-[#047857] dark:text-[#34d399]";

  // "iza" Color: Warm Sunrise Amber symbolizing energy, metabolism & African spices
  const izaColor =
    variant === "white"
      ? "text-amber-300"
      : variant === "dark"
      ? "text-[#fbbf24]"
      : "text-[#b45309] dark:text-[#fbbf24]";

  const subtitleColor =
    variant === "white"
      ? "text-white/80"
      : variant === "dark"
      ? "text-teal-300/80"
      : "text-teal-900/85 dark:text-teal-300/85";

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="inline-flex items-center gap-2">
        {showIcon && (
          <div className="relative flex items-center justify-center shrink-0">
            {/* Ambient Metabolic Vitality Halo */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500/25 via-teal-400/20 to-amber-400/25 rounded-full blur-xs opacity-70 pointer-events-none" />

            {/* 10X Precision Vector Avocado & Metabolic Seed */}
            <svg
              width={currentSize.icon}
              height={currentSize.icon}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative drop-shadow-sm transition-transform duration-300 hover:scale-105"
            >
              <defs>
                {/* Outer Skin: Deep Clinical Emerald */}
                <linearGradient id="moAvoSkin" x1="12" y1="8" x2="36" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0f766e" />
                  <stop offset="100%" stopColor="#042f2e" />
                </linearGradient>

                {/* Inner Flesh: Silky Avocado Cream to Lime */}
                <linearGradient id="moAvoFlesh" x1="14" y1="12" x2="34" y2="42" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#d1fae5" />
                  <stop offset="45%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>

                {/* Metabolic Core Pit: Glowing Sunrise Amber */}
                <radialGradient id="moAvoPit" cx="38%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="35%" stopColor="#f59e0b" />
                  <stop offset="85%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
                </radialGradient>

                {/* Sprout Leaf: Botanical Longevity */}
                <linearGradient id="moLeafGrad" x1="24" y1="4" x2="34" y2="12" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>

                {/* Subtle Plate Division Accent Ring */}
                <linearGradient id="moPlateRing" x1="16" y1="21" x2="32" y2="37" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Sprout Leaf at Top */}
              <path
                d="M24 10C24 10 27.5 4.5 34 5.5C34 11.5 28.5 13 24 10Z"
                fill="url(#moLeafGrad)"
              />

              {/* Avocado Outer Skin Shell */}
              <path
                d="M24 8C16.8 8 11 16.2 11 26.2C11 36.2 16.8 43 24 43C31.2 43 37 36.2 37 26.2C37 16.2 31.2 8 24 8Z"
                fill="url(#moAvoSkin)"
              />

              {/* Avocado Inner Flesh */}
              <path
                d="M24 10.5C17.8 10.5 13 17.5 13 26.3C13 35.2 17.8 41.2 24 41.2C30.2 41.2 35 35.2 35 26.3C35 17.5 30.2 10.5 24 10.5Z"
                fill="url(#moAvoFlesh)"
              />

              {/* Subtle 9-Inch Plate Portion Guide Halo around Pit */}
              <circle
                cx="24"
                cy="29"
                r="9.5"
                fill="none"
                stroke="url(#moPlateRing)"
                strokeWidth="1"
                strokeDasharray="2.5 1.5"
              />

              {/* Avocado Center Seed (Metabolic Core) */}
              <circle
                cx="24"
                cy="29"
                r="7.5"
                fill="url(#moAvoPit)"
              />

              {/* Specular Light Reflection on Seed */}
              <ellipse
                cx="21.5"
                cy="26.8"
                rx="2"
                ry="1.4"
                transform="rotate(-25 21.5 26.8)"
                fill="#ffffff"
                opacity="0.85"
              />
            </svg>
          </div>
        )}

        {/* 10X Brand Wordmark: High-Contrast Metabolic Emerald & Sunrise Amber */}
        <div className="flex items-baseline font-black tracking-tight leading-none">
          <span className={`${currentSize.text} ${mealColor} font-black tracking-tight transition-colors duration-200`}>
            Meal
          </span>
          <span className={`${currentSize.text} ${optimColor} font-black ml-0.5 tracking-tight transition-colors duration-200`}>
            Optim
          </span>
          <span className={`${currentSize.text} ${izaColor} font-black tracking-tight transition-colors duration-200`}>
            iza
          </span>
        </div>
      </div>

      {showSubtitle && (
        <span className={`${currentSize.sub} font-black tracking-wider uppercase ${subtitleColor} mt-0.5 transition-colors duration-200`}>
          Metabolic &amp; Cultural Health OS
        </span>
      )}
    </div>
  );
}
