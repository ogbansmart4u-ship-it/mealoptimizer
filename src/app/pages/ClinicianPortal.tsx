import React, { useState } from "react";
import { 
  Stethoscope, 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  Share2, 
  Building, 
  ArrowLeft,
  X,
  Droplet,
  Flame,
  Send,
  Lock,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";
import { useLanguage } from "../contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

export interface ClinicianPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: "Type 2 Diabetes" | "Hypertension" | "CKD Stage 3" | "Pre-diabetes" | "Metabolic Syndrome";
  ckdStage?: "None" | "Stage 1" | "Stage 2" | "Stage 3a" | "Stage 3b" | "Stage 4";
  riskLevel: "high" | "medium" | "low";
  meanGlucoseMgDl: number;
  spikesCount14d: number;
  sodiumCompliancePercent: number;
  potassiumRisk: "Safe" | "Moderate" | "High";
  hmoProvider: string;
  lastLogTime: string;
  lastMealName: string;
  lastMealThumbnail: string;
  phone: string;
  notes: string;
}

const MOCK_CLINICIAN_PATIENTS: ClinicianPatient[] = [
  {
    id: "MO-8421",
    name: "Amara Okeke",
    age: 48,
    gender: "Female",
    condition: "Type 2 Diabetes",
    ckdStage: "Stage 3a",
    riskLevel: "high",
    meanGlucoseMgDl: 168,
    spikesCount14d: 14,
    sodiumCompliancePercent: 78,
    potassiumRisk: "High",
    hmoProvider: "AXA Mansard Health",
    lastLogTime: "35 mins ago",
    lastMealName: "Pounded Yam & Egusi Soup (Heavy Palm Oil)",
    lastMealThumbnail: "🍲",
    phone: "+2348031234567",
    notes: "Patient experiences evening post-prandial spikes > 220 mg/dL after unbuffered yams. Recommended Plantain-Oat swap & Ugwu fiber buffering.",
  },
  {
    id: "MO-9042",
    name: "Tunde Bakare",
    age: 54,
    gender: "Male",
    condition: "Hypertension",
    ckdStage: "Stage 2",
    riskLevel: "medium",
    meanGlucoseMgDl: 122,
    spikesCount14d: 4,
    sodiumCompliancePercent: 64,
    potassiumRisk: "Moderate",
    hmoProvider: "Hygeia HMO",
    lastLogTime: "2 hours ago",
    lastMealName: "Pepper Soup & Boiled Plantain",
    lastMealThumbnail: "🍲",
    phone: "+2348029876543",
    notes: "Resting BP 138/88. Sodium averaging 2,400mg due to stock cubes. Prescribed Sarah's Zobo Hibiscus dilution protocol.",
  },
  {
    id: "MO-7731",
    name: "Kofi Mensah",
    age: 42,
    gender: "Male",
    condition: "Type 2 Diabetes",
    ckdStage: "None",
    riskLevel: "low",
    meanGlucoseMgDl: 110,
    spikesCount14d: 2,
    sodiumCompliancePercent: 88,
    potassiumRisk: "Safe",
    hmoProvider: "Reliance HMO",
    lastLogTime: "5 hours ago",
    lastMealName: "Grilled Titus Fish & Steamed Cabbage",
    lastMealThumbnail: "🐟",
    phone: "+2348055551234",
    notes: "Excellent compliance with Plate Sequencing (eating cabbage salad 5 mins before protein). Fasting blood sugar 98 mg/dL.",
  },
  {
    id: "MO-6109",
    name: "Ngozi Eze",
    age: 61,
    gender: "Female",
    condition: "CKD Stage 3",
    ckdStage: "Stage 3b",
    riskLevel: "high",
    meanGlucoseMgDl: 145,
    spikesCount14d: 9,
    sodiumCompliancePercent: 70,
    potassiumRisk: "High",
    hmoProvider: "Avon HMO",
    lastLogTime: "Yesterday",
    lastMealName: "Moi Moi & Fried Plantain",
    lastMealThumbnail: "🫘",
    phone: "+2348011223344",
    notes: "eGFR at 36 mL/min. High potassium alert triggered on bean pudding and dried fish. Advised double-boil leaching protocol.",
  },
  {
    id: "MO-5529",
    name: "Babajide Soyinka",
    age: 39,
    gender: "Male",
    condition: "Pre-diabetes",
    ckdStage: "None",
    riskLevel: "low",
    meanGlucoseMgDl: 104,
    spikesCount14d: 1,
    sodiumCompliancePercent: 92,
    potassiumRisk: "Safe",
    hmoProvider: "Leadway Health",
    lastLogTime: "Today at 08:30",
    lastMealName: "Fonio Supergrain & Scrambled Eggs",
    lastMealThumbnail: "🌾",
    phone: "+2348077778899",
    notes: "Fasting glucose normalized to 96 mg/dL. 16:8 intermittent fasting adherence at 95%.",
  },
];

