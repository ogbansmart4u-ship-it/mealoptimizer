import { useState, useMemo, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Flame,
  HeartPulse,
  Brain,
  Leaf,
  Droplets,
  Trophy,
  Share2,
  Clock,
  Zap,
  Activity,
  ShieldCheck,
  Award,
  RefreshCw,
  Sliders,
  TrendingDown,
  Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { toast } from "sonner";
import { useUser } from "../contexts/UserContext";

export interface AcademyLesson {
  id: string;
  title: string;
  category: "Pregnancy Health" | "Prostate Health" | "Arthritis & Joints" | "Glucose Science" | "Heart & BP" | "Gut & Fiber" | "Cooking Hacks";
  readTime: string;
  icon: any;
  headline: string;
  storySlides: string[];
  takeaway: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface TherapeuticMeal {
  id: string;
  mealType: "Breakfast" | "Lunch" | "Dinner";
  dishName: string;
  emoji: string;
  calories: number;
  carbs: number;
  protein: number;
  keyNutrientBadge: string;
  whyItWorks: string;
}

export const CATEGORY_MEAL_PROTOCOLS: Record<string, TherapeuticMeal[]> = {
  "Pregnancy Health": [
    {
      id: "preg-1",
      mealType: "Breakfast",
      dishName: "Sprouted Beans (Akara) & Millet Pap with Boiled Egg",
      emoji: "🫘",
      calories: 340,
      carbs: 38,
      protein: 18,
      keyNutrientBadge: "Folate & Choline Boost 🤰",
      whyItWorks: "Sprouted beans supply bioavailable folate (B9) for fetal neural development; boiled egg adds choline without causing rapid glucose surges."
    },
    {
      id: "preg-2",
      mealType: "Lunch",
      dishName: "Plantain-Oat Fufu with Rich Ugwu Greens & Tilapia Fish",
      emoji: "🍲",
      calories: 420,
      carbs: 44,
      protein: 32,
      keyNutrientBadge: "Gestational Spike Buffer 🛡️",
      whyItWorks: "Ugwu leaves provide non-heme iron and magnesium; Plantain-Oat swallow releases slow steady glucose to prevent gestational diabetes spikes."
    },
    {
      id: "preg-3",
      mealType: "Dinner",
      dishName: "Steamed Fresh Fish Stew with Extra Sliced Carrots & Green Beans",
      emoji: "🐟",
      calories: 310,
      carbs: 22,
      protein: 28,
      keyNutrientBadge: "Preeclampsia Sodium Cap 🧂",
      whyItWorks: "Seasoned with ginger, garlic, and fresh locust beans (Iru) keeping sodium under 1,400mg to protect maternal blood pressure."
    }
  ],
  "Prostate Health": [
    {
      id: "prost-1",
      mealType: "Breakfast",
      dishName: "Fonio Supergrain Porridge with Crushed Pumpkin Seeds (Egusi)",
      emoji: "🌾",
      calories: 320,
      carbs: 36,
      protein: 16,
      keyNutrientBadge: "Zinc & Phytosterol Shield 🩺",
      whyItWorks: "Pumpkin seeds are dense in zinc and beta-sitosterol, which support healthy 5-alpha reductase inhibition and prostate cellular health in men 40+."
    },
    {
      id: "prost-2",
      mealType: "Lunch",
      dishName: "Simmered Tomato & Olive Oil Stew with Titus (Mackerel) & Cauli-Yam",
      emoji: "🍲",
      calories: 460,
      carbs: 28,
      protein: 38,
      keyNutrientBadge: "400% Bioavailable Lycopene 🍅",
      whyItWorks: "Simmering tomatoes in healthy oils unlocks fat-soluble Lycopene that concentrates directly in prostate tissue to combat oxidative stress."
    },
    {
      id: "prost-3",
      mealType: "Dinner",
      dishName: "Steamed Cabbage & Mushroom Soup with Lean Grilled Chicken",
      emoji: "🥬",
      calories: 290,
      carbs: 18,
      protein: 34,
      keyNutrientBadge: "Sulforaphane Cellular Detox 🌿",
      whyItWorks: "Cruciferous cabbage contains glucosinolates and indole-3-carbinol, aiding prostate tissue detoxification."
    }
  ],
  "Arthritis & Joints": [
    {
      id: "arth-1",
      mealType: "Breakfast",
      dishName: "Golden Ginger-Turmeric Spiced Tea with Scrambled Eggs & Avocado",
      emoji: "🥑",
      calories: 310,
      carbs: 8,
      protein: 18,
      keyNutrientBadge: "Natural COX-2 Inhibition 🦴",
      whyItWorks: "Gingerols and curcumin naturally inhibit pro-inflammatory prostaglandins and IL-6 cytokines, relieving morning joint stiffness."
    },
    {
      id: "arth-2",
      mealType: "Lunch",
      dishName: "Wild Titus (Mackerel) Pepper Soup with Boiled Unripe Plantain",
      emoji: "🍲",
      calories: 390,
      carbs: 32,
      protein: 30,
      keyNutrientBadge: "Omega-3 Cartilage Lubricant ⚡",
      whyItWorks: "Mackerel provides high-dose EPA/DHA fatty acids to lubricate synovial joint fluid; unripe plantain is low-purine to prevent gout flares."
    },
    {
      id: "arth-3",
      mealType: "Dinner",
      dishName: "Locust Bean (Iru) Okra Soup with Steamed Cod & Leafy Waterleaf",
      emoji: "🥣",
      calories: 280,
      carbs: 14,
      protein: 26,
      keyNutrientBadge: "Uric Acid Renal Flush 💧",
      whyItWorks: "Okra mucilage and fermented Iru support gut microbial barriers while keeping purines minimal for pain-free joint mobility."
    }
  ],
  "Glucose Science": [
    {
      id: "glu-1",
      mealType: "Breakfast",
      dishName: "Steamed Moi Moi (Bean Pudding) with Avocado & 1 Boiled Egg",
      emoji: "🫘",
      calories: 330,
      carbs: 26,
      protein: 20,
      keyNutrientBadge: "Zero Rapid Spikes 🩸",
      whyItWorks: "High plant fiber and protein slow gastric emptying, eliminating the sharp 2-hour morning glucose surge."
    },
    {
      id: "glu-2",
      mealType: "Lunch",
      dishName: "Plantain-Oat Swallow with Fresh Okra Soup & Grilled Goat Meat",
      emoji: "🍲",
      calories: 430,
      carbs: 42,
      protein: 34,
      keyNutrientBadge: "Beta-Glucan Gel Matrix 🥣",
      whyItWorks: "Soluble beta-glucans trap dietary glucose, extending starch digestion into a sustained 75-minute metabolic plateau."
    },
    {
      id: "glu-3",
      mealType: "Dinner",
      dishName: "Efo Riro Greens with Peppered Titus Fish & 1/2 Cooled Brown Rice",
      emoji: "🥬",
      calories: 360,
      carbs: 28,
      protein: 30,
      keyNutrientBadge: "Resistant Starch Retrogradation 🍠",
      whyItWorks: "Cooled rice forms Type-3 resistant starch that feeds healthy colon bacteria instead of spiking blood sugar."
    }
  ],
  "Heart & BP": [
    {
      id: "ht-1",
      mealType: "Breakfast",
      dishName: "Steel-Cut Oats with Cinnamon, Chia Seeds & Unsweetened Zobo",
      emoji: "🌺",
      calories: 290,
      carbs: 36,
      protein: 12,
      keyNutrientBadge: "Arterial Relaxation (Zobo) ❤️",
      whyItWorks: "Hibiscus anthocyanins act as natural ACE inhibitors, gently dilating blood vessels with zero added sodium."
    },
    {
      id: "ht-2",
      mealType: "Lunch",
      dishName: "Fresh Mackerel Soup with Ugwu Greens & Boiled Sweet Potato",
      emoji: "🍲",
      calories: 410,
      carbs: 38,
      protein: 32,
      keyNutrientBadge: "2:1 Potassium-to-Sodium Ratio ⚖️",
      whyItWorks: "High natural potassium from Ugwu greens prompts kidneys to excrete excess dietary sodium."
    },
    {
      id: "ht-3",
      mealType: "Dinner",
      dishName: "Grilled Chicken Suya with Sliced Fresh Onions, Tomatoes & Cabbage",
      emoji: "🍢",
      calories: 320,
      carbs: 14,
      protein: 36,
      keyNutrientBadge: "Nitric Oxide Vasodilation 🧅",
      whyItWorks: "Raw allium compounds (onions/garlic) boost nitric oxide for smooth arterial endothelial function."
    }
  ],
  "Gut & Fiber": [
    {
      id: "gut-1",
      mealType: "Breakfast",
      dishName: "Fermented Ogi / Pap with Ground Fluted Pumpkin Seeds (Ugwu)",
      emoji: "🥣",
      calories: 280,
      carbs: 34,
      protein: 12,
      keyNutrientBadge: "Probiotic Microbial Fuel 🦠",
      whyItWorks: "Traditional lactic acid fermentation unlocks gut-friendly probiotics that reinforce intestinal tight junctions."
    },
    {
      id: "gut-2",
      mealType: "Lunch",
      dishName: "Edikang Ikong (Ugu & Waterleaf) with Snails & Oat Fufu",
      emoji: "🍲",
      calories: 410,
      carbs: 36,
      protein: 34,
      keyNutrientBadge: "Short-Chain Fatty Acid Generator 🌿",
      whyItWorks: "Ultra-high prebiotic fiber produces butyrate in the colon to reduce systemic gut inflammation."
    },
    {
      id: "gut-3",
      mealType: "Dinner",
      dishName: "Garden Egg Stew with Boiled Plantain & Grilled Tilapia",
      emoji: "🍆",
      calories: 320,
      carbs: 28,
      protein: 26,
      keyNutrientBadge: "Digestive Motility & Polyphenols 🥗",
      whyItWorks: "Garden egg soluble fiber accelerates sluggish digestion and eliminates toxic bile reabsorption."
    }
  ]
};

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: "pregnancy-gestational-shield",
    title: "Eating for Pregnancy & Gestational Shield",
    category: "Pregnancy Health",
    readTime: "60 sec",
    icon: HeartPulse,
    headline: "Protecting maternal insulin sensitivity & preventing preeclampsia with traditional greens",
    storySlides: [
      "During pregnancy, placenta hormones naturally increase insulin resistance to ensure adequate glucose reaches the growing baby. In mothers genetically predisposed to diabetes, this can trigger Gestational Diabetes Mellitus (GDM).",
      "Traditional African greens like Fluted Pumpkin (Ugwu), Waterleaf, and Malabar Spinach are nature's maternal superfoods: they provide massive bioavailable Folate (Vitamin B9) for neural tube development, non-heme iron, and magnesium.",
      "To prevent dangerous post-prandial spikes, pregnant mothers should pair moderate swallows (like Plantain-Oat Fufu) with fiber and protein first.",
      "Keeping stew salt under 1,500mg by seasoning with fresh locust beans (Iru) and ginger significantly reduces the risk of pregnancy-induced hypertension and preeclampsia! 🤰✨",
    ],
    takeaway: "Load your plate with Ugwu, boiled eggs, and Plantain-Oat swallow to supply crucial folate while keeping gestational blood sugar perfectly balanced.",
    quiz: {
      question: "Which traditional leafy green provides vital folate and iron for maternal & fetal health?",
      options: ["Fluted Pumpkin (Ugwu)", "White Bread", "Cassava Starch"],
      correctIndex: 0,
      explanation: "Correct! Ugwu is exceptionally rich in folate, iron, and antioxidant polyphenols essential for healthy pregnancy.",
    },
  },
  {
    id: "prostate-lycopene-zinc",
    title: "Eating for Prostate Health & PSA Balance",
    category: "Prostate Health",
    readTime: "60 sec",
    icon: ShieldCheck,
    headline: "How cooked tomato stews and pumpkin seeds (Egusi) protect prostate cell integrity in men 40+",
    storySlides: [
      "Benign Prostatic Hyperplasia (BPH) and elevated PSA affect over 60% of Black men over age 50, driven by chronic inflammation and dihydrotestosterone (DHT) binding.",
      "Cooked Tomato Stew is one of the most potent prostate medicines on earth. Cooking tomatoes in healthy oils (like extra virgin olive or light unrefined palm oil) increases the bioavailability of Lycopene by over 400% compared to raw tomatoes!",
      "Lycopene is a powerful carotenoid that concentrates directly in prostate tissue, neutralizing free radicals and suppressing prostate cell proliferation.",
      "Pairing your stew with zinc-dense Pumpkin Seeds (Egusi) and cruciferous cabbage provides the building blocks for healthy testosterone balance and urinary flow. 🩺",
    ],
    takeaway: "Cooked tomato stew with healthy oils provides bioavailable lycopene that concentrates directly in prostate tissue to reduce inflammation.",
    quiz: {
      question: "Why does cooking tomato stew with healthy oil boost its prostate benefits?",
      options: [
        "It increases lycopene bioavailability by over 400%",
        "It burns away all vitamins",
        "It converts starch into protein",
      ],
      correctIndex: 0,
      explanation: "Spot on! Lycopene is fat-soluble; simmering tomatoes with healthy oils unlocks maximum prostate-protective absorption.",
    },
  },
  {
    id: "arthritis-anti-inflammatory",
    title: "Eating for Arthritis & Joint Mobility",
    category: "Arthritis & Joints",
    readTime: "60 sec",
    icon: Activity,
    headline: "Targeting joint cartilage breakdown and gout flares with African anti-inflammatory botanicals",
    storySlides: [
      "Osteoarthritis and Gout flares are driven by systemic pro-inflammatory cytokines (IL-6, TNF-alpha) and uric acid crystallization in joint synovial fluid.",
      "Traditional African spices—specifically Ginger (Atale), Garlic (Ayu), Turmeric, and fermented Locust Beans (Iru)—contain gingerols and allicin that naturally inhibit the inflammatory COX-2 and NF-kB pathways.",
      "For Gout sufferers, reducing high-purine organ meats (shaki, liver, cow foot) and staying well-hydrated with fresh water flushes uric acid out through the kidneys.",
      "Adding Omega-3 rich Titus (Mackerel) fish twice a week lubricates joint cartilage and cuts morning stiffness by up to 40%! 🦴⚡",
    ],
    takeaway: "Season your stews with generous fresh ginger, garlic, and turmeric while choosing oily fish like Titus mackerel to naturally calm joint pain.",
    quiz: {
      question: "What natural compound in fresh Ginger and Garlic helps soothe joint arthritis pain?",
      options: [
        "Bioactive Gingerols & Allicin that inhibit inflammatory COX-2 pathways",
        "Refined white sugar",
        "Sodium chloride",
      ],
      correctIndex: 0,
      explanation: "Exactly! Gingerols and allicin act as natural, stomach-friendly anti-inflammatory agents for joint mobility.",
    },
  },
  {
    id: "resistant-starch",
    title: "The Resistant Starch Hack",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Flame,
    headline: "How cooling your Yam or Rice lowers the glycemic spike by 35%",
    storySlides: [
      "When starches like White Rice, Boiled Yam, or Potatoes are freshly cooked, their amylose molecules are easily broken down by digestive enzymes into glucose, causing a rapid blood sugar spike.",
      "However, when cooked starch is cooled in the fridge (even just for 12–24 hours), a biochemical process called RETROGRADATION occurs. The starch crystallizes into 'Resistant Starch Type 3'.",
      "Resistant starch cannot be digested in your small intestine! Instead, it travels to your colon to feed healthy microbiome bacteria, producing short-chain fatty acids (SCFAs) that improve insulin sensitivity.",
      "The best part? You can REHEAT the cooled yam or rice before eating—the resistant starch structure stays locked in! 🍠✨",
    ],
    takeaway: "Cook your yam or rice in batches, cool overnight, and reheat. Same authentic taste, but with a 35% lower blood sugar spike!",
    quiz: {
      question: "Does reheating cooled yam destroy the beneficial resistant starch?",
      options: [
        "Yes, heat turns it back into rapid sugar",
        "No, the resistant starch structure remains stable",
        "Only if you add palm oil",
      ],
      correctIndex: 1,
      explanation: "Correct! Reheating does not reverse retrograded resistant starch. You get all the gut and glucose benefits with a warm meal!",
    },
  },
  {
    id: "bitterleaf-insulin",
    title: "The Bitterleaf Insulin Miracle",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Leaf,
    headline: "Why Onugbu / Bitterleaf soup sensitizes cellular insulin receptors",
    storySlides: [
      "Bitterleaf (Vernonia amygdalina) has been used in West African herbal medicine for centuries. Modern molecular pharmacology now explains exactly why it works.",
      "Bitterleaf is dense in Vernodalin, Luteolin, and active sesquiterpene lactones. These bioactive phytochemicals activate AMPK (AMP-activated protein kinase) in your liver and muscles.",
      "AMPK is your body's master metabolic switch—often called 'exercise in a bottle'. When AMPK is activated, your muscle cells pull glucose directly out of your bloodstream without needing extra insulin.",
      "Drinking squeezed bitterleaf water or enjoying fresh Onugbu soup with lean fish provides a natural, food-based glycemic shield! 🌿",
    ],
    takeaway: "Bitterleaf compounds activate AMPK, acting like a natural insulin sensitizer to pull sugar safely into your muscle cells.",
    quiz: {
      question: "What master metabolic enzyme does Bitterleaf activate to lower blood glucose?",
      options: ["AMPK (AMP-activated protein kinase)", "Amylase", "Lipase"],
      correctIndex: 0,
      explanation: "Spot on! AMPK activation helps your muscle cells absorb glucose directly, taking strain off your pancreas.",
    },
  },
  {
    id: "swallow-velocity-index",
    title: "Swallow Glucose Velocity (GVI)",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Activity,
    headline: "Why Pounded Yam spikes in 20 mins while Oat Swallow plateaus over 75 mins",
    storySlides: [
      "Not all carbohydrates are digested at the same velocity. The 'Glucose Velocity Index' measures how fast glucose enters the bloodstream per gram of swallowed food.",
      "Pounded Yam and Garri have a high GVI (>80)—their pure starch chains hydrolyze rapidly in the stomach, creating a sharp 40–60 mg/dL glucose excursion within 25 minutes.",
      "In contrast, Oat Swallow or Plantain Flour combined with Okra contains viscous soluble beta-glucan fibers that create an intestinal gel barrier.",
      "This gel barrier stretches glucose absorption over 75–90 minutes, turning a dangerous spike into a gentle, sustained metabolic plateau! 🥣",
    ],
    takeaway: "Choose high-viscosity swallows (Oat, Plantain, or Okra-blended) to slow glucose velocity and eliminate post-meal fatigue.",
    quiz: {
      question: "How does soluble fiber in Oat and Okra swallows prevent a rapid blood sugar spike?",
      options: [
        "By neutralizing stomach acid completely",
        "By forming an intestinal gel barrier that slows starch hydrolysis",
        "By turning carbohydrates into pure protein",
      ],
      correctIndex: 1,
      explanation: "Correct! The viscous gel physically delays enzymatic breakdown, smoothing out the post-meal glucose curve.",
    },
  },
  {
    id: "zobo-blood-pressure",
    title: "Zobo (Hibiscus) & Blood Pressure",
    category: "Heart & BP",
    readTime: "60 sec",
    icon: HeartPulse,
    headline: "Clinical evidence behind unsweetened Hibiscus Sabdariffa tea",
    storySlides: [
      "Zobo (Hibiscus sabdariffa) is more than a delicious party drink—it is a clinically validated cardiovascular powerhouse.",
      "Hibiscus calyces are rich in Anthocyanins and Polyphenols that act as natural ACE (Angiotensin-Converting Enzyme) inhibitors, gently dilating blood vessels.",
      "In a landmark randomized clinical trial published in the Journal of Nutrition, drinking 2 cups of unsweetened hibiscus tea daily lowered systolic blood pressure by an average of 7.2 mmHg within 6 weeks.",
      "The critical rule: Brew your Zobo with ginger, cloves (kanafuru), and citrus—avoid refined sugar to preserve its therapeutic heart benefits! 🌺",
    ],
    takeaway: "Unsweetened Zobo with ginger and cloves is a natural, evidence-backed beverage that supports arterial relaxation and healthy blood pressure.",
    quiz: {
      question: "How should Zobo be brewed to maximize its blood pressure benefits?",
      options: [
        "With 4 scoops of white sugar",
        "Unsweetened with natural ginger and cloves",
        "Boiled for 4 hours until syrupy",
      ],
      correctIndex: 1,
      explanation: "Correct! Keeping Zobo sugar-free ensures its anthocyanins protect your blood vessels without raising insulin or triglycerides.",
    },
  },
  {
    id: "okra-mucilage-trap",
    title: "Okra (Ila) & The Glucose Trap",
    category: "Gut & Fiber",
    readTime: "60 sec",
    icon: Leaf,
    headline: "How water-soluble mucilage fiber forms a gel matrix that traps dietary sugars",
    storySlides: [
      "The characteristic 'draw' or viscous texture in Okra (Ila / Okro) soup is caused by a unique polysaccharide mucilage composed of rhamnose, galactose, and galacturonic acid.",
      "Inside your digestive tract, this mucilage absorbs water and forms a thick, gelatinous protective mesh over the microvilli of your small intestine.",
      "This gel matrix physically slows the rate at which carbohydrates and cholesterol are absorbed into your bloodstream.",
      "Clinical studies demonstrate that adding fresh sliced okra to a high-carb meal reduces peak post-meal glucose by up to 28%! 🍲",
    ],
    takeaway: "Okra's natural mucilage forms a gel in your gut that physically traps and slows sugar absorption, acting as an edible spike shield.",
    quiz: {
      question: "How does Okra mucilage lower post-meal blood sugar?",
      options: [
        "By forming a gel matrix in the gut that slows carb absorption",
        "By burning calories in the stomach",
        "By destroying digestive acid",
      ],
      correctIndex: 0,
      explanation: "Exactly! The soluble gel creates a physical barrier that slows glucose entry into your blood.",
    },
  },
  {
    id: "sodium-potassium-balance",
    title: "Seasoning Cubes & Potassium Buffering",
    category: "Heart & BP",
    readTime: "60 sec",
    icon: HeartPulse,
    headline: "How to counter high-sodium stock cubes with potassium-rich African sides",
    storySlides: [
      "Most commercial seasoning cubes contain 50% to 60% sodium chloride and MSG. Ingesting high sodium pulls water into your bloodstream, increasing blood pressure against artery walls.",
      "However, blood pressure is regulated by the SODIUM-TO-POTASSIUM RATIO. Potassium tells your kidneys to flush excess sodium out through urine.",
      "If you eat a savory soup seasoned with stock cubes, balance it by incorporating potassium-rich foods: boiled plantains, spinach, avocado, or pumpkin leaves (Ugwu).",
      "Aim for 2 parts Potassium for every 1 part Sodium to keep blood pressure in the optimal green zone! ⚖️",
    ],
    takeaway: "Whenever you cook with savory seasoning cubes, pair with potassium-rich greens and plantains to help your kidneys excrete excess sodium.",
    quiz: {
      question: "What critical mineral helps your kidneys flush out excess sodium from seasoning cubes?",
      options: ["Potassium", "Iron", "Zinc"],
      correctIndex: 0,
      explanation: "Spot on! Potassium balances sodium levels and relaxes arterial walls for healthy blood pressure.",
    },
  },
];

