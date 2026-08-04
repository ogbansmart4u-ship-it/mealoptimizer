import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Leaf, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { signUp as apiSignUp } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { motion, useReducedMotion } from "motion/react";

const ease = [0, 0, 0.2, 1] as const;

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

export default function SignUp() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const reduced = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const name = formData.fullName.trim();

    // --- inline validation ---
    const errors: typeof fieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Enter a valid email address (e.g. you@example.com)";
    }
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);
    console.log('=== SIGNUP: posting to server ===', { email, name });

    try {
      // 1. POST to the server route — uses publicAnonKey Bearer header internally
      await apiSignUp({
        email,
        password,
        name: name || email,
        age: 0,
        bmi: 0,
        medicalCondition: "none",
        location: "Nigeria",
      });

      console.log('✅ Server signup succeeded, creating session...');

      // 2. Establish a Supabase session so API calls work immediately
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.error('❌ signInWithPassword after signup failed:', signInError);
        // Account was created — tell the user to log in manually
        toast.success("Account created! Please log in.", { duration: 6000 });
        navigate("/login");
        return;
      }

      console.log('✅ Session created for', data.user?.email);
      localStorage.setItem("onboardingComplete", "true");
      toast.success("Welcome to MealOptimiza! 🎉");
      navigate("/home");
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      const msg: string = err.message ?? "Sign up failed. Please try again.";
      // Surface specific server messages inline
      if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("exist")) {
        setFieldErrors({ email: "This email is already registered. Try logging in." });
      } else if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
        setFieldErrors({ email: "This email is already registered. Try logging in." });
      } else if (msg.toLowerCase().includes("password")) {
        setFieldErrors({ password: msg });
      } else {
        setFieldErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    setOauthLoading('google');
    try {
      await signInWithGoogle();
      toast.info("Redirecting to Google...");
    } catch (error: any) {
      console.error("Google sign-up error:", error);
      if (error.message?.includes('not enabled')) {
        toast.error(
          "Google sign-up is not configured yet. Please use email/password or contact support.",
          { duration: 6000 }
        );
      } else {
        toast.error(error.message || "Failed to sign up with Google. Please try again.");
      }
    } finally {
      setOauthLoading(null);
    }
  };

  const handleAppleSignUp = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    setOauthLoading('apple');
    try {
      await signInWithApple();
      toast.info("Redirecting to Apple...");
    } catch (error: any) {
      console.error("Apple sign-up error:", error);
      if (error.message?.includes('not enabled')) {
        toast.error(
          "Apple sign-up is not configured yet. Please use email/password or contact support.",
          { duration: 6000 }
        );
      } else {
        toast.error(error.message || "Failed to sign up with Apple. Please try again.");
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
            Create your account
          </h2>
          <p className="text-sm text-[#64748B] text-center mb-7">Join MealOptimiza today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General error */}
            {fieldErrors.general && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {fieldErrors.general}
              </p>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-[#374151]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="pl-10 h-12 bg-[#ffffff] border-[#CBD5E1] rounded-xl focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-[#374151]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={`pl-10 h-12 bg-[#ffffff] rounded-xl focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] ${fieldErrors.email ? 'border-red-400' : 'border-[#CBD5E1]'}`}
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#374151]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className={`pl-10 pr-10 h-12 bg-[#ffffff] rounded-xl focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] ${fieldErrors.password ? 'border-red-400' : 'border-[#CBD5E1]'}`}
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
              {fieldErrors.password
                ? <p className="text-xs text-red-600">{fieldErrors.password}</p>
                : <p className="text-xs text-[#94A3B8]">Must be at least 6 characters</p>
              }
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#374151]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={`pl-10 pr-10 h-12 bg-[#ffffff] rounded-xl focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E] ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-[#CBD5E1]'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-0.5 border-[#CBD5E1] data-[state=checked]:bg-[#0F766E] data-[state=checked]:border-[#0F766E]"
              />
              <label htmlFor="terms" className="text-sm text-[#64748B] leading-snug cursor-pointer">
                I agree to the{" "}
                <Link to="/terms" className="text-[#0F766E] hover:underline font-medium">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-[#0F766E] hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white h-12 rounded-xl shadow-sm font-semibold transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-px active:scale-[0.97] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 disabled:opacity-60 disabled:pointer-events-none"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </span>
              ) : "Create Account"}
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

          {/* Social Sign Up */}
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-center gap-3 bg-[#ffffff] border border-[#E2E8F0] rounded-xl py-3 hover:bg-[#F8FAFC] hover:scale-[1.01] transition-all duration-200 ease-out text-sm font-medium text-[#1E293B] disabled:opacity-50"
              onClick={handleGoogleSignUp}
              disabled={oauthLoading === 'google'}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            <button
              className="w-full flex items-center justify-center gap-3 bg-[#0F172A] text-white rounded-xl py-3 hover:bg-[#1E293B] hover:scale-[1.01] transition-all duration-200 ease-out text-sm font-medium disabled:opacity-50"
              onClick={handleAppleSignUp}
              disabled={oauthLoading === 'apple'}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign up with Apple
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-[#475569]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0F766E] font-medium hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
