import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sharePages, origin } from './share-pages';
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const seen = new Set<string>();
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const page of sharePages) {
  const filename = page.path === '/' ? 'dist/index.html' : `dist/share-pages/${page.slug}.html`;
  const html = await readFile(filename, 'utf8');
  const image = await readFile(`dist/og/${page.slug}-v1.png`);
  assert.equal(image.subarray(1,4).toString(), 'PNG');
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
  assert.ok(image.length < 1_000_000, 'Keep images quick to fetch on mobile');
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes(`property="og:url" content="${origin}${page.path}"`));
  assert.ok(html.includes(`property="og:image" content="${origin}/og/${page.slug}-v1.png"`));
  assert.equal((html.match(/<title>/g) ?? []).length, 1);
  assert.equal((html.match(/name="description"/g) ?? []).length, 1);
  const route = page.path.replace(/\/+$/, '') || '/';
  assert.ok(html.includes(`<div id="root" data-prerendered="${route}">`) && html.includes('type="module"'), 'Keep the app bootable');
  const text = html.slice(html.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  assert.ok(text.trim().length > 200 && /<h1[\s>]/.test(html), 'Crawlers that skip JavaScript need the page content');
  assert.ok(html.includes('application/ld+json'));
  assert.ok(sitemap.includes(`<loc>${origin}${page.path}</loc>`), 'Every company page belongs in the sitemap');
  assert.ok(!seen.has(page.slug)); seen.add(page.slug);
  if (page.path !== '/') for (const path of [page.path, page.path.slice(0,-1)]) {
    const route = config.rewrites.find((r: {source: string}) => r.source === path);
    assert.equal(route?.destination, `/share-pages/${page.slug}.html`, 'Both URL forms need crawler metadata');
  }
}
assert.equal(config.rewrites[0].source, '/api/client-inquiry');
assert.equal(config.rewrites.at(-1).destination, '/app.html');
const shell = await readFile('dist/app.html', 'utf8');
assert.ok(shell.includes('<div id="root"></div>'), 'Academy routes need an empty shell, not the pre-rendered homepage');
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`));
await readFile('dist/llms.txt');
console.log(`Verified ${sharePages.length} pre-rendered pages and share cards, sitemap, robots.txt, PNG dimensions/sizes, and explicit route mappings.`);
