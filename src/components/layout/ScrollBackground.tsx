'use client';

import React, { useEffect, useState } from 'react';

export function ScrollBackground() {
  const [opacity, setOpacity] = useState(0.01);
  const [scale, setScale] = useState(1.04);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 700; // Transition finishes at 700px scrolled
      
      // Calculate opacity from 0.01 up to 0.08
      const calculatedOpacity = 0.01 + Math.min(scrollY / maxScroll, 1) * 0.07;
      // Calculate scale from 1.04 down to 1.00
      const calculatedScale = 1.04 - Math.min(scrollY / maxScroll, 1) * 0.04;
      
      setOpacity(calculatedOpacity);
      setScale(calculatedScale);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-300 ease-out -z-20"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&auto=format&fit=crop&q=60')",
        opacity: opacity,
        transform: `scale(${scale})`
      }}
    />
  );
}
