import fs from 'fs';
import path from 'path';

interface LessonBlock {
  id: string;
  startLine: number;
  endLine: number;
  body: string;
}

interface Flag {
  severity: 'high' | 'medium';
  file: string;
  line: number;
  lessonId: string;
  text: string;
  heuristic: string;
}

interface OverdueLesson {
  file: string;
  lessonId: string;
  lastReviewed: string;
  reviewIntervalDays: number;
  daysOverdue: number;
  volatility: string;
}

const LESSON_KEY_RE = /^\s*'((?:lesson-\d+-\d+|(?:creator|business|productivity|mastery)-lesson-\d+-\d+|writing-step-\d+-\d+))'\s*:\s*{/;
const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
const monthLabelRe = new RegExp(`\\b(?:${MONTHS}):\\s*\\$?\\d`, 'i');

const highPatterns: Array<{ name: string; regex: RegExp }> = [
  { name: 'model-version:gpt', regex: /\b(GPT-?[0-9]+(\.[0-9]+)?o?)\b/g },
  { name: 'model-version:claude', regex: /\b(Claude\s+[0-9](\.[0-9])?)\b/g },
  { name: 'model-version:gemini', regex: /\b(Gemini\s+[0-9](\.[0-9])?)\b/g },
  { name: 'model-version:o-series', regex: /\bo[0-9]\b/g },
  { name: 'model-version:sonnet', regex: /\bSonnet\s+[0-9]/g },
  { name: 'model-version:opus', regex: /\bOpus\s+[0-9]/g },
  { name: 'model-version:haiku', regex: /\bHaiku\s+[0-9]/g },
  { name: 'model-version:llama', regex: /\bLlama\s*[0-9]/g },
  { name: 'dated-edition', regex: /\b20[12][0-9]\s+(edition|update|version|wave)\b/gi },
  { name: 'quarter-year', regex: /\bQ[1-4]\s+20[12][0-9]\b/g },
  { name: 'full-date', regex: new RegExp(`\\b(${MONTHS})\\s+\\d{1,2},?\\s+20[12][0-9]\\b`, 'g') },
];

const capabilityPatterns: Array<{ name: string; regex: RegExp }> = [
  { name: 'capability:k-context', regex: /\b\d+K\s+context\b/gi },
  { name: 'capability:smartest', regex: /\bsmartest\b/gi },
  { name: 'capability:most-capable', regex: /\bmost capable model\b/gi },
];

const cleanedExact = ['(2024 Edition)', '200K context window', 'less capable than GPT-4', 'MARCH 2024 UPDATE', 'Jan 15, 2024'];
const dollarRe = /\$\d+(?:\.\d+)?(?:\/(?:month|mo|year|yr|user))?/gi;

function listDataFiles(): string[] {
  const dataDir = path.join(process.cwd(), 'src', 'data');
  return fs.readdirSync(dataDir).filter((f) => f.endsWith('.ts')).map((f) => path.join('src', 'data', f));
}

function lineNumberAt(text: string, index: number): number {
  return text.slice(0, index).split('\n').length;
}

function extractLessonBlocks(text: string): LessonBlock[] {
  const lines = text.split('\n');
  const starts: Array<{ id: string; line: number; startIndex: number }> = [];
  let offset = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(LESSON_KEY_RE);
    if (m) starts.push({ id: m[1], line: i + 1, startIndex: offset + lines[i].indexOf('{') });
    offset += lines[i].length + 1;
  }

  const blocks: LessonBlock[] = [];
  for (const s of starts) {
    let depth = 0;
    let inStr: string | null = null;
    let escape = false;
    let end = s.startIndex;
    for (let i = s.startIndex; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (escape) escape = false;
        else if (ch === '\\') escape = true;
        else if (ch === inStr) inStr = null;
        continue;
      }
      if (ch === '"' || ch === '\'' || ch === '`') { inStr = ch; continue; }
      if (ch === '{') depth++;
      if (ch === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    blocks.push({
      id: s.id,
      startLine: s.line,
      endLine: lineNumberAt(text, end),
      body: text.slice(s.startIndex, end + 1),
    });
  }
  return blocks;
}

function findLessonForLine(blocks: LessonBlock[], line: number): string {
  return blocks.find((b) => line >= b.startLine && line <= b.endLine)?.id ?? 'unknown';
}

function extractToolNames(): string[] {
  const p = path.join(process.cwd(), 'src', 'data', 'toolsRegistry.ts');
  if (!fs.existsSync(p)) return [];
  const txt = fs.readFileSync(p, 'utf8');
  const names = new Set<string>();
  const re = /name\s*:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(txt))) names.add(m[1]);
  return [...names];
}

function nearToolName(text: string, index: number, toolNames: string[], window = 60): boolean {
  if (toolNames.length === 0) return false;
  const s = Math.max(0, index - window);
  const e = Math.min(text.length, index + window);
  const snippet = text.slice(s, e).toLowerCase();
  return toolNames.some((n) => snippet.includes(n.toLowerCase()));
}

