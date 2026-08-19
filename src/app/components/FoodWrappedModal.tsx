import React, { useRef } from "react";
import {
  Sparkles,
  Share2,
  Download,
  Flame,
  Award,
  HeartPulse,
  Leaf,
  Activity,
  CheckCircle,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

interface FoodWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyMealsCount?: number;
  glucoseStabilityPercent?: number;
  topSuperfood?: string;
  spikesPrevented?: number;
}

export default function FoodWrappedModal({
  isOpen,
  onClose,
  monthlyMealsCount = 24,
  glucoseStabilityPercent = 92,
  topSuperfood = "Fluted Pumpkin (Ugu) & Ewedu",
  spikesPrevented = 14,
}: FoodWrappedModalProps) {
  const { profile } = useUser();
  const monthName = new Date().toLocaleString("default", { month: "long" });

  const handleShareToWhatsApp = () => {
    triggerHaptic("medium");
    triggerConfetti("burst");

    const message =
      `🥑 *My MealOptimizer ${monthName} Food Wrapped* 📊\n\n` +
      `🍲 *${monthlyMealsCount}* Authentic African meals logged\n` +
      `🌿 Top Superfood: *${topSuperfood}*\n` +
      `⚡ *${glucoseStabilityPercent}%* Glucose Stability Score\n` +
      `🪄 *${spikesPrevented}* Glycemic spikes prevented with Fix My Plate!\n\n` +
      `Track your metabolic health with cultural nutrition 👉 https://mealoptimizer-two.vercel.app`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp share sheet!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm p-0 rounded-3xl overflow-hidden border-teal-500/40 bg-slate-950 text-white shadow-2xl">
        {/* Story Card Container (9:16 aesthetic) */}
        <div className="relative bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-6 pt-8 pb-7 flex flex-col justify-between min-h-[520px]">
          {/* Background Decorative Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-amber-400/30">
              <Sparkles size={12} /> {monthName} Metabolic Wrapped
            </div>
            <h3 className="text-xl font-black text-white">
              {profile?.name ? `${profile.name}'s Nutrition Story` : "Your Cultural Food Wrapped"}
            </h3>
            <p className="text-[11px] text-teal-200/80">MealOptimizer Health Intelligence</p>
          </div>

          {/* Key Metrics Bento Grid */}
          <div className="space-y-2.5 my-4 relative z-10">
            {/* Stat 1 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Activity size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Meals Tracked
                </span>
                <span className="text-base font-extrabold text-white">
                  {monthlyMealsCount} Traditional Dishes
                </span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl">
                <HeartPulse size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Metabolic Stability
                </span>
                <span className="text-base font-extrabold text-teal-300">
                  {glucoseStabilityPercent}% Steady Glucose
                </span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <Leaf size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  #1 Cultural Superfood
                </span>
                <span className="text-xs font-extrabold text-amber-200 block truncate">
                  {topSuperfood}
                </span>
              </div>
            </div>
          </div>

          {/* Mascot & Spike Shield */}
          <div className="relative z-10 p-3 rounded-2xl bg-gradient-to-r from-teal-900/60 to-indigo-950/60 border border-teal-500/30 flex items-center gap-3">
            <Mascot gesture="thumbsup" size={48} />
            <div className="min-w-0">
              <span className="text-[11px] font-black text-white block">
                {spikesPrevented} Glucose Spikes Blocked 🛡️
              </span>
              <p className="text-[10px] text-teal-200 leading-tight">
                Through Avo's "Fix My Plate" fiber & portion optimization!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 pt-4 flex gap-2">
            <Button
              onClick={handleShareToWhatsApp}
              className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer h-11"
            >
              <Share2 size={15} />
              <span>Share to WhatsApp Status</span>
            </Button>

            <button
              onClick={onClose}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
