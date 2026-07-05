import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');

const shadowReplacements = [
  ['shadow-[12px_12px_0px_#000000]', 'shadow-brutal-2xl'],
  ['shadow-[8px_8px_0px_#000000]', 'shadow-brutal-xl'],
  ['shadow-[6px_6px_0px_#FFD700]', 'shadow-brutal-gold'],
  ['shadow-[6px_6px_0px_#000000]', 'shadow-brutal-lg'],
  ['shadow-[5px_5px_0px_#000000]', 'shadow-brutal-5'],
  ['shadow-[4px_4px_0px_#FF6A00]', 'shadow-brutal-accent'],
  ['shadow-[4px_4px_0px_#000000]', 'shadow-brutal-md'],
  ['shadow-[3px_3px_0px_#000000]', 'shadow-brutal'],
  ['shadow-[3px_3px_0px_#000]', 'shadow-brutal'],
  ['shadow-[2px_2px_0px_#000000]', 'shadow-brutal-sm'],
  ['shadow-[2px_2px_0px_#000]', 'shadow-brutal-sm'],
];

const colorTokens = {
  FF6A00: 'accent',
  e89350: 'accent-hover',
  FF6B35: 'accent-alt',
  F4A261: 'accent-soft',
  '0A74FF': 'info',
  '0960d9': 'info-hover',
  E3F2FD: 'info-soft',
  F4F4F4: 'surface',
  F8F5F2: 'paper',
  E9E5E0: 'paper-2',
  '1C1A17': 'strong',
  '57524D': 'secondary',
  '10b981': 'success',
  '98C9A3': 'success-soft',
  E8F5E9: 'success-tint',
  F59E0B: 'warning',
  FFD700: 'gold',
  FFF9E6: 'cream',
  FFE5D9: 'peach',
};

const tokenCssVars = {
  ink: '--ink',
  accent: '--accent',
  'accent-hover': '--accent-hover',
  'accent-alt': '--accent-alt',
  'accent-soft': '--accent-soft',
  info: '--info',
  'info-hover': '--info-hover',
  'info-soft': '--info-soft',
  surface: '--surface',
  paper: '--paper',
  'paper-2': '--paper-2',
  strong: '--text-strong',
  secondary: '--text-secondary',
  success: '--success',
  'success-soft': '--success-soft',
  'success-tint': '--success-tint',
  warning: '--warning',
  gold: '--gold',
  cream: '--cream',
  peach: '--peach',
};

const utilityPrefixes = [
  'placeholder',
  'decoration',
  'outline',
  'divide',
  'stroke',
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'border-x',
  'border-y',
  'border-s',
  'border-e',
  'border',
  'ring',
  'fill',
  'text',
  'from',
  'via',
  'bg',
  'to',
];

const counts = new Map();

function addCount(label, count) {
  if (count > 0) {
    counts.set(label, (counts.get(label) ?? 0) + count);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listSourceFiles(fullPath);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  }));
  return files.flat();
}

function replaceAndCount(source, pattern, replacement, label) {
  let count = 0;
  const next = source.replace(pattern, (...args) => {
    count += 1;
    return typeof replacement === 'function' ? replacement(...args) : replacement;
  });
  addCount(label, count);
  return next;
}

function tokenClass(utility, token, modifier = '') {
  if (modifier && utility.startsWith('border')) {
    return `${utility}-[color:color-mix(in_srgb,var(${tokenCssVars[token]})_${modifier.slice(1)}%,transparent)]`;
  }

  return `${utility}-${token}${modifier}`;
}

function rewriteSource(source) {
  let next = source;

  for (const [from, to] of shadowReplacements) {
    next = replaceAndCount(
      next,
      new RegExp(escapeRegExp(from), 'g'),
      to,
      `${from} -> ${to}`,
    );
  }

  const utilityPattern = utilityPrefixes.map(escapeRegExp).join('|');
  for (const [hex, token] of Object.entries(colorTokens)) {
    next = replaceAndCount(
      next,
      new RegExp(`(?<![A-Za-z0-9_-])(${utilityPattern})-\\[#${hex}\\]((?:/[A-Za-z0-9.\\[\\]_-]+)?)`, 'gi'),
      (_match, utility, modifier) => tokenClass(utility, token, modifier),
      `utility-[#${hex}] -> utility-${token}`,
    );
  }

  next = replaceAndCount(
    next,
    /(?<![A-Za-z0-9_-])((?:border|border-[trblxyse])-black)((?:\/[A-Za-z0-9.[\]_-]+)?)(?![A-Za-z0-9_-])/g,
    (_match, utility, modifier) => tokenClass(utility.replace(/-black$/, ''), 'ink', modifier),
    'border-black variants -> border-ink variants',
  );
  next = replaceAndCount(
    next,
    /(?<![A-Za-z0-9_-])((?:border|border-[trblxyse])-(ink|accent-soft))\/(\d+)(?![A-Za-z0-9_-])/g,
    (_match, utility, token, opacity) => tokenClass(utility.replace(new RegExp(`-${token}$`), ''), token, `/${opacity}`),
    'border token opacity -> border color-mix',
  );
  next = replaceAndCount(next, /(?<![A-Za-z0-9_-])bg-black(?!\/)(?![A-Za-z0-9_-])/g, 'bg-ink', 'bg-black -> bg-ink');
  next = replaceAndCount(next, /(?<![A-Za-z0-9_-])text-black(?![A-Za-z0-9_-])/g, 'text-ink', 'text-black -> text-ink');
  next = replaceAndCount(next, /(?<![A-Za-z0-9_-])ring-black(?![A-Za-z0-9_-])/g, 'ring-ink', 'ring-black -> ring-ink');
  next = replaceAndCount(next, /(?<![A-Za-z0-9_-])divide-black(?![A-Za-z0-9_-])/g, 'divide-ink', 'divide-black -> divide-ink');
  next = replaceAndCount(next, /(?<![A-Za-z0-9_-])outline-black(?![A-Za-z0-9_-])/g, 'outline-ink', 'outline-black -> outline-ink');

  return next;
}

const files = await listSourceFiles(srcDir);
let changedFiles = 0;

for (const file of files) {
  const original = await readFile(file, 'utf8');
  const next = rewriteSource(original);
  if (next !== original) {
    await writeFile(file, next);
    changedFiles += 1;
  }
}

console.log(`Changed files: ${changedFiles}`);
console.log('Replacement counts:');
for (const [label, count] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  console.log(`${String(count).padStart(4, ' ')}  ${label}`);
}
