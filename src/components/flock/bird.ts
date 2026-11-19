/**
 * The one bird every flock on the site is drawn with: tapered wings, a small
 * body and a forked tail, nose pointing along `heading`. `wing` runs -1..1
 * through a wingbeat.
 */
export function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, heading: number, size: number, wing: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(heading + Math.PI / 2);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, -size * .5);
  ctx.quadraticCurveTo(-size * .35, -size * .4, -size, size * (.05 + wing * .48));
  ctx.quadraticCurveTo(-size * .45, size * (.12 + wing * .15), 0, size * .26);
  ctx.lineTo(size * .12, size * .6); ctx.lineTo(0, size * .4); ctx.lineTo(-size * .12, size * .6);
  ctx.lineTo(0, size * .26);
  ctx.quadraticCurveTo(size * .45, size * (.12 + wing * .15), size, size * (.05 + wing * .48));
  ctx.quadraticCurveTo(size * .35, -size * .4, 0, -size * .5);
  ctx.fill(); ctx.restore();
}

/** Sizes a canvas for sharp drawing and returns its CSS-pixel dimensions. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const rect = canvas.getBoundingClientRect(), density = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * density); canvas.height = Math.round(rect.height * density);
  ctx.setTransform(density, 0, 0, density, 0, 0);
  return { width: rect.width, height: rect.height };
}
