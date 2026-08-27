import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import Mascot from "../components/Mascot";
import AmbientBackground from "../components/AmbientBackground";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Check if we have a valid recovery session / token
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      // 1. Check for PKCE 'code' in query params and exchange
      const code = searchParams.get("code");
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && isMounted) {
            setHasValidSession(true);
            return;
          }
        } catch {}
      }

      // 2. Check hash params
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");

      if (accessToken && type === "recovery") {
        if (isMounted) setHasValidSession(true);
        return;
      }

      // 3. Check existing active session
      const { data } = await supabase.auth.getSession();
      if (data?.session && isMounted) {
        setHasValidSession(true);
        return;
      }
    };

    checkSession();

    // 4. Listen for PASSWORD_RECOVERY auth event
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        if (isMounted) setHasValidSession(true);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      triggerHaptic("error");
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      triggerHaptic("warning");
      toast.error("Password must be at least 6 characters");
      return;
    }

    triggerHaptic("medium");
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      setIsSuccess(true);
      triggerConfetti("burst");
      triggerHaptic("success");
      toast.success("Password updated successfully! 🎉");

      // Redirect to login after 2.5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error: any) {
      console.error("Password reset error:", error);
      triggerHaptic("error");
      toast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] flex flex-col justify-between relative overflow-hidden">
      {/* Ambient Background */}
      <AmbientBackground />

      {/* Top Navbar */}
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

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-6">
        <div className="w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              /* Success State */
              <motion.div
                key="success-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-emerald-300 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden"
              >
                <div className="flex flex-col items-center mb-4">
                  <Mascot gesture="jump" size={100} />
                  <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl px-3.5 py-1.5 text-xs text-emerald-900 dark:text-emerald-200 font-bold mt-2 mb-3 shadow-2xs">
                    🥑 Avo: "Woohoo! Your account is secure!"
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100">
                    Password Reset Complete! 🎉
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1.5 max-w-xs leading-relaxed">
                    Your new password has been saved. You'll be automatically redirected to log in now.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-lg cursor-pointer"
                >
                  Go to Login Now 🔐
                </Button>
              </motion.div>
            ) : (
              /* Form State */
              <motion.div
                key="form-card"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.3 }}
                className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-2 border-teal-200 dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <Mascot gesture="thumbsup" size={90} />
                  
                  <div className="bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 rounded-2xl px-3.5 py-1.5 text-xs text-teal-900 dark:text-teal-200 font-bold mt-2 mb-2 shadow-2xs">
                    🥑 Avo: "Create a fresh, strong password!"
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100">
                    Set New Password
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                    Choose a password with at least 6 characters to secure your MealOptimiza account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1 text-left">
                    <label htmlFor="password" className="text-xs font-black text-gray-800 dark:text-zinc-200 block">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter at least 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10 h-12 bg-white dark:bg-zinc-800 border-2 border-teal-100 dark:border-zinc-700 rounded-2xl text-xs font-semibold focus:border-[#1f7a8c]"
                        required
                        minLength={6}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1 text-left">
                    <label htmlFor="confirmPassword" className="text-xs font-black text-gray-800 dark:text-zinc-200 block">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10 pr-10 h-12 bg-white dark:bg-zinc-800 border-2 border-teal-100 dark:border-zinc-700 rounded-2xl text-xs font-semibold focus:border-[#1f7a8c]"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#1f7a8c] via-[#2a9d8f] to-[#4ecdc4] hover:opacity-95 text-white rounded-2xl font-black text-xs shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Save New Password</span>
                      </>
                    )}
                  </Button>
                </form>
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
