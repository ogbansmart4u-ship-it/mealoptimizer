import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Share2,
  Download,
  Flame,
  Award,
  HeartPulse,
  Leaf,
  Activity,
  CheckCircle,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ShieldCheck,
  Droplets,
  Trophy,
  Crown,
  Compass,
} from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { motion, AnimatePresence } from "motion/react";

interface FoodWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyMealsCount?: number;
  glucoseStabilityPercent?: number;
  topSuperfood?: string;
  spikesPrevented?: number;
  waterGlassesCount?: number;
}

export default function FoodWrappedModal({
  isOpen,
  onClose,
  monthlyMealsCount = 28,
  glucoseStabilityPercent = 94,
  topSuperfood = "Fluted Pumpkin (Ugu) & Ewedu",
  spikesPrevented = 16,
  waterGlassesCount = 185,
}: FoodWrappedModalProps) {
  const { profile, userName } = useUser();
  const monthName = new Date().toLocaleString("default", { month: "long" });
  const year = new Date().getFullYear();

  const displayName = userName || profile?.name || "Metabolic Champion";

  // Story slides state
  const TOTAL_SLIDES = 5;
  const SLIDE_DURATION_MS = 5500;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Determine Cultural Nutrition Archetype
  const archetype = {
    title: "The Biohacking Afrobeats Chef",
    badge: "Master of Resistant Starch 🍠✨",
    tagline: "You mastered the science of traditional African flavors, pairing resistant starches and leafy greens to keep glycemic spikes at zero.",
    traits: ["Zero Food Fatigue", "94% Glucose Stability", "Fiber Shield Champion"],
  };

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setProgress(0);
      setIsPaused(false);
      triggerHaptic("medium");
    }
  }, [isOpen]);

  // Story Progress Timer
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = 50; // update every 50ms
    const step = (interval / SLIDE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          if (currentSlide < TOTAL_SLIDES - 1) {
            setCurrentSlide((curr) => curr + 1);
            triggerHaptic("light");
            return 0;
          } else {
            // Reached the end
            clearInterval(timer);
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentSlide]);

  // Trigger celebration on final slide
  useEffect(() => {
    if (isOpen && currentSlide === TOTAL_SLIDES - 1) {
      triggerConfetti("fireworks");
      triggerHaptic("milestone");
    }
  }, [isOpen, currentSlide]);

  const goToNextSlide = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((c) => c + 1);
      setProgress(0);
      triggerHaptic("light");
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((c) => c - 1);
      setProgress(0);
      triggerHaptic("light");
    }
  };

  const handleReplay = () => {
    setCurrentSlide(0);
    setProgress(0);
    triggerHaptic("medium");
  };

  // 1-Tap Share to WhatsApp
  const handleShareToWhatsApp = () => {
    triggerHaptic("medium");
    triggerConfetti("burst");

    const message =
      `🥑 *My MealOptimiza ${monthName} Food Wrapped* 📊\n\n` +
      `🏆 Archetype: *${archetype.title}* (${archetype.badge})\n\n` +
      `🍲 *${monthlyMealsCount}* Authentic African meals optimized\n` +
      `🌿 Top Superfood: *${topSuperfood}*\n` +
      `⚡ *${glucoseStabilityPercent}%* Glucose Stability Score\n` +
      `🛡️ *${spikesPrevented}* Glycemic spikes prevented with Fix My Plate\n` +
      `💧 *${waterGlassesCount}* Hydration glasses logged\n\n` +
      `Transform your cultural foods into metabolic medicine 👉 https://mealoptimiza.com`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp share sheet!");
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    triggerHaptic("medium");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MealOptimiza Food Wrapped: ${displayName}`,
          text: `I just unlocked "${archetype.title}" in my MealOptimiza ${monthName} Food Wrapped! 🥑 94% Glucose Stability with West African foods.`,
          url: "https://mealoptimiza.com",
        });
      } catch (err) {
        /* share dismissed */
      }
    } else {
      handleShareToWhatsApp();
    }
  };

  // Download 1080x1920 High-Res 9:16 Story Card as PNG via HTML5 Canvas
  const downloadStoryCard = () => {
    setIsDownloading(true);
    triggerHaptic("medium");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        toast.error("Could not generate image. Please try again.");
        setIsDownloading(false);
        return;
      }

      // 1. Background Gradient (Dark Luxury Teal / Emerald Mesh)
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, "#061318");
      bgGrad.addColorStop(0.35, "#0b262d");
      bgGrad.addColorStop(0.7, "#093339");
      bgGrad.addColorStop(1, "#031015");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Glowing Orb Accents
      const drawGlow = (x: number, y: number, r: number, color: string) => {
        const radGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        radGrad.addColorStop(0, color);
        radGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      drawGlow(850, 250, 450, "rgba(78, 205, 196, 0.25)");
      drawGlow(200, 1600, 500, "rgba(31, 122, 140, 0.3)");
      drawGlow(540, 960, 400, "rgba(243, 156, 18, 0.15)");

      // 3. Top Header Branding
      ctx.textAlign = "center";
      ctx.fillStyle = "#4ecdc4";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("🥑 MEALOPTIMIZA", 540, 140);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.letterSpacing = "6px";
      ctx.fillText(`${monthName.toUpperCase()} ${year} · CULTURAL FOOD WRAPPED`, 540, 190);

      // 4. User Title Card
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 68px sans-serif";
      ctx.fillText(displayName, 540, 310);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "32px sans-serif";
      ctx.fillText("West African Metabolic Health Intelligence", 540, 365);

      // 5. Archetype Banner
      ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
      ctx.beginPath();
      ctx.roundRect(100, 420, 880, 230, 40);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText("🏆 OFFICIAL NUTRITION ARCHETYPE", 540, 480);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px sans-serif";
      ctx.fillText(archetype.title, 540, 550);

      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(archetype.badge, 540, 610);

      // 6. Bento Grid Stat Cards (4 Cards)
      const stats = [
        { label: "TRADITIONAL MEALS", val: `${monthlyMealsCount} Dishes`, icon: "🍲", sub: "Authentic & Nourishing" },
        { label: "GLUCOSE STABILITY", val: `${glucoseStabilityPercent}%`, icon: "⚡", sub: "Optimal Glycemic Range" },
        { label: "SPIKES PREVENTED", val: `${spikesPrevented} Spikes`, icon: "🛡️", sub: "With Fix My Plate" },
        { label: "HYDRATION LOGGED", val: `${waterGlassesCount} Glasses`, icon: "💧", sub: "Daily Habit Success" },
      ];

      const cardPositions = [
        { x: 100, y: 690 },
        { x: 560, y: 690 },
        { x: 100, y: 960 },
        { x: 560, y: 960 },
      ];

      stats.forEach((s, idx) => {
        const pos = cardPositions[idx];
        ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, 420, 230, 36);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(s.label, pos.x + 35, pos.y + 60);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 44px sans-serif";
        ctx.fillText(s.val, pos.x + 35, pos.y + 130);

        ctx.fillStyle = "#4ecdc4";
        ctx.font = "24px sans-serif";
        ctx.fillText(s.sub, pos.x + 35, pos.y + 185);
      });

      // 7. #1 Superfood Card
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
      ctx.beginPath();
      ctx.roundRect(100, 1230, 880, 190, 36);
      ctx.fill();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#6ee7b7";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText("🌿 #1 CULTURAL SUPERFOOD DISH", 540, 1290);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 40px sans-serif";
      ctx.fillText(topSuperfood, 540, 1360);

      // 8. Verified Badge & Stamp
      ctx.fillStyle = "rgba(78, 205, 196, 0.2)";
      ctx.beginPath();
      ctx.roundRect(240, 1470, 600, 120, 30);
      ctx.fill();
      ctx.strokeStyle = "#4ecdc4";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#4ecdc4";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("✓ VERIFIED METABOLIC PROGRESS", 540, 1540);

      // 9. Footer Call-to-Action
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText("mealoptimiza.com", 540, 1720);

      ctx.fillStyle = "#64748b";
      ctx.font = "26px sans-serif";
      ctx.fillText("AI Nutrition for African & Diaspora Cuisines", 540, 1780);

      // Export as PNG and trigger download
      const imageUri = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `MealOptimiza-${monthName}-Wrapped.png`;
      link.href = imageUri;
      link.click();

      triggerConfetti("burst");
      toast.success("9:16 Story Card downloaded! Share it to your Instagram or WhatsApp Status! 📸✨");
    } catch (e) {
      console.error("Canvas export failed:", e);
      toast.error("Failed to generate download. You can share via WhatsApp directly!");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 rounded-3xl overflow-hidden border-teal-500/40 bg-slate-950 text-white shadow-2xl">
        {/* 9:16 Instagram/TikTok Story Container */}
        <div
          className="relative bg-gradient-to-br from-slate-950 via-[#0a232a] to-slate-950 p-6 pt-6 pb-6 flex flex-col justify-between h-[640px] select-none overflow-hidden"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Top Mesh Background Glows */}
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Segmented Story Progress Bars */}
          <div className="relative z-30 flex gap-1.5 mb-3">
            {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
              <div
                key={idx}
                className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all"
                  style={{
                    width:
                      idx === currentSlide
                        ? `${progress}%`
                        : idx < currentSlide
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Header Bar */}
          <div className="relative z-30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider text-teal-300 uppercase">
                🥑 {monthName} Wrapped
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                {currentSlide + 1} of {TOTAL_SLIDES}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Story Slides Content with Smooth Transitions */}
          <div className="relative z-20 flex-1 my-auto flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* SLIDE 0: Welcome & The Cultural Journey */}
              {currentSlide === 0 && (
                <motion.div
                  key="slide-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-4 py-4"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold border border-amber-400/30">
                    <Sparkles size={14} /> Ready for your Nutrition Story?
                  </div>

                  <div className="my-3 flex justify-center">
                    <Mascot gesture="waving" size={88} className="drop-shadow-lg" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {displayName}'s <br />
                    <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                      {monthName} Wrapped
                    </span>
                  </h2>

                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    You turned everyday cultural staples into personalized metabolic medicine. Let's see what you accomplished!
                  </p>

                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-teal-400 animate-pulse">
                      Tap anywhere to explore your story →
                    </span>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 1: The Feast & #1 Cultural Superfood */}
              {currentSlide === 1 && (
                <motion.div
                  key="slide-1"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 py-2"
                >
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                      Cultural Fuel
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5">
                      Your Plate Was Pure Art 🍲
                    </h3>
                  </div>

                  {/* Stat Box */}
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Dishes Optimized
                    </span>
                    <div className="text-3xl font-black text-white my-1">
                      {monthlyMealsCount} Traditional Meals
                    </div>
                    <p className="text-[11px] text-teal-300">
                      Jollof, Moi Moi, Ofada Rice, Ewedu, and Steamed Ugu
                    </p>
                  </div>

                  {/* Superfood Crown Card */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl flex-shrink-0 text-2xl">
                      👑
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                        #1 Cultural Superfood
                      </span>
                      <h4 className="text-sm font-black text-white truncate">
                        {topSuperfood}
                      </h4>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        High-fiber polyphenol boost that slows glucose uptake!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 2: The Glucose Shield */}
              {currentSlide === 2 && (
                <motion.div
                  key="slide-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 py-2"
                >
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                      Glycemic Defense
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5">
                      The Blood Sugar Shield 🛡️
                    </h3>
                  </div>

                  {/* Stability Stat */}
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-300">
                      Metabolic Stability
                    </span>
                    <div className="text-4xl font-black text-white my-1">
                      {glucoseStabilityPercent}%
                    </div>
                    <p className="text-[11px] text-rose-200">
                      Steady, spike-free blood glucose throughout the month
                    </p>
                  </div>

                  {/* Fix My Plate Impact */}
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                    <Mascot gesture="thumbsup" size={54} />
                    <div className="min-w-0">
                      <span className="text-sm font-extrabold text-teal-300 block">
                        {spikesPrevented} Glucose Spikes Blocked
                      </span>
                      <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                        Through Resistant Starch batching & Avo's vegetable-first fiber shields!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 3: Hydration & Circadian Mastery */}
              {currentSlide === 3 && (
                <motion.div
                  key="slide-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 py-2"
                >
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      Circadian Rhythm
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5">
                      Hydration & Energy Flow 💧
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                      <Droplets className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
                      <span className="text-2xl font-black text-white">{waterGlassesCount}</span>
                      <p className="text-[10px] text-cyan-200 mt-0.5">Glasses Logged</p>
                    </div>

                    <div className="p-4 rounded-3xl bg-amber-950/40 border border-amber-500/30 text-center">
                      <Flame className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                      <span className="text-2xl font-black text-white">88%</span>
                      <p className="text-[10px] text-amber-200 mt-0.5">Window Sync</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <h4 className="text-xs font-bold text-teal-300">Circadian Eating Window:</h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      You aligned your main meals with your morning cortisol peak and evening wind-down, maximizing cellular insulin sensitivity.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 4: Archetype Reveal & Share Suite */}
              {currentSlide === 4 && (
                <motion.div
                  key="slide-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3.5 py-1 text-center"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold border border-amber-400/30">
                    <Trophy size={13} /> Your Official Nutrition Archetype
                  </div>

                  <h3 className="text-xl font-black text-white">
                    "{archetype.title}"
                  </h3>

                  <div className="p-3.5 rounded-3xl bg-gradient-to-br from-amber-950/30 via-teal-950/30 to-slate-900 border border-amber-400/40 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-300">{archetype.badge}</span>
                      <span className="text-[9px] font-mono text-slate-400">ID: MO-WRAPPED-{year}</span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-snug">
                      {archetype.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {archetype.traits.map((trait, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-teal-300"
                        >
                          ✓ {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Share Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <Button
                      onClick={handleShareToWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer h-10"
                    >
                      <Share2 size={15} />
                      <span>Share to WhatsApp Status</span>
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        onClick={downloadStoryCard}
                        disabled={isDownloading}
                        variant="outline"
                        className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold py-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer h-9"
                      >
                        <Download size={14} />
                        <span>{isDownloading ? "Generating..." : "Save 9:16 PNG"}</span>
                      </Button>

                      <button
                        onClick={handleReplay}
                        className="px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="Replay Story"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Invisible Touch Areas for Left / Right Tap Navigation */}
          <div
            onClick={goToPrevSlide}
            className="absolute left-0 top-16 bottom-16 w-1/4 z-10 cursor-pointer"
            title="Previous slide"
          />
          <div
            onClick={goToNextSlide}
            className="absolute right-0 top-16 bottom-16 w-3/4 z-10 cursor-pointer"
            title="Next slide"
          />

          {/* Story Navigation Footer Pills */}
          <div className="relative z-30 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
            <button
              onClick={goToPrevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 text-[11px] font-bold hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={14} /> Back
            </button>

            <span className="text-[10px] text-slate-500">
              Hold screen to pause
            </span>

            {currentSlide < TOTAL_SLIDES - 1 ? (
              <button
                onClick={goToNextSlide}
                className="flex items-center gap-1 text-[11px] font-bold text-teal-300 hover:text-teal-200 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="text-[11px] font-bold text-teal-300 hover:text-teal-200 cursor-pointer"
              >
                Done ✓
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
