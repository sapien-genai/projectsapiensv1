import type { SignalCheck, SiteSignals } from './types.ts';
import { safeFetch, type SafeFetchOptions } from './url.ts';

/** Crawlers the major assistants use to read and cite the web. */
export const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'Google-Extended', 'PerplexityBot'];

const PAGE_FURNITURE = new Set(['WebPage', 'CollectionPage', 'ItemPage', 'AboutPage', 'ContactPage', 'FAQPage', 'Question', 'Answer', 'BreadcrumbList', 'ItemList', 'ListItem', 'ImageObject', 'VideoObject', 'MediaObject', 'SearchAction', 'ReadAction', 'EntryPoint', 'SiteNavigationElement', 'WPHeader', 'WPFooter', 'Article', 'BlogPosting', 'NewsArticle', 'Thing']);

const decode = (value: string) => value
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
const clean = (value: string) => decode(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function metaContent(html: string, key: string): string {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (new RegExp(`(?:name|property)\\s*=\\s*["']${key}["']`, 'i').test(tag)) {
      const content = tag.match(/content\s*=\s*"([^"]*)"/i) ?? tag.match(/content\s*=\s*'([^']*)'/i);
      if (content) return clean(content[1]);
    }
  }
  return '';
}

/** The text a crawler gets without running JavaScript. */
export function visibleText(html: string): string {
  const body = html.match(/<body\b[\s\S]*$/i)?.[0] ?? html;
  return clean(body.replace(/<(script|style|noscript|template|svg|iframe)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' '));
}

export function structuredDataTypes(html: string): string[] {
  const types = new Set<string>();
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const visit = (node: unknown) => {
        if (Array.isArray(node)) return node.forEach(visit);
        if (!node || typeof node !== 'object') return;
        const record = node as Record<string, unknown>;
        for (const type of [record['@type']].flat()) if (typeof type === 'string') types.add(type);
        visit(record['@graph']);
      };
      visit(JSON.parse(match[1]));
    } catch { /* malformed JSON-LD counts as absent */ }
  }
  return [...types];
}

/** Which of the listed crawlers a robots.txt shuts out of the whole site. */
export function blockedCrawlers(robots: string, agents: string[]): string[] {
  const groups: Array<{ agents: string[]; rules: Array<[string, string]> }> = [];
  let current: { agents: string[]; rules: Array<[string, string]> } | null = null;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    const split = line.indexOf(':');
    if (split < 0) continue;
    const field = line.slice(0, split).trim().toLowerCase();
    const value = line.slice(split + 1).trim();
    if (field === 'user-agent') {
      if (!current || current.rules.length) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
    } else if ((field === 'allow' || field === 'disallow') && current) current.rules.push([field, value]);
  }
  const blocksRoot = (rules: Array<[string, string]>) => rules.some(([f, v]) => f === 'disallow' && (v === '/' || v === '/*')) && !rules.some(([f, v]) => f === 'allow' && (v === '/' || v === '/*'));
  const wildcard = groups.filter(group => group.agents.includes('*'));
  return agents.filter(agent => {
    const specific = groups.filter(group => group.agents.includes(agent.toLowerCase()));
    return (specific.length ? specific : wildcard).some(group => blocksRoot(group.rules));
  });
}

