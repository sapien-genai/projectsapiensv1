/**
 * The flock's bird as an inline icon, for call-to-action buttons where an
 * arrow would otherwise sit. It points where the link leads and inherits the
 * text colour. Wings are swept back and gently bowed with the tips curling in: the pointed nose keeps it reading as an arrow, the curve as a bird.
 */
const HEADINGS = { 'up-right': 45, 'down-right': 135, right: 90, up: 0 } as const;

export default function BirdGlyph({ heading = 'up-right', className = '' }: { heading?: keyof typeof HEADINGS; className?: string }) {
  return <svg viewBox="-1.1 -1.1 2.2 2.2" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
    <path transform={`rotate(${HEADINGS[heading]})`} d="M0-.74C-.22-.56-.86-.2-1.04.42C-.74.04-.42 0-.13.14L-.2.72 0 .46.2.72.13.14C.42 0 .74.04 1.04.42C.86-.2.22-.56 0-.74Z" />
  </svg>;
}
