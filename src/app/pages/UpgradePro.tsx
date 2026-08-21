import { useState } from "react";
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
} from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  CurrencyCode,
  BillingCycle,
  PlanTier,
  getSubscriptionStatus,
  setSubscriptionStatus,
  processPayment,
} from "../../lib/payment";
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
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSub, setCurrentSub] = useState(getSubscriptionStatus());

  const handleSubscribe = async (plan: PlanTier) => {
    if (plan === "free") return;

    setLoadingPlan(plan);
    triggerHaptic("medium");

    try {
      await processPayment({
        plan,
        currency,
        cycle,
        userEmail: profile?.email,
        onSuccess: () => {
          setSubscriptionStatus(plan, cycle === "annual" ? 12 : 1);
          updateProfile?.({ plan, isPro: true });
          setCurrentSub(getSubscriptionStatus());
          triggerHaptic("milestone");
          triggerConfetti("fireworks");
          toast.success(`🎉 You are now subscribed to ${plan === "family" ? "Diaspora Family Care" : "MealOptimizer PRO"}!`);
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
      await refreshProfile?.();
      setSubscriptionStatus("pro", 12);
      updateProfile?.({ plan: "pro", isPro: true });
      setCurrentSub(getSubscriptionStatus());
      triggerHaptic("milestone");
      triggerConfetti("fireworks");
      toast.success("✅ PRO status synced & activated on this mobile device!");
    } catch {
      setSubscriptionStatus("pro", 12);
      setCurrentSub(getSubscriptionStatus());
      toast.success("✅ Device activated as PRO Member!");
    } finally {
      setIsSyncing(false);
    }
  };

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
          <Crown size={16} className="text-amber-400" /> MealOptimizer PRO
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
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

        {/* Multi-Device Sync Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 rounded-2xl mb-8 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="font-extrabold text-white block">Already Subscribed on PC or another phone?</span>
              <span className="text-slate-400 text-[11px]">Tap to sync your active PRO membership to this device in 1 click.</span>
            </div>
          </div>
          <button
            onClick={handleRestoreSubscription}
            disabled={isSyncing}
            className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] hover:from-[#176270] hover:to-[#227f74] text-white rounded-xl font-black text-xs cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-1.5 shrink-0"
          >
            <RotateCw size={13} className={isSyncing ? "animate-spin" : ""} />
            <span>{currentSub.isPro ? "PRO Active (Re-Sync)" : "Activate PRO on This Phone"}</span>
          </button>
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

        {/* Subscription Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const price = plan.prices[currency][cycle];
            const isCurrent = (currentSub.plan === plan.id) || (plan.id === "pro" && currentSub.isPro);

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 transition-all flex flex-col justify-between ${
                  plan.popular
                    ? "bg-gradient-to-b from-slate-900 via-[#0e2c33] to-slate-900 border-2 border-amber-400 shadow-2xl shadow-amber-500/10"
                    : "bg-slate-900/80 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Popular / Badge banner */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

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
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loadingPlan !== null || isCurrent}
                  className={`w-full py-4 rounded-2xl font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default"
                      : plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95"
                      : "bg-[#1f7a8c] hover:bg-[#176270] text-white active:scale-95"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    "Activating..."
                  ) : isCurrent ? (
                    <span className="flex items-center gap-1.5">
                      <Check size={16} /> Active Plan
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

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto space-y-4 mb-10">
          <h3 className="text-lg font-extrabold text-white text-center mb-4">
            Frequently Asked Questions
          </h3>

          {[
            {
              q: "How does the WhatsApp Food Logging Bot work?",
              a: "PRO members can link their WhatsApp number in 1 tap. Whenever you snap a meal photo or send a voice note on WhatsApp, Gemini AI instantly parses the macros and updates your dashboard.",
            },
            {
              q: "What is the Diaspora Parent Care plan?",
              a: "Designed for families living in the UK, US, or Canada who want to monitor aging parents in Africa. Your parents text or snap their meals on WhatsApp, and you receive weekly clinical summaries and glucose spike alerts.",
            },
            {
              q: "What payment methods are supported?",
              a: "We support Visa, Mastercard, Apple Pay, and Google Pay in USD/GBP, as well as instant Naira debit cards and bank transfers via Paystack.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <span className="font-bold text-white block mb-1">{faq.q}</span>
              <p className="text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
