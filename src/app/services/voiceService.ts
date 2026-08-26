// Voice Synthesis Service for Sarah, The Nutrition Assistant
// Fluid, Natural Voice Cadence & Live Lip-Sync Synchronization

const DEFAULT_ELEVENLABS_VOICE_ID = "YIgPmt6aTfZFf6mjP9RC";
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

export interface SpeakOptions {
  voiceId?: string;
  apiKey?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export async function speakWithSarah(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  const voiceId = options.voiceId || import.meta.env.VITE_ELEVENLABS_VOICE_ID || DEFAULT_ELEVENLABS_VOICE_ID;
  const apiKey = options.apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;

  // Stop any currently playing speech immediately
  stopSarahSpeech();

  // 1. Try ElevenLabs Neural TTS if API key is configured
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
              style: 0.05,
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
        speakNaturalWebSpeech(text, options);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn("ElevenLabs synthesis fallback to WebSpeech:", err);
      speakNaturalWebSpeech(text, options);
      return;
    }
  }

  // 2. Fluid Web Speech API (One continuous, smooth, natural stream)
  speakNaturalWebSpeech(text, options);
}

/**
 * Continuous Web Speech Synthesis with natural human conversational cadence.
 * Speaks the text in one smooth utterance so the browser naturally pauses at punctuation.
 */
function speakNaturalWebSpeech(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  // Clean text formatting for smooth reading
  const cleanText = text
    .replace(/\s+/g, " ")
    .replace(/\b(\d+)\)/g, "$1.") // Convert "1)" to "1." for smooth natural numbering
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.98; // Natural, fluid human conversational pace
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.name.includes("Natural") || v.name.includes("Female") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-NG")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => {
    options.onEnd?.();
  };
  utterance.onerror = (e) => {
    options.onError?.(e);
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSarahSpeech() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
