import { useState } from "react";
import { Shield, Droplet, Moon, Pill, Zap, Dumbbell, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";

type TrackerItem = {
  id: string;
  label: string;
  icon: typeof Shield;
  gradient: string;
  borderColor: string;
  route: string;
};

const TRACKERS: TrackerItem[] = [
  {
    id: "medical",
    label: "Medical Vault",
    icon: Shield,
    gradient: "from-purple-500 to-pink-500",
    borderColor: "border-purple-400",
    route: "/medical-vault",
  },
  {
    id: "hydration",
    label: "Hydration",
    icon: Droplet,
    gradient: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-400",
    route: "/hydration",
  },
  {
    id: "sleep",
    label: "Sleep",
    icon: Moon,
    gradient: "from-indigo-500 to-purple-500",
    borderColor: "border-indigo-400",
    route: "/sleep",
  },
  {
    id: "medication",
    label: "Medication",
    icon: Pill,
    gradient: "from-emerald-500 to-teal-500",
    borderColor: "border-emerald-400",
    route: "/medications",
  },
  {
    id: "workout",
    label: "Workout",
    icon: Dumbbell,
    gradient: "from-orange-500 to-red-500",
    borderColor: "border-orange-400",
    route: "/workout",
  },
  {
    id: "fasting",
    label: "Fasting",
    icon: Clock,
    gradient: "from-purple-600 to-pink-600",
    borderColor: "border-purple-400",
    route: "/fasting",
  },
  {
    id: "symptoms",
    label: "Symptoms",
    icon: AlertCircle,
    gradient: "from-red-500 to-orange-500",
    borderColor: "border-red-400",
    route: "/symptoms",
  },
];

export default function TrackerWheel() {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleCenterClick = () => {
    setIsSpinning(true);
    setRotation((prev) => prev + 51.43);
    setTimeout(() => setIsSpinning(false), 500);
  };

  const handleTrackerClick = (route: string) => {
    navigate(route);
  };

  // Calculate position for each tracker button in a circle
  const getPositionStyle = (index: number, totalItems: number) => {
    const angle = (index * 360) / totalItems - rotation;
    const radius = 88; // Distance from center
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;

    return {
      transform: `translate(${x}px, ${y}px) rotate(-${rotation}deg)`,
      transition: isSpinning ? "transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)" : "transform 0.3s ease",
    };
  };

  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      {/* Outer decorative circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-72 h-72 rounded-full border-4 border-gray-200 opacity-40"></div>
      </div>

      {/* Tracker Buttons positioned in circle */}
      <div className="relative w-64 h-64">
        {TRACKERS.map((tracker, index) => {
          const Icon = tracker.icon;
          return (
            <button
              key={tracker.id}
              onClick={() => handleTrackerClick(tracker.route)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              style={getPositionStyle(index, TRACKERS.length)}
            >
              <div className={`w-12 h-12 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-br ${tracker.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-[9px] text-gray-700 font-semibold text-center leading-tight w-14">
                {tracker.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Center Hub - Click to rotate */}
      <button
        onClick={handleCenterClick}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white shadow-xl border-4 border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all ${
          isSpinning ? "animate-pulse" : ""
        }`}
      >
        <Zap className={`h-6 w-6 text-gray-600 ${isSpinning ? "animate-spin" : ""}`} />
        <span className="text-[10px] text-gray-700 font-bold">TRACKERS</span>
      </button>
    </div>
  );
}
