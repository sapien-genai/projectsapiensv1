/**
 * The flock's bird as an inline icon, for call-to-action buttons where an
 * arrow would otherwise sit. It points where the link leads and inherits the
 * text colour. Drawn with the wings swept back, which stays legible at icon size.
 */
const HEADINGS = { 'up-right': 45, 'down-right': 135, right: 90, up: 0 } as const;

export default function BirdGlyph({ heading = 'up-right', className = '' }: { heading?: keyof typeof HEADINGS; className?: string }) {
  return <svg viewBox="-1.1 -1.1 2.2 2.2" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
    <path transform={`rotate(${HEADINGS[heading]})`} d="M0-.7Q-.28-.52-1.02.34Q-.5.02-.13.16L-.2.72 0 .46.2.72.13.16Q.5.02 1.02.34Q.28-.52 0-.7Z" />
  </svg>;
}
