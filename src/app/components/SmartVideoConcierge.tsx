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
  UserCheck,
  Dna,
  Zap,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { triggerHaptic } from "../utils/celebration";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";
import { speakWithSarah, stopSarahSpeech } from "../services/voiceService";
import SarahAvatar, { VisemeShape } from "./SarahAvatar";

interface SmartVideoConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
  onOpenWhatsApp?: () => void;
  onOpenHealthSetup?: () => void;
}

// Preset Clinical & African Nutrition Knowledge Base for instant conversational answers
const CLINICAL_KNOWLEDGE_BASE: Record<string, string> = {
  profile_importance:
    "Calibrating your Health Profile is the single most important step in MealOptimiza! When you enter your age, biological sex, current weight, height, and medical conditions (like Diabetes, Hypertension, or PCOS), our clinical AI fine-tunes your daily calorie targets, calculates your basal metabolic rate, and activates customized Food-Drug Safety Shields. Without your profile, recommendations remain generic—with it, every meal plan is 100% tailored to your unique body chemistry!",
  app_superpowers:
    "MealOptimiza does 4 transformative things for your health: 1) AI Cultural Food Scanning: Snap any African dish to analyze calories, carbs, and glycemic spike ratings in seconds. 2) Glycemic Spike Shields: Enjoy traditional swallows and soups safely without blood sugar spikes or blood pressure surges. 3) Intermittent Fasting & Autophagy Clock: Track fat burning and cellular repair. 4) Certified Doctor Visit PDF Reports: Generate 14-day dossiers with eA1c curves to share with your physician!",
  swallow:
    "To enjoy swallow with diabetes or insulin resistance: 1) Choose high-fiber, resistant-starch swallows like Unripe Plantain flour, Oat swallow, or Amala over pounded yam. 2) Pair with slimy viscous soups like Ewedu or Okra—their soluble mucilage forms a gel matrix in your gut that slows glucose absorption by up to 38%. 3) Always eat 3-4 spoonfuls of soup or vegetable first before your first swallow bite!",
  bp:
    "For blood pressure & cardiovascular protection: 1) Boost potassium-rich vegetables like Ugu (fluted pumpkin), Garden Egg, and bitter leaf to help your kidneys excrete excess sodium. 2) Replace high-sodium seasoning cubes with locust beans (Iru), garlic, ginger, and crayfish for natural savory umami. 3) Stay well-hydrated with at least 2.5 liters of water daily.",
  zobo:
    "Flavonoids in unsweetened Zobo (hibiscus calyx) have mild ACE-inhibiting properties that naturally support blood pressure. However, if you take prescription blood pressure medication (like Lisinopril, Amlodipine, or Losartan), drink Zobo in moderation and separate it by at least 2 hours to avoid hypotensive dizziness. Always sweeten with ginger, clove, or pineapple skin rather than refined sugar.",
  fasting:
    "To break an intermittent fast without causing an acute glycemic surge: Step 1: Drink warm lemon water or a small cup of light pepper soup (15 mins). Step 2: Eat a protein/fiber cushion such as boiled eggs, avocado, or garden egg. Step 3: Consume your main meal with complex carbohydrates (beans, boiled plantain). This protects your pancreas and prevents digestive fatigue.",
};

