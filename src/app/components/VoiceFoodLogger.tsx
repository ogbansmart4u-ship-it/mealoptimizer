import HandPortionGuide from "./HandPortionGuide";
import { speakWithSarah, stopSarahSpeech } from "../services/voiceService";
import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Check,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Flame,
  CheckCircle2,
  Shield,
  HelpCircle,
  Play,
  Pause,
  MessageSquare,
  ShieldCheck,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { createMealLog } from "../../lib/api";
import { useUser } from "../contexts/UserContext";
import Mascot from "./Mascot";

interface VoiceFoodLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onMealSaved?: (meal: any) => void;
}

export type AssistantVoiceState = "idle" | "listening" | "thinking" | "speaking" | "ready";

interface ParsedMealData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  glycemicLoad: "Low" | "Medium" | "High";
  clinicalNote: string;
  spokenResponse: string;
}

// 🥑 Siri-Grade Fluid Waveform Visualizer
const FluidAudioWaveform = ({ state }: { state: AssistantVoiceState }) => {
  if (state !== "listening" && state !== "speaking" && state !== "thinking") return null;

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 px-4 py-1.5 bg-slate-950/80 rounded-2xl border border-teal-500/30 backdrop-blur-md shadow-inner my-2">
      {[35, 75, 95, 55, 85, 100, 70, 90, 45, 80, 60, 40].map((heightPct, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            state === "listening"
              ? "bg-gradient-to-t from-rose-500 via-amber-400 to-emerald-400 animate-pulse"
              : state === "speaking"
              ? "bg-gradient-to-t from-teal-500 via-cyan-400 to-emerald-300 animate-bounce"
              : "bg-gradient-to-t from-amber-400 to-teal-400 opacity-60"
          }`}
          style={{
            height: `${Math.max(20, heightPct)}%`,
            animationDelay: `${(i * 0.07).toFixed(2)}s`,
            animationDuration: state === "listening" ? "0.55s" : "0.85s",
          }}
        />
      ))}
    </div>
  );
};

// Nigerian & Cultural Food Clinical Dictionary with Consumer-Friendly Responses
function parseSpokenMealText(rawText: string, userName: string = "Friend"): ParsedMealData {
  const text = rawText.toLowerCase().trim();
  let foodName = rawText;
  let calories = 450;
  let protein = 22;
  let carbs = 55;
  let fats = 14;
  let glycemicLoad: "Low" | "Medium" | "High" = "Medium";
  let clinicalNote = "Balanced meal with moderate carbohydrate density.";
  let spokenResponse = "";

  // 1. Swallows & Soups
  if (text.includes("amala") || text.includes("ewedu") || text.includes("gbegiri")) {
    foodName = "Amala with Ewedu, Gbegiri & Titus Fish";
    calories = 430;
    protein = 28;
    carbs = 50;
    fats = 12;
    glycemicLoad = "Low";
    clinicalNote = "Ewedu mucilage forms a natural soluble shield that slows glucose absorption.";
    spokenResponse = `Delicious choice, ${userName}! Amala with Ewedu has a Low Glycemic response because the soluble fiber shields your blood sugar. I've estimated 430 calories and 28 grams of protein. Ready to log this?`;
  } else if (text.includes("oat") && (text.includes("swallow") || text.includes("okra") || text.includes("soup"))) {
    foodName = "Oat & Psyllium Swallow with Fresh Okra Soup";
    calories = 380;
    protein = 26;
    carbs = 42;
    fats = 10;
    glycemicLoad = "Low";
    clinicalNote = "Oat beta-glucans reduce cholesterol while Okra blunts post-meal sugar peaks by up to 40%.";
    spokenResponse = `Outstanding, ${userName}! Oat swallow provides cholesterol-lowering beta-glucans, and the okra creates an ideal fiber barrier. Estimated 380 calories with 26 grams of protein. Shall I log it?`;
  } else if (text.includes("pounded yam") || text.includes("poundo")) {
    foodName = "Pounded Yam with Egusi & Goat Meat";
    calories = 610;
    protein = 32;
    carbs = 80;
    fats = 18;
    glycemicLoad = "High";
    clinicalNote = "Starch-dense meal. Pair with generous soup greens and enjoy a quick 10-minute walk to stay energized.";
    spokenResponse = `Got it, ${userName}! Pounded Yam is energy-dense with 610 calories and 80 grams of carbs. Be sure to enjoy plenty of the soup greens and take a quick 10-minute walk to avoid the 2 PM crash! Should I log this?`;
  } else if (text.includes("ogbono")) {
    foodName = "Ogbono Soup with Bitterleaf, Fish & Swallow";
    calories = 490;
    protein = 28;
    carbs = 58;
    fats = 16;
    glycemicLoad = "Low";
    clinicalNote = "Viscous wild mango seed (Irvingia) and bitterleaf extract support healthy insulin sensitivity.";
    spokenResponse = `Rich Ogbono soup! The natural seeds contain soluble fiber that buffers digestion and keeps hunger away for hours. 490 calories and 28g protein. Ready to save?`;
  } else if (text.includes("afang") || text.includes("edikang ikong")) {
    foodName = "Afang / Edikang Ikong Leaf Soup with Meat & Fish";
    calories = 440;
    protein = 32;
    carbs = 24;
    fats = 22;
    glycemicLoad = "Low";
    clinicalNote = "Dark leafy greens provide iron, magnesium, and dietary fiber for optimal glycemic stability.";
    spokenResponse = `Super healthy! Leafy Afang and Edikang Ikong soups are fantastic metabolic boosters with virtually no sugar spike. 440 calories and 32g protein! Shall I record it?`;
  } else if (text.includes("nsala") || text.includes("white soup")) {
    foodName = "Ofe Nsala (White Soup with Fresh Catfish)";
    calories = 360;
    protein = 34;
    carbs = 20;
    fats = 12;
    glycemicLoad = "Low";
    clinicalNote = "Lean fish protein with aromatic calabash nutmeg and uziza digestive spices.";
    spokenResponse = `Delightful Ofe Nsala! Aromatic spices with lean catfish give you 360 calories and 34 grams of clean protein with steady energy. Shall I save this?`;
  } else if (text.includes("eba") || text.includes("garri")) {
    foodName = "Eba with Vegetable Soup & Titus Fish";
    calories = 470;
    protein = 28;
    carbs = 66;
    fats = 12;
    glycemicLoad = "Medium";
    clinicalNote = "Classic fermented swallow. 1 fist portion paired with rich vegetable soup keeps sugar balanced.";
    spokenResponse = `Nice, ${userName}! Eba with vegetable soup gives you 470 calories and 28 grams of protein. The vegetable soup helps balance the starch. Ready to save this to your diary?`;
  }

  // 2. Rice Dishes
  else if (text.includes("jollof")) {
    foodName = "Party Jollof Rice with Grilled Chicken & Dodo";
    calories = 580;
    protein = 34;
    carbs = 76;
    fats = 16;
    glycemicLoad = "Medium";
    clinicalNote = "Rich in tomato lycopene antioxidants. Moderate fried plantain portion for glycemic balance.";
    spokenResponse = `Classic Jollof Rice, ${userName}! That comes out to around 580 calories with a great 34 grams of protein from the chicken. Let's record this for your daily log!`;
  } else if (text.includes("ofada") || text.includes("ayamase")) {
    foodName = "Ofada Rice with Ayamase Sauce & Boiled Egg";
    calories = 530;
    protein = 30;
    carbs = 62;
    fats = 18;
    glycemicLoad = "Low";
    clinicalNote = "Unpolished Ofada rice retains bran fiber, giving it a much lower glycemic spike than white rice.";
    spokenResponse = `Great selection! Ofada rice is an unpolished whole grain with natural prebiotic fiber. Estimated 530 calories and 30 grams of protein. Ready to log?`;
  } else if (text.includes("fried rice")) {
    foodName = "Nigerian Fried Rice with Shredded Chicken & Veggies";
    calories = 510;
    protein = 28;
    carbs = 66;
    fats = 15;
    glycemicLoad = "Medium";
    clinicalNote = "Colorful mixed vegetables provide beta-carotene, Vitamin C, and fiber.";
    spokenResponse = `Tasty! Nigerian fried rice with chicken gives you 510 calories and 28 grams of protein. Should I save this now?`;
  }

  // 3. Legumes & High-Protein Staples
  else if (text.includes("moi moi") || text.includes("moimoi")) {
    foodName = "Steamed Moi-Moi with Boiled Egg & Fish";
    calories = 340;
    protein = 24;
    carbs = 34;
    fats = 10;
    glycemicLoad = "Low";
    clinicalNote = "Pure cowpeas deliver clean plant protein, soluble fiber, and slow digestion.";
    spokenResponse = `Super healthy, ${userName}! Moi-Moi is one of the best metabolic foods in West Africa—high protein, rich in fiber, and very gentle on blood sugar. 340 calories and 24g protein. Shall I log it?`;
  } else if (text.includes("beans") || text.includes("ewa aganyin") || text.includes("ewa")) {
    foodName = "Ewa Aganyin with Boiled Plantain";
    calories = 460;
    protein = 22;
    carbs = 62;
    fats = 14;
    glycemicLoad = "Low";
    clinicalNote = "Cowpea beans provide resistant starch that feeds gut butyrate-producing bacteria.";
    spokenResponse = `Delicious beans! Rich in plant-based prebiotic fiber with a Low Glycemic impact. 460 calories and 22 grams of protein. Ready to save?`;
  } else if (text.includes("akara")) {
    foodName = "Akara (Bean Cakes) with Pap / Akamu";
    calories = 360;
    protein = 16;
    carbs = 42;
    fats = 14;
    glycemicLoad = "Medium";
    clinicalNote = "High in protein. Pair with unsweetened spiced Ogi for gut probiotics.";
    spokenResponse = `Fresh Akara! Packed with plant protein and fiber. Estimated 360 calories and 16g protein. Let's get this logged!`;
  }

  // 4. Salads, Peppersoup & Lean Plates
  else if (text.includes("suya")) {
    foodName = "Beef Suya with Sliced Onions, Tomatoes & Cabbage";
    calories = 380;
    protein = 38;
    carbs = 8;
    fats = 20;
    glycemicLoad = "Low";
    clinicalNote = "High protein, near-zero carbs. Onions and cabbage add natural prebiotics.";
    spokenResponse = `Savory Suya! Packed with 38 grams of protein and minimal carbs for flat glucose. Estimated 380 calories. Shall I log it?`;
  } else if (text.includes("pepper soup") || text.includes("peppersoup") || text.includes("fish")) {
    foodName = "Catfish / Titus Fish Pepper Soup with Herbs";
    calories = 290;
    protein = 36;
    carbs = 8;
    fats = 12;
    glycemicLoad = "Low";
    clinicalNote = "High anti-inflammatory Omega-3 fats and thermogenic spices (calabash nutmeg & ginger).";
    spokenResponse = `Fantastic choice, ${userName}! Fish pepper soup is packed with lean protein and Omega-3 fatty acids, with virtually zero sugar spike. Only 290 calories and a massive 36 grams of protein! Shall I record it?`;
  } else if (text.includes("salad") || text.includes("egg") || text.includes("avocado")) {
    foodName = "Garden Salad with Boiled Eggs & Avocado";
    calories = 310;
    protein = 18;
    carbs = 14;
    fats = 20;
    glycemicLoad = "Low";
    clinicalNote = "Rich in monounsaturated fats, lutein, and potassium for cardiovascular protection.";
    spokenResponse = `Crisp and healthy! Fresh greens, eggs, and healthy fats give you 310 calories with a very low glycemic impact. Ready to save?`;
  } else if (text.includes("zobo") || text.includes("drink")) {
    foodName = "Unsweetened Hibiscus (Zobo) with Ginger & Cloves";
    calories = 45;
    protein = 1;
    carbs = 9;
    fats = 0;
    glycemicLoad = "Low";
    clinicalNote = "Potent anthocyanins support natural blood pressure relaxation.";
    spokenResponse = `Refreshing Zobo! Natural hibiscus antioxidants support your heart and blood pressure. 45 calories. Shall I add this?`;
  } else {
    spokenResponse = `I heard: ${rawText}! I've estimated approximately ${calories} calories, ${protein} grams of protein, and ${carbs} grams of carbs. Would you like me to log this meal?`;
  }

  return {
    foodName,
    calories,
    protein,
    carbs,
    fats,
    glycemicLoad,
    clinicalNote,
    spokenResponse,
  };
}

export default function VoiceFoodLogger({ isOpen, onClose, onMealSaved }: VoiceFoodLoggerProps) {
  const { profile } = useUser();
  const userName = profile?.name?.split(" ")[0] || "Friend";

  const [voiceState, setVoiceState] = useState<AssistantVoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsedMeal, setParsedMeal] = useState<ParsedMealData | null>(null);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(() => {
    const hr = new Date().getHours();
    return hr < 11 ? "breakfast" : hr < 16 ? "lunch" : hr < 21 ? "dinner" : "snack";
  });

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-NG"; // West African English

      recognition.onstart = () => {
        setVoiceState("listening");
        triggerHaptic("medium");
      };

      recognition.onresult = (event: any) => {
        clearTimeout(silenceTimerRef.current);
        let interim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interim;
        setTranscript(currentText);

        silenceTimerRef.current = setTimeout(() => {
          if (currentText.trim().length > 3) {
            recognition.stop();
            handleAnalyzeSpokenText();
          }
        }, 1800);
      };

      recognition.onerror = (e: any) => {
        console.warn("[VoiceFoodLogger] Speech recognition error:", e.error);
        if (e.error === "not-allowed") {
          toast.error("Microphone access is blocked. Please enable permissions in your browser.");
        }
        setVoiceState("idle");
      };

      recognition.onend = () => {
        if (voiceState === "listening" && transcript.trim().length > 3) {
          handleAnalyzeSpokenText();
        } else if (voiceState === "listening") {
          setVoiceState("idle");
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopSarahSpeech();
    };
  }, [voiceState, transcript]);

  const handleStopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    stopSarahSpeech();
    setVoiceState("idle");
    setTranscript("");
    setParsedMeal(null);
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported on this browser. Try Chrome or Safari!");
      return;
    }

    stopSarahSpeech();
    setTranscript("");
    setParsedMeal(null);
    try {
      recognitionRef.current.start();
    } catch {
      recognitionRef.current.stop();
      setTimeout(() => recognitionRef.current.start(), 150);
    }
  };

  const handleAnalyzeSpokenText = () => {
    setVoiceState("thinking");
    triggerHaptic("light");

    setTimeout(() => {
      const parsed = parseSpokenMealText(transcript || "Balanced African Meal", userName);
      setParsedMeal(parsed);
      setVoiceState("ready");

      if (!voiceMuted) {
        speakSarahResponse(parsed.spokenResponse);
      }
    }, 600);
  };

  const speakSarahResponse = (text: string) => {
    stopSarahSpeech();
    speakWithSarah(text, {
      rate: 0.96,
      pitch: 1.02,
      onStart: () => setVoiceState("speaking"),
      onEnd: () => setVoiceState("ready"),
      onError: () => setVoiceState("ready"),
    });
  };

  const handleSaveMeal = async () => {
    if (!parsedMeal) return;
    try {
      const now = new Date();
      const newMeal = {
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        mealType: selectedMealType,
        foodName: parsedMeal.foodName,
        calories: parsedMeal.calories,
        protein: parsedMeal.protein,
        carbs: parsedMeal.carbs,
        fats: parsedMeal.fats,
        bloodSugarImpact: parsedMeal.glycemicLoad.toLowerCase(),
        notes: `Dictated via Voice AI: "${transcript}"`,
      };

      await createMealLog(newMeal);
      triggerHaptic("success");
      triggerConfetti();
      toast.success(`${parsedMeal.foodName} Logged! 🎉`);

      if (!voiceMuted) {
        speakSarahResponse(`Logged! Keep up the healthy habits, ${userName}!`);
      }

      if (onMealSaved) onMealSaved(newMeal);
      setTimeout(() => {
        onClose();
        handleStopAll();
      }, 1200);
    } catch {
      toast.error("Failed to save meal log");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[88vh] p-5 sm:p-6 flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="pb-1 text-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
              Siri-Grade Voice Logger 🥑
            </span>
            <button
              onClick={() => {
                setVoiceMuted(!voiceMuted);
                if (!voiceMuted) {
                  stopSarahSpeech();
                }
              }}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
              title={voiceMuted ? "Unmute Avo's Voice" : "Mute Avo's Voice"}
            >
              {voiceMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-teal-600" />}
            </button>
          </div>

          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Talk to Avo Assistant
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Speak naturally: <em>"I just ate two wraps of oat swallow with okra and titus fish"</em>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain space-y-3 py-2 pr-1 text-center">
          {/* Mascot Avatar with Siri-Grade Pulsing Animation */}
          <div className="relative flex flex-col items-center justify-center my-1">
            <div className="relative">
              {voiceState === "listening" && (
                <div className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping scale-125" />
              )}
              {voiceState === "speaking" && (
                <div className="absolute inset-0 rounded-full bg-teal-400/40 animate-pulse scale-110" />
              )}
              <div className="p-3 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-zinc-800 dark:to-zinc-900 rounded-full shadow-md border-2 border-teal-200 dark:border-teal-700/60">
                <Mascot
                  gesture={voiceState === "speaking" ? "flex" : voiceState === "listening" ? "wave" : "idle"}
                  size={74}
                />
              </div>
            </div>

            {/* Siri-Grade Fluid Audio Waveform */}
            <FluidAudioWaveform state={voiceState} />

            {/* Status Pill */}
            <div className="mt-1">
              {voiceState === "idle" && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 dark:text-slate-300 px-3 py-1 rounded-full">
                  Tap the microphone below to speak
                </span>
              )}
              {voiceState === "listening" && (
                <span className="text-xs font-black text-rose-700 bg-rose-100 dark:bg-rose-950/70 dark:text-rose-300 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 mx-auto w-fit">
                  <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" /> Listening to you...
                </span>
              )}
              {voiceState === "thinking" && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/70 dark:text-amber-300 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 mx-auto w-fit">
                  <Sparkles size={12} className="text-amber-600 animate-spin" /> Identifying meal &amp; glycemic impact...
                </span>
              )}
              {voiceState === "speaking" && (
                <span className="text-xs font-black text-teal-800 bg-teal-100 dark:bg-teal-950/70 dark:text-teal-300 px-3 py-1 rounded-full flex items-center gap-1.5 mx-auto w-fit">
                  <Volume2 size={12} className="text-teal-600 animate-bounce" /> Avo is responding...
                </span>
              )}
              {voiceState === "ready" && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/70 dark:text-emerald-300 px-3 py-1 rounded-full flex items-center gap-1 mx-auto w-fit">
                  <CheckCircle2 size={12} /> Ready to log!
                </span>
              )}
            </div>
          </div>

          {/* Spoken Transcript Bubble */}
          {transcript && (
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-slate-200 text-left relative">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">You said:</span>
              <p className="font-semibold italic">"{transcript}"</p>
            </div>
          )}

          {/* Parsed Nutri-Bento Breakdown Card */}
          {parsedMeal && (
            <div className="p-4 bg-gradient-to-br from-teal-50/80 via-emerald-50/50 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-teal-200 dark:border-teal-800/70 text-left space-y-3 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black text-teal-800 dark:text-teal-300 uppercase tracking-wider block">
                    Identified Cultural Meal
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {parsedMeal.foodName}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0 ${
                    parsedMeal.glycemicLoad === "Low"
                      ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                      : parsedMeal.glycemicLoad === "Medium"
                      ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                      : "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700"
                  }`}
                >
                  {parsedMeal.glycemicLoad === "Low"
                    ? "🛡️ Gentle Wave"
                    : parsedMeal.glycemicLoad === "Medium"
                    ? "🟡 Moderate Rise"
                    : "⚠️ Spike Risk"}
                </span>
              </div>

              {/* Nutri-Bento 4 Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700">
                  <span className="text-[9px] text-slate-400 font-bold block">Energy</span>
                  <span className="text-xs font-black text-orange-600">{parsedMeal.calories}</span>
                  <span className="text-[8px] text-slate-400 block">kcal</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700">
                  <span className="text-[9px] text-slate-400 font-bold block">Protein</span>
                  <span className="text-xs font-black text-blue-600">{parsedMeal.protein}g</span>
                  <span className="text-[8px] text-slate-400 block">Muscle</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700">
                  <span className="text-[9px] text-slate-400 font-bold block">Carbs</span>
                  <span className="text-xs font-black text-emerald-600">{parsedMeal.carbs}g</span>
                  <span className="text-[8px] text-slate-400 block">Fuel</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-xl border border-slate-200 dark:border-zinc-700">
                  <span className="text-[9px] text-slate-400 font-bold block">Fats</span>
                  <span className="text-xs font-black text-purple-600">{parsedMeal.fats}g</span>
                  <span className="text-[8px] text-slate-400 block">Healthy</span>
                </div>
              </div>

              {/* Avo Spoken Tip Box */}
              <div className="p-2.5 bg-white/95 dark:bg-zinc-800/90 rounded-xl border border-teal-100 dark:border-teal-900/60 text-[11px] text-teal-900 dark:text-teal-200 leading-snug flex items-start gap-2">
                <span className="text-sm shrink-0">💡</span>
                <span className="flex-1">{parsedMeal.clinicalNote}</span>
                <button
                  type="button"
                  onClick={() => speakSarahResponse(parsedMeal.spokenResponse)}
                  className="p-1 text-teal-600 hover:text-teal-800 cursor-pointer"
                  title="Replay Avo Voice"
                >
                  <Volume2 size={13} />
                </button>
              </div>

              {/* Meal Timing Picker */}
              <div className="flex items-center gap-1 pt-1">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedMealType(type)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                      selectedMealType === type
                        ? "bg-teal-700 text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Voice Suggestions */}
          {voiceState === "idle" && !parsedMeal && (
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Try saying:
              </span>
              <div className="space-y-1">
                {[
                  "I just ate 2 wraps of oat swallow with okra and titus fish",
                  "I had 1 cup of party jollof rice and grilled chicken",
                  "I drank unsweetened Zobo with ginger and garden egg",
                  "I ate Moi-Moi with one boiled egg for breakfast",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTranscript(sample);
                      setTimeout(() => handleAnalyzeSpokenText(), 100);
                    }}
                    className="w-full text-left p-2 bg-slate-50 dark:bg-zinc-800/60 hover:bg-teal-50 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 rounded-xl text-[11px] text-slate-700 dark:text-slate-300 hover:text-teal-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={12} className="text-teal-600 shrink-0" />
                    <span className="truncate">{sample}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2.5 mt-auto shrink-0">
          {!parsedMeal ? (
            <button
              onClick={voiceState === "listening" ? () => recognitionRef.current?.stop() : handleStartListening}
              className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 ${
                voiceState === "listening"
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-gradient-to-r from-teal-700 via-[#1f7a8c] to-emerald-700 text-white hover:opacity-95"
              }`}
            >
              {voiceState === "listening" ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{voiceState === "listening" ? "Tap to Stop Listening" : "Tap to Speak to Avo 🎙️"}</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleStartListening}
                className="px-3.5 py-2.5 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={13} />
                <span>Retry</span>
              </button>

              <button
                onClick={handleSaveMeal}
                className="flex-1 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-teal-700 to-emerald-700 text-white hover:opacity-95 shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Check size={14} />
                <span>Save to Meal Log 🎉</span>
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
