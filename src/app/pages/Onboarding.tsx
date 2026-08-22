import { useState } from "react";
import { ChevronRight, MapPin, Target, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import logoImage from "../../assets/efbe2a1ac833b032474ac203bb52c6fe4e93cfbb.png";
import { useAppMode } from "../contexts/AppModeContext";
import { useAuth } from "../contexts/AuthContext";
import { EMAIL_CONFIRMATION_REQUIRED } from "../../lib/supabase";
import { toast } from "sonner";

type OnboardingStep = "welcome" | "location" | "goal" | "mode" | "complete";

export default function Onboarding() {
  const navigate = useNavigate();
  const { setMode } = useAppMode();
  const { signUp } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [location, setLocation] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [selectedMode, setSelectedMode] = useState<"simple" | "expert">("simple");
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setMode(selectedMode);
    setIsCompleting(true);

    try {
      // Check if there's a pending signup from the signup page
      const pendingSignupData = localStorage.getItem("pendingSignup");

      if (pendingSignupData) {
        const signupData = JSON.parse(pendingSignupData);

        try {
          console.log('=== ONBOARDING SIGNUP ===');
          console.log('Creating account for:', signupData.email);
          console.log('With profile:', { location, primaryGoal, selectedMode });

          // Create account directly with Supabase Auth (same as DirectSignup)
          await signUp(signupData.email, signupData.password, {
            name: signupData.fullName,
            location: location,
            goal: primaryGoal,
            mode: selectedMode,
          });

          console.log('✅ Account created successfully via onboarding');

          // Clear pending signup data
          localStorage.removeItem("pendingSignup");

          // Store onboarding completion
          localStorage.setItem("onboardingComplete", "true");
          localStorage.setItem("hasCompletedHealthSetup", "true");
          localStorage.setItem("userLocation", location);
          localStorage.setItem("userGoal", primaryGoal);

          toast.success("Welcome to MealOptimiza! 🎉", {
            description: "Your account has been created successfully"
          });

          // Wait a moment for auth state to update
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Navigate to home - user is already signed in from signUp
          navigate("/home");
        } catch (signupError: any) {
          console.error("❌ Onboarding signup error:", signupError);
          console.error('Error details:', {
            message: signupError.message,
            email: signupData.email
          });

          // Show detailed error to user
          let errorMessage = signupError.message || "Failed to create account";

          if (errorMessage === EMAIL_CONFIRMATION_REQUIRED || errorMessage.includes(EMAIL_CONFIRMATION_REQUIRED)) {
            // Account created but Supabase requires email confirmation before login
            localStorage.removeItem("pendingSignup");
            localStorage.setItem("onboardingComplete", "true");
            localStorage.setItem("userLocation", location);
            localStorage.setItem("userGoal", primaryGoal);
            toast.success("Account created! Check your email 📧", {
              description: `We sent a confirmation link to ${signupData.email}. Click it, then come back to log in.`,
              duration: 10000,
            });
            setTimeout(() => navigate("/login"), 3000);
            return;
          } else if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
            toast.error("This email is already registered", {
              description: "Redirecting you to login instead...",
              duration: 3000
            });
            localStorage.removeItem("pendingSignup");
            setTimeout(() => navigate("/login"), 2000);
          } else if (errorMessage.includes('Invalid email')) {
            toast.error("Invalid email format", {
              description: "Please use a valid email address",
              duration: 5000
            });
            localStorage.removeItem("pendingSignup");
            setTimeout(() => navigate("/signup"), 2000);
          } else if (errorMessage.includes('Password')) {
            toast.error("Password issue: " + errorMessage, {
              description: "Password must be at least 6 characters",
              duration: 5000
            });
            localStorage.removeItem("pendingSignup");
            setTimeout(() => navigate("/signup"), 2000);
          } else {
            toast.error("Signup failed: " + errorMessage, {
              description: "Try using Direct Signup (/direct-signup) instead",
              duration: 6000
            });
            console.log('💡 User can try /direct-signup as alternative');
          }
          return;
        }
      } else {
        console.log('⚠️ No pending signup data - redirecting to signup');
        toast.info("Please complete the signup form first");
        navigate("/signup");
      }
    } catch (error: any) {
      console.error("Onboarding completion error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Welcome Step */}
        {step === "welcome" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="mb-6 flex justify-center">
              <img 
                src={logoImage} 
                alt="MealOptimiza Logo" 
                className="h-20 object-contain"
              />
            </div>

            <div className="mb-8">
              <div className="text-6xl mb-4">🍲</div>
              <h2 className="text-2xl text-gray-800 mb-4">Welcome!</h2>
              <p className="text-gray-600 leading-relaxed">
                We'll help you eat healthier with foods you love and can actually find in your local market.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Get personalized meal plans with local Nigerian foods</span>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Know exactly where to buy ingredients in your city</span>
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Manage health conditions through smart food choices</span>
              </div>
            </div>

            <button
              onClick={() => setStep("location")}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Let's Get Started
              <ArrowRight className="h-5 w-5" />
            </button>

            <p className="text-xs text-gray-500 mt-4">Takes less than 60 seconds</p>
          </div>
        )}

        {/* Location Step */}
        {step === "location" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="bg-[#1f7a8c] rounded-full p-4 inline-block mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl text-gray-800 mb-2">Where are you located?</h2>
              <p className="text-gray-600 text-sm">
                We'll show you meals with ingredients available in your area
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {["Lagos, Nigeria", "Abuja, Nigeria", "Port Harcourt, Nigeria", "London, UK", "Other"].map((city) => (
                <button
                  key={city}
                  onClick={() => setLocation(city)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    location === city
                      ? "border-[#1f7a8c] bg-[#E8F5F5] shadow-md"
                      : "border-gray-200 hover:border-[#4ecdc4]"
                  }`}
                >
                  <span className="text-gray-800">{city}</span>
                </button>
              ))}
            </div>

            {location && (
              <button
                onClick={() => setStep("goal")}
                className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setStep("welcome")}
              className="w-full mt-3 text-gray-600 py-2 text-sm hover:text-gray-800"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Goal Step */}
        {step === "goal" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="bg-[#e63946] rounded-full p-4 inline-block mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl text-gray-800 mb-2">What's your main goal?</h2>
              <p className="text-gray-600 text-sm">
                We'll personalize your meal plans based on this
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "Manage Diabetes", icon: "🩺" },
                { label: "Control Blood Pressure", icon: "❤️" },
                { label: "Lose Weight", icon: "⚖️" },
                { label: "Build Muscle", icon: "💪" },
                { label: "General Wellness", icon: "🌟" },
              ].map((goal) => (
                <button
                  key={goal.label}
                  onClick={() => setPrimaryGoal(goal.label)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                    primaryGoal === goal.label
                      ? "border-[#1f7a8c] bg-[#E8F5F5] shadow-md"
                      : "border-gray-200 hover:border-[#4ecdc4]"
                  }`}
                >
                  <span className="text-2xl">{goal.icon}</span>
                  <span className="text-gray-800">{goal.label}</span>
                </button>
              ))}
            </div>

            {primaryGoal && (
              <button
                onClick={() => setStep("mode")}
                className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={() => setStep("location")}
              className="w-full mt-3 text-gray-600 py-2 text-sm hover:text-gray-800"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Mode Selection Step */}
        {step === "mode" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚙️</div>
              <h2 className="text-2xl text-gray-800 mb-2">Choose Your Experience</h2>
              <p className="text-gray-600 text-sm">
                You can always change this later in settings
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Simple Mode */}
              <button
                onClick={() => setSelectedMode("simple")}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                  selectedMode === "simple"
                    ? "border-[#1f7a8c] bg-[#E8F5F5] shadow-lg scale-[1.02]"
                    : "border-gray-200 hover:border-[#4ecdc4]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-xl p-3 text-2xl">😊</div>
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-800 mb-1 flex items-center gap-2">
                      Simple Mode
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Recommended</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Easy-to-understand language and straightforward meal suggestions
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Simple explanations like "Good for blood sugar"</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Focus on practical cooking tips</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span>Less technical jargon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expert Mode */}
              <button
                onClick={() => setSelectedMode("expert")}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                  selectedMode === "expert"
                    ? "border-[#1f7a8c] bg-[#E8F5F5] shadow-lg scale-[1.02]"
                    : "border-gray-200 hover:border-[#4ecdc4]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-xl p-3 text-2xl">🔬</div>
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-800 mb-1">Expert Mode</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Detailed nutritional science and advanced metrics
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-purple-600" />
                        <span>Macronutrient ratios (40P/30C/30F)</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-purple-600" />
                        <span>Circadian rhythm optimization</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-purple-600" />
                        <span>Bio-availability and nutrient pairing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep("complete")}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => setStep("goal")}
              className="w-full mt-3 text-gray-600 py-2 text-sm hover:text-gray-800"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl text-gray-800 mb-2">You're All Set!</h2>
              <p className="text-gray-600">
                Get ready to discover delicious, healthy meals tailored just for you
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#E8F5F5] to-[#B8E5E5] rounded-2xl p-6 mb-6">
              <h3 className="text-sm text-gray-700 mb-3">Your Profile:</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#1f7a8c]" />
                  <span className="text-sm text-gray-800">{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#e63946]" />
                  <span className="text-sm text-gray-800">{primaryGoal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedMode === "simple" ? "😊" : "🔬"}</span>
                  <span className="text-sm text-gray-800">
                    {selectedMode === "simple" ? "Simple Mode" : "Expert Mode"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 text-lg hover:shadow-lg transition-all"
              disabled={isCompleting}
            >
              {isCompleting ? "Setting up your account..." : "Start My Journey"}
            </button>

            <p className="text-xs text-gray-500 mt-4">
              You can add more details and customize your profile anytime
            </p>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {["welcome", "location", "goal", "mode", "complete"].map((s, index) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-[#1f7a8c]"
                  : index < ["welcome", "location", "goal", "mode", "complete"].indexOf(step)
                  ? "w-2 bg-[#4ecdc4]"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}