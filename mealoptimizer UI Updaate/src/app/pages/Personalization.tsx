import { useState } from 'react';
import { useNavigate } from 'react-router';
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
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUnits } from '../contexts/UnitsContext';
import { useLanguage, supportedLanguages } from '../contexts/LanguageContext';
import { useDashboard, DashboardWidget } from '../contexts/DashboardContext';
import { Button } from '../components/ui/button';

export default function Personalization() {
  const navigate = useNavigate();
  const { theme, effectiveTheme, setTheme } = useTheme();
  const { unitSystem, setUnitSystem } = useUnits();
  const { language, setLanguage } = useLanguage();
  const { widgets, updateWidgetVisibility, reorderWidgets, resetToDefault } = useDashboard();

  const [activeTab, setActiveTab] = useState<'theme' | 'units' | 'language' | 'dashboard' | 'reminders'>('theme');
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>(widgets);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Debug: Log theme changes
  console.log('Current theme:', theme, 'Effective:', effectiveTheme);
  console.log('HTML has dark class:', document.documentElement.classList.contains('dark'));

  const handleSaveWidgets = () => {
    reorderWidgets(localWidgets);
    alert('Dashboard layout saved!');
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
    setLocalWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    );
    updateWidgetVisibility(widgetId, !localWidgets.find((w) => w.id === widgetId)?.visible!);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B8E5E5] to-[#E8F5F5] pb-20">
      {/* Debug Indicator */}
      <div className="fixed top-2 right-2 bg-black/80 text-white px-3 py-1 rounded-full text-xs z-50">
        Theme: {theme} | Effective: {effectiveTheme}
      </div>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] px-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Personalization</h1>
            <p className="text-white/90 text-sm">Customize your experience</p>
          </div>
          <Settings className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 flex gap-2 overflow-x-auto">
          {[
            { id: 'theme', icon: Sun, label: 'Theme' },
            { id: 'units', icon: Ruler, label: 'Units' },
            { id: 'language', icon: Globe, label: 'Language' },
            { id: 'dashboard', icon: Layout, label: 'Dashboard' },
            { id: 'reminders', icon: Bell, label: 'Reminders' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>

        {/* Theme Settings */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sun className="h-6 w-6 text-[#1f7a8c]" />
                Appearance Theme
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light Mode', desc: 'Bright and clean interface' },
                  { value: 'dark', icon: Moon, label: 'Dark Mode', desc: 'Easy on the eyes at night' },
                  { value: 'auto', icon: Monitor, label: 'Auto', desc: 'Match system preference' },
                ].map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as any)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      theme === value
                        ? 'border-[#1f7a8c] bg-[#E8F5F5]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl ${
                        theme === value ? 'bg-[#1f7a8c] text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                    {theme === value && (
                      <div className="w-6 h-6 bg-[#1f7a8c] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Units Settings */}
        {activeTab === 'units' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Ruler className="h-6 w-6 text-[#1f7a8c]" />
                Measurement Units
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: 'metric',
                    label: 'Metric',
                    desc: 'kg, cm, °C, ml',
                    examples: '70 kg, 175 cm, 36.5°C',
                  },
                  {
                    value: 'imperial',
                    label: 'Imperial',
                    desc: 'lbs, in, °F, fl oz',
                    examples: '154 lbs, 69 in, 97.7°F',
                  },
                ].map(({ value, label, desc, examples }) => (
                  <button
                    key={value}
                    onClick={() => setUnitSystem(value as any)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      unitSystem === value
                        ? 'border-[#1f7a8c] bg-[#E8F5F5]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-600">{desc}</p>
                      <p className="text-xs text-[#1f7a8c] mt-1">Example: {examples}</p>
                    </div>
                    {unitSystem === value && (
                      <div className="w-6 h-6 bg-[#1f7a8c] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Language Settings */}
        {activeTab === 'language' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-[#1f7a8c]" />
                Language / Èdè / Asụsụ / Harshe
              </h2>
              <div className="space-y-3">
                {supportedLanguages.map(({ code, name, flag }) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code as any)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      language === code
                        ? 'border-[#1f7a8c] bg-[#E8F5F5]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-3xl">{flag}</span>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">{name}</p>
                    </div>
                    {language === code && (
                      <div className="w-6 h-6 bg-[#1f7a8c] rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Customization */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Layout className="h-6 w-6 text-[#1f7a8c]" />
                  Customize Dashboard
                </h2>
                <button
                  onClick={() => {
                    resetToDefault();
                    setLocalWidgets(widgets);
                  }}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Drag to reorder • Toggle visibility • Changes apply to home screen
              </p>

              <div className="space-y-2 mb-4">
                {localWidgets.map((widget) => (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={() => handleDragStart(widget.id)}
                    onDragOver={(e) => handleDragOver(e, widget.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-move ${
                      draggedWidget === widget.id
                        ? 'border-[#1f7a8c] bg-[#E8F5F5] opacity-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{widget.name}</p>
                    </div>
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className={`p-2 rounded-lg transition ${
                        widget.visible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {widget.visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSaveWidgets}
                className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Dashboard Layout
              </Button>
            </div>
          </div>
        )}

        {/* Reminders Settings */}
        {activeTab === 'reminders' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="h-6 w-6 text-[#1f7a8c]" />
                Custom Reminders
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Manage reminder times for each health tracker
              </p>
              <Button
                onClick={() => navigate('/reminders')}
                className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white"
              >
                Manage Reminders
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
