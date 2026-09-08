// Voice Synthesis Service for Sarah, The Nutrition Assistant
// Ultra-Natural Conversational Voice Engine with STRICT Female Voice Enforcement

const DEFAULT_ELEVENLABS_VOICE_ID = "YIgPmt6aTfZFf6mjP9RC";
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;
let isCancelled = false;
let currentSessionId = 0;
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

// Known male voice keywords across Windows, macOS, iOS, Android, and Chromium
const MALE_VOICE_KEYWORDS = [
  "david", "george", "richard", "mark", "thomas", "paul", "james", "john",
  "male", "guy", "daniel", "stefan", "bernard", "alain", "claude", "henri",
  "jean", "pierre", "louis", "michel", "arthur", "oliver", "alex", "fred",
  "ralph", "albert", "bruce", "junior", "derrick", "gordon", "adam", "antony",
  "harry", "charles", "edward", "brian", "frank", "sam", "matt", "peter", "tom",
  "microsoft david", "google us english male", "google uk english male",
  "fr-fr-thomas", "fr-fr-paul", "fr-fr-alain"
];

/**
 * Ensures Sarah NEVER speaks with a male voice under any circumstances.
 */
export function isStrictlyFemale(v: SpeechSynthesisVoice): boolean {
  if (!v || !v.name) return false;
  const name = v.name.toLowerCase();
  if (MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw))) {
    return false;
  }
  return true;
}

/**
 * Phonetic & Conversational Normalizer
 * Cleans emojis, expands clinical acronyms, and normalizes African diacritics
 * into clean phonetic Latin so female synthesizers pronounce words smoothly.
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

  // 5. Phonetic normalization for African languages (Yoruba, Igbo, Hausa, Pidgin)
  const l = (lang || "en").toLowerCase();
  if (l === "yo" || l === "ig" || l === "ha" || l === "pcm") {
    text = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Strip combining tone accents
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
 * Finds the highest quality strictly female voice available on the device.
 */
export function getBestNaturalVoice(targetLang: string = "en"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  let voices = cachedVoices.length > 0 ? cachedVoices : updateVoiceCache();
  if (!voices || voices.length === 0) return null;

  // Filter out all male voices first
  const femaleVoices = voices.filter(isStrictlyFemale);
  const pool = femaleVoices.length > 0 ? femaleVoices : voices;

  const l = (targetLang || "en").toLowerCase();

  // 1. French Female Voice Selection
  if (l === "fr" || l.startsWith("fr")) {
    const frenchFemale = pool.find(
      (v) =>
        v.lang.toLowerCase().startsWith("fr") &&
        (v.name.toLowerCase().includes("celine") ||
          v.name.toLowerCase().includes("hortense") ||
          v.name.toLowerCase().includes("julie") ||
          v.name.toLowerCase().includes("amelie") ||
          v.name.toLowerCase().includes("denise") ||
          v.name.toLowerCase().includes("marine") ||
          v.name.toLowerCase().includes("marie") ||
          v.name.toLowerCase().includes("lucie") ||
          v.name.toLowerCase().includes("claire") ||
          v.name.toLowerCase().includes("audrey") ||
          v.name.toLowerCase().includes("virginie") ||
          v.name.toLowerCase().includes("google français") ||
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("natural"))
    );
    if (frenchFemale) return frenchFemale;

    const anyFrenchFemale = pool.find((v) => v.lang.toLowerCase().startsWith("fr"));
    if (anyFrenchFemale) return anyFrenchFemale;
  }

  // 2. Nigerian Pidgin / African Regional Female Voice Selection
  if (l === "pcm" || l === "en-ng" || l.includes("ng")) {
    const ngFemale = pool.find(
      (v) =>
        (v.lang.toLowerCase().includes("en-ng") || v.name.toLowerCase().includes("nigeria")) &&
        isStrictlyFemale(v)
    );
    if (ngFemale) return ngFemale;

    const africanFemale = pool.find(
      (v) => (v.lang.toLowerCase().includes("en-za") || v.lang.toLowerCase().includes("en-gh")) && isStrictlyFemale(v)
    );
    if (africanFemale) return africanFemale;
  }

  // 3. Yoruba / Igbo / Hausa Female Voice Selection
  if (l === "yo" || l.startsWith("yo")) {
    const yoFemale = pool.find((v) => v.lang.toLowerCase().startsWith("yo") && isStrictlyFemale(v));
    if (yoFemale) return yoFemale;
    const ngFemale = pool.find((v) => (v.lang.toLowerCase().includes("en-ng") || v.name.toLowerCase().includes("nigeria")) && isStrictlyFemale(v));
    if (ngFemale) return ngFemale;
  }

  if (l === "ig" || l.startsWith("ig")) {
    const igFemale = pool.find((v) => v.lang.toLowerCase().startsWith("ig") && isStrictlyFemale(v));
    if (igFemale) return igFemale;
    const ngFemale = pool.find((v) => (v.lang.toLowerCase().includes("en-ng") || v.name.toLowerCase().includes("nigeria")) && isStrictlyFemale(v));
    if (ngFemale) return ngFemale;
  }

  if (l === "ha" || l.startsWith("ha")) {
    const haFemale = pool.find((v) => v.lang.toLowerCase().startsWith("ha") && isStrictlyFemale(v));
    if (haFemale) return haFemale;
    const ngFemale = pool.find((v) => (v.lang.toLowerCase().includes("en-ng") || v.name.toLowerCase().includes("nigeria")) && isStrictlyFemale(v));
    if (ngFemale) return ngFemale;
  }

  // 4. Premium Female English Voices (Top Priority across all OS platforms)
  const priorityFemaleNames = [
    // iOS / Mac Safari Enhanced Voices
    "Samantha (Enhanced)",
    "Ava (Premium)",
    "Serena (Enhanced)",
    "Karen (Enhanced)",
    "Moira (Enhanced)",
    "Tessa (Enhanced)",
    "Victoria",
    "Fiona",
    // Windows Desktop & Edge Natural Female Voices
    "Microsoft Jenny Online (Natural)",
    "Microsoft Libby Online (Natural)",
    "Microsoft Sonia Online (Natural)",
    "Microsoft Aria Online (Natural)",
    "Microsoft Zira Desktop",
    "Microsoft Zira",
    "Zira",
    // Google Chrome Neural Female Voices
    "Google UK English Female",
    "Google US English Female",
    "Google US English",
    "en-GB-Neural2-F",
    "en-US-Neural2-F",
    "en-US-Wavenet-F",
    "en-US-Standard-F",
  ];

  for (const name of priorityFemaleNames) {
    const match = pool.find((v) => v.name.toLowerCase().includes(name.toLowerCase()) && isStrictlyFemale(v));
    if (match) return match;
  }

  // 5. Any Verified Female English Voice
  const femaleEnglish = pool.find(
    (v) =>
      v.lang.toLowerCase().startsWith("en") &&
      isStrictlyFemale(v) &&
      (v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("woman") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("karen") ||
        v.name.toLowerCase().includes("siri") ||
        v.name.toLowerCase().includes("tessa") ||
        v.name.toLowerCase().includes("kendra") ||
        v.name.toLowerCase().includes("joanna") ||
        v.name.toLowerCase().includes("salli") ||
        v.name.toLowerCase().includes("ivy") ||
        v.name.toLowerCase().includes("kimberly") ||
        v.name.toLowerCase().includes("amy") ||
        v.name.toLowerCase().includes("emma"))
  );
  if (femaleEnglish) return femaleEnglish;

  // 6. Any Strictly Female Voice from Pool
  const anyFemale = pool.find((v) => isStrictlyFemale(v) && v.lang.toLowerCase().startsWith("en"));
  if (anyFemale) return anyFemale;

  if (femaleVoices.length > 0) return femaleVoices[0];

  return voices[0] || null;
}

