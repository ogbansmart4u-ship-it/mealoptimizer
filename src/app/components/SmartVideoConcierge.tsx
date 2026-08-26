import React, { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Send,
  Mic,
  MicOff,
  RotateCcw,
  Bot,
  HelpCircle,
  Activity,
  HeartPulse,
  Flame,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { triggerHaptic } from "../utils/celebration";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";

interface SmartVideoConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
  onOpenWhatsApp?: () => void;
}

// Preset Clinical & African Nutrition Knowledge Base for instant conversational answers
const CLINICAL_KNOWLEDGE_BASE: Record<string, string> = {
  swallow:
    "To enjoy swallow with diabetes or insulin resistance: 1) Choose high-fiber, resistant-starch swallows like Unripe Plantain flour, Oat swallow, or Amala over pounded yam. 2) Pair with slimy viscous soups like Ewedu or Okra—their soluble mucilage forms a gel matrix in your gut that slows glucose absorption by up to 38%. 3) Always eat 3-4 spoonfuls of soup or vegetable first before your first swallow bite!",
  bp:
    "For blood pressure & cardiovascular protection: 1) Boost potassium-rich vegetables like Ugu (fluted pumpkin), Garden Egg, and bitter leaf to help your kidneys excrete excess sodium. 2) Replace high-sodium seasoning cubes with locust beans (Iru), garlic, ginger, and crayfish for natural savory umami. 3) Stay well-hydrated with at least 2.5 liters of water daily.",
  zobo:
    "Flavonoids in unsweetened Zobo (hibiscus calyx) have mild ACE-inhibiting properties that naturally support blood pressure. However, if you take prescription blood pressure medication (like Lisinopril, Amlodipine, or Losartan), drink Zobo in moderation and separate it by at least 2 hours to avoid hypotensive dizziness. Always sweeten with ginger, clove, or pineapple skin rather than refined sugar.",
  fasting:
    "To break an intermittent fast without causing an acute glycemic surge: Step 1: Drink warm lemon water or a small cup of light pepper soup (15 mins). Step 2: Eat a protein/fiber cushion such as boiled eggs, avocado, or garden egg. Step 3: Consume your main meal with complex carbohydrates (beans, boiled plantain). This protects your pancreas and prevents digestive fatigue.",
  cholesterol:
    "Egusi (melon seed) is rich in healthy polyunsaturated fats and plant phytosterols that actually support heart health! The key is preparation: avoid bleaching the palm oil (which generates oxidized trans-fats), add plenty of chopped bitter leaf or spinach, and pair with lean fish or chicken instead of fatty red meat.",
};

const DEFAULT_INTRO_SPEECH =
  "Welcome to MealOptimiza! I am Sarah, your Nutrition Assistant. Whether you're managing blood sugar, blood pressure, or enjoying delicious African meals, I'm here to ensure you eat well without giving up your favorite foods. You can ask me any nutrition question or tap an option below!";

import { speakWithSarah, stopSarahSpeech } from "../services/voiceService";

