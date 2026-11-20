# Instant AI visibility report

The `/ai-visibility/` page lets a visitor enter a website and get a scored report on how AI assistants see that business. Scores are shown free; the answers, competitors, issues, technical checks and recommendations unlock when the visitor enters an email.

## How it works

`src/components/VisibilityChecker.tsx` calls one Supabase Edge Function, `visibility-report`, with three actions:

| Action | What it does |
| --- | --- |
| `start` | Validates the address, applies limits, creates a row in `visibility_reports`, and runs the report in the background. Returns the report id. |
| `status` | Returns progress while running, then the preview (scores and counts). Returns the full report only if that row has been unlocked. |
| `unlock` | Stores the email on the row and returns the full report. |

A run does four things (`supabase/functions/visibility-report/core/`):

1. **Reads the site** (`site.ts`): fetches the page without JavaScript plus `robots.txt`, `sitemap.xml` and `llms.txt`, and scores nine readability checks.
2. **Builds a profile** (`pipeline.ts`): a low-cost model extracts the business name, category and two questions a customer might ask.
3. **Asks each assistant** (`providers.ts`): "What is {name}?" plus the two category questions, with the provider's own web search turned on. That is three calls per assistant.
4. **Grades the answers**: a low-cost model scores recognition and accuracy against the site's own facts and lists gaps and competitors. Whether the business was mentioned in a category answer is decided by string match, not by a model.

Overall score = recognition 30% + discovery 30% + accuracy 20% + site readability 20%. Missing extraction, grading, or discovery measurements produce an unavailable overall score; the HTML score is never substituted for AI visibility. The report states how many assistants returned answers.

The full report never reaches the browser before unlock: the server sends `toPreview(report)` only.

## Deploying

The site change is inert until these are done in the Supabase project the academy already uses:

1. **Apply both migrations**, in order: `supabase/migrations/20261118120000_create_visibility_reports.sql` and `supabase/migrations/20261118130000_harden_visibility_reports.sql` (Dashboard SQL editor or `supabase db push`). The second migration adds atomic quota reservation and notification delivery tracking.
2. **Set secrets** (Dashboard → Edge Functions → Secrets). `GEMINI_API_KEY` already exists.
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` (web search must also be enabled for the organization in the Anthropic Console)
3. **Deploy the function**: `supabase functions deploy visibility-report`
4. **Confirm Vercel has** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the production build. The academy already needs them.
5. Run one report, unlock it with a test email, and confirm the contact notification reaches Tony. Check `notification_status` and `notified_at` on the row. Test a second request for the same domain: it should immediately show a locked preview with a new report id.
6. Inspect provider coverage and web search flags before launch; missing keys are shown as unavailable assistants. Do not interpret a partial run as verification of all three providers.

## Settings (all optional secrets)

| Secret | Default | Purpose |
| --- | --- | --- |
| `VISIBILITY_OPENAI_MODEL` | `gpt-5.5` | Model used as "ChatGPT" |
| `VISIBILITY_ANTHROPIC_MODEL` | `claude-sonnet-5-5` | Model used as "Claude" |
| `VISIBILITY_GEMINI_MODEL` | `gemini-3.5-flash` | Model used as "Gemini" |
| `VISIBILITY_GRADER_MODEL` | same as the Gemini model | Model for extraction and grading |
| `VISIBILITY_WEB_SEARCH` | `on` | Set `off` to skip provider web search (cheaper, less like the consumer apps) |
| `VISIBILITY_IP_DAILY_LIMIT` | `3` | New reports per visitor per 24 hours |
| `VISIBILITY_DAILY_CAP` | `100` | New reports across all visitors per 24 hours. This is the spending ceiling. |
| `VISIBILITY_CACHE_DAYS` | `7` | A finished report for the same domain is reused for this long without new AI calls |
| `VISIBILITY_ALLOWED_ORIGINS` | none | Extra allowed origins, comma separated. The production domains, localhost and `*.vercel.app` are already allowed. |
| `VISIBILITY_LEAD_FORWARD_URL` | `https://tonymarks.com/` | Each unlock posts to the same existing Netlify contact intake used by `/api/client-inquiry`. Override only to another compatible intake. |
| `VISIBILITY_LEAD_FORM_NAME` | `contact` | Form name used with the setting above |

