import React from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in slide-in-from-top duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-amber-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <WifiOff size={16} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                Offline Mode
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>
            <p className="text-[10.5px] text-slate-300 truncate font-medium">
              Data saved locally • Will sync on reconnect
            </p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-[10.5px] font-bold shrink-0 transition-all flex items-center gap-1 border border-white/10"
        >
          <RefreshCw size={11} />
          <span>Retry</span>
        </button>
      </div>
    </div>
  );
}
