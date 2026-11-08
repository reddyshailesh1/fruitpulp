import React from 'react';
import { motion } from 'framer-motion';
import { ProgressPills } from '../components/ProgressPills';
import { PreviousRewardsList } from '../components/PreviousRewardsList';
import { OrangeSliceIcon, JuiceGlassIllustration } from '../components/JuiceMascot';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import type { IReward } from '../types';

interface ProgressPageProps {
  latestReward: IReward;
  rewards: IReward[];
  chancesUsed: number;
  onNextChance: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  latestReward,
  rewards,
  chancesUsed,
  onNextChance,
}) => {
  const remaining = 3 - chancesUsed;
  const isFinalChanceUpcoming = remaining === 1;

  return (
    <div className="flex flex-col items-center py-4 px-4 max-w-md mx-auto w-full space-y-5">
      {/* Progress Pills */}
      <ProgressPills chancesUsed={chancesUsed} totalChances={3} />

      {/* Latest Scratch Banner */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-br from-white via-orange-50/50 to-amber-50 rounded-3xl p-5 border-2 border-brand-orange/30 shadow-md text-center space-y-3 relative overflow-hidden"
      >
        <div className="flex justify-center">
          <JuiceGlassIllustration className="w-16 h-16 drop-shadow-sm" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-brand-orange">
            Just Revealed (Chance {chancesUsed} of 3)
          </span>
          <div className="text-4xl font-black text-brand-deep tracking-tight">
            {latestReward.discount}% OFF
          </div>
          <p className="text-xs text-brand-dark/70 font-medium">
            Box #{latestReward.boxNumber} • Code: <span className="font-mono font-bold">{latestReward.rewardCode}</span>
          </p>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs text-left">
          <AlertTriangle className="w-4 h-4 text-brand-deep shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">
            <strong>Important:</strong> This {latestReward.discount}% discount does not apply yet! Only your <strong>3rd and final scratch</strong> will be your final applicable stall discount.
          </p>
        </div>
      </motion.div>

      {/* Previous Rewards List */}
      <PreviousRewardsList rewards={rewards} isFinalResult={false} />

      {/* Continue CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNextChance}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-deep text-white font-extrabold text-sm tracking-wide shadow-brand flex items-center justify-center gap-2 transition-all"
      >
        <span>
          {isFinalChanceUpcoming ? 'Proceed to FINAL 3rd Scratch!' : 'Proceed to Chance 2'}
        </span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>

      <p className="text-[11px] text-brand-dark/50 text-center flex items-center justify-center gap-1">
        <OrangeSliceIcon className="w-3.5 h-3.5 opacity-60" />
        <span>{remaining} mystery {remaining === 1 ? 'box' : 'boxes'} remaining to pick</span>
      </p>
    </div>
  );
};
