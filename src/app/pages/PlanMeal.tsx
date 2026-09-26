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
    theme: "Glycemic Reset & Morning Sustained Energy ⚡",
    targetCalories: 1580,
    sarahAudioCoaching: "Welcome to Monday! Today we focus on steady blood sugar. For breakfast, we have boiled plantain and eggs with spinach. For lunch, our grilled tilapia and viscous ewedu soup creates a natural fiber mesh in your intestines, preventing afternoon sluggishness. Stay hydrated with 2 liters of water!",
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
        ingredients: ["2 small fingers green plantain", "2 whole organic eggs", "1 cup chopped spinach/ugu", "1 fresh tomato & pepper sauce"],
        diasporaSwaps: ["Collard greens instead of ugu", "Avocado oil instead of groundnut oil"],
        clinicalBenefit: "High in resistant starch type 2, feeding gut microbiome with zero insulin spikes.",
        cookingHack: "Boil plantains with the skin on first, then peel—this preserves resistant starch and B-vitamins!"
      },
      {
        id: "d1-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Grilled Titus Fish with Viscous Ewedu & Oat Swallow",
        emoji: "🍲",
        calories: 520,
        protein: 38,
        carbs: 48,
        fats: 16,
        glycemicIndex: "Low",
        ingredients: ["1 cup oat swallow", "150g grilled Atlantic mackerel (Titus)", "1 cup viscous Ewedu soup with locust beans (Iru)", "Light pepper stew"],
        diasporaSwaps: ["Rolled oats milled fine", "Frozen jute leaves (Moluhiya)"],
        clinicalBenefit: "Viscous mucilage in Ewedu creates a gel barrier, slowing glucose absorption by 40%.",
        cookingHack: "Add a pinch of Iru (fermented locust beans) for natural umami and blood vessel elasticity."
      },
      {
        id: "d1-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Spiced Catfish Pepper Soup with Scent Leaves",
        emoji: "🥣",
        calories: 360,
        protein: 35,
        carbs: 14,
        fats: 10,
        glycemicIndex: "Low",
        ingredients: ["200g fresh catfish/tilapia", "Fresh scent leaf / basil", "Uda seed & calabash nutmeg broth", "Fresh ginger & garlic"],
        diasporaSwaps: ["Thai holy basil or Italian basil", "Smoked trout"],
        clinicalBenefit: "Aromatic eugenol in scent leaves relaxes arterial walls and eases evening digestion.",
        cookingHack: "Simmer on low flame for 12 minutes to keep fish tender without losing omega-3 oils."
      },
      {
        id: "d1-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Roasted Tiger Nuts & Fresh Coconut Flakes",
        emoji: "🥥",
        calories: 180,
        protein: 4,
        carbs: 18,
        fats: 9,
        glycemicIndex: "Low",
        ingredients: ["1/4 cup roasted tiger nuts (Ofio)", "2 thin slices fresh coconut meat"],
        diasporaSwaps: ["Raw almonds or walnuts"],
        clinicalBenefit: "Prebiotic fiber prevents 4pm sugar cravings.",
        cookingHack: "Chew tiger nuts thoroughly to activate digestive salivary amylase."
      }
    ]
  },
  {
    dayIndex: 2,
    dayName: "Tuesday",
    theme: "Arterial Health & Polyphenol Infusion ❤️",
    targetCalories: 1620,
    sarahAudioCoaching: "Happy Tuesday! Today is our heart health day. We infuse red hibiscus zobo bioflavonoids to naturally support healthy blood pressure. Lunch is our antioxidant-rich Efo Riro with lean beef, packed with iron and magnesium.",
    meals: [
      {
        id: "d2-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Steamed Moi Moi with Boiled Egg & Unsweetened Ginger Zobo",
        emoji: "🫘",
        calories: 410,
        protein: 26,
        carbs: 45,
        fats: 11,
        glycemicIndex: "Low",
        ingredients: ["1 wrap steamed bean pudding (Moi Moi)", "1 boiled egg", "1/2 cup flaked mackerel", "Chilled ginger-infused Hibiscus tea (Zobo)"],
        diasporaSwaps: ["Black-eyed peas or brown beans", "Silicone muffin molds for steaming"],
        clinicalBenefit: "Slow-digesting legume fiber gives 4 hours of steady focus without hunger.",
        cookingHack: "Blend crayfish into the bean batter for savory depth without bouillon cubes."
      },
      {
        id: "d2-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Efo Riro (Rich Spinach & Ugu Stir-In) with Grilled Chicken",
        emoji: "🥬",
        calories: 490,
        protein: 42,
        carbs: 32,
        fats: 18,
        glycemicIndex: "Low",
        ingredients: ["200g skinless chicken thigh/breast", "2 cups chopped ugu/spinach", "1 tbsp unbleached palm oil", "Locust beans & ground crayfish", "1/2 cup brown rice or fonio"],
        diasporaSwaps: ["Organic kale or collards", "Ancient Fonio grain"],
        clinicalBenefit: "Rich in nitrates and tocotrienols that support nitric oxide production and blood flow.",
        cookingHack: "Turn off heat before folding in vegetables so vitamins remain live and crunchy!"
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
        ingredients: ["4 steamed garden eggs mashed", "1 small roasted orange sweet potato", "6 jumbo tiger prawns", "Fresh pepper & tomato salsa"],
        diasporaSwaps: ["Italian eggplant or zucchini", "Wild-caught shrimp"],
        clinicalBenefit: "Garden egg nasunin protects brain cell membranes from lipid peroxidation.",
        cookingHack: "Roast sweet potatoes with the skin intact for double the potassium!"
      },
      {
        id: "d2-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Chilled Cucumber Slices with Ground Peanut Butter Dip",
        emoji: "🥒",
        calories: 150,
        protein: 6,
        carbs: 8,
        fats: 11,
        glycemicIndex: "Low",
        ingredients: ["1 whole cucumber sliced", "1 tbsp 100% pure roasted peanut butter"],
        diasporaSwaps: ["Almond butter"],
        clinicalBenefit: "Electrolyte hydration with monounsaturated fats for satiety.",
        cookingHack: "Sprinkle with a touch of cayenne pepper to ignite thermogenesis."
      }
    ]
  },
  {
    dayIndex: 3,
    dayName: "Wednesday",
    theme: "Cellular Detox & Ancient Supergrain Power 🌾",
    targetCalories: 1590,
    sarahAudioCoaching: "It's Wednesday! We power your cells with ancient West African Fonio, the world's fastest-cooking supergrain. It has a low glycemic index of 45 and is naturally gluten-free. For dinner, our medicinal bitter leaf soup cleanses liver pathways.",
    meals: [
      {
        id: "d3-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Fonio Porridge with Spiced Almond Milk, Chia & Papaya",
        emoji: "🥣",
        calories: 360,
        protein: 16,
        carbs: 52,
        fats: 8,
        glycemicIndex: "Low",
        ingredients: ["1/2 cup cooked Fonio grain", "1 cup warm unsweetened almond milk", "1 tbsp chia seeds", "1/2 cup fresh diced pawpaw (papaya)"],
        diasporaSwaps: ["Quinoa flakes or steel-cut oats", "Blueberries"],
        clinicalBenefit: "Methionine and cystine in Fonio promote liver glutathione synthesis.",
        cookingHack: "Fonio cooks in only 3 minutes! Steam with boiling water and fluff with a fork."
      },
      {
        id: "d3-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Party-Style Cauli-Jollof with Double Grilled Chicken Suya",
        emoji: "🍗",
        calories: 510,
        protein: 44,
        carbs: 28,
        fats: 18,
        glycemicIndex: "Low",
        ingredients: ["2 cups riced cauliflower & 1/2 cup brown rice", "Rich roasted tomato-tatashe paste", "200g grilled suya-spiced chicken", "Steamed green beans"],
        diasporaSwaps: ["Trader Joe's or Tesco riced cauliflower", "Smoked paprika & ginger rub"],
        clinicalBenefit: "All the deep flavor of party Jollof with 65% fewer carbs and zero sugar spikes.",
        cookingHack: "Brown the tomato paste in olive oil until sweet before adding the cauliflower rice."
      },
      {
        id: "d3-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Medicinal Ofe Onugbu (Bitter Leaf Soup) with Lean Beef",
        emoji: "🍲",
        calories: 390,
        protein: 34,
        carbs: 22,
        fats: 14,
        glycemicIndex: "Low",
        ingredients: ["Thoroughly washed bitter leaf", "150g lean beef & stockfish", "1 tbsp cocoyam paste for light thickening", "Crayfish & Ogbono blend"],
        diasporaSwaps: ["Frozen pre-washed bitter leaf", "Achi or ground flaxseed thickener"],
        clinicalBenefit: "Vernodalin glycosides in bitter leaf stimulate bile secretion and liver detoxification.",
        cookingHack: "Boil washed bitter leaves with a slice of lemon to achieve the sweet-savory herbal balance."
      },
      {
        id: "d3-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Fresh Guava or Green Apple with Handful of Cashews",
        emoji: "🍏",
        calories: 160,
        protein: 4,
        carbs: 18,
        fats: 9,
        glycemicIndex: "Low",
        ingredients: ["1 crisp green apple or pink guava", "10 raw unsalted cashew nuts"],
        diasporaSwaps: ["Granny Smith apple"],
        clinicalBenefit: "Pectin fiber binds to intestinal bile acids, supporting cholesterol excretion.",
        cookingHack: "Eat fruit whole with the skin for optimal fiber."
      }
    ]
  },
  {
    dayIndex: 4,
    dayName: "Thursday",
    theme: "Kidney Filtration & Electrolyte Balance 💧",
    targetCalories: 1570,
    sarahAudioCoaching: "Thursday is here! Today we optimize kidney filtration and electrolyte balance. We pair high-potassium okra soup with antioxidant-rich grilled salmon. Let's keep our energy high and sodium balanced!",
    meals: [
      {
        id: "d4-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Scrambled Eggs with Sautéed Ugu, Tomatoes & 1 Slice Sourdough",
        emoji: "🍞",
        calories: 390,
        protein: 22,
        carbs: 28,
        fats: 16,
        glycemicIndex: "Low",
        ingredients: ["3 organic eggs scrambled", "1 cup fresh chopped ugu / spinach", "1 slice fermented rye/sourdough bread", "1/4 avocado"],
        diasporaSwaps: ["Whole wheat sourdough", "Baby spinach"],
        clinicalBenefit: "Fermented sourdough has slow starch breakdown, keeping morning insulin low.",
        cookingHack: "Whisk eggs with 1 tablespoon of water for extra fluffy texture without butter."
      },
      {
        id: "d4-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Ila Alasepo (Seafood Okra Gumbo) with Plantain-Oat Swallow",
        emoji: "🥣",
        calories: 480,
        protein: 40,
        carbs: 42,
        fats: 12,
        glycemicIndex: "Low",
        ingredients: ["2 cups freshly diced crunchy okra", "150g Atlantic salmon / tilapia", "Smoked prawns & crayfish", "1 small fist-sized Plantain-Oat swallow"],
        diasporaSwaps: ["Fresh or frozen cut okra", "Atlantic cod / wild salmon"],
        clinicalBenefit: "Okra mucilage soothes digestive lining and binds heavy metals for kidney health.",
        cookingHack: "Cook okra for only 6 minutes so it stays bright green and nutrient-dense."
      },
      {
        id: "d4-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Grilled Chicken Breast with Steamed Cabbage & Carrot Medley",
        emoji: "🥗",
        calories: 370,
        protein: 38,
        carbs: 18,
        fats: 10,
        glycemicIndex: "Low",
        ingredients: ["200g skinless chicken breast marinated in ginger-garlic", "2 cups shredded green cabbage & carrots", "1 tbsp cold-pressed olive oil dressing"],
        diasporaSwaps: ["Organic bagged coleslaw mix (raw)"],
        clinicalBenefit: "Sulforaphane in cruciferous cabbage boosts phase-2 cellular defense enzymes.",
        cookingHack: "Sauté cabbage on high heat for 3 minutes with black pepper for a smoky stir-fry taste."
      },
      {
        id: "d4-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Warm Ginger & Lemongrass Herbal Tea + 5 Walnuts",
        emoji: "🍵",
        calories: 140,
        protein: 3,
        carbs: 4,
        fats: 13,
        glycemicIndex: "Low",
        ingredients: ["Freshly steeped ginger & lemongrass", "5 raw walnut halves"],
        diasporaSwaps: ["Organic lemongrass tea bags"],
        clinicalBenefit: "Plant sterols in walnuts support healthy endothelial function.",
        cookingHack: "Steep crushed fresh ginger for 10 minutes for maximum anti-inflammatory gingerols."
      }
    ]
  },
  {
    dayIndex: 5,
    dayName: "Friday",
    theme: "Pre-Weekend Metabolic Shield & Energy Boost 🛡️",
    targetCalories: 1640,
    sarahAudioCoaching: "Happy Friday! Before the weekend festivities, we build your metabolic shield. For lunch, we have Nigerian Yam & Fish Porridge packed with iron. For dinner, our savory Asun salad satisfies your cravings naturally!",
    meals: [
      {
        id: "d5-m1",
        type: "breakfast",
        time: "7:30 AM - 9:00 AM",
        name: "Akara (Bean Cakes) Baked Air-Fryer Style with Warm Pap/Oat-Milk",
        emoji: "🧆",
        calories: 420,
        protein: 24,
        carbs: 48,
        fats: 10,
        glycemicIndex: "Low",
        ingredients: ["4 air-fried or light-sautéed bean cakes", "1 cup fortified warm oat milk with cinnamon", "Fresh diced strawberries"],
        diasporaSwaps: ["Air fryer silicone cups", "Soy or almond milk"],
        clinicalBenefit: "Air frying eliminates 85% of oxidized cooking oil while preserving crispy bean cake crunch.",
        cookingHack: "Brush tops of Akara with a few drops of coconut oil before air-frying at 180°C for 14 mins."
      },
      {
        id: "d5-m2",
        type: "lunch",
        time: "1:00 PM - 2:30 PM",
        name: "Rich Afang Soup with Smoked Mackerel & Lean Beef",
        emoji: "🍲",
        calories: 530,
        protein: 42,
        carbs: 36,
        fats: 20,
        glycemicIndex: "Low",
        ingredients: ["Shredded wild Afang (Ukazi) leaves", "Waterleaf / spinach", "150g smoked mackerel & lean beef", "1 small wrap Fonio/Plantain swallow"],
        diasporaSwaps: ["Dried Okazi leaves soaked in warm water", "Baby spinach for waterleaf"],
        clinicalBenefit: "Afang leaves provide tough dietary insoluble fiber that optimizes transit time.",
        cookingHack: "Pound soaked Ukazi finely with a dash of crayfish to release its dark green chlorophyll."
      },
      {
        id: "d5-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Grilled Suya-Spiced Goat Meat (Asun) Salad Bowl",
        emoji: "🥗",
        calories: 380,
        protein: 36,
        carbs: 16,
        fats: 14,
        glycemicIndex: "Low",
        ingredients: ["150g tender lean goat meat grilled with yaji spice", "2 cups crisp romaine lettuce & sliced cucumbers", "1/2 cup roasted sweet corn & onions"],
        diasporaSwaps: ["Lamb cubes or beef sirloin", "Authentic Northern suya spice"],
        clinicalBenefit: "Lean goat meat is lower in saturated fat than chicken and beef, rich in bioavailable heme-iron.",
        cookingHack: "Trim visible white fat from goat meat before grilling with onions and sweet peppers."
      },
      {
        id: "d5-m4",
        type: "snack",
        time: "4:00 PM",
        name: "Sparkling Lemon-Mint Water with Handful of Roasted Almonds",
        emoji: "🍋",
        calories: 160,
        protein: 6,
        carbs: 6,
        fats: 14,
        glycemicIndex: "Low",
        ingredients: ["Sparkling water with fresh lemon & mint leaves", "12 raw almonds"],
        diasporaSwaps: ["Perrier or San Pellegrino with fresh lemon"],
        clinicalBenefit: "Alkalizing citrus minerals reduce uric acid crystallization.",
        cookingHack: "Muddle mint leaves at the bottom of the glass to unlock essential menthol aromatics."
      }
    ]
  },
  {
    dayIndex: 6,
    dayName: "Saturday",
    theme: "Weekend Celebration & Cultural Feasting 🥳",
    targetCalories: 1680,
    sarahAudioCoaching: "It's Saturday! Time for social gatherings and family time. Remember our Owambe Protocol: start with 3 spoonfuls of vegetable soup before enjoying your party Jollof. Have fun, celebrate, and stay nourished!",
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
        ingredients: ["2 slices artisan sourdough bread", "1/2 ripe avocado mashed with lime & chili", "2 soft-poached organic eggs", "Cherry tomatoes"],
        diasporaSwaps: ["Ezekiel sprouted grain bread"],
        clinicalBenefit: "Oleic acid from avocado improves cell membrane insulin receptor sensitivity.",
        cookingHack: "Add a splash of vinegar to simmering water to keep poached eggs perfectly shaped!"
      },
      {
        id: "d6-m2",
        type: "lunch",
        time: "1:30 PM - 3:00 PM",
        name: "The Owambe Plate: Balanced Party Jollof & Grilled Chicken Breast",
        emoji: "🎉",
        calories: 560,
        protein: 45,
        carbs: 52,
        fats: 16,
        glycemicIndex: "Medium",
        ingredients: ["1 cup party smoky Jollof rice", "Double portion grilled chicken breast", "1 cup Efo Riro vegetable buffer", "1 small piece baked plantain (Dodo)"],
        diasporaSwaps: ["Parboiled long-grain rice with roasted peppers"],
        clinicalBenefit: "Eating the vegetable and chicken FIRST reduces the glucose surge from the Jollof rice by 38%.",
        cookingHack: "Follow our golden rule: Half the plate protein & greens, one quarter Jollof!"
      },
      {
        id: "d6-m3",
        type: "dinner",
        time: "7:00 PM - 8:30 PM",
        name: "Light Snapper Fish Pepper Soup with Steamed Garden Greens",
        emoji: "🐟",
        calories: 340,
        protein: 36,
        carbs: 12,
        fats: 8,
        glycemicIndex: "Low",
        ingredients: ["200g red snapper fillet", "Calabash nutmeg, ginger & alligator pepper broth", "Steamed sweet cabbage & scent leaf"],
        diasporaSwaps: ["Cod or Halibut fillet"],
        clinicalBenefit: "Light evening broth facilitates nocturnal glycogen replenishment without digestive burden.",
        cookingHack: "A dash of crushed alligator pepper boosts digestion and speeds metabolism."
      },
      {
        id: "d6-m4",
        type: "snack",
        time: "4:30 PM",
        name: "Chilled Sliced Watermelon with Pumpkin Seeds (Pepitas)",
        emoji: "🍉",
        calories: 150,
        protein: 5,
        carbs: 18,
        fats: 7,
        glycemicIndex: "Medium",
        ingredients: ["1 cup cold watermelon cubes", "1 tbsp raw pumpkin seeds"],
        diasporaSwaps: ["Organic pepitas"],
        clinicalBenefit: "L-citrulline in watermelon supports vascular dilation and recovery.",
        cookingHack: "Always pair high-water fruits with seeds or nuts to blunt the fructose absorption rate."
      }
    ]
  },
  {
    dayIndex: 7,
    dayName: "Sunday",
    theme: "Family Harmony & Weekly Metabolic Rebalance 🍲",
    targetCalories: 1600,
    sarahAudioCoaching: "Blessed Sunday! Today we rebalance for the week ahead. We enjoy our beloved family soups with controlled swallow portions. Take time to relax, rest, and celebrate your wins for the week!",
    meals: [
      {
        id: "d7-m1",
        type: "breakfast",
        time: "8:30 AM - 10:00 AM",
        name: "Boiled Yam & Sautéed Garden Egg Sauce with Mackerel",
        emoji: "🍠",
        calories: 420,
        protein: 26,
        carbs: 48,
        fats: 12,
        glycemicIndex: "Low",
        ingredients: ["2 thick slices white yam boiled soft", "Rich steamed garden egg sauce", "100g smoked mackerel flakes", "1 tsp unbleached palm oil"],
        diasporaSwaps: ["White sweet potato or cassava", "Italian eggplant"],
        clinicalBenefit: "Complex starch combined with garden egg fiber delivers steady morning satiety.",
        cookingHack: "Boil yam with a pinch of salt and leave in warm water until ready to serve for maximum softness."
      },
      {
        id: "d7-m2",
        type: "lunch",
        time: "1:30 PM - 3:00 PM",
        name: "Medicinal Ofe Nsala (White Soup) with Titus Fish & Oat Swallow",
        emoji: "🥣",
        calories: 520,
        protein: 42,
        carbs: 46,
        fats: 14,
        glycemicIndex: "Low",
        ingredients: ["1 cup oat swallow", "200g fresh catfish or Titus", "Utazi leaf broth with yam paste thickener", "Ground crayfish and Uda"],
        diasporaSwaps: ["Ground rolled oats", "Fresh whole trout"],
        clinicalBenefit: "Utazi leaves (Gongronema latifolium) are scientifically proven to enhance insulin secretion.",
        cookingHack: "Add shredded Utazi leaf during the last 2 minutes of cooking so its medicinal aroma stays fresh."
      },
      {
        id: "d7-m3",
        type: "dinner",
        time: "6:30 PM - 8:00 PM",
        name: "Steamed Vegetable Egusi (No-Fry Method) with Grilled Turkey",
        emoji: "🥬",
        calories: 380,
        protein: 36,
        carbs: 18,
        fats: 16,
        glycemicIndex: "Low",
        ingredients: ["1/4 cup ground melon seeds (Egusi)", "150g grilled skinless turkey breast", "2 cups chopped fresh Ugu & spinach", "Locust beans & crayfish"],
        diasporaSwaps: ["Ground pumpkin seeds", "Skinless chicken thighs"],
        clinicalBenefit: "Zinc and magnesium in melon seeds support nocturnal sleep quality and cellular repair.",
        cookingHack: "Drop egusi in boiling broth without frying in oil—it creates juicy, tender curd balls!"
      },
      {
        id: "d7-m4",
        type: "snack",
        time: "4:30 PM",
        name: "Warm Golden Turmeric & Ginger Coconut Milk",
        emoji: "🥥",
        calories: 140,
        protein: 2,
        carbs: 6,
        fats: 12,
        glycemicIndex: "Low",
        ingredients: ["1 cup light coconut milk", "1/2 tsp organic turmeric & black pepper", "Grated fresh ginger"],
        diasporaSwaps: ["Unsweetened almond-coconut blend"],
        clinicalBenefit: "Curcumin reduces whole-body inflammation and prepares your body for deep restorative sleep.",
        cookingHack: "A pinch of black pepper increases curcumin bioavailability by 2,000%!"
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
      name: "Steamed Moi Moi with Boiled Egg & Unsweetened Zobo",
      emoji: "🫘",
      calories: 410,
      protein: 26,
      carbs: 45,
      fats: 11,
      glycemicIndex: "Low",
      ingredients: ["1 wrap steamed bean pudding (Moi Moi)", "1 boiled egg", "1/2 cup flaked mackerel", "Chilled ginger Zobo tea"],
      diasporaSwaps: ["Black-eyed peas pudding", "Smoked trout fillet"],
      clinicalBenefit: "Slow-digesting legume fiber gives 4 hours of steady focus without hunger or insulin spikes.",
      cookingHack: "Blend crayfish into the bean batter for savory depth without salt.",
    },
    {
      id: "alt-b2",
      type: "breakfast",
      time: "8:00 AM - 9:30 AM",
      name: "Steel-Cut Oat Porridge with Chia Seeds & Cinnamon",
      emoji: "🥣",
      calories: 360,
      protein: 18,
      carbs: 46,
      fats: 10,
      glycemicIndex: "Low",
      ingredients: ["1 cup steel-cut oats", "1 tbsp organic chia seeds", "1/2 tsp Ceylon cinnamon", "Unsweetened almond milk"],
      diasporaSwaps: ["Rolled whole oats", "Organic unsweetened soy milk"],
      clinicalBenefit: "Beta-glucan fiber coats intestinal walls, attenuating post-breakfast glucose rise.",
      cookingHack: "Simmer with a whole cinnamon stick for natural sweetness without sugar.",
    },
  ],
  lunch: [
    {
      id: "alt-l1",
      type: "lunch",
      time: "1:00 PM - 2:30 PM",
      name: "Grilled Tilapia with Viscous Okra Soup & Oat Swallow",
      emoji: "🍲",
      calories: 490,
      protein: 42,
      carbs: 45,
      fats: 14,
      glycemicIndex: "Low",
      ingredients: ["200g grilled tilapia fillet", "1.5 cups fresh diced okra soup", "1 cup oat swallow", "Locust beans & pepper"],
      diasporaSwaps: ["Frozen sliced okra", "Milled rolled oats"],
      clinicalBenefit: "High soluble okra mucilage delays gastric emptying and stabilizes postprandial glucose.",
      cookingHack: "Slit okra pods coarsely instead of pureeing to maximize slime viscosity!",
    },
    {
      id: "alt-l2",
      type: "lunch",
      time: "1:30 PM - 3:00 PM",
      name: "The Balanced Owambe Plate: Parboiled Rice, Grilled Chicken & Ugu",
      emoji: "🎉",
      calories: 540,
      protein: 46,
      carbs: 48,
      fats: 15,
      glycemicIndex: "Low",
      ingredients: ["1 cup parboiled smoky Jollof rice", "Double portion grilled chicken breast", "1.5 cups Ugu vegetable stew"],
      diasporaSwaps: ["Basmati sella rice", "Collard greens stew"],
      clinicalBenefit: "Eating the chicken and greens FIRST reduces glucose absorption rate by 38%.",
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
      ingredients: ["200g red snapper fillet", "Fresh scent leaf broth", "Calabash nutmeg and ginger"],
      diasporaSwaps: ["Fresh cod or sea bass", "Thai holy basil"],
      clinicalBenefit: "Warm aromatic eugenol relaxes vascular tone and promotes nocturnal cellular repair.",
      cookingHack: "Add fresh scent leaf at the very end of boiling to retain medicinal terpenes.",
    },
    {
      id: "alt-d2",
      type: "dinner",
      time: "7:00 PM - 8:30 PM",
      name: "Steamed Vegetable Egusi with Grilled Turkey Breast",
      emoji: "🥬",
      calories: 380,
      protein: 38,
      carbs: 16,
      fats: 14,
      glycemicIndex: "Low",
      ingredients: ["1/4 cup ground melon seeds (Egusi)", "150g grilled turkey breast", "2 cups chopped spinach & Ugu"],
      diasporaSwaps: ["Ground pumpkin seeds", "Skinless chicken breast"],
      clinicalBenefit: "Zinc and magnesium in melon seeds improve deep REM restorative sleep.",
      cookingHack: "Drop egusi paste directly into boiling broth without frying in oil.",
    },
  ],
  snack: [
    {
      id: "alt-s1",
      type: "snack",
      time: "4:00 PM",
      name: "Crisp Cucumber Slices with Roasted Peanut Butter Dip",
      emoji: "🥒",
      calories: 140,
      protein: 6,
      carbs: 7,
      fats: 10,
      glycemicIndex: "Low",
      ingredients: ["1 whole cucumber sliced", "1 tbsp 100% roasted peanut butter"],
      diasporaSwaps: ["Almond butter"],
      clinicalBenefit: "Electrolyte hydration with monounsaturated fats blunts afternoon sugar cravings.",
      cookingHack: "Sprinkle cayenne pepper on cucumber slices to boost thermogenesis.",
    },
    {
      id: "alt-s2",
      type: "snack",
      time: "4:30 PM",
      name: "Warm Golden Turmeric & Ginger Coconut Milk",
      emoji: "🥥",
      calories: 130,
      protein: 2,
      carbs: 5,
      fats: 11,
      glycemicIndex: "Low",
      ingredients: ["1 cup light coconut milk", "1/2 tsp organic turmeric & black pepper", "Grated ginger"],
      diasporaSwaps: ["Unsweetened almond milk"],
      clinicalBenefit: "Curcumin calms whole-body inflammation and prepares the liver for overnight fasting.",
      cookingHack: "Add a pinch of black pepper to boost curcumin absorption by 2,000%.",
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
        title="7-Day Therapeutic Meal Plan"
        subtitle="Personalized African menus for blood sugar &amp; metabolic vitality"
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
                    Sarah AI Voice Coach
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
              Low Glycemic Day 🟢
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Calories</span>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {dailyTotals.calories}
              </span>
              <span className="text-[8px] text-slate-400 font-semibold block">kcal budget</span>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/30 p-2 rounded-xl border border-blue-100 dark:border-blue-900/40">
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase block">Protein</span>
              <span className="text-xs sm:text-sm font-black text-blue-900 dark:text-blue-200">
                {dailyTotals.protein}g
              </span>
              <span className="text-[8px] text-blue-500 font-semibold block">25% plate</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Carbs</span>
              <span className="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-200">
                {dailyTotals.carbs}g
              </span>
              <span className="text-[8px] text-emerald-600 font-semibold block">Complex</span>
            </div>

            <div className="bg-purple-50/60 dark:bg-purple-950/30 p-2 rounded-xl border border-purple-100 dark:border-purple-900/40">
              <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase block">Healthy Fats</span>
              <span className="text-xs sm:text-sm font-black text-purple-900 dark:text-purple-200">
                {dailyTotals.fats}g
              </span>
              <span className="text-[8px] text-purple-500 font-semibold block">Omega-3</span>
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
                    {meal.glycemicIndex} Spike 🟢
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
                    💡 <span className="font-bold">Clinical Benefit:</span> {meal.clinicalBenefit}
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
                    title="Swap for a clinically approved alternative"
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
                <span className="text-[10px] text-slate-400">85% less oxidized frying oil</span>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>

            <div
              onClick={() => openAffiliateProduct("vitamix-blender")}
              className="p-3 bg-slate-50 dark:bg-zinc-900/60 hover:bg-teal-50/50 border border-slate-200/70 dark:border-zinc-700 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="min-w-0">
                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">Vitamix High-Power Blender</span>
                <span className="text-[10px] text-slate-400">Smooth swallows &amp; tough leaves</span>
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

              {/* Clinical Mechanism */}
              <div className="p-3 bg-teal-950/50 rounded-2xl border border-teal-500/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 block">
                  🧬 Clinical Metabolic Benefit:
                </span>
                <p className="text-xs text-teal-100 font-medium mt-0.5">
                  {selectedMealDetail.clinicalBenefit}
                </p>
              </div>

              {/* Chef Cooking Hack */}
              <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/30">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                  👩🏾‍🍳 Sarah's Cooking Hack:
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
