/**
 * Renal & Diabetic Nephropathy (CKD Stages 1-5) Clinical Guidelines
 * Formulated according to KDIGO (Kidney Disease: Improving Global Outcomes) & KDOQI standards
 * Adapted for African & Diaspora Starch, Soup, and Herbal Nutrition.
 */

export type CKDStage = "stage1" | "stage2" | "stage3a" | "stage3b" | "stage4" | "stage5" | "none";

export interface RenalProfile {
  stage: CKDStage;
  label: string;
  eGFRRange: string;
  potassiumRestricted: boolean;
  phosphorusRestricted: boolean;
  dailySodiumCapMg: number;
  dailyPotassiumCapMg: number;
  dailyPhosphorusCapMg: number;
  proteinTargetGPerKg: number;
}

export interface DishRenalAnalysis {
  stage: CKDStage;
  potassiumRisk: "low" | "medium" | "high";
  phosphorusRisk: "low" | "medium" | "high";
  estimatedPotassiumMg: number;
  estimatedPhosphorusMg: number;
  renalVerdict: "safe" | "caution" | "high_risk";
  warnings: string[];
  leachingAdvice?: string;
}

export const CKD_STAGE_CONFIGS: Record<CKDStage, RenalProfile> = {
  none: {
    stage: "none",
    label: "Standard Kidney Function",
    eGFRRange: "eGFR > 90 mL/min",
    potassiumRestricted: false,
    phosphorusRestricted: false,
    dailySodiumCapMg: 2300,
    dailyPotassiumCapMg: 3500,
    dailyPhosphorusCapMg: 1200,
    proteinTargetGPerKg: 1.0,
  },
  stage1: {
    stage: "stage1",
    label: "CKD Stage 1 (Kidney Damage with Normal GFR)",
    eGFRRange: "eGFR ≥ 90 mL/min",
    potassiumRestricted: false,
    phosphorusRestricted: false,
    dailySodiumCapMg: 2000,
    dailyPotassiumCapMg: 3000,
    dailyPhosphorusCapMg: 1000,
    proteinTargetGPerKg: 0.8,
  },
  stage2: {
    stage: "stage2",
    label: "CKD Stage 2 (Mild GFR Reduction)",
    eGFRRange: "eGFR 60–89 mL/min",
    potassiumRestricted: false,
    phosphorusRestricted: false,
    dailySodiumCapMg: 2000,
    dailyPotassiumCapMg: 3000,
    dailyPhosphorusCapMg: 1000,
    proteinTargetGPerKg: 0.8,
  },
  stage3a: {
    stage: "stage3a",
    label: "CKD Stage 3a (Mild-to-Moderate Reduction)",
    eGFRRange: "eGFR 45–59 mL/min",
    potassiumRestricted: true,
    phosphorusRestricted: true,
    dailySodiumCapMg: 1500,
    dailyPotassiumCapMg: 2000,
    dailyPhosphorusCapMg: 800,
    proteinTargetGPerKg: 0.7,
  },
  stage3b: {
    stage: "stage3b",
    label: "CKD Stage 3b (Moderate-to-Severe Reduction)",
    eGFRRange: "eGFR 30–44 mL/min",
    potassiumRestricted: true,
    phosphorusRestricted: true,
    dailySodiumCapMg: 1500,
    dailyPotassiumCapMg: 2000,
    dailyPhosphorusCapMg: 800,
    proteinTargetGPerKg: 0.6,
  },
  stage4: {
    stage: "stage4",
    label: "CKD Stage 4 (Severe Reduction)",
    eGFRRange: "eGFR 15–29 mL/min",
    potassiumRestricted: true,
    phosphorusRestricted: true,
    dailySodiumCapMg: 1500,
    dailyPotassiumCapMg: 1500,
    dailyPhosphorusCapMg: 600,
    proteinTargetGPerKg: 0.6,
  },
  stage5: {
    stage: "stage5",
    label: "CKD Stage 5 (Kidney Failure / Dialysis)",
    eGFRRange: "eGFR < 15 mL/min",
    potassiumRestricted: true,
    phosphorusRestricted: true,
    dailySodiumCapMg: 1500,
    dailyPotassiumCapMg: 1500,
    dailyPhosphorusCapMg: 600,
    proteinTargetGPerKg: 1.2,
  },
};

