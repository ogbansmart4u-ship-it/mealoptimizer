import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Camera, MessageSquare, Mic, Utensils, Coffee, Apple, Zap, Plus, X, Sparkles, Save, Search, Loader2, AlertTriangle } from 'lucide-react';
import { searchFoods, getMedications, analyzeFoodImage, type FoodItem } from '../../lib/api';
import { useUser } from '../contexts/UserContext';
import { useLocation } from '../contexts/LocationContext';
import { getMedicationFoodFlags, type InteractionFlag } from '../data/medicationInteractions';
import CameraCapture from './CameraCapture';
import Mascot from './Mascot';
import { launchWhatsAppFoodBot } from '../../lib/whatsapp';
import VoiceFoodLogger from './VoiceFoodLogger';
import SmartPlateAdvisor from './SmartPlateAdvisor';
import { findMatchingPairings } from '../data/nutrientPairings';
import { toast } from 'sonner';
import { useAutoSave, getAutoSavedData, clearAutoSavedData } from '../hooks/useAutoSave';
import { VoiceInput } from './VoiceInput';
import { TemplateManager } from './TemplateManager';
import MealOptimizingLoader from './MealOptimizingLoader';
import { celebrate } from './celebrate';
import VisualPortionEstimator, { PortionTier } from './VisualPortionEstimator';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

type MealLog = {
  id: string;
  date: string;
  time: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl?: string;
  energyRating: number;
  digestiveComfort: number;
  bloodSugarImpact?: 'low' | 'medium' | 'high';
};

type AddMealLogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (log: MealLog) => void;
  onAdd?: (log: MealLog) => void;
  selectedDate?: Date;
};

