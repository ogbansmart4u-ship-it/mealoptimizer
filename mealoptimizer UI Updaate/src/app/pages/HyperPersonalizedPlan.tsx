import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ChefHat, Activity, Brain, Zap, Moon, Utensils, Clock, FlaskConical, Leaf, Download, RefreshCw } from 'lucide-react';
import { generateDailyMealPlan, FunctionalMeal, DailyMealPlan } from '../utils/mealPlanGenerator';
import { Button } from '../components/ui/button';

export default function HyperPersonalizedPlan() {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<FunctionalMeal | null>(null);

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = () => {
    setLoading(true);

    // Get user profile from localStorage
    const userProfile = {
      age: parseInt(localStorage.getItem('userAge') || '30'),
      sex: (localStorage.getItem('userSex') || 'male') as 'male' | 'female' | 'other',
      weight: parseInt(localStorage.getItem('userWeight') || '70'),
      height: parseInt(localStorage.getItem('userHeight') || '170'),
      medicalConditions: JSON.parse(localStorage.getItem('medicalConditions') || '[]'),
      allergies: JSON.parse(localStorage.getItem('allergies') || '[]'),
      activityLevel: (localStorage.getItem('activityLevel') || 'moderate') as any,
      location: localStorage.getItem('userLocation') || 'United States',
      dietaryPreference: (localStorage.getItem('dietaryPreference') || 'omnivore') as any,
      goals: JSON.parse(localStorage.getItem('userGoals') || '["general health"]'),
      sleepQuality: (localStorage.getItem('sleepQuality') || 'fair') as any,
      stressLevel: (localStorage.getItem('stressLevel') || 'moderate') as any,
    };

    const plan = generateDailyMealPlan(userProfile);
    setMealPlan(plan);
    setLoading(false);
  };

  const getMealIcon = (meal: FunctionalMeal) => {
    if (meal.functionalType === 'pre-activation') return Activity;
    if (meal.functionalType === 'elevenses') return Brain;
    if (meal.functionalType === 'recovery-vector') return Zap;
    if (meal.functionalType === 'merienda') return Utensils;
    if (meal.functionalType === 'nocturnal-buffer') return Moon;
    return ChefHat;
  };

  const getMealColor = (meal: FunctionalMeal) => {
    if (meal.functionalType === 'pre-activation') return { bg: 'from-orange-500 to-red-500', light: 'bg-orange-50', border: 'border-orange-200' };
    if (meal.functionalType === 'elevenses') return { bg: 'from-purple-500 to-indigo-500', light: 'bg-purple-50', border: 'border-purple-200' };
    if (meal.functionalType === 'recovery-vector') return { bg: 'from-green-500 to-teal-500', light: 'bg-green-50', border: 'border-green-200' };
    if (meal.functionalType === 'merienda') return { bg: 'from-yellow-500 to-orange-500', light: 'bg-yellow-50', border: 'border-yellow-200' };
    if (meal.functionalType === 'nocturnal-buffer') return { bg: 'from-indigo-600 to-purple-600', light: 'bg-indigo-50', border: 'border-indigo-200' };
    return { bg: 'from-[#1f7a8c] to-[#4ecdc4]', light: 'bg-cyan-50', border: 'border-cyan-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B8E5E5] to-[#E8F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1f7a8c] mx-auto mb-4"></div>
          <p className="text-gray-700">Generating your hyper-personalized meal plan...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing metabolic pathways & cultural preferences</p>
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#B8E5E5] to-[#E8F5F5] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Failed to generate meal plan</p>
          <Button onClick={generatePlan} className="bg-[#1f7a8c]">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B8E5E5] via-[#E8F5F5] to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={generatePlan}
              className="p-2 hover:bg-white/20 rounded-full transition"
              title="Regenerate plan"
            >
              <RefreshCw className="h-5 w-5 text-white" />
            </button>
            <button
              className="p-2 hover:bg-white/20 rounded-full transition"
              title="Download plan"
            >
              <Download className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Hyper-Personalized Meal Plan</h1>
        <p className="text-white/90 text-sm">Clinical Nutrition Engineering × Culinary Arts</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Metabolic Strategy Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-[#1f7a8c]">
          <div className="flex items-start gap-3 mb-4">
            <FlaskConical className="h-6 w-6 text-[#1f7a8c] flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="font-bold text-gray-800 mb-1">Metabolic Strategy</h2>
              <p className="text-sm text-gray-600">{mealPlan.metabolicStrategy}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Leaf className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="font-bold text-gray-800 mb-1">Cultural Alignment</h2>
              <p className="text-sm text-gray-600">{mealPlan.culturalAlignment}</p>
            </div>
          </div>
        </div>

        {/* Daily Macros Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-lg p-6 border-2 border-purple-100">
          <h2 className="font-bold text-gray-800 mb-4">Daily Macronutrient Distribution</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-orange-500 text-white rounded-2xl py-3 mb-2">
                <p className="text-2xl font-bold">{Math.round(mealPlan.totalMacros.carbs)}g</p>
              </div>
              <p className="text-xs text-gray-600">Carbohydrates</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-2xl py-3 mb-2">
                <p className="text-2xl font-bold">{Math.round(mealPlan.totalMacros.protein)}g</p>
              </div>
              <p className="text-xs text-gray-600">Protein</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-2xl py-3 mb-2">
                <p className="text-2xl font-bold">{Math.round(mealPlan.totalMacros.fats)}g</p>
              </div>
              <p className="text-xs text-gray-600">Fats</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-200 text-center">
            <p className="text-sm text-gray-600">Total Daily Calories</p>
            <p className="text-3xl font-bold text-purple-600">{Math.round(mealPlan.totalCalories)} kcal</p>
          </div>
        </div>

        {/* Meal Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="h-6 w-6 text-[#1f7a8c]" />
            Today's Functional Meal Timeline
          </h2>

          {mealPlan.meals.map((meal, index) => {
            const Icon = getMealIcon(meal);
            const colors = getMealColor(meal);

            return (
              <div
                key={meal.id}
                className={`bg-white rounded-3xl shadow-lg overflow-hidden border-2 ${colors.border} hover:shadow-xl transition-all cursor-pointer`}
                onClick={() => setSelectedMeal(meal)}
              >
                {/* Meal Header */}
                <div className={`bg-gradient-to-r ${colors.bg} p-5 text-white`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 rounded-full p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs opacity-90">{meal.time}</p>
                      <h3 className="font-bold text-lg">{meal.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{meal.calories}</p>
                      <p className="text-xs opacity-90">kcal</p>
                    </div>
                  </div>
                  {meal.culturalContext && (
                    <p className="text-xs text-white/80 italic">{meal.culturalContext}</p>
                  )}
                </div>

                {/* Culinary Description */}
                <div className="p-5">
                  <p className="text-gray-700 leading-relaxed mb-4 italic">
                    "{meal.culinaryDescription}"
                  </p>

                  {/* Macro Ratio Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                      <span>Macro Ratio</span>
                      <span>C:{meal.macroRatio.carbs} · P:{meal.macroRatio.protein} · F:{meal.macroRatio.fats}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-orange-500"
                        style={{ width: `${meal.macroRatio.carbs}%` }}
                        title={`Carbs: ${meal.macroRatio.carbs}%`}
                      />
                      <div
                        className="bg-blue-500"
                        style={{ width: `${meal.macroRatio.protein}%` }}
                        title={`Protein: ${meal.macroRatio.protein}%`}
                      />
                      <div
                        className="bg-green-500"
                        style={{ width: `${meal.macroRatio.fats}%` }}
                        title={`Fats: ${meal.macroRatio.fats}%`}
                      />
                    </div>
                  </div>

                  {/* Clinical Note */}
                  <div className={`${colors.light} rounded-2xl p-4 border ${colors.border}`}>
                    <div className="flex items-start gap-2">
                      <FlaskConical className="h-4 w-4 text-gray-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">Clinical Engineering Note</h4>
                        <p className="text-xs text-gray-700 leading-relaxed">{meal.clinicalNote}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bioactive Compounds */}
                  {meal.bioactiveCompounds && meal.bioactiveCompounds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {meal.bioactiveCompounds.map((compound, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gradient-to-r from-green-100 to-teal-100 text-green-800 rounded-full text-xs font-medium border border-green-200"
                        >
                          {compound}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Protein Complementarity for Vegans */}
                  {meal.proteinComplementarity && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs text-green-800">
                        <strong>Vegan Protein Strategy:</strong> {meal.proteinComplementarity}
                      </p>
                    </div>
                  )}

                  {/* Tap to expand indicator */}
                  <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">Tap to view preparation protocol →</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Functional Meals Legend */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-lg p-6 border-2 border-gray-200">
          <h2 className="font-bold text-gray-800 mb-4">Functional Micro-Meal Categories</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Activity className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Pre-Activation</p>
                <p className="text-xs text-gray-600">High-glycemic fuel for workout/shift prep</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">The Elevenses (Cognitive Bridge)</p>
                <p className="text-xs text-gray-600">Neuro-protective fats & polyphenols for focus</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Recovery Vector</p>
                <p className="text-xs text-gray-600">Leucine-rich protein for muscle repair</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Utensils className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">The Merienda (Satiety Bridge)</p>
                <p className="text-xs text-gray-600">Prevents dinner overeating</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Moon className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Nocturnal Buffer</p>
                <p className="text-xs text-gray-600">Magnesium/tryptophan for sleep quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">{selectedMeal.name}</h2>
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Ingredients */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-[#1f7a8c]" />
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#1f7a8c] mt-1">•</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preparation Protocol */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-purple-600" />
                  Engineering Preparation Protocol
                </h3>
                <div className="space-y-3">
                  {selectedMeal.preparationProtocol.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed flex-1 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button
                  variant="outline"
                  className="w-full border-2 border-[#1f7a8c] text-[#1f7a8c] hover:bg-[#E8F5F5]"
                  onClick={() => {
                    // Add to grocery list logic
                    setSelectedMeal(null);
                  }}
                >
                  Add to Grocery List
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white"
                  onClick={() => {
                    // Log meal logic
                    setSelectedMeal(null);
                  }}
                >
                  Log This Meal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
