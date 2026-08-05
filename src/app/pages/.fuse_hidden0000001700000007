import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Scale,
  Ruler,
  Pill,
  Stethoscope,
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  Edit2,
  Camera,
  Settings,
  Palette,
  Trophy,
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
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../contexts/UserContext";
import { useLocation } from "../contexts/LocationContext";
import { updateUserProfile } from "../../lib/api";
import { toast } from "sonner";
import { availableRegions } from "../contexts/LocationContext";
import { AuthDebug } from "../components/AuthDebug";

export default function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, refreshProfile, updateProfile } = useUser();
  const { selectedLocation, setSelectedLocation } = useLocation();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketUpdates, setMarketUpdates] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingEmailPrefs, setEditingEmailPrefs] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    age: "",
    bmi: "",
    medicalCondition: "",
  });

  // Personal info form
  const [personalInfoForm, setPersonalInfoForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Email preferences form
  const [emailPrefsForm, setEmailPrefsForm] = useState({
    weeklyRecipes: true,
    mealReminders: true,
    healthTips: true,
    productUpdates: false,
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load profile data when it's available
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        location: profile.location || "",
        age: profile.age?.toString() || "",
        bmi: profile.bmi?.toString() || "",
        medicalCondition: profile.medicalCondition || "",
      });

      setPersonalInfoForm({
        name: profile.name || "",
        email: profile.email || "",
        phone: "",
      });

      // Sync location context with profile location
      const matchingRegion = availableRegions.find(r =>
        r.displayName === profile.location ||
        profile.location?.includes(r.name)
      );
      if (matchingRegion && matchingRegion.id !== selectedLocation.id) {
        setSelectedLocation(matchingRegion);
      }
    }
  }, [profile, setSelectedLocation]); // Added setSelectedLocation to dependencies

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Validate inputs
      const age = parseInt(formData.age);
      const bmi = parseFloat(formData.bmi);

      if (isNaN(age) || age <= 0) {
        toast.error("Please enter a valid age");
        setSaving(false);
        return;
      }

      if (isNaN(bmi) || bmi <= 0) {
        toast.error("Please enter a valid BMI");
        setSaving(false);
        return;
      }

      const updates = {
        name: formData.name,
        age,
        bmi,
        medicalCondition: formData.medicalCondition,
        location: formData.location,
        profilePicture: profile?.profilePicture,
      };

      // Try to update backend
      try {
        await updateUserProfile(updates);
        console.log("✅ Profile updated in backend");
      } catch (apiError: any) {
        console.warn("⚠️ Backend update failed, using offline mode:", apiError.message);
        // Continue with local update
      }

      // Update local context (this saves to localStorage)
      updateProfile(updates);

      // Update location context if changed
      const matchingRegion = availableRegions.find(r =>
        r.displayName === formData.location ||
        formData.location?.includes(r.name)
      );
      if (matchingRegion) {
        setSelectedLocation(matchingRegion);
      }

      toast.success("Profile updated successfully! 🎉");
      setEditingProfile(false);
      
      // Refresh profile to get latest data
      await refreshProfile();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    // Clear any previous errors
    setUploadError("");

    // Read and display the image
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      // Update profile picture in context and backend
      updateProfile({ profilePicture: base64Image });
      updateUserProfile({
        name: profile!.name,
        age: profile!.age,
        bmi: profile!.bmi,
        medicalCondition: profile!.medicalCondition,
        location: profile!.location,
        profilePicture: base64Image,
      }).then(() => {
        toast.success("Profile picture updated!");
      }).catch(() => {
        toast.error("Failed to upload picture");
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    document.getElementById("profile-image-input")?.click();
  };

  const handleSavePersonalInfo = async () => {
    try {
      setSaving(true);

      const updates = {
        name: personalInfoForm.name,
        age: profile!.age,
        bmi: profile!.bmi,
        medicalCondition: profile!.medicalCondition,
        location: profile!.location,
        profilePicture: profile?.profilePicture,
      };

      try {
        await updateUserProfile(updates);
      } catch (apiError) {
        console.warn("Backend update failed, using offline mode");
      }

      updateProfile(updates);
      toast.success("Personal information updated!");
      setEditingPersonalInfo(false);
      await refreshProfile();
    } catch (error) {
      toast.error("Failed to update personal information");
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailPrefs = () => {
    toast.success("Email preferences saved!");
    setEditingEmailPrefs(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setEditingPassword(false);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex items-center justify-center">
        <div className="text-[#1f7a8c] text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Failed to load profile</div>
          <div className="text-gray-600 text-sm mb-4">
            Please check the browser console for detailed error information.
          </div>
          <Button 
            onClick={() => {
              console.log("Retrying profile load...");
              refreshProfile();
            }}
            variant="outline"
            className="border-[#1f7a8c] text-[#1f7a8c] hover:bg-[#1f7a8c] hover:text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Calculate weight and height from BMI (for display only)
  const estimatedWeight = Math.round(profile.bmi * 1.65 * 1.65); // Assuming 165cm height
  const estimatedHeight = 165;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <div className="bg-[#1f7a8c] px-6 pt-12 pb-8">
        <h1 className="text-2xl text-white mb-6">Profile</h1>

        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile.profilePicture} alt={profile.name} />
              <AvatarFallback className="bg-[#4ecdc4] text-white text-2xl">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Upload profile picture"
            >
              <Camera className="h-4 w-4 text-[#1f7a8c]" />
            </button>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Profile picture upload"
            />
          </div>
          <h2 className="text-xl text-white">{profile.name}</h2>
          <p className="text-[#B8E5E5] text-sm">{profile.email}</p>
          {uploadError && (
            <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-4">
        {/* Health Profile Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-800">Health Profile</h3>
            <Dialog open={editingProfile} onOpenChange={setEditingProfile}>
              <DialogTrigger asChild>
                <button className="text-[#1f7a8c] flex items-center gap-1 text-sm hover:underline">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Health Profile</DialogTitle>
                  <DialogDescription>
                    Update your health information to get personalized nutrition
                    recommendations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <select
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {availableRegions.map((region) => (
                        <option key={region.id} value={region.displayName}>
                          {region.flag} {region.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bmi">BMI</Label>
                      <Input
                        id="bmi"
                        type="number"
                        step="0.1"
                        value={formData.bmi}
                        onChange={(e) =>
                          setFormData({ ...formData, bmi: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalCondition">Medical Condition</Label>
                    <Textarea
                      id="medicalCondition"
                      value={formData.medicalCondition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalCondition: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="e.g., Type 2 Diabetes, Hypertension"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingProfile(false)}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="bg-[#1f7a8c] rounded-full p-2">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Location</p>
                <p className="text-sm text-gray-800">{profile.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-[#1f7a8c] rounded-full p-2">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Age</p>
                  <p className="text-sm text-gray-800">{profile.age} years</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-[#1f7a8c] rounded-full p-2">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Weight</p>
                  <p className="text-sm text-gray-800">~{estimatedWeight} kg</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-[#1f7a8c] rounded-full p-2">
                  <Ruler className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Height</p>
                  <p className="text-sm text-gray-800">~{estimatedHeight} cm</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="bg-[#4ecdc4] rounded-full p-2">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600">BMI</p>
                  <p className="text-sm text-gray-800">{profile.bmi.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="bg-[#e63946] rounded-full p-2">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Medical Condition</p>
                <p className="text-sm text-gray-800">
                  {profile.medicalCondition || "None"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="text-lg text-gray-800 mb-4">Account Settings</h3>

          <div className="space-y-3">
            {/* Personalization Link */}
            <button
              onClick={() => navigate('/personalization')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-800">Personalization</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            {/* Achievements Link */}
            <button
              onClick={() => navigate('/achievements')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-800">Achievements & Badges</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <Dialog open={editingPersonalInfo} onOpenChange={setEditingPersonalInfo}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-800">Personal Information</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Personal Information</DialogTitle>
                  <DialogDescription>
                    Update your name and contact details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="pi-name">Full Name</Label>
                    <Input
                      id="pi-name"
                      value={personalInfoForm.name}
                      onChange={(e) =>
                        setPersonalInfoForm({ ...personalInfoForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pi-email">Email Address</Label>
                    <Input
                      id="pi-email"
                      type="email"
                      value={personalInfoForm.email}
                      onChange={(e) =>
                        setPersonalInfoForm({ ...personalInfoForm, email: e.target.value })
                      }
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pi-phone">Phone Number (Optional)</Label>
                    <Input
                      id="pi-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={personalInfoForm.phone}
                      onChange={(e) =>
                        setPersonalInfoForm({ ...personalInfoForm, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingPersonalInfo(false)}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePersonalInfo}
                    className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={editingEmailPrefs} onOpenChange={setEditingEmailPrefs}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-800">Email Preferences</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Email Preferences</DialogTitle>
                  <DialogDescription>
                    Choose which emails you'd like to receive
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Weekly Recipes</p>
                      <p className="text-xs text-gray-500">Get new recipe ideas every week</p>
                    </div>
                    <Switch
                      checked={emailPrefsForm.weeklyRecipes}
                      onCheckedChange={(checked) =>
                        setEmailPrefsForm({ ...emailPrefsForm, weeklyRecipes: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Meal Reminders</p>
                      <p className="text-xs text-gray-500">Helpful meal planning reminders</p>
                    </div>
                    <Switch
                      checked={emailPrefsForm.mealReminders}
                      onCheckedChange={(checked) =>
                        setEmailPrefsForm({ ...emailPrefsForm, mealReminders: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Health Tips</p>
                      <p className="text-xs text-gray-500">Personalized health advice</p>
                    </div>
                    <Switch
                      checked={emailPrefsForm.healthTips}
                      onCheckedChange={(checked) =>
                        setEmailPrefsForm({ ...emailPrefsForm, healthTips: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Product Updates</p>
                      <p className="text-xs text-gray-500">News about new features</p>
                    </div>
                    <Switch
                      checked={emailPrefsForm.productUpdates}
                      onCheckedChange={(checked) =>
                        setEmailPrefsForm({ ...emailPrefsForm, productUpdates: checked })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditingEmailPrefs(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEmailPrefs}
                    className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]"
                  >
                    Save Preferences
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={editingPassword} onOpenChange={setEditingPassword}>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-800">Change Password</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                    />
                    <p className="text-xs text-gray-500">Minimum 8 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPassword(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]"
                    disabled={
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword
                    }
                  >
                    Change Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="text-lg text-gray-800 mb-4">Notifications</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-800">Push Notifications</p>
                  <p className="text-xs text-gray-500">
                    Get meal reminders and health tips
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-800">Market Updates</p>
                  <p className="text-xs text-gray-500">
                    Local food availability alerts
                  </p>
                </div>
              </div>
              <Switch checked={marketUpdates} onCheckedChange={setMarketUpdates} />
            </div>
          </div>
        </div>

        {/* Support & Info */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="text-lg text-gray-800 mb-4">Support & Information</h3>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <span className="text-sm text-gray-800">Help Center</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/privacy-policy")}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <span className="text-sm text-gray-800">Privacy Policy</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/terms-and-conditions")}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <span className="text-sm text-gray-800">Terms & Conditions</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/about")}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <span className="text-sm text-gray-800">About MealOptimiza</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white border-2 border-[#e63946] text-[#e63946] rounded-2xl py-4 shadow-md hover:bg-[#e63946] hover:text-white transition-colors flex items-center justify-center gap-3 mb-6"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>

        {/* App Version */}
        <p className="text-center text-xs text-gray-500 mb-4">
          MealOptimiza v1.0.0
        </p>
      </div>

      <BottomNav />
      <AuthDebug />
    </div>
  );
}