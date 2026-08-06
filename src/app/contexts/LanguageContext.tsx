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
  // Landing
  'landing.subtitle': { en: "Personalized nutrition based on your health condition, age, BMI, and where you live.", es: "Nutrición personalizada según tu condición de salud, edad, IMC y dónde vives.", fr: "Une nutrition personnalisée selon votre état de santé, votre âge, votre IMC et votre lieu de vie.", yo: "Oúnjẹ tí a ṣe àkànṣe fún ipò ìlera rẹ, ọjọ́ orí, BMI, àti ibi tí o ń gbé.", ig: "Nri ahaziri maka ọnọdụ ahụike gị, afọ, BMI, na ebe ị bi.", ha: "Abinci na musamman bisa yanayin lafiyarka, shekaru, BMI, da inda kake zama.", pcm: "Food wey dem arrange for your health, age, BMI, and where you dey live." },
  'landing.f1.label': { en: "Smart Meal Planning", es: "Planificación inteligente de comidas", fr: "Planification intelligente des repas", yo: "Ìṣètò oúnjẹ ọlọ́gbọ́n", ig: "Nhazi nri maara ihe", ha: "Tsara abinci mai wayo", pcm: "Smart Meal Planning" },
  'landing.f1.desc': { en: "AI-powered meal suggestions tailored to your health profile and local food culture.", es: "Sugerencias de comidas con IA adaptadas a tu perfil de salud y cultura alimentaria local.", fr: "Suggestions de repas par IA adaptées à votre profil de santé et à la cuisine locale.", yo: "Àbá oúnjẹ láti ọwọ́ AI tí a ṣe déédéé sí ìlera rẹ àti àṣà oúnjẹ agbègbè rẹ.", ig: "Aro nri sitere na AI dabara na ọnọdụ ahụike gị na omenala nri obodo gị.", ha: "Shawarwarin abinci ta AI da suka dace da lafiyarka da al adun abinci na gida.", pcm: "AI meal suggestions wey fit your health and your local food." },
  'landing.f2.label': { en: "Track Progress", es: "Sigue tu progreso", fr: "Suivez vos progrès", yo: "Tọpа ìtẹ̀síwájú", ig: "Soro ọganihu gị", ha: "Bibiyar ci gaba", pcm: "Track Progress" },
  'landing.f2.desc': { en: "Log weight, sleep, hydration, and workouts. See your trajectory over time.", es: "Registra peso, sueño, hidratación y ejercicios. Observa tu evolución con el tiempo.", fr: "Enregistrez poids, sommeil, hydratation et exercices. Suivez votre évolution.", yo: "Kọ ìwúwo, oorun, omi mímu, àti eré ìdárayá. Wo ìtẹ̀síwájú rẹ.", ig: "Deba ibu, ụra, mmiri ọṅụṅụ, na mgbatị ahụ. Hụ otu ị si aga.", ha: "Rubuta nauyi, barci, ruwa, da motsa jiki. Duba ci gabanka.", pcm: "Record weight, sleep, water, and workout. See how you dey progress." },
  'landing.f3.label': { en: "Health Focused", es: "Enfocado en la salud", fr: "Axé sur la santé", yo: "Ìdojúkọ ìlera", ig: "Lekwasị anya n ahụike", ha: "Mai da hankali kan lafiya", pcm: "Health Focused" },
  'landing.f3.desc': { en: "Recommendations that respect your medical condition, age, BMI, and local context.", es: "Recomendaciones que respetan tu condición médica, edad, IMC y contexto local.", fr: "Des recommandations qui respectent votre état de santé, âge, IMC et contexte local.", yo: "Àwọn àbá tí ó bọ̀wọ̀ fún ipò ìlera rẹ, ọjọ́ orí, BMI, àti àyíká rẹ.", ig: "Ndụmọdụ na-akwanyere ọnọdụ ahụike gị, afọ, BMI, na ebe ị nọ.", ha: "Shawarwari da suka girmama yanayin lafiyarka, shekaru, BMI, da yanayin gida.", pcm: "Advice wey respect your medical condition, age, BMI, and where you dey." },
  'landing.getStarted': { en: "Get Started — it's free", es: "Comienza — es gratis", fr: "Commencer — c'est gratuit", yo: "Bẹ̀rẹ̀ — ọ̀fẹ́ ni", ig: "Malite — ọ bụ n'efu", ha: "Fara — kyauta ne", pcm: "Start — e free" },
  'landing.rights': { en: "© 2026 MealOptimiza. All rights reserved.", es: "© 2026 MealOptimiza. Todos los derechos reservados.", fr: "© 2026 MealOptimiza. Tous droits réservés.", yo: "© 2026 MealOptimiza. Gbogbo ẹ̀tọ́ ni a fipamọ́.", ig: "© 2026 MealOptimiza. Ekwerechara ikike niile.", ha: "© 2026 MealOptimiza. An kiyaye dukkan haƙƙoƙi.", pcm: "© 2026 MealOptimiza. All rights reserved." },
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
