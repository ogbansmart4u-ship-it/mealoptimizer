import { Home, Target, FileText, Utensils, User, HeartPulse } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

type NavBadge = {
  count: number;
  color?: string;
};

// The real bottom navigation bar. This is now rendered ONCE at the router
// layout level (see routes.tsx -> AppBottomNav) so it stays perfectly fixed
// while pages slide/fade beneath it. The per-page default export below is a
// no-op, so the existing `<BottomNav />` calls in individual pages render
// nothing and don't need to be touched.
function BottomNavBar() {
  const location = useLocation();
  const { t } = useLanguage();
  const [badges, setBadges] = useState<Record<string, NavBadge>>({});

  useEffect(() => {
    // Calculate badges based on localStorage data
    const updateBadges = () => {
      const newBadges: Record<string, NavBadge> = {};

      // Goals: Count incomplete goals
      const goalsData = localStorage.getItem("goalsData");
      if (goalsData) {
        try {
          const goals = JSON.parse(goalsData);
          const incompleteCount = goals.filter((g: any) => !g.completed).length;
          if (incompleteCount > 0) {
            newBadges["/goals"] = { count: incompleteCount, color: "bg-red-500" };
          }
        } catch (e) {
          console.error("Error parsing goals data:", e);
        }
      }

      // Logs: Check if today's meals are logged
      const logsData = localStorage.getItem("mealLogs");
      if (logsData) {
        try {
          const logs = JSON.parse(logsData);
          const today = new Date().toISOString().split("T")[0];
          const todayLogs = logs.filter((log: any) => log.date === today);
          const pendingMeals = 3 - todayLogs.length; // Assuming 3 meals per day
          if (pendingMeals > 0) {
            newBadges["/logs"] = { count: pendingMeals, color: "bg-red-500" };
          }
        } catch (e) {
          console.error("Error parsing logs data:", e);
        }
      }

      setBadges(newBadges);
    };

    updateBadges();

    // Update badges when returning to the page
    const interval = setInterval(updateBadges, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [location.pathname]);

    const navItems = [
    { path: "/home", icon: Home, label: t("nav.home") || "Home" },
    { path: "/recipe", icon: Utensils, label: t("nav.recipe") || "Recipes" },
    { path: "/health", icon: HeartPulse, label: t("nav.health") || "Health" },
    { path: "/profile", icon: User, label: t("nav.profile") || "Me" },
  ];

  return (
    <nav
      className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-md bg-[#FAF8F5]/92 dark:bg-[#171E1B]/92 backdrop-blur-2xl text-stone-700 dark:text-stone-200 pt-2 pb-2 px-2 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.10)] border border-stone-200/80 dark:border-stone-800/80 z-40 transition-all"
      style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center px-1.5">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const badge = badges[path];
          const isHealth = path === "/health";

          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center py-1 gap-1 transition-all duration-300 w-full relative group ${
                isActive
                  ? "text-[#164E3D] dark:text-emerald-400 font-bold"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 font-medium"
              }`}
            >
              <div
                className={`relative px-3 py-1 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "animate-nav-pop bg-[#164E3D]/10 dark:bg-emerald-400/15 shadow-xs"
                    : "group-hover:scale-105"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-300 ${
                    isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                  } ${
                    isHealth && isActive ? "animate-heartbeat" : ""
                  }`}
                />
                {badge && badge.count > 0 && (
                  <div
                    className={`absolute -top-1.5 -right-1.5 ${
                      badge.color || "bg-rose-500"
                    } animate-badge-bounce text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm border border-white dark:border-stone-900`}
                  >
                    {badge.count > 9 ? "9+" : badge.count}
                  </div>
                )}
              </div>
              <span
                className={`text-xs tracking-tight transition-all ${
                  isActive
                    ? "text-[#164E3D] dark:text-emerald-400 font-bold scale-105"
                    : "text-stone-500 dark:text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200"
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#164E3D] dark:bg-emerald-400 shadow-xs animate-fade-in -mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Rendered once at the layout level for a persistent, transition-proof nav bar.
export function AppBottomNav() {
  return <BottomNavBar />;
}

// Per-page usages now render nothing (nav lives at the layout). Kept as the
// default export so the many existing `<BottomNav />` imports still resolve.
export default function BottomNav() {
  return null;
}