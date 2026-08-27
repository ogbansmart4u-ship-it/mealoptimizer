import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChefHat,
  Search,
  Filter,
  Heart,
  Clock,
  Flame,
  Users,
  ChevronRight,
  Star,
  Bookmark,
  MapPin,
  ShoppingCart,
  AlertCircle,
  Leaf,
  Globe,
  Plus,
  Minus,
  CheckCircle2,
  Check,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  X,
  Share2,
  BookOpen,
  Info,
} from "lucide-react";
import { getCollection, createCollectionItem, deleteCollectionItem, createMealLog } from "../../lib/api";
import BottomNav from "../components/BottomNav";
import MascotEmptyState from "../components/MascotEmptyState";
import { useAppMode } from "../contexts/AppModeContext";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LocationSelector from "../components/LocationSelector";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import AmbientBackground from "../components/AmbientBackground";
import Mascot from "../components/Mascot";
import AfricanSwapEngine from "../components/AfricanSwapEngine";
import FruitVegetableGuide from "../components/FruitVegetableGuide";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export type DietaryTag =
  | "all"
  | "diabetic-friendly"
  | "low-sodium"
  | "high-protein"
  | "heart-healthy"
  | "pcos-safe"
  | "weight-loss"
  | "favorites";

export interface ScaledIngredient {
  amount: number; // base per serving
  unit: string;
  name: string;
  diasporaSwap?: string;
  lowSodiumSwap?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  flameLevel?: "Low" | "Medium" | "High" | "Simmer";
  timerMinutes?: number;
  avoTip?: string;
}

export interface FullRecipe {
  id: string;
  name: string;
  emoji: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  tags: string[];
  prepTime: number;
  cookTime: number;
  baseServings: number;
  difficulty: "easy" | "medium" | "hard";
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFats: number;
  glycemicIndex: "Low" | "Medium" | "High";
  rating: number;
  reviews: number;
  healthBenefits: string;
  clinicalNote: string;
  ingredients: ScaledIngredient[];
  steps: RecipeStep[];
  localMarkets: string[];
  isFavorite?: boolean;
}

