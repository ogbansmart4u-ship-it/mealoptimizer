import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Keyboard, X, SwitchCamera, Circle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

type CameraCaptureProps = {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string, source: 'camera' | 'upload' | 'manual', manualInput?: string) => void;
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
  const [view, setView] = useState<'options' | 'camera' | 'manual'>('options');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream when closing
  useEffect(() => {
    if (!isOpen && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setView('options');
      setError(null);
    }
  }, [isOpen, stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setView('camera');
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError('Could not access camera. ' + err.message);
      }
    }
  };

  const switchCamera = async () => {
    // Stop current stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // Toggle facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    // Restart camera with new facing mode
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Error switching camera:', err);
      setError('Could not switch camera');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.95);

      // Stop camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      onCapture(imageData, 'camera');
      handleClose();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onCapture(imageData, 'upload');
      handleClose();
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onCapture('', 'manual', manualInput.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setView('options');
    setManualInput('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{title ?? "Capture"}</DialogTitle>
          <DialogDescription>Take a photo or upload an image</DialogDescription>
        </DialogHeader>
        {/* Options View */}
        {view === 'options' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {title || (mode === 'barcode' ? 'Scan Barcode' : 'Capture Food Photo')}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {/* Take Photo with Camera */}
              <button
                onClick={startCamera}
                className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] hover:from-[#1a6273] hover:to-[#3db3a6] text-white rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <div className="bg-white/20 rounded-full p-3">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Take Photo with Camera</div>
                  <div className="text-sm text-white/80">
                    {mode === 'barcode' ? 'Scan barcode directly' : 'Capture food image live'}
                  </div>
                </div>
              </button>

              {/* Upload from Gallery */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 hover:border-[#1f7a8c] hover:bg-gray-50 rounded-xl transition-all"
              >
                <div className="bg-[#E8F5F5] rounded-full p-3">
                  <Upload className="h-6 w-6 text-[#1f7a8c]" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-800">Upload from Gallery</div>
                  <div className="text-sm text-gray-600">
                    Choose an existing photo
                  </div>
                </div>
              </button>

              {/* Enter Manually */}
              {mode === 'barcode' && (
                <button
                  onClick={() => setView('manual')}
                  className="w-full flex items-center gap-4 p-5 bg-white border-2 border-gray-200 hover:border-[#1f7a8c] hover:bg-gray-50 rounded-xl transition-all"
                >
                  <div className="bg-[#E8F5F5] rounded-full p-3">
                    <Keyboard className="h-6 w-6 text-[#1f7a8c]" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-800">Enter Barcode Manually</div>
                    <div className="text-sm text-gray-600">
                      Type the barcode number
                    </div>
                  </div>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Camera View */}
        {view === 'camera' && (
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-auto">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                        setStream(null);
                      }
                      setView('options');
                    }}
                    className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>

                  <button
                    onClick={switchCamera}
                    className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full transition-colors"
                  >
                    <SwitchCamera className="h-6 w-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Bottom Bar - Capture Button */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-auto">
                <div className="flex items-center justify-center">
                  <button
                    onClick={capturePhoto}
                    className="relative group"
                  >
                    <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform">
                      <div className="w-16 h-16 rounded-full bg-white group-hover:bg-gray-200 transition-colors" />
                    </div>
                  </button>
                </div>
                <p className="text-center text-white text-sm mt-4">
                  {mode === 'barcode' ? 'Position barcode in center' : 'Tap to capture'}
                </p>
              </div>

              {/* Barcode Guide Overlay */}
              {mode === 'barcode' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-40 border-4 border-white rounded-lg relative">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-green-400" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-green-400" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-green-400" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-green-400" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Entry View */}
        {view === 'manual' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Enter Barcode</h2>
              <button
                onClick={() => setView('options')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode Number
                </label>
                <Input
                  type="text"
                  placeholder="e.g., 5000112576009"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="h-12 text-lg"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the numeric barcode found on the product packaging
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setView('options')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim()}
                  className="flex-1 bg-[#1f7a8c] hover:bg-[#1a6273]"
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
