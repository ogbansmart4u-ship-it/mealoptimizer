import { Calendar, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import OnboardingProgress from "../components/OnboardingProgress";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { updateUserProfile } from "../../lib/api";

export default function Age() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();
  const { t } = useLanguage();
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
    if (age < 13) return { stageKey: "age.stage.child", icon: "👶", color: "from-blue-400 to-blue-500" };
    if (age < 20) return { stageKey: "age.stage.teen", icon: "🧒", color: "from-purple-400 to-purple-500" };
    if (age < 40) return { stageKey: "age.stage.youngAdult", icon: "👤", color: "from-green-400 to-green-500" };
    if (age < 60) return { stageKey: "age.stage.middleAge", icon: "👨", color: "from-yellow-400 to-yellow-500" };
    return { stageKey: "age.stage.senior", icon: "👴", color: "from-orange-400 to-orange-500" };
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
          <h1 className="text-2xl text-white flex-1">{t("age.title")}</h1>
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
          <h2 className="text-lg text-[#1f7a8c] mb-4">{t("age.yourAge")}</h2>
          <div className={`bg-gradient-to-r ${lifeStage.color} rounded-2xl p-8 text-center text-white mb-4`}>
            <div className="text-6xl mb-3">{lifeStage.icon}</div>
            <div className="text-5xl mb-2">{age}</div>
            <div className="text-xl">{t("age.yearsOld")}</div>
            <div className="text-sm mt-2 opacity-90">{t(lifeStage.stageKey)}</div>
          </div>
        </div>

        {/* Birth Date Input */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">{t("age.dob")}</h2>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full text-lg text-center text-[#1f7a8c] bg-gray-50 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#4ecdc4]"
          />
        </div>

        {/* Gender Selection */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#1f7a8c] mb-4">{t("age.gender")}</h2>
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
              <div className="text-sm">{t("goalsetup.sex.male")}</div>
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
              <div className="text-sm">{t("goalsetup.sex.female")}</div>
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
              <div className="text-sm">{t("goalsetup.sex.other")}</div>
            </button>
          </div>
        </div>

        {/* Age-Based Nutrition Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#e63946] mb-4">{t("age.nutritionTitle")}</h2>
          <div className="space-y-3 text-sm text-gray-700">
            {age < 20 && (
              <>
                <div className="flex gap-3">
                  <span className="text-xl">🥛</span>
                  <p>{t("age.tip.teen1")}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">💪</span>
                  <p>{t("age.tip.teen2")}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🧠</span>
                  <p>{t("age.tip.teen3")}</p>
                </div>
              </>
            )}
            {age >= 20 && age < 40 && (
              <>
                <div className="flex gap-3">
                  <span className="text-xl">⚡</span>
                  <p>{t("age.tip.young1")}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🥗</span>
                  <p>{t("age.tip.young2")}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">💧</span>
                  <p>{t("age.tip.young3")}</p>
                </div>
              </>
            )}
            {age >= 40 && age < 60 && (
              <>
                <div className="flex gap-3">
                  <span className="text-xl">🦴</span>
                  <p>{t("age.tip.mid1")}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">❤️</span>
                  <p>{t("age.tip.mid2")}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🥦</span>
                  <p>{t("age.tip.mid3")}</p>
                </div>
              </>
            )}
            {age >= 60 && (
              <>
                <div className="flex gap-3">
                  <span className="text-xl">💊</span>
                  <p>{t("age.tip.senior1")}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🍗</span>
                  <p>{t("age.tip.senior2")}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-xl">🧠</span>
                  <p>{t("age.tip.senior3")}</p>
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
            {t("meds.skip")}
          </button>
          <button
            onClick={handleContinue}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            {saving ? t("profile.saving") : t("goalsetup.continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