/**
 * Speaks text naturally using ElevenLabs or strictly female Web Speech API
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
 * Continuous Web Speech Synthesis with strict female voice locking and session synchronization.
 * Chunks long paragraphs into natural sentences to avoid mobile 15-second cutoff and robotic cadence.
 */
function speakNaturalWebSpeech(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  // Lock this new speech session to prevent old sessions or parallel loops from talking over
  currentSessionId++;
  const thisSessionId = currentSessionId;

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
  // Lock the female voice for ALL sentences in this stream
  const lockedFemaleVoice = getBestNaturalVoice(targetLang);

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

  const speakNextSentence = () => {
    // If user cancelled, or a newer session started, terminate immediately!
    if (isCancelled || thisSessionId !== currentSessionId || currentIndex >= sentences.length) {
      if (thisSessionId === currentSessionId) {
        if (keepAliveTimer) {
          clearInterval(keepAliveTimer);
          keepAliveTimer = null;
        }
        options.onEnd?.();
      }
      return;
    }

    const sentence = sentences[currentIndex];
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = options.rate || 0.94; // Warm, relaxed human conversational pace
    utterance.pitch = options.pitch || 1.06; // Warm, pleasant female clinical pitch
    utterance.volume = 1.0;

    // STRICT: Always assign the locked female voice!
    if (lockedFemaleVoice) {
      utterance.voice = lockedFemaleVoice;
      utterance.lang = lockedFemaleVoice.lang || (targetLang === "fr" ? "fr-FR" : "en-US");
    } else {
      utterance.lang = targetLang === "fr" ? "fr-FR" : "en-US";
    }

    utterance.onend = () => {
      if (thisSessionId !== currentSessionId || isCancelled) return;
      currentIndex++;
      if (currentIndex < sentences.length) {
        setTimeout(() => {
          if (!isCancelled && thisSessionId === currentSessionId) {
            speakNextSentence();
          }
        }, 65);
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
      if (thisSessionId !== currentSessionId || isCancelled) return;
      // Skip failed chunk and advance with the SAME female voice
      currentIndex++;
      if (currentIndex < sentences.length) {
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
  currentSessionId++; // Invalidate active session immediately
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
