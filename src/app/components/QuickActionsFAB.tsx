import React, { useState, lazy, Suspense } from "react";
import { Camera, MessageSquare, Mic, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import WhatsAppConnectDialog from "./WhatsAppConnectDialog";
import VoiceFoodLogger from "./VoiceFoodLogger";
import LocalFoodScanner from "./LocalFoodScanner";
import SmartVideoConcierge from "./SmartVideoConcierge";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";
import { toast } from "sonner";

const PlateScannerModal = lazy(() =>
  import("./PlateScannerModal").then((m) => ({ default: m.PlateScannerModal }))
);

export default function QuickActionsFAB() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showARPlateScanner, setShowARPlateScanner] = useState(false);
  const [showSarahConcierge, setShowSarahConcierge] = useState(false);

  const toggleMenu = () => {
    triggerHaptic("medium");
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* 🌟 10X FLOATING ACTION BUTTON CONTAINER */}
      <div id="tour-fab-actions" className="fixed bottom-22 right-4 sm:right-6 z-[60] select-none">
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
              className="group bg-stone-900/95 dark:bg-stone-900/95 text-white rounded-2xl pl-4 pr-3 py-2.5 shadow-2xl border border-stone-700/80 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="text-right">
                <span className="text-xs font-bold block leading-tight text-white group-hover:text-amber-300 transition-colors">
                  Ask Sarah AI Voice
                </span>
                <span className="text-xs text-stone-400 font-medium block">
                  Food advice &amp; meal tips
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform shrink-0">
                👩🏾‍💼
              </div>
            </button>

            {/* Action 2: Snap Plate (9-Inch AR Plate Calibrator) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic("medium");
                setIsOpen(false);
                setShowARPlateScanner(true);
              }}
              className="group bg-[#164E3D] hover:bg-[#113E30] text-white rounded-2xl pl-4 pr-3 py-2.5 shadow-2xl border border-emerald-400/30 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="text-right">
                <span className="text-xs font-bold block leading-tight text-white group-hover:text-emerald-200 transition-colors">
                  Snap Plate (AR)
                </span>
                <span className="text-xs text-emerald-200/90 font-medium block">
                  9-Inch Plate Calibrator
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
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
              className="group bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 rounded-2xl pl-4 pr-3 py-2.5 shadow-2xl border border-white/30 hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-3 cursor-pointer"
            >
              <div className="text-right">
                <span className="text-xs font-bold block leading-tight text-slate-950 transition-colors">
                  WhatsApp AI Bot
                </span>
                <span className="text-xs text-slate-900/80 font-medium block">
                  Snap &amp; text meals in chat
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-black/10 border border-black/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                <MessageSquare size={18} className="text-slate-950" />
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
              ? "bg-stone-900 rotate-90 ring-stone-700/50 text-white"
              : "bg-[#164E3D] hover:bg-[#113E30] ring-[#164E3D]/30 text-white shadow-[#164E3D]/30"
          }`}
          aria-label={isOpen ? "Close quick actions" : "Open Sarah AI Quick Actions"}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <span className="text-2xl leading-none select-none">👩🏾‍💼</span>
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#164E3D] animate-ping" />
              <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#164E3D]" />
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

      {showARPlateScanner && (
        <Suspense fallback={null}>
          <PlateScannerModal
            isOpen={showARPlateScanner}
            onClose={() => setShowARPlateScanner(false)}
            onSaveMealLog={(data) => {
              try { triggerConfetti(); } catch {}
              try { triggerHaptic("success"); } catch {}
              toast.success(`Avo Plate Score: ${data.score}%! Saved to Food Journal 🥑`);
            }}
          />
        </Suspense>
      )}

      <SmartVideoConcierge
        isOpen={showSarahConcierge}
        onClose={() => setShowSarahConcierge(false)}
        onOpenScanner={() => setShowARPlateScanner(true)}
        onOpenWhatsApp={() => setShowWhatsAppModal(true)}
      />
    </>
  );
}
