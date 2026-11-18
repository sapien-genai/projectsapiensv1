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