export async function analyzeSite(url: string, options: SafeFetchOptions): Promise<SiteSignals> {
  const origin = new URL(url).origin;
  const quiet = (path: string, accept: string) => safeFetch(`${origin}${path}`, { ...options, timeoutMs: 6000, maxBytes: 200_000, accept }).catch(() => null);
  const [page, robots, sitemap, llms] = await Promise.all([
    safeFetch(url, options).catch(() => null),
    quiet('/robots.txt', 'text/plain,*/*;q=0.5'), quiet('/sitemap.xml', 'application/xml,text/xml,*/*;q=0.5'), quiet('/llms.txt', 'text/plain,*/*;q=0.5'),
  ]);
  const html = page?.ok && /html|^$/.test(page.contentType) ? page.body : '';
  const reachable = Boolean(page?.ok && html);
  const title = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').slice(0, 200);
  const description = metaContent(html, 'description').slice(0, 400);
  const h1 = clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '').slice(0, 200);
  const text = visibleText(html);
  const wordCount = text ? text.split(' ').length : 0;
  const types = structuredDataTypes(html);
  const robotsText = robots?.ok && !/html/.test(robots.contentType) ? robots.body : '';
  const blocked = blockedCrawlers(robotsText, AI_CRAWLERS);
  const hasSitemap = Boolean(sitemap?.ok && /<(urlset|sitemapindex)\b/i.test(sitemap.body)) || /^sitemap:/im.test(robotsText);
  const hasLlms = Boolean(llms?.ok && !/html/.test(llms.contentType) && llms.body.trim().length > 20 && !/^\s*</.test(llms.body));
  const hasOg = Boolean(metaContent(html, 'og:title') && metaContent(html, 'og:description'));
  // schema.org has hundreds of business subtypes (Dentist, Plumber, LawFirm…), so rule out page furniture instead of listing them.
  const identityTypes = types.filter(type => !PAGE_FURNITURE.has(type));

  const checks: SignalCheck[] = [
    { id: 'reachable', label: 'Page loads for automated readers', weight: 15, passed: reachable,
      detail: reachable ? `Loaded ${page!.url} (HTTP ${page!.status}).` : page ? `The page returned HTTP ${page.status}${page.ok ? ' but no HTML' : ''}.` : 'The page could not be fetched. It may block automated requests or be offline.' },
    { id: 'static-content', label: 'Content is present without JavaScript', weight: 25, passed: wordCount >= 150,
      detail: !reachable ? 'Not tested because the page did not load.' : wordCount >= 150 ? `About ${wordCount} words are in the HTML itself.` : `Only about ${wordCount} words are in the HTML. Most AI crawlers do not run JavaScript, so they see very little of this page.` },
    { id: 'title-description', label: 'Clear title and description', weight: 10, passed: title.length >= 10 && description.length >= 50,
      detail: title && description ? (description.length >= 50 ? 'Both are present.' : 'The meta description is very short.') : `Missing ${[!title && 'a title', !description && 'a meta description'].filter(Boolean).join(' and ')}.` },
    { id: 'heading', label: 'A main heading says what the page is about', weight: 5, passed: h1.length > 0,
      detail: h1 ? `Main heading: “${h1.slice(0, 90)}”.` : 'No <h1> was found in the HTML.' },
    { id: 'structured-data', label: 'Structured data identifies the business', weight: 15, passed: identityTypes.length > 0,
      detail: identityTypes.length ? `Found schema.org types: ${identityTypes.slice(0, 5).join(', ')}.` : types.length ? `Structured data is present (${types.slice(0, 4).join(', ')}) but nothing that names the organization.` : 'No schema.org structured data was found.' },
    { id: 'ai-crawlers', label: 'AI crawlers are allowed', weight: 15, passed: blocked.length === 0,
      detail: blocked.length ? `robots.txt blocks: ${blocked.join(', ')}.` : robotsText ? 'robots.txt does not block the main AI crawlers.' : 'No robots.txt was found, so nothing is blocked.' },
    { id: 'sitemap', label: 'Sitemap is published', weight: 5, passed: hasSitemap, detail: hasSitemap ? 'A sitemap was found.' : 'No sitemap.xml was found at the site root or in robots.txt.' },
    { id: 'social-metadata', label: 'Share metadata is present', weight: 5, passed: hasOg, detail: hasOg ? 'Open Graph title and description are set.' : 'Open Graph title or description is missing.' },
    { id: 'llms-txt', label: 'llms.txt summary is published', weight: 5, passed: hasLlms, detail: hasLlms ? 'An llms.txt file was found.' : 'No llms.txt file was found. It is optional and not every assistant reads it.' },
  ];
  const earned = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  const possible = checks.reduce((sum, check) => sum + check.weight, 0);
  return { reachable, finalUrl: page?.url ?? url, status: page?.status ?? 0, title, description, h1, text: text.slice(0, 6000), wordCount, score: Math.round((earned / possible) * 100), checks };
}
