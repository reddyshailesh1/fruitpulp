import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  trigger?: boolean;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ trigger = true }) => {
  useEffect(() => {
    if (!trigger) return;

    // First burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F28C28', '#D96516', '#FFA347', '#38A169', '#FFD166'],
    });

    // Secondary burst after 300ms
    const timer1 = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F28C28', '#D96516', '#FFE9D6'],
      });
    }, 250);

    const timer2 = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F28C28', '#D96516', '#38A169'],
      });
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [trigger]);

  return null;
};
