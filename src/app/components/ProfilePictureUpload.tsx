import React, { useRef, useState } from "react";
import { Camera, Upload, User, X, Check, Loader2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { uploadUserAvatar } from "../../lib/avatarStorage";
import { toast } from "sonner";

export default function ProfilePictureUpload() {
  const { profilePicture, setProfilePicture, updateProfile } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    } catch (err) {
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
      <button
        onClick={() => setShowDialog(true)}
        className="bg-white rounded-full shadow-md hover:shadow-lg transition-all group relative cursor-pointer select-none"
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-6 w-6 text-[#1f7a8c]" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-[#1f7a8c] rounded-full p-1 shadow-md">
          <Camera className="h-3 w-3 text-white" />
        </div>
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1f7a8c] text-center font-bold">
              Profile Picture
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 text-center">
              Upload or take a photo to sync your avatar across all your devices.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview */}
            {(previewImage || profilePicture) && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewImage || profilePicture || ""}
                    alt="Preview"
                    className="w-40 h-40 rounded-full object-cover border-4 border-[#1f7a8c] shadow-lg"
                  />
                </div>
              </div>
            )}

            {!previewImage && !profilePicture && (
              <div className="flex justify-center">
                <div className="w-40 h-40 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center">
                  <User className="h-20 w-20 text-gray-400" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!previewImage && (
              <div className="space-y-3">
                <button
                  onClick={handleTakePhoto}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3 hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold cursor-pointer"
                >
                  <Camera className="h-5 w-5" />
                  <span>Take Photo</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-[#1f7a8c] text-[#1f7a8c] rounded-2xl py-3 hover:bg-[#B8E5E5]/40 transition-all flex items-center justify-center gap-2 font-semibold cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                  <span>Choose from Gallery</span>
                </button>

                {profilePicture && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full border-2 border-red-500 text-red-500 rounded-2xl py-3 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-semibold cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            )}

            {/* Save/Cancel when preview is shown */}
            {previewImage && (
              <div className="space-y-3">
                <button
                  onClick={handleSavePhoto}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3 hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading & Syncing...
                    </span>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Save & Sync Avatar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={isUploading}
                  className="w-full border-2 border-gray-300 text-gray-700 rounded-2xl py-3 hover:bg-gray-50 transition-all font-semibold cursor-pointer"
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
