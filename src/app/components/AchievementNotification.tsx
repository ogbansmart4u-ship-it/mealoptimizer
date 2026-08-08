import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Achievement } from '../contexts/AchievementContext';

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className="rounded-3xl shadow-2xl p-5 border-2 relative overflow-hidden animate-bounce"
        style={{
          backgroundColor: achievement.bgColor,
          borderColor: achievement.color,
        }}
      >
        {/* Mascot accent + sparkle */}
        <img
          src="/assets/mascot.png"
          alt=""
          aria-hidden="true"
          className="absolute -bottom-1 right-1 w-12 h-12 object-contain opacity-90 pointer-events-none drop-shadow-sm"
        />
        <div className="absolute top-2 left-2 animate-pulse">
          <Sparkles className="h-4 w-4" style={{ color: achievement.color }} />
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4 pr-6">
          <div className="text-5xl animate-bounce">{achievement.icon}</div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: achievement.color }}>
              Achievement Unlocked!
            </p>
            <h3 className="text-gray-800 mb-1">{achievement.title}</h3>
            <p className="text-sm text-gray-600">{achievement.description}</p>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-3 h-1 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 animate-pulse"
            style={{
              width: '100%',
              backgroundColor: achievement.color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
