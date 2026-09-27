import { motion, AnimatePresence } from "motion/react";
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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
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
  {
    "id": "lesson-1",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "The 3-Spoon Soup Trick: Eat Soup First, Swallow Last",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "🥗",
    "headline": "Eating your vegetable soup and fish first stops your blood sugar from jumping high.",
    "audioScript": "Welcome to Lesson One! Here is a simple kitchen secret: when you eat pounded yam or rice, eat a few spoons of your vegetable soup and fish first. The leafy greens make a soft net in your tummy that slows down sugar absorption so you stay full and energized without feeling heavy.",
    "storySlides": [
      "When we sit down to eat, we often dip a big ball of swallow straight into the soup and swallow first. But eating pure starch first can make your blood sugar jump up fast.",
      "Here is the simple trick: eat 3 to 4 spoonfuls of your vegetable soup (like Efo Riro or Ugwu) and fish first before you take your first bite of swallow.",
      "The vegetable greens coat your tummy like a soft shield. When the swallow finally enters, your body digests it slowly and smoothly with no afternoon tiredness!"
    ],
    "takeaway": "Always eat: 1st Vegetable soup 🥬 ➡️ 2nd Fish or meat 🐟 ➡️ 3rd Swallow or rice last 🌾.",
    "quiz": {
      "question": "What should you eat FIRST during a meal to keep your energy smooth and steady?",
      "options": [
        "Your swallow (like Eba or Pounded Yam)",
        "Your leafy vegetable soup (like Efo Riro or Ugwu)",
        "A sweet soda drink",
        "Fried plantain"
      ],
      "correctIndex": 1,
      "explanation": "Vegetable greens coat your tummy with healthy fiber, helping your food digest slowly and smoothly!"
    }
  },
  {
    "id": "lesson-2",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "Nature's Starch Blocker: The Miracle Draw of Ewedu & Okra",
    "category": "Gut & Fiber",
    "readTime": "60s Audio",
    "icon": "🥣",
    "headline": "Drawing soups like Ewedu and Okra act like a gentle shield that slows down sugar.",
    "audioScript": "Did you know that the drawing texture in Ewedu and Okra is actually a natural super-shield? It forms a gentle gel in your tummy that traps starch and stops sugar rushes into your blood. Pair your swallow with drawing soups to feel light and active!",
    "storySlides": [
      "The slippery draw in Ewedu, Ogbono, and Okra is made of pure natural plant gel.",
      "When this gel enters your tummy, it coats the inside like a soft sponge, trapping starch and sugar so your body absorbs them slowly.",
      "This gentle slowdown prevents big sugar spikes and also feeds the friendly bacteria that keep your digestion happy!"
    ],
    "takeaway": "Enjoy swallow with drawing soups like Okra or Ewedu to keep blood sugar calm.",
    "quiz": {
      "question": "How does the drawing texture in Okra and Ewedu protect your body?",
      "options": [
        "It turns all carbs into water",
        "It forms a gentle gel that traps starch and slows sugar down",
        "It makes food rush through your body",
        "It makes you thirsty"
      ],
      "correctIndex": 1,
      "explanation": "The natural drawing gel slows down digestion so sugar enters your blood slowly and gently."
    }
  },
  {
    "id": "lesson-3",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "The Cold Yam Secret: How Cooling Food Overnight Cuts Calories",
    "category": "Cooking Hacks",
    "readTime": "60s Audio",
    "icon": "🍠",
    "headline": "Leaving boiled yams, sweet potatoes, or rice in the fridge overnight makes them gentler on blood sugar.",
    "audioScript": "Here is an amazing cooking trick: when you boil yams, sweet potatoes, or rice, let them cool in the fridge overnight. The cooling turns part of the starch into gut-friendly fiber! Even when you warm them up the next day, they deliver fewer calories and keep you full longer.",
    "storySlides": [
      "Freshly boiled hot yams and rice digest very quickly into simple sugar in your body.",
      "But when you let them cool down in the fridge overnight, the starch molecules link up tightly into resistant starch, which acts just like fiber!",
      "Even when you reheat your food the next day, this special fiber bypasses quick digestion, saving you calories and keeping your sugar steady."
    ],
    "takeaway": "Cook yams and rice ahead of time, let them cool overnight, and warm them up before eating.",
    "quiz": {
      "question": "What happens when you cool cooked yams or rice in the fridge overnight?",
      "options": [
        "They turn into plain white sugar",
        "Part of the starch turns into healthy fiber that feeds good gut bacteria",
        "They lose all their flavor",
        "They turn into oil"
      ],
      "correctIndex": 1,
      "explanation": "Cooling starches overnight turns them into resistant starch, which is a healthy fiber that keeps sugar steady!"
    }
  },
  {
    "id": "lesson-4",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "The Swallow Portion Secret: More Soup, Less Swallow",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "⚖️",
    "headline": "You don't have to quit swallow—just make your swallow fist-sized and double your soup!",
    "audioScript": "People often say you must stop eating swallow. That is not true! What matters most is your plate balance. Make your swallow ball the size of your fist, and take two big scoops of vegetable soup. That way you enjoy your favorite food with zero guilt!",
    "storySlides": [
      "Eating an oversized mountain of swallow can overload your body with quick energy.",
      "The secret is simple: reduce your swallow ball to the size of your closed fist, and double the amount of vegetable soup on your plate.",
      "With plenty of greens and a nice piece of fish or meat, you will feel completely full without any heavy afternoon crash."
    ],
    "takeaway": "Remember the plate rule: Fist-sized swallow, double soup, and plenty of fish or meat.",
    "quiz": {
      "question": "What is the best way to enjoy swallow safely without feeling heavy?",
      "options": [
        "Eat an extra-large mountain of swallow with very little soup",
        "Make swallow fist-sized and double your vegetable soup",
        "Stop eating food completely",
        "Drink only sweet juice"
      ],
      "correctIndex": 1,
      "explanation": "A smaller swallow with lots of vegetable soup gives you all the delicious flavor with steady energy."
    }
  },
  {
    "id": "lesson-5",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "Why White Semolina Spikes Sugar Faster Than Pounded Yam",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "⚠️",
    "headline": "Factory-milled white flours digest in minutes—try plantain flour or oat swallow instead!",
    "audioScript": "Store-bought white semolina and white garri have had all their outer grain fiber removed in the factory. In your stomach, they turn into sugar very quickly. Swapping to unripe plantain flour or oat swallow keeps your energy steady all day.",
    "storySlides": [
      "White semolina is made from wheat that has been stripped of its natural brown outer shell.",
      "Because there is no fiber to slow it down, your stomach turns it into sugar almost as fast as drinking sweetened water.",
      "A much better choice is blending whole rolled oats with green plantain flour—it tastes wonderful and gives you hours of calm energy."
    ],
    "takeaway": "Swap factory white semolina for unripe plantain fufu or oat swallow.",
    "quiz": {
      "question": "Why does white semolina digest into sugar faster than traditional swallows?",
      "options": [
        "It has coffee in it",
        "Factory machines stripped out all the natural grain fiber",
        "It has no carbohydrates",
        "It is fermented for too long"
      ],
      "correctIndex": 1,
      "explanation": "When fiber is removed during factory milling, starch breaks down into sugar in just minutes."
    }
  },
  {
    "id": "lesson-6",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "Bitter Leaf & Waterleaf: Ancient African Healing Greens",
    "category": "Gut & Fiber",
    "readTime": "60s Audio",
    "icon": "🌿",
    "headline": "Traditional greens clean your liver and support healthy digestion naturally.",
    "audioScript": "Bitter Leaf and Waterleaf are true African treasures! The gentle bitter taste in Bitter Leaf wakes up your stomach to release natural digestion juices, while Waterleaf cools and soothes your tummy. Try eating traditional vegetable soups four times a week.",
    "storySlides": [
      "In traditional African wisdom, bitter foods are known to heal the body.",
      "The natural bitter taste wakes up sensors on your tongue and in your stomach that help your body handle sugar better.",
      "Meanwhile, soft Waterleaf provides gentle fiber and soothing minerals that keep your digestion smooth and comfortable."
    ],
    "takeaway": "Eat authentic leafy soups like Bitter Leaf and Waterleaf at least 4 times a week.",
    "quiz": {
      "question": "What does the natural bitter taste in Bitter Leaf do for your body?",
      "options": [
        "It causes headaches",
        "It wakes up your tummy to release natural digestion and sugar-balancing juices",
        "It turns into bad fat",
        "It has no effect at all"
      ],
      "correctIndex": 1,
      "explanation": "Natural bitter greens tell your digestive system to balance insulin and digest food smoothly."
    }
  },
  {
    "id": "lesson-7",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "The Best Time to Drink Water With Your Meals",
    "category": "Cooking Hacks",
    "readTime": "60s Audio",
    "icon": "💧",
    "headline": "Drink a glass of water 15 minutes before eating, and sip gently during meals.",
    "audioScript": "Gulping lots of cold water right in the middle of a heavy meal can wash away your stomach's natural digestive acids. Try drinking a full glass of water 15 minutes before your food, and just sip a little warm water while eating. Your stomach will feel so much lighter!",
    "storySlides": [
      "Your stomach needs natural digestive juices to break down heavy swallows and meats.",
      "If you drink huge cups of iced water during your meal, you wash those juices away, which can leave you feeling bloated.",
      "Drink a big glass of clean water 15 minutes before you eat, and just take small sips while enjoying your food."
    ],
    "takeaway": "Drink water 15 minutes before your meal, and only take small sips while eating.",
    "quiz": {
      "question": "When is the best time to drink a big glass of water around mealtime?",
      "options": [
        "Gulp 3 glasses in the middle of your swallow",
        "15 minutes before eating your meal",
        "Never drink water at all",
        "Only with sweet soft drinks"
      ],
      "correctIndex": 1,
      "explanation": "Drinking before meals helps prepare your tummy for digestion without washing away digestive juices."
    }
  },
  {
    "id": "lesson-8",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "The Balanced African Plate: Half Veggies, Quarter Meat, Quarter Starch",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "🍽️",
    "headline": "Fill half your plate with rich vegetable soup, one quarter with protein, and one quarter with starch.",
    "audioScript": "Look at your plate like a peaceful garden! Fill half the plate with rich green vegetable soup like Efo Riro or Okra. Fill one quarter with fish, boiled eggs, or chicken. And save the last quarter for your rice or swallow. You will never feel bloated or sleepy after eating!",
    "storySlides": [
      "Traditional plates are often 80% starch and only 20% soup. Flipping this ratio changes everything!",
      "Make 50% of your plate rich vegetable soup, 25% fish or lean meat, and 25% your favorite swallow or rice.",
      "This simple division gives you all the delicious taste and comfort while keeping your blood sugar completely steady."
    ],
    "takeaway": "Follow the half-plate rule: 50% vegetables, 25% protein, 25% starch.",
    "quiz": {
      "question": "How much of your plate should be filled with rich vegetable soup?",
      "options": [
        "A tiny corner (10%)",
        "Half of your plate (50%)",
        "None at all",
        "100% starch only"
      ],
      "correctIndex": 1,
      "explanation": "Filling half your plate with vegetables keeps you light, full, and energized for hours!"
    }
  },
  {
    "id": "lesson-9",
    "tier": 1,
    "tierName": "Everyday Food Basics 🌱",
    "title": "African Fish, Eggs & Beans: Natural Food for All-Day Energy",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "🐟",
    "headline": "Protein from fish, eggs, and beans tells your brain you are full and happy.",
    "audioScript": "Ever notice how quickly you get hungry after eating plain white rice? That is because it lacks protein! When you add Titus fish, boiled eggs, smoked mackerel, or steamed beans, your body releases fullness signals that stop unnecessary cravings for hours.",
    "storySlides": [
      "Meals that are only carbohydrates leave your stomach quickly, making you hungry again in just two hours.",
      "Adding real African protein—like mackerel (Titus), catfish, boiled eggs, or brown beans—keeps food in your stomach longer.",
      "This sends a clear message to your brain: You are well-fed, energetic, and do not need extra snacks!"
    ],
    "takeaway": "Always include fish, eggs, beans, or lean meat with every meal.",
    "quiz": {
      "question": "Why does adding fish, eggs, or beans to your meal keep you full longer?",
      "options": [
        "They make you sleep immediately",
        "Protein sends fullness signals to your brain that stop cravings",
        "They turn into pure water",
        "They have zero nutrients"
      ],
      "correctIndex": 1,
      "explanation": "Protein takes longer to digest and tells your brain that your body is fully satisfied!"
    }
  },
  {
    "id": "lesson-10",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Zobo Tea: Nature's Blood Pressure Relaxer",
    "category": "Heart & BP",
    "readTime": "60s Audio",
    "icon": "🌺",
    "headline": "Fresh homemade Zobo tea brewed with ginger gently relaxes your blood vessels.",
    "audioScript": "Zobo tea, made from vibrant red Hibiscus flowers, is one of Africa's greatest gifts for healthy blood pressure! It helps your blood vessels relax and widen so blood flows smoothly. Brew it with fresh ginger and cloves, but leave out white sugar!",
    "storySlides": [
      "Natural red Hibiscus flowers contain special plant nutrients that tell tight blood vessels to open up and relax.",
      "Studies show that drinking two cups of unsweetened Zobo tea daily supports calm, healthy blood pressure.",
      "Remember: avoid adding commercial white sugar or sweet artificial flavorings—use fresh ginger and cloves for spicy sweetness!"
    ],
    "takeaway": "Drink fresh Zobo tea with ginger and cloves without white sugar for calm blood pressure.",
    "quiz": {
      "question": "What is the healthiest way to prepare Zobo tea for your heart?",
      "options": [
        "Boil it with 2 cups of white sugar",
        "Brew it with natural ginger and cloves without white sugar",
        "Drink it with sweetened condensed milk",
        "Add artificial soda syrups"
      ],
      "correctIndex": 1,
      "explanation": "Brewing Zobo naturally with ginger and cloves protects your heart without adding unwanted sugar!"
    }
  },
  {
    "id": "lesson-11",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Protecting Your Kidneys: Safe Cooking for Yams & Plantains",
    "category": "Kidney Care",
    "readTime": "60s Audio",
    "icon": "🍠",
    "headline": "Soaking and boiling yams in fresh water removes excess minerals to keep kidneys happy.",
    "audioScript": "Your kidneys work hard every day to filter your blood. If you want to make yams and plantains extra gentle on your kidneys, peel and soak them in water for an hour, then boil in fresh water. This washes away excess minerals so your kidneys stay light and healthy.",
    "storySlides": [
      "Yams and plantains are rich in natural minerals like potassium, which is great for most people.",
      "However, for anyone watching their kidney health, soaking sliced yams in water for an hour before boiling removes extra mineral load.",
      "Always pour away the boiling water and serve with fresh, lightly cooked green vegetable soup."
    ],
    "takeaway": "Peel, soak, and boil yams in fresh water to keep them gentle on your kidneys.",
    "quiz": {
      "question": "How does soaking sliced yams before boiling help your kidneys?",
      "options": [
        "It turns the yam into candy",
        "It washes away excess mineral burden so kidneys work with ease",
        "It removes all the good taste",
        "It makes the yam oily"
      ],
      "correctIndex": 1,
      "explanation": "Soaking and boiling in fresh water removes excess mineral load, keeping your kidneys healthy and relaxed."
    }
  },
  {
    "id": "lesson-12",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Helping Your Liver Stay Clean: Bitter Leaf & Healthy Fats",
    "category": "Liver & Detox",
    "readTime": "60s Audio",
    "icon": "🛡️",
    "headline": "Bitter leaf and good proteins wash away stubborn belly fat around your liver.",
    "audioScript": "Your liver is your body's master cleaning machine. When we eat too much fried food and sugary drinks, fat can build up in the liver. Drinking natural bitter leaf water or eating bitter leaf soup helps clean out bad fats and restores your natural energy.",
    "storySlides": [
      "A sluggish liver causes tiredness, poor digestion, and stubborn belly fat.",
      "Traditional Bitter Leaf tea and soup stimulate fresh bile flow, which washes away fat droplets trapped inside liver cells.",
      "Pair this with boiled eggs and fresh fish to give your liver the building blocks it needs to repair itself."
    ],
    "takeaway": "Drink fresh Bitter Leaf tea or eat Bitter Leaf soup to keep your liver clean and energized.",
    "quiz": {
      "question": "How does Bitter Leaf help keep your liver clean and healthy?",
      "options": [
        "It puts more fat into the liver",
        "It stimulates natural bile flow to clear out stubborn fat",
        "It stops the liver from working",
        "It turns food into acid"
      ],
      "correctIndex": 1,
      "explanation": "Bitter Leaf stimulates bile production, helping your liver flush out unwanted fat and waste."
    }
  },
  {
    "id": "lesson-13",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Soothing an Upset Stomach: Cabbage, Pap & Fresh Soups",
    "category": "Gut & Fiber",
    "readTime": "60s Audio",
    "icon": "🥣",
    "headline": "Warm pap (Ogi) and fresh cabbage soothe stomach ulcers and tummy pain.",
    "audioScript": "If you struggle with stomach burns, ulcers, or acidity, raw cabbage juice and warm fermented pap (Ogi) are nature's soothing medicine. Fermented corn pap cools your stomach lining, while cabbage provides natural nutrients that heal tender tissues.",
    "storySlides": [
      "Stomach ulcers happen when tummy acid irritates the sensitive stomach lining.",
      "Warm, freshly prepared traditional pap (Ogi or Akamu) creates a gentle protective blanket over irritated stomach walls.",
      "Adding fresh blended cabbage juice provides special soothing nutrients that help tender tissues heal fast."
    ],
    "takeaway": "Sip warm pap (Akamu) and fresh cabbage soup to soothe an irritated stomach.",
    "quiz": {
      "question": "What is a gentle traditional food that soothes an irritated stomach wall?",
      "options": [
        "Spicy fried pepper with raw alcohol",
        "Warm fermented pap (Akamu/Ogi)",
        "Hot energy drinks",
        "Deep-fried meat"
      ],
      "correctIndex": 1,
      "explanation": "Warm fermented pap coats the stomach with a gentle protective layer that calms irritation."
    }
  },
  {
    "id": "lesson-14",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Why Beans & Peas Are Great for Female Hormones",
    "category": "Hormones & Longevity",
    "readTime": "60s Audio",
    "icon": "🌸",
    "headline": "Black-eyed peas and brown beans have gentle plant nutrients that balance women's monthly cycles.",
    "audioScript": "Brown beans and black-eyed peas are loaded with a natural nutrient called inositol. For women dealing with irregular periods, mood swings, or PCOS, eating beans three times a week helps balance hormones and supports calm blood sugar.",
    "storySlides": [
      "Hormone imbalances can cause irregular cycles, acne, and stubborn weight gain around the hips and belly.",
      "African legumes like brown beans and cowpeas contain natural plant compounds that help your body handle sugar and hormone signals smoothly.",
      "Enjoy them as steamed Moi Moi or boiled beans with a spoon of red palm oil and steamed fish!"
    ],
    "takeaway": "Eat brown beans or steamed Moi Moi at least 3 times a week for healthy hormones.",
    "quiz": {
      "question": "Why are African brown beans and Moi Moi beneficial for women's hormonal balance?",
      "options": [
        "They contain zero vitamins",
        "They provide natural nutrients and fiber that balance hormone and sugar signals",
        "They stop digestion completely",
        "They cause sugar spikes"
      ],
      "correctIndex": 1,
      "explanation": "Beans are rich in gentle plant nutrients and soluble fiber that help balance insulin and female hormones."
    }
  },
  {
    "id": "lesson-15",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Cooking Tomatoes for Strong Heart & Prostate Health",
    "category": "Prostate Health",
    "readTime": "60s Audio",
    "icon": "🍅",
    "headline": "Cooking tomatoes with a little healthy oil unlocks 4 times more red nutrients to protect your heart and prostate.",
    "audioScript": "Here is wonderful news for stew lovers: cooking fresh tomatoes with onions and a little healthy oil unlocks a powerful red nutrient called lycopene! In men, it protects the prostate, and in women, it keeps heart arteries clear and flexible.",
    "storySlides": [
      "Tomatoes are packed with a bright red nutrient that protects cells from aging and disease.",
      "When eaten raw, your body only absorbs a small amount. But when gently simmered into a traditional stew with oil, absorption increases by 400%!",
      "Cook your tomato stew on medium heat with onions and fish for a powerhouse health meal."
    ],
    "takeaway": "Simmer fresh tomatoes with a little oil to unlock deep cell-protecting nutrients.",
    "quiz": {
      "question": "What happens when you simmer fresh tomatoes with a little oil into traditional stew?",
      "options": [
        "All the nutrients are destroyed",
        "Your body absorbs 4 times more red nutrients that protect the prostate and heart",
        "The tomatoes turn into sugar",
        "It removes all the vitamins"
      ],
      "correctIndex": 1,
      "explanation": "Cooking tomatoes with oil unlocks fat-soluble lycopene, making it 4 times easier for your body to absorb!"
    }
  },
  {
    "id": "lesson-16",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Pepper Soup Spices for Aching Knees & Joints",
    "category": "Arthritis & Joints",
    "readTime": "60s Audio",
    "icon": "🦴",
    "headline": "Traditional spices like Uda, Uziza, and ginger naturally calm joint pain and swelling.",
    "audioScript": "If your knees ache after walking or your fingers feel stiff in the morning, authentic African pepper soup is your friend! Spices like ginger, turmeric, Uziza seeds, and Uda pods contain natural plant oils that soothe joint swelling better than hot ointments.",
    "storySlides": [
      "Aching knees and stiff joints are usually caused by swelling inside the joint cushion.",
      "The fragrant spices in Nigerian pepper soup—especially ginger, Uda pods, and black Uziza seeds—naturally cool down joint irritation.",
      "Sip a warm bowl of fresh catfish or chicken pepper soup two to three times a week to keep your joints moving freely."
    ],
    "takeaway": "Enjoy warm pepper soup with ginger and Uziza seeds to soothe stiff, aching joints.",
    "quiz": {
      "question": "Which traditional pepper soup ingredients help soothe aching, stiff joints?",
      "options": [
        "Excess table salt and MSG cubes",
        "Ginger, Uziza seeds, and Uda spices",
        "Sweet fruit syrups",
        "Fried palm shortening"
      ],
      "correctIndex": 1,
      "explanation": "Spices like ginger, Uda, and Uziza contain natural soothing compounds that calm joint swelling."
    }
  },
  {
    "id": "lesson-17",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Cooking With Less Salt: Tasty Spice Secrets",
    "category": "Heart & BP",
    "readTime": "60s Audio",
    "icon": "🧂",
    "headline": "Swap salty seasoning cubes for locust beans (Iru), garlic, ginger, and crayfish for deep flavor!",
    "audioScript": "You do not need four salty seasoning cubes to make soup taste delicious! Fermented locust beans (Iru), ground crayfish, garlic, ginger, and scent leaves deliver mouthwatering flavor while protecting your heart, kidneys, and blood pressure from too much salt.",
    "storySlides": [
      "Commercial seasoning cubes are often 60% pure industrial salt, which makes blood pressure rise and causes water retention.",
      "Traditional West African seasonings like fermented Iru (Dawadawa) and dried crayfish give rich savory umami flavor with zero added salt.",
      "Start by cutting seasoning cubes in half and adding an extra spoon of crayfish and iru—your family will love the rich taste!"
    ],
    "takeaway": "Flavor your soups with crayfish, iru, garlic, and ginger instead of multiple salt cubes.",
    "quiz": {
      "question": "What is the best natural swap to make soup savory without using extra salt cubes?",
      "options": [
        "Add double table salt",
        "Use fermented locust beans (Iru) and dried crayfish",
        "Add sugar",
        "Use no spices at all"
      ],
      "correctIndex": 1,
      "explanation": "Locust beans (Iru) and crayfish provide deep savory flavor that makes soups mouthwatering without salt."
    }
  },
  {
    "id": "lesson-18",
    "tier": 2,
    "tierName": "Heart & Blood Sugar Secrets ❤️",
    "title": "Strong Bones After 45: Sesame Seeds & Green Ugwu",
    "category": "Hormones & Longevity",
    "readTime": "60s Audio",
    "icon": "🦴",
    "headline": "Sesame seeds (Beni-seed) and Ugwu leaves are loaded with natural calcium for strong bones and teeth.",
    "audioScript": "As we pass age 45, our bones need extra calcium to stay strong and avoid fractures. Forget expensive dairy pills! African sesame seeds (Beni-seed) and fresh Ugwu leaves have more natural calcium than cow's milk. Sprinkle sesame seeds on your meals for rock-solid bones!",
    "storySlides": [
      "Bone loss happens quietly over the years, leading to backaches and weak posture.",
      "Just two tablespoons of African sesame seeds (Beni-seed) contain more absorbable calcium than a whole glass of milk.",
      "Cook Beni-seed soup or add crushed sesame seeds to your vegetable stews to keep your bones and teeth strong for life."
    ],
    "takeaway": "Add sesame seeds (Beni-seed) and fresh Ugwu to your diet for strong bones after 45.",
    "quiz": {
      "question": "Which African seed is packed with natural calcium to protect your bones as you age?",
      "options": [
        "Bleached white rice",
        "Sesame seeds (Beni-seed)",
        "Crushed corn flakes",
        "Fried plantain chips"
      ],
      "correctIndex": 1,
      "explanation": "Sesame seeds are one of nature's richest plant sources of bone-strengthening calcium!"
    }
  },
  {
    "id": "lesson-19",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "The Palm Oil Secret: Warm It Gently, Never Smoke It!",
    "category": "Cooking Hacks",
    "readTime": "60s Audio",
    "icon": "🌴",
    "headline": "Never bleach palm oil until smoke rises—unbleached red oil protects your eyes and heart!",
    "audioScript": "Virgin red palm oil is one of the richest natural sources of Vitamin A and heart-protecting nutrients in the world. But when you bleach it until black smoke fills the kitchen, those precious vitamins are destroyed. Heat palm oil gently on low heat to keep all its healthy goodness!",
    "storySlides": [
      "Bright red palm oil gets its golden color from carotenoids, which are the same nutrients in carrots that protect your eyes and skin.",
      "When oil is bleached on high heat until it smokes and turns clear, those healthy nutrients burn away into harmful smoke.",
      "Warm your red palm oil gently on low heat, drop in your onions and iru, and keep all its natural heart-protecting vitamins!"
    ],
    "takeaway": "Never bleach red palm oil until it smokes—keep it gently warmed and brightly colored.",
    "quiz": {
      "question": "Why should you avoid bleaching red palm oil until smoke rises?",
      "options": [
        "It makes the soup smell good",
        "Smoking heat destroys all the natural heart and eye vitamins",
        "It adds extra vitamins",
        "It cools the kitchen down"
      ],
      "correctIndex": 1,
      "explanation": "Bleaching palm oil on high heat burns away the red carotenoids and Vitamin E that protect your cells."
    }
  },
  {
    "id": "lesson-20",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "Iru & Dawadawa: Ancient African Gut Helpers",
    "category": "Gut & Fiber",
    "readTime": "60s Audio",
    "icon": "🧄",
    "headline": "Fermented locust beans are packed with friendly tummy helpers that beat store-bought probiotics.",
    "audioScript": "Before foreign probiotic yogurts existed, African grandmothers used Iru, Ogiri, and Dawadawa! The traditional fermentation process grows billions of friendly bacteria that heal your gut, stop bloating, and protect your heart arteries from calcium buildup.",
    "storySlides": [
      "Fermenting locust beans under banana leaves creates millions of beneficial spore-forming bacteria.",
      "These friendly bacteria survive your strong stomach acid and travel deep into your intestines to clean out harmful germs.",
      "Eating soups made with fresh Iru keeps your digestion regular, prevents gas, and supports whole-body health."
    ],
    "takeaway": "Add fermented Iru, Ogiri, or Dawadawa to your cooking for natural gut health.",
    "quiz": {
      "question": "What makes traditional fermented Iru so beneficial for your digestion?",
      "options": [
        "It is packed with friendly probiotic bacteria that heal your gut",
        "It is full of sugar",
        "It stops your stomach from working",
        "It has no nutritional value"
      ],
      "correctIndex": 1,
      "explanation": "Fermented locust beans are loaded with friendly probiotic bacteria that support healthy digestion!"
    }
  },
  {
    "id": "lesson-21",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "Aromatic Spices: Uda, Uziza & African Nutmeg",
    "category": "Heart & BP",
    "readTime": "60s Audio",
    "icon": "✨",
    "headline": "These rich traditional seeds open up blood flow and keep your heart pumping smoothly.",
    "audioScript": "West African aromatic seeds like Uda pods, Uziza peppercorns, and Ehuru (Calabash Nutmeg) do more than make food smell incredible. They contain natural plant oils that help your arteries widen, making it easier for your heart to pump blood with less effort.",
    "storySlides": [
      "Traditional market spices were used for centuries as both seasoning and medicine.",
      "Uziza seeds contain natural piperine, which boosts how well your body absorbs minerals from food.",
      "Grind a blend of Ehuru, Uziza, and Uda into your weekend fish or vegetable stews for aromatic warmth and relaxed circulation."
    ],
    "takeaway": "Cook with traditional Uda, Uziza, and Ehuru spices for relaxed blood vessels.",
    "quiz": {
      "question": "What is a major health benefit of adding Uziza and Uda spices to your cooking?",
      "options": [
        "They cause heartburn",
        "They contain natural oils that help blood vessels relax and widen",
        "They increase blood pressure",
        "They replace all food"
      ],
      "correctIndex": 1,
      "explanation": "Traditional aromatic seeds help your blood vessels stay relaxed and flexible for easy blood flow."
    }
  },
  {
    "id": "lesson-22",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "Fonio: The Ancient African Super-Grain",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "🌾",
    "headline": "Fonio cooks in 3 minutes, tastes like couscous, and won't spike your sugar like white rice!",
    "audioScript": "Meet Fonio, Africa's oldest cultivated grain! It cooks in just 3 minutes, tastes fluffy and nutty, and has twice the healthy fiber of white rice. Because it digests slowly, people with blood sugar concerns can enjoy it without any afternoon crashes.",
    "storySlides": [
      "Fonio has been grown in West Africa for over 5,000 years, often called 'the seed of the universe'.",
      "Unlike modern polished white rice, Fonio is naturally gluten-free and packed with natural sulfur amino acids that keep hair and nails strong.",
      "Steam it just like couscous or Jollof rice for a delicious, light dinner that keeps your sugar perfectly calm."
    ],
    "takeaway": "Try swapping white rice for Fonio once or twice a week for calm, steady energy.",
    "quiz": {
      "question": "Why is Fonio an excellent alternative to white rice?",
      "options": [
        "It has lots of refined sugar",
        "It has twice the fiber, digests slowly, and doesn't cause big sugar spikes",
        "It takes 2 hours to cook",
        "It has no taste"
      ],
      "correctIndex": 1,
      "explanation": "Fonio is rich in gentle fiber that digests slowly, keeping blood sugar smooth and steady."
    }
  },
  {
    "id": "lesson-23",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "Frying vs Baking: Better Ways to Cook Dodo",
    "category": "Cooking Hacks",
    "readTime": "60s Audio",
    "icon": "🍌",
    "headline": "Deep-frying plantains in burnt oil makes them heavy; light pan-tossing keeps them light and sweet!",
    "audioScript": "We all love fried plantain (Dodo)! But when ripe plantains are soaked in deep, burnt oil, they soak up hundreds of extra fat calories and inflammatory toxins. Try slicing them into an air-fryer or lightly brushing them with oil in an oven. You get all the sweet taste with none of the grease!",
    "storySlides": [
      "Ripe yellow plantains are sweet because their natural starch has turned into sugar.",
      "When dropped into very hot bubbling oil, that sugar browns quickly, soaking up oil like a sponge.",
      "Brushing plantain cubes with just one teaspoon of oil and baking or air-frying them keeps them sweet, golden, and super light on your tummy."
    ],
    "takeaway": "Bake or air-fry ripe plantain slices with a drop of oil instead of deep-frying in grease.",
    "quiz": {
      "question": "What is the healthiest way to prepare sweet golden Dodo?",
      "options": [
        "Soak it in re-used black motor oil",
        "Air-fry or oven-bake slices with a light brush of healthy oil",
        "Eat it raw with sugar",
        "Deep-fry it for 30 minutes"
      ],
      "correctIndex": 1,
      "explanation": "Baking or air-frying with a little oil gives you sweet golden plantain without excess burnt grease."
    }
  },
  {
    "id": "lesson-24",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "Cow Leg & Fish Pepper Soup for Strong Knees",
    "category": "Arthritis & Joints",
    "readTime": "60s Audio",
    "icon": "🍲",
    "headline": "Slow-cooked cow leg and fish heads make rich natural broth that cushions your knees and hips.",
    "audioScript": "Did you know that traditional Nigerian bone broths are full of natural collagen? When you slow-simmer cow leg, fish heads, or bone broth with peppersoup spices, the joints release gelatin that helps rebuild the cushions between your knees and hips.",
    "storySlides": [
      "Cartilage between your bones naturally wears down over time, causing knee stiffness.",
      "Simmering bone joints and cow leg gently on low heat draws out natural collagen and minerals into the broth.",
      "Sipping this delicious warm broth feeds your joints from the inside out, keeping your skin firm and your walk springy!"
    ],
    "takeaway": "Sip slow-simmered bone or fish pepper soup to naturally nourish your joint cushions.",
    "quiz": {
      "question": "What natural joint-soothing nutrient is found in slow-simmered cow leg and bone broth?",
      "options": [
        "Refined table sugar",
        "Natural collagen and gelatin that cushion joint bones",
        "Artificial chemical coloring",
        "Motor oil"
      ],
      "correctIndex": 1,
      "explanation": "Slow-cooked bone broth releases natural collagen and gelatin that support healthy, pain-free joints!"
    }
  },
  {
    "id": "lesson-25",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "Green Plantain vs Sweet Yellow Plantain",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "🍌",
    "headline": "Green unripe plantain is nature's fiber champion; enjoy ripe yellow plantain in small portions!",
    "audioScript": "Here is an easy rule for plantains: the greener it is, the more healthy fiber it has! Green unripe plantain doesn't spike your blood sugar at all because it is packed with resistant starch. Ripe yellow plantain is delicious, but treat it like a sweet treat in smaller portions.",
    "storySlides": [
      "As a plantain ripens and turns yellow with black spots, its starch turns into simple fruit sugar.",
      "Green unripe plantain is almost 80% resistant starch—it acts like a broom in your digestive tract and keeps your blood sugar flat.",
      "Boil green plantain with fish and vegetables for dinner, and save sweet fried dodo for special weekend lunches!"
    ],
    "takeaway": "Choose green unripe plantains for steady blood sugar, and enjoy ripe plantains in moderation.",
    "quiz": {
      "question": "Which type of plantain has the most fiber and the lowest impact on blood sugar?",
      "options": [
        "Overripe sweet yellow plantain",
        "Green unripe plantain",
        "Plantain fried in old oil",
        "Candied plantain"
      ],
      "correctIndex": 1,
      "explanation": "Green unripe plantain is full of resistant starch that bypasses quick sugar absorption."
    }
  },
  {
    "id": "lesson-26",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "Afang, Utazi & Oha: Forest Greens for Strong Blood",
    "category": "Gut & Fiber",
    "readTime": "60s Audio",
    "icon": "🍃",
    "headline": "These wild forest leaves have way more iron and zinc than imported lettuce!",
    "audioScript": "African forest leaves like Afang (Okazi), Oha, and Utazi are packed with minerals that build strong blood and fight tiredness. They contain up to eight times more iron and zinc than imported iceberg lettuce! Eat your indigenous greens with pride.",
    "storySlides": [
      "Many people think imported vegetables are healthier, but African wild greens are true nutritional kings.",
      "Afang leaves are tough and fibrous, giving your gut a powerful workout and delivering rich iron for energy.",
      "Toss shredded Utazi or Oha leaves into your soups at the very end of cooking to preserve their vibrant green vitamins."
    ],
    "takeaway": "Enjoy wild greens like Afang, Oha, and Utazi for strong blood and natural iron.",
    "quiz": {
      "question": "Why are indigenous greens like Afang and Oha superior to imported pale lettuce?",
      "options": [
        "They have no vitamins at all",
        "They contain up to 8 times more iron, zinc, and fiber for strong blood",
        "They turn into sugar",
        "They are too soft"
      ],
      "correctIndex": 1,
      "explanation": "Wild African greens are packed with rich iron, zinc, and active plant nutrients that keep blood strong."
    }
  },
  {
    "id": "lesson-27",
    "tier": 3,
    "tierName": "Smart Kitchen & Cooking Tricks 🍲",
    "title": "Natural Seasoning Secrets: Deep Flavor Without High Salt",
    "category": "Heart & BP",
    "readTime": "60s Audio",
    "icon": "🧂",
    "headline": "Blend dry crayfish, iru, onion powder, and ginger to replace commercial salt cubes.",
    "audioScript": "Want a secret blend that makes every pot of soup taste like a luxury restaurant? Blend dry crayfish, fermented iru, garlic powder, onion powder, and a touch of black pepper into an airtight jar. Use a spoonful in place of commercial salt cubes—your heart will thank you!",
    "storySlides": [
      "Most commercial stock cubes are loaded with hidden sodium that makes your blood pressure climb silently.",
      "By blending dried crayfish, dried iru, onion, garlic, and dried rosemary, you create an all-natural savory powder.",
      "It adds rich golden color and deep Nigerian flavor to rice, beans, and soups with only a fraction of the salt."
    ],
    "takeaway": "Make your own homemade jar of crayfish and iru seasoning to cut excess salt.",
    "quiz": {
      "question": "What natural ingredients can you blend together to replace salty commercial seasoning cubes?",
      "options": [
        "White sugar and white flour",
        "Dry crayfish, fermented Iru, garlic, onion, and black pepper",
        "Pure salt crystals",
        "Soft drinks"
      ],
      "correctIndex": 1,
      "explanation": "Blending crayfish, iru, garlic, and onion gives you rich natural flavor without dangerous high sodium."
    }
  },
  {
    "id": "lesson-28",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "Why Morning Blood Sugar Rises & The Bedtime Egg Trick",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "🥚",
    "headline": "Eating a boiled egg or a spoonful of peanut butter before bed prevents morning sugar spikes!",
    "audioScript": "Have you ever woken up with high blood sugar even when you didn't eat dinner? That is your liver releasing stored sugar around 4 AM to wake you up! A simple trick to keep it calm is eating one boiled egg or a spoonful of peanut butter right before bed.",
    "storySlides": [
      "In the early hours before dawn, your liver releases a burst of glucose to give your body morning energy.",
      "If your liver is running on empty, it over-reacts and dumps too much sugar into your blood by 7 AM.",
      "Eating a boiled egg or a spoon of pure peanut butter at bedtime provides slow, gentle protein that keeps your liver calm all night."
    ],
    "takeaway": "Eat a boiled egg or a spoonful of peanut butter before bed to keep morning sugar steady.",
    "quiz": {
      "question": "Why does a boiled egg before bedtime help keep morning blood sugar calm?",
      "options": [
        "It makes you stay awake all night",
        "Its slow protein and healthy fat keep your liver from dumping excess sugar before dawn",
        "It turns into candy",
        "It does nothing"
      ],
      "correctIndex": 1,
      "explanation": "A small high-protein snack before bed keeps your liver steady, preventing the early morning sugar spike."
    }
  },
  {
    "id": "lesson-29",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "Simple Fasting With African Dishes: The 8-Hour Eating Window",
    "category": "Cooking Hacks",
    "readTime": "60s Audio",
    "icon": "⏰",
    "headline": "Giving your tummy a 14-to-16 hour rest overnight lets your body clean out old cells and burn fat.",
    "audioScript": "Intermittent fasting is not about starving—it simply means giving your tummy a peaceful break! Try eating your meals within an 8-hour window, like 11 AM to 7 PM. During the 16 hours of rest overnight, your body cleans out old cells and burns stored belly fat.",
    "storySlides": [
      "When we constantly snack late into the night, our digestion never gets a chance to rest and repair.",
      "Fast overnight for 14 to 16 hours (for example, stop eating by 7 PM and break your fast at 11 AM next day).",
      "During this resting window, your cells perform natural housekeeping, cleaning out waste and restoring insulin sensitivity."
    ],
    "takeaway": "Eat between 11 AM and 7 PM, and let your digestive system rest overnight.",
    "quiz": {
      "question": "What is the main benefit of resting your digestive system for 14-16 hours overnight?",
      "options": [
        "You lose all muscle",
        "Your body gets a chance to clean out old cell waste and burn stored fat",
        "Your stomach stops working permanently",
        "You become dehydrated"
      ],
      "correctIndex": 1,
      "explanation": "Overnight fasting gives your body the quiet time it needs to repair cells and balance your metabolism."
    }
  },
  {
    "id": "lesson-30",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "The 10-Minute Walk After Swallow Meals",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "🚶‍♂️",
    "headline": "A relaxed 10-minute walk right after your eba or rice uses up food energy before it turns to fat.",
    "audioScript": "Here is the easiest health secret in the world: after you finish your lunch or dinner swallow, do not lie down on the sofa immediately! Take a gentle 10-minute stroll around your compound or living room. Your leg muscles will soak up the food sugar without needing extra insulin!",
    "storySlides": [
      "Sitting or sleeping immediately after a heavy meal allows glucose to build up in your bloodstream.",
      "When you walk for just 10 minutes, your leg muscles act like sponges, soaking up sugar directly from your blood to use as walking fuel.",
      "This simple walk cuts your post-meal blood sugar by up to 30% and completely prevents that heavy afternoon food coma."
    ],
    "takeaway": "Take a calm 10-minute walk immediately after your main meals.",
    "quiz": {
      "question": "Why does walking for 10 minutes right after eating swallow meals help your body?",
      "options": [
        "It makes you hungry immediately",
        "Your working muscles soak up blood sugar for energy without straining your system",
        "It makes food spoil in your stomach",
        "It has no purpose"
      ],
      "correctIndex": 1,
      "explanation": "Active muscles pull sugar straight out of your bloodstream to use as fuel, stopping glucose spikes!"
    }
  },
  {
    "id": "lesson-31",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "Why Late-Night Eba Ruins Deep Sleep",
    "category": "Cooking Hacks",
    "readTime": "60s Audio",
    "icon": "🌙",
    "headline": "Eating heavy swallow past 8:30 PM makes your stomach work overtime while you sleep—eat lighter at night!",
    "audioScript": "Eating a massive ball of swallow at 9 PM forces your stomach and heart to work hard all night long while you try to sleep! This raises your resting pulse and leaves you waking up tired and heavy. If you eat late, choose light pepper soup or steamed fish with vegetables instead.",
    "storySlides": [
      "Your body temperature and digestion naturally slow down at night to prepare for deep, healing sleep.",
      "Dumping heavy starchy swallows into your stomach late at night keeps your body temperature hot and disrupts deep sleep.",
      "Eat your heavy swallows for lunch, and enjoy lighter soups, steamed fish, or light pap if you eat dinner late."
    ],
    "takeaway": "Eat heavy swallows earlier in the day, and keep dinner light and soup-based after 8 PM.",
    "quiz": {
      "question": "What is the best type of meal to eat if you are eating dinner late at night?",
      "options": [
        "Two giant wraps of pounded yam with extra oil",
        "A light bowl of fish pepper soup or steamed vegetable soup",
        "A plate of deep-fried dough",
        "Lots of sweet soda"
      ],
      "correctIndex": 1,
      "explanation": "Light soups and steamed fish digest easily so your body can rest deeply throughout the night."
    }
  },
  {
    "id": "lesson-32",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "Fish & Tofu (Awara): Delicious Protein That Stops Snacking",
    "category": "Glucose Science",
    "readTime": "60s Audio",
    "icon": "🍲",
    "headline": "High-protein African fish and soya awara keep hunger locked away for 5 full hours.",
    "audioScript": "Soya bean curds, popular across Northern Nigeria as Awara or Beske, are a wonderful plant protein! When combined with mackerel or catfish, they trigger natural fullness signals in your gut that keep you energized and stop mindless snacking between meals.",
    "storySlides": [
      "Constant snacking on biscuits and sweet breads happens when meals do not contain enough clean protein.",
      "Traditional Awara (tofu made from fresh soya beans) gives you clean protein with zero cholesterol.",
      "Pan-sear cubes of Awara with pepper, onions, and steamed fish for a satisfying lunch that keeps you full until dinner."
    ],
    "takeaway": "Enjoy soya Awara and fish to stay naturally full and satisfied for hours.",
    "quiz": {
      "question": "How does adding soya Awara or fish to your meal prevent unnecessary snacking?",
      "options": [
        "It makes you thirsty for soda",
        "It triggers natural fullness signals in your stomach that last for hours",
        "It has no nutritional effect",
        "It makes you crave sugar"
      ],
      "correctIndex": 1,
      "explanation": "Clean protein triggers natural satiety signals that tell your brain your body is full and content."
    }
  },
  {
    "id": "lesson-33",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "The 30-Plant Variety Game: Build a Strong Gut",
    "category": "Gut & Fiber",
    "readTime": "60s Audio",
    "icon": "🌿",
    "headline": "Eating 30 different African plants, herbs, and spices across the week makes your immune system bulletproof!",
    "audioScript": "Here is a fun food challenge for your family: try to eat 30 different plants every single week! Count your onions, garlic, ginger, ugwu, okra, crayfish, beans, tomatoes, and pepper soup spices. The more plant varieties you eat, the stronger your immune system becomes!",
    "storySlides": [
      "Your gut is home to trillions of friendly bacteria that love eating different types of plant fibers.",
      "People who eat at least 30 different plants, seeds, and spices each week have much stronger digestion and fewer infections.",
      "African cooking makes this so easy: a single pot of Egusi or Afang soup with spices already contains 8 to 10 different plants!"
    ],
    "takeaway": "Aim to eat 30 different African plants, herbs, and spices every week for strong immunity.",
    "quiz": {
      "question": "Why is eating a wide variety of different plants and herbs good for your body?",
      "options": [
        "It confuses your stomach",
        "Different plant fibers feed different friendly gut bacteria to build a strong immune shield",
        "It takes too long to cook",
        "It has no benefit"
      ],
      "correctIndex": 1,
      "explanation": "Different plant fibers nourish different friendly gut helpers, keeping your immune system robust and resilient!"
    }
  },
  {
    "id": "lesson-34",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "Eating on Time: Morning Meals vs Evening Meals",
    "category": "Heart & BP",
    "readTime": "60s Audio",
    "icon": "☀️",
    "headline": "Eat your biggest meals when the sun is up, and keep dinner light and soup-rich for calm blood pressure.",
    "audioScript": "Your body has its own internal clock that follows the sun. Your metabolism is strongest during the daylight hours from 10 AM to 3 PM. Eat your hearty swallow or rice during the day when you are active, and keep your evening meal light. Your blood pressure will stay calm and steady.",
    "storySlides": [
      "Your body handles carbohydrates and sugars much more efficiently in the daytime than in the dark.",
      "Make lunch your main power meal where you enjoy your favorite swallow, rice, and soups.",
      "At night, choose lighter meals like vegetable soup with fish, boiled eggs, or warm pap so your heart rests easily while you sleep."
    ],
    "takeaway": "Eat your hearty meals for lunch and keep your evening dinner light and soup-based.",
    "quiz": {
      "question": "When is your body's metabolism best equipped to handle hearty swallow meals?",
      "options": [
        "At midnight right before sleep",
        "During the daytime when you are active and the sun is up",
        "Only while sleeping",
        "Early at 3 AM"
      ],
      "correctIndex": 1,
      "explanation": "Your body digests carbohydrates and burns energy best during daytime hours when you are awake and active."
    }
  },
  {
    "id": "lesson-35",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "3 Simple Numbers for a Long, Healthy Life",
    "category": "Hormones & Longevity",
    "readTime": "60s Audio",
    "icon": "📊",
    "headline": "Keep track of your morning sugar, your blood pressure, and your waistline for peace of mind.",
    "audioScript": "Staying healthy doesn't require complicated hospital medical tests! Just remember three simple numbers: check that your morning fasting sugar is under 100, your blood pressure is around 120 over 80, and your waistline stays comfortable. Tracking these gives you lifelong vitality and confidence.",
    "storySlides": [
      "You don't need a medical degree to understand your body's vital health signals.",
      "Number One: Morning fasting sugar under 100 mg/dL means your metabolism is smooth and calm.",
      "Number Two: Resting blood pressure around 120/80 means your heart is relaxed. Number Three: A comfortable waistline shows your liver is clear and healthy!"
    ],
    "takeaway": "Check your morning sugar, resting blood pressure, and waistline regularly for peace of mind.",
    "quiz": {
      "question": "What is an ideal morning fasting blood sugar target for a healthy, calm metabolism?",
      "options": [
        "Over 300 mg/dL",
        "Under 100 mg/dL (or under 5.6 mmol/L)",
        "Zero",
        "500 mg/dL"
      ],
      "correctIndex": 1,
      "explanation": "A morning fasting blood sugar under 100 mg/dL means your body is resting in a calm, balanced zone."
    }
  },
  {
    "id": "lesson-36",
    "tier": 4,
    "tierName": "Healthy Habits for Long Life 👑",
    "title": "You Are Now a Master of African Food Wisdom!",
    "category": "Hormones & Longevity",
    "readTime": "60s Audio",
    "icon": "👑",
    "headline": "You now know how to combine our delicious heritage food with smart science to live long and strong!",
    "audioScript": "Congratulations on completing all 36 daily lessons! You now hold the practical food wisdom to keep your blood sugar steady, protect your heart, and enjoy our rich African dishes with pride and joy. You are officially a Master of African Food Wisdom!",
    "storySlides": [
      "You have learned that you never need to give up your cultural African foods to be healthy.",
      "By using simple secrets—like eating soup first, choosing drawing soups, cooling your yams, using iru and crayfish, and walking for 10 minutes—you protect your body every day.",
      "Share these delicious food secrets with your family and community, and wear your certified badge with pride!"
    ],
    "takeaway": "Celebrate your heritage food with wisdom, eat with joy, and live a long, vibrant life!",
    "quiz": {
      "question": "What is the core message of MealOptimiza's African Food Wisdom?",
      "options": [
        "Stop eating all African foods forever",
        "Celebrate authentic African meals with smart, simple food habits for lifelong health",
        "Eat only imported salad leaves",
        "Never eat dinner"
      ],
      "correctIndex": 1,
      "explanation": "MealOptimiza helps you enjoy our rich African cultural dishes safely and deliciously for lifelong vitality!"
    }
  }
];

