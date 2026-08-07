import { useEffect } from "react";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Friendly fallback shown by React Router whenever a screen throws while rendering.
 * Replaces the default "Unexpected Application Error" stack-trace page.
 */
export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  // Keep the real error in the console for debugging, but never show it to users.
  console.error("Route error caught by boundary:", error);

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : "An unexpected error occurred";

  // A stale-chunk error after a new deploy — the browser is running an old build
  // and asked for a route chunk that no longer exists. Reload once to get the
  // fresh build (10s guard avoids a reload loop if it's genuinely broken).
  const isChunkError = /dynamically imported module|module script failed|importing a module|failed to fetch/i.test(detail);
  useEffect(() => {
    if (!isChunkError) return;
    try {
      const last = Number(sessionStorage.getItem("chunkReloadAt") || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem("chunkReloadAt", String(Date.now()));
        window.location.reload();
      }
    } catch {
      /* ignore */
    }
  }, [isChunkError]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full">
        <div className="bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-6">
          This screen ran into a problem. You can reload it or head back to your home screen.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <RefreshCw className="h-5 w-5" /> Reload
          </button>
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-white text-[#1f7a8c] border-2 border-[#1f7a8c] rounded-2xl py-3.5 font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Home className="h-5 w-5" /> Go to Home
          </button>
        </div>
        <p className="mt-5 text-[11px] text-gray-400 break-words">{detail}</p>
      </div>
    </div>
  );
}
