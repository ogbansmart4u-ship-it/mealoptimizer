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
  UtensilsCrossed,
  Layers,
  Volume2,
  VolumeX,
  Play,
  Pause,
  GraduationCap,
  Medal,
  Check,
  Copy,
  Send,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { toast } from "sonner";
import { useUser } from "../contexts/UserContext";
import { speakWithSarah, stopSarahSpeech, sanitizeTextForSpeech } from "../services/voiceService";

export type AcademyTier = 1 | 2 | 3 | 4;

export interface AcademyLesson {
  id: string;
  tier: AcademyTier;
  tierName: string;
  title: string;
  category: "Pregnancy Health" | "Prostate Health" | "Arthritis & Joints" | "Glucose Science" | "Heart & BP" | "Gut & Fiber" | "Cooking Hacks" | "Hormones & Longevity" | "Kidney Care" | "Liver & Detox";
  readTime: string;
  icon: string;
  headline: string;
  audioScript: string;
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
  "Menopause & Hormones": [
    {
      id: "meno-1",
      mealType: "Breakfast",
      dishName: "Sprouted Soya Beans Porridge with Chia Seeds & Sliced Banana",
      emoji: "🥣",
      calories: 320,
      carbs: 34,
      protein: 20,
      keyNutrientBadge: "Isoflavone Phytoestrogen Boost 🌸",
      whyItWorks: "Soy isoflavones act as natural selective estrogen receptor modulators (SERMs), gently buffering against hot flashes and night sweats."
    },
    {
      id: "meno-2",
      mealType: "Lunch",
      dishName: "Plantain-Oat Swallow with Sesame (Beni-Seed) Ugwu Soup & Titus Fish",
      emoji: "🍲",
      calories: 430,
      carbs: 40,
      protein: 34,
      keyNutrientBadge: "Calcium & Bone Density Matrix 🦴",
      whyItWorks: "Sesame seeds and fluted pumpkin leaves (Ugwu) provide plant calcium and magnesium to counteract postmenopausal bone mineral density loss."
    },
    {
      id: "meno-3",
      mealType: "Dinner",
      dishName: "Steamed Cod Fish with Okra & Waterleaf Greens with 1/2 Sweet Potato",
      emoji: "🐟",
      calories: 290,
      carbs: 22,
      protein: 30,
      keyNutrientBadge: "Vasomotor Stability & Magnesium 🌙",
      whyItWorks: "Light, steady glucose release prevents nighttime cortisol and adrenaline surges, promoting deep restorative sleep."
    }
  ],
  "Peptic Ulcer Health": [
    {
      id: "pud-1",
      mealType: "Breakfast",
      dishName: "Fermented Millet Pap (Ogi) with Boiled Egg & Avocado",
      emoji: "🥣",
      calories: 310,
      carbs: 36,
      protein: 16,
      keyNutrientBadge: "Gastric Mucosal Coat 🛡️",
      whyItWorks: "Alkalizing fermented pap provides gentle carbohydrates, while egg and avocado supply tissue-building protein and healthy fats without triggering acid surges."
    },
    {
      id: "pud-2",
      mealType: "Lunch",
      dishName: "Steamed Fresh Fish with Gentle Okra Soup & Sweet Potato",
      emoji: "🍲",
      calories: 380,
      carbs: 38,
      protein: 32,
      keyNutrientBadge: "Okra Mucilage Barrier 🌿",
      whyItWorks: "Okra's natural draw (mucilage) coats the stomach wall, physically buffering sensitive ulcerated tissue against digestive acid."
    },
    {
      id: "pud-3",
      mealType: "Dinner",
      dishName: "Simmered Cabbage & Shredded Chicken Soup with Boiled Plantain",
      emoji: "🥬",
      calories: 290,
      carbs: 24,
      protein: 30,
      keyNutrientBadge: "L-Glutamine Epithelial Repair 🥣",
      whyItWorks: "Cooked cabbage is dense in natural glutamine and S-methylmethionine, promoting rapid nighttime mucosal cell regeneration."
    }
  ],
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
      dishName: "Steamed Okra & Bitterleaf Soup with Lean Shredded Turkey",
      emoji: "🥣",
      calories: 280,
      carbs: 16,
      protein: 32,
      keyNutrientBadge: "Nitric Oxide Vasodilation 🩸",
      whyItWorks: "Green leafy nitrates and soluble fiber help relax peripheral resistance, keeping nighttime blood pressure within safe limits."
    }
  ]
};

