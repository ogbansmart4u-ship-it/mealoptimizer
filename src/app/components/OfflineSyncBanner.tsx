import React from "react";
import { WifiOff, RefreshCw, CheckCircle2, Zap } from "lucide-react";
import { useOfflineSync } from "../../lib/offlineSync";

export default function OfflineSyncBanner() {
  const { isOnline, pendingCount, isSyncing, flushQueue } = useOfflineSync();

  // If online and nothing pending, don't render anything
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[92vw] animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-auto">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-900/95 text-white backdrop-blur-md rounded-full shadow-xl border border-amber-500/40 text-xs font-semibold select-none">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <WifiOff size={14} className="text-amber-400 flex-shrink-0" />
          <span>Offline Mode · Logs will auto-sync when reconnected</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full font-mono text-[10px]">
              {pendingCount} saved
            </span>
          )}
        </div>
      ) : isSyncing ? (
        <div className="flex items-center gap-2.5 px-4 py-2 bg-teal-900/95 text-white backdrop-blur-md rounded-full shadow-xl border border-teal-400/50 text-xs font-semibold select-none">
          <RefreshCw size={14} className="text-teal-300 animate-spin flex-shrink-0" />
          <span>Syncing {pendingCount} offline logs to cloud...</span>
        </div>
      ) : (
        <button
          onClick={flushQueue}
          className="flex items-center gap-2.5 px-4 py-2 bg-teal-800 text-white rounded-full shadow-xl border border-teal-300 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
        >
          <Zap size={14} className="text-teal-300" />
          <span>{pendingCount} items ready to sync — Tap to Upload</span>
        </button>
      )}
    </div>
  );
}
