
import React from 'react';

interface SolCueLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const SolCueLogo2: React.FC<SolCueLogoProps> = ({ 
  width = 300, 
  height = 200, 
  className = "" 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 280" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Minimalist sun outline */}
      <circle cx="200" cy="80" r="35" fill="none" stroke="#FF8C42" strokeWidth="3" />
      
      {/* Clean sun rays */}
      <g stroke="#FF8C42" strokeWidth="2" strokeLinecap="round">
        <line x1="200" y1="25" x2="200" y2="35" />
        <line x1="225" y1="35" x2="220" y2="40" />
        <line x1="235" y1="55" x2="230" y2="60" />
        <line x1="240" y1="80" x2="230" y2="80" />
        <line x1="235" y1="105" x2="230" y2="100" />
        <line x1="225" y1="125" x2="220" y2="120" />
        <line x1="200" y1="135" x2="200" y2="125" />
        <line x1="175" y1="125" x2="180" y2="120" />
        <line x1="165" y1="105" x2="170" y2="100" />
        <line x1="160" y1="80" x2="170" y2="80" />
        <line x1="165" y1="55" x2="170" y2="60" />
        <line x1="175" y1="35" x2="180" y2="40" />
      </g>
      
      {/* Horizon line with gradient */}
      <rect x="80" y="115" width="240" height="4" fill="url(#horizonGradient)" rx="2" />
      
      {/* Stylized ocean waves */}
      <path d="M 80 135 Q 130 125 180 135 T 280 135 T 320 135" 
            stroke="#4A90E2" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 100 150 Q 150 140 200 150 T 300 150" 
            stroke="#7BB3F0" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 120 160 Q 170 155 220 160 T 280 160" 
            stroke="#A8D0F5" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* SolCue text with outline effect */}
      <text x="200" y="210" textAnchor="middle" 
            fill="none" stroke="#4A90E2" strokeWidth="2" 
            fontSize="44" fontWeight="700" 
            fontFamily="system-ui, -apple-system, sans-serif">
        SolCue
      </text>
      <text x="200" y="210" textAnchor="middle" 
            fill="#4A90E2" fontSize="44" fontWeight="700" 
            fontFamily="system-ui, -apple-system, sans-serif">
        SolCue
      </text>
      
      {/* Light is Medicine tagline */}
      <text x="200" y="240" textAnchor="middle" 
            fill="#888" fontSize="16" fontWeight="300" 
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="1px">
        LIGHT IS MEDICINE
      </text>
      
      {/* Gradients */}
      <defs>
        <linearGradient id="horizonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#4A90E2" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SolCueLogo2;