// ============================================================================
// 🏆 36 CLINICAL MASTERCLASS LESSONS (4 PROGRESSIVE TIERS)
// ============================================================================
export const LESSONS: AcademyLesson[] = [
  // --------------------------------------------------------------------------
  // TIER 1: HERITAGE BIO-FOUNDATIONS (Lessons 1 - 9)
  // --------------------------------------------------------------------------
  {
    id: "lesson-1",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "The Clinical Food Sequencing Protocol",
    category: "Glucose Science",
    readTime: "90s Audio",
    icon: "🥗",
    headline: "The order in which you eat your African swallow cuts glucose spikes by 48%.",
    audioScript: "Welcome to Lesson One of your Metabolic Masterclass. When eating traditional meals like pounded yam or rice, eating your vegetables and proteins first creates a protective fiber mesh in your small intestine. This slows down carbohydrate absorption and flattens your glucose curve by up to 48 milligrams per deciliter.",
    storySlides: [
      "Traditional African dining often starts with a giant swallow ball dipped in soup. Eating carbohydrates first triggers an immediate rush of glucose into your bloodstream.",
      "By simply reversing the order—eating your leafy vegetables (Efo Riro, Ugwu, Waterleaf) and proteins (fish, lean meat) first—you coat your stomach lining with soluble fiber and stimulate GLP-1 satiety hormones.",
      "When the starch finally enters your stomach 10 minutes later, gastric emptying is delayed, resulting in a gentle, sustained energy plateau rather than a sharp crash."
    ],
    takeaway: "Always eat: 1st Leafy Greens 🥬 ➡️ 2nd Protein & Fats 🐟 ➡️ 3rd Complex Carbs last 🌾.",
    quiz: {
      question: "Which food should you consume FIRST during a traditional meal to flatten glucose spikes?",
      options: ["The Swallow (Pounded Yam / Garri)", "Leafy Greens (Efo Riro / Ugwu)", "Sweetened Palm Wine or Soda", "Dessert or Fried Plantain"],
      correctIndex: 1,
      explanation: "Leafy vegetables provide viscous soluble fiber that lines the small intestine, slowing down starch digestion."
    }
  },
  {
    id: "lesson-2",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "Mucilage Shields: The Science of Ewedu & Okra",
    category: "Gut & Fiber",
    readTime: "90s Audio",
    icon: "🥣",
    headline: "Traditional drawing soups form a physical biochemical barrier that traps sugar.",
    audioScript: "Did you know that the viscous draw in Ewedu and Okra is actually a high-grade bioactive mucilage? This soluble polysaccharide forms a gel in your gut that physically traps starch molecules and prevents sudden insulin surges.",
    storySlides: [
      "The slimy, viscous texture of draw soups (Ewedu, Ogbono, and Okra) is caused by soluble mucilaginous polysaccharides.",
      "In the gastrointestinal tract, this mucilage binds with water to create an impenetrable gel barrier along the microvilli of your intestines.",
      "This slows carbohydrate enzyme breakdown (alpha-amylase) and feeds beneficial Akkermansia muciniphila bacteria in your colon."
    ],
    takeaway: "Pair high-glycemic swallows with draw soups to naturally lower effective glycemic load.",
    quiz: {
      question: "How does the mucilage in Okra and Ewedu protect your blood sugar?",
      options: ["It converts all carbs into protein", "It forms a viscous gel that traps starch and slows sugar absorption", "It speeds up stomach emptying", "It destroys digestive enzymes permanently"],
      correctIndex: 1,
      explanation: "Mucilage polysaccharides form a viscous intestinal gel that slows enzymatic starch digestion."
    }
  },
  {
    id: "lesson-3",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "Resistant Starch: The Cook-and-Cool Hack",
    category: "Cooking Hacks",
    readTime: "90s Audio",
    icon: "🍠",
    headline: "Cooling boiled rice or yams in the fridge for 12 hours turns 30% of carbs into prebiotic fiber.",
    audioScript: "Here is a powerful clinical kitchen hack. When you cook rice, yams, or potatoes and cool them overnight in the refrigerator, their starch molecules recrystallize into Type-3 Resistant Starch. Even after reheating, they deliver 30% fewer calories to your bloodstream.",
    storySlides: [
      "Freshly boiled starches are easily digested into simple glucose. But when starches cool down below 4°C, amylose chains undergo retrogradation.",
      "Retrograded starch becomes resistant to digestive enzymes in the small intestine, traveling straight to the colon untouched.",
      "In the colon, friendly bacteria ferment it into Short-Chain Fatty Acids (Butyrate), which repair gut walls and improve whole-body insulin sensitivity."
    ],
    takeaway: "Batch-cook your brown rice, sweet potatoes, and fonio, cool overnight, and reheat before serving.",
    quiz: {
      question: "What happens when you cool cooked African starches in the refrigerator overnight?",
      options: ["They turn into simple table sugar", "They crystallize into Type-3 Resistant Starch that feeds gut bacteria", "They lose all mineral content", "They become toxic to the liver"],
      correctIndex: 1,
      explanation: "Retrogradation converts digestible starches into prebiotic resistant starch that bypasses upper digestive absorption."
    }
  },
  {
    id: "lesson-4",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "Glycemic Index vs. Glycemic Load in Swallows",
    category: "Glucose Science",
    readTime: "90s Audio",
    icon: "⚖️",
    headline: "Why portion geometry matters far more than simply cutting out your favorite swallow.",
    audioScript: "Many people are told to stop eating swallow entirely. That is clinically unnecessary. Glycemic Index measures speed, but Glycemic Load measures total impact. Cutting your swallow portion by 35% and doubling your vegetable soup completely neutralizes the glycemic spike.",
    storySlides: [
      "A massive ball of Pounded Yam has a high Glycemic Load (GL > 35). But reducing the swallow size to fist-size drops the GL to under 15.",
      "When combined with lean protein (Titus fish, goat meat) and high-potassium greens, your insulin response remains smooth and balanced.",
      "You never need to give up your cultural heritage; you only need to re-engineer portion geometry."
    ],
    takeaway: "Follow the 25-50-25 rule: 25% Swallow, 50% Fiber/Greens, 25% Lean African Protein.",
    quiz: {
      question: "What is the 25-50-25 cultural plate ratio for safe metabolic swallow dining?",
      options: ["50% Meat, 50% Swallow", "25% Swallow, 50% Vegetables/Greens, 25% Lean Protein", "75% Starch, 25% Soup", "100% Raw Vegetables"],
      correctIndex: 1,
      explanation: "The 25-50-25 rule keeps carbohydrate load moderate while maximizing soluble fiber and muscle-preserving protein."
    }
  },
  {
    id: "lesson-5",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "Why Semolina & White Garri Cause Rapid Spikes",
    category: "Glucose Science",
    readTime: "90s Audio",
    icon: "⚠️",
    headline: "Refined swallow flours lack cellular matrix and absorb as fast as pure glucose.",
    audioScript: "Ultra-processed swallow flours like industrial white semolina and finely sifted white garri have had their fibrous outer bran stripped away. In your stomach, they turn into glucose in under 20 minutes. Swapping to Plantain-Oat fufu or yellow cassava fermented with fiber protects your pancreas.",
    storySlides: [
      "Commercial semolina is milled from refined durum wheat endosperm with zero bran or germ fiber.",
      "Without fiber to slow down gastric breakdown, digestive enzymes rapidly convert the refined starch into pure glucose.",
      "Healthier alternatives: Whole oat flour blended with green unripe plantain, or fiber-rich fermented cassava with added flax/chia seeds."
    ],
    takeaway: "Upgrade refined white swallows with fiber-dense Plantain-Oat, Fonio, or Sprouted Millet flours.",
    quiz: {
      question: "Why does refined commercial semolina spike blood glucose faster than traditional pounded yam?",
      options: ["It contains high levels of caffeine", "It is stripped of grain fiber and bran, allowing rapid enzymatic hydrolysis", "It has no carbohydrates", "It is fermented for too long"],
      correctIndex: 1,
      explanation: "Refined milling removes dietary fiber, enabling instant starch-to-sugar digestion in the upper gastrointestinal tract."
    }
  },
  {
    id: "lesson-6",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "The Micronutrient Power of Bitter Leaf & Waterleaf",
    category: "Gut & Fiber",
    readTime: "90s Audio",
    icon: "🌿",
    headline: "African indigenous wild leaves contain 4x more antioxidants than Western kale or spinach.",
    audioScript: "Indigenous African leafy greens like Vernonia amygdalina (Bitter Leaf) and Talinum triangulare (Waterleaf) are powerhouses of andrographolide, quercetin, and luteolin. They stimulate liver bile production and lower systemic C-reactive protein markers.",
    storySlides: [
      "Bitter phytochemicals in Bitter Leaf trigger bitter taste receptors (TAS2Rs) in your gut, which stimulate insulin secretion and gastric GLP-1 release.",
      "Waterleaf contains high concentrations of mucilage, pectin, and bioavailable calcium that soothe inflamed intestinal linings.",
      "Combining both in traditional soups creates a potent synergy of antioxidant protection and cellular detoxification."
    ],
    takeaway: "Incorporate authentic indigenous greens at least 4 times per week in your soups and stews.",
    quiz: {
      question: "What unique compound in Bitter Leaf stimulates gut taste receptors to enhance insulin sensitivity?",
      options: ["Refined Fructose", "Bitter phytochemical sesquiterpene lactones", "Sodium Chloride", "Trans-fatty acids"],
      correctIndex: 1,
      explanation: "Sesquiterpene lactones stimulate TAS2R bitter receptors to promote natural GLP-1 and insulin signaling."
    }
  },
  {
    id: "lesson-7",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "Hydration Timing: Why Ice Water Slows Swallow Digestion",
    category: "Gut & Fiber",
    readTime: "90s Audio",
    icon: "💧",
    headline: "Drinking large volumes of ice water during swallow meals dilutes stomach acid.",
    audioScript: "Drinking large glasses of ice water while eating heavy swallows can chill the digestive tract and dilute hydrochloric acid enzymes. To optimize digestion, drink water 20 minutes before meals and sip warm water or herbal teas during dinner.",
    storySlides: [
      "Adequate stomach acid (pH 1.5 - 2.5) is required to break down dense proteins like goat meat and cow leg.",
      "Chugging 500ml of ice-cold water during a heavy meal cools gastric enzymes and dilutes digestive juices, leading to bloating and sluggish transit.",
      "Best clinical practice: Drink 2 glasses of room-temperature water 30 minutes before your meal, and sip warm Zobo or ginger tea post-meal."
    ],
    takeaway: "Hydrate ahead of mealtime; sip warm herbal liquids during and after heavy swallow dinners.",
    quiz: {
      question: "When is the optimal time to drink water for healthy metabolic digestion?",
      options: ["Chug 1 liter of ice water while swallowing food", "Drink 20-30 minutes before meals, and sip warm fluids during eating", "Never drink water on days you eat swallow", "Only drink sugary sodas"],
      correctIndex: 1,
      explanation: "Hydrating 20-30 minutes before meals pre-activates gastric mucosa without diluting active digestive enzymes."
    }
  },
  {
    id: "lesson-8",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "The 25-50-25 Visual Plate Architecture",
    category: "Cooking Hacks",
    readTime: "90s Audio",
    icon: "🍽️",
    headline: "Re-engineering traditional West African plates for zero sugar crashes and all-day energy.",
    audioScript: "A standard African party plate is often 70% Jollof rice or Swallow and 15% meat. By rearranging the plate into 25% Starch, 50% Leafy Stew, and 25% Protein, you instantly cut the glycemic spike by 40% while preserving every drop of cultural flavor.",
    storySlides: [
      "Visual portion distortion is the number one cause of post-meal fatigue and afternoon brain fog.",
      "When 50% of your plate is occupied by rich, un-chopped leafy greens (Ugwu, Efo Tete, Afang), you consume massive micronutrients and fiber with low calorie density.",
      "This balanced ratio keeps your hunger hormone ghrelin suppressed for over 4 to 5 hours."
    ],
    takeaway: "Fill half your plate with vegetable soup, one quarter with swallow/rice, and one quarter with grilled fish or lean meat.",
    quiz: {
      question: "What percentage of your dinner plate should be composed of vegetable soups or salads?",
      options: ["10%", "50%", "85%", "0%"],
      correctIndex: 1,
      explanation: "Devoting 50% of the plate to leafy vegetables guarantees high fiber and micronutrient density."
    }
  },
  {
    id: "lesson-9",
    tier: 1,
    tierName: "Heritage Bio-Foundations",
    title: "GLP-1 Satiety Activation with African Proteins",
    category: "Hormones & Longevity",
    readTime: "90s Audio",
    icon: "🐟",
    headline: "How Titus mackerel, boiled eggs, and Awara tofu naturally trigger fullness hormones.",
    audioScript: "GLP-1 is the satiety hormone that tells your brain you are completely full. African lean proteins like wild mackerel, boiled eggs, and soy Awara stimulate L-cells in your gut to release natural GLP-1 without expensive pharmaceutical injections.",
    storySlides: [
      "Dietary amino acids (leucine, glutamine) and omega-3 fatty acids bind to receptors on intestinal enteroendocrine L-cells.",
      "This triggers a surge of Peptide YY (PYY) and Glucagon-Like Peptide-1 (GLP-1), which signal satiety centers in the hypothalamus.",
      "Eating your protein alongside soluble fiber ensures your brain registers fullness 15 minutes faster."
    ],
    takeaway: "Include at least 25-30g of authentic protein (fish, poultry, beans, awara) in every main meal.",
    quiz: {
      question: "Which hormone is naturally stimulated by dietary protein and fiber to signal brain fullness?",
      options: ["Cortisol", "Glucagon-Like Peptide-1 (GLP-1)", "Adrenaline", "Estrogen"],
      correctIndex: 1,
      explanation: "GLP-1 is secreted by intestinal L-cells in response to dietary proteins and soluble fibers."
    }
  },

  // --------------------------------------------------------------------------
  // TIER 2: ORGAN-SPECIFIC METABOLIC SHIELDS (Lessons 10 - 18)
  // --------------------------------------------------------------------------
  {
    id: "lesson-10",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "Zobo (Hibiscus) & BP: Natural ACE-Inhibition",
    category: "Heart & BP",
    readTime: "90s Audio",
    icon: "🌺",
    headline: "Clinical research shows 2 cups of unsweetened Zobo reduces systolic BP by 7.4 mmHg.",
    audioScript: "Zobo, brewed from Hibiscus sabdariffa petals, is rich in anthocyanins and delphinidins that act as natural Angiotensin-Converting Enzyme (ACE) inhibitors. However, patients on antihypertensive medications like Lisinopril must space consumption by 3 hours to prevent excessive blood pressure drops.",
    storySlides: [
      "Clinical trials confirm that organic Hibiscus tea exhibits potent vascular endothelium relaxation and mild diuretic action.",
      "The active bioactives inhibit ACE enzymes, naturally opening up constricted blood vessels and lowering systolic pressure.",
      "Safety rule: Always brew Zobo with ginger, cloves, and cinnamon instead of refined sugar, and maintain a 3-hour window from prescription ACE inhibitors."
    ],
    takeaway: "Drink unsweetened ginger-spiced Zobo for cardiovascular protection, separated from prescription BP meds.",
    quiz: {
      question: "Why should patients taking Lisinopril space their Zobo intake by at least 3 hours?",
      options: ["Zobo turns Lisinopril into sugar", "Both have additive ACE-inhibiting effects that could cause hypotension", "Zobo eliminates kidney function", "It causes tooth decay"],
      correctIndex: 1,
      explanation: "Additive vasodilation from both hibiscus bioactives and prescription ACE inhibitors can cause blood pressure to drop too low."
    }
  },
  {
    id: "lesson-11",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "KDIGO Renal Protocol: Double-Boiling African Tubers",
    category: "Kidney Care",
    readTime: "90s Audio",
    icon: "🩺",
    headline: "How kidney disease patients can safely enjoy yams and plantains by leaching excess potassium.",
    audioScript: "Patients with Chronic Kidney Disease or impaired renal clearance must limit high-potassium foods to prevent cardiac arrhythmias. By peeling, cubing, soaking, and double-boiling yams or plantains, up to 60% of potassium is safely leached out.",
    storySlides: [
      "African tubers like yam, cocoyam, and plantain are naturally dense in potassium. For healthy kidneys, this is great—for compromised kidneys, it can be dangerous.",
      "KDIGO leaching protocol: 1) Peel and cut into small 1-inch cubes. 2) Soak in warm water for 2 hours. 3) Boil in fresh water, discard the water completely, and boil again.",
      "This allows renal patients to enjoy traditional comfort meals safely without risking hyperkalemia."
    ],
    takeaway: "Double-boil and discard cooking water for yams and plantains if following a clinical renal protocol.",
    quiz: {
      question: "What is the primary clinical reason for double-boiling tubers in renal diets?",
      options: ["To remove all carbohydrates", "To leach out excess potassium and prevent hyperkalemia", "To make the food sweeter", "To preserve vitamin C"],
      correctIndex: 1,
      explanation: "Double-boiling and discarding the water extracts water-soluble potassium to protect compromised kidneys."
    }
  },
  {
    id: "lesson-12",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "Fatty Liver Reversal: Bitter Leaf & Choline",
    category: "Liver & Detox",
    readTime: "90s Audio",
    icon: "🛡️",
    headline: "Clear hepatic lipid buildup with bitter leaf polyphenols and wild egg yolk choline.",
    audioScript: "Non-Alcoholic Fatty Liver Disease is driven by excess refined fructose, palm oil oxidation, and insulin resistance. The vernoniosides in Bitter Leaf alongside choline from boiled eggs stimulate Very Low-Density Lipoprotein export, clearing trapped fat from liver hepatocytes.",
    storySlides: [
      "The liver is your master metabolic engine. When overloaded with high-glycemic carbohydrates and alcohol, fat accumulates inside liver cells.",
      "Vernonia amygdalina (Bitter Leaf) upregulates hepatic AMPK enzymes, stimulating fatty acid oxidation and reducing liver inflammation.",
      "Dietary choline acts as a chemical transporter, packaging triglycerides into VLDL to export fat out of the liver safely."
    ],
    takeaway: "Pair bitter leaf greens with whole eggs and cruciferous vegetables to support natural liver fat clearance.",
    quiz: {
      question: "Which essential nutrient is required by the liver to package and export trapped fat out of hepatocytes?",
      options: ["Refined Sugar", "Choline", "Saturated animal grease", "Synthetic food coloring"],
      correctIndex: 1,
      explanation: "Choline is essential for phosphatidylcholine synthesis, which the liver uses to package and export fat."
    }
  },
  {
    id: "lesson-13",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "Peptic Ulcer Healing: Cabbage & Non-Acidic Ogi",
    category: "Gut & Fiber",
    readTime: "90s Audio",
    icon: "🥣",
    headline: "Natural L-Glutamine and fermented probiotics repair the gastric epithelial lining.",
    audioScript: "Peptic ulcer disease requires protecting the stomach wall against corrosive gastric acid. Freshly simmered cabbage provides L-Glutamine and S-Methylmethionine (Vitamin U), which accelerate epithelial cell repair, while fermented millet pap coats and alkalizes the stomach.",
    storySlides: [
      "Gastric ulcers are painful sores in the lining of the stomach often exacerbated by H. pylori and NSAID painkillers.",
      "Simmered cabbage and bone broth are exceptionally dense in L-Glutamine, the primary fuel for enterocyte mucosal repair.",
      "Avoid raw hot scotch bonnet pepper during active flare-ups; season instead with ginger, turmeric, and soothing okra draw."
    ],
    takeaway: "Consume simmered cabbage soups and gentle fermented millet ogi to rapidly soothe and regenerate stomach tissue.",
    quiz: {
      question: "What amino acid in cooked cabbage and bone broth provides primary fuel for gut mucosal healing?",
      options: ["L-Glutamine", "Trans-fat", "Aspartame", "Sucrose"],
      correctIndex: 0,
      explanation: "L-Glutamine is the primary cellular fuel used by mucosal enterocytes to rebuild and heal the gut lining."
    }
  },
  {
    id: "lesson-14",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "PCOS & Inositol in African Beans & Legumes",
    category: "Hormones & Longevity",
    readTime: "90s Audio",
    icon: "🌸",
    headline: "Myo-Inositol in black-eyed peas and brown beans restores ovarian insulin sensitivity.",
    audioScript: "Polycystic Ovary Syndrome (PCOS) is fundamentally a metabolic disorder of cellular insulin resistance. Traditional African legumes like honey beans (Ewa Oloyin) and brown beans are dense in natural Myo-Inositol, which restores ovarian signaling and regulates ovulatory cycles.",
    storySlides: [
      "High insulin levels trigger the ovaries to produce excess testosterone, causing irregular periods, hormonal acne, and facial hair.",
      "Myo-Inositol acts as an intracellular second messenger for insulin. African beans, fonio, and citrus fruits are packed with natural inositol isomers.",
      "Eating steamed Moi Moi or sprouted beans stabilizes LH/FSH ratios and dramatically improves ovulatory regularity."
    ],
    takeaway: "Eat high-inositol African beans (Moi Moi, Gbegiri) 3-4 times weekly to combat PCOS insulin resistance.",
    quiz: {
      question: "How does natural inositol in African legumes help women managing PCOS?",
      options: ["It raises cortisol levels", "It acts as an insulin second messenger to improve ovarian hormone sensitivity", "It stops ovulation", "It increases body fat storage"],
      correctIndex: 1,
      explanation: "Myo-Inositol improves cellular insulin signaling, reducing excess ovarian androgen production."
    }
  },
  {
    id: "lesson-15",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "Prostate Health: 400% Lycopene Boost in Tomato Stew",
    category: "Prostate Health",
    readTime: "90s Audio",
    icon: "🍅",
    headline: "Simmering fresh tomatoes in olive or palm oil unlocks fat-soluble prostate antioxidants.",
    audioScript: "Lycopene is the carotenoid proven to concentrate in prostate tissue and protect against cellular hyperplasia. Simmering tomatoes in healthy oils converts raw trans-lycopene into highly bioavailable cis-lycopene, increasing absorption by up to 400 percent.",
    storySlides: [
      "Raw tomatoes have tough cellular walls that trap lycopene. Heat and gentle cooking break down these cell membranes.",
      "Because lycopene is fat-soluble, cooking it with healthy unbleached red palm oil or extra virgin olive oil allows your gut to absorb it effortlessly.",
      "Pairing stew with zinc-rich pumpkin seeds (Egusi) provides double-action prostate cellular defense for men over 40."
    ],
    takeaway: "Simmer fresh tomato and pepper bases in healthy oil to maximize prostate-protective lycopene.",
    quiz: {
      question: "Why is cooked tomato stew superior to raw tomatoes for prostate lycopene absorption?",
      options: ["Cooking destroys all antioxidants", "Heat and healthy fats convert lycopene into its bioavailable cis-isomer", "Raw tomatoes contain too much sodium", "Cooking adds synthetic vitamins"],
      correctIndex: 1,
      explanation: "Heat and dietary lipids break down plant cell walls and convert lycopene into easily absorbable cis-isomers."
    }
  },
  {
    id: "lesson-16",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "Joint Mobility: Gingerol, Turmeric & Uziza Anti-Inflammatories",
    category: "Arthritis & Joints",
    readTime: "90s Audio",
    icon: "🦴",
    headline: "West African pepper soup spices inhibit inflammatory COX-2 and IL-6 cytokines.",
    audioScript: "Traditional African Pepper Soup is more than comfort food—it is a clinical anti-inflammatory therapy. Spices like Uziza, Uda, fresh ginger, and turmeric inhibit the COX-2 enzyme pathway in a manner similar to low-dose ibuprofen, without irritating the stomach.",
    storySlides: [
      "Chronic joint pain and osteoarthritis are driven by circulating inflammatory cytokines (TNF-alpha and Interleukin-6).",
      "Gingerols and piperine from Uziza seeds naturally downregulate the NF-kB inflammatory cascade.",
      "When simmered with wild Titus mackerel or fresh catfish, the rich EPA/DHA omega-3 fatty acids lubricate synovial joint cartilage."
    ],
    takeaway: "Enjoy authentic wild fish pepper soup with uziza and ginger twice a week for pain-free joint mobility.",
    quiz: {
      question: "Which traditional spice combination acts as a natural COX-2 enzyme inhibitor for joint health?",
      options: ["White table sugar and flour", "Ginger, Turmeric, and Uziza pepper soup spices", "Monosodium glutamate (MSG)", "Hydrogenated margarine"],
      correctIndex: 1,
      explanation: "Gingerols, curcumin, and piperine in traditional pepper soup spices naturally inhibit pro-inflammatory prostaglandin synthesis."
    }
  },
  {
    id: "lesson-17",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "Preeclampsia Prevention: Low-Sodium Herb Seasoning",
    category: "Pregnancy Health",
    readTime: "90s Audio",
    icon: "🤰",
    headline: "Replacing ultra-high sodium seasoning cubes with fermented Iru and herbs protects maternal arteries.",
    audioScript: "During pregnancy, gestational hypertension and preeclampsia risk rise sharply with excess sodium intake. A single commercial seasoning cube can contain over 1,200 milligrams of sodium. Swapping to fermented Iru, crayfish, garlic, and thyme keeps maternal blood pressure safe.",
    storySlides: [
      "Commercial bouillon cubes are over 50% sodium chloride and MSG. Using 3 or 4 cubes in a family pot creates a massive vascular sodium load.",
      "Excess sodium triggers fluid retention, increasing arterial shear stress against sensitive placental vessels.",
      "Fermented locust bean (Iru) and ground crayfish deliver intense umami flavor and bioavailable zinc with under 10% of the sodium load."
    ],
    takeaway: "Build soup flavor with fermented Iru, ground crayfish, garlic, and onions to protect maternal cardiovascular health.",
    quiz: {
      question: "What is the safest culinary swap for commercial high-sodium bouillon cubes in pregnancy?",
      options: ["Extra table salt", "Fermented locust beans (Iru), ground crayfish, and aromatic herbs", "Refined soy sauce", "Artificial MSG powder"],
      correctIndex: 1,
      explanation: "Fermented Iru and crayfish provide deep umami taste and trace minerals with minimal sodium."
    }
  },
  {
    id: "lesson-18",
    tier: 2,
    tierName: "Organ-Specific Metabolic Shields",
    title: "Menopause & Bone Density: Sesame & Ugwu Phytoestrogens",
    category: "Hormones & Longevity",
    readTime: "90s Audio",
    icon: "🦴",
    headline: "Protect bone mineral density after 45 with natural plant calcium and phytoestrogens.",
    audioScript: "As estrogen declines during perimenopause and menopause, bone resorption accelerates. African sesame seeds (Beni-seed) and Ugwu leaves provide bioavailable plant calcium, magnesium, and gentle lignan phytoestrogens that support bone density and reduce night sweats.",
    storySlides: [
      "Postmenopausal bone loss can reach up to 2% per year if dietary calcium and vitamin K2 are insufficient.",
      "Sesame seeds (Beni-seed) contain over 900mg of calcium per 100g—more than cow's milk—alongside natural phytoestrogens that gently bind estrogen receptors.",
      "Ugwu greens supply vitamin K1, which activates osteocalcin to bind calcium directly into the skeletal matrix."
    ],
    takeaway: "Add toasted sesame seeds (Beni-seed) to your porridge and eat fresh Ugwu soup 3 times a week.",
    quiz: {
      question: "Which traditional West African seed provides over 900mg of calcium per 100g to support bone health?",
      options: ["White rice grain", "Sesame Seed (Beni-seed)", "Raw cassava peeling", "Commercial wheat flour"],
      correctIndex: 1,
      explanation: "Sesame (Beni-seed) is one of the world's densest plant sources of bone-building calcium and magnesium."
    }
  },

  // --------------------------------------------------------------------------
  // TIER 3: CULTURAL BIOCHEMISTRY & COOKING MASTERCLASS (Lessons 19 - 27)
  // --------------------------------------------------------------------------
  {
    id: "lesson-19",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "Palm Oil Science: Smoke Points & Tocopherols",
    category: "Cooking Hacks",
    readTime: "90s Audio",
    icon: "🌴",
    headline: "Unbleached red palm oil is the richest natural source of CoQ10 and Tocotrienols.",
    audioScript: "Virgin unbleached red palm oil is an African superfood packed with beta-carotene and tocotrienols (Vitamin E). However, bleaching palm oil until it turns clear and smoking destroys these delicate antioxidants. Always cook palm oil on gentle medium heat without smoking.",
    storySlides: [
      "The deep red color of virgin palm oil comes from carotenes—15 times more than carrots and 44 times more than leafy greens.",
      "When palm oil is heated past its smoke point (bleached), the beneficial tocotrienols oxidize into harmful lipid peroxides.",
      "Proper technique: Add palm oil directly to simmering tomato or vegetable stock without pre-bleaching in a dry hot pot."
    ],
    takeaway: "Never bleach your red palm oil to smoke. Keep it vibrant orange-red to preserve potent Vitamin E tocotrienols.",
    quiz: {
      question: "Why should you avoid bleaching red palm oil until it turns clear and smoky?",
      options: ["It makes the oil too sweet", "Bleaching oxidizes and destroys protective carotenoids and Vitamin E tocotrienols", "It increases vitamin C content", "It makes the soup freeze faster"],
      correctIndex: 1,
      explanation: "High-heat bleaching oxidizes healthy fatty acids and destroys heat-sensitive carotenoids."
    }
  },
  {
    id: "lesson-20",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "Fermented Superfoods: Iru, Ogiri & Dawadawa Probiotics",
    category: "Gut & Fiber",
    readTime: "90s Audio",
    icon: "🧫",
    headline: "Traditional fermented condiments cultivate Bacillus subtilis probiotics in your gut.",
    audioScript: "Traditional African fermented seasonings—Iru from locust beans, Ogiri from melon/sesame seeds, and Dawadawa—are living fermentations. They contain Bacillus subtilis and prebiotic peptides that strengthen your gut microbiome, lower blood pressure, and boost immune resilience.",
    storySlides: [
      "Ancient African ancestral cooking always relied on biological alkaline fermentation to unlock bound amino acids.",
      "Fermentation breaks down anti-nutrients (phytates and tannins) in raw seeds, releasing free zinc, iron, and magnesium for immediate absorption.",
      "Bacillus subtilis probiotics survive harsh stomach acid to colonize the colon, producing natural antimicrobial bacteriocins."
    ],
    takeaway: "Use traditional fermented Iru, Ogiri, or Dawadawa as your primary soup flavoring foundation.",
    quiz: {
      question: "What beneficial probiotic microorganism is naturally cultivated during traditional locust bean (Iru) fermentation?",
      options: ["Bacillus subtilis", "E. coli", "Salmonella", "Candida albicans"],
      correctIndex: 0,
      explanation: "Bacillus subtilis fermentation breaks down complex proteins and supports a healthy gut microbial barrier."
    }
  },
  {
    id: "lesson-21",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "The Vascular Power of African Spices: Uda, Uziza & Ehuru",
    category: "Heart & BP",
    readTime: "90s Audio",
    icon: "🌶️",
    headline: "Ancient aromatic spices stimulate endothelial Nitric Oxide for smooth blood circulation.",
    audioScript: "Spices like Uda (Negro pepper), Uziza (Piper guineense), and Ehuru (African nutmeg) contain rich essential oils (xylopic acid and alpha-pinene). They stimulate endothelial cells to release Nitric Oxide, promoting blood vessel dilation and reducing arterial stiffness.",
    storySlides: [
      "Traditional postpartum and wellness pepper soups were formulated for vascular regeneration and uterine muscle tone.",
      "Xylopic acid in Uda displays potent antimicrobial, anti-inflammatory, and cardiovascular protective bioactivity.",
      "Adding freshly ground Ehuru and Uziza to daily stews reduces reliance on table salt while invigorating peripheral blood circulation."
    ],
    takeaway: "Season daily soups with ground Uda, Uziza, and Ehuru to naturally support nitric oxide vasodilation.",
    quiz: {
      question: "How do traditional African pepper soup spices like Uda and Uziza support cardiovascular health?",
      options: ["They raise arterial resistance", "They stimulate endothelial Nitric Oxide production to dilate blood vessels", "They reduce heart rate to zero", "They eliminate oxygen from blood"],
      correctIndex: 1,
      explanation: "Essential oils in indigenous pepper soup spices promote endothelial vasodilation via nitric oxide release."
    }
  },
  {
    id: "lesson-22",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "Fonio & Ancient Grains: The Low-GI African Miracle",
    category: "Glucose Science",
    readTime: "90s Audio",
    icon: "🌾",
    headline: "Digitaria exilis (Fonio) has a lower glycemic index and 2x more sulfur amino acids than quinoa.",
    audioScript: "Fonio is Africa’s oldest cultivated cereal. Naturally gluten-free, low-glycemic, and rich in methionine and cystine, it cooks in just 3 minutes. It is the ultimate super-grain replacement for high-glycemic white rice and refined couscous.",
    storySlides: [
      "Fonio grain has a low glycemic index (GI 49) due to its unique resistant starch matrix and high fiber structure.",
      "It contains high concentrations of essential sulfur-containing amino acids (methionine and cysteine), which are deficient in wheat and corn.",
      "You can steam Fonio like Jollof rice, make it into a breakfast porridge, or use it as a light, fluffy swallow."
    ],
    takeaway: "Swap white rice or couscous for nutrient-dense, low-glycemic African Fonio.",
    quiz: {
      question: "Why is Fonio an ideal staple grain for diabetics and metabolic health enthusiasts?",
      options: ["It has zero nutrients", "It has a low glycemic index (GI ~49) and is rich in sulfur amino acids", "It converts immediately into glucose", "It requires 5 hours of cooking"],
      correctIndex: 1,
      explanation: "Fonio's low glycemic index and high prebiotic fiber content prevent postprandial glucose spikes."
    }
  },
  {
    id: "lesson-23",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "Frying vs. Air-Frying: Advanced Glycation End-Products (AGEs)",
    category: "Cooking Hacks",
    readTime: "90s Audio",
    icon: "🍌",
    headline: "Deep-frying ripe plantain (Dodo) generates AGE toxins that stiffen blood vessels.",
    audioScript: "When sweet ripe plantain is deep-fried in reused cooking oil at high temperatures, free fructose reacts with proteins to form Advanced Glycation End-products (AGEs). Air-frying or oven-roasting sweet plantain (Boli) reduces AGE formation by over 70 percent.",
    storySlides: [
      "Advanced Glycation End-products cross-link with vascular collagen, making arteries rigid and driving kidney microvascular damage.",
      "Reusing vegetable oil multiple times at roadside stands creates toxic lipid peroxides and trans-fats.",
      "Smarter alternatives: Oven-baked Boli with pepper sauce, or lightly air-fried plantain cubes brushed with virgin olive oil."
    ],
    takeaway: "Choose oven-roasted Boli or air-fried plantain over deep-fried dodo in reused commercial oil.",
    quiz: {
      question: "What harmful compounds are generated when sweet plantain is deep-fried in reused commercial oil?",
      options: ["Advanced Glycation End-products (AGEs) and lipid peroxides", "Vitamin D3", "Omega-3 fatty acids", "Probiotics"],
      correctIndex: 0,
      explanation: "High-heat deep frying of sugars and proteins produces toxic AGEs that accelerate vascular aging."
    }
  },
  {
    id: "lesson-24",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "Bone Broth & Collagen: Cow Leg & Fish Pepper Soup",
    category: "Arthritis & Joints",
    readTime: "90s Audio",
    icon: "🥣",
    headline: "Slow-simmered cow leg and bone cartilage provide natural Type-II collagen and glycine.",
    audioScript: "Traditional slow-cooked pepper soups made with cow foot (Nkwobi base), goat bone, and fish heads extract rich Type-I and Type-II collagen into the broth. Consuming glycine from bone broth repairs the gut mucosal barrier and improves joint elasticity.",
    storySlides: [
      "Slow simmering over 3 to 4 hours dissolves connective collagen into easily absorbed bioavailable gelatin peptides.",
      "Glycine is an inhibitory neurotransmitter that promotes deeper non-REM sleep, lowers nighttime body temperature, and protects gut integrity.",
      "Skim excess floating saturated fat from the surface while keeping the gelatin-rich, mineral-dense broth."
    ],
    takeaway: "Slow-simmer traditional bone broths for rich natural collagen, glycine, and joint lubrication.",
    quiz: {
      question: "What key amino acid in slow-simmered bone broth supports gut repair and restful sleep?",
      options: ["Glycine", "Caffeine", "MSG", "Sucrose"],
      correctIndex: 0,
      explanation: "Glycine supports connective tissue collagen synthesis, gut epithelial repair, and sleep quality."
    }
  },
  {
    id: "lesson-25",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "Plantain Maturity Stages: Green vs. Yellow Biochemistry",
    category: "Glucose Science",
    readTime: "90s Audio",
    icon: "🍌",
    headline: "Green plantain is 80% resistant starch; ripe yellow plantain is 80% simple free sugars.",
    audioScript: "The metabolic impact of plantain changes completely as it ripens. Unripe green plantain is packed with prebiotic resistant starch that stabilizes blood sugar. Over-ripe yellow plantain converts almost all its starch into fast-absorbing sucrose, fructose, and glucose.",
    storySlides: [
      "Unripe green plantain has a Glycemic Index of ~40. It feeds beneficial Bifidobacteria in your colon and produces zero sugar spike.",
      "As enzymes break down starch during ripening, the GI climbs above 70 in soft, spotted yellow plantain.",
      "Clinical strategy: If you have diabetes or insulin resistance, prioritize green plantain flour, boiled green plantain, or semi-ripe plantain."
    ],
    takeaway: "Choose unripe green or semi-ripe plantain for diabetes management and gut microbiome health.",
    quiz: {
      question: "What happens to the carbohydrate structure of plantain as it ripens from green to yellow?",
      options: ["It turns into pure protein", "Prebiotic resistant starch converts into fast-absorbing simple sugars", "The fiber triples", "It loses all calories"],
      correctIndex: 1,
      explanation: "Enzymatic ripening converts complex resistant starch chains into simple fructose and glucose."
    }
  },
  {
    id: "lesson-26",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "Wild Herbs & Micronutrients: Afang, Utazi & Oha Leaves",
    category: "Gut & Fiber",
    readTime: "90s Audio",
    icon: "🍃",
    headline: "Indigenous African wild leaves contain up to 8x more zinc, iron, and polyphenols.",
    audioScript: "Afang (Gnetum africanum), Utazi (Gongronema latifolium), and Oha (Pterocarpus soyauxii) are wild-harvested forest leaves with incredible therapeutic properties. Utazi contains natural hypoglycemic saponins, while Afang is dense in insoluble dietary fiber.",
    storySlides: [
      "Cultivated hybrid vegetables often lose micronutrient density. Wild African greens maintain rich mineral concentrations.",
      "Gongronema latifolium (Utazi) is traditionally chewed after meals to stimulate digestive bile and reduce postprandial hyperglycemia.",
      "Oha leaves provide natural mucilaginous fiber and potent flavonoid antioxidants (quercetin and kaempferol)."
    ],
    takeaway: "Diversify your soups with authentic wild leaves like Afang, Utazi, and Oha for micronutrient defense.",
    quiz: {
      question: "Which bitter wild leaf is traditionally used across West Africa for its blood sugar lowering saponins?",
      options: ["Utazi (Gongronema latifolium)", "Iceberg Lettuce", "White Cabbage", "Cucumber skin"],
      correctIndex: 0,
      explanation: "Utazi leaves are packed with bioactive saponins and flavonoids that improve insulin sensitivity."
    }
  },
  {
    id: "lesson-27",
    tier: 3,
    tierName: "Cultural Biochemistry & Cooking",
    title: "Safe Salt Swaps: Potassium Salt & Herbal Seasoning Blends",
    category: "Heart & BP",
    readTime: "90s Audio",
    icon: "🧂",
    headline: "Reducing dietary sodium by 1,000mg daily drops stroke risk by 23%.",
    audioScript: "Excess sodium intake is the single largest dietary driver of stroke and hypertension across the African diaspora. By blending potassium-rich salt substitutes with dried garlic, ginger, crayfish, and rosemary, you maintain full savory flavor without raising your blood pressure.",
    storySlides: [
      "The body requires a balanced 2:1 Potassium-to-Sodium ratio. Modern processed diets have inverted this to 1:4 Sodium-to-Potassium.",
      "Low-sodium mineral salts replace 50% of sodium chloride with potassium chloride, delivering direct arterial relaxation.",
      "Herbal seasonings (thyme, rosemary, dried bay leaf, crushed Ehuru) trick taste buds by enhancing aroma and umami perception."
    ],
    takeaway: "Use potassium-enhanced mineral salts and rich herbal seasonings to protect your cardiovascular system.",
    quiz: {
      question: "What is the healthy ideal dietary ratio of Potassium to Sodium for blood pressure regulation?",
      options: ["10:1 Sodium to Potassium", "2:1 Potassium to Sodium", "1:100 Potassium to Sodium", "Zero Potassium"],
      correctIndex: 1,
      explanation: "Consuming twice as much potassium as sodium prompts kidneys to excrete excess fluid and relax arterial walls."
    }
  },

  // --------------------------------------------------------------------------
  // TIER 4: LONGEVITY, FASTING & CIRCADIAN BIO-HACKING (Lessons 28 - 36)
  // --------------------------------------------------------------------------
  {
    id: "lesson-28",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "Taming the Dawn Phenomenon: The High-Protein Bedtime Snack",
    category: "Glucose Science",
    readTime: "90s Audio",
    icon: "🌅",
    headline: "Why your morning fasting blood sugar is high even when you didn't eat dinner.",
    audioScript: "The Dawn Phenomenon occurs when your liver releases stored glucose (glycogenolysis) between 4 AM and 8 AM triggered by morning cortisol surges. Eating a small high-protein snack before bed—like 1 boiled egg or 3 spoons of Greek yogurt—signals the liver to suppress overnight glucose output.",
    storySlides: [
      "Many diabetics wake up to fasting glucose numbers of 140+ mg/dL despite eating zero carbs the night before.",
      "During early morning hours, cortisol, growth hormone, and glucagon surge to prepare you for waking, prompting the liver to dump glucose.",
      "Consuming 10g of clean protein with healthy fats 45 minutes before sleep keeps basal insulin steady and prevents liver hepatic glucose dumps."
    ],
    takeaway: "Try a bedtime snack of 1 boiled egg or a spoonful of almond butter to blunt morning fasting glucose spikes.",
    quiz: {
      question: "What organ is responsible for dumping stored glucose during early morning hours in the Dawn Phenomenon?",
      options: ["The Liver (via hepatic glycogenolysis)", "The Lungs", "The Spleen", "The Gallbladder"],
      correctIndex: 0,
      explanation: "The liver releases stored glycogen in response to morning cortisol and growth hormone surges."
    }
  },
  {
    id: "lesson-29",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "16/8 Intermittent Fasting with African Dishes",
    category: "Hormones & Longevity",
    readTime: "90s Audio",
    icon: "⏳",
    headline: "Aligning your 8-hour eating window triggers autophagy and cellular mitochondrial renewal.",
    audioScript: "Intermittent Fasting (16 hours fasting, 8 hours eating) gives your digestive system a break, lowering baseline insulin and activating cellular autophagy. An ideal African fasting window is 11 AM to 7 PM, breaking your fast with protein-rich Akara or boiled eggs rather than heavy starch.",
    storySlides: [
      "During the 16-hour fasting window, liver glycogen depletes and your body switches to burning visceral body fat for fuel (ketogenesis).",
      "Autophagy cleans out damaged cellular proteins, misfolded enzymes, and senescent zombie cells.",
      "Break your fast gently: Start with water, bone broth, or egg and avocado. Save your complex swallow or rice for your second meal."
    ],
    takeaway: "Fast for 16 hours, eat within an 8-hour window, and break your fast with clean protein and fiber.",
    quiz: {
      question: "What cellular rejuvenation process is triggered during a 16-hour intermittent fast?",
      options: ["Autophagy (cellular cleanup and recycling)", "Immediate muscle wasting", "Permanent dehydration", "Glycogen overload"],
      correctIndex: 0,
      explanation: "Autophagy clears out dysfunctional cellular debris and enhances mitochondrial metabolic efficiency."
    }
  },
  {
    id: "lesson-30",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "The 10-Minute Post-Swallow Walk: GLUT-4 Muscle Uptake",
    category: "Glucose Science",
    readTime: "90s Audio",
    icon: "🚶‍♂️",
    headline: "Walking for just 10 minutes right after your swallow meal pulls glucose into muscles without insulin.",
    audioScript: "When you walk immediately after eating a meal, your contracting leg muscles activate GLUT-4 glucose transporters directly. This pulls glucose out of your bloodstream independent of insulin, cutting postprandial glucose spikes by up to 35 percent.",
    storySlides: [
      "Sitting on the couch or sleeping immediately after a heavy swallow meal traps glucose in your bloodstream.",
      "Muscle contraction acts like an insulin bypass: mechanical tension translocates GLUT-4 channels to cell membranes.",
      "A simple 10-minute leisurely stroll around your compound or living room is clinically as effective as oral diabetes medication."
    ],
    takeaway: "Commit to a 10-minute post-meal walk after your largest meal of the day.",
    quiz: {
      question: "How does a 10-minute walk immediately after eating lower blood sugar without extra insulin?",
      options: ["It burns all calories instantly", "Muscle contractions mechanically activate GLUT-4 glucose transporters", "It freezes the stomach", "It eliminates stomach acid"],
      correctIndex: 1,
      explanation: "Contracting skeletal muscles translocate GLUT-4 transporters to cell surfaces, absorbing glucose without insulin."
    }
  },
  {
    id: "lesson-31",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "Cortisol & Night Swallows: Why Late Heavy Eba Disrupts Deep Sleep",
    category: "Hormones & Longevity",
    readTime: "90s Audio",
    icon: "🌙",
    headline: "Eating massive carbohydrate meals past 8:30 PM halts nighttime growth hormone and Melatonin.",
    audioScript: "Digestive thermogenesis from heavy starches late at night elevates core body temperature and spikes insulin. This suppresses natural nocturnal Melatonin and Human Growth Hormone (HGH) release, causing micro-awakenings, poor sleep quality, and high morning blood pressure.",
    storySlides: [
      "Deep Stage-3 slow-wave sleep requires core body temperature to drop by approximately 1°C.",
      "Digesting a massive ball of Eba or Pounded Yam at 9:30 PM forces the gastrointestinal tract to generate heat and elevates heart rate by 10-15 beats per minute.",
      "Solution: Eat dinner at least 3 hours before sleep. If eating late, choose light fish pepper soup, steamed vegetables, or grilled chicken."
    ],
    takeaway: "Finish heavy starch swallows by 7:00 PM; keep late-night dining light and protein-focused.",
    quiz: {
      question: "Why does eating a heavy swallow dinner immediately before bed harm sleep quality?",
      options: ["It turns you into an early bird", "It elevates core body temperature and spikes nighttime insulin, suppressing deep sleep", "It permanently cures insomnia", "It lowers blood pressure to zero"],
      correctIndex: 1,
      explanation: "Late digestion elevates core body temperature and heart rate, preventing restorative slow-wave sleep."
    }
  },
  {
    id: "lesson-32",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "GLP-1 & Peptide Cascades with African Fish & Awara",
    category: "Hormones & Longevity",
    readTime: "90s Audio",
    icon: "🐟",
    headline: "How bioavailable marine peptides and soy Awara trigger natural gastric slowing.",
    audioScript: "Pharmaceutical GLP-1 agonists mimic natural gut hormones. You can stimulate your body's own GLP-1, Cholecystokinin (CCK), and PYY by pairing intact dietary proteins like grilled Titus fish, catfish, and Awara with soluble mucilage fibers.",
    storySlides: [
      "Marine peptides from wild African fish trigger intense enteroendocrine signaling along the ileum.",
      "When combined with viscous vegetable fiber, gastric transit slows down naturally, keeping you full for 5+ hours with zero food noise.",
      "This natural peptide surge preserves lean muscle mass while accelerating visceral belly fat reduction."
    ],
    takeaway: "Build every meal around a solid anchor of African fish, lean poultry, or soy Awara.",
    quiz: {
      question: "What combination of nutrients produces the strongest natural satiety peptide (GLP-1/PYY) response?",
      options: ["Pure table sugar and alcohol", "Intact dietary protein combined with soluble mucilage fiber", "Refined white flour alone", "Zero-protein high-fat snacks"],
      correctIndex: 1,
      explanation: "Amino acids combined with viscous soluble fiber maximize enteroendocrine L-cell hormone secretion."
    }
  },
  {
    id: "lesson-33",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "Gut Microbiome Diversity: The 30+ African Plant Variety Rule",
    category: "Gut & Fiber",
    readTime: "90s Audio",
    icon: "🌱",
    headline: "People who eat 30 different plant varieties per week have 5x more longevity-associated gut flora.",
    audioScript: "The American Gut Project proved that the single greatest predictor of a healthy microbiome is plant diversity. Across West Africa, our culinary heritage provides dozens of wild leaves, spices, beans, seeds, and tubers. Eating 30 unique plants weekly fuels diverse bacterial species that produce longevity metabolites.",
    storySlides: [
      "Every plant contains unique polyphenols, insoluble fibers, and resistant starches that feed specific bacterial strains.",
      "African heritage ingredients make hitting 30 easy: Ugwu, Bitter leaf, Okra, Ogbono, Egusi, Iru, Ginger, Garlic, Uda, Uziza, Ehuru, Fonio, Brown beans, Sweet potato, and Zobo count toward your weekly total.",
      "A diverse microbiome strengthens the intestinal epithelial wall and dramatically lowers systemic chronic inflammation."
    ],
    takeaway: "Count your plant diversity weekly; aim for 30 distinct African vegetables, spices, grains, and seeds.",
    quiz: {
      question: "What weekly dietary goal is most strongly linked to rich gut bacterial diversity and longevity?",
      options: ["Eating only 1 single food item every day", "Consuming 30 or more diverse plant foods (greens, herbs, spices, seeds) weekly", "Drinking 10 liters of soda", "Avoiding all vegetables"],
      correctIndex: 1,
      explanation: "Consuming 30+ diverse plant varieties feeds diverse microbial colonies in the colon."
    }
  },
  {
    id: "lesson-34",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "Blood Pressure Circadian Rhythms: Morning vs. Evening Potassium",
    category: "Heart & BP",
    readTime: "90s Audio",
    icon: "❤️",
    headline: "Optimizing the timing of your potassium-rich meals to prevent nocturnal non-dipping hypertension.",
    audioScript: "Healthy blood pressure should naturally dip by 10 to 20% during sleep. In individuals with 'non-dipping' hypertension, nighttime blood pressure remains high. Consuming potassium-rich vegetables (Ugwu and Waterleaf) at dinner prompts nighttime renal sodium excretion, restoring healthy nocturnal dipping.",
    storySlides: [
      "Non-dipping hypertension is a major risk factor for early morning hemorrhagic strokes and heart failure.",
      "Kidneys follow a strict circadian clock: evening potassium prompts distal tubules to dump sodium while you sleep.",
      "Enjoying a rich vegetable-dense dinner lowers vascular tension and protects cerebral vessels overnight."
    ],
    takeaway: "Front-load rich leafy green vegetables in your evening dinner to support healthy nocturnal BP dipping.",
    quiz: {
      question: "What is 'nocturnal dipping' in healthy blood pressure circadian biology?",
      options: ["A 10-20% natural reduction in blood pressure during nighttime sleep", "Blood pressure spiking to 200 mmHg at midnight", "Complete stopping of blood circulation", "A drop in body weight"],
      correctIndex: 0,
      explanation: "Healthy cardiovascular circadian biology features a 10-20% drop in blood pressure during sleep."
    }
  },
  {
    id: "lesson-35",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "Longevity Bio-Markers: Fasting Insulin, Triglycerides & eA1c",
    category: "Glucose Science",
    readTime: "90s Audio",
    icon: "📊",
    headline: "The Triglyceride-to-HDL ratio is a more accurate predictor of cardiovascular health than total cholesterol.",
    audioScript: "Standard fasting blood sugar tests often miss early insulin resistance by up to 10 years. By tracking your Fasting Insulin, Triglyceride-to-HDL ratio (target under 2.0), and estimated A1c, you catch metabolic dysfunction at the cellular level decades before symptoms arise.",
    storySlides: [
      "Fasting glucose can remain 'normal' for years because the pancreas works overtime pumping out massive insulin to keep it down.",
      "Measuring Fasting Insulin alongside Fasting Glucose gives you your HOMA-IR score (Homeostatic Model Assessment of Insulin Resistance).",
      "A Triglyceride to HDL ratio under 1.5 indicates clean insulin sensitivity and healthy small-dense LDL particle size."
    ],
    takeaway: "Request Fasting Insulin and a full lipid panel annually to monitor true metabolic longevity.",
    quiz: {
      question: "What Triglyceride-to-HDL ratio target indicates optimal insulin sensitivity and vascular health?",
      options: ["Over 10.0", "Under 2.0 (ideally under 1.5)", "Exactly 50.0", "Negative 5.0"],
      correctIndex: 1,
      explanation: "A Triglyceride-to-HDL ratio under 2.0 reflects healthy insulin sensitivity and low small-dense atherogenic LDL."
    }
  },
  {
    id: "lesson-36",
    tier: 4,
    tierName: "Longevity, Fasting & Circadian Bio-Hacking",
    title: "Becoming a Certified Metabolic Champion: The Lifelong Blueprint",
    category: "Hormones & Longevity",
    readTime: "90s Audio",
    icon: "👑",
    headline: "The complete synthesis: Combining African culinary heritage with cutting-edge metabolic medicine.",
    audioScript: "Congratulations on reaching the final masterclass lesson! You now hold the clinical knowledge to master your blood sugar, protect your cardiovascular system, and optimize your longevity—all while celebrating the rich culinary heritage of Africa. You are officially a Certified African Metabolic Champion.",
    storySlides: [
      "You have mastered the 4 Core Pillars: 1) Food Sequencing, 2) Portion Geometry, 3) Organ Shields, and 4) Circadian Lifestyle Timing.",
      "Cultural food is not the enemy of health; unbuffered refined processing was the problem. You now possess the scientific blueprint to thrive.",
      "Share your knowledge with your family circle, inspire your community, and live a vibrant, energized life."
    ],
    takeaway: "You are a Certified African Metabolic Champion! Share your certification credential with pride.",
    quiz: {
      question: "What is the ultimate core philosophy of MealOptimiza?",
      options: ["Abandon all African food forever", "Harmonize authentic African culinary heritage with clinical metabolic science for lifelong vitality", "Eat only raw kale and lettuce", "Never eat dinner"],
      correctIndex: 1,
      explanation: "MealOptimiza empowers you to master blood sugar and longevity while celebrating authentic cultural heritage."
    }
  }
];

