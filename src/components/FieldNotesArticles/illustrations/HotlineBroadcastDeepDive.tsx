import React from 'react';

export default function TimelineIllustration() {
  const eras = [
    { year: '1921', title: 'Radio', note: 'one signal', x: 110, complexity: 1, type: 'radio' },
    { year: '1939', title: 'Television', note: 'one screen', x: 250, complexity: 2, type: 'television' },
    { year: '1961', title: 'Rights', note: 'one package', x: 390, complexity: 3, type: 'rights' },
    { year: '1979', title: 'Cable', note: 'more channels', x: 530, complexity: 4, type: 'cable' },
    { year: '1990s', title: 'RSNs', note: 'local bundles', x: 670, complexity: 5, type: 'rsns' },
    { year: '2020s', title: 'Streaming', note: 'many apps', x: 810, complexity: 6, type: 'streaming' },
  ];

  return (
    <svg
      viewBox="0 0 920 560"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      stroke="#111111"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="A horizontal timeline showing sports broadcasting evolving from one radio signal in 1921 to a complex network of cable, regional, and streaming destinations in the 2020s."
    >
      <text x="70" y="45" fontSize="11" letterSpacing="2.5" strokeWidth="0" fill="#111111" opacity="0.45" className="draw-path draw-delay-1">BROADCAST COMPLEXITY OVER TIME</text>
      <text x="850" y="45" textAnchor="end" fontSize="11" letterSpacing="2.5" strokeWidth="0" fill="#111111" opacity="0.45" className="draw-path draw-delay-2">1921 → 2020s</text>
      <line x1="70" y1="62" x2="850" y2="62" strokeWidth="0.8" opacity="0.18" className="draw-path-slow" />

      <path d="M 110 280 L 250 280 L 390 280 L 530 280 L 670 280 L 810 280" strokeWidth="2" opacity="0.28" className="draw-path-slow draw-delay-2" />
      {eras.map((era, index) => {
        const delayClass = `draw-delay-${Math.min(index + 2, 8)}`;
        const barHeight = era.complexity * 19;
        const barY = 470 - barHeight;
        return (
          <g key={era.year} className={`draw-path ${delayClass}`}>
            <line x1={era.x} y1="280" x2={era.x} y2="470" strokeWidth="0.7" opacity="0.16" />
            <circle cx={era.x} cy="280" r="7" fill="#ffffff" strokeWidth="2" />
            <text x={era.x} y="325" textAnchor="middle" fontSize="12" fontWeight="600" strokeWidth="0" fill="#111111">{era.year}</text>
            <text x={era.x} y="345" textAnchor="middle" fontSize="13" strokeWidth="0" fill="#111111">{era.title}</text>
            <text x={era.x} y="364" textAnchor="middle" fontSize="10" strokeWidth="0" fill="#111111" opacity="0.5">{era.note}</text>
            <rect x={era.x - 19} y={barY} width="38" height={barHeight} rx="4" fill="#111111" stroke="#111111" />
            <text x={era.x} y="492" textAnchor="middle" fontSize="10" strokeWidth="0" fill="#111111" opacity="0.5">{era.complexity} {era.complexity === 1 ? 'PATH' : 'PATHS'}</text>
          </g>
        );
      })}

      <text x="70" y="528" fontSize="10" letterSpacing="1.8" strokeWidth="0" fill="#111111" opacity="0.45" className="draw-path draw-delay-8">MORE PLACES TO LOOK</text>
      <text x="850" y="528" textAnchor="end" fontSize="10" letterSpacing="1.8" strokeWidth="0" fill="#111111" opacity="0.45" className="draw-path draw-delay-8">ONE GAME / MANY DESTINATIONS</text>

      <g className="draw-path draw-delay-3">
        <rect x="55" y="92" width="110" height="108" rx="6" />
        <circle cx="110" cy="143" r="27" strokeWidth="0.8" opacity="0.45" />
        <path d="M 96 143 Q 110 128 124 143 Q 110 158 96 143 Z" strokeWidth="0.9" />
        <text x="110" y="177" textAnchor="middle" fontSize="10" fontWeight="600" strokeWidth="0" fill="#111111">ONE SIGNAL</text>
      </g>
      <g className="draw-path draw-delay-4">
        <rect x="195" y="92" width="110" height="108" rx="6" />
        <rect x="218" y="119" width="64" height="39" rx="3" strokeWidth="0.9" opacity="0.6" />
        <line x1="250" y1="158" x2="250" y2="168" strokeWidth="0.9" opacity="0.6" />
        <line x1="238" y1="168" x2="262" y2="168" strokeWidth="0.9" opacity="0.6" />
        <text x="250" y="185" textAnchor="middle" fontSize="10" fontWeight="600" strokeWidth="0" fill="#111111">ONE SCREEN</text>
      </g>
      <g className="draw-path draw-delay-5">
        <rect x="335" y="92" width="110" height="108" rx="6" />
        <circle cx="365" cy="137" r="10" strokeWidth="0.9" opacity="0.6" />
        <circle cx="390" cy="137" r="10" strokeWidth="0.9" opacity="0.6" />
        <circle cx="377" cy="162" r="10" strokeWidth="0.9" opacity="0.6" />
        <text x="390" y="185" textAnchor="middle" fontSize="10" fontWeight="600" strokeWidth="0" fill="#111111">ONE PACKAGE</text>
      </g>
      <g className="draw-path draw-delay-6">
        <rect x="475" y="92" width="110" height="108" rx="6" />
        <rect x="495" y="118" width="30" height="30" rx="3" strokeWidth="0.9" opacity="0.6" />
        <rect x="535" y="118" width="30" height="30" rx="3" strokeWidth="0.9" opacity="0.6" />
        <rect x="515" y="158" width="30" height="22" rx="3" strokeWidth="0.9" opacity="0.6" />
        <text x="530" y="193" textAnchor="middle" fontSize="10" fontWeight="600" strokeWidth="0" fill="#111111">MORE CHANNELS</text>
      </g>
      <g className="draw-path draw-delay-7">
        <rect x="615" y="92" width="110" height="108" rx="6" />
        <circle cx="646" cy="128" r="9" strokeWidth="0.9" opacity="0.6" />
        <circle cx="670" cy="128" r="9" strokeWidth="0.9" opacity="0.6" />
        <circle cx="694" cy="128" r="9" strokeWidth="0.9" opacity="0.6" />
        <circle cx="658" cy="157" r="9" strokeWidth="0.9" opacity="0.6" />
        <circle cx="682" cy="157" r="9" strokeWidth="0.9" opacity="0.6" />
        <text x="670" y="185" textAnchor="middle" fontSize="10" fontWeight="600" strokeWidth="0" fill="#111111">LOCAL BUNDLES</text>
      </g>
      <g className="draw-path draw-delay-8">
        <rect x="755" y="92" width="110" height="108" rx="6" />
        <rect x="769" y="117" width="34" height="24" rx="4" strokeWidth="0.9" opacity="0.6" />
        <rect x="811" y="117" width="34" height="24" rx="4" strokeWidth="0.9" opacity="0.6" />
        <rect x="769" y="151" width="34" height="24" rx="4" strokeWidth="0.9" opacity="0.6" />
        <rect x="811" y="151" width="34" height="24" rx="4" strokeWidth="0.9" opacity="0.6" />
        <text x="810" y="192" textAnchor="middle" fontSize="10" fontWeight="600" strokeWidth="0" fill="#111111">MANY APPS</text>
      </g>

      <g className="draw-path-slow draw-delay-8">
        <path d="M 810 200 C 810 215 810 225 810 250" strokeWidth="1.2" />
        <path d="M 810 250 L 800 242 M 810 250 L 820 242" strokeWidth="1.2" />
      </g>
      <g className="draw-path draw-delay-8">
        <rect x="695" y="220" width="230" height="38" rx="19" fill="#111111" stroke="#111111" />
        <text x="810" y="244" textAnchor="middle" fontSize="11" fontWeight="600" strokeWidth="0" fill="#ffffff">HOTLINE SPORTS / FIND THE GAME</text>
      </g>
    </svg>
  );
}
