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
  ShoppingCart,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { triggerHaptic } from "../utils/celebration";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";
import { speakWithSarah, stopSarahSpeech } from "../services/voiceService";
import SarahAvatar from "./SarahAvatar";

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
    "Filling in your Health Profile is super easy and helps MealOptimiza learn what you need! When you tell us your goals, age, or any health conditions, we customize your daily food tips so you can enjoy your favorite cultural dishes safely.",
  app_superpowers:
    "Here is how MealOptimiza helps you every day: First, you can snap a photo of any meal to check calories and easy tips. Second, you can find gentle swallow swaps that keep your blood sugar steady. Third, you get a clean market shopping list. And fourth, you can share a simple health summary with your doctor anytime!",
  grocery:
    "Our Smart Grocery List makes shopping easy! It sorts your ingredients by supermarket aisle so you can quickly pick up your fresh greens, fish, and swallows without forgetting anything.",
  swallow:
    "You do not have to give up swallow! Try delicious swaps like plantain flour, oat swallow, or amala. When you pair swallow with drawing soups like Okra or Ewedu, it helps your body digest sugar much more gently so you feel energized and full.",
  bp:
    "To keep your heart strong and blood pressure healthy: use tasty natural seasonings like locust beans (iru), garlic, ginger, and crayfish instead of lots of seasoning cubes, and drink plenty of water every day!",
  zobo:
    "Zobo tea is delicious and naturally helps relax your blood vessels! Brew it with ginger and cloves without adding white sugar. If you take blood pressure pills, drink it with meals to stay steady.",
  fasting:
    "When breaking a fast, start gentle! Drink a glass of water or light soup first, followed by boiled eggs or avocado before eating your main swallow or rice. This prevents stomach tiredness and keeps you feeling great.",
  sequencing:
    "Here is a simple kitchen trick: Eat a few spoons of your vegetable soup or fish first before your swallow or rice. It keeps your blood sugar super steady and stops the afternoon food coma!",
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
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.94); // 0.85 = Relaxed, 0.94 = Normal, 1.05 = Fast
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "pcm" | "yo" | "ig" | "ha" | "fr">("en");
  const [userQuery, setUserQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const silenceTimerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  const isProfileComplete = Boolean(
    profile?.age && profile?.weight && (profile?.medicalCondition || (profile?.conditions && profile.conditions.length > 0))
  );

  const subtitles: Record<string, string> = {
    en: `Welcome to MealOptimiza! I am Sarah, your friendly food companion. I'm here to help you enjoy delicious cultural meals while staying energized, healthy, and happy. You can snap photos of your plate, check easy meal swaps, and ask me anything about your favorite dishes!`,
    pcm: `Welcome to MealOptimiza! I be Sarah, your food companion. Snap your food to check calories, enjoy your favorite swallow without fear, and ask me any question about your food!`,
    yo: `Ẹ kú àbọ̀ sí MealOptimiza! Èmi ni Sarah, Olùrànlọ́wọ́ Oúnjẹ yín. Ẹ ya fọ́tò oúnjẹ yín fún àtúnyẹ̀wò kíákíá, tọ́jú ìwọ̀n ṣúgà àti ẹ̀jẹ̀ ríru yín. Jọ̀wọ́ kọ àwọn ẹ̀kúnrẹ́rẹ́ ìlera yín sínú Health Profile kí a lè fún yín ní ìmọ̀ràn tó bá ara yín mu dáradára!`,
    ig: `Nnọọ na MealOptimiza! Abụ m Sarah, Onye na-enyere gị aka na Nri. Se foto nri gị maka nyocha shuga na kalori ngwa ngwa, ma chebe ahụike gị. Biko mejupụta Health Profile gị ka anyị wee hazie ndụmọdụ dabara ahụ gị kpọmkwem!`,
    ha: `Barka da zuwa MealOptimiza! Ni ce Sarah, Mataimakiyar ku kan Abinci. Ɗauki hoton abincinku don sanin sukarin jini da kalori, ku kiyaye lafiyarku. Da fatan za ku cika Bayanan Lafiyarku a ƙasa don samun keɓantaccen shiri na musamman!`,
    fr: `Bienvenue sur MealOptimiza ! Je suis Sarah, votre Assistante en Nutrition. Prenez des photos de vos plats pour une analyse instantanée et découvrez notre liste de courses intelligente. Complétez votre profil de santé ci-dessous pour des recommandations personnalisées !`,
  };

  // Fluid Speech function with automatic start/stop and strict lip-sync trigger
  const speakText = (text: string) => {
    if (isMuted) return;
    speakWithSarah(text, {
      voiceId: "YIgPmt6aTfZFf6mjP9RC",
      rate: speechRate,
      pitch: 1.02,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Auto-speak on modal open or language change
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
  }, [isOpen, selectedLanguage, speechRate]);

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

  const handleReplaySpeech = () => {
    triggerHaptic("light");
    if (isMuted) setIsMuted(false);
    speakText(aiResponse || subtitles[selectedLanguage]);
  };

  const handleCycleSpeed = () => {
    triggerHaptic("light");
    let nextRate = 0.94;
    if (speechRate === 0.94) nextRate = 1.05;
    else if (speechRate === 1.05) nextRate = 0.85;
    else nextRate = 0.94;

    setSpeechRate(nextRate);
    toast.info(`Voice pace: ${nextRate === 0.85 ? "Relaxed (0.85x)" : nextRate === 1.05 ? "Brisk (1.05x)" : "Natural (0.94x)"}`);
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
    } else if (q.includes("market") || q.includes("grocery") || q.includes("shopping") || q.includes("aisle") || q.includes("store")) {
      answer = CLINICAL_KNOWLEDGE_BASE.grocery;
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
    } else if (q.includes("sequence") || q.includes("order") || q.includes("first") || q.includes("plate")) {
      answer = CLINICAL_KNOWLEDGE_BASE.sequencing;
    } else {
      answer = `That is a wonderful question regarding ${query}! For maximum personalized accuracy, make sure your Health Profile is calibrated. When paired with high-fiber African vegetable soups like Ewedu, Okra, or Ugu, your meals maintain balanced blood sugar and optimal vitality.`;
    }

    setTimeout(() => {
      setIsThinking(false);
      setAiResponse(answer);
      speakText(answer);
    }, 450);
  };

  // Voice Input (Microphone Speech-to-Text with Extended 60s Duration & 3s Silence Debounce)
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported on this browser.");
      return;
    }

    if (isListening) {
      // User tapped mic button to stop manually
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (userQuery.trim()) {
        handleAskQuestion(userQuery);
      }
      return;
    }

    triggerHaptic("medium");
    stopSarahSpeech();
    setIsSpeaking(false);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === "fr" ? "fr-FR" : "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let capturedText = "";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("🎙️ Listening... Speak your full question! (Tap mic when done)");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            capturedText += trans + " ";
          } else {
            interim += trans;
          }
        }
        const full = (capturedText + interim).trim();
        setUserQuery(full);

        // Adaptive Silence Debounce: Wait for 3.0 full seconds of silence before auto-answering
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (full.length > 2) {
            try { recognition.stop(); } catch {}
            setIsListening(false);
            handleAskQuestion(full);
          }
        }, 3000);
      };

      recognition.onerror = (event: any) => {
        console.warn("[VoiceAI] Speech recognition error:", event.error);
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();

      // Generous 60-second maximum speaking window
      setTimeout(() => {
        if (speechRecognitionRef.current && isListening) {
          try { speechRecognitionRef.current.stop(); } catch {}
        }
      }, 60000);
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
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
                <SarahAvatar isSpeaking={isSpeaking} size={150} />
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

              {/* Language Switcher & Voice Controls Bar */}
              <div className="flex flex-col items-center gap-2 mt-3 w-full">
                {/* Language Switcher Bar */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
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

                {/* Micro Voice Tuning Pill (Replay, Pace & Mute) */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[10.5px]">
                  <button
                    type="button"
                    onClick={handleReplaySpeech}
                    className="text-teal-200 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    title="Replay Sarah's voice"
                  >
                    <RotateCcw size={11} />
                    <span>Replay</span>
                  </button>

                  <span className="text-white/30">•</span>

                  <button
                    type="button"
                    onClick={handleCycleSpeed}
                    className="text-amber-300 hover:text-amber-200 font-black flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    title="Change voice reading pace"
                  >
                    <span>Pace: {speechRate === 0.85 ? "0.85x Relaxed" : speechRate === 1.05 ? "1.05x Brisk" : "0.94x Natural"}</span>
                  </button>

                  <span className="text-white/30">•</span>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-teal-200 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                  >
                    {isMuted ? <VolumeX size={11} className="text-rose-300" /> : <Volume2 size={11} className="text-emerald-300" />}
                    <span>{isMuted ? "Unmute" : "Mute"}</span>
                  </button>
                </div>
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
                { q: "How does Smart Market Grocery List work?", key: "grocery", icon: ShoppingCart },
                { q: "How to eat Swallow with Diabetes?", key: "swallow", icon: Activity },
                { q: "Best Soups for High Blood Pressure?", key: "bp", icon: HeartPulse },
                { q: "What is Food Sequencing order?", key: "sequencing", icon: BookOpen },
                { q: "Can I drink Zobo with BP medicine?", key: "zobo", icon: Sparkles },
                { q: "Breaking Fasting without Sugar Spikes?", key: "fasting", icon: Flame },
                { q: "What can MealOptimiza do for me?", key: "features", icon: Zap },
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
