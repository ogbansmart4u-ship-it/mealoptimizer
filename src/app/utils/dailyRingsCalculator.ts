/**
 * dailyRingsCalculator.ts
 * Clinical & Cultural Metabolic Daily Rings Calculator for MealOptimiza
 * 
 * Computes authentic, real-time daily progress for:
 * 1. Soup & Veggies Ring (Fiber & Viscous Gel Buffer)
 * 2. Food Portion Ring (Calorie Adherence & Energy Balance)
 * 3. Water Drank Ring (Cellular & Metabolic Hydration)
 * 4. Composite Metabolic Health Score (0-100)
 */

export interface MealLogItem {
  id?: string;
  name?: string;
  foodName?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  bloodSugarImpact?: "low" | "medium" | "high" | string;
  glycemicTag?: string;
  mealType?: string;
}

export interface DailyRingsData {
  healthScore: number;
  fiberScore: number;
  portionScore: number;
  waterScore: number;
  hasActivityToday: boolean;
  statusBadge: {
    label: string;
    variant: "idle" | "progress" | "good" | "optimal" | "complete";
  };
  metrics: {
    veggieMealsCount: number;
    targetVeggieMeals: number;
    caloriesConsumed: number;
    caloriesTarget: number;
    proteinConsumed: number;
    carbsConsumed: number;
    fatsConsumed: number;
    waterGlasses: number;
    waterGoal: number;
    totalMealsLogged: number;
    allRingsClosed: boolean;
    closedRingsCount: number;
  };
}

// Cultural and standard keywords indicating high-fiber, slimy soups, or vegetable buffers
const FIBER_BUFFER_KEYWORDS = [
  "soup",
  "veggie",
  "vegetable",
  "ewedu",
  "okra",
  "okro",
  "efo",
  "ogbono",
  "afang",
  "bitterleaf",
  "edikaikong",
  "edikang",
  "salad",
  "greens",
  "spinach",
  "ugu",
  "cabbage",
  "beans",
  "mushroom",
  "moi moi",
  "moimoi",
  "akamu",
  "avocado",
  "chia",
  "cucumber",
  "carrots",
];

export function isVeggieOrSoupBuffered(log: MealLogItem): boolean {
  if (!log) return false;
  const name = (log.foodName || log.name || "").toLowerCase();
  const impact = (log.bloodSugarImpact || "").toLowerCase();
  const tag = (log.glycemicTag || "").toLowerCase();

  const hasKeyword = FIBER_BUFFER_KEYWORDS.some((kw) => name.includes(kw));
  const isLowSpike = impact === "low" || tag.includes("low") || tag.includes("heart");
  const hasFiber = Number(log.fiber || 0) >= 3;

  return hasKeyword || isLowSpike || hasFiber;
}

export function calculateDailyRings({
  todayLogs = [],
  waterGlasses = 0,
  waterGoal = 8,
  caloriesTarget = 2000,
}: {
  todayLogs: MealLogItem[];
  waterGlasses: number;
  waterGoal?: number;
  caloriesTarget?: number;
}): DailyRingsData {
  const goalWater = Math.max(1, waterGoal || 8);
  const targetCalories = Math.max(1000, caloriesTarget || 2000);
  const totalMeals = todayLogs.length;

  const caloriesConsumed = todayLogs.reduce((acc, l) => acc + (Number(l.calories) || 0), 0);
  const proteinConsumed = todayLogs.reduce((acc, l) => acc + (Number(l.protein) || 0), 0);
  const carbsConsumed = todayLogs.reduce((acc, l) => acc + (Number(l.carbs) || 0), 0);
  const fatsConsumed = todayLogs.reduce((acc, l) => acc + (Number(l.fats) || 0), 0);

  const hasActivityToday = totalMeals > 0 || waterGlasses > 0;

  // 1. Soup & Veggies Ring (Target: 2 buffered meals per day, or up to total meals if 3+)
  const targetVeggieMeals = Math.max(2, Math.min(3, totalMeals || 2));
  const veggieMeals = todayLogs.filter(isVeggieOrSoupBuffered);
  const veggieMealsCount = veggieMeals.length;

  let fiberScore = 0;
  if (totalMeals > 0) {
    if (veggieMealsCount >= targetVeggieMeals) {
      fiberScore = 100;
    } else if (veggieMealsCount > 0) {
      fiberScore = Math.min(95, Math.round((veggieMealsCount / targetVeggieMeals) * 100));
    } else {
      // User logged meals, but none had vegetable/soup buffering
      fiberScore = 15; // Partial base for logging food, nudges to add soup/veggies
    }
  }

  // 2. Food Portion Ring (Energy & Caloric Adherence)
  let portionScore = 0;
  if (totalMeals > 0) {
    const calorieRatio = caloriesConsumed / targetCalories;
    if (calorieRatio <= 1.05) {
      // On track: factor in healthy meal distribution
      // 1 meal = 40-55%, 2 meals = 75-85%, 3 meals balanced = 100%
      const mealsPacing = Math.min(1, totalMeals / 3);
      const caloriePacing = Math.min(1, calorieRatio);
      portionScore = Math.min(100, Math.round((mealsPacing * 0.45 + caloriePacing * 0.55) * 100));
    } else {
      // Over calorie budget: scale down proportional to excess
      const overagePercent = (calorieRatio - 1) * 100;
      portionScore = Math.max(25, Math.round(100 - overagePercent * 0.75));
    }
  }

  // 3. Water Drank Ring
  const waterScore = Math.min(100, Math.round((waterGlasses / goalWater) * 100));

  // Ring completion counts
  const closedRingsCount =
    (fiberScore >= 100 ? 1 : 0) +
    (portionScore >= 100 ? 1 : 0) +
    (waterScore >= 100 ? 1 : 0);
  const allRingsClosed = closedRingsCount === 3;

  // Center Health Score: Weighted Composite Metabolic Score
  let healthScore = 0;
  if (hasActivityToday) {
    // 40% Fiber Buffer, 35% Portion & Energy Control, 25% Hydration
    healthScore = Math.min(
      100,
      Math.round(fiberScore * 0.4 + portionScore * 0.35 + waterScore * 0.25)
    );
  }

  // Dynamic Status Badge
  let statusBadge: DailyRingsData["statusBadge"];
  if (!hasActivityToday) {
    statusBadge = { label: "Ready to Start ✨", variant: "idle" };
  } else if (allRingsClosed) {
    statusBadge = { label: "3 Rings Closed! 🏆", variant: "complete" };
  } else if (closedRingsCount === 2) {
    statusBadge = { label: "2 Rings Closed! 🔥", variant: "optimal" };
  } else if (closedRingsCount === 1) {
    statusBadge = { label: "1 Ring Closed! ⚡", variant: "good" };
  } else if (healthScore >= 75) {
    statusBadge = { label: "Optimal Balance 🟢", variant: "optimal" };
  } else if (healthScore >= 45) {
    statusBadge = { label: "Building Momentum 🚀", variant: "good" };
  } else {
    statusBadge = { label: "Day Underway 🌅", variant: "progress" };
  }

  return {
    healthScore,
    fiberScore,
    portionScore,
    waterScore,
    hasActivityToday,
    statusBadge,
    metrics: {
      veggieMealsCount,
      targetVeggieMeals,
      caloriesConsumed,
      caloriesTarget: targetCalories,
      proteinConsumed,
      carbsConsumed,
      fatsConsumed,
      waterGlasses,
      waterGoal: goalWater,
      totalMealsLogged: totalMeals,
      allRingsClosed,
      closedRingsCount,
    },
  };
}
