import type { Report } from '../../../supabase/functions/visibility-report/core/types';

export function reportMarkdown(report: Report): string {
  const lines = [`# ${report.profile.name} — website and AI visibility report`, '', `Website: ${report.url}`, `Generated: ${report.generatedAt}`, '', report.profile.summary, `Audience / service area: ${report.profile.audience || 'Not established'}`, '', report.method];
  const audit = report.audit;
  if (audit) {
    lines.push('', '## Diagnosis', '', audit.summary, `Investigation: ${audit.status}; captured ${audit.checkedAt}`, '', '## What already works');
    for (const s of audit.strengths) lines.push('', `- ${s.detail} [${s.evidenceIds.join(', ')}]`);
    lines.push('', '## Prioritized action plan');
    for (const [i, a] of audit.actions.entries()) {
      lines.push('', `### ${i + 1}. ${a.title}`, '', `${a.priority} priority · ${a.classification === 'observed' ? 'Observed in this fetch' : a.classification === 'verify' ? 'Verify first' : 'Opportunity'}`, '', a.observation, `Evidence: ${a.evidenceIds.join(', ')}`, '', `Why: ${a.why}`, '', ...a.steps.map((s, n) => `${n + 1}. ${s}`), '', `Draft example (verify facts): ${a.example || 'No draft generated.'}`, '', `Owner: ${a.owner}`, `Approximate effort: ${a.effort}`, '', `Verification: ${a.validation}`);
    }
    lines.push('', '## Pages and files inspected');
    for (const p of audit.pages) lines.push('', `### ${p.id}: ${p.url}`, `${p.readable ? 'Read' : 'Unavailable'}; HTTP ${p.status ?? 'unknown'}; ${p.wordCount} words in captured HTML`, `Title: ${p.title}`, `Description: ${p.description}`, `H1: ${p.h1}`, `Canonical: ${p.canonical}`, `Schema types: ${p.schemaTypes.join(', ')}`, '', p.excerpt);
    for (const r of audit.resources) lines.push('', `### ${r.id}: ${r.url}`, `${r.readable ? 'Read' : 'Unavailable'}; HTTP ${r.status ?? 'unknown'}`, '', r.excerpt);
    lines.push('', '## Discovered URLs (not all inspected)', '', ...audit.discovered.map(u => `- ${u}`), '', '## Limitations', '', ...audit.limitations.map(l => `- ${l}`));
  } else lines.push('', '## Earlier report', 'This report predates the expanded page investigation.', '', ...report.recommendations.map(r => `- ${r.title}: ${r.detail}`));
  lines.push('', '## Assistant answers — mentions are not endorsements');
  for (const a of report.assistants) {
    lines.push('', `### ${a.label} (${a.model})`, a.error || a.summary, '', `Named-business question: What is ${report.profile.name} (${report.domain})? What do they do, and who is it for? Answer in a short paragraph.`, '', a.recognitionAnswer, ...a.recognitionCitations.map(c => `Source: ${c.url}`));
    for (const [i, d] of a.discovery.entries()) lines.push('', `#### ${a.id}-${i}: ${d.query}`, `Mention or citation detected: ${d.mentioned ? 'yes' : 'no'}; recommendation not independently assessed`, '', d.answer, ...d.citations.map(c => `Source: ${c.url}`));
  }
  lines.push('', '## Optional help', 'The diagnosis and plan are free. Implementation starts at $299 for an agreed scope. Confirm specific pages, changes, access, timing and price before paying. Larger projects are quoted separately. No guaranteed rankings or mentions.', 'https://www.projectsapiens.ai/ai-visibility/#contact');
  return lines.join('\n');
}
export function downloadReport(report: Report) {
  const url = URL.createObjectURL(new Blob([reportMarkdown(report)], {type: 'text/markdown;charset=utf-8'}));
  const a = document.createElement('a'); a.href = url; a.download = `${report.domain}-visibility-report.md`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
