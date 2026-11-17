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
      aria-label="A stylized AI ecosystem: a central AI chip radiating outward to a data center, transmission towers, power lines, a cloud, a construction crane, a factory, a globe, a search icon, and a government building, all connected by thin technical diagram lines."
    >
      {/* ── Center: AI chip ─────────────────────────────── */}
      <g className="draw-path">
        <rect x="340" y="250" width="120" height="120" rx="6" />
        <rect x="360" y="270" width="80" height="80" rx="3" strokeWidth="1" />
        {/* Chip pins */}
        <line x1="370" y1="250" x2="370" y2="238" />
        <line x1="390" y1="250" x2="390" y2="238" />
        <line x1="410" y1="250" x2="410" y2="238" />
        <line x1="430" y1="250" x2="430" y2="238" />
        <line x1="370" y1="370" x2="370" y2="382" />
        <line x1="390" y1="370" x2="390" y2="382" />
        <line x1="410" y1="370" x2="410" y2="382" />
        <line x1="430" y1="370" x2="430" y2="382" />
        <line x1="340" y1="290" x2="328" y2="290" />
        <line x1="340" y1="310" x2="328" y2="310" />
        <line x1="340" y1="330" x2="328" y2="330" />
        <line x1="460" y1="290" x2="472" y2="290" />
        <line x1="460" y1="310" x2="472" y2="310" />
        <line x1="460" y1="330" x2="472" y2="330" />
      </g>
      {/* Inner chip label lines */}
      <g className="draw-path draw-delay-2" strokeWidth="0.8">
        <line x1="380" y1="295" x2="420" y2="295" />
        <line x1="380" y1="305" x2="420" y2="305" />
        <line x1="380" y1="315" x2="420" y2="315" />
        <line x1="380" y1="325" x2="420" y2="325" />
      </g>

      {/* ── Radiating connection lines ──────────────────── */}
      <g className="draw-path-slow draw-delay-1" strokeWidth="0.8" opacity="0.4">
        {/* To data center (upper left) */}
        <path d="M 340 280 L 240 180 L 170 130" />
        {/* To transmission tower 1 (upper right) */}
        <path d="M 460 280 L 560 200 L 630 150" />
        {/* To transmission tower 2 (right) */}
        <path d="M 460 310 L 600 310 L 680 310" />
        {/* To cloud (lower left) */}
        <path d="M 340 340 L 240 400 L 170 440" />
        {/* To construction crane (lower right) */}
        <path d="M 460 340 L 560 420 L 640 470" />
        {/* To factory (bottom) */}
        <path d="M 400 370 L 400 480 L 400 530" />
        {/* To globe (left) */}
        <path d="M 340 310 L 200 310 L 120 310" />
        {/* To search icon (upper center) */}
        <path d="M 400 250 L 400 170 L 400 110" />
        {/* To government building (lower center-left) */}
        <path d="M 360 370 L 300 440 L 260 490" />
      </g>

      {/* ── Data center (upper left) ────────────────────── */}
      <g className="draw-path draw-delay-2">
        <rect x="120" y="100" width="60" height="50" rx="2" />
        <line x1="120" y1="116" x2="180" y2="116" strokeWidth="0.8" />
        <line x1="120" y1="132" x2="180" y2="132" strokeWidth="0.8" />
        <rect x="128" y="106" width="6" height="4" strokeWidth="0.6" />
        <rect x="128" y="122" width="6" height="4" strokeWidth="0.6" />
        <rect x="128" y="138" width="6" height="4" strokeWidth="0.6" />
      </g>

      {/* ── Transmission tower 1 (upper right) ──────────── */}
      <g className="draw-path draw-delay-3">
        <path d="M 600 100 L 615 170 L 630 100" strokeWidth="1" />
        <line x1="608" y1="135" x2="622" y2="135" strokeWidth="0.8" />
        <line x1="610" y1="120" x2="620" y2="120" strokeWidth="0.6" />
        <line x1="612" y1="150" x2="618" y2="150" strokeWidth="0.6" />
        <line x1="615" y1="170" x2="615" y2="185" strokeWidth="0.8" />
      </g>
      {/* Power lines from tower 1 */}
      <g className="draw-path draw-delay-4" strokeWidth="0.6" opacity="0.5">
        <path d="M 600 110 Q 560 120 520 115" />
        <path d="M 630 110 Q 670 120 710 115" />
      </g>

      {/* ── Transmission tower 2 (right) ───────────────── */}
      <g className="draw-path draw-delay-4">
        <path d="M 660 280 L 680 350 L 700 280" strokeWidth="1" />
        <line x1="670" y1="315" x2="690" y2="315" strokeWidth="0.8" />
        <line x1="672" y1="300" x2="688" y2="300" strokeWidth="0.6" />
        <line x1="674" y1="330" x2="686" y2="330" strokeWidth="0.6" />
        <line x1="680" y1="350" x2="680" y2="365" strokeWidth="0.8" />
      </g>

      {/* ── Cloud (lower left) ─────────────────────────── */}
      <g className="draw-path draw-delay-3">
        <path d="M 120 430 Q 100 430 100 415 Q 100 400 118 402 Q 122 388 140 390 Q 158 388 162 404 Q 180 404 180 420 Q 180 438 162 438 L 128 438 Q 112 438 112 426" />
      </g>

      {/* ── Construction crane (lower right) ───────────── */}
      <g className="draw-path draw-delay-4">
        {/* Vertical mast */}
        <line x1="620" y1="440" x2="620" y2="510" strokeWidth="1.2" />
        <line x1="616" y1="460" x2="624" y2="460" strokeWidth="0.6" />
        <line x1="616" y1="480" x2="624" y2="480" strokeWidth="0.6" />
        {/* Horizontal jib */}
        <line x1="570" y1="440" x2="680" y2="440" strokeWidth="1.2" />
        <line x1="570" y1="436" x2="680" y2="436" strokeWidth="0.6" />
        {/* Cable and hook */}
        <line x1="600" y1="440" x2="600" y2="470" strokeWidth="0.8" />
        <rect x="596" y="470" width="8" height="6" strokeWidth="0.6" />
        {/* Counterweight */}
        <rect x="668" y="436" width="14" height="10" strokeWidth="0.6" />
      </g>

      {/* ── Factory (bottom center) ─────────────────────── */}
      <g className="draw-path draw-delay-5">
        <path d="M 360 530 L 360 500 L 380 500 L 380 490 L 400 500 L 420 490 L 440 500 L 440 530 Z" />
        <line x1="360" y1="515" x2="440" y2="515" strokeWidth="0.6" />
        {/* Smokestacks */}
        <rect x="368" y="478" width="6" height="22" strokeWidth="0.8" />
        <rect x="424" y="478" width="6" height="22" strokeWidth="0.8" />
      </g>

      {/* ── Globe (left) ───────────────────────────────── */}
      <g className="draw-path draw-delay-5">
        <circle cx="80" cy="310" r="40" />
        <ellipse cx="80" cy="310" rx="40" ry="14" strokeWidth="0.6" />
        <ellipse cx="80" cy="310" rx="14" ry="40" strokeWidth="0.6" />
        <line x1="40" y1="310" x2="120" y2="310" strokeWidth="0.6" />
        <line x1="80" y1="270" x2="80" y2="350" strokeWidth="0.6" />
      </g>

      {/* ── Search icon (top center) ────────────────────── */}
      <g className="draw-path draw-delay-6">
        <circle cx="400" cy="90" r="20" />
        <line x1="414" y1="104" x2="426" y2="116" strokeWidth="1.2" />
      </g>

      {/* ── Government building (lower center-left) ────── */}
      <g className="draw-path draw-delay-6">
        {/* Roof */}
        <path d="M 220 490 L 260 470 L 300 490 Z" strokeWidth="1" />
        {/* Columns */}
        <line x1="230" y1="490" x2="230" y2="530" strokeWidth="0.8" />
        <line x1="245" y1="490" x2="245" y2="530" strokeWidth="0.8" />
        <line x1="260" y1="490" x2="260" y2="530" strokeWidth="0.8" />
        <line x1="275" y1="490" x2="275" y2="530" strokeWidth="0.8" />
        <line x1="290" y1="490" x2="290" y2="530" strokeWidth="0.8" />
        {/* Base */}
        <line x1="215" y1="530" x2="305" y2="530" strokeWidth="1.2" />
        <line x1="220" y1="492" x2="300" y2="492" strokeWidth="0.8" />
      </g>

      {/* ── Subtle grain overlay ────────────────────────── */}
      <defs>
        <filter id="grain-filter" x="0" y="0" width="100%" height="100%">
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
      <rect x="0" y="0" width="800" height="600" filter="url(#grain-filter)" />
    </svg>
  );
}
