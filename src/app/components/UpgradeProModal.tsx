import React, { useState } from "react";
import { Crown, Check, Sparkles, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { processPayment, BillingCycle, CurrencyCode, PlanTier, getSubscriptionStatus } from "../../lib/payment";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import Mascot from "./Mascot";

interface UpgradeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTriggerName?: string;
}

export default function UpgradeProModal({
  isOpen,
  onClose,
  featureTriggerName = "this premium feature",
}: UpgradeProModalProps) {
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("monthly");

  const handleQuickUpgrade = async () => {
    setIsUpgrading(true);
    triggerHaptic("medium");
    try {
      await processPayment({
        plan: "pro",
        currency: "USD",
        cycle: selectedCycle,
        onSuccess: () => {
          triggerHaptic("milestone");
          triggerConfetti("fireworks");
          toast.success("🎉 Welcome to MealOptimiza PRO!");
          onClose();
        },
      });
    } catch {
      toast.error("Failed to process upgrade");
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-3xl bg-slate-950 text-white border-slate-800">
        <DialogHeader className="text-center">
          <div className="mx-auto p-3 bg-amber-400/10 border border-amber-400/30 rounded-2xl text-amber-400 w-fit mb-2">
            <Crown className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-black text-white">
            Unlock MealOptimiza PRO 👑
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Upgrade to access {featureTriggerName} and full clinical health intelligence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Highlight features */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            {[
              "Unlimited AI Vision & Camera Scans",
              "Unlimited WhatsApp AI Bot Logging",
              "1-Tap Doctor Visit Clinical PDF Reports",
              "Fix My Plate Glycemic Rebalancer",
              "Voice Food Dictation (English/Pidgin)",
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-slate-200">
                <Check size={14} className="text-teal-400 flex-shrink-0" />
                <span className="font-semibold">{feat}</span>
              </div>
            ))}
          </div>

          {/* Billing Cycle Toggle (Monthly vs Annual) */}
          <div className="flex items-center justify-center p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setSelectedCycle("monthly");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCycle === "monthly"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              $9.99 / Month
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setSelectedCycle("annual");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedCycle === "annual"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>$79 / Year</span>
              <span className="bg-black/20 text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase">
                Save 35%
              </span>
            </button>
          </div>

          {/* Pricing Summary */}
          <div className="text-center py-0.5">
            <span className="text-[10.5px] text-teal-300 font-bold">
              {selectedCycle === "annual"
                ? "✨ Billed as $79/year (Equivalent to only $6.58/mo)"
                : "✨ Flexible monthly billing — cancel anytime with 1 tap"}
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <Button
              onClick={handleQuickUpgrade}
              disabled={isUpgrading}
              className="w-full bg-gradient-to-r from-amber-500 to-teal-500 hover:opacity-95 text-slate-950 font-extrabold rounded-2xl h-11 text-xs shadow-lg cursor-pointer"
            >
              {isUpgrading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Connecting to Stripe...
                </span>
              ) : (
                selectedCycle === "annual" ? "Upgrade to Annual PRO ($79/yr)" : "Upgrade to Monthly PRO ($9.99/mo)"
              )}
            </Button>

            <button
              onClick={() => {
                onClose();
                navigate("/upgrade");
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-white py-1.5 cursor-pointer underline"
            >
              View all plans & Family Care options
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
