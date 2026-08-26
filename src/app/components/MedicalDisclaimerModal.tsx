import React, { useState, useEffect } from "react";
import { ShieldCheck, Stethoscope, AlertTriangle, CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";

export default function MedicalDisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("mealoptimiza_medical_disclaimer_accepted");
    if (!hasAccepted) {
      // Show disclaimer on initial visit / launch
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("mealoptimiza_medical_disclaimer_accepted", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleAccept()}>
      <DialogContent className="max-w-md p-6 rounded-3xl bg-slate-950 text-white border-2 border-teal-500/40 shadow-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/40 text-teal-300">
              <Stethoscope size={32} />
            </div>
          </div>
          <DialogTitle className="text-lg font-black text-white text-center">
            Clinical Governance &amp; Safety Notice
          </DialogTitle>
          <DialogDescription className="text-xs text-teal-300/90 text-center font-semibold">
            Apple App Store &amp; Clinical Regulatory Compliance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 my-2 text-xs text-slate-300">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Nutrition &amp; Lifestyle Guidance:</strong>
                <span className="text-[11px] text-slate-300 leading-snug">
                  MealOptimiza provides algorithmic dietary tracking, blood sugar insights, and nutritional estimates tailored to African and diaspora foods.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-white/5">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-200 block">Not a Clinical Diagnostic Device:</strong>
                <span className="text-[11px] text-slate-300 leading-snug">
                  MealOptimiza does not replace professional medical advice, clinical diagnosis, or prescribed drug therapies. Never ignore or alter your doctor's medical guidance based on app data.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-teal-950/40 border border-teal-800/40 rounded-xl text-[10.5px] text-teal-200">
            <Lock size={14} className="text-teal-400 shrink-0" />
            <span>Bank-grade encryption • NDPR &amp; HIPAA-aligned data privacy</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button
            onClick={handleAccept}
            className="w-full py-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-slate-950 font-black rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <CheckCircle2 size={16} />
            <span>I Understand &amp; Agree</span>
          </Button>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-center text-slate-400 hover:text-teal-300 underline"
          >
            Review Terms of Service &amp; Privacy Policy
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
