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

// Nigerian & Cultural Food Clinical Dictionary
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
    foodName = "Amala with Ewedu, Gbegiri & Protein";
    calories = 430;
    protein = 26;
    carbs = 52;
    fats = 12;
    glycemicLoad = "Low";
    clinicalNote = "Ewedu mucilage slows glucose uptake; pairing with fish/meat provides excellent satiety.";
    spokenResponse = `Delicious choice, ${userName}! Amala with Ewedu has a Low Glycemic response because the soluble fiber shields your blood sugar. I've estimated 430 calories and 26 grams of protein. Ready to log this?`;
  } else if (text.includes("oat") && (text.includes("swallow") || text.includes("okra") || text.includes("soup"))) {
    foodName = "Oat Swallow with Fresh Okra Soup";
    calories = 390;
    protein = 24;
    carbs = 48;
    fats = 10;
    glycemicLoad = "Low";
    clinicalNote = "Oat beta-glucans reduce cholesterol while Okra blunts post-meal sugar peaks.";
    spokenResponse = `Outstanding, ${userName}! Oat swallow provides cholesterol-lowering beta-glucans, and the okra creates an ideal fiber barrier. Estimated 390 calories with 24 grams of protein. Shall I log it?`;
  } else if (text.includes("pounded yam") || text.includes("poundo")) {
    foodName = "Pounded Yam with Egusi & Fish";
    calories = 620;
    protein = 32;
    carbs = 84;
    fats = 18;
    glycemicLoad = "High";
    clinicalNote = "High glycemic starch. Pair with extra leafy greens (Ugu/Spinach) and take a 15-min walk.";
    spokenResponse = `Got it, ${userName}! Pounded Yam is energy-dense with 620 calories and 84 grams of carbs. To keep your blood sugar steady, be sure to eat plenty of the soup greens and take a quick 10-minute walk! Should I log this?`;
  } else if (text.includes("eba") || text.includes("garri")) {
    foodName = "Eba with Vegetable Soup & Fish";
    calories = 480;
    protein = 28;
    carbs = 68;
    fats = 12;
    glycemicLoad = "Medium";
    clinicalNote = "Fermented cassava swallow. Best portioned at 1 small wrap with fiber-rich soup.";
    spokenResponse = `Nice, ${userName}! Eba with vegetable soup gives you 480 calories and 28 grams of protein. The vegetable soup helps balance the starch. Ready to save this to your diary?`;
  }

  // 2. Rice Dishes
  else if (text.includes("jollof")) {
    foodName = "Party Jollof Rice with Chicken & Dodo";
    calories = 580;
    protein = 34;
    carbs = 76;
    fats = 16;
    glycemicLoad = "Medium";
    clinicalNote = "Tomato lycopene antioxidant benefits. Moderate fried plantain portion for glycemic balance.";
    spokenResponse = `Classic Jollof Rice, ${userName}! That comes out to around 580 calories with a great 34 grams of protein from the chicken. Let's record this for your daily log!`;
  } else if (text.includes("ofada") || text.includes("ayamase")) {
    foodName = "Ofada Rice with Ayamase Sauce & Boiled Egg";
    calories = 540;
    protein = 30;
    carbs = 64;
    fats = 18;
    glycemicLoad = "Low";
    clinicalNote = "Unpolished Ofada rice retains bran fiber, giving it a much lower glycemic spike than white rice.";
    spokenResponse = `Great selection! Ofada rice is unpolished whole grain with natural prebiotic fiber. Estimated 540 calories and 30 grams of protein. Ready to log?`;
  } else if (text.includes("fried rice")) {
    foodName = "Nigerian Fried Rice with Beef & Veggies";
    calories = 510;
    protein = 28;
    carbs = 66;
    fats = 15;
    glycemicLoad = "Medium";
    clinicalNote = "Liver and vegetable additions provide iron, zinc, and Vitamin A.";
    spokenResponse = `Tasty! Nigerian fried rice with beef gives you 510 calories and 28 grams of protein. Should I save this now?`;
  }

  // 3. Legumes & High-Protein Staples
  else if (text.includes("moi moi") || text.includes("moimoi")) {
    foodName = "Steamed Moi-Moi with Boiled Egg & Fish";
    calories = 340;
    protein = 24;
    carbs = 34;
    fats = 10;
    glycemicLoad = "Low";
    clinicalNote = "Steamed pure cowpeas deliver clean plant protein, soluble fiber, and slow digestion.";
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
    foodName = "Akara (Bean Cakes) with Pap/Ogi";
    calories = 360;
    protein = 16;
    carbs = 42;
    fats = 14;
    glycemicLoad = "Medium";
    clinicalNote = "High in protein. Pair with unsweetened spiced Ogi for probiotic benefits.";
    spokenResponse = `Fresh Akara! Packed with plant protein and fiber. Estimated 360 calories and 16g protein. Let's get this logged!`;
  }

  // 4. Salads, Peppersoup & Lean Plates
  else if (text.includes("pepper soup") || text.includes("peppersoup") || text.includes("fish")) {
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
    // Generic fallback with clinical estimation
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
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(true);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(() => {
    const hr = new Date().getHours();
    return hr < 11 ? "breakfast" : hr < 16 ? "lunch" : hr < 21 ? "dinner" : "snack";
  });

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  // Check speech synthesis support on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) {
      setSpeechSynthesisSupported(false);
    }
  }, []);

  // Initialize Speech Recognition when dialog opens
  useEffect(() => {
    if (!isOpen) {
      handleStopAll();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-NG"; // Supports Nigerian English & cultural accents

      let capturedText = "";

      recognition.onstart = () => {
        setVoiceState("listening");
        triggerHaptic("medium");
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
        setTranscript(full);

        // Extended 3.0-second silence window
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (full.length > 2) {
            try { recognition.stop(); } catch {}
          }
        }, 3000);
      };

      recognition.onerror = (event: any) => {
        console.warn("[VoiceAI] Speech Recognition error:", event.error);
        setVoiceState("idle");
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognition.onend = () => {
        setVoiceState((current) => {
          if (current === "listening") {
            setTimeout(() => {
              handleAnalyzeSpokenText();
            }, 300);
            return "thinking";
          }
          return current;
        });
      };

      recognitionRef.current = recognition;
    }
  }, [isOpen]);

  const handleStopAll = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      stopSarahSpeech();
    }
    setVoiceState("idle");
    setTranscript("");
    setParsedMeal(null);
  };

  const handleStartListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported on this browser. Try Chrome or Safari!");
      return;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

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
      const parsed = parseSpokenMealText(transcript || "Balanced Nigerian Meal", userName);
      setParsedMeal(parsed);
      setVoiceState("ready");

      // Speak back response if not muted
      if (!voiceMuted && typeof window !== "undefined" && window.speechSynthesis) {
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
      triggerConfetti("burst");
      toast.success(`${parsedMeal.foodName} Logged! 🎉`);

      // Avo farewell audio
      if (!voiceMuted && typeof window !== "undefined" && window.speechSynthesis) {
        speakAvoResponse(`Logged! Keep up the healthy habits, ${userName}!`);
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
      <DialogContent className="max-w-md max-h-[88vh] p-5 sm:p-6 flex flex-col rounded-3xl">
        <DialogHeader className="pb-1 text-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-[#1f7a8c] bg-teal-50 px-2 py-0.5 rounded-full">
              Two-Way Conversational Voice AI 🥑
            </span>
            <button
              onClick={() => {
                setVoiceMuted(!voiceMuted);
                if (!voiceMuted && typeof window !== "undefined" && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
              title={voiceMuted ? "Unmute Avo's Voice" : "Mute Avo's Voice"}
            >
              {voiceMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-[#1f7a8c]" />}
            </button>
          </div>

          <DialogTitle className="text-xl font-black text-gray-900 mt-1">
            Talk to Avo Assistant
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Tell Avo what you ate in English or Pidgin: <em>"I just ate two wraps of amala with ewedu and titus fish"</em>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain space-y-4 py-2 pr-1 text-center">
          {/* 3D Avo Mascot & Live Pulsing Audio Avatar */}
          <div className="relative flex flex-col items-center justify-center my-2">
            <div className="relative">
              {voiceState === "listening" && (
                <div className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping scale-125" />
              )}
              {voiceState === "speaking" && (
                <div className="absolute inset-0 rounded-full bg-teal-400/40 animate-pulse scale-110" />
              )}
              <div className="p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-full shadow-md border-2 border-teal-200">
                <Mascot
                  gesture={voiceState === "speaking" ? "flex" : voiceState === "listening" ? "wave" : "idle"}
                  size={76}
                />
              </div>
            </div>

            {/* Status Pill */}
            <div className="mt-3">
              {voiceState === "idle" && (
                <span className="text-xs font-bold text-gray-500 bg-slate-100 px-3 py-1 rounded-full">
                  Tap the microphone below to speak
                </span>
              )}
              {voiceState === "listening" && (
                <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 mx-auto w-fit">
                  <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" /> Listening to you...
                </span>
              )}
              {voiceState === "thinking" && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5 mx-auto w-fit">
                  <Sparkles size={12} className="text-amber-600 animate-spin" /> Calculating nutrition &amp; glycemic impact...
                </span>
              )}
              {voiceState === "speaking" && (
                <span className="text-xs font-black text-teal-800 bg-teal-100 px-3 py-1 rounded-full flex items-center gap-1.5 mx-auto w-fit">
                  <Volume2 size={12} className="text-[#1f7a8c] animate-bounce" /> Avo is speaking...
                </span>
              )}
              {voiceState === "ready" && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 mx-auto w-fit">
                  <CheckCircle2 size={12} /> Ready to log!
                </span>
              )}
            </div>
          </div>

          {/* Spoken Transcript Bubble */}
          {transcript && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-gray-800 text-left relative">
              <span className="text-[10px] font-bold text-gray-400 block mb-0.5">You said:</span>
              <p className="font-semibold italic">"{transcript}"</p>
            </div>
          )}

          {/* Parsed Meal Breakdown Card */}
          {parsedMeal && (
            <div className="p-4 bg-gradient-to-br from-teal-50/70 via-emerald-50/50 to-white rounded-2xl border border-teal-200 text-left space-y-3 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block">
                    Identified Meal
                  </span>
                  <h4 className="text-sm font-black text-gray-900 leading-snug">
                    {parsedMeal.foodName}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                    parsedMeal.glycemicLoad === "Low"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : parsedMeal.glycemicLoad === "Medium"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-rose-100 text-rose-800 border-rose-300"
                  }`}
                >
                  {parsedMeal.glycemicLoad} Glycemic Spike
                </span>
              </div>

              {/* Macro Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-gray-400 font-bold block">Calories</span>
                  <span className="text-xs font-black text-orange-600">{parsedMeal.calories}</span>
                  <span className="text-[8px] text-gray-400 block">kcal</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-gray-400 font-bold block">Protein</span>
                  <span className="text-xs font-black text-blue-600">{parsedMeal.protein}g</span>
                  <span className="text-[8px] text-gray-400 block">Muscle</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-gray-400 font-bold block">Carbs</span>
                  <span className="text-xs font-black text-emerald-600">{parsedMeal.carbs}g</span>
                  <span className="text-[8px] text-gray-400 block">Energy</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[9px] text-gray-400 font-bold block">Fats</span>
                  <span className="text-xs font-black text-purple-600">{parsedMeal.fats}g</span>
                  <span className="text-[8px] text-gray-400 block">Healthy</span>
                </div>
              </div>

              {/* Avo's Clinical Spoken Tip */}
              <div className="p-2.5 bg-white/90 rounded-xl border border-teal-100 text-[11px] text-teal-900 leading-snug flex items-start gap-2">
                <span className="text-sm shrink-0">💡</span>
                <span>{parsedMeal.clinicalNote}</span>
              </div>

              {/* Meal Timing Picker */}
              <div className="flex items-center gap-1 pt-1">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                      selectedMealType === type
                        ? "bg-[#1f7a8c] text-white shadow-2xs"
                        : "bg-slate-100 text-gray-600 hover:bg-slate-200"
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
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
                Try saying:
              </span>
              <div className="space-y-1">
                {[
                  "I just ate 2 wraps of oat swallow with okra and titus fish",
                  "I had 1 cup of party jollof rice and grilled chicken",
                  "I drank unsweetened Zobo with ginger and a garden egg",
                  "I ate Moi-Moi with one boiled egg for breakfast",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(sample);
                      setTimeout(() => handleAnalyzeSpokenText(), 100);
                    }}
                    className="w-full text-left p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200/80 rounded-xl text-[11px] text-gray-700 hover:text-teal-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={12} className="text-[#1f7a8c] shrink-0" />
                    <span className="truncate">{sample}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2.5 mt-auto shrink-0">
          {!parsedMeal ? (
            <button
              onClick={voiceState === "listening" ? () => recognitionRef.current?.stop() : handleStartListening}
              className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 ${
                voiceState === "listening"
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white hover:opacity-95"
              }`}
            >
              {voiceState === "listening" ? <MicOff size={16} /> : <Mic size={16} />}
              <span>{voiceState === "listening" ? "Tap to Stop Listening" : "Tap to Speak to Avo 🎙️"}</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleStartListening}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={13} />
                <span>Re-speak</span>
              </button>
              <button
                onClick={handleSaveMeal}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Check size={16} />
                <span>Confirm &amp; Log Meal 🍽️</span>
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
