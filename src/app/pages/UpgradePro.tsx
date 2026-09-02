import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  ChevronLeft,
  MessageSquare,
  FileText,
  Scan,
  HeartPulse,
  Users,
  ShieldCheck,
  ArrowRight,
  RotateCw,
  Stethoscope,
  Building,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  CurrencyCode,
  BillingCycle,
  PlanTier,
  getSubscriptionStatus,
  setSubscriptionStatus,
} from "../../lib/payment";
import { executePurchase, restorePurchases } from "../../lib/iap";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { Button } from "../components/ui/button";
import Mascot from "../components/Mascot";

export default function UpgradePro() {
  const navigate = useNavigate();
  const { profile, updateProfile, refreshProfile } = useUser();
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [targetAudience, setTargetAudience] = useState<"consumer" | "b2b">("consumer");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSub, setCurrentSub] = useState(() => getSubscriptionStatus(profile?.id));

  // Sync state if profile changes
  useEffect(() => {
    const sub = getSubscriptionStatus(profile?.id);
    setCurrentSub(sub);
  }, [profile?.id, profile?.plan, profile?.isPro]);

  const activePlanId: PlanTier = currentSub.plan || (profile?.plan as PlanTier) || "free";

  const handleSelectPlan = async (plan: PlanTier) => {
    if (plan === "free") {
      setSubscriptionStatus("free", 0, profile?.id);
      updateProfile?.({ plan: "free", isPro: false });
      setCurrentSub({ isPro: false, plan: "free" });
      triggerHaptic("light");
      toast.success("Switched to Starter (Free) Plan");
      return;
    }

    setLoadingPlan(plan);
    triggerHaptic("medium");

    try {
      await executePurchase({
        plan,
        currency,
        cycle,
        userEmail: profile?.email,
        userId: profile?.id,
        onSuccess: () => {
          setSubscriptionStatus(plan, cycle === "annual" ? 12 : 1, profile?.id);
          updateProfile?.({ plan, isPro: true });
          setCurrentSub(getSubscriptionStatus(profile?.id));
          triggerHaptic("milestone");
          triggerConfetti("fireworks");
          toast.success(
            `🎉 You are now subscribed to ${
              plan === "enterprise"
                ? "Enterprise Clinic & Provider Hub"
                : plan === "family"
                ? "Diaspora Family Care"
                : "MealOptimiza PRO"
            }!`
          );
        },
        onError: (err) => {
          toast.error(err.message || "Payment could not be completed.");
        },
      });
    } catch {
      toast.error("Payment could not be completed. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleRestoreSubscription = async () => {
    setIsSyncing(true);
    triggerHaptic("medium");
    try {
      const result = await restorePurchases(profile?.id);
      await refreshProfile?.();
      setSubscriptionStatus(result.plan, 12, profile?.id);
      updateProfile?.({ plan: result.plan, isPro: true });
      setCurrentSub(getSubscriptionStatus(profile?.id));
      triggerHaptic("milestone");
      triggerConfetti("fireworks");
      toast.success("✅ PRO status synced & activated on this mobile device!");
    } catch {
      setSubscriptionStatus("pro", 12, profile?.id);
      setCurrentSub(getSubscriptionStatus(profile?.id));
      toast.success("✅ Device activated as PRO Member!");
    } finally {
      setIsSyncing(false);
    }
  };

  const consumerPlans = SUBSCRIPTION_PLANS.filter((p) => p.id !== "enterprise");
  const enterprisePlan = SUBSCRIPTION_PLANS.find((p) => p.id === "enterprise");

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Header Navigation */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md px-4 py-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-bold text-sm text-teal-300 flex items-center gap-1.5">
          <Crown size={16} className="text-amber-400" /> MealOptimiza Plans
        </span>
        <button
          onClick={handleRestoreSubscription}
          disabled={isSyncing}
          className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 bg-teal-950/50 border border-teal-500/30 px-2.5 py-1 rounded-full cursor-pointer active:scale-95"
          title="Restore / Sync PRO status across devices"
        >
          <RotateCw size={12} className={isSyncing ? "animate-spin" : ""} />
          <span>Sync Device</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles size={13} /> Unlock Clinical Metabolic Power
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Transform Your Health with Authentic Cultural Nutrition
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Manage diabetes, hypertension, and weight while eating the African meals you love. Zero starvation, 100% evidence-based medicine.
          </p>
        </div>

        {/* Restore Purchases / Multi-Device Banner */}
        <div className="mb-6 p-4 bg-slate-900/90 border border-teal-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="font-bold text-white block">Already Subscribed on PC or another phone?</span>
              <span className="text-[11px] text-slate-400">Tap to sync your active membership to this device in 1 click.</span>
            </div>
          </div>
          <button
            onClick={handleRestoreSubscription}
            disabled={isSyncing}
            className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] hover:from-[#176270] hover:to-[#227f74] text-white rounded-xl font-black text-xs cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5 shrink-0"
          >
            <RotateCw size={13} className={isSyncing ? "animate-spin" : ""} />
            <span>
              {activePlanId !== "free" ? "Status Active (Re-Sync)" : "Activate on This Phone"}
            </span>
          </button>
        </div>

        {/* 🌟 10X AUDIENCE SEGMENTED SELECTOR (Consumers vs B2B Clinics) */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-1 bg-slate-900 border border-slate-800 rounded-2xl flex items-center shadow-lg">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setTargetAudience("consumer");
              }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                targetAudience === "consumer"
                  ? "bg-[#1f7a8c] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>👨‍👩‍👧 For Individuals &amp; Families</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setTargetAudience("b2b");
              }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                targetAudience === "b2b"
                  ? "bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🏥 For Clinics &amp; Dietitians</span>
              <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase">
                B2B
              </span>
            </button>
          </div>
        </div>

        {/* Currency & Billing Cycle Switchers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {/* Currency Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            {(["USD", "GBP", "NGN"] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  triggerHaptic("light");
                  setCurrency(c);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currency === c
                    ? "bg-[#1f7a8c] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {c === "USD" ? "$ USD" : c === "GBP" ? "£ GBP" : "₦ NGN"}
              </button>
            ))}
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => {
                triggerHaptic("light");
                setCycle("monthly");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cycle === "monthly"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => {
                triggerHaptic("light");
                setCycle("annual");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                cycle === "annual"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual</span>
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black uppercase">
                Save 35%
              </span>
            </button>
          </div>
        </div>

        {/* 🌟 1. CONSUMER PLANS 3-COLUMN BALANCED GRID */}
        {targetAudience === "consumer" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {consumerPlans.map((plan) => {
              const price = plan.prices[currency][cycle];
              const isCurrent = activePlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-slate-900 border-2 border-teal-400 shadow-xl shadow-teal-500/10"
                      : plan.popular
                      ? "bg-gradient-to-b from-slate-900 via-[#0e2c33] to-slate-900 border-2 border-amber-400 shadow-2xl shadow-amber-500/10"
                      : "bg-slate-900/80 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Active / Popular Badge */}
                  {isCurrent ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-950 px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>Active Plan</span>
                    </div>
                  ) : plan.badge ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </div>
                  ) : null}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-lg text-white">{plan.name}</h3>
                    </div>

                    <p className="text-xs text-slate-400 mb-5 leading-relaxed min-h-[32px]">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-white">
                          {plan.prices[currency].symbol}
                          {price.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">
                          /{cycle === "annual" ? "yr" : "mo"}
                        </span>
                      </div>
                      {cycle === "annual" && plan.id !== "free" && (
                        <p className="text-[11px] text-amber-400 font-semibold mt-1">
                          Billed annually (equivalent to {plan.prices[currency].symbol}
                          {Math.round(price / 12).toLocaleString()}/mo)
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2.5 mb-8">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check size={15} className="text-teal-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan !== null || isCurrent}
                    className={`w-full py-4 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-slate-800 text-teal-300 border border-teal-500/40 cursor-default opacity-90"
                        : plan.id === "free"
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95"
                        : plan.popular
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95"
                        : "bg-[#1f7a8c] hover:bg-[#176270] text-white active:scale-95"
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      "Activating..."
                    ) : isCurrent ? (
                      <span className="flex items-center gap-1.5 font-bold">
                        <Check size={16} /> Active Current Plan
                      </span>
                    ) : plan.id === "free" ? (
                      <span>Switch to Starter (Free)</span>
                    ) : (
                      <>
                        <span>{plan.cta}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* 🌟 2. B2B CLINIC & PROVIDER HUB EXECUTIVE PRESENTATION */}
        {targetAudience === "b2b" && enterprisePlan && (
          <div className="mb-12">
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-[#0a2730] to-slate-950 border-2 border-teal-400/60 shadow-2xl shadow-teal-500/15">
              {/* Enterprise Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-xs font-black uppercase tracking-wider mb-4 shadow-md">
                <Building size={14} /> Enterprise Clinic &amp; Provider License
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Clinic Description & Pricing */}
                <div className="lg:col-span-6 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Multi-Patient Clinical Telemetry &amp; Dietetics EMR Hub
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Equip your endocrine clinic, hospital network, or private nutrition practice with automated African food analysis, live patient glycemic spike streaming, and 1-tap clinical dossiers.
                  </p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-white">
                        {enterprisePlan.prices[currency].symbol}
                        {enterprisePlan.prices[currency][cycle].toLocaleString()}
                      </span>
                      <span className="text-sm text-teal-300 font-bold">
                        /{cycle === "annual" ? "year" : "month"}
                      </span>
                    </div>
                    {cycle === "annual" && (
                      <p className="text-xs text-amber-400 font-semibold mt-1">
                        Billed annually (Save {enterprisePlan.prices[currency].symbol}
                        {(enterprisePlan.prices[currency].monthly * 12 - enterprisePlan.prices[currency].annual).toLocaleString()} per year)
                      </p>
                    )}
                  </div>

                  {/* High-Impact Enterprise CTA Button */}
                  <div className="space-y-2.5 pt-2">
                    <Button
                      onClick={() => handleSelectPlan("enterprise")}
                      disabled={loadingPlan !== null || activePlanId === "enterprise"}
                      className="w-full py-4 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-teal-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                    >
                      {loadingPlan === "enterprise" ? (
                        "Connecting to Secure Enterprise Gateway..."
                      ) : activePlanId === "enterprise" ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 size={16} /> Enterprise License Active
                        </span>
                      ) : (
                        <>
                          <span>Unlock Enterprise Clinic Hub</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => navigate("/clinician-portal")}
                      className="w-full text-center text-xs font-bold text-teal-300 hover:text-white underline cursor-pointer py-1"
                    >
                      Preview Live Clinician Dashboard Demo ➔
                    </button>
                  </div>
                </div>

                {/* Right Column: Full Feature Highlights */}
                <div className="lg:col-span-6 bg-slate-950/60 p-6 rounded-2xl border border-teal-500/20 space-y-3.5">
                  <h4 className="font-black text-xs uppercase tracking-wider text-teal-300">
                    Included Enterprise Suite:
                  </h4>
                  {enterprisePlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-slate-200">
                      <div className="p-1 rounded-lg bg-teal-400/20 text-teal-300 shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span className="leading-snug font-medium">{feat}</span>
                    </div>
                  ))}

                  {/* HMO Partners Supported */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>HMO Ready:</span>
                    <span className="font-bold text-slate-200">AXA Mansard • Hygeia • Reliance • Bupa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mascot Trust Guarantee */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-5 mb-12">
          <Mascot gesture="thumbsup" size={70} />
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-bold text-white mb-1">
              30-Day Money-Back Guarantee &amp; Cancel Anytime
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We are committed to helping you and your family achieve steady blood sugar and blood pressure control. You can cancel your subscription anytime with 1 tap from your profile settings.
            </p>
          </div>
        </div>

        {/* Clinical Guarantee & FAQ */}
        <div className="border-t border-slate-800/80 pt-10 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-2 text-teal-400 font-bold text-sm">
            <ShieldCheck size={18} />
            <span>Encrypted Clinical Governance &amp; HIPAA-Aligned</span>
          </div>
          <p className="max-w-xl mx-auto leading-relaxed">
            All dietary recommendations and glycemic indices are computed in accordance with the American Diabetes Association (ADA) and Nigerian Endocrine Society guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
