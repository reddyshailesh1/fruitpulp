import React from 'react';

export const OrangeSliceIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="32" cy="32" r="30" fill="#F28C28" stroke="#D96516" strokeWidth="4" />
    <circle cx="32" cy="32" r="23" fill="#FFF2E5" />
    <circle cx="32" cy="32" r="19" fill="#F28C28" />
    <path d="M32 32 L32 15 A17 17 0 0 1 44 20 Z" fill="#FFA347" />
    <path d="M32 32 L44 20 A17 17 0 0 1 49 32 Z" fill="#FFA347" />
    <path d="M32 32 L49 32 A17 17 0 0 1 44 44 Z" fill="#FFA347" />
    <path d="M32 32 L44 44 A17 17 0 0 1 32 49 Z" fill="#FFA347" />
    <path d="M32 32 L32 49 A17 17 0 0 1 20 44 Z" fill="#FFA347" />
    <path d="M32 32 L20 44 A17 17 0 0 1 15 32 Z" fill="#FFA347" />
    <path d="M32 32 L15 32 A17 17 0 0 1 20 20 Z" fill="#FFA347" />
    <path d="M32 32 L20 20 A17 17 0 0 1 32 15 Z" fill="#FFA347" />
    <circle cx="32" cy="32" r="4" fill="#FFF9F0" />
    <path d="M32 6 C38 2 46 4 48 10 C42 12 34 10 32 6 Z" fill="#38A169" />
  </svg>
);

export const JuiceGlassIllustration: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Straw */}
    <path d="M56 10 L68 2 L78 12 L64 36" stroke="#2B6CB0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M58 8 L70 0" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
    
    {/* Glass Body */}
    <path d="M22 25 L32 105 C33 112 40 116 50 116 C60 116 67 112 68 105 L78 25 Z" fill="rgba(255, 255, 255, 0.45)" stroke="#D96516" strokeWidth="3.5" />
    
    {/* Juice Level */}
    <path d="M25 45 L32 104 C33 109 40 112 50 112 C60 112 67 109 68 104 L75 45 Q50 49 25 45 Z" fill="url(#juiceGrad)" />
    
    {/* Orange Slice Garnish on Rim */}
    <circle cx="30" cy="25" r="14" fill="#F28C28" stroke="#D96516" strokeWidth="2.5" />
    <circle cx="30" cy="25" r="9" fill="#FFF9F0" />
    <circle cx="30" cy="25" r="7" fill="#FFA347" />
    <circle cx="30" cy="25" r="2" fill="#FFF9F0" />

    {/* Ice Cubes */}
    <rect x="42" y="55" width="16" height="16" rx="3" transform="rotate(12 42 55)" fill="rgba(255, 255, 255, 0.7)" stroke="#FFF" strokeWidth="1" />
    <rect x="40" y="76" width="14" height="14" rx="3" transform="rotate(-8 40 76)" fill="rgba(255, 255, 255, 0.6)" stroke="#FFF" strokeWidth="1" />

    {/* Bubbles */}
    <circle cx="48" cy="98" r="2.5" fill="#FFE9D6" />
    <circle cx="58" cy="85" r="3.5" fill="#FFE9D6" />
    <circle cx="42" cy="70" r="2" fill="#FFE9D6" />

    <defs>
      <linearGradient id="juiceGrad" x1="50" y1="45" x2="50" y2="112" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFA347" />
        <stop offset="0.6" stopColor="#F28C28" />
        <stop offset="1" stopColor="#D96516" />
      </linearGradient>
    </defs>
  </svg>
);

export const GiftBoxIllustration: React.FC<{ className?: string; isOpened?: boolean }> = ({
  className = 'w-16 h-16',
  isOpened = false,
}) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {isOpened ? (
      <>
        {/* Open box base */}
        <path d="M16 38 L64 38 L58 72 L22 72 Z" fill="#FFA347" stroke="#D96516" strokeWidth="3" />
        {/* Inside glow */}
        <ellipse cx="40" cy="38" rx="24" ry="7" fill="#FFF9F0" stroke="#D96516" strokeWidth="2" />
        {/* Floating Stars */}
        <path d="M40 20 L42 26 L48 26 L43 30 L45 36 L40 32 L35 36 L37 30 L32 26 L38 26 Z" fill="#F28C28" />
      </>
    ) : (
      <>
        {/* Box Lid */}
        <rect x="12" y="24" width="56" height="14" rx="3" fill="#F28C28" stroke="#D96516" strokeWidth="3" />
        {/* Box Body */}
        <rect x="18" y="38" width="44" height="34" rx="2" fill="#FFA347" stroke="#D96516" strokeWidth="3" />
        {/* Ribbon Vertical */}
        <rect x="36" y="24" width="8" height="48" fill="#FFF9F0" stroke="#D96516" strokeWidth="1.5" />
        {/* Ribbon Horizontal */}
        <rect x="18" y="52" width="44" height="7" fill="#FFF9F0" stroke="#D96516" strokeWidth="1.5" />
        {/* Ribbon Bow */}
        <ellipse cx="33" cy="19" rx="7" ry="5" transform="rotate(-20 33 19)" fill="#FFF9F0" stroke="#D96516" strokeWidth="2" />
        <ellipse cx="47" cy="19" rx="7" ry="5" transform="rotate(20 47 19)" fill="#FFF9F0" stroke="#D96516" strokeWidth="2" />
        <circle cx="40" cy="22" r="3.5" fill="#D96516" />
      </>
    )}
  </svg>
);
