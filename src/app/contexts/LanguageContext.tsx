import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'yo' | 'ig' | 'ha' | 'pcm';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  'app.name': {
    en: 'MealOptimiza', es: 'MealOptimiza', fr: 'MealOptimiza', yo: 'MealOptimiza', ig: 'MealOptimiza', ha: 'MealOptimiza', pcm: 'MealOptimiza',
  },
  // Bottom navigation
  'nav.home':    { en: 'Home',    es: 'Inicio',    fr: 'Accueil',   yo: 'Ilé',       ig: 'Ụlọ',        ha: 'Gida',    pcm: 'Home' },
  'nav.goals':   { en: 'Goals',   es: 'Metas',     fr: 'Objectifs', yo: 'Àfojúsùn',  ig: 'Ebumnuche',  ha: 'Manufa',  pcm: 'Goals' },
  'nav.logs':    { en: 'Logs',    es: 'Registros', fr: 'Journaux',  yo: 'Àkọsílẹ̀',   ig: 'Ndekọ',      ha: 'Bayanai', pcm: 'Logs' },
  'nav.health':  { en: 'Health',  es: 'Salud',     fr: 'Santé',     yo: 'Ìlera',     ig: 'Ahụike',     ha: 'Lafiya',  pcm: 'Health' },
  'nav.recipe':  { en: 'Recipe',  es: 'Receta',    fr: 'Recette',   yo: 'Àdàpọ̀',     ig: 'Uzọ nri',    ha: 'Girke',   pcm: 'Recipe' },
  'nav.profile': { en: 'Profile', es: 'Perfil',    fr: 'Profil',    yo: 'Profaili',  ig: 'Profaịlụ',   ha: 'Bayani',  pcm: 'My Profile' },
  // Common actions
  'common.save':   { en: 'Save',   es: 'Guardar',  fr: 'Enregistrer', yo: 'Fipamọ́',  ig: 'Chekwaa',  ha: 'Ajiye',   pcm: 'Save' },
  'common.cancel': { en: 'Cancel', es: 'Cancelar', fr: 'Annuler',     yo: 'Fagilé',  ig: 'Kagbuo',   ha: 'Soke',    pcm: 'Cancel' },
  'common.add':    { en: 'Add',    es: 'Añadir',   fr: 'Ajouter',     yo: 'Fikun',   ig: 'Tinye',    ha: 'Kara',    pcm: 'Add' },
  'common.delete': { en: 'Delete', es: 'Eliminar', fr: 'Supprimer',   yo: 'Parẹ́',    ig: 'Hichapụ',  ha: 'Share',   pcm: 'Delete' },
  'common.search': { en: 'Search', es: 'Buscar',   fr: 'Rechercher',  yo: 'Wá',      ig: 'Chọọ',     ha: 'Nema',    pcm: 'Search' },
  // Titles
  'home.title':    { en: 'Home',     es: 'Inicio',        fr: 'Accueil',    yo: 'Ilé',      ig: 'Ụlọ',       ha: 'Gida',            pcm: 'Home' },
  'profile.title': { en: 'Profile',  es: 'Perfil',        fr: 'Profil',     yo: 'Profaili', ig: 'Profaịlụ',  ha: 'Bayanin Mai amfani', pcm: 'My Profile' },
  'goals.title':   { en: 'Goals',    es: 'Objetivos',     fr: 'Objectifs',  yo: 'Àwọn ibi-afẹ̀de', ig: 'Ebumnuche', ha: 'Manufa',    pcm: 'Goals' },
  'settings.title':{ en: 'Settings', es: 'Configuración', fr: 'Paramètres', yo: 'Ètò',      ig: 'Ntọala',    ha: 'Saitunan',        pcm: 'Settings' },
  'dashboard.customize': {
    en: 'Customize Dashboard', es: 'Personalizar Panel', fr: 'Personnaliser le Tableau de Bord', yo: 'Ṣe Àtúnṣe Dashboard', ig: 'Hazie Dashboard', ha: 'Gyara Dashboard', pcm: 'Arrange Dashboard',
  },
  'theme.light': { en: 'Light', es: 'Claro',  fr: 'Clair',  yo: 'Ìmọ́lẹ̀', ig: 'Ìhè',        ha: 'Haske', pcm: 'Light' },
  'theme.dark':  { en: 'Dark',  es: 'Oscuro', fr: 'Sombre', yo: 'Dúdú',   ig: 'Ọchịchịrị',  ha: 'Duhu',  pcm: 'Dark' },
  'units.metric':   { en: 'Metric',   es: 'Métrico',  fr: 'Métrique', yo: 'Metric',   ig: 'Metric',   ha: 'Metric',   pcm: 'Metric' },
  'units.imperial': { en: 'Imperial', es: 'Imperial', fr: 'Impérial', yo: 'Imperial', ig: 'Imperial', ha: 'Imperial', pcm: 'Imperial' },
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
    return translations[key]?.[language] || translations[key]?.['en'] || key;
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
  { code: 'pcm', name: 'Pidgin', flag: '🇳🇬' },
] as const;
