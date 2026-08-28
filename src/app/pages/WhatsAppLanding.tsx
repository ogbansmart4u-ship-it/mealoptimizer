import React, { useState } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  Mic, 
  ShieldCheck, 
  Flame, 
  Activity, 
  Share2, 
  Users, 
  Heart, 
  PhoneCall, 
  Check, 
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router";
import AppLogo from "../components/AppLogo";
import Mascot from "../components/Mascot";
import { getWhatsAppUrl, launchWhatsAppFoodBot } from "../../lib/whatsapp";
import { triggerHaptic } from "../utils/celebration";

export default function WhatsAppLanding() {
  const navigate = useNavigate();
  const [selectedDemo, setSelectedDemo] = useState<"photo" | "voice" | "swallow">("photo");

  const handleStartWhatsApp = (customText?: string) => {
    triggerHaptic("medium");
    const text = customText || "Hi Sarah! I want to try MealOptimiza WhatsApp AI food logging and get my free blood sugar report 🥑🍲";
    launchWhatsAppFoodBot(text);
  };

  const demos = {
    photo: {
      userMsg: "📸 [Photo of Jollof Rice, Fried Plantain & Grilled Fish] How will this affect my glucose?",
      botReply: "🍲 *Plate Analysis:* Jollof Rice with Dodo & Fish\n🔥 *Calories:* ~620 kcal • *Carbs:* 74g\n🟡 *Spike Risk:* Moderate (68/100)\n💡 *Sarah's Glycemic Hack:* Eat the grilled fish and vegetable salad FIRST. Delaying the plantain and rice reduces your post-meal spike by 32%! Logged to your dashboard ✅",
    },
    voice: {
      userMsg: "🎙️ Voice Note (0:07): 'Hi Sarah, I just had 1 wrap of Pounded Yam with Egusi and beef for dinner.'",
      botReply: "🥣 *Dinner Logged:* Pounded Yam + Egusi Soup\n🔥 *Calories:* ~780 kcal • *Carbs:* 92g\n🔴 *Spike Risk:* High (Pounded yam has a GI of 85)\n💡 *Smart Swallow Swap:* Next time, try our 50/50 Plantain-Oat swallow swap to cut carbs by 45g with the exact same taste! 🥑",
    },
    swallow: {
      userMsg: "What low-carb swallow can I make for dinner that won't raise my morning fasting sugar?",
      botReply: "✨ *Sarah's Top 3 Low-GI Swaps:*\n1. *Oat-Psyllium Swallow:* 18g net carbs (Smooth & malleable)\n2. *Cauliflower-Fufu:* 9g net carbs (Zero glycemic spike)\n3. *Almond-Flax Swallow:* High fiber & artery-protective\n👉 Tap here to view the 3-minute video recipe on MealOptimiza!",
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-center py-2 px-4 text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-md">
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>NEW: Real-time Gemini 2.0 AI Vision now live on WhatsApp!</span>
        <span className="bg-black/20 px-2 py-0.5 rounded-full text-[10px] uppercase">Free 14-Day Access</span>
      </div>

      {/* 2. NAVBAR */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
          <AppLogo size="sm" variant="white" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 transition-colors hidden sm:block"
          >
            Web Dashboard
          </button>
          <button
            onClick={() => handleStartWhatsApp()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare size={14} className="fill-slate-950" />
            <span>Open WhatsApp</span>
          </button>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 text-center">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black mb-6 shadow-sm">
          <Sparkles size={13} className="text-emerald-400 animate-pulse" />
          <span>ZERO APP DOWNLOAD NEEDED</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Your 24/7 African Nutritionist &amp; Blood Sugar Coach —{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Directly Inside WhatsApp 📱🥑
          </span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto mt-5 leading-relaxed font-medium">
          Snap a plate photo of your Jollof, Egusi, or Swallow. Send a voice note. Get instant calorie &amp; glycemic spike analysis in 5 seconds.
        </p>

        {/* Primary Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
          <button
            onClick={() => handleStartWhatsApp()}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-2xl font-black text-sm sm:text-base shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <MessageSquare size={18} className="fill-slate-950 group-hover:scale-110 transition-transform" />
            <span>Chat Free on WhatsApp Now</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate("/onboarding")}
            className="w-full sm:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white border border-slate-700 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Take 45s Web Assessment</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400" /> No credit card required
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400" /> End-to-End Encrypted
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400" /> 14,000+ Meals Logged
          </div>
        </div>

        {/* 4. LIVE INTERACTIVE WHATSAPP MOCKUP */}
        <div className="max-w-xl mx-auto mt-12 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden text-left">
          {/* WhatsApp Header Simulation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-xl shadow-xs">
                  🥑
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 absolute bottom-0 right-0" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>Sarah @ MealOptimiza AI</span>
                  <span className="p-0.5 bg-emerald-500 rounded-full text-slate-950 text-[9px]">✓</span>
                </h3>
                <span className="text-[10.5px] text-emerald-400 font-bold">Official Health Assistant • Online</span>
              </div>
            </div>

            {/* Interactive Demo Switchers */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(["photo", "voice", "swallow"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedDemo(key);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black uppercase transition-all ${
                    selectedDemo === key
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 font-sans">
            {/* User Message (Right) */}
            <div className="flex justify-end">
              <div className="bg-emerald-700/80 text-white p-3 rounded-2xl rounded-tr-xs max-w-[85%] text-xs shadow-md">
                <p className="leading-relaxed whitespace-pre-line">{demos[selectedDemo].userMsg}</p>
                <span className="text-[9px] text-emerald-200 block text-right mt-1 font-mono">12:34 PM ✓✓</span>
              </div>
            </div>

            {/* Sarah AI Reply (Left) */}
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-100 p-3.5 rounded-2xl rounded-tl-xs max-w-[90%] text-xs shadow-md border border-slate-700/80">
                <p className="leading-relaxed whitespace-pre-line">{demos[selectedDemo].botReply}</p>
                <span className="text-[9px] text-slate-400 block text-right mt-1.5 font-mono">12:34 PM</span>
              </div>
            </div>
          </div>

          {/* Interactive Chat Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <input
              type="text"
              readOnly
              value="Send a plate photo or voice note..."
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 w-full outline-none"
            />
            <button
              onClick={() => handleStartWhatsApp(demos[selectedDemo].userMsg)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shrink-0 cursor-pointer"
            >
              Test on WhatsApp 🚀
            </button>
          </div>
        </div>
      </section>

      {/* 5. 4 PILLARS OF WHATSAPP POWER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
            Engineered For African Food Reality
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
            Why 14,000+ Africans Log on WhatsApp Every Day
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl hover:border-emerald-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit text-2xl mb-3">
              📸
            </div>
            <h3 className="text-sm font-black text-white">Gemini 2.0 Photo AI</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Trained on 450+ African dishes. Identifies Egusi, Ewedu, Oha, Banku, and Plantain in 1 photo.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl hover:border-emerald-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit text-2xl mb-3">
              🎙️
            </div>
            <h3 className="text-sm font-black text-white">Voice Note Logging</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Too busy to type? Send a quick 5-second voice note in English or Pidgin. Sarah handles the math.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl hover:border-emerald-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit text-2xl mb-3">
              🩸
            </div>
            <h3 className="text-sm font-black text-white">Glycemic Spike Shield</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Get immediate portion hacks before you start eating so your blood sugar stays in the green zone.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl hover:border-emerald-500/40 transition-all">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit text-2xl mb-3">
              👨‍👩‍👧‍👦
            </div>
            <h3 className="text-sm font-black text-white">Diaspora Family Care</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Living abroad? Receive weekly WhatsApp summaries of your parents' BP and sugar stability back home.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <footer className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center border-t border-slate-800/80">
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="flex justify-center mb-3">
            <Mascot gesture="celebrate" size={72} />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Start Eating African Meals Without Blood Sugar Fear 🥑
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-3">
            Join 14,000+ members managing Diabetes, Blood Pressure, and Weight directly on WhatsApp.
          </p>

          <button
            onClick={() => handleStartWhatsApp()}
            className="mt-6 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare size={18} className="fill-slate-950" />
            <span>Connect on WhatsApp (Free)</span>
          </button>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} MealOptimiza. All rights reserved. Clinical nutrition governance &amp; privacy protected.
        </div>
      </footer>

    </div>
  );
}
