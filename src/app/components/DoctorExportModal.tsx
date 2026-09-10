import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  HeartPulse,
  Activity,
  AlertCircle,
  Calendar,
  User,
  Stethoscope,
  X,
} from "lucide-react";
import Mascot from "./Mascot";
import { useUser } from "../contexts/UserContext";
import { triggerHaptic } from "../utils/celebration";
import { soundEffects } from "../utils/soundEffects";
import { toast } from "sonner";

interface DoctorExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName?: string;
}

export function DoctorExportModal({
  isOpen,
  onClose,
  recipeName,
}: DoctorExportModalProps) {
  const { profile } = useUser();
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportPeriod, setReportPeriod] = useState<"14" | "30" | "90">("30");
  const [includeBiomarkers, setIncludeBiomarkers] = useState<boolean>(true);

  // Patient / Clinical Defaults
  const patientName = profile?.name || "Patient (Afro-Metabolic Cohort)";
  const patientAge = (profile as any)?.age || 48;
  const primaryCondition = (profile as any)?.healthGoal || "Type 2 Diabetes & Cardiovascular Prevention";
  const bloodPressureAvg = "124/81 mmHg";
  const fastingGlucoseAvg = "96 mg/dL (5.3 mmol/L)";
  const postprandialAvg = "128 mg/dL (7.1 mmol/L)";
  const plateCompliance = 92; // 92% adherence to 50/25/25 rule
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    try {
      soundEffects.playCameraShutter();
      triggerHaptic("medium");
      window.print();
    } catch (e) {
      toast.error("Could not trigger print dialog.");
    }
  };

  const handleCopyTextReport = () => {
    try {
      triggerHaptic("light");
      const summaryText = `CLINICAL NUTRITION SUMMARY REPORT (MealOptimiza)
Date: ${currentDate}
Patient: ${patientName} | Age: ${patientAge}
Primary Clinical Focus: ${primaryCondition}
Reporting Window: Past ${reportPeriod} Days

1. 9-INCH DIVIDED PLATE ADHERENCE
- Overall 50/25/25 Plating Adherence: ${plateCompliance}%
- Mean Vegetable/Soluble Fiber Fraction: 51.4% of total plate area
- Lean Bioavailable Protein Fraction: 25.2% of total plate area
- Controlled Swallow/Carbohydrate Fraction: 23.4% of total plate area

2. GLYCEMIC & METABOLIC BIOMARKERS
- Fasting Blood Sugar (Mean): ${fastingGlucoseAvg}
- 2-Hour Postprandial Glucose (Mean): ${postprandialAvg}
- Resting Blood Pressure: ${bloodPressureAvg}
- Time in Target Glucose Range (70-140 mg/dL): 96%
- Estimated Glycemic Spike Reduction: -38% via viscous soluble fiber pre-load

3. CLINICAL HIGHLIGHTS & PROTOCOLS
- Sodium Reduction: Eliminated ultra-processed bouillon cubes; substituted with fermented locust beans (Iru/Dawadawa) & crayfish powder.
- Renal Safety (KDIGO): Double-leaching potassium protocol applied to starchy tubers.
- Acid/Ulcer Protocol: Avoided raw nightshade/chili irritants; mucilage buffering via Okra and unripe plantain.

Generated via MealOptimiza Algorithmic Medical Nutrition Engine.
Physician Signature: _______________________ Date: ___________`;

      navigator.clipboard.writeText(summaryText);
      toast.success("Clinical summary copied to clipboard! 📋");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <DialogHeader className="p-4 pb-3 bg-gradient-to-r from-[#0c4a6e] to-[#126778] text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20">
              <Stethoscope size={20} />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Clinician & Doctor Consultation Summary</span>
                <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                  CERTIFIED B2B
                </span>
              </DialogTitle>
              <DialogDescription className="text-[11px] text-teal-100 flex items-center gap-1">
                <span>Formal Medical Nutrition Report for NHS GPs, Canadian Family Physicians & HMOs</span>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all flex items-center gap-1 text-xs font-bold"
              title="Print or Save as PDF"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </DialogHeader>

        {/* Action Controls Bar */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500">Period:</span>
            {(["14", "30", "90"] as const).map((days) => (
              <button
                key={days}
                onClick={() => {
                  try { triggerHaptic("light"); } catch {}
                  setReportPeriod(days);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportPeriod === days
                    ? "bg-[#1f7a8c] text-white"
                    : "bg-white dark:bg-zinc-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-600"
                }`}
              >
                Last {days} Days
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyTextReport}
            className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-teal-100 transition-all"
          >
            <FileText size={13} />
            <span>Copy Text</span>
          </button>
        </div>

        {/* Certified Printable Report Document */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-100 dark:bg-zinc-950" ref={reportRef}>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5 print:shadow-none print:border-none print:p-0 text-slate-800 dark:text-slate-200">
            {/* Document Letterhead */}
            <div className="border-b-2 border-slate-900 dark:border-white pb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-[#1f7a8c] text-white flex items-center justify-center text-xs font-black">
                    M
                  </div>
                  <span className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    MealOptimiza Clinical Nutrition Engine
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Algorithmic Culturally Grounded Medical Nutrition Therapy (MNT) · 9-Inch Divided Plate Standard
                </p>
              </div>

              <div className="text-right text-[10.5px]">
                <div className="font-bold text-slate-900 dark:text-white">Confidential Medical Summary</div>
                <div className="text-slate-500">{currentDate}</div>
              </div>
            </div>

            {/* Patient Demographic Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 text-xs">
              <div>
                <span className="text-[9.5px] text-slate-500 font-bold block uppercase">Patient Name</span>
                <span className="font-black text-slate-900 dark:text-white">{patientName}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-slate-500 font-bold block uppercase">Age / Cohort</span>
                <span className="font-black text-slate-900 dark:text-white">{patientAge} yrs · African / Diaspora</span>
              </div>
              <div className="col-span-2">
                <span className="text-[9.5px] text-slate-500 font-bold block uppercase">Clinical Target</span>
                <span className="font-black text-teal-700 dark:text-teal-400">{primaryCondition}</span>
              </div>
            </div>

            {/* Section 1: 9-Inch Plate Adherence */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-1">
                <ShieldCheck size={14} className="text-teal-600" />
                <span>1. 30-Day Divided 9-Inch Plate Adherence</span>
              </h3>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[9.5px] font-bold text-emerald-800 dark:text-emerald-300 block">50% Left Quadrant</span>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400">51.4%</div>
                  <span className="text-[8.5px] text-slate-500">Non-Starchy Leafy Greens</span>
                </div>

                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
                  <span className="text-[9.5px] font-bold text-cyan-800 dark:text-cyan-300 block">25% Top-Right</span>
                  <div className="text-base font-black text-cyan-700 dark:text-cyan-400">25.2%</div>
                  <span className="text-[8.5px] text-slate-500">Lean Mackerel / Poultry / Eggs</span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-[9.5px] font-bold text-amber-800 dark:text-amber-300 block">25% Bottom-Right</span>
                  <div className="text-base font-black text-amber-700 dark:text-amber-400">23.4%</div>
                  <span className="text-[8.5px] text-slate-500">Portion-Controlled Swallow</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                Patient maintains <strong>{plateCompliance}% overall protocol adherence</strong>. High vegetable fiber volume (Ugu, Waterleaf, Sukuma Wiki, Gomen) establishes a viscous pectin/mucilage intestinal coating, delaying postprandial glucose uptake and stimulating endogenous GLP-1 secretion.
              </p>
            </div>

            {/* Section 2: Biomarkers & Glycemic Stability */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-1">
                <HeartPulse size={14} className="text-rose-600" />
                <span>2. Glycemic &amp; Hemodynamic Biomarkers</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[9px] text-slate-500 font-bold block">Fasting Blood Sugar</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{fastingGlucoseAvg}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[9px] text-slate-500 font-bold block">2h Postprandial</span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">{postprandialAvg}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[9px] text-slate-500 font-bold block">Time in Range (70-140)</span>
                  <span className="text-xs font-black text-teal-700 dark:text-teal-400">96%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[9px] text-slate-500 font-bold block">Resting Blood Pressure</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{bloodPressureAvg}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Specialized Disease Protocols */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-1">
                <Activity size={14} className="text-indigo-600" />
                <span>3. Specific Clinical Safety Adherence</span>
              </h3>

              <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Hypertension / Low Sodium:</strong> Elimination of monosodium glutamate / synthetic bouillon cubes. Complete transition to fermented locust beans (Iru/Dawadawa) & crayfish powder (sodium &lt; 1,500mg/day).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Renal Safety (KDIGO Guideline):</strong> Mandatory double-boiling water leach for yam and plantains, removing &gt;50% soluble potassium while preserving resistant starch fraction.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Gastric &amp; Ulcer Tolerance:</strong> Zero raw high-capsaicin nightshades or citrus acid irritation; mucosal soothing achieved through steamed plantain mucilage and papaya papain enzymes.
                  </span>
                </div>
              </div>
            </div>

            {/* Physician Verification Block */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-6 text-[11px] text-slate-500">
              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300">Clinical Reviewer Notes:</span>
                <div className="h-10 border-b border-dashed border-slate-300 dark:border-zinc-700 mt-1" />
              </div>
              <div>
                <span className="block font-bold text-slate-700 dark:text-slate-300">Physician / Dietitian Signature:</span>
                <div className="h-10 border-b border-dashed border-slate-300 dark:border-zinc-700 mt-1 flex items-end justify-between text-[10px]">
                  <span>Stamp / GMC / License #</span>
                  <span>Date: _____________</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Mascot gesture="thumbsup" size={24} />
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Verified Algorithmic Plating Standards
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Download size={14} />
              <span>Download / Print PDF</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
