// Voice Synthesis Service for Sarah, The Nutrition Assistant
// Supports ElevenLabs Neural TTS with automatic caching and Web Speech API fallback

const DEFAULT_ELEVENLABS_VOICE_ID = "YIgPmt6aTfZFf6mjP9RC";
const audioCache = new Map<string, string>();
let currentAudio: HTMLAudioElement | null = null;

interface SpeakOptions {
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

  // Stop any currently playing speech
  stopSarahSpeech();

  // Try ElevenLabs if API key is provided
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
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
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

      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onplay = () => options.onStart?.();
      audio.onended = () => {
        options.onEnd?.();
        currentAudio = null;
      };
      audio.onerror = (e) => {
        console.warn("Audio playback error, falling back to WebSpeech:", e);
        fallbackWebSpeech(text, options);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn("ElevenLabs synthesis error, falling back to WebSpeech:", err);
      fallbackWebSpeech(text, options);
      return;
    }
  }

  // Fallback to Browser Speech Synthesis if no API key is provided
  fallbackWebSpeech(text, options);
}

function fallbackWebSpeech(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.name.includes("Female") || v.name.includes("Natural") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-NG")) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
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
