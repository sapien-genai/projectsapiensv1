import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'src', 'data');

const LESSON_PREFIXES = [
  'lesson',
  'creator-lesson',
  'business-lesson',
  'productivity-lesson',
  'mastery-lesson',
  'writing-step',
];

const LESSON_KEY_REGEX = new RegExp(
  `(["']?)(${LESSON_PREFIXES.map((p) => `${p}-\\d+-\\d+`).join('|')})\\1\\s*:\\s*\\{`,
  'g',
);

const TOOL_NAMES = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Perplexity',
  'Midjourney',
  'DALL-E',
  'Notion AI',
  'Copilot',
];

const HIGH_REGEXES: Array<{ name: string; regex: RegExp }> = [
  { name: 'Specific model versions', regex: /\b(?:GPT-\d+(?:\.\d+)?|Claude\s*\d+(?:\.\d+)?|Gemini\s*\d+(?:\.\d+)?|Sonnet\s*\d+(?:\.\d+)?|Opus\s*\d+(?:\.\d+)?|Haiku\s*\d+(?:\.\d+)?|Llama\s*\d+(?:\.\d+)?|o1|o3)\b/g },
  { name: 'Year-edition phrase', regex: /\b20\d{2}\s*(?:Edition|Update)\b/g },
  { name: 'Quarter-year combo', regex: /\bQ[1-4]\s+20\d{2}\b/g },
  { name: 'Specific full date', regex: /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+20\d{2}\b/g },
  { name: 'Regression guard string', regex: /\(2024 Edition\)|200K context window|less capable than GPT-4|MARCH 2024 UPDATE|Jan 15, 2024/g },
];

