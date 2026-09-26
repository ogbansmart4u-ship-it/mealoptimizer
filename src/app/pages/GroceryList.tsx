import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
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
  Volume2,
  VolumeX,
  Play,
  Pause,
  Search,
  Filter,
  Printer,
  Heart,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  Lightbulb,
  Award,
  ArrowRight,
} from "lucide-react";
import { projectId } from "/utils/supabase/info";
import { getAccessToken } from "../../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";
import { useLocation } from "../contexts/LocationContext";
import PageHeader from "../components/PageHeader";
import Breadcrumbs from "../components/Breadcrumbs";
import { SkeletonList } from "../components/SkeletonLoader";
import MascotEmptyState from "../components/MascotEmptyState";
import Mascot from "../components/Mascot";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  getPartnersForLocation,
  DIASPORA_SWAPS,
  GroceryStorePartner,
  MetabolicSwapItem,
} from "../../lib/groceryAffiliates";
import { toast } from "sonner";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";
import { soundEffects } from "../utils/soundEffects";
import { speakWithSarah, stopSarahSpeech } from "../services/voiceService";

export interface GroceryItem {
  id: string;
  ingredient: string;
  quantity?: string;
  mealName: string;
  mealType: string;
  checked: boolean;
  createdAt: string;
  category?: string;
  estimatedPrice?: string;
}

// Department / Supermarket Aisle Classifier with Health Badges & Gradients
export function categorizeIngredient(name: string): {
  aisle: string;
  icon: string;
  color: string;
  lightBg: string;
  badge: string;
  slug: "greens" | "protein" | "grains" | "legumes" | "spices" | "pantry";
} {
  const n = (name || "").toLowerCase();

  // Fresh Produce & Healing Greens
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
    n.includes("greens") ||
    n.includes("tatase") ||
    n.includes("atarodo") ||
    n.includes("shoko") ||
    n.includes("efo") ||
    n.includes("utazi") ||
    n.includes("uziza") ||
    n.includes("curry leaf") ||
    n.includes("bell pepper") ||
    n.includes("habanero") ||
    n.includes("scotch bonnet") ||
    n.includes("broccoli") ||
    n.includes("cauliflower") ||
    n.includes("zucchini")
  ) {
    return {
      aisle: "Fresh Produce & Healing Greens",
      icon: "🥬",
      color: "from-emerald-600 to-teal-700",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
      badge: "High Antioxidant & Low-GI",
      slug: "greens",
    };
  }

  // Clean Protein & Fresh Seafood
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
    n.includes("seafood") ||
    n.includes("tilapia") ||
    n.includes("cod") ||
    n.includes("sardine") ||
    n.includes("crab") ||
    n.includes("periwinkle") ||
    n.includes("panla") ||
    n.includes("kote")
  ) {
    return {
      aisle: "Clean Protein & Fresh Seafood",
      icon: "🥩",
      color: "from-blue-600 to-indigo-700",
      lightBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
      badge: "Lean Protein & Omega-3",
      slug: "protein",
    };
  }

  // Ancient Grains, Roots & Swallows
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
    n.includes("pasta") ||
    n.includes("teff") ||
    n.includes("acha") ||
    n.includes("plantain flour") ||
    n.includes("oat swallow") ||
    n.includes("cauliflower swallow") ||
    n.includes("almond swallow") ||
    n.includes("semovita") ||
    n.includes("wheat")
  ) {
    return {
      aisle: "Ancient Grains, Roots & Swallows",
      icon: "🌾",
      color: "from-amber-600 to-orange-700",
      lightBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
      badge: "Complex Carb & Prebiotic Fiber",
      slug: "grains",
    };
  }

  // Legumes, Seeds & Super-Nuts
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
    n.includes("cashew") ||
    n.includes("walnut") ||
    n.includes("peanut") ||
    n.includes("bambara") ||
    n.includes("oloyin") ||
    n.includes("honey bean")
  ) {
    return {
      aisle: "Legumes, Seeds & Super-Nuts",
      icon: "🫘",
      color: "from-purple-600 to-pink-700",
      lightBg: "bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40",
      badge: "Plant Protein & Healthy Lipids",
      slug: "legumes",
    };
  }

  // Cold-Pressed Oils & Bio-Active Spices
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
    n.includes("seasoning") ||
    n.includes("cameroon pepper") ||
    n.includes("ehuru") ||
    n.includes("calabash nutmeg") ||
    n.includes("suya spice") ||
    n.includes("yaji") ||
    n.includes("bouillon") ||
    n.includes("cloves")
  ) {
    return {
      aisle: "Cold-Pressed Oils & Bio-Active Spices",
      icon: "🫒",
      color: "from-yellow-600 to-amber-700",
      lightBg: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/40",
      badge: "Anti-Inflammatory & Cardio Safe",
      slug: "spices",
    };
  }

  // Pantry & General Groceries
  return {
    aisle: "Pantry & General Groceries",
    icon: "🥫",
    color: "from-teal-600 to-slate-700",
    lightBg: "bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/40",
    badge: "Pantry Staple",
    slug: "pantry",
  };
}

// Popular African Staples Quick Chips
const POPULAR_AFRICAN_STAPLES = [
  { name: "Fresh Ugu (Fluted Pumpkin)", icon: "🥬", qty: "2 bunches" },
  { name: "Scotch Bonnet (Atarodo)", icon: "🌶️", qty: "1 pack" },
  { name: "Titus Fish (Mackerel)", icon: "🐟", qty: "3 pieces" },
  { name: "Brown Honey Beans (Oloyin)", icon: "🫘", qty: "1 kg" },
  { name: "Organic Fonio Grain", icon: "🌾", qty: "500g" },
  { name: "Green Unripe Plantains", icon: "🍌", qty: "4 fingers" },
  { name: "Fresh Okra Pods", icon: "🥣", qty: "1 bowl" },
  { name: "Ginger & Garlic Root Pack", icon: "🧄", qty: "1 pack" },
  { name: "Dried Crayfish Powder", icon: "🦐", qty: "1 cup" },
  { name: "Cold-Pressed Olive Oil", icon: "🫒", qty: "500ml" },
];

