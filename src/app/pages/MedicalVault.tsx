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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-teal-900/40 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer"
          >
            <Shield className="h-5 w-5 text-teal-400" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <Lock size={15} className="text-teal-400" />
              <h1 className="text-base font-black text-white tracking-wide">
                Medical Vault &amp; Lab Reports
              </h1>
            </div>
            <span className="text-[10.5px] text-teal-300 font-bold">
              Encrypted Clinical Records &amp; 1-Tap Doctor PDF
            </span>
          </div>
        </div>

        {/* Doctor Export Pill */}
        <button
          onClick={() => navigate("/health-report")}
          className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-md cursor-pointer hover:opacity-95 transition-all"
        >
          <FileText size={13} />
          <span>Doctor PDF</span>
        </button>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-xl mx-auto">
        {/* 10X 1-TAP DOCTOR CLINICAL REPORT HERO BANNER */}
        <div className="bg-gradient-to-br from-[#0c2a33] via-[#093540] to-slate-950 rounded-3xl p-5 border-2 border-teal-400/40 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10 mb-3">
            <div className="max-w-[70%]">
              <span className="text-[10px] uppercase font-black tracking-wider text-teal-300 bg-teal-950 px-2.5 py-0.5 rounded-full border border-teal-800">
                Physician &amp; Clinic Ready
              </span>
              <h2 className="text-xl font-black text-white mt-1.5 leading-tight">
                14-Day Doctor Health Report 📄
              </h2>
              <p className="text-xs text-teal-100/90 mt-1 leading-snug">
                Export an organized medical summary showing your blood pressure trends, meal scans, and glucose stability to take straight to your doctor.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center">
              <div className="p-3 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-500/30">
                <FileText size={32} />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/health-report")}
            className="w-full py-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <span>Generate Doctor Health PDF (14-Day Dossier)</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* SECURE LAB LOCKER (DOCUMENTS & LAB SLIPS) */}
        <div className="bg-slate-900/90 border border-teal-500/20 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">
                  My Lab Results &amp; Hospital Scans
                </h3>
                <p className="text-[11px] text-slate-400">
                  Upload photos of clinic lab slips, prescriptions &amp; tests
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer hover:bg-teal-400 transition-colors shadow-sm"
            >
              <Plus size={14} />
              <span>Upload</span>
            </button>
          </div>

          {docsLoading ? (
            <MascotLoader label={t("vault.loadingDocs")} size={72} />
          ) : documents.length === 0 ? (
            <button
              onClick={() => setShowUploadDialog(true)}
              className="w-full border-2 border-dashed border-slate-700 hover:border-teal-400 rounded-2xl p-6 text-center transition-all bg-white/5 group cursor-pointer"
            >
              <FileText className="h-10 w-10 text-slate-500 mx-auto mb-2 group-hover:text-teal-300" />
              <div className="text-xs font-bold text-white group-hover:text-teal-200">
                Tap here to upload a photo of your Lab Test or Prescription
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Encrypted &amp; private. Stored securely on your account.
              </div>
            </button>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{doc.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {[docCatLabel(doc.category), doc.provider, formatFileSize(doc.file_size)].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleViewDocument(doc)}
                      disabled={openingId === doc.id}
                      className="p-1.5 text-teal-300 hover:text-white bg-white/10 rounded-lg cursor-pointer"
                      title="View file"
                    >
                      {openingId === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      className="p-1.5 text-red-400 hover:text-red-300 bg-white/10 rounded-lg cursor-pointer"
                      title="Delete file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BIOMARKERS OVERVIEW */}
        <div className="bg-slate-900/90 border border-teal-500/20 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white">
                Key Health Numbers (Biomarkers)
              </h3>
              <p className="text-[11px] text-slate-400">
                Track your blood sugar, blood pressure, and cholesterol
              </p>
            </div>
            <button
              onClick={() => setShowAddBiomarker(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-white/20 transition-colors"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* Status summary pill counts */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-2.5 text-center">
              <div className="text-lg font-black text-emerald-300">
                {biomarkers.filter(b => b.status === 'normal').length}
              </div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Optimal Range 🟢</div>
            </div>
            <div className="bg-amber-950/60 border border-amber-500/30 rounded-2xl p-2.5 text-center">
              <div className="text-lg font-black text-amber-300">
                {biomarkers.filter(b => b.status === 'high').length}
              </div>
              <div className="text-[10px] text-amber-400 font-bold uppercase">Elevated 🟡</div>
            </div>
            <div className="bg-blue-950/60 border border-blue-500/30 rounded-2xl p-2.5 text-center">
              <div className="text-lg font-black text-blue-300">
                {biomarkers.filter(b => b.status === 'low').length}
              </div>
              <div className="text-[10px] text-blue-400 font-bold uppercase">Below Target 🔵</div>
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
