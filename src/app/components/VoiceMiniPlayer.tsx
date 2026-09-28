import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  X, 
  RotateCcw, 
  Sparkles,
  Volume2
} from "lucide-react";
import { 
  subscribeVoicePlayer, 
  getVoicePlayerState, 
  toggleSarahPlayPause, 
  pauseSarahSpeech, 
  resumeSarahSpeech, 
  setSarahPlaybackRate, 
  seekSarahSpeech, 
  seekSarahToPercentage, 
  stopSarahSpeech,
  VoicePlayerState 
} from "../services/voiceService";
import { triggerHaptic } from "../utils/celebration";

const SPEED_OPTIONS = [1.0, 1.25, 1.5, 0.9];

const NAV_ROUTES = new Set([
  "/home",
  "/health",
  "/goals",
  "/logs",
  "/fasting",
  "/food-wisdom",
  "/profile",
]);

export default function VoiceMiniPlayer() {
  const location = useLocation();
  const [playerState, setPlayerState] = useState<VoicePlayerState>(getVoicePlayerState);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeVoicePlayer((newState) => {
      setPlayerState(newState);
    });
    return () => unsubscribe();
  }, []);

  const hasBottomNav = NAV_ROUTES.has(location.pathname);

  if (!playerState.isActive) {
    return null;
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("medium");
    toggleSarahPlayPause();
  };

  const handleSkipBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("light");
    seekSarahSpeech(-10);
  };

  const handleCycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("light");
    const currentRate = playerState.playbackRate || 1.0;
    const currentIndex = SPEED_OPTIONS.findIndex((s) => Math.abs(s - currentRate) < 0.05);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    const nextRate = SPEED_OPTIONS[nextIndex];
    setSarahPlaybackRate(nextRate);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("light");
    stopSarahSpeech();
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    triggerHaptic("light");
    seekSarahToPercentage(percentage);
  };

  return (
    <AnimatePresence>
      <motion.aside
        key="sarah-voice-mini-player"
        aria-label="Sarah Voice Mini-Player"
        initial={{ y: 90, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 90, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className={`fixed inset-x-3.5 sm:inset-x-6 max-w-lg mx-auto z-50 select-none ${
          hasBottomNav
            ? "bottom-[calc(5rem+env(safe-area-inset-bottom))] sm:bottom-20"
            : "bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:bottom-6"
        }`}
      >
        <div className="bg-stone-900/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-emerald-500/40 text-white rounded-2xl shadow-2xl p-3 relative overflow-hidden ring-1 ring-white/10">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-10 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl pointer-events-none" />

          {/* Top content row: Avatar, Info, Controls */}
          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Left: Avatar with pulsing speech ring + Info */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-[#164E3D] border border-emerald-400/40 flex items-center justify-center text-lg shadow-md ${
                    playerState.isPlaying ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-stone-900 animate-pulse" : ""
                  }`}
                >
                  👩🏾‍💼
                </div>
                {playerState.isPlaying && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                    {playerState.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold text-emerald-300 truncate">
                    {playerState.subtitle || "Sarah AI Voice"}
                  </span>
                  {playerState.duration > 0 && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Controls (Skip -10s, Speed Pill, Play/Pause, Close) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Skip Back 10s */}
              {playerState.duration > 0 && (
                <button
                  type="button"
                  onClick={handleSkipBack}
                  className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw size={15} />
                  <span className="text-[9px] font-bold ml-0.5 font-mono">10</span>
                </button>
              )}

              {/* Speed Multiplier Pill */}
              <button
                type="button"
                onClick={handleCycleSpeed}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-emerald-300 border border-white/10 transition-all cursor-pointer font-mono"
                title={`Playback speed: ${playerState.playbackRate}x (tap to cycle)`}
              >
                {playerState.playbackRate ? `${playerState.playbackRate}x` : "1.0x"}
              </button>

              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                title={playerState.isPlaying ? "Pause audio" : "Play audio"}
              >
                {playerState.isPlaying ? (
                  <Pause size={16} className="fill-current" />
                ) : (
                  <Play size={16} className="fill-current ml-0.5" />
                )}
              </button>

              {/* Dismiss / Stop */}
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="Stop & Close player"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Scrubbable Progress Bar */}
          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            className="w-full bg-stone-800/90 h-1.5 rounded-full overflow-hidden mt-2.5 cursor-pointer relative group"
            title="Click to seek"
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-150"
              style={{
                width: `${playerState.progress || 0}%`,
              }}
            />
            {/* Hover seeker dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                left: `${playerState.progress || 0}%`,
              }}
            />
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
