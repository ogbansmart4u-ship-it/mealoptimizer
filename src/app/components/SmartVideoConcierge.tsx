import { soundEffects } from "../utils/soundEffects";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Camera,
  MessageCircle,
  FileText,
  ChefHat,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Send,
  Mic,
  MicOff,
  RotateCcw,
  Bot,
  HelpCircle,
  Activity,
  HeartPulse,
  Flame,
  CheckCircle,
  UserCheck,
  Dna,
  Zap,
  Target,
  ShoppingCart,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useUser } from "../contexts/UserContext";
import { triggerHaptic } from "../utils/celebration";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";
import { speakWithSarah, stopSarahSpeech } from "../services/voiceService";
import SarahAvatar from "./SarahAvatar";

interface SmartVideoConciergeProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
  onOpenWhatsApp?: () => void;
  onOpenHealthSetup?: () => void;
}

export type SupportedLanguage = "en" | "pcm" | "yo" | "ig" | "ha" | "fr";

// Preset Multilingual Clinical & African Nutrition Knowledge Base (EN, PCM, YO, IG, HA, FR)
const MULTILINGUAL_KNOWLEDGE_BASE: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    profile_importance:
      "Filling in your Health Profile is super easy and helps MealOptimiza learn what you need! When you tell us your goals, age, or any health conditions, we customize your daily food tips so you can enjoy your favorite cultural dishes safely.",
    app_superpowers:
      "Here is how MealOptimiza helps you every day: First, you can snap a photo of any meal to check calories and easy tips. Second, you can find gentle swallow swaps that keep your blood sugar steady. Third, you get a clean market shopping list. And fourth, you can share a simple health summary with your doctor anytime!",
    grocery:
      "Our Smart Grocery List makes shopping easy! It sorts your ingredients by supermarket aisle so you can quickly pick up your fresh greens, fish, and swallows without forgetting anything.",
    swallow:
      "You do not have to give up swallow! Try delicious swaps like plantain flour, oat swallow, or amala. When you pair swallow with drawing soups like Okra or Ewedu, it helps your body digest sugar much more gently so you feel energized and full.",
    bp:
      "To keep your heart strong and blood pressure healthy: use tasty natural seasonings like locust beans (iru), garlic, ginger, and crayfish instead of lots of seasoning cubes, and drink plenty of water every day!",
    zobo:
      "Zobo tea is delicious and naturally helps relax your blood vessels! Brew it with ginger and cloves without adding white sugar. If you take blood pressure pills, drink it with meals to stay steady.",
    fasting:
      "When breaking a fast, start gentle! Drink a glass of water or light soup first, followed by boiled eggs or avocado before eating your main swallow or rice. This prevents stomach tiredness and keeps you feeling great.",
    sequencing:
      "Here is a simple kitchen trick: Eat a few spoons of your vegetable soup or fish first before your swallow or rice. It keeps your blood sugar super steady and stops the afternoon food coma!",
    weight_gain:
      "To build healthy weight and strong muscle, add clean calorie density! Fortify your morning Akamu with whole milk and peanut butter (+350 kcal), enjoy rich Groundnut and Egusi soup with fish and eggs, and snack on roasted groundnuts with bananas.",
    fruit:
      "Enjoy whole African fruits like Garden Egg with spicy peanut paste, Agbalumo, or Guava right after your meal as a dessert anchor. Eating fruit after fiber and protein slows fructose absorption by 40%!",
  },
  pcm: {
    profile_importance:
      "To fill your Health Profile dey very simple and e go help MealOptimiza understand wetin your body need! When you tell us your age, weight, and goals, we go tailor your daily meal tips so you fit chop your favorite food with peace of mind.",
    app_superpowers:
      "See how MealOptimiza dey help you every day: 1) You fit snap photo of your food to check calories and advice. 2) You fit find better swallow swaps wey no go spike your blood sugar. 3) You get market shopping list wey dey arrange everything well well. 4) You fit share health report give your doctor anytime!",
    grocery:
      "Our Smart Market List dey make shopping dey very easy! E dey arrange your items by market line so you fit quickly buy your fresh ugwu, fish, and swallow without forgetting anything.",
    swallow:
      "You no need stop your swallow at all! Try better swaps like unripe plantain fufu, oat swallow, or amala. When you combine your swallow with drawing soup like Okra or Ewedu, your sugar go balance well well and you no go feel heavy.",
    bp:
      "To make your heart strong and keep blood pressure calm: use natural seasoning like Iru (locust beans), garlic, ginger, and crayfish instead of packing plenty seasoning cubes, and make you dey drink water well well.",
    zobo:
      "Zobo tea dey sweet and e dey help relax your blood pressure! Boil am with ginger and cloves without adding white sugar. E dey very good for body!",
    fasting:
      "When you dey break fast, take am easy! Drink clean water or light pepper soup first, chop boiled egg or avocado before you touch your heavy swallow. E go make your stomach relax.",
    sequencing:
      "See simple kitchen secret: Chop 3-4 spoons of your vegetable soup or fish first before your swallow or rice. E dey prevent sugar spike and e no go make you sleep off after food!",
    weight_gain:
      "If you wan gain solid weight and muscle: mix full milk and 2 spoons of peanut butter inside your morning Akamu (+350 clean calories), chop rich Egusi and Groundnut soup with fish and eggs, and snack on groundnut with banana!",
    fruit:
      "Chop complete fruit like Garden Egg with groundnut paste (Ose Oji) or Agbalumo after your food. When you chop fruit after soup and protein, your body go absorb the sweetness gently!",
  },
  yo: {
    profile_importance:
      "Kiko awon ekunrere ilera yin sinu Health Profile rorun pupo, o si n ran MealOptimiza lowo lati mo ounje to ba ara yin mu. E le gbadun awon ounje ibile yin laisi iberu kankan!",
    app_superpowers:
      "Bi MealOptimiza se n ran yin lowo niyi: 1) E le ya foto ounje yin fun atunyewo kiakia. 2) E le yan awon ounje swallow to n toju iwon suga. 3) E ni akojo oja fun rira ounje tutu. 4) E le fi akosile ilera han dokita yin!",
    grocery:
      "Akojo oja wa n je ki rira ounje ni oja rorun pupo! O n to ewebe, eja, ati ounje yin leseesee ki e ma baa gbagbe ohunkohun.",
    swallow:
      "E ko ni lati fi swallow sile! E gbiyanju Amala, plantain fufu, tabi oat fufu. Nigba ti e ba fi je obe Ewedu tabi Okiro to n fa, suga ara yin yoo dogba daradara.",
    bp:
      "Lati toju eje riru ati okan yin: E lo eroja abinibi bii Iru, ata-ile, ayu, ati ede dipo maggi pupo, ki e si maa mu omi daradara lojojumo.",
    zobo:
      "Zobo dara pupo fun itura isan eje! E bo o pelu ata-ile ati kanafunru laisi suga funfun. O n fun ara ni okun ati ilera pipe.",
    fasting:
      "Ti e ba n tu awe, e koko mu omi tabi obe felefele, ki e je eyin sise tabi avocado ki e to je ounje lile. Eyi ko ni je ki inu yin run.",
    sequencing:
      "Ogbon ounje pataki: E koko je sibi meloo kan ninu obe ewebe tabi eja yin ki e to bere si i je swallow tabi iresi. Ko ni je ki oorun gbe yin leyin ounje!",
    weight_gain:
      "Lati ni iwon ara to dara ati isan to lagbara: E fi wara ati epa si inu Ogi aaro yin, e je obe Egusi ati Epa pelu eja, ki e si maa je epa ati ogede.",
    fruit:
      "E je eso bii Igba pelu Ose Oji tabi Agbalumo leyin ounje yin. Eyi ko ni je ki suga ara yin ga lojiji!",
  },
  ig: {
    profile_importance:
      "Imejupụta Health Profile gị dị ezigbo mfe ma na-enyere MealOptimiza aka ịghọta mkpa ahụ gị! Ọ na-enye gị ndụmọdụ nri ga-enyere gị aka ịnụ ụtọ nri ọdịnala anyị n'enweghị nsogbu.",
    app_superpowers:
      "Otu MealOptimiza si enyere gị aka: 1) I nwere ike ịse foto nri gị maka nyocha kalori. 2) Họrọ swallow dị mma maka shuga gị. 3) Ndepụta ahịa maka nri ọhụrụ. 4) Kesaa akụkọ ahụike nye dọkịta gị!",
    grocery:
      "Ndepụta Ahịa anyị na-eme ka ịzụ ahịa dị mfe! Ọ na-ahazi akwụkwọ nri, azụ, na swallow ka ị ghara ichefu ihe ọ bụla.",
    swallow:
      "Ikwesighi ịkwụsị iri swallow! Jiri amala, unripe plantain fufu, ma ọ bụ oat fufu. Mgbe i ji ofe Ọkwụrụ ma ọ bụ Ewedu na-adọ adọ rie ya, shuga gị ga-adị nwayọ.",
    bp:
      "Iji chebe obi gị na ọbara mgbali elu: jiri Dawadawa/Iru, galik, jinja, na oporo mee nri kama iji ọtụtụ maggi, ma na-aṅụ ezigbo mmiri kwa ụbọchị.",
    zobo:
      "Mmiri Zobo dị ezigbo mma maka izu ike nke akwara ọbara! Sie ya na jinja na cloves n'etinyeghị shuga ọcha. Ọ na-eweta ezigbo ahụike.",
    fasting:
      "Mgbe ị na-agbasa ọnụ, were nwayọ! Buru ụzọ ṅụọ mmiri ma ọ bụ obere ofe, rie akwa siri esi tupu i rie nri siri ike ka afọ ghara ịgbọ gị.",
    sequencing:
      "Usoro nri dị mfe: Buru ụzọ rie ngaji ole na ole nke akwụkwọ nri ma ọ bụ azụ tupu i rie swallow ma ọ bụ osikapa ka ahụ gị wee nwee ume mgbe niile!",
    weight_gain:
      "Iji nwee ezigbo ahụ na ike: tinye mmiri ara ehi na ahụekere n'ime Akamu ụtụtụ gị (+350 kalori), rie ofe Egusi na Ofe Ahụekere nwere azụ na akwa!",
    fruit:
      "Rie mkpụrụ osisi dị ka Anara na Ọsẹ Ọjị ma ọ bụ Udara mgbe i risịrị nri. Ọ na-enyere ahụ aka ịgbari nri n'ụzọ dị mma!",
  },
  ha: {
    profile_importance:
      "Cika Bayanan Lafiyarku yana da sauƙi kuma yana taimaka wa MealOptimiza sanin abincin da ya dace da jikinku don ku ci abincinku na gargajiya cikin ƙoshin lafiya.",
    app_superpowers:
      "Ga yadda MealOptimiza ke taimaka muku: 1) Ɗaukar hoton abinci don sanin kalori. 2) Zaɓin tuwo mai lafiya wanda ba ya ɗaga sukarin jini. 3) Jerin sayayyar kasuwa. 4) Raba rahoton lafiya tare da likitanku!",
    grocery:
      "Jerin Kasuwanmu na Sauƙaƙa sayayya! Yana tsara ganyaye, kifi, da hatsi don kada ku manta da komai a kasuwa.",
    swallow:
      "Ba kwa buƙatar daina cin tuwo! Gwada tuwon masara, tuwon dawa, ko plantain fufu. Idan kuka haɗa da miyar kuɓewa ko ɗanwake, sukarin jini zai daidaita.",
    bp:
      "Don kiyaye lafiyar zuciya da saukar da hawan jini: yi amfani da daddawa, tafarnuwa, citta, da kifi maimakon sinadarin dandano mai yawa, sannan a sha ruwa sosai.",
    zobo:
      "Shayin Zobo yana da daɗi kuma yana taimakawa wajen buɗe hanyoyin jini! A dafa shi da citta da kanumfari ba tare da ƙara sukari ba.",
    fasting:
      "Idan za a buɗe baki, a fara da ruwa ko miya mai sauƙi, sannan a ci dafaffen ƙwai kafin a ci babban abinci don kiyaye cikin ku.",
    sequencing:
      "Dabarar cin abinci: Fara cin ganye ko kifi kafin a fara cin tuwo ko shinkafa. Wannan yana hana kasala da ɗaga sukari bayan cin abinci!",
    weight_gain:
      "Don samun ƙiba mai kyau da ƙarfin jiki: ƙara madara da gyaɗa a cikin Kokon safe (+350 kalori), ci Miyar Gyaɗa da Egusi tare da kifi da ƙwai!",
    fruit:
      "Ku ci 'ya'yan itace kamar Gauta tare da yaji ko Agbalumo bayan cin abinci don samun daidaiton sukari da narkar da abinci cikin sauƙi!",
  },
  fr: {
    profile_importance:
      "Remplir votre Profil de Santé est très simple et aide MealOptimiza à personnaliser vos conseils nutritionnels afin que vous puissiez savourer vos plats préférés en toute sécurité.",
    app_superpowers:
      "Voici comment MealOptimiza vous aide: 1) Analysez vos repas en photo. 2) Découvrez des alternatives saines pour vos féculents. 3) Liste de courses intelligente par rayon. 4) Partagez votre bilan de santé avec votre médecin !",
    grocery:
      "Notre liste de courses intelligente classe vos ingrédients par rayon pour faire vos achats de légumes, poissons et céréales en toute sérénité.",
    swallow:
      "Nul besoin d'abandonner vos plats traditionnels ! Privilégiez la farine de banane plantain, l'igname ou l'avoine avec une sauce riche en fibres (Gombo, Épinards) pour stabiliser votre glycémie.",
    bp:
      "Pour protéger votre cœur et votre tension : utilisez des épices naturelles (ail, gingembre, graines de néré) plutôt que des bouillons salés, et hydratez-vous régulièrement.",
    zobo:
      "L'infusion d'Hibiscus (Bissap / Zobo) favorise la détente vasculaire ! Préparez-la avec du gingembre et des clous de girofle sans sucre raffiné.",
    fasting:
      "Pour rompre le jeûne, commencez en douceur : buvez de l'eau ou un bouillon léger, suivi d'œufs bouillis ou d'avocat avant votre repas principal.",
    sequencing:
      "Astuce repas : Mangez d'abord quelques cuillères de légumes ou de poisson avant vos féculents. Cela évite les pics de glycémie et les coups de fatigue !",
    weight_gain:
      "Pour une prise de poids saine et musculaire : enrichissez votre bouillie matinale avec du lait entier et du beurre de cacahuète (+350 kcal) et savourez des soupes traditionnelles riches en poisson et œufs.",
    fruit:
      "Dégustez des fruits entiers comme la goyave ou l'avocat juste après votre repas. Les fibres solubles ralentissent l'absorption des glucides de 40 % !",
  },
};

