import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import Mascot from './Mascot';
import { MascotGesture } from '../types/mascot';

export interface MascotNudgeAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'success';
}

export interface MascotNudgeProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  gesture?: MascotGesture;
  badge?: string;
  badgeColor?: 'teal' | 'amber' | 'emerald' | 'rose' | 'indigo';
  primaryAction?: MascotNudgeAction;
  secondaryAction?: MascotNudgeAction;
  autoCloseSec?: number;
}

const BADGE_STYLES = {
  teal: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
};

export default function MascotNudge({
  isOpen,
  onClose,
  title,
  message,
  gesture = 'waving',
  badge,
  badgeColor = 'teal',
  primaryAction,
  secondaryAction,
}: MascotNudgeProps) {
  const triggerHaptic = () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate?.(15);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-[380px] z-50 select-none"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-teal-100/80 dark:border-zinc-800 p-4 sm:p-5 shadow-[0_20px_50px_rgba(31,122,140,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1f7a8c] via-[#4ecdc4] to-[#f39c12]" />

            <button
              onClick={() => {
                triggerHaptic();
                onClose();
              }}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
              aria-label="Close reminder"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="relative flex-shrink-0 -mt-1">
                <div className="absolute inset-0 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-md" />
                <Mascot gesture={gesture} size={70} className="relative drop-shadow-md" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                {badge && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-1.5 ${BADGE_STYLES[badgeColor]}`}
                  >
                    <Sparkles size={10} />
                    {badge}
                  </span>
                )}

                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {title}
                </h4>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed line-clamp-3">
                  {message}
                </p>

                {(primaryAction || secondaryAction) && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {primaryAction && (
                      <button
                        onClick={async () => {
                          triggerHaptic();
                          await primaryAction.onClick();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#1f7a8c] to-[#2e98a8] hover:from-[#17606e] hover:to-[#227986] text-white rounded-xl text-xs font-semibold shadow-sm shadow-teal-700/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>{primaryAction.label}</span>
                        <ArrowRight size={12} />
                      </button>
                    )}

                    {secondaryAction && (
                      <button
                        onClick={async () => {
                          triggerHaptic();
                          await secondaryAction.onClick();
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
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
