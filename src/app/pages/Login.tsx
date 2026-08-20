import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Leaf,
  Loader2,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import Mascot from "../components/Mascot";
import WhatsAppConnectDialog from "../components/WhatsAppConnectDialog";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";
import { motion, useReducedMotion } from "motion/react";
import type { MascotGesture } from "../types/mascot";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const reduced = useReducedMotion();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [mascotGesture, setMascotGesture] = useState<MascotGesture>("wave");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in both email and password");
      return;
    }

    setLoading(true);
    setMascotGesture("thinking");
    triggerHaptic("medium");

    try {
      await signIn(formData.email.trim(), formData.password);
      setMascotGesture("celebrate");
      triggerHaptic("success");
      toast.success("Welcome back! Loading your metabolic dashboard...", {
        duration: 2500,
      });
      setTimeout(() => navigate("/home"), 400);
    } catch (error: any) {
      setMascotGesture("idle");
      triggerHaptic("heavy");
      console.error("Login error:", error);

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
      } else {
        toast.error("Could not sign in", {
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
      <div className="px-5 pt-8 sm:pt-10 flex items-center justify-between max-w-md mx-auto w-full">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-[#1f7a8c] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("common.back")}</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-teal-800 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full border border-teal-100/60 shadow-xs">
          <Sparkles size={12} className="text-teal-600" />
          <span>Metabolic Health OS</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="px-5 py-6 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Mascot & Welcome Greeting Header */}
        <motion.div
          className="text-center mb-5 flex flex-col items-center"
          initial={{ opacity: 0, y: reduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <div className="relative mb-2">
            <Mascot gesture={mascotGesture} size={72} className="drop-shadow-md" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome Back! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Your personalized cultural glucose shield is ready
          </p>
        </motion.div>

        {/* 10X Card Container */}
        <motion.div
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-teal-100 dark:border-zinc-800 rounded-3xl shadow-xl p-6 sm:p-7 transition-all"
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease }}
        >
          {/* Quick Social One-Tap Auth */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button
              onClick={handleGoogleSignIn}
              disabled={oauthLoading === "google"}
              className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all text-xs font-bold text-slate-800 dark:text-zinc-200 shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {oauthLoading === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              ) : (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA3323"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>Google</span>
            </button>

            <button
              onClick={handleAppleSignIn}
              disabled={oauthLoading === "apple"}
              className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-zinc-800 text-white rounded-2xl py-2.5 px-3 hover:bg-black dark:hover:bg-zinc-700 transition-all text-xs font-bold shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {oauthLoading === "apple" ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
              <span>Apple</span>
            </button>
          </div>

          {/* Clean Modern Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="px-3 bg-white dark:bg-zinc-900 text-slate-400">or sign in with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field with Autofill & Keychain Ready */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs font-bold text-slate-800 dark:text-zinc-200 block"
              >
                {t("auth.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-11 sm:h-12 bg-slate-50/70 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 rounded-2xl focus-visible:ring-[#1f7a8c] text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field with Autofill & Keychain Ready */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-slate-800 dark:text-zinc-200 block"
                >
                  {t("auth.password")}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-[#1f7a8c] dark:text-teal-400 hover:underline"
                >
                  {t("auth.forgot")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-11 sm:h-12 bg-slate-50/70 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 rounded-2xl focus-visible:ring-[#1f7a8c] text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] hover:from-[#176270] hover:to-[#227f74] text-white h-12 rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer mt-1 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging In...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <span>Sign In to Dashboard</span>
                  <Zap size={15} />
                </span>
              )}
            </Button>
          </form>

          {/* 1-Tap WhatsApp AI Fast Login */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold transition-all border border-emerald-200 active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare size={14} className="text-[#25D366]" />
              <span>1-Tap WhatsApp AI Fast Connect</span>
            </button>
          </div>

          {/* Sign Up Redirect */}
          <p className="text-center mt-5 text-xs text-slate-600 font-medium">
            {t("auth.noAccount")}{" "}
            <Link
              to="/signup"
              className="text-[#1f7a8c] dark:text-teal-400 font-extrabold hover:underline"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Production-Grade Security & Trust Seal Footer (Replaces Debug box) */}
      <div className="pb-6 px-6 text-center max-w-md mx-auto w-full">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 font-semibold mb-1.5">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-teal-600" />
            <span>256-Bit Encrypted</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>HIPAA &amp; NDPR Private</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Leaf size={13} className="text-teal-700" />
            <span>Cultural Nutrition</span>
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          MealOptimizer &copy; {new Date().getFullYear()} • Engineered for African &amp; Diaspora Health
        </p>
      </div>

      {/* WhatsApp Fast Connect Modal */}
      <WhatsAppConnectDialog
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </div>
  );
}
