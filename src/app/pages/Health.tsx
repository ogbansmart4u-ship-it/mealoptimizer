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

export type EducationalCategory = "all" | "sugar" | "heart" | "herbs" | "metabolism" | "gain" | "drugs";

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
    categoryLabel: "Blood Sugar & Steady Energy",
    title: "How to Enjoy Swallow & Rice Without Blood Sugar Spikes",
    icon: "🥣",
    color: "text-rose-700 dark:text-rose-400",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900",
    readTime: "2 min read",
    headline: "Enjoy your favorite cultural meals while keeping your blood sugar calm and steady.",
    clinicalImpact: "Helps prevent sudden afternoon sugar crashes & fatigue",
    recommendedFor: ["diabetes", "type 2 diabetes", "prediabetes", "insulin resistance", "metabolic", "sugar"],
    summary:
      "You do not have to give up pounded yam, eba, or rice! When you pair your favorite swallow with drawing vegetable soups (like Ewedu, Okra, or Ogbono) or allow boiled yams and rice to cool slightly before eating, your body absorbs the carbohydrates much more slowly and smoothly.",
    keyBiomarkers: [
      { name: "Morning Fasting Sugar", target: "Under 100 mg/dL (5.6 mmol/L)", note: "Your baseline blood sugar when you wake up in the morning." },
      { name: "2 Hours After Eating", target: "Under 140 mg/dL (7.8 mmol/L)", note: "How smoothly your body turns your meal into steady energy." },
      { name: "3-Month Average (HbA1c)", target: "Under 6.5% - 7.0%", note: "Your overall blood sugar health over the last 3 months." },
    ],
    eatThisVsModerate: [
      { eat: "Oat swallow, Unripe Plantain, Guinea Corn (Akaru/Baba)", moderate: "Oversized mounds of white Garri or instant starch", reason: "Rich in natural fiber that digests slowly and keeps you full for hours." },
      { eat: "Generous Okra, Ewedu, or Ogbono soup on your plate", moderate: "Eating swallow dry without enough vegetable soup", reason: "The natural drawing texture coats the stomach and prevents quick sugar rushes." },
      { eat: "Fresh fish, boiled eggs, or beans alongside your meal", moderate: "Sugary sodas, sweet malt drinks, and energy drinks", reason: "Protein helps you stay satisfied and prevents afternoon slumps." },
    ],
    actionableHabits: [
      "The 'Soup First' Habit: Enjoy 3-4 spoonfuls of rich vegetable soup before taking your first bite of swallow.",
      "The 'Cook & Cool' Secret: Cook boiled sweet potatoes, yams, or rice ahead of time—cooling them slightly makes them gentler on blood sugar.",
      "Gentle 10-Minute Walk: A calm 10-minute stroll after lunch or dinner helps your muscles use food energy immediately.",
    ],
    scientificReference: "Nigerian Journal of Nutritional Sciences & Global Metabolic Health Guidelines",
    quiz: {
      question: "Which soup texture naturally helps keep your blood sugar steady after eating swallow?",
      options: [
        "Heavy bleached palm oil with excess salt",
        "Natural drawing soup like Ewedu, Okra, or Ogbono",
        "Extra seasoning cubes in the soup",
        "Eating the swallow cold with no soup",
      ],
      correctIndex: 1,
      explanation: "Drawing soups like Ewedu and Okra create a natural soothing barrier in your digestive tract that slows down digestion and prevents sudden sugar spikes!",
    },
  },
  {
    id: "hypertension-sodium-balance",
    category: "heart",
    categoryLabel: "Heart Health & Calm Pressure",
    title: "Delicious Low-Salt Flavor Secrets for Nigerian Soups",
    icon: "❤️",
    color: "text-red-700 dark:text-red-400",
    badgeBg: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900",
    readTime: "3 min read",
    headline: "How to make mouthwatering soups with less salt by using rich traditional spices.",
    clinicalImpact: "Supports calm, relaxed blood pressure & healthy kidneys",
    recommendedFor: ["hypertension", "high blood pressure", "heart", "cardiovascular", "stroke", "blood pressure"],
    summary:
      "You do not need 4 seasoning cubes for soup to taste incredible! Traditional West African ingredients like fermented locust beans (Iru/Dawadawa), dried crayfish, garlic, ginger, and scent leaf deliver deep, mouthwatering savory flavor while protecting your heart and kidneys from excess salt.",
    keyBiomarkers: [
      { name: "Resting Blood Pressure", target: "Around 120/80 mmHg", note: "The gentle, relaxed pressure of blood moving through your arteries." },
      { name: "Daily Salt (Sodium)", target: "Under 2,000 mg daily", note: "Keeping salt moderate prevents water retention and puffy ankles." },
    ],
    eatThisVsModerate: [
      { eat: "Locust beans (Iru/Dawadawa), crayfish, garlic, ginger, scent leaf", moderate: "Dropping 3-4 commercial seasoning cubes into a single pot", reason: "Fermented Iru gives deep savory umami taste with zero industrial salt." },
      { eat: "Ugu (fluted pumpkin), spinach, plantain, garden eggs", moderate: "Heavily salted dry stockfish or canned processed meats", reason: "Packed with natural potassium that relaxes blood vessels and flushes excess water." },
      { eat: "Fresh homemade Zobo (Hibiscus) tea with ginger & cloves", moderate: "High-caffeine energy drinks with lots of added sugar", reason: "Natural Hibiscus is known to soothe blood vessels and promote calm circulation." },
    ],
    actionableHabits: [
      "The 'Half-Cube' Swap: Cut seasoning cubes in half and boost the rich flavor with ground crayfish, Iru, garlic, and thyme.",
      "Rinse Smoked Fish: Soak smoked fish or stockfish in warm water and discard the first rinse to wash away excess surface salt.",
      "Daily Hibiscus Cup: Enjoy 1 cup of unsweetened homemade Zobo infusion daily to promote relaxed circulation.",
    ],
    scientificReference: "West African Heart Health Guidelines & Cardiovascular Nutrition Science",
    quiz: {
      question: "What natural traditional seasoning provides deep savory flavor while cutting down excess salt?",
      options: [
        "Extra table salt and chemical crystals",
        "Fermented African Locust Beans (Iru / Dawadawa)",
        "Heavy salted potash (Kaun)",
        "Bleached burnt palm oil",
      ],
      correctIndex: 1,
      explanation: "Fermented locust beans (Iru/Dawadawa) deliver rich savory umami naturally, cutting down the need for salty seasoning cubes!",
    },
  },
  {
    id: "african-superfoods-herbs",
    category: "herbs",
    categoryLabel: "African Super-Greens & Herbs",
    title: "The Superpowers of Bitter Leaf, Ewedu & Ugu",
    icon: "🌿",
    color: "text-emerald-700 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900",
    readTime: "2 min read",
    headline: "How local vegetables boost your blood levels, cleanse your liver, and energize your body.",
    clinicalImpact: "Builds strong red blood cells & boosts natural vitality",
    recommendedFor: ["all", "general", "wellness", "cholesterol", "liver", "energy"],
    summary:
      "West African leafy greens are among the healthiest vegetables on the planet! Bitter Leaf helps your liver cleanse toxins, Ewedu supports smooth gut health, and Ugu (fluted pumpkin) is packed with natural iron and folate to keep your blood rich and your energy high.",
    keyBiomarkers: [
      { name: "Blood Level (Hemoglobin)", target: "12 - 16 g/dL", note: "The strength of your red blood cells carrying oxygen and stamina." },
      { name: "Liver Vitality", target: "Healthy & Clear", note: "Protected by natural bitter herbs and colorful leafy greens." },
    ],
    eatThisVsModerate: [
      { eat: "Freshly chopped Ugu added at the end of cooking with citrus/tomatoes", moderate: "Boiling vegetables for 30+ minutes until dark brown", reason: "Gentle cooking keeps vitamins alive; vitamin C helps your body absorb the iron." },
      { eat: "Bitter leaf with a gentle, mild bitter taste remaining", moderate: "Washing bitter leaf until 100% of the green juice is gone", reason: "That mild bitterness is where the cleansing, health-protecting nutrients live." },
      { eat: "Ukazi, Afang, Waterleaf, and Scent Leaf in weekly rotation", moderate: "Eating only 1 single type of vegetable every day", reason: "Mixing your greens gives your body a complete rainbow of vitamins." },
    ],
    actionableHabits: [
      "Gentle 3-Minute Steam: Add your leafy greens during the last 3 minutes of soup cooking so they stay bright green and vitamin-rich.",
      "Citrus Boost: Squeeze fresh lime or add fresh tomatoes to vegetable meals to help your body absorb twice as much iron.",
      "Morning Herbal Sip: A gentle cup of bitter leaf or moringa tea a couple of mornings a week wakes up your digestion.",
    ],
    scientificReference: "African Botanical Medicine & Nutritional Sciences",
    quiz: {
      question: "Why should you leave a little bit of the bitter taste when washing Bitter Leaf for soup?",
      options: [
        "Because the mild bitter taste holds the active nutrients that cleanse the liver and support digestion",
        "Because washing bitter leaf destroys food carbohydrates",
        "Because it makes the soup cook faster",
        "Because unwashed bitter leaf has no nutrients",
      ],
      correctIndex: 0,
      explanation: "That gentle natural bitterness comes from active plant compounds that support your liver, balance digestion, and protect your cells!",
    },
  },
  {
    id: "healthy-weight-muscle-gain",
    category: "gain",
    categoryLabel: "Weight & Muscle Building 💪",
    title: "How to Build Healthy Weight & Muscle with African Foods",
    icon: "💪",
    color: "text-emerald-700 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900",
    readTime: "3 min read",
    headline: "How to gain good weight, build strong muscle, and boost stamina with nutrient-dense African superfoods.",
    clinicalImpact: "+300-500 kcal clean daily surplus • Firm muscle without belly fat",
    recommendedFor: ["weight gain", "muscle", "underweight", "stamina", "fitness", "bodybuilding", "athletic", "gain"],
    summary:
      "Wanting to gain weight does NOT mean eating sugary junk foods or sodas that cause potbellies and sluggishness! The healthiest way to build firm muscle and gain good weight is through nutrient-dense African whole foods: hearty Egusi soup, Groundnut soup, Avocados, Mackerel fish, Boiled Eggs, Fortified Akamu with Milk & Peanuts, and wholesome Plantain & Beans.",
    keyBiomarkers: [
      { name: "Daily Calorie Surplus", target: "+300 to +500 kcal/day (2,450 kcal total)", note: "Gradually adds 0.5kg of healthy lean mass per week without sugar crashes." },
      { name: "Daily Protein Target", target: "1.6 - 2.0g per kg body weight (~130g/day)", note: "Provides essential building blocks for muscle repair, strength, and tone." },
      { name: "Healthy Fat Density", target: "~85g healthy fats daily", note: "From groundnuts, egusi, avocados, and whole eggs for clean, long-lasting energy." },
    ],
    eatThisVsModerate: [
      { eat: "Groundnut soup, rich Egusi soup with extra fish & eggs, Avocado with Plantain", moderate: "Deep-fried puff-puff, sugary pastries, and commercial sodas", reason: "Whole traditional fats build firm muscle and stamina; refined junk food only creates visceral belly fat and fatigue." },
      { eat: "Rich Akamu/Ogi fortified with whole milk, crushed peanuts & banana", moderate: "Plain watery Akamu with 4 spoons of white table sugar", reason: "Fortifying traditional porridge triples the protein and healthy calories without causing a sudden glucose crash." },
      { eat: "Beans paired with boiled ripe plantain, boiled eggs, and mackerel fish", moderate: "Skipping meals or eating only 1 huge late-night swallow", reason: "Spreading protein across 3 solid meals and 2 wholesome snacks ensures your body continually repairs and builds muscle." },
    ],
    actionableHabits: [
      "The 'Power Akamu' Bowl: Blend 2 tablespoons of peanut butter or crushed roasted groundnuts and whole milk into your morning Ogi for +350 clean calories.",
      "Eat Every 3-4 Hours: Have 3 hearty meals plus 2 nutrient-dense snacks (roasted groundnuts & bananas, boiled eggs, or avocado toast) daily.",
      "Strength & Resistance Work: Pair your extra calories with basic bodyweight squats, push-ups, or gym workouts so the food builds firm muscle instead of just soft fat.",
    ],
    scientificReference: "African Sports Nutrition Review & International Society of Sports Nutrition (ISSN)",
    quiz: {
      question: "What is the healthiest way to gain good weight and build muscle using African foods?",
      options: [
        "Drinking 3 bottles of sugary soda and eating pastries every day",
        "Eating nutrient-dense superfoods like Egusi, Groundnut soup, Eggs, Fish, and fortified Akamu with strength exercise",
        "Starving all day and eating 1 giant bowl of garri at midnight",
        "Avoiding all fats and eating only plain white rice",
      ],
      correctIndex: 1,
      explanation: "Nutrient-dense African staples like groundnuts, egusi, beans, eggs, and fish deliver clean calories and high protein to build healthy muscle without creating belly fat or sugar spikes!",
    },
  },
  {
    id: "pcos-hormonal-metabolism",
    category: "metabolism",
    categoryLabel: "Hormone Health & Belly Balance",
    title: "Balancing Hormones & Beating Belly Fat with African Meals",
    icon: "🥑",
    color: "text-purple-700 dark:text-purple-400",
    badgeBg: "bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900",
    readTime: "3 min read",
    headline: "How simple swaps in your breakfast and dinner help regulate cycles and calm cravings.",
    clinicalImpact: "Supports regular monthly cycles & steady waistline",
    recommendedFor: ["pcos", "fertility", "hormones", "weight loss", "acne", "women"],
    summary:
      "Hormonal challenges like irregular cycles, acne, and stubborn belly fat are often triggered by morning sugar rushes. Starting your day with protein (like boiled eggs, steamed Moi-Moi, or fish pepper soup) instead of sweet bread or sugary tea keeps cravings away all day.",
    keyBiomarkers: [
      { name: "Morning Energy & Craving Control", target: "Steady & Calm", note: "Staying fully energized without intense 3 PM sugar cravings." },
      { name: "Monthly Cycle Regularity", target: "Predictable & Smooth", note: "Promoted by balanced blood sugar and nourishing healthy fats." },
    ],
    eatThisVsModerate: [
      { eat: "Boiled eggs, steamed Moi-Moi, or warm fish pepper soup for breakfast", moderate: "White bread with sugary tea, pastries, or sweet puff puff", reason: "Savory protein prevents morning sugar spikes and keeps you satisfied till lunchtime." },
      { eat: "Avocado, walnuts, pumpkin seeds (Egusi), and groundnuts in good portions", moderate: "Deep-fried street snacks cooked in reused burnt vegetable oil", reason: "Healthy fats support your body's natural hormone production." },
      { eat: "Moi-Moi with fish, beans, and vegetable stir-fries for dinner", moderate: "Huge late-night plates of white rice or swallow right before bed", reason: "A lighter dinner lets your body rest and recover peacefully overnight." },
    ],
    actionableHabits: [
      "The 'Savory Breakfast' Rule: Start your morning with protein (eggs, Moi-Moi, or fish) rather than sweet snacks or white bread.",
      "Healthy Seed Toppings: Sprinkle a handful of pumpkin seeds or groundnuts over your meals for hormone-building healthy fats.",
      "Soothing Spearmint Tea: Enjoy a warm cup of spearmint or green tea in the afternoon to promote calm, clear skin.",
    ],
    scientificReference: "Women's Health & African Endocrinology Studies",
    quiz: {
      question: "What is the best way to start your morning to prevent sugar cravings and support hormone balance?",
      options: [
        "Sweet sugary tea with 3 slices of white bread",
        "A savory protein breakfast like boiled eggs, steamed Moi-Moi, or fish soup",
        "Skipping breakfast completely and drinking sweetened soda",
        "Eating fried sweet plantain alone",
      ],
      correctIndex: 1,
      explanation: "Starting your morning with protein stabilizes your blood sugar right away, preventing morning spikes and keeping your hormones in harmony!",
    },
  },
  {
    id: "gut-microbiome-fermentation",
    category: "metabolism",
    categoryLabel: "Gut Health & Easy Digestion",
    title: "The Gut-Healing Power of Ogi, Iru & Fermented Foods",
    icon: "🧫",
    color: "text-amber-700 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900",
    readTime: "2 min read",
    headline: "How traditional fermented foods ease bloating, improve digestion, and boost immunity.",
    clinicalImpact: "Soothes bloating & builds strong digestive defense",
    recommendedFor: ["gut", "digestion", "bloating", "ibs", "metabolism", "immunity"],
    summary:
      "Traditional African fermentation is a natural health secret! Foods like smooth Akamu (Ogi), Iru, and properly fermented cassava contain friendly bacteria that soothe the stomach, prevent bloating, and make vitamins and minerals much easier for your body to absorb.",
    keyBiomarkers: [
      { name: "Digestive Comfort", target: "Smooth & Light", note: "Enjoying meals without painful bloating, heaviness, or gas." },
      { name: "Natural Immune Defense", target: "Strong & Resilient", note: "Over 70% of your body's immune defense starts in a healthy gut." },
    ],
    eatThisVsModerate: [
      { eat: "Fresh traditional Akamu (Ogi) spiced with ginger and cloves", moderate: "Commercial ultra-processed yogurts loaded with 4 spoons of sugar", reason: "Natural fermented porridge feeds good gut bacteria without spiking sugar." },
      { eat: "Tigernuts (Ofio / Aya) and Baobab fruit", moderate: "Refined flour snacks, biscuits, and artificial sweeteners", reason: "Natural tigernuts are packed with prebiotic fiber that nourishes healthy digestion." },
      { eat: "Slow-fermented Garri enjoyed in moderate portions with vegetable soup", moderate: "Unfermented raw or hurried cassava derivatives", reason: "Traditional slow fermentation breaks down harsh compounds and makes food gentle on digestion." },
    ],
    actionableHabits: [
      "Tigernut Snack: Enjoy a handful of fresh or roasted tigernuts (Aya) for natural gut-loving fiber.",
      "Traditional Iru in Stews: Add Iru into tomato stew and soups 5 minutes before turning off the flame to preserve its goodness.",
      "Spice Your Morning Ogi: Flavor morning Akamu with ginger, cloves, and cinnamon instead of table sugar.",
    ],
    scientificReference: "African Food Microbiology & Gut Wellness Research",
    quiz: {
      question: "What key health benefit does traditional fermentation give to African grains and beans?",
      options: [
        "Increases chemical sugar content by 500%",
        "Unlocks minerals like iron and zinc and makes food easy to digest",
        "Makes food last forever without cooking",
        "Turns protein into pure grease",
      ],
      correctIndex: 1,
      explanation: "Traditional natural fermentation breaks down anti-nutrients, unlocking iron, calcium, and zinc so your body can absorb them easily!",
    },
  },
  {
    id: "drug-nutrient-interactions",
    category: "drugs",
    categoryLabel: "Medication & Meal Safety",
    title: "How to Pair Everyday Foods with Medications Safely",
    icon: "💊",
    color: "text-teal-700 dark:text-teal-400",
    badgeBg: "bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-900",
    readTime: "3 min read",
    headline: "Simple food tips to prevent stomach upset and keep your medicines working at their best.",
    clinicalImpact: "Prevents stomach cramps & protects nutrient levels",
    recommendedFor: ["medications", "metformin", "amlodipine", "losartan", "statins", "drugs"],
    summary:
      "Taking chronic medications works best when paired with the right foods. For example, taking Metformin with your main meal prevents stomach cramps, and replenishing Vitamin B12 with eggs or fish keeps your nerves sharp and strong.",
    keyBiomarkers: [
      { name: "Nerve Vitality & Vitamin B12", target: "Strong & Active", note: "Keeps hands and feet feeling sharp and energized if taking Metformin." },
      { name: "Gentle Digestion", target: "Comfortable & Easy", note: "Taking tablets with food prevents nausea and stomach irritation." },
    ],
    eatThisVsModerate: [
      { eat: "Eggs, mackerel fish, or beef liver (to keep Vitamin B12 strong)", moderate: "Swallowing strong medicines on an empty stomach", reason: "Eating a wholesome meal first protects your stomach lining and prevents nausea." },
      { eat: "Take blood pressure tablets with clean plain water", moderate: "Drinking grapefruit juice when taking Amlodipine", reason: "Grapefruit can make blood pressure medicine absorb too quickly into the bloodstream." },
      { eat: "Stay well hydrated (6-8 glasses of water daily)", moderate: "Mixing alcohol or heavy untested herbal mixtures with prescription drugs", reason: "Water helps your kidneys process medications smoothly and safely." },
    ],
    actionableHabits: [
      "Take Tablets Mid-Meal: Take medications like Metformin midway through your lunch or dinner to eliminate stomach cramps.",
      "Ask for Vitamin B12: If taking sugar medication long-term, ask your health provider to check your B12 levels during routine visits.",
      "Separate Herbal Teas by 2 Hours: Keep traditional herbal teas (like Zobo or Moringa) 2 hours apart from your medical tablets.",
    ],
    scientificReference: "Clinical Pharmacology Guidelines & Everyday Nutrition",
    quiz: {
      question: "Which essential vitamin should long-term Metformin users monitor to keep their nerves strong and healthy?",
      options: [
        "Vitamin C",
        "Vitamin B12",
        "Vitamin K",
        "Vitamin A",
      ],
      correctIndex: 1,
      explanation: "Long-term Metformin use can lower Vitamin B12 absorption over time, so eating eggs, fish, or taking a B12 supplement keeps your nerves healthy!",
    },
  },
];

