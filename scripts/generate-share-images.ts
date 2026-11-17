// Optional asset-generation utility: requires sharp (SHARP_MODULE can select an installed copy).
// PNGs are committed; production builds do not need sharp or local fonts.
import { readFile, mkdir } from 'node:fs/promises';
import { sharePages } from './share-pages';
const sharp = (await import(process.env.SHARP_MODULE || 'sharp')).default;
const xml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const logo = (await readFile('public/brand/project-sapiens-wordmark.png')).toString('base64');
await mkdir('public/og', {recursive:true});
for (const page of sharePages) {
  const lineHeight = page.size * 1.12;
  const top = 250 + (3 - page.lines.length) * 24;
  const birds = Array.from({length:35},(_,i)=>{
    const angle = i * 2.4, radius = Math.sqrt(i/35);
    const x = 1070 + Math.cos(angle)*radius*62, y = 90 + Math.sin(angle)*radius*38;
    return `<path d="M -6 -2 Q -2 -4 0 2 Q 2 -4 6 -2 L 0 4 Z" transform="translate(${x},${y}) rotate(-24)" fill="#111"/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="white"/><image href="data:image/png;base64,${logo}" x="64" y="35" width="210" height="84"/>${birds}<path d="M64 145 H1136" stroke="#dce1dc"/><text x="66" y="197" font-family="Arial,sans-serif" font-size="21" font-weight="700" letter-spacing="2" fill="#16745e">${xml(page.label)}</text>${page.lines.map((line,i)=>`<text x="61" y="${top+i*lineHeight}" dominant-baseline="hanging" font-family="Arial,sans-serif" font-size="${page.size}" font-weight="700" letter-spacing="-3" fill="#111">${xml(line)}</text>`).join('')}<path d="M64 553 H1136" stroke="#dce1dc"/><text x="65" y="596" font-family="Arial,sans-serif" font-size="25" fill="#505850">projectsapiens.ai</text><path d="M1095 594 L1125 564 M1102 564 H1125 V587" fill="none" stroke="#16745e" stroke-width="4"/></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`public/og/${page.slug}-v1.png`);
}
console.log(`Generated ${sharePages.length} large share cards.`);
