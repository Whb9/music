// src/components/HeroBanner.tsx
import React from 'react';

interface HeroBannerProps {
  campusImage: string;
  title?: string;
  subtitle?: string;
}

export default function HeroBanner({ campusImage, title, subtitle }: HeroBannerProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '300px' }}
    >
      <img
        src={campusImage}
        alt="校园风光"
        className="w-full h-full object-cover"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          el.style.display = 'none';
          const parent = el.parentElement;
          if (parent) {
            parent.style.background = 'linear-gradient(135deg, #008c8c 0%, #005f5f 100%)';
          }
        }}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black to-opacity-30" />

      {/* Optional title overlay */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black from-opacity-60">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-white text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-white text-opacity-80 text-sm mt-1">{subtitle}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
