import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Ruler,
  Globe,
  Layout,
  Bell,
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  RotateCcw,
  Save,
  Palette,
  ChefHat,
  ShieldCheck,
  Heart,
  Flame,
  Sparkles,
  Sliders,
  Check,
  CheckCircle2,
  Volume2,
  Smartphone,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useUnits } from "../contexts/UnitsContext";
import { useLanguage, supportedLanguages } from "../contexts/LanguageContext";
import { useDashboard, DashboardWidget } from "../contexts/DashboardContext";
import { Button } from "../components/ui/button";
import AmbientBackground from "../components/AmbientBackground";
import GoogleTranslateWidget from "../components/GoogleTranslateWidget";
import { toast } from "sonner";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { motion, AnimatePresence } from "motion/react";

type PersonalizationTab = "theme" | "dietary" | "clinical" | "language" | "dashboard";

export default function Personalization() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { unitSystem, setUnitSystem } = useUnits();
  const { language, setLanguage } = useLanguage();
  const { widgets, updateWidgetVisibility, reorderWidgets, resetToDefault } = useDashboard();

  const [activeTab, setActiveTab] = useState<PersonalizationTab>("theme");
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>(widgets);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Cultural & Dietary Customization state (stored in localStorage)
  const [allergies, setAllergies] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("allergies") || '["None"]');
    } catch {
      return ["None"];
    }
  });

  const [swallowPreference, setSwallowPreference] = useState<string>(() => {
    return localStorage.getItem("preferred_swallow") || "unripe_plantain";
  });

  const [spiceTolerance, setSpiceTolerance] = useState<string>(() => {
    return localStorage.getItem("spice_tolerance") || "medium";
  });

  const [primaryGoal, setPrimaryGoal] = useState<string>(() => {
    return localStorage.getItem("userPrimaryGoal") || "glucose_control";
  });

  const [avoPersonality, setAvoPersonality] = useState<string>(() => {
    return localStorage.getItem("avo_personality") || "friendly";
  });

  // Allergy toggle
  const toggleAllergy = (allergy: string) => {
    triggerHaptic("light");
    let next: string[];
    if (allergy === "None") {
      next = ["None"];
    } else {
      const filtered = allergies.filter((a) => a !== "None");
      if (filtered.includes(allergy)) {
        next = filtered.filter((a) => a !== allergy);
        if (next.length === 0) next = ["None"];
      } else {
        next = [...filtered, allergy];
      }
    }
    setAllergies(next);
    localStorage.setItem("allergies", JSON.stringify(next));
    toast.success("Allergy profile updated");
  };

  const handleSaveDietary = () => {
    localStorage.setItem("preferred_swallow", swallowPreference);
    localStorage.setItem("spice_tolerance", spiceTolerance);
    localStorage.setItem("userPrimaryGoal", primaryGoal);
    localStorage.setItem("avo_personality", avoPersonality);
    triggerHaptic("milestone");
    triggerConfetti("cannon");
    toast.success("✨ Personalization Preferences Saved!");
  };

  const handleSaveWidgets = () => {
    reorderWidgets(localWidgets);
    triggerHaptic("milestone");
    toast.success("📱 Dashboard Layout Saved!");
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    const draggedIndex = localWidgets.findIndex((w) => w.id === draggedWidget);
    const targetIndex = localWidgets.findIndex((w) => w.id === targetId);

    const newWidgets = [...localWidgets];
    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);

    setLocalWidgets(newWidgets);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    triggerHaptic("light");
    setLocalWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    );
    updateWidgetVisibility(widgetId, !localWidgets.find((w) => w.id === widgetId)?.visible!);
  };

  const tabs: { id: PersonalizationTab; label: string; icon: any }[] = [
    { id: "theme", label: "Appearance", icon: Palette },
    { id: "dietary", label: "Food & Swallows", icon: ChefHat },
    { id: "clinical", label: "Health Targets", icon: ShieldCheck },
    { id: "language", label: "Language & Units", icon: Globe },
    { id: "dashboard", label: "Dashboard", icon: Layout },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#B8E5E5] via-[#E8F5F5] to-[#F8FBFB] pb-28 text-slate-800 relative select-none overflow-x-hidden">
      <AmbientBackground />

      {/* Floating Animated Ambient Glow Orbs */}
      <motion.div
        animate={{
          x: [0, 25, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-5 w-72 h-72 bg-teal-300/25 rounded-full blur-3xl pointer-events-none z-0"
      />
      <motion.div
        animate={{
          x: [0, -30, 25, 0],
          y: [0, 25, -20, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-96 left-0 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none z-0"
      />

      {/* Hero Header */}
      <div className="relative z-10 bg-gradient-to-r from-[#0b3c47] via-[#125e6d] to-[#1f7a8c] text-white pt-10 pb-6 px-5 sm:px-6 rounded-b-[2.5rem] shadow-xl border-b border-teal-500/20 overflow-hidden">
        {/* Subtle Shimmer Background */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-3xl mx-auto flex items-center justify-between mb-3 relative z-10">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("/profile")}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/15 shadow-xs"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-teal-200 border border-white/15 shadow-xs"
          >
            <Sliders size={13} className="text-amber-300 animate-spin-slow" />
            <span>Preferences Engine</span>
          </motion.div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight flex items-center gap-2">
              Personalization & Settings ⚙️
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 font-medium mt-1">
              Customize your visual theme, cultural swallow staples, health targets, and language.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-5 relative z-10">
        {/* Horizontal Navigation Tabs with Animated Sliding Pill */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-1.5 shadow-sm border border-teal-100/80 flex items-center gap-1 overflow-x-auto scrollbar-none relative">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  triggerHaptic("light");
                  setActiveTab(id);
                }}
                className={`relative flex-1 min-w-[90px] py-2.5 px-3 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer z-10 ${
                  active ? "text-white font-black" : "text-slate-600 hover:text-slate-900 font-bold text-xs"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activePersonalizationTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] rounded-2xl shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <motion.div
                  animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon size={16} />
                </motion.div>
                <span className="text-[11px] whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Animated Tab Content Container */}
        <AnimatePresence mode="wait">
          {/* Tab 1: Appearance & Theme */}
          {activeTab === "theme" && (
            <motion.div
              key="theme"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sun size={18} className="text-[#1f7a8c] animate-pulse" />
                    <span>Display Theme</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your comfortable color mode for reading and logging.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "light", icon: Sun, label: "Light Mode", desc: "Crisp white & teal for bright days" },
                    { value: "dark", icon: Moon, label: "Dark Mode", desc: "Reduced glare & OLED contrast" },
                    { value: "auto", icon: Monitor, label: "System Sync", desc: "Follows device schedule" },
                  ].map(({ value, icon: Icon, label, desc }) => {
                    const isSelected = theme === value;
                    return (
                      <motion.button
                        key={value}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          triggerHaptic("light");
                          setTheme(value as any);
                          toast.success(`Theme set to ${label}`);
                        }}
                        className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? "border-[#1f7a8c] bg-teal-50/80 shadow-md ring-2 ring-teal-400/30"
                            : "border-slate-200/80 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -right-6 -bottom-6 w-20 h-20 bg-teal-300/30 rounded-full blur-xl pointer-events-none"
                          />
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`p-2.5 rounded-2xl transition-transform ${
                              isSelected
                                ? "bg-[#1f7a8c] text-white shadow-sm scale-105"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              className="h-5 w-5 rounded-full bg-[#1f7a8c] text-white flex items-center justify-center shadow-xs"
                            >
                              <Check size={12} strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">{label}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{desc}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: Food & Cultural Swallows */}
          {activeTab === "dietary" && (
            <motion.div
              key="dietary"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Preferred Swallow Staple */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ChefHat size={18} className="text-[#1f7a8c] animate-bounce-gentle" />
                    <span>Preferred Swallow Base</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose your default staple for meals and swallow portion guidance.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "unripe_plantain", name: "Unripe Plantain Flour", badge: "Low GI (-35% Spike)", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                    { id: "oat_swallow", name: "Oat Swallow + Psyllium", badge: "High Beta-Glucan", bg: "bg-teal-50 text-teal-800 border-teal-200" },
                    { id: "pounded_yam", name: "Pounded Yam (Moderate)", badge: "Traditional Fuel", bg: "bg-amber-50 text-amber-800 border-amber-200" },
                    { id: "yellow_garri", name: "Yellow Garri / Eba", badge: "Palm Oil Infused", bg: "bg-orange-50 text-orange-800 border-orange-200" },
                  ].map((item) => {
                    const selected = swallowPreference === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          triggerHaptic("light");
                          setSwallowPreference(item.id);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          selected
                            ? "border-[#1f7a8c] bg-teal-50/80 shadow-md ring-2 ring-teal-500/20"
                            : "border-slate-200/80 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-slate-900">{item.name}</span>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[#1f7a8c]"
                            >
                              <Check size={15} strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${item.bg}`}>
                          {item.badge}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Allergy Filters */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert size={18} className="text-rose-600 animate-pulse" />
                    <span>Allergies & Intolerances</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select ingredients to filter out from recipe recommendations.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "None",
                    "Peanuts (Groundnut)",
                    "Shellfish / Crayfish",
                    "Lactose / Dairy",
                    "Egg",
                    "Gluten / Wheat",
                    "Soy",
                  ].map((allergy) => {
                    const isChecked = allergies.includes(allergy);
                    return (
                      <motion.button
                        key={allergy}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isChecked
                            ? "bg-rose-50 border-rose-300 text-rose-800 shadow-xs font-black"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {isChecked ? "✓ " : "+ "}
                        {allergy}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSaveDietary}
                  className="w-full py-6 rounded-2xl bg-gradient-to-r from-[#1f7a8c] via-[#268f9a] to-[#4ecdc4] hover:from-[#176270] hover:to-[#38b2ac] text-white font-black text-sm shadow-md cursor-pointer transition-all"
                >
                  <Save size={16} className="mr-1.5" />
                  Save Food Preferences
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Tab 3: Clinical Targets & Coaching */}
          {activeTab === "clinical" && (
            <motion.div
              key="clinical"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <span>Primary Metabolic Focus</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tailors AI meal scores, glycemic buffers, and morning dawn protocols.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "glucose_control", label: "Glycemic Stability (Type 2 Diabetes / Pre-Diabetes)", icon: ShieldCheck, color: "text-emerald-700 bg-emerald-50" },
                    { id: "blood_pressure", label: "Blood Pressure & Sodium Defense (DASH Protocol)", icon: Heart, color: "text-rose-700 bg-rose-50" },
                    { id: "fat_loss", label: "Metabolic Fat Loss & Caloric Deficit", icon: Flame, color: "text-amber-700 bg-amber-50" },
                    { id: "energy_focus", label: "All-Day Energy & Cognitive Clarity", icon: Zap, color: "text-purple-700 bg-purple-50" },
                  ].map((goal) => {
                    const selected = primaryGoal === goal.id;
                    const Icon = goal.icon;
                    return (
                      <motion.button
                        key={goal.id}
                        whileHover={{ y: -3, scale: 1.01 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          triggerHaptic("light");
                          setPrimaryGoal(goal.id);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                          selected
                            ? "border-[#1f7a8c] bg-teal-50/80 shadow-md ring-2 ring-teal-500/20"
                            : "border-slate-200/80 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl shrink-0 ${goal.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-black text-slate-900 leading-snug block">
                            {goal.label}
                          </span>
                        </div>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[#1f7a8c] shrink-0"
                          >
                            <Check size={16} strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Avo Coaching Style */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={18} className="text-teal-600 animate-spin-slow" />
                    <span>Avo AI Coach Style</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose how your AI health coach interacts with you during meal analysis.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  {[
                    { id: "friendly", label: "Warm & Encouraging 🤗" },
                    { id: "clinical", label: "Clinical & Direct 🔬" },
                    { id: "strict", label: "High Discipline 💪" },
                  ].map((style) => (
                    <motion.button
                      key={style.id}
                      whileHover={{ y: -3, scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        triggerHaptic("light");
                        setAvoPersonality(style.id);
                      }}
                      className={`p-3.5 rounded-2xl border font-bold transition-all cursor-pointer ${
                        avoPersonality === style.id
                          ? "bg-gradient-to-r from-[#1f7a8c] to-[#268f9a] text-white border-[#1f7a8c] shadow-md scale-[1.02]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {style.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleSaveDietary}
                  className="w-full py-6 rounded-2xl bg-gradient-to-r from-[#1f7a8c] via-[#268f9a] to-[#4ecdc4] hover:from-[#176270] hover:to-[#38b2ac] text-white font-black text-sm shadow-md cursor-pointer transition-all"
                >
                  <Save size={16} className="mr-1.5" />
                  Save Health Targets
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Tab 4: Language & Units */}
          {activeTab === "language" && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Units System */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Ruler size={18} className="text-[#1f7a8c]" />
                    <span>Measurement Units</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose how your weight, height, liquids, and temperatures are formatted.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "metric", label: "Metric (Standard)", desc: "kg, cm, ml, °C" },
                    { value: "imperial", label: "Imperial (US/UK)", desc: "lbs, inches, fl oz, °F" },
                  ].map(({ value, label, desc }) => {
                    const isSelected = unitSystem === value;
                    return (
                      <motion.button
                        key={value}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          triggerHaptic("light");
                          setUnitSystem(value as any);
                          toast.success(`Units set to ${label}`);
                        }}
                        className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#1f7a8c] bg-teal-50/80 shadow-md ring-2 ring-teal-500/20"
                            : "border-slate-200/80 bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-slate-900">{label}</span>
                          {isSelected && <Check size={15} className="text-[#1f7a8c] font-black" />}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">{desc}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Native Language Selector */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Globe size={18} className="text-[#1f7a8c] animate-pulse" />
                    <span>Regional African Languages</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your native African regional dialect.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {supportedLanguages.map(({ code, name, flag }) => {
                    const isSelected = language === code;
                    return (
                      <motion.button
                        key={code}
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          triggerHaptic("light");
                          setLanguage(code as any);
                          toast.success(`Language set to ${name}`);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-teal-50/90 border-teal-400 text-teal-950 font-black shadow-sm ring-1 ring-teal-400"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-bold text-xs"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{flag}</span>
                          <span className="text-xs">{name}</span>
                        </div>
                        {isSelected && <Check size={15} className="text-teal-700 stroke-[3]" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* 10X Google Universal Translate Widget */}
                <div className="pt-3 border-t border-slate-100">
                  <GoogleTranslateWidget />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 5: Dashboard Layout */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layout size={18} className="text-[#1f7a8c]" />
                      <span>Home Dashboard Layout</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Drag to reorder cards or toggle card visibility.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      resetToDefault();
                      setLocalWidgets(widgets);
                      triggerHaptic("light");
                      toast.success("Dashboard reset to default");
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 p-1.5 rounded-xl hover:bg-rose-50 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </motion.button>
                </div>

                <div className="space-y-2">
                  {localWidgets.map((widget) => (
                    <motion.div
                      key={widget.id}
                      layout
                      whileHover={{ scale: 1.01 }}
                      draggable
                      onDragStart={() => handleDragStart(widget.id)}
                      onDragOver={(e) => handleDragOver(e, widget.id)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-move ${
                        draggedWidget === widget.id
                          ? "border-[#1f7a8c] bg-teal-50 opacity-60 shadow-md scale-102"
                          : "border-slate-200/80 bg-slate-50 hover:bg-slate-100/90"
                      }`}
                    >
                      <GripVertical size={16} className="text-slate-400 hover:text-slate-600" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {widget.name}
                        </span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          widget.visible
                            ? "bg-emerald-100 text-emerald-800 shadow-2xs"
                            : "bg-slate-200 text-slate-400"
                        }`}
                        title={widget.visible ? "Hide on Home" : "Show on Home"}
                      >
                        {widget.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSaveWidgets}
                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-[#1f7a8c] via-[#268f9a] to-[#4ecdc4] hover:from-[#176270] hover:to-[#38b2ac] text-white font-black text-sm shadow-md cursor-pointer transition-all"
                  >
                    <Save size={16} className="mr-1.5" />
                    Save Dashboard Layout
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
