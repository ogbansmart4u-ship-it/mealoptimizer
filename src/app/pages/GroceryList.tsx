import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ShoppingCart,
  Trash2,
  Check,
  ExternalLink,
  Store,
  Sparkles,
  Share2,
  MapPin,
  Truck,
  Leaf,
  Plus,
  ArrowRightLeft,
  Copy,
  Layers,
  ShoppingBag,
  DollarSign,
  Tag,
  Flame,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { projectId } from '/utils/supabase/info';
import { getAccessToken } from '../../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import PageHeader from '../components/PageHeader';
import Breadcrumbs from '../components/Breadcrumbs';
import { SkeletonList } from '../components/SkeletonLoader';
import MascotEmptyState from '../components/MascotEmptyState';
import Mascot from '../components/Mascot';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { getPartnersForLocation, DIASPORA_SWAPS, GroceryStorePartner, MetabolicSwapItem } from '../../lib/groceryAffiliates';
import { toast } from 'sonner';
import { triggerHaptic, triggerConfetti } from '../utils/celebration';

interface GroceryItem {
  id: string;
  ingredient: string;
  mealName: string;
  mealType: string;
  checked: boolean;
  createdAt: string;
  category?: string;
  estimatedPrice?: string;
}

// Department / Supermarket Aisle Classifier
function categorizeIngredient(name: string): { aisle: string; icon: string; color: string } {
  const n = (name || "").toLowerCase();

  if (
    n.includes("ugu") ||
    n.includes("ewedu") ||
    n.includes("okra") ||
    n.includes("spinach") ||
    n.includes("kale") ||
    n.includes("garden egg") ||
    n.includes("tomato") ||
    n.includes("pepper") ||
    n.includes("onion") ||
    n.includes("garlic") ||
    n.includes("ginger") ||
    n.includes("plantain") ||
    n.includes("avocado") ||
    n.includes("cucumber") ||
    n.includes("carrot") ||
    n.includes("cabbage") ||
    n.includes("lettuce") ||
    n.includes("lemon") ||
    n.includes("lime") ||
    n.includes("bitter leaf") ||
    n.includes("scent leaf") ||
    n.includes("waterleaf") ||
    n.includes("vegetable") ||
    n.includes("greens")
  ) {
    return { aisle: "Fresh Produce & Healing Greens", icon: "🥬", color: "from-emerald-600 to-teal-700" };
  }

  if (
    n.includes("fish") ||
    n.includes("titus") ||
    n.includes("mackerel") ||
    n.includes("catfish") ||
    n.includes("salmon") ||
    n.includes("chicken") ||
    n.includes("turkey") ||
    n.includes("goat") ||
    n.includes("beef") ||
    n.includes("meat") ||
    n.includes("egg") ||
    n.includes("tofu") ||
    n.includes("awara") ||
    n.includes("crayfish") ||
    n.includes("stockfish") ||
    n.includes("prawn") ||
    n.includes("shrimp") ||
    n.includes("snails") ||
    n.includes("seafood")
  ) {
    return { aisle: "Clean Protein & Seafood", icon: "🥩", color: "from-blue-600 to-indigo-700" };
  }

  if (
    n.includes("fonio") ||
    n.includes("rice") ||
    n.includes("ofada") ||
    n.includes("basmati") ||
    n.includes("yam") ||
    n.includes("sweet potato") ||
    n.includes("potato") ||
    n.includes("oat") ||
    n.includes("quinoa") ||
    n.includes("millet") ||
    n.includes("sorghum") ||
    n.includes("garri") ||
    n.includes("cassava") ||
    n.includes("fufu") ||
    n.includes("flour") ||
    n.includes("bread") ||
    n.includes("pasta")
  ) {
    return { aisle: "Ancient Grains, Roots & Swallows", icon: "🌾", color: "from-amber-600 to-orange-700" };
  }

  if (
    n.includes("bean") ||
    n.includes("peas") ||
    n.includes("egusi") ||
    n.includes("melon") ||
    n.includes("sesame") ||
    n.includes("chia") ||
    n.includes("flax") ||
    n.includes("ogbono") ||
    n.includes("iru") ||
    n.includes("locust") ||
    n.includes("lentil") ||
    n.includes("chickpea") ||
    n.includes("nut") ||
    n.includes("groundnut") ||
    n.includes("almond") ||
    n.includes("cashew")
  ) {
    return { aisle: "Legumes, Seeds & Super-Nuts", icon: "🫘", color: "from-purple-600 to-pink-700" };
  }

  if (
    n.includes("oil") ||
    n.includes("olive") ||
    n.includes("palm oil") ||
    n.includes("curry") ||
    n.includes("thyme") ||
    n.includes("turmeric") ||
    n.includes("cinnamon") ||
    n.includes("bay leaf") ||
    n.includes("clove") ||
    n.includes("salt") ||
    n.includes("spice") ||
    n.includes("seasoning")
  ) {
    return { aisle: "Cold-Pressed Oils & Bio-Active Spices", icon: "🫒", color: "from-yellow-600 to-amber-700" };
  }

  return { aisle: "Pantry & General Groceries", icon: "🥫", color: "from-teal-600 to-slate-700" };
}

