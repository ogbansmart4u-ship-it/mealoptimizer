import { useState } from "react";
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
  Check,
  CreditCard,
  Lock,
  Mail,
  HelpCircle,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import AppLogo from "../components/AppLogo";
import Mascot from "../components/Mascot";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic } from "../utils/celebration";

export default function Landing() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [mascotGesture, setMascotGesture] = useState<"wave" | "celebrate" | "thumbsup">("wave");

  const handleMascotTap = () => {
    triggerHaptic("medium");
    try { soundEffects.playBubblePop(); } catch {}
    setMascotGesture((prev) => (prev === "wave" ? "thumbsup" : prev === "thumbsup" ? "celebrate" : "wave"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F8F8] via-[#FFFFFF] to-[#F3F8F8] flex flex-col text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center">
          <AppLogo size="sm" showSubtitle={true} />
        </Link>
        
        {/* Desktop Quick Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600">
          <a href="#features" className="hover:text-[#164E3D] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#164E3D] transition-colors">Pricing &amp; Plans</a>
          <Link to="/calculators" className="hover:text-[#164E3D] transition-colors">Health Calculators</Link>
          <Link to="/clinician-portal" className="hover:text-[#164E3D] transition-colors">Doctor Portal</Link>
        </div>

        <div className="flex items-center gap-3">
          {user?.id ? (
            <Link
              to="/home"
              className="text-xs font-black bg-[#164E3D] hover:bg-[#113E30] text-white px-4 py-2 rounded-full shadow-sm shadow-emerald-950/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowRight size={13} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-[#164E3D] hover:text-[#113E30] px-3 py-1.5 rounded-full transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-xs font-black bg-[#164E3D] hover:bg-[#113E30] text-white px-4 py-2 rounded-full shadow-sm shadow-emerald-950/20 transition-all active:scale-95"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-6 pb-14 max-w-xl mx-auto w-full text-center">
        {/* Live Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#164E3D] text-[11px] font-black uppercase tracking-wider mb-4 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Clinical African Metabolic AI</span>
        </div>

        {/* 🥑 Official Avo Mascot Welcome */}
        <div
          onClick={handleMascotTap}
          className="flex items-center justify-center gap-3 mb-5 cursor-pointer group select-none active:scale-95 transition-transform"
          title="Tap Avo to say hi!"
        >
          <div className="relative">
            <Mascot gesture={mascotGesture} size={88} className="drop-shadow-md group-hover:scale-105 transition-transform" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
          <div className="text-left bg-white/95 backdrop-blur-sm border border-emerald-200/80 shadow-xs px-3.5 py-2 rounded-2xl group-hover:border-emerald-500 transition-colors">
            <div className="text-xs font-black text-[#164E3D] flex items-center gap-1">
              <span>Meet Avo</span>
              <Sparkles size={12} className="text-amber-500" />
            </div>
            <div className="text-[11px] text-stone-600 font-medium">Your African Nutrition Coach <span className="text-emerald-700 font-semibold">(Tap me!)</span></div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
          Personalized Nutrition for <span className="text-[#164E3D]">African &amp; Diaspora Health</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-md leading-relaxed mb-6">
          Optimize swallows, rice, and traditional stews for healthy blood sugar, weight, and blood pressure — with zero guilt and zero guesswork.
        </p>

        {/* 🌟 Interactive Floating Hero Card with Micro-Badges */}
        <div className="relative w-full max-w-sm mb-8">
          {/* Floating Badge 1: Top Right */}
          <motion.div
            animate={reduced ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -right-2 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-emerald-100 flex items-center gap-1.5 text-[11px] font-black text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>-35% Glucose Spike Shield</span>
          </motion.div>

          {/* Floating Badge 2: Bottom Left */}
          <motion.div
            animate={reduced ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-3 -left-2 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-teal-100 flex items-center gap-1.5 text-[11px] font-black text-[#164E3D]"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
            <span>WhatsApp Snap-to-Log</span>
          </motion.div>

          {/* Center Card Mockup */}
          <div className="bg-gradient-to-br from-[#164E3D] via-[#1a5b48] to-[#258564] text-white p-5 rounded-3xl shadow-xl text-left relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-black">AI Plate Scanner</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950">
                GLYCEMIC SAFE
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-3 border border-white/15">
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span>Egusi Soup &amp; Oat Swallow</span>
                <span className="text-emerald-200">380 kcal</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-100 font-semibold">
                <span>🌾 24g Low-GI Carbs</span>
                <span>•</span>
                <span>🥩 28g Protein</span>
                <span>•</span>
                <span>🥗 50% Fiber Plate</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-100">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                Single-Fist Swallow Rule Calibrated
              </span>
            </div>
          </div>
        </div>

        {/* 3-Step Quick Story */}
        <div id="features" className="w-full space-y-2.5 mb-8 text-left">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-[#164E3D] rounded-xl font-black text-xs shrink-0">
              01
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Snap or Voice-Log Your African Plate</h4>
              <p className="text-[11px] text-slate-500">Instant AI scanner or hands-free WhatsApp voice notes</p>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs shrink-0">
              02
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">AI Balances Glycemic Load &amp; Sodium</h4>
              <p className="text-[11px] text-slate-500">Smart portion advice for swallows, rice, soups &amp; palm oil</p>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
            <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl font-black text-xs shrink-0">
              03
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Doctor-Ready Clinical Health Reports</h4>
              <p className="text-[11px] text-slate-500">1-Tap PDF export of your blood sugar, BP, and nutrition trends</p>
            </div>
          </div>
        </div>

        {/* Hero CTAs */}
        <div className="w-full space-y-3">
          {user?.id ? (
            <Link
              to="/home"
              className="block w-full bg-[#164E3D] hover:bg-[#113E30] text-white rounded-2xl py-3.5 text-center font-black text-sm shadow-md shadow-emerald-950/20 transition-all active:scale-98"
            >
              Open Dashboard &amp; Today's Rings →
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="block w-full bg-[#164E3D] hover:bg-[#113E30] text-white rounded-2xl py-3.5 text-center font-black text-sm shadow-md shadow-emerald-950/20 transition-all active:scale-98"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="block w-full bg-white text-[#164E3D] border border-emerald-200/80 rounded-2xl py-3.5 text-center font-bold text-sm hover:bg-emerald-50/50 transition-all active:scale-98"
              >
                Sign In with Existing Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 💳 TRANSPARENT PRICING & SUBSCRIPTION PLANS SECTION (Paystack Compliance Certified) */}
      <section id="pricing" className="bg-slate-50 border-t border-b border-stone-200/80 py-12 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-[#164E3D] text-[11px] font-black uppercase tracking-wider mb-3">
            <span>Simple, Transparent Pricing</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            Invest in Your Health with Complete Peace of Mind
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mb-8">
            Start for free. Upgrade anytime to unlock clinical-grade biometric tracking, AI plate scanning, and WhatsApp integration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Tier 1: Free Starter */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Free Tier</span>
                <h3 className="text-lg font-black text-stone-900 mt-1">Starter</h3>
                <div className="mt-3 mb-4">
                  <span className="text-3xl font-black text-stone-900">₦0</span>
                  <span className="text-xs text-stone-500"> / forever</span>
                </div>
                <ul className="space-y-2.5 text-xs text-stone-600 mb-6">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Daily Health Ring (Veggies, Protein, Swallow)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Basic African Food &amp; Swallow Database</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Hydration &amp; Water Tracker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>14 Master Cultural Recipe Previews</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full py-2.5 px-4 rounded-xl border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-bold text-center block transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Tier 2: MealOptimiza PRO (Highlighted) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#164E3D] shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#164E3D] text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#164E3D]">Individual Care</span>
                <h3 className="text-lg font-black text-stone-900 mt-1">MealOptimiza PRO</h3>
                <div className="mt-3 mb-4">
                  <span className="text-3xl font-black text-[#164E3D]">₦4,500</span>
                  <span className="text-xs text-stone-500"> / month</span>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">or ₦45,000 / year (save 2 months)</div>
                </div>
                <ul className="space-y-2.5 text-xs text-stone-600 mb-6">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span className="font-semibold text-stone-800">Unlimited AI Food Plate Scanner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>WhatsApp Voice &amp; Photo Meal Logging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Doctor-Ready PDF Medical Health Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Blood Sugar, BP &amp; Biomarker Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>AI Cultural Chef Custom Recipe Generator</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full py-2.5 px-4 rounded-xl bg-[#164E3D] hover:bg-[#113E30] text-white text-xs font-bold text-center block shadow-sm shadow-emerald-950/20 transition-all active:scale-98"
              >
                Upgrade to PRO
              </Link>
            </div>

            {/* Tier 3: Diaspora Parent Care */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Family &amp; Diaspora</span>
                <h3 className="text-lg font-black text-stone-900 mt-1">Diaspora Parent Care</h3>
                <div className="mt-3 mb-4">
                  <span className="text-3xl font-black text-stone-900">₦14,500</span>
                  <span className="text-xs text-stone-500"> / month</span>
                  <div className="text-[11px] text-amber-800 font-semibold mt-0.5">Supports up to 4 family members</div>
                </div>
                <ul className="space-y-2.5 text-xs text-stone-600 mb-6">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-amber-600 shrink-0" />
                    <span>All PRO Features included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-amber-600 shrink-0" />
                    <span>Remote Elder &amp; Parent Vitals Monitoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-amber-600 shrink-0" />
                    <span>WhatsApp Family Alerts for High Spikes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-amber-600 shrink-0" />
                    <span>Dedicated Priority Clinical Nutritionist Line</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/signup"
                className="w-full py-2.5 px-4 rounded-xl border border-amber-600 text-amber-900 hover:bg-amber-50 text-xs font-bold text-center block transition-colors"
              >
                Choose Diaspora Care
              </Link>
            </div>
          </div>

          {/* Paystack Payment Security Assurance Badge */}
          <div className="mt-10 p-4 bg-white rounded-2xl border border-stone-200 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 rounded-xl text-[#164E3D]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-900">Secured &amp; Verified by Paystack</div>
                <div className="text-[11px] text-stone-500">Debit / Credit Cards • Bank Transfer • USSD • Apple Pay</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium shrink-0">
              <Lock size={12} className="text-emerald-600" />
              <span>256-bit SSL Bank-Grade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Legal, Policies & Compliance Footer (Paystack Review Ready) */}
      <footer className="bg-stone-900 text-stone-400 py-10 px-6 text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center">
              <AppLogo size="sm" variant="white" showSubtitle={true} />
            </Link>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Clinical African metabolic AI platform. Personalizing swallows, traditional soups, and nutrition for diabetes, hypertension, and longevity.
            </p>
            <div className="text-[11px] text-stone-500">
              © {new Date().getFullYear()} MealOptimiza. All rights reserved.
            </div>
          </div>

          {/* Col 2: Navigation & Tools */}
          <div>
            <h4 className="text-stone-200 font-bold mb-3 uppercase tracking-wider text-[11px]">Features &amp; Tools</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/calculators" className="hover:text-emerald-400 transition-colors">Free Health Calculators</Link></li>
              <li><Link to="/whatsapp" className="hover:text-emerald-400 transition-colors">WhatsApp AI Meal Logger</Link></li>
              <li><Link to="/clinician-portal" className="hover:text-emerald-400 transition-colors">Doctor &amp; Clinician Portal</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Member Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-emerald-400 transition-colors">Create Free Account</Link></li>
            </ul>
          </div>

          {/* Col 3: Compliance & Legal */}
          <div>
            <h4 className="text-stone-200 font-bold mb-3 uppercase tracking-wider text-[11px]">Legal &amp; Policies</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/terms-and-conditions" className="hover:text-emerald-400 transition-colors">Terms and Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><span className="text-stone-300">Cancellation Policy:</span> 1-tap cancellation anytime from profile settings</li>
              <li><span className="text-stone-300">Refund Guarantee:</span> 30-day money-back satisfaction guarantee</li>
            </ul>
          </div>

          {/* Col 4: Contact & Customer Support */}
          <div>
            <h4 className="text-stone-200 font-bold mb-3 uppercase tracking-wider text-[11px]">Support &amp; Contact</h4>
            <p className="text-[11px] text-stone-400 leading-relaxed mb-3">
              Need assistance with your account, billing, or clinical care? Our support team is ready to assist.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-stone-300">
                <Mail size={13} className="text-emerald-500" />
                <a href="mailto:support@mealoptimiza.com" className="hover:underline text-emerald-400">support@mealoptimiza.com</a>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Paystack Merchant Compliance Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 border-t border-stone-800 text-[10px] text-stone-500 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>MealOptimiza • African Metabolic Nutrition Engine</div>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link to="/terms-and-conditions" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <a href="mailto:support@mealoptimiza.com" className="hover:underline">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
