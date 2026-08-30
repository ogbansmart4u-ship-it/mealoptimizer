/**
 * plateFixer.ts - Interactive Visual Plate Bio-Transformer Engine for West African Cuisine
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
  plateSection: "starch" | "fiber" | "protein";
}

export interface GlycemicCurvePoint {
  timeMin: number;
  originalGlucose: number;
  optimizedGlucose: number;
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
  peakGlucoseDelta: number; // e.g. -52 mg/dL reduction
  verdictText: string;
  originalRatios: { starch: number; fiber: number; protein: number };
  optimizedRatios: { starch: number; fiber: number; protein: number };
  curvePoints: GlycemicCurvePoint[];
  sequencingSteps: { step: number; title: string; subtitle: string; icon: string; benefit: string }[];
}

/**
 * Generates 3 intelligent, culturally-calibrated levers for any meal
 */
export function generatePlateFixes(meal: PlateMacroInput): OptimizationOption[] {
  const isHighCarb = (meal.carbs || 0) > 45;
  const isHighFat = (meal.fats || 0) > 20;

  return [
    {
      id: "starch_moderation",
      title: "Moderate Starch Portion (−35%)",
      description: "Downsize the swallow or rice portion to reduce rapid glucose absorption while maintaining full satiety.",
      carbDelta: isHighCarb ? -Math.round(meal.carbs * 0.35) : -18,
      calorieDelta: isHighCarb ? -Math.round(meal.carbs * 0.35 * 4) : -72,
      proteinDelta: 0,
      fiberDelta: -1,
      fatDelta: 0,
      culturalNote: "Blunts initial insulin surge without needing to eliminate heritage swallows.",
      plateSection: "starch",
    },
    {
      id: "fiber_shield",
      title: "Add Steamed Ugu / Ewedu Fiber Shield (+50%)",
      description: "Incorporate nutrient-dense traditional greens before or with your main meal.",
      carbDelta: 3,
      calorieDelta: 25,
      proteinDelta: 3,
      fiberDelta: 6,
      fatDelta: 0,
      culturalNote: "Soluble mucilage forms a viscous intestinal gel matrix, slowing glucose uptake by up to 38%.",
      plateSection: "fiber",
    },
    {
      id: "lean_protein_swap",
      title: "Grilled Titus Fish or Soy Awara Boost",
      description: "Pair with omega-3 rich fish or soy tofu instead of heavy saturated meats to stimulate GLP-1.",
      carbDelta: 0,
      calorieDelta: isHighFat ? -65 : -30,
      proteinDelta: 10,
      fiberDelta: 0,
      fatDelta: isHighFat ? -8 : -3,
      culturalNote: "Triggers satiety hormones (PYY and GLP-1) and buffers postprandial glycemic excursions.",
      plateSection: "protein",
    },
  ];
}

/**
 * Calculates dynamic macros, Glycemic Spike status, Visual Plate Portions & 2-Hour Curve
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
  let baseScore = 100 - netCarbs * 1.05;
  baseScore += fiber * 4.5;
  baseScore += protein * 0.9;
  const glycemicScore = Math.min(100, Math.max(10, Math.round(baseScore)));

  let glycemicLoad: "Low" | "Medium" | "High" = "Low";
  let verdictText = "Steady & Metabolic-Friendly 🟢";

  if (glycemicScore < 50 || netCarbs > 48) {
    glycemicLoad = "High";
    verdictText = "High Glucose Spike Risk 🔴";
  } else if (glycemicScore < 75 || netCarbs > 28) {
    glycemicLoad = "Medium";
    verdictText = "Moderate Spike — Controlled 🟡";
  }

  // Visual Plate Portion Ratios (% of plate area)
  const originalRatios = {
    starch: original.carbs > 40 ? 65 : 50,
    fiber: (original.fiber || 2) > 4 ? 25 : 15,
    protein: 20,
  };

  const optimizedRatios = {
    starch: activeOptions.starch_moderation ? 25 : originalRatios.starch - 15,
    fiber: activeOptions.fiber_shield ? 50 : originalRatios.fiber + 15,
    protein: activeOptions.lean_protein_swap ? 25 : 25,
  };

  // Ensure sum is 100
  const totalOpt = optimizedRatios.starch + optimizedRatios.fiber + optimizedRatios.protein;
  optimizedRatios.starch = Math.round((optimizedRatios.starch / totalOpt) * 100);
  optimizedRatios.fiber = Math.round((optimizedRatios.fiber / totalOpt) * 100);
  optimizedRatios.protein = 100 - optimizedRatios.starch - optimizedRatios.fiber;

  // 2-Hour Glycemic Curve (Continuous Glucose Simulator mg/dL)
  const baselineGlucose = 95;
  const originalPeak = baselineGlucose + Math.round(Math.min(95, (original.carbs || 50) * 1.5 - (original.fiber || 2) * 3));
  const optimizedPeak = baselineGlucose + Math.round(Math.min(45, netCarbs * 0.95 - fiber * 2.5));
  const peakGlucoseDelta = optimizedPeak - originalPeak; // e.g. -48 mg/dL

  const curvePoints: GlycemicCurvePoint[] = [
    { timeMin: 0, originalGlucose: baselineGlucose, optimizedGlucose: baselineGlucose },
    { timeMin: 30, originalGlucose: baselineGlucose + Math.round((originalPeak - baselineGlucose) * 0.75), optimizedGlucose: baselineGlucose + Math.round((optimizedPeak - baselineGlucose) * 0.6) },
    { timeMin: 45, originalGlucose: originalPeak, optimizedGlucose: baselineGlucose + Math.round((optimizedPeak - baselineGlucose) * 0.95) },
    { timeMin: 60, originalGlucose: originalPeak - 10, optimizedGlucose: optimizedPeak },
    { timeMin: 90, originalGlucose: baselineGlucose + 35, optimizedGlucose: baselineGlucose + 15 },
    { timeMin: 120, originalGlucose: baselineGlucose + 12, optimizedGlucose: baselineGlucose + 4 },
  ];

  // Clinical Food Sequencing Steps
  const sequencingSteps = [
    {
      step: 1,
      title: "Fiber & Mucilage First",
      subtitle: "3-4 spoons of Ewedu, Okra, or Steamed Ugu",
      icon: "🥬",
      benefit: "Forms viscous intestinal barrier to blunt carb uptake by 38%",
    },
    {
      step: 2,
      title: "Clean Protein Second",
      subtitle: "Grilled Titus Fish, Catfish, or Awara Tofu",
      icon: "🐟",
      benefit: "Stimulates GLP-1 & peptide YY to slow gastric emptying",
    },
    {
      step: 3,
      title: "Complex Starch Third",
      subtitle: "Oat swallow, Unripe Plantain, or Ofada Rice",
      icon: "🌾",
      benefit: "Enters digestive tract cushioned with zero sharp spike",
    },
  ];

  return {
    calories,
    protein,
    carbs,
    fats,
    fiber,
    glycemicLoad,
    netCarbs,
    glycemicScore,
    peakGlucoseDelta,
    verdictText,
    originalRatios,
    optimizedRatios,
    curvePoints,
    sequencingSteps,
  };
}

