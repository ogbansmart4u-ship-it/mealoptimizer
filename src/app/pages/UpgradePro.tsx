import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Crown,
  Check,
  Sparkles,
  ChevronLeft,
  ShieldCheck,
  HeartPulse,
  Flame,
  MessageSquare,
  FileText,
  Users,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useUser } from "../contexts/UserContext";
import {
  SUBSCRIPTION_PLANS,
  CurrencyCode,
  BillingCycle,
  PlanTier,
  processPayment,
  getSubscriptionStatus,
} from "../../lib/payment";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import Mascot from "../components/Mascot";

export default function UpgradePro() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
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
          setCurrentSub(getSubscriptionStatus());
          triggerHaptic("milestone");
          triggerConfetti("fireworks");
          toast.success(`🎉 You are now subscribed to ${plan === "family" ? "Diaspora Family Care" : "MealOptimizer PRO"}!`);
        },
      });
    } catch (err) {
      toast.error("Payment could not be completed. Please try again.");
    } finally {
      setLoadingPlan(null);
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
        <div className="w-8" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles size={13} /> Unlock Clinical Metabolic Power
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Transform Your Health with Authentic Cultural Nutrition
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Manage diabetes, blood pressure, and weight loss with unlimited AI vision scans, WhatsApp food logging, and doctor visit clinical reports.
          </p>
        </div>

        {/* Currency & Billing Switchers */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          {/* Currency Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex items-center gap-1">
            {(["USD", "GBP", "NGN"] as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  triggerHaptic("light");
                  setCurrency(c);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex items-center gap-1">
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
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                cycle === "annual"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded-md font-extrabold">
                SAVE 33%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const priceObj = plan.prices[currency];
            const isCurrent = currentSub.plan === plan.id;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 relative flex flex-col justify-between transition-all ${
                  isPopular
                    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950/40 border-2 border-teal-400 shadow-2xl shadow-teal-500/10 scale-[1.02]"
                    : "bg-slate-900/90 border border-slate-800/90"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white">
                        {priceObj.symbol}
                        {cycle === "annual" ? (plan.id === "free" ? 0 : Math.round(priceObj.annual / 12)) : priceObj.monthly}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    {cycle === "annual" && plan.id !== "free" && (
                      <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
                        Billed as {priceObj.symbol}{priceObj.annual} / year
                      </span>
                    )}
                  </div>

                  {/* Feature List */}
                  <div className="space-y-2.5 mb-6 text-xs text-slate-300">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || loadingPlan !== null}
                  className={`w-full py-3 rounded-2xl text-xs font-extrabold transition-all h-12 ${
                    isCurrent
                      ? "bg-slate-800 text-slate-400 cursor-default"
                      : isPopular
                      ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white shadow-lg shadow-teal-500/20 cursor-pointer"
                      : "bg-white hover:bg-slate-100 text-slate-950 cursor-pointer"
                  }`}
                >
                  {loadingPlan === plan.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Activating...
                    </span>
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    plan.cta
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
              30-Day Money-Back Guarantee & Cancel Anytime
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
