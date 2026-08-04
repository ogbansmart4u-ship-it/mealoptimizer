import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'yo' | 'ig' | 'ha';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  'app.name': {
    en: 'MealOptimiza',
    es: 'MealOptimiza',
    fr: 'MealOptimiza',
    yo: 'MealOptimiza',
    ig: 'MealOptimiza',
    ha: 'MealOptimiza',
  },
  'home.title': {
    en: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
    yo: 'Ile',
    ig: 'Ulo',
    ha: 'Gida',
  },
  'profile.title': {
    en: 'Profile',
    es: 'Perfil',
    fr: 'Profil',
    yo: 'Profaili',
    ig: 'Profaịlụ',
    ha: 'Bayanin Mai amfani',
  },
  'goals.title': {
    en: 'Goals',
    es: 'Objetivos',
    fr: 'Objectifs',
    yo: 'Awon ibi-afẹde',
    ig: 'Ebumnuche',
    ha: 'Manufa',
  },
  'settings.title': {
    en: 'Settings',
    es: 'Configuración',
    fr: 'Paramètres',
    yo: 'Eto',
    ig: 'Ntọala',
    ha: 'Saitunan',
  },
  'dashboard.customize': {
    en: 'Customize Dashboard',
    es: 'Personalizar Panel',
    fr: 'Personnaliser le Tableau de Bord',
    yo: 'Ṣe Atunṣe Dashboard',
    ig: 'Hazie Dashboard',
    ha: 'Gyara Dashboard',
  },
  'theme.light': {
    en: 'Light',
    es: 'Claro',
    fr: 'Clair',
    yo: 'Imọlẹ',
    ig: 'Ìhè',
    ha: 'Haske',
  },
  'theme.dark': {
    en: 'Dark',
    es: 'Oscuro',
    fr: 'Sombre',
    yo: 'Dudu',
    ig: 'Ọchịchịrị',
    ha: 'Duhu',
  },
  'units.metric': {
    en: 'Metric',
    es: 'Métrico',
    fr: 'Métrique',
    yo: 'Metric',
    ig: 'Metric',
    ha: 'Metric',
  },
  'units.imperial': {
    en: 'Imperial',
    es: 'Imperial',
    fr: 'Impérial',
    yo: 'Imperial',
    ig: 'Imperial',
    ha: 'Imperial',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
] as const;
