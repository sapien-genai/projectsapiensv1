export default function Portrait({ className = '', eager = false }: { className?: string; eager?: boolean }) {
  return <img
    src="/images/tony-marks-portrait.jpg"
    alt="Pencil portrait of Tony Marks"
    width={2048}
    height={2048}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    className={`aspect-square object-contain ${className}`}
  />;
}
