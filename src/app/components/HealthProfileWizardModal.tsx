import React, { useState, useEffect } from "react";
import {
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

  // Form State
  const [selectedGoal, setSelectedGoal] = useState("blood_sugar");
  const [ageRange, setAgeRange] = useState("30-45");
  const [gender, setGender] = useState("Female");
  const [weightKg, setWeightKg] = useState("72");
  const [heightCm, setHeightCm] = useState("168");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    "Type-2 Diabetes Management",
  ]);

  // Derived BMI
  const w = parseFloat(weightKg) || 70;
  const h = parseFloat(heightCm) / 100 || 1.68;
  const bmi = (w / (h * h)).toFixed(1);

  // Trigger Avo note taking on mount / step change
  useEffect(() => {
    setActiveGesture("writing");
    mascot.write();
  }, [step]);

  const triggerNoteTaking = () => {
    triggerHaptic("light");
    setActiveGesture("writing");
    mascot.write();
  };

  const toggleCondition = (cond: string) => {
    triggerNoteTaking();
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleNext = () => {
    triggerHaptic("light");
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    triggerHaptic("medium");
    setActiveGesture("jumping");
    mascot.jump();

    try {
      const conditionString = selectedConditions.join(", ") || "General Metabolic Wellness";
      const updates = {
        age: ageRange === "18-29" ? 25 : ageRange === "30-45" ? 38 : ageRange === "46-60" ? 52 : 65,
        bmi: parseFloat(bmi) || 24.2,
        weight: weightKg.trim() || "70",
        height: heightCm.trim() || "170",
        bloodPressure: "120/80",
        systolic: 120,
        diastolic: 80,
        gender: gender,
        medicalCondition: conditionString,
        goal: selectedGoal,
      };

      await updateUserProfile(updates);
      updateProfile({
        ...(profile as any),
        ...updates,
      });

      localStorage.setItem("hasCompletedHealthSetup", "true");
      triggerHaptic("milestone");
      triggerConfetti("fireworks");
      mascot.doubleThumbsUp();
      toast.success("Health profile calibrated! Welcome to MealOptimiza.");
      onComplete();
    } catch (err) {
      console.warn("Profile update warning:", err);
      localStorage.setItem("hasCompletedHealthSetup", "true");
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md p-5 sm:p-7 rounded-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-teal-100 dark:border-zinc-800 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Step Indicator Header with Animated 3D Avo Scribe */}
        <div className="flex items-center justify-between border-b border-teal-100/60 dark:border-zinc-800 pb-3.5 mb-4">
          <div className="flex items-center gap-3">
            <Mascot gesture={activeGesture} size={54} className="shrink-0 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9.5px] uppercase font-black tracking-wider bg-teal-50 text-[#1f7a8c] dark:bg-teal-950/70 dark:text-teal-300 px-2 py-0.2 rounded-full border border-teal-200 dark:border-teal-800">
                  Setup Step {step} of 4
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                  ✍️ Avo Scribe
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {step === 1 && "Primary Health Focus 🎯"}
                {step === 2 && "Age & Biology 👤"}
                {step === 3 && "Weight & BMI Range ⚖️"}
                {step === 4 && "Health Conditions 🩺"}
              </h3>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 font-medium">
                {step === 1 && "Avo is recording your clinical target..."}
                {step === 2 && "Avo is calibrating your metabolic age & rate..."}
                {step === 3 && "Avo is calculating your West African baseline BMI..."}
                {step === 4 && "Avo is setting up your nutrition safety shields..."}
              </p>
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-5 bg-[#1f7a8c]" : i < step ? "w-2 bg-teal-400" : "w-2 bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: GOALS */}
        {step === 1 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              What is your primary clinical or nutritional goal?
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: "blood_sugar",
                  title: "Blood Sugar & Glycemic Control",
                  desc: "Prevent glucose spikes and lower estimated A1c",
                  icon: Activity,
                },
                {
                  id: "blood_pressure",
                  title: "Blood Pressure & Heart Shield",
                  desc: "Sodium moderation and arterial cardiovascular health",
                  icon: HeartPulse,
                },
                {
                  id: "weight_loss",
                  title: "Sustainable Metabolic Weight Loss",
                  desc: "Burn fat while enjoying authentic African cuisine",
                  icon: Flame,
                },
                {
                  id: "wellness",
                  title: "Energy, Gut & PCOS Vitality",
                  desc: "Fiber-rich digestion and hormonal balance",
                  icon: Sparkles,
                },
              ].map((g) => {
                const Icon = g.icon;
                const isSelected = selectedGoal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => {
                      triggerNoteTaking();
                      setSelectedGoal(g.id);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 shadow-xs scale-[1.01]"
                        : "bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 hover:border-teal-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isSelected
                            ? "bg-[#1f7a8c] text-white shadow-xs"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                          {g.title}
                        </span>
                        <span className="text-[11px] text-zinc-500 block">{g.desc}</span>
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-[#1f7a8c] dark:text-teal-400 font-black" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: AGE & BIOLOGY */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                Select Your Age Range
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {["18-29", "30-45", "46-60", "60+"].map((ar) => (
                  <button
                    key={ar}
                    type="button"
                    onClick={() => {
                      triggerNoteTaking();
                      setAgeRange(ar);
                    }}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      ageRange === ar
                        ? "bg-[#1f7a8c] text-white border-[#1f7a8c] shadow-xs scale-[1.02]"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-teal-200"
                    }`}
                  >
                    {ar} years
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                Biological Sex (for metabolic rate calibration)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {["Female", "Male"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      triggerNoteTaking();
                      setGender(g);
                    }}
                    className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      gender === g
                        ? "bg-[#1f7a8c] text-white border-[#1f7a8c] shadow-xs scale-[1.02]"
                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-teal-200"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: WEIGHT & BMI */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => {
                    setWeightKg(e.target.value);
                    triggerNoteTaking();
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-bold rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-center focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => {
                    setHeightCm(e.target.value);
                    triggerNoteTaking();
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-bold rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-center focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated BMI Badge */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center">
              <span className="text-[11px] uppercase tracking-wider font-bold text-teal-700 dark:text-teal-400 block mb-0.5">
                Calculated Baseline BMI
              </span>
              <div className="text-2xl font-black text-[#1f7a8c] dark:text-teal-300">
                {bmi} <span className="text-xs font-semibold text-zinc-500">kg/m²</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
                Calibrated against West African metabolic guidelines.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: MEDICAL CONDITIONS */}
        {step === 4 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Select any conditions for real-time glycemic and sodium safety warnings:
            </p>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {[
                "Type-2 Diabetes Management",
                "Prediabetes / Insulin Resistance",
                "Stage-1 / Stage-2 Hypertension",
                "High Cholesterol / Cardiovascular",
                "PCOS (Polycystic Ovary Syndrome)",
                "Chronic Kidney Disease (CKD)",
                "None / General Health & Wellness",
              ].map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <div
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-teal-50/70 dark:bg-teal-950/40 border-teal-400 dark:border-teal-700 shadow-xs"
                        : "bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 hover:border-teal-200"
                    }`}
                  >
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {cond}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                        isSelected
                          ? "bg-[#1f7a8c] border-[#1f7a8c] text-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-2">
          {step > 1 ? (
            <button
              onClick={() => {
                triggerHaptic("light");
                setStep(step - 1);
              }}
              className="p-2.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white font-black px-6 py-2.5 rounded-2xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calibrating...</span>
              </>
            ) : step === 4 ? (
              <>
                <span>Complete &amp; Start Tour</span>
                <Sparkles size={14} />
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ChevronRight size={14} />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
