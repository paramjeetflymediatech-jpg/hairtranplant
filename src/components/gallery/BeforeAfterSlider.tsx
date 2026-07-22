'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, SlidersHorizontal, Cpu } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  hairOverlayUrl?: string;
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before Surgery (Day 0)',
  afterLabel = 'Result (Month 6 Post-Op)',
  hairOverlayUrl,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation states
  const [simulatedUrl, setSimulatedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isUserUpload = beforeUrl.startsWith('data:');

  // Run Canvas Inpainting Simulator
  useEffect(() => {
    if (isUserUpload) {
      setIsGenerating(true);
      const overlayPath = hairOverlayUrl || "/images/showcase/hair_overlay.png";

      const imgBefore = new window.Image();
      const imgOverlay = new window.Image();

      imgBefore.onload = () => {
        imgOverlay.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = imgBefore.naturalWidth || 800;
          canvas.height = imgBefore.naturalHeight || 800;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // 1. Draw original uploaded photo (preserving face 100%)
            ctx.drawImage(imgBefore, 0, 0, canvas.width, canvas.height);

            // 2. Configure multiply blend mode to overlay hair strands
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = 0.92;

            // 3. Automatically position hair piece at the top-center scalp crown area
            const w = canvas.width * 0.72;
            const h = canvas.height * 0.72;
            const x = (canvas.width - w) / 2;
            const y = -canvas.height * 0.08; // Anchored slightly off-screen top to sit on crown

            ctx.drawImage(imgOverlay, x, y, w, h);
            setSimulatedUrl(canvas.toDataURL('image/jpeg', 0.95));
          } else {
            setSimulatedUrl(beforeUrl);
          }
          setIsGenerating(false);
        };
        imgOverlay.src = overlayPath;
      };
      imgBefore.src = beforeUrl;
    } else {
      setSimulatedUrl(afterUrl);
    }
  }, [beforeUrl, afterUrl, hairOverlayUrl, isUserUpload]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  if (isGenerating) {
    return (
      <div className="w-full h-[400px] md:h-[480px] rounded-3xl border border-slate-700/80 bg-slate-950 flex flex-col items-center justify-center space-y-4 select-none">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500" />
          <Cpu className="absolute inset-0 m-auto h-5 w-5 text-teal-400 animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Restoration Simulation</p>
          <p className="text-[10px] text-slate-500 font-semibold">Editing hair & scalp region; preserving face identity...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      className="relative w-full h-[400px] md:h-[480px] rounded-3xl overflow-hidden select-none border border-slate-700/80 shadow-2xl bg-slate-950 group cursor-ew-resize"
    >
      {/* After Image (Full width background) */}
      <img
        src={simulatedUrl || afterUrl}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>{afterLabel}</span>
      </div>

      {/* Before Image (Clipped overlay) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }}
        />
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-semibold shadow-lg">
          {beforeLabel}
        </div>
      </div>

      {/* Vertical Divider Line & Drag Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 via-white to-teal-400 cursor-ew-resize z-10 shadow-[0_0_12px_rgba(20,184,166,0.8)]"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border-2 border-teal-400 text-teal-400 shadow-glow-teal flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