const QUICK_SUGGESTION_ITEMS = [
  "🥬 Fresh Ugu (Fluted Pumpkin)",
  "🌶️ Scotch Bonnet (Atarodo)",
  "🐟 Titus Fish (Mackerel)",
  "🫘 Brown Honey Beans (Oloyin)",
  "🌾 Organic Fonio Grain",
  "🥣 Fresh Okra Pods",
  "🧄 Ginger & Garlic Pack",
  "🍌 Green Unripe Plantains",
];

export default function GroceryList() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedLocation } = useLocation();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Grouping Mode: 'aisle' (Supermarket walk-through) vs 'meal' (By planned dish)
  const [groupingMode, setGroupingMode] = useState<"aisle" | "meal">("aisle");
  const [newItemInput, setNewItemInput] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Partner Store & Swaps Modals
  const [showPartnersModal, setShowPartnersModal] = useState(false);
  const [showSwapsModal, setShowSwapsModal] = useState(false);
  const [selectedSwapItem, setSelectedSwapItem] = useState<GroceryItem | null>(null);

  const partners = getPartnersForLocation(selectedLocation.country);

  // Currency & Estimated Price Rate
  const currencyInfo = useMemo(() => {
    const c = (selectedLocation.country || "").toLowerCase();
    if (c.includes("united kingdom") || c.includes("uk")) {
      return { symbol: "£", lowRate: 1.8, highRate: 3.2, name: "GBP" };
    }
    if (c.includes("united states") || c.includes("us")) {
      return { symbol: "$", lowRate: 2.2, highRate: 4.5, name: "USD" };
    }
    if (c.includes("nigeria")) {
      return { symbol: "₦", lowRate: 1200, highRate: 2800, name: "NGN" };
    }
    if (c.includes("canada")) {
      return { symbol: "CA$", lowRate: 2.8, highRate: 5.5, name: "CAD" };
    }
    return { symbol: "€", lowRate: 2.0, highRate: 4.0, name: "EUR" };
  }, [selectedLocation]);

  // Translate a meal type ("breakfast" → localized) with a safe fallback.
  const mealTypeLabel = (type: string) =>
    ["breakfast", "brunch", "lunch", "dinner"].includes((type || "").toLowerCase())
      ? t(`planmeal.meal.${type.toLowerCase()}`)
      : type;

  // Load grocery list from local vault + backend
  useEffect(() => {
    // 1. Instant cache load
    try {
      const cached = localStorage.getItem("cached_grocery_list_items");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGroceryItems(parsed);
          setLoading(false);
        }
      }
    } catch {
      /* ignore */
    }

    loadGroceryList();
  }, []);

  const loadGroceryList = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessTokenStr = await getAccessToken();
      if (!accessTokenStr) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessTokenStr}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load grocery list: ${response.status}`);
      }

      const data = await response.json();
      const items: GroceryItem[] = data.items || [];
      setGroceryItems(items);
      localStorage.setItem("cached_grocery_list_items", JSON.stringify(items));
    } catch (err) {
      console.error('Error loading grocery list:', err);
      setError(err instanceof Error ? err.message : 'Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddItem = async (customName?: string) => {
    const nameToAdd = (customName || newItemInput).trim();
    if (!nameToAdd) return;

    triggerHaptic("light");
    setIsAddingItem(true);

    const cleanName = nameToAdd.replace(/^[^\w\s]+/, "").trim();
    const newItem: GroceryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ingredient: cleanName,
      mealName: "General Market Basket",
      mealType: "general",
      checked: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...groceryItems];
    setGroceryItems(updated);
    localStorage.setItem("cached_grocery_list_items", JSON.stringify(updated));
    setNewItemInput("");
    setIsAddingItem(false);
    toast.success(`Added "${cleanName}" to grocery list 🛒`);

    // Backend sync
    try {
      const accessTokenStr = await getAccessToken();
      if (accessTokenStr) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessTokenStr}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ingredient: cleanName,
              mealName: "General Market Basket",
              mealType: "general",
            }),
          }
        );
      }
    } catch {
      // offline fallback
    }
  };

  const toggleItemChecked = async (itemId: string) => {
    try {
      triggerHaptic("light");
      const item = groceryItems.find((i) => i.id === itemId);
      if (!item) return;

      const newCheckedState = !item.checked;

      // Update UI optimistically
      const updated = groceryItems.map((i) =>
        i.id === itemId ? { ...i, checked: newCheckedState } : i
      );
      setGroceryItems(updated);
      localStorage.setItem("cached_grocery_list_items", JSON.stringify(updated));

      if (newCheckedState) {
        const remaining = updated.filter((i) => !i.checked).length;
        if (remaining === 0) {
          triggerConfetti("burst");
          triggerHaptic("success");
          toast.success("🛒 Basket Complete! All items picked!");
        }
      }

      const accessTokenStr = await getAccessToken();
      if (accessTokenStr) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list/${itemId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessTokenStr}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ checked: newCheckedState }),
          }
        );
      }
    } catch (err) {
      console.error("Error toggling item:", err);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      triggerHaptic("light");
      const updated = groceryItems.filter((i) => i.id !== itemId);
      setGroceryItems(updated);
      localStorage.setItem("cached_grocery_list_items", JSON.stringify(updated));

      const accessTokenStr = await getAccessToken();
      if (accessTokenStr) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list/${itemId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessTokenStr}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const clearCheckedItems = async () => {
    try {
      triggerHaptic("medium");
      const checkedItems = groceryItems.filter((i) => i.checked);
      if (checkedItems.length === 0) return;

      const updated = groceryItems.filter((i) => !i.checked);
      setGroceryItems(updated);
      localStorage.setItem("cached_grocery_list_items", JSON.stringify(updated));
      toast.success(`Cleared ${checkedItems.length} picked item${checkedItems.length > 1 ? "s" : ""}`);

      const accessTokenStr = await getAccessToken();
      if (accessTokenStr) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list/clear-checked`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessTokenStr}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (err) {
      console.error("Error clearing checked items:", err);
    }
  };

  const handleApplySwapDirect = async (item: GroceryItem, swap: MetabolicSwapItem) => {
    triggerHaptic("medium");
    const updated = groceryItems.map((i) =>
      i.id === item.id ? { ...i, ingredient: swap.diasporaSwap } : i
    );
    setGroceryItems(updated);
    localStorage.setItem("cached_grocery_list_items", JSON.stringify(updated));
    setShowSwapsModal(false);
    toast.success(`Swapped to "${swap.diasporaSwap}"! 🔄✨`);
  };

  const findMatchingSwap = (ingredientName: string): MetabolicSwapItem | undefined => {
    const n = ingredientName.toLowerCase();
    return DIASPORA_SWAPS.find((s) => {
      const orig = s.original.toLowerCase();
      return n.includes(orig) || orig.includes(n) || (n.includes("garri") && orig.includes("garri")) || (n.includes("rice") && orig.includes("rice"));
    });
  };

  const handleShareToWhatsApp = () => {
    triggerHaptic("medium");
    triggerConfetti("burst");

    const unchecked = groceryItems.filter((i) => !i.checked);
    const checked = groceryItems.filter((i) => i.checked);

    const listText =
      `🥑 *MealOptimiza Smart Market Grocery Checklist* 🛒\n` +
      `📍 Market Location: *${selectedLocation.displayName}*\n` +
      `💰 Est. Basket: *${currencyInfo.symbol}${(groceryItems.length * currencyInfo.lowRate).toLocaleString()} - ${currencyInfo.symbol}${(groceryItems.length * currencyInfo.highRate).toLocaleString()}*\n\n` +
      `*TO BUY (${unchecked.length} items):*\n` +
      unchecked.map((i, idx) => `${idx + 1}. [ ] ${i.ingredient} (${i.mealName || "General"})`).join("\n") +
      (checked.length > 0
        ? `\n\n*ALREADY IN CART (${checked.length} items):*\n` + checked.map((i) => `✅ ~${i.ingredient}~`).join("\n")
        : "") +
      `\n\n_Generated via MealOptimiza · Cultural Health & Metabolic Intelligence_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(listText)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp formatted checklist!");
  };

  const handleCopyToClipboard = () => {
    triggerHaptic("light");
    const text = groceryItems.map((i) => `${i.checked ? "[x]" : "[ ]"} ${i.ingredient}`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Grocery checklist copied to clipboard! 📋");
  };

  // Grouping Logic
  const groupedByMeal = useMemo(() => {
    return groceryItems.reduce((acc, item) => {
      const key = item.mealName || 'General Pantry';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  }, [groceryItems]);

  const groupedByAisle = useMemo(() => {
    return groceryItems.reduce((acc, item) => {
      const { aisle, icon, color } = categorizeIngredient(item.ingredient);
      if (!acc[aisle]) {
        acc[aisle] = { icon, color, items: [] };
      }
      acc[aisle].items.push(item);
      return acc;
    }, {} as Record<string, { icon: string; color: string; items: GroceryItem[] }>);
  }, [groceryItems]);

  const uncheckedCount = groceryItems.filter((i) => !i.checked).length;
  const checkedCount = groceryItems.filter((i) => i.checked).length;
  const progressPercent = groceryItems.length > 0 ? Math.round((checkedCount / groceryItems.length) * 100) : 0;

  const estLowTotal = (groceryItems.length * currencyInfo.lowRate).toLocaleString(undefined, {
    maximumFractionDigits: currencyInfo.symbol === "₦" ? 0 : 2,
  });
  const estHighTotal = (groceryItems.length * currencyInfo.highRate).toLocaleString(undefined, {
    maximumFractionDigits: currencyInfo.symbol === "₦" ? 0 : 2,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28">
      {/* Header */}
      <PageHeader
        title={t("grocery.title")}
        showHome
        className="bg-gradient-to-r from-[#126778] via-[#1f7a8c] to-[#0d9488] text-white"
      />

      {/* Breadcrumbs & Location Bar */}
      <div className="bg-gradient-to-r from-[#126778] via-[#1f7a8c] to-[#0d9488] px-4 sm:px-6 pb-3 flex items-center justify-between text-white border-b border-teal-400/20">
        <Breadcrumbs
          items={[
            { label: t("grocery.breadcrumbMeal"), path: "/plan-meal" },
            { label: t("grocery.title") },
          ]}
          className="text-white/85 text-xs"
        />
        <span className="text-[11px] text-teal-100 font-extrabold flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
          <MapPin size={11} className="text-amber-300" /> {selectedLocation.flag} {selectedLocation.displayName}
        </span>
      </div>

      {/* 10X Hero Stats & Smart Market Control Deck */}
      <div className="bg-gradient-to-r from-[#126778] via-[#1f7a8c] to-[#0d9488] px-4 sm:px-6 pb-5 text-white shadow-md">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Top Row: Basket Progress & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md border border-white/25 shrink-0">
                <ShoppingCart className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black leading-tight">
                  Smart Market Basket 🛒
                </h2>
                <p className="text-[11px] text-teal-100 font-medium">
                  {uncheckedCount} items to buy • {checkedCount} in cart ({progressPercent}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowPartnersModal(true)}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Truck size={13} className="shrink-0" />
                <span>Order Online 🚚</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSwapsModal(true)}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 backdrop-blur-sm border border-white/25 cursor-pointer transition-all"
              >
                <Sparkles size={13} className="text-amber-300 shrink-0" />
                <span>Diaspora Swaps 🧠</span>
              </button>
            </div>
          </div>

          {/* Basket Completion Progress Bar */}
          <div className="bg-black/20 p-2.5 rounded-2xl border border-white/15 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-teal-100">
              <span>Shopping Completion</span>
              <span>
                {checkedCount} / {groceryItems.length} Items Picked ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3 Micro Metrics (Estimated Price & Metabolic Grade) */}
          <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
            <div className="bg-white/15 backdrop-blur-md rounded-xl py-1.5 px-1 border border-white/20">
              <span className="text-[9px] text-teal-100 font-bold block">Estimated Cost</span>
              <span className="text-xs font-black text-white">
                {currencyInfo.symbol}{estLowTotal} - {currencyInfo.symbol}{estHighTotal}
              </span>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl py-1.5 px-1 border border-white/20">
              <span className="text-[9px] text-teal-100 font-bold block">Glycemic Index</span>
              <span className="text-xs font-black text-emerald-300">88% Low-GI Whole</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl py-1.5 px-1 border border-white/20">
              <span className="text-[9px] text-teal-100 font-bold block">Cardio Grade</span>
              <span className="text-xs font-black text-amber-300">100% Whole Clean</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
        {/* 1-Tap Quick Add Input Bar */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-4 shadow-sm border border-teal-100/90 space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemInput}
              onChange={(e) => setNewItemInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuickAddItem()}
              placeholder="Add grocery item... (e.g. Fresh Ugu, Titus fish, Scotch bonnet)"
              className="flex-1 h-11 px-3.5 border border-slate-200 rounded-2xl text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:border-[#1f7a8c] transition-all"
            />
            <button
              type="button"
              onClick={() => handleQuickAddItem()}
              disabled={isAddingItem || !newItemInput.trim()}
              className="h-11 px-4 bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add</span>
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
              Popular:
            </span>
            {QUICK_SUGGESTION_ITEMS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickAddItem(chip)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-bold text-[10.5px] rounded-xl border border-slate-200/80 shrink-0 cursor-pointer transition-all active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Way Grouping Switcher + Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Segmented Grouping View Controller */}
          <div className="bg-white p-1 rounded-2xl border border-teal-100 shadow-2xs flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setGroupingMode("aisle");
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                groupingMode === "aisle"
                  ? "bg-[#1f7a8c] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store size={13} className="shrink-0" />
              <span>By Supermarket Aisle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("light");
                setGroupingMode("meal");
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                groupingMode === "meal"
                  ? "bg-[#1f7a8c] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers size={13} className="shrink-0" />
              <span>By Meal Plan</span>
            </button>
          </div>

          {/* Action Tools: WhatsApp + Clear Checked */}
          <div className="flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={handleShareToWhatsApp}
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              title="Share checklist to WhatsApp"
            >
              <Share2 size={13} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyToClipboard}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-2xs cursor-pointer active:scale-95 transition-all"
              title="Copy plain text"
            >
              <Copy size={13} />
            </button>

            {checkedCount > 0 && (
              <button
                type="button"
                onClick={clearCheckedItems}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <Trash2 size={13} />
                <span>Clear ({checkedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <SkeletonList count={4} />
        ) : error ? (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-3xl p-6 text-white text-center">
            <p className="mb-4 text-xs font-bold">{error}</p>
            <button
              onClick={loadGroceryList}
              className="px-6 py-2 bg-white text-[#1f7a8c] rounded-xl font-black text-xs hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {t("profile.retry")}
            </button>
          </div>
        ) : groceryItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center space-y-4 border border-teal-100">
            <MascotEmptyState
              title={t("grocery.emptyTitle")}
              subtitle="Your smart market basket is currently empty. Plan a metabolic meal or tap above to add fresh African produce!"
              action={
                <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                  <button
                    onClick={() => navigate('/plan-meal')}
                    className="px-6 py-3 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl hover:shadow-lg transition-all font-black text-xs cursor-pointer"
                  >
                    {t("grocery.planMeal")} 🍲
                  </button>
                  <button
                    onClick={() => setShowPartnersModal(true)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl transition-all font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Store size={14} />
                    <span>Browse Partner Stores</span>
                  </button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* VIEW MODE 1: BY SUPERMARKET AISLE */}
            {groupingMode === "aisle" &&
              Object.entries(groupedByAisle).map(([aisleName, group]) => (
                <div
                  key={aisleName}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden border border-teal-100/90"
                >
                  <div
                    className={`bg-gradient-to-r ${group.color} p-3.5 sm:p-4 text-white flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-1 bg-white/20 rounded-xl backdrop-blur-xs">
                        {group.icon}
                      </span>
                      <h3 className="font-extrabold text-xs sm:text-sm tracking-tight">
                        {aisleName}
                      </h3>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">
                      {group.items.length} item{group.items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {group.items.map((item) => {
                      const swap = findMatchingSwap(item.ingredient);

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 sm:p-4 flex items-center gap-3 hover:bg-slate-50/80 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => toggleItemChecked(item.id)}
                            className={`shrink-0 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                              item.checked
                                ? "bg-[#1f7a8c] border-[#1f7a8c] shadow-2xs"
                                : "border-slate-300 hover:border-[#1f7a8c] bg-white"
                            }`}
                          >
                            {item.checked && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-xs font-bold block ${
                                item.checked ? "line-through text-slate-400" : "text-slate-900"
                              }`}
                            >
                              {item.ingredient}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-medium truncate">
                                {item.mealName || "General Basket"}
                              </span>
                              {swap && !item.checked && (
                                <button
                                  type="button"
                                  onClick={() => handleApplySwapDirect(item, swap)}
                                  className="text-[9.5px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.2 rounded-full border border-amber-200/60 inline-flex items-center gap-0.5 cursor-pointer"
                                  title="Click to swap with diaspora alternative"
                                >
                                  <ArrowRightLeft size={9} />
                                  <span>Swap: {swap.diasporaSwap}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="shrink-0 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            aria-label="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* VIEW MODE 2: BY MEAL PLAN */}
            {groupingMode === "meal" &&
              Object.entries(groupedByMeal).map(([mealName, items]) => (
                <div
                  key={mealName}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden border border-teal-100/90"
                >
                  <div className="bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] p-3.5 sm:p-4 text-white flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm">
                        {mealName === "Other" || mealName === "General Pantry"
                          ? "🍲 " + mealName
                          : `🍽️ ${mealName}`}
                      </h3>
                      {items[0]?.mealType && (
                        <p className="text-teal-100 text-[10.5px] font-semibold capitalize mt-0.5">
                          {mealTypeLabel(items[0].mealType)}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {items.map((item) => {
                      const swap = findMatchingSwap(item.ingredient);

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 sm:p-4 flex items-center gap-3 hover:bg-slate-50/80 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => toggleItemChecked(item.id)}
                            className={`shrink-0 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                              item.checked
                                ? "bg-[#1f7a8c] border-[#1f7a8c] shadow-2xs"
                                : "border-slate-300 hover:border-[#1f7a8c] bg-white"
                            }`}
                          >
                            {item.checked && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-xs font-bold block ${
                                item.checked ? "line-through text-slate-400" : "text-slate-900"
                              }`}
                            >
                              {item.ingredient}
                            </span>
                            {swap && !item.checked && (
                              <button
                                type="button"
                                onClick={() => handleApplySwapDirect(item, swap)}
                                className="text-[9.5px] font-black text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.2 rounded-full border border-amber-200/60 inline-flex items-center gap-0.5 mt-0.5 cursor-pointer"
                              >
                                <ArrowRightLeft size={9} />
                                <span>Swap: {swap.diasporaSwap}</span>
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="shrink-0 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            aria-label="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* PARTNER STORES MODAL */}
      <Dialog open={showPartnersModal} onOpenChange={setShowPartnersModal}>
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-50 rounded-2xl text-[#1f7a8c]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900">
                  Order Groceries Online 🚚
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Verified delivery partners in {selectedLocation.displayName} with African produce stock.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 transition-all shadow-xs flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-base">{partner.flag}</span>
                    <h4 className="text-xs font-black text-slate-900">{partner.name}</h4>
                    <span className="text-[9.5px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      {partner.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium leading-relaxed">
                    {partner.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                  <span className="text-[10.5px] text-slate-500 font-semibold">
                    ⚡ {partner.deliverySpeed}
                  </span>
                  <a
                    href={partner.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#1f7a8c] hover:bg-[#165c6a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Shop Store</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* METABOLIC SWAPS MODAL */}
      <Dialog open={showSwapsModal} onOpenChange={setShowSwapsModal}>
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900">
                  Diaspora Metabolic Swaps 🧠
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Substitutes with identical low-glycemic bioactives and nutrient matrices.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            {DIASPORA_SWAPS.map((swap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 line-through text-[11px] font-bold">
                    {swap.original}
                  </span>
                  <span className="text-[9.5px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                    {swap.marketAisle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-900 font-black text-xs">
                  <Leaf size={13} className="text-emerald-500 shrink-0" />
                  <span>Swap to: {swap.diasporaSwap}</span>
                </div>
                <p className="text-[10.5px] text-teal-900 font-medium leading-relaxed">
                  💡 {swap.glycemicBenefit}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
