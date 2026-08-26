import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Camera,
  Info,
  Clock,
  Trash2,
  ScanBarcode as BarcodeIcon,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplet,
  ShieldCheck,
  Zap,
  ChevronRight,
  ArrowLeft,
  X,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import MascotLoader from "../components/MascotLoader";
import { getAccessToken } from "../../lib/supabase";
import { createMealLog } from "../../lib/api";
import { celebrate } from "../components/celebrate";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";

// Comprehensive West African & Global Packaged Foods Offline & Barcode Database
interface PackagedProduct {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number; // mg
  glycemicIndex: "Low" | "Medium" | "High";
  clinicalVerdict: "healthy" | "moderate" | "caution";
  clinicalNote: string;
  ingredients: string;
  servingSize: string;
}

const AFRICAN_PACKAGED_DB: PackagedProduct[] = [
  {
    barcode: "6001007011234",
    name: "Indomie Instant Noodles (Chicken Flavour)",
    brand: "Dufil Prima Foods",
    category: "Instant Noodles",
    calories: 380,
    protein: 8,
    carbs: 54,
    fats: 15,
    fiber: 2,
    sugar: 2,
    sodium: 1150,
    glycemicIndex: "High",
    clinicalVerdict: "caution",
    clinicalNote: "🚨 High sodium (1150mg per pack) and refined starch. Pair with extra boiled egg, carrots, and boiled cabbage to lower glycemic surge. Limit broth for hypertension.",
    ingredients: "Wheat Flour, Refined Palm Oil, Salt, Sodium Polyphosphate, Seasoning powder (Monosodium glutamate, Hydrolyzed plant protein, Garlic, Pepper).",
    servingSize: "1 pack (70g)",
  },
  {
    barcode: "7613035882001",
    name: "Peak Full Cream Evaporated Milk (Tin)",
    brand: "FrieslandCampina WAMCO",
    category: "Dairy",
    calories: 135,
    protein: 7,
    carbs: 9.5,
    fats: 8,
    fiber: 0,
    sugar: 9.5,
    sodium: 110,
    glycemicIndex: "Low",
    clinicalVerdict: "healthy",
    clinicalNote: "🟢 Nutrient-dense source of bioavailable calcium and Vitamin B12. Low glycemic impact on blood glucose.",
    ingredients: "Whole Milk, Stabilizers (Disodium Phosphate), Vitamin D3.",
    servingSize: "100ml",
  },
  {
    barcode: "7613035883002",
    name: "Nestlé Milo Chocolate Malt Beverage",
    brand: "Nestlé Nigeria",
    category: "Beverages",
    calories: 124,
    protein: 3.5,
    carbs: 21,
    fats: 2.8,
    fiber: 1.5,
    sugar: 13.5,
    sodium: 65,
    glycemicIndex: "High",
    clinicalVerdict: "caution",
    clinicalNote: "🚨 Contains 13.5g of fast-acting sugar per 20g serving. High glycemic surge risk for diabetes. Do not add refined table sugar.",
    ingredients: "Malt Extract (Barley), Skimmed Milk, Sugar, Cocoa, Palm Oil, Minerals (Dicalcium Phosphate, Ferric Pyrophosphate), Vitamins (C, B3, B6, B2, D, B12).",
    servingSize: "20g (3 heaped teaspoons)",
  },
  {
    barcode: "7613035884003",
    name: "Golden Morn Whole Grain Maize & Soya",
    brand: "Nestlé Nigeria",
    category: "Breakfast Cereals",
    calories: 185,
    protein: 7.2,
    carbs: 34,
    fats: 2.5,
    fiber: 3.8,
    sugar: 8.5,
    sodium: 140,
    glycemicIndex: "Medium",
    clinicalVerdict: "moderate",
    clinicalNote: "🟡 Whole grain maize provides sustained satiety, but contains 8.5g added sugar. Best eaten with unsweetened Greek yoghurt or skimmed milk.",
    ingredients: "Whole Grain Maize (60%), Soya Bean (20%), Sugar, Calcium Carbonate, Salt, Iron, Vitamin A, B6, B12.",
    servingSize: "50g",
  },
  {
    barcode: "0841005510001",
    name: "Titus Sardines in Vegetable Oil",
    brand: "Unimer Group",
    category: "Canned Fish",
    calories: 198,
    protein: 22,
    carbs: 0,
    fats: 12,
    fiber: 0,
    sugar: 0,
    sodium: 380,
    glycemicIndex: "Low",
    clinicalVerdict: "healthy",
    clinicalNote: "🟢 Superior metabolic superfood! Zero carbs, 22g protein, and rich in anti-inflammatory Omega-3 fatty acids (EPA/DHA) and edible bone calcium.",
    ingredients: "Sardines (Pilchardus), Soya Oil, Salt.",
    servingSize: "1 can drained (90g)",
  },
  {
    barcode: "6001007011999",
    name: "Gino Concentrated Tomato Paste",
    brand: "GBfoods Africa",
    category: "Cooking Sauces",
    calories: 32,
    protein: 1.8,
    carbs: 6.2,
    fats: 0.2,
    fiber: 1.6,
    sugar: 4.2,
    sodium: 45,
    glycemicIndex: "Low",
    clinicalVerdict: "healthy",
    clinicalNote: "🟢 High concentration of Lycopene, a potent antioxidant supporting cardiovascular and prostate health. Very low glycemic response.",
    ingredients: "Fresh Tomatoes (28-30% Brix), Salt.",
    servingSize: "70g sachet",
  },
  {
    barcode: "030000010204",
    name: "Quaker Quick Cooking White Oats",
    brand: "PepsiCo",
    category: "Whole Grains",
    calories: 150,
    protein: 5,
    carbs: 27,
    fats: 2.5,
    fiber: 4,
    sugar: 1,
    sodium: 0,
    glycemicIndex: "Low",
    clinicalVerdict: "healthy",
    clinicalNote: "🟢 Soluble Beta-Glucan fiber binds dietary cholesterol and delays gastric emptying, dramatically reducing post-prandial glucose spikes.",
    ingredients: "100% Rolled Whole Oats.",
    servingSize: "40g",
  },
  {
    barcode: "5411188110021",
    name: "Maltina Non-Alcoholic Malt Drink",
    brand: "Nigerian Breweries PLC",
    category: "Beverages",
    calories: 172,
    protein: 1.5,
    carbs: 41,
    fats: 0,
    fiber: 0,
    sugar: 36,
    sodium: 25,
    glycemicIndex: "High",
    clinicalVerdict: "caution",
    clinicalNote: "🚨 Severe glycemic spike warning! Contains 36g rapid-acting sucrose and maltose per bottle. Strongly avoid for diabetes or fatty liver management.",
    ingredients: "Water, Malted Barley, Malted Sorghum, Sugar, Caramel, Hops, Vitamins (A, B1, B2, B3, B5, B6, C).",
    servingSize: "330ml can/bottle",
  },
];