// High Potassium African Ingredients
const HIGH_POTASSIUM_FOODS = [
  "plantain", "banana", "yam", "cocoyam", "spinach", "ugu", "fluted pumpkin", 
  "bitter leaf", "groundnut", "peanut", "beans", "cowpea", "bambara", "melon seed", "egusi",
  "tomato paste", "avocado", "baobab", "palm nut", "banga"
];

// High Phosphorus African Ingredients
const HIGH_PHOSPHORUS_FOODS = [
  "stockfish", "crayfish", "dried fish", "bone broth", "offal", "shaki", "liver", 
  "kidney", "cow foot", "ponmo", "evaporated milk", "processed cheese", "dark colas", "peanuts"
];

export function analyzeRenalSafety(
  dishName: string,
  proteinGrams: number,
  stage: CKDStage = "stage3a"
): DishRenalAnalysis {
  const config = CKD_STAGE_CONFIGS[stage] || CKD_STAGE_CONFIGS.stage3a;
  const nameLower = dishName.toLowerCase();

  let estimatedK = Math.round(proteinGrams * 28 + (nameLower.includes("yam") || nameLower.includes("plantain") ? 380 : 150));
  let estimatedP = Math.round(proteinGrams * 14 + (nameLower.includes("fish") || nameLower.includes("crayfish") ? 220 : 80));

  const hasHighKIngredient = HIGH_POTASSIUM_FOODS.some(f => nameLower.includes(f));
  const hasHighPIngredient = HIGH_PHOSPHORUS_FOODS.some(f => nameLower.includes(f));

  if (hasHighKIngredient) estimatedK += 220;
  if (hasHighPIngredient) estimatedP += 180;

  const warnings: string[] = [];
  let potassiumRisk: "low" | "medium" | "high" = "low";
  let phosphorusRisk: "low" | "medium" | "high" = "low";
  let renalVerdict: "safe" | "caution" | "high_risk" = "safe";

  if (config.potassiumRestricted) {
    if (estimatedK > 600) {
      potassiumRisk = "high";
      warnings.push(`High Potassium (~${estimatedK}mg) — exceeds safe per-meal target for ${config.label}.`);
    } else if (estimatedK > 400) {
      potassiumRisk = "medium";
      warnings.push(`Moderate Potassium (~${estimatedK}mg) — monitor daily allowance (cap: ${config.dailyPotassiumCapMg}mg).`);
    }
  }

  if (config.phosphorusRestricted) {
    if (estimatedP > 350) {
      phosphorusRisk = "high";
      warnings.push(`High Phosphorus (~${estimatedP}mg) — dried fish bones or organ meats add renal workload.`);
    } else if (estimatedP > 220) {
      phosphorusRisk = "medium";
      warnings.push(`Moderate Phosphorus (~${estimatedP}mg) — choose fresh lean fish fillets.`);
    }
  }

  if (potassiumRisk === "high" || phosphorusRisk === "high" || proteinGrams > 35) {
    renalVerdict = "high_risk";
  } else if (potassiumRisk === "medium" || phosphorusRisk === "medium" || proteinGrams > 22) {
    renalVerdict = "caution";
  }

  let leachingAdvice: string | undefined;
  if (hasHighKIngredient && config.potassiumRestricted) {
    leachingAdvice = "💡 Renal Leaching Protocol: Peel tubers & greens, dice small, boil in ample water for 10 mins, discard boiling water, then finish cooking in fresh water to leach out 45–55% of potassium.";
  }

  return {
    stage,
    potassiumRisk,
    phosphorusRisk,
    estimatedPotassiumMg: estimatedK,
    estimatedPhosphorusMg: estimatedP,
    renalVerdict,
    warnings,
    leachingAdvice,
  };
}
