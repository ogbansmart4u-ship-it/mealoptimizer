import React, { useState } from "react";
import { MessageSquare, Phone, Check, ExternalLink, Sparkles, Shield, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useUser } from "../contexts/UserContext";
import { updateUserProfile } from "../../lib/api";
import { toast } from "sonner";
import Mascot from "./Mascot";

interface WhatsAppConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppConnectDialog({ isOpen, onClose }: WhatsAppConnectDialogProps) {
  const { profile, updateProfile } = useUser();
  const [phoneNumber, setPhoneNumber] = useState((profile as any)?.phoneNumber || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean((profile as any)?.phoneNumber));

  const handleSavePhone = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your WhatsApp phone number");
      return;
    }

    // Format phone: remove spaces and dashes
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 9) {
      toast.error("Please enter a valid international phone number (e.g. +2348012345678)");
      return;
    }

    setIsSaving(true);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-3xl">
        <DialogHeader className="text-center">
          <div className="mx-auto p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400 w-fit mb-2">
            <MessageSquare className="h-7 w-7" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
            WhatsApp AI Food Logger
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Log your meals in 5 seconds by sending photos or voice notes directly to Avo on WhatsApp!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* How it works banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles size={14} /> How WhatsApp AI Logging Works:
            </div>
            <div className="space-y-1.5 text-zinc-700 dark:text-zinc-300 text-[11px]">
              <p>1. Snap a photo of your plate or text (e.g. <em>"Ate 1 cup Jollof & Grilled Fish"</em>).</p>
              <p>2. Gemini AI analyzes macros, calories, and glycemic spike risk.</p>
              <p>3. Instant confirmation reply on WhatsApp + automatic sync to your dashboard.</p>
            </div>
          </div>

          {/* Phone Number Input Form */}
          <div className="space-y-2">
            <Label htmlFor="wa-phone" className="font-bold text-zinc-800 dark:text-zinc-200">
              Your WhatsApp Phone Number (with Country Code)
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="wa-phone"
                type="tel"
                placeholder="+234 801 234 5678 or +44 7123 456789"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setIsSaved(false);
                }}
                className="pl-10 h-10 rounded-xl"
              />
            </div>
            <p className="text-[10px] text-zinc-400">
              Used solely to securely identify your account when you send meals via WhatsApp.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            {!isSaved ? (
              <Button
                onClick={handleSavePhone}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-bold"
              >
                {isSaving ? "Linking Number..." : "Link WhatsApp Number"}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" /> Number Linked: {phoneNumber}
                  </span>
                  <button
                    onClick={() => setIsSaved(false)}
                    className="text-[11px] text-emerald-700 underline"
                  >
                    Change
                  </button>
                </div>

                <a
                  href="https://wa.me/?text=Hi%20Avo!%20I%20am%20ready%20to%20log%20my%20meals%20on%20MealOptimizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl h-11 font-bold flex items-center justify-center gap-2 shadow-sm transition-all text-xs"
                >
                  <MessageSquare size={16} />
                  <span>Open WhatsApp & Start Chatting</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            <Button onClick={onClose} variant="ghost" className="w-full text-zinc-500 text-xs h-9">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
