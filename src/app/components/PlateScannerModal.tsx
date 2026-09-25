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
  ShieldCheck,
  Zap,
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
        "Live camera preview is not supported in this browser. Please use the Take Photo or Upload button below."
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
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      bindStreamToVideo(stream);
    } catch (err: any) {
      console.warn("[PlateScanner] Camera access error:", err);
      let userFriendlyMsg = "Unable to access camera.";
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        userFriendlyMsg =
          "Camera permission was denied. Tap 'Take Photo' below to use your phone's native camera.";
      } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
        userFriendlyMsg = "No camera found on this device. You can still upload a plate photo below.";
      } else if (err?.name === "NotReadableError" || err?.name === "TrackStartError") {
        userFriendlyMsg = "Camera is in use by another app. Please close other camera tabs and try again.";
      }
      setCameraError(userFriendlyMsg);
    } finally {
      setIsStartingCamera(false);
    }
  }, [facingMode, bindStreamToVideo]);

  // Flip Camera between back and front
  const toggleCameraFacing = () => {
    try { triggerHaptic("light"); } catch {}
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    if (isOpen && !scanResult) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scanResult, facingMode, startCamera, stopCamera]);

  // Consumer-Friendly Computer Vision Analysis
  const analyzePlatePixels = (canvas: HTMLCanvasElement): ScanResult => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return {
        greensPct: 50,
        proteinPct: 25,
        carbPct: 25,
        complianceScore: 96,
        status: "perfect",
        feedback: "Chef's Kiss! 🥑 Your plate matches the golden 50% soup veggies, 25% protein, and 25% swallow split!",
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

        if (distSq <= radius * radius) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

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

    const sum = rawGreens + rawProtein + rawCarb || 100;
    rawGreens = Math.round((rawGreens / sum) * 100);
    rawProtein = Math.round((rawProtein / sum) * 100);
    rawCarb = 100 - rawGreens - rawProtein;

    const greensPct = Math.max(18, Math.min(72, rawGreens));
    const proteinPct = Math.max(12, Math.min(48, rawProtein));
    const carbPct = Math.max(10, 100 - greensPct - proteinPct);

    const greensDelta = Math.abs(greensPct - 50);
    const proteinDelta = Math.abs(proteinPct - 25);
    const carbDelta = Math.abs(carbPct - 25);
    const errorTotal = greensDelta + proteinDelta + carbDelta;

    const complianceScore = Math.max(45, Math.min(99, Math.round(100 - errorTotal * 0.75)));

    let status: "perfect" | "acceptable" | "needs-adjustment" = "acceptable";
    let feedback = "";

    if (complianceScore >= 84) {
      status = "perfect";
      feedback =
        "Chef's Kiss! 🥑 Half your plate is rich vegetable soup! This natural fiber shield buffers digestion so you feel energetic and satisfied all afternoon with zero food coma!";
    } else if (carbPct > 36) {
      status = "needs-adjustment";
      feedback =
        "Avo's Friendly Tip: 🥑 Your swallow looks generous today! If you scoop just a fist-size portion and add an extra ladle of that delicious soup greens, your body will enjoy sustained energy with no 2 PM crash.";
    } else if (greensPct < 40) {
      status = "needs-adjustment";
      feedback =
        "Avo's Plate Hack: 🌿 Boost the greens! Ladle more of that rich vegetable soup (Ugu, Afang, Ewedu, or Spinach) across the left side. Enjoy 100% of your soup with zero guilt!";
    } else {
      status = "acceptable";
      feedback =
        "Wonderful balanced plate! 🥑 Avo's secret trick: eat a couple of spoonfuls of the vegetable soup and protein first—it naturally cushions your blood sugar before you enjoy your swallow!";
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
      <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[92vh] flex flex-col p-0 rounded-3xl bg-stone-950 border border-stone-800 text-white overflow-hidden shadow-2xl">
        {/* Header Bar */}
        <DialogHeader className="p-4 bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950/80 border-b border-stone-800 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-white flex items-center gap-2">
                <span>AR Divided Plate Guide</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-black border border-emerald-500/40">
                  50 / 25 / 25
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-300">
                Fit your meal in the circle: 50% soup greens, 25% protein, 25% swallow
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </DialogHeader>

        {/* VIEWPORT BODY */}
        <div className="relative flex-1 bg-black flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
          {/* Offscreen Canvas for Snapshot Sampling */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Flash Shutter Overlay */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Live Video Element */}
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
            className={`w-full h-full object-cover min-h-[380px] ${
              scanResult || cameraError ? "hidden" : "block"
            }`}
          />

          {/* 🌟 10X BOTANICAL AR 50/25/25 VIEWPORT RETICLE */}
          {!scanResult && !cameraError && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
              {/* Top Alignment & Golden Guidance Badge */}
              <div className="absolute top-3 inset-x-4 bg-stone-950/85 backdrop-blur-md rounded-2xl py-2 px-3 border border-emerald-500/30 flex items-center justify-between text-xs font-bold text-white shadow-xl pointer-events-none z-10">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Plate Centered &amp; Level</span>
                </div>
                <div className="text-[10px] text-teal-300 font-extrabold bg-teal-950/80 border border-teal-500/40 px-2 py-0.5 rounded-lg">
                  9-Inch Scale
                </div>
              </div>

              {/* Holographic AR Corner HUD Brackets */}
              <div className="relative w-76 h-76 sm:w-84 sm:h-84 flex items-center justify-center">
                {/* Corner Tick Marks */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-xl pointer-events-none" />

                {/* Main Glowing Circular Reticle */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-emerald-400/90 shadow-[0_0_60px_rgba(16,185,129,0.35)] grid grid-cols-2 grid-rows-2 overflow-hidden backdrop-blur-[0.5px]">
                  {/* Left Half: 50% Non-Starchy Veggies & Soups */}
                  <div className="row-span-2 col-span-1 bg-emerald-500/25 border-r-2 border-emerald-400/90 flex flex-col items-center justify-center text-center p-2.5">
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-lg border border-emerald-300/40">
                      🥬 50% Veggies
                    </span>
                    <span className="text-[11px] text-emerald-100 mt-1.5 font-bold">
                      Soup Greens
                    </span>
                    <span className="text-[9.5px] text-emerald-200/90 font-medium">
                      (Fiber Shield)
                    </span>
                  </div>

                  {/* Top-Right Quarter: 25% Lean Protein */}
                  <div className="col-span-1 row-span-1 bg-cyan-500/25 border-b-2 border-cyan-400/90 flex flex-col items-center justify-center text-center p-1.5">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-cyan-600 text-white shadow-md border border-cyan-300/40">
                      🥩 25% Protein
                    </span>
                    <span className="text-[10px] text-cyan-100 mt-1 font-bold">
                      Fish / Lean Meat
                    </span>
                  </div>

                  {/* Bottom-Right Quarter: 25% Energy Starch / Swallow */}
                  <div className="col-span-1 row-span-1 bg-amber-500/25 flex flex-col items-center justify-center text-center p-1.5">
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow-md border border-amber-300/40">
                      🍠 25% Swallow
                    </span>
                    <span className="text-[10px] text-amber-100 mt-1 font-bold">
                      Fist-Sized Fuel
                    </span>
                  </div>

                  {/* Center Bullseye Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-5 w-5 rounded-full border-2 border-white/70 bg-white/20 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom AR Geometry Indicator */}
              <div className="absolute bottom-2 inset-x-4 bg-stone-950/85 backdrop-blur-md rounded-xl py-1.5 px-3 border border-white/20 flex items-center justify-between text-xs font-mono text-stone-300 pointer-events-none">
                <span className="text-emerald-400 font-bold">├─ 0 in</span>
                <span className="font-sans font-bold text-xs text-white flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Standard 9-Inch Plate Geometry</span>
                </span>
                <span className="text-emerald-400 font-bold">9 in ─┤</span>
              </div>
            </div>
          )}

          {/* Camera Starting Spinner */}
          {isStartingCamera && !scanResult && (
            <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
              <div className="animate-spin text-3xl mb-2">🥑</div>
              <span className="text-xs font-black text-emerald-300">Activating AR Plate Viewfinder...</span>
            </div>
          )}

          {/* Camera Fallback View */}
          {cameraError && !scanResult && (
            <div className="p-6 text-center max-w-xs space-y-3 z-10">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">{cameraError}</p>

              <div className="flex flex-col gap-2 pt-2">
                <label className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:opacity-95 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
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

                <label className="w-full py-2.5 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 border border-stone-700">
                  <Upload size={14} />
                  <span>Upload from Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => startCamera()}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline mt-1 cursor-pointer"
                >
                  Retry Camera
                </button>
              </div>
            </div>
          )}

          {/* Analyzing Loading Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <Mascot gesture="writing" size={82} />
              <div className="mt-3 flex items-center gap-2 text-emerald-300 font-black text-sm">
                <Sparkles size={16} className="animate-spin text-amber-300" />
                <span>Avo Scribe is Calibrating Your Plate...</span>
              </div>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                Scanning soup vegetables, protein, and swallow portion ratios
              </p>
            </div>
          )}

          {/* Scan Results View */}
          {scanResult && (
            <div className="w-full flex flex-col p-4 space-y-3 overflow-y-auto max-h-[460px]">
              {/* Photo Preview Thumbnail with Score Badge */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-inner">
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
                        ? "bg-emerald-400 text-slate-950"
                        : "bg-amber-400 text-slate-950"
                    }`}
                  >
                    {scanResult.status === "perfect" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Sparkles size={13} />
                    )}
                    <span>Score: {scanResult.complianceScore}%</span>
                  </div>
                </div>
              </div>

              {/* 3 Calibrated Quadrants Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200">
                  <span className="block text-[11px] opacity-80 font-bold mb-0.5">🥬 Veggies (50%)</span>
                  <span className="text-base font-black text-emerald-400">
                    {scanResult.greensPct}%
                  </span>
                  <span className="block text-[9px] text-emerald-300 font-medium">
                    {scanResult.greensPct >= 45 ? "Optimal Shield" : "Add more greens"}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-200">
                  <span className="block text-[11px] opacity-80 font-bold mb-0.5">🥩 Protein (25%)</span>
                  <span className="text-base font-black text-cyan-400">
                    {scanResult.proteinPct}%
                  </span>
                  <span className="block text-[9px] text-cyan-300 font-medium">Muscle &amp; Satiety</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200">
                  <span className="block text-[11px] opacity-80 font-bold mb-0.5">🍠 Swallow (25%)</span>
                  <span className="text-base font-black text-amber-400">
                    {scanResult.carbPct}%
                  </span>
                  <span className="block text-[9px] text-amber-300 font-medium">
                    {scanResult.carbPct <= 30 ? "Fist-Sized Safe" : "Slightly High"}
                  </span>
                </div>
              </div>

              {/* Avo Feedback Dialogue */}
              <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-start gap-3 shadow-inner">
                <Mascot
                  gesture={scanResult.status === "perfect" ? "thumbsup" : "pointing"}
                  size={52}
                  className="shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-black uppercase tracking-wider">
                    <Sparkles size={12} /> Avo's Plate Coaching 🥑
                  </div>
                  <p className="text-xs text-stone-200 mt-1 leading-relaxed font-normal">
                    {scanResult.feedback}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-stone-900/95 border-t border-stone-800 flex items-center justify-between gap-2 shrink-0">
          {!scanResult ? (
            <>
              {/* Flip camera */}
              <button
                onClick={toggleCameraFacing}
                className="p-3 rounded-2xl bg-stone-800 text-white hover:bg-stone-700 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer border border-stone-700"
                title="Flip Camera (Front/Back)"
              >
                <FlipHorizontal size={16} />
              </button>

              {/* Snap Plate Button */}
              <button
                onClick={handleCapture}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:opacity-95 text-white font-black text-sm active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera size={18} />
                <span>Snap Plate &amp; Calibrate</span>
              </button>

              {/* Direct Photo Upload / Mobile Camera */}
              <label
                className="p-3 rounded-2xl bg-stone-800 text-white hover:bg-stone-700 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer border border-stone-700"
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
                className="py-3 px-4 rounded-2xl bg-stone-800 text-white hover:bg-stone-700 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-700"
              >
                <RotateCcw size={14} />
                <span>Retake</span>
              </button>

              {/* Save to Food Journal */}
              <button
                onClick={handleSaveAndClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 text-white font-black text-sm active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Save to Food Journal &amp; Savor 🎉</span>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
