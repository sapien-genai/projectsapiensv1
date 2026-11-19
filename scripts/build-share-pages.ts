import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { sharePages, origin } from './share-pages';
import { SERVICES } from '../src/data/services';
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const jsonLd = (data: object) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
const emptyRoot = '<div id="root"></div>';
const shell = await readFile('dist/index.html', 'utf8');
if (!shell.includes(emptyRoot)) throw new Error('dist/index.html has no empty #root to pre-render into.');
// Keep an untouched shell for the learning platform and every other client-only route.
await copyFile('dist/index.html', 'dist/app.html');
process.env.NODE_ENV = 'production'; // Render with React's production build, matching what the browser hydrates.
const { render } = await import(pathToFileURL('dist-ssr/entry-server.js').href) as { render: (path: string) => Promise<string> };
const template = shell.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '');
const organization = { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Project Sapiens', legalName: 'Project Sapiens, Inc.', description: 'Independent AI product studio and advisory firm building custom AI agents, voice AI experiences, and practical products with OpenAI technology.', url: `${origin}/`, logo: `${origin}/brand/project-sapiens-circle.png`, founder: { '@type': 'Person', name: 'Tony Marks', url: 'https://tonymarks.com/about/' } };
await mkdir('dist/share-pages', { recursive: true });
for (const page of sharePages) {
  const imagePath = `/og/${page.slug}-v1.png`;
  await readFile(`dist${imagePath}`); // Fail the build rather than ship a missing share image.
  const article = page.path.startsWith('/field-notes/') && page.slug !== 'field-notes';
  const url = `${origin}${page.path}`;
  const graph: object[] = [organization, { '@type': 'WebPage', '@id': url, url, name: page.title, description: page.description, isPartOf: { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'Project Sapiens', publisher: { '@id': organization['@id'] } } }];
  if (article) graph.push({ '@type': 'Article', headline: page.title.replace(/ — Project Sapiens$/, ''), description: page.description, url, image: `${origin}${imagePath}`, author: organization.founder, publisher: { '@id': organization['@id'] }, mainEntityOfPage: { '@id': url } });
  if (page.slug === 'ai-visibility') graph.push({ '@type': 'Service', name: 'AI Brand Visibility Report', serviceType: 'AI brand visibility audit', description: page.description, url, provider: { '@id': organization['@id'] } });
  const service = SERVICES.find(item => item.slug === page.slug);
  if (service) graph.push({ '@type': 'Service', name: service.name, serviceType: service.title.split(' — ')[0], description: service.description, url, provider: { '@id': organization['@id'] } });
  const metadata = [
    `<title>${escape(page.title)}</title>`,
    `<meta name="description" content="${escape(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="Project Sapiens" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:type" content="${article ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${origin}${imagePath}" />`,
    `<meta property="og:image:secure_url" content="${origin}${imagePath}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escape(page.lines.join(' ') + ' — Project Sapiens')}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(page.title)}" />`,
    `<meta name="twitter:description" content="${escape(page.description)}" />`,
    `<meta name="twitter:image" content="${origin}${imagePath}" />`,
    `<meta name="twitter:image:alt" content="${escape(page.lines.join(' ') + ' — Project Sapiens')}" />`,
    ...(article ? ['<meta property="article:author" content="Tony Marks" />'] : []),
    jsonLd({ '@context': 'https://schema.org', '@graph': graph }),
  ].join('\n    ');
  // The same route key the browser computes in src/main.tsx decides whether to hydrate.
  const route = page.path.replace(/\/+$/, '') || '/';
  const body = await render(route);
  if (body.replace(/<[^>]+>/g, '').trim().length < 200) throw new Error(`Pre-rendered ${page.path} has almost no text.`);
  const html = template
    .replace('</head>', () => `${metadata}\n  </head>`)
    .replace(emptyRoot, () => `<div id="root" data-prerendered="${escape(route)}">${body}</div>`);
  await writeFile(page.path === '/' ? 'dist/index.html' : `dist/share-pages/${page.slug}.html`, html);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sharePages.map(page => `  <url><loc>${origin}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile('dist/sitemap.xml', sitemap);
console.log(`Pre-rendered ${sharePages.length} crawler-readable pages with share metadata, and wrote sitemap.xml.`);
