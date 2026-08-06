import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router";

// Structural components stay eager — they're small and needed to render the shell.
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import RouteErrorBoundary from "./components/RouteErrorBoundary";

// Pages are code-split: each becomes its own chunk, loaded on demand.
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const DirectSignup = lazy(() => import("./pages/DirectSignup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Home = lazy(() => import("./pages/Home"));
const Goals = lazy(() => import("./pages/Goals"));
const Logs = lazy(() => import("./pages/Logs"));
const Recipe = lazy(() => import("./pages/Recipe"));
const Profile = lazy(() => import("./pages/Profile"));
const Location = lazy(() => import("./pages/Location"));
const Weight = lazy(() => import("./pages/Weight"));
const Age = lazy(() => import("./pages/Age"));
const Medications = lazy(() => import("./pages/Medications"));
const MedicalCondition = lazy(() => import("./pages/MedicalCondition"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PlanMeal = lazy(() => import("./pages/PlanMeal"));
const MealPlanView = lazy(() => import("./pages/MealPlanView"));
const MyMealPlans = lazy(() => import("./pages/MyMealPlans"));
const GroceryList = lazy(() => import("./pages/GroceryList"));
const ScanBarcode = lazy(() => import("./pages/ScanBarcode"));
const BiometricDashboard = lazy(() => import("./pages/BiometricDashboard"));
const GlucoseInsights = lazy(() => import("./pages/GlucoseInsights"));
const HealthReport = lazy(() => import("./pages/HealthReport"));
const MedicalVault = lazy(() => import("./pages/MedicalVault"));
const HydrationTracker = lazy(() => import("./pages/HydrationTracker"));
const SleepTracker = lazy(() => import("./pages/SleepTracker"));
const MedicationTracker = lazy(() => import("./pages/MedicationTracker"));
const WorkoutLogger = lazy(() => import("./pages/WorkoutLogger"));
const FastingTimer = lazy(() => import("./pages/FastingTimer"));
const SymptomTracker = lazy(() => import("./pages/SymptomTracker"));
const About = lazy(() => import("./pages/About"));
const HyperPersonalizedPlan = lazy(() => import("./pages/HyperPersonalizedPlan"));
const Personalization = lazy(() => import("./pages/Personalization"));
const Reminders = lazy(() => import("./pages/Reminders"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Health = lazy(() => import("./pages/Health"));

// Lightweight fallback shown while a page chunk loads.
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5]">
      <div className="h-10 w-10 rounded-full border-4 border-[#1f7a8c]/30 border-t-[#1f7a8c] animate-spin" />
    </div>
  );
}

// Root wrapper: Suspense catches every lazily-loaded page chunk.
function RootLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    // Root wrapper: any screen error shows a friendly fallback, not a stack trace
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
  // ============================================================
  // Public / auth / legal pages — intentionally NO bottom nav
  // ============================================================
  { path: "/", Component: Landing },
  { path: "/login", Component: Login },
  { path: "/signup", Component: SignUp },
  { path: "/direct-signup", Component: DirectSignup },
  { path: "/forgot-password", Component: ForgotPassword },
  { path: "/reset-password", Component: ResetPassword },
  { path: "/privacy-policy", Component: PrivacyPolicy },
  { path: "/terms-and-conditions", Component: TermsAndConditions },

  // ============================================================
  // Onboarding / signup-flow steps — NO bottom nav (single flow)
  // ============================================================
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: "/age",
    element: (
      <ProtectedRoute>
        <Age />
      </ProtectedRoute>
    ),
  },
  {
    path: "/medical-condition",
    element: (
      <ProtectedRoute>
        <MedicalCondition />
      </ProtectedRoute>
    ),
  },
  {
    path: "/medications",
    element: (
      <ProtectedRoute>
        <Medications />
      </ProtectedRoute>
    ),
  },

  // ============================================================
  // App pages that ALREADY render their own <BottomNav /> —
  // left as-is to avoid a duplicate nav bar.
  // ============================================================
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/goals",
    element: (
      <ProtectedRoute>
        <Goals />
      </ProtectedRoute>
    ),
  },
  {
    path: "/logs",
    element: (
      <ProtectedRoute>
        <Logs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recipe",
    element: (
      <ProtectedRoute>
        <Recipe />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/health",
    element: (
      <ProtectedRoute>
        <Health />
      </ProtectedRoute>
    ),
  },
  {
    path: "/achievements",
    element: (
      <ProtectedRoute>
        <Achievements />
      </ProtectedRoute>
    ),
  },
  {
    path: "/biometrics",
    element: (
      <ProtectedRoute>
        <BiometricDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/glucose-insights",
    element: (
      <ProtectedRoute>
        <GlucoseInsights />
      </ProtectedRoute>
    ),
  },
  {
    path: "/health-report",
    element: (
      <ProtectedRoute>
        <HealthReport />
      </ProtectedRoute>
    ),
  },
  {
    path: "/medical-vault",
    element: (
      <ProtectedRoute>
        <MedicalVault />
      </ProtectedRoute>
    ),
  },
  {
    path: "/hydration",
    element: (
      <ProtectedRoute>
        <HydrationTracker />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sleep",
    element: (
      <ProtectedRoute>
        <SleepTracker />
      </ProtectedRoute>
    ),
  },
  {
    path: "/medication-tracker",
    element: (
      <ProtectedRoute>
        <MedicationTracker />
      </ProtectedRoute>
    ),
  },
  {
    path: "/workout",
    element: (
      <ProtectedRoute>
        <WorkoutLogger />
      </ProtectedRoute>
    ),
  },
  {
    path: "/fasting",
    element: (
      <ProtectedRoute>
        <FastingTimer />
      </ProtectedRoute>
    ),
  },

  // ============================================================
  // Previously STRANDED app pages (no nav) — now wrapped in
  // AppLayout so the BottomNav appears on every one of them.
  // ============================================================
  {
    element: <AppLayout />,
    children: [
      {
        path: "/weight",
        element: (
          <ProtectedRoute>
            <Weight />
          </ProtectedRoute>
        ),
      },
      {
        path: "/location",
        element: (
          <ProtectedRoute>
            <Location />
          </ProtectedRoute>
        ),
      },
      {
        path: "/plan-meal",
        element: (
          <ProtectedRoute>
            <PlanMeal />
          </ProtectedRoute>
        ),
      },
      {
        path: "/meal-plan",
        element: (
          <ProtectedRoute>
            <MealPlanView />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-meal-plans",
        element: (
          <ProtectedRoute>
            <MyMealPlans />
          </ProtectedRoute>
        ),
      },
      {
        path: "/grocery-list",
        element: (
          <ProtectedRoute>
            <GroceryList />
          </ProtectedRoute>
        ),
      },
      {
        path: "/scan-barcode",
        element: (
          <ProtectedRoute>
            <ScanBarcode />
          </ProtectedRoute>
        ),
      },
      {
        path: "/symptoms",
        element: (
          <ProtectedRoute>
            <SymptomTracker />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reminders",
        element: (
          <ProtectedRoute>
            <Reminders />
          </ProtectedRoute>
        ),
      },
      {
        path: "/personalization",
        element: (
          <ProtectedRoute>
            <Personalization />
          </ProtectedRoute>
        ),
      },
      {
        path: "/hyper-personalized-plan",
        element: (
          <ProtectedRoute>
            <HyperPersonalizedPlan />
          </ProtectedRoute>
        ),
      },
      {
        path: "/about",
        element: (
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        ),
      },
    ],
  },
    ],
  },
]);
