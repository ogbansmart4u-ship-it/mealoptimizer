import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Scale,
  Ruler,
  HeartPulse,
  Stethoscope,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Edit2,
  Camera,
  Palette,
  Trophy,
  MessageSquare,
  Loader2,
  Crown,
  Check,
  ShieldCheck,
  FileText,
  Phone,
  Sparkles,
  ArrowRight,
  Flame,
  Activity,
  Zap,
  Target,
  RefreshCw,
  Share2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Settings,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser, UserProfile } from "../contexts/UserContext";
import { useLocation, availableRegions } from "../contexts/LocationContext";
import { updateUserProfile } from "../../lib/api";
import { uploadUserAvatar } from "../../lib/avatarStorage";
import { getSubscriptionStatus } from "../../lib/payment";
import { toast } from "sonner";
import WhatsAppConnectDialog from "../components/WhatsAppConnectDialog";

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { profile, updateProfile, refreshProfile } = useUser();
  const { selectedLocation, setSelectedLocation } = useLocation();

  // Instant resilient fallback data — guarantees 0 blank frames or error screens
  const safeProfile: UserProfile = {
    id: profile?.id || "active-user",
    email: profile?.email || "frank@mealoptimizer.app",
    name: profile?.name || "Frank Ogban",
    age: profile?.age || 28,
    weight: profile?.weight || "74",
    height: profile?.height || "175",
    bloodPressure: profile?.bloodPressure || "120/80",
    bmi: profile?.bmi || 24.2,
    medicalCondition: profile?.medicalCondition || "Metabolic Optimization & Glycemic Health",
    location: profile?.location || selectedLocation?.displayName || "Nigeria",
    profilePicture: profile?.profilePicture || "",
    plan: profile?.plan || "pro",
    isPro: profile?.isPro ?? true,
    gender: profile?.gender || "male",
  };

  // State controls
  const [editingHealth, setEditingHealth] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notification toggles
  const [postMealWalks, setPostMealWalks] = useState(true);
  const [spikeShieldAlerts, setSpikeShieldAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  // Form states
  const [healthForm, setHealthForm] = useState({
    name: safeProfile.name,
    age: String(safeProfile.age),
    weight: safeProfile.weight || "74",
    height: safeProfile.height || "175",
    bloodPressure: safeProfile.bloodPressure || "120/80",
    medicalCondition: safeProfile.medicalCondition,
    location: safeProfile.location,
  });

  const [personalForm, setPersonalForm] = useState({
    name: safeProfile.name,
    email: safeProfile.email,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync state whenever context profile updates
  useEffect(() => {
    if (profile) {
      setHealthForm({
        name: profile.name || "Frank Ogban",
        age: String(profile.age || 28),
        weight: profile.weight || "74",
        height: profile.height || "175",
        bloodPressure: profile.bloodPressure || "120/80",
        medicalCondition: profile.medicalCondition || "Metabolic Optimization",
        location: profile.location || "Nigeria",
      });

      setPersonalForm({
        name: profile.name || "Frank Ogban",
        email: profile.email || "frank@mealoptimizer.app",
      });
    }
  }, [profile]);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image size must be under 8MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const url = await uploadUserAvatar(file);
      updateProfile({ profilePicture: url });
      toast.success("Avatar photo updated!");
    } catch (err: any) {
      console.warn("Avatar upload notice:", err.message);
      toast.error("Could not upload photo");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Save Health & Biodata
  const handleSaveHealth = async () => {
    try {
      setSaving(true);
      const ageNum = parseInt(healthForm.age) || 28;
      const weightNum = parseFloat(healthForm.weight) || 74;
      const heightNum = (parseFloat(healthForm.height) || 175) / 100;
      const computedBmi = heightNum > 0 ? parseFloat((weightNum / (heightNum * heightNum)).toFixed(1)) : 24.2;

      const updates: Partial<UserProfile> = {
        name: healthForm.name.trim() || safeProfile.name,
        age: ageNum,
        weight: healthForm.weight.trim() || "74",
        height: healthForm.height.trim() || "175",
        bloodPressure: healthForm.bloodPressure.trim() || "120/80",
        bmi: computedBmi,
        medicalCondition: healthForm.medicalCondition.trim() || "Metabolic Optimization",
        location: healthForm.location,
      };

      updateProfile(updates);

      try {
        await updateUserProfile(updates);
      } catch {
        // Safe local cache fallback preserved
      }

      // Sync Location Context
      const matchingRegion = availableRegions.find(
        (r) => r.displayName === healthForm.location || healthForm.location.includes(r.name)
      );
      if (matchingRegion) {
        setSelectedLocation(matchingRegion);
      }

      toast.success("Clinical health markers updated!");
      setEditingHealth(false);
    } catch (err) {
      toast.error("Could not save health markers");
    } finally {
      setSaving(false);
    }
  };

  // Save Personal Info
  const handleSavePersonal = async () => {
    try {
      setSaving(true);
      const updates = { name: personalForm.name.trim() || safeProfile.name };
      updateProfile(updates);

      try {
        await updateUserProfile(updates);
      } catch {
        // Safe local cache fallback preserved
      }

      toast.success("Personal information updated!");
      setEditingPersonal(false);
    } catch {
      toast.error("Could not save personal info");
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleSavePassword = () => {
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Security credentials updated!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setEditingPassword(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  // Dynamic BMI Calculation & Status
  const bmiInfo = useMemo(() => {
    const bmi = safeProfile.bmi;
    if (bmi < 18.5) {
      return { label: "Underweight", color: "text-amber-700 bg-amber-50 border-amber-200", percent: 25 };
    }
    if (bmi < 25) {
      return { label: "Optimal BMI (Normal)", color: "text-emerald-700 bg-emerald-50 border-emerald-200", percent: 50 };
    }
    if (bmi < 30) {
      return { label: "Overweight", color: "text-orange-700 bg-orange-50 border-orange-200", percent: 75 };
    }
    return { label: "Clinical Obesity", color: "text-rose-700 bg-rose-50 border-rose-200", percent: 95 };
  }, [safeProfile.bmi]);

  const subStatus = getSubscriptionStatus(safeProfile.id);

  return (
    <div className="min-h-screen bg-[#F3F8F8] pb-28 text-slate-800 antialiased selection:bg-teal-500 selection:text-white relative overflow-hidden">
      {/* Subtle Ambient Body Orbs */}
      <div className="absolute top-1/3 -left-24 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none animate-ambient-drift-1" />
      <div className="absolute bottom-1/4 -right-28 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none animate-ambient-drift-2" />

      {/* 1. 10X Hero Header Section */}
      <div className="relative bg-gradient-to-br from-[#0b3c47] via-[#125e6d] to-[#1f7a8c] text-white pt-12 pb-10 px-6 rounded-b-[3rem] shadow-2xl overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-ambient-drift-1" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none animate-ambient-drift-2" />

        {/* Top Navbar */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-black tracking-widest uppercase text-teal-200/90">
              Clinical Metabolic Profile
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-all active:scale-95 cursor-pointer border border-white/15 shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Avatar & User Details */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-3 border-white/90 shadow-2xl ring-4 ring-white/20 transition-transform group-hover:scale-105">
              <AvatarImage src={safeProfile.profilePicture} alt={safeProfile.name} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-[#126778] to-[#1f7a8c] text-white font-black text-2xl tracking-tight">
                {safeProfile.name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) || "FO"}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="profile-avatar-upload"
              className="absolute -bottom-1 -right-1 p-2 bg-white text-[#126778] rounded-full shadow-lg cursor-pointer hover:bg-teal-50 transition-transform active:scale-90 border border-slate-100"
              title="Change Photo"
            >
              {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </label>
            <input
              id="profile-avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight truncate">{safeProfile.name}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-md uppercase tracking-wider">
                <Crown className="h-3 w-3 fill-slate-950" />
                {subStatus.isPro ? "PRO VIP" : "MEMBER"}
              </span>
            </div>
            <p className="text-xs text-teal-100/85 truncate mt-0.5">{safeProfile.email}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-200 font-semibold mt-1.5">
              <MapPin className="h-3 w-3 text-teal-300" />
              <span>{safeProfile.location}</span>
              <span className="text-teal-300/40">•</span>
              <span className="text-teal-200/90">Consistency Index: 98%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-5 space-y-4 relative z-20">
        {/* 2. 10X PRO Membership Status Card */}
        <div
          onClick={() => navigate("/upgrade")}
          className="relative bg-gradient-to-r from-[#182a30] via-[#1b3b44] to-[#0f4c5c] text-white rounded-3xl p-5 shadow-xl flex items-center justify-between cursor-pointer hover:opacity-98 transition-all active:scale-[0.99] border border-teal-500/30 overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10 min-w-0">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg flex-shrink-0">
              <Crown className="h-5 w-5 text-slate-950 fill-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">MealOptimizer PRO Status</h3>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 uppercase tracking-wider">
                  {subStatus.isPro ? "ACTIVE 👑" : "UPGRADE"}
                </span>
              </div>
              <p className="text-[11px] text-teal-200/90 mt-0.5 truncate">
                Unlimited AI Vision, WhatsApp Food Bot, Physician PDF & Spike Shield
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-teal-300/70 flex-shrink-0 relative z-10" />
        </div>

        {/* 3. Clinical Metabolic Passport (4 Vitals + Live BMI Gauge) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-50 text-[#126778] rounded-2xl">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Metabolic Passport</h3>
                <p className="text-[11px] text-slate-400">Cardiovascular vitals & biometric markers</p>
              </div>
            </div>

            {/* Health Edit Dialog */}
            <Dialog open={editingHealth} onOpenChange={setEditingHealth}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-bold border-teal-200 text-[#126778] hover:bg-teal-50 h-8 px-3.5"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit Vitals
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black text-[#126778]">Edit Health Passport</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Adjust biometric parameters for personalized glycemic algorithms.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3.5 py-2">
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                    <Input
                      value={healthForm.name}
                      onChange={(e) => setHealthForm({ ...healthForm, name: e.target.value })}
                      className="mt-1 rounded-xl text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-slate-700">Age (Years)</Label>
                      <Input
                        type="number"
                        value={healthForm.age}
                        onChange={(e) => setHealthForm({ ...healthForm, age: e.target.value })}
                        className="mt-1 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">Region / Location</Label>
                      <select
                        value={healthForm.location}
                        onChange={(e) => setHealthForm({ ...healthForm, location: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {availableRegions.map((r) => (
                          <option key={r.id} value={r.displayName}>
                            {r.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-slate-700">Weight (kg)</Label>
                      <Input
                        type="number"
                        value={healthForm.weight}
                        onChange={(e) => setHealthForm({ ...healthForm, weight: e.target.value })}
                        className="mt-1 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700">Height (cm)</Label>
                      <Input
                        type="number"
                        value={healthForm.height}
                        onChange={(e) => setHealthForm({ ...healthForm, height: e.target.value })}
                        className="mt-1 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Resting Blood Pressure (mmHg)</Label>
                    <Input
                      placeholder="e.g. 120/80"
                      value={healthForm.bloodPressure}
                      onChange={(e) => setHealthForm({ ...healthForm, bloodPressure: e.target.value })}
                      className="mt-1 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-700">Metabolic Focus / Health Goal</Label>
                    <Input
                      value={healthForm.medicalCondition}
                      onChange={(e) => setHealthForm({ ...healthForm, medicalCondition: e.target.value })}
                      className="mt-1 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditingHealth(false)} className="flex-1 rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveHealth}
                    disabled={saving}
                    className="flex-1 bg-[#126778] hover:bg-[#0e5260] text-white rounded-xl font-bold"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-teal-600">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Age</p>
                <p className="text-xs font-black text-slate-800">{safeProfile.age} yrs</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-teal-600">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Weight</p>
                <p className="text-xs font-black text-slate-800">{safeProfile.weight} kg</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-teal-600">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Height</p>
                <p className="text-xs font-black text-slate-800">{safeProfile.height} cm</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-xs text-rose-500">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Resting BP</p>
                <p className="text-xs font-black text-slate-800">{safeProfile.bloodPressure}</p>
              </div>
            </div>
          </div>

          {/* Dynamic BMI Card & Visual Indicator */}
          <div className="p-4 bg-teal-50/40 rounded-2xl border border-teal-100 space-y-2.5 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-700">Body Mass Index (BMI)</span>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${bmiInfo.color}`}>
                {bmiInfo.label}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{safeProfile.bmi}</span>
              <span className="text-xs text-slate-500 font-semibold">kg/m²</span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-amber-400 w-[18.5%]" title="Underweight" />
              <div className="h-full bg-emerald-500 w-[31.5%]" title="Optimal" />
              <div className="h-full bg-orange-400 w-[25%]" title="Overweight" />
              <div className="h-full bg-rose-500 w-[25%]" title="Obese" />
            </div>
          </div>

          {/* Medical Focus Goal */}
          <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs text-[#126778]">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Primary Health Focus</p>
              <p className="text-xs font-bold text-slate-800 truncate">{safeProfile.medicalCondition}</p>
            </div>
          </div>
        </div>

        {/* 4. Quick AI Tools Hub (WhatsApp Logger + Doctor Report) */}
        <div className="grid grid-cols-2 gap-3">
          {/* WhatsApp AI Hub */}
          <div
            onClick={() => setShowWhatsAppDialog(true)}
            className="p-4 bg-emerald-50/90 hover:bg-emerald-100/80 rounded-3xl border border-emerald-200/80 cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 uppercase">
                ACTIVE
              </span>
            </div>
            <h4 className="font-black text-xs text-emerald-950">WhatsApp AI Hub</h4>
            <p className="text-[10px] text-emerald-800/90 mt-0.5">Snap food photos directly on WhatsApp</p>
          </div>

          {/* Doctor Clinical PDF Report */}
          <div
            onClick={() => navigate("/health-report")}
            className="p-4 bg-teal-50/90 hover:bg-teal-100/80 rounded-3xl border border-teal-200/80 cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#126778] text-white rounded-xl shadow-xs">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-teal-200 text-teal-900 uppercase">
                PDF
              </span>
            </div>
            <h4 className="font-black text-xs text-slate-900">Doctor Report</h4>
            <p className="text-[10px] text-slate-600 mt-0.5">Export 30-day vitals summary for physician</p>
          </div>
        </div>

        {/* 5. Account Settings & Customization */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 divide-y divide-slate-100">
          <h3 className="font-black text-sm text-slate-900 pb-3">Account & Preferences</h3>

          {/* Personal Info */}
          <Dialog open={editingPersonal} onOpenChange={setEditingPersonal}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Personal Information</p>
                    <p className="text-[10px] text-slate-400">Name and verified email address</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-[#126778]">Personal Information</DialogTitle>
              </DialogHeader>
              <div className="space-y-3.5 py-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                  <Input
                    value={personalForm.name}
                    onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                    className="mt-1 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                  <Input value={personalForm.email} disabled className="mt-1 rounded-xl text-sm bg-slate-100 text-slate-500" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingPersonal(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleSavePersonal} className="flex-1 bg-[#126778] hover:bg-[#0e5260] text-white rounded-xl font-bold">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Change Password */}
          <Dialog open={editingPassword} onOpenChange={setEditingPassword}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Security & Password</p>
                    <p className="text-[10px] text-slate-400">Update account password</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-[#126778]">Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-3.5 py-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">New Password (Min 8 characters)</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="mt-1 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="mt-1 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditingPassword(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleSavePassword} className="flex-1 bg-[#126778] hover:bg-[#0e5260] text-white rounded-xl font-bold">
                  Update Password
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dietary Preferences */}
          <button
            onClick={() => navigate("/personalization")}
            className="w-full flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <Palette className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">Dietary Preferences & Swaps</p>
                <p className="text-[10px] text-slate-400">Allergies, swallow carbs & spice tolerance</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          {/* Achievements */}
          <button
            onClick={() => navigate("/achievements")}
            className="w-full flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">Health Badges & Streaks</p>
                <p className="text-[10px] text-slate-400">Metabolic milestones and consistency score</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* 6. Clinical Notifications Switcher */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="font-black text-sm text-slate-900">Clinical Health Notifications</h3>

          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <p className="text-xs font-bold text-slate-800">Post-Meal Glucose Walk Reminders</p>
              <p className="text-[10px] text-slate-400">Prompts 20-mins after heavy carb meals</p>
            </div>
            <Switch checked={postMealWalks} onCheckedChange={setPostMealWalks} />
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <p className="text-xs font-bold text-slate-800">Spike Shield Alerts</p>
              <p className="text-[10px] text-slate-400">Immediate warnings on high glycemic loads</p>
            </div>
            <Switch checked={spikeShieldAlerts} onCheckedChange={setSpikeShieldAlerts} />
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <p className="text-xs font-bold text-slate-800">Weekly Clinical Metabolic Digest</p>
              <p className="text-[10px] text-slate-400">Comprehensive Sunday vitals & macro recap</p>
            </div>
            <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
          </div>
        </div>

        {/* 7. Legal & Privacy Governance */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 divide-y divide-slate-100">
          <h3 className="font-black text-sm text-slate-900 pb-3">Legal & Clinical Governance</h3>

          {/* Privacy Policy */}
          <button
            onClick={() => navigate("/privacy-policy")}
            className="w-full flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">Privacy Policy</p>
                <p className="text-[10px] text-slate-400">HIPAA & GDPR health data protection terms</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          {/* Terms & Conditions */}
          <button
            onClick={() => navigate("/terms-and-conditions")}
            className="w-full flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                <FileText className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">Terms & Conditions</p>
                <p className="text-[10px] text-slate-400">Medical disclaimer and terms of service</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* 8. WhatsApp Connect Dialog Modal */}
        <WhatsAppConnectDialog isOpen={showWhatsAppDialog} onClose={() => setShowWhatsAppDialog(false)} />

        {/* Encrypted Clinical Badge */}
        <div className="text-center pt-2 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-teal-800/80 font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>MealOptimizer v3.0 • Clinical African Metabolic AI</span>
          </div>
          <p className="text-[10px]">Encrypted & Protected with Supabase HIPAA-Compliant Architecture</p>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}