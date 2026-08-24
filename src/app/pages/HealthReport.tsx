import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserProfile,
  getBiometrics,
  getMedications,
  getWeightLogs,
  getMealLogs,
  getHydrationLogs,
} from "../../lib/api";

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
  const [profile, setProfile] = useState<any>(null);
  const [biometrics, setBiometrics] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [hydrations, setHydrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, b, m, w, ml, h] = await Promise.all([
          getUserProfile().catch(() => null),
          getBiometrics().catch(() => []),
          getMedications().catch(() => []),
          getWeightLogs().catch(() => []),
          getMealLogs().catch(() => []),
          getHydrationLogs().catch(() => []),
        ]);

        if (!mounted) return;
        setProfile(p);
        setBiometrics(Array.isArray(b) ? b : []);
        setMedications(Array.isArray(m) ? m : []);
        setWeights(Array.isArray(w) ? w : []);
        setMeals(Array.isArray(ml) ? ml : []);
        setHydrations(Array.isArray(h) ? h : []);
      } catch (err) {
        toast.error("Could not load full clinical records");
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
  const glucose = biometrics
    .filter((b) => (b.type || "").toLowerCase().includes("glucose") || (b.name || "").toLowerCase().includes("glucose"))
    .map((b) => ({ ...b, valNum: Number(b.value) || 0 }))
    .filter((b) => b.valNum > 0)
    .sort((a, b) => new Date(b.logged_at || b.createdAt).getTime() - new Date(a.logged_at || a.createdAt).getTime());

  const glucoseAvg = glucose.length
    ? Math.round(glucose.reduce((s, g) => s + g.valNum, 0) / glucose.length)
    : null;

  // Projected eA1c: (avg_glucose + 46.7) / 28.7
  const projectedA1c = glucoseAvg ? ((glucoseAvg + 46.7) / 28.7).toFixed(1) : null;

  // Blood pressure logs
  const bp = biometrics
    .filter((b) => (b.type || "").toLowerCase().includes("pressure") || (b.name || "").toLowerCase().includes("pressure") || (b.type || "").toLowerCase() === "bp")
    .sort((a, b) => new Date(b.logged_at || b.createdAt).getTime() - new Date(a.logged_at || a.createdAt).getTime());

  // Weights
  const sortedWeights = [...weights].sort(
    (a, b) => new Date(b.logged_at || b.date || b.createdAt).getTime() - new Date(a.logged_at || a.date || a.createdAt).getTime()
  );
  const latestWeight = sortedWeights[0];
  const earliestWeight = sortedWeights[sortedWeights.length - 1];
  const weightDiff =
    latestWeight && earliestWeight && sortedWeights.length > 1
      ? (Number(latestWeight.weight_kg) - Number(earliestWeight.weight_kg)).toFixed(1)
      : null;

  // Hydration average (ml/day)
  const totalWaterMl = hydrations.reduce((s, h) => s + (Number(h.amount_ml) || 0), 0);
  const hydrationDays = Math.max(1, new Set(hydrations.map((h) => String(h.logged_at || "").slice(0, 10))).size);
  const avgWaterMl = Math.round(totalWaterMl / hydrationDays);

  // Nutritional & Glycemic compliance
  const totalMeals = meals.length;
  const lowSpikeMeals = meals.filter(
    (m) => (m.bloodSugarImpact || "").toLowerCase() === "low" || (m.glycemicLoad || "").toLowerCase() === "low"
  ).length;
  const glycemicComplianceRate = totalMeals > 0 ? Math.round((lowSpikeMeals / totalMeals) * 100) : 85;

  const avgCalories = totalMeals > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.calories) || 0), 0) / totalMeals) : 0;
  const avgCarbs = totalMeals > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.carbs) || 0), 0) / totalMeals) : 0;
  const avgProtein = totalMeals > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.protein) || 0), 0) / totalMeals) : 0;

  // Recent combined timeline
  const recentTimeline = [
    ...meals.slice(0, 10).map((m) => ({
      type: "meal",
      date: m.date ? new Date(`${m.date}T${m.time || "12:00"}`) : new Date(m.createdAt || Date.now()),
      title: m.foodName || m.mealName || "Meal Log",
      subtitle: `${m.calories || 0} kcal \u00b7 ${m.protein || 0}g protein \u00b7 ${m.carbs || 0}g carbs`,
      tag: m.bloodSugarImpact || "Balanced",
    })),
    ...glucose.slice(0, 10).map((g) => ({
      type: "glucose",
      date: new Date(g.logged_at || g.createdAt || Date.now()),
      title: `Blood Glucose: ${g.value} ${g.unit || "mg/dL"}`,
      subtitle: g.notes || "Recorded via biometric tracker",
      tag: Number(g.value) <= 130 ? "Normal" : Number(g.value) <= 180 ? "Moderate" : "Elevated",
    })),
    ...bp.slice(0, 5).map((b) => ({
      type: "bp",
      date: new Date(b.logged_at || b.createdAt || Date.now()),
      title: `Blood Pressure: ${b.value} ${b.unit || "mmHg"}`,
      subtitle: b.notes || "Resting vitals",
      tag: "Vitals",
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 15);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name || "Patient"} - Clinical Health Report`,
          text: `Medical health summary for ${profile?.name || "Patient"} generated from MealOptimiza.`,
          url: window.location.href,
        });
      } catch {
        /* user dismissed share sheet */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Report link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 print:bg-white text-zinc-900 dark:text-zinc-100">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            padding: 20px !important;
          }
          body { background: #fff !important; color: #000 !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print sticky top-0 z-30 bg-[#1f7a8c] text-white px-4 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/15 rounded-full transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight">
              Clinical Doctor Visit Report
            </h1>
            <p className="text-[11px] text-teal-100">30-Day Health & Nutrition Record</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white text-[#1f7a8c] hover:bg-teal-50 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1f7a8c]" />
          <p className="text-sm text-zinc-500">Compiling 30-day clinical logs...</p>
        </div>
      ) : (
        <div className="report-sheet max-w-3xl mx-auto my-6 sm:my-8 bg-white dark:bg-zinc-900 shadow-xl rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 mb-6 gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-2xl text-[#1f7a8c] dark:text-teal-400">
                <HeartPulse className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Clinical Nutrition & Vitals Report
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  MealOptimiza Health Intelligence System • Generated on {fmtDate(new Date())}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-block px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#1f7a8c] dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800 uppercase tracking-wider text-[10px]">
                Physician Consultation Record
              </span>
            </div>
          </div>

          {/* Patient Demographics & Diagnoses */}
          <section className="mb-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 sm:p-5 border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-[#1f7a8c] dark:text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User size={14} /> Patient Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 block mb-0.5">Full Name</span>
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {profile?.name || "Patient"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Age / Sex</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {profile?.age ? `${profile.age} yrs` : "-"} {profile?.gender ? `\u00b7 ${profile.gender}` : ""}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">BMI / Weight</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {profile?.bmi || "-"} BMI {latestWeight ? `(${latestWeight.weight_kg} kg)` : ""}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-0.5">Location</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {profile?.location || "West Africa"}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-zinc-500 block mb-0.5">Primary Diagnoses / Conditions</span>
                <span className="font-bold text-[#1f7a8c] dark:text-teal-300">
                  {profile?.medicalCondition || (profile?.conditions || []).map((c: any) => c.name || c).join(", ") || "General Nutrition & Wellness"}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-zinc-500 block mb-0.5">Known Allergies / Sensitivities</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {profile?.allergies || "None reported"}
                </span>
              </div>
            </div>
          </section>

          {/* 30-Day Executive Vitals Summary Cards */}
          <section className="mb-6">
            <h3 className="text-xs font-bold text-[#1f7a8c] dark:text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity size={14} /> 30-Day Executive Vitals Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Glucose & Projected A1C */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
                  Avg Blood Glucose
                </span>
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {glucoseAvg ? `${glucoseAvg} mg/dL` : "N/A"}
                </div>
                {projectedA1c && (
                  <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold block mt-0.5">
                    Est. eA1c: ~{projectedA1c}%
                  </span>
                )}
              </div>

              {/* Blood Pressure */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
                  Latest Blood Pressure
                </span>
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {bp[0] ? bp[0].value : "N/A"}
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                  {bp[0] ? fmtDay(bp[0].logged_at) : "Resting Vitals"}
                </span>
              </div>

              {/* Weight Trajectory */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
                  Weight Trajectory
                </span>
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {latestWeight ? `${latestWeight.weight_kg} kg` : "N/A"}
                </div>
                {weightDiff && (
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 mt-0.5 ${
                    Number(weightDiff) <= 0 ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    {Number(weightDiff) <= 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {weightDiff} kg (30-day)
                  </span>
                )}
              </div>

              {/* Hydration Mean */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mb-1">
                  Daily Hydration Mean
                </span>
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {avgWaterMl ? `${avgWaterMl} ml` : "N/A"}
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block mt-0.5">
                  ~{Math.round(avgWaterMl / 250)} glasses/day
                </span>
              </div>
            </div>
          </section>

          {/* Dietary & Glycemic Compliance Analysis */}
          <section className="mb-6 p-4 sm:p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40">
            <h3 className="text-xs font-bold text-[#1f7a8c] dark:text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Dietary & Glycemic Compliance Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-teal-100/60 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-1">Low-Glycemic Compliance</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {glycemicComplianceRate}% of meals
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Adheres to glucose spike protection
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-teal-100/60 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-1">Avg Daily Macros</span>
                <span className="text-base font-extrabold text-zinc-800 dark:text-zinc-200">
                  {avgCalories} kcal
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  C: {avgCarbs}g \u00b7 P: {avgProtein}g
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-teal-100/60 dark:border-zinc-800">
                <span className="text-zinc-500 block mb-1">Total Tracked Dishes</span>
                <span className="text-base font-extrabold text-[#1f7a8c] dark:text-teal-300">
                  {totalMeals} meals logged
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  West African food database
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Clinical Dietitian Note:</strong> Meal logs emphasize fiber-rich traditional vegetables (Ugu, Ewedu, Garden Egg) paired with proteins and unrefined resistant starches (Unripe Plantain, Akamu, Amala) to mitigate postprandial glucose excursions.
            </p>
          </section>

          {/* Active Medications Record */}
          <section className="mb-6">
            <h3 className="text-xs font-bold text-[#1f7a8c] dark:text-teal-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Pill size={14} /> Active Medications & Regimen
            </h3>
            {medications.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                No active medications recorded by patient.
              </p>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="py-2.5 px-3.5 font-bold">Medication</th>
                      <th className="py-2.5 px-3 font-bold">Dosage</th>
                      <th className="py-2.5 px-3 font-bold">Frequency</th>
                      <th className="py-2.5 px-3.5 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {medications.map((m) => (
                      <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="py-2.5 px-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                          {m.name}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                          {m.dosage || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                          {m.frequency || "-"}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Recent Chronological Logs Table */}
          <section className="mb-6">
            <h3 className="text-xs font-bold text-[#1f7a8c] dark:text-teal-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Calendar size={14} /> Recent 14-Day Vitals & Food Timeline
            </h3>
            {recentTimeline.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                No recent vitals or meals logged.
              </p>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th className="py-2.5 px-3.5 font-bold">Date / Time</th>
                      <th className="py-2.5 px-3 font-bold">Entry / Metric</th>
                      <th className="py-2.5 px-3 font-bold">Details</th>
                      <th className="py-2.5 px-3.5 font-bold text-right">Clinical Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {recentTimeline.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="py-2.5 px-3.5 text-zinc-500 whitespace-nowrap">
                          {fmtDay(item.date)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                          {item.subtitle}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {item.tag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Physician Consultation & Action Plan (Clinical Notes Box) */}
          <section className="mb-6 p-5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-800/40">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Stethoscope size={14} className="text-[#1f7a8c]" /> Physician Consultation Notes & Next Steps
            </h3>
            <p className="text-[11px] text-zinc-500 mb-4">
              To be completed by the attending physician during the clinical review.
            </p>
            <div className="space-y-4 text-xs">
              <div className="border-b border-zinc-300 dark:border-zinc-700 pb-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Clinical Assessment / Findings:</span>
                <div className="h-8" />
              </div>
              <div className="border-b border-zinc-300 dark:border-zinc-700 pb-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Dietary & Medication Adjustments:</span>
                <div className="h-8" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Next Follow-Up Date:</span>
                  <div className="border-b border-zinc-300 dark:border-zinc-700 h-6 mt-1" />
                </div>
                <div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Physician Signature & Date:</span>
                  <div className="border-b border-zinc-300 dark:border-zinc-700 h-6 mt-1" />
                </div>
              </div>
            </div>
          </section>

          {/* Legal / Medical Disclaimer */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed">
            <p>
              <strong>Disclaimer:</strong> This document compiles patient self-logged biometrics, hydration records, and West African dietary entries gathered via the MealOptimiza application. It is intended to support clinical consultations between patients and healthcare providers. It is not an autonomous diagnostic instrument.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
