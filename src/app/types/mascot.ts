// Mascot ("Avo") gesture system — shared types + per-gesture animation config.
//
// The app ships with a single mascot image (`/assets/mascot.png`) animated with
// plain CSS keyframes — the same dependency-free approach used by MascotLoader,
// which is proven to work here. Each gesture maps to a CSS `animation` shorthand;
// the keyframes themselves live in MASCOT_KEYFRAMES below and are injected once by
// the Mascot component.
//
// LOTTIE-READY: if you later export real Lottie animations, add a JSON path per
// gesture in `lottieSources` and wire `lottie-react` inside Mascot.tsx — the rest
// of the system (context, hook, triggers) needs no changes.

export type MascotGesture =
  | "idle"
  | "waving"
  | "scratching"
  | "thumbsup"
  | "double_thumbsup"
  | "writing"
  | "jumping"
  | "sad"
  | "clapping"
  | "dancing"
  | "running"
  | "pointing"
  | "neutral";

export interface GestureConfig {
  /** CSS `animation` shorthand applied to the mascot image for this gesture. */
  css: string;
  /**
   * How the gesture behaves after it fires:
   *  - "persistent": stays until something changes it (idle, running, scratching, dancing, sad)
   *  - a number: milliseconds to play, then auto-revert to `idle` (waving, thumbsup, writing, jumping)
   */
  hold: "persistent" | number;
}

// Per-gesture animation. Transform-only (no layout shifts).
export const GESTURES: Record<MascotGesture, GestureConfig> = {
  idle:            { css: "avoIdle 3.5s ease-in-out infinite",       hold: "persistent" },
  neutral:         { css: "avoIdle 3.5s ease-in-out infinite",       hold: "persistent" },
  waving:          { css: "avoWave 0.9s ease-in-out infinite",       hold: 1600 },
  writing:         { css: "avoWrite 0.7s ease-in-out infinite",      hold: 2000 },
  jumping:         { css: "avoJump 0.75s cubic-bezier(0.17,0.89,0.32,1.28) infinite", hold: 1800 },
  sad:             { css: "avoSad 2.5s ease-in-out infinite",        hold: 2500 },
  thumbsup:        { css: "avoPop 0.6s ease-out infinite",           hold: 1200 },
  double_thumbsup: { css: "avoDoublePop 0.55s ease-out infinite",    hold: 1400 },
  scratching:      { css: "avoScratch 0.5s ease-in-out infinite",    hold: "persistent" },
  clapping:        { css: "avoClap 0.5s ease-in-out infinite",       hold: 1600 },
  dancing:         { css: "avoDance 0.8s ease-in-out infinite",      hold: "persistent" },
  running:         { css: "avoRun 0.6s ease-in-out infinite",        hold: "persistent" },
  pointing:        { css: "avoPop 0.6s ease-out infinite",           hold: 1200 },
};

// Keyframes for every gesture, plus a reduced-motion opt-out. Injected once.
export const MASCOT_KEYFRAMES = `
@keyframes avoIdle {
  0%, 100% { transform: rotate(-2deg) translateY(0); }
  50%      { transform: rotate(2deg) translateY(-3px); }
}
@keyframes avoWave {
  0%, 100% { transform: rotate(0deg); }
  15%      { transform: rotate(-18deg); }
  30%      { transform: rotate(14deg); }
  45%      { transform: rotate(-14deg); }
  60%      { transform: rotate(10deg); }
  75%      { transform: rotate(-6deg); }
}
@keyframes avoWrite {
  0%, 100% { transform: rotate(-3deg) translateY(0) scale(1.03); }
  25%      { transform: rotate(-7deg) translateY(2px) scale(1.05); }
  50%      { transform: rotate(-2deg) translateY(-1px) scale(1.03); }
  75%      { transform: rotate(-6deg) translateY(2px) scale(1.04); }
}
@keyframes avoJump {
  0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
  30%      { transform: translateY(-16px) scale(1.18) rotate(6deg); }
  60%      { transform: translateY(-8px) scale(1.08) rotate(-4deg); }
  85%      { transform: translateY(2px) scale(0.96) rotate(0deg); }
}
@keyframes avoSad {
  0%, 100% { transform: translateY(3px) rotate(-6deg) scale(0.96); filter: grayscale(15%); }
  50%      { transform: translateY(5px) rotate(-8deg) scale(0.94); filter: grayscale(25%); }
}
@keyframes avoScratch {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25%      { transform: translateX(-3px) rotate(-4deg); }
  75%      { transform: translateX(3px) rotate(4deg); }
}
@keyframes avoPop {
  0%   { transform: scale(1) rotate(0deg); }
  40%  { transform: scale(1.22) rotate(7deg); }
  70%  { transform: scale(0.95) rotate(-3deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes avoDoublePop {
  0%, 100% { transform: scale(1) translateY(0); }
  35%      { transform: scale(1.25) translateY(-8px) rotate(4deg); }
  70%      { transform: scale(1.15) translateY(-4px) rotate(-3deg); }
}
@keyframes avoClap {
  0%, 100% { transform: scale(1) translateY(0); }
  50%      { transform: scale(1.14) translateY(-7px); }
}
@keyframes avoDance {
  0%   { transform: rotate(-11deg) translateX(-5px) translateY(0); }
  50%  { transform: rotate(11deg) translateX(5px) translateY(-7px); }
  100% { transform: rotate(-11deg) translateX(-5px) translateY(0); }
}
@keyframes avoRun {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50%      { transform: translateY(-9px) rotate(3deg); }
}
@media (prefers-reduced-motion: reduce) {
  .avo-mascot { animation: none !important; }
}
`;

// LOTTIE-READY seam. Fill these in (e.g. "/mascot/waving.json") once you have real
// Lottie exports; Mascot.tsx will prefer a Lottie source when one is present.
export const lottieSources: Partial<Record<MascotGesture, string>> = {};
