import { useState, useEffect } from "react";
import { ChefHat, Search, Filter, Heart, Clock, Flame, Users, ChevronRight, Star, Bookmark, MapPin, ShoppingCart, AlertCircle, Leaf, Globe } from "lucide-react";
import { getCollection, createCollectionItem, deleteCollectionItem } from "../../lib/api";
import BottomNav from "../components/BottomNav";
import MascotEmptyState from "../components/MascotEmptyState";
import { useAppMode } from "../contexts/AppModeContext";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

// Maps a dietary tag to its translation key; falls back to the prettified tag.
const TAG_KEY: Record<string, string> = {
  "diabetic-friendly": "recipe.tag.diabeticFriendly",
  "low-sodium": "recipe.tag.lowSodium",
  "high-protein": "recipe.tag.highProtein",
  "heart-healthy": "recipe.tag.heartHealthy",
  "weight-loss": "recipe.tag.weightLoss",
};
import LocationSelector from "../components/LocationSelector";
import ProfilePictureUpload from "../components/ProfilePictureUpload";

type RecipeCategory = "all" | "breakfast" | "lunch" | "dinner" | "snack";
type DietaryTag = "diabetic-friendly" | "low-sodium" | "high-protein" | "heart-healthy" | "weight-loss";

type Recipe = {
  id: string;
  name: string;
  image: string;
  category: RecipeCategory;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  rating: number;
  reviews: number;
  tags: DietaryTag[];
  ingredients: string[];
  localMarkets?: string[];
  healthBenefits: string;
  isFavorite: boolean;
};

