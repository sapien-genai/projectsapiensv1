/* eslint-disable @typescript-eslint/no-explicit-any -- Provider response shapes are validated at the numeric boundary. */
/** USD standard list prices checked 2026-11-18. Never presented as an invoice. */
export const PRICING_VERSION = '2026-11-18.2';
export type CostProvider = 'openai' | 'anthropic' | 'gemini';
export interface UsageEntry {
  id: string; provider: CostProvider; requested_model: string; model: string;
  purpose: 'assistant' | 'analysis'; status: 'pending' | 'succeeded' | 'failed';
  started_at: string; finished_at: string | null; http_status: number | null;
  input_tokens: number | null; cached_tokens: number | null; output_tokens: number | null;
  reasoning_tokens: number | null; cache_write_tokens: number | null;
  searches: number | null; search_basis: string; token_cost_usd: number | null;
  search_cost_usd: number | null; estimated_cost_usd: number | null;
  pricing_version: string; rates: Record<string, number> | null;
  usage: Record<string, unknown> | null; notes: string[];
}
const count = (value: unknown): number | null => typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
const object = (value: unknown): Record<string, any> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
const round = (n: number) => Math.round(n * 1e9) / 1e9;

export function priceUsage(entry: UsageEntry, payload: unknown, searchEnabled: boolean): UsageEntry {
  const data = object(payload);
  const usage = object(entry.provider === 'gemini' ? data.usageMetadata : data.usage);
  const model = String(data.model ?? data.modelVersion ?? entry.requested_model);
  let input: number | null = null, output: number | null = null, cached = 0, writes = 0, reasoning = 0, searches: number | null = searchEnabled ? null : 0;
  let searchBasis = searchEnabled ? 'unavailable' : 'disabled';
  let rates: Record<string, number> | null = null;
  const notes: string[] = [];
  if (entry.provider === 'openai') {
    input = count(usage.input_tokens); output = count(usage.output_tokens);
    cached = count(usage.input_tokens_details?.cached_tokens) ?? 0;
    reasoning = count(usage.output_tokens_details?.reasoning_tokens) ?? 0; // already included in output_tokens
    if (searchEnabled && Array.isArray(data.output)) {
      searches = data.output.filter((v: any) => v.type === 'web_search_call').length; searchBasis = 'response tool calls';
    }
    if (/^gpt-5\.5(?:-\d{4}-\d{2}-\d{2})?$/.test(model)) rates = { input: 5, cached: 0.5, output: 30, search: 0.01, cacheWrite: 5 };
    if (input !== null && input > 272000 && rates) rates = { ...rates, input: 10, cached: 1, output: 45, cacheWrite: 10 };
  } else if (entry.provider === 'anthropic') {
    input = count(usage.input_tokens); output = count(usage.output_tokens);
    cached = count(usage.cache_read_input_tokens) ?? 0;
    writes = count(usage.cache_creation_input_tokens) ?? 0;
    if (input !== null) input += cached + writes; // Anthropic reports these separately
    reasoning = count(usage.output_tokens_details?.thinking_tokens) ?? 0;
    if (searchEnabled) {
      searches = count(usage.server_tool_use?.web_search_requests);
      searchBasis = searches === null ? 'unavailable' : 'provider usage';
      if (searches === null && Array.isArray(data.content) && data.stop_reason === 'end_turn') {
        searches = data.content.filter((block: any) => block.type === 'server_tool_use' && block.name === 'web_search').length;
        searchBasis = 'response tool calls (estimate)';
        notes.push('Search count inferred from completed response tool calls because provider search usage was omitted.');
      }
    }
    if (/^claude-sonnet-5-5(?:-\d{8})?$/.test(model)) rates = { input: 2, cached: 0.1, output: 10, search: 0.01, cacheWrite: 2.5 };
    if (writes > 0 && count(usage.cache_creation?.ephemeral_1h_input_tokens)) {
      // Requests currently never enable prompt caching; do not assume a TTL if that changes.
      rates = null; notes.push('One-hour cache writes require a supported rate calculation.');
    }
  } else {
    input = count(usage.promptTokenCount);
    if (input !== null) input += count(usage.toolUsePromptTokenCount) ?? 0;
    output = count(usage.candidatesTokenCount ?? usage.responseTokenCount);
    reasoning = count(usage.thoughtsTokenCount) ?? 0;
    if (output !== null) output += reasoning;
    cached = count(usage.cachedContentTokenCount) ?? 0;
    if (searchEnabled) {
      const candidates = Array.isArray(data.candidates) ? data.candidates : [];
      const queries = candidates.flatMap((v: any) => v.groundingMetadata?.webSearchQueries ?? []);
      searches = queries.length || (candidates.length > 0 && candidates.every((v: any) => v.finishReason === 'STOP' && !v.groundingMetadata) ? 0 : null);
      searchBasis = 'grounding queries (estimate)';
      notes.push('Google search cost uses returned queries at paid list price; monthly free allowance and billing counts may differ.');
    }
    if (/^gemini-3\.5-flash(?:-\d{3})?$/.test(model)) rates = { input: 1.5, cached: 0.15, output: 9, search: 0.014, cacheWrite: 1.5 };
    if (/^gemini-3\.6-flash(?:-\d{3})?$/.test(model)) {
      const date = Date.parse(entry.started_at);
      if (Number.isFinite(date)) {
        const inputRate = date < Date.parse('2027-01-01T00:00:00Z') ? 0.75 : 1.5;
        rates = { input: inputRate, cached: inputRate / 10, output: inputRate * 5, search: 0.014, cacheWrite: inputRate };
      }
    }
  }
  const tier = data.service_tier ?? usage.service_tier ?? usage.serviceTier;
  if (tier && tier !== 'default' && tier !== 'standard') { rates = null; notes.push('Nonstandard service tier is not priced.'); }
  const validTokens = input !== null && output !== null && input >= cached + writes;
  const tokenCost = rates && validTokens ? round(((input! - cached - writes) * rates.input + cached * rates.cached + writes * rates.cacheWrite + output! * rates.output) / 1e6) : null;
  const searchCost = searches !== null ? round(searches * (entry.provider === 'gemini' ? 0.014 : 0.01)) : null;
  if (!rates) notes.push('Model rate unavailable; do not interpret missing cost as zero.');
  if (!validTokens) notes.push('Token usage unavailable or inconsistent.');
  if (searchCost === null) notes.push('Search usage unavailable.');
  return { ...entry, model, input_tokens: input, output_tokens: output, cached_tokens: cached, cache_write_tokens: writes,
    reasoning_tokens: reasoning, searches, search_basis: searchBasis, token_cost_usd: tokenCost, search_cost_usd: searchCost,
    estimated_cost_usd: tokenCost !== null && searchCost !== null ? round(tokenCost + searchCost) : null,
    usage: Object.keys(usage).length ? usage : null, rates, notes };
}

