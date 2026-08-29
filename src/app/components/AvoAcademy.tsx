import { useState, useMemo, useEffect, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  Flame,
  HeartPulse,
  Brain,
  Leaf,
  Droplets,
  Trophy,
  Share2,
  Clock,
  Zap,
  Activity,
  ShieldCheck,
  Award,
  RefreshCw,
  Sliders,
  TrendingDown,
  Info,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { toast } from "sonner";

export interface AcademyLesson {
  id: string;
  title: string;
  category: "Glucose Science" | "Heart & BP" | "Gut & Fiber" | "Cooking Hacks" | "Pregnancy Health" | "Prostate Health" | "Arthritis & Joints";
  readTime: string;
  icon: any;
  headline: string;
  storySlides: string[];
  takeaway: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: "pregnancy-gestational-shield",
    title: "Eating for Pregnancy & Gestational Shield",
    category: "Pregnancy Health",
    readTime: "60 sec",
    icon: HeartPulse,
    headline: "Protecting maternal insulin sensitivity & preventing preeclampsia with traditional greens",
    storySlides: [
      "During pregnancy, placenta hormones (human placental lactogen) naturally increase insulin resistance to ensure adequate glucose reaches the growing baby. In mothers genetically predisposed to diabetes, this can trigger Gestational Diabetes Mellitus (GDM).",
      "Traditional African greens like Fluted Pumpkin (Ugwu), Waterleaf, and Malabar Spinach are nature's maternal superfoods: they provide massive bioavailable Folate (Vitamin B9) for neural tube development, non-heme iron, and magnesium.",
      "To prevent dangerous post-prandial spikes, pregnant mothers should pair moderate swallows (like Plantain-Oat Fufu) with fiber and protein first.",
      "Keeping stew salt under 1,500mg by seasoning with fresh locust beans (Iru) and ginger significantly reduces the risk of pregnancy-induced hypertension and preeclampsia! 🤰✨",
    ],
    takeaway: "Load your plate with Ugwu, boiled eggs, and Plantain-Oat swallow to supply crucial folate while keeping gestational blood sugar perfectly balanced.",
    quiz: {
      question: "Which traditional leafy green provides vital folate and iron for maternal & fetal health?",
      options: ["Fluted Pumpkin (Ugwu)", "White Bread", "Cassava Starch"],
      correctIndex: 0,
      explanation: "Correct! Ugwu is exceptionally rich in folate, iron, and antioxidant polyphenols essential for healthy pregnancy.",
    },
  },
  {
    id: "prostate-lycopene-zinc",
    title: "Eating for Prostate Health & PSA Balance",
    category: "Prostate Health",
    readTime: "60 sec",
    icon: ShieldCheck,
    headline: "How cooked tomato stews and pumpkin seeds (Egusi) protect prostate cell integrity in men 40+",
    storySlides: [
      "Benign Prostatic Hyperplasia (BPH) and elevated PSA affect over 60% of Black men over age 50, driven by chronic inflammation and dihydrotestosterone (DHT) binding.",
      "Cooked Tomato Stew is one of the most potent prostate medicines on earth. Cooking tomatoes in healthy oils (like extra virgin olive or light unrefined palm oil) increases the bioavailability of Lycopene by over 400% compared to raw tomatoes!",
      "Lycopene is a powerful carotenoid that concentrates directly in prostate tissue, neutralizing free radicals and suppressing prostate cell proliferation.",
      "Pairing your stew with zinc-dense Pumpkin Seeds (Egusi) and cruciferous cabbage provides the building blocks for healthy testosterone balance and urinary flow. 🩺",
    ],
    takeaway: "Cooked tomato stew with healthy oils provides bioavailable lycopene that concentrates directly in prostate tissue to reduce inflammation.",
    quiz: {
      question: "Why does cooking tomato stew with healthy oil boost its prostate benefits?",
      options: [
        "It increases lycopene bioavailability by over 400%",
        "It burns away all vitamins",
        "It converts starch into protein",
      ],
      correctIndex: 0,
      explanation: "Spot on! Lycopene is fat-soluble; simmering tomatoes with healthy oils unlocks maximum prostate-protective absorption.",
    },
  },
  {
    id: "arthritis-anti-inflammatory",
    title: "Eating for Arthritis & Joint Mobility",
    category: "Arthritis & Joints",
    readTime: "60 sec",
    icon: Activity,
    headline: "Targeting joint cartilage breakdown and gout flares with African anti-inflammatory botanicals",
    storySlides: [
      "Osteoarthritis and Gout flares are driven by systemic pro-inflammatory cytokines (IL-6, TNF-alpha) and uric acid crystallization in joint synovial fluid.",
      "Traditional African spices—specifically Ginger (Atale), Garlic (Ayu), Turmeric, and fermented Locust Beans (Iru)—contain gingerols and allicin that naturally inhibit the inflammatory COX-2 and NF-kB pathways.",
      "For Gout sufferers, reducing high-purine organ meats (shaki, liver, cow foot) and staying well-hydrated with fresh water flushes uric acid out through the kidneys.",
      "Adding Omega-3 rich Titus (Mackerel) fish twice a week lubricates joint cartilage and cuts morning stiffness by up to 40%! 🦴⚡",
    ],
    takeaway: "Season your stews with generous fresh ginger, garlic, and turmeric while choosing oily fish like Titus mackerel to naturally calm joint pain.",
    quiz: {
      question: "What natural compound in fresh Ginger and Garlic helps soothe joint arthritis pain?",
      options: [
        "Bioactive Gingerols & Allicin that inhibit inflammatory COX-2 pathways",
        "Refined white sugar",
        "Sodium chloride",
      ],
      correctIndex: 0,
      explanation: "Exactly! Gingerols and allicin act as natural, stomach-friendly anti-inflammatory agents for joint mobility.",
    },
  },

  {
    id: "resistant-starch",
    title: "The Resistant Starch Hack",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Flame,
    headline: "How cooling your Yam or Rice lowers the glycemic spike by 35%",
    storySlides: [
      "When starches like White Rice, Boiled Yam, or Potatoes are freshly cooked, their amylose molecules are easily broken down by digestive enzymes into glucose, causing a rapid blood sugar spike.",
      "However, when cooked starch is cooled in the fridge (even just for 12–24 hours), a biochemical process called RETROGRADATION occurs. The starch crystallizes into 'Resistant Starch Type 3'.",
      "Resistant starch cannot be digested in your small intestine! Instead, it travels to your colon to feed healthy microbiome bacteria, producing short-chain fatty acids (SCFAs) that improve insulin sensitivity.",
      "The best part? You can REHEAT the cooled yam or rice before eating—the resistant starch structure stays locked in! 🍠✨",
    ],
    takeaway: "Cook your yam or rice in batches, cool overnight, and reheat. Same authentic taste, but with a 35% lower blood sugar spike!",
    quiz: {
      question: "Does reheating cooled yam destroy the beneficial resistant starch?",
      options: [
        "Yes, heat turns it back into rapid sugar",
        "No, the resistant starch structure remains stable",
        "Only if you add palm oil",
      ],
      correctIndex: 1,
      explanation: "Correct! Reheating does not reverse retrograded resistant starch. You get all the gut and glucose benefits with a warm meal!",
    },
  },
  {
    id: "bitterleaf-insulin",
    title: "The Bitterleaf Insulin Miracle",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Leaf,
    headline: "Why Onugbu / Bitterleaf soup sensitizes cellular insulin receptors",
    storySlides: [
      "Bitterleaf (Vernonia amygdalina) has been used in West African herbal medicine for centuries. Modern molecular pharmacology now explains exactly why it works.",
      "Bitterleaf is dense in Vernodalin, Luteolin, and active sesquiterpene lactones. These bioactive phytochemicals activate AMPK (AMP-activated protein kinase) in your liver and muscles.",
      "AMPK is your body's master metabolic switch—often called 'exercise in a bottle'. When AMPK is activated, your muscle cells pull glucose directly out of your bloodstream without needing extra insulin.",
      "Drinking squeezed bitterleaf water or enjoying fresh Onugbu soup with lean fish provides a natural, food-based glycemic shield! 🌿",
    ],
    takeaway: "Bitterleaf compounds activate AMPK, acting like a natural insulin sensitizer to pull sugar safely into your muscle cells.",
    quiz: {
      question: "What master metabolic enzyme does Bitterleaf activate to lower blood glucose?",
      options: ["AMPK (AMP-activated protein kinase)", "Amylase", "Lipase"],
      correctIndex: 0,
      explanation: "Spot on! AMPK activation helps your muscle cells absorb glucose directly, taking strain off your pancreas.",
    },
  },
  {
    id: "swallow-velocity-index",
    title: "Swallow Glucose Velocity (GVI)",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Activity,
    headline: "Why Pounded Yam spikes in 20 mins while Oat Swallow plateaus over 75 mins",
    storySlides: [
      "Not all carbohydrates are digested at the same velocity. The 'Glucose Velocity Index' measures how fast glucose enters the bloodstream per gram of swallowed food.",
      "Pounded Yam and Garri have a high GVI (>80)—their pure starch chains hydrolyze rapidly in the stomach, creating a sharp 40–60 mg/dL glucose excursion within 25 minutes.",
      "In contrast, Oat Swallow or Plantain Flour combined with Okra contains viscous soluble beta-glucan fibers that create an intestinal gel barrier.",
      "This gel barrier stretches glucose absorption over 75–90 minutes, turning a dangerous spike into a gentle, sustained metabolic plateau! 🥣",
    ],
    takeaway: "Choose high-viscosity swallows (Oat, Plantain, or Okra-blended) to slow glucose velocity and eliminate post-meal fatigue.",
    quiz: {
      question: "How does soluble fiber in Oat and Okra swallows prevent a rapid blood sugar spike?",
      options: [
        "By neutralizing stomach acid completely",
        "By forming an intestinal gel barrier that slows starch hydrolysis",
        "By turning carbohydrates into pure protein",
      ],
      correctIndex: 1,
      explanation: "Correct! The viscous gel physically delays enzymatic breakdown, smoothing out the post-meal glucose curve.",
    },
  },
  {
    id: "soleus-muscle-sink",
    title: "The 20-Minute Post-Meal Muscle Sink",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Zap,
    headline: "How light soleus walking activates non-insulin GLUT4 glucose disposal",
    storySlides: [
      "Your soleus calf muscle has the highest oxidative slow-twitch fiber density in your body and can burn circulating blood glucose for fuel without requiring insulin.",
      "When you take a gentle 15-minute walk starting 20 minutes after eating a heavy meal (like Jollof or Swallow), muscle contractions trigger GLUT4 transporter vesicles to fuse with the cell membrane.",
      "GLUT4 transports glucose directly from your bloodstream into the working muscle cells, dropping your peak post-meal glucose spike by up to 35%.",
      "No intense sweating required! A brisk stroll around your compound or living room immediately after lunch protects your beta-cells from insulin exhaustion. 🚶‍♂️",
    ],
    takeaway: "Walk for 15 minutes roughly 20 minutes after meals to activate GLUT4 and clear glucose without stressing your pancreas.",
    quiz: {
      question: "When is the optimal window to take a light walk to blunt a post-meal glucose spike?",
      options: [
        "20 minutes after finishing your meal",
        "3 hours before eating",
        "Right before going to sleep only",
      ],
      correctIndex: 0,
      explanation: "Spot on! The 20-minute post-meal window catches glucose as it begins entering circulation, flattening the peak.",
    },
  },
  {
    id: "fermented-iru-glp1",
    title: "Fermented Iru (Locust Beans) & GLP-1",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: ShieldCheck,
    headline: "The ancestral seasoning that stimulates natural incretin hormone release",
    storySlides: [
      "Fermented locust beans (Iru / Dawadawa / Ogiri) are a cornerstone of traditional West African soups, produced through alkaline fermentation by Bacillus subtilis.",
      "Recent 2026 peptide research shows that bio-peptides released during Iru fermentation stimulate enteroendocrine L-cells in the gut to release GLP-1 (Glucagon-Like Peptide-1).",
      "Natural GLP-1 slows stomach emptying, signals satiety to the brain, and enhances glucose-dependent insulin secretion from the pancreas.",
      "Cooking with authentic Iru not only replaces high-sodium seasoning cubes but also provides ancestral, food-based GLP-1 metabolic support! 🍲",
    ],
    takeaway: "Fermented locust beans (Iru) contain natural bioactive peptides that stimulate gut GLP-1, boosting satiety and steady glucose control.",
    quiz: {
      question: "What beneficial metabolic hormone is stimulated by fermented locust bean peptides?",
      options: ["Natural GLP-1", "Adrenaline", "Cortisol"],
      correctIndex: 0,
      explanation: "Exactly! Iru peptides stimulate gut L-cells to release GLP-1, enhancing natural satiety and glucose buffering.",
    },
  },
  {
    id: "akamu-protein-buffer",
    title: "The Akamu (Pap) Glucose Buffer",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Flame,
    headline: "Why eating Pap alone causes rapid blood sugar spikes—and how to shield it",
    storySlides: [
      "Akamu (Ogi / Pap) made from refined corn or millet paste has a high glycemic index (GI > 75). When consumed with added sugar or evaporated milk alone, it spikes blood sugar within 20 minutes.",
      "The rapid glucose rise is because refined cornstarch liquid has almost zero gastric delay and enters the bloodstream immediately.",
      "The Nigerian Breakfast Shield: Never drink Akamu alone! Always pair it with Akara (steamed bean cakes), boiled eggs, or peanut butter.",
      "The dense protein and lipid matrix in beans and eggs delays stomach emptying by up to 90 minutes, converting a spike into a steady plateau! 🥞",
    ],
    takeaway: "Always anchor high-GI Akamu with protein like Akara or boiled eggs to slow glucose absorption and prevent energy crashes.",
    quiz: {
      question: "Why should Akamu (Pap) always be paired with Akara or boiled eggs?",
      options: [
        "To make the plate look colorful",
        "Protein & lipids delay gastric emptying and prevent a glucose surge",
        "To add extra sugar",
      ],
      correctIndex: 1,
      explanation: "Correct! Protein and healthy fats buffer the carb absorption, preventing blood sugar from spiking uncontrollably.",
    },
  },
  {
    id: "moringa-antioxidants",
    title: "Moringa Oleifera & Fasting Sugar",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: ShieldCheck,
    headline: "The molecular power of Quercetin & Chlorogenic Acid in Moringa leaves",
    storySlides: [
      "Moringa Oleifera (known as Zogale in Northern Nigeria) is celebrated as a 'miracle tree' because of its extraordinary density of polyphenol antioxidants.",
      "Two primary compounds in Moringa—Chlorogenic Acid and Quercetin—specifically inhibit the enzyme Glucose-6-Phosphatase in the liver.",
      "By inhibiting this enzyme, Moringa prevents your liver from releasing excess stored glucose into your blood during overnight fasting periods.",
      "Adding dried Moringa leaf powder to soups or drinking fresh Moringa tea in the morning supports lower waking fasting glucose levels! 🌿",
    ],
    takeaway: "Moringa leaves contain chlorogenic acid which helps regulate liver glucose release, keeping morning fasting numbers steady.",
    quiz: {
      question: "Which organ's glucose release does Moringa help regulate during fasting?",
      options: ["The Liver", "The Kidneys", "The Lungs"],
      correctIndex: 0,
      explanation: "Correct! Moringa regulates liver glucose production, preventing high fasting blood sugar in the morning.",
    },
  },
  {
    id: "vinegar-acid-buffer",
    title: "The Acid Shield (Citrus & Vinegar)",
    category: "Glucose Science",
    readTime: "60 sec",
    icon: Brain,
    headline: "How lemon, lime, or apple cider vinegar deactivates alpha-amylase",
    storySlides: [
      "Salivary and pancreatic alpha-amylase are the primary enzymes that break complex starches into simple glucose sugars in your mouth and upper intestine.",
      "Alpha-amylase enzymes require a neutral pH to function efficiently. Adding organic acids (such as fresh lime juice, unsweetened Zobo, or 1 tbsp apple cider vinegar) lowers the digestive pH.",
      "This temporary pH drop deactivates up to 30% of alpha-amylase activity, slowing the rate at which starches like rice or yam are broken down into sugar.",
      "Enjoying a glass of warm lemon water or unsweetened hibiscus tea 10 minutes before starch meals acts as a natural enzymatic brake! 🍋",
    ],
    takeaway: "Organic acids from citrus or vinegar temporarily inhibit amylase enzymes, reducing the speed of carbohydrate digestion.",
    quiz: {
      question: "What digestive enzyme is temporarily slowed down by organic acids from citrus or vinegar?",
      options: ["Alpha-amylase", "Pepsin", "Lactase"],
      correctIndex: 0,
      explanation: "Spot on! Alpha-amylase is inhibited by lower pH, giving your body more time to process starch safely.",
    },
  },
  {
    id: "jollof-sequencing",
    title: "The Jollof Rice Sequencing Secret",
    category: "Cooking Hacks",
    readTime: "60 sec",
    icon: Brain,
    headline: "How eating food in the right order prevents the 2 PM post-lunch energy slump",
    storySlides: [
      "Have you ever eaten party Jollof rice and felt completely exhausted and sleepy 45 minutes later? That is known as 'postprandial reactive hypoglycemia' (the sugar crash).",
      "When refined carbs hit an empty stomach first, they rush into the bloodstream within 15 minutes, triggering a massive insulin flood that crashes your energy.",
      "The Food Sequencing Solution: Always eat your PROTEIN and FIBER FIRST (e.g. pepper soup, grilled chicken, or fresh salad) 5–10 minutes before the rice.",
      "Fiber and protein coat your intestinal walls and slow down gastric emptying, transforming a sharp spike into a gentle, sustained energy hill! 🚀",
    ],
    takeaway: "Never eat Jollof rice on an empty stomach. Eat your meat, fish, and greens first to buffer the sugar surge.",
    quiz: {
      question: "Which component of your meal should you eat FIRST to prevent a glucose spike?",
      options: ["The sweet dessert", "The Jollof rice / swallow", "Fiber vegetables & protein"],
      correctIndex: 2,
      explanation: "Exactly! Fiber and protein slow gastric emptying, preventing sharp insulin surges and the 2 PM afternoon crash.",
    },
  },
  {
    id: "zobo-blood-pressure",
    title: "Zobo (Hibiscus) & Blood Pressure",
    category: "Heart & BP",
    readTime: "60 sec",
    icon: HeartPulse,
    headline: "Clinical evidence behind unsweetened Hibiscus Sabdariffa tea",
    storySlides: [
      "Zobo (Hibiscus sabdariffa) is more than a delicious party drink—it is a clinically validated cardiovascular powerhouse.",
      "Hibiscus calyces are rich in Anthocyanins and Polyphenols that act as natural ACE (Angiotensin-Converting Enzyme) inhibitors, gently dilating blood vessels.",
      "In a landmark randomized clinical trial published in the Journal of Nutrition, drinking 2 cups of unsweetened hibiscus tea daily lowered systolic blood pressure by an average of 7.2 mmHg within 6 weeks.",
      "The critical rule: Brew your Zobo with ginger, cloves (kanafuru), and citrus—avoid refined sugar to preserve its therapeutic heart benefits! 🌺",
    ],
    takeaway: "Unsweetened Zobo with ginger and cloves is a natural, evidence-backed beverage that supports arterial relaxation and healthy blood pressure.",
    quiz: {
      question: "How should Zobo be brewed to maximize its blood pressure benefits?",
      options: [
        "With 4 scoops of white sugar",
        "Unsweetened with natural ginger and cloves",
        "Boiled for 4 hours until syrupy",
      ],
      correctIndex: 1,
      explanation: "Correct! Keeping Zobo sugar-free ensures its anthocyanins protect your blood vessels without raising insulin or triglycerides.",
    },
  },
  {
    id: "okra-mucilage-trap",
    title: "Okra (Ila) & The Glucose Trap",
    category: "Gut & Fiber",
    readTime: "60 sec",
    icon: Leaf,
    headline: "How water-soluble mucilage fiber forms a gel matrix that traps dietary sugars",
    storySlides: [
      "The characteristic 'draw' or viscous texture in Okra (Ila / Okro) soup is caused by a unique polysaccharide mucilage composed of rhamnose, galactose, and galacturonic acid.",
      "Inside your digestive tract, this mucilage absorbs water and forms a thick, gelatinous protective mesh over the microvilli of your small intestine.",
      "This gel matrix physically slows the rate at which carbohydrates and cholesterol are absorbed into your bloodstream.",
      "Clinical studies demonstrate that adding fresh sliced okra to a high-carb meal reduces peak post-meal glucose by up to 28%! 🍲",
    ],
    takeaway: "Okra's natural mucilage forms a gel in your gut that physically traps and slows sugar absorption, acting as an edible spike shield.",
    quiz: {
      question: "How does Okra mucilage lower post-meal blood sugar?",
      options: [
        "By forming a gel matrix in the gut that slows carb absorption",
        "By burning calories in the stomach",
        "By destroying digestive acid",
      ],
      correctIndex: 0,
      explanation: "Exactly! The soluble gel creates a physical barrier that slows glucose entry into your blood.",
    },
  },
  {
    id: "sodium-potassium-balance",
    title: "Seasoning Cubes & Potassium Buffering",
    category: "Heart & BP",
    readTime: "60 sec",
    icon: HeartPulse,
    headline: "How to counter high-sodium stock cubes with potassium-rich African sides",
    storySlides: [
      "Most commercial seasoning cubes contain 50% to 60% sodium chloride and MSG. Ingesting high sodium pulls water into your bloodstream, increasing blood pressure against artery walls.",
      "However, blood pressure is regulated by the SODIUM-TO-POTASSIUM RATIO. Potassium tells your kidneys to flush excess sodium out through urine.",
      "If you eat a savory soup seasoned with stock cubes, balance it by incorporating potassium-rich foods: boiled plantains, spinach, avocado, or pumpkin leaves (Ugwu).",
      "Aim for 2 parts Potassium for every 1 part Sodium to keep blood pressure in the optimal green zone! ⚖️",
    ],
    takeaway: "Whenever you cook with savory seasoning cubes, pair with potassium-rich greens and plantains to help your kidneys excrete excess sodium.",
    quiz: {
      question: "What critical mineral helps your kidneys flush out excess sodium from seasoning cubes?",
      options: ["Potassium", "Iron", "Zinc"],
      correctIndex: 0,
      explanation: "Spot on! Potassium balances sodium levels and relaxes arterial walls for healthy blood pressure.",
    },
  },
];

