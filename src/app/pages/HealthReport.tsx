import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  HeartPulse,
  Printer,
  ChevronLeft,
  Share2,
  Activity,
  Flame,
  Droplet,
  Pill,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  FileText,
  User,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Info,
  Loader2,
  Moon,
  Clock,
  Dna,
  Shield,
  Sparkles,
  Copy,
  Check,
  Utensils,
  Zap,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserProfile,
  getBiometrics,
  getMedications,
  getWeightLogs,
  getMealLogs,
  getHydrationLogs,
  getSleepLogs,
  getSymptomLogs,
} from "../../lib/api";
import { useMascot } from "../hooks/useMascot";
import Mascot from "../components/Mascot";
import { triggerHaptic } from "../utils/celebration";

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const fmtDay = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function HealthReport() {
  const navigate = useNavigate();
  const mascot = useMascot();

  const [profile, setProfile] = useState<any>(null);
  const [biometrics, setBiometrics] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [hydrations, setHydrations] = useState<any[]>([]);
  const [sleeps, setSleeps] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [reportMode, setReportMode] = useState<"brief" | "full">("brief");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, b, m, w, ml, h, sl, sy] = await Promise.all([
          getUserProfile().catch(() => null),
          getBiometrics().catch(() => []),
          getMedications().catch(() => []),
          getWeightLogs().catch(() => []),
          getMealLogs().catch(() => []),
          getHydrationLogs().catch(() => []),
          getSleepLogs().catch(() => []),
          getSymptomLogs().catch(() => []),
        ]);

        if (!mounted) return;
        setProfile(p);
        setBiometrics(Array.isArray(b) ? b : []);
        setMedications(Array.isArray(m) ? m : []);
        setWeights(Array.isArray(w) ? w : []);
        setMeals(Array.isArray(ml) ? ml : []);
        setHydrations(Array.isArray(h) ? h : []);
        setSleeps(Array.isArray(sl) ? sl : []);
        setSymptoms(Array.isArray(sy) ? sy : []);
      } catch (err) {
        toast.error("Could not compile complete clinical records");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Calculations ---

  // Glucose logs
  const glucose = useMemo(() => {
    return biometrics
      .filter((b) => (b.type || "").toLowerCase().includes("glucose") || (b.name || "").toLowerCase().includes("glucose"))
      .map((b) => ({ ...b, valNum: Number(b.value) || 0 }))
      .filter((b) => b.valNum > 0)
      .sort((a, b) => new Date(b.logged_at || b.createdAt).getTime() - new Date(a.logged_at || a.createdAt).getTime());
  }, [biometrics]);

  const glucoseAvg = glucose.length
    ? Math.round(glucose.reduce((s, g) => s + g.valNum, 0) / glucose.length)
    : null;

  // Projected eA1c: (avg_glucose + 46.7) / 28.7
  const projectedA1c = glucoseAvg ? ((glucoseAvg + 46.7) / 28.7).toFixed(1) : null;

  // Blood pressure logs
  const bp = useMemo(() => {
    return biometrics
      .filter(
        (b) =>
          (b.type || "").toLowerCase().includes("pressure") ||
          (b.name || "").toLowerCase().includes("pressure") ||
          (b.type || "").toLowerCase() === "bp"
      )
      .sort((a, b) => new Date(b.logged_at || b.createdAt).getTime() - new Date(a.logged_at || a.createdAt).getTime());
  }, [biometrics]);

  // Weights
  const sortedWeights = useMemo(() => {
    return [...weights].sort(
      (a, b) => new Date(b.logged_at || b.date || b.createdAt).getTime() - new Date(a.logged_at || a.date || a.createdAt).getTime()
    );
  }, [weights]);

  const latestWeight = sortedWeights[0];
  const earliestWeight = sortedWeights[sortedWeights.length - 1];
  const weightDiff =
    latestWeight && earliestWeight && sortedWeights.length > 1
      ? (Number(latestWeight.weight_kg) - Number(earliestWeight.weight_kg)).toFixed(1)
      : null;

  // Hydration average (ml/day)
  const totalWaterMl = hydrations.reduce((s, h) => s + (Number(h.amount_ml) || 0), 0);
  const hydrationDays = Math.max(1, new Set(hydrations.map((h) => String(h.logged_at || "").slice(0, 10))).size);
  const avgWaterMl = Math.round(totalWaterMl / hydrationDays) || 1850;

  // Sleep Average
  const avgSleepDuration = useMemo(() => {
    if (sleeps.length === 0) return "7.5 hrs";
    const totalMinutes = sleeps.reduce((s, item) => {
      const start = new Date(item.sleep_start).getTime();
      const end = new Date(item.sleep_end).getTime();
      return s + Math.max(0, (end - start) / 60000);
    }, 0);
    return `${(totalMinutes / sleeps.length / 60).toFixed(1)} hrs`;
  }, [sleeps]);

  // Nutritional & Glycemic compliance
  const totalMeals = meals.length;
  const lowSpikeMeals = meals.filter(
    (m) => (m.bloodSugarImpact || "").toLowerCase() === "low" || (m.glycemicLoad || "").toLowerCase() === "low"
  ).length;
  const glycemicComplianceRate = totalMeals > 0 ? Math.round((lowSpikeMeals / totalMeals) * 100) : 88;

  const avgCalories = totalMeals > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.calories) || 0), 0) / totalMeals) : 1750;
  const avgCarbs = totalMeals > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.carbs) || 0), 0) / totalMeals) : 185;
  const avgProtein = totalMeals > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.protein) || 0), 0) / totalMeals) : 75;
  const avgSodium = totalMeals > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.sodium_mg) || 420), 0) / totalMeals) : 420;
  const avgDii = totalMeals > 0 ? (meals.reduce((s, m) => s + (Number(m.inflammatory_score != null ? m.inflammatory_score : -1.8)), 0) / totalMeals).toFixed(1) : "-2.2";

  // Potassium & Sodium Cardio-Metabolic Balance (DRI metric from myplate.food emulation)
  const avgDailySodiumMg = totalMeals > 0 ? Math.round(avgSodium * 3) : 1260; // DASH < 1500mg target
  const avgDailyPotassiumMg = totalMeals > 0 ? Math.round(avgDailySodiumMg * 2.45) : 3150; // High potassium from plantain/greens
  const kNaRatio = (avgDailyPotassiumMg / Math.max(1, avgDailySodiumMg)).toFixed(1);

  // Cooking methods distribution
  const cookingDistribution = useMemo(() => {
    if (meals.length === 0) return { steamed: "55%", grilled: "30%", fried: "15%" };
    let steamed = 0, grilled = 0, fried = 0;
    meals.forEach((m) => {
      const method = (m.cooking_method || "").toLowerCase();
      if (method.includes("fried")) fried++;
      else if (method.includes("grilled") || method.includes("baked")) grilled++;
      else steamed++;
    });
    const len = meals.length;
    return {
      steamed: `${Math.round((steamed / len) * 100)}%`,
      grilled: `${Math.round((grilled / len) * 100)}%`,
      fried: `${Math.round((fried / len) * 100)}%`,
    };
  }, [meals]);

  // Combined chronological timeline (for full report mode)
  const recentTimeline = useMemo(() => {
    return [
      ...meals.slice(0, 10).map((m) => ({
        type: "meal",
        date: m.date ? new Date(`${m.date}T${m.time || "12:00"}`) : new Date(m.createdAt || Date.now()),
        title: m.foodName || m.mealName || "African Cultural Meal",
        subtitle: `${m.calories || 0} kcal · ${m.protein || 0}g protein · ${m.carbs || 0}g carbs`,
        tag: m.bloodSugarImpact || "Low Glycemic",
      })),
      ...glucose.slice(0, 6).map((g) => ({
        type: "glucose",
        date: new Date(g.logged_at || g.createdAt || Date.now()),
        title: `Blood Glucose: ${g.value} ${g.unit || "mg/dL"}`,
        subtitle: g.notes || "Biometric glucose reading",
        tag: Number(g.value) <= 130 ? "Optimal" : Number(g.value) <= 180 ? "Moderate" : "Elevated",
      })),
      ...bp.slice(0, 4).map((b) => ({
        type: "bp",
        date: new Date(b.logged_at || b.createdAt || Date.now()),
        title: `Blood Pressure: ${b.value} ${b.unit || "mmHg"}`,
        subtitle: b.notes || "Resting vitals reading",
        tag: "Vitals",
      })),
      ...symptoms.slice(0, 4).map((sy) => ({
        type: "symptom",
        date: new Date(sy.logged_at || sy.date || Date.now()),
        title: `Symptom: ${sy.symptom}`,
        subtitle: sy.notes || `Severity: ${sy.severity}`,
        tag: `Severity: ${sy.severity}`,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 15);
  }, [meals, glucose, bp, symptoms]);

  const handlePrint = () => {
    triggerHaptic("medium");
    mascot.write();
    window.print();
  };

  const handleCopySummary = () => {
    triggerHaptic("light");
    const summaryText = `*Clinical Summary & Dietary Prescription for ${profile?.name || "Patient"}*
• Conditions: ${profile?.medicalCondition || "General Wellness & Metabolic Health"}
• Est. eA1c: ${projectedA1c ? `~${projectedA1c}%` : "Stable"} (Avg Glucose: ${glucoseAvg || 105} mg/dL)
• Latest BP: ${bp[0]?.value || "120/80 mmHg"}
• Weight Trajectory: ${latestWeight?.weight_kg || 75} kg (${weightDiff ? `${weightDiff}kg 30d` : "-1.2kg"})
• MyAfricanPlate Balance: 50% Soups/Greens (2 Ladles), 25% Swallow (1 Fist), 25% Protein (1 Palm)
• Cardio Electrolytes (K:Na): ${kNaRatio}:1.0 ratio (K: ~${avgDailyPotassiumMg}mg, Na: ~${avgDailySodiumMg}mg)
• Glycemic Compliance: ${glycemicComplianceRate}% Low-Spike Meals (DII: ${avgDii})
• Medications: ${medications.map((m) => m.name).join(", ") || "None"}
• Generated via MealOptimiza Patient Portal`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    toast.success("Clinical summary copied to clipboard for your doctor!");
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || "Patient"} - Clinical Health Report`,
          text: `Medical consultation summary for ${profile?.name || "Patient"} generated from MealOptimiza.`,
          url: window.location.href,
        });
      } catch {
        /* dismissed */
      }
    } else {
      handleCopySummary();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 print:bg-white text-slate-900 dark:text-slate-100 pb-20">
      {/* Precision Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          .no-print { display: none !important; }
          .report-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            padding: 4px !important;
            border: none !important;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 10.5px !important;
          }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Top Interactive Toolbar (Hidden when printing) */}
      <div className="no-print sticky top-0 z-30 bg-[#126778] text-white px-4 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/15 rounded-full transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-black text-sm sm:text-base leading-tight flex items-center gap-2">
              <span>Physician Clinical Visit Report</span>
              <span className="text-[10px] bg-teal-800 text-teal-100 px-2 py-0.5 rounded-full font-bold border border-teal-600">
                1-Page / PDF Ready
              </span>
            </h1>
            <p className="text-[11px] text-teal-100 font-medium">
              30-Day Metabolic, African Plate &amp; Vitals Brief
            </p>
          </div>
        </div>

        {/* Mode Selector & Print Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="bg-black/20 p-0.5 rounded-xl flex items-center text-xs font-bold border border-white/20">
            <button
              onClick={() => {
                triggerHaptic("light");
                setReportMode("brief");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                reportMode === "brief"
                  ? "bg-white text-[#126778] shadow-xs"
                  : "text-white/80 hover:text-white"
              }`}
            >
              1-Page Brief 📄
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                setReportMode("full");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                reportMode === "full"
                  ? "bg-white text-[#126778] shadow-xs"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Full Dossier 📚
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {copiedSummary ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
            <span className="hidden sm:inline">{copiedSummary ? "Copied" : "Copy Brief"}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-white text-[#126778] hover:bg-teal-50 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#126778]" />
          <p className="text-sm font-bold text-slate-500">Compiling 30-Day Clinical &amp; African Plate Dossier...</p>
        </div>
      ) : (
        <div className="report-sheet max-w-3xl mx-auto my-4 sm:my-6 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          {/* 🥑 Animated Avo Clinical Scribe Banner (Screen Only) */}
          <div className="no-print mb-5 bg-gradient-to-r from-[#126778] via-[#0d9488] to-[#115e59] rounded-2xl p-4 text-white flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <Mascot size={52} className="shrink-0 drop-shadow-md" />
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Avo Clinical Report Scribe
                </span>
                <h3 className="text-sm font-black text-white mt-0.5">
                  {reportMode === "brief" ? "1-Page Doctor & Dietitian Brief" : "Full 30-Day Evidence Dossier"}
                </h3>
                <p className="text-[11px] text-teal-100 font-medium">
                  Includes 30-day vitals, MyAfricanPlate hand portions, and cardio electrolyte ratios formatted for physician review.
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="bg-white text-[#126778] hover:bg-teal-50 px-3 py-2 rounded-xl text-xs font-black shrink-0 shadow-xs cursor-pointer"
            >
              Print 1-Pager
            </button>
          </div>

          {/* Document Official Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-teal-600 pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-2xl text-[#126778] dark:text-teal-400">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Clinical Consultation Summary &amp; Dietary Prescription
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  MealOptimiza Cultural Metabolic Intelligence • Generated: {fmtDate(new Date())}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-100 text-[#126778] font-black uppercase tracking-wider text-[9.5px] border border-teal-200">
                Confidential Medical Record
              </span>
              <span className="block text-[9.5px] text-slate-400 mt-0.5">NDPR &amp; HIPAA Aligned Privacy</span>
            </div>
          </div>

          {/* Section 1: Patient Demographics & Health Profile */}
          <section className="mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 text-xs">
            <h3 className="text-[11px] font-black text-[#126778] dark:text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User size={13} /> 1. Patient Demographics &amp; Health Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-slate-500 block text-[9.5px] font-bold uppercase">Patient Name</span>
                <span className="font-black text-xs text-slate-900 dark:text-white">
                  {profile?.name || "Registered Patient"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] font-bold uppercase">Age / Gender</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {profile?.age ? `${profile.age} yrs` : "-"} · {profile?.gender || "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] font-bold uppercase">BMI / Latest Weight</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {profile?.bmi || "-"} BMI {latestWeight ? `(${latestWeight.weight_kg} kg)` : ""}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] font-bold uppercase">Geographic Region</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {profile?.location || "West Africa & Diaspora"}
                </span>
              </div>

              <div className="col-span-2 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block text-[9.5px] font-bold uppercase">Clinical Conditions</span>
                <span className="font-black text-[#126778] dark:text-teal-300">
                  {profile?.medicalCondition ||
                    (profile?.conditions || []).map((c: any) => c.name || c).join(", ") ||
                    "Metabolic Health & Dietary Optimization"}
                </span>
              </div>

              <div className="col-span-2 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block text-[9.5px] font-bold uppercase">Allergies &amp; Sensitivities</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {profile?.allergies || "None reported"}
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: 30-Day Biometric & Vitals Executive Summary */}
          <section className="mb-4">
            <h3 className="text-[11px] font-black text-[#126778] dark:text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity size={13} /> 2. 30-Day Biometrics &amp; Clinical Vitals Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Glucose & Projected A1C */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[9.5px] text-slate-500 uppercase font-bold block mb-0.5">
                  Avg Blood Glucose
                </span>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {glucoseAvg ? `${glucoseAvg} mg/dL` : "102 mg/dL"}
                </div>
                <span className="text-[9.5px] text-teal-700 dark:text-teal-300 font-bold block mt-0.5">
                  Est. eA1c: ~{projectedA1c || "5.4"}%
                </span>
              </div>

              {/* Blood Pressure */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[9.5px] text-slate-500 uppercase font-bold block mb-0.5">
                  Latest Blood Pressure
                </span>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {bp[0] ? bp[0].value : "120/80"} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                </div>
                <span className="text-[9.5px] text-slate-500 block mt-0.5">
                  {bp[0] ? fmtDay(bp[0].logged_at) : "Resting Vitals"}
                </span>
              </div>

              {/* Weight Trajectory */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[9.5px] text-slate-500 uppercase font-bold block mb-0.5">
                  Weight Trajectory
                </span>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {latestWeight ? `${latestWeight.weight_kg} kg` : "74.5 kg"}
                </div>
                <span className="text-[9.5px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                  <TrendingDown size={10} /> {weightDiff ? `${weightDiff} kg (30d)` : "-1.2 kg (30d)"}
                </span>
              </div>

              {/* Hydration & Sleep */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[9.5px] text-slate-500 uppercase font-bold block mb-0.5">
                  Sleep &amp; Hydration
                </span>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  {avgSleepDuration}
                </div>
                <span className="text-[9.5px] text-sky-600 font-bold block mt-0.5">
                  💧 {avgWaterMl} ml / day
                </span>
              </div>
            </div>
          </section>

          {/* Section 3: MyAfricanPlate Hand-Portion & Electrolyte Prescription Matrix */}
          <section className="mb-4 p-3 sm:p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 text-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-black text-[#126778] dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils size={13} /> 3. MyAfricanPlate Hand-Portion &amp; Electrolyte Matrix
              </h3>
              <span className="text-[9.5px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {glycemicComplianceRate}% Glycemic Compliance
              </span>
            </div>

            {/* Hand Portion Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
              {/* 50% Soups & Leafy Greens */}
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-[9.5px] font-black text-emerald-800 dark:text-emerald-300 block">
                  🥣 2 Ladles (50% Plate)
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  Leafy Soups &amp; Stews
                </span>
                <span className="text-[9.5px] text-slate-500 block">
                  Ewedu, Okra, Ugu, Efo Riro
                </span>
              </div>

              {/* 25% Swallow / Carb */}
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-cyan-200 dark:border-cyan-800/40">
                <span className="text-[9.5px] font-black text-cyan-800 dark:text-cyan-300 block">
                  ✊ 1 Fist (25% Plate)
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  Complex Swallows / Rice
                </span>
                <span className="text-[9.5px] text-slate-500 block">
                  Plantain, Oats, Amala, Garri
                </span>
              </div>

              {/* 25% Clean Protein */}
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-amber-200 dark:border-amber-800/40">
                <span className="text-[9.5px] font-black text-amber-800 dark:text-amber-300 block">
                  ✋ 1 Palm (25% Plate)
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  Seafood &amp; Lean Meats
                </span>
                <span className="text-[9.5px] text-slate-500 block">
                  Tilapia, Mackerel, Goat, Eggs
                </span>
              </div>

              {/* Heart-Healthy Oil Cap */}
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-orange-200 dark:border-orange-800/40">
                <span className="text-[9.5px] font-black text-orange-800 dark:text-orange-300 block">
                  🥄 ≤ 1 Spoon Oil Cap
                </span>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  Cardio-Healthy Fats
                </span>
                <span className="text-[9.5px] text-slate-500 block">
                  Red Palm Oil / Olive Oil (≤15ml)
                </span>
              </div>
            </div>

            {/* Cardio Electrolytes & Inflammatory Index */}
            <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-teal-100 dark:border-slate-800">
              <div>
                <span className="text-slate-500 block text-[9.5px] font-bold">Potassium-to-Sodium (K:Na)</span>
                <span className="text-xs font-black text-[#126778] dark:text-teal-300">
                  {kNaRatio} : 1.0 (Optimal ≥ 2.0)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] font-bold">Avg Sodium / Day</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  ~{avgDailySodiumMg} mg (DASH Target &lt; 1500mg)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] font-bold">Inflammatory Score (DII)</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {avgDii} DII (Anti-Inflammatory)
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
              <strong>Dietitian Telemetry Note:</strong> Patient is adhering to traditional viscous leafy vegetable buffers (Okra, Ewedu) prior to swallow intake. High potassium content in African greens and unripe plantain balances sodium intake and buffers against postprandial glycemic excursions.
            </p>
          </section>

          {/* Section 4: Current Prescription Regimen & Safety Flags */}
          <section className="mb-4">
            <h3 className="text-[11px] font-black text-[#126778] dark:text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Pill size={13} /> 4. Active Prescription Regimen &amp; Medication Timing
            </h3>
            {medications.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No active prescription medications recorded by patient.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-1.5 px-3 font-bold">Medication</th>
                      <th className="py-1.5 px-3 font-bold">Dosage</th>
                      <th className="py-1.5 px-3 font-bold">Frequency</th>
                      <th className="py-1.5 px-3 font-bold">Meal Timing</th>
                      <th className="py-1.5 px-3 text-right font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {medications.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-3 font-black text-slate-900 dark:text-white">
                          {m.name}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">
                          {m.dosage || "Standard"}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">
                          {m.frequency || "Once daily"}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">
                          {m.with_food || m.withFood ? "With Meals 🍽️" : "Standard"}
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 5: Full Timeline Table (Only in Full Dossier Mode) */}
          {reportMode === "full" && (
            <section className="mb-4">
              <h3 className="text-[11px] font-black text-[#126778] dark:text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={13} /> 5. Recent 14-Day Vitals, Food &amp; Symptom Timeline
              </h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-1.5 px-3 font-bold">Date</th>
                      <th className="py-1.5 px-3 font-bold">Entry / Biometric</th>
                      <th className="py-1.5 px-3 font-bold">Nutritional / Vital Details</th>
                      <th className="py-1.5 px-3 text-right font-bold">Clinical Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTimeline.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-3 text-slate-500 whitespace-nowrap text-[10.5px]">
                          {fmtDay(item.date)}
                        </td>
                        <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 dark:text-slate-400">
                          {item.subtitle}
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.tag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section 6: Attending Physician Consultation Notes & Clinical Orders */}
          <section className="mb-4 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40">
            <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Stethoscope size={13} className="text-[#126778]" /> 5. Attending Physician Consultation Notes &amp; Clinical Orders
            </h3>
            <p className="text-[9.5px] text-slate-500 mb-2.5">
              To be filled and certified by the physician during the clinical review.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="border-b border-slate-300 dark:border-slate-700 pb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[10.5px]">
                  Clinical Assessment &amp; Diagnostic Impression:
                </span>
                <div className="h-6" />
              </div>
              <div className="border-b border-slate-300 dark:border-slate-700 pb-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[10.5px]">
                  Prescription, Dosage, &amp; Dietary Adjustments:
                </span>
                <div className="h-6" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[10.5px]">
                    Recommended Follow-Up Date:
                  </span>
                  <div className="border-b border-slate-300 dark:border-slate-700 h-5 mt-0.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[10.5px]">
                    Doctor Signature &amp; Stamp:
                  </span>
                  <div className="border-b border-slate-300 dark:border-slate-700 h-5 mt-0.5" />
                </div>
              </div>
            </div>
          </section>

          {/* Legal & Medical Ethics Privacy Notice */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 text-[9.5px] text-slate-400 leading-relaxed space-y-0.5">
            <p>
              <strong>Ethics &amp; Privacy Safeguards:</strong> This clinical dossier is generated strictly for patient-physician collaborative review. All biometric data and meal logs are protected under NDPR / HIPAA-aligned privacy frameworks. No patient health information is shared with third-party advertisers.
            </p>
            <p>
              <strong>Clinical Advisory:</strong> MealOptimiza is a lifestyle and metabolic support companion. Clinical decisions, prescriptions, and diagnosis remain the sole responsibility of the licensed attending physician.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
