import { Link } from "react-router";
import { Utensils, TrendingUp, Heart, Leaf } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

function Wordmark() {
  return (
    <div className="flex items-center gap-2.5 justify-center">
      <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] flex items-center justify-center flex-shrink-0">
        <Leaf className="h-5 w-5 text-[#0F766E]" />
      </div>
      <span
        className="font-bold text-2xl text-[#0F766E] tracking-tight"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        MealOptimiza
      </span>
    </div>
  );
}

const FEATURES = [
  { icon: Utensils, labelKey: "landing.f1.label", descKey: "landing.f1.desc", bg: "bg-[#CCFBF1]", iconColor: "text-[#0F766E]" },
  { icon: TrendingUp, labelKey: "landing.f2.label", descKey: "landing.f2.desc", bg: "bg-[#E0F2FE]", iconColor: "text-[#0369A1]" },
  { icon: Heart, labelKey: "landing.f3.label", descKey: "landing.f3.desc", bg: "bg-[#FCE7F3]", iconColor: "text-[#BE185D]" },
];

const ease = [0, 0, 0.2, 1] as const;

export default function Landing() {
  const reduced = useReducedMotion();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-10 text-center">

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          <Wordmark />
        </motion.div>

        <motion.p
          className="mt-4 text-[#475569] text-base max-w-xs leading-relaxed"
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease }}
        >
          {t('landing.subtitle')}
        </motion.p>

        {/* Feature cards */}
        <div className="mt-12 w-full max-w-sm space-y-3">
          {FEATURES.map(({ icon: Icon, labelKey, descKey, bg, iconColor }, i) => (
            <motion.div
              key={labelKey}
              initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05, ease }}
              whileHover={reduced ? undefined : { y: -2, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)" }}
              className="bg-[#ffffff] border border-[#E2E8F0] rounded-2xl shadow-sm p-4 flex items-start gap-4 text-left"
              style={{ willChange: "transform" }}
            >
              <div className={`${bg} rounded-xl p-2.5 flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p
                  className="font-semibold text-[#0F172A] text-base"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {t(labelKey)}
                </p>
                <p className="text-sm text-[#475569] mt-0.5 leading-relaxed">{t(descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-10 w-full max-w-sm space-y-3"
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25, ease }}
        >
          <Link
            to="/signup"
            className="block w-full bg-[#0F766E] hover:bg-[#115E59] text-white rounded-xl py-3.5 text-center font-semibold transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:-translate-y-px active:scale-[0.97] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {t('landing.getStarted')}
          </Link>
          <Link
            to="/login"
            className="block w-full bg-[#ffffff] text-[#0F766E] border border-[#0F766E] rounded-xl py-3.5 text-center font-semibold hover:bg-[#F0FDFA] transition-all duration-200 ease-out active:scale-[0.97] motion-reduce:active:scale-100"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {t('auth.login')}
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center text-xs text-[#94A3B8]">
        {t('landing.rights')}
      </div>
    </div>
  );
}
