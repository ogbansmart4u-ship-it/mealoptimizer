import { useState } from "react";
import { MapPin, Sparkles, TrendingUp, ChevronRight, X, Camera, Upload } from "lucide-react";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import CameraCapture from "./CameraCapture";
import { toast } from "sonner";
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

export default function LocalFoodScanner({ isOpen, onClose }: LocalFoodScannerProps) {
  const { selectedLocation } = useLocation();
  const { profile } = useUser();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // data URL held until Analyze clicked
  const [foodData, setFoodData] = useState<LocalFoodData | null>(null);
  const [activeTab, setActiveTab] = useState("traditional");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

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
              <h2 className="text-xl font-semibold text-white">Local Food Engineer</h2>
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
          /* Loading state */
          <div className="flex flex-col items-center justify-center py-20 px-6 gap-4">
            <div className="w-16 h-16 border-4 border-[#1f7a8c] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#1f7a8c] text-lg font-medium">Analysing your food...</p>
            <p className="text-gray-500 text-sm text-center">AI is identifying nutrients and health insights</p>
          </div>
        ) : capturedImage && !foodData ? (
          /* Step 2 — preview + Analyze button */
          <div className="p-6 flex flex-col items-center gap-5">
            <p className="text-gray-600 text-center text-sm">Ready to analyse. Tap the button below.</p>
            <img
              src={capturedImage}
              alt="Food to analyse"
              className="w-full max-h-64 object-cover rounded-2xl shadow-md border border-gray-200"
            />
            {analyzeError && (
              <p className="text-red-600 text-sm text-center bg-red-50 rounded-xl px-4 py-3 w-full">{analyzeError}</p>
            )}
            <button
              onClick={handleAnalyze}
              className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Sparkles className="inline h-5 w-5 mr-2 -mt-0.5" />
              Analyse Food
            </button>
            <button
              onClick={() => { setCapturedImage(null); setAnalyzeError(null); }}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
            >
              Choose Different Image
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
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setFoodData(null); setCapturedImage(null); setAnalyzeError(null); }}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Scan Another
              </button>
              <button
                onClick={() => {
                  toast.success("Saved to meal log!");
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              >
                Save to Log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