// SWALLOW GLYCEMIC SIMULATOR DATA
const SWALLOW_SIMULATOR_DATA = [
  {
    id: "pounded-yam",
    name: "Pounded Yam (Iyan)",
    glycemicIndex: 85,
    peakSpike: "172 mg/dL",
    velocityTime: "22 mins",
    spikeRisk: "High Spike Risk ⚠️",
    color: "from-rose-500 to-red-600",
    bgColor: "bg-rose-50 border-rose-200 text-rose-800",
    barWidth: "90%",
    insight: "Rapid starch hydrolysis. Causes a sharp 55 mg/dL glucose surge within 25 minutes unless paired with heavy fiber."
  },
  {
    id: "white-garri",
    name: "White Garri (Eba)",
    glycemicIndex: 78,
    peakSpike: "158 mg/dL",
    velocityTime: "28 mins",
    spikeRisk: "Moderate-High Spike ⚠️",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 border-amber-200 text-amber-800",
    barWidth: "75%",
    insight: "Fermented cassava starch. Moderate glycemic velocity, buffered by soaking time and hot water gelatinization."
  },
  {
    id: "semovita",
    name: "Semovita (Refined Wheat)",
    glycemicIndex: 72,
    peakSpike: "148 mg/dL",
    velocityTime: "32 mins",
    spikeRisk: "Moderate Spike ⚠️",
    color: "from-amber-500 to-yellow-600",
    bgColor: "bg-amber-50 border-amber-200 text-amber-800",
    barWidth: "68%",
    insight: "Milled durum wheat endosperm. Moderate digestion rate, but triggers sustained 2-hour insulin elevation."
  },
  {
    id: "plantain-oat-fufu",
    name: "Plantain-Oat Fufu (Smart Swap)",
    glycemicIndex: 42,
    peakSpike: "114 mg/dL",
    velocityTime: "75 mins",
    spikeRisk: "Low Spike Shield 🛡️",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
    barWidth: "35%",
    insight: "Beta-glucan soluble fiber matrix. Extends glucose release into a gentle metabolic plateau, reducing peak spike by 45%!"
  },
  {
    id: "almond-psyllium-fufu",
    name: "Almond-Psyllium Fufu (Keto Shield)",
    glycemicIndex: 24,
    peakSpike: "98 mg/dL",
    velocityTime: "90 mins",
    spikeRisk: "Flat Glycemic Line 🟢",
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-50 border-teal-200 text-teal-800",
    barWidth: "18%",
    insight: "Zero rapid starch. High in monounsaturated fats and prebiotic psyllium husk—ideal for strict A1c reversal."
  }
];

