import { Calendar, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OnboardingProgress from "../components/OnboardingProgress";
import { useUser } from "../contexts/UserContext";
import { updateUserProfile } from "../../lib/api";

export default function Age() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();
  const [birthDate, setBirthDate] = useState("1990-01-01");
  const [gender, setGender] = useState<"male" | "female" | "other">("female");
  const [saving, setSaving] = useState(false);

  // Prefill from the saved profile so returning users see their real data.
  useEffect(() => {
    if (profile?.birthDate) setBirthDate(profile.birthDate);
    if (profile?.gender) setGender(profile.gender);
  }, [profile?.birthDate, profile?.gender]);

  const calculateAge = () => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getLifeStage = (age: number) => {
    if (age < 13) return { stage: "Child", icon: "👶", color: "from-blue-400 to-blue-500" };
    if (age < 20) return { stage: "Teenager", icon: "🧒", color: "from-purple-400 to-purple-500" };
    if (age < 40) return { stage: "Young Adult", icon: "👤", color: "from-green-400 to-green-500" };
    if (age < 60) return { stage: "Middle Age", icon: "👨", color: "from-yellow-400 to-yellow-500" };
    return { stage: "Senior", icon: "👴", color: "from-orange-400 to-orange-500" };
  };

  const age = calculateAge();
  const lifeStage = getLifeStage(age);

  const handleContinue = async () => {
    setSaving(true);
    // Update local context immediately (persists to localStorage, survives reload).
    updateProfile({ age, gender, birthDate });
    // Best-effort backend sync of the age biometric.
    if (profile) {
      try {
        await updateUserProfile({
          name: profile.name,
          age,
          bmi: profile.bmi,
          medicalCondition: profile.medicalCondition,
          location: profile.location,
          profilePicture: profile.profilePicture,
        });
      } catch (e) {
        console.warn("Age backend sync failed; kept locally", e);
      }
    }
    setSaving(false);
    navigate("/medications");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-8">
      {/* Header */}
      <div className="bg-[#1f7a8c] px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl text-white flex-1">Age & Gender</h1>
          <Calendar className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Onboarding Progress */}
      <div className="px-6 mt-6">
        <OnboardingProgress currentStep={3} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Current Age Display */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Your Age</h2>
          <div className={`bg-gradient-to-r ${lifeStage.color} rounded-2xl p-8 text-center text-white mb-4`}>
            <div className="text-6xl mb-3">{lifeStage.icon}</div>
            <div className="text-5xl mb-2">{age}</div>
            <div className="text-xl">years old</div>
            <div className="text-sm mt-2 opacity-90">{lifeStage.stage}</div>
          </div>
        </div>

        {/* Birth Date Input */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Date of Birth</h2>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full text-lg text-center text-[#1f7a8c] bg-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#4ecdc4]"
          />
        </div>

        {/* Gender Selection */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">Gender</h2>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setGender("male")}
              className={`p-6 rounded-2xl transition-all ${
                gender === "male"
                  ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-lg"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="text-4xl mb-2">👨</div>
              <div className="text-sm">Male</div>
            </button>
            <button
              onClick={() => setGender("female")}
              className={`p-6 rounded-2xl transition-all ${
                gender === "female"
                  ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-lg"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="text-4xl mb-2">👩</div>
              <div className="text-sm">Female</div>
            </button>
            <button
              onClick={() => setGender("other")}
              className={`p-6 rounded-2xl transition-all ${
                gender === "other"
                  ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-lg"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="text-4xl mb-2">⚧</div>
              <div className="text-sm">Other</div>
            </button>
          </div>
        </div>

        {/* Age-Based Nutrition Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#e63946] mb-4">Nutrition Needs for Your Age</h2>
          <div className="space-y-3 text-sm text-gray-700">
            {age < 20 && (
              <>
                <div className="flex gap-3">
                  <span className="text-xl">🥛</span>
                  <p>High calcium intake for bone development</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">💪</span>
                  <p>Adequate protein for growth and development</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🧠</span>
                  <p>Omega-3 fatty acids for brain development</p>
                </div>
              </>
            )}
            {age >= 20 && age < 40 && (
              <>
                <div className="flex gap-3">
                  <span className="text-xl">⚡</span>
                  <p>Balanced macronutrients for active lifestyle</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🥗</span>
                  <p>Plenty of vegetables and whole grains</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">💧</span>
                  <p>Stay well-hydrated throughout the day</p>
                </div>
              </>
            )}
            {age >= 40 && age < 60 && (
              <>
                <div className="flex gap-3">
                  <span className="text-xl">🦴</span>
                  <p>Focus on bone health with calcium and vitamin D</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">❤️</span>
                  <p>Heart-healthy fats and fiber-rich foods</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🥦</span>
                  <p>Antioxidant-rich foods to combat aging</p>
                </div>
              </>
            )}
            {age >= 60 && (
              <>
                <div className="flex gap-3">
                  <span className="text-xl">💊</span>
                  <p>Vitamin B12 and D supplementation may be needed</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🍗</span>
                  <p>Lean protein to maintain muscle mass</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🧠</span>
                  <p>Brain-boosting nutrients for cognitive health</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/medications")}
            className="px-6 py-4 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
