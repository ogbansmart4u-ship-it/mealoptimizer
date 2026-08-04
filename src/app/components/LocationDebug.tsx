import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useLocation } from "../contexts/LocationContext";
import { updateUserProfile } from "../../lib/api";
import { Button } from "./ui/button";
import { toast } from "sonner";

/**
 * Debug component to test location saving
 * Add this to any page to diagnose location save issues
 */
export function LocationDebug() {
  const { profile } = useUser();
  const { selectedLocation } = useLocation();
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: [],
    };

    try {
      // Check 1: Profile exists
      results.checks.push({
        name: "Profile Loaded",
        status: !!profile ? "✅ PASS" : "❌ FAIL",
        details: profile ? `User: ${profile.email}` : "No profile found",
      });

      // Check 2: Location context exists
      results.checks.push({
        name: "Location Context",
        status: !!selectedLocation ? "✅ PASS" : "❌ FAIL",
        details: selectedLocation
          ? `${selectedLocation.displayName}`
          : "No location selected",
      });

      // Check 3: Profile has required fields
      if (profile) {
        const hasRequiredFields =
          profile.name && profile.age && profile.bmi && profile.location;
        results.checks.push({
          name: "Profile Complete",
          status: hasRequiredFields ? "✅ PASS" : "⚠️ WARNING",
          details: {
            name: profile.name || "Missing",
            age: profile.age || "Missing",
            bmi: profile.bmi || "Missing",
            location: profile.location || "Missing",
            medicalCondition: profile.medicalCondition || "Not set",
          },
        });

        // Check 4: Try to update location
        try {
          console.log("🧪 TEST: Attempting to save location...");
          const result = await updateUserProfile({
            name: profile.name,
            age: profile.age,
            bmi: profile.bmi,
            medicalCondition: profile.medicalCondition,
            location: selectedLocation.displayName,
            profilePicture: profile.profilePicture,
          });

          results.checks.push({
            name: "Backend Update",
            status: "✅ PASS",
            details: result,
          });

          toast.success("Test update successful!");
        } catch (error: any) {
          results.checks.push({
            name: "Backend Update",
            status: "❌ FAIL",
            details: {
              error: error.message,
              stack: error.stack,
            },
          });

          toast.error(`Test update failed: ${error.message}`);
        }
      }

      setTestResults(results);
    } catch (error: any) {
      results.error = error.message;
      setTestResults(results);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 bg-white rounded-lg shadow-2xl p-4 max-w-md border-2 border-yellow-400">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">
          🔧 Location Debug Tool
        </h3>
      </div>

      <div className="space-y-2 mb-3 text-xs">
        <div>
          <strong>Profile:</strong>{" "}
          {profile ? `${profile.email} ✅` : "Not loaded ❌"}
        </div>
        <div>
          <strong>Location:</strong>{" "}
          {selectedLocation ? `${selectedLocation.displayName} ✅` : "None ❌"}
        </div>
      </div>

      <Button
        onClick={runDiagnostics}
        disabled={testing}
        size="sm"
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
      >
        {testing ? "Testing..." : "Run Diagnostics"}
      </Button>

      {testResults && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
          <div className="text-xs space-y-2">
            <div className="font-bold text-gray-700">
              Test Results ({testResults.timestamp})
            </div>
            {testResults.checks.map((check: any, idx: number) => (
              <div key={idx} className="border-b border-gray-200 pb-2">
                <div className="font-semibold">
                  {check.status} {check.name}
                </div>
                <pre className="text-[10px] text-gray-600 mt-1 whitespace-pre-wrap">
                  {typeof check.details === "object"
                    ? JSON.stringify(check.details, null, 2)
                    : check.details}
                </pre>
              </div>
            ))}
            {testResults.error && (
              <div className="text-red-600 font-semibold">
                ERROR: {testResults.error}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-2 text-[10px] text-gray-500">
        Check browser console for detailed logs
      </div>
    </div>
  );
}
