
import React from 'react';

interface SolCueLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const SolCueLogo1: React.FC<SolCueLogoProps> = ({ 
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
      {/* Background circle */}
      <circle cx="200" cy="90" r="80" fill="url(#sunGradient1)" />
      
      {/* Sun rays */}
      <g stroke="#FF8C42" strokeWidth="4" strokeLinecap="round">
        <line x1="200" y1="10" x2="200" y2="30" />
        <line x1="245" y1="25" x2="235" y2="35" />
        <line x1="275" y1="55" x2="265" y2="65" />
        <line x1="290" y1="90" x2="270" y2="90" />
        <line x1="275" y1="125" x2="265" y2="115" />
        <line x1="245" y1="155" x2="235" y2="145" />
        <line x1="200" y1="170" x2="200" y2="150" />
        <line x1="155" y1="155" x2="165" y2="145" />
        <line x1="125" y1="125" x2="135" y2="115" />
        <line x1="110" y1="90" x2="130" y2="90" />
        <line x1="125" y1="55" x2="135" y2="65" />
        <line x1="155" y1="25" x2="165" y2="35" />
      </g>
      
      {/* Horizon line */}
      <rect x="50" y="130" width="300" height="8" fill="#4A90E2" rx="4" />
      
      {/* Ocean waves */}
      <path d="M 50 150 Q 100 140 150 150 T 250 150 T 350 150" 
            stroke="#4A90E2" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 70 165 Q 120 155 170 165 T 270 165 T 330 165" 
            stroke="#7BB3F0" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 90 175 Q 140 170 190 175 T 290 175 T 310 175" 
            stroke="#A8D0F5" strokeWidth="4" fill="none" strokeLinecap="round" />
      
      {/* SolCue text */}
      <text x="200" y="220" textAnchor="middle" 
            fill="#4A90E2" fontSize="48" fontWeight="700" 
            fontFamily="system-ui, -apple-system, sans-serif">
        SolCue
      </text>
      
      {/* Light is Medicine tagline */}
      <text x="200" y="250" textAnchor="middle" 
            fill="#666" fontSize="18" fontWeight="400" 
            fontFamily="system-ui, -apple-system, sans-serif">
        Light is Medicine
      </text>
      
      {/* Gradients */}
      <defs>
        <radialGradient id="sunGradient1" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF8C42" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export default SolCueLogo1;
