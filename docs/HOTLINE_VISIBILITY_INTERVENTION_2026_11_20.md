# Hotline: verified findings and staged before/after work

Status: prepare only until Baseline 3 completes and its evidence is saved.
Existing prepared code: `codex/tv-guide-baseline-hold`, commit `b64fe29e`.
The final scheduled baseline uses the immutable 20-question study unchanged.

## Evidence reviewed November 20

- Direct bounded HTML reads returned homepage, About, Developers and several
  league TV guides successfully. `/tv-guide` timed out in the six-second sample:
  this is a checker limitation, not proof the page blocks crawlers.
- Homepage links already include dated game pages. League guides and agent
  documentation exist. Do not propose these as missing features.
- `llms.txt`, robots.txt and sitemap.xml returned HTTP 200 in the direct read.
  Sitemap sample size is capped; no claim of full coverage or stale dates follows.
- Developers explicitly says retrieval time is different from source verification
  time, which is unavailable. Do not invent a “last verified” stamp.
- No JSON-LD types detected in the capped initial HTML sample. Review actual
  source/rendered output and existing server schema before proposing additions.
- Search-tool TV-guide snapshot is dated October 29. It is not a live deployment
  or crawl-frequency measurement. Use direct fetch/production checks for release.

## Intervention 1: existing TV-guide hub

Prepared changes include winter-league defaults (NBA/NHL/men's and women's
college basketball), truthful descriptions of channel listings versus personal
subscription access, and next-day/all-leagues recovery for empty views. Preserve
explicit user league selections and current data/access semantics.

Before release: bring the isolated branch up to current main; review changes and
production deployment history; complete required review/CI; verify populated
current slates on desktop/mobile. Deploy this as a separate intervention and log
the actual commit and time. Do not combine speculative metadata work with it.

## Intervention 2: page usefulness and provenance

Inspect a current game page and its underlying structured records. Inventory
existing watch explanation, timing/timezone, subscription caveats and source
fields. Improve existing content only where a specific omission is verified.
Any displayed verification time must come from a genuine source-verification
record, not a fetch time or page build time. A methodology page can describe only
implemented collection/reconciliation behavior; documentation is not a test of MCP.

## Measurement

November 18: 58/60 answers, 6/6 branded mentions/citations, discovery 2/52;
known calculated cost $5.2302, incomplete billing for two failed calls.
November 19: 60/60 answers, 6/6 branded mentions/citations, discovery 2/54
(ChatGPT 1/18, Claude 0/18, Gemini 1/18); calculated cost $6.0495.
November 20: record final persisted results before release.

Repeat the same fixed questions at the agreed post-deployment intervals. Compare
successful matching question/provider pairs, retain failures and model/search
changes, and record unrelated schedule/editorial/deployment changes as confounders.
Do not present ordinary baseline variation as improvement or claim causation.
New MCP task tests, richer instant reports and SEO checks are separate measurements.
