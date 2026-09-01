import { lazy, Suspense, useEffect, useRef } from "react";
import { createBrowserRouter, useLocation, useOutlet, useNavigationType, Navigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AppBottomNav } from "./components/BottomNav";
import OfflineBanner from "./components/OfflineBanner";
import { useSwipeNavigation, MAIN_NAV_TABS } from "./hooks/useSwipeNavigation";

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
const UpgradePro = lazy(() => import("./pages/UpgradePro"));
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
const Challenge = lazy(() => import("./pages/Challenge"));
const WhatsAppLanding = lazy(() => import("./pages/WhatsAppLanding"));
const FoodCalculators = lazy(() => import("./pages/FoodCalculators"));
const ClinicianPortal = lazy(() => import("./pages/ClinicianPortal"));

// Lightweight fallback shown while a page chunk loads.
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5]">
      <div className="h-10 w-10 rounded-full border-4 border-[#1f7a8c]/30 border-t-[#1f7a8c] animate-spin" />
    </div>
  );
}

// ============================================================
//  PAGE TRANSITIONS
// ------------------------------------------------------------
//  Change TRANSITION_STYLE below to switch the feel app-wide:
//    'slide' — pages slide in/out horizontally (direction follows
//              browser back/forward), with a soft fade. (default)
//    'zoom'  — pages scale up gently as they fade in.
//    'fade'  — a clean smooth cross-fade.
//    'blink' — a very fast fade, like a quick blink/flash.
//  Users with "reduce motion" enabled always get a quick fade.
// ============================================================
const TRANSITION_STYLE: "slide" | "zoom" | "fade" | "blink" = "slide";

const SLIDE_PX = 28;
const EASE = [0.22, 1, 0.36, 1] as const; // easeOutQuint — smooth, premium
const DURATION: Record<typeof TRANSITION_STYLE, number> = {
  slide: 0.26,
  zoom: 0.28,
  fade: 0.24,
  blink: 0.13,
};

// Variants per style. `custom` carries the navigation direction
// (+1 = forward / push, -1 = back / pop) so slides feel spatial.
const buildVariants = (style: typeof TRANSITION_STYLE) => {
  if (style === "slide") {
    return {
      initial: (dir: number) => ({ opacity: 0, x: dir >= 0 ? SLIDE_PX : -SLIDE_PX }),
      animate: { opacity: 1, x: 0 },
      exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -SLIDE_PX : SLIDE_PX }),
    };
  }
  if (style === "zoom") {
    return {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.03 },
    };
  }
  // 'fade' and 'blink' share opacity-only variants (differ only in duration)
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
};

// Drop the CSS transform to `none` once a page is at rest (x:0, scale:1).
// A lingering transform on an ancestor re-anchors `position: fixed` children
// (floating "+" buttons, bulk-action bars, undo toasts) to that ancestor
// instead of the viewport. Returning 'none' at rest keeps them pinned
// correctly; they only travel with the page during the brief transition.
const restlessTransform = (latest: any, generated: string) => {
  const xRest = latest.x === undefined || latest.x === 0 || latest.x === "0px" || latest.x === "0";
  const scaleRest = latest.scale === undefined || latest.scale === 1;
  return xRest && scaleRest ? "none" : generated;
};

// Routes that display the persistent bottom navigation bar. Includes both the
// primary tab pages and the AppLayout-wrapped sub-pages that previously showed
// the nav via that layout.
const NAV_ROUTES = new Set<string>([
  // Primary pages (previously rendered <BottomNav/> directly)
  "/home", "/goals", "/logs", "/recipe", "/profile", "/health",
  "/achievements", "/biometrics", "/glucose-insights", "/medical-vault",
  "/hydration", "/sleep", "/medication-tracker", "/workout", "/fasting",
  // AppLayout-wrapped sub-pages (previously got the nav from AppLayout)
  "/weight", "/location", "/plan-meal", "/meal-plan", "/my-meal-plans",
  "/grocery-list", "/scan-barcode", "/symptoms", "/reminders",
  "/personalization", "/hyper-personalized-plan", "/about",
]);

// Root wrapper: AnimatePresence plays an exit + enter animation on every route
// change (Suspense catches lazily-loaded page chunks per page). The bottom nav
// is rendered ONCE here, as a sibling OUTSIDE the animated area, so it stays
// perfectly fixed and persistent while pages slide/zoom/fade beneath it.
function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const navType = useNavigationType(); // 'PUSH' | 'REPLACE' | 'POP'
  const reduced = useReducedMotion();
  const prevPathRef = useRef(location.pathname);

  // Enable native-grade horizontal swipe gesture navigation across main tabs
  useSwipeNavigation();

  // Instant password recovery route protection
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash || "" : "";
    const search = typeof window !== "undefined" ? window.location.search || "" : "";
    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      if (location.pathname !== "/reset-password") {
        window.location.replace(`/reset-password${search}${hash}`);
      }
    }
  }, [location.pathname]);

  // Direction-aware spatial transition computation
  const prevIndex = (MAIN_NAV_TABS as readonly string[]).indexOf(prevPathRef.current);
  const currIndex = (MAIN_NAV_TABS as readonly string[]).indexOf(location.pathname);
  let dir = navType === "POP" ? -1 : 1;
  if (prevIndex !== -1 && currIndex !== -1 && prevIndex !== currIndex) {
    dir = currIndex > prevIndex ? 1 : -1;
  }

  useEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const style = reduced ? "blink" : TRANSITION_STYLE;
  const variants = buildVariants(style);
  const duration = reduced ? 0.12 : DURATION[style];
  const showNav = NAV_ROUTES.has(location.pathname);

  return (
    <>
      <OfflineBanner />
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={location.pathname}
          custom={dir}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration, ease: EASE }}
          transformTemplate={restlessTransform}
        >
          <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
        </motion.div>
      </AnimatePresence>
      {showNav && <AppBottomNav />}
    </>
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
  { path: "/", Component: Login },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Login },
  { path: "/direct-signup", Component: DirectSignup },
  { path: "/forgot-password", Component: ForgotPassword },
  { path: "/reset-password", Component: ResetPassword },
  { path: "/privacy-policy", Component: PrivacyPolicy },
  { path: "/privacy", Component: PrivacyPolicy },
  { path: "/terms-and-conditions", Component: TermsAndConditions },
  { path: "/terms", Component: TermsAndConditions },
  { path: "/whatsapp", Component: WhatsAppLanding },
  { path: "/whatsapp-ai", Component: WhatsAppLanding },
  { path: "/calculators", Component: FoodCalculators },
  { path: "/food-calculators", Component: FoodCalculators },
  { path: "/clinician-portal", Component: ClinicianPortal },
  { path: "/provider", Component: ClinicianPortal },

  // ============================================================
  // Onboarding / signup-flow steps — NO bottom nav (single flow)
  // ============================================================
  { path: "/onboarding", Component: Onboarding },
  { path: "/age", element: <Navigate to="/onboarding" replace /> },
  { path: "/medical-condition", element: <Navigate to="/onboarding" replace /> },
  {
    path: "/medications",
    element: (
      <ProtectedRoute>
        <MedicationTracker />
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
    path: "/challenge",
    element: (
      <ProtectedRoute>
        <Challenge />
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
    path: "/upgrade",
    element: (
      <ProtectedRoute>
        <UpgradePro />
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
            <BiometricDashboard />
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
        path: "/grocery",
        element: (
          <ProtectedRoute>
            <GroceryList />
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
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
    ],
  },
]);
