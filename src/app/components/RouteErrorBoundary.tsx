import { useEffect } from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { AlertTriangle, RefreshCw, Home, WifiOff } from "lucide-react";

/**
 * Friendly fallback shown by React Router whenever a screen throws while rendering.
 * Replaces the default "Unexpected Application Error" stack-trace page with offline recovery.
 */
export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  // Keep the real error in the console for debugging, but never show it to users.
  console.error("Route error caught by boundary:", error);

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : "An unexpected error occurred";

  // A stale-chunk error after a new deploy — reload once if online
  const isChunkError = /dynamically imported module|module script failed|importing a module|failed to fetch/i.test(detail);
  useEffect(() => {
    if (!isChunkError || isOffline) return;
    try {
      const last = Number(sessionStorage.getItem("chunkReloadAt") || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem("chunkReloadAt", String(Date.now()));
        window.location.reload();
      }
    } catch {
      /* ignore */
    }
  }, [isChunkError, isOffline]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full border border-teal-100">
        <div className={`rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${isOffline ? "bg-amber-50 text-amber-500" : "bg-red-50 text-red-500"}`}>
          {isOffline ? <WifiOff className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
        </div>
        
        <h1 className="text-2xl font-black text-gray-800 mb-2">
          {isOffline ? "Offline Mode 📡" : "Something went wrong"}
        </h1>
        
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {isOffline
            ? "You are currently offline. Your cached home dashboard, meal logs, and water tracker are ready to use."
            : "This screen ran into a temporary issue. You can reload it or head back to your home screen."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-md cursor-pointer"
          >
            <Home className="h-5 w-5" /> Go to Home Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-50 hover:bg-slate-100 text-gray-700 border border-slate-200 rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer text-sm"
          >
            <RefreshCw className="h-4 w-4" /> Try Reconnecting
          </button>
        </div>
        
        {!isOffline && (
          <p className="mt-5 text-[10px] text-gray-400 break-words">{detail}</p>
        )}
      </div>
    </div>
  );
}
