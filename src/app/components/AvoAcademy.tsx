import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Award,
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
  icon: typeof Leaf;
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
];

export default function AvoAcademy() {
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
      try {
        localStorage.setItem("completed_academy_lessons", JSON.stringify(nextCompleted));
      } catch {
        /* ignore */
      }
    } else {
      triggerHaptic("medium");
      toast.info("Not quite! Read the explanation below to learn the science.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
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

          <div className="text-right">
            <span className="text-xs font-black text-amber-300 bg-black/30 px-3 py-1 rounded-full border border-amber-400/30">
              {completedIds.length} / {ACADEMY_LESSONS.length} Done
            </span>
          </div>
        </div>

        <p className="text-xs text-teal-100/90 leading-relaxed max-w-xl">
          Learn how authentic African foods, spices, and cooking techniques interact with your blood sugar, insulin, and blood pressure.
        </p>
      </div>

      {/* Lesson Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {ACADEMY_LESSONS.map((lesson) => {
          const Icon = lesson.icon;
          const isDone = completedIds.includes(lesson.id);

          return (
            <div
              key={lesson.id}
              onClick={() => openLesson(lesson)}
              className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                isDone
                  ? "bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/60"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#1f7a8c] dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg">
                    {lesson.category}
                  </span>

                  <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                    ⏱️ {lesson.readTime}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-2xl flex-shrink-0 ${
                      isDone
                        ? "bg-teal-100 text-[#1f7a8c] dark:bg-teal-900/60 dark:text-teal-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 group-hover:scale-105 transition-transform"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                      {lesson.title}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {lesson.headline}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                {isDone ? (
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Completed (+25 XP)
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles size={13} /> Earn +25 XP
                  </span>
                )}

                <span className="text-[11px] font-bold text-[#1f7a8c] dark:text-teal-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Start 60s Lesson <ChevronRight size={14} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive 60-Second Story Modal */}
      {activeLesson && (
        <Dialog open={Boolean(activeLesson)} onOpenChange={(open) => !open && setActiveLesson(null)}>
          <DialogContent className="max-w-md p-6 rounded-3xl max-h-[92vh] overflow-y-auto">
            {/* Story Progress Bar */}
            <div className="flex gap-1.5 mb-4">
              {Array.from({ length: activeLesson.storySlides.length + 1 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                    idx === currentSlideIndex
                      ? "bg-[#1f7a8c] dark:bg-teal-400"
                      : idx < currentSlideIndex
                      ? "bg-teal-300 dark:bg-teal-800"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              ))}
            </div>

            <DialogHeader className="text-left mb-3">
              <div className="flex items-center gap-2">
                <Mascot gesture="pointing" size={36} />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#1f7a8c] dark:text-teal-400 block">
                    {activeLesson.category} · 60-Second Bite
                  </span>
                  <DialogTitle className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    {activeLesson.title}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            {/* Story Slide Content */}
            {currentSlideIndex < activeLesson.storySlides.length ? (
              <div className="space-y-4 py-2 animate-in fade-in duration-200">
                <div className="p-5 bg-gradient-to-br from-teal-50/80 to-white dark:from-zinc-800/80 dark:to-zinc-900 rounded-3xl border border-teal-100 dark:border-zinc-700 min-h-[140px] flex items-center justify-center text-center">
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    "{activeLesson.storySlides[currentSlideIndex]}"
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  {currentSlideIndex > 0 ? (
                    <button
                      onClick={() => setCurrentSlideIndex(currentSlideIndex - 1)}
                      className="px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  <Button
                    onClick={handleNextSlide}
                    className="bg-[#1f7a8c] hover:bg-[#175d6b] text-white font-bold rounded-2xl px-5 py-2.5 text-xs shadow-md flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <span>
                      {currentSlideIndex === activeLesson.storySlides.length - 1
                        ? "Take Quick Quiz 🎯"
                        : "Next Slide"}
                    </span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            ) : (
              /* Mini-Quiz Screen */
              <div className="space-y-4 py-2 animate-in fade-in duration-200">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60">
                  <span className="text-[10px] uppercase font-black text-amber-700 dark:text-amber-400 block mb-1">
                    🎯 1-Question Master Quiz (+25 XP)
                  </span>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                    {activeLesson.quiz.question}
                  </h4>
                </div>

                <div className="space-y-2">
                  {activeLesson.quiz.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === activeLesson.quiz.correctIndex;

                    let btnClass = "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200";
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "bg-rose-100 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200";
                      }
                    } else if (isSelected) {
                      btnClass = "bg-teal-50 dark:bg-teal-950/60 border-[#1f7a8c] text-[#1f7a8c] dark:text-teal-300 font-bold";
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-3.5 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${btnClass}`}
                      >
                        <span>{option}</span>
                        {quizSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />}
                        {quizSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-600 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 animate-in fade-in duration-200">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 block mb-0.5">
                      💡 Scientific Takeaway:
                    </span>
                    {activeLesson.quiz.explanation}
                  </div>
                )}

                <div className="pt-2">
                  {!quizSubmitted ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={selectedAnswer === null}
                      className="w-full bg-gradient-to-r from-[#1f7a8c] to-[#4ecdc4] text-white font-extrabold rounded-2xl h-11 text-xs shadow-md cursor-pointer"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setActiveLesson(null)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl h-11 text-xs shadow-md cursor-pointer"
                    >
                      Complete Lesson & Return
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
