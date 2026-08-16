import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useUser } from "../contexts/UserContext";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getAccessToken } from '../../lib/supabase';
import { generateSingleMeal } from "../../lib/api";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import Breadcrumbs from "../components/Breadcrumbs";
import MascotLoader from "../components/MascotLoader";
import {
  Calendar,
  Clock,
  Flame,
  Activity,
  Droplet,
  Wheat,
  Heart,
  ChevronLeft,
  Target,
  Stethoscope,
  ChefHat,
  AlertCircle,
  CheckCircle2,
  Info,
  Copy,
  Trash2,
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
  circadianAnchor: string;
  biochemicalRatio: string;
  clinicalIndication: string;
  engineeringMethod: string;
  postPrandialNote: string;
  estimatedCostNaira?: number;
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
      return { Icon: Clock, color: "text-orange-600", bgColor: "bg-orange-50" };
    case "brunch":
      return { Icon: Activity, color: "text-yellow-600", bgColor: "bg-yellow-50" };
    case "lunch":
      return { Icon: ChefHat, color: "text-green-600", bgColor: "bg-green-50" };
    case "dinner":
      return { Icon: Calendar, color: "text-purple-600", bgColor: "bg-purple-50" };
    default:
      return { Icon: ChefHat, color: "text-teal-600", bgColor: "bg-teal-50" };
  }
};

