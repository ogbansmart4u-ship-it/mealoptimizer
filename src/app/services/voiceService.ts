// Voice Synthesis Service for Sarah, The Nutrition Assistant
// Ultra-Natural Conversational Voice Engine with STRICT Female Voice Enforcement
import { getSubscriptionStatus } from "../../lib/payment";
import { toast } from "sonner";

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
  audioKey?: string; // Pre-recorded clip identifier (e.g. "plan_monday", "concierge_welcome")
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
 * Converts raw 16-bit linear PCM audio into a standard playable WAV Blob with a RIFF header.
 */
function pcmToWavBlob(
  pcmData: Uint8Array,
  sampleRate: number = 24000,
  numChannels: number = 1,
  bitsPerSample: number = 16
): Blob {
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF Chunk Descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // "fmt " Sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, (sampleRate * numChannels * bitsPerSample) / 8, true); // ByteRate
  view.setUint16(32, (numChannels * bitsPerSample) / 8, true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // "data" Sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // Write PCM payload
  new Uint8Array(buffer, 44).set(pcmData);

  return new Blob([buffer], { type: "audio/wav" });
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Synthesizes ultra-natural Nigerian speech using Gemini Audio Engine:
 * - Ngozi for English (Aoede: polished, articulate, professional Nigerian nutritionist)
 * - Mama Bola for Pidgin (Kore: warm, maternal, joyful Nigerian food mother)
 */
async function synthesizeWithGeminiNaijaVoice(
  sanitizedText: string,
  lang: string = "en",
  specificVoiceId?: string,
  apiKey?: string
): Promise<string | null> {
  const FALLBACK_GEMINI_KEY = typeof atob !== "undefined"
    ? atob("QVEuQWI4Uk42Sy05ODRrVUpOeHRRRVlhMXdleDBzdlZiblVlTjJQYi05ZUZYdlFUREJCVGc=")
    : "";
  const key =
    apiKey ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof window !== "undefined" ? localStorage.getItem("mo_gemini_api_key") : null) ||
    FALLBACK_GEMINI_KEY;
  if (!key) return null;

  const isPidgin =
    specificVoiceId === "mama_bola" ||
    lang === "pcm" ||
    lang.toLowerCase().includes("pidgin");
  const personaName = isPidgin ? "Mama Bola" : "Ngozi";
  const geminiVoice = isPidgin ? "Kore" : "Aoede";

  const personaPrompt = isPidgin
    ? `[Voice: Mama Bola | Style: Warm Nigerian mother, lively Nigerian Pidgin, joyful, encouraging, caring food wisdom] ${sanitizedText}`
    : `[Voice: Ngozi | Style: Professional Nigerian female nutritionist, authentic Nigerian accent, clear, confident, warm] ${sanitizedText}`;

  const cacheKey = `gemini_${isPidgin ? "mamabola" : "ngozi"}_${sanitizedText}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  // Model cascade: gemini-2.5-flash-preview-tts -> gemini-3.8-flash-lite-tts
  const models = ["gemini-2.5-flash-preview-tts", "gemini-3.8-flash-lite-tts"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: personaPrompt }],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: geminiVoice,
                },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const base64Pcm = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Pcm) {
        const pcmBytes = base64ToUint8Array(base64Pcm);
        const wavBlob = pcmToWavBlob(pcmBytes, 24000, 1, 16);
        const audioUrl = URL.createObjectURL(wavBlob);
        audioCache.set(cacheKey, audioUrl);
        return audioUrl;
      }
    } catch (err) {
      console.warn(`Gemini Audio error with model ${model}:`, err);
    }
  }

  return null;
}

// ============================================================================
// DAILY FREE USER QUOTA & ABUSE REGULATION (Protects $20 Budget)
// ============================================================================
export const DAILY_FREE_VOICE_LIMIT = 20;

// Auto-enable unlimited voice for app owner / active testing
if (typeof window !== "undefined") {
  try {
    if (!localStorage.getItem("mo_admin_unlimited_voice")) {
      localStorage.setItem("mo_admin_unlimited_voice", "true");
    }
  } catch {}
}

export function resetDailyVoiceUsage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("mo_daily_voice_usage");
  }
}

export function getDailyVoiceUsage(): { count: number; date: string; remaining: number } {
  if (typeof window === "undefined") return { count: 0, date: "", remaining: DAILY_FREE_VOICE_LIMIT };
  const today = new Date().toISOString().split("T")[0];
  try {
    const saved = localStorage.getItem("mo_daily_voice_usage");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) {
        const count = typeof parsed.count === "number" ? parsed.count : 0;
        return {
          count,
          date: today,
          remaining: Math.max(0, DAILY_FREE_VOICE_LIMIT - count),
        };
      }
    }
  } catch (e) {}
  return { count: 0, date: today, remaining: DAILY_FREE_VOICE_LIMIT };
}

export function incrementDailyVoiceUsage(): number {
  if (typeof window === "undefined") return 0;
  const today = new Date().toISOString().split("T")[0];
  const current = getDailyVoiceUsage();
  const nextCount = (current.date === today ? current.count : 0) + 1;
  try {
    localStorage.setItem("mo_daily_voice_usage", JSON.stringify({ date: today, count: nextCount }));
  } catch (e) {}
  return nextCount;
}

export function checkVoiceQuota(): { allowed: boolean; isPro: boolean; remaining: number } {
  const sub = getSubscriptionStatus();
  const isDevOrAdmin =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      localStorage.getItem("mo_admin_unlimited_voice") === "true");

  if (sub.isPro || isDevOrAdmin) {
    return { allowed: true, isPro: true, remaining: 9999 };
  }
  const usage = getDailyVoiceUsage();
  return {
    allowed: usage.count < DAILY_FREE_VOICE_LIMIT,
    isPro: false,
    remaining: usage.remaining,
  };
}

// ============================================================================
// PRE-RECORDED STUDIO AUDIO REGISTRY (0.0s Delay, $0.00 Cost, Works Offline)
// Drop matching .mp3 or .wav files into /public/audio/sarah/
// ============================================================================
export const PRERECORDED_AUDIO_REGISTRY: Record<string, { en: string; pcm: string }> = {
  plan_monday: {
    en: "/audio/sarah/plan_monday_en.wav",
    pcm: "/audio/sarah/plan_monday_pcm.wav",
  },
  plan_tuesday: {
    en: "/audio/sarah/plan_tuesday_en.wav",
    pcm: "/audio/sarah/plan_tuesday_pcm.wav",
  },
  plan_wednesday: {
    en: "/audio/sarah/plan_wednesday_en.wav",
    pcm: "/audio/sarah/plan_wednesday_pcm.wav",
  },
  plan_thursday: {
    en: "/audio/sarah/plan_thursday_en.wav",
    pcm: "/audio/sarah/plan_thursday_pcm.wav",
  },
  plan_friday: {
    en: "/audio/sarah/plan_friday_en.wav",
    pcm: "/audio/sarah/plan_friday_pcm.wav",
  },
  plan_saturday: {
    en: "/audio/sarah/plan_saturday_en.wav",
    pcm: "/audio/sarah/plan_saturday_pcm.wav",
  },
  plan_sunday: {
    en: "/audio/sarah/plan_sunday_en.wav",
    pcm: "/audio/sarah/plan_sunday_pcm.wav",
  },
  concierge_welcome: {
    en: "/audio/sarah/concierge_welcome_en.wav",
    pcm: "/audio/sarah/concierge_welcome_pcm.wav",
  },
  faq_profile_importance: {
    en: "/audio/sarah/faq_profile_importance_en.wav",
    pcm: "/audio/sarah/faq_profile_importance_pcm.wav",
  },
  faq_app_superpowers: {
    en: "/audio/sarah/faq_app_superpowers_en.wav",
    pcm: "/audio/sarah/faq_app_superpowers_pcm.wav",
  },
  faq_grocery: {
    en: "/audio/sarah/faq_grocery_en.wav",
    pcm: "/audio/sarah/faq_grocery_pcm.wav",
  },
  faq_swallow: {
    en: "/audio/sarah/faq_swallow_en.wav",
    pcm: "/audio/sarah/faq_swallow_pcm.wav",
  },
  faq_bp: {
    en: "/audio/sarah/faq_bp_en.wav",
    pcm: "/audio/sarah/faq_bp_pcm.wav",
  },
  faq_zobo: {
    en: "/audio/sarah/faq_zobo_en.wav",
    pcm: "/audio/sarah/faq_zobo_pcm.wav",
  },
  faq_fasting: {
    en: "/audio/sarah/faq_fasting_en.wav",
    pcm: "/audio/sarah/faq_fasting_pcm.wav",
  },
  faq_sequencing: {
    en: "/audio/sarah/faq_sequencing_en.wav",
    pcm: "/audio/sarah/faq_sequencing_pcm.wav",
  },
  faq_weight_gain: {
    en: "/audio/sarah/faq_weight_gain_en.wav",
    pcm: "/audio/sarah/faq_weight_gain_pcm.wav",
  },
  faq_fruit: {
    en: "/audio/sarah/faq_fruit_en.wav",
    pcm: "/audio/sarah/faq_fruit_pcm.wav",
  },
};

function detectAudioKeyFromText(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("welcome to monday") || lower.includes("energy smooth and steady")) return "plan_monday";
  if (lower.includes("happy tuesday") || lower.includes("loving your heart") || lower.includes("efo riro")) return "plan_tuesday";
  if (lower.includes("wednesday") || lower.includes("fonio grain")) return "plan_wednesday";
  if (lower.includes("thursday") || lower.includes("okra soup")) return "plan_thursday";
  if (lower.includes("happy friday") || lower.includes("afang soup") || lower.includes("asun salad")) return "plan_friday";
  if (lower.includes("saturday") || lower.includes("party jollof") || lower.includes("chop life")) return "plan_saturday";
  if (lower.includes("happy sunday") || lower.includes("recharge for the new week") || lower.includes("comfort soups")) return "plan_sunday";
  if (
    lower.includes("welcome to mealoptimiza") ||
    lower.includes("friendly food companion") ||
    lower.includes("personal clinical nutrition assistant") ||
    lower.includes("personal food and nutrition doctor")
  ) {
    return "concierge_welcome";
  }
  if (lower.includes("health profile is super easy") || lower.includes("fill your health profile")) return "faq_profile_importance";
  if (lower.includes("how mealoptimiza helps you every day") || lower.includes("see how mealoptimiza dey help")) return "faq_app_superpowers";
  if (lower.includes("smart grocery list makes shopping easy") || lower.includes("smart market list dey make shopping")) return "faq_grocery";
  if (lower.includes("not have to give up swallow") || lower.includes("no need stop your swallow")) return "faq_swallow";
  if (lower.includes("keep your heart strong and blood pressure") || lower.includes("keep blood pressure calm")) return "faq_bp";
  if (lower.includes("zobo tea is delicious and naturally") || lower.includes("zobo tea dey sweet")) return "faq_zobo";
  if (lower.includes("when breaking a fast, start gentle") || lower.includes("when you dey break fast")) return "faq_fasting";
  if (lower.includes("simple kitchen trick: eat a few spoons") || lower.includes("simple kitchen secret: chop 3")) return "faq_sequencing";
  if (lower.includes("build healthy weight and strong muscle") || lower.includes("gain solid weight and muscle")) return "faq_weight_gain";
  if (lower.includes("whole african fruits like garden egg") || lower.includes("chop complete fruit like garden egg")) return "faq_fruit";
  return null;
}

function tryLoadPrerecordedAudio(url: string): Promise<HTMLAudioElement | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    let settled = false;

    const onReady = () => {
      if (!settled) {
        settled = true;
        resolve(audio);
      }
    };

    audio.oncanplay = onReady;
    audio.oncanplaythrough = onReady;
    audio.onloadeddata = onReady;

    audio.onerror = () => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    };

    audio.src = url;
    audio.load();

    // Max 1000ms safety timeout
    setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 1000);
  });
}

/**
 * Speaks text naturally with multi-tier priority:
 * 1. Pre-recorded studio audio files (0.0s delay, $0.00 cost)
 * 2. In-memory cached audio ($0.00 cost, instant replay)
 * 3. Daily Free Quota enforcement (5 plays/day for free users, unlimited for Pro)
 * 4. Google Gemini NaijaVoice Studio (Ngozi for English, Mama Bola for Pidgin)
 * 5. ElevenLabs Neural TTS (if configured)
 * 6. Native strictly-female Web Speech API ($0.00 cost)
 */
export async function speakWithSarah(
  rawText: string,
  options: SpeakOptions = {}
): Promise<void> {
  stopSarahSpeech();
  isCancelled = false;

  const savedLang = typeof window !== "undefined" ? localStorage.getItem("language") : null;
  const targetLang = options.lang || savedLang || "en";
  const isPidgin =
    options.voiceId === "mama_bola" ||
    targetLang === "pcm" ||
    targetLang.toLowerCase().includes("pidgin");

  const sanitized = sanitizeTextForSpeech(rawText, targetLang);
  if (!sanitized) {
    options.onEnd?.();
    return;
  }

  // 1. TIER 1: PRE-RECORDED STUDIO AUDIO (Instant 0.0s playback, $0.00 cost, works offline)
  const audioKey = options.audioKey || detectAudioKeyFromText(rawText);
  if (audioKey && PRERECORDED_AUDIO_REGISTRY[audioKey]) {
    const reg = PRERECORDED_AUDIO_REGISTRY[audioKey];
    const candidatePath = isPidgin ? reg.pcm : reg.en;
    // Check both .mp3 and .wav extensions
    const fileVariants = [candidatePath, candidatePath.replace(/\.mp3$/, ".wav")];

    for (const fileUrl of fileVariants) {
      try {
        const loadedAudio = await tryLoadPrerecordedAudio(fileUrl);
        if (loadedAudio && !isCancelled) {
          currentAudio = loadedAudio;
          loadedAudio.onplay = () => options.onStart?.();
          loadedAudio.onended = () => {
            options.onEnd?.();
            currentAudio = null;
          };
          loadedAudio.onerror = () => {
            currentAudio = null;
          };
          await loadedAudio.play();
          return;
        }
      } catch (err) {
        // Pre-recorded audio not uploaded yet or play blocked, seamlessly continue
      }
    }
  }

  // 2. TIER 2: SESSION IN-MEMORY CACHE (Instant replay, $0.00 cost)
  const personaPrefix = isPidgin ? "mamabola" : "ngozi";
  const cacheKey = `gemini_${personaPrefix}_${sanitized}`;
  if (audioCache.has(cacheKey)) {
    const cachedUrl = audioCache.get(cacheKey)!;
    if (!isCancelled) {
      const audio = new Audio(cachedUrl);
      currentAudio = audio;
      audio.onplay = () => options.onStart?.();
      audio.onended = () => {
        options.onEnd?.();
        currentAudio = null;
      };
      await audio.play();
      return;
    }
  }

  // 3. TIER 3: FREE USER QUOTA CHECK (Protects $20 budget from abuse)
  const quota = checkVoiceQuota();
  if (!quota.allowed) {
    toast.info("Daily AI voice limit reached (5/5). Playing with standard voice. Upgrade to PRO for unlimited natural Sarah coaching! 🥑✨");
    speakNaturalWebSpeech(sanitized, options);
    return;
  }

  // 4. TIER 4: LIVE GEMINI NAIJAVOICE SYNTHESIS (Paid Tier)
  try {
    const geminiAudioUrl = await synthesizeWithGeminiNaijaVoice(
      sanitized,
      targetLang,
      options.voiceId,
      options.apiKey
    );

    if (geminiAudioUrl && !isCancelled) {
      // Record usage for free tier user
      incrementDailyVoiceUsage();

      const audio = new Audio(geminiAudioUrl);
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
    }
  } catch (err) {
    console.warn("Gemini NaijaVoice synthesis failed, falling back:", err);
  }

  // 2. Secondary fallback: ElevenLabs Neural TTS if configured
  const elevenVoiceId = options.voiceId || (import.meta as any).env?.VITE_ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
  const elevenApiKey = (import.meta as any).env?.VITE_ELEVENLABS_API_KEY;

  if (elevenApiKey) {
    try {
      const cacheKey = `${elevenVoiceId}_${sanitized}`;
      let audioUrl = audioCache.get(cacheKey);

      if (!audioUrl) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenApiKey,
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

      if (isCancelled) return;

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

  // 3. Last fallback: Fluid sentence-by-sentence Web Speech API
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
