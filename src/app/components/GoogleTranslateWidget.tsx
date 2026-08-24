import React, { useEffect, useState, useMemo } from "react";
import {
  Globe,
  Sparkles,
  Check,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Languages,
} from "lucide-react";
import { toast } from "sonner";
import { triggerHaptic } from "../utils/celebration";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export interface TranslateLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const GLOBAL_LANGUAGES: TranslateLanguage[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "zh-CN", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", flag: "🇳🇬" },
  { code: "ig", name: "Igbo", nativeName: "Ásụ̀sụ́ Ìgbò", flag: "🇳🇬" },
  { code: "ha", name: "Hausa", nativeName: "Harshen Hausa", flag: "🇳🇬" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa", flag: "🇿🇦" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
  { code: "so", name: "Somali", nativeName: "Soomaaliga", flag: "🇸🇴" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
  { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "tl", name: "Filipino", nativeName: "Tagalog", flag: "🇵🇭" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦" },
  { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿" },
  { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷" },
  { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
];

const POPULAR_QUICK_PICKS = ["fr", "es", "de", "pt", "ar", "zh-CN"];

export default function GoogleTranslateWidget() {
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize and clean Google Translate scripts & styles
  useEffect(() => {
    // Read current cookie
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }

    // Hide Google Translate toolbar banners & tooltips cleanly
    const styleId = "google-translate-custom-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame,
        .VIpgJd-ZVi9od-ORHb-OEVmcd,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-aZ2wEe-OiiCO,
        iframe.goog-te-banner-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
        }
        body {
          top: 0px !important;
          position: static !important;
        }
        #google_translate_element {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
        .goog-tooltip, .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Load Google Translate script in the background
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: GLOBAL_LANGUAGES.map((l) => l.code).join(","),
              autoDisplay: false,
            },
            "google_translate_element"
          );
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSelectLanguage = (code: string, name: string) => {
    triggerHaptic("light");
    setIsTranslating(true);

    // 1. Set Google Translate cookies
    const hostname = window.location.hostname;
    document.cookie = `googtrans=/en/${code}; path=/;`;
    if (hostname && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
      document.cookie = `googtrans=/en/${code}; path=/; domain=.${hostname};`;
    }

    setCurrentLang(code);

    // 2. Trigger Google Translate native combo event
    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
      toast.success(`Translated to ${name}! 🌐`);
      setIsTranslating(false);
    } else {
      toast.info(`Applying ${name} translation...`);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleResetToEnglish = () => {
    triggerHaptic("medium");
    setIsTranslating(true);

    const hostname = window.location.hostname;
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (hostname && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${hostname}; path=/;`;
    }

    setCurrentLang("en");

    const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (select) {
      select.value = "en";
      select.dispatchEvent(new Event("change"));
      toast.success("Restored original English! 🇬🇧");
      setIsTranslating(false);
    } else {
      window.location.reload();
    }
  };

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return GLOBAL_LANGUAGES;
    const q = searchQuery.toLowerCase();
    return GLOBAL_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeLangObj = GLOBAL_LANGUAGES.find((l) => l.code === currentLang);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0c313a] via-[#10434e] to-[#0a272e] rounded-3xl p-5 border border-teal-500/30 text-white shadow-xl">
      {/* Hidden Mount for Google Translate */}
      <div id="google_translate_element" aria-hidden="true" className="hidden" />

      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-teal-400/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 shadow-md">
            <Globe size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white tracking-tight">
                Universal AI Translator
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300">
                100+ Languages
              </span>
            </div>
            <p className="text-[11px] text-teal-200/80 mt-0.5">
              Translate the entire app dynamically into any global language
            </p>
          </div>
        </div>

        {currentLang !== "en" && (
          <button
            onClick={handleResetToEnglish}
            className="flex items-center gap-1 text-[10px] font-extrabold text-amber-300 hover:text-amber-200 bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 rounded-full cursor-pointer active:scale-95 transition-all"
            title="Reset to English"
          >
            <RotateCcw size={11} />
            <span>Reset (EN)</span>
          </button>
        )}
      </div>

      {/* Active Language Status Banner */}
      {currentLang !== "en" && activeLangObj && (
        <div className="flex items-center justify-between bg-teal-950/80 border border-teal-500/40 rounded-2xl px-3.5 py-2 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{activeLangObj.flag}</span>
            <span className="font-bold text-white">
              Translated to {activeLangObj.name} ({activeLangObj.nativeName})
            </span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <Check size={10} strokeWidth={3} /> Active
          </span>
        </div>
      )}

      {/* 1-Tap Popular Languages Chips */}
      <div className="mb-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300/70 block mb-2">
          Popular Diaspora Languages
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {POPULAR_QUICK_PICKS.map((code) => {
            const lang = GLOBAL_LANGUAGES.find((l) => l.code === code);
            if (!lang) return null;
            const isSelected = currentLang === lang.code;

            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code, lang.name)}
                disabled={isTranslating}
                className={`px-2.5 py-2 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 border-teal-300 shadow-md scale-[1.02]"
                    : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-teal-400/40"
                }`}
              >
                <span>{lang.flag}</span>
                <span className="truncate">{lang.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Full Language Selector Dropdown */}
      <div className="bg-slate-950/60 border border-teal-500/20 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!showAllLanguages) setShowAllLanguages(true);
              }}
              placeholder="Search 40+ languages (e.g. French, Arabic, Swahili)..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-teal-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setShowAllLanguages(!showAllLanguages)}
            className="flex items-center gap-1 text-xs font-bold bg-teal-900/60 hover:bg-teal-800/80 border border-teal-500/30 text-teal-200 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <span>{showAllLanguages ? "Hide" : "All Languages"}</span>
            {showAllLanguages ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expandable Languages Grid */}
        {showAllLanguages && (
          <div className="mt-3 max-h-48 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs scrollbar-thin scrollbar-thumb-teal-500/20">
            {filteredLanguages.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    handleSelectLanguage(lang.code, lang.name);
                    setShowAllLanguages(false);
                  }}
                  className={`p-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-teal-500 text-slate-950 font-black border-teal-300"
                      : "bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{lang.flag}</span>
                    <div className="min-w-0">
                      <span className="block font-bold text-xs truncate leading-tight">
                        {lang.name}
                      </span>
                      <span className="block text-[10px] opacity-70 truncate leading-tight">
                        {lang.nativeName}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check size={13} className="shrink-0" />}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="col-span-full py-4 text-center text-slate-400 text-xs">
                No language found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
