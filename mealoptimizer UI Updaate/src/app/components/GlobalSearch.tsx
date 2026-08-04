import { useState, useEffect } from "react";
import { Search, X, Clock, Utensils, Pill, Activity, AlertCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

type SearchResult = {
  id: string;
  type: "meal" | "symptom" | "medication" | "workout" | "log";
  title: string;
  subtitle?: string;
  date?: string;
  route: string;
  icon: typeof Utensils;
  color: string;
};

type GlobalSearchProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    performSearch(searchQuery);
  }, [searchQuery]);

  const performSearch = (query: string) => {
    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search meal logs
    const mealLogs = localStorage.getItem("mealLogs");
    if (mealLogs) {
      try {
        const logs = JSON.parse(mealLogs);
        logs
          .filter((log: any) =>
            log.mealName?.toLowerCase().includes(lowerQuery) ||
            log.notes?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 3)
          .forEach((log: any) => {
            searchResults.push({
              id: log.id || log.timestamp,
              type: "meal",
              title: log.mealName || "Meal Log",
              subtitle: log.mealType,
              date: new Date(log.timestamp || log.date).toLocaleDateString(),
              route: "/logs",
              icon: Utensils,
              color: "text-green-600",
            });
          });
      } catch (e) {
        console.error("Error searching meal logs:", e);
      }
    }

    // Search symptoms
    const symptoms = localStorage.getItem("symptomTrackerData");
    if (symptoms) {
      try {
        const symptomData = JSON.parse(symptoms);
        symptomData
          .filter((symptom: any) =>
            symptom.symptom?.toLowerCase().includes(lowerQuery) ||
            symptom.notes?.toLowerCase().includes(lowerQuery) ||
            symptom.triggers?.some((t: string) => t.toLowerCase().includes(lowerQuery))
          )
          .slice(0, 3)
          .forEach((symptom: any) => {
            searchResults.push({
              id: symptom.id,
              type: "symptom",
              title: symptom.symptom,
              subtitle: `${symptom.severity} - ${symptom.triggers?.join(", ") || ""}`,
              date: new Date(symptom.date).toLocaleDateString(),
              route: "/symptoms",
              icon: AlertCircle,
              color: "text-red-600",
            });
          });
      } catch (e) {
        console.error("Error searching symptoms:", e);
      }
    }

    // Search medications
    const medications = localStorage.getItem("medicationTrackerData");
    if (medications) {
      try {
        const medData = JSON.parse(medications);
        medData
          .filter((med: any) =>
            med.name?.toLowerCase().includes(lowerQuery) ||
            med.dosage?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 3)
          .forEach((med: any) => {
            searchResults.push({
              id: med.id,
              type: "medication",
              title: med.name,
              subtitle: `${med.dosage} - ${med.frequency}`,
              route: "/medications",
              icon: Pill,
              color: "text-emerald-600",
            });
          });
      } catch (e) {
        console.error("Error searching medications:", e);
      }
    }

    // Search workouts
    const workouts = localStorage.getItem("workoutLoggerData");
    if (workouts) {
      try {
        const workoutData = JSON.parse(workouts);
        workoutData
          .filter((workout: any) =>
            workout.type?.toLowerCase().includes(lowerQuery) ||
            workout.notes?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 3)
          .forEach((workout: any) => {
            searchResults.push({
              id: workout.id,
              type: "workout",
              title: workout.type.charAt(0).toUpperCase() + workout.type.slice(1),
              subtitle: `${workout.duration} min - ${workout.calories} cal`,
              date: new Date(workout.date).toLocaleDateString(),
              route: "/workout",
              icon: Activity,
              color: "text-orange-600",
            });
          });
      } catch (e) {
        console.error("Error searching workouts:", e);
      }
    }

    setResults(searchResults);
  };

  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    navigate(result.route);
    onClose();
    setSearchQuery("");
  };

  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Search meals, symptoms, medications, and workouts</DialogDescription>
        </DialogHeader>
        {/* Search Input */}
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search meals, symptoms, medications, workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1f7a8c] focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
          {searchQuery.trim().length < 2 ? (
            // Recent Searches
            recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600">Recent Searches</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => {
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg text-left transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-gray-100 ${result.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    {result.date && (
                      <span className="text-xs text-gray-400">{result.date}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
