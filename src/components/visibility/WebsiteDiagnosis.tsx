import type { Report, WebsiteAudit } from '../../../supabase/functions/visibility-report/core/types';

const label = 'text-xs font-bold uppercase tracking-[0.12em] text-[#68745b]';
const link = 'underline underline-offset-4 [overflow-wrap:anywhere]';
export default function WebsiteDiagnosis({ audit, report }: { audit: WebsiteAudit; report: Report }) {
  const evidence = [...audit.pages, ...audit.resources];
  function references(ids: string[]) {
    return ids.map(id => {
      const source = evidence.find(e => e.id === id);
      return source ? <a key={id} href={source.url} target="_blank" rel="noopener noreferrer" className={`${link} mr-3`}>{source.url}</a>
        : <span key={id}>Assistant answer: {id} (see the questions and sources below)</span>;
    });
  }
  return <section className="space-y-8 [overflow-wrap:anywhere]" aria-label="Your website diagnosis and action plan">
    <div><p className={label}>Your business · inferred from public pages</p><h3 className="mt-2 text-2xl font-semibold">{report.profile.name}</h3>
      <p className="mt-3">{report.profile.summary}</p><p className="mt-2 text-[#526055]">Customers and service area: {report.profile.audience || 'Not established from the sampled content.'}</p>
      <p className="mt-3 text-sm text-[#526055]">If this description is wrong, correct your business profile in your workspace and include the correction when requesting help. This saved report is a dated snapshot; editing your profile does not rerun its tests.</p>
    </div>
    <div><h3 className="text-xl font-semibold">Your diagnosis</h3><p className="mt-2 text-sm text-[#526055]">Automated interpretation of this sample. Suggested business effects and causes are hypotheses to verify, not measured outcomes.</p><p className="mt-3 leading-relaxed text-[#526055]">{audit.summary}</p>
      {audit.status === 'partial' && <p className="mt-3 font-semibold">Partial investigation: review coverage and limitations below before acting.</p>}
      <p className="mt-3 text-sm">{audit.pages.filter(p => p.readable).length} of {audit.pages.length} sampled pages read · {audit.discovered.length} page links discovered · {new Date(audit.checkedAt).toLocaleDateString('en-US')}</p>
    </div>
    {audit.strengths.length > 0 && <div><h3 className="text-xl font-semibold">Keep what already works</h3><ul className="mt-4 space-y-4">{audit.strengths.map((s, i) => <li key={i}><p>{s.detail}</p><p className="mt-1 text-sm text-[#526055]">{references(s.evidenceIds)}</p></li>)}</ul></div>}
    <div><h3 className="text-xl font-semibold">Your prioritized action plan</h3><p className="mt-2 text-sm text-[#526055]">Observed findings describe this fetch only. “Verify first” and “Opportunity” are automated interpretations, not confirmed defects. Draft wording needs your factual approval.</p>
      <ol className="mt-5 space-y-5">{audit.actions.map((a, i) => <li key={i} className="rounded-xl border border-[#172820]/15 bg-white p-5 md:p-6">
        <p className={label}>{a.priority} priority · {a.classification === 'observed' ? 'Observed in fetched HTML' : a.classification === 'verify' ? 'Verify first' : 'Opportunity'}</p>
        <h4 className="mt-2 text-lg font-semibold">{i + 1}. {a.title}</h4><p className="mt-3 text-[#526055]">{a.observation}</p>
        <p className="mt-2 text-sm">Evidence: {references(a.evidenceIds)}</p>
        <p className="mt-4"><strong>Why it matters: </strong>{a.why}</p>
        <p className="mt-4 font-semibold">What to do</p><ol className="mt-2 list-decimal space-y-2 pl-5">{a.steps.map((step, j) => <li key={j}>{step}</li>)}</ol>
        {a.example && <details className="mt-4"><summary className="cursor-pointer py-2 font-semibold">Suggested wording or implementation example</summary><p className="mt-2 whitespace-pre-wrap rounded-lg bg-[#f2f8fc] p-4">{a.example}</p></details>}
        <p className="mt-4 text-sm"><strong>Who: </strong>{a.owner}{a.effort && <> · <strong>Effort: </strong>{a.effort}</>}</p>
        <p className="mt-3"><strong>How to verify: </strong>{a.validation}</p>
      </li>)}</ol>
      {!audit.actions.length && <p className="mt-4">No grounded action plan could be generated from this evidence. Missing information is not a clean bill of health.</p>}
    </div>
    <details className="rounded-xl border border-[#172820]/15 p-5"><summary className="cursor-pointer py-2 text-lg font-semibold">Pages, files and exact coverage</summary>
      <p className="mt-3 text-sm">These are bounded, initial-HTML reads. Discovered links were not all fetched. A missing field in this sample is not proof it is absent everywhere.</p>
      <ul className="mt-4 space-y-5">{audit.pages.map(p => <li key={p.id}><a className={link} href={p.url} target="_blank" rel="noopener noreferrer">{p.url}</a><p className="mt-1 text-sm">{p.readable ? `Read · HTTP ${p.status} · approximately ${p.wordCount} words` : `Not read · ${p.status ? `HTTP ${p.status}` : 'fetch unavailable'}`}</p>
        {p.readable && <><p className="mt-1 text-sm">Title: {p.title || 'Not detected'}<br/>Main heading: {p.h1 || 'Not detected'}<br/>Schema types: {p.schemaTypes.join(', ') || 'None detected in this fetch'}<br/>Canonical: {p.canonical || 'Not detected'}</p><details className="mt-2"><summary className="cursor-pointer py-2">Read the captured excerpt</summary><p className="mt-2 whitespace-pre-wrap text-sm text-[#526055]">{p.excerpt}</p></details></>}
      </li>)}</ul>
      <h4 className="mt-6 font-semibold">Standard files</h4><ul className="mt-2 space-y-3">{audit.resources.map(r => <li key={r.id}><a className={link} href={r.url} target="_blank" rel="noopener noreferrer">{r.id}</a> — {r.readable ? 'Read' : 'Unavailable or unreadable'}{r.status ? ` (HTTP ${r.status})` : ''}{r.readable && <details><summary className="cursor-pointer py-2">Captured excerpt</summary><pre className="whitespace-pre-wrap text-sm">{r.excerpt}</pre></details>}</li>)}</ul>
      <h4 className="mt-6 font-semibold">Discovered URLs (not all inspected)</h4><ul className="mt-2 space-y-2 text-sm">{audit.discovered.map(u => <li key={u}><a className={link} href={u} target="_blank" rel="noopener noreferrer">{u}</a></li>)}</ul>
    </details>
    <div><h3 className="text-xl font-semibold">What this report cannot establish</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#526055]">{audit.limitations.map(l => <li key={l}>{l}</li>)}</ul></div>
  </section>;
}
