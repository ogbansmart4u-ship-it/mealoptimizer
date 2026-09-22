import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Mic, Sparkles, Check, Upload, Keyboard, X, SwitchCamera, Circle, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { triggerHaptic } from '../utils/celebration';

type CameraCaptureProps = {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string, source: 'camera' | 'upload' | 'manual', manualInput?: string, voiceHint?: string) => void;
  mode?: 'food' | 'barcode';
  title?: string;
};

export default function CameraCapture({
  isOpen,
  onClose,
  onCapture,
  mode = 'food',
  title
}: CameraCaptureProps) {
  const [view, setView] = useState<'options' | 'camera' | 'manual' | 'preview'>('options');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [captureSource, setCaptureSource] = useState<'camera' | 'upload'>('camera');
  const [voiceWhisperText, setVoiceWhisperText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Stop all active tracks helper
  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Cleanup camera stream when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopTracks();
      setView('options');
      setError(null);
      setIsStarting(false);
    }
  }, [isOpen, stopTracks]);

  // Reliably attach media stream to <video> when view is 'camera' and stream is ready
  useEffect(() => {
    if (view === 'camera' && stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video
          .play()
          .catch((e) => console.warn('[CameraCapture] video play interrupted:', e));
      };
    }
  }, [view, stream]);

  const startCamera = async (targetFacing: 'user' | 'environment' = facingMode) => {
    setIsStarting(true);
    setError(null);
    triggerHaptic('light');

    // Stop existing stream if any
    stopTracks();

    // Check if mediaDevices is supported
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser. Please use native photo upload below.');
      setIsStarting(false);
      return;
    }

    try {
      let mediaStream: MediaStream;

      try {
        // Preferred modern constraints
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('[CameraCapture] Exact constraints failed, falling back to basic video:', firstErr);
        // Fallback to basic video constraint
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      setView('camera');
    } catch (err: any) {
      console.error('[CameraCapture] Camera access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera permissions in your browser or use Phone Camera below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device found on this system.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is currently in use by another application.');
      } else {
        setError(`Could not start camera: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsStarting(false);
    }
  };

  const switchCamera = async () => {
    triggerHaptic('light');
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    await startCamera(newFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    triggerHaptic('medium');
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Use video stream resolution or fallback
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, width, height);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);

      stopTracks();
      setCapturedPreview(imageData);
      setCaptureSource('camera');
      setView('preview');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    triggerHaptic('light');
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedPreview(imageData);
      setCaptureSource('upload');
      setView('preview');
    };
    reader.readAsDataURL(file);
  };

  
  const startVoiceWhisper = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.info("Speech recognition not supported in this browser. Please type your dish hint.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-NG'; // Nigerian English with Pidgin tolerance
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        triggerHaptic('light');
        toast.info("🎙️ Listening... Tell Sarah what is on the plate");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceWhisperText(transcript);
        triggerHaptic('success');
        toast.success(`Recorded: "${transcript}"`);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition failed to initialize:", err);
      setIsListening(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      triggerHaptic('light');
      onCapture('', 'manual', manualInput.trim());
      handleClose();
    }
  };

  
  const handleConfirmPreview = () => {
    if (capturedPreview) {
      triggerHaptic('medium');
      onCapture(capturedPreview, captureSource, undefined, voiceWhisperText.trim());
      handleClose();
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setVoiceWhisperText('');
    if (captureSource === 'camera') {
      startCamera();
      setView('camera');
    } else {
      setView('options');
    }
  };

  const handleClose = () => {
    stopTracks();
    setView('options');
    setManualInput('');
    setError(null);
    setIsStarting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#171E1B]">
        <DialogHeader className="sr-only">
          <DialogTitle>{title ?? "Capture Food Photo"}</DialogTitle>
          <DialogDescription>Take a photo or upload an image</DialogDescription>
        </DialogHeader>

        {/* ============================================================ */}
        {/* VIEW 1: OPTIONS / PICKER VIEW                                */}
        {/* ============================================================ */}
        {view === 'options' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#164E3D]/10 dark:bg-emerald-500/15 rounded-2xl text-[#164E3D] dark:text-emerald-400">
                  <Camera className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {title || (mode === 'barcode' ? 'Scan Barcode' : 'Capture Food Photo')}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Live camera, phone camera, or instant upload
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer text-stone-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Camera Notice:</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* 📸 3 Golden Rules Quick Tips */}
            <div className="mb-5 p-3.5 bg-stone-100/80 dark:bg-stone-900/80 rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200 text-xs mb-2">
                <Sparkles size={14} className="text-[#D97706]" />
                <span>3 Keys for Instant Food Recognition:</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-stone-700 dark:text-stone-300">
                <div className="bg-white dark:bg-stone-800/90 p-2 rounded-xl border border-stone-200/60 dark:border-stone-700/60 flex flex-col items-center gap-1 shadow-xs">
                  <span className="text-base">🎯</span>
                  <span className="leading-tight">Food Inside Frame</span>
                </div>
                <div className="bg-white dark:bg-stone-800/90 p-2 rounded-xl border border-stone-200/60 dark:border-stone-700/60 flex flex-col items-center gap-1 shadow-xs">
                  <span className="text-base">🥗</span>
                  <span className="leading-tight">Visible Ingredients</span>
                </div>
                <div className="bg-white dark:bg-stone-800/90 p-2 rounded-xl border border-stone-200/60 dark:border-stone-700/60 flex flex-col items-center gap-1 shadow-xs">
                  <span className="text-base">💡</span>
                  <span className="leading-tight">Good Lighting</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Take Live Photo with In-App Camera */}
              <button
                onClick={() => startCamera()}
                disabled={isStarting}
                className="w-full flex items-center gap-3.5 p-4 bg-[#164E3D] hover:bg-[#113E30] text-white rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <div className="bg-white/15 rounded-xl p-2.5 shrink-0">
                  {isStarting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-bold text-sm">
                    {isStarting ? "Starting Camera..." : "Open Live Camera View"}
                  </div>
                  <div className="text-xs text-emerald-100/80">
                    {mode === 'barcode' ? 'Scan product barcode live' : 'Real-time camera scanner'}
                  </div>
                </div>
              </button>

              {/* Native Phone Camera / File Capture */}
              <button
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full flex items-center gap-3.5 p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#164E3D] rounded-2xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="bg-stone-100 dark:bg-stone-800 rounded-xl p-2.5 shrink-0 text-stone-700 dark:text-stone-300">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Phone Camera App 📱
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Opens device native high-res camera
                  </div>
                </div>
              </button>

              {/* Upload from Gallery */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3.5 p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#164E3D] rounded-2xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="bg-stone-100 dark:bg-stone-800 rounded-xl p-2.5 shrink-0 text-stone-700 dark:text-stone-300">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Upload from Photo Gallery
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Select an existing food picture
                  </div>
                </div>
              </button>

              {/* Enter Manually for Barcodes */}
              {mode === 'barcode' && (
                <button
                  onClick={() => setView('manual')}
                  className="w-full flex items-center gap-3.5 p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#164E3D] rounded-2xl transition-all cursor-pointer"
                >
                  <div className="bg-amber-50 dark:bg-amber-950/60 rounded-xl p-2.5 shrink-0 text-amber-600">
                    <Keyboard className="h-5 w-5" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      Enter Barcode Manually
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">Type product EAN/UPC code</div>
                  </div>
                </button>
              )}
            </div>

            {/* Hidden native camera capture input */}
            <input
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Hidden gallery file upload input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: LIVE CAMERA STREAM VIEW                              */}
        {/* ============================================================ */}
        {view === 'camera' && (
          <div className="relative bg-black flex flex-col justify-center items-center min-h-[420px] max-h-[75vh] overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ maxHeight: '72vh' }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay UI Controls */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
              {/* Top Controls Bar */}
              <div className="flex items-center justify-between pointer-events-auto">
                <button
                  onClick={() => {
                    stopTracks();
                    setView('options');
                  }}
                  className="p-2.5 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full text-white transition-colors cursor-pointer"
                  aria-label="Back to options"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold">
                  {facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}
                </div>

                <button
                  onClick={switchCamera}
                  className="p-2.5 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full text-white transition-colors cursor-pointer"
                  aria-label="Switch Camera"
                >
                  <SwitchCamera className="h-5 w-5" />
                </button>
              </div>

              {/* Barcode Targeting Box (if barcode mode) */}
              {mode === 'barcode' && (
                <div className="flex-1 flex items-center justify-center pointer-events-none my-auto">
                  <div className="w-64 h-36 border-2 border-white/80 rounded-2xl relative shadow-2xl">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-0.5 -ml-0.5" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-0.5 -mr-0.5" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-0.5 -ml-0.5" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-0.5 -mr-0.5" />
                  </div>
                </div>
              )}

              {/* 📸 3 Golden Rules Bar */}
              <div className="mb-3 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-white text-xs font-semibold flex items-center justify-around gap-2 shadow-xl mx-auto w-full max-w-sm pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">🎯</span>
                  <span>Food In Frame</span>
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-300">🥗</span>
                  <span>Visible Ingredients</span>
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-300">💡</span>
                  <span>Good Lighting</span>
                </div>
              </div>

              {/* Bottom Snap Button */}
              <div className="flex flex-col items-center justify-center pb-3 pointer-events-auto">
                <button
                  onClick={capturePhoto}
                  className="p-1 rounded-full border-4 border-white hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer"
                  aria-label="Take Photo"
                >
                  <div className="w-16 h-16 rounded-full bg-white hover:bg-stone-100 transition-colors flex items-center justify-center">
                    <div className="w-13 h-13 rounded-full border-2 border-stone-300" />
                  </div>
                </button>
                <span className="text-white text-xs font-bold mt-2 drop-shadow-md">
                  Tap to Capture Plate
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: MANUAL BARCODE ENTRY VIEW                            */}
        {/* ============================================================ */}
        {view === 'manual' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Enter Barcode</h2>
              <button
                onClick={() => setView('options')}
                className="p-2 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer text-stone-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Barcode Number (EAN / UPC)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 5000112576009"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="h-11 text-sm rounded-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                  autoFocus
                />
                <p className="text-xs text-stone-400 mt-1.5">
                  Enter the numeric digits underneath the barcode on product packaging.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setView('options')}
                  variant="outline"
                  className="flex-1 rounded-2xl h-11 font-bold text-xs cursor-pointer border-stone-200 dark:border-stone-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  className="flex-1 bg-[#164E3D] hover:bg-[#113E30] text-white rounded-2xl h-11 font-bold text-xs cursor-pointer"
                >
                  Submit Barcode
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