// SWALLOW GLYCEMIC SIMULATOR DATA
const SWALLOW_SIMULATOR_DATA = [
  {
    id: "pounded-yam",
    name: "Pounded Yam (Iyan)",
    glycemicIndex: 85,
    peakSpike: "172 mg/dL",
    velocityTime: "22 mins",
    spikeRisk: "High Spike Risk ⚠️",
    color: "from-rose-500 to-red-600",
    bgColor: "bg-rose-50 border-rose-200 text-rose-800",
    barWidth: "90%",
    insight: "Rapid starch hydrolysis. Causes a sharp 55 mg/dL glucose surge within 25 minutes unless paired with heavy fiber."
  },
  {
    id: "white-garri",
    name: "White Garri (Eba)",
    glycemicIndex: 78,
    peakSpike: "158 mg/dL",
    velocityTime: "28 mins",
    spikeRisk: "Moderate-High Spike ⚠️",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50 border-amber-200 text-amber-800",
    barWidth: "78%",
    insight: "Processed cassava with moderate gelatinization. Spikes faster when prepared with boiling water and eaten without vegetable soups."
  },
  {
    id: "plantain-flour",
    name: "Unripe Plantain Flour",
    glycemicIndex: 52,
    peakSpike: "132 mg/dL",
    velocityTime: "55 mins",
    spikeRisk: "Gentle Plateau ✅",
    color: "from-teal-500 to-emerald-600",
    bgColor: "bg-teal-50 border-teal-200 text-teal-800",
    barWidth: "50%",
    insight: "Rich in Type-2 Resistant Starch. Ferments in the colon, releasing butyrate and flattening post-meal glucose."
  },
  {
    id: "oat-swallow",
    name: "Oat Flour Swallow + Okra",
    glycemicIndex: 42,
    peakSpike: "118 mg/dL",
    velocityTime: "75 mins",
    spikeRisk: "Low Spike Shield 🛡️",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50 border-emerald-200 text-emerald-800",
    barWidth: "35%",
    insight: "Beta-glucan soluble fibers create a protective gel matrix, slowing gastric emptying and reducing peak spike by ~38%."
  }
];

