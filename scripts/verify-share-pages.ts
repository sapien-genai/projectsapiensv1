import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { sharePages, origin } from './share-pages';
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const seen = new Set<string>();
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
  assert.ok(html.includes('<div id="root"></div>') && html.includes('type="module"'), 'Keep the app bootable');
  assert.ok(!seen.has(page.slug)); seen.add(page.slug);
  if (page.path !== '/') for (const path of [page.path, page.path.slice(0,-1)]) {
    const route = config.rewrites.find((r: {source: string}) => r.source === path);
    assert.equal(route?.destination, `/share-pages/${page.slug}.html`, 'Both URL forms need crawler metadata');
  }
}
assert.equal(config.rewrites[0].source, '/api/client-inquiry');
assert.equal(config.rewrites.at(-1).destination, '/index.html');
console.log(`Verified ${sharePages.length} HTML share cards, PNG dimensions/sizes, and explicit route mappings.`);
