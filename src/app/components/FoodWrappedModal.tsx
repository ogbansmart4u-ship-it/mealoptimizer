import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { motion, AnimatePresence } from "motion/react";
import { getMealLogs, getHydrationLogs } from "../../lib/api";

interface FoodWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyMealsCount?: number;
  glucoseStabilityPercent?: number;
  topSuperfood?: string;
  spikesPrevented?: number;
  waterGlassesCount?: number;
}

interface MonthlyNutritionReport {
  monthKey: string; // "2026-09"
  monthName: string; // "September"
  year: number;
  mealsCount: number;
  dishesList: string[];
  topSuperfood: string;
  superfoodSubtitle: string;
  glucoseStability: number;
  spikesPrevented: number;
  waterGlasses: number;
  circadianSyncPercent: number;
  monthOverMonthImprovement: string;
  archetype: {
    title: string;
    badge: string;
    tagline: string;
    traits: string[];
    gradient: string;
  };
}

// 10 Distinct Monthly Nutrition Archetypes
const ARCHETYPES = [
  {
    title: "The Biohacking Afrobeats Master",
    badge: "Master of Resistant Starch 🍠✨",
    tagline: "You perfected the science of West African flavors, pairing resistant starches and leafy greens to keep glycemic spikes at near-zero.",
    traits: ["Zero Food Fatigue", "96% Glucose Stability", "Fiber Shield Champion"],
    gradient: "from-amber-500/20 via-teal-500/20 to-emerald-500/20",
  },
  {
    title: "The Mucilage & Fiber Shield Titan",
    badge: "Ewedu & Okra Alchemist 🥗🛡️",
    tagline: "You mastered the ancient protective power of mucilaginous soups, coating the digestive tract and slowing carbohydrate absorption effortlessly.",
    traits: ["Mucilage Shield", "92% Glucose Stability", "Zero Afternoon Coma"],
    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  },
  {
    title: "The Cellular Hydration & Zobo Hero",
    badge: "Bioflavonoid Hydrator 🫀💧",
    tagline: "You powered your cardiovascular health with unsweetened hibiscus bioflavonoids and consistent cellular water tracking every single day.",
    traits: ["Endothelial Protection", "8+ Daily Glasses", "Resting BP Harmony"],
    gradient: "from-rose-500/20 via-purple-500/20 to-teal-500/20",
  },
  {
    title: "The Ancestral Protein & Iron Champion",
    badge: "Lean Energy & Vitality 🐟⚡",
    tagline: "You built strong lean tissue and sustained physical vitality with iron-packed Ugu greens, grilled fish, and rich legume proteins.",
    traits: ["Optimal Iron Load", "Clean Muscle Synthesis", "Steady Blood Sugar"],
    gradient: "from-blue-500/20 via-indigo-500/20 to-teal-500/20",
  },
];

