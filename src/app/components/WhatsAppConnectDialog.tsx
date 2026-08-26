import React, { useState } from "react";
import { MessageSquare, Phone, Check, ExternalLink, Sparkles, Shield, ArrowRight, X, Send, Bot } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useUser } from "../contexts/UserContext";
import { updateUserProfile } from "../../lib/api";
import { toast } from "sonner";
import { launchWhatsAppFoodBot, getWhatsAppUrl } from "../../lib/whatsapp";
import { triggerHaptic } from "../utils/celebration";

interface WhatsAppConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppConnectDialog({ isOpen, onClose }: WhatsAppConnectDialogProps) {
  const { profile, updateProfile } = useUser();
  const [phoneNumber, setPhoneNumber] = useState((profile as any)?.phoneNumber || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean((profile as any)?.phoneNumber));

  const quickPrompts = [
    { label: "📸 Log Jollof & Salad", text: "Hi Sarah! I just had 1 plate of Jollof rice with grilled fish and salad. Please log my macros and blood sugar score 🍲" },
    { label: "🥣 Log Swallow & Ewedu", text: "Hi Sarah! I ate Oat swallow with viscous Ewedu soup and goat meat. How is my glucose spike buffer? 🥣" },
    { label: "💧 Log 1.5L Zobo Drink", text: "Hi Sarah! Logged 1.5 Liters of unsweetened Zobo water for my blood pressure shield today 💧" },
  ];

  const handleSavePhone = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your WhatsApp phone number");
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 9) {
      toast.error("Please enter a valid international phone number (e.g. +2348012345678)");
      return;
    }

    setIsSaving(true);
    triggerHaptic("medium");
    try {
      await updateUserProfile({
        phoneNumber: cleanPhone,
      });
      updateProfile({
        ...(profile as any),
        phoneNumber: cleanPhone,
      });
      setIsSaved(true);
      toast.success("WhatsApp number linked successfully!");
    } catch (err) {
      toast.error("Failed to link WhatsApp number");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLaunchPrompt = (text: string) => {
    triggerHaptic("light");
    launchWhatsAppFoodBot(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-3xl bg-slate-950 text-white border border-emerald-500/30">
        <DialogHeader className="text-center">
          <div className="mx-auto p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 w-fit mb-2 border border-emerald-500/30">
            <MessageSquare className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-white">
            WhatsApp AI Nutrition Assistant
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300">
            Log your meals in 5 seconds by sending photos or voice notes directly to Sarah on WhatsApp!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* How it works banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <Sparkles size={14} /> How WhatsApp AI Logging Works:
            </div>
            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <p>1. Snap a plate photo or voice note (e.g. <em>"Ate 1 wrap Amala & Ewedu"</em>).</p>
              <p>2. Gemini Vision AI calculates calories, carbs &amp; glycemic spike risk.</p>
              <p>3. Instant Sarah reply with African swaps + automatic dashboard sync.</p>
            </div>
          </div>

          {/* Quick 1-Tap Message Prompts */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-black uppercase text-emerald-400 tracking-wider">
              1-Tap Quick Bot Starters:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLaunchPrompt(p.text)}
                  className="w-full text-left p-2.5 bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-[11px] font-medium text-slate-200 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <span>{p.label}</span>
                  <Send size={12} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Phone Number Input Form */}
          <div className="space-y-2">
            <Label htmlFor="wa-phone" className="font-bold text-slate-200">
              Your WhatsApp Phone Number (with Country Code)
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="wa-phone"
                type="tel"
                placeholder="+234 801 234 5678 or +44 7123 456789"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setIsSaved(false);
                }}
                className="pl-10 h-10 rounded-xl bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Used to link WhatsApp meal logs to your private MealOptimiza profile.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            {!isSaved ? (
              <Button
                onClick={handleSavePhone}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-bold cursor-pointer"
              >
                {isSaving ? "Linking Number..." : "Link WhatsApp Number"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-400" /> Linked: {phoneNumber}
                  </span>
                  <button
                    onClick={() => setIsSaved(false)}
                    className="text-[11px] text-emerald-400 underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <button
                  onClick={() => launchWhatsAppFoodBot()}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 rounded-xl h-11 font-black flex items-center justify-center gap-2 shadow-lg transition-all text-xs cursor-pointer active:scale-98"
                >
                  <MessageSquare size={16} />
                  <span>Open WhatsApp &amp; Chat with Sarah</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            )}

            <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs h-9">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
