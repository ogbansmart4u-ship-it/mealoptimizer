import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Stethoscope, Lock, HeartHandshake, CheckCircle2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { triggerHaptic } from "../utils/celebration";

interface MedicalDisclaimerModalProps {
  onAccept?: () => void;
}

export default function MedicalDisclaimerModal({ onAccept }: MedicalDisclaimerModalProps = {}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("mealoptimiza_medical_disclaimer_accepted");
    if (!hasAccepted) {
      // Show safety notice promptly on initial visit / launch
      const timer = setTimeout(() => setIsOpen(true), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    triggerHaptic("medium");
    localStorage.setItem("mealoptimiza_medical_disclaimer_accepted", "true");
    setIsOpen(false);

    // If parent supplied onAccept callback, trigger it immediately
    if (onAccept) {
      onAccept();
      return;
    }

    // Promptly launch onboarding questionnaire if user has not completed setup
    const hasCompletedOnboarding =
      localStorage.getItem("mealoptimiza_questionnaire_completed") === "true" ||
      localStorage.getItem("onboardingComplete") === "true";

    if (!hasCompletedOnboarding) {
      setTimeout(() => {
        navigate("/onboarding");
      }, 350);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleAccept()}>
      <DialogContent className="max-w-md p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#09221C] via-[#0B2A22] to-[#05130F] text-stone-100 border border-emerald-500/40 shadow-2xl shadow-emerald-950/60 font-sans">
        <DialogHeader className="text-center pb-1">
          {/* Botanical Emblem */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
                <HeartHandshake size={32} className="text-emerald-300" />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-stone-950 p-1 rounded-full shadow-xs">
                <Sparkles size={11} />
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider mx-auto mb-1.5">
            <span>Evidence-Based Guidance</span>
          </div>

          <DialogTitle className="text-xl font-extrabold text-white text-center tracking-tight">
            Your Health &amp; Safety First 🥑
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-300 text-center font-medium max-w-xs mx-auto leading-relaxed mt-1">
            How MealOptimiza partners with you and your healthcare team
          </DialogDescription>
        </DialogHeader>

        {/* Clinical Value Cards */}
        <div className="space-y-3 my-3 text-xs text-stone-300">
          <div className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl space-y-3 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5 border border-emerald-500/30">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-white block font-bold text-xs">Cultural Metabolic Companion</strong>
                <span className="text-[11px] text-stone-300 leading-snug block mt-0.5">
                  Learn evidence-based portioning and soup pairings (like Okra &amp; Ewedu) to manage blood sugar spikes without giving up African meals.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-3 border-t border-white/10">
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5 border border-amber-500/30">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-amber-200 block font-bold text-xs">Always Consult Your Doctor</strong>
                <span className="text-[11px] text-stone-300 leading-snug block mt-0.5">
                  MealOptimiza is a lifestyle nutrition companion, not a hospital clinic. Never discontinue or change prescribed medications without your doctor&apos;s guidance.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-200">
            <Lock size={14} className="text-emerald-400 shrink-0" />
            <span>256-bit encrypted: Your personal biometric and meal data is private.</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Button
            onClick={handleAccept}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:opacity-95 text-stone-950 font-black rounded-2xl text-xs shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <CheckCircle2 size={16} />
            <span>I Understand &amp; Agree</span>
          </Button>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-center text-stone-400 hover:text-emerald-300 transition-colors py-0.5"
          >
            Review Terms of Service &amp; Privacy Policy
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
