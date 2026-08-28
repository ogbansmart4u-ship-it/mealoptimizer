import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { triggerHaptic } from "../utils/celebration";

export const MAIN_NAV_TABS = [
  "/home",
  "/goals",
  "/logs",
  "/health",
  "/recipe",
  "/profile",
] as const;

export type MainNavTab = (typeof MAIN_NAV_TABS)[number];

interface SwipeConfig {
  minDistance?: number;
  maxTime?: number;
  maxOffAxisRatio?: number;
  onSwipeChange?: (dir: number) => void;
}

/**
 * Custom hook providing native-grade horizontal swipe gesture navigation
 * between main application tabs (Home <-> Goals <-> Logs <-> Health <-> Recipe <-> Profile).
 */
export function useSwipeNavigation(config?: SwipeConfig) {
  const location = useLocation();
  const navigate = useNavigate();

  const minDistance = config?.minDistance ?? 48; // Minimum horizontal distance in px
  const maxTime = config?.maxTime ?? 450; // Maximum swipe duration in ms
  const maxOffAxisRatio = config?.maxOffAxisRatio ?? 0.7; // Vertical/Horizontal ratio limit

  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const isIgnored = useRef<boolean>(false);

  useEffect(() => {
    // Only enable swipe gesture navigation when on one of the main 6 tabs
    const currentPath = location.pathname;
    const currentIndex = MAIN_NAV_TABS.indexOf(currentPath as MainNavTab);

    if (currentIndex === -1) {
      return; // Not a main tab, skip attaching listener
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        isIgnored.current = true;
        return;
      }

      const touch = e.touches[0];
      const target = e.target as HTMLElement | null;

      // Filter out elements where horizontal gestures should not trigger page changes:
      // 1. Range sliders, inputs, textareas, contenteditable
      // 2. Open modals / dialogs / drawers
      // 3. Scrollable horizontal carousels with remaining scroll
      if (target) {
        if (
          target.closest("input, textarea, select, [contenteditable='true'], [role='dialog'], [data-state='open'], .no-swipe")
        ) {
          isIgnored.current = true;
          return;
        }

        // Check if touch is inside an active horizontal scroll area
        let el: HTMLElement | null = target;
        while (el && el !== document.body) {
          const overflowX = window.getComputedStyle(el).overflowX;
          if (
            (overflowX === "auto" || overflowX === "scroll") &&
            el.scrollWidth > el.clientWidth + 10
          ) {
            // Horizontal container found - check if it has scroll headroom
            const atLeft = el.scrollLeft <= 5;
            const atRight = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
            if (!atLeft || !atRight) {
              isIgnored.current = true;
              return;
            }
          }
          el = el.parentElement;
        }
      }

      isIgnored.current = false;
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      startTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (
        isIgnored.current ||
        startX.current === null ||
        startY.current === null ||
        startTime.current === null
      ) {
        reset();
        return;
      }

      const touch = e.changedTouches[0];
      const diffX = touch.clientX - startX.current;
      const diffY = touch.clientY - startY.current;
      const duration = Date.now() - startTime.current;

      const absX = Math.abs(diffX);
      const absY = Math.abs(diffY);

      // Validate swipe mechanics:
      // 1. Must exceed minimum distance
      // 2. Must happen within max duration
      // 3. Must be predominantly horizontal (not diagonal or vertical scroll)
      if (absX >= minDistance && duration <= maxTime && absY / absX <= maxOffAxisRatio) {
        if (diffX < 0) {
          // Swiped LEFT (finger moved right-to-left) -> Move to NEXT tab
          if (currentIndex < MAIN_NAV_TABS.length - 1) {
            const nextTab = MAIN_NAV_TABS[currentIndex + 1];
            try {
              triggerHaptic("light");
            } catch {}
            config?.onSwipeChange?.(1);
            navigate(nextTab);
          }
        } else if (diffX > 0) {
          // Swiped RIGHT (finger moved left-to-right) -> Move to PREVIOUS tab
          if (currentIndex > 0) {
            const prevTab = MAIN_NAV_TABS[currentIndex - 1];
            try {
              triggerHaptic("light");
            } catch {}
            config?.onSwipeChange?.(-1);
            navigate(prevTab);
          }
        }
      }

      reset();
    };

    const reset = () => {
      startX.current = null;
      startY.current = null;
      startTime.current = null;
      isIgnored.current = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [location.pathname, minDistance, maxTime, maxOffAxisRatio, navigate]);
}
