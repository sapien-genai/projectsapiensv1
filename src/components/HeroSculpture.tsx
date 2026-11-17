import { useEffect, useRef, useState } from 'react';

/** Decorative canvas: no network, stopped offscreen, and a static reduced-motion view. */
export default function HeroSculpture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const pauseRef = useRef(paused);
  const resumeRef = useRef<() => void>(() => {});
  useEffect(() => { pauseRef.current = paused; resumeRef.current(); }, [paused]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ctx = context;
    const hero = canvas.closest('section')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, time = 0, last = 0, frame = 0;
    let inView = true, pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);
      const cx = width * .5, cy = height * .48, scale = Math.min(width * .38, height * .4);
      const rotation = time * .14 + pointerX * .3, tilt = .78 + pointerY * .22;
      const paths: {points: [number, number][]; depth: number}[] = [];
      for (let band = 0; band < 58; band++) {
        const v = band / 58 * Math.PI * 2;
        const points: [number, number][] = [];
        let depth = 0;
        for (let step = 0; step <= 128; step++) {
          const u = step / 128 * Math.PI * 2;
          const radius = .64 + (.27 + .06 * Math.sin(u * 3 + v * 2 + time * .65)) * Math.cos(v);
          const x = radius * Math.cos(u), y = radius * Math.sin(u), z = .32 * Math.sin(v) + .15 * Math.sin(u * 2 + time * .3);
          const x1 = x * Math.cos(rotation) + z * Math.sin(rotation), z1 = -x * Math.sin(rotation) + z * Math.cos(rotation);
          const y1 = y * Math.cos(tilt) - z1 * Math.sin(tilt), z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
          const perspective = 2.8 / (2.8 - z2);
          points.push([cx + x1 * scale * perspective, cy + y1 * scale * perspective]);
          depth += z2;
        }
        paths.push({points, depth: depth / 129});
      }
      paths.sort((a,b) => a.depth - b.depth);
      for (const path of paths) {
        ctx.beginPath();
        path.points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
        ctx.strokeStyle = `rgba(20,24,22,${Math.min(.65, (.22 + (path.depth + .8) * .35) * .85)})`;
        ctx.lineWidth = .75;
        ctx.stroke();
      }
      for (let i = 0; i < 35; i++) {
        const angle = i * 2.399 + time * .025, radius = scale * (1.08 + (i % 7) * .07);
        ctx.fillStyle = i % 4 === 0 ? '#157f6855' : '#161a1833';
        ctx.fillRect(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * .7, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1);
      }
    }
    function animate(now: number) {
      frame = 0;
      if (pauseRef.current || !inView || document.hidden) return;
      if (now - last > 30) {
        time += Math.min((now - last) / 1000, .04) * .5;
        pointerX += (targetX - pointerX) * .035;
        pointerY += (targetY - pointerY) * .035;
        draw(); last = now;
      }
      frame = requestAnimationFrame(animate);
    }
    function resume() {
      if (pauseRef.current || !inView || document.hidden) { cancelAnimationFrame(frame); frame = 0; return; }
      if (!frame) { last = performance.now(); frame = requestAnimationFrame(animate); }
    }
    function resize() {
      const rect = canvas!.getBoundingClientRect(), density = Math.min(devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas!.width = width * density; canvas!.height = height * density;
      ctx.setTransform(density, 0, 0, density, 0, 0); draw();
    }
    function move(event: PointerEvent) {
      const rect = hero.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width - .5;
      targetY = (event.clientY - rect.top) / rect.height - .5;
    }
    function leave() { targetX = targetY = 0; }
    function preference(event: MediaQueryListEvent) { pauseRef.current = event.matches; setPaused(event.matches); resume(); }
    const size = new ResizeObserver(resize);
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; resume(); });
    size.observe(canvas); visibility.observe(hero);
    hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', resume); reduced.addEventListener('change', preference);
    resumeRef.current = resume; resize(); resume();
    return () => { cancelAnimationFrame(frame); size.disconnect(); visibility.disconnect(); hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', resume); reduced.removeEventListener('change', preference); resumeRef.current = () => {}; };
  }, []);
  return <><div className="hero-art" aria-hidden="true"><canvas ref={canvasRef}/><div className="art-caption"><span>01 / From possibility to practice</span><span>Designed. Built. Evaluated.</span></div></div><button type="button" className="motion-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Play motion ▷' : 'Pause motion Ⅱ'}</button></>;
}
