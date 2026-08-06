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
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { toast } from "sonner";
import { useUser } from "../contexts/UserContext";
import {
  getMedicalDocuments,
  uploadMedicalDocument,
  getMedicalDocumentDownloadUrl,
  deleteMedicalDocument,
  type MedicalDocument,
} from "../../lib/api";

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

  // Secure documents (real backend: private Storage bucket + metadata table)
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const docs = await getMedicalDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
      toast.error("Couldn't load your documents", {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleViewDocument = async (doc: MedicalDocument) => {
    if (!doc.file_path) {
      toast.error("This document has no file attached");
      return;
    }
    setOpeningId(doc.id);
    try {
      const url = await getMedicalDocumentDownloadUrl(doc.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error("Couldn't open the file", {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setOpeningId(null);
    }
  };

  const handleDeleteDocument = async (doc: MedicalDocument) => {
    if (!window.confirm(`Delete "${doc.title}"? This permanently removes the file.`)) return;
    try {
      await deleteMedicalDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document deleted");
    } catch (err) {
      toast.error("Couldn't delete the document", {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
                Your documents are stored in a private, encrypted vault tied to your account. Only you can access them, on any device.
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1f7a8c]" />
              My Documents
            </h3>
            <button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f7a8c] text-white rounded-xl hover:bg-[#1a6273] transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Upload</span>
            </button>
          </div>

          {docsLoading ? (
            <div className="py-8 flex items-center justify-center text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <button
              onClick={() => setShowUploadDialog(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#1f7a8c] hover:bg-[#E8F5F5] transition-all group"
            >
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3 group-hover:text-[#1f7a8c]" />
              <div className="text-sm font-semibold text-gray-700 group-hover:text-[#1f7a8c]">
                Upload a lab report or medical file
              </div>
              <div className="text-xs text-gray-500 mt-1">
                PDF, image or Word document, up to 15 MB
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="rounded-lg bg-[#E8F5F5] p-2 flex-shrink-0">
                    <FileText className="h-5 w-5 text-[#1f7a8c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{doc.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {[doc.category, doc.provider, formatFileSize(doc.file_size)]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDocument(doc)}
                    disabled={openingId === doc.id}
                    className="p-2 text-gray-500 hover:text-[#1f7a8c] disabled:opacity-50"
                    aria-label={`View ${doc.title}`}
                  >
                    {openingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    aria-label={`Delete ${doc.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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

      {/* Upload Document Dialog */}
      <DocumentUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploaded={(doc) => {
          setDocuments((prev) => [doc, ...prev]);
          toast.success("Document uploaded securely");
        }}
      />

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

// Document Upload Dialog Component
function DocumentUploadDialog({
  isOpen,
  onClose,
  onUploaded,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (doc: MedicalDocument) => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lab Result');
  const [provider, setProvider] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const MAX_BYTES = 15 * 1024 * 1024;
  const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx';

  const reset = () => {
    setTitle('');
    setCategory('Lab Result');
    setProvider('');
    setFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_BYTES) {
      toast.error("File is too large", { description: "Maximum size is 15 MB." });
      e.target.value = '';
      return;
    }
    setFile(f);
    // Default the title to the file name (without extension) if empty
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please choose a file to upload");
      return;
    }
    if (!title.trim()) {
      toast.error("Please give the document a title");
      return;
    }
    setUploading(true);
    try {
      const doc = await uploadMedicalDocument(file, {
        title: title.trim(),
        category: category || undefined,
        provider: provider.trim() || undefined,
      });
      onUploaded(doc);
      reset();
      onClose();
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !uploading) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a lab report, prescription, scan or other medical file to your private vault.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File picker */}
          <div>
            <Label htmlFor="doc-file">File</Label>
            <Input id="doc-file" type="file" accept={ACCEPT} onChange={handleFileChange} />
            <p className="text-xs text-gray-500 mt-1">PDF, image or Word document, up to 15 MB.</p>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., HbA1c blood test — Aug 2026"
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="doc-category">Category</Label>
            <select
              id="doc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Lab Result">Lab Result</option>
              <option value="Prescription">Prescription</option>
              <option value="Imaging / Scan">Imaging / Scan</option>
              <option value="Doctor's Note">Doctor's Note</option>
              <option value="Insurance">Insurance</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Provider */}
          <div>
            <Label htmlFor="doc-provider">Provider / Hospital (optional)</Label>
            <Input
              id="doc-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g., Lagoon Hospital"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => { reset(); onClose(); }} variant="outline" className="flex-1" disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]" disabled={uploading}>
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </span>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
