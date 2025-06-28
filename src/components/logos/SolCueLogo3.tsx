
import React from 'react';

interface SolCueLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const SolCueLogo3: React.FC<SolCueLogoProps> = ({ 
  width = 300, 
  height = 200, 
  className = "" 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 400 300" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circular background with waves */}
      <circle cx="200" cy="120" r="90" fill="url(#circularGradient)" />
      
      {/* Sun in upper portion */}
      <circle cx="200" cy="80" r="25" fill="#FFD700" />
      
      {/* Subtle sun rays within circle */}
      <g stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <line x1="200" y1="45" x2="200" y2="52" />
        <line x1="218" y1="52" x2="215" y2="55" />
        <line x1="225" y1="70" x2="218" y2="73" />
        <line x1="225" y1="90" x2="218" y2="87" />
        <line x1="218" y1="108" x2="215" y2="105" />
        <line x1="200" y1="115" x2="200" y2="108" />
        <line x1="182" y1="108" x2="185" y2="105" />
        <line x1="175" y1="90" x2="182" y2="87" />
        <line x1="175" y1="70" x2="182" y2="73" />
        <line x1="182" y1="52" x2="185" y2="55" />
      </g>
      
      {/* Ocean waves in lower portion */}
      <path d="M 120 140 Q 140 130 160 140 T 200 140 T 240 140 T 280 140" 
            stroke="#1E3A8A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M 130 155 Q 150 148 170 155 T 210 155 T 250 155 T 270 155" 
            stroke="#3B82F6" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 140 165 Q 160 160 180 165 T 220 165 T 260 165" 
            stroke="#60A5FA" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M 150 175 Q 170 172 190 175 T 230 175 T 250 175" 
            stroke="#93C5FD" strokeWidth="2" fill="none" strokeLinecap="round" />
      
      {/* SolCue text with shadow effect */}
      <text x="202" y="242" textAnchor="middle" 
            fill="#00000020" fontSize="46" fontWeight="700" 
            fontFamily="system-ui, -apple-system, sans-serif">
        SolCue
      </text>
      <text x="200" y="240" textAnchor="middle" 
            fill="#1E3A8A" fontSize="46" fontWeight="700" 
            fontFamily="system-ui, -apple-system, sans-serif">
        SolCue
      </text>
      
      {/* Light is Medicine tagline with accent */}
      <rect x="120" y="255" width="160" height="2" fill="url(#taglineAccent)" rx="1" />
      <text x="200" y="275" textAnchor="middle" 
            fill="#666" fontSize="17" fontWeight="400" 
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.5px">
        Light is Medicine
      </text>
      
      {/* Gradients */}
      <defs>
        <radialGradient id="circularGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF7E6" />
          <stop offset="40%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#DBEAFE" />
        </radialGradient>
        <linearGradient id="taglineAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#4A90E2" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SolCueLogo3;
