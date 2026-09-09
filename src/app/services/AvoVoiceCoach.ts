// AvoVoiceCoach.ts - Hands-Free Voice Assistant for Cooking & 9-Inch Plate Guidance
// Uses Web Speech Synthesis + Web Speech Recognition (Zero external API dependencies)

import { sanitizeTextForSpeech } from "./voiceService";

export type AvoDialect = "en" | "pcm"; // English (Clinical) or Nigerian Pidgin

export interface AvoVoiceCallbacks {
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onRepeatStep?: () => void;
  onStartTimer?: () => void;
  onStopTimer?: () => void;
  onStatusChange?: (isListening: boolean, isSpeaking: boolean) => void;
  onError?: (errorMessage: string) => void;
}

class AvoVoiceCoachService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private currentDialect: AvoDialect = "en";
  private callbacks: AvoVoiceCallbacks = {};
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyStatus();
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            this.isListening = false;
            this.notifyStatus();
          }
        } else {
          this.notifyStatus();
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === "no-speech") return;
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          this.isListening = false;
          this.notifyStatus();
          this.callbacks.onError?.("Microphone permission denied. Please allow microphone access for hands-free cooking.");
        }
      };

      this.recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0]?.transcript?.trim().toLowerCase();
        if (transcript) {
          this.handleCommand(transcript);
        }
      };
    } catch (e) {
      console.warn("[AvoVoiceCoach] Speech recognition setup notice:", e);
    }
  }

  public setCallbacks(callbacks: AvoVoiceCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public setDialect(dialect: AvoDialect) {
    this.currentDialect = dialect;
  }

  public getDialect(): AvoDialect {
    return this.currentDialect;
  }

  public isSupported(): { speech: boolean; recognition: boolean } {
    if (typeof window === "undefined") return { speech: false, recognition: false };
    const speech = "speechSynthesis" in window;
    const recognition = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    return { speech, recognition };
  }

  public startListening() {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (this.recognition && !this.isListening) {
      try {
        this.isListening = true;
        this.recognition.start();
        this.notifyStatus();
      } catch (e) {
        console.warn("[AvoVoiceCoach] Could not start recognition:", e);
      }
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.notifyStatus();
  }

  public toggleListening(): boolean {
    if (this.isListening) {
      this.stopListening();
      return false;
    } else {
      this.startListening();
      return true;
    }
  }

  private handleCommand(transcript: string) {
    console.log("[AvoVoiceCoach] Heard command:", transcript);

    if (
      transcript.includes("next") ||
      transcript.includes("continue") ||
      transcript.includes("forward") ||
      transcript.includes("step after")
    ) {
      this.speakFeedback(this.currentDialect === "pcm" ? "Moving to next step sharp sharp!" : "Moving to next step!");
      this.callbacks.onNextStep?.();
    } else if (
      transcript.includes("previous") ||
      transcript.includes("back") ||
      transcript.includes("go back") ||
      transcript.includes("step before")
    ) {
      this.speakFeedback(this.currentDialect === "pcm" ? "Going back to previous step!" : "Going back to previous step.");
      this.callbacks.onPrevStep?.();
    } else if (
      transcript.includes("repeat") ||
      transcript.includes("read again") ||
      transcript.includes("say again") ||
      transcript.includes("what did you say") ||
      transcript.includes("pardon")
    ) {
      this.callbacks.onRepeatStep?.();
    } else if (
      transcript.includes("timer") ||
      transcript.includes("start timer") ||
      transcript.includes("count down")
    ) {
      this.speakFeedback(this.currentDialect === "pcm" ? "Timer don start!" : "Timer started!");
      this.callbacks.onStartTimer?.();
    } else if (
      transcript.includes("stop timer") ||
      transcript.includes("cancel timer")
    ) {
      this.speakFeedback(this.currentDialect === "pcm" ? "Timer don pause!" : "Timer paused.");
      this.callbacks.onStopTimer?.();
    }
  }

  public speakCookingStep(
    stepNumber: number,
    totalSteps: number,
    instruction: string,
    avoTip?: string,
    onComplete?: () => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onComplete?.();
      return;
    }

    this.stopSpeaking();

    let textToSpeak = "";
    if (this.currentDialect === "pcm") {
      textToSpeak = `Step ${stepNumber} out of ${totalSteps}. ${instruction}.`;
      if (avoTip) {
        textToSpeak += ` Avo tip: ${avoTip}`;
      }
    } else {
      textToSpeak = `Step ${stepNumber} of ${totalSteps}. ${instruction}.`;
      if (avoTip) {
        textToSpeak += ` Avo clinical tip: ${avoTip}`;
      }
    }

    const clean = sanitizeTextForSpeech(textToSpeak);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium") || v.name.includes("Samantha") || v.name.includes("Victoria"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (enVoice) {
      utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifyStatus();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.activeUtterance = null;
      this.notifyStatus();
      onComplete?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.activeUtterance = null;
      this.notifyStatus();
      onComplete?.();
    };

    this.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private speakFeedback(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.activeUtterance = null;
    this.notifyStatus();
  }

  private notifyStatus() {
    this.callbacks.onStatusChange?.(this.isListening, this.isSpeaking);
  }
}

export const avoVoiceCoach = new AvoVoiceCoachService();
