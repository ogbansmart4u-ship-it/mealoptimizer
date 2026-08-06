import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, ArrowLeft, CheckCircle, Leaf, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center px-6">
        <div className="mb-8">
          <Wordmark />
        </div>
        <motion.div
          className="bg-[#ffffff] border border-[#E2E8F0] rounded-2xl shadow-sm p-8 max-w-md w-full text-center"
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          <div className="w-14 h-14 rounded-full bg-[#CCFBF1] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-[#0F766E]" />
          </div>
          <h2
            className="text-xl font-bold mb-3 text-[#0F172A]"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Check Your Email
          </h2>
          <p className="text-[#64748B] mb-2 text-sm leading-relaxed">
            We sent a password reset link to{" "}
            <strong className="text-[#0F172A]">{email}</strong>.
          </p>
          <p className="text-xs text-[#94A3B8] mb-7">
            Didn&apos;t receive it? Check your spam folder or try again.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setEmailSent(false)}
              variant="outline"
              className="w-full rounded-xl border-[#E2E8F0] text-[#374151] hover:bg-[#F8FAFC]"
            >
              Send Again
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl font-semibold"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Back to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col">
      {/* Back nav */}
      <div className="px-6 pt-10">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-[#0F766E] text-sm font-medium hover:text-[#115E59] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Login</span>
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
            Forgot Password?
          </h2>
          <p className="text-sm text-[#475569] text-center mb-7 leading-relaxed">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-[#ffffff] border-[#CBD5E1] rounded-xl focus-visible:ring-[#0F766E] focus-visible:border-[#0F766E]"
                  required
                />
              </div>
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
                  Sending...
                </span>
              ) : "Send Reset Link"}
            </Button>
          </form>

          {/* Back to Login */}
          <p className="text-center mt-6 text-sm text-[#475569]">
            Remember your password?{" "}
            <Link to="/login" className="text-[#0F766E] font-medium hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
