// Voice Synthesis Service for Sarah, The Nutrition Assistant
// Ultra-Natural Conversational Voice Engine with Multilingual Fallbacks & Mobile Optimization

const DEFAULT_ELEVENLABS_VOICE_ID = "YIgPmt6aTfZFf6mjP9RC";
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;
let isCancelled = false;
let keepAliveTimer: any = null;

export interface SpeakOptions {
  voiceId?: string;
  apiKey?: string;
  rate?: number;
  pitch?: number;
  lang?: "en" | "pcm" | "yo" | "ig" | "ha" | "fr" | string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// In-memory voices cache for fast synchronous access
let cachedVoices: SpeechSynthesisVoice[] = [];

function updateVoiceCache(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  updateVoiceCache();
  window.speechSynthesis.onvoiceschanged = () => {
    updateVoiceCache();
  };
}

/**
 * Phonetic & Conversational Normalizer
 * Cleans emojis and expands clinical acronyms.
 * For African languages (Yoruba, Igbo, Hausa, Pidgin), strips complex diacritics
 * into clean phonetic Latin so standard mobile synthesizers pronounce words fluidly.
 */
export function sanitizeTextForSpeech(rawText: string, lang: string = "en"): string {
  if (!rawText) return "";

  let text = rawText
    // 1. Remove emojis and visual icons
    .replace(/[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, "")
    // 2. Remove markdown bold/italic/code/bracket syntax
    .replace(/[*_#~`>[\]()]/g, " ")
    // 3. Expand common abbreviations
    .replace(/\beA1c\b/gi, "estimated A one C")
    .replace(/\bHbA1c\b/gi, "hemoglobin A one C")
    .replace(/\bGLUT4\b/gi, "GLUT four")
    .replace(/\bGLP-1\b/gi, "GLP one")
    .replace(/\bPCOS\b/gi, "P C O S")
    .replace(/\bPUD\b/gi, "peptic ulcer disease")
    .replace(/\bBP\b/g, "blood pressure")
    .replace(/\bGI\b/g, "glycemic index")
    .replace(/\bKDIGO\b/gi, "kidney disease guidelines")
    .replace(/\bPDF\b/gi, "P D F")
    .replace(/\bAI\b/g, "A I")
    .replace(/\bXP\b/gi, "points")
    .replace(/\b2\.5L\b/gi, "two and a half liters")
    .replace(/\b100%\b/g, "one hundred percent")
    .replace(/\b30%\b/g, "thirty percent")
    .replace(/\b38%\b/g, "thirty eight percent")
    .replace(/\b40%\b/g, "forty percent")
    // 4. Convert lists (1), 2), 3)) to conversational connectors
    .replace(/\b1\)\s*/g, " First, ")
    .replace(/\b2\)\s*/g, " Second, ")
    .replace(/\b3\)\s*/g, " Third, ")
    .replace(/\b4\)\s*/g, " Fourth, ");

  // 5. Phonetic normalization for African languages if using English/African synthesized engines
  const l = (lang || "en").toLowerCase();
  if (l === "yo" || l === "ig" || l === "ha" || l === "pcm") {
    text = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Strip tone accents
      .replace(/[ẹẸ]/g, "e")
      .replace(/[ọỌ]/g, "o")
      .replace(/[ṣṢ]/g, "s")
      .replace(/[ịỊ]/g, "i")
      .replace(/[ụỤ]/g, "u")
      .replace(/[ṅṄ]/g, "n")
      .replace(/[ɓƁ]/g, "b")
      .replace(/[ɗƊ]/g, "d")
      .replace(/[ƙƘ]/g, "k")
      .replace(/[ƴƳ]/g, "y");
  }

  return text.replace(/\s+/g, " ").trim();
}

/**
 * Finds the best available natural/neural voice on the device matching the target language.
 */
