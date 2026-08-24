import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, PlusSquare, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import Mascot from "./Mascot";
import { toast } from "sonner";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return; // Already installed as PWA!
    }

    // 2. Check if user dismissed recently (7-day cooldown)
    const dismissedAt = Number(localStorage.getItem("pwa_install_dismissed_at") || 0);
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - dismissedAt < ONE_WEEK_MS) {
      return;
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    if (isAppleDevice) {
      // Delay showing banner slightly on iOS for smooth onboarding
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(timer);
    }

    // 4. Android / Chrome beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic("medium");

    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      toast.info("To install: tap your browser's menu (⋮) and choose 'Add to Home Screen'");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      triggerConfetti("burst");
      toast.success("MealOptimiza Installed! 🥑🎉");
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem("pwa_install_dismissed_at", String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Floating Bottom Install Banner */}
      <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
        <div className="bg-slate-900/95 text-white backdrop-blur-md p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-teal-500/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Mascot gesture="waving" size={42} className="flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-white flex items-center gap-1 leading-tight">
                Install MealOptimiza <Sparkles size={12} className="text-amber-400" />
              </span>
              <p className="text-[10px] text-teal-200 truncate mt-0.5">
                Fast 1-tap launch & full offline logging
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              onClick={handleInstallClick}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl text-xs font-extrabold px-3 py-1.5 h-8 shadow-md cursor-pointer"
            >
              <Download size={13} className="mr-1" />
              Install
            </Button>

            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="max-w-sm p-6 rounded-3xl text-center">
          <DialogHeader>
            <div className="mx-auto p-3 bg-teal-50 rounded-2xl text-[#1f7a8c] w-fit mb-2">
              <Smartphone size={28} />
            </div>
            <DialogTitle className="text-lg font-black text-gray-900">
              Install on iPhone / iPad 📱
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Install MealOptimiza to your Home Screen in 2 simple steps:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-left text-xs">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
              <div className="p-2 bg-white rounded-xl shadow-xs text-blue-600 font-bold">
                <Share size={18} />
              </div>
              <div>
                <span className="font-bold text-gray-900 block">1. Tap the Share Button</span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Located at the bottom of Safari (or top right on iPad).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl">
              <div className="p-2 bg-white rounded-xl shadow-xs text-emerald-600 font-bold">
                <PlusSquare size={18} />
              </div>
              <div>
                <span className="font-bold text-gray-900 block">2. Select "Add to Home Screen"</span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Scroll down the share sheet and tap <strong>Add to Home Screen</strong>.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setShowIOSModal(false)}
            className="w-full bg-[#1f7a8c] hover:bg-[#165a67] text-white rounded-2xl font-bold text-xs h-10 cursor-pointer"
          >
            Got It!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
