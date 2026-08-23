import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, Utensils, Droplet, Info, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { SkeletonList } from "../components/SkeletonLoader";
import MascotEmptyState from "../components/MascotEmptyState";
import AmbientBackground from "../components/AmbientBackground";
import { toast } from "sonner";
import { getMealLogs, getBiometrics } from "../../lib/api";

// Correlation windows (ms)
const POST_MIN = 30 * 60000;   // start looking 30 min after the meal
const POST_MAX = 180 * 60000;  // up to 3 h after
const PRE_MAX = 120 * 60000;   // baseline = a reading up to 2 h before

interface Correlated {
  id: string;
  foodName: string;
  mealType?: string;
  time: Date;
  peak: number;
  baseline: number | null;
  delta: number | null;
}

const impactColor = (d: number) => (d >= 50 ? "#ef4444" : d >= 30 ? "#f59e0b" : "#10b981");
const impactLabel = (d: number) => (d >= 50 ? "High spike" : d >= 30 ? "Moderate" : "Gentle");

export default function GlucoseInsights() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [correlated, setCorrelated] = useState<Correlated[]>([]);
  const [hasMeals, setHasMeals] = useState(false);
  const [hasGlucose, setHasGlucose] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [mealLogs, biometrics] = await Promise.all([getMealLogs(), getBiometrics()]);

        const meals = (mealLogs || [])
          .map((m: any) => {
            const t = m.date ? new Date(`${m.date}T${m.time || "12:00"}`) : m.createdAt ? new Date(m.createdAt) : null;
            return { ...m, _t: t };
          })
          .filter((m: any) => m._t && !isNaN(+m._t));

        const glucose = (biometrics || [])
          .filter((b: any) => b.metric === "glucose")
          .map((b: any) => ({ v: parseFloat(b.value), t: new Date(b.logged_at) }))
          .filter((g: any) => !isNaN(g.v) && !isNaN(+g.t));

        setHasMeals(meals.length > 0);
        setHasGlucose(glucose.length > 0);

        const out: Correlated[] = [];
        for (const meal of meals) {
          const mt = +meal._t;
          const post = glucose.filter((g: any) => +g.t >= mt + POST_MIN && +g.t <= mt + POST_MAX);
          if (!post.length) continue;
          const peak = Math.max(...post.map((g: any) => g.v));
          const pre = glucose
            .filter((g: any) => +g.t >= mt - PRE_MAX && +g.t <= mt)
            .sort((a: any, b: any) => +b.t - +a.t)[0];
          const baseline = pre ? pre.v : null;
          out.push({
            id: String(meal.id ?? mt),
            foodName: meal.foodName || "Meal",
            mealType: meal.mealType,
            time: meal._t,
            peak,
            baseline,
            delta: baseline != null ? Math.round(peak - baseline) : null,
          });
        }
        out.sort((a, b) => +b.time - +a.time);
        setCorrelated(out);
      } catch (err) {
        toast.error("Couldn't load insights", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Rank foods by average post-meal delta (only meals with a baseline)
  const byFood: Record<string, number[]> = {};
  correlated.filter((c) => c.delta != null).forEach((c) => {
    const key = c.foodName.trim();
    (byFood[key] ||= []).push(c.delta as number);
  });
  const foodRanking = Object.entries(byFood)
    .map(([name, deltas]) => ({
      name,
      avg: Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length),
      count: deltas.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 relative">
      <AmbientBackground />
      <div className="relative z-10">
        <PageHeader title="Meal & Glucose Insights" showHome actions={<TrendingUp className="h-6 w-6 text-white" />} />
      </div>

      <div className="px-6 mt-6 space-y-6">
        {/* How it works */}
        <div className="bg-white/60 rounded-xl p-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-[#1f7a8c] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700">
            We match each logged meal with your glucose readings taken 30 minutes to 3 hours afterwards, and compare to your
            level just before eating. For best results, log a glucose reading about 1–2 hours after meals.
          </p>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : !hasMeals || !hasGlucose ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-1">Not enough data yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              {!hasMeals && !hasGlucose
                ? "Log some meals and glucose readings to see which foods affect your blood sugar."
                : !hasMeals
                ? "Log a few meals so we can match them to your glucose readings."
                : "Log some glucose readings (Bio-Digital Twin) after meals to build correlations."}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate("/logs")} className="px-4 py-2 rounded-xl bg-[#1f7a8c] text-white text-sm font-medium hover:bg-[#1a6273]">
                Log a meal
              </button>
              <button onClick={() => navigate("/biometrics")} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200">
                Log glucose
              </button>
            </div>
          </div>
        ) : correlated.length === 0 ? (
          <div className="bg-white rounded-2xl p-8">
            <MascotEmptyState
              title="No matches yet"
              subtitle="You have meals and glucose readings, but none line up yet. Try logging a glucose reading 1–2 hours after your next meal."
            />
          </div>
        ) : (
          <>
            {/* Foods ranked by impact */}
            {foodRanking.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-[#1f7a8c]" />
                  Foods ranked by glucose impact
                </h3>
                <div className="space-y-3">
                  {foodRanking.map((f) => (
                    <div key={f.name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{f.name}</div>
                        <div className="text-xs text-gray-500">
                          {f.count} meal{f.count > 1 ? "s" : ""} · avg {impactLabel(f.avg)}
                        </div>
                      </div>
                      <div className="text-lg font-bold flex-shrink-0" style={{ color: impactColor(f.avg) }}>
                        {f.avg >= 0 ? "+" : ""}{f.avg} <span className="text-xs font-normal">mg/dL</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent correlated meals */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent meals</h3>
              <div className="space-y-2">
                {correlated.slice(0, 20).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{c.foodName}</div>
                      <div className="text-xs text-gray-500">
                        {c.time.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        {c.mealType ? ` · ${c.mealType}` : ""}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {c.delta != null ? (
                        <>
                          <div className="text-base font-bold" style={{ color: impactColor(c.delta) }}>
                            {c.delta >= 0 ? "+" : ""}{c.delta} mg/dL
                          </div>
                          <div className="text-xs text-gray-400">peak {c.peak}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-600">peak {c.peak} mg/dL</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 px-1">
              These insights are estimates from your own logs to help you spot patterns — they are not medical advice. Discuss
              any changes with your doctor.
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
