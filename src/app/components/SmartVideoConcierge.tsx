import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Camera,
  MessageCircle,
  FileText,
  ChefHat,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { triggerHaptic } from "../utils/celebration";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

interface SmartVideoConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
  onOpenWhatsApp?: () => void;
}

export default function SmartVideoConcierge({
  isOpen,
  onClose,
  onOpenScanner,
  onOpenWhatsApp,
}: SmartVideoConciergeProps) {
  const navigate = useNavigate();
  const { profile } = useUser();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "pcm" | "yo" | "ig" | "ha" | "fr">("en");
  const videoRef = useRef<HTMLVideoElement>(null);

  const subtitles: Record<string, string> = {
    en: `Welcome to MealOptimiza! I'm Nurse Amina, your personal metabolic guide. Whether you're tracking blood sugar, blood pressure, or enjoying cultural African meals, I'm here to ensure you eat well without giving up your favorite foods. Tap an option below to get started!`,
    pcm: `Welcome to MealOptimiza! I be Nurse Amina, your health guide. Whether you dey check blood sugar, BP, or enjoy better African food, I dey here to help you chop well and stay strong. Choose wetin you wan do below!`,
    yo: `Ẹ kú àbọ̀ sí MealOptimiza! Èmi ni Nurse Amina, atọ́nisọ́nà ìlera yín. Bóyá ẹ fẹ́ ṣàyẹ̀wò ìwọ̀n ṣúgà, ẹ̀jẹ̀ ríru, tàbí gbádùn oúnjẹ ilẹ̀ Áfíríkà, mo wà níhìn-ín láti ràn yín lọ́wọ́.`,
    ig: `Nnọọ na MealOptimiza! Abụ m Nọọsụ Amina, onye ndu ahụike gị. Ma ị na-elele shuga dị n'ọbara, ọbara mgbali elu, ma ọ bụ rie nri ọdịnala Africa, anọ m ebe a iji nyere gị aka.`,
    ha: `Barka da zuwa MealOptimiza! Ni ce Nurse Amina, jagorar lafiyar ku. Ko kuna duba sukarin jini, hawan jini, ko jin daɗin abincin gargajiya na Afirka, ina nan don taimaka muku.`,
    fr: `Bienvenue sur MealOptimiza ! Je suis l'infirmière Amina, votre guide métabolique. Que vous surveilliez votre glycémie, votre tension ou savouriez des plats africains, je suis là pour vous aider !`,
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    triggerHaptic("light");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-teal-100 shadow-2xl z-50 bg-white">
        <DialogTitle className="sr-only">Nurse Amina AI Concierge</DialogTitle>
        <DialogDescription className="sr-only">Interactive patient guide for MealOptimiza</DialogDescription>

        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#1f7a8c] to-[#0d9488] px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="text-xl">👩🏾‍⚕️</span>
              <span className="absolute bottom-0 right-0 h-2 w-2 bg-emerald-400 rounded-full" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                <span>Nurse Amina</span>
                <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.2 rounded-full">
                  Clinical AI Concierge
                </span>
              </h3>
              <p className="text-[10px] text-teal-100">MealOptimiza Patient Guide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Video Player & Avatar Display */}
        <div className="relative bg-slate-950 aspect-video w-full overflow-hidden flex items-center justify-center group">
          {/* Animated Concierge Graphic */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950/80 via-slate-900 to-teal-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1f7a8c] to-emerald-400 p-1 mb-1.5 shadow-lg animate-pulse">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl">
                👩🏾‍⚕️
              </div>
            </div>
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block mb-0.5">
              Live Video Consultation Guide
            </span>
            <p className="text-[11px] text-slate-300 max-w-xs font-medium">
              "Welcome {profile?.name || "to MealOptimiza"}! Let me show you how to protect your metabolic health."
            </p>
          </div>

          {/* Subtitle / CC Bar */}
          <div className="absolute bottom-10 left-3 right-3 bg-black/80 backdrop-blur-md text-emerald-300 text-[11px] font-medium p-2.5 rounded-xl border border-white/10 shadow-lg text-center leading-snug">
            {subtitles[selectedLanguage]}
          </div>

          {/* Video Controls Bar */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                onClick={toggleMute}
                className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>
            </div>

            {/* Language Selector Chips */}
            <div className="flex items-center gap-1">
              {[
                { id: "en", label: "EN" },
                { id: "pcm", label: "Pidgin" },
                { id: "yo", label: "Yor" },
                { id: "ig", label: "Igb" },
                { id: "ha", label: "Hau" },
                { id: "fr", label: "FR" },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedLanguage(lang.id as any);
                    triggerHaptic("light");
                  }}
                  className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                    selectedLanguage === lang.id
                      ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive 1-Tap Quick Actions */}
        <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">
            What would you like to do right now?
          </span>

          <button
            onClick={() => {
              onClose();
              if (onOpenScanner) onOpenScanner();
              else navigate("/scan");
            }}
            className="w-full bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-2xl p-3 text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 text-teal-800 rounded-xl group-hover:scale-105 transition-transform">
                <Camera size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Scan a Cultural Meal with Camera</div>
                <div className="text-[10px] text-slate-500">Instant AI macro, calorie &amp; glycemic spike analysis</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-teal-600" />
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenWhatsApp) onOpenWhatsApp();
              else navigate("/profile");
            }}
            className="w-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 rounded-2xl p-3 text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl group-hover:scale-105 transition-transform">
                <MessageCircle size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Connect WhatsApp AI Food Bot</div>
                <div className="text-[10px] text-slate-500">Snap meal photos on WhatsApp for auto-logging</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-600" />
          </button>

          <button
            onClick={() => {
              onClose();
              navigate("/health-report");
            }}
            className="w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-2xl p-3 text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-800 rounded-xl group-hover:scale-105 transition-transform">
                <FileText size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Download 14-Day Doctor Visit PDF</div>
                <div className="text-[10px] text-slate-500">Certified report with eA1c curves &amp; DASH sodium load</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={() => {
              onClose();
              navigate("/recipes");
            }}
            className="w-full bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 rounded-2xl p-3 text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-105 transition-transform">
                <ChefHat size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Explore African Low-Spike Recipes</div>
                <div className="text-[10px] text-slate-500">40+ authentic dishes with satiety &amp; budget ratings</div>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 group-hover:text-amber-600" />
          </button>
        </div>

        {/* Bottom Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldCheck size={13} className="text-teal-600" />
            <span>Encrypted Patient Concierge</span>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#1f7a8c] hover:underline cursor-pointer"
          >
            Got it, close guide
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
