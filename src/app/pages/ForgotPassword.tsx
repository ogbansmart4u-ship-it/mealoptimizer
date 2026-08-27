import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Clock,
  KeyRound,
  AlertCircle,
  ChevronRight,
  Send,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import Mascot from "../components/Mascot";
import AmbientBackground from "../components/AmbientBackground";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer for resending
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    triggerHaptic("medium");
    setLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
      setResendCooldown(60);
      triggerConfetti("burst");
      triggerHaptic("success");
      toast.success("Password reset link dispatched! Check your inbox 📬");
    } catch (error: any) {
      console.error("Password reset error:", error);
      triggerHaptic("error");
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    triggerHaptic("medium");
    setLoading(true);
    try {
      await resetPassword(email);
      setResendCooldown(60);
      triggerConfetti("confetti");
      triggerHaptic("success");
      toast.success("A fresh reset link was sent to your email!");
    } catch (err: any) {
      toast.error(err?.message || "Could not resend email");
    } finally {
      setLoading(false);
    }
  };

  const openEmailClient = () => {
    triggerHaptic("light");
    if (email.endsWith("@gmail.com")) {
      window.open("https://mail.google.com", "_blank");
    } else if (email.endsWith("@yahoo.com")) {
      window.open("https://mail.yahoo.com", "_blank");
    } else if (email.endsWith("@outlook.com") || email.endsWith("@hotmail.com")) {
      window.open("https://outlook.live.com", "_blank");
    } else {
      window.open("mailto:" + email, "_self");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Background */}
      <AmbientBackground />

      {/* Top Navbar / Back Button */}
      <div className="relative z-10 px-6 pt-8 pb-4 max-w-md w-full mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-teal-100 dark:border-zinc-700 text-[#1f7a8c] dark:text-teal-300 text-xs font-bold shadow-2xs hover:bg-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Login</span>
        </button>

        <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-200 bg-teal-50/80 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200">
          Account Security 🔐
        </span>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {emailSent ? (
              /* ======================================================= */
              /* STATE 2: 10X "CHECK YOUR EMAIL" SHOWCASE               */
              /* ======================================================= */
              <motion.div
                key="email-sent-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-teal-200 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative Top Accent Light */}
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

                {/* Mascot Avo Cheering Rig */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative mb-2">
                    <Mascot gesture="thumbsup" size={100} />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md animate-bounce">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>

                  {/* Speech Bubble */}
                  <div className="bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 rounded-2xl px-3.5 py-1.5 text-xs text-teal-900 dark:text-teal-200 font-bold mb-3 shadow-2xs">
                    🥑 Avo: "I just dispatched your reset link!"
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100">
                    Check Your Inbox 📬
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 max-w-xs">
                    We sent a secure 1-tap recovery link to:
                  </p>
                  
                  {/* Email Pill Badge */}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50/90 dark:bg-zinc-800 border border-teal-200 text-[#1f7a8c] dark:text-teal-300 font-black text-xs break-all">
                    <Mail size={13} className="shrink-0" />
                    <span>{email}</span>
                  </div>
                </div>

                {/* 3 Security Pillars */}
                <div className="grid grid-cols-3 gap-1.5 bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-2xl border border-slate-100 dark:border-zinc-700/80 mb-5 text-[10px] text-center">
                  <div className="space-y-0.5">
                    <ShieldCheck size={14} className="mx-auto text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-gray-700 dark:text-zinc-300 block">256-Bit Encrypted</span>
                  </div>
                  <div className="space-y-0.5 border-x border-slate-200 dark:border-zinc-700">
                    <Clock size={14} className="mx-auto text-teal-600 dark:text-teal-400" />
                    <span className="font-bold text-gray-700 dark:text-zinc-300 block">Valid 1 Hour</span>
                  </div>
                  <div className="space-y-0.5">
                    <KeyRound size={14} className="mx-auto text-amber-600 dark:text-amber-400" />
                    <span className="font-bold text-gray-700 dark:text-zinc-300 block">Single-Use Link</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5">
                  {/* Direct Launch Email App Button */}
                  <button
                    onClick={openEmailClient}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#1f7a8c] via-[#2a9d8f] to-[#4ecdc4] hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open Email App</span>
                    <ExternalLink size={14} />
                  </button>

                  {/* Resend Cooldown Button */}
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className={"w-full py-3 px-4 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-2 cursor-pointer " + (
                      resendCooldown > 0
                        ? "bg-gray-100 dark:bg-zinc-800 text-gray-400 border-gray-200 dark:border-zinc-700 cursor-not-allowed"
                        : "bg-white dark:bg-zinc-800 hover:bg-slate-50 text-gray-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 shadow-2xs active:scale-95"
                    )}
                  >
                    <RefreshCw size={13} className={resendCooldown > 0 ? "animate-spin text-gray-400" : "text-teal-600"} />
                    <span>
                      {resendCooldown > 0
                        ? "Resend available in " + resendCooldown + "s"
                        : "Resend Reset Link"}
                    </span>
                  </button>

                  {/* Change Email Address */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-[11px] text-teal-700 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      Wrong email address? Click to change
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ======================================================= */
              /* STATE 1: 10X INPUT CARD WITH AVO WELCOME               */
              /* ======================================================= */
              <motion.div
                key="input-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-teal-200 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                {/* Top Center Mascot with Friendly Greeting */}
                <div className="flex flex-col items-center text-center mb-6">
                  <Mascot gesture="wave" size={90} />
                  
                  {/* Avo Dialogue */}
                  <div className="bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 rounded-2xl px-3.5 py-1.5 text-xs text-teal-900 dark:text-teal-200 font-bold mt-2 mb-2 shadow-2xs">
                    🥑 Avo: "Forgot your password? I've got you covered!"
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100">
                    Reset Your Password
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Enter your registered account email and we'll send you a secure 1-tap recovery link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="email" className="text-xs font-black text-gray-800 dark:text-zinc-200 block">
                      Account Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-white dark:bg-zinc-800 border-2 border-teal-100 dark:border-zinc-700 rounded-2xl text-xs font-semibold focus:border-[#1f7a8c] focus:ring-2 focus:ring-[#1f7a8c]/20 transition-all shadow-xs"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-700/60 text-[11px] text-gray-600 dark:text-zinc-400">
                    <ShieldCheck size={15} className="text-teal-600 shrink-0 mt-0.5" />
                    <span>Your account data and biometric logs remain strictly encrypted.</span>
                  </div>

                  {/* Send Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#1f7a8c] via-[#2a9d8f] to-[#4ecdc4] hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Sending Recovery Link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 1-Tap Recovery Link</span>
                        <Send size={14} />
                      </>
                    )}
                  </Button>
                </form>

                {/* Back to Login Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 text-center">
                  <p className="text-xs text-gray-600 dark:text-zinc-400">
                    Remember your password?{" "}
                    <Link
                      to="/login"
                      className="text-[#1f7a8c] dark:text-teal-400 font-extrabold hover:underline inline-flex items-center gap-0.5"
                    >
                      Log in here <ChevronRight size={13} />
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 pb-6 text-center text-[11px] text-teal-800/80 dark:text-teal-400/80 font-bold">
        <span>🥗 MealOptimiza · Clinical Nutrition &amp; Metabolic Health</span>
      </div>
    </div>
  );
}
