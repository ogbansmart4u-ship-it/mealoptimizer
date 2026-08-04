import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { X, RefreshCw, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

export function HealthCheck() {
  const [health, setHealth] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(() => {
    // Check if user has permanently dismissed the health check
    return localStorage.getItem('healthcheck-dismissed') === 'true';
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showOnSuccess, setShowOnSuccess] = useState(() => {
    // Only show on success if explicitly enabled (for debugging)
    return localStorage.getItem('healthcheck-show-success') === 'true';
  });

  const checkHealth = async () => {
    try {
      console.log('HealthCheck: Fetching health status...');
      setRefreshing(true);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ba6f1f45/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      console.log('HealthCheck: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HealthCheck: Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('HealthCheck: Response data:', data);
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      setHealth(data);
      setError(null);
      
      // If backend is healthy, auto-dismiss after first successful check
      // unless user has enabled "show on success" mode
      if (!showOnSuccess) {
        setDismissed(true);
      }
    } catch (err: any) {
      console.error('HealthCheck: Error:', err);
      setError(err.message || 'Failed to connect to backend');
      // Always show errors, even if previously dismissed
      setDismissed(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
    
    // Recheck every 60 seconds (reduced from 30 for less intrusion)
    const interval = setInterval(checkHealth, 60000);
    
    // Add keyboard shortcut: Ctrl+Shift+H to toggle health check
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        const newValue = !showOnSuccess;
        setShowOnSuccess(newValue);
        localStorage.setItem('healthcheck-show-success', newValue ? 'true' : 'false');
        setDismissed(!newValue);
        if (newValue) {
          console.log('✅ HealthCheck: Always visible mode enabled. Press Ctrl+Shift+H again to disable.');
        } else {
          console.log('❌ HealthCheck: Auto-hide mode enabled (only shows errors). Press Ctrl+Shift+H to show always.');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showOnSuccess]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('healthcheck-dismissed', 'true');
  };

  const handleToggleShowSuccess = () => {
    const newValue = !showOnSuccess;
    setShowOnSuccess(newValue);
    localStorage.setItem('healthcheck-show-success', newValue ? 'true' : 'false');
    if (!newValue) {
      setDismissed(true);
    } else {
      setDismissed(false);
    }
  };

  // Don't render if dismissed
  if (dismissed) {
    return null;
  }

  if (loading) {
    return null; // Don't show loading state to avoid flash on page load
  }

  if (error) {
    // Determine if this is a "Failed to fetch" error (Edge Function not deployed)
    const isConnectionError = error.includes('Failed to fetch') || error.includes('NetworkError');
    
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border-2 border-red-400 text-red-900 px-5 py-4 rounded-xl shadow-2xl max-w-md z-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <h3 className="font-bold text-base">Backend Not Responding</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={checkHealth}
              disabled={refreshing}
              className="hover:bg-red-100 p-1.5 rounded transition-colors"
              title="Retry connection"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setDismissed(true)}
              className="hover:bg-red-100 p-1.5 rounded transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
            <p className="text-sm font-semibold mb-1">Error:</p>
            <p className="text-sm font-mono">{error}</p>
          </div>
          
          {isConnectionError ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">🔧 Quick Fix:</p>
              <ol className="text-xs space-y-1.5 list-decimal list-inside">
                <li>Open terminal in your project directory</li>
                <li>Run: <code className="bg-red-200 px-1.5 py-0.5 rounded font-mono">supabase functions deploy make-server-ba6f1f45</code></li>
                <li>Wait 30 seconds, then click Retry</li>
              </ol>
              
              <div className="mt-3 pt-3 border-t border-red-300">
                <p className="text-xs mb-2">
                  <strong>Need detailed instructions?</strong>
                </p>
                <a
                  href="/DEPLOY_AND_TEST.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors"
                >
                  View Deployment Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs">
              {error.includes('401') 
                ? '⚠️ Authentication error. Set SUPABASE_ANON_KEY in Edge Function secrets, then redeploy.'
                : '⚠️ The Edge Function may have crashed. Check function logs: supabase functions logs make-server-ba6f1f45 --tail'}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold">No Backend Response</h3>
          <button 
            onClick={() => setDismissed(true)}
            className="hover:bg-yellow-200 p-1 rounded transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm">Unable to retrieve health status.</p>
      </div>
    );
  }

  // Check if env object exists and has values
  const hasEnvData = health.env && typeof health.env === 'object';
  const envValues = hasEnvData ? Object.values(health.env) : [];
  const allEnvSet = envValues.length > 0 && envValues.every((v) => v === 'SET');

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg max-w-md border ${ 
      allEnvSet 
        ? 'bg-green-100 border-green-400 text-green-700' 
        : 'bg-yellow-100 border-yellow-400 text-yellow-700'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold">
          Backend Status: {health.status || 'Unknown'}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={checkHealth}
            disabled={refreshing}
            className={`p-1 rounded transition-colors ${
              allEnvSet 
                ? 'hover:bg-green-200' 
                : 'hover:bg-yellow-200'
            }`}
            title="Refresh status"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setDismissed(true)}
            className={`p-1 rounded transition-colors ${
              allEnvSet 
                ? 'hover:bg-green-200' 
                : 'hover:bg-yellow-200'
            }`}
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {hasEnvData ? (
        <div className="text-xs space-y-1">
          {Object.entries(health.env).map(([key, value]) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="font-mono">{key}:</span>
              <span className={value === 'SET' ? 'text-green-700 font-semibold' : 'text-red-700 font-bold'}>
                {value as string}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm">
          <p className="text-red-700 font-semibold mb-2">⚠️ Environment data not available</p>
          <p className="text-xs">
            The health endpoint is not returning environment variable status.
            This may indicate the Edge Function needs to be redeployed.
          </p>
        </div>
      )}
      
      {hasEnvData && !allEnvSet && (
        <p className="text-xs mt-2 pt-2 border-t border-yellow-300">
          ⚠️ Some environment variables are not set. 
          <br />
          Set them in Supabase Dashboard → Edge Functions → Secrets, then redeploy.
        </p>
      )}
      
      {hasEnvData && allEnvSet && (
        <p className="text-xs mt-2 pt-2 border-t border-green-300">
          ✅ All environment variables configured correctly!
        </p>
      )}
    </div>
  );
}