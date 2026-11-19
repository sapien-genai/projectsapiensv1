import { useEffect, useRef } from 'react';
import { drawBird, fitCanvas } from './bird';

/**
 * A small flock for use around the site. The hero runs a full neighbour
 * simulation; this is the lightweight relative: each bird eases toward its
 * place in a named formation, so twenty of them cost almost nothing.
 *
 * `cohesion` says how far the birds have come together: 0 is every bird
 * wandering on its own, 1 is the full formation. Changing it (or the
 * formation) while mounted makes the birds fly to their new places.
 *
 * Decorative only: hidden from assistive technology, paused off-screen, and
 * drawn as a single still frame when the visitor prefers reduced motion.
 */

export type Formation = 'cluster' | 'line' | 'wave' | 'grid' | 'ring' | 'vee';

interface Props { formation: Formation; count?: number; cohesion?: number; size?: number; color?: string; still?: boolean; className?: string }
type Point = { x: number; y: number; heading: number };

const TAU = Math.PI * 2;

/** Where bird `i` of `n` belongs, in a -1..1 square, at time `t` seconds. */
function place(formation: Formation, i: number, n: number, t: number): Point {
  const along = ((i + .5) / n + t * .035) % 1;
  switch (formation) {
    case 'cluster': { const a = i * 2.399963 + t * .12, r = .62 * Math.sqrt((i + .5) / n); return { x: Math.cos(a) * r, y: Math.sin(a) * r, heading: a + Math.PI / 2 }; }
    case 'ring': { const a = (i / n) * TAU + t * .22; return { x: Math.cos(a) * .66, y: Math.sin(a) * .66, heading: a + Math.PI / 2 }; }
    case 'line': return { x: -.92 + along * 1.84, y: 0, heading: 0 };
    case 'wave': { const x = -.92 + along * 1.84; return { x, y: Math.sin(x * 4.2 + t * .9) * .42, heading: Math.atan(Math.cos(x * 4.2 + t * .9) * .9) }; }
    case 'grid': { const cols = Math.ceil(Math.sqrt(n * 3)), rows = Math.ceil(n / cols); return { x: cols > 1 ? -.8 + (i % cols) * (1.6 / (cols - 1)) : 0, y: rows > 1 ? -.5 + Math.floor(i / cols) * (1 / (rows - 1)) : 0, heading: 0 }; }
    case 'vee': { const rank = Math.ceil(i / 2), side = i % 2 ? -1 : 1, gap = 1.5 / Math.ceil(n / 2); return { x: .7 - rank * gap, y: side * rank * gap * .55 + Math.sin(t * .8) * .03, heading: 0 }; }
  }
}

/** Where the same bird goes when left to itself. */
function wander(i: number, t: number): Point {
  const a = i * 12.9898, b = i * 78.233, pace = .22 + (i % 5) * .05;
  return { x: Math.sin(a + t * pace) * .9, y: Math.cos(b + t * pace * .83) * .82, heading: 0 };
}

export default function Flock({ formation, count = 16, cohesion = 1, size = 6, color = '12,17,14', still = false, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ formation, cohesion });
  const redraw = useRef<() => void>(() => {});
  useEffect(() => { live.current = { formation, cohesion }; redraw.current(); }, [formation, cohesion]);

  useEffect(() => {
    const canvas = canvasRef.current, context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ctx = context;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const frozen = () => still || reduced.matches;
    let width = 0, height = 0, frame = 0, last = 0, time = 0, inView = false;
    const birds = Array.from({ length: count }, (_, i) => ({ ...wander(i, 0), mix: 0, phase: i * 1.71, depth: .55 + ((i * 37) % 100) / 220 }));

    function target(i: number, mix: number) {
      const home = place(live.current.formation, i, count, time), free = wander(i, time);
      return { x: free.x + (home.x - free.x) * mix, y: free.y + (home.y - free.y) * mix, heading: home.heading };
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      const sx = (width / 2) - size * 1.3, sy = (height / 2) - size * 1.3;
      for (const bird of birds) drawBird(ctx, width / 2 + bird.x * sx, height / 2 + bird.y * sy, bird.heading, size * (.75 + bird.depth * .5),
        frozen() ? .2 : Math.sin(time * 8 + bird.phase), `rgba(${color},${.5 + bird.depth * .5})`);
    }
    function settle() { birds.forEach((bird, i) => { bird.mix = live.current.cohesion; Object.assign(bird, target(i, bird.mix)); }); draw(); }
    function step(dt: number) {
      time += dt;
      const ease = 1 - Math.exp(-dt * 2.4);
      birds.forEach((bird, i) => {
        bird.mix += (live.current.cohesion - bird.mix) * (1 - Math.exp(-dt * 1.8));
        const goal = target(i, bird.mix), dx = (goal.x - bird.x) * ease, dy = (goal.y - bird.y) * ease;
        bird.x += dx; bird.y += dy;
        // Face the direction of travel while flying to a new place; face the formation's heading once there.
        const moving = Math.hypot(dx, dy) / dt > .12;
        const want = moving ? Math.atan2(dy * (height / width || 1), dx) : goal.heading;
        bird.heading += Math.atan2(Math.sin(want - bird.heading), Math.cos(want - bird.heading)) * Math.min(1, dt * 5);
      });
    }
    function animate(now: number) {
      frame = 0;
      if (frozen() || !inView || document.hidden) return;
      step(Math.min((now - last) / 1000, .05)); draw(); last = now;
      frame = requestAnimationFrame(animate);
    }
    function resume() {
      if (frozen()) { cancelAnimationFrame(frame); frame = 0; settle(); return; }
      if (!inView || document.hidden) { cancelAnimationFrame(frame); frame = 0; return; }
      if (!frame) { last = performance.now(); frame = requestAnimationFrame(animate); }
    }
    function resize() { ({ width, height } = fitCanvas(canvas!, ctx)); if (frozen()) settle(); else draw(); }
    const sizeObserver = new ResizeObserver(resize);
    const viewObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; resume(); });
    sizeObserver.observe(canvas); viewObserver.observe(canvas);
    document.addEventListener('visibilitychange', resume); reduced.addEventListener('change', resume);
    redraw.current = () => { if (frozen()) settle(); };
    resize();
    return () => {
      cancelAnimationFrame(frame); sizeObserver.disconnect(); viewObserver.disconnect();
      document.removeEventListener('visibilitychange', resume); reduced.removeEventListener('change', resume);
      redraw.current = () => {};
    };
  }, [count, size, color, still]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none block ${className}`} />;
}
