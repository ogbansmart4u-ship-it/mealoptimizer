// Voice Synthesis Service for Sarah, The Nutrition Assistant
// Features Punctuation-Aware Natural Cadence & Real-Time Lip-Sync Events

import { VisemeShape } from "../components/SarahAvatar";

const DEFAULT_ELEVENLABS_VOICE_ID = "YIgPmt6aTfZFf6mjP9RC";
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;
let speechCancelled = false;
let pauseTimeout: any = null;

export interface SpeakOptions {
  voiceId?: string;
  apiKey?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onVisemeChange?: (viseme: VisemeShape) => void;
}

/**
 * Splits text into natural sentence/clause units with punctuation markers
 * to guarantee Sarah breathes and observes all commas, periods, and exclamations!
 */
export function parsePunctuationClauses(text: string): Array<{ text: string; pauseMs: number }> {
  // Regex to split by major punctuation marks while preserving them
  const regex = /([^.,!?:;—]+[.,!?:;—]*)/g;
  const matches = text.match(regex) || [text];

  return matches.map((raw) => {
    const trimmed = raw.trim();
    const lastChar = trimmed.slice(-1);

    let pauseMs = 120; // default micro-cadence
    if (lastChar === "." || lastChar === "!" || lastChar === "?") {
      pauseMs = 520; // full sentence stop pause
    } else if (lastChar === "," || lastChar === ";" || lastChar === ":") {
      pauseMs = 280; // comma/clause pause
    }

    return { text: trimmed, pauseMs };
  });
}

export async function speakWithSarah(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  const voiceId = options.voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
  const apiKey = options.apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;

  // Stop any currently playing speech
  stopSarahSpeech();
  speechCancelled = false;

  // 1. Try ElevenLabs Neural TTS if API key is provided
  if (apiKey) {
    try {
      const cacheKey = `${voiceId}_${text.trim()}`;
      let audioUrl = audioCache.get(cacheKey);

      if (!audioUrl) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.8,
              style: 0.1,
              use_speaker_boost: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs TTS failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCache.set(cacheKey, audioUrl);
      }

      if (speechCancelled) return;

      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onplay = () => options.onStart?.();
      audio.onended = () => {
        options.onEnd?.();
        currentAudio = null;
      };
      audio.onerror = (e) => {
        console.warn("Audio playback error, falling back to Punctuation-Aware WebSpeech:", e);
        speakWithPunctuationPacing(text, options);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn("ElevenLabs synthesis error, falling back to Punctuation-Aware WebSpeech:", err);
      speakWithPunctuationPacing(text, options);
      return;
    }
  }

  // 2. Fallback: Punctuation-Aware Sequential Speech Synthesis
  speakWithPunctuationPacing(text, options);
}

/**
 * Sequential Speech Synthesis Engine that honors commas, periods, and question marks
 * with natural human breath pauses and real-time lip-sync mouth triggers!
 */
function speakWithPunctuationPacing(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const clauses = parsePunctuationClauses(text);
  if (clauses.length === 0) {
    options.onEnd?.();
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.name.includes("Female") || v.name.includes("Natural") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-NG")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0];

  let currentIdx = 0;
  options.onStart?.();

  function speakNextClause() {
    if (speechCancelled || currentIdx >= clauses.length) {
      options.onVisemeChange?.("closed");
      options.onEnd?.();
      return;
    }

    const clause = clauses[currentIdx];
    const utterance = new SpeechSynthesisUtterance(clause.text);
    utterance.rate = 0.90; // Calm, warm, articulate medical pace
    utterance.pitch = 1.04;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Live Word Boundary Listener for Lip-Sync
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const char = clause.text[event.charIndex]?.toLowerCase() || "a";
        let viseme: VisemeShape = "medium";

        if (["a", "e", "i"].includes(char)) viseme = "wide";
        else if (["o", "u", "w"].includes(char)) viseme = "o_shape";
        else if (["m", "b", "p"].includes(char)) viseme = "closed";
        else viseme = "small";

        options.onVisemeChange?.(viseme);
      }
    };

    utterance.onend = () => {
      currentIdx++;
      // Mouth closes naturally during punctuation pause
      options.onVisemeChange?.("closed");

      if (currentIdx < clauses.length) {
        pauseTimeout = setTimeout(() => {
          if (!speechCancelled) {
            speakNextClause();
          }
        }, clause.pauseMs);
      } else {
        options.onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis clause error:", e);
      currentIdx++;
      if (currentIdx < clauses.length && !speechCancelled) {
        speakNextClause();
      } else {
        options.onEnd?.();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  speakNextClause();
}

export function stopSarahSpeech() {
  speechCancelled = true;
  if (pauseTimeout) {
    clearTimeout(pauseTimeout);
    pauseTimeout = null;
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
