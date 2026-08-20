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
import PWAInstallBanner from "./components/PWAInstallBanner";

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

// Clear any stale mock meal plans from localStorage on every app load
Object.keys(localStorage)
  .filter((k) => k.startsWith("meal-plan-mock-") || k.startsWith("meal-plan-"))
  .forEach((k) => localStorage.removeItem(k));

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
                      <PWAInstallBanner />
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