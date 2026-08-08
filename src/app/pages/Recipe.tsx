import { useState, useEffect } from "react";
import { ChefHat, Search, Filter, Heart, Clock, Flame, Users, ChevronRight, Star, Bookmark, MapPin, ShoppingCart, AlertCircle, Leaf, Globe } from "lucide-react";
import { getCollection, createCollectionItem, deleteCollectionItem } from "../../lib/api";
import BottomNav from "../components/BottomNav";
import MascotEmptyState from "../components/MascotEmptyState";
import { useAppMode } from "../contexts/AppModeContext";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
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
            <h1 className="text-3xl text-white mb-1">Recipes</h1>
            <p className="text-white/80 text-sm">Culturally relevant & healthy</p>
          </div>
          <ProfilePictureUpload />
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search recipes..."
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
            {getRegionalKey() === "lagos" ? "Local Nigerian recipes" : "Adapted for diaspora"}
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
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                        {recipe.difficulty}
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
                        {recipe.calories} cal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-blue-50 rounded-xl p-2 text-center">
                    <p className="text-sm text-blue-600 mb-1">{recipe.protein}g</p>
                    <p className="text-xs text-gray-600">Protein</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2 text-center">
                    <p className="text-sm text-orange-600 mb-1">{recipe.carbs}g</p>
                    <p className="text-xs text-gray-600">Carbs</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-2 text-center">
                    <p className="text-sm text-red-600 mb-1">{recipe.fats}g</p>
                    <p className="text-xs text-gray-600">Fats</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs"
                    >
                      {tag.replace("-", " ")}
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
                        <span className="text-gray-600">Glycemic Load</span>
                        <span className="text-gray-800 font-medium">Medium</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">P/C/F Ratio</span>
                        <span className="text-gray-800 font-medium">
                          {Math.round((recipe.protein * 4 / recipe.calories) * 100)}:
                          {Math.round((recipe.carbs * 4 / recipe.calories) * 100)}:
                          {Math.round((recipe.fats * 9 / recipe.calories) * 100)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Best Time</span>
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
                      <p className="text-xs text-gray-700">Where to Buy ({selectedLocation.name})</p>
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
                  <span>View Full Recipe</span>
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
              title="No Recipes Found"
              subtitle="Try adjusting your search or filters"
            />
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-br from-yellow-50 to-white rounded-3xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-gray-800 mb-2">Chef's Tip</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {mode === "simple"
                  ? "Prep your ingredients on Sunday for quick weekday cooking!"
                  : "Batch cooking on Sundays optimizes time management. Cook 2-3 recipes and portion for weekly macronutrient targets."}
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
                      <span>Prep: {selectedRecipe.prepTime}m | Cook: {selectedRecipe.cookTime}m</span>
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
                <h3 className="text-lg text-gray-800 mb-3">Ingredients</h3>
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
                  Start Cooking
                </button>
                <button className="bg-white border-2 border-[#1f7a8c] text-[#1f7a8c] rounded-2xl py-3 hover:shadow-lg transition-all">
                  Add to Meal Plan
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