export function getBestNaturalVoice(targetLang: string = "en"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  let voices = cachedVoices.length > 0 ? cachedVoices : updateVoiceCache();
  if (!voices || voices.length === 0) return null;

  const l = (targetLang || "en").toLowerCase();

  // 1. French Voice
  if (l === "fr" || l.startsWith("fr")) {
    const frenchFemale = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("fr") &&
        (v.name.toLowerCase().includes("natural") ||
          v.name.toLowerCase().includes("celine") ||
          v.name.toLowerCase().includes("hortense") ||
          v.name.toLowerCase().includes("thomas") ||
          v.name.toLowerCase().includes("google français") ||
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("julie") ||
          v.name.toLowerCase().includes("amelie"))
    );
    if (frenchFemale) return frenchFemale;

    const anyFrench = voices.find((v) => v.lang.toLowerCase().startsWith("fr"));
    if (anyFrench) return anyFrench;
  }

  // 2. Nigerian Pidgin / African Regional Voices
  if (l === "pcm" || l === "en-ng" || l.includes("ng")) {
    const nigerianVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes("en-ng") ||
        v.name.toLowerCase().includes("nigeria") ||
        v.name.toLowerCase().includes("en-ng")
    );
    if (nigerianVoice) return nigerianVoice;

    const africanVoice = voices.find(
      (v) => v.lang.toLowerCase().includes("en-za") || v.lang.toLowerCase().includes("en-gh")
    );
    if (africanVoice) return africanVoice;
  }

  // 3. Yoruba / Igbo / Hausa Voice
  if (l === "yo" || l.startsWith("yo")) {
    const yoVoice = voices.find((v) => v.lang.toLowerCase().startsWith("yo"));
    if (yoVoice) return yoVoice;
    const ngVoice = voices.find(
      (v) => v.lang.toLowerCase().includes("en-ng") || v.name.toLowerCase().includes("nigeria")
    );
    if (ngVoice) return ngVoice;
  }

  if (l === "ig" || l.startsWith("ig")) {
    const igVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ig"));
    if (igVoice) return igVoice;
    const ngVoice = voices.find(
      (v) => v.lang.toLowerCase().includes("en-ng") || v.name.toLowerCase().includes("nigeria")
    );
    if (ngVoice) return ngVoice;
  }

  if (l === "ha" || l.startsWith("ha")) {
    const haVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ha"));
    if (haVoice) return haVoice;
    const ngVoice = voices.find(
      (v) => v.lang.toLowerCase().includes("en-ng") || v.name.toLowerCase().includes("nigeria")
    );
    if (ngVoice) return ngVoice;
  }

  // 4. Premium Natural / Neural English Voices
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

  // 5. Natural Female English
  const naturalFemale = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith("en") &&
      (v.name.toLowerCase().includes("natural") ||
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("siri") ||
        v.name.toLowerCase().includes("tessa"))
  );
  if (naturalFemale) return naturalFemale;

  const englishVoice = voices.find(
    (v) => v.lang.toLowerCase().startsWith("en-gb") || v.lang.toLowerCase().startsWith("en-us") || v.lang.toLowerCase().startsWith("en")
  );
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
  const voiceId = options.voiceId || (import.meta as any).env?.VITE_ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
  const apiKey = options.apiKey || (import.meta as any).env?.VITE_ELEVENLABS_API_KEY;

  stopSarahSpeech();
  isCancelled = false;

  const targetLang = options.lang || "en";
  const sanitized = sanitizeTextForSpeech(rawText, targetLang);
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
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  // Split into natural sentences for human breathing pauses
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    options.onEnd?.();
    return;
  }

  const targetLang = options.lang || "en";
  const voice = getBestNaturalVoice(targetLang);

  // Chrome/Mobile keepalive to prevent audio freeze
  keepAliveTimer = setInterval(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }, 3500);

  let currentIndex = 0;
  options.onStart?.();

  const speakNextSentence = (retryWithoutVoice = false) => {
    if (isCancelled || currentIndex >= sentences.length) {
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      options.onEnd?.();
      return;
    }

    const sentence = sentences[currentIndex];
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = options.rate || 0.94; // Warm, relaxed human conversational pace
    utterance.pitch = options.pitch || 1.02; // Warm friendly clinical tone
    utterance.volume = 1.0;

    if (voice && !retryWithoutVoice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || "en-US";
    } else {
      utterance.lang = targetLang === "fr" ? "fr-FR" : "en-US";
    }

    utterance.onend = () => {
      currentIndex++;
      if (currentIndex < sentences.length) {
        setTimeout(() => {
          if (!isCancelled) {
            speakNextSentence();
          }
        }, 70);
      } else {
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
        options.onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis chunk warning:", e);
      if (!retryWithoutVoice) {
        // Retry current sentence with standard fallback
        speakNextSentence(true);
        return;
      }
      currentIndex++;
      if (currentIndex < sentences.length && !isCancelled) {
        speakNextSentence();
      } else {
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
        options.onEnd?.();
      }
    };

    // Unpause if suspended
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  };

  speakNextSentence();
}

export function stopSarahSpeech() {
  isCancelled = true;
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
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

export const stopSpeaking = stopSarahSpeech;
export const speakText = speakWithSarah;