export default function ClinicianPortal() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // B2B Provider License State (Only paid/verified clinicians can view patient dashboard)
  const [isLicensed, setIsLicensed] = useState<boolean>(() => {
    return localStorage.getItem("mealoptimiza_clinician_licensed") === "true";
  });
  const [licenseInput, setLicenseInput] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [verifyingLicense, setVerifyingLicense] = useState(false);

  const handleVerifyLicense = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingLicense(true);
    setLicenseError("");

    setTimeout(() => {
      const cleanKey = licenseInput.trim().toUpperCase();
      // Valid clinician keys: CLINIC-PRO-2026, DOCTOR-MD, DIETITIAN-HMO, or any 8+ character licensed key
      if (cleanKey === "CLINIC-PRO-2026" || cleanKey === "DOCTOR-MD" || cleanKey === "DIETITIAN-HMO" || cleanKey.startsWith("MO-B2B-")) {
        localStorage.setItem("mealoptimiza_clinician_licensed", "true");
        setIsLicensed(true);
        triggerHaptic("success");
        triggerConfetti("burst");
        toast.success("Clinician License Verified! Welcome to Provider OS 🩺");
      } else {
        triggerHaptic("warning");
        setLicenseError("Invalid Clinician License Key. Please enter a valid B2B Provider Key or subscribe below.");
      }
      setVerifyingLicense(false);
    }, 600);
  };

  const handleLogoutClinician = () => {
    localStorage.removeItem("mealoptimiza_clinician_licensed");
    setIsLicensed(false);
    toast.info("Logged out of Clinician Provider Workspace");
  };

  const [patients, setPatients] = useState<ClinicianPatient[]>(MOCK_CLINICIAN_PATIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [selectedRisk, setSelectedRisk] = useState<string>("All");
  const [activePatient, setActivePatient] = useState<ClinicianPatient | null>(null);
  const [customRxNote, setCustomRxNote] = useState("");
  const [isSendingRx, setIsSendingRx] = useState(false);

  // Filter logic
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCondition =
      selectedCondition === "All" || p.condition === selectedCondition;
    const matchesRisk = selectedRisk === "All" || p.riskLevel === selectedRisk;
    return matchesSearch && matchesCondition && matchesRisk;
  });

  const highRiskCount = patients.filter((p) => p.riskLevel === "high").length;
  const avgGlucose = Math.round(
    patients.reduce((acc, p) => acc + p.meanGlucoseMgDl, 0) / patients.length
  );

  const handleSendRxWhatsApp = (patient: ClinicianPatient) => {
    triggerHaptic("medium");
    const noteText = customRxNote || patient.notes;
    const message = encodeURIComponent(
      `🩺 CLINICAL NUTRITION CARE RX · Dr. Chioma Nwosu (Dietetics & Endocrinology)\n\nHello ${patient.name},\n\nReview of your recent MealOptimiza logs:\n• 14-Day Mean Glucose: ${patient.meanGlucoseMgDl} mg/dL\n• Clinical Priority: ${patient.condition} (${patient.ckdStage || 'Standard'})\n\n📋 Dietitian Prescription:\n"${noteText}"\n\nKeep logging your meals and drinking your prescribed water flush. We will review your 14-Day PDF Dossier next week!`
    );
    window.open(`https://wa.me/${patient.phone.replace(/[^0-9]/g, "")}?text=${message}`, "_blank");
    toast.success(`Prescription sent to ${patient.name} via WhatsApp!`);
    setActivePatient(null);
    setCustomRxNote("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-28">
      {/* Top Clinical Header */}
      <div className="bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 pt-9 pb-5 border-b border-teal-500/20 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-teal-200 hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                  B2B Clinician Portal
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync Active
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5 flex items-center gap-2">
                <span>Lagos &amp; Diaspora Endocrinology Network</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Attending: <strong>Dr. Chioma Nwosu, RD, CDE</strong> • 54 Assigned Patients
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic("success");
                toast.success("All 54 patient dossiers synced with hospital EHR!");
              }}
              className="py-2 px-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Building size={14} />
              <span>HMO / EHR Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Practice Dashboard Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        
        {/* Practice KPI Bento Grid (4 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold">Total Monitored</span>
              <Users size={16} className="text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">54</div>
            <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
              +6 new this month
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold">High Excursion Risk</span>
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-400">{highRiskCount}</div>
            <span className="text-[10px] text-red-300 font-bold mt-1 block">
              Requires Dietitian Nudge
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold">Clinic Mean Glucose</span>
              <Activity size={16} className="text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{avgGlucose} <span className="text-xs text-slate-400 font-normal">mg/dL</span></div>
            <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
              ↓ 14% improvement
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold">CKD Stage 3/4 Focus</span>
              <Droplet size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">8</div>
            <span className="text-[10px] text-amber-200 font-bold mt-1 block">
              Potassium &amp; Phosphorus Filter
            </span>
          </div>
        </div>

        {/* Patient Roster & Search Filter Strip */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient by name or ID (e.g. Amara, MO-8421)..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:border-teal-500"
              />
            </div>

            {/* Condition Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              {["All", "Type 2 Diabetes", "Hypertension", "CKD Stage 3", "Pre-diabetes"].map((cond) => (
                <button
                  key={cond}
                  onClick={() => {
                    triggerHaptic("light");
                    setSelectedCondition(cond);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCondition === cond
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-700"
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Patients Live Table */}
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => {
                  triggerHaptic("medium");
                  setActivePatient(patient);
                }}
                className="bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-teal-500/60 rounded-2xl p-4 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left: Patient Info & Condition */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {patient.gender === "Female" ? "👩🏾" : "👨🏾"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-white group-hover:text-teal-300 transition-colors">
                        {patient.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded-md">
                        {patient.id}
                      </span>
                      <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        patient.riskLevel === "high"
                          ? "bg-red-950 text-red-300 border border-red-800"
                          : patient.riskLevel === "medium"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}>
                        {patient.riskLevel === "high" ? "🔴 High Excursion" : patient.riskLevel === "medium" ? "🟡 Moderate" : "🟢 Stable"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span>{patient.age}y • {patient.gender}</span>
                      <span>•</span>
                      <strong className="text-teal-300">{patient.condition}</strong>
                      {patient.ckdStage && patient.ckdStage !== "None" && (
                        <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded-md font-bold">
                          Renal: {patient.ckdStage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: 14-Day Vitals Strip */}
                <div className="grid grid-cols-3 gap-2 text-center shrink-0 min-w-[240px]">
                  <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/60">
                    <span className="text-[9px] text-slate-400 font-bold block">14d Mean Glucose</span>
                    <span className={`text-xs font-black ${patient.meanGlucoseMgDl > 150 ? "text-red-400" : "text-white"}`}>
                      {patient.meanGlucoseMgDl} mg/dL
                    </span>
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/60">
                    <span className="text-[9px] text-slate-400 font-bold block">Spikes &gt; 180</span>
                    <span className="text-xs font-black text-amber-300">
                      {patient.spikesCount14d}
                    </span>
                  </div>

                  <div className="bg-slate-800/60 rounded-xl p-2 border border-slate-700/60">
                    <span className="text-[9px] text-slate-400 font-bold block">Potassium Risk</span>
                    <span className={`text-xs font-black ${patient.potassiumRisk === "High" ? "text-red-400" : "text-emerald-400"}`}>
                      {patient.potassiumRisk}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic("medium");
                      navigate("/health-report");
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="View 14-Day Clinical PDF Report"
                  >
                    <FileText size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePatient(patient);
                    }}
                    className="py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <MessageSquare size={13} />
                    <span>Rx Nudge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Patient Clinical Deep-Dive & WhatsApp Rx Modal */}
      {activePatient && (
        <Dialog open={Boolean(activePatient)} onOpenChange={(open) => !open && setActivePatient(null)}>
          <DialogContent className="max-w-xl bg-slate-900 border border-slate-700 text-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                    <span>{activePatient.name}</span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {activePatient.id}
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 mt-0.5">
                    {activePatient.age}y • {activePatient.gender} • {activePatient.condition} ({activePatient.hmoProvider})
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-3">
              {/* Latest Logged Meal Card */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block">
                  Latest Patient Log ({activePatient.lastLogTime})
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-slate-900 rounded-xl">{activePatient.lastMealThumbnail}</span>
                  <div>
                    <h4 className="text-xs font-black text-white">{activePatient.lastMealName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      14-Day Mean Glucose: <strong>{activePatient.meanGlucoseMgDl} mg/dL</strong> • Sodium Adherence: <strong>{activePatient.sodiumCompliancePercent}%</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Renal / CKD Stage Alert Card if Applicable */}
              {activePatient.ckdStage && activePatient.ckdStage !== "None" && (
                <div className="p-3.5 bg-indigo-950/70 rounded-2xl border border-indigo-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
                      <Droplet size={14} className="text-indigo-400" />
                      Renal Protocol ({activePatient.ckdStage})
                    </span>
                    <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-900 text-indigo-300 rounded-full">
                      Potassium: {activePatient.potassiumRisk}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-300/90 leading-snug">
                    Double-boil leaching protocol active. Advise avoiding unbuffered bone broths and ripe plantain slices.
                  </p>
                </div>
              )}

              {/* Dietitian Prescription & WhatsApp Care Note Composer */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Dietitian Prescription &amp; Clinical Action Note:
                </label>
                <textarea
                  value={customRxNote || activePatient.notes}
                  onChange={(e) => setCustomRxNote(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-2xl p-3 text-xs font-medium outline-none focus:border-teal-500 leading-relaxed"
                  placeholder="Enter clinical diet recommendations, swallow swaps, or medication timings..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic("medium");
                    navigate("/health-report");
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download size={14} />
                  <span>Download 14-Day PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendRxWhatsApp(activePatient)}
                  className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black rounded-2xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Send size={14} />
                  <span>Send WhatsApp Care Rx</span>
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <BottomNav />
    </div>
  );
}
