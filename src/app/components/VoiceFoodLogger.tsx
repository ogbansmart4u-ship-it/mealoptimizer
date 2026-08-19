import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, Check, X, Loader2, Volume2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { createMealLog } from "../../lib/api";

interface VoiceFoodLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onMealSaved?: (meal: any) => void;
}

export default function VoiceFoodLogger({ isOpen, onClose, onMealSaved }: VoiceFoodLoggerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedMeal, setRecognizedMeal] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript("");
      setRecognizedMeal(null);
      return;
    }

    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-NG"; // English (Nigeria) handles local accents & dishes

      recognition.onstart = () => {
        setIsListening(true);
        triggerHaptic("light");
      };

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join("");
        setTranscript(text);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setRecognizedMeal(null);
      recognitionRef.current.start();
    }
  };

  const handleProcessVoice = () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    triggerHaptic("medium");

    setTimeout(() => {
      const lower = transcript.toLowerCase();
      let name = transcript;
      let calories = 480;
      let protein = 22;
      let carbs = 58;
      let fats = 14;
      let glycemic = "Medium";

      if (lower.includes("amala") || lower.includes("yam")) {
        name = "Amala with Soup & Protein";
        calories = 520;
        carbs = 72;
        glycemic = "Low";
      } else if (lower.includes("jollof") || lower.includes("rice")) {
        name = "Jollof Rice & Protein";
        calories = 580;
        carbs = 78;
        glycemic = "Medium";
      } else if (lower.includes("moi moi") || lower.includes("beans")) {
        name = "Moi Moi & Egg";
        calories = 310;
        protein = 24;
        carbs = 32;
        glycemic = "Low";
      } else if (lower.includes("salad") || lower.includes("egg")) {
        name = "Egg & Veggie Plate";
        calories = 290;
        protein = 20;
        carbs = 12;
        glycemic = "Low";
      }

      setRecognizedMeal({
        foodName: name,
        calories,
        protein,
        carbs,
        fats,
        glycemicLoad: glycemic,
      });
      setIsProcessing(false);
    }, 600);
  };

  const handleSaveMeal = async () => {
    if (!recognizedMeal) return;
    try {
      const now = new Date();
      const newMeal = {
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        mealType: now.getHours() < 11 ? "breakfast" : now.getHours() < 16 ? "lunch" : "dinner",
        foodName: recognizedMeal.foodName,
        calories: recognizedMeal.calories,
        protein: recognizedMeal.protein,
        carbs: recognizedMeal.carbs,
        fats: recognizedMeal.fats,
        bloodSugarImpact: recognizedMeal.glycemicLoad.toLowerCase(),
      };

      await createMealLog(newMeal);
      triggerHaptic("success");
      triggerConfetti("burst");
      toast.success("Meal logged via voice!");
      if (onMealSaved) onMealSaved(newMeal);
      onClose();
    } catch {
      toast.error("Failed to save meal log");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-3xl text-center">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-2">
            <Volume2 className="h-6 w-6 text-[#1f7a8c]" />
            Voice Meal Dictation
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Speak naturally: <em>"I just ate 1 cup of Jollof rice and grilled tilapia"</em>
          </DialogDescription>
        </DialogHeader>

        {/* Pulsating Microphone Button */}
        <div className="py-6 flex flex-col items-center justify-center">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer ${
              isListening
                ? "bg-rose-500 text-white animate-pulse scale-110 shadow-rose-500/40"
                : "bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white hover:scale-105"
            }`}
          >
            {isListening ? <Mic className="h-10 w-10 animate-bounce" /> : <Mic className="h-10 w-10" />}
          </button>
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-3">
            {isListening ? "Listening... Speak now" : "Tap microphone to speak"}
          </span>
        </div>

        {/* Live Transcript Bubble */}
        {transcript && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 text-left text-xs mb-4">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
              Live Transcript:
            </span>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 italic">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Recognized Nutritional Card */}
        {recognizedMeal && (
          <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800 text-left text-xs mb-4 animate-in fade-in duration-200">
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 block mb-1">
              Parsed Meal Breakdown:
            </span>
            <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
              {recognizedMeal.foodName}
            </div>
            <div className="flex items-center gap-3 mt-2 text-zinc-600 dark:text-zinc-300 font-semibold">
              <span>🔥 {recognizedMeal.calories} kcal</span>
              <span>💪 {recognizedMeal.protein}g protein</span>
              <span>🍚 {recognizedMeal.carbs}g carbs</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {transcript && !recognizedMeal && (
            <Button
              onClick={handleProcessVoice}
              disabled={isProcessing}
              className="w-full bg-[#1f7a8c] hover:bg-[#185e6c] text-white rounded-xl h-11 font-bold text-xs"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calculate Macros & Nutrients"}
            </Button>
          )}

          {recognizedMeal && (
            <Button
              onClick={handleSaveMeal}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl h-11 font-bold text-xs shadow-md"
            >
              <Check className="h-4 w-4 mr-1.5" /> Save Meal to Log
            </Button>
          )}

          <Button onClick={onClose} variant="ghost" className="w-full text-xs text-zinc-400">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
