import { useNavigate } from "react-router";
import { ArrowLeft, Heart, Target, Users, Sparkles, Shield, Leaf, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5]">
      {/* Header */}
      <div className="bg-[#1f7a8c] px-6 pt-12 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-2xl text-white">About MealOptimiza</h1>
        </div>
        <p className="text-[#B8E5E5] text-sm">Your personalized health companion</p>
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* Mission Statement */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#1f7a8c] to-[#4ecdc4] rounded-full p-3">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Our Mission</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            MealOptimiza is dedicated to revolutionizing personal health management by combining nutrition
            optimization, comprehensive health tracking, and intelligent meal planning. We believe that everyone
            deserves access to personalized nutrition advice tailored to their unique health profile and local food
            availability.
          </p>
        </div>

        {/* What We Do */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">What We Do</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="bg-[#4ecdc4] rounded-full p-2 h-fit">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Personalized Nutrition</h3>
                <p className="text-sm text-gray-600">
                  AI-powered meal recommendations based on your health goals, medical conditions, BMI, and dietary
                  preferences.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-[#1f7a8c] rounded-full p-2 h-fit">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Comprehensive Health Tracking</h3>
                <p className="text-sm text-gray-600">
                  Track workouts, sleep, hydration, medications, symptoms, fasting, and biometrics all in one place.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-[#e63946] rounded-full p-2 h-fit">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Local Food Engineering</h3>
                <p className="text-sm text-gray-600">
                  Smart meal plans that utilize locally available ingredients, reducing food waste and supporting
                  sustainable eating.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-[#f77f00] rounded-full p-2 h-fit">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Smart Analysis</h3>
                <p className="text-sm text-gray-600">
                  Analyze food through photos, uploads, or barcode scanning to get instant nutritional insights and
                  compatibility with your health profile.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Key Features</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-100">
              <p className="text-sm font-semibold text-gray-800">🍽️ Meal Planning</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-100">
              <p className="text-sm font-semibold text-gray-800">💪 Workout Logger</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100">
              <p className="text-sm font-semibold text-gray-800">😴 Sleep Tracker</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-100">
              <p className="text-sm font-semibold text-gray-800">💧 Hydration</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100">
              <p className="text-sm font-semibold text-gray-800">⏱️ Fasting Timer</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-100">
              <p className="text-sm font-semibold text-gray-800">🩺 Symptom Tracker</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
              <p className="text-sm font-semibold text-gray-800">💊 Medications</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-pink-100">
              <p className="text-sm font-semibold text-gray-800">🏥 Medical Vault</p>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#e63946] to-[#f77f00] rounded-full p-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Your Privacy Matters</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-3">
            We take your privacy seriously. All your health data is stored securely and encrypted. We never share your
            personal information with third parties without your explicit consent.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4ecdc4] rounded-full"></div>
              <p className="text-sm text-gray-600">End-to-end encryption for sensitive data</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4ecdc4] rounded-full"></div>
              <p className="text-sm text-gray-600">HIPAA-compliant medical record storage</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4ecdc4] rounded-full"></div>
              <p className="text-sm text-gray-600">No third-party data selling</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#4ecdc4] rounded-full"></div>
              <p className="text-sm text-gray-600">You control your data</p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Our Values</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-[#1f7a8c] pl-4">
              <h3 className="font-semibold text-gray-800">Accessibility</h3>
              <p className="text-sm text-gray-600">
                Health optimization should be available to everyone, regardless of their background or location.
              </p>
            </div>
            <div className="border-l-4 border-[#4ecdc4] pl-4">
              <h3 className="font-semibold text-gray-800">Sustainability</h3>
              <p className="text-sm text-gray-600">
                Promoting local food systems and reducing waste through intelligent meal planning.
              </p>
            </div>
            <div className="border-l-4 border-[#e63946] pl-4">
              <h3 className="font-semibold text-gray-800">Empowerment</h3>
              <p className="text-sm text-gray-600">
                Giving you the tools and knowledge to take control of your health journey.
              </p>
            </div>
            <div className="border-l-4 border-[#f77f00] pl-4">
              <h3 className="font-semibold text-gray-800">Innovation</h3>
              <p className="text-sm text-gray-600">
                Continuously improving through AI and user feedback to provide the best experience.
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#4ecdc4] to-[#1f7a8c] rounded-full p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Our Team</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            MealOptimiza was built by a passionate team of nutritionists, software engineers, data scientists, and
            health professionals who believe in the power of personalized nutrition and comprehensive health tracking.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our diverse expertise allows us to create a holistic health platform that addresses not just what you eat,
            but how you move, sleep, recover, and thrive.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] rounded-3xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-3">Get In Touch</h2>
          <p className="text-[#B8E5E5] mb-4">
            Have questions, feedback, or suggestions? We'd love to hear from you!
          </p>
          <div className="space-y-2 text-sm">
            <p>📧 Email: support@mealoptimiza.com</p>
            <p>🌐 Web: www.mealoptimiza.com</p>
            <p>📱 Follow us on social media @mealoptimiza</p>
          </div>
        </div>

        {/* Version */}
        <div className="text-center pb-4">
          <p className="text-sm text-gray-500 mb-2">MealOptimiza v1.0.0</p>
          <p className="text-xs text-gray-400">
            Built with ❤️ for your health and wellness
          </p>
        </div>

        {/* Back Button */}
        <Button
          onClick={() => navigate("/profile")}
          className="w-full bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-2xl py-6"
        >
          Back to Profile
        </Button>
      </div>
    </div>
  );
}