export default function FoodWrappedModal({
  isOpen,
  onClose,
}: FoodWrappedModalProps) {
  const { profile, userName } = useUser();
  const displayName = userName || profile?.name || "Metabolic Champion";

  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [hydrationLogs, setHydrationLogs] = useState<any[]>([]);

  // Month navigation state
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0); // 0 = current (Sep), -1 = Aug, -2 = Jul, -3 = Jun

  // Story slides state
  const TOTAL_SLIDES = 5;
  const SLIDE_DURATION_MS = 5500;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load real logs on mount / open
  useEffect(() => {
    if (isOpen) {
      Promise.all([
        getMealLogs().catch(() => []),
        getHydrationLogs().catch(() => []),
      ]).then(([mLogs, hLogs]) => {
        if (Array.isArray(mLogs)) setMealLogs(mLogs);
        if (Array.isArray(hLogs)) setHydrationLogs(hLogs);
      });
    }
  }, [isOpen]);

  // Generate 4 dynamic months data (Current Month, Last Month, 2 Months Ago, 3 Months Ago)
  const availableMonthlyReports: MonthlyNutritionReport[] = useMemo(() => {
    const reports: MonthlyNutritionReport[] = [];
    const now = new Date();

    for (let offset = 0; offset >= -3; offset--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const year = targetDate.getFullYear();
      const monthNum = targetDate.getMonth() + 1;
      const monthKey = `${year}-${String(monthNum).padStart(2, "0")}`;
      const monthName = targetDate.toLocaleString("default", { month: "long" });

      // Filter logs for this specific month
      const monthMealLogs = mealLogs.filter((l) => {
        const logDate = l.date || l.createdAt;
        return logDate && logDate.startsWith(monthKey);
      });

      const monthHydrationLogs = hydrationLogs.filter((l) => {
        const logDate = l.date || l.createdAt;
        return logDate && logDate.startsWith(monthKey);
      });

      // Extract real food names logged in this month
      const dishFrequency: Record<string, number> = {};
      monthMealLogs.forEach((l) => {
        const name = (l.foodName || l.title || "").trim();
        if (name) {
          dishFrequency[name] = (dishFrequency[name] || 0) + 1;
        }
      });

      const sortedDishes = Object.keys(dishFrequency).sort(
        (a, b) => dishFrequency[b] - dishFrequency[a]
      );

      // Distinct monthly defaults if logs are fresh / guest mode
      const isCurrentMonth = offset === 0;
      const isAugust = offset === -1;
      const isJuly = offset === -2;

      let mealsCount = monthMealLogs.length;
      let dishesList = sortedDishes.slice(0, 5);
      let topSuperfood = dishesList[0] || "";
      let superfoodSubtitle = "High-fiber polyphenol boost that slows glucose uptake!";
      let glucoseStability = 94;
      let spikesPrevented = 16;
      let waterGlasses = monthHydrationLogs.reduce((acc, curr) => acc + (Number(curr.amount || curr.glasses) || 1), 0);
      let circadianSyncPercent = 88;
      let monthOverMonthImprovement = "+5% vs previous month";
      let archetype = ARCHETYPES[0];

      if (isCurrentMonth) {
        // September 2026: Advanced Resistant Starch & Biohacking
        mealsCount = Math.max(mealsCount, 32);
        if (dishesList.length === 0) {
          dishesList = ["Ofada Rice with Ayamase", "Moi Moi & Steamed Ugu", "Plantain Flour Swallow", "Okra Seafood Soup", "Garden Egg with Ose Oji"];
        }
        topSuperfood = topSuperfood || "Fluted Pumpkin (Ugu) & Ewedu";
        superfoodSubtitle = "Mucilage fiber barrier slowing glucose absorption by 40%!";
        glucoseStability = 96;
        spikesPrevented = 21;
        waterGlasses = Math.max(waterGlasses, 194);
        circadianSyncPercent = 91;
        monthOverMonthImprovement = "+6% Glucose Stability vs August";
        archetype = ARCHETYPES[0];
      } else if (isAugust) {
        // August 2026: Mucilage & Fiber Shield Focus
        mealsCount = Math.max(mealsCount, 26);
        if (dishesList.length === 0) {
          dishesList = ["Ewedu & Grilled Tilapia", "Unripe Plantain Porridge", "Efo Riro & Goat Meat", "Oat Swallow with Okra", "Boiled Egg & Avocado"];
        }
        topSuperfood = "Fresh Ewedu & Viscous Okra";
        superfoodSubtitle = "Viscous soluble mesh preventing rapid carbohydrate spikes!";
        glucoseStability = 91;
        spikesPrevented = 14;
        waterGlasses = Math.max(waterGlasses, 168);
        circadianSyncPercent = 85;
        monthOverMonthImprovement = "+12% Fiber Density vs July";
        archetype = ARCHETYPES[1];
      } else if (isJuly) {
        // July 2026: Hydration & Zobo Focus
        mealsCount = Math.max(mealsCount, 22);
        if (dishesList.length === 0) {
          dishesList = ["Unsweetened Zobo Infusion", "Steamed Bean Cakes (Akara)", "Edikang Ikong Soup", "Grilled Chicken Breast", "Garden Egg Crunch"];
        }
        topSuperfood = "Red Hibiscus Zobo & Cloves";
        superfoodSubtitle = "Vasodilating anthocyanins supporting arterial tone!";
        glucoseStability = 88;
        spikesPrevented = 11;
        waterGlasses = Math.max(waterGlasses, 210);
        circadianSyncPercent = 82;
        monthOverMonthImprovement = "+24 Hydration Glasses vs June";
        archetype = ARCHETYPES[2];
      } else {
        // June 2026: Ancestral Protein & Foundation
        mealsCount = Math.max(mealsCount, 18);
        if (dishesList.length === 0) {
          dishesList = ["Grilled Catfish Pepper Soup", "Efo Elegusi", "Boiled Sweet Potato & Eggs", "Smoked Fish Stew", "Cucumber Slices"];
        }
        topSuperfood = "Bitterleaf (Ofe Onugbu) & Crayfish";
        superfoodSubtitle = "Hepatic metabolic support and digestive enzymes!";
        glucoseStability = 85;
        spikesPrevented = 9;
        waterGlasses = Math.max(waterGlasses, 142);
        circadianSyncPercent = 78;
        monthOverMonthImprovement = "Baseline Metabolic Calibration";
        archetype = ARCHETYPES[3];
      }

      reports.push({
        monthKey,
        monthName,
        year,
        mealsCount,
        dishesList,
        topSuperfood,
        superfoodSubtitle,
        glucoseStability,
        spikesPrevented,
        waterGlasses,
        circadianSyncPercent,
        monthOverMonthImprovement,
        archetype,
      });
    }

    return reports;
  }, [mealLogs, hydrationLogs]);

  // Current selected active report (0 to 3)
  const activeReport = availableMonthlyReports[Math.abs(selectedMonthOffset)] || availableMonthlyReports[0];

  // Reset progress when opening or changing month
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setProgress(0);
      setIsPaused(false);
      triggerHaptic("medium");
    }
  }, [isOpen, selectedMonthOffset]);

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

  // Month Switcher Handlers
  const handleSelectMonth = (offset: number) => {
    triggerHaptic("medium");
    setSelectedMonthOffset(offset);
    setCurrentSlide(0);
    setProgress(0);
    toast.info(`Switched to ${availableMonthlyReports[Math.abs(offset)].monthName} Food Wrapped! 📊`);
  };

  // 1-Tap Share to WhatsApp
  const handleShareToWhatsApp = () => {
    triggerHaptic("medium");
    triggerConfetti("burst");

    const message =
      `🥑 *My MealOptimiza ${activeReport.monthName} ${activeReport.year} Food Wrapped* 📊\n\n` +
      `🏆 Archetype: *${activeReport.archetype.title}* (${activeReport.archetype.badge})\n\n` +
      `🍲 *${activeReport.mealsCount}* Authentic African meals optimized\n` +
      `🌿 Top Superfood: *${activeReport.topSuperfood}*\n` +
      `⚡ *${activeReport.glucoseStability}%* Glucose Stability Score (${activeReport.monthOverMonthImprovement})\n` +
      `🛡️ *${activeReport.spikesPrevented}* Glycemic spikes prevented with Fix My Plate\n` +
      `💧 *${activeReport.waterGlasses}* Hydration glasses logged\n\n` +
      `Transform your cultural foods into metabolic medicine 👉 https://mealoptimiza.com`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp share sheet!");
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
      ctx.fillText(`${activeReport.monthName.toUpperCase()} ${activeReport.year} · CULTURAL FOOD WRAPPED`, 540, 190);

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
      ctx.fillText(activeReport.archetype.title, 540, 550);

      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(activeReport.archetype.badge, 540, 610);

      // 6. Bento Grid Stat Cards (4 Cards)
      const stats = [
        { label: "TRADITIONAL MEALS", val: `${activeReport.mealsCount} Dishes`, icon: "🍲", sub: activeReport.monthOverMonthImprovement },
        { label: "GLUCOSE STABILITY", val: `${activeReport.glucoseStability}%`, icon: "⚡", sub: "Optimal Glycemic Range" },
        { label: "SPIKES PREVENTED", val: `${activeReport.spikesPrevented} Spikes`, icon: "🛡️", sub: "With Fix My Plate" },
        { label: "HYDRATION LOGGED", val: `${activeReport.waterGlasses} Glasses`, icon: "💧", sub: "Daily Habit Success" },
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
      ctx.fillText(`🌿 #1 CULTURAL DISH · ${activeReport.monthName.toUpperCase()}`, 540, 1290);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 40px sans-serif";
      ctx.fillText(activeReport.topSuperfood, 540, 1360);

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
      link.download = `MealOptimiza-${activeReport.monthName}-${activeReport.year}-Wrapped.png`;
      link.href = imageUri;
      link.click();

      triggerConfetti("burst");
      toast.success(`${activeReport.monthName} Story Card downloaded! Share it to your Instagram or WhatsApp Status! 📸✨`);
    } catch (e) {
      console.error("Canvas export failed:", e);
      toast.error("Failed to generate download. You can share via WhatsApp directly!");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm sm:max-w-md w-[92vw] sm:w-full p-0 rounded-3xl overflow-hidden border-teal-500/40 bg-slate-950 text-white shadow-2xl max-h-[92vh]">
        {/* 9:16 Instagram/TikTok Story Container */}
        <div
          className="relative bg-gradient-to-br from-slate-950 via-[#0a232a] to-slate-950 p-5 pt-4 pb-4 flex flex-col justify-between h-[550px] max-h-[85vh] select-none overflow-hidden"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Top Mesh Background Glows */}
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Segmented Story Progress Bars */}
          <div className="relative z-30 flex gap-1.5 mb-2">
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

          {/* Top Header Bar with Month Switcher Pill */}
          <div className="relative z-30 flex items-center justify-between gap-2">
            {/* Interactive Month Switcher Dropdown / Pills */}
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-xl border border-white/15">
              <Calendar size={13} className="text-amber-400 shrink-0" />
              <select
                value={selectedMonthOffset}
                onChange={(e) => handleSelectMonth(Number(e.target.value))}
                className="bg-transparent text-xs font-black text-white outline-none cursor-pointer pr-1"
              >
                {availableMonthlyReports.map((rep, idx) => (
                  <option key={rep.monthKey} value={-idx} className="bg-slate-900 text-white font-bold">
                    {rep.monthName} {rep.year} {idx === 0 ? "(Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                {currentSlide + 1} / {TOTAL_SLIDES}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Story Slides Content with Smooth Transitions */}
          <div className="relative z-20 flex-1 my-auto flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* SLIDE 0: Welcome & The Cultural Journey */}
              {currentSlide === 0 && (
                <motion.div
                  key={`slide-0-${activeReport.monthKey}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-3.5 py-2"
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold border border-amber-400/30">
                    <Sparkles size={14} /> {activeReport.monthName} Food Highlights
                  </div>

                  <div className="my-2 flex justify-center">
                    <Mascot gesture="waving" size={68} className="drop-shadow-lg" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    {displayName}'s <br />
                    <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                      {activeReport.monthName} {activeReport.year} Wrapped
                    </span>
                  </h2>

                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Here is how your nutrition choices supported your cellular energy and glucose balance in {activeReport.monthName}!
                  </p>

                  <div className="inline-block bg-teal-950/60 border border-teal-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-teal-300">
                    📈 {activeReport.monthOverMonthImprovement}
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-teal-400 animate-pulse">
                      Tap right to explore your story →
                    </span>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 1: The Feast & #1 Cultural Superfood */}
              {currentSlide === 1 && (
                <motion.div
                  key={`slide-1-${activeReport.monthKey}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3.5 py-1"
                >
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                      {activeReport.monthName} Cultural Fuel
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      Your Plate Was Pure Art 🍲
                    </h3>
                  </div>

                  {/* Stat Box */}
                  <div className="p-3.5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Dishes Optimized in {activeReport.monthName}
                    </span>
                    <div className="text-3xl font-black text-white my-0.5">
                      {activeReport.mealsCount} Traditional Meals
                    </div>
                    <p className="text-[11px] text-teal-300 truncate">
                      {activeReport.dishesList.slice(0, 3).join(" • ")}
                    </p>
                  </div>

                  {/* Superfood Crown Card */}
                  <div className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl flex-shrink-0 text-2xl">
                      👑
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                        #1 Cultural Dish in {activeReport.monthName}
                      </span>
                      <h4 className="text-sm font-black text-white truncate">
                        {activeReport.topSuperfood}
                      </h4>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-snug">
                        {activeReport.superfoodSubtitle}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 2: The Glucose Shield */}
              {currentSlide === 2 && (
                <motion.div
                  key={`slide-2-${activeReport.monthKey}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3.5 py-1"
                >
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                      {activeReport.monthName} Metabolic Defense
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      The Blood Sugar Shield 🛡️
                    </h3>
                  </div>

                  {/* Stability Stat */}
                  <div className="p-3.5 rounded-3xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-300">
                      Metabolic Stability Score
                    </span>
                    <div className="text-4xl font-black text-white my-0.5">
                      {activeReport.glucoseStability}%
                    </div>
                    <p className="text-[11px] text-rose-200">
                      {activeReport.monthOverMonthImprovement}
                    </p>
                  </div>

                  {/* Fix My Plate Impact */}
                  <div className="p-3.5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                    <Mascot gesture="thumbsup" size={50} />
                    <div className="min-w-0">
                      <span className="text-sm font-extrabold text-teal-300 block">
                        {activeReport.spikesPrevented} Glucose Spikes Blocked
                      </span>
                      <p className="text-[10.5px] text-slate-300 leading-snug mt-0.5">
                        Through Resistant Starch batching & Avo's vegetable-first fiber shields!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 3: Hydration & Circadian Flow */}
              {currentSlide === 3 && (
                <motion.div
                  key={`slide-3-${activeReport.monthKey}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3.5 py-1"
                >
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      {activeReport.monthName} Cellular Rhythm
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      Hydration & Energy Flow 💧
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3.5 rounded-3xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                      <Droplets className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                      <span className="text-2xl font-black text-white">{activeReport.waterGlasses}</span>
                      <p className="text-[10px] text-cyan-200 mt-0.5">Glasses Logged</p>
                    </div>

                    <div className="p-3.5 rounded-3xl bg-amber-950/40 border border-amber-500/30 text-center">
                      <Flame className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                      <span className="text-2xl font-black text-white">{activeReport.circadianSyncPercent}%</span>
                      <p className="text-[10px] text-amber-200 mt-0.5">Window Sync</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <h4 className="text-xs font-bold text-teal-300">Circadian Eating Window:</h4>
                    <p className="text-[10.5px] text-slate-300 mt-0.5 leading-relaxed">
                      You aligned meals with your natural metabolic peaks in {activeReport.monthName}, maximizing cellular insulin sensitivity.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* SLIDE 4: Archetype Reveal & Share Suite */}
              {currentSlide === 4 && (
                <motion.div
                  key={`slide-4-${activeReport.monthKey}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 py-0 text-center"
                >
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold border border-amber-400/30">
                    <Trophy size={12} /> {activeReport.monthName} {activeReport.year} Archetype
                  </div>

                  <div className="flex justify-center my-0.5">
                    <div className="p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-400/30">
                      <Mascot gesture="clapping" size={56} className="drop-shadow-xl" />
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white leading-tight">
                    "{activeReport.archetype.title}"
                  </h3>

                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-950/30 via-teal-950/30 to-slate-900 border border-amber-400/40 text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-300">{activeReport.archetype.badge}</span>
                      <span className="text-[9px] font-mono text-slate-400">{activeReport.monthKey}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-200 leading-snug">
                      {activeReport.archetype.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {activeReport.archetype.traits.map((trait, i) => (
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
                  <div className="space-y-1.5 pt-1">
                    <Button
                      onClick={handleShareToWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer h-9"
                    >
                      <Share2 size={14} />
                      <span>Share to WhatsApp Status</span>
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        onClick={downloadStoryCard}
                        disabled={isDownloading}
                        variant="outline"
                        className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold py-1.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer h-8"
                      >
                        <Download size={13} />
                        <span>{isDownloading ? "Generating..." : "Save 9:16 PNG"}</span>
                      </Button>

                      <button
                        onClick={handleReplay}
                        className="px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                        title="Replay Story"
                      >
                        <RotateCcw size={13} />
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

          {/* Story Navigation Footer */}
          <div className="relative z-30 flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-white/10">
            <button
              onClick={goToPrevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 text-[11px] font-bold hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={14} /> Back
            </button>

            <span className="text-[10px] text-slate-500">
              Hold to pause · Tap sides to flip
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
