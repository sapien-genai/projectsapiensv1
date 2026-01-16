import React, { useMemo } from 'react';

interface OpenMojiProps {
  emoji: string;
  size?: number;
  className?: string;
}

// Map common emojis to OpenMoji hex codes
const emojiMap: Record<string, string> = {
  '🎯': '1F3AF', // Direct Hit
  '🌟': '1F31F', // Glowing Star
  '⭐': '2B50', // Star
  '🎨': '1F3A8', // Artist Palette
  '🚀': '1F680', // Rocket
  '💡': '1F4A1', // Light Bulb
  '🔥': '1F525', // Fire
  '✨': '2728', // Sparkles
  '🏆': '1F3C6', // Trophy
  '📚': '1F4DA', // Books
  '🎓': '1F393', // Graduation Cap
  '💪': '1F4AA', // Flexed Biceps
  '🌈': '1F308', // Rainbow
  '🎉': '1F389', // Party Popper
  '🔧': '1F527', // Wrench
  '🧪': '1F9EA', // Test Tube
  '🗺️': '1F5FA', // World Map
  '✍️': '270D', // Writing Hand
  '⚡': '26A1', // High Voltage
  '🎪': '1F3AA', // Circus Tent
  '🧠': '1F9E0', // Brain
  '⚙️': '2699', // Gear
  '📊': '1F4CA', // Bar Chart
  '🎬': '1F3AC', // Clapper Board
  '🎮': '1F3AE', // Video Game
  '🌱': '1F331', // Seedling
  '🔮': '1F52E', // Crystal Ball
  '🎭': '1F3AD', // Performing Arts
  '📝': '1F4DD', // Memo
  '🎸': '1F3B8', // Guitar
  '🌸': '1F338', // Cherry Blossom
  '🦾': '1F9BE', // Mechanical Arm
  '🤖': '1F916', // Robot
  '👁️': '1F441', // Eye
  '⏱️': '23F1', // Stopwatch
  '⚠️': '26A0', // Warning
  '💻': '1F4BB', // Laptop
  '🔒': '1F512', // Lock
};

function OpenMojiComponent({ emoji, size = 24, className = '' }: OpenMojiProps) {
  const hexCode = useMemo(() => emojiMap[emoji] || '', [emoji]);

  const cdnUrl = useMemo(() => {
    if (!hexCode) return null;
    return `https://cdn.jsdelivr.net/npm/openmoji@16.0.0/color/svg/${hexCode}.svg`;
  }, [hexCode]);

  if (!cdnUrl) {
    return <span className={className} style={{ fontSize: size }}>{emoji}</span>;
  }

  return (
    <img
      src={cdnUrl}
      alt={emoji}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      style={{ verticalAlign: 'middle' }}
      loading="lazy"
    />
  );
}

export default React.memo(OpenMojiComponent);
