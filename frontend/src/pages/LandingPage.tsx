import React from 'react';
import { motion } from 'framer-motion';
import { JuiceGlassIllustration, OrangeSliceIcon } from '../components/JuiceMascot';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 max-w-md mx-auto text-center space-y-5">
      {/* Top Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-lightOrange/80 border border-brand-orange/30 text-xs font-bold text-brand-deep shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-spin-slow" />
        <span>Campus Juice Carnival Discount</span>
      </motion.div>

      {/* Hero Juice Graphic */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative my-2"
      >
        <div className="absolute inset-0 bg-brand-orange/20 filter blur-2xl rounded-full transform scale-125" />
        <JuiceGlassIllustration className="w-28 h-32 relative z-10 drop-shadow-xl animate-bounce-subtle" />
        <div className="absolute -bottom-2 -right-2 z-20">
          <OrangeSliceIcon className="w-9 h-9 drop-shadow-md" />
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-1.5"
      >
        <h2 className="text-3xl md:text-4xl font-black text-brand-dark tracking-tight leading-tight">
          A Little Scratch.
          <br />
          <span className="bg-gradient-to-r from-brand-orange to-brand-deep bg-clip-text text-transparent">
            A Juicy Surprise!
          </span>
        </h2>
        <p className="text-xs font-medium text-brand-dark/75 max-w-xs mx-auto">
          Unlock your surprise discount at Orange Pulp Juice Point.
        </p>
      </motion.div>

      {/* 3-Point Feature Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-brand-orange/25 shadow-sm text-left space-y-2.5"
      >
        <div className="text-xs font-extrabold uppercase tracking-wider text-brand-deep flex items-center gap-1.5">
          <OrangeSliceIcon className="w-3.5 h-3.5" />
          <span>How The Game Works</span>
        </div>

        <ul className="text-xs text-brand-dark/80 space-y-2 font-medium">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Pick Mystery Boxes:</strong> Choose boxes to reveal 5% to 10% OFF.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Utilize or Keep Playing:</strong> After scratching, choose to <strong>use your coupon immediately</strong> or <strong>move to the next chance</strong>!
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
            <span>
              <strong>Up to 3 Chances:</strong> Maximize your juice stall discount.
            </span>
          </li>
        </ul>
      </motion.div>

      {/* Start Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-orange via-brand-deep to-brand-deep text-white font-extrabold text-base tracking-wide shadow-brand flex items-center justify-center gap-2 group transition-all"
      >
        <span>Start Playing</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>

      <p className="text-[11px] font-semibold text-brand-dark/50">
        ✨ 3 Chances • 9 Mystery Boxes • Scratch & Win!
      </p>
    </div>
  );
};
