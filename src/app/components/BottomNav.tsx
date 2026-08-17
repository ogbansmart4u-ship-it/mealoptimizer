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
      className="fixed bottom-0 left-0 right-0 bg-[#1f7a8c] text-white pt-4 shadow-lg z-50"
      style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <div className="max-w-md mx-auto flex justify-around items-center px-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const badge = badges[path];

          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80 min-w-[44px] relative"
            >
              <div className="relative">
                <Icon
                  className={`h-6 w-6 ${isActive ? 'fill-white' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {badge && badge.count > 0 && (
                  <div className={`absolute -top-2 -right-2 ${badge.color || 'bg-red-500'} text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1`}>
                    {badge.count > 9 ? '9+' : badge.count}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
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