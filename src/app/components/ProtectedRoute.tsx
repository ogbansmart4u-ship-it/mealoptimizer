import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const isGuestMode = typeof window !== "undefined" && (
    localStorage.getItem("mealoptimiza_guest_mode") === "true" ||
    new URLSearchParams(window.location.search).get("demo") === "true" ||
    new URLSearchParams(window.location.search).get("tour") === "true"
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      if (search.get("demo") === "true" || search.get("tour") === "true") {
        try {
          localStorage.setItem("mealoptimiza_guest_mode", "true");
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    // Only redirect after loading is complete and we know there's no user and not in guest demo mode
    if (!loading && !user && !isGuestMode) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate, isGuestMode]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-organic dark:bg-[#0F1412] flex items-center justify-center">
        <div className="text-[#164E3D] dark:text-emerald-400 font-semibold text-sm">Loading...</div>
      </div>
    );
  }

  // Allow children if authenticated OR in guest demo mode
  if (!user && !isGuestMode) {
    return null;
  }

  return <>{children}</>;
}
