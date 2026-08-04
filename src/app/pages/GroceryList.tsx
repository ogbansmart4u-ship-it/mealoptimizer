import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingCart, Trash2, Check } from 'lucide-react';
import { projectId } from '/utils/supabase/info';
import { getAccessToken } from '../../lib/supabase';
import PageHeader from '../components/PageHeader';
import Breadcrumbs from '../components/Breadcrumbs';

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
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const groupedItems = groceryItems.reduce((acc, item) => {
    const key = item.mealName || 'Other';
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
        title="Grocery List"
        showHome
        className="bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f]"
      />

      {/* Breadcrumbs */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] px-6 pb-3">
        <Breadcrumbs
          items={[
            { label: "Meal Planning", path: "/plan-meal" },
            { label: "Grocery List" }
          ]}
          className="text-white/80"
        />
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] px-6 pb-4 flex justify-center gap-4 text-sm text-white">
        <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
          <span className="font-semibold">{uncheckedCount}</span> to buy
        </div>
        <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
          <span className="font-semibold">{checkedCount}</span> checked
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white text-center">Loading grocery list...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-6 text-white text-center">
            <p className="mb-4">{error}</p>
            <button
              onClick={loadGroceryList}
              className="px-6 py-2 bg-white text-[#1f7a8c] rounded-lg hover:bg-gray-100 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : groceryItems.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Your grocery list is empty</h2>
            <p className="text-white/80 mb-4">
              Generate a meal plan to automatically add ingredients to your grocery list!
            </p>
            <button
              onClick={() => navigate('/plan-meal')}
              className="px-6 py-3 bg-white text-[#1f7a8c] rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Plan a Meal
            </button>
          </div>
        ) : (
          <>
            {/* Clear Checked Button */}
            {checkedCount > 0 && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={clearCheckedItems}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Checked ({checkedCount})
                </button>
              </div>
            )}

            {/* Grouped Items */}
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([mealName, items]) => (
                <div key={mealName} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] p-4">
                    <h3 className="text-white font-semibold text-lg">{mealName}</h3>
                    {items[0]?.mealType && (
                      <p className="text-white/80 text-sm capitalize">{items[0].mealType}</p>
                    )}
                  </div>
                  <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <button
                          onClick={() => toggleItemChecked(item.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            item.checked
                              ? 'bg-[#1f7a8c] border-[#1f7a8c]'
                              : 'border-gray-300 hover:border-[#1f7a8c]'
                          }`}
                        >
                          {item.checked && <Check className="h-4 w-4 text-white" />}
                        </button>
                        <span
                          className={`flex-1 ${
                            item.checked ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          {item.ingredient}
                        </span>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
}