// UI Localization Dictionary for full interface immersion
const UI_LOCALIZATIONS: Record<SupportedLanguage, {
  headerBadge: string;
  headerSubtitle: string;
  avatarSubtitle: string;
  thinking: string;
  recTitle: string;
  welcomeTitle: string;
  welcomeText: string;
  replay: string;
  pace: string;
  mute: string;
  unmute: string;
  profileTitle: string;
  profileSub: string;
  profileSetup: string;
  profileDone: string;
  profileQuote: string;
  promptsHeader: string;
  chipsHeader: string;
  customHeader: string;
  placeholder: string;
  micTooltip: string;
  portalsHeader: string;
  scannerTitle: string;
  scannerSub: string;
  whatsappTitle: string;
  whatsappSub: string;
  reportTitle: string;
  reportSub: string;
  quickQuestions: { q: string; key: string; icon: any }[];
  predictivePrompts: { icon: string; text: string; key: string }[];
}> = {
  en: {
    headerBadge: "Nutrition Assistant",
    headerSubtitle: "MealOptimiza Food & Metabolic AI Guide",
    avatarSubtitle: "Sarah · Clinical Food & AI Guide",
    thinking: "Sarah is Analyzing Nutrition Data...",
    recTitle: "Sarah's Clinical Recommendation:",
    welcomeTitle: "Sarah's Guide & Welcome Brief:",
    welcomeText: "Welcome to MealOptimiza! I am Sarah, your friendly food companion. I'm here to help you enjoy delicious cultural meals while staying energized, healthy, and happy. You can snap photos of your plate, check easy meal swaps, and ask me anything about your favorite dishes!",
    replay: "Replay",
    pace: "Pace",
    mute: "Mute",
    unmute: "Unmute",
    profileTitle: "Calibrate Your Health Profile 🎯",
    profileSub: "Unlock 100% accurate, personalized nutrition & safety shields",
    profileSetup: "Setup Now ⚡",
    profileDone: "Calibrated ✅",
    profileQuote: "By entering your Age, Weight, Baseline BP, & Medical Conditions, Sarah and Avo calculate your exact metabolic rate and personalize every carbohydrate limit to your body!",
    promptsHeader: "✨ Recommended for You Now:",
    chipsHeader: "💡 Ask Sarah Instant Dietary Questions:",
    customHeader: "💬 Or Ask Any Nutrition / Meal Question:",
    placeholder: "e.g. Is Egusi soup healthy? Can I eat boiled yam?",
    micTooltip: "🎙️ Listening... Speak your question!",
    portalsHeader: "🚀 Sarah's Direct Health Portals:",
    scannerTitle: "Meal Scanner",
    scannerSub: "Scan food macros",
    whatsappTitle: "WhatsApp Bot",
    whatsappSub: "Auto-log photos",
    reportTitle: "Health Report",
    reportSub: "Clinical summary",
    quickQuestions: [
      { q: "Why must I fill my Health Profile?", key: "profile_importance", icon: Target },
      { q: "How does Smart Market Grocery List work?", key: "grocery", icon: ShoppingCart },
      { q: "How to eat Swallow with Diabetes?", key: "swallow", icon: Activity },
      { q: "Best Soups for High Blood Pressure?", key: "bp", icon: HeartPulse },
      { q: "What is Food Sequencing order?", key: "sequencing", icon: BookOpen },
      { q: "Can I drink Zobo with BP medicine?", key: "zobo", icon: Sparkles },
      { q: "Breaking Fasting without Sugar Spikes?", key: "fasting", icon: Flame },
      { q: "How to gain healthy weight & muscle?", key: "weight_gain", icon: Zap },
      { q: "How to eat whole African Fruits?", key: "fruit", icon: Sparkles },
      { q: "What can MealOptimiza do for me?", key: "app_superpowers", icon: Zap },
    ],
    predictivePrompts: [
      { icon: "🍲", text: "What is the best swallow swap for steady energy?", key: "swallow" },
      { icon: "🫀", text: "What natural African spices lower blood pressure?", key: "bp" },
      { icon: "💪", text: "How do I build healthy weight with African dishes?", key: "weight_gain" },
      { icon: "🍊", text: "How should I combine fruits with my meals?", key: "fruit" },
    ],
  },
  pcm: {
    headerBadge: "Food Companion",
    headerSubtitle: "MealOptimiza Food & Health AI Guide",
    avatarSubtitle: "Sarah · Your Food & Health Guide",
    thinking: "Sarah dey check your nutrition data...",
    recTitle: "Wetin Sarah Recommend for You:",
    welcomeTitle: "Sarah Welcome & Daily Advice:",
    welcomeText: "Welcome to MealOptimiza! I be Sarah, your friendly food companion. Snap your food to check calories, enjoy your favorite swallow without fear, and ask me any question about your food!",
    replay: "Play Again",
    pace: "Speed",
    mute: "Silent",
    unmute: "Voice On",
    profileTitle: "Set Up Your Health Profile 🎯",
    profileSub: "Get 100% correct meal advice and safety shield for your body",
    profileSetup: "Set Am Now ⚡",
    profileDone: "Done ✅",
    profileQuote: "When you put your Age, Weight, Blood Pressure, and Goals, Sarah go calculate wetin your body need so you fit chop beta food with peace of mind!",
    promptsHeader: "✨ Quick Advice for You Now:",
    chipsHeader: "💡 Ask Sarah Quick Food Questions:",
    customHeader: "💬 Or Ask Any Question About Your Food:",
    placeholder: "e.g. Egusi soup good for body? I fit chop boiled yam?",
    micTooltip: "🎙️ I dey listen... Talk your full question!",
    portalsHeader: "🚀 Fast Shortcuts for You:",
    scannerTitle: "Food Scanner",
    scannerSub: "Snap plate photos",
    whatsappTitle: "WhatsApp Bot",
    whatsappSub: "Auto-log with camera",
    reportTitle: "Health Report",
    reportSub: "Summary for doctor",
    quickQuestions: [
      { q: "Why I must fill my Health Profile?", key: "profile_importance", icon: Target },
      { q: "How Smart Market List dey work?", key: "grocery", icon: ShoppingCart },
      { q: "How to chop Swallow without sugar spike?", key: "swallow", icon: Activity },
      { q: "Best soups to lower Blood Pressure?", key: "bp", icon: HeartPulse },
      { q: "Wetin be Food Sequencing order?", key: "sequencing", icon: BookOpen },
      { q: "I fit drink Zobo with BP medicine?", key: "zobo", icon: Sparkles },
      { q: "How to break fasting gently?", key: "fasting", icon: Flame },
      { q: "How I fit gain solid weight & muscle?", key: "weight_gain", icon: Zap },
      { q: "How to chop African fruits well well?", key: "fruit", icon: Sparkles },
      { q: "Wetin MealOptimiza fit do for me?", key: "app_superpowers", icon: Zap },
    ],
    predictivePrompts: [
      { icon: "🍲", text: "Which swallow swap better pass for blood sugar?", key: "swallow" },
      { icon: "🫀", text: "How I fit lower blood pressure with African spices?", key: "bp" },
      { icon: "💪", text: "How I fit gain healthy weight with African food?", key: "weight_gain" },
      { icon: "🍊", text: "How I fit chop fruits after my food?", key: "fruit" },
    ],
  },
  yo: {
    headerBadge: "Olùrànlọ́wọ́ Oúnjẹ",
    headerSubtitle: "Olùtọ́jú Oúnjẹ & Ìlera MealOptimiza",
    avatarSubtitle: "Sarah · Olùrànlọ́wọ́ Oúnjẹ & Ìlera",
    thinking: "Sarah ń ṣàyẹ̀wò ìmọ̀ràn oúnjẹ yín...",
    recTitle: "Ìmọ̀ràn Ìlera Sarah:",
    welcomeTitle: "Àkójọ Ìkíni & Ìmọ̀ràn Sarah:",
    welcomeText: "Ẹ kú àbọ̀ sí MealOptimiza! Èmi ni Sarah, Olùrànlọ́wọ́ Oúnjẹ yín. Ẹ ya fọ́tò oúnjẹ yín fún àtúnyẹ̀wò kíákíá, tọ́jú ìwọ̀n ṣúgà àti ẹ̀jẹ̀ ríru yín. Jọ̀wọ́ kọ àwọn ẹ̀kúnrẹ́rẹ́ ìlera yín sínú Health Profile kí a lè fún yín ní ìmọ̀ràn tó bá ara yín mu dáradára!",
    replay: "Tun Gbọ́",
    pace: "Ìyára",
    mute: "Dákẹ́",
    unmute: "Gbóhùn",
    profileTitle: "Ṣètò Health Profile Yín 🎯",
    profileSub: "Gba ìmọ̀ràn oúnjẹ tó péye jùlọ fún ààbò ara yín",
    profileSetup: "Ṣètò Nísinsìnyí ⚡",
    profileDone: "Tí Ṣètò ✅",
    profileQuote: "Nípa kíkọ Ọjọ́-orí, Ìwọ̀n, Ẹ̀jẹ̀ ríru, àti Àwọn àìsàn yín, Sarah yóò ṣírò iye oúnjẹ tó bá ara yín mu pẹ́kí!",
    promptsHeader: "✨ Àwọn Ìmọ̀ràn Pàtàkì fún Yín:",
    chipsHeader: "💡 Bi Sarah ní Àwọn Ìbéèrè Oúnjẹ Kíákíá:",
    customHeader: "💬 Tàbí Bi Sarah ní Ìbéèrè Oúnjẹ Kankan:",
    placeholder: "Àpẹẹrẹ: Ǹjẹ́ ọbẹ̀ Ẹ̀gúsí dára? Ṣé mo lè jẹ iṣu sísè?",
    micTooltip: "🎙️ Mo ń tẹ́tí sílẹ̀... Ẹ sọ ìbéèrè yín!",
    portalsHeader: "🚀 Àwọn Ọ̀nà Ìtọ́jú Ìlera Kíákíá:",
    scannerTitle: "Atúnyẹ̀wò Oúnjẹ",
    scannerSub: "Ya fọ́tò oúnjẹ",
    whatsappTitle: "WhatsApp Bot",
    whatsappSub: "Firanṣẹ́ fọ́tò oúnjẹ",
    reportTitle: "Àkọsílẹ̀ Ìlera",
    reportSub: "Àkópọ̀ fún dọ́kítà",
    quickQuestions: [
      { q: "Kí ló dé tí mo fi gbọ́dọ̀ kọ Health Profile?", key: "profile_importance", icon: Target },
      { q: "Báwo ni Àkójọ Ọjà ṣe ń ṣiṣẹ́?", key: "grocery", icon: ShoppingCart },
      { q: "Báwo ni a ṣe lè jẹ Swallow láìsí ṣúgà gíga?", key: "swallow", icon: Activity },
      { q: "Ọbẹ̀ wo ló dára jù fún Ẹ̀jẹ̀ Ríru?", key: "bp", icon: HeartPulse },
      { q: "Kí ni Ọgbọ́n Títò Oúnjẹ (Food Sequencing)?", key: "sequencing", icon: BookOpen },
      { q: "Ṣé mo lè mu Zobo pẹ̀lú oògùn BP?", key: "zobo", icon: Sparkles },
      { q: "Báwo ni a ṣe ń tú àwẹ̀ láìsí ríru inú?", key: "fasting", icon: Flame },
      { q: "Báwo ni a ṣe lè ní ìwọ̀n ara tó dára?", key: "weight_gain", icon: Zap },
      { q: "Báwo ni a ṣe ń jẹ èso lẹ́yìn oúnjẹ?", key: "fruit", icon: Sparkles },
      { q: "Kí ni MealOptimiza lè ṣe fún mi?", key: "app_superpowers", icon: Zap },
    ],
    predictivePrompts: [
      { icon: "🍲", text: "Swallow wo ló dára jù fún ìwọ̀n ṣúgà?", key: "swallow" },
      { icon: "🫀", text: "Báwo ni mo ṣe lè dín ẹ̀jẹ̀ ríru kù pẹ̀lú èròjà àbínibí?", key: "bp" },
      { icon: "💪", text: "Báwo ni mo ṣe lè ní ìwọ̀n ara tó dára?", key: "weight_gain" },
      { icon: "🍊", text: "Báwo ni mo ṣe lè jẹ èso lẹ́yìn oúnjẹ?", key: "fruit" },
    ],
  },
  ig: {
    headerBadge: "Onye Enyemaka Nri",
    headerSubtitle: "Onye Ndú Nri & Ahụike MealOptimiza",
    avatarSubtitle: "Sarah · Onye Ndụmọdụ Nri & Ahụike",
    thinking: "Sarah na-enyocha nri na ahụike gị...",
    recTitle: "Ndụmọdụ Ahụike Sarah:",
    welcomeTitle: "Ozi Nnọọ & Ndụmọdụ Sarah:",
    welcomeText: "Nnọọ na MealOptimiza! Abụ m Sarah, Onye na-enyere gị aka na Nri. Se foto nri gị maka nyocha shuga na kalori ngwa ngwa, ma chebe ahụike gị. Biko mejupụta Health Profile gị ka anyị wee hazie ndụmọdụ dabara ahụ gị kpọmkwem!",
    replay: "Gee Ọzọ",
    pace: "Ọsọ",
    mute: "Mechie",
    unmute: "Kpọọ",
    profileTitle: "Hazie Health Profile Gị 🎯",
    profileSub: "Nweta ezigbo ndụmọdụ nri dabara ahụ gị kpọmkwem",
    profileSetup: "Hazie Ugbu A ⚡",
    profileDone: "Emela ✅",
    profileQuote: "Site n'itinye Afọ, Ibu, Ọbara Mgbali Elu, na Ọnọdụ Ahụike gị, Sarah ga-agbakọ nri dabara ahụ gị ka i wee nwee ahụike zuru oke!",
    promptsHeader: "✨ Ndụmọdụ Pụrụ Iche Maka Gị:",
    chipsHeader: "💡 Jụọ Sarah Ajụjụ Nri Ngwa Ngwa:",
    customHeader: "💬 Ma ọ bụ Jụọ Ajụjụ Nri Ọ Bụla:",
    placeholder: "Dị ka: Ofe Egusi ọ dị mma? Enwere m ike iri ji siri esi?",
    micTooltip: "🎙️ Ana m ege ntị... Kwuo ajụjụ gị!",
    portalsHeader: "🚀 Ụzọ Ngwa Ngwa Maka Ahụike:",
    scannerTitle: "Nyocha Nri",
    scannerSub: "Se foto nri gị",
    whatsappTitle: "WhatsApp Bot",
    whatsappSub: "Zipu foto nri",
    reportTitle: "Akụkọ Ahụike",
    reportSub: "Nchịkọta maka dọkịta",
    quickQuestions: [
      { q: "Gịnị kpatara m ga-eji mejuo Health Profile?", key: "profile_importance", icon: Target },
      { q: "Kedu ka Ndepụta Ahịa si arụ ọrụ?", key: "grocery", icon: ShoppingCart },
      { q: "Kedu ka e si eri Swallow ma shuga arịgaghị elu?", key: "swallow", icon: Activity },
      { q: "Ofe kacha mma maka Ọbara Mgbali Elu?", key: "bp", icon: HeartPulse },
      { q: "Gịnị bụ Usoro Nri (Food Sequencing)?", key: "sequencing", icon: BookOpen },
      { q: "Enwere m ike ịṅụ Zobo na ọgwvw BP?", key: "zobo", icon: Sparkles },
      { q: "Kedu ka a ga-esi gbasaa ọnụ n'udo?", key: "fasting", icon: Flame },
      { q: "Kedu ka m ga-esi nwekwuo ahụ na ike?", key: "weight_gain", icon: Zap },
      { q: "Kedu ka e si eri mkpụrụ osisi mgbe e risịrị nri?", key: "fruit", icon: Sparkles },
      { q: "Gịnị ka MealOptimiza nwere ike imere m?", key: "app_superpowers", icon: Zap },
    ],
    predictivePrompts: [
      { icon: "🍲", text: "Olee swallow kacha mma maka shuga?", key: "swallow" },
      { icon: "🫀", text: "Kedu ka m ga-esi belata ọbara mgbali elu?", key: "bp" },
      { icon: "💪", text: "Kedu ka m ga-esi nwekwuo ahụ na ike?", key: "weight_gain" },
      { icon: "🍊", text: "Kedu ka m ga-esi rie mkpụrụ osisi mgbe nri gasịrị?", key: "fruit" },
    ],
  },
  ha: {
    headerBadge: "Mataimakiyar Abinci",
    headerSubtitle: "Jagoran Abinci da Lafiya na MealOptimiza",
    avatarSubtitle: "Sarah · Jagorar Abinci da Lafiya",
    thinking: "Sarah na duba bayanan abincinku...",
    recTitle: "Shawarar Sarah ta Lafiya:",
    welcomeTitle: "Sakon Maraba da Shawara na Sarah:",
    welcomeText: "Barka da zuwa MealOptimiza! Ni ce Sarah, Mataimakiyar ku kan Abinci. Ɗauki hoton abincinku don sanin sukarin jini da kalori, ku kiyaye lafiyarku. Da fatan za ku cika Bayanan Lafiyarku a ƙasa don samun keɓantaccen shiri na musamman!",
    replay: "Sake Ji",
    pace: "Sauri",
    mute: "Yi Shuru",
    unmute: "Bude Murya",
    profileTitle: "Saita Bayanan Lafiyarku 🎯",
    profileSub: "Samu ingantacciyar shawarar abinci da kariya ga jikinku",
    profileSetup: "Saita Yanzu ⚡",
    profileDone: "An Saita ✅",
    profileQuote: "Ta hanyar shigar da Shekaru, Nauyi, Hawan Jini, da yanayin lafiyarku, Sarah zata lissafa ainihin abincin da ya dace da ku!",
    promptsHeader: "✨ Shawarwari Masu Muhimmanci:",
    chipsHeader: "💡 Tambayi Sarah Game da Abinci Nan Take:",
    customHeader: "💬 Ko Tambayi Kowace Tambayar Abinci:",
    placeholder: "Misali: Shin miyar Egusi na da kyau? Zan iya cin dafaffen doya?",
    micTooltip: "🎙️ Ina sauraro... Faɗi tambayarku!",
    portalsHeader: "🚀 Hanyoyin Sauƙaƙa na Lafiya:",
    scannerTitle: "Mai Duba Abinci",
    scannerSub: "Ɗauki hoton abinci",
    whatsappTitle: "WhatsApp Bot",
    whatsappSub: "Aika hoton abinci",
    reportTitle: "Rahoton Lafiya",
    reportSub: "Takaitaccen bayani ga likita",
    quickQuestions: [
      { q: "Me yasa zan cika Bayanan Lafiyata?", key: "profile_importance", icon: Target },
      { q: "Yaya Jerin Kasuwa ke aiki?", key: "grocery", icon: ShoppingCart },
      { q: "Yaya za a ci Tuwo ba tare da hawan sukari ba?", key: "swallow", icon: Activity },
      { q: "Wace miya ce ta fi dacewa da Hawan Jini?", key: "bp", icon: HeartPulse },
      { q: "Menene Tsarin Cin Abinci (Food Sequencing)?", key: "sequencing", icon: BookOpen },
      { q: "Zan iya shan Zobo tare da maganin BP?", key: "zobo", icon: Sparkles },
      { q: "Yaya za a buɗe baki cikin kwanciyar hankali?", key: "fasting", icon: Flame },
      { q: "Yaya zan samu ƙiba mai kyau da ƙarfi?", key: "weight_gain", icon: Zap },
      { q: "Yaya za a ci 'ya'yan itace bayan abinci?", key: "fruit", icon: Sparkles },
      { q: "Me MealOptimiza zai iya yi mini?", key: "app_superpowers", icon: Zap },
    ],
    predictivePrompts: [
      { icon: "🍲", text: "Wane tuwo ne ya fi dacewa da sukarin jini?", key: "swallow" },
      { icon: "🫀", text: "Yaya zan rage hawan jini da kayan miya na gida?", key: "bp" },
      { icon: "💪", text: "Yaya zan samu ƙiba mai kyau da ƙarfi?", key: "weight_gain" },
      { icon: "🍊", text: "Yaya zan ci 'ya'yan itace bayan abinci?", key: "fruit" },
    ],
  },
  fr: {
    headerBadge: "Assistante Nutrition",
    headerSubtitle: "Guide Nutrition & Santé MealOptimiza",
    avatarSubtitle: "Sarah · Guide Nutritionnelle IA",
    thinking: "Sarah analyse vos données nutritionnelles...",
    recTitle: "Recommandation Clinique de Sarah :",
    welcomeTitle: "Guide & Message de Bienvenue de Sarah :",
    welcomeText: "Bienvenue sur MealOptimiza ! Je suis Sarah, votre Assistante en Nutrition. Prenez des photos de vos plats pour une analyse instantanée et découvrez notre liste de courses intelligente. Complétez votre profil de santé ci-dessous pour des recommandations personnalisées !",
    replay: "Réécouter",
    pace: "Rythme",
    mute: "Muet",
    unmute: "Activer",
    profileTitle: "Calibrez Votre Profil Santé 🎯",
    profileSub: "Débloquez des recommandations 100% personnalisées",
    profileSetup: "Configurer ⚡",
    profileDone: "Calibré ✅",
    profileQuote: "En renseignant votre Âge, Poids, Tension et Antécédents, Sarah et Avo adaptent chaque limite de glucides pour protéger votre santé !",
    promptsHeader: "✨ Recommandé pour Vous :",
    chipsHeader: "💡 Posez une Question Nutritionnelle à Sarah :",
    customHeader: "💬 Ou Posez N'importe Quelle Question Repas :",
    placeholder: "Ex : La sauce Egusi est-elle saine ? Puis-je manger de l'igname ?",
    micTooltip: "🎙️ À l'écoute... Posez votre question !",
    portalsHeader: "🚀 Raccourcis Directs :",
    scannerTitle: "Scanner de Repas",
    scannerSub: "Analyse des macros",
    whatsappTitle: "Bot WhatsApp",
    whatsappSub: "Journal par photo",
    reportTitle: "Bilan de Santé",
    reportSub: "Résumé pour médecin",
    quickQuestions: [
      { q: "Pourquoi remplir mon Profil Santé ?", key: "profile_importance", icon: Target },
      { q: "Comment fonctionne la Liste de Courses ?", key: "grocery", icon: ShoppingCart },
      { q: "Comment manger des féculents avec un diabète ?", key: "swallow", icon: Activity },
      { q: "Meilleures sauces pour l'Hypertension ?", key: "bp", icon: HeartPulse },
      { q: "Qu'est-ce que le Séquençage des Repas ?", key: "sequencing", icon: BookOpen },
      { q: "Puis-je boire du Bissap avec mon traitement BP ?", key: "zobo", icon: Sparkles },
      { q: "Rompre le jeûne sans pic de glycémie ?", key: "fasting", icon: Flame },
      { q: "Comment prendre du poids et du muscle sainement ?", key: "weight_gain", icon: Zap },
      { q: "Comment consommer les fruits entiers ?", key: "fruit", icon: Sparkles },
      { q: "Que peut faire MealOptimiza pour moi ?", key: "app_superpowers", icon: Zap },
    ],
    predictivePrompts: [
      { icon: "🍲", text: "Quelle alternative pour stabiliser ma glycémie ?", key: "swallow" },
      { icon: "🫀", text: "Comment protéger ma tension avec des épices naturelles ?", key: "bp" },
      { icon: "💪", text: "Comment prendre du muscle avec la cuisine africaine ?", key: "weight_gain" },
      { icon: "🍊", text: "Comment combiner les fruits avec mes repas ?", key: "fruit" },
    ],
  },
};

