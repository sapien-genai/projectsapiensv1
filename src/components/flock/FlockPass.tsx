import { useEffect, useRef } from 'react';
import { drawBird, fitCanvas } from './bird';

/**
 * A handful of birds crossing a section's top rule, once, the first time the
 * section scrolls into view. Place it as the first child of a `relative`
 * section. Draws nothing for visitors who prefer reduced motion.
 */
const BIRDS = 7, DURATION = 3.4;

export default function FlockPass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current, context = canvas?.getContext('2d');
    if (!canvas || !context || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = context;
    let frame = 0, start = 0;
    function animate(now: number) {
      if (!start) start = now;
      const t = (now - start) / 1000, { width, height } = fitCanvas(canvas!, ctx);
      ctx.clearRect(0, 0, width, height);
      if (t > DURATION + .6) return;
      const lead = -60 + (width + 220) * (t / DURATION);
      for (let i = 0; i < BIRDS; i++) {
        const rank = Math.ceil(i / 2), side = i % 2 ? -1 : 1;
        const x = lead - rank * 20 - (i % 3) * 3;
        const y = height / 2 + side * rank * 9 + Math.sin(t * 2.2 + i) * 3;
        drawBird(ctx, x, y, Math.sin(t * 2.2 + i) * .08, 6 + (i % 3), Math.sin(t * 9 + i * 1.7), `rgba(12,17,14,${.6 + (i % 3) * .15})`);
      }
      frame = requestAnimationFrame(animate);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect(); frame = requestAnimationFrame(animate);
    }, { rootMargin: '0px 0px -25% 0px' });
    observer.observe(canvas);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 block h-20 w-full -translate-y-1/2" />;
}
