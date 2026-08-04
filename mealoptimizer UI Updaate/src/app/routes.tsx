import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import DirectSignup from "./pages/DirectSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Goals from "./pages/Goals";
import Logs from "./pages/Logs";
import Recipe from "./pages/Recipe";
import Profile from "./pages/Profile";
import Location from "./pages/Location";
import Weight from "./pages/Weight";
import Age from "./pages/Age";
import Medications from "./pages/Medications";
import MedicalCondition from "./pages/MedicalCondition";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import PlanMeal from "./pages/PlanMeal";
import MealPlanView from "./pages/MealPlanView";
import MyMealPlans from "./pages/MyMealPlans";
import GroceryList from "./pages/GroceryList";
import ScanBarcode from "./pages/ScanBarcode";
import BiometricDashboard from "./pages/BiometricDashboard";
import MedicalVault from "./pages/MedicalVault";
import HydrationTracker from "./pages/HydrationTracker";
import SleepTracker from "./pages/SleepTracker";
import MedicationTracker from "./pages/MedicationTracker";
import WorkoutLogger from "./pages/WorkoutLogger";
import FastingTimer from "./pages/FastingTimer";
import SymptomTracker from "./pages/SymptomTracker";
import About from "./pages/About";
import HyperPersonalizedPlan from "./pages/HyperPersonalizedPlan";
import Personalization from "./pages/Personalization";
import Reminders from "./pages/Reminders";
import Achievements from "./pages/Achievements";
import Health from "./pages/Health";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

export const router = createBrowserRouter([
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
]);
