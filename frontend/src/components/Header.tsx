import React from 'react';
import { OrangeSliceIcon } from './JuiceMascot';

interface HeaderProps {
  rollNumber?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ rollNumber }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-orange/20 shadow-sm transition-all">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <OrangeSliceIcon className="w-9 h-9 drop-shadow-sm animate-spin-slow" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-brand-dark flex items-center gap-1.5 leading-none">
              <span>ORANGE</span>
              <span className="text-brand-deep">PULP</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-orange mt-0.5">
              Juice Point • Fresh & Pure
            </p>
          </div>
        </div>

        {rollNumber && (
          <div className="flex items-center gap-1.5 bg-brand-lightOrange/60 border border-brand-orange/30 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-deep animate-pulse"></span>
            <span className="text-xs font-semibold text-brand-deep tracking-wider font-mono">
              {rollNumber}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
