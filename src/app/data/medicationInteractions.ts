// Curated medication ↔ food interaction rules for common conditions in this
// audience (diabetes, hypertension, thyroid, anticoagulation, etc.).
// This is general educational guidance, NOT a substitute for a pharmacist or
// doctor. Matching is intentionally cautious: a flag is a prompt to check, not
// a definitive verdict.

export type InteractionSeverity = "high" | "moderate" | "info";

export interface InteractionRule {
  key: string;
  label: string;        // drug or drug-class shown to the user
  drugs: string[];      // lowercase substrings matched against the user's med names
  match: {
    keywords?: string[];      // substrings in the food name that trigger the rule
    highSodium?: boolean;     // trigger when the food is high in sodium
    highPotassium?: boolean;  // trigger when the food is high in potassium
  };
  severity: InteractionSeverity;
  message: string;
}

export interface FoodContext {
  name?: string;
  sodium_mg?: number | null;
  potassium_mg?: number | null;
}

export interface InteractionFlag {
  severity: InteractionSeverity;
  label: string;
  message: string;
}

const HIGH_SODIUM = 500;      // mg per serving
const HIGH_POTASSIUM = 450;   // mg per serving

export const INTERACTION_RULES: InteractionRule[] = [
  {
    key: "warfarin_vitk",
    label: "Warfarin",
    drugs: ["warfarin", "coumadin"],
    match: {
      keywords: ["ugu", "ugwu", "spinach", "kale", "ewedu", "bitterleaf", "bitter leaf", "efo", "afang", "oha", "waterleaf", "broccoli", "cabbage", "vegetable soup", "pumpkin leaf", "green"],
    },
    severity: "high",
    message: "Leafy greens are rich in vitamin K, which weakens warfarin. Keep your green-vegetable intake steady day to day — sudden big changes can affect your INR.",
  },
  {
    key: "acearb_potassium",
    label: "ACE inhibitor / ARB",
    drugs: ["lisinopril", "enalapril", "ramipril", "perindopril", "captopril", "losartan", "valsartan", "telmisartan", "irbesartan", "candesartan"],
    match: { highPotassium: true, keywords: ["salt substitute", "lo-salt", "low-salt"] },
    severity: "moderate",
    message: "This medicine can raise blood potassium. Very high-potassium foods and potassium-based salt substitutes may push it too high — keep portions moderate and report palpitations to your doctor.",
  },
  {
    key: "ksparing_potassium",
    label: "Potassium-sparing diuretic",
    drugs: ["spironolactone", "amiloride", "eplerenone", "aldactone"],
    match: { highPotassium: true },
    severity: "moderate",
    message: "This diuretic keeps potassium in the body, so high-potassium foods add up quickly. Keep portions moderate.",
  },
  {
    key: "htn_sodium",
    label: "Blood-pressure medicine",
    drugs: ["amlodipine", "nifedipine", "hydrochlorothiazide", "bendroflumethiazide", "bisoprolol", "atenolol", "lisinopril", "losartan", "valsartan", "telmisartan", "enalapril", "ramipril", "nicardipine"],
    match: { highSodium: true, keywords: ["indomie", "noodle", "kilishi", "suya", "maggi", "stock cube", "seasoning cube", "canned", "processed"] },
    severity: "moderate",
    message: "High salt raises blood pressure and works against your BP medicine. This is a high-sodium choice — go easy on added salt and seasoning cubes.",
  },
  {
    key: "statin_grapefruit",
    label: "Statin",
    drugs: ["atorvastatin", "simvastatin", "lovastatin"],
    match: { keywords: ["grapefruit"] },
    severity: "high",
    message: "Grapefruit raises statin levels and the risk of muscle side effects. Avoid grapefruit and its juice with this statin.",
  },
  {
    key: "metformin_alcohol",
    label: "Metformin",
    drugs: ["metformin", "glucophage"],
    match: { keywords: ["alcohol", "beer", "wine", "spirit", "palm wine", "ogogoro", "burukutu", "stout"] },
    severity: "moderate",
    message: "Alcohol with metformin increases the risk of low blood sugar and, rarely, lactic acidosis. Limit alcohol and never drink on an empty stomach.",
  },
  {
    key: "levothyroxine_absorption",
    label: "Levothyroxine",
    drugs: ["levothyroxine", "eltroxin", "euthyrox", "thyroxine"],
    match: { keywords: ["soy", "soya", "milk", "calcium", "pap", "custard", "yoghurt", "yogurt"] },
    severity: "info",
    message: "Take levothyroxine on an empty stomach and separate it by about 4 hours from soy, dairy/calcium and high-fibre foods, which reduce its absorption.",
  },
  {
    key: "antibiotic_calcium",
    label: "Antibiotic (tetracycline / fluoroquinolone)",
    drugs: ["tetracycline", "doxycycline", "ciprofloxacin", "ofloxacin", "levofloxacin", "ciproflox"],
    match: { keywords: ["milk", "yoghurt", "yogurt", "cheese", "dairy", "calcium"] },
    severity: "moderate",
    message: "Dairy and calcium bind these antibiotics and reduce their absorption. Separate them by about 2 hours.",
  },
  {
    key: "iron_tea",
    label: "Iron supplement",
    drugs: ["ferrous", "iron", "feroglobin", "fersolate"],
    match: { keywords: ["tea", "coffee", "zobo", "lipton"] },
    severity: "info",
    message: "Tea, coffee and similar drinks reduce iron absorption. Take iron away from these, ideally with a vitamin-C food.",
  },
  {
    key: "maoi_tyramine",
    label: "MAOI antidepressant",
    drugs: ["phenelzine", "tranylcypromine", "isocarboxazid", "moclobemide"],
    match: { keywords: ["aged cheese", "cured", "salami", "fermented", "ugba", "okpeye", "iru", "locust bean", "dawadawa"] },
    severity: "high",
    message: "Fermented and aged foods high in tyramine can cause a dangerous blood-pressure spike with MAOIs. Avoid them.",
  },
];

export function getMedicationFoodFlags(medNames: string[], food: FoodContext): InteractionFlag[] {
  const meds = (medNames || []).map((m) => (m || "").toLowerCase()).filter(Boolean);
  if (!meds.length) return [];
  const name = (food.name || "").toLowerCase();
  const sodium = food.sodium_mg ?? null;
  const potassium = food.potassium_mg ?? null;

  const flags: InteractionFlag[] = [];
  for (const rule of INTERACTION_RULES) {
    const takes = meds.some((m) => rule.drugs.some((d) => m.includes(d)));
    if (!takes) continue;

    let triggered = false;
    if (rule.match.keywords && name) triggered = rule.match.keywords.some((k) => name.includes(k));
    if (!triggered && rule.match.highSodium && sodium != null && sodium >= HIGH_SODIUM) triggered = true;
    if (!triggered && rule.match.highPotassium && potassium != null && potassium >= HIGH_POTASSIUM) triggered = true;
    if (triggered) flags.push({ severity: rule.severity, label: rule.label, message: rule.message });
  }

  const seen = new Set<string>();
  return flags.filter((f) => {
    const k = f.label + f.message;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
