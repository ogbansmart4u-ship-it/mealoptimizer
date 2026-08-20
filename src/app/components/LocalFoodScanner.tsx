import { useState, useEffect } from "react";
import { MapPin, Sparkles, TrendingUp, ChevronRight, X, Camera, Upload, ScanBarcode, CheckCircle2, AlertTriangle, Ban, Lightbulb, Share2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import CameraCapture from "./CameraCapture";
import FixMyPlateModal from "./FixMyPlateModal";
import FoodScanningSkeleton from "./FoodScanningSkeleton";
import ViralMealCardModal from "./ViralMealCardModal";
import { createMealLog, getCollection } from "../../lib/api";
import { computeVerdict } from "../../lib/conditionVerdict";
import { toast } from "sonner";
import { celebrate } from "./celebrate";
import { projectId } from '/utils/supabase/info';
import { getAccessToken } from '../../lib/supabase';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45`;

type LocalFoodData = {
  dishName: string;
  region: string;
  description: string;
  traditionalPrep: {
    method: string;
    cookTime: string;
    difficulty: string;
    culturalNote: string;
  };
  engineerSwap: {
    original: string[];
    healthySwap: string[];
    reasoning: string;
    impactStatement: string;
  };
  macroBreakdown: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    glycemicLoad: "Low" | "Medium" | "High";
    swapComparison: {
      caloriesSaved: number;
      sugarReduced: number;
      fiberAdded: number;
    };
  };
};

// Mock regional food database
const mockFoodDatabase: Record<string, LocalFoodData[]> = {
  Nigeria: [
    {
      dishName: "Jollof Rice with Chicken",
      region: "Nigeria (Lagos)",
      description: "West African one-pot rice dish cooked in a flavorful tomato-based sauce with spices and chicken.",
      traditionalPrep: {
        method: "White rice cooked in tomato paste, vegetable oil, onions, scotch bonnet pepper, and seasoning cubes. Chicken is usually fried separately.",
        cookTime: "45-60 minutes",
        difficulty: "Medium",
        culturalNote: "A staple at celebrations and gatherings across West Africa. Every family has their secret spice blend!",
      },
      engineerSwap: {
        original: [
          "2 cups white rice",
          "1/2 cup vegetable oil",
          "3 seasoning cubes",
          "1/4 cup tomato paste",
        ],
        healthySwap: [
          "2 cups brown basmati rice (lower GI)",
          "2 tbsp olive oil + vegetable stock",
          "Fresh herbs: thyme, bay leaf, garlic",
          "2 fresh tomatoes + 2 tbsp paste",
        ],
        reasoning: "Brown rice provides fiber and slows glucose absorption. Reducing oil cuts empty calories. Fresh herbs replace MSG-heavy cubes.",
        impactStatement: "🎯 This swap reduces glycemic load by 40% while keeping authentic flavor!",
      },
      macroBreakdown: {
        calories: 520,
        protein: 35,
        carbs: 58,
        fats: 18,
        fiber: 3,
        glycemicLoad: "High",
        swapComparison: {
          caloriesSaved: 180,
          sugarReduced: 12,
          fiberAdded: 4,
        },
      },
    },
    {
      dishName: "Pounded Yam & Egusi Soup",
      region: "Nigeria",
      description: "Starchy pounded yam served with melon seed soup containing leafy greens and protein.",
      traditionalPrep: {
        method: "Boiled yam pounded until smooth. Egusi seeds ground and cooked with palm oil, crayfish, stockfish, spinach, and beef.",
        cookTime: "90 minutes",
        difficulty: "Hard",
        culturalNote: "A labor of love! Traditional preparation involves pounding yam in a wooden mortar. The soup is rich with nutrients from local greens.",
      },
      engineerSwap: {
        original: [
          "4 cups pounded yam",
          "1/2 cup palm oil",
          "Beef + stockfish",
          "Egusi seeds (ground)",
        ],
        healthySwap: [
          "2 cups pounded yam + 2 cups cauliflower mash",
          "3 tbsp palm oil",
          "Lean beef + fresh fish + extra ugu leaves",
          "Egusi seeds + ground pumpkin seeds",
        ],
        reasoning: "Cauliflower reduces carb load. Extra greens boost micronutrients. Pumpkin seeds add protein and zinc.",
        impactStatement: "💪 Engineer's Note: This keeps cultural authenticity while cutting carbs by 50%!",
      },
      macroBreakdown: {
        calories: 680,
        protein: 42,
        carbs: 75,
        fats: 28,
        fiber: 8,
        glycemicLoad: "High",
        swapComparison: {
          caloriesSaved: 240,
          sugarReduced: 0,
          fiberAdded: 6,
        },
      },
    },
    {
      dishName: "Nigerian Fried Rice",
      region: "Nigeria",
      description: "Colourful party rice stir-fried with mixed vegetables, liver and shrimp.",
      traditionalPrep: {
        method: "White long-grain rice parboiled, then stir-fried in vegetable oil with curry, mixed vegetables, liver and shrimp.",
        cookTime: "45 minutes",
        difficulty: "Medium",
        culturalNote: "A celebration staple — no Nigerian party plate feels complete without a scoop of fried rice.",
      },
      engineerSwap: {
        original: [
          "3 cups white rice",
          "1/3 cup vegetable oil",
          "2 seasoning cubes",
          "Liver & sausage",
        ],
        healthySwap: [
          "2 cups brown rice + 1 cup cauliflower rice",
          "2 tbsp olive oil",
          "Herbs, garlic & ginger",
          "Grilled chicken & extra vegetables",
        ],
        reasoning: "Brown and cauliflower rice cut the glycemic load while extra vegetables add fibre. Lean grilled protein replaces fatty liver and sausage.",
        impactStatement: "🎯 Lowers glycemic load by ~35% and adds 5g fibre while keeping the party flavour!",
      },
      macroBreakdown: {
        calories: 480,
        protein: 24,
        carbs: 62,
        fats: 16,
        fiber: 4,
        glycemicLoad: "High",
        swapComparison: {
          caloriesSaved: 170,
          sugarReduced: 8,
          fiberAdded: 5,
        },
      },
    },
    {
      dishName: "Amala & Ewedu with Gbegiri",
      region: "Nigeria (South-West)",
      description: "Smooth yam-flour swallow served with jute-leaf (ewedu) and bean (gbegiri) soups.",
      traditionalPrep: {
        method: "Yam flour stirred in hot water into a smooth swallow, served with ewedu, gbegiri and assorted meat in stew.",
        cookTime: "60 minutes",
        difficulty: "Medium",
        culturalNote: "A beloved Yoruba combo — 'abula' is the mix of ewedu, gbegiri and stew poured together.",
      },
      engineerSwap: {
        original: [
          "4 wraps amala",
          "Assorted fatty meat (ponmo, shaki)",
          "Palm-oil-rich stew",
        ],
        healthySwap: [
          "2 wraps amala + extra ewedu",
          "Lean beef & fish",
          "Moderate palm oil, more pepper & tomato",
        ],
        reasoning: "Halving the swallow and doubling the fibre-rich ewedu steadies blood sugar; lean cuts trim saturated fat.",
        impactStatement: "💪 Keeps the abula authentic while cutting refined carbs by ~45%!",
      },
      macroBreakdown: {
        calories: 520,
        protein: 30,
        carbs: 68,
        fats: 18,
        fiber: 7,
        glycemicLoad: "High",
        swapComparison: {
          caloriesSaved: 200,
          sugarReduced: 0,
          fiberAdded: 6,
        },
      },
    },
    {
      dishName: "Suya (Beef Skewers)",
      region: "Nigeria (Northern)",
      description: "Spicy grilled beef skewers coated in yaji, a groundnut-based spice blend.",
      traditionalPrep: {
        method: "Thin beef strips threaded on sticks, brushed with oil, coated in yaji and grilled over an open flame.",
        cookTime: "20 minutes",
        difficulty: "Easy",
        culturalNote: "A night-market classic — every mai suya guards a secret yaji blend.",
      },
      engineerSwap: {
        original: [
          "Fatty beef cuts",
          "Extra oil brushing",
          "Heavy salt in yaji",
        ],
        healthySwap: [
          "Lean beef or chicken breast",
          "Light oil brush",
          "Yaji with less salt, more groundnut & ginger",
        ],
        reasoning: "Lean cuts and lighter oil reduce saturated fat; trimming salt supports blood pressure while the peanut spice keeps the flavour.",
        impactStatement: "🎯 High-protein and low-carb — a smart pick that keeps sodium in check!",
      },
      macroBreakdown: {
        calories: 260,
        protein: 32,
        carbs: 6,
        fats: 12,
        fiber: 1,
        glycemicLoad: "Low",
        swapComparison: {
          caloriesSaved: 90,
          sugarReduced: 0,
          fiberAdded: 1,
        },
      },
    },
    {
      dishName: "Akara (Bean Cakes)",
      region: "Nigeria",
      description: "Fluffy deep-fried fritters of blended peeled beans, onion and pepper.",
      traditionalPrep: {
        method: "Peeled beans blended with onion and pepper into a batter, whipped for air, then deep-fried in hot oil.",
        cookTime: "30 minutes",
        difficulty: "Medium",
        culturalNote: "A breakfast favourite, often paired with pap (ogi) or fresh bread.",
      },
      engineerSwap: {
        original: [
          "Deep-fried in 2 cups oil",
          "Served with sugary pap",
        ],
        healthySwap: [
          "Air-fried or shallow-fried in 2 tbsp oil",
          "Served with unsweetened pap or moi moi",
        ],
        reasoning: "Air-frying slashes the oil the beans soak up while keeping the protein and fibre; skipping added sugar steadies blood glucose.",
        impactStatement: "💪 Cuts frying oil by ~70% and keeps the plant protein intact!",
      },
      macroBreakdown: {
        calories: 190,
        protein: 12,
        carbs: 18,
        fats: 8,
        fiber: 5,
        glycemicLoad: "Medium",
        swapComparison: {
          caloriesSaved: 130,
          sugarReduced: 6,
          fiberAdded: 2,
        },
      },
    },
    {
      dishName: "Catfish Pepper Soup",
      region: "Nigeria",
      description: "Light, spicy broth of fresh catfish simmered with pepper-soup spices.",
      traditionalPrep: {
        method: "Catfish simmered with scent leaves, uziza, chilli and pepper-soup spice until fragrant.",
        cookTime: "30 minutes",
        difficulty: "Easy",
        culturalNote: "A comfort dish and reputed cold remedy — served bubbling hot.",
      },
      engineerSwap: {
        original: [
          "2 seasoning cubes",
          "Added salt",
        ],
        healthySwap: [
          "Fresh herbs, ginger & garlic",
          "Little or no added salt",
        ],
        reasoning: "Anti-inflammatory spices carry the flavour so you need far less salt — ideal for hypertension and low-carb goals.",
        impactStatement: "🎯 Naturally low-carb, low-calorie and packed with lean protein!",
      },
      macroBreakdown: {
        calories: 220,
        protein: 30,
        carbs: 6,
        fats: 9,
        fiber: 1,
        glycemicLoad: "Low",
        swapComparison: {
          caloriesSaved: 60,
          sugarReduced: 0,
          fiberAdded: 0,
        },
      },
    },
    {
      dishName: "Ewa Agoyin & Dodo",
      region: "Nigeria (Lagos)",
      description: "Mashed honey beans with a smoky pepper sauce, served with fried plantain (dodo).",
      traditionalPrep: {
        method: "Beans boiled soft and mashed, topped with a fried-pepper (agoyin) sauce; plantain sliced and deep-fried.",
        cookTime: "75 minutes",
        difficulty: "Medium",
        culturalNote: "A Lagos street-food icon — the agoyin sauce sellers are legendary.",
      },
      engineerSwap: {
        original: [
          "Deep-fried plantain",
          "Palm-oil-heavy agoyin sauce",
        ],
        healthySwap: [
          "Boiled or oven-baked plantain",
          "Moderate palm oil, more pepper & onion",
        ],
        reasoning: "Baking instead of frying the plantain cuts absorbed oil; the beans already deliver slow-release energy and fibre.",
        impactStatement: "💪 Keeps the beans-and-plantain combo while cutting frying oil by ~60%!",
      },
      macroBreakdown: {
        calories: 430,
        protein: 17,
        carbs: 62,
        fats: 12,
        fiber: 9,
        glycemicLoad: "Medium",
        swapComparison: {
          caloriesSaved: 160,
          sugarReduced: 5,
          fiberAdded: 3,
        },
      },
    },
    {
      dishName: "Efo Riro (Vegetable Soup)",
      region: "Nigeria (South-West)",
      description: "Rich stewed spinach/ugu with peppers, locust beans, assorted meat and fish.",
      traditionalPrep: {
        method: "Leafy greens stir-cooked with blended pepper, locust beans, palm oil, crayfish and assorted protein.",
        cookTime: "40 minutes",
        difficulty: "Medium",
        culturalNote: "A staple beside any swallow — 'efo' means leafy vegetable in Yoruba.",
      },
      engineerSwap: {
        original: [
          "Generous palm oil",
          "Assorted fatty meat & ponmo",
        ],
        healthySwap: [
          "Moderate palm oil",
          "Lean beef, fish & extra ugu leaves",
        ],
        reasoning: "Trimming oil and fatty offal while loading more greens boosts iron, folate and fibre with less saturated fat.",
        impactStatement: "🎯 Nutrient-dense and low-carb — perfect beside a smaller portion of swallow!",
      },
      macroBreakdown: {
        calories: 300,
        protein: 26,
        carbs: 12,
        fats: 19,
        fiber: 6,
        glycemicLoad: "Low",
        swapComparison: {
          caloriesSaved: 110,
          sugarReduced: 0,
          fiberAdded: 4,
        },
      },
    },
    {
      dishName: "Okpa (Bambara Nut Pudding)",
      region: "Nigeria (South-East)",
      description: "Steamed savoury pudding of Bambara groundnut flour, palm oil and pepper.",
      traditionalPrep: {
        method: "Bambara nut flour whisked with water, palm oil, pepper and seasoning, then steamed in leaves until set.",
        cookTime: "50 minutes",
        difficulty: "Easy",
        culturalNote: "An Enugu breakfast favourite — 'Okpa di oku!' is the classic morning street cry.",
      },
      engineerSwap: {
        original: [
          "Generous palm oil",
          "Extra seasoning cubes",
        ],
        healthySwap: [
          "Moderate palm oil",
          "Herbs, less salt & added vegetables",
        ],
        reasoning: "Bambara nut is naturally high in plant protein and fibre; steaming rather than frying keeps it light while less oil trims calories.",
        impactStatement: "💪 A high-protein, high-fibre breakfast with a low glycemic load!",
      },
      macroBreakdown: {
        calories: 320,
        protein: 18,
        carbs: 34,
        fats: 13,
        fiber: 8,
        glycemicLoad: "Low",
        swapComparison: {
          caloriesSaved: 90,
          sugarReduced: 0,
          fiberAdded: 3,
        },
      },
    },
  ],
  "United Kingdom": [
    {
      dishName: "Fish & Chips",
      region: "United Kingdom (London)",
      description: "Battered deep-fried fish served with thick-cut fried potatoes.",
      traditionalPrep: {
        method: "Cod or haddock coated in beer batter, deep-fried until golden. Chips are double-fried for crispiness.",
        cookTime: "30 minutes",
        difficulty: "Medium",
        culturalNote: "A British classic since the 1860s. Traditionally wrapped in newspaper and served with salt and vinegar!",
      },
      engineerSwap: {
        original: [
          "Cod in beer batter",
          "Russet potatoes (deep-fried)",
          "Tartar sauce (mayo-based)",
        ],
        healthySwap: [
          "Cod in panko crust (oven-baked)",
          "Sweet potato wedges (air-fried)",
          "Greek yogurt tartar sauce",
        ],
        reasoning: "Baking reduces oil absorption by 70%. Sweet potatoes add beta-carotene. Greek yogurt cuts saturated fat.",
        impactStatement: "🔥 Engineer's hack: Baking saves 400 calories while keeping crunch!",
      },
      macroBreakdown: {
        calories: 850,
        protein: 38,
        carbs: 92,
        fats: 42,
        fiber: 5,
        glycemicLoad: "High",
        swapComparison: {
          caloriesSaved: 420,
          sugarReduced: 8,
          fiberAdded: 3,
        },
      },
    },
  ],
};

type LocalFoodScannerProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Visual styling for the personal verdict card, keyed by verdict level.
const VERDICT_UI = {
  good: { wrap: "bg-green-50 border-green-400", icon: "text-green-600", title: "text-green-700", dot: "text-green-500", chip: "bg-green-100 text-green-700", Icon: CheckCircle2, label: "Good" },
  caution: { wrap: "bg-amber-50 border-amber-400", icon: "text-amber-600", title: "text-amber-800", dot: "text-amber-500", chip: "bg-amber-100 text-amber-800", Icon: AlertTriangle, label: "Care" },
  avoid: { wrap: "bg-red-50 border-red-400", icon: "text-red-600", title: "text-red-700", dot: "text-red-500", chip: "bg-red-100 text-red-700", Icon: Ban, label: "Avoid" },
} as const;

export default function LocalFoodScanner({ isOpen, onClose }: LocalFoodScannerProps) {
  const navigate = useNavigate();
  const { selectedLocation } = useLocation();
  const { profile } = useUser();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // data URL held until Analyze clicked
  const [foodData, setFoodData] = useState<LocalFoodData | null>(null);
  const [activeTab, setActiveTab] = useState("traditional");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [showViralShareModal, setShowViralShareModal] = useState(false);
  const [conditions, setConditions] = useState<{ name: string; severity?: string }[]>([]);

  // Load the user's medical conditions so every result gets a personal verdict.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    getCollection("conditions")
      .then((items: any[]) => {
        if (cancelled) return;
        const list = Array.isArray(items)
          ? items.map((it) => ({ name: it?.name ?? "", severity: it?.severity })).filter((c) => c.name)
          : [];
        // Fall back to the single profile condition if the collection is empty.
        if (list.length === 0 && profile?.medicalCondition && !["", "none", "None"].includes(profile.medicalCondition)) {
          list.push({ name: profile.medicalCondition });
        }
        setConditions(list);
      })
      .catch(() => {
        if (cancelled) return;
        if (profile?.medicalCondition && !["", "none", "None"].includes(profile.medicalCondition)) {
          setConditions([{ name: profile.medicalCondition }]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, profile?.medicalCondition]);

  // Personal "Is this good for ME?" verdict, recomputed whenever a result loads.
  const verdict = foodData ? computeVerdict(foodData.macroBreakdown, conditions) : null;

  // Save the analysed dish into the user's meal log (real persistence)
  const handleSaveToLog = async () => {
    if (!foodData || isSaving) return;
    setIsSaving(true);

    const now = new Date();
    const hour = now.getHours();
    const mealType =
      hour < 11 ? "breakfast" : hour < 16 ? "lunch" : hour < 21 ? "dinner" : "snack";
    const gl = foodData.macroBreakdown.glycemicLoad;
    const bloodSugarImpact = gl === "Low" ? "low" : gl === "High" ? "high" : "medium";

    const logData = {
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      mealType,
      foodName: foodData.dishName,
      calories: foodData.macroBreakdown.calories,
      protein: foodData.macroBreakdown.protein,
      carbs: foodData.macroBreakdown.carbs,
      fats: foodData.macroBreakdown.fats,
      energyRating: 3,
      digestiveComfort: 3,
      bloodSugarImpact,
    };

    try {
      await createMealLog(logData);
      celebrate(`${foodData.dishName} logged! 🍲🎉`, "Macros & nutrition updated.", { confettiStyle: "burst", hapticPattern: "success" });
      onClose();
    } catch (err: any) {
      // Fallback: persist locally so the log still updates offline
      try {
        const existing = JSON.parse(localStorage.getItem("mealLogs") || "[]");
        existing.push({ id: `local-${now.getTime()}`, ...logData });
        localStorage.setItem("mealLogs", JSON.stringify(existing));
        celebrate(`${foodData.dishName} logged! 🍲🎉`, "Saved offline. Macros updated.", { confettiStyle: "burst", hapticPattern: "success" });
        onClose();
      } catch {
        toast.error("Could not save", { description: err?.message || "Please try again" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1 — store the image, show preview + Analyze button
  const handleImageCaptured = (imageData: string) => {
    setShowCamera(false);
    setCapturedImage(imageData);
    setAnalyzeError(null);
  };

  // Step 2 — Analyze button onClick: POST to backend
  const handleAnalyze = async () => {
    console.log('[LocalFoodScanner] handleAnalyze fired, capturedImage length:', capturedImage?.length);
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const token = await getAccessToken();
      console.log('[LocalFoodScanner] auth token obtained:', !!token);
      if (!token) throw new Error('Not authenticated — please log in again');

      // Strip data URL prefix to get raw base64
      const base64 = capturedImage.replace(/^data:[^;]+;base64,/, '');
      console.log('[LocalFoodScanner] base64 length:', base64.length);

      const requestBody = {
        imageBase64: base64,
        userContext: {
          medicalCondition: profile?.medicalCondition || 'None',
          age: profile?.age || 'Not specified',
          bmi: profile?.bmi || 'Not specified',
          location: selectedLocation.displayName || 'Nigeria',
        },
      };
      console.log('[LocalFoodScanner] POSTing to', `${API_BASE_URL}/ai/analyze-food`);

      const response = await fetch(`${API_BASE_URL}/ai/analyze-food`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[LocalFoodScanner] response status:', response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.error('[LocalFoodScanner] non-ok response:', errText);
        throw new Error(`Server error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      console.log('[LocalFoodScanner] response data:', data);

      const analysis = data.analysis as Record<string, any>;
      if (!analysis) throw new Error('No analysis field in response');

      const mapped: LocalFoodData = {
        dishName: analysis.foodName || analysis.food_name || 'Analysed Food',
        region: `${selectedLocation.displayName} Cuisine`,
        description: analysis.clinicalIndication || analysis.clinical_indication || analysis.rawText || '',
        traditionalPrep: {
          method: analysis.engineeringMethod || analysis.engineering_method || 'Standard preparation',
          cookTime: '30–45 minutes',
          difficulty: 'Medium',
          culturalNote: `Regional dish from ${selectedLocation.displayName}`,
        },
        engineerSwap: {
          original: ['Standard ingredients'],
          healthySwap: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
          reasoning: analysis.clinicalIndication || '',
          impactStatement: analysis.postPrandialNote || analysis.post_prandial_note || '',
        },
        macroBreakdown: {
          calories: Number(analysis.calories) || 0,
          protein: Number(analysis.protein) || 0,
          carbs: Number(analysis.carbs) || 0,
          fats: Number(analysis.fats) || 0,
          fiber: Number(analysis.fiber) || 0,
          glycemicLoad: (analysis.glycemicLoad as 'Low' | 'Medium' | 'High') || 'Medium',
          swapComparison: { caloriesSaved: 0, sugarReduced: 0, fiberAdded: 0 },
        },
      };

      setCapturedImage(null);
      setFoodData(mapped);

      if (analysis._fallback) {
        toast.info('Nutritional estimate shown', { description: 'AI vision temporarily unavailable' });
      } else {
        toast.success('Food analysed!', { description: `Identified: ${mapped.dishName}` });
      }
    } catch (err: any) {
      console.error('[LocalFoodScanner] analysis failed:', err);
      const msg = err?.message || 'Analysis failed';
      setAnalyzeError(msg);
      toast.error('Analysis failed', { description: msg });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-2xl h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Snap &amp; Know</h2>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{selectedLocation.displayName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {isAnalyzing ? (
          /* Live Biochemical Laser Scanning State with Progressive Badges */
          <div className="py-2">
            <FoodScanningSkeleton imageSrc={capturedImage} />
          </div>
        ) : capturedImage && !foodData ? (
          /* Step 2 — preview + Analyze button */
          <div className="p-5 sm:p-6 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">Plate Photo Ready</span>
              <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                AI Vision Ready
              </span>
            </div>
            <div className="relative w-full rounded-2xl overflow-hidden shadow-md border-2 border-teal-200 dark:border-zinc-700">
              <img
                src={capturedImage}
                alt="Food to analyse"
                className="w-full max-h-64 object-cover"
              />
              <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-white text-[10px] font-bold">
                Tap Scan Below
              </div>
            </div>
            {analyzeError && (
              <p className="text-red-600 text-xs text-center bg-red-50 dark:bg-red-950/40 rounded-xl px-4 py-2.5 w-full border border-red-200 dark:border-red-900">{analyzeError}</p>
            )}
            <button
              onClick={handleAnalyze}
              className="w-full bg-gradient-to-r from-[#1f7a8c] via-[#2a9d8f] to-[#4ecdc4] text-white py-4 rounded-2xl text-base font-extrabold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>Scan Plate &amp; Compute Spike Shield</span>
            </button>
            <button
              onClick={() => { setCapturedImage(null); setAnalyzeError(null); }}
              className="w-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 py-2.5 rounded-2xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Take Different Photo
            </button>
          </div>
        ) : !foodData ? (
          /* Step 1 — upload / camera picker */
          <div className="p-6">
            <p className="text-gray-600 mb-6 text-center">
              Scan or upload a photo of your meal to get region-specific nutritional engineering
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowCamera(true)}
                className="bg-gradient-to-br from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl p-8 flex flex-col items-center gap-3 hover:scale-105 transition-transform shadow-lg"
              >
                <Camera className="h-12 w-12" />
                <span className="font-semibold">Take Photo</span>
              </button>

              <button
                onClick={() => document.getElementById('local-food-upload')?.click()}
                className="bg-gradient-to-br from-[#2a9d8f] to-[#4ecdc4] text-white rounded-2xl p-8 flex flex-col items-center gap-3 hover:scale-105 transition-transform shadow-lg"
              >
                <Upload className="h-12 w-12" />
                <span className="font-semibold">Upload Photo</span>
              </button>
            </div>

            <button
              onClick={() => { onClose(); navigate("/scan-barcode"); }}
              className="mt-4 w-full bg-white border-2 border-[#1f7a8c] text-[#1f7a8c] rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-[#1f7a8c]/5 transition-colors font-semibold"
            >
              <ScanBarcode className="h-6 w-6" />
              <span>Scan a Barcode instead</span>
            </button>

            <input
              id="local-food-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => handleImageCaptured(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />

            <CameraCapture
              isOpen={showCamera}
              onClose={() => setShowCamera(false)}
              onCapture={(imageData) => handleImageCaptured(imageData)}
              mode="food"
              title="Scan Local Food"
            />
          </div>
        ) : (
          /* Food Analysis Results */
          <div className="p-6">
            {/* Personal verdict — "Is this good for ME?" */}
            {verdict && (() => {
              const V = VERDICT_UI[verdict.level];
              const VIcon = V.Icon;
              return (
                <div className={`rounded-2xl p-5 mb-6 border-2 ${V.wrap}`}>
                  <div className="flex items-start gap-3">
                    <VIcon className={`h-9 w-9 shrink-0 ${V.icon}`} strokeWidth={2.2} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] uppercase tracking-wide font-bold text-gray-500">
                        Is this good for me?
                      </div>
                      <h3 className={`text-xl font-bold leading-tight ${V.title}`}>{verdict.title}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{verdict.subtitle}</p>
                    </div>
                  </div>

                  {verdict.reasons.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {verdict.reasons.map((reason, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className={`${V.dot} font-bold`}>•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {verdict.hasConditions && verdict.perCondition.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {verdict.perCondition.map((p, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${VERDICT_UI[p.level].chip}`}
                        >
                          {p.condition}: {VERDICT_UI[p.level].label}
                        </span>
                      ))}
                    </div>
                  )}

                  {verdict.tip && (
                    <div className="mt-3 flex gap-2 items-start bg-white/70 rounded-xl p-3">
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Make it better: </span>
                        {verdict.tip}
                      </p>
                    </div>
                  )}

                  {!verdict.hasConditions && (
                    <button
                      onClick={() => { onClose(); navigate("/medical-condition"); }}
                      className="mt-3 text-sm font-semibold text-[#1f7a8c] hover:underline"
                    >
                      Add your health conditions for a verdict made for you →
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Dish Info */}
            <div className="bg-gradient-to-br from-[#B8E5E5] to-[#E8F5F5] rounded-2xl p-5 mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{foodData.dishName}</h3>
              <p className="text-sm text-gray-700 mb-3">{foodData.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{foodData.region}</span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="traditional">Traditional</TabsTrigger>
                <TabsTrigger value="engineer">Engineer's Tweak</TabsTrigger>
                <TabsTrigger value="macros">Macro Breakdown</TabsTrigger>
              </TabsList>

              {/* Traditional Prep Tab */}
              <TabsContent value="traditional" className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border-2 border-orange-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Traditional Preparation</h4>
                  <p className="text-sm text-gray-700 mb-4">{foodData.traditionalPrep.method}</p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-orange-50 rounded-xl p-3">
                      <div className="text-xs text-gray-600 mb-1">Cook Time</div>
                      <div className="text-sm font-semibold text-gray-800">{foodData.traditionalPrep.cookTime}</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3">
                      <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                      <div className="text-sm font-semibold text-gray-800">{foodData.traditionalPrep.difficulty}</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="text-xs font-semibold text-yellow-800 mb-2">Cultural Note</div>
                    <p className="text-sm text-yellow-900">{foodData.traditionalPrep.culturalNote}</p>
                  </div>
                </div>
              </TabsContent>

              {/* Engineer's Tweak Tab */}
              <TabsContent value="engineer" className="space-y-4">
                <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-5 border-2 border-green-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <h4 className="text-lg font-semibold text-gray-800">Healthy Swaps</h4>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-2">Original Ingredients:</div>
                      <ul className="space-y-1">
                        {foodData.engineerSwap.original.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-red-500">❌</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="my-3 flex justify-center">
                      <ChevronRight className="h-6 w-6 text-green-600 transform rotate-90" />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-600 mb-2">Engineer's Swaps:</div>
                      <ul className="space-y-1">
                        {foodData.engineerSwap.healthySwap.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="text-green-500">✅</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 mb-3">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Why This Works:</div>
                    <p className="text-sm text-gray-700">{foodData.engineerSwap.reasoning}</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl p-4 font-semibold text-sm">
                    {foodData.engineerSwap.impactStatement}
                  </div>
                </div>
              </TabsContent>

              {/* Macro Breakdown Tab */}
              <TabsContent value="macros" className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border-2 border-blue-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Nutritional Analysis</h4>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-1">Calories</div>
                      <div className="text-3xl font-bold text-gray-800">{foodData.macroBreakdown.calories}</div>
                      <div className="text-xs text-gray-500">kcal</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-1">Protein</div>
                      <div className="text-3xl font-bold text-gray-800">{foodData.macroBreakdown.protein}</div>
                      <div className="text-xs text-gray-500">grams</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-1">Carbs</div>
                      <div className="text-3xl font-bold text-gray-800">{foodData.macroBreakdown.carbs}</div>
                      <div className="text-xs text-gray-500">grams</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="text-xs text-gray-600 mb-1">Fats</div>
                      <div className="text-3xl font-bold text-gray-800">{foodData.macroBreakdown.fats}</div>
                      <div className="text-xs text-gray-500">grams</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
                    <span className="text-sm text-gray-700">Fiber</span>
                    <span className="text-lg font-bold text-gray-800">{foodData.macroBreakdown.fiber}g</span>
                  </div>

                  <div className={`rounded-xl p-4 mb-4 ${
                    foodData.macroBreakdown.glycemicLoad === 'Low' ? 'bg-green-100' :
                    foodData.macroBreakdown.glycemicLoad === 'Medium' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <div className="text-xs font-semibold text-gray-600 mb-1">Glycemic Load</div>
                    <div className={`text-lg font-bold ${
                      foodData.macroBreakdown.glycemicLoad === 'Low' ? 'text-green-700' :
                      foodData.macroBreakdown.glycemicLoad === 'Medium' ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                      {foodData.macroBreakdown.glycemicLoad}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
                      <div className="text-sm font-semibold text-gray-800">Impact of Swap</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-bold text-teal-600">-{foodData.macroBreakdown.swapComparison.caloriesSaved}</div>
                        <div className="text-xs text-gray-600">calories</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">-{foodData.macroBreakdown.swapComparison.sugarReduced}g</div>
                        <div className="text-xs text-gray-600">sugar</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">+{foodData.macroBreakdown.swapComparison.fiberAdded}g</div>
                        <div className="text-xs text-gray-600">fiber</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="space-y-2.5 mt-6">
              {/* Viral WhatsApp & IG Story Sharing Button */}
              <button
                onClick={() => setShowViralShareModal(true)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-[#1f7a8c] to-teal-500 hover:from-emerald-600 hover:to-[#176270] text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Share2 size={16} />
                <span>Share Plate Grade to WhatsApp / IG Story 📱</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => { setFoodData(null); setCapturedImage(null); setAnalyzeError(null); }}
                  className="flex-1 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 py-3 rounded-2xl font-bold text-xs hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleSaveToLog}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white py-3 rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? "Saving…" : "Save to Log"}
                </button>
              </div>
            </div>
          </div>
        )}

        {foodData && (
          <FixMyPlateModal
            isOpen={showFixModal}
            onClose={() => setShowFixModal(false)}
            meal={{
              foodName: foodData.dishName,
              calories: foodData.macroBreakdown.calories,
              protein: foodData.macroBreakdown.protein,
              carbs: foodData.macroBreakdown.carbs,
              fats: foodData.macroBreakdown.fats,
              fiber: foodData.macroBreakdown.fiber,
              glycemicLoad: foodData.macroBreakdown.glycemicLoad,
            }}
            onApplyOptimized={(optimized) => {
              setFoodData({
                ...foodData,
                dishName: optimized.foodName,
                macroBreakdown: {
                  ...foodData.macroBreakdown,
                  calories: optimized.calories,
                  protein: optimized.protein,
                  carbs: optimized.carbs,
                  fats: optimized.fats,
                  fiber: optimized.fiber || foodData.macroBreakdown.fiber,
                  glycemicLoad: (optimized.glycemicLoad as 'Low' | 'Medium' | 'High') || 'Low',
                },
              });
              toast.success("Plate optimized with balanced macros!");
            }}
          />
        )}

        {foodData && (
          <ViralMealCardModal
            isOpen={showViralShareModal}
            onClose={() => setShowViralShareModal(false)}
            mealData={{
              dishName: foodData.dishName,
              region: foodData.region,
              calories: foodData.macroBreakdown.calories,
              protein: foodData.macroBreakdown.protein,
              carbs: foodData.macroBreakdown.carbs,
              fats: foodData.macroBreakdown.fats,
              fiber: foodData.macroBreakdown.fiber,
              glycemicLoad: foodData.macroBreakdown.glycemicLoad,
              imageSrc: capturedImage,
              impactStatement: foodData.engineerSwap?.impactStatement,
            }}
          />
        )}
      </div>
    </div>
  );
}
