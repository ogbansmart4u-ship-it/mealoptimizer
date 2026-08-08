// MascotEmptyState — friendly empty-state block featuring the "Avo" mascot.
// Reusable across screens that have nothing to show yet (no meals logged,
// no medications, etc.). Self-contained; uses a plain <img> for the asset.

import type { ReactNode } from "react";

interface MascotEmptyStateProps {
  title: string;
  subtitle?: string;
  /** Optional call-to-action button/element rendered under the text. */
  action?: ReactNode;
  /** Tailwind size for the mascot; defaults to a compact 28 (7rem). */
  size?: "sm" | "md";
}

export default function MascotEmptyState({
  title,
  subtitle,
  action,
  size = "md",
}: MascotEmptyStateProps) {
  const imgSize = size === "sm" ? "w-24 h-24" : "w-32 h-32";
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <img
        src="/assets/mascot-avo.png"
        alt="MealOptimiza mascot"
        className={`${imgSize} object-contain drop-shadow-sm mb-4`}
        loading="lazy"
        decoding="async"
      />
      <h3 className="text-gray-800 font-semibold mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-600 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
