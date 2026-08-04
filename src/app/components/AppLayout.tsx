import { Outlet } from "react-router";
import BottomNav from "./BottomNav";

/**
 * Shared layout for authenticated app pages that previously had NO navigation.
 * Renders the page via <Outlet /> and pins the BottomNav so users always have
 * a way to move between pages. Bottom padding keeps content clear of the fixed nav.
 */
export default function AppLayout() {
  return (
    <>
      <div className="pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}