const CULTURAL_MYTHS = [
  {
    id: "myth-weightgain",
    title: "Myth: 'The only way to gain weight is to eat junk food, pastries, and sugary drinks.'",
    verdict: "FALSE",
    isFalse: true,
    reality:
      "Eating junk food and sugary sodas only leads to belly fat, sluggishness, and high blood sugar. The healthy African way to gain good weight and build muscle is nutrient-dense whole foods: Groundnut soup, Egusi, Beans with Plantain, Eggs, Fish, and fortified Akamu!",
    icon: "💪",
  },
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
    q: "How can I gain healthy weight and build muscle with African food?",
    a: "Focus on clean calorie density! Fortify your morning Akamu with peanut butter and milk, enjoy hearty soups like Groundnut and Egusi with fish and boiled eggs, and snack on roasted groundnuts with bananas. Combine this with bodyweight exercises so the energy builds firm muscle instead of belly fat!",
    badge: "Healthy Weight & Muscle",
    icon: "💪",
  },
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
              African Health &amp; Vitality Hub 🌿
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
                {profile?.name ? `Personalized for ${profile.name}` : "African Health &amp; Food Wisdom 🥑"}
              </div>
              <div className="text-[11px] text-gray-600 truncate">
                {profile?.bloodPressure
                  ? `BP: ${profile.bloodPressure} mmHg • BMI: ${profile.bmi || "23.4"}`
                  : "Simple, practical food tips for healthy African living"}
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
                  Easy Food Calculators 🧮
                </h3>
                <p className="text-[11px] text-teal-100/90 font-medium truncate mt-0.5">
                  Check your swallow portions, balance soup salt &amp; plan your plate
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
                  Share Meal Summary with Your Doctor 📄
                </h3>
                <p className="text-[11px] text-teal-100/90 font-medium truncate mt-0.5">
                  Download an easy-to-read summary of your meals &amp; blood sugar to show your doctor
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
                Connect Smartwatch &amp; Sensors ⌚
              </h3>
              <p className="text-[11px] text-teal-100/90 font-medium truncate mt-0.5">
                Sync Apple Watch, Dexcom, or Libre for effortless health tracking
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
                  Health &amp; Food Wisdom 📚
                </h2>
                <p className="text-xs text-gray-500">
                  Simple, everyday guides for healthy African living
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
              { id: "gain", label: "💪 Weight & Muscle" },
              { id: "herbs", label: "🌿 Super-Herbs" },
              { id: "metabolism", label: "🥑 Gut & Hormones" },
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
                Ask Avo: Quick Health &amp; Food Answers 💬
              </h2>
              <p className="text-xs text-gray-500">
                Tap common food and health questions for easy answers
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
                    Key Health Checks &amp; Targets
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
                    Easy Food Choices for This Goal
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

                {/* 3 Simple Daily Habits */}
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    3 Simple Daily Habits
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
