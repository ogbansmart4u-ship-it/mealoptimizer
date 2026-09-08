import React, { useState, useEffect } from "react";
import {
  X,
  Target,
  User,
  Scale,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  Check,
  Sparkles,
  HeartPulse,
  Activity,
  Flame,
  Shield,
  Loader2,
  Soup,
  Zap,
  Pill,
  Rocket,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { useUser } from "../contexts/UserContext";
import { useMascot } from "../hooks/useMascot";
import { updateUserProfile } from "../../lib/api";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { soundEffects } from "../utils/soundEffects";

interface HealthProfileWizardModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function HealthProfileWizardModal({
  isOpen,
  onComplete,
}: HealthProfileWizardModalProps) {
  const { profile, updateProfile } = useUser();
  const mascot = useMascot();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [activeGesture, setActiveGesture] = useState<string>("writing");

  // Step 1: Health Goals (Multi-Select)
  const [healthGoals, setHealthGoals] = useState<string[]>([
    "Control Blood Sugar & Prevent Spikes",
  ]);

  // Step 2: Cultural Diet (Multi-Select)
  const [culturalDiets, setCulturalDiets] = useState<string[]>([
    "Nigerian (Egusi, Jollof, Yam, Eba, Soups)",
  ]);

  // Step 3: Daily Hurdles (Multi-Select)
  const [mainHurdles, setMainHurdles] = useState<string[]>([
    "Heavy swallows & late-night eating (Pounded Yam, Eba, Fufu)",
  ]);

  // Step 4: Medications (Multi-Select)
  const [medications, setMedications] = useState<string[]>([
    "None / I only manage through healthy food",
  ]);

  // Step 5: Biometrics & BMI
  const [ageRange, setAgeRange] = useState("30-45");
  const [gender, setGender] = useState("Female");
  const [weightKg, setWeightKg] = useState("74");
  const [targetWeightKg, setTargetWeightKg] = useState("68");
  const [heightCm, setHeightCm] = useState("168");

  // Step 6: Commitment Pace
  const [pace, setPace] = useState("21-Day Rapid Jumpstart");

  // Derived BMI calculation
  const w = parseFloat(weightKg) || 74;
  const h = parseFloat(heightCm) / 100 || 1.68;
  const bmi = (w / (h * h)).toFixed(1);

  // Trigger Avo note taking on step transition
  useEffect(() => {
    setActiveGesture("writing");
    try {
      mascot.write();
    } catch {}
  }, [step]);

  const triggerNoteTaking = () => {
    try {
      soundEffects.playTactileTick();
    } catch {}
    try {
      triggerHaptic("light");
    } catch {}
    setActiveGesture("writing");
    try {
      mascot.write();
    } catch {}
  };

  const toggleHealthGoal = (goal: string) => {
    triggerNoteTaking();
    setHealthGoals((prev) => {
      if (prev.includes(goal)) {
        if (prev.length === 1) return prev;
        return prev.filter((g) => g !== goal);
      } else {
        return [...prev, goal];
      }
    });
  };

  const toggleCulturalDiet = (diet: string) => {
    triggerNoteTaking();
    setCulturalDiets((prev) => {
      if (prev.includes(diet)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== diet);
      } else {
        return [...prev, diet];
      }
    });
  };

  const toggleMainHurdle = (hurdle: string) => {
    triggerNoteTaking();
    setMainHurdles((prev) => {
      if (prev.includes(hurdle)) {
        if (prev.length === 1) return prev;
        return prev.filter((h) => h !== hurdle);
      } else {
        return [...prev, hurdle];
      }
    });
  };

  const toggleMedication = (med: string) => {
    triggerNoteTaking();
    setMedications((prev) => {
      if (med.includes("None")) {
        return [med];
      }
      const filtered = prev.filter((m) => !m.includes("None"));
      if (filtered.includes(med)) {
        if (filtered.length === 1) return ["None / I only manage through healthy food"];
        return filtered.filter((m) => m !== med);
      } else {
        return [...filtered, med];
      }
    });
  };

  const handleNext = () => {
    try {
      soundEffects.playBubblePop();
    } catch {}
    try {
      triggerHaptic("medium");
    } catch {}

    if (step < 6) {
      setStep(step + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleDismiss = () => {
    try {
      triggerHaptic("light");
    } catch {}
    localStorage.setItem("mealoptimiza_questionnaire_completed", "true");
    localStorage.setItem("hasCompletedHealthSetup", "true");
    localStorage.setItem("onboardingComplete", "true");
    onComplete();
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      triggerHaptic("milestone");
    } catch {}
    setActiveGesture("jumping");
    try {
      mascot.jump();
    } catch {}

    try {
      const goalStr = healthGoals.join(", ");
      const dietStr = culturalDiets.join(", ");
      const hurdleStr = mainHurdles.join(", ");
      const medStr = medications.join(", ");

      const numericAge =
        ageRange === "18-29" ? 25 : ageRange === "30-45" ? 38 : ageRange === "46-60" ? 52 : 65;

      const updates = {
        age: numericAge,
        bmi: parseFloat(bmi) || 24.2,
        weight: weightKg.trim() || "74",
        targetWeight: targetWeightKg.trim() || "68",
        height: heightCm.trim() || "168",
        bloodPressure: "120/80",
        systolic: 120,
        diastolic: 80,
        gender: gender.toLowerCase() as "male" | "female",
        medicalCondition: goalStr,
        medications: medStr,
      };

      // Persist directly to localStorage
      localStorage.setItem("userGoal", goalStr);
      localStorage.setItem("userDiet", dietStr);
      localStorage.setItem("userHurdle", hurdleStr);
      localStorage.setItem("userMedication", medStr);
      localStorage.setItem("userWeight", weightKg);
      localStorage.setItem("targetWeight", targetWeightKg);
      localStorage.setItem("userHeight", heightCm);
      localStorage.setItem("userPace", pace);
      localStorage.setItem("mealoptimiza_questionnaire_completed", "true");
      localStorage.setItem("hasCompletedHealthSetup", "true");
      localStorage.setItem("onboardingComplete", "true");

      await updateUserProfile(updates);
      updateProfile({
        ...(profile as any),
        ...updates,
      });

      try {
        soundEffects.playCelebrationChime();
      } catch {}
      try {
        triggerConfetti("fireworks");
      } catch {}
      try {
        mascot.doubleThumbsUp();
      } catch {}

      toast.success("Health Blueprint Ready! 🥑", {
        description: "Your customized low-glycemic African meal roadmap has been calibrated.",
      });

      onComplete();
    } catch (err) {
      console.warn("Profile calibration notice:", err);
      localStorage.setItem("mealoptimiza_questionnaire_completed", "true");
      localStorage.setItem("hasCompletedHealthSetup", "true");
      localStorage.setItem("onboardingComplete", "true");
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-lg p-5 sm:p-7 rounded-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-teal-100 dark:border-zinc-800 shadow-2xl">
        {/* Step Indicator Header with Animated 3D Avo Scribe */}
        <div className="flex items-center justify-between border-b border-teal-100/60 dark:border-zinc-800 pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <Mascot gesture={activeGesture} size={50} className="shrink-0 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9.5px] uppercase font-black tracking-wider bg-teal-50 text-[#1f7a8c] dark:bg-teal-950/70 dark:text-teal-300 px-2 py-0.2 rounded-full border border-teal-200 dark:border-teal-800">
                  Question {step} of 6
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                  ✍️ Avo Scribe
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {step === 1 && "Primary Health Priorities 🎯"}
                {step === 2 && "Cultural Cuisine & Swallows 🍲"}
                {step === 3 && "Daily Food Hurdles ⚡"}
                {step === 4 && "Medications & Supplements 💊"}
                {step === 5 && "Biometrics & Body Baseline ⚖️"}
                {step === 6 && "Milestone Pace 🚀"}
              </h3>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 font-medium">
                {step === 1 && "Select all health goals that matter to you"}
                {step === 2 && "What cultural dishes do you enjoy at home?"}
                {step === 3 && "What is your biggest daily eating challenge?"}
                {step === 4 && "Select any medications or supplements taken"}
                {step === 5 && "Calculating your West African baseline BMI"}
                {step === 6 && "Choose your clinical turnaround timeline"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              title="Close and explore dashboard"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Micro Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] rounded-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* ============================================================ */}
        {/* STEP 1: HEALTH GOALS (Multi-Select)                           */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-2.5 animate-in fade-in duration-200 max-h-[50vh] overflow-y-auto pr-1">
            {[
              { title: "Control Blood Sugar & Prevent Spikes", icon: "🩺", desc: "Keep sugar steady after swallow or rice without tiredness" },
              { title: "Lower Blood Pressure & Protect Heart", icon: "🫀", desc: "Cut excess salt in stews and protect arteries & kidneys" },
              { title: "Stomach Ulcer, Heartburn & Acid Relief", icon: "🥣", desc: "Calm stomach burning and enjoy cultural food without pain" },
              { title: "Healthy Pregnancy & Baby Growth", icon: "🤰", desc: "Eat right for baby, prevent swollen feet & high sugar" },
              { title: "Men's Health & Easy Urination (40+)", icon: "🩺", desc: "Support prostate health, easy sleep & active vitality" },
              { title: "Joint Pain, Arthritis & Stiffness", icon: "🦴", desc: "Ease knee/joint pain and move freely without swelling" },
              { title: "Menopause & Hot Flash Relief", icon: "🌸", desc: "Cool down hot flashes, balance mood & keep bones strong" },
              { title: "Burn Belly Fat & Lose Weight", icon: "⚖️", desc: "Trim waistline while still eating satisfying cultural meals" },
              { title: "Build Muscle & Healthy Weight Gain", icon: "💪", desc: "Gain healthy weight, build muscle & stamina with nutrient-dense African meals" },
              { title: "Boost Daily Energy & General Wellness", icon: "🧬", desc: "Feel lighter, sleep better & stay energized all day" },
            ].map((item) => {
              const isSelected = healthGoals.includes(item.title);
              return (
                <div
                  key={item.title}
                  onClick={() => toggleHealthGoal(item.title)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 shadow-xs"
                      : "bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-teal-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                        {item.title}
                      </span>
                      <span className="text-[10.5px] text-zinc-500 block truncate">{item.desc}</span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#1f7a8c] border-[#1f7a8c] text-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CULTURAL DIET (Multi-Select)                          */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            {[
              { name: "Nigerian (Egusi, Jollof, Yam, Eba, Soups)", icon: "🇳🇬" },
              { name: "Ghanaian (Banku, Fufu, Waakye, Shito)", icon: "🇬🇭" },
              { name: "Afro-Caribbean (Rice & Peas, Callaloo, Plantain)", icon: "🇯🇲" },
              { name: "East / Southern African (Ugali, Sadza, Braai)", icon: "🌍" },
              { name: "Continental & Diaspora Fusion", icon: "🌐" },
            ].map((diet) => {
              const isSelected = culturalDiets.includes(diet.name);
              return (
                <div
                  key={diet.name}
                  onClick={() => toggleCulturalDiet(diet.name)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 shadow-xs"
                      : "bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-teal-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{diet.icon}</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {diet.name}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#1f7a8c] border-[#1f7a8c] text-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: DAILY HURDLES (Multi-Select)                         */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            {[
              { label: "Heavy swallows & late-night eating (Pounded Yam, Eba, Fufu)", icon: "🍚" },
              { label: "Feeling tired or sleepy after rice & carb meals", icon: "📈" },
              { label: "Sweet drinks, malt & fried snacks (Puff puff, Dodo)", icon: "🥤" },
              { label: "Not sure how to make cultural dishes healthier without losing taste", icon: "👩🏾‍🍳" },
            ].map((hurdle) => {
              const isSelected = mainHurdles.includes(hurdle.label);
              return (
                <div
                  key={hurdle.label}
                  onClick={() => toggleMainHurdle(hurdle.label)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 shadow-xs"
                      : "bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-teal-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{hurdle.icon}</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {hurdle.label}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#1f7a8c] border-[#1f7a8c] text-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: MEDICATIONS (Multi-Select)                           */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 animate-in fade-in duration-200">
            {[
              { label: "Blood Sugar / Diabetes Medicine (Metformin, Insulin, or tablets)", icon: "💉" },
              { label: "Blood Pressure Medicine (Amlodipine, Lisinopril, or water pills)", icon: "🫀" },
              { label: "Pregnancy Vitamins & Tonics (Folic Acid, Iron, Prenatal)", icon: "🤰" },
              { label: "Prostate / Urine Flow Medicine (Tamsulosin, Saw Palmetto, herbal)", icon: "🩺" },
              { label: "Painkillers & Joint Medicine (Ibuprofen, Diclofenac, Arthritis tablets)", icon: "🦴" },
              { label: "Ulcer & Heartburn Medicine (Omeprazole, Mist Mag, Antacids)", icon: "🥣" },
              { label: "Menopause / Hormone Supplements (Hormones or herbal relief)", icon: "🌸" },
              { label: "Cholesterol / Blood Fat Medicine (Statins or lipid tablets)", icon: "💊" },
              { label: "None / I only manage through healthy food", icon: "🌿" },
            ].map((med) => {
              const isSelected = medications.includes(med.label);
              return (
                <div
                  key={med.label}
                  onClick={() => toggleMedication(med.label)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 shadow-xs"
                      : "bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-teal-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{med.icon}</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {med.label}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-[#1f7a8c] border-[#1f7a8c] text-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: BIOMETRICS & BMI                                     */}
        {/* ============================================================ */}
        {step === 5 && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div>
              <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Age Range
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["18-29", "30-45", "46-60", "60+"].map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => {
                      triggerNoteTaking();
                      setAgeRange(ar);
                    }}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      ageRange === ar
                        ? "bg-[#1f7a8c] text-white border-[#1f7a8c] shadow-xs"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => {
                    setWeightKg(e.target.value);
                    triggerNoteTaking();
                  }}
                  className="w-full px-3 py-2 text-sm font-bold rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-center focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Target (kg)
                </label>
                <input
                  type="number"
                  value={targetWeightKg}
                  onChange={(e) => {
                    setTargetWeightKg(e.target.value);
                    triggerNoteTaking();
                  }}
                  className="w-full px-3 py-2 text-sm font-bold rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 text-[#1f7a8c] dark:text-teal-300 text-center focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => {
                  setHeightCm(e.target.value);
                  triggerNoteTaking();
                }}
                className="w-full px-3 py-2 text-sm font-bold rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-center focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Calculated BMI Badge */}
            <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center">
              <span className="text-[10.5px] uppercase tracking-wider font-bold text-teal-700 dark:text-teal-400 block">
                Calculated Baseline BMI
              </span>
              <div className="text-xl font-black text-[#1f7a8c] dark:text-teal-300">
                {bmi} <span className="text-xs font-semibold text-zinc-500">kg/m²</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 6: COMMITMENT PACE                                      */}
        {/* ============================================================ */}
        {step === 6 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {[
              {
                name: "21-Day Rapid Jumpstart",
                badge: "MOST POPULAR 🔥",
                desc: "Immediate post-meal glucose stabilization, drop in evening sugar spikes, and 2-4kg weight reset.",
                icon: "⚡",
              },
              {
                name: "90-Day Clinical Reversal",
                badge: "SUSTAINABLE 🌿",
                desc: "Long-term A1c reduction below 6.0%, arterial blood pressure normalization, and permanent cultural eating habits.",
                icon: "🌍",
              },
            ].map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  triggerNoteTaking();
                  setPace(p.name);
                }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  pace === p.name
                    ? "border-[#1f7a8c] bg-teal-50 dark:bg-teal-950/50 shadow-md"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-teal-300 bg-white dark:bg-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    {p.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed mt-1">
                  {p.desc}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-3">
          {step === 1 ? (
            <button
              onClick={handleDismiss}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs font-semibold hover:underline cursor-pointer"
            >
              Skip for now
            </button>
          ) : (
            <button
              onClick={() => {
                try {
                  triggerHaptic("light");
                } catch {}
                setStep(step - 1);
              }}
              className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}

          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] hover:opacity-95 text-white font-black px-6 py-2.5 rounded-2xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calibrating...</span>
              </>
            ) : step === 6 ? (
              <>
                <span>Complete Blueprint 🎉</span>
                <Sparkles size={14} />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight size={14} />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
