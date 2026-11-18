import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Loader2, Lock, X } from 'lucide-react';
import type { Report, ReportPreview } from '../../supabase/functions/visibility-report/core/types';

/**
 * The instant AI visibility report: enter a site, watch it run, see scores,
 * then give an email to unlock the answers behind them. Talks to the
 * visibility-report edge function; nothing locked is sent to the browser
 * until the server has recorded the email.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const POLL_MS = 2500;
const GIVE_UP_MS = 5 * 60 * 1000;
const STEPS = [
  ['site', 'Reading your site the way a crawler does'],
  ['profile', 'Working out what your business offers'],
  ['assistants', 'Asking ChatGPT, Claude, and Gemini about you'],
  ['scoring', 'Scoring the answers'],
] as const;

interface ApiResult { id?: string; status?: 'running' | 'complete' | 'failed'; progress?: string; unlocked?: boolean; preview?: ReportPreview; report?: Report; error?: string }
type View = { kind: 'idle' } | { kind: 'running'; id: string; progress: string } | { kind: 'done'; id: string; preview: ReportPreview; report?: Report };

async function api(body: Record<string, unknown>): Promise<ApiResult> {
  if (!SUPABASE_URL || !ANON_KEY) return { error: 'The live check is not available right now. Use the form below and we will run it for you.' };
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/visibility-report`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
    });
    const data = await response.json().catch(() => ({}));
    return response.ok ? data : { error: typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.' };
  } catch { return { error: 'We could not reach the report service. Please check your connection and try again.' }; }
}

const inputClass = 'block min-h-12 w-full rounded-lg border border-[#172820]/30 bg-white px-4 py-3 text-base text-[#172820] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#68745b]';
const buttonClass = 'inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-[#111] px-6 py-3 font-semibold text-white hover:bg-[#2b4032] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-70';
const eyebrow = 'text-xs font-bold uppercase tracking-[0.2em] text-[#68745b]';
const score = (value: number | null) => value === null ? 'n/a' : String(value);
const tone = (value: number | null) => value === null ? 'text-[#8a9189]' : value >= 70 ? 'text-[#16745e]' : value >= 40 ? 'text-[#8a6a00]' : 'text-[#a33a2a]';
const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export default function VisibilityChecker() {
  const [view, setView] = useState<View>({ kind: 'idle' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const started = useRef(0);

  const show = useCallback((result: ApiResult) => {
    if (result.error || !result.id || result.status === 'failed') { setError(result.error ?? 'We could not finish this report. Please try again.'); setView({ kind: 'idle' }); return; }
    if (result.status === 'running') setView({ kind: 'running', id: result.id, progress: result.progress ?? 'site' });
    else if (result.preview) setView({ kind: 'done', id: result.id, preview: result.preview, report: result.report });
    const url = new URL(window.location.href);
    url.searchParams.set('report', result.id);
    window.history.replaceState(null, '', url);
  }, []);

  // A shared or reloaded link reopens its report.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('report');
    if (!id) return;
    started.current = Date.now();
    setView({ kind: 'running', id, progress: 'site' });
    api({ action: 'status', id }).then(show);
  }, [show]);

  const runningId = view.kind === 'running' ? view.id : null;
  useEffect(() => {
    if (!runningId) return;
    const timer = setInterval(async () => {
      if (Date.now() - started.current > GIVE_UP_MS) { setError('This is taking longer than it should. Please try again in a few minutes.'); setView({ kind: 'idle' }); return; }
      const result = await api({ action: 'status', id: runningId });
      // A dropped poll is not a failed report; keep waiting unless the server says otherwise.
      if (result.id) show(result);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [runningId, show]);

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(''); started.current = Date.now();
    show(await api({ action: 'start', url: String(data.get('url') ?? ''), website: String(data.get('website') ?? '') }));
    setBusy(false);
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (view.kind !== 'done') return;
    setBusy(true); setError('');
    const result = await api({ action: 'unlock', id: view.id, email: String(new FormData(event.currentTarget).get('email') ?? '') });
    if (result.error || !result.report) setError(result.error ?? 'We could not unlock the report. Please try again.');
    else show(result);
    setBusy(false);
  }

  function reset() {
    const url = new URL(window.location.href);
    url.searchParams.delete('report');
    window.history.replaceState(null, '', url);
    setError(''); setView({ kind: 'idle' });
  }

  return <section id="instant-report" aria-labelledby="instant-report-title" className="scroll-mt-8 rounded-2xl border border-[#172820]/15 bg-white/70 p-6 md:p-10">
    <p className={eyebrow}>Instant report</p>
    {view.kind === 'idle' && <>
      <h2 id="instant-report-title" className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">See what AI says about your business.</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-[#526055]">Enter your website. We read it the way an AI crawler does, then ask ChatGPT, Claude, and Gemini about you and your category. It takes about a minute.</p>
      <form onSubmit={start} className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row" aria-label="Run an instant AI visibility report">
        <div className="hidden" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="sr-only" htmlFor="visibility-url">Your website address</label>
        <input className={inputClass} id="visibility-url" name="url" type="text" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="yourbusiness.com" required maxLength={300} />
        <button className={buttonClass} type="submit" disabled={busy}>{busy ? 'Starting…' : 'Run the report'}<ArrowUpRight aria-hidden="true" size={18} /></button>
      </form>
      <p className="mt-3 text-sm text-[#526055]">Free. We send your address and public page text to OpenAI, Anthropic, and Google to run the test. <a className="underline underline-offset-4" href="/privacy/">Privacy Policy</a>.</p>
    </>}

    {view.kind === 'running' && <div role="status" aria-live="polite">
      <h2 id="instant-report-title" className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">Running your report…</h2>
      <ol className="mt-6 space-y-3">{STEPS.map(([key, label], index) => {
        const current = STEPS.findIndex(([step]) => step === view.progress);
        const state = index < current ? 'done' : index === current ? 'now' : 'next';
        return <li key={key} className={`flex items-center gap-3 ${state === 'next' ? 'text-[#8a9189]' : 'text-[#172820]'}`}>
          {state === 'done' ? <Check size={18} className="text-[#16745e]" aria-hidden="true" /> : state === 'now' ? <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <span className="inline-block h-[18px] w-[18px] rounded-full border border-[#c5cac4]" aria-hidden="true" />}
          <span>{label}{state === 'now' && <span className="sr-only"> (in progress)</span>}</span>
        </li>;
      })}</ol>
      <p className="mt-6 text-sm text-[#526055]">This usually takes about a minute. You can leave this page open.</p>
    </div>}

    {view.kind === 'done' && <Results preview={view.preview} report={view.report} busy={busy} onUnlock={unlock} onReset={reset} />}
    {error && <p role="alert" className="mt-5 rounded-lg border border-red-800/30 p-4 text-sm text-red-900">{error}</p>}
  </section>;
}

function Results({ preview, report, busy, onUnlock, onReset }: { preview: ReportPreview; report?: Report; busy: boolean; onUnlock: (event: FormEvent<HTMLFormElement>) => void; onReset: () => void }) {
  const { locked } = preview;
  return <div>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
      <div>
        <h2 id="instant-report-title" className="text-2xl font-semibold tracking-tight md:text-3xl">{preview.business.name || preview.domain}</h2>
        <p className="mt-1 text-sm text-[#526055]">{preview.domain}{preview.business.category && ` · ${preview.business.category}`} · {new Date(preview.generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <button type="button" onClick={onReset} className="text-sm font-semibold underline underline-offset-4">Check another site</button>
    </div>
    <div className="mt-8 grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
      <p className="flex items-baseline gap-2"><span className={`text-7xl font-semibold tracking-[-0.05em] ${tone(preview.overall)}`}>{preview.overall}</span><span className="text-xl text-[#526055]">/ 100</span><span className="sr-only"> overall AI visibility score</span></p>
      <p className="max-w-md text-lg leading-snug text-[#172820]">{preview.verdict}</p>
    </div>
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <caption className="sr-only">Scores out of 100 for each assistant</caption>
        <thead><tr className="border-b border-[#172820]/20 text-xs uppercase tracking-[0.12em] text-[#68745b]"><th scope="col" className="py-3 pr-4 font-bold">Assistant</th><th scope="col" className="py-3 pr-4 font-bold">Knows you</th><th scope="col" className="py-3 pr-4 font-bold">Recommends you</th><th scope="col" className="py-3 font-bold">Gets you right</th></tr></thead>
        <tbody>{preview.assistants.map(assistant => <tr key={assistant.id} className="border-b border-[#172820]/10">
          <th scope="row" className="py-4 pr-4 text-base font-semibold">{assistant.label}</th>
          {assistant.failed ? <td colSpan={3} className="py-4 text-[#526055]">Could not be tested this time.</td> : (['recognition', 'discovery', 'accuracy'] as const).map(key => <td key={key} className={`py-4 pr-4 text-xl font-semibold ${tone(assistant.scores[key])}`}>{score(assistant.scores[key])}</td>)}
        </tr>)}
        <tr><th scope="row" className="py-4 pr-4 text-base font-semibold">Your website</th><td colSpan={3} className="py-4"><span className={`text-xl font-semibold ${tone(preview.signalsScore)}`}>{preview.signalsScore}</span><span className="ml-3 text-[#526055]">How readable the site is to AI crawlers</span></td></tr></tbody>
      </table>
    </div>

    {!report && <div className="mt-8 rounded-xl border border-[#172820]/15 bg-[#f4f2ec] p-6 md:p-8">
      <h3 className="flex items-center gap-3 text-xl font-semibold"><Lock size={20} aria-hidden="true" />Unlock the full report</h3>
      <ul className="mt-4 grid gap-2 text-[#526055] sm:grid-cols-2">
        <li>{plural(locked.answers, 'answer', 'answers')} from the assistants, word for word</li>
        <li>{plural(locked.competitors, 'competitor', 'competitors')} named in your category</li>
        <li>{plural(locked.issues, 'gap or error', 'gaps and errors')} in how you are described</li>
        <li>{plural(locked.failedChecks, 'technical check', 'technical checks')} your site did not pass</li>
        <li>{plural(locked.recommendations, 'recommended change', 'recommended changes')}, in priority order</li>
      </ul>
      <form onSubmit={onUnlock} className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row" aria-label="Unlock the full report">
        <label className="sr-only" htmlFor="visibility-email">Your email address</label>
        <input className={inputClass} id="visibility-email" name="email" type="email" autoComplete="email" placeholder="you@yourbusiness.com" required maxLength={254} />
        <button className={buttonClass} type="submit" disabled={busy}>{busy ? 'Unlocking…' : 'Show the full report'}</button>
      </form>
      <p className="mt-3 text-sm text-[#526055]">The report opens here straight away. We keep your email with this report and may follow up about the results. <a className="underline underline-offset-4" href="/privacy/">Privacy Policy</a>.</p>
    </div>}

    {report && <FullReport report={report} />}
    <p className="mt-8 text-sm leading-relaxed text-[#526055]">{preview.method}</p>
  </div>;
}

function Sources({ citations }: { citations: Array<{ url: string; title?: string }> }) {
  if (!citations.length) return null;
  return <p className="mt-2 text-sm text-[#526055]">Sources: {citations.slice(0, 6).map((citation, index) => <span key={citation.url}>{index > 0 && ', '}<a className="underline underline-offset-2" href={citation.url} target="_blank" rel="noopener noreferrer nofollow">{citation.title?.slice(0, 50) || host(citation.url)}</a></span>)}</p>;
}

function FullReport({ report }: { report: Report }) {
  return <div className="mt-10 space-y-12">
    <div>
      <h3 className="text-xl font-semibold">What to change first</h3>
      {report.recommendations.length ? <ol className="mt-4 space-y-4">{report.recommendations.map(item => <li key={item.title} className="border-l-2 border-[#16745e] pl-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#68745b]">{item.priority} priority</p>
        <p className="mt-1 font-semibold text-[#172820]">{item.title}</p><p className="mt-1 text-[#526055]">{item.detail}</p>
      </li>)}</ol> : <p className="mt-3 text-[#526055]">Nothing urgent turned up in this run.</p>}
    </div>

    <div>
      <h3 className="text-xl font-semibold">What each assistant said</h3>
      <div className="mt-4 space-y-6">{report.assistants.map(assistant => <article key={assistant.id} className="rounded-xl border border-[#172820]/15 p-5 md:p-6">
        <h4 className="text-lg font-semibold">{assistant.label}</h4>
        {assistant.error ? <p className="mt-2 text-[#526055]">{assistant.error}</p> : <>
          {assistant.summary && <p className="mt-2 text-[#172820]">{assistant.summary}</p>}
          {assistant.issues.length > 0 && <><p className={`${eyebrow} mt-5`}>Gaps and errors</p><ul className="mt-2 list-disc space-y-1 pl-5 text-[#526055]">{assistant.issues.map(issue => <li key={issue}>{issue}</li>)}</ul></>}
          {assistant.competitors.length > 0 && <><p className={`${eyebrow} mt-5`}>Others it recommended</p><p className="mt-2 text-[#526055]">{assistant.competitors.join(', ')}</p></>}
          <details className="mt-5"><summary className="cursor-pointer font-semibold underline underline-offset-4">Asked: “What is {report.profile.name}?”</summary>
            <p className="mt-3 whitespace-pre-wrap text-[#526055]">{assistant.recognitionAnswer || 'No answer was returned.'}</p><Sources citations={assistant.recognitionCitations} /></details>
          {assistant.discovery.map(item => <details key={item.query} className="mt-3"><summary className="cursor-pointer font-semibold underline underline-offset-4">Asked: “{item.query}” <span className={item.mentioned ? 'text-[#16745e]' : 'text-[#a33a2a]'}>({item.mentioned ? 'you were mentioned' : 'you were not mentioned'})</span></summary>
            <p className="mt-3 whitespace-pre-wrap text-[#526055]">{item.answer}</p><Sources citations={item.citations} /></details>)}
          {!assistant.searched && <p className="mt-4 text-sm text-[#526055]">This assistant answered from what it already knew, without searching the web.</p>}
        </>}
      </article>)}</div>
    </div>

    <div>
      <h3 className="text-xl font-semibold">How readable your site is</h3>
      <ul className="mt-4 divide-y divide-[#172820]/10">{report.signals.checks.map(check => <li key={check.id} className="flex gap-3 py-3">
        {check.passed ? <Check size={20} className="mt-0.5 shrink-0 text-[#16745e]" aria-hidden="true" /> : <X size={20} className="mt-0.5 shrink-0 text-[#a33a2a]" aria-hidden="true" />}
        <div><p className="font-semibold text-[#172820]">{check.label}<span className="sr-only">: {check.passed ? 'passed' : 'not passed'}</span></p><p className="text-sm text-[#526055]">{check.detail}</p></div>
      </li>)}</ul>
    </div>

    <div className="rounded-xl bg-[#172820] p-6 text-[#f4f2ec] md:p-8">
      <h3 className="text-xl font-semibold">Want this done properly?</h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-[#d6dccf]">This instant report asks each assistant three questions, once. The full AI Brand Visibility Report uses a prompt set written for your customers, repeats it to account for variation, compares you with named competitors, and ends in a working session on what to fix.</p>
      <a href="#contact" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4">Ask about the full report <ArrowUpRight aria-hidden="true" size={18} /></a>
    </div>
  </div>;
}
