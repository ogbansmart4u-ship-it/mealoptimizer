import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useLocation } from "../contexts/LocationContext";
import { createMealLog } from "../../lib/api";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { speakWithSarah, stopSarahSpeech } from "../services/voiceService";
import { openAffiliateProduct } from "../../lib/affiliates";
import { soundEffects } from "../utils/soundEffects";
import PageHeader from "../components/PageHeader";
import Mascot from "../components/Mascot";
import {
  Calendar,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Heart,
  Shield,
  Utensils,
  Leaf,
  Globe,
  Share2,
  RefreshCw,
  Info,
  Apple,
  Coffee,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";

export interface DayPlanMeal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  time: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  glycemicIndex: "Low" | "Medium" | "High";
  ingredients: string[];
  diasporaSwaps: string[];
  clinicalBenefit: string;
  cookingHack: string;
}

export interface DaySchedule {
  dayIndex: number;
  dayName: string;
  theme: string;
  targetCalories: number;
  sarahAudioCoaching: string;
  meals: DayPlanMeal[];
}

const SEVEN_DAY_PLANS: DaySchedule[] = [
  {
    dayIndex: 1,
    dayName: "Monday",
    theme: "Fresh Start & All-Day Energy ⚡",
    targetCalories: 1580,
    sarahAudioCoaching: "Welcome to Monday! Today is all about keeping your energy smooth and steady. For breakfast, we have boiled plantain and eggs with spinach. For lunch, fresh fish and delicious ewedu soup keeps you full without feeling heavy or sleepy. Remember to drink plenty of water today!",
    meals: [
      {
        id: "d1-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Boiled Unripe Plantain & Vegetable Egg Frittata",
        emoji: "🍳",
        calories: 380,
        protein: 24,
        carbs: 42,
        fats: 12,
        glycemicIndex: "Low",
        ingredients: ["2 small green plantains", "2 whole eggs", "1 cup chopped spinach or ugu", "Fresh tomato & pepper sauce"],
        diasporaSwaps: ["Collard greens instead of ugu", "Olive oil instead of vegetable oil"],
        clinicalBenefit: "Slow-burning natural carbs keep you full for hours with no sugar spikes or sudden tiredness.",
        cookingHack: "Boil plantains with the skin on first, then peel—this preserves natural vitamins and healthy fiber!"
      },
      {
        id: "d1-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Grilled Titus Fish with Ewedu Soup & Oat Swallow",
        emoji: "🍲",
        calories: 520,
        protein: 38,
        carbs: 48,
        fats: 16,
        glycemicIndex: "Low",
        ingredients: ["1 cup oat swallow", "150g grilled Atlantic mackerel (Titus)", "1 cup fresh Ewedu soup with locust beans (Iru)", "Light pepper stew"],
        diasporaSwaps: ["Rolled oats milled fine", "Frozen jute leaves (Moluhiya)"],
        clinicalBenefit: "Rich green ewedu coats your stomach to slow down digestion and keep your energy smooth all afternoon.",
        cookingHack: "Add a pinch of Iru (locust beans) for rich natural flavor without artificial seasoning cubes."
      },
      {
        id: "d1-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Spiced Catfish Pepper Soup with Fresh Scent Leaves",
        emoji: "🥣",
        calories: 360,
        protein: 35,
        carbs: 14,
        fats: 10,
        glycemicIndex: "Low",
        ingredients: ["200g fresh catfish or tilapia", "Fresh scent leaf or basil", "Traditional peppersoup spice broth", "Fresh ginger & garlic"],
        diasporaSwaps: ["Italian basil or Thai basil", "Fresh cod or trout fillet"],
        clinicalBenefit: "Warm scent leaf pepper soup helps relax your body and soothes digestion for a restful night.",
        cookingHack: "Simmer on low heat for 12 minutes to keep fish tender and preserve its healthy natural oils."
      },
      {
        id: "d1-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Roasted Tiger Nuts & Fresh Coconut Slices",
        emoji: "🥥",
        calories: 180,
        protein: 4,
        carbs: 18,
        fats: 9,
        glycemicIndex: "Low",
        ingredients: ["1/4 cup roasted tiger nuts (Ofio)", "2 thin slices fresh coconut"],
        diasporaSwaps: ["Raw almonds or walnuts"],
        clinicalBenefit: "Crunchy healthy snack that stops afternoon sweet cravings naturally.",
        cookingHack: "Chew tiger nuts well to enjoy the sweet natural milk and make them easy to digest."
      }
    ]
  },
  {
    dayIndex: 2,
    dayName: "Tuesday",
    theme: "Healthy Heart & Natural Glow ❤️",
    targetCalories: 1620,
    sarahAudioCoaching: "Happy Tuesday! Today we focus on loving your heart. Enjoy natural unsweetened ginger zobo to help healthy blood flow, and a tasty plate of rich Efo Riro vegetable soup with tender beef to keep your body strong.",
    meals: [
      {
        id: "d2-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Steamed Moi Moi with Boiled Egg & Chilled Ginger Zobo",
        emoji: "🫘",
        calories: 410,
        protein: 26,
        carbs: 45,
        fats: 11,
        glycemicIndex: "Low",
        ingredients: ["1 wrap steamed bean pudding (Moi Moi)", "1 boiled egg", "1/2 cup flaked fish", "Chilled unsweetened ginger hibiscus tea (Zobo)"],
        diasporaSwaps: ["Black-eyed peas or brown beans", "Silicone muffin molds for steaming"],
        clinicalBenefit: "Hearty bean protein that keeps your tummy happy and satisfied all morning.",
        cookingHack: "Blend crayfish into the bean batter for savory depth without bouillon cubes."
      },
      {
        id: "d2-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Efo Riro (Rich Spinach & Ugu Soup) with Grilled Chicken",
        emoji: "🥬",
        calories: 490,
        protein: 42,
        carbs: 32,
        fats: 18,
        glycemicIndex: "Low",
        ingredients: ["200g skinless chicken", "2 cups chopped ugu or spinach", "1 tbsp unbleached palm oil", "Locust beans & crayfish", "1/2 cup brown rice or fonio"],
        diasporaSwaps: ["Organic kale or collards", "Ancient Fonio grain"],
        clinicalBenefit: "Packed with dark green vegetables and iron to give you natural stamina and glowing skin.",
        cookingHack: "Turn off heat before adding vegetables so they stay bright green, crunchy, and packed with vitamins!"
      },
      {
        id: "d2-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Garden Egg Sauce with Roasted Sweet Potato & Grilled Prawns",
        emoji: "🍆",
        calories: 390,
        protein: 28,
        carbs: 38,
        fats: 10,
        glycemicIndex: "Low",
        ingredients: ["4 steamed garden eggs mashed", "1 small roasted sweet potato", "6 grilled tiger prawns", "Fresh pepper & tomato sauce"],
        diasporaSwaps: ["Eggplant or zucchini", "Wild-caught shrimp"],
        clinicalBenefit: "Garden eggs are gentle on digestion and keep your dinner light and nourishing.",
        cookingHack: "Roast sweet potatoes with the skin on for extra potassium and natural fiber!"
      },
      {
        id: "d2-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Crisp Cucumber Slices with Natural Peanut Butter",
        emoji: "🥒",
        calories: 150,
        protein: 6,
        carbs: 8,
        fats: 11,
        glycemicIndex: "Low",
        ingredients: ["1 whole cucumber sliced", "1 tbsp 100% pure roasted peanut butter"],
        diasporaSwaps: ["Almond butter"],
        clinicalBenefit: "Cool crisp cucumbers with real peanut butter to satisfy hunger without heavy snacking.",
        cookingHack: "A tiny pinch of pepper adds a nice kick and naturally warms up your body."
      }
    ]
  },
  {
    dayIndex: 3,
    dayName: "Wednesday",
    theme: "Clean Living & Supergrain Energy 🌾",
    targetCalories: 1590,
    sarahAudioCoaching: "It's Wednesday! Today we are enjoying quick-cooking African Fonio grain—it's light, gentle on the stomach, and won't make you feel bloated. For dinner, delicious bitter leaf soup helps refresh and cleanse your system naturally.",
    meals: [
      {
        id: "d3-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Fonio Porridge with Warm Spiced Milk & Sweet Papaya",
        emoji: "🥣",
        calories: 360,
        protein: 16,
        carbs: 52,
        fats: 8,
        glycemicIndex: "Low",
        ingredients: ["1/2 cup cooked Fonio grain", "1 cup warm milk or almond milk", "1 tbsp chia seeds", "1/2 cup fresh diced pawpaw (papaya)"],
        diasporaSwaps: ["Steel-cut oats or quinoa", "Fresh blueberries or mango"],
        clinicalBenefit: "Naturally light, gluten-free ancient grain that is gentle on your stomach and quick to digest.",
        cookingHack: "Fonio cooks in only 3 minutes! Steam with boiling water and fluff with a fork."
      },
      {
        id: "d3-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Flavor-Packed Cauli-Jollof with Grilled Chicken Suya",
        emoji: "🍗",
        calories: 510,
        protein: 44,
        carbs: 28,
        fats: 18,
        glycemicIndex: "Low",
        ingredients: ["2 cups riced cauliflower & 1/2 cup brown rice", "Rich roasted tomato-pepper sauce", "200g grilled suya-spiced chicken", "Steamed green beans"],
        diasporaSwaps: ["Supermarket riced cauliflower", "Smoked paprika & ginger rub"],
        clinicalBenefit: "All the authentic party Jollof flavor you love, while keeping you light and energized.",
        cookingHack: "Brown the tomato paste in olive oil until sweet before adding the cauliflower rice."
      },
      {
        id: "d3-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Traditional Bitter Leaf Soup (Ofe Onugbu) with Lean Beef",
        emoji: "🍲",
        calories: 390,
        protein: 34,
        carbs: 22,
        fats: 14,
        glycemicIndex: "Low",
        ingredients: ["Washed bitter leaf", "150g lean beef & stockfish", "1 tbsp cocoyam paste for light thickening", "Crayfish & seasoning blend"],
        diasporaSwaps: ["Frozen pre-washed bitter leaf", "Ground flaxseed thickener"],
        clinicalBenefit: "Traditional bitter leaf soup naturally refreshes your body and supports healthy digestion.",
        cookingHack: "Boil washed bitter leaves with a slice of lemon to balance the herbal bitterness."
      },
      {
        id: "d3-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Crisp Green Apple with a Handful of Cashews",
        emoji: "🍏",
        calories: 160,
        protein: 4,
        carbs: 18,
        fats: 9,
        glycemicIndex: "Low",
        ingredients: ["1 crisp green apple or pink guava", "10 raw unsalted cashew nuts"],
        diasporaSwaps: ["Granny Smith apple"],
        clinicalBenefit: "Crisp fresh fruit and healthy nuts that help keep your heart healthy.",
        cookingHack: "Eat fruit whole with the skin for optimal fiber and lasting fullness."
      }
    ]
  },
  {
    dayIndex: 4,
    dayName: "Thursday",
    theme: "Natural Hydration & Body Refresh 💧",
    targetCalories: 1570,
    sarahAudioCoaching: "Thursday is here! Today is all about natural hydration and staying light on your feet. Fresh okra soup and grilled fish give your body clean nourishment without excess salt. Stay energized and keep moving!",
    meals: [
      {
        id: "d4-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Scrambled Eggs with Sautéed Ugu, Tomatoes & 1 Slice Whole Grain Toast",
        emoji: "🍞",
        calories: 390,
        protein: 22,
        carbs: 28,
        fats: 16,
        glycemicIndex: "Low",
        ingredients: ["3 eggs scrambled", "1 cup fresh chopped ugu or spinach", "1 slice sourdough or whole wheat bread", "1/4 avocado"],
        diasporaSwaps: ["Whole wheat sourdough", "Baby spinach"],
        clinicalBenefit: "Real whole grain bread and eggs digest slowly, preventing morning sugar crashes.",
        cookingHack: "Whisk eggs with 1 tablespoon of water for extra fluffy texture without butter."
      },
      {
        id: "d4-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Fresh Seafood Okra Soup with Plantain-Oat Swallow",
        emoji: "🥣",
        calories: 480,
        protein: 40,
        carbs: 42,
        fats: 12,
        glycemicIndex: "Low",
        ingredients: ["2 cups freshly chopped crunchy okra", "150g fresh fish or salmon", "Smoked prawns & crayfish", "1 small fist-sized Plantain-Oat swallow"],
        diasporaSwaps: ["Fresh or frozen cut okra", "Atlantic cod or salmon fillet"],
        clinicalBenefit: "Smooth fresh okra is easy on your stomach and helps naturally flush out waste.",
        cookingHack: "Cook okra for only 6 minutes so it stays bright green, crunchy, and nutrient-packed."
      },
      {
        id: "d4-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Grilled Chicken Breast with Steamed Cabbage & Carrot Stir-Fry",
        emoji: "🥗",
        calories: 370,
        protein: 38,
        carbs: 18,
        fats: 10,
        glycemicIndex: "Low",
        ingredients: ["200g skinless chicken breast with ginger-garlic", "2 cups shredded green cabbage & carrots", "1 tbsp olive oil"],
        diasporaSwaps: ["Fresh bagged coleslaw mix (raw)"],
        clinicalBenefit: "Crispy seasoned cabbage and lean chicken keep dinner light, clean, and satisfying.",
        cookingHack: "Sauté cabbage on high heat for 3 minutes with black pepper for a smoky stir-fry taste."
      },
      {
        id: "d4-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Warm Ginger & Lemongrass Tea with 5 Walnuts",
        emoji: "🍵",
        calories: 140,
        protein: 3,
        carbs: 4,
        fats: 13,
        glycemicIndex: "Low",
        ingredients: ["Freshly brewed ginger & lemongrass", "5 raw walnut halves"],
        diasporaSwaps: ["Lemongrass herbal tea bags"],
        clinicalBenefit: "Warm herbal tea and crunchy walnuts loaded with healthy oils for brain power.",
        cookingHack: "Steep crushed fresh ginger for 10 minutes to bring out all its soothing warmth."
      }
    ]
  },
  {
    dayIndex: 5,
    dayName: "Friday",
    theme: "Feel-Good Friday & Clean Energy 🛡️",
    targetCalories: 1640,
    sarahAudioCoaching: "Happy Friday! Get ready for the weekend with meals that make you feel great. Enjoy hearty Afang soup for lunch, and a mouth-watering grilled Asun salad for dinner so you can enjoy your favorites guilt-free!",
    meals: [
      {
        id: "d5-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Crispy Air-Fried Bean Cakes (Akara) with Warm Cinnamon Milk",
        emoji: "🧆",
        calories: 420,
        protein: 24,
        carbs: 48,
        fats: 10,
        glycemicIndex: "Low",
        ingredients: ["4 air-fried or lightly cooked bean cakes", "1 cup warm oat milk or unsweetened pap", "Fresh strawberries or banana slices"],
        diasporaSwaps: ["Air fryer silicone cups", "Almond or soy milk"],
        clinicalBenefit: "Crispy, golden bean cakes prepared with 85% less oil for clean, guilt-free enjoyment.",
        cookingHack: "Brush tops of Akara with a few drops of oil before air-frying for that authentic crunchy bite."
      },
      {
        id: "d5-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Rich Afang Soup with Smoked Mackerel & Lean Meat",
        emoji: "🍲",
        calories: 530,
        protein: 42,
        carbs: 36,
        fats: 20,
        glycemicIndex: "Low",
        ingredients: ["Shredded wild Afang (Ukazi) leaves", "Waterleaf or spinach", "150g smoked fish & lean beef", "1 small wrap Plantain or Fonio swallow"],
        diasporaSwaps: ["Dried Okazi leaves soaked in warm water", "Baby spinach for waterleaf"],
        clinicalBenefit: "Hearty wild greens and tender fish that keep your bowel movements smooth and regular.",
        cookingHack: "Pound soaked Ukazi finely with a dash of crayfish to release its dark green richness."
      },
      {
        id: "d5-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Grilled Suya-Spiced Goat Meat (Asun) Fresh Salad Bowl",
        emoji: "🥗",
        calories: 380,
        protein: 36,
        carbs: 16,
        fats: 14,
        glycemicIndex: "Low",
        ingredients: ["150g tender lean goat meat grilled with pepper and onions", "2 cups crisp lettuce & sliced cucumbers", "Sweet corn & diced tomatoes"],
        diasporaSwaps: ["Lean lamb or beef sirloin strips", "Authentic Northern suya spice"],
        clinicalBenefit: "Lean, tender grilled goat meat delivers clean muscle fuel and iron without heavy grease.",
        cookingHack: "Trim visible fat from meat before grilling with onions and sweet peppers."
      },
      {
        id: "d5-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Sparkling Lemon-Mint Water with Roasted Almonds",
        emoji: "🍋",
        calories: 160,
        protein: 6,
        carbs: 6,
        fats: 14,
        glycemicIndex: "Low",
        ingredients: ["Sparkling water with fresh lemon slices & mint leaves", "12 raw almonds"],
        diasporaSwaps: ["Perrier or sparkling water with fresh lemon"],
        clinicalBenefit: "Refreshing lemon mint water with roasted almonds keeps your thirst quenched and energy high.",
        cookingHack: "Crush mint leaves at the bottom of the glass to release their refreshing natural scent."
      }
    ]
  },
  {
    dayIndex: 6,
    dayName: "Saturday",
    theme: "Weekend Celebration & Party Balance 🥳",
    targetCalories: 1680,
    sarahAudioCoaching: "It's Saturday! Time to celebrate and enjoy family. Here is your party secret: eat your vegetables and meat first before digging into that delicious party Jollof rice. Enjoy your day and have fun!",
    meals: [
      {
        id: "d6-m1",
        type: "breakfast",
        time: "8:30 AM - 10:00 AM",
        name: "Avocado Toast on Whole Grain Sourdough with Poached Eggs",
        emoji: "🥑",
        calories: 430,
        protein: 20,
        carbs: 34,
        fats: 22,
        glycemicIndex: "Low",
        ingredients: ["2 slices whole grain or sourdough bread", "1/2 ripe avocado mashed with lime & pepper", "2 soft-poached eggs", "Cherry tomatoes"],
        diasporaSwaps: ["Sprouted grain bread"],
        clinicalBenefit: "Creamy avocado and eggs provide good fats that keep your skin glowing and hunger away.",
        cookingHack: "Add a splash of vinegar to simmering water to keep poached eggs perfectly shaped!"
      },
      {
        id: "d6-m2",
        type: "lunch",
        time: "1:30 PM - 3:00 PM",
        name: "The Party Plate: Smokey Jollof Rice with Double Grilled Chicken & Greens",
        emoji: "🎉",
        calories: 560,
        protein: 45,
        carbs: 52,
        fats: 16,
        glycemicIndex: "Medium",
        ingredients: ["1 cup smokey party Jollof rice", "Double portion grilled chicken breast", "1 cup rich vegetable soup (Efo)", "1 small slice baked plantain"],
        diasporaSwaps: ["Parboiled long-grain rice with roasted peppers"],
        clinicalBenefit: "Enjoy authentic party Jollof guilt-free by eating your chicken and greens first to prevent a food coma.",
        cookingHack: "Follow our simple rule: Half the plate greens and protein, one quarter Jollof!"
      },
      {
        id: "d6-m3",
        type: "dinner",
        time: "7:00 PM - 8:30 PM",
        name: "Light Fish Pepper Soup with Steamed Garden Greens",
        emoji: "🐟",
        calories: 340,
        protein: 36,
        carbs: 12,
        fats: 8,
        glycemicIndex: "Low",
        ingredients: ["200g red snapper or tilapia fillet", "Warm pepper soup broth with ginger & scent leaf", "Steamed sweet cabbage"],
        diasporaSwaps: ["Cod or Halibut fillet"],
        clinicalBenefit: "Warm, soothing fish pepper soup that is super light so you sleep comfortably.",
        cookingHack: "A pinch of alligator pepper brings authentic aroma and helps calm your stomach."
      },
      {
        id: "d6-m4",
        type: "snack",
        time: "4:30 PM",
        name: "Cold Sliced Watermelon with Crunchy Pumpkin Seeds",
        emoji: "🍉",
        calories: 150,
        protein: 5,
        carbs: 18,
        fats: 7,
        glycemicIndex: "Medium",
        ingredients: ["1 cup cold watermelon cubes", "1 tbsp raw pumpkin seeds"],
        diasporaSwaps: ["Shelled pumpkin seeds (pepitas)"],
        clinicalBenefit: "Sweet cold watermelon paired with pumpkin seeds to keep you cool and satisfied.",
        cookingHack: "Pair sweet fruit with seeds or nuts to stay full longer."
      }
    ]
  },
  {
    dayIndex: 7,
    dayName: "Sunday",
    theme: "Sunday Family Feasting & Recharge 🍲",
    targetCalories: 1600,
    sarahAudioCoaching: "Happy Sunday! Time to relax, spend time with loved ones, and recharge for the new week. Enjoy your favorite comfort soups, take a good rest, and be proud of your healthy week!",
    meals: [
      {
        id: "d7-m1",
        type: "breakfast",
        time: "8:30 AM - 10:00 AM",
        name: "Boiled Yam & Garden Egg Sauce with Flaked Mackerel",
        emoji: "🍠",
        calories: 420,
        protein: 26,
        carbs: 48,
        fats: 12,
        glycemicIndex: "Low",
        ingredients: ["2 thick slices boiled soft yam", "Steamed garden egg sauce", "100g smoked mackerel flakes", "1 tsp healthy palm oil"],
        diasporaSwaps: ["Sweet potato or cassava", "Italian eggplant"],
        clinicalBenefit: "Classic Sunday morning comfort that keeps you full and fueled until lunchtime.",
        cookingHack: "Boil yam with a pinch of salt and leave in warm water until ready to serve for maximum softness."
      },
      {
        id: "d7-m2",
        type: "lunch",
        time: "1:30 PM - 3:00 PM",
        name: "Traditional White Soup (Ofe Nsala) with Fish & Oat Swallow",
        emoji: "🥣",
        calories: 520,
        protein: 42,
        carbs: 46,
        fats: 14,
        glycemicIndex: "Low",
        ingredients: ["1 cup oat swallow", "200g fresh catfish or Titus", "Utazi leaf and traditional herbs broth", "Ground crayfish & seasoning"],
        diasporaSwaps: ["Ground rolled oats", "Fresh whole trout"],
        clinicalBenefit: "Fragrant traditional herbs add amazing flavor while helping your body process carbs with ease.",
        cookingHack: "Add shredded Utazi leaf during the last 2 minutes so its aromatic herbal flavor stays fresh."
      },
      {
        id: "d7-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Steamed Vegetable Egusi (Light & Oil-Free) with Grilled Turkey",
        emoji: "🥬",
        calories: 380,
        protein: 36,
        carbs: 18,
        fats: 16,
        glycemicIndex: "Low",
        ingredients: ["1/4 cup ground melon seeds (Egusi)", "150g grilled turkey breast", "2 cups chopped fresh Ugu & spinach", "Locust beans & crayfish"],
        diasporaSwaps: ["Ground pumpkin seeds", "Skinless chicken breasts"],
        clinicalBenefit: "Tender melon seeds and fresh greens provide natural minerals that relax your muscles for deep sleep.",
        cookingHack: "Drop egusi into boiling soup without frying in oil—it creates juicy, tender dumplings!"
      },
      {
        id: "d7-m4",
        type: "snack",
        time: "4:30 PM",
        name: "Warm Golden Turmeric & Ginger Coconut Drink",
        emoji: "🥥",
        calories: 140,
        protein: 2,
        carbs: 6,
        fats: 12,
        glycemicIndex: "Low",
        ingredients: ["1 cup light coconut milk", "1/2 tsp turmeric powder & black pepper", "Grated fresh ginger"],
        diasporaSwaps: ["Unsweetened almond milk"],
        clinicalBenefit: "Warm golden spiced milk calms your stomach and prepares you for a peaceful night's rest.",
        cookingHack: "A tiny pinch of black pepper helps your body absorb all the healthy goodness of turmeric!"
      }
    ]
  }
];

