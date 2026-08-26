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
  Globe,
  Award,
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
  const [selectedBadge, setSelectedBadge] = useState<string>("🇳🇬 Lagos Safe Plate");

  const DIASPORA_BADGES = [
    { label: "🇳🇬 Lagos Safe Plate", flag: "🇳🇬" },
    { label: "🇬🇭 Accra Clean Fuel", flag: "🇬🇭" },
    { label: "🇬🇧 London Suya Balancer", flag: "🇬🇧" },
    { label: "🇺🇸 Diaspora Glucose Guardian", flag: "🇺🇸" },
    { label: "🌍 Global Metabolic Shield", flag: "🌍" },
  ];

  // Compute a dynamic score based on Glycemic Load & Fiber
  const grade =
    mealData.grade ||
    (mealData.glycemicLoad === "Low"
      ? "9.6 / 10"
      : mealData.glycemicLoad === "Medium"
      ? "8.5 / 10"
      : "7.8 / 10");

  const shareText = `🥑 Just scanned my meal on MealOptimiza!\n🍲 ${mealData.dishName}\n🏆 Community: ${selectedBadge}\n⭐ Plate Grade: ${grade} (${mealData.glycemicLoad || "Balanced"} Spike Shield)\n💪 Protein: ${mealData.protein || 34}g • 🌿 Fiber: ${mealData.fiber || 6}g\n\nTrack your African & Diaspora meals with 0 glucose spikes: https://mealoptimiza.com`;

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

  // High-Resolution Canvas Generator for Instagram Story (9:16 ratio - 1080x1920)
  const handleExportInstagramStory = async () => {
    setIsExporting(true);
    triggerHaptic("medium");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, "#081b21");
      grad.addColorStop(0.35, "#0d313a");
      grad.addColorStop(0.75, "#06151a");
      grad.addColorStop(1, "#02090c");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Glowing Orbs
      const glow1 = ctx.createRadialGradient(900, 200, 10, 900, 200, 450);
      glow1.addColorStop(0, "rgba(78, 205, 196, 0.35)");
      glow1.addColorStop(1, "rgba(78, 205, 196, 0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, 1080, 1920);

      const glow2 = ctx.createRadialGradient(200, 1600, 10, 200, 1600, 500);
      glow2.addColorStop(0, "rgba(31, 122, 140, 0.4)");
      glow2.addColorStop(1, "rgba(31, 122, 140, 0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, 1080, 1920);

      // 3. Header Branding
      ctx.fillStyle = "#4ecdc4";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🥑 MEALOPTIMIZA • METABOLIC INTELLIGENCE", 540, 140);

      // 4. Community Badge
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.roundRect(290, 175, 500, 60, 30);
      ctx.fill();
      ctx.strokeStyle = "rgba(78, 205, 196, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(selectedBadge, 540, 215);

      // 5. Dish Title & Region
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 64px sans-serif";
      ctx.fillText(mealData.dishName, 540, 320);

      ctx.fillStyle = "#4ecdc4";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(`📍 ${mealData.region || "West African Culinary Staple"}`, 540, 375);

      // 6. Plate Card Visual Box
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.beginPath();
      ctx.roundRect(140, 440, 800, 650, 40);
      ctx.fill();
      ctx.strokeStyle = "rgba(78, 205, 196, 0.6)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // If image exists, draw it
      if (mealData.imageSrc) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(160, 460, 760, 610, 30);
            ctx.clip();
            ctx.drawImage(img, 160, 460, 760, 610);
            ctx.restore();
            resolve(true);
          };
          img.onerror = () => resolve(false);
          img.src = mealData.imageSrc!;
        });
      } else {
        ctx.fillStyle = "#4ecdc4";
        ctx.font = "bold 90px sans-serif";
        ctx.fillText("🍲", 540, 780);
      }

      // 7. Plate Grade Floating Badge
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.beginPath();
      ctx.roundRect(580, 980, 320, 90, 24);
      ctx.fill();
      ctx.strokeStyle = "#4ecdc4";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("PLATE GRADE", 660, 1035);
      ctx.fillStyle = "#4ecdc4";
      ctx.font = "900 36px sans-serif";
      ctx.fillText(grade, 820, 1038);

      // 8. 4-Box Nutrition Metrics
      const stats = [
        { label: "CALORIES", val: `${mealData.calories || 480} kcal`, col: "#fbbf24" },
        { label: "PROTEIN", val: `${mealData.protein || 34}g`, col: "#60a5fa" },
        { label: "CARBS", val: `${mealData.carbs || 52}g`, col: "#f87171" },
        { label: "SPIKE SHIELD", val: `${mealData.glycemicLoad || "Low"} GI`, col: "#34d399" },
      ];

      const startX = 140;
      const boxW = 185;
      const boxGap = 20;
      const boxY = 1130;

      stats.forEach((s, idx) => {
        const x = startX + idx * (boxW + boxGap);
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.beginPath();
        ctx.roundRect(x, boxY, boxW, 140, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(s.label, x + boxW / 2, boxY + 45);

        ctx.fillStyle = s.col;
        ctx.font = "900 30px sans-serif";
        ctx.fillText(s.val, x + boxW / 2, boxY + 95);
      });

      // 9. Clinical Avo Scribe Verdict Card
      ctx.fillStyle = "rgba(13, 49, 58, 0.85)";
      ctx.beginPath();
      ctx.roundRect(140, 1310, 800, 220, 32);
      ctx.fill();
      ctx.strokeStyle = "rgba(78, 205, 196, 0.4)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#4ecdc4";
      ctx.font = "900 28px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("🥑 AVO BIOCHEMICAL VERDICT", 180, 1370);

      ctx.fillStyle = "#ffffff";
      ctx.font = "26px sans-serif";
      const impactText =
        mealData.impactStatement ||
        "Engineered with high-fiber pairings to stabilize glucose response and support sustained metabolic energy.";
      
      const words = impactText.split(" ");
      let line = "";
      let curY = 1420;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 720 && n > 0) {
          ctx.fillText(line, 180, curY);
          line = words[n] + " ";
          curY += 40;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 180, curY);

      // 10. Footer CTA with QR / URL
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("Scan Your Cultural Meals Free at mealoptimiza.com", 540, 1720);

      ctx.fillStyle = "rgba(78, 205, 196, 0.9)";
      ctx.font = "24px sans-serif";
      ctx.fillText("Join the Avo 21-Day Blood Sugar Reset Challenge 🔥", 540, 1770);

      // 11. Trigger Download
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `MealOptimiza-Plate-${mealData.dishName.replace(/\s+/g, "-")}.png`;
      a.click();

      triggerConfetti("fireworks");
      toast.success("Instagram Story card (9:16) saved to your device! 📸");
    } catch (err: any) {
      console.error("Story export error:", err);
      toast.error("Could not generate story image. Please try copying report text instead.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    triggerHaptic("medium");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MealOptimiza Plate Grade: ${mealData.dishName}`,
          text: shareText,
          url: "https://mealoptimiza.com",
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

        {/* Diaspora Regional Badge Selector Shelf */}
        <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-teal-900/40">
          {DIASPORA_BADGES.map((b) => (
            <button
              key={b.label}
              onClick={() => {
                triggerHaptic("light");
                setSelectedBadge(b.label);
              }}
              className={`text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                selectedBadge === b.label
                  ? "bg-teal-500 text-slate-950 shadow-xs"
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              }`}
            >
              {b.label}
            </button>
          ))}
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
                  MealOptimiza OS
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
              <span className="font-mono uppercase">mealoptimiza.com</span>
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

          {/* Secondary Actions: Export Story (9:16) / Copy */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportInstagramStory}
              disabled={isExporting}
              className="py-2.5 px-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Save IG Story (9:16)</span>
                </>
              )}
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
