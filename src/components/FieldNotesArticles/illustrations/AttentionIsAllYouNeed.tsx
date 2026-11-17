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
      aria-label="A stylized diagram: the word ATTENTION at the center, with radiating lines connecting to four nodes representing Project Sapiens, Hotline Sports, Pronunciation Intelligence, and AI Brand Visibility."
    >
      {/* ── Center: ATTENTION ─────────────────────────────── */}
      <g className="draw-path">
        <rect x="300" y="270" width="200" height="60" rx="4" />
        <text
          x="400"
          y="309"
          textAnchor="middle"
          fontSize="22"
          fontWeight="600"
          letterSpacing="4"
          strokeWidth="0"
          fill="#111111"
        >
          ATTENTION
        </text>
      </g>

      {/* ── Radiating connection lines ──────────────────── */}
      <g className="draw-path-slow draw-delay-1" strokeWidth="0.8" opacity="0.35">
        {/* To Project Sapiens (upper left) */}
        <path d="M 320 280 L 200 180 L 140 140" />
        {/* To Hotline Sports (upper right) */}
        <path d="M 480 280 L 600 180 L 660 140" />
        {/* To Pronunciation Intelligence (lower left) */}
        <path d="M 320 320 L 200 420 L 140 460" />
        {/* To AI Brand Visibility (lower right) */}
        <path d="M 480 320 L 600 420 L 660 460" />
      </g>

      {/* ── Project Sapiens (upper left) ────────────────── */}
      <g className="draw-path draw-delay-2">
        <rect x="60" y="110" width="160" height="56" rx="4" />
        <text x="140" y="135" textAnchor="middle" fontSize="13" fontWeight="600" strokeWidth="0" fill="#111111">
          Project Sapiens
        </text>
        <text x="140" y="153" textAnchor="middle" fontSize="10" strokeWidth="0" fill="#111111" opacity="0.5">
          the right concept
        </text>
      </g>

      {/* ── Hotline Sports (upper right) ─────────────────── */}
      <g className="draw-path draw-delay-3">
        <rect x="580" y="110" width="160" height="56" rx="4" />
        <text x="660" y="135" textAnchor="middle" fontSize="13" fontWeight="600" strokeWidth="0" fill="#111111">
          Hotline Sports
        </text>
        <text x="660" y="153" textAnchor="middle" fontSize="10" strokeWidth="0" fill="#111111" opacity="0.5">
          the one game
        </text>
      </g>

      {/* ── Pronunciation Intelligence (lower left) ────── */}
      <g className="draw-path draw-delay-4">
        <rect x="60" y="430" width="160" height="56" rx="4" />
        <text x="140" y="455" textAnchor="middle" fontSize="13" fontWeight="600" strokeWidth="0" fill="#111111">
          Pronunciation Intelligence
        </text>
        <text x="140" y="473" textAnchor="middle" fontSize="10" strokeWidth="0" fill="#111111" opacity="0.5">
          the one detail
        </text>
      </g>

      {/* ── AI Brand Visibility (lower right) ───────────── */}
      <g className="draw-path draw-delay-5">
        <rect x="580" y="430" width="160" height="56" rx="4" />
        <text x="660" y="455" textAnchor="middle" fontSize="13" fontWeight="600" strokeWidth="0" fill="#111111">
          AI Brand Visibility
        </text>
        <text x="660" y="473" textAnchor="middle" fontSize="10" strokeWidth="0" fill="#111111" opacity="0.5">
          the right signals
        </text>
      </g>

      {/* ── Subtle grain overlay ────────────────────────── */}
      <defs>
        <filter id="grain-filter-ayn" x="0" y="0" width="100%" height="100%">
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
      <rect x="0" y="0" width="800" height="600" filter="url(#grain-filter-ayn)" />
    </svg>
  );
}
