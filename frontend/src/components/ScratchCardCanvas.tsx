import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, Wand2 } from 'lucide-react';
import { JuiceGlassIllustration } from './JuiceMascot';

interface ScratchCardCanvasProps {
  discount: number;
  rewardCode: string;
  boxNumber: number;
  chanceNumber: number;
  isFinalChance: boolean;
  onRevealComplete: () => void;
}

export const ScratchCardCanvas: React.FC<ScratchCardCanvasProps> = ({
  discount,
  rewardCode,
  boxNumber,
  chanceNumber,
  isFinalChance,
  onRevealComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const isPointerDownRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Draw the top scratchable foil
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.globalCompositeOperation = 'source-over';

    // Rich metallic orange gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#FFA347');
    gradient.addColorStop(0.3, '#F28C28');
    gradient.addColorStop(0.7, '#D96516');
    gradient.addColorStop(1, '#B84E0C');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative foil pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let x = 15; x < width; x += 25) {
      for (let y = 15; y < height; y += 25) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Border line inside foil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Text on foil: "SCRATCH HERE"
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;
    ctx.fillText('✨ SCRATCH HERE ✨', width / 2, height / 2 - 16);

    ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
    ctx.shadowBlur = 3;
    ctx.fillText('Rub with your finger or tap below', width / 2, height / 2 + 14);

    ctx.font = '600 11px monospace';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(`BOX #${boxNumber} • CHANCE ${chanceNumber} OF 3`, width / 2, height / 2 + 38);
  }, [boxNumber, chanceNumber]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Complete scratch reveal
  const completeScratch = useCallback(() => {
    if (isScratched) return;
    setIsScratched(true);
    setScratchPercent(100);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Trigger phone vibration if available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch (e) {}
    }

    onRevealComplete();
  }, [isScratched, onRevealComplete]);

  // Check scratched percentage
  const checkScratchedPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const sampleStep = 16;
    let transparentCount = 0;
    let totalSamples = 0;

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    for (let y = 0; y < h; y += sampleStep) {
      for (let x = 0; x < w; x += sampleStep) {
        totalSamples++;
        const alphaIndex = (y * w + x) * 4 + 3;
        if (data[alphaIndex] < 64) {
          transparentCount++;
        }
      }
    }

    const percent = Math.round((transparentCount / totalSamples) * 100);
    setScratchPercent(percent);

    // As soon as 25% is scratched, reveal automatically!
    if (percent >= 25) {
      completeScratch();
    }
  }, [isScratched, completeScratch]);

  // Erasing function
  const scratch = (clientX: number, clientY: number) => {
    if (isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 55; // Extra wide brush for effortless finger scratching!

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x, y };
    checkScratchedPercentage();
  };

  // Modern Universal Pointer Events (handles touch, mouse, and stylus without scroll interference)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isScratched) return;
    isPointerDownRef.current = true;
    lastPointRef.current = null;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current || isScratched) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = false;
    lastPointRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch (err) {}
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      {/* Scratch Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-brand-lg border-4 border-white bg-gradient-to-br from-amber-50 via-white to-orange-50 select-none touch-none"
      >
        {/* UNDERNEATH REVEALED CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none">
          <div className="relative mb-2">
            <JuiceGlassIllustration className="w-16 h-16 drop-shadow-md" />
            <div className="absolute -top-1 -right-2 bg-brand-deep text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
              Box #{boxNumber}
            </div>
          </div>

          <div className="text-4xl md:text-5xl font-black text-brand-deep tracking-tight">
            {discount}% OFF
          </div>

          <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mt-1">
            {isFinalChance ? '🎉 Your Final Discount!' : `Chance ${chanceNumber} Revealed!`}
          </p>

          <div className="mt-3 px-3 py-1 bg-brand-lightOrange/80 border border-brand-orange/30 rounded-full font-mono text-[11px] font-semibold text-brand-deep">
            Code: {rewardCode}
          </div>
        </div>

        {/* TOP HTML5 CANVAS FOIL */}
        <canvas
          ref={canvasRef}
          width={340}
          height={255}
          style={{ touchAction: 'none' }}
          className={`absolute inset-0 w-full h-full cursor-pointer select-none transition-opacity duration-300 ${
            isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={() => {
            // Tapping also scratches a generous chunk or auto-reveals
            completeScratch();
          }}
        />
      </div>

      {/* Scratch Action Bar / Tap-to-Reveal */}
      <div className="w-full mt-3 flex items-center justify-between text-xs px-2">
        <div className="flex items-center gap-1.5 text-brand-dark/70 font-bold">
          <Sparkles className="w-4 h-4 text-brand-orange" />
          <span>{isScratched ? 'Revealed!' : `${scratchPercent}% scratched`}</span>
        </div>

        {!isScratched && (
          <button
            onClick={completeScratch}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-lightOrange text-brand-deep font-extrabold text-xs shadow-sm hover:bg-brand-orange hover:text-white transition-all active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Tap To Reveal</span>
          </button>
        )}
      </div>
    </div>
  );
};
