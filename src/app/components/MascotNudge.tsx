import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Sparkles, Droplets } from "lucide-react";
import Mascot from "./Mascot";
import { MascotGesture } from "../types/mascot";
import { triggerHaptic } from "../utils/celebration";

export interface MascotNudgeAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "success";
}

export interface MascotNudgeProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  gesture?: MascotGesture;
  badge?: string;
  badgeColor?: "teal" | "amber" | "emerald" | "rose" | "indigo";
  primaryAction?: MascotNudgeAction;
  secondaryAction?: MascotNudgeAction;
  autoCloseSec?: number;
}

const BADGE_STYLES = {
  teal: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
};

export default function MascotNudge({
  isOpen,
  onClose,
  title,
  message,
  gesture = "wave",
  badge,
  badgeColor = "teal",
  primaryAction,
  secondaryAction,
  autoCloseSec = 9,
}: MascotNudgeProps) {
  // Auto-dismiss after autoCloseSec seconds if not interacted with
  useEffect(() => {
    if (!isOpen || autoCloseSec <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseSec * 1000);
    return () => clearTimeout(timer);
  }, [isOpen, autoCloseSec, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-[380px] z-50 select-none pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-teal-100 dark:border-zinc-800 p-4 sm:p-5 shadow-[0_16px_40px_rgba(31,122,140,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1f7a8c] via-[#4ecdc4] to-[#f39c12]" />

            {/* Close button */}
            <button
              onClick={() => {
                triggerHaptic("light");
                onClose();
              }}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              aria-label="Close reminder"
            >
              <X size={15} />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="relative flex-shrink-0 -mt-1">
                <div className="absolute inset-0 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-md" />
                <Mascot gesture={gesture} size={64} className="relative drop-shadow-md" />
              </div>

              <div className="flex-1 min-w-0 pr-3">
                {badge && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mb-1.5 ${BADGE_STYLES[badgeColor]}`}
                  >
                    <Sparkles size={10} />
                    <span>{badge}</span>
                  </span>
                )}

                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {title}
                </h4>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed line-clamp-3">
                  {message}
                </p>

                {/* Action Buttons */}
                {(primaryAction || secondaryAction) && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {primaryAction && (
                      <button
                        onClick={async () => {
                          triggerHaptic("medium");
                          await primaryAction.onClick();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] hover:from-[#176270] hover:to-[#227f74] text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{primaryAction.label}</span>
                        <ArrowRight size={12} />
                      </button>
                    )}

                    {secondaryAction && (
                      <button
                        onClick={async () => {
                          triggerHaptic("light");
                          await secondaryAction.onClick();
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                      >
                        {secondaryAction.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
