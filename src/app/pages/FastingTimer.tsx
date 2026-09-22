import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Clock,
  Play,
  Pause,
  StopCircle,
  Flame,
  TrendingDown,
  Droplet,
  Zap,
  Award,
  Calendar,
  Target,
  Activity,
  Info,
  CheckCircle,
  Sparkles,
  ChevronLeft,
  ShieldCheck,
  Heart,
  Brain,
  Dna,
  RefreshCw,
  Plus,
  Coffee,
  Soup,
  Check,
  ChevronRight,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useMascot } from "../hooks/useMascot";
import Mascot from "../components/Mascot";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

type FastingProtocol = "14:10" | "16:8" | "18:6" | "20:4" | "omad" | "circadian";

type FastingSession = {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number; // hours
  protocol: FastingProtocol;
  weight?: number;
  notes?: string;
  completed: boolean;
};

const FASTING_PROTOCOLS: Array<{
  value: FastingProtocol;
  label: string;
  fast: number;
  eat: number;
  title: string;
  desc: string;
  badge: string;
}> = [
  { value: "16:8", label: "16:8", fast: 16, eat: 8, title: "Lean Gains Standard", desc: "The gold standard for fat loss, autophagy, and stable blood sugar.", badge: "Most Popular 🌟" },
  { value: "14:10", label: "14:10", fast: 14, eat: 10, title: "Gentle Metabolic Rest", desc: "Perfect for beginners and busy work schedules.", badge: "Beginner Friendly 🌱" },
  { value: "18:6", label: "18:6", fast: 18, eat: 6, title: "Deep Fat Burn", desc: "Enhanced ketosis and cellular cleanup.", badge: "Accelerated ⚡" },
  { value: "20:4", label: "20:4", fast: 20, eat: 4, title: "The Warrior Window", desc: "Intense cellular regeneration and autophagy.", badge: "Advanced 🛡️" },
  { value: "circadian", label: "12:12", fast: 12, eat: 12, title: "Circadian Sync", desc: "Syncs with sunrise and sunset to rest digestion.", badge: "Everyday 🌅" },
];

const AUTOPHAGY_STAGES = [
  {
    hours: 4,
    title: "Blood Sugar Normalization",
    icon: "🩸",
    color: "#38bdf8",
    desc: "Digestion finishes. Blood glucose and circulating insulin begin dropping to baseline.",
  },
  {
    hours: 8,
    title: "Glycogen Depletion & Insulin Rest",
    icon: "📉",
    color: "#34d399",
    desc: "Liver glycogen stores deplete. Pancreatic beta-cells enter restorative resting mode.",
  },
  {
    hours: 12,
    title: "Ketosis & Fat-Burning Ignition",
    icon: "⚡",
    color: "#fbbf24",
    desc: "Body flips the metabolic switch to burn stored visceral fat for fuel.",
  },
  {
    hours: 16,
    title: "Autophagy (Cellular Cleanup)",
    icon: "🧬",
    color: "#a78bfa",
    desc: "Autophagy cleans out senescent, damaged cell proteins and rejuvenates mitochondria.",
  },
  {
    hours: 20,
    title: "Deep Cellular & Stem Cell Renewal",
    icon: "🌟",
    color: "#f472b6",
    desc: "Growth hormone surges by up to 2000% to preserve lean muscle and repair gut lining.",
  },
];

