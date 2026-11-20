import { useEffect, useMemo, useRef, useState } from 'react';
import { discoveryScore, type DiscoveryCounts } from '../../../supabase/functions/visibility/discovery-score';
import type { Report } from '../../../supabase/functions/visibility-report/core/types';

function reportScoreRows(report: Report) {
  return report.assistants.map(a => ({ id: a.id, failed: Boolean(a.error), mentions: a.discovery.filter(d => d.mentioned).length,
    discoveryAnswers: a.discovery.length, expectedDiscovery: report.profile.queries.length }));
}

export function DiscoveryScoreCard({ rows, eligible = true }: { rows: DiscoveryCounts[]; eligible?: boolean }) {
  const result = discoveryScore(rows, eligible);
  return <section aria-label="Sampled discovery score" className="mt-8 rounded-xl border border-[#172820]/15 bg-white p-6 md:p-8">
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
      <p className="shrink-0 text-6xl font-semibold tracking-tight" aria-label={result.score === null ? 'Score unavailable' : `${result.score} out of 100`}>
        {result.score ?? '—'}{result.score !== null && <span className="text-xl font-normal text-[#526055]">/100</span>}
      </p>
      <div className="min-w-0 sm:flex-1"><h3 className="text-xl font-semibold">Sampled discovery score</h3>
        <p className="mt-2 text-[#526055]">{!eligible ? 'Website identity could not be established from the fetch. Answers may be available, but no discovery grade is assigned.' : result.score === null ? 'No usable category answers were available. This is not a zero score.' : `Your business appeared in ${result.mentions} of ${result.answers} returned category answers.`}</p>
        <p className="mt-2 text-sm text-[#526055]">{result.answers}/{result.expected || 'unknown'} expected category answers received{result.partial ? ' · incomplete coverage' : ''}. Named-business recognition and website checks are separate.</p>
      </div>
    </div>
    <details className="mt-4 text-sm text-[#526055]"><summary className="cursor-pointer py-2 font-semibold">How this score works</summary>
      <p className="mt-2">100 × answers mentioning your business or citing its domain ÷ usable category answers, rounded. Failed calls are excluded and shown in coverage. This small, website-derived sample measures mentions—not endorsements, search rank, website quality or overall AI readiness. A low score does not mean your website is broken.</p>
      <p className="mt-2">Broad and specific questions can produce different results. Compare the same fixed questions and models over time; newly generated instant questions are not a before-and-after benchmark.</p>
    </details>
  </section>;
}

export function DiscoveryScoreJourney({ report }: { report: Report }) {
  const rows = useMemo(() => reportScoreRows(report), [report]);
  const result = discoveryScore(rows, report.signals.reachable);
  const anchor = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [display, setDisplay] = useState(0);
  const current = useRef(0);
  const points = result.answers ? Math.round(100 * rows.filter(r => seen.includes(r.id) && !r.failed).reduce((n, r) => n + r.mentions, 0) / result.answers) : 0;
  useEffect(() => {
    const elements = anchor.current?.parentElement?.querySelectorAll<HTMLElement>('[data-discovery-provider]');
    if (!elements) return;
    if (!('IntersectionObserver' in window)) { setSeen(rows.map(r => r.id)); return; }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        const id = (entry.target as HTMLElement).dataset.discoveryProvider!;
        setSeen(previous => previous.includes(id) ? previous : [...previous, id]);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [rows]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { current.current = points; setDisplay(points); return; }
    const from = current.current;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 450);
      current.current = Math.round(from + (points - from) * progress);
      setDisplay(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [points]);
  if (result.score === null) return null;
  return <div ref={anchor} className="sticky top-2 z-10 rounded-xl border border-[#d4e3ed] bg-white/95 p-4 shadow-sm backdrop-blur-sm" aria-label="Discovery score evidence walkthrough">
    <div className="flex items-center justify-between gap-3">
      <div><p className="text-sm font-semibold"><span className="tabular-nums text-2xl" aria-hidden="true">{display}</span><span className="sr-only">{points}</span> / {result.score} points revealed</p>
        <p className="mt-1 text-xs text-[#526055]">{seen.length}/{rows.length} assistant sections revealed · final score {result.score}/100</p></div>
      <button type="button" className="min-h-11 shrink-0 text-xs font-semibold underline underline-offset-4 sm:text-sm" onClick={() => setSeen(rows.map(r => r.id))}>Reveal all</button>
    </div>
    <p className="mt-1 hidden text-xs text-[#526055] sm:block">Scroll through the assistant evidence to see the contributions. This reveals a saved result; it does not run new tests.</p>
  </div>;
}
