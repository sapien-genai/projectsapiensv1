import { useEffect, useState } from 'react';

interface TypingAnimationProps {
  lines: string[];
  typingSpeed?: number;
  pauseBetweenLines?: number;
  pauseBeforeRepeat?: number;
}

export default function TypingAnimation({
  lines,
  typingSpeed = 50,
  pauseBetweenLines = 500,
  pauseBeforeRepeat = 5000,
}: TypingAnimationProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isTyping) {
      const resetTimer = setTimeout(() => {
        setDisplayedLines([]);
        setCurrentLineIndex(0);
        setCurrentText('');
        setIsTyping(true);
      }, pauseBeforeRepeat);

      return () => clearTimeout(resetTimer);
    }

    if (currentLineIndex >= lines.length) {
      setIsTyping(false);
      return;
    }

    const targetLine = lines[currentLineIndex];

    if (currentText.length < targetLine.length) {
      const timer = setTimeout(() => {
        setCurrentText(targetLine.slice(0, currentText.length + 1));
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setDisplayedLines([...displayedLines, currentText]);
        setCurrentText('');
        setCurrentLineIndex(currentLineIndex + 1);
      }, pauseBetweenLines);

      return () => clearTimeout(timer);
    }
  }, [currentText, currentLineIndex, displayedLines, isTyping, lines, typingSpeed, pauseBetweenLines, pauseBeforeRepeat]);

  return (
    <div className="space-y-2">
      {displayedLines.map((line, index) => (
        <h2
          key={index}
          className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-none"
        >
          {line}
        </h2>
      ))}
      {currentText && (
        <h2 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-none">
          {currentText}
          <span className="animate-pulse">|</span>
        </h2>
      )}
    </div>
  );
}
