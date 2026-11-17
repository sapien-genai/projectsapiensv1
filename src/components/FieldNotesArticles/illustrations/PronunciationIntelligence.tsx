import React from 'react';

export default function VoiceIllustration() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="none" stroke="#111111" strokeWidth="3" role="img" aria-label="A microphone connected to a speech waveform, representing verified pronunciation">
    <rect x="115" y="160" width="110" height="210" rx="55" />
    <path d="M85 300v25a85 85 0 0 0 170 0v-25M170 410v60m-55 0h110M150 190h40m-40 30h40m-40 30h40" />
    <path d="M290 300h60" strokeDasharray="6 8" />
    {[40,90,150,220,130,70,180,250,160,80,40].map((height, i) => <path key={i} d={`M${390 + i * 28} ${300-height/2}v${height}`} strokeWidth="8" strokeLinecap="round" />)}
    <text x="400" y="515" textAnchor="middle" fill="#111111" stroke="none" fontFamily="Helvetica, Arial, sans-serif" fontSize="20" letterSpacing="4">NAMES. VOICES. IDENTITY.</text>
  </svg>;
}
