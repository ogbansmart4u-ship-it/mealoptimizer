// GoalSetup — a Yazio-style popup that runs once, right after sign-in and before
// the user reaches the dashboard. It asks what they want out of the app (multi-
// select goals) and a few quick facts (sex, age range, weight range), then:
//   • saves the biometrics to their profile,
//   • stores their goals (per user), and
//   • reorders the dashboard widgets to match what they care about.
//
// Ranges are used for age/weight so it's a couple of taps, not typing. It's a
// full-screen overlay; once completed (or skipped) it never shows again for that
// account (localStorage flag), so it doesn't get in the way on later logins.

import { useEffect, useState } from "react";
import {
  Salad, TrendingDown, TrendingUp, Moon, Droplet, HeartPulse, Dumbbell, Wallet,
  Check, ChevronRight, ChevronLeft, Sparkles, Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import { useDashboard } from "../contexts/DashboardContext";
import { useLanguage } from "../contexts/LanguageContext";
import { updateUserProfile } from "../../lib/api";

type Sex = "male" | "female" | "other";

// `tkey` maps each goal to a translation key in LanguageContext. `label` is the
// English fallback (also used if a key is ever missing).
const GOALS: { id: string; label: string; tkey: string; icon: any }[] = [
  { id: "eat-healthy", label: "Eat healthy", tkey: "goalsetup.goal.eatHealthy", icon: Salad },
  { id: "lose-weight", label: "Lose weight", tkey: "goalsetup.goal.loseWeight", icon: TrendingDown },
  { id: "gain-weight", label: "Gain weight", tkey: "goalsetup.goal.gainWeight", icon: TrendingUp },
  { id: "sleep-better", label: "Sleep well", tkey: "goalsetup.goal.sleepWell", icon: Moon },
  { id: "hydrate-more", label: "Hydrate more", tkey: "goalsetup.goal.hydrateMore", icon: Droplet },
  { id: "manage-condition", label: "Manage a condition", tkey: "goalsetup.goal.manageCondition", icon: HeartPulse },
  { id: "get-fit", label: "Get fit / build muscle", tkey: "goalsetup.goal.getFit", icon: Dumbbell },
  { id: "eat-local", label: "Eat local & affordable", tkey: "goalsetup.goal.eatLocal", icon: Wallet },
];

// Ranges (label + representative midpoint used for calculations). Only labels
// with translatable words carry a `tkey`; purely numeric chips stay as-is.
const AGE_RANGES: { label: string; mid: number; tkey?: string }[] = [
  { label: "Under 18", mid: 16, tkey: "goalsetup.age.under18" },
  { label: "18–24", mid: 21 },
  { label: "25–34", mid: 30 },
  { label: "35–44", mid: 40 },
  { label: "45–54", mid: 50 },
  { label: "55–64", mid: 60 },
  { label: "65+", mid: 68 },
];

const WEIGHT_RANGES: { label: string; mid: number; tkey?: string }[] = [
  { label: "Under 50 kg", mid: 46, tkey: "goalsetup.weight.under50" },
  { label: "50–64 kg", mid: 57 },
  { label: "65–79 kg", mid: 72 },
  { label: "80–94 kg", mid: 87 },
  { label: "95–109 kg", mid: 102 },
  { label: "110+ kg", mid: 115 },
];

export function goalSetupDoneKey(uid: string) {
  return `mo-goalsetup-done-${uid}`;
}
export function goalsKey(uid: string) {
  return `mo-goals-${uid}`;
}

export default function GoalSetup() {
  const { user } = useAuth();
  const { profile, updateProfile } = useUser();
  const { widgets, reorderWidgets } = useDashboard();
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [sex, setSex] = useState<Sex | "">("");
  const [ageMid, setAgeMid] = useState<number | null>(null);
  const [weightMid, setWeightMid] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Show once per account, only after sign-in.
  useEffect(() => {
    if (!user?.id) {
      setOpen(false);
      return;
    }
    try {
      setOpen(localStorage.getItem(goalSetupDoneKey(user.id)) !== "1");
    } catch {
      setOpen(false);
    }
  }, [user?.id]);

  if (!user?.id || !open) return null;

  const toggleGoal = (id: string) =>
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const canContinue = step === 0 ? goals.length > 0 : !!sex && ageMid != null && weightMid != null;

  // Reorder the dashboard so the widgets that match the chosen goals come first.
  const configureDashboard = () => {
    const has = (g: string) => goals.includes(g);
    const priority: string[] = [];
    if (has("get-fit") || has("hydrate-more") || has("sleep-better")) priority.push("tracker-wheel");
    if (has("lose-weight") || has("gain-weight") || has("eat-healthy") || has("eat-local")) priority.push("hyper-plan");
    if (has("manage-condition")) priority.push("health-profile");
    priority.push("quick-actions");

    const seen = new Set<string>();
    const ordered: typeof widgets = [];
    for (const id of priority) {
      const w = widgets.find((x) => x.id === id);
      if (w && !seen.has(id)) {
        ordered.push(w);
        seen.add(id);
      }
    }
    for (const w of widgets) if (!seen.has(w.id)) { ordered.push(w); seen.add(w.id); }
    reorderWidgets(ordered.map((w) => ({ ...w, visible: true })));
  };

  const finish = async () => {
    setSaving(true);
    // Persist goals for this account.
    try {
      localStorage.setItem(goalsKey(user.id), JSON.stringify(goals));
    } catch {
      /* ignore */
    }
    // Save biometrics to the profile (local + best-effort backend).
    const updates = {
      age: ageMid ?? profile?.age ?? 0,
      gender: (sex || undefined) as Sex | undefined,
      weight: weightMid != null ? String(weightMid) : profile?.weight,
    };
    updateProfile(updates);
    if (profile) {
      try {
        await updateUserProfile({
          name: profile.name,
          age: updates.age,
          bmi: profile.bmi,
          medicalCondition: profile.medicalCondition,
          location: profile.location,
          profilePicture: profile.profilePicture,
        });
      } catch {
        /* offline — kept locally */
      }
    }
    configureDashboard();
    try {
      localStorage.setItem(goalSetupDoneKey(user.id), "1");
    } catch {
      /* ignore */
    }
    setSaving(false);
    setOpen(false);
  };

  const skip = () => {
    try {
      localStorage.setItem(goalSetupDoneKey(user.id), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-7 pb-6 sm:rounded-t-3xl">
          <div className="flex items-center gap-2 text-white/90 text-xs font-semibold mb-2">
            <Sparkles className="h-4 w-4" /> {t('goalsetup.badge')}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {step === 0 ? t('goalsetup.step0.title') : t('goalsetup.step1.title')}
          </h2>
          <p className="text-white/85 text-sm mt-1">
            {step === 0
              ? t('goalsetup.step0.subtitle')
              : t('goalsetup.step1.subtitle')}
          </p>
          {/* Step dots */}
          <div className="flex gap-1.5 mt-4">
            {[0, 1].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? "w-8 bg-white" : "w-4 bg-white/40"}`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(({ id, label, tkey, icon: Icon }) => {
                const selected = goals.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleGoal(id)}
                    aria-pressed={selected}
                    className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all ${
                      selected ? "border-[#1f7a8c] bg-[#E8F5F5]" : "border-gray-200 hover:border-[#4ecdc4]"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <Icon className={`h-6 w-6 ${selected ? "text-[#1f7a8c]" : "text-gray-500"}`} />
                      {selected && <Check className="h-4 w-4 text-[#1f7a8c]" />}
                    </div>
                    <span className={`text-sm font-medium ${selected ? "text-[#1f7a8c]" : "text-gray-700"}`}>{t(tkey) || label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('goalsetup.sex')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["male", "female", "other"] as Sex[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        sex === s ? "border-[#1f7a8c] bg-[#E8F5F5] text-[#1f7a8c]" : "border-gray-200 text-gray-700 hover:border-[#4ecdc4]"
                      }`}
                    >
                      {t(`goalsetup.sex.${s}`)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Age range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('goalsetup.ageRange')}</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setAgeMid(r.mid)}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        ageMid === r.mid ? "border-[#1f7a8c] bg-[#1f7a8c] text-white" : "border-gray-200 text-gray-700 hover:border-[#4ecdc4]"
                      }`}
                    >
                      {r.tkey ? t(r.tkey) : r.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Weight range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('goalsetup.weightRange')}</label>
                <div className="flex flex-wrap gap-2">
                  {WEIGHT_RANGES.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setWeightMid(r.mid)}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        weightMid === r.mid ? "border-[#1f7a8c] bg-[#1f7a8c] text-white" : "border-gray-200 text-gray-700 hover:border-[#4ecdc4]"
                      }`}
                    >
                      {r.tkey ? t(r.tkey) : r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-3 mt-8">
            {step === 0 ? (
              <button type="button" onClick={skip} className="text-sm text-gray-500 hover:text-gray-700 font-medium px-2">
                {t('goalsetup.skip')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 font-medium px-2"
              >
                <ChevronLeft className="h-4 w-4" /> {t('common.back')}
              </button>
            )}
            <div className="flex-1" />
            {step === 0 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={!canContinue}
                className="flex items-center gap-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl px-6 py-3 font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {t('goalsetup.continue')} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={!canContinue || saving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl px-6 py-3 font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? t('goalsetup.settingUp') : t('goalsetup.finish')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