// 🥗 Alternative Swap Options for Interactive Dish Switching
const MEAL_ALTERNATIVES: Record<string, DayPlanMeal[]> = {
  breakfast: [
    {
      id: "alt-b1",
      type: "breakfast",
      time: "7:30 AM - 9:00 AM",
      name: "Steamed Moi Moi with Boiled Egg & Chilled Zobo",
      emoji: "🫘",
      calories: 410,
      protein: 26,
      carbs: 45,
      fats: 11,
      glycemicIndex: "Low",
      ingredients: ["1 wrap steamed bean pudding (Moi Moi)", "1 boiled egg", "1/2 cup flaked fish", "Chilled ginger Zobo tea"],
      diasporaSwaps: ["Black-eyed peas pudding", "Smoked trout fillet"],
      clinicalBenefit: "Hearty bean protein that keeps your tummy happy and satisfied all morning.",
      cookingHack: "Blend crayfish into the bean batter for savory depth without salt.",
    },
    {
      id: "alt-b2",
      type: "breakfast",
      time: "8:00 AM - 9:30 AM",
      name: "Warm Oat Porridge with Chia Seeds & Cinnamon",
      emoji: "🥣",
      calories: 360,
      protein: 18,
      carbs: 46,
      fats: 10,
      glycemicIndex: "Low",
      ingredients: ["1 cup rolled oats", "1 tbsp chia seeds", "1/2 tsp cinnamon", "Unsweetened milk"],
      diasporaSwaps: ["Rolled whole oats", "Unsweetened almond milk"],
      clinicalBenefit: "Wholesome oats keep your tummy full and blood sugar smooth all morning without sugar crashes.",
      cookingHack: "Simmer with a whole cinnamon stick for natural sweetness without sugar.",
    },
  ],
  lunch: [
    {
      id: "alt-l1",
      type: "lunch",
      time: "1:00 PM - 2:30 PM",
      name: "Grilled Fish with Fresh Okra Soup & Oat Swallow",
      emoji: "🍲",
      calories: 490,
      protein: 42,
      carbs: 45,
      fats: 14,
      glycemicIndex: "Low",
      ingredients: ["200g grilled tilapia fillet", "1.5 cups fresh diced okra soup", "1 cup oat swallow", "Locust beans & pepper"],
      diasporaSwaps: ["Frozen sliced okra", "Milled rolled oats"],
      clinicalBenefit: "Rich okra fiber slows down digestion so you stay full and energized without feeling heavy.",
      cookingHack: "Chop okra coarsely instead of blending to keep that delicious crunchy texture!",
    },
    {
      id: "alt-l2",
      type: "lunch",
      time: "1:30 PM - 3:00 PM",
      name: "The Balanced Party Plate: Jollof Rice, Grilled Chicken & Greens",
      emoji: "🎉",
      calories: 540,
      protein: 46,
      carbs: 48,
      fats: 15,
      glycemicIndex: "Low",
      ingredients: ["1 cup smokey Jollof rice", "Double portion grilled chicken", "1.5 cups fresh vegetable stew"],
      diasporaSwaps: ["Basmati sella rice", "Collard greens stew"],
      clinicalBenefit: "Starting with greens and chicken lets you enjoy rice without the dreaded afternoon food coma.",
      cookingHack: "Always start with 3 mouthfuls of vegetable soup before touching the rice.",
    },
  ],
  dinner: [
    {
      id: "alt-d1",
      type: "dinner",
      time: "6:30 PM - 8:00 PM",
      name: "Light Snapper Fish Pepper Soup with Scent Leaves",
      emoji: "🐟",
      calories: 330,
      protein: 36,
      carbs: 12,
      fats: 8,
      glycemicIndex: "Low",
      ingredients: ["200g red snapper fillet", "Fresh scent leaf broth", "Peppersoup spices and ginger"],
      diasporaSwaps: ["Fresh cod or sea bass", "Italian basil"],
      clinicalBenefit: "Light, soothing pepper soup that eases digestion and helps you unwind before bed.",
      cookingHack: "Add fresh scent leaf at the very end of boiling to retain its fresh aroma.",
    },
    {
      id: "alt-d2",
      type: "dinner",
      time: "7:00 PM - 8:30 PM",
      name: "Steamed Vegetable Egusi with Grilled Turkey",
      emoji: "🥬",
      calories: 380,
      protein: 38,
      carbs: 16,
      fats: 14,
      glycemicIndex: "Low",
      ingredients: ["1/4 cup ground melon seeds (Egusi)", "150g grilled turkey", "2 cups chopped spinach & Ugu"],
      diasporaSwaps: ["Ground pumpkin seeds", "Skinless chicken breast"],
      clinicalBenefit: "Nutrient-packed melon seeds and greens that calm your muscles and support deep, restful sleep.",
      cookingHack: "Drop egusi paste directly into boiling soup without frying in oil.",
    },
  ],
  snack: [
    {
      id: "alt-s1",
      type: "snack",
      time: "4:00 PM",
      name: "Crisp Cucumber Slices with Natural Peanut Butter",
      emoji: "🥒",
      calories: 140,
      protein: 6,
      carbs: 7,
      fats: 10,
      glycemicIndex: "Low",
      ingredients: ["1 whole cucumber sliced", "1 tbsp 100% roasted peanut butter"],
      diasporaSwaps: ["Almond butter"],
      clinicalBenefit: "Crisp cucumber and real peanut butter to crush 4 PM cravings without sugary snacks.",
      cookingHack: "A tiny pinch of pepper on cucumber gives a nice refreshing kick.",
    },
    {
      id: "alt-s2",
      type: "snack",
      time: "4:30 PM",
      name: "Warm Golden Turmeric & Ginger Coconut Drink",
      emoji: "🥥",
      calories: 130,
      protein: 2,
      carbs: 5,
      fats: 11,
      glycemicIndex: "Low",
      ingredients: ["1 cup light coconut milk", "1/2 tsp turmeric powder & black pepper", "Grated ginger"],
      diasporaSwaps: ["Unsweetened almond milk"],
      clinicalBenefit: "Soothing warm drink that calms your tummy and helps you drift off to sleep.",
      cookingHack: "Add a pinch of black pepper to help your body absorb the turmeric goodness.",
    },
  ],
};

