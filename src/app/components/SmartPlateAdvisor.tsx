import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, AlertTriangle, X, Lightbulb, Flame, Shield } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { findMatchingPairings, PairingEffect } from "../data/nutrientPairings";
import { toast } from "sonner";

type SmartPlateAdvisorProps = {
  foodItem: string;
  isOpen: boolean;
  onClose: () => void;
  onAddSuggestion?: (suggestion: string) => void;
};

export default function SmartPlateAdvisor({
  foodItem,
  isOpen,
  onClose,
  onAddSuggestion,
}: SmartPlateAdvisorProps) {
  const [optimizationMode, setOptimizationMode] = useState<'absorption' | 'inflammation'>('absorption');
  const [showGlow, setShowGlow] = useState(false);

  const pairings = findMatchingPairings(foodItem);
  const hasPairings = pairings.length > 0;

  useEffect(() => {
    if (isOpen && hasPairings) {
      setShowGlow(true);
      setTimeout(() => setShowGlow(false), 2000);
    }
  }, [isOpen, hasPairings]);

  if (!hasPairings) {
    return null;
  }

  const mainPairing = pairings[0];

  // Filter suggestions based on optimization mode
  const relevantSuggestions = mainPairing.pairsWith.filter(pairing => {
    if (optimizationMode === 'absorption') {
      return pairing.effect === 'maximize-absorption' || pairing.effect === 'both';
    } else {
      return pairing.effect === 'minimize-inflammation' || pairing.effect === 'both';
    }
  });

  const avoidances = mainPairing.avoidPairing;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-md max-h-[90vh] overflow-y-auto ${showGlow ? 'ring-4 ring-green-400 ring-opacity-50 animate-pulse' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-full p-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Bio-Synergy Alert</h2>
              <p className="text-sm text-gray-600">Smart pairing for {mainPairing.ingredient}</p>
            </div>
          </div>
        </div>

        {/* Optimization Mode Toggle */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {optimizationMode === 'absorption' ? (
                <TrendingUp className="h-5 w-5 text-blue-600" />
              ) : (
                <Shield className="h-5 w-5 text-purple-600" />
              )}
              <span className="text-sm font-semibold text-gray-700">Optimization Mode</span>
            </div>
            <Switch
              checked={optimizationMode === 'inflammation'}
              onCheckedChange={(checked) => setOptimizationMode(checked ? 'inflammation' : 'absorption')}
            />
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setOptimizationMode('absorption')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                optimizationMode === 'absorption'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Maximize Absorption
            </button>
            <button
              onClick={() => setOptimizationMode('inflammation')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                optimizationMode === 'inflammation'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Minimize Inflammation
            </button>
          </div>
        </div>

        {/* Pro Tips Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">Pro Tips</h3>
          </div>

          {relevantSuggestions.length > 0 ? (
            relevantSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${
                  optimizationMode === 'absorption'
                    ? 'from-green-50 to-teal-50 border-green-300'
                    : 'from-purple-50 to-pink-50 border-purple-300'
                } border-2 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg`}
              >
                {/* Pairing Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-800 mb-1">
                      + {suggestion.food}
                    </div>
                    <div className={`text-xs font-semibold ${
                      optimizationMode === 'absorption' ? 'text-green-700' : 'text-purple-700'
                    }`}>
                      {suggestion.nutrient}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    optimizationMode === 'absorption'
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    +{suggestion.bioavailabilityBoost}%
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-sm text-gray-700 mb-3">
                  {suggestion.explanation}
                </p>

                {/* Engineer's Note */}
                <div className={`bg-gradient-to-r ${
                  optimizationMode === 'absorption'
                    ? 'from-green-600 to-teal-600'
                    : 'from-purple-600 to-pink-600'
                } text-white rounded-xl p-3 text-sm font-medium`}>
                  <div className="flex items-start gap-2">
                    <Flame className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs opacity-90 mb-1">Engineer's Note:</div>
                      <div>{suggestion.engineerNote}</div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {onAddSuggestion && (
                  <button
                    onClick={() => {
                      onAddSuggestion(suggestion.food);
                      toast.success(`Added ${suggestion.food} to your plate!`, {
                        description: `Bio-synergy activated: +${suggestion.bioavailabilityBoost}% effectiveness`,
                      });
                    }}
                    className={`w-full mt-3 py-2 rounded-lg font-semibold transition-colors ${
                      optimizationMode === 'absorption'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Add to Plate
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-600 text-sm">
              No specific pairings for {optimizationMode === 'absorption' ? 'absorption' : 'inflammation'} mode.
              Try switching modes!
            </div>
          )}
        </div>

        {/* Avoidances Section */}
        {avoidances.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Avoid These Combos</h3>
            </div>

            <div className="space-y-2">
              {avoidances.map((avoid, idx) => (
                <div
                  key={idx}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-3"
                >
                  <div className="flex items-start gap-2">
                    <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-red-800 mb-1">
                        {avoid.food}
                      </div>
                      <div className="text-xs text-red-700 mb-1">
                        {avoid.reason}
                      </div>
                      <div className="text-xs text-red-600 font-medium">
                        ⚠️ {avoid.impact}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
        >
          Got It!
        </button>
      </DialogContent>
    </Dialog>
  );
}