const CONTEXT_SUPERLATIVE_REGEX = /\b(?:200K context|smartest|most capable model)\b/gi;
const TOOL_NAME_REGEX = new RegExp(`\\b(?:${TOOL_NAMES.map((t) => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'i');
const MEDIUM_PRICE_REGEX = /\$\s?\d{1,4}(?:,\d{3})*(?:\.\d+)?\s*\/(?:month|year)\b/gi;
const ALLOWLIST_TABLE_MONTH_REGEX = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec):\s*\$\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/i;

interface LessonBlock {
  key: string;
  file: string;
  start: number;
  end: number;
  startLine: number;
}

interface Flag {
  lesson: string;
  file: string;
  line: number;
  reason: string;
  snippet: string;
}

function lineForIndex(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function getSnippet(content: string, index: number): string {
  const line = content.split('\n')[lineForIndex(content, index) - 1] ?? '';
  return line.trim().slice(0, 220);
}

function findLessonBlocks(content: string, file: string): LessonBlock[] {
  const blocks: LessonBlock[] = [];
  let match: RegExpExecArray | null;
  while ((match = LESSON_KEY_REGEX.exec(content)) !== null) {
    const key = match[2];
    const full = match[0];
    const openBraceOffset = full.lastIndexOf('{');
    const openBraceIndex = match.index + openBraceOffset;
    let depth = 1;
    let i = openBraceIndex + 1;
    while (i < content.length && depth > 0) {
      const ch = content[i];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      i += 1;
    }
    blocks.push({
      key,
      file,
      start: openBraceIndex,
      end: i,
      startLine: lineForIndex(content, openBraceIndex),
    });
  }
  return blocks;
}

function lessonForIndex(blocks: LessonBlock[], idx: number): LessonBlock | null {
  const containing = blocks.filter((b) => idx >= b.start && idx <= b.end);
  if (containing.length === 0) return null;
  containing.sort((a, b) => (a.end - a.start) - (b.end - b.start));
  return containing[0];
}

function nearToolName(content: string, index: number, radius: number): boolean {
  const start = Math.max(0, index - radius);
  const end = Math.min(content.length, index + radius);
  return TOOL_NAME_REGEX.test(content.slice(start, end));
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

const files = fs.readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => path.join(DATA_DIR, f))
  .filter((f) => !f.includes(`${path.sep}scripts${path.sep}`) && !f.endsWith(`${path.sep}checkContentFreshness.ts`));

const highFlags: Flag[] = [];
const mediumFlags: Flag[] = [];
const overdueLessons: Array<{ lesson: string; file: string; daysSince: number; interval: number; lastReviewed: string }> = [];
let suppressedByAllowlist = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relFile = path.relative(ROOT, file);
  const blocks = findLessonBlocks(content, relFile);

  for (const { name, regex } of HIGH_REGEXES) {
    for (const m of content.matchAll(regex)) {
      const idx = m.index ?? 0;
      const block = lessonForIndex(blocks, idx);
      highFlags.push({
        lesson: block?.key ?? '(unattributed)',
        file: relFile,
        line: lineForIndex(content, idx),
        reason: name,
        snippet: getSnippet(content, idx),
      });
    }
  }

  for (const m of content.matchAll(CONTEXT_SUPERLATIVE_REGEX)) {
    const idx = m.index ?? 0;
    if (!nearToolName(content, idx, 80)) continue;
    const block = lessonForIndex(blocks, idx);
    highFlags.push({
      lesson: block?.key ?? '(unattributed)',
      file: relFile,
      line: lineForIndex(content, idx),
      reason: 'Superlative/context claim near tool name',
      snippet: getSnippet(content, idx),
    });
  }

  for (const m of content.matchAll(MEDIUM_PRICE_REGEX)) {
    const idx = m.index ?? 0;
    if (ALLOWLIST_TABLE_MONTH_REGEX.test(getSnippet(content, idx))) {
      suppressedByAllowlist += 1;
      continue;
    }
    if (!nearToolName(content, idx, 60)) {
      suppressedByAllowlist += 1;
      continue;
    }
    const block = lessonForIndex(blocks, idx);
    mediumFlags.push({
      lesson: block?.key ?? '(unattributed)',
      file: relFile,
      line: lineForIndex(content, idx),
      reason: 'Pricing near third-party tool',
      snippet: getSnippet(content, idx),
    });
  }

  for (const block of blocks) {
    const text = content.slice(block.start, block.end);
    const lastReviewed = text.match(/lastReviewed\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/);
    const reviewInterval = text.match(/reviewIntervalDays\s*:\s*(\d+)/);
    if (!lastReviewed || !reviewInterval) continue;
    const reviewedDate = new Date(lastReviewed[1]);
    if (Number.isNaN(reviewedDate.getTime())) continue;
    const interval = Number(reviewInterval[1]);
    const daysSince = daysBetween(reviewedDate, new Date());
    if (daysSince > interval) {
      overdueLessons.push({ lesson: block.key, file: relFile, daysSince, interval, lastReviewed: lastReviewed[1] });
    }
  }
}

const highByLesson = new Map<string, Flag[]>();
for (const flag of highFlags) {
  const key = `${flag.lesson} (${flag.file})`;
  const arr = highByLesson.get(key) ?? [];
  arr.push(flag);
  highByLesson.set(key, arr);
}

let report = '';
report += '# Content Freshness Report\n\n';
report += '## Summary\n';
report += `- High-confidence flags: ${highFlags.length}\n`;
report += `- Overdue lessons: ${overdueLessons.length}\n`;
report += `- Medium-confidence flags: ${mediumFlags.length}\n`;
report += `- Suppressed-by-allowlist: ${suppressedByAllowlist}\n\n`;

report += '## Overdue lessons\n';
if (overdueLessons.length === 0) report += '- None ✅\n\n';
else {
  for (const o of overdueLessons) {
    report += `- ${o.lesson} (${o.file}): ${o.daysSince} days since review (interval ${o.interval}, lastReviewed ${o.lastReviewed})\n`;
  }
  report += '\n';
}

report += '## High-confidence flags\n';
if (highByLesson.size === 0) report += '- None ✅\n\n';
else {
  for (const [lesson, flags] of highByLesson) {
    report += `### ${lesson}\n`;
    for (const f of flags) {
      report += `- L${f.line} [${f.reason}]: ${f.snippet}\n`;
    }
    report += '\n';
  }
}

report += '## Medium-confidence flags\n';
if (mediumFlags.length === 0) report += '- None\n';
else {
  for (const f of mediumFlags) {
    report += `- ${f.lesson} (${f.file}:L${f.line}) [${f.reason}]: ${f.snippet}\n`;
  }
}

console.log(report);

if (highFlags.length > 0 || overdueLessons.length > 0) {
  process.exit(1);
}
