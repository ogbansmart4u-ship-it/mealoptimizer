import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserProfile } from "../../lib/api";
import { syncSubscriptionFromProfile } from "../../lib/payment";
import { useAuth } from "./AuthContext";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  age: number;
  gender?: "male" | "female" | "other";
  birthDate?: string; // "YYYY-MM-DD"
  bmi: number;
  weight?: string;
  height?: string;
  bloodPressure?: string;
  systolic?: number;
  diastolic?: number;
  targetWeight?: string;
  medicalCondition: string;
  medications?: string;
  allergies?: string;
  location: string;
  profilePicture?: string;
  plan?: "free" | "pro" | "family";
  isPro?: boolean;
  subscriptionExpiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type UserContextType = {
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  // Legacy compatibility
  userName: string;
  profilePicture: string | null;
  setProfilePicture: (picture: string | null) => void;
  setUserName: (name: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Read a durably-saved profile picture for this user
  const readSavedPicture = (uid: string): string => {
    try {
      const direct = localStorage.getItem(`profile-picture-${uid}`);
      if (direct) return direct;
      const sp = localStorage.getItem(`user-profile-${uid}`);
      if (sp) {
        const p = JSON.parse(sp);
        if (p?.profilePicture) return p.profilePicture;
      }
    } catch {
      /* ignore */
    }
    return "";
  };

  // Fetch user profile from backend with persistent local cache merge
  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    if (isFetching) {
      console.log("Profile fetch already in progress, skipping");
      return;
    }

    try {
      setIsFetching(true);
      setLoading(true);

      console.log("Fetching user profile for user:", user.id);

      // Read local cached profile first so we never drop biodata
      let localCached: any = {};
      try {
        const storedProfileRaw = localStorage.getItem(`user-profile-${user.id}`);
        if (storedProfileRaw) localCached = JSON.parse(storedProfileRaw);
      } catch {
        /* ignore */
      }

      // Try to get profile from backend
      try {
        const profileData = await getUserProfile();
        console.log("✅ Profile loaded successfully from backend:", profileData);

        const savedPic = readSavedPicture(user.id);
        const merged: UserProfile = {
          ...localCached,
          ...profileData,
          age: profileData?.age || localCached.age || 25,
          weight: profileData?.weight || localCached.weight || "70",
          height: profileData?.height || localCached.height || "170",
          bmi: profileData?.bmi || localCached.bmi || 24.2,
          bloodPressure: profileData?.bloodPressure || localCached.bloodPressure || "120/80",
          systolic: profileData?.systolic || localCached.systolic || 120,
          diastolic: profileData?.diastolic || localCached.diastolic || 80,
          gender: profileData?.gender || localCached.gender || "other",
          medicalCondition: profileData?.medicalCondition || localCached.medicalCondition || "General Metabolic Health",
          location: profileData?.location || localCached.location || localStorage.getItem("userLocation") || "Nigeria",
          profilePicture: profileData?.profilePicture || savedPic || localCached.profilePicture || "",
        };

        setProfile(merged);
        syncSubscriptionFromProfile(merged);

        try {
          localStorage.setItem(`user-profile-${user.id}`, JSON.stringify(merged));
          if (merged.profilePicture) {
            localStorage.setItem(`profile-picture-${user.id}`, merged.profilePicture);
          }
        } catch {
          /* ignore */
        }

        setLoading(false);
        setIsFetching(false);
        return;
      } catch (apiError: any) {
        console.warn("⚠️ Backend API unavailable:", apiError.message);
      }

      // Fallback: Use local storage and auth metadata
      console.log("📦 Loading profile from localStorage and auth metadata");

      const storedProfile = localStorage.getItem(`user-profile-${user.id}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (!parsed.profilePicture) parsed.profilePicture = readSavedPicture(user.id);
        console.log("✅ Profile loaded from localStorage:", parsed);
        setProfile(parsed);
        syncSubscriptionFromProfile(parsed);
      } else {
        console.log("Creating profile from auth metadata");
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || "User",
          age: Number(user.user_metadata?.age) || 25,
          bmi: Number(user.user_metadata?.bmi) || 24.2,
          weight: user.user_metadata?.weight || "70",
          height: user.user_metadata?.height || "170",
          bloodPressure: user.user_metadata?.bloodPressure || "120/80",
          systolic: Number(user.user_metadata?.systolic) || 120,
          diastolic: Number(user.user_metadata?.diastolic) || 80,
          gender: user.user_metadata?.gender || "other",
          medicalCondition: user.user_metadata?.medical_condition ||
                           user.user_metadata?.goal ||
                           "General Metabolic Health",
          medications: user.user_metadata?.medications || "",
          allergies: user.user_metadata?.allergies || "",
          location: user.user_metadata?.location ||
                   localStorage.getItem("userLocation") ||
                   "Nigeria",
          profilePicture: user.user_metadata?.profilePicture || readSavedPicture(user.id) || "",
        };

        setProfile(fallbackProfile);
        syncSubscriptionFromProfile(fallbackProfile);

        try {
          localStorage.setItem(`user-profile-${user.id}`, JSON.stringify(fallbackProfile));
        } catch {
          /* ignore */
        }
        console.log("✅ Profile created and locked to localStorage");
      }

      setLoading(false);
    } catch (error: any) {
      console.error("❌ Failed to load user profile:", error);
      setLoading(false);
    } finally {
      setIsFetching(false);
    }
  };

  // Load profile when auth user changes
  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user?.id]);

  // Update profile locally and lock in permanently
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      syncSubscriptionFromProfile(updatedProfile);

      if (user) {
        try {
          localStorage.setItem(`user-profile-${user.id}`, JSON.stringify(updatedProfile));
          if (updates.profilePicture) {
            localStorage.setItem(`profile-picture-${user.id}`, updates.profilePicture);
          }
        } catch {
          /* ignore */
        }
        console.log("✅ Biodata locked in permanently for user:", user.id);
      }
    }
  };

  // Legacy setters for backward compatibility
  const setUserName = (name: string) => {
    if (profile) {
      updateProfile({ name });
    }
  };

  const setProfilePicture = (picture: string | null) => {
    if (profile) {
      updateProfile({ profilePicture: picture || "" });
    }
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        updateProfile,
        userName: profile?.name || "Friend",
        profilePicture: profile?.profilePicture || null,
        setProfilePicture,
        setUserName,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}