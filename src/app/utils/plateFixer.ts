/**
 * plateFixer.ts - Interactive Plate Optimization Engine for West African Cuisine
 */

export interface PlateMacroInput {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  glycemicLoad?: "Low" | "Medium" | "High";
}

export interface OptimizationOption {
  id: string;
  title: string;
  description: string;
  carbDelta: number;
  calorieDelta: number;
  proteinDelta: number;
  fiberDelta: number;
  fatDelta: number;
  culturalNote: string;
}

export interface OptimizedResult {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  glycemicLoad: "Low" | "Medium" | "High";
  netCarbs: number;
  glycemicScore: number; // 0 to 100 (higher is better/lower spike)
  verdictText: string;
}

/**
 * Generates 3 intelligent, culturally-calibrated levers for any meal
 */
export function generatePlateFixes(meal: PlateMacroInput): OptimizationOption[] {
  const isHighCarb = meal.carbs > 45;
  const isHighFat = meal.fats > 20;
  const name = meal.foodName || "Meal";

  return [
    {
      id: "starch_moderation",
      title: "Moderate Starch Portion (−35%)",
      description: "Downsize the swallow or grain portion to reduce rapid glucose absorption while maintaining satiety.",
      carbDelta: isHighCarb ? -Math.round(meal.carbs * 0.35) : -15,
      calorieDelta: isHighCarb ? -Math.round(meal.carbs * 0.35 * 4) : -60,
      proteinDelta: 0,
      fiberDelta: -1,
      fatDelta: 0,
      culturalNote: "Reduces postprandial insulin spike without needing to give up swallow completely.",
    },
    {
      id: "fiber_shield",
      title: "Add Steamed Ugu / Ewedu Fiber Shield",
      description: "Incorporate 1 cup of nutrient-dense traditional greens before or with your meal.",
      carbDelta: 3,
      calorieDelta: 25,
      proteinDelta: 2,
      fiberDelta: 5,
      fatDelta: 0,
      culturalNote: "Soluble fiber forms a viscous mesh in the digestive tract, slowing carb uptake by up to 40%.",
    },
    {
      id: "lean_protein_swap",
      title: "Grilled Titus Fish or Chicken Swap",
      description: "Pair with lean or grilled omega-3 rich fish instead of heavy palm oil saturated meats.",
      carbDelta: 0,
      calorieDelta: isHighFat ? -80 : -40,
      proteinDelta: 8,
      fiberDelta: 0,
      fatDelta: isHighFat ? -10 : -5,
      culturalNote: "Protects cardiac health and adds bioavailable amino acids to blunt glucose response.",
    },
  ];
}

/**
 * Calculates dynamic macros and Glycemic Spike status based on toggled levers
 */
export function calculateOptimizedPlate(
  original: PlateMacroInput,
  activeOptions: Record<string, boolean>,
  optionsList: OptimizationOption[]
): OptimizedResult {
  let calories = Math.max(50, original.calories || 0);
  let protein = Math.max(0, original.protein || 0);
  let carbs = Math.max(0, original.carbs || 0);
  let fats = Math.max(0, original.fats || 0);
  let fiber = Math.max(1, original.fiber || 2);

  for (const opt of optionsList) {
    if (activeOptions[opt.id]) {
      calories = Math.max(50, calories + opt.calorieDelta);
      protein = Math.max(0, protein + opt.proteinDelta);
      carbs = Math.max(0, carbs + opt.carbDelta);
      fats = Math.max(0, fats + opt.fatDelta);
      fiber = Math.max(1, fiber + opt.fiberDelta);
    }
  }

  const netCarbs = Math.max(0, carbs - fiber);

  // Compute Glycemic Score (0 = extreme spike, 100 = perfect steady glucose)
  let baseScore = 100 - netCarbs * 1.1;
  baseScore += fiber * 4;
  baseScore += protein * 0.8;
  const glycemicScore = Math.min(100, Math.max(10, Math.round(baseScore)));

  let glycemicLoad: "Low" | "Medium" | "High" = "Low";
  let verdictText = "Steady & Condition-Friendly 🟢";

  if (glycemicScore < 50 || netCarbs > 50) {
    glycemicLoad = "High";
    verdictText = "High Glucose Spike Risk 🔴";
  } else if (glycemicScore < 75 || netCarbs > 30) {
    glycemicLoad = "Medium";
    verdictText = "Moderate Spike — Controlled 🟡";
  }

  return {
    calories,
    protein,
    carbs,
    fats,
    fiber,
    glycemicLoad,
    netCarbs,
    glycemicScore,
    verdictText,
  };
}
