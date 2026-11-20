import type { Report } from '../../../supabase/functions/visibility-report/core/types';
import { auditFindings } from '../../../supabase/functions/visibility-report/core/evidence';
import { discoveryScore } from '../../../supabase/functions/visibility/discovery-score';

export function reportMarkdown(report: Report): string {
  const lines = [`# ${report.profile.name} — website and AI visibility report`, '', `Website: ${report.url}`, `Generated: ${report.generatedAt}`, '', report.profile.summary, `Audience / service area: ${report.profile.audience || 'Not established'}`, '', report.method];
  const audit = report.audit;
  const score = discoveryScore(report.assistants.map(a => ({failed: Boolean(a.error), mentions: a.discovery.filter(d => d.mentioned).length, discoveryAnswers: a.discovery.length, expectedDiscovery: report.profile.queries.length})), report.signals.reachable);
  lines.push('', '## Sampled discovery score', '', score.score === null ? 'Unavailable: usable category answers or reliable website context are missing. This is not a zero score.' : `${score.score}/100 — ${score.mentions} mentions or domain citations in ${score.answers} usable category answers.`, `Coverage: ${score.answers}/${score.expected} expected category answers${score.partial ? ' (incomplete)' : ''}.`, 'Formula: 100 × mentions ÷ usable category answers, rounded. Failed calls are excluded, not scored as zero. Named recognition and website checks are separate. This small website-derived sample is not a grade of website quality, an endorsement or an independent market benchmark. Compare unchanged questions and models over time.');
  if (audit) {
    lines.push('', '## Diagnosis', '', audit.summary, `Investigation: ${audit.status}; captured ${audit.checkedAt}`, '', '## What already works');
    for (const s of audit.strengths) lines.push('', `- ${s.detail} [${s.evidenceIds.join(', ')}]`);
    const findings = auditFindings(audit);
    lines.push('', '## Verified problems in captured evidence');
    const problems = findings.filter(f => f.status === 'verified_problem');
    if (!problems.length) lines.push('No problem conclusively verified by these checks. This is not a clean bill of health.');
    for (const f of problems) lines.push('', `### ${f.title}`, f.detail, `Evidence: ${f.evidenceIds.join(', ')}`, `Next step: ${f.nextStep}`);
    lines.push('', '## Incomplete checks', 'These do not establish defects or lower the discovery score.');
    for (const f of findings.filter(f => f.status === 'incomplete')) lines.push('', `### ${f.title}`, f.detail, `Evidence: ${f.evidenceIds.join(', ') || 'Not executed'}`, `How to complete: ${f.nextStep}`);
    lines.push('', '## Improvement ideas and verification tasks');
    if (audit.evidenceVersion !== 2) lines.push('Earlier suggestions: existing links and markup were not checked for duplication. Verify before implementing.');
    for (const [i, a] of audit.actions.entries()) {
      lines.push('', `### ${i + 1}. ${a.title}`, '', audit.evidenceVersion !== 2 ? 'Earlier suggestion: verification required' : a.classification === 'opportunity' ? `${a.priority} priority · improvement idea` : 'Verification task: not a confirmed problem', '', a.observation, `Evidence: ${a.evidenceIds.join(', ')}`, '', `Why: ${a.why}`, '', ...a.steps.map((s, n) => `${n + 1}. ${s}`), '', `Draft example (verify facts): ${a.example || 'No draft generated.'}`, '', `Owner: ${a.owner}`, `Approximate effort: ${a.effort}`, '', `Verification: ${a.validation}`);
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
