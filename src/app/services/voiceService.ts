// Voice Synthesis Service for Sarah, The Nutrition Assistant
// Ultra-Natural Conversational Voice Engine with Mobile Voice Optimization & Lip-Sync

const DEFAULT_ELEVENLABS_VOICE_ID = "YIgPmt6aTfZFf6mjP9RC";
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;
let currentUtteranceQueue: SpeechSynthesisUtterance[] = [];
let isCancelled = false;

export interface SpeakOptions {
  voiceId?: string;
  apiKey?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Phonetic & Conversational Normalizer
 * Cleans text of emojis and expands clinical acronyms so mobile TTS sounds human and fluid.
 */
export function sanitizeTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  let text = rawText
    // 1. Remove emojis and visual icons
    .replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, "")
    // 2. Remove markdown bold/italic/code syntax
    .replace(/[*_#~`>[\]()]/g, " ")
    // 3. Expand clinical acronyms into natural spoken words
    .replace(/\beA1c\b/gi, "estimated A one C")
    .replace(/\bHbA1c\b/gi, "hemoglobin A one C")
    .replace(/\bGLUT4\b/gi, "GLUT four")
    .replace(/\bGLP-1\b/gi, "GLP one")
    .replace(/\bPCOS\b/gi, "P-C-O-S")
    .replace(/\bPUD\b/gi, "peptic ulcer disease")
    .replace(/\bBP\b/g, "blood pressure")
    .replace(/\bGI\b/g, "glycemic index")
    .replace(/\bKDIGO\b/gi, "kidney disease guidelines")
    .replace(/\bPDF\b/gi, "P D F")
    .replace(/\bAI\b/g, "A I")
    .replace(/\bXP\b/gi, "experience points")
    .replace(/\b2\.5L\b/gi, "two and a half liters")
    .replace(/\b100%\b/g, "one hundred percent")
    .replace(/\b30%\b/g, "thirty percent")
    .replace(/\b38%\b/g, "thirty eight percent")
    // 4. Convert lists (1), 2), 3)) to conversational connectors
    .replace(/\b1\)\s*/g, " First, ")
    .replace(/\b2\)\s*/g, " Second, ")
    .replace(/\b3\)\s*/g, " Third, ")
    .replace(/\b4\)\s*/g, " Fourth, ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

/**
 * Finds the highest quality natural/neural voice available on the device
 */
export function getBestNaturalVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Top priority: iOS Safari Enhanced/Premium & Google Neural voices
  const highPriorityNames = [
    "Samantha (Enhanced)",
    "Ava (Premium)",
    "Serena (Enhanced)",
    "Karen (Enhanced)",
    "Moira (Enhanced)",
    "Tessa (Enhanced)",
    "Google UK English Female",
    "Google US English",
    "Microsoft Libby Online (Natural)",
    "Microsoft Sonia Online (Natural)",
    "Microsoft Jenny Online (Natural)",
    "en-GB-Neural2-F",
    "en-US-Neural2-F",
  ];

  for (const name of highPriorityNames) {
    const match = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
    if (match) return match;
  }

  // 2. High-quality natural English female voice
  const naturalFemale = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("siri") ||
        v.name.toLowerCase().includes("tessa"))
  );
  if (naturalFemale) return naturalFemale;

  // 3. Any English voice
  const englishVoice = voices.find((v) => v.lang.startsWith("en-GB") || v.lang.startsWith("en-US") || v.lang.startsWith("en"));
  if (englishVoice) return englishVoice;

  return voices[0] || null;
}

/**
 * Speaks text naturally using ElevenLabs or high-quality Web Speech API
 */
export async function speakWithSarah(
  rawText: string,
  options: SpeakOptions = {}
): Promise<void> {
  const voiceId = options.voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
  const apiKey = options.apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;

  stopSarahSpeech();
  isCancelled = false;

  const sanitized = sanitizeTextForSpeech(rawText);
  if (!sanitized) {
    options.onEnd?.();
    return;
  }

  // 1. Try ElevenLabs Neural TTS if API key is configured
  if (apiKey) {
    try {
      const cacheKey = `${voiceId}_${sanitized}`;
      let audioUrl = audioCache.get(cacheKey);

      if (!audioUrl) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text: sanitized,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.82,
              style: 0.08,
              use_speaker_boost: true,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs TTS error: ${response.statusText}`);
        }

        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCache.set(cacheKey, audioUrl);
      }

      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onplay = () => options.onStart?.();
      audio.onended = () => {
        options.onEnd?.();
        currentAudio = null;
      };
      audio.onerror = () => {
        currentAudio = null;
        speakNaturalWebSpeech(sanitized, options);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn("ElevenLabs synthesis fallback to WebSpeech:", err);
    }
  }

  // 2. Ultra-Natural Web Speech API with sentence-by-sentence fluid stream
  speakNaturalWebSpeech(sanitized, options);
}

/**
 * Continuous Web Speech Synthesis with natural human conversational pacing.
 * Chunks long paragraphs into natural sentences to avoid mobile 15-second cutoff and robotic cadence.
 */
function speakNaturalWebSpeech(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  // Split into natural sentences for human breathing pauses
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    options.onEnd?.();
    return;
  }

  const voice = getBestNaturalVoice();
  let currentIndex = 0;
  options.onStart?.();

  const speakNextSentence = () => {
    if (isCancelled || currentIndex >= sentences.length) {
      options.onEnd?.();
      return;
    }

    const sentence = sentences[currentIndex];
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = options.rate || 0.94; // Warm, relaxed human conversational pace
    utterance.pitch = options.pitch || 1.02; // Warm friendly clinical tone
    utterance.volume = 1.0;

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      currentIndex++;
      if (currentIndex < sentences.length) {
        // Natural 80ms breath pause between thoughts
        setTimeout(() => {
          if (!isCancelled) {
            speakNextSentence();
          }
        }, 80);
      } else {
        options.onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis chunk warning:", e);
      currentIndex++;
      if (currentIndex < sentences.length && !isCancelled) {
        speakNextSentence();
      } else {
        options.onEnd?.();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Mobile Audio Context Wakeup
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  speakNextSentence();
}

export function stopSarahSpeech() {
  isCancelled = true;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export const stopSpeaking = stopSarahSpeech;
export const speakText = speakWithSarah;

// Pre-warm voices on browser load
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    getBestNaturalVoice();
  };
}