export default function AvoAcademy() {
  const { profile } = useUser();
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const lessonsSectionRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const cond = (profile?.medicalCondition || "").toLowerCase();
    if (cond.includes("pregnan") || cond.includes("gestat")) return "Pregnancy Health";
    if (cond.includes("prostat") || cond.includes("bph")) return "Prostate Health";
    if (cond.includes("arthrit") || cond.includes("joint") || cond.includes("gout")) return "Arthritis & Joints";
    return "Glucose Science";
  });
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [selectedSwallowIdx, setSelectedSwallowIdx] = useState(0);

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("completed_academy_lessons");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [userXp, setUserXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("metabolic_xp");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Real-time Circadian Glucose Clock Detection
  const currentHour = new Date().getHours();
  const circadianWindow = useMemo(() => {
    if (currentHour >= 5 && currentHour < 10) {
      return {
        label: "Dawn Phenomenon Window (5 AM - 10 AM)",
        status: "Cortisol is waking the liver. Drink lemon water or Moringa before carbs to block liver gluconeogenesis.",
        badge: "🌅 Morning Phase",
        color: "text-amber-700 bg-amber-50 border-amber-200"
      };
    } else if (currentHour >= 10 && currentHour < 16) {
      return {
        label: "Peak Insulin Sensitivity Window (10 AM - 4 PM)",
        status: "Your cells are primed to process complex swallows and grains efficiently. Optimal window for heavier meals.",
        badge: "☀️ Midday Prime",
        color: "text-teal-800 bg-teal-50 border-teal-200"
      };
    } else if (currentHour >= 16 && currentHour < 21) {
      return {
        label: "Post-Dusk Glucose Deceleration (4 PM - 9 PM)",
        status: "Melatonin levels begin rising, reducing insulin secretion. Pair evening dinners with Okra, greens, and lean fish.",
        badge: "🌆 Evening Decel",
        color: "text-indigo-800 bg-indigo-50 border-indigo-200"
      };
    } else {
      return {
        label: "Nocturnal Fasting Repair (9 PM - 5 AM)",
        status: "Cellular autophagy and glycogen replenishment. Maintain a clear 12-hour overnight fasting window for insulin receptor reset.",
        badge: "🌙 Fasting Mode",
        color: "text-purple-800 bg-purple-50 border-purple-200"
      };
    }
  }, [currentHour]);

  // Daily Dynamic Lesson Calculator (Rotates automatically every 24 hours)
  const todayLessonIndex = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dayOfYear % ACADEMY_LESSONS.length;
  }, []);

  const todayLesson = ACADEMY_LESSONS[todayLessonIndex];
  const isTodayLessonDone = completedIds.includes(todayLesson.id);

  // Filter lessons
  
  // Auto-scrolling Specialty Marquee loop (Smooth & Interactive)
  useEffect(() => {
    const el = scrollBarRef.current;
    if (!el) return;

    let scrollAmount = el.scrollLeft;
    let scrollDirection = 1;

    const interval = setInterval(() => {
      if (isPaused) return;
      if (!el) return;

      scrollAmount += scrollDirection * 0.8;
      if (scrollAmount >= el.scrollWidth - el.clientWidth - 5) {
        scrollDirection = -1;
      } else if (scrollAmount <= 5) {
        scrollDirection = 1;
      }
      el.scrollLeft = scrollAmount;
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredLessons = useMemo(() => {
    if (selectedCategory === "All") return ACADEMY_LESSONS;
    return ACADEMY_LESSONS.filter((l) => l.category === selectedCategory);
  }, [selectedCategory]);

  const openLesson = (lesson: AcademyLesson) => {
    triggerHaptic("light");
    setActiveLesson(lesson);
    setCurrentSlideIndex(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  };

  const handleNextSlide = () => {
    if (!activeLesson) return;
    triggerHaptic("light");
    if (currentSlideIndex < activeLesson.storySlides.length) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handleSelectOption = (index: number) => {
    if (quizSubmitted) return;
    triggerHaptic("light");
    setSelectedAnswer(index);
  };

  const handleSubmitQuiz = () => {
    if (selectedAnswer === null || !activeLesson) return;
    setQuizSubmitted(true);

    const isCorrect = selectedAnswer === activeLesson.quiz.correctIndex;
    if (isCorrect) {
      triggerHaptic("success");
      triggerConfetti("burst");
      toast.success("Mastery Complete! +25 Metabolic XP 🧠✨");

      if (!completedIds.includes(activeLesson.id)) {
        const nextCompleted = [...completedIds, activeLesson.id];
        setCompletedIds(nextCompleted);
        localStorage.setItem("completed_academy_lessons", JSON.stringify(nextCompleted));

        const nextXp = userXp + 25;
        setUserXp(nextXp);
        localStorage.setItem("metabolic_xp", nextXp.toString());
      }
    } else {
      triggerHaptic("warning");
      toast.error("Not quite! Read the clinical explanation below.");
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Banner with Live XP */}
      <div className="bg-gradient-to-br from-[#126778] via-[#1f7a8c] to-[#38b2ac] rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>Metabolic Culinary Academy • 2026 Edition</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              Glucose Science &amp; Food Chemistry 🧬
            </h2>
            <p className="text-xs text-teal-50/90 mt-1 max-w-sm leading-relaxed">
              Evidence-based nutritional science translated into practical, delicious African food hacks.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20 text-center shrink-0">
            <div className="flex items-center gap-1 text-amber-300 font-black text-sm justify-center">
              <Trophy size={14} />
              <span>{userXp} XP</span>
            </div>
            <span className="text-[9px] text-teal-100 uppercase font-extrabold tracking-wider block mt-0.5">
              Knowledge Score
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-teal-100">
          <span className="text-[11px] font-semibold">
            Curriculum: {completedIds.length} / {ACADEMY_LESSONS.length} Completed
          </span>
          <div className="w-28 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-300 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((completedIds.length / ACADEMY_LESSONS.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      
      {/* 🌟 10X TOP SELF-SCROLLING SPECIALTY MARQUEE BAR */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500 animate-bounce" />
            <span>Specialized Clinical Programs:</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold">
            Tap to open masterclass ➔
          </span>
        </div>

        <div
          ref={scrollBarRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1 px-0.5 select-none"
        >
          {[
            { id: "Pregnancy Health", label: "🤰 Eating for Pregnancy", bg: "from-pink-500 to-rose-600" },
            { id: "Prostate Health", label: "🩺 Eating for Prostate Health", bg: "from-blue-600 to-indigo-700" },
            { id: "Arthritis & Joints", label: "🦴 Eating for Arthritis & Joints", bg: "from-amber-500 to-orange-600" },
            { id: "Glucose Science", label: "🩸 Glucose Science & Insulin", bg: "from-teal-600 to-emerald-600" },
            { id: "Heart & BP", label: "❤️ Blood Pressure & Heart", bg: "from-red-500 to-rose-600" },
            { id: "Gut & Fiber", label: "🥗 Gut Microbiome & Fiber", bg: "from-emerald-600 to-teal-700" },
            { id: "Cooking Hacks", label: "👨‍🍳 Cultural Cooking Hacks", bg: "from-purple-600 to-indigo-600" },
            { id: "All", label: "🌟 All Masterclasses", bg: "from-slate-700 to-slate-900" },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic("medium");
                  setSelectedCategory(cat.id);
                  lessonsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }}
                className={`px-4 py-2 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 ${
                  isSelected
                    ? `bg-gradient-to-r ${cat.bg} text-white ring-2 ring-teal-400 ring-offset-2 scale-105 shadow-md`
                    : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 hover:border-teal-400 hover:bg-slate-50"
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && <CheckCircle2 size={13} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMIC REAL-TIME CIRCADIAN GLUCOSE BIO-CLOCK */}
      <div className={`p-4 rounded-3xl border shadow-xs transition-all ${circadianWindow.color}`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 font-black text-xs">
            <Clock size={14} />
            <span>{circadianWindow.label}</span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 border shadow-2xs">
            {circadianWindow.badge}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed font-medium">
          {circadianWindow.status}
        </p>
      </div>

      {/* 3. INTERACTIVE AFRICAN SWALLOW GLYCEMIC SIMULATOR (Live in Glucose Science) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-teal-100/90 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-[#126778]">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Live Swallow Glycemic Simulator 🥣
              </h3>
              <p className="text-[10px] text-slate-500">
                Compare post-meal glucose spikes across traditional and modern swallows
              </p>
            </div>
          </div>
          <span className="text-[9px] font-black uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
            2026 Data
          </span>
        </div>

        {/* Swallow Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {SWALLOW_SIMULATOR_DATA.map((swallow, idx) => (
            <button
              key={swallow.id}
              onClick={() => {
                triggerHaptic("light");
                setSelectedSwallowIdx(idx);
              }}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedSwallowIdx === idx
                  ? "bg-[#126778] text-white border-[#126778] shadow-xs"
                  : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              <span className="text-[11px] font-bold block truncate">{swallow.name}</span>
              <span className={`text-[9px] font-black block mt-0.5 ${selectedSwallowIdx === idx ? "text-teal-200" : "text-slate-500"}`}>
                GI: {swallow.glycemicIndex}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Swallow Live Visualization Card */}
        {(() => {
          const s = SWALLOW_SIMULATOR_DATA[selectedSwallowIdx];
          return (
            <div className={`p-3.5 rounded-2xl border ${s.bgColor} space-y-2`}>
              <div className="flex items-center justify-between text-xs font-black">
                <span>Peak Glucose: {s.peakSpike}</span>
                <span>Time to Peak: {s.velocityTime}</span>
              </div>

              {/* Dynamic Progress Bar */}
              <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${s.color} transition-all duration-500 rounded-full`}
                  style={{ width: s.barWidth }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>{s.spikeRisk}</span>
                <span className="text-slate-600">Glycemic Load Rating</span>
              </div>

              <p className="text-[11px] text-slate-700 leading-snug pt-1 border-t border-slate-200/60 font-medium">
                💡 <strong>Clinical Takeaway:</strong> {s.insight}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Lessons Anchor Reference */}
      <div ref={lessonsSectionRef} />

      {/* 5. Dynamic Lesson Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredLessons.map((lesson) => {
          const Icon = lesson.icon;
          const isDone = completedIds.includes(lesson.id);
          const isCurrentToday = lesson.id === todayLesson.id;

          return (
            <div
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                isDone
                  ? "bg-teal-50/50 border-teal-200"
                  : isCurrentToday
                  ? "bg-white border-amber-300 ring-2 ring-amber-300/40"
                  : "bg-white border-slate-200/80 hover:border-teal-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#126778] bg-teal-50 px-2 py-0.5 rounded-lg">
                      {lesson.category}
                    </span>
                    {isCurrentToday && (
                      <span className="text-[9.5px] uppercase font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                        Today's Pick
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock size={11} />
                    <span>{lesson.readTime}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3 my-1">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 ${
                      isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-teal-50 text-[#126778]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#126778] transition-colors leading-tight">
                      {lesson.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2 font-medium">
                      {lesson.headline}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                {isDone ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Mastered (+25 XP)</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#126778] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read 60s Lesson</span>
                    <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. INTERACTIVE STORY & QUIZ READER MODAL */}
      {activeLesson && (
        <Dialog open={!!activeLesson} onOpenChange={() => setActiveLesson(null)}>
          <DialogContent className="max-w-md p-6 rounded-3xl max-h-[92vh] overflow-y-auto border-teal-500/30">
            <DialogHeader className="sr-only">
              <DialogTitle>{activeLesson.title}</DialogTitle>
              <DialogDescription>{activeLesson.headline}</DialogDescription>
            </DialogHeader>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-[#126778]">
                  <activeLesson.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-teal-700">
                    {activeLesson.category} • 60s Masterclass
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {activeLesson.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* SLIDES PHASE */}
            {currentSlideIndex < activeLesson.storySlides.length ? (
              <div className="space-y-4">
                {/* Story Slide Content Card */}
                <div className="bg-gradient-to-br from-teal-50/60 to-emerald-50/40 p-5 rounded-2xl border border-teal-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                      Slide {currentSlideIndex + 1} of {activeLesson.storySlides.length}
                    </span>
                    <Mascot gesture="wave" size={32} />
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {activeLesson.storySlides[currentSlideIndex]}
                  </p>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {activeLesson.storySlides.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentSlideIndex
                          ? "w-6 bg-[#126778]"
                          : i < currentSlideIndex
                          ? "w-2 bg-teal-400"
                          : "w-2 bg-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  onClick={handleNextSlide}
                  className="w-full bg-gradient-to-r from-[#126778] to-[#2a9d8f] text-white h-12 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>
                    {currentSlideIndex === activeLesson.storySlides.length - 1
                      ? "Take 1-Question Mastery Quiz 🎯"
                      : "Next Slide"}
                  </span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            ) : (
              /* QUIZ PHASE */
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-800 mb-1">
                    <Sparkles size={14} />
                    <span>Quick Science Mastery Quiz (+25 XP)</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeLesson.quiz.question}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {activeLesson.quiz.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === activeLesson.quiz.correctIndex;

                    let btnClass = "border-slate-200 bg-white";
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "border-rose-500 bg-rose-50 text-rose-900";
                      }
                    } else if (isSelected) {
                      btnClass = "border-[#126778] bg-teal-50/80 text-[#126778] font-bold";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={quizSubmitted}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && isCorrect && (
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <XCircle size={16} className="text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 🥑 AVO-AZA CLAPPING CELEBRATION & EXPLANATION */}
                {quizSubmitted && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    {selectedAnswer === activeLesson.quiz.correctIndex ? (
                      <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-3xl border-2 border-emerald-400 shadow-lg text-center">
                        <Mascot gesture="clapping" size={130} className="drop-shadow-xl my-1" />
                        <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-md mt-1">
                          <Sparkles size={15} className="text-amber-300 animate-spin" />
                          <span>AVO-AZA Claps: 100% Correct! (+25 XP) 👏🎉</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-amber-50 to-rose-50 rounded-3xl border border-amber-300 text-center">
                        <Mascot gesture="writing" size={100} className="my-1" />
                        <span className="text-xs font-black text-amber-900">
                          Avo's Clinical Review Note 📝
                        </span>
                      </div>
                    )}

                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                      <p className="font-bold text-slate-800 leading-relaxed">
                        {activeLesson.quiz.explanation}
                      </p>
                      <div className="p-2.5 bg-teal-50 rounded-xl text-teal-800 font-medium leading-snug">
                        💡 <strong>Clinical Takeaway:</strong> {activeLesson.takeaway}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {!quizSubmitted ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswer === null}
                    className="w-full bg-gradient-to-r from-[#126778] to-[#2a9d8f] text-white h-12 rounded-2xl font-black text-sm shadow-md cursor-pointer disabled:opacity-60"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveLesson(null)}
                    className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-2xl font-black text-sm cursor-pointer"
                  >
                    Close &amp; Collect XP
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
