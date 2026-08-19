import React, { useState } from "react";
import { Bell, BellRing, Sparkles, Check, Moon, Flame, HeartPulse, ShieldCheck, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestPushPermission,
  triggerLocalNotification,
  NotificationSchedule,
} from "../../lib/notifications";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";

interface NotificationSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsDialog({
  isOpen,
  onClose,
}: NotificationSettingsDialogProps) {
  const [prefs, setPrefs] = useState<NotificationSchedule>(getNotificationPreferences());
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );

  const toggleOption = (key: keyof NotificationSchedule) => {
    triggerHaptic("light");
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    saveNotificationPreferences(next);
  };

  const handleEnablePush = async () => {
    triggerHaptic("medium");
    const granted = await requestPushPermission();
    setPermissionGranted(granted);
    if (granted) {
      toast.success("Push notifications enabled!");
      triggerLocalNotification(
        "🥑 MealOptimizer Active",
        "Your metabolic alerts and pre-meal glucose shields are now primed!"
      );
    } else {
      toast.error("Notification permission was not granted");
    }
  };

  const handleSendTestNotification = () => {
    triggerHaptic("light");
    triggerLocalNotification(
      "🍲 Pre-Lunch Glucose Shield (11:45 AM)",
      "Remember to eat your vegetable soup (Ugu/Ewedu) FIRST before the swallow to block glucose spikes!"
    );
    toast.success("Test notification dispatched to your phone/screen!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-3xl">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-2xl text-[#1f7a8c] dark:text-teal-400">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Smart Metabolic Alerts 🔔
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Timed psychological reminders to protect your blood sugar & habits.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Permission status banner */}
        {!permissionGranted && (
          <div className="my-2 p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-amber-800 dark:text-amber-200">
              Enable browser push to receive alerts when app is closed.
            </span>
            <Button
              onClick={handleEnablePush}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold px-3 py-1.5 h-8 cursor-pointer flex-shrink-0"
            >
              Enable
            </Button>
          </div>
        )}

        {/* Notification options */}
        <div className="space-y-2.5 my-3">
          {[
            {
              key: "preMealShield" as const,
              title: "Pre-Lunch Fiber Shield (11:45 AM)",
              desc: "Tips to eat fiber/protein first to prevent 2 PM crashes",
              icon: Sun,
            },
            {
              key: "postMealEnergy" as const,
              title: "2-Hour Post-Meal Energy Ping (2:30 PM)",
              desc: "Quick check-in to detect hidden glucose spikes",
              icon: HeartPulse,
            },
            {
              key: "circadianCutoff" as const,
              title: "Circadian Fasting Cutoff (7:30 PM)",
              desc: "Gentle reminder to close kitchen for restorative sleep",
              icon: Moon,
            },
            {
              key: "streakGuardian" as const,
              title: "Streak Guardian (8:30 PM)",
              desc: "Avo's alert to log dinner before your streak resets",
              icon: Flame,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isChecked = prefs[item.key];

            return (
              <div
                key={item.key}
                onClick={() => toggleOption(item.key)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isChecked
                    ? "bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 block">{item.desc}</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                    isChecked
                      ? "bg-[#1f7a8c] border-[#1f7a8c] text-white"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {isChecked && <Check size={13} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Test button & close */}
        <div className="pt-2 flex gap-2">
          {permissionGranted && (
            <button
              onClick={handleSendTestNotification}
              className="flex-1 py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Test Notification 📲
            </button>
          )}

          <Button
            onClick={onClose}
            className="flex-1 bg-[#1f7a8c] hover:bg-[#185e6c] text-white rounded-2xl text-xs font-bold h-10 cursor-pointer"
          >
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
