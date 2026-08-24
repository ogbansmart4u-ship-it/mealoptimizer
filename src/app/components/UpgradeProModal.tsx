import React, { useState } from "react";
import { Crown, Check, Sparkles, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { processPayment, CurrencyCode, PlanTier, getSubscriptionStatus } from "../../lib/payment";
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

  const handleQuickUpgrade = async () => {
    setIsUpgrading(true);
    triggerHaptic("medium");
    try {
      await processPayment({
        plan: "pro",
        currency: "USD",
        cycle: "monthly",
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

          {/* Pricing CTA */}
          <div className="text-center py-1">
            <div className="text-2xl font-black text-white">
              $9.99 <span className="text-xs font-normal text-slate-400">/ month (or ₦4,500)</span>
            </div>
            <span className="text-[10px] text-teal-400 font-bold">
              Cancel anytime with 1 tap.
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
                  <Loader2 size={14} className="animate-spin" /> Activating PRO...
                </span>
              ) : (
                "Upgrade to PRO Now"
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
