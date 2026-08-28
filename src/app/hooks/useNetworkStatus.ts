import { useState, useEffect } from "react";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        try {
          triggerHaptic("success");
        } catch {}
        toast.success("Back Online! 🟢", {
          description: "Connected. Local meal & hydration logs synced.",
          duration: 3500,
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      try {
        triggerHaptic("warning");
      } catch {}
      toast.info("Offline Mode Active 📡", {
        description: "You are offline. Logs and meal plans are saved locally.",
        duration: 4000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}
