import { Outlet } from "react-router";
import BottomNav from "./BottomNav";
import QuickActionsFAB from "./QuickActionsFAB";

export default function AppLayout() {
  return (
    <>
      <div className="pb-24">
        <Outlet />
      </div>
      <QuickActionsFAB />
      <BottomNav />
    </>
  );
}