export function newUsage(provider: CostProvider, model: string, purpose: UsageEntry['purpose']): UsageEntry {
  return { id: crypto.randomUUID(), provider, requested_model: model, model, purpose, status: 'pending', started_at: new Date().toISOString(), finished_at: null, http_status: null,
    input_tokens: null, cached_tokens: null, cache_write_tokens: null, output_tokens: null, reasoning_tokens: null, searches: null, search_basis: 'unavailable',
    token_cost_usd: null, search_cost_usd: null, estimated_cost_usd: null, pricing_version: PRICING_VERSION, rates: null, usage: null, notes: [] };
}

export function summarizeCost(row: { reused_from: string | null; cost_tracking_started_at: string | null; cost_tracking_finished_at: string | null; visibility_report_usage?: UsageEntry[] }) {
  const calls = row.visibility_report_usage ?? [];
  if (row.reused_from) return { state: 'cached', total: 0, known: 0, calls };
  if (!row.cost_tracking_started_at) return { state: 'untracked', total: null, known: 0, calls };
  const known = round(calls.reduce((sum, call) => sum + (call.token_cost_usd ?? 0) + (call.search_cost_usd ?? 0), 0));
  const complete = Boolean(row.cost_tracking_finished_at) && calls.every(call => call.status === 'succeeded' && call.estimated_cost_usd !== null);
  return { state: complete ? 'calculated' : 'partial', total: complete ? known : null, known, calls };
}
