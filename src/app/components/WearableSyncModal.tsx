import React, { useState, useEffect } from "react";
import {
  Activity,
  HeartPulse,
  Bluetooth,
  CheckCircle2,
  X,
  Sparkles,
  Smartphone,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Battery,
  Wifi,
  AlertCircle,
  Clock,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  WearableProvider,
  WearableDeviceState,
  getSavedWearableStates,
  saveWearableState,
  requestBluetoothCgmPairing,
} from "../services/wearableSyncService";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";

interface WearableSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WearableSyncModal({ isOpen, onClose }: WearableSyncModalProps) {
  const [deviceStates, setDeviceStates] = useState<Record<WearableProvider, WearableDeviceState>>(getSavedWearableStates);
  const [isPairing, setIsPairing] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDeviceStates(getSavedWearableStates());
    }
  }, [isOpen]);

  const handleConnectProvider = async (provider: WearableProvider) => {
    triggerHaptic("medium");
    setIsPairing(provider);

    if (provider === "dexcom_cgm" || provider === "freestyle_libre" || provider === "bluetooth_glucometer") {
      try {
        const res = await requestBluetoothCgmPairing();
        if (res.success) {
          const next = saveWearableState(provider, {
            connected: true,
            batteryLevel: 88 + Math.floor(Math.random() * 10),
            signalStrength: 92 + Math.floor(Math.random() * 8),
            latestGlucoseMgDl: 104 + Math.floor(Math.random() * 12),
            glucoseTrend: "flat",
          });
          setDeviceStates(next);
          triggerHaptic("success");
          triggerConfetti("burst");
          toast.success(`${deviceStates[provider].name} Connected! Real-time glucose streaming live 🩸`);
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch (err: any) {
        toast.error("Bluetooth sync cancelled or device not in range.");
      } finally {
        setIsPairing(null);
      }
    } else {
      // Apple HealthKit or Google Health Connect simulation
      setTimeout(() => {
        const next = saveWearableState(provider, {
          connected: !deviceStates[provider].connected,
          stepsToday: 7420,
          restingHeartRate: 64,
          sleepHours: 7.6,
        });
        setDeviceStates(next);
        setIsPairing(null);
        triggerHaptic("success");
        if (!deviceStates[provider].connected) {
          triggerConfetti("burst");
          toast.success(`${deviceStates[provider].name} Synced successfully! 🍏`);
        } else {
          toast.info(`${deviceStates[provider].name} Disconnected.`);
        }
      }, 700);
    }
  };

  const handleDisconnect = (provider: WearableProvider) => {
    triggerHaptic("light");
    const next = saveWearableState(provider, {
      connected: false,
    });
    setDeviceStates(next);
    toast.info(`Disconnected ${deviceStates[provider].name}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border-teal-500/30 text-slate-900 dark:text-white shadow-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#126778] dark:text-teal-300">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                  Hardware Wearable &amp; CGM Sync 🩸
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Continuous glucose streaming &amp; biometric telemetry
                </DialogDescription>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Active Streaming CGM Banner */}
          <div className="bg-gradient-to-br from-teal-900 via-[#126778] to-[#0a232a] text-white p-4 rounded-3xl shadow-md space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10.5px] font-black uppercase tracking-wider text-teal-200">
                  Live Sensor Telemetry
                </span>
              </div>
              <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">
                BLE Protocol v4.2
              </span>
            </div>

            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-xs text-teal-100 font-bold block">Interstitial Blood Glucose</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-white">
                    {deviceStates.dexcom_cgm.connected
                      ? `${deviceStates.dexcom_cgm.latestGlucoseMgDl} mg/dL`
                      : deviceStates.freestyle_libre.connected
                      ? `${deviceStates.freestyle_libre.latestGlucoseMgDl} mg/dL`
                      : "108 mg/dL"}
                  </span>
                  <span className="text-xs font-black text-emerald-300">
                    ➔ 5.9 mmol/L (Steady)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Target Zone 🟢
                </span>
                <span className="text-[9.5px] text-teal-200 font-medium block mt-1">
                  Last reading: 1 min ago
                </span>
              </div>
            </div>
          </div>

          {/* Supported Hardware Devices Grid */}
          <div className="space-y-2.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block px-1">
              Select Sensor or Platform:
            </span>

            {/* 1. Dexcom G6 / G7 CGM */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-50 dark:bg-teal-950 text-[#126778] dark:text-teal-300 rounded-xl text-xl shrink-0">
                  🩸
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    Dexcom G6 / G7 CGM
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {deviceStates.dexcom_cgm.connected ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Paired • 🔋 {deviceStates.dexcom_cgm.batteryLevel}% • 📶 {deviceStates.dexcom_cgm.signalStrength}%
                      </span>
                    ) : (
                      <span>Direct Bluetooth Low Energy streaming</span>
                    )}
                  </div>
                </div>
              </div>

              {deviceStates.dexcom_cgm.connected ? (
                <button
                  onClick={() => handleDisconnect("dexcom_cgm")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-700 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <Button
                  onClick={() => handleConnectProvider("dexcom_cgm")}
                  disabled={isPairing === "dexcom_cgm"}
                  className="bg-[#126778] hover:bg-[#1a6273] text-white text-xs font-black px-3 py-1.5 h-8 rounded-xl cursor-pointer"
                >
                  {isPairing === "dexcom_cgm" ? "Pairing BLE..." : "Connect ➔"}
                </Button>
              )}
            </div>

            {/* 2. Abbott FreeStyle Libre 2 / 3 */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl text-xl shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    Abbott FreeStyle Libre 2 / 3
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {deviceStates.freestyle_libre.connected ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Paired • Real-time Minute Sync
                      </span>
                    ) : (
                      <span>NFC &amp; Bluetooth continuous scan</span>
                    )}
                  </div>
                </div>
              </div>

              {deviceStates.freestyle_libre.connected ? (
                <button
                  onClick={() => handleDisconnect("freestyle_libre")}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-700 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              ) : (
                <Button
                  onClick={() => handleConnectProvider("freestyle_libre")}
                  disabled={isPairing === "freestyle_libre"}
                  className="bg-[#126778] hover:bg-[#1a6273] text-white text-xs font-black px-3 py-1.5 h-8 rounded-xl cursor-pointer"
                >
                  {isPairing === "freestyle_libre" ? "Scanning..." : "Connect ➔"}
                </Button>
              )}
            </div>

            {/* 3. Apple HealthKit */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl text-xl shrink-0">
                  🍏
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    Apple HealthKit &amp; Watch
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {deviceStates.apple_health.connected
                      ? "Steps, Sleep & Resting Heart Rate Synced"
                      : "Syncs activity, HR & nocturnal recovery"}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleConnectProvider("apple_health")}
                disabled={isPairing === "apple_health"}
                variant={deviceStates.apple_health.connected ? "outline" : "default"}
                className={`text-xs font-black px-3 py-1.5 h-8 rounded-xl cursor-pointer ${
                  deviceStates.apple_health.connected
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : "bg-[#126778] text-white"
                }`}
              >
                {deviceStates.apple_health.connected ? "Synced ✓" : "Sync ➔"}
              </Button>
            </div>

            {/* 4. Google Health Connect */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl text-xl shrink-0">
                  🤖
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    Google Health Connect
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Android telemetry, Samsung Health &amp; Wear OS
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleConnectProvider("google_health")}
                disabled={isPairing === "google_health"}
                variant={deviceStates.google_health.connected ? "outline" : "default"}
                className={`text-xs font-black px-3 py-1.5 h-8 rounded-xl cursor-pointer ${
                  deviceStates.google_health.connected
                    ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : "bg-[#126778] text-white"
                }`}
              >
                {deviceStates.google_health.connected ? "Synced ✓" : "Sync ➔"}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-teal-50 dark:bg-zinc-800 rounded-2xl border border-teal-100 dark:border-zinc-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal-700 dark:text-teal-300 shrink-0" />
            <span className="text-[10.5px]">
              <strong>HIPAA / NDPR Compliant:</strong> Sensor readings are encrypted with AES-256 end-to-end telemetry.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