// --------------------------------------------------------------------------
// 🥳 REAL-WORLD PARTY & CULTURAL EVENT SURVIVAL GUIDES
// --------------------------------------------------------------------------
export interface PartyGuide {
  id: string;
  title: string;
  region: string;
  emoji: string;
  isFree: boolean;
  tagline: string;
  hackSteps: string[];
  safeOrderList: string[];
  drinksTrap: string;
}

export const PARTY_SURVIVAL_GUIDES: PartyGuide[] = [
  {
    id: "guide-owambe",
    title: "The Owambe Wedding Buffet Protocol 🇳🇬",
    region: "West Africa / Nigeria",
    emoji: "🎉",
    isFree: true,
    tagline: "How to enjoy party Jollof, small chops, and stewed chicken with zero sugar spike",
    hackSteps: [
      "1. The 3-Spoon Fiber Primer: Always start with 2-3 spoonfuls of vegetable soup (Efo Riro or Afang) before touching your rice.",
      "2. The 50% Protein Anchor: Fill half your party plate with grilled chicken or fish and moi moi before taking Jollof.",
      "3. Puff-Puff Buffer: If you must enjoy 1-2 small puff-puffs, eat them as dessert AFTER your protein, never on an empty stomach."
    ],
    safeOrderList: [
      "✓ Party Jollof (1 cup portion) + Double Grilled Titus/Chicken + Efo Riro + Moi Moi",
      "✓ Boiled Pepper Soup with Goat Meat (Safe all-night low-carb option)"
    ],
    drinksTrap: "Avoid sugary malts and sodas; ask for chilled Zobo brewed with ginger, or sparkling water with lime."
  },
  {
    id: "guide-fufu-sunday",
    title: "The Sunday Family Fufu & Banku Protocol 🇬🇭",
    region: "Ghana & West Africa",
    emoji: "🍲",
    isFree: false,
    tagline: "Mastering large family Sunday dinners with Light Soup & Groundnut Soup",
    hackSteps: [
      "1. The Viscous Broth Cushion: Drink half a bowl of Pepper or Light soup before swallowing Banku/Fufu.",
      "2. Palm-Sized Portion: Keep Fufu/Banku to the size of your closed fist (approx. 150g).",
      "3. Peanut Soup Smart Balance: Groundnut soup is calorie-rich—balance with extra steamed garden eggs."
    ],
    safeOrderList: [
      "✓ Banku (1 small ball) + Grilled Tilapia + Fresh Shito + Extra Steamed Greens",
      "✓ Light Soup with Snapper Fish & Okra"
    ],
    drinksTrap: "Replace canned Sobolo with homemade unsweetened ginger-infused hibiscus tea."
  },
  {
    id: "guide-diaspora-winter",
    title: "The UK & North America Diaspora Winter Swaps 🇬🇧🇨🇦🇺🇸",
    region: "Diaspora Living",
    emoji: "❄️",
    isFree: false,
    tagline: "Staying warm, energized, and vitamin-rich during cold temperate months",
    hackSteps: [
      "1. Vitamin D3 Morning Ritual: Since sunlight is low, take 2,000 IU Vitamin D3 alongside avocado or eggs.",
      "2. Local Winter Greens: When fresh Ugwu is costly, blend organic Frozen Collard Greens or Kale with Bitter Leaf.",
      "3. The Slow-Cooker Pepper Soup: Keep a pot of bone broth pepper soup hot to boost circulation."
    ],
    safeOrderList: [
      "✓ Plantain-Oat Swallow + Collard-Ugwu Soup + Atlantic Salmon",
      "✓ Spiced Ginger-Garlic Tilapia Pepper Soup Bowl"
    ],
    drinksTrap: "Beware of hot sugary coffee drinks; drink warm turmeric-ginger spiced water instead."
  },
  {
    id: "guide-december-feasting",
    title: "The December Holiday Feasting & Alcohol Shield 🎄",
    region: "Global Holiday",
    emoji: "🍗",
    isFree: false,
    tagline: "Preventing visceral belly fat and liver overload during Christmas & New Year",
    hackSteps: [
      "1. 1-for-1 Hydration Rule: For every glass of wine or drink, down 1 full glass of water with lemon.",
      "2. 16:8 Digestive Rest: Give your liver 16 hours of fasting between late-night dinners and your first meal next day.",
      "3. Morning Liver Flush: Start mornings with warm bitter leaf tea or lemon water."
    ],
    safeOrderList: [
      "✓ Grilled Asun (trimmed of excess fat) + Mixed Salad + 1/2 Roasted Sweet Potato",
      "✓ Steamed Mackerel with Okra & Waterleaf"
    ],
    drinksTrap: "Limit creamy liqueurs and sweet palm wine cocktails; choose dry red wine or zobo."
  }
];