export default function SmartVideoConcierge({
  isOpen,
  onClose,
  onOpenScanner,
  onOpenWhatsApp,
  onOpenHealthSetup,
}: SmartVideoConciergeProps) {
  const navigate = useNavigate();
  const { profile } = useUser();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.94);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mealoptimiza_sarah_lang");
      if (saved && ["en", "pcm", "yo", "ig", "ha", "fr"].includes(saved)) {
        return saved as SupportedLanguage;
      }
    }
    return "en";
  });
  const [userQuery, setUserQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const silenceTimerRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  const currentUi = UI_LOCALIZATIONS[selectedLanguage] || UI_LOCALIZATIONS.en;

  const isProfileComplete = Boolean(
    profile?.age && profile?.weight && (profile?.medicalCondition || (profile?.conditions && profile.conditions.length > 0))
  );

  // Fluid Multilingual Speech function with lip-sync and dynamic voice selection
  const speakText = (text: string, lang: string = selectedLanguage) => {
    if (isMuted) return;
    speakWithSarah(text, {
      voiceId: "YIgPmt6aTfZFf6mjP9RC",
      lang: lang,
      rate: speechRate,
      pitch: 1.02,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Auto-speak on modal open or language change
  useEffect(() => {
    if (isOpen) {
      setAiResponse(null);
      speakText(currentUi.welcomeText, selectedLanguage);
    } else {
      stopSarahSpeech();
      setIsSpeaking(false);
    }
    return () => {
      stopSarahSpeech();
    };
  }, [isOpen, selectedLanguage, speechRate]);

  const handleLanguageChange = (langId: SupportedLanguage) => {
    triggerHaptic("light");
    setSelectedLanguage(langId);
    setAiResponse(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("mealoptimiza_sarah_lang", langId);
    }
  };

  const toggleMute = () => {
    triggerHaptic("light");
    if (!isMuted) {
      stopSarahSpeech();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      speakText(aiResponse || currentUi.welcomeText, selectedLanguage);
    }
  };

  const handleReplaySpeech = () => {
    triggerHaptic("light");
    if (isMuted) setIsMuted(false);
    speakText(aiResponse || currentUi.welcomeText, selectedLanguage);
  };

  const handleCycleSpeed = () => {
    triggerHaptic("light");
    let nextRate = 0.94;
    if (speechRate === 0.94) nextRate = 1.05;
    else if (speechRate === 1.05) nextRate = 0.85;
    else nextRate = 0.94;

    setSpeechRate(nextRate);
    toast.info(`Pace: ${nextRate === 0.85 ? "Relaxed (0.85x)" : nextRate === 1.05 ? "Brisk (1.05x)" : "Natural (0.94x)"}`);
  };

  const handleAskQuestion = (query: string, keyHint?: string) => {
    if (!query.trim() && !keyHint) return;
    setUserQuery(query);
    setIsThinking(true);
    triggerHaptic("light");
    stopSarahSpeech();

    const q = query.toLowerCase();
    const langKb = MULTILINGUAL_KNOWLEDGE_BASE[selectedLanguage] || MULTILINGUAL_KNOWLEDGE_BASE.en;
    let answer = "";

    if (keyHint && langKb[keyHint]) {
      answer = langKb[keyHint];
    } else if (q.includes("profile") || q.includes("setup") || q.includes("start") || q.includes("why") || q.includes("bayani") || q.includes("nkowa") || q.includes("nkọwa") || q.includes("kí ló dé") || q.includes("pourquoi")) {
      answer = langKb.profile_importance;
    } else if (q.includes("app") || q.includes("superpower") || q.includes("help") || q.includes("what") || q.includes("ọrụ") || q.includes("taimako") || q.includes("ẹrọ") || q.includes("fonctionnalite")) {
      answer = langKb.app_superpowers;
    } else if (q.includes("market") || q.includes("grocery") || q.includes("shopping") || q.includes("store") || q.includes("ahịa") || q.includes("ahia") || q.includes("ọjà") || q.includes("oja") || q.includes("kasuwa") || q.includes("courses")) {
      answer = langKb.grocery;
    } else if (q.includes("swallow") || q.includes("amala") || q.includes("fufu") || q.includes("garri") || q.includes("yam") || q.includes("carb") || q.includes("tuwo") || q.includes("ọka") || q.includes("oka") || q.includes("feculent")) {
      answer = langKb.swallow;
    } else if (q.includes("bp") || q.includes("pressure") || q.includes("hypertension") || q.includes("salt") || q.includes("maggi") || q.includes("iru") || q.includes("ọbara") || q.includes("obara") || q.includes("ẹ̀jẹ̀") || q.includes("eje") || q.includes("hawan jini") || q.includes("tension")) {
      answer = langKb.bp;
    } else if (q.includes("zobo") || q.includes("hibiscus") || q.includes("tea") || q.includes("drink") || q.includes("shayi") || q.includes("mmiri zobo") || q.includes("bissap") || q.includes("infusion")) {
      answer = langKb.zobo;
    } else if (q.includes("fast") || q.includes("fasting") || q.includes("autophagy") || q.includes("break") || q.includes("àwẹ̀") || q.includes("awe") || q.includes("azum") || q.includes("ọnụ") || q.includes("onu") || q.includes("jeune")) {
      answer = langKb.fasting;
    } else if (q.includes("sequence") || q.includes("order") || q.includes("first") || q.includes("plate") || q.includes("ofe") || q.includes("miya") || q.includes("ọbẹ̀") || q.includes("obe") || q.includes("sequencage")) {
      answer = langKb.sequencing;
    } else if (q.includes("gain") || q.includes("weight") || q.includes("muscle") || q.includes("bulk") || q.includes("ƙiba") || q.includes("kiba") || q.includes("ibu") || q.includes("sanra") || q.includes("poids")) {
      answer = langKb.weight_gain;
    } else if (q.includes("fruit") || q.includes("garden egg") || q.includes("agbalumo") || q.includes("udara") || q.includes("ube") || q.includes("guava") || q.includes("èso") || q.includes("eso") || q.includes("mkpụrụ") || q.includes("mkpuru") || q.includes("'ya'yan itace") || q.includes("fruits")) {
      answer = langKb.fruit;
    } else {
      if (selectedLanguage === "pcm") {
        answer = `Better question regarding ${query}! To get 100% correct advice, check your Health Profile. When you chop your food with drawing vegetable soups like Ewedu, Okra, or Ugwu, your blood sugar go stay balanced!`;
      } else if (selectedLanguage === "yo") {
        answer = `Ibeere daradara nipa ${query}! Lati ri imoran to peye ju, e ri i daju pe e ko awon ekunrere ilera yin sinu Health Profile. Ounje yin yoo fun yin ni ilera pipe pelu obe ewebe bii Ewedu ati Okiro!`;
      } else if (selectedLanguage === "ig") {
        answer = `Ajuju magburu onwe ya gbasara ${query}! Iji nweta ezigbo ndumodu, mejuo Health Profile gi. Mgbe i ji ofe akwukwo nri di ka Okwuru ma o bu Ewedu rie nri gi, shuga gi ga-adi mma!`;
      } else if (selectedLanguage === "ha") {
        answer = `Kyakkyawar tambaya game da ${query}! Don samun ingantacciyar shawara, ku tabbatar kun cika Bayanan Lafiyarku. Cin abinci tare da miyar ganye kamar kubewa zai kiyaye lafiyarku!`;
      } else if (selectedLanguage === "fr") {
        answer = `Excellente question concernant ${query} ! Pour des conseils personnalises, completez votre Profil de Sante. Accompagnes de sauces traditionnelles riches en legumes, vos repas vous apportent une energie durable !`;
      } else {
        answer = `That is a wonderful question regarding ${query}! For maximum personalized accuracy, make sure your Health Profile is calibrated. When paired with high-fiber African vegetable soups like Ewedu, Okra, or Ugu, your meals maintain balanced blood sugar and optimal vitality.`;
      }
    }

    setTimeout(() => {
      setIsThinking(false);
      setAiResponse(answer);
      speakText(answer, selectedLanguage);
    }, 400);
  };

  // Voice Input (Microphone Speech-to-Text with Multilingual Recognition)
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported on this browser.");
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (userQuery.trim()) {
        handleAskQuestion(userQuery);
      }
      return;
    }

    triggerHaptic("medium");
    stopSarahSpeech();
    setIsSpeaking(false);

    try {
      const recognition = new SpeechRecognition();
      const langLocaleMap: Record<string, string> = {
        en: "en-US",
        pcm: "en-NG",
        yo: "yo-NG",
        ig: "ig-NG",
        ha: "ha-NG",
        fr: "fr-FR",
      };
      recognition.lang = langLocaleMap[selectedLanguage] || "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let capturedText = "";

      recognition.onstart = () => {
        setIsListening(true);
        toast.info(currentUi.micTooltip || "🎙️ Listening... Speak your question!");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = 0; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            capturedText += trans + " ";
          } else {
            interim += trans;
          }
        }
        const full = (capturedText + interim).trim();
        setUserQuery(full);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (full.length > 2) {
            try { recognition.stop(); } catch {}
            setIsListening(false);
            handleAskQuestion(full);
          }
        }, 3000);
      };

      recognition.onerror = (event: any) => {
        console.warn("[VoiceAI] Speech recognition error:", event.error);
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();

      setTimeout(() => {
        if (speechRecognitionRef.current && isListening) {
          try { speechRecognitionRef.current.stop(); } catch {}
        }
      }, 60000);
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };

  const handleStartHealthProfileSetup = () => {
    onClose();
    if (onOpenHealthSetup) {
      onOpenHealthSetup();
    } else {
      navigate("/profile");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-teal-100 shadow-2xl z-50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white max-h-[92vh] flex flex-col">
        <DialogTitle className="sr-only">Sarah The Nutrition Assistant</DialogTitle>
        <DialogDescription className="sr-only">Interactive nutrition and health guide for MealOptimiza</DialogDescription>

        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#1f7a8c] via-[#0d9488] to-[#115e59] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-xs">
                👩🏾‍💼
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${isSpeaking ? "bg-emerald-400 animate-ping" : "bg-emerald-400"}`} />
            </div>
            <div>
              <h3 className="font-black text-sm leading-tight flex items-center gap-1.5">
                <span>Sarah</span>
                <span className="text-[9.5px] font-black bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full shadow-2xs">
                  {currentUi.headerBadge}
                </span>
              </h3>
              <p className="text-[10px] text-teal-100 font-medium">{currentUi.headerSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
              title={isMuted ? currentUi.unmute : currentUi.mute}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className={isSpeaking ? "text-amber-300 animate-bounce" : ""} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer text-white"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Assistant Body */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {/* Animated Speaking Stage / Waveform Stage */}
          <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-teal-950 rounded-3xl p-5 border border-teal-500/20 text-center shadow-inner overflow-hidden">
            {/* Audio Waves / Ripple & Live Lip-Sync Sarah Avatar */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="relative mb-2">
                <SarahAvatar isSpeaking={isSpeaking} size={150} />
                {isSpeaking && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse shadow-md flex items-center gap-1 border border-emerald-300/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-ping" />
                    <span>Speaking</span>
                  </span>
                )}
              </div>

              <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block mb-0.5">
                {isThinking ? currentUi.thinking : currentUi.avatarSubtitle}
              </span>

              {/* Subtitle / Dialogue Bubble */}
              <div className="bg-black/75 backdrop-blur-md text-teal-200 text-xs font-medium p-3.5 rounded-2xl border border-white/10 shadow-lg text-left leading-relaxed mt-2 max-w-sm">
                <p className="text-white font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>{aiResponse ? currentUi.recTitle : currentUi.welcomeTitle}</span>
                </p>
                <p className="text-[11.5px] text-teal-100/90 leading-relaxed">
                  {aiResponse || currentUi.welcomeText}
                </p>
              </div>

              {/* Language Switcher & Voice Controls Bar */}
              <div className="flex flex-col items-center gap-2 mt-3 w-full">
                {/* Language Switcher Bar */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {[
                    { id: "en", label: "EN" },
                    { id: "pcm", label: "Pidgin" },
                    { id: "yo", label: "Yorùbá" },
                    { id: "ig", label: "Igbo" },
                    { id: "ha", label: "Hausa" },
                    { id: "fr", label: "Français" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id as SupportedLanguage)}
                      className={`text-[10px] font-bold px-2 py-0.8 rounded-lg cursor-pointer transition-all ${
                        selectedLanguage === lang.id
                          ? "bg-amber-400 text-slate-950 font-black shadow-xs scale-105"
                          : "bg-white/15 hover:bg-white/25 text-white"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                {/* Micro Voice Tuning Pill (Replay, Pace & Mute) */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[10.5px]">
                  <button
                    type="button"
                    onClick={handleReplaySpeech}
                    className="text-teal-200 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    title={currentUi.replay}
                  >
                    <RotateCcw size={11} />
                    <span>{currentUi.replay}</span>
                  </button>

                  <span className="text-white/30">•</span>

                  <button
                    type="button"
                    onClick={handleCycleSpeed}
                    className="text-amber-300 hover:text-amber-200 font-black flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    title="Change voice reading pace"
                  >
                    <span>{currentUi.pace}: {speechRate === 0.85 ? "0.85x" : speechRate === 1.05 ? "1.05x" : "0.94x"}</span>
                  </button>

                  <span className="text-white/30">•</span>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="text-teal-200 hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                  >
                    {isMuted ? <VolumeX size={11} className="text-rose-300" /> : <Volume2 size={11} className="text-emerald-300" />}
                    <span>{isMuted ? currentUi.unmute : currentUi.mute}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 THE IMPORTANCE OF CALIBRATING HEALTH PROFILE (CRITICAL ACTION BANNER) */}
          <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 dark:from-teal-950/70 dark:via-slate-900 dark:to-emerald-950/70 rounded-2xl p-3.5 border-2 border-teal-300 dark:border-teal-700 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1f7a8c] text-white rounded-lg shadow-2xs">
                  <Target size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {currentUi.profileTitle}
                  </h4>
                  <p className="text-[10.5px] text-teal-800 dark:text-teal-300 font-medium">
                    {currentUi.profileSub}
                  </p>
                </div>
              </div>

              {isProfileComplete ? (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300">
                  {currentUi.profileDone}
                </span>
              ) : (
                <button
                  onClick={handleStartHealthProfileSetup}
                  className="bg-[#1f7a8c] hover:bg-[#0d9488] text-white text-[10.5px] font-black px-3 py-1.5 rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  {currentUi.profileSetup}
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              "{currentUi.profileQuote}"
            </p>
          </div>

          {/* 💡 PREDICTIVE PROMPTS (Multilingual & Time-Adaptive) */}
          <div className="space-y-2">
            <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
              {currentUi.promptsHeader}
            </span>
            <div className="flex flex-col gap-1.5">
              {currentUi.predictivePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(prompt.text, prompt.key)}
                  className="p-2.5 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/80 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800 rounded-xl text-left font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base group-hover:scale-125 transition-transform">{prompt.icon}</span>
                    <span className="text-[11.5px] text-amber-950 dark:text-amber-200">{prompt.text}</span>
                  </div>
                  <ChevronRight size={13} className="text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* ⚡ 1-Tap Quick Clinical Nutrition Question Chips */}
          <div className="space-y-2">
            <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
              {currentUi.chipsHeader}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentUi.quickQuestions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAskQuestion(item.q, item.key)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-left font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-[#1f7a8c] dark:text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="text-[11px] truncate">{item.q}</span>
                    </div>
                    <ChevronRight size={12} className="text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 💬 Interactive Question Input Box (Voice + Text) */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
              {currentUi.customHeader}
            </span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 shadow-2xs">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskQuestion(userQuery)}
                placeholder={currentUi.placeholder}
                className="flex-1 bg-transparent px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />

              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl text-white transition-all cursor-pointer ${
                  isListening ? "bg-red-500 animate-pulse" : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                }`}
                title="Speak to Sarah"
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>

              <button
                type="button"
                onClick={() => handleAskQuestion(userQuery)}
                disabled={!userQuery.trim()}
                className="p-2 bg-[#1f7a8c] hover:bg-[#0d9488] disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* 🚀 Quick App Portal Shortcuts */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10.5px] uppercase font-black tracking-wider text-slate-400 block">
              {currentUi.portalsHeader}
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenScanner) onOpenScanner();
                  else navigate("/scan");
                }}
                className="p-2.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer group"
              >
                <div className="p-1.5 bg-teal-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <Camera size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 dark:text-white">{currentUi.scannerTitle}</div>
                  <div className="text-[9.5px] text-slate-500">{currentUi.scannerSub}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenWhatsApp) onOpenWhatsApp();
                  else navigate("/profile");
                }}
                className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer group"
              >
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <MessageCircle size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 dark:text-white">{currentUi.whatsappTitle}</div>
                  <div className="text-[9.5px] text-slate-500">{currentUi.whatsappSub}</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate("/health-report");
                }}
                className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer col-span-2 group"
              >
                <div className="p-1.5 bg-blue-600 text-white rounded-lg group-hover:scale-105 transition-transform">
                  <FileText size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-900 dark:text-white">{currentUi.reportTitle}</div>
                  <div className="text-[9.5px] text-slate-500">{currentUi.reportSub}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
