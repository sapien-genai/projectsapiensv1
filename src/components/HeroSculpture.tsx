import { useEffect, useRef, useState } from 'react';
import './HeroMurmuration.css';

type Bird = { x: number; y: number; vx: number; vy: number; phase: number; depth: number };
const COUNT = 230;

/** Local flock simulation. Each bird steers toward its neighbours, with room to turn. */
export default function HeroSculpture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false); // Pre-rendered markup has no browser to ask; the effect below applies the motion preference before the first frame.
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
    if (reduced.matches) { pauseRef.current = true; setPaused(true); }
    let width = 0, height = 0, scale = 1, frame = 0, last = 0, time = 0;
    let inView = true, following = false, targetX = 0, targetY = 0;
    let focusX = 0, focusY = 0, engagement = 0;
    let touchId: number | null = null;
    const birds: Bird[] = Array.from({ length: COUNT }, (_, i) => {
      const angle = i * 2.399963, radius = Math.sqrt((i + .5) / COUNT);
      return { x: Math.cos(angle) * radius * 300, y: Math.sin(angle) * radius * 210,
        vx: 1.6 + Math.cos(angle) * .3, vy: -.6 + Math.sin(angle) * .3,
        phase: i * 1.71, depth: .45 + ((i * 37) % 100) / 180 };
    });
    function step(dt: number) {
      // Ease into pursuit quickly, then coast back to a quieter idle pace.
      // Scale the simulation clock so steering, spacing, and wingbeats stay in sync.
      const response = 1 - Math.exp(-dt / (following ? 14 : 35));
      engagement += ((following ? 1 : 0) - engagement) * response;
      dt *= .65 + engagement * .85;
      time += dt / 60;
      const destinationX = following ? targetX : Math.cos(time * .32) * 145;
      const destinationY = following ? targetY : Math.sin(time * .47) * 100;
      const focusResponse = 1 - Math.exp(-(.025 + engagement * .045) * dt);
      focusX += (destinationX - focusX) * focusResponse;
      focusY += (destinationY - focusY) * focusResponse;
      const attraction = .00022 + engagement * .00018;
      const forces = birds.map((bird, index) => {
        let neighbours = 0, cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0;
        for (let j = 0; j < birds.length; j++) {
          if (j === index) continue;
          const other = birds[j], dx = other.x - bird.x, dy = other.y - bird.y;
          const distance = dx * dx + dy * dy;
          if (distance < 95 * 95) {
            neighbours++; cx += other.x; cy += other.y; ax += other.vx; ay += other.vy;
            if (distance < 38 * 38 && distance > .01) { sx -= dx / distance; sy -= dy / distance; }
          }
        }
        let fx = sx * 1.5, fy = sy * 1.5;
        if (neighbours) {
          fx += (cx / neighbours - bird.x) * .00025 + (ax / neighbours - bird.vx) * .04;
          fy += (cy / neighbours - bird.y) * .00025 + (ay / neighbours - bird.vy) * .04;
        }
        // A moving shared heading pulls the flock into sweeping, collective turns.
        fx += (focusX - bird.x) * attraction + Math.cos(time * .63 + bird.y * .006) * .013;
        fy += (focusY - bird.y) * attraction + Math.sin(time * .55 + bird.x * .006) * .013;
        if (Math.abs(bird.x) > 320) fx -= Math.sign(bird.x) * (Math.abs(bird.x) - 320) * .003;
        if (Math.abs(bird.y) > 240) fy -= Math.sign(bird.y) * (Math.abs(bird.y) - 240) * .003;
        return { fx, fy };
      });
      birds.forEach((bird, i) => {
        bird.vx += forces[i].fx * dt; bird.vy += forces[i].fy * dt;
        const speed = Math.hypot(bird.vx, bird.vy) || 1;
        const limited = Math.max(1.35, Math.min(2.7, speed));
        bird.vx = bird.vx / speed * limited; bird.vy = bird.vy / speed * limited;
        bird.x += bird.vx * dt; bird.y += bird.vy * dt;
      });
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const bird of birds) {
        const x = width * .5 + bird.x * scale, y = height * .47 + bird.y * scale;
        const wing = Math.sin(time * 8 + bird.phase);
        const size = (3.8 + bird.depth * 3) * Math.max(.65, scale) * 1.2;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(bird.vy, bird.vx) + Math.PI / 2);
        ctx.fillStyle = `rgba(12,17,14,${.55 + bird.depth * .45})`;
        // Tapered wings, a small body, and independent wingbeats read as birds, not dots.
        ctx.beginPath(); ctx.moveTo(0, -size * .5);
        ctx.quadraticCurveTo(-size * .35, -size * .4, -size, size * (.05 + wing * .48));
        ctx.quadraticCurveTo(-size * .45, size * (.12 + wing * .15), 0, size * .26);
        ctx.lineTo(size * .12, size * .6); ctx.lineTo(0, size * .4); ctx.lineTo(-size * .12, size * .6);
        ctx.lineTo(0, size * .26);
        ctx.quadraticCurveTo(size * .45, size * (.12 + wing * .15), size, size * (.05 + wing * .48));
        ctx.quadraticCurveTo(size * .35, -size * .4, 0, -size * .5);
        ctx.fill(); ctx.restore();
      }
    }
    function animate(now: number) {
      frame = 0;
      if (pauseRef.current || !inView || document.hidden) return;
      const elapsed = now - last;
      if (elapsed >= 1000 / 40) { step(Math.min(elapsed / (1000 / 60), 2.5)); draw(); last = now; }
      frame = requestAnimationFrame(animate);
    }
    function resume() {
      if (pauseRef.current || !inView || document.hidden) { cancelAnimationFrame(frame); frame = 0; return; }
      if (!frame) { last = performance.now(); frame = requestAnimationFrame(animate); }
    }
    function resize() {
      const rect = canvas!.getBoundingClientRect(), density = Math.min(devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height; scale = Math.min(width / 850, height / 680);
      canvas!.width = Math.round(width * density); canvas!.height = Math.round(height * density);
      ctx.setTransform(density, 0, 0, density, 0, 0); draw();
    }
    function guide(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      following = scale > 0 && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      if (following) {
        targetX = Math.max(-280, Math.min(280, (clientX - rect.left - width * .5) / scale));
        targetY = Math.max(-190, Math.min(190, (clientY - rect.top - height * .47) / scale));
      }
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== 'touch' && touchId === null) guide(event.clientX, event.clientY);
    }
    function leave() { if (touchId === null) following = false; }
    // Observe native touch gestures without cancelling scrolling, zooming, or capturing input.
    function touchStart(event: TouchEvent) {
      if (event.touches.length !== 1) { touchId = null; following = false; return; }
      const touch = event.touches[0];
      guide(touch.clientX, touch.clientY);
      touchId = following ? touch.identifier : null;
    }
    function touchMove(event: TouchEvent) {
      if (touchId === null) return;
      if (event.touches.length !== 1) { touchId = null; following = false; return; }
      const touch = Array.from(event.touches).find(item => item.identifier === touchId);
      if (touch) guide(touch.clientX, touch.clientY);
    }
    function touchEnd(event: TouchEvent) {
      if (touchId !== null && Array.from(event.changedTouches).some(touch => touch.identifier === touchId)) {
        touchId = null;
        following = false;
      }
    }
    function preference(event: MediaQueryListEvent) { pauseRef.current = event.matches; setPaused(event.matches); resume(); }
    const size = new ResizeObserver(resize);
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; resume(); });
    size.observe(canvas); visibility.observe(hero);
    hero.addEventListener('pointermove', move); hero.addEventListener('pointerleave', leave);
    hero.addEventListener('touchstart', touchStart, { passive: true });
    hero.addEventListener('touchmove', touchMove, { passive: true });
    document.addEventListener('touchend', touchEnd, { passive: true });
    document.addEventListener('touchcancel', touchEnd, { passive: true });
    document.addEventListener('visibilitychange', resume); reduced.addEventListener('change', preference);
    resumeRef.current = resume; resize(); resume();
    return () => {
      cancelAnimationFrame(frame); size.disconnect(); visibility.disconnect();
      hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave);
      hero.removeEventListener('touchstart', touchStart); hero.removeEventListener('touchmove', touchMove);
      document.removeEventListener('touchend', touchEnd); document.removeEventListener('touchcancel', touchEnd);
      document.removeEventListener('visibilitychange', resume); reduced.removeEventListener('change', preference);
      resumeRef.current = () => {};
    };
  }, []);
  return <><div className="hero-art murmuration-art" aria-hidden="true"><canvas ref={canvasRef}/><div className="art-caption"><span>Many minds. One direction.</span><span className="flock-pointer-hint">Move your pointer to guide the flock.</span><span className="flock-touch-hint">Touch to guide the flock.</span></div></div><button type="button" className="motion-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Play motion ▷' : 'Pause motion Ⅱ'}</button></>;
}
