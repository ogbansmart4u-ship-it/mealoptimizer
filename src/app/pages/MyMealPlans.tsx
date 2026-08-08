import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { projectId } from '/utils/supabase/info';
import { getAccessToken } from '../../lib/supabase';
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import MascotEmptyState from "../components/MascotEmptyState";
import {
  Calendar,
  Clock,
  Coffee,
  Sun,
  Utensils,
  Moon,
  ChefHat,
  Flame,
  Activity,
  Plus,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45`;

interface MealPlanData {
  meal_name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

interface MealPlan {
  id: string;
  userId: string;
  mealType: string;
  currentGoal: string;
  plan_json: MealPlanData;
  createdAt: string;
}

const getMealIcon = (mealType: string) => {
  switch (mealType.toLowerCase()) {
    case "breakfast":
      return { Icon: Coffee, color: "text-orange-600", bgColor: "bg-orange-50" };
    case "brunch":
      return { Icon: Sun, color: "text-yellow-600", bgColor: "bg-yellow-50" };
    case "lunch":
      return { Icon: Utensils, color: "text-green-600", bgColor: "bg-green-50" };
    case "dinner":
      return { Icon: Moon, color: "text-purple-600", bgColor: "bg-purple-50" };
    default:
      return { Icon: ChefHat, color: "text-teal-600", bgColor: "bg-teal-50" };
  }
};

export default function MyMealPlans() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      
      if (!token) {
        toast.error("Please log in to view meal plans");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/ai/meal-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load meal plans");
      }

      const data = await response.json();
      // Sort by creation date, newest first
      const sortedPlans = (data.mealPlans || []).sort((a: MealPlan, b: MealPlan) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMealPlans(sortedPlans);
    } catch (err: any) {
      console.error("Error loading meal plans:", err);
      toast.error("Failed to load meal plans");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this meal plan?")) return;

    try {
      setDeletingPlanId(planId);
      const token = await getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/ai/meal-plan/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete meal plan");
      }

      toast.success("Meal plan deleted");
      // Remove from local state
      setMealPlans(prev => prev.filter(plan => plan.id !== planId));
    } catch (err: any) {
      console.error("Error deleting meal plan:", err);
      toast.error("Failed to delete meal plan");
    } finally {
      setDeletingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1f7a8c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1f7a8c] text-lg">Loading your meal plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <PageHeader
        title="My Meal Plans"
        showHome
        actions={
          <button
            onClick={() => navigate("/plan-meal")}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
            title="Create new meal plan"
          >
            <Plus className="h-6 w-6" />
          </button>
        }
      />

      <div className="bg-[#1f7a8c] px-6 pb-4">
        <p className="text-white/90 text-sm">
          {mealPlans.length} {mealPlans.length === 1 ? 'plan' : 'plans'} saved
        </p>
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {mealPlans.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <MascotEmptyState
              title="No Meal Plans Yet"
              subtitle="Start planning your personalized meals based on your health profile"
              action={
                <button
                  onClick={() => navigate("/plan-meal")}
                  className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>Plan My First Meal</span>
                  </div>
                </button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {mealPlans.map((plan) => {
              const { Icon: MealIcon, color: mealColor, bgColor: mealBgColor } = getMealIcon(plan.mealType);
              const isDeleting = deletingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`${mealBgColor} rounded-2xl p-3`}>
                        <MealIcon className={`h-6 w-6 ${mealColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg text-gray-800 mb-1 truncate">
                          {plan.plan_json.meal_name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{plan.mealType}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(plan.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/meal-plan?id=${plan.id}`)}
                          className="text-[#1f7a8c] hover:bg-[#B8E5E5] rounded-full p-2 transition-colors"
                          title="View details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:bg-red-50 rounded-full p-2 transition-colors disabled:opacity-50"
                          title="Delete plan"
                        >
                          {isDeleting ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-orange-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Flame className="h-3 w-3 text-orange-600" />
                          <p className="text-xs text-gray-600">Calories</p>
                        </div>
                        <p className="text-sm text-gray-800">{plan.plan_json.calories}</p>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Activity className="h-3 w-3 text-blue-600" />
                          <p className="text-xs text-gray-600">Protein</p>
                        </div>
                        <p className="text-sm text-gray-800">{plan.plan_json.protein}g</p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Activity className="h-3 w-3 text-green-600" />
                          <p className="text-xs text-gray-600">Carbs</p>
                        </div>
                        <p className="text-sm text-gray-800">{plan.plan_json.carbs}g</p>
                      </div>
                    </div>

                    {/* Goal Badge */}
                    <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-[#B8E5E5] rounded-full">
                      <Activity className="h-3 w-3 text-[#1f7a8c]" />
                      <p className="text-xs text-[#1f7a8c]">{plan.currentGoal}</p>
                    </div>
                  </div>

                  {/* Quick View Button */}
                  <button
                    onClick={() => navigate(`/meal-plan?id=${plan.id}`)}
                    className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white py-3 hover:opacity-90 transition-opacity"
                  >
                    View Full Details
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Create New Button (shown when there are plans) */}
        {mealPlans.length > 0 && (
          <button
            onClick={() => navigate("/plan-meal")}
            className="w-full mt-6 bg-white border-2 border-[#1f7a8c] text-[#1f7a8c] py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              <span className="text-lg">Plan Another Meal</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
