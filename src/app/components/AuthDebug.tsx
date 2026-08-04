import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useEffect, useState } from 'react';

/**
 * Debug component to display authentication state
 * Only visible in development mode
 * Add to any page to check auth status
 */
export function AuthDebug() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  useEffect(() => {
    setIsVisible(window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'));
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-xl max-w-sm z-50 text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <strong className="text-green-400">🔐 Auth Debug</strong>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Auth Status:</span>{' '}
          {loading ? (
            <span className="text-yellow-400">Loading...</span>
          ) : user ? (
            <span className="text-green-400">✓ Authenticated</span>
          ) : (
            <span className="text-red-400">✗ Not logged in</span>
          )}
        </div>
        
        <div>
          <span className="text-gray-400">Profile Status:</span>{' '}
          {profileLoading ? (
            <span className="text-yellow-400">Loading...</span>
          ) : profile ? (
            <span className="text-green-400">✓ Loaded</span>
          ) : (
            <span className="text-red-400">✗ Not loaded</span>
          )}
        </div>
        
        {user && (
          <>
            <div className="border-t border-gray-700 my-2 pt-2"></div>
            <div>
              <span className="text-gray-400">User ID:</span>{' '}
              <span className="text-blue-400">{user.id.slice(0, 8)}...</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>{' '}
              <span className="text-blue-400">{user.email}</span>
            </div>
          </>
        )}

        {profile && (
          <>
            <div className="border-t border-gray-700 my-2 pt-2"></div>
            <div>
              <span className="text-gray-400">Name:</span>{' '}
              <span className="text-blue-400">{profile.name}</span>
            </div>
            <div>
              <span className="text-gray-400">Location:</span>{' '}
              <span className="text-blue-400">{profile.location}</span>
            </div>
            <div>
              <span className="text-gray-400">Age/BMI:</span>{' '}
              <span className="text-blue-400">{profile.age}/{profile.bmi}</span>
            </div>
            <div>
              <span className="text-gray-400">Condition:</span>{' '}
              <span className="text-blue-400 text-[10px]">{profile.medicalCondition || 'None'}</span>
            </div>
          </>
        )}

        {!user && !loading && (
          <div className="border-t border-gray-700 my-2 pt-2 text-yellow-400">
            ⚠️ Please log in to load profile
          </div>
        )}

        {user && !profile && !profileLoading && (
          <div className="border-t border-gray-700 my-2 pt-2 text-red-400">
            ⚠️ Profile failed to load. Check console.
          </div>
        )}
      </div>
    </div>
  );
}