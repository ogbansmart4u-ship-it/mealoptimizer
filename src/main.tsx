import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);

// After a new deploy, hashed chunk filenames change. A browser still running the
// previous build can fail to load a lazily-imported route chunk that no longer
// exists on the server ("Failed to fetch dynamically imported module"). When Vite
// signals this, reload once to fetch the fresh build. The 10s guard prevents a
// reload loop if the chunk is genuinely unavailable.
function recoverFromStaleChunk() {
  try {
    const last = Number(sessionStorage.getItem("chunkReloadAt") || 0);
    if (Date.now() - last > 10000) {
      sessionStorage.setItem("chunkReloadAt", String(Date.now()));
      window.location.reload();
    }
  } catch {
    window.location.reload();
  }
}
window.addEventListener("vite:preloadError", (e) => {
  e.preventDefault();
  recoverFromStaleChunk();
});

// Light tactile feedback on taps (Android/Chrome only — iOS Safari has no web
// haptics, and the feature check simply no-ops there). Fires once per tap on
// buttons/links; skips disabled controls and respects reduced-motion.
if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    window.addEventListener(
      "pointerdown",
      (e) => {
        const el = (e.target as HTMLElement)?.closest?.('button, [role="button"], a');
        if (el && !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true") {
          try { navigator.vibrate(8); } catch { /* ignore */ }
        }
      },
      { passive: true },
    );
  }
}

// Register Service Worker for PWA offline support
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Automatically check for SW updates
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] New version available, will activate on next reload.");
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration failed:", err);
      });
  });
}
