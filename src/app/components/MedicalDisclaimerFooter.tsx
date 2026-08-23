import React from "react";
import { ShieldCheck, Stethoscope } from "lucide-react";

export default function MedicalDisclaimerFooter() {
  return (
    <footer className="mt-8 px-4 py-6 border-t border-slate-200/60 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1.5">
        <Stethoscope size={14} className="text-[#1f7a8c]" />
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
          Clinical Guidance & Governance
        </span>
      </div>
      <p className="text-[10px] text-slate-400 leading-relaxed">
        MealOptimizer provides nutritional insights and metabolic lifestyle guidance tailored to West African and diaspora diets. It does not replace professional medical advice, clinical diagnosis, or prescription medication management. Always consult your physician or registered dietitian before making drastic dietary changes.
      </p>
      <p className="text-[9px] text-slate-400 font-bold mt-1">
        MealOptimizer • <a href="https://mealoptimiza.com" className="underline hover:text-slate-600">mealoptimiza.com</a> • NDPR & GDPR Compliant
      </p>
    </footer>
  );
}
