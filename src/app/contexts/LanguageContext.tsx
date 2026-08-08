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
  // Sign up page
  'auth.createAccountTitle': { en: 'Create your account', es: 'Crea tu cuenta', fr: 'Créez votre compte', yo: 'Ṣẹ̀dá àkàntì rẹ', ig: 'Mepụta akaụntụ gị', ha: 'Ƙirƙiri asusunka', pcm: 'Create your account' },
  'auth.signUpSubtitle': { en: 'Join MealOptimiza today', es: 'Únete a MealOptimiza hoy', fr: 'Rejoignez MealOptimiza aujourd’hui', yo: 'Darapọ̀ mọ́ MealOptimiza lónìí', ig: 'Sonye na MealOptimiza taa', ha: 'Shiga MealOptimiza yau', pcm: 'Join MealOptimiza today' },
  'auth.fullName': { en: 'Full Name', es: 'Nombre completo', fr: 'Nom complet', yo: 'Orúkọ ẹ̀kúnrẹ́rẹ́', ig: 'Aha zuru ezu', ha: 'Cikakken suna', pcm: 'Full Name' },
  'auth.fullNamePlaceholder': { en: 'Enter your full name', es: 'Ingresa tu nombre completo', fr: 'Entrez votre nom complet', yo: 'Tẹ orúkọ ẹ̀kúnrẹ́rẹ́ rẹ', ig: 'Tinye aha gị zuru ezu', ha: 'Shigar da cikakken sunanka', pcm: 'Enter your full name' },
  'auth.createPasswordPlaceholder': { en: 'Create a password', es: 'Crea una contraseña', fr: 'Créez un mot de passe', yo: 'Ṣẹ̀dá ọ̀rọ̀ àṣínà', ig: 'Mepụta okwuntughe', ha: 'Ƙirƙiri kalmar sirri', pcm: 'Create a password' },
  'auth.passwordHint': { en: 'Must be at least 6 characters', es: 'Debe tener al menos 6 caracteres', fr: 'Au moins 6 caractères', yo: 'Ó gbọ́dọ̀ jẹ́ ó kéré tán ohun kíkọ 6', ig: 'Ọ ga-adịrịrị opekempe mkpụrụedemede 6', ha: 'Dole ya kasance aƙalla haruffa 6', pcm: 'Must be at least 6 characters' },
  'auth.confirmPassword': { en: 'Confirm Password', es: 'Confirmar contraseña', fr: 'Confirmez le mot de passe', yo: 'Jẹ́rìí ọ̀rọ̀ àṣínà', ig: 'Kwenye okwuntughe', ha: 'Tabbatar da kalmar sirri', pcm: 'Confirm Password' },
  'auth.confirmPasswordPlaceholder': { en: 'Re-enter your password', es: 'Vuelve a ingresar tu contraseña', fr: 'Ressaisissez votre mot de passe', yo: 'Tún ọ̀rọ̀ àṣínà rẹ tẹ', ig: 'Tinyeghachi okwuntughe gị', ha: 'Sake shigar da kalmar sirrinka', pcm: 'Enter your password again' },
  'auth.agreeStart': { en: 'I agree to the', es: 'Acepto los', fr: "J'accepte les", yo: 'Mo gbà sí', ig: 'Ekwenyere m na', ha: 'Na yarda da', pcm: 'I agree to the' },
  'auth.terms': { en: 'Terms & Conditions', es: 'Términos y Condiciones', fr: 'Conditions générales', yo: 'Àwọn Òfin àti Ipò', ig: 'Usoro na Ọnọdụ', ha: 'Sharuɗɗa da Ƙa’idoji', pcm: 'Terms & Conditions' },
  'auth.and': { en: 'and', es: 'y', fr: 'et', yo: 'àti', ig: 'na', ha: 'da', pcm: 'and' },
  'auth.privacy': { en: 'Privacy Policy', es: 'Política de Privacidad', fr: 'Politique de confidentialité', yo: 'Ìlànà Àṣírí', ig: 'Amụma Nzuzo', ha: 'Manufar Sirri', pcm: 'Privacy Policy' },
  'auth.createAccountBtn': { en: 'Create Account', es: 'Crear cuenta', fr: 'Créer un compte', yo: 'Ṣẹ̀dá Àkàntì', ig: 'Mepụta Akaụntụ', ha: 'Ƙirƙiri Asusu', pcm: 'Create Account' },
  'auth.creatingAccount': { en: 'Creating account…', es: 'Creando cuenta…', fr: 'Création du compte…', yo: 'Ń ṣẹ̀dá àkàntì…', ig: 'Na-emepụta akaụntụ…', ha: 'Ana ƙirƙirar asusu…', pcm: 'Dey create account…' },
  'auth.signUpGoogle': { en: 'Sign up with Google', es: 'Regístrate con Google', fr: 'S’inscrire avec Google', yo: 'Forúkọsílẹ̀ pẹ̀lú Google', ig: 'Jiri Google debanye aha', ha: 'Yi rajista da Google', pcm: 'Sign up with Google' },
  'auth.signUpApple': { en: 'Sign up with Apple', es: 'Regístrate con Apple', fr: 'S’inscrire avec Apple', yo: 'Forúkọsílẹ̀ pẹ̀lú Apple', ig: 'Jiri Apple debanye aha', ha: 'Yi rajista da Apple', pcm: 'Sign up with Apple' },
  'auth.haveAccount': { en: 'Already have an account?', es: '¿Ya tienes una cuenta?', fr: 'Vous avez déjà un compte ?', yo: 'Ṣé o ti ní àkàntì?', ig: 'Ị nweelarị akaụntụ?', ha: 'Kana da asusu?', pcm: 'You get account already?' },
  // Sign up validation / toasts
  'auth.invalidEmail': { en: 'Enter a valid email address (e.g. you@example.com)', es: 'Ingresa un correo válido (p. ej. tu@ejemplo.com)', fr: 'Entrez une adresse e-mail valide (ex. vous@exemple.com)', yo: 'Tẹ àdírẹ́sì ímeèlì tó tọ́ (fún àpẹẹrẹ you@example.com)', ig: 'Tinye adreesị email ziri ezi (dịka you@example.com)', ha: 'Shigar da adireshin imel mai inganci (misali you@example.com)', pcm: 'Enter correct email address (e.g. you@example.com)' },
  'auth.passwordMin': { en: 'Password must be at least 6 characters', es: 'La contraseña debe tener al menos 6 caracteres', fr: 'Le mot de passe doit comporter au moins 6 caractères', yo: 'Ọ̀rọ̀ àṣínà gbọ́dọ̀ jẹ́ ó kéré tán ohun kíkọ 6', ig: 'Okwuntughe ga-adịrịrị opekempe mkpụrụedemede 6', ha: 'Kalmar sirri dole ta kasance aƙalla haruffa 6', pcm: 'Password must be at least 6 characters' },
  'auth.passwordMismatch': { en: 'Passwords do not match', es: 'Las contraseñas no coinciden', fr: 'Les mots de passe ne correspondent pas', yo: 'Àwọn ọ̀rọ̀ àṣínà kò bára mu', ig: 'Okwuntughe adabaghị', ha: 'Kalmomin sirri ba su dace ba', pcm: 'Password no match' },
  'auth.agreeError': { en: 'Please agree to the terms and conditions', es: 'Por favor acepta los términos y condiciones', fr: 'Veuillez accepter les conditions générales', yo: 'Jọ̀wọ́ gbà sí àwọn òfin àti ipò', ig: 'Biko kwenye na usoro na ọnọdụ', ha: 'Da fatan za a yarda da sharuɗɗa', pcm: 'Abeg agree to the terms and conditions' },
  'auth.emailExists': { en: 'This email is already registered. Try logging in.', es: 'Este correo ya está registrado. Intenta iniciar sesión.', fr: 'Cet e-mail est déjà enregistré. Essayez de vous connecter.', yo: 'Ímeèlì yìí ti forúkọsílẹ̀ tẹ́lẹ̀. Gbìyànjú láti wọlé.', ig: 'Edebanyela email a. Nwaa ịbanye.', ha: 'An riga an yi rajistar wannan imel. Ka gwada shiga.', pcm: 'Dem don register this email before. Try to log in.' },
  'auth.accountCreatedLogin': { en: 'Account created! Please log in.', es: '¡Cuenta creada! Por favor inicia sesión.', fr: 'Compte créé ! Veuillez vous connecter.', yo: 'A ti ṣẹ̀dá àkàntì! Jọ̀wọ́ wọlé.', ig: 'Emepụtala akaụntụ! Biko banye.', ha: 'An ƙirƙiri asusu! Da fatan za ka shiga.', pcm: 'Account don create! Abeg log in.' },
  'auth.welcomeToast': { en: 'Welcome to MealOptimiza! 🎉', es: '¡Bienvenido a MealOptimiza! 🎉', fr: 'Bienvenue sur MealOptimiza ! 🎉', yo: 'Kú àbọ̀ sí MealOptimiza! 🎉', ig: 'Nnọọ na MealOptimiza! 🎉', ha: 'Barka da zuwa MealOptimiza! 🎉', pcm: 'Welcome to MealOptimiza! 🎉' },
  'auth.signUpFailed': { en: 'Sign up failed. Please try again.', es: 'Error al registrarse. Inténtalo de nuevo.', fr: "Échec de l'inscription. Veuillez réessayer.", yo: 'Ìforúkọsílẹ̀ kùnà. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansi.', ig: 'Ndebanye aha dara. Biko nwaa ọzọ.', ha: 'Rajista ta gaza. Da fatan za a sake gwadawa.', pcm: 'Sign up fail. Abeg try again.' },
  // Health page
  'health.bodyProfile': { en: 'My Body Profile', es: 'Mi perfil corporal', fr: 'Mon profil corporel', yo: 'Profaili Ara Mi', ig: 'Profaịlụ Ahụ M', ha: 'Bayanin Jikina', pcm: 'My Body Profile' },
  'health.bodyProfileDesc': { en: 'View your biometric data and health metrics', es: 'Consulta tus datos biométricos y métricas de salud', fr: 'Consultez vos données biométriques et vos indicateurs de santé', yo: 'Wo dátà biometric àti ìwọ̀n ìlera rẹ', ig: 'Lelee data biometric na metric ahụike gị', ha: 'Duba bayanan biometric da ma’aunin lafiyarka', pcm: 'See your biometric data and health metrics' },
  'health.trackers': { en: 'Health Trackers', es: 'Rastreadores de salud', fr: 'Suivis de santé', yo: 'Àwọn Olùtọpа Ìlera', ig: 'Ndị Na-esoro Ahụike', ha: 'Masu Bin Lafiya', pcm: 'Health Trackers' },
  'health.myHealthProfile': { en: 'My Health Profile', es: 'Mi perfil de salud', fr: 'Mon profil de santé', yo: 'Profaili Ìlera Mi', ig: 'Profaịlụ Ahụike M', ha: 'Bayanin Lafiyata', pcm: 'My Health Profile' },
  'health.education': { en: 'Health Education', es: 'Educación en salud', fr: 'Éducation à la santé', yo: 'Ẹ̀kọ́ Ìlera', ig: 'Agụmakwụkwọ Ahụike', ha: 'Ilimin Lafiya', pcm: 'Health Education' },
  'health.learnMore': { en: 'Learn More', es: 'Saber más', fr: 'En savoir plus', yo: 'Kọ́ Sí i', ig: 'Mụtakwuo', ha: 'Ƙara Sani', pcm: 'Learn More' },
  'health.dialogSubtitle': { en: 'Learn more about this health topic', es: 'Aprende más sobre este tema de salud', fr: 'En savoir plus sur ce sujet de santé', yo: 'Kọ́ sí i nípa kókó ìlera yìí', ig: 'Mụtakwuo banyere isiokwu ahụike a', ha: 'Ƙara sani game da wannan batun lafiya', pcm: 'Learn more about this health topic' },
  'health.keyTips': { en: 'Key Tips', es: 'Consejos clave', fr: 'Conseils clés', yo: 'Àwọn Ìmọ̀ràn Pàtàkì', ig: 'Ndụmọdụ Dị Mkpa', ha: 'Muhimman Shawarwari', pcm: 'Key Tips' },
  'health.wantMore': { en: 'Want to learn more?', es: '¿Quieres saber más?', fr: 'Vous voulez en savoir plus ?', yo: 'Ṣé o fẹ́ kọ́ sí i?', ig: 'Ị chọrọ ịmụtakwu?', ha: 'Kana son ƙarin sani?', pcm: 'You wan learn more?' },
  'health.consult': { en: 'Consult with a healthcare professional for personalized advice tailored to your specific needs.', es: 'Consulta a un profesional de la salud para obtener consejos personalizados según tus necesidades.', fr: 'Consultez un professionnel de santé pour des conseils personnalisés adaptés à vos besoins.', yo: 'Kan sí akọ́ṣẹ́mọṣẹ́ ìlera fún ìmọ̀ràn tí a ṣe àkànṣe sí àìní rẹ pàtó.', ig: 'Gakwuru ọkachamara ahụike maka ndụmọdụ ahaziri maka mkpa gị.', ha: 'Tuntuɓi ƙwararren likita don shawarwarin da suka dace da bukatunka.', pcm: 'Talk to health professional make dem give you advice wey fit your own need.' },
  'health.gotIt': { en: 'Got It!', es: '¡Entendido!', fr: 'Compris !', yo: 'Ó Yé Mi!', ig: 'Aghọtara M!', ha: 'Na Gane!', pcm: 'I don Understand!' },
  // Health tracker grid labels
  'health.tracker.vault': { en: 'Medical Vault', es: 'Bóveda médica', fr: 'Coffre médical', yo: 'Ìpamọ́ Ìṣègùn', ig: 'Ụlọ Nchekwa Ọgwụ', ha: 'Ma’ajin Lafiya', pcm: 'Medical Vault' },
  'health.tracker.hydration': { en: 'Hydration', es: 'Hidratación', fr: 'Hydratation', yo: 'Mímu Omi', ig: 'Mmiri Ọṅụṅụ', ha: 'Shan Ruwa', pcm: 'Water' },
  'health.tracker.sleep': { en: 'Sleep', es: 'Sueño', fr: 'Sommeil', yo: 'Oorun', ig: 'Ụra', ha: 'Barci', pcm: 'Sleep' },
  'health.tracker.medication': { en: 'Medication', es: 'Medicación', fr: 'Médicaments', yo: 'Òògùn', ig: 'Ọgwụ', ha: 'Magani', pcm: 'Medication' },
  'health.tracker.workout': { en: 'Workout', es: 'Ejercicio', fr: 'Entraînement', yo: 'Eré Ìdárayá', ig: 'Mgbatị Ahụ', ha: 'Motsa Jiki', pcm: 'Workout' },
  'health.tracker.fasting': { en: 'Fasting', es: 'Ayuno', fr: 'Jeûne', yo: 'Àwẹ̀', ig: 'Ibu Ọnụ', ha: 'Azumi', pcm: 'Fasting' },
  'health.tracker.symptoms': { en: 'Symptoms', es: 'Síntomas', fr: 'Symptômes', yo: 'Àwọn Àmì Àìsàn', ig: 'Ihe Mgbaàmà', ha: 'Alamun Cuta', pcm: 'Symptoms' },
  'health.tracker.report': { en: 'Doctor Report', es: 'Informe médico', fr: 'Rapport médical', yo: 'Ìròyìn Dókítà', ig: 'Akụkọ Dọkịta', ha: 'Rahoton Likita', pcm: 'Doctor Report' },
  // Health profile quick links
  'health.link.location': { en: 'Location', es: 'Ubicación', fr: 'Emplacement', yo: 'Ibùdó', ig: 'Ọnọdụ', ha: 'Wuri', pcm: 'Location' },
  'health.link.weight': { en: 'Weight', es: 'Peso', fr: 'Poids', yo: 'Ìwúwo', ig: 'Ibu', ha: 'Nauyi', pcm: 'Weight' },
  'health.link.age': { en: 'Age', es: 'Edad', fr: 'Âge', yo: 'Ọjọ́ orí', ig: 'Afọ', ha: 'Shekaru', pcm: 'Age' },
  'health.link.drugs': { en: 'Drugs', es: 'Fármacos', fr: 'Médicaments', yo: 'Òògùn', ig: 'Ọgwụ', ha: 'Magunguna', pcm: 'Drugs' },
  'health.link.condition': { en: 'Medical condition', es: 'Condición médica', fr: 'État de santé', yo: 'Ipò ìlera', ig: 'Ọnọdụ ahụike', ha: 'Yanayin lafiya', pcm: 'Medical condition' },
  // Profile page
  'profile.healthProfile': { en: 'Health Profile', es: 'Perfil de salud', fr: 'Profil de santé', yo: 'Profaili Ìlera', ig: 'Profaịlụ Ahụike', ha: 'Bayanin Lafiya', pcm: 'Health Profile' },
  'profile.edit': { en: 'Edit', es: 'Editar', fr: 'Modifier', yo: 'Ṣàtúnṣe', ig: 'Dezie', ha: 'Gyara', pcm: 'Edit' },
  'profile.editHealthProfile': { en: 'Edit Health Profile', es: 'Editar perfil de salud', fr: 'Modifier le profil de santé', yo: 'Ṣàtúnṣe Profaili Ìlera', ig: 'Dezie Profaịlụ Ahụike', ha: 'Gyara Bayanin Lafiya', pcm: 'Edit Health Profile' },
  'profile.editHealthDesc': { en: 'Update your health information to get personalized nutrition recommendations.', es: 'Actualiza tu información de salud para recibir recomendaciones nutricionales personalizadas.', fr: 'Mettez à jour vos informations de santé pour des recommandations nutritionnelles personnalisées.', yo: 'Ṣe àtúnṣe ìsọfúnni ìlera rẹ láti gba àbá oúnjẹ tí a ṣe àkànṣe.', ig: 'Melite ozi ahụike gị iji nweta aro nri ahaziri iche.', ha: 'Sabunta bayanan lafiyarka domin samun shawarwarin abinci na musamman.', pcm: 'Update your health info make you fit get personalized nutrition advice.' },
  'profile.bmi': { en: 'BMI', es: 'IMC', fr: 'IMC', yo: 'BMI', ig: 'BMI', ha: 'BMI', pcm: 'BMI' },
  'profile.medicalCondition': { en: 'Medical Condition', es: 'Condición médica', fr: 'État de santé', yo: 'Ipò Ìlera', ig: 'Ọnọdụ Ahụike', ha: 'Yanayin Lafiya', pcm: 'Medical Condition' },
  'profile.conditionPlaceholder': { en: 'e.g., Type 2 Diabetes, Hypertension', es: 'p. ej., Diabetes tipo 2, Hipertensión', fr: 'ex. Diabète de type 2, Hypertension', yo: 'f.à., Àtọ̀gbẹ Irú 2, Ẹ̀jẹ̀ ríru', ig: 'd.o., Ọrịa shuga Ụdị 2, Ọbara mgbali elu', ha: 'misali, Ciwon suga Nau’i 2, Hawan jini', pcm: 'e.g., Type 2 Diabetes, High Blood Pressure' },
  'profile.saving': { en: 'Saving…', es: 'Guardando…', fr: 'Enregistrement…', yo: 'Ń fipamọ́…', ig: 'Na-echekwa…', ha: 'Ana ajiyewa…', pcm: 'Dey save…' },
  'profile.saveChanges': { en: 'Save Changes', es: 'Guardar cambios', fr: 'Enregistrer les modifications', yo: 'Fipamọ́ Àwọn Àyípadà', ig: 'Chekwaa Mgbanwe', ha: 'Ajiye Canje-canje', pcm: 'Save Changes' },
  'profile.years': { en: 'years', es: 'años', fr: 'ans', yo: 'ọdún', ig: 'afọ', ha: 'shekaru', pcm: 'years' },
  'profile.weight': { en: 'Weight', es: 'Peso', fr: 'Poids', yo: 'Ìwúwo', ig: 'Ibu', ha: 'Nauyi', pcm: 'Weight' },
  'profile.height': { en: 'Height', es: 'Altura', fr: 'Taille', yo: 'Gíga', ig: 'Ịdị elu', ha: 'Tsawo', pcm: 'Height' },
  'profile.none': { en: 'None', es: 'Ninguna', fr: 'Aucune', yo: 'Kò sí', ig: 'Ọ dịghị', ha: 'Babu', pcm: 'None' },
  'profile.accountSettings': { en: 'Account Settings', es: 'Configuración de la cuenta', fr: 'Paramètres du compte', yo: 'Ètò Àkàntì', ig: 'Ntọala Akaụntụ', ha: 'Saitunan Asusu', pcm: 'Account Settings' },
  'profile.personalization': { en: 'Personalization', es: 'Personalización', fr: 'Personnalisation', yo: 'Ìṣàkànṣe', ig: 'Nhazi onwe', ha: 'Keɓantawa', pcm: 'Personalization' },
  'profile.achievements': { en: 'Achievements & Badges', es: 'Logros e insignias', fr: 'Réalisations et badges', yo: 'Àwọn Àṣeyọrí àti Àmì', ig: 'Ihe Ọ̀g: mmezu na Baajị', ha: 'Nasarori da Bajoji', pcm: 'Achievements & Badges' },
  'profile.personalInfo': { en: 'Personal Information', es: 'Información personal', fr: 'Informations personnelles', yo: 'Ìsọfúnni Ara-ẹni', ig: 'Ozi Nkeonwe', ha: 'Bayanin Kai', pcm: 'Personal Information' },
  'profile.personalInfoDesc': { en: 'Update your name and contact details', es: 'Actualiza tu nombre y datos de contacto', fr: 'Mettez à jour votre nom et vos coordonnées', yo: 'Ṣe àtúnṣe orúkọ àti àwọn àlàyé olùbáraẹnisọ̀rọ̀ rẹ', ig: 'Melite aha gị na nkọwa kọntaktị', ha: 'Sabunta sunanka da bayanan tuntuɓe', pcm: 'Update your name and contact details' },
  'profile.emailReadonly': { en: 'Email cannot be changed', es: 'El correo no se puede cambiar', fr: 'L’e-mail ne peut pas être modifié', yo: 'A kò lè yí ímeèlì padà', ig: 'Enweghị ike ịgbanwe email', ha: 'Ba za a iya canza imel ba', pcm: 'You no fit change email' },
  'profile.phone': { en: 'Phone Number (Optional)', es: 'Número de teléfono (opcional)', fr: 'Numéro de téléphone (facultatif)', yo: 'Nọ́mbà Fóònù (Àṣàyàn)', ig: 'Nọmba Ekwentị (Nhọrọ)', ha: 'Lambar Waya (Zaɓi)', pcm: 'Phone Number (Optional)' },
  'profile.emailPrefs': { en: 'Email Preferences', es: 'Preferencias de correo', fr: 'Préférences d’e-mail', yo: 'Àwọn Ààyò Ímeèlì', ig: 'Mmasị Email', ha: 'Zaɓin Imel', pcm: 'Email Preferences' },
  'profile.emailPrefsDesc': { en: "Choose which emails you'd like to receive", es: 'Elige qué correos deseas recibir', fr: 'Choisissez les e-mails que vous souhaitez recevoir', yo: 'Yan àwọn ímeèlì tí o fẹ́ gbà', ig: 'Họrọ email ndị ị chọrọ ịnata', ha: 'Zaɓi irin imel ɗin da kake son karɓa', pcm: 'Choose which email you wan dey receive' },
  'profile.weeklyRecipes': { en: 'Weekly Recipes', es: 'Recetas semanales', fr: 'Recettes hebdomadaires', yo: 'Àwọn Àdàpọ̀ Ọ̀sọ̀ọ̀sẹ̀', ig: 'Uzọ nri Kwa izu', ha: 'Girke-girke na mako', pcm: 'Weekly Recipes' },
  'profile.weeklyRecipesDesc': { en: 'Get new recipe ideas every week', es: 'Recibe nuevas ideas de recetas cada semana', fr: 'Recevez de nouvelles idées de recettes chaque semaine', yo: 'Gba àwọn èrò àdàpọ̀ tuntun ní gbogbo ọ̀sẹ̀', ig: 'Nweta echiche uzọ nri ọhụrụ kwa izu', ha: 'Samu sabbin dabarun girki kowane mako', pcm: 'Get new recipe ideas every week' },
  'profile.mealReminders': { en: 'Meal Reminders', es: 'Recordatorios de comidas', fr: 'Rappels de repas', yo: 'Àwọn Ìránilétí Oúnjẹ', ig: 'Ncheta Nri', ha: 'Tunatarwar Abinci', pcm: 'Meal Reminders' },
  'profile.mealRemindersDesc': { en: 'Helpful meal planning reminders', es: 'Recordatorios útiles para planificar comidas', fr: 'Rappels utiles de planification des repas', yo: 'Àwọn ìránilétí ìṣètò oúnjẹ tó wúlò', ig: 'Ncheta nhazi nri bara uru', ha: 'Tunatarwa mai amfani ta tsara abinci', pcm: 'Helpful meal planning reminders' },
  'profile.healthTips': { en: 'Health Tips', es: 'Consejos de salud', fr: 'Conseils santé', yo: 'Àwọn Ìmọ̀ràn Ìlera', ig: 'Ndụmọdụ Ahụike', ha: 'Shawarwarin Lafiya', pcm: 'Health Tips' },
  'profile.healthTipsDesc': { en: 'Personalized health advice', es: 'Consejos de salud personalizados', fr: 'Conseils de santé personnalisés', yo: 'Ìmọ̀ràn ìlera tí a ṣe àkànṣe', ig: 'Ndụmọdụ ahụike ahaziri iche', ha: 'Shawarar lafiya ta musamman', pcm: 'Personalized health advice' },
  'profile.productUpdates': { en: 'Product Updates', es: 'Actualizaciones del producto', fr: 'Mises à jour du produit', yo: 'Àwọn Ìsọfúnni Ọjà', ig: 'Mmelite Ngwaahịa', ha: 'Sabuntawar Kayan', pcm: 'Product Updates' },
  'profile.productUpdatesDesc': { en: 'News about new features', es: 'Noticias sobre nuevas funciones', fr: 'Actualités sur les nouvelles fonctionnalités', yo: 'Ìròyìn nípa àwọn ẹ̀yà tuntun', ig: 'Akụkọ gbasara atụmatụ ọhụrụ', ha: 'Labari game da sabbin fasaloli', pcm: 'News about new features' },
  'profile.savePrefs': { en: 'Save Preferences', es: 'Guardar preferencias', fr: 'Enregistrer les préférences', yo: 'Fipamọ́ Àwọn Ààyò', ig: 'Chekwaa Mmasị', ha: 'Ajiye Zaɓuɓɓuka', pcm: 'Save Preferences' },
  'profile.changePassword': { en: 'Change Password', es: 'Cambiar contraseña', fr: 'Changer le mot de passe', yo: 'Yí Ọ̀rọ̀ Àṣínà Padà', ig: 'Gbanwee Okwuntughe', ha: 'Canza Kalmar Sirri', pcm: 'Change Password' },
  'profile.changePasswordDesc': { en: 'Enter your current password and choose a new one', es: 'Ingresa tu contraseña actual y elige una nueva', fr: 'Entrez votre mot de passe actuel et choisissez-en un nouveau', yo: 'Tẹ ọ̀rọ̀ àṣínà lọ́wọ́lọ́wọ́ rẹ kí o sì yan tuntun', ig: 'Tinye okwuntughe gị ugbu a wee họrọ nke ọhụrụ', ha: 'Shigar da kalmar sirrinka ta yanzu ka zaɓi sabo', pcm: 'Enter your current password and choose new one' },
  'profile.currentPassword': { en: 'Current Password', es: 'Contraseña actual', fr: 'Mot de passe actuel', yo: 'Ọ̀rọ̀ Àṣínà Lọ́wọ́lọ́wọ́', ig: 'Okwuntughe Ugbu a', ha: 'Kalmar Sirri ta Yanzu', pcm: 'Current Password' },
  'profile.newPassword': { en: 'New Password', es: 'Nueva contraseña', fr: 'Nouveau mot de passe', yo: 'Ọ̀rọ̀ Àṣínà Tuntun', ig: 'Okwuntughe Ọhụrụ', ha: 'Sabuwar Kalmar Sirri', pcm: 'New Password' },
  'profile.min8': { en: 'Minimum 8 characters', es: 'Mínimo 8 caracteres', fr: 'Minimum 8 caractères', yo: 'Ó kéré tán ohun kíkọ 8', ig: 'Opekempe mkpụrụedemede 8', ha: 'Aƙalla haruffa 8', pcm: 'Minimum 8 characters' },
  'profile.confirmNewPassword': { en: 'Confirm New Password', es: 'Confirmar nueva contraseña', fr: 'Confirmer le nouveau mot de passe', yo: 'Jẹ́rìí Ọ̀rọ̀ Àṣínà Tuntun', ig: 'Kwenye Okwuntughe Ọhụrụ', ha: 'Tabbatar da Sabuwar Kalmar Sirri', pcm: 'Confirm New Password' },
  'profile.notifications': { en: 'Notifications', es: 'Notificaciones', fr: 'Notifications', yo: 'Àwọn Ìfitónilétí', ig: 'Ọkwa', ha: 'Sanarwa', pcm: 'Notifications' },
  'profile.pushNotifications': { en: 'Push Notifications', es: 'Notificaciones push', fr: 'Notifications push', yo: 'Àwọn Ìfitónilétí Push', ig: 'Ọkwa Push', ha: 'Sanarwar Push', pcm: 'Push Notifications' },
  'profile.pushNotificationsDesc': { en: 'Get meal reminders and health tips', es: 'Recibe recordatorios de comidas y consejos de salud', fr: 'Recevez des rappels de repas et des conseils santé', yo: 'Gba àwọn ìránilétí oúnjẹ àti ìmọ̀ràn ìlera', ig: 'Nweta ncheta nri na ndụmọdụ ahụike', ha: 'Samu tunatarwar abinci da shawarwarin lafiya', pcm: 'Get meal reminders and health tips' },
  'profile.marketUpdates': { en: 'Market Updates', es: 'Actualizaciones del mercado', fr: 'Actualités du marché', yo: 'Àwọn Ìsọfúnni Ọjà', ig: 'Mmelite Ahịa', ha: 'Sabuntawar Kasuwa', pcm: 'Market Updates' },
  'profile.marketUpdatesDesc': { en: 'Local food availability alerts', es: 'Alertas de disponibilidad de alimentos locales', fr: 'Alertes de disponibilité des aliments locaux', yo: 'Àwọn ìkìlọ̀ wíwà oúnjẹ agbègbè', ig: 'Ọkwa ịnweta nri obodo', ha: 'Faɗakarwar samuwar abincin gida', pcm: 'Local food availability alerts' },
  'profile.support': { en: 'Support & Information', es: 'Soporte e información', fr: 'Assistance et informations', yo: 'Ìrànlọ́wọ́ àti Ìsọfúnni', ig: 'Nkwado na Ozi', ha: 'Tallafi da Bayani', pcm: 'Support & Information' },
  'profile.helpCenter': { en: 'Help Center', es: 'Centro de ayuda', fr: 'Centre d’aide', yo: 'Ilé-iṣẹ́ Ìrànlọ́wọ́', ig: 'Ebe Enyemaka', ha: 'Cibiyar Taimako', pcm: 'Help Center' },
  'profile.about': { en: 'About MealOptimiza', es: 'Acerca de MealOptimiza', fr: 'À propos de MealOptimiza', yo: 'Nípa MealOptimiza', ig: 'Gbasara MealOptimiza', ha: 'Game da MealOptimiza', pcm: 'About MealOptimiza' },
  'profile.logout': { en: 'Log Out', es: 'Cerrar sesión', fr: 'Se déconnecter', yo: 'Jáde', ig: 'Pụọ', ha: 'Fita', pcm: 'Log Out' },
  'profile.loading': { en: 'Loading profile…', es: 'Cargando perfil…', fr: 'Chargement du profil…', yo: 'Ń gbé profaili wọlé…', ig: 'Na-ebu profaịlụ…', ha: 'Ana loda bayani…', pcm: 'Dey load profile…' },
  'profile.loadFailed': { en: 'Failed to load profile', es: 'Error al cargar el perfil', fr: 'Échec du chargement du profil', yo: 'Kò lè gbé profaili wọlé', ig: 'Ọ dara ịbu profaịlụ', ha: 'An kasa loda bayani', pcm: 'Profile no load' },
  'profile.loadFailedDesc': { en: 'Please check the browser console for detailed error information.', es: 'Consulta la consola del navegador para obtener información detallada del error.', fr: 'Veuillez consulter la console du navigateur pour plus de détails sur l’erreur.', yo: 'Jọ̀wọ́ ṣàyẹ̀wò console browser fún àlàyé àṣìṣe kíkún.', ig: 'Biko lelee console nchọgharị maka nkọwa njehie zuru ezu.', ha: 'Da fatan za a duba na’urar bincike don cikakken bayanin kuskure.', pcm: 'Abeg check the browser console for full error info.' },
  'profile.retry': { en: 'Retry', es: 'Reintentar', fr: 'Réessayer', yo: 'Tún gbìyànjú', ig: 'Nwaa ọzọ', ha: 'Sake gwadawa', pcm: 'Try again' },
  // Profile toasts
  'profile.logoutSuccess': { en: 'Logged out successfully', es: 'Sesión cerrada correctamente', fr: 'Déconnexion réussie', yo: 'O jáde ní àṣeyọrí', ig: 'Ị pụọla nke ọma', ha: 'An fita cikin nasara', pcm: 'You don comot successfully' },
  'profile.logoutFailed': { en: 'Failed to log out', es: 'Error al cerrar sesión', fr: 'Échec de la déconnexion', yo: 'Kò lè jáde', ig: 'Ọ dara ịpụ', ha: 'An kasa fita', pcm: 'Comot fail' },
  'profile.invalidAge': { en: 'Please enter a valid age', es: 'Por favor ingresa una edad válida', fr: 'Veuillez entrer un âge valide', yo: 'Jọ̀wọ́ tẹ ọjọ́ orí tó tọ́', ig: 'Biko tinye afọ ziri ezi', ha: 'Da fatan shigar da shekaru masu inganci', pcm: 'Abeg enter correct age' },
  'profile.invalidBmi': { en: 'Please enter a valid BMI', es: 'Por favor ingresa un IMC válido', fr: 'Veuillez entrer un IMC valide', yo: 'Jọ̀wọ́ tẹ BMI tó tọ́', ig: 'Biko tinye BMI ziri ezi', ha: 'Da fatan shigar da BMI mai inganci', pcm: 'Abeg enter correct BMI' },
  'profile.updateSuccess': { en: 'Profile updated successfully! 🎉', es: '¡Perfil actualizado correctamente! 🎉', fr: 'Profil mis à jour avec succès ! 🎉', yo: 'A ti ṣe àtúnṣe profaili ní àṣeyọrí! 🎉', ig: 'Emelitela profaịlụ nke ọma! 🎉', ha: 'An sabunta bayani cikin nasara! 🎉', pcm: 'Profile don update successfully! 🎉' },
  'profile.updateFailed': { en: 'Failed to update profile. Please try again.', es: 'Error al actualizar el perfil. Inténtalo de nuevo.', fr: 'Échec de la mise à jour du profil. Veuillez réessayer.', yo: 'Kò lè ṣe àtúnṣe profaili. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansi.', ig: 'Ọ dara imelite profaịlụ. Biko nwaa ọzọ.', ha: 'An kasa sabunta bayani. Da fatan sake gwadawa.', pcm: 'Profile update fail. Abeg try again.' },
  'profile.selectImage': { en: 'Please select an image file', es: 'Por favor selecciona un archivo de imagen', fr: 'Veuillez sélectionner un fichier image', yo: 'Jọ̀wọ́ yan fáìlì àwòrán', ig: 'Biko họrọ faịlụ onyonyo', ha: 'Da fatan zaɓi fayil ɗin hoto', pcm: 'Abeg select image file' },
  'profile.imageTooLarge': { en: 'Image size must be less than 5MB', es: 'La imagen debe pesar menos de 5 MB', fr: 'L’image doit faire moins de 5 Mo', yo: 'Ìwọ̀n àwòrán gbọ́dọ̀ kéré ju 5MB lọ', ig: 'Nha onyonyo ga-erughị 5MB', ha: 'Girman hoton ya kasance ƙasa da 5MB', pcm: 'Image size must dey less than 5MB' },
  'profile.pictureUpdated': { en: 'Profile picture updated!', es: '¡Foto de perfil actualizada!', fr: 'Photo de profil mise à jour !', yo: 'A ti ṣe àtúnṣe àwòrán profaili!', ig: 'Emelitela foto profaịlụ!', ha: 'An sabunta hoton bayani!', pcm: 'Profile picture don update!' },
  'profile.pictureFailed': { en: 'Failed to upload picture', es: 'Error al subir la foto', fr: 'Échec du téléchargement de la photo', yo: 'Kò lè gbé àwòrán sókè', ig: 'Ọ dara ibugo foto', ha: 'An kasa loda hoto', pcm: 'Picture upload fail' },
  'profile.personalUpdated': { en: 'Personal information updated!', es: '¡Información personal actualizada!', fr: 'Informations personnelles mises à jour !', yo: 'A ti ṣe àtúnṣe ìsọfúnni ara-ẹni!', ig: 'Emelitela ozi nkeonwe!', ha: 'An sabunta bayanin kai!', pcm: 'Personal information don update!' },
  'profile.personalFailed': { en: 'Failed to update personal information', es: 'Error al actualizar la información personal', fr: 'Échec de la mise à jour des informations personnelles', yo: 'Kò lè ṣe àtúnṣe ìsọfúnni ara-ẹni', ig: 'Ọ dara imelite ozi nkeonwe', ha: 'An kasa sabunta bayanin kai', pcm: 'Personal information update fail' },
  'profile.prefsSaved': { en: 'Email preferences saved!', es: '¡Preferencias de correo guardadas!', fr: 'Préférences d’e-mail enregistrées !', yo: 'A ti fipamọ́ àwọn ààyò ímeèlì!', ig: 'Echekwala mmasị email!', ha: 'An ajiye zaɓin imel!', pcm: 'Email preferences don save!' },
  'profile.passwordMin8': { en: 'Password must be at least 8 characters', es: 'La contraseña debe tener al menos 8 caracteres', fr: 'Le mot de passe doit comporter au moins 8 caractères', yo: 'Ọ̀rọ̀ àṣínà gbọ́dọ̀ jẹ́ ó kéré tán ohun kíkọ 8', ig: 'Okwuntughe ga-adịrịrị opekempe mkpụrụedemede 8', ha: 'Kalmar sirri dole ta kasance aƙalla haruffa 8', pcm: 'Password must be at least 8 characters' },
  'profile.passwordChanged': { en: 'Password changed successfully!', es: '¡Contraseña cambiada correctamente!', fr: 'Mot de passe changé avec succès !', yo: 'A ti yí ọ̀rọ̀ àṣínà padà ní àṣeyọrí!', ig: 'Agbanweela okwuntughe nke ọma!', ha: 'An canza kalmar sirri cikin nasara!', pcm: 'Password don change successfully!' },
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
