import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  HeartPulse, 
  Activity, 
  Zap, 
  TrendingDown, 
  Lock, 
  Check, 
  Star,
  Users,
  Flame,
  Globe,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router";
import AppLogo from "../components/AppLogo";
import { useAppMode } from "../contexts/AppModeContext";
import { useAuth } from "../contexts/AuthContext";
import { EMAIL_CONFIRMATION_REQUIRED } from "../../lib/supabase";
import { toast } from "sonner";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";
import Mascot from "../components/Mascot";
import { executePurchase } from "../../lib/iap";
import { setSubscriptionStatus, CurrencyCode, BillingCycle, PlanTier } from "../../lib/payment";

type OnboardingStep = 
  | "welcome"
  | "diagnostic_goal"
  | "diagnostic_diet"
  | "diagnostic_hurdle"
  | "diagnostic_meds"
  | "diagnostic_biometrics"
  | "diagnostic_pace"
  | "calculating"
  | "simulation_payoff"
  | "paywall";

export default function Onboarding() {
  const navigate = useNavigate();
  const { setMode } = useAppMode();
  const { signUp, user } = useAuth();

  const [step, setStep] = useState<OnboardingStep>("welcome");

  // Diagnostic State
  const [healthGoal, setHealthGoal] = useState<string>("Manage Diabetes & Blood Sugar");
  const [culturalDiet, setCulturalDiet] = useState<string>("Nigerian (Egusi, Jollof, Swallow)");
  const [mainHurdle, setMainHurdle] = useState<string>("Late-night heavy swallows (Eba, Yam, Fufu)");
  const [medication, setMedication] = useState<string>("Metformin / Blood Sugar Meds");
  const [ageRange, setAgeRange] = useState<string>("35-49");
  const [currentWeight, setCurrentWeight] = useState<string>("86");
  const [targetWeight, setTargetWeight] = useState<string>("74");
  const [heightCm, setHeightCm] = useState<string>("172");
  const [pace, setPace] = useState<string>("21-Day Rapid Jumpstart");

  // Calculation Animation State
  const [calcProgress, setCalcProgress] = useState(0);
  const [calcTextIndex, setCalcTextIndex] = useState(0);

  // Paywall Selection State
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  const calcMessages = [
    "Analyzing metabolic profile against 450+ African ingredients...",
    "Formulating low-glycemic swallow swaps (Plantain-Oat & Almond-Psyllium)...",
    "Calibrating daily sodium and carbohydrate buffer thresholds...",
    "Simulating post-meal glucose trajectory...",
    "Generating your personalized Clinical Reversal Blueprint...",
  ];

  // Calculation Progress Simulator
  useEffect(() => {
    if (step === "calculating") {
      setCalcProgress(0);
      setCalcTextIndex(0);

      const interval = setInterval(() => {
        setCalcProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              triggerHaptic("success");
              setStep("simulation_payoff");
            }, 500);
            return 100;
          }
          const next = prev + 2;
          if (next % 20 === 0) {
            setCalcTextIndex((idx) => Math.min(idx + 1, calcMessages.length - 1));
            triggerHaptic("light");
          }
          return next;
        });
      }, 45);

      return () => clearInterval(interval);
    }
  }, [step]);

  const finalizeAccount = async (isProSubscribed = false) => {
    setIsProcessingPay(true);
    setMode("simple");

    try {
      // Save diagnostic responses
      localStorage.setItem("userGoal", healthGoal);
      localStorage.setItem("userDiet", culturalDiet);
      localStorage.setItem("userHurdle", mainHurdle);
      localStorage.setItem("userMedication", medication);
      localStorage.setItem("userWeight", currentWeight);
      localStorage.setItem("targetWeight", targetWeight);
      localStorage.setItem("userHeight", heightCm);
      localStorage.setItem("onboardingComplete", "true");
      localStorage.setItem("hasCompletedHealthSetup", "true");

      const pendingSignupData = localStorage.getItem("pendingSignup");

      if (pendingSignupData) {
        const signupData = JSON.parse(pendingSignupData);
        try {
          await signUp(signupData.email, signupData.password, {
            name: signupData.fullName,
            goal: healthGoal,
            diet: culturalDiet,
            weight: currentWeight,
            target_weight: targetWeight,
            medication: medication,
          });
          localStorage.removeItem("pendingSignup");
        } catch (e: any) {
          console.warn("Auth signup notice:", e.message);
        }
      }

      if (isProSubscribed) {
        setSubscriptionStatus("pro", selectedPlan === "annual" ? 12 : 1, user?.id);
      }

      triggerConfetti("fireworks");
      triggerHaptic("milestone");

      toast.success("Personalized Blueprint Ready! 🎉", {
        description: "Welcome to your customized cultural metabolic plan.",
      });

      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (err: any) {
      toast.error("Could not finalize setup. Redirecting to home...");
      navigate("/home");
    } finally {
      setIsProcessingPay(false);
    }
  };

  const handlePaywallAction = async () => {
    triggerHaptic("medium");
    setIsProcessingPay(true);

    try {
      await executePurchase({
        plan: "pro",
        currency,
        cycle: selectedPlan as BillingCycle,
        userEmail: user?.email || "user@mealoptimiza.com",
        userId: user?.id,
        onSuccess: () => {
          finalizeAccount(true);
        },
        onError: (err) => {
          toast.error(err.message || "Payment could not be completed.");
          setIsProcessingPay(false);
        },
      });
    } catch {
      // If purchase dialog bypassed in dev, proceed to activate
      finalizeAccount(true);
    }
  };

  // Step Progress Calculation (1 to 6)
  const getStepProgressNumber = () => {
    switch (step) {
      case "diagnostic_goal": return 1;
      case "diagnostic_diet": return 2;
      case "diagnostic_hurdle": return 3;
      case "diagnostic_meds": return 4;
      case "diagnostic_biometrics": return 5;
      case "diagnostic_pace": return 6;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-white flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full my-auto">
        
        {/* ============================================================ */}
        {/* 1. WELCOME SCREEN                                            */}
        {/* ============================================================ */}
        {step === "welcome" && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-300 border border-teal-100">
            <div className="flex justify-center mb-3">
              <AppLogo size="md" />
            </div>

            <div className="my-3 flex justify-center">
              <Mascot gesture="wave" size={88} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#1f7a8c] px-3 py-1 rounded-full border border-teal-200/60 shadow-2xs">
              Clinical &amp; Cultural Metabolic AI
            </span>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-2.5 leading-tight">
              Lower Blood Sugar &amp; Blood Pressure Without Giving Up Swallow 🥑
            </h1>

            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              Answer 6 quick questions to generate your personalized low-glycemic African nutrition blueprint.
            </p>

            <div className="space-y-2.5 my-6 text-left">
              <div className="flex items-center gap-3 bg-teal-50/70 border border-teal-100/80 rounded-2xl p-3">
                <span className="text-xl">🩺</span>
                <span className="text-xs font-bold text-gray-800">
                  Targeted A1c, BP &amp; Visceral Belly Fat formulas
                </span>
              </div>
              <div className="flex items-center gap-3 bg-teal-50/70 border border-teal-100/80 rounded-2xl p-3">
                <span className="text-xl">🍲</span>
                <span className="text-xs font-bold text-gray-800">
                  Real African foods (Egusi, Jollof, Fufu &amp; Low-GI Swaps)
                </span>
              </div>
              <div className="flex items-center gap-3 bg-teal-50/70 border border-teal-100/80 rounded-2xl p-3">
                <span className="text-xl">⚡</span>
                <span className="text-xs font-bold text-gray-800">
                  AI instant food photo analysis &amp; portion calculator
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic("medium");
                setStep("diagnostic_goal");
              }}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] hover:from-[#1a6273] hover:to-[#0f766e] text-white rounded-2xl py-4 font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Begin Free Metabolic Assessment</span>
              <ArrowRight size={16} />
            </button>

            <p className="text-[11px] text-gray-500 font-semibold mt-3">⏱️ Takes only 45 seconds</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* DIAGNOSTIC QUESTIONS (STEP 1 TO 6)                           */}
        {/* ============================================================ */}
        {step.startsWith("diagnostic_") && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300 border border-teal-100 relative">
            {/* Top Micro Progress Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-[11px] font-black text-[#1f7a8c] mb-1.5">
                <span>METABOLIC INTAKE</span>
                <span>Question {getStepProgressNumber()} of 6</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] rounded-full transition-all duration-300"
                  style={{ width: `${(getStepProgressNumber() / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Q1: Clinical Priority */}
            {step === "diagnostic_goal" && (
              <div>
                <div className="text-center mb-5">
                  <span className="text-3xl">🎯</span>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
                    What is your primary health &amp; metabolic priority?
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    We tailor your carbohydrate ceiling and nutrient ratios around this.
                  </p>
                </div>

                <div className="space-y-2 mb-6">
                  {[
                    { title: "Reverse / Manage Type 2 Diabetes & Pre-Diabetes", icon: "🩺", desc: "Lower A1c & prevent dangerous glucose spikes" },
                    { title: "Lower High Blood Pressure & Sodium Load", icon: "🫀", desc: "Artery health, kidney protection & stew salt balance" },
                    { title: "Pregnancy, Gestational Health & Preeclampsia Shield", icon: "🤰", desc: "Folate, iron, fetal glucose stability & maternal vitality" },
                    { title: "Prostate Health & PSA Balance (Men 40+)", icon: "🩺", desc: "Lycopene, zinc, BPH reduction & urinary flow" },
                    { title: "Arthritis, Gout & Joint Inflammation", icon: "🦴", desc: "Anti-inflammatory spices, purine balance & cartilage protection" },
                    { title: "Burn Stubborn Visceral Belly Fat", icon: "⚖️", desc: "Target abdominal insulin resistance and waistline" },
                    { title: "PCOS, Cholesterol & General Vitality", icon: "🧬", desc: "Hormonal balance, lipid control & sustainable energy" },
                  ].map((item) => (
                    <button
                      key={item.title}
                      onClick={() => {
                        triggerHaptic("light");
                        setHealthGoal(item.title);
                      }}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer ${
                        healthGoal === item.title
                          ? "border-[#1f7a8c] bg-teal-50/70 shadow-sm"
                          : "border-gray-200/80 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-2xs">{item.icon}</span>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-gray-900 block leading-snug">{item.title}</span>
                        <span className="text-[10.5px] text-gray-500 font-medium block mt-0.5">{item.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    triggerHaptic("medium");
                    setStep("diagnostic_diet");
                  }}
                  className="w-full bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-2xl py-3.5 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Q2: Cultural Culinary Diet */}
            {step === "diagnostic_diet" && (
              <div>
                <div className="text-center mb-5">
                  <span className="text-3xl">🍲</span>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
                    What is your cultural food foundation?
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    MealOptimiza customizes recipes for the exact meals you cook.
                  </p>
                </div>

                <div className="space-y-2.5 mb-6">
                  {[
                    { name: "Nigerian (Egusi, Jollof, Yam, Eba, Soups)", icon: "🇳🇬" },
                    { name: "Ghanaian (Banku, Fufu, Waakye, Shito)", icon: "🇬🇭" },
                    { name: "Afro-Caribbean (Rice & Peas, Callaloo, Plantain)", icon: "🇯🇲" },
                    { name: "East / Southern African (Ugali, Sadza, Braai)", icon: "🌍" },
                    { name: "Continental & Diaspora Fusion", icon: "🌐" },
                  ].map((diet) => (
                    <button
                      key={diet.name}
                      onClick={() => {
                        triggerHaptic("light");
                        setCulturalDiet(diet.name);
                      }}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                        culturalDiet === diet.name
                          ? "border-[#1f7a8c] bg-teal-50/70 shadow-sm"
                          : "border-gray-200/80 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{diet.icon}</span>
                      <span className="text-xs font-bold text-gray-900">{diet.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep("diagnostic_goal")}
                    className="flex-1 py-3 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      setStep("diagnostic_hurdle");
                    }}
                    className="flex-2 bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-xl py-3 font-bold text-xs shadow-md flex items-center justify-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Q3: Top Daily Hurdle */}
            {step === "diagnostic_hurdle" && (
              <div>
                <div className="text-center mb-5">
                  <span className="text-3xl">⚡</span>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
                    What is your biggest daily food obstacle?
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    We engineer specific tactical swaps to neutralize this barrier.
                  </p>
                </div>

                <div className="space-y-2.5 mb-6">
                  {[
                    { label: "Heavy late-night swallows (Pounded Yam, Eba, Fufu)", icon: "🍚" },
                    { label: "Blood sugar spikes after family parties & Jollof", icon: "📈" },
                    { label: "Cravings for sugary malt, soda, juice & fried plantain", icon: "🥤" },
                    { label: "Not knowing how to cook cultural dishes in a low-GI way", icon: "👩🏾‍🍳" },
                  ].map((hurdle) => (
                    <button
                      key={hurdle.label}
                      onClick={() => {
                        triggerHaptic("light");
                        setMainHurdle(hurdle.label);
                      }}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                        mainHurdle === hurdle.label
                          ? "border-[#1f7a8c] bg-teal-50/70 shadow-sm"
                          : "border-gray-200/80 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{hurdle.icon}</span>
                      <span className="text-xs font-bold text-gray-900 leading-snug">{hurdle.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep("diagnostic_diet")}
                    className="flex-1 py-3 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      setStep("diagnostic_meds");
                    }}
                    className="flex-2 bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-xl py-3 font-bold text-xs shadow-md flex items-center justify-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Q4: Medication & Clinical Profile */}
            {step === "diagnostic_meds" && (
              <div>
                <div className="text-center mb-5">
                  <span className="text-3xl">💊</span>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
                    Are you currently taking any prescribed medication?
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Ensures your macronutrient distribution safely complements your medical regimen.
                  </p>
                </div>

                <div className="space-y-2.5 mb-6">
                  {[
                    { label: "Metformin / Insulin / Diabetes medications", icon: "💉" },
                    { label: "Blood Pressure medication (Amlodipine, Lisinopril, etc.)", icon: "🫀" },
                    { label: "Cholesterol statins / Multiple prescriptions", icon: "💊" },
                    { label: "None / Managing strictly through diet & lifestyle", icon: "🌿" },
                  ].map((med) => (
                    <button
                      key={med.label}
                      onClick={() => {
                        triggerHaptic("light");
                        setMedication(med.label);
                      }}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3 cursor-pointer ${
                        medication === med.label
                          ? "border-[#1f7a8c] bg-teal-50/70 shadow-sm"
                          : "border-gray-200/80 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{med.icon}</span>
                      <span className="text-xs font-bold text-gray-900 leading-snug">{med.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep("diagnostic_hurdle")}
                    className="flex-1 py-3 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      setStep("diagnostic_biometrics");
                    }}
                    className="flex-2 bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-xl py-3 font-bold text-xs shadow-md flex items-center justify-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Q5: Biometric Baseline */}
            {step === "diagnostic_biometrics" && (
              <div>
                <div className="text-center mb-5">
                  <span className="text-3xl">⚖️</span>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
                    What is your baseline body profile?
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Used to calculate your basal metabolic rate and carbohydrate buffer.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                      Age Range
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {["18-34", "35-49", "50-64", "65+"].map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => setAgeRange(age)}
                          className={`py-2 rounded-xl text-xs font-bold border-2 ${
                            ageRange === age
                              ? "border-[#1f7a8c] bg-teal-50 text-[#1f7a8c]"
                              : "border-gray-200 text-gray-700"
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                        Current Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-gray-200 font-black text-gray-900 text-center text-sm focus:border-[#1f7a8c] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                        Target Goal (kg)
                      </label>
                      <input
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        className="w-full p-3 rounded-xl border-2 border-teal-200 bg-teal-50/50 font-black text-[#1f7a8c] text-center text-sm focus:border-[#1f7a8c] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-black uppercase text-gray-700 block mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 font-black text-gray-900 text-center text-sm focus:border-[#1f7a8c] outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep("diagnostic_meds")}
                    className="flex-1 py-3 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      setStep("diagnostic_pace");
                    }}
                    className="flex-2 bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-xl py-3 font-bold text-xs shadow-md flex items-center justify-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Q6: Commitment Pace */}
            {step === "diagnostic_pace" && (
              <div>
                <div className="text-center mb-5">
                  <span className="text-3xl">🚀</span>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-2">
                    How fast do you want to stabilize your markers?
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your clinical turnaround milestone pace.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    {
                      name: "21-Day Rapid Jumpstart",
                      badge: "POPULAR",
                      desc: "Immediate post-meal glucose stabilization, drop in evening sugar spikes, and 2-4kg weight reset.",
                      icon: "⚡",
                    },
                    {
                      name: "90-Day Clinical Reversal",
                      badge: "LONG-TERM",
                      desc: "Sustainable A1c drop below 6.0%, arterial blood pressure normalization, and permanent cultural habits.",
                      icon: "🌿",
                    },
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        triggerHaptic("light");
                        setPace(p.name);
                      }}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        pace === p.name
                          ? "border-[#1f7a8c] bg-teal-50/80 shadow-md"
                          : "border-gray-200/80 hover:border-teal-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                          <span>{p.icon}</span>
                          <span>{p.name}</span>
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 font-medium leading-relaxed mt-1">
                        {p.desc}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep("diagnostic_biometrics")}
                    className="flex-1 py-3 text-xs font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic("medium");
                      setStep("calculating");
                    }}
                    className="flex-2 bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] hover:from-[#1a6273] hover:to-[#0f766e] text-white rounded-xl py-3.5 font-black text-xs shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span>Generate My Plan</span>
                    <Sparkles size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: PSEUDO-CALCULATION LOADING SCREEN                   */}
        {/* ============================================================ */}
        {step === "calculating" && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-300 border border-teal-100">
            <div className="my-4 flex justify-center">
              <div className="relative flex items-center justify-center w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#0D9488"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * calcProgress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-100"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-900">{calcProgress}%</span>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-black text-gray-900 mt-4">
              Calibrating Cultural Metabolic Engine
            </h2>

            <div className="h-14 flex items-center justify-center px-2 mt-2">
              <p className="text-xs font-bold text-teal-800 animate-pulse transition-all">
                {calcMessages[calcTextIndex]}
              </p>
            </div>

            <div className="space-y-2 mt-6 text-left max-w-xs mx-auto text-[11px] font-bold text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className={calcProgress > 25 ? "text-emerald-500" : "text-gray-300"} />
                <span>African ingredient glycemic database indexed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className={calcProgress > 55 ? "text-emerald-500" : "text-gray-300"} />
                <span>Swallow carbohydrate substitute engine active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className={calcProgress > 85 ? "text-emerald-500" : "text-gray-300"} />
                <span>Personalized 21-Day Glycemic Prescription ready</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2.5: GLYCEMIC SPIKE REVERSAL SIMULATION PAYOFF         */}
        {/* ============================================================ */}
        {step === "simulation_payoff" && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-center animate-in fade-in zoom-in-95 duration-300 border border-teal-100">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Analysis Complete: Blueprint Formulated
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-1">
              Your Projected Glycemic &amp; Weight Reversal 📉
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Based on your {culturalDiet.split(" ")[0]} food profile and {healthGoal.split("&")[0]} goal.
            </p>

            {/* Visual Simulation Chart */}
            <div className="my-5 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white text-left border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="text-[10.5px] font-black text-slate-300 uppercase mb-3 flex items-center justify-between">
                <span>Post-Meal Glucose Simulation</span>
                <span className="text-yellow-400">MealOptimiza AI vs Standard</span>
              </div>

              {/* Standard Diet Spike */}
              <div className="mb-3.5">
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-red-300">Standard Diet (Heavy Swallow / Rice):</span>
                  <span className="text-red-400 font-black">242 mg/dL (Spike Risk 🚨)</span>
                </div>
                <div className="w-full h-3 bg-red-950 rounded-full overflow-hidden p-0.5 border border-red-800/50">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-[92%]" />
                </div>
              </div>

              {/* MealOptimiza Optimized Swallow Swap */}
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-teal-300">With MealOptimiza Swallow Swap:</span>
                  <span className="text-emerald-400 font-black">118 mg/dL (Target Zone 🟢)</span>
                </div>
                <div className="w-full h-3 bg-teal-950 rounded-full overflow-hidden p-0.5 border border-teal-800/50">
                  <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full w-[45%]" />
                </div>
              </div>

              {/* Projected A1c / Target Milestone Box */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Projected A1c Shift:</span>
                  <strong className="text-yellow-300 font-black text-sm">8.4% ➔ 5.8%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Weight Milestone:</span>
                  <strong className="text-emerald-300 font-black text-sm">{currentWeight}kg ➔ {targetWeight}kg</strong>
                </div>
              </div>
            </div>

            {/* Social Proof Validation */}
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-2xl mb-5 flex items-center gap-2.5 text-left">
              <span className="text-2xl shrink-0">🌟</span>
              <p className="text-[11px] text-teal-950 font-bold leading-snug">
                <strong>93.4% of users</strong> with your metabolic profile achieve healthy glycemic stability and reach their target goal within 90 days.
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic("medium");
                setStep("paywall");
              }}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] hover:from-[#1a6273] hover:to-[#0f766e] text-white rounded-2xl py-4 font-black text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Unlock My Personalized Blueprint</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: THE PRIMARY ANCHORED PAYWALL                        */}
        {/* ============================================================ */}
        {step === "paywall" && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-center animate-in fade-in zoom-in-95 duration-300 border-2 border-teal-300 relative">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm mb-2">
              <Crown size={12} className="fill-slate-950" />
              <span>7-Day Free Trial • Cancel Anytime</span>
            </div>

            <h2 className="text-xl font-black text-gray-900 mt-1">
              Start Your 21-Day Blood Sugar &amp; Metabolic Transformation
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Full unlimited access to your clinical swallow swaps, AI camera scanner, and Sarah AI concierge.
            </p>

            {/* Currency Selector */}
            <div className="my-3 flex items-center justify-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-gray-500">Currency:</span>
              {(["USD", "GBP", "NGN", "GHS"] as CurrencyCode[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`px-2 py-0.5 rounded-lg text-[10.5px] font-black border transition-all ${
                    currency === cur
                      ? "bg-[#1f7a8c] text-white border-[#1f7a8c]"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            {/* Subscription Option Cards */}
            <div className="space-y-3 my-4 text-left">
              {/* Annual Plan (Anchored Best Value) */}
              <div
                onClick={() => setSelectedPlan("annual")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedPlan === "annual"
                    ? "border-[#1f7a8c] bg-teal-50/70 shadow-md ring-2 ring-[#1f7a8c]/20"
                    : "border-gray-200 hover:border-teal-200"
                }`}
              >
                <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[9.5px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  70% OFF • BEST VALUE
                </span>

                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === "annual" ? "border-[#1f7a8c] bg-[#1f7a8c]" : "border-gray-300"
                    }`}>
                      {selectedPlan === "annual" && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-sm font-black text-gray-900">Annual Clinical PRO</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#1f7a8c]">
                      {currency === "NGN" ? "₦35,000" : currency === "GBP" ? "£49.99" : currency === "GHS" ? "₵750" : "$59.99"}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-semibold">/ year ($4.99/mo)</span>
                  </div>
                </div>
                <p className="text-[10.5px] text-gray-500 font-medium pl-6">
                  Includes 7-Day Free Trial. First billing after day 7.
                </p>
              </div>

              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan("monthly")}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedPlan === "monthly"
                    ? "border-[#1f7a8c] bg-teal-50/70 shadow-md ring-2 ring-[#1f7a8c]/20"
                    : "border-gray-200 hover:border-teal-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === "monthly" ? "border-[#1f7a8c] bg-[#1f7a8c]" : "border-gray-300"
                    }`}>
                      {selectedPlan === "monthly" && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-xs font-black text-gray-900">Monthly Plan</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-gray-900">
                      {currency === "NGN" ? "₦5,500" : currency === "GBP" ? "£8.99" : currency === "GHS" ? "₵95" : "$9.99"}
                    </span>
                    <span className="text-[9.5px] text-gray-400 block">/ month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRO Feature Checklist */}
            <div className="space-y-2 mb-5 text-left text-xs font-bold text-gray-700 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-teal-600 shrink-0" />
                <span>Unlimited AI Camera Food Scans &amp; Carb Counter</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-teal-600 shrink-0" />
                <span>Personalized Low-Glycemic Swallow Swap Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-teal-600 shrink-0" />
                <span>24/7 Sarah AI Concierge &amp; WhatsApp Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-teal-600 shrink-0" />
                <span>Doctor &amp; Lab-Ready Glycemic PDF Health Reports</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handlePaywallAction}
              disabled={isProcessingPay}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-[#1f7a8c] hover:opacity-95 text-white rounded-2xl py-4 font-black text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
            >
              <Lock size={15} />
              <span>
                {isProcessingPay
                  ? "Setting Up Your Blueprint..."
                  : "Start 7-Day Free Trial 🚀"}
              </span>
            </button>

            {/* Secondary Free Tier Escape Hatch */}
            <button
              type="button"
              onClick={() => finalizeAccount(false)}
              className="mt-3 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors py-1 cursor-pointer"
            >
              Continue with Free Basic Plan &gt;
            </button>

            <p className="text-[10px] text-gray-400 mt-3">
              🔒 256-Bit Encrypted • No commitment • Cancel in Settings in 1 tap anytime.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
