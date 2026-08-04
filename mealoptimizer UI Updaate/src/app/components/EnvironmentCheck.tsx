import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X, ExternalLink } from 'lucide-react';
import { projectId } from '/utils/supabase/info';

/**
 * EnvironmentCheck Component
 * 
 * Checks if the Edge Function environment variables are properly configured.
 * Shows a helpful message if SUPABASE_ANON_KEY is not set.
 */
export function EnvironmentCheck() {
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if user has permanently dismissed this warning
    const dismissed = localStorage.getItem('env-check-dismissed');
    if (dismissed === 'true') {
      setIsChecking(false);
      return;
    }
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/health`
      );

      // If fetch fails (edge function not deployed), silently exit
      if (!response.ok) {
        console.log('Edge function not available - working with mock data');
        setIsChecking(false);
        return;
      }

      const data = await response.json();
      setEnvStatus(data);

      // Only show the banner if SUPABASE_ANON_KEY is not set
      if (data.env?.SUPABASE_ANON_KEY !== 'SET') {
        setIsVisible(true);
      }
    } catch (error) {
      // Silently handle errors (edge function not deployed or network issues)
      // This allows the app to work perfectly with mock data
      console.log('Working in offline mode with mock data');
    } finally {
      setIsChecking(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('env-check-dismissed', 'true');
    setIsVisible(false);
  };

  if (isChecking || !isVisible) return null;

  const isAnonKeySet = envStatus?.env?.SUPABASE_ANON_KEY === 'SET';

  if (isAnonKeySet) return null; // Don't show if everything is OK

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 shadow-lg rounded-lg max-w-md">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Configuration Notice</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-amber-700 hover:text-amber-900 underline"
            >
              {isExpanded ? 'Hide details' : 'Show details'}
            </button>
          </div>

          <p className="text-xs mb-2">
            Edge Function environment variable <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">SUPABASE_ANON_KEY</code> is not configured.
          </p>

          {isExpanded && (
            <>
              <div className="bg-amber-100 rounded-lg p-3 mb-3 text-xs">
                <p className="font-semibold mb-2">Setup Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Supabase Dashboard → Edge Functions</li>
                  <li>Select function → Settings → Add secret: <code className="bg-amber-200 px-1 rounded">SUPABASE_ANON_KEY</code></li>
                  <li>Redeploy the function</li>
                </ol>
              </div>

              <div className="flex gap-2 flex-wrap">
                <a
                  href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-amber-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-amber-600 transition-colors"
                >
                  Open Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="text-amber-700 hover:bg-amber-100 rounded-full p-1 transition-colors flex-shrink-0"
          title="Dismiss permanently"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
