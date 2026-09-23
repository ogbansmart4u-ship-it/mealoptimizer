import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
  Smartphone,
  Heart,
  TrendingDown,
  Shield,
  HelpCircle,
  Clock,
  Sparkle,
  Camera,
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
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [targetAudience, setTargetAudience] = useState<"consumer" | "b2b">("consumer");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSub, setCurrentSub] = useState(() => getSubscriptionStatus(profile?.id));
  const [showFeatureTable, setShowFeatureTable] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<"whatsapp" | "doctor" | "fixplate" | "cgm">("whatsapp");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
            `🎉 Welcome to ${
              plan === "enterprise"
                ? "Enterprise Clinic & Provider Hub"
                : plan === "family"
                ? "Diaspora Parent Care"
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
      if (result.success && result.plan !== "free") {
        await refreshProfile?.();
        setSubscriptionStatus(result.plan, 12, profile?.id);
        updateProfile?.({ plan: result.plan, isPro: true });
        setCurrentSub(getSubscriptionStatus(profile?.id));
        triggerHaptic("milestone");
        triggerConfetti("fireworks");
        toast.success("✅ PRO status synced & activated on this mobile device!");
      } else {
        await refreshProfile?.();
        toast.info("No prior active subscription found for this account.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not restore subscription. Please verify your login credentials.");
    } finally {
      setIsSyncing(false);
    }
  };

  const consumerPlans = SUBSCRIPTION_PLANS.filter((p) => p.id !== "enterprise");
  const enterprisePlan = SUBSCRIPTION_PLANS.find((p) => p.id === "enterprise");

  // Format annual savings
  const getAnnualSavingsText = (planId: PlanTier) => {
    const p = SUBSCRIPTION_PLANS.find((x) => x.id === planId);
    if (!p || p.id === "free") return null;
    const monthlyCost = p.prices[currency].monthly * 12;
    const annualCost = p.prices[currency].annual;
    const savings = monthlyCost - annualCost;
    if (savings <= 0) return null;
    return `Save ${p.prices[currency].symbol}${savings.toLocaleString()} / year`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061411] via-[#091D18] to-[#040C0A] text-stone-100 pb-28 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 🌿 Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#061411]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-emerald-900/40 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-stone-300 hover:text-white"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide text-emerald-300">
          <Crown size={16} className="text-amber-400" />
          <span>MealOptimiza Membership</span>
        </div>
        <button
          onClick={handleRestoreSubscription}
          disabled={isSyncing}
          className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full cursor-pointer active:scale-95 transition-all shadow-sm"
          title="Restore / Sync membership across devices"
        >
          <RotateCw size={12} className={isSyncing ? "animate-spin" : ""} />
          <span>Sync Device</span>
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* 🌿 Human-Centered Botanical Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-inner">
            <Sparkles size={13} className="text-amber-400" />
            <span>Authentic African Metabolic Care</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3.5 leading-snug">
            Eat the African meals you love. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
              Keep your blood sugar &amp; BP calm.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl mx-auto">
            Clinically balanced for swallows, stews, grains, and meats. Instant plate scans, doctor-ready health dossiers, and simple WhatsApp tracking for parents back home.
          </p>
        </section>

        {/* 🌿 Audience Switcher: Consumer vs. Clinic Hub */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-1 bg-[#0D241E] border border-emerald-800/40 rounded-2xl flex items-center shadow-lg">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setTargetAudience("consumer");
              }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                targetAudience === "consumer"
                  ? "bg-gradient-to-r from-[#164E3D] to-[#1E6953] text-white shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Heart size={14} className="text-rose-400" />
              <span>For You &amp; Your Family</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setTargetAudience("b2b");
              }}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                targetAudience === "b2b"
                  ? "bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 text-slate-950 font-black shadow-md"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Building size={14} />
              <span>Clinics &amp; Dietitians</span>
              <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase">
                B2B
              </span>
            </button>
          </div>
        </div>

        {/* 🌿 Currency & Billing Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          {/* Currency Pill Selector */}
          <div className="flex items-center bg-[#0D241E] border border-emerald-800/40 p-1 rounded-2xl shadow-sm">
            {(["NGN", "USD", "GBP"] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  triggerHaptic("light");
                  setCurrency(c);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currency === c
                    ? "bg-[#164E3D] text-white shadow-sm border border-emerald-400/30"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                {c === "NGN" ? "₦ NGN (Nigeria)" : c === "USD" ? "$ USD (US / Global)" : "£ GBP (UK)"}
              </button>
            ))}
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center bg-[#0D241E] border border-emerald-800/40 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => {
                triggerHaptic("light");
                setCycle("monthly");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cycle === "monthly"
                  ? "bg-emerald-950/80 text-white shadow-sm border border-emerald-500/20"
                  : "text-stone-400 hover:text-white"
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
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <span>Annual</span>
              <span className="bg-stone-950/20 text-stone-950 text-[10px] px-1.5 py-0.5 rounded-full font-black uppercase">
                Save 35%
              </span>
            </button>
          </div>
        </div>

        {/* 🌟 1. CONSUMER PLANS GRID (Harmonized, Clean, Human) */}
        {targetAudience === "consumer" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-stretch">
            {consumerPlans.map((plan) => {
              const price = plan.prices[currency][cycle];
              const isCurrent = activePlanId === plan.id;
              const isFamily = plan.id === "family";
              const isPro = plan.id === "pro";
              const savingsText = cycle === "annual" ? getAnnualSavingsText(plan.id) : null;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 sm:p-7 transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-gradient-to-b from-[#0F2F27] to-[#0A221C] border-2 border-emerald-400 shadow-xl shadow-emerald-950/40"
                      : isFamily
                      ? "bg-gradient-to-b from-[#122A23] via-[#0E231E] to-[#081814] border-2 border-amber-400/80 shadow-2xl shadow-amber-950/20 ring-1 ring-amber-400/20"
                      : isPro
                      ? "bg-gradient-to-b from-[#10342B] to-[#0B251E] border border-emerald-500/40 shadow-xl shadow-emerald-950/30"
                      : "bg-[#091D18]/70 border border-emerald-900/30 hover:border-emerald-800/60"
                  }`}
                >
                  {/* Top Badge */}
                  {isCurrent ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-400 text-stone-950 px-4 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Check size={11} strokeWidth={3} />
                      <span>Active Current Plan</span>
                    </div>
                  ) : isFamily ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 px-4 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Users size={12} />
                      <span>Peace of Mind for Parents</span>
                    </div>
                  ) : isPro ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-white px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                      Personal Health Shield
                    </div>
                  ) : null}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                        {plan.name}
                        {isFamily && <span className="text-base">🌍</span>}
                        {isPro && <span className="text-base">🥑</span>}
                      </h3>
                    </div>

                    <p className="text-xs text-stone-300 mb-5 leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>

                    {/* Price Display */}
                    <div className="mb-6 pb-5 border-b border-white/10">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-white">
                          {plan.prices[currency].symbol}
                          {price.toLocaleString()}
                        </span>
                        <span className="text-xs text-stone-400 font-bold">
                          /{cycle === "annual" ? "year" : "month"}
                        </span>
                      </div>
                      {cycle === "annual" && plan.id !== "free" && (
                        <p className="text-[11px] text-amber-300 font-medium mt-1">
                          Equivalent to {plan.prices[currency].symbol}
                          {Math.round(price / 12).toLocaleString()} / month
                        </p>
                      )}
                      {savingsText && (
                        <span className="inline-block mt-2 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          {savingsText}
                        </span>
                      )}
                    </div>

                    {/* Feature Bullets */}
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-200">
                          <div className={`p-0.5 rounded-full shrink-0 mt-0.5 ${
                            isFamily ? "bg-amber-400/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                          }`}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan !== null || isCurrent}
                    className={`w-full py-4 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 cursor-default opacity-90"
                        : plan.id === "free"
                        ? "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 active:scale-95"
                        : isFamily
                        ? "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 shadow-xl shadow-amber-950/40 active:scale-95"
                        : "bg-gradient-to-r from-[#164E3D] via-[#1B5E4A] to-[#1E6953] hover:opacity-95 text-white shadow-lg shadow-emerald-950/30 active:scale-95"
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      "Connecting..."
                    ) : isCurrent ? (
                      <span className="flex items-center gap-1.5 font-bold">
                        <Check size={16} /> Active Current Plan
                      </span>
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

        {/* 🌟 2. B2B CLINIC HUB SECTION (Organized & Professional) */}
        {targetAudience === "b2b" && enterprisePlan && (
          <div className="mb-12">
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#09221C] via-[#0D2E26] to-[#061814] border-2 border-emerald-400/50 shadow-2xl shadow-emerald-950/40">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 text-xs font-black uppercase tracking-wider mb-4 shadow-md">
                <Building size={14} /> Clinic &amp; Dietetics Practice License
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Equip Your Clinic with Cultural Metabolic Precision
                  </h2>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    Designed for endocrinologists, dietitians, and hospitals managing diabetes and hypertension across African patient populations. Monitor patient meals, receive automated spike telemetry, and export clinical dossiers in 1 tap.
                  </p>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-white">
                        {enterprisePlan.prices[currency].symbol}
                        {enterprisePlan.prices[currency][cycle].toLocaleString()}
                      </span>
                      <span className="text-sm text-emerald-300 font-bold">
                        /{cycle === "annual" ? "year" : "month"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <Button
                      onClick={() => handleSelectPlan("enterprise")}
                      disabled={loadingPlan !== null || activePlanId === "enterprise"}
                      className="w-full py-4 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 hover:opacity-95 text-stone-950 font-black text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loadingPlan === "enterprise" ? (
                        "Connecting..."
                      ) : activePlanId === "enterprise" ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 size={16} /> Enterprise License Active
                        </span>
                      ) : (
                        <>
                          <span>Unlock Clinic &amp; Provider Hub</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => navigate("/clinician-portal")}
                      className="w-full text-center text-xs font-bold text-emerald-300 hover:text-white underline cursor-pointer py-1"
                    >
                      Preview Live Clinician Dashboard Demo ➔
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-[#061814]/80 p-6 rounded-2xl border border-emerald-500/20 space-y-3.5">
                  <h4 className="font-black text-xs uppercase tracking-wider text-emerald-300">
                    Clinical Suite Capabilities:
                  </h4>
                  {enterprisePlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-stone-200">
                      <div className="p-1 rounded-lg bg-emerald-400/20 text-emerald-300 shrink-0 mt-0.5">
                        <Check size={13} strokeWidth={3} />
                      </div>
                      <span className="leading-snug font-medium">{feat}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
                    <span>HMO Ready:</span>
                    <span className="font-bold text-stone-200">AXA Mansard • Hygeia • Reliance • Bupa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 3. "SEE WHAT YOU UNLOCK" INTERACTIVE DEMO (ELIMINATES AI SMELL) */}
        <section className="mb-14 bg-gradient-to-br from-[#0B231D] via-[#081B16] to-[#040E0C] border border-emerald-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              Interactive Preview
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-2.5">
              Experience What You Unlock Before You Join
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              Tap each tab to see how MealOptimiza protects your day-to-day health in real life.
            </p>
          </div>

          {/* Interactive Navigation Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
            {[
              { id: "whatsapp", label: "📱 WhatsApp Parent Care", icon: Smartphone },
              { id: "doctor", label: "📄 14-Day Doctor PDF", icon: FileText },
              { id: "fixplate", label: "🪄 'Fix My Plate' Engine", icon: Sparkle },
              { id: "cgm", label: "⌚ Sensor & CGM Telemetry", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic("light");
                    setActivePreviewTab(tab.id as any);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-emerald-500 text-stone-950 shadow-md font-black"
                      : "bg-[#061511] text-stone-300 hover:text-white border border-emerald-900/40"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: WhatsApp Bot Preview */}
          {activePreviewTab === "whatsapp" && (
            <div className="bg-[#05130F] border border-emerald-900/50 rounded-2xl p-4 sm:p-6 max-w-lg mx-auto shadow-inner">
              <div className="flex items-center gap-3 pb-3 border-b border-emerald-900/40 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-xl">
                  👵🏾
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Chief &amp; Mrs. Johnson (Parents)</h4>
                  <p className="text-[11px] text-emerald-400">MealOptimiza WhatsApp Health Assistant</p>
                </div>
              </div>

              {/* Chat Flow */}
              <div className="space-y-3 text-xs">
                <div className="bg-[#0F2F26] p-3 rounded-2xl rounded-tl-none max-w-[85%] text-stone-200">
                  <p className="text-[10px] text-emerald-300 font-bold mb-1">📸 Photo Sent by Mum</p>
                  <p>Pounded Yam + Egusi Soup with Catfish (Lagos dinner)</p>
                </div>

                <div className="bg-[#124235] p-3.5 rounded-2xl rounded-tr-none ml-auto max-w-[90%] text-stone-100 border border-emerald-500/30">
                  <p className="text-amber-300 font-bold mb-1">🥑 Avo Assistant Reply (3 seconds later):</p>
                  <p className="leading-relaxed">
                    &quot;Good evening Mummy! Delicious meal. <strong>Carbs: ~68g</strong>. To keep your sugar smooth tonight: eat the fish and vegetable soup first, and take half a glass of warm water before swallow!&quot;
                  </p>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl text-[11px] text-amber-200 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-amber-400 shrink-0" />
                  <span>
                    <strong>Alert to You in UK/US:</strong> &quot;Mummy just logged a high-carb dinner. We advised a 10-minute walk.&quot;
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Doctor PDF Dossier Preview */}
          {activePreviewTab === "doctor" && (
            <div className="bg-white text-stone-900 rounded-2xl p-5 sm:p-6 max-w-lg mx-auto shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                    Clinical Dossier
                  </span>
                  <h4 className="text-base font-black text-stone-950">14-Day Metabolic Chart Summary</h4>
                </div>
                <div className="text-right text-[11px] text-stone-500">
                  <p className="font-bold">MealOptimiza Clinical</p>
                  <p>Dr. Ready Format</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-[10px] text-emerald-800 font-bold uppercase">Estimated A1c</p>
                  <p className="text-lg font-black text-emerald-900">6.1%</p>
                  <p className="text-[9px] text-emerald-700">In Healthy Target</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-[10px] text-blue-800 font-bold uppercase">Avg Fasting</p>
                  <p className="text-lg font-black text-blue-900">98 mg/dL</p>
                  <p className="text-[9px] text-blue-700">Baseline Stable</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-[10px] text-amber-800 font-bold uppercase">Spike Recovery</p>
                  <p className="text-lg font-black text-amber-900">&lt; 45 mins</p>
                  <p className="text-[9px] text-amber-700">60% Faster</p>
                </div>
              </div>

              <p className="text-xs text-stone-600 italic">
                &quot;Patient shows marked reduction in post-prandial glycemic excursions following retrograde cooking and mucilaginous soup pairing.&quot;
              </p>
            </div>
          )}

          {/* Tab 3: Fix My Plate Engine */}
          {activePreviewTab === "fixplate" && (
            <div className="bg-[#05130F] border border-emerald-900/50 rounded-2xl p-5 sm:p-6 max-w-lg mx-auto">
              <h4 className="text-sm font-bold text-white mb-3 text-center">
                Before &amp; After: Real Cultural Glycemic Optimization
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30">
                  <p className="text-[10px] font-bold uppercase text-rose-400 mb-1">Standard African Plate</p>
                  <p className="font-bold text-white mb-2">3 Large Balls of Garri + Meat</p>
                  <div className="text-[11px] text-rose-300 space-y-1">
                    <p>⚠️ Glycemic Peak: <strong>242 mg/dL</strong></p>
                    <p>⚡ Fatigue &amp; Sluggishness in 90 mins</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40">
                  <p className="text-[10px] font-bold uppercase text-emerald-400 mb-1">MealOptimiza Swap</p>
                  <p className="font-bold text-white mb-2">1 Oat Swallow + Rich Ewedu/Okra</p>
                  <div className="text-[11px] text-emerald-300 space-y-1">
                    <p>✅ Glycemic Peak: <strong>118 mg/dL</strong></p>
                    <p>🌿 Steady Energy all afternoon</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: CGM & Sensor Telemetry */}
          {activePreviewTab === "cgm" && (
            <div className="bg-[#05130F] border border-emerald-900/50 rounded-2xl p-5 sm:p-6 max-w-lg mx-auto text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-3 text-2xl">
                🩸
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Continuous Glucose &amp; Smartwatch Sync</h4>
              <p className="text-xs text-stone-300 mb-4 max-w-md mx-auto">
                Connect your Dexcom G6/G7, Abbott Freestyle Libre, Apple Watch, or Fitbit. See your blood sugar line curve in real-time as you eat Jollof rice or Swallow.
              </p>
              <div className="flex items-center justify-center gap-3 text-xs font-bold text-emerald-300 bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-800/40">
                <span>Dexcom</span>
                <span>•</span>
                <span>Freestyle Libre</span>
                <span>•</span>
                <span>Apple Health</span>
                <span>•</span>
                <span>Health Connect</span>
              </div>
            </div>
          )}
        </section>

        {/* 🌟 4. DETAILED FEATURE COMPARISON TABLE (COLLAPSIBLE) */}
        <section className="mb-14">
          <button
            type="button"
            onClick={() => setShowFeatureTable(!showFeatureTable)}
            className="w-full bg-[#091F1A] border border-emerald-800/50 hover:border-emerald-600/60 p-4 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="text-emerald-400" size={18} />
              <span className="font-bold text-sm text-white">
                Compare All Plan Features Side-by-Side
              </span>
            </div>
            {showFeatureTable ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showFeatureTable && (
            <div className="mt-3 overflow-x-auto bg-[#071914] border border-emerald-900/50 rounded-2xl p-4 sm:p-6 shadow-xl">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-emerald-900/60 text-stone-400">
                    <th className="py-2.5 px-3">Feature</th>
                    <th className="py-2.5 px-3 text-center">Starter</th>
                    <th className="py-2.5 px-3 text-center text-emerald-300 font-bold">MealOptimiza PRO</th>
                    <th className="py-2.5 px-3 text-center text-amber-300 font-bold">Diaspora Care</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950">
                  {[
                    { feat: "Daily Meal Logging Limit", starter: "3 / day", pro: "Unlimited", family: "Unlimited (3 accounts)" },
                    { feat: "African Cultural Food Database", starter: "Standard", pro: "Expanded (50+ Ethnic)", family: "Expanded + Regional" },
                    { feat: "AI Camera Food Scans", starter: "—", pro: "Instant Vision AI", family: "Instant Vision AI" },
                    { feat: "WhatsApp Food Bot (Photo & Voice)", starter: "—", pro: "Included", family: "Included for Parents" },
                    { feat: "Emergency Spike Alerts to Children Abroad", starter: "—", pro: "—", family: "Instant WhatsApp/SMS" },
                    { feat: "'Fix My Plate' Glycemic Rebalancing", starter: "—", pro: "Unlimited", family: "Unlimited" },
                    { feat: "14-Day Doctor Clinical PDF Dossier", starter: "—", pro: "1-Tap Download", family: "Weekly Email Dossier" },
                    { feat: "Live CGM & Smartwatch Sync", starter: "—", pro: "Full Telemetry", family: "Full Telemetry" },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-medium text-stone-200">{row.feat}</td>
                      <td className="py-3 px-3 text-center text-stone-400">{row.starter}</td>
                      <td className="py-3 px-3 text-center text-emerald-300 font-semibold">{row.pro}</td>
                      <td className="py-3 px-3 text-center text-amber-300 font-bold">{row.family}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 🌟 5. FREQUENTLY ASKED QUESTIONS (HONEST & HUMAN) */}
        <section className="mb-14 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Everything you need to know about MealOptimiza plans and care.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Do I have to give up pounded yam, eba, or jollof rice?",
                a: "No! Never. MealOptimiza is founded by African clinicians who know that restrictive Western diets fail in our communities. Instead of telling you to eat salads, we teach you clinical pairing: pairing swallows with drawing soups (Ewedu/Okra), cooling yams before eating, and timing protein so your body absorbs carbohydrates gradually without sugar spikes.",
              },
              {
                q: "How does the Diaspora Parent Care plan work for elderly parents back home?",
                a: "Your parents do not need to download or learn an app. We connect their registered WhatsApp number to our clinical assistant. Whenever they eat, they simply snap a photo of their plate and send it on WhatsApp. Our AI logs it, replies with encouraging guidance, and if their meal has a dangerous glycemic load, you get an automated alert in London, New York, or Toronto.",
              },
              {
                q: "Can I take the PDF report to my doctor at my next clinic checkup?",
                a: "Yes! MealOptimiza generates clinical 14-day and 30-day glycemic charts formatted specifically for physicians, showing your estimated A1c, fasting glucose averages, and post-meal spikes. Doctors love this because it gives them real data on your daily cultural diet.",
              },
              {
                q: "How does the 30-day money-back guarantee work?",
                a: "Try MealOptimiza PRO or Diaspora Parent Care risk-free for 30 days. If you don't feel more energized and in control of your meals, tap 'Cancel' in your profile settings with 1 click, or email support@mealoptimiza.com for a full, hassle-free refund.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#091F1A] border border-emerald-900/40 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm font-bold text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} className="text-emerald-400 shrink-0" /> : <ChevronDown size={16} className="text-stone-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-stone-300 leading-relaxed border-t border-emerald-900/30 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 🌟 6. MASCOT GUARANTEE & CLINICAL CITATION FOOTER */}
        <section className="bg-gradient-to-r from-[#0C2922] to-[#071B16] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-5 mb-12 shadow-xl">
          <Mascot gesture="thumbsup" size={75} />
          <div className="text-center sm:text-left">
            <h4 className="text-base font-bold text-white mb-1.5 flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="text-emerald-400" size={18} />
              <span>30-Day Money-Back Guarantee &amp; 1-Tap Cancellation</span>
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
              We are committed to helping you and your family achieve steady blood sugar and blood pressure control. You can cancel your subscription anytime with 1 tap directly inside your Profile settings — no awkward phone calls or cancellation hurdles.
            </p>
          </div>
        </section>

        {/* Clinical Disclaimer */}
        <footer className="border-t border-emerald-900/50 pt-8 text-center text-xs text-stone-400 space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
            <Shield size={16} />
            <span>256-Bit Encrypted Clinical Governance</span>
          </div>
          <p className="max-w-xl mx-auto leading-relaxed text-[11px] text-stone-400">
            All dietary recommendations and glycemic swap analyses are computed in accordance with the American Diabetes Association (ADA) and Nigerian Endocrine Society guidelines. MealOptimiza is a lifestyle metabolic health aid and does not substitute for emergency medical care.
          </p>
        </footer>
      </div>
    </div>
  );
}
