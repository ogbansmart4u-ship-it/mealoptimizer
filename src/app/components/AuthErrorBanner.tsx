import { useState, useEffect } from "react";
import { AlertCircle, X, ExternalLink } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

/**
 * Banner that appears when JWT authentication fails
 * Provides clear instructions to fix the SUPABASE_ANON_KEY issue
 */
export function AuthErrorBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Listen for console errors mentioning JWT
    const originalError = console.error;
    console.error = (...args: any[]) => {
      originalError(...args);
      
      // Check if this is a JWT error
      const errorString = args.join(' ');
      if (errorString.includes('Invalid JWT') || 
          errorString.includes('AUTHENTICATION ERROR DETECTED')) {
        if (!dismissed) {
          setShow(true);
        }
      }
    };

    return () => {
      console.error = originalError;
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
  };

  const openDocs = () => {
    // Open the fix documentation
    window.open('/FIX_INVALID_JWT.md', '_blank');
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <Alert className="border-2 border-red-500 bg-red-50 shadow-2xl">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <AlertTitle className="text-red-900 text-lg font-bold mb-2">
                🔐 Authentication Error: Invalid JWT
              </AlertTitle>
              <AlertDescription className="text-red-800 space-y-2">
                <p className="font-semibold">
                  Your Edge Function cannot verify authentication tokens.
                </p>
                <p className="text-sm">
                  <strong>Why:</strong> The <code className="bg-red-200 px-1 rounded">SUPABASE_ANON_KEY</code> environment variable is not set in your Edge Function.
                </p>
                <div className="bg-white/80 border-l-4 border-red-500 p-3 rounded mt-3">
                  <p className="text-sm font-bold mb-2">Quick Fix (2 minutes):</p>
                  <ol className="text-sm space-y-1 ml-4 list-decimal">
                    <li>Go to <strong>Supabase Dashboard</strong> → <strong>Settings</strong> → <strong>API</strong></li>
                    <li>Copy your <strong>anon/public key</strong></li>
                    <li>Go to <strong>Edge Functions</strong> → <strong>make-server-ba6f1f45</strong> → <strong>Settings</strong></li>
                    <li>Add secret: <code className="bg-red-200 px-1 rounded">SUPABASE_ANON_KEY</code> = your key</li>
                    <li>Click <strong>Deploy</strong></li>
                  </ol>
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-900 underline"
                  >
                    Open Supabase Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-red-600 hover:text-red-900 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      </div>
    </div>
  );
}
