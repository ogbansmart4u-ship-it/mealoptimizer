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

// Register the service worker in production for offline support + installability.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration failures are non-fatal */
    });
  });
}
