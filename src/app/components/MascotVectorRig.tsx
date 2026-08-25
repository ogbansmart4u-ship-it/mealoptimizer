import React from "react";
import type { MascotGesture } from "../types/mascot";

interface MascotVectorRigProps {
  gesture: MascotGesture | string;
  size?: number;
  className?: string;
  alt?: string;
}

export default function MascotVectorRig({
  gesture = "idle",
  size = 96,
  className = "",
  alt = "Avo the Mascot",
}: MascotVectorRigProps) {
  const g = gesture.toLowerCase();

  const isWaving = g === "waving" || g === "wave";
  const isWriting = g === "writing" || g === "write" || g === "notetaking";
  const isJumping = g === "jumping" || g === "jump" || g === "dancing";
  const isSad = g === "sad" || g === "concerned" || g === "scratching";
  const isThumbsUp = g === "thumbsup" || g === "pointing";
  const isDoubleThumbs = g === "double_thumbsup" || g === "clapping";

  return (
    <div
      className={`inline-block relative select-none pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
      aria-label={alt}
      role="img"
    >
      <style>{`
        /* Natural Eye Blink */
        @keyframes avoEyeBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }
        .avo-eyelid {
          transform-origin: center;
          animation: avoEyeBlink 3.6s ease-in-out infinite;
        }

        /* Subtle Torso Breathing */
        @keyframes avoTorsoBreathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.015); }
        }
        .avo-torso-idle {
          transform-origin: bottom center;
          animation: avoTorsoBreathe 3s ease-in-out infinite;
        }

        /* Real Arm Wave with Moving Fingers */
        @keyframes avoArmWave {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-28deg); }
          40% { transform: rotate(14deg); }
          60% { transform: rotate(-24deg); }
          80% { transform: rotate(8deg); }
        }
        @keyframes avoFingerWave {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.85) rotate(-6deg); }
        }
        .avo-waving-arm {
          transform-origin: 122px 85px;
          animation: avoArmWave 1.1s ease-in-out infinite;
        }
        .avo-waving-hand {
          transform-origin: 142px 52px;
          animation: avoFingerWave 0.55s ease-in-out infinite;
        }

        /* Real Stylus Pen Writing on Tablet */
        @keyframes avoPenScribble {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-3px, 4px) rotate(-8deg); }
          50% { transform: translate(4px, -2px) rotate(6deg); }
          75% { transform: translate(-2px, -3px) rotate(-4deg); }
        }
        .avo-stylus-writing {
          transform-origin: 90px 105px;
          animation: avoPenScribble 0.45s ease-in-out infinite;
        }

        /* Victory Jump Physics */
        @keyframes avoVictoryJump {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          20% { transform: translateY(4px) scale(1.1, 0.9); }
          50% { transform: translateY(-18px) scale(0.95, 1.12); }
          75% { transform: translateY(-6px) scale(1.02, 0.98); }
        }
        .avo-jumping-body {
          transform-origin: bottom center;
          animation: avoVictoryJump 0.85s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
        }

        /* Sad & Empathetic Droop */
        @keyframes avoSadDroop {
          0%, 100% { transform: translateY(3px) rotate(-4deg); }
          50% { transform: translateY(5px) rotate(-6deg); }
        }
        .avo-sad-body {
          transform-origin: bottom center;
          animation: avoSadDroop 2.8s ease-in-out infinite;
        }

        /* Thumbs Up Pop Bounce */
        @keyframes avoThumbBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          40% { transform: scale(1.18) translateY(-6px); }
          70% { transform: scale(0.98) translateY(1px); }
        }
        .avo-thumbsup-arm {
          transform-origin: 120px 92px;
          animation: avoThumbBounce 0.8s ease-out infinite;
        }

        /* Seed Pulse */
        @keyframes avoSeedPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        .avo-seed-heart {
          transform-origin: 80px 125px;
          animation: avoSeedPulse 2.4s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 160 195"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow underneath */}
        <ellipse cx="80" cy="186" rx={isJumping ? "30" : "42"} ry="7" fill="#0f172a" opacity="0.16" />

        {/* Root Animated Body Group */}
        <g
          className={
            isJumping
              ? "avo-jumping-body"
              : isSad
              ? "avo-sad-body"
              : "avo-torso-idle"
          }
        >
          {/* Feet / Shoes */}
          <g id="feet">
            {/* Left Shoe */}
            <path
              d="M 52,175 C 44,175 38,181 42,185 C 46,188 64,188 68,185 C 70,181 64,175 56,175 Z"
              fill="#1f7a8c"
            />
            <path d="M 40,184 C 44,186 64,186 68,184" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

            {/* Right Shoe */}
            <path
              d="M 104,175 C 96,175 90,181 94,185 C 98,188 116,188 120,185 C 122,181 116,175 108,175 Z"
              fill="#1f7a8c"
            />
            <path d="M 92,184 C 96,186 116,186 120,184" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Outer Avocado Body (Rind / Skin) */}
          <path
            d="M 80,22 C 108,22 124,48 128,82 C 134,120 128,165 102,176 C 82,182 54,176 46,154 C 38,120 38,82 46,48 C 54,22 66,22 80,22 Z"
            fill="url(#avoRindGrad)"
            stroke="#143625"
            strokeWidth="3.5"
          />

          {/* Inner Avocado Flesh */}
          <path
            d="M 80,30 C 102,30 116,52 119,84 C 125,118 119,158 98,168 C 80,174 56,168 49,148 C 42,118 42,84 49,52 C 56,30 66,30 80,30 Z"
            fill="url(#avoFleshGrad)"
          />

          {/* Seed Heart (The Brown Core) */}
          <ellipse
            cx="80"
            cy="130"
            rx="27"
            ry="33"
            fill="url(#avoSeedGrad)"
            stroke="#78350f"
            strokeWidth="2"
            className="avo-seed-heart"
          />
          {/* Seed Specular Highlight */}
          <path
            d="M 68,115 C 72,110 80,108 86,110 C 82,114 74,118 70,124 Z"
            fill="#ffffff"
            opacity="0.35"
          />

          {/* Rosy Cheeks */}
          <ellipse cx="54" cy="88" rx="7" ry="4" fill={isSad ? "#94a3b8" : "#fb7185"} opacity="0.45" />
          <ellipse cx="106" cy="88" rx="7" ry="4" fill={isSad ? "#94a3b8" : "#fb7185"} opacity="0.45" />

          {/* Eyes & Eyebrows */}
          <g id="eyes" className="avo-eyelid">
            {/* Left Eye */}
            <ellipse cx="62" cy="74" rx="7" ry="10" fill="#0f172a" />
            <circle cx="60" cy="70" r="3" fill="#ffffff" />
            <circle cx="64" cy="76" r="1.5" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="98" cy="74" rx="7" ry="10" fill="#0f172a" />
            <circle cx="96" cy="70" r="3" fill="#ffffff" />
            <circle cx="100" cy="76" r="1.5" fill="#ffffff" />

            {/* Eyebrows */}
            {isSad ? (
              // Sad / Concerned Eyebrows
              <>
                <path d="M 54,64 Q 62,60 70,66" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 90,66 Q 98,60 106,64" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              // Happy Eyebrows
              <>
                <path d="M 54,64 Q 62,58 70,63" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 90,63 Q 98,58 106,64" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* Mouth */}
          <g id="mouth">
            {isSad ? (
              // Sad / Pout Mouth
              <path d="M 72,96 Q 80,88 88,96" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
            ) : isJumping || isDoubleThumbs ? (
              // Big Open Victory Smile
              <path
                d="M 68,88 Q 80,105 92,88 Z"
                fill="#b91c1c"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            ) : (
              // Warm Happy Smile
              <path
                d="M 70,89 Q 80,100 90,89"
                stroke="#0f172a"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* ============================================================ */}
          {/* ARMS & PROPS (DYNAMIC DEPENDING ON GESTURE)                   */}
          {/* ============================================================ */}

          {/* 1. TABLET & NOTE-TAKING MODE */}
          {isWriting && (
            <g id="tablet-writing-rig">
              {/* Left Arm holding glowing tablet */}
              <path
                d="M 44,88 C 30,94 24,115 36,128 C 42,134 54,126 50,112"
                stroke="#1b4332"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* The Glowing Digital Tablet */}
              <g transform="translate(24, 98) rotate(-12)">
                <rect x="0" y="0" width="34" height="44" rx="5" fill="#1f7a8c" stroke="#0d9488" strokeWidth="2" />
                <rect x="3" y="3" width="28" height="38" rx="3" fill="#e0f2fe" />
                {/* Checklines on screen */}
                <line x1="7" y1="9" x2="27" y2="9" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <line x1="7" y1="16" x2="24" y2="16" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <line x1="7" y1="23" x2="26" y2="23" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="30" r="2" fill="#10b981" />
                <line x1="14" y1="30" x2="25" y2="30" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Right Arm holding Golden Stylus Pen & Scribbling */}
              <g className="avo-stylus-writing">
                <path
                  d="M 122,88 C 128,102 110,120 78,118"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Hand */}
                <circle cx="76" cy="118" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                {/* Golden Stylus Pen */}
                <line x1="84" y1="106" x2="66" y2="128" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                <circle cx="66" cy="128" r="1.5" fill="#38bdf8" />
              </g>
            </g>
          )}

          {/* 2. WAVING HAND MODE (True 1-Hand Wave with Moving Fingers) */}
          {isWaving && (
            <g id="waving-rig">
              {/* Left hand resting quietly on hip */}
              <path
                d="M 44,90 C 32,96 34,118 46,122"
                stroke="#1b4332"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="48" cy="122" r="5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />

              {/* Right Arm Animated Wave */}
              <g className="avo-waving-arm">
                <path
                  d="M 120,86 C 134,80 144,60 142,48"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Hand + 4 Waving Fingers */}
                <g className="avo-waving-hand">
                  <circle cx="142" cy="46" r="6" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                  {/* Fingers */}
                  <line x1="140" y1="41" x2="137" y2="34" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="143" y1="40" x2="143" y2="32" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="146" y1="41" x2="148" y2="34" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="147" y1="45" x2="152" y2="42" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
                </g>
              </g>
            </g>
          )}

          {/* 3. THUMBS UP / DOUBLE THUMBS UP MODE */}
          {(isThumbsUp || isDoubleThumbs) && (
            <g id="thumbsup-rig">
              {/* Left Arm: Thumbs up if double, else on hip */}
              {isDoubleThumbs ? (
                <g className="avo-thumbsup-arm" style={{ transformOrigin: "40px 92px" }}>
                  <path
                    d="M 44,90 C 26,84 20,72 26,62"
                    stroke="#1b4332"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <circle cx="26" cy="62" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                  {/* Thumb Up */}
                  <path d="M 26,62 L 26,52" stroke="#1b4332" strokeWidth="4" strokeLinecap="round" />
                </g>
              ) : (
                <>
                  <path
                    d="M 44,90 C 32,96 34,118 46,122"
                    stroke="#1b4332"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <circle cx="48" cy="122" r="5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                </>
              )}

              {/* Right Arm: Big Energetic Thumb Up */}
              <g className="avo-thumbsup-arm">
                <path
                  d="M 120,90 C 138,84 144,72 138,62"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Hand Fist */}
                <circle cx="138" cy="62" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                {/* Big Thumb Pointing Straight Up */}
                <path d="M 138,62 L 138,50" stroke="#1b4332" strokeWidth="4.5" strokeLinecap="round" />
                {/* Sparkle star next to thumb */}
                <path
                  d="M 148,46 L 150,40 L 152,46 L 158,48 L 152,50 L 150,56 L 148,50 L 142,48 Z"
                  fill="#f59e0b"
                />
              </g>
            </g>
          )}

          {/* 4. JUMPING CELEBRATION MODE (Arms Raised High in Victory) */}
          {isJumping && (
            <g id="victory-arms-rig">
              <path
                d="M 44,86 C 26,72 24,46 36,36"
                stroke="#1b4332"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="36" cy="36" r="6" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />

              <path
                d="M 120,86 C 138,72 140,46 128,36"
                stroke="#1b4332"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx="128" cy="36" r="6" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />

              {/* Sparkles around head */}
              <circle cx="48" cy="24" r="2.5" fill="#f59e0b" />
              <circle cx="116" cy="24" r="2.5" fill="#f59e0b" />
              <circle cx="80" cy="10" r="3" fill="#10b981" />
            </g>
          )}

          {/* 5. DEFAULT IDLE / SAD MODE ARMS */}
          {!isWriting && !isWaving && !isThumbsUp && !isDoubleThumbs && !isJumping && (
            <g id="idle-arms-rig">
              {isSad ? (
                // Hands clasped over chest in concern
                <>
                  <path
                    d="M 44,90 C 40,110 65,116 74,112"
                    stroke="#1b4332"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 120,90 C 124,110 99,116 86,112"
                    stroke="#1b4332"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                  />
                  <circle cx="80" cy="112" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                </>
              ) : (
                // Relaxed Idle Arms
                <>
                  <path
                    d="M 44,90 C 30,105 32,130 42,138"
                    stroke="#1b4332"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <circle cx="43" cy="138" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />

                  <path
                    d="M 120,90 C 134,105 132,130 122,138"
                    stroke="#1b4332"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <circle cx="121" cy="138" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                </>
              )}
            </g>
          )}
        </g>

        {/* Linear & Radial Gradients */}
        <defs>
          <linearGradient id="avoRindGrad" x1="40" y1="20" x2="130" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2d6a4f" />
            <stop offset="60%" stopColor="#1b4332" />
            <stop offset="100%" stopColor="#081c15" />
          </linearGradient>

          <linearGradient id="avoFleshGrad" x1="50" y1="30" x2="120" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d8f3dc" />
            <stop offset="40%" stopColor="#b7e4c7" />
            <stop offset="85%" stopColor="#a7c957" />
            <stop offset="100%" stopColor="#90a955" />
          </linearGradient>

          <radialGradient id="avoSeedGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="90%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
