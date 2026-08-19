import React, { useState } from "react";
import { ShoppingCart, Check, Plus, Trash2, Share2, MapPin, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { useLocation } from "../contexts/LocationContext";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";

interface GroceryItem {
  id: string;
  name: string;
  category: "produce" | "protein" | "staple";
  checked: boolean;
  diasporaSwap?: string;
}

const DEFAULT_GROCERY_ITEMS: Record<string, GroceryItem[]> = {
  lagos: [
    { id: "1", name: "Fresh Ugu (Fluted Pumpkin) Leaves", category: "produce", checked: false },
    { id: "2", name: "Fresh Ewedu Leaves & Okro", category: "produce", checked: false },
    { id: "3", name: "Garden Eggs (Snacks / Fiber)", category: "produce", checked: false },
    { id: "4", name: "Titus (Mackerel) Fish / Dried Crayfish", category: "protein", checked: false },
    { id: "5", name: "Brown Beans (for Steamed Moi Moi)", category: "protein", checked: false },
    { id: "6", name: "Unripe Plantain (Low Glycemic Starch)", category: "staple", checked: false },
    { id: "7", name: "Local Ofada Rice / Yellow Garri", category: "staple", checked: false },
  ],
  london: [
    { id: "1", name: "Frozen / Fresh Spinach & Okra", category: "produce", checked: false, diasporaSwap: "Swap for Ugu" },
    { id: "2", name: "Kale & Collard Greens", category: "produce", checked: false, diasporaSwap: "Fiber powerhouse" },
    { id: "3", name: "Fresh Mackerel / Salmon Fillets", category: "protein", checked: false, diasporaSwap: "Omega-3 rich" },
    { id: "4", name: "Black-Eyed Peas (Dry/Canned)", category: "protein", checked: false },
    { id: "5", name: "Green Plantains (African Market)", category: "staple", checked: false },
    { id: "6", name: "Brown Basmati Rice / Quinoa", category: "staple", checked: false, diasporaSwap: "Low glycemic substitute" },
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

  const [items, setItems] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`grocery_items_${locationKey}`);
      return saved ? JSON.parse(saved) : DEFAULT_GROCERY_ITEMS[locationKey];
    } catch {
      return DEFAULT_GROCERY_ITEMS[locationKey];
    }
  });

  const [newItemName, setNewItemName] = useState("");

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
    const listText =
      `🥑 *MealOptimizer Metabolic Grocery List* 🛒\n\n` +
      items.map((i) => `${i.checked ? "✅" : "◻️"} ${i.name}`).join("\n") +
      `\n\n_Generated from MealOptimizer_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(listText)}`;
    window.open(waUrl, "_blank");
  };

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-2xl text-[#1f7a8c] dark:text-teal-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                Smart Market Checklist 🛒
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {selectedLocation.displayName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Strip */}
        <div className="my-3 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">
            Shopping Progress:
          </span>
          <span className="font-extrabold text-[#1f7a8c] dark:text-teal-300">
            {checkedCount} / {items.length} items picked
          </span>
        </div>

        {/* Grocery Items List */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
        <form onSubmit={handleAddItem} className="flex gap-2 mt-3">
          <input
            type="text"
            placeholder="Add market item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          />
          <button
            type="submit"
            className="p-2.5 bg-[#1f7a8c] hover:bg-[#195e6d] text-white rounded-xl text-xs font-bold"
          >
            <Plus size={16} />
          </button>
        </form>

        {/* Share to WhatsApp action */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
          <button
            onClick={handleShareToWhatsApp}
            className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Share2 size={14} />
            <span>Send List to WhatsApp</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
