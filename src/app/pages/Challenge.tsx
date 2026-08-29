import React, { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Sparkles,
  CheckCircle2,
  Circle,
  Calendar,
  Share2,
  Users,
  Award,
  Shield,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Droplets,
  Activity,
  HeartPulse,
  Leaf,
  Clock,
  MessageSquare,
  Copy,
  Check,
  Download,
  Zap,
  Star,
  Globe,
  Camera,
  MapPin,
  X,
  Radio,
} from "lucide-react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import Mascot from "../components/Mascot";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { celebrate, triggerConfetti, triggerHaptic } from "../components/celebrate";
import { motion, AnimatePresence } from "motion/react";

type ChallengeDay = {
  day: number;
  phase: number;
  title: string;
  subtitle: string;
  scienceTip: string;
  points: number;
  completed: boolean;
  category: "Carb Awareness" | "Swallow Swap" | "Fasting" | "Hydration" | "Clinical" | "Celebration";
};

const CHALLENGE_CURRICULUM: ChallengeDay[] = [
  // Phase 1: Carb Awareness & Glucose Discovery (Days 1–7)
  {
    day: 1,
    phase: 1,
    title: "The Swallow & Resistant Starch Audit",
    subtitle: "Identify your staple swallow carbohydrates & fiber ratios",
    scienceTip: "Cooking and cooling starches (like boiled yam) increases resistant starch by 40%, slowing glucose spikes.",
    points: 50,
    completed: true,
    category: "Carb Awareness",
  },
  {
    day: 2,
    phase: 1,
    title: "The Palm Oil Calibration Rule",
    subtitle: "Measure 2 tablespoons of unrefined oil instead of free-pouring",
    scienceTip: "Excess saturated fats paired with high-carb swallows can induce 6-hour delayed insulin resistance.",
    points: 50,
    completed: true,
    category: "Swallow Swap",
  },
  {
    day: 3,
    phase: 1,
    title: "The 5-Minute Vegetable Starter Shield",
    subtitle: "Eat Ewedu, Ugu, or Spinach soup 5 minutes before your carbs",
    scienceTip: "Viscous soluble fiber lines the duodenum, flattening postprandial glucose curves by up to 35%.",
    points: 50,
    completed: true,
    category: "Carb Awareness",
  },
  {
    day: 4,
    phase: 1,
    title: "The Protein Anchor: Suya & Lean Fish",
    subtitle: "Ensure each main plate contains at least 30g of protein",
    scienceTip: "Protein stimulates GLP-1 and peptide YY release, promoting satiety and lowering gastric emptying rate.",
    points: 50,
    completed: true,
    category: "Carb Awareness",
  },
  {
    day: 5,
    phase: 1,
    title: "The 15-Minute Post-Meal Walk",
    subtitle: "Take a light 15-minute walk right after dinner",
    scienceTip: "Contracting skeletal muscles utilize GLUT4 transporters to pull glucose from blood without needing extra insulin.",
    points: 50,
    completed: true,
    category: "Clinical",
  },
  {
    day: 6,
    phase: 1,
    title: "Zero-Sugar Hydration: Zobo / Hibiscus Swap",
    subtitle: "Swap processed sodas and malt drinks for unsweetened Zobo or lime water",
    scienceTip: "Hibiscus sabdariffa contains anthocyanins that clinical trials show support healthy systolic blood pressure.",
    points: 50,
    completed: true,
    category: "Hydration",
  },
  {
    day: 7,
    phase: 1,
    title: "Phase 1 Graduation: 7-Day Glucose Stability Check",
    subtitle: "Scan your weekend celebration plate with zero spikes!",
    scienceTip: "Congratulations! You have completed the foundational Carb Awareness phase.",
    points: 100,
    completed: true,
    category: "Celebration",
  },

  // Phase 2: Glycemic Shield & Swallow Revolution (Days 8–14)
  {
    day: 8,
    phase: 2,
    title: "The 50/50 Cauliflower Swallow Masterclass",
    subtitle: "Blend 50% cauliflower or cabbage mash with your favorite swallow flour",
    scienceTip: "Cuts glycemic load in half while preserving 100% of the authentic texture and soup-holding grip.",
    points: 50,
    completed: false,
    category: "Swallow Swap",
  },
  {
    day: 9,
    phase: 2,
    title: "14-Hour Intermittent Fasting Kickoff",
    subtitle: "Close your kitchen by 8 PM and break fast at 10 AM",
    scienceTip: "Allows liver glycogen reserves to deplete, priming your metabolic switch toward fatty acid oxidation.",
    points: 50,
    completed: false,
    category: "Fasting",
  },
  {
    day: 10,
    phase: 2,
    title: "The Sodium Shield: Herb Blends Over Bouillon",
    subtitle: "Season dishes with ginger, garlic, scent leaves & thyme instead of excess MSG cubes",
    scienceTip: "Lowering sodium while maintaining potassium intake helps restore vascular elasticity.",
    points: 50,
    completed: false,
    category: "Clinical",
  },
  {
    day: 11,
    phase: 2,
    title: "Smart Diaspora Snacking: Tiger Nuts & Walnuts",
    subtitle: "Replace chin-chin or puff-puff with prebiotic tiger nuts or boiled eggs",
    scienceTip: "Tiger nuts are loaded with prebiotic resistant starch that feeds healthy gut Akkermansia bacteria.",
    points: 50,
    completed: false,
    category: "Carb Awareness",
  },
  {
    day: 12,
    phase: 2,
    title: "The Sleep & Cortisol Blood Sugar Buffer",
    subtitle: "Get 7.5 hours of sleep to prevent next-day insulin resistance",
    scienceTip: "Even a single night of sleep deprivation increases morning fasting insulin resistance by up to 25%.",
    points: 50,
    completed: false,
    category: "Clinical",
  },
  {
    day: 13,
    phase: 2,
    title: "Voice AI Clinical Session with Sarah",
    subtitle: "Ask Sarah 1 question about your medications or blood pressure soups",
    scienceTip: "Sarah delivers instant evidence-based nutrition triage tailored to West African culinary pharmacology.",
    points: 50,
    completed: false,
    category: "Clinical",
  },
  {
    day: 14,
    phase: 2,
    title: "Phase 2 Graduation: Swallow Mastery Badge",
    subtitle: "You have completely upgraded your traditional swallow toolkit!",
    scienceTip: "Your HbA1c trajectory is officially shifting downwards.",
    points: 100,
    completed: false,
    category: "Celebration",
  },

  // Phase 3: Autophagy & Cellular Mastery (Days 15–21)
  {
    day: 15,
    phase: 3,
    title: "16-Hour Autophagy Shift",
    subtitle: "Fast from 7 PM to 11 AM to trigger cellular deep cleaning",
    scienceTip: "Autophagy breaks down damaged cellular proteins and mitochondrial debris, rejuvenating beta cells.",
    points: 50,
    completed: false,
    category: "Fasting",
  },
  {
    day: 16,
    phase: 3,
    title: "Bodyweight Resistance & Muscle Glucose Sponges",
    subtitle: "Complete 15 minutes of squats, pushups, or resistance work",
    scienceTip: "Strength training expands glycogen storage capacity in skeletal muscle tissue.",
    points: 50,
    completed: false,
    category: "Clinical",
  },
  {
    day: 17,
    phase: 3,
    title: "Gut Microbiome Revival: Fermented Locust Bean (Iru/Dawadawa)",
    subtitle: "Add traditional fermented Iru or Ogiri to your stew",
    scienceTip: "Traditional alkaline fermented legumes provide rich bioactive peptides that support cardiometabolic health.",
    points: 50,
    completed: false,
    category: "Swallow Swap",
  },
  {
    day: 18,
    phase: 3,
    title: "The Zero-Spike Celebration Feast (Party Jollof Fixed)",
    subtitle: "Cook brown basmati jollof with chicken, dodo cubes & salad",
    scienceTip: "You can enjoy all your party favorites with zero guilt and zero blood sugar crashes.",
    points: 50,
    completed: false,
    category: "Celebration",
  },
  {
    day: 19,
    phase: 3,
    title: "Biomarker Check & Blood Pressure Log",
    subtitle: "Log your morning blood pressure and fasting blood glucose",
    scienceTip: "Compare your numbers to Day 1 — witness real biometric transformation.",
    points: 50,
    completed: false,
    category: "Clinical",
  },
  {
    day: 20,
    phase: 3,
    title: "Generate Your 14-Day Doctor Health PDF",
    subtitle: "Export your verifiable clinical dossier for your doctor or endocrinologist",
    scienceTip: "Equips your primary care physician with objective nutritional and glycemic data.",
    points: 75,
    completed: false,
    category: "Clinical",
  },
  {
    day: 21,
    phase: 3,
    title: "The 21-Day Metabolic Freedom Hall of Fame 🏆",
    subtitle: "Claim your Certified Cultural Metabolic Champion Certificate & Badge!",
    scienceTip: "You have permanently rewired your metabolic biology while honoring your cultural heritage.",
    points: 150,
    completed: false,
    category: "Celebration",
  },
];

