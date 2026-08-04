import React, { useRef, useState } from "react";
import { Camera, Upload, User, X, Check } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

export default function ProfilePictureUpload() {
  const { profilePicture, setProfilePicture } = useUser();
  const [showDialog, setShowDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (previewImage) {
      setProfilePicture(previewImage);
      setShowDialog(false);
      setPreviewImage(null);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePicture(null);
    setPreviewImage(null);
    setShowDialog(false);
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setShowDialog(false);
  };

  const handleTakePhoto = async () => {
    try {
      // Check if mediaDevices is supported
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } // Front camera for selfie
        });
        
        // Stop the stream immediately (we just needed permission)
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Trigger camera input
      cameraInputRef.current?.click();
    } catch (error) {
      // If camera access fails, just open file picker
      cameraInputRef.current?.click();
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowDialog(true)}
        className="bg-white rounded-full shadow-md hover:shadow-lg transition-all group relative"
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
            <DialogTitle className="text-2xl text-[#1f7a8c] text-center">
              Profile Picture
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 text-center">
              Upload or take a photo to update your profile picture.
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
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Camera className="h-5 w-5" />
                  <span>Take Photo</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-[#1f7a8c] text-[#1f7a8c] rounded-2xl py-3 hover:bg-[#B8E5E5] transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  <span>Choose from Gallery</span>
                </button>

                {profilePicture && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full border-2 border-red-500 text-red-500 rounded-2xl py-3 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
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
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Save Photo</span>
                </button>

                <button
                  onClick={handleCancel}
                  className="w-full border-2 border-gray-300 text-gray-700 rounded-2xl py-3 hover:bg-gray-50 transition-all"
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