export default function SmartVideoConcierge({
  isOpen,
  onClose,
  onOpenScanner,
  onOpenWhatsApp,
}: SmartVideoConciergeProps) {
  const navigate = useNavigate();
  const { profile } = useUser();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "pcm" | "yo" | "ig" | "ha" | "fr">("en");
  const [userQuery, setUserQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const subtitles: Record<string, string> = {
    en: `Welcome to MealOptimiza! I am Sarah, your Nutrition Assistant. Whether you're tracking blood sugar, blood pressure, or enjoying authentic African meals, I'm here to ensure you eat well without giving up your favorite foods. Ask me any nutrition question or tap below!`,
    pcm: `Welcome to MealOptimiza! I be Sarah, your Nutrition Assistant. Whether you dey check blood sugar, BP, or enjoy better African food, I dey here to help you chop well and stay strong. Ask me any question or choose below!`,
    yo: `Ẹ kú àbọ̀ sí MealOptimiza! Èmi ni Sarah, Olùrànlọ́wọ́ Oúnjẹ yín. Bóyá ẹ fẹ́ ṣàyẹ̀wò ìwọ̀n ṣúgà, ẹ̀jẹ̀ ríru, tàbí gbádùn oúnjẹ ilẹ̀ Áfíríkà, mo wà níhìn-ín láti ràn yín lọ́wog!`,
    ig: `Nnọọ na MealOptimiza! Abụ m Sarah, Onye na-enyere gị aka na Nri na-edozi ahụ. Ma ị na-elele shuga dị n'ọbara, ọbara mgbali elu, ma ọ bụ rie nri ọdịnala Africa, anọ m ebe a iji nyere gị aka.`,
    ha: `Barka da zuwa MealOptimiza! Ni ce Sarah, Mataimakiyar ku kan Abinci. Ko kuna duba sukarin jini, hawan jini, ko jin daɗin abincin gargajiya na Afirka, ina nan don taimaka muku.`,
    fr: `Bienvenue sur MealOptimiza ! Je suis Sarah, votre Assistante en Nutrition. Que vous surveilliez votre glycémie, votre tension ou savouriez des plats africains, je suis là pour vous aider !`,
  };

  // Speak function with ElevenLabs Voice ID & WebSpeech Fallback
  const speakText = (text: string) => {
    if (isMuted) return;
    speakWithSarah(text, {
      voiceId: "YIgPmt6aTfZFf6mjP9RC",
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Auto-speak on modal open
  useEffect(() => {
    if (isOpen) {
      setAiResponse(null);
      speakText(subtitles[selectedLanguage]);
    } else {
      stopSarahSpeech();
      setIsSpeaking(false);
    }
    return () => {
      stopSarahSpeech();
    };
  }, [isOpen, selectedLanguage]);

  const toggleMute = () => {
    triggerHaptic("light");
    if (!isMuted) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      speakText(aiResponse || subtitles[selectedLanguage]);
    }
  };

  const handleAskQuestion = (query: string) => {
    if (!query.trim()) return;
    triggerHaptic("medium");
    setIsThinking(true);
    setUserQuery("");

    const q = query.toLowerCase();
    let answer = "";

    if (q.includes("swallow") || q.includes("pounded yam") || q.includes("garri") || q.includes("eba") || q.includes("diabetes") || q.includes("sugar")) {
      answer = CLINICAL_KNOWLEDGE_BASE.swallow;
    } else if (q.includes("bp") || q.includes("blood pressure") || q.includes("hypertension") || q.includes("salt") || q.includes("sodium")) {
      answer = CLINICAL_KNOWLEDGE_BASE.bp;
    } else if (q.includes("zobo") || q.includes("hibiscus") || q.includes("tea") || q.includes("drink")) {
      answer = CLINICAL_KNOWLEDGE_BASE.zobo;
    } else if (q.includes("fast") || q.includes("fasting") || q.includes("autophagy") || q.includes("break")) {
      answer = CLINICAL_KNOWLEDGE_BASE.fasting;
    } else if (q.includes("egusi") || q.includes("cholesterol") || q.includes("oil") || q.includes("fat") || q.includes("soup")) {
      answer = CLINICAL_KNOWLEDGE_BASE.cholesterol;
    } else {
      answer = `Great question regarding ${query}! For optimal metabolic wellness on African dishes, pair every carbohydrate with fiber-rich leafy greens (Ewedu/Okra/Ugu) and lean protein. This blunts glucose spikes, supports healthy blood pressure, and keeps you energized!`;
    }

    setTimeout(() => {
      setIsThinking(false);
      setAiResponse(answer);
      speakText(answer);
    }, 450);
  };

  // Voice Input (Microphone Speech-to-Text)
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported on this browser.");
      return;
    }

    triggerHaptic("medium");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Ask Sarah your nutrition question!");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleAskQuestion(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Could not capture voice. Please type your question.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-teal-100 shadow-2xl z-50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
        <DialogTitle className="sr-only">Sarah The Nutrition Assistant</DialogTitle>
        <DialogDescription className="sr-only">Interactive nutrition and health guide for MealOptimiza</DialogDescription>

        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-xs">
                👩🏾‍💼
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${isSpeaking ? "bg-emerald-400 animate-ping" : "bg-emerald-400"}`} />
            </div>
            <div>
              <h3 className="font-black text-sm leading-tight flex items-center gap-1.5">
                <span>Sarah</span>
                <span className="text-[9.5px] font-black bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full shadow-2xs">
                  Nutrition Assistant
                </span>
              </h3>
              <p className="text-[10px] text-teal-100 font-medium">MealOptimiza Food &amp; Metabolic AI Guide</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
              title={isMuted ? "Unmute Sarah" : "Mute Voice"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className={isSpeaking ? "text-amber-300 animate-bounce" : ""} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Assistant Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Animated Speaking Stage / Waveform Stage */}
          <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 rounded-3xl p-5 border border-teal-500/20 text-center shadow-inner overflow-hidden">
            {/* Audio Waves / Ripple */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative mb-2">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-tr from-[#1f7a8c] to-emerald-400 p-1 shadow-lg flex items-center justify-center ${
                    isSpeaking ? "scale-105 ring-4 ring-emerald-400/40 animate-pulse" : ""
                  } transition-all duration-300`}
                >
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl">
                    👩🏾‍💼
                  </div>
                </div>
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-xs">
                    Speaking
                  </span>
                )}
              </div>

              <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block mb-0.5">
                {isThinking ? "Sarah is Analyzing Nutrition Data..." : "Sarah · Clinical Food Guide"}
              </span>

              {/* Subtitle / Dialogue Bubble */}
              <div className="bg-black/75 backdrop-blur-md text-teal-200 text-xs font-medium p-3.5 rounded-2xl border border-white/10 shadow-lg text-left leading-relaxed mt-2 max-w-sm">
                <p className="text-white font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>{aiResponse ? "Sarah's Clinical Recommendation:" : "Sarah's Welcome Brief:"}</span>
                </p>
                <p className="text-[11.5px] text-teal-100/90 leading-relaxed">
                  {aiResponse || subtitles[selectedLanguage]}
                </p>
              </div>

              {/* Language Switcher Bar */}
              <div className="flex items-center gap-1 mt-3 flex-wrap justify-center">
                {[
                  { id: "en", label: "EN" },
                  { id: "pcm", label: "Pidgin" },
                  { id: "yo", label: "Yoruba" },
                  { id: "ig", label: "Igbo" },
                  { id: "ha", label: "Hausa" },
                  { id: "fr", label: "French" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setSelectedLanguage(lang.id as any);
                      setAiResponse(null);
                      triggerHaptic("light");
                    }}
                    className={`text-[10px] font-bold px-2 py-0.8 rounded-lg cursor-pointer transition-all ${
                      selectedLanguage === lang.id
                        ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                        : "bg-white/15 hover:bg-white/25 text-white"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ⚡ 1-Tap Quick Clinical Nutrition Question Chips */}
          <div className="space-y-2">
            <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
              💡 Ask Sarah Instant Dietary Questions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { q: "How to eat Swallow with Diabetes?", key: "swallow", icon: Activity },
                { q: "Best Soups for High Blood Pressure?", key: "bp", icon: HeartPulse },
                { q: "Can I drink Zobo with BP medicine?", key: "zobo", icon: Sparkles },
                { q: "Breaking Fasting without Sugar Spikes?", key: "fasting", icon: Flame },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAskQuestion(item.q)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-left font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[#1f7a8c] dark:text-teal-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] truncate">{item.q}</span>
                    </div>
                    <ChevronRight size={12} className="text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 💬 Interactive Question Input Box (Voice + Text) */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
              💬 Or Ask Any Nutrition / Meal Question:
            </span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 shadow-2xs">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskQuestion(userQuery)}
                placeholder="e.g. Is Egusi soup healthy? Can I eat boiled yam?"
                className="flex-1 bg-transparent px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />

              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl text-white transition-all cursor-pointer ${
                  isListening ? "bg-red-500 animate-pulse" : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                }`}
                title="Speak to Sarah"
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>

              <button
                type="button"
                onClick={() => handleAskQuestion(userQuery)}
                disabled={!userQuery.trim()}
                className="p-2 bg-[#1f7a8c] hover:bg-[#0d9488] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* 🚀 Quick App Portal Shortcuts */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
              🚀 Sarah's Direct Health Portals:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenScanner) onOpenScanner();
                  else navigate("/scan");
                }}
                className="p-2.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer group"
              >
                <div className="p-1.5 bg-teal-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <Camera size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 dark:text-white">Meal Scanner</div>
                  <div className="text-[9.5px] text-slate-500">Scan food macros</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenWhatsApp) onOpenWhatsApp();
                  else navigate("/profile");
                }}
                className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer group"
              >
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <MessageCircle size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 dark:text-white">WhatsApp Bot</div>
                  <div className="text-[9.5px] text-slate-500">Auto-log photos</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate("/health-report");
                }}
                className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer group"
              >
                <div className="p-1.5 bg-blue-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <FileText size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 dark:text-white">Doctor PDF</div>
                  <div className="text-[9.5px] text-slate-500">Certified dossier</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate("/recipes");
                }}
                className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer group"
              >
                <div className="p-1.5 bg-amber-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <ChefHat size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 dark:text-white">African Recipes</div>
                  <div className="text-[9.5px] text-slate-500">40+ low-spike meals</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer Safeguards */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <ShieldCheck size={13} className="text-teal-600" />
            <span>NDPR &amp; HIPAA-Aligned Nutrition AI</span>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#1f7a8c] dark:text-teal-400 hover:underline cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