type LeaderboardUser = {
  rank: number;
  name: string;
  location: string;
  flag: string;
  points: number;
  streak: number;
  badge: string;
  isCurrentUser?: boolean;
};

const LEADERBOARD_DATA: Record<string, LeaderboardUser[]> = {
  global: [
    { rank: 1, name: "Dr. Chioma N.", location: "London, UK", flag: "🇬🇧", points: 1420, streak: 21, badge: "Metabolic Legend 👑" },
    { rank: 2, name: "Tunde Bakare", location: "Lagos, NG", flag: "🇳🇬", points: 1380, streak: 20, badge: "Swallow Alchemist 🍲" },
    { rank: 3, name: "Kofi Mensah", location: "Accra, GH", flag: "🇬🇭", points: 1310, streak: 19, badge: "Waakye Optimizer 🇬🇭" },
    { rank: 4, name: "Amara Okeke", location: "Atlanta, US", flag: "🇺🇸", points: 1250, streak: 18, badge: "Glucose Guardian 🛡️", isCurrentUser: true },
    { rank: 5, name: "Femi Adeleke", location: "Toronto, CA", flag: "🇨🇦", points: 1190, streak: 17, badge: "Autophagy Warrior ⏳" },
    { rank: 6, name: "Zainab Bello", location: "Abuja, NG", flag: "🇳🇬", points: 1120, streak: 16, badge: "Suya Balancer 🍢" },
    { rank: 7, name: "Kwame Asante", location: "London, UK", flag: "🇬🇧", points: 1080, streak: 15, badge: "Fiber Shield 🌿" },
  ],
  lagos: [
    { rank: 1, name: "Tunde Bakare", location: "Lagos (Ikoyi)", flag: "🇳🇬", points: 1380, streak: 20, badge: "Swallow Alchemist 🍲" },
    { rank: 2, name: "Yetunde O.", location: "Lagos (Lekki)", flag: "🇳🇬", points: 1210, streak: 18, badge: "Jollof Master 🍛" },
    { rank: 3, name: "Babajide S.", location: "Lagos (Ikeja)", flag: "🇳🇬", points: 1140, streak: 16, badge: "Amala Shield 🥣" },
    { rank: 4, name: "Amara Okeke (You)", location: "Lagos", flag: "🇳🇬", points: 1250, streak: 18, badge: "Glucose Guardian 🛡️", isCurrentUser: true },
  ],
  accra: [
    { rank: 1, name: "Kofi Mensah", location: "Accra (East Legon)", flag: "🇬🇭", points: 1310, streak: 19, badge: "Waakye Optimizer 🇬🇭" },
    { rank: 2, name: "Akosua Darko", location: "Accra (Osu)", flag: "🇬🇭", points: 1190, streak: 17, badge: "Banku Balancer 🍲" },
    { rank: 3, name: "Yaw Boateng", location: "Accra (Tema)", flag: "🇬🇭", points: 1040, streak: 14, badge: "Plantain Shield 🍌" },
  ],
  uk: [
    { rank: 1, name: "Dr. Chioma N.", location: "London (Greenwich)", flag: "🇬🇧", points: 1420, streak: 21, badge: "Metabolic Legend 👑" },
    { rank: 2, name: "Kwame Asante", location: "London (Peckham)", flag: "🇬🇧", points: 1080, streak: 15, badge: "Fiber Shield 🌿" },
    { rank: 3, name: "Oluwatobi A.", location: "Manchester", flag: "🇬🇧", points: 990, streak: 13, badge: "Diaspora Champion 🇬🇧" },
  ],
  us_canada: [
    { rank: 1, name: "Amara Okeke (You)", location: "Atlanta, GA", flag: "🇺🇸", points: 1250, streak: 18, badge: "Glucose Guardian 🛡️", isCurrentUser: true },
    { rank: 2, name: "Femi Adeleke", location: "Toronto, ON", flag: "🇨🇦", points: 1190, streak: 17, badge: "Autophagy Warrior ⏳" },
    { rank: 3, name: "Dr. Emeka Johnson", location: "Houston, TX", flag: "🇺🇸", points: 1100, streak: 15, badge: "Cardio Shield ❤️" },
  ],
};