export default function AvoAcademy() {
  const { profile } = useUser();
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const cond = (profile?.medicalCondition || "").toLowerCase();
    if (cond.includes("pregnan") || cond.includes("gestat")) return "Pregnancy Health";
    if (cond.includes("prostat") || cond.includes("bph")) return "Prostate Health";
    if (cond.includes("arthrit") || cond.includes("joint") || cond.includes("gout")) return "Arthritis & Joints";
    return "Glucose Science";
  });

  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Swallow Simulator state
  const [selectedSwallow, setSelectedSwallow] = useState(SWALLOW_SIMULATOR_DATA[3]);

  // Saved progress
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("completed_academy_lessons") || "[]");
    } catch {
      return [];
    }
  });

  const [userXp, setUserXp] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("metabolic_xp") || "150", 10);
    } catch {
      return 150;
    }
  });

  // Circadian window
  const circadianWindow = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) {
      return {
        label: "Morning Fasting Window (07:00 - 11:00)",
        status: "Insulin sensitivity is peak. Ideal window for complex fiber & protein breakfast.",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        badge: "Optimal Sensitivity ⚡",
      };
    } else if (hour >= 11 && hour < 16) {
      return {
        label: "Midday Metabolic Engine (12:00 - 16:00)",
        status: "Active digestive window. Pair starchy swallows with vegetables first.",
        color: "bg-amber-50 text-amber-800 border-amber-200",
        badge: "Active Metabolism 🔥",
      };
    } else if (hour >= 16 && hour < 21) {
      return {
        label: "Evening Glucose Clearance (17:00 - 21:00)",
        status: "Insulin sensitivity begins tapering. Favor light dinners & lean fish.",
        color: "bg-orange-50 text-orange-800 border-orange-200",
        badge: "Tapering Phase 🌙",
      };
    } else {
      return {
        label: "Night Autophagy & Fasting (21:00 - 06:00)",
        status: "Cellular repair and liver glycogen depletion active.",
        color: "bg-indigo-50 text-indigo-800 border-indigo-200",
        badge: "Autophagy Rest 🌌",
      };
    }
  }, []);

  const todayLessonIndex = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = new Date().getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % ACADEMY_LESSONS.length;
  }, []);

  const todayLesson = ACADEMY_LESSONS[todayLessonIndex];

  // Auto-scrolling Specialty Marquee loop (Smooth & Interactive)
  useEffect(() => {
    const el = scrollBarRef.current;
    if (!el) return;

    let scrollAmount = el.scrollLeft;
    let scrollDirection = 1;

    const interval = setInterval(() => {
      if (isPaused) return;
      if (!el) return;

      scrollAmount += scrollDirection * 0.8;
      if (scrollAmount >= el.scrollWidth - el.clientWidth - 5) {
        scrollDirection = -1;
      } else if (scrollAmount <= 5) {
        scrollDirection = 1;
      }
      el.scrollLeft = scrollAmount;
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentMealProtocols = useMemo(() => {
    return CATEGORY_MEAL_PROTOCOLS[selectedCategory] || CATEGORY_MEAL_PROTOCOLS["Glucose Science"] || [];
  }, [selectedCategory]);

  const filteredLessons = useMemo(() => {
    if (selectedCategory === "All") return ACADEMY_LESSONS;
    return ACADEMY_LESSONS.filter((l) => l.category === selectedCategory);
  }, [selectedCategory]);

  const openLesson = (lesson: AcademyLesson) => {
    triggerHaptic("light");
    setActiveLesson(lesson);
    setCurrentSlideIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  };

  const handleNextSlide = () => {
    if (!activeLesson) return;
    triggerHaptic("light");
    if (currentSlideIndex < activeLesson.storySlides.length) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleSelectOption = (index: number) => {
    if (quizSubmitted) return;
    triggerHaptic("light");
    setSelectedAnswer(index);
  };

  const handleSubmitQuiz = () => {
    if (selectedAnswer === null || !activeLesson) return;
    setQuizSubmitted(true);

    const isCorrect = selectedAnswer === activeLesson.quiz.correctIndex;
    if (isCorrect) {
      triggerHaptic("success");
      triggerConfetti("burst");
      toast.success("Mastery Complete! +25 Metabolic XP 🧠✨");

      if (!completedIds.includes(activeLesson.id)) {
        const nextCompleted = [...completedIds, activeLesson.id];
        setCompletedIds(nextCompleted);
        localStorage.setItem("completed_academy_lessons", JSON.stringify(nextCompleted));

        const nextXp = userXp + 25;
        setUserXp(nextXp);
        localStorage.setItem("metabolic_xp", nextXp.toString());
      }
    } else {
      triggerHaptic("warning");
      toast.error("Not quite! Read the clinical explanation below.");
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Banner with Live XP */}
      <div className="bg-gradient-to-br from-[#126778] via-[#1f7a8c] to-[#38b2ac] rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>Metabolic Culinary Academy • 2026 Edition</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              Glucose Science &amp; Food Chemistry 🧬
            </h2>
            <p className="text-xs text-teal-50/90 mt-1 max-w-sm leading-relaxed">
              Evidence-based nutritional science translated into practical, delicious African food hacks.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20 text-center shrink-0">
            <div className="flex items-center gap-1 text-amber-300 font-black text-sm justify-center">
              <Trophy size={14} />
              <span>{userXp} XP</span>
            </div>
            <span className="text-[9px] text-teal-100 uppercase font-extrabold tracking-wider block mt-0.5">
              Knowledge Score
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-teal-100">
          <span className="text-[11px] font-semibold">
            Curriculum: {completedIds.length} / {ACADEMY_LESSONS.length} Completed
          </span>
          <div className="w-28 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-300 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((completedIds.length / ACADEMY_LESSONS.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 🌟 10X TOP SELF-SCROLLING SPECIALTY MARQUEE BAR (Unified Brand Color Consistency) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#126778] dark:text-teal-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500 animate-bounce" />
            <span>Specialized Clinical Programs:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            Tap heading to open lessons &amp; meals ➔
          </span>
        </div>

        <div
          ref={scrollBarRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1 px-0.5 select-none"
        >
          {[
            { id: "Pregnancy Health", label: "🤰 Eating for Pregnancy" },
            { id: "Prostate Health", label: "🩺 Eating for Prostate Health" },
            { id: "Arthritis & Joints", label: "🦴 Eating for Arthritis & Joints" },
            { id: "Glucose Science", label: "🩸 Glucose Science & Insulin" },
            { id: "Heart & BP", label: "❤️ Blood Pressure & Heart" },
            { id: "Gut & Fiber", label: "🥗 Gut Microbiome & Fiber" },
            { id: "Cooking Hacks", label: "👨‍🍳 Cultural Cooking Hacks" },
            { id: "All", label: "🌟 All Masterclasses" },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  triggerHaptic("medium");
                  setSelectedCategory(cat.id);
                  setIsPaused(true);
                }}
                className={`px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-[#126778] via-[#1f7a8c] to-[#0d9488] text-white ring-2 ring-teal-400 ring-offset-2 scale-105 shadow-md"
                    : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 hover:border-teal-400 hover:bg-teal-50/50"
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && <CheckCircle2 size={13} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 📖 ACTIVE CATEGORY CLINICAL LESSONS & THERAPEUTIC MEALS SECTION */}
      <div className="space-y-4 pt-1">
        
        {/* Active Category Header Pill */}
        <div className="flex items-center justify-between bg-teal-50/80 dark:bg-zinc-800/80 border border-teal-200/80 dark:border-zinc-700 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-[#126778] dark:text-teal-300">
              {selectedCategory === "Pregnancy Health" ? "🤰 Pregnancy & Gestational Nutrition" : selectedCategory === "Prostate Health" ? "🩺 Prostate Health & PSA Support" : selectedCategory === "Arthritis & Joints" ? "🦴 Arthritis, Gout & Joint Mobility" : selectedCategory === "Glucose Science" ? "🩸 Glucose Science & Insulin Reset" : selectedCategory === "Heart & BP" ? "❤️ Blood Pressure & Arterial Health" : selectedCategory === "Gut & Fiber" ? "🥗 Gut Microbiome & Soluble Fiber" : selectedCategory === "Cooking Hacks" ? "👨‍🍳 Ancestral Culinary Hacks" : "🌟 All Clinical Masterclasses"}
            </span>
          </div>
          <span className="text-[10px] font-black uppercase bg-[#126778] text-white px-2.5 py-0.5 rounded-full">
            {filteredLessons.length} Lesson{filteredLessons.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* 1. Dynamic Interactive Lesson Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredLessons.map((lesson) => {
            const Icon = lesson.icon;
            const isDone = completedIds.includes(lesson.id);
            const isCurrentToday = lesson.id === todayLesson.id;

            return (
              <div
                key={lesson.id}
                onClick={() => openLesson(lesson)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                  isDone
                    ? "bg-teal-50/50 border-teal-200"
                    : isCurrentToday
                    ? "bg-white border-amber-300 ring-2 ring-amber-300/40"
                    : "bg-white dark:bg-zinc-800 border-slate-200/80 dark:border-zinc-700 hover:border-teal-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-black tracking-wider text-[#126778] bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-lg">
                        {lesson.category}
                      </span>
                      {isCurrentToday && (
                        <span className="text-[9.5px] uppercase font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                          Today's Pick
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock size={11} />
                      <span>{lesson.readTime}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3 my-1">
                    <div
                      className={`p-2.5 rounded-2xl shrink-0 ${
                        isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-teal-50 text-[#126778]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#126778] transition-colors leading-tight">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2 font-medium">
                        {lesson.headline}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between">
                  {isDone ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      <span>Mastered (+25 XP)</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#126778] dark:text-teal-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Read 60s Lesson &amp; Take Quiz</span>
                      <ChevronRight size={14} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. CURATED AFRICAN THERAPEUTIC MEAL PROTOCOLS FOR THIS TOPIC */}
        {currentMealProtocols.length > 0 && (
          <div className="bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-3xl p-4 sm:p-5 border border-teal-200/80 dark:border-zinc-700 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍲</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Recommended Therapeutic Meal Protocol
                  </h3>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    African cultural plates scientifically balanced for {selectedCategory}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                3 Daily Plates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentMealProtocols.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white dark:bg-zinc-800/90 rounded-2xl p-3.5 border border-slate-200/80 dark:border-zinc-700 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-black tracking-wider bg-[#126778]/10 text-[#126778] dark:text-teal-300 px-2 py-0.5 rounded-md">
                        {meal.mealType}
                      </span>
                      <span className="text-xl">{meal.emoji}</span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                      {meal.dishName}
                    </h4>

                    <span className="inline-block text-[9.5px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md mt-1.5">
                      {meal.keyNutrientBadge}
                    </span>

                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
                      {meal.whyItWorks}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <span>~{meal.calories} kcal</span>
                    <span>Carbs: {meal.carbs}g</span>
                    <span>Protein: {meal.protein}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 2. DYNAMIC REAL-TIME CIRCADIAN GLUCOSE BIO-CLOCK */}
      <div className={`p-4 rounded-3xl border shadow-xs transition-all ${circadianWindow.color}`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 font-black text-xs">
            <Clock size={14} />
            <span>{circadianWindow.label}</span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 border shadow-2xs">
            {circadianWindow.badge}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed font-medium">
          {circadianWindow.status}
        </p>
      </div>

      {/* 3. INTERACTIVE AFRICAN SWALLOW GLYCEMIC SIMULATOR (Live in Glucose Science) */}
      <div className="bg-white dark:bg-zinc-800 rounded-3xl p-5 shadow-xs border border-teal-100/90 dark:border-zinc-700 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#126778] dark:text-teal-300">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Live Swallow Glycemic Simulator 🥣
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Compare post-meal glucose spikes across traditional and modern swallows
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            5 Swallows Tested
          </span>
        </div>

        {/* Swallow Picker Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {SWALLOW_SIMULATOR_DATA.map((swallow) => {
            const isSelected = selectedSwallow.id === swallow.id;
            return (
              <button
                key={swallow.id}
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedSwallow(swallow);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#126778] text-white shadow-xs"
                    : "bg-slate-50 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-600 hover:bg-slate-100"
                }`}
              >
                {swallow.name}
              </button>
            );
          })}
        </div>

        {/* Swallow Spike Analysis Card */}
        <div className={`p-4 rounded-2xl border ${selectedSwallow.bgColor} space-y-3`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider opacity-80 block">
                Peak Post-Meal Glucose Spike
              </span>
              <span className="text-lg font-black">{selectedSwallow.peakSpike}</span>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-800 shadow-2xs">
              {selectedSwallow.spikeRisk}
            </span>
          </div>

          {/* Velocity Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold opacity-80 mb-1">
              <span>Glucose Velocity (GI: {selectedSwallow.glycemicIndex})</span>
              <span>Spike Time: ~{selectedSwallow.velocityTime}</span>
            </div>
            <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${selectedSwallow.color} transition-all duration-500 rounded-full`}
                style={{ width: selectedSwallow.barWidth }}
              />
            </div>
          </div>

          <p className="text-[11px] leading-snug font-medium pt-1">
            💡 <strong>Clinical Insight:</strong> {selectedSwallow.insight}
          </p>
        </div>
      </div>

      {/* 6. INTERACTIVE STORY & QUIZ READER MODAL */}
      {activeLesson && (
        <Dialog open={!!activeLesson} onOpenChange={() => setActiveLesson(null)}>
          <DialogContent className="max-w-md p-6 rounded-3xl max-h-[92vh] overflow-y-auto border-teal-500/30 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
            <DialogHeader className="sr-only">
              <DialogTitle>{activeLesson.title}</DialogTitle>
              <DialogDescription>{activeLesson.headline}</DialogDescription>
            </DialogHeader>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#126778] dark:text-teal-300">
                  <activeLesson.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-teal-700 dark:text-teal-300">
                    {activeLesson.category} • 60s Masterclass
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                    {activeLesson.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* SLIDES PHASE */}
            {currentSlideIndex < activeLesson.storySlides.length ? (
              <div className="space-y-4">
                {/* Story Slide Content Card */}
                <div className="bg-gradient-to-br from-teal-50/60 to-emerald-50/40 dark:from-zinc-800 dark:to-zinc-800/60 p-5 rounded-2xl border border-teal-100 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                      Slide {currentSlideIndex + 1} of {activeLesson.storySlides.length}
                    </span>
                    <Mascot gesture="waving" size={32} />
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                    {activeLesson.storySlides[currentSlideIndex]}
                  </p>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {activeLesson.storySlides.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentSlideIndex
                          ? "w-6 bg-[#126778]"
                          : i < currentSlideIndex
                          ? "w-2 bg-teal-400"
                          : "w-2 bg-slate-200 dark:bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  onClick={handleNextSlide}
                  className="w-full bg-gradient-to-r from-[#126778] to-[#2a9d8f] text-white h-12 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>
                    {currentSlideIndex === activeLesson.storySlides.length - 1
                      ? "Take 1-Question Mastery Quiz 🎯"
                      : "Next Slide"}
                  </span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            ) : (
              /* QUIZ PHASE */
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-300 mb-1">
                    <Sparkles size={14} />
                    <span>Quick Science Mastery Quiz (+25 XP)</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeLesson.quiz.question}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {activeLesson.quiz.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === activeLesson.quiz.correctIndex;

                    let btnClass = "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800";
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200";
                      }
                    } else if (isSelected) {
                      btnClass = "border-[#126778] bg-teal-50/80 dark:bg-teal-950/60 text-[#126778] dark:text-teal-300 font-bold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={quizSubmitted}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && isCorrect && (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <XCircle size={16} className="text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 🥑 AVO-AZA CLAPPING CELEBRATION & EXPLANATION */}
                {quizSubmitted && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    {selectedAnswer === activeLesson.quiz.correctIndex ? (
                      <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-3xl border-2 border-emerald-400 shadow-lg text-center">
                        <Mascot gesture="clapping" size={130} className="drop-shadow-xl my-1" />
                        <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-md mt-1">
                          <Sparkles size={15} className="text-amber-300 animate-spin" />
                          <span>AVO-AZA Claps: 100% Correct! (+25 XP) 👏🎉</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl border border-amber-300 text-center">
                        <Mascot gesture="writing" size={100} className="my-1" />
                        <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                          Avo's Clinical Review Note 📝
                        </span>
                      </div>
                    )}

                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs space-y-2">
                      <p className="font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {activeLesson.quiz.explanation}
                      </p>
                      <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-800 dark:text-teal-300 font-medium leading-snug">
                        💡 <strong>Clinical Takeaway:</strong> {activeLesson.takeaway}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {!quizSubmitted ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswer === null}
                    className="w-full bg-gradient-to-r from-[#126778] to-[#2a9d8f] text-white h-12 rounded-2xl font-black text-sm shadow-md cursor-pointer disabled:opacity-60"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveLesson(null)}
                    className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-2xl font-black text-sm cursor-pointer"
                  >
                    Close &amp; Collect XP
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
