import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Camera, Utensils, Coffee, Apple, Zap, Plus, X, Sparkles, Save, Search, Loader2, AlertTriangle } from 'lucide-react';
import { searchFoods, getMedications, type FoodItem } from '../../lib/api';
import { getMedicationFoodFlags, type InteractionFlag } from '../data/medicationInteractions';
import CameraCapture from './CameraCapture';
import SmartPlateAdvisor from './SmartPlateAdvisor';
import { findMatchingPairings } from '../data/nutrientPairings';
import { toast } from 'sonner';
import { useAutoSave, getAutoSavedData, clearAutoSavedData } from '../hooks/useAutoSave';
import { VoiceInput } from './VoiceInput';
import { TemplateManager } from './TemplateManager';

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
  onSave: (log: MealLog) => void;
  selectedDate?: Date;
};

export default function AddMealLog({ isOpen, onClose, onSave, selectedDate }: AddMealLogProps) {
  const [step, setStep] = useState<'method' | 'manual' | 'camera' | 'search'>('method');
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
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
    }, 300);
    return () => { active = false; clearTimeout(t); };
  }, [searchQuery, step]);

  const applySelectedFood = () => {
    if (!selectedFood) return;
    const mult = Math.max(parseFloat(servings) || 1, 0.25);
    const scale = (v: number | null) => (v == null ? '' : String(Math.round(v * mult)));
    setFormData((prev) => ({
      ...prev,
      foodName: mult !== 1 ? `${servings} × ${selectedFood.name}` : selectedFood.name,
      calories: scale(selectedFood.calories),
      protein: scale(selectedFood.protein_g),
      carbs: scale(selectedFood.carbs_g),
      fats: scale(selectedFood.fat_g),
    }));
    setSelectedFood(null);
    setServings('1');
    setStep('manual');
    toast.success('Food added — review and save');
  };

  const [formData, setFormData] = useState({
    mealType: 'breakfast' as MealType,
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
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

  const handleCameraCapture = (imageData: string, source: 'camera' | 'upload') => {
    setCapturedImage(imageData);
    setShowCameraCapture(false);

    // Mock AI analysis - in production, send to API
    toast.success('Food analyzed! Review and save.');
    setFormData({
      ...formData,
      foodName: 'Jollof Rice with Chicken',
      calories: '520',
      protein: '35',
      carbs: '58',
      fats: '18',
    });
    setStep('manual');
  };

  const handleManualSave = () => {
    // Validation
    if (!formData.foodName.trim()) {
      toast.error('Please enter food name');
      return;
    }

    const newLog: MealLog = {
      id: Date.now().toString(),
      date: (selectedDate || new Date()).toISOString().split('T')[0],
      time: formData.time,
      mealType: formData.mealType,
      foodName: formData.foodName,
      calories: parseInt(formData.calories) || 0,
      protein: parseInt(formData.protein) || 0,
      carbs: parseInt(formData.carbs) || 0,
      fats: parseInt(formData.fats) || 0,
      imageUrl: capturedImage || undefined,
      energyRating: 4,
      digestiveComfort: 4,
      bloodSugarImpact: 'medium',
    };

    onSave(newLog);

    // Save smart defaults for next entry
    localStorage.setItem('last-meal-defaults', JSON.stringify({
      calories: formData.calories,
      protein: formData.protein,
      carbs: formData.carbs,
      fats: formData.fats,
    }));

    // Clear the auto-saved draft
    clearAutoSavedData('meal-log-draft');

    toast.success('Meal logged successfully!');
    handleClose();
  };

  const handleClose = () => {
    setStep('method');
    setCapturedImage(null);
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
          {/* Method Selection */}
          {step === 'method' && (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl text-[#1f7a8c]">Log a Meal</DialogTitle>
                  <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <DialogDescription>Choose how you'd like to log your meal.</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-6">
                {/* Analyze with Camera */}
                <button
                  onClick={() => setShowCameraCapture(true)}
                  className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="bg-white/20 rounded-full p-3">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Analyze Food with Camera</div>
                    <div className="text-sm text-white/80">Take photo for automatic analysis</div>
                  </div>
                </button>

                {/* Search Food Database */}
                <button
                  onClick={() => setStep('search')}
                  className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 hover:border-[#1f7a8c] rounded-xl transition-all"
                >
                  <div className="bg-[#E8F5F5] rounded-full p-3">
                    <Search className="h-6 w-6 text-[#1f7a8c]" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-800">Search Food Database</div>
                    <div className="text-sm text-gray-600">Nigerian & West African foods with nutrition</div>
                  </div>
                </button>

                {/* Manual Entry */}
                <button
                  onClick={() => setStep('manual')}
                  className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 hover:border-[#1f7a8c] rounded-xl transition-all"
                >
                  <div className="bg-[#E8F5F5] rounded-full p-3">
                    <Plus className="h-6 w-6 text-[#1f7a8c]" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-800">Enter Manually</div>
                    <div className="text-sm text-gray-600">Type food details yourself</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Food Database Search */}
          {step === 'search' && (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl text-[#1f7a8c]">Search Foods</DialogTitle>
                  <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-2xl text-[#1f7a8c]">Meal Details</DialogTitle>
                    {autoSaveIndicator && (
                      <div className="flex items-center gap-1 text-xs text-green-600 animate-fade-in">
                        <Save className="h-3 w-3" />
                        <span>Saved</span>
                      </div>
                    )}
                  </div>
                  <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <DialogDescription>Enter the details for your meal.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
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
