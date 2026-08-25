import React from "react";
import type { MascotGesture } from "../types/mascot";

export type MascotLookDirection = "left" | "right" | "center" | "down" | "auto";

interface MascotVectorRigProps {
  gesture?: MascotGesture | string;
  lookDirection?: MascotLookDirection;
  size?: number;
  className?: string;
  alt?: string;
}

export default function MascotVectorRig({
  gesture = "idle",
  lookDirection = "auto",
  size = 96,
  className = "",
  alt = "Avo the Mascot",
}: MascotVectorRigProps) {
  const g = (gesture || "idle").toLowerCase();

  const isWaving = g === "waving" || g === "wave";
  const isWriting = g === "writing" || g === "write" || g === "notetaking";
  const isJumping = g === "jumping" || g === "jump" || g === "dancing";
  const isSad = g === "sad" || g === "concerned" || g === "scratching";
  const isThumbsUp = g === "thumbsup" || g === "pointing";
  const isDoubleThumbs = g === "double_thumbsup" || g === "clapping";

  // Determine effective look direction
  let effectiveLook = lookDirection;
  if (lookDirection === "auto") {
    if (isWriting) effectiveLook = "down";
    else if (isWaving) effectiveLook = "right";
    else if (isThumbsUp) effectiveLook = "right";
    else effectiveLook = "center";
  }

  return (
    <div
      className={`inline-block relative select-none pointer-events-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
      aria-label={alt}
      role="img"
    >
      <style>{`
        /* Natural Eye Blinking */
        @keyframes avoEyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.08); }
        }
        .avo-eyelid {
          transform-origin: center;
          animation: avoEyeBlink 3.4s ease-in-out infinite;
        }

        /* Dynamic Pupil Glance Looking Left/Right */
        @keyframes avoPupilLookCycle {
          0%, 35%, 100% { transform: translate(0, 0); }
          45%, 65% { transform: translate(3.5px, 0.5px); }
          75%, 90% { transform: translate(-3.5px, 0.5px); }
        }
        .avo-pupil-auto {
          animation: avoPupilLookCycle 6s ease-in-out infinite;
        }
        .avo-pupil-left {
          transform: translate(-4px, 0.5px);
        }
        .avo-pupil-right {
          transform: translate(4px, 0.5px);
        }
        .avo-pupil-down {
          transform: translate(-2px, 4px);
        }

        /* Torso Breathing Sway */
        @keyframes avoTorsoBreathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2.5px) scale(1.015); }
        }
        .avo-torso-idle {
          transform-origin: bottom center;
          animation: avoTorsoBreathe 3s ease-in-out infinite;
        }

        /* Dual-Arm Idle Swing */
        @keyframes avoLeftArmIdle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg) translateY(-1px); }
        }
        @keyframes avoRightArmIdle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg) translateY(-1px); }
        }
        .avo-left-arm-idle {
          transform-origin: 44px 90px;
          animation: avoLeftArmIdle 3s ease-in-out infinite;
        }
        .avo-right-arm-idle {
          transform-origin: 120px 90px;
          animation: avoRightArmIdle 3s ease-in-out infinite;
        }

        /* Waving Arm (Right) + Left Hip Counter-Bounce */
        @keyframes avoRightArmWave {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-26deg); }
          40% { transform: rotate(14deg); }
          60% { transform: rotate(-22deg); }
          80% { transform: rotate(10deg); }
        }
        @keyframes avoFingerFlutter {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(0.8) rotate(-8deg); }
        }
        @keyframes avoLeftHipBounce {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg) translateY(-2px); }
        }
        .avo-waving-right-arm {
          transform-origin: 120px 86px;
          animation: avoRightArmWave 1.1s ease-in-out infinite;
        }
        .avo-waving-fingers {
          transform-origin: 142px 46px;
          animation: avoFingerFlutter 0.55s ease-in-out infinite;
        }
        .avo-waving-left-hip {
          transform-origin: 44px 90px;
          animation: avoLeftHipBounce 1.1s ease-in-out infinite;
        }

        /* Dual-Arm Note Taking (Left holds Clipboard, Right writes with Pen) */
        @keyframes avoClipboardHold {
          0%, 100% { transform: rotate(-2deg) translateY(0); }
          50% { transform: rotate(1deg) translateY(-1.5px); }
        }
        @keyframes avoPenWriting {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-4px, 3px) rotate(-10deg); }
          40% { transform: translate(3px, -2px) rotate(8deg); }
          60% { transform: translate(-3px, -3px) rotate(-6deg); }
          80% { transform: translate(4px, 2px) rotate(6deg); }
        }
        .avo-clipboard-left {
          transform-origin: 44px 88px;
          animation: avoClipboardHold 2.5s ease-in-out infinite;
        }
        .avo-pen-right {
          transform-origin: 120px 88px;
          animation: avoPenWriting 0.6s ease-in-out infinite;
        }

        /* Victory Jump Physics (Both Arms Skyward) */
        @keyframes avoVictoryJump {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          20% { transform: translateY(4px) scale(1.1, 0.9); }
          50% { transform: translateY(-20px) scale(0.95, 1.12); }
          75% { transform: translateY(-6px) scale(1.02, 0.98); }
        }
        @keyframes avoLeftArmPump {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg) translateY(-4px); }
        }
        @keyframes avoRightArmPump {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg) translateY(-4px); }
        }
        .avo-jumping-body {
          transform-origin: bottom center;
          animation: avoVictoryJump 0.85s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
        }
        .avo-jump-left-arm {
          transform-origin: 44px 86px;
          animation: avoLeftArmPump 0.85s ease-in-out infinite;
        }
        .avo-jump-right-arm {
          transform-origin: 120px 86px;
          animation: avoRightArmPump 0.85s ease-in-out infinite;
        }

        /* Double Thumbs Up Both Arms Bouncing */
        @keyframes avoLeftThumbBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          40% { transform: scale(1.16) translateY(-5px) rotate(-4deg); }
          70% { transform: scale(0.98) translateY(1px); }
        }
        @keyframes avoRightThumbBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          40% { transform: scale(1.16) translateY(-5px) rotate(4deg); }
          70% { transform: scale(0.98) translateY(1px); }
        }
        .avo-left-thumbsup {
          transform-origin: 44px 90px;
          animation: avoLeftThumbBounce 0.8s ease-out infinite;
        }
        .avo-right-thumbsup {
          transform-origin: 120px 90px;
          animation: avoRightThumbBounce 0.8s ease-out infinite;
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
            <path
              d="M 52,175 C 44,175 38,181 42,185 C 46,188 64,188 68,185 C 70,181 64,175 56,175 Z"
              fill="#1f7a8c"
            />
            <path d="M 40,184 C 44,186 64,186 68,184" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

            <path
              d="M 104,175 C 96,175 90,181 94,185 C 98,188 116,188 120,185 C 122,181 116,175 108,175 Z"
              fill="#1f7a8c"
            />
            <path d="M 92,184 C 96,186 116,186 120,184" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Outer Avocado Body (Rind) */}
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

          {/* ============================================================ */}
          {/* EYES & DYNAMIC PUPIL LOOK DIRECTION (LEFT / RIGHT / DOWN)    */}
          {/* ============================================================ */}
          <g id="eyes" className="avo-eyelid">
            {/* Left Eye Socket */}
            <ellipse cx="62" cy="74" rx="7.5" ry="10.5" fill="#0f172a" />
            {/* Left Pupil + Speculars */}
            <g
              className={
                effectiveLook === "left"
                  ? "avo-pupil-left"
                  : effectiveLook === "right"
                  ? "avo-pupil-right"
                  : effectiveLook === "down"
                  ? "avo-pupil-down"
                  : "avo-pupil-auto"
              }
            >
              <circle cx="62" cy="74" r="5" fill="#1e293b" />
              <circle cx="60" cy="70" r="3" fill="#ffffff" />
              <circle cx="64" cy="76" r="1.5" fill="#ffffff" />
            </g>

            {/* Right Eye Socket */}
            <ellipse cx="98" cy="74" rx="7.5" ry="10.5" fill="#0f172a" />
            {/* Right Pupil + Speculars */}
            <g
              className={
                effectiveLook === "left"
                  ? "avo-pupil-left"
                  : effectiveLook === "right"
                  ? "avo-pupil-right"
                  : effectiveLook === "down"
                  ? "avo-pupil-down"
                  : "avo-pupil-auto"
              }
            >
              <circle cx="98" cy="74" r="5" fill="#1e293b" />
              <circle cx="96" cy="70" r="3" fill="#ffffff" />
              <circle cx="100" cy="76" r="1.5" fill="#ffffff" />
            </g>

            {/* Eyebrows */}
            {isSad ? (
              <>
                <path d="M 54,64 Q 62,60 70,66" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 90,66 Q 98,60 106,64" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : isWriting ? (
              // Focused note-taking eyebrows
              <>
                <path d="M 54,63 Q 62,59 70,64" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 90,64 Q 98,59 106,63" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
              </>
            ) : (
              // Happy welcoming eyebrows
              <>
                <path d="M 54,64 Q 62,58 70,63" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 90,63 Q 98,58 106,64" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* Mouth */}
          <g id="mouth">
            {isSad ? (
              <path d="M 72,96 Q 80,88 88,96" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
            ) : isJumping || isDoubleThumbs ? (
              <path
                d="M 68,88 Q 80,105 92,88 Z"
                fill="#b91c1c"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            ) : (
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
          {/* DUAL-ARM ARTICULATION & VISIBLE PEN + PAPER CLIPBOARD       */}
          {/* ============================================================ */}

          {/* 1. WRITING ON PEN & PAPER CLIPBOARD MODE (BOTH ARMS ACTIVE) */}
          {isWriting && (
            <g id="dual-arm-writing-rig">
              {/* LEFT ARM + WOODEN CLIPBOARD + RULED PAPER SHEET */}
              <g className="avo-clipboard-left">
                {/* Left Arm holding clipboard */}
                <path
                  d="M 44,88 C 28,94 22,116 34,130 C 40,136 52,128 48,114"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />

                {/* The Clinical Wooden Clipboard & Paper */}
                <g transform="translate(20, 95) rotate(-10)">
                  {/* Brown Wooden Board */}
                  <rect x="0" y="0" width="38" height="48" rx="4" fill="#b45309" stroke="#78350f" strokeWidth="2" />
                  {/* White Lined Paper Sheet */}
                  <rect x="3.5" y="4" width="31" height="40" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                  {/* Metallic Gold Clip at Top */}
                  <rect x="13" y="1" width="12" height="5" rx="1.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                  {/* Ruled Blue Notes Lines & Green Checkboxes */}
                  <line x1="7" y1="11" x2="30" y2="11" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="7" y1="18" x2="27" y2="18" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="7" y1="25" x2="29" y2="25" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="9" cy="32" r="2" fill="#10b981" />
                  <line x1="14" y1="32" x2="28" y2="32" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="9" cy="39" r="2" fill="#10b981" />
                  <line x1="14" y1="39" x2="26" y2="39" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Hand gripping side of board */}
                  <circle cx="34" cy="24" r="4.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                </g>
              </g>

              {/* RIGHT ARM + GOLDEN PEN (ACTIVELY SCRIBBLING ON PAPER) */}
              <g className="avo-pen-right">
                <path
                  d="M 120,88 C 128,102 112,122 72,120"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Hand Fist gripping pen */}
                <circle cx="70" cy="120" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                {/* Golden Clinical Pen Body */}
                <line x1="82" y1="106" x2="60" y2="132" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                {/* Silver Pen Tip */}
                <line x1="63" y1="128" x2="58" y2="134" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                {/* Blue Ink Point touching paper */}
                <circle cx="58" cy="134" r="1.5" fill="#0284c7" />
              </g>
            </g>
          )}

          {/* 2. WAVING HAND (RIGHT ARM WAVES WITH FINGERS, LEFT RESTS ON HIP) */}
          {isWaving && (
            <g id="dual-arm-waving-rig">
              {/* Left Arm on Hip (Active Breathing Flexion) */}
              <g className="avo-waving-left-hip">
                <path
                  d="M 44,90 C 30,98 32,120 46,124"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <circle cx="48" cy="124" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
              </g>

              {/* Right Arm Waving Side-to-Side */}
              <g className="avo-waving-right-arm">
                <path
                  d="M 120,86 C 134,80 144,60 142,46"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Hand + 4 Articulated Flutter Fingers */}
                <g className="avo-waving-fingers">
                  <circle cx="142" cy="46" r="6" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                  <line x1="140" y1="41" x2="137" y2="33" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="143" y1="40" x2="143" y2="31" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="146" y1="41" x2="148" y2="33" stroke="#1b4332" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="147" y1="45" x2="152" y2="41" stroke="#1b4332" strokeWidth="2" strokeLinecap="round" />
                </g>
              </g>
            </g>
          )}

          {/* 3. THUMBS UP / DOUBLE THUMBS UP (BOTH ARMS ACTIVE) */}
          {(isThumbsUp || isDoubleThumbs) && (
            <g id="dual-arm-thumbsup-rig">
              {/* Left Arm: Thumbs up on the left */}
              <g className="avo-left-thumbsup">
                <path
                  d="M 44,90 C 26,84 20,72 26,62"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <circle cx="26" cy="62" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                {/* Left Thumb Up */}
                <path d="M 26,62 L 26,50" stroke="#1b4332" strokeWidth="4.5" strokeLinecap="round" />
                <circle cx="18" cy="46" r="2.5" fill="#f59e0b" />
              </g>

              {/* Right Arm: Big Energetic Thumb Up */}
              <g className="avo-right-thumbsup">
                <path
                  d="M 120,90 C 138,84 144,72 138,62"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <circle cx="138" cy="62" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                {/* Right Thumb Up */}
                <path d="M 138,62 L 138,50" stroke="#1b4332" strokeWidth="4.5" strokeLinecap="round" />
                {/* Sparkle Star */}
                <path
                  d="M 148,46 L 150,40 L 152,46 L 158,48 L 152,50 L 150,56 L 148,50 L 142,48 Z"
                  fill="#f59e0b"
                />
              </g>
            </g>
          )}

          {/* 4. VICTORY JUMP (BOTH ARMS SKYWARD WITH FIST PUMPS) */}
          {isJumping && (
            <g id="dual-arm-jump-rig">
              <g className="avo-jump-left-arm">
                <path
                  d="M 44,86 C 26,72 24,46 36,34"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <circle cx="36" cy="34" r="6" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
              </g>

              <g className="avo-jump-right-arm">
                <path
                  d="M 120,86 C 138,72 140,46 128,34"
                  stroke="#1b4332"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <circle cx="128" cy="34" r="6" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
              </g>

              {/* Sparkles around head */}
              <circle cx="48" cy="22" r="2.5" fill="#f59e0b" />
              <circle cx="116" cy="22" r="2.5" fill="#f59e0b" />
              <circle cx="80" cy="8" r="3" fill="#10b981" />
            </g>
          )}

          {/* 5. DEFAULT IDLE / SAD ARMS (BOTH ARMS GENTLY SWINGING) */}
          {!isWriting && !isWaving && !isThumbsUp && !isDoubleThumbs && !isJumping && (
            <g id="dual-arm-idle-rig">
              {isSad ? (
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
                <>
                  {/* Left Arm Gentle Idle Swing */}
                  <g className="avo-left-arm-idle">
                    <path
                      d="M 44,90 C 30,105 32,130 42,138"
                      stroke="#1b4332"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <circle cx="43" cy="138" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                  </g>

                  {/* Right Arm Gentle Idle Swing */}
                  <g className="avo-right-arm-idle">
                    <path
                      d="M 120,90 C 134,105 132,130 122,138"
                      stroke="#1b4332"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <circle cx="121" cy="138" r="5.5" fill="#a7c957" stroke="#1b4332" strokeWidth="2" />
                  </g>
                </>
              )}
            </g>
          )}
        </g>

        {/* Gradients */}
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
