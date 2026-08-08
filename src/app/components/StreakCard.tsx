import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getMealLogs } from "../../lib/api";

const AMBER = "#F59E0B";

function dayKey(d: Date) {
  return d.toISOString().split("T")[0];
}

/**
 * Daily logging streak, computed from the user's meal logs.
 * A "day" counts if at least one meal was logged that calendar day.
 */
export default function StreakCard() {
  const [current, setCurrent] = useState(0);
  const [longest, setLongest] = useState(0);
  const [week, setWeek] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const logs = await getMealLogs();
        const days = new Set<string>();
        (logs || []).forEach((l: any) => {
          const k = l?.date || (l?.createdAt ? String(l.createdAt).split("T")[0] : null);
          if (k) days.add(k);
        });
        const has = (d: Date) => days.has(dayKey(d));

        // Current streak: count back from today (or yesterday if today isn't logged yet)
        let c = 0;
        const d = new Date();
        if (!has(d)) d.setDate(d.getDate() - 1);
        while (has(d)) {
          c++;
          d.setDate(d.getDate() - 1);
        }
        setCurrent(c);

        // Longest streak across all logged days
        const sorted = [...days].sort();
        let best = 0, run = 0;
        let prev: Date | null = null;
        for (const s of sorted) {
          const cur = new Date(s + "T00:00:00");
          if (prev) {
            const diff = Math.round((+cur - +prev) / 86400000);
            run = diff === 1 ? run + 1 : 1;
          } else {
            run = 1;
          }
          best = Math.max(best, run);
          prev = cur;
        }
        setLongest(best);

        // Last 7 days (oldest → newest) for the dot row
        const wk: boolean[] = [];
        for (let i = 6; i >= 0; i--) {
          const dd = new Date();
          dd.setDate(dd.getDate() - i);
          wk.push(has(dd));
        }
        setWeek(wk);
      } catch {
        /* non-fatal — show a zero streak */
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 flex items-center gap-4">
      <div className="rounded-2xl p-3 flex-shrink-0" style={{ backgroundColor: `${AMBER}1a` }}>
        <Flame className="h-7 w-7" style={{ color: AMBER }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-gray-800">
          {current} day{current === 1 ? "" : "s"}{" "}
          <span className="text-sm font-normal text-gray-500">streak</span>
        </div>
        <div className="text-xs text-gray-500">
          {!loaded
            ? "Loading your streak…"
            : current > 0
            ? `Keep it up! Longest streak: ${longest} day${longest === 1 ? "" : "s"}`
            : "Log a meal today to start your streak"}
        </div>
        <div className="flex gap-1.5 mt-2" aria-hidden="true">
          {week.map((active, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: active ? AMBER : "#E5E7EB" }}
            />
          ))}
        </div>
      </div>
      {loaded && current > 0 && (
        <img
          src="/assets/mascot.png"
          alt=""
          aria-hidden="true"
          className="w-14 h-14 object-contain flex-shrink-0 self-center drop-shadow-sm"
        />
      )}
    </div>
  );
}
