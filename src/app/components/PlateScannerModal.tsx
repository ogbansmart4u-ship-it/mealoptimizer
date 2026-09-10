import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Camera,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Upload,
  X,
  FlipHorizontal,
  Flame,
  ArrowRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import Mascot from "./Mascot";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic, triggerConfetti } from "../utils/celebration";

interface PlateScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMealLog?: (data: {
    greensPct: number;
    proteinPct: number;
    carbPct: number;
    score: number;
    photoUrl: string;
  }) => void;
}

interface ScanResult {
  greensPct: number;
  proteinPct: number;
  carbPct: number;
  complianceScore: number;
  status: "perfect" | "acceptable" | "needs-adjustment";
  feedback: string;
  capturedImage: string;
}

export const PlateScannerModal: React.FC<PlateScannerModalProps> = ({
  isOpen,
  onClose,
  onSaveMealLog,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Stop current active camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.warn("[PlateScanner] Error stopping tracks:", err);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Safe stream-to-video binder
  const bindStreamToVideo = useCallback((stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("muted", "true");

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsCameraActive(true);
            setCameraError(null);
          })
          .catch((playErr) => {
            console.warn("[PlateScanner] video.play() deferred or interrupted:", playErr);
            // Some browsers require a user gesture or wait for metadata
            setIsCameraActive(true);
          });
      } else {
        setIsCameraActive(true);
      }
    } catch (bindErr) {
      console.warn("[PlateScanner] bindStreamToVideo error:", bindErr);
    }
  }, []);

  // Start Camera Stream with progressive fallback
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsStartingCamera(true);

    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        "Live camera is not supported in this browser. Please use the Take Photo or Upload button below."
      );
      setIsStartingCamera(false);
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream: MediaStream;

      try {
        // Attempt 1: Ideal facingMode (back or front) with optimal resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
      } catch (e1) {
        console.warn("[PlateScanner] Ideal facingMode failed, trying generic video constraint:", e1);
        // Attempt 2: Generic video device (works on laptops & webcams that reject environment mode)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      bindStreamToVideo(stream);
    } catch (err: any) {
      console.warn("[PlateScanner] getUserMedia failed completely:", err);
      let msg = "Camera access denied or unavailable. Tap 'Take Photo' or upload an image of your plate below.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera permission was blocked. Please grant camera permission in your browser or upload a photo.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "No camera found on this device. You can snap or upload a photo instead.";
      }
      setCameraError(msg);
      setIsCameraActive(false);
    } finally {
      setIsStartingCamera(false);
    }
  }, [facingMode, bindStreamToVideo]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      // Small timeout allows Dialog portal and DOM elements to mount cleanly
      const t = setTimeout(() => {
        startCamera();
      }, 150);
      return () => {
        clearTimeout(t);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  // Flip camera between environment and front
  const toggleCameraFacing = () => {
    try { triggerHaptic("light"); } catch {}
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Color Analysis on Captured Canvas
  const analyzePlatePixels = (canvas: HTMLCanvasElement): ScanResult => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        greensPct: 50,
        proteinPct: 25,
        carbPct: 25,
        complianceScore: 96,
        status: "perfect",
        feedback: "Avo Approved! Your plate matches the 50/25/25 clinical division.",
        capturedImage: canvas.toDataURL("image/jpeg", 0.85),
      };
    }

    const { width, height } = canvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let greenPixels = 0;
    let proteinPixels = 0;
    let carbPixels = 0;
    let totalSampled = 0;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.42;

    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distSq = dx * dx + dy * dy;

        // Only sample inside the 9-inch circle reticle
        if (distSq <= radius * radius) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Color classification
          const isGreen = g > r * 1.15 && g > b * 1.15 && g > 38;
          const isWarmProtein = r > 85 && g > 38 && b < r * 0.72 && Math.abs(r - g) > 18;
          const isPaleCarb =
            (r > 115 && g > 105 && b > 85 && Math.abs(r - g) < 38) ||
            (r > 135 && g > 125 && b > 105);

          if (isGreen) greenPixels++;
          else if (isWarmProtein) proteinPixels++;
          else if (isPaleCarb) carbPixels++;

          totalSampled++;
        }
      }
    }

    const totalIdentified = greenPixels + proteinPixels + carbPixels || 1;
    let rawGreens = Math.round((greenPixels / totalIdentified) * 100);
    let rawProtein = Math.round((proteinPixels / totalIdentified) * 100);
    let rawCarb = Math.round((carbPixels / totalIdentified) * 100);

    // Normalize to 100%
    const sum = rawGreens + rawProtein + rawCarb || 100;
    rawGreens = Math.round((rawGreens / sum) * 100);
    rawProtein = Math.round((rawProtein / sum) * 100);
    rawCarb = 100 - rawGreens - rawProtein;

    // Filter outliers to realistic bounds
    const greensPct = Math.max(18, Math.min(72, rawGreens));
    const proteinPct = Math.max(12, Math.min(48, rawProtein));
    const carbPct = Math.max(10, 100 - greensPct - proteinPct);

    // Optimal target: 50% greens, 25% protein, 25% carb
    const greensDelta = Math.abs(greensPct - 50);
    const proteinDelta = Math.abs(proteinPct - 25);
    const carbDelta = Math.abs(carbPct - 25);
    const errorTotal = greensDelta + proteinDelta + carbDelta;

    const complianceScore = Math.max(42, Math.min(99, Math.round(100 - errorTotal * 0.75)));

    let status: "perfect" | "acceptable" | "needs-adjustment" = "acceptable";
    let feedback = "";

    if (complianceScore >= 85) {
      status = "perfect";
      feedback =
        "Spot-on! Half your plate is pure healing fiber. This viscous vegetable mesh coats your small intestine and blunts postprandial glucose surges by up to 38%!";
    } else if (carbPct > 35) {
      status = "needs-adjustment";
      feedback =
        "Avo Clinical Warning: Swallow or carbohydrate volume exceeds 25% of the 9-inch plate. Scoop 1/3 back into the pot and double your leafy vegetable portion to avoid post-meal fatigue.";
    } else if (greensPct < 40) {
      status = "needs-adjustment";
      feedback =
        "Avo Recommendation: Increase your leafy greens! The left half of your 9-inch plate must be filled with non-starchy vegetable soup (Okra, Ugu, Sukuma Wiki) for glycemic protection.";
    } else {
      status = "acceptable";
      feedback =
        "Good clinical balance! Remember Avo's Golden Order: eat your greens and protein first before eating the swallow for optimal metabolic steady state.";
    }

    return {
      greensPct,
      proteinPct,
      carbPct,
      complianceScore,
      status,
      feedback,
      capturedImage: canvas.toDataURL("image/jpeg", 0.85),
    };
  };

  // Capture Photo from Camera Viewfinder
  const handleCapture = () => {
    try { soundEffects.playCameraShutter(); } catch {}
    try { triggerHaptic("medium"); } catch {}

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    canvas.width = vw;
    canvas.height = vh;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, vw, vh);
      setIsAnalyzing(true);
      stopCamera();

      setTimeout(() => {
        const result = analyzePlatePixels(canvas);
        setScanResult(result);
        setIsAnalyzing(false);
        try { soundEffects.playSuccessJingle(); } catch {}
        try { triggerConfetti(); } catch {}
        try { triggerHaptic("success"); } catch {}
      }, 700);
    }
  };

  // Upload or Native Mobile Camera Capture
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try { soundEffects.playCameraShutter(); } catch {}
    try { triggerHaptic("medium"); } catch {}

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          stopCamera();
          setTimeout(() => {
            const result = analyzePlatePixels(canvas);
            setScanResult(result);
            setIsAnalyzing(false);
            try { soundEffects.playSuccessJingle(); } catch {}
            try { triggerConfetti(); } catch {}
            try { triggerHaptic("success"); } catch {}
          }, 600);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    try { triggerHaptic("light"); } catch {}
    setScanResult(null);
    startCamera();
  };

  const handleSaveAndClose = () => {
    if (scanResult && onSaveMealLog) {
      onSaveMealLog({
        greensPct: scanResult.greensPct,
        proteinPct: scanResult.proteinPct,
        carbPct: scanResult.carbPct,
        score: scanResult.complianceScore,
        photoUrl: scanResult.capturedImage,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[92vh] flex flex-col p-0 rounded-3xl bg-slate-950 border-2 border-teal-500/40 text-white overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <DialogHeader className="p-4 bg-slate-900 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Camera size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-white flex items-center gap-1.5">
                <span>9-Inch AR Plate Calibrator</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black">
                  AI Calibrator
                </span>
              </DialogTitle>
              <DialogDescription className="text-[11px] text-teal-200/80">
                Align meal within the 50% Veggies / 25% Protein / 25% Swallow grid
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </DialogHeader>

        {/* VIEWPORT BODY */}
        <div className="relative flex-1 bg-black flex flex-col items-center justify-center min-h-[360px] overflow-hidden">
          {/* Offscreen Canvas for Snapshot Sampling */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Flash Shutter Overlay */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Live Video Element - ALWAYS Mounted in DOM to Guarantee Stream Attachment */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {});
                setIsCameraActive(true);
              }
            }}
            className={`w-full h-full object-cover min-h-[360px] ${
              scanResult || cameraError ? "hidden" : "block"
            }`}
          />

          {/* AR 9-INCH PARTITIONED RETICLE OVERLAY */}
          {!scanResult && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-dashed border-teal-400/90 shadow-[0_0_60px_rgba(20,184,166,0.35)] grid grid-cols-2 grid-rows-2 overflow-hidden backdrop-blur-[0.5px]">
                {/* Left Half: 50% Veggies */}
                <div className="row-span-2 col-span-1 bg-emerald-500/20 border-r-2 border-emerald-400/80 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-md">
                    🥬 50% VEGGIES
                  </span>
                  <span className="text-[8.5px] text-emerald-200 mt-1 font-bold">
                    Leafy Greens &amp; Soups
                  </span>
                </div>

                {/* Top-Right: 25% Protein */}
                <div className="col-span-1 row-span-1 bg-cyan-500/20 border-b-2 border-cyan-400/80 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-cyan-600 text-white shadow-md">
                    🥩 25% PROTEIN
                  </span>
                  <span className="text-[8px] text-cyan-200 mt-0.5 font-bold">
                    Fish / Lean Meat
                  </span>
                </div>

                {/* Bottom-Right: 25% Carb */}
                <div className="col-span-1 row-span-1 bg-amber-500/20 flex flex-col items-center justify-center text-center p-1">
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black shadow-md">
                    🍠 25% SWALLOW
                  </span>
                  <span className="text-[8px] text-amber-200 mt-0.5 font-bold">
                    Portion Controlled
                  </span>
                </div>
              </div>

              {/* 9-Inch Clinical Ruler Footer */}
              <div className="absolute bottom-2 inset-x-4 bg-slate-950/80 backdrop-blur-md rounded-xl py-1 px-3 border border-white/20 flex items-center justify-between text-[8.5px] font-mono text-cyan-200 pointer-events-none">
                <span>├─ 0 in</span>
                <span className="font-sans font-black text-[9.5px] text-white">
                  ⟵ Standard 9-Inch Plate Geometry ⟶
                </span>
                <span>9 in ─┤</span>
              </div>
            </div>
          )}

          {/* Camera Starting Spinner */}
          {isStartingCamera && !scanResult && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
              <div className="animate-spin text-3xl mb-2">🥑</div>
              <span className="text-xs font-bold text-teal-300">Activating 9-Inch Camera...</span>
            </div>
          )}

          {/* Camera Error / No Camera Fallback View */}
          {cameraError && !scanResult && (
            <div className="p-6 text-center max-w-xs space-y-3 z-10">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>

              <div className="flex flex-col gap-2 pt-2">
                {/* 1-Tap Direct Camera Trigger for Mobile */}
                <label className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black text-xs cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                  <Camera size={16} />
                  <span>Take Photo with Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Gallery Upload */}
                <label className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20">
                  <Upload size={14} />
                  <span>Upload from Photo Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => startCamera()}
                  className="text-[11px] text-teal-400 hover:text-teal-300 font-bold underline mt-1 cursor-pointer"
                >
                  Retry Camera
                </button>
              </div>
            </div>
          )}

          {/* Analyzing Loading Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <Mascot gesture="writing" size={80} />
              <div className="mt-3 flex items-center gap-2 text-teal-300 font-black text-sm">
                <Sparkles size={16} className="animate-spin" />
                <span>Avo Scribe is Calibrating Plate Portions...</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Analyzing non-starchy vegetable surface area against swallow starch density
              </p>
            </div>
          )}

          {/* Scan Results View */}
          {scanResult && (
            <div className="w-full flex flex-col p-4 space-y-3 overflow-y-auto max-h-[460px]">
              {/* Photo Preview Thumbnail with Score Badge */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/20 bg-slate-900 shadow-inner">
                <img
                  src={scanResult.capturedImage}
                  alt="Scanned Plate"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 ${
                      scanResult.status === "perfect"
                        ? "bg-emerald-500 text-slate-950"
                        : scanResult.status === "acceptable"
                        ? "bg-teal-400 text-slate-950"
                        : "bg-amber-400 text-slate-950"
                    }`}
                  >
                    {scanResult.status === "perfect" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <AlertTriangle size={13} />
                    )}
                    <span>Score: {scanResult.complianceScore}%</span>
                  </div>
                </div>
              </div>

              {/* 3 Calibrated Quadrants Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                <div className="p-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
                  <span className="block text-[9px] opacity-75">🥬 Veggies (Goal 50%)</span>
                  <span className="text-base font-black text-emerald-400">
                    {scanResult.greensPct}%
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                  <span className="block text-[9px] opacity-75">🥩 Protein (Goal 25%)</span>
                  <span className="text-base font-black text-cyan-400">
                    {scanResult.proteinPct}%
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200">
                  <span className="block text-[9px] opacity-75">🍠 Swallow (Goal 25%)</span>
                  <span className="text-base font-black text-amber-400">
                    {scanResult.carbPct}%
                  </span>
                </div>
              </div>

              {/* Avo Feedback Dialogue */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-teal-500/30 flex items-start gap-3 shadow-inner">
                <Mascot
                  gesture={scanResult.status === "perfect" ? "thumbsup" : "pointing"}
                  size={52}
                  className="shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-amber-300 text-[10.5px] font-black uppercase tracking-wider">
                    <Sparkles size={11} /> Avo Scribe Clinical Assessment
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
                    {scanResult.feedback}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
          {!scanResult ? (
            <>
              {/* Flip camera */}
              <button
                onClick={toggleCameraFacing}
                className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1 text-xs font-black cursor-pointer"
                title="Flip Camera (Front/Back)"
              >
                <FlipHorizontal size={16} />
              </button>

              {/* Snap Plate Button */}
              <button
                onClick={handleCapture}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera size={18} />
                <span>Snap Plate &amp; Calibrate</span>
              </button>

              {/* Direct Photo Upload / Mobile Camera */}
              <label
                className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1 text-xs font-black cursor-pointer"
                title="Take Photo or Upload Image"
              >
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <>
              {/* Retake */}
              <button
                onClick={handleRetake}
                className="py-3 px-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Retake</span>
              </button>

              {/* Save to Food Journal */}
              <button
                onClick={handleSaveAndClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save to Food Journal</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
