import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Printer, Loader2, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import {
  getUserProfile,
  getBiometrics,
  getMedications,
  getWeightLogs,
  getMealLogs,
} from "../../lib/api";

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const fmtDay = (d: string | Date) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function HealthReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [biometrics, setBiometrics] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, b, m, w, ml] = await Promise.all([
          getUserProfile().catch(() => null),
          getBiometrics().catch(() => []),
          getMedications().catch(() => []),
          getWeightLogs().catch(() => []),
          getMealLogs().catch(() => []),
        ]);
        setProfile(p);
        setBiometrics(b || []);
        setMedications(m || []);
        setWeights(w || []);
        setMeals(ml || []);
      } catch (err) {
        toast.error("Couldn't build the report", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byMetric = (metric: string) =>
    biometrics
      .filter((r) => r.metric === metric)
      .sort((a, b) => +new Date(b.logged_at) - +new Date(a.logged_at));

  const glucose = byMetric("glucose");
  const bp = byMetric("blood_pressure");
  const glucoseNums = glucose.map((g) => parseFloat(g.value)).filter((n) => !isNaN(n));
  const glucoseAvg = glucoseNums.length ? Math.round(glucoseNums.slice(0, 14).reduce((a, b) => a + b, 0) / Math.min(glucoseNums.length, 14)) : null;
  const latestWeight = weights.slice().sort((a, b) => +new Date(b.logged_at) - +new Date(a.logged_at))[0];

  const recentMeals = meals
    .map((m) => ({ ...m, _t: m.date ? new Date(`${m.date}T${m.time || "12:00"}`) : m.createdAt ? new Date(m.createdAt) : null }))
    .filter((m) => m._t && !isNaN(+m._t))
    .sort((a, b) => +b._t - +a._t)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-sheet { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {/* Toolbar (hidden when printing) */}
      <div className="no-print sticky top-0 z-10 bg-[#1f7a8c] text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full" aria-label="Back">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold flex-1">Doctor Report</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white text-[#1f7a8c] px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="report-sheet max-w-2xl mx-auto my-6 bg-white shadow-lg rounded-xl p-8 text-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-6 w-6 text-[#1f7a8c]" />
              <div>
                <div className="text-xl font-bold">Health Report</div>
                <div className="text-xs text-gray-500">Generated {fmtDate(new Date())} · MealOptimizer</div>
              </div>
            </div>
          </div>

          {/* Patient */}
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-[#1f7a8c] uppercase tracking-wide mb-2">Patient</h2>
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <div><span className="text-gray-500">Name:</span> {profile?.name || "—"}</div>
              <div><span className="text-gray-500">Age:</span> {profile?.age || "—"}</div>
              <div><span className="text-gray-500">Condition:</span> {profile?.medicalCondition || "—"}</div>
              <div><span className="text-gray-500">BMI:</span> {profile?.bmi || "—"}</div>
              <div><span className="text-gray-500">Location:</span> {profile?.location || "—"}</div>
              {profile?.allergies ? <div><span className="text-gray-500">Allergies:</span> {profile.allergies}</div> : null}
            </div>
          </section>

          {/* Summary */}
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-[#1f7a8c] uppercase tracking-wide mb-2">Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="border rounded-lg p-3">
                <div className="text-lg font-bold">{glucose[0] ? glucose[0].value : "—"}</div>
                <div className="text-xs text-gray-500">Latest glucose (mg/dL)</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-lg font-bold">{glucoseAvg ?? "—"}</div>
                <div className="text-xs text-gray-500">Avg glucose (recent)</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-lg font-bold">{bp[0] ? bp[0].value : "—"}</div>
                <div className="text-xs text-gray-500">Latest BP (mmHg)</div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-lg font-bold">{latestWeight ? `${latestWeight.weight_kg}kg` : "—"}</div>
                <div className="text-xs text-gray-500">Latest weight</div>
              </div>
            </div>
          </section>

          {/* Glucose readings */}
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-[#1f7a8c] uppercase tracking-wide mb-2">Glucose readings</h2>
            {glucose.length === 0 ? (
              <p className="text-sm text-gray-500">No glucose readings logged.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {glucose.slice(0, 15).map((g) => (
                    <tr key={g.id} className="border-b last:border-0">
                      <td className="py-1 text-gray-500">{fmtDate(g.logged_at)}</td>
                      <td className="py-1 text-right font-medium">{g.value} {g.unit || "mg/dL"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Blood pressure */}
          {bp.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-semibold text-[#1f7a8c] uppercase tracking-wide mb-2">Blood pressure</h2>
              <table className="w-full text-sm">
                <tbody>
                  {bp.slice(0, 10).map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-1 text-gray-500">{fmtDate(r.logged_at)}</td>
                      <td className="py-1 text-right font-medium">{r.value} {r.unit || "mmHg"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Medications */}
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-[#1f7a8c] uppercase tracking-wide mb-2">Medications</h2>
            {medications.length === 0 ? (
              <p className="text-sm text-gray-500">No medications recorded.</p>
            ) : (
              <ul className="text-sm space-y-1">
                {medications.map((m) => (
                  <li key={m.id} className="flex justify-between border-b last:border-0 py-1">
                    <span className="font-medium">{m.name}{m.active === false ? " (inactive)" : ""}</span>
                    <span className="text-gray-500">{[m.dosage, m.frequency].filter(Boolean).join(" · ") || "—"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recent meals */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-[#1f7a8c] uppercase tracking-wide mb-2">Recent meals</h2>
            {recentMeals.length === 0 ? (
              <p className="text-sm text-gray-500">No meals logged.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recentMeals.map((m, i) => (
                    <tr key={m.id ?? i} className="border-b last:border-0">
                      <td className="py-1 text-gray-500 whitespace-nowrap">{fmtDay(m._t)}</td>
                      <td className="py-1 px-2">{m.foodName || "Meal"}{m.mealType ? ` (${m.mealType})` : ""}</td>
                      <td className="py-1 text-right text-gray-600 whitespace-nowrap">
                        {m.calories ? `${m.calories} kcal` : ""}{m.carbs ? ` · ${m.carbs}g carbs` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <p className="text-xs text-gray-400 border-t pt-3">
            This report is generated from the patient's self-logged data in MealOptimizer and is provided to support a
            clinical conversation. It is not a diagnostic document.
          </p>
        </div>
      )}
    </div>
  );
}
