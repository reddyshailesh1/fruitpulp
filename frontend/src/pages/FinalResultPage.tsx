import React from 'react';
import { motion } from 'framer-motion';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { PreviousRewardsList } from '../components/PreviousRewardsList';
import { OrangeSliceIcon, JuiceGlassIllustration } from '../components/JuiceMascot';
import { CheckCircle2, ShieldCheck, Ticket } from 'lucide-react';
import type { IReward } from '../types';

interface FinalResultPageProps {
  finalDiscount: number;
  finalRewardCode: string;
  rewards: IReward[];
  rollNumber: string;
}

export const FinalResultPage: React.FC<FinalResultPageProps> = ({
  finalDiscount,
  finalRewardCode,
  rewards,
  rollNumber,
}) => {
  return (
    <div className="flex flex-col items-center py-4 px-4 max-w-md mx-auto w-full space-y-5">
      {/* Celebration Confetti */}
      <ConfettiEffect trigger={true} />

      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-black text-emerald-800 shadow-sm"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>GAME COMPLETED • DISCOUNT UNLOCKED</span>
      </motion.div>

      {/* Commercial Stall Voucher Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-gradient-to-b from-white via-orange-50 to-amber-100/60 rounded-3xl p-6 border-2 border-brand-orange shadow-brand-lg text-center space-y-4 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-orange via-brand-deep to-brand-accent" />

        {/* Mascot */}
        <div className="flex justify-center relative pt-2">
          <JuiceGlassIllustration className="w-20 h-20 drop-shadow-md animate-bounce-subtle" />
          <div className="absolute -bottom-1 right-28">
            <OrangeSliceIcon className="w-7 h-7 drop-shadow-sm" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-brand-orange">
            🎉 Congratulations!
          </p>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand-dark/70">
            Your Final Applicable Discount
          </h2>
          <div className="text-6xl md:text-7xl font-black text-brand-deep tracking-tight drop-shadow-sm">
            {finalDiscount}% OFF
          </div>
        </div>

        {/* Verification Token Code Box for Cashier */}
        <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-brand-orange/60 shadow-inner space-y-1.5">
          <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-dark/60">
            <Ticket className="w-3.5 h-3.5 text-brand-deep" />
            <span>Stall Verification Code</span>
          </div>
          <div className="font-mono text-xl font-black tracking-widest text-brand-deep select-all">
            {finalRewardCode}
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500 pt-1 font-medium">
            <span>Roll: <strong className="text-brand-dark font-mono">{rollNumber}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          </div>
        </div>

        {/* Stall instructions */}
        <div className="p-3 rounded-2xl bg-brand-lightOrange/60 border border-brand-orange/30 text-[12px] text-brand-deep text-center font-medium leading-relaxed">
          👉 <strong>Show this screen at the Orange Pulp juice counter</strong> to claim your {finalDiscount}% OFF discount on any fresh fruit juice or shake!
        </div>

        <p className="text-[11px] text-brand-dark/60 italic">
          * Your 3rd scratch decided this final discount. Only the 3rd discount applies to your purchase.
        </p>
      </motion.div>

      {/* 3-Round Summary */}
      <PreviousRewardsList rewards={rewards} isFinalResult={true} />

      <div className="text-[11px] text-brand-dark/50 text-center space-y-1">
        <p>Thank you for participating at Orange Pulp Juice Point!</p>
        <p className="font-semibold text-brand-deep">Enjoy your refreshing fresh juice! 🍊</p>
      </div>
    </div>
  );
};
