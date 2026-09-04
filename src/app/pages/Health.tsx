import React, { useState, useMemo, useEffect } from "react";
import {
  Activity, Target, MapPin, Scale, Calendar, Pill, Stethoscope,
  Lightbulb, BookOpen, Heart, ChevronRight,
  Shield, Droplet, Moon, Dumbbell, Clock, AlertCircle, FileText,
  Search, Sparkles, CheckCircle2, Bookmark, BookmarkCheck,
  Zap, Share2, HelpCircle, Check, X, ArrowRight, Info, AlertTriangle, Calculator
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate, useSearchParams } from "react-router";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import Mascot from "../components/Mascot";
import MicronutrientShieldCard from "../components/MicronutrientShieldCard";
import WearableSyncModal from "../components/WearableSyncModal";
import { toast } from "sonner";

export type EducationalCategory = "all" | "sugar" | "heart" | "herbs" | "metabolism" | "drugs";

export interface EducationalArticle {
  id: string;
  category: EducationalCategory;
  categoryLabel: string;
  title: string;
  icon: string;
  color: string;
  badgeBg: string;
  readTime: string;
  headline: string;
  clinicalImpact: string; // e.g. "HbA1c reduction ~0.4-0.6%"
  recommendedFor?: string[]; // e.g. ["diabetes", "prediabetes"]
  summary: string;
  keyBiomarkers: { name: string; target: string; note: string }[];
  eatThisVsModerate: { eat: string; moderate: string; reason: string }[];
  actionableHabits: string[];
  scientificReference: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const EDUCATIONAL_ARTICLES: EducationalArticle[] = [
  {
    id: "diabetes-glycemic-shield",
    category: "sugar",
    categoryLabel: "Blood Sugar & Glycemic Index",
    title: "Taming West African Starches for Steady Blood Sugar",
    icon: "🩺",
    color: "text-rose-700 dark:text-rose-400",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900",
    readTime: "2 min read",
    headline: "How resistant starch and viscosity buffer glucose excursions without giving up cultural dishes.",
    clinicalImpact: "HbA1c ↓ 0.4% - 0.7% over 12 weeks",
    recommendedFor: ["diabetes", "type 2 diabetes", "prediabetes", "insulin resistance", "metabolic"],
    summary:
      "Traditional swallows like pounded yam and white garri have a high Glycemic Index (GI > 75). However, when swallow is paired with viscous slimy soups (Ewedu, Okra, Ogbono) or cooled and reheated (creating Retrograded Resistant Starch Type 3), glucose absorption rate is slowed by up to 38%.",
    keyBiomarkers: [
      { name: "Fasting Blood Glucose", target: "< 100 mg/dL (5.6 mmol/L)", note: "Assesses baseline hepatic insulin sensitivity." },
      { name: "2-Hour Postprandial", target: "< 140 mg/dL (7.8 mmol/L)", note: "Monitors meal-specific carbohydrate clearance." },
      { name: "HbA1c", target: "< 6.5% - 7.0%", note: "Reflects 3-month average glycation." },
    ],
    eatThisVsModerate: [
      { eat: "Oat swallow, Unripe Plantain flour, Guinea Corn (Baba)", moderate: "Pounded Yam, Instant Starch, White Garri", reason: "Higher soluble beta-glucans and slower gastric emptying." },
      { eat: "Okra, Ewedu, Ogbono with high vegetable-to-swallow ratio", moderate: "Dry plain carb swallows without viscous soup", reason: "Soluble mucilage acts as a physical barrier against rapid enzymatic glucose absorption." },
      { eat: "Lean fish, boiled eggs, cowpeas (Beans) as carb buffers", moderate: "Sweetened soft drinks, malt drinks", reason: "Protein-induced GLP-1 release promotes satiety and improves insulin response." },
    ],
    actionableHabits: [
      "The 'Fiber First' Rule: Eat 3-4 spoonfuls of leafy soup or salad before taking the first swallow bite.",
      "Resistant Starch Prep: Cooking boiled sweet potatoes or beans ahead of time and cooling overnight increases resistant starch by 40%.",
      "Post-Meal 10-Minute Walk: Light physical movement within 30 minutes after dining pulls glucose into muscle cells via GLUT4 independent of insulin.",
    ],
    scientificReference: "Lancet Diabetes & Endocrinology / Nigerian Journal of Nutritional Sciences (2024)",
    quiz: {
      question: "Which soup property most effectively blunts glucose absorption during a swallow meal?",
      options: [
        "High saturated fat from bleached palm oil",
        "Viscous soluble mucilage from Ewedu, Okra, or Ogbono",
        "Extra table salt and bouillon cubes",
        "Eating the swallow cold without soup",
      ],
      correctIndex: 1,
      explanation: "Soluble mucilage forms a gel-like matrix in the small intestine, slowing enzymatic breakdown of starches and blunting blood glucose spikes.",
    },
  },
  {
    id: "hypertension-sodium-balance",
    category: "heart",
    categoryLabel: "Heart & Blood Pressure",
    title: "The Sodium-to-Potassium Ratio in Nigerian Cooking",
    icon: "❤️",
    color: "text-red-700 dark:text-red-400",
    badgeBg: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900",
    readTime: "3 min read",
    headline: "Why boosting dietary potassium with leafy greens lowers systolic BP more effectively than sodium restriction alone.",
    clinicalImpact: "Systolic BP ↓ 5-8 mmHg, Diastolic BP ↓ 3-5 mmHg",
    recommendedFor: ["hypertension", "high blood pressure", "heart", "cardiovascular", "stroke"],
    summary:
      "In West African cuisine, high reliance on bouillon seasoning cubes, smoked dried fish with sodium preservatives, and table salt shifts the intracellular sodium-potassium pump. Increasing potassium through Ugu, Garden Egg, and Sweet Potatoes helps the kidneys excrete sodium through natriuresis.",
    keyBiomarkers: [
      { name: "Systolic Blood Pressure", target: "< 120-130 mmHg", note: "Cardiovascular arterial wall tension." },
      { name: "Diastolic Blood Pressure", target: "< 80 mmHg", note: "Resting vascular resistance." },
      { name: "Sodium/Potassium Urinary Ratio", target: "< 1.0", note: "Direct clinical marker of dietary balance." },
    ],
    eatThisVsModerate: [
      { eat: "Locust beans (Iru/Dawadawa), garlic, ginger, crayfish for flavor", moderate: "Multiple sodium bouillon cubes per pot", reason: "Fermented Iru provides savory umami (glutamate) with zero added chemical sodium." },
      { eat: "Ugu (Fluted pumpkin), Spinach, Plantain, Garden Egg", moderate: "Salted stockfish, processed corned beef, canned meats", reason: "Potassium relaxes arterial walls and induces natural diuresis." },
      { eat: "Fresh Hibiscus (Zobo) tea unsweetened with ginger & cloves", moderate: "Energy drinks, high-caffeine beverages", reason: "Hibiscus calyces contain anthocyanins that act as mild natural ACE inhibitors." },
    ],
    actionableHabits: [
      "The 'Half-Cube' Swap: Cut bouillon cube usage in half and replace the missing depth with ground crayfish, Iru, garlic, and thyme.",
      "Rinse Preserved Fish: Soak and boil smoked fish/stockfish in warm water and discard the first rinse to remove up to 30% of surface curing salt.",
      "Daily Hibiscus Cup: 1 cup of unsweetened Zobo infusion daily has been shown to assist endothelial relaxation.",
    ],
    scientificReference: "American Heart Association (AHA) & West African College of Physicians",
    quiz: {
      question: "What natural traditional seasoning provides deep umami flavor while reducing reliance on sodium cubes?",
      options: [
        "Monosodium glutamate crystals",
        "Fermented African Locust Beans (Iru / Dawadawa)",
        "Salted potash (Kaun)",
        "Bleached palm oil",
      ],
      correctIndex: 1,
      explanation: "Fermented locust beans (Iru/Dawadawa) deliver natural savory peptide umami without the high industrial sodium found in commercial seasoning cubes.",
    },
  },
  {
    id: "african-superfoods-herbs",
    category: "herbs",
    categoryLabel: "African Superfoods & Herbs",
    title: "Clinical Science of Bitter Leaf, Ewedu & Ugu",
    icon: "🌿",
    color: "text-emerald-700 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900",
    readTime: "2 min read",
    headline: "Unpacking the antioxidant polyphenols, iron bioavailability, and lipid-balancing virtues of local greens.",
    clinicalImpact: "Total Antioxidant Capacity ↑ 30%, Liver Enzyme Balance",
    recommendedFor: ["all", "general", "wellness", "cholesterol", "liver"],
    summary:
      "West African leafy greens are among the most nutrient-dense botanical foods on earth. Vernonia amygdalina (Bitter Leaf) is packed with vernodalin and luteolin, Corchorus olitorius (Ewedu) provides carotenoids and beta-carotene, while Telfairia occidentalis (Ugu) supplies bioavailable non-heme iron and folate.",
    keyBiomarkers: [
      { name: "Serum Ferritin / Hemoglobin", target: "13.5-17.5 g/dL (M), 12.0-15.5 g/dL (F)", note: "Oxygen-carrying capacity supported by Ugu." },
      { name: "ALT / AST (Liver Enzymes)", target: "< 35 U/L", note: "Protected by bitter leaf and antioxidant flavonoids." },
    ],
    eatThisVsModerate: [
      { eat: "Freshly squeezed Ugu juice with a squeeze of citrus (Vitamin C)", moderate: "Boiling vegetables for 30+ minutes until brown", reason: "Vitamin C converts non-heme iron into soluble ferrous form; over-boiling leaches water-soluble vitamins." },
      { eat: "Bitter leaf lightly washed (retaining mild bitterness)", moderate: "Squeezing out 100% of the bitter green juice", reason: "The bitter sesquiterpene lactones are the active metabolic agents supporting liver bile flow." },
      { eat: "Ukazi, Afang, and Waterleaf in diverse weekly rotation", moderate: "Mono-diet of only 1 vegetable type", reason: "Phytochemical diversity nourishes diverse gut microbial species." },
    ],
    actionableHabits: [
      "Gentle Blanching: Cook leafy greens for no more than 3-5 minutes at the very end of soup cooking to preserve heat-sensitive folates.",
      "Pair with Vitamin C: Add tomatoes, peppers, or lime to green vegetable dishes to double iron absorption.",
      "Bitter Morning Sip: A small infusion of bitter leaf tea 2-3 mornings a week stimulates digestive enzymes.",
    ],
    scientificReference: "Journal of Ethnopharmacology & Phytomedicine (2025)",
    quiz: {
      question: "Why should you avoid washing out 100% of the bitter taste from Bitter Leaf before cooking?",
      options: [
        "Because the bitterness contains the bioactive sesquiterpene lactones that aid metabolic health",
        "Because washing bitter leaf destroys carbohydrates",
        "Because it makes the soup cook slower",
        "Because bitter leaf is toxic when fully washed",
      ],
      correctIndex: 0,
      explanation: "The bitter phytochemicals (luteolin, vernodalin) are precisely the therapeutic compounds responsible for insulin sensitization and liver bile support.",
    },
  },
  {
    id: "pcos-hormonal-metabolism",
    category: "metabolism",
    categoryLabel: "PCOS & Hormonal Metabolism",
    title: "Managing PCOS & Insulin Resistance with African Diets",
    icon: "🥑",
    color: "text-purple-700 dark:text-purple-400",
    badgeBg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900",
    readTime: "3 min read",
    headline: "Targeting hyperinsulinemia, reducing androgen flare-ups, and balancing ovulatory cycles through whole-food nutrition.",
    clinicalImpact: "Fasting Insulin ↓ 25%, Improved Menstrual Regularity",
    recommendedFor: ["pcos", "fertility", "hormones", "weight loss", "acne"],
    summary:
      "Polycystic Ovary Syndrome (PCOS) is primarily driven by compensatory hyperinsulinemia—excess insulin signals the ovaries to overproduce testosterone. Transitioning to a high-protein African breakfast, incorporating anti-inflammatory spices (turmeric, ginger, cloves), and moderating refined starches dramatically improves cycle predictability.",
    keyBiomarkers: [
      { name: "Fasting Insulin", target: "< 8 uIU/mL", note: "Key driver of ovarian androgen synthesis." },
      { name: "HOMA-IR Score", target: "< 1.5", note: "Quantifies cellular insulin resistance index." },
      { name: "LH / FSH Ratio", target: "~ 1:1", note: "Hormonal ratio signaling regular ovulation." },
    ],
    eatThisVsModerate: [
      { eat: "Boiled eggs, Akara made from whole cowpeas, fish pepper soup breakfast", moderate: "Sweet tea, white bread, sugar-sweetened puff puff", reason: "Savory high-protein breakfast prevents morning glucose spikes and day-long sugar cravings." },
      { eat: "Avocado, Walnuts, Chia/Flaxseed, Pumpkin seeds (Egusi in moderation)", moderate: "Deep-fried industrial palm olein and trans fats", reason: "Healthy fats support steroid hormone synthesis and progesterone balance." },
      { eat: "Moi Moi with boiled eggs, vegetable stir-fries with chicken", moderate: "Large plates of late-night white rice (Jollof/Fried)", reason: "Evening heavy carbs worsen overnight insulin surges and disrupt restorative sleep." },
    ],
    actionableHabits: [
      "The 'Savory Breakfast' Rule: Start the day with protein and healthy fats (e.g. 2 eggs + steamed Moi-Moi) rather than cereal or pastry.",
      "Myo-Inositol rich staples: Include beans, citrus fruits, and cantaloupes to naturally support ovarian receptor sensitivity.",
      "Spearmint / Green Tea: Drink 1 cup of spearmint infusion in the afternoon to naturally downregulate excess free testosterone.",
    ],
    scientificReference: "Endocrine Society Clinical Practice Guidelines & BJOG",
    quiz: {
      question: "What is the primary underlying driver connecting diet and androgen excess in most PCOS cases?",
      options: [
        "Low salt intake in soups",
        "Compensatory hyperinsulinemia (excess circulating insulin)",
        "Drinking too much unsweetened water",
        "Eating too much fresh fish",
      ],
      correctIndex: 1,
      explanation: "High circulating insulin stimulates the theca cells in ovaries to produce excess androgens (testosterone), disrupting follicular maturation and cycles.",
    },
  },
  {
    id: "gut-microbiome-fermentation",
    category: "metabolism",
    categoryLabel: "Gut Health & Fermentation",
    title: "Probiotics & Prebiotics in African Fermented Staples",
    icon: "🧫",
    color: "text-amber-700 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900",
    readTime: "2 min read",
    headline: "How Ogi, Iru, Ogiri, and fermented cassava nourish the short-chain fatty acid (SCFA) gut microbiome.",
    clinicalImpact: "Butyrate production ↑ 45%, Reduced Gut Inflammation",
    recommendedFor: ["gut", "digestion", "bloating", "ibs", "metabolism", "immunity"],
    summary:
      "Indigenous African fermentation processes utilize wild Lactobacillus, Leuconostoc, and Bacillus species. These beneficial bacteria break down anti-nutrients (phytates and tannins), make iron and zinc 300% more bioavailable, and synthesize gut-healing Short-Chain Fatty Acids (Butyrate and Acetate).",
    keyBiomarkers: [
      { name: "Gut SCFA Ratio", target: "High Butyrate / Acetate", note: "Fuel for colonocytes and tight junction integrity." },
      { name: "High-Sensitivity CRP (hs-CRP)", target: "< 1.0 mg/L", note: "Systemic baseline inflammation indicator." },
    ],
    eatThisVsModerate: [
      { eat: "Fermented Ogi / Akamu (unsweetened), traditional Iru / Ogiri", moderate: "Commercial ultra-processed yogurts loaded with 20g sugar", reason: "Live lactobacillus without glucose spike." },
      { eat: "Tigernuts (Ofio / Aya) and Baobab pulp (high prebiotic inulin)", moderate: "Refined flour snacks and artificial sweeteners", reason: "Prebiotic oligosaccharides feed beneficial Bifidobacteria." },
      { eat: "Slow-fermented garri in moderate portion with fiber soup", moderate: "Unfermented raw cassava derivatives", reason: "Proper fermentation detoxifies cyanogenic glycosides and enriches organic acids." },
    ],
    actionableHabits: [
      "Daily Prebiotic Snack: Eat a handful of raw or roasted tigernuts (Aya) for 10g of insoluble prebiotic gut fuel.",
      "Traditional Iru in Stews: Add Iru into tomato stew and soups 5 minutes before flame-off to preserve probiotic peptides.",
      "Unsweetened Ogi: Sweeten morning Ogi with ginger, cloves, and cinnamon instead of 3 spoons of table sugar.",
    ],
    scientificReference: "Nature Microbiology & African Journal of Biotechnology",
    quiz: {
      question: "What key metabolic benefit does traditional fermentation provide to grains and legumes?",
      options: [
        "Increases chemical sugar content by 500%",
        "Deactivates anti-nutrients (phytates) and releases bioavailable minerals (iron/zinc)",
        "Makes foods last forever without refrigeration",
        "Converts protein into saturated fat",
      ],
      correctIndex: 1,
      explanation: "Lactic acid fermentation breaks the bond between phytates and minerals, dramatically unlocking iron, calcium, and zinc for intestinal absorption.",
    },
  },
  {
    id: "drug-nutrient-interactions",
    category: "drugs",
    categoryLabel: "Medication & Nutrient Synergy",
    title: "Medication & Nutrient Safety Guide",
    icon: "💊",
    color: "text-teal-700 dark:text-teal-400",
    badgeBg: "bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-900",
    readTime: "3 min read",
    headline: "Protecting your liver, kidneys, and nutrient absorption when taking blood pressure or diabetes drugs.",
    clinicalImpact: "Prevents B12 & Potassium Deficiencies, Reduces GI side effects",
    recommendedFor: ["medications", "metformin", "amlodipine", "losartan", "statins"],
    summary:
      "Common chronic medications have distinct interactions with diet. For example, Metformin depletes Vitamin B12 over time; ACE inhibitors / ARBs (Lisinopril, Losartan) retain potassium; while Calcium Channel Blockers (Amlodipine) must never be taken with grapefruit.",
    keyBiomarkers: [
      { name: "Serum Vitamin B12", target: "> 400 pg/mL", note: "Crucial for peripheral nerve health in Metformin users." },
      { name: "Serum Potassium (K+)", target: "3.5 - 5.0 mEq/L", note: "Monitored with Losartan / Lisinopril." },
      { name: "eGFR / Serum Creatinine", target: "> 60 mL/min/1.73m²", note: "Kidney filtration safety marker." },
    ],
    eatThisVsModerate: [
      { eat: "Eggs, mackerel, beef liver, or B12 supplement (if on Metformin)", moderate: "Taking Metformin on an empty stomach", reason: "Prevents diabetic peripheral neuropathy and reduces gastrointestinal nausea." },
      { eat: "Take Amlodipine with plain water", moderate: "Grapefruit or grapefruit juice with Amlodipine", reason: "Grapefruit furanocoumarins inhibit CYP3A4, causing toxic spikes in blood pressure drug levels." },
      { eat: "Moderate hydration (2.5L water) when taking diuretics (HCTZ)", moderate: "Alcohol and heavy herbal concoctions combined with prescription drugs", reason: "Prevents acute kidney strain and dangerous hypotensive episodes." },
    ],
    actionableHabits: [
      "Metformin Timing: Take Metformin midway through your largest meal (e.g. Lunch with beans/soup) to eliminate stomach cramps.",
      "Annual B12 Check: If you have been on Metformin for > 12 months, ask your doctor to test serum B12 and homocysteine.",
      "Separate Herbs by 2 Hours: Keep traditional herbal teas (like Zobo or Moringa) 2 hours apart from pharmaceutical tablets.",
    ],
    scientificReference: "Mayo Clinic Clinical Pharmacology & BNF Guidelines",
    quiz: {
      question: "Which essential vitamin should long-term Metformin users monitor to prevent peripheral neuropathy?",
      options: [
        "Vitamin C",
        "Vitamin B12 (Cobalamin)",
        "Vitamin K2",
        "Vitamin A",
      ],
      correctIndex: 1,
      explanation: "Long-term Metformin therapy impairs ileal calcium-dependent absorption of Vitamin B12 in up to 30% of patients, necessitating dietary replenishment.",
    },
  },
];

const CULTURAL_MYTHS = [
  {
    id: "myth-garri",
    title: "Myth: 'Garri causes diabetes and must never be eaten again.'",
    verdict: "FALSE / CONTEXT-DEPENDENT",
    isFalse: true,
    reality:
      "Garri has a high glycemic index, but it is not an automatic cause of diabetes. When eaten as Eba with 2-3 cups of fiber-rich vegetable soup (Ewedu/Okra) and protein, blood glucose rises gradually. Portion control (1 small cup rather than 3 large balls) makes it fully manageable.",
    icon: "🥣",
  },
  {
    id: "myth-bitterleaf",
    title: "Myth: 'Bitter leaf juice completely cures diabetes, so I can stop my medication.'",
    verdict: "DANGEROUS MYTH",
    isFalse: true,
    reality:
      "Bitter leaf contains bioactive phytochemicals that modestly support insulin sensitivity, but it is an adjunctive dietary shield, NEVER a standalone cure or insulin replacement. Stopping prescribed medication can cause life-threatening diabetic ketoacidosis or organ damage.",
    icon: "🌿",
  },
  {
    id: "myth-palmoil",
    title: "Myth: 'Red palm oil is pure bad cholesterol that blocks your arteries.'",
    verdict: "MISUNDERSTOOD",
    isFalse: true,
    reality:
      "Unrefined virgin red palm oil contains 50% unsaturated fats, rich tocotrienols (Vitamin E), and carotenoids. The danger comes from *bleaching* palm oil at extreme temperatures until clear, which oxidizes lipids into inflammatory trans-fats.",
    icon: "🛢️",
  },
  {
    id: "myth-brownbread",
    title: "Myth: 'Supermarket brown bread is always healthy and low sugar.'",
    verdict: "FALSE",
    isFalse: true,
    reality:
      "Most commercial Nigerian brown breads are simply white refined flour colored with brown caramel dye and sweetened with sugar! Unless the label explicitly says '100% Whole Wheat / 100% Sprouted Spelt', the glycemic impact is identical to Agege bread.",
    icon: "🍞",
  },
];

const CLINICAL_CONSULT_PROMPTS = [
  {
    q: "Can I drink Zobo (Hibiscus) if I have High Blood Pressure?",
    a: "Yes! Fresh Hibiscus calyces contain natural polyphenols and organic acids that gently relax arterial blood vessels (similar to mild ACE inhibition). Key rule: Brew it unsweetened or with ginger, cloves, and lime—do NOT add cups of refined white sugar.",
    badge: "Cardiovascular Health",
    icon: "🌺",
  },
  {
    q: "What is the best swallow alternative for high blood sugar?",
    a: "Top choices: Oat swallow (rich in cholesterol-lowering beta-glucans), Unripe plantain flour (rich in resistant starch), or Guinea corn (Baba / Dawa). Pair with Okra or Ewedu for maximum glucose blunting.",
    badge: "Glycemic Control",
    icon: "🥣",
  },
  {
    q: "Which fruits are safe for pre-diabetes and insulin resistance?",
    a: "Focus on low-glycemic fruits: African Star Apple (Agbalumo/Udara), Guavas, Garden Eggs, Avocados, Berries, and small Green Apples. Enjoy whole with skin for fiber, and avoid drinking filtered fruit juices without pulp.",
    badge: "Fruit Nutrition",
    icon: "🥑",
  },
  {
    q: "How can I reduce sodium in Nigerian soups without losing taste?",
    a: "Use the 'Flavor Layering' method: Replace 2 bouillon cubes with 1 tablespoon of ground crayfish, 1 teaspoon of fermented locust beans (Iru/Dawadawa), freshly grated ginger, garlic, and dried scent leaf (Efirin/Nchuanwu).",
    badge: "Sodium Reduction",
    icon: "🧂",
  },
];

export default function Health() {
  const [showWearableSyncModal, setShowWearableSyncModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile } = useUser();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "goals" ? "goals" : "insights";
  const [healthSectionTab, setHealthSectionTab] = useState<"insights" | "goals">(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "goals" && healthSectionTab !== "goals") {
      setHealthSectionTab("goals");
    }
  }, [searchParams]);
  const [activeCategory, setActiveCategory] = useState<EducationalCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<EducationalArticle | null>(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);

  // Bookmarks & learned tracking
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("mealoptimizer_bookmarked_articles") || "[]");
    } catch {
      return [];
    }
  });

  const [learnedIds, setLearnedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("mealoptimizer_learned_articles") || "[]");
    } catch {
      return [];
    }
  });

  // Active quiz state inside modal
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Active expanded consult prompt
  const [expandedPromptIdx, setExpandedPromptIdx] = useState<number | null>(null);

  // Toggle bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = bookmarkedIds.includes(id)
      ? bookmarkedIds.filter((b) => b !== id)
      : [...bookmarkedIds, id];
    setBookmarkedIds(updated);
    localStorage.setItem("mealoptimizer_bookmarked_articles", JSON.stringify(updated));
    toast.success(bookmarkedIds.includes(id) ? "Removed from Saved" : "Saved to your Health Library 📚");
  };

  // Mark as learned
  const markAsLearned = (id: string) => {
    if (!learnedIds.includes(id)) {
      const updated = [...learnedIds, id];
      setLearnedIds(updated);
      localStorage.setItem("mealoptimizer_learned_articles", JSON.stringify(updated));
      toast.success("Lesson Completed! +25 Health XP Awarded 🎉");
    }
  };

  const handleOpenArticle = (article: EducationalArticle) => {
    setSelectedArticle(article);
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
    setShowArticleDialog(true);
  };

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return EDUCATIONAL_ARTICLES.filter((art) => {
      const matchesCategory = activeCategory === "all" || art.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.headline.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Check personalized recommendations based on profile
  const userCondition = (profile?.medicalCondition || "").toLowerCase();
  const personalizedArticles = useMemo(() => {
    if (!userCondition) return [];
    return EDUCATIONAL_ARTICLES.filter((art) =>
      art.recommendedFor?.some((cond) => userCondition.includes(cond) || cond === "all")
    );
  }, [userCondition]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28">
      {/* Header Bar */}
      <div className="bg-gradient-to-b from-[#A5DBDB] to-[#B8E5E5] px-4 sm:px-6 pt-9 pb-5 border-b border-teal-500/15">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1f7a8c] block">
              Clinical &amp; Evidence Hub
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {t("nav.health")} &amp; Knowledge 🩺
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Mascot gesture="wave" size={44} className="shrink-0 drop-shadow-xs" />
          </div>
        </div>

        {/* Personalized Health Greeting Card */}
        <div className="max-w-2xl mx-auto mt-3.5 bg-white/85 backdrop-blur-md rounded-2xl p-3.5 border border-teal-100/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-teal-50 text-[#1f7a8c] rounded-xl shrink-0">
              <Zap className="h-4 w-4 fill-current text-amber-500" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-gray-900 truncate">
                {profile?.name ? `Personalized for ${profile.name}` : "Clinical Health Insights"}
              </div>
              <div className="text-[11px] text-gray-600 truncate">
                {profile?.bloodPressure
                  ? `BP: ${profile.bloodPressure} mmHg • BMI: ${profile.bmi || "23.4"}`
                  : "Science-backed nutrition tailored to West African biology"}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/biometrics")}
            className="px-3 py-1.5 bg-[#1f7a8c] hover:bg-[#1a6273] text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-2xs active:scale-95 transition-all"
          >
            Vitals
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto mt-4 space-y-6">
        {/* ============================================================ */}
        {/* 0. NEW: METABOLIC FOOD CALCULATORS HERO LAUNCHER             */}
        {/* ============================================================ */}
        <div
          onClick={() => {
            navigate("/calculators");
          }}
          className="glass-card-teal text-white rounded-3xl p-4 sm:p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group border border-white/30"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white text-2xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                🥣
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                    Interactive Tools
                  </span>
                  <span className="text-[11px] font-black text-teal-100">
                    Swallow • Sodium • Sequence
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-1 leading-tight">
                  Metabolic Food Calculators 🧮
                </h3>
                <p className="text-[11px] text-teal-100/90 font-medium truncate mt-0.5">
                  Calculate carb swaps, dilute soup sodium &amp; sequence meals
                </p>
              </div>
            </div>

            <div className="p-2 bg-white/10 group-hover:bg-white/20 rounded-2xl text-white transition-all shrink-0 ml-2">
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 📄 14-DAY DOCTOR CLINICAL PDF REPORT BANNER (FOR PAID CONSUMERS) */}
        <div
          onClick={() => navigate("/health-report")}
          className="glass-card-teal rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-white/30 relative overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                📄
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                    Doctor PDF Report
                  </span>
                  <span className="text-[11px] font-bold text-teal-100">
                    14-Day Clinical Chart
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-1 leading-tight">
                  Download Doctor Clinical Report 🩺
                </h3>
                <p className="text-[11px] text-teal-100/90 font-medium truncate mt-0.5">
                  Generate a certified PDF summary of your meals &amp; blood sugar to share with your doctor
                </p>
              </div>
            </div>

            <div className="p-2 bg-white/15 group-hover:bg-white/25 rounded-2xl text-white transition-all shrink-0 ml-2 border border-white/20">
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* 🩸 1-TAP HARDWARE WEARABLE & CGM TELEMETRY STATION */}
        <div className="bg-gradient-to-r from-[#0a232a] via-[#126778] to-[#0d9488] rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-teal-400/30 flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              🩸
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                  Live Sensor Sync
                </span>
                <span className="text-[11px] font-bold text-teal-200">
                  Dexcom • Libre • HealthKit
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-1 leading-tight">
                Connect Health Devices &amp; Sensors ⌚
              </h3>
              <p className="text-[11px] text-teal-100/90 font-medium truncate mt-0.5">
                Connect your Apple Watch, Dexcom, or Libre sensor for live health updates
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWearableSyncModal(true)}
            className="px-4 py-2.5 bg-white hover:bg-teal-50 text-[#126778] font-black text-xs rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center gap-1"
          >
            <span>Pair Sensor</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 🧬 PRECISION MICRONUTRIENT SHIELD (DIASPORA D3 & B12 ENGINE) */}
        <MicronutrientShieldCard />

        {/* Modal for Wearable Sync */}
        <WearableSyncModal
          isOpen={showWearableSyncModal}
          onClose={() => setShowWearableSyncModal(false)}
        />

        {/* ============================================================ */}
        {/* 1. HEALTH TRACKERS (8-Grid Quick Portal)                     */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
              {t("health.trackers")}
            </h2>
            <span className="text-[11px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              8 Active Portals
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { tKey: "health.tracker.vault", icon: Shield, gradient: "from-purple-500 to-indigo-600", route: "/medical-vault", label: "Medical Vault" },
              { tKey: "health.tracker.hydration", icon: Droplet, gradient: "from-blue-500 to-cyan-600", route: "/hydration", label: "Hydration" },
              { tKey: "health.tracker.sleep", icon: Moon, gradient: "from-indigo-600 to-purple-700", route: "/sleep", label: "Sleep" },
              { tKey: "health.tracker.medication", icon: Pill, gradient: "from-emerald-500 to-teal-600", route: "/medications", label: "Medications" },
              { tKey: "health.tracker.workout", icon: Dumbbell, gradient: "from-orange-500 to-amber-600", route: "/workout", label: "Workouts" },
              { tKey: "health.tracker.fasting", icon: Clock, gradient: "from-purple-600 to-pink-600", route: "/fasting", label: "Fasting" },
              { tKey: "health.tracker.symptoms", icon: AlertCircle, gradient: "from-rose-500 to-red-600", route: "/symptoms", label: "Symptoms" },
              { tKey: "health.tracker.report", icon: FileText, gradient: "from-teal-500 to-cyan-600", route: "/health-report", label: "Clinical Report" },
            ].map(({ icon: Icon, gradient, route, label }) => (
              <button
                key={route}
                onClick={() => navigate(route)}
                className="neu-raised-sm rounded-2xl p-3.5 flex flex-col items-center justify-center gap-2 hover:shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer group border border-white/60 dark:border-white/5"
              >
                <div className={`bg-gradient-to-br ${gradient} rounded-xl p-2.5 text-white shadow-2xs group-hover:rotate-3 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-gray-800 text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. DYNAMIC HEALTH EDUCATION HUB (10X Clinical Upgrade)       */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-teal-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-[#1f7a8c] rounded-xl">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900">
                  Health Education &amp; Science 📚
                </h2>
                <p className="text-xs text-gray-500">
                  Evidence-based nutrition guides for African dietary wellness
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                {learnedIds.length}/{EDUCATIONAL_ARTICLES.length} Learned
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative my-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, herbs, biomarkers, food science..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#1f7a8c] transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "all", label: "⚡ All Guides" },
              { id: "sugar", label: "🩺 Blood Sugar" },
              { id: "heart", label: "❤️ Heart & BP" },
              { id: "herbs", label: "🌿 Super-Herbs" },
              { id: "metabolism", label: "🥑 Gut & PCOS" },
              { id: "drugs", label: "💊 Drug Safety" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as EducationalCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#1f7a8c] text-white shadow-2xs"
                    : "bg-slate-100 text-gray-600 hover:bg-slate-200/70"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Personalized Recommendation Banner (if user has active conditions) */}
          {personalizedArticles.length > 0 && activeCategory === "all" && !searchQuery && (
            <div className="my-3 p-3 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 border border-teal-200 rounded-2xl flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-teal-800 block">
                  Profile Matched
                </span>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {personalizedArticles.length} guides specifically tailored to your health profile
                </p>
              </div>
            </div>
          )}

          {/* Article List Cards */}
          <div className="space-y-3 mt-3">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Info className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-bold">No clinical guides match "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-2 text-xs text-[#1f7a8c] font-bold underline cursor-pointer"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              filteredArticles.map((article) => {
                const isBookmarked = bookmarkedIds.includes(article.id);
                const isLearned = learnedIds.includes(article.id);

                return (
                  <div
                    key={article.id}
                    onClick={() => handleOpenArticle(article)}
                    className="p-4 bg-slate-50 hover:bg-teal-50/40 border border-slate-200/80 hover:border-teal-300 rounded-2xl transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-3xl shrink-0 p-1.5 bg-white rounded-2xl shadow-2xs">
                          {article.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${article.badgeBg} ${article.color}`}>
                              {article.categoryLabel}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              ⏱️ {article.readTime}
                            </span>
                            {isLearned && (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Check size={10} /> Learned
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#1f7a8c] transition-colors leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                            {article.headline}
                          </p>

                          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-bold text-teal-800 bg-teal-50/80 px-2 py-1 rounded-xl w-fit border border-teal-100">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            <span>Clinical Impact: {article.clinicalImpact}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(article.id, e)}
                        className="p-2 text-gray-400 hover:text-[#1f7a8c] shrink-0 cursor-pointer transition-colors"
                        title={isBookmarked ? "Remove bookmark" : "Save article"}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-5 w-5 text-[#1f7a8c] fill-current" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. INTERACTIVE CULTURAL FOOD MYTH BUSTERS                    */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-yellow-50/50 rounded-3xl p-5 border border-amber-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-2xl">💡</span>
            <div>
              <h2 className="text-sm font-black text-amber-950 uppercase tracking-wider">
                Cultural Food Myth Busters
              </h2>
              <p className="text-xs text-amber-800">
                Separating facts from kitchen myths in West African nutrition
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CULTURAL_MYTHS.map((myth) => (
              <div
                key={myth.id}
                className="bg-white/90 rounded-2xl p-4 border border-amber-200/70 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{myth.icon}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full border border-rose-200">
                      {myth.verdict}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-gray-900 mb-1.5 leading-snug">
                    {myth.title}
                  </h3>
                  <p className="text-[11px] text-gray-700 leading-relaxed">
                    {myth.reality}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. ASK AVO: QUICK CLINICAL QUESTIONS                         */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-5 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 bg-teal-50 text-[#1f7a8c] rounded-xl">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">
                Quick Clinical Consult with Avo 💬
              </h2>
              <p className="text-xs text-gray-500">
                Tap common medical nutrition questions for instant answers
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {CLINICAL_CONSULT_PROMPTS.map((prompt, idx) => {
              const isExpanded = expandedPromptIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setExpandedPromptIdx(isExpanded ? null : idx)}
                  className="p-3 bg-slate-50 hover:bg-teal-50/50 border border-slate-200/70 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{prompt.icon}</span>
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {prompt.q}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-bold">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 text-xs text-gray-700 leading-relaxed space-y-2">
                      <p>{prompt.a}</p>
                      <span className="inline-block text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">
                        🏷️ {prompt.badge}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. MY BIODATA SHORTCUTS (Permanent Sync Links)               */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-br from-white via-[#F0F9FA] to-[#E0F2F4] rounded-3xl shadow-sm p-5 border border-teal-100">
          <h2 className="text-center text-xs font-extrabold text-[#1f7a8c] uppercase tracking-wider mb-4">
            {t("health.myHealthProfile")}
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {[
              { icon: MapPin, label: t("health.link.location"), route: "/location" },
              { icon: Scale, label: t("health.link.weight"), route: "/weight" },
              { icon: Calendar, label: t("health.link.age"), route: "/age" },
              { icon: Pill, label: t("health.link.drugs"), route: "/medications" },
              { icon: Stethoscope, label: t("health.link.condition"), route: "/medical-condition" },
            ].map(({ icon: Icon, label, route }) => (
              <button
                key={route}
                onClick={() => navigate(route)}
                className="flex flex-col items-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              >
                <div className="bg-[#1f7a8c] group-hover:bg-[#1a6273] rounded-2xl p-2.5 mb-1.5 shadow-2xs text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] text-gray-700 font-semibold text-center leading-tight truncate w-full">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />

      {/* ============================================================ */}
      {/* 6. CLINICAL ARTICLE DEEP DIVE MODAL (10X IN-FRAME)          */}
      {/* ============================================================ */}
      <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] p-5 sm:p-6 flex flex-col rounded-3xl">
          {selectedArticle && (
            <>
              <DialogHeader className="pb-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${selectedArticle.badgeBg} ${selectedArticle.color}`}>
                    {selectedArticle.categoryLabel}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {selectedArticle.readTime}
                  </span>
                </div>
                <DialogTitle className="text-lg font-black text-gray-900 leading-tight">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-teal-800 font-bold flex items-center gap-1 mt-0.5">
                  <Sparkles size={12} className="text-amber-500" />
                  {selectedArticle.clinicalImpact}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto overscroll-contain space-y-4 py-2 pr-1 text-xs">
                {/* Executive Summary */}
                <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-100 text-gray-800 leading-relaxed">
                  <p>{selectedArticle.summary}</p>
                </div>

                {/* Key Biomarker Targets */}
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-[#1f7a8c]" />
                    Clinical Biomarker Targets
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedArticle.keyBiomarkers.map((bio, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-gray-900 block">{bio.name}</span>
                          <span className="text-[10px] text-gray-500">{bio.note}</span>
                        </div>
                        <span className="text-[11px] font-black text-teal-800 bg-white px-2 py-1 rounded-lg border border-teal-100 shrink-0">
                          {bio.target}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eat This vs Moderate This Matrix */}
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-[#1f7a8c]" />
                    Traditional Food Optimization Matrix
                  </h4>
                  <div className="space-y-2">
                    {selectedArticle.eatThisVsModerate.map((row, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1.5">
                        <div className="flex items-start gap-2 text-emerald-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Prioritize: </span>
                            <span>{row.eat}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-rose-800">
                          <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Moderate: </span>
                            <span>{row.moderate}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 pl-6 italic">
                          Why: {row.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 Actionable Daily Micro-Habits */}
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    3 Actionable Daily Micro-Habits
                  </h4>
                  <div className="space-y-2">
                    {selectedArticle.actionableHabits.map((habit, idx) => (
                      <div key={idx} className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-950 flex items-start gap-2">
                        <span className="font-black text-amber-800 shrink-0">{idx + 1}.</span>
                        <span className="leading-snug">{habit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive 1-Question Science Quiz */}
                <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-purple-900 font-black mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span>Quick Knowledge Check (+25 XP)</span>
                  </div>
                  <p className="font-bold text-gray-900 mb-2">
                    {selectedArticle.quiz.question}
                  </p>

                  <div className="space-y-1.5">
                    {selectedArticle.quiz.options.map((option, optIdx) => {
                      const isSelected = selectedQuizAnswer === optIdx;
                      const isCorrect = optIdx === selectedArticle.quiz.correctIndex;

                      let btnStyle = "bg-white border-slate-200 text-gray-700";
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-900 font-bold";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "bg-rose-100 border-rose-500 text-rose-900";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-teal-100 border-[#1f7a8c] text-[#1f7a8c] font-bold";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            if (!quizSubmitted) setSelectedQuizAnswer(optIdx);
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {quizSubmitted && isCorrect && <Check size={14} className="text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      onClick={() => {
                        if (selectedQuizAnswer !== null) {
                          setQuizSubmitted(true);
                          if (selectedQuizAnswer === selectedArticle.quiz.correctIndex) {
                            markAsLearned(selectedArticle.id);
                          }
                        } else {
                          toast.error("Please select an answer first!");
                        }
                      }}
                      className="mt-2.5 w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                    >
                      Submit Answer 🎯
                    </button>
                  ) : (
                    <div className="mt-2.5 p-2 bg-white rounded-xl border border-purple-200 text-[11px] text-purple-900 leading-snug">
                      <strong>Scientific Explanation:</strong> {selectedArticle.quiz.explanation}
                    </div>
                  )}
                </div>

                {/* Scientific Reference */}
                <div className="text-[10px] text-gray-400 border-t border-slate-200 pt-2 flex items-center gap-1">
                  <BookOpen size={12} />
                  <span>Clinical Source: {selectedArticle.scientificReference}</span>
                </div>
              </div>

              {/* Sticky In-Frame Action Footer */}
              <div className="pt-3 border-t border-gray-100 flex gap-2.5 mt-auto shrink-0">
                <button
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                >
                  <Bookmark size={14} />
                  <span>{bookmarkedIds.includes(selectedArticle.id) ? "Saved" : "Save"}</span>
                </button>
                <button
                  onClick={() => {
                    markAsLearned(selectedArticle.id);
                    setShowArticleDialog(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:opacity-95 text-white rounded-xl text-xs font-bold py-2.5 cursor-pointer shadow-2xs"
                >
                  Mark as Completed &amp; Close ✓
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