const MASTER_RECIPES: FullRecipe[] = [
  {
    "id": "1",
    "name": "Diabetic-Friendly Oat Swallow & Fresh Okra Soup",
    "emoji": "🥣",
    "category": "lunch",
    "tags": [
      "diabetic-friendly",
      "heart-healthy",
      "weight-loss"
    ],
    "prepTime": 15,
    "cookTime": 25,
    "baseServings": 2,
    "difficulty": "easy",
    "baseCalories": 390,
    "baseProtein": 26,
    "baseCarbs": 48,
    "baseFats": 10,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 142,
    "healthBenefits": "Soluble oat beta-glucan and okra mucilage buffer post-meal blood sugar surges.",
    "clinicalNote": "Low Glycemic Index (~42). Viscous mucilage slows gastric carbohydrate absorption by ~35%.",
    "localMarkets": [
      "Oyingbo Market",
      "Mile 12 Market",
      "Tesco / Walmart International Aisle"
    ],
    "ingredients": [
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Rolled oats ground into flour",
        "diasporaSwap": "Spelt or almond-psyllium flour"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Fresh green okra finely chopped",
        "diasporaSwap": "Frozen cut okra or Molokhia"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Grilled Mackerel / Titus fish",
        "diasporaSwap": "Salmon or cod fillets"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground crayfish",
        "diasporaSwap": "Dried shrimp powder"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Fermented locust beans (Iru)",
        "lowSodiumSwap": "Garlic, ginger & black pepper"
      },
      {
        "amount": 1,
        "unit": "cup",
        "name": "Pumpkin leaf (Ugu) or spinach",
        "diasporaSwap": "Baby spinach or chopped kale"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Unbleached virgin red palm oil",
        "lowSodiumSwap": "Extra virgin olive oil"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Bring 1.5 cups of water to a gentle boil in a pot. Whisk oat flour vigorously for 3 minutes until smooth, stretchy, and lump-free.",
        "flameLevel": "Medium",
        "timerMinutes": 3,
        "avoTip": "Keep stirring continuously in one direction to activate natural beta-glucan elasticity!"
      },
      {
        "stepNumber": 2,
        "instruction": "In a separate saucepan, heat 1 cup of water with crayfish, Iru, and chopped peppers. Add fresh chopped okra and stir gently for 4 minutes.",
        "flameLevel": "Medium",
        "timerMinutes": 4,
        "avoTip": "Do not cover the pot while cooking okra to maintain vibrant chlorophyll and slimy mucilage."
      },
      {
        "stepNumber": 3,
        "instruction": "Fold in shredded pumpkin leaves (Ugu) and grilled fish. Simmer for 2 minutes and take off heat immediately.",
        "flameLevel": "Simmer",
        "timerMinutes": 2,
        "avoTip": "Short cooking preserves heat-sensitive folates and Vitamin C in greens."
      }
    ]
  },
  {
    "id": "2",
    "name": "Low-Sodium Native Brown Jollof Rice",
    "emoji": "🍚",
    "category": "lunch",
    "tags": [
      "diabetic-friendly",
      "low-sodium",
      "heart-healthy"
    ],
    "prepTime": 20,
    "cookTime": 45,
    "baseServings": 4,
    "difficulty": "medium",
    "baseCalories": 410,
    "baseProtein": 28,
    "baseCarbs": 56,
    "baseFats": 9,
    "glycemicIndex": "Medium",
    "rating": 4.8,
    "reviews": 218,
    "healthBenefits": "Whole brown rice provides slow-release energy; umami base replaces industrial bouillon cubes.",
    "clinicalNote": "Sodium reduced by 65% compared to standard restaurant party Jollof.",
    "localMarkets": [
      "Tejuosho Market",
      "Balogun Market",
      "ShopRite / Whole Foods"
    ],
    "ingredients": [
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Unpolished Brown Rice or Ofada",
        "diasporaSwap": "Wild rice blend or Bulgur wheat"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Skinless chicken breast or turkey",
        "diasporaSwap": "Tofu or lean beef strips"
      },
      {
        "amount": 1,
        "unit": "cup",
        "name": "Blended plum tomatoes & red bell pepper",
        "diasporaSwap": "Canned crushed San Marzano tomatoes"
      },
      {
        "amount": 0.5,
        "unit": "bulb",
        "name": "Red onion chopped",
        "diasporaSwap": "Shallots"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Fermented Iru (locust beans)",
        "lowSodiumSwap": "Ground bay leaf, thyme & garlic"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground dried crayfish",
        "diasporaSwap": "Smoked paprika & mushroom powder"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Cold-pressed olive oil",
        "lowSodiumSwap": "Zero-salt vegetable broth reduction"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Rinse brown rice thoroughly under cold water. Parboil for 15 minutes, drain, and set aside.",
        "flameLevel": "High",
        "timerMinutes": 15,
        "avoTip": "Parboiling brown rice strips excess starch surface dust, keeping grains separate and fluffy."
      },
      {
        "stepNumber": 2,
        "instruction": "In a heavy pot, saute onions, garlic, ginger, and Iru in olive oil for 3 minutes until aromatic. Pour in blended tomato-pepper reduction.",
        "flameLevel": "Medium",
        "timerMinutes": 5,
        "avoTip": "Iru and crayfish provide natural glutamates (umami), eliminating the need for sodium-heavy seasoning cubes!"
      },
      {
        "stepNumber": 3,
        "instruction": "Add chicken broth, bay leaves, thyme, and drained brown rice. Cover tightly with foil and pot lid. Simmer on low heat for 25 minutes until liquid is absorbed.",
        "flameLevel": "Low",
        "timerMinutes": 25,
        "avoTip": "Tightly sealing with foil traps steam, ensuring brown rice cooks completely tender."
      }
    ]
  },
  {
    "id": "3",
    "name": "Protein-Packed Egusi & Ugu Soup (Unbleached)",
    "emoji": "🍲",
    "category": "dinner",
    "tags": [
      "high-protein",
      "pcos-safe",
      "heart-healthy"
    ],
    "prepTime": 20,
    "cookTime": 35,
    "baseServings": 4,
    "difficulty": "medium",
    "baseCalories": 440,
    "baseProtein": 34,
    "baseCarbs": 16,
    "baseFats": 24,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 189,
    "healthBenefits": "High in arginine, healthy linoleic fats, and magnesium from natural melon seeds.",
    "clinicalNote": "Zero glycemic spike (Carbs < 18g). Ideal for PCOS and ketogenic-leaning metabolic diets.",
    "localMarkets": [
      "Mile 12 Market",
      "Oshodi Market",
      "African Grocery Store"
    ],
    "ingredients": [
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Ground melon seeds (Egusi)",
        "diasporaSwap": "Pumpkin seeds (Pepitas) ground"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Lean beef chunks or goat meat",
        "diasporaSwap": "Skinless chicken thighs"
      },
      {
        "amount": 100,
        "unit": "g",
        "name": "Steamed stockfish / smoked fish flakes",
        "diasporaSwap": "Smoked trout or haddock"
      },
      {
        "amount": 1.5,
        "unit": "cups",
        "name": "Fresh fluted pumpkin leaves (Ugu)",
        "diasporaSwap": "Collard greens or spinach"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Virgin unrefined red palm oil",
        "lowSodiumSwap": "Avocado oil + paprika"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Locust beans (Iru)",
        "lowSodiumSwap": "Onion powder & ground coriander"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Mix ground egusi with 3 tablespoons of warm water and a pinch of grated onion to form small moist clumps.",
        "flameLevel": "Low",
        "timerMinutes": 2,
        "avoTip": "Forming egusi into tight paste balls creates that hearty curd texture without excess oil."
      },
      {
        "stepNumber": 2,
        "instruction": "Heat unbleached palm oil lightly on low heat. Drop egusi clumps into the pot with meat broth and Iru. Simmer covered for 15 minutes.",
        "flameLevel": "Medium",
        "timerMinutes": 15,
        "avoTip": "Never bleach palm oil until smoke rises—unbleached oil preserves 100% of its Vitamin E tocotrienols."
      },
      {
        "stepNumber": 3,
        "instruction": "Stir in shredded Ugu leaves, smoked fish, and ground crayfish. Cook for 3 final minutes and remove from heat.",
        "flameLevel": "Simmer",
        "timerMinutes": 3,
        "avoTip": "Pair with 1 small wrap of oat swallow or cauliflower swallow for an ultra-low glycemic dinner."
      }
    ]
  },
  {
    "id": "4",
    "name": "Afang & Waterleaf Superfood Pot with Smoked Fish",
    "emoji": "🥗",
    "category": "dinner",
    "tags": [
      "diabetic-friendly",
      "high-protein",
      "heart-healthy",
      "weight-loss"
    ],
    "prepTime": 25,
    "cookTime": 30,
    "baseServings": 4,
    "difficulty": "medium",
    "baseCalories": 360,
    "baseProtein": 38,
    "baseCarbs": 11,
    "baseFats": 16,
    "glycemicIndex": "Low",
    "rating": 5,
    "reviews": 245,
    "healthBenefits": "Wild Okazi (Gnetum africanum) leaves are rich in bioactive sterols, reducing intestinal cholesterol uptake.",
    "clinicalNote": "Extremely low glycemic load (GL 3). High natural prebiotic fiber enhances insulin sensitivity.",
    "localMarkets": [
      "Watt Market Calabar",
      "Uyo Main Market",
      "African Diaspora Grocers"
    ],
    "ingredients": [
      {
        "amount": 2,
        "unit": "cups",
        "name": "Finely ground Afang / Okazi leaves",
        "diasporaSwap": "Wild spinach / Ukazi leaves from Afro-shop"
      },
      {
        "amount": 3,
        "unit": "cups",
        "name": "Fresh waterleaf or baby spinach",
        "diasporaSwap": "Lamb's lettuce, purslane or baby spinach"
      },
      {
        "amount": 200,
        "unit": "g",
        "name": "Smoked catfish and periwinkles",
        "diasporaSwap": "Smoked trout and sea clams"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Lean beef tripe / shaki or skinless goat meat",
        "diasporaSwap": "Lean grass-fed beef"
      },
      {
        "amount": 2,
        "unit": "tbsp",
        "name": "Ground crayfish",
        "diasporaSwap": "Dried shrimp flakes"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Unbleached virgin palm oil",
        "lowSodiumSwap": "Cold-pressed avocado oil"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Cook meat and smoked fish with onions, crayfish, and fresh yellow pepper in 1 cup of water until tender.",
        "flameLevel": "Medium",
        "timerMinutes": 20,
        "avoTip": "Keep water minimal because waterleaf releases its own natural flavorful moisture!"
      },
      {
        "stepNumber": 2,
        "instruction": "Add washed, chopped waterleaf into the pot. Let simmer for 3 minutes until softened.",
        "flameLevel": "Medium",
        "timerMinutes": 3,
        "avoTip": "Waterleaf provides vital soluble pectin fibers that protect gastric lining."
      },
      {
        "stepNumber": 3,
        "instruction": "Stir in ground Afang leaves and remaining crayfish. Simmer for 2 minutes on low flame and turn off heat.",
        "flameLevel": "Simmer",
        "timerMinutes": 2,
        "avoTip": "Never overcook Afang; gentle heat preserves the crisp crunch and medicinal alkaloids."
      }
    ]
  },
  {
    "id": "5",
    "name": "Antioxidant Ghanaian Waakye with Shito & Boiled Egg",
    "emoji": "🍛",
    "category": "lunch",
    "tags": [
      "diabetic-friendly",
      "high-protein",
      "heart-healthy"
    ],
    "prepTime": 20,
    "cookTime": 40,
    "baseServings": 3,
    "difficulty": "medium",
    "baseCalories": 430,
    "baseProtein": 24,
    "baseCarbs": 62,
    "baseFats": 11,
    "glycemicIndex": "Medium",
    "rating": 4.9,
    "reviews": 230,
    "healthBenefits": "Red sorghum stalks (Waakye leaves) infuse dense 3-deoxyanthocyanidins that improve glucose uptake.",
    "clinicalNote": "Cowpea-to-rice protein complementarity creates a full amino acid profile while lowering glycemic index.",
    "localMarkets": [
      "Makola Market Accra",
      "Kejetia Market Kumasi",
      "Afro-Caribbean Supermarkets"
    ],
    "ingredients": [
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Brown rice or ofada rice",
        "diasporaSwap": "Basmati brown rice or quinoa"
      },
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Black-eyed peas or red cowpeas",
        "diasporaSwap": "Canned organic black-eyed peas"
      },
      {
        "amount": 3,
        "unit": "pcs",
        "name": "Dried sorghum leaf sheaths (Waakye leaves)",
        "diasporaSwap": "Baking soda pinch with hibiscus petal"
      },
      {
        "amount": 1,
        "unit": "pc",
        "name": "Hard boiled egg",
        "diasporaSwap": "Boiled organic egg or grilled tofu"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Black pepper Shito chili sauce",
        "lowSodiumSwap": "Homemade low-salt ginger-garlic Shito"
      },
      {
        "amount": 0.25,
        "unit": "pc",
        "name": "Sliced fresh avocado",
        "diasporaSwap": "Guacamole"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Soak black-eyed peas with sorghum leaf sheaths in 3 cups of water for 3 hours until water turns deep burgundy.",
        "flameLevel": "Low",
        "timerMinutes": 5,
        "avoTip": "Sorghum leaves are among nature's highest dietary sources of longevity polyphenols!"
      },
      {
        "stepNumber": 2,
        "instruction": "Boil beans in burgundy sorghum water until 70% tender (about 20 minutes). Discard sorghum stalks.",
        "flameLevel": "High",
        "timerMinutes": 20,
        "avoTip": "Cooking rice together with pulse broth reduces insulin surge by 30%."
      },
      {
        "stepNumber": 3,
        "instruction": "Add washed brown rice, sea salt pinch, and simmer covered on low flame for 20 minutes until fluffy. Serve with boiled egg and avocado.",
        "flameLevel": "Low",
        "timerMinutes": 20,
        "avoTip": "Pairing with avocado healthy fats further slows carbohydrate gastric emptying."
      }
    ]
  },
  {
    "id": "6",
    "name": "Baobab (Miyan Kuka) & Ancient Fonio Supergrain",
    "emoji": "🥣",
    "category": "dinner",
    "tags": [
      "diabetic-friendly",
      "weight-loss",
      "pcos-safe",
      "heart-healthy"
    ],
    "prepTime": 15,
    "cookTime": 25,
    "baseServings": 2,
    "difficulty": "easy",
    "baseCalories": 340,
    "baseProtein": 30,
    "baseCarbs": 42,
    "baseFats": 8,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 165,
    "healthBenefits": "Dried baobab leaf powder contains over 50% dietary fiber and 7x more vitamin C than oranges.",
    "clinicalNote": "Fonio has a low glycemic index (GI 45) and is naturally rich in sulfur-containing methionine & cystine.",
    "localMarkets": [
      "Kano Central Market",
      "Wuse Market Abuja",
      "Whole Foods Fonio Aisle / Afro-Caribbean Market"
    ],
    "ingredients": [
      {
        "amount": 2,
        "unit": "tbsp",
        "name": "Dried baobab leaf powder (Kuka)",
        "diasporaSwap": "Organic baobab fruit/leaf powder"
      },
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Ancient Fonio grain",
        "diasporaSwap": "Quinoa or pearl millet"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Lean beef strips or grilled guinea fowl",
        "diasporaSwap": "Skinless chicken breast or grass-fed beef"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground ginger and dried pepper",
        "lowSodiumSwap": "Black pepper & ground coriander"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Dawadawa (fermented locust bean paste)",
        "diasporaSwap": "Miso paste or mushroom powder"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Boil meat with ginger, garlic, and Dawadawa in 2 cups of water for 15 minutes to create a rich aromatic broth.",
        "flameLevel": "Medium",
        "timerMinutes": 15,
        "avoTip": "Dawadawa adds depth and peptides that support healthy blood vessel tone."
      },
      {
        "stepNumber": 2,
        "instruction": "Whisk Kuka powder into boiling broth with a small whisk to prevent lumps. Simmer for 5 minutes until velvety.",
        "flameLevel": "Low",
        "timerMinutes": 5,
        "avoTip": "Whisking Kuka quickly yields a smooth, rich green soup without needing palm oil!"
      },
      {
        "stepNumber": 3,
        "instruction": "Steam Fonio with 1 cup of boiling water for 3 minutes, fluff with a fork, and serve with warm Miyan Kuka.",
        "flameLevel": "Low",
        "timerMinutes": 3,
        "avoTip": "Fonio cooks in just 3 minutes—it is the fastest-cooking ancient supergrain on Earth!"
      }
    ]
  },
  {
    "id": "7",
    "name": "Medicinal Ofe Nsala (White Catfish Soup) with Utazi",
    "emoji": "🍲",
    "category": "dinner",
    "tags": [
      "heart-healthy",
      "diabetic-friendly",
      "pcos-safe",
      "low-sodium"
    ],
    "prepTime": 15,
    "cookTime": 25,
    "baseServings": 3,
    "difficulty": "medium",
    "baseCalories": 290,
    "baseProtein": 32,
    "baseCarbs": 18,
    "baseFats": 9,
    "glycemicIndex": "Low",
    "rating": 5,
    "reviews": 198,
    "healthBenefits": "Utazi leaves contain bitter triterpenoid saponins that enhance liver detoxification and post-meal glucose sensitivity.",
    "clinicalNote": "Palm-oil free white soup. Light yam thickener keeps total carbohydrate load below 20g per bowl.",
    "localMarkets": [
      "Onitsha Main Market",
      "Ogbete Market Enugu",
      "African Diaspora Fish Shop"
    ],
    "ingredients": [
      {
        "amount": 250,
        "unit": "g",
        "name": "Fresh catfish or tilapia fillets",
        "diasporaSwap": "Cod or wild salmon steaks"
      },
      {
        "amount": 50,
        "unit": "g",
        "name": "White yam boiled and pounded into paste (thickener)",
        "diasporaSwap": "Cocoyam or oat paste"
      },
      {
        "amount": 0.25,
        "unit": "cup",
        "name": "Fresh Utazi leaves thinly shredded",
        "diasporaSwap": "Dandelion greens or watercress"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground Ogiri (fermented castor seeds)",
        "lowSodiumSwap": "Garlic, ginger & coriander"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Traditional Nsala spices (Uda & Ehuru seeds)",
        "diasporaSwap": "Allspice and white pepper"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground crayfish",
        "diasporaSwap": "Dried shrimp"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Bring 3 cups of water to boil with Nsala spices, Ogiri, crayfish, and scotch bonnet pepper. Add fish steaks and simmer for 10 minutes.",
        "flameLevel": "Medium",
        "timerMinutes": 10,
        "avoTip": "Catfish contains anti-inflammatory Omega-3 fatty acids that support brain and heart function."
      },
      {
        "stepNumber": 2,
        "instruction": "Drop small portions of yam paste into soup. Stir gently as yam dissolves and thickens broth.",
        "flameLevel": "Medium",
        "timerMinutes": 6,
        "avoTip": "Using just a touch of yam paste gives creaminess without spiking carbohydrate count!"
      },
      {
        "stepNumber": 3,
        "instruction": "Stir in shredded Utazi leaves and turn off flame after 60 seconds.",
        "flameLevel": "Low",
        "timerMinutes": 1,
        "avoTip": "Utazi's pleasant bitterness stimulates digestive enzymes and bile flow."
      }
    ]
  },
  {
    "id": "8",
    "name": "Sukuma Wiki with Lean Beef & Kachumbari Salad",
    "emoji": "🥬",
    "category": "lunch",
    "tags": [
      "diabetic-friendly",
      "high-protein",
      "heart-healthy",
      "weight-loss"
    ],
    "prepTime": 15,
    "cookTime": 20,
    "baseServings": 2,
    "difficulty": "easy",
    "baseCalories": 310,
    "baseProtein": 34,
    "baseCarbs": 14,
    "baseFats": 12,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 184,
    "healthBenefits": "Collard greens and kale pack over 200% daily Vitamin K, lutein, and magnesium for glucose control.",
    "clinicalNote": "Glycemic load < 5. East African staple for stabilizing morning blood glucose levels.",
    "localMarkets": [
      "Kariakoo Market",
      "Gikomba Market",
      "Whole Foods / Sainsbury's Kale & Collards"
    ],
    "ingredients": [
      {
        "amount": 300,
        "unit": "g",
        "name": "Fresh Sukuma Wiki (Collard greens or Curly Kale)",
        "diasporaSwap": "Spring greens or Swiss chard"
      },
      {
        "amount": 200,
        "unit": "g",
        "name": "Extra-lean minced or diced beef",
        "diasporaSwap": "Skinless chicken breast or grass-fed turkey"
      },
      {
        "amount": 2,
        "unit": "pcs",
        "name": "Ripe Roma tomatoes diced",
        "diasporaSwap": "Cherry tomatoes diced"
      },
      {
        "amount": 1,
        "unit": "bulb",
        "name": "Red onion finely sliced",
        "diasporaSwap": "Shallots"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Royco Mchuzi mix alternative (cumin, turmeric, coriander)",
        "lowSodiumSwap": "Turmeric, cumin & garlic powder"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Extra virgin olive oil",
        "lowSodiumSwap": "Avocado oil"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "In a wide skillet, heat olive oil over medium-high flame. Brown lean beef with garlic and sliced red onions for 6 minutes.",
        "flameLevel": "Medium",
        "timerMinutes": 6,
        "avoTip": "Searing beef at medium-high locks in natural juices without needing excess cooking fats!"
      },
      {
        "stepNumber": 2,
        "instruction": "Add diced tomatoes, cumin, and turmeric. Stir for 3 minutes until tomatoes soften into a fragrant pan sauce.",
        "flameLevel": "Medium",
        "timerMinutes": 3,
        "avoTip": "The acidity in tomatoes helps release iron from the greens, making it bioavailable."
      },
      {
        "stepNumber": 3,
        "instruction": "Fold in shredded Sukuma Wiki greens. Toss briskly for 4 minutes until wilted yet vibrant green. Serve with fresh Kachumbari tomato salad.",
        "flameLevel": "High",
        "timerMinutes": 4,
        "avoTip": "Do not overcook greens; keeping a slight crunch preserves vitamin C and glucosinolates!"
      }
    ]
  },
  {
    "id": "9",
    "name": "Cameroonian Ndolé (Bitterleaf & Peanut Pot) with Prawns",
    "emoji": "🍤",
    "category": "dinner",
    "tags": [
      "high-protein",
      "pcos-safe",
      "heart-healthy",
      "diabetic-friendly"
    ],
    "prepTime": 25,
    "cookTime": 35,
    "baseServings": 4,
    "difficulty": "medium",
    "baseCalories": 370,
    "baseProtein": 36,
    "baseCarbs": 15,
    "baseFats": 19,
    "glycemicIndex": "Low",
    "rating": 5,
    "reviews": 215,
    "healthBenefits": "Washed bitterleaf provides hepatoprotective vernoniosides; roasted peanuts supply monounsaturated lipids.",
    "clinicalNote": "Ketogenic-compatible macro ratio. Very high satiety with zero post-prandial glucose spike.",
    "localMarkets": [
      "Marché Central Douala",
      "Mfoundi Market Yaoundé",
      "African Specialty Supermarket"
    ],
    "ingredients": [
      {
        "amount": 2,
        "unit": "cups",
        "name": "Thoroughly washed shredded bitterleaf",
        "diasporaSwap": "Washed frozen bitterleaf or cavolo nero"
      },
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Raw peeled groundnuts (peanuts) soaked & blended",
        "diasporaSwap": "Raw almond meal blended with water"
      },
      {
        "amount": 200,
        "unit": "g",
        "name": "Fresh or smoked tiger prawns",
        "diasporaSwap": "Jumbo shrimp or scallops"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Lean beef stew chunks",
        "diasporaSwap": "Skinless chicken breast chunks"
      },
      {
        "amount": 1,
        "unit": "bulb",
        "name": "White onion sliced & caramelized in olive oil",
        "diasporaSwap": "Shallots"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground crayfish & garlic",
        "lowSodiumSwap": "Ginger, garlic & cayenne"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Cook beef in 1.5 cups of water with garlic and onions for 20 minutes until tender. Pour in blended raw peanut paste.",
        "flameLevel": "Medium",
        "timerMinutes": 20,
        "avoTip": "Peanut paste creates a naturally creamy, rich broth without dairy or butter!"
      },
      {
        "stepNumber": 2,
        "instruction": "Simmer peanut sauce for 10 minutes until aromatic. Fold in washed bitterleaf and crayfish.",
        "flameLevel": "Medium",
        "timerMinutes": 10,
        "avoTip": "Washing bitterleaves well removes excess astringency while retaining blood-sugar balancing polyphenols."
      },
      {
        "stepNumber": 3,
        "instruction": "In a small skillet, sauté prawns with sliced onions in olive oil for 3 minutes until pink, then pour sizzling over the Ndolé pot.",
        "flameLevel": "High",
        "timerMinutes": 3,
        "avoTip": "Pouring sizzling prawns and onions on top unlocks deep aroma."
      }
    ]
  },
  {
    "id": "10",
    "name": "Ethiopian Doro Wat (Slow-Caramelized Berbere Chicken)",
    "emoji": "🍗",
    "category": "dinner",
    "tags": [
      "high-protein",
      "heart-healthy",
      "pcos-safe"
    ],
    "prepTime": 25,
    "cookTime": 40,
    "baseServings": 4,
    "difficulty": "medium",
    "baseCalories": 380,
    "baseProtein": 38,
    "baseCarbs": 12,
    "baseFats": 18,
    "glycemicIndex": "Low",
    "rating": 5,
    "reviews": 260,
    "healthBenefits": "Aromatic Berbere spice blend (chili, fenugreek, ginger, cloves) activates thermogenesis and lipid oxidation.",
    "clinicalNote": "Pair with fermented Teff Injera for prebiotics, high iron (15mg), and slow-release carbohydrate absorption.",
    "localMarkets": [
      "Merkato Addis Ababa",
      "Ethiopian Diaspora Grocery",
      "Spice Specialty Stores"
    ],
    "ingredients": [
      {
        "amount": 500,
        "unit": "g",
        "name": "Skinless chicken drumsticks & thighs",
        "diasporaSwap": "Organic boneless chicken thighs"
      },
      {
        "amount": 3,
        "unit": "large",
        "name": "Red onions finely puréed",
        "diasporaSwap": "Yellow onions puréed"
      },
      {
        "amount": 2,
        "unit": "tbsp",
        "name": "Authentic Berbere spice blend",
        "lowSodiumSwap": "Smoked paprika, cayenne, ginger, cumin & cardamom"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Niter Kibbeh (spiced clarified butter) or olive oil",
        "diasporaSwap": "Ghee or coconut oil"
      },
      {
        "amount": 2,
        "unit": "pcs",
        "name": "Hard-boiled eggs, scored",
        "diasporaSwap": "Organic pasture-raised eggs"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Dry sauté puréed red onions in Dutch oven on medium heat for 12 minutes until reduced and caramelized with zero added oil.",
        "flameLevel": "Medium",
        "timerMinutes": 12,
        "avoTip": "Caramelizing onions dry is the secret Ethiopian technique for rich natural sweetness without added sugar!"
      },
      {
        "stepNumber": 2,
        "instruction": "Add Niter Kibbeh/ghee and Berbere spice. Stir constantly for 5 minutes until deep burgundy and aromatic.",
        "flameLevel": "Low",
        "timerMinutes": 5,
        "avoTip": "Blooming Berbere in warm fat unlocks oil-soluble capsaicin and gingerols."
      },
      {
        "stepNumber": 3,
        "instruction": "Add chicken pieces and 1 cup of water. Cover and simmer gently for 25 minutes. Drop in scored boiled eggs in last 5 minutes.",
        "flameLevel": "Simmer",
        "timerMinutes": 25,
        "avoTip": "Scoring eggs allows the rich spicy broth to penetrate into the yolk!"
      }
    ]
  },
  {
    "id": "11",
    "name": "South African Chakalaka & Bean Relish with Sorghum",
    "emoji": "🫘",
    "category": "lunch",
    "tags": [
      "diabetic-friendly",
      "heart-healthy",
      "weight-loss"
    ],
    "prepTime": 15,
    "cookTime": 25,
    "baseServings": 4,
    "difficulty": "easy",
    "baseCalories": 280,
    "baseProtein": 16,
    "baseCarbs": 46,
    "baseFats": 6,
    "glycemicIndex": "Low",
    "rating": 4.8,
    "reviews": 156,
    "healthBenefits": "Baked beans, grated carrots, and bell peppers deliver high beta-carotene and pulse prebiotic fiber.",
    "clinicalNote": "Very high dietary fiber (11g per serving). Enhances short-chain fatty acid (butyrate) production.",
    "localMarkets": [
      "Johannesburg Market",
      "Pick n Pay",
      "UK South African Shop / Walmart"
    ],
    "ingredients": [
      {
        "amount": 1,
        "unit": "can",
        "name": "Baked beans in tomato sauce (low sodium)",
        "diasporaSwap": "Organic red kidney beans or cannellini beans"
      },
      {
        "amount": 2,
        "unit": "large",
        "name": "Carrots grated",
        "diasporaSwap": "Organic sweet carrots"
      },
      {
        "amount": 1,
        "unit": "large",
        "name": "Green and red bell peppers diced",
        "diasporaSwap": "Sweet mini peppers"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Mild curry powder & grated ginger",
        "lowSodiumSwap": "Turmeric, coriander, cumin & ginger"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Extra virgin olive oil",
        "lowSodiumSwap": "Avocado oil"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Sauté onions, garlic, ginger, and curry powder in olive oil for 3 minutes until fragrant.",
        "flameLevel": "Medium",
        "timerMinutes": 3,
        "avoTip": "Curry powder contains piperine and curcumin which boost anti-inflammatory defenses."
      },
      {
        "stepNumber": 2,
        "instruction": "Add grated carrots and bell peppers. Stir-fry for 8 minutes until tender-crisp.",
        "flameLevel": "Medium",
        "timerMinutes": 8,
        "avoTip": "Grated carrots release natural sweetness, balancing curry heat."
      },
      {
        "stepNumber": 3,
        "instruction": "Stir in beans, cover, and simmer for 5 minutes. Serve warm or chilled with grilled chicken or whole grain sorghum.",
        "flameLevel": "Simmer",
        "timerMinutes": 5,
        "avoTip": "Chakalaka tastes even better the next day as spices infuse into beans!"
      }
    ]
  },
  {
    "id": "12",
    "name": "Diaspora Quinoa Jollof Bowl with Pan-Seared Salmon",
    "emoji": "🍣",
    "category": "dinner",
    "tags": [
      "high-protein",
      "heart-healthy",
      "diabetic-friendly",
      "pcos-safe"
    ],
    "prepTime": 15,
    "cookTime": 25,
    "baseServings": 2,
    "difficulty": "easy",
    "baseCalories": 420,
    "baseProtein": 36,
    "baseCarbs": 38,
    "baseFats": 14,
    "glycemicIndex": "Low",
    "rating": 5,
    "reviews": 312,
    "healthBenefits": "Complete plant protein from quinoa paired with brain & heart Omega-3 EPA/DHA from wild salmon.",
    "clinicalNote": "Glycemic Index 45 (compared to GI 73 for white rice). Superior arterial and insulin response.",
    "localMarkets": [
      "Tesco / Sainsbury's",
      "Whole Foods / Trader Joe's",
      "Costco / Walmart"
    ],
    "ingredients": [
      {
        "amount": 0.75,
        "unit": "cup",
        "name": "Organic tri-color or white Quinoa",
        "diasporaSwap": "Fonio grain or Bulgur wheat"
      },
      {
        "amount": 200,
        "unit": "g",
        "name": "Wild Alaskan or Atlantic salmon fillet",
        "diasporaSwap": "Grilled cod or organic tofu steaks"
      },
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Jollof tomato-pepper purée reduction",
        "diasporaSwap": "Fire roasted crushed tomatoes with habanero"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Thyme, bay leaf & smoked paprika",
        "lowSodiumSwap": "Garlic powder, onion powder & dried rosemary"
      },
      {
        "amount": 1,
        "unit": "cup",
        "name": "Steamed asparagus or tenderstem broccoli",
        "diasporaSwap": "Green beans or baby courgettes"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Rinse quinoa in fine sieve to remove saponins. Sauté in pot with 1 tsp olive oil and thyme for 2 minutes to toast.",
        "flameLevel": "Medium",
        "timerMinutes": 2,
        "avoTip": "Toasting quinoa before boiling unlocks a nutty aroma that mimics party jollof smokiness!"
      },
      {
        "stepNumber": 2,
        "instruction": "Add jollof tomato-pepper reduction and 1.25 cups vegetable broth. Cover tightly and simmer on low for 15 minutes until liquid is absorbed.",
        "flameLevel": "Low",
        "timerMinutes": 15,
        "avoTip": "Quinoa absorbs rich tomato stew deeply and yields fluffy individual grain pearls."
      },
      {
        "stepNumber": 3,
        "instruction": "Sear salmon skin-side down in non-stick pan for 4 minutes, flip and cook for 3 minutes. Plate over steaming Jollof Quinoa with asparagus.",
        "flameLevel": "Medium-High",
        "timerMinutes": 7,
        "avoTip": "Salmon crispy skin retains beneficial astaxanthin and protective lipids."
      }
    ]
  },
  {
    "id": "13",
    "name": "Unsweetened Hibiscus (Zobo) Elixir with Ginger & Lime",
    "emoji": "🌺",
    "category": "snack",
    "tags": [
      "heart-healthy",
      "low-sodium",
      "diabetic-friendly",
      "weight-loss"
    ],
    "prepTime": 10,
    "cookTime": 20,
    "baseServings": 6,
    "difficulty": "easy",
    "baseCalories": 35,
    "baseProtein": 1,
    "baseCarbs": 8,
    "baseFats": 0,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 310,
    "healthBenefits": "High anthocyanin bioflavonoids support arterial elasticity and natural blood pressure reduction.",
    "clinicalNote": "Zero added sugar. Clinically documented ACE-inhibitory and diuretic properties.",
    "localMarkets": [
      "Any local market",
      "Health Food Store / Mexican Hibiscus Flor de Jamaica"
    ],
    "ingredients": [
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Dried dark red hibiscus petals (Zobo leaves)",
        "diasporaSwap": "Flor de Jamaica (Mexican hibiscus)"
      },
      {
        "amount": 2,
        "unit": "tbsp",
        "name": "Freshly grated ginger",
        "diasporaSwap": "Ginger root slices"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Whole cloves (Kanunfari)",
        "diasporaSwap": "Ground cloves or cinnamon stick"
      },
      {
        "amount": 1,
        "unit": "pc",
        "name": "Fresh lime or lemon juice",
        "diasporaSwap": "Apple cider vinegar splash"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Rinse dried hibiscus petals in cold water quickly. Place in pot with 4 cups water, ginger, and cloves.",
        "flameLevel": "High",
        "timerMinutes": 5,
        "avoTip": "Rinse fast so you don't wash away deep red medicinal anthocyanins!"
      },
      {
        "stepNumber": 2,
        "instruction": "Boil gently for 15 minutes. Strain deep ruby elixir through fine sieve. Squeeze in fresh lime juice and chill in refrigerator.",
        "flameLevel": "Medium",
        "timerMinutes": 15,
        "avoTip": "Drink 1 glass daily as a refreshing, cardio-protective beverage with zero glucose impact!"
      }
    ]
  },
  {
    "id": "14",
    "name": "Steamed Protein Moi-Moi with Boiled Egg",
    "emoji": "🍮",
    "category": "breakfast",
    "tags": [
      "high-protein",
      "diabetic-friendly",
      "weight-loss",
      "pcos-safe"
    ],
    "prepTime": 25,
    "cookTime": 40,
    "baseServings": 4,
    "difficulty": "medium",
    "baseCalories": 310,
    "baseProtein": 22,
    "baseCarbs": 32,
    "baseFats": 9,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 205,
    "healthBenefits": "Slow-digesting cowpeas deliver prebiotic fiber and steady amino acid release.",
    "clinicalNote": "Low glycemic load (~8). Resistant starch nourishes beneficial gut Bifidobacteria.",
    "localMarkets": [
      "Idumota Market",
      "Oyingbo Market",
      "African Caribbean Food Market"
    ],
    "ingredients": [
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Peeled brown cowpeas (Beans)",
        "diasporaSwap": "Black-eyed peas or chickpea flour"
      },
      {
        "amount": 1,
        "unit": "pc",
        "name": "Hard-boiled egg sliced",
        "diasporaSwap": "Flaked canned tuna or tofu"
      },
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Red bell peppers & onions blended",
        "diasporaSwap": "Piquillo roasted peppers"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground crayfish",
        "diasporaSwap": "Nutritional yeast for savory depth"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Sunflower or olive oil",
        "lowSodiumSwap": "Cold-pressed coconut oil"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Blend soaked peeled beans with red bell peppers, onions, ginger, and crayfish with 1 cup water until silky smooth.",
        "flameLevel": "Low",
        "timerMinutes": 3,
        "avoTip": "Whisk blended batter with spoon for 2 minutes to incorporate air for a fluffy texture!"
      },
      {
        "stepNumber": 2,
        "instruction": "Pour batter into silicone cups or banana leaves, placing boiled egg slice inside. Steam in covered pot with 2 inches boiling water for 35 minutes.",
        "flameLevel": "Medium",
        "timerMinutes": 35,
        "avoTip": "Steaming uses zero excess frying oil, keeping calories and trans fats low."
      }
    ]
  },
  {
    "id": "15",
    "name": "Efo Riro (Leafy Spinach & Ugu Stir-In) with Lean Beef",
    "emoji": "🥬",
    "category": "dinner",
    "tags": [
      "high-protein",
      "heart-healthy",
      "diabetic-friendly"
    ],
    "prepTime": 15,
    "cookTime": 30,
    "baseServings": 4,
    "difficulty": "easy",
    "baseCalories": 320,
    "baseProtein": 32,
    "baseCarbs": 12,
    "baseFats": 14,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 160,
    "healthBenefits": "High iron, folate, and calcium from greens; lean protein supports muscle without blood sugar spikes.",
    "clinicalNote": "Ultra-low carbohydrate density (12g). Excellent for glycemic stabilization.",
    "localMarkets": [
      "Balogun Market",
      "Mile 12 Market",
      "Supermarket Produce Aisle"
    ],
    "ingredients": [
      {
        "amount": 2,
        "unit": "cups",
        "name": "Coarsely chopped spinach & Ugu leaves",
        "diasporaSwap": "Swiss chard, baby kale & spinach"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Lean diced beef or turkey",
        "diasporaSwap": "Extra firm tofu or grilled chicken"
      },
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Coarsely blended pepper & tomato base",
        "diasporaSwap": "Fire-roasted crushed tomatoes"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Fermented Iru",
        "lowSodiumSwap": "Chopped garlic, ginger & thyme"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground crayfish",
        "diasporaSwap": "Smoked dried shrimp"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Blanch chopped spinach in boiling water for 60 seconds, drain immediately, and squeeze out excess moisture.",
        "flameLevel": "High",
        "timerMinutes": 1,
        "avoTip": "Squeezing out excess water prevents Efo Riro stew from turning watery!"
      },
      {
        "stepNumber": 2,
        "instruction": "Fry pepper sauce with Iru, crayfish, and cooked beef until oil floats on top (about 12 minutes).",
        "flameLevel": "Medium",
        "timerMinutes": 12,
        "avoTip": "Cooking pepper base thoroughly develops deep sweetness without adding sugar."
      },
      {
        "stepNumber": 3,
        "instruction": "Turn off stove flame and stir in blanched greens. Let residual heat wilt leaves for 2 minutes.",
        "flameLevel": "Simmer",
        "timerMinutes": 2,
        "avoTip": "Turning off heat before stirring in greens keeps them crisp, bright green, and nutrient-dense."
      }
    ]
  },
  {
    "id": "16",
    "name": "Swahili Kuku Paka (Charred Coconut Chicken) & Brown Rice",
    "emoji": "🥥",
    "category": "dinner",
    "tags": [
      "high-protein",
      "heart-healthy",
      "diabetic-friendly"
    ],
    "prepTime": 20,
    "cookTime": 35,
    "baseServings": 3,
    "difficulty": "medium",
    "baseCalories": 390,
    "baseProtein": 36,
    "baseCarbs": 22,
    "baseFats": 16,
    "glycemicIndex": "Low",
    "rating": 5,
    "reviews": 210,
    "healthBenefits": "Coconut MCTs provide rapid cellular energy without insulin spikes; turmeric and ginger protect endothelial health.",
    "clinicalNote": "Low glycemic index. Charring chicken over flame reduces fat content while developing deep umami.",
    "localMarkets": [
      "Mombasa Spice Market",
      "Zanzibar Darajani Market",
      "Tesco / Whole Foods Coconut Milk"
    ],
    "ingredients": [
      {
        "amount": 400,
        "unit": "g",
        "name": "Skinless chicken breasts or bone-in thighs",
        "diasporaSwap": "Free-range chicken thighs"
      },
      {
        "amount": 1,
        "unit": "cup",
        "name": "Light coconut milk (zero added sugar)",
        "diasporaSwap": "Organic canned coconut milk"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Fresh grated ginger & garlic paste",
        "lowSodiumSwap": "Extra lime zest and coriander"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Ground turmeric & cumin",
        "lowSodiumSwap": "Cardamom & coriander powder"
      },
      {
        "amount": 1,
        "unit": "pc",
        "name": "Fresh lime juice squeezed",
        "diasporaSwap": "Lemon juice"
      },
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Steamed brown Basmati rice",
        "diasporaSwap": "Cauliflower rice"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Marinate chicken with garlic, ginger, turmeric, and lime juice for 15 minutes. Grill or broil for 8 minutes per side until lightly charred.",
        "flameLevel": "High",
        "timerMinutes": 16,
        "avoTip": "Charring before stewing gives authentic coastal Swahili smoky flavor!"
      },
      {
        "stepNumber": 2,
        "instruction": "In a saucepan, simmer coconut milk with minced green chilies and cumin for 8 minutes until thickened.",
        "flameLevel": "Medium",
        "timerMinutes": 8,
        "avoTip": "Simmering coconut milk gently prevents curdling and develops silky consistency."
      },
      {
        "stepNumber": 3,
        "instruction": "Add grilled chicken pieces into coconut sauce, simmer for 5 minutes, garnish with fresh coriander and serve over brown rice.",
        "flameLevel": "Simmer",
        "timerMinutes": 5,
        "avoTip": "Garnish with fresh lime wedges for Vitamin C enhancement."
      }
    ]
  }
];