function main() {
  const files = listDataFiles();
  const toolNames = extractToolNames();
  const flags: Flag[] = [];
  const overdue: OverdueLesson[] = [];
  let suppressed = 0;

  for (const file of files) {
    const abs = path.join(process.cwd(), file);
    const text = fs.readFileSync(abs, 'utf8');
    const lines = text.split('\n');
    const lessonBlocks = extractLessonBlocks(text);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNo = i + 1;
      const lessonId = findLessonForLine(lessonBlocks, lineNo);

      for (const p of highPatterns) {
        p.regex.lastIndex = 0;
        let m;
        while ((m = p.regex.exec(line))) {
          flags.push({ severity: 'high', file, line: lineNo, lessonId, text: m[0], heuristic: p.name });
        }
      }

      for (const p of capabilityPatterns) {
        p.regex.lastIndex = 0;
        let m;
        while ((m = p.regex.exec(line))) {
          if (nearToolName(line, m.index, toolNames, 80)) {
            flags.push({ severity: 'high', file, line: lineNo, lessonId, text: m[0], heuristic: p.name });
          }
        }
      }

      for (const exact of cleanedExact) {
        if (line.includes(exact)) flags.push({ severity: 'high', file, line: lineNo, lessonId, text: exact, heuristic: 'regression-guard:exact' });
      }

      if (monthLabelRe.test(line)) {
        // allowlist for table-like month labels
      }

      dollarRe.lastIndex = 0;
      let dm;
      while ((dm = dollarRe.exec(line))) {
        if (monthLabelRe.test(line)) { suppressed++; continue; }
        if (nearToolName(line, dm.index, toolNames, 60)) {
          flags.push({ severity: 'medium', file, line: lineNo, lessonId, text: dm[0], heuristic: 'tool-price-proximity' });
        } else {
          suppressed++;
        }
      }
    }

    for (const block of lessonBlocks) {
      const dateMatch = block.body.match(/lastReviewed\s*:\s*['"](\d{4}-\d{2}-\d{2})['"]/);
      const intervalMatch = block.body.match(/reviewIntervalDays\s*:\s*(\d+)/);
      if (!dateMatch || !intervalMatch) continue;
      const volatilityMatch = block.body.match(/volatility\s*:\s*['"]([^'"]+)['"]/);
      const lastReviewed = new Date(`${dateMatch[1]}T00:00:00Z`);
      const today = new Date();
      const days = Math.floor((today.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24));
      const interval = Number(intervalMatch[1]);
      if (days > interval) {
        overdue.push({ file, lessonId: block.id, lastReviewed: dateMatch[1], reviewIntervalDays: interval, daysOverdue: days - interval, volatility: volatilityMatch?.[1] ?? 'unknown' });
      }
    }
  }

  const high = flags.filter((f) => f.severity === 'high');
  const medium = flags.filter((f) => f.severity === 'medium');

  const byLesson = (arr: Flag[]) => arr.reduce<Record<string, Flag[]>>((acc, f) => { (acc[f.lessonId] ??= []).push(f); return acc; }, {});

  console.log('# Content Freshness Report\n');
  console.log('## Summary');
  console.log(`- High-confidence flags: ${high.length}`);
  console.log(`- Medium-confidence flags: ${medium.length}`);
  console.log(`- Overdue lessons: ${overdue.length}\n`);

  console.log('## Overdue lessons');
  if (!overdue.length) console.log('- None\n');
  else {
    overdue.sort((a, b) => b.daysOverdue - a.daysOverdue).forEach((o) => {
      console.log(`- ${o.lessonId} (${o.file}) | lastReviewed: ${o.lastReviewed} | days overdue: ${o.daysOverdue} | volatility: ${o.volatility}`);
    });
    console.log('');
  }

  console.log('## High-confidence flags');
  const highGrouped = byLesson(high);
  if (!high.length) console.log('- None\n');
  else {
    Object.entries(highGrouped).forEach(([lesson, list]) => {
      console.log(`### ${lesson}`);
      list.forEach((f) => console.log(`- ${f.file}:${f.line} | ${f.text} | ${f.heuristic}`));
    });
    console.log('');
  }

  console.log('## Medium-confidence flags');
  const medGrouped = byLesson(medium);
  if (!medium.length) console.log('- None\n');
  else {
    Object.entries(medGrouped).forEach(([lesson, list]) => {
      console.log(`### ${lesson}`);
      list.forEach((f) => console.log(`- ${f.file}:${f.line} | ${f.text} | ${f.heuristic}`));
    });
    console.log('');
  }

  console.log(`## Suppressed by allowlist\n${suppressed}`);

  process.exit(high.length > 0 || overdue.length > 0 ? 1 : 0);
}

main();
