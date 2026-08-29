import React, { useState } from "react";
import {
  Trophy,
  Award,
  Flame,
  Lock,
  CheckCircle2,
  Star,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Sparkles,
  Zap,
  Shield,
  ShieldCheck,
  Heart,
  Droplets,
  Crown,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAchievements, Achievement } from "../contexts/AchievementContext";
import AmbientBackground from "../components/AmbientBackground";
import Mascot from "../components/Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

type FilterTab = "all" | "unlocked" | "locked" | "streaks";

export default function Achievements() {
  const navigate = useNavigate();
  const { achievements, unlockedAchievements, streaks } = useAchievements();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const locked = achievements.filter(
    (a) => !unlockedAchievements.find((ua) => ua.id === a.id)
  );

  const totalXP = unlockedAchievements.length * 150 + streaks.reduce((acc, s) => acc + s.currentStreak * 25, 0);
  const currentLevel = Math.floor(totalXP / 300) + 1;
  const nextLevelXP = currentLevel * 300;
  const levelProgress = Math.min(Math.round(((totalXP % 300) / 300) * 100), 100);

  const getRankTitle = (lvl: number) => {
    if (lvl >= 5) return "Metabolic Master 👑";
    if (lvl >= 4) return "Glycemic Shield Champion 🛡️";
    if (lvl >= 3) return "African Fiber Pioneer 🌾";
    if (lvl >= 2) return "Health Habit Builder ⚡";
    return "Metabolic Explorer 🧭";
  };

  const isUnlocked = (achievementId: string) =>
    unlockedAchievements.find((a) => a.id === achievementId);

  const handleBadgeClick = (achievement: Achievement) => {
    const unlocked = isUnlocked(achievement.id);
    if (unlocked) {
      triggerHaptic("milestone");
      triggerConfetti("fireworks");
      toast.success(`🏆 Badge Claimed: ${achievement.title}! (+150 XP)`);
    } else {
      triggerHaptic("light");
      toast.info(`🔒 Requirement: ${achievement.description}`);
    }
  };

  const filteredAchievements =
    activeTab === "all"
      ? achievements
      : activeTab === "unlocked"
      ? unlockedAchievements
      : locked;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 text-slate-800 relative select-none">
      <AmbientBackground />

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-[#0b3c47] via-[#125e6d] to-[#1f7a8c] text-white pt-10 pb-6 px-5 sm:px-6 rounded-b-[2.5rem] shadow-xl border-b border-teal-500/20">
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-200 border border-amber-300/30 px-3 py-1 rounded-full text-xs font-black">
            <Crown size={14} className="text-amber-300" />
            <span>Level {currentLevel}</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-teal-200 block mb-0.5">
              Gamified Health Journey
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Metabolic Mastery Badges 🏆
            </h1>
            <p className="text-xs text-teal-100/90 font-medium mt-1">
              Earn XP, build unstoppable cultural health streaks, and level up your bio-rank.
            </p>
          </div>

          {/* Level Progress Bar Card with Celebrating Avo Mascot */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/15 shadow-sm flex items-center gap-4">
            <div className="p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-300/30 shrink-0">
              <Mascot gesture="celebrating" size={68} className="drop-shadow-lg" />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-teal-100">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-300" />
                  <span className="text-white font-extrabold">{getRankTitle(currentLevel)}</span>
                </div>
                <span className="text-amber-300 font-black">{totalXP} XP Total</span>
              </div>

              <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-700 rounded-full"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-teal-200 font-bold">
                <span>Level {currentLevel}</span>
                <span>{levelProgress}% to Level {currentLevel + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-5 relative z-10">
        {/* Streak Power Cards */}
        {streaks.length > 0 && (
          <div className="bg-white/95 rounded-3xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Flame size={16} className="text-orange-500 animate-bounce" />
                <span>Active Metabolic Streaks</span>
              </h2>
              <span className="text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                +25 XP / Day 🔥
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {streaks.map((streak) => (
                <div
                  key={streak.trackerId}
                  className="bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 rounded-2xl p-3.5 border border-orange-200/80 shadow-2xs text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700 truncate">{streak.trackerName}</span>
                    <Flame size={14} className="text-orange-500 shrink-0" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">{streak.currentStreak}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Days</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                    Best: {streak.longestStreak} days
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-1.5 shadow-sm border border-teal-100 flex items-center gap-1">
          {[
            { id: "all", label: `All (${achievements.length})` },
            { id: "unlocked", label: `🏆 Unlocked (${unlockedAchievements.length})` },
            { id: "locked", label: `🔒 Locked (${locked.length})` },
          ].map(({ id, label }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  triggerHaptic("light");
                  setActiveTab(id as FilterTab);
                }}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer text-center ${
                  active
                    ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-sm scale-[1.02]"
                    : "text-slate-600 hover:bg-slate-100 font-bold"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Avo Coach Feedback */}
        <div className="bg-gradient-to-br from-[#0b3c47] to-[#1f7a8c] text-white rounded-3xl p-4 shadow-md flex items-center gap-3.5">
          <Mascot gesture="flex" size={50} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-xs text-teal-200 uppercase tracking-wider">
              Avo Milestone Coach
            </h3>
            <p className="text-xs text-white mt-0.5 leading-snug">
              {unlockedAchievements.length === 0
                ? "Start by logging your morning meal or 4 glasses of water to claim your first badge! 🌟"
                : `Phenomenal discipline! You've claimed ${unlockedAchievements.length} badges and earned ${totalXP} XP. Keep your streak alive today!`}
            </p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAchievements.map((achievement) => {
            const unlocked = Boolean(isUnlocked(achievement.id));
            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBadgeClick(achievement)}
                className={`rounded-3xl p-4 border transition-all cursor-pointer flex items-start gap-3.5 relative overflow-hidden ${
                  unlocked
                    ? "bg-gradient-to-br from-white via-teal-50/40 to-emerald-50/40 border-teal-200 shadow-sm hover:shadow-md"
                    : "bg-slate-50/80 border-slate-200/80 opacity-70 hover:opacity-90"
                }`}
              >
                {/* Badge Icon */}
                <div
                  className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 relative ${
                    unlocked
                      ? "bg-gradient-to-br from-teal-100 to-emerald-100 shadow-xs border border-teal-200"
                      : "bg-slate-200 grayscale text-slate-400"
                  }`}
                >
                  <span>{achievement.icon}</span>
                  {unlocked ? (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                      <CheckCircle2 size={13} />
                    </div>
                  ) : (
                    <div className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full p-0.5">
                      <Lock size={12} />
                    </div>
                  )}
                </div>

                {/* Badge Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className={`text-xs font-black truncate ${unlocked ? "text-slate-900" : "text-slate-600"}`}>
                      {achievement.title}
                    </h3>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 shrink-0">
                      +150 XP
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    {achievement.description}
                  </p>

                  {/* Progress bar if locked & target exists */}
                  {!unlocked && achievement.target && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                        <span>Progress</span>
                        <span>
                          {achievement.progress || 0} / {achievement.target}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1f7a8c] rounded-full"
                          style={{
                            width: `${Math.min(
                              (((achievement.progress || 0) / achievement.target) * 100),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {unlocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 mt-1.5">
                      <Star size={11} className="fill-emerald-500 text-emerald-500" />
                      <span>Unlocked & Active</span>
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
