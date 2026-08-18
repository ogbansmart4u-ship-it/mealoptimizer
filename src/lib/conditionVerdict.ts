// Condition-aware verdict engine.
// Turns a dish's macros + the user's medical conditions into a personal
// "Is this good for ME?" verdict. Pure + deterministic so it runs instantly
// client-side and is easy to test. Reason text is English, matching the rest
// of the AI clinical output the analyzer already returns.

export type GlycemicLoad = "Low" | "Medium" | "High";

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  glycemicLoad: GlycemicLoad;
}

export interface UserCondition {
  name: string;
  severity?: string; // "mild" | "moderate" | "severe"
}

export type VerdictLevel = "good" | "caution" | "avoid";

export interface ConditionVerdict {
  condition: string; // display label, may combine related conditions
  level: VerdictLevel;
  note: string;
}

export interface Verdict {
  level: VerdictLevel; // overall = worst of the per-condition verdicts
  title: string;
  subtitle: string;
  reasons: string[];
  tip?: string;
  perCondition: ConditionVerdict[];
  hasConditions: boolean;
}

const RANK: Record<VerdictLevel, number> = { good: 0, caution: 1, avoid: 2 };
const worst = (a: VerdictLevel, b: VerdictLevel): VerdictLevel =>
  RANK[a] >= RANK[b] ? a : b;

interface RuleResult {
  level: VerdictLevel;
  note: string;
  tip?: string;
}

// Round to a friendly integer for display.
const r = (n: number) => Math.max(0, Math.round(n || 0));

// ---- Per-family rules -------------------------------------------------------

function glycemicRule(m: Macros): RuleResult {
  const highCarb = m.carbs >= 60;
  const modCarb = m.carbs >= 40;
  const lowFiber = m.fiber < 4;
  if (m.glycemicLoad === "High" || (highCarb && lowFiber)) {
    return {
      level: "avoid",
      note: `High glycemic load (~${r(m.carbs)}g carbs, only ${r(m.fiber)}g fiber) — likely to spike your blood sugar.`,
      tip: "Cut the rice/swallow portion by half and add vegetables or protein to blunt the sugar spike.",
    };
  }
  if (m.glycemicLoad === "Medium" || modCarb) {
    return {
      level: "caution",
      note: `Moderate carb load (~${r(m.carbs)}g). Manageable, but watch your portion to keep blood sugar steady.`,
      tip: "Keep the portion small and eat the protein and vegetables first.",
    };
  }
  return {
    level: "good",
    note: `Low glycemic load with ${r(m.fiber)}g fiber — gentle on your blood sugar.`,
  };
}

function cardiacRule(m: Macros): RuleResult {
  if (m.fats >= 25 || m.calories >= 700) {
    return {
      level: "avoid",
      note: `Rich in fat (~${r(m.fats)}g) and calories (~${r(m.calories)}) — hard on your heart and arteries.`,
      tip: "Grill or boil instead of frying, go easy on palm oil, and skip added salt / seasoning cubes.",
    };
  }
  if (m.fats >= 15 || m.calories >= 500) {
    return {
      level: "caution",
      note: `Fairly rich (~${r(m.fats)}g fat, ${r(m.calories)} cal). Fine now and then, not every day.`,
      tip: "Reduce the oil and don't add extra salt — it protects your blood pressure.",
    };
  }
  return {
    level: "good",
    note: `Lean and light (~${r(m.fats)}g fat) — friendly to your heart.`,
  };
}

function kidneyRule(m: Macros): RuleResult {
  if (m.protein >= 35) {
    return {
      level: "avoid",
      note: `High protein (~${r(m.protein)}g) adds extra load on your kidneys.`,
      tip: "Keep meat and fish portions small; confirm your potassium & phosphorus limits with your dietitian.",
    };
  }
  if (m.protein >= 20) {
    return {
      level: "caution",
      note: `Moderate protein (~${r(m.protein)}g) — keep the portion controlled.`,
      tip: "Balance with lower-protein sides and stay within your daily protein target.",
    };
  }
  return {
    level: "good",
    note: `Modest protein (~${r(m.protein)}g) — easier on your kidneys.`,
  };
}

function weightRule(m: Macros): RuleResult {
  if (m.calories >= 650) {
    return {
      level: "avoid",
      note: `Calorie-dense (~${r(m.calories)} cal) for a single dish.`,
      tip: "Halve the portion or share it, and pile on vegetables to stay full on fewer calories.",
    };
  }
  if (m.calories >= 450) {
    return {
      level: "caution",
      note: `Moderate calories (~${r(m.calories)}). Mind the portion size.`,
      tip: "Watch the swallow / rice size and skip second helpings.",
    };
  }
  return {
    level: "good",
    note: `Light (~${r(m.calories)} cal) — fits a weight-loss plan.`,
  };
}

