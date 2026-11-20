import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { summarizeCost, type UsageEntry } from '../../../supabase/functions/visibility-report/core/cost';

interface CostReport {
  id: string; domain: string; url: string; status: string; created_at: string; reused_from: string | null;
  cost_tracking_started_at: string | null; cost_tracking_finished_at: string | null;
  visibility_report_usage: UsageEntry[];
}
const money = (value: number | null) => value === null ? 'Unavailable' : `$${value.toFixed(4)}`;

export default function VisibilityCosts() {
  const [rows, setRows] = useState<CostReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [starting, setStarting] = useState(false);
  const [freshReport, setFreshReport] = useState('');
  async function runFresh(url: string) {
    setStarting(true); setError(''); setFreshReport('');
    try {
      const { data, error } = await supabase.functions.invoke('visibility-report', { body: { action: 'start', url, fresh: true } });
      if (error) {
        let message = 'Could not start a fresh report. Try signing in again.';
        if (error.context instanceof Response) message = (await error.context.json().catch(() => ({}))).error || message;
        throw new Error(message);
      }
      if (!data?.id) throw new Error('The report could not be started.');
      setFreshReport(data.id); setRefresh(n => n + 1);
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not start a fresh report.'); }
    finally { setStarting(false); }
  }
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    supabase.from('visibility_reports')
      .select('id,domain,url,status,created_at,reused_from,cost_tracking_started_at,cost_tracking_finished_at,visibility_report_usage(*)')
      .order('created_at', { ascending: false }).range(page * 25, page * 25 + 24)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError('Could not load report costs. Try refreshing.');
        else setRows((data ?? []) as CostReport[]);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, refresh]);
  return <section className="bg-white border-2 border-ink p-6 shadow-brutal-sm">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-2xl font-extrabold">Visibility report costs</h2>
      <button onClick={() => setRefresh(n => n + 1)} disabled={loading} className="border border-ink px-4 py-2">Refresh</button>
    </div>
    <p className="mt-3 text-sm">Calculated API cost in USD, using provider-reported tokens and the saved rate card for each call. Includes analysis calls and retries. This is not an invoice: taxes, hosting, credits and account discounts are excluded. Google search is estimated from returned queries at paid rates; its free allowance may reduce your bill.</p>
    <p className="mt-2 text-sm">Cached reports incur $0 in new AI calls. Older reports without usage records are unavailable. Partial totals show known charges only; failed or interrupted calls may have additional charges.</p>
    {freshReport && <p role="status" className="mt-4">Fresh report started. <a className="underline" href={`/ai-visibility/?report=${freshReport}`} target="_blank" rel="noreferrer">View progress and report</a>. Refresh costs after it finishes.</p>}
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {loading ? <p role="status" className="mt-6">Loading costs…</p> : !error && <>
      {!rows.length && <p className="mt-6">No reports on this page.</p>}
      <div className="mt-6 space-y-4">{rows.map(row => {
        const cost = summarizeCost(row);
        return <details key={row.id} className="border border-ink/20 p-4">
          <summary className="cursor-pointer">
            <strong>{row.domain}</strong> — {cost.state === 'untracked' ? 'Not tracked' : cost.state === 'partial' ? `${money(cost.known)} known · incomplete` : `${money(cost.total)}${cost.state === 'cached' ? ' · cached' : ' calculated'}`}
            <span className="block text-sm mt-1">{new Date(row.created_at).toLocaleString()} · {row.status} · {cost.calls.length} API attempts</span>
          </summary>
          <p className="text-sm mt-3">Report ID: {row.id}</p>
          <button className="block border border-ink px-3 py-2 my-3 disabled:opacity-40" disabled={starting || row.status === 'running'} onClick={() => runFresh(row.url)}>Run fresh report (new API charges)</button>
          {row.status === 'complete' && <a className="underline text-sm" href={`/ai-visibility/?report=${row.id}`} target="_blank" rel="noreferrer">Open report</a>}
          {row.reused_from && <p className="text-sm mt-2">Reused report: {row.reused_from}. The original generation cost is recorded on that report, not charged again here.</p>}
          {cost.calls.length > 0 && <div className="overflow-x-auto mt-4"><table className="w-full text-sm text-left">
            <caption className="text-left font-bold mb-2">API calls and cost breakdown</caption>
            <thead><tr>{['Provider / model', 'Purpose / status', 'Input / cached / output', 'Searches', 'Tokens USD', 'Search USD', 'Total USD'].map(label => <th key={label} className="p-2 border-b">{label}</th>)}</tr></thead>
            <tbody>{cost.calls.slice().sort((a,b) => a.started_at.localeCompare(b.started_at)).map(call => <tr key={call.id}>
              <td className="p-2 align-top">{call.provider}<br />{call.model}<br /><span className="text-xs">Rates: {call.pricing_version}</span></td>
              <td className="p-2 align-top">{call.purpose}<br />{call.status}{call.http_status ? ` (${call.http_status})` : ''}</td>
              <td className="p-2 align-top">{call.input_tokens ?? '—'} / {call.cached_tokens ?? '—'} / {call.output_tokens ?? '—'}<br /><span className="text-xs">Reasoning: {call.reasoning_tokens ?? '—'} (included in output)</span></td>
              <td className="p-2 align-top">{call.searches ?? '—'}<br /><span className="text-xs">{call.search_basis}</span></td>
              <td className="p-2 align-top">{money(call.token_cost_usd)}</td><td className="p-2 align-top">{money(call.search_cost_usd)}</td>
              <td className="p-2 align-top">{money(call.estimated_cost_usd)}{call.notes.map((note,i) => <p key={i} className="text-xs mt-1">{note}</p>)}</td>
            </tr>)}</tbody>
          </table></div>}
        </details>;
      })}</div>
    </>}
    <div className="flex gap-4 mt-6"><button className="border px-3 py-2 disabled:opacity-40" disabled={page === 0 || loading} onClick={() => setPage(n => n - 1)}>Newer reports</button><button className="border px-3 py-2 disabled:opacity-40" disabled={rows.length < 25 || loading} onClick={() => setPage(n => n + 1)}>Older reports</button></div>
  </section>;
}
