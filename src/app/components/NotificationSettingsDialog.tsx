import React, { useState } from "react";
import {
  Bell,
  BellRing,
  Sparkles,
  Check,
  Moon,
  Flame,
  HeartPulse,
  ShieldCheck,
  Sun,
  Clock,
  MessageSquare,
  Phone,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestPushPermission,
  triggerLocalNotification,
  NotificationSchedule,
  METABOLIC_ALERTS,
} from "../../lib/notifications";
import { useUser } from "../contexts/UserContext";
import { updateUserProfile } from "../../lib/api";
import { toast } from "sonner";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

interface NotificationSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsDialog({
  isOpen,
  onClose,
}: NotificationSettingsDialogProps) {
  const { profile, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState<"webpush" | "whatsapp">("webpush");
  const [prefs, setPrefs] = useState<NotificationSchedule>(getNotificationPreferences());
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );

  // WhatsApp state
  const [phoneNumber, setPhoneNumber] = useState((profile as any)?.phoneNumber || "");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [isPhoneSaved, setIsPhoneSaved] = useState(Boolean((profile as any)?.phoneNumber));

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
      triggerConfetti("burst");
      toast.success("Web Push Notifications enabled! 🔔✨");
      triggerLocalNotification(
        "🥑 MealOptimizer Active",
        "Your metabolic alerts and pre-meal glucose shields are now primed and active!"
      );
    } else {
      toast.error("Notification permission was not granted");
    }
  };

  const handleSendTestNotification = () => {
    triggerHaptic("light");
    triggerLocalNotification(
      "🥗 Pre-Lunch Fiber Shield (11:45 AM)",
      "Remember to eat your vegetable soup (Ugu/Ewedu) FIRST before the swallow to block glucose spikes by up to 35%!"
    );
    toast.success("Test notification dispatched! Check your notification tray or toast 📲");
  };

  const handleSaveWhatsAppPhone = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your WhatsApp phone number");
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 9) {
      toast.error("Please enter a valid international phone number (e.g. +2348012345678)");
      return;
    }

    setIsSavingPhone(true);
    try {
      await updateUserProfile({
        phoneNumber: cleanPhone,
      });
      updateProfile({
        ...(profile as any),
        phoneNumber: cleanPhone,
      });
      setIsPhoneSaved(true);
      triggerConfetti("burst");
      toast.success("WhatsApp number linked successfully! 💬🎉");
    } catch (err) {
      toast.error("Failed to link WhatsApp number");
    } finally {
      setIsSavingPhone(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6 rounded-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-2xl text-[#1f7a8c] dark:text-teal-400">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                Alerts & WhatsApp Hub 🔔
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Timed metabolic shields, circadian alarms, and WhatsApp AI bot.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Dual Tab Switcher */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/70 p-1 rounded-2xl my-2 gap-1">
          <button
            onClick={() => {
              setActiveTab("webpush");
              triggerHaptic("light");
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "webpush"
                ? "bg-white dark:bg-zinc-900 text-teal-800 dark:text-teal-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Bell size={14} />
            <span>Web Push Alerts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("whatsapp");
              triggerHaptic("light");
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "whatsapp"
                ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <MessageSquare size={14} />
            <span>WhatsApp Bot</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: WEB PUSH & TIMED ALERTS                               */}
        {/* ============================================================ */}
        {activeTab === "webpush" && (
          <div className="space-y-3 py-1">
            {/* Permission banner */}
            {!permissionGranted ? (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-amber-800 dark:text-amber-200 text-[11px] leading-snug">
                  Enable browser notifications to receive alerts even when this tab is closed.
                </span>
                <Button
                  onClick={handleEnablePush}
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold px-3.5 py-1.5 h-8 cursor-pointer flex-shrink-0"
                >
                  Enable Push
                </Button>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Check size={14} className="text-emerald-600" />
                  Web Push is Active & Primed
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full font-mono">
                  LIVE
                </span>
              </div>
            )}

            {/* List of 6 Metabolic Alerts */}
            <div className="space-y-2.5">
              {METABOLIC_ALERTS.map((alert) => {
                const isChecked = prefs[alert.key];

                return (
                  <div
                    key={alert.key}
                    onClick={() => toggleOption(alert.key)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? "bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate">
                          {alert.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">
                        {alert.body}
                      </p>
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

            {/* Actions row */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={handleSendTestNotification}
                className="flex-1 py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Send Test Alert 📲
              </button>

              <Button
                onClick={onClose}
                className="flex-1 bg-[#1f7a8c] hover:bg-[#185e6c] text-white rounded-2xl text-xs font-bold h-10 cursor-pointer"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: WHATSAPP BOT & AI MEAL LOGGER                         */}
        {/* ============================================================ */}
        {activeTab === "whatsapp" && (
          <div className="space-y-4 py-1 text-xs">
            {/* WhatsApp Benefits Card */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles size={14} /> Zero-Friction WhatsApp AI Logging:
              </div>
              <div className="space-y-1.5 text-zinc-700 dark:text-zinc-300 text-[11px]">
                <p>📸 <strong>Snap a Plate:</strong> Send food photos directly to Avo on WhatsApp.</p>
                <p>🎙️ <strong>Voice Notes:</strong> Speak in English or Pidgin: <em>"Ate 1 wrap of Moi Moi and water"</em>.</p>
                <p>⚡ <strong>Instant Glycemic Advice:</strong> Receive macro breakdowns & blood sugar tips in seconds.</p>
              </div>
            </div>

            {/* Phone Number Input Form */}
            <div className="space-y-2">
              <Label htmlFor="wa-phone-hub" className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                Your WhatsApp Phone Number (International format)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="wa-phone-hub"
                  type="tel"
                  placeholder="+234 801 234 5678 or +44 7123 456789"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setIsPhoneSaved(false);
                  }}
                  className="pl-10 h-10 rounded-xl text-xs"
                />
              </div>
              <p className="text-[10px] text-zinc-400">
                Used to securely identify your account when you text meals to Avo.
              </p>
            </div>

            {/* Save / WhatsApp Launch Button */}
            <div className="pt-2 space-y-2">
              {!isPhoneSaved ? (
                <Button
                  onClick={handleSaveWhatsAppPhone}
                  disabled={isSavingPhone}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-10 font-bold text-xs cursor-pointer"
                >
                  {isSavingPhone ? "Linking Number..." : "Link WhatsApp Number"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Check size={14} className="text-emerald-600" /> Number Linked: {phoneNumber}
                    </span>
                    <button
                      onClick={() => setIsPhoneSaved(false)}
                      className="text-[11px] text-emerald-700 underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <a
                    href="https://wa.me/?text=Hi%20Avo!%20I%20am%20ready%20to%20log%20my%20meals%20on%20MealOptimizer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl h-11 font-bold flex items-center justify-center gap-2 shadow-md transition-all text-xs cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    <span>Open WhatsApp & Start Logging</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <Button onClick={onClose} variant="ghost" className="w-full text-zinc-500 text-xs h-9 cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