If a default model name is not available on your account, the assistant shows as "could not be tested"; set the matching secret to a model you have.

## Cost and abuse

With all three providers configured, each new report makes nine search-enabled assistant calls plus one extraction and three grading calls. Search fallback can add requests. Providers bill web search per search on top of tokens, so check current pricing and set `VISIBILITY_DAILY_CAP` to a number you are comfortable multiplying by. Reused reports cost nothing.

Protections: origin check, honeypot field, per-visitor limit, global daily cap, and domain reuse. Quota checks and insertion execute under one transaction-level database lock; database errors fail closed before paid work starts. There is no CAPTCHA. The origin check and per-visitor limit can be bypassed by a determined script; the global cap is what bounds spend.

The fetcher only requests public http(s) hosts on standard ports, re-validates every redirect hop, resolves DNS and refuses private addresses, and caps response size. It does not pin the resolved address for the request itself.

## Leads

Unlocks automatically forward the lead email, domain, score and report link to the existing contact intake. A database claim prevents simultaneous requests from sending the same notification; the original lead email cannot be overwritten by a later unlock. HTTP failures are checked, with up to three attempts for transient errors. The durable row tracks `pending`, `sending`, `sent`, or `failed`; `sent` means the intake accepted the submission, not proof that the downstream email arrived.

Failed or interrupted delivery retries when an unlocked report is reopened (or unlocked again), after a two-minute lease. Operators can retry a failed row by opening its report link. There is no independent scheduled retry worker yet, so monitor unsent leads; do not treat a successful report unlock as email delivery confirmation. The same lead may be delivered twice if the intake accepts it but the response is lost; the report id in the message supports deduplication.

Unlocked rows are the leads:

```sql
select email, domain, (report->>'overall')::int as score, unlocked_at,
       notification_status, notification_attempts, notified_at
from visibility_reports where email is not null order by unlocked_at desc;
```

RLS is on with no public policies; only the function (service role) and academy admins can read the table.

## Limits worth knowing

- Results come from developer APIs, not the consumer apps, and each question is asked once. The report says so. Answers vary between runs.
- Perplexity is not included.
- Sites that block automated requests will score low on readability even if AI crawlers are allowed through.
- The privacy policy section "Instant AI visibility report" describes this data flow. Review it before launch.

## Testing

`npm run check:visibility` runs the engine against simulated websites and providers (no real API calls). It covers address validation, page parsing, scoring, the locked preview, provider fallbacks and redirect handling. `deno test --node-modules-dir=none --allow-env supabase/functions/visibility-report/handler_test.ts` exercises cached start, preview gating, unlock, first-email preservation, quota errors and origin checks against a simulated database HTTP API. No live services are called.

`scripts/verify-visibility-database.py` checks concurrent global/IP quota reservations and notification leases against an empty, disposable local PostgreSQL database with both migrations applied. It refuses non-local database hosts. Do not run it against production.

