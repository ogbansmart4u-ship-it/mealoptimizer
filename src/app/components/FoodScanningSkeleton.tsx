import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Leaf,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Activity,
  Cpu,
  Sparkles,
} from "lucide-react";
import { triggerHaptic } from "../utils/celebration";

interface FoodScanningSkeletonProps {
  imageSrc?: string | null;
  onAnalysisComplete?: () => void;
}

interface ScanPhase {
  id: number;
  icon: typeof Search;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  title: string;
  subtitle: string;
}

const SCAN_PHASES: ScanPhase[] = [
  {
    id: 1,
    icon: Search,
    color: "text-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50",
    badgeBorder: "border-amber-200 dark:border-amber-800/80",
    title: "🔍 Detecting Cassava & Grain Density...",
    subtitle: "Scanning starch granules, fufu/yam texture & glycemic base",
  },
  {
    id: 2,
    icon: Leaf,
    color: "text-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
    badgeBorder: "border-emerald-200 dark:border-emerald-800/80",
    title: "🌿 Analyzing Vegetable-to-Oil Ratio...",
    subtitle: "Calibrating palm oil saturation, leafy greens (Ugu/Ewedu) & sodium",
  },
  {
    id: 3,
    icon: ShieldCheck,
    color: "text-teal-500",
    badgeBg: "bg-teal-50 dark:bg-teal-950/50",
    badgeBorder: "border-teal-200 dark:border-teal-800/80",
    title: "🛡️ Calculating Glycemic Spike Impact...",
    subtitle: "Modeling postprandial glucose curve & ADA/EASD target window",
  },
  {
    id: 4,
    icon: Zap,
    color: "text-cyan-500",
    badgeBg: "bg-cyan-50 dark:bg-cyan-950/50",
    badgeBorder: "border-cyan-200 dark:border-cyan-800/80",
    title: "⚡ Synthesizing Metabolic Health Verdict...",
    subtitle: "Engineering cultural ingredient swaps & blood pressure balance",
  },
];

export default function FoodScanningSkeleton({
  imageSrc,
  onAnalysisComplete,
}: FoodScanningSkeletonProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<number[]>([]);

  // Sequential progression through the 4 biochemical scanning phases
  useEffect(() => {
    const timer1 = setTimeout(() => {
      triggerHaptic("light");
      setCompletedPhases((prev) => [...prev, 1]);
      setCurrentPhaseIndex(1);
    }, 1100);

    const timer2 = setTimeout(() => {
      triggerHaptic("light");
      setCompletedPhases((prev) => [...prev, 2]);
      setCurrentPhaseIndex(2);
    }, 2300);

    const timer3 = setTimeout(() => {
      triggerHaptic("medium");
      setCompletedPhases((prev) => [...prev, 3]);
      setCurrentPhaseIndex(3);
    }, 3500);

    const timer4 = setTimeout(() => {
      triggerHaptic("success");
      setCompletedPhases((prev) => [...prev, 4]);
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
    }, 4700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onAnalysisComplete]);

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 select-none overflow-hidden">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between w-full mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-[#1f7a8c] dark:text-teal-400">
            <Cpu className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
              AI Vision &amp; Biomarker Engine
            </span>
            <p className="text-[9.5px] text-gray-500 dark:text-zinc-400">
              Cultural Glycemic Intelligence • Version 4.2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-[#1f7a8c] dark:text-teal-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span>Scanning Active</span>
        </div>
      </div>

      {/* Scanned Image Container with Laser Sweep & Reticle */}
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-teal-400/80 bg-slate-950 aspect-[4/3] flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Scanned Food Plate"
            className="w-full h-full object-cover opacity-85 brightness-95"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex items-center justify-center">
            <Activity className="h-16 w-16 text-teal-500/30 animate-pulse" />
          </div>
        )}

        {/* Matrix Scanning Grid Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(#2dd4bf 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Corner Reticle Markers */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-teal-400 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-teal-400 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-teal-400 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-teal-400 rounded-br-lg pointer-events-none" />

        {/* Center Target Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full border border-teal-400/40 animate-ping" />
          <div className="w-8 h-8 rounded-full border border-teal-300/80 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
          </div>
        </div>

        {/* Glowing Laser Sweep Line */}
        <motion.div
          className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#2dd4bf] to-transparent shadow-[0_0_18px_#2dd4bf,0_0_30px_#14b8a6] pointer-events-none z-10"
          animate={{
            top: ["5%", "92%", "5%"],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating live detected food tag */}
        <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 py-1 bg-black/75 backdrop-blur-md text-white text-[11px] font-black rounded-full border border-teal-400/60 shadow-lg flex items-center gap-1.5"
          >
            <Sparkles size={12} className="text-teal-400 animate-spin" />
            <span>AI Multi-Spectral Food Isolation</span>
          </motion.div>
        </div>

        {/* Live Bottom Scanning Telemetry Bar */}
        <div className="absolute bottom-3 inset-x-3 bg-slate-900/85 backdrop-blur-md rounded-2xl p-2.5 border border-teal-500/40 text-white flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-mono text-teal-300">
            <Activity size={14} className="animate-pulse text-emerald-400" />
            <span>ANALYZING TEXTURE &amp; LIPIDS...</span>
          </div>
          <span className="text-[10px] font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded-full border border-teal-800">
            {Math.min(99, Math.floor(((currentPhaseIndex + 1) / 4) * 100))}%
          </span>
        </div>
      </div>

      {/* Sequential Biochemical Badges Feed */}
      <div className="w-full max-w-sm mt-4 space-y-2">
        {SCAN_PHASES.map((phase, idx) => {
          const isDone = completedPhases.includes(phase.id);
          const isCurrent = currentPhaseIndex === idx && !isDone;
          const isPending = idx > currentPhaseIndex;

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: isPending ? 0.4 : 1,
                x: 0,
                scale: isCurrent ? 1.01 : 1,
              }}
              transition={{ duration: 0.25 }}
              className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                isDone
                  ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                  : isCurrent
                  ? `${phase.badgeBg} ${phase.badgeBorder} shadow-sm ring-1 ring-teal-400/50`
                  : "bg-gray-50/60 dark:bg-zinc-900/40 border-gray-100 dark:border-zinc-800 opacity-40"
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  isDone
                    ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                    : isCurrent
                    ? "bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-300 shadow-xs"
                    : "bg-gray-200 dark:bg-zinc-800 text-gray-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : isCurrent ? (
                  <phase.icon className={`h-4 w-4 ${phase.color} animate-bounce`} />
                ) : (
                  <phase.icon className="h-4 w-4 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-xs font-bold truncate ${
                      isDone
                        ? "text-emerald-900 dark:text-emerald-200"
                        : isCurrent
                        ? "text-slate-900 dark:text-zinc-100"
                        : "text-gray-400"
                    }`}
                  >
                    {phase.title}
                  </h4>
                  {isDone && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                      Verified
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 animate-pulse uppercase shrink-0">
                      Processing...
                    </span>
                  )}
                </div>
                <p
                  className={`text-[10.5px] mt-0.5 leading-tight ${
                    isDone
                      ? "text-emerald-700/80 dark:text-emerald-400/80"
                      : isCurrent
                      ? "text-slate-600 dark:text-zinc-400 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {phase.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
