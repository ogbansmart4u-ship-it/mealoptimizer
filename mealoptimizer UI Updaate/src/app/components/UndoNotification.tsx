import { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface UndoNotificationProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function UndoNotification({ message, onUndo, onDismiss, duration = 5000 }: UndoNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    // Progress bar countdown
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          handleDismiss();
          return 0;
        }
        return prev - (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const handleUndo = () => {
    setIsVisible(false);
    setTimeout(() => {
      onUndo();
      onDismiss();
    }, 300);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 pr-6 min-w-[300px] max-w-md relative overflow-hidden">
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-[#4ecdc4] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm">{message}</p>
          </div>

          <button
            onClick={handleUndo}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f7a8c] hover:bg-[#4ecdc4] rounded-lg transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-sm">Undo</span>
          </button>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
