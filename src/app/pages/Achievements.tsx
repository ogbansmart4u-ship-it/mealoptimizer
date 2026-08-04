import { useState } from 'react';
import { Trophy, Award, Flame, Lock, CheckCircle2, Star, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAchievements } from '../contexts/AchievementContext';
import BottomNav from '../components/BottomNav';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

export default function Achievements() {
  const navigate = useNavigate();
  const { achievements, unlockedAchievements, streaks } = useAchievements();
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  const locked = achievements.filter(a => !unlockedAchievements.find(ua => ua.id === a.id));

  const displayAchievements =
    activeTab === 'all'
      ? achievements
      : activeTab === 'unlocked'
      ? unlockedAchievements
      : locked;

  const isUnlocked = (achievementId: string) =>
    unlockedAchievements.find(a => a.id === achievementId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl text-white mb-1">Achievements</h1>
              <p className="text-white/80 text-sm">Track your progress & badges</p>
            </div>
          </div>
          <ProfilePictureUpload />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl text-white mb-1">{unlockedAchievements.length}</p>
            <p className="text-xs text-white/80">Unlocked</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl text-white mb-1">{locked.length}</p>
            <p className="text-xs text-white/80">Locked</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
            <p className="text-2xl text-white mb-1">
              {achievements.length > 0
                ? Math.round((unlockedAchievements.length / achievements.length) * 100)
                : 0}
              %
            </p>
            <p className="text-xs text-white/80">Complete</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-1 mb-6 flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'unlocked'
                ? 'bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Unlocked ({unlockedAchievements.length})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`flex-1 py-3 rounded-xl transition-all ${
              activeTab === 'locked'
                ? 'bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Locked ({locked.length})
          </button>
        </div>

        {/* Current Streaks */}
        {streaks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl text-gray-800 mb-3 flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              Active Streaks
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {streaks.map(streak => (
                <div
                  key={streak.trackerId}
                  className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg p-4 border-2 border-orange-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-gray-600">{streak.trackerName}</span>
                  </div>
                  <p className="text-3xl text-gray-800 mb-1">{streak.currentStreak}</p>
                  <p className="text-xs text-gray-500">
                    Longest: {streak.longestStreak} days
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements List */}
        <h2 className="text-xl text-gray-800 mb-3 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          {activeTab === 'all'
            ? 'All Achievements'
            : activeTab === 'unlocked'
            ? 'Unlocked Badges'
            : 'Locked Achievements'}
        </h2>

        <div className="space-y-4">
          {displayAchievements.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-800 mb-2">
                {activeTab === 'unlocked'
                  ? 'No Achievements Yet'
                  : 'No Locked Achievements'}
              </h3>
              <p className="text-sm text-gray-600">
                {activeTab === 'unlocked'
                  ? 'Start tracking your health to unlock achievements!'
                  : "You've unlocked all achievements! Amazing work!"}
              </p>
            </div>
          ) : (
            displayAchievements.map(achievement => {
              const unlocked = isUnlocked(achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`rounded-3xl shadow-lg p-5 transition-all ${
                    unlocked
                      ? 'bg-gradient-to-br from-white to-green-50 border-2 border-green-200'
                      : 'bg-white opacity-75'
                  }`}
                  style={
                    unlocked && !achievement.bgColor
                      ? {}
                      : unlocked
                      ? { borderColor: achievement.color }
                      : {}
                  }
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`rounded-2xl p-4 text-4xl relative ${
                        unlocked ? '' : 'grayscale opacity-50'
                      }`}
                      style={{
                        backgroundColor: unlocked ? achievement.bgColor : '#f3f4f6',
                      }}
                    >
                      {unlocked ? (
                        achievement.icon
                      ) : (
                        <Lock className="h-10 w-10 text-gray-400" />
                      )}
                      {unlocked && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className={`text-gray-800 ${unlocked ? '' : 'opacity-50'}`}>
                          {achievement.title}
                        </h3>
                        {unlocked && (
                          <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>

                      <p className={`text-sm text-gray-600 mb-2 ${unlocked ? '' : 'opacity-50'}`}>
                        {achievement.description}
                      </p>

                      {unlocked && achievement.unlockedAt && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Unlocked{' '}
                            {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}

                      {!unlocked && achievement.target && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress || 0}/{achievement.target}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  ((achievement.progress || 0) / achievement.target) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Motivational Message */}
        {unlockedAchievements.length > 0 && (
          <div className="mt-6 bg-gradient-to-br from-yellow-50 to-white rounded-3xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-gray-800 mb-2">Keep It Up!</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  You've unlocked {unlockedAchievements.length} achievement
                  {unlockedAchievements.length > 1 ? 's' : ''}! Your commitment to health is
                  inspiring. Keep tracking and watch your progress grow!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
