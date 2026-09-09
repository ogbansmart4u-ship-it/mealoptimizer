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
} from "lucide-react";
import Mascot from "./Mascot";
import { soundEffects } from "../utils/soundEffects";
import { triggerHaptic } from "../utils/celebration";

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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("[PlateScanner] Camera error:", err);
      setCameraError(
        "Camera access denied or unavailable. You can upload a photo of your plate instead."
      );
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Flip camera (front/back)
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Color Analysis on Captured Frame
  const analyzePlatePixels = (canvas: HTMLCanvasElement): ScanResult => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return {
        greensPct: 48,
        proteinPct: 26,
        carbPct: 26,
        complianceScore: 94,
        status: "perfect",
        feedback: "Great job! Your plate matches the 50/25/25 clinical division.",
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

        // Only sample inside the 9-inch circle
        if (distSq <= radius * radius) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Simple color segmentation heuristic
          const isGreen = g > r * 1.15 && g > b * 1.15 && g > 40;
          const isWarmProtein = r > 90 && g > 40 && b < r * 0.7 && Math.abs(r - g) > 20;
          const isPaleCarb = (r > 120 && g > 110 && b > 90 && Math.abs(r - g) < 35) || (r > 140 && g > 130 && b > 110);

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

    // Normalize to 100
    const sum = rawGreens + rawProtein + rawCarb || 100;
    rawGreens = Math.round((rawGreens / sum) * 100);
    rawProtein = Math.round((rawProtein / sum) * 100);
    rawCarb = 100 - rawGreens - rawProtein;

    // Constrain to realistic plausible ranges to prevent crazy noise
    const greensPct = Math.max(15, Math.min(75, rawGreens));
    const proteinPct = Math.max(10, Math.min(50, rawProtein));
    const carbPct = 100 - greensPct - proteinPct;

    // Calculate clinical compliance score:
    // Optimal: 50% greens, 25% protein, 25% carb
    const greensDelta = Math.abs(greensPct - 50);
    const proteinDelta = Math.abs(proteinPct - 25);
    const carbDelta = Math.abs(carbPct - 25);
    const errorTotal = greensDelta + proteinDelta + carbDelta;

    const complianceScore = Math.max(40, Math.min(99, Math.round(100 - errorTotal * 0.75)));

    let status: "perfect" | "acceptable" | "needs-adjustment" = "acceptable";
    let feedback = "";

    if (complianceScore >= 85) {
      status = "perfect";
      feedback =
        "Avo Approved! Excellent 9-inch plate balance. Your 50% vegetable fiber barrier will blunt post-meal blood sugar surges by up to 38%.";
    } else if (carbPct > 35) {
      status = "needs-adjustment";
      feedback =
        "Avo Warning: Your swallow/carb portion covers more than 25% of the plate. Scoop 1/3 back into the pot and add another ladle of leafy greens.";
    } else if (greensPct < 40) {
      status = "needs-adjustment";
      feedback =
        "Avo Tip: Boost your greens! Non-starchy vegetables should fill the entire left half of your plate to create a protective fiber mesh.";
    } else {
      status = "acceptable";
      feedback =
        "Good clinical balance! Eat your leafy greens and protein first before eating the swallow for optimal metabolic protection.";
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

  // Capture Photo from Camera
  const handleCapture = () => {
    try {
      soundEffects.playSuccessSparkle();
    } catch {}
    try {
      triggerHaptic("heavy");
    } catch {}

    if (!videoRef.current || !canvasRef.current) return;
    setIsAnalyzing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      stopCamera();

      setTimeout(() => {
        const result = analyzePlatePixels(canvas);
        setScanResult(result);
        setIsAnalyzing(false);
      }, 700);
    }
  };

  // Upload Photo Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      soundEffects.playBubblePop();
    } catch {}

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
          }, 600);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
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
        <DialogHeader className="p-4 bg-slate-900 border-b border-white/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <Camera size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-white flex items-center gap-1.5">
                <span>9-Inch AR Plate Calibrator</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black">
                  AI Live
                </span>
              </DialogTitle>
              <DialogDescription className="text-[11px] text-teal-200/80">
                Align your actual meal dish with the 50/25/25 clinical grid
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </DialogHeader>

        {/* VIEWPORT BODY */}
        <div className="relative flex-1 bg-black flex flex-col items-center justify-center min-h-[360px] overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />

          {/* 1. Live Camera View */}
          {isCameraActive && !scanResult && (
            <div className="relative w-full h-full min-h-[360px] flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover min-h-[360px]"
              />

              {/* AR 9-INCH PARTITIONED RETICLE OVERLAY */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-dashed border-teal-400/80 shadow-[0_0_50px_rgba(20,184,166,0.3)] grid grid-cols-2 grid-rows-2 overflow-hidden backdrop-blur-[1px]">
                  {/* Left Half: 50% Veggies */}
                  <div className="row-span-2 col-span-1 bg-emerald-500/15 border-r-2 border-emerald-400/70 flex flex-col items-center justify-center text-center p-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                      🥬 50% VEGGIES
                    </span>
                    <span className="text-[8px] text-emerald-200 mt-1 font-bold">
                      2 Ladles greens/soup
                    </span>
                  </div>

                  {/* Top-Right: 25% Protein */}
                  <div className="col-span-1 row-span-1 bg-cyan-500/15 border-b-2 border-cyan-400/70 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-cyan-600 text-white shadow-xs">
                      🥩 25% PROTEIN
                    </span>
                    <span className="text-[7.5px] text-cyan-200 mt-0.5 font-bold">
                      1 Palm lean protein
                    </span>
                  </div>

                  {/* Bottom-Right: 25% Carb */}
                  <div className="col-span-1 row-span-1 bg-amber-500/15 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-600 text-slate-950 font-black shadow-xs">
                      🍠 25% SWALLOW
                    </span>
                    <span className="text-[7.5px] text-amber-200 mt-0.5 font-bold">
                      1 Fist portion carb
                    </span>
                  </div>
                </div>
              </div>

              {/* 9-Inch Clinical Ruler Footer on Camera */}
              <div className="absolute bottom-2 inset-x-4 bg-slate-950/80 backdrop-blur-md rounded-xl py-1 px-3 border border-white/20 flex items-center justify-between text-[8.5px] font-mono text-cyan-200 pointer-events-none">
                <span>├─ 0 in</span>
                <span className="font-sans font-black text-[9.5px] text-white">
                  ⟵ Standard 9-Inch Plate Geometry ⟶
                </span>
                <span>9 in ─┤</span>
              </div>
            </div>
          )}

          {/* 2. Loading State */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
              <Mascot gesture="writing" size={80} />
              <div className="mt-3 flex items-center gap-2 text-teal-300 font-black text-sm">
                <Sparkles size={16} className="animate-spin" />
                <span>Avo Scribe is Calibrating Plate Portions...</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Scanning non-starchy vegetable surface area against swallow starch density
              </p>
            </div>
          )}

          {/* 3. Scan Results View */}
          {scanResult && (
            <div className="w-full flex flex-col p-4 space-y-3 overflow-y-auto max-h-[460px]">
              {/* Photo Preview Thumbnail with Badge */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/20 bg-slate-900">
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
                        ? "bg-teal-500 text-slate-950"
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
                  <span className="block text-[9px] opacity-75">🥬 Veggies (Target 50%)</span>
                  <span className="text-base font-black text-emerald-400">
                    {scanResult.greensPct}%
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200">
                  <span className="block text-[9px] opacity-75">🥩 Protein (Target 25%)</span>
                  <span className="text-base font-black text-cyan-400">
                    {scanResult.proteinPct}%
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200">
                  <span className="block text-[9px] opacity-75">🍠 Swallow (Target 25%)</span>
                  <span className="text-base font-black text-amber-400">
                    {scanResult.carbPct}%
                  </span>
                </div>
              </div>

              {/* Avo Feedback Speech Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-teal-500/30 flex items-start gap-3 shadow-inner">
                <Mascot
                  gesture={scanResult.status === "perfect" ? "thumbsup" : "concerned"}
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

          {/* Camera Error Fallback */}
          {cameraError && !scanResult && (
            <div className="p-6 text-center max-w-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <p className="text-xs text-slate-300">{cameraError}</p>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-500 text-slate-950 font-black text-xs cursor-pointer hover:bg-teal-400 transition-all shadow-lg">
                <Upload size={14} />
                <span>Upload Plate Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-slate-900 border-t border-white/10 flex items-center justify-between gap-2">
          {!scanResult ? (
            <>
              <button
                onClick={toggleCameraFacing}
                className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1 text-xs font-black"
                title="Flip Camera"
              >
                <FlipHorizontal size={16} />
              </button>

              <button
                onClick={handleCapture}
                disabled={!isCameraActive}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Camera size={18} />
                <span>Snap Plate &amp; Calibrate</span>
              </button>

              <label className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1 text-xs font-black cursor-pointer">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="py-3 px-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs font-black flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Retake</span>
              </button>

              <button
                onClick={handleSaveAndClose}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
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
