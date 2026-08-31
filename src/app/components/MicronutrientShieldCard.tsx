import React, { useState, useMemo } from "react";
import {
  Sun,
  ShieldCheck,
  Zap,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Info,
  Pill,
  Sparkles,
  ChevronRight,
  Droplets,
  HeartPulse,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { triggerHaptic } from "../utils/celebration";

export type DiasporaClimateRegion = "uk" | "us_north" | "canada" | "europe" | "africa_tropical" | "caribbean";

interface RegionClimateData {
  id: DiasporaClimateRegion;
  label: string;
  flag: string;
  uvIndexStatus: "Extremely Low (< 2)" | "Moderate (3-5)" | "Peak Tropical (8-11+)";
  melaninD3SynthesisRisk: "Severe Winter Deficiency (90% Reduction)" | "Moderate Deficiency" | "Optimal Cutaneous Synthesis";
  recommendedD3DailyIu: number;
  d3RecommendationReason: string;
}

const REGION_CLIMATE_MAP: Record<DiasporaClimateRegion, RegionClimateData> = {
  uk: {
    id: "uk",
    label: "United Kingdom (UK)",
    flag: "🇬🇧",
    uvIndexStatus: "Extremely Low (< 2)",
    melaninD3SynthesisRisk: "Severe Winter Deficiency (90% Reduction)",
    recommendedD3DailyIu: 3000,
    d3RecommendationReason: "Solar zenith angle between October and April produces zero cutaneous D3 synthesis. Melanin in Black skin filters 90%+ of weak UV-B rays.",
  },
  canada: {
    id: "canada",
    label: "Canada (High Latitude)",
    flag: "🇨🇦",
    uvIndexStatus: "Extremely Low (< 2)",
    melaninD3SynthesisRisk: "Severe Winter Deficiency (90% Reduction)",
    recommendedD3DailyIu: 4000,
    d3RecommendationReason: "High latitude limits UV-B year-round. Higher dosage required to maintain 25(OH)D blood levels above 40 ng/mL for insulin sensitivity.",
  },
  us_north: {
    id: "us_north",
    label: "United States (Northern / Midwest)",
    flag: "🇺🇸",
    uvIndexStatus: "Extremely Low (< 2)",
    melaninD3SynthesisRisk: "Severe Winter Deficiency (90% Reduction)",
    recommendedD3DailyIu: 3000,
    d3RecommendationReason: "Cold winters and indoor lifestyle drop systemic 25(OH)D levels, increasing insulin resistance and fatigue.",
  },
  europe: {
    id: "europe",
    label: "Continental Europe",
    flag: "🇪🇺",
    uvIndexStatus: "Extremely Low (< 2)",
    melaninD3SynthesisRisk: "Moderate Deficiency",
    recommendedD3DailyIu: 2500,
    d3RecommendationReason: "Seasonal reduction in sunshine impairs immune surveillance and arterial nitric oxide production.",
  },
  africa_tropical: {
    id: "africa_tropical",
    label: "West / Central / East Africa",
    flag: "🇳🇬",
    uvIndexStatus: "Peak Tropical (8-11+)",
    melaninD3SynthesisRisk: "Optimal Cutaneous Synthesis",
    recommendedD3DailyIu: 1000,
    d3RecommendationReason: "High ambient UV index year-round provides baseline cutaneous synthesis; maintenance dose supports endocrine and pancreatic beta-cell function.",
  },
  caribbean: {
    id: "caribbean",
    label: "Caribbean & Tropical Diaspora",
    flag: "🇯🇲",
    uvIndexStatus: "Peak Tropical (8-11+)",
    melaninD3SynthesisRisk: "Optimal Cutaneous Synthesis",
    recommendedD3DailyIu: 1000,
    d3RecommendationReason: "Abundant tropical sunlight maintains circulating D3; focus on dietary co-factors like magnesium and K2.",
  }
};

export default function MicronutrientShieldCard() {
  const { profile } = useUser();
  
  // Auto-detect default region from profile location or fallback to UK/US diaspora
  const [selectedRegion, setSelectedRegion] = useState<DiasporaClimateRegion>(() => {
    const loc = (profile?.location || "").toLowerCase();
    if (loc.includes("uk") || loc.includes("london") || loc.includes("england") || loc.includes("britain")) return "uk";
    if (loc.includes("canada") || loc.includes("toronto") || loc.includes("ontario")) return "canada";
    if (loc.includes("us") || loc.includes("america") || loc.includes("york") || loc.includes("texas")) return "us_north";
    if (loc.includes("nigeria") || loc.includes("ghana") || loc.includes("africa")) return "africa_tropical";
    return "uk";
  });

  const climateData = REGION_CLIMATE_MAP[selectedRegion];

  // Evaluate Metformin & B12 malabsorption risk
  const isTakingMetformin = useMemo(() => {
    const meds = (profile?.medications || "").toLowerCase();
    const cond = (profile?.medicalCondition || "").toLowerCase();
    return meds.includes("metformin") || meds.includes("glucophage") || cond.includes("diabet");
  }, [profile]);

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 border border-teal-100 dark:border-zinc-700 shadow-sm space-y-4">
      {/* Header with Title & Region Picker */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-2xl border border-amber-200/80">
            <Sun size={22} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#126778] dark:text-teal-300">
                Precision Micronutrient Shield
              </span>
              <span className="text-[9.5px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded-md">
                Diaspora D3 &amp; B12
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              Vitamin D3 &amp; B12 Melanin Bio-Shield 🧬
            </h3>
          </div>
        </div>
      </div>

      {/* Region Selector Pills */}
      <div>
        <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
          Select Your Current Living Climate / Country:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {(Object.keys(REGION_CLIMATE_MAP) as DiasporaClimateRegion[]).map((regKey) => {
            const item = REGION_CLIMATE_MAP[regKey];
            const isSelected = selectedRegion === regKey;
            return (
              <button
                key={regKey}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedRegion(regKey);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#126778] text-white shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-600 hover:bg-slate-100"
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* D3 Status Box */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200/80 dark:border-amber-900/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun size={16} className="text-amber-600" />
            <span className="text-xs font-black text-amber-950 dark:text-amber-200">
              Vitamin D3 (25-Hydroxyvitamin D) Target: 40-60 ng/mL
            </span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
            {climateData.recommendedD3DailyIu.toLocaleString()} IU / Day
          </span>
        </div>

        <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
          💡 <strong>Melanin &amp; Climate Science:</strong> {climateData.d3RecommendationReason}
        </p>

        {/* African Food Sources of D3 */}
        <div className="p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-amber-200/60 text-[10.5px] space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            🍲 Top African Dietary D3 &amp; Magnesium Boosters:
          </span>
          <p className="text-slate-600 dark:text-slate-400 leading-snug">
            • <strong>Titus (Mackerel) / Sardines / Salmon:</strong> Provides ~570 IU D3 + anti-inflammatory Omega-3s.
            <br />
            • <strong>Egg Yolks + Sautéed Ugwu:</strong> Magnesium in pumpkin leaves activates inactive D3 into calcitriol.
          </p>
        </div>
      </div>

      {/* B12 Metformin & Absorption Warning Box */}
      <div className="bg-teal-50/70 dark:bg-teal-950/30 rounded-2xl p-4 border border-teal-200/80 dark:border-teal-900/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill size={16} className="text-teal-700 dark:text-teal-300" />
            <span className="text-xs font-black text-teal-950 dark:text-teal-200">
              Vitamin B12 (Cobalamin) &amp; Neuropathy Defense
            </span>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            isTakingMetformin
              ? "bg-rose-100 text-rose-800 border border-rose-200"
              : "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
          }`}>
            {isTakingMetformin ? "High Risk (Metformin User) ⚠️" : "Target: 500+ pg/mL 🟢"}
          </span>
        </div>

        <p className="text-[11px] text-teal-900/90 dark:text-teal-200/90 leading-relaxed font-medium">
          {isTakingMetformin
            ? "⚠️ Clinical Notice: Metformin interferes with calcium-dependent B12 absorption in the ileum. Long-term use without B12 monitoring can cause peripheral neuropathy (numbness/tingling in feet) and fatigue."
            : "Vitamin B12 is essential for myelin sheath nerve health, red blood cell synthesis, and homocysteine cardiovascular control."}
        </p>

        {/* African Food Sources of B12 */}
        <div className="p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-teal-200/60 text-[10.5px] space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 block">
            🌿 Top African Dietary B12 Sources:
          </span>
          <p className="text-slate-600 dark:text-slate-400 leading-snug">
            • <strong>Steamed Tilapia / Titus / Catfish:</strong> 2.5 - 4.0 mcg B12 per serving.
            <br />
            • <strong>Fermented Iru (Locust Beans) &amp; Fortified Pap:</strong> Rich in bioavailable cobalamin and prebiotics.
          </p>
        </div>
      </div>
    </div>
  );
}
