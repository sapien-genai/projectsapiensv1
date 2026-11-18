/** URL handling for a public tool that fetches whatever address a stranger types in. */

export class InputError extends Error {}

const BLOCKED_SUFFIXES = ['.local', '.internal', '.localhost', '.lan', '.home', '.corp', '.test', '.invalid', '.example'];

/** Accepts "example.com", "www.example.com/about" or a full URL; returns an https URL and its bare domain. */
export function normalizeUrl(input: string): { url: string; domain: string } {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 300) throw new InputError('Enter a website address, such as example.com.');
  let parsed: URL;
  try { parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`); }
  catch { throw new InputError('That does not look like a website address.'); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new InputError('Only http and https addresses can be checked.');
  if (parsed.username || parsed.password) throw new InputError('Remove the username or password from the address.');
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') throw new InputError('Only standard web ports can be checked.');
  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
  if (!isPublicHostname(host)) throw new InputError('Enter a public website address.');
  const domain = host.replace(/^www\./, '');
  const path = parsed.pathname === '/' ? '/' : parsed.pathname;
  return { url: `https://${host}${path}`, domain };
}

export function isPublicHostname(host: string): boolean {
  if (!host.includes('.') || host.length > 253) return false;
  if (host.includes(':') || host.startsWith('[')) return false; // IPv6 literals
  if (/^[\d.]+$/.test(host) || /^0x/i.test(host)) return false; // IPv4 literals, in any notation
  if (BLOCKED_SUFFIXES.some(suffix => host === suffix.slice(1) || host.endsWith(suffix))) return false;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host);
}

/** True for loopback, private, link-local, carrier-grade NAT, multicast and reserved addresses. */
export function isPrivateAddress(address: string): boolean {
  const ip = address.toLowerCase();
  if (ip.includes(':')) {
    // The URL parser canonicalizes expanded and dotted IPv6 forms to hex.
    // Conservatively allow only global unicast IPv6, excluding mapped IPv4,
    // translation/tunnelling and special-purpose ranges.
    let canonical: string;
    try { canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1); }
    catch { return true; }
    if (!/^[23][0-9a-f]{3}:/.test(canonical)) return true;
    return /^2001:(?:[0-1]?[0-9a-f]{0,2}|db8):/.test(canonical) || canonical.startsWith('2002:') || canonical.startsWith('3fff:');
  }
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
    || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19));
}

export type ResolveHost = (host: string) => Promise<string[]>;

export interface SafeFetchOptions { resolveHost: ResolveHost; fetchImpl?: typeof fetch; timeoutMs?: number; maxBytes?: number; maxRedirects?: number; accept?: string }
export interface SafeResponse { ok: boolean; status: number; url: string; contentType: string; body: string }

/**
 * Fetches a public page without letting the target steer us at internal addresses:
 * every hop is re-validated, redirects are followed by hand, and the body is size-capped.
 */
export async function safeFetch(target: string, options: SafeFetchOptions): Promise<SafeResponse> {
  const { resolveHost, fetchImpl = fetch, timeoutMs = 10000, maxBytes = 600_000, maxRedirects = 4, accept = 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5' } = options;
  let current = target;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    const parsed = new URL(current);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new InputError('Redirected to an unsupported address.');
    if (parsed.username || parsed.password || (parsed.port && !['80', '443'].includes(parsed.port))) throw new InputError('Redirected to an unsupported web address.');
    const host = parsed.hostname.toLowerCase();
    if (!isPublicHostname(host)) throw new InputError('The site redirected to a non-public address.');
    const addresses = await resolveHost(host);
    if (!addresses.length || addresses.some(isPrivateAddress)) throw new InputError('That address does not resolve to a public website.');
    const response = await fetchImpl(current, {
      redirect: 'manual', signal: AbortSignal.timeout(timeoutMs),
      headers: { 'User-Agent': 'ProjectSapiensVisibilityCheck/1.0 (+https://www.projectsapiens.ai/ai-visibility/)', Accept: accept },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) return { ok: false, status: response.status, url: current, contentType: '', body: '' };
      current = new URL(location, current).toString();
      continue;
    }
    return { ok: response.ok, status: response.status, url: current, contentType: response.headers.get('content-type') ?? '', body: await readCapped(response, maxBytes) };
  }
  throw new InputError('The site redirected too many times.');
}

async function readCapped(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); total += value.length;
  }
  await reader.cancel().catch(() => {});
  const merged = new Uint8Array(Math.min(total, maxBytes));
  let offset = 0;
  for (const chunk of chunks) { const part = chunk.subarray(0, merged.length - offset); merged.set(part, offset); offset += part.length; if (offset >= merged.length) break; }
  return new TextDecoder('utf-8', { fatal: false }).decode(merged);
}
