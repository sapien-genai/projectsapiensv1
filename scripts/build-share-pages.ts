import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { sharePages, origin } from './share-pages';
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const template = (await readFile('dist/index.html', 'utf8')).replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '');
await mkdir('dist/share-pages', { recursive: true });
for (const page of sharePages) {
  const imagePath = `/og/${page.slug}-v1.png`;
  await readFile(`dist${imagePath}`); // Fail the build rather than ship a missing share image.
  const article = page.path.startsWith('/field-notes/') && page.slug !== 'field-notes';
  const metadata = [
    `<title>${escape(page.title)}</title>`,
    `<meta name="description" content="${escape(page.description)}" />`,
    `<link rel="canonical" href="${origin}${page.path}" />`,
    `<meta property="og:site_name" content="Project Sapiens" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:type" content="${article ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:url" content="${origin}${page.path}" />`,
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
  ].join('\n    ');
  await writeFile(page.path === '/' ? 'dist/index.html' : `dist/share-pages/${page.slug}.html`, template.replace('</head>', `${metadata}\n  </head>`));
}
console.log(`Built crawler-readable share metadata for ${sharePages.length} pages.`);
