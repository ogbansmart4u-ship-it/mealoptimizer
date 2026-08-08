import { useEffect, useState } from 'react';
import { Sparkles, Award, Star, Zap, Trophy } from 'lucide-react';

interface CelebrationAnimationProps {
  onComplete?: () => void;
  message?: string;
}

export function CelebrationAnimation({ onComplete, message = 'Goal Achieved!' }: CelebrationAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative">
        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => {
          const icons = [Sparkles, Star, Zap, Award];
          const Icon = icons[i % icons.length];
          const colors = ['text-yellow-400', 'text-pink-400', 'text-blue-400', 'text-green-400', 'text-purple-400'];
          const color = colors[i % colors.length];

          return (
            <div
              key={i}
              className={`absolute ${color} animate-ping`}
              style={{
                top: `${Math.random() * 400 - 200}px`,
                left: `${Math.random() * 400 - 200}px`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            >
              <Icon className="h-6 w-6" />
            </div>
          );
        })}

        {/* Center content */}
        <div className="bg-white rounded-3xl p-12 shadow-2xl text-center animate-bounce">
          <div className="mb-6 relative inline-block">
            <img
              src="/assets/mascot.png"
              alt="MealOptimiza mascot celebrating"
              className="h-28 w-28 object-contain mx-auto drop-shadow-md"
            />
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-yellow-400 animate-spin" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <Star className="h-6 w-6 text-pink-400 animate-pulse" />
            </div>
          </div>

          <h2 className="text-4xl text-gray-800 mb-2">🎉 {message} 🎉</h2>
          <p className="text-xl text-gray-600">Keep up the amazing work!</p>

          {/* Animated progress bar */}
          <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