export default function AddMealLog({ isOpen, onClose, onSave, onAdd, selectedDate }: AddMealLogProps) {
  const { profile } = useUser();
  const { selectedLocation } = useLocation();
  const [step, setStep] = useState<'method' | 'manual' | 'camera' | 'search'>('method');
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSmartPlate, setShowSmartPlate] = useState(false);
  const [currentFoodForPairing, setCurrentFoodForPairing] = useState('');
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);
  const [notes, setNotes] = useState('');

  // Food database search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState('1');

  // Active medications, for food-interaction flags
  const [activeMeds, setActiveMeds] = useState<string[]>([]);
  const [portionTier, setPortionTier] = useState<PortionTier>('medium');

  const handlePortionSelect = (tier: PortionTier, grams: number, carbs: number) => {
    setPortionTier(tier);
    const caloriesEst = Math.round(carbs * 4 + 18 * 4 + 10 * 9);
    const proteinEst = tier === 'small' ? 14 : tier === 'medium' ? 24 : 36;
    const fatsEst = tier === 'small' ? 8 : tier === 'medium' ? 14 : 22;

    setFormData((prev) => ({
      ...prev,
      carbs: String(carbs),
      calories: String(caloriesEst),
      protein: String(proteinEst),
      fats: String(fatsEst),
    }));
  };

  const [cookingMethod, setCookingMethod] = useState<'steamed_boiled' | 'grilled_baked' | 'stewed' | 'fried'>('steamed_boiled');

  const handleCookingMethodChange = (method: 'steamed_boiled' | 'grilled_baked' | 'stewed' | 'fried') => {
    setCookingMethod(method);
    triggerHaptic('selection');
    
    // Auto-adjust oil and sodium shifts
    const curCals = parseInt(formData.calories, 10) || 350;
    const curFats = parseInt(formData.fats, 10) || 10;
    const curSodium = parseInt(formData.sodium, 10) || 350;

    let deltaCals = 0;
    let deltaFats = 0;
    let deltaSodium = 0;

    if (method === 'fried') {
      deltaCals = 120;
      deltaFats = 12;
      deltaSodium = 140;
    } else if (method === 'stewed') {
      deltaCals = 50;
      deltaFats = 6;
      deltaSodium = 80;
    } else if (method === 'grilled_baked') {
      deltaCals = 15;
      deltaFats = 2;
      deltaSodium = 20;
    }

    setFormData((prev) => ({
      ...prev,
      calories: String(Math.max(80, curCals + deltaCals)),
      fats: String(Math.max(2, curFats + deltaFats)),
      sodium: String(Math.max(50, curSodium + deltaSodium)),
    }));
  };

  useEffect(() => {
    if (!isOpen) return;
    getMedications()
      .then((items: any[]) => setActiveMeds((items || []).filter((m) => m.active !== false).map((m) => m.name).filter(Boolean)))
      .catch(() => {});
  }, [isOpen]);

  const renderInteractionFlags = (flags: InteractionFlag[]) =>
    flags.length ? (
      <div className="space-y-2">
        {flags.map((f, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${
              f.severity === 'high'
                ? 'bg-red-50 border-red-200 text-red-800'
                : f.severity === 'moderate'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span><strong>{f.label}:</strong> {f.message}</span>
          </div>
        ))}
      </div>
    ) : null;

  // Debounced search whenever the search step is active
  useEffect(() => {
    if (step !== 'search') return;
    let active = true;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const results = await searchFoods(searchQuery.trim());
        if (active) setSearchResults(results);
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, searchQuery.trim() ? 250 : 0);
    return () => { active = false; clearTimeout(t); };
  }, [searchQuery, step]);

  const applySelectedFood = () => {
    if (!selectedFood) return;
    const mult = Math.max(parseFloat(servings) || 1, 0.25);
    const scale = (v: number | null) => (v == null ? '' : String(Math.round(v * mult)));
    setFormData((prev) => ({
      ...prev,
      foodName: mult !== 1 ? `${servings} × ${selectedFood.name}` : selectedFood.name,
      calories: scale(selectedFood.calories) || '300',
      protein: scale(selectedFood.protein_g) || '15',
      carbs: scale(selectedFood.carbs_g) || '40',
      fats: scale(selectedFood.fat_g) || '10',
      sodium: scale(selectedFood.sodium_mg) || '350',
    }));
    setSelectedFood(null);
    setServings('1');
    setStep('manual');
    toast.success(`${selectedFood.name} loaded — review & save! 🍲`);
  };

  const [formData, setFormData] = useState({
    mealType: 'breakfast' as MealType,
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    sodium: '',
    time: new Date().toTimeString().slice(0, 5),
  });

  // Auto-save form data
  useAutoSave({
    key: 'meal-log-draft',
    data: formData,
    delay: 1500,
    onSave: () => {
      setAutoSaveIndicator(true);
      setTimeout(() => setAutoSaveIndicator(false), 2000);
    },
  });

  // Load smart defaults and auto-saved data on mount
  useEffect(() => {
    if (isOpen) {
      // Try to load auto-saved draft first
      const draft = getAutoSavedData<typeof formData>('meal-log-draft');

      // Load last meal defaults from localStorage for smart defaults
      const lastMeal = getAutoSavedData<typeof formData>('last-meal-defaults');

      if (draft && draft.foodName) {
        // Restore draft
        setFormData(draft);
        toast.info('Draft restored', { duration: 2000 });
      } else if (lastMeal) {
        // Pre-fill with smart defaults (last used portion sizes)
        setFormData({
          ...formData,
          calories: lastMeal.calories || '',
          protein: lastMeal.protein || '',
          carbs: lastMeal.carbs || '',
          fats: lastMeal.fats || '',
        });
      }
    }
  }, [isOpen]);

  const mealTypeOptions = [
    { id: 'breakfast' as MealType, label: 'Breakfast', icon: Coffee, color: 'bg-orange-50 text-orange-600' },
    { id: 'lunch' as MealType, label: 'Lunch', icon: Utensils, color: 'bg-green-50 text-green-600' },
    { id: 'dinner' as MealType, label: 'Dinner', icon: Apple, color: 'bg-purple-50 text-purple-600' },
    { id: 'snack' as MealType, label: 'Snack', icon: Zap, color: 'bg-blue-50 text-blue-600' },
  ];

  const handleCameraCapture = async (imageData: string, _source: 'camera' | 'upload') => {
    setCapturedImage(imageData);
    setShowCameraCapture(false);
    setStep('manual');
    setAnalyzing(true);
    const toastId = toast.loading('Analyzing your food photo…');
    try {
      const base64 = imageData.replace(/^data:[^;]+;base64,/, '');
      const data: any = await analyzeFoodImage(base64, {
        medicalCondition: profile?.medicalCondition || 'None',
        age: profile?.age ?? 0,
        bmi: profile?.bmi ?? 0,
        location: selectedLocation?.displayName || 'Nigeria',
      });
      // Edge fn returns { analysis: {...} }; tolerate a flat shape too.
      const a = (data?.analysis ?? data) || {};
      const num = (v: any) => (v == null || v === '' ? '' : String(v));
      setFormData((prev) => ({
        ...prev,
        foodName: a.foodName || a.food_name || prev.foodName || '',
        calories: num(a.calories) || prev.calories,
        protein: num(a.protein) || prev.protein,
        carbs: num(a.carbs) || prev.carbs,
        fats: num(a.fats) || prev.fats,
      }));
      toast.success('Food analyzed — review and save.', { id: toastId });
    } catch (err: any) {
      console.error('Food analysis failed', err);
      toast.error("Couldn't analyze the photo. Enter the details manually.", { id: toastId });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualSave = () => {
    // Validation
    if (!formData.foodName.trim()) {
      toast.error('Please enter a food name');
      return;
    }

    const cals = parseInt(formData.calories, 10);
    const prot = parseInt(formData.protein, 10);
    const carbs = parseInt(formData.carbs, 10);
    const fats = parseInt(formData.fats, 10);
    const sodiumVal = parseInt(formData.sodium, 10);

    const d = selectedDate || new Date();
    const logDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Compute estimated inflammatory score
    const isLeafyOrFish = /efo|afang|spinach|okazi|onugbu|bitterleaf|fish|mackerel|salmon|zobo|greens/i.test(formData.foodName);
    const isHighCarbOrFried = /fried|puff|suya.*fat|chips|pastry|bake/i.test(formData.foodName);
    const diiEstimate = isLeafyOrFish ? -3.4 : isHighCarbOrFried ? 1.8 : -1.2;

    const newLog: MealLog = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: logDate,
      time: formData.time || new Date().toTimeString().slice(0, 5),
      mealType: formData.mealType,
      foodName: formData.foodName.trim(),
      calories: isNaN(cals) ? 350 : cals,
      protein: isNaN(prot) ? 15 : prot,
      carbs: isNaN(carbs) ? 40 : carbs,
      fats: isNaN(fats) ? 10 : fats,
      sodium_mg: isNaN(sodiumVal) ? Math.round((isNaN(cals) ? 350 : cals) * 0.75) : sodiumVal,
      inflammatory_score: diiEstimate,
      imageUrl: capturedImage || undefined,
      energyRating: 4,
      digestiveComfort: 4,
      bloodSugarImpact: isLeafyOrFish ? 'low' : (isNaN(carbs) ? 40 : carbs) > 55 ? 'high' : 'medium',
    };

    // 1. Invoke parent handler
    const saveHandler = onSave || onAdd;
    if (saveHandler) {
      saveHandler(newLog);
    }

    // 2. Direct guarantee write to local storage vault
    try {
      const raw = localStorage.getItem('mealoptimiza_meal_logs') || localStorage.getItem('mealoptimizer_meal_logs') || '[]';
      const existing = JSON.parse(raw);
      const updated = [newLog, ...existing.filter((l: any) => l.id !== newLog.id)];
      localStorage.setItem('mealoptimiza_meal_logs', JSON.stringify(updated));
      localStorage.setItem('mealoptimizer_meal_logs', JSON.stringify(updated));
    } catch {}

    // Save smart defaults for next entry
    localStorage.setItem('last-meal-defaults', JSON.stringify({
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fats: formData.fats,
    }));

    // Clear the auto-saved draft
    clearAutoSavedData('meal-log-draft');

    triggerHaptic('milestone');
    celebrate('Meal logged! 🎉', 'Great job tracking your nutrition.');
    handleClose();
  };

  const handleClose = () => {
    setStep('method');
    setCapturedImage(null);
    setAnalyzing(false);
    setNotes('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setServings('1');
    setFormData({
      mealType: 'breakfast',
      foodName: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      time: new Date().toTimeString().slice(0, 5),
    });
    // Keep draft in localStorage for potential recovery
    onClose();
  };

  const handleVoiceTranscript = (transcript: string) => {
    setNotes(transcript);
  };

  const handleApplyTemplate = (templateData: any) => {
    setFormData({
      ...formData,
      ...templateData,
    });
    setStep('manual');
    toast.success('Template applied!');
  };

  return (
    <>
      <Dialog open={isOpen && !showCameraCapture} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          {/* Method Selection - 10X Upgraded */}
          {step === 'method' && (
            <div className="space-y-4">
              <DialogHeader className="text-left pb-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-2xl border border-teal-500/30 shrink-0">
                    <Mascot gesture="wave" size={42} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                      Smart Food Diary
                    </span>
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      Log a Meal 🍽️
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Choose your preferred way to log your African or diaspora meal.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* 5 High-Converting Entry Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* 1. AI Camera Scanner */}
                <button
                  onClick={() => setShowCameraCapture(true)}
                  className="sm:col-span-2 flex items-center gap-3.5 p-4 bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] hover:opacity-95 text-white rounded-2xl shadow-md transition-all cursor-pointer group active:scale-98 text-left"
                >
                  <div className="bg-white/20 rounded-xl p-2.5 shrink-0 group-hover:scale-105 transition-transform">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-sm flex items-center gap-1.5">
                      <span>Analyze Food with AI Camera</span>
                      <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">Fastest</span>
                    </div>
                    <div className="text-[11px] text-teal-100/90 truncate">Snap a photo for instant calories, macros &amp; glycemic spike score</div>
                  </div>
                </button>

                {/* 2. Voice AI Dictation */}
                <button
                  onClick={() => setShowVoiceLogger(true)}
                  className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/30 border border-rose-200 dark:border-rose-800/60 hover:border-rose-400 rounded-2xl transition-all cursor-pointer text-left group active:scale-98"
                >
                  <div className="bg-rose-500 text-white rounded-xl p-2.5 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Mic className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Speak to Sarah (Voice AI)</div>
                    <div className="text-[10.5px] text-rose-700 dark:text-rose-300 truncate">English, Pidgin or French</div>
                  </div>
                </button>

                {/* 3. WhatsApp Bot */}
                <button
                  onClick={() => launchWhatsAppFoodBot()}
                  className="flex items-center gap-3 p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer text-left group active:scale-98"
                >
                  <div className="bg-[#25D366] text-slate-950 rounded-xl p-2.5 shrink-0 group-hover:scale-105 transition-transform shadow-xs font-bold">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">WhatsApp Food Bot</div>
                    <div className="text-[10.5px] text-emerald-700 dark:text-emerald-300 truncate">Snap photos on WhatsApp</div>
                  </div>
                </button>

                {/* 4. Search Database */}
                <button
                  onClick={() => setStep('search')}
                  className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-teal-500 rounded-2xl transition-all cursor-pointer text-left group active:scale-98"
                >
                  <div className="bg-teal-500/15 text-teal-700 dark:text-teal-300 rounded-xl p-2.5 shrink-0 group-hover:scale-105 transition-transform">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Search African Foods</div>
                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">1,500+ Nigerian &amp; diaspora meals</div>
                  </div>
                </button>

                {/* 5. Manual Entry */}
                <button
                  onClick={() => setStep('manual')}
                  className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-teal-500 rounded-2xl transition-all cursor-pointer text-left group active:scale-98"
                >
                  <div className="bg-teal-500/15 text-teal-700 dark:text-teal-300 rounded-xl p-2.5 shrink-0 group-hover:scale-105 transition-transform">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Enter Manually</div>
                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">Type portion &amp; cooking method</div>
                  </div>
                </button>
              </div>

              {/* 1-Tap Quick Cultural Starters */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  1-Tap Popular African Dishes:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: "🍲 Jollof & Chicken", cals: "520", p: "32", c: "68", f: "14", type: "lunch" },
                    { name: "🥣 Oat Swallow & Okra", cals: "430", p: "28", c: "45", f: "12", type: "dinner" },
                    { name: "🥑 Moi Moi & Eggs", cals: "340", p: "24", c: "28", f: "11", type: "breakfast" },
                    { name: "🥩 Beef Suya & Greens", cals: "380", p: "34", c: "12", f: "22", type: "dinner" },
                  ].map((dish, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          foodName: dish.name.replace(/^[^a-zA-Z]+/, ''),
                          calories: dish.cals,
                          protein: dish.p,
                          carbs: dish.c,
                          fats: dish.f,
                          mealType: dish.type as MealType,
                        }));
                        setStep('manual');
                      }}
                      className="px-3 py-1.5 bg-teal-50/80 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold transition-colors cursor-pointer active:scale-95"
                    >
                      {dish.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Food Database Search */}
          {step === 'search' && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-[#1f7a8c] dark:text-teal-400">Search African Foods 🔍</DialogTitle>
                <DialogDescription>Find a Nigerian / West African food and add it to your meal.</DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    autoFocus
                    type="text"
                    placeholder="Search e.g. jollof, egusi, garri, moi moi…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>

                {/* Selected food → choose servings */}
                {selectedFood && (
                  <div className="mt-4 p-4 rounded-xl border-2 border-[#1f7a8c] bg-[#E8F5F5]">
                    <div className="font-semibold text-gray-800">{selectedFood.name}</div>
                    <div className="text-xs text-gray-600 mb-3">
                      {selectedFood.serving_label} · {selectedFood.calories} kcal · C {selectedFood.carbs_g}g · P {selectedFood.protein_g}g
                      {selectedFood.glycemic_index != null ? ` · GI ${selectedFood.glycemic_index}` : ''}
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="servings" className="text-sm text-gray-700">Servings</Label>
                      <Input
                        id="servings"
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className="h-10 w-24"
                      />
                      <Button onClick={applySelectedFood} className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]">
                        Add to meal
                      </Button>
                    </div>
                    {(() => {
                      const fl = getMedicationFoodFlags(activeMeds, { name: selectedFood.name, sodium_mg: selectedFood.sodium_mg, potassium_mg: selectedFood.potassium_mg });
                      return fl.length ? <div className="mt-3">{renderInteractionFlags(fl)}</div> : null;
                    })()}
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      ← Back to results
                    </button>
                  </div>
                )}

                {/* Results */}
                {!selectedFood && (
                  <div className="mt-3 max-h-80 overflow-y-auto space-y-2">
                    {searching ? (
                      <div className="py-8 flex items-center justify-center text-gray-400">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-8 text-center text-sm text-gray-500">
                        No foods found. Try another name, or use Manual Entry.
                      </div>
                    ) : (
                      searchResults.map((food) => (
                        <button
                          key={food.id}
                          onClick={() => { setSelectedFood(food); setServings('1'); }}
                          className="w-full text-left p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-[#1f7a8c] transition-all"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-800 truncate">{food.name}</span>
                            <span className="text-sm text-gray-500 flex-shrink-0">{food.calories} kcal</span>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {[food.category, food.serving_label].filter(Boolean).join(' · ')}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                <button
                  onClick={() => setStep('method')}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Manual Entry Form */}
          {step === 'manual' && (
            <div>
              <DialogHeader>
                <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-extrabold text-[#1f7a8c] dark:text-teal-400">Meal Details 🍲</DialogTitle>
                    {autoSaveIndicator && (
                      <div className="flex items-center gap-1 text-xs text-green-600 animate-fade-in">
                        <Save className="h-3 w-3" />
                        <span>Saved</span>
                      </div>
                    )}
                  </div>
                <DialogDescription>Enter the details for your meal.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                {/* AI analysis in progress */}
                {analyzing && (
                  <MealOptimizingLoader
                    message="Analyzing your food photo..."
                    subMessage="Identifying the meal and estimating calories & macros..."
                  />
                )}
                {/* Template Manager */}
                <div className="pb-3 border-b">
                  <TemplateManager
                    type="meal"
                    currentData={formData}
                    onApplyTemplate={handleApplyTemplate}
                    storageKey="meal-templates"
                  />
                </div>
                {/* Meal Type Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Meal Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {mealTypeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setFormData({ ...formData, mealType: option.id })}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            formData.mealType === option.id
                              ? 'border-[#1f7a8c] bg-[#E8F5F5]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time */}
                <div>
                  <Label htmlFor="time" className="text-sm font-medium text-gray-700 mb-2 block">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="h-12"
                  />
                </div>

                {/* Food Name */}
                <div>
                  <Label htmlFor="foodName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Food Name *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="foodName"
                      type="text"
                      placeholder="e.g., Jollof Rice with Chicken"
                      value={formData.foodName}
                      onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                      className="h-12 flex-1"
                      required
                    />
                    <VoiceInput
                      onTranscript={(text) => setFormData({ ...formData, foodName: text })}
                      placeholder="Speak food name"
                    />
                    {formData.foodName && findMatchingPairings(formData.foodName).length > 0 && (
                      <button
                        onClick={() => {
                          setCurrentFoodForPairing(formData.foodName);
                          setShowSmartPlate(true);
                        }}
                        className="px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                        type="button"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">Pairing Tips</span>
                      </button>
                    )}
                  </div>
                  {formData.foodName && findMatchingPairings(formData.foodName).length > 0 && (
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Bio-synergy suggestions available!</span>
                    </div>
                  )}
                </div>

                {/* Visual Portion Estimator */}
                <VisualPortionEstimator
                  selectedTier={portionTier}
                  onSelectTier={handlePortionSelect}
                />

                {/* Cooking Method Modifier (Clinical Preparation Variance) */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <span>🍳 Preparation Method</span>
                    </Label>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {cookingMethod === 'steamed_boiled'
                        ? '0% Added Fat (Base)'
                        : cookingMethod === 'grilled_baked'
                        ? '+15 kcal (Lean Roast)'
                        : cookingMethod === 'stewed'
                        ? '+50 kcal (Sauced)'
                        : '+120 kcal (Oil Absorbed)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'steamed_boiled', label: 'Boiled / Steamed', icon: '🥬', desc: 'Base yield' },
                      { id: 'grilled_baked', label: 'Grilled / Roasted', icon: '🍗', desc: 'Minimal oil' },
                      { id: 'stewed', label: 'Stewed in Sauce', icon: '🍲', desc: 'Medium fat' },
                      { id: 'fried', label: 'Deep Fried', icon: '🍟', desc: 'High oil absorbed' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleCookingMethodChange(m.id as any)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          cookingMethod === m.id
                            ? 'bg-[#1f7a8c] text-white border-[#1f7a8c] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{m.icon}</span>
                          <span className="text-[10.5px] font-bold leading-tight">{m.label}</span>
                        </div>
                        <span className={`text-[8.5px] mt-0.5 block ${cookingMethod === m.id ? 'text-teal-100' : 'text-slate-400'}`}>
                          {m.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nutrition Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="calories" className="text-sm font-medium text-gray-700 mb-2 block">
                      Calories
                    </Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="520"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein" className="text-sm font-medium text-gray-700 mb-2 block">
                      Protein (g)
                    </Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="35"
                      value={formData.protein}
                      onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs" className="text-sm font-medium text-gray-700 mb-2 block">
                      Carbs (g)
                    </Label>
                    <Input
                      id="carbs"
                      type="number"
                      placeholder="58"
                      value={formData.carbs}
                      onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fats" className="text-sm font-medium text-gray-700 mb-2 block">
                      Fats (g)
                    </Label>
                    <Input
                      id="fats"
                      type="number"
                      placeholder="18"
                      value={formData.fats}
                      onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sodium" className="text-sm font-medium text-gray-700 mb-2 block">
                      Sodium (mg)
                    </Label>
                    <Input
                      id="sodium"
                      type="number"
                      placeholder="350"
                      value={formData.sodium}
                      onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Clinical DII Anti-Inflammatory & DASH Indicator */}
                <div className="bg-slate-50 border border-teal-500/20 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {/efo|afang|spinach|okazi|onugbu|bitterleaf|fish|mackerel|salmon|zobo|greens/i.test(formData.foodName)
                        ? "🌿"
                        : "⚖️"}
                    </span>
                    <div>
                      <span className="font-extrabold text-slate-800 block">
                        {/efo|afang|spinach|okazi|onugbu|bitterleaf|fish|mackerel|salmon|zobo|greens/i.test(formData.foodName)
                          ? "Strongly Anti-Inflammatory Meal"
                          : "Metabolically Balanced Profile"}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {parseInt(formData.sodium, 10) > 800
                          ? "Sodium > 800mg (DASH warning: drink extra water)"
                          : "Within safe DASH cardiovascular target (<800mg)"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    DII -2.8
                  </span>
                </div>

                {/* Notes Field with Voice Input */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                    Notes (Optional)
                  </Label>
                  <div className="flex gap-2">
                    <textarea
                      id="notes"
                      placeholder="Add any notes about this meal..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f7a8c] focus:border-transparent resize-none"
                      rows={2}
                    />
                    <VoiceInput
                      onTranscript={handleVoiceTranscript}
                      placeholder="Speak notes"
                    />
                  </div>
                  {notes && (
                    <p className="text-xs text-gray-500 mt-1">{notes.length} characters</p>
                  )}
                </div>

                {/* Image Preview */}
                {capturedImage && (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={capturedImage} alt="Food" className="w-full h-32 object-cover" />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => setCapturedImage(null)}
                        className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Medication–food interaction flags */}
                {(() => {
                  const fl = getMedicationFoodFlags(activeMeds, { name: formData.foodName });
                  return fl.length ? <div className="pt-2">{renderInteractionFlags(fl)}</div> : null;
                })()}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setStep('method')}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleManualSave}
                    className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]"
                  >
                    Save Meal Log
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Camera Capture */}
      <CameraCapture
        isOpen={showCameraCapture}
        onClose={() => setShowCameraCapture(false)}
        onCapture={handleCameraCapture}
        mode="food"
        title="Analyze Food"
      />

      {/* Smart Plate Advisor - Bio-Synergy Suggestions */}
      <SmartPlateAdvisor
        foodItem={currentFoodForPairing}
        isOpen={showSmartPlate}
        onClose={() => setShowSmartPlate(false)}
        onAddSuggestion={(suggestion) => {
          // Add suggested pairing to food name
          setFormData({
            ...formData,
            foodName: `${formData.foodName} with ${suggestion}`,
          });
          setShowSmartPlate(false);
        }}
      />
    </>
  );
}
