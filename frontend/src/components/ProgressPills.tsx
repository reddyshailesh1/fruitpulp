import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ProgressPillsProps {
  chancesUsed: number; // 0, 1, 2, 3
  totalChances?: number; // default 3
}

export const ProgressPills: React.FC<ProgressPillsProps> = ({
  chancesUsed,
  totalChances = 3,
}) => {
  const currentStep = Math.min(chancesUsed + 1, totalChances);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
        <span className="flex items-center gap-1.5 text-brand-deep">
          <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-spin-slow" />
          {chancesUsed < 3 ? `Chance ${currentStep} of ${totalChances}` : 'Game Complete!'}
        </span>
        <span className="text-brand-dark/50 text-[11px]">
          {3 - chancesUsed > 0 ? `${3 - chancesUsed} remaining` : '0 remaining'}
        </span>
      </div>

      {/* 3 Step bars */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((step) => {
          const isDone = chancesUsed >= step;
          const isCurrent = chancesUsed + 1 === step;
          const isFinal = step === 3;

          return (
            <div
              key={step}
              className={`relative overflow-hidden rounded-xl p-2.5 text-center transition-all duration-300 border ${
                isDone
                  ? 'bg-orange-50 border-brand-orange/40 text-brand-deep font-semibold'
                  : isCurrent
                  ? 'bg-gradient-to-r from-brand-orange to-brand-deep text-white border-transparent shadow-brand shadow-sm font-bold scale-[1.02]'
                  : 'bg-white/80 border-dashed border-gray-200 text-gray-400 font-medium'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                ) : (
                  <span>Round {step}</span>
                )}
                {isFinal && !isDone && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-amber-950 font-black">
                    FINAL
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
