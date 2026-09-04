import React from "react";
import { HeartHandshake } from "lucide-react";

export default function MedicalDisclaimerFooter() {
  return (
    <footer className="mt-8 px-4 py-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1.5">
        <HeartHandshake size={14} className="text-[#1f7a8c]" />
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Health &amp; Wellness Guide
        </span>
      </div>
      <p className="text-[10.5px] text-slate-400 leading-relaxed">
        MealOptimiza provides nutrition insights tailored to African and diaspora diets. It does not replace professional medical advice, clinical diagnosis, or prescribed treatments. Always consult your doctor or registered dietitian for medical guidance.
      </p>
      <p className="text-[9.5px] text-slate-400 font-bold mt-1">
        MealOptimiza • <a href="https://mealoptimiza.com" className="underline hover:text-slate-600 dark:hover:text-slate-300">mealoptimiza.com</a> • Private &amp; Secure
      </p>
    </footer>
  );
}
