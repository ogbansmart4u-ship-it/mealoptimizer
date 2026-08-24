import React, { useState } from "react";
import {
  ShoppingCart,
  Check,
  Plus,
  Trash2,
  Share2,
  MapPin,
  Sparkles,
  X,
  ExternalLink,
  Store,
  ArrowRight,
  Truck,
  Leaf,
  Layers,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { useLocation } from "../contexts/LocationContext";
import {
  getPartnersForLocation,
  DIASPORA_SWAPS,
  GroceryStorePartner,
} from "../../lib/groceryAffiliates";
import { toast } from "sonner";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

interface GroceryItem {
  id: string;
  name: string;
  category: "produce" | "protein" | "staple" | "spices";
  checked: boolean;
  diasporaSwap?: string;
  aisle?: string;
}

const DEFAULT_GROCERY_ITEMS: Record<string, GroceryItem[]> = {
  lagos: [
    { id: "1", name: "Fresh Ugu (Fluted Pumpkin) Leaves", category: "produce", checked: false, aisle: "Open Market Veg Aisle" },
    { id: "2", name: "Fresh Ewedu Leaves & Okro", category: "produce", checked: false, aisle: "Local Market Produce" },
    { id: "3", name: "Garden Eggs (Snacks / Fiber Shield)", category: "produce", checked: false, aisle: "Produce Section" },
    { id: "4", name: "Titus (Mackerel) / Dried Crayfish", category: "protein", checked: false, aisle: "Fish / Meat Stand" },
    { id: "5", name: "Brown Beans (Oloyin / Drum)", category: "protein", checked: false, aisle: "Dry Grains Stand" },
    { id: "6", name: "Unripe Green Plantain", category: "staple", checked: false, aisle: "Tubers Stand" },
    { id: "7", name: "Local Ofada Rice", category: "staple", checked: false, aisle: "Local Grains" },
  ],
  london: [
    { id: "1", name: "Frozen / Fresh Spinach & Okra", category: "produce", checked: false, diasporaSwap: "Swap for Fresh Ugu", aisle: "Freezer / Produce" },
    { id: "2", name: "Collard Greens & Kale", category: "produce", checked: false, diasporaSwap: "High-fiber antioxidant matrix", aisle: "Fresh Greens" },
    { id: "3", name: "Fresh Mackerel / Salmon Fillets", category: "protein", checked: false, diasporaSwap: "Omega-3 rich protein", aisle: "Fish Counter" },
    { id: "4", name: "Black-Eyed Peas (Dry or Canned)", category: "protein", checked: false, aisle: "Canned / World Food" },
    { id: "5", name: "Green Cooking Plantains", category: "staple", checked: false, aisle: "World Food Aisle" },
    { id: "6", name: "Brown Basmati Rice / Fonio", category: "staple", checked: false, diasporaSwap: "Low-GI steady glucose", aisle: "Whole Grains" },
  ],
};

interface SmartGroceryPlannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SmartGroceryPlanner({ isOpen, onClose }: SmartGroceryPlannerProps) {
  const { selectedLocation } = useLocation();
  const isDiaspora = !["Nigeria", "Ghana"].includes(selectedLocation.country);
  const locationKey = isDiaspora ? "london" : "lagos";

  const [activeTab, setActiveTab] = useState<"checklist" | "partners" | "swaps">("checklist");
  const [items, setItems] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`grocery_items_${locationKey}`);
      return saved ? JSON.parse(saved) : DEFAULT_GROCERY_ITEMS[locationKey];
    } catch {
      return DEFAULT_GROCERY_ITEMS[locationKey];
    }
  });

  const [newItemName, setNewItemName] = useState("");
  const partners = getPartnersForLocation(selectedLocation.country);

  const toggleItem = (id: string) => {
    triggerHaptic("light");
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    try {
      localStorage.setItem(`grocery_items_${locationKey}`, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem: GroceryItem = {
      id: String(Date.now()),
      name: newItemName.trim(),
      category: "produce",
      checked: false,
    };
    const updated = [...items, newItem];
    setItems(updated);
    setNewItemName("");
    try {
      localStorage.setItem(`grocery_items_${locationKey}`, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const handleShareToWhatsApp = () => {
    triggerHaptic("medium");
    triggerConfetti("burst");

    const unchecked = items.filter((i) => !i.checked);
    const checked = items.filter((i) => i.checked);

    const listText =
      `🥑 *MealOptimiza Market Run Checklist* 🛒\n` +
      `📍 Location: *${selectedLocation.displayName}*\n\n` +
      `*TO BUY (${unchecked.length}):*\n` +
      unchecked.map((i) => `◻️ ${i.name}${i.diasporaSwap ? ` _(Tip: ${i.diasporaSwap})_` : ""}`).join("\n") +
      (checked.length > 0
        ? `\n\n*ALREADY PICKED (${checked.length}):*\n` + checked.map((i) => `✅ ~${i.name}~`).join("\n")
        : "") +
      `\n\n_Generated from MealOptimiza · Cultural Health Intelligence_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(listText)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp share sheet!");
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-2xl text-[#1f7a8c] dark:text-teal-400">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  Smart Market & Grocery Hub 🛒
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-[#1f7a8c]" /> {selectedLocation.flag} {selectedLocation.displayName}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 3-Tab Selector */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-2xl my-2 gap-1">
          <button
            onClick={() => {
              setActiveTab("checklist");
              triggerHaptic("light");
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "checklist"
                ? "bg-white dark:bg-zinc-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <ShoppingCart size={13} />
            <span>My Checklist ({items.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("partners");
              triggerHaptic("light");
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "partners"
                ? "bg-white dark:bg-zinc-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Store size={13} />
            <span>Order Online 🚚</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("swaps");
              triggerHaptic("light");
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "swaps"
                ? "bg-white dark:bg-zinc-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Sparkles size={13} />
            <span>Smart Swaps</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: CHECKLIST                                             */}
        {/* ============================================================ */}
        {activeTab === "checklist" && (
          <div className="space-y-3">
            {/* Progress Strip */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">
                Shopping Progress:
              </span>
              <span className="font-extrabold text-[#1f7a8c] dark:text-teal-300">
                {checkedCount} / {items.length} items picked
              </span>
            </div>

            {/* Grocery Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    item.checked
                      ? "bg-zinc-100/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 opacity-60 line-through"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                      {item.name}
                    </span>
                    {item.diasporaSwap && (
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium block">
                        💡 {item.diasporaSwap}
                      </span>
                    )}
                  </div>

                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                      item.checked
                        ? "bg-[#1f7a8c] border-[#1f7a8c] text-white"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {item.checked && <Check size={13} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Add custom item form */}
            <form onSubmit={handleAddItem} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add ingredient or spice..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
              <button
                type="submit"
                className="p-2.5 bg-[#1f7a8c] hover:bg-[#195e6d] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </form>

            {/* Share to WhatsApp action */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
              <button
                onClick={handleShareToWhatsApp}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Share2 size={14} />
                <span>Send List to WhatsApp</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-2xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ORDER ONLINE / PARTNER STORES                         */}
        {/* ============================================================ */}
        {activeTab === "partners" && (
          <div className="space-y-3 py-1">
            <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-200">
              <Truck size={18} className="text-[#1f7a8c] flex-shrink-0" />
              <span>
                Verified diaspora & African grocery delivery partners in <strong>{selectedLocation.displayName}</strong>.
              </span>
            </div>

            <div className="space-y-2.5">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-teal-400 transition-all shadow-xs flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{partner.flag}</span>
                        <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                          {partner.name}
                        </h4>
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
                          {partner.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">{partner.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      ⚡ {partner.deliverySpeed}
                    </span>

                    <a
                      href={partner.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#1f7a8c] hover:bg-[#165c6a] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>Shop on {partner.name.split(" ")[0]}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SMART METABOLIC SWAPS                                 */}
        {/* ============================================================ */}
        {activeTab === "swaps" && (
          <div className="space-y-2.5 py-1 flex-1 overflow-y-auto overscroll-contain pr-1">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold block mb-0.5">🧠 Living in the Diaspora?</span>
              <p className="text-[11px]">
                These science-backed swaps provide the identical fiber and micronutrient benefits of traditional West African staples using items found in standard supermarkets.
              </p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {DIASPORA_SWAPS.map((swap, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 font-medium line-through text-[11px]">
                      {swap.original}
                    </span>
                    <span className="text-[9px] bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                      {swap.marketAisle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-extrabold text-xs">
                    <Leaf size={13} className="text-emerald-500 flex-shrink-0" />
                    <span>Swap to: {swap.diasporaSwap}</span>
                  </div>

                  <p className="text-[10px] text-teal-700 dark:text-teal-300/90 leading-tight">
                    {swap.glycemicBenefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 mt-auto shrink-0">
          <Button onClick={onClose} variant="outline" className="w-full text-xs font-bold rounded-xl h-10">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
