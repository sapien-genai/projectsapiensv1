import type { AuditFinding, WebsiteAudit } from './types.ts';

/** Deterministic inventory, also used to display older reports without rewriting evidence. */
export function auditFindings(audit: WebsiteAudit): AuditFinding[] {
  const findings: AuditFinding[] = [];
  for (const p of audit.pages) {
    if (!p.readable) {
      findings.push({ status: 'incomplete', title: 'Page fetch incomplete', evidenceIds: [p.id], detail: `${p.url}: ${p.status ? `HTTP ${p.status}` : 'no response captured'}. No content or metadata conclusion follows.`, nextStep: 'Retry the public page and compare its raw response with a rendered browser before proposing a repair.' });
      continue;
    }
    const missing = [!p.title && 'title', !p.description && 'description', !p.h1 && 'main heading', !p.canonical && 'canonical'].filter(Boolean);
    if (missing.length || p.capture?.atByteLimit || !p.capture?.documentClosed) findings.push({ status: 'incomplete', title: 'Compare initial HTML with the rendered page', evidenceIds: [p.id],
      detail: `${missing.length ? `Not detected in this capture: ${missing.join(', ')}. ` : ''}${p.capture?.atByteLimit ? 'The response reached the byte limit. ' : ''}${!p.capture?.documentClosed ? 'A complete HTML document was not confirmed. ' : ''}${p.capture?.hydrationDetected ? 'Client hydration markers were detected. ' : ''}${p.capture?.noindex ? 'A noindex directive was detected; confirm this page is intended for search before optimizing it. ' : ''}This is not a verified missing-feature problem.`, nextStep: 'Compare raw and rendered title, heading, canonical and schema; check indexing intent. Change the existing template only after confirming a real omission.' });
    if (p.capture?.invalidJsonLd) findings.push({ status: 'verified_problem', title: 'Invalid JSON in a captured structured-data script', evidenceIds: [p.id], detail: `${p.capture.invalidJsonLd} complete application/ld+json script(s) failed JSON parsing in the fetched HTML. This verifies syntax only, not schema eligibility or crawler behavior.`, nextStep: 'Validate the existing script and repair its JSON syntax; do not add duplicate markup. Re-fetch and validate the published result.' });
  }
  findings.push({ status: 'incomplete', title: 'Rendered pages and live integrations were not tested', evidenceIds: [], detail: 'Initial HTML and documentation do not establish client-rendered content, usable hydration data, live MCP tool execution, rate-limit behavior or real crawler access.', nextStep: 'Test relevant rendered pages and documented read-only tools separately. Do not change or load-test production endpoints merely because this check was not performed.' });
  return findings;
}

