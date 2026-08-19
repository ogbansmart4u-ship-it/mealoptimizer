import { useState } from "react";
import { Plus, Camera, FileText, Utensils, Activity, X, MessageSquare, Mic, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router";
import WhatsAppConnectDialog from "./WhatsAppConnectDialog";
import VoiceFoodLogger from "./VoiceFoodLogger";
import SmartGroceryPlanner from "./SmartGroceryPlanner";

type QuickAction = {
  id: string;
  label: string;
  icon: any;
  color: string;
  route: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "voice-log",
    label: "Voice Log (Pidgin/English)",
    icon: Mic,
    color: "bg-rose-500",
    route: "voice",
  },
  {
    id: "whatsapp-log",
    label: "WhatsApp Log",
    icon: MessageSquare,
    color: "bg-[#25D366]",
    route: "whatsapp",
  },
  {
    id: "market-checklist",
    label: "Smart Market List",
    icon: ShoppingCart,
    color: "bg-amber-600",
    route: "grocery",
  },
  {
    id: "log-meal",
    label: "Snap Meal Photo",
    icon: Camera,
    color: "bg-blue-500",
    route: "/logs",
  },
  {
    id: "plan-meal",
    label: "Plan Balanced Meal",
    icon: Utensils,
    color: "bg-emerald-600",
    route: "/plan-meal",
  },
];

export default function QuickActionsFAB() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showGroceryModal, setShowGroceryModal] = useState(false);

  const handleActionClick = (route: string) => {
    if (route === "whatsapp") {
      setShowWhatsAppModal(true);
    } else if (route === "voice") {
      setShowVoiceModal(true);
    } else if (route === "grocery") {
      setShowGroceryModal(true);
    } else {
      navigate(route);
    }
    setIsOpen(false);
  };

  return (
    <>
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
                  className={`${action.color} text-white rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group animate-in fade-in slide-in-from-bottom-2 cursor-pointer`}
                  style={{
                    animationDelay: `${index * 35}ms`,
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold whitespace-nowrap">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
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
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-[-1]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      <WhatsAppConnectDialog
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />

      <VoiceFoodLogger
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
      />

      <SmartGroceryPlanner
        isOpen={showGroceryModal}
        onClose={() => setShowGroceryModal(false)}
      />
    </>
  );
}