export default function Challenge() {
  const navigate = useNavigate();
  const { userName, profile } = useUser();
  const [activeTab, setActiveTab] = useState<"journey" | "daily" | "leaderboard">("journey");
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<string>("global");
  const [completedDays, setCompletedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [dailyTasks, setDailyTasks] = useState({
    mealScan: true,
    glycemicSwap: true,
    waterLogged: true,
    fastingDone: false,
    sarahChat: false,
  });
  const [userPoints, setUserPoints] = useState<number>(1250);
  const [userStreak, setUserStreak] = useState<number>(8);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentDayNumber = 8;
  const currentDayInfo = CHALLENGE_CURRICULUM.find((d) => d.day === currentDayNumber) || CHALLENGE_CURRICULUM[7];

  const handleToggleTask = (taskKey: keyof typeof dailyTasks, pts: number) => {
    const newState = !dailyTasks[taskKey];
    setDailyTasks((prev) => ({ ...prev, [taskKey]: newState }));
    if (newState) {
      setUserPoints((p) => p + pts);
      safeCelebrate("Task Complete! 🎉", `+${pts} Challenge XP`);
    } else {
      setUserPoints((p) => p - pts);
    }
  };

  const safeCelebrate = (title: string, sub: string) => {
    try {
      celebrate(title, sub, { confettiStyle: "burst", hapticPattern: "success" });
    } catch {}
  };

  const handleWhatsAppInvite = () => {
    try {
      triggerHaptic("medium");
    } catch {}
    const text = `🥑 Hey! I'm on Day ${currentDayNumber} of the *Avo 21-Day Blood Sugar Reset Challenge* on MealOptimiza! 🛡️\n\nI'm optimizing my African swallows & jollof with 0 glucose spikes. Join my team on the leaderboard and let's reset our metabolic health together!\n\n👉 Join Free: https://mealoptimiza.com/challenge?ref=${userName || "champion"}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("WhatsApp share opened! Earn +100 XP when friends join! 🚀");
  };

  const handleCopyInviteLink = async () => {
    try {
      triggerHaptic("light");
      await navigator.clipboard.writeText(`https://mealoptimiza.com/challenge?ref=${userName || "champion"}`);
      setCopiedLink(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-teal-900/40 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400 animate-spin" />
              <h1 className="text-base font-black text-white tracking-wide">
                Avo 21-Day Reset
              </h1>
            </div>
            <span className="text-[10.5px] text-teal-400 font-bold">
              Blood Sugar &amp; Metabolic Freedom Challenge
            </span>
          </div>
        </div>

        {/* User Streak & Points Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-black">
            <Flame size={13} className="text-amber-400 fill-amber-400" />
            <span>{userStreak}d</span>
          </div>
          <div className="flex items-center gap-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded-xl text-xs font-black">
            <Trophy size={13} className="text-teal-400" />
            <span>{userPoints} XP</span>
          </div>
        </div>
      </div>

      {/* Hero Banner with Avo Mascot */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative rounded-3xl p-5 bg-gradient-to-r from-[#0d313a] via-[#10434f] to-[#1f7a8c] border-2 border-teal-400/40 shadow-2xl overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-300/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="max-w-[70%] space-y-1.5">
              <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck size={11} />
                <span>Phase 2: Swallow Revolution</span>
              </div>
              <h2 className="text-xl font-black text-white leading-tight">
                Day {currentDayNumber}: {currentDayInfo.title}
              </h2>
              <p className="text-xs text-teal-100 leading-snug">
                {currentDayInfo.subtitle}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center">
              <div className="p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-teal-300/30">
                <Mascot gesture="celebrating" size={72} className="drop-shadow-lg" />
              </div>
              <span className="text-[10px] font-black text-amber-300 mt-1">
                +50 XP Today
              </span>
            </div>
          </div>

          {/* Progress Bar for 21 Days */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-white/90">
              <span>Challenge Progress: Day {currentDayNumber} of 21</span>
              <span className="text-teal-300 font-black">{Math.round((currentDayNumber / 21) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${(currentDayNumber / 21) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="px-4 py-2">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 border border-teal-900/40 rounded-2xl">
          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("journey");
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "journey"
                ? "bg-teal-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Calendar size={14} />
            <span>21-Day Map</span>
          </button>

          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("daily");
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "daily"
                ? "bg-teal-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Today's Tasks</span>
          </button>

          <button
            onClick={() => {
              try { triggerHaptic("light"); } catch {}
              setActiveTab("leaderboard");
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "leaderboard"
                ? "bg-teal-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy size={14} />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* TAB 1: THE 21-DAY JOURNEY MAP */}
      {activeTab === "journey" && (
        <div className="px-4 py-2 space-y-4">
          {/* Phase 1 Accordion Card */}
          <div className="bg-slate-900/90 border border-teal-500/20 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <CheckCircle2 size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Phase 1: Carb Awareness</h3>
                  <span className="text-[10px] text-emerald-400 font-bold">Days 1–7 • 100% Completed ✅</span>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400">+400 XP</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {CHALLENGE_CURRICULUM.filter((d) => d.phase === 1).map((item) => (
                <div
                  key={item.day}
                  className="flex items-center justify-between p-2.5 bg-white/5 rounded-2xl border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                      ✓
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">Day {item.day}: {item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-400">+{item.points} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phase 2 Current Active Card */}
          <div className="bg-gradient-to-b from-slate-900 to-[#0a2329] border-2 border-teal-400/50 rounded-3xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-teal-500/30 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-xl animate-pulse">
                  <Radio size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Phase 2: Swallow Revolution</h3>
                  <span className="text-[10px] text-teal-300 font-bold">Days 8–14 • Currently Active ⚡</span>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400">+400 XP</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {CHALLENGE_CURRICULUM.filter((d) => d.phase === 2).map((item) => {
                const isCurrent = item.day === currentDayNumber;
                return (
                  <div
                    key={item.day}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? "bg-teal-950/80 border-teal-400 shadow-md scale-[1.01]"
                        : "bg-white/5 border-white/5 opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                          isCurrent
                            ? "bg-amber-400 text-slate-950 animate-bounce"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.day}
                      </span>
                      <div>
                        <div className={`text-xs font-black ${isCurrent ? "text-teal-200" : "text-white"}`}>
                          {item.title}
                        </div>
                        <div className="text-[10.5px] text-slate-400 leading-tight mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-amber-400 shrink-0">+{item.points} XP</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase 3 Upcoming Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-4 space-y-3 opacity-75">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-500/20 text-purple-300 rounded-xl">
                  <LockBadge size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Phase 3: Autophagy &amp; Mastery</h3>
                  <span className="text-[10px] text-purple-300 font-bold">Days 15–21 • Unlocks in 7 Days 🔒</span>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400">+500 XP</span>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              Complete Phase 2 to unlock the Autophagy Protocol, 14-Day Doctor PDF generation, and the Certified Metabolic Champion Hall of Fame trophy!
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TODAY'S DAILY TASKS */}
      {activeTab === "daily" && (
        <div className="px-4 py-2 space-y-3">
          <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Day {currentDayNumber} Action Checklist</h3>
                <p className="text-[11px] text-slate-400">Complete tasks to earn daily XP and boost your rank!</p>
              </div>
              <span className="text-xs font-black text-teal-400 bg-teal-950 px-2.5 py-1 rounded-xl border border-teal-800">
                +140 XP Possible
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 pt-1">
              {[
                { key: "mealScan" as const, title: "Scan 1 Cultural Plate with AI Camera", pts: 50, icon: Camera },
                { key: "glycemicSwap" as const, title: "Apply 1 Glycemic Swap (e.g. 50/50 Swallow)", pts: 30, icon: Leaf },
                { key: "waterLogged" as const, title: "Hit Your 8-Glass Daily Hydration Goal", pts: 20, icon: Droplets },
                { key: "fastingDone" as const, title: "Complete 14h Intermittent Fasting Window", pts: 25, icon: Clock },
                { key: "sarahChat" as const, title: "Ask Sarah 1 Clinical Nutrition Question", pts: 15, icon: MessageSquare },
              ].map((task) => {
                const isDone = dailyTasks[task.key];
                const IconComp = task.icon;
                return (
                  <button
                    key={task.key}
                    type="button"
                    onClick={() => handleToggleTask(task.key, task.pts)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isDone
                        ? "bg-teal-950/60 border-teal-400 text-teal-200"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isDone ? "bg-teal-500 text-slate-950" : "bg-white/10 text-white"}`}>
                        <IconComp size={16} />
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDone ? "line-through text-teal-300" : "text-white"}`}>
                          {task.title}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">+{task.pts} XP</span>
                      </div>
                    </div>
                    {isDone ? (
                      <CheckCircle2 size={20} className="text-teal-400 shrink-0" />
                    ) : (
                      <Circle size={20} className="text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today's Science Capsule */}
          <div className="bg-gradient-to-br from-teal-950 to-slate-900 border border-teal-500/40 rounded-3xl p-4 flex items-start gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-2xl shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">
                🥑 Avo's Clinical Micro-Lesson
              </span>
              <p className="text-xs text-white/90 leading-relaxed mt-1">
                {currentDayInfo.scienceTip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE REGIONAL & DIASPORA LEADERBOARD */}
      {activeTab === "leaderboard" && (
        <div className="px-4 py-2 space-y-3">
          {/* Regional Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { key: "global", label: "🌍 Global Diaspora" },
              { key: "lagos", label: "🇳🇬 Lagos (NG)" },
              { key: "accra", label: "🇬🇭 Accra (GH)" },
              { key: "uk", label: "🇬🇧 London (UK)" },
              { key: "us_canada", label: "🇺🇸/🇨🇦 North America" },
            ].map((reg) => (
              <button
                key={reg.key}
                onClick={() => {
                  try { triggerHaptic("light"); } catch {}
                  setSelectedLeaderboard(reg.key);
                }}
                className={`text-[11px] font-black px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                  selectedLeaderboard === reg.key
                    ? "bg-teal-400 text-slate-950 shadow-sm"
                    : "bg-slate-900 text-slate-300 border border-white/10 hover:bg-slate-800"
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {/* Leaderboard Roster Card */}
          <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-4 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                🏆 {selectedLeaderboard.toUpperCase()} RANKINGS
              </span>
              <span className="text-[10px] text-teal-400 font-bold">Updated Live</span>
            </div>

            <div className="space-y-1.5">
              {(LEADERBOARD_DATA[selectedLeaderboard] || LEADERBOARD_DATA["global"]).map((user) => {
                const isTop3 = user.rank <= 3;
                const medalEmoji = user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `${user.rank}`;
                return (
                  <div
                    key={user.name}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      user.isCurrentUser
                        ? "bg-teal-950 border-teal-400 shadow-md ring-1 ring-teal-400/50"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 text-center font-black text-sm ${isTop3 ? "text-base" : "text-slate-400"}`}>
                        {medalEmoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{user.name}</span>
                          <span className="text-xs">{user.flag}</span>
                          {user.isCurrentUser && (
                            <span className="text-[9px] bg-teal-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-teal-300 font-semibold">{user.badge}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-amber-300">{user.points} XP</div>
                      <div className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1">
                        <Flame size={10} className="text-amber-500 fill-amber-500" />
                        <span>{user.streak}d streak</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIRAL SHARE & INVITE CARD */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-4.5 flex flex-col items-center text-center space-y-3 shadow-xl">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <Users size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Invite Friends to the Reset Challenge!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto mt-0.5">
              Challenge your family and friends in Lagos, London, or Atlanta. Earn <strong className="text-amber-400">+100 XP</strong> for every friend who joins!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={handleWhatsAppInvite}
              className="py-3 px-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <MessageSquare size={15} />
              <span>Invite via WhatsApp</span>
            </button>

            <button
              onClick={handleCopyInviteLink}
              className="py-3 px-3 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check size={15} className="text-emerald-400" />
                  <span className="text-emerald-400 font-black">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={15} className="text-teal-400" />
                  <span>Copy Challenge Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function LockBadge({ size }: { size?: number }) {
  return <Award size={size || 16} />;
}