export default function Recipe() {
  const { mode } = useAppMode();
  const { selectedLocation, getRegionalKey } = useLocation();
  const { t } = useLanguage();
  // Category ("all" + meal types) and difficulty label helpers.
  const categoryLabel = (cat: string) =>
    cat === "all"
      ? t("logs.filter.all")
      : cat === "snack"
      ? t("logs.meal.snack")
      : ["breakfast", "brunch", "lunch", "dinner"].includes(cat)
      ? t(`planmeal.meal.${cat}`)
      : cat;
  const diffLabel = (d: string) => t(`recipe.diff.${d}`);
  const tagLabel = (tag: string) => (TAG_KEY[tag] ? t(TAG_KEY[tag]) : tag.replace("-", " "));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [recipes, setRecipes] = useState<Recipe[]>([
    {
      id: "1",
      name: "Diabetic-Friendly Jollof Rice",
      image: "🍚",
      category: "lunch",
      prepTime: 15,
      cookTime: 45,
      servings: 4,
      difficulty: "medium",
      calories: 380,
      protein: 22,
      carbs: 48,
      fats: 10,
      rating: 4.8,
      reviews: 127,
      tags: ["diabetic-friendly", "heart-healthy"],
      ingredients: [
        "2 cups brown rice",
        "400g chicken breast",
        "2 tomatoes",
        "1 onion",
        "2 bell peppers",
        "Garlic & ginger",
        "Low-sodium bouillon",
        "Olive oil"
      ],
      localMarkets: ["Tejuosho Market", "Balogun Market", "ShopRite"],
      healthBenefits: "Uses brown rice for lower glycemic index and lean protein for blood sugar control",
      isFavorite: true,
    },
    {
      id: "2",
      name: "Protein-Packed Egusi Soup",
      image: "🥣",
      category: "dinner",
      prepTime: 20,
      cookTime: 40,
      servings: 6,
      difficulty: "medium",
      calories: 420,
      protein: 32,
      carbs: 18,
      fats: 26,
      rating: 4.9,
      reviews: 203,
      tags: ["high-protein", "heart-healthy"],
      ingredients: [
        "2 cups ground egusi",
        "500g beef/fish",
        "Spinach leaves",
        "2 onions",
        "Palm oil (moderate)",
        "Crayfish",
        "Stockfish",
        "Seasoning"
      ],
      localMarkets: ["Oyingbo Market", "Mile 12 Market"],
      healthBenefits: "High in protein and healthy fats from melon seeds, supports muscle health",
      isFavorite: false,
    },
    {
      id: "3",
      name: "Low-Sodium Pepper Soup",
      image: "🍲",
      category: "dinner",
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: "easy",
      calories: 220,
      protein: 28,
      carbs: 8,
      fats: 9,
      rating: 4.7,
      reviews: 156,
      tags: ["low-sodium", "diabetic-friendly", "heart-healthy"],
      ingredients: [
        "500g catfish/chicken",
        "Pepper soup spices",
        "2 scotch bonnets",
        "Onions",
        "Ginger & garlic",
        "Uziza leaves",
        "No added salt"
      ],
      localMarkets: ["Ikeja Market", "Oshodi Market"],
      healthBenefits: "Low in sodium, anti-inflammatory spices support cardiovascular health",
      isFavorite: true,
    },
    {
      id: "4",
      name: "Nutrient-Dense Akara (Bean Cakes)",
      image: "🥙",
      category: "breakfast",
      prepTime: 30,
      cookTime: 20,
      servings: 12,
      difficulty: "medium",
      calories: 180,
      protein: 12,
      carbs: 16,
      fats: 8,
      rating: 4.6,
      reviews: 98,
      tags: ["high-protein", "diabetic-friendly"],
      ingredients: [
        "2 cups peeled beans",
        "1 onion",
        "2 peppers",
        "Salt (minimal)",
        "Vegetable oil (for frying)"
      ],
      localMarkets: ["Makola Market", "Idumota Market"],
      healthBenefits: "Plant-based protein source, rich in fiber for sustained energy",
      isFavorite: false,
    },
    {
      id: "5",
      name: "Heart-Healthy Grilled Tilapia",
      image: "🐟",
      category: "lunch",
      prepTime: 15,
      cookTime: 25,
      servings: 2,
      difficulty: "easy",
      calories: 280,
      protein: 38,
      carbs: 4,
      fats: 12,
      rating: 4.9,
      reviews: 174,
      tags: ["heart-healthy", "high-protein", "low-sodium"],
      ingredients: [
        "2 whole tilapia",
        "Lemon juice",
        "Garlic & herbs",
        "Olive oil",
        "Bell peppers",
        "Onions"
      ],
      localMarkets: ["Epe Fish Market", "Badagry Creek"],
      healthBenefits: "Omega-3 rich, supports heart health and reduces inflammation",
      isFavorite: true,
    },
    {
      id: "6",
      name: "Efo Riro (Vegetable Soup)",
      image: "🍲",
      category: "dinner",
      prepTime: 20,
      cookTime: 35,
      servings: 6,
      difficulty: "medium",
      calories: 310,
      protein: 26,
      carbs: 12,
      fats: 20,
      rating: 4.8,
      reviews: 0,
      tags: ["high-protein", "heart-healthy", "low-sodium"],
      ingredients: [
        "Ugu & spinach (efo tete)",
        "500g assorted lean meat & fish",
        "Palm oil (moderate)",
        "Locust beans (iru)",
        "Crayfish",
        "Fresh pepper & onions",
        "Seasoning (minimal)"
      ],
      localMarkets: ["Mile 12 Market", "Balogun Market"],
      healthBenefits: "Leafy greens deliver iron, folate and fibre; lean protein supports muscle without excess sodium",
      isFavorite: false,
    },
    {
      id: "7",
      name: "Moi Moi (Steamed Bean Pudding)",
      image: "🍮",
      category: "breakfast",
      prepTime: 30,
      cookTime: 45,
      servings: 8,
      difficulty: "medium",
      calories: 190,
      protein: 13,
      carbs: 18,
      fats: 7,
      rating: 4.7,
      reviews: 0,
      tags: ["high-protein", "diabetic-friendly", "weight-loss"],
      ingredients: [
        "2 cups peeled beans",
        "Boiled egg (optional)",
        "Fresh pepper & onions",
        "Palm oil (small amount)",
        "Crayfish",
        "Sardine or fish (optional)"
      ],
      localMarkets: ["Oyingbo Market", "Mushin Market"],
      healthBenefits: "Steamed rather than fried — plant protein and fibre with a low glycemic load",
      isFavorite: false,
    },
    {
      id: "8",
      name: "Ewa Agoyin (Mashed Beans)",
      image: "🫘",
      category: "lunch",
      prepTime: 15,
      cookTime: 60,
      servings: 5,
      difficulty: "medium",
      calories: 360,
      protein: 18,
      carbs: 52,
      fats: 9,
      rating: 4.6,
      reviews: 0,
      tags: ["high-protein", "weight-loss"],
      ingredients: [
        "3 cups honey beans",
        "Caramelised onions",
        "Palm oil (moderate)",
        "Dry pepper",
        "Ground crayfish"
      ],
      localMarkets: ["Idumota Market", "Ojuwoye Market"],
      healthBenefits: "Slow-digesting beans keep you full for hours and help steady blood sugar",
      isFavorite: false,
    },
    {
      id: "9",
      name: "Ofada Rice & Ayamase Sauce",
      image: "🍚",
      category: "lunch",
      prepTime: 20,
      cookTime: 45,
      servings: 4,
      difficulty: "medium",
      calories: 430,
      protein: 24,
      carbs: 55,
      fats: 13,
      rating: 4.7,
      reviews: 0,
      tags: ["diabetic-friendly", "heart-healthy"],
      ingredients: [
        "2 cups ofada (unpolished) rice",
        "Assorted lean meat",
        "Green bell peppers (ayamase)",
        "Palm oil (moderate)",
        "Locust beans (iru)",
        "Onions"
      ],
      localMarkets: ["Mile 12 Market", "Mushin Market"],
      healthBenefits: "Unpolished ofada rice carries more fibre and a lower glycemic index than white rice",
      isFavorite: false,
    },
    {
      id: "10",
      name: "Okro Soup",
      image: "🥘",
      category: "dinner",
      prepTime: 15,
      cookTime: 25,
      servings: 5,
      difficulty: "easy",
      calories: 260,
      protein: 24,
      carbs: 14,
      fats: 13,
      rating: 4.6,
      reviews: 0,
      tags: ["low-sodium", "heart-healthy", "weight-loss"],
      ingredients: [
        "Fresh okra",
        "Ugu or spinach",
        "Lean beef & fish",
        "Palm oil (moderate)",
        "Crayfish",
        "Fresh pepper & onions"
      ],
      localMarkets: ["Oshodi Market", "Ketu Market"],
      healthBenefits: "Okra's soluble fibre helps control cholesterol and blood sugar",
      isFavorite: false,
    },
    {
      id: "11",
      name: "Boiled Plantain & Garden Egg Sauce",
      image: "🍌",
      category: "breakfast",
      prepTime: 10,
      cookTime: 25,
      servings: 3,
      difficulty: "easy",
      calories: 340,
      protein: 10,
      carbs: 58,
      fats: 10,
      rating: 4.5,
      reviews: 0,
      tags: ["heart-healthy", "weight-loss"],
      ingredients: [
        "2 unripe or semi-ripe plantains",
        "Garden eggs (African eggplant)",
        "Tomatoes & pepper",
        "Onions",
        "Olive or palm oil (small amount)",
        "Smoked fish (optional)"
      ],
      localMarkets: ["Ikeja Market", "Agege Market"],
      healthBenefits: "Fibre-rich plantain and garden egg support digestion and lasting satiety",
      isFavorite: false,
    },
    {
      id: "12",
      name: "Nkwobi (Lean, Lightly Spiced)",
      image: "🍖",
      category: "snack",
      prepTime: 20,
      cookTime: 40,
      servings: 4,
      difficulty: "medium",
      calories: 300,
      protein: 30,
      carbs: 6,
      fats: 18,
      rating: 4.5,
      reviews: 0,
      tags: ["high-protein", "low-sodium"],
      ingredients: [
        "Cleaned lean cow foot",
        "Ehu seeds",
        "Palm oil paste (moderate)",
        "Utazi leaves",
        "Onions",
        "Fresh pepper"
      ],
      localMarkets: ["Nkwo Market", "Ariaria Market"],
      healthBenefits: "Collagen-rich protein; serve a small portion and skip added salt for a heart-smart treat",
      isFavorite: false,
    },
    {
      id: "13",
      name: "Unripe Plantain Porridge",
      image: "🍲",
      category: "lunch",
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: "easy",
      calories: 320,
      protein: 16,
      carbs: 46,
      fats: 9,
      rating: 4.7,
      reviews: 0,
      tags: ["diabetic-friendly", "heart-healthy", "weight-loss"],
      ingredients: [
        "3 unripe plantains",
        "Ugu or spinach",
        "Smoked fish or lean chicken",
        "Palm oil (small amount)",
        "Crayfish",
        "Fresh pepper & onions"
      ],
      localMarkets: ["Mile 12 Market", "Oyingbo Market"],
      healthBenefits: "Unripe plantain is low-GI and rich in resistant starch — excellent for managing diabetes",
      isFavorite: false,
    },
    {
      id: "14",
      name: "Abacha (African Salad)",
      image: "🥗",
      category: "snack",
      prepTime: 25,
      cookTime: 5,
      servings: 4,
      difficulty: "easy",
      calories: 290,
      protein: 12,
      carbs: 34,
      fats: 12,
      rating: 4.4,
      reviews: 0,
      tags: ["heart-healthy"],
      ingredients: [
        "Dried shredded cassava (abacha)",
        "Ugba (oil bean)",
        "Garden egg leaves",
        "Palm oil paste (with akanwu)",
        "Smoked fish",
        "Onions & pepper"
      ],
      localMarkets: ["Nkwo Nnewi Market", "Ariaria Market"],
      healthBenefits: "A lighter, fibre-forward small chop when portioned and served with plenty of greens",
      isFavorite: false,
    },
    {
      id: "15",
      name: "Beans & Sweet Potato Pottage",
      image: "🍠",
      category: "lunch",
      prepTime: 15,
      cookTime: 50,
      servings: 5,
      difficulty: "easy",
      calories: 350,
      protein: 17,
      carbs: 54,
      fats: 8,
      rating: 4.6,
      reviews: 0,
      tags: ["high-protein", "diabetic-friendly", "weight-loss"],
      ingredients: [
        "2 cups beans",
        "2 sweet potatoes",
        "Tomatoes & pepper",
        "Onions",
        "Palm oil (small amount)",
        "Crayfish & smoked fish"
      ],
      localMarkets: ["Ketu Market", "Mile 12 Market"],
      healthBenefits: "Beans plus sweet potato give protein, fibre and slow-release energy",
      isFavorite: false,
    },
    {
      id: "16",
      name: "Suya (Lean Beef Skewers)",
      image: "🍢",
      category: "snack",
      prepTime: 20,
      cookTime: 15,
      servings: 4,
      difficulty: "medium",
      calories: 250,
      protein: 34,
      carbs: 6,
      fats: 10,
      rating: 4.9,
      reviews: 0,
      tags: ["high-protein", "low-sodium"],
      ingredients: [
        "500g lean beef",
        "Yaji (suya spice)",
        "Groundnut (peanut) powder",
        "Onions, tomatoes & cabbage (garnish)",
        "Light brush of vegetable oil"
      ],
      localMarkets: ["Sabo Market", "Wuse Market"],
      healthBenefits: "Grilled lean protein with peanut-based spice — high protein and low carb",
      isFavorite: false,
    },
    {
      id: "17",
      name: "Zobo (Unsweetened Hibiscus Drink)",
      image: "🧃",
      category: "snack",
      prepTime: 10,
      cookTime: 20,
      servings: 6,
      difficulty: "easy",
      calories: 45,
      protein: 1,
      carbs: 10,
      fats: 0,
      rating: 4.5,
      reviews: 0,
      tags: ["heart-healthy", "weight-loss", "diabetic-friendly"],
      ingredients: [
        "Dried hibiscus (zobo) leaves",
        "Ginger & cloves",
        "Pineapple peel (for natural sweetness)",
        "Cucumber (optional)",
        "No added sugar"
      ],
      localMarkets: ["Any local market", "Sabo Market"],
      healthBenefits: "Hibiscus may help lower blood pressure; keep it unsweetened to stay diabetes-friendly",
      isFavorite: false,
    },
  ]);

  // Load this account's saved favorites and apply them to the recipe list.
  useEffect(() => {
    getCollection('recipeFavorites')
      .then((items) => {
        const favIds = new Set((Array.isArray(items) ? items : []).map((i: any) => i.id));
        setRecipes((prev) => prev.map((r) => ({ ...r, isFavorite: favIds.has(r.id) })));
      })
      .catch((e) => console.error('Failed to load recipe favorites', e));
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = async (id: string) => {
    const willFavorite = !recipes.find((r) => r.id === id)?.isFavorite;
    setRecipes(recipes.map(r => r.id === id ? { ...r, isFavorite: willFavorite } : r));
    try {
      if (willFavorite) await createCollectionItem('recipeFavorites', { id });
      else await deleteCollectionItem('recipeFavorites', id);
    } catch (e) { console.error('Failed to update favorite', e); }
  };

  const difficultyColors = {
    easy: "text-green-600 bg-green-50",
    medium: "text-yellow-600 bg-yellow-50",
    hard: "text-red-600 bg-red-50",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl text-white mb-1">{t("recipe.title")}</h1>
            <p className="text-white/80 text-sm">{t("recipe.subtitle")}</p>
          </div>
          <ProfilePictureUpload />
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t("recipe.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Location Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
          <div className="flex items-center justify-center gap-2 text-white">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{selectedLocation.flag} {selectedLocation.displayName}</span>
          </div>
          <p className="text-xs text-white/70 text-center mt-1">
            {getRegionalKey() === "lagos" ? t("recipe.localRecipes") : t("recipe.diaspora")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {(["all", "breakfast", "lunch", "dinner", "snack"] as RecipeCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-md"
                  : "bg-white text-gray-700 shadow-sm hover:shadow-md"
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Location Selector */}
        <div className="mb-4">
          <LocationSelector />
        </div>

        {/* Recipe Cards */}
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Recipe Header */}
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-gradient-to-br from-[#E8F5F5] to-[#B8E5E5] rounded-2xl p-3 text-3xl flex-shrink-0">
                    {recipe.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg text-gray-800 flex-1 min-w-0 break-words">{recipe.name}</h3>
                      <button
                        onClick={() => toggleFavorite(recipe.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      >
                        <Heart
                          className={`h-6 w-6 ${recipe.isFavorite ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-700">{recipe.rating}</span>
                        <span className="text-xs text-gray-500">({recipe.reviews})</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${difficultyColors[recipe.difficulty]}`}
                      >
                        {diffLabel(recipe.difficulty)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.prepTime + recipe.cookTime}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {recipe.calories} {t("recipe.calUnit")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-blue-50 rounded-xl p-2 text-center">
                    <p className="text-sm text-blue-600 mb-1">{recipe.protein}g</p>
                    <p className="text-xs text-gray-600">{t("mealview.protein")}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2 text-center">
                    <p className="text-sm text-orange-600 mb-1">{recipe.carbs}g</p>
                    <p className="text-xs text-gray-600">{t("mealview.carbs")}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2 text-center">
                    <p className="text-sm text-red-600 mb-1">{recipe.fats}g</p>
                    <p className="text-xs text-gray-600">{t("mealview.fats")}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                    >
                      {tagLabel(tag)}
                    </span>
                  ))}
                </div>

                {/* Health Benefits - Simple Mode */}
                {mode === "simple" && (
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Leaf className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{recipe.healthBenefits}</p>
                    </div>
                  </div>
                )}

                {/* Expert Mode - Additional Details */}
                {mode === "expert" && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-3 mb-4">
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t("recipe.glycemicLoad")}</span>
                        <span className="text-gray-800 font-medium">{t("recipe.levelMedium")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t("logs.pcfRatio")}</span>
                        <span className="text-gray-800 font-medium">
                          {Math.round((recipe.protein * 4 / recipe.calories) * 100)}:
                          {Math.round((recipe.carbs * 4 / recipe.calories) * 100)}:
                          {Math.round((recipe.fats * 9 / recipe.calories) * 100)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t("recipe.bestTime")}</span>
                        <span className="text-gray-800 font-medium">
                          {recipe.category === "breakfast" ? "6-9am" : recipe.category === "lunch" ? "12-2pm" : "6-8pm"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Local Markets */}
                {recipe.localMarkets && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <p className="text-xs text-gray-700">{t("recipe.whereToBuy")} ({selectedLocation.name})</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recipe.localMarkets.map((market) => (
                        <span
                          key={market}
                          className="px-2 py-1 bg-white rounded-lg text-xs text-gray-700"
                        >
                          {market}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Recipe Button */}
                <button
                  onClick={() => setSelectedRecipe(recipe)}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{t("recipe.viewFull")}</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredRecipes.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <MascotEmptyState
              title={t("recipe.noResultsTitle")}
              subtitle={t("recipe.noResultsSubtitle")}
            />
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-br from-yellow-50 to-white rounded-3xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-gray-800 mb-2">{t("recipe.chefTip")}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {mode === "simple"
                  ? t("recipe.tipSimple")
                  : t("recipe.tipExpert")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Recipe Modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#E8F5F5] to-[#B8E5E5] rounded-2xl p-3 text-3xl">
                    {selectedRecipe.image}
                  </div>
                  <div>
                    <h2 className="text-xl text-gray-800 mb-1">{selectedRecipe.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{t("recipe.prep")} {selectedRecipe.prepTime}m | {t("recipe.cook")} {selectedRecipe.cookTime}m</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-lg text-gray-800 mb-3">{t("mealview.ingredients")}</h3>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-[#1f7a8c]" />
                      <span className="text-sm text-gray-700">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3 hover:shadow-lg transition-all">
                  {t("recipe.startCooking")}
                </button>
                <button className="bg-white border-2 border-[#1f7a8c] text-[#1f7a8c] rounded-2xl py-3 hover:shadow-lg transition-all">
                  {t("recipe.addToPlan")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
