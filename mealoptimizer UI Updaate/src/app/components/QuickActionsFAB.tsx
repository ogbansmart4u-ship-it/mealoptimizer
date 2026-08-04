import { useState } from "react";
import { Plus, Camera, FileText, Utensils, Activity, X } from "lucide-react";
import { useNavigate } from "react-router";

type QuickAction = {
  id: string;
  label: string;
  icon: typeof Camera;
  color: string;
  route: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "log-meal",
    label: "Log Meal",
    icon: Camera,
    color: "bg-blue-500",
    route: "/logs",
  },
  {
    id: "plan-meal",
    label: "Plan Meal",
    icon: Utensils,
    color: "bg-green-500",
    route: "/plan-meal",
  },
  {
    id: "add-workout",
    label: "Log Workout",
    icon: Activity,
    color: "bg-orange-500",
    route: "/workout",
  },
  {
    id: "add-log",
    label: "Quick Log",
    icon: FileText,
    color: "bg-purple-500",
    route: "/logs",
  },
];

export default function QuickActionsFAB() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleActionClick = (route: string) => {
    navigate(route);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-3">
          {QUICK_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.route)}
                className={`${action.color} text-white rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group animate-in fade-in slide-in-from-bottom-2`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
          isOpen
            ? "bg-red-500 rotate-45"
            : "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4]"
        }`}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
