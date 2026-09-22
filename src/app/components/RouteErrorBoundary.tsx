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
    <div className="min-h-screen bg-canvas-organic dark:bg-[#0F1412] flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-white dark:bg-[#171E1B] rounded-3xl shadow-xl p-8 max-w-sm w-full border border-stone-200/80 dark:border-stone-800">
        <div className={`rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${isOffline ? "bg-amber-50 text-amber-500" : "bg-red-50 text-red-500"}`}>
          {isOffline ? <WifiOff className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
        </div>
        
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
          {isOffline ? "Offline Mode 📡" : "Something went wrong"}
        </h1>
        
        <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
          {isOffline
            ? "You are currently offline. Your cached home dashboard, meal logs, and water tracker are ready to use."
            : "This screen ran into a temporary issue. You can reload it or head back to your home screen."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-[#164E3D] hover:bg-[#113E30] text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xs cursor-pointer"
          >
            <Home className="h-5 w-5" /> Go to Home Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer text-sm"
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
