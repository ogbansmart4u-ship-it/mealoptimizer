import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  ShoppingCart,
  ExternalLink,
  Check,
  Copy,
  Share2,
  MapPin,
  Sparkles,
  Store,
  ChevronRight,
  Globe,
  Filter,
  X,
} from "lucide-react";
import {
  GROCERY_PARTNERS,
  GroceryStorePartner,
  getPartnersForLocation,
} from "../../lib/groceryAffiliates";
import { useLocation } from "../contexts/LocationContext";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";
import { soundEffects } from "../utils/soundEffects";
import { toast } from "sonner";
import Mascot from "./Mascot";

export interface GroceryIngredient {
  name: string;
  amount: number;
  unit: string;
  diasporaSwap?: string;
}

interface SmartGroceryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeName?: string;
  ingredients?: GroceryIngredient[];
  initialServings?: number;
}

// Cultural / Specialty keywords determining which market aisle
const AFRO_SPECIALTY_KEYWORDS = [
  "ugu",
  "efirin",
  "scent leaf",
  "bitterleaf",
  "locust bean",
  "iru",
  "dawadawa",
  "crayfish",
  "catfish",
  "yam",
  "plantain",
  "fonio",
  "injera",
  "teff",
  "ogbono",
  "egusi",
  "palm oil",
  "utazi",
  "kuka",
  "baobab",
  "sukuma",
  "ewa",
  "waakye",
  "ndole",
  "garri",
  "cassava",
  "fufu",
  "tatase",
  "atarodo",
  "scotch bonnet",
];