function goutRule(m: Macros): RuleResult {
  if (m.protein >= 35) {
    return {
      level: "avoid",
      note: `High animal protein (~${r(m.protein)}g) can raise uric acid and trigger a flare.`,
      tip: "Limit organ meats, red meat and seafood; drink plenty of water.",
    };
  }
  if (m.protein >= 20) {
    return {
      level: "caution",
      note: `Moderate protein (~${r(m.protein)}g). Keep meat and seafood modest.`,
      tip: "Favour plant protein and stay well hydrated.",
    };
  }
  return { level: "good", note: `Low purine load likely (~${r(m.protein)}g protein).` };
}

function giRule(m: Macros): RuleResult {
  if (m.fats >= 25) {
    return {
      level: "caution",
      note: `Rich and fatty (~${r(m.fats)}g) meals can trigger reflux and stomach discomfort.`,
      tip: "Ease up on hot pepper, oil and acidic tomato; eat slowly and don't lie down straight after.",
    };
  }
  return {
    level: "good",
    note: `Not too fatty (~${r(m.fats)}g) — gentler on your stomach.`,
    tip: "Still go easy on hot pepper and very acidic foods if they usually trigger you.",
  };
}

function nourishRule(): RuleResult {
  return {
    level: "good",
    note: "No restriction here — focus on iron-rich foods and steady hydration.",
    tip: "Pair with a vitamin-C food (orange, pepper, tomato) to absorb more iron, and keep drinking water.",
  };
}

function pregnancyRule(m: Macros): RuleResult {
  if (m.glycemicLoad === "High" || m.carbs >= 60) {
    return {
      level: "caution",
      note: `High carb load (~${r(m.carbs)}g) — worth moderating to keep blood sugar steady in pregnancy.`,
      tip: "Keep the portion moderate, add protein and vegetables, and make sure any meat/fish is fully cooked.",
    };
  }
  return {
    level: "good",
    note: "Nutrient-friendly for pregnancy and recovery.",
    tip: "Prioritise iron, folate and protein, stay hydrated, and ensure everything is well cooked.",
  };
}

function ingredientFlagRule(what: string): RuleResult {
  return {
    level: "caution",
    note: `A photo can't confirm ${what}. Verify the ingredients before eating.`,
  };
}

function neutralRule(): RuleResult {
  return {
    level: "good",
    note: "No specific red flags for this condition — aim for overall balance.",
  };
}

// General (no conditions) balance check.
function generalRule(m: Macros): RuleResult {
  const highGlycemic = m.glycemicLoad === "High";
  const heavy = m.calories >= 650 || m.fats >= 25;
  if (highGlycemic && heavy) {
    return {
      level: "caution",
      note: `Calorie- and carb-dense (~${r(m.calories)} cal, ${r(m.carbs)}g carbs). Enjoy in a smaller portion.`,
      tip: "Halve the swallow/rice, add vegetables, and you've got a much more balanced plate.",
    };
  }
  if (highGlycemic || heavy) {
    return {
      level: "caution",
      note: `A little heavy (~${r(m.calories)} cal, ${r(m.fats)}g fat). Fine in moderation.`,
      tip: "Watch the portion and add some vegetables or protein to balance it.",
    };
  }
  return {
    level: "good",
    note: `Balanced plate — ~${r(m.calories)} cal with ${r(m.fiber)}g fiber.`,
  };
}

// ---- Condition -> family dispatch ------------------------------------------

interface Family {
  key: string;
  run: (m: Macros) => RuleResult;
}

function familyFor(name: string): Family | null {
  const n = name.toLowerCase();
  if (n.includes("diabet") || n.includes("prediab") || n.includes("pcos") || n.includes("fatty liver"))
    return { key: "glycemic", run: glycemicRule };
  if (n.includes("hypertension") || n.includes("blood pressure") || n.includes("heart") || n.includes("cholesterol"))
    return { key: "cardiac", run: cardiacRule };
  if (n.includes("kidney") || n.includes("renal"))
    return { key: "kidney", run: kidneyRule };
  if (n.includes("obesity") || n.includes("weight"))
    return { key: "weight", run: weightRule };
  if (n.includes("gout"))
    return { key: "gout", run: goutRule };
  if (n.includes("ulcer") || n.includes("gerd") || n.includes("reflux") || n.includes("ibs"))
    return { key: "gi", run: giRule };
  if (n.includes("anemia") || n.includes("anaemia") || n.includes("sickle"))
    return { key: "nourish", run: nourishRule };
  if (n.includes("celiac") || n.includes("coeliac"))
    return { key: "gluten", run: () => ingredientFlagRule("gluten (wheat, barley, semovita)") };
  if (n.includes("lactose"))
    return { key: "dairy", run: () => ingredientFlagRule("dairy (milk, cheese, cream)") };
  if (n.includes("allerg"))
    return { key: "allergen", run: () => ingredientFlagRule("allergens") };
  if (n.includes("pregnan") || n.includes("postpartum") || n.includes("cesarean") || n.includes("cesarian") || n.includes("caesarean"))
    return { key: "pregnancy", run: pregnancyRule };
  if (n.includes("thyroid"))
    return { key: "thyroid", run: neutralRule };
  return null;
}