Default model ids were checked against official documentation on November 18, 2026: [OpenAI](https://developers.openai.com/api/docs/models/gpt-5.5), [Anthropic](https://platform.claude.com/docs/en/models/sonnet-5-5/overview), [Google](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash). Account access and live responses still need verification. Operators can use the Supabase function Test panel with the service-role Authorization header and `GET ?check=providers` to inspect Gemini model availability without exposing credentials. Ordinary callers receive 403.

### Failed website requests

If the homepage cannot be read, website scores and assistant recognition/accuracy grades are unavailable. The raw assistant answers remain visible, but missing metadata is not inferred from a failed request. Auxiliary checks distinguish unavailable responses from confirmed absence (404/410); an unknown check prevents an aggregate website score. Incomplete reports are not reused by the seven-day cache. Apply `20261118210000_exclude_incomplete_visibility_cache.sql` when upgrading. Older failed-homepage reports are sanitized when displayed.

The Beacon fetch regression was caused by treating all of 192.0.0.0/16 as reserved. Its public 192.0.78.* hosting addresses are allowed; the reserved 192.0.0.0/24 and documentation 192.0.2.0/24 remain blocked. Redirect and private-address protections still apply.

### Per-report costs (2026-11-18)

Academy → Admin Portal → **Visibility costs** shows the most recent reports, paginated, with calculated USD cost and per-call usage. Only existing `admin` and `super_admin` users can read the ledger under RLS. Public report responses do not include costs.

Apply `20261118230000_visibility_report_costs.sql` before deploying the updated Edge Function. Every paid attempt is inserted into `visibility_report_usage` before the HTTP request and updated after it returns. Each row records actual/requested model, assistant vs analysis purpose, HTTP status, provider token usage, cache tokens, reasoning tokens, search count/basis, component costs, and the rate-card snapshot. A normal full report has 13 calls (9 questions, 1 profile extraction, 3 grades). Retries are separate rows. No prompts, credentials or answer text are stored in the ledger.

The displayed amount is **calculated standard-list API cost**, not an invoice. OpenAI output already includes reasoning; Gemini output adds thoughts, and tool prompt tokens are included in input. Anthropic cache reads/writes are separate from uncached input. Google search cost is an estimate based on grounding queries at paid rates; the account's 5,000 free monthly search requests may reduce it. Hosting, taxes, credits and account discounts are excluded. Unknown models, missing usage, failed requests or interrupted workers yield partial/unavailable totals rather than zero. Cached report rows have zero incremental AI cost and link to the original report; old reports remain untracked rather than inventing historical usage.

Prices are versioned in `core/cost.ts` and saved with each attempt. Review them when changing model secrets or provider pricing. Sources: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing), [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing.md), [Gemini usage fields](https://googleapis.github.io/js-genai/release_docs/interfaces/types.UsageMetadata.html).

To inspect a report directly in Supabase SQL Editor:

```sql
SELECT provider, model, purpose, status, input_tokens, cached_tokens, output_tokens,
       reasoning_tokens, searches, search_basis, token_cost_usd, search_cost_usd,
       estimated_cost_usd, pricing_version, notes
FROM public.visibility_report_usage
WHERE report_id = 'REPORT_UUID'
ORDER BY started_at;
```

Live verification showed that the requested Gemini 3.5 alias can return `gemini-3.6-flash`. Pricing uses the returned model, including the [published Gemini 3.6 promotional rates](https://ai.google.dev/gemini-api/docs/pricing?gclsrc=aw.ds) through December 31, 2026 and the January 1 change. Completed Claude responses with omitted search usage use observed web-search tool calls (labeled estimates). Completed Gemini responses without grounding metadata record zero observed searches; incomplete responses or incomplete grounding metadata remain unknown.

Admins can expand a report in Visibility costs and select **Run fresh report (new API charges)**. The function verifies the user and existing admin role server-side, skips the cache only for that request, and keeps the old report intact. Fresh runs have a three-per-admin daily quota and count toward the same global daily cap. Public visitors cannot request this override.

## Fixed-question case studies

Admins and super admins can open **Admin → Visibility studies**. This is separate
from the public instant report: the latter regenerates discovery prompts and its
composite score is not a controlled longitudinal measurement.

Apply `20261118233000_visibility_studies.sql`, redeploy `visibility-report`, and
deploy the frontend. No new secrets are required. New tables have admin-only
read policies; authenticated users cannot mutate them directly. Study actions
validate the current user's admin role in the function.

Save a fixed question set before the first run. Its questions, brand, domain,
competitors and scope cannot be edited; create another set to change the method.
Each run snapshots the questions, requested model/search configuration and website
checks. The exact question is sent to each provider without supplying the brand's
website text or internal study context. Branded recognition is reported separately
from unbranded discovery. Successful answers, returned model identifiers, actual
search use, citations, human accuracy reviews and usage costs remain available.

A 20-question set makes 60 assistant requests, potentially more HTTP requests if
an adapter performs its existing compatibility fallback. The browser dispatches
three requests concurrently. Keep the screen open; if interrupted, use **Resume
remaining questions**. Completed/failed answers are not replayed. Claims older
than three minutes become failed on the next claim; their costs may remain
incomplete. Failed answers are excluded from percentages, with coverage displayed.
Each admin can start three studies per rolling 24 hours. A 60-answer run consumes
seven units of the shared 100-unit daily budget; instant reports use one unit.
These budget units are not dollar caps.

History shows discovery mention/citation rates, coverage and calculated API costs.
Comparisons use only successful matching question/provider pairs. Different
question sets or requested configuration, changed/unknown returned models withhold
numerical deltas. Search-use changes and missing coverage are flagged. Mentions
are not recommendations, citations are not endorsements, and developer API results
are not a measurement of every consumer app. Website checks remain separate.
Download evidence JSON to preserve the raw before/after record and append dated
changes/outcome notes with evidence links. Costs exclude infrastructure, credits,
taxes and invoice adjustments and can include estimated search usage.

### Hotline Sports pilot protocol

The supplied template has 2 branded and 18 unbranded evergreen U.S. questions,
covering sports schedules, TV/streaming discovery, viewing restrictions, subscription
planning and selected leagues. The reference positioning is a free sports guide
for schedules, live scores and where to watch; see
https://www.hotlinesports.com/ and https://www.hotlinesports.com/about.

1. Save the template and collect the first baseline before changing Hotline's site.
2. Repeat the same panel on two additional days before intervention. Record the
   range and per-assistant rates; do not select only the best/worst run.
3. Review branded answers against the reference pages. Separate factual errors,
   missing discovery and citation gaps; choose a small documented intervention.
4. Log the deployed change, date and evidence link. Track other changes, indexing,
   model shifts, news/seasonality and any marketing that could affect outcomes.
5. Run the unchanged panel at 30, 60 and 90 days after deployment. Compare matched
   evidence across repeated runs, not just one before/after score. Review factual
   accuracy and recommendation context manually.
6. Add measured AI referrals, engaged visits and qualified inquiries where analytics
   supports them, with periods and sources. Unattributed traffic is not proof of no
   effect. A case study can show association; this single-site design cannot prove
   causation. Publish denominators, failures, dates, costs and limitations alongside
   any claimed improvement.

Runs are manually initiated; the feature does not schedule future runs or modify
Hotline Sports automatically. The first baseline is a starting point, not a success
claim.

Validation: `npm run check:visibility`, `npm run typecheck`, the Deno handler tests,
and `scripts/verify-visibility-study-database.py` against an empty disposable local
Postgres database with all migrations applied. The database test refuses remote
hosts and verifies concurrent reservation/claims, quotas, immutability and RLS.

Google grounding citation attribution uses a direct destination hostname or an
exact hostname label supplied with Google's `grounding-api-redirect` link. It does
not treat an arbitrary title mentioning the business as a citation. Migration
`20261118234000_study_grounding_citations.sql` corrects derived flags in existing
study answers without altering their raw text/links or repeating paid requests.

Study provider requests allow 75 seconds per attempt (up to 150 seconds for the
existing compatibility fallback). This matches the instant-report adapter default;
interrupted claims still expire after three minutes. Initial pilot calls that
exceeded the earlier 45-second allowance remain recorded as failures, not retried.


### Customer workspace and business onboarding

The existing `/ai-visibility/dashboard/` URL remains the customer workspace, preserving OAuth callbacks and checkout returns. Main-site navigation displays Sign in or My workspace according to the current session. The workspace has account navigation and links to reports, deliverables, tracking, business profile, and services/billing.

After saving a report, customers can confirm a business name and provide service area, industry, employee range, and a main goal. Onboarding can be deferred and edited later. Context is stored per owned website in `visibility_projects.business_profile`; it does not rewrite saved report evidence, fixed questions, or baseline schedules, and it is not automatically sent to AI providers. The authenticated `save_profile` action validates field lengths and employee ranges and uses the existing ownership check before updating the selected website.

Deploy migration `20261119193000_customer_business_profile.sql`, then `visibility-customer`, before the frontend. No new secrets or payment settings are required. Validate with `deno test --node-modules-dir=none supabase/functions/visibility-customer/profile_test.ts` plus the customer core tests, frontend typecheck/build, and desktop/mobile UI checks.


### Instant report scope correction (November 19, 2026)

The instant report no longer blends model grades, mention percentages and HTML checks into an overall visibility score. New reports store `overall: null`; historical report responses suppress the old composite without altering stored evidence. Preview fields include returned/expected category-answer counts and observed mentions. Identity is explicitly an automated assessment; accuracy is not represented as a verified percentage. No recommendation, ranking, or task-completion claim is inferred from mentions.

Historical recommendations are derived from recorded findings, including missing h1, with separate validation and broader-measurement next steps. Optional llms.txt is not promoted as the primary fix. Failed-fetch reports still withhold site-based grading. Workspace score tiles are replaced with links to report evidence. This change does not alter fixed study prompts, matching, schedules, provider settings, or baseline records.

## November 20: free diagnosis, optional scoped implementation

New instant reports include a bounded public-page investigation (`core/audit.ts`):
up to eight same-site HTML pages, standard robots/sitemap/llms files, and up to
100 discovered URLs. Each request uses the existing public-address/redirect
validation, a six-second attempt timeout and 350 KB body cap. Links to common
account/admin/checkout routes are excluded. Missing reads remain unavailable,
never evidence that a feature is absent. The sample is not a full crawl.

One additional metered analysis call synthesizes the captured pages and category
answers into a practical plan. Every accepted generated action references an
existing evidence ID and an exact captured quotation. Generated interpretations
are always `verify` or `opportunity`; only deterministic missing-field findings
can be `observed`, scoped to the fetched HTML. An exact quote is grounding, not
proof of a model's inference. Unsupported source IDs/quotes are discarded.
Synthesis failure preserves evidence with explicit partial status.

An audit is saved inside the existing report JSON; no schema migration is needed.
The full report remains free after email unlock and can be downloaded as Markdown.
Earlier cached reports remain dated snapshots and are labelled as predating the
expanded investigation; they are not silently backfilled or billed again.
Normal complete runs now have 14 paid calls before provider fallbacks (9 sampled
answers, profile, 3 grades, synthesis). Actual usage remains in the cost ledger.
Analysis completion allowance is raised only for instant-report analysis;
fixed-question study models, questions, request allowances and adapters' defaults
remain unchanged. Do not redeploy the shared function during an active study.

New draft-package checkout is closed server-side. The site offers an implementation
scope request from $299 via the existing inquiry form, carrying the report link.
There is no automatic implementation charge or promise to fix an entire audit for
$299. Access, exact changes, timing and price must be agreed first. Existing paid
packages and their fulfillment/webhooks remain intact. Monthly tracking is unchanged.

Release checks: `npm run check:visibility`, `npm run typecheck`, targeted ESLint,
Deno check/tests for both affected functions, production build, desktop/mobile
review, and a fresh non-study report to verify persisted synthesis and cost records.


## Evidence checks and sampled discovery score November 20

New reports separate verified syntax problems in captured JSON-LD from incomplete fetch/rendering checks and proposed improvements. Missing raw-HTML fields, capped documents, hydration markers, failed fetches and unexecuted MCP endpoints do not establish missing features. The crawler does not execute customer endpoints or render JavaScript. Private/account routes are excluded from page selection. Parsed links, existing schema types and noindex signals inform proposal validation.

Each generated implementation proposal must cite the actual readable target page, including an exact current-text quotation. Known duplicate links/schema and unchanged replacement wording are rejected. Noindex and unread targets are not offered implementation changes. Opportunities remain provisional; absence from a bounded capture is not proof of sitewide absence. Earlier stored reports retain their evidence and display a legacy-verification notice.

The display-only sampled discovery score is round(100 × mentions / usable category answers). Mentions include matching business names or domain citations; they do not establish endorsement. Failed calls are excluded and coverage is shown, zero usable answers means unavailable, and named recognition/HTML checks are not blended into it. A recognition failure does not discard successfully returned category answers. The score is also in the Markdown export. A scroll walkthrough reveals saved provider contributions; it makes no new API calls and supports reduced motion. The final score remains visible independently of scrolling.

Instant questions are exploratory (a broad category question plus a customer-need question), not interchangeable with fixed study questions. Hotline code, baseline definitions, saved answers and schedules are unchanged. No Hotline changes or new Hotline runs are part of this release.

### Admin fresh-report quota bypass

The admin cost screen’s fresh-report action verifies the bearer token and an `admin` or `super_admin` role on the server, then reserves a new paid report without the visitor or global daily cap. Public requests still use the existing atomic reservation, three-report visitor limit, 100-report global limit, and seven-day cache. Admin reports retain user attribution and normal cost tracking; they remain part of existing global usage accounting. Failed authentication, role lookup, or reservation never starts paid work.
