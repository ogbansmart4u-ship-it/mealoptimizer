import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Leaf, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { motion, useReducedMotion } from "motion/react";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 justify-center">
      <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] flex items-center justify-center flex-shrink-0">
        <Leaf className="h-5 w-5 text-[#0F766E]" />
      </div>
      <span
        className="font-bold text-2xl text-[#0F766E] tracking-tight"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        MealOptimiza
      </span>
    </div>
  );
}

const ease = [0, 0, 0.2, 1] as const;

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const reduced = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', formData.email);
    console.log('Password length:', formData.password.length);

    try {
      await signIn(formData.email, formData.password);
      console.log('✅ Login successful');
      toast.success("Welcome back!");
      navigate("/home");
    } catch (error: any) {
      console.error("❌ Login error:", error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });

      if (error.message.includes("Invalid login credentials")) {
        toast.error("Cannot log in", {
          description: "Wrong password, account not found, or email not yet confirmed. Check your inbox for a confirmation link and try again.",
          duration: 8000,
        });
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Email not confirmed", {
          description: "Check your inbox for a confirmation link, click it, then log in here.",
          duration: 8000,
        });
      } else {
        toast.error("Login failed: " + error.message, {
          description: "Check browser console (F12) for details",
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    try {
      await signInWithGoogle();
      toast.info("Redirecting to Google...");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.message?.includes('not enabled')) {
        toast.error(
          "Google sign-in is not configured yet. Please use email/password or contact support.",
          { duration: 6000 }
        );
      } else {
        toast.error(error.message || "Failed to sign in with Google. Please try again.");
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setOauthLoading('apple');
    try {
      await signInWithApple();
      toast.info("Redirecting to Apple...");
    } catch (error: any) {
      console.error("Apple sign-in error:", error);
      if (error.message?.includes('not enabled')) {
        toast.error(
          "Apple sign-in is not configured yet. Please use email/password or contact support.",
          { duration: 6000 }
        );
      } else {
        toast.error(error.message || "Failed to sign in with Apple. Please try again.");
      }
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col">
      {/* Back nav */}
      <div className="px-6 pt-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-[#0F766E] text-sm font-medium hover:text-[#115E59] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Logo above card */}
      <motion.div
        className="flex justify-center mt-8 mb-6"
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease }}
      >
        <Wordmark />
      </motion.div>

      {/* Card */}
      <div className="flex-1 px-6 pb-10">
        <motion.div
          className="bg-[#ffffff] border border-[#E2E8F0] rounded-2xl shadow-sm p-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease }}
        >
          <h2
            className="text-xl font-bold text-center mb-1 text-[#0F172A]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Welcome back
          </h2>
          <p className="text-sm text-[#475569] text-center mb-7">Log in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#1E293B]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 bg-[#ffffff] border-[#CBD5E1] rounded-xl focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#1E293B]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12 bg-[#ffffff] border-[#CBD5E1] rounded-xl focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right -mt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-[#0F766E] hover:text-[#115E59] hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white h-12 rounded-xl shadow-sm font-semibold transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-px active:scale-[0.97] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:opacity-60 disabled:pointer-events-none"
              style={{ fontFamily: "Manrope, sans-serif" }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </span>
              ) : "Log In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#ffffff] text-[#94A3B8] uppercase tracking-wide">or</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-center gap-3 bg-[#ffffff] border border-[#E2E8F0] rounded-xl py-3 hover:bg-[#F8FAFC] hover:scale-[1.01] transition-all duration-200 ease-out text-sm font-medium text-[#1E293B] disabled:opacity-50"
              onClick={handleGoogleSignIn}
              disabled={oauthLoading === 'google'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 bg-[#0F172A] text-white rounded-xl py-3 hover:bg-[#1E293B] hover:scale-[1.01] transition-all duration-200 ease-out text-sm font-medium disabled:opacity-50"
              onClick={handleAppleSignIn}
              disabled={oauthLoading === 'apple'}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-sm text-[#475569]">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-[#0F766E] font-medium hover:underline">
              Sign Up
            </Link>
          </p>

          {/* Debug Info */}
          <details className="mt-4">
            <summary className="text-xs text-[#94A3B8] cursor-pointer hover:text-[#64748B] text-center transition-colors">
              Troubleshooting &amp; Testing
            </summary>
            <div className="mt-2 p-3 bg-[#F8FAFC] rounded-lg text-xs text-[#475569]">
              <p className="mb-2"><strong>Can&apos;t log in?</strong></p>
              <ul className="list-disc list-inside space-y-1 mb-3">
                <li>Account doesn&apos;t exist (you need to sign up first)</li>
                <li>Wrong email or password</li>
                <li>Email confirmation required (check Supabase settings)</li>
                <li>Didn&apos;t complete onboarding after signup</li>
              </ul>
              <div className="border-t border-[#E2E8F0] pt-3 space-y-2">
                <p className="font-semibold text-[#1E293B]">Quick Options:</p>
                <Link
                  to="/direct-signup"
                  className="block bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-center hover:bg-blue-100"
                >
                  🧪 Direct Signup Test (Bypass Onboarding)
                </Link>
                <Link
                  to="/signup"
                  className="block bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E] px-3 py-2 rounded text-center hover:bg-[#CCFBF1]"
                >
                  ✨ Normal Signup (With Onboarding)
                </Link>
              </div>
            </div>
          </details>
        </motion.div>
      </div>
    </div>
  );
}