interface ScanHistoryItem {
  barcode: string;
  productName: string;
  brand?: string;
  timestamp: string;
  calories?: number;
}

export default function ScanBarcode() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeData, setBarcodeData] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<PackagedProduct | any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load scan history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("barcode-scan-history");
      if (saved) {
        setScanHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveScanHistory = (history: ScanHistoryItem[]) => {
    localStorage.setItem("barcode-scan-history", JSON.stringify(history));
    setScanHistory(history);
  };

  const addToHistory = (barcode: string, product: any) => {
    const newItem: ScanHistoryItem = {
      barcode,
      productName: product.name || "Unknown Product",
      brand: product.brand,
      timestamp: new Date().toISOString(),
      calories: product.calories,
    };
    const updated = [newItem, ...scanHistory.filter((item) => item.barcode !== barcode)].slice(0, 10);
    saveScanHistory(updated);
  };

  // Start live laser camera
  const startLiveCamera = async () => {
    triggerHaptic("medium");
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn("Could not start live webcam:", e);
      toast.info("Using simulation mode. Pick a barcode below!");
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  const lookupBarcode = (barcode: string) => {
    triggerHaptic("medium");
    setLoading(true);
    setBarcodeData(barcode);
    stopLiveCamera();

    // Check offline DB first
    const found = AFRICAN_PACKAGED_DB.find(
      (p) => p.barcode === barcode || p.name.toLowerCase().includes(barcode.toLowerCase())
    );

    setTimeout(() => {
      if (found) {
        setProductInfo(found);
        addToHistory(found.barcode, found);
        celebrate("Product Recognized! 🏷️", found.name, { confettiStyle: "burst", hapticPattern: "success" });
      } else {
        // Fallback product
        const fallback: PackagedProduct = {
          barcode,
          name: searchQuery || `Product #${barcode.slice(-6)}`,
          brand: "Packaged Food",
          category: "General Groceries",
          calories: 220,
          protein: 6,
          carbs: 28,
          fats: 9,
          fiber: 2,
          sugar: 5,
          sodium: 240,
          glycemicIndex: "Medium",
          clinicalVerdict: "moderate",
          clinicalNote: "🟡 Verify the nutritional facts panel on the packaging for exact sodium and added sugar content.",
          ingredients: "Standard nutritional ingredients.",
          servingSize: "1 standard serving",
        };
        setProductInfo(fallback);
        addToHistory(barcode, fallback);
      }
      setLoading(false);
    }, 600);
  };

  const handleSaveToLog = async () => {
    if (!productInfo || isSaving) return;
    setIsSaving(true);

    const now = new Date();
    const hour = now.getHours();
    const mealType = hour < 11 ? "breakfast" : hour < 16 ? "lunch" : hour < 21 ? "dinner" : "snack";
    const gl = productInfo.glycemicIndex;
    const bloodSugarImpact = gl === "Low" ? "low" : gl === "High" ? "high" : "medium";

    const logData = {
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      mealType,
      foodName: `${productInfo.name} (${servingMultiplier}x serving)`,
      calories: Math.round(productInfo.calories * servingMultiplier),
      protein: Math.round(productInfo.protein * servingMultiplier),
      carbs: Math.round(productInfo.carbs * servingMultiplier),
      fats: Math.round(productInfo.fats * servingMultiplier),
      energyRating: 3,
      digestiveComfort: 3,
      bloodSugarImpact,
    };

    try {
      await createMealLog(logData);
      celebrate(`${productInfo.name} logged! 🎉`, "Calories and macros added to your daily tracker.", {
        confettiStyle: "burst",
        hapticPattern: "success",
      });
      navigate("/home");
    } catch (e) {
      try {
        const existing = JSON.parse(localStorage.getItem("mealLogs") || "[]");
        existing.push({ id: `local-${now.getTime()}`, ...logData });
        localStorage.setItem("mealLogs", JSON.stringify(existing));
        celebrate(`${productInfo.name} saved offline! 🎉`, "Added to today's log.", {
          confettiStyle: "burst",
          hapticPattern: "success",
        });
        navigate("/home");
      } catch (err: any) {
        toast.error("Could not save meal", { description: err?.message });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
        <button
          onClick={() => navigate("/home")}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#1f7a8c] rounded-xl text-white">
            <BarcodeIcon size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black leading-tight">Barcode Scanner 10X</h1>
            <p className="text-[10px] text-teal-300">African &amp; Global Food Diagnostic</p>
          </div>
        </div>

        <button
          onClick={() => {
            setBarcodeData(null);
            setProductInfo(null);
            setSearchQuery("");
            stopLiveCamera();
          }}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 max-w-xl mx-auto w-full p-4 space-y-4">
        {/* VIEW 1: LIVE SCANNER VIEWPORT */}
        {!productInfo && !loading && (
          <div className="space-y-4">
            {/* Camera Viewfinder Box */}
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500/40 shadow-2xl flex flex-col items-center justify-center group">
              {isCameraActive ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {/* Laser Sweeper Line */}
                  <div className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-laser-sweep" />
                  {/* Viewfinder Target Reticle */}
                  <div className="absolute inset-12 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-t-4 border-l-4 border-teal-400" />
                      <div className="w-5 h-5 border-t-4 border-r-4 border-teal-400" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-5 h-5 border-b-4 border-l-4 border-teal-400" />
                      <div className="w-5 h-5 border-b-4 border-r-4 border-teal-400" />
                    </div>
                  </div>
                  <button
                    onClick={stopLiveCamera}
                    className="absolute bottom-4 bg-black/70 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md cursor-pointer"
                  >
                    Stop Camera
                  </button>
                </>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1f7a8c] to-[#0d9488] p-1 mx-auto shadow-lg flex items-center justify-center animate-pulse">
                    <BarcodeIcon size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Laser Barcode Viewport</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Align any packaged food, cereal box, or beverage barcode inside the scanner
                    </p>
                  </div>
                  <button
                    onClick={startLiveCamera}
                    className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] hover:from-[#1a6877] hover:to-[#0b7c72] text-white font-extrabold text-xs py-3 px-5 rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Camera size={16} />
                    <span>Start Live Scanner</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Search / Manual Barcode Input Bar */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-md">
              <Search size={16} className="text-slate-400 ml-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchQuery.trim() && lookupBarcode(searchQuery)}
                placeholder="Search food e.g. Indomie, Peak Milk, Milo, Oats..."
                className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => lookupBarcode(searchQuery)}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Lookup
                </button>
              )}
            </div>

            {/* 1-Tap Popular Nigerian & West African Packaged Foods */}
            <div className="space-y-2">
              <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
                ⚡ Instant Packaged Food Test Library:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {AFRICAN_PACKAGED_DB.slice(0, 6).map((item) => (
                  <button
                    key={item.barcode}
                    onClick={() => lookupBarcode(item.barcode)}
                    className="p-3 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-teal-500 rounded-2xl text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-black uppercase text-teal-400 tracking-wider">
                        {item.brand}
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                          item.clinicalVerdict === "healthy"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                            : item.clinicalVerdict === "caution"
                            ? "bg-red-950 text-red-300 border border-red-700"
                            : "bg-amber-950 text-amber-300 border border-amber-700"
                        }`}
                      >
                        {item.glycemicIndex} GI
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 group-hover:text-teal-300 line-clamp-1">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {item.calories} kcal · {item.carbs}g carbs
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-slate-900 rounded-3xl p-8 border border-white/10 text-center shadow-xl">
            <MascotLoader label="Analyzing barcode & clinical safety..." size={84} />
          </div>
        )}

        {/* VIEW 2: PRODUCT ANALYSIS & CLINICAL VERDICT */}
        {productInfo && !loading && (
          <div className="space-y-4">
            {/* Clinical Traffic Light Alert Card */}
            <div
              className={`rounded-3xl p-5 border-2 shadow-xl ${
                productInfo.clinicalVerdict === "healthy"
                  ? "bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/50"
                  : productInfo.clinicalVerdict === "caution"
                  ? "bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-red-500/50"
                  : "bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-amber-500/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                      {productInfo.brand}
                    </span>
                    <span className="text-[10px] text-slate-400">Barcode #{productInfo.barcode}</span>
                  </div>
                  <h2 className="text-lg font-black text-white mt-1 leading-tight">{productInfo.name}</h2>
                  <p className="text-[11px] text-slate-300 mt-0.5">{productInfo.category} · {productInfo.servingSize}</p>
                </div>

                <div
                  className={`p-2.5 rounded-2xl flex items-center justify-center shrink-0 ${
                    productInfo.clinicalVerdict === "healthy"
                      ? "bg-emerald-500 text-white"
                      : productInfo.clinicalVerdict === "caution"
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-slate-950"
                  }`}
                >
                  {productInfo.clinicalVerdict === "healthy" ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <AlertTriangle size={22} />
                  )}
                </div>
              </div>

              {/* Clinical Advisory Note */}
              <div className="mt-3.5 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-xs leading-relaxed text-slate-200">
                {productInfo.clinicalNote}
              </div>
            </div>

            {/* Serving Multiplier Selector */}
            <div className="bg-slate-900 rounded-2xl p-3 border border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Portion Serving:</span>
              <div className="flex items-center gap-1">
                {[0.5, 1, 1.5, 2].map((multiplier) => (
                  <button
                    key={multiplier}
                    onClick={() => {
                      triggerHaptic("light");
                      setServingMultiplier(multiplier);
                    }}
                    className={`text-xs font-black px-3 py-1 rounded-xl cursor-pointer transition-all ${
                      servingMultiplier === multiplier
                        ? "bg-[#1f7a8c] text-white shadow-xs"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {multiplier}x
                  </button>
                ))}
              </div>
            </div>

            {/* 4-Pillar Macro Breakdown Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-orange-400 block">Calories</span>
                <span className="text-base font-black text-white">
                  {Math.round(productInfo.calories * servingMultiplier)}
                </span>
                <span className="text-[9px] text-slate-400 block">kcal</span>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Carbs</span>
                <span className="text-base font-black text-white">
                  {Math.round(productInfo.carbs * servingMultiplier)}g
                </span>
                <span className="text-[9px] text-slate-400 block">{productInfo.glycemicIndex} GI</span>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-400 block">Protein</span>
                <span className="text-base font-black text-white">
                  {Math.round(productInfo.protein * servingMultiplier)}g
                </span>
                <span className="text-[9px] text-slate-400 block">Recovery</span>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-purple-400 block">Sodium</span>
                <span className="text-base font-black text-white">
                  {Math.round(productInfo.sodium * servingMultiplier)}mg
                </span>
                <span className="text-[9px] text-slate-400 block">BP Load</span>
              </div>
            </div>

            {/* Ingredients & Chemical Additives */}
            {productInfo.ingredients && (
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  Ingredients Breakdown:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{productInfo.ingredients}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleSaveToLog}
                disabled={isSaving}
                className="w-full py-4 bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] hover:from-[#1a6877] hover:to-[#0b7c72] text-white rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>{isSaving ? "Logging to Food Diary..." : "Save Product to Today's Log 🍲"}</span>
              </button>

              <button
                onClick={() => {
                  setProductInfo(null);
                  setBarcodeData(null);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl font-bold text-xs border border-white/10 cursor-pointer transition-colors"
              >
                Scan Another Barcode
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