export const CULTURAL_MYTHS = [
  {
    id: "myth-1",
    icon: "🥣",
    myth: "Myth: You must stop eating African swallow if you have high blood sugar.",
    fact: "Fact: African soups like Okra and Ewedu form a natural gel shield that slows carbohydrate absorption by up to 38%! Pair with plantain-oat swallow to stay safe.",
    tag: "Swallow & Sugar",
    bgGradient: "from-teal-600 to-emerald-700"
  },
  {
    id: "myth-2",
    icon: "🌴",
    myth: "Myth: Fresh red palm oil is pure cholesterol and bad for your heart.",
    fact: "Fact: Unbleached virgin red palm oil is the richest natural source of protective Vitamin E (Tocotrienols) and beta-carotene! Just avoid overheating it till clear.",
    tag: "Heart & Oils",
    bgGradient: "from-amber-600 to-orange-700"
  },
  {
    id: "myth-3",
    icon: "🍚",
    myth: "Myth: Eating cooled rice or leftover swallow causes digestive heaviness.",
    fact: "Fact: Cooling cooked carbs overnight turns ordinary starches into gut-healing Resistant Starch that feeds good bacteria and causes ZERO blood sugar spikes!",
    tag: "Kitchen Science",
    bgGradient: "from-blue-600 to-indigo-700"
  },
  {
    id: "myth-4",
    icon: "🧂",
    myth: "Myth: Stock seasoning cubes are the only way to make African soups tasty.",
    fact: "Fact: Traditional fermented locust beans (Iru), ground crayfish, and garlic give deep savory umami flavor with 80% less sodium to protect your blood pressure!",
    tag: "Heart & Seasoning",
    bgGradient: "from-rose-600 to-purple-700"
  }
];

