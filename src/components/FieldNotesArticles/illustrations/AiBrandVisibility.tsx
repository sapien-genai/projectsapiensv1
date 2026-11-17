import React from 'react';

export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-auto"
      fill="none"
      stroke="#111111"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="A stylized diagram: a company website being read and interpreted by several AI systems, which produce a synthesized narrative summary."
    >
      {/* ── Company (left) ─────────────────────────────── */}
      <g className="draw-path">
        <rect x="60" y="260" width="120" height="80" rx="4" />
        <line x1="60" y1="284" x2="180" y2="284" strokeWidth="0.8" />
        <line x1="60" y1="306" x2="180" y2="306" strokeWidth="0.8" />
        <circle cx="78" cy="272" r="3" strokeWidth="0.8" />
        <line x1="90" y1="272" x2="160" y2="272" strokeWidth="0.6" opacity="0.5" />
        <line x1="72" y1="296" x2="168" y2="296" strokeWidth="0.6" opacity="0.5" />
        <line x1="72" y1="318" x2="150" y2="318" strokeWidth="0.6" opacity="0.5" />
      </g>
      <text x="120" y="366" textAnchor="middle" fontSize="11" strokeWidth="0" fill="#111111" opacity="0.5">
        company
      </text>

      {/* ── Connection lines to models ─────────────────── */}
      <g className="draw-path-slow draw-delay-1" strokeWidth="0.8" opacity="0.4">
        <path d="M 180 280 L 320 160" />
        <path d="M 180 290 L 320 240" />
        <path d="M 180 300 L 320 320" />
        <path d="M 180 310 L 320 400" />
      </g>

      {/* ── AI Models (center) ─────────────────────────── */}
      <g className="draw-path draw-delay-2">
        {/* ChatGPT */}
        <rect x="320" y="140" width="120" height="44" rx="3" />
        <circle cx="344" cy="162" r="9" strokeWidth="1" />
        <line x1="362" y1="156" x2="424" y2="156" strokeWidth="0.6" opacity="0.5" />
        <line x1="362" y1="166" x2="410" y2="166" strokeWidth="0.6" opacity="0.5" />
        {/* Claude */}
        <rect x="320" y="220" width="120" height="44" rx="3" />
        <circle cx="344" cy="242" r="9" strokeWidth="1" />
        <line x1="362" y1="236" x2="424" y2="236" strokeWidth="0.6" opacity="0.5" />
        <line x1="362" y1="246" x2="410" y2="246" strokeWidth="0.6" opacity="0.5" />
        {/* Gemini */}
        <rect x="320" y="300" width="120" height="44" rx="3" />
        <circle cx="344" cy="322" r="9" strokeWidth="1" />
        <line x1="362" y1="316" x2="424" y2="316" strokeWidth="0.6" opacity="0.5" />
        <line x1="362" y1="326" x2="410" y2="326" strokeWidth="0.6" opacity="0.5" />
        {/* Perplexity */}
        <rect x="320" y="380" width="120" height="44" rx="3" />
        <circle cx="344" cy="402" r="9" strokeWidth="1" />
        <line x1="362" y1="396" x2="424" y2="396" strokeWidth="0.6" opacity="0.5" />
        <line x1="362" y1="406" x2="410" y2="406" strokeWidth="0.6" opacity="0.5" />
      </g>
      <text x="380" y="452" textAnchor="middle" fontSize="11" strokeWidth="0" fill="#111111" opacity="0.5">
        AI systems
      </text>

      {/* ── Convergence lines to summary ───────────────── */}
      <g className="draw-path-slow draw-delay-3" strokeWidth="0.8" opacity="0.4">
        <path d="M 440 162 L 580 270" />
        <path d="M 440 242 L 580 278" />
        <path d="M 440 322 L 580 286" />
        <path d="M 440 402 L 580 294" />
      </g>

      {/* ── Narrative summary (right) ──────────────────── */}
      <g className="draw-path draw-delay-4">
        <rect x="580" y="240" width="160" height="100" rx="4" />
        <line x1="580" y1="266" x2="740" y2="266" strokeWidth="0.8" />
        <line x1="596" y1="280" x2="724" y2="280" strokeWidth="0.6" opacity="0.5" />
        <line x1="596" y1="292" x2="724" y2="292" strokeWidth="0.6" opacity="0.5" />
        <line x1="596" y1="304" x2="700" y2="304" strokeWidth="0.6" opacity="0.5" />
        <line x1="596" y1="316" x2="724" y2="316" strokeWidth="0.6" opacity="0.5" />
        <line x1="596" y1="328" x2="680" y2="328" strokeWidth="0.6" opacity="0.5" />
      </g>
      <text x="660" y="366" textAnchor="middle" fontSize="11" strokeWidth="0" fill="#111111" opacity="0.5">
        narrative summary
      </text>

      {/* ── Subtle grain overlay ────────────────────────── */}
      <defs>
        <filter id="grain-filter-abv" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0"
          />
        </filter>
      </defs>
      <rect x="0" y="0" width="800" height="600" filter="url(#grain-filter-abv)" />
    </svg>
  );
}
