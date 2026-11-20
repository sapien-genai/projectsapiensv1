// Display-only metric. Never changes persisted reports or fixed-question studies.
export interface DiscoveryCounts { failed?: boolean; mentions?: number; discoveryAnswers?: number; expectedDiscovery?: number }
export function discoveryScore(rows: DiscoveryCounts[], eligible = true) {
  const valid = rows.filter(r => !r.failed && Number.isInteger(r.mentions) && Number.isInteger(r.discoveryAnswers)
    && r.discoveryAnswers! > 0 && r.mentions! >= 0 && r.mentions! <= r.discoveryAnswers!);
  const answers = valid.reduce((n, r) => n + r.discoveryAnswers!, 0);
  const mentions = valid.reduce((n, r) => n + r.mentions!, 0);
  const expected = rows.reduce((n, r) => n + (Number.isInteger(r.expectedDiscovery) && r.expectedDiscovery! >= 0 ? r.expectedDiscovery! : 0), 0);
  return { score: eligible && answers ? Math.round(100 * mentions / answers) : null, mentions, answers, expected,
    partial: !eligible || valid.length < rows.length || answers < expected };
}
