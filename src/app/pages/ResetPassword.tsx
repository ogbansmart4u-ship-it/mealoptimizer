import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import logoImage from "../../assets/efbe2a1ac833b032474ac203bb52c6fe4e93cfbb.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Check if we have a valid recovery token
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (!accessToken || type !== 'recovery') {
      toast.error("Invalid or expired reset link. Please request a new one.");
      setTimeout(() => navigate("/forgot-password"), 3000);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Password updated successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl mb-4 text-gray-800">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been updated. You can now log in with your new password.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-xl"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-[#1f7a8c] mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Login</span>
        </button>

        <div className="text-center mb-8">
          <div className="mb-4">
            <img
              src={logoImage}
              alt="MealOptimiza"
              className="h-20 mx-auto"
              style={{
                mixBlendMode: 'darken',
                filter: 'brightness(1.1) contrast(1.2)'
              }}
            />
          </div>
          <p className="text-gray-600">Create your new password</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md mx-auto">
          <h2 className="text-2xl text-center mb-4 text-gray-800">Reset Password</h2>
          <p className="text-center text-gray-600 mb-6 text-sm">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-12 pr-12 h-12 bg-gray-50 border-gray-200 rounded-xl"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="pl-12 pr-12 h-12 bg-gray-50 border-gray-200 rounded-xl"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#1f7a8c] hover:bg-[#1a6273] text-white h-12 rounded-xl shadow-lg"
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>

      <div className="pb-8"></div>
    </div>
  );
}
