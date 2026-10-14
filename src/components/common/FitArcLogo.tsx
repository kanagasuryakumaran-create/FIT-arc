import React from 'react';

interface FitArcLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const FitArcLogo: React.FC<FitArcLogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Premium Fit Arc Forest & Emerald Icon */}
      <div
        className={`${iconSize} rounded-xl bg-gradient-to-br from-emerald-600 to-forest-800 flex items-center justify-center text-white shadow-emerald-sm ring-1 ring-emerald-500/20 shrink-0`}
      >
        <svg
          className="w-3/5 h-3/5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Fit Arc dynamic wellness pulse */}
          <path d="M3 12h3.5l2.5-6 4 12 3-8 2 4H21" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${textSize} font-extrabold tracking-tight text-[#1C1917] leading-none flex items-center gap-1`}>
            Fit <span className="text-emerald-700">Arc</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#78716C] mt-0.5">
            Wellness & Nutrition
          </span>
        </div>
      )}
    </div>
  );
};

