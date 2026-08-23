import React, { useEffect, useState } from "react";
import { Globe, Sparkles, Check, ChevronDown } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export default function GoogleTranslateWidget() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages:
                "en,es,fr,yo,ig,ha,pt,ar,de,it,sw,zh-CN,hi,ru,ja,ko,nl,tr,pl,zu,xh,am,so",
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            "google_translate_element"
          );
          setIsLoaded(true);
        }
      };

      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-3.5 border border-teal-200/80 shadow-2xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-teal-100 text-teal-800">
            <Globe size={16} />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 block">
              Google Universal Translate 🌐
            </span>
            <span className="text-[10px] text-slate-500 block">
              Translate whole app into 100+ world languages
            </span>
          </div>
        </div>
        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-200/60 text-teal-900">
          Auto AI
        </span>
      </div>

      {/* Google Translate DOM mount element */}
      <div className="pt-1 flex items-center justify-center min-h-[36px]">
        <div id="google_translate_element" className="w-full flex justify-center text-xs" />
      </div>
    </div>
  );
}
