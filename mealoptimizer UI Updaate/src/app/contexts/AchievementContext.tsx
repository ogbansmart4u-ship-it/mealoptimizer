import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AchievementType = 'streak' | 'milestone' | 'goal' | 'consistency';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: AchievementType;
  unlockedAt?: string;
  progress?: number;
  target?: number;
  color: string;
  bgColor: string;
}

export interface Streak {
  trackerId: string;
  trackerName: string;
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

interface AchievementContextType {
  achievements: Achievement[];
  streaks: Streak[];
  unlockedAchievements: Achievement[];
  pendingNotification: Achievement | null;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: (trackerId: string, trackerName: string) => void;
  checkMilestones: (trackerId: string, value: number) => void;
  dismissNotification: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-log',
    title: 'Getting Started',
    description: 'Log your first health metric',
    icon: '🎯',
    type: 'milestone',
    color: '#1f7a8c',
    bgColor: '#E8F5F5',
  },
  {
    id: 'hydration-7day',
    title: 'Hydration Hero',
    description: 'Log water intake for 7 days straight',
    icon: '💧',
    type: 'streak',
    target: 7,
    color: '#4ecdc4',
    bgColor: '#B8E5E5',
  },
  {
    id: 'hydration-30day',
    title: 'Water Champion',
    description: 'Maintain 30-day hydration streak',
    icon: '🏆',
    type: 'streak',
    target: 30,
    color: '#4ecdc4',
    bgColor: '#B8E5E5',
  },
  {
    id: 'weight-milestone-5kg',
    title: 'Progress Maker',
    description: 'Lose 5kg towards your goal',
    icon: '⚖️',
    type: 'milestone',
    color: '#1f7a8c',
    bgColor: '#E8F5F5',
  },
  {
    id: 'perfect-week',
    title: 'Perfect Week',
    description: 'Log all trackers for 7 consecutive days',
    icon: '✨',
    type: 'consistency',
    target: 7,
    color: '#f77f00',
    bgColor: '#fff4e5',
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Log your morning routine before 9 AM for 5 days',
    icon: '🌅',
    type: 'consistency',
    target: 5,
    color: '#e63946',
    bgColor: '#ffe5e5',
  },
  {
    id: 'goal-crusher',
    title: 'Goal Crusher',
    description: 'Complete your first health goal',
    icon: '🎖️',
    type: 'goal',
    color: '#10b981',
    bgColor: '#d1fae5',
  },
  {
    id: 'triple-threat',
    title: 'Triple Threat',
    description: 'Complete 3 health goals',
    icon: '👑',
    type: 'goal',
    target: 3,
    color: '#10b981',
    bgColor: '#d1fae5',
  },
];

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [pendingNotification, setPendingNotification] = useState<Achievement | null>(null);

  // Load from localStorage
  useEffect(() => {
    const savedUnlocked = localStorage.getItem('unlockedAchievements');
    const savedStreaks = localStorage.getItem('streaks');

    if (savedUnlocked) {
      setUnlockedAchievements(JSON.parse(savedUnlocked));
    }
    if (savedStreaks) {
      setStreaks(JSON.parse(savedStreaks));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (unlockedAchievements.length > 0) {
      localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    }
  }, [unlockedAchievements]);

  useEffect(() => {
    if (streaks.length > 0) {
      localStorage.setItem('streaks', JSON.stringify(streaks));
    }
  }, [streaks]);

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement || unlockedAchievements.find(a => a.id === achievementId)) {
      return;
    }

    const unlockedAchievement = {
      ...achievement,
      unlockedAt: new Date().toISOString(),
    };

    setUnlockedAchievements(prev => [...prev, unlockedAchievement]);
    setPendingNotification(unlockedAchievement);

    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      setPendingNotification(null);
    }, 5000);
  };

  const updateStreak = (trackerId: string, trackerName: string) => {
    const today = new Date().toISOString().split('T')[0];

    setStreaks(prev => {
      const existingStreak = prev.find(s => s.trackerId === trackerId);

      if (existingStreak) {
        const lastDate = new Date(existingStreak.lastUpdated).toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Same day - no change
        if (lastDate === today) {
          return prev;
        }

        // Consecutive day - increment streak
        if (lastDate === yesterday) {
          const newStreak = existingStreak.currentStreak + 1;
          const newLongest = Math.max(newStreak, existingStreak.longestStreak);

          // Check for streak achievements
          if (trackerId === 'hydration' && newStreak === 7) {
            unlockAchievement('hydration-7day');
          }
          if (trackerId === 'hydration' && newStreak === 30) {
            unlockAchievement('hydration-30day');
          }

          return prev.map(s =>
            s.trackerId === trackerId
              ? { ...s, currentStreak: newStreak, longestStreak: newLongest, lastUpdated: today }
              : s
          );
        }

        // Streak broken - reset to 1
        return prev.map(s =>
          s.trackerId === trackerId
            ? { ...s, currentStreak: 1, lastUpdated: today }
            : s
        );
      }

      // New streak
      return [
        ...prev,
        {
          trackerId,
          trackerName,
          currentStreak: 1,
          longestStreak: 1,
          lastUpdated: today,
        },
      ];
    });
  };

  const checkMilestones = (trackerId: string, value: number) => {
    // Check for first log
    if (!unlockedAchievements.find(a => a.id === 'first-log')) {
      unlockAchievement('first-log');
    }

    // Add more milestone checks here based on tracker type and value
  };

  const dismissNotification = () => {
    setPendingNotification(null);
  };

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        streaks,
        unlockedAchievements,
        pendingNotification,
        unlockAchievement,
        updateStreak,
        checkMilestones,
        dismissNotification,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return context;
}
