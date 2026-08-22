import { useState } from "react";
import { Plus, Camera, Utensils, X, MessageSquare, Mic, ShoppingCart, Sparkles } from "lucide-react";
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
    color: "bg-gradient-to-r from-rose-500 to-pink-600",
    route: "voice",
  },
  {
    id: "whatsapp-log",
    label: "WhatsApp AI Bot",
    icon: MessageSquare,
    color: "bg-gradient-to-r from-emerald-500 to-teal-600",
    route: "whatsapp",
  },
  {
    id: "market-checklist",
    label: "Smart Market List",
    icon: ShoppingCart,
    color: "bg-gradient-to-r from-amber-500 to-orange-600",
    route: "grocery",
  },
  {
    id: "log-meal",
    label: "Snap Meal Photo",
    icon: Camera,
    color: "bg-gradient-to-r from-blue-500 to-cyan-600",
    route: "/logs",
  },
  {
    id: "plan-meal",
    label: "Plan Balanced Meal",
    icon: Utensils,
    color: "bg-gradient-to-r from-teal-600 to-emerald-700",
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
      {/* Floating Action Container with High Z-Index so it stays on top of BottomNav */}
      <div className="fixed bottom-22 right-5 z-[60] select-none">
        {/* Expanded Floating Popups */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2.5 mb-2.5 items-end">
            {QUICK_ACTIONS.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.route)}
                  className={`${action.color} text-white rounded-2xl px-4 py-3 shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 active:scale-95 cursor-pointer border border-white/20`}
                  style={{
                    animation: `slideUpFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    animationDelay: `${index * 30}ms`,
                  }}
                >
                  <span className="text-xs font-black tracking-wide whitespace-nowrap shadow-xs drop-shadow-xs">
                    {action.label}
                  </span>
                  <div className="p-1.5 bg-white/20 rounded-xl shadow-xs">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Glowing Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/80 ring-4 ${
            isOpen
              ? "bg-rose-500 rotate-90 ring-rose-400/30 text-white"
              : "bg-gradient-to-tr from-[#126778] via-[#1f7a8c] to-[#38b2ac] ring-teal-500/30 text-white shadow-teal-900/30"
          }`}
          aria-label={isOpen ? "Close quick actions" : "Open quick actions menu"}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Plus className="h-6 w-6 text-white stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white" />
            </div>
          )}
        </button>

        {/* Dark Backdrop for Floating Actions */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[-1]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Floating Modals */}
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