export default function MealPlanView() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("id");
  
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  // Generate a fresh variety of the SAME meal type (different dish, similar calories).
  const handleGenerateAnother = async () => {
    if (!mealPlan || regenerating) return;
    setRegenerating(true);
    try {
      const res = await generateSingleMeal(mealPlan.mealType, mealPlan.currentGoal, (mealPlan as any).budget);
      navigate(`/meal-plan?id=${res.planId}`);
    } catch {
      toast.error("Couldn't generate another. Please try again.");
      navigate("/plan-meal");
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    if (planId) {
      loadMealPlan(planId);
    } else {
      setError("No meal plan ID provided");
      setIsLoading(false);
    }
  }, [planId]);

  const loadMealPlan = async (id: string) => {
    try {
      setIsLoading(true);

      // Load from API
      const token = await getAccessToken();

      if (!token) {
        toast.error("Please log in to view meal plans");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/ai/meal-plan/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load meal plan");
      }

      const data = await response.json();
      setMealPlan(data.mealPlan);
    } catch (err: any) {
      console.error("Error loading meal plan:", err);
      setError(err.message || "Failed to load meal plan");
      toast.error("Failed to load meal plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMealPlan = () => {
    if (!mealPlan) return;

    const text = `
${mealPlan.plan_json.meal_name}
${mealPlan.mealType.toUpperCase()} - ${new Date(mealPlan.createdAt).toLocaleDateString()}

INGREDIENTS:
${mealPlan.plan_json.ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

NUTRITION:
- Calories: ${mealPlan.plan_json.calories} kcal
- Protein: ${mealPlan.plan_json.protein}g
- Carbs: ${mealPlan.plan_json.carbs}g
- Fats: ${mealPlan.plan_json.fats}g
- Fiber: ${mealPlan.plan_json.fiber}g

PREPARATION: ${mealPlan.plan_json.engineeringMethod}

TIMING: ${mealPlan.plan_json.circadianAnchor}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success("Meal plan copied to clipboard!");
  };

  const handleDeletePlan = async () => {
    if (!mealPlan || !confirm("Are you sure you want to delete this meal plan?")) return;

    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/ai/meal-plan/${mealPlan.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete meal plan");
      }

      toast.success("Meal plan deleted");
      navigate("/");
    } catch (err: any) {
      console.error("Error deleting meal plan:", err);
      toast.error("Failed to delete meal plan");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex items-center justify-center">
        <MascotLoader label="Loading meal plan..." size={96} />
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5]">
        <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl text-white flex-1">Meal Plan</h1>
          </div>
        </div>
        
        <div className="px-6 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-800 mb-4">{error || "Meal plan not found"}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-[#1f7a8c] text-white px-6 py-3 rounded-xl hover:bg-[#165f6d] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { Icon: MealIcon, color: mealColor, bgColor: mealBgColor } = getMealIcon(mealPlan.mealType);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <PageHeader
        title="Your Meal Plan"
        showHome
        actions={
          <>
            <button
              onClick={handleCopyMealPlan}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeletePlan}
              className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              title="Delete plan"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        }
      />

      {/* Meal Type Badge */}
      <div className="bg-[#1f7a8c] px-6 pb-6 flex items-center gap-2">
        <div className={`${mealBgColor} rounded-xl p-2`}>
          <MealIcon className={`h-5 w-5 ${mealColor}`} />
        </div>
        <div>
          <p className="text-white/80 text-sm">
            {new Date(mealPlan.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="text-white text-lg capitalize">{mealPlan.mealType}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6 space-y-6">
        {/* Meal Name */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#1f7a8c] rounded-full p-3">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl text-gray-800">{mealPlan.plan_json.meal_name}</h2>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Target className="h-4 w-4 text-[#1f7a8c]" />
            <p className="text-sm text-gray-600">Goal: {mealPlan.currentGoal}</p>
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg text-[#1f7a8c] mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Nutrition Facts
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-600" />
                <p className="text-xs text-gray-600">Calories</p>
              </div>
              <p className="text-2xl text-gray-800">{mealPlan.plan_json.calories}</p>
              <p className="text-xs text-gray-500">kcal</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="h-5 w-5 text-blue-600" />
                <p className="text-xs text-gray-600">Protein</p>
              </div>
              <p className="text-2xl text-gray-800">{mealPlan.plan_json.protein}</p>
              <p className="text-xs text-gray-500">grams</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wheat className="h-5 w-5 text-yellow-600" />
                <p className="text-xs text-gray-600">Carbs</p>
              </div>
              <p className="text-2xl text-gray-800">{mealPlan.plan_json.carbs}</p>
              <p className="text-xs text-gray-500">grams</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-green-600" />
                <p className="text-xs text-gray-600">Fats</p>
              </div>
              <p className="text-2xl text-gray-800">{mealPlan.plan_json.fats}</p>
              <p className="text-xs text-gray-500">grams</p>
            </div>
          </div>

          {mealPlan.plan_json.estimatedCostNaira ? (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-700">Est. ingredient cost per serving</p>
              <p className="text-xl font-semibold text-[#1f7a8c]">₦{mealPlan.plan_json.estimatedCostNaira.toLocaleString()}</p>
            </div>
          ) : null}

          <div className="bg-teal-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-[#1f7a8c]" />
              <p className="text-xs text-gray-600">Fiber</p>
            </div>
            <p className="text-xl text-gray-800">{mealPlan.plan_json.fiber}g</p>
          </div>

          <div className="mt-4 p-4 bg-purple-50 rounded-2xl">
            <p className="text-xs text-gray-600 mb-1">Biochemical Ratio</p>
            <p className="text-sm text-gray-800">{mealPlan.plan_json.biochemicalRatio}</p>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg text-[#1f7a8c] mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Ingredients
          </h3>
          <div className="space-y-3">
            {mealPlan.plan_json.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="bg-[#1f7a8c] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 flex-1">{ingredient}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Information */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-lg text-[#1f7a8c] mb-4 flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Clinical Information
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-gray-600">Optimal Timing</p>
              </div>
              <p className="text-sm text-gray-800">{mealPlan.plan_json.circadianAnchor}</p>
            </div>

            <div className="bg-green-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="h-4 w-4 text-green-600" />
                <p className="text-xs text-gray-600">Clinical Indication</p>
              </div>
              <p className="text-sm text-gray-800">{mealPlan.plan_json.clinicalIndication}</p>
            </div>

            <div className="bg-orange-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="h-4 w-4 text-orange-600" />
                <p className="text-xs text-gray-600">Preparation Method</p>
              </div>
              <p className="text-sm text-gray-800">{mealPlan.plan_json.engineeringMethod}</p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-gray-600">Post-Meal Monitoring</p>
              </div>
              <p className="text-sm text-gray-800">{mealPlan.plan_json.postPrandialNote}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGenerateAnother}
            disabled={regenerating}
            className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {regenerating ? "Finding another…" : `🍽️ Generate another ${mealPlan.mealType}`}
          </button>

          <button
            onClick={() => navigate("/plan-meal")}
            className="w-full bg-white text-[#1f7a8c] border-2 border-[#1f7a8c] py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
          >
            Plan a Different Meal
          </button>
          
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-white text-[#1f7a8c] border-2 border-[#1f7a8c] py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
