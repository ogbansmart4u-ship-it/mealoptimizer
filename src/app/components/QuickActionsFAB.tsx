import React, { useState } from "react";
import { Camera, MessageSquare, Mic, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import WhatsAppConnectDialog from "./WhatsAppConnectDialog";
import VoiceFoodLogger from "./VoiceFoodLogger";
import LocalFoodScanner from "./LocalFoodScanner";
import SmartVideoConcierge from "./SmartVideoConcierge";
import { triggerHaptic } from "../utils/celebration";

export default function QuickActionsFAB() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showSarahConcierge, setShowSarahConcierge] = useState(false);

  const toggleMenu = () => {
    triggerHaptic("medium");
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 🌟 10X FLOATING ACTION BUTTON CONTAINER */}
      <div className="fixed bottom-22 right-4 sm:right-6 z-[60] select-none">
        {/* Expanded 3 Curated Glassmorphic Action Items */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2.5 mb-2 items-end z-10">
            {/* Action 1: Ask Sarah AI Voice Companion */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setIsOpen(false);
                setShowSarahConcierge(true);
              }}
              className="group bg-gradient-to-r from-slate-900 via-[#126778] to-slate-900 text-white rounded-2xl pl-4 pr-3 py-2.5 shadow-2xl border border-teal-400/40 hover:scale-103 active:scale-97 transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="text-right">
                <span className="text-xs font-black block leading-tight text-white group-hover:text-amber-300 transition-colors">
                  Ask Sarah AI Voice
                </span>
                <span className="text-[9.5px] text-teal-200 font-bold block">
                  Food advice &amp; meal tips
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-teal-400/20 border border-teal-300/40 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform shrink-0">
                👩🏾‍💼
              </div>
            </button>

            {/* Action 2: Snap Plate (AI Vision Camera) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setIsOpen(false);
                setShowScannerModal(true);
              }}
              className="group bg-gradient-to-r from-[#126778] via-[#0d9488] to-[#14b8a6] text-white rounded-2xl pl-4 pr-3 py-2.5 shadow-2xl border border-white/20 hover:scale-103 active:scale-97 transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="text-right">
                <span className="text-xs font-black block leading-tight text-white group-hover:text-emerald-200 transition-colors">
                  Snap Plate
                </span>
                <span className="text-[9.5px] text-teal-100 font-bold block">
                  Camera AI Vision
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                <Camera size={18} className="text-white" />
              </div>
            </button>

            {/* Action 3: WhatsApp 1-Tap Food Logger */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setIsOpen(false);
                setShowWhatsAppModal(true);
              }}
              className="group bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl pl-4 pr-3 py-2.5 shadow-2xl border border-emerald-400/40 hover:scale-103 active:scale-97 transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="text-right">
                <span className="text-xs font-black block leading-tight text-white group-hover:text-emerald-200 transition-colors">
                  WhatsApp AI Bot
                </span>
                <span className="text-[9.5px] text-emerald-100 font-bold block">
                  Snap &amp; text meals in chat
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                <MessageSquare size={18} className="text-white" />
              </div>
            </button>
          </div>
        )}

        {/* 🌟 MAIN GLOWING SARAH AI FLOATING TRIGGER */}
        <button
          type="button"
          onClick={toggleMenu}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-2 border-white/90 ring-4 relative ${
            isOpen
              ? "bg-slate-900 rotate-90 ring-teal-400/40 text-white"
              : "bg-gradient-to-tr from-[#126778] via-[#0d9488] to-[#14b8a6] ring-teal-500/30 text-white shadow-teal-900/40"
          }`}
          aria-label={isOpen ? "Close quick actions" : "Open Sarah AI Quick Actions"}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <span className="text-2xl leading-none select-none">👩🏾‍💼</span>
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-ping" />
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>
          )}
        </button>

        {/* Ambient Dark Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-0"
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

      <LocalFoodScanner
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
      />

      <SmartVideoConcierge
        isOpen={showSarahConcierge}
        onClose={() => setShowSarahConcierge(false)}
        onOpenScanner={() => setShowScannerModal(true)}
        onOpenWhatsApp={() => setShowWhatsAppModal(true)}
      />
    </>
  );
}
