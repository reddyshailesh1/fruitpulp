import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MysteryBox } from '../components/MysteryBox';
import { ProgressPills } from '../components/ProgressPills';
import { OrangeSliceIcon } from '../components/JuiceMascot';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import type { ISelectBoxData } from '../types';

interface MysteryBoxesPageProps {
  chancesUsed: number;
  selectedBoxes: number[];
  onBoxSelected: (data: ISelectBoxData) => void;
  apiSelectBox: (boxNumber: number) => Promise<ISelectBoxData>;
}

export const MysteryBoxesPage: React.FC<MysteryBoxesPageProps> = ({
  chancesUsed,
  selectedBoxes,
  onBoxSelected,
  apiSelectBox,
}) => {
  const [processingBox, setProcessingBox] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentChance = chancesUsed + 1;
  const isFinalChance = currentChance === 3;

  const handleSelect = async (boxNumber: number) => {
    if (processingBox !== null) return;
    setError(null);
    setProcessingBox(boxNumber);

    try {
      const result = await apiSelectBox(boxNumber);
      onBoxSelected(result);
    } catch (err: any) {
      setError(err.message || 'Failed to select mystery box. Please try again.');
      setProcessingBox(null);
    }
  };

  return (
    <div className="flex flex-col items-center py-4 px-4 max-w-md mx-auto w-full space-y-4">
      {/* Progress Pills */}
      <ProgressPills chancesUsed={chancesUsed} totalChances={3} />

      {/* Chance Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-xs font-bold text-brand-deep">
          <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-spin-slow" />
          <span>
            {isFinalChance
              ? '⭐ FINAL CHANCE! This scratch decides your discount'
              : `Chance ${currentChance} of 3: Pick a Mystery Box`}
          </span>
        </div>
        <h2 className="text-xl font-black text-brand-dark tracking-tight">
          Select 1 of 9 Mystery Boxes
        </h2>
        <p className="text-xs text-brand-dark/60">
          Discounts inside range from 5% to 10% OFF.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-left"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p className="font-medium">{error}</p>
        </motion.div>
      )}

      {/* 3x3 Grid of 9 Mystery Boxes */}
      <div className="w-full grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((boxNumber) => {
          const isSelected = selectedBoxes.includes(boxNumber);
          const isProcessingThis = processingBox === boxNumber;

          return (
            <MysteryBox
              key={boxNumber}
              boxNumber={boxNumber}
              isSelected={isSelected}
              isDisabled={processingBox !== null && !isProcessingThis}
              isProcessing={isProcessingThis}
              onSelect={handleSelect}
            />
          );
        })}
      </div>

      {processingBox !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-brand-orange/30 shadow-sm text-xs font-bold text-brand-deep"
        >
          <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
          <span>Locking in Box #{processingBox} on Orange Pulp server...</span>
        </motion.div>
      )}

      <div className="text-[11px] text-brand-dark/50 text-center flex items-center justify-center gap-1.5 pt-1">
        <OrangeSliceIcon className="w-3.5 h-3.5 opacity-60" />
        <span>Tap any unlocked box above to begin scratching</span>
      </div>
    </div>
  );
};
