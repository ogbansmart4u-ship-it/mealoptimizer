import { supabase, getCurrentUser } from "./supabase";
import { updateUserProfile } from "./api";

/**
 * Resizes and compresses an image file to a lightweight JPEG blob (max 500x500)
 */
export async function compressImage(file: File, maxDimension = 500, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Canvas context unavailable"));
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Image compression failed"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = url;
  });
}

/**
 * Uploads user avatar to Supabase Storage bucket 'avatars' with automatic fallback
 */
export async function uploadUserAvatar(file: File): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User must be authenticated to upload avatar");
  }

  // Compress image
  const compressedBlob = await compressImage(file, 500, 0.85);

  const filePath = `${user.id}/avatar.jpg`;

  try {
    // Try uploading to Supabase Storage 'avatars' bucket
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, compressedBlob, {
        upsert: true,
        contentType: "image/jpeg",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.warn("Supabase Storage bucket upload warning:", uploadError.message);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Persist to user profile in database
    await updateUserProfile({ profilePicture: publicUrl });

    // Cache locally
    try {
      localStorage.setItem(`profile-picture-${user.id}`, publicUrl);
    } catch {
      /* ignore */
    }

    return publicUrl;
  } catch (storageErr) {
    console.warn("Falling back to client-side data URL storage:", storageErr);

    // Fallback: convert compressed blob to base64 DataURL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          await updateUserProfile({ profilePicture: base64 });
          localStorage.setItem(`profile-picture-${user.id}`, base64);
          resolve(base64);
        } catch (dbErr) {
          localStorage.setItem(`profile-picture-${user.id}`, base64);
          resolve(base64);
        }
      };
      reader.onerror = () => reject(new Error("Failed to convert image to base64 fallback"));
      reader.readAsDataURL(compressedBlob);
    });
  }
}
