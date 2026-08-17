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
import MascotLoader from "../components/MascotLoader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { toast } from "sonner";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  getMedicalDocuments,
  uploadMedicalDocument,
  getMedicalDocumentDownloadUrl,
  deleteMedicalDocument,
  type MedicalDocument,
  getCollection,
  createCollectionItem,
  deleteCollectionItem,
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

// Maps stored English document-category values to translation keys.
const DOC_CAT_KEY: Record<string, string> = {
  'Lab Result': 'vault.doccat.lab',
  'Prescription': 'vault.doccat.prescription',
  'Imaging / Scan': 'vault.doccat.imaging',
  "Doctor's Note": 'vault.doccat.doctorNote',
  'Insurance': 'vault.doccat.insurance',
  'Other': 'vault.doccat.other',
};

export default function MedicalVault() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const { t } = useLanguage();
  // Biomarker status/category and doc-category labels; stored values stay English.
  const statusLabel = (s: string) => (s === 'high' ? t('vault.bstatusHigh') : s === 'low' ? t('vault.statusLow') : t('vault.statusNormal'));
  const bioCatLabel = (c: string) => t(`vault.cat.${c}`);
  const docCatLabel = (c: string | null | undefined) => (c && DOC_CAT_KEY[c] ? t(DOC_CAT_KEY[c]) : (c || ''));
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
      toast.error(t("vault.toast.loadDocsFail"), {
        description: err instanceof Error ? err.message : t("vault.toast.tryAgain"),
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
      toast.error(t("vault.toast.noFile"));
      return;
    }
    setOpeningId(doc.id);
    try {
      const url = await getMedicalDocumentDownloadUrl(doc.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(t("vault.toast.openFail"), {
        description: err instanceof Error ? err.message : t("vault.toast.tryAgain"),
      });
    } finally {
      setOpeningId(null);
    }
  };

  const handleDeleteDocument = async (doc: MedicalDocument) => {
    if (!window.confirm(t("vault.confirmDeleteDoc").replace("{title}", doc.title))) return;
    try {
      await deleteMedicalDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success(t("vault.toast.docDeleted"));
    } catch (err) {
      toast.error(t("vault.toast.deleteDocFail"), {
        description: err instanceof Error ? err.message : t("vault.toast.tryAgain"),
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Biomarkers now persist per-account in the universal collections store.
  const [biomarkersLoading, setBiomarkersLoading] = useState(true);

  const iconForCategory = (category: Biomarker['category']) =>
    category === 'cardiovascular' ? Heart : category === 'nutritional' ? Zap : Activity;
  const colorForStatus = (status: BiomarkerStatus) =>
    status === 'high' ? '#ef4444' : status === 'low' ? '#3b82f6' : '#10b981';

  // Stored biomarkers are plain JSON; rebuild the non-serializable fields
  // (icon component, color, derived status) from the saved values.
  const hydrateBiomarker = (item: any): Biomarker => {
    const nr = item.normalRange || { min: 0, max: 0 };
    const status: BiomarkerStatus =
      item.value < nr.min ? 'low' : item.value > nr.max ? 'high' : 'normal';
    return { ...item, normalRange: nr, status, icon: iconForCategory(item.category), color: colorForStatus(status) };
  };

  useEffect(() => {
    getCollection('biomarkers')
      .then((items) => setBiomarkers((items || []).map(hydrateBiomarker)))
      .catch((err) => {
        console.error('Failed to load biomarkers:', err);
        toast.error(t("vault.toast.loadBioFail"), {
          description: err instanceof Error ? err.message : t("vault.toast.tryAgain"),
        });
      })
      .finally(() => setBiomarkersLoading(false));
  }, []);

  const handleAddBiomarker = async (b: Omit<Biomarker, 'id'>) => {
    // Persist only serializable fields (icon is a component, status/color are derived)
    const payload = {
      name: b.name,
      value: b.value,
      unit: b.unit,
      normalRange: b.normalRange,
      category: b.category,
      lastUpdated: b.lastUpdated,
    };
    try {
      const created = await createCollectionItem('biomarkers', payload);
      setBiomarkers((prev) => [...prev, hydrateBiomarker(created)]);
      toast.success(t("vault.toast.bioAdded"));
    } catch (err) {
      toast.error(t("vault.toast.saveBioFail"), {
        description: err instanceof Error ? err.message : t("vault.toast.tryAgain"),
      });
    }
  };

  const handleDeleteBiomarker = async (id: string) => {
    try {
      await deleteCollectionItem('biomarkers', id);
      setBiomarkers((prev) => prev.filter((b) => b.id !== id));
      toast.success(t("vault.toast.bioRemoved"));
    } catch (err) {
      toast.error(t("vault.toast.removeBioFail"), {
        description: err instanceof Error ? err.message : t("vault.toast.tryAgain"),
      });
    }
  };

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
      toast.success(t("vault.toast.allNormalTitle"), {
        description: t("vault.toast.allNormalDesc"),
      });
      navigate("/plan-meal");
      return;
    }

    // Determine primary concern
    const concerns = abnormalMarkers.map(m => m.name).join(", ");

    toast.success(t("vault.toast.generatingTitle"), {
      description: t("vault.toast.targeting").replace("{concerns}", concerns),
    });

    // Navigate to meal planning with biomarker context
    setTimeout(() => {
      navigate("/plan-meal");
      toast.info(t("vault.toast.optimizedTitle"), {
        description: t("vault.toast.optimizedDesc"),
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      <PageHeader
        title={t("vault.title")}
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
              <div className="font-semibold mb-1">{t("vault.secureTitle")}</div>
              <div className="text-sm text-white/90">
                {t("vault.secureDesc")}
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#1f7a8c]" />
              {t("vault.myDocuments")}
            </h3>
            <button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f7a8c] text-white rounded-xl hover:bg-[#1a6273] transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">{t("vault.upload")}</span>
            </button>
          </div>

          {docsLoading ? (
            <MascotLoader label={t("vault.loadingDocs")} size={72} />
          ) : documents.length === 0 ? (
            <button
              onClick={() => setShowUploadDialog(true)}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-[#1f7a8c] hover:bg-[#E8F5F5] transition-all group"
            >
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3 group-hover:text-[#1f7a8c]" />
              <div className="text-sm font-semibold text-gray-700 group-hover:text-[#1f7a8c]">
                {t("vault.uploadPrompt")}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t("vault.uploadHint")}
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
                      {[docCatLabel(doc.category), doc.provider, formatFileSize(doc.file_size)]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDocument(doc)}
                    disabled={openingId === doc.id}
                    className="p-2 text-gray-500 hover:text-[#1f7a8c] disabled:opacity-50"
                    aria-label={`${t("vault.view")} ${doc.title}`}
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
                    aria-label={`${t("common.delete")} ${doc.title}`}
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
            <h3 className="text-lg font-semibold text-gray-800">{t("vault.biomarkerOverview")}</h3>
            <button
              onClick={() => setShowAddBiomarker(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f7a8c] text-white rounded-xl hover:bg-[#1a6273] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">{t("common.add")}</span>
            </button>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {biomarkers.filter(b => b.status === 'normal').length}
              </div>
              <div className="text-xs text-gray-600">{t("vault.statusNormal")}</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {biomarkers.filter(b => b.status === 'high').length}
              </div>
              <div className="text-xs text-gray-600">{t("vault.statusElevated")}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {biomarkers.filter(b => b.status === 'low').length}
              </div>
              <div className="text-xs text-gray-600">{t("vault.statusLow")}</div>
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
              {t("logs.filter.all")} ({biomarkers.length})
            </button>
            <button
              onClick={() => setSelectedCategory('metabolic')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'metabolic'
                  ? 'bg-[#1f7a8c] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t("vault.cat.metabolic")} ({categoryCounts.metabolic})
            </button>
            <button
              onClick={() => setSelectedCategory('cardiovascular')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'cardiovascular'
                  ? 'bg-[#1f7a8c] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t("vault.cat.cardiovascular")} ({categoryCounts.cardiovascular})
            </button>
            <button
              onClick={() => setSelectedCategory('nutritional')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'nutritional'
                  ? 'bg-[#1f7a8c] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t("vault.cat.nutritional")} ({categoryCounts.nutritional})
            </button>
          </div>
        </div>

        {/* Biomarker List */}
        <div className="space-y-3">
          {biomarkersLoading ? (
            <div className="bg-white rounded-2xl p-8">
              <MascotLoader label={t("vault.loadingBiomarkers")} size={72} />
            </div>
          ) : filteredBiomarkers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">{t("vault.noBiomarkers")}</p>
              <Button
                onClick={() => setShowAddBiomarker(true)}
                className="bg-[#1f7a8c] hover:bg-[#1a6273]"
              >
                {t("vault.addBiomarker")}
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
                            {statusLabel(biomarker.status)}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {biomarker.value} <span className="text-sm font-normal text-gray-600">{biomarker.unit}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("vault.normalRange").replace("{min}", String(biomarker.normalRange.min)).replace("{max}", String(biomarker.normalRange.max)).replace("{unit}", biomarker.unit)}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {t("vault.updatedLabel")} {new Date(biomarker.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {biomarker.status !== 'normal' && (
                        biomarker.status === 'high' ? (
                          <TrendingUp className="h-6 w-6 text-red-500" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-blue-500" />
                        )
                      )}
                      <button
                        onClick={() => handleDeleteBiomarker(biomarker.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        aria-label={`${t("common.delete")} ${biomarker.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{t("vault.clinicalMealPlan")}</h3>
                <p className="text-sm text-gray-700">
                  {t(abnormalCount > 1 ? "vault.needAttentionMany" : "vault.needAttentionOne").replace("{n}", String(abnormalCount))}
                </p>
              </div>
            </div>

            <button
              onClick={generateMealPlanFromBiomarkers}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ChefHat className="h-5 w-5" />
              {t("vault.generateTargeted")}
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
          toast.success(t("vault.toast.docUploaded"));
        }}
      />

      {/* Add Biomarker Dialog */}
      <AddBiomarkerDialog
        isOpen={showAddBiomarker}
        onClose={() => setShowAddBiomarker(false)}
        onAdd={handleAddBiomarker}
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
  const { t } = useLanguage();
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
      toast.error(t("vault.toast.fileTooBig"), { description: t("vault.toast.maxSize") });
      e.target.value = '';
      return;
    }
    setFile(f);
    // Default the title to the file name (without extension) if empty
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error(t("vault.toast.chooseFile"));
      return;
    }
    if (!title.trim()) {
      toast.error(t("vault.toast.giveTitle"));
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
      toast.error(t("vault.toast.uploadFail"), {
        description: err instanceof Error ? err.message : t("vault.toast.tryAgain"),
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !uploading) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("vault.uploadTitle")}</DialogTitle>
          <DialogDescription>
            {t("vault.uploadDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File picker */}
          <div>
            <Label htmlFor="doc-file">{t("vault.file")}</Label>
            <Input id="doc-file" type="file" accept={ACCEPT} onChange={handleFileChange} />
            <p className="text-xs text-gray-500 mt-1">{t("vault.fileHint")}</p>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="doc-title">{t("vault.titleLabel")}</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("vault.titlePlaceholder")}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="doc-category">{t("goals.category")}</Label>
            <select
              id="doc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Lab Result">{t("vault.doccat.lab")}</option>
              <option value="Prescription">{t("vault.doccat.prescription")}</option>
              <option value="Imaging / Scan">{t("vault.doccat.imaging")}</option>
              <option value="Doctor's Note">{t("vault.doccat.doctorNote")}</option>
              <option value="Insurance">{t("vault.doccat.insurance")}</option>
              <option value="Other">{t("vault.doccat.other")}</option>
            </select>
          </div>

          {/* Provider */}
          <div>
            <Label htmlFor="doc-provider">{t("vault.provider")}</Label>
            <Input
              id="doc-provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder={t("vault.providerPlaceholder")}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={() => { reset(); onClose(); }} variant="outline" className="flex-1" disabled={uploading}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]" disabled={uploading}>
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("vault.uploading")}
                </span>
              ) : (
                t("vault.upload")
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
  const { t } = useLanguage();
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
      toast.error(t("vault.toast.fillAll"));
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
          <DialogTitle>{t("vault.addBiomarker")}</DialogTitle>
          <DialogDescription>{t("vault.addBioDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Select */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t("vault.quickSelect")}</Label>
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
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t("goals.category")}</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="metabolic">{t("vault.cat.metabolic")}</option>
              <option value="cardiovascular">{t("vault.cat.cardiovascular")}</option>
              <option value="nutritional">{t("vault.cat.nutritional")}</option>
            </select>
          </div>

          {/* Biomarker Name */}
          <div>
            <Label htmlFor="biomarker-name">{t("vault.biomarkerName")}</Label>
            <Input
              id="biomarker-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("vault.biomarkerNamePlaceholder")}
            />
          </div>

          {/* Value & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="value">{t("vault.value")}</Label>
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
              <Label htmlFor="unit">{t("goals.unit")}</Label>
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
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t("vault.normalRangeLabel")}</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.minRange}
                  onChange={(e) => setFormData({ ...formData, minRange: e.target.value })}
                  placeholder={t("vault.minPlaceholder")}
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.maxRange}
                  onChange={(e) => setFormData({ ...formData, maxRange: e.target.value })}
                  placeholder={t("vault.maxPlaceholder")}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]">
              {t("vault.addBiomarker")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