const FASTING_BENEFITS = [
  {
    title: "Reverses Insulin Resistance",
    desc: "Giving your pancreas 16 hours of rest restores insulin sensitivity and flattens post-meal glucose spikes.",
    icon: "🩸",
    color: "bg-teal-500/10 text-teal-300 border-teal-500/30",
  },
  {
    title: "Autophagy (Anti-Aging)",
    desc: "Your cells recycle damaged mitochondria and waste proteins, promoting longevity and tissue renewal.",
    icon: "🧬",
    color: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  {
    title: "Mental Clarity & Brain BDNF",
    desc: "Ketone production stimulates Brain-Derived Neurotrophic Factor (BDNF) for razor-sharp focus.",
    icon: "🧠",
    color: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  },
  {
    title: "Visceral Belly Fat Loss",
    desc: "Low insulin unlocks stubborn abdominal fat stores without sacrificing lean active muscle tissue.",
    icon: "🔥",
    color: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
];

export default function FastingTimer() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const mascot = useMascot();

  const [selectedProtocol, setSelectedProtocol] = useState<FastingProtocol>("16:8");
  const [selectedStageInfo, setSelectedStageInfo] = useState<number | null>(null);
  const [waterCups, setWaterCups] = useState(4);
  const journeyScrollRef = useRef<HTMLDivElement>(null);

  const scrollJourney = (dir: "left" | "right") => {
    triggerHaptic("light");
    if (journeyScrollRef.current) {
      journeyScrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
    }
  };

  // Active fast session state
  const [currentSession, setCurrentSession] = useState<FastingSession | null>(() => {
    try {
      const stored = localStorage.getItem("current-fasting-session");
      if (stored) return JSON.parse(stored);
      // Default to an active fast starting 13.5 hours ago for immediate lively demonstration
      const defaultStart = new Date(Date.now() - 13.5 * 3600 * 1000).toISOString();
      return {
        id: "demo-fast",
        startTime: defaultStart,
        duration: 0,
        protocol: "16:8",
        completed: false,
      };
    } catch {
      return null;
    }
  });

  const [elapsedHours, setElapsedHours] = useState(13.5);
  const [isPaused, setIsPaused] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Save active session
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem("current-fasting-session", JSON.stringify(currentSession));
    } else {
      localStorage.removeItem("current-fasting-session");
    }
  }, [currentSession]);

  // Live real-time tick
  useEffect(() => {
    if (!currentSession || isPaused) return;

    const tick = () => {
      const start = new Date(currentSession.startTime).getTime();
      const now = Date.now();
      const diffHours = Math.max(0, (now - start) / (1000 * 3600));
      setElapsedHours(diffHours);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [currentSession, isPaused]);

  const activeProtoConfig = useMemo(() => {
    return FASTING_PROTOCOLS.find((p) => p.value === (currentSession?.protocol || selectedProtocol)) || FASTING_PROTOCOLS[0];
  }, [currentSession, selectedProtocol]);

  const targetHours = activeProtoConfig.fast;
  const progressPercent = Math.min(100, Math.max(0, (elapsedHours / targetHours) * 100));
  const remainingHours = Math.max(0, targetHours - elapsedHours);

  const formattedElapsed = useMemo(() => {
    const totalSecs = Math.floor(elapsedHours * 3600);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [elapsedHours]);

  const formattedRemaining = useMemo(() => {
    const totalSecs = Math.floor(remainingHours * 3600);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    return `${h}h ${m}m remaining`;
  }, [remainingHours]);

  const estimatedEndTime = useMemo(() => {
    if (!currentSession) return "Tap Start to Begin";
    const start = new Date(currentSession.startTime).getTime();
    const end = new Date(start + targetHours * 3600 * 1000);
    return end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [currentSession, targetHours]);

  const currentAutophagyStage = useMemo(() => {
    if (elapsedHours >= 20) return AUTOPHAGY_STAGES[4];
    if (elapsedHours >= 16) return AUTOPHAGY_STAGES[3];
    if (elapsedHours >= 12) return AUTOPHAGY_STAGES[2];
    if (elapsedHours >= 8) return AUTOPHAGY_STAGES[1];
    return AUTOPHAGY_STAGES[0];
  }, [elapsedHours]);

  // Handlers
  const handleStartFast = (proto: FastingProtocol = selectedProtocol) => {
    triggerHaptic("success");
    mascot.write();
    const newSession: FastingSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      duration: 0,
      protocol: proto,
      completed: false,
    };
    setCurrentSession(newSession);
    setElapsedHours(0);
    setIsPaused(false);
    setShowProtocolModal(false);
    toast.success(`Started ${proto} Intermittent Fast! ⏳`);
  };

  const handleEndFast = () => {
    triggerHaptic("milestone");
    triggerConfetti("cannons");
    mascot.jump();
    toast.success(`🎉 Fast Complete! You completed ${elapsedHours.toFixed(1)} hours of metabolic rejuvenation!`);
    setCurrentSession(null);
    setElapsedHours(0);
  };

  const handleAddWater = () => {
    triggerHaptic("light");
    setWaterCups((prev) => prev + 1);
    toast.success("Hydration logged! +250ml 💧");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1412] text-stone-900 dark:text-stone-100 pb-28 transition-colors">
      {/* Top Header */}
      <div className="bg-[#FAF8F5]/90 dark:bg-[#0F1412]/90 backdrop-blur-md px-4 sm:px-6 pt-9 pb-5 border-b border-stone-200/80 dark:border-stone-800 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/health")}
              className="text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full p-2 transition-colors cursor-pointer"
              aria-label="Back to Health"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white leading-tight flex items-center gap-2">
                <span>Fasting &amp; Autophagy</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/80">
                  {activeProtoConfig.label}
                </span>
              </h1>
              <p className="text-xs text-[#164E3D] dark:text-emerald-400 font-semibold">
                Metabolic Flexibility, Autophagy, &amp; Insulin Sensitivity Hub
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProtocolModal(true)}
            className="bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold px-3.5 py-1.5 transition-all cursor-pointer shadow-2xs"
          >
            Change Plan ⚙️
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-5 space-y-5">
        {/* 🥑 10X Animated Avo Fasting Coach */}
        <div className="bg-gradient-to-r from-amber-950/90 via-stone-900 to-[#164E3D]/90 rounded-3xl p-5 text-white shadow-xl border border-amber-400/30 relative overflow-hidden flex items-center justify-between gap-4">
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0">
              <Mascot size={64} className="drop-shadow-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                  Avo Fasting Coach
                </span>
                <span className="text-xs text-amber-200 font-bold hidden sm:inline">Active Metabolic Phase</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                {currentAutophagyStage.icon} {currentAutophagyStage.title}
              </h3>
              <p className="text-xs text-amber-100/90 line-clamp-2 mt-1 font-medium leading-relaxed">
                "{currentAutophagyStage.desc}"
              </p>
            </div>
          </div>
        </div>

        {/* ⏳ 10X Live Circular Fasting Clock & Command Center */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
          {/* Current Protocol Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-extrabold mb-6 border border-amber-200 dark:border-amber-800/80 shadow-2xs">
            <Flame size={14} className="text-amber-500 animate-pulse" />
            <span>{currentSession ? `Fasting Active • ${activeProtoConfig.label}` : "Fasting Clock Idle"}</span>
          </div>

          {/* Circular Gauge Ring */}
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 mx-auto mb-6 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full">
              {/* Background Track */}
              <circle
                cx="50%"
                cy="50%"
                r="105"
                stroke="#e7e5e4"
                dark-stroke="#292524"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress Ring */}
              <circle
                cx="50%"
                cy="50%"
                r="105"
                stroke="url(#fastingGrad)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${(progressPercent / 100) * 659.73} 659.73`}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="fastingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Ring Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight font-mono">
                {currentSession ? formattedElapsed : "00:00:00"}
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mt-1">
                {currentSession ? `${progressPercent.toFixed(0)}% Completed` : "Target: 16 Hours"}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {currentSession ? formattedRemaining : "Ready to rejuvenate"}
              </span>
            </div>
          </div>

          {/* Fasting Start & End Schedule Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6 bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl p-3.5 text-xs text-left">
            <div>
              <span className="text-stone-500 dark:text-stone-400 block text-xs uppercase tracking-wider font-bold">Fast Started</span>
              <span className="text-sm font-black text-stone-900 dark:text-white">
                {currentSession ? new Date(currentSession.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400 block text-xs uppercase tracking-wider font-bold">Target Finish</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{estimatedEndTime}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
            {currentSession ? (
              <>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
                <button
                  onClick={handleEndFast}
                  className="flex-1 bg-[#164E3D] hover:bg-[#123E31] text-white rounded-2xl py-3.5 px-5 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Break Fast &amp; Log Rejuvenation</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStartFast(selectedProtocol)}
                className="w-full bg-[#164E3D] hover:bg-[#123E31] text-white rounded-2xl py-3.5 font-bold text-sm shadow-md transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Flame size={18} />
                <span>Start {activeProtoConfig.label} Fast Now</span>
              </button>
            )}
          </div>
        </div>

        {/* 💧 Fasting Hydration Companion */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-200 dark:border-sky-800/60">
              <Droplet size={22} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900 dark:text-white">Fasting Hydration Tracker</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Water &amp; herbal teas accelerate autophagy and blunt hunger pangs.
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-5 rounded-full ${i < waterCups ? "bg-sky-500 shadow-xs" : "bg-stone-200 dark:bg-stone-800"}`}
                  />
                ))}
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 ml-2">
                  {waterCups * 250}ml / 2000ml
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddWater}
            className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1 shadow-xs"
          >
            <Plus size={14} />
            <span>+250ml</span>
          </button>
        </div>

        {/* 🧬 Interactive Autophagy & Cellular Stage Map (Horizontal Journey Timeline) */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <Dna size={18} className="text-purple-600 dark:text-purple-400" />
                <span>The 5 Stages of Autophagy &amp; Fat Burn</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Slide timeline • Tap to preview cellular transformations</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollJourney("left")}
                className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-700 active:scale-95"
                title="Slide left"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => scrollJourney("right")}
                className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer border border-stone-200/80 dark:border-stone-700 active:scale-95"
                title="Slide right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Timeline Connector Steps */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 overflow-x-auto select-none border-b border-stone-100 dark:border-stone-800/80 text-xs">
            {AUTOPHAGY_STAGES.map((stg, i) => {
              const isUnlocked = elapsedHours >= stg.hours;
              const isCurrent = currentAutophagyStage.hours === stg.hours;
              return (
                <div key={i} className="flex items-center gap-1.5 flex-1 min-w-[70px]">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? "bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-2 dark:ring-offset-stone-900 shadow-md animate-pulse"
                      : isUnlocked
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-200 dark:bg-stone-800 text-stone-500"
                  }`}>
                    {isUnlocked && !isCurrent ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-bold truncate ${
                    isCurrent ? "text-purple-600 dark:text-purple-400" : isUnlocked ? "text-emerald-700 dark:text-emerald-400" : "text-stone-400"
                  }`}>
                    {stg.hours}h
                  </span>
                  {i < AUTOPHAGY_STAGES.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 ${isUnlocked ? "bg-emerald-500/80" : "bg-stone-200 dark:bg-stone-800"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Horizontal Snap Cards */}
          <div
            ref={journeyScrollRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2.5 pt-1 px-1 custom-scrollbar-x -mx-1 sm:mx-0 scroll-smooth select-none"
          >
            {AUTOPHAGY_STAGES.map((stage, i) => {
              const isUnlocked = elapsedHours >= stage.hours;
              const isCurrent = currentAutophagyStage.hours === stage.hours;
              return (
                <div
                  key={i}
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedStageInfo(selectedStageInfo === i ? null : i);
                  }}
                  className={`snap-start min-w-[240px] sm:min-w-[270px] flex-shrink-0 p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? "bg-purple-50/90 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 ring-2 ring-purple-500/50 shadow-md"
                      : isUnlocked
                      ? "bg-stone-50 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700/80 text-stone-900 dark:text-white"
                      : "bg-stone-50/50 dark:bg-stone-900/50 border-stone-200/50 dark:border-stone-800/60 opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1.5 bg-white dark:bg-stone-800 rounded-xl shadow-2xs">{stage.icon}</span>
                        <div>
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                            Milestone {stage.hours}h
                          </span>
                          <span className="text-xs font-black text-stone-900 dark:text-white block line-clamp-1">
                            {stage.title}
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-xs bg-purple-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse shadow-2xs shrink-0">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-white/80 dark:bg-stone-950/50 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800/80 font-medium">
                      {stage.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 text-xs font-bold">
                    {isUnlocked ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={13} /> Unlocked
                      </span>
                    ) : (
                      <span className="text-stone-400 flex items-center gap-1">
                        Locked (in {Math.max(0, Math.round(stage.hours - elapsedHours))}h)
                      </span>
                    )}
                    <span className="text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                      Stage {i + 1} of 5
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🌟 The Core Value of Intermittent Fasting */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 dark:text-white font-extrabold text-sm">
            <Sparkles size={18} className="text-amber-500" />
            <span>Why Intermittent Fasting Works (Proven Science)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FASTING_BENEFITS.map((b, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${b.color} space-y-1`}>
                <div className="flex items-center gap-2 font-bold text-xs text-stone-900 dark:text-white">
                  <span className="text-lg">{b.icon}</span>
                  <span>{b.title}</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🍲 African Cultural Fast-Breaking Protocol */}
        <div className="bg-white dark:bg-stone-900/90 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 text-stone-900 dark:text-white font-extrabold text-sm">
            <div className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
              <ShieldCheck size={18} />
            </div>
            <span>African Fast-Breaking Guide (No Glycemic Shock)</span>
          </div>

          <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl p-4 space-y-2.5 text-xs">
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
              After a 16+ hour fast, insulin sensitivity is ultra-high. Breaking your fast abruptly with <strong>pounded yam, giant eba, or sweetened malt</strong> will cause an acute glucose spike followed by intense fatigue.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs">STEP 1</span>
                <div>
                  <strong className="text-stone-900 dark:text-white">Hydrate &amp; Warm Up (0 - 15 Mins):</strong>
                  <span className="text-stone-500 dark:text-stone-400 block text-xs mt-0.5">Light goat meat pepper soup, bone broth, or warm lemon water.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs">STEP 2</span>
                <div>
                  <strong className="text-stone-900 dark:text-white">Protein &amp; Fiber Cushion (15 - 30 Mins):</strong>
                  <span className="text-stone-500 dark:text-stone-400 block text-xs mt-0.5">Boiled eggs, sliced avocado, or steamed efo riro with mackerel.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs">STEP 3</span>
                <div>
                  <strong className="text-stone-900 dark:text-white">Main Cultural Meal:</strong>
                  <span className="text-stone-500 dark:text-stone-400 block text-xs mt-0.5">Moderate portions of beans, plantain, or brown rice paired with vegetable soup.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Selection Modal */}
      <Dialog open={showProtocolModal} onOpenChange={setShowProtocolModal}>
        <DialogContent className="max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Flame size={18} className="text-amber-500" />
              <span>Choose Fasting Protocol</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
              Select the fasting window tailored to your daily lifestyle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 mt-3">
            {FASTING_PROTOCOLS.map((proto) => (
              <button
                key={proto.value}
                onClick={() => {
                  setSelectedProtocol(proto.value);
                  handleStartFast(proto.value);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedProtocol === proto.value
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-stone-900 dark:text-white shadow-2xs"
                    : "bg-stone-50 dark:bg-stone-800/80 border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 dark:text-white">{proto.label}</span>
                    <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      {proto.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-400 mt-0.5">{proto.title}</div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{proto.desc}</p>
                </div>
                <ChevronRight size={16} className="text-stone-400 shrink-0" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
