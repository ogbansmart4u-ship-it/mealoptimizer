import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserProfile, updateUserProfile } from "../../lib/api";
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
  plan: "free",
  isPro: false,
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

      // 1. Read local cached profile first so we never drop biodata
      let localCached: any = {};
      try {
        const storedProfileRaw = localStorage.getItem("user-profile-" + activeUid) || localStorage.getItem("mealoptimizer_last_active_profile");
        if (storedProfileRaw) localCached = JSON.parse(storedProfileRaw);
      } catch {
        /* ignore */
      }

      // 2. If user is authenticated, retrieve cloud data
      if (user) {
        try {
          const profileData = await getUserProfile();
          const savedPic = readSavedPicture(user.id);
          const currentSub = getSubscriptionStatus(user.id);
          const resolvedPlan: "free" | "pro" | "family" =
            currentSub.plan === "free"
              ? "free"
              : (currentSub.plan || profileData?.plan || localCached.plan || "free");
          const resolvedIsPro = resolvedPlan === "pro" || resolvedPlan === "family";

          // Extract auth metadata
          const authMeta = user.user_metadata || {};

          // Extract values prioritizing actual user entered values over generic defaults
          const resolvedName = profileData?.name || authMeta.name || localCached.name || user.email?.split('@')[0] || "Friend";
          const resolvedAge = profileData?.age ?? authMeta.age ?? localCached.age ?? 28;
          const resolvedWeight = profileData?.weight ?? authMeta.weight ?? localCached.weight ?? "70";
          const resolvedHeight = profileData?.height ?? authMeta.height ?? localCached.height ?? "170";
          const resolvedBmi = profileData?.bmi ?? authMeta.bmi ?? localCached.bmi ?? 24.2;
          const resolvedBp = profileData?.bloodPressure ?? authMeta.bloodPressure ?? localCached.bloodPressure ?? "120/80";
          const resolvedSystolic = profileData?.systolic ?? authMeta.systolic ?? localCached.systolic ?? 120;
          const resolvedDiastolic = profileData?.diastolic ?? authMeta.diastolic ?? localCached.diastolic ?? 80;
          const resolvedGender = profileData?.gender || authMeta.gender || localCached.gender || "male";
          const resolvedCondition = profileData?.medicalCondition || profileData?.medical_condition || authMeta.medicalCondition || authMeta.medical_condition || localCached.medicalCondition || "Metabolic Optimization";
          const resolvedLocation = profileData?.location || authMeta.location || localCached.location || localStorage.getItem("userLocation") || "Nigeria";
          const resolvedPic = profileData?.profilePicture || authMeta.profilePicture || savedPic || localCached.profilePicture || "";

          const merged: UserProfile = {
            ...localCached,
            ...profileData,
            ...authMeta,
            id: user.id,
            email: user.email || profileData?.email || localCached.email || "user@mealoptimizer.app",
            name: resolvedName,
            age: Number(resolvedAge) || 28,
            weight: String(resolvedWeight),
            height: String(resolvedHeight),
            bmi: Number(resolvedBmi) || 24.2,
            bloodPressure: String(resolvedBp),
            systolic: Number(resolvedSystolic) || 120,
            diastolic: Number(resolvedDiastolic) || 80,
            gender: resolvedGender,
            medicalCondition: resolvedCondition,
            location: resolvedLocation,
            profilePicture: resolvedPic,
            plan: resolvedPlan,
            isPro: resolvedIsPro,
            subscriptionExpiresAt: profileData?.subscriptionExpiresAt || localCached.subscriptionExpiresAt || currentSub.expiresAt,
          };

          setProfile(merged);

          try {
            localStorage.setItem("user-profile-" + user.id, JSON.stringify(merged));
            localStorage.setItem("mealoptimizer_last_active_profile", JSON.stringify(merged));
            if (merged.profilePicture) {
              localStorage.setItem("profile-picture-" + user.id, merged.profilePicture);
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
      const storedProfile = localStorage.getItem("user-profile-" + activeUid) || localStorage.getItem("mealoptimizer_last_active_profile");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        if (!parsed.profilePicture) parsed.profilePicture = readSavedPicture(activeUid);
        const currentSub = getSubscriptionStatus(activeUid);
        if (currentSub.plan === "free") {
          parsed.plan = "free";
          parsed.isPro = false;
        }
        setProfile(parsed);
        setLoading(false);
        setIsFetching(false);
        return;
      }

      // Initial guest fallback
      const currentSub = getSubscriptionStatus(activeUid);
      const fallbackProfile: UserProfile = {
        ...DEFAULT_GUEST_PROFILE,
        id: activeUid,
        email: user?.email || "user@mealoptimizer.app",
        name: user?.user_metadata?.name || localCached.name || "Friend",
        age: Number(user?.user_metadata?.age) || localCached.age || 28,
        bmi: Number(user?.user_metadata?.bmi) || localCached.bmi || 24.2,
        weight: String(user?.user_metadata?.weight || localCached.weight || "70"),
        height: String(user?.user_metadata?.height || localCached.height || "170"),
        bloodPressure: String(user?.user_metadata?.bloodPressure || localCached.bloodPressure || "120/80"),
        systolic: Number(user?.user_metadata?.systolic) || localCached.systolic || 120,
        diastolic: Number(user?.user_metadata?.diastolic) || localCached.diastolic || 80,
        gender: user?.user_metadata?.gender || localCached.gender || "male",
        medicalCondition: user?.user_metadata?.medical_condition ||
                         user?.user_metadata?.medicalCondition ||
                         localCached.medicalCondition ||
                         "Metabolic Optimization",
        medications: user?.user_metadata?.medications || localCached.medications || "",
        allergies: user?.user_metadata?.allergies || localCached.allergies || "",
        location: user?.user_metadata?.location ||
                 localCached.location ||
                 localStorage.getItem("userLocation") ||
                 "Nigeria",
        profilePicture: user?.user_metadata?.profilePicture || readSavedPicture(activeUid) || localCached.profilePicture || "",
        plan: currentSub.plan || "free",
        isPro: currentSub.isPro || false,
        subscriptionExpiresAt: currentSub.expiresAt,
      };

      setProfile(fallbackProfile);

      try {
        localStorage.setItem("user-profile-" + activeUid, JSON.stringify(fallbackProfile));
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

  // Update profile locally and lock in permanently to cloud
  const updateProfile = (updates: Partial<UserProfile>) => {
    const base = profile || DEFAULT_GUEST_PROFILE;
    const updatedProfile = { ...base, ...updates };
    setProfile(updatedProfile);
    syncSubscriptionFromProfile(updatedProfile);

    const activeUid = user?.id || "guest-user";
    try {
      localStorage.setItem("user-profile-" + activeUid, JSON.stringify(updatedProfile));
      localStorage.setItem("mealoptimizer_last_active_profile", JSON.stringify(updatedProfile));
      if (updates.profilePicture) {
        localStorage.setItem("profile-picture-" + activeUid, updates.profilePicture);
      }
    } catch {}

    // Auto-sync to Supabase cloud if user is logged in
    if (user?.id) {
      updateUserProfile(updates).catch((err) => {
        console.warn("Background cloud profile sync deferred:", err);
      });
    }
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