import React, { useState } from "react";
import {
  Activity, MapPin, Scale, Calendar, Pill, Stethoscope,
  Lightbulb, BookOpen, Heart, ChevronRight,
  Shield, Droplet, Moon, Dumbbell, Clock, AlertCircle, FileText,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

type EducationalTopic = {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  content: string;
  tips: string[];
};

const educationalTopics: EducationalTopic[] = [
  {
    id: "diabetes",
    title: "Managing Diabetes",
    icon: "🩺",
    color: "text-red-600",
    bgColor: "bg-red-50",
    content: "Understanding how to manage Type 2 Diabetes through proper nutrition is crucial for maintaining healthy blood sugar levels and overall well-being.",
    tips: [
      "Monitor carbohydrate intake and choose complex carbs",
      "Eat regular meals at consistent times",
      "Include fiber-rich foods in every meal",
      "Stay hydrated with water throughout the day",
      "Limit processed foods and added sugars",
    ],
  },
  {
    id: "nutrition",
    title: "Nutrition Basics",
    icon: "🥗",
    color: "text-green-600",
    bgColor: "bg-green-50",
    content: "A balanced diet includes the right mix of macronutrients (proteins, carbohydrates, and fats) and micronutrients (vitamins and minerals).",
    tips: [
      "Fill half your plate with vegetables",
      "Choose lean proteins like fish and poultry",
      "Include healthy fats from nuts and olive oil",
      "Opt for whole grains over refined grains",
      "Eat a variety of colorful fruits and vegetables",
    ],
  },
  {
    id: "local-foods",
    title: "Nigerian Superfoods",
    icon: "🌿",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    content: "Local Nigerian foods like Ugu, Ewedu, and Ogbono are packed with nutrients and can support your health goals effectively.",
    tips: [
      "Ugu (fluted pumpkin) is rich in iron and vitamins",
      "Bitter leaf helps with blood sugar management",
      "Ogbono provides healthy fiber for digestion",
      "Garden egg is low in calories and nutritious",
      "Ukazi leaf supports heart health",
    ],
  },
];

export default function Health() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<EducationalTopic | null>(null);
  const [showEducationalDialog, setShowEducationalDialog] = useState(false);

  const handleTopicClick = (topic: EducationalTopic) => {
    setSelectedTopic(topic);
    setShowEducationalDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] to-[#E8F5F5] pb-24">
      {/* Header */}
      <div className="bg-[#B8E5E5] px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Health</h1>
      </div>

      <div className="px-6 mt-4">
        {/* My Body Profile */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/biometrics")}
            className="w-full bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-4 border-2 border-red-400 hover:scale-[1.02] cursor-pointer"
          >
            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-3 flex-shrink-0">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div className="text-left flex-1">
              <span className="text-base text-red-700 uppercase tracking-wide font-semibold block">My Body Profile</span>
              <span className="text-sm text-gray-600">View your biometric data and health metrics</span>
            </div>
            <ChevronRight className="h-5 w-5 text-red-400 flex-shrink-0" />
          </button>
        </div>

        {/* Health Trackers Grid */}
        <div className="mb-6">
          <h3 className="text-lg mb-3 text-gray-800">Health Trackers</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Medical Vault", icon: Shield,      gradient: "from-purple-500 to-pink-500",   border: "border-purple-400", route: "/medical-vault" },
              { label: "Hydration",     icon: Droplet,     gradient: "from-blue-500 to-cyan-500",     border: "border-blue-400",   route: "/hydration" },
              { label: "Sleep",         icon: Moon,        gradient: "from-indigo-500 to-purple-500", border: "border-indigo-400", route: "/sleep" },
              { label: "Medication",    icon: Pill,        gradient: "from-emerald-500 to-teal-500",  border: "border-emerald-400",route: "/medications" },
              { label: "Workout",       icon: Dumbbell,    gradient: "from-orange-500 to-red-500",    border: "border-orange-400", route: "/workout" },
              { label: "Fasting",       icon: Clock,       gradient: "from-purple-600 to-pink-600",   border: "border-purple-400", route: "/fasting" },
              { label: "Symptoms",      icon: AlertCircle, gradient: "from-red-500 to-orange-500",    border: "border-red-400",    route: "/symptoms" },
              { label: "Doctor Report", icon: FileText,    gradient: "from-teal-500 to-cyan-500",     border: "border-teal-400",   route: "/health-report" },
            ].map(({ label, icon: Icon, gradient, border, route }) => (
              <button
                key={route}
                onClick={() => navigate(route)}
                className={`bg-[#ffffff] rounded-2xl p-5 shadow-sm border-2 ${border} flex flex-col items-center justify-center gap-3 hover:shadow-md hover:scale-105 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 cursor-pointer`}
              >
                <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* My Health Profile */}
        <div className="bg-gradient-to-br from-white via-[#F0F9FA] to-[#E0F2F4] rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="text-center text-[#e63946] mb-4">My Health Profile</h3>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => navigate("/location")}
              className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
            >
              <div className="bg-[#1f7a8c] rounded-full p-3 mb-2 hover:bg-[#4ecdc4] transition-colors">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-gray-700">Location</span>
            </button>
            <button
              onClick={() => navigate("/weight")}
              className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
            >
              <div className="bg-[#1f7a8c] rounded-full p-3 mb-2 hover:bg-[#4ecdc4] transition-colors">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-gray-700">Weight</span>
            </button>
            <button
              onClick={() => navigate("/age")}
              className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
            >
              <div className="bg-[#1f7a8c] rounded-full p-3 mb-2 hover:bg-[#4ecdc4] transition-colors">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-gray-700">Age</span>
            </button>
            <button
              onClick={() => navigate("/medications")}
              className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
            >
              <div className="bg-[#1f7a8c] rounded-full p-3 mb-2 hover:bg-[#4ecdc4] transition-colors">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-gray-700">Drugs</span>
            </button>
            <button
              onClick={() => navigate("/medical-condition")}
              className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer"
            >
              <div className="bg-[#1f7a8c] rounded-full p-3 mb-2 hover:bg-[#4ecdc4] transition-colors">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center">Medical<br />condition</span>
            </button>
          </div>
        </div>

        {/* Health Education */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg text-gray-800">Health Education</h3>
            <div className="flex items-center gap-1 text-[#1f7a8c]">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm">Learn More</span>
            </div>
          </div>
          <div className="space-y-3">
            {educationalTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic)}
                className="w-full bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-[#1f7a8c]"
              >
                <div className="flex items-center gap-4">
                  <div className={`${topic.bgColor} rounded-xl p-3 text-2xl`}>
                    {topic.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className={`text-sm mb-1 ${topic.color}`}>{topic.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-1">{topic.content}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Educational Topic Dialog */}
      <Dialog open={showEducationalDialog} onOpenChange={setShowEducationalDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedTopic && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className={`${selectedTopic.bgColor} rounded-full p-6 text-5xl`}>
                    {selectedTopic.icon}
                  </div>
                </div>
                <DialogTitle className={`text-2xl text-center mb-2 ${selectedTopic.color}`}>
                  {selectedTopic.title}
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  Learn more about this health topic
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className={`${selectedTopic.bgColor} rounded-2xl p-4`}>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedTopic.content}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className={`h-5 w-5 ${selectedTopic.color}`} />
                    <h3 className={`text-lg ${selectedTopic.color}`}>Key Tips</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedTopic.tips.map((tip, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className={`${selectedTopic.bgColor} rounded-full p-2 mt-0.5`}>
                          <span className="text-xs">✓</span>
                        </div>
                        <p className="text-sm text-gray-700 flex-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${selectedTopic.bgColor} rounded-2xl p-4 border-2 ${selectedTopic.color.replace("text", "border")}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className={`h-4 w-4 ${selectedTopic.color}`} />
                    <p className={`text-sm ${selectedTopic.color}`}>Want to learn more?</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Consult with a healthcare professional for personalized advice tailored to your specific needs.
                  </p>
                </div>

                <button
                  onClick={() => setShowEducationalDialog(false)}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white rounded-2xl py-4 hover:shadow-lg transition-all"
                >
                  Got It!
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
