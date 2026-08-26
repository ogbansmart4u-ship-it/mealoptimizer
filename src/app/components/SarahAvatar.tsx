import React, { useEffect, useState, useRef } from "react";

export type VisemeShape = "closed" | "small" | "medium" | "wide" | "o_shape";

interface SarahAvatarProps {
  isSpeaking: boolean;
  viseme?: VisemeShape;
  size?: number;
  className?: string;
}

export default function SarahAvatar({
  isSpeaking,
  viseme = "closed",
  size = 140,
  className = "",
}: SarahAvatarProps) {
  const [blink, setBlink] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const [internalViseme, setInternalViseme] = useState<VisemeShape>("closed");
  const mouthTimerRef = useRef<any>(null);

  // Micro-blinking loop (every 3.5 - 5 seconds)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, Math.random() * 2000 + 3500);

    return () => clearInterval(blinkInterval);
  }, []);

  // Subtle natural head sway while speaking
  useEffect(() => {
    if (isSpeaking) {
      const swayInterval = setInterval(() => {
        setHeadTilt((prev) => (prev === 1.5 ? -1.5 : 1.5));
      }, 1200);
      return () => clearInterval(swayInterval);
    } else {
      setHeadTilt(0);
      setInternalViseme("closed");
    }
  }, [isSpeaking]);

  // Real-time lip-sync mouth shape synthesizer when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setInternalViseme("closed");
      if (mouthTimerRef.current) clearInterval(mouthTimerRef.current);
      return;
    }

    const shapes: VisemeShape[] = ["small", "medium", "wide", "small", "o_shape", "medium", "closed"];
    let shapeIdx = 0;

    mouthTimerRef.current = setInterval(() => {
      shapeIdx = (shapeIdx + 1) % shapes.length;
      setInternalViseme(shapes[shapeIdx]);
    }, 110);

    return () => {
      if (mouthTimerRef.current) clearInterval(mouthTimerRef.current);
    };
  }, [isSpeaking]);

  const activeViseme = viseme !== "closed" ? viseme : internalViseme;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: `rotate(${headTilt}deg)`,
        transition: "transform 0.8s ease-in-out",
      }}
    >
      {/* Outer Halo Glow when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400/30 to-emerald-400/40 blur-xl animate-pulse scale-110 pointer-events-none" />
      )}

      {/* SVG Vector Render of Sarah */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78472a" />
            <stop offset="50%" stopColor="#63371e" />
            <stop offset="100%" stopColor="#4f2913" />
          </linearGradient>

          <linearGradient id="scrubsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f7a8c" />
            <stop offset="100%" stopColor="#0f4955" />
          </linearGradient>

          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1f1a17" />
            <stop offset="100%" stopColor="#0d0a08" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Circular Background Badge */}
        <circle cx="100" cy="100" r="94" fill="#091e24" stroke="#1f7a8c" strokeWidth="3" />
        <circle cx="100" cy="100" r="90" fill="url(#scrubsGrad)" opacity="0.15" />

        {/* Hair Bun / Braided Crown (Behind) */}
        <ellipse cx="100" cy="52" rx="36" ry="24" fill="url(#hairGrad)" />
        <ellipse cx="100" cy="42" rx="26" ry="16" fill="#140f0c" stroke="#2b201a" strokeWidth="2" />

        {/* Neck */}
        <path d="M 88 120 L 88 148 Q 100 152 112 148 L 112 120 Z" fill="url(#skinGrad)" />

        {/* Clinical Teal Lab Coat / Collar */}
        <path
          d="M 52 195 L 56 160 Q 75 146 100 150 Q 125 146 144 160 L 148 195 Z"
          fill="url(#scrubsGrad)"
          stroke="#14b8a6"
          strokeWidth="1.5"
        />

        {/* White Lab Coat Lapels */}
        <path d="M 64 160 L 84 195 L 72 195 L 56 160 Z" fill="#f8fafc" opacity="0.95" />
        <path d="M 136 160 L 116 195 L 128 195 L 144 160 Z" fill="#f8fafc" opacity="0.95" />

        {/* Stethoscope */}
        <path
          d="M 76 150 Q 72 175 90 186 Q 100 192 110 186 Q 128 175 124 150"
          stroke="#94a3b8"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="100" cy="188" r="6" fill="#0d9488" stroke="#f1f5f9" strokeWidth="2" />

        {/* Head / Face Oval */}
        <ellipse cx="100" cy="98" rx="38" ry="46" fill="url(#skinGrad)" />

        {/* Hair Front Side Strands / Braided Sweep */}
        <path
          d="M 62 82 Q 62 60 100 56 Q 138 60 138 82 Q 134 68 100 64 Q 66 68 62 82 Z"
          fill="url(#hairGrad)"
        />
        <path d="M 62 82 Q 60 110 65 124 Q 68 110 66 84 Z" fill="url(#hairGrad)" />
        <path d="M 138 82 Q 140 110 135 124 Q 132 110 134 84 Z" fill="url(#hairGrad)" />

        {/* Gold Earrings */}
        <circle cx="59" cy="108" r="3.5" fill="url(#goldGrad)" />
        <circle cx="141" cy="108" r="3.5" fill="url(#goldGrad)" />

        {/* Eyebrows */}
        <path d="M 76 78 Q 85 74 94 77" stroke="#1c130d" strokeWidth="3" strokeLinecap="round" />
        <path d="M 106 77 Q 115 74 124 78" stroke="#1c130d" strokeWidth="3" strokeLinecap="round" />

        {/* Eyes (Blinking animation) */}
        {!blink ? (
          <>
            {/* Left Eye */}
            <ellipse cx="85" cy="88" rx="6" ry="4.5" fill="#ffffff" />
            <circle cx="85.5" cy="88" r="3" fill="#26170d" />
            <circle cx="87" cy="86.5" r="1.2" fill="#ffffff" />
            {/* Right Eye */}
            <ellipse cx="115" cy="88" rx="6" ry="4.5" fill="#ffffff" />
            <circle cx="114.5" cy="88" r="3" fill="#26170d" />
            <circle cx="116" cy="86.5" r="1.2" fill="#ffffff" />
          </>
        ) : (
          <>
            {/* Blinking Eyelid Lines */}
            <path d="M 79 88 Q 85 91 91 88" stroke="#1c130d" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 109 88 Q 115 91 121 88" stroke="#1c130d" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Nose */}
        <path d="M 100 89 L 98 103 Q 100 106 104 103" stroke="#48240f" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Cheeks / Blush */}
        <ellipse cx="76" cy="104" rx="5" ry="3" fill="#994d30" opacity="0.4" />
        <ellipse cx="124" cy="104" rx="5" ry="3" fill="#994d30" opacity="0.4" />

        {/* ============================================================ */}
        {/* DYNAMIC LIP-SYNC MOUTH SHAPES (Real-time Speech Synthesis)  */}
        {/* ============================================================ */}
        {activeViseme === "closed" && (
          // Neutral Friendly Smile
          <path
            d="M 88 120 Q 100 128 112 120"
            stroke="#9f2d3d"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="#5c111e"
          />
        )}

        {activeViseme === "small" && (
          // Slightly open mouth (M, N, Consonants)
          <g>
            <path d="M 88 118 Q 100 114 112 118 Q 100 128 88 118 Z" fill="#5c111e" stroke="#9f2d3d" strokeWidth="2" />
            <path d="M 91 118 Q 100 116 109 118" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {activeViseme === "medium" && (
          // Medium Open Mouth (E, I, General vowels)
          <g>
            <ellipse cx="100" cy="122" rx="11" ry="6" fill="#4a0d17" stroke="#b91c1c" strokeWidth="2" />
            <path d="M 92 120 Q 100 117 108 120" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {activeViseme === "wide" && (
          // Wide Open Mouth (A, Ah sounds)
          <g>
            <ellipse cx="100" cy="123" rx="13" ry="9" fill="#3b0810" stroke="#dc2626" strokeWidth="2" />
            <path d="M 90 119 Q 100 116 110 119" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="100" cy="127" rx="7" ry="3" fill="#e11d48" opacity="0.8" />
          </g>
        )}

        {activeViseme === "o_shape" && (
          // Round O / U / W sound
          <g>
            <ellipse cx="100" cy="123" rx="7.5" ry="9" fill="#3b0810" stroke="#dc2626" strokeWidth="2.5" />
            <ellipse cx="100" cy="126" rx="4" ry="2.5" fill="#e11d48" opacity="0.7" />
          </g>
        )}
      </svg>
    </div>
  );
}
