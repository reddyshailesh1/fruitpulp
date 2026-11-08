import React from 'react';
import type { IReward } from '../types';
import { OrangeSliceIcon } from './JuiceMascot';
import { Info, Check } from 'lucide-react';

interface PreviousRewardsListProps {
  rewards: IReward[];
  isFinalResult?: boolean;
}

export const PreviousRewardsList: React.FC<PreviousRewardsListProps> = ({
  rewards,
  isFinalResult = false,
}) => {
  if (!rewards || rewards.length === 0) return null;

  return (
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-brand-orange/20 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
          <OrangeSliceIcon className="w-4 h-4" />
          <span>Scratch History</span>
        </h3>
        <span className="text-[11px] text-brand-dark/50 font-medium">
          {rewards.length} of 3 revealed
        </span>
      </div>

      <div className="space-y-2">
        {rewards.map((reward, idx) => {
          const roundNum = idx + 1;
          const isThirdRound = roundNum === 3;
          const isWinningFinal = isFinalResult && isThirdRound;

          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isWinningFinal
                  ? 'bg-gradient-to-r from-amber-50 to-orange-100 border-brand-deep font-bold text-brand-dark shadow-sm'
                  : 'bg-gray-50/80 border-gray-100 text-brand-dark/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isWinningFinal
                      ? 'bg-brand-deep text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  #{roundNum}
                </span>
                <div>
                  <p className="text-xs font-bold text-brand-dark">
                    Box #{reward.boxNumber}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {reward.rewardCode}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-brand-deep">
                  {reward.discount}% OFF
                </div>
                <div className="text-[10px]">
                  {isWinningFinal ? (
                    <span className="text-emerald-600 font-black flex items-center gap-0.5 justify-end">
                      <Check className="w-3 h-3 stroke-[3]" /> APPLIED
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Not Applicable</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isFinalResult && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> Previous discounts do not carry over or sum up. Only your <strong>3rd and final scratch</strong> applies to your purchase!
          </p>
        </div>
      )}
    </div>
  );
};
