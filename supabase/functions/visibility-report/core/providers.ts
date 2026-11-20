import { newUsage, priceUsage, type CostProvider, type UsageEntry } from './cost.ts';
import type { Ask, AssistantAnswer, AssistantId, Citation, Complete } from './types.ts';

/**
 * Thin adapters over each provider's HTTP API. Each asks a question with the
 * provider's own web search switched on, because that is closest to what a
 * person sees in the consumer app. If a search-enabled call is rejected
 * (model or account without search), the question is retried without it and
 * the answer is flagged as unsearched.
 */

export interface ProviderConfig { completionMaxTokens?: number; citationLimit?: number; apiKey: string; model: string; webSearch: boolean; fetchImpl?: typeof fetch; timeoutMs?: number; purpose?: UsageEntry['purpose']; onUsage?: (entry: UsageEntry) => Promise<void> }
export interface Provider { id: AssistantId; label: string; model: string; ask: Ask; complete: Complete }

class ProviderError extends Error { constructor(message: string, public status: number) { super(message); } }

async function post(url: string, headers: Record<string, string>, body: any, config: ProviderConfig, provider: CostProvider): Promise<any> {
  let entry = newUsage(provider, config.model, config.purpose ?? 'assistant');
  // Persist before paid work. A terminated worker leaves a pending, explicitly unknown cost.
  await config.onUsage?.(entry);
  let data: any;
  try {
    const response = await (config.fetchImpl ?? fetch)(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
      signal: AbortSignal.timeout(config.timeoutMs ?? 75000),
    });
    entry.http_status = response.status;
    data = await response.json().catch(() => null);
    if (!response.ok) {
      console.warn('visibility provider HTTP error', { host: new URL(url).hostname, model: config.model, status: response.status });
      throw new ProviderError(`Provider returned HTTP ${response.status}`, response.status);
    }
    if (!data) throw new Error('Provider returned invalid JSON');
    entry = priceUsage(entry, data, Boolean(body.tools?.length));
    entry.status = 'succeeded';
    return data;
  } catch (error) {
    if (data?.usage || data?.usageMetadata) entry = priceUsage(entry, data, Boolean(body.tools?.length));
    entry.status = 'failed';
    entry.notes.push('Failed attempt; final billing may be unknown.');
    throw error;
  } finally {
    entry.finished_at = new Date().toISOString();
    await config.onUsage?.(entry);
  }
}

const dedupe = (citations: Citation[], limit = 12) => [...new Map(citations.filter(c => /^https?:\/\//.test(c.url)).map(c => [c.url, c])).values()].slice(0, limit);

async function withSearchFallback(config: ProviderConfig, run: (search: boolean) => Promise<Omit<AssistantAnswer, 'model'>>): Promise<AssistantAnswer> {
  if (config.webSearch) {
    try { return { ...(await run(true)), model: config.model }; }
    catch (error) { if (!(error instanceof ProviderError) || ![400, 403, 404, 422].includes(error.status)) throw error; }
  }
  return { ...(await run(false)), model: config.model };
}

export function openai(config: ProviderConfig): Provider {
  const call = async (prompt: string, search: boolean, maxTokens: number) => {
    const data = await post('https://api.openai.com/v1/responses', { Authorization: `Bearer ${config.apiKey}` },
      { model: config.model, input: prompt, max_output_tokens: maxTokens, ...(search ? { tools: [{ type: 'web_search' }] } : {}) }, config, 'openai');
    const parts = (data.output ?? []).filter((item: any) => item.type === 'message').flatMap((item: any) => item.content ?? []).filter((part: any) => part.type === 'output_text');
    return {
      text: parts.map((part: any) => part.text ?? '').join('\n').trim(),
      citations: dedupe(parts.flatMap((part: any) => part.annotations ?? []).filter((a: any) => a.type === 'url_citation').map((a: any) => ({ url: a.url, title: a.title })), config.citationLimit ?? 12),
      searched: search && (data.output ?? []).some((item: any) => item.type === 'web_search_call'),
    };
  };
  return { id: 'chatgpt', label: 'ChatGPT', model: config.model,
    ask: prompt => withSearchFallback(config, search => call(prompt, search, 4000)),
    complete: async prompt => (await call(prompt, false, config.completionMaxTokens ?? 4000)).text };
}

export function anthropic(config: ProviderConfig): Provider {
  const call = async (prompt: string, search: boolean, maxTokens: number) => {
    const data = await post('https://api.anthropic.com/v1/messages', { 'x-api-key': config.apiKey, 'anthropic-version': '2023-06-01' },
      { model: config.model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }],
        ...(search ? { tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }] } : {}) }, config, 'anthropic');
    const blocks: any[] = data.content ?? [];
    const text = blocks.filter(block => block.type === 'text');
    return {
      text: text.map(block => block.text ?? '').join('').trim(),
      citations: dedupe(text.flatMap(block => block.citations ?? []).filter((c: any) => c.url).map((c: any) => ({ url: c.url, title: c.title })), config.citationLimit ?? 12),
      searched: search && blocks.some(block => block.type === 'server_tool_use'),
    };
  };
  return { id: 'claude', label: 'Claude', model: config.model,
    ask: prompt => withSearchFallback(config, search => call(prompt, search, 1500)),
    complete: async prompt => (await call(prompt, false, config.completionMaxTokens ?? 2000)).text };
}

export function gemini(config: ProviderConfig): Provider {
  const call = async (prompt: string, search: boolean, maxTokens: number) => {
    const data = await post(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`, { 'x-goog-api-key': config.apiKey },
      { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens }, ...(search ? { tools: [{ google_search: {} }] } : {}) }, config, 'gemini');
    const candidate = data.candidates?.[0] ?? {};
    const grounding = candidate.groundingMetadata ?? {};
    return {
      text: (candidate.content?.parts ?? []).map((part: any) => part.text ?? '').join('').trim(),
      citations: dedupe((grounding.groundingChunks ?? []).filter((chunk: any) => chunk.web?.uri).map((chunk: any) => ({ url: chunk.web.uri, title: chunk.web.title })), config.citationLimit ?? 12),
      searched: search && Boolean(grounding.webSearchQueries?.length || grounding.groundingChunks?.length),
    };
  };
  return { id: 'gemini', label: 'Gemini', model: config.model,
    ask: prompt => withSearchFallback(config, search => call(prompt, search, 4000)),
    complete: async prompt => (await call(prompt, false, config.completionMaxTokens ?? 4000)).text };
}
