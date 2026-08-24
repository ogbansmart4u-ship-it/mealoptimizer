import React, { useRef, useState } from "react";
import { Camera, Upload, User, X, Check, Loader2, Crown, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { uploadUserAvatar } from "../../lib/avatarStorage";
import { getSubscriptionStatus } from "../../lib/payment";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";

export default function ProfilePictureUpload() {
  const navigate = useNavigate();
  const { profile, profilePicture, setProfilePicture, updateProfile } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const subStatus = getSubscriptionStatus(profile?.id);
  const isPro = profile?.isPro || profile?.plan === "pro" || profile?.plan === "family" || subStatus.isPro;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile && !previewImage) return;

    setIsUploading(true);
    try {
      if (selectedFile) {
        const publicUrl = await uploadUserAvatar(selectedFile);
        setProfilePicture(publicUrl);
        updateProfile?.({ profilePicture: publicUrl });
      } else if (previewImage) {
        setProfilePicture(previewImage);
        updateProfile?.({ profilePicture: previewImage });
      }
      toast.success("Profile photo updated successfully!");
      setShowDialog(false);
      setPreviewImage(null);
      setSelectedFile(null);
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture(null);
    updateProfile?.({ profilePicture: "" });
    setPreviewImage(null);
    setSelectedFile(null);
    setShowDialog(false);
    toast.success("Profile photo removed");
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    setShowDialog(false);
  };

  const handleTakePhoto = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        stream.getTracks().forEach((track) => track.stop());
      }
      cameraInputRef.current?.click();
    } catch {
      cameraInputRef.current?.click();
    }
  };

  return (
    <>
      {/* Profile Picture Trigger with Status Badge & Upgrade Link */}
      <div className="relative inline-flex items-center">
        <button
          onClick={() => {
            triggerHaptic("light");
            setShowDialog(true);
          }}
          className={`relative rounded-full shadow-md hover:shadow-lg transition-all group cursor-pointer select-none bg-white p-0.5 ${
            isPro
              ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#B8E5E5] shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              : "ring-2 ring-[#1f7a8c]/50 ring-offset-1 ring-offset-[#B8E5E5] hover:ring-[#1f7a8c]"
          }`}
          title={isPro ? "MealOptimiza PRO Member" : "Free Plan - Tap to manage photo or upgrade"}
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="h-7 w-7 text-[#1f7a8c]" />
            </div>
          )}
        </button>

        {/* 1-Tap Upgrade / Pro Plan Status Pill Attached to Avatar */}
        {isPro ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic("medium");
              navigate("/upgrade");
            }}
            className="absolute -top-2 -right-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-0.5 text-[8.5px] font-black tracking-wider uppercase border-2 border-white cursor-pointer hover:scale-105 active:scale-95 transition-all z-10"
            title="MealOptimiza PRO Member - Tap to view plan"
          >
            <Crown className="h-2.5 w-2.5 fill-current text-amber-100" />
            <span>PRO</span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic("medium");
              navigate("/upgrade");
            }}
            className="absolute -top-2 -right-3.5 bg-gradient-to-r from-emerald-500 via-[#1f7a8c] to-teal-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-full px-2 py-0.5 shadow-md flex items-center gap-1 text-[8.5px] font-black tracking-wider uppercase border-2 border-white cursor-pointer hover:scale-110 active:scale-95 transition-all z-10 animate-pulse"
            title="Free Plan - Tap to Upgrade to PRO"
          >
            <Zap className="h-2.5 w-2.5 fill-current text-amber-300" />
            <span>UPGRADE</span>
          </button>
        )}
      </div>

      {/* Profile Photo & Plan Management Modal */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#1f7a8c] text-center">
              Profile &amp; Membership
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 text-center">
              Manage your synced profile picture and subscription plan.
            </DialogDescription>
          </DialogHeader>

          {/* Membership Status Card inside Modal */}
          <div
            onClick={() => {
              setShowDialog(false);
              navigate("/upgrade");
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              isPro
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-md"
                : "bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 hover:border-teal-400 text-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isPro ? "bg-white/20 text-white" : "bg-[#1f7a8c] text-white"
                }`}
              >
                {isPro ? <Crown size={16} /> : <Sparkles size={16} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black">
                    {isPro ? "MealOptimiza PRO Active 👑" : "Free Starter Plan"}
                  </span>
                </div>
                <p
                  className={`text-[11px] leading-tight mt-0.5 truncate ${
                    isPro ? "text-amber-100" : "text-slate-600"
                  }`}
                >
                  {isPro
                    ? "Unlimited AI vision & Doctor reports active"
                    : "Tap to unlock unlimited AI scans & WhatsApp bot"}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center text-xs font-black gap-0.5">
              <span className={isPro ? "text-white" : "text-[#1f7a8c]"}>
                {isPro ? "Manage" : "Upgrade"}
              </span>
              <ArrowRight size={13} className={isPro ? "text-white" : "text-[#1f7a8c]"} />
            </div>
          </div>

          <div className="space-y-4 py-2">
            {/* Avatar Preview */}
            {(previewImage || profilePicture) && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewImage || profilePicture || ""}
                    alt="Preview"
                    className={`w-36 h-36 rounded-full object-cover shadow-lg border-4 ${
                      isPro ? "border-amber-400" : "border-[#1f7a8c]"
                    }`}
                  />
                  {isPro && (
                    <div className="absolute bottom-1 right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md border-2 border-white">
                      <Crown size={14} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {!previewImage && !profilePicture && (
              <div className="flex justify-center">
                <div className="w-36 h-36 rounded-full bg-slate-100 border-4 border-dashed border-slate-300 flex items-center justify-center">
                  <User className="h-16 w-16 text-slate-400" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!previewImage && (
              <div className="space-y-2.5">
                <button
                  onClick={handleTakePhoto}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white rounded-2xl py-3 hover:shadow-md transition-all flex items-center justify-center gap-2 font-bold text-xs cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Take Photo</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-[#1f7a8c] text-[#1f7a8c] rounded-2xl py-3 hover:bg-[#B8E5E5]/40 transition-all flex items-center justify-center gap-2 font-bold text-xs cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose from Gallery</span>
                </button>

                {profilePicture && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full border-2 border-rose-400 text-rose-600 rounded-2xl py-2.5 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 font-bold text-xs cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            )}

            {/* Save/Cancel when preview is shown */}
            {previewImage && (
              <div className="space-y-2.5">
                <button
                  onClick={handleSavePhoto}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white rounded-2xl py-3 hover:shadow-lg transition-all flex items-center justify-center gap-2 font-black text-xs cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading &amp; Syncing...
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save &amp; Sync Avatar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="w-full border-2 border-slate-300 text-slate-700 rounded-2xl py-2.5 hover:bg-slate-50 transition-all font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileSelect}
            className="hidden"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