export default function AvoAcademy() {
  const { user } = useUser();
  const isUserPro = Boolean(user?.isPro || (user as any)?.subscriptionTier === "pro");
  const [selectedTier, setSelectedTier] = useState<AcademyTier>(1);
  const [isTierExpanded, setIsTierExpanded] = useState<boolean>(true);
  const [tierViewMode, setTierViewMode] = useState<"deck" | "grid">("deck");
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const tierScrollRef = useRef<HTMLDivElement>(null);
  // 🥳 Party Guides & Diploma State
  const [selectedPartyGuide, setSelectedPartyGuide] = useState<PartyGuide | null>(null);
  const [showPartyGuideModal, setShowPartyGuideModal] = useState(false);
  const [showProUpgradeModal, setShowProUpgradeModal] = useState(false);
  const [lockedItemTitle, setLockedItemTitle] = useState("");

  const handleOpenPartyGuide = (guide: PartyGuide) => {
    if (!guide.isFree && !isUserPro) {
      triggerHaptic("warning");
      setLockedItemTitle(guide.title);
      setShowProUpgradeModal(true);
      return;
    }
    triggerHaptic("medium");
    setSelectedPartyGuide(guide);
    setShowPartyGuideModal(true);
  };

  // 🔄 Interactive Myth vs Fact State
  const [flippedMythIndex, setFlippedMythIndex] = useState<number | null>(null);

  // 🥣 Interactive "Fix My Plate" Simulator State
  const [simulatorCarb, setSimulatorCarb] = useState<"yam" | "rice" | "bread">("yam");
  const [hasOkraBuffer, setHasOkraBuffer] = useState(false);
  const [hasProteinBuffer, setHasProteinBuffer] = useState(false);
  const [hasVegFirstBuffer, setHasVegFirstBuffer] = useState(false);

  // Calculate live simulated spike
  const simulatedGlucose = useMemo(() => {
    let base = simulatorCarb === "yam" ? 190 : simulatorCarb === "rice" ? 175 : 180;
    if (hasOkraBuffer) base -= 35;
    if (hasProteinBuffer) base -= 25;
    if (hasVegFirstBuffer) base -= 20;
    return Math.max(105, base);
  }, [simulatorCarb, hasOkraBuffer, hasProteinBuffer, hasVegFirstBuffer]);
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [playingAudioLessonId, setPlayingAudioLessonId] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isQuizAudioPlaying, setIsQuizAudioPlaying] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateTier, setCertificateTier] = useState<AcademyTier>(1);

  // Preferred Voice Language (English or Pidgin)
  const [academyLang, setAcademyLang] = useState<"en" | "pcm">(() => {
    try {
      return (localStorage.getItem("mealoptimizer_preferred_voice_lang") as "en" | "pcm") || "en";
    } catch {
      return "en";
    }
  });

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
      setIsQuizAudioPlaying(false);
      setPlayingAudioLessonId(lesson.id);
      setIsAudioPlaying(true);

      const scriptToRead = `${lesson.title}. ${lesson.audioScript} Key Clinical Takeaway: ${lesson.takeaway}`;

      speakWithSarah(scriptToRead, {
        voiceId: academyLang === "pcm" ? "mama_bola" : "ngozi",
        audioKey: `academy_lesson_${lesson.id}`,
        lang: academyLang,
        rate: 0.96,
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

  // Play Quiz Question & Options with Sarah AI
  const handlePlayQuizQuestion = (lesson: AcademyLesson) => {
    triggerHaptic("light");
    if (isQuizAudioPlaying) {
      stopSarahSpeech();
      setIsQuizAudioPlaying(false);
      return;
    }
    stopSarahSpeech();
    setIsAudioPlaying(false);
    setIsQuizAudioPlaying(true);

    const questionScript =
      academyLang === "pcm"
        ? `Quick Quiz question: ${lesson.quiz.question}. Choice A: ${lesson.quiz.options[0]}. Choice B: ${lesson.quiz.options[1]}. Which one correct?`
        : `Quick Quiz question: ${lesson.quiz.question}. Option A: ${lesson.quiz.options[0]}. Option B: ${lesson.quiz.options[1]}. What is your answer?`;

    speakWithSarah(questionScript, {
      voiceId: academyLang === "pcm" ? "mama_bola" : "ngozi",
      audioKey: `academy_quiz_q_${lesson.id}`,
      lang: academyLang,
      rate: 0.96,
      onStart: () => setIsQuizAudioPlaying(true),
      onEnd: () => setIsQuizAudioPlaying(false),
      onError: () => setIsQuizAudioPlaying(false),
    });
  };

  // Play Quiz Explanation & Takeaway with Sarah AI
  const handlePlayQuizExplanation = (lesson: AcademyLesson, isCorrect: boolean) => {
    stopSarahSpeech();
    setIsAudioPlaying(false);
    setIsQuizAudioPlaying(true);

    const expScript = isCorrect
      ? (academyLang === "pcm"
          ? `Spot on! 100% correct! ${lesson.quiz.explanation} Key Clinical Takeaway: ${lesson.takeaway}`
          : `Spot on! That is 100% correct! ${lesson.quiz.explanation} Key Clinical Takeaway: ${lesson.takeaway}`)
      : (academyLang === "pcm"
          ? `Good effort! See the clinical reason: ${lesson.quiz.explanation} Key Clinical Takeaway: ${lesson.takeaway}`
          : `Good effort! Here is the clinical explanation: ${lesson.quiz.explanation} Key Clinical Takeaway: ${lesson.takeaway}`);

    speakWithSarah(expScript, {
      voiceId: academyLang === "pcm" ? "mama_bola" : "ngozi",
      audioKey: `academy_quiz_exp_${lesson.id}`,
      lang: academyLang,
      rate: 0.96,
      onStart: () => setIsQuizAudioPlaying(true),
      onEnd: () => setIsQuizAudioPlaying(false),
      onError: () => setIsQuizAudioPlaying(false),
    });
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
      // Auto-narrate quiz question
      handlePlayQuizQuestion(activeLesson);
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
    // Play celebratory/feedback explanation audio
    handlePlayQuizExplanation(activeLesson, isCorrect);

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
      <div className="relative overflow-hidden bg-gradient-to-r from-[#164E3D] via-[#1E604D] to-[#124233] rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-white/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

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
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                  🔥 7-DAY STUDY STREAK
                </span>
                <span className="text-xs font-semibold text-stone-200">
                  Total XP: <strong className="text-amber-300 font-bold">{totalAcademyXp} XP</strong>
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight mt-1">
                Today's 90s Drop: {todayLesson.title}
              </h3>
              <p className="text-xs text-stone-200 font-medium line-clamp-1 mt-0.5">
                {todayLesson.headline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => handleToggleAudio(e, todayLesson)}
              className={`btn-liquid-glass px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                playingAudioLessonId === todayLesson.id && isAudioPlaying
                  ? "bg-amber-400 text-stone-950 shadow-md animate-pulse border-amber-300"
                  : "btn-glass-frosted text-white border-white/30"
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
              className="btn-liquid-glass btn-liquid-amber px-4 py-2 text-stone-950 text-xs font-bold rounded-2xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 border border-amber-300/40"
            >
              <span>Start Quiz (+50 XP)</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🌟 INTERACTIVE CULTURAL "MYTH VS FACT" 3D FLIP CARDS               */}
      {/* =================================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Tap to Flip: African Kitchen Myths vs. Facts 🔄
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#164E3D] dark:text-emerald-400">
            4 Interactive Cards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CULTURAL_MYTHS.map((item, idx) => {
            const isFlipped = flippedMythIndex === idx;
            return (
              <div
                key={item.id}
                onClick={() => {
                  triggerHaptic("light");
                  setFlippedMythIndex(isFlipped ? null : idx);
                }}
                className="cursor-pointer group relative h-36 rounded-3xl [perspective:1000px]"
              >
                <div
                  className={`relative w-full h-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-xs hover:shadow-md ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* FRONT: THE MYTH */}
                  <div className="absolute inset-0 w-full h-full rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 flex flex-col justify-between [backface-visibility:hidden]">
                    <div className="flex items-center justify-between">
                      <span className="text-xl p-1.5 bg-stone-50 dark:bg-stone-800 rounded-xl">{item.icon}</span>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 line-clamp-2">
                      {item.myth}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-[#164E3D] dark:text-emerald-400">
                      <span>Tap to reveal the truth 💡</span>
                      <span>🔄 Flip</span>
                    </div>
                  </div>

                  {/* BACK: THE FACT */}
                  <div className={`absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br ${item.bgGradient} text-white p-4 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-xl`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
                        ✨ Kitchen Secret
                      </span>
                      <span className="text-xs font-semibold text-white/80">Tap to flip back</span>
                    </div>
                    <p className="text-xs font-semibold text-white/95 leading-relaxed">
                      {item.fact}
                    </p>
                    <div className="text-xs font-bold text-amber-200 flex items-center gap-1">
                      <span>✓ Science Backed</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🥣 LIVE "FIX MY PLATE" SUGAR SPIKE INTERACTIVE SIMULATOR             */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-br from-[#164E3D] via-[#123E31] to-[#0F1412] rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 rounded-2xl text-amber-300 text-lg">
              🥣
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">
                Live "Fix My Plate" Simulator 🎮
              </h3>
              <span className="text-xs text-stone-200 font-medium">
                Tap food buffers below to see how they protect your blood sugar in real-time
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-sm sm:text-base font-bold font-mono px-2.5 py-1 rounded-xl ${
              simulatedGlucose <= 125
                ? "bg-emerald-500 text-stone-950"
                : simulatedGlucose <= 150
                ? "bg-amber-400 text-stone-950"
                : "bg-rose-500 text-white"
            }`}>
              {simulatedGlucose} mg/dL
            </span>
            <span className="text-xs font-bold text-amber-200 block mt-0.5">
              {simulatedGlucose <= 125 ? "🟢 Steady Energy" : simulatedGlucose <= 150 ? "🟡 Mild Spike" : "🔴 Sugar Crash"}
            </span>
          </div>
        </div>

        {/* Step 1: Pick a Carb */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Step 1: Choose Your Main Dish
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "yam" as const, label: "Pounded Yam 🍠", icon: "🍠" },
              { id: "rice" as const, label: "Party Jollof 🍚", icon: "🍚" },
              { id: "bread" as const, label: "White Bread 🍞", icon: "🍞" }
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setSimulatorCarb(c.id);
                }}
                className={`py-2 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer truncate ${
                  simulatorCarb === c.id
                    ? "btn-liquid-glass btn-liquid-amber text-stone-950 font-bold shadow-md scale-[1.02] border border-amber-300/40"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Toggle Buffers */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Step 2: Add Natural Food Buffers (Tap to add/remove)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setHasOkraBuffer(!hasOkraBuffer);
              }}
              className={`p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                hasOkraBuffer
                  ? "btn-liquid-glass btn-liquid-forest text-white border-emerald-400/50 shadow-md scale-[1.02]"
                  : "bg-white/10 text-white hover:bg-white/15 border-white/15"
              }`}
            >
              <span>🥣 + Okra/Ewedu Soup</span>
              <span className="text-xs font-bold">{hasOkraBuffer ? "✓ -35mg" : "+ Add"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setHasProteinBuffer(!hasProteinBuffer);
              }}
              className={`p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                hasProteinBuffer
                  ? "btn-liquid-glass btn-liquid-forest text-white border-emerald-400/50 shadow-md scale-[1.02]"
                  : "bg-white/10 text-white hover:bg-white/15 border-white/15"
              }`}
            >
              <span>🐟 + Grilled Fish/Egg</span>
              <span className="text-xs font-bold">{hasProteinBuffer ? "✓ -25mg" : "+ Add"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setHasVegFirstBuffer(!hasVegFirstBuffer);
              }}
              className={`p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                hasVegFirstBuffer
                  ? "btn-liquid-glass btn-liquid-forest text-white border-emerald-400/50 shadow-md scale-[1.02]"
                  : "bg-white/10 text-white hover:bg-white/15 border-white/15"
              }`}
            >
              <span>🥗 Eat Veggies First</span>
              <span className="text-xs font-bold">{hasVegFirstBuffer ? "✓ -20mg" : "+ Add"}</span>
            </button>
          </div>
        </div>

        {/* Live Avo Verdict */}
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center gap-3">
          <span className="text-2xl">
            {simulatedGlucose <= 125 ? "🥑" : simulatedGlucose <= 150 ? "🤔" : "⚠️"}
          </span>
          <p className="text-xs text-stone-100 font-medium leading-relaxed">
            {simulatedGlucose <= 125
              ? "🎉 Excellent plate balance! The natural soluble fiber & protein buffer keeps your glucose steady so you feel energized all afternoon."
              : simulatedGlucose <= 150
              ? "👍 Getting better! Add one more protein or fiber buffer to flatten the sugar curve completely."
              : "⚠️ High spike alert! Without fiber or protein, this carb will digest rapidly and cause sleepiness. Tap Okra or Fish above to fix it!"}
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 🥳 REAL-WORLD CULTURAL PARTY & EVENT SURVIVAL GUIDES                */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-br from-stone-900 via-[#164E3D]/40 to-stone-950 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-emerald-500/30 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400/20 text-amber-300 rounded-2xl text-xl shadow-inner">
              🎉
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 shadow-2xs">
                  Party Cheat-Sheets
                </span>
                <span className="text-xs text-stone-300 font-semibold">Wedding &amp; Buffet Protocols</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                Cultural Party &amp; Event Survival Guides 🍲
              </h3>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-300 bg-amber-400/20 border border-amber-300/30 px-2.5 py-1 rounded-xl">
            4 Guides
          </span>
        </div>

        <p className="text-xs text-stone-200 font-medium leading-relaxed">
          Going to a wedding, family Sunday dinner, or festive party? Learn how to eat delicious cultural food without energy crashes or blood sugar spikes!
        </p>

        {/* 4 Interactive Guide Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PARTY_SURVIVAL_GUIDES.map((guide) => (
            <div
              key={guide.id}
              onClick={() => handleOpenPartyGuide(guide)}
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl p-2 bg-white/10 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                  {guide.emoji}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-stone-300 uppercase">
                      {guide.region}
                    </span>
                    {guide.isFree ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-stone-950">
                        FREE PREVIEW
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                        PRO 🔒
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight mt-0.5 truncate">
                    {guide.title}
                  </h4>
                  <p className="text-xs text-stone-300 truncate mt-0.5">
                    {guide.tagline}
                  </p>
                </div>
              </div>

              <ChevronRight size={14} className="text-stone-300 group-hover:translate-x-1 transition-transform shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. CONTAINERIZED DAILY AFRICAN FOOD MASTERCLASS WITH EMERGING TIERS */}
      {/* =================================================================== */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-4 sm:p-5 shadow-lg border border-stone-200/80 dark:border-stone-800 space-y-4">
        {/* Masterclass Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/70 rounded-2xl text-[#164E3D] dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 shadow-2xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                  Daily African Food Wisdom 🥑
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  4 Tiers
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                36 simple daily food tricks to balance sugar, protect your heart, and enjoy your meals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 font-mono">
              {completedLessonIds.length}/{LESSONS.length} Lessons ({Math.round((completedLessonIds.length / LESSONS.length) * 100)}%)
            </span>
          </div>
        </div>

        {/* Masterclass Global Shimmer Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden relative shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-[#164E3D] via-emerald-500 to-amber-400 rounded-full"
              initial={{ width: "25%" }}
              animate={{
                width: `${Math.max(5, (completedLessonIds.length / LESSONS.length) * 100)}%`,
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 4-Tier Progression Switcher Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Select Progression Tier
            </span>
            <span className="text-xs font-semibold text-[#164E3D] dark:text-emerald-400 flex items-center gap-1">
              <Sparkles size={11} /> Tap tier to emerge lessons
            </span>
          </div>

          <div
            ref={tierScrollRef}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative"
          >
            {[
              { tier: 1 as AcademyTier, label: "1. Food Basics", subtitle: "How to Eat Your Meals", icon: "🌱" },
              { tier: 2 as AcademyTier, label: "2. Heart & Sugar", subtitle: "Daily Health Secrets", icon: "❤️" },
              { tier: 3 as AcademyTier, label: "3. Kitchen Tricks", subtitle: "Tasty Food Swaps", icon: "🍲" },
              { tier: 4 as AcademyTier, label: "4. Long Life", subtitle: "Eating for Long Life", icon: "👑" },
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
                    setIsTierExpanded(true);
                    setActiveDeckIndex(0);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-22 relative overflow-hidden group ${
                    isSelected
                      ? "btn-liquid-glass btn-liquid-forest text-white border-white/20 shadow-md scale-[1.02]"
                      : "bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50/50 border-stone-200/80 dark:border-stone-700 text-stone-800 dark:text-stone-200"
                  }`}
                >
                  {/* Active Slide Highlight Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeTierIndicator"
                      className="absolute inset-0 bg-gradient-to-br from-[#164E3D] via-[#123E31] to-[#0F1412] border border-emerald-400/40 rounded-2xl -z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xl">{t.icon}</span>
                    {isCompleted ? (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5 shadow-2xs">
                        <Check size={10} /> Done
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-mono font-bold ${
                          isSelected ? "text-amber-300" : "text-stone-500"
                        }`}
                      >
                        {stat.completed}/{stat.total}
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 mt-1">
                    <div className="text-xs font-bold leading-tight truncate">{t.label}</div>
                    <div className={`text-xs truncate ${isSelected ? "text-emerald-200/90" : "text-stone-500 dark:text-stone-400"}`}>
                      {t.subtitle}
                    </div>
                    <div className="w-full bg-black/30 h-1 rounded-full overflow-hidden mt-1.5">
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

        {/* EMERGING TIER LESSONS PANEL WITH MINIMIZED DECK / EXPANDED GRID VIEW */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          {/* Tier Control Bar */}
          <div className="flex items-center justify-between gap-2 px-1 mb-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 truncate">
                {selectedTier === 1 && "Tier 1: Everyday Food Basics (9 Lessons)"}
                {selectedTier === 2 && "Tier 2: Heart & Blood Sugar Secrets (9 Lessons)"}
                {selectedTier === 3 && "Tier 3: Smart Kitchen & Cooking Tricks (9 Lessons)"}
                {selectedTier === 4 && "Tier 4: Healthy Habits for Long Life (9 Lessons)"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Voice Language Toggle */}
              <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-700 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setAcademyLang("en");
                    try { localStorage.setItem("mealoptimizer_preferred_voice_lang", "en"); } catch {}
                    toast.success("Sarah Voice: English 🇬🇧");
                  }}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    academyLang === "en"
                      ? "bg-white dark:bg-stone-900 text-[#164E3D] dark:text-emerald-400 shadow-2xs"
                      : "text-stone-500 hover:text-stone-800 dark:text-stone-400"
                  }`}
                  title="English Nutritionist Voice"
                >
                  <span>🇬🇧 En</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setAcademyLang("pcm");
                    try { localStorage.setItem("mealoptimizer_preferred_voice_lang", "pcm"); } catch {}
                    toast.success("Sarah Voice: Nigerian Pidgin 🇳🇬");
                  }}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    academyLang === "pcm"
                      ? "bg-white dark:bg-stone-900 text-[#164E3D] dark:text-emerald-400 shadow-2xs"
                      : "text-stone-500 hover:text-stone-800 dark:text-stone-400"
                  }`}
                  title="Nigerian Pidgin Mother Voice"
                >
                  <span>🇳🇬 Pidgin</span>
                </button>
              </div>

              {tierStats[selectedTier].completed === tierStats[selectedTier].total && (
                <button
                  type="button"
                  onClick={() => {
                    setCertificateTier(selectedTier);
                    setShowCertificateModal(true);
                  }}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200/60 cursor-pointer"
                >
                  <Award size={12} />
                  <span>Credential 📜</span>
                </button>
              )}

              {/* Toggle Deck / Grid View Switcher */}
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200/80 dark:border-stone-700 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setTierViewMode("deck");
                    setIsTierExpanded(true);
                  }}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    tierViewMode === "deck"
                      ? "bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="Slide Deck Mode"
                >
                  <span>📱 Deck</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("light");
                    setTierViewMode("grid");
                    setIsTierExpanded(true);
                  }}
                  className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    tierViewMode === "grid"
                      ? "bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-2xs"
                      : "text-stone-500 hover:text-stone-900 dark:hover:text-white"
                  }`}
                  title="All 9 Lessons Grid"
                >
                  <LayoutGrid size={11} />
                  <span>Grid (9)</span>
                </button>
              </div>

              {/* Minimize / Expand Drawer Toggle */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setIsTierExpanded(!isTierExpanded);
                }}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer transition-all"
                title={isTierExpanded ? "Minimize tier lessons" : "Expand tier lessons"}
              >
                {isTierExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* AnimatePresence for Emerging Tier */}
          <AnimatePresence mode="wait">
            {isTierExpanded && (
              <motion.div
                key={`tier-container-${selectedTier}-${tierViewMode}`}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {tierViewMode === "deck" ? (
                  /* ========================================================= */
                  /* A. FOCUSED SLIDE DECK (MINIMIZED 1-OF-9 INTERACTIVE VIEW)  */
                  /* ========================================================= */
                  <div className="space-y-3">
                    {(() => {
                      const lesson = tierLessons[activeDeckIndex] || tierLessons[0];
                      if (!lesson) return null;
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const isAudioActive = playingAudioLessonId === lesson.id && isAudioPlaying;

                      return (
                        <div className="bg-gradient-to-br from-[#164E3D] via-[#123E31] to-[#0F1412] rounded-3xl p-4 sm:p-5 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden">
                          {/* Top Tag & Badges */}
                          <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl p-2 bg-white/10 rounded-2xl backdrop-blur-xs">
                                {lesson.icon}
                              </span>
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                                  Lesson {activeDeckIndex + 1} of {tierLessons.length} · {lesson.category}
                                </span>
                                <span className="text-xs text-stone-200 font-medium">
                                  {lesson.readTime} read
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isCompleted ? (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                                  <CheckCircle2 size={12} /> Done
                                </span>
                              ) : (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 shadow-2xs">
                                  +25 XP
                                </span>
                              )}

                              {/* Sarah Voice Tip */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleAudio(e, lesson)}
                                title="Listen to Sarah AI voice tip"
                                className={`btn-liquid-glass px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                                  isAudioActive
                                    ? "bg-amber-400 text-stone-950 animate-bounce border-amber-300"
                                    : "btn-glass-frosted text-white border-white/20"
                                }`}
                              >
                                {isAudioActive ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                <span>{isAudioActive ? "Stop" : "Sarah Audio 🎙️"}</span>
                              </button>
                            </div>
                          </div>

                          {/* Lesson Title & Headline */}
                          <div className="space-y-1.5 mb-4 relative z-10">
                            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                              {lesson.title}
                            </h4>
                            <p className="text-xs text-stone-200 leading-relaxed font-medium">
                              {lesson.headline}
                            </p>
                          </div>

                          {/* Action Button: Start Lesson */}
                          <div className="flex items-center gap-2 mb-4 relative z-10">
                            <Button
                              onClick={() => handleStartLesson(lesson)}
                              className="btn-liquid-glass btn-liquid-amber flex-1 text-stone-950 h-11 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-amber-300/40"
                            >
                              <span>{isCompleted ? "Review Lesson Again 🔄" : "Start This Lesson (+25 XP) 🚀"}</span>
                            </Button>
                          </div>

                          {/* 9-Slide Deck Navigator with Left/Right Buttons & 9 Dots */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic("light");
                                setActiveDeckIndex((prev) => Math.max(0, prev - 1));
                              }}
                              disabled={activeDeckIndex === 0}
                              className={`btn-liquid-glass text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-all border ${
                                activeDeckIndex === 0
                                  ? "opacity-30 cursor-not-allowed text-white/50 border-transparent"
                                  : "btn-glass-frosted text-white border-white/20"
                              }`}
                            >
                              <ChevronLeft size={14} />
                              <span>Prev</span>
                            </button>

                            {/* 9-Step Interactive Dots / Pills */}
                            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto px-1 max-w-[200px] sm:max-w-none no-scrollbar">
                              {tierLessons.map((l, dotIdx) => {
                                const isDotActive = dotIdx === activeDeckIndex;
                                const isDotDone = completedLessonIds.includes(l.id);

                                return (
                                  <button
                                    key={l.id}
                                    type="button"
                                    onClick={() => {
                                      triggerHaptic("light");
                                      setActiveDeckIndex(dotIdx);
                                    }}
                                    className={`transition-all rounded-full cursor-pointer flex items-center justify-center ${
                                      isDotActive
                                        ? "w-6 h-2.5 bg-amber-300 ring-2 ring-amber-400/50"
                                        : isDotDone
                                        ? "w-2.5 h-2.5 bg-emerald-400 hover:bg-emerald-300"
                                        : "w-2.5 h-2.5 bg-white/25 hover:bg-white/50"
                                    }`}
                                    title={`Go to Lesson ${dotIdx + 1}: ${l.title}`}
                                  />
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic("light");
                                setActiveDeckIndex((prev) => Math.min(tierLessons.length - 1, prev + 1));
                              }}
                              disabled={activeDeckIndex === tierLessons.length - 1}
                              className={`btn-liquid-glass text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-all border ${
                                activeDeckIndex === tierLessons.length - 1
                                  ? "opacity-30 cursor-not-allowed text-white/50 border-transparent"
                                  : "btn-glass-frosted text-white border-white/20"
                              }`}
                            >
                              <span>Next</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  /* ========================================================= */
                  /* B. EXPANDED 9-LESSON GRID VIEW                            */
                  /* ========================================================= */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {tierLessons.map((lesson, idx) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      const isAudioActive = playingAudioLessonId === lesson.id && isAudioPlaying;

                      return (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, delay: idx * 0.03, ease: "easeOut" }}
                          onClick={() => handleStartLesson(lesson)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[135px] group hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
                            isCompleted
                              ? "bg-stone-50/80 dark:bg-stone-800/80 border-emerald-200/80 dark:border-stone-700"
                              : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xl">{lesson.icon}</span>
                              <div className="flex items-center gap-1">
                                {isCompleted ? (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-0.5">
                                    <CheckCircle2 size={12} /> Done
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-stone-800 dark:text-stone-300">
                                    +25 XP
                                  </span>
                                )}

                                {/* Sarah Audio Trigger Button */}
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleAudio(e, lesson)}
                                  title="Listen to Sarah AI voice tip"
                                  className={`btn-liquid-glass p-2 rounded-xl transition-all cursor-pointer border ${
                                    isAudioActive
                                      ? "bg-amber-400 text-stone-950 animate-bounce border-amber-300"
                                      : "bg-emerald-50 hover:bg-emerald-100 text-[#164E3D] dark:bg-stone-800 dark:text-emerald-300 border border-emerald-200/40"
                                  }`}
                                >
                                  {isAudioActive ? <VolumeX size={13} /> : <Volume2 size={13} />}
                                </button>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-[#164E3D] dark:text-emerald-400 block leading-tight">
                              Lesson {idx + 1} · {lesson.category}
                            </span>
                            <h4 className="text-xs font-bold text-stone-900 dark:text-white leading-snug mt-0.5 group-hover:text-emerald-700 transition-colors line-clamp-2">
                              {lesson.title}
                            </h4>
                          </div>

                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1.5 font-medium">
                            {lesson.headline}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
                <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  {activeLesson.tierName} · Lesson
                </span>

                <button
                  type="button"
                  onClick={(e) => handleToggleAudio(e, activeLesson)}
                  className={`btn-liquid-glass px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    playingAudioLessonId === activeLesson.id && isAudioPlaying
                      ? "bg-amber-400 text-stone-950 shadow-xs animate-pulse border-amber-300"
                      : "bg-emerald-50 hover:bg-emerald-100 text-[#164E3D] border border-emerald-200/60"
                  }`}
                >
                  <Volume2 size={13} />
                  <span>{isAudioPlaying && playingAudioLessonId === activeLesson.id ? "Pause Voice" : "Listen with Sarah AI 🎙️"}</span>
                </button>
              </div>

              <DialogTitle className="text-base font-bold text-stone-900 dark:text-white mt-2">
                {activeLesson.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-600 dark:text-stone-300">
                {activeLesson.headline}
              </DialogDescription>
            </DialogHeader>

            {/* SLIDES PHASE */}
            {currentSlideIndex < activeLesson.storySlides.length ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-50/70 to-stone-50 dark:from-stone-900 dark:to-stone-800/80 p-4 sm:p-5 rounded-2xl border border-emerald-100 dark:border-stone-700">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Slide {currentSlideIndex + 1} of {activeLesson.storySlides.length}
                    </span>
                    <Mascot gesture="waving" size={30} />
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-100 leading-relaxed font-medium">
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
                          ? "w-6 bg-[#164E3D]"
                          : i < currentSlideIndex
                          ? "w-2 bg-emerald-500"
                          : "w-2 bg-stone-200 dark:bg-stone-700"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={handleNextSlide}
                  className="btn-liquid-glass btn-liquid-forest w-full text-white h-11 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-white/20"
                >
                  <span>
                    {currentSlideIndex === activeLesson.storySlides.length - 1
                      ? "Take 10s Quick Quiz (+25 XP) 🎯"
                      : "Next Slide →"}
                  </span>
                </Button>
              </div>
            ) : (
              /* QUIZ PHASE */
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Sparkles size={13} />
                      <span>10-Second Quick Quiz 🎯</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlayQuizQuestion(activeLesson)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border ${
                        isQuizAudioPlaying
                          ? "bg-amber-400 text-stone-950 animate-bounce border-amber-300"
                          : "bg-white/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200/80 hover:bg-stone-100"
                      }`}
                    >
                      {isQuizAudioPlaying ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      <span>{isQuizAudioPlaying ? "Stop" : "Listen to Question 🎙️"}</span>
                    </button>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                    {activeLesson.quiz.question}
                  </h4>
                </div>

                {/* Options with Staggered Slide-In Animation */}
                <div className="space-y-2">
                  {activeLesson.quiz.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === activeLesson.quiz.correctIndex;

                    let btnClass = "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-emerald-300";
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-400/40";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/30";
                      }
                    } else if (isSelected) {
                      btnClass = "border-[#164E3D] bg-emerald-50/90 dark:bg-emerald-950/70 text-[#164E3D] dark:text-emerald-300 font-bold ring-2 ring-emerald-400/40 shadow-xs";
                    }

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.28,
                          delay: idx * 0.08,
                          ease: "easeOut",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          disabled={quizSubmitted}
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer active:scale-98 ${btnClass}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="leading-snug">{option}</span>
                          </div>
                          {quizSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 shrink-0 animate-bounce" />}
                          {quizSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-600 shrink-0" />}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Feedback & Mascot with Slide-Up Animation */}
                {quizSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    {selectedAnswer === activeLesson.quiz.correctIndex ? (
                      <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-emerald-50 to-stone-50 dark:from-stone-800 dark:to-stone-900 rounded-3xl border-2 border-emerald-400 text-center">
                        <Mascot gesture="clapping" size={100} className="drop-shadow-md my-1" />
                        <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold mt-1">
                          Avo Claps: 100% Correct! 👏🎉
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-stone-800 rounded-2xl border border-amber-300 text-center">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                          Avo's Clinical Review Note 📝
                        </span>
                      </div>
                    )}

                    <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800 dark:text-stone-100">
                          Scientific Explanation:
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlayQuizExplanation(activeLesson, selectedAnswer === activeLesson.quiz.correctIndex)}
                          className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 flex items-center gap-1 cursor-pointer transition-all border border-emerald-200/60 dark:border-emerald-800/60"
                        >
                          <Volume2 size={11} />
                          <span>Replay Voice 🎙️</span>
                        </button>
                      </div>
                      <p className="font-bold text-stone-800 dark:text-stone-100 leading-relaxed">
                        {activeLesson.quiz.explanation}
                      </p>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-900 dark:text-emerald-300 font-medium text-xs">
                        💡 <strong>Clinical Takeaway:</strong> {activeLesson.takeaway}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                {!quizSubmitted ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswer === null}
                    className="btn-liquid-glass btn-liquid-forest w-full text-white h-11 rounded-2xl font-bold text-xs shadow-md cursor-pointer disabled:opacity-60 border border-white/20"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveLesson(null)}
                    className="btn-liquid-glass btn-liquid-forest w-full text-white h-11 rounded-2xl font-bold text-xs cursor-pointer shadow-md border border-white/20"
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
            <DialogTitle className="text-lg font-bold text-stone-900 dark:text-white">
              Tier {certificateTier} Certification Unlocked!
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600 dark:text-stone-300 mt-1">
              You have completed all 9 clinical lessons in {getTierBadgeTitle(certificateTier)}.
            </DialogDescription>

            {/* Certificate Card Preview */}
            <div className="w-full my-4 p-5 bg-gradient-to-br from-[#164E3D] via-[#123E31] to-[#0F1412] text-white rounded-3xl border-2 border-amber-400 shadow-xl space-y-3 text-center relative overflow-hidden">
              <div className="text-xs font-mono tracking-widest text-amber-300 uppercase">
                OFFICIAL CERTIFICATE OF METABOLIC MASTERY
              </div>
              <h3 className="text-base font-bold text-white">
                {user?.name || "Metabolic Health Champion"}
              </h3>
              <p className="text-xs text-amber-200 font-bold">
                {getTierBadgeTitle(certificateTier)}
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-300">
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
                className="btn-liquid-glass w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer border border-white/20"
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

      {/* 🎉 PARTY SURVIVAL GUIDE DETAIL MODAL */}
      <Dialog open={showPartyGuideModal} onOpenChange={setShowPartyGuideModal}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-stone-950 via-stone-900 to-[#0F1412] text-white border border-emerald-500/30 max-h-[90vh] overflow-y-auto">
          {selectedPartyGuide && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-amber-400/20 rounded-2xl border border-amber-400/30">
                  {selectedPartyGuide.emoji}
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    {selectedPartyGuide.region}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {selectedPartyGuide.title}
                  </h3>
                </div>
              </div>

              {/* 3 Steps */}
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                  3 Golden Kitchen Steps
                </span>
                {selectedPartyGuide.hackSteps.map((step, idx) => (
                  <p key={idx} className="text-xs text-stone-100 font-medium leading-relaxed">
                    {step}
                  </p>
                ))}
              </div>

              {/* Safe Order List */}
              <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                  Best Plates to Request
                </span>
                {selectedPartyGuide.safeOrderList.map((item, idx) => (
                  <p key={idx} className="text-xs text-emerald-100 font-medium">
                    {item}
                  </p>
                ))}
              </div>

              {/* Drinks Trap */}
              <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-500/30">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block">
                  ⚠️ The Drinks Trap
                </span>
                <p className="text-xs text-rose-100/90 font-medium mt-0.5 leading-relaxed">
                  {selectedPartyGuide.drinksTrap}
                </p>
              </div>

              <Button
                onClick={() => setShowPartyGuideModal(false)}
                className="btn-liquid-glass btn-liquid-forest w-full py-3 text-white font-bold text-xs rounded-2xl cursor-pointer border border-white/20 shadow-md"
              >
                Got It! Ready for the Party 🎉
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 👑 PRO REVERSE-TRIAL UPGRADE MODAL */}
      <Dialog open={showProUpgradeModal} onOpenChange={setShowProUpgradeModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-gradient-to-b from-stone-950 via-stone-900 to-[#123E31] text-white border border-emerald-500/30">
          <div className="text-center space-y-3 pt-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 mx-auto shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-stone-950 rounded-[22px] flex items-center justify-center text-3xl">
                👑
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full shadow-2xs">
                PRO VIP EXCLUSIVE
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                Unlock {lockedItemTitle || "Full Masterclass Hub"}
              </h3>
              <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
                Upgrade to MealOptimiza PRO to unlock all 4 Masterclass Tiers, 10 Party Survival Guides, and Certified Nutrition Diplomas!
              </p>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>All 4 Curriculum Tiers &amp; Clinical Organ Shields</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>10 Cultural Party &amp; Wedding Survival Guides</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-200">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Official Certified African Heritage Nutrition Diploma</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowProUpgradeModal(false);
                toast.success("Redirecting to PRO Checkout...");
              }}
              className="btn-liquid-glass btn-liquid-amber w-full py-3.5 text-stone-950 font-bold text-xs rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300/40"
            >
              <span>Claim 7 Days PRO Free ($9.99/mo)</span>
              <ChevronRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => setShowProUpgradeModal(false)}
              className="text-xs text-stone-400 hover:text-white font-semibold cursor-pointer pt-1 block mx-auto"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
