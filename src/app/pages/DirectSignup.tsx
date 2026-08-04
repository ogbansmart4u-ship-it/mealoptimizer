import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

// Simple direct signup for testing - bypasses onboarding
export default function DirectSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('=== DIRECT SIGNUP TEST ===');
      console.log('Email:', formData.email);
      console.log('Password length:', formData.password.length);

      await signUp(formData.email, formData.password, {
        name: "Test User",
        test_account: true,
      });

      toast.success("Account created successfully!", {
        description: "You can now log in with these credentials"
      });

      console.log('✅ Account created successfully');
      console.log('Redirecting to login...');

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Direct signup error:", error);
      toast.error("Signup failed: " + error.message, {
        description: "Check console (F12) for details"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl text-center mb-2 text-gray-800">Direct Signup Test</h1>
        <p className="text-sm text-center text-gray-600 mb-6">
          Quick account creation for testing (bypasses onboarding)
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-2">Email</label>
            <Input
              type="email"
              placeholder="test@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-2">Password (min 6 chars)</label>
            <Input
              type="password"
              placeholder="password123"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-12"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1f7a8c] hover:bg-[#1a6273] h-12"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Test Account"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 mb-2"><strong>Instructions:</strong></p>
          <ol className="text-xs text-yellow-800 space-y-1 list-decimal list-inside">
            <li>Enter email and password</li>
            <li>Click "Create Test Account"</li>
            <li>Check browser console (F12) for details</li>
            <li>If successful, you'll be redirected to login</li>
            <li>Log in with the same credentials</li>
          </ol>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-sm text-[#1f7a8c] hover:underline"
          >
            ← Back to Normal Signup
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2"><strong>Common Issues:</strong></p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Email confirmation enabled → Check Supabase settings</li>
            <li>• Email already exists → Try different email</li>
            <li>• Password too short → Use 6+ characters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