export default function AvoAcademy() {
  const { user } = useUser();
  const [selectedTier, setSelectedTier] = useState<AcademyTier>(1);
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [playingAudioLessonId, setPlayingAudioLessonId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateTier, setCertificateTier] = useState<AcademyTier>(1);

  // Persistence for completed lessons & XP
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("avo_completed_academy_lessons");
      return saved ? JSON.parse(saved) : ["lesson-1", "lesson-2"];
    } catch {
      return ["lesson-1", "lesson-2"];
    }
  });

  const [totalAcademyXp, setTotalAcademyXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("avo_academy_total_xp");
      return saved ? parseInt(saved, 10) : 150;
    } catch {
      return 150;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("avo_completed_academy_lessons", JSON.stringify(completedLessonIds));
      localStorage.setItem("avo_academy_total_xp", totalAcademyXp.toString());
    } catch {}
  }, [completedLessonIds, totalAcademyXp]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSarahSpeech();
    };
  }, []);

  // Compute today's featured lesson of the day (Duolingo-style Daily Drop)
  const todayLesson = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = Math.abs(dayOfYear) % LESSONS.length;
    return LESSONS[index] || LESSONS[0];
  }, []);

  // Filter lessons by Tier
  const tierLessons = useMemo(() => {
    return LESSONS.filter((l) => l.tier === selectedTier);
  }, [selectedTier]);

  // Tier Completion stats
  const tierStats = useMemo(() => {
    const counts: Record<AcademyTier, { total: number; completed: number }> = {
      1: { total: 9, completed: 0 },
      2: { total: 9, completed: 0 },
      3: { total: 9, completed: 0 },
      4: { total: 9, completed: 0 },
    };

    LESSONS.forEach((l) => {
      if (completedLessonIds.includes(l.id)) {
        counts[l.tier].completed += 1;
      }
    });

    return counts;
  }, [completedLessonIds]);

  // Start a lesson
  const handleStartLesson = (lesson: AcademyLesson) => {
    triggerHaptic("medium");
    setActiveLesson(lesson);
    setCurrentSlideIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  };

  // Audio Play/Pause with Sarah AI
  const handleToggleAudio = (e: React.MouseEvent, lesson: AcademyLesson) => {
    e.stopPropagation();
    triggerHaptic("light");

    if (playingAudioLessonId === lesson.id && isAudioPlaying) {
      stopSarahSpeech();
      setIsAudioPlaying(false);
      setPlayingAudioLessonId(null);
    } else {
      stopSarahSpeech();
      setPlayingAudioLessonId(lesson.id);
      setIsAudioPlaying(true);

      const scriptToRead = `${lesson.title}. ${lesson.audioScript} Key Clinical Takeaway: ${lesson.takeaway}`;

      speakWithSarah(scriptToRead, {
        onStart: () => setIsAudioPlaying(true),
        onEnd: () => {
          setIsAudioPlaying(false);
          setPlayingAudioLessonId(null);
          toast.success("Lesson audio completed! 🎧 (+10 XP)");
          setTotalAcademyXp((prev) => prev + 10);
        },
        onError: () => {
          setIsAudioPlaying(false);
          setPlayingAudioLessonId(null);
        },
      });
    }
  };

  // Next slide
  const handleNextSlide = () => {
    triggerHaptic("light");
    if (!activeLesson) return;
    if (currentSlideIndex < activeLesson.storySlides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      // Move to quiz phase
      setCurrentSlideIndex(activeLesson.storySlides.length);
    }
  };

  // Select Quiz Option
  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    triggerHaptic("light");
    setSelectedAnswer(idx);
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (selectedAnswer === null || !activeLesson) return;
    setQuizSubmitted(true);

    const isCorrect = selectedAnswer === activeLesson.quiz.correctIndex;
    if (isCorrect) {
      triggerHaptic("success");
      triggerConfetti();
      const xpBonus = activeLesson.id === todayLesson.id ? 50 : 25;
      setTotalAcademyXp((prev) => prev + xpBonus);

      if (!completedLessonIds.includes(activeLesson.id)) {
        const nextCompleted = [...completedLessonIds, activeLesson.id];
        setCompletedLessonIds(nextCompleted);

        // Check if Tier is newly completed
        const currentTierLessons = LESSONS.filter((l) => l.tier === activeLesson.tier);
        const allTierDone = currentTierLessons.every((l) => nextCompleted.includes(l.id));
        if (allTierDone) {
          setTimeout(() => {
            setCertificateTier(activeLesson.tier);
            setShowCertificateModal(true);
          }, 800);
        }
      }

      toast.success(`100% Correct! +${xpBonus} XP added to your Streak! 🎉`);
    } else {
      triggerHaptic("warning");
      toast.info("Good effort! Read Avo's Clinical Review Note below 📝");
    }
  };

  const getTierBadgeTitle = (tier: AcademyTier) => {
    switch (tier) {
      case 1:
        return "🥉 Heritage Nutrition Foundations";
      case 2:
        return "🥈 Clinical Organ Shield Specialist";
      case 3:
        return "🥇 African Culinary Bio-Chemist";
      case 4:
        return "👑 Master African Metabolic Champion";
    }
  };

  return (
    <div className="space-y-4">
      {/* =================================================================== */}
      {/* 1. DUOLINGO-STYLE "TODAY'S 90-SECOND METABOLIC DROP" HERO BANNER     */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden glass-card-teal rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-white/30">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -inset-1 rounded-2xl bg-amber-400/40 animate-pulse-radar pointer-events-none" />
              <div className="relative bg-white/20 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-white/20">
                <Flame className="h-6 w-6 text-amber-300 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                  🔥 7-DAY STUDY STREAK
                </span>
                <span className="text-[10px] font-bold text-purple-200">
                  Total XP: <strong className="text-amber-300 font-black">{totalAcademyXp} XP</strong>
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight mt-1">
                Today's 90s Drop: {todayLesson.title}
              </h3>
              <p className="text-[11px] text-purple-200/90 font-medium line-clamp-1 mt-0.5">
                {todayLesson.headline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => handleToggleAudio(e, todayLesson)}
              className={`px-3 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                playingAudioLessonId === todayLesson.id && isAudioPlaying
                  ? "bg-amber-400 text-slate-950 shadow-md animate-pulse"
                  : "bg-white/20 hover:bg-white/30 text-white border border-white/20"
              }`}
            >
              {playingAudioLessonId === todayLesson.id && isAudioPlaying ? (
                <>
                  <Pause size={14} />
                  <span>Pause Audio</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} className="text-amber-300" />
                  <span>Listen (90s) 🎧</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleStartLesson(todayLesson)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 text-xs font-black rounded-2xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Start Quiz (+50 XP)</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. 4-TIER PROGRESSION TRACK SWITCHER (TIER 1 TO TIER 4)              */}
      {/* =================================================================== */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3.5 shadow-md border border-teal-100/90 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#1f7a8c]" />
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Metabolic Masterclass Curriculum
            </span>
          </div>
          <span className="text-[10px] font-bold text-gray-500">
            {completedLessonIds.length} of {LESSONS.length} Lessons Completed (
            {Math.round((completedLessonIds.length / LESSONS.length) * 100)}%)
          </span>
        </div>

        {/* 4-Tier Segmented Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { tier: 1 as AcademyTier, label: "Tier 1: Foundations", icon: "🌱", color: "from-emerald-600 to-teal-600" },
            { tier: 2 as AcademyTier, label: "Tier 2: Organ Shields", icon: "🛡️", color: "from-blue-600 to-cyan-600" },
            { tier: 3 as AcademyTier, label: "Tier 3: Culinary Bio", icon: "🍲", color: "from-amber-600 to-orange-600" },
            { tier: 4 as AcademyTier, label: "Tier 4: Longevity & Fast", icon: "👑", color: "from-purple-600 to-pink-600" },
          ].map((t) => {
            const isSelected = selectedTier === t.tier;
            const stat = tierStats[t.tier];
            const isCompleted = stat.completed === stat.total;

            return (
              <button
                key={t.tier}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedTier(t.tier);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                    : "bg-slate-50 dark:bg-zinc-800/60 hover:bg-teal-50 border-slate-200/80 dark:border-zinc-700 text-slate-800 dark:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{t.icon}</span>
                  {isCompleted ? (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                      <Check size={10} /> Certified
                    </span>
                  ) : (
                    <span
                      className={`text-[9.5px] font-mono font-bold ${
                        isSelected ? "text-teal-300" : "text-slate-500"
                      }`}
                    >
                      {stat.completed}/{stat.total}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-black leading-tight truncate">{t.label}</div>
                  <div className="w-full bg-black/20 h-1 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(stat.completed / stat.total) * 100}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. TIER LESSONS GRID (9 LESSONS PER TIER)                            */}
      {/* =================================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {selectedTier === 1 && "Tier 1: Cultural Food Foundations & Sequencing (9 Lessons)"}
            {selectedTier === 2 && "Tier 2: Organ-Specific Metabolic Shields (9 Lessons)"}
            {selectedTier === 3 && "Tier 3: Cultural Biochemistry & Culinary Masterclass (9 Lessons)"}
            {selectedTier === 4 && "Tier 4: Longevity, Fasting & Circadian Bio-Hacking (9 Lessons)"}
          </span>

          {tierStats[selectedTier].completed === tierStats[selectedTier].total && (
            <button
              type="button"
              onClick={() => {
                setCertificateTier(selectedTier);
                setShowCertificateModal(true);
              }}
              className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Award size={13} />
              <span>View Credential 📜</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {tierLessons.map((lesson, idx) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isAudioActive = playingAudioLessonId === lesson.id && isAudioPlaying;

            return (
              <div
                key={lesson.id}
                onClick={() => handleStartLesson(lesson)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] group hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
                  isCompleted
                    ? "bg-white dark:bg-zinc-900 border-teal-200/80 dark:border-zinc-800"
                    : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{lesson.icon}</span>
                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Done
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-zinc-800 dark:text-zinc-300">
                          +25 XP
                        </span>
                      )}

                      {/* Sarah Audio Trigger Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleAudio(e, lesson)}
                        title="Listen to 90s Sarah Audio"
                        className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                          isAudioActive
                            ? "bg-amber-400 text-slate-950 animate-bounce"
                            : "bg-teal-50 hover:bg-teal-100 text-[#1f7a8c] dark:bg-zinc-800 dark:text-teal-300"
                        }`}
                      >
                        {isAudioActive ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-[#1f7a8c] dark:text-teal-400 block leading-tight">
                    Lesson {idx + 1} · {lesson.category}
                  </span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug mt-1 group-hover:text-teal-700 transition-colors">
                    {lesson.title}
                  </h4>
                </div>

                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 font-medium">
                  {lesson.headline}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. LESSON VIEWER & QUIZ MODAL                                       */}
      {/* =================================================================== */}
      {activeLesson && (
        <Dialog open={!!activeLesson} onOpenChange={(open) => !open && setActiveLesson(null)}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6">
            <DialogHeader className="text-left pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300">
                  {activeLesson.tierName} · Lesson
                </span>

                <button
                  type="button"
                  onClick={(e) => handleToggleAudio(e, activeLesson)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    playingAudioLessonId === activeLesson.id && isAudioPlaying
                      ? "bg-amber-400 text-slate-950 shadow-xs animate-pulse"
                      : "bg-teal-50 hover:bg-teal-100 text-[#1f7a8c] border border-teal-200/60"
                  }`}
                >
                  <Volume2 size={13} />
                  <span>{isAudioPlaying && playingAudioLessonId === activeLesson.id ? "Pause Voice" : "Listen (Sarah AI)"}</span>
                </button>
              </div>

              <DialogTitle className="text-base font-black text-gray-900 dark:text-white mt-2">
                {activeLesson.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-600 dark:text-gray-300">
                {activeLesson.headline}
              </DialogDescription>
            </DialogHeader>

            {/* SLIDES PHASE */}
            {currentSlideIndex < activeLesson.storySlides.length ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-teal-50/70 to-emerald-50/50 dark:from-zinc-800 dark:to-zinc-800/80 p-4 sm:p-5 rounded-2xl border border-teal-100 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                      Slide {currentSlideIndex + 1} of {activeLesson.storySlides.length}
                    </span>
                    <Mascot gesture="waving" size={30} />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                    {activeLesson.storySlides[currentSlideIndex]}
                  </p>
                </div>

                {/* Dots indicator */}
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

                <Button
                  onClick={handleNextSlide}
                  className="w-full bg-gradient-to-r from-[#126778] to-[#2a9d8f] text-white h-11 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>
                    {currentSlideIndex === activeLesson.storySlides.length - 1
                      ? "Take Science Mastery Quiz (+25 XP) 🎯"
                      : "Next Slide →"}
                  </span>
                </Button>
              </div>
            ) : (
              /* QUIZ PHASE */
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-300 mb-1">
                    <Sparkles size={13} />
                    <span>Quick Science Mastery Quiz</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
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
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={quizSubmitted}
                        className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && isCorrect && <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />}
                        {quizSubmitted && isSelected && !isCorrect && <XCircle size={15} className="text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Mascot */}
                {quizSubmitted && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    {selectedAnswer === activeLesson.quiz.correctIndex ? (
                      <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-zinc-800 dark:to-zinc-900 rounded-3xl border-2 border-emerald-400 text-center">
                        <Mascot gesture="clapping" size={100} className="drop-shadow-md my-1" />
                        <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black mt-1">
                          Avo Claps: 100% Correct! 👏🎉
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-zinc-800 rounded-2xl border border-amber-300 text-center">
                        <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                          Avo's Clinical Review Note 📝
                        </span>
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs space-y-2">
                      <p className="font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {activeLesson.quiz.explanation}
                      </p>
                      <div className="p-2 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-800 dark:text-teal-300 font-medium text-[11px]">
                        💡 <strong>Clinical Takeaway:</strong> {activeLesson.takeaway}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!quizSubmitted ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswer === null}
                    className="w-full bg-gradient-to-r from-[#126778] to-[#2a9d8f] text-white h-11 rounded-2xl font-black text-xs shadow-md cursor-pointer disabled:opacity-60"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveLesson(null)}
                    className="w-full bg-slate-900 hover:bg-black text-white h-11 rounded-2xl font-black text-xs cursor-pointer"
                  >
                    Collect XP &amp; Return
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* =================================================================== */}
      {/* 5. TIER CERTIFICATION MILESTONE SHARE MODAL                         */}
      {/* =================================================================== */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="max-w-md p-6 text-center rounded-3xl">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-3xl text-3xl mb-3 shadow-md">
              👑
            </div>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Tier {certificateTier} Certification Unlocked!
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              You have completed all 9 clinical lessons in {getTierBadgeTitle(certificateTier)}.
            </DialogDescription>

            {/* Certificate Card Preview */}
            <div className="w-full my-4 p-5 bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl border-2 border-amber-400 shadow-xl space-y-3 text-center relative overflow-hidden">
              <div className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">
                OFFICIAL CERTIFICATE OF METABOLIC MASTERY
              </div>
              <h3 className="text-base font-black text-white">
                {user?.name || "Metabolic Health Champion"}
              </h3>
              <p className="text-xs text-teal-200 font-bold">
                {getTierBadgeTitle(certificateTier)}
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                <span>MealOptimiza Clinical Academy</span>
                <span>Verified Credential</span>
              </div>
            </div>

            {/* Share Triggers */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={() => {
                  const shareText = `🎓 I just completed ${getTierBadgeTitle(certificateTier)} on MealOptimiza! Mastering cultural metabolic nutrition, glucose curves, and longevity. Check it out at mealoptimiza.com`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
                }}
                className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Share2 size={14} />
                <span>Share Credential to WhatsApp</span>
              </button>

              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText("https://mealoptimiza.com/academy");
                  toast.success("Credential link copied to clipboard!");
                }}
                className="w-full h-10 rounded-2xl text-xs font-bold"
              >
                <Copy size={13} className="mr-1.5" />
                <span>Copy Shareable Link</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
