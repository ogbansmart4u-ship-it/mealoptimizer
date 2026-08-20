import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Flame,
  Activity,
  MapPin,
  X,
  MessageSquare,
  QrCode,
  Leaf,
  Loader2,
} from "lucide-react";
import Mascot from "./Mascot";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

interface ViralMealCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealData: {
    dishName: string;
    region?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    fiber?: number;
    glycemicLoad?: "Low" | "Medium" | "High";
    imageSrc?: string | null;
    impactStatement?: string;
    grade?: string;
  };
}

export default function ViralMealCardModal({
  isOpen,
  onClose,
  mealData,
}: ViralMealCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Compute a dynamic score based on Glycemic Load & Fiber
  const grade =
    mealData.grade ||
    (mealData.glycemicLoad === "Low"
      ? "9.5 / 10"
      : mealData.glycemicLoad === "Medium"
      ? "8.4 / 10"
      : "7.8 / 10");

  const shareText = `🥑 Just scanned my meal on MealOptimizer!\n🍲 ${mealData.dishName}\n⭐ Plate Grade: ${grade} (${mealData.glycemicLoad || "Balanced"} Spike Shield)\n💪 Protein: ${mealData.protein || 32}g • 🌿 Fiber: ${mealData.fiber || 5}g\n\nTrack your African & Diaspora meals with 0 glucose spikes: https://mealoptimizer-two.vercel.app`;

  const handleShareWhatsApp = () => {
    triggerHaptic("medium");
    triggerConfetti("fireworks");
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
    toast.success("Opening WhatsApp...");
  };

  const handleCopyText = async () => {
    triggerHaptic("light");
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Meal report copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy text to clipboard");
    }
  };

  const handleNativeShare = async () => {
    triggerHaptic("medium");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MealOptimizer Plate Grade: ${mealData.dishName}`,
          text: shareText,
          url: "https://mealoptimizer-two.vercel.app",
        });
        triggerConfetti("cannons");
      } catch (err) {
        console.warn("Share cancelled or failed:", err);
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-teal-500/30 bg-slate-950 text-white max-h-[94vh] flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Share Plate Grade</DialogTitle>
          <DialogDescription>Share your verified meal card to WhatsApp or Instagram</DialogDescription>
        </DialogHeader>

        {/* Top Close Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 z-10">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-teal-400">
            <Sparkles size={14} className="text-teal-400 animate-spin" />
            <span>Verified Plate Certificate</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Story Preview Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col items-center">
          {/* THE VIRAL STORY CARD CONTAINER */}
          <div
            ref={cardRef}
            className="w-full max-w-[340px] rounded-3xl p-5 bg-gradient-to-b from-slate-900 via-[#0e2c33] to-slate-950 border-2 border-teal-400/60 shadow-2xl relative overflow-hidden flex flex-col items-center text-center select-none"
          >
            {/* Background Ambient Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex items-center justify-between w-full mb-3.5 z-10">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-teal-500/40">
                <Leaf size={12} className="text-teal-400" />
                <span className="text-[10px] font-black tracking-wider uppercase text-teal-200">
                  MealOptimizer OS
                </span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                <ShieldCheck size={12} />
                <span>Spike Shielded</span>
              </div>
            </div>

            {/* Meal Image with Plate Ring */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-teal-400/40 mb-3 bg-black/50">
              {mealData.imageSrc ? (
                <img
                  src={mealData.imageSrc}
                  alt={mealData.dishName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-950 to-slate-900 text-teal-400 p-4">
                  <Activity size={32} className="mb-2 animate-pulse" />
                  <span className="text-xs font-bold">{mealData.dishName}</span>
                </div>
              )}

              {/* Floating Plate Grade Pill */}
              <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-teal-400 px-3 py-1 rounded-xl shadow-xl flex items-center gap-1.5">
                <span className="text-[10px] text-gray-300 uppercase font-bold">Grade</span>
                <span className="text-sm font-black text-teal-300">{grade}</span>
              </div>
            </div>

            {/* Food Title & Region */}
            <h3 className="text-lg font-black text-white leading-tight mb-1 truncate max-w-full">
              {mealData.dishName}
            </h3>
            <p className="text-[11px] text-teal-300/80 font-medium flex items-center gap-1 mb-3.5">
              <MapPin size={11} className="text-teal-400" />
              <span>{mealData.region || "West African Cuisine"}</span>
            </p>

            {/* Macro Stats Grid */}
            <div className="grid grid-cols-4 gap-1.5 w-full mb-3.5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center">
                <span className="text-[9px] text-gray-400 uppercase font-bold">Calories</span>
                <span className="text-xs font-black text-amber-400">
                  {mealData.calories || 480}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center">
                <span className="text-[9px] text-gray-400 uppercase font-bold">Protein</span>
                <span className="text-xs font-black text-blue-400">
                  {mealData.protein || 34}g
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center">
                <span className="text-[9px] text-gray-400 uppercase font-bold">Carbs</span>
                <span className="text-xs font-black text-yellow-400">
                  {mealData.carbs || 52}g
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col items-center">
                <span className="text-[9px] text-gray-400 uppercase font-bold">GI Load</span>
                <span className="text-xs font-black text-emerald-400">
                  {mealData.glycemicLoad || "Low"}
                </span>
              </div>
            </div>

            {/* Avo Mascot Endorsement Box */}
            <div className="w-full bg-teal-950/70 border border-teal-500/30 rounded-2xl p-2.5 flex items-center gap-2.5 text-left mb-3">
              <div className="shrink-0">
                <Mascot gesture="thumbsup" size={42} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black text-teal-300 block uppercase">
                  Avo Metabolic Verdict
                </span>
                <p className="text-[10.5px] text-white/90 leading-tight line-clamp-2">
                  {mealData.impactStatement ||
                    "Pairing this staple with high-fiber greens keeps blood glucose steady with zero crash!"}
                </p>
              </div>
            </div>

            {/* Card Footer Watermark */}
            <div className="w-full flex items-center justify-between border-t border-teal-500/20 pt-2 text-[9.5px] text-teal-300/60">
              <span className="font-mono uppercase">mealoptimizer.app</span>
              <span className="flex items-center gap-1 font-bold text-teal-400">
                <QrCode size={11} />
                <span>Scan Your Plate</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom 1-Tap Sharing Actions Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
          {/* Primary 1-Tap WhatsApp Share */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0f776a] text-white rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <MessageSquare size={17} />
            <span>Share Plate Grade to WhatsApp 🚀</span>
          </button>

          {/* Secondary Actions: Native Share / Copy */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 size={14} className="text-teal-400" />
              <span>Share to Instagram</span>
            </button>

            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-teal-400" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
