import React from 'react';
import { motion } from 'framer-motion';
import { GiftBoxIllustration } from './JuiceMascot';
import { Lock } from 'lucide-react';

interface MysteryBoxProps {
  boxNumber: number;
  isSelected: boolean;
  isDisabled: boolean;
  isProcessing: boolean;
  onSelect: (boxNumber: number) => void;
}

export const MysteryBox: React.FC<MysteryBoxProps> = ({
  boxNumber,
  isSelected,
  isDisabled,
  isProcessing,
  onSelect,
}) => {
  const handleClick = () => {
    if (!isDisabled && !isSelected && !isProcessing) {
      onSelect(boxNumber);
    }
  };

  return (
    <motion.button
      whileHover={!isDisabled && !isSelected ? { scale: 1.05, y: -4 } : {}}
      whileTap={!isDisabled && !isSelected ? { scale: 0.95 } : {}}
      onClick={handleClick}
      disabled={isDisabled || isSelected || isProcessing}
      className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center p-3 transition-all duration-300 select-none ${
        isSelected
          ? 'bg-amber-100/70 border-2 border-dashed border-amber-400 opacity-60 cursor-not-allowed'
          : isDisabled
          ? 'bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed'
          : 'bg-gradient-to-b from-white to-orange-50/70 border-2 border-brand-orange/30 hover:border-brand-orange shadow-md hover:shadow-brand active:shadow-inner cursor-pointer'
      }`}
      aria-label={`Mystery Box ${boxNumber}`}
    >
      {/* Box Number Badge */}
      <span
        className={`absolute top-2 left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
          isSelected
            ? 'bg-gray-300 text-gray-600'
            : isDisabled
            ? 'bg-gray-200 text-gray-400'
            : 'bg-brand-orange text-white'
        }`}
      >
        {boxNumber}
      </span>

      {/* Main Illustration */}
      <div className="my-auto transform transition-transform group-hover:scale-110">
        <GiftBoxIllustration
          className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm"
          isOpened={isSelected}
        />
      </div>

      {/* Status indicator */}
      <div className="text-[10px] font-black uppercase tracking-wider text-center mt-1">
        {isSelected ? (
          <span className="text-gray-500">Opened</span>
        ) : isDisabled ? (
          <span className="text-gray-400 flex items-center gap-0.5 justify-center">
            <Lock className="w-2.5 h-2.5" /> Locked
          </span>
        ) : (
          <span className="text-brand-deep font-bold">Pick Me!</span>
        )}
      </div>

      {/* Shimmer pulse glow for available boxes */}
      {!isDisabled && !isSelected && (
        <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-orange/0 via-brand-orange/20 to-brand-orange/0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </motion.button>
  );
};
