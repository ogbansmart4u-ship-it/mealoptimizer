import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Trash2, Check, ExternalLink, Store, Sparkles, Share2, MapPin, Truck, Leaf } from 'lucide-react';
import { projectId } from '/utils/supabase/info';
import { getAccessToken } from '../../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation } from '../contexts/LocationContext';
import PageHeader from '../components/PageHeader';
import Breadcrumbs from '../components/Breadcrumbs';
import { SkeletonList } from '../components/SkeletonLoader';
import MascotEmptyState from '../components/MascotEmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { getPartnersForLocation, DIASPORA_SWAPS, GroceryStorePartner } from '../../lib/groceryAffiliates';
import { toast } from 'sonner';
import { triggerHaptic, triggerConfetti } from '../utils/celebration';

interface GroceryItem {
  id: string;
  ingredient: string;
  mealName: string;
  mealType: string;
  checked: boolean;
  createdAt: string;
}

export default function GroceryList() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedLocation } = useLocation();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Partner Store & Swaps Modals
  const [showPartnersModal, setShowPartnersModal] = useState(false);
  const [showSwapsModal, setShowSwapsModal] = useState(false);

  const partners = getPartnersForLocation(selectedLocation.country);

  // Translate a meal type ("breakfast" → localized) with a safe fallback.
  const mealTypeLabel = (type: string) =>
    ["breakfast", "brunch", "lunch", "dinner"].includes((type || "").toLowerCase())
      ? t(`planmeal.meal.${type.toLowerCase()}`)
      : type;

  // Load grocery list from backend
  useEffect(() => {
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
      setGroceryItems(data.items || []);
    } catch (err) {
      console.error('Error loading grocery list:', err);
      setError(err instanceof Error ? err.message : 'Failed to load grocery list');
    } finally {
      setLoading(false);
    }
  };

  const toggleItemChecked = async (itemId: string) => {
    try {
      triggerHaptic("light");
      const item = groceryItems.find(i => i.id === itemId);
      if (!item) return;

      const newCheckedState = !item.checked;

      // Update UI optimistically
      setGroceryItems(items => 
        items.map(i => i.id === itemId ? { ...i, checked: newCheckedState } : i)
      );

      const accessTokenStr = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list/${itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessTokenStr}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checked: newCheckedState }),
        }
      );

      if (!response.ok) {
        // Revert on error
        setGroceryItems(items => 
          items.map(i => i.id === itemId ? { ...i, checked: !newCheckedState } : i)
        );
        throw new Error('Failed to update item');
      }
    } catch (err) {
      console.error('Error toggling item:', err);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      triggerHaptic("light");
      // Update UI optimistically
      setGroceryItems(items => items.filter(i => i.id !== itemId));

      const accessTokenStr = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list/${itemId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessTokenStr}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Reload on error
        loadGroceryList();
        throw new Error('Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const clearCheckedItems = async () => {
    try {
      triggerHaptic("medium");
      const checkedItems = groceryItems.filter(i => i.checked);
      if (checkedItems.length === 0) return;

      // Update UI optimistically
      setGroceryItems(items => items.filter(i => !i.checked));

      const accessTokenStr = await getAccessToken();
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/grocery-list/clear-checked`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessTokenStr}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Reload on error
        loadGroceryList();
        throw new Error('Failed to clear checked items');
      }
    } catch (err) {
      console.error('Error clearing checked items:', err);
    }
  };

  const handleShareToWhatsApp = () => {
    triggerHaptic("medium");
    triggerConfetti("burst");

    const unchecked = groceryItems.filter((i) => !i.checked);
    const checked = groceryItems.filter((i) => i.checked);

    const listText =
      `🥑 *MealOptimizer Grocery List* 🛒\n` +
      `📍 Market: *${selectedLocation.displayName}*\n\n` +
      `*TO BUY (${unchecked.length}):*\n` +
      unchecked.map((i) => `◻️ ${i.ingredient} (${i.mealName || "General"})`).join("\n") +
      (checked.length > 0
        ? `\n\n*ALREADY PICKED (${checked.length}):*\n` + checked.map((i) => `✅ ~${i.ingredient}~`).join("\n")
        : "") +
      `\n\n_Generated from MealOptimizer · Cultural Health Intelligence_`;

    const waUrl = `https://wa.me/?text=${encodeURIComponent(listText)}`;
    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp share sheet!");
  };

  const groupedItems = groceryItems.reduce((acc, item) => {
    const key = item.mealName || 'General Pantry';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  const uncheckedCount = groceryItems.filter(i => !i.checked).length;
  const checkedCount = groceryItems.filter(i => i.checked).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f7a8c] via-[#2a9d8f] to-[#4ecdc4]">
      {/* Header */}
      <PageHeader
        title={t("grocery.title")}
        showHome
        className="bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f]"
      />

      {/* Breadcrumbs & Location Bar */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] px-6 pb-3 flex items-center justify-between">
        <Breadcrumbs
          items={[
            { label: t("grocery.breadcrumbMeal"), path: "/plan-meal" },
            { label: t("grocery.title") }
          ]}
          className="text-white/80"
        />
        <span className="text-xs text-teal-100 font-bold flex items-center gap-1">
          <MapPin size={12} /> {selectedLocation.flag} {selectedLocation.displayName}
        </span>
      </div>

      {/* Stats & 1-Tap Action Pill */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] px-6 pb-4 flex flex-wrap justify-between items-center gap-2 text-sm text-white">
        <div className="flex gap-2">
          <div className="bg-white/20 rounded-xl px-3 py-1.5 backdrop-blur-sm text-xs">
            <span className="font-bold">{uncheckedCount}</span> {t("grocery.toBuy")}
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-1.5 backdrop-blur-sm text-xs">
            <span className="font-bold">{checkedCount}</span> {t("grocery.checked")}
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setShowPartnersModal(true)}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-extrabold text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer"
          >
            <Truck size={13} />
            <span>Order Delivery 🚚</span>
          </button>
          <button
            onClick={() => setShowSwapsModal(true)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs flex items-center gap-1 backdrop-blur-sm transition-all cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Swaps</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24 max-w-2xl mx-auto">
        {loading ? (
          <SkeletonList count={4} />
        ) : error ? (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-6 text-white text-center">
            <p className="mb-4">{error}</p>
            <button
              onClick={loadGroceryList}
              className="px-6 py-2 bg-white text-[#1f7a8c] rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("profile.retry")}
            </button>
          </div>
        ) : groceryItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-4">
            <MascotEmptyState
              title={t("grocery.emptyTitle")}
              subtitle={t("grocery.emptySubtitle")}
              action={
                <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                  <button
                    onClick={() => navigate('/plan-meal')}
                    className="px-6 py-3 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl hover:shadow-lg transition-all font-bold text-xs cursor-pointer"
                  >
                    {t("grocery.planMeal")}
                  </button>
                  <button
                    onClick={() => setShowPartnersModal(true)}
                    className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl transition-all font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Store size={14} />
                    <span>Browse Partner Stores</span>
                  </button>
                </div>
              }
            />
          </div>
        ) : (
          <>
            {/* Top Toolbar */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <button
                onClick={handleShareToWhatsApp}
                className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Share2 size={14} />
                <span>Send to WhatsApp</span>
              </button>

              {checkedCount > 0 && (
                <button
                  onClick={clearCheckedItems}
                  className="px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("grocery.clearChecked")} ({checkedCount})
                </button>
              )}
            </div>

            {/* Grouped Items */}
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([mealName, items]) => (
                <div key={mealName} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-teal-100">
                  <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] p-4 text-white flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base">
                        {mealName === 'Other' || mealName === 'General Pantry' ? '🍲 ' + mealName : mealName}
                      </h3>
                      {items[0]?.mealType && (
                        <p className="text-white/90 text-xs capitalize">{mealTypeLabel(items[0].mealType)}</p>
                      )}
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">
                      {items.length} items
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 sm:p-4 flex items-center gap-3 hover:bg-gray-50/80 transition-colors"
                      >
                        <button
                          onClick={() => toggleItemChecked(item.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                            item.checked
                              ? 'bg-[#1f7a8c] border-[#1f7a8c]'
                              : 'border-gray-300 hover:border-[#1f7a8c]'
                          }`}
                        >
                          {item.checked && <Check className="h-4 w-4 text-white" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-xs font-semibold block ${
                              item.checked ? 'line-through text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            {item.ingredient}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          aria-label="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PARTNER STORES MODAL */}
      <Dialog open={showPartnersModal} onOpenChange={setShowPartnersModal}>
        <DialogContent className="max-w-md p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-50 rounded-2xl text-[#1f7a8c]">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-zinc-900">
                  Order Groceries Online 🚚
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Delivery partners in {selectedLocation.displayName} with affiliate links.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-teal-400 transition-all shadow-xs flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{partner.flag}</span>
                    <h4 className="text-xs font-extrabold text-zinc-900">{partner.name}</h4>
                    <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
                      {partner.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-1">{partner.tagline}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 text-xs">
                  <span className="text-[10px] text-zinc-500">⚡ {partner.deliverySpeed}</span>
                  <a
                    href={partner.baseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#1f7a8c] hover:bg-[#165c6a] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Shop Now</span>
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
        <DialogContent className="max-w-md p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-zinc-900">
                  Diaspora Metabolic Swaps 🧠
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Substitutes with identical low-glycemic bioactives.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            {DIASPORA_SWAPS.map((swap, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 line-through text-[11px]">{swap.original}</span>
                  <span className="text-[9px] bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full font-bold">
                    {swap.marketAisle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-900 font-extrabold text-xs">
                  <Leaf size={13} className="text-emerald-500 flex-shrink-0" />
                  <span>Swap to: {swap.diasporaSwap}</span>
                </div>
                <p className="text-[10px] text-teal-800 leading-tight">{swap.glycemicBenefit}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
