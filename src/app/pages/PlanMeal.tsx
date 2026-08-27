import { useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { generateSingleMeal, updateUserProfile } from "../../lib/api";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import TutorialTooltip from "../components/TutorialTooltip";
import MealOptimizingLoader from "../components/MealOptimizingLoader";
import AmbientBackground from "../components/AmbientBackground";
import AfricanSwapEngine from "../components/AfricanSwapEngine";
import {
  Coffee,
  Sun,
  Utensils,
  Moon,
  Calendar,
  CheckCircle2,
  User,
  MapPin,
  Stethoscope,
  Pill,
  Target,
  AlertCircle,
  Weight,
  Heart,
} from "lucide-react";

type MealType = "breakfast" | "brunch" | "lunch" | "dinner";

interface MealOption {
  id: MealType;
  name: string;
  icon: typeof Coffee;
  time: string;
  description: string;
  color: string;
  bgColor: string;
}

export default function PlanMeal() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const { t } = useLanguage();
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // Kept in English — this value is also sent to the AI backend as the goal.
  const [currentGoal, setCurrentGoal] = useState("General Health & Nutrition");
  const [budget, setBudget] = useState("");

  const mealOptions: MealOption[] = [
    {
      id: "breakfast",
      name: t("planmeal.meal.breakfast"),
      icon: Coffee,
      time: "6:00 AM - 10:00 AM",
      description: t("planmeal.mealDesc.breakfast"),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "brunch",
      name: t("planmeal.meal.brunch"),
      icon: Sun,
      time: "10:00 AM - 12:00 PM",
      description: t("planmeal.mealDesc.brunch"),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      id: "lunch",
      name: t("planmeal.meal.lunch"),
      icon: Utensils,
      time: "12:00 PM - 3:00 PM",
      description: t("planmeal.mealDesc.lunch"),
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "dinner",
      name: t("planmeal.meal.dinner"),
      icon: Moon,
      time: "6:00 PM - 9:00 PM",
      description: t("planmeal.mealDesc.dinner"),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const handleMealSelect = (mealType: MealType) => {
    setSelectedMeal(mealType);
  };

  const generateMockMealPlan = (mealType: MealType) => {
    const mockMeals = {
      breakfast: {
        meal_name: "Nigerian Yam Porridge with Fish",
        ingredients: [
          "500g white yam, peeled and cubed",
          "2 medium fresh fish (tilapia or mackerel)",
          "2 cups fresh spinach (ugu)",
          "1 large onion, chopped",
          "2 fresh tomatoes, diced",
          "1 scotch bonnet pepper",
          "2 tablespoons palm oil",
          "1 cup vegetable stock",
          "Salt and seasoning to taste"
        ],
        calories: 420,
        protein: 28,
        carbs: 52,
        fats: 12,
        fiber: 6,
        circadianAnchor: "7:00-9:00 AM (Morning metabolic window)",
        biochemicalRatio: "P:C:F = 27:50:23",
        clinicalIndication: `Good for ${profile?.medicalCondition || 'general health'} - provides sustained energy with low glycemic load`,
        engineeringMethod: "Boil yam until tender, add fish and vegetables in the last 10 minutes. Add palm oil after cooking to preserve nutrients.",
        postPrandialNote: "Monitor energy levels 2 hours after meal. Should provide steady energy without spikes."
      },
      brunch: {
        meal_name: "Plantain and Egg Scramble with Avocado",
        ingredients: [
          "1 ripe plantain, diced",
          "3 large eggs",
          "1/2 avocado, sliced",
          "1 medium onion, chopped",
          "1 bell pepper, diced",
          "2 tablespoons olive oil",
          "Fresh tomatoes",
          "Handful of fresh spinach",
          "Salt and black pepper to taste"
        ],
        calories: 485,
        protein: 22,
        carbs: 45,
        fats: 24,
        fiber: 8,
        circadianAnchor: "10:00 AM-12:00 PM (Pre-lunch energy boost)",
        biochemicalRatio: "P:C:F = 18:37:45",
        clinicalIndication: `Balanced meal supporting ${profile?.medicalCondition || 'wellness goals'}`,
        engineeringMethod: "Sauté plantain until golden, scramble eggs with vegetables, top with avocado",
        postPrandialNote: "High healthy fat content provides satiety until next meal"
      },
      lunch: {
        meal_name: "Grilled Chicken with Jollof Cauliflower Rice",
        ingredients: [
          "200g chicken breast, grilled",
          "2 cups cauliflower rice",
          "1 cup mixed vegetables (carrots, green beans)",
          "2 tablespoons tomato paste",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 teaspoon curry powder",
          "1 teaspoon thyme",
          "2 tablespoons coconut oil",
          "1 scotch bonnet pepper (optional)"
        ],
        calories: 380,
        protein: 42,
        carbs: 28,
        fats: 12,
        fiber: 7,
        circadianAnchor: "12:00-2:00 PM (Peak metabolic activity)",
        biochemicalRatio: "P:C:F = 44:29:27",
        clinicalIndication: `High protein, low glycemic - excellent for ${profile?.medicalCondition || 'weight management'}`,
        engineeringMethod: "Grill chicken at 375°F. Pulse cauliflower in food processor, cook jollof-style with tomato base.",
        postPrandialNote: "Cauliflower rice keeps blood sugar stable while providing traditional flavors"
      },
      dinner: {
        meal_name: "Okro Soup with Chicken and Wheat Swallow",
        ingredients: [
          "200g fresh okro, chopped",
          "150g chicken, cooked and shredded",
          "100g wheat flour (for swallow)",
          "1 cup stockfish",
          "2 tablespoons ground crayfish",
          "2 cups spinach",
          "1 onion, chopped",
          "2 tablespoons palm oil",
          "Seasoning cubes",
          "Salt to taste"
        ],
        calories: 425,
        protein: 35,
        carbs: 48,
        fats: 12,
        fiber: 9,
        circadianAnchor: "6:00-8:00 PM (Evening wind-down)",
        biochemicalRatio: "P:C:F = 33:45:22",
        clinicalIndication: `High fiber content aids digestion and supports ${profile?.medicalCondition || 'metabolic health'}`,
        engineeringMethod: "Cook okro briefly to retain nutrients. Mix wheat flour with hot water for swallow consistency.",
        postPrandialNote: "Light evening meal promotes better sleep. Avoid eating after 8 PM."
      }
    };

    return mockMeals[mealType];
  };

  const handleGenerateMeal = async () => {
    if (!selectedMeal) return;
    if (!profile) {
      toast.error(t("planmeal.toast.completeProfile"));
      navigate("/profile");
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating meal:', { mealType: selectedMeal, currentGoal });

      // Ensure profile exists in the backend before generating
      try {
        await updateUserProfile({
          name: profile.name,
          age: profile.age,
          bmi: profile.bmi,
          medicalCondition: profile.medicalCondition,
          location: profile.location,
          // Send the full profile so the AI prompt can truly personalize per user.
          weight: profile.weight,
          medications: profile.medications,
          allergies: profile.allergies,
          gender: profile.gender,
          profilePicture: profile.profilePicture,
        });
      } catch (profileSyncError) {
        console.warn('Profile sync failed, proceeding anyway:', profileSyncError);
      }

      const response = await generateSingleMeal(selectedMeal, currentGoal, budget);
      const mealName = mealOptions.find((m) => m.id === selectedMeal)?.name ?? selectedMeal;
      toast.success(`✅ ${t("planmeal.toast.generated").replace("{meal}", mealName)}`);
      navigate(`/meal-plan?id=${response.planId}`);
    } catch (error: any) {
      console.error('❌ Failed to generate meal:', error);
      toast.error(t("planmeal.toast.failed"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 relative">
      {/* High-Visibility Ambient Background Animation */}
      <AmbientBackground />

      {/* Header */}
      <div className="relative z-10">
        <PageHeader
          title={t("planmeal.title")}
          showHome
          actions={<Calendar className="h-6 w-6 text-white" />}
        />
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Health Profile Summary */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#1f7a8c] rounded-full p-3">
              <User className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg text-[#1f7a8c]">{t("planmeal.healthProfile")}</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
              <MapPin className="h-4 w-4 text-[#1f7a8c] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t("planmeal.location")}</p>
                <p className="text-sm text-gray-800">{profile?.location || t("planmeal.notSet")}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-xs text-gray-600">{t("planmeal.ageWeight")}</p>
                  <p className="text-sm text-gray-800">
                    {profile?.age || t("planmeal.na")} {t("profile.years")}, {profile?.weight || t("planmeal.notSet")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-xs text-gray-600">{t("profile.bmi")}</p>
                  <p className="text-sm text-gray-800">{profile?.bmi || t("planmeal.notSet")}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
              <Stethoscope className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t("profile.medicalCondition")}</p>
                <p className="text-sm text-gray-800">
                  {profile?.medicalCondition || t("planmeal.noneSpecified")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
              <Pill className="h-4 w-4 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t("planmeal.medications")}</p>
                <p className="text-sm text-gray-800">{profile?.medications || t("profile.none")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-xl">
              <Target className="h-4 w-4 text-[#1f7a8c] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">{t("planmeal.currentGoal")}</p>
                <p className="text-sm text-gray-800">{currentGoal === "General Health & Nutrition" ? t("planmeal.defaultGoal") : currentGoal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="text-lg text-white mb-2">{t("planmeal.selectMealType")}</h3>
          <p className="text-sm text-white/90">
            {t("planmeal.selectMealTypeDesc")}
          </p>
        </div>

        {/* Meal Type Selection */}
        <div className="space-y-4 mb-6">
          {mealOptions.map((meal) => {
            const Icon = meal.icon;
            const isSelected = selectedMeal === meal.id;

            return (
              <button
                key={meal.id}
                onClick={() => handleMealSelect(meal.id)}
                className={`w-full bg-white rounded-3xl shadow-lg p-6 transition-all transform hover:scale-[1.02] ${
                  isSelected
                    ? "ring-4 ring-[#1f7a8c] ring-opacity-50 shadow-xl"
                    : "hover:shadow-xl"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`${meal.bgColor} rounded-2xl p-4 transition-transform ${
                      isSelected ? "scale-110" : ""
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${meal.color}`} />
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg text-gray-800">{meal.name}</h3>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-[#1f7a8c]" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{meal.time}</p>
                    <p className="text-sm text-gray-600">{meal.description}</p>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#1f7a8c] bg-[#1f7a8c]"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Budget (optional) */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <label htmlFor="budget" className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-[#1f7a8c]" />
            {t("planmeal.budgetLabel")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
            <input
              id="budget"
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={t("planmeal.budgetPlaceholder")}
              className="w-full h-12 pl-8 pr-4 rounded-xl border-2 border-gray-200 focus:border-[#1f7a8c] focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("planmeal.budgetHelper")}
          </p>
        </div>

        {/* Mascot loader while the plan is being generated */}
        {isGenerating && (
          <MealOptimizingLoader
            message={t("planmeal.optimizing")}
            subMessage={t("planmeal.optimizingSub")}
          />
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateMeal}
          disabled={!selectedMeal || isGenerating}
          className={`w-full rounded-2xl py-5 shadow-lg text-white text-lg transition-all transform ${
            !selectedMeal || isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:shadow-xl hover:scale-[1.02]"
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t("planmeal.generating")}</span>
            </div>
          ) : (
            <span>
              {selectedMeal
                ? t("planmeal.generatePlan").replace("{meal}", mealOptions.find((m) => m.id === selectedMeal)?.name ?? "")
                : t("planmeal.selectToContinue")}
            </span>
          )}
        </button>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800 text-center">
            {t("planmeal.infoNote")}
          </p>
        </div>

        {/* African Glycemic & Diaspora Swap Engine */}
        <div className="mt-8">
          <AfricanSwapEngine />
        </div>
      </div>

      {/* Meal Planning Tutorial */}
      <TutorialTooltip
        tutorialId="meal-planning"
        steps={[
          {
            id: "welcome",
            title: t("planmeal.tut.welcome.title"),
            description: t("planmeal.tut.welcome.desc"),
          },
          {
            id: "select-meal",
            title: t("planmeal.tut.select.title"),
            description: t("planmeal.tut.select.desc"),
          },
          {
            id: "personalized",
            title: t("planmeal.tut.personalized.title"),
            description: t("planmeal.tut.personalized.desc"),
          },
          {
            id: "generate",
            title: t("planmeal.tut.generate.title"),
            description: t("planmeal.tut.generate.desc"),
          },
        ]}
      />
    </div>
  );
}