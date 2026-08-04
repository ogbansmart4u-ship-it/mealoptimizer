import { Home, Target, FileText, Utensils, User, HeartPulse } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";

type NavBadge = {
  count: number;
  color?: string;
};

export default function BottomNav() {
  const location = useLocation();
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
            newBadges["/goals"] = { count: incompleteCount, color: "bg-orange-500" };
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
            newBadges["/logs"] = { count: pendingMeals, color: "bg-yellow-500" };
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
    { path: "/home", icon: Home, label: "Home" },
    { path: "/goals", icon: Target, label: "Goals" },
    { path: "/logs", icon: FileText, label: "Logs" },
    { path: "/health", icon: HeartPulse, label: "Health" },
    { path: "/recipe", icon: Utensils, label: "Recipe" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1f7a8c] text-white py-4 shadow-lg z-50">
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