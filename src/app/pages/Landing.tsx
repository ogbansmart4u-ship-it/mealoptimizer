import { Link, useNavigate } from "react-router";
import {
  Utensils,
  TrendingUp,
  Heart,
  Leaf,
  Sparkles,
  Camera,
  MessageSquare,
  ShieldCheck,
  FileText,
  CheckCircle2,
  ChevronRight,
  Zap,
  Activity,
  ArrowRight,
  Flame,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 justify-center">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1f7a8c] to-[#4ecdc4] flex items-center justify-center shadow-md shadow-teal-900/10">
        <Leaf className="h-5 w-5 text-white" />
      </div>
      <span
        className="font-black text-2xl text-[#126778] tracking-tight"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        Meal<span className="text-[#38b2ac]">Optimiza</span>
      </span>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F8F8] via-[#FFFFFF] to-[#F3F8F8] flex flex-col text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Bar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <Wordmark />
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs font-bold text-[#126778] hover:text-[#0b3c47] px-3 py-1.5 rounded-full transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-xs font-black bg-[#126778] hover:bg-[#0e5260] text-white px-4 py-2 rounded-full shadow-sm shadow-teal-900/20 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-6 pb-12 max-w-md mx-auto w-full text-center">
        {/* Live Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] font-black uppercase tracking-wider mb-4 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Clinical African Metabolic AI</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
          Personalized Nutrition for <span className="text-[#126778]">African & Diaspora Health</span>
        </h1>

        <p className="text-sm text-slate-600 max-w-xs leading-relaxed mb-6">
          Balance swallows, carbs, and metabolic health without sacrificing the cultural foods you love.
        </p>

        {/* 🌟 IDEA 1: Interactive Floating Hero Card with Micro-Badges */}
        <div className="relative w-full max-w-xs mb-8">
          {/* Floating Badge 1: Top Right */}
          <motion.div
            animate={reduced ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -right-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-emerald-100 flex items-center gap-1.5 text-[11px] font-black text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>-35% Spike Shield</span>
          </motion.div>

          {/* Floating Badge 2: Bottom Left */}
          <motion.div
            animate={reduced ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-3 -left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-teal-100 flex items-center gap-1.5 text-[11px] font-black text-[#126778]"
          >
            <MessageSquare className="h-3.5 w-3.5 text-teal-500" />
            <span>WhatsApp Snap-to-Log</span>
          </motion.div>

          {/* Center Card Mockup */}
          <div className="bg-gradient-to-br from-[#126778] via-[#1f7a8c] to-[#38b2ac] text-white p-5 rounded-3xl shadow-xl text-left relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-black">AI Meal Scan</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950">
                GLYCEMIC SAFE
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-3 border border-white/15">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>Egusi Soup & Pounded Yam</span>
                <span className="text-teal-200">540 kcal</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-teal-100 font-semibold">
                <span>🌾 48g Carbs</span>
                <span>•</span>
                <span>🥩 26g Protein</span>
                <span>•</span>
                <span>🥗 High Fiber</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-teal-100">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                Palm Oil Bioavailability Optimized
              </span>
            </div>
          </div>
        </div>

        {/* 3-Step Quick Story */}
        <div className="w-full space-y-2.5 mb-8 text-left">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-teal-50 text-[#126778] rounded-xl font-black text-xs flex-shrink-0">
              01
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Snap or Voice-Log Your Meal</h4>
              <p className="text-[11px] text-slate-500">Camera food scanner or quick WhatsApp audio notes</p>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs flex-shrink-0">
              02
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Balances Glycemic Load</h4>
              <p className="text-[11px] text-slate-500">Smart portion advice for swallows, grains & soups</p>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl font-black text-xs flex-shrink-0">
              03
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Doctor-Ready Clinical Reports</h4>
              <p className="text-[11px] text-slate-500">1-Tap PDF export of your 30-day vitals & nutrition</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="w-full space-y-3">
          <Link
            to="/signup"
            className="block w-full bg-[#126778] hover:bg-[#0e5260] text-white rounded-2xl py-3.5 text-center font-black text-sm shadow-md shadow-teal-900/20 transition-all active:scale-98"
          >
            Create Free Account
          </Link>
          <Link
            to="/login"
            className="block w-full bg-white text-[#126778] border border-teal-200/80 rounded-2xl py-3.5 text-center font-bold text-sm hover:bg-teal-50/50 transition-all active:scale-98"
          >
            Sign In with Existing Account
          </Link>
        </div>

        {/* Security & Social Proof Footnote */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> HIPAA Encrypted
          </span>
          <span>•</span>
          <span>100+ African Dishes</span>
          <span>•</span>
          <span>Zero Guesswork</span>
        </div>
      </div>
    </div>
  );
}