// Quick Quantity Selector Chips
const QUICK_QUANTITIES = ["1 bunch", "1 kg", "500g", "2 packs", "3 pcs", "1 bag"];

// Sarah AI Market Freshness Hacks
const SARAH_MARKET_TIPS = [
  {
    icon: "🥬",
    title: "Fresh Ugu & Greens",
    tip: "Pick dark green fluted pumpkin leaves with firm, moist stems. Avoid any bunches with yellowing leaf tips as their beta-carotene and magnesium degrade rapidly.",
  },
  {
    icon: "🐟",
    title: "Titus Mackerel & Fish",
    tip: "Check for bright, bulging eyes and firm flesh that springs back when touched. A fresh sea breeze smell indicates peak Omega-3 cardio protection.",
  },
  {
    icon: "🍌",
    title: "Green vs Yellow Plantain",
    tip: "Always select deep green unripe plantains. They are packed with gut-healthy resistant starch, which digests slowly and does NOT spike your post-meal blood sugar.",
  },
  {
    icon: "🫘",
    title: "Honey Beans (Oloyin)",
    tip: "Inspect for clean, uniform brown beans without tiny pinholes (weevils). Soaking overnight with a pinch of cloves cuts cooking gas and phytic acid by 40%.",
  },
];

export default function GroceryList() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedLocation } = useLocation();

  // Core Data State
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View & Filter State
  const [groupingMode, setGroupingMode] = useState<"aisle" | "meal" | "flat">("aisle");
  const [filterMode, setFilterMode] = useState<"all" | "unchecked" | "checked" | "greens" | "protein" | "grains">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [marketRunMode, setMarketRunMode] = useState(false);

  // Quick Add State
  const [newItemInput, setNewItemInput] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1 pack");
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Sarah AI Voice & Tips State
  const [isSarahSpeaking, setIsSarahSpeaking] = useState(false);
  const [showTipsExpanded, setShowTipsExpanded] = useState(false);

  // Modals State
  const [showPartnersModal, setShowPartnersModal] = useState(false);
  const [showSwapsModal, setShowSwapsModal] = useState(false);
  const [selectedSwapDetail, setSelectedSwapDetail] = useState<{
    item: GroceryItem;
    swap: MetabolicSwapItem;
  } | null>(null);

  const partners = getPartnersForLocation(selectedLocation.country);

  // Currency & Estimated Pricing Multiplier based on user country
  const currencyInfo = useMemo(() => {
    const c = (selectedLocation.country || "").toLowerCase();
    if (c.includes("united kingdom") || c.includes("uk") || c.includes("london")) {
      return { symbol: "£", lowRate: 1.8, highRate: 3.4, name: "GBP" };
    }
    if (c.includes("united states") || c.includes("us") || c.includes("usa") || c.includes("america")) {
      return { symbol: "$", lowRate: 2.2, highRate: 4.8, name: "USD" };
    }
    if (c.includes("nigeria") || c.includes("lagos") || c.includes("abuja")) {
      return { symbol: "₦", lowRate: 1500, highRate: 3200, name: "NGN" };
    }
    if (c.includes("canada")) {
      return { symbol: "CA$", lowRate: 2.8, highRate: 5.6, name: "CAD" };
    }
    return { symbol: "€", lowRate: 2.1, highRate: 4.2, name: "EUR" };
  }, [selectedLocation]);

  // Translate meal type label safely
  const mealTypeLabel = (type: string) => {
    const safe = (type || "").toLowerCase();
    if (["breakfast", "brunch", "lunch", "dinner", "snack"].includes(safe)) {
      return t(`planmeal.meal.${safe}`) || type;
    }
    return type || "Daily Dish";
  };

  // Find metabolic swap item
  const findMatchingSwap = (ingredientName: string): MetabolicSwapItem | undefined => {
    const n = (ingredientName || "").toLowerCase();
    return DIASPORA_SWAPS.find((s) => {
      const orig = s.original.toLowerCase();
      return (
        n.includes(orig) ||
        orig.includes(n) ||
        (n.includes("garri") && orig.includes("garri")) ||
        (n.includes("rice") && orig.includes("rice")) ||
        (n.includes("eba") && orig.includes("garri")) ||
        (n.includes("fufu") && orig.includes("fufu")) ||
        (n.includes("ugu") && orig.includes("ugu")) ||
        (n.includes("ewedu") && orig.includes("ewedu")) ||
        (n.includes("scotch bonnet") && orig.includes("scotch bonnet")) ||
        (n.includes("atarodo") && orig.includes("scotch bonnet")) ||
        (n.includes("crayfish") && orig.includes("crayfish"))
      );
    });
  };

  // Load grocery list from both cache vaults + merge 7-day meal plan export if present
  useEffect(() => {
    // 1. Instant Cache Load & 7-Day Plan Merge
    try {
      const cached = localStorage.getItem("cached_grocery_list_items");
      const custom7Day = localStorage.getItem("mealoptimizer_custom_groceries");

      let initialList: GroceryItem[] = [];
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) initialList = parsed;
      }

      // Check if user exported groceries from 7-day plan
      if (custom7Day) {
        try {
          const parsed7Day = JSON.parse(custom7Day);
          if (Array.isArray(parsed7Day) && parsed7Day.length > 0) {
            const converted: GroceryItem[] = parsed7Day.map((item: any, idx: number) => ({
              id: item.id || `7day-${Date.now()}-${idx}`,
              ingredient: item.name || item.ingredient || "African Produce",
              quantity: item.quantity || "Weekly Prep",
              mealName: item.category || "7-Day Meal Plan",
              mealType: "general",
              checked: Boolean(item.checked),
              createdAt: new Date().toISOString(),
            }));

            // Avoid duplicate ingredients
            const existingNames = new Set(initialList.map((i) => i.ingredient.toLowerCase()));
            const newToAdd = converted.filter((c) => !existingNames.has(c.ingredient.toLowerCase()));

            if (newToAdd.length > 0) {
              initialList = [...initialList, ...newToAdd];
              localStorage.setItem("cached_grocery_list_items", JSON.stringify(initialList));
            }
          }
        } catch {
          /* ignore */
        }
      }

      if (initialList.length > 0) {
        setGroceryItems(initialList);
        setLoading(false);
      }
    } catch {
      /* ignore */
    }

    loadGroceryList();
  }, []);

  // Fetch list from Supabase backend
  const loadGroceryList = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessTokenStr = await getAccessToken();
      if (!accessTokenStr) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessTokenStr}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const serverItems: GroceryItem[] = data.items || [];
        if (serverItems.length > 0) {
          // Merge server items with local items
          setGroceryItems((prev) => {
            const combinedMap = new Map<string, GroceryItem>();
            serverItems.forEach((item) => combinedMap.set(item.id, item));
            prev.forEach((item) => {
              if (!combinedMap.has(item.id)) {
                combinedMap.set(item.id, item);
              }
            });
            const merged = Array.from(combinedMap.values());
            localStorage.setItem("cached_grocery_list_items", JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Backend fetch offline, using local vault:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add Item to List
  const handleQuickAddItem = async (customName?: string, customQty?: string) => {
    const rawName = (customName || newItemInput).trim();
    if (!rawName) return;

    triggerHaptic("light");
    soundEffects.playTactileTick();
    setIsAddingItem(true);

    const cleanName = rawName.replace(/^[^\w\s]+/, "").trim();
    const qty = customQty || selectedQuantity || "1 pack";

    const newItem: GroceryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ingredient: cleanName,
      quantity: qty,
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
    toast.success(`Added "${cleanName}" (${qty}) to grocery basket 🛒`);

    // Background sync to backend
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
              quantity: qty,
              mealName: "General Market Basket",
              mealType: "general",
            }),
          }
        );
      }
    } catch {
      /* offline sync resilient */
    }
  };

  // Toggle Item Checked
  const toggleItemChecked = async (itemId: string) => {
    try {
      triggerHaptic("light");
      soundEffects.playTactileTick();

      const item = groceryItems.find((i) => i.id === itemId);
      if (!item) return;

      const newCheckedState = !item.checked;
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
          soundEffects.playCelebrationChime();
          toast.success("🎉 Basket 100% Complete! Ready to cook healthy African meals!");
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

  // Delete Item
  const deleteItem = async (itemId: string) => {
    try {
      triggerHaptic("light");
      soundEffects.playTactileTick();

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

  // Clear Checked Items
  const clearCheckedItems = async () => {
    try {
      triggerHaptic("medium");
      soundEffects.playTactileTick();

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

  // Direct Swap in Place
  const handleApplySwapDirect = (item: GroceryItem, swap: MetabolicSwapItem) => {
    triggerHaptic("medium");
    soundEffects.playBubblePop();

    const updated = groceryItems.map((i) =>
      i.id === item.id ? { ...i, ingredient: swap.diasporaSwap } : i
    );
    setGroceryItems(updated);
    localStorage.setItem("cached_grocery_list_items", JSON.stringify(updated));
    setSelectedSwapDetail(null);
    setShowSwapsModal(false);
    toast.success(`Swapped to "${swap.diasporaSwap}" for healthy glucose stability! 🔄✨`);
  };

  // Sarah AI Voice Market Briefing
  const handleToggleSarahVoice = () => {
    if (isSarahSpeaking) {
      stopSarahSpeech();
      setIsSarahSpeaking(false);
      return;
    }

    triggerHaptic("light");
    soundEffects.playTactileTick();

    const unchecked = groceryItems.filter((i) => !i.checked);
    const text =
      `Hello! Here is your smart market briefing for ${selectedLocation.displayName}. ` +
      `You have ${unchecked.length} items remaining on your list. ` +
      `Remember to shop the outer perimeter of the market first for fresh healing greens like Ugu and waterleaf, and clean proteins like Titus fish. ` +
      `Always choose deep green, unripe plantains for high resistant starch and steady blood sugar. ` +
      `Let's make this market run healthy, easy, and energizing!`;

    speakWithSarah(text, {
      onStart: () => setIsSarahSpeaking(true),
      onEnd: () => setIsSarahSpeaking(false),
      onError: () => setIsSarahSpeaking(false),
    });
  };

  // Share to WhatsApp Formatter
  const handleShareToWhatsApp = () => {
    triggerHaptic("medium");
    triggerConfetti("burst");
    soundEffects.playTactileTick();

    const unchecked = groceryItems.filter((i) => !i.checked);
    const checked = groceryItems.filter((i) => i.checked);

    const listText =
      `🥑 *MealOptimiza Smart African Market Checklist* 🛒\n` +
      `📍 Location: *${selectedLocation.displayName}* (${selectedLocation.flag})\n` +
      `💰 Est. Basket: *${currencyInfo.symbol}${(groceryItems.length * currencyInfo.lowRate).toLocaleString()} - ${currencyInfo.symbol}${(groceryItems.length * currencyInfo.highRate).toLocaleString()}*\n\n` +
      `*TO BUY (${unchecked.length} items):*\n` +
      unchecked
        .map(
          (i, idx) =>
            `${idx + 1}. [ ] ${i.ingredient}${i.quantity ? ` (${i.quantity})` : ""} · _${i.mealName || "General"}_`
        )
        .join("\n") +
      (checked.length > 0
        ? `\n\n*ALREADY IN CART (${checked.length} items):*\n` +
          checked.map((i) => `✅ ~${i.ingredient}~`).join("\n")
        : "") +
      `\n\n💡 _Pro Tip: Shop the perimeter first for fresh healing greens and clean proteins!_\n` +
      `_Tracked with MealOptimiza · Cultural Health & Metabolic Intelligence_ 🥑`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(listText)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp formatted market checklist! 📲");
  };

  // Copy Plain Text
  const handleCopyToClipboard = () => {
    triggerHaptic("light");
    soundEffects.playTactileTick();

    const text = groceryItems
      .map(
        (i) =>
          `${i.checked ? "[x]" : "[ ]"} ${i.ingredient}${i.quantity ? ` (${i.quantity})` : ""} - ${i.mealName || "General"}`
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    toast.success("Market checklist copied to clipboard! 📋");
  };

  // Print Checklist Sheet
  const handlePrintList = () => {
    triggerHaptic("light");
    window.print();
  };

  // Filtered Items Computation
  const filteredItems = useMemo(() => {
    let result = groceryItems;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.ingredient.toLowerCase().includes(q) ||
          (item.mealName && item.mealName.toLowerCase().includes(q)) ||
          categorizeIngredient(item.ingredient).aisle.toLowerCase().includes(q)
      );
    }

    // Status / Category filter
    if (filterMode === "unchecked") {
      result = result.filter((item) => !item.checked);
    } else if (filterMode === "checked") {
      result = result.filter((item) => item.checked);
    } else if (filterMode === "greens") {
      result = result.filter(
        (item) => categorizeIngredient(item.ingredient).slug === "greens"
      );
    } else if (filterMode === "protein") {
      result = result.filter(
        (item) => categorizeIngredient(item.ingredient).slug === "protein"
      );
    } else if (filterMode === "grains") {
      result = result.filter(
        (item) => categorizeIngredient(item.ingredient).slug === "grains"
      );
    }

    return result;
  }, [groceryItems, searchQuery, filterMode]);

  // Grouped by Supermarket Aisle
  const groupedByAisle = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const cat = categorizeIngredient(item.ingredient);
      if (!acc[cat.aisle]) {
        acc[cat.aisle] = {
          icon: cat.icon,
          color: cat.color,
          badge: cat.badge,
          items: [],
        };
      }
      acc[cat.aisle].items.push(item);
      return acc;
    }, {} as Record<string, { icon: string; color: string; badge: string; items: GroceryItem[] }>);
  }, [filteredItems]);

  // Grouped by Planned Meal
  const groupedByMeal = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const key = item.mealName || "General Pantry Basket";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);
  }, [filteredItems]);

  // Metric Computations
  const uncheckedCount = groceryItems.filter((i) => !i.checked).length;
  const checkedCount = groceryItems.filter((i) => i.checked).length;
  const progressPercent =
    groceryItems.length > 0 ? Math.round((checkedCount / groceryItems.length) * 100) : 0;

  const estLowTotal = (groceryItems.length * currencyInfo.lowRate).toLocaleString(undefined, {
    maximumFractionDigits: currencyInfo.symbol === "₦" ? 0 : 2,
  });
  const estHighTotal = (groceryItems.length * currencyInfo.highRate).toLocaleString(undefined, {
    maximumFractionDigits: currencyInfo.symbol === "₦" ? 0 : 2,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F5F5] via-slate-50 to-teal-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-slate-900 dark:text-white pb-36 transition-colors">
      {/* 🧭 Top Page Header */}
      <PageHeader
        title={t("grocery.title") || "Smart Grocery Checklist"}
        showHome
        backTo="/plan-meal"
        className="bg-gradient-to-r from-[#126778] via-[#1f7a8c] to-[#0d9488] text-white shadow-sm"
      />

      {/* 📍 Sub-Header: Breadcrumbs & Active Store Region */}
      <div className="bg-gradient-to-r from-[#126778] via-[#1f7a8c] to-[#0d9488] px-4 sm:px-6 pb-3 flex items-center justify-between text-white border-b border-teal-400/20">
        <Breadcrumbs
          items={[
            { label: t("grocery.breadcrumbMeal") || "7-Day Meal Plan", path: "/plan-meal" },
            { label: t("grocery.title") || "Grocery Checklist" },
          ]}
          className="text-white/85 text-xs font-semibold"
        />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-teal-100 font-extrabold flex items-center gap-1 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
            <MapPin size={11} className="text-amber-300" /> {selectedLocation.flag} {selectedLocation.displayName}
          </span>
        </div>
      </div>

      {/* 🌟 10X HERO CONTROL DECK: STATS, SARAH VOICE COACH & ACTIONS */}
      <div className="px-4 sm:px-6 max-w-3xl mx-auto -mt-1 pt-3 space-y-3.5">
        <div className="bg-gradient-to-br from-[#126778] via-[#0f5462] to-[#0a232a] text-white border-2 border-teal-300/30 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5">
            {/* Top Deck Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-md shrink-0">
                  <ShoppingCart className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                      Market Ready
                    </span>
                    <span className="text-[10.5px] text-teal-200 font-bold">
                      {uncheckedCount} items left to buy
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                    Smart African Market Basket 🛒
                  </h2>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    soundEffects.playTactileTick();
                    setMarketRunMode(!marketRunMode);
                  }}
                  className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 ${
                    marketRunMode
                      ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                      : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/25"
                  }`}
                  title="Toggle in-store full focus mode"
                >
                  <Zap size={13} className={marketRunMode ? "text-slate-950" : "text-amber-300"} />
                  <span>{marketRunMode ? "Exit Store Mode" : "Store Mode"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPartnersModal(true)}
                  className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Truck size={13} className="shrink-0" />
                  <span>Order Online 🚚</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSwapsModal(true)}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 backdrop-blur-sm border border-white/25 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles size={13} className="text-amber-300 shrink-0" />
                  <span>Diaspora Swaps 🧠</span>
                </button>
              </div>
            </div>

            {/* Shopping Completion Progress Meter */}
            <div className="bg-black/25 p-3 rounded-2xl border border-white/15 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-teal-100">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Basket Pick Progress</span>
                </span>
                <span className="font-mono">
                  {checkedCount} / {groceryItems.length} Picked ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-amber-400 via-emerald-400 to-white h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 3 Health & Economic Micro-Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl py-2 px-1 border border-white/15">
                <span className="text-[9px] text-teal-200 font-bold block uppercase tracking-wider">
                  Estimated Cost
                </span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {currencyInfo.symbol}{estLowTotal} - {currencyInfo.symbol}{estHighTotal}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl py-2 px-1 border border-white/15">
                <span className="text-[9px] text-emerald-300 font-bold block uppercase tracking-wider">
                  Glycemic Rating
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-300">
                  88% Low-GI Whole
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl py-2 px-1 border border-white/15">
                <span className="text-[9px] text-amber-300 font-bold block uppercase tracking-wider">
                  Heart Protection
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-300">
                  100% Cardio Clean
                </span>
              </div>
            </div>

            {/* 🎙️ SARAH AI VOICE MARKET GUIDE HERO CARD */}
            <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-teal-400 p-0.5 shadow-md">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-lg">
                      👩🏾‍💼
                    </div>
                  </div>
                  {isSarahSpeaking && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                      Sarah AI Market Coach
                    </span>
                    {isSarahSpeaking && (
                      <div className="flex items-end gap-0.5 h-2.5 ml-1">
                        <div className="w-0.5 bg-amber-300 rounded-full animate-pulse h-2" />
                        <div className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2.5" />
                        <div className="w-0.5 bg-amber-300 rounded-full animate-pulse h-1" />
                        <div className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-teal-100 font-medium">
                    {isSarahSpeaking ? "Speaking market briefing..." : "Audio briefing & produce freshness hacks"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSarahVoice}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                    isSarahSpeaking
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-[#126778] hover:bg-teal-700 text-white border border-teal-300/40"
                  }`}
                >
                  {isSarahSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} className="text-amber-300" />}
                  <span>{isSarahSpeaking ? "Stop Voice" : "Play Briefing"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTipsExpanded(!showTipsExpanded)}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-bold text-teal-100 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Lightbulb size={12} className="text-amber-300" />
                  <span>Market Hacks</span>
                  {showTipsExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              </div>
            </div>

            {/* Expandable Sarah Market Freshness Hacks */}
            {showTipsExpanded && (
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/15 space-y-2.5 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                    <Sparkles size={12} /> Sarah's Expert Produce Guide
                  </span>
                  <span className="text-[9.5px] text-teal-200">How to inspect open-market picks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SARAH_MARKET_TIPS.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white/10 rounded-xl border border-white/10 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-1.5 font-black text-amber-200 text-[11px]">
                        <span>{tip.icon}</span>
                        <span>{tip.title}</span>
                      </div>
                      <p className="text-[10.5px] text-teal-100 leading-relaxed font-normal">
                        {tip.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🥑 AVO MASCOT CHEERING BANNER */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3.5 sm:p-4 border border-teal-100 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Mascot
              gesture={progressPercent === 100 ? "celebrate" : "thumbsup"}
              size={52}
              className="shrink-0"
            />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#126778] dark:text-teal-400 block">
                Avo's Grocery Intelligence
              </span>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-tight">
                {progressPercent === 100
                  ? "🎉 Amazing job! All ingredients picked! You are ready to prepare wholesome, blood-sugar stabilizing African meals."
                  : uncheckedCount > 0
                  ? `You have ${uncheckedCount} items left. Stick to whole fiber-rich produce to keep glucose rock-steady! 🥑`
                  : "Start planning your weekly groceries or tap a popular staple below to fill your basket!"}
              </p>
            </div>
          </div>

          {progressPercent === 100 && (
            <button
              type="button"
              onClick={() => {
                triggerConfetti("burst");
                triggerHaptic("success");
                soundEffects.playCelebrationChime();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs shrink-0 cursor-pointer active:scale-95"
            >
              Celebrate 🎉
            </button>
          )}
        </div>

        {/* 🛒 1-TAP QUICK ADD & QUANTITY PICKER BAR */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3.5 sm:p-4 shadow-sm border border-teal-100 dark:border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={newItemInput}
                onChange={(e) => setNewItemInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickAddItem()}
                placeholder="Add custom item... (e.g. Fresh Ugu, Titus fish, Green plantains)"
                className="flex-1 h-11 px-3.5 border border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-medium bg-slate-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#126778] transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Quantity Preset Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {QUICK_QUANTITIES.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSelectedQuantity(q)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all ${
                      selectedQuantity === q
                        ? "bg-[#126778] text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-teal-50"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleQuickAddItem()}
                disabled={isAddingItem || !newItemInput.trim()}
                className="h-11 px-4 bg-gradient-to-r from-[#126778] to-[#0d9488] hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Popular African Staples Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
              1-Tap Add African Staples:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {POPULAR_AFRICAN_STAPLES.map((staple, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAddItem(staple.name, staple.qty)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-teal-900 font-bold text-[11px] rounded-xl border border-slate-200/80 dark:border-zinc-700/80 shrink-0 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                >
                  <span>{staple.icon}</span>
                  <span>{staple.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🎛️ VIEW CONTROLLER & TOOLBAR */}
        <div className="space-y-2.5">
          {/* Top Row: Grouping View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-teal-100 dark:border-zinc-800 shadow-2xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  soundEffects.playTactileTick();
                  setGroupingMode("aisle");
                }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  groupingMode === "aisle"
                    ? "bg-[#126778] text-white shadow-2xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Store size={13} className="shrink-0" />
                <span>Supermarket Aisles</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  soundEffects.playTactileTick();
                  setGroupingMode("meal");
                }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  groupingMode === "meal"
                    ? "bg-[#126778] text-white shadow-2xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers size={13} className="shrink-0" />
                <span>By Meal Dish</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  soundEffects.playTactileTick();
                  setGroupingMode("flat");
                }}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  groupingMode === "flat"
                    ? "bg-[#126778] text-white shadow-2xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Tag size={13} className="shrink-0" />
                <span>Compact List</span>
              </button>
            </div>

            {/* Quick Share / Export Tools */}
            <div className="flex items-center gap-1.5 justify-end">
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Send checklist to WhatsApp"
              >
                <Share2 size={13} />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="p-2 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
                title="Copy plain text"
              >
                <Copy size={13} />
              </button>

              <button
                type="button"
                onClick={handlePrintList}
                className="p-2 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
                title="Print checklist"
              >
                <Printer size={13} />
              </button>

              {checkedCount > 0 && (
                <button
                  type="button"
                  onClick={clearCheckedItems}
                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <Trash2 size={13} />
                  <span>Clear ({checkedCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Bar + Filter Pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients in your basket (e.g. Ugu, fish, fonio)..."
                className="w-full h-10 pl-9 pr-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#126778] transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playTactileTick();
                  setFilterMode("all");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all shrink-0 ${
                  filterMode === "all"
                    ? "bg-[#126778] text-white shadow-2xs"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
                }`}
              >
                All ({groceryItems.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playTactileTick();
                  setFilterMode("unchecked");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all shrink-0 ${
                  filterMode === "unchecked"
                    ? "bg-amber-500 text-slate-950 shadow-2xs"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
                }`}
              >
                To Buy ({uncheckedCount})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playTactileTick();
                  setFilterMode("checked");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all shrink-0 ${
                  filterMode === "checked"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
                }`}
              >
                In Cart ({checkedCount})
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playTactileTick();
                  setFilterMode("greens");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all shrink-0 flex items-center gap-1 ${
                  filterMode === "greens"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
                }`}
              >
                <span>🥬</span>
                <span>Fresh Greens</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playTactileTick();
                  setFilterMode("protein");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all shrink-0 flex items-center gap-1 ${
                  filterMode === "protein"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
                }`}
              >
                <span>🥩</span>
                <span>Clean Protein</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEffects.playTactileTick();
                  setFilterMode("grains");
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all shrink-0 flex items-center gap-1 ${
                  filterMode === "grains"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800"
                }`}
              >
                <span>🌾</span>
                <span>Ancient Grains</span>
              </button>
            </div>
          </div>
        </div>

        {/* 📋 LIST CONTENT SECTION */}
        {loading ? (
          <SkeletonList count={4} />
        ) : error ? (
          <div className="bg-rose-500/20 rounded-3xl p-6 text-rose-900 dark:text-rose-200 text-center border border-rose-300/40">
            <p className="mb-4 text-xs font-bold">{error}</p>
            <button
              onClick={loadGroceryList}
              className="px-6 py-2 bg-[#126778] text-white rounded-2xl font-black text-xs cursor-pointer shadow-sm"
            >
              {t("profile.retry") || "Retry Loading"}
            </button>
          </div>
        ) : groceryItems.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm p-8 text-center space-y-4 border border-teal-100 dark:border-zinc-800">
            <MascotEmptyState
              title={t("grocery.emptyTitle") || "Your Market Basket is Empty"}
              subtitle="Your smart market checklist is currently clear. Add fresh African produce using the bar above, or import your 7-day meal plan!"
              action={
                <div className="flex flex-col gap-2.5 w-full max-w-xs mx-auto">
                  <button
                    onClick={() => navigate("/plan-meal")}
                    className="px-6 py-3 bg-[#126778] hover:bg-teal-700 text-white rounded-2xl hover:shadow-lg transition-all font-black text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>{t("grocery.planMeal") || "Explore 7-Day Meal Plan"}</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => {
                      POPULAR_AFRICAN_STAPLES.slice(0, 5).forEach((s) =>
                        handleQuickAddItem(s.name, s.qty)
                      );
                    }}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-2xl transition-all font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Quick Add 5 African Staples</span>
                  </button>
                </div>
              }
            />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center space-y-2 border border-slate-200 dark:border-zinc-800">
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
              No items matching "{searchQuery}"
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or switching active filter chips.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterMode("all");
              }}
              className="mt-2 px-4 py-1.5 bg-[#126778] text-white rounded-xl font-bold text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 🏬 VIEW MODE 1: BY SUPERMARKET AISLE */}
            {groupingMode === "aisle" &&
              Object.entries(groupedByAisle).map(([aisleName, group]) => (
                <div
                  key={aisleName}
                  className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm overflow-hidden border border-teal-100/90 dark:border-zinc-800"
                >
                  {/* Aisle Header Banner */}
                  <div
                    className={`bg-gradient-to-r ${group.color} p-3.5 sm:p-4 text-white flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl p-1 bg-white/20 rounded-xl backdrop-blur-xs">
                        {group.icon}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-xs sm:text-sm tracking-tight text-white leading-tight">
                          {aisleName}
                        </h3>
                        <span className="text-[10px] text-white/80 font-medium block">
                          {group.badge}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10.5px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-bold text-white">
                      {group.items.length} item{group.items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Aisle Items */}
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {group.items.map((item) => {
                      const swap = findMatchingSwap(item.ingredient);

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 sm:p-4 flex items-center gap-3 transition-colors ${
                            item.checked
                              ? "bg-slate-50/50 dark:bg-zinc-900/40 opacity-70"
                              : "hover:bg-teal-50/30 dark:hover:bg-zinc-800/40"
                          } ${marketRunMode ? "min-h-[58px]" : ""}`}
                        >
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleItemChecked(item.id)}
                            className={`shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                              item.checked
                                ? "bg-[#126778] border-[#126778] text-white shadow-2xs"
                                : "border-slate-300 dark:border-zinc-600 hover:border-[#126778] bg-white dark:bg-zinc-800"
                            }`}
                            aria-label={`Mark ${item.ingredient} as ${item.checked ? "unpicked" : "picked"}`}
                          >
                            {item.checked && <Check className="h-4 w-4 stroke-[3]" />}
                          </button>

                          {/* Ingredient & Detail */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-sm font-bold block ${
                                  item.checked
                                    ? "line-through text-slate-400 dark:text-zinc-500"
                                    : "text-slate-900 dark:text-white"
                                }`}
                              >
                                {item.ingredient}
                              </span>
                              {item.quantity && (
                                <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded-md">
                                  {item.quantity}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                                {item.mealName || "General Basket"}
                              </span>

                              {/* In-Line Diaspora Swap Trigger */}
                              {swap && !item.checked && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSwapDetail({ item, swap })}
                                  className="text-[9.5px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                  title="View diaspora metabolic swap"
                                >
                                  <ArrowRightLeft size={9} />
                                  <span>Swap: {swap.diasporaSwap}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Delete Item */}
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="shrink-0 p-1.5 text-slate-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                            aria-label={`Delete ${item.ingredient}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* 🍽️ VIEW MODE 2: BY MEAL PLAN */}
            {groupingMode === "meal" &&
              Object.entries(groupedByMeal).map(([mealName, items]) => (
                <div
                  key={mealName}
                  className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm overflow-hidden border border-teal-100/90 dark:border-zinc-800"
                >
                  <div className="bg-gradient-to-r from-[#126778] to-[#0d9488] p-3.5 sm:p-4 text-white flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                        <span>🍽️</span>
                        <span>{mealName}</span>
                      </h3>
                      {items[0]?.mealType && (
                        <p className="text-teal-100 text-[10.5px] font-semibold capitalize mt-0.5">
                          {mealTypeLabel(items[0].mealType)}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-bold text-white">
                      {items.length} item{items.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {items.map((item) => {
                      const swap = findMatchingSwap(item.ingredient);

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 sm:p-4 flex items-center gap-3 transition-colors ${
                            item.checked
                              ? "bg-slate-50/50 dark:bg-zinc-900/40 opacity-70"
                              : "hover:bg-teal-50/30 dark:hover:bg-zinc-800/40"
                          } ${marketRunMode ? "min-h-[58px]" : ""}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleItemChecked(item.id)}
                            className={`shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                              item.checked
                                ? "bg-[#126778] border-[#126778] text-white shadow-2xs"
                                : "border-slate-300 dark:border-zinc-600 hover:border-[#126778] bg-white dark:bg-zinc-800"
                            }`}
                          >
                            {item.checked && <Check className="h-4 w-4 stroke-[3]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs sm:text-sm font-bold block ${
                                  item.checked
                                    ? "line-through text-slate-400 dark:text-zinc-500"
                                    : "text-slate-900 dark:text-white"
                                }`}
                              >
                                {item.ingredient}
                              </span>
                              {item.quantity && (
                                <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded-md">
                                  {item.quantity}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                                {categorizeIngredient(item.ingredient).aisle}
                              </span>

                              {swap && !item.checked && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSwapDetail({ item, swap })}
                                  className="text-[9.5px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95"
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
                            className="shrink-0 p-1.5 text-slate-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* 🏷️ VIEW MODE 3: FLAT COMPACT LIST */}
            {groupingMode === "flat" && (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm overflow-hidden border border-teal-100/90 dark:border-zinc-800">
                <div className="bg-gradient-to-r from-[#126778] to-[#0d9488] p-3.5 sm:p-4 text-white flex items-center justify-between">
                  <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                    <Tag size={14} />
                    <span>Complete Grocery Checklist</span>
                  </h3>
                  <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-bold text-white">
                    {filteredItems.length} items
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredItems.map((item) => {
                    const cat = categorizeIngredient(item.ingredient);
                    const swap = findMatchingSwap(item.ingredient);

                    return (
                      <div
                        key={item.id}
                        className={`p-3 sm:p-3.5 flex items-center gap-3 transition-colors ${
                          item.checked
                            ? "bg-slate-50/50 dark:bg-zinc-900/40 opacity-70"
                            : "hover:bg-teal-50/30 dark:hover:bg-zinc-800/40"
                        } ${marketRunMode ? "min-h-[58px]" : ""}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleItemChecked(item.id)}
                          className={`shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                            item.checked
                              ? "bg-[#126778] border-[#126778] text-white shadow-2xs"
                              : "border-slate-300 dark:border-zinc-600 hover:border-[#126778] bg-white dark:bg-zinc-800"
                          }`}
                        >
                          {item.checked && <Check className="h-4 w-4 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base">{cat.icon}</span>
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                item.checked
                                  ? "line-through text-slate-400 dark:text-zinc-500"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {item.ingredient}
                            </span>
                            {item.quantity && (
                              <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded-md">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {cat.aisle} • {item.mealName || "General Basket"}
                          </span>
                        </div>

                        {swap && !item.checked && (
                          <button
                            type="button"
                            onClick={() => setSelectedSwapDetail({ item, swap })}
                            className="text-[9.5px] font-black text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowRightLeft size={9} />
                            <span>Swap</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="shrink-0 p-1.5 text-slate-300 dark:text-zinc-600 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🚀 MARKET RUN STICKY HUD (Activated in Store Mode) */}
      {marketRunMode && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-950/95 dark:bg-zinc-900/95 backdrop-blur-md text-white p-3.5 px-4 rounded-3xl shadow-2xl border border-teal-500/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black text-sm">
                🛒
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  Market Run Mode Active
                </span>
                <span className="text-xs font-black text-white">
                  {uncheckedCount > 0 ? `${uncheckedCount} items left to grab` : "All items in basket! 🎉"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilterMode(filterMode === "unchecked" ? "all" : "unchecked");
                  soundEffects.playTactileTick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                  filterMode === "unchecked"
                    ? "bg-amber-400 text-slate-950 font-black"
                    : "bg-white/20 text-white"
                }`}
              >
                {filterMode === "unchecked" ? "Show All" : "Hide Picked"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMarketRunMode(false);
                  soundEffects.playTactileTick();
                }}
                className="px-3.5 py-1.5 bg-[#126778] hover:bg-teal-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚚 PARTNER STORES MODAL */}
      <Dialog open={showPartnersModal} onOpenChange={setShowPartnersModal}>
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl max-h-[88vh] overflow-y-auto bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-teal-100 dark:border-zinc-800">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-2xl text-[#126778] dark:text-teal-400">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Order Groceries Online 🚚
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
                  Verified delivery partners in {selectedLocation.displayName} stocked with authentic African produce.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 hover:border-teal-400 transition-all shadow-xs flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-base">{partner.flag}</span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {partner.name}
                    </h4>
                    <span className="text-[9.5px] bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      {partner.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1 font-medium leading-relaxed">
                    {partner.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-zinc-700 text-xs">
                  <span className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-semibold">
                    ⚡ {partner.deliverySpeed}
                  </span>
                  <a
                    href={partner.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-[#126778] hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs"
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

      {/* 🧠 DIASPORA METABOLIC SWAPS MODAL */}
      <Dialog open={showSwapsModal} onOpenChange={setShowSwapsModal}>
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl max-h-[88vh] overflow-y-auto bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-teal-100 dark:border-zinc-800">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl text-amber-600 dark:text-amber-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Diaspora Metabolic Swaps 🧠
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
                  Substitutes with identical low-glycemic bioactives and nutrient matrices available in Western supermarkets.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            {DIASPORA_SWAPS.map((swap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 dark:text-zinc-400 line-through text-[11px] font-bold">
                    {swap.original}
                  </span>
                  <span className="text-[9.5px] bg-teal-100 dark:bg-teal-950/50 text-teal-900 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                    {swap.marketAisle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-black text-xs">
                  <Leaf size={13} className="text-emerald-500 shrink-0" />
                  <span>Swap to: {swap.diasporaSwap}</span>
                </div>
                <p className="text-[10.5px] text-teal-900 dark:text-teal-200 font-medium leading-relaxed">
                  💡 {swap.glycemicBenefit}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 🔄 INDIVIDUAL IN-LINE SWAP DETAIL DIALOG */}
      <Dialog
        open={Boolean(selectedSwapDetail)}
        onOpenChange={(open) => !open && setSelectedSwapDetail(null)}
      >
        <DialogContent className="max-w-md p-5 sm:p-6 rounded-3xl bg-slate-950 text-white border border-teal-500/30">
          {selectedSwapDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-400/30 text-2xl">
                  🔄
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                    Metabolic Ingredient Swap
                  </span>
                  <h3 className="text-base font-black text-white leading-tight">
                    {selectedSwapDetail.item.ingredient}
                  </h3>
                </div>
              </div>

              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Original:</span>
                  <span className="text-xs font-bold line-through text-slate-400">
                    {selectedSwapDetail.item.ingredient}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-300 font-bold">Swap to:</span>
                  <span className="text-xs font-black text-emerald-300">
                    {selectedSwapDetail.swap.diasporaSwap}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">Market Location:</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {selectedSwapDetail.swap.marketAisle}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-teal-950/60 rounded-2xl border border-teal-500/30 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 block">
                  🧬 Clinical Blood Sugar Benefit:
                </span>
                <p className="text-xs text-teal-100 font-medium leading-relaxed">
                  {selectedSwapDetail.swap.glycemicBenefit}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleApplySwapDirect(
                      selectedSwapDetail.item,
                      selectedSwapDetail.swap
                    )
                  }
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl cursor-pointer shadow-md transition-all active:scale-95"
                >
                  Apply Swap ✨
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSwapDetail(null)}
                  className="py-3 bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-2xl cursor-pointer transition-all active:scale-95"
                >
                  Keep Original
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
