import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScratchCardCanvas } from '../components/ScratchCardCanvas';
import { ConfettiEffect } from '../components/ConfettiEffect';
import { ProgressPills } from '../components/ProgressPills';
import { OrangeSliceIcon } from '../components/JuiceMascot';
import { ArrowRight, Sparkles, CheckCircle2, Ticket, Loader2 } from 'lucide-react';
import type { IReward } from '../types';

interface ScratchCardPageProps {
  reward: IReward;
  chanceNumber: number;
  chancesUsed: number;
  isFinalChance: boolean;
  onMoveToNextChance: () => void;
  onUtilizeCurrentCoupon: () => Promise<void>;
}

export const ScratchCardPage: React.FC<ScratchCardPageProps> = ({
  reward,
  chanceNumber,
  chancesUsed,
  isFinalChance,
  onMoveToNextChance,
  onUtilizeCurrentCoupon,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const remainingChances = Math.max(0, 3 - chancesUsed);

  const handleRevealComplete = () => {
    setIsRevealed(true);
    setShowConfetti(true);
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onUtilizeCurrentCoupon();
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-4 px-4 max-w-md mx-auto w-full space-y-5">
      {/* Confetti celebration on reveal */}
      {showConfetti && <ConfettiEffect trigger={showConfetti} />}

      {/* Progress Pills */}
      <ProgressPills chancesUsed={chancesUsed} totalChances={3} />

      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lightOrange/70 border border-brand-orange/30 text-xs font-bold text-brand-deep">
          <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
          <span>
            {isFinalChance ? '⭐ FINAL SCRATCH CARD!' : `Round ${chanceNumber} Scratch Card`}
          </span>
        </div>
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">
          Scratch To Reveal Discount
        </h2>
        <p className="text-xs text-brand-dark/70">
          Rub across the foil below using your finger or mouse cursor.
        </p>
      </div>

      {/* The HTML5 Canvas Scratch Card */}
      <ScratchCardCanvas
        discount={reward.discount}
        rewardCode={reward.rewardCode}
        boxNumber={reward.boxNumber}
        chanceNumber={chanceNumber}
        isFinalChance={isFinalChance}
        onRevealComplete={handleRevealComplete}
      />

      {/* Action Buttons: Appears once discount is revealed */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-3 pt-2"
        >
          {/* OPTION 1: Utilize Current Coupon Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-sm tracking-wide shadow-md flex items-center justify-between transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black leading-tight">
                  Utilize {reward.discount}% OFF Coupon
                </div>
                <div className="text-[10px] text-emerald-100 font-medium">
                  Lock this discount now & show at counter
                </div>
              </div>
            </div>
            {isClaiming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
            )}
          </motion.button>

          {/* OPTION 2: Move to Next Chance Button (if chances remain) */}
          {!isFinalChance && remainingChances > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onMoveToNextChance}
              disabled={isClaiming}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-deep text-white font-extrabold text-sm tracking-wide shadow-brand flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <OrangeSliceIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black leading-tight">
                    Move to Next Chance
                  </div>
                  <div className="text-[10px] text-orange-100 font-medium">
                    {remainingChances} mystery {remainingChances === 1 ? 'box' : 'boxes'} remaining to pick
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}

          <p className="text-[11px] text-center text-brand-dark/55 pt-1">
            Choose: <strong>Utilize this coupon now</strong> or <strong>try the next chance</strong> for another surprise!
          </p>
        </motion.div>
      )}

      <div className="text-[11px] text-brand-dark/40 text-center flex items-center justify-center gap-1">
        <OrangeSliceIcon className="w-3 h-3 opacity-40" />
        <span>Stored securely on Orange Pulp database</span>
      </div>
    </div>
  );
};