// ---- Public API -------------------------------------------------------------

function titleFor(level: VerdictLevel, hasConditions: boolean): string {
  if (!hasConditions) {
    return level === "good" ? "Balanced choice" : level === "caution" ? "Enjoy in moderation" : "Go easy on this";
  }
  return level === "good" ? "Good for you" : level === "caution" ? "Eat with care" : "Best skipped for you";
}

export function computeVerdict(macros: Macros, conditions: UserCondition[] = []): Verdict {
  const hasData = (macros?.calories || 0) > 0 || (macros?.carbs || 0) > 0 || (macros?.protein || 0) > 0;

  if (!hasData) {
    return {
      level: "caution",
      title: "Can't fully judge this one",
      subtitle: "Not enough nutrition detail from the photo",
      reasons: ["The image didn't return enough nutrition data for a precise personal verdict — treat the numbers as a rough estimate."],
      perCondition: [],
      hasConditions: conditions.length > 0,
    };
  }

  const named = (conditions || [])
    .map((c) => ({ name: (c?.name || "").trim(), severity: c?.severity }))
    .filter((c) => c.name.length > 0);

  const hasConditions = named.length > 0;

  if (!hasConditions) {
    const g = generalRule(macros);
    return {
      level: g.level,
      title: titleFor(g.level, false),
      subtitle: "General healthy-eating check",
      reasons: [g.note],
      tip: g.tip,
      perCondition: [],
      hasConditions: false,
    };
  }

  // Group conditions by rule family so related ones (e.g. Type 2 + Prediabetes)
  // produce a single combined verdict line.
  const byFamily = new Map<string, { run: (m: Macros) => RuleResult; labels: string[] }>();
  for (const c of named) {
    const fam = familyFor(c.name);
    if (!fam) continue;
    const entry = byFamily.get(fam.key);
    if (entry) {
      if (!entry.labels.includes(c.name)) entry.labels.push(c.name);
    } else {
      byFamily.set(fam.key, { run: fam.run, labels: [c.name] });
    }
  }

  // No recognised condition among those listed -> fall back to general balance,
  // but still frame it as personal.
  if (byFamily.size === 0) {
    const g = generalRule(macros);
    return {
      level: g.level,
      title: titleFor(g.level, true),
      subtitle: `Based on your ${named.map((c) => c.name).join(", ")}`,
      reasons: [g.note],
      tip: g.tip,
      perCondition: [],
      hasConditions: true,
    };
  }

  const perCondition: ConditionVerdict[] = [];
  const tipsByLevel: Record<VerdictLevel, string[]> = { good: [], caution: [], avoid: [] };
  let overall: VerdictLevel = "good";

  for (const { run, labels } of byFamily.values()) {
    const res = run(macros);
    overall = worst(overall, res.level);
    perCondition.push({ condition: labels.join(", "), level: res.level, note: res.note });
    if (res.tip) tipsByLevel[res.level].push(res.tip);
  }

  // Order per-condition lines worst-first so the most important shows on top.
  perCondition.sort((a, b) => RANK[b.level] - RANK[a.level]);

  // Overall reasons: the notes from the most severe conditions (up to 3).
  const reasons = perCondition
    .filter((p) => p.level === overall)
    .map((p) => p.note)
    .slice(0, 3);

  // Pick one actionable tip from the most severe level that offers one.
  const tip =
    tipsByLevel[overall][0] ||
    tipsByLevel.avoid[0] ||
    tipsByLevel.caution[0] ||
    tipsByLevel.good[0];

  const allLabels = named.map((c) => c.name);

  return {
    level: overall,
    title: titleFor(overall, true),
    subtitle: `Based on your ${allLabels.join(", ")}`,
    reasons,
    tip,
    perCondition,
    hasConditions: true,
  };
}