export default function Recipe() {
  const { mode } = useAppMode();
  const { selectedLocation } = useLocation();
  const { t } = useLanguage();
  const { profile } = useUser();

  const [recipes, setRecipes] = useState<FullRecipe[]>(MASTER_RECIPES);
  const [activeView, setActiveView] = useState<"recipes" | "swaps" | "fruits_veggies">("recipes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<DietaryTag>("all");
  const [selectedMealCategory, setSelectedMealCategory] = useState<"all" | "breakfast" | "lunch" | "dinner" | "snack">("all");
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);

  // Scaler & Swap Toggles inside Modal
  const [portionMultiplier, setPortionMultiplier] = useState<number>(2); // Default 2 servings
  const [diasporaMode, setDiasporaMode] = useState<boolean>(false);
  const [lowSodiumMode, setLowSodiumMode] = useState<boolean>(false);

  // Step-by-Step Cooking Mode State
  const [isCookingMode, setIsCookingMode] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Active Cooking Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Load cloud favorites & user snapped custom recipes from database
  useEffect(() => {
    try {
      const customRecipes: FullRecipe[] = JSON.parse(localStorage.getItem("mealoptimizer_user_custom_recipes") || "[]");
      if (customRecipes.length > 0) {
        setRecipes((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const uniqueCustom = customRecipes.filter((r) => !existingIds.has(r.id));
          return [...uniqueCustom, ...prev];
        });
      }
    } catch {}

    getCollection("recipeFavorites")
      .then((items) => {
        const favIds = new Set((Array.isArray(items) ? items : []).map((i: any) => i.id));
        setRecipes((prev) => prev.map((r) => ({ ...r, isFavorite: favIds.has(r.id) || r.isFavorite })));
      })
      .catch(() => {});
  }, []);

  // Cooking Timer Effect
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            triggerHaptic("success");
            toast.success("Timer Finished! Check your pot 🍲");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!timerRunning && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning, timerSeconds]);

  const startStepTimer = (minutes: number) => {
    setTimerSeconds(minutes * 60);
    setTimerRunning(true);
    triggerHaptic("medium");
    toast.info(`Timer set for ${minutes} minutes ⏱️`);
  };

  const toggleFavorite = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerHaptic("light");
    const willFav = !recipes.find((r) => r.id === id)?.isFavorite;
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, isFavorite: willFav } : r)));
    if (selectedRecipe && selectedRecipe.id === id) {
      setSelectedRecipe({ ...selectedRecipe, isFavorite: willFav });
    }

    try {
      if (willFav) await createCollectionItem("recipeFavorites", { id });
      else await deleteCollectionItem("recipeFavorites", id);
      toast.success(willFav ? "Saved to Favorites ❤️" : "Removed from Favorites");
    } catch {}
  };

  // 1-Tap Log to Daily Food Diary
  const handleLogToDiary = async (recipe: FullRecipe) => {
    triggerHaptic("success");
    try {
      const now = new Date();
      const scaledCals = Math.round((recipe.baseCalories / recipe.baseServings) * portionMultiplier);
      const scaledProt = Math.round((recipe.baseProtein / recipe.baseServings) * portionMultiplier);
      const scaledCarbs = Math.round((recipe.baseCarbs / recipe.baseServings) * portionMultiplier);
      const scaledFats = Math.round((recipe.baseFats / recipe.baseServings) * portionMultiplier);

      const newLog = {
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        mealType: recipe.category,
        foodName: `${recipe.name} (${portionMultiplier} serv)`,
        calories: scaledCals,
        protein: scaledProt,
        carbs: scaledCarbs,
        fats: scaledFats,
        bloodSugarImpact: recipe.glycemicIndex.toLowerCase(),
        notes: `Cooked from MealOptimiza Recipes (${recipe.healthBenefits})`,
      };

      await createMealLog(newLog);
      triggerConfetti("burst");
      toast.success(`Logged ${recipe.name} (${scaledCals} kcal) to today's diary! 🎉`);
    } catch {
      toast.error("Failed to log recipe to diary");
    }
  };

  // Export Ingredients to Grocery Checklist
  const handleExportToGrocery = (recipe: FullRecipe) => {
    triggerHaptic("medium");
    try {
      const existing = JSON.parse(localStorage.getItem("mealoptimizer_custom_groceries") || "[]");
      const newItems = recipe.ingredients.map((ing) => ({
        id: `ing-${Date.now()}-${Math.random()}`,
        name: diasporaMode && ing.diasporaSwap ? ing.diasporaSwap : ing.name,
        quantity: `${Number((ing.amount * portionMultiplier).toFixed(1))} ${ing.unit}`,
        category: "Produce & Spices",
        checked: false,
      }));

      const merged = [...existing, ...newItems];
      localStorage.setItem("mealoptimizer_custom_groceries", JSON.stringify(merged));
      toast.success(`Exported ${newItems.length} ingredients to your Smart Market Checklist 🛒`);
    } catch {
      toast.error("Failed to export to grocery list");
    }
  };

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        recipe.name.toLowerCase().includes(q) ||
        recipe.healthBenefits.toLowerCase().includes(q) ||
        recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(q));

      const matchesCategory = selectedMealCategory === "all" || recipe.category === selectedMealCategory;

      let matchesTag = true;
      if (selectedTag === "favorites") {
        matchesTag = Boolean(recipe.isFavorite);
      } else if (selectedTag !== "all") {
        matchesTag = recipe.tags.includes(selectedTag);
      }

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [recipes, searchQuery, selectedTag, selectedMealCategory]);

  const openRecipeDetails = (recipe: FullRecipe) => {
    setSelectedRecipe(recipe);
    setPortionMultiplier(recipe.baseServings);
    setIsCookingMode(false);
    setCurrentStepIdx(0);
    setCheckedIngredients({});
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 relative">
      {/* High-Visibility Ambient Background Animation */}
      <AmbientBackground />

      {/* Top Header */}
      <div className="relative z-10 bg-gradient-to-b from-[#A5DBDB] to-[#B8E5E5] px-4 sm:px-6 pt-9 pb-5 border-b border-teal-500/15">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1f7a8c] block">
              Metabolic Culinary Lab
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              Clinical Recipes &amp; Swaps 🍲
            </h1>
          </div>
          <ProfilePictureUpload />
        </div>

        {/* Top View Switcher: Clinical Recipes vs African Swap Engine vs Fruits & Greens */}
        <div className="max-w-2xl mx-auto mt-3 bg-white/60 dark:bg-zinc-800/60 p-1 rounded-2xl flex gap-1 border border-teal-100 dark:border-zinc-700/80 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setActiveView("recipes");
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeView === "recipes"
                ? "bg-[#1f7a8c] text-white shadow-sm"
                : "text-slate-700 dark:text-zinc-300 hover:bg-white/40"
            }`}
          >
            <span>🍲 Recipes ({recipes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setActiveView("swaps");
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeView === "swaps"
                ? "bg-[#1f7a8c] text-white shadow-sm"
                : "text-slate-700 dark:text-zinc-300 hover:bg-white/40"
            }`}
          >
            <Sparkles size={12} className="text-amber-300 animate-pulse shrink-0" />
            <span>Swap Engine 🔄</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              setActiveView("fruits_veggies");
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeView === "fruits_veggies"
                ? "bg-[#1f7a8c] text-white shadow-sm"
                : "text-slate-700 dark:text-zinc-300 hover:bg-white/40"
            }`}
          >
            <span>🥗 Fruits &amp; Greens 🍏</span>
          </button>
        </div>

        {activeView === "recipes" && (
          <>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-3 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search healthy Jollof, Egusi, swallows, low-sodium soups..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/95 backdrop-blur-md border border-teal-100/90 rounded-2xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1f7a8c] shadow-xs transition-all"
              />
            </div>

            {/* Location & Diaspora Context Strip */}
            <div className="max-w-2xl mx-auto mt-2 flex items-center justify-between text-[11px] text-teal-900 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-teal-100">
              <div className="flex items-center gap-1.5 font-bold">
                <MapPin size={13} className="text-[#1f7a8c]" />
                <span>Region: {selectedLocation.flag} {selectedLocation.displayName}</span>
              </div>
              <span className="text-[10px] text-teal-700 font-semibold">
                {diasporaMode ? "🌍 Diaspora Supermarket Swaps Active" : "🇳🇬 Local Market Sourcing"}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="px-4 sm:px-6 max-w-2xl mx-auto mt-4 space-y-4">
        {activeView === "swaps" ? (
          <AfricanSwapEngine />
        ) : activeView === "fruits_veggies" ? (
          <FruitVegetableGuide />
        ) : (
          <>
        {/* ============================================================ */}
        {/* 1. CLINICAL CONDITION & MEAL TIME FILTER PILL CHIPS          */}
        {/* ============================================================ */}
        <div className="space-y-2">
          {/* Main Clinical Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: "all", label: "All Meals", icon: "✨" },
              { id: "diabetic-friendly", label: "Low Glycemic", icon: "🩸" },
              { id: "low-sodium", label: "Hypertension Safe", icon: "❤️" },
              { id: "high-protein", label: "High Protein Swallows", icon: "💪" },
              { id: "pcos-safe", label: "PCOS & Hormone", icon: "🥑" },
              { id: "weight-loss", label: "Metabolic Calorie", icon: "🔥" },
              { id: "favorites", label: "Saved Favorites", icon: "❤️" },
            ].map((pill) => {
              const count = recipes.filter((r) =>
                pill.id === "all"
                  ? true
                  : pill.id === "favorites"
                  ? Boolean(r.isFavorite)
                  : r.tags.includes(pill.id)
              ).length;

              const isSelected = selectedTag === pill.id;

              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedTag(pill.id as DietaryTag);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                    isSelected
                      ? "bg-[#1f7a8c] text-white border-[#1f7a8c] ring-2 ring-teal-500/20"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span>{pill.icon}</span>
                  <span>{pill.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Meal Time Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: "all", label: "All Types" },
              { id: "breakfast", label: "🍳 Breakfast" },
              { id: "lunch", label: "🍲 Lunch & Swallows" },
              { id: "dinner", label: "🌙 Light Dinners" },
              { id: "snack", label: "🥤 Snacks & Elixirs" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic("light");
                  setSelectedMealCategory(cat.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  selectedMealCategory === cat.id
                    ? "bg-teal-900 text-white font-black"
                    : "bg-white/70 text-slate-600 hover:bg-white border border-slate-200/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Type Filter Tabs */}
        <div className="flex bg-white/90 p-1 rounded-2xl border border-teal-100 shadow-2xs gap-1">
          {(["all", "breakfast", "lunch", "dinner", "snack"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                triggerHaptic("light");
                setSelectedMealCategory(cat);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                selectedMealCategory === cat
                  ? "bg-teal-50 text-[#1f7a8c] shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {cat === "all" ? "All Meals" : cat}
            </button>
          ))}
        </div>

        {/* Location Selector Component */}
        <LocationSelector />

        {/* ============================================================ */}
        {/* 2. RECIPE CARDS GRID                                         */}
        {/* ============================================================ */}
        <div className="space-y-3.5">
          {filteredRecipes.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-teal-100">
              <MascotEmptyState
                title="No recipes found"
                subtitle="Try searching a different ingredient or clearing your clinical filters."
              />
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => openRecipeDetails(recipe)}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md border border-teal-100/90 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="text-3xl shrink-0 p-2 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl shadow-2xs border border-teal-100 group-hover:scale-105 transition-transform">
                      {recipe.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span
                          className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${
                            recipe.glycemicIndex === "Low"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : recipe.glycemicIndex === "Medium"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {recipe.glycemicIndex} Glycemic Spike
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-0.5">
                          <Clock size={11} /> {recipe.prepTime + recipe.cookTime}m
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-[#1f7a8c] transition-colors leading-snug">
                        {recipe.name}
                      </h3>

                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {recipe.healthBenefits}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    className="p-2 text-gray-300 hover:text-rose-500 shrink-0 cursor-pointer transition-colors"
                  >
                    <Heart
                      className={`h-5 w-5 ${recipe.isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
                    />
                  </button>
                </div>

                {/* Feasibility & Satiety Index (Clinical Feasibility Scoring) */}
                <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100/80 text-[10px] text-slate-600 font-semibold overflow-x-auto scrollbar-none">
                  <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-100 flex items-center gap-1 shrink-0">
                    <span>⏱️</span>
                    <span>{recipe.prepTime + recipe.cookTime}m prep</span>
                  </span>
                  <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1 shrink-0">
                    <span>💰</span>
                    <span>{recipe.baseCalories > 450 ? "Household Budget" : "Low Cost"}</span>
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1 shrink-0 font-bold">
                    <span>🔋</span>
                    <span>{recipe.baseProtein >= 25 ? "High Satiety (Full 4-5h)" : "Balanced Satiety (3h)"}</span>
                  </span>
                </div>

                {/* Macro Strip */}
                <div className="grid grid-cols-4 gap-1.5 mt-2 text-center">
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    <span className="text-[9px] text-gray-400 font-bold block">Calories</span>
                    <span className="text-xs font-black text-orange-600">{recipe.baseCalories}</span>
                    <span className="text-[8px] text-gray-400 block">kcal</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    <span className="text-[9px] text-gray-400 font-bold block">Protein</span>
                    <span className="text-xs font-black text-blue-600">{recipe.baseProtein}g</span>
                    <span className="text-[8px] text-gray-400 block">Muscle</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    <span className="text-[9px] text-gray-400 font-bold block">Carbs</span>
                    <span className="text-xs font-black text-emerald-600">{recipe.baseCarbs}g</span>
                    <span className="text-[8px] text-gray-400 block">Energy</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                    <span className="text-[9px] text-gray-400 font-bold block">Fats</span>
                    <span className="text-xs font-black text-purple-600">{recipe.baseFats}g</span>
                    <span className="text-[8px] text-gray-400 block">Healthy</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>{recipe.ingredients.length} Whole Ingredients</span>
                  </div>

                  <span className="text-[#1f7a8c] font-black flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    View Recipe &amp; Cook <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        )}
      </div>

      <BottomNav />

      {/* ============================================================ */}
      {/* 3. INTERACTIVE 10X RECIPE & COOKING MODAL (IN-FRAME)         */}
      {/* ============================================================ */}
      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-lg max-h-[88vh] p-5 sm:p-6 flex flex-col rounded-3xl">
          {selectedRecipe && (
            <>
              <DialogHeader className="pb-1 text-left">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-[9.5px] font-black px-2.5 py-0.5 rounded-full border ${
                      selectedRecipe.glycemicIndex === "Low"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {selectedRecipe.glycemicIndex} Glycemic Spike
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleFavorite(selectedRecipe.id, e)}
                      className="p-1 text-rose-500 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Heart className={`h-5 w-5 ${selectedRecipe.isFavorite ? "fill-rose-500" : ""}`} />
                    </button>
                  </div>
                </div>

                <DialogTitle className="text-lg sm:text-xl font-black text-gray-900 leading-snug">
                  {selectedRecipe.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-teal-800 font-bold flex items-center gap-1 mt-0.5">
                  <Sparkles size={12} className="text-amber-500" />
                  {selectedRecipe.clinicalNote}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto overscroll-contain space-y-4 py-2 pr-1 text-xs">
                {/* Mode Selector: Recipe View vs Interactive Cooking Mode */}
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                  <button
                    onClick={() => setIsCookingMode(false)}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      !isCookingMode ? "bg-white text-teal-800 shadow-2xs" : "text-gray-500"
                    }`}
                  >
                    📖 Ingredients &amp; Nutrition
                  </button>
                  <button
                    onClick={() => setIsCookingMode(true)}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isCookingMode ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-2xs" : "text-gray-500"
                    }`}
                  >
                    👨‍🍳 Step-by-Step Cooking
                  </button>
                </div>

                {/* -------------------------------------------------- */}
                {/* VIEW A: INGREDIENTS & SCALER VIEW                  */}
                {/* -------------------------------------------------- */}
                {!isCookingMode && (
                  <>
                    {/* Dynamic Portion Scaler */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Adjust Servings (Auto-Scale)
                        </span>
                        <span className="text-xs font-black text-gray-900">
                          Cooking for: {portionMultiplier} {portionMultiplier === 1 ? "Person" : "People"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                        {[1, 2, 4, 6].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              triggerHaptic("light");
                              setPortionMultiplier(num);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              portionMultiplier === num
                                ? "bg-[#1f7a8c] text-white"
                                : "text-gray-600 hover:bg-slate-100"
                            }`}
                          >
                            {num}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scaled Macro Strip */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="bg-orange-50/70 p-2 rounded-xl border border-orange-200/80">
                        <span className="text-[9px] text-gray-500 font-bold block">Total Cals</span>
                        <span className="text-xs font-black text-orange-700">
                          {Math.round((selectedRecipe.baseCalories / selectedRecipe.baseServings) * portionMultiplier)}
                        </span>
                        <span className="text-[8px] text-gray-400 block">kcal</span>
                      </div>
                      <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-200/80">
                        <span className="text-[9px] text-gray-500 font-bold block">Protein</span>
                        <span className="text-xs font-black text-blue-700">
                          {Math.round((selectedRecipe.baseProtein / selectedRecipe.baseServings) * portionMultiplier)}g
                        </span>
                        <span className="text-[8px] text-gray-400 block">Muscle</span>
                      </div>
                      <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/80">
                        <span className="text-[9px] text-gray-500 font-bold block">Carbs</span>
                        <span className="text-xs font-black text-emerald-700">
                          {Math.round((selectedRecipe.baseCarbs / selectedRecipe.baseServings) * portionMultiplier)}g
                        </span>
                        <span className="text-[8px] text-gray-400 block">Energy</span>
                      </div>
                      <div className="bg-purple-50/70 p-2 rounded-xl border border-purple-200/80">
                        <span className="text-[9px] text-gray-500 font-bold block">Fats</span>
                        <span className="text-xs font-black text-purple-700">
                          {Math.round((selectedRecipe.baseFats / selectedRecipe.baseServings) * portionMultiplier)}g
                        </span>
                        <span className="text-[8px] text-gray-400 block">Healthy</span>
                      </div>
                    </div>

                    {/* Interactive Swaps Controls */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setDiasporaMode(!diasporaMode);
                          triggerHaptic("light");
                        }}
                        className={`p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          diasporaMode
                            ? "bg-teal-50 border-[#1f7a8c] text-teal-950 font-bold shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-gray-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#1f7a8c] block">🌍 Diaspora Swaps</span>
                          <span className="text-[11px] truncate block">UK / US Supermarket Mode</span>
                        </div>
                        <span className="text-sm font-black">{diasporaMode ? "ON" : "OFF"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setLowSodiumMode(!lowSodiumMode);
                          triggerHaptic("light");
                        }}
                        className={`p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          lowSodiumMode
                            ? "bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-gray-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-rose-700 block">🫀 Low-Sodium Mode</span>
                          <span className="text-[11px] truncate block">No-Cube DASH Shield</span>
                        </div>
                        <span className="text-sm font-black">{lowSodiumMode ? "ON" : "OFF"}</span>
                      </button>
                    </div>

                    {/* Checkable Ingredient List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                          Scaled Ingredients ({selectedRecipe.ingredients.length})
                        </span>
                        <button
                          onClick={() => handleExportToGrocery(selectedRecipe)}
                          className="text-[11px] font-bold text-[#1f7a8c] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingCart size={12} />
                          <span>Export to Market List</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {selectedRecipe.ingredients.map((ing, idx) => {
                          const isChecked = Boolean(checkedIngredients[ing.name]);
                          const scaledAmount = Number((ing.amount * portionMultiplier).toFixed(1));
                          const displayText =
                            diasporaMode && ing.diasporaSwap
                              ? ing.diasporaSwap
                              : lowSodiumMode && ing.lowSodiumSwap
                              ? ing.lowSodiumSwap
                              : ing.name;

                          return (
                            <div
                              key={idx}
                              onClick={() =>
                                setCheckedIngredients({
                                  ...checkedIngredients,
                                  [ing.name]: !isChecked,
                                })
                              }
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-slate-50 border-slate-200 text-gray-400 line-through"
                                  : "bg-white border-slate-200/80 text-gray-800 shadow-2xs hover:border-teal-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                                    isChecked ? "bg-[#1f7a8c] border-[#1f7a8c] text-white" : "border-gray-300"
                                  }`}
                                >
                                  {isChecked && <Check size={10} />}
                                </div>
                                <span className="font-semibold truncate">{displayText}</span>
                              </div>

                              <span className="font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md shrink-0">
                                {scaledAmount} {ing.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* -------------------------------------------------- */}
                {/* VIEW B: INTERACTIVE STEP-BY-STEP COOKING MODE      */}
                {/* -------------------------------------------------- */}
                {isCookingMode && (
                  <div className="space-y-4">
                    {/* Live Cooking Timer Pill */}
                    {timerSeconds > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between gap-3 text-orange-950 shadow-2xs">
                        <div className="flex items-center gap-2 font-mono text-base font-black">
                          <Clock className="h-4 w-4 text-orange-600 animate-spin" />
                          <span>
                            {Math.floor(timerSeconds / 60)}:
                            {(timerSeconds % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setTimerRunning(!timerRunning)}
                            className="px-2.5 py-1 bg-orange-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                          >
                            {timerRunning ? "Pause" : "Resume"}
                          </button>
                          <button
                            onClick={() => {
                              setTimerRunning(false);
                              setTimerSeconds(0);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-900 cursor-pointer"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step Card Navigation */}
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                      <span>Step {currentStepIdx + 1} of {selectedRecipe.steps.length}</span>
                      <div className="flex items-center gap-1">
                        {selectedRecipe.steps.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                              i === currentStepIdx
                                ? "w-6 bg-[#1f7a8c]"
                                : i < currentStepIdx
                                ? "w-2 bg-teal-400"
                                : "w-2 bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Active Step Hero Card */}
                    <div className="p-4 bg-gradient-to-br from-teal-50/60 to-emerald-50/50 rounded-2xl border border-teal-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                          Flame: {selectedRecipe.steps[currentStepIdx].flameLevel || "Medium"}
                        </span>
                        {selectedRecipe.steps[currentStepIdx].timerMinutes && (
                          <button
                            onClick={() =>
                              startStepTimer(selectedRecipe.steps[currentStepIdx].timerMinutes!)
                            }
                            className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
                          >
                            <Play size={11} className="fill-current" />
                            <span>Start {selectedRecipe.steps[currentStepIdx].timerMinutes}m Timer</span>
                          </button>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                        {selectedRecipe.steps[currentStepIdx].instruction}
                      </p>

                      {selectedRecipe.steps[currentStepIdx].avoTip && (
                        <div className="p-3 bg-white rounded-xl border border-teal-100 text-[11px] text-teal-900 flex items-start gap-2 shadow-2xs">
                          <Mascot gesture="wave" size={32} className="shrink-0" />
                          <span className="leading-snug">
                            <strong>Avo's Chef Tip:</strong> {selectedRecipe.steps[currentStepIdx].avoTip}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Step Navigation Buttons */}
                    <div className="flex gap-2">
                      <button
                        disabled={currentStepIdx === 0}
                        onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Previous Step
                      </button>
                      <button
                        onClick={() => {
                          if (currentStepIdx < selectedRecipe.steps.length - 1) {
                            setCurrentStepIdx((prev) => prev + 1);
                            triggerHaptic("light");
                          } else {
                            toast.success("Cooking Complete! Ready to enjoy and log 🎉");
                            handleLogToDiary(selectedRecipe);
                          }
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
                      >
                        <span>
                          {currentStepIdx === selectedRecipe.steps.length - 1
                            ? "Complete & Log Meal 🎉"
                            : "Next Step"}
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky In-Frame Action Footer */}
              <div className="pt-3 border-t border-gray-100 flex gap-2 mt-auto shrink-0">
                <button
                  onClick={() => handleLogToDiary(selectedRecipe)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Check size={14} />
                  <span>Log to Diary Now 🍽️</span>
                </button>

                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
