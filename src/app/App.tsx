import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppModeProvider } from "./contexts/AppModeContext";
import { LocationProvider } from "./contexts/LocationContext";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UnitsProvider } from "./contexts/UnitsContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { MascotProvider } from "./contexts/MascotContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { AchievementProvider, useAchievements } from "./contexts/AchievementContext";
import { Toaster } from "./components/ui/sonner";
import { LocationProfileSync } from "./components/LocationProfileSync";
import { AuthErrorBanner } from "./components/AuthErrorBanner";
import { EnvironmentCheck } from "./components/EnvironmentCheck";
import { AchievementNotification } from "./components/AchievementNotification";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { initNotificationEngine } from "../lib/notifications";
import OfflineSyncBanner from "./components/OfflineSyncBanner";
// PWAInstallBanner removed for App Store / Play Store compliance

function AchievementListener() {
  const { pendingNotification, dismissNotification } = useAchievements();

  if (!pendingNotification) return null;

  return (
    <AchievementNotification
      achievement={pendingNotification}
      onDismiss={dismissNotification}
    />
  );
}

function NotificationEngineListener() {
  useEffect(() => {
    const cleanup = initNotificationEngine();
    return cleanup;
  }, []);

  return null;
}

// Clear any stale mock meal plans from localStorage safely on app load
try {
  if (typeof window !== "undefined" && window.localStorage) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("meal-plan-mock-") || k.startsWith("meal-plan-"))
      .forEach((k) => localStorage.removeItem(k));
  }
} catch {
  /* ignore storage access restrictions */
}

// 🧹 Mobile & Tablet Stale Image Cache Buster: Purge old cache stores & sync to v10.5
try {
  if (typeof window !== "undefined") {
    const CURRENT_ASSET_VER = "v10.5-50veggies-20260910";
    const storedVer = localStorage.getItem("mealoptimizer_asset_ver");
    if (storedVer !== CURRENT_ASSET_VER) {
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => {
            if (!key.includes(CURRENT_ASSET_VER)) {
              console.log("[App] Purging stale browser cache store:", key);
              caches.delete(key);
            }
          });
        });
      }
      localStorage.setItem("mealoptimizer_asset_ver", CURRENT_ASSET_VER);
    }
  }
} catch {
  /* ignore storage / cache access restrictions */
}

// MealOptimiza - Nutrition app with personalized meal planning
export default function App() {
  return (
    <AppErrorBoundary>
    <AuthProvider>
      <ThemeProvider>
        <UnitsProvider>
          <LanguageProvider>
            <MascotProvider>
            <DashboardProvider>
              <AchievementProvider>
                <AppModeProvider>
                  <LocationProvider>
                    <UserProvider>
                      <LocationProfileSync />
                      <AchievementListener />
                      <NotificationEngineListener />
                      <OfflineSyncBanner />
                      {/* PWAInstallBanner removed */}
                      <RouterProvider router={router} />
                      <Toaster />
                    </UserProvider>
                  </LocationProvider>
                </AppModeProvider>
              </AchievementProvider>
            </DashboardProvider>
            </MascotProvider>
          </LanguageProvider>
        </UnitsProvider>
      </ThemeProvider>
    </AuthProvider>
    </AppErrorBoundary>
  );
}