// 🗓️ Helper to sync with real-time day of week (Monday = 1, Tuesday = 2, ..., Sunday = 7)
function getTodayDayIndex(): number {
  const day = new Date().getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  return day === 0 ? 7 : day;
}

export default function PlanMeal() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const { t } = useLanguage();
  const { selectedLocation } = useLocation();

  const todayDayIndex = useMemo(() => getTodayDayIndex(), []);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(() => getTodayDayIndex());
  const [diasporaMode, setDiasporaMode] = useState(true);
  const [isSarahSpeaking, setIsSarahSpeaking] = useState(false);
  const [selectedMealDetail, setSelectedMealDetail] = useState<DayPlanMeal | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [swappedMeals, setSwappedMeals] = useState<Record<string, DayPlanMeal>>({});

  // Track logged meals for today so users can see immediate visual progress
  const [loggedMealIds, setLoggedMealIds] = useState<string[]>(() => {
    try {
      const todayDate = new Date().toISOString().split("T")[0];
      const saved = JSON.parse(localStorage.getItem(`mo_logged_meals_${todayDate}`) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const activeDay = useMemo(() => {
    return SEVEN_DAY_PLANS.find((d) => d.dayIndex === activeDayIndex) || SEVEN_DAY_PLANS[0];
  }, [activeDayIndex]);

  // Merge active day meals with any user swaps
  const currentMeals = useMemo(() => {
    return activeDay.meals.map((m) => swappedMeals[m.id] || m);
  }, [activeDay, swappedMeals]);

  // Calculate real-time daily macro budget
  const dailyTotals = useMemo(() => {
    return currentMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }, [currentMeals]);

  // 🗓️ Guaranteed synchronization with real-time calendar day on mount
  useEffect(() => {
    setActiveDayIndex(getTodayDayIndex());
  }, []);

  // Clean up audio speech on unmount or day change
  useEffect(() => {
    return () => {
      stopSarahSpeech();
    };
  }, [activeDayIndex]);

  // Sarah Voice Coaching Toggle with audio feedback
  const handleToggleSarahVoice = () => {
    triggerHaptic("medium");
    if (isSarahSpeaking) {
      stopSarahSpeech();
      setIsSarahSpeaking(false);
    } else {
      stopSarahSpeech();
      setIsSarahSpeaking(true);
      speakWithSarah(activeDay.sarahAudioCoaching, {
        onStart: () => setIsSarahSpeaking(true),
        onEnd: () => {
          setIsSarahSpeaking(false);
          toast.success("Sarah coaching finished! 🥑🎙️");
        },
        onError: () => setIsSarahSpeaking(false),
      });
    }
  };

  // 1-Tap Log a Single Meal to Food Diary
  const handleLogSingleMeal = async (meal: DayPlanMeal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic("success");
    soundEffects.playCelebrationChord();

    try {
      const todayDate = new Date().toISOString().split("T")[0];
      await createMealLog({
        date: todayDate,
        time: meal.time.split("-")[0].trim(),
        mealType: meal.type,
        foodName: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        bloodSugarImpact: meal.glycemicIndex.toLowerCase(),
        notes: `7-Day Plan (${activeDay.dayName}): ${meal.clinicalBenefit}`,
      });

      const updated = Array.from(new Set([...loggedMealIds, meal.id]));
      setLoggedMealIds(updated);
      try {
        localStorage.setItem(`mo_logged_meals_${todayDate}`, JSON.stringify(updated));
      } catch {}

      toast.success(`Logged ${meal.name} (${meal.calories} kcal) to your food diary! 🍲`);
    } catch {
      toast.error("Failed to log meal to diary");
    }
  };

  // Interactive Swap Dish handler
  const handleSwapMeal = (meal: DayPlanMeal, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic("medium");
    soundEffects.playTactileTick();

    const alts = MEAL_ALTERNATIVES[meal.type] || [];
    if (alts.length === 0) {
      toast.info("No alternative swap available for this slot.");
      return;
    }

    const currentAlt = swappedMeals[meal.id];
    let nextAlt: DayPlanMeal;
    if (!currentAlt) {
      nextAlt = alts[0];
    } else {
      const currIdx = alts.findIndex((a) => a.id === currentAlt.id);
      if (currIdx === -1 || currIdx === alts.length - 1) {
        // Revert back to baseline menu item
        const next = { ...swappedMeals };
        delete next[meal.id];
        setSwappedMeals(next);
        toast.success(`Reverted to original ${meal.name}! 🔄`);
        return;
      } else {
        nextAlt = alts[currIdx + 1];
      }
    }

    setSwappedMeals((prev) => ({ ...prev, [meal.id]: nextAlt }));
    toast.success(`Swapped to ${nextAlt.name}! 🥗`);
  };

  // 1-Tap Share / Copy Day's Menu (Formatted for WhatsApp/Family)
  const handleShareDayPlan = () => {
    triggerHaptic("light");
    const text =
      `🥗 *MealOptimiza 7-Day Plan: ${activeDay.dayName}*\nTheme: ${activeDay.theme}\n\n` +
      currentMeals
        .map(
          (m) =>
            `• *${m.type.toUpperCase()}* (${m.time}): ${m.name} (${m.calories} kcal, ${m.protein}g protein)\n  💡 Benefit: ${m.clinicalBenefit}`
        )
        .join("\n\n") +
      `\n\nDaily Total: ${dailyTotals.calories} kcal • ${dailyTotals.protein}g Protein\nTracked with MealOptimiza 🥑`;

    if (navigator.share) {
      navigator.share({ title: `MealOptimiza: ${activeDay.dayName} Plan`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Meal plan copied to clipboard! Ready to paste into WhatsApp 📋");
    }
  };

  // 1-Tap Export All 7 Days to Grocery Checklist
  const handleExportWholeWeekToGrocery = () => {
    triggerHaptic("success");
    triggerConfetti("burst");

    try {
      const allIngredients: { id: string; name: string; quantity: string; category: string; checked: boolean }[] = [];

      SEVEN_DAY_PLANS.forEach((day) => {
        day.meals.forEach((meal) => {
          const list = diasporaMode ? meal.diasporaSwaps.concat(meal.ingredients) : meal.ingredients;
          list.forEach((ing) => {
            allIngredients.push({
              id: `7day-${Date.now()}-${Math.random()}`,
              name: ing,
              quantity: "Weekly Prep",
              category: "7-Day Meal Plan",
              checked: false,
            });
          });
        });
      });

      const existing = JSON.parse(localStorage.getItem("mealoptimizer_custom_groceries") || "[]");
      const merged = [...existing, ...allIngredients];
      localStorage.setItem("mealoptimizer_custom_groceries", JSON.stringify(merged));

      toast.success("All 7 days of groceries exported! Redirecting to Smart Stores 🛒");
      setTimeout(() => navigate("/grocery"), 700);
    } catch {
      toast.error("Failed to export groceries");
    }
  };

  // 1-Tap Log All 4 Meals of Active Day to Diary
  const handleLogActiveDayToDiary = async () => {
    triggerHaptic("success");
    triggerConfetti("cannons");

    try {
      const todayDate = new Date().toISOString().split("T")[0];
      for (const meal of currentMeals) {
        await createMealLog({
          date: todayDate,
          time: meal.time.split("-")[0].trim(),
          mealType: meal.type,
          foodName: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
          bloodSugarImpact: meal.glycemicIndex.toLowerCase(),
          notes: `7-Day Plan: ${meal.clinicalBenefit}`,
        });
      }

      const allIds = currentMeals.map((m) => m.id);
      const updated = Array.from(new Set([...loggedMealIds, ...allIds]));
      setLoggedMealIds(updated);
      try {
        localStorage.setItem(`mo_logged_meals_${todayDate}`, JSON.stringify(updated));
      } catch {}

      toast.success(`Logged all 4 meals for ${activeDay.dayName} to your food diary! 🎉`);
    } catch {
      toast.error("Failed to log day meals");
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-b from-[#E8F5F5] via-slate-50 to-teal-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-slate-900 dark:text-white">
      {/* Header */}
      <PageHeader
        title="7-Day Healthy African Meal Plan"
        subtitle="Delicious, wholesome meals to keep your sugar balanced and energy high all day"
        backTo="/home"
      />

      <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-3.5 -mt-2">
        {/* ⚡ JUMP TO TODAY BANNER (Shown when browsing another day) */}
        {activeDayIndex !== todayDayIndex && (
          <div className="flex items-center justify-between p-2.5 px-3.5 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-300/40 dark:border-amber-700/40 rounded-2xl text-xs text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-amber-600 dark:text-amber-400" />
              <span>
                Browsing <strong>{activeDay.dayName}'s Menu</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEffects.playTactileTick();
                triggerHaptic("light");
                setActiveDayIndex(todayDayIndex);
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-[11px] transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
            >
              <span>Back to Today ({SEVEN_DAY_PLANS.find((d) => d.dayIndex === todayDayIndex)?.dayName.slice(0, 3)})</span>
              <Zap size={11} />
            </button>
          </div>
        )}

        {/* 🎙️ SARAH 24/7 AI VOICE COACHING HERO CARD */}
        <div className={`rounded-3xl p-4 sm:p-5 shadow-xl transition-all relative overflow-hidden text-white ${
          isSarahSpeaking
            ? "bg-gradient-to-br from-[#126778] via-[#0f5462] to-[#0a232a] border-2 border-amber-400 ring-4 ring-amber-400/20"
            : "bg-gradient-to-br from-[#126778] via-[#0f5462] to-[#0a232a] border-2 border-teal-300/30"
        }`}>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-teal-400 p-0.5 shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
                    👩🏾‍💼
                  </div>
                </div>
                {isSarahSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9.5px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                    Sarah Voice Guide
                  </span>
                  <span className="text-[10px] text-teal-200 font-bold">{activeDay.dayName} Audio</span>

                  {/* Animated Waveform Equalizer when speaking */}
                  {isSarahSpeaking && (
                    <div className="flex items-end gap-0.5 h-3 ml-1">
                      <div className="w-0.5 bg-amber-300 rounded-full animate-pulse h-2" />
                      <div className="w-0.5 bg-amber-400 rounded-full animate-bounce h-3" />
                      <div className="w-0.5 bg-amber-300 rounded-full animate-pulse h-1.5" />
                      <div className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2.5" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5">
                  {activeDay.theme}
                </h3>
              </div>
            </div>

            {/* Voice Trigger Button */}
            <button
              type="button"
              onClick={handleToggleSarahVoice}
              className={`p-3 rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center gap-2 ${
                isSarahSpeaking
                  ? "bg-amber-400 text-slate-950 scale-105 animate-pulse"
                  : "bg-white/20 hover:bg-white/30 text-white border border-white/25 active:scale-95"
              }`}
              title={isSarahSpeaking ? "Pause Sarah Voice" : "Listen to Sarah Voice Coaching"}
            >
              {isSarahSpeaking ? <Pause size={16} /> : <Volume2 size={16} />}
              <span className="hidden sm:inline">{isSarahSpeaking ? "Pause" : "Listen"}</span>
            </button>
          </div>

          <p className="text-xs text-teal-100/90 font-medium mt-3 leading-relaxed relative z-10 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
            "{activeDay.sarahAudioCoaching}"
          </p>
        </div>

        {/* 📅 7-DAY INTERACTIVE DAY SELECTOR BAR */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SEVEN_DAY_PLANS.map((day) => {
            const isActive = day.dayIndex === activeDayIndex;
            const isToday = day.dayIndex === todayDayIndex;
            return (
              <button
                key={day.dayIndex}
                onClick={() => {
                  soundEffects.playTactileTick();
                  triggerHaptic("light");
                  setActiveDayIndex(day.dayIndex);
                }}
                className={`flex-1 min-w-[48px] py-2 px-1 rounded-2xl text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 relative ${
                  isActive
                    ? "bg-gradient-to-b from-[#126778] to-[#0d4f5c] text-white shadow-lg scale-105 ring-2 ring-teal-400/50"
                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700 hover:bg-teal-50/50"
                }`}
              >
                {isToday && (
                  <span
                    className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full leading-tight shadow-2xs ${
                      isActive ? "bg-amber-400 text-slate-950 font-black" : "bg-emerald-600 text-white font-bold"
                    }`}
                  >
                    Today
                  </span>
                )}
                <span className={`text-[9.5px] font-black uppercase ${isActive ? "text-amber-300" : "text-slate-400"}`}>
                  Day {day.dayIndex}
                </span>
                <span className="text-xs font-black truncate">{day.dayName.slice(0, 3)}</span>
                <span className="text-[9px] font-semibold opacity-80">{day.targetCalories}k</span>
              </button>
            );
          })}
        </div>

        {/* 📊 DAILY NUTRITIONAL TARGET GAUGE */}
        <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-zinc-700/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-black mb-2">
            <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Flame size={14} className="text-amber-500 fill-amber-500" />
              <span>{activeDay.dayName} Target Nutrition</span>
            </span>
            <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
              Sugar-Smart Day 🟢
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Calories</span>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {dailyTotals.calories}
              </span>
              <span className="text-[8px] text-slate-400 font-semibold block">Daily Goal</span>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/30 p-2 rounded-xl border border-blue-100 dark:border-blue-900/40">
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase block">Protein</span>
              <span className="text-xs sm:text-sm font-black text-blue-900 dark:text-blue-200">
                {dailyTotals.protein}g
              </span>
              <span className="text-[8px] text-blue-500 font-semibold block">Target 25%</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Carbs</span>
              <span className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">
                {dailyTotals.carbs}g
              </span>
              <span className="text-[8px] text-emerald-600 font-semibold block">Whole & Natural</span>
            </div>

            <div className="bg-purple-50/60 dark:bg-purple-950/30 p-2 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase block">Healthy Fats</span>
              <span className="text-xs sm:text-sm font-black text-purple-900 dark:text-purple-200">
                {dailyTotals.fats}g
              </span>
              <span className="text-[8px] text-purple-500 font-semibold block">Good Oils</span>
            </div>
          </div>
        </div>

        {/* 🌍 INTERACTIVE DUAL-SEGMENTED SOURCING TOGGLE */}
        <div className="bg-white dark:bg-zinc-800/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-700 shadow-xs">
          <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                soundEffects.playTactileTick();
                triggerHaptic("light");
                setDiasporaMode(false);
                toast.info("Switched to Local African Open Market ingredients 🇳🇬");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                !diasporaMode
                  ? "bg-white dark:bg-zinc-700 text-[#126778] dark:text-teal-300 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>🇳🇬 Local African Markets</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEffects.playTactileTick();
                triggerHaptic("light");
                setDiasporaMode(true);
                toast.info("Switched to Diaspora Supermarket Swaps (Tesco/Walmart/Costco) 🇬🇧/🇺🇸");
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                diasporaMode
                  ? "bg-white dark:bg-zinc-700 text-[#126778] dark:text-teal-300 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>🇬🇧/🇺🇸 Diaspora Swaps</span>
            </button>
          </div>
        </div>

        {/* 🍲 4 DAILY MEAL CARDS (Breakfast, Lunch, Dinner, Snack) */}
        <div className="space-y-3">
          {currentMeals.map((meal) => {
            const isLogged = loggedMealIds.includes(meal.id);
            const isSwapped = Boolean(swappedMeals[meal.id]);

            return (
              <div
                key={meal.id}
                onClick={() => {
                  soundEffects.playTactileTick();
                  triggerHaptic("light");
                  setSelectedMealDetail(meal);
                  setCheckedIngredients({});
                  setShowMealModal(true);
                }}
                className="bg-white dark:bg-zinc-800/90 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-zinc-700 hover:border-teal-400/50 transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Top Badge Strip */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl p-2 bg-teal-50 dark:bg-zinc-700 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
                      {meal.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-[#126778] dark:text-teal-300 tracking-wider">
                          {meal.type} • {meal.time}
                        </span>
                        {isSwapped && (
                          <span className="text-[8px] font-black bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-1.5 py-0.2 rounded-full">
                            Swapped 🥗
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                        {meal.name}
                      </h4>
                    </div>
                  </div>

                  <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    {meal.glycemicIndex === "Low" ? "Sugar-Smart 🟢" : "Balanced 🟡"}
                  </span>
                </div>

                {/* Macros Strip */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10.5px] bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-2xl border border-slate-100 dark:border-zinc-700/60">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Calories</span>
                    <strong className="font-black text-slate-900 dark:text-white">{meal.calories} kcal</strong>
                  </div>
                  <div>
                    <span className="text-blue-500 block text-[9px]">Protein</span>
                    <strong className="font-black text-blue-700 dark:text-blue-400">{meal.protein}g</strong>
                  </div>
                  <div>
                    <span className="text-emerald-500 block text-[9px]">Carbs</span>
                    <strong className="font-black text-emerald-700 dark:text-emerald-400">{meal.carbs}g</strong>
                  </div>
                  <div>
                    <span className="text-purple-500 block text-[9px]">Fats</span>
                    <strong className="font-black text-purple-700 dark:text-purple-400">{meal.fats}g</strong>
                  </div>
                </div>

                {/* Benefit & Ingredients Chips */}
                <div className="mt-2.5 space-y-1.5 text-xs">
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    💚 <span className="font-bold">Why It's Good:</span> {meal.clinicalBenefit}
                  </p>

                  {/* Top 3 Ingredients Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {(diasporaMode ? meal.diasporaSwaps : meal.ingredients).slice(0, 3).map((ing, i) => (
                      <span
                        key={i}
                        className="text-[9.5px] font-semibold bg-slate-100 dark:bg-zinc-700/60 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-lg truncate max-w-[130px]"
                      >
                        • {ing}
                      </span>
                    ))}
                    {(diasporaMode ? meal.diasporaSwaps : meal.ingredients).length > 3 && (
                      <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400">
                        +{(diasporaMode ? meal.diasporaSwaps : meal.ingredients).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Row: Swap Dish & Log Single Meal */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSwapMeal(meal, e)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    title="Swap for another healthy dish"
                  >
                    <RefreshCw size={12} className="text-teal-600 dark:text-teal-400" />
                    <span>Swap Dish</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleLogSingleMeal(meal, e)}
                      disabled={isLogged}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                        isLogged
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                          : "bg-[#126778] hover:bg-[#0e515e] text-white shadow-xs"
                      }`}
                    >
                      <CheckCircle2 size={13} className={isLogged ? "text-emerald-600" : "text-amber-300"} />
                      <span>{isLogged ? "Logged ✓" : `Log ${meal.type}`}</span>
                    </button>

                    <span className="text-xs text-slate-400 group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🍳 HEALTHY AFRICAN CHEF GEAR & PANTRY UTILITIES */}
        <div className="bg-white dark:bg-zinc-800/90 rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-zinc-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl p-1.5 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">🍳</span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Recommended Healthy Kitchen Tools
                </h4>
                <p className="text-[10.5px] text-slate-500 font-medium">Oil-free Akara, crispy plantain &amp; silky swallows</p>
              </div>
            </div>
            <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300">
              Chef Gear
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div
              onClick={() => openAffiliateProduct("ninja-air-fryer")}
              className="p-3 bg-slate-50 dark:bg-zinc-900/60 hover:bg-teal-50/50 border border-slate-200/70 dark:border-zinc-700 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="min-w-0">
                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">Ninja DualZone Air Fryer</span>
                <span className="text-[10px] text-slate-400">Crispy taste with 85% less oil</span>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            <div
              onClick={() => openAffiliateProduct("vitamix-blender")}
              className="p-3 bg-slate-50 dark:bg-zinc-900/60 hover:bg-teal-50/50 border border-slate-200/70 dark:border-zinc-700 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="min-w-0">
                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">Vitamix High-Power Blender</span>
                <span className="text-[10px] text-slate-400">Silky smooth swallows in seconds</span>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </div>
        </div>

        {/* 🌟 3 ACTION BUTTONS: EXPORT, LOG ENTIRE DAY, SHARE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExportWholeWeekToGrocery}
            className="w-full py-3.5 bg-gradient-to-r from-[#126778] via-[#0f5462] to-[#126778] text-white font-black text-xs rounded-2xl shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 border border-teal-300/30"
          >
            <ShoppingCart size={16} className="text-amber-300" />
            <span>Export All 7 Days to Grocery (Instacart/Chowdeck) 🛒</span>
          </button>

          <button
            type="button"
            onClick={handleLogActiveDayToDiary}
            className="w-full py-3.5 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-black text-xs rounded-2xl shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-zinc-700"
          >
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>Log All 4 Meals for {activeDay.dayName} 🍲</span>
          </button>
        </div>

        {/* 📋 Share / WhatsApp Button */}
        <button
          type="button"
          onClick={handleShareDayPlan}
          className="w-full py-3 rounded-2xl bg-teal-50 dark:bg-zinc-800/80 hover:bg-teal-100/60 dark:hover:bg-zinc-700 border border-teal-200 dark:border-zinc-700 text-xs font-black text-[#126778] dark:text-teal-300 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-xs"
        >
          <Share2 size={14} />
          <span>Share {activeDay.dayName}'s Menu with Family via WhatsApp / Copy 📋</span>
        </button>
      </div>

      {/* 🍲 ENHANCED MEAL DETAIL & INTERACTIVE COOKING MODAL */}
      <Dialog open={showMealModal} onOpenChange={setShowMealModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-5 sm:p-6 bg-slate-950 text-white border border-teal-500/30 max-h-[90vh] overflow-y-auto">
          {selectedMealDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 bg-teal-500/20 rounded-2xl border border-teal-400/30">
                  {selectedMealDetail.emoji}
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                    {selectedMealDetail.type} • {selectedMealDetail.calories} kcal • {selectedMealDetail.time}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {selectedMealDetail.name}
                  </h3>
                </div>
              </div>

              {/* Macro Pills in Modal */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-white/5 p-2.5 rounded-2xl border border-white/10">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold">Calories</span>
                  <span className="font-black text-white">{selectedMealDetail.calories}</span>
                </div>
                <div>
                  <span className="text-[9px] text-blue-400 block font-bold">Protein</span>
                  <span className="font-black text-blue-300">{selectedMealDetail.protein}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-400 block font-bold">Carbs</span>
                  <span className="font-black text-emerald-300">{selectedMealDetail.carbs}g</span>
                </div>
                <div>
                  <span className="text-[9px] text-purple-400 block font-bold">Fats</span>
                  <span className="font-black text-purple-300">{selectedMealDetail.fats}g</span>
                </div>
              </div>

              {/* Interactive Ingredients Checklist */}
              <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Ingredients ({diasporaMode ? "Diaspora Swaps" : "Local Open Market"}):
                  </span>
                  <span className="text-[9px] text-slate-300 font-semibold">Tap to check off pantry</span>
                </div>
                <div className="space-y-1.5">
                  {(diasporaMode ? selectedMealDetail.diasporaSwaps : selectedMealDetail.ingredients).map((ing, idx) => {
                    const isChecked = Boolean(checkedIngredients[ing]);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          triggerHaptic("light");
                          soundEffects.playTactileTick();
                          setCheckedIngredients((prev) => ({ ...prev, [ing]: !prev[ing] }));
                        }}
                        className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? "bg-emerald-500/20 text-emerald-200 line-through" : "bg-white/5 text-slate-200 hover:bg-white/10"
                        }`}
                      >
                        <span>• {ing}</span>
                        <span className="text-xs">{isChecked ? "✅" : "⬜"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Health Mechanism */}
              <div className="p-3 bg-teal-950/50 rounded-2xl border border-teal-500/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 block">
                  💚 Why Your Body Loves This:
                </span>
                <p className="text-xs text-teal-100 font-medium mt-0.5">
                  {selectedMealDetail.clinicalBenefit}
                </p>
              </div>

              {/* Chef Cooking Hack */}
              <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                  👩🏾‍🍳 Sarah's Easy Kitchen Tip:
                </span>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  {selectedMealDetail.cookingHack}
                </p>
              </div>

              {/* Modal Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  onClick={(e) => {
                    handleLogSingleMeal(selectedMealDetail, e);
                    setShowMealModal(false);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl cursor-pointer"
                >
                  Log This Meal 🥣
                </Button>
                <Button
                  onClick={() => setShowMealModal(false)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-2xl cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
