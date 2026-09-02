import React, { useState } from "react";
import { Sparkles, Check, ChevronRight, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { triggerHaptic } from "../utils/celebration";
import { soundEffects } from "../utils/soundEffects";

export interface PortionBreakdown {
  swallowFists: number; // 1 fist = ~200g
  proteinPalms: number; // 1 palm = ~150g
  soupCuppedHands: number; // 1 cupped hands = ~250ml
  oilThumbs: number; // 1 thumb = ~1 tbsp
}

interface HandPortionGuideProps {
  onSelectPortion?: (portion: PortionBreakdown) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const CULTURAL_PORTION_REFERENCE = [
  {
    id: "fist",
    emoji: "✊",
    name: "1 Closed Fist",
    itemType: "Swallow & Grains",
    typicalFoods: "Eba, Amala, Pounded Yam, Fufu, Rice",
    grams: "~180 - 220g",
    carbs: "~45 - 55g Carbs",
    glycemicAdvice: "1 fist is the ideal single wrap portion for flat blood sugar.",
  },
  {
    id: "palm",
    emoji: "✋",
    name: "1 Open Palm",
    itemType: "Lean Protein & Seafood",
    typicalFoods: "Titus Fish, Chicken, Goat Meat, Boiled Eggs",
    grams: "~140 - 160g",
    carbs: "0 - 2g Carbs (30g Protein)",
    glycemicAdvice: "Protein anchors your stomach and prevents rapid sugar absorption.",
  },
  {
    id: "cupped",
    emoji: "🤲",
    name: "2 Cupped Hands",
    itemType: "Leafy Soluble Soups & Veggies",
    typicalFoods: "Ewedu, Okra, Ugu, Afang, Efo Riro",
    grams: "~250ml / 2 Cups",
    carbs: "~6 - 10g Fiber-Rich Carbs",
    glycemicAdvice: "Eat this first! Soluble mucilage coats the gut to blunt sugar peaks.",
  },
  {
    id: "thumb",
    emoji: "🤏",
    name: "1 Thumb Tip",
    itemType: "Healthy Oils & Seeds",
    typicalFoods: "Unrefined Palm Oil, Olive Oil, Egusi Paste",
    grams: "~1 Tablespoon",
    carbs: "0g Carbs (14g Healthy Fats)",
    glycemicAdvice: "Provides fat-soluble Vitamin A/E without excessive calorie density.",
  },
];

export default function HandPortionGuide({ onSelectPortion, isOpen, onClose }: HandPortionGuideProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const show = isOpen !== undefined ? isOpen : internalOpen;
  const setShow = onClose ? onClose : () => setInternalOpen(false);

  const [portion, setPortion] = useState<PortionBreakdown>({
    swallowFists: 1,
    proteinPalms: 1,
    soupCuppedHands: 2,
    oilThumbs: 1,
  });

  const handleApply = () => {
    triggerHaptic("success");
    soundEffects.playTactileTick();
    onSelectPortion?.(portion);
    setShow();
  };

  return (
    <>
      {isOpen === undefined && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            setInternalOpen(true);
          }}
          className="text-[11px] font-bold text-[#126778] dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>✊ African Hand Portion Guide</span>
        </button>
      )}

      <Dialog open={show} onOpenChange={(open) => !open && setShow()}>
        <DialogContent className="sm:max-w-md rounded-3xl p-5 sm:p-6 bg-slate-950 text-white border border-teal-500/30 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-2 bg-teal-500/20 rounded-2xl border border-teal-400/30">
                ✊
              </span>
              <div>
                <DialogTitle className="text-base sm:text-lg font-black text-white">
                  African Visual Hand Portion Guide
                </DialogTitle>
                <DialogDescription className="text-xs text-teal-200">
                  No weighing scales needed — measure cultural meals with your hands!
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {CULTURAL_PORTION_REFERENCE.map((ref) => (
              <div
                key={ref.id}
                className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1 bg-white/10 rounded-xl">{ref.emoji}</span>
                    <div>
                      <h4 className="font-black text-white text-xs sm:text-sm">{ref.name}</h4>
                      <span className="text-[10px] text-teal-300 font-bold block">{ref.itemType}</span>
                    </div>
                  </div>
                  <span className="text-[10.5px] font-mono font-bold bg-teal-400/20 text-teal-200 px-2 py-0.5 rounded-full border border-teal-400/30">
                    {ref.grams}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-medium">
                  <strong>Foods:</strong> {ref.typicalFoods}
                </p>

                <div className="p-2 bg-slate-900/80 rounded-xl text-[10.5px] text-teal-100 font-semibold flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400 shrink-0" />
                  <span>{ref.glycemicAdvice}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleApply}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check size={15} />
              <span>Got It! Use Hand Sizing</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
