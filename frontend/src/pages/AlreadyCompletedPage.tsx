import React from 'react';
import { motion } from 'framer-motion';
import { PreviousRewardsList } from '../components/PreviousRewardsList';
import { OrangeSliceIcon, JuiceGlassIllustration } from '../components/JuiceMascot';
import { ShieldAlert, Ticket } from 'lucide-react';
import type { IReward } from '../types';

interface AlreadyCompletedPageProps {
  finalDiscount: number | null;
  finalRewardCode: string | null;
  rewards: IReward[];
  rollNumber: string;
}

export const AlreadyCompletedPage: React.FC<AlreadyCompletedPageProps> = ({
  finalDiscount,
  finalRewardCode,
  rewards,
  rollNumber,
}) => {
  return (
    <div className="flex flex-col items-center py-4 px-4 max-w-md mx-auto w-full space-y-5">
      {/* Notice Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-xs font-black text-amber-900 shadow-sm"
      >
        <ShieldAlert className="w-4 h-4 text-amber-700" />
        <span>PARTICIPATION ALREADY COMPLETED</span>
      </motion.div>

      {/* Reward Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-white rounded-3xl p-6 border-2 border-brand-orange/40 shadow-brand text-center space-y-4"
      >
        <div className="flex justify-center">
          <JuiceGlassIllustration className="w-16 h-16 drop-shadow-sm" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-brand-dark tracking-tight">
            Game Completed!
          </h2>
          <p className="text-xs text-brand-dark/70">
            You have already used all 3 chances for this campaign.
          </p>
        </div>

        {finalDiscount !== null && (
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-brand-orange/30 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-deep">
              Your Saved Final Discount
            </span>
            <div className="text-5xl font-black text-brand-deep">
              {finalDiscount}% OFF
            </div>
            {finalRewardCode && (
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Ticket className="w-4 h-4 text-brand-orange" />
                <span className="font-mono text-xs font-black text-brand-dark tracking-widest">
                  {finalRewardCode}
                </span>
              </div>
            )}
            <div className="text-[11px] text-gray-500 font-mono">
              Roll: <strong>{rollNumber}</strong>
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
          Your final discount is already permanently saved. Thank you for playing at Orange Pulp Juice Point. Enjoy your juice!
        </div>
      </motion.div>

      {/* Rewards History */}
      <PreviousRewardsList rewards={rewards} isFinalResult={true} />

      <div className="text-[11px] text-brand-dark/50 text-center flex items-center justify-center gap-1">
        <OrangeSliceIcon className="w-3.5 h-3.5 opacity-50" />
        <span>Orange Pulp Juice Point • Verified Student Record</span>
      </div>
    </div>
  );
};
