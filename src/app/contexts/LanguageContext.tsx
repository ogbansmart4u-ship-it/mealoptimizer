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
  // Auth / login
  'common.back': { en: 'Back', es: 'Atrás', fr: 'Retour', yo: 'Padà', ig: 'Laghachi', ha: 'Koma', pcm: 'Go back' },
  'common.or':   { en: 'or', es: 'o', fr: 'ou', yo: 'tàbí', ig: 'maọbụ', ha: 'ko', pcm: 'or' },
  'auth.welcomeBack':  { en: 'Welcome back', es: 'Bienvenido de nuevo', fr: 'Bon retour', yo: 'Kú àbọ̀', ig: 'Nnọọ ọzọ', ha: 'Barka da dawowa', pcm: 'Welcome back' },
  'auth.loginSubtitle':{ en: 'Log in to your account', es: 'Inicia sesión en tu cuenta', fr: 'Connectez-vous à votre compte', yo: 'Wọlé sí àkàntì rẹ', ig: 'Banye na akaụntụ gị', ha: 'Shiga cikin asusunka', pcm: 'Log in to your account' },
  'auth.email':    { en: 'Email Address', es: 'Correo electrónico', fr: 'Adresse e-mail', yo: 'Àdírẹ́sì Ímeèlì', ig: 'Adreesị Email', ha: 'Adireshin Imel', pcm: 'Email Address' },
  'auth.password': { en: 'Password', es: 'Contraseña', fr: 'Mot de passe', yo: 'Ọ̀rọ̀ àṣínà', ig: 'Okwuntughe', ha: 'Kalmar sirri', pcm: 'Password' },
  'auth.passwordPlaceholder': { en: 'Enter your password', es: 'Ingresa tu contraseña', fr: 'Entrez votre mot de passe', yo: 'Tẹ ọ̀rọ̀ àṣínà rẹ', ig: 'Tinye okwuntughe gị', ha: 'Shigar da kalmar sirrinka', pcm: 'Enter your password' },
  'auth.forgot':   { en: 'Forgot Password?', es: '¿Olvidaste tu contraseña?', fr: 'Mot de passe oublié ?', yo: 'Ṣé o gbàgbé ọ̀rọ̀ àṣínà?', ig: 'Chefuru okwuntughe?', ha: 'Ka manta kalmar sirri?', pcm: 'You forget password?' },
  'auth.loggingIn':{ en: 'Logging in...', es: 'Iniciando sesión...', fr: 'Connexion...', yo: 'Ń wọlé...', ig: 'Na-abanye...', ha: 'Ana shiga...', pcm: 'Dey log in...' },
  'auth.login':    { en: 'Log In', es: 'Iniciar sesión', fr: 'Se connecter', yo: 'Wọlé', ig: 'Banye', ha: 'Shiga', pcm: 'Log In' },
  'auth.noAccount':{ en: "Don't have an account?", es: '¿No tienes una cuenta?', fr: "Vous n'avez pas de compte ?", yo: 'Kò ní àkàntì?', ig: 'Enweghị akaụntụ?', ha: 'Ba ku da asusu?', pcm: 'You no get account?' },
  'auth.signUp':   { en: 'Sign Up', es: 'Regístrate', fr: "S'inscrire", yo: 'Forúkọsílẹ̀', ig: 'Debanye aha', ha: 'Yi rajista', pcm: 'Sign Up' },
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
