import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import Mascot from "./Mascot";
import { triggerConfetti, triggerHaptic } from "../utils/celebration";
import { toast } from "sonner";

export interface AcademyLesson {
  id: string;
  title: string;
  category: "Glucose Science" | "Heart & BP" | "Gut & Fiber" | "Cooking Hacks";
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
    id: "palm-oil-science",
    title: "Unbleached Red Palm Oil vs Bleached",
    category: "Heart & BP",
    readTime: "60 sec",
    icon: Flame,
    headline: "Why raw unbleached red palm oil protects arteries while bleached oil damages them",
    storySlides: [
      "Red palm oil in its raw, unrefined state is nature's richest source of Tocotrienols (a potent form of Vitamin E) and Beta-Carotene (giving it a vivid orange-red color).",
      "These fat-soluble antioxidants protect LDL cholesterol from oxidizing on your arterial walls, supporting cardiovascular elasticity.",
      "However, when palm oil is 'bleached' at high heat for commercial frying (turning clear/brown), the heat oxidizes the beneficial fats and destroys over 90% of the tocotrienols.",
      "The Golden Rule: Use raw, deep red palm oil in moderate cooking amounts (1–2 tbsp) and avoid smoking or burning the oil during stew prep! 🥘",
    ],
    takeaway: "Unbleached red palm oil is rich in arterial-protective tocotrienols. Never overheat or bleach palm oil until it turns clear.",
    quiz: {
      question: "What key antioxidant is destroyed when red palm oil is over-bleached at high heat?",
      options: ["Vitamin C", "Tocotrienols & Beta-Carotene", "Calcium"],
      correctIndex: 1,
      explanation: "Correct! Tocotrienols and carotenoids give red palm oil its healing properties and vibrant color—protect them by avoiding smoking the oil.",
    },
  },
  {
    id: "fermented-cassava",
    title: "Fermented Cassava & Gut Flora",
    category: "Gut & Fiber",
    readTime: "60 sec",
    icon: Leaf,
    headline: "Why traditional 3-day Garri / Fufu fermentation creates gut-friendly probiotics",
    storySlides: [
      "Traditional West African processing of cassava requires peeling, grating, and fermenting in sacks under heavy stones for 3 to 5 days before frying or pounding.",
      "This anaerobic fermentation encourages colonies of beneficial lactic acid bacteria (Lactobacillus and Leuconostoc) that eliminate toxic cyanogenic glucosides naturally.",
      "The fermentation process also generates organic lactic acid and short-chain fatty acids that nourish the intestinal epithelial barrier.",
      "Properly fermented traditional garri or fufu has a lower impact on gut inflammation than quick, unfermented industrial cassava flours! 🌿",
    ],
    takeaway: "Traditional 3-day lactic fermentation detoxifies cassava and produces gut-nourishing organic acids that support microbiome diversity.",
    quiz: {
      question: "What beneficial bacteria drive traditional cassava fermentation in West Africa?",
      options: ["Lactic acid bacteria (Lactobacillus)", "E. coli", "Salmonella"],
      correctIndex: 0,
      explanation: "Exactly! Lactic acid bacteria naturally detoxify cassava, boost digestibility, and strengthen your gut lining.",
    },
  },
  {
    id: "egusi-arginine",
    title: "Egusi Seeds & Nitric Oxide Flow",
    category: "Heart & BP",
    readTime: "60 sec",
    icon: HeartPulse,
    headline: "How melon seed L-Arginine supports vascular dilation and healthy blood pressure",
    storySlides: [
      "Egusi seeds (Citrullus lanatus) are prized for their rich, nutty texture in soups, but biochemically they are one of the most concentrated plant sources of L-Arginine.",
      "L-Arginine is the direct biological precursor to Nitric Oxide (NO)—a signaling molecule inside your blood vessels that signals endothelial smooth muscles to relax and dilate.",
      "Dilated blood vessels decrease systemic vascular resistance, naturally helping to lower high blood pressure and improve circulation.",
      "To maximize benefits, prepare Egusi soup with lots of leafy greens (Spinach, Bitterleaf, or Ugwu) and lean fish rather than excessive fatty meats! 🥣",
    ],
    takeaway: "Egusi seeds supply L-Arginine, which boosts Nitric Oxide to naturally relax arteries and support healthy blood pressure.",
    quiz: {
      question: "What critical blood-vessel relaxing molecule is produced from Egusi's L-Arginine?",
      options: ["Nitric Oxide (NO)", "Adrenaline", "Cortisol"],
      correctIndex: 0,
      explanation: "Spot on! Nitric Oxide dilates your arteries and allows blood to circulate freely with less strain on your heart.",
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
  {
    id: "ewedu-gastric-motility",
    title: "Ewedu (Jute Leaves) & Lipid Shield",
    category: "Cooking Hacks",
    readTime: "60 sec",
    icon: Brain,
    headline: "Why Yoruba cuisine pairs Amala with Ewedu soup first before stew",
    storySlides: [
      "Ewedu (Corchorus olitorius / Jute mallow) is one of the most culturally revered soups in Western Nigeria, traditionally prepared with a short broom (Ijabe) and potash.",
      "Ewedu contains high concentrations of polyphenols and soluble mucilage that coat the stomach lining and slow down lipase enzyme activity.",
      "By moderating lipase activity, Ewedu prevents the rapid spike of saturated fatty acids and glucose simultaneously when eating Amala or Stew.",
      "Tradition meets biochemistry: The ancestral practice of ladling Ewedu over Amala first provides an instant biochemical buffer! 🥣",
    ],
    takeaway: "Ewedu mucilage coats the stomach and moderates digestive lipase, preventing sharp surges in blood lipids and sugars.",
    quiz: {
      question: "What digestive enzyme activity does Ewedu mucilage help moderate?",
      options: ["Lipase (fat breakdown) and amylase", "Pepsin only", "Insulin"],
      correctIndex: 0,
      explanation: "Exactly! Ewedu buffers both fat and starch breakdown, ensuring a smooth, steady metabolic digestion.",
    },
  },
  {
    id: "circadian-meal-timing",
    title: "The 7 PM Fasting Window Hack",
    category: "Cooking Hacks",
    readTime: "60 sec",
    icon: Clock,
    headline: "Why your body processes the exact same bowl of Eba differently at 1 PM vs 9 PM",
    storySlides: [
      "Human insulin sensitivity follows a strict circadian rhythm governed by clock genes (BMAL1 and CLOCK). Insulin sensitivity peaks around midday and drops sharply after sunset.",
      "When you eat a large starch-heavy meal (like Eba or Pounded Yam) at 9:30 PM, your melatonin levels are rising. Melatonin suppresses insulin secretion from the pancreas.",
      "As a result, late-night carbohydrates remain in the bloodstream up to 3x longer, causing nighttime glucose elevation and fat storage.",
      "The 7 PM Rule: Shift your heaviest swallow meals to lunch (12 PM–2 PM) and choose light pepper soup or grilled fish with greens for late dinners! 🌙",
    ],
    takeaway: "Your body is much more insulin sensitive at lunch than at night. Eat heavier traditional carbs early, and keep late dinners light.",
    quiz: {
      question: "Why does eating heavy starch late at night cause higher blood sugar spikes?",
      options: [
        "Rising melatonin at night suppresses pancreatic insulin release",
        "The stomach stops digesting food after 6 PM",
        "Yam becomes sweeter at night",
      ],
      correctIndex: 0,
      explanation: "Correct! Melatonin naturally lowers insulin secretion at night, so late carbs stay in your blood much longer.",
    },
  },
  {
    id: "hydration-blood-viscosity",
    title: "Hydration & Artificial High BP",
    category: "Heart & BP",
    readTime: "60 sec",
    icon: Droplets,
    headline: "How mild dehydration thickens your blood and elevates blood pressure readings",
    storySlides: [
      "Your blood plasma is over 90% water. When you are mildly dehydrated, your blood plasma volume shrinks, making your blood thicker and more viscous.",
      "To pump thicker blood through narrow capillaries, your heart must pump harder, and your brain triggers the release of Vasopressin (antidiuretic hormone).",
      "Vasopressin constricts your blood vessels, which artificially spikes your systolic blood pressure reading by 5 to 10 mmHg!",
      "Drinking 2 full glasses of water upon waking up and tracking 8 glasses daily keeps blood viscosity low and pressure steady all day! 💧",
    ],
    takeaway: "Dehydration thickens blood and releases vasopressin, artificially raising blood pressure. Keep hydrated to maintain smooth blood flow.",
    quiz: {
      question: "What hormone is released during dehydration that constricts blood vessels and raises BP?",
      options: ["Vasopressin", "Thyroxine", "Insulin"],
      correctIndex: 0,
      explanation: "Spot on! Vasopressin constricts blood vessels to conserve water, which temporarily spikes your blood pressure.",
    },
  },
];

export default function AvoAcademy() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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

  // Calculate the Lesson of the Day based on calendar day (changes automatically every 24h)
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
      triggerHaptic("milestone");
      triggerConfetti("burst");
      toast.success("Correct! +25 Metabolic XP Earned 🏆");

      const nextCompleted = Array.from(new Set([...completedIds, activeLesson.id]));
      setCompletedIds(nextCompleted);
      const nextXp = userXp + 25;
      setUserXp(nextXp);

      try {
        localStorage.setItem("completed_academy_lessons", JSON.stringify(nextCompleted));
        localStorage.setItem("metabolic_xp", nextXp.toString());
      } catch {
        /* ignore */
      }
    } else {
      triggerHaptic("medium");
      toast.info("Not quite! Read the explanation below to learn the science.");
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Header Banner with XP Counter */}
      <div className="bg-gradient-to-r from-[#1f7a8c] via-teal-700 to-emerald-800 text-white rounded-3xl p-5 sm:p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block">
                Avo Academy 🥑
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                60-Second Food Science Masterclasses
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-400/30">
              <Trophy size={14} className="text-amber-400" />
              <span className="text-xs font-black text-amber-300 tabular-nums">
                {userXp} XP
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-teal-100/90 leading-relaxed max-w-xl">
          14 clinical, bite-sized lessons explaining how authentic African foods, spices, and cooking hacks interact with your blood sugar, insulin, and blood pressure.
        </p>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-teal-200 font-bold">
            Curriculum Progress: {completedIds.length} / {ACADEMY_LESSONS.length} Complete
          </span>
          <div className="w-24 bg-black/30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((completedIds.length / ACADEMY_LESSONS.length) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. ROTATING "TODAY'S DAILY MASTERCLASS" SPOTLIGHT */}
      <div className="relative bg-gradient-to-br from-amber-500/10 via-teal-500/10 to-emerald-500/10 dark:from-zinc-900 dark:to-zinc-800 border-2 border-amber-400/80 rounded-3xl p-5 shadow-md overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-xs flex items-center gap-1">
              <Sparkles size={12} className="animate-spin" />
              <span>Today&apos;s Daily Masterclass</span>
            </span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
              +25 Daily XP
            </span>
          </div>

          {isTodayLessonDone ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 size={13} />
              <span>Completed Today</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Clock size={11} />
              <span>Rotates at midnight</span>
            </span>
          )}
        </div>

        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 mt-1 mb-1">
          {todayLesson.title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-snug mb-3">
          {todayLesson.headline}
        </p>

        <Button
          onClick={() => openLesson(todayLesson)}
          className="w-full sm:w-auto bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] hover:from-[#176270] hover:to-[#227f74] text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap size={14} />
          <span>{isTodayLessonDone ? "Review Today's Lesson" : "Start 60-Second Lesson (+25 XP)"}</span>
        </Button>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {["All", "Glucose Science", "Heart & BP", "Gut & Fiber", "Cooking Hacks"].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              triggerHaptic("light");
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#1f7a8c] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Lesson Cards Grid */}
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
                  ? "bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/60"
                  : isCurrentToday
                  ? "bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-700 ring-1 ring-amber-300/60"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#1f7a8c] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg">
                      {lesson.category}
                    </span>
                    {isCurrentToday && (
                      <span className="text-[9.5px] uppercase font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                        Today
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                    <Clock size={11} />
                    <span>{lesson.readTime}</span>
                  </span>
                </div>

                <div className="flex items-start gap-3 my-1">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 ${
                      isDone
                        ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                        : "bg-teal-50 dark:bg-teal-950/50 text-[#1f7a8c] dark:text-teal-400"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 group-hover:text-[#1f7a8c] transition-colors leading-tight">
                      {lesson.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-snug line-clamp-2">
                      {lesson.headline}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                {isDone ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Completed (+25 XP)</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#1f7a8c] dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Lesson</span>
                    <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. INTERACTIVE STORY & QUIZ READER MODAL */}
      {activeLesson && (
        <Dialog open={!!activeLesson} onOpenChange={() => setActiveLesson(null)}>
          <DialogContent className="max-w-md p-6 rounded-3xl max-h-[92vh] overflow-y-auto border-teal-500/30">
            <DialogHeader className="sr-only">
              <DialogTitle>{activeLesson.title}</DialogTitle>
              <DialogDescription>{activeLesson.headline}</DialogDescription>
            </DialogHeader>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#1f7a8c] dark:text-teal-400">
                  <activeLesson.icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">
                    {activeLesson.category} • 60s Lesson
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 leading-tight">
                    {activeLesson.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* SLIDES PHASE */}
            {currentSlideIndex < activeLesson.storySlides.length ? (
              <div className="space-y-4">
                {/* Story Slide Content Card */}
                <div className="bg-gradient-to-br from-teal-50/50 to-emerald-50/30 dark:from-zinc-900 dark:to-zinc-800/80 p-5 rounded-2xl border border-teal-100 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">
                      Slide {currentSlideIndex + 1} of {activeLesson.storySlides.length}
                    </span>
                    <Mascot gesture="wave" size={32} />
                  </div>
                  <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
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
                          ? "w-6 bg-[#1f7a8c]"
                          : i < currentSlideIndex
                          ? "w-2 bg-teal-400"
                          : "w-2 bg-slate-200 dark:bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  onClick={handleNextSlide}
                  className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white h-12 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {currentSlideIndex === activeLesson.storySlides.length - 1
                      ? "Take Quick 1-Question Quiz 🎯"
                      : "Next Slide"}
                  </span>
                  <ChevronRight size={16} />
                </Button>
              </div>
            ) : (
              /* QUIZ PHASE */
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 mb-1">
                    <Sparkles size={14} />
                    <span>Quick Science Mastery Quiz (+25 XP)</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {activeLesson.quiz.question}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {activeLesson.quiz.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === activeLesson.quiz.correctIndex;

                    let btnClass = "border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800";
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-100 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-100";
                      }
                    } else if (isSelected) {
                      btnClass = "border-[#1f7a8c] bg-teal-50/70 text-[#1f7a8c] font-bold";
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

                {/* Explanation on submit */}
                {quizSubmitted && (
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs space-y-2">
                    <p className="font-bold text-slate-800 dark:text-zinc-200">
                      {activeLesson.quiz.explanation}
                    </p>
                    <div className="p-2.5 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-800 dark:text-teal-300 font-medium">
                      💡 <strong>Clinical Takeaway:</strong> {activeLesson.takeaway}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {!quizSubmitted ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswer === null}
                    className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#2a9d8f] text-white h-12 rounded-2xl font-black text-sm shadow-md cursor-pointer disabled:opacity-60"
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
