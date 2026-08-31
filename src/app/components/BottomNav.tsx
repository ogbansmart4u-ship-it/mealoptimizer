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
    { path: "/home", icon: Home, label: t("nav.home") },
    { path: "/goals", icon: Target, label: t("nav.goals") },
    { path: "/logs", icon: FileText, label: t("nav.logs") },
    { path: "/health", icon: HeartPulse, label: t("nav.health") },
    { path: "/recipe", icon: Utensils, label: t("nav.recipe") },
    { path: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <nav
      className="fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-md bg-[#126778]/95 dark:bg-zinc-950/95 backdrop-blur-2xl text-white pt-2.5 pb-2.5 px-2 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.28)] border border-white/25 dark:border-white/10 z-50 transition-all"
      style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto flex justify-around items-center px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const badge = badges[path];
          const isHealth = path === "/health";
          const isGoals = path === "/goals";

          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 min-w-[46px] relative group ${
                isActive ? "text-white" : "text-white/70 hover:text-white"
              }`}
            >
              <div className={`relative p-1 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "animate-nav-pop bg-white/15 shadow-inner"
                  : "group-hover:scale-105"
              }`}>
                <Icon
                  className={`h-5.5 w-5.5 transition-transform duration-300 ${
                    isActive ? "fill-white/20" : ""
                  } ${
                    isHealth && isActive
                      ? "animate-heartbeat text-emerald-300"
                      : isGoals && isActive
                      ? "animate-pulse-radar text-amber-300"
                      : ""
                  }`}
                  strokeWidth={isActive ? 2.6 : 2}
                />
                {badge && badge.count > 0 && (
                  <div className={`absolute -top-1.5 -right-2 ${badge.color || 'bg-rose-500'} animate-badge-bounce text-white text-[10px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-md border border-white/40`}>
                    {badge.count > 9 ? '9+' : badge.count}
                  </div>
                )}
              </div>
              <span className={`text-[11px] font-bold tracking-tight transition-all ${
                isActive ? "text-white scale-105" : "text-white/75 group-hover:text-white"
              }`}>
                {label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-xs animate-fade-in -mt-0.5" />
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