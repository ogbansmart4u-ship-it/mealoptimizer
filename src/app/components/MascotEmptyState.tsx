import type { ReactNode } from "react";
import Mascot from "./Mascot";

interface MascotEmptyStateProps {
  title: string;
  subtitle?: string;
  /** Optional call-to-action button/element rendered under the text. */
  action?: ReactNode;
  /** Size for the mascot; defaults to md. */
  size?: "sm" | "md";
  gesture?: "wave" | "thumbs_up" | "writing" | "thinking" | "celebrate";
}

export default function MascotEmptyState({
  title,
  subtitle,
  action,
  size = "md",
  gesture = "wave",
}: MascotEmptyStateProps) {
  const pixelSize = size === "sm" ? 72 : 96;
  return (
    <div className="flex flex-col items-center justify-center text-center py-6 px-4">
      <div className="mb-3 transform hover:scale-105 transition-transform duration-300">
        <Mascot gesture={gesture} size={pixelSize} />
      </div>
      <h3 className="text-zinc-900 dark:text-zinc-100 font-extrabold text-sm sm:text-base mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
