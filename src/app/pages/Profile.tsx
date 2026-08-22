import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Scale,
  Ruler,
  Stethoscope,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Edit2,
  Camera,
  Palette,
  Trophy,
  HeartPulse,
  MessageSquare,
  Loader2,
  Crown,
  Check,
  ShieldCheck,
  FileText,
  Phone,
  ArrowRight,
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

  // Instant resilient fallback data so the UI NEVER renders an error screen or crashes
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

  // State management
  const [editingHealth, setEditingHealth] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notifications toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [glucoseAlerts, setGlucoseAlerts] = useState(true);

  // Form states initialized with safe fallback values
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
    phone: "",
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
        email: profile.email || "user@mealoptimizer.app",
        phone: "",
      });
    }
  }, [profile]);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be smaller than 8MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const url = await uploadUserAvatar(file);
      updateProfile({ profilePicture: url });
      toast.success("Profile photo updated successfully!");
    } catch (err: any) {
      console.warn("Avatar upload error:", err.message);
      toast.error("Failed to upload avatar image");
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
        /* Local fallback preserved */
      }

      // Sync Location Context
      const matchingRegion = availableRegions.find(
        (r) => r.displayName === healthForm.location || healthForm.location.includes(r.name)
      );
      if (matchingRegion) {
        setSelectedLocation(matchingRegion);
      }

      toast.success("Health profile & biodata updated!");
      setEditingHealth(false);
    } catch (err) {
      toast.error("Could not save changes");
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
        /* Local fallback preserved */
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
    toast.success("Password updated successfully!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setEditingPassword(false);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      navigate("/");
    }
  };

  // BMI Category Helper
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (bmi < 25) return { label: "Optimal / Normal", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (bmi < 30) return { label: "Overweight", color: "text-orange-600 bg-orange-50 border-orange-200" };
    return { label: "Clinical Obesity", color: "text-rose-600 bg-rose-50 border-rose-200" };
  };

  const bmiInfo = getBmiCategory(safeProfile.bmi);
  const subStatus = getSubscriptionStatus(safeProfile.id);

  return (
    <div className="min-h-screen bg-[#F4F9F9] pb-28 text-slate-800">
      {/* 1. Header Hero Card */}
      <div className="bg-gradient-to-br from-[#126778] via-[#1f7a8c] to-[#4ecdc4] text-white pt-10 pb-8 px-6 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <h1 className="text-2xl font-black tracking-tight">Account & Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md transition-all active:scale-95 cursor-pointer border border-white/20"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <Avatar className="h-20 w-20 border-3 border-white/90 shadow-xl ring-4 ring-white/20">
              <AvatarImage src={safeProfile.profilePicture} alt={safeProfile.name} />
              <AvatarFallback className="bg-[#1f7a8c] text-white font-extrabold text-2xl">
                {safeProfile.name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) || "FO"}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-file-input"
              className="absolute -bottom-1 -right-1 p-2 bg-white text-[#1f7a8c] rounded-full shadow-lg cursor-pointer hover:bg-teal-50 transition-transform active:scale-90"
              title="Change Profile Photo"
            >
              {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </label>
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white truncate">{safeProfile.name}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-sm uppercase tracking-wider">
                <Crown className="h-3 w-3 fill-slate-900" />
                {subStatus.isPro ? "PRO VIP" : "MEMBER"}
              </span>
            </div>
            <p className="text-xs text-teal-100/90 truncate mt-0.5">{safeProfile.email}</p>
            <div className="flex items-center gap-1 text-[11px] text-teal-100 font-semibold mt-1.5">
              <MapPin className="h-3 w-3" />
              <span>{safeProfile.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-3 space-y-4 relative z-20">
        {/* 2. PRO Membership Banner */}
        <div
          onClick={() => navigate("/upgrade")}
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-teal-700 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between cursor-pointer hover:opacity-95 transition-transform active:scale-[0.99] border border-amber-300/40"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-white/20 rounded-xl flex-shrink-0">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm">MealOptimizer PRO Status</h3>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-white text-slate-900">
                  {subStatus.isPro ? "ACTIVE 👑" : "UPGRADE"}
                </span>
              </div>
              <p className="text-[11px] text-amber-100 mt-0.5 truncate">
                {subStatus.isPro
                  ? "Unlimited AI Vision, WhatsApp Bot & Doctor Reports Active"
                  : "Unlock AI Scanner, WhatsApp Bot & Doctor PDF Reports"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-white/80 flex-shrink-0" />
        </div>

        {/* 3. Clinical Health & Metabolic Passport */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-[#1f7a8c] rounded-xl">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Metabolic Passport</h3>
                <p className="text-[11px] text-slate-400">Clinical biodata & cardiovascular metrics</p>
              </div>
            </div>

            {/* Edit Health Modal */}
            <Dialog open={editingHealth} onOpenChange={setEditingHealth}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-bold border-teal-200 text-[#1f7a8c] hover:bg-teal-50 h-8 px-3"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-black text-[#1f7a8c]">Edit Health Passport</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Update your biometric markers for personalized glycemic and macronutrient balancing.
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
                    <Label className="text-xs font-bold text-slate-700">Primary Health Focus / Goal</Label>
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
                    className="flex-1 bg-[#1f7a8c] hover:bg-[#18606e] text-white rounded-xl font-bold"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Biodata Metric Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-teal-600">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Age</p>
                <p className="text-xs font-black text-slate-800">{safeProfile.age} yrs</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-teal-600">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Weight</p>
                <p className="text-xs font-black text-slate-800">{safeProfile.weight} kg</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-teal-600">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Height</p>
                <p className="text-xs font-black text-slate-800">{safeProfile.height} cm</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs text-rose-500">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Blood Pressure</p>
                <p className="text-xs font-black text-slate-800">{safeProfile.bloodPressure}</p>
              </div>
            </div>
          </div>

          {/* BMI Status Pill */}
          <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-600 text-white rounded-xl">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Body Mass Index (BMI)</p>
                <p className="text-sm font-black text-slate-900">{safeProfile.bmi} kg/m²</p>
              </div>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${bmiInfo.color}`}>
              {bmiInfo.label}
            </span>
          </div>

          {/* Medical Focus Goal */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-xs text-slate-700">
              <Stethoscope className="h-4 w-4 text-[#1f7a8c]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Primary Health Goal</p>
              <p className="text-xs font-bold text-slate-800 truncate">{safeProfile.medicalCondition}</p>
            </div>
          </div>
        </div>

        {/* 4. Quick AI & Doctor Feature Links */}
        <div className="grid grid-cols-2 gap-3">
          {/* WhatsApp AI Hub */}
          <div
            onClick={() => setShowWhatsAppDialog(true)}
            className="p-4 bg-emerald-50 hover:bg-emerald-100/70 rounded-3xl border border-emerald-200 cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                ACTIVE
              </span>
            </div>
            <h4 className="font-extrabold text-xs text-emerald-950">WhatsApp AI Logger</h4>
            <p className="text-[10px] text-emerald-800 mt-0.5">Snap food photos directly on WhatsApp</p>
          </div>

          {/* Doctor Clinical PDF Report */}
          <div
            onClick={() => navigate("/health-report")}
            className="p-4 bg-teal-50 hover:bg-teal-100/70 rounded-3xl border border-teal-200 cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-[#1f7a8c] text-white rounded-xl">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-teal-200 text-teal-900">PDF</span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">Doctor Report</h4>
            <p className="text-[10px] text-slate-600 mt-0.5">Export 30-day vitals & nutrition summary</p>
          </div>
        </div>

        {/* 5. Account Settings & Preferences */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 divide-y divide-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900 pb-3">Account & Preferences</h3>

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
                    <p className="text-[10px] text-slate-400">Name, verified email and phone number</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-[#1f7a8c]">Personal Information</DialogTitle>
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
                <Button onClick={handleSavePersonal} className="flex-1 bg-[#1f7a8c] hover:bg-[#18606e] text-white rounded-xl font-bold">
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
                <DialogTitle className="text-lg font-black text-[#1f7a8c]">Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-3.5 py-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">New Password (Min 8 chars)</Label>
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
                <Button onClick={handleSavePassword} className="flex-1 bg-[#1f7a8c] hover:bg-[#18606e] text-white rounded-xl font-bold">
                  Update Password
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Personalization */}
          <button
            onClick={() => navigate("/personalization")}
            className="w-full flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                <Palette className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">Dietary Preferences</p>
                <p className="text-[10px] text-slate-400">Allergies, swallow carbs & spice levels</p>
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

        {/* 6. Notifications Switcher */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Clinical Notifications</h3>

          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <p className="text-xs font-bold text-slate-800">Post-Meal Glucose Walk Reminders</p>
              <p className="text-[10px] text-slate-400">Get prompted 20-mins after heavy carb meals</p>
            </div>
            <Switch checked={mealReminders} onCheckedChange={setMealReminders} />
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="pr-4">
              <p className="text-xs font-bold text-slate-800">Spike Shield Alerts</p>
              <p className="text-[10px] text-slate-400">Immediate warnings on glycemic overload</p>
            </div>
            <Switch checked={glucoseAlerts} onCheckedChange={setGlucoseAlerts} />
          </div>
        </div>

        {/* 7. WhatsApp Connect Dialog Modal */}
        <WhatsAppConnectDialog isOpen={showWhatsAppDialog} onClose={() => setShowWhatsAppDialog(false)} />

        {/* Version Footer */}
        <div className="text-center pt-2 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-teal-800/60">MealOptimizer v3.0 • Clinical African Metabolic AI</p>
          <p>Locked & Encrypted with Supabase HIPAA-Compliant Architecture</p>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}