import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Leaf,
  Loader2,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Zap,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Mascot from "../components/Mascot";
import AppLogo from "../components/AppLogo";
import WhatsAppConnectDialog from "../components/WhatsAppConnectDialog";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import type { MascotGesture } from "../types/mascot";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user, signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const reduced = useReducedMotion();

  // If user arrived via password recovery, redirect to /reset-password; otherwise redirect to /home if authenticated
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash || "" : "";
    const search = typeof window !== "undefined" ? window.location.search || "" : "";
    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      navigate(`/reset-password${search}${hash}`, { replace: true });
      return;
    }
    if (user?.id) {
      navigate("/home", { replace: true });
    }
  }, [user?.id, navigate]);

  // Tab State: Smart default to "signup" for new visitors and "login" for returning users
  const isInitialSignUp = location.pathname === "/signup" || location.pathname === "/direct-signup";
  const [authMode, setAuthMode] = useState<"signup" | "login">(() => {
    if (isInitialSignUp) return "signup";
    try {
      const hasPreviousSession = localStorage.getItem("mealoptimiza_has_account");
      return hasPreviousSession === "true" ? "login" : "signup";
    } catch {
      return "signup";
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [mascotGesture, setMascotGesture] = useState<MascotGesture>("wave");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleModeSwitch = (mode: "signup" | "login") => {
    triggerHaptic("light");
    setAuthMode(mode);
    setMascotGesture(mode === "signup" ? "celebrate" : "wave");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (authMode === "signup") {
      if (!formData.fullName.trim()) {
        toast.error("Please enter your full name");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (!agreedToTerms) {
        toast.error("Please agree to the Terms & Privacy Policy to continue");
        return;
      }
    }

    setLoading(true);
    setMascotGesture("thinking");
    triggerHaptic("medium");

    try {
      if (authMode === "login") {
        await signIn(email, password);
        try { localStorage.setItem("mealoptimiza_has_account", "true"); } catch {}
        setMascotGesture("celebrate");
        triggerHaptic("success");
        toast.success("Welcome back! Loading your healthy meal dashboard...", {
          duration: 2500,
        });
        setTimeout(() => navigate("/home"), 400);
      } else {
        // Sign Up Flow
        localStorage.setItem(
          "pendingSignup",
          JSON.stringify({
            email,
            password,
            fullName: formData.fullName.trim(),
          })
        );
        try { localStorage.setItem("mealoptimiza_has_account", "true"); } catch {}
        setMascotGesture("celebrate");
        triggerHaptic("success");
        toast.success("Account created! Let's personalize your daily meal plan.", {
          duration: 2500,
        });
        setTimeout(() => navigate("/onboarding"), 400);
      }
    } catch (error: any) {
      setMascotGesture("idle");
      triggerHaptic("heavy");
      console.error("Auth error:", error);

      const msg = error?.message || "";
      if (msg.includes("Invalid login credentials") || msg.includes("invalid_grant")) {
        toast.error("Invalid email or password", {
          description: "Please check your details or tap 'Forgot Password' below.",
          action: {
            label: "Reset",
            onClick: () => navigate("/forgot-password"),
          },
          duration: 6000,
        });
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Email not confirmed", {
          description: "Please click the confirmation link sent to your inbox, then sign in.",
          duration: 7000,
        });
      } else if (msg.includes("already registered") || msg.includes("User already registered")) {
        toast.error("Account already exists", {
          description: "Switching you to sign in...",
          duration: 4000,
        });
        setAuthMode("login");
      } else {
        toast.error("Authentication failed", {
          description: msg || "Please check your connection and try again.",
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading("google");
    triggerHaptic("light");
    try {
      await signInWithGoogle();
      toast.info("Connecting to Google...");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.message?.includes("not enabled")) {
        toast.error("Google sign-in is coming soon! Please use email/password for now.", {
          duration: 5000,
        });
      } else {
        toast.error(error.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setOauthLoading("apple");
    triggerHaptic("light");
    try {
      await signInWithApple();
      toast.info("Connecting to Apple...");
    } catch (error: any) {
      console.error("Apple sign-in error:", error);
      if (error.message?.includes("not enabled")) {
        toast.error("Apple sign-in is coming soon! Please use email/password for now.", {
          duration: 5000,
        });
      } else {
        toast.error(error.message || "Failed to sign in with Apple. Please try again.");
      }
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F7F9F8] flex flex-col justify-between selection:bg-teal-200">
      {/* Top Header Bar */}
      <div className="px-5 pt-7 sm:pt-8 flex items-center justify-between max-w-md mx-auto w-full">
        <div className="flex items-center">
          <AppLogo size="sm" />
        </div>

        {/* 🥑 CONSUMER-FRIENDLY SMART NUTRITION AI BADGE (Replaced confusing 'Metabolic OS') */}
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-teal-900 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-teal-200/80 shadow-xs">
          <Sparkles size={12} className="text-amber-500" />
          <span>Smart Food &amp; Health AI</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="px-4 sm:px-5 py-5 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Mascot & Dynamic Personalized Greeting Header */}
        <motion.div
          className="text-center mb-4 flex flex-col items-center"
          initial={{ opacity: 0, y: reduced ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <div className="relative mb-2">
            <Mascot gesture={mascotGesture} size={70} className="drop-shadow-md" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          {/* Dynamic Headline Based on Mode */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {authMode === "signup" ? "Start Your Health Journey 🥑" : "Welcome Back! 👋"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-xs">
            {authMode === "signup"
              ? "Enjoy delicious African meals with personalized blood sugar & blood pressure balance"
              : "Sign in to continue your healthy food diary & daily tips"}
          </p>
        </motion.div>

        {/* 10X Card Container */}
        <motion.div
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-teal-100 dark:border-zinc-800 rounded-3xl shadow-xl p-5 sm:p-7 transition-all"
          initial={{ opacity: 0, y: reduced ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.05, ease }}
        >
          {/* Friendly Health Quiz Launcher */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              navigate("/onboarding");
            }}
            className="w-full mb-4 p-2.5 bg-gradient-to-r from-teal-500 via-teal-600 to-[#1f7a8c] text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="p-1 bg-white/20 rounded-xl text-base">🩺</span>
              <div className="text-left">
                <div className="text-[10.5px] font-black uppercase tracking-wider text-teal-100">
                  New to MealOptimiza?
                </div>
                <div className="text-xs font-bold text-white">
                  Take the 45s Healthy Food Quiz ➔
                </div>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 🌟 10X SEGMENTED TAB SWITCHER (Create Account vs Sign In) */}
          <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => handleModeSwitch("signup")}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-extrabold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("login")}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-extrabold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* SSO Google & Apple Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={oauthLoading !== null}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/80 transition-all text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {oauthLoading === "google" ? (
                <Loader2 size={15} className="animate-spin text-teal-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={oauthLoading !== null}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-900 bg-slate-950 hover:bg-slate-900 transition-all text-xs font-bold text-white shadow-2xs active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {oauthLoading === "apple" ? (
                <Loader2 size={15} className="animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.85-12-14.44-6.19-9.47-10.97-20.21-14.34-32.22-3.37-12-5.06-23.47-5.06-34.4 0-14.7 3.59-27.1 10.76-37.21 7.18-10.12 16.32-15.34 27.43-15.66 4.79 0 10.33 1.25 16.63 3.75 6.31 2.5 10.32 3.86 12.04 4.08 2.39-.43 6.64-1.89 12.74-4.38 6.1-2.49 11.42-3.65 15.98-3.48 11.96.65 21.64 4.9 29.04 12.74-10.44 6.31-15.56 15.12-15.34 26.43.22 8.92 3.69 16.31 10.44 22.19 6.74 5.87 14.68 9.14 23.82 9.79-2.18 6.74-4.89 13.27-8.15 19.58zM119.22 31.84c0-7.39 2.61-14.35 7.83-20.88 5.22-6.53 11.85-10.55 19.9-12.07.22 1.09.33 2.18.33 3.26 0 7.39-2.72 14.57-8.15 21.53-5.44 6.96-12.18 10.87-20.23 11.74-.22-1.2-.33-2.4-.33-3.58z" />
                </svg>
              )}
              <span>Apple</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute">
              {authMode === "signup" ? "Or Register with Email" : "Or Sign In with Email"}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === "signup" && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ngozi / Tunde"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {authMode === "login" && (
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-bold text-[#1f7a8c] hover:underline"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-11 rounded-2xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authMode === "signup" && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repeat your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10 h-11 rounded-2xl border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/50 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    className="mt-0.5 rounded-md"
                  />
                  <label htmlFor="terms" className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                    I agree to the{" "}
                    <Link to="/terms" target="_blank" className="text-[#1f7a8c] font-bold underline">
                      Terms of Service
                    </Link>{" "}
                    &amp;{" "}
                    <Link to="/privacy" target="_blank" className="text-[#1f7a8c] font-bold underline">
                      Privacy Policy
                    </Link>.
                  </label>
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-teal-900/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {authMode === "signup" ? "Creating Account..." : "Signing in..."}
                </span>
              ) : (
                <>
                  <span>{authMode === "signup" ? "Create Free Account" : "Sign In to Dashboard"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          {/* 1-Tap WhatsApp AI Fast Connect */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 mt-4">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setShowWhatsAppModal(true);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <MessageSquare size={15} className="text-emerald-600" />
              <span>1-Tap WhatsApp AI Fast Connect</span>
            </button>
          </div>
        </motion.div>

        {/* Security & Regulatory Trust Badge */}
        <div className="mt-4 text-center text-[10.5px] text-slate-500 space-y-1">
          <div className="flex items-center justify-center gap-1 text-teal-800 dark:text-teal-400 font-semibold">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>256-Bit Encrypted • NDPR &amp; HIPAA-Aligned Privacy</span>
          </div>
          <p className="text-[9.5px] text-slate-400">
            Certified Cultural Glycemic Indices &amp; Dietary Guidelines
          </p>
        </div>
      </div>

      <WhatsAppConnectDialog isOpen={showWhatsAppModal} onClose={() => setShowWhatsAppModal(false)} />
    </div>
  );
}
