import React, { useState } from "react";
import {
  Activity,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Radio,
  Sliders,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Bluetooth,
  Flame,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  generate24HourCGMTrace,
  CGMDataPoint,
  CGMSummaryMetrics,
  DEFAULT_MEAL_EVENTS,
} from "../../lib/cgmSimulator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";

interface CGMSensorVisualizerProps {
  compact?: boolean;
}

export default function CGMSensorVisualizer({ compact = false }: CGMSensorVisualizerProps) {
  const [showComparison, setShowComparison] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<string>("simulator");

  // Generate 24-hour trace
  const { points, metrics } = generate24HourCGMTrace(DEFAULT_MEAL_EVENTS);

  // Latest current reading (current time index)
  const currentHour = new Date().getHours();
  const currentPoint =
    points.find((p) => p.hour === currentHour) || points[points.length - 1];

  const handlePairSensor = (sensorName: string) => {
    triggerHaptic("medium");
    setSelectedSensor(sensorName);
    setShowConnectModal(false);
    toast.success(`Paired with ${sensorName}! Telemetry stream active 📡`);
  };

  return (
    <div className="space-y-4">
      {/* Top Telemetry & Sensor Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-teal-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-teal-300 flex items-center gap-1">
              <Radio size={13} /> Continuous Glucose Monitor (CGM)
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono text-slate-300">
              {selectedSensor === "simulator" ? "Virtual CGM Sensor" : selectedSensor}
            </span>
          </div>

          <button
            onClick={() => setShowConnectModal(true)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-teal-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Bluetooth size={12} />
            <span>Pair Hardware</span>
          </button>
        </div>

        {/* Current Glucose Hero Stat */}
        <div className="flex items-end justify-between gap-4 pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Real-Time Sensor Glucose
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {currentPoint.glucoseShielded}
              </span>
              <span className="text-xs font-bold text-teal-300">mg/dL</span>
              <span className="inline-flex items-center text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                ➔ Steady
              </span>
            </div>
            <p className="text-[11px] text-teal-200/80 mt-1">
              Target Safe Zone: <strong>70 – 140 mg/dL</strong>
            </p>
          </div>

          {/* Quick TIR Gauge Badge */}
          <div className="text-right">
            <div className="inline-flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Time in Range (TIR)
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {metrics.timeInRangePercent}%
              </span>
              <span className="text-[9px] text-slate-400">ADA Clinical Target &gt;70%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Continuous Area Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 shadow-lg border border-teal-100 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Activity size={16} className="text-[#1f7a8c]" /> 24-Hour Glycemic Curve
            </h3>
            <p className="text-[11px] text-zinc-500">
              Interactive trace sampled at 15-min sensor intervals with meal pins
            </p>
          </div>

          {/* A/B Comparison Toggle */}
          <button
            onClick={() => {
              triggerHaptic("light");
              setShowComparison(!showComparison);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showComparison
                ? "bg-teal-50 dark:bg-teal-950/40 text-[#1f7a8c] dark:text-teal-300 border-teal-200 dark:border-teal-800 shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200"
            }`}
          >
            <Sliders size={13} />
            <span>{showComparison ? "Hide Comparison" : "Compare Unshielded Curve"}</span>
          </button>
        </div>

        {/* Chart Container */}
        <div className="h-60 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cgmShieldedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cgmUnshieldedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                interval={15}
                stroke="#94a3b8"
              />
              <YAxis
                domain={[50, 200]}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                ticks={[70, 100, 140, 180]}
              />

              {/* Upper Target Threshold (140 mg/dL) */}
              <ReferenceLine
                y={140}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: "140 Target Max", fill: "#f59e0b", fontSize: 9, position: "insideTopRight" }}
              />

              {/* Lower Target Threshold (70 mg/dL) */}
              <ReferenceLine
                y={70}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "70 Target Min", fill: "#ef4444", fontSize: 9, position: "insideBottomRight" }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CGMDataPoint;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs border border-teal-500/40 space-y-1">
                        <div className="font-bold text-teal-300 flex items-center justify-between gap-3">
                          <span>🕒 {data.time}</span>
                          {data.isMealEvent && <span>{data.mealEmoji} {data.mealName}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span>Shielded Glucose: <strong>{data.glucoseShielded} mg/dL</strong></span>
                        </div>
                        {showComparison && (
                          <div className="flex items-center gap-2 text-rose-300">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span>Unshielded: <strong>{data.glucose} mg/dL</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Unshielded Curve (Comparison) */}
              {showComparison && (
                <Area
                  type="monotone"
                  dataKey="glucose"
                  name="Unshielded Swallow"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  fillOpacity={1}
                  fill="url(#cgmUnshieldedGrad)"
                />
              )}

              {/* Shielded Curve (Primary) */}
              <Area
                type="monotone"
                dataKey="glucoseShielded"
                name="Avo Fiber-Shielded"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cgmShieldedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-3 h-1 bg-emerald-500 rounded-full" />
            <span>Avo Fiber-Shielded Meal</span>
          </div>
          {showComparison && (
            <div className="flex items-center gap-1.5 font-bold text-rose-500">
              <span className="w-3 h-1 bg-rose-500 rounded-full border-dashed" />
              <span>Unshielded Carbs / Empty Stomach</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 font-medium text-amber-500">
            <span className="w-3 h-0.5 bg-amber-400 border-dotted" />
            <span>Safe Range (70–140 mg/dL)</span>
          </div>
        </div>
      </div>

      {/* Clinical ADA / EASD Metrics Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3.5 border border-teal-100 dark:border-zinc-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
            Time in Range
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-500 block mt-0.5">
            {metrics.timeInRangePercent}%
          </span>
          <span className="text-[9px] text-zinc-500">70–140 mg/dL</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3.5 border border-teal-100 dark:border-zinc-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
            Projected eA1c
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#1f7a8c] dark:text-teal-300 block mt-0.5">
            {metrics.estimatedA1c}%
          </span>
          <span className="text-[9px] text-zinc-500">ADA Formula</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3.5 border border-teal-100 dark:border-zinc-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
            Mean Glucose
          </span>
          <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 block mt-0.5">
            {metrics.meanGlucose}
          </span>
          <span className="text-[9px] text-zinc-500">mg/dL Daily Avg</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3.5 border border-teal-100 dark:border-zinc-800 shadow-sm text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
            Variability (CV)
          </span>
          <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 block mt-0.5">
            {metrics.glycemicVariabilityCV}%
          </span>
          <span className="text-[9px] text-zinc-500">Target &lt;36%</span>
        </div>
      </div>

      {/* A/B Biochemistry Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl p-4 border border-emerald-200 dark:border-emerald-900/40 flex items-start gap-3 text-xs">
        <Mascot gesture="thumbsup" size={46} className="flex-shrink-0" />
        <div>
          <h4 className="font-black text-emerald-950 dark:text-emerald-200 text-xs">
            How Avo's Fiber Shield Buffered Your Blood Sugar 🛡️
          </h4>
          <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 mt-1 leading-relaxed">
            By eating <strong>steamed Ugu & Ewedu soup first</strong> and cooling batch-cooked yam (resistant starch), your post-lunch peak dropped from <strong>178 mg/dL ➔ 128 mg/dL</strong>, completely preventing the dreaded 2:30 PM energy crash.
          </p>
        </div>
      </div>

      {/* SENSOR CONNECTION MODAL */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent className="max-w-md p-6 rounded-3xl">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-teal-50 rounded-2xl text-[#1f7a8c]">
                <Bluetooth className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-zinc-900">
                  Connect CGM Hardware Sensor 📡
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  Pair your continuous glucose monitor or health cloud account.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            {[
              { id: "dexcom", name: "Dexcom G6 / G7", sub: "Direct Cloud API Sync", badge: "Popular" },
              { id: "libre", name: "Abbott FreeStyle Libre 2 / 3", sub: "LibreView Cloud Integration", badge: "Popular" },
              { id: "apple_health", name: "Apple HealthKit / Health Connect", sub: "Sync glucose traces from phone", badge: "Built-in" },
              { id: "simulator", name: "Virtual Metabolic Sensor (Demo)", sub: "Mathematical 24-hr cultural simulator", badge: "Active" },
            ].map((sensor) => (
              <div
                key={sensor.id}
                onClick={() => handlePairSensor(sensor.name)}
                className="p-3.5 rounded-2xl bg-zinc-50 hover:bg-teal-50 border border-zinc-200 hover:border-teal-300 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-900">{sensor.name}</h4>
                    <span className="text-[9px] bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded-full font-bold">
                      {sensor.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{sensor.sub}</p>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </div>
            ))}
          </div>

          <Button
            onClick={() => setShowConnectModal(false)}
            variant="ghost"
            className="w-full text-zinc-500 text-xs h-9 cursor-pointer"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
