import { useState, useEffect, useRef } from "react";
import { MapPin, Sparkles, Mic, MicOff, Volume2, TrendingUp, ChevronRight, X, Camera, Upload, ScanBarcode, CheckCircle2, AlertTriangle, Ban, Lightbulb, Share2, ArrowLeft, RefreshCw, BookmarkPlus } from "lucide-react";
import { useNavigate } from "react-router";
import { useLocation } from "../contexts/LocationContext";
import { useUser } from "../contexts/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import FixMyPlateModal from "./FixMyPlateModal";
import FoodScanningSkeleton from "./FoodScanningSkeleton";
import ViralMealCardModal from "./ViralMealCardModal";
import { createMealLog, getCollection } from "../../lib/api";
import { computeVerdict } from "../../lib/conditionVerdict";
import { toast } from "sonner";
import { celebrate, triggerHaptic } from "./celebrate";
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
  const [isSavedToDatabase, setIsSavedToDatabase] = useState(false);
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [conditions, setConditions] = useState<{ name: string; severity?: string }[]>([]);
  const [voiceNote, setVoiceNote] = useState<string>("");
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);

  // Safe haptic feedback trigger
  const safeHaptic = (pattern: "light" | "medium" | "heavy" | "success" | "warning" | "error" = "light") => {
    try {
      triggerHaptic(pattern);
    } catch {}
  };

  // Voice note speech-to-text toggle for meal similarity disambiguation
  const toggleVoiceClarification = () => {
    safeHaptic("medium");
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info("Speech recognition not available on this browser. You can type dish notes directly below!");
      return;
    }

    if (isRecordingVoice) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      setIsRecordingVoice(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        safeHaptic("success");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + " ";
        }
        setVoiceNote(transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition notice:", event.error);
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsRecordingVoice(false);
    }
  };

  // Stop live camera
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  // Start live in-frame camera with multi-platform progressive fallback (Phones, Tablets & PCs)
  const startLiveCamera = async () => {
    safeHaptic("medium");
    let stream: MediaStream | null = null;

    // 1. Try back/environment camera (phones & tablets)
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
    } catch {
      // 2. Try default PC / Laptop webcam
      try {
        console.log("Falling back to standard PC webcam...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err: any) {
        console.warn("Could not start camera on this device:", err);
      }
    }

    if (stream) {
      streamRef.current = stream;
      setIsLiveCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } else {
      toast.error("Camera access was not granted or no camera was detected on this device. You can choose a photo with Photo Gallery!");
      setIsLiveCameraActive(false);
    }
  };

  // Callback ref to attach stream as soon as video element mounts in DOM
  const setVideoRef = (element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.play().catch(() => {});
    }
  };

  // Take snapshot from live video stream
  const takeLiveSnapshot = () => {
    if (!videoRef.current) return;
    safeHaptic("medium");
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      stopLiveCamera();
      handleImageCaptured(dataUrl);
    }
  };

  // Cleanup camera stream when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopLiveCamera();
      setCapturedImage(null);
      setFoodData(null);
      setAnalyzeError(null);
    }
    return () => {
      stopLiveCamera();
    };
  }, [isOpen]);

  // Load a suggested cultural dish & scroll to results
  const loadSuggestedDish = (dish: LocalFoodData) => {
    safeHaptic("medium");
    stopLiveCamera();
    setCapturedImage(null);
    setFoodData(dish);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
    celebrate("Dish Loaded! 🍲", dish.dishName, { confettiStyle: "burst", hapticPattern: "success" });
  };

  // Reset back to scanner launcher
  const handleBackToScanner = () => {
    safeHaptic("light");
    setFoodData(null);
    setCapturedImage(null);
    setAnalyzeError(null);
    stopLiveCamera();
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

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

    const scaledCalories = Math.round(foodData.macroBreakdown.calories * portionMultiplier);
    const scaledProtein = Math.round(foodData.macroBreakdown.protein * portionMultiplier);
    const scaledCarbs = Math.round(foodData.macroBreakdown.carbs * portionMultiplier);
    const scaledFats = Math.round(foodData.macroBreakdown.fats * portionMultiplier);

    const logData = {
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      mealType,
      foodName: portionMultiplier === 1 ? foodData.dishName : `${foodData.dishName} (${portionMultiplier}x portion)`,
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fats: scaledFats,
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

  // Save to User's Personal Custom Food Database & Recipes
  const handleSaveToDatabase = () => {
    if (!foodData) return;
    safeHaptic("success");
    try {
      const customItem = {
        id: `custom-food-${Date.now()}`,
        name: foodData.dishName,
        region: foodData.region || selectedLocation.displayName || "Regional",
        calories: foodData.macroBreakdown.calories,
        protein: foodData.macroBreakdown.protein,
        carbs: foodData.macroBreakdown.carbs,
        fats: foodData.macroBreakdown.fats,
        fiber: foodData.macroBreakdown.fiber || 0,
        glycemicLoad: foodData.macroBreakdown.glycemicLoad,
        imageSrc: capturedImage || "",
        savedAt: new Date().toISOString(),
        notes: foodData.engineerSwap?.impactStatement || foodData.description,
      };

      const existingDb = JSON.parse(localStorage.getItem("mealoptimizer_custom_food_database") || "[]");
      localStorage.setItem("mealoptimizer_custom_food_database", JSON.stringify([customItem, ...existingDb]));

      // Also save to custom recipes
      const customRecipe = {
        id: customItem.id,
        name: customItem.name,
        emoji: "🍲",
        category: "lunch",
        tags: ["custom-snapped", "favorites"],
        prepTime: 20,
        cookTime: 30,
        baseServings: 2,
        difficulty: "easy",
        baseCalories: customItem.calories,
        baseProtein: customItem.protein,
        baseCarbs: customItem.carbs,
        baseFats: customItem.fats,
        glycemicIndex: customItem.glycemicLoad,
        rating: 5.0,
        reviews: 1,
        healthBenefits: customItem.notes || "Custom scanned meal",
        clinicalNote: `Scanned and saved to your personal Food Database on ${new Date().toLocaleDateString()}`,
        localMarkets: [selectedLocation.displayName || "Local Market"],
        ingredients: (foodData.engineerSwap?.healthySwap || ["1 balanced portion", "Fresh greens & vegetables"]).map((ing: string) => ({
          amount: 1,
          unit: "serving",
          name: ing,
        })),
        steps: [
          {
            stepNumber: 1,
            instruction: foodData.traditionalPrep?.method || "Prepare according to your custom healthy recipe preference.",
            flameLevel: "Medium",
            timerMinutes: 15,
            avoTip: "Incorporate low-GI veggies and unrefined oils for sustained energy!",
          },
        ],
        isFavorite: true,
      };

      const existingRecipes = JSON.parse(localStorage.getItem("mealoptimizer_user_custom_recipes") || "[]");
      localStorage.setItem("mealoptimizer_user_custom_recipes", JSON.stringify([customRecipe, ...existingRecipes]));

      setIsSavedToDatabase(true);
      celebrate(`Saved to Your Food Database! 📖✨`, "Stored in personal recipes & food records.", { confettiStyle: "burst", hapticPattern: "success" });
    } catch {
      toast.error("Could not save to custom food database");
    }
  };

  // Step 1 — store the image, show preview + Analyze button
  const handleImageCaptured = (imageData: string) => {
    setShowCamera(false);
    setCapturedImage(imageData);
    setAnalyzeError(null);
    setIsSavedToDatabase(false);
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
        voiceClarification: voiceNote || undefined,
        userContext: {
          voiceClarification: voiceNote || undefined,
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
      <div ref={scrollContainerRef} className="bg-white rounded-t-3xl w-full max-w-2xl h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 py-4 flex items-center justify-between z-20 shadow-md">
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
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
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
          /* Step 2 — preview + Interactive Modifiers + Analyze button */
          <div className="p-5 sm:p-6 flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">Plate Photo Ready</span>
              <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                AI Vision Ready
              </span>
            </div>

            <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border-2 border-teal-200 dark:border-zinc-700">
              <img
                src={capturedImage}
                alt="Food to analyse"
                className="w-full max-h-64 object-cover"
              />
              <div className="absolute top-2.5 right-2.5 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full text-white text-[10px] font-black tracking-wider flex items-center gap-1.5 shadow-md">
                <Sparkles size={12} className="text-amber-400" />
                <span>Ready to Scan</span>
              </div>
            </div>

            {/* Interactive Portion Multiplier */}
            <div className="w-full bg-slate-50 dark:bg-zinc-800/80 rounded-2xl p-3 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block leading-tight">Portion Size:</span>
                <span className="text-[10px] text-slate-500 font-medium">Estimated meal volume</span>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { label: "0.5x", val: 0.5 },
                  { label: "1.0x", val: 1.0 },
                  { label: "1.5x", val: 1.5 },
                  { label: "2.0x", val: 2.0 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      safeHaptic("light");
                      setPortionMultiplier(item.val);
                    }}
                    className={`text-xs font-black px-2.5 py-1 rounded-xl cursor-pointer transition-all ${
                      portionMultiplier === item.val
                        ? "bg-[#1f7a8c] text-white shadow-xs"
                        : "bg-white dark:bg-zinc-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 🎙️ HYBRID GEMINI-VISION + AUDIO INPUT (Meal Similarity Disambiguation) */}
            <div className="w-full bg-gradient-to-br from-teal-50/90 via-emerald-50/60 to-white dark:from-zinc-800 dark:to-zinc-900 p-3.5 rounded-2xl border border-teal-200 dark:border-zinc-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-lg bg-teal-600 text-white">
                    <Mic size={13} />
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    Hybrid Audio Clarification (Optional)
                  </span>
                </div>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  Vision + Voice AI
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Disambiguate lookalike dishes (e.g. <em>Pounded Yam vs Semo</em>, <em>Egusi vs Banga</em>, <em>Fried Rice vs Jollof</em>):
              </p>

              {/* Voice Mic Record & Input Row */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVoiceClarification}
                  className={`p-2.5 rounded-xl flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                    isRecordingVoice
                      ? "bg-red-600 text-white animate-pulse shadow-md"
                      : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs active:scale-95"
                  }`}
                  title="Speak dish details (Speech-to-Text)"
                >
                  {isRecordingVoice ? <MicOff size={14} className="animate-spin" /> : <Mic size={14} />}
                  <span>{isRecordingVoice ? "Listening..." : "Speak"}</span>
                </button>

                <input
                  type="text"
                  value={voiceNote}
                  onChange={(e) => setVoiceNote(e.target.value)}
                  placeholder="e.g. 'Pounded Yam with Goat Meat Egusi, light palm oil'..."
                  className="flex-1 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-teal-500"
                />
              </div>

              {/* 1-Tap Quick Tags for Common African Swallow & Soup Similarities */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400 font-bold">Quick tags:</span>
                {[
                  "Pounded Yam",
                  "Semovita",
                  "White Garri (Eba)",
                  "Amala",
                  "Egusi Soup",
                  "Banga Soup",
                  "Light Palm Oil",
                  "Fish instead of Beef",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      safeHaptic("light");
                      setVoiceNote((prev) => (prev ? `${prev}, ${tag}` : tag));
                    }}
                    className="text-[9.5px] font-bold px-2 py-0.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-teal-400 rounded-lg text-slate-700 dark:text-slate-300 active:scale-95 cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Avo Scribe Active Note Badge */}
            <div className="w-full p-2.5 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl text-[11px] text-teal-900 dark:text-teal-200 flex items-center gap-2">
              <span className="text-sm">🥑</span>
              <span className="leading-tight font-medium">
                <strong>Avo AI:</strong> "I'll combine your photo with audio notes to detect regional carbs, saturated palm oil ratios, and compute your personalized Glycemic Spike Shield!"
              </span>
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
          /* Step 1 — Unified 10X Scanner Launchpad */
          <div className="p-5 sm:p-6 space-y-4">
            {/* LIVE IN-FRAME CAMERA VIEWPORT */}
            {isLiveCameraActive ? (
              <div className="space-y-3">
                <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-950 border-2 border-teal-500 shadow-2xl flex items-center justify-center">
                  <video ref={setVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  
                  {/* Laser Sweeper Line */}
                  <div className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-laser-sweep" />
                  
                  {/* Viewfinder Target Reticle */}
                  <div className="absolute inset-10 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-4 border-l-4 border-teal-400" />
                      <div className="w-5 h-5 border-t-4 border-r-4 border-teal-400" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-4 border-l-4 border-teal-400" />
                      <div className="w-5 h-5 border-b-4 border-r-4 border-teal-400" />
                    </div>
                  </div>

                  {/* Top Live Badge */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black flex items-center gap-1.5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>Live AI Viewport</span>
                  </div>
                </div>

                {/* Camera Shutter & Action Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={stopLiveCamera}
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-800 dark:text-zinc-200 py-3.5 rounded-2xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={takeLiveSnapshot}
                    className="flex-[2] bg-gradient-to-r from-[#1f7a8c] via-[#2a9d8f] to-[#4ecdc4] text-white py-3.5 px-4 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera size={18} />
                    <span>Capture Plate 📸</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Snap or Upload Any Cultural Dish 🍲
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Instant biochemical macro analysis, glycemic load ranking, and authentic West African ingredient swaps!
                  </p>
                </div>

                {/* Direct Action Launch Grid (No Nested Popups!) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Live Viewport Camera */}
                  <button
                    onClick={startLiveCamera}
                    className="bg-gradient-to-br from-[#1f7a8c] to-[#0d9488] hover:from-[#1a6877] hover:to-[#0b7c72] text-white rounded-3xl p-5 text-left shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-white leading-tight">Take Photo 📸</div>
                        <div className="text-[11px] text-teal-100 mt-0.5">Live camera viewfinder</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Option 2: Gallery Upload */}
                  <button
                    onClick={() => document.getElementById("local-food-gallery-upload")?.click()}
                    className="bg-gradient-to-br from-[#2a9d8f] to-[#4ecdc4] hover:from-[#248277] hover:to-[#42b3ab] text-white rounded-3xl p-5 text-left shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-white leading-tight">Photo Gallery 🖼️</div>
                        <div className="text-[11px] text-teal-100 mt-0.5">Upload existing plate</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Option 3: Fix My Plate 1-Tap Visual Bio-Transformer */}
                <button
                  type="button"
                  onClick={() => {
                    safeHaptic("medium");
                    setShowFixModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-md hover:shadow-lg active:scale-[0.98] border border-amber-300/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform">
                      <Sparkles className="h-5 w-5 text-amber-200 animate-pulse" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Fix My Plate with Avo 🪄</span>
                        <span className="text-[8.5px] font-black uppercase bg-white text-orange-600 px-1.5 py-0.2 rounded-full shadow-2xs">
                          BIO-TRANSFORMER
                        </span>
                      </div>
                      <div className="text-[10.5px] text-amber-100/90 font-medium">
                        Interactive visual plate re-balancing &amp; 38% glycemic spike drop
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Option 4: Barcode Scanner Switcher Button */}
                <button
                  onClick={() => {
                    stopLiveCamera();
                    onClose();
                    navigate("/scan-barcode");
                  }}
                  className="w-full bg-slate-50 dark:bg-zinc-800/60 hover:bg-teal-50 dark:hover:bg-zinc-800 border-2 border-dashed border-teal-300 dark:border-zinc-700 hover:border-teal-500 rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-xl group-hover:scale-105 transition-transform">
                      <ScanBarcode className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-slate-900 dark:text-white">Scan Packaged Food Barcode 🏷️</div>
                      <div className="text-[10.5px] text-slate-500">Noodles, canned fish, milk, cereals &amp; beverages</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-teal-600" />
                </button>

                {/* Popular Cultural Test Plates Shelf */}
                <div className="pt-2 space-y-2.5">
                  <span className="text-[11px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 block">
                    ⚡ Or Select a Popular Regional Dish:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { name: "Jollof Rice & Chicken", calories: 520, gi: "High", emoji: "🍛", index: 0 },
                      { name: "Pounded Yam & Egusi", calories: 680, gi: "High", emoji: "🍲", index: 1 },
                      { name: "Amala & Ewedu Abula", calories: 520, gi: "High", emoji: "🥣", index: 2 },
                      { name: "Beef Suya Skewers", calories: 260, gi: "Low", emoji: "🍢", index: 3 },
                    ].map((item, idx) => {
                      const dish = mockFoodDatabase["Nigeria"]?.[item.index] || mockFoodDatabase["Nigeria"]?.[0];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (dish) {
                              loadSuggestedDish(dish);
                            }
                          }}
                          className="p-3 bg-slate-50 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-zinc-700/80 border border-slate-200 dark:border-zinc-700 rounded-2xl text-left transition-all flex flex-col justify-between min-h-[96px] cursor-pointer shadow-2xs group active:scale-95"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xl">{item.emoji}</span>
                            <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full shrink-0 ${item.gi === "Low" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"}`}>
                              {item.gi} GI
                            </span>
                          </div>
                          <div className="my-1.5 flex-1 flex items-center">
                            <div className="text-[12px] font-extrabold text-slate-900 dark:text-white leading-tight break-words line-clamp-2">
                              {item.name}
                            </div>
                          </div>
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold">
                            ~{item.calories} kcal
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hidden Native File Inputs for Instant Capture */}
                <input
                  id="local-food-native-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
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

                <input
                  id="local-food-gallery-upload"
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
              </>
            )}
          </div>
        ) : (
          /* Food Analysis Results View */
          <div className="p-6">
            {/* Top Back to Scanner Navigation Button */}
            <button
              onClick={handleBackToScanner}
              className="w-full mb-4 py-2.5 px-4 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900 text-[#1f7a8c] dark:text-teal-300 rounded-2xl font-black text-xs border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-xs"
            >
              <ArrowLeft size={15} />
              <span>← Back to Camera Scanner</span>
            </button>
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
              <TabsList className="grid w-full grid-cols-3 mb-5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl h-auto gap-1">
                <TabsTrigger value="traditional" className="py-2 text-[11px] sm:text-xs font-bold rounded-xl truncate">
                  Traditional
                </TabsTrigger>
                <TabsTrigger value="engineer" className="py-2 text-[11px] sm:text-xs font-bold rounded-xl truncate">
                  Smart Swaps
                </TabsTrigger>
                <TabsTrigger value="macros" className="py-2 text-[11px] sm:text-xs font-bold rounded-xl truncate">
                  Macros &amp; GI
                </TabsTrigger>
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
              {/* Option to Save Dish to User Food Database */}
              <button
                onClick={handleSaveToDatabase}
                disabled={isSavedToDatabase}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${
                  isSavedToDatabase
                    ? "bg-teal-900 text-teal-100 border border-teal-700 opacity-95"
                    : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-lg"
                }`}
              >
                {isSavedToDatabase ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-300" />
                    <span>Saved to Your Food Database &amp; Recipes 📖✨</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={16} />
                    <span>Save Dish to My Food Database &amp; Recipes 📖</span>
                  </>
                )}
              </button>

              {/* 🪄 Fix My Plate 1-Tap Bio-Transformer Button */}
              <button
                type="button"
                onClick={() => {
                  safeHaptic("medium");
                  setShowFixModal(true);
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-[#126778] hover:opacity-95 text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] border border-teal-300/40"
              >
                <Sparkles size={16} className="text-amber-300 animate-pulse" />
                <span>Fix My Plate with Avo 🪄 (Visual Re-Balance &amp; Spike Drop)</span>
              </button>

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
                  onClick={handleBackToScanner}
                  className="flex-1 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 py-3 rounded-2xl font-bold text-xs hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  ← Scan Another Dish
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

        {/* 🪄 Fix My Plate with Avo Visual Bio-Transformer Modal */}
        <FixMyPlateModal
          isOpen={showFixModal}
          onClose={() => setShowFixModal(false)}
          meal={{
            foodName: foodData?.dishName || "Pounded Yam & Egusi Soup",
            calories: foodData?.macroBreakdown.calories || 680,
            protein: foodData?.macroBreakdown.protein || 26,
            carbs: foodData?.macroBreakdown.carbs || 88,
            fats: foodData?.macroBreakdown.fats || 28,
            fiber: foodData?.macroBreakdown.fiber || 3,
            glycemicLoad: foodData?.macroBreakdown.glycemicLoad || "High",
          }}
          onApplyOptimized={(optimized) => {
            if (foodData) {
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
            }
            toast.success("Plate optimized with balanced macros!");
          }}
        />

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
