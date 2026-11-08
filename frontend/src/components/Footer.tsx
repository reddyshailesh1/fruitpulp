import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 px-4 text-center text-xs text-brand-dark/60 border-t border-brand-orange/15 bg-white/50">
      <div className="max-w-md mx-auto space-y-1">
        <p className="font-semibold text-brand-dark/80">
          🍊 Orange Pulp Juice Point • Campus Stall Offer
        </p>
        <p className="text-[11px] text-brand-dark/50">
          Show your final digital scratch result at the counter to claim your juice discount.
        </p>
        <p className="text-[10px] text-brand-dark/40 pt-1">
          Valid for registered roll number only. One participation per campaign.
        </p>
        <div className="pt-2">
          <a
            href="/standee.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-brand-dark/70 bg-brand-orange/10 hover:bg-brand-orange/20 border border-brand-orange/25 transition-colors"
          >
            <span>🖨️</span>
            <span>View Counter Standee / QR Poster</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
