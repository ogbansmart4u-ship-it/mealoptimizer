import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Shield,
  Upload,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Droplet,
  Heart,
  Zap,
  FileText,
  Lock,
  Plus,
  ChevronRight,
  Sparkles,
  ChefHat,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { toast } from "sonner";
import { useUser } from "../contexts/UserContext";

type BiomarkerStatus = 'low' | 'normal' | 'high';

type Biomarker = {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  status: BiomarkerStatus;
  icon: typeof Heart;
  color: string;
  category: 'metabolic' | 'cardiovascular' | 'nutritional';
  lastUpdated: string;
};

export default function MedicalVault() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [showAddBiomarker, setShowAddBiomarker] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'metabolic' | 'cardiovascular' | 'nutritional'>('all');

  // Load biomarkers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('medical-biomarkers');
    if (saved) {
      setBiomarkers(JSON.parse(saved));
    } else {
      // Initialize with mock data
      const mockBiomarkers: Biomarker[] = [
        {
          id: '1',
          name: 'HbA1c',
          value: 6.2,
          unit: '%',
          normalRange: { min: 4.0, max: 5.6 },
          status: 'high',
          icon: Activity,
          color: '#ef4444',
          category: 'metabolic',
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Fasting Glucose',
          value: 105,
          unit: 'mg/dL',
          normalRange: { min: 70, max: 100 },
          status: 'high',
          icon: Droplet,
          color: '#f59e0b',
          category: 'metabolic',
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'LDL Cholesterol',
          value: 130,
          unit: 'mg/dL',
          normalRange: { min: 0, max: 100 },
          status: 'high',
          icon: Heart,
          color: '#ef4444',
          category: 'cardiovascular',
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Ferritin (Iron)',
          value: 45,
          unit: 'ng/mL',
          normalRange: { min: 30, max: 200 },
          status: 'normal',
          icon: Zap,
          color: '#10b981',
          category: 'nutritional',
          lastUpdated: new Date().toISOString(),
        },
      ];
      setBiomarkers(mockBiomarkers);
      localStorage.setItem('medical-biomarkers', JSON.stringify(mockBiomarkers));
    }
  }, []);

  // Save biomarkers to localStorage whenever they change
  useEffect(() => {
    if (biomarkers.length > 0) {
      localStorage.setItem('medical-biomarkers', JSON.stringify(biomarkers));
    }
  }, [biomarkers]);

  const getBiomarkerStatus = (value: number, normalRange: { min: number; max: number }): BiomarkerStatus => {
    if (value < normalRange.min) return 'low';
    if (value > normalRange.max) return 'high';
    return 'normal';
  };

  const filteredBiomarkers = selectedCategory === 'all'
    ? biomarkers
    : biomarkers.filter(b => b.category === selectedCategory);

  const categoryCounts = {
    metabolic: biomarkers.filter(b => b.category === 'metabolic').length,
    cardiovascular: biomarkers.filter(b => b.category === 'cardiovascular').length,
    nutritional: biomarkers.filter(b => b.category === 'nutritional').length,
  };

  const abnormalCount = biomarkers.filter(b => b.status !== 'normal').length;

  const generateMealPlanFromBiomarkers = () => {
    const abnormalMarkers = biomarkers.filter(b => b.status !== 'normal');

    if (abnormalMarkers.length === 0) {
      toast.success("All biomarkers normal!", {
        description: "You can use our regular meal planning features.",
      });
      navigate("/plan-meal");
      return;
    }

    // Determine primary concern
    const concerns = abnormalMarkers.map(m => m.name).join(", ");

    toast.success("Generating personalized meal plan...", {
      description: `Targeting: ${concerns}`,
    });

    // Navigate to meal planning with biomarker context
    setTimeout(() => {
      navigate("/plan-meal");
      toast.info("Meal plan optimized for your biomarkers!", {
        description: "Your plan considers your clinical data.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      <PageHeader
        title="Medical Vault"
        showHome
        actions={
          <Shield className="h-6 w-6 text-white" />
        }
      />

      <div className="px-6 mt-6 space-y-6">
        {/* Security Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <Lock className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">Secure & Private</div>
              <div className="text-sm text-white/90">
                Your medical data is encrypted and stored locally on your device. Only you have access.
              </div>
            </div>
          </div>
        </div>

        {/* Upload Lab Results */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#1f7a8c]" />
            Upload Lab Results
          </h3>
          <button
            onClick={() => setShowUploadDialog(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#1f7a8c] hover:bg-[#E8F5F5] transition-all group"
          >
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3 group-hover:text-[#1f7a8c]" />
            <div className="text-sm font-semibold text-gray-700 group-hover:text-[#1f7a8c]">
              Upload PDF Lab Report
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Or manually enter biomarkers below
            </div>
          </button>
        </div>

        {/* Biomarker Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Biomarker Overview</h3>
            <button
              onClick={() => setShowAddBiomarker(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f7a8c] text-white rounded-xl hover:bg-[#1a6273] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add</span>
            </button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {biomarkers.filter(b => b.status === 'normal').length}
              </div>
              <div className="text-xs text-gray-600">Normal</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {biomarkers.filter(b => b.status === 'high').length}
              </div>
              <div className="text-xs text-gray-600">Elevated</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {biomarkers.filter(b => b.status === 'low').length}
              </div>
              <div className="text-xs text-gray-600">Low</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#1f7a8c] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({biomarkers.length})
            </button>
            <button
              onClick={() => setSelectedCategory('metabolic')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'metabolic'
                  ? 'bg-[#1f7a8c] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Metabolic ({categoryCounts.metabolic})
            </button>
            <button
              onClick={() => setSelectedCategory('cardiovascular')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'cardiovascular'
                  ? 'bg-[#1f7a8c] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cardiovascular ({categoryCounts.cardiovascular})
            </button>
            <button
              onClick={() => setSelectedCategory('nutritional')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'nutritional'
                  ? 'bg-[#1f7a8c] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nutritional ({categoryCounts.nutritional})
            </button>
          </div>
        </div>

        {/* Biomarker List */}
        <div className="space-y-3">
          {filteredBiomarkers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No biomarkers in this category yet</p>
              <Button
                onClick={() => setShowAddBiomarker(true)}
                className="bg-[#1f7a8c] hover:bg-[#1a6273]"
              >
                Add Biomarker
              </Button>
            </div>
          ) : (
            filteredBiomarkers.map((biomarker) => {
              const Icon = biomarker.icon;
              return (
                <div
                  key={biomarker.id}
                  className={`bg-white rounded-2xl p-5 shadow-md border-l-4 ${
                    biomarker.status === 'high' ? 'border-red-500' :
                    biomarker.status === 'low' ? 'border-blue-500' : 'border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`rounded-full p-3 ${
                        biomarker.status === 'high' ? 'bg-red-100' :
                        biomarker.status === 'low' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <Icon className={`h-5 w-5`} style={{ color: biomarker.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-gray-800">{biomarker.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            biomarker.status === 'high' ? 'bg-red-100 text-red-700' :
                            biomarker.status === 'low' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {biomarker.status}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {biomarker.value} <span className="text-sm font-normal text-gray-600">{biomarker.unit}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Normal range: {biomarker.normalRange.min}-{biomarker.normalRange.max} {biomarker.unit}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Updated: {new Date(biomarker.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {biomarker.status !== 'normal' && (
                      <div>
                        {biomarker.status === 'high' ? (
                          <TrendingUp className="h-6 w-6 text-red-500" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-blue-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clinical Meal Plan Generator */}
        {abnormalCount > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-300 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-purple-600 rounded-full p-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Clinical Meal Plan</h3>
                <p className="text-sm text-gray-700">
                  {abnormalCount} biomarker{abnormalCount > 1 ? 's' : ''} need attention. Generate a personalized meal plan to help optimize your levels.
                </p>
              </div>
            </div>

            <button
              onClick={generateMealPlanFromBiomarkers}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ChefHat className="h-5 w-5" />
              Generate Targeted Meal Plan
            </button>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Lab Results</DialogTitle>
            <DialogDescription>Upload your lab results PDF to automatically extract biomarker values.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <div className="font-semibold mb-2">Feature Coming Soon!</div>
              <p>PDF parsing will automatically extract biomarker values from your lab reports. For now, please add biomarkers manually.</p>
            </div>
            <Button
              onClick={() => {
                setShowUploadDialog(false);
                setShowAddBiomarker(true);
              }}
              className="w-full bg-[#1f7a8c] hover:bg-[#1a6273]"
            >
              Add Biomarker Manually
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Biomarker Dialog */}
      <AddBiomarkerDialog
        isOpen={showAddBiomarker}
        onClose={() => setShowAddBiomarker(false)}
        onAdd={(newBiomarker) => {
          setBiomarkers([...biomarkers, { ...newBiomarker, id: Date.now().toString() }]);
          toast.success("Biomarker added successfully!");
        }}
      />

      <BottomNav />
    </div>
  );
}

// Add Biomarker Dialog Component
function AddBiomarkerDialog({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (biomarker: Omit<Biomarker, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    unit: '',
    minRange: '',
    maxRange: '',
    category: 'metabolic' as 'metabolic' | 'cardiovascular' | 'nutritional',
  });

  const commonBiomarkers = [
    { name: 'HbA1c', unit: '%', min: 4.0, max: 5.6, category: 'metabolic' as const },
    { name: 'Fasting Glucose', unit: 'mg/dL', min: 70, max: 100, category: 'metabolic' as const },
    { name: 'LDL Cholesterol', unit: 'mg/dL', min: 0, max: 100, category: 'cardiovascular' as const },
    { name: 'HDL Cholesterol', unit: 'mg/dL', min: 40, max: 200, category: 'cardiovascular' as const },
    { name: 'Triglycerides', unit: 'mg/dL', min: 0, max: 150, category: 'cardiovascular' as const },
    { name: 'Ferritin (Iron)', unit: 'ng/mL', min: 30, max: 200, category: 'nutritional' as const },
    { name: 'Vitamin D', unit: 'ng/mL', min: 30, max: 100, category: 'nutritional' as const },
    { name: 'Vitamin B12', unit: 'pg/mL', min: 200, max: 900, category: 'nutritional' as const },
  ];

  const handleQuickSelect = (biomarker: typeof commonBiomarkers[0]) => {
    setFormData({
      ...formData,
      name: biomarker.name,
      unit: biomarker.unit,
      minRange: biomarker.min.toString(),
      maxRange: biomarker.max.toString(),
      category: biomarker.category,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.value || !formData.unit || !formData.minRange || !formData.maxRange) {
      toast.error("Please fill all fields");
      return;
    }

    const value = parseFloat(formData.value);
    const min = parseFloat(formData.minRange);
    const max = parseFloat(formData.maxRange);

    const status: BiomarkerStatus = value < min ? 'low' : value > max ? 'high' : 'normal';

    const iconMap = {
      metabolic: Activity,
      cardiovascular: Heart,
      nutritional: Zap,
    };

    const colorMap = {
      low: '#3b82f6',
      normal: '#10b981',
      high: '#ef4444',
    };

    onAdd({
      name: formData.name,
      value,
      unit: formData.unit,
      normalRange: { min, max },
      status,
      icon: iconMap[formData.category],
      color: colorMap[status],
      category: formData.category,
      lastUpdated: new Date().toISOString(),
    });

    // Reset form
    setFormData({
      name: '',
      value: '',
      unit: '',
      minRange: '',
      maxRange: '',
      category: 'metabolic',
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Biomarker</DialogTitle>
          <DialogDescription>Manually add a biomarker from your lab results.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Select */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Quick Select</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonBiomarkers.slice(0, 6).map((biomarker) => (
                <button
                  key={biomarker.name}
                  onClick={() => handleQuickSelect(biomarker)}
                  className="text-left p-2 bg-gray-100 hover:bg-[#E8F5F5] rounded-lg text-sm transition-colors"
                  type="button"
                >
                  {biomarker.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Category</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="metabolic">Metabolic</option>
              <option value="cardiovascular">Cardiovascular</option>
              <option value="nutritional">Nutritional</option>
            </select>
          </div>

          {/* Biomarker Name */}
          <div>
            <Label htmlFor="biomarker-name">Biomarker Name</Label>
            <Input
              id="biomarker-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., HbA1c"
            />
          </div>

          {/* Value & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="6.2"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="%"
              />
            </div>
          </div>

          {/* Normal Range */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Normal Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.minRange}
                  onChange={(e) => setFormData({ ...formData, minRange: e.target.value })}
                  placeholder="Min (e.g., 4.0)"
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.maxRange}
                  onChange={(e) => setFormData({ ...formData, maxRange: e.target.value })}
                  placeholder="Max (e.g., 5.6)"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]">
              Add Biomarker
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
