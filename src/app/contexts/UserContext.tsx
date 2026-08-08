import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserProfile } from "../../lib/api";
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
  medicalCondition: string;
  medications?: string;
  allergies?: string;
  location: string;
  profilePicture?: string;
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
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [isFetching, setIsFetching] = useState(false); // Prevent duplicate fetches

  // Fetch user profile from backend
  const refreshProfile = async () => {
    // Early return if no user - don't show loading or make API calls
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (isFetching) {
      console.log("Profile fetch already in progress, skipping");
      return;
    }

    try {
      setIsFetching(true);
      setLoading(true);

      console.log("Fetching user profile for user:", user.id);

      // Try to get profile from backend
      try {
        const profileData = await getUserProfile();
        console.log("✅ Profile loaded successfully from backend:", profileData);
        setProfile(profileData);
        setLoading(false);
        setIsFetching(false);
        return; // Success! Exit early
      } catch (apiError: any) {
        console.warn("⚠️ Backend API unavailable:", apiError.message);

        // Check if it's a JWT algorithm error
        if (apiError?.message?.includes('ES256') ||
            apiError?.message?.includes('JWT') ||
            apiError?.message?.includes('Unauthorized')) {
          console.log('🔧 Using offline mode - Edge Function not configured');
          console.log('💡 Profile data will be loaded from local auth metadata');
        }

        // Continue to fallback below
      }

      // Fallback: Use local storage and auth metadata
      console.log("📦 Loading profile from localStorage and auth metadata");

      // Try localStorage first
      const storedProfile = localStorage.getItem(`user-profile-${user.id}`);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        console.log("✅ Profile loaded from localStorage");
        setProfile(parsed);
      } else {
        // Create profile from auth metadata
        console.log("Creating profile from auth metadata");
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || "User",
          age: user.user_metadata?.age || 25,
          bmi: user.user_metadata?.bmi || 22,
          weight: user.user_metadata?.weight || "",
          medicalCondition: user.user_metadata?.medical_condition ||
                           user.user_metadata?.goal ||
                           "General Health",
          medications: user.user_metadata?.medications || "",
          allergies: user.user_metadata?.allergies || "",
          location: user.user_metadata?.location ||
                   localStorage.getItem('userLocation') ||
                   "Nigeria",
          profilePicture: user.user_metadata?.profilePicture || "",
        };

        setProfile(fallbackProfile);

        // Save to localStorage for next time
        localStorage.setItem(`user-profile-${user.id}`, JSON.stringify(fallbackProfile));
        console.log("✅ Profile created and saved to localStorage");
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
    // Only fetch when user exists and changes
    if (user?.id) {
      refreshProfile();
    } else {
      // Clear profile when user logs out
      setProfile(null);
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user ID, not the whole user object

  // Update profile locally (call this after backend update)
  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);

      // Save to localStorage for offline use
      if (user) {
        localStorage.setItem(`user-profile-${user.id}`, JSON.stringify(updatedProfile));
        console.log("✅ Profile updated in localStorage");
      }
    }
  };

  // Legacy setters for backward compatibility
  const setUserName = (name: string) => {
    if (profile) {
      setProfile({ ...profile, name });
    }
  };

  const setProfilePicture = (picture: string | null) => {
    if (profile) {
      setProfile({
        ...profile,
        profilePicture: picture || undefined,
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        loading,
        refreshProfile,
        updateProfile,
        // Legacy compatibility
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
    throw new Error(
      "useUser must be used within a UserProvider",
    );
  }
  return context;
}