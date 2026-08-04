import { Stethoscope, ChevronLeft, Plus, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import OnboardingProgress from "../components/OnboardingProgress";

interface Condition {
  id: number;
  name: string;
  severity: "mild" | "moderate" | "severe";
  diagnosedDate: string;
}

export default function MedicalCondition() {
  const navigate = useNavigate();
  const [conditions, setConditions] = useState<Condition[]>([
    {
      id: 1,
      name: "Type 2 Diabetes",
      severity: "moderate",
      diagnosedDate: "2020-03",
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: "",
    severity: "moderate" as "mild" | "moderate" | "severe",
    diagnosedDate: "",
  });

  const commonConditions = [
    "Type 2 Diabetes",
    "Type 1 Diabetes",
    "Hypertension (High Blood Pressure)",
    "High Cholesterol",
    "Heart Disease",
    "Celiac Disease",
    "Lactose Intolerance",
    "Food Allergies",
    "IBS (Irritable Bowel Syndrome)",
    "GERD (Acid Reflux)",
    "Kidney Disease",
    "Anemia",
    "Thyroid Disorder",
    "Obesity",
    "Osteoporosis",
  ];

  const addCondition = () => {
    if (newCondition.name) {
      setConditions([
        ...conditions,
        {
          id: Date.now(),
          ...newCondition,
          diagnosedDate: newCondition.diagnosedDate || new Date().toISOString().slice(0, 7),
        },
      ]);
      setNewCondition({
        name: "",
        severity: "moderate",
        diagnosedDate: "",
      });
      setShowAddForm(false);
    }
  };

  const removeCondition = (id: number) => {
    setConditions(conditions.filter((cond) => cond.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "from-green-50 to-green-100 border-green-200";
      case "moderate":
        return "from-yellow-50 to-yellow-100 border-yellow-200";
      case "severe":
        return "from-red-50 to-red-100 border-red-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-green-500 text-white";
      case "moderate":
        return "bg-yellow-500 text-white";
      case "severe":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-8">
      {/* Header */}
      <div className="bg-[#1f7a8c] px-6 pt-12 pb-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate("/home")}
            className="mr-4 text-white hover:bg-white/10 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl text-white flex-1">Medical Conditions</h1>
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Onboarding Progress */}
      <div className="px-6 mt-6">
        <OnboardingProgress currentStep={5} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="px-6 mt-6">
        {/* Privacy Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium text-blue-800 mb-1">Your Health Privacy</p>
            <p>Your medical information is confidential and will only be used to personalize your nutrition plan.</p>
          </div>
        </div>

        {/* Current Conditions */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-[#1f7a8c]">My Conditions</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-full p-2 hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {conditions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No conditions added yet</p>
              <p className="text-sm">Tap the + button to add</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className={`bg-gradient-to-r ${getSeverityColor(condition.severity)} border-2 rounded-2xl p-4 relative`}
                >
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  
                  <div className="pr-8">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg text-gray-800">{condition.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityBadge(condition.severity)}`}>
                        {condition.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Diagnosed: {new Date(condition.diagnosedDate + "-01").toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Condition Form */}
        {showAddForm && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h2 className="text-lg text-[#1f7a8c] mb-4">Add Medical Condition</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Condition Name</label>
                <input
                  type="text"
                  value={newCondition.name}
                  onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                  placeholder="Type or select from suggestions"
                  list="conditions-list"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                />
                <datalist id="conditions-list">
                  {commonConditions.map((cond, index) => (
                    <option key={index} value={cond} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Severity</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewCondition({ ...newCondition, severity: "mild" })}
                    className={`p-3 rounded-xl transition-all ${
                      newCondition.severity === "mild"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Mild
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCondition({ ...newCondition, severity: "moderate" })}
                    className={`p-3 rounded-xl transition-all ${
                      newCondition.severity === "moderate"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Moderate
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCondition({ ...newCondition, severity: "severe" })}
                    className={`p-3 rounded-xl transition-all ${
                      newCondition.severity === "severe"
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Severe
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Diagnosed Date</label>
                <input
                  type="month"
                  value={newCondition.diagnosedDate}
                  onChange={(e) => setNewCondition({ ...newCondition, diagnosedDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#4ecdc4]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 rounded-xl py-3 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCondition}
                  className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-xl py-3 hover:shadow-lg transition-all"
                >
                  Add Condition
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nutritional Impact */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg text-[#e63946] mb-4">How We Help</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-xl">🎯</span>
              <p>Personalized meal plans tailored to your specific conditions</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">⚠️</span>
              <p>Automatic warnings about foods to avoid</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">✅</span>
              <p>Recommendations for beneficial nutrients and foods</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl">📊</span>
              <p>Track how your diet affects your health over time</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/home")}
            className="px-6 py-4 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Skip
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 shadow-lg hover:shadow-xl transition-all"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
}
