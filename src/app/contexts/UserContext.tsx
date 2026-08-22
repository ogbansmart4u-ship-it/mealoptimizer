import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserProfile } from "../../lib/api";
import { syncSubscriptionFromProfile, getSubscriptionStatus } from "../../lib/payment";
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

const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: "guest-user",
  email: "user@mealoptimizer.app",
  name: "Frank Ogban",
  age: 28,
  gender: "male",
  weight: "74",
  height: "175",
  bmi: 24.2,
  bloodPressure: "120/80",
  systolic: 120,
  diastolic: 80,
  medicalCondition: "Metabolic Optimization",
  location: "Nigeria",
  profilePicture: "",
  plan: "pro",
  isPro: true,
};

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    // Initial sync from localStorage so UI never has a blank flicker
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem("mealoptimizer_last_active_profile");
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return DEFAULT_GUEST_PROFILE;
  });
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
    const activeUid = user?.id || "guest-user";

    if (isFetching) {
      return;
    }

    try {
      setIsFetching(true);
      setLoading(true);

      // Read local cached profile first so we never drop biodata
      let localCached: any = {};
      try {
        const storedProfileRaw = localStorage.getItem(`user-profile-${activeUid}`);
        if (storedProfileRaw) localCached = JSON.parse(storedProfileRaw);
      } catch {
        /* ignore */
      }

      // If user is authenticated, attempt backend fetch
      if (user) {
        try {
          const profileData = await getUserProfile();
          const savedPic = readSavedPicture(user.id);
          const currentSub = getSubscriptionStatus(user.id);
          const resolvedPlan = profileData?.plan || localCached.plan || currentSub.plan || (currentSub.isPro ? "pro" : "free");
          const resolvedIsPro = profileData?.isPro ?? localCached.isPro ?? currentSub.isPro ?? (resolvedPlan === "pro" || resolvedPlan === "family");

          const merged: UserProfile = {
            ...localCached,
            ...profileData,
            id: user.id,
            email: user.email || profileData?.email || localCached.email || "user@mealoptimizer.app",
            name: profileData?.name || localCached.name || user.user_metadata?.name || "Frank Ogban",
            age: profileData?.age || localCached.age || 28,
            weight: profileData?.weight || localCached.weight || "74",
            height: profileData?.height || localCached.height || "175",
            bmi: profileData?.bmi || localCached.bmi || 24.2,
            bloodPressure: profileData?.bloodPressure || localCached.bloodPressure || "120/80",
            systolic: profileData?.systolic || localCached.systolic || 120,
            diastolic: profileData?.diastolic || localCached.diastolic || 80,
            gender: profileData?.gender || localCached.gender || "male",
            medicalCondition: profileData?.medicalCondition || localCached.medicalCondition || "Metabolic Optimization",
            location: profileData?.location || localCached.location || localStorage.getItem("userLocation") || "Nigeria",
            profilePicture: profileData?.profilePicture || savedPic || localCached.profilePicture || "",
            plan: resolvedPlan,
            isPro: resolvedIsPro,
            subscriptionExpiresAt: profileData?.subscriptionExpiresAt || localCached.subscriptionExpiresAt || currentSub.expiresAt,
          };

          setProfile(merged);
          syncSubscriptionFromProfile(merged, user.id);

          try {
            localStorage.setItem(`user-profile-${user.id}`, JSON.stringify(merged));
            localStorage.setItem("mealoptimizer_last_active_profile", JSON.stringify(merged));
            if (merged.profilePicture) {
              localStorage.setItem(`profile-picture-${user.id}`, merged.profilePicture);
            }
          } catch {}

          setLoading(false);
          setIsFetching(false);
          return;
        } catch (apiError: any) {
          console.warn("⚠️ Backend API unavailable, using local cache:", apiError.message);
        }
      }

      // Fallback: Check localStorage
      const storedProfile = localStorage.getItem(`user-profile-${activeUid}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (!parsed.profilePicture) parsed.profilePicture = readSavedPicture(activeUid);
        setProfile(parsed);
        syncSubscriptionFromProfile(parsed);
        setLoading(false);
        setIsFetching(false);
        return;
      }

      // Fallback: Create initial healthy metabolic profile
      const currentSub = getSubscriptionStatus(activeUid);
      const fallbackProfile: UserProfile = {
        id: activeUid,
        email: user?.email || "user@mealoptimizer.app",
        name: user?.user_metadata?.name || localCached.name || "Frank Ogban",
        age: Number(user?.user_metadata?.age) || localCached.age || 28,
        bmi: Number(user?.user_metadata?.bmi) || localCached.bmi || 24.2,
        weight: user?.user_metadata?.weight || localCached.weight || "74",
        height: user?.user_metadata?.height || localCached.height || "175",
        bloodPressure: user?.user_metadata?.bloodPressure || localCached.bloodPressure || "120/80",
        systolic: Number(user?.user_metadata?.systolic) || localCached.systolic || 120,
        diastolic: Number(user?.user_metadata?.diastolic) || localCached.diastolic || 80,
        gender: user?.user_metadata?.gender || localCached.gender || "male",
        medicalCondition: user?.user_metadata?.medical_condition ||
                         user?.user_metadata?.goal ||
                         localCached.medicalCondition ||
                         "Metabolic Optimization",
        medications: user?.user_metadata?.medications || localCached.medications || "",
        allergies: user?.user_metadata?.allergies || localCached.allergies || "",
        location: user?.user_metadata?.location ||
                 localCached.location ||
                 localStorage.getItem("userLocation") ||
                 "Nigeria",
        profilePicture: user?.user_metadata?.profilePicture || readSavedPicture(activeUid) || localCached.profilePicture || "",
        plan: "pro",
        isPro: true,
        subscriptionExpiresAt: currentSub.expiresAt,
      };

      setProfile(fallbackProfile);
      syncSubscriptionFromProfile(fallbackProfile, activeUid);

      try {
        localStorage.setItem(`user-profile-${activeUid}`, JSON.stringify(fallbackProfile));
        localStorage.setItem("mealoptimizer_last_active_profile", JSON.stringify(fallbackProfile));
      } catch {}

      setLoading(false);
    } catch (error: any) {
      console.error("❌ Profile load error:", error);
      setLoading(false);
    } finally {
      setIsFetching(false);
    }
  };

  // Load profile when auth user changes
  useEffect(() => {
    refreshProfile();
  }, [user?.id]);

  // Update profile locally and lock in permanently
  const updateProfile = (updates: Partial<UserProfile>) => {
    const base = profile || DEFAULT_GUEST_PROFILE;
    const updatedProfile = { ...base, ...updates };
    setProfile(updatedProfile);
    syncSubscriptionFromProfile(updatedProfile);

    const activeUid = user?.id || "guest-user";
    try {
      localStorage.setItem(`user-profile-${activeUid}`, JSON.stringify(updatedProfile));
      localStorage.setItem("mealoptimizer_last_active_profile", JSON.stringify(updatedProfile));
      if (updates.profilePicture) {
        localStorage.setItem(`profile-picture-${activeUid}`, updates.profilePicture);
      }
    } catch {}
  };

  // Legacy setters for backward compatibility
  const setUserName = (name: string) => {
    updateProfile({ name });
  };

  const setProfilePicture = (picture: string | null) => {
    updateProfile({ profilePicture: picture || "" });
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        updateProfile,
        userName: profile?.name || "User",
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