import { GROCERY_PARTNERS, getPartnersForLocation } from "../../lib/groceryAffiliates";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
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
  | "renal-safe"
  | "ulcer-safe"
  | "hormone-balance"
  | "pregnancy-safe"
  | "prostate-health"
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

export interface PlateComposition {
  staple: string;
  staplePct: number;
  greens: string;
  greensPct: number;
  protein: string;
  proteinPct: number;
  healthyFat?: string;
}

export interface FullRecipe {
  id: string;
  name: string;
  emoji: string;
  image?: string;
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
  plateComposition?: PlateComposition;
  clinicalScaleLabel?: string;
}

const MASTER_RECIPES: FullRecipe[] = [
{
    "id": "101",
    "name": "KDIGO Leached Yam Porridge (Renal-Safe)",
    "emoji": "🍲",
    "image": "/assets/recipes/kdigo-yam-porridge.webp",
    "clinicalScaleLabel": "KDIGO Leached Yam Porridge (Renal-Safe), prepared for one standard serving",
    "plateComposition": {
      "staple": "KDIGO Leached Yam Cubes (Porridge)",
      "staplePct": 50,
      "greens": "Steamed Ugwu & Spinach with Red Elixir Dip",
      "greensPct": 25,
      "protein": "Steamed Flaked Mackerel Fish",
      "proteinPct": 25,
      "healthyFat": "Cold-Pressed Palm Oil (1 tsp)"
    },
    "category": "lunch",
    "tags": [
      "renal-safe",
      "low-sodium",
      "heart-healthy"
    ],
    "prepTime": 20,
    "cookTime": 30,
    "baseServings": 2,
    "difficulty": "easy",
    "baseCalories": 260,
    "baseProtein": 14,
    "baseCarbs": 42,
    "baseFats": 5,
    "glycemicIndex": "Medium",
    "rating": 4.9,
    "reviews": 88,
    "healthBenefits": "Two-stage boiling with discarded water cuts yam potassium by ~60%, allowing kidney patients to safely enjoy traditional yam.",
    "clinicalNote": "KDIGO / KDOQI compliant. Total potassium capped at <350mg per portion. Sodium capped <250mg.",
    "localMarkets": [
      "Mile 12 Market",
      "Oyingbo Market",
      "Afro-Caribbean Grocers"
    ],
    "ingredients": [
      {
        "amount": 200,
        "unit": "g",
        "name": "White yam cubed small (1cm), soaked in warm water",
        "diasporaSwap": "Taro / cassava (also double-leached)"
      },
      {
        "amount": 50,
        "unit": "g",
        "name": "Fresh Ugwu or spinach leaves (steamed separately)",
        "diasporaSwap": "Kale or collard greens (steamed & drained)"
      },
      {
        "amount": 80,
        "unit": "g",
        "name": "Boiled de-boned mackerel or fresh tilapia",
        "diasporaSwap": "Steamed cod or haddock"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Cold-pressed palm oil (clarified)",
        "diasporaSwap": "Olive oil with a drop of paprika"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Dice yam into small 1cm cubes. Boil in 4 cups water for 10 mins. Discard all cooking water completely to leach out potassium.",
        "flameLevel": "High",
        "timerMinutes": 10,
        "avoTip": "Discarding the first water is the golden secret to removing >50% soluble potassium!"
      },
      {
        "stepNumber": 2,
        "instruction": "Add 3 cups fresh boiling water to the leached yams and simmer for another 10 mins until soft.",
        "flameLevel": "Medium",
        "timerMinutes": 10
      },
      {
        "stepNumber": 3,
        "instruction": "Mash half the yams into a light porridge base. Fold in boiled fish, 1 tsp palm oil, and ground crayfish.",
        "flameLevel": "Low",
        "timerMinutes": 5
      },
      {
        "stepNumber": 4,
        "instruction": "Stir in pre-steamed Ugwu leaves during the final 2 minutes. Serve warm.",
        "flameLevel": "Simmer",
        "timerMinutes": 2
      }
    ]
  },
{
    "id": "102",
    "name": "Soothing Green Banana & Oat Porridge (Ulcer & Acid-Safe)",
    "emoji": "🥣",
    "image": "/assets/recipes/green-banana-porridge.webp",
    "clinicalScaleLabel": "Soothing Green Banana & Oat Porridge (Ulcer-Safe), single clinical portion",
    "plateComposition": {
      "staple": "Grated Green Banana & Oat Porridge with Chia",
      "staplePct": 50,
      "greens": "Fresh Papaya Fruit Slices & Lime",
      "greensPct": 25,
      "protein": "Soft-Boiled Egg Halves",
      "proteinPct": 25
    },
    "category": "breakfast",
    "tags": [
      "ulcer-safe",
      "diabetic-friendly",
      "heart-healthy"
    ],
    "prepTime": 10,
    "cookTime": 15,
    "baseServings": 2,
    "difficulty": "easy",
    "baseCalories": 270,
    "baseProtein": 9,
    "baseCarbs": 46,
    "baseFats": 6,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 112,
    "healthBenefits": "Rich in leucocyanidin bioflavonoids and mucosal-coating oat beta-glucan; non-irritating to peptic and gastritis lesions.",
    "clinicalNote": "Neutral pH (>6.2). Zero chili, zero citrus, zero nightshade peppers. Stimulates natural mucosal barrier defense.",
    "localMarkets": [
      "Bodija Market Ibadan",
      "Tejuosho Market Yaba",
      "Whole Foods / Sainsbury's"
    ],
    "ingredients": [
      {
        "amount": 1,
        "unit": "medium",
        "name": "Raw green plantain / unripe banana peeled & finely grated",
        "diasporaSwap": "Green cooking bananas (Machete)"
      },
      {
        "amount": 0.5,
        "unit": "cup",
        "name": "Rolled oats",
        "diasporaSwap": "Steel-cut oats"
      },
      {
        "amount": 1,
        "unit": "cup",
        "name": "Unsweetened light coconut milk or almond milk",
        "diasporaSwap": "Oat milk"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Raw chia seeds with a pinch of ginger",
        "diasporaSwap": "Ground flaxseed"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Bring 1.5 cups of water and coconut milk to a gentle simmer in a non-stick pot.",
        "flameLevel": "Medium",
        "timerMinutes": 4
      },
      {
        "stepNumber": 2,
        "instruction": "Whisk in grated green plantain and rolled oats continuously to prevent lumping.",
        "flameLevel": "Low",
        "timerMinutes": 6,
        "avoTip": "Whisk gently — the creamy starch coats stomach walls smoothly."
      },
      {
        "stepNumber": 3,
        "instruction": "Cook on gentle simmer for 5 minutes until creamy. Stir in chia seeds and ginger.",
        "flameLevel": "Simmer",
        "timerMinutes": 5
      }
    ]
  },
{
    "id": "105",
    "name": "Maternal Healing Dry Catfish & Uziza Soup (Postpartum & Recovery)",
    "emoji": "🍲",
    "image": "/assets/recipes/dry-catfish-uziza.webp",
    "clinicalScaleLabel": "Maternal Healing Dry Catfish & Uziza Soup, postpartum single portion",
    "plateComposition": {
      "staple": "Boiled Unripe Plantain Disks",
      "staplePct": 50,
      "greens": "Fresh Shredded Scent Leaf (Efirin) & Bitterleaf",
      "greensPct": 25,
      "protein": "Smoked Dry Catfish in Uziza Broth",
      "proteinPct": 25
    },
    "category": "dinner",
    "tags": [
      "pregnancy-safe",
      "high-protein",
      "heart-healthy",
      "ulcer-safe"
    ],
    "prepTime": 15,
    "cookTime": 25,
    "baseServings": 2,
    "difficulty": "easy",
    "baseCalories": 280,
    "baseProtein": 36,
    "baseCarbs": 6,
    "baseFats": 12,
    "glycemicIndex": "Low",
    "rating": 4.9,
    "reviews": 76,
    "healthBenefits": "Uziza (piper guineense) and scent leaf contain therapeutic phytosterols and flavonoids that ease postoperative pain and promote healing.",
    "clinicalNote": "Rich in bioavailable heme iron (4.2mg), glycine, and collagen precursors for surgical wound healing post-Cesarean.",
    "localMarkets": [
      "Onitsha Main Market",
      "Watt Market Calabar",
      "Peckham Rye African Stores"
    ],
    "ingredients": [
      {
        "amount": 1,
        "unit": "medium",
        "name": "Smoked dry catfish (de-boned & washed in warm water)",
        "diasporaSwap": "Smoked haddock or dried cod"
      },
      {
        "amount": 1,
        "unit": "tbsp",
        "name": "Ground Uziza seeds + 1/2 Uda pod (cracked)",
        "diasporaSwap": "Black peppercorns + grains of paradise"
      },
      {
        "amount": 1,
        "unit": "handful",
        "name": "Fresh shredded Scent leaf (Nchanwu / Efirin)",
        "diasporaSwap": "Fresh sweet basil or Thai basil"
      },
      {
        "amount": 3,
        "unit": "cups",
        "name": "Rich bone broth with ginger and garlic",
        "diasporaSwap": "Organic chicken bone broth"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Place washed catfish into pot with bone broth, crushed ginger, garlic, and crayfish. Bring to a boil for 10 minutes.",
        "flameLevel": "High",
        "timerMinutes": 10
      },
      {
        "stepNumber": 2,
        "instruction": "Add ground uziza and cracked uda pod; simmer for 8 minutes to extract essential anti-inflammatory terpenes.",
        "flameLevel": "Medium",
        "timerMinutes": 8
      },
      {
        "stepNumber": 3,
        "instruction": "Discard the hard uda pod. Stir in fresh scent leaves and let simmer for 2 minutes.",
        "flameLevel": "Low",
        "timerMinutes": 2
      }
    ]
  },
{
    "id": "106",
    "name": "Cauliflower-Psyllium Fufu & Rich Efo Riro (Zero-Spike Swallow)",
    "emoji": "🥣",
    "image": "/assets/recipes/cauliflower-fufu-efo.webp",
    "clinicalScaleLabel": "Cauliflower-Psyllium Fufu & Rich Efo Riro, standard 9-inch divided clinical plate",
    "plateComposition": {
      "staple": "Zero-Spike Cauliflower-Psyllium Fufu Ball",
      "staplePct": 50,
      "greens": "Rich Efo Riro Spinach & Locust Beans",
      "greensPct": 25,
      "protein": "Steamed Lean Beef & Flaked Dried Fish",
      "proteinPct": 25
    },
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
    "difficulty": "medium",
    "baseCalories": 260,
    "baseProtein": 22,
    "baseCarbs": 14,
    "baseFats": 14,
    "glycemicIndex": "Low",
    "rating": 5.0,
    "reviews": 168,
    "healthBenefits": "Mimics the texture and elasticity of traditional fufu with only 14g total carbs and 10g prebiotic soluble fiber.",
    "clinicalNote": "Glycemic Load is ~2 (virtually flat CGM response). Ideal for strict ketogenic, diabetic, or metabolic reversal regimens.",
    "localMarkets": [
      "Shoprite Nigeria",
      "Mile 12",
      "Aldi / Trader Joe's / Carrefour"
    ],
    "ingredients": [
      {
        "amount": 1,
        "unit": "medium",
        "name": "Head of cauliflower, steamed & pureed smooth",
        "diasporaSwap": "Frozen riced cauliflower (steamed & pureed)"
      },
      {
        "amount": 1.5,
        "unit": "tbsp",
        "name": "Psyllium husk powder + 1 tbsp coconut flour (natural binder)",
        "diasporaSwap": "Xanthan gum (1/2 tsp) + psyllium"
      },
      {
        "amount": 150,
        "unit": "g",
        "name": "Chopped Efo Shoko (or spinach) with 100g cooked lean beef/fish",
        "diasporaSwap": "Fresh baby spinach + grilled chicken breast"
      },
      {
        "amount": 1,
        "unit": "tsp",
        "name": "Palm oil with diced onion and 1 tsp Iru",
        "diasporaSwap": "Olive oil with fermented locust beans"
      }
    ],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "In a non-stick pot over medium-low heat, stir pureed cauliflower with psyllium husk and coconut flour for 4 minutes until a stretchy dough forms. Wrap in wrap film.",
        "flameLevel": "Low",
        "timerMinutes": 4,
        "avoTip": "Keep stirring briskly — psyllium activates into an elastic dough within minutes!"
      },
      {
        "stepNumber": 2,
        "instruction": "Sauté onions and locust beans in 1 tsp palm oil for 2 minutes.",
        "flameLevel": "Medium",
        "timerMinutes": 2
      },
      {
        "stepNumber": 3,
        "instruction": "Add cooked shredded beef/fish and chopped greens; toss quickly on high heat for 3 minutes without overcooking.",
        "flameLevel": "High",
        "timerMinutes": 3
      },
      {
        "stepNumber": 4,
        "instruction": "Unwrap the warm cauliflower swallow and serve alongside the fragrant Efo Riro.",
        "flameLevel": "Low",
        "timerMinutes": 1
      }
    ]
  },
{
    "id": "1",
    "name": "Diabetic-Friendly Oat Swallow & Fresh Okra Soup",
    "emoji": "🥣",
    "image": "/assets/recipes/diabetic-oat-swallow-okra.webp",
    "clinicalScaleLabel": "Diabetic-Friendly Oat Swallow & Fresh Okra Soup, standard 9-inch divided clinical plate",
    "plateComposition": {
      "staple": "Rolled Oat Swallow / Low-GI Fufu Ball",
      "staplePct": 50,
      "greens": "Viscous Fresh Okra & Ugu Pumpkin Leaves",
      "greensPct": 25,
      "protein": "Grilled Titus Mackerel Fish Steak",
      "proteinPct": 25
    },
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
    "image": "/assets/recipes/brown-jollof-titus.webp",
    "clinicalScaleLabel": "Low-Sodium Native Brown Jollof Rice, DASH single serving",
    "plateComposition": {
      "staple": "Smoky Brown Ofada Jollof Rice",
      "staplePct": 50,
      "greens": "Steamed Cabbage & Carrot Medley",
      "greensPct": 25,
      "protein": "Skinless Turkey / Titus Mackerel",
      "proteinPct": 25
    },
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
    "image": "/assets/recipes/egusi-ugu-soup.webp",
    "clinicalScaleLabel": "Protein-Packed Egusi & Ugu Soup, single portion",
    "plateComposition": {
      "staple": "Unbleached Ground Melon Seed Egusi",
      "staplePct": 50,
      "greens": "Fresh Fluted Pumpkin Leaves (Ugu)",
      "greensPct": 25,
      "protein": "Lean Beef & Steamed Stockfish",
      "proteinPct": 25
    },
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
    "image": "/assets/recipes/afang-waterleaf-pot.webp",
    "clinicalScaleLabel": "Standard 9-Inch Divided Clinical Plate Serving",
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
    "image": "/assets/recipes/ghanaian-waakye-egg.webp",
    "clinicalScaleLabel": "Standard 9-Inch Divided Clinical Plate Serving",
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
    "image": "/assets/recipes/baobab-kuka-fonio.webp",
    "clinicalScaleLabel": "Standard 9-Inch Divided Clinical Plate Serving",
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
    "image": "/assets/recipes/ofe-nsala-catfish.webp",
    "clinicalScaleLabel": "Standard 9-Inch Divided Clinical Plate Serving",
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
    "image": "/assets/recipes/sukuma-wiki-beef.webp",
    "clinicalScaleLabel": "Standard 9-Inch Divided Clinical Plate Serving",
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
    "image": "/assets/recipes/cameroonian-ndole.webp",
    "clinicalScaleLabel": "Standard 9-Inch Divided Clinical Plate Serving",
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
    "image": "/assets/recipes/ethiopian-doro-wat.webp",
    "clinicalScaleLabel": "Standard 9-Inch Divided Clinical Plate Serving",
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
  }
];


