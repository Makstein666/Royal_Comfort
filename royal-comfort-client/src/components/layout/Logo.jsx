import React from 'react';

const Logo = ({ className }) => {
  return (
    <div className={`flex items-center gap-3 md:gap-4 ${className}`}>
      {/* --- ГРАФИЧЕСКАЯ ЧАСТЬ (SVG) --- */}
      <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 drop-shadow-md">
        {/* Градиент Золота */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#B88E2F" />
            <stop offset="100%" stopColor="#9A7624" />
          </linearGradient>
        </defs>

        {/* Круги */}
        <circle cx="50" cy="50" r="48" stroke="url(#goldGradient)" strokeWidth="2" fill="none" />
        <circle cx="50" cy="50" r="42" stroke="url(#goldGradient)" strokeWidth="1" opacity="0.6" />

        {/* Корона */}
        <path 
            d="M30 38 L25 24 L40 32 L50 18 L60 32 L75 24 L70 38 H30Z" 
            fill="url(#goldGradient)" 
            stroke="url(#goldGradient)" 
            strokeWidth="1" 
            strokeLinejoin="round" 
        />
        <circle cx="25" cy="24" r="2.5" fill="url(#goldGradient)" />
        <circle cx="50" cy="18" r="2.5" fill="url(#goldGradient)" />
        <circle cx="75" cy="24" r="2.5" fill="url(#goldGradient)" />

        {/* Буква R */}
        <text 
            x="50" 
            y="78" 
            fontFamily="'Playfair Display', serif" 
            fontSize="42" 
            fontWeight="bold" 
            textAnchor="middle" 
            fill="url(#goldGradient)"
        >
            R
        </text>
      </svg>

      {/* --- ТЕКСТОВАЯ ЧАСТЬ --- */}
      <div className="flex flex-col justify-center">
        {/* ROYAL */}
        <span className="font-serif text-2xl md:text-3xl leading-none font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#FFE082] via-[#B88E2F] to-[#9A7624] drop-shadow-sm filter">
          ROYAL
        </span>
        {/* COMFORT */}
        <span className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-[#B88E2F] font-bold ml-0.5 mt-0.5 dark:text-[#D4AF37]">
          Comfort
        </span>
      </div>
    </div>
  );
};

export default Logo;