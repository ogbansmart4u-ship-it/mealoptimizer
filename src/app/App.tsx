import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppModeProvider } from "./contexts/AppModeContext";
import { LocationProvider } from "./contexts/LocationContext";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UnitsProvider } from "./contexts/UnitsContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { AchievementProvider, useAchievements } from "./contexts/AchievementContext";
import { Toaster } from "./components/ui/sonner";
import { LocationProfileSync } from "./components/LocationProfileSync";
import { AuthErrorBanner } from "./components/AuthErrorBanner";
import { EnvironmentCheck } from "./components/EnvironmentCheck";
import { AchievementNotification } from "./components/AchievementNotification";

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

// Clear any stale mock meal plans from localStorage on every app load
Object.keys(localStorage)
  .filter((k) => k.startsWith("meal-plan-mock-") || k.startsWith("meal-plan-"))
  .forEach((k) => localStorage.removeItem(k));

// MealOptimiza - Nutrition app with personalized meal planning
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <UnitsProvider>
          <LanguageProvider>
            <DashboardProvider>
              <AchievementProvider>
                <AppModeProvider>
                  <LocationProvider>
                    <UserProvider>
                      {/* Temporarily disabled while working with mock data */}
                      {/* <EnvironmentCheck /> */}
                      {/* <AuthErrorBanner /> */}
                      <LocationProfileSync />
                      <AchievementListener />
                      <RouterProvider router={router} />
                      <Toaster />
                    </UserProvider>
                  </LocationProvider>
                </AppModeProvider>
              </AchievementProvider>
            </DashboardProvider>
          </LanguageProvider>
        </UnitsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}