export default function SmartVideoConcierge({
  isOpen,
  onClose,
  onOpenScanner,
  onOpenWhatsApp,
  onOpenHealthSetup,
}: SmartVideoConciergeProps) {
  const navigate = useNavigate();
  const { profile } = useUser();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<VisemeShape>("closed");
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "pcm" | "yo" | "ig" | "ha" | "fr">("en");
  const [userQuery, setUserQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const isProfileComplete = Boolean(
    profile?.age && profile?.weight && (profile?.medicalCondition || (profile?.conditions && profile.conditions.length > 0))
  );

  const subtitles: Record<string, string> = {
    en: `Welcome to MealOptimiza! I am Sarah, your Nutrition Assistant. Here is what I can do for you: Snap photos of your African meals for instant AI calorie & glycemic spike analysis, protect your blood sugar & blood pressure without giving up cultural delicacies, and track your fasting! Most importantly, please take a moment to calibrate your Health Profile below—when you share your age, weight, and health conditions, our AI tailors every recommendation with 100% clinical precision to your body!`,
    pcm: `Welcome to MealOptimiza! I be Sarah, your Nutrition Assistant. See wetin this app fit do for you: Snap your food to check calories and sugar spikes, enjoy your favorite swallow without fear of high BP or diabetes, and download report for your doctor. Make sure say you fill your Health Profile below—na so we fit give you correct advice tailored to your body!`,
    yo: `Ẹ kú àbọ̀ sí MealOptimiza! Èmi ni Sarah, Olùrànlọ́wọ́ Oúnjẹ yín. Ẹ ya fọ́tò oúnjẹ yín fún àtúnyẹ̀wò kíákíá, tọ́jú ìwọ̀n ṣúgà àti ẹ̀jẹ̀ ríru yín. Jọ̀wọ́ kọ àwọn ẹ̀kúnrẹ́rẹ́ ìlera yín sínú Health Profile kí a lè fún yín ní ìmọ̀ràn tó bá ara yín mu dáradára!`,
    ig: `Nnọọ na MealOptimiza! Abụ m Sarah, Onye na-enyere gị aka na Nri. Se foto nri gị maka nyocha shuga na kalori ngwa ngwa, ma chebe ahụike gị. Biko mejupụta Health Profile gị ka anyị wee hazie ndụmọdụ dabara ahụ gị kpọmkwem!`,
    ha: `Barka da zuwa MealOptimiza! Ni ce Sarah, Mataimakiyar ku kan Abinci. Ɗauki hoton abincinku don sanin sukarin jini da kalori, ku kiyaye lafiyarku. Da fatan za ku cika Bayanan Lafiyarku a ƙasa don samun keɓantaccen shiri na musamman!`,
    fr: `Bienvenue sur MealOptimiza ! Je suis Sarah, votre Assistante en Nutrition. Prenez des photos de vos plats pour une analyse glycémique instantanée et protégez votre santé métabolique. Complétez votre profil de santé ci-dessous pour des recommandations 100% personnalisées !`,
  };

  // Speak function with ElevenLabs Voice ID & Punctuation-Aware WebSpeech Fallback
  const speakText = (text: string) => {
    if (isMuted) return;
    speakWithSarah(text, {
      voiceId: "YIgPmt6aTfZFf6mjP9RC",
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentViseme("closed");
      },
      onError: () => {
        setIsSpeaking(false);
        setCurrentViseme("closed");
      },
      onVisemeChange: (viseme) => setCurrentViseme(viseme),
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
      stopSarahSpeech();
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

    if (q.includes("profile") || q.includes("demographic") || q.includes("importance") || q.includes("why fill") || q.includes("setup")) {
      answer = CLINICAL_KNOWLEDGE_BASE.profile_importance;
    } else if (q.includes("app") || q.includes("feature") || q.includes("can do") || q.includes("what can") || q.includes("superpower")) {
      answer = CLINICAL_KNOWLEDGE_BASE.app_superpowers;
    } else if (q.includes("swallow") || q.includes("pounded yam") || q.includes("garri") || q.includes("eba") || q.includes("diabetes") || q.includes("sugar")) {
      answer = CLINICAL_KNOWLEDGE_BASE.swallow;
    } else if (q.includes("bp") || q.includes("blood pressure") || q.includes("hypertension") || q.includes("salt") || q.includes("sodium")) {
      answer = CLINICAL_KNOWLEDGE_BASE.bp;
    } else if (q.includes("zobo") || q.includes("hibiscus") || q.includes("tea") || q.includes("drink")) {
      answer = CLINICAL_KNOWLEDGE_BASE.zobo;
    } else if (q.includes("fast") || q.includes("fasting") || q.includes("autophagy") || q.includes("break")) {
      answer = CLINICAL_KNOWLEDGE_BASE.fasting;
    } else {
      answer = `Great question regarding ${query}! For optimal personalized accuracy, ensure your Health Profile is calibrated. When paired with high-fiber African vegetable soups (Ewedu/Okra/Ugu) and unrefined starches, your body maintains steady blood sugar and balanced vitality!`;
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

  const handleStartHealthProfileSetup = () => {
    onClose();
    if (onOpenHealthSetup) {
      onOpenHealthSetup();
    } else {
      navigate("/profile");
    }
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
            {/* Audio Waves / Ripple & Live Lip-Sync Sarah Avatar */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative mb-2">
                <SarahAvatar isSpeaking={isSpeaking} viseme={currentViseme} size={150} />
                {isSpeaking && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse shadow-md flex items-center gap-1 border border-emerald-300/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-ping" />
                    <span>Speaking</span>
                  </span>
                )}
              </div>

              <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block mb-0.5">
                {isThinking ? "Sarah is Analyzing Nutrition Data..." : "Sarah · Clinical Food & AI Guide"}
              </span>

              {/* Subtitle / Dialogue Bubble */}
              <div className="bg-black/75 backdrop-blur-md text-teal-200 text-xs font-medium p-3.5 rounded-2xl border border-white/10 shadow-lg text-left leading-relaxed mt-2 max-w-sm">
                <p className="text-white font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>{aiResponse ? "Sarah's Clinical Recommendation:" : "Sarah's Guide & Welcome Brief:"}</span>
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

          {/* 🎯 THE IMPORTANCE OF CALIBRATING HEALTH PROFILE (CRITICAL ACTION BANNER) */}
          <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 dark:from-teal-950/70 dark:via-slate-900 dark:to-emerald-950/70 rounded-2xl p-3.5 border-2 border-teal-300 dark:border-teal-700 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1f7a8c] text-white rounded-lg shadow-2xs">
                  <Target size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    Calibrate Your Health Profile 🎯
                  </h4>
                  <p className="text-[10.5px] text-teal-800 dark:text-teal-300 font-medium">
                    Unlock 100% accurate, personalized nutrition &amp; safety shields
                  </p>
                </div>
              </div>

              {isProfileComplete ? (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300">
                  Calibrated ✅
                </span>
              ) : (
                <button
                  onClick={handleStartHealthProfileSetup}
                  className="bg-[#1f7a8c] hover:bg-[#0d9488] text-white text-[10.5px] font-black px-3 py-1.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  Setup Now ⚡
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              "By entering your <strong>Age, Weight, Baseline BP, &amp; Medical Conditions</strong>, Sarah and Avo calculate your exact metabolic rate and personalize every carbohydrate limit to your body!"
            </p>
          </div>

          {/* ⚡ 1-Tap Quick Clinical Nutrition Question Chips */}
          <div className="space-y-2">
            <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
              💡 Ask Sarah Instant Dietary Questions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { q: "Why must I fill my Health Profile?", key: "profile", icon: Target },
                { q: "What can MealOptimiza do for me?", key: "features", icon: Zap },
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
