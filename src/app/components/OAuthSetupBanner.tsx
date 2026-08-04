import { useState } from 'react';
import { X, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

/**
 * OAuthSetupBanner - Shows setup status for Google and Apple OAuth
 * Remove this component once OAuth is fully configured
 */
export function OAuthSetupBanner() {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('oauth-banner-dismissed') === 'true'
  );

  const handleDismiss = () => {
    localStorage.setItem('oauth-banner-dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 max-w-2xl w-full mx-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg p-4 z-50">
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">
            OAuth Setup Required
          </h3>
          
          <p className="text-sm text-blue-800 mb-3">
            Google and Apple sign-in buttons are ready, but need to be configured in Supabase.
          </p>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-blue-900">Google OAuth: Not configured</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-blue-900">Apple OAuth: Not configured</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <a
              href="/OAUTH_QUICK_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quick Setup Guide
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <a
              href="https://supabase.com/dashboard/project/jgbffgckrhiqshkogvia/auth/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-white text-blue-600 border border-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Supabase Auth Settings
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-blue-400 hover:text-blue-600 transition-colors"
          title="Dismiss (won't show again)"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Compact version for already logged-in users
 * Shows in settings/profile
 */
export function OAuthStatusIndicator() {
  // In production, you'd check actual OAuth provider status from Supabase
  // For now, this is a placeholder
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-2 text-sm">
        Social Sign-In Options
      </h4>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              </svg>
            </div>
            <span className="text-blue-900">Google</span>
          </div>
          <span className="text-orange-600 font-medium">Not Configured</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="white" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <span className="text-blue-900">Apple</span>
          </div>
          <span className="text-orange-600 font-medium">Not Configured</span>
        </div>
      </div>
      
      <p className="text-xs text-blue-700 mt-3">
        Configure OAuth providers to enable social sign-in for all users.
      </p>
    </div>
  );
}