export function SmartGroceryModal({
  isOpen,
  onClose,
  recipeName = "Afro-Metabolic 9-Inch Plate",
  ingredients = [],
  initialServings = 2,
}: SmartGroceryModalProps) {
  const { selectedLocation } = useLocation();
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(initialServings);
  const [selectedRegion, setSelectedRegion] = useState<string>(
    selectedLocation?.country === "nigeria" ? "ng" : selectedLocation?.country === "uk" ? "uk" : "global"
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Partition Ingredients into Mainstream vs Afro-Caribbean Specialty
  const { mainstreamItems, specialtyItems } = useMemo(() => {
    const mainstream: GroceryIngredient[] = [];
    const specialty: GroceryIngredient[] = [];

    ingredients.forEach((ing) => {
      const lower = ing.name.toLowerCase();
      const isSpecialty = AFRO_SPECIALTY_KEYWORDS.some((kw) => lower.includes(kw));
      if (isSpecialty) {
        specialty.push(ing);
      } else {
        mainstream.push(ing);
      }
    });

    return { mainstreamItems: mainstream, specialtyItems: specialty };
  }, [ingredients]);

  // Partners matching region
  const activePartners = useMemo(() => {
    return GROCERY_PARTNERS.filter(
      (p) => selectedRegion === "global" || p.region === selectedRegion || p.region === "global"
    );
  }, [selectedRegion]);

  const toggleCheck = (name: string) => {
    try { triggerHaptic("light"); } catch {}
    setCheckedItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCopyList = () => {
    try {
      triggerHaptic("medium");
      const listText = `🛒 GROCERY BASKET: ${recipeName} (${servingsMultiplier}x Servings)

🥬 MAINSTREAM SUPERMARKET (Tesco / Walmart / Sainsburys):
${mainstreamItems
  .map(
    (i) =>
      `${checkedItems[i.name] ? " [x]" : " [ ]"} ${(i.amount * (servingsMultiplier / 2)).toFixed(1)} ${i.unit} ${i.name}`
  )
  .join("\n")}

🌶️ AFRO-CARIBBEAN SPECIALTY STORE:
${specialtyItems
  .map(
    (i) =>
      `${checkedItems[i.name] ? " [x]" : " [ ]"} ${(i.amount * (servingsMultiplier / 2)).toFixed(1)} ${i.unit} ${i.name}`
  )
  .join("\n")}

Optimized for 9-Inch Divided Plating via MealOptimiza.`;

      navigator.clipboard.writeText(listText);
      toast.success("Shopping list copied to clipboard! 📋");
    } catch {
      toast.error("Could not copy list.");
    }
  };

  const handleShareWhatsApp = () => {
    try {
      triggerHaptic("medium");
      const msg = `🛒 *Grocery Run for ${recipeName}* (${servingsMultiplier} Servings):\n\n` +
        `*Supermarket:* \n${mainstreamItems.map((i) => `• ${(i.amount * (servingsMultiplier / 2)).toFixed(1)} ${i.unit} ${i.name}`).join("\n")}\n\n` +
        `*African Store:* \n${specialtyItems.map((i) => `• ${(i.amount * (servingsMultiplier / 2)).toFixed(1)} ${i.unit} ${i.name}`).join("\n")}\n\n` +
        `_Calibrated for 9-inch healthy plating by MealOptimiza_`;

      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    } catch {
      toast.error("Could not open WhatsApp.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <DialogHeader className="p-4 pb-3 bg-gradient-to-r from-[#126778] to-[#1f7a8c] text-white flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-teal-200 border border-white/20">
              <ShoppingCart size={20} />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-white flex items-center gap-1.5">
                <span>Diaspora Smart Grocery Fulfillment</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md">
                  10X SMART CART
                </span>
              </DialogTitle>
              <DialogDescription className="text-[11px] text-teal-100 flex items-center gap-1">
                <span>Automatic Mainstream Supermarket &amp; African Specialty Store Routing</span>
              </DialogDescription>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        {/* Scaler & Region Bar */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0 flex-wrap text-xs">
          {/* Servings Multiplier */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500">Servings:</span>
            {[1, 2, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => {
                  try { triggerHaptic("light"); } catch {}
                  setServingsMultiplier(num);
                }}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  servingsMultiplier === num
                    ? "bg-[#1f7a8c] text-white"
                    : "bg-white dark:bg-zinc-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-600"
                }`}
              >
                {num}x
              </button>
            ))}
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-1">
            {[
              { id: "global", label: "🌍 All" },
              { id: "uk", label: "🇬🇧 UK" },
              { id: "us", label: "🇺🇸 US" },
              { id: "ng", label: "🇳🇬 Nigeria" },
            ].map((reg) => (
              <button
                key={reg.id}
                onClick={() => {
                  try { triggerHaptic("light"); } catch {}
                  setSelectedRegion(reg.id);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                  selectedRegion === reg.id
                    ? "bg-amber-400 text-slate-950 font-black"
                    : "bg-white dark:bg-zinc-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-600"
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AISLE 1: 🌶️ AFRO-CARIBBEAN SPECIALTY STORE */}
          <div className="rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🌶️</span>
                <div>
                  <h4 className="text-xs font-black text-amber-950 dark:text-amber-200">
                    Afro-Caribbean Specialty Store ({specialtyItems.length} items)
                  </h4>
                  <p className="text-[10px] text-amber-800 dark:text-amber-400">
                    Locust beans, scent leaves, crayfish &amp; cultural tubers
                  </p>
                </div>
              </div>
              <span className="text-[9.5px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-md">
                Specialty
              </span>
            </div>

            <div className="space-y-1.5">
              {specialtyItems.length === 0 ? (
                <div className="text-xs text-slate-400 italic p-2">No specialty items required.</div>
              ) : (
                specialtyItems.map((ing, idx) => {
                  const isChecked = Boolean(checkedItems[ing.name]);
                  const scaledAmount = Number((ing.amount * (servingsMultiplier / 2)).toFixed(1));

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(ing.name)}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "bg-amber-100/50 dark:bg-amber-950/40 border-amber-200 text-slate-400 line-through"
                          : "bg-white dark:bg-zinc-800 border-amber-200/80 dark:border-amber-800/50 text-slate-800 dark:text-slate-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? "bg-amber-500 border-amber-500 text-white"
                              : "border-slate-300 dark:border-zinc-600"
                          }`}
                        >
                          {isChecked && <Check size={10} />}
                        </div>
                        <span className="font-semibold">{ing.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                        {scaledAmount} {ing.unit}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AISLE 2: 🥬 MAINSTREAM SUPERMARKET */}
          <div className="rounded-2xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/40 dark:bg-teal-950/20 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🥬</span>
                <div>
                  <h4 className="text-xs font-black text-teal-950 dark:text-teal-200">
                    Mainstream Supermarket ({mainstreamItems.length} items)
                  </h4>
                  <p className="text-[10px] text-teal-800 dark:text-teal-400">
                    Fresh greens, proteins, healthy oils &amp; standard seasonings
                  </p>
                </div>
              </div>
              <span className="text-[9.5px] font-bold bg-teal-200 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 px-2 py-0.5 rounded-md">
                Supermarket
              </span>
            </div>

            <div className="space-y-1.5">
              {mainstreamItems.map((ing, idx) => {
                const isChecked = Boolean(checkedItems[ing.name]);
                const scaledAmount = Number((ing.amount * (servingsMultiplier / 2)).toFixed(1));

                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(ing.name)}
                    className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? "bg-teal-100/40 dark:bg-teal-950/40 border-teal-200 text-slate-400 line-through"
                        : "bg-white dark:bg-zinc-800 border-teal-200/80 dark:border-teal-800/50 text-slate-800 dark:text-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? "bg-teal-600 border-teal-600 text-white"
                            : "border-slate-300 dark:border-zinc-600"
                        }`}
                      >
                        {isChecked && <Check size={10} />}
                      </div>
                      <span className="font-semibold">{ing.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-teal-800 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/60 px-2 py-0.5 rounded-md">
                      {scaledAmount} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ONLINE GROCERY PARTNERS / 1-CLICK ORDER */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Store size={14} className="text-[#1f7a8c]" />
              <span>Direct Store Ordering ({activePartners.length} Partners Available)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activePartners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    try { triggerHaptic("light"); } catch {}
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/60 hover:border-teal-400 hover:shadow-sm transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{partner.flag}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 dark:text-white block truncate group-hover:text-teal-600 transition-colors">
                        {partner.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {partner.tagline}
                      </span>
                    </div>
                  </div>

                  <span className="text-teal-600 dark:text-teal-400 text-xs font-bold shrink-0 flex items-center gap-0.5 ml-2">
                    Shop <ExternalLink size={12} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={handleCopyList}
            className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer shadow-2xs transition-all"
          >
            <Copy size={13} />
            <span>Copy Checklist</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Share2 size={13} />
              <span>Share WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
