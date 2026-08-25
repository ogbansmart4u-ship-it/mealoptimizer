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
    <div className="min-h-screen bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#090d16] text-slate-100 pb-28">
      {/* Top Header */}
      <div className="bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 pt-9 pb-5 border-b border-amber-500/20 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-amber-200 hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight flex items-center gap-2">
                <span>Fasting &amp; Autophagy</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {activeProtoConfig.label}
                </span>
              </h1>
              <p className="text-xs text-amber-200/80 font-medium">
                Metabolic Flexibility, Autophagy, &amp; Insulin Sensitivity Hub
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowProtocolModal(true)}
            className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold px-3 py-1.5 transition-all cursor-pointer"
          >
            Change Plan ⚙️
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 mt-5 space-y-5">
        {/* 🥑 10X Animated Avo Fasting Coach */}
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-[#1f7a8c]/80 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-amber-400/30 relative overflow-hidden flex items-center justify-between gap-4">
          <div className="relative z-10 flex items-center gap-3.5 min-w-0">
            <Mascot size={68} className="shrink-0 drop-shadow-lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full shadow-2xs">
                  Avo Fasting Coach
                </span>
                <span className="text-[10px] text-amber-200 font-bold hidden sm:inline">Active Metabolic Phase</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                {currentAutophagyStage.icon} {currentAutophagyStage.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-100/90 line-clamp-2 mt-0.5 font-medium leading-relaxed">
                "{currentAutophagyStage.desc}"
              </p>
            </div>
          </div>
        </div>

        {/* ⏳ 10X Live Circular Fasting Clock & Command Center */}
        <div className="bg-slate-900/90 rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
          {/* Radial Gradient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Current Protocol Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black mb-6 border border-amber-500/30 shadow-2xs">
            <Flame size={14} className="text-amber-400 animate-pulse" />
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
                stroke="#1e293b"
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
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                {currentSession ? formattedElapsed : "00:00:00"}
              </span>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest mt-1">
                {currentSession ? `${progressPercent.toFixed(0)}% Completed` : "Target: 16 Hours"}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                {currentSession ? formattedRemaining : "Ready to rejuvenate"}
              </span>
            </div>
          </div>

          {/* Fasting Start & End Schedule Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-xs text-left">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Fast Started</span>
              <span className="text-sm font-black text-white">
                {currentSession ? new Date(currentSession.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Target Finish</span>
              <span className="text-sm font-black text-emerald-400">{estimatedEndTime}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
            {currentSession ? (
              <>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-all cursor-pointer active:scale-95"
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                </button>
                <button
                  onClick={handleEndFast}
                  className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-[#1f7a8c] hover:opacity-95 text-white rounded-2xl py-3.5 px-5 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Break Fast &amp; Log Rejuvenation</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleStartFast(selectedProtocol)}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-slate-950 rounded-2xl py-4 font-black text-sm shadow-xl shadow-amber-950 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Flame size={18} />
                <span>Start {activeProtoConfig.label} Fast Now</span>
              </button>
            )}
          </div>
        </div>

        {/* 💧 Fasting Hydration Companion */}
        <div className="bg-slate-900/90 rounded-3xl border border-sky-500/30 p-5 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl">
              <Droplet size={22} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Fasting Hydration Tracker</h3>
              <p className="text-xs text-slate-400">
                Water &amp; herbal teas accelerate autophagy and blunt hunger pangs.
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 w-5 rounded-full ${i < waterCups ? "bg-sky-400 shadow-xs" : "bg-slate-800"}`}
                  />
                ))}
                <span className="text-[11px] font-bold text-sky-300 ml-2">
                  {waterCups * 250}ml / 2000ml
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddWater}
            className="p-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1 shadow-md"
          >
            <Plus size={14} />
            <span>+250ml</span>
          </button>
        </div>

        {/* 🧬 Interactive Autophagy & Cellular Stage Map */}
        <div className="bg-slate-900/90 rounded-3xl border border-amber-500/30 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Dna size={18} className="text-purple-400" />
                <span>The 5 Stages of Autophagy &amp; Fat Burn</span>
              </h3>
              <p className="text-xs text-slate-400">Tap any stage to reveal its cellular biochemistry</p>
            </div>
          </div>

          <div className="space-y-2.5">
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
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/40 shadow-xs"
                      : isUnlocked
                      ? "bg-slate-800/80 border-slate-700/80 text-white"
                      : "bg-slate-900/50 border-slate-800/60 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{stage.icon}</span>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-2">
                          <span>{stage.title}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-purple-500 text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                              YOU ARE HERE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-amber-300">
                          Starts at {stage.hours} Hours
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold">
                      {isUnlocked ? (
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                          <CheckCircle size={14} /> Unlocked
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Locked</span>
                      )}
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🌟 The Core Value of Intermittent Fasting (Why It Changes Lives) */}
        <div className="bg-slate-900/90 rounded-3xl border border-amber-500/30 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
            <Sparkles size={18} className="text-amber-400" />
            <span>Why Intermittent Fasting Works (Proven Science)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FASTING_BENEFITS.map((b, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${b.color} space-y-1`}>
                <div className="flex items-center gap-2 font-black text-xs text-white">
                  <span className="text-lg">{b.icon}</span>
                  <span>{b.title}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 🍲 African Cultural Fast-Breaking Protocol (Avoid The Glycemic Crash) */}
        <div className="bg-slate-900/90 rounded-3xl border border-teal-500/30 p-5 sm:p-6 shadow-xl space-y-3.5">
          <div className="flex items-center gap-2 text-teal-300 font-black text-sm">
            <ShieldCheck size={18} className="text-teal-400" />
            <span>African Fast-Breaking Guide (No Glycemic Shock)</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2.5 text-xs">
            <p className="text-slate-300 leading-relaxed font-medium">
              After a 16+ hour fast, insulin sensitivity is ultra-high. Breaking your fast abruptly with <strong>pounded yam, giant eba, or sweetened malt</strong> will cause an acute glucose spike followed by intense fatigue.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-[10px]">STEP 1</span>
                <div>
                  <strong className="text-white">Hydrate &amp; Warm Up (0 - 15 Mins):</strong>
                  <span className="text-slate-400 block text-[11px]">Light goat meat pepper soup, bone broth, or warm lemon water.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-[10px]">STEP 2</span>
                <div>
                  <strong className="text-white">Protein &amp; Fiber Cushion (15 - 30 Mins):</strong>
                  <span className="text-slate-400 block text-[11px]">Boiled eggs, sliced avocado, or steamed efo riro with mackerel.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-[10px]">STEP 3</span>
                <div>
                  <strong className="text-white">Main Cultural Meal:</strong>
                  <span className="text-slate-400 block text-[11px]">Moderate portions of beans, plantain, or brown rice paired with vegetable soup.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Selection Modal */}
      <Dialog open={showProtocolModal} onOpenChange={setShowProtocolModal}>
        <DialogContent className="max-w-md bg-slate-900 border border-amber-500/30 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-amber-300 flex items-center gap-2">
              <Flame size={18} />
              <span>Choose Fasting Protocol</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
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
                    ? "bg-amber-950/60 border-amber-400 text-white"
                    : "bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 text-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{proto.label}</span>
                    <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.2 rounded-full">
                      {proto.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-amber-200 mt-0.5">{proto.title}</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{proto